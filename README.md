# TechLuna — projet d'examen

J'ai repris une boutique MERN pour corriger ses bugs, sécuriser ses parcours et préparer son déploiement. Le projet contient 25 produits illustrés, un panier, des comptes, des commandes et une administration.

## État vérifié

- Préproduction : https://techluna-preprod.onrender.com/ ; le 3 novembre 2026, `/health` répondait 200 et `/api/products` renvoyait 25 produits.
- Production séparée, domaine personnel et DNS : à réaliser.
- Sur Render Free, le frontend et l'API sont réunis dans un service web. La gateway, les microservices et Prometheus restent une démonstration locale ; leurs alertes et les emails réels ne sont pas encore prouvés.

Le [rapport](RAPPORT_EXAMEN.md) détaille E21 à E29. Le [guide des captures](docs/GUIDE_CAPTURES.md) donne les preuves à produire. Je génère la [référence API](docs/API_GENEREE.md) avec `npm run docs:api` et j'inscris les corrections dans [CHANGELOG.md](CHANGELOG.md).

## Lancement local avec npm

Depuis la racine d'un clone du dépôt :

```powershell
git clone https://github.com/Selsai/techluna.git
cd techluna
Copy-Item .env.example .env
npm --prefix backend ci
npm --prefix frontend ci
```

Dans `.env`, je remplace `MONGO_URI` par une URI Atlas pointant vers une **base de développement distincte** et j'autorise l'IP de mon poste dans Atlas. Je définis `NODE_ENV=development`, `APP_ORIGIN=http://localhost:5173` et deux longues valeurs aléatoires différentes pour `JWT_SECRET` et `SERVICE_KEY`. L'URI `mongodb://mongo:27017/exam` de l'exemple ne fonctionne que dans Docker. Je ne publie jamais `.env` ni ses valeurs dans une capture.

```powershell
node backend/seeder.js
npm start
```

`npm start` lance le backend et Vite ensemble. J'ouvre `http://localhost:5173` ; `Ctrl+C` arrête les deux. Si les ports 5000 ou 5173 sont déjà pris par Docker/Vite, je ferme ces instances. Je peux aussi lancer séparément `npm --prefix backend start` et `npm --prefix frontend start`. Le frontend seul n'affiche pas les produits si l'API ou MongoDB est arrêté.

Docker Compose sert à démontrer MongoDB, la gateway, les microservices et la supervision. `npm run start:all` lance la pile complète sur une machine compatible AVX. Mon PC ne prenant pas en charge MongoDB 7, `docker-compose.legacy-mongo.yml` permet un essai **local uniquement** avec MongoDB 4.4 ; cette version ancienne ne doit pas servir en production.

## Render et CI/CD

Render construit le [Dockerfile](Dockerfile) depuis GitHub, avec `MONGO_URI`, `JWT_SECRET`, `SERVICE_KEY`, `NODE_ENV=production` et `SEED_DEMO_PRODUCTS=true` dans ses variables secrètes. Render fournit `RENDER_EXTERNAL_URL`. Le workflow [CI](.github/workflows/ci.yml) installe, teste, analyse et construit sur chaque push. Le workflow [Deploy](.github/workflows/deploy.yml), lancé manuellement, revérifie, construit et pousse une image GHCR, puis appelle le deploy hook Render. Le service actuel est lié au dépôt Git : Render reconstruit le commit ; l'image GHCR est un artefact du pipeline et n'est pas sa source. Le deploy hook doit encore être enregistré comme secret GitHub pour prouver E24.

La production exigera un second service Render, une base et des secrets séparés. Je ne présente pas les deux environnements comme terminés avant leurs vérifications.

## Emails, paiement et sécurité

Le backend peut envoyer via l'API HTTPS Resend (`RESEND_API_KEY`, `RESEND_FROM`) ; le microservice local peut utiliser SMTP/NodeMailer. Sans domaine d'envoi vérifié, `TechLuna <onboarding@resend.dev>` est réservé aux essais permis par Resend. Aucun email réel n'est revendiqué sans preuve. Les choix de paiement sont une simulation : aucun débit n'est effectué et Stripe n'est pas intégré.

Le JWT reste dans un cookie HTTPOnly ; le rôle administrateur est revérifié en base. Joi valide les entrées ; le serveur recalcule les prix et réserve le stock. Les services Node écrivent des logs Winston JSON. La supervision Prometheus/Blackbox/Alertmanager est prévue en local et reste à démontrer avec le guide des captures.
