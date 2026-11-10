
// ======================================================
// BOOK YOUR TRAVEL - SERVEUR BACK-END
// Node.js + MySQL
// ======================================================

// ======================================================
// CHARGEMENT DES VARIABLES D'ENVIRONNEMENT
// ======================================================

// Charger les variables du fichier .env
// avec une fonctionnalité native de Node.js
// sans utiliser de bibliothèque externe
process.loadEnvFile();

// ================= IMPORTATION DES MODULES =================

// Module HTTP pour créer le serveur
const http = require("http");

// Importer les routes des hôtels
const hotelsRoutes = require("./routes/hotels");

// Importer les routes des chambres
const roomsRoutes = require("./routes/rooms");

//Importer les routes des réservations
const reservationsRoutes = require("./routes/reservations");

// Importer les routes des utilisateurs
const usersRoutes = require("./routes/users");

// Importer les routes des categories
const categoriesRoutes = require("./routes/categories");


// ================= CRÉATION DU SERVEUR =================

const server = http.createServer((req, res) => {

        // ================= CONFIGURATION CORS =================

    // Autoriser notre Front-End à communiquer avec l'API
    res.setHeader(
        "Access-Control-Allow-Origin",
        "http://127.0.0.1:5500"
    );

    // Autoriser les méthodes HTTP utilisées par notre API
    res.setHeader(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, DELETE, OPTIONS"
    );

    // Autoriser les en-têtes nécessaires aux requêtes
    res.setHeader(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization"
    );

    // Répondre aux requêtes de vérification CORS du navigateur
    if (req.method === "OPTIONS") {
        res.statusCode = 204;
        res.end();
        return;
    }

    // Vérifier si la requête concerne les hôtels
    if (hotelsRoutes(req, res)) {
        return;
    }

    // Vérifier si la requête concerne les chambres
    if (roomsRoutes(req, res)) {
        return;
    }

    // Vérifier si la requête concerne les réservations
    if (reservationsRoutes(req, res)) {
        return;
    }

    // Gérer les routes des utilisateurs
    if (usersRoutes(req, res)) return;

    // Vérifier si la requête concerne les catégories
    if (categoriesRoutes(req, res)) return;

    // ================= ROUTE PAR DÉFAUT =================

    res.end("Bienvenue sur Book Your Travel");

});


// ================= DÉMARRAGE DU SERVEUR =================

server.listen(3000, () => {
    console.log("Serveur démarré sur http://localhost:3000");
});
