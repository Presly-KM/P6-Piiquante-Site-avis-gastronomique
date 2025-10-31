const multer = require('multer');                  // Importation du middleware multer pour destiné à gérer fichiers entrants (images)  

const storage = multer.diskStorage({                // Configuration du stockage des fichiers uploadés (cf modele sur le site de multer)
    destination: function (req, file, cb) {
        cb(null, process.env.IMAGES_FOLDER);                       // Dossier de destination
    },
    filename: function (req, file, cb) {
        const fileName = file.originalname.toLowerCase().split(' ').join('-'); // Nom du fichier en minuscule et sans espaces
        cb(null, Date.now() + '-' + fileName); // Nom du fichier
    }
});
const upload = multer({                            // Initialisation de multer avec la configuration de stockage définie ci-dessus
    storage: storage
});

module.exports = { upload };                      // upload va être utilisé dans les routes pour gérer les uploads d'images. Ainsi, lorsqu'une image est uploadée via une requête HTTP, multer va s'occuper de la réception du fichier, de son stockage dans le dossier spécifié, et de la gestion des noms de fichiers pour éviter les conflits.