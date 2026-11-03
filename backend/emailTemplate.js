/** Échappe les données variables avant leur insertion dans l'email HTML. */
const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);

/** Construit une confirmation TechLuna lisible dans les clients email. */
module.exports = ({ subject, text }) => {
  const origin = (process.env.RENDER_EXTERNAL_URL || 'https://techluna-preprod.onrender.com').replace(/\/$/, '');
  const logo = `${origin}/images/logo-techluna.png`;
  const paragraphs = String(text).split('\n').map((line) => `<p style="margin:0 0 12px;color:#51434d;line-height:1.6">${escapeHtml(line)}</p>`).join('');
  return `<!doctype html><html lang="fr"><body style="margin:0;padding:32px 12px;background:#f9f5f5;font-family:Arial,sans-serif"><div style="max-width:560px;margin:auto;padding:32px;background:#fffdfb;border-radius:20px;border:1px solid #eee4e8"><div style="text-align:center"><img src="${escapeHtml(logo)}" width="72" height="72" alt="Logo TechLuna" style="object-fit:contain;border-radius:50%"><h1 style="margin:8px 0 4px;color:#432b3e;font-family:Georgia,serif">TechLuna</h1><p style="margin:0 0 28px;color:#8b7783;font-size:12px;letter-spacing:2px">TECH & LIFESTYLE</p></div><h2 style="color:#713c5a;font-size:20px;font-weight:normal">${escapeHtml(subject)}</h2>${paragraphs}<div style="margin-top:28px;padding-top:18px;border-top:1px solid #eee4e8;color:#8b7783;font-size:12px;text-align:center">TechLuna · Réalisé par Selsabil Amairi</div></div></body></html>`;
};
