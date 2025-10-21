const express = require('express');
const app = express();
const { User, Sauce } = require("./db/mongo");            // Importer le modèle User depuis le fichier mongo.js
const cors = require('cors');
const bcrypt = require('bcrypt');
const { sauces } = require("./db/sauces");
const multer = require('multer');                  // Importation du middleware multer pour destiné à gérer fichiers entrants (images)

const storage = multer.diskStorage({                // Configuration du stockage des fichiers uploadés (cf modele sur le site de multer)
    destination: function (req, file, cb) {
        cb(null, 'uploads');                       // Dossier de destination
    },
    filename: function (req, file, cb) {
        const fileName = file.originalname.toLowerCase().split(' ').join('-'); // Nom du fichier en minuscule et sans espaces
        cb(null, Date.now() + '-' + fileName); // Nom du fichier
    }
});
const upload = multer({                            // Initialisation de multer avec la configuration de stockage définie ci-dessus
    storage: storage
});

const PORT = 3000;

app.use(cors());
app.use(express.json());      // Middleware pour parser le corps des requêtes en JSON
app.use('/images', express.static('uploads')); // Middleware pour servir les fichiers statiques du dossier 'uploads'

function sayHi(req, res) {
    res.send("Hello World!");
}

app.get("/", sayHi);
app.post("/api/auth/signup", signUp)
app.post("/api/auth/login", login);
app.get("/api/sauces", getSauces);
app.post("/api/sauces", upload.single("image"), postSauces);    // Utilisation de multer pour gérer l'upload d'une seule image avec le champ 'image' du formulaire. "single" signifie qu'on attend un seul fichier (et non plusieurs).

async function postSauces(req, res) {
    const file = req.file;                                      // Récupération du fichier image uploadé. En utilisant 'upload.single("image")', multer traite le fichier envoyé dans le champ 'image' du formulaire multipart/form-data et le rend accessible via 'req.file'.
    console.log("file:", file);
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

app.listen(PORT, function () {
    console.log(`Server is running on port:${PORT}`);
});



async function signUp(req, res) {
    const email = req.body.email;                     // On extrait l'email du corps de la requête.
    const password = req.body.password;               // On extrait le mot de passe du corps de la requête.

    const userInDb = await User.findOne({
        email: email
    });
    if (userInDb != null) {
        res.status(400).send("Utilisateur déjà existant avec cet email."); // Si un utilisateur avec le même email existe déjà, on renvoie une erreur 400 (Bad Request) au client.
        return;                                                            // On arrête l'exécution de la fonction.
    }
    const user = {                                                         // On crée un nouvel objet utilisateur avec l'email et le mot de passe fournis.
        email: email,
        password: hashPassword(password)
    };
    try {
        await User.create(user);                                             // On crée un nouvel utilisateur dans la base de données MongoDB. 
    } catch (e) {                                                         // Si une erreur survient lors de la création de l'utilisateur dans la base de données, on la capture.
        console.error(e);
        res.status(500).send("Erreur serveur lors de la création de l'utilisateur.");
        return;
    }
    res.status(201).json({                                               // On renvoie une réponse 201 (Created) au client avec un message de succès.
        message: "Inscription réussie !"
    });
}

async function login(req, res) {
    const body = req.body;

    const userInDb = await User.findOne({                     // Ici, on cherche dans la base de données un utilisateur avec l'email que l'on a reçu dans le corps de la requête c'est à dire l'email qui a été tapé dans le formulaire de login.
        email: body.email
    });
    if (userInDb == null) {
        res.status(401).send("Mauvais email");
        return;
    }
    const passwordInDb = userInDb.password;
    if (!isPasswordCorrect(req.body.password, passwordInDb)) {    // (!isPasswordCorrect = si le mot de passe ne correspond pas) -> Si le mot de passe entré par l'utilisateur dans le champ de saisie (req.body.password) correspond au mot de passe stocké dans la base de données et qui est hashé (passwordInDb).
        res.status(401).send("Mauvais mot de passe");             // Si le mot de passe ne correspond pas, on renvoie une erreur 401 (Unauthorized) au client.
        return;
    }

    // SIMULATION - À remplacer plus tard par la vraie logique
    res.status(200).json({
        userId: userInDb._id,
        token: "dummyToken456"
    });
}

function hashPassword(password) {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);
    return hash;
}

function isPasswordCorrect(password, hash) {                    // Ici, on compare le mot de passe fourni avec le mot de passe hashé stocké dans la base de données. 
    return bcrypt.compareSync(password, hash);
}
