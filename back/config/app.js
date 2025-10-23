const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());      // Middleware pour parser le corps des requêtes en JSON
app.use('/images', express.static('images'));  //✅ CORRECTION (choisissez une option) : 'uploads' au lieu de 'images'. Middleware pour servir les fichiers statiques du dossier 'images'  

module.exports = { app };