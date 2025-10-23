require('dotenv').config();                           // Charger les variables d'environnement depuis le fichier .env
const mongoose = require('mongoose');

const DB_URL = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_DOMAIN}`; // Mise en place de l'url pour mongo. "Process.env" vient activer les données mises dans le fichier ".env" et qu'on souhaite ne pas afficher aux yeux du public (à savoir le nom d'utilisateur, le mot de passe et le domaine)
console.log("DB_URL:", DB_URL);

async function connect() {
    try {
        await mongoose.connect(DB_URL);
        console.log("🟢 Connecté à MongoDB !");
    } catch (e) {
        console.error(e);
    }
}
connect();


