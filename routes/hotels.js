
// ======================================================
// BOOK YOUR TRAVEL - ROUTES DES HÔTELS
// GET, POST, PUT, DELETE
// ======================================================

// Importer la connexion MySQL
const db = require("../db");

// Importer le middleware d'authentification JWT
const verifierToken = require("../middlewares/auth");

// Fonction qui gère les routes des hôtels
function hotelsRoutes(req, res) {

    // ========== GET : RÉCUPÉRER TOUS LES HÔTELS OU FILTRER PAR CATÉGORIE ==========

    if (
        req.method === "GET" &&
        (req.url === "/api/hotels" || req.url.startsWith("/api/hotels?"))
    ) {

        res.setHeader("Content-Type", "application/json; charset=utf-8");

        // Analyser l'URL pour récupérer les paramètres
        const url = new URL(req.url, "http://localhost");

        // Récupérer le paramètre category_id
        const categoryId = url.searchParams.get("category_id");

        // Requête SQL par défaut : récupérer tous les hôtels
        let sql = "SELECT * FROM hotels";
        let params = [];

        // Si une catégorie est précisée, filtrer les hôtels
        if (categoryId !== null) {

            // Vérifier que l'identifiant est valide
            const id = Number(categoryId);

            if (!Number.isInteger(id) || id <= 0) {
                res.statusCode = 400;
                res.end(JSON.stringify({
                    error: "Identifiant de catégorie invalide"
                }));
                return true;
            }

            // Ajouter le filtre à la requête SQL
            sql = "SELECT * FROM hotels WHERE category_id = ?";
            params = [id];
        }

        // Exécuter la requête SQL
        db.query(sql, params, (err, results) => {

            if (err) {
                res.statusCode = 500;
                return res.end(JSON.stringify({
                    error: "Erreur du serveur"
                }));
            }

            res.statusCode = 200;
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

        // Vérifier que l'utilisateur est connecté
        if (!verifierToken(req, res)) {
            return true;
        }

        // Autoriser uniquement les administrateurs et les prestataires
        if (
            req.utilisateur.role !== "admin" &&
            req.utilisateur.role !== "provider"
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

            let hotel;

            try {
                hotel = JSON.parse(body);
            } catch (err) {
                res.statusCode = 400;
                return res.end(JSON.stringify({
                    error: "JSON invalide"
                }));
            }

            // ======================================================
            // ATTRIBUER L'HÔTEL AU PRESTATAIRE CONNECTÉ
            // ======================================================

            // Vérifier que les données reçues sont bien un objet
            if (!hotel || typeof hotel !== "object" || Array.isArray(hotel)) {
                res.statusCode = 400;

                return res.end(JSON.stringify({
                    error: "Données de l'hôtel invalides"
                }));
            }

            // Un prestataire ne peut pas créer un hôtel
            // au nom d'un autre utilisateur
            if (req.utilisateur.role === "provider") {
                hotel.provider_id = req.utilisateur.id;
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

            // Vérifier que l'identifiant de catégorie est valide
            if (
                !Number.isInteger(hotel.category_id) ||
                hotel.category_id <= 0
            ) {
                res.statusCode = 400;
                return res.end(JSON.stringify({
                    error: "Identifiant de catégorie invalide"
                }));
            }

            db.query(
                "INSERT INTO hotels (provider_id, name, address, city, country, category_id) VALUES (?, ?, ?, ?, ?, ?)",
                [
                    hotel.provider_id,
                    hotel.name,
                    hotel.address,
                    hotel.city,
                    hotel.country,
                    hotel.category_id
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

        // Vérifier que l'utilisateur est connecté
        if (!verifierToken(req, res)) {
            return true;
        }

        // Autoriser uniquement les administrateurs et les prestataires
        if (
            req.utilisateur.role !== "admin" &&
            req.utilisateur.role !== "provider"
        ) {
            res.statusCode = 403;

            return res.end(JSON.stringify({
                error: "Accès réservé aux administrateurs et prestataires"
            }));
        }

        if (!Number.isInteger(hotelId) || hotelId <= 0) {
            res.statusCode = 400;
            res.end(JSON.stringify({
                error: "Identifiant invalide"
            }));
            return true;
        }

        // Supprimer l'hôtel uniquement si l'utilisateur est
        // administrateur ou propriétaire de cet hôtel
        db.query(
            `DELETE FROM hotels WHERE id = ? AND (provider_id = ? OR ? = 'admin')`,
            [hotelId, req.utilisateur.id, req.utilisateur.role],
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

        // Vérifier que l'utilisateur est connecté
        if (!verifierToken(req, res)) {
            return true;
        }

        // Autoriser uniquement les administrateurs et les prestataires
        if (
            req.utilisateur.role !== "admin" &&
            req.utilisateur.role !== "provider"
        ) {
            res.statusCode = 403;

            return res.end(JSON.stringify({
                error: "Accès réservé aux administrateurs et prestataires"
            }));
        }

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
                `UPDATE hotels SET name = ? WHERE id = ? AND (provider_id = ? OR ? = 'admin')`,
                [
                    hotel.name,
                    hotelId,
                    req.utilisateur.id,
                    req.utilisateur.role
                ],
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
