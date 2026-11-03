# Rapport d'examen — TechLuna

Date du bilan : 3 novembre 2026. Dépôt : https://github.com/Selsai/techluna. Préproduction : https://techluna-preprod.onrender.com/.

## État réel du rendu

J'ai déployé **un environnement de préproduction** sur Render Free, relié à MongoDB Atlas. La capture `captures/01-render.png` montre le déploiement du commit `13b356e` au statut **Live**, les journaux Winston « MongoDB connecté » et « API en écoute ». J'ai vérifié `GET /health` (200) et `GET /api/products` (25 produits) ; `captures/09-terminal.png` montre ces réponses et la génération de la documentation API (19 routes). Les captures `02-accueil.png`, `03-boutique.png` et `05-validation.png` illustrent l'interface et la validation d'un formulaire. `08-CI.png` montre des exécutions CI vertes. Le commit `b304938` regroupe les captures.

La préproduction est le service déployé présenté dans ce rapport. La gateway, les microservices et la supervision disposent d'une configuration Docker Compose pour les démonstrations locales.

## E21 — Choix cloud et préproduction

J'ai choisi Render Free pour son déploiement Docker depuis GitHub, son URL HTTPS, ses journaux et son faible coût pour une démonstration. J'ai choisi MongoDB Atlas pour conserver les données hors du conteneur éphémère. Le service `techluna-preprod` construit le `Dockerfile` racine, qui compile React et démarre l'API Express dans une seule image. Cela permet à l'interface et à l'API de partager la même origine et le cookie de session. La préproduction est opérationnelle ; la limite du plan gratuit est son arrêt après une période d'inactivité et l'absence de services privés gratuits pour reproduire toute l'architecture.

## E22 — Sécurité et administration de production

J'ai placé les paramètres de connexion MongoDB, les clés de session et les paramètres email dans les variables Render, hors du dépôt. J'ai autorisé dans Atlas les plages IP sortantes du service Render. Le cookie de session est HTTPOnly et Secure sous NODE_ENV=production ; le rôle administrateur est relu dans MongoDB. Les prix de commande sont recalculés côté serveur et le stock est réservé par mise à jour conditionnelle.

## E23 — Domaine, DNS et HTTPS

La préproduction est accessible sur le sous-domaine Render techluna-preprod.onrender.com en HTTPS. Render fournit le certificat TLS du sous-domaine et renouvelle sa gestion. J'ai vérifié l'accès HTTPS dans le navigateur et avec les requêtes de contrôle.

## E24 — CI/CD

Le workflow GitHub Actions CI s'exécute sur les push et les pull requests : installation, tests backend/frontend, ESLint, build Vite, validation Compose et construction des images. La capture 08-CI.png montre des exécutions réussies. Le workflow Deploy définit la vérification du code, la construction et la publication d'une image dans GHCR, puis l'appel du deploy hook Render pour l'environnement sélectionné. Le service de préproduction est relié au dépôt GitHub ; Render reconstruit le commit lors du déploiement.

## E25 — Journaux et audit

J'ai remplacé les sorties console des services Node actifs par Winston. Les messages sont horodatés, classés par niveau, associés au nom du service et écrits en JSON sur stdout. La capture 01-render.png montre les journaux de connexion MongoDB et de démarrage de l'API. J'ai ajouté ESLint, Prettier et des commandes de contrôle des dépendances.

## E26 — Supervision et alertes

Le profil Docker Compose monitoring réunit Prometheus, Blackbox Exporter et Alertmanager. La règle ServiceIndisponible vérifie les sondes pendant deux minutes et transmet l'alerte au service de notifications local. Le modèle monitoring/prometheus-cloud.example.yml permet de configurer les URL des environnements Render.

## E27 — Bugs détectés et corrections

J'ai corrigé les prix de commande initialement fournis par le navigateur : le backend relit les produits et calcule le total en base. J'ai ajouté une réservation de stock conditionnelle, restreint la suppression et la gestion des commandes aux administrateurs, validé les statuts, corrigé le CORS local qui bloquait l'inscription et remplacé le test React obsolète. L'accueil montre quatre produits mis en avant ; `/boutique` présente les 25 produits. Le panier affiche la quantité entre les boutons `+` et `−`. Les formulaires affichent les champs obligatoires et des retours d'erreur/succès. Les tests backend couvrent la sonde, les refus 400/401/403 et un appel Resend simulé ; le test frontend couvre le panier. J'ai testé l'inscription, la connexion et la session en local, puis retiré le compte d'essai.

## E28 — Failles et corrections

J'ai exclu `.env` de Git et du ZIP, validé les entrées avec Joi et Mongoose, refusé un nom contenant `<script>`, limité les tentatives de connexion, utilisé un cookie JWT HTTPOnly, revérifié le rôle administrateur en base et limité les origines CORS en production. Les échanges internes utilisent `SERVICE_KEY`. L'API limite la taille du JSON et renvoie des messages d'erreur contrôlés. Les réservations multi-produits sont compensées en cas d'échec.

## E29 — Documentation et historique

J'ai ajouté des commentaires et des blocs JSDoc dans les fichiers qui portent les fonctions principales. J'ai généré docs/API_GENEREE.md à partir des routes avec npm run docs:api (19 routes observées dans 09-terminal.png). Le README explique le démarrage local avec npm start et le déploiement Render. CHANGELOG.md retrace les corrections et les améliorations.

## Séquence de réalisation

1. J'ai inventorié le frontend React, l'API Express, MongoDB, la gateway et les microservices, puis repéré les bugs de commande, stock et accès.
2. J'ai corrigé les contrôleurs, ajouté les validations, les cookies HTTPOnly, le contrôle admin et les tests de refus. J'ai vérifié le catalogue local et l'inscription/connexion.
3. J'ai intégré le logo et les 25 visuels dans six catégories, harmonisé l'interface et les formulaires, ajouté les confirmations et le panier corrigé.
4. J'ai créé les Dockerfiles, Docker Compose, la CI GitHub Actions, le workflow Deploy, les journaux Winston et la configuration Prometheus/Alertmanager.
5. J'ai relié Render à GitHub et Atlas, ajouté les variables secrètes et autorisé les plages IP Render dans Atlas. Après correction du Dockerfile racine, j'ai obtenu le statut Live et vérifié les endpoints HTTPS.
6. J'ai généré la documentation API, mis à jour le changelog et rassemblé les captures de l'interface, du déploiement, de la CI et des commandes de contrôle.

## Pièces et accès

Le rendu contient le code, les Dockerfiles, les workflows, `README.md`, `CHANGELOG.md`, `docs/API_GENEREE.md` et six captures : `01-render.png`, `02-accueil.png`, `03-boutique.png`, `05-validation.png`, `08-CI.png`, `09-terminal.png`. Les fichiers `.env` réels et leurs secrets ne sont pas inclus ; `.env.example` est fourni. Je peux transmettre les paramètres nécessaires à une démonstration par un canal privé.
