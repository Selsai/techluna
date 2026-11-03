# Référence API générée depuis les routes

> Génération : `npm run docs:api` à la racine du projet. Ce tableau est extrait des fichiers de routes ; les règles détaillées de validation se trouvent dans les contrôleurs.

| Méthode | Chemin | Accès | Source |
| --- | --- | --- | --- |
| GET | `/health` | Public | `backend/server.js` |
| POST | `/internal/stock/reserve` | Clé interservices | `backend/server.js` |
| POST | `/api/auth/login` | Public | `backend/routes/authRoutes.js` |
| POST | `/api/auth/register` | Public | `backend/routes/authRoutes.js` |
| GET | `/api/auth/me` | Session | `backend/routes/authRoutes.js` |
| POST | `/api/auth/logout` | Public | `backend/routes/authRoutes.js` |
| GET | `/api/products` | Public | `backend/routes/productRoutes.js` |
| PUT | `/api/products/:productId/stock` | Administrateur | `backend/routes/productRoutes.js` |
| GET | `/api/orders` | Administrateur | `backend/routes/orderRoutes.js` |
| GET | `/api/orders/mine` | Session | `backend/routes/orderRoutes.js` |
| POST | `/api/orders` | Session | `backend/routes/orderRoutes.js` |
| DELETE | `/api/orders/:id` | Administrateur | `backend/routes/orderRoutes.js` |
| PUT | `/api/orders/:id/validate` | Administrateur | `backend/routes/orderRoutes.js` |
| PUT | `/api/orders/:orderId/status` | Administrateur | `backend/routes/orderRoutes.js` |
| GET | `/api/admin/users` | Administrateur | `backend/routes/secureAdminRoutes.js` |
| PUT | `/api/admin/users/:id/role` | Administrateur | `backend/routes/secureAdminRoutes.js` |
| POST | `/api/admin/products` | Administrateur | `backend/routes/secureAdminRoutes.js` |
| PUT | `/api/admin/products/:id` | Administrateur | `backend/routes/secureAdminRoutes.js` |
| DELETE | `/api/admin/products/:id` | Administrateur | `backend/routes/secureAdminRoutes.js` |

## Données et sécurité

Les sessions utilisent le cookie HTTPOnly `session`. Les contrôleurs valident les entrées. Une commande reçoit `items: [{ productId, quantity }]`, `shippingAddress`, `paymentMethod` et `shippingMethod` ; ses prix sont relus en base. Les réponses prévues comprennent 400 (entrée invalide), 401 (session absente), 403 (rôle insuffisant) et 409 (conflit de stock ou de compte).

Services locaux complémentaires : `GET /health` et `POST /notify` pour les notifications, `GET /health` et `POST /update-stock` pour le stock, avec passage par la gateway Docker Compose.
