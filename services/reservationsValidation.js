// ======================================================
// BOOK YOUR TRAVEL - VALIDATION DES RÉSERVATIONS
// ======================================================

// ========== VÉRIFIER L'ORDRE DES DATES ==========

// Vérifier que les dates sont valides et que le départ est après l'arrivée
function verifierOrdreDates(dateArrivee, dateDepart) {

    // Vérifier que les dates sont valides et dans le bon ordre
    return (
        Number.isFinite(dateArrivee.getTime()) &&
        Number.isFinite(dateDepart.getTime()) &&
        dateDepart > dateArrivee
    );

}

// ========== VÉRIFIER QUE LES DATES EXISTENT RÉELLEMENT ==========

// Vérifier que les dates correspondent à de vrais jours du calendrier
function verifierDatesReelles(dateArrivee, dateDepart, checkIn, checkOut) {

    // Comparer les dates créées en JavaScript aux dates reçues
    return (
        dateArrivee.toISOString().slice(0, 10) === checkIn &&
        dateDepart.toISOString().slice(0, 10) === checkOut
    );

}

// ========== CALCULER LE NOMBRE DE NUITS ==========

// Calculer le nombre de nuits entre l'arrivée et le départ
function calculerNombreNuits(dateArrivee, dateDepart) {

    // Convertir la différence entre les dates en nombre de jours
    return (dateDepart - dateArrivee) / (1000 * 60 * 60 * 24);

}

// ========== CALCULER LE PRIX TOTAL ==========

// Calculer le prix total selon le nombre de nuits
function calculerPrixTotal(nombreNuits, prixChambre) {

    // Vérifier que le nombre de nuits et le prix sont valides
    if (
        !Number.isFinite(nombreNuits) ||
        !Number.isFinite(prixChambre) ||
        nombreNuits <= 0 ||
        prixChambre < 0
    ) {
        throw new Error("Nombre de nuits ou prix de chambre invalide");
    }

    // Multiplier le nombre de nuits par le prix d'une nuit
    return nombreNuits * prixChambre;

}

// ======================================================
// EXPORTER LES FONCTIONS
// ======================================================

module.exports = {
    verifierOrdreDates,
    verifierDatesReelles,
    calculerNombreNuits,
    calculerPrixTotal
};