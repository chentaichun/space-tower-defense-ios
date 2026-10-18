import assert from "node:assert/strict";
import test from "node:test";

import {
  onRequestOptions,
  onRequestPost
} from "../functions/api/player.js";
import {
  hashLegacyPassword,
  playerKey
} from "../functions/_shared/player-auth.js";
import { onRequestGet as googleStatus } from "../functions/api/auth/google/status.js";
import { onRequestPost as drawCardPack } from "../functions/api/shop/draw.js";
import { onRequestPost as redeemStardust } from "../functions/api/shop/redeem-dust.js";

class MemoryKV {
  constructor() {
    this.records = new Map();
  }

  async get(key, type) {
    const value = this.records.get(key);
    if (value === undefined) return null;
    return type === "json" ? JSON.parse(value) : value;
  }

  async put(key, value) {
    this.records.set(key, String(value));
  }

  async delete(key) {
    this.records.delete(key);
  }

  async list({ prefix = "", limit = 100, cursor } = {}) {
    const start = Number(cursor || 0);
    const names = [...this.records.keys()].filter((key) => key.startsWith(prefix));
    const page = names.slice(start, start + limit);
    const next = start + page.length;
    return {
      keys: page.map((name) => ({ name })),
      list_complete: next >= names.length,
      cursor: next >= names.length ? undefined : String(next)
    };
  }
}

class MemoryCommerceDB {
  constructor() {
    this.wallet = {
      balance: 0,
      lifetimePurchased: 0,
      firstPurchaseClaimed: false
    };
    this.spaceCoinWallet = {
      balance: 0,
      lifetimePurchased: 0
    };
  }

  prepare(sql) {
    if (/FROM starter_pack_purchases/.test(sql)) return { bind: () => ({ first: async () => null }) };
    const wallet = /FROM space_coin_wallets/.test(sql) ? this.spaceCoinWallet : this.wallet;
    assert.match(sql, /FROM (commerce_wallets|space_coin_wallets)/);
    return {
      bind: () => ({
        first: async () => ({ ...wallet })
      })
    };
  }
}

const origin = "https://localhost";
const createRequest = (body, headers = {}) => new Request("https://example.test/api/player", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Origin: origin,
    ...headers
  },
  body: JSON.stringify(body)
});
const parse = (response) => response.json();

const createShopRequest = (path, body, sessionToken) => new Request(`https://example.test${path}`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Origin: origin,
    Authorization: `Bearer ${sessionToken}`
  },
  body: JSON.stringify(body)
});

test('completed intro grants each free ten-pull once, preserves it across login and cannot refill spent vouchers',async()=>{
  const env={FEEDBACK_STORE:new MemoryKV()};
  const onboarding={introStep:11,introComplete:true,introClaimed:true};
  const registered=await onRequestPost({request:createRequest({action:'register',name:'IntroPilot',password:'SecurePass123!',save:{v2Progress:{revision:3,onboarding},expansionProgress:{introVouchersGranted:true,packVouchers:{normal:999,supreme:999}}}}),env});
  const data=await parse(registered);assert.equal(registered.status,200);assert.deepEqual(data.player.save.expansionProgress.packVouchers,{normal:10,supreme:10});
  for(const pack of ['normal','supreme']){
    const body={pack,pulls:10,useVoucher:true,requestId:'intro-ten-'+pack};
    const draw=await drawCardPack({request:createShopRequest('/api/shop/draw',body,data.sessionToken),env});const result=await parse(draw);
    assert.equal(draw.status,200);assert.equal(result.results.length,10);assert.equal(result.voucherPullsUsed,10);assert.equal(result.save.expansionProgress.packVouchers[pack],0);
    const duplicate=await drawCardPack({request:createShopRequest('/api/shop/draw',body,data.sessionToken),env});assert.equal((await parse(duplicate)).duplicate,true);
    const again=await drawCardPack({request:createShopRequest('/api/shop/draw',{...body,requestId:body.requestId+'-again'},data.sessionToken),env});assert.equal(again.status,409);
  }
  const save=await onRequestPost({request:createRequest({action:'save',save:{...data.player.save,expansionProgress:{revision:999,introVouchersGranted:false,packVouchers:{normal:10,supreme:10}}}},{Authorization:`Bearer ${data.sessionToken}`}),env});
  const saved=(await parse(save)).player.save;assert.deepEqual(saved.expansionProgress.packVouchers,{normal:0,supreme:0});assert.equal(saved.expansionProgress.introVouchersGranted,true);
});
test('unfinished intros cannot grant ten-pull vouchers by sending a client flag',async()=>{
  const env={FEEDBACK_STORE:new MemoryKV()};
  const response=await onRequestPost({request:createRequest({action:'register',name:'EarlyIntroPilot',password:'SecurePass123!',save:{v2Progress:{onboarding:{introStep:5,introComplete:true,introClaimed:true}},expansionProgress:{introVouchersGranted:true,packVouchers:{normal:10,supreme:10}}}}),env});
  const saved=(await parse(response)).player.save;assert.equal(saved.expansionProgress.introVouchersGranted,false);assert.deepEqual(saved.expansionProgress.packVouchers,{normal:0,supreme:0});
});

