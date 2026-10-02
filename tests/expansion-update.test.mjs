import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import test from "node:test";
import { runInNewContext } from "node:vm";
import { applyGachaPityGuarantee, GACHA_PACKS, GACHA_PITY_TARGET, TURRET_IDS, ULTIMATE_IDS, ensureTenPullGuarantee, getGachaMilestoneRewards, getSupportVoucherPulls, isRareGachaReward } from "../functions/_shared/gacha.js";

const [indexHtml, v2, ultimate, expansion, expansionCss, playerApi, drawApi, promoMailApi, gradle, pkg] = await Promise.all([
  readFile(new URL("../index.html", import.meta.url), "utf8"),
  readFile(new URL("../v2-features.js", import.meta.url), "utf8"),
  readFile(new URL("../ultimate-system.js", import.meta.url), "utf8"),
  readFile(new URL("../expansion-system.js", import.meta.url), "utf8"),
  readFile(new URL("../expansion-system.css", import.meta.url), "utf8"),
  readFile(new URL("../functions/api/player.js", import.meta.url), "utf8"),
  readFile(new URL("../functions/api/shop/draw.js", import.meta.url), "utf8"),
  readFile(new URL("../functions/api/shop/promo-mail.js", import.meta.url), "utf8"),
  readFile(new URL("../android/app/build.gradle", import.meta.url), "utf8"),
  readFile(new URL("../package.json", import.meta.url), "utf8")
]);
const [telemetry, sourceManifest, musicFiles, uiRefinementCss] = await Promise.all([
  readFile(new URL("../telemetry-system.js", import.meta.url), "utf8"),
  readFile(new URL("../android/app/src/main/AndroidManifest.xml", import.meta.url), "utf8"),
  readdir(new URL("../assets/music/", import.meta.url)),
  readFile(new URL("../ui-refinement.css", import.meta.url), "utf8")
]);

const expectedValue = (pack, kind) => pack.rewards
  .filter((reward) => reward.kind === kind)
  .reduce((sum, reward) => sum + reward.weight / 10000 * (reward.amount || 0), 0);

test("2.9 card packs have complete 100% pools and the explicit table EV", () => {
  assert.equal(GACHA_PACKS.normal.name, "星隕補給艙");
  assert.equal(GACHA_PACKS.supreme.name, "皇極星庫");
  assert.equal(GACHA_PACKS.normal.rewards.length, 24);
  assert.equal(GACHA_PACKS.supreme.rewards.length, 31);
  assert.equal(GACHA_PACKS.normal.rewards.reduce((sum, reward) => sum + reward.weight, 0), 10000);
  assert.equal(GACHA_PACKS.supreme.rewards.reduce((sum, reward) => sum + reward.weight, 0), 10000);
  assert.ok(Math.abs(expectedValue(GACHA_PACKS.normal, "obsidian") - 59.5) < 1e-9);
  assert.ok(Math.abs(expectedValue(GACHA_PACKS.normal, "spaceCoins") - 19.42) < 1e-9);
  assert.equal(expectedValue(GACHA_PACKS.supreme, "obsidian"), 150);
  assert.equal(expectedValue(GACHA_PACKS.supreme, "spaceCoins"), 15);
  assert.equal(GACHA_PACKS.normal.oneCost, 200);
  assert.equal(GACHA_PACKS.normal.tenCost, 1800);
  assert.equal(GACHA_PACKS.supreme.currency, "spaceCoins");
  assert.equal(GACHA_PACKS.supreme.oneCost, 2000);
  assert.equal(GACHA_PACKS.supreme.tenCost, 19000);
  assert.equal(TURRET_IDS.length, 30);
  assert.equal(ULTIMATE_IDS.length, 26);
});

