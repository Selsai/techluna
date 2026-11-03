const express = require('express');
const logger = require('./logger');
const app = express();
const PORT = process.env.PORT || 4003;

app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.post('/update-stock', async (req, res) => {
    if (!process.env.SERVICE_KEY || req.get('x-service-key') !== process.env.SERVICE_KEY) return res.sendStatus(403);
    const { productId, quantity } = req.body || {};
    if (!/^[a-f\d]{24}$/i.test(productId || '') || !Number.isInteger(quantity) || quantity < 1) return res.status(400).json({ message: 'Données invalides.' });
    try {
      const response = await fetch(`${process.env.BACKEND_URL || 'http://localhost:5000'}/internal/stock/reserve`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-service-key': process.env.SERVICE_KEY }, body: JSON.stringify({ productId, quantity }) });
      res.status(response.status).json(await response.json());
    } catch (error) { logger.error('Erreur stock', { error: error.name }); res.status(500).json({ message: 'Erreur serveur.' }); }
});

if (require.main === module) app.listen(PORT, () => logger.info('Service stock prêt', { port: PORT }));
module.exports = app;
