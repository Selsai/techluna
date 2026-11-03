# TechLuna — mon projet d'examen

J'ai repris une application e-commerce MERN existante pour corriger ses défauts, sécuriser les parcours et préparer sa mise en ligne. Ma boutique présente 25 produits illustrés, un panier, des comptes clients, des commandes et une administration. J'ai conservé une gateway et des microservices de stock et de notifications pour la démonstration locale.

## Où je trouve les explications et les preuves

- [RAPPORT_EXAMEN.md](RAPPORT_EXAMEN.md) : mes séquences de travail détaillées, mes choix, les tests et les limites pour E21 à E29.
- [docs/API_GENEREE.md](docs/API_GENEREE.md) : l'inventaire des routes que je génère depuis le code avec `npm run docs:api`.
- [CHANGELOG.md](CHANGELOG.md) : mon journal des évolutions.
- `captures/` : mes captures de prévisualisation initiales ; je dois les remplacer ou compléter par des captures TechLuna et des preuves cloud réelles.

## Comment je lance le projet en local

J'ai créé un `.env` local à partir de `.env.example`. Il contient deux clés aléatoires différentes (`JWT_SECRET` et `SERVICE_KEY`) et Git l'ignore. Je ne le pousse jamais sur GitHub. Sur un ordinateur compatible avec MongoDB 7, je lance toute la pile ainsi :

```powershell
cd 'D:\Selsabil A\Examen-TP-Selsabil-AMAIRI\exam-noté'
docker compose --env-file .env up -d --build
docker compose --env-file .env ps
docker compose --env-file .env exec backend node seeder.js
```

J'ouvre ensuite `https://localhost` et j'accepte le certificat local de développement si mon navigateur le demande. Je contrôle `GET /health` et `GET /api/products`, puis je parcours la boutique, le panier et les commandes. Pour consulter les journaux, j'exécute `docker compose --env-file .env logs --tail=100 backend frontend mongo`. Pour arrêter sans supprimer le volume de données, j'exécute `docker compose --env-file .env down`.

**Limite constatée sur mon ordinateur le 3 novembre 2026 :** le processeur n'expose pas AVX et le conteneur MongoDB 7 redémarre avec le code 132. Les autres conteneurs démarrent, mais l'API ne peut pas servir le catalogue sans base. Je n'affirme donc pas avoir validé le parcours complet en local. Pour poursuivre gratuitement, je crée une base Atlas Free et j'utilise son URI `mongodb+srv://...` dans mon `.env` local ; je peux alors lancer le backend et le frontend en deux terminaux :

```powershell
# Terminal 1, depuis la racine du projet :
node backend/server.js

# Terminal 2, depuis la racine du projet :
npm --prefix frontend start
```

Je vérifie que `MONGO_URI` pointe vers Atlas, que `APP_ORIGIN=http://localhost:5173` et que `NODE_ENV=development` dans mon `.env`. J'ouvre `http://localhost:5173`. Après connexion à Atlas, je peuple la base une seule fois avec `node backend/seeder.js` depuis la racine. Pour créer le premier compte administrateur, je renseigne temporairement `ADMIN_USERNAME`, `ADMIN_EMAIL` et `ADMIN_PASSWORD` dans mon environnement local, puis je lance `node backend/bootstrap-admin.js` ; le mot de passe doit contenir au moins 16 caractères. Je retire ensuite ces variables temporaires.

## Comment je prépare Render Free

J'utilise [Dockerfile.render](Dockerfile.render) pour construire le frontend et l'API dans une même image, ce qui garde le cookie de session sur la même origine. Dans GitHub Actions, je lance le workflow **Deploy** avec `environment=preproduction` et `publish_only=true` pour tester et publier l'image `ghcr.io/selsai/techluna:preproduction`. Je crée ensuite un service web Render Free à partir de cette **Existing Image**. Si le paquet GHCR reste privé, je renseigne dans Render un identifiant de registre en lecture seule ; je ne rends pas l'image publique sans décision explicite. Je configure dans Render `MONGO_URI`, `JWT_SECRET`, `SERVICE_KEY`, `NODE_ENV=production` et `SEED_DEMO_PRODUCTS=true`. Render fournit `RENDER_EXTERNAL_URL` et le port d'écoute. Le catalogue de 25 produits est inséré au premier démarrage si la base est vide. Après création du service, je stocke son deploy hook dans le secret GitHub `RENDER_PREPROD_DEPLOY_HOOK_URL` et relance **Deploy** avec `publish_only=false`.

Après validation de la préproduction, je répète la publication pour `environment=production`, crée un second service web gratuit depuis `ghcr.io/selsai/techluna:production` avec un autre projet Atlas Free et des clés différentes, puis renseigne `RENDER_PROD_DEPLOY_HOOK_URL` dans GitHub. Je garde les URI et les clés dans l'interface Render, jamais dans Git. Les microservices privés, SMTP et Prometheus/Alertmanager ne sont pas déployés sur cette variante gratuite ; je les documente séparément comme fonctionnalités locales.

Pour surveiller mes deux URL Render sans créer de service payant, je copie `monitoring/prometheus-cloud.example.yml` vers `monitoring/prometheus-cloud.yml`, je remplace les deux noms fictifs par mes véritables sous-domaines et j'ajoute `PROMETHEUS_CONFIG_FILE=./monitoring/prometheus-cloud.yml` à mon `.env` local. Je lance ensuite `docker compose --profile monitoring --env-file .env up -d`. Alertmanager transmet les indisponibilités au service de notifications local, qui les journalise avec Winston ; l'email nécessite une configuration SMTP supplémentaire.

## Ce que contient le catalogue

J'ai placé les 25 visuels fournis et le logo TechLuna dans `frontend/public/images/`. Les catégories sont Audio, Ordinateurs, Téléphones, Accessoires, Composants et Écrans & tablettes. Le script `backend/seeder.js` crée les fiches de démonstration sans supprimer les produits existants. Les prix sont illustratifs et peuvent être modifiés dans l'administration.

## Sécurité et accès

J'ai remplacé le JWT exposé au navigateur par un cookie HTTPOnly. Les rôles administrateur sont revérifiés côté serveur. Je valide les entrées de l'API avec Joi et les modèles Mongoose ; les montants des commandes sont recalculés depuis la base. La [documentation des routes](docs/API_GENEREE.md) indique les niveaux d'accès. Aucun paiement bancaire réel n'est encaissé : le choix du mode de paiement sert uniquement à la simulation de commande.
