// ======================================================
// BOOK YOUR TRAVEL - TESTS DES RÉSERVATIONS
// ======================================================

// Importer les modules natifs de Node.js
const test = require("node:test");
const assert = require("node:assert/strict");

const {
    verifierOrdreDates,
    verifierDatesReelles,
    calculerNombreNuits,
    calculerPrixTotal
} = require("../services/reservationsValidation");

// ========== TEST : DATES DE RÉSERVATION VALIDES ==========

test("La date de départ doit être après la date d'arrivée", () => {

    // Définir les dates de la réservation
    const dateArrivee = new Date("2026-12-10");
    const dateDepart = new Date("2026-12-15");

    // Vérifier que notre fonction retourne true
    assert.equal(verifierOrdreDates(dateArrivee, dateDepart), true);

});

// ========== TEST : DATE DE DÉPART AVANT LA DATE D'ARRIVÉE ==========

test("La date de départ ne peut pas être avant la date d'arrivée", () => {

    // Définir des dates dans le mauvais ordre
    const dateArrivee = new Date("2026-12-15");
    const dateDepart = new Date("2026-12-10");

    // Vérifier que notre fonction retourne false
    assert.equal(verifierOrdreDates(dateArrivee, dateDepart), false);

});

// ========== TEST : DATES D'ARRIVÉE ET DE DÉPART IDENTIQUES ==========

test("La date de départ ne peut pas être identique à la date d'arrivée", () => {

    // Définir deux dates identiques
    const dateArrivee = new Date("2026-12-10");
    const dateDepart = new Date("2026-12-10");

    // Vérifier que notre fonction retourne false
    assert.equal(verifierOrdreDates(dateArrivee, dateDepart), false);

});

// ========== TEST : DATE INEXISTANTE ==========

test("Une réservation ne peut pas utiliser une date inexistante", () => {

    // Définir les dates reçues
    const checkIn = "2026-02-30";
    const checkOut = "2026-03-05";

    // Transformer les dates en objets Date
    const dateArrivee = new Date(checkIn);
    const dateDepart = new Date(checkOut);

    // Vérifier que notre fonction détecte la date inexistante
    assert.equal(
        verifierDatesReelles(dateArrivee, dateDepart, checkIn, checkOut),
        false
    );

});

// ========== TEST : DATE COMPLÈTEMENT INVALIDE ==========

test("Une réservation ne peut pas utiliser une date invalide", () => {

    // Créer une date d'arrivée invalide
    const dateArrivee = new Date("bonjour");

    // Créer une date de départ valide
    const dateDepart = new Date("2026-12-15");

    // Vérifier que notre fonction retourne false
    assert.equal(verifierOrdreDates(dateArrivee, dateDepart), false);

});

// ========== TEST : CALCUL DU NOMBRE DE NUITS ==========

test("Un séjour du 10 au 15 décembre doit durer 5 nuits", () => {

    // Définir les dates du séjour
    const dateArrivee = new Date("2026-12-10");
    const dateDepart = new Date("2026-12-15");

    // Calculer le nombre de nuits avec notre fonction
    const nombreNuits = calculerNombreNuits(dateArrivee, dateDepart);

    // Vérifier que le résultat est égal à 5
    assert.equal(nombreNuits, 5);

});

// ========== TEST : CALCUL DU PRIX TOTAL ==========

test("Un séjour de 5 nuits à 80 euros doit coûter 400 euros", () => {

    // Définir le nombre de nuits et le prix d'une chambre
    const nombreNuits = 5;
    const prixChambre = 80;

    // Calculer le prix total avec notre fonction
    const prixTotal = calculerPrixTotal(nombreNuits, prixChambre);

    // Vérifier que le prix total est égal à 400
    assert.equal(prixTotal, 400);

});

// ========== TEST : RÉSERVATION D'UNE NUIT ==========

test("Un séjour du 10 au 11 décembre doit durer 1 nuit", () => {

    // Définir les dates du séjour
    const dateArrivee = new Date("2026-12-10");
    const dateDepart = new Date("2026-12-11");

    // Calculer le nombre de nuits
    const nombreNuits = calculerNombreNuits(dateArrivee, dateDepart);

    // Vérifier que le séjour dure exactement 1 nuit
    assert.equal(nombreNuits, 1);

});

// ========== TEST : RÉSERVATION SUR DEUX ANNÉES ==========

test("Un séjour du 30 décembre au 2 janvier doit durer 3 nuits", () => {

    // Définir les dates du séjour
    const dateArrivee = new Date("2026-12-30");
    const dateDepart = new Date("2027-01-02");

    // Calculer le nombre de nuits
    const nombreNuits = calculerNombreNuits(dateArrivee, dateDepart);

    // Vérifier que le séjour dure exactement 3 nuits
    assert.equal(nombreNuits, 3);

});

// ========== TEST : PRIX D'UNE SEULE NUIT ==========

test("Une réservation d'une nuit à 55 euros doit coûter 55 euros", () => {

    // Définir le nombre de nuits et le prix de la chambre
    const nombreNuits = 1;
    const prixChambre = 55;

    // Calculer le prix total
    const prixTotal = calculerPrixTotal(nombreNuits, prixChambre);

    // Vérifier que le prix total est égal à 55
    assert.equal(prixTotal, 55);

});

// ========== TEST : PRIX AVEC DÉCIMALES ==========

test("Un séjour de 3 nuits à 55,50 euros doit coûter 166,50 euros", () => {

    // Définir le nombre de nuits et le prix de la chambre
    const nombreNuits = 3;
    const prixChambre = 55.50;

    // Calculer le prix total
    const prixTotal = calculerPrixTotal(nombreNuits, prixChambre);

    // Vérifier que le prix total est égal à 166,50
    assert.equal(prixTotal, 166.50);

});

// ========== TEST : PRIX NÉGATIF ==========

test("Une réservation ne doit pas accepter un prix négatif", () => {

    // Définir un nombre de nuits et un prix négatif
    const nombreNuits = 5;
    const prixChambre = -80;

    // Vérifier que la fonction refuse le prix négatif
    assert.throws(() => {
        calculerPrixTotal(nombreNuits, prixChambre);
    }, /Nombre de nuits ou prix de chambre invalide/);

});