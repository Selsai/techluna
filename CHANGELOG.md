# Journal des évolutions

## 2026-11-03

- Préparation d'une image Render Free réunissant l'API et le frontend sur une même origine HTTPS.
- Remplacement des journaux `console.log/error` actifs par Winston JSON dans le backend, la gateway et les microservices.
- Extension du workflow GitHub Actions : vérification, construction et publication dans GHCR, puis déclenchement du déploiement Render.
- Ajout de schémas Joi, de notifications de changement de statut et de stock, et d'une référence API générée depuis les routes.
- Réécriture du README et approfondissement du rapport d'examen à la première personne avec traçabilité des tâches et limites vérifiées.
- Diagnostic local : MongoDB 7 ne démarre pas sur le processeur sans AVX ; recours prévu à Atlas Free.
- Suppression de l'exposition du JWT dans le frontend et les journaux ; session en cookie HTTPOnly.
- Vérification du rôle administrateur depuis la base de données et contrôle des entrées d'API.
- Calcul des montants sur les prix en base, réservation atomique du stock et correction des routes de commande.
- Mise en service des notifications SMTP et du microservice de stock.
- Ajout des conteneurs, du reverse proxy HTTPS et des workflows CI et déploiement.
- Correction du panier React et du test obsolète.
- Migration de Create React App vers Vite et Vitest pour réduire la dette de dépendances.
- Ajout de la gestion administrateur des produits et des utilisateurs et du suivi des commandes client.
- Intégration de 25 visuels fournis et du logo TechLuna, classement du catalogue en six univers et nouvelle interface boutique responsive.