test("Capacitor preflight is accepted", async () => {
  const response = await onRequestOptions({
    request: new Request("https://example.test/api/player", {
      method: "OPTIONS",
      headers: { Origin: origin }
    })
  });

  assert.equal(response.status, 204);
  assert.equal(response.headers.get("Access-Control-Allow-Origin"), origin);
  assert.match(response.headers.get("Access-Control-Allow-Methods"), /POST/);
});

test("register, reject duplicates, login, and resume a remembered session", async () => {
  const env = { FEEDBACK_STORE: new MemoryKV() };
  const name = "TestPilot";
  const password = "SecurePass123!";

  const registered = await onRequestPost({
    request: createRequest({ action: "register", name, password, save: { obsidian: 7 } }),
    env
  });
  const registeredData = await parse(registered);
  assert.equal(registered.status, 200);
  assert.equal(registered.headers.get("Access-Control-Allow-Origin"), origin);
  assert.equal(registeredData.registered, true);
  assert.ok(registeredData.sessionToken);
  assert.equal(registeredData.player.save.obsidian, 7);

  const duplicate = await onRequestPost({
    request: createRequest({ action: "register", name, password }),
    env
  });
  assert.equal(duplicate.status, 409);
  assert.equal((await parse(duplicate)).code, "ACCOUNT_EXISTS");

  const wrongPassword = await onRequestPost({
    request: createRequest({ action: "login", name, password: "wrong-password" }),
    env
  });
  assert.equal(wrongPassword.status, 401);
  assert.equal((await parse(wrongPassword)).code, "INVALID_CREDENTIALS");

  const login = await onRequestPost({
    request: createRequest({ action: "login", name, password }),
    env
  });
  const loginData = await parse(login);
  assert.equal(login.status, 200);
  assert.ok(loginData.sessionToken);

  const resumed = await onRequestPost({
    request: createRequest(
      { action: "login", name },
      { Authorization: `Bearer ${loginData.sessionToken}` }
    ),
    env
  });
  assert.equal(resumed.status, 200);
  assert.equal((await parse(resumed)).player.name, name);
});

