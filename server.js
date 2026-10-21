
// ======================================================
// BOOK YOUR TRAVEL - SERVEUR BACK-END
// Node.js + MySQL
// ======================================================

// ================= IMPORTATION DES MODULES =================

// Module HTTP pour créer le serveur
const http = require("http");

// Importer les routes des hôtels
const hotelsRoutes = require("./routes/hotels");

// Importer les routes des chambres
const roomsRoutes = require("./routes/rooms");

//Importer les routes des réservations
const reservationsRoutes = require("./routes/reservations");


// ================= CRÉATION DU SERVEUR =================

const server = http.createServer((req, res) => {

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

    // ================= ROUTE PAR DÉFAUT =================

    res.end("Bienvenue sur Book Your Travel");

});


// ================= DÉMARRAGE DU SERVEUR =================

server.listen(3000, () => {
    console.log("Serveur démarré sur http://localhost:3000");
});
