require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const logger = require('./logger');
const app = express();
app.use(express.json({ limit: '16kb' }));
app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.post('/alerts', async (req, res) => {
  const alerts = Array.isArray(req.body?.alerts) ? req.body.alerts.slice(0, 20) : [];
  if (!alerts.length) return res.status(400).json({ message: 'Alerte invalide.' });
  logger.warn('Alerte supervision reçue', { alerts: alerts.map((alert) => ({ status: alert.status, name: alert.labels?.alertname, instance: alert.labels?.instance })) });
  if (!process.env.ADMIN_EMAIL || !process.env.SMTP_HOST) return res.status(202).json({ message: 'Alerte journalisée ; email non configuré.' });
  try {
    const transporter = nodemailer.createTransport({ host: process.env.SMTP_HOST, port: Number(process.env.SMTP_PORT || 587), secure: process.env.SMTP_PORT === '465', auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD } });
    await transporter.sendMail({ from: process.env.SMTP_FROM || process.env.SMTP_USER, to: process.env.ADMIN_EMAIL, subject: 'Alerte supervision boutique', text: alerts.map((alert) => `${alert.status}: ${alert.annotations?.summary || alert.labels?.alertname || 'Service'}`).join('\n') });
    res.json({ message: 'Alerte envoyée.' });
  } catch (error) { logger.error('Alerte email impossible', { error: error.name }); res.status(502).json({ message: 'Alerte non envoyée.' }); }
});
app.post('/notify', async (req, res) => {
  if (!process.env.SERVICE_KEY || req.get('x-service-key') !== process.env.SERVICE_KEY) return res.sendStatus(403);
  const { to, subject, text } = req.body || {};
  if (![to, subject, text].every((value) => typeof value === 'string' && value.length > 0 && value.length < 2000) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) return res.status(400).json({ message: 'Notification invalide.' });
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASSWORD) return res.status(503).json({ message: 'SMTP non configuré.' });
  try {
    const transporter = nodemailer.createTransport({ host: process.env.SMTP_HOST, port: Number(process.env.SMTP_PORT || 587), secure: process.env.SMTP_PORT === '465', auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD } });
    await transporter.sendMail({ from: process.env.SMTP_FROM || process.env.SMTP_USER, to, subject, text });
    res.json({ message: 'Notification envoyée.' });
  } catch (error) { logger.error('Notification SMTP impossible', { error: error.name }); res.status(502).json({ message: 'Échec de notification.' }); }
});
if (require.main === module) app.listen(process.env.PORT || 4002, () => logger.info('Notifications prêtes'));
module.exports = app;
