const { test } = require('node:test');
const assert = require('node:assert/strict');
process.env.JWT_SECRET = 'test-only-secret';
process.env.SERVICE_KEY = 'test-service-key';
const app = require('./server');

test('sonde, session absente et accès interne protégé', async () => {
  const server = app.listen(0);
  try {
    const base = `http://127.0.0.1:${server.address().port}`;
    assert.equal((await fetch(`${base}/health`)).status, 200);
    assert.equal((await fetch(`${base}/api/orders/mine`)).status, 401);
    assert.equal((await fetch(`${base}/api/admin/products`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' })).status, 401);
    assert.equal((await fetch(`${base}/api/admin/products/000000000000000000000000`, { method: 'DELETE' })).status, 401);
    assert.equal((await fetch(`${base}/api/auth/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' })).status, 400);
    assert.equal((await fetch(`${base}/api/auth/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: "<script>alert('test')</script>", email: 'test@example.com', password: 'secure-password-123' }) })).status, 400);
    assert.equal((await fetch(`${base}/internal/stock/reserve`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' })).status, 403);
    assert.equal((await fetch(`${base}/api/auth/register`, { method: 'POST', headers: { Origin: 'https://attacker.example', 'Content-Type': 'application/json' }, body: '{}' })).status, 403);
    assert.equal((await fetch(`${base}/api/auth/register`, { method: 'POST', headers: { Origin: 'http://127.0.0.1:5174', 'Content-Type': 'application/json' }, body: '{}' })).status, 400);
  } finally { server.close(); }
});
