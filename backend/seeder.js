// backend/seeder.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product'); // Assurez-vous que le chemin est correct
const logger = require('./logger');

dotenv.config();

// Connexion à MongoDB
// La connexion et les écritures se font ensemble en fin de script.

// Jeux de produits à insérer
const products = [
  ['Écouteurs sans fil', 'Audio', 179, 'Un format discret pour accompagner chaque journée.', 'audio/airpods.jpg'],
  ['Barre de son', 'Audio', 249, 'Une présence sonore élégante pour le salon.', 'audio/barre-de-son.jpg'],
  ['Casque enveloppant', 'Audio', 399, 'Une écoute immersive au design raffiné.', 'audio/casque-apple.jpg'],
  ['Enceinte portable', 'Audio', 139, 'Votre musique partout, avec du caractère.', 'audio/enceinte-jbl.jpg'],
  ['Microphone USB-C', 'Audio', 119, 'Une voix nette pour vos projets et vos échanges.', 'audio/micro-usbc.jpg'],
  ['Ordinateur portable HP', 'Ordinateurs', 899, 'Un allié polyvalent pour travailler et créer.', 'ordinateurs/hp-portable.jpg'],
  ['Ordinateur tout-en-un', 'Ordinateurs', 1499, 'Un espace de travail épuré et inspirant.', 'ordinateurs/imac.jpg'],
  ['Ordinateur portable créatif', 'Ordinateurs', 1699, 'Une silhouette sobre pour des idées ambitieuses.', 'ordinateurs/mac-portable.jpg'],
  ['Portable gaming', 'Ordinateurs', 1399, 'Puissance et mobilité dans un même appareil.', 'ordinateurs/portable-gaming.jpg'],
  ['Tour gaming', 'Ordinateurs', 1299, 'Un poste de jeu conçu pour durer.', 'ordinateurs/tour-gaming.jpg'],
  ['Tour de bureau HP', 'Ordinateurs', 749, 'La simplicité d’un poste fixe fiable.', 'ordinateurs/tour-hp.jpg'],
  ['Smartphone bordeaux', 'Téléphones', 1199, 'Une touche de couleur audacieuse au quotidien.', 'smartphones/iphone-16-pro-max.jpg'],
  ['Smartphone noir', 'Téléphones', 1099, 'Lignes nettes et allure affirmée.', 'smartphones/galaxy-s26-ultra.jpg'],
  ['Câble USB-C rose', 'Accessoires', 24, 'Le détail pratique qui soigne votre bureau.', 'accessoires/cable-usbc-rose.jpg'],
  ['Câble USB-C', 'Accessoires', 19, 'Un essentiel pour rester connecté.', 'accessoires/cable-usbc.jpg'],
  ['Ensemble clavier et souris', 'Accessoires', 89, 'Un duo harmonieux pour le bureau.', 'accessoires/clavier-souris.jpg'],
  ['Clé USB', 'Accessoires', 29, 'Vos fichiers essentiels toujours à portée de main.', 'accessoires/cle-usb.jpg'],
  ['Hub USB-C', 'Accessoires', 59, 'Plus de connexions, moins d’encombrement.', 'accessoires/hub-usbc.jpg'],
  ['Souris gaming', 'Accessoires', 69, 'Précision et confort pour vos sessions.', 'accessoires/souris-gaming.jpg'],
  ['Souris HP', 'Accessoires', 39, 'Une prise en main simple et confortable.', 'accessoires/souris-hp.jpg'],
  ['Webcam', 'Accessoires', 79, 'Restez présente à chaque rendez-vous.', 'accessoires/webcam.jpg'],
  ['Barrette mémoire RAM', 'Composants', 89, 'Un composant pour donner de l’élan à votre machine.', 'composants/barrette-ram.jpg'],
  ['Carte graphique', 'Composants', 499, 'De la ressource pour vos projets visuels.', 'composants/carte-graphique.jpg'],
  ['Écran 27 pouces', 'Écrans & tablettes', 329, 'Un grand cadre pour travailler avec aisance.', 'ecrans-tablettes/ecran-27.jpg'],
  ['Tablette grise', 'Écrans & tablettes', 549, 'Créez, lisez et organisez vos idées où vous voulez.', 'ecrans-tablettes/ipad-gris.jpg'],
].map(([name, category, price, description, image]) => ({ name, category, price, description, imageUrl: `/images/${image}`, stock: 20 }));

// Fonction pour insérer les produits
const seedProducts = async ({ manageConnection = true } = {}) => {
  try {
    if (manageConnection) await mongoose.connect(process.env.MONGO_URI);
    for (const product of products) await Product.updateOne({ name: product.name }, { $set: { category: product.category, description: product.description, price: product.price, imageUrl: product.imageUrl }, $setOnInsert: { stock: product.stock } }, { upsert: true });

    logger.info('Jeu de produits inséré');
    if (manageConnection) await mongoose.disconnect();
  } catch (error) {
    logger.error('Insertion des produits impossible', { error: error.name });
    if (manageConnection) await mongoose.disconnect();
    throw error;
  }
};

if (require.main === module) seedProducts().catch(() => { process.exitCode = 1; });
module.exports = { seedProducts };
