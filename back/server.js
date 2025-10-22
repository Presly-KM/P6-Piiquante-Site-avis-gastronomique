const { app } = require('./config/app');        // Importation de l'application Express depuis le fichier 'app.js'
const { usersRouter } = require("./controllers/users.controller");
const { saucesRouter } = require("./controllers/sauces.controller");

app.get("/", (req, res) => res.send("Serveur de Piiquante entrain de tourner !"));


app.use("/api/auth", usersRouter);
app.use("/api/sauces", saucesRouter);

