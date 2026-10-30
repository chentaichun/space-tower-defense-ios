import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { generateKeyPairSync } from "node:crypto";
import { STARTER_PACK, STARTER_PRICE_TIERS, grantStarterPack, getStarterPackEntitlement, applyStarterPackEntitlement, applyStarterPackSupplies } from "../functions/_shared/starter-pack.js";
import { onRequestPost as purchaseStarter } from "../functions/api/shop/starter-pack.js";
import { onRequestPost as playerRequest, sanitizeRecord } from "../functions/api/player.js";
import { digest, playerKey } from "../functions/_shared/player-auth.js";

class D1 {
  constructor() {
    this.db = new DatabaseSync(":memory:");
    for (const name of ["0001_commerce.sql", "0002_space_coin.sql", "0003_starter_pack.sql", "0004_entitlements.sql"]) this.db.exec(readFileSync(new URL(`../migrations/${name}`, import.meta.url), "utf8"));
  }
  prepare(sql) {
    return { bind: (...args) => ({ sql, args,
      first: async () => this.db.prepare(sql).get(...args) || null,
      run: async () => ({ meta: { changes: this.db.prepare(sql).run(...args).changes } }),
      all: async () => ({ results: this.db.prepare(sql).all(...args) })
    }) };
  }
  async batch(commands) {
    this.db.exec("BEGIN");
    try {
      for (let i = 0; i < commands.length; i++) {
        if (this.failAt === i) throw new Error("simulated database failure");
        this.db.prepare(commands[i].sql).run(...commands[i].args);
      }
      this.db.exec("COMMIT");
    } catch (error) { this.db.exec("ROLLBACK"); throw error; }
  }
}
class KV {
  data = new Map();
  async get(key, type) { const v = this.data.get(key); return v ? type === "json" ? JSON.parse(v) : v : null; }
  async put(key, value) { this.data.set(key, value); }
  async delete(key) { this.data.delete(key); }
}

test("the requested six price tiers cover 36 distinct countries and Taiwan is USD .79", () => {
  const countryMap = new Map(STARTER_PRICE_TIERS.flatMap((tier) => tier.countries.map((country) => [country, tier.usdCents])));
  assert.equal(countryMap.size, 36);
  assert.equal(countryMap.get("TW"), 79);
  assert.equal(countryMap.get("HK"), 99);
  assert.equal(countryMap.get("MY"), 59);
  assert.equal(countryMap.get("PK"), 29);
  assert.equal(countryMap.get("RW"), 19);
  assert.equal(STARTER_PACK.obsidian / STARTER_PACK.referenceAmountWithFirstBonus, 10);
  assert.equal(3 + Object.keys(STARTER_PACK.consumables).length, 10);
});

