const mongoose = require("mongoose");

const SauceSchema = new mongoose.Schema({                                      // Ici, on définit le schéma Mongoose pour les sauces. Cela va permettre de structurer les documents de la collection "sauces" dans MongoDB.
    userId: String,
    name: String,
    manufacturer: String,
    description: String,
    mainPepper: String,
    imageUrl: String,
    heat: Number,
    likes: { type: Number, default: 0 },                                      // Initialisation des champs likes et dislikes avec une valeur par défaut de 0. Type et Default sont des options de Mongoose pour définir le type de données et la valeur par défaut d'un champ. Cela permet de s'assurer que lorsqu'une nouvelle sauce est créée sans spécifier ces champs (undefined), ils seront automatiquement initialisés à 0.
    dislikes: { type: Number, default: 0 },
    usersLiked: { type: [String], default: [] },
    usersDisliked: { type: [String], default: [] }
});
const Sauce = mongoose.model("Sauce", SauceSchema);

module.exports = { Sauce };