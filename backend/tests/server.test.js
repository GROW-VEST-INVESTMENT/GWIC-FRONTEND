const assert = require('node:assert/strict');
const { after, test } = require('node:test');
const { app } = require('../server');

const server = app.listen(0, '127.0.0.1');
const listening = new Promise((resolve, reject) => {
  server.once('listening', resolve);
  server.once('error', reject);
});

after(async () => {
  await listening;
  await new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
});

async function request(path, origin) {
  await listening;
  return fetch(`http://127.0.0.1:${server.address().port}${path}`, {
    headers: origin ? { Origin: origin } : {},
  });
}

test('root endpoint identifies Kalma Capital', async () => {
  const response = await request('/');
  assert.equal(response.status, 200);
  assert.match((await response.json()).message, /Kalma Capital/);
});

test('admin operations require an authenticated session', async () => {
  const response = await request('/api/admin/operations/wallets');
  assert.equal(response.status, 401);
});

test('admin user profiles require an authenticated session', async () => {
  const response = await request('/api/admin/users/507f1f77bcf86cd799439011');
  assert.equal(response.status, 401);
});

test('credentialed CORS accepts official domains and rejects unconfigured Vercel origins', async () => {
  for (const origin of [
    'https://kalmacapital.com',
    'https://www.kalmacapital.com',
    'https://kalmacapital.com.ng',
    'https://www.kalmacapital.com.ng',
  ]) {
    const allowed = await request('/', origin);
    assert.equal(allowed.headers.get('access-control-allow-origin'), origin);
    assert.equal(allowed.headers.get('access-control-allow-credentials'), 'true');
  }

  const rejected = await request('/', 'https://untrusted-project.vercel.app');
  assert.equal(rejected.headers.get('access-control-allow-origin'), null);
});
