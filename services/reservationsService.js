
 // ======================================================
 // BOOK YOUR TRAVEL - SERVICE DES RÉSERVATIONS
 // ======================================================

 // Importer la connexion à la base de données MySQL
 const db = require("../db");


 // ======================================================
 // CALCULS DES RÉSERVATIONS
 // ======================================================

 // Calculer le nombre de nuits entre l'arrivée et le départ
 function calculerNombreNuits(dateArrivee, dateDepart) {

     // Convertir la différence entre les dates en nombre de jours
     return (dateDepart - dateArrivee) / (1000 * 60 * 60 * 24);

 }

 // Calculer le prix total selon le nombre de nuits
 function calculerPrixTotal(nombreNuits, prixChambre) {

     // Multiplier le nombre de nuits par le prix d'une nuit
     return nombreNuits * prixChambre;

 }


 // ======================================================
 // VÉRIFICATION DES DATES
 // ======================================================

 // Vérifier que la date respecte le format AAAA-MM-JJ
 function verifierFormatDate(date) {

     // Expression régulière qui vérifie le format de la date
     const formatDate = /^\d{4}-\d{2}-\d{2}$/;

     // Vérifier que la date est un texte au bon format
     return typeof date === "string" && formatDate.test(date);

 }

 // Vérifier que les dates correspondent à de vrais jours du calendrier
 function verifierDatesReelles(dateArrivee, dateDepart, checkIn, checkOut) {

     // Comparer les dates créées en JavaScript aux dates reçues
     return (
         dateArrivee.toISOString().slice(0, 10) === checkIn &&
         dateDepart.toISOString().slice(0, 10) === checkOut
     );

 }

 // Vérifier que les dates sont valides et que le départ est après l'arrivée
 function verifierOrdreDates(dateArrivee, dateDepart) {

     // Vérifier que les dates sont valides et dans le bon ordre
     return (
         Number.isFinite(dateArrivee.getTime()) &&
         Number.isFinite(dateDepart.getTime()) &&
         dateDepart > dateArrivee
     );

 }


 // ======================================================
 // DISPONIBILITÉ DES CHAMBRES
 // ======================================================

 // Vérifier si une chambre est déjà réservée aux dates demandées
 function verifierDisponibilite(roomId, checkIn, checkOut, callback) {

     // Rechercher les réservations qui chevauchent les dates demandées
     db.query(
         `SELECT id FROM reservations
         WHERE room_id = ?
         AND status IN ('pending', 'confirmed')
         AND check_in < ?
         AND check_out > ?`,

         // Remplacer les ? par les valeurs correspondantes
         [roomId, checkOut, checkIn],

         // Transmettre l'erreur ou les résultats à la route
         (err, results) => {
             callback(err, results);
         }
     );

 }


 // ======================================================
 // CRÉATION D'UNE RÉSERVATION
 // ======================================================

 // Enregistrer une nouvelle réservation dans MySQL
 function creerReservation(reservation, prixTotal, callback) {

     // Ajouter une réservation dans la table reservations
     db.query(
         `INSERT INTO reservations
         (user_id, room_id, check_in, check_out, total_price, status)
         VALUES (?, ?, ?, ?, ?, ?)`,

         // Informations à enregistrer dans la base de données
         [
             reservation.user_id,
             reservation.room_id,
             reservation.check_in,
             reservation.check_out,
             prixTotal,
             "pending" // Une nouvelle réservation est en attente
         ],

         // Transmettre le résultat de l'insertion à la route
         (err, result) => {
             callback(err, result);
         }
     );

 }


 // ======================================================
 // VÉRIFICATION DU CLIENT ET DU PRIX
 // ======================================================

 // Vérifier si le client existe dans la base de données
 function verifierClient(userId, callback) {

     // Rechercher le client grâce à son identifiant
     db.query(
         "SELECT id FROM users WHERE id = ?",
         [userId],

         // Transmettre le résultat de la recherche à la route
         (err, results) => {
             callback(err, results);
         }
     );

 }

 // Récupérer le prix d'une chambre grâce à son identifiant
 function recupererPrixChambre(roomId, callback) {

     // Rechercher le prix dans la table rooms
     db.query(
         "SELECT price FROM rooms WHERE id = ?",
         [roomId],

         // Transmettre le prix trouvé à la route
         (err, results) => {
             callback(err, results);
         }
     );

 }


 // ======================================================
 // RÉCUPÉRATION DES RÉSERVATIONS - GET
 // ======================================================

 // Récupérer toutes les réservations enregistrées dans MySQL
 function recupererReservations(callback) {

     // Sélectionner toutes les réservations
     db.query(
         "SELECT * FROM reservations",

         // Transmettre la liste des réservations à la route
         (err, results) => {
             callback(err, results);
         }
     );

 }

 // Récupérer une seule réservation grâce à son identifiant
 function recupererReservationParId(reservationId, callback) {

     // Rechercher la réservation correspondant à l'identifiant
     db.query(
         "SELECT * FROM reservations WHERE id = ?",
         [reservationId],

         // Transmettre la réservation trouvée à la route
         (err, results) => {
             callback(err, results);
         }
     );

 }


 // ======================================================
 // MODIFICATION DES RÉSERVATIONS - PUT
 // ======================================================

 // Récupérer le statut actuel d'une réservation
 function recupererStatutReservation(reservationId, callback) {

     // Rechercher l'identifiant et le statut de la réservation
     db.query(
         "SELECT id, status FROM reservations WHERE id = ?",
         [reservationId],

         // Transmettre le statut actuel à la route
         (err, results) => {
             callback(err, results);
         }
     );

 }

 // Modifier le statut d'une réservation dans MySQL
 function modifierStatutReservation(reservationId, status, callback) {

     // Mettre à jour le statut de la réservation sélectionnée
     db.query(
         "UPDATE reservations SET status = ? WHERE id = ?",
         [status, reservationId],

         // Transmettre le résultat de la modification à la route
         (err, result) => {
             callback(err, result);
         }
     );

 }


 // ======================================================
 // SUPPRESSION DES RÉSERVATIONS - DELETE
 // ======================================================

 // Supprimer une réservation grâce à son identifiant
 function supprimerReservation(reservationId, callback) {

     // Supprimer la réservation correspondante dans MySQL
     db.query(
         "DELETE FROM reservations WHERE id = ?",
         [reservationId],

         // Transmettre le résultat de la suppression à la route
         (err, result) => {
             callback(err, result);
         }
     );

 }


 // ======================================================
 // EXPORT DES FONCTIONS
 // ======================================================

 // Exporter les fonctions pour les utiliser dans reservations.js
 module.exports = {
     calculerNombreNuits,
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
     supprimerReservation
 };
