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

**Limite constatée sur mon ordinateur le 3 novembre 2026 :** le processeur n'expose pas AVX et MongoDB 7 redémarre avec le code 132. Pour les essais locaux uniquement, `docker-compose.legacy-mongo.yml` utilise MongoDB 4.4 et expose l'API sur `127.0.0.1:5000`. Cette ancienne version ne doit pas être utilisée en production. Je lance :

```powershell
docker compose -f docker-compose.yml -f docker-compose.legacy-mongo.yml --env-file .env up -d --no-deps mongo backend
docker compose -f docker-compose.yml -f docker-compose.legacy-mongo.yml --env-file .env exec backend node seeder.js
npm --prefix frontend start
```

J'ouvre `http://localhost:5173` : l'API locale renvoie 25 produits. J'utilise **Accueil** pour montrer quatre coups de cœur et **La boutique** pour voir et filtrer les 25 produits. Les formulaires signalent les champs requis et affichent une confirmation après inscription et commande. Le backend accepte les origines locales Vite en développement et n'accepte que les origines configurées en production.

Pour Render, je créerai une base Atlas Free. Si je préfère lancer Node sans Docker, je peux aussi utiliser Atlas dans mon `.env` local et ouvrir deux terminaux :

```powershell
# Terminal 1, depuis la racine du projet :
npm --prefix backend ci
node backend/server.js

# Terminal 2, depuis la racine du projet :
npm --prefix frontend start
```

Je vérifie que `MONGO_URI` pointe vers Atlas, que `APP_ORIGIN` contient `http://localhost:5173` et que `NODE_ENV=development` dans mon `.env`. J'ouvre `http://localhost:5173`. Après connexion à Atlas, je peuple la base une seule fois avec `node backend/seeder.js` depuis la racine. Pour créer le premier compte administrateur, je renseigne temporairement `ADMIN_USERNAME`, `ADMIN_EMAIL` et `ADMIN_PASSWORD` dans mon environnement local, puis je lance `node backend/bootstrap-admin.js` ; le mot de passe doit contenir au moins 16 caractères. Je retire ensuite ces variables temporaires.

## Comment je teste les emails

J'utilise l'API HTTPS de Resend. Je renseigne `RESEND_API_KEY` uniquement dans mon `.env` local ou dans les variables secrètes Render ; je ne colle jamais la clé dans une capture ni dans Git. Tant que je n'ai pas vérifié de domaine d'envoi dans Resend, je garde `RESEND_FROM=TechLuna <onboarding@resend.dev>` et j'envoie mes essais uniquement à l'adresse de mon compte Resend. Une fois mon domaine vérifié dans **Resend → Domains**, je remplace `RESEND_FROM` par une adresse de ce domaine pour envoyer aux clients. Le sous-domaine `onrender.com` ne remplace pas un domaine d'envoi que je contrôle. Le backend Render Free utilise directement l'API Resend par HTTPS ; le service local de notifications peut employer Resend ou SMTP.

## Comment je prépare Render Free

J'utilise [Dockerfile.render](Dockerfile.render) pour construire le frontend et l'API dans une même image, ce qui garde le cookie de session sur la même origine. Dans GitHub Actions, je lance le workflow **Deploy** avec `environment=preproduction` et `publish_only=true` pour tester et publier l'image `ghcr.io/selsai/techluna:preproduction`. Je crée ensuite un service web Render Free à partir de cette **Existing Image**. Si le paquet GHCR reste privé, je renseigne dans Render un identifiant de registre en lecture seule ; je ne rends pas l'image publique sans décision explicite. Je configure dans Render `MONGO_URI`, `JWT_SECRET`, `SERVICE_KEY`, `NODE_ENV=production` et `SEED_DEMO_PRODUCTS=true`. Render fournit `RENDER_EXTERNAL_URL` et le port d'écoute. Le catalogue de 25 produits est inséré au premier démarrage si la base est vide. Après création du service, je stocke son deploy hook dans le secret GitHub `RENDER_PREPROD_DEPLOY_HOOK_URL` et relance **Deploy** avec `publish_only=false`.

Après validation de la préproduction, je répète la publication pour `environment=production`, crée un second service web gratuit depuis `ghcr.io/selsai/techluna:production` avec un autre projet Atlas Free et des clés différentes, puis renseigne `RENDER_PROD_DEPLOY_HOOK_URL` dans GitHub. Je garde les URI et les clés dans l'interface Render, jamais dans Git. J'ajoute `RESEND_API_KEY` et `RESEND_FROM` aux variables du service pour les emails. Les microservices privés, SMTP et Prometheus/Alertmanager ne sont pas déployés sur cette variante gratuite ; je les documente séparément comme fonctionnalités locales.

Pour surveiller mes deux URL Render sans créer de service payant, je copie `monitoring/prometheus-cloud.example.yml` vers `monitoring/prometheus-cloud.yml`, je remplace les deux noms fictifs par mes véritables sous-domaines et j'ajoute `PROMETHEUS_CONFIG_FILE=./monitoring/prometheus-cloud.yml` à mon `.env` local. Je lance ensuite `docker compose --profile monitoring --env-file .env up -d`. Alertmanager transmet les indisponibilités au service de notifications local, qui les journalise avec Winston ; l'email nécessite Resend ou une configuration SMTP locale.

## Ce que contient le catalogue

J'ai placé les 25 visuels fournis et le logo TechLuna dans `frontend/public/images/`. Les catégories sont Audio, Ordinateurs, Téléphones, Accessoires, Composants et Écrans & tablettes. Le script `backend/seeder.js` crée les fiches de démonstration sans supprimer les produits existants. Les prix sont illustratifs et peuvent être modifiés dans l'administration.

## Sécurité et accès

J'ai remplacé le JWT exposé au navigateur par un cookie HTTPOnly. Les rôles administrateur sont revérifiés côté serveur. Je valide les entrées de l'API avec Joi et les modèles Mongoose ; les montants des commandes sont recalculés depuis la base. La [documentation des routes](docs/API_GENEREE.md) indique les niveaux d'accès. Aucun paiement bancaire réel n'est encaissé : le choix du mode de paiement sert uniquement à la simulation de commande.
