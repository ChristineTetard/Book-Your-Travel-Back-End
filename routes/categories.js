// ======================================================
// BOOK YOUR TRAVEL - ROUTES DES CATÉGORIES
// ======================================================

// Importer la connexion à MySQL
const db = require("../db");

// Fonction qui gère les routes des catégories
function categoriesRoutes(req, res) {

    // ========== GET : RÉCUPÉRER TOUTES LES CATÉGORIES ==========

    if (req.method === "GET" && req.url === "/api/categories") {

        // Indiquer que la réponse sera au format JSON
        res.setHeader("Content-Type", "application/json; charset=utf-8");

        // Récupérer les catégories depuis MySQL
        db.query("SELECT * FROM categories", (err, results) => {

            // Vérifier si une erreur SQL s'est produite
            if (err) {
                res.statusCode = 500;
                return res.end(JSON.stringify({
                    error: "Erreur du serveur"
                }));
            }

            // Retourner les catégories au format JSON
            res.statusCode = 200;
            res.end(JSON.stringify(results));
        });

        // La route a été reconnue
        return true;
    }

    // Aucune route des catégories ne correspond
    return false;
}

// Exporter la fonction pour l'utiliser dans server.js
module.exports = categoriesRoutes;