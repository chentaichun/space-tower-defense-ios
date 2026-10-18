// Real backend checks only. Never represents a physical StoreKit purchase.
import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { randomBytes } from 'node:crypto';
const setup = JSON.parse(await readFile('release/ios/device-test-setup.json', 'utf8'));
const base = 'https://space-tower-defense.pages.dev';
const name = setup.preflightName;
const password = randomBytes(24).toString('base64url');
let token = '';
const results = { checkedAt: new Date().toISOString(), version: setup.version, build: setup.build,
  physicalPurchaseVerified: false, physicalRestoreVerified: false, checks: [] };
async function call(path, method = 'GET', body, authenticated = false) {
  const response = await fetch(base + path, { method, headers: {
    'Content-Type': 'application/json', Origin: 'capacitor://localhost',
    ...(authenticated ? { Authorization: `Bearer ${token}` } : {})
  }, ...(body ? { body: JSON.stringify(body) } : {}) });
  return { status: response.status, data: await response.json() };
}
function pass(name) { results.checks.push(name); console.log(`PASS: ${name}`); }
try {
  const available = await call('/api/player', 'POST', { action: 'login', name: setup.testName, password });
  assert.equal(available.data.code, 'ACCOUNT_NOT_FOUND');
  pass('Recording Player ID is available for on-camera registration');
  const registered = await call('/api/player', 'POST', { action: 'register', name, password });
  assert.equal(registered.status, 200);
  assert.equal(registered.data.registered, true);
  token = registered.data.sessionToken;
  pass('Disposable backend account registration');
  const login = await call('/api/player', 'POST', { action: 'login', name, password });
  assert.equal(login.status, 200);
  token = login.data.sessionToken;
  pass('Password login');
  const catalog = await call('/api/shop/catalog', 'GET', undefined, true);
  assert.equal(catalog.data.appleStoreReady, true);
  assert.ok(catalog.data.appleAppAccountToken);
  pass('Authenticated Apple catalog and account binding');
  // This nonexistent transaction must pass the allowlist and fail at Apple's lookup.
  const sandbox = await call('/api/shop/apple-store', 'POST', {
    transactionId: '999999999999999999', productId: 'obsidian_120', environment: 'Sandbox'
  }, true);
  assert.equal(sandbox.status, 404);
  assert.equal(sandbox.data.code, 'PURCHASE_VERIFICATION_FAILED');
  pass('Sandbox allowlist and Apple API authentication (nonexistent transaction rejected)');
  const ranking = await call('/api/leaderboard');
  assert.ok(ranking.data.entries.every(e => /^Pilot-[0-9A-F]{12}$/.test(e.name)));
  pass('Public leaderboard contains only system codes');
} finally {
  if (token) {
    const deleted = await call('/api/player', 'DELETE', undefined, true);
    assert.equal(deleted.data.deleted, true);
    const login = await call('/api/player', 'POST', { action: 'login', name, password });
    assert.equal(login.data.code, 'ACCOUNT_NOT_FOUND');
    const catalog = await call('/api/shop/catalog', 'GET', undefined, true);
    assert.equal(catalog.data.authenticated, false);
    pass('Deletion, failed subsequent login and session invalidation');
  }
  await writeFile('release/ios/recording-backend-preflight.json', JSON.stringify(results, null, 2));
}