test("starter offer gates each launch and is dismissible before entering the game", () => {
  const page = readFileSync(new URL("../index.html", import.meta.url), "utf8");
  const client = readFileSync(new URL("../starter-pack.js", import.meta.url), "utf8");
  const styles = readFileSync(new URL("../starter-pack.css", import.meta.url), "utf8");
  assert.match(page, /spaceTowerAuthenticatedLoginSequence[\s\S]*space-tower-authenticated-login/);
  assert.match(client, /addEventListener\("space-tower-authenticated-login"/);
  assert.match(client, /void openStarterPack\("launch"\)/);
  assert.match(client, /SpaceTowerStarterGateActive = true/);
  assert.match(client, /SpaceTowerStarterGateActive = false/);
  assert.match(client, /openStarterPack\("login"\)/);
  assert.match(client, /data-starter-close/);
  assert.match(client, /event\.target\.closest\("\[data-starter-close\]"\).*starterDialog\.close\(\)/);
  assert.match(client, /starter-turret-aura/);
  assert.match(styles, /starter-aura-pulse/);
  assert.match(styles, /starter-aura-orbit/);
});

test("simultaneous starter restores grant both wallets exactly once", async () => {
  const env = { COMMERCE_DB: new D1() };
  const args = { playerKey: "pilot", purchaseToken: "verified-token", orderId: "test-order" };
  const results = await Promise.all(Array.from({ length: 10 }, () => grantStarterPack(env, args)));
  assert.equal(results.filter((r) => r.newlyFulfilled).length, 1);
  assert.equal(env.COMMERCE_DB.db.prepare("SELECT lifetime_purchased FROM commerce_wallets").get().lifetime_purchased, 2400);
  assert.equal(env.COMMERCE_DB.db.prepare("SELECT lifetime_purchased FROM space_coin_wallets").get().lifetime_purchased, 2000);
  assert.equal(env.COMMERCE_DB.db.prepare("SELECT first_purchase_claimed FROM commerce_wallets").get().first_purchase_claimed, 0);
  assert.equal((await grantStarterPack(env, { ...args, playerKey: "other" })).fulfilled, false);
  assert.equal((await grantStarterPack(env, { ...args, purchaseToken: "second-token" })).fulfilled, false);
  assert.equal(env.COMMERCE_DB.db.prepare("SELECT COUNT(*) AS count FROM starter_pack_purchases").get().count, 1);
});

test("a failed bundle transaction rolls back every reward and a retry succeeds", async () => {
  const env = { COMMERCE_DB: new D1() };
  env.COMMERCE_DB.failAt = 2;
  const args = { playerKey: "pilot", purchaseToken: "retry-token", orderId: "test-order" };
  await assert.rejects(grantStarterPack(env, args));
  assert.equal(env.COMMERCE_DB.db.prepare("SELECT COUNT(*) AS n FROM commerce_wallets").get().n, 0);
  assert.equal(await getStarterPackEntitlement(env, "pilot"), null);
  env.COMMERCE_DB.failAt = -1;
  assert.equal((await grantStarterPack(env, args)).newlyFulfilled, true);
});

test("starter ownership cannot be forged and consumed introductory supplies do not refill", () => {
  const save = sanitizeRecord({ v2Progress: { stars: { emerald_drake: 9 }, assembled: { emerald_drake: 9 }, active: { emerald_drake: 9 } } });
  applyStarterPackEntitlement(save, null);
  assert.equal(save.v2Progress.stars.emerald_drake, undefined);
  assert.equal(save.starterPackOwned, false);
  const entitlement = { productId: STARTER_PACK.id };
  applyStarterPackEntitlement(save, entitlement);
  assert.equal(save.v2Progress.stars.emerald_drake, 1);
  const account = {};
  assert.equal(applyStarterPackSupplies(save, account, entitlement), true);
  assert.equal(save.expansionProgress.consumables.reviveTicket, 3);
  save.expansionProgress.consumables.reviveTicket = 0;
  const afterRestart = sanitizeRecord(JSON.parse(JSON.stringify(save)));
  assert.equal(applyStarterPackSupplies(afterRestart, JSON.parse(JSON.stringify(account)), entitlement), false);
  assert.equal(afterRestart.expansionProgress.consumables.reviveTicket, 0);
});

test("verified Play purchase, acknowledgement retry, cold login and consumed supplies work end to end", async () => {
  const { privateKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
  const env = { FEEDBACK_STORE: new KV(), COMMERCE_DB: new D1(), GOOGLE_PLAY_SERVICE_ACCOUNT_JSON: {
    client_email: "test@example.invalid", private_key: privateKey.export({ type: "pkcs8", format: "pem" }), token_uri: "https://oauth2.googleapis.com/token"
  } };
  const name = "StarterTest";
  const playerReq = (body, token = "") => new Request("https://example.test/api/player", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify(body) });
  const registered = await (await playerRequest({ env, request: playerReq({ action: "register", name, password: "TestOnlyPassword123" }) })).json();
  const token = registered.sessionToken;
  const key = playerKey(name);
  const accountId = await digest(key);
  const req = (body = {}) => new Request("https://example.test/api/shop/starter-pack", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ productId: STARTER_PACK.id, purchaseToken: "test-token", ...body }) });
  const realFetch = globalThis.fetch;
  let state = 2, bound = accountId, ackFails = true, ackCalls = 0, consumes = 0;
  globalThis.fetch = async (url) => {
    if (String(url).includes("oauth2")) return Response.json({ access_token: "test-access-token", expires_in: 3600 });
    if (String(url).endsWith(":consume")) { consumes++; throw new Error("must not consume starter"); }
    if (String(url).endsWith(":acknowledge")) { ackCalls++; return new Response("{}", { status: ackFails ? 500 : 200 }); }
    return Response.json({ productId: STARTER_PACK.id, purchaseState: state, obfuscatedExternalAccountId: bound, orderId: "GPA.TEST", acknowledgementState: 0 });
  };
  try {
    assert.equal((await purchaseStarter({ env, request: req() })).status, 202);
    assert.equal(await getStarterPackEntitlement(env, key), null);
    state = 1;
    assert.equal((await purchaseStarter({ env, request: req() })).status, 409);
    state = 0; bound = "other-account";
    assert.equal((await purchaseStarter({ env, request: req() })).status, 403);
    bound = "";
    assert.equal((await purchaseStarter({ env, request: req() })).status, 403);
    bound = accountId;
    const bought = await (await purchaseStarter({ env, request: req() })).json();
    assert.equal(bought.newlyFulfilled, true);
    assert.equal(bought.acknowledged, false);
    ackFails = false;
    const restored = await (await purchaseStarter({ env, request: req() })).json();
    assert.equal(restored.newlyFulfilled, false);
    assert.equal(restored.acknowledged, true);
    assert.equal(ackCalls, 2); assert.equal(consumes, 0);
    const login = await (await playerRequest({ env, request: playerReq({ action: "login" }, token) })).json();
    assert.equal(login.player.save.obsidian, registered.player.save.obsidian + 2400);
    assert.equal(login.player.save.spaceCoins, registered.player.save.spaceCoins + 2000);
    assert.equal(login.player.save.v2Progress.stars.emerald_drake, 1);
    assert.equal(login.player.save.starterPackOwned, true);
    const save = login.player.save;
    save.expansionProgress.consumables.reviveTicket = 0;
    save.expansionProgress.revision++;
    await playerRequest({ env, request: playerReq({ action: "save", save }, token) });
    const next = await (await playerRequest({ env, request: playerReq({ action: "login" }, token) })).json();
    assert.equal(next.player.save.obsidian, login.player.save.obsidian);
    assert.equal(next.player.save.expansionProgress.consumables.reviveTicket, 0);
  } finally { globalThis.fetch = realFetch; }
});
