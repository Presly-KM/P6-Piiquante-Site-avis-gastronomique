const express = require('express');
const cors = require('cors');
const app = express();
require("./../db/mongo.js");                  // Connexion à la base de données MongoDB

app.use(cors());
app.use(express.json());      // Middleware pour parser le corps des requêtes en JSON
app.use('/' + process.env.IMAGES_FOLDER_PATH, express.static(process.env.IMAGES_FOLDER));  //✅ CORRECTION (choisissez une option) : 'uploads' au lieu de 'images'. Middleware pour servir les fichiers statiques du dossier 'images'  

module.exports = { app };