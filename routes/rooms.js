
// ======================================================
// BOOK YOUR TRAVEL - ROUTES DES CHAMBRES
// GET, POST, PUT, DELETE
// ======================================================

// Importer la connexion MySQL
const db = require("../db");

// Fonction qui gère les routes des chambres
function roomsRoutes(req, res) {

    // ========== GET : RÉCUPÉRER TOUTES LES CHAMBRES ==========

    if (req.method === "GET" && req.url === "/api/rooms") {

        res.setHeader("Content-Type", "application/json; charset=utf-8");

        db.query("SELECT * FROM rooms", (err, results) => {

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


    // ========== GET : RÉCUPÉRER UNE SEULE CHAMBRE ==========

    if (req.method === "GET" && req.url.startsWith("/api/rooms/")) {

        const parties = req.url.split("/");
        const roomId = Number(parties[3]);

        res.setHeader("Content-Type", "application/json; charset=utf-8");

        if (!Number.isInteger(roomId) || roomId <= 0) {
            res.statusCode = 400;
            res.end(JSON.stringify({
                error: "Identifiant invalide"
            }));
            return true;
        }

        db.query(
            "SELECT * FROM rooms WHERE id = ?",
            [roomId],
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
                        error: "Chambre introuvable"
                    }));
                }

                res.end(JSON.stringify(results[0]));
            }
        );

        return true;
    }


    // ========== POST : AJOUTER UNE CHAMBRE ==========

    if (req.method === "POST" && req.url === "/api/rooms") {

        res.setHeader("Content-Type", "application/json; charset=utf-8");

        let body = "";

        req.on("data", (chunk) => {
            body += chunk;
        });

        req.on("end", () => {

            let room;

            try {
                room = JSON.parse(body);
            } catch (err) {
                res.statusCode = 400;
                return res.end(JSON.stringify({
                    error: "JSON invalide"
                }));
            }

            // Vérifier les informations obligatoires
            if (
                !room ||
                !room.name ||
                !room.price ||
                !room.capacity ||
                !room.hotel_id
            ) {
                res.statusCode = 400;
                return res.end(JSON.stringify({
                    error: "Informations obligatoires manquantes"
                }));
            }

            db.query(
                "INSERT INTO rooms (hotel_id, name, capacity, price) VALUES (?, ?, ?, ?)",
                [
                    room.hotel_id,
                    room.name,
                    room.capacity,
                    room.price
                ],
                (err, result) => {

                    if (err) {
                        res.statusCode = 500;
                        return res.end(JSON.stringify({
                            error: "Erreur lors de l'ajout de la chambre"
                        }));
                    }

                    res.statusCode = 201;

                    res.end(JSON.stringify({
                        message: "Chambre ajoutée avec succès",
                        id: result.insertId
                    }));
                }
            );
        });

        return true;
    }


    // ========== DELETE : SUPPRIMER UNE CHAMBRE ==========

    if (req.method === "DELETE" && req.url.startsWith("/api/rooms/")) {

        const parties = req.url.split("/");
        const roomId = Number(parties[3]);

        res.setHeader("Content-Type", "application/json; charset=utf-8");

        if (!Number.isInteger(roomId) || roomId <= 0) {
            res.statusCode = 400;
            res.end(JSON.stringify({
                error: "Identifiant invalide"
            }));
            return true;
        }

        db.query(
            "DELETE FROM rooms WHERE id = ?",
            [roomId],
            (err, result) => {

                if (err) {
                    res.statusCode = 500;
                    return res.end(JSON.stringify({
                        error: "Erreur lors de la suppression de la chambre"
                    }));
                }

                if (result.affectedRows === 0) {
                    res.statusCode = 404;
                    return res.end(JSON.stringify({
                        error: "Chambre introuvable"
                    }));
                }

                res.statusCode = 200;

                res.end(JSON.stringify({
                    message: "Chambre supprimée avec succès"
                }));
            }
        );

        return true;
    }


    // ========== PUT : MODIFIER LE PRIX D'UNE CHAMBRE ==========

    if (req.method === "PUT" && req.url.startsWith("/api/rooms/")) {

        const parties = req.url.split("/");
        const roomId = Number(parties[3]);

        res.setHeader("Content-Type", "application/json; charset=utf-8");

        if (!Number.isInteger(roomId) || roomId <= 0) {
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

            let room;

            try {
                room = JSON.parse(body);
            } catch (err) {
                res.statusCode = 400;
                return res.end(JSON.stringify({
                    error: "JSON invalide"
                }));
            }

            // Vérifier que le prix est un nombre positif
            if (
                !room ||
                typeof room.price !== "number" ||
                !Number.isFinite(room.price) ||
                room.price <= 0
            ) {
                res.statusCode = 400;
                return res.end(JSON.stringify({
                    error: "Prix invalide"
                }));
            }

            db.query(
                "UPDATE rooms SET price = ? WHERE id = ?",
                [room.price, roomId],
                (err, result) => {

                    if (err) {
                        res.statusCode = 500;
                        return res.end(JSON.stringify({
                            error: "Erreur lors de la modification de la chambre"
                        }));
                    }

                    if (result.affectedRows === 0) {
                        res.statusCode = 404;
                        return res.end(JSON.stringify({
                            error: "Chambre introuvable"
                        }));
                    }

                    res.statusCode = 200;

                    res.end(JSON.stringify({
                        message: "Prix de la chambre modifié avec succès"
                    }));
                }
            );
        });

        return true;
    }


    // La requête ne correspond à aucune route des chambres
    return false;
}

// Exporter la fonction vers server.js
module.exports = roomsRoutes;
