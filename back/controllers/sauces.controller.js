const { upload } = require("../middlewares/multer");
const { Sauce } = require("../models/Sauce");                                               // Importation du modèle Sauce pour interagir avec la collection des sauces dans la base de données MongoDB.
const express = require("express");
const jwt = require("jsonwebtoken");                                                        // Importation de la bibliothèque jsonwebtoken pour la gestion des tokens JWT.

const saucesRouter = express.Router();
saucesRouter.get("/:id", getSauceById);
saucesRouter.get("/", getSauces);
saucesRouter.post("/", checkToken, upload.single("image"), postSauces);                     // Utilisation de multer pour gérer l'upload d'une seule image avec le champ 'image' du formulaire. "single" signifie qu'on attend un seul fichier (et non plusieurs).
saucesRouter.delete("/:id", checkToken, deleteSauce);
saucesRouter.put("/:id", checkToken, upload.single("image"), putSauce);                     // Middleware pour vérifier le token JWT avant de permettre la mise à jour d'une sauce.
saucesRouter.post("/:id/like", checkToken, likeSauce);


async function likeSauce(req, res) {
    try {
        // 1. RÉCUPÉRATION DES DONNÉES
        const id = req.params.id;
        const { like, userId } = req.body;                                                  // Récupération de la valeur 'like' et 'userId' depuis le corps de la requête. ex: { like: 1, userId: "user123" }. Avec la déstructuration, on extrait directement les propriétés 'like' et 'userId' de req.body.
        const userIdFromToken = req.tokenPayload.userId;

        console.log("🔍 Like request - Sauce:", id, "Like:", like, "User from body:", userId, "User from token:", userIdFromToken);

        // 2. VALIDATION DES DONNÉES
        if (!id) {                                                                          // Vérification que l'ID de la sauce est présent dans les paramètres de la requête. "!" veut dire "si id n'existe pas"
            return res.status(400).json({ error: "ID de sauce manquant" });
        }

        if (![1, 0, -1].includes(like)) {                                                   // Vérification que la valeur 'like' est valide (1, 0 ou -1). On utilise includes pour vérifier si la valeur de 'like' est dans le tableau [1, 0, -1].
            return res.status(400).json({ error: "Valeur 'like' invalide. Doit être 1, 0 ou -1" });
        }

        if (!userId) {                                                                      // Vérification que l'ID utilisateur est présent dans le corps de la requête.
            return res.status(400).json({ error: "UserId manquant dans le body" });
        }

        // 3. VÉRIFICATION DE COHÉRENCE USERID
        if (userId !== userIdFromToken) {
            return res.status(403).json({ error: "UserId incohérent entre le body et le token" });
        }

        // 4. RÉCUPÉRATION DE LA SAUCE
        const sauce = await Sauce.findById(id);
        if (!sauce) {
            return res.status(404).json({ error: "Sauce non trouvée" });
        }

        console.log("📊 Avant modification - Likes:", sauce.likes, "Dislikes:", sauce.dislikes);
        console.log("👥 UsersLiked:", sauce.usersLiked, "UsersDisliked:", sauce.usersDisliked);

        // 5. LOGIQUE METIER - GESTION DES VOTES
        let message = "";

        // ÉTAT ACTUEL
        const wasLiked = sauce.usersLiked.includes(userId);                                    // Vérification si l'utilisateur a déjà liké la sauce. En effet le ".includes(userId)" vérifie si userId (l'utilisateur actuel qui vient de voter) est déjà dans le tableau usersLiked
        const wasDisliked = sauce.usersDisliked.includes(userId);

        // RETIRER LES VOTES EXISTANTS (pour like = 0 ou changement de vote)
        if (wasLiked) {
            sauce.usersLiked = sauce.usersLiked.filter(id => id !== userId);
            sauce.likes = Math.max(0, sauce.likes - 1);
            console.log("🔻 Like retiré");
        }
        if (wasDisliked) {
            sauce.usersDisliked = sauce.usersDisliked.filter(id => id !== userId);
            sauce.dislikes = Math.max(0, sauce.dislikes - 1);
            console.log("🔻 Dislike retiré");
        }

        // APPLIQUER LE NOUVEAU VOTE
        if (like === 1) {
            if (!wasLiked) { // Éviter les doublons si déjà liké                               // !wasLiked signifie "si pas déjà liké"  OU "si wasLiked est faux"
                sauce.usersLiked.push(userId);                                                 // Ajout de l'utilisateur à la liste des likes
                sauce.likes += 1;
                message = "Sauce likée avec succès";
                console.log("👍 Nouveau like ajouté");
            } else {
                message = "Like déjà présent - retiré";
            }
        } else if (like === -1) {
            if (!wasDisliked) { // Éviter les doublons si déjà disliké
                sauce.usersDisliked.push(userId);
                sauce.dislikes += 1;
                message = "Sauce dislikée avec succès";
                console.log("👎 Nouveau dislike ajouté");
            } else {
                message = "Dislike déjà présent - retiré";
            }
        } else if (like === 0) {
            message = "Vote retiré avec succès";
            console.log("⚪ Vote annulé");
        }

        // 6. SAUVEGARDE ET RÉPONSE
        console.log("📈 Après modification - Likes:", sauce.likes, "Dislikes:", sauce.dislikes);
        console.log("👥 UsersLiked:", sauce.usersLiked, "UsersDisliked:", sauce.usersDisliked);

        await sauce.save();                                                                  // Sauvegarde des modifications dans la base de données.
        console.log("💾 Sauce sauvegardée en base");

        res.status(200).json({                                                               // Envoi de la réponse au client avec le message et les nouveaux compteurs de likes/dislikes./
            message: message,
            likes: sauce.likes,
            dislikes: sauce.dislikes
        });

    } catch (error) {
        console.error("❌ ERREUR CRITIQUE likeSauce:", error);
        console.error("📋 Stack:", error.stack);
        res.status(500).json({
            error: "Erreur serveur lors du traitement du like/dislike",
            details: error.message
        });
    }
}

