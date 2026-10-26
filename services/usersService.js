// ======================================================
// BOOK YOUR TRAVEL - SERVICE DES UTILISATEURS
// ======================================================

// Ce fichier contient les fonctions qui communiquent
// avec MySQL et qui sécurisent les mots de passe
// avec scrypt, un algorithme disponible dans Node.js.


// Importer la connexion à la base de données MySQL
const db = require("../db");

// Importer jsonwebtoken pour créer et vérifier les tokens JWT
const jwt = require("jsonwebtoken");

// Importer le module crypto natif de Node.js
// pour sécuriser les mots de passe avec scrypt
// et générer des tokens temporaires sécurisés
const crypto = require("crypto");


// ======================================================
// GET : RÉCUPÉRER TOUS LES UTILISATEURS
// ======================================================

// Récupérer la liste des utilisateurs dans MySQL
function recupererUtilisateurs(callback) {

    // Sélectionner les informations des utilisateurs
    // sans récupérer leurs mots de passe
    db.query(
        "SELECT id, first_name, last_name, email, role FROM users",

        // Le callback transmet les résultats ou une erreur
        // à la fonction qui a appelé ce service
        (err, results) => {
            callback(err, results);
        }
    );
}


// ======================================================
// GET : RÉCUPÉRER UN UTILISATEUR PAR SON ID
// ======================================================

// Rechercher un utilisateur grâce à son identifiant
function recupererUtilisateurParId(userId, callback) {

    // Le point d'interrogation est remplacé par userId
    // Cela permet d'utiliser une requête SQL paramétrée
    db.query(
        "SELECT id, first_name, last_name, email, role FROM users WHERE id = ?",
        [userId],

        // Transmettre le résultat ou une erreur à la route
        (err, results) => {
            callback(err, results);
        }
    );
}


// ======================================================
// SÉCURISATION : HACHER UN MOT DE PASSE
// ======================================================

// Transformer la fonction scrypt de Node.js
// en une fonction utilisable avec async et await
const { promisify } = require("node:util");

// Préparer une version de scrypt qui retourne une Promise
const scryptAsync = promisify(crypto.scrypt);

// Transformer un mot de passe en une valeur sécurisée
// avant son enregistrement dans MySQL
async function hacherMotDePasse(password) {

    // Générer un sel aléatoire de 16 octets
    // Le sel permet d'obtenir des résultats différents
    // même lorsque deux utilisateurs ont le même mot de passe
    const salt = crypto.randomBytes(16).toString("hex");

    // Hacher le mot de passe avec scrypt
    // 64 correspond à la longueur du résultat en octets
    // await attend que le calcul soit terminé
    const hash = await scryptAsync(password, salt, 64);

    // Convertir le résultat en texte hexadécimal
    const hashHex = hash.toString("hex");

    // Conserver le sel avec le hash pour permettre
    // la vérification du mot de passe lors de la connexion
    const passwordHash = `scrypt:${salt}:${hashHex}`;

    // Retourner la valeur à enregistrer dans MySQL
    return passwordHash;
}


// ======================================================
// POST : CRÉER UN NOUVEL UTILISATEUR
// ======================================================

// Enregistrer un nouvel utilisateur dans MySQL
function creerUtilisateur(utilisateur, passwordHash, callback) {

    // Ajouter les informations dans la table users
    // Les points d'interrogation seront remplacés
    // par les valeurs du tableau ci-dessous
    db.query(
        `INSERT INTO users
        (first_name, last_name, email, password, role)
        VALUES (?, ?, ?, ?, ?)`,

        // Informations à enregistrer dans MySQL
        // Le rôle "client" est attribué automatiquement
        // Le mot de passe a déjà été haché avec scrypt
        // avant son enregistrement dans MySQL
        [
            utilisateur.first_name,
            utilisateur.last_name,
            utilisateur.email,
            passwordHash,
            "client"
        ],

        // Transmettre le résultat de l'insertion à la route
        (err, result) => {
            callback(err, result);
        }
    );
}


// ======================================================
// RECHERCHER UN UTILISATEUR PAR SON E-MAIL
// ======================================================

