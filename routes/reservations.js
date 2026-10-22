
// ======================================================
// BOOK YOUR TRAVEL - ROUTES DES RÉSERVATIONS
// ======================================================

// Importer la connexion MySQL
const db = require("../db");

// Importer les fonctions
const { calculerNombreNuits,
    calculerPrixTotal,
    verifierFormatDate,
    verifierDatesReelles,
    verifierOrdreDates,
    verifierDisponibilite,
    creerReservation,
    verifierClient,
    recupererPrixChambre,
    recupererReservations,
    recupererReservationParId,
    recupererStatutReservation,
    modifierStatutReservation,
    supprimerReservation } = require("../services/reservationsService");

// Fonction qui gère les routes des réservations
function reservationsRoutes(req, res) {

    // ========== GET : TOUTES LES RÉSERVATIONS ==========

    if (req.method === "GET" && req.url === "/api/reservations") {

        res.setHeader("Content-Type", "application/json; charset=utf-8");

        recupererReservations((err, results) => {

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

        recupererReservationParId(
            reservationId,

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
                if (
                    !verifierFormatDate(reservation.check_in) ||
                    !verifierFormatDate(reservation.check_out)
                ) {
                    res.statusCode = 400;

                    return res.end(JSON.stringify({
                        error: "Les dates doivent être au format AAAA-MM-JJ"
                    }));
                }

                // Transformer les dates en objets Date
                const dateArrivee = new Date(reservation.check_in);
                const dateDepart = new Date(reservation.check_out);

                // Vérifier que les dates sont valides et dans le bon ordre
                if (!verifierOrdreDates(dateArrivee, dateDepart)) {

                    res.statusCode = 400;

                    return res.end(JSON.stringify({
                        error: "Dates de réservation invalides"
                    }));

                }

                // Vérifier que les dates existent réellement
                if (
                    !verifierDatesReelles(
                        dateArrivee,
                        dateDepart,
                        reservation.check_in,
                        reservation.check_out
                    )
                ) {
                    res.statusCode = 400;

                    return res.end(JSON.stringify({
                        error: "Les dates indiquées n'existent pas"
                    }));
                }

                // Calculer le nombre de nuits
                const nombreNuits = calculerNombreNuits(dateArrivee, dateDepart); // calcule la différence entre les deux dates en millisecondes

                console.log("Nombre de nuits :", nombreNuits);

                // Récupérer le prix de la chambre dans MySQL
                recupererPrixChambre(
                    reservation.room_id,

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
                        const prixTotal = calculerPrixTotal(nombreNuits, prixChambre);

                        console.log("Prix total :", prixTotal);

                        // Vérifier si le client existe dans MySQL
                        verifierClient(
                            reservation.user_id,

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
                                verifierDisponibilite(
                                    reservation.room_id,
                                    reservation.check_in,
                                    reservation.check_out,

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
                                        creerReservation(
                                            reservation,
                                            prixTotal,

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

    // ========== PUT : MODIFIER UNE RÉSERVATION ==========

    if (req.method === "PUT" && req.url.startsWith("/api/reservations/")) {

        res.setHeader("Content-Type", "application/json; charset=utf-8");

        // Récupérer l'identifiant de la réservation
        const parties = req.url.split("/");
        const reservationId = Number(parties[3]);

        // Vérifier que l'identifiant est valide
        if (!Number.isInteger(reservationId) || reservationId <= 0) {
            res.statusCode = 400;

            return res.end(JSON.stringify({
                error: "Identifiant invalide"
            }));
        }

        // Récupérer les données envoyées par le client
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

                // Vérifier que le statut est autorisé
                if (
                    !reservation ||
                    !["pending", "confirmed", "cancelled"].includes(reservation.status) // includes : vérifie si la valeur de reservation.status se trouve dans notre tableau
                ) {
                    res.statusCode = 400;

                    return res.end(JSON.stringify({
                        error: "Statut de réservation invalide"
                    }));
                }

                // Vérifier si la réservation existe dans MySQL
                recupererStatutReservation(
                    reservationId,

                    (err, results) => {

                        // Vérifier si MySQL rencontre une erreur
                        if (err) {
                            res.statusCode = 500;

                            return res.end(JSON.stringify({
                                error: "Erreur lors de la recherche de la réservation"
                            }));
                        }

                        // Vérifier si la réservation existe
                        if (results.length === 0) {
                            res.statusCode = 404;

                            return res.end(JSON.stringify({
                                error: "Réservation introuvable"
                            }));
                        }

                        // Empêcher la réactivation d'une réservation annulée
                        if (
                            results[0].status === "cancelled" &&
                            reservation.status !== "cancelled"
                        ) {
                            res.statusCode = 409;

                            return res.end(JSON.stringify({
                                error: "Impossible de réactiver une réservation annulée"
                            }));
                        }

                        // Modifier le statut de la réservation
                        modifierStatutReservation(
                            reservationId,
                            reservation.status,

                            (err, result) => {

                                // Vérifier si MySQL rencontre une erreur
                                if (err) {
                                    res.statusCode = 500;

                                    return res.end(JSON.stringify({
                                        error: "Erreur lors de la modification de la réservation"
                                    }));
                                }

                                // Confirmer la modification
                                res.statusCode = 200;

                                res.end(JSON.stringify({
                                    message: "Statut de la réservation modifié avec succès",
                                    id: reservationId,
                                    status: reservation.status
                                }));

                            }
                        );
                    }
                );

            } catch (err) {

                // Si le JSON est invalide
                res.statusCode = 400;

                return res.end(JSON.stringify({
                    error: "JSON invalide"
                }));
            }

        });

        return true;
    }

    // ========== DELETE : SUPPRIMER UNE RÉSERVATION ==========

    if (req.method === "DELETE" && req.url.startsWith("/api/reservations/")) {

        res.setHeader("Content-Type", "application/json; charset=utf-8");

        // Récupérer l'identifiant de la réservation
        const parties = req.url.split("/");
        const reservationId = Number(parties[3]);

        // Vérifier que l'identifiant est valide
        if (!Number.isInteger(reservationId) || reservationId <= 0) {
            res.statusCode = 400;

            return res.end(JSON.stringify({
                error: "Identifiant invalide"
            }));
        }

        // Supprimer la réservation dans MySQL
        supprimerReservation(
            reservationId,

            (err, result) => {

                // Vérifier si MySQL rencontre une erreur
                if (err) {
                    res.statusCode = 500;

                    return res.end(JSON.stringify({
                        error: "Erreur lors de la suppression de la réservation"
                    }));
                }

                // Vérifier si la réservation existait
                if (result.affectedRows === 0) {
                    res.statusCode = 404;

                    return res.end(JSON.stringify({
                        error: "Réservation introuvable"
                    }));
                }

                // Confirmer la suppression
                res.statusCode = 200;

                res.end(JSON.stringify({
                    message: "Réservation supprimée avec succès",
                    id: reservationId
                }));

            }
        );

        return true;
    }

    // Aucune route correspondante
    return false;
}

// Exporter les routes vers server.js
module.exports = reservationsRoutes;
