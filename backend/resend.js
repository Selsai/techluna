const logger = require('./logger');
const emailTemplate = require('./emailTemplate');

/** Envoie un email par HTTPS pour les services Render Free qui bloquent SMTP. */
module.exports = async ({ to, subject, text }) => {
  if (!process.env.RESEND_API_KEY) throw new Error('Resend non configuré');
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: process.env.RESEND_FROM || 'TechLuna <onboarding@resend.dev>', to: [to], subject, text, html: emailTemplate({ subject, text }) }),
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`Resend HTTP ${response.status}`);
    logger.info('Email accepté par Resend', { status: response.status });
  } finally { clearTimeout(timeout); }
};