// Rechercher un utilisateur grâce à son adresse e-mail
// Cette fonction est utilisée pour l'inscription,
// la connexion et la récupération du mot de passe
function rechercherUtilisateurParEmail(email, callback) {

    // Récupérer les informations de l'utilisateur
    // y compris son mot de passe haché pour la connexion
    const sql = "SELECT id, first_name, last_name, email, password, role FROM users WHERE email = ?";

    // Exécuter la requête SQL avec l'adresse e-mail
    db.query(sql, [email], (err, results) => {

        // Transmettre le résultat ou une erreur à la route
        callback(err, results);
    });
}


// ======================================================
// SÉCURISATION : VÉRIFIER UN MOT DE PASSE
// ======================================================

// Comparer le mot de passe saisi lors de la connexion
// avec le mot de passe haché enregistré dans MySQL
async function verifierMotDePasse(password, passwordHash) {

    // Vérifier que le hash enregistré est bien une chaîne
    // au format attendu pour notre algorithme scrypt
    if (typeof passwordHash !== "string") {
        return false;
    }

    // Séparer les trois parties du hash enregistré
    const parties = passwordHash.split(":");

    // Vérifier que le format contient bien trois parties
    // et que l'algorithme utilisé est scrypt
    if (
        parties.length !== 3 ||
        parties[0] !== "scrypt"
    ) {
        return false;
    }

    // Récupérer le sel et le hash enregistrés
    const salt = parties[1];
    const hashHex = parties[2];

    // Vérifier le format et la longueur des valeurs
    if (
        !/^[0-9a-f]{32}$/.test(salt) ||
        !/^[0-9a-f]{128}$/.test(hashHex)
    ) {
        return false;
    }

    // Recalculer le hash avec le mot de passe saisi
    // et le sel récupéré dans MySQL
    const hashCalcule = await scryptAsync(password, salt, 64);

    // Transformer le hash enregistré en Buffer
    // pour pouvoir comparer les deux résultats
    const hashEnregistre = Buffer.from(hashHex, "hex");

    // Comparer les deux hashes de manière sécurisée
    const correspond = crypto.timingSafeEqual(
        hashCalcule,
        hashEnregistre
    );

    // Retourner true si le mot de passe est correct
    // ou false s'il est incorrect
    return correspond;
}

// ======================================================
// AUTHENTIFICATION : GÉNÉRER UN TOKEN JWT
// ======================================================

// Créer un token JWT après une connexion réussie
function genererToken(utilisateur) {

    // Préparer les informations à inclure dans le token
    const donnees = {
        id: utilisateur.id,
        role: utilisateur.role
    };

    // Signer le token avec la clé secrète du fichier .env
    // Le token expirera automatiquement après 2 heures
    const token = jwt.sign(donnees, process.env.JWT_SECRET, {
        expiresIn: "2h"
    });

    // Retourner le token généré
    return token;
}

// ======================================================
// RÉCUPÉRATION DE MOT DE PASSE : GÉNÉRER UN TOKEN
// ======================================================

// Générer un token temporaire pour permettre
// à un utilisateur de réinitialiser son mot de passe
function genererTokenReinitialisation() {

    // Générer 32 octets aléatoires avec crypto
    // toString("hex") transforme ces octets en texte
    const token = crypto.randomBytes(32).toString("hex");

    // Retourner le token généré
    return token;
}

// ======================================================
// RÉCUPÉRATION DE MOT DE PASSE : HACHER LE TOKEN
// ======================================================

// Créer une empreinte du token de réinitialisation
// pour ne pas enregistrer le token original dans MySQL
function hacherTokenReinitialisation(token) {

    // Créer une empreinte SHA-256 du token
    const tokenHash = crypto
        .createHash("sha256") // Choisir l'algorithme de hachage
        .update(token) // Indiquer le token à hacher
        .digest("hex"); // Transformer le résultat en texte hexadécimal

    // Retourner l'empreinte générée
    return tokenHash;
}

// ======================================================
// RÉCUPÉRATION DE MOT DE PASSE : ENREGISTRER LE TOKEN
// ======================================================

// Enregistrer l'empreinte du token et sa date d'expiration
// dans le compte de l'utilisateur concerné
function enregistrerTokenReinitialisation(userId, tokenHash, dateExpiration, callback) {

    // Préparer la requête SQL pour enregistrer les informations
    const sql = `
        UPDATE users
        SET reset_token_hash = ?, reset_token_expires_at = ?
        WHERE id = ?
    `;

    // Préparer les valeurs de la requête SQL
    const valeurs = [
        tokenHash,
        dateExpiration,
        userId
    ];

    // Exécuter la requête SQL dans MySQL
    db.query(sql, valeurs, (err, result) => {

        // Transmettre le résultat ou une erreur à la route
        callback(err, result);
    });
}

