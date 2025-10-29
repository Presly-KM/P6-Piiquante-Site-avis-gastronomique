const { upload } = require("../middlewares/multer");
const { Sauce } = require("../models/Sauce");         // Importation du modèle Sauce pour interagir avec la collection des sauces dans la base de données MongoDB.
const express = require("express");
const jwt = require("jsonwebtoken");                 // Importation de la bibliothèque jsonwebtoken pour la gestion des tokens JWT.

const saucesRouter = express.Router();
saucesRouter.get("/:id", getSauceById);
saucesRouter.get("/", getSauces);
saucesRouter.post("/", checkToken, upload.single("image"), postSauces);    // Utilisation de multer pour gérer l'upload d'une seule image avec le champ 'image' du formulaire. "single" signifie qu'on attend un seul fichier (et non plusieurs).
saucesRouter.delete("/:id", checkToken, deleteSauce);
saucesRouter.put("/:id", checkToken, upload.single("image"), putSauce); // Middleware pour vérifier le token JWT avant de permettre la mise à jour d'une sauce.
saucesRouter.post("/:id/like", checkToken, likeSauce);


async function likeSauce(req, res) {
    try {
        const id = req.params.id;
        const { like, userId } = req.body;  // like: 1, 0 ou -1

        console.log("🔍 Like request - Sauce:", id, "Like:", like, "User:", userId);

        // Validation du like
        if (![1, 0, -1].includes(like)) {
            return res.status(400).json({ error: "La valeur 'like' doit être 1, 0 ou -1" });
        }

        const sauce = await Sauce.findById(id);
        if (!sauce) {                                                // Si la sauce n'existe pas. Ici le ! signifie "non"
            return res.status(404).json({ error: "Sauce non trouvée" });
        }

        // Vérification que l'userId est fourni
        if (!userId) {
            return res.status(400).json({ error: "UserId manquant" });
        }

        // Récupération depuis le token (plus sécurisé que le body)
        const userIdFromToken = req.tokenPayload.userId;

        // Vérification cohérence userId
        if (userId !== userIdFromToken) {
            return res.status(403).json({ error: "UserId incohérent" });
        }

        console.log("📊 Avant modification - Likes:", sauce.likes, "Dislikes:", sauce.dislikes);
        console.log("👥 UsersLiked:", sauce.usersLiked, "UsersDisliked:", sauce.usersDisliked);

        // Suppression des votes existants
        const wasLiked = sauce.usersLiked.includes(userId);
        const wasDisliked = sauce.usersDisliked.includes(userId);

        if (wasLiked) {
            sauce.usersLiked = sauce.usersLiked.filter(id => id !== userId);
            sauce.likes = Math.max(0, sauce.likes - 1);
        }
        if (wasDisliked) {
            sauce.usersDisliked = sauce.usersDisliked.filter(id => id !== userId);
            sauce.dislikes = Math.max(0, sauce.dislikes - 1);
        }

        // Application du nouveau vote
        if (like === 1) {
            sauce.usersLiked.push(userId);
            sauce.likes += 1;
        } else if (like === -1) {
            sauce.usersDisliked.push(userId);
            sauce.dislikes += 1;
        }

        console.log("📈 Après modification - Likes:", sauce.likes, "Dislikes:", sauce.dislikes);
        console.log("👥 UsersLiked:", sauce.usersLiked, "UsersDisliked:", sauce.usersDisliked);

        await sauce.save();

        res.status(200).json({
            message: "Like/dislike mis à jour avec succès",
            likes: sauce.likes,
            dislikes: sauce.dislikes
        });

    } catch (error) {
        console.error("❌ Erreur likeSauce:", error);
        res.status(500).json({ error: "Erreur serveur: " + error.message });
    }
}

async function putSauce(req, res) {
    const id = req.params.id;
    const sauce = JSON.parse(req.body.sauce);

    const sauceInDb = await Sauce.findById(id);
    if (sauceInDb == null) {
        res.status(404).send("Sauce non trouvée");
        return;
    }
    const userIdInDb = sauceInDb.userId;
    const userIdInToken = req.tokenPayload.userId;
    if (userIdInDb !== userIdInToken) {
        res.status(403).send("Action non autorisée : vous ne pouvez pas supprimer la sauce d'un autre utilisateur");
        return;
    }

    const newSauce = {}
    if (sauce.title) newSauce.title = sauce.title;
    if (sauce.manufacturer) newSauce.manufacturer = sauce.manufacturer;
    if (sauce.description) newSauce.description = sauce.description;
    if (sauce.mainPepper) newSauce.mainPepper = sauce.mainPepper;
    if (req.file != null) newSauce.imageUrl = req.file.filename;

    await Sauce.findByIdAndUpdate(id, newSauce);
    res.send("Sauce mise à jour avec succès");
}

async function deleteSauce(req, res) {
    const id = req.params.id;
    try {
        console.log("Suppression de la sauce avec l'id :", id);
        const sauceInDb = await Sauce.findById(id);
        if (sauceInDb == null) {
            res.status(404).send("Sauce non trouvée");
            return;
        }
        const userIdInDb = sauceInDb.userId;
        const userIdInToken = req.tokenPayload.userId;
        if (userIdInDb !== userIdInToken) {
            res.status(403).send("Action non autorisée : vous ne pouvez pas supprimer la sauce d'un autre utilisateur");
            return;
        }
        await Sauce.findByIdAndDelete(id);
        res.send("Sauce supprimée avec succès");
    } catch (e) {
        console.error(e);
        res.status(500).send("Erreur serveur lors de la suppression de la sauce: " + e.message);
    }
}



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

function checkToken(req, res, next) {                                      // Middleware pour vérifier la validité du token JWT.
    const headers = req.headers;
    const authorization = headers.authorization;
    if (authorization == null) {
        res.status(401).send("Non autorisé : token manquant");             // Apres vérification, si le token est invalide ou absent, une réponse 401 Unauthorized est renvoyée.
        return;
    }
    const token = authorization.split(" ")[1];                               // Extraction du token JWT de l'en-tête Authorization. Le format attendu est
    try {
        const tokenPayload = jwt.verify(token, process.env.JWT_SECRET);    // Vérification de la validité du token JWT en utilisant la clé
        console.log("tokenPayload:", tokenPayload);                                   // Extraction de l'ID utilisateur du payload du token et ajout à l'objet req pour une utilisation ultérieure.
        if (tokenPayload == null) {
            res.status(401).send("Non autorisé : token invalide");
            return;
        }
        req.tokenPayload = tokenPayload
        next(); // Passe au middleware ou à la route suivante
    } catch (e) {
        console.error(e);
        res.status(401).send("Non autorisé : token invalide");
    }
}

async function getSauceById(req, res) {                                           // Récupération d'une sauce par son ID.
    const id = req.params.id;
    try {
        const sauce = await Sauce.findById(id);
        if (sauce == null) {
            res.status(404).send("Sauce non trouvée");
            return;
        }
        sauce.imageUrl = getAbsoluteImagePath(sauce.imageUrl);
        res.send(sauce);
    } catch (e) {
        console.error(e);
        res.status(500).send("Erreur serveur lors de la récupération de la sauce: " + e.message);
    }
}

module.exports = { saucesRouter };