require("dotenv").config();

const http = require("http"); //Importe le module http de Node.js
const mysql = require("mysql2"); //Importe le module MySQL

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: process.env.DB_PASSWORD,
    database: "book_your_travel"
});

//Vérification connexion Node.js à MySQL
db.connect((err) => {
    if (err) {
        console.error("Erreur de connexion à MySQL :", err.message);
    } else {
        console.log("Connexion à MySQL réussie !");
    }
});

const hotels = [
    {
        name: "Best Ipsum Hotel",
        stars: 4
    },
    {
        name: "Grand Palace Hotel",
        stars: 5
    },
    {
        name: "City Center Hotel",
        stars: 3
    }
];

const server = http.createServer((req, res) => { //Crée un serveur HTTP avec une requête reçue et réponse envoyée
    // Vérifie si le navigateur demande les hôtels
    if (req.method === "GET" && req.url === "/api/hotels") {     

        // Indique que le serveur envoie du JSON
        res.setHeader("Content-Type", "application/json; charset=utf-8");

        // Envoyer un requète SQL à MySQL + récupérer tous les hotels
        db.query("SELECT * FROM hotels", (err, results) => {
            
        if (err) { // Récupérer une éventuelle erreur
            res.statusCode = 500;
            res.end(JSON.stringify({error: "Erreur du serveur"}));
        } else { 
            // Récupérer les données renvoyées par MySQL
            res.end(JSON.stringify(results));
        }
        });

    } else if (req.method === "GET" && req.url.startsWith("/api/hotels/")) {

        const parties = req.url.split("/");
        const hotelId = Number(parties[3]);
        const hotel = hotels[hotelId - 1];

        res.setHeader("Content-Type", "application/json; charset=utf-8");

        if (hotel) {
            res.end(JSON.stringify(hotel));
        } else {
            res.statusCode = 404;
            res.end(JSON.stringify({ error: "Hôtel introuvable" }));
        }

    } else {
        res.end("Bienvenue sur Book Your Travel");
    }
});

server.listen(3000); //Démarrer le serveur sur le port 3000