test("paid gacha loyalty, voucher pulls, guarantees, and stardust redemption stay server authoritative", async () => {
  const env = { FEEDBACK_STORE: new MemoryKV() };
  const name = "PromoMailPilot";
  const registered = await onRequestPost({
    request: createRequest({ action: "register", name, password: "SecurePass123!", save: { obsidian: 1000 } }),
    env
  });
  const registeredData = await parse(registered);
  const accountKey = playerKey(name);
  const account = await env.FEEDBACK_STORE.get(accountKey, "json");
  account.save.obsidian = 1000;
  account.save.expansionProgress.normalPaidPulls = 99;
  await env.FEEDBACK_STORE.put(accountKey, JSON.stringify(account));

  const drawResponse = await drawCardPack({
    request: createShopRequest("/api/shop/draw", { pack: "normal", pulls: 1, useVoucher: false, requestId: "promo-paid-100" }, registeredData.sessionToken),
    env
  });
  const drawData = await parse(drawResponse);
  assert.equal(drawResponse.status, 200);
  assert.equal(drawData.results.length, 1);
  assert.equal(drawData.loyaltyVoucherPulls, 50);
  assert.equal(drawData.starDustEarned, 1);
  assert.equal(drawData.save.expansionProgress.normalPaidPulls, 100);
  assert.equal(drawData.save.expansionProgress.promoMail.normal, 0);
  assert.equal(drawData.save.expansionProgress.packVouchers.normal, 50);
  assert.equal(drawData.save.expansionProgress.gachaPulls.normal, 1);
  assert.equal(drawData.save.expansionProgress.starDust, 1);

  const obsidianBeforeVoucherDraw = drawData.save.obsidian;
  const voucherDrawResponse = await drawCardPack({
    request: createShopRequest("/api/shop/draw", { pack: "normal", pulls: 10, useVoucher: true, requestId: "voucher-normal-10" }, registeredData.sessionToken),
    env
  });
  const voucherDrawData = await parse(voucherDrawResponse);
  assert.equal(voucherDrawResponse.status, 200);
  assert.equal(voucherDrawData.results.length, 10);
  assert.equal(voucherDrawData.voucherPullsUsed, 10);
  assert.equal(voucherDrawData.save.expansionProgress.packVouchers.normal, 40);
  assert.equal(voucherDrawData.save.expansionProgress.normalPaidPulls, 100);
  assert.equal(voucherDrawData.save.expansionProgress.gachaPulls.normal, 11);
  assert.equal(voucherDrawData.save.expansionProgress.starDust, 13);
  const voucherRewardObsidian = voucherDrawData.results
    .filter((reward) => reward.kind === "obsidian")
    .reduce((sum, reward) => sum + reward.amount, 0);
  assert.equal(voucherDrawData.save.obsidian, obsidianBeforeVoucherDraw + voucherRewardObsidian);

  const latest = await env.FEEDBACK_STORE.get(accountKey, "json");
  latest.save.expansionProgress.starDust = 100;
  latest.save.v2Progress.fragmentWishlist = "emergency_shield";
  await env.FEEDBACK_STORE.put(accountKey, JSON.stringify(latest));
  const redeemResponse = await redeemStardust({
    request: createShopRequest("/api/shop/redeem-dust", { offer: "turret", requestId: "redeem-dust-turret-1" }, registeredData.sessionToken),
    env
  });
  const redeemData = await parse(redeemResponse);
  assert.equal(redeemResponse.status, 200);
  assert.equal(redeemData.reward.targetId, "emergency_shield");
  assert.equal(redeemData.save.expansionProgress.starDust, 50);
  assert.equal(redeemData.save.v2Progress.fragments.emergency_shield, (latest.save.v2Progress.fragments.emergency_shield || 0) + 10);
});

test("the same App origin can create and remember two independent accounts", async () => {
  const env = { FEEDBACK_STORE: new MemoryKV() };
  const accounts = [
    { name: "DevicePilotOne", password: "SecurePass123!", obsidian: 11 },
    { name: "DevicePilotTwo", password: "AnotherPass456!", obsidian: 0 }
  ];
  const sessions = [];

  for (const account of accounts) {
    const response = await onRequestPost({
      request: createRequest({
        action: "register",
        name: account.name,
        password: account.password,
        save: { obsidian: account.obsidian }
      }),
      env
    });
    const data = await parse(response);
    assert.equal(response.status, 200);
    assert.equal(data.registered, true);
    assert.equal(data.player.name, account.name);
    assert.equal(data.player.save.obsidian, account.obsidian);
    sessions.push(data.sessionToken);
  }

  assert.notEqual(sessions[0], sessions[1]);
  const firstAccount = await env.FEEDBACK_STORE.get(playerKey(accounts[0].name), "json");
  const secondAccount = await env.FEEDBACK_STORE.get(playerKey(accounts[1].name), "json");
  assert.equal(firstAccount.save.obsidian, 11);
  assert.equal(secondAccount.save.obsidian, 0);
});

