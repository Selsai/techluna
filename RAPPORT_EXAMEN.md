# Rapport de maintenance et de mise en production

Date : 3 novembre 2026. TechLuna, application MERN de vente en ligne.

J'ai préparé un catalogue de démonstration de 25 produits avec mes visuels, le logo TechLuna et six catégories. J'ai choisi des prix illustratifs ; ils ne constituent pas une offre commerciale réelle.

## Périmètre et état réel

J'ai livré le code, les conteneurs, la configuration CI/CD et la supervision locale dans ce dépôt. J'ai choisi Render et ses sous-domaines `onrender.com` pour la future mise en ligne. Ma capture du tableau de bord confirme l'existence de mon compte Render et de services antérieurs ; mon dépôt GitHub TechLuna existe, mais je n'ai pas encore configuré de service TechLuna ni de base MongoDB Atlas. Je possède une clé API Resend, mais je ne l'ai pas intégrée au dépôt et aucun email réel n'est encore vérifié. Je dois encore exécuter et illustrer ces étapes externes. Je ne place aucun mot de passe dans ce rapport ; je transmettrai les accès nécessaires séparément au jury.

J'ai créé le dépôt GitHub `Selsai/techluna` et choisi un déploiement exclusivement gratuit. J'ai préparé `Dockerfile.render` pour une démonstration par service web Render Free avec frontend et API sur la même origine et MongoDB Atlas Free. L'envoi d'email par HTTPS via Resend est préparé dans l'API ; son fonctionnement réel dépend de la clé et d'un domaine d'envoi vérifié pour joindre des clients. Je ne déploie pas les microservices privés, le SMTP ni la chaîne Prometheus/Alertmanager sur Render dans cette variante. Je signalerai les preuves cloud non obtenues comme non réalisées.

## E21 — Hébergement

J'ai choisi Render Free pour préparer deux services web séparés, préproduction et production, chacun sur son sous-domaine `onrender.com`. `Dockerfile.render` construit le frontend et l'API dans un seul conteneur par environnement. Je prévois un projet MongoDB Atlas Free distinct par service pour isoler les données ; Render [documente la connexion à Atlas](https://render.com/docs/connect-to-mongodb-atlas). Les services privés Render ne sont pas disponibles gratuitement ; j'ai conservé Docker Compose pour la démonstration locale des microservices et de la supervision.

## E22 — Environnement sécurisé

1. Je créerai deux services web Render Free séparés, reliés au dépôt GitHub, avec deux projets Atlas distincts.
2. Je définirai `MONGO_URI`, `JWT_SECRET`, `SERVICE_KEY`, `NODE_ENV=production` et `SEED_DEMO_PRODUCTS=true` dans chaque service Render, avec des valeurs différentes. Je ne les commiterai pas.
3. Je publierai le frontend compilé et l'API dans le même service web pour conserver le cookie de session. Je garderai les microservices, la gateway et le profil de supervision dans Compose local.
4. Je testerai `/health`, l'inscription, la connexion, la commande et l'administration en préproduction avant de créer ou de promouvoir la production.

En local, seul Caddy expose 80/443 ; MongoDB, l'API, la gateway et les microservices restent sur le réseau Compose interne. Sur Render, le routage TLS sera pris en charge par la plateforme. Le JWT est dans un cookie HTTPOnly, avec `Secure` en production ; le rôle est revérifié dans MongoDB. Les montants sont recalculés côté serveur et le stock est réservé par mise à jour atomique. Le backend refuse les origines non prévues pour les requêtes de modification. Aucun paiement bancaire réel n'est collecté : le mode est uniquement un choix de simulation.

## E23 — Domaine, DNS et TLS

Render attribue un sous-domaine `onrender.com` à chaque service web et [gère automatiquement ses certificats TLS](https://render.com/docs/tls). Je n'ai pas besoin d'acheter un domaine ni de configurer une zone DNS pour cette première mise en ligne. Après création des services, je vérifierai les deux noms réellement attribués, `curl -I https://<nom>/health`, la redirection HTTP vers HTTPS et la validité du certificat dans le navigateur. Je noterai explicitement que la réservation d'un domaine personnalisé et la configuration DNS demandées par la consigne ne sont pas réalisées avec mon choix gratuit.

## E24 — CI/CD

J'ai configuré `.github/workflows/ci.yml` pour installer, tester, compiler, analyser et construire les images à chaque push ou pull request. Le workflow manuel `.github/workflows/deploy.yml` exécute les vérifications, construit `Dockerfile.render`, **pousse l'image dans GitHub Container Registry**, puis déclenche le [deploy hook Render](https://render.com/docs/deploy-hooks) de l'environnement choisi. L'option `publish_only=true` me permet de publier l'image initiale avant de créer le service Render. Je créerai ensuite les secrets GitHub `RENDER_PREPROD_DEPLOY_HOOK_URL` et `RENDER_PROD_DEPLOY_HOOK_URL`. Je n'affirme pas avoir exécuté le pipeline GitHub ni déployé sur Render tant que les captures correspondantes ne sont pas disponibles.

## E25 — Journalisation et audit

J'ai remplacé les `console.log/error` des services Node actifs par Winston avec horodatage, niveau, nom du service et format JSON sur stdout. Caddy écrit aussi des lignes JSON. Je peux contrôler localement avec `docker compose logs --since=1h` et, après déploiement, filtrer les journaux Render du service web. Je n'inscris pas les secrets et jetons dans les messages Winston. L'audit npm de l'API et des dépendances de production du frontend a été ramené à zéro vulnérabilité ; l'outillage de développement ESLint comporte encore des alertes modérées transitives à suivre. Je répéterai `npm audit --omit=dev` et `npm audit` régulièrement.

## E26 — Supervision et alertes

J'ai configuré le profil Compose `monitoring` avec Prometheus, Blackbox Exporter et Alertmanager. Les sondes HTTP vérifient le frontend, le backend, la gateway, les notifications et le stock toutes les 30 secondes. Après deux minutes d'échec, l'alerte `ServiceIndisponible` arrive au service de notification, qui la journalise avec Winston et peut envoyer un email à `ADMIN_EMAIL` si Resend ou SMTP local est configuré. J'ai aussi fourni `monitoring/prometheus-cloud.example.yml` pour surveiller les deux URL Render réelles depuis le poste local après leur création ; je remplacerai ses deux noms fictifs et définirai `PROMETHEUS_CONFIG_FILE` dans mon `.env`. Je ne prétends pas que Prometheus tourne sur Render Free. Render bloque les ports SMTP usuels depuis les services web gratuits ; l'API Resend utilise HTTPS.

## E27 — Bugs constatés et corrections

| Défaut initial | Correction |
| --- | --- |
| Commande calculée avec les prix envoyés par le navigateur | Relecture des produits en base et calcul serveur |
| Stock jamais réellement décrémenté | Réservation atomique avec contrôle du stock et compensation sur échec |
| Suppression de commande accessible à tout utilisateur connecté | Restriction administrateur |
| Statut de commande non validé | Liste de statuts autorisés et identifiant contrôlé |
| Stock accepté comme chaîne ou valeur négative | Entier non négatif obligatoire |
| Service de notification vide/incomplet | Envoi par Resend HTTPS ou SMTP local et réponse d'erreur explicite |
| Test React de démonstration obsolète | Test du comportement du panier avec Vitest |
| Sous-dépôt frontend inaccessible à la CI parent | Intégration des sources au dépôt principal ; sauvegarde locale du dépôt initial |
| Outillage Create React App obsolète | Migration vers Vite et réduction des dépendances exposées |
| Inscription rejetée avec « Origine interdite » sur un autre port Vite local | Acceptation des origines HTTP de boucle locale en développement ; origines configurées exactes en production |
| Accueil et catalogue confondus | Accueil réduit à quatre coups de cœur et page `/boutique` dédiée aux 25 produits |

## E28 — Sécurité et robustesse

J'ai validé les champs de compte, adresses, quantités, identifiants et statuts avec Joi et les modèles ; limité la taille JSON et les tentatives de connexion ; protégé les échanges interservices par une clé ; exclu `.env` de Git et des images Docker ; ajouté des en-têtes de sécurité et un cookie HTTPOnly. Mon test backend vérifie le refus des formulaires vides et d'un nom d'utilisateur contenant `<script>`, ainsi que l'accès non authentifié aux routes administrateur et le rejet d'une origine CORS interdite. Je dois encore rejouer les parcours critiques en préproduction avec des données de test. Pour une exploitation commerciale réelle, il faudrait un prestataire de paiement conforme et des transactions MongoDB sur replica set pour garantir l'atomicité multi-produit en cas de panne totale du processus.

## E29 — Documentation et journal des évolutions

J'ai généré [docs/API_GENEREE.md](docs/API_GENEREE.md) à partir des fichiers de routes avec `npm run docs:api`. Ce rapport, l'inventaire généré, le code et `CHANGELOG.md` constituent ma documentation. Le JSON d'une commande contient `items: [{productId, quantity}]`, `shippingAddress`, `paymentMethod` et `shippingMethod` ; le backend ignore tout `price` ou `total` transmis par le navigateur et recalcule ces valeurs depuis MongoDB.

## Vérification de la consigne, pages 5 et 21 à 33

| Demande de la consigne | Réalisation et fichier | Vérification ou limite |
| --- | --- | --- |
| Catalogue, catégories et ajout au panier | `frontend/src/pages/ProductList.jsx`, `backend/seeder.js` | 25 fiches et 26 fichiers image dont le logo ; `GET /api/products` vérifié avec une base locale active. Accueil : quatre coups de cœur ; `/boutique` : catalogue complet. |
| Panier global avec ajout, diminution, retrait et vidage | `frontend/src/context/CartContext.jsx`, `frontend/src/pages/Cart.jsx` | Test Vitest du panier passé ; interface à revoir avec données réelles. |
| Adresse, transport, paiement simulé et synthèse | `ShippingPayment.jsx`, `Order.jsx`, `backend/controllers/secureOrderController.js` | Données contrôlées ; aucun paiement bancaire réel. |
| Rôles, administration, commandes, produits, stock, utilisateurs | `backend/middlewares/authMiddleware.js`, `secureAdminController.js`, `secureProductController.js`, `frontend/src/pages/Admin.jsx` | Accès admin côté serveur ; validation visuelle et parcours complet encore à capturer. |
| Notifications de commande, statut et stock | `backend/notify.js`, `backend/resend.js`, `microservices/notifications/index.js`, gateway | Appels et test Resend simulé présents ; aucun email réel encore vérifié. |
| Microservice de stock et gateway | `microservices/stock-management/index.js`, `gateway/server.js` | Routes locales en place ; la réservation d'une commande reste effectuée directement par l'API et n'est pas entièrement décentralisée. |
| Secrets en `.env`, cookie HTTPOnly, contrôle des données | `.gitignore`, `secureAuthController.js`, `backend/validation.js` | `.env` local ignoré par Git, validations Joi et Mongoose, test de session absente passé. |
| Gestion des erreurs et messages côté client | Contrôleurs sécurisés, middleware d'erreur, pages React | Champs requis marqués, validation, messages d'inscription et de confirmation de commande ; je n'ai pas ajouté `connect-flash`, qui est une suggestion du support. |
| Qualité et dépendances | ESLint, Prettier, Vite, Vitest, audits npm | Lint, build et tests passés ; les alertes transitives de développement restent à surveiller. |
| Logs et aide au débogage | Winston JSON sur stdout dans les quatre services Node actifs, logs JSON Caddy | Les logs Compose sont consultables ; aucune centralisation externe n'est configurée. |
| Documentation générée et historique | `scripts/generate-api-docs.cjs`, `docs/API_GENEREE.md`, `CHANGELOG.md` | Génération reproductible ; les captures cloud manquent tant que Render n'est pas déployé. |

## Mes séquences détaillées de réalisation

### 1. Reprise et diagnostic du code

1. J'ai relevé la structure du projet MERN d'origine : frontend React, API Express, base MongoDB, gateway et deux microservices.
2. J'ai parcouru les routes et contrôleurs, puis repéré les défauts concrets : prix de commande envoyés par le client, stock non réservé, rôle administrateur non revérifié en base et token exposé au navigateur.
3. J'ai relié chaque correction à un fichier dans la section E27 et au journal `CHANGELOG.md`. J'ai conservé les composants locaux nécessaires à l'examen au lieu de prétendre qu'ils sont déjà déployés.

### 2. Correction des données, commandes et accès

1. J'ai ajouté des contrôles Joi dans `backend/validation.js`, puis validé les identifiants, textes, quantités et adresses dans les contrôleurs. Mongoose applique aussi des contraintes aux modèles.
2. J'ai déplacé la vérification du rôle dans le middleware serveur : chaque requête authentifiée recharge l'utilisateur depuis MongoDB. Un simple champ modifié dans le navigateur ne suffit donc pas à obtenir l'accès admin.
3. À la création d'une commande, je relis les produits et prix en base, je réserve chaque quantité avec une mise à jour conditionnelle du stock, puis je calcule le total. Si une réservation échoue, je compense les réservations déjà effectuées. Cette compensation ne remplace pas une transaction MongoDB en cas de panne totale du processus ; je l'indique dans E28.
4. J'ai limité les actions de gestion des commandes et produits aux administrateurs et contrôlé les statuts autorisés. J'ai prévu des messages visibles sur les formulaires lorsqu'une requête échoue.

### 3. Interface et données de démonstration

1. J'ai rangé les 25 visuels reçus dans six catégories et intégré le logo TechLuna dans l'en-tête et les métadonnées de la boutique.
2. J'ai construit une interface responsive pour le catalogue et harmonisé les pages de connexion, inscription, panier, commande et administration avec la palette ivoire, rose poudré, mauve et anthracite.
3. J'ai écrit un script de semis idempotent : il ajoute ou met à jour les fiches sans effacer les données existantes. Sur Render, je n'exécute le semis automatique que si la collection Produits est vide.
4. J'ai séparé l'accueil et la boutique complète, ajouté les repères `*` aux champs obligatoires et des confirmations visibles après la création d'un compte et d'une commande. J'ai indiqué que le mode de paiement actuel est une simulation.

### 4. Conteneurisation, CI et hébergement gratuit

1. J'ai fourni des Dockerfiles pour chaque composant local et un `docker-compose.yml` qui les relie sans exposer MongoDB ni les microservices au public.
2. J'ai préparé `Dockerfile.render` pour un service web gratuit réunissant API et frontend compilé. Ce regroupement garde l'authentification sur une seule origine HTTPS, car les services privés Render sont payants.
3. J'ai créé une CI GitHub pour installer, tester, analyser et construire le projet. Le workflow de déploiement manuel ajoute la publication de l'image dans GHCR, puis attend deux deploy hooks Render, un par environnement ; aucune mise en ligne n'a encore été déclenchée.
4. J'ai testé Docker Desktop : les images applicatives ont été construites et les conteneurs ont démarré. Sur ce PC, `mongo:7` s'arrête avec le code 132 parce que le processeur ne fournit pas AVX. J'ai ajouté une variante **locale uniquement** avec `mongo:4.4`, démarré MongoDB et le backend, exécuté le seeder et vérifié que `GET /api/products` renvoie les 25 produits. Je n'utiliserai pas MongoDB 4.4 en production ; Atlas Free servira au déploiement. Les parcours complets de commande et d'administration restent à tester et capturer.

### 5. Documentation, tests et preuves

1. J'ai exécuté le test frontend du panier, le test backend de la sonde, du contrôle d'accès, des origines locales et de l'appel Resend simulé, ESLint, la compilation Vite et la validation de la configuration Compose. Ces contrôles passent. J'ai également vérifié avec MongoDB local : 25 produits, formulaire d'inscription vide rejeté (400), compte créé (201), connexion (200) et session (200) sur une autre origine Vite locale ; j'ai ensuite supprimé le compte d'essai. Les parcours de commande et d'administration restent à rejouer dans le navigateur et en préproduction.
2. J'ai créé `scripts/generate-api-docs.cjs` pour extraire automatiquement les méthodes, chemins et niveaux d'accès des fichiers de routes. Je régénère `docs/API_GENEREE.md` avec `npm run docs:api` après toute modification des routes.
3. Je conserve les anciennes captures comme prévisualisations historiques. Après connexion à Atlas et déploiement Render, je prendrai des captures TechLuna portant les URL, statuts et résultats réellement observés, sans afficher de secrets.

## Preuves à joindre au rendu final

Mes trois captures initiales dans `captures/` montrent le catalogue desktop, le catalogue mobile et la connexion sur une prévisualisation antérieure au changement de nom TechLuna. J'avais utilisé une API de démonstration de quatre fiches pour contrôler le design. Je ne les présente pas comme preuves de déploiement Render ou de paiement réel.

| Preuve demandée | Capture que je dois produire | État au 3 novembre 2026 |
| --- | --- | --- |
| E21–E22 : préproduction et production | Tableau de bord Render montrant deux services TechLuna, sans valeurs de secrets | À faire après création des services. |
| E23 : URL et TLS | Adresse `https://...onrender.com` et certificat valide pour chaque service | À faire ; aucun domaine personnel ni DNS personnalisé. |
| E24 : CI/CD | Exécution verte de GitHub Actions et déploiements Render successifs | À faire après publication de la version adaptée. |
| E25 : journaux | Logs Render filtrés, puis `docker compose logs` pour les composants locaux | À faire, en masquant toute donnée sensible. |
| E26 : sondes et alertes | État des deux sondes HTTPS et journal Winston de l'alerte dans Compose local ; email si Resend ou SMTP local est configuré | Configuration prête, test de déclenchement non réalisé ; pas de Prometheus hébergé sur Render Free. |
| E27–E28 : parcours et refus | Catalogue TechLuna, panier, commande, admin, réponse 400 et réponse 403 | À refaire sur une base fonctionnelle. |
| E29 : code documenté | `npm run docs:api`, fichier généré et `CHANGELOG.md` | Génération réalisée ; capture facultative à ajouter. |
| Sauvegarde/restauration | Export et réimport manuel d'une base de test Atlas Free | Non réalisé ; aucune sauvegarde managée à revendiquer. |

Je joindrai seulement des captures obtenues sur une application réellement accessible et je retirerai ou légenderai clairement les anciennes prévisualisations. Je transmettrai au jury les accès strictement nécessaires par un canal privé, jamais dans Git ou dans ce rapport.
