const http = require("http"); //Importe le module de Node.js

const server = http.createServer((req, res) => { //Crée un serveur HTTP avec une requête reçue et réponse envoyée
    res.end("Bienvenue sur Book Your Travel"); //Envoie notre message au navigateur
});

server.listen(3000); //Démarrer le serveur sur le port 3000

