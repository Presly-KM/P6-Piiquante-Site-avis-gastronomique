const express = require('express');                                                       // Importation d'Express pour créer l'application web. Express est un framework web pour Node.js qui facilite la gestion des requêtes HTTP, le routage, les middlewares, etc.
const cors = require('cors');                                                             // Importation de CORS pour gérer les requêtes cross-origin. C'est à dire des requêtes provenant d'un domaine différent de celui du serveur. Ainsi, on peut autoriser ou restreindre l'accès aux ressources du serveur en fonction de l'origine des requêtes.
const app = express();
require("./../db/mongo.js");                                                              // Connexion à la base de données MongoDB

app.use(cors());
app.use(express.json());                                                                  // Middleware pour parser le corps des requêtes en JSON
app.use('/' + process.env.IMAGES_PUBLIC_URL, express.static(process.env.IMAGES_FOLDER));  //✅ CORRECTION (choisissez une option) : 'uploads' au lieu de 'images'. Middleware pour servir les fichiers statiques du dossier 'images'  

module.exports = { app };