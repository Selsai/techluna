const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const routeFiles = [
  ['backend/routes/authRoutes.js', '/api/auth'],
  ['backend/routes/productRoutes.js', '/api/products'],
  ['backend/routes/orderRoutes.js', '/api/orders'],
  ['backend/routes/secureAdminRoutes.js', '/api/admin'],
];
const rows = [];
for (const [file, prefix] of routeFiles) {
  const source = fs.readFileSync(path.join(root, file), 'utf8');
  const sharedAdminGuard = /router\.use\(authenticateToken, isAdmin\)/.test(source);
  const expression = /router\.(get|post|put|patch|delete)\(\s*['"]([^'"]+)['"]\s*,([^;]+)\);/g;
  for (const match of source.matchAll(expression)) {
    const [, method, suffix, handlers] = match;
    const access = sharedAdminGuard || /\bisAdmin\b/.test(handlers) ? 'Administrateur' : /\bauthenticateToken\b/.test(handlers) ? 'Session' : 'Public';
    rows.push(`| ${method.toUpperCase()} | \`${prefix}${suffix === '/' ? '' : suffix}\` | ${access} | \`${file}\` |`);
  }
}
const content = [
  '# Référence API générée depuis les routes',
  '',
  '> Génération : `npm run docs:api` à la racine du projet. Ce tableau est extrait des fichiers de routes ; les règles détaillées de validation se trouvent dans les contrôleurs.',
  '',
  '| Méthode | Chemin | Accès | Source |',
  '| --- | --- | --- | --- |',
  '| GET | `/health` | Public | `backend/server.js` |',
  '| POST | `/internal/stock/reserve` | Clé interservices | `backend/server.js` |',
  ...rows,
  '',
  '## Données et sécurité',
  '',
  'Les sessions utilisent le cookie HTTPOnly `session`. Les contrôleurs valident les entrées. Une commande reçoit `items: [{ productId, quantity }]`, `shippingAddress`, `paymentMethod` et `shippingMethod` ; ses prix sont relus en base. Les réponses prévues comprennent 400 (entrée invalide), 401 (session absente), 403 (rôle insuffisant) et 409 (conflit de stock ou de compte).',
  '',
  'Services locaux complémentaires : `GET /health` et `POST /notify` pour les notifications, `GET /health` et `POST /update-stock` pour le stock, avec passage par la gateway Docker Compose.',
  '',
].join('\n');
const output = path.join(root, 'docs', 'API_GENEREE.md');
fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, content, 'utf8');
console.log(`Documentation générée : ${path.relative(root, output)} (${rows.length + 2} routes).`);
