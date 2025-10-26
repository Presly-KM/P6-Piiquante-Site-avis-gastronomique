const { upload } = require("../middlewares/multer");
const { Sauce } = require("../models/Sauce");         // Importation du modèle Sauce pour interagir avec la collection des sauces dans la base de données MongoDB.
const express = require("express");
const jwt = require("jsonwebtoken");                 // Importation de la bibliothèque jsonwebtoken pour la gestion des tokens JWT.

async function postSauces(req, res) {
    const file = req.file;                                      // Récupération du fichier image uploadé. En utilisant 'upload.single("image")', multer traite le fichier envoyé dans le champ 'image' du formulaire multipart/form-data et le rend donc accessible à la fonction postSaucesvia 'req.file'.
    console.log("file:", file);
    const stringifiedSauce = req.body.sauce;                    // Récupération de la chaîne JSON de la sauce depuis le champ 'sauce' du formulaire. On récupère la chaîne JSON de la sauce envoyée dans le champ 'sauce' du formulaire multipart/form-data.
    const sauce = JSON.parse(stringifiedSauce);                 // Conversion de la chaîne JSON en objet JavaScript ce qui nous permet d'accéder aux propriétés de la sauce (name, manufacturer, title etc) et de les manipuler plus facilement. Grace à Parse, il ne s'agit plus d'une simple chaîne de caractères.
    const filename = req.file.filename;                         // Récupération du nom du fichier image uploadé.
    sauce.imageUrl = filename;                                  // Construction de l'URL complète de l'image en utilisant le nom du fichier. On assigne à la propriété imageUrl de l'objet sauce le nom du fichier image uploadé.
    try {
        const result = await Sauce.create(sauce);
        res.send({ message: "Sauce ajoutée avec succès !", sauce: result });
    } catch (e) {
        console.error(e);
        res.status(500).send("Erreur serveur lors de l'ajout de la sauce: " + e.message);
    }
}

async function getSauces(req, res) {
    const sauces = await Sauce.find();
    console.log("sauces:", sauces);
    sauces.forEach((sauce) => {
        sauce.imageUrl = getAbsoluteImagePath(sauce.imageUrl);  // Construction de l'URL complète de l'image pour chaque sauce en utilisant le nom du fichier stocké dans la base de données.
    });
    res.send(sauces);
}

function getAbsoluteImagePath(fileName) {
    return process.env.PUBLIC_URL + "/" + process.env.IMAGES_FOLDER_PATH + "/" + fileName;
}

const saucesRouter = express.Router();
saucesRouter.get("/:id", getSauceById);
saucesRouter.get("/", getSauces);
saucesRouter.post("/", checkToken, upload.single("image"), postSauces);    // Utilisation de multer pour gérer l'upload d'une seule image avec le champ 'image' du formulaire. "single" signifie qu'on attend un seul fichier (et non plusieurs).

function checkToken(req, res, next) {                                      // Middleware pour vérifier la validité du token JWT.
    const headers = req.headers;
    const authorization = headers.authorization;
    if (!authorization == null) {
        res.status(401).send("Non autorisé : token manquant");
        return;
    }
    const token = authorization.split(" ")[1];                               // Extraction du token JWT de l'en-tête Authorization. Le format attendu est
    try {
        const tokenPayload = jwt.verify(token, process.env.JWT_SECRET);                             // Vérification de la validité du token JWT en utilisant la clé
        console.log("tokenPayload:", tokenPayload);
        next(); // Passe au middleware ou à la route suivante
    } catch (e) {
        console.error(e);
        res.status(401).send("Non autorisé : token invalide");
    }
}

async function getSauceById(req, res) {            // ATTENTION TEMPORAIRE AVANT CHECK DE SE QU'A FAIT BENJ (sans prévenir --')
    id = req.params.id;
    try {
        const sauce = await Sauce.findById(id);
        sauce.imageUrl = getAbsoluteImagePath(sauce.imageUrl);
        res.send(sauce);
    } catch (e) {
        console.error(e);
        res.status(500).send("Erreur serveur lors de la récupération de la sauce: " + e.message);
    }
}

module.exports = { saucesRouter };