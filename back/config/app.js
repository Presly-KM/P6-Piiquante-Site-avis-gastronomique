const express = require('express');
const cors = require('cors');
const app = express();

const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());      // Middleware pour parser le corps des requêtes en JSON
app.use('/images', express.static('uploads')); // Middleware pour servir les fichiers statiques du dossier 'uploads'

app.listen(PORT, function () {
    console.log(`Server is running on port:${PORT}`);
});

module.exports = { app };