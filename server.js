
// ======================================================
// BOOK YOUR TRAVEL - SERVEUR BACK-END
// Node.js + MySQL
// ======================================================


// ================= IMPORTATION DES MODULES =================

// Charge les variables du fichier .env
// Cela permet notamment de récupérer le mot de passe MySQL
require("dotenv").config();

// Importe le module HTTP de Node.js pour créer le serveur
const http = require("http");

// Importe mysql2 pour communiquer avec la base de données MySQL
const mysql = require("mysql2");


// ================= CONNEXION À MYSQL =================

// Prépare les informations nécessaires pour se connecter à MySQL
const db = mysql.createConnection({
    host: "localhost",                 // Adresse du serveur MySQL
    user: "root",                       // Utilisateur MySQL
    password: process.env.DB_PASSWORD, // Mot de passe récupéré dans .env
    database: "book_your_travel"       // Nom de la base de données
});

// Vérifie si la connexion à MySQL fonctionne
db.connect((err) => {

    // Si une erreur se produit, elle est affichée dans le terminal
    if (err) {
        console.error("Erreur de connexion à MySQL :", err.message);

    } else {
        // Si la connexion fonctionne, un message de réussite s'affiche
        console.log("Connexion à MySQL réussie !");
    }
});


// ================= CRÉATION DU SERVEUR HTTP =================

