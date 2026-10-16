
// ================= CONNEXION À MYSQL =================

// Charger les variables du fichier .env
require("dotenv").config();

// Importer mysql2
const mysql = require("mysql2");

// Préparer la connexion à MySQL
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: process.env.DB_PASSWORD,
    database: "book_your_travel"
});

// Vérifier que la connexion fonctionne
db.connect((err) => {
    if (err) {
        console.error("Erreur de connexion à MySQL :", err.message);
    } else {
        console.log("Connexion à MySQL réussie !");
    }
});

// Permettre aux autres fichiers d'utiliser db
module.exports = db;
