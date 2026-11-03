const axios = require('axios');
const logger = require('./logger');
const sendResend = require('./resend');

/** Envoie une notification interservices sans bloquer la réponse HTTP principale. */
module.exports = (to, subject, text) => {
  if (!to) return;
  if (process.env.RESEND_API_KEY) {
    sendResend({ to, subject, text }).catch((error) => logger.warn('Email Resend impossible', { error: error.message }));
    return;
  }
  if (!process.env.NOTIFICATION_URL || !process.env.SERVICE_KEY) return;
  axios.post(process.env.NOTIFICATION_URL, { to, subject, text }, {
    headers: { 'x-service-key': process.env.SERVICE_KEY },
    timeout: 5000,
  }).catch((error) => logger.warn('Notification indisponible', { error: error.name }));
};
