
// ======================================================
// BOOK YOUR TRAVEL - ROUTES DES RÉSERVATIONS
// ======================================================

// Importer la connexion MySQL
const db = require("../db");

// Fonction qui gère les routes des réservations
function reservationsRoutes(req, res) {

    // ========== GET : TOUTES LES RÉSERVATIONS ==========

    if (req.method === "GET" && req.url === "/api/reservations") {

        res.setHeader("Content-Type", "application/json; charset=utf-8");

        db.query("SELECT * FROM reservations", (err, results) => {

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


    // ========== GET : UNE SEULE RÉSERVATION ==========

    if (req.method === "GET" && req.url.startsWith("/api/reservations/")) {

        const parties = req.url.split("/");
        const reservationId = Number(parties[3]);

        res.setHeader("Content-Type", "application/json; charset=utf-8");

        if (!Number.isInteger(reservationId) || reservationId <= 0) {
            res.statusCode = 400;
            res.end(JSON.stringify({
                error: "Identifiant invalide"
            }));
            return true;
        }

        db.query(
            "SELECT * FROM reservations WHERE id = ?",
            [reservationId],
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
                        error: "Réservation introuvable"
                    }));
                }

                res.end(JSON.stringify(results[0]));
            }
        );

        return true;
    }

    // ========== POST : CRÉER UNE RÉSERVATION ==========

    if (req.method === "POST" && req.url === "/api/reservations") {

        res.setHeader("Content-Type", "application/json; charset=utf-8");

        let body = "";

        req.on("data", (chunk) => {
            body += chunk;
        });

        req.on("end", () => {

            try {

                // Transformer le JSON reçu en objet JavaScript
                const reservation = JSON.parse(body);

                // Afficher les données dans le terminal
                console.log(reservation);

                // Vérifier les informations obligatoires
                if (
                    !reservation || //vérifie si l'objet est absent ou vaut null
                    !reservation.user_id || // vérifie si l'identifiant du client est manquant ou possède une valeur considérée comme fausse
                    !reservation.room_id ||
                    !reservation.check_in ||
                    !reservation.check_out
                ) {

                    res.statusCode = 400;

                    return res.end(JSON.stringify({
                        error: "Informations obligatoires manquantes"
                    }));

                }

                // Vérifier que les identifiants sont des entiers positifs
                if (
                    !Number.isInteger(reservation.user_id) ||
                    reservation.user_id <= 0 ||
                    !Number.isInteger(reservation.room_id) ||
                    reservation.room_id <= 0
                ) {
                    res.statusCode = 400;

                    return res.end(JSON.stringify({
                        error: "Identifiants du client ou de la chambre invalides"
                    }));
                }

                // Vérifier le format des dates : AAAA-MM-JJ
                const formatDate = /^\d{4}-\d{2}-\d{2}$/;

                if (
                    typeof reservation.check_in !== "string" ||
                    typeof reservation.check_out !== "string" ||
                    !formatDate.test(reservation.check_in) ||
                    !formatDate.test(reservation.check_out)
                ) {
                    res.statusCode = 400;

                    return res.end(JSON.stringify({
                        error: "Les dates doivent être au format AAAA-MM-JJ"
                    }));
                }

                // Transformer les dates en objets Date
                const dateArrivee = new Date(reservation.check_in);
                const dateDepart = new Date(reservation.check_out);

                // Vérifier que les dates sont valides
                if (
                    !Number.isFinite(dateArrivee.getTime()) || // getTime() transforme une date en un nombre & Number.isFinite() vérifie que ce nombre est valide
                    !Number.isFinite(dateDepart.getTime()) ||
                    dateDepart <= dateArrivee // Vérifie que la date de départ n'est pas antérieure ou égale à la date d'arrivée
                ) {

                    res.statusCode = 400;

                    return res.end(JSON.stringify({
                        error: "Dates de réservation invalides"
                    }));

                }

                // Vérifier que les dates existent réellement
                if (
                    dateArrivee.toISOString().slice(0, 10) !== reservation.check_in || // .toISOString() transforme une date en texte au format ISO, par exemple 2026-11-15T00:00:00.000Z
                    dateDepart.toISOString().slice(0, 10) !== reservation.check_out // .slice(0, 10) conserve uniquement les dix premiers caractères : 2026-11-15
                ) {
                    res.statusCode = 400;

                    return res.end(JSON.stringify({
                        error: "Les dates indiquées n'existent pas"
                    }));
                }

                // Calculer le nombre de nuits
                const nombreNuits = (dateDepart - dateArrivee) / (1000 * 60 * 60 * 24); // calcule la différence entre les deux dates en millisecondes

                console.log("Nombre de nuits :", nombreNuits);

                // Récupérer le prix de la chambre dans MySQL
                db.query(
                    "SELECT price FROM rooms WHERE id = ?",
                    [reservation.room_id],
                    (err, results) => {

                        // Vérifier si MySQL rencontre une erreur
                        if (err) {
                            res.statusCode = 500;

                            return res.end(JSON.stringify({
                                error: "Erreur lors de la recherche de la chambre"
                            }));
                        }

                        // Vérifier si la chambre existe
                        if (results.length === 0) {
                            res.statusCode = 404;

                            return res.end(JSON.stringify({
                                error: "Chambre introuvable"
                            }));
                        }

                        // Récupérer le prix de la chambre
                        const prixChambre = Number(results[0].price); // results[0] récupère le premier résultat renvoyé par MySQL.

                        // Vérifier que le prix de la chambre est valide
                        if (!Number.isFinite(prixChambre) || prixChambre < 0) { // vérifie que le prix est un nombre valide et fini
                            res.statusCode = 500;

                            return res.end(JSON.stringify({
                                error: "Prix de la chambre invalide"
                            }));
                        }

                        // Calculer le prix total du séjour
                        const prixTotal = nombreNuits * prixChambre;

                        console.log("Prix total :", prixTotal);

                        // Vérifier si le client existe dans MySQL
                        db.query(
                            "SELECT id FROM users WHERE id = ?",
                            [reservation.user_id],
                            (err, results) => {

                                // Vérifier si MySQL rencontre une erreur
                                if (err) {
                                    res.statusCode = 500;

                                    return res.end(JSON.stringify({
                                        error: "Erreur lors de la recherche du client"
                                    }));
                                }

                                // Vérifier si le client existe
                                if (results.length === 0) {
                                    res.statusCode = 404;

                                    return res.end(JSON.stringify({
                                        error: "Client introuvable"
                                    }));
                                }

                                // Vérifier si la chambre est déjà réservée
                                db.query(
                                    `SELECT id FROM reservations
                                WHERE room_id = ?
                                AND status IN ('pending', 'confirmed')
                                AND check_in < ?
                                AND check_out > ?`,

                                    [
                                        reservation.room_id,
                                        reservation.check_out,
                                        reservation.check_in
                                    ],

                                    (err, results) => {

                                        // Vérifier si MySQL rencontre une erreur
                                        if (err) {
                                            res.statusCode = 500;

                                            return res.end(JSON.stringify({
                                                error: "Erreur lors de la vérification de disponibilité"
                                            }));
                                        }

                                        // Vérifier si la chambre est déjà réservée
                                        if (results.length > 0) {
                                            res.statusCode = 409; // Statut 409 Conflict signifie que la demande entre en conflit avec une situation existante

                                            return res.end(JSON.stringify({
                                                error: "Chambre indisponible pour ces dates"
                                            }));
                                        }

                                        // Enregistrer la réservation dans MySQL
                                        db.query(
                                            `INSERT INTO reservations
                                        (user_id, room_id, check_in, check_out, total_price, status)
                                        VALUES (?, ?, ?, ?, ?, ?)`,

                                            [
                                                reservation.user_id,
                                                reservation.room_id,
                                                reservation.check_in,
                                                reservation.check_out,
                                                prixTotal,
                                                "pending"
                                            ],

                                            (err, result) => {

                                                // Vérifier si MySQL rencontre une erreur
                                                if (err) {
                                                    res.statusCode = 500;

                                                    return res.end(JSON.stringify({
                                                        error: "Erreur lors de la création de la réservation"
                                                    }));
                                                }

                                                // Confirmer la création de la réservation
                                                res.statusCode = 201;

                                                res.end(JSON.stringify({
                                                    message: "Réservation créée avec succès",
                                                    id: result.insertId,
                                                    total_price: prixTotal,
                                                    status: "pending"
                                                }));

                                            }
                                        );

                                    }
                                );
                            }
                        );



                    }
                );

            } catch (err) {

                // Si le JSON est invalide
                res.statusCode = 400;

                res.end(JSON.stringify({
                    error: "JSON invalide"
                }));

            }

        });

        return true;
    }

    // Aucune route correspondante
    return false;
}

// Exporter les routes vers server.js
module.exports = reservationsRoutes;
