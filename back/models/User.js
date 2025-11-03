const mongoose = require("mongoose");
const UserSchema = new mongoose.Schema({                // Définition du schéma Mongoose pour les utilisateurs. Cela va structurer les documents de la collection "users" dans MongoDB.
    email: String,
    password: String
});

const User = mongoose.model("User", UserSchema);

module.exports = { User };