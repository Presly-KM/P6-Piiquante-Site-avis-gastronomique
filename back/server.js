const express = require('express');
const app = express();
const { User } = require("./db/mongo");            // Importer le modèle User depuis le fichier mongo.js
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



async function signUp(req, res) {
    const email = req.body.email;                     // On extrait l'email du corps de la requête.
    const password = req.body.password;               // On extrait le mot de passe du corps de la requête.
    
    const userInDb = await User.findOne({
        email: email
    });
    console.log("userInDb:", userInDb);
    if (userInDb != null) {
        res.status(400).send("Utilisateur déjà existant avec cet email."); // Si un utilisateur avec le même email existe déjà, on renvoie une erreur 400 (Bad Request) au client.
        return;                                                            // On arrête l'exécution de la fonction.
    }
    const user = {                                                         // On crée un nouvel objet utilisateur avec l'email et le mot de passe fournis.
        email: email, 
        password: password                                                
     };
    try {
      await User.create(user);                                             // On crée un nouvel utilisateur dans la base de données MongoDB. 
    } catch (e) {                                                         // Si une erreur survient lors de la création de l'utilisateur dans la base de données, on la capture.
        console.error(e);
        res.status(500).send("Erreur serveur lors de la création de l'utilisateur.");
        return;
    }
    res.status(201).json({                                               // On renvoie une réponse 201 (Created) au client avec un message de succès.
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