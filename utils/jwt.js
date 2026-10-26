// ======================================================
// BOOK YOUR TRAVEL - GESTION DES TOKENS JWT
// ======================================================

// Ce fichier contiendra les fonctions permettant
// de créer et de vérifier les tokens JWT
// avec les modules natifs de Node.js.

// Nous utiliserons le module crypto pour sécuriser
// les signatures des tokens sans jsonwebtoken.

// ======================================================
// IMPORTATION DU MODULE CRYPTO
// ======================================================

// Importer le module crypto intégré à Node.js
// Il permettra de créer et de vérifier
// les signatures de nos tokens JWT
const crypto = require("node:crypto");

// ======================================================
// JWT : ENCODER LES DONNÉES EN BASE64URL
// ======================================================

// Transformer un objet JavaScript en texte encodé
// au format Base64URL utilisé dans les tokens JWT
function encoderBase64Url(donnees) {

    // Transformer l'objet JavaScript en texte JSON
    const texteJson = JSON.stringify(donnees);

    // Convertir le texte JSON en données binaires
    const buffer = Buffer.from(texteJson, "utf8");

    // Encoder ces données au format Base64URL
    const resultat = buffer.toString("base64url");

    // Retourner le texte encodé
    return resultat;
}

// ======================================================
// JWT : CRÉER LA SIGNATURE DU TOKEN
// ======================================================

// Créer une signature sécurisée à partir
// de l'en-tête et des données du token JWT
function creerSignature(contenu) {

    // Récupérer la clé secrète depuis le fichier .env
    const cleSecrete = process.env.JWT_SECRET;

    // Vérifier qu'une clé secrète est bien configurée
    // Sans cette clé, nous ne pouvons pas signer un token
    if (!cleSecrete) {
        throw new Error("Clé secrète JWT manquante");
    }

    // Créer une signature avec l'algorithme HMAC-SHA256
    // et notre clé secrète
    const signature = crypto
        .createHmac("sha256", cleSecrete)
        .update(contenu)
        .digest("base64url");

    // Retourner la signature générée
    return signature;
}

// ======================================================
// JWT : GÉNÉRER UN TOKEN
// ======================================================

// Créer un token JWT pour un utilisateur connecté
function genererToken(utilisateur) {

    // Préparer l'en-tête du token JWT
    // HS256 indique l'algorithme utilisé pour la signature
    // JWT indique le type de token
    const entete = {
        alg: "HS256",
        typ: "JWT"
    };

    // Récupérer la date actuelle en secondes
    // Les dates JWT sont exprimées en secondes
    const maintenant = Math.floor(Date.now() / 1000);

    // Préparer les informations contenues dans le token
    const donnees = {
        id: utilisateur.id,
        role: utilisateur.role,

        // Date de création du token
        iat: maintenant,

        // Date d'expiration : 2 heures après sa création
        exp: maintenant + (2 * 60 * 60)
    };

    // Encoder l'en-tête au format Base64URL
    const enteteEncode = encoderBase64Url(entete);

    // Encoder les informations de l'utilisateur
    const donneesEncodees = encoderBase64Url(donnees);

    // Réunir les deux premières parties du token
    const contenu = `${enteteEncode}.${donneesEncodees}`;

    // Créer la signature avec notre clé secrète
    const signature = creerSignature(contenu);

    // Assembler les trois parties du token JWT
    const token = `${contenu}.${signature}`;

    // Retourner le token créé
    return token;
}

// ======================================================
// JWT : VÉRIFIER LE FORMAT DU TOKEN
// ======================================================

// Vérifier que le token possède bien les trois parties
// nécessaires au format JWT
function verifierFormatToken(token) {

    // Vérifier que le token est bien une chaîne de caractères
    if (typeof token !== "string") {
        return false;
    }

    // Séparer les différentes parties du token
    // grâce aux points qui les séparent
    const parties = token.split(".");

    // Un JWT doit obligatoirement contenir trois parties :
    // 1. L'en-tête
    // 2. Les données
    // 3. La signature
    if (parties.length !== 3) {
        return false;
    }

    // Vérifier que les trois parties ne sont pas vides
    if (parties.some(partie => partie.length === 0)) {
        return false;
    }

    // Vérifier que chaque partie contient uniquement
    // des caractères autorisés par le format Base64URL
    if (!parties.every(partie => /^[A-Za-z0-9_-]+$/.test(partie))) {
        return false;
    }

    // Le token respecte la structure attendue
    return true;
}

// ======================================================
// JWT : VÉRIFIER L'EN-TÊTE DU TOKEN
// ======================================================

// Vérifier que l'en-tête du JWT utilise bien
// l'algorithme HS256 attendu par notre application
function verifierEnteteToken(enteteEncode) {

    try {

        // Décoder la première partie du JWT
        // pour retrouver son contenu JSON
        const texteJson = Buffer
            .from(enteteEncode, "base64url")
            .toString("utf8");

        // Transformer le texte JSON en objet JavaScript
        const entete = JSON.parse(texteJson);

        // Vérifier que l'en-tête est bien un objet
        // et non une valeur vide ou un tableau
        if (
            !entete ||
            typeof entete !== "object" ||
            Array.isArray(entete)
        ) {
            return false;
        }

        // Accepter uniquement l'algorithme HS256
        // et le type JWT
        if (
            entete.alg !== "HS256" ||
            entete.typ !== "JWT"
        ) {
            return false;
        }

        // L'en-tête contient les valeurs attendues
        return true;

    } catch (err) {

        // Si le décodage ou le JSON est incorrect,
        // considérer l'en-tête comme invalide
        return false;
    }
}

