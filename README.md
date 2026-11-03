# TechLuna — projet d'examen

Application MERN : catalogue, panier, comptes, commandes, administration, notifications, stock, gateway et supervision.

## Démarrage local avec Docker

1. Copier `.env.example` en `.env` et définir `JWT_SECRET` et `SERVICE_KEY` avec des chaînes aléatoires différentes.
2. Lancer `docker compose --env-file .env up -d --build`.
3. Ouvrir `http://localhost`, puis exécuter `docker compose exec backend node seeder.js` pour ajouter les produits de démonstration sans effacer les données existantes.
4. Pour les sondes et alertes : `docker compose --profile monitoring --env-file .env up -d`.

Si la base initiale ne contient pas d'administrateur, définir temporairement `ADMIN_USERNAME`, `ADMIN_EMAIL` et `ADMIN_PASSWORD` dans l'environnement du conteneur backend, puis exécuter `node bootstrap-admin.js` dans ce conteneur. Le script refuse de créer un second administrateur et exige un mot de passe d'au moins 16 caractères.

La mise en ligne prévue après finition du style utilisera deux environnements Render et leurs sous-domaines `onrender.com`, avec secrets et bases distincts. Voir [RAPPORT_EXAMEN.md](RAPPORT_EXAMEN.md) pour les étapes E21 à E29 et l'état exact des travaux.

## Variables essentielles

`APP_DOMAIN` : domaine Caddy. `APP_ORIGIN` : origine HTTPS autorisée par l'API. `MONGO_URI` : MongoDB interne. `JWT_SECRET` : signature des sessions. `SERVICE_KEY` : communication interne. `SMTP_*` et `ADMIN_EMAIL` : email de notifications et d'alertes.

## Catalogue et images

Les 25 images fournies et le logo TechLuna sont intégrés dans `frontend/public/images/`, répartis en Audio, Ordinateurs, Téléphones, Accessoires, Composants et Écrans & tablettes. Le script `backend/seeder.js` crée les 25 fiches de démonstration et relie chacune à son visuel. Les prix sont illustratifs et peuvent être modifiés dans l'administration. Le modèle Produit accepte `imageUrl` ; pour une nouvelle fiche, saisir un chemin local `/images/categorie/fichier.jpg` ou une URL HTTPS.

## API

Tous les chemins publics commencent par `/api`. L'authentification repose sur un cookie de session HTTPOnly. Les routes administrateur exigent le rôle `admin` contrôlé côté serveur. Le rapport détaille les endpoints et les validations.