test("economy revisions reject stale Obsidian refunds and keep meta upgrades atomic", async () => {
  const env = { FEEDBACK_STORE: new MemoryKV() };
  const name = "EconomyPilot";
  const password = "SecurePass123!";
  const registered = await onRequestPost({
    request: createRequest({
      action: "register",
      name,
      password,
      save: { obsidian: 100, economyRevision: 0, metaUpgrades: {} }
    }),
    env
  });
  const registeredData = await parse(registered);
  const authorization = { Authorization: `Bearer ${registeredData.sessionToken}` };

  const spent = await onRequestPost({
    request: createRequest({
      action: "save",
      name,
      save: {
        obsidian: 40,
        economyRevision: 1,
        metaUpgrades: { fighterHangar: 1 }
      }
    }, authorization),
    env
  });
  const spentSave = (await parse(spent)).player.save;
  assert.equal(spentSave.obsidian, 40);
  assert.equal(spentSave.economyRevision, 1);
  assert.equal(spentSave.metaUpgrades.fighterHangar, 1);

  const stale = await onRequestPost({
    request: createRequest({
      action: "save",
      name,
      save: {
        obsidian: 100,
        economyRevision: 0,
        metaUpgrades: { fighterHangar: 9 }
      }
    }, authorization),
    env
  });
  const staleSave = (await parse(stale)).player.save;
  assert.equal(staleSave.obsidian, 40);
  assert.equal(staleSave.economyRevision, 1);
  assert.equal(staleSave.metaUpgrades.fighterHangar, 1);

  const loginCannotOverwriteEconomy = await onRequestPost({
    request: createRequest({
      action: "login",
      name,
      save: {
        obsidian: 999,
        economyRevision: 99,
        metaUpgrades: { fighterHangar: 99 }
      }
    }, authorization),
    env
  });
  const authoritativeSave = (await parse(loginCannotOverwriteEconomy)).player.save;
  assert.equal(authoritativeSave.obsidian, 40);
  assert.equal(authoritativeSave.economyRevision, 1);
  assert.equal(authoritativeSave.metaUpgrades.fighterHangar, 1);
});

test("launch mailbox claims and turret stars survive authenticated cloud saves", async () => {
  const env = { FEEDBACK_STORE: new MemoryKV() };
  const registered = await onRequestPost({
    request: createRequest({
      action: "register",
      name: "LaunchRewardPilot",
      password: "SecurePass123!",
      save: {
        obsidian: 1800,
        economyRevision: 1,
        launchRewards: {
          loginDays: 1,
          lastLoginDate: "2026-08-13",
          unlocked: { first_login: true },
          claimed: { first_login: true }
        },
        v2Progress: {
          fragments: { kinetic_burst: 12 },
          assembled: { kinetic_burst: 1 },
          active: { kinetic_burst: 1 },
          stars: { kinetic_burst: 3 }
        }
      }
    }),
    env
  });
  const registeredData = await parse(registered);
  assert.equal(registered.status, 200);
  assert.equal(registeredData.player.save.launchRewards.loginDays, 1);
  assert.equal(registeredData.player.save.launchRewards.claimed.first_login, true);
  assert.equal(registeredData.player.save.v2Progress.stars.kinetic_burst, 3);

  const resumed = await onRequestPost({
    request: createRequest(
      { action: "login", name: "LaunchRewardPilot" },
      { Authorization: `Bearer ${registeredData.sessionToken}` }
    ),
    env
  });
  const save = (await parse(resumed)).player.save;
  assert.equal(save.launchRewards.claimed.first_login, true);
  assert.equal(save.v2Progress.stars.kinetic_burst, 3);
});

