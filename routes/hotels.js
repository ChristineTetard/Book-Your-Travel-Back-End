
// ======================================================
// BOOK YOUR TRAVEL - ROUTES DES HÔTELS
// GET, POST, PUT, DELETE
// ======================================================

// Importer la connexion MySQL
const db = require("../db");

// Fonction qui gère les routes des hôtels
function hotelsRoutes(req, res) {

    // ========== GET : RÉCUPÉRER TOUS LES HÔTELS ==========

    if (req.method === "GET" && req.url === "/api/hotels") {

        res.setHeader("Content-Type", "application/json; charset=utf-8");

        db.query("SELECT * FROM hotels", (err, results) => {

            if (err) {
                res.statusCode = 500;
                return res.end(JSON.stringify({
                    error: "Erreur du serveur"
                }));
            }

            res.end(JSON.stringify(results));
        });

        return true;
    }


    // ========== GET : RÉCUPÉRER UN SEUL HÔTEL ==========

    if (req.method === "GET" && req.url.startsWith("/api/hotels/")) {

        const parties = req.url.split("/");
        const hotelId = Number(parties[3]);

        res.setHeader("Content-Type", "application/json; charset=utf-8");

        // Vérifier l'identifiant
        if (!Number.isInteger(hotelId) || hotelId <= 0) {
            res.statusCode = 400;
            res.end(JSON.stringify({
                error: "Identifiant invalide"
            }));
            return true;
        }

        db.query(
            "SELECT * FROM hotels WHERE id = ?",
            [hotelId],
            (err, results) => {

                if (err) {
                    res.statusCode = 500;
                    return res.end(JSON.stringify({
                        error: "Erreur du serveur"
                    }));
                }

                if (results.length === 0) {
                    res.statusCode = 404;
                    return res.end(JSON.stringify({
                        error: "Hôtel introuvable"
                    }));
                }

                res.end(JSON.stringify(results[0]));
            }
        );

        return true;
    }


    // ========== POST : AJOUTER UN HÔTEL ==========

    if (req.method === "POST" && req.url === "/api/hotels") {

        res.setHeader("Content-Type", "application/json; charset=utf-8");

        let body = "";

        req.on("data", (chunk) => {
            body += chunk;
        });

        req.on("end", () => {

            let hotel;

            try {
                hotel = JSON.parse(body);
            } catch (err) {
                res.statusCode = 400;
                return res.end(JSON.stringify({
                    error: "JSON invalide"
                }));
            }

            // Vérifier les informations obligatoires
            if (
                !hotel ||
                !hotel.provider_id ||
                !hotel.name ||
                !hotel.address ||
                !hotel.city ||
                !hotel.country
            ) {
                res.statusCode = 400;
                return res.end(JSON.stringify({
                    error: "Informations obligatoires manquantes"
                }));
            }

            db.query(
                "INSERT INTO hotels (provider_id, name, address, city, country) VALUES (?, ?, ?, ?, ?)",
                [
                    hotel.provider_id,
                    hotel.name,
                    hotel.address,
                    hotel.city,
                    hotel.country
                ],
                (err, result) => {

                    if (err) {
                        res.statusCode = 500;
                        return res.end(JSON.stringify({
                            error: "Erreur lors de l'ajout de l'hôtel"
                        }));
                    }

                    res.statusCode = 201;

                    res.end(JSON.stringify({
                        message: "Hôtel ajouté avec succès",
                        id: result.insertId
                    }));
                }
            );
        });

        return true;
    }


    // ========== DELETE : SUPPRIMER UN HÔTEL ==========

    if (req.method === "DELETE" && req.url.startsWith("/api/hotels/")) {

        const parties = req.url.split("/");
        const hotelId = Number(parties[3]);

        res.setHeader("Content-Type", "application/json; charset=utf-8");

        if (!Number.isInteger(hotelId) || hotelId <= 0) {
            res.statusCode = 400;
            res.end(JSON.stringify({
                error: "Identifiant invalide"
            }));
            return true;
        }

        db.query(
            "DELETE FROM hotels WHERE id = ?",
            [hotelId],
            (err, result) => {

                if (err) {
                    res.statusCode = 500;
                    return res.end(JSON.stringify({
                        error: "Erreur lors de la suppression"
                    }));
                }

                if (result.affectedRows === 0) {
                    res.statusCode = 404;
                    return res.end(JSON.stringify({
                        error: "Hôtel introuvable"
                    }));
                }

                res.statusCode = 200;

                res.end(JSON.stringify({
                    message: "Suppression effectuée"
                }));
            }
        );

        return true;
    }


    // ========== PUT : MODIFIER LE NOM D'UN HÔTEL ==========

    if (req.method === "PUT" && req.url.startsWith("/api/hotels/")) {

        const parties = req.url.split("/");
        const hotelId = Number(parties[3]);

        res.setHeader("Content-Type", "application/json; charset=utf-8");

        if (!Number.isInteger(hotelId) || hotelId <= 0) {
            res.statusCode = 400;
            res.end(JSON.stringify({
                error: "Identifiant invalide"
            }));
            return true;
        }

        let body = "";

        req.on("data", (chunk) => {
            body += chunk;
        });

        req.on("end", () => {

            let hotel;

            try {
                hotel = JSON.parse(body);
            } catch (err) {
                res.statusCode = 400;
                return res.end(JSON.stringify({
                    error: "JSON invalide"
                }));
            }

            // Vérifier le nouveau nom
            if (
                !hotel ||
                typeof hotel.name !== "string" ||
                !hotel.name.trim()
            ) {
                res.statusCode = 400;
                return res.end(JSON.stringify({
                    error: "Nom de l'hôtel obligatoire"
                }));
            }

            db.query(
                "UPDATE hotels SET name = ? WHERE id = ?",
                [hotel.name, hotelId],
                (err, result) => {

                    if (err) {
                        res.statusCode = 500;
                        return res.end(JSON.stringify({
                            error: "Erreur lors de la modification"
                        }));
                    }

                    if (result.affectedRows === 0) {
                        res.statusCode = 404;
                        return res.end(JSON.stringify({
                            error: "Hôtel introuvable"
                        }));
                    }

                    res.statusCode = 200;

                    res.end(JSON.stringify({
                        message: "Hôtel modifié avec succès"
                    }));
                }
            );
        });

        return true;
    }


    // La requête ne correspond à aucune route des hôtels
    return false;
}

// Exporter la fonction vers server.js
module.exports = hotelsRoutes;