async function putSauce(req, res) {                                                        // Mise à jour/Modification d'une sauce existante.
    try {
        const id = req.params.id;                                                          // Récupération de l'ID de la sauce depuis les paramètres de la requête.

        // ✅ GESTION DES DEUX CAS : avec et sans image
        let sauceData;
        if (req.body.sauce) {                                                              // req.body.sauce veut dire qu'une nouvelle image a été uploadée avec la sauce. En effet, si une image est uploadée, les autres données de la sauce sont envoyées sous forme de chaîne JSON dans le champ 'sauce' du formulaire multipart/form-data. Tandis que si aucune image n'est uploadée, les données de la sauce sont directement dans req.body.
            sauceData = JSON.parse(req.body.sauce);  // Cas avec image
        } else {
            sauceData = req.body;                    // Cas sans image
        }

        const sauceInDb = await Sauce.findById(id);
        if (sauceInDb == null) {
            res.status(404).send("Sauce non trouvée");
            return;
        }

        const userIdInDb = sauceInDb.userId;
        const userIdInToken = req.tokenPayload.userId;
        if (userIdInDb !== userIdInToken) {
            res.status(403).send("Action non autorisée : Vous ne pouvez pas modifier la sauce d'un autre utilisateur");
            return;
        }

        const newSauce = {};                                                               // Création d'un objet vide pour stocker les nouvelles données de la sauce.
        if (sauceData.name) newSauce.name = sauceData.name;                                // Mise à jour uniquement des champs présents dans la requête.
        if (sauceData.manufacturer) newSauce.manufacturer = sauceData.manufacturer;
        if (sauceData.description) newSauce.description = sauceData.description;
        if (sauceData.mainPepper) newSauce.mainPepper = sauceData.mainPepper;
        if (sauceData.heat !== undefined) newSauce.heat = sauceData.heat;
        if (req.file != null) newSauce.imageUrl = req.file.filename;

        await Sauce.findByIdAndUpdate(id, newSauce);                                       // Mise à jour de la sauce dans la base de données avec les nouvelles données.
        res.send("Sauce mise à jour avec succès");

    } catch (error) {
        console.error("Erreur putSauce:", error);
        res.status(500).send("Erreur serveur: " + error.message);
    }
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
    const file = req.file;                                                               // Récupération du fichier image uploadé. En utilisant 'upload.single("image")', multer traite le fichier envoyé dans le champ 'image' du formulaire multipart/form-data et le rend donc accessible à la fonction postSaucesvia 'req.file'.
    console.log("file:", file);
    const stringifiedSauce = req.body.sauce;                                             // Récupération de la chaîne JSON de la sauce depuis le champ 'sauce' du formulaire. On récupère la chaîne JSON de la sauce envoyée dans le champ 'sauce' du formulaire multipart/form-data.
    const sauce = JSON.parse(stringifiedSauce);                                          // Conversion de la chaîne JSON en objet JavaScript ce qui nous permet d'accéder aux propriétés de la sauce (name, manufacturer, title etc) et de les manipuler plus facilement. Grace à Parse, il ne s'agit plus d'une simple chaîne de caractères.
    const filename = req.file.filename;                                                  // Récupération du nom du fichier image uploadé.
    sauce.imageUrl = filename;                                                           // Construction de l'URL complète de l'image en utilisant le nom du fichier. On assigne à la propriété imageUrl de l'objet sauce le nom du fichier image uploadé.
    try {
        const result = await Sauce.create(sauce);
        res.send({ message: "Sauce ajoutée avec succès !", sauce: result });
    } catch (e) {
        console.error(e);
        res.status(500).send("Erreur serveur lors de l'ajout de la sauce: " + e.message);
    }
}

