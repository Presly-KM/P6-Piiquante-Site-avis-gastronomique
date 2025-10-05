require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');

const app = express();

// Middleware pour parser le JSON
app.use(express.json());

// Connexion à MongoDB (nous utiliserons une variable d'environnement plus tard)
mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log('✅ Connexion à MongoDB réussie !'))
.catch((error) => console.log('❌ Connexion à MongoDB échouée :', error));

// Middleware pour les headers CORS
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
});

// Route de test
app.get('/api/test', (req, res) => {
  res.status(200).json({ message: 'API HotTakes fonctionne !' });
});

// Démarrage du serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Serveur démarré sur le port ${PORT}`);
  console.log(`📍 Testez avec: http://localhost:${PORT}/api/test`);
});