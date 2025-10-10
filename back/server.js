require("./db/mongo");        // On importe le fichier mongo.js pour initialiser la connexion à la base de données.

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
    const email = req.body.email;                     // On extrait l'email du corps de la requête.
    const password = req.body.password;               // On extrait le mot de passe du corps de la requête.
    
    const userInDb = users.find((user) => user.email === email); // On vérifie si un utilisateur avec le même email existe déjà dans le tableau des utilisateurs.
    if (userInDb != null) {
        res.status(400).send("Utilisateur déjà existant avec cet email."); // Si un utilisateur avec le même email existe déjà, on renvoie une erreur 400 (Bad Request) au client.
        return;                                                           // On arrête l'exécution de la fonction.
    }
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
    console.log("users in db:", users);

    const userInDb = users.find((user) => user.email === body.email);
    if (userInDb == null) {
        res.status(401).send("Mauvais email");
        return;
    }
    const passwordInDb = userInDb.password;
    if (passwordInDb !== body.password) {
        res.status(401).send("Mauvais mot de passe temporaire");
        return;
    }

// SIMULATION - À remplacer plus tard par la vraie logique
    res.status(200).json({
        userId: "dummyUser123",
        token: "dummyToken456"
    });
}