// ======================================================
// JWT : VÉRIFIER LA SIGNATURE DU TOKEN
// ======================================================

// Vérifier que la signature du JWT est authentique
function verifierSignatureToken(contenu, signatureRecue) {

    // Recalculer la signature à partir du contenu
    // du token et de notre clé secrète
    const signatureAttendue = creerSignature(contenu);

    // Convertir les deux signatures en données binaires
    // pour pouvoir les comparer de manière sécurisée
    const bufferAttendu = Buffer.from(
        signatureAttendue,
        "base64url"
    );

    const bufferRecu = Buffer.from(
        signatureRecue,
        "base64url"
    );

    // ======================================================
    // VÉRIFIER L'ENCODAGE DE LA SIGNATURE
    // ======================================================

    // Réencoder la signature reçue au format Base64URL
    // pour vérifier que son encodage est bien conforme
    const signatureReencodee = bufferRecu.toString("base64url");

    // Refuser la signature si son encodage est incorrect
    if (signatureReencodee !== signatureRecue) {
        return false;
    }


    // Vérifier que les signatures ont la même longueur
    // Sinon, la comparaison sécurisée est impossible
    if (bufferAttendu.length !== bufferRecu.length) {
        return false;
    }

    // Comparer les signatures de manière sécurisée
    // Cette méthode évite de révéler des informations
    // à travers le temps nécessaire à la comparaison
    const signaturesIdentiques = crypto.timingSafeEqual(
        bufferAttendu,
        bufferRecu
    );

    // Retourner true si les signatures correspondent
    // et false dans le cas contraire
    return signaturesIdentiques;
}

// ======================================================
// JWT : VÉRIFIER LA DATE D'EXPIRATION
// ======================================================

// Vérifier que le token n'a pas expiré
function verifierExpirationToken(donnees) {

    // Récupérer la date actuelle en secondes
    const maintenant = Math.floor(Date.now() / 1000);

    // Vérifier que la date d'expiration existe
    // et qu'elle est bien un nombre entier
    if (!Number.isInteger(donnees.exp)) {
        return false;
    }

    // Vérifier que la date de création existe
    // et qu'elle est bien un nombre entier
    if (!Number.isInteger(donnees.iat)) {
        return false;
    }

    // Refuser un token créé dans le futur
    if (donnees.iat > maintenant) {
        return false;
    }

    // Refuser un token dont la date d'expiration
    // est antérieure ou égale à la date actuelle
    if (donnees.exp <= maintenant) {
        return false;
    }

    // ======================================================
    // VÉRIFIER LA COHÉRENCE DES DATES
    // ======================================================

    // La date d'expiration doit obligatoirement
    // être postérieure à la date de création du token
    if (donnees.exp <= donnees.iat) {
        return false;
    }

    // Vérifier que le token ne dépasse pas
    // notre durée de validité maximale de 2 heures
    if (donnees.exp - donnees.iat > 2 * 60 * 60) {
        return false;
    }

    // Toutes les vérifications sont réussies
    return true;
}

// ======================================================
// JWT : VÉRIFIER UN TOKEN COMPLET
// ======================================================

// Vérifier un token JWT reçu par notre serveur
function verifierTokenJWT(token) {

    // Vérifier que le token possède le bon format
    if (!verifierFormatToken(token)) {
        throw new Error("Format du token invalide");
    }

    // Séparer les trois parties du JWT
    const [enteteEncode, donneesEncodees, signatureRecue] =
        token.split(".");

    // Vérifier que l'en-tête utilise bien HS256
    if (!verifierEnteteToken(enteteEncode)) {
        throw new Error("En-tête du token invalide");
    }

    // Reconstituer le contenu qui a été signé
    const contenu = `${enteteEncode}.${donneesEncodees}`;

    // Vérifier que la signature est authentique
    if (!verifierSignatureToken(contenu, signatureRecue)) {
        throw new Error("Signature du token invalide");
    }

    // Décoder les informations du token
    // uniquement après avoir vérifié sa signature
    let donnees;

    try {
        const texteJson = Buffer
            .from(donneesEncodees, "base64url")
            .toString("utf8");

        donnees = JSON.parse(texteJson);

    } catch (err) {
        throw new Error("Données du token invalides");
    }

    // Vérifier que les données forment bien un objet
    if (
        !donnees ||
        typeof donnees !== "object" ||
        Array.isArray(donnees)
    ) {
        throw new Error("Données du token invalides");
    }

    // Vérifier la présence des informations utilisateur
    if (
        !Number.isInteger(donnees.id) ||
        donnees.id <= 0 ||
        typeof donnees.role !== "string" ||
        donnees.role.length === 0
    ) {
        throw new Error("Utilisateur du token invalide");
    }

    // Vérifier que le token n'a pas expiré
    if (!verifierExpirationToken(donnees)) {
        throw new Error("Token expiré ou dates invalides");
    }

    // Toutes les vérifications ont réussi :
    // retourner les informations de l'utilisateur
    return donnees;
}

// ======================================================
// EXPORTATION DES FONCTIONS JWT
// ======================================================

// Rendre nos deux fonctions principales accessibles
// depuis les autres fichiers de notre application
module.exports = {
    genererToken,
    verifierTokenJWT
};