test("every purchased music track and the equipped track survive the next authenticated login", async () => {
  const env = { FEEDBACK_STORE: new MemoryKV() };
  const name = "MusicLibraryPilot";
  const allMusicIds = [
    "sunset_orbit", "foundation_pulse", "ion_islands", "moving_starward", "fortaleza_nebula",
    "neon_affinity", "past_the_nebula", "slow_comet_highway", "horizon_signal", "pan_orbit_drive",
    "blizzard_relay", "homeward_signal", "sunday_starway", "happy_day", "water_pop", "earth_wonder",
    "rock", "dark", "emotional_japan", "happy_life", "bright", "anime", "tension"
  ];
  const registered = await onRequestPost({
    request: createRequest({
      action: "register",
      name,
      password: "SecurePass123!",
      save: { expansionProgress: { revision: 0 } }
    }),
    env
  });
  const sessionToken = (await parse(registered)).sessionToken;
  const authorization = { Authorization: `Bearer ${sessionToken}` };

  const purchased = await onRequestPost({
    request: createRequest({
      action: "save",
      name,
      save: {
        expansionProgress: {
          revision: 1,
          ownedMusic: allMusicIds,
          equippedMusic: "tension"
        }
      }
    }, authorization),
    env
  });
  const purchasedSave = (await parse(purchased)).player.save;
  assert.deepEqual(purchasedSave.expansionProgress.ownedMusic, allMusicIds);
  assert.equal(purchasedSave.expansionProgress.equippedMusic, "tension");

  const accountKey = playerKey(name);
  const legacyFilteredAccount = await env.FEEDBACK_STORE.get(accountKey, "json");
  legacyFilteredAccount.save.expansionProgress.ownedMusic = allMusicIds.slice(0, 13);
  legacyFilteredAccount.save.expansionProgress.equippedMusic = "default";
  await env.FEEDBACK_STORE.put(accountKey, JSON.stringify(legacyFilteredAccount));

  const recovered = await onRequestPost({
    request: createRequest({
      action: "save",
      name,
      save: {
        expansionProgress: {
          revision: 1,
          ownedMusic: allMusicIds,
          equippedMusic: "tension"
        }
      }
    }, authorization),
    env
  });
  const recoveredSave = (await parse(recovered)).player.save.expansionProgress;
  assert.deepEqual(recoveredSave.ownedMusic, allMusicIds);
  assert.equal(recoveredSave.equippedMusic, "tension");

  const nextLogin = await onRequestPost({
    request: createRequest({ action: "login", name }, authorization),
    env
  });
  const persisted = (await parse(nextLogin)).player.save.expansionProgress;
  assert.deepEqual(persisted.ownedMusic, allMusicIds);
  assert.equal(persisted.equippedMusic, "tension");
});

test("login never creates an unknown account", async () => {
  const env = { FEEDBACK_STORE: new MemoryKV() };
  const response = await onRequestPost({
    request: createRequest({
      action: "login",
      name: "UnknownPilot",
      password: "SecurePass123!"
    }),
    env
  });

  assert.equal(response.status, 404);
  assert.equal((await parse(response)).code, "ACCOUNT_NOT_FOUND");
  assert.equal(await env.FEEDBACK_STORE.get(playerKey("UnknownPilot"), "json"), null);
});

test("legacy password hashes are upgraded after a valid login", async () => {
  const env = { FEEDBACK_STORE: new MemoryKV() };
  const name = "LegacyPilot";
  const password = "LegacyPass123!";
  const salt = "legacy-salt";
  await env.FEEDBACK_STORE.put(playerKey(name), JSON.stringify({
    name,
    salt,
    passwordHash: await hashLegacyPassword(name, password, salt),
    save: {}
  }));

  const response = await onRequestPost({
    request: createRequest({ action: "login", name, password }),
    env
  });
  assert.equal(response.status, 200);
  assert.equal((await env.FEEDBACK_STORE.get(playerKey(name), "json")).passwordVersion, 2);
});

