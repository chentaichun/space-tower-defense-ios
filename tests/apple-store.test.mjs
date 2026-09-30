import assert from "node:assert/strict";
import test from "node:test";
import { generateKeyPairSync, verify } from "node:crypto";
import { DatabaseSync } from "node:sqlite";
import { readFileSync } from "node:fs";
import { appleAppAccountToken, getAppleStoreSettings, verifyAppleStorePurchase } from "../functions/_shared/apple-store.js";
import { onRequestPost as purchase } from "../functions/api/shop/apple-store.js";
import { onRequestPost as guest } from "../functions/api/player/guest.js";
import { authenticatePlayerSession } from "../functions/_shared/player-auth.js";

const keys = generateKeyPairSync("ec", { namedCurve: "prime256v1" });
const credentials = { APPLE_IAP_KEY_ID: "TESTKEY", APPLE_IAP_ISSUER_ID: "test-issuer", APPLE_IAP_PRIVATE_KEY: keys.privateKey.export({ type: "pkcs8", format: "pem" }) };
const envelope = (data) => Response.json({ signedTransactionInfo: `header.${Buffer.from(JSON.stringify(data)).toString("base64url")}.signature` });
const base = async (key = "player:test") => ({ transactionId: "12345", originalTransactionId: "12345", bundleId: "com.mrchen.spacetowerdefense", productId: "obsidian_120", environment: "Production", appAccountToken: await appleAppAccountToken(key), type: "Consumable", quantity: 1, inAppOwnershipType: "PURCHASED", purchaseDate: Date.now(), price: 990, currency: "USD" });

test("Apple credential identifiers discard surrounding secret-file newlines", () => {
  const settings = getAppleStoreSettings({ ...credentials, APPLE_IAP_KEY_ID: " TESTKEY\r\n", APPLE_IAP_ISSUER_ID: "test-issuer\n" });
  assert.equal(settings.keyId, "TESTKEY");
  assert.equal(settings.issuerId, "test-issuer");
});

test("device-test sandbox access preserves the existing reviewer allowlist and rejects other players", async () => {
  const settings = getAppleStoreSettings({ ...credentials,
    APPLE_IAP_SANDBOX_PLAYERS: " player:reviewer ",
    APPLE_IAP_DEVICE_TEST_PLAYERS: "player:device-test,player:device-test" });
  assert.deepEqual([...settings.sandboxPlayers], ["player:reviewer", "player:device-test"]);
  await assert.rejects(verifyAppleStorePurchase(settings, {
    transactionId: "12345", productId: "obsidian_120", playerKey: "player:other", environment: "Sandbox"
  }), { code: "SANDBOX_NOT_ALLOWED" });
});

test("Apple account binding is stable, separated per player and a valid UUIDv8", async () => {
  const a = await appleAppAccountToken("player:a");
  assert.equal(a, await appleAppAccountToken("player:a"));
  assert.notEqual(a, await appleAppAccountToken("player:b"));
  assert.match(a, /^[0-9a-f]{8}-[0-9a-f]{4}-8[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
});

test("Apple verifier authenticates direct HTTPS lookup and rejects mismatched, revoked and sandbox transactions", async (t) => {
  let data = await base();
  let calls = 0;
  t.mock.method(globalThis, "fetch", async (url, options) => {
    calls++;
    assert.equal(url, "https://api.storekit.apple.com/inApps/v1/transactions/12345");
    assert.equal(options.redirect, "manual");
    const jwt = options.headers.Authorization.slice(7).split(".");
    assert.equal(verify("sha256", Buffer.from(jwt.slice(0, 2).join(".")), { key: keys.publicKey, dsaEncoding: "ieee-p1363" }, Buffer.from(jwt[2], "base64url")), true);
    assert.equal(JSON.parse(Buffer.from(jwt[1], "base64url")).bid, data.bundleId === "other.app" ? "com.mrchen.spacetowerdefense" : data.bundleId);
    return envelope(data);
  });
  const settings = getAppleStoreSettings(credentials);
  const args = { transactionId: "12345", productId: "obsidian_120", playerKey: "player:test" };
  assert.equal((await verifyAppleStorePurchase(settings, args)).purchaseToken, "apple:Production:12345");
  for (const patch of [{ appAccountToken: undefined }, { appAccountToken: await appleAppAccountToken("player:other") }, { bundleId: "other.app" }, { productId: "double_gold_v1" }, { revocationDate: Date.now() }, { environment: "Sandbox" }, { type: "Non-Consumable" }, { quantity: 2 }, { inAppOwnershipType: "FAMILY_SHARED" }]) {
    data = { ...await base(), ...patch };
    await assert.rejects(verifyAppleStorePurchase(settings, args));
  }
  const before = calls;
  await assert.rejects(verifyAppleStorePurchase(settings, { ...args, environment: "Sandbox" }), { code: "SANDBOX_NOT_ALLOWED" });
  await assert.rejects(verifyAppleStorePurchase(settings, { ...args, transactionId: "../secret" }));
  assert.equal(calls, before);
});

test("Apple redirects are rejected without fetching a second destination", async (t) => {
  let calls = 0;
  t.mock.method(globalThis, "fetch", async (url, options) => {
    calls++;
    assert.equal(options.redirect, "manual");
    return new Response(null, { status: 302, headers: { Location: "https://example.invalid" } });
  });
  await assert.rejects(verifyAppleStorePurchase(getAppleStoreSettings(credentials), {
    transactionId: "12345", productId: "obsidian_120", playerKey: "player:test"
  }), { code: "PURCHASE_VERIFICATION_FAILED" });
  assert.equal(calls, 1);
});

class D1 {
  constructor() {
    this.db = new DatabaseSync(":memory:");
    for (const file of ["0001_commerce.sql", "0002_space_coin.sql", "0003_starter_pack.sql", "0004_entitlements.sql"]) this.db.exec(readFileSync(new URL(`../migrations/${file}`, import.meta.url), "utf8"));
  }
  prepare(sql) { return { bind: (...args) => ({ sql, args,
    first: async () => this.db.prepare(sql).get(...args) || null,
    all: async () => ({ results: this.db.prepare(sql).all(...args) }),
    run: async () => ({ meta: { changes: this.db.prepare(sql).run(...args).changes } })
  }) }; }
  async batch(commands) {
    this.db.exec("BEGIN");
    try { for (const command of commands) this.db.prepare(command.sql).run(...command.args); this.db.exec("COMMIT"); }
    catch (error) { this.db.exec("ROLLBACK"); throw error; }
  }
}
class KV {
  data = new Map();
  async get(key, type) { const value = this.data.get(key); return value ? type === "json" ? JSON.parse(value) : value : null; }
  async put(key, value) { this.data.set(key, value); }
}

test("Apple fulfillment preserves actual currency and retries never duplicate wallets or permanent grants", async (t) => {
  const env = { ...credentials, FEEDBACK_STORE: new KV(), COMMERCE_DB: new D1() };
  const session = await (await guest({ env, request: new Request("https://game.test/api/player/guest", { method: "POST", body: JSON.stringify({ installationId: "apple-test-install-12345" }) }) })).json();
  const headers = { Authorization: `Bearer ${session.sessionToken}` };
  const auth = await authenticatePlayerSession(new Request("https://game.test", { headers }), env);
  let data = await base(auth.accountKey);
  t.mock.method(globalThis, "fetch", async () => envelope(data));
  const buy = async () => purchase({ env, request: new Request("https://game.test/api/shop/apple-store", { method: "POST", headers, body: JSON.stringify({ productId: data.productId, transactionId: data.transactionId }) }) });
  const first = await (await buy()).json();
  assert.equal(first.newlyFulfilled, true);
  assert.equal(first.wallet.balance, 240);
  const again = await (await buy()).json();
  assert.equal(again.newlyFulfilled, false);
  assert.equal(again.wallet.balance, 240);
  assert.deepEqual({ ...env.COMMERCE_DB.db.prepare("SELECT currency, unit_amount FROM commerce_orders").get() }, { currency: "USD", unit_amount: 99 });
  data = { ...data, productId: "starter_emerald_v1", transactionId: "12346", originalTransactionId: "12346", type: "Non-Consumable" };
  assert.equal((await (await buy()).json()).wallet.balance, 2640);
  data.transactionId = "12347"; // A restored transaction keeps the original purchase identity.
  const restored = await (await buy()).json();
  assert.equal(restored.newlyFulfilled, false);
  assert.equal(restored.wallet.balance, 2640);
  data = { ...data, productId: "remove_ads_v1", transactionId: "12348", originalTransactionId: "12348" };
  assert.deepEqual((await (await buy()).json()).entitlements, ["remove_ads"]);
  assert.equal((await (await buy()).json()).newlyFulfilled, false);
  data.revocationDate = Date.now();
  assert.equal((await buy()).status, 409);
});
