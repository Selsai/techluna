const test = require('node:test');
const assert = require('node:assert/strict');
const sendResend = require('./resend');

test('Resend envoie un email texte par HTTPS sans exposer la clé', async () => {
  const previousKey = process.env.RESEND_API_KEY;
  const previousFrom = process.env.RESEND_FROM;
  const previousFetch = global.fetch;
  process.env.RESEND_API_KEY = 'test-secret';
  process.env.RESEND_FROM = 'TechLuna <onboarding@resend.dev>';
  let request;
  global.fetch = async (url, options) => {
    request = { url, options };
    return { ok: true, status: 200 };
  };
  try {
    await sendResend({ to: 'client@example.com', subject: 'Commande', text: 'Confirmation' });
    assert.equal(request.url, 'https://api.resend.com/emails');
    assert.equal(request.options.headers.Authorization, 'Bearer test-secret');
    assert.deepEqual(JSON.parse(request.options.body).to, ['client@example.com']);
    assert.match(JSON.parse(request.options.body).html, /logo-techluna\.png/);
    assert.match(JSON.parse(request.options.body).html, /TechLuna/);
  } finally {
    global.fetch = previousFetch;
    if (previousKey === undefined) delete process.env.RESEND_API_KEY; else process.env.RESEND_API_KEY = previousKey;
    if (previousFrom === undefined) delete process.env.RESEND_FROM; else process.env.RESEND_FROM = previousFrom;
  }
});
