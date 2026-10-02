import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { ENTITLEMENT_PRODUCTS, findEntitlementProduct, getPlayerEntitlements, grantPlayerEntitlement, publicEntitlementCatalog } from "../functions/_shared/entitlements.js";
import { onRequestPost as createGuestSession } from "../functions/api/player/guest.js";
import { onRequestPost as saveGuestProgress } from "../functions/api/player/guest-progress.js";
import { onRequestGet as getLeaderboard } from "../functions/api/leaderboard.js";
import { upsertLeaderboardEntry } from "../functions/_shared/leaderboard-store.js";

class D1 {
  constructor() {
    this.db = new DatabaseSync(":memory:");
    this.db.exec(readFileSync(new URL("../migrations/0004_entitlements.sql", import.meta.url), "utf8"));
    this.db.exec(readFileSync(new URL("../migrations/0005_leaderboard.sql", import.meta.url), "utf8"));
  }
  prepare(sql) {
    const statement = (args = []) => ({
      bind: (...nextArgs) => statement(nextArgs),
      first: async () => this.db.prepare(sql).get(...args) || null,
      run: async () => ({ meta: { changes: this.db.prepare(sql).run(...args).changes } }),
      all: async () => ({ results: this.db.prepare(sql).all(...args) })
    });
    return statement();
  }
}

class KV {
  constructor() { this.values = new Map(); }
  async get(key, type) {
    const value = this.values.get(key);
    return type === "json" && value ? JSON.parse(value) : value || null;
  }
  async put(key, value) { this.values.set(key, value); }
  async list({ prefix = "" } = {}) {
    return {
      keys: [...this.values.keys()].filter((key) => key.startsWith(prefix)).map((name) => ({ name })),
      list_complete: true
    };
  }
}

test("permanent products use modest prices and describe balance-safe effects", () => {
  const catalog = publicEntitlementCatalog();
  assert.deepEqual(catalog.map((item) => item.id), ["remove_ads_v1", "double_gold_v1"]);
  assert.deepEqual(catalog.map((item) => item.priceUsd), ["2.99", "4.99"]);
  assert.ok(catalog.every((item) => item.nonConsumable === true));
  assert.match(findEntitlementProduct("double_gold_v1").description, /does not change damage/i);
});

test("permanent entitlements are idempotent per account and purchase token", async () => {
  const env = { COMMERCE_DB: new D1() };
  const product = ENTITLEMENT_PRODUCTS[0];
  const first = await grantPlayerEntitlement(env, { playerKey: "player:alpha", product, purchaseToken: "token-a", orderId: "GPA.A" });
  const restore = await grantPlayerEntitlement(env, { playerKey: "player:alpha", product, purchaseToken: "token-a", orderId: "GPA.A" });
  const otherAccount = await grantPlayerEntitlement(env, { playerKey: "player:beta", product, purchaseToken: "token-a", orderId: "GPA.A" });
  assert.equal(first.newlyFulfilled, true);
  assert.equal(restore.newlyFulfilled, false);
  assert.equal(otherAccount.fulfilled, false);
  assert.deepEqual(await getPlayerEntitlements(env, "player:alpha"), ["remove_ads"]);
});

test("Android checkout can create a stable anonymous commerce session without a login form", async () => {
  const env = { FEEDBACK_STORE: new KV() };
  const invoke = () => createGuestSession({
    request: new Request("https://game.example/api/player/guest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ installationId: "install-1234567890-abcdef" })
    }),
    env
  });
  const first = await (await invoke()).json();
  const second = await (await invoke()).json();
  assert.match(first.sessionToken, /^[0-9a-f-]{60,}$/i);
  assert.equal(first.player.name, second.player.name);
  assert.equal(first.googlePlayAccountId, second.googlePlayAccountId);
  assert.equal(first.player.guestCommerce, true);
});

test("guest runs create stable public leaderboard entries without registration", async () => {
  const env = { FEEDBACK_STORE: new KV(), COMMERCE_DB: new D1() };
  const installationId = "install-guest-leaderboard-123456";
  const submit = (tier, wave) => saveGuestProgress({
    request: new Request("https://game.example/api/player/guest-progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ installationId, tier, wave })
    }),
    env
  });
  await submit(2, 1500);
  await submit(2, 12);
  await submit(3, 7);

  const response = await getLeaderboard({ request: new Request("https://game.example/api/leaderboard"), env });
  const data = await response.json();
  assert.equal(response.status, 200);
  assert.equal(data.totalEligible, 1);
  assert.match(data.entries[0].name, /^Pilot-[0-9A-F]{12}$/);
  assert.deepEqual({ tier: data.entries[0].tier, wave: data.entries[0].wave }, { tier: 3, wave: 7 });
});

