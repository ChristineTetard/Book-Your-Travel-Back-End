// ======================================================
// BOOK YOUR TRAVEL - SERVICE DES UTILISATEURS
// ======================================================

// Ce fichier contient les fonctions qui communiquent
// avec MySQL et qui gèrent les mots de passe avec bcrypt.


// Importer la connexion à la base de données MySQL
const db = require("../db");

// Importer bcrypt pour hacher et vérifier les mots de passe
const bcrypt = require("bcrypt");


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

// Transformer un mot de passe en une valeur hachée
// avant son enregistrement dans MySQL
async function hacherMotDePasse(password) {

    // bcrypt.hash() permet de hacher le mot de passe
    // Le nombre 12 correspond au facteur de coût du hachage
    // await attend que l'opération soit terminée
    const passwordHash = await bcrypt.hash(password, 12);

    // Retourner le mot de passe haché
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
        [
            utilisateur.first_name,
            utilisateur.last_name,
            utilisateur.email,
            passwordHash,
            "client"
        ],

        // Le rôle "client" est attribué automatiquement
        // Le mot de passe enregistré est déjà haché

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
// Cette fonction est utilisée pour l'inscription
// et pour la connexion
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

    // bcrypt.compare() vérifie si les mots de passe correspondent
    // await attend le résultat de la comparaison
    const correspond = await bcrypt.compare(password, passwordHash);

    // Retourner true si le mot de passe est correct
    // ou false s'il est incorrect
    return correspond;
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
    verifierMotDePasse
};