// Crée un serveur qui reçoit les requêtes du navigateur
// req = requête reçue
// res = réponse envoyée par le serveur
const server = http.createServer((req, res) => {


    // ======================================================
    // GET - RÉCUPÉRER TOUS LES HÔTELS
    // Adresse : /api/hotels
    // ======================================================

    // Vérifie que la méthode est GET et que l'adresse correspond
    if (req.method === "GET" && req.url === "/api/hotels") {

        // Indique que la réponse sera au format JSON
        res.setHeader("Content-Type", "application/json; charset=utf-8");

        // Envoie une requête SQL pour récupérer tous les hôtels
        db.query("SELECT * FROM hotels", (err, results) => {

            // Si MySQL rencontre une erreur
            if (err) {

                // Code HTTP 500 = erreur du serveur
                res.statusCode = 500;

                // Envoie un message d'erreur au navigateur
                res.end(JSON.stringify({
                    error: "Erreur du serveur"
                }));

            } else {

                // Transforme les résultats MySQL en JSON
                // Puis les envoie au navigateur
                res.end(JSON.stringify(results));
            }
        });


    // ======================================================
    // GET - RÉCUPÉRER UN SEUL HÔTEL
    // Exemple : /api/hotels/1
    // ======================================================

    } else if (req.method === "GET" && req.url.startsWith("/api/hotels/")) {

        // Découpe l'adresse en plusieurs parties
        // Exemple : "/api/hotels/1"
        // Résultat : ["", "api", "hotels", "1"]
        const parties = req.url.split("/");

        // Récupère l'identifiant de l'hôtel
        // Number() transforme "1" en nombre 1
        const hotelId = Number(parties[3]);

        // Indique que la réponse sera au format JSON
        res.setHeader("Content-Type", "application/json; charset=utf-8");

        // Recherche l'hôtel correspondant à l'identifiant
        // Le ? est remplacé par la valeur de hotelId
        db.query(
            "SELECT * FROM hotels WHERE id = ?",
            [hotelId],
            (err, results) => {

                // Si MySQL rencontre une erreur
                if (err) {
                    res.statusCode = 500;

                    res.end(JSON.stringify({
                        error: "Erreur du serveur"
                    }));

                // Si aucun hôtel n'a été trouvé
                } else if (results.length === 0) {

                    // Code HTTP 404 = ressource introuvable
                    res.statusCode = 404;

                    res.end(JSON.stringify({
                        error: "Hôtel introuvable"
                    }));

                } else {

                    // results[0] récupère le premier hôtel trouvé
                    // On envoie cet hôtel au navigateur
                    res.end(JSON.stringify(results[0]));
                }
            }
        );


    // ======================================================
    // GET - RÉCUPÉRER TOUTES LES CHAMBRES
    // Adresse : /api/rooms
    // ======================================================

    } else if (req.method === "GET" && req.url === "/api/rooms") {

        // Indique que la réponse sera au format JSON
        res.setHeader("Content-Type", "application/json; charset=utf-8");

        // Récupère toutes les chambres de la table rooms
        db.query("SELECT * FROM rooms", (err, results) => {

            // Si MySQL rencontre une erreur
            if (err) {
                res.statusCode = 500;

                res.end(JSON.stringify({
                    error: "Erreur du serveur"
                }));

            } else {

                // Envoie toutes les chambres au format JSON
                res.end(JSON.stringify(results));
            }
        });


    // ======================================================
    // GET - RÉCUPÉRER UNE SEULE CHAMBRE
    // Exemple : /api/rooms/1
    // ======================================================

    } else if (req.method === "GET" && req.url.startsWith("/api/rooms/")) {

        // Découpe l'adresse pour récupérer l'identifiant
        const separation = req.url.split("/");

        // Transforme l'identifiant en nombre
        const roomId = Number(separation[3]);

        // Indique que la réponse sera au format JSON
        res.setHeader("Content-Type", "application/json; charset=utf-8");

        // Recherche la chambre correspondant à roomId
        db.query(
            "SELECT * FROM rooms WHERE id = ?",
            [roomId],
            (err, results) => {

                // Si MySQL rencontre une erreur
                if (err) {
                    res.statusCode = 500;

                    res.end(JSON.stringify({
                        error: "Erreur du serveur"
                    }));

                // Si aucune chambre ne correspond à l'identifiant
                } else if (results.length === 0) {
                    res.statusCode = 404;

                    res.end(JSON.stringify({
                        error: "Chambre introuvable"
                    }));

                } else {

                    // Envoie la première chambre trouvée
                    res.end(JSON.stringify(results[0]));
                }
            }
        );


    // ======================================================
    // POST - AJOUTER UN NOUVEL HÔTEL
    // Adresse : /api/hotels
    // ======================================================

    } else if (req.method === "POST" && req.url === "/api/hotels") {

        // Indique que la réponse sera au format JSON
        res.setHeader("Content-Type", "application/json; charset=utf-8");

        // Variable qui contiendra les données envoyées au serveur
        let body = "";

        // Récupère les données reçues morceau par morceau
        req.on("data", (chunk) => {

            // Ajoute chaque morceau à la variable body
            body += chunk;
        });

        // Cette partie s'exécute lorsque toutes les données sont reçues
        req.on("end", () => {

            // try permet d'essayer un code qui pourrait provoquer une erreur
            try {

                // Transforme le texte JSON reçu en objet JavaScript
                const hotel = JSON.parse(body);

                // Affiche le nom de l'hôtel dans le terminal
                console.log(hotel.name);

                // Vérifie que les informations obligatoires sont présentes
                // ! signifie NON
                // || signifie OU
                if (!hotel.provider_id || !hotel.name || !hotel.address || !hotel.city || !hotel.country) {

                    // Code HTTP 400 = données envoyées incorrectes
                    res.writeHead(400, {
                        "Content-Type": "application/json"
                    });

                    // Envoie le message d'erreur et arrête le traitement
                    return res.end(JSON.stringify({
                        error: "Informations obligatoires manquantes"
                    }));
                }

                // Enregistre le nouvel hôtel dans MySQL
                db.query(

                    // INSERT INTO permet d'ajouter une ligne dans la table
                    // Chaque ? correspond à une valeur fournie ensuite
                    "INSERT INTO hotels (provider_id, name, address, city, country) VALUES (?, ?, ?, ?, ?)",

                    // Valeurs à enregistrer, dans le même ordre que les ?
                    [
                        hotel.provider_id,
                        hotel.name,
                        hotel.address,
                        hotel.city,
                        hotel.country
                    ],

                    // Fonction appelée lorsque MySQL a terminé la requête
                    (err, result) => {

                        // Si MySQL rencontre une erreur
                        if (err) {
                            res.statusCode = 500;

                            return res.end(JSON.stringify({
                                error: "Erreur lors de l'ajout de l'hôtel"
                            }));
                        }

                        // Code HTTP 201 = nouvelle ressource créée
                        res.statusCode = 201;

                        // Confirme l'ajout de l'hôtel
                        res.end(JSON.stringify({
                            message: "Hôtel ajouté avec succès",

                            // Récupère l'identifiant créé automatiquement par MySQL
                            id: result.insertId
                        }));
                    }
                );

            // Si JSON.parse() rencontre une erreur
            } catch (err) {

                // Code HTTP 400 = JSON invalide
                res.writeHead(400, {
                    "Content-Type": "application/json"
                });

                res.end(JSON.stringify({
                    error: "JSON invalide"
                }));
            }
        });


    // ======================================================
    // DELETE - SUPPRIMER UN HÔTEL
    // Exemple : /api/hotels/2
    // ======================================================

    } else if (req.method === "DELETE" && req.url.startsWith("/api/hotels/")) {

        // Découpe l'adresse pour récupérer l'identifiant
        const parties = req.url.split("/");

        // Transforme l'identifiant en nombre
        const hotelId = Number(parties[3]);

        // Vérifie que l'identifiant est un entier supérieur à zéro
        // Number.isInteger() vérifie si la valeur est un nombre entier
        if (!Number.isInteger(hotelId) || hotelId <= 0) {

            // Code HTTP 400 = identifiant invalide
            res.writeHead(400, {
                "Content-Type": "application/json"
            });

            return res.end(JSON.stringify({
                error: "Identifiant invalide"
            }));
        }

        // Supprime uniquement l'hôtel correspondant à hotelId
        // WHERE est important pour ne pas supprimer tous les hôtels
        db.query(
            "DELETE FROM hotels WHERE id = ?",
            [hotelId],
            (err, result) => {

                // Si MySQL rencontre une erreur
                if (err) {

                    // Code HTTP 500 = erreur du serveur
                    res.writeHead(500, {
                        "Content-Type": "application/json"
                    });

                    return res.end(JSON.stringify({
                        error: "Erreur lors de la suppression"
                    }));
                }

                // affectedRows indique combien de lignes ont été supprimées
                // Si la valeur est 0, aucun hôtel ne correspond à l'identifiant
                if (result.affectedRows === 0) {

                    // Code HTTP 404 = hôtel introuvable
                    res.writeHead(404, {
                        "Content-Type": "application/json"
                    });

                    return res.end(JSON.stringify({
                        error: "Hôtel introuvable"
                    }));
                }

                // Code HTTP 200 = suppression réussie
                res.writeHead(200, {
                    "Content-Type": "application/json"
                });

                // Confirme que l'hôtel a été supprimé
                res.end(JSON.stringify({
                    message: "Suppression effectuée"
                }));
            }
        );


    // ======================================================
    // PUT - MODIFIER LE NOM D'UN HÔTEL
    // Exemple : /api/hotels/1
    // ======================================================

    } else if (req.method === "PUT" && req.url.startsWith("/api/hotels/")) {

        // Découpe l'adresse pour récupérer l'identifiant
        const parties = req.url.split("/");

        // Transforme l'identifiant en nombre
        const hotelId = Number(parties[3]);

        // Vérifie que l'identifiant est un entier supérieur à zéro
        if (!Number.isInteger(hotelId) || hotelId <= 0) {

            // Code HTTP 400 = identifiant invalide
            res.writeHead(400, {
                "Content-Type": "application/json"
            });

            return res.end(JSON.stringify({
                error: "Identifiant invalide"
            }));
        }

        // Variable qui contiendra les nouvelles informations reçues
        let body = "";

        // Récupère les données envoyées morceau par morceau
        req.on("data", (chunk) => {
            body += chunk;
        });

        // S'exécute lorsque toutes les données ont été reçues
        req.on("end", () => {

            try {

                // Transforme le JSON reçu en objet JavaScript
                const hotel = JSON.parse(body);

                // Vérifie que le nouveau nom est valide
                if (!hotel || typeof hotel.name !== "string" || !hotel.name.trim()) {

                    // Code HTTP 400 = nom manquant ou invalide
                    res.writeHead(400, {
                        "Content-Type": "application/json"
                    });

                    return res.end(JSON.stringify({
                        error: "Nom de l'hôtel obligatoire"
                    }));
                }

                // Affiche le nouveau nom dans le terminal
                console.log(hotel.name);

                // Modifie le nom de l'hôtel dans MySQL
                db.query(

                    // UPDATE modifie une ligne existante
                    // SET indique la colonne à modifier
                    // WHERE indique quel hôtel modifier
                    "UPDATE hotels SET name = ? WHERE id = ?",

                    // Premier ? = nouveau nom
                    // Deuxième ? = identifiant de l'hôtel
                    [hotel.name, hotelId],

                    (err, result) => {

                        // Si MySQL rencontre une erreur
                        if (err) {

                            // Code HTTP 500 = erreur du serveur
                            res.writeHead(500, {
                                "Content-Type": "application/json"
                            });

                            return res.end(JSON.stringify({
                                error: "Erreur lors de la modification"
                            }));
                        }

                        // Vérifie si un hôtel correspond à l'identifiant
                        // 0 signifie qu'aucune ligne n'a été trouvée
                        if (result.affectedRows === 0) {

                            // Code HTTP 404 = hôtel introuvable
                            res.writeHead(404, {
                                "Content-Type": "application/json"
                            });

                            return res.end(JSON.stringify({
                                error: "Hôtel introuvable"
                            }));
                        }

                        // Code HTTP 200 = modification réussie
                        res.writeHead(200, {
                            "Content-Type": "application/json"
                        });

                        // Confirme la modification
                        res.end(JSON.stringify({
                            message: "Hôtel modifié avec succès"
                        }));
                    }
                );

            // Si le texte reçu n'est pas un JSON valide
            } catch (err) {

                // Code HTTP 400 = requête incorrecte
                res.writeHead(400, {
                    "Content-Type": "application/json"
                });

                return res.end(JSON.stringify({
                    error: "JSON invalide"
                }));
            }
        });


    // ======================================================
    // ROUTE PAR DÉFAUT
    // ======================================================

    } else {

        // Réponse envoyée lorsqu'aucune route précédente ne correspond
        res.end("Bienvenue sur Book Your Travel");
    }
});


// ================= DÉMARRAGE DU SERVEUR =================

// Démarre le serveur HTTP sur le port 3000
server.listen(3000);
