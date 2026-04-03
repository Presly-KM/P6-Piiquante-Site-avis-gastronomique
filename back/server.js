require('dotenv').config();                                                         // Charger les variables d'environnement depuis le fichier .env
const { app } = require('./config/app');                                            // Importation de l'application Express depuis le fichier 'app.js'. Ce fichier contient la configuration de l'application, y compris les middlewares, la connexion à la base de données, et les routes statiques. En important 'app', on peut ensuite définir les routes spécifiques de notre application et démarrer le serveur.
const { usersRouter } = require("./controllers/users.controller");                  // Importation du routeur des utilisateurs
const { saucesRouter } = require("./controllers/sauces.controller");                // Importation du routeur des sauces 

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => res.send("Serveur de Piiquante entrain de tourner !"));  // Route de test pour vérifier que le serveur fonctionne

app.use("/api/auth", usersRouter);                                                  // Route pour les opérations d'authentification des utilisateurs. D'abord, on définit le chemin de base "/api/auth" pour toutes les routes liées aux utilisateurs (inscription, connexion, etc.). Ensuite, on utilise le routeur "usersRouter" qui contient les définitions spécifiques de ces routes.
app.use("/api/sauces", saucesRouter);                                               // Route pour les opérations sur les sauces. D'abord, on définit le chemin de base "/api/sauces" pour toutes les routes liées aux sauces (création, modification, suppression, etc.). Ensuite, on utilise le routeur "saucesRouter" qui contient les définitions spécifiques de ces routes.

app.listen(PORT, function () {                                                      // Démarrage du serveur sur le port spécifié. C'est la ligne qui DEMARRE le serveur et le MET EN ECOUTE des requêtes entrantes. (plus haut "app.get" est une simple ligne de code qui permet de tester si le serveur fonctionne)
    console.log(`🟢 Serveur de Piiquante en écoute sur le port:${PORT}`);
});