test("Google sign-in status reflects server configuration and supports App CORS", async () => {
  const request = new Request("https://example.test/api/auth/google/status", {
    headers: { Origin: origin }
  });
  const disabled = await googleStatus({
    request,
    env: { FEEDBACK_STORE: new MemoryKV() }
  });
  assert.deepEqual(await parse(disabled), { enabled: false });

  const enabled = await googleStatus({
    request,
    env: {
      FEEDBACK_STORE: new MemoryKV(),
      GOOGLE_OAUTH_CLIENT_ID: "client-id",
      GOOGLE_OAUTH_CLIENT_SECRET: "client-secret"
    }
  });
  assert.deepEqual(await parse(enabled), { enabled: true });
  assert.equal(enabled.headers.get("Access-Control-Allow-Origin"), origin);
});

test("purchased Obsidian is applied once and remains after the next login", async () => {
  const commerce = new MemoryCommerceDB();
  const env = { FEEDBACK_STORE: new MemoryKV(), COMMERCE_DB: commerce };
  const registered = await onRequestPost({
    request: createRequest({
      action: "register",
      name: "BillingPilot",
      password: "SecurePass123!",
      save: { obsidian: 25, economyRevision: 0 }
    }),
    env
  });
  const sessionToken = (await parse(registered)).sessionToken;
  const authorization = { Authorization: `Bearer ${sessionToken}` };

  commerce.wallet = {
    balance: 1800,
    lifetimePurchased: 1800,
    firstPurchaseClaimed: true
  };
  const afterPurchase = await onRequestPost({
    request: createRequest({ action: "login", name: "BillingPilot" }, authorization),
    env
  });
  const credited = (await parse(afterPurchase)).player.save;
  assert.equal(credited.obsidian, 1825);
  assert.equal(credited.economyRevision, 1);

  const nextLogin = await onRequestPost({
    request: createRequest({ action: "login", name: "BillingPilot" }, authorization),
    env
  });
  const persisted = (await parse(nextLogin)).player.save;
  assert.equal(persisted.obsidian, 1825);
  assert.equal(persisted.economyRevision, 1);

  const account = await env.FEEDBACK_STORE.get(playerKey("BillingPilot"), "json");
  assert.equal(account.commerceCreditsApplied, 1800);
  assert.equal(account.save.obsidian, 1825);
});

test("purchased Space Coin is applied once and survives the next login", async () => {
  const commerce = new MemoryCommerceDB();
  const env = { FEEDBACK_STORE: new MemoryKV(), COMMERCE_DB: commerce };
  const registered = await onRequestPost({
    request: createRequest({
      action: "register",
      name: "SpaceCoinPilot",
      password: "SecurePass123!",
      save: { spaceCoins: 50, economyRevision: 0 }
    }),
    env
  });
  const sessionToken = (await parse(registered)).sessionToken;
  const authorization = { Authorization: `Bearer ${sessionToken}` };

  commerce.spaceCoinWallet = {
    balance: 11000,
    lifetimePurchased: 11000
  };
  const afterPurchase = await onRequestPost({
    request: createRequest({ action: "login", name: "SpaceCoinPilot" }, authorization),
    env
  });
  const credited = (await parse(afterPurchase)).player.save;
  assert.equal(credited.spaceCoins, 11050);
  assert.equal(credited.economyRevision, 1);

  const nextLogin = await onRequestPost({
    request: createRequest({ action: "login", name: "SpaceCoinPilot" }, authorization),
    env
  });
  const persisted = (await parse(nextLogin)).player.save;
  assert.equal(persisted.spaceCoins, 11050);
  assert.equal(persisted.economyRevision, 1);

  const account = await env.FEEDBACK_STORE.get(playerKey("SpaceCoinPilot"), "json");
  assert.equal(account.spaceCoinCreditsApplied, 11000);
  assert.equal(account.save.spaceCoins, 11050);
});
