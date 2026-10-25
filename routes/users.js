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
    verifierMotDePasse,
    genererToken,
    genererTokenReinitialisation,
    hacherTokenReinitialisation,
    enregistrerTokenReinitialisation,
    rechercherUtilisateurParToken,
    reinitialiserMotDePasse,
    modifierUtilisateur,
    supprimerUtilisateur
} = require("../services/usersService");

// ======================================================
// IMPORTATION DU MIDDLEWARE D'AUTHENTIFICATION
// ======================================================

// Importer la fonction qui vérifie les tokens JWT
// pour protéger certaines routes de notre API
const verifierToken = require("../middlewares/auth");


// Fonction qui gère les différentes routes des utilisateurs
function usersRoutes(req, res) {


    // ======================================================
    // GET : RÉCUPÉRER TOUS LES UTILISATEURS
    // ======================================================

    if (req.method === "GET" && req.url === "/api/users") {

        // Indiquer que la réponse sera au format JSON
        res.setHeader("Content-Type", "application/json; charset=utf-8");

        // ======================================================
        // VÉRIFIER L'AUTHENTIFICATION DE L'UTILISATEUR
        // ======================================================

        // Vérifier que l'utilisateur possède un token JWT valide
        if (!verifierToken(req, res)) {

            // Arrêter la route si le token est absent ou invalide
            return true;
        }

        // ======================================================
        // VÉRIFIER LE RÔLE ADMINISTRATEUR
        // ======================================================

        // Vérifier que l'utilisateur possède le rôle admin
        if (req.utilisateur.role !== "admin") {

            // Indiquer que la réponse sera au format JSON
            res.setHeader("Content-Type", "application/json; charset=utf-8");

            // Code 403 : l'utilisateur n'a pas les autorisations
            res.statusCode = 403;

            // Envoyer un message d'erreur
            res.end(JSON.stringify({
                error: "Accès réservé aux administrateurs"
            }));

            // Arrêter la route
            return true;
        }

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

    if (req.method === "GET" && /^\/api\/users\/\d+$/.test(req.url)) {

        // ======================================================
        // VÉRIFIER L'AUTHENTIFICATION DE L'UTILISATEUR
        // ======================================================

        // Vérifier que l'utilisateur possède un token JWT valide
        if (!verifierToken(req, res)) {

            // Arrêter la route si le token est absent ou invalide
            return true;
        }

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

        // ======================================================
        // VÉRIFIER LES AUTORISATIONS DE L'UTILISATEUR
        // ======================================================

        // Vérifier si l'utilisateur demande son propre profil
        // ou s'il possède le rôle administrateur
        if (req.utilisateur.id !== userId && req.utilisateur.role !== "admin") {

            // Indiquer que la réponse sera au format JSON
            res.setHeader("Content-Type", "application/json; charset=utf-8");

            // Code 403 : l'utilisateur n'a pas les autorisations
            res.statusCode = 403;

            // Envoyer un message d'erreur
            res.end(JSON.stringify({
                error: "Accès interdit à ce profil"
            }));

            // Arrêter la route
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
                            // Générer un token JWT pour l'utilisateur connecté
                            const token = genererToken(utilisateurTrouve);

                            // Code 200 : la connexion a été vérifiée
                            res.statusCode = 200;

                            // Envoyer le token et les informations de l'utilisateur
                            // sans jamais renvoyer son mot de passe
                            return res.end(JSON.stringify({
                                message: "Connexion réussie",
                                token: token,
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
    // POST : DEMANDER UNE RÉINITIALISATION DE MOT DE PASSE
    // ======================================================

    // Vérifier si la requête correspond à la route
    // de récupération de mot de passe
    if (req.method === "POST" && req.url === "/api/forgot-password") {

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

            // Variable qui contiendra les données reçues
            let donnees;

            // Transformer le texte JSON en objet JavaScript
            try {
                donnees = JSON.parse(body);

            } catch (err) {

                // Renvoyer une erreur si le JSON est incorrect
                res.statusCode = 400;

                return res.end(JSON.stringify({
                    error: "JSON invalide"
                }));
            }

            // Vérifier qu'une adresse e-mail a été envoyée
            if (
                !donnees ||
                typeof donnees.email !== "string" ||
                !donnees.email.trim()
            ) {

                res.statusCode = 400;

                return res.end(JSON.stringify({
                    error: "Adresse e-mail obligatoire"
                }));
            }

            // ======================================================
            // RECHERCHER L'UTILISATEUR DANS MYSQL
            // ======================================================

            // Rechercher l'utilisateur grâce à son adresse e-mail
            rechercherUtilisateurParEmail(donnees.email.trim(), (err, results) => {

                // Gérer une éventuelle erreur MySQL
                if (err) {

                    res.statusCode = 500;

                    return res.end(JSON.stringify({
                        error: "Erreur du serveur"
                    }));
                }

                // Si aucun utilisateur ne correspond à cette adresse
                if (results.length === 0) {

                    // Renvoyer une réponse générale pour ne pas révéler
                    // si une adresse e-mail existe dans notre base de données
                    res.statusCode = 200;

                    return res.end(JSON.stringify({
                        message: "Si cette adresse existe, une procédure de réinitialisation sera envoyée"
                    }));
                }

                // ======================================================
                // GÉNÉRER LE TOKEN DE RÉINITIALISATION
                // ======================================================

                // L'utilisateur a été trouvé dans MySQL
                // Générer un token temporaire et sécurisé
                const token = genererTokenReinitialisation();

                // Hacher le token avant de l'enregistrer dans MySQL
                const tokenHash = hacherTokenReinitialisation(token);

                // Récupérer l'utilisateur trouvé dans MySQL
                const utilisateurTrouve = results[0];

                // Récupérer son identifiant
                const userId = utilisateurTrouve.id;

                // ======================================================
                // DÉFINIR LA DATE D'EXPIRATION DU TOKEN
                // ======================================================

                // Récupérer la date et l'heure actuelles
                const dateExpiration = new Date();

                // Ajouter 15 minutes à la date actuelle
                dateExpiration.setMinutes(dateExpiration.getMinutes() + 15);

                // ======================================================
                // ENREGISTRER LE TOKEN DANS MYSQL
                // ======================================================

                // Enregistrer le token haché et sa date d'expiration
                // pour l'utilisateur concerné
                enregistrerTokenReinitialisation(
                    userId,
                    tokenHash,
                    dateExpiration,
                    (err, result) => {

                        // Gérer une éventuelle erreur MySQL
                        if (err) {

                            res.statusCode = 500;

                            return res.end(JSON.stringify({
                                error: "Erreur du serveur"
                            }));
                        }

                        // Le token a été enregistré dans MySQL
                        // Pour le moment, aucun e-mail n'est envoyé

                        res.statusCode = 200;

                        return res.end(JSON.stringify({
                            message: "Si cette adresse existe, une procédure de réinitialisation sera envoyée"
                        }));
                    }
                );
            });
        });

        // Indiquer que cette route a été traitée
        return true;
    }

    // ======================================================
    // POST : RÉINITIALISER LE MOT DE PASSE
    // ======================================================

    // Vérifier si la requête correspond à la route
    // de réinitialisation du mot de passe
    if (req.method === "POST" && req.url === "/api/reset-password") {

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

            // Variable qui contiendra le token et le nouveau mot de passe
            let donnees;

            // Transformer le texte JSON en objet JavaScript
            try {
                donnees = JSON.parse(body);

            } catch (err) {

                // Renvoyer une erreur si le JSON est incorrect
                res.statusCode = 400;

                return res.end(JSON.stringify({
                    error: "JSON invalide"
                }));
            }

            // Vérifier que le token et le nouveau mot de passe sont présents
            if (
                !donnees ||
                typeof donnees.token !== "string" ||
                typeof donnees.password !== "string" ||
                !donnees.token.trim() ||
                !donnees.password.trim()
            ) {

                res.statusCode = 400;

                return res.end(JSON.stringify({
                    error: "Token et nouveau mot de passe obligatoires"
                }));
            }

            // ======================================================
            // HACHER LE TOKEN DE RÉINITIALISATION
            // ======================================================

            // Récupérer le token envoyé par l'utilisateur
            const token = donnees.token.trim();

            // Hacher le token pour pouvoir le comparer
            // avec celui enregistré dans MySQL
            const tokenHash = hacherTokenReinitialisation(token);

            // ======================================================
            // RECHERCHER LE TOKEN DANS MYSQL
            // ======================================================

            // Rechercher l'utilisateur associé au token haché
            // et vérifier que le token n'a pas expiré
            rechercherUtilisateurParToken(tokenHash, (err, utilisateur) => {

                // Gérer une éventuelle erreur MySQL
                if (err) {

                    res.statusCode = 500;

                    return res.end(JSON.stringify({
                        error: "Erreur du serveur"
                    }));
                }

                // Vérifier si le token existe et s'il est encore valide
                if (!utilisateur) {

                    res.statusCode = 400;

                    return res.end(JSON.stringify({
                        error: "Token invalide ou expiré"
                    }));
                }

                // ======================================================
                // VÉRIFIER LE NOUVEAU MOT DE PASSE
                // ======================================================

                // Vérifier que le nouveau mot de passe contient
                // au moins 8 caractères
                if (donnees.password.length < 8) {

                    res.statusCode = 400;

                    return res.end(JSON.stringify({
                        error: "Le nouveau mot de passe doit contenir au moins 8 caractères"
                    }));
                }

                // ======================================================
                // HACHER LE NOUVEAU MOT DE PASSE
                // ======================================================

                // Hacher le nouveau mot de passe avant de l'enregistrer
                // dans la base de données MySQL
                hacherMotDePasse(donnees.password)

                    // then() récupère le mot de passe haché
                    // lorsque l'opération est terminée
                    .then((nouveauMotDePasseHash) => {

                        // ======================================================
                        // ENREGISTRER LE NOUVEAU MOT DE PASSE DANS MYSQL
                        // ======================================================

                        // Modifier le mot de passe de l'utilisateur
                        // et supprimer le token de réinitialisation utilisé
                        reinitialiserMotDePasse(
                            utilisateur.id,
                            tokenHash,
                            nouveauMotDePasseHash,
                            (err, result) => {

                                // Gérer une éventuelle erreur MySQL
                                if (err) {

                                    res.statusCode = 500;

                                    return res.end(JSON.stringify({
                                        error: "Erreur du serveur"
                                    }));
                                }

                                // Vérifier que le mot de passe a bien été modifié
                                if (result.affectedRows === 0) {

                                    res.statusCode = 400;

                                    return res.end(JSON.stringify({
                                        error: "Token invalide ou expiré"
                                    }));
                                }

                                // Confirmer la réinitialisation du mot de passe
                                res.statusCode = 200;

                                return res.end(JSON.stringify({
                                    message: "Mot de passe réinitialisé avec succès"
                                }));
                            }
                        );
                    })

                    // Gérer une éventuelle erreur pendant le hachage
                    .catch((err) => {

                        res.statusCode = 500;

                        return res.end(JSON.stringify({
                            error: "Erreur lors du hachage du mot de passe"
                        }));
                    });
            });
        });

        // Indiquer que cette route a été traitée
        return true;
    }

    // ======================================================
    // PUT : MODIFIER LE PROFIL D'UN UTILISATEUR
    // ======================================================

    // Cette route permet de modifier le prénom, le nom
    // et l'adresse e-mail d'un utilisateur existant.
    // Elle vérifie les données reçues avant de les
    // enregistrer dans MySQL.

    if (req.method === "PUT" && /^\/api\/users\/\d+$/.test(req.url)) {

        // ======================================================
        // VÉRIFIER L'AUTHENTIFICATION DE L'UTILISATEUR
        // ======================================================

        // Vérifier que l'utilisateur possède un token JWT valide
        if (!verifierToken(req, res)) {

            // Arrêter la route si le token est absent ou invalide
            return true;
        }

        // Récupérer l'identifiant de l'utilisateur dans l'URL
        // Exemple : /api/users/3
        const parties = req.url.split("/");
        const userId = Number(parties[3]);

        // Indiquer que la réponse sera au format JSON
        res.setHeader("Content-Type", "application/json; charset=utf-8");

        // Vérifier que l'identifiant est un entier positif
        if (!Number.isSafeInteger(userId) || userId <= 0) {
            res.statusCode = 400;
            res.end(JSON.stringify({
                error: "Identifiant invalide"
            }));
            return true;
        }

        // ======================================================
        // VÉRIFIER LES AUTORISATIONS DE L'UTILISATEUR
        // ======================================================

        // Vérifier si l'utilisateur modifie son propre profil
        // ou s'il possède le rôle administrateur
        if (req.utilisateur.id !== userId && req.utilisateur.role !== "admin") {

            // Indiquer que la réponse sera au format JSON
            res.setHeader("Content-Type", "application/json; charset=utf-8");

            // Code 403 : l'utilisateur n'a pas les autorisations
            res.statusCode = 403;

            // Envoyer un message d'erreur
            res.end(JSON.stringify({
                error: "Modification interdite pour ce profil"
            }));

            // Arrêter la route
            return true;
        }

        // Variable qui va contenir les données envoyées
        let body = "";

        // Récupérer les données reçues morceau par morceau
        req.on("data", (chunk) => {
            body += chunk;
        });

        // Attendre que toutes les données soient reçues
        req.on("end", () => {

            let utilisateur;

            // Transformer le JSON reçu en objet JavaScript
            try {
                utilisateur = JSON.parse(body);

            } catch (err) {
                res.statusCode = 400;

                return res.end(JSON.stringify({
                    error: "JSON invalide"
                }));
            }

            // Vérifier que les données reçues sont bien un objet
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
                !utilisateur.email
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
                typeof utilisateur.email !== "string"
            ) {
                res.statusCode = 400;

                return res.end(JSON.stringify({
                    error: "Les champs doivent contenir du texte"
                }));
            }

            // Supprimer les espaces inutiles
            utilisateur.first_name = utilisateur.first_name.trim();
            utilisateur.last_name = utilisateur.last_name.trim();
            utilisateur.email = utilisateur.email.trim();

            // Vérifier que les champs ne sont pas vides
            if (
                !utilisateur.first_name ||
                !utilisateur.last_name ||
                !utilisateur.email
            ) {
                res.statusCode = 400;

                return res.end(JSON.stringify({
                    error: "Les champs ne peuvent pas être vides"
                }));
            }

            // Vérifier le format de l'adresse e-mail
            const formatEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (!formatEmail.test(utilisateur.email)) {
                res.statusCode = 400;

                return res.end(JSON.stringify({
                    error: "Adresse e-mail invalide"
                }));
            }

            // Vérifier si l'adresse e-mail est déjà utilisée
            rechercherUtilisateurParEmail(utilisateur.email, (err, results) => {

                // Gérer une éventuelle erreur MySQL
                if (err) {
                    res.statusCode = 500;

                    return res.end(JSON.stringify({
                        error: "Erreur lors de la vérification de l'e-mail"
                    }));
                }

                // Vérifier si l'e-mail appartient à un autre utilisateur
                if (results.length > 0 && results[0].id !== userId) {
                    res.statusCode = 409;

                    return res.end(JSON.stringify({
                        error: "Cette adresse e-mail est déjà utilisée"
                    }));
                }

                // Modifier les informations de l'utilisateur dans MySQL
                modifierUtilisateur(userId, utilisateur, (err, result) => {

                    // Gérer une éventuelle erreur MySQL
                    if (err) {

                        // L'adresse e-mail peut aussi être refusée
                        // par la contrainte UNIQUE de MySQL
                        if (err.code === "ER_DUP_ENTRY") {
                            res.statusCode = 409;

                            return res.end(JSON.stringify({
                                error: "Cette adresse e-mail est déjà utilisée"
                            }));
                        }

                        res.statusCode = 500;

                        return res.end(JSON.stringify({
                            error: "Erreur lors de la modification de l'utilisateur"
                        }));
                    }

                    // Vérifier si l'utilisateur existe dans MySQL
                    if (result.affectedRows === 0) {
                        res.statusCode = 404;

                        return res.end(JSON.stringify({
                            error: "Utilisateur introuvable"
                        }));
                    }

                    // La modification a réussi
                    res.statusCode = 200;

                    return res.end(JSON.stringify({
                        message: "Utilisateur modifié avec succès"
                    }));
                });
            });
        });

        return true;
    }

    // ======================================================
    // DELETE : SUPPRIMER UN UTILISATEUR
    // ======================================================

    // Cette route permet à un administrateur de supprimer
    // un utilisateur de la base de données grâce à son identifiant.
    // Elle vérifie le token JWT, le rôle administrateur,
    // la validité de l'identifiant et le résultat de la suppression.

    if (req.method === "DELETE" && /^\/api\/users\/\d+$/.test(req.url)) {

        // ======================================================
        // VÉRIFIER L'AUTHENTIFICATION DE L'UTILISATEUR
        // ======================================================

        // Vérifier que l'utilisateur possède un token JWT valide
        if (!verifierToken(req, res)) {

            // Arrêter la route si le token est absent ou invalide
            return true;
        }

        // ======================================================
        // VÉRIFIER LES AUTORISATIONS DE L'UTILISATEUR
        // ======================================================

        // Vérifier que l'utilisateur possède le rôle administrateur
        if (req.utilisateur.role !== "admin") {

            // Indiquer que la réponse sera au format JSON
            res.setHeader("Content-Type", "application/json; charset=utf-8");

            // Code 403 : accès interdit
            res.statusCode = 403;

            // Envoyer un message d'erreur
            res.end(JSON.stringify({
                error: "Suppression réservée aux administrateurs"
            }));

            // Arrêter la route
            return true;
        }

        // Récupérer l'identifiant dans l'URL
        const parties = req.url.split("/");
        const userId = Number(parties[3]);

        // Indiquer que la réponse sera au format JSON
        res.setHeader("Content-Type", "application/json; charset=utf-8");

        // Vérifier que l'identifiant est valide
        if (!Number.isSafeInteger(userId) || userId <= 0) {
            res.statusCode = 400;

            res.end(JSON.stringify({
                error: "Identifiant invalide"
            }));

            return true;
        }

        // Supprimer l'utilisateur dans MySQL
        supprimerUtilisateur(userId, (err, result) => {

            // Gérer une éventuelle erreur MySQL
            if (err) {
                res.statusCode = 500;

                return res.end(JSON.stringify({
                    error: "Erreur lors de la suppression de l'utilisateur"
                }));
            }

            // Vérifier si l'utilisateur existait
            if (result.affectedRows === 0) {
                res.statusCode = 404;

                return res.end(JSON.stringify({
                    error: "Utilisateur introuvable"
                }));
            }

            // Confirmer la suppression
            res.statusCode = 200;

            return res.end(JSON.stringify({
                message: "Utilisateur supprimé avec succès"
            }));
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