async function getSauces(req, res) {
    try {
        const sauces = await Sauce.find();
        console.log("sauces:", sauces);
        sauces.forEach((sauce) => {
            sauce.imageUrl = getAbsoluteImagePath(sauce.imageUrl);                         // Conversion des URLs d'images relatives en URLs absolues pour chaque sauce.
        });
        res.send(sauces);
    } catch (e) {
        console.error(e);
        res.status(500).send("Erreur serveur lors de la récupération des sauces: " + e.message);
    }
}

function getAbsoluteImagePath(fileName) {
    // Supprimer le PUBLIC_URL pour utiliser juste le chemin relatif
    return "/" + process.env.IMAGES_PUBLIC_URL + "/" + fileName;
    // ou si vous voulez garder le domaine complet :
    // return process.env.PUBLIC_URL + "/api/" + process.env.IMAGES_PUBLIC_URL + "/" + fileName;
}

function checkToken(req, res, next) {                                                     // Middleware pour vérifier la validité du token JWT.
    const headers = req.headers;
    const authorization = headers.authorization;
    if (authorization == null) {
        res.status(401).send("Non autorisé : token manquant");                            // Apres vérification, si le token est invalide ou absent, une réponse 401 Unauthorized est renvoyée.
        return;
    }
    const token = authorization.split(" ")[1];                                            // Extraction du token JWT de l'en-tête Authorization. Le format attendu est
    try {
        const tokenPayload = jwt.verify(token, process.env.JWT_SECRET);                   // Vérification de la validité du token JWT en utilisant la clé
        console.log("tokenPayload:", tokenPayload);                                       // Extraction de l'ID utilisateur du payload du token et ajout à l'objet req pour une utilisation ultérieure.
        if (tokenPayload == null) {
            res.status(401).send("Non autorisé : token invalide");
            return;
        }
        req.tokenPayload = tokenPayload;                                                  // Pour que les fonction d'aprés puissent y accéder. En effet, les fonctions comme putSauce, deleteSauce et likeSauce ont besoin de savoir quel utilisateur fait la requête afin de vérifier qu'il a le droit de modifier ou supprimer la sauce.  
        next(); // Passe au middleware ou à la route suivante
    } catch (e) {
        console.error(e);
        res.status(401).send("Non autorisé : token invalide");
    }
}

async function getSauceById(req, res) {                                                   // Récupération d'une sauce par son ID.
    const id = req.params.id;
    try {
        const sauce = await Sauce.findById(id);
        if (sauce == null) {
            res.status(404).send("Sauce non trouvée");
            return;
        }
        sauce.imageUrl = getAbsoluteImagePath(sauce.imageUrl);                           // Conversion de l'URL de l'image relative en URL absolue.
        res.send(sauce);
    } catch (e) {
        console.error(e);
        res.status(500).send("Erreur serveur lors de la récupération de la sauce: " + e.message);
    }
}

module.exports = { saucesRouter };