test("2.9 exact reward weights match the supplied tables", () => {
  const weights = (pack) => Object.fromEntries(pack.rewards.map((reward) => [reward.id, reward.weight]));
  assert.deepEqual(weights(GACHA_PACKS.normal), {
    turret_core: 10, obsidian_100000: 5, obsidian_50000: 8, obsidian_10000: 5,
    obsidian_5000: 10, obsidian_2000: 20, obsidian_1000: 50, obsidian_500: 100,
    obsidian_200: 200, obsidian_100: 500, space_coin_10: 100, space_coin_3: 400,
    turret_shard_20: 30, turret_shard_10: 60, turret_shard_5: 120, turret_shard_2: 290,
    ultimate_shard_3: 200, ultimate_shard_1: 1400, turret_shard_8: 82, obsidian_20: 3000,
    obsidian_50: 1000, obsidian_1: 400, space_coin_19000: 10, space_coin_1: 2000
  });
  assert.deepEqual(weights(GACHA_PACKS.supreme), {
    turret_core: 20, obsidian_100000: 10, obsidian_50000: 20, obsidian_20000: 50,
    obsidian_10000: 100, space_coin_50000: 1, space_coin_5000: 20, speed_4: 80,
    speed_5: 40, speed_10: 10, premium_background: 50, permanent_upgrade: 100,
    tactical_card: 100, wishlist_turret_100: 10, wishlist_ultimate_50: 20,
    all_turret_2: 20, all_ultimate_1: 40, turret_shard_50: 30, ultimate_shard_20: 75,
    elite_bundle: 100, revive_ticket: 4, obsidian_double_voucher: 100, turret_shard_1: 2500,
    turret_shard_2: 1250, ultimate_shard_1: 2500, ultimate_shard_2: 1250,
    skip_wave_voucher: 300, free_upgrade_voucher: 300, gold_double_voucher: 300,
    boss_seal_voucher: 300, stage_protection_voucher: 300
  });
  for (const reward of [...GACHA_PACKS.normal.rewards, ...GACHA_PACKS.supreme.rewards]) {
    assert.match(expansion, new RegExp(`\\["${reward.id}",\\s*${reward.weight},`), `client reward ${reward.id}:${reward.weight}`);
  }
});

test("tier 20 progression uses a slower continuous late-tier curve", () => {
  assert.match(indexHtml, /maxTier: 20/);
  assert.match(indexHtml, /MAX_TIER = Math\.max\(20/);
  assert.match(indexHtml, /let MAX_TIER = 20/);
  assert.match(playerApi, /const MAX_TIER = 20/);
  assert.match(indexHtml, /softCapTier: 10/);
  assert.match(indexHtml, /lateHpGrowth: 1\.26/);
  const tier10Hp = 1.45 ** 9;
  const tier11Hp = tier10Hp * 1.26;
  const tier20Hp = tier10Hp * 1.26 ** 10;
  assert.ok(tier11Hp > tier10Hp && tier20Hp > tier11Hp);
  assert.ok(tier11Hp / tier10Hp < 1.45);

  const tierLiteral = indexHtml.match(/tiers:\s*(\{[^}]+\})/)?.[1];
  assert.ok(tierLiteral, "embedded tier balance must be readable");
  const rule = runInNewContext(`(${tierLiteral})`);
  const difficulty = (tier) => {
    const level = tier - 1;
    const softCapLevel = rule.softCapTier - 1;
    const earlyLevel = Math.min(level, softCapLevel);
    const lateLevel = Math.max(0, level - softCapLevel);
    return {
      hp: rule.hpGrowth ** earlyLevel * rule.lateHpGrowth ** lateLevel,
      speed: rule.speedGrowth ** earlyLevel * rule.lateSpeedGrowth ** lateLevel,
      defense: level * rule.defensePerTier,
      collision: rule.collisionGrowth ** earlyLevel * rule.lateCollisionGrowth ** lateLevel,
      count: 1 + earlyLevel * rule.countPerTier + lateLevel * rule.lateCountPerTier,
      reward: rule.rewardGrowth ** earlyLevel * rule.lateRewardGrowth ** lateLevel
    };
  };
  const tiers = Array.from({ length: 20 }, (_, index) => difficulty(index + 1));
  for (let index = 1; index < tiers.length; index += 1) {
    for (const metric of ["hp", "speed", "defense", "collision", "count", "reward"]) {
      assert.ok(tiers[index][metric] > tiers[index - 1][metric], `Tier ${index + 1} ${metric} must increase`);
    }
  }
});

