require('dotenv').config();                                                         // Charger les variables d'environnement depuis le fichier .env
const { app } = require('./config/app');                                            // Importation de l'application Express depuis le fichier 'app.js'
const { usersRouter } = require("./controllers/users.controller");                  // Importation du routeur des utilisateurs
const { saucesRouter } = require("./controllers/sauces.controller");                // Importation du routeur des sauces

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => res.send("Serveur de Piiquante entrain de tourner !"));  // Route de test pour vérifier que le serveur fonctionne

app.use("/api/auth", usersRouter);                                                  // Utilisation du routeur des utilisateurs pour les routes commençant par /api/auth
app.use("/api/sauces", saucesRouter);                                               // Utilisation du routeur des sauces pour les routes commençant par /api/sauces

app.listen(PORT, function () {                                                      // Démarrage du serveur sur le port spécifié. C'est la ligne qui DEMARRE le serveur et le MET EN ECOUTE des requêtes entrantes. (plus haut "app.get" est une simple ligne de code qui permet de tester si le serveur fonctionne)
    console.log(`🟢 Serveur de Piiquante en écoute sur le port:${PORT}`);
});