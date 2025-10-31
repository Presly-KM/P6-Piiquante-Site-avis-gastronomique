require('dotenv').config();                           // Charger les variables d'environnement depuis le fichier .env
const { app } = require('./config/app');        // Importation de l'application Express depuis le fichier 'app.js'
const { usersRouter } = require("./controllers/users.controller");
const { saucesRouter } = require("./controllers/sauces.controller");

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => res.send("Serveur de Piiquante entrain de tourner !"));

app.use("/api/auth", usersRouter);
app.use("/api/sauces", saucesRouter);

app.listen(PORT, function () {
    console.log(`🟢 Serveur de Piiquante en écoute sur le port:${PORT}`);
});