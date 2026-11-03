# Rapport de maintenance et de mise en production

Date : 3 novembre 2026. TechLuna, application MERN de vente en ligne.

Le catalogue de démonstration comporte 25 produits avec les visuels fournis par la candidate, le logo TechLuna et six catégories. Les prix sont illustratifs ; ils ne constituent pas une offre commerciale réelle.

## Périmètre et état réel

Le code, les conteneurs, la configuration CI/CD et la supervision locale sont livrés dans ce dépôt. La candidate a choisi Render et ses sous-domaines `onrender.com` pour la future mise en ligne. La capture du tableau de bord confirme l'existence de son compte Render et de services antérieurs ; aucun service TechLuna, base MongoDB hébergée, boîte SMTP ou dépôt Git distant TechLuna n'est encore configuré. Ces étapes externes restent à exécuter et à illustrer. Les mots de passe ne doivent pas figurer dans le rapport rendu ; remettre les secrets via un canal privé au jury si nécessaire.

## E21 — Hébergement

Choix retenu par la candidate : Render, avec deux services web séparés pour préproduction et production, chacun sur son sous-domaine `onrender.com`. Render fournit le routage HTTPS et des déploiements liés à Git ; ses [services web](https://render.com/docs/web-services) ont une URL publique et ses [services privés](https://render.com/docs/private-services) peuvent isoler les microservices. La base MongoDB sera une instance Atlas distincte par environnement, ou un MongoDB privé avec disque persistant, à choisir lors de la création des comptes. Render [documente la connexion à Atlas](https://render.com/docs/connect-to-mongodb-atlas). Comparer à ce moment les coûts des services privés, la région, les sauvegardes et les limites du plan retenu. Les conteneurs Compose fournis servent au développement et aux tests locaux.

## E22 — Environnement sécurisé

1. Créer deux environnements Render séparés, reliés aux branches Git choisies, avec des services et bases distincts.
2. Configurer les variables secrètes dans le tableau de bord Render : URI MongoDB, `JWT_SECRET`, `SERVICE_KEY`, `NODE_ENV=production`, SMTP et origine publique. Ne jamais les commiter.
3. Publier le frontend et l'API derrière la même origine publique pour conserver le cookie de session. Garder gateway et microservices sur le réseau privé Render. Le schéma précis des services sera figé lors de l'ouverture du compte et du choix du plan.
4. Tester `/health`, l'inscription, la connexion, la commande et l'administration sur la préproduction avant production.

En local, seul Caddy expose 80/443 ; MongoDB, l'API, la gateway et les microservices restent sur le réseau Compose interne. Sur Render, le routage TLS sera pris en charge par la plateforme. Le JWT est dans un cookie HTTPOnly, avec `Secure` en production ; le rôle est revérifié dans MongoDB. Les montants sont recalculés côté serveur et le stock est réservé par mise à jour atomique. Le backend refuse les origines non prévues pour les requêtes de modification. Aucun paiement bancaire réel n'est collecté : le mode est uniquement un choix de simulation.

## E23 — Domaine, DNS et TLS

Render attribue un sous-domaine `onrender.com` à chaque service web et [gère automatiquement ses certificats TLS](https://render.com/docs/tls). Aucun domaine personnalisé ni zone DNS n'est nécessaire pour la première mise en ligne. Après création des services, vérifier les deux noms réellement attribués, `curl -I https://<nom>/health`, la redirection HTTP vers HTTPS et la validité du certificat dans le navigateur. La configuration DNS personnalisée demandée dans la consigne ne s'appliquera que si la candidate décide plus tard d'acheter un domaine ; cela sera indiqué comme non réalisé dans le rendu actuel.

## E24 — CI/CD

`.github/workflows/ci.yml` lance installation, test du panier, compilation React, lint, contrôle de syntaxe API, validation Compose et construction des images. `.github/workflows/deploy.yml` répète les vérifications puis déclenche les [deploy hooks Render](https://render.com/docs/deploy-hooks) de l'environnement choisi. Créer les environnements GitHub `preproduction` et `production`, protéger la production par validation humaine et définir `RENDER_DEPLOY_HOOK_URL` pour le service public, ainsi que les hooks des services privés `RENDER_GATEWAY_DEPLOY_HOOK_URL`, `RENDER_NOTIFICATIONS_DEPLOY_HOOK_URL` et `RENDER_STOCK_DEPLOY_HOOK_URL` lorsqu'ils existent. Chaque hook est un secret. Une fois les services connectés à Git, Render peut aussi attendre [la réussite des contrôles CI](https://render.com/docs/deploys) avant un déploiement automatique. La création des services, des hooks et la vérification des déploiements restent à faire après l'ouverture du compte.

## E25 — Journalisation et audit

Les logs API, gateway, notifications, stock, Caddy et MongoDB vont vers stdout/stderr ; `docker compose logs --since=1h` permet l'audit local. Caddy écrit des lignes JSON. Sur Render, consulter les journaux de chaque service et prévoir un export si une rétention longue est exigée. Les secrets et jetons ne sont plus inscrits dans les logs actifs. L'audit npm de l'API et des dépendances de production du frontend a été ramené à zéro vulnérabilité ; l'outillage de développement ESLint comporte encore des alertes modérées transitives à suivre. Répéter `npm audit --omit=dev` et `npm audit` régulièrement, ainsi que sur les autres services avant déploiement.

## E26 — Supervision et alertes

Le profil Compose `monitoring` démarre Prometheus, Blackbox Exporter et Alertmanager pour le test local. Les sondes HTTP testent le frontend, le backend, la gateway, les notifications et le stock toutes les 30 secondes. Après deux minutes d'échec, l'alerte `ServiceIndisponible` est transmise au microservice de notification, qui envoie un email à `ADMIN_EMAIL` si SMTP est configuré. Sur Render, créer une supervision séparée pour chaque environnement, avec sondes HTTPS externes sur les URL `onrender.com` et alertes vers une adresse de contrôle. Tester en préproduction l'arrêt d'un service, le déclenchement et la résolution avant d'appliquer la même configuration en production.

## E27 — Bugs constatés et corrections

| Défaut initial | Correction |
| --- | --- |
| Commande calculée avec les prix envoyés par le navigateur | Relecture des produits en base et calcul serveur |
| Stock jamais réellement décrémenté | Réservation atomique avec contrôle du stock et compensation sur échec |
| Suppression de commande accessible à tout utilisateur connecté | Restriction administrateur |
| Statut de commande non validé | Liste de statuts autorisés et identifiant contrôlé |
| Stock accepté comme chaîne ou valeur négative | Entier non négatif obligatoire |
| Service de notification vide/incomplet | Envoi SMTP réel et réponse d'erreur explicite |
| Test React de démonstration obsolète | Test du comportement du panier avec Vitest |
| Sous-dépôt frontend inaccessible à la CI parent | Intégration des sources au dépôt principal ; sauvegarde locale du dépôt initial |
| Outillage Create React App obsolète | Migration vers Vite et réduction des dépendances exposées |

## E28 — Sécurité et robustesse

Validation des champs de compte, adresses, quantités, identifiants et statuts ; limitation de la taille JSON ; gestion centralisée des erreurs ; limitation des tentatives de connexion ; clé interservices ; variables d'environnement exclues de Git et des images Docker ; en-têtes de sécurité ; cookie HTTPOnly. Les parcours critiques doivent être rejoués en préproduction avec des données de test avant toute mise en ligne. Pour une exploitation commerciale réelle, ajouter un prestataire de paiement conforme et des transactions MongoDB sur replica set pour garantir l'atomicité multi-produit en cas de panne totale du processus.

## E29 — Documentation et journal des évolutions

Les contrats d'API ci-dessous, ce rapport et `CHANGELOG.md` constituent la documentation livrée avec le code. Les points d'entrée sont `GET /api/products`, `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`, `POST /api/auth/logout`, `POST /api/orders`, `GET /api/orders/mine`, `GET /api/orders` (admin), `PUT /api/orders/:orderId/status` (admin), `PUT /api/products/:productId/stock` (admin), ainsi que `/api/admin/products` et `/api/admin/users` pour les opérations de gestion. Le JSON d'une commande contient `items: [{productId, quantity}]`, `shippingAddress`, `paymentMethod`, `shippingMethod` ; `price` et `total` envoyés par le client sont ignorés.

## Preuves à joindre au rendu final

Les trois captures initiales dans `captures/` montrent le catalogue desktop, le catalogue mobile et la connexion sur une prévisualisation locale antérieure au changement de nom TechLuna. Le catalogue utilisait une API de démonstration de quatre fiches pour le contrôle du design ; ces images ne prouvent pas un déploiement Render ni un paiement réel. Le code livré et le logo portent l'identité finale TechLuna.

Captures à réaliser sur les vrais environnements, sans données sensibles visibles : tableau de bord Render avec deux services web et leurs services privés, URL `onrender.com` et certificat TLS de chacun, exécution verte de la CI, déploiement préproduction puis production, parcours boutique et administration, requête invalidée (400/403), journaux filtrés, sondes et email d'alerte, restauration de sauvegarde MongoDB. Joindre aussi les captures du profil Compose local si utiles. La zone DNS personnalisée n'existe pas avec le seul domaine fourni par Render. Les identifiants de connexion doivent être communiqués séparément au jury avec le minimum de privilèges nécessaire.
