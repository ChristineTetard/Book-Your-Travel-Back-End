
// ======================================================
// BOOK YOUR TRAVEL - ROUTES DES RÉSERVATIONS
// ======================================================

// Importer la connexion MySQL
const db = require("../db");

// ======================================================
// IMPORTER LE MIDDLEWARE D'AUTHENTIFICATION
// ======================================================

// Importer notre fonction qui vérifie les tokens JWT
// avant d'autoriser l'accès aux routes protégées
const verifierToken = require("../middlewares/auth");

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
    recupererReservationsClient,
    recupererReservationParId,
    recupererStatutReservation,
    modifierStatutReservation,
    modifierDatesReservation,
    verifierDisponibiliteModification,
    supprimerReservation } = require("../services/reservationsService");

// Fonction qui gère les routes des réservations
function reservationsRoutes(req, res) {

    // ========== GET : TOUTES LES RÉSERVATIONS ==========

    if (req.method === "GET" && req.url === "/api/reservations") {

        res.setHeader("Content-Type", "application/json; charset=utf-8");

        // ======================================================
        // VÉRIFIER L'AUTHENTIFICATION DE L'UTILISATEUR
        // ======================================================

        // Vérifier que l'utilisateur possède un token JWT valide
        if (!verifierToken(req, res)) {

            // Le middleware a déjà envoyé une réponse 401
            // Nous arrêtons donc le traitement de cette route
            return true;
        }

        // ======================================================
        // VÉRIFIER LE RÔLE DE L'UTILISATEUR
        // ======================================================

        // Vérifier si l'utilisateur connecté est un client
        if (req.utilisateur.role === "client") {

            // Récupérer uniquement les réservations
            // appartenant à l'utilisateur connecté
            recupererReservationsClient(req.utilisateur.id, (err, results) => {

                // Gérer une éventuelle erreur MySQL
                if (err) {
                    res.statusCode = 500;

                    return res.end(JSON.stringify({
                        error: "Erreur du serveur"
                    }));
                }

                // Envoyer uniquement les réservations du client
                res.statusCode = 200;
                res.end(JSON.stringify(results));
            });

            // Arrêter le traitement de cette route
            // pour ne pas récupérer toutes les réservations
            return true;
        }

        // ======================================================
        // VÉRIFIER LE RÔLE ADMINISTRATEUR
        // ======================================================

        // Seuls les administrateurs peuvent consulter
        // la liste complète des réservations
        if (req.utilisateur.role !== "admin") {

            // Code 403 : accès interdit
            res.statusCode = 403;

            // Envoyer un message d'erreur
            res.end(JSON.stringify({
                error: "Accès réservé aux administrateurs"
            }));

            // Arrêter le traitement de la route
            return true;
        }

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

        // ======================================================
        // VÉRIFIER L'AUTHENTIFICATION DE L'UTILISATEUR
        // ======================================================

        // Vérifier que l'utilisateur possède un token JWT valide
        if (!verifierToken(req, res)) {

            // Le middleware a déjà envoyé une réponse 401
            // Arrêter le traitement de cette route
            return true;
        }

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

                // ======================================================
                // VÉRIFIER LE PROPRIÉTAIRE DE LA RÉSERVATION
                // ======================================================

                // Récupérer la réservation trouvée dans MySQL
                const reservation = results[0];

                // Vérifier si l'utilisateur est administrateur
                // ou propriétaire de la réservation
                if (
                    req.utilisateur.role !== "admin" &&
                    (
                        req.utilisateur.role !== "client" ||
                        Number(reservation.user_id) !== Number(req.utilisateur.id)
                    )
                ) {

                    // Refuser l'accès à cette réservation
                    res.statusCode = 403;

                    return res.end(JSON.stringify({
                        error: "Vous ne pouvez pas consulter cette réservation"
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

        // ======================================================
        // VÉRIFIER L'AUTHENTIFICATION DE L'UTILISATEUR
        // ======================================================

        // Vérifier que l'utilisateur possède un token JWT valide
        if (!verifierToken(req, res)) {

            // Le middleware a déjà envoyé une réponse 401
            // Arrêter le traitement de cette route
            return true;
        }

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

                // ======================================================
                // VÉRIFIER LE RÔLE DE L'UTILISATEUR
                // ======================================================

                // Seuls les clients et les administrateurs
                // peuvent créer une réservation
                if (
                    req.utilisateur.role !== "client" &&
                    req.utilisateur.role !== "admin"
                ) {
                    res.statusCode = 403;

                    return res.end(JSON.stringify({
                        error: "Vous n'êtes pas autorisé à créer une réservation"
                    }));
                }

                // ======================================================
                // UTILISER L'IDENTIFIANT DU CLIENT CONNECTÉ
                // ======================================================

                // Pour un client, récupérer automatiquement son identifiant
                // depuis le token JWT, plutôt que depuis le JSON reçu
                if (req.utilisateur.role === "client") {
                    reservation.user_id = req.utilisateur.id;
                }

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

    // Vérifier que l'URL correspond exactement
    // à une réservation avec un identifiant numérique
    if (req.method === "PUT" && /^\/api\/reservations\/\d+$/.test(req.url)) {

        res.setHeader("Content-Type", "application/json; charset=utf-8");

        // ======================================================
        // VÉRIFIER L'AUTHENTIFICATION DE L'UTILISATEUR
        // ======================================================

        // Vérifier que l'utilisateur possède un token JWT valide
        if (!verifierToken(req, res)) {

            // Le middleware a déjà envoyé une réponse 401
            // Arrêter le traitement de cette route
            return true;
        }

        // ======================================================
        // VÉRIFIER LE RÔLE DE L'UTILISATEUR
        // ======================================================

        // Seuls les clients et les administrateurs
        // peuvent modifier le statut d'une réservation
        if (
            req.utilisateur.role !== "client" &&
            req.utilisateur.role !== "admin"
        ) {
            res.statusCode = 403;

            return res.end(JSON.stringify({
                error: "Vous n'êtes pas autorisé à modifier cette réservation"
            }));
        }

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

                // ======================================================
                // VÉRIFIER LE STATUT AUTORISÉ POUR UN CLIENT
                // ======================================================

                // Un client peut uniquement demander l'annulation
                // d'une réservation
                if (
                    req.utilisateur.role === "client" &&
                    reservation.status !== "cancelled"
                ) {
                    res.statusCode = 403;

                    return res.end(JSON.stringify({
                        error: "Un client peut uniquement annuler sa réservation"
                    }));
                }

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

                        // ======================================================
                        // VÉRIFIER LE PROPRIÉTAIRE DE LA RÉSERVATION
                        // ======================================================

                        // Un client peut uniquement modifier sa propre réservation
                        if (
                            req.utilisateur.role === "client" &&
                            Number(results[0].user_id) !== Number(req.utilisateur.id)
                        ) {

                            // Refuser la modification d'une réservation appartenant
                            // à un autre utilisateur
                            res.statusCode = 403;

                            return res.end(JSON.stringify({
                                error: "Vous ne pouvez pas modifier cette réservation"
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


    // ========== PUT : MODIFIER LES DATES D'UNE RÉSERVATION ==========

    // Vérifier si la requête demande de modifier
    // les dates d'une réservation
    if (req.method === "PUT" && /^\/api\/reservations\/\d+\/dates$/.test(req.url)) {

        // Indiquer que notre réponse sera au format JSON
        res.setHeader("Content-Type", "application/json; charset=utf-8");

        // Vérifier que l'utilisateur est connecté
        if (!verifierToken(req, res)) {
            return true;
        }

        // ======================================================
        // RÉCUPÉRER L'IDENTIFIANT DE LA RÉSERVATION
        // ======================================================

        // Séparer l'URL en plusieurs parties grâce aux "/"
        const parties = req.url.split("/");

        // Récupérer l'identifiant de la réservation
        // La quatrième partie de l'URL contient son identifiant
        const reservationId = Number(parties[3]);

        // ======================================================
        // VÉRIFIER L'IDENTIFIANT DE LA RÉSERVATION
        // ======================================================

        // Vérifier que l'identifiant est un nombre entier positif
        if (!Number.isSafeInteger(reservationId) || reservationId <= 0) {

            // Renvoyer une erreur 400 si l'identifiant est invalide
            res.statusCode = 400;

            // Envoyer un message d'erreur au format JSON
            return res.end(JSON.stringify({
                error: "Identifiant de réservation invalide"
            }));
        }

        // ======================================================
        // RÉCUPÉRER LES NOUVELLES DATES
        // ======================================================

        // Créer une variable pour stocker les données reçues
        let body = "";

        // Récupérer progressivement les données envoyées
        // par le client dans sa requête HTTP
        req.on("data", (chunk) => {

            // Ajouter chaque morceau reçu dans notre variable
            body += chunk;

        });

        // Attendre que toutes les données soient reçues
        req.on("end", () => {

            try {

                // Transformer le texte JSON reçu en objet JavaScript
                const reservation = JSON.parse(body);

                // Vérifier que les données reçues sont bien un objet
                // et non null, un tableau ou une autre valeur
                if (
                    !reservation ||
                    typeof reservation !== "object" ||
                    Array.isArray(reservation)
                ) {
                    res.statusCode = 400;

                    return res.end(JSON.stringify({
                        error: "Données de réservation invalides"
                    }));
                }

                // ======================================================
                // VÉRIFIER LA PRÉSENCE DES NOUVELLES DATES
                // ======================================================

                // Vérifier que les dates d'arrivée et de départ
                // ont bien été envoyées par le client
                if (!reservation.check_in || !reservation.check_out) {

                    // Renvoyer une erreur 400 si une date est manquante
                    res.statusCode = 400;

                    // Envoyer un message d'erreur au format JSON
                    return res.end(JSON.stringify({
                        error: "Les dates d'arrivée et de départ sont obligatoires"
                    }));
                }

                // ======================================================
                // VÉRIFIER LE FORMAT DES NOUVELLES DATES
                // ======================================================

                // Vérifier que les deux dates respectent
                // le format AAAA-MM-JJ
                if (
                    !verifierFormatDate(reservation.check_in) ||
                    !verifierFormatDate(reservation.check_out)
                ) {

                    // Renvoyer une erreur 400 si le format est incorrect
                    res.statusCode = 400;

                    // Envoyer un message d'erreur au format JSON
                    return res.end(JSON.stringify({
                        error: "Les dates doivent être au format AAAA-MM-JJ"
                    }));
                }

                // ======================================================
                // VÉRIFIER L'ORDRE DES NOUVELLES DATES
                // ======================================================

                // Transformer les dates reçues en objets Date JavaScript
                const dateArrivee = new Date(reservation.check_in);
                const dateDepart = new Date(reservation.check_out);

                // Vérifier que les dates sont valides
                // et que le départ est après l'arrivée
                if (!verifierOrdreDates(dateArrivee, dateDepart)) {

                    // Renvoyer une erreur 400 si les dates sont incorrectes
                    res.statusCode = 400;

                    // Envoyer un message d'erreur au format JSON
                    return res.end(JSON.stringify({
                        error: "Dates de réservation invalides"
                    }));
                }

                // ======================================================
                // VÉRIFIER QUE LES NOUVELLES DATES EXISTENT
                // ======================================================

                // Vérifier que les dates correspondent
                // à de vrais jours du calendrier
                if (
                    !verifierDatesReelles(
                        dateArrivee,
                        dateDepart,
                        reservation.check_in,
                        reservation.check_out
                    )
                ) {

                    // Renvoyer une erreur 400 si une date n'existe pas
                    res.statusCode = 400;

                    // Envoyer un message d'erreur au format JSON
                    return res.end(JSON.stringify({
                        error: "Les dates indiquées n'existent pas"
                    }));
                }

                // ======================================================
                // CALCULER LE NOUVEAU NOMBRE DE NUITS
                // ======================================================

                // Calculer le nombre de nuits entre
                // la nouvelle date d'arrivée et la nouvelle date de départ
                const nombreNuits = calculerNombreNuits(
                    dateArrivee,
                    dateDepart
                );

                // ======================================================
                // RÉCUPÉRER LA RÉSERVATION EXISTANTE
                // ======================================================

                // Rechercher la réservation dans la base de données
                // grâce à son identifiant
                recupererReservationParId(reservationId, (err, results) => {

                    // Vérifier si une erreur MySQL s'est produite
                    if (err) {
                        res.statusCode = 500;

                        return res.end(JSON.stringify({
                            error: "Erreur lors de la récupération de la réservation"
                        }));
                    }

                    // Vérifier si aucune réservation n'a été trouvée
                    if (results.length === 0) {
                        res.statusCode = 404;

                        return res.end(JSON.stringify({
                            error: "Réservation introuvable"
                        }));
                    }

                    // Récupérer la réservation trouvée
                    const reservationExistante = results[0];

                    // Vérifier que l'utilisateur est administrateur
                    // ou propriétaire de la réservation
                    if (
                        req.utilisateur.role !== "admin" &&
                        (
                            req.utilisateur.role !== "client" ||
                            Number(reservationExistante.user_id) !== Number(req.utilisateur.id)
                        )
                    ) {
                        res.statusCode = 403;

                        return res.end(JSON.stringify({
                            error: "Vous ne pouvez pas modifier cette réservation"
                        }));
                    }

                    // ======================================================
                    // VÉRIFIER QUE LA RÉSERVATION N'EST PAS ANNULÉE
                    // ======================================================

                    // Empêcher la modification des dates
                    // d'une réservation qui a déjà été annulée
                    if (reservationExistante.status === "cancelled") {

                        // Le conflit concerne l'état actuel de la réservation
                        res.statusCode = 409;

                        // Envoyer un message d'erreur au client
                        return res.end(JSON.stringify({
                            error: "Impossible de modifier une réservation annulée"
                        }));
                    }

                    // ======================================================
                    // VÉRIFIER LA DISPONIBILITÉ DE LA CHAMBRE
                    // ======================================================

                    // Vérifier si la chambre est disponible
                    // pour les nouvelles dates demandées
                    verifierDisponibiliteModification(
                        reservationExistante.room_id,
                        reservation.check_in,
                        reservation.check_out,
                        reservationId,
                        (err, results) => {

                            // Vérifier si une erreur MySQL s'est produite
                            if (err) {
                                res.statusCode = 500;

                                return res.end(JSON.stringify({
                                    error: "Erreur lors de la vérification de disponibilité"
                                }));
                            }

                            // Si une réservation existe déjà sur cette période,
                            // la chambre n'est pas disponible
                            if (results.length > 0) {
                                res.statusCode = 409;

                                return res.end(JSON.stringify({
                                    error: "La chambre est indisponible aux dates demandées"
                                }));
                            }

                            // ======================================================
                            // RÉCUPÉRER LE PRIX DE LA CHAMBRE
                            // ======================================================

                            // Rechercher le prix de la chambre dans MySQL
                            recupererPrixChambre(reservationExistante.room_id, (err, results) => {

                                // Vérifier si une erreur MySQL s'est produite
                                if (err) {
                                    res.statusCode = 500;

                                    return res.end(JSON.stringify({
                                        error: "Erreur lors de la récupération du prix de la chambre"
                                    }));
                                }

                                // Vérifier que la chambre existe toujours
                                if (results.length === 0) {
                                    res.statusCode = 404;

                                    return res.end(JSON.stringify({
                                        error: "Chambre introuvable"
                                    }));
                                }

                                // Récupérer le prix de la chambre
                                const prixChambre = results[0].price;

                                // ======================================================
                                // CALCULER LE NOUVEAU PRIX TOTAL
                                // ======================================================

                                // Calculer le prix total avec le nouveau nombre de nuits
                                // et le prix de la chambre
                                const nouveauPrixTotal = calculerPrixTotal(
                                    nombreNuits,
                                    prixChambre
                                );

                                // ======================================================
                                // ENREGISTRER LES MODIFICATIONS DANS MYSQL
                                // ======================================================

                                // Modifier les dates et le prix total de la réservation
                                modifierDatesReservation(
                                    reservationId,
                                    reservation.check_in,
                                    reservation.check_out,
                                    nouveauPrixTotal,
                                    (err, result) => {

                                        // Vérifier si une erreur MySQL s'est produite
                                        if (err) {
                                            res.statusCode = 500;

                                            return res.end(JSON.stringify({
                                                error: "Erreur lors de la modification de la réservation"
                                            }));
                                        }

                                        // Vérifier qu'une réservation a bien été modifiée
                                        if (result.affectedRows === 0) {
                                            res.statusCode = 404;

                                            return res.end(JSON.stringify({
                                                error: "Réservation introuvable"
                                            }));
                                        }

                                        // La modification a réussi !
                                        res.statusCode = 200;

                                        // Envoyer une réponse au client
                                        return res.end(JSON.stringify({
                                            message: "Dates de réservation modifiées avec succès",
                                            reservation_id: reservationId,
                                            check_in: reservation.check_in,
                                            check_out: reservation.check_out,
                                            total_price: nouveauPrixTotal
                                        }));
                                    }
                                );

                            });

                        }
                    );
                });



            } catch (err) {

                // Si le texte reçu n'est pas un JSON valide
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

        // Vérifier que l'utilisateur est connecté
        if (!verifierToken(req, res)) {
            return true;
        }

        // Réserver la suppression définitive aux administrateurs
        if (req.utilisateur.role !== "admin") {
            res.statusCode = 403;

            return res.end(JSON.stringify({
                error: "Suppression réservée aux administrateurs"
            }));
        }

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
