// server.js
const express = require('express');
require('dotenv').config();
const connectDB = require('./config/db');

const app = express();
app.disable('x-powered-by');
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  const allowed = (process.env.APP_ORIGIN || 'http://localhost:5173').split(',');
  const origin = req.headers.origin;
  if (origin && allowed.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  }
  if (req.method === 'OPTIONS') return res.sendStatus(origin && !allowed.includes(origin) ? 403 : 204);
  if (origin && !allowed.includes(origin) && !['GET', 'HEAD'].includes(req.method)) return res.status(403).json({ message: 'Origine interdite.' });
  req.cookies = Object.fromEntries((req.headers.cookie || '').split(';').map((part) => {
    const separator = part.indexOf('=');
    return separator > 0 ? [part.slice(0, separator).trim(), part.slice(separator + 1).trim()] : ['', ''];
  }).filter(([key, value]) => key && value));
  next();
});
app.use(express.json({ limit: '32kb' }));
app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.post('/internal/stock/reserve', async (req, res, next) => {
  if (!process.env.SERVICE_KEY || req.get('x-service-key') !== process.env.SERVICE_KEY) return res.sendStatus(403);
  const { id, integer } = require('./validation');
  const { productId, quantity } = req.body || {};
  if (!id(productId) || !integer(quantity, 1)) return res.status(400).json({ message: 'Données invalides.' });
  try {
    const product = await require('./models/Product').findOneAndUpdate({ _id: productId, stock: { $gte: quantity } }, { $inc: { stock: -quantity } }, { new: true });
    if (!product) return res.status(409).json({ message: 'Stock insuffisant.' });
    res.json({ productId, stock: product.stock });
  } catch (error) { next(error); }
});
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/admin', require('./routes/secureAdminRoutes'));

const PORT = process.env.PORT || 5000;
app.use((error, req, res, next) => {
  console.error('Erreur API:', error.message);
  res.status(error.type === 'entity.parse.failed' ? 400 : 500).json({ message: 'Erreur serveur.' });
});
if (require.main === module) connectDB().then(() => app.listen(PORT, () => console.log(`API en écoute sur ${PORT}`)));
module.exports = app;
