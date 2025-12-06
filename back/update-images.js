require('dotenv').config();
const mongoose = require('mongoose');

// Configuration de connexion
const DB_URL = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_DOMAIN}`;

// Mappage des fichiers locaux vers URLs ImgBB
const imageMapping = {
    '1762206962020-mad-dog-edition-or.jpg': 'https://i.ibb.co/WWqMKfNj/mad-dog-edition-or.jpg',
    'autre-fichier.jpg': 'https://i.ibb.co/yyyyy/autre-image.jpg',
    // Ajoutez toutes vos images ici
};

async function updateImages() {
    try {
        await mongoose.connect(DB_URL);
        console.log('✅ Connecté à MongoDB');

        const Sauce = require('./models/Sauce').Sauce;
        const sauces = await Sauce.find();

        console.log(`📊 ${sauces.length} sauces trouvées`);

        for (const sauce of sauces) {
            const oldUrl = sauce.imageUrl;
            const fileName = oldUrl.split('/').pop(); // Extraire le nom de fichier

            if (imageMapping[fileName]) {
                sauce.imageUrl = imageMapping[fileName];
                await sauce.save();
                console.log(`✅ Mise à jour: ${sauce.name} - ${oldUrl} → ${sauce.imageUrl}`);
            } else {
                console.log(`⚠️  Pas de mapping pour: ${fileName}`);
            }
        }

        console.log('🎉 Migration terminée !');
        process.exit(0);
    } catch (error) {
        console.error('❌ Erreur:', error);
        process.exit(1);
    }
}

updateImages();