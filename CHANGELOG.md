# Journal des évolutions

## 2026-11-03

- Correction CORS des origines locales de développement (`localhost` et `127.0.0.1`, avec le port Vite utilisé) ; restriction exacte conservée en production.
- Séparation de l'accueil (quatre coups de cœur) et de la boutique complète ; navigation dédiée dans l'en-tête.
- Ajout des champs obligatoires signalés, de messages d'erreur et de confirmations visibles après inscription et commande.
- Confirmation par email de la commande client préparée avec Resend ; le paiement actuel est indiqué comme simulation en attendant Stripe.
- Préparation d'une image Render Free réunissant l'API et le frontend sur une même origine HTTPS.
- Remplacement des journaux `console.log/error` actifs par Winston JSON dans le backend, la gateway et les microservices.
- Extension du workflow GitHub Actions : vérification, construction et publication dans GHCR, puis déclenchement du déploiement Render.
- Ajout de schémas Joi, de notifications de changement de statut et de stock, et d'une référence API générée depuis les routes.
- Réécriture du README et approfondissement du rapport d'examen à la première personne avec traçabilité des tâches et limites vérifiées.
- Diagnostic local : MongoDB 7 ne démarre pas sur le processeur sans AVX ; ajout d'une variante MongoDB 4.4 pour les essais locaux et vérification des 25 produits via l'API.
- Ajout de l'envoi Resend par HTTPS pour Render Free et d'un test de l'appel API sans véritable clé ; envoi réel à vérifier après configuration des secrets.
- Suppression de l'exposition du JWT dans le frontend et les journaux ; session en cookie HTTPOnly.
- Vérification du rôle administrateur depuis la base de données et contrôle des entrées d'API.
- Calcul des montants sur les prix en base, réservation atomique du stock et correction des routes de commande.
- Mise en service des notifications SMTP et du microservice de stock.
- Ajout des conteneurs, du reverse proxy HTTPS et des workflows CI et déploiement.
- Correction du panier React et du test obsolète.
- Migration de Create React App vers Vite et Vitest pour réduire la dette de dépendances.
- Ajout de la gestion administrateur des produits et des utilisateurs et du suivi des commandes client.
- Intégration de 25 visuels fournis et du logo TechLuna, classement du catalogue en six univers et nouvelle interface boutique responsive.
