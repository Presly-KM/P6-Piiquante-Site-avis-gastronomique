const { app } = require('./config/app');        // Importation de l'application Express depuis le fichier 'app.js'
const { usersRouter } = require("./controllers/users.controller");
const { saucesRouter } = require("./controllers/sauces.controller");
require('./db/mongo');                          // Connexion à la base de données MongoDB

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => res.send("Serveur de Piiquante entrain de tourner !"));

app.use("/api/auth", usersRouter);
app.use("/api/sauces", saucesRouter);

app.listen(PORT, function () {
    console.log(`Server is running on port:${PORT}`);
});