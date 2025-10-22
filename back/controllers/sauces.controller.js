const { Sauce } = require("../models/Sauce");         // Importation du modèle Sauce pour interagir avec la collection des sauces dans la base de données MongoDB.
const { sauces } = require("../db/sauces");           // Importation des sauces depuis la base de données simulée (fichier sauces.js).

const express = require("express");
const { upload } = require("../middlewares/multer");

async function postSauces(req, res) {
    const file = req.file;                                      // Récupération du fichier image uploadé. En utilisant 'upload.single("image")', multer traite le fichier envoyé dans le champ 'image' du formulaire multipart/form-data et le rend accessible via 'req.file'.
    const stringifiedSauce = req.body.sauce;                    // Récupération de la chaîne JSON de la sauce depuis le champ 'sauce' du formulaire. On récupère la chaîne JSON de la sauce envoyée dans le champ 'sauce' du formulaire multipart/form-data.
    const sauce = JSON.parse(stringifiedSauce);                 // Conversion de la chaîne JSON en objet JavaScript ce qui nous permet d'accéder aux propriétés de la sauce (name, manufacturer, title etc) et de les manipuler plus facilement. Grace à Parse, il ne s'agit plus d'une simple chaîne de caractères.
    sauce.imageUrl = file.path;                                 // Ajout de l'URL de l'image à l'objet sauce. Cela permet de stocker le chemin de l'image uploadée dans la propriété 'imageUrl' de l'objet sauce.
    try {
        const result = await Sauce.create(sauce);
        res.send({ message: "Sauce ajoutée avec succès !", sauce: result });
    } catch (e) {
        console.error(e);
        res.status(500).send("Erreur serveur lors de l'ajout de la sauce: " + e.message);
    }
}
function getSauces(req, res) {
    res.send(sauces);
}

const saucesRouter = express.Router();
saucesRouter.get("/", getSauces);
saucesRouter.post("/", upload.single("image"), postSauces);    // Utilisation de multer pour gérer l'upload d'une seule image avec le champ 'image' du formulaire. "single" signifie qu'on attend un seul fichier (et non plusieurs).

module.exports = { saucesRouter };