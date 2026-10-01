import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { digest } from "../functions/_shared/player-auth.js";
import { onRequestPost, VIP_PRODUCT_ID, VIP_RARE_PRICE, VIP_LEGENDARY_PRICE } from "../functions/api/vip-store.js";

class VipD1 {
  constructor() {
    this.db = new DatabaseSync(":memory:");
    this.db.exec(`CREATE TABLE player_accounts(player_key TEXT PRIMARY KEY, account_json TEXT NOT NULL, updated_at TEXT NOT NULL);
      CREATE TABLE player_sessions(session_key TEXT PRIMARY KEY, account_key TEXT NOT NULL, account_name TEXT NOT NULL, created_at TEXT NOT NULL, last_used_at TEXT NOT NULL, expires_at INTEGER NOT NULL);`);
    this.db.exec(readFileSync(new URL("../migrations/0008_vip.sql", import.meta.url), "utf8"));
  }
  prepare(sql) {
    const bind = (args = []) => ({
      bind: (...next) => bind(next),
      first: async () => this.db.prepare(sql).get(...args) || null,
      all: async () => ({ results: this.db.prepare(sql).all(...args) }),
      run: async () => ({ meta: { changes: this.db.prepare(sql).run(...args).changes } })
    });
    return bind();
  }
  async batch(statements) {
    this.db.exec("BEGIN");
    try {
      const result = [];
      for (const statement of statements) result.push(await statement.run());
      this.db.exec("COMMIT");
      return result;
    } catch (error) { this.db.exec("ROLLBACK"); throw error; }
  }
}

test("VIP Obsidian checkout debits once, grants distinct rare turrets, and caps legendary shards weekly", async () => {
  const db = new VipD1();
  const token = "test-vip-session";
  const playerKey = "player:vip-test";
  const now = Date.now();
  const account = {
    name: "vip-test", createdAt: new Date(now - 3600_000).toISOString(), updatedAt: new Date(now).toISOString(),
    save: { obsidian: 6000, economyRevision: 2, v2Progress: { revision: 1, assembled: {}, stars: {}, fragments: {}, lifetimeFragments: 0 } }
  };
  await db.prepare("INSERT INTO player_accounts VALUES (?, ?, ?)").bind(playerKey, JSON.stringify(account), account.updatedAt).run();
  await db.prepare("INSERT INTO player_sessions VALUES (?, ?, ?, ?, ?, ?)")
    .bind(`player-session:${await digest(token)}`, playerKey, account.name, new Date(now - 1000).toISOString(), new Date(now - 1000).toISOString(), Math.floor(now / 1000) + 3600).run();
  await db.prepare("INSERT INTO vip_subscriptions(player_key, provider, purchase_token, product_id, expires_at, verified_at, transaction_id, environment) VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
    .bind(playerKey, "google_play", "verified-token", VIP_PRODUCT_ID, now + 30 * 86400_000, now, "", "Production").run();
  const env = { COMMERCE_DB: db };
  const buy = async (turretId) => {
    const request = new Request("https://example.com/api/vip-store", {
      method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ action: "purchase", turretId })
    });
    const response = await onRequestPost({ request, env });
    return { status: response.status, data: await response.json() };
  };
  assert.equal(VIP_RARE_PRICE / 8, 325);
  assert.equal(VIP_LEGENDARY_PRICE * 10 / 8, 625);
  assert.equal((await buy("vip_prism_lancer")).status, 200);
  assert.equal((await buy("vip_prism_lancer")).status, 409);
  assert.equal((await buy("vip_quantum_crown")).status, 200);
  assert.equal((await buy("vip_solar_judgment")).status, 409);
  const saved = JSON.parse((await db.prepare("SELECT account_json AS value FROM player_accounts WHERE player_key = ?").bind(playerKey).first()).value).save;
  assert.equal(saved.obsidian, 6000 - VIP_RARE_PRICE - VIP_LEGENDARY_PRICE);
  assert.equal(saved.v2Progress.assembled.vip_prism_lancer, 1);
  assert.equal(saved.v2Progress.stars.vip_prism_lancer, 1);
  assert.equal(saved.v2Progress.fragments.vip_quantum_crown, 10);
  assert.equal(saved.v2Progress.lifetimeFragments, 10);
  assert.equal((await db.prepare("SELECT COUNT(*) AS count FROM vip_obsidian_purchases WHERE player_key = ?").bind(playerKey).first()).count, 2);
});
