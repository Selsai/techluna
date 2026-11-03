const nodemailer = require('nodemailer');
const logger = require('./logger');

/** Choisit Resend HTTPS si une clé est présente, sinon le SMTP local. */
module.exports = async ({ to, subject, text }) => {
  if (process.env.RESEND_API_KEY) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ from: process.env.RESEND_FROM || 'TechLuna <onboarding@resend.dev>', to: [to], subject, text }),
        signal: controller.signal,
      });
      if (!response.ok) throw new Error(`Resend HTTP ${response.status}`);
      logger.info('Email accepté par Resend', { status: response.status });
      return;
    } finally { clearTimeout(timeout); }
  }
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASSWORD) throw new Error('SMTP non configuré');
  const transporter = nodemailer.createTransport({ host: process.env.SMTP_HOST, port: Number(process.env.SMTP_PORT || 587), secure: process.env.SMTP_PORT === '465', auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD } });
  await transporter.sendMail({ from: process.env.SMTP_FROM || process.env.SMTP_USER, to, subject, text });
  logger.info('Email accepté par SMTP');
};
