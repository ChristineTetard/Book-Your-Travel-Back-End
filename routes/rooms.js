
// ======================================================
// BOOK YOUR TRAVEL - ROUTES DES CHAMBRES
// GET, POST, PUT, DELETE
// ======================================================

// Importer la connexion MySQL
const db = require("../db");

// Importer le middleware d'authentification JWT
const verifierToken = require("../middlewares/auth");

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

    // Vérifier que l'utilisateur est connecté
    if (!verifierToken(req, res)) {
        return true;
    }

    // Autoriser uniquement les administrateurs et les prestataires
    if (
        req.utilisateur.role !== "admin" &&
        req.utilisateur.role !== "prestataire"
    ) {
        res.statusCode = 403;
        return res.end(JSON.stringify({
            error: "Accès réservé aux administrateurs et prestataires"
        }));
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

        // Vérifier les informations obligatoires
        if (
            !room ||
            typeof room !== "object" ||
            Array.isArray(room) ||
            typeof room.name !== "string" ||
            !room.name.trim() ||
            typeof room.price !== "number" ||
            !Number.isFinite(room.price) ||
            room.price <= 0 ||
            !Number.isInteger(room.capacity) ||
            room.capacity <= 0 ||
            !Number.isInteger(room.hotel_id) ||
            room.hotel_id <= 0
        ) {
            res.statusCode = 400;
            return res.end(JSON.stringify({
                error: "Informations de la chambre invalides ou manquantes"
            }));
        }

        // Vérifier que le prestataire possède l'hôtel
        db.query(
            "SELECT provider_id FROM hotels WHERE id = ?",
            [room.hotel_id],
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

                // Vérifier les droits du prestataire
                if (
                    req.utilisateur.role !== "admin" &&
                    Number(results[0].provider_id) !== Number(req.utilisateur.id)
                ) {
                    res.statusCode = 403;
                    return res.end(JSON.stringify({
                        error: "Vous ne pouvez pas ajouter de chambre à cet hôtel"
                    }));
                }

                // Ajouter la chambre uniquement après autorisation
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

        // Vérifier que l'utilisateur est connecté
        if (!verifierToken(req, res)) {
            return true;
        }

        // Autoriser uniquement les administrateurs et les prestataires
        if (
            req.utilisateur.role !== "admin" &&
            req.utilisateur.role !== "prestataire"
        ) {
            res.statusCode = 403;

            return res.end(JSON.stringify({
                error: "Accès réservé aux administrateurs et prestataires"
            }));
        }

        if (!Number.isInteger(roomId) || roomId <= 0) {
            res.statusCode = 400;
            res.end(JSON.stringify({
                error: "Identifiant invalide"
            }));
            return true;
        }

        // Supprimer uniquement une chambre appartenant
        // à un hôtel du prestataire connecté
        db.query(
            `DELETE rooms FROM rooms INNER JOIN hotels ON rooms.hotel_id = hotels.id
                WHERE rooms.id = ? AND (hotels.provider_id = ? OR ? = 'admin')`,
            [
                roomId,
                req.utilisateur.id,
                req.utilisateur.role
            ],
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

        // Vérifier que l'utilisateur est connecté
        if (!verifierToken(req, res)) {
            return true;
        }

        // Autoriser uniquement les administrateurs et les prestataires
        if (
            req.utilisateur.role !== "admin" &&
            req.utilisateur.role !== "prestataire"
        ) {
            res.statusCode = 403;

            return res.end(JSON.stringify({
                error: "Accès réservé aux administrateurs et prestataires"
            }));
        }

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

            // Modifier le prix uniquement si l'utilisateur est
            // administrateur ou propriétaire de l'hôtel
            db.query(
                `UPDATE rooms INNER JOIN hotels ON rooms.hotel_id = hotels.id SET rooms.price = ?
                    WHERE rooms.id = ? AND (hotels.provider_id = ? OR ? = 'admin')`,
                [
                    room.price,
                    roomId,
                    req.utilisateur.id,
                    req.utilisateur.role
                ],
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
