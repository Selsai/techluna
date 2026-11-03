const axios = require('axios');
const logger = require('./logger');

/** Envoie une notification interservices sans bloquer la réponse HTTP principale. */
module.exports = (to, subject, text) => {
  if (!process.env.NOTIFICATION_URL || !process.env.SERVICE_KEY || !to) return;
  axios.post(process.env.NOTIFICATION_URL, { to, subject, text }, {
    headers: { 'x-service-key': process.env.SERVICE_KEY },
    timeout: 5000,
  }).catch((error) => logger.warn('Notification indisponible', { error: error.name }));
};
