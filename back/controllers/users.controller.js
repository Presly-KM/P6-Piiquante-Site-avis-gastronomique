const { User } = require("../models/User");           // Importation du modèle User pour interagir avec la collection des utilisateurs dans la base de données MongoDB.
const bcrypt = require("bcrypt");                     // Importation de la bibliothèque bcrypt pour le hachage des mots de passe.
const express = require("express");
const jwt = require("jsonwebtoken");                 // Importation de la bibliothèque jsonwebtoken pour la gestion des tokens JWT.


async function signUp(req, res) {
    const email = req.body.email;                     // On extrait l'email du corps de la requête.
    const password = req.body.password;               // On extrait le mot de passe du corps de la requête.

    const userInDb = await User.findOne({
        email: email
    });
    if (userInDb != null) {
        res.status(400).send("Utilisateur déjà existant avec cet email."); // Si un utilisateur avec le même email existe déjà, on renvoie une erreur 400 (Bad Request) au client.
        return;                                                            // On arrête l'exécution de la fonction.
    }
    const user = {                                                         // On crée un nouvel objet utilisateur avec l'email et le mot de passe fournis.
        email: email,
        password: hashPassword(password)
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

async function login(req, res) {
    const body = req.body;
    console.log("body:", body);

    const userInDb = await User.findOne({                     // Ici, on cherche dans la base de données un utilisateur avec l'email que l'on a reçu dans le corps de la requête c'est à dire l'email qui a été tapé dans le formulaire de login.
        email: body.email
    });
    if (userInDb == null) {
        res.status(401).send("Mauvais email");
        return;
    }
    const passwordInDb = userInDb.password;
    if (!isPasswordCorrect(req.body.password, passwordInDb)) {    // (!isPasswordCorrect = si le mot de passe ne correspond pas) -> Si le mot de passe entré par l'utilisateur dans le champ de saisie (req.body.password) correspond au mot de passe stocké dans la base de données et qui est hashé (passwordInDb).
        res.status(401).send("Mauvais mot de passe");             // Si le mot de passe ne correspond pas, on renvoie une erreur 401 (Unauthorized) au client.
        return;
    }

    // SIMULATION - À remplacer plus tard par la vraie logique
    res.status(200).json({
        userId: userInDb._id,
        token: generateToken(userInDb._id)
    });
}

function generateToken(idInDb) {                                  // Ici, on génère un token JWT en utilisant en paramètre l'ID de l'utilisateur stocké dans la base de données.
    const payload = {
        userId: idInDb
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {                  // Ici, on signe le token avec une clé secrète "SYLABUS" (à remplacer par une clé plus sécurisée en production) et on définit une durée de validité pour le token.
        expiresIn: "1d"
    });
    return token;
}

function hashPassword(password) {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);
    return hash;
}

function isPasswordCorrect(password, hash) {                    // Ici, on compare le mot de passe fourni avec le mot de passe hashé stocké dans la base de données. 
    return bcrypt.compareSync(password, hash);
}

const usersRouter = express.Router();

usersRouter.post("/signup", signUp);
usersRouter.post("/login", login);


module.exports = { usersRouter };