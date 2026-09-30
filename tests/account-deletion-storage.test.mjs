import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import { deletePlayerAccount, getPlayerAccount, putPlayerAccount } from '../functions/_shared/player-storage.js';
import { authenticatePlayerSession, digest } from '../functions/_shared/player-auth.js';

test('deletion removes D1 sessions, ranking and legacy account; old tokens cannot access a reused name', async () => {
  const db = new DatabaseSync(':memory:');
  for (const file of ['0005_leaderboard.sql', '0006_player_auth.sql']) db.exec(readFileSync(new URL(`../migrations/${file}`, import.meta.url), 'utf8'));
  const values = new Map();
  const env = { COMMERCE_DB: {
    prepare(sql) {
      const stmt = (args = []) => ({ bind: (...next) => stmt(next),
        run: async () => db.prepare(sql).run(...args), first: async () => db.prepare(sql).get(...args) });
      return stmt();
    },
    batch: async statements => Promise.all(statements.map(s => s.run()))
  }, FEEDBACK_STORE: {
    get: async (key, type) => values.has(key) ? (type === 'json' ? JSON.parse(values.get(key)) : values.get(key)) : null,
    delete: async key => values.delete(key)
  } };
  const key = 'player:disposable';
  const oldAccount = { name: 'disposable', createdAt: '2026-01-01T00:00:00Z' };
  await putPlayerAccount(env, key, oldAccount);
  values.set(key, JSON.stringify(oldAccount));
  const token = 'legacy-test-session';
  const sessionKey = `player-session:${await digest(token)}`;
  const session = { accountKey: key, accountName: 'disposable', createdAt: '2026-01-02T00:00:00Z', lastUsedAt: new Date().toISOString() };
  values.set(sessionKey, JSON.stringify(session));
  db.prepare('INSERT INTO player_sessions VALUES (?,?,?,?,?,?)').run(sessionKey, key, session.accountName, session.createdAt, session.lastUsedAt, 9999999999);
  db.prepare('INSERT INTO leaderboard_entries VALUES (?,?,?,?,?,?)').run(key, 'disposable', 1, 50, 0, session.createdAt);
  await putPlayerAccount(env, 'player:keep', { name: 'keep' });
  await deletePlayerAccount(env, key);
  assert.equal(await getPlayerAccount(env, key), null);
  assert.equal(db.prepare('SELECT COUNT(*) AS n FROM player_sessions').get().n, 0);
  assert.equal(db.prepare('SELECT COUNT(*) AS n FROM leaderboard_entries').get().n, 0);
  assert.equal((await getPlayerAccount(env, 'player:keep')).name, 'keep');
  await putPlayerAccount(env, key, { name: 'disposable', createdAt: '2026-01-03T00:00:00Z' });
  assert.equal(await authenticatePlayerSession(new Request('https://example.test', { headers: { Authorization: `Bearer ${token}` } }), env), null);
  db.close();
});
