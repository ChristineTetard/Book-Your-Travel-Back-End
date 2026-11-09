// ======================================================
// BOOK YOUR TRAVEL - PREMIER TEST AUTOMATISÉ
// ======================================================

// Importer le module natif de tests de Node.js
const test = require("node:test");

// Importer le module natif pour effectuer des vérifications
const assert = require("node:assert/strict");

// ========== TEST : VÉRIFIER UNE ADDITION ==========

test("2 + 3 doit être égal à 5", () => {

    // Effectuer une addition
    const resultat = 2 + 3;

    // Vérifier que le résultat est égal à 5
    assert.equal(resultat, 5);
});