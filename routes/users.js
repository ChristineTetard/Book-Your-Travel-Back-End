// ======================================================
// BOOK YOUR TRAVEL - ROUTES DES UTILISATEURS
// ======================================================

// Importer les fonctions du service des utilisateurs
// Ces fonctions permettent de communiquer avec MySQL
// et de gérer les mots de passe avec bcrypt
const {
    recupererUtilisateurs,
    recupererUtilisateurParId,
    hacherMotDePasse,
    creerUtilisateur,
    rechercherUtilisateurParEmail,
    verifierMotDePasse
} = require("../services/usersService");


// Fonction qui gère les différentes routes des utilisateurs
function usersRoutes(req, res) {


    // ======================================================
    // GET : RÉCUPÉRER TOUS LES UTILISATEURS
    // ======================================================

    if (req.method === "GET" && req.url === "/api/users") {

        // Indiquer que la réponse sera au format JSON
        res.setHeader("Content-Type", "application/json; charset=utf-8");

        // Récupérer la liste des utilisateurs depuis MySQL
        recupererUtilisateurs((err, results) => {

            // Si MySQL rencontre une erreur, renvoyer le code 500
            if (err) {
                res.statusCode = 500;
                return res.end(JSON.stringify({
                    error: "Erreur du serveur"
                }));
            }

            // Envoyer la liste des utilisateurs au format JSON
            res.end(JSON.stringify(results));
        });

        // Indiquer à server.js que cette route a été trouvée
        return true;
    }


    // ======================================================
    // GET : RÉCUPÉRER UN UTILISATEUR PAR SON ID
    // ======================================================

    if (req.method === "GET" && req.url.startsWith("/api/users/")) {

        // Récupérer l'identifiant de l'utilisateur dans l'URL
        // Exemple : /api/users/3
        const parties = req.url.split("/");
        const userId = Number(parties[3]);

        // Indiquer que la réponse sera au format JSON
        res.setHeader("Content-Type", "application/json; charset=utf-8");

        // Vérifier que l'identifiant est un entier positif
        if (!Number.isInteger(userId) || userId <= 0) {
            res.statusCode = 400;
            res.end(JSON.stringify({
                error: "Identifiant invalide"
            }));
            return true;
        }

        // Rechercher l'utilisateur correspondant dans MySQL
        recupererUtilisateurParId(userId, (err, results) => {

            // Gérer une éventuelle erreur MySQL
            if (err) {
                res.statusCode = 500;
                return res.end(JSON.stringify({
                    error: "Erreur du serveur"
                }));
            }

            // Si aucun utilisateur n'est trouvé, renvoyer le code 404
            if (results.length === 0) {
                res.statusCode = 404;
                return res.end(JSON.stringify({
                    error: "Utilisateur introuvable"
                }));
            }

            // Envoyer les informations de l'utilisateur trouvé
            res.end(JSON.stringify(results[0]));
        });

        return true;
    }


    // ======================================================
    // POST : CRÉER UN NOUVEL UTILISATEUR
    // ======================================================

    if (req.method === "POST" && req.url === "/api/users") {

        // Indiquer que la réponse sera au format JSON
        res.setHeader("Content-Type", "application/json; charset=utf-8");

        // Variable qui va contenir les données envoyées
        let body = "";

        // Récupérer les données reçues morceau par morceau
        req.on("data", (chunk) => {
            body += chunk;
        });

        // Attendre que toutes les données soient reçues
        req.on("end", () => {

            // Variable qui contiendra les informations du nouvel utilisateur
            let utilisateur;

            // Transformer le texte JSON reçu en objet JavaScript
            try {
                utilisateur = JSON.parse(body);

            } catch (err) {

                // Si le JSON est incorrect, renvoyer le code 400
                res.statusCode = 400;
                return res.end(JSON.stringify({
                    error: "JSON invalide"
                }));
            }


            // Vérifier que les données reçues sont bien un objet
            // et non une valeur vide ou un tableau
            if (
                !utilisateur ||
                typeof utilisateur !== "object" ||
                Array.isArray(utilisateur)
            ) {
                res.statusCode = 400;
                return res.end(JSON.stringify({
                    error: "Données invalides"
                }));
            }


            // Vérifier que tous les champs obligatoires sont présents
            if (
                !utilisateur.first_name ||
                !utilisateur.last_name ||
                !utilisateur.email ||
                !utilisateur.password
            ) {
                res.statusCode = 400;
                return res.end(JSON.stringify({
                    error: "Tous les champs sont obligatoires"
                }));
            }


            // Vérifier que les champs contiennent bien du texte
            if (
                typeof utilisateur.first_name !== "string" ||
                typeof utilisateur.last_name !== "string" ||
                typeof utilisateur.email !== "string" ||
                typeof utilisateur.password !== "string"
            ) {
                res.statusCode = 400;
                return res.end(JSON.stringify({
                    error: "Les champs doivent contenir du texte"
                }));
            }


            // Vérifier que les champs ne contiennent pas uniquement des espaces
            // La méthode trim() supprime les espaces au début et à la fin
            if (
                !utilisateur.first_name.trim() ||
                !utilisateur.last_name.trim() ||
                !utilisateur.email.trim() ||
                !utilisateur.password.trim()
            ) {
                res.statusCode = 400;
                return res.end(JSON.stringify({
                    error: "Les champs ne peuvent pas être vides"
                }));
            }


            // Vérifier le format général de l'adresse e-mail
            // Exemple attendu : prenom@domaine.com
            const formatEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            // La méthode test() vérifie si l'e-mail respecte ce format
            if (!formatEmail.test(utilisateur.email.trim())) {
                res.statusCode = 400;
                return res.end(JSON.stringify({
                    error: "Adresse e-mail invalide"
                }));
            }


            // Vérifier que le mot de passe contient au moins 8 caractères
            if (utilisateur.password.length < 8) {
                res.statusCode = 400;
                return res.end(JSON.stringify({
                    error: "Le mot de passe doit contenir au moins 8 caractères"
                }));
            }


            // Vérifier si l'adresse e-mail est déjà utilisée dans MySQL
            rechercherUtilisateurParEmail(
                utilisateur.email.trim(),
                (err, results) => {

                    // Gérer une éventuelle erreur MySQL
                    if (err) {
                        res.statusCode = 500;
                        return res.end(JSON.stringify({
                            error: "Erreur lors de la recherche de l'utilisateur"
                        }));
                    }

                    // Si l'e-mail existe déjà, refuser l'inscription
                    if (results.length > 0) {
                        res.statusCode = 409;
                        return res.end(JSON.stringify({
                            error: "Cette adresse e-mail est déjà utilisée"
                        }));
                    }


                    // L'adresse e-mail est disponible
                    // Hacher le mot de passe avant de l'enregistrer
                    hacherMotDePasse(utilisateur.password)

                        // then() récupère le résultat du hachage
                        // lorsque l'opération est terminée
                        .then((passwordHash) => {

                            // Enregistrer le nouvel utilisateur dans MySQL
                            // avec son mot de passe haché
                            creerUtilisateur(
                                utilisateur,
                                passwordHash,
                                (err, result) => {

                                    // Gérer une éventuelle erreur MySQL
                                    if (err) {
                                        res.statusCode = 500;
                                        return res.end(JSON.stringify({
                                            error: "Erreur lors de la création de l'utilisateur"
                                        }));
                                    }

                                    // Code 201 : l'utilisateur a été créé
                                    res.statusCode = 201;

                                    // Envoyer un message et l'identifiant créé
                                    // sans renvoyer le mot de passe
                                    return res.end(JSON.stringify({
                                        message: "Utilisateur créé avec succès",
                                        id: result.insertId
                                    }));
                                }
                            );
                        })

                        // catch() permet de gérer une erreur de hachage
                        .catch((err) => {
                            res.statusCode = 500;
                            return res.end(JSON.stringify({
                                error: "Erreur lors du hachage du mot de passe"
                            }));
                        });
                }
            );
        });

        return true;
    }


    // ======================================================
    // POST : CONNECTER UN UTILISATEUR
    // ======================================================

    if (req.method === "POST" && req.url === "/api/login") {

        // Indiquer que la réponse sera au format JSON
        res.setHeader("Content-Type", "application/json; charset=utf-8");

        // Variable qui va contenir les données de connexion
        let body = "";

        // Récupérer les données envoyées par l'utilisateur
        req.on("data", (chunk) => {
            body += chunk;
        });

        // Attendre la réception complète des données
        req.on("end", () => {

            let utilisateur;

            // Transformer le JSON reçu en objet JavaScript
            try {
                utilisateur = JSON.parse(body);

            } catch (err) {

                // Renvoyer une erreur si le JSON est incorrect
                res.statusCode = 400;
                return res.end(JSON.stringify({
                    error: "JSON invalide"
                }));
            }


            // Vérifier que l'e-mail et le mot de passe sont renseignés
            // et qu'ils contiennent bien du texte
            if (
                !utilisateur ||
                typeof utilisateur.email !== "string" ||
                typeof utilisateur.password !== "string" ||
                !utilisateur.email.trim() ||
                !utilisateur.password.trim()
            ) {
                res.statusCode = 400;
                return res.end(JSON.stringify({
                    error: "E-mail et mot de passe obligatoires"
                }));
            }


            // Rechercher l'utilisateur dans MySQL grâce à son e-mail
            rechercherUtilisateurParEmail(
                utilisateur.email.trim(),
                (err, results) => {

                    // Gérer une éventuelle erreur MySQL
                    if (err) {
                        res.statusCode = 500;
                        return res.end(JSON.stringify({
                            error: "Erreur lors de la recherche de l'utilisateur"
                        }));
                    }

                    // Si aucun utilisateur n'est trouvé,
                    // refuser la connexion
                    if (results.length === 0) {
                        res.statusCode = 401;
                        return res.end(JSON.stringify({
                            error: "E-mail ou mot de passe incorrect"
                        }));
                    }


                    // Récupérer le premier utilisateur trouvé
                    const utilisateurTrouve = results[0];

                    // Comparer le mot de passe saisi
                    // avec le mot de passe haché enregistré dans MySQL
                    verifierMotDePasse(
                        utilisateur.password,
                        utilisateurTrouve.password
                    )

                        // then() récupère le résultat de la comparaison
                        .then((correspond) => {

                            // Si les mots de passe ne correspondent pas,
                            // refuser la connexion
                            if (!correspond) {
                                res.statusCode = 401;
                                return res.end(JSON.stringify({
                                    error: "E-mail ou mot de passe incorrect"
                                }));
                            }


                            // Le mot de passe est correct
                            // Code 200 : la connexion a été vérifiée
                            res.statusCode = 200;

                            // Envoyer les informations de l'utilisateur
                            // sans jamais renvoyer son mot de passe
                            return res.end(JSON.stringify({
                                message: "Connexion réussie",
                                utilisateur: {
                                    id: utilisateurTrouve.id,
                                    first_name: utilisateurTrouve.first_name,
                                    last_name: utilisateurTrouve.last_name,
                                    email: utilisateurTrouve.email,
                                    role: utilisateurTrouve.role
                                }
                            }));
                        })

                        // Gérer une éventuelle erreur pendant la comparaison
                        .catch((err) => {
                            res.statusCode = 500;
                            return res.end(JSON.stringify({
                                error: "Erreur lors de la vérification du mot de passe"
                            }));
                        });
                }
            );
        });

        return true;
    }


    // ======================================================
    // AUCUNE ROUTE CORRESPONDANTE
    // ======================================================

    // Indiquer à server.js que cette route n'a pas été trouvée
    return false;
}


// Exporter la fonction pour pouvoir l'utiliser dans server.js
module.exports = usersRoutes;