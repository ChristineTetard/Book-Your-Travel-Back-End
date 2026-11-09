// ======================================================
// TESTS UNITAIRES - CLASSE RESERVATION (POO)
// ======================================================

// Importer les outils de test natifs de Node.js
const test = require("node:test");
const assert = require("node:assert/strict");

// Importer notre classe Reservation
const Reservation = require("../models/Reservation");

// Vérifier le calcul du prix avec notre classe
test("Une réservation POO de 3 nuits à 55 euros doit coûter 165 euros", () => {

    // Créer un objet à partir de notre classe Reservation
    const reservation = new Reservation(
        "2026-11-20",
        "2026-11-23",
        55
    );

    // Appeler la méthode de notre objet
    const prixTotal = reservation.calculerTotal();

    // Vérifier que le résultat est correct
    assert.equal(prixTotal, 165);

});