test("fusion, original music, consumables, and commercial events are wired", () => {
  assert.equal(musicFiles.filter((name) => name.endsWith(".ogg")).length, 25);
  for (const track of ["happy-day", "water-pop", "earth-wonder", "rock", "dark", "emotional-japan", "happy-life", "bright", "anime", "tension"]) {
    assert.equal(musicFiles.includes(`${track}.ogg`), true, `${track} loop must be packaged`);
    assert.match(expansion, new RegExp(`"${track}\\.ogg"`));
  }
  for (const count of ["23 首", "23 music", "23曲", "23곡", "23 музыкальных", "23 pistas"]) {
    assert.match(expansion, new RegExp(count));
  }
  assert.match(indexHtml, /assets\/music\/echoes-of-lumen\.ogg/);
  assert.match(expansion, /getSpaceTowerEquippedMusicUrl.*BGM_AUDIO_URL/);
  for (const file of musicFiles.filter(name => name.endsWith('.ogg'))) {
    assert.ok(musicFiles.includes(file.replace(/\.ogg$/, '.mp3')), `iOS fallback missing: ${file}`);
  }
  assert.match(expansion, /name: "Echoes of Lumen", zhName: "流明回響"/);
  assert.match(expansion, /FUSION_STONE_PRICE = 1000/);
  assert.match(expansion, /MUSIC_TRACK_PRICE = 8000/);
  assert.match(expansion, /getSpaceTowerMusicRewardMultiplier = \(\) => getMusicTrack\(expansionProgress\.equippedMusic\) \? 1\.02 : 1/);
  assert.match(v2, /backgroundMultiplier \* musicMultiplier/);
  assert.match(expansion, /ORIGINAL_MUSIC_CATALOG/);
  assert.match(expansion, /consumeSpaceTowerFusionStones/);
  assert.match(indexHtml, /id="storeUtilitiesTab"/);
  assert.match(indexHtml, /id="storeMusicTab"/);
  assert.match(indexHtml, /id="consumableDrawer"/);
  assert.match(indexHtml, /id="consumableDrawerToggle"[^>]+aria-expanded="false"/);
  assert.match(indexHtml, /id="consumableDock"/);
  assert.match(indexHtml, /id="consumableEffectStage"/);
  assert.match(indexHtml, /id="rewardedReviveTicketButton"/);
  for (const event of ["game_over", "iap_view", "purchase", "second_purchase"]) {
    assert.match(indexHtml, new RegExp(event));
  }
  assert.match(indexHtml, /\[10, 25, 50\]\.includes\(wave\)/);
  assert.match(indexHtml, /trackGameEvent\(`wave_\$\{wave\}`/);
  for (const event of ["rewarded_ad_offer", "rewarded_ad_complete", "revive_by_ad"]) assert.match(v2, new RegExp(event));
  assert.match(expansion, /obsidian_spend/);
  assert.match(expansion, /function playConsumableEffect\(id, title, detail = ""\)/);
  assert.match(expansion, /function setConsumableDrawer\(open\)/);
  assert.match(expansion, /setConsumableDrawer\(!consumableDrawerOpen\)/);
  assert.match(expansion, /getConsumableCount\(id\) > 0 && !isConsumableAlreadyActivated\(id\)/);
  assert.match(expansion, /enemy\.bossSealTimer = 2\.6/);
  assert.doesNotMatch(expansion, /enemies = enemies\.filter\(\(enemy\) => !enemy\.isBoss\)/);
  assert.match(expansion, /runConsumables\.stageProtectionThroughWave >= wave/);
  assert.match(expansion, /class="voucher-hex"/);
  assert.match(expansion, /const usesHexActivation = kind === "gold" \|\| kind === "obsidian"/);
  assert.match(expansion, /usesHexActivation \? 2050 : 1750/);
  assert.match(expansion, /return `\$\{text\[id\]\} · \$\{text\.activation\}`/);
  assert.deepEqual([...expansion.matchAll(/activation:\s*"([^"]+)"/g)].map((match) => match[1]), ["已啟動", "Activated", "発動", "활성화", "Активировано", "Efecto activo"]);
  assert.match(telemetry, /automaticEvents: \["first_open"\]/);
});

test("the cloud-save API accepts every music track sold by the client", () => {
  const clientMusicIds = [...expansion.matchAll(/^\s*\["([a-z0-9_]+)",\s*"[^"]+",\s*"[^"]+",\s*"[^"]+\.ogg"\],?$/gm)]
    .map((match) => match[1]);
  const serverMusicIds = new Set(
    (playerApi.match(/const MUSIC_KEYS = new Set\(\[([\s\S]*?)\]\);/)?.[1] || "")
      .match(/"([a-z0-9_]+)"/g)
      ?.map((value) => value.slice(1, -1)) || []
  );
  assert.equal(clientMusicIds.length, 23);
  assert.deepEqual(clientMusicIds.filter((id) => !serverMusicIds.has(id)), []);
});

test("utility consumables use three daily ad choices before balanced weekly Obsidian offers", () => {
  assert.match(expansion, /const UTILITY_AD_DAILY_LIMIT = 3/);
  const expectedOffers = {
    reviveTicket: [30, 3],
    skipWaveVoucher: [15, 5],
    freeUpgradeVoucher: [15, 5],
    goldDoubleVoucher: [40, 2],
    bossSealVoucher: [50, 1],
    stageProtectionVoucher: [40, 2]
  };
  for (const [id, [price, weeklyLimit]] of Object.entries(expectedOffers)) {
    assert.match(expansion, new RegExp(`${id}: Object\\.freeze\\(\\{ price: ${price}, weeklyLimit: ${weeklyLimit} \\}\\)`));
  }
  assert.doesNotMatch(expansion, /if \(claims\.adClaims < UTILITY_AD_DAILY_LIMIT\) return/);
  assert.match(expansion, /obsidianDoubleVoucher: Object\.freeze\(\{ price: 0, weeklyLimit: 0, rewardOnly: true/);
  assert.match(expansion, /await window\.showRewardedAd\?\.\("utility_consumable"\)/);
  assert.match(expansion, /if \(!completed\)[\s\S]*?return;[\s\S]*?currentClaims\.adClaims \+= 1/);
  assert.match(expansion, /trackObsidianSpend\("utility_store", id, price\)/);
  assert.match(v2, /utility_consumable: "ca-app-pub-4461762858602817\/9681205002"/);
  assert.match(v2, /launch_reward_double: "ca-app-pub-4461762858602817\/9681205002"/);
  assert.match(playerApi, /UTILITY_WEEK_LIMITS = Object\.freeze\(\{ reviveTicket: 3, obsidianDoubleVoucher: 3, skipWaveVoucher: 5, freeUpgradeVoucher: 5, goldDoubleVoucher: 2, bossSealVoucher: 1, stageProtectionVoucher: 2 \}\)/);
});

test("source manifest keeps only required app permissions", () => {
  for (const permission of ["android.permission.INTERNET", "com.google.android.gms.permission.AD_ID", "com.android.vending.BILLING"]) assert.match(sourceManifest, new RegExp(permission));
  for (const permission of ["ACCESS_COARSE_LOCATION", "ACCESS_FINE_LOCATION", "BLUETOOTH", "FOREGROUND_SERVICE", "ACCESS_WIFI_STATE", "CHANGE_WIFI_STATE"]) assert.doesNotMatch(sourceManifest, new RegExp(permission));
});

test("card packs keep odds and EV out of the player UI and reveal rarity animations", () => {
  assert.doesNotMatch(expansion, /機率與期望值/);
  assert.doesNotMatch(expansion, /每抽期望/);
  assert.doesNotMatch(expansion, /data-pack-odds|pack-odds|獎項機率/);
  assert.match(expansion, /function playDrawReveal/);
  assert.match(expansion, /await unlockAudio\?\.\(\)/);
  assert.match(expansion, /data-reveal-prize/);
  assert.match(expansion, /playGachaRaritySound\(prizeCard\.dataset\.rarity\)/);
  assert.match(expansion, /gacha-vault-sequence/);
  assert.match(expansionCss, /@keyframes gachaVaultCore/);
  assert.match(expansionCss, /@keyframes gachaVaultBeam/);
  for (const rarity of ["common", "rare", "epic", "legendary", "mythic"]) {
    assert.match(expansionCss, new RegExp(`\\.gacha-card\\.rarity-${rarity}`));
  }
  assert.match(expansionCss, /\.gacha-card-shell/);
  assert.match(expansionCss, /\.gacha-card-back/);
  assert.doesNotMatch(expansionCss, /repeating-conic-gradient/);
  assert.match(expansionCss, /@keyframes gachaPrizePulse/);
  assert.match(expansion, /assets\/sfx\/gacha-anticipation\.ogg/);
  assert.match(expansion, /assets\/sfx\/gacha-jackpot-music\.ogg/);
  assert.match(expansion, /function duckGachaBgm/);
  const gachaMusicBlock = expansion.match(/const GACHA_MUSIC_URLS[\s\S]*?function localRewardIsRare/)?.[0] || "";
  assert.doesNotMatch(gachaMusicBlock, /createOscillator|playGachaOpeningFallback|playGachaRarityFallback/);
});

test("card-pack storefront, results, and reveal copy follow all six game languages", () => {
  const contentBlock = expansion.match(/const GACHA_CONTENT_TEXT = Object\.freeze\(\{[\s\S]*?\n\}\);/)?.[0] || "";
  for (const language of ["zh", "en", "ja", "ko", "ru", "es"]) {
    assert.match(contentBlock, new RegExp(`\\n\\s*${language}:\\s*\\{`), `${language} card-pack content`);
  }
  for (const key of ["packsTitle", "pullOne", "pullMany", "obsidian", "spaceCoins", "normal", "supreme", "rewards"]) {
    assert.equal((contentBlock.match(new RegExp(`\\b${key}:`, "g")) || []).length >= 6, true, `${key} covers six languages`);
  }
  assert.match(expansion, /GACHA_CONTENT_TEXT\[currentLanguage\] \|\| GACHA_CONTENT_TEXT\.en/);
  assert.match(expansion, /localizedPackName\(pack\)/);
  assert.match(expansion, /localizedRewardLabel\(definition\)/);
  assert.match(expansion, /localizedPullCount\(rewards\.length\)/);
  assert.match(expansion, /renderSupplyPacks\(\);/);
  assert.match(expansion, /window\.addEventListener\("space-tower-language-changed", refreshExpansionLanguage\)/);
});

test("rebuilt lobby uses equal mobile grids without legacy tab or menu spans", () => {
  assert.match(expansionCss, /\.home-page-tabs[\s\S]*?grid-template-columns: repeat\(6, minmax\(0, 1fr\)\) !important/);
  assert.match(expansionCss, /@media \(max-width: 760px\)[\s\S]*?\.home-page-tabs \{ grid-template-columns: repeat\(3, minmax\(0, 1fr\)\) !important/);
  assert.match(expansionCss, /\.home-page-tab:nth-child\(n\)[\s\S]*?grid-column: auto !important/);
  assert.match(expansionCss, /\.home-pilot-console \.login-actions[\s\S]*?grid-template-columns: repeat\(2, minmax\(0, 1fr\)\) !important/);
  assert.match(expansionCss, /#homePreviewButton \{ display: flex !important/);
  assert.match(expansionCss, /@media \(max-width: 390px\)[\s\S]*?\.home-menu \{ grid-template-columns: repeat\(4, minmax\(0, 1fr\)\) !important/);
  assert.doesNotMatch(expansionCss, /@media \(max-width: 390px\)[\s\S]*?\.home-menu \{ grid-template-columns: 1fr !important/);
});

test("the lobby exposes the complete shared settings dialog", () => {
  assert.match(indexHtml, /id="lobbySettingsButton"[^>]+aria-haspopup="dialog"/);
  assert.match(indexHtml, /id="settingsBackdrop"/);
  assert.match(indexHtml, /id="settingsPanel"[\s\S]*?id="settingsLanguage"[\s\S]*?id="masterVolume"[\s\S]*?id="sfxToggle"[\s\S]*?id="bgmToggle"[\s\S]*?id="qualitySelect"[\s\S]*?id="settingsFullscreenButton"/);
  assert.match(indexHtml, /lobbySettingsButton\.addEventListener\("click"[\s\S]*?setSettingsOpen/);
  assert.doesNotMatch(indexHtml, /body:not\(\.in-game\) \.settings-panel/);
});

test("native lobby fills the usable phone screen and hides the web fullscreen control", () => {
  assert.match(indexHtml, /document\.body\.classList\.toggle\("native-app", IS_NATIVE_APP\)/);
  assert.match(indexHtml, /const LOCAL_NATIVE_PREVIEW = \["localhost", "127\.0\.0\.1", "::1"\]/);
  assert.match(indexHtml, /const CAN_USE_FULLSCREEN = !IS_NATIVE_APP/);
  assert.match(indexHtml, /settingsFullscreenButton\.hidden = !CAN_USE_FULLSCREEN/);
  assert.match(uiRefinementCss, /body\.native-app:not\(\.in-game\) \.login-screen[\s\S]*?place-items:stretch!important/);
  assert.match(uiRefinementCss, /body\.native-app:not\(\.in-game\) \.login-box[\s\S]*?height:calc\(100dvh - var\(--safe-top\) - var\(--safe-bottom\)\)!important/);
  assert.match(uiRefinementCss, /grid-template-rows:auto auto minmax\(0,1fr\)!important/);
  assert.match(uiRefinementCss, /#homePlayPage \.home-command[\s\S]*?grid-template-rows:minmax\(0,1fr\) auto!important/);
  assert.match(uiRefinementCss, /#homePlayPage \.home-pilot-console\.expanded[\s\S]*?0 0 0 100vmax rgba\(1,5,15,\.82\)/);
  assert.match(uiRefinementCss, /#homePlayPage \.home-pilot-console\.expanded[\s\S]*?background:[\s\S]*?linear-gradient\(155deg,#08243a/);
  assert.match(uiRefinementCss, /mobile command deck: full-screen composition without stretching an empty card/);
  assert.match(uiRefinementCss, /grid-template-rows:auto minmax\(150px,1fr\) auto auto!important/);
  assert.match(uiRefinementCss, /border-radius:0!important/);
});

test("tutorial surfaces are removed without deleting the earned first-deployment rewards", () => {
  assert.doesNotMatch(indexHtml, /id="tutorialOpenButton"/);
  assert.doesNotMatch(indexHtml, /id="tutorialScreen"/);
  assert.doesNotMatch(indexHtml, /id="firstDeploymentPanel"/);
  assert.doesNotMatch(indexHtml, /maybeOpenTutorial\(\)/);
  assert.match(indexHtml, /tutorial_complete/);
  assert.match(indexHtml, /if \(index === 0\) gold \+= 20/);
  assert.match(indexHtml, /if \(index === 1\) gold \+= 30/);
  assert.match(indexHtml, /grantV2FirstDeploymentFragment/);
});

test("card packs live under the in-game store tab and not the currency top-up screen", () => {
  const storePage = indexHtml.match(/<section class="home-page hidden" id="homeStorePage"[\s\S]*?<\/section>\s*<\/form>/)?.[0] || "";
  const currencyShop = indexHtml.match(/<section class="shop-screen hidden" id="shopScreen"[\s\S]*?<div class="shop-grid"/)?.[0] || "";
  assert.match(storePage, /id="storePacksTab"/);
  assert.match(storePage, /id="supplyPackSection"/);
  assert.doesNotMatch(currencyShop, /id="supplyPackSection"/);
});

test("turret cores gate stars and retain the requested tier-scaled drop chance", () => {
  assert.match(v2, /V2_TURRET_CORE_REQUIREMENTS = Object\.freeze\(\[3, 5, 10, 20\]\)/);
  assert.match(v2, /V2_TURRET_CORE_DROP_BASE = 0\.00001/);
  assert.match(v2, /V2_TURRET_CORE_TIER_MULTIPLIER = 1\.1/);
  assert.match(v2, /window\.consumeSpaceTowerFusionStones\?\.\(missingCores\)/);
  assert.match(v2, /v2Progress\.cores\[id\] -= Math\.min\(coreCount, coreRequirement\)/);
  assert.match(v2, /maybeDropTurretCore\(enemy\)/);
  assert.match(v2, /renderTurretCoreIcon\(turret\)/);
});

test("2.8 fixes equipped ultimate ranking, extra-row balance and pause-only run resume", () => {
  assert.match(ultimate, /action === "locked" \|\| \(action === "equip" && equipped\)/);
  assert.match(v2, /0\.10 \+ Math\.max\(0, cardEffects\.extraRowLevel - 1\) \* 0\.05/);
  const returnHomeWrapper = v2.match(/returnHome = function \(\) \{[\s\S]*?\n\};/)?.[0] || "";
  assert.match(returnHomeWrapper, /if \(isPaused\) saveActiveRunCheckpoint\(\)/);
  assert.match(returnHomeWrapper, /else clearActiveRunCheckpoint\(\)/);
  assert.match(v2, /version: 4,[\s\S]*?resumeEligible: true/);
  assert.match(v2, /!gameStarted \|\| !running \|\| !isPaused \|\| coreHp <= 0/);
  assert.match(v2, /checkpoint\.version !== 4 \|\| checkpoint\.resumeEligible !== true/);
  const endRunWrapper = v2.match(/endRun = function \(\) \{[\s\S]*?\n\};/)?.[0] || "";
  assert.match(endRunWrapper, /clearActiveRunCheckpoint\(\)[\s\S]*?activeRunBaseEndRun\(\)[\s\S]*?clearActiveRunCheckpoint\(\)/);
  assert.match(v2, /gameSpeed = savedSpeed < 4/);
});

test("speed licenses, lobby deployment and launch-week safety are wired", () => {
  assert.match(expansion, /SPEED_LICENSE_COSTS = Object\.freeze\(\{ 4: 2000, 5: 3000, 10: 5000 \}\)/);
  assert.match(expansion, /CLOSED_TEST_LAUNCH_PROMO_ACTIVE = false/);
  assert.match(indexHtml, /id="deploymentButton"/);
  assert.match(indexHtml, /id="homeUltimatePage"/);
  assert.match(indexHtml, /id="accountSwitcher"[^>]+hidden/);
  assert.doesNotMatch(indexHtml, /id="tutorialOpenButton"/);
  assert.equal((indexHtml.match(/startGame\(playerName \|\| "Guest"\)/g) || []).length, 1);
});

test("card packs use visible guarantees, wishlist milestones, stardust, and support vouchers", () => {
  const common = Array.from({ length: 10 }, () => ({ id: "obsidian_20", kind: "obsidian", amount: 40, weight: 3000 }));
  const guaranteed = ensureTenPullGuarantee("normal", common, 0);
  assert.equal(guaranteed.length, 10);
  assert.equal(guaranteed.some(isRareGachaReward), true);
  assert.equal(guaranteed.at(-1).kind, "wishlistTurretFragments");
  assert.equal(GACHA_PITY_TARGET, 10);
  const nineMisses = applyGachaPityGuarantee("normal", common.slice(0, 9), 0);
  assert.equal(nineMisses.pity, 9);
  const forcedTenth = applyGachaPityGuarantee("normal", common.slice(0, 1), nineMisses.pity);
  assert.equal(forcedTenth.results[0].kind, "wishlistTurretFragments");
  assert.equal(forcedTenth.pity, 0);
  const resetByRare = applyGachaPityGuarantee("normal", [{ id: "rare", kind: "turretCore", amount: 1, weight: 10 }], 9);
  assert.equal(resetByRare.results[0].kind, "turretCore");
  assert.equal(resetByRare.pity, 0);
  assert.deepEqual(getGachaMilestoneRewards("normal", 29, 30).map(({ kind, amount }) => [kind, amount]), [["wishlistTurretFragments", 10]]);
  assert.deepEqual(getGachaMilestoneRewards("supreme", 99, 100).map(({ kind, amount }) => [kind, amount]), [["wishlistUltimateFragments", 50]]);
  assert.deepEqual(getGachaMilestoneRewards("normal", 199, 200).map(({ kind, amount }) => [kind, amount]), [["wishlistTurretFragments", 50], ["wishlistUltimateFragments", 50]]);
  assert.equal(getSupportVoucherPulls(99, 100), 50);
  assert.equal(getSupportVoucherPulls(199, 200), 20);
  assert.match(drawApi, /applyGachaPityGuarantee/);
  assert.match(drawApi, /save\.expansionProgress\.gachaPity\[pack\.id\] = guaranteed\.pity/);
  assert.match(drawApi, /starDustEarned = pulls \+ \(pulls === 10 \? 2 : 0\)/);
  assert.match(drawApi, /getSupportVoucherPulls\(paidBefore, paidAfter\)/);
  assert.match(expansion, /data-pack-info/);
  assert.match(expansion, /packContentsModal/);
  assert.match(expansion, /data-dust-offer/);
  assert.match(expansion, /gachaTurretWishlist/);
  assert.match(expansion, /gachaUltimateWishlist/);
  assert.match(expansion, /playGachaRaritySound/);
  assert.match(expansion, /gachaPity/);
  assert.match(expansion, /progress max="10" value="\$\{pityProgress\}"/);
  assert.doesNotMatch(expansion, /支持回饋/);
  assert.match(expansion, /100 抽送 50 抽/);
  assert.match(indexHtml, /id="homeStarDustValue"/);
  assert.match(expansion, /homeStarDustValue\.textContent = formatCompactNumber\(expansionProgress\.starDust\)/);
  assert.match(uiRefinementCss, /@keyframes starter-offer-breathe/);
  assert.match(uiRefinementCss, /@keyframes obsidian-offer-breathe/);
  assert.match(expansionCss, /\.store-section-tabs \{\s+position:relative;\s+top:auto;/);
  assert.match(playerApi, /authoritativeExpansion/);
  assert.match(promoMailApi, /promoMailReceipts/);
});

test("revisioned cloud progress prevents fragment refunds and equipment rollback", () => {
  assert.match(playerApi, /chooseRevisionedProgress/);
  assert.match(playerApi, /next\.revision > current\.revision/);
  const v2Merge = playerApi.match(/const mergeV2Progress[\s\S]*?\n\};/)?.[0] || "";
  assert.doesNotMatch(v2Merge, /Math\.max\(left\[key\]/);
  assert.match(playerApi, /ultimateProgress: chooseRevisionedProgress/);
  assert.match(drawApi, /gachaReceipts/);
  assert.match(drawApi, /duplicate: true/);
});

test("login and remembered-session flows stay in the lobby until deployment", () => {
  const loginFlow = indexHtml.match(/async function loginAndStart[\s\S]*?\n    async function resumeRememberedPlayer/)?.[0] || "";
  const rememberedFlow = indexHtml.match(/async function resumeRememberedPlayer[\s\S]*?\n    async function switchRememberedPlayer/)?.[0] || "";
  const guestHandler = indexHtml.match(/guestStart\.addEventListener\("click"[\s\S]*?\n    \}\);/)?.[0] || "";
  const deployHandler = indexHtml.match(/deploymentButton\.addEventListener\("click"[\s\S]*?\n    \}\);/)?.[0] || "";
  assert.doesNotMatch(loginFlow, /startGame\(/);
  assert.doesNotMatch(rememberedFlow, /startGame\(/);
  assert.doesNotMatch(guestHandler, /startGame\(/);
  assert.match(deployHandler, /startGame\(playerName \|\| "Guest"\)/);
});

test("simulated main and auxiliary swaps never mint fragments or assembled turrets", () => {
  const equipmentFunction = (v2.match(/function changeTurretEquipment[\s\S]*?\n}\n\nhomeCodexTab/)?.[0] || "")
    .replace(/\n\nhomeCodexTab[\s\S]*$/, "");
  assert.ok(equipmentFunction, "equipment function must be extractable");
  const definitions = [
    { id: "main_a", role: "main" }, { id: "main_b", role: "main" },
    { id: "aux_a", role: "auxiliary" }, { id: "aux_b", role: "auxiliary" }
  ];
  const progress = {
    active: { main_a: 1, main_b: 0, aux_a: 1, aux_b: 0 },
    assembled: { main_a: 1, main_b: 1, aux_a: 1, aux_b: 1 },
    fragments: { main_a: 17, main_b: 29, aux_a: 31, aux_b: 43 }
  };
  const originalFragments = structuredClone(progress.fragments);
  const originalAssembled = structuredClone(progress.assembled);
  let saveCalls = 0;
  const context = {
    V2_TURRET_DEFS: definitions,
    v2Progress: progress,
    getTurretRoleSlotCap: () => 1,
    getActiveTurretRoleCount: (role) => definitions
      .filter((item) => item.role === role)
      .reduce((sum, item) => sum + progress.active[item.id], 0),
    saveV2Progress: () => { saveCalls += 1; },
    renderSynergyStrip: () => {},
    window: { spaceTowerTrackEvent: () => {} },
    Math,
    Number
  };
  runInNewContext(equipmentFunction, context);
  for (let index = 0; index < 25; index += 1) {
    context.changeTurretEquipment(index % 2 ? "main_a" : "main_b", 1);
    context.changeTurretEquipment(index % 2 ? "aux_a" : "aux_b", 1);
  }
  assert.deepEqual(progress.fragments, originalFragments);
  assert.deepEqual(progress.assembled, originalAssembled);
  assert.equal(progress.active.main_a + progress.active.main_b, 1);
  assert.equal(progress.active.aux_a + progress.active.aux_b, 1);
  assert.equal(saveCalls, 50);
  const renderWorkshop = v2.match(/function renderV2Workshop\(\)[\s\S]*?\n}\n\nfunction buildSupportTurret/)?.[0] || "";
  assert.doesNotMatch(renderWorkshop, /v2Progress\.fragments\[[^\]]+\]\s*(?:=|\+=|\+\+)/);
});

test("one turret type can fill multiple matching main or auxiliary slots", () => {
  assert.doesNotMatch(v2, /assembled\[turret\.id\] = v2Progress\.stars\[turret\.id\] > 0 \? 1 : 0/);
  assert.match(v2, /v2Progress\.assembled\[id\] \+= 1/);
  const equipmentFunction = (v2.match(/function changeTurretEquipment[\s\S]*?\n}\n\nhomeCodexTab/)?.[0] || "")
    .replace(/\n\nhomeCodexTab[\s\S]*$/, "");
  const progress = {
    active: { aux_repeat: 0 },
    assembled: { aux_repeat: 6 },
    fragments: { aux_repeat: 50 }
  };
  const context = {
    V2_TURRET_DEFS: [{ id: "aux_repeat", role: "auxiliary" }],
    v2Progress: progress,
    getTurretRoleSlotCap: () => 6,
    getActiveTurretRoleCount: () => progress.active.aux_repeat,
    saveV2Progress: () => {},
    renderSynergyStrip: () => {},
    window: { spaceTowerTrackEvent: () => {} },
    Math,
    Number
  };
  runInNewContext(equipmentFunction, context);
  for (let index = 0; index < 6; index += 1) context.changeTurretEquipment("aux_repeat", 1);
  assert.equal(progress.active.aux_repeat, 6);
  assert.equal(progress.assembled.aux_repeat, 6);
  assert.equal(progress.fragments.aux_repeat, 50);
});

test("wave 500 and 1000 bosses take priority over legacy boss intervals", () => {
  assert.match(indexHtml, /starRing:[\s\S]*?interval: 500/);
  assert.match(indexHtml, /omegaCrystal:[\s\S]*?interval: 1000/);
  assert.match(indexHtml, /if \(waveNumber % BOSS_TYPES\.omegaCrystal\.interval === 0\)/);
  assert.match(indexHtml, /if \(waveNumber % BOSS_TYPES\.starRing\.interval === 0\)/);
  assert.match(indexHtml, /enemy\.shape === "starRingBoss"/);
  assert.match(indexHtml, /enemy\.shape === "omegaCrystalBoss"/);
});

test("the Android encoding hotfix artifact identity is 2.9.30 code 68", () => {
  assert.equal(JSON.parse(pkg).version, "2.9.30");
  assert.match(gradle, /versionCode 68/);
  assert.match(gradle, /versionName "2\.9\.30"/);
  assert.match(indexHtml, /data-game-version="2\.9\.30"/);
  assert.match(indexHtml, /data-game-version-code="64"/);
  assert.match(indexHtml, /expansion-system\.js\?v=2\.9\.30/);
});
