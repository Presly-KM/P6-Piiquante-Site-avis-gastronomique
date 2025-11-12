const { User } = require("../models/User");           // Importation du modèle User pour interagir avec la collection des utilisateurs dans la base de données MongoDB.
const bcrypt = require("bcrypt");                     // Importation de la bibliothèque bcrypt pour le hachage des mots de passe.
const express = require("express");
const jwt = require("jsonwebtoken");                  // Importation de la bibliothèque jsonwebtoken pour la gestion des tokens JWT.

const usersRouter = express.Router();                 // Création d'un routeur Express pour gérer les routes liées aux utilisateurs.
usersRouter.post("/signup", signUp);
usersRouter.post("/login", login);

async function signUp(req, res) {                                              // Fonction asynchrone pour gérer l'inscription des utilisateurs.
    try {
        const userInDb = await User.findOne({                                  // Ici, on cherche dans la base de données un utilisateur avec l'email que l'on a reçu dans le corps de la requête (req.body.email) c'est à dire l'email qui a été tapé dans le formulaire d'inscription.
            email: req.body.email
        });
        if (userInDb != null) {
            res.status(400).send("Utilisateur déjà existant avec cet email."); // Si un utilisateur avec le même email existe déjà, on renvoie une erreur 400 (Bad Request) au client. Gestion 1 = Évite 99% des cas (meilleure expérience utilisateur) (cf gestion 2 ci-dessous)
            return;                                                            // On arrête l'exécution de la fonction.
        } else {

            await User.create({                                                // Si l'email n'existe pas encore dans la base de données, on crée un nouvel utilisateur avec l'email et le mot de passe hashé.
                email: req.body.email,
                password: hashPassword(req.body.password)
            });

            res.status(201).json({ message: "Compte créé" });
        }
    } catch (error) {
        if (error.code === 11000) {                                            // Code d'erreur MongoDB pour les doublons (duplicate key error)
            return res.status(400).json({ error: "Utilisateur déjà existant avec cet email." });      // Gestion 2 = En cas de tentative de contournement de la gestion 1 (cf ci-dessus) --> Gestion 2 = Gère les 1% restants (race conditions)
        }
        res.status(500).json({ error: "Erreur serveur" });
    }
}

async function login(req, res) {
    const body = req.body;
    console.log("body:", body);
    try {
        const userInDb = await User.findOne({                                  // Ici, on cherche dans la base de données un utilisateur avec l'email que l'on a reçu dans le corps de la requête c'est à dire l'email qui a été tapé dans le formulaire de login.
            email: body.email
        });
        if (userInDb == null) {
            res.status(401).send("Mauvais email");
            return;
        }
        const passwordInDb = userInDb.password;
        if (!isPasswordCorrect(req.body.password, passwordInDb)) {             // (!isPasswordCorrect = si le mot de passe ne correspond pas) -> Si le mot de passe entré par l'utilisateur dans le champ de saisie (req.body.password) correspond au mot de passe stocké dans la base de données et qui est hashé (passwordInDb).
            res.status(401).send("Mauvais mot de passe");                      // Si le mot de passe ne correspond pas, on renvoie une erreur 401 (Unauthorized) au client.
            return;
        }

        // SIMULATION - À remplacer plus tard par la vraie logique
        res.status(200).json({
            userId: userInDb._id,
            token: generateToken(userInDb._id)
        });
    } catch (e) {
        console.error(e);
        res.status(500).send("Erreur serveur lors de la connexion de l'utilisateur.");
    }
}

function generateToken(idInDb) {                                      // Ici, on génère un token JWT en utilisant en paramètre l'ID de l'utilisateur stocké dans la base de données.
    const payload = {
        userId: idInDb
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {         // Ici, on signe le token avec une clé secrète "SYLABUS" (à remplacer par une clé plus sécurisée en production) et on définit une durée de validité pour le token.
        expiresIn: "1d"
    });
    return token;
}

function hashPassword(password) {                                     // Ici, on hash le mot de passe en utilisant bcrypt avant de le stocker dans la base de données.
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);
    return hash;
}

function isPasswordCorrect(password, hash) {                         // Ici, on compare le mot de passe fourni avec le mot de passe hashé stocké dans la base de données. 
    return bcrypt.compareSync(password, hash);
}



module.exports = { usersRouter };