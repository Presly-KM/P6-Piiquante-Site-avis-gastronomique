const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true     // ✅ EMPÊCHE LES DOUBLONS
    },
    password: {
        type: String,
        required: true   // ✅ OBLIGATOIRE
    }
});

// ✅ Validation supplémentaire pour les emails
UserSchema.path('email').validate(function (email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}, 'Email invalide');


const User = mongoose.model("User", UserSchema);

module.exports = { User };