const express = require('express');
const app = express();
const cors = require('cors');

const PORT = 3000;

app.use(cors());
app.use(express.json());      // Middleware pour parser le corps des requêtes en JSON

function sayHi(req, res) {
    res.send("Hello World!");
}

app.get("/", sayHi);
app.post("/api/auth/signup", signUp)
app.post("/api/auth/login", login);

app.listen(PORT, function() {
    console.log(`Server is running on port:${PORT}`);
});

const users = []; // Ceci est un tableau en mémoire pour stocker les utilisateurs. Dans une vraie application, vous utiliseriez une base de données.

function signUp(req, res) {
    const body = req.body;                            // Ici on récupère le corps de la requête c'est-à-dire les données envoyées par le client. Par exemple, dans une requête POST, le corps peut contenir des informations telles que le nom d'utilisateur, le mot de passe, etc. Express ne parviendra pas a lire le corps de la requête (ex: undefined) sans un middleware comme body-parser ou express.json().
    console.log("body:", body);                       // On affiche le corps de la requête dans la console pour le débogageconst email = req.body.email;                     // On extrait l'email du corps de la requête.
    const email = req.body.email;                     // On extrait l'email du corps de la requête.
    const password = req.body.password;               // On extrait le mot de passe du corps de la requête.
    const user = { 
        email: email, 
        password: password                            // On crée un objet utilisateur avec l'email et le mot de passe.
     };
    users.push(user);                                 // On ajoute l'utilisateur au tableau des utilisateurs.  
    console.log("users:", users);                     // On affiche le tableau des utilisateurs dans la console pour le débogage.
    res.status(201).json({                            // On envoie une réponse JSON au client avec un statut HTTP 201 (Created).
        message: "Inscription réussie !" 
    });
}

function login(req, res) {
    const body = req.body;
    console.log("body:", body);
    if (body.email !== "president@piiquante.com") {
        res.status(401).send("Mauvais identifiants");
        return;
    }
    if (body.password !== "president") {
        res.status(401).send("Mauvais identifiants");
        return;
    }
// SIMULATION - À remplacer plus tard par la vraie logique
    res.status(200).json({
        userId: "dummyUser123",
        token: "dummyToken456"
    });
}