test("public rankings replace user text with stable system codes for every player", async () => {
  const env = { COMMERCE_DB: new D1() };
  const entry = { playerKey: "player:private-account-a", name: "<script>untrusted</script>", tier: 2, wave: 20 };
  await upsertLeaderboardEntry(env, entry);
  await upsertLeaderboardEntry(env, { playerKey: "player:private-account-b", name: "personal@example.com", tier: 1, wave: 10 });
  const read = async () => (await getLeaderboard({ request: new Request("https://game.example/api/leaderboard"), env })).json();
  const first = await read();
  assert.equal(first.entries.length, 2);
  assert.equal(first.totalEligible, 2);
  for (const row of first.entries) {
    assert.match(row.name, /^Pilot-[0-9A-F]{12}$/);
    assert.deepEqual(Object.keys(row).sort(), ["name", "rank", "tier", "wave"]);
  }
  assert.notEqual(first.entries[0].name, first.entries[1].name);
  assert.doesNotMatch(JSON.stringify(first), /untrusted|script|personal@|private-account|playerKey/);
  await upsertLeaderboardEntry(env, { ...entry, name: "Renamed account", wave: 25 });
  const second = await read();
  assert.equal(second.entries[0].name, first.entries[0].name);
  assert.equal(second.entries[0].wave, 25);
  assert.equal(second.entries[0].tier, 2);
  assert.equal(second.entries[0].rank, 1);
});

test("guest leaderboard rejects direct tier jumps without prior tier clears", async () => {
  const env = { FEEDBACK_STORE: new KV(), COMMERCE_DB: new D1() };
  const response = await saveGuestProgress({
    request: new Request("https://game.example/api/player/guest-progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ installationId: "install-direct-tier-jump-123456", tier: 8, wave: 113 })
    }),
    env
  });
  assert.equal(response.status, 409);
  assert.equal((await response.json()).code, "INVALID_TIER_PROGRESSION");
  const leaderboard = await getLeaderboard({ request: new Request("https://game.example/api/leaderboard"), env });
  assert.deepEqual((await leaderboard.json()).entries, []);
});

test("players without a completed wave do not fill the public leaderboard", async () => {
  const env = { FEEDBACK_STORE: new KV(), COMMERCE_DB: new D1() };
  const installationId = "install-empty-leaderboard-123456";
  const response = await saveGuestProgress({
    request: new Request("https://game.example/api/player/guest-progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ installationId, tier: 1, wave: 1 })
    }),
    env
  });
  assert.equal(response.status, 200);
  const leaderboard = await getLeaderboard({ request: new Request("https://game.example/api/leaderboard"), env });
  const data = await leaderboard.json();
  assert.equal(data.totalEligible, 0);
  assert.deepEqual(data.entries, []);
});

test("client exposes post-run cadence, direct ad-free rewards, analytics fields, and leaderboard", () => {
  const page = readFileSync(new URL("../index.html", import.meta.url), "utf8");
  const ads = readFileSync(new URL("../v2-features.js", import.meta.url), "utf8");
  const leaderboard = readFileSync(new URL("../functions/api/leaderboard.js", import.meta.url), "utf8");
  assert.match(ads, /POST_RUN_INTERSTITIAL_FIRST_RUN = 2/);
  assert.match(ads, /POST_RUN_INTERSTITIAL_INTERVAL = 3/);
  assert.match(ads, /rewarded_skipped_entitlement/);
  assert.match(page, /transaction_id:[\s\S]*value,[\s\S]*currency,[\s\S]*items:/);
  assert.match(page, /data-entitlement-product/);
  assert.match(page, /ensureGuestCommerceSession[\s\S]*\/api\/player\/guest/);
  assert.match(page, /\/api\/player\/guest-progress/);
  const purchaseFlow = page.match(/async function purchaseObsidian\(productId\) \{[\s\S]*?\n    \}/)?.[0] || "";
  assert.ok(purchaseFlow.indexOf("if (IS_ANDROID_APP)") < purchaseFlow.indexOf("if (!shopAuthenticated || !playerSessionToken)"), "Android guest purchases must run before the web login gate");
  assert.ok(page.indexOf('class="store-section-tabs"') < page.indexOf('id="storePrivilegeSection"'), "store categories must be visible before the collapsible permanent-products section");
  assert.match(page, /<details[^>]*id="storePrivilegeSection"/);
  assert.match(page, /id="homeLeaderboardTab"[\s\S]*id="homeLeaderboardPage"/);
  assert.doesNotMatch(page, /id="leaderboardDrawer"/);
  assert.match(page, /class="leaderboard-grid leaderboard-head"/);
  assert.match(page, /class="leaderboard-name"[\s\S]*class="leaderboard-wave"[\s\S]*class="leaderboard-tier"/);
  assert.doesNotMatch(page, /#\$\{entry\.rank\} ·/);
  assert.doesNotMatch(page, /所有有效最高紀錄都會永久保留/);
  assert.doesNotMatch(page, /id="leaderboardCount"/);
  assert.match(ads, /leaderboardRefreshTimer = window\.setInterval\([\s\S]*?, 30000\);/);
  assert.match(ads, /window\.clearInterval\(leaderboardRefreshTimer\)/);
  assert.match(ads, /document\.visibilityState === "visible" && !homeLeaderboardPage\.hidden/);
  assert.match(leaderboard, /readLeaderboard\(env, 100, named\)/);
  assert.match(leaderboard, /authenticatePlayerSession/);
  assert.doesNotMatch(leaderboard, /LOGIN_REQUIRED/);
  assert.doesNotMatch(leaderboard, /password|purchase_token|wallet/i);
});