// ======================================================
// RÉCUPÉRATION DE MOT DE PASSE : VÉRIFIER LE TOKEN
// ======================================================

// Rechercher un utilisateur grâce à l'empreinte
// de son token de réinitialisation
function rechercherUtilisateurParToken(tokenHash, callback) {

    // Préparer la requête SQL
    // Le token doit exister et ne pas être expiré
    const sql = `
        SELECT id
        FROM users
        WHERE reset_token_hash = ?
        AND reset_token_expires_at > NOW()
    `;

    // Exécuter la requête SQL
    db.query(sql, [tokenHash], (err, results) => {

        // Transmettre l'erreur si la requête échoue
        if (err) {
            return callback(err, null);
        }

        // Récupérer l'utilisateur trouvé
        // ou null si aucun token valide n'existe
        const utilisateur = results[0] || null;

        // Retourner le résultat à la route
        callback(null, utilisateur);
    });
}

// ======================================================
// RÉCUPÉRATION DE MOT DE PASSE : MODIFIER LE MOT DE PASSE
// ======================================================

// Enregistrer le nouveau mot de passe de l'utilisateur
// et supprimer le token de réinitialisation après utilisation
function reinitialiserMotDePasse(userId, tokenHash, nouveauMotDePasseHash, callback) {

    // Préparer la requête SQL
    const sql = `
        UPDATE users
        SET password = ?,
            reset_token_hash = NULL,
            reset_token_expires_at = NULL
        WHERE id = ?
        AND reset_token_hash = ?
        AND reset_token_expires_at > NOW()
    `;

    // Préparer les valeurs de la requête SQL
    const valeurs = [
        nouveauMotDePasseHash,
        userId,
        tokenHash
    ];

    // Exécuter la requête SQL
    db.query(sql, valeurs, (err, result) => {

        // Transmettre le résultat ou une erreur à la route
        callback(err, result);
    });
}


// ======================================================
// PUT : MODIFIER LE PROFIL D'UN UTILISATEUR
// ======================================================

// Modifier le prénom, le nom et l'adresse e-mail
// d'un utilisateur existant dans MySQL
function modifierUtilisateur(userId, utilisateur, callback) {

    // Préparer la requête SQL pour modifier l'utilisateur
    // WHERE permet de cibler uniquement l'identifiant demandé
    const sql = `
        UPDATE users
        SET first_name = ?, last_name = ?, email = ?
        WHERE id = ?
    `;

    // Préparer les valeurs qui remplaceront les points
    // d'interrogation dans la requête SQL
    const valeurs = [
        utilisateur.first_name,
        utilisateur.last_name,
        utilisateur.email,
        userId
    ];

    // Exécuter la requête SQL avec les valeurs fournies
    db.query(sql, valeurs, (err, result) => {

        // Transmettre le résultat ou une erreur à la route
        callback(err, result);
    });
}



// ======================================================
// DELETE : SUPPRIMER UN UTILISATEUR
// ======================================================

// Supprimer un utilisateur de MySQL grâce à son identifiant
function supprimerUtilisateur(userId, callback) {

    // Préparer la requête SQL de suppression
    // WHERE permet de supprimer uniquement l'utilisateur demandé
    const sql = "DELETE FROM users WHERE id = ?";

    // Exécuter la requête SQL avec l'identifiant fourni
    db.query(sql, [userId], (err, result) => {

        // Transmettre le résultat ou une erreur à la route
        callback(err, result);
    });
}



// ======================================================
// EXPORT DES FONCTIONS
// ======================================================

// Exporter les fonctions pour pouvoir les utiliser
// dans le fichier routes/users.js
module.exports = {
    recupererUtilisateurs,
    recupererUtilisateurParId,
    hacherMotDePasse,
    creerUtilisateur,
    rechercherUtilisateurParEmail,
    verifierMotDePasse,
    genererToken,
    genererTokenReinitialisation,
    hacherTokenReinitialisation,
    enregistrerTokenReinitialisation,
    rechercherUtilisateurParToken,
    reinitialiserMotDePasse,
    modifierUtilisateur,
    supprimerUtilisateur,
};