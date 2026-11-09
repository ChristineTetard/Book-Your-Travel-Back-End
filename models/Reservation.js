// ======================================================
// BOOK YOUR TRAVEL - MODÈLE RÉSERVATION (POO)
// ======================================================

// Importer nos fonctions de calcul existantes
const {
    calculerNombreNuits,
    calculerPrixTotal
} = require("../services/reservationsValidation");

// Créer une classe qui représente une réservation
class Reservation {

    // Le constructeur initialise les propriétés de la réservation
    constructor(checkIn, checkOut, prixChambre) {

        this.checkIn = checkIn;
        this.checkOut = checkOut;
        this.prixChambre = prixChambre;

    }

    // Méthode pour calculer le prix total du séjour
    calculerTotal() {

        // Transformer les dates en objets Date
        const dateArrivee = new Date(this.checkIn);
        const dateDepart = new Date(this.checkOut);

        // Calculer le nombre de nuits
        const nombreNuits = calculerNombreNuits(dateArrivee, dateDepart);

        // Calculer et retourner le prix total
        return calculerPrixTotal(nombreNuits, this.prixChambre);

    }

}

// Exporter la classe pour l'utiliser dans d'autres fichiers
module.exports = Reservation;