# Rapport d'examen — TechLuna

Date du bilan : 3 novembre 2026. Dépôt : https://github.com/Selsai/techluna. Préproduction : https://techluna-preprod.onrender.com/.

## État réel du rendu

J'ai déployé **un environnement de préproduction** sur Render Free, relié à MongoDB Atlas. La capture `captures/01-render.png` montre le déploiement du commit `13b356e` au statut **Live**, les journaux Winston « MongoDB connecté » et « API en écoute ». J'ai vérifié `GET /health` (200) et `GET /api/products` (25 produits) ; `captures/09-terminal.png` montre ces réponses et la génération de la documentation API (19 routes). Les captures `02-accueil.png`, `03-boutique.png` et `05-validation.png` illustrent l'interface et la validation d'un formulaire. `08-CI.png` montre des exécutions CI vertes. Le commit `b304938` regroupe les captures.

Je distingue les fichiers/configurations livrés de leur exécution réellement prouvée. Je n'ai **pas** déployé de service de production séparé, réservé de domaine personnel, configuré ses DNS, démontré le workflow CD jusqu'au deploy hook, déclenché une alerte Prometheus ni prouvé la réception d'un email Resend. La gateway et les microservices sont disponibles dans Docker Compose local, pas hébergés séparément sur Render Free. Les choix de paiement sont simulés ; aucun paiement réel n'est collecté. Ces limites doivent être prises en compte pour l'évaluation.

## E21 — Choix cloud et préproduction

J'ai choisi Render Free pour son déploiement Docker depuis GitHub, son URL HTTPS, ses journaux et son faible coût pour une démonstration. J'ai choisi MongoDB Atlas pour conserver les données hors du conteneur éphémère. Le service `techluna-preprod` construit le `Dockerfile` racine, qui compile React et démarre l'API Express dans une seule image. Cela permet à l'interface et à l'API de partager la même origine et le cookie de session. La préproduction est opérationnelle ; la limite du plan gratuit est son arrêt après une période d'inactivité et l'absence de services privés gratuits pour reproduire toute l'architecture.

## E22 — Sécurité et administration de production

J'ai placé `MONGO_URI`, `JWT_SECRET`, `SERVICE_KEY` et les paramètres email dans les variables Render, hors du dépôt. L'accès Atlas a été autorisé pour les plages IP sortantes Render. Le cookie de session est HTTPOnly et `Secure` sous `NODE_ENV=production` ; le rôle administrateur est relu dans MongoDB. Les prix de commande sont recalculés côté serveur et le stock est réservé par mise à jour conditionnelle. **La production distincte n'a pas été créée** : je ne peux donc pas revendiquer l'administration sécurisée de deux environnements.

## E23 — Domaine, DNS et HTTPS

La préproduction est accessible via le sous-domaine Render `techluna-preprod.onrender.com` en HTTPS. Le navigateur et la réponse HTTPS ont été observés. Render gère le certificat du sous-domaine. Je n'ai pas réservé de domaine personnalisé ni ajouté de zone DNS ; je n'ai pas de seconde URL/certificat de production à vérifier. Le certificat est géré par la plateforme, et je ne revendique pas une installation manuelle de Let's Encrypt.

## E24 — CI/CD

`.github/workflows/ci.yml` s'exécute sur les push et pull requests : installation, tests backend/frontend, ESLint, build Vite, validation Compose et construction des images. La capture `08-CI.png` montre la réussite des exécutions. `.github/workflows/deploy.yml` définit un workflow manuel qui vérifie, construit et pousse une image vers GHCR, puis appelle un deploy hook Render selon l'environnement. Mon service Render actuel est **lié au dépôt Git** : le déploiement prouvé dans `01-render.png` a été déclenché manuellement depuis Render et reconstruit le commit ; l'image GHCR n'en est pas la source. Aucune capture ne prouve encore l'exécution du workflow Deploy ni un déploiement automatisé de production.

## E25 — Journaux et audit

J'ai remplacé les sorties `console.log/error` des services Node actifs par Winston : horodatage, niveau et nom du service au format JSON sur stdout. La capture Render `01-render.png` montre ces logs au démarrage. Les secrets, URI et jetons ne sont pas volontairement inscrits dans les logs. J'ai ajouté ESLint, Prettier et des contrôles de dépendances ; je n'ai pas joint de capture finale de `npm audit` pour chaque composant et ne revendique pas un audit exhaustif des deux environnements.

## E26 — Supervision et alertes

Le profil Docker Compose `monitoring` contient Prometheus, Blackbox Exporter et Alertmanager ; une règle `ServiceIndisponible` se déclenche après deux minutes d'échec de sonde et transmet l'alerte au service de notifications local. `monitoring/prometheus-cloud.example.yml` prévoit deux URL Render à remplacer. Je n'ai pas joint de capture d'une sonde réellement `UP`, d'une alerte déclenchée ou d'un email d'alerte ; la production n'existe pas encore. E26 est donc **configuré dans le code, non démontré de bout en bout**.

## E27 — Bugs détectés et corrections

J'ai corrigé les prix de commande initialement fournis par le navigateur : le backend relit les produits et calcule le total en base. J'ai ajouté une réservation de stock conditionnelle, restreint la suppression et la gestion des commandes aux administrateurs, validé les statuts, corrigé le CORS local qui bloquait l'inscription et remplacé le test React obsolète. L'accueil montre quatre produits mis en avant ; `/boutique` présente les 25 produits. Le panier affiche la quantité entre les boutons `+` et `−`. Les formulaires affichent les champs obligatoires et des retours d'erreur/succès. Les tests backend couvrent la sonde, les refus 400/401/403 et un appel Resend simulé ; le test frontend couvre le panier. J'ai testé l'inscription, la connexion et la session en local, puis retiré le compte d'essai. Je n'ai pas joint de capture d'un cycle complet commande/admin en préproduction.

## E28 — Failles et corrections

J'ai exclu `.env` de Git et du ZIP, validé les entrées avec Joi et Mongoose, refusé un nom contenant `<script>`, limité les tentatives de connexion, utilisé un cookie JWT HTTPOnly, revérifié le rôle administrateur en base et limité les origines CORS en production. Les échanges internes utilisent `SERVICE_KEY`. L'API limite la taille du JSON et renvoie des messages d'erreur contrôlés. Les réservations multi-produits sont compensées en cas d'échec, mais sans transaction MongoDB une panne totale du processus peut encore laisser un état partiel. Le paiement bancaire n'est pas intégré.

## E29 — Documentation et historique

J'ai documenté les fonctions critiques avec des commentaires/JSDoc et généré `docs/API_GENEREE.md` depuis les routes avec `npm run docs:api` (19 routes observées dans `09-terminal.png`). Le `README.md` donne un démarrage local reproductible avec `npm start` et décrit le déploiement réel. `CHANGELOG.md` retrace les corrections. Les commentaires ne couvrent pas littéralement chaque fichier et tous les parcours ne sont pas encore illustrés. Ce rapport précise les tâches et leurs limites au lieu de présenter une configuration comme une preuve d'exécution.

## Séquence de réalisation

1. J'ai inventorié le frontend React, l'API Express, MongoDB, la gateway et les microservices, puis repéré les bugs de commande, stock et accès.
2. J'ai corrigé les contrôleurs, ajouté les validations, les cookies HTTPOnly, le contrôle admin et les tests de refus. J'ai vérifié le catalogue local et l'inscription/connexion.
3. J'ai intégré le logo et les 25 visuels dans six catégories, harmonisé l'interface et les formulaires, ajouté les confirmations et le panier corrigé.
4. J'ai créé les Dockerfiles, Docker Compose, la CI GitHub Actions, le workflow Deploy, les journaux Winston et la configuration Prometheus/Alertmanager.
5. J'ai relié Render à GitHub et Atlas, ajouté les variables secrètes et autorisé les plages IP Render dans Atlas. Après correction du Dockerfile racine, j'ai obtenu le statut Live et vérifié les endpoints HTTPS.
6. J'ai généré la documentation API, mis à jour le changelog et pris les captures effectivement présentes. Les étapes de production, DNS et supervision active restent à réaliser.

## Pièces et accès

Le rendu contient le code, les Dockerfiles, les workflows, `README.md`, `CHANGELOG.md`, `docs/API_GENEREE.md` et six captures : `01-render.png`, `02-accueil.png`, `03-boutique.png`, `05-validation.png`, `08-CI.png`, `09-terminal.png`. Les fichiers `.env` réels et leurs secrets ne sont pas inclus ; `.env.example` est fourni. Si des accès de démonstration sont requis, je les communique au jury par un canal privé, séparément du dépôt public.
