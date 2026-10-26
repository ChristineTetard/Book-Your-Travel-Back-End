// ======================================================
// BOOK YOUR TRAVEL - MIDDLEWARE D'AUTHENTIFICATION
// ======================================================

// Ce fichier permet de vérifier les tokens JWT
// envoyés par les utilisateurs pour accéder
// aux routes protégées de notre API.

// ======================================================
// IMPORTATION DE NOTRE SYSTÈME JWT NATIF
// ======================================================

// Importer notre fonction de vérification des tokens JWT
// depuis le fichier utils/jwt.js
const { verifierTokenJWT } = require("../utils/jwt");

// ======================================================
// AUTHENTIFICATION : VÉRIFIER LE TOKEN JWT
// ======================================================

// Vérifier le token envoyé par l'utilisateur
function verifierToken(req, res) {

    // Récupérer l'en-tête Authorization de la requête HTTP
    const authorization = req.headers.authorization;

    // Vérifier si l'en-tête Authorization est présent
    if (!authorization) {

        // Indiquer que la réponse est au format JSON
        res.setHeader("Content-Type", "application/json; charset=utf-8");

        // Code 401 : l'utilisateur n'est pas authentifié
        res.statusCode = 401;

        // Envoyer un message d'erreur
        res.end(JSON.stringify({
            error: "Token manquant"
        }));

        // Arrêter la vérification
        return false;
    }

    // Vérifier que l'en-tête commence bien par "Bearer "
    if (!authorization.startsWith("Bearer ")) {

        // Indiquer que la réponse est au format JSON
        res.setHeader("Content-Type", "application/json; charset=utf-8");

        // Code 401 : le format du token est incorrect
        res.statusCode = 401;

        // Envoyer un message d'erreur
        res.end(JSON.stringify({
            error: "Format du token invalide"
        }));

        // Arrêter la vérification
        return false;
    }

    // ======================================================
    // RÉCUPÉRER LE TOKEN JWT
    // ======================================================

    // Supprimer "Bearer " pour récupérer uniquement le token
    const token = authorization.slice(7);

    // ======================================================
    // VÉRIFIER LA VALIDITÉ DU TOKEN JWT
    // ======================================================

    try {

        // Vérifier le token avec notre fonction JWT native
        // qui utilise le module crypto de Node.js
        const donnees = verifierTokenJWT(token);

        // Conserver les informations de l'utilisateur authentifié
        req.utilisateur = donnees;

        // Le token est valide
        return true;

    } catch (err) {

        // Indiquer que la réponse est au format JSON
        res.setHeader("Content-Type", "application/json; charset=utf-8");

        // Code 401 : le token est invalide ou expiré
        res.statusCode = 401;

        // Envoyer un message d'erreur
        res.end(JSON.stringify({
            error: "Token invalide ou expiré"
        }));

        // Arrêter la vérification
        return false;
    }

}

// ======================================================
// EXPORT DE LA FONCTION
// ======================================================

// Exporter la fonction pour pouvoir l'utiliser
// dans les routes de notre API
module.exports = verifierToken;