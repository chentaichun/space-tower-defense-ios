import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";

const [indexHtml, v2Features, v2I18n, v2Css, ultimateSystem, ultimateCss, commerce, billingPlugin, androidGradle, androidRootGradle, androidManifest, capacitorConfig, packageJson, androidStrings, balanceApi, telemetrySystem, engagementCss, admobDefault, admobClosedTest, admobProduction, androidBuildScript] = await Promise.all([
  readFile(new URL("../index.html", import.meta.url), "utf8"),
  readFile(new URL("../v2-features.js", import.meta.url), "utf8"),
  readFile(new URL("../v2-i18n.js", import.meta.url), "utf8"),
  readFile(new URL("../v2.css", import.meta.url), "utf8"),
  readFile(new URL("../ultimate-system.js", import.meta.url), "utf8"),
  readFile(new URL("../ultimate-system.css", import.meta.url), "utf8"),
  readFile(new URL("../functions/_shared/commerce.js", import.meta.url), "utf8"),
  readFile(new URL("../android/app/src/main/java/com/mrchen/spacetowerdefense/GooglePlayBillingPlugin.java", import.meta.url), "utf8"),
  readFile(new URL("../android/app/build.gradle", import.meta.url), "utf8"),
  readFile(new URL("../android/build.gradle", import.meta.url), "utf8"),
  readFile(new URL("../android/app/src/main/AndroidManifest.xml", import.meta.url), "utf8"),
  readFile(new URL("../capacitor.config.json", import.meta.url), "utf8"),
  readFile(new URL("../package.json", import.meta.url), "utf8"),
  readFile(new URL("../android/app/src/main/res/values/strings.xml", import.meta.url), "utf8"),
  readFile(new URL("../functions/api/balance.js", import.meta.url), "utf8"),
  readFile(new URL("../telemetry-system.js", import.meta.url), "utf8"),
  readFile(new URL("../engagement-system.css", import.meta.url), "utf8"),
  readFile(new URL("../admob-config.js", import.meta.url), "utf8"),
  readFile(new URL("../release/admob.closed-test.js", import.meta.url), "utf8"),
  readFile(new URL("../release/admob.production.js", import.meta.url), "utf8"),
  readFile(new URL("../build-android.ps1", import.meta.url), "utf8")
]);

test("in-run upgrades use one continuous grid without a tactical divider", () => {
  assert.doesNotMatch(indexHtml, /class="v2-upgrade-divider"/);
  assert.doesNotMatch(indexHtml, /id="v2UpgradeTitle"/);
  assert.match(v2Css, /\.v2-upgrade-grid\s*\{\s*display:\s*contents;/);
});

test("outside tactical upgrades unlock their matching in-run Gold upgrades", () => {
  const expectedMappings = {
    defenseRate: "defenseRate",
    physicalArmor: "physicalDefense",
    magicArmor: "magicDefense",
    slowModule: "slowModule",
    knockbackModule: "knockbackModule",
    reflectModule: "reflectModule",
    mineRadius: "mineRadius",
    mineChance: "mineChance",
    fighterCap: "fighterHangar",
    waveGold: "waveGold",
    goldMultiplier: "goldMultiplier",
    waveObsidian: "waveObsidian",
    medkit: "medkit"
  };
  for (const [runUpgrade, metaUpgrade] of Object.entries(expectedMappings)) {
    assert.match(
      v2Features,
      new RegExp(`id:\\s*"${runUpgrade}"[^\\n]+meta:\\s*"${metaUpgrade}"`),
      `${runUpgrade} must be unlocked by ${metaUpgrade}`
    );
  }
  assert.match(v2Features, /function isV2UpgradeUnlocked\(def\)[\s\S]*?getMetaLevel\(def\.meta\) > 0/);
  assert.match(v2Features, /if \(!DEV_MODE\) gold -= cost;/);
});

test("in-run upgrade buttons stay connected while the HUD refreshes", () => {
  assert.doesNotMatch(v2Features, /function renderV2UpgradeGrid\(\)[\s\S]*?v2UpgradeGrid\.innerHTML = "";/);
  assert.match(v2Features, /v2UpgradeGrid\.querySelector\(`\[data-v2-upgrade="\$\{def\.id\}"\]`\)/);
  assert.match(v2Features, /button\.addEventListener\("click", \(\) => buyV2Upgrade\(def\.id\)\)/);
  assert.match(v2Css, /\.v2-upgrade-grid \.upgrade-card\s*\{[\s\S]*?touch-action:\s*manipulation;/);
});

test("fighter Hangar levels spawn fighters and in-run upgrades add another fighter", () => {
  assert.match(v2Features, /towerStats\.fighterCap = clamp\(getMetaValue\("fighterHangar"\), 0, 8\);/);
  assert.match(v2Features, /for \(let index = 0; index < towerStats\.fighterCap; index \+= 1\)[\s\S]*?fighters\.push/);
  assert.match(v2Features, /id === "fighterCap"[\s\S]*?towerStats\.fighterCap = Math\.min\(8, towerStats\.fighterCap \+ 1\);[\s\S]*?fighters\.push/);
});

test("Tier 2 unlocks eight balanced skill cards that enter the normal draw pool", () => {
  const tier2Cards = [
    ["armor_breaker", "armorBreakerLevel"],
    ["plasma_burst", "plasmaBurstLevel"],
    ["finisher", "finisherLevel"],
    ["shield_recharge", "shieldRechargeLevel"],
    ["ricochet", "ricochetLevel"],
    ["repair_nanites", "nanoRepairLevel"],
    ["bounty_matrix", "goldMultiplier"],
    ["last_stand", "lastStandLevel"]
  ];
  for (const [id, effect] of tier2Cards) {
    assert.match(v2Features, new RegExp(`id: "${id}"[^\\n]+unlockTier: 2[^\\n]+maxStacks: 5`), `${id} must unlock at Tier 2`);
    assert.match(v2Features, new RegExp(`${id}:[^\\n]+${effect}|id: "${id}"[\\s\\S]{0,420}?${effect}`), `${id} must connect to its combat effect`);
    assert.match(v2Features, new RegExp(`${id}: \\["[^\\n]+"[^\\n]+"[^\\n]+"\\]`), `${id} needs semantic card art`);
    assert.equal((v2I18n.match(new RegExp(`${id}:`, "g")) || []).length, 6, `${id} must be translated in six languages`);
  }
  assert.match(indexHtml, /Number\.isFinite\(card\.unlockTier\) && unlockedTier < card\.unlockTier/);
  assert.match(indexHtml, /SPECIAL_CARDS\.filter\(\(card\) => isCardUnlocked\(card\)/);
  assert.match(indexHtml, /SPECIAL_CARDS\.filter\(\(item\) => item\.unlockCost \|\| Number\.isFinite\(item\.unlockTier\)\)/);
  assert.doesNotMatch(indexHtml, /createLockedMetaCard|<b>\$\{metaText\.tier2\}<\/b>/);
  assert.match(v2Features, /Math\.min\(0\.3, cardEffects\.armorBreakerLevel \* 0\.06\)/);
  assert.match(v2Features, /enemy\.hp \/ enemy\.maxHp < 0\.3/);
  assert.match(v2Features, /Math\.ceil\(cardEffects\.shieldRechargeLevel \/ 2\)/);
  assert.match(v2Features, /0\.05 \+ cardEffects\.ricochetLevel \* 0\.03/);
  assert.match(v2Features, /towerStats\.maxHp \* cardEffects\.nanoRepairLevel \* 0\.0003/);
  assert.match(v2Features, /cardEffects\.lastStandLevel \* 0\.08/);
  for (const marker of [
    "v2ArmorBreakFxAt", "#b987ff", "v2FinisherFxAt", "#78b7ff",
    "#79efff", "nanoRepairVisualTimer", "bountyMatrixLevel", "lastStandVisualTimer"
  ]) {
    assert.match(v2Features, new RegExp(marker.replace("#", "#")), `${marker} visual effect must be wired`);
  }
  assert.match(v2Features, /class="card-art semantic-card-art tone-\$\{tone\}"/);
  assert.match(v2Features, /getLocalizedCard\(card\)\.name/);

  const unlockSource = indexHtml.match(/function isCardUnlocked\(card\) \{[\s\S]*?\n    \}/)?.[0] || "";
  const unlockContext = { DEV_MODE: false, unlockedTier: 1, Number, getMetaLevel: () => 0 };
  vm.runInNewContext(`${unlockSource}; this.isCardUnlocked = isCardUnlocked;`, unlockContext);
  assert.equal(unlockContext.isCardUnlocked({ id: "armor_breaker", unlockTier: 2 }), false);
  unlockContext.unlockedTier = 2;
  assert.equal(unlockContext.isCardUnlocked({ id: "armor_breaker", unlockTier: 2 }), true);
});

test("Tier 2 to 4 codex enemies are guaranteed on their advertised debut waves", () => {
  const expected = [
    ["splitter", 2, 80],
    ["ranged", 2, 150],
    ["healer", 3, 120],
    ["full_shield", 3, 240],
    ["buffer", 4, 160],
    ["frontal_shield", 4, 300]
  ];
  for (const [name, tier, wave] of expected) {
    assert.match(v2Features, new RegExp(`${name}: \\{[^\\n]+unlockTier: ${tier}, unlockWave: ${wave},`));
  }

  const helper = v2Features.match(/function getV2GuaranteedEnemyTypes\(waveNumber, tier = activeRunTier\) \{[\s\S]*?\n\}/)?.[0];
  assert.ok(helper, "guaranteed debut helper must exist");
  const context = {
    ENEMY_TYPES: Object.fromEntries(expected.map(([name, unlockTier, unlockWave]) => [name, { name, unlockTier, unlockWave }]))
  };
  vm.runInNewContext(`${helper}; result = {
    tier2Wave150: getV2GuaranteedEnemyTypes(150, 2).map(type => type.name),
    tier3Wave120: getV2GuaranteedEnemyTypes(120, 3).map(type => type.name),
    tier3Wave240: getV2GuaranteedEnemyTypes(240, 3).map(type => type.name),
    tier4Wave160: getV2GuaranteedEnemyTypes(160, 4).map(type => type.name),
    beforeUnlock: getV2GuaranteedEnemyTypes(120, 2).map(type => type.name)
  };`, context);
  assert.deepEqual([...context.result.tier2Wave150], ["ranged"]);
  assert.deepEqual([...context.result.tier3Wave120], ["healer"]);
  assert.deepEqual([...context.result.tier3Wave240], ["full_shield"]);
  assert.deepEqual([...context.result.tier4Wave160], ["buffer"]);
  assert.deepEqual([...context.result.beforeUnlock], []);
  const wrapper = v2Features.match(/const v2BaseChooseEnemyType = chooseEnemyType;[\s\S]*?chooseEnemyType = function \(waveNumber\) \{[\s\S]*?\n\};/)?.[0];
  assert.ok(wrapper, "spawn selector must consume the guaranteed debut queue");
  const runtime = {
    activeRunTier: 3,
    ENEMY_TYPES: context.ENEMY_TYPES,
    chooseEnemyType: () => ({ name: "weighted_random" })
  };
  vm.runInNewContext(`${helper}\n${wrapper}\nresult = {
    healer: chooseEnemyType(120).name,
    nextAfterHealer: chooseEnemyType(120).name,
    shield: chooseEnemyType(240).name
  };`, runtime);
  assert.deepEqual({ ...runtime.result }, {
    healer: "healer",
    nextAfterHealer: "weighted_random",
    shield: "full_shield"
  });
});

test("active App runs checkpoint frequently and on background lifecycle events", () => {
  assert.match(v2Features, /ACTIVE_RUN_SAVE_PREFIX/);
  assert.match(v2Features, /setInterval\(saveActiveRunCheckpoint, ACTIVE_RUN_CHECKPOINT_MS\)/);
  assert.match(v2Features, /window\.addEventListener\("pagehide", saveActiveRunCheckpoint\)/);
  assert.match(v2Features, /document\.addEventListener\("visibilitychange"/);
  assert.match(v2Features, /addNativeListenerSafely\(activeRunAppPlugin, "appStateChange"/);
  assert.match(v2Features, /restoreActiveRunCheckpoint\(\)/);
});

test("native listener handles cannot abort the Android localization bootstrap", () => {
  assert.match(indexHtml, /function addNativeListenerSafely\(plugin, eventName, listener\)/);
  assert.match(indexHtml, /typeof result\.catch === "function"/);
  assert.match(v2Features, /addNativeListenerSafely\(activeRunAppPlugin, "appStateChange"/);
  assert.doesNotMatch(v2Features, /addListener\([\s\S]{0,180}\)\.catch/);
  assert.match(v2Features, /window\.refreshSpaceTowerV2Language = refreshV2LocalizedUi/);
});

test("economy changes carry a revision and critical outside purchases bypass save throttling", () => {
  assert.match(indexHtml, /economyRevision:\s*Math\.max/);
  assert.match(indexHtml, /function markEconomyMutation/);
  assert.match(indexHtml, /saveObsidian\(\{ critical: true \}\)/);
  assert.match(indexHtml, /savePlayerProgress\(\{ bypassThrottle: true \}\)/);
});

test("one device can remember multiple accounts without mixing their cloud progress", () => {
  assert.match(indexHtml, /PLAYER_SESSIONS_KEY = "spaceTowerPlayerSessionsV1"/);
  assert.match(indexHtml, /rememberedPlayerSessions\[sessionPlayerName\.toLowerCase\(\)\]/);
  assert.match(indexHtml, /id="newAccountButton"/);
  assert.match(indexHtml, /switchingAccounts[\s\S]*?\{ save: \{\}, replaceLocalProgress: true \}/);
  assert.match(indexHtml, /const replaceLocalProgress = options\.replaceLocalProgress === true/);
  assert.match(v2Features, /if \(options\.replaceLocalProgress === true\)[\s\S]*?v2Progress = normalizeV2Progress/);
});

test("Google sign-in stays clickable in the App even when the status preflight fails", () => {
  assert.doesNotMatch(indexHtml, /id="googleSignInButton"[^>]*disabled/);
  assert.match(indexHtml, /function setAuthBusy\(busy\)[\s\S]*?googleSignInButton\.disabled = authBusy;/);
  assert.doesNotMatch(indexHtml, /async function startGoogleSignIn\(\)[\s\S]*?if \(!googleAuthEnabled \|\| authBusy\)/);
  assert.match(indexHtml, /googleSignInButton\.disabled = authBusy;/);
});

test("Android currency purchases use Google Play Billing with server verification", () => {
  assert.match(androidGradle, /com\.android\.billingclient:billing:\$billing_version/);
  assert.match(androidGradle, /billing_version = "9\.1\.0"/);
  assert.match(androidManifest, /com\.android\.vending\.BILLING/);
  assert.match(billingPlugin, /@CapacitorPlugin\(name = "GooglePlayBilling"\)/);
  assert.match(billingPlugin, /enableOneTimeProducts\(\)/);
  assert.match(billingPlugin, /setObfuscatedAccountId/);
  assert.match(billingPlugin, /public void consumePurchase\(PluginCall call\)/);
  assert.match(billingPlugin, /billingClient\.consumeAsync/);
  assert.match(indexHtml, /apiUrl\("\/api\/shop\/google-play"\)/);
  assert.match(indexHtml, /billing\.consumePurchase\(\{ purchaseToken: purchase\.purchaseToken \}\)/);
  assert.match(indexHtml, /function findShopProduct\(productId\)/);
  assert.match(indexHtml, /products\.find\(\(id\) => Boolean\(findShopProduct\(id\)\)\)/);
  assert.doesNotMatch(indexHtml, /products\.find\(\(id\) => OBSIDIAN_PRODUCTS\.some/);
  assert.match(indexHtml, /syncPlayerSave\("save", \{ save: getLocalSavePayload\(\) \}\)/);
  assert.match(indexHtml, /if \(IS_ANDROID_APP\) \{\s*await purchaseGooglePlayObsidian\(productId\);\s*return;/);
});

test("native App API calls use Capacitor HTTP instead of WebView fetch", () => {
  const config = JSON.parse(capacitorConfig.replace(/^\uFEFF/, ""));
  assert.equal(config.plugins?.CapacitorHttp?.enabled, true);
  assert.match(indexHtml, /location\.hostname === "localhost" && Boolean\(window\.Capacitor\)/);
  assert.match(indexHtml, /function shopErrorMessage\(error/);
  assert.match(indexHtml, /failed to fetch\|network request failed\|network error\|load failed/i);
});

test("shop keeps payment diagnostics and recent orders out of the player interface", () => {
  assert.match(indexHtml, /shopNote\.hidden = true;/);
  assert.match(indexHtml, /shopSecurity\.hidden = true;/);
  assert.match(indexHtml, /shopOrders\.hidden = true;/);
  assert.match(indexHtml, /if \(!IS_NATIVE_APP && shopOrderHistory\.length > 0\)/);
});

test("shop includes the three new Obsidian packages", () => {
  for (const [id, amount, priceTwd] of [
    ["obsidian_1800", 1800, 350],
    ["obsidian_10000", 10000, 1500],
    ["obsidian_24000", 24000, 3000]
  ]) {
    assert.ok(
      indexHtml.includes(`id: "${id}", currencyType: "obsidian", amount: ${amount}`) &&
      indexHtml.includes(`priceTwd: "NT$${priceTwd.toLocaleString("en-US")}"`)
    );
    assert.match(commerce, new RegExp(`id: "${id}", currencyType: "obsidian", amount: ${amount}, priceTwd: ${priceTwd}`));
  }
});

test("Space Coin has five server-verified packages and its own persistent wallet", () => {
  for (const [id, amount, priceTwd] of [
    ["spacecoin_1000", 1000, 50],
    ["spacecoin_6000", 6000, 300],
    ["spacecoin_11000", 11000, 500],
    ["spacecoin_25000", 25000, 1000],
    ["spacecoin_80000", 80000, 3000]
  ]) {
    assert.match(commerce, new RegExp(`id: "${id}", currencyType: "spaceCoin", amount: ${amount}, priceTwd: ${priceTwd}`));
  }
  assert.match(indexHtml, /const SPACE_COIN_KEY = "spaceTowerSpaceCoins"/);
  assert.match(indexHtml, /spaceCoins:\s*Math\.max/);
  assert.match(commerce, /function getSpaceCoinWallet/);
  assert.match(commerce, /space_coin_wallet_ledger/);
  for (const language of ["zh", "en", "ja", "ko", "ru", "es"]) {
    assert.match(indexHtml, new RegExp(`${language}:\\s*"[^"]+"`));
  }
  const context = { window: {} };
  vm.runInNewContext(v2I18n, context);
  for (const language of ["zh", "en", "ja", "ko", "ru", "es"]) {
    assert.match(context.window.V2_I18N[language].backgroundStore.price, /10[,. ]?000/);
  }
  assert.match(indexHtml, /SHOP_UI_I18N\.ja\s*=/);
  assert.match(indexHtml, /SHOP_UI_I18N\.ko\s*=/);
  assert.match(indexHtml, /SHOP_UI_I18N\.ru\s*=/);
  assert.match(indexHtml, /SHOP_UI_I18N\.es\s*=/);
});

test("mobile cockpit uses the approved 1.5x scale without overlapping the upgrade drawer", () => {
  assert.match(v2Css, /body\.in-game \.hud[\s\S]*?grid-template-columns:\s*repeat\(5/);
  assert.match(v2Css, /body\.in-game \.upgrade-panel[\s\S]*?max-height:\s*min\(31dvh,\s*278px\)/);
  assert.match(v2Css, /body\.in-game \.upgrade-panel \.upgrade-card[\s\S]*?min-height:\s*54px/);
  for (const selector of [".game-actions", ".hud", ".speed-panel", ".battle-intel"]) {
    assert.match(v2Css, new RegExp(`body\\.in-game \\${selector}[\\s\\S]*?transform:\\s*scale\\(0\\.75\\)`));
  }
  assert.match(v2Css, /body\.in-game \.upgrade-panel \{[\s\S]*?left:\s*50%;[\s\S]*?scale\(0\.75\)/);
  assert.match(v2Css, /body\.in-game\.upgrade-drawer-open \.battle-intel,[\s\S]*?body\.in-game\.upgrade-drawer-open \.task-toast-stack[\s\S]*?bottom:\s*calc\(var\(--safe-bottom\) \+ min\(31dvh,\s*278px\) \+ 72px\)/);
});

test("mobile battle keeps general visuals compact while turrets and text use the approved 1.5x scale", () => {
  assert.match(indexHtml, /let battleVisualScale = 1;/);
  assert.match(indexHtml, /let turretVisualScale = 1;/);
  assert.match(indexHtml, /let textVisualScale = 1;/);
  assert.match(indexHtml, /battleVisualScale = width <= 760 \? 0\.5 : 1;/);
  assert.match(indexHtml, /turretVisualScale = battleVisualScale \* \(width <= 760 \? 1\.5 : 1\);/);
  assert.match(indexHtml, /textVisualScale = battleVisualScale \* \(width <= 760 \? 1\.5 : 1\);/);
  assert.match(indexHtml, /function drawTower\(\)[\s\S]*?ctx\.translate\(tower\.x, tower\.y\);\s*ctx\.scale\(turretVisualScale, turretVisualScale\);/);
  assert.match(indexHtml, /ctx\.scale\(kickScale \* battleVisualScale, kickScale \* battleVisualScale\);/);
  assert.match(indexHtml, /ctx\.translate\(bullet\.x, bullet\.y\);\s*ctx\.scale\(battleVisualScale, battleVisualScale\);/);
  assert.match(indexHtml, /shockwave\.r \* battleVisualScale/);
  assert.match(indexHtml, /34 \* textVisualScale/);
  assert.match(v2Features, /ctx\.translate\(position\.x, position\.y\);\s*ctx\.scale\(turretVisualScale, turretVisualScale\);/);
  assert.match(v2Features, /const visualRadius = v2BlackHole\.radius \* battleVisualScale;/);
  assert.match(v2Css, /body\.in-game \.task-toast-stack[\s\S]*?transform:\s*scale\(0\.75\)/);
  const rangeRing = indexHtml.match(/function drawRangeRing\(time\) \{[\s\S]*?\n    \}/)?.[0] || "";
  assert.doesNotMatch(rangeRing, /ctx\.scale\(battleVisualScale/);
  assert.match(rangeRing, /const range = getTowerRange\(\);/);
});

test("auto upgrade configuration persists, loops in order, and remains editable during a run", () => {
  assert.match(indexHtml, /id="homeAutoUpgradeConfig"/);
  assert.ok(indexHtml.indexOf('id="homeAutoUpgradeConfig"') > indexHtml.indexOf('id="upgradePanel"'), "auto-upgrade configuration must live inside the battle upgrade drawer");
  assert.match(indexHtml, /id="autoUpgradeRunEditor"/);
  assert.match(v2Features, /const AUTO_UPGRADE_KEY = "spaceTowerAutoUpgradeV1"/);
  assert.match(v2Features, /function runAutoUpgradeTick/);
  assert.match(v2Features, /autoUpgradeIndex = \(autoUpgradeIndex \+ 1\) % autoUpgradeConfig\.sequence\.length/);
  assert.match(v2Features, /autoUpgrade:\s*normalizeAutoUpgradeConfig\(autoUpgradeConfig\)/);
});

test("compact home uses a modal five-avatar commander picker and folded sign-in", () => {
  assert.match(indexHtml, /id="commanderAvatarButton"/);
  assert.match(indexHtml, /id="avatarPicker"[^>]*hidden/);
  assert.equal([...indexHtml.matchAll(/data-avatar="(?:orbit|nova|mecha|fox|dragon)"/g)].length, 5);
  assert.match(indexHtml, /id="pilotLoginToggle"[^>]*aria-expanded="false"/);
  assert.match(indexHtml, /commanderAvatar:\s*"orbit"/);
  assert.match(v2Features, /function setAvatarPicker\(open\)/);
  assert.match(indexHtml, /class="commander-identity"[\s\S]*?id="commanderProgress"/);
  assert.match(indexHtml, /id="homeStarterPackButton"/);
  assert.match(indexHtml, /id="homeRewardedSupplyButton"/);
  assert.match(v2Features, /homeRewardedSupplyButton\?\.addEventListener\("click", claimRewardedObsidian\)/);
});

test("auto upgrade exposes every base, tactical, and new in-run upgrade", () => {
  const expectedIds = [
    "attack", "magic", "speed", "hp", "regen", "critChance", "critDamage",
    "defenseRate", "physicalArmor", "magicArmor", "slowModule", "knockbackModule", "reflectModule",
    "mineRadius", "mineChance", "fighterCap", "waveGold", "goldMultiplier", "waveObsidian", "medkit",
    "barrageExpansion", "giantBloodline", "spellbladeTraining", "bloodCrit", "deepFreeze", "orbitA",
    "orbitB", "staticField", "demolitionExpert", "allIn", "energySaver", "curseAura"
  ];
  for (const id of expectedIds) assert.match(v2Features, new RegExp(`"${id}"`), `${id} must be available to auto upgrade`);
  assert.equal(expectedIds.length, 32);
  assert.match(v2Features, /if \(v2Def\) buyV2Upgrade\(id\);\s*else activeRunBaseBuyUpgrade\(id\);/);
});

test("turret workshop contains 20 main and 14 auxiliary turrets with eight drop grades, wishlist, and pity", () => {
  assert.equal([...v2Features.matchAll(/role:\s*"main"/g)].length, 20);
  assert.equal([...v2Features.matchAll(/role:\s*"auxiliary"/g)].length, 14);
  for (const [grade, chance] of [
    [1, "0.001333"],
    [2, "0.000941"],
    [3, "0.0007"],
    [4, "0.000565"],
    [5, "0.00037"],
    [6, "0.000281"],
    [7, "0.0001"],
    [8, "0.00004"]
  ]) {
    assert.match(v2Features, new RegExp(`${grade}: ${chance}`));
  }
  const dropFunction = v2Features.match(/function maybeDropTurretFragment\(enemy\) \{[\s\S]*?\n\}/)?.[0] || "";
  assert.match(v2Features, /const V2_FRAGMENT_PITY_TARGET = 120/);
  assert.match(v2Features, /const V2_WISHLIST_DROP_RATE = 0\.68/);
  assert.match(dropFunction, /chooseTurretFragmentForDrop\(guaranteed\)/);
  assert.match(dropFunction, /v2Progress\.fragmentPity >= V2_FRAGMENT_PITY_TARGET/);
  assert.doesNotMatch(dropFunction, /for \(const turret of V2_TURRET_DEFS\)/);
  assert.match(v2Features, /window\.getSpaceTowerTurretIds = \(\) => V2_TURRET_DEFS\.filter\(\(item\) => !item\.starterExclusive\)/);
  for (const id of ["capacitor_pulse", "royal_tide", "phase_echo"]) assert.match(v2Features, new RegExp(`id: "${id}"`));
});

test("turrets require 50 shards per star and gain five-star combat bonuses", () => {
  assert.match(v2Features, /const V2_FRAGMENT_TARGET = 50/);
  assert.match(v2Features, /const V2_TURRET_MAX_STARS = 5/);
  assert.match(v2Features, /Math\.max\(V2_FRAGMENT_TARGET, Math\.floor\(live\)\)/);
  assert.match(v2Features, /v2Progress\.stars\[id\] \+= 1/);
  assert.match(v2Features, /getV2TurretDamageMultiplier\(def\.id\)/);
  assert.match(v2Features, /getV2TurretRateMultiplier\(def\.id\)/);
  assert.match(v2Features, /getV2TurretEffectMultiplier\(def\.id\)/);
  assert.match(v2Features, /starDamagePerRank\) \|\| 0\.12/);
  assert.match(v2Features, /starRatePerRank\) \|\| 0\.05/);
  assert.match(v2Features, /starEffectPerRank\) \|\| 0\.08/);
  assert.match(v2Features, /getV2TurretStars\(id\) - 1\) \* perRank/);
});

test("each Tier provides one main slot and three auxiliary slots with clustered positions", () => {
  assert.match(v2Features, /function getMainSlotCap\(tier = activeRunTier\) \{\s*return clampTier\(tier\);/);
  assert.match(v2Features, /function getSupportSlotCap\(tier = activeRunTier\) \{\s*return clampTier\(tier\) \* 3;/);
  assert.match(v2Features, /const parentIndex = Math\.floor\(index \/ 3\) % parentCount;/);
  assert.match(v2Features, /const slot = index % 3;/);
});

test("turret equipment uses explicit counts and assembling does not silently change the loadout", () => {
  const buildFunction = v2Features.match(/function buildSupportTurret\(id\) \{[\s\S]*?\n\}/)?.[0] || "";
  assert.doesNotMatch(buildFunction, /v2Progress\.active/);
  assert.match(v2Features, /data-v2-equip-change/);
  assert.match(v2Features, /data-delta="-1"/);
  assert.match(v2Features, /data-delta="1"/);
  assert.match(v2Features, /\$\{escapeHtml\(ui\.equipped \|\| ui\.active\)\} \(\$\{equipped\}\)/);
  assert.match(v2Features, /function reconcileV2Equipment/);
  assert.match(v2Features, /const replacement = \[\.\.\.V2_TURRET_DEFS\]/);
  assert.match(v2Features, /v2Progress\.active\[replacement\.id\] -= 1/);
});

test("all 20 main turrets have distinct silhouettes and their advertised combat hooks", () => {
  const visualBlock = v2Features.match(/const V2_MAIN_TURRET_VISUALS = Object\.freeze\(\{([\s\S]*?)\}\);/)?.[1] || "";
  const profiles = [...visualBlock.matchAll(/^\s*([a-z0-9_]+):\s*"([a-z0-9_]+)"/gm)];
  assert.equal(profiles.length, 20);
  assert.equal(new Set(profiles.map((match) => match[1])).size, 20);
  assert.equal(new Set(profiles.map((match) => match[2])).size, 20);
  assert.match(v2Features, /function drawWorkshopMainTurret/);
  assert.match(v2Features, /drawTower = function \(\) \{\s*v2BaseDrawTower\(\);\s*drawWorkshopMainTurrets\(\);/);
  for (const visual of profiles.map((match) => match[2])) {
    assert.match(v2Features, new RegExp(`visual === "${visual}"`), visual);
  }
  assert.match(v2Features, /v2Homing: source === "main-workshop" && Boolean\(def\.homing\)/);
  assert.match(v2Features, /v2SplitPending: source === "main-workshop" && Boolean\(def\.split\)/);
  assert.match(v2Features, /if \(bullet\.v2Pulse\)/);
  assert.match(v2Features, /if \(bullet\.v2Void\)/);
  assert.match(v2Features, /const fullHpRate = def\.fullHpRate/);
  assert.match(v2Features, /main\.muzzleFlash = 1/);
  assert.match(v2Features, /main\.recoil = 1/);
  assert.match(v2Features, /id: "capacitor_pulse"[\s\S]{0,260}strengthGrade: 1[\s\S]{0,260}capacitorEvery: 5[\s\S]{0,120}capacitorBonus: 0\.6/);
  assert.match(v2Features, /id: "royal_tide"[\s\S]{0,260}strengthGrade: 3[\s\S]{0,260}color: "#1f5cff"[\s\S]{0,300}tideEvery: 4/);
  assert.match(v2Features, /id: "phase_echo"[\s\S]{0,260}strengthGrade: 4[\s\S]{0,260}phaseEcho: 0\.45/);
  assert.match(v2Features, /if \(bullet\.v2CapacitorBurst\)/);
  assert.match(v2Features, /if \(bullet\.v2RoyalTideDamage\)/);
  assert.match(v2Features, /if \(bullet\.v2PhaseEcho\)/);
  assert.match(v2Features, /v2BurnPower: def\.burn \? starEffect : 0/);
  assert.match(v2Features, /0\.05 \* getV2TurretEffectMultiplier\(item\.kind\)/);
  assert.match(v2Features, /0\.005 \* getV2TurretEffectMultiplier\(item\.kind\)/);
});

test("ultimate system has 26 five-star abilities, a 300-second cooldown, and the requested grade chances", () => {
  const prefix = ultimateSystem.slice(0, ultimateSystem.indexOf("function getUltimateLanguagePack"));
  const context = {};
  vm.runInNewContext(`${prefix}; this.payload = { defs: ULTIMATE_DEFS, text: ULTIMATE_TEXT, drops: ULTIMATE_GRADE_DROP };`, context);
  assert.equal(context.payload.defs.length, 26);
  assert.equal(new Set(context.payload.defs.map((item) => item.id)).size, 26);
  assert.deepEqual(
    { ...context.payload.drops },
    { A: 0.0002, B: 0.0003, C: 0.0005, D: 0.0007, E: 0.001, F: 0.01 }
  );
  for (const language of ["zh", "en", "ja", "ko", "ru", "es"]) {
    assert.equal(context.payload.text[language].items.length, 26, `${language} ultimate item count`);
    assert.ok(context.payload.text[language].items.every(([name, description]) => name && description), `${language} complete ultimate strings`);
  }
  assert.match(ultimateSystem, /const ULTIMATE_MAX_STARS = 5/);
  assert.match(ultimateSystem, /const ULTIMATE_FRAGMENT_TARGET = 50/);
  assert.match(ultimateSystem, /const ULTIMATE_COOLDOWN_SECONDS = 300/);
  assert.match(ultimateSystem, /"ABCDEF"\.indexOf\(left\.grade\) - "ABCDEF"\.indexOf\(right\.grade\)/);
  assert.match(ultimateSystem, /ultimateRuntime\.cooldownRemaining = getUltimateCooldownSeconds\(\)/);
  assert.match(ultimateSystem, /ultimateTrigger\.addEventListener\("click", activateEquippedUltimate\)/);
  assert.doesNotMatch(ultimateSystem.match(/function updateUltimateRuntime\(dt\) \{[\s\S]*?\n\}/)?.[0] || "", /executeUltimate\(/);
  assert.doesNotMatch(ultimateSystem, /id: "emergency_blueprint"[\s\S]{0,160}passive: true/);
  assert.match(ultimateSystem, /case "emergency_blueprint":\s*ultimateRuntime\.blueprintArmed = true/);
  assert.match(indexHtml, /SPACE_TOWER_RUNTIME_BALANCE/);
  assert.match(indexHtml, /const BASIC_ENEMY = \{[\s\S]*?speed: 20,/);
  assert.match(balanceApi, /enemyBase: \{ \.\.\.\(storedConfig\.enemyBase \|\| \{\}\), speed: 20 \}/);
  assert.match(indexHtml, /unlockWave: 1500, hpGrowth: 1\.6, speedGrowth: 1\.1/);
  assert.match(balanceApi, /unlockWave: 1500/);
  assert.match(v2Features, /getV2FragmentChance\(turret\.strengthGrade\)/);
  assert.match(ultimateSystem, /getUltimateCooldownSeconds\(\)/);
  assert.match(ultimateSystem, /getUltimateGradeDrop\(definition\.grade\)/);
  assert.match(balanceApi, /value\.ultimate && value\.ultimate\.gradeDropChance/);
  assert.match(indexHtml, /ultimate-system\.js\?v=2\.9\.24/);
  assert.doesNotMatch(ultimateSystem, /ultimate-grade-rates|dropRule/);
  assert.doesNotMatch(ultimateSystem, /65%|65 %|fragment-pity-line/);
  assert.match(ultimateCss, /\.ultimate-trigger/);
});

test("ultimate shards use one candidate per kill, wishlist pity, and card packs", () => {
  const dropFunction = ultimateSystem.match(/function maybeDropUltimateFragment\(enemy\) \{[\s\S]*?\n\}/)?.[0] || "";
  assert.match(ultimateSystem, /const ULTIMATE_FRAGMENT_PITY_TARGET = 180/);
  assert.match(ultimateSystem, /const ULTIMATE_WISHLIST_DROP_RATE = 0\.65/);
  assert.match(dropFunction, /ultimateProgress\.fragmentPity >= ULTIMATE_FRAGMENT_PITY_TARGET/);
  assert.match(dropFunction, /ultimateProgress\.fragmentWishlist/);
  assert.match(dropFunction, /getUltimateGradeDrop\(definition\.grade\)/);
  assert.match(ultimateSystem, /function grantUltimateCardPack\(\)/);
  assert.match(ultimateSystem, /ultimateBaseChooseCard\(cardId\);[\s\S]*?grantUltimateCardPack\(\)/);
  assert.match(ultimateSystem, /emergency_blueprint/);
  assert.match(ultimateSystem, /getEquippedUltimate\(\)\?\.id === "emergency_blueprint" && ultimateRuntime\.blueprintArmed/);
  assert.match(ultimateSystem, /ultimateRuntime\.blueprintArmed = false/);
});

test("engagement update connects onboarding, synergies, layered tasks, and opt-in ad rewards", () => {
  assert.match(indexHtml, /const FIRST_DEPLOYMENT_KEY = "spaceTowerFirstDeploymentV1"/);
  assert.match(indexHtml, /completeFirstDeploymentStep\(1\)/);
  assert.match(indexHtml, /grantV2FirstDeploymentFragment/);
  assert.match(indexHtml, /const SYNERGY_IDS = \["assault", "arcane", "control", "fleet", "fortress", "prosperity"\]/);
  assert.match(v2Features, /window\.getV2SynergyCounts/);
  assert.match(indexHtml, /weekly_kills_3000/);
  assert.match(indexHtml, /weekly_boss_20/);
  assert.match(indexHtml, /weekly_wave_300/);
  assert.match(v2Features, /result_double:/);
  assert.match(v2Features, /card_reroll:/);
  assert.match(indexHtml, /requestRewardedAd\("result_double"\)/);
  assert.match(indexHtml, /requestRewardedAd\("card_reroll"\)/);
  assert.match(v2Features, /window\.showRewardedAd = showOptInRewardedAd/);
  assert.match(engagementCss, /\.fragment-wishlist-panel/);
});

test("Firebase Analytics and Crashlytics are wired through Capacitor and native Gradle", () => {
  const pkg = JSON.parse(packageJson);
  assert.equal(pkg.version, "2.9.24");
  assert.ok(pkg.dependencies["@capacitor-firebase/analytics"]);
  assert.ok(pkg.dependencies["@capacitor-firebase/crashlytics"]);
  assert.match(telemetrySystem, /FirebaseAnalytics/);
  assert.match(telemetrySystem, /FirebaseCrashlytics/);
  assert.match(telemetrySystem, /space-tower-analytics/);
  assert.match(androidRootGradle, /firebase-crashlytics-gradle:3\.0\.7/);
  assert.match(androidGradle, /com\.google\.firebase\.crashlytics/);
});

test("ultimate combat hooks cover damage, currencies, control, cooldown persistence, and one equipped slot", () => {
  for (const id of [
    "core_self_destruct", "black_hole_detonation", "coin_railgun", "barrage_reversal", "allegiance_swap",
    "satellite_judgment", "system_reboot", "absolute_defense", "nano_first_aid", "shield_overload",
    "death_mark", "global_emp", "phase_shelter", "overclock_a", "overclock_b", "giant_barrage",
    "blood_rage", "energy_devourer", "frozen_world", "execution_aura", "judgment_chain",
    "golden_touch", "emergency_blueprint", "bounty_order", "space_exploration", "divine_sanctuary"
  ]) {
    assert.match(ultimateSystem, new RegExp(`case "${id}"|id: "${id}"`), id);
  }
  assert.match(ultimateSystem, /equipped:\s*""/);
  assert.match(ultimateSystem, /ultimateProgress\.equipped = definition\.id/);
  assert.match(ultimateSystem, /checkpoint\.ultimateRuntime = normalizeUltimateRuntime/);
  assert.match(ultimateSystem, /applyCoreDamage = function/);
  assert.match(indexHtml, /applyCoreDamage\(damage, coreHit\.x, coreHit\.y/);
});

test("ten premium backgrounds cost 10000 Space Coins and grant the shared 1.02 battle reward multiplier", () => {
  assert.match(v2Features, /const V2_BACKGROUND_PRICE = 10000;/);
  assert.match(v2Features, /const V2_BACKGROUND_REWARD_MULTIPLIER = 1\.02;/);
  const backgroundIds = [
    "gilded_citadel", "obsidian_singularity", "aurora_garden",
    "crimson_event_horizon", "emerald_machine_world", "glacial_star_cathedral",
    "solar_forge_throne", "neon_orbit_metropolis", "astral_ruins_sanctum", "prismatic_wormhole"
  ];
  for (const id of backgroundIds) {
    assert.match(v2Features, new RegExp(`\\{ id: "${id}", asset:`), id);
    assert.match(indexHtml, new RegExp(`"${id}"`), `${id} must survive shop-state normalization`);
  }
  assert.equal([...v2Features.matchAll(/\{ id: "[^"]+", asset: "assets\/backgrounds\//g)].length, 10);
  assert.match(indexHtml, /backgroundStore:\s*\{\s*owned:\s*ownedBackgrounds,\s*equipped:\s*equippedBackground/);
  assert.match(v2Features, /applyV2BackgroundRewardBonus\(gold - goldBefore, obsidian - obsidianBefore\)/);
});

test("all workshop and expansion strings exist in all six languages", () => {
  const context = { window: {} };
  vm.runInNewContext(v2I18n, context);
  const turretIds = [...v2Features.matchAll(/\{ id:\s*"([^"]+)", role:\s*"(?:main|auxiliary)"/g)].map((match) => match[1]);
  const expansionUpgradeIds = [
    "barrageExpansion", "giantBloodline", "spellbladeTraining", "bloodCrit", "deepFreeze", "orbitA",
    "orbitB", "staticField", "demolitionExpert", "allIn", "energySaver", "curseAura"
  ];
  const autoUpgradeIds = [
    "attack", "magic", "speed", "hp", "regen", "critChance", "critDamage",
    "defenseRate", "physicalArmor", "magicArmor", "slowModule", "knockbackModule", "reflectModule",
    "mineRadius", "mineChance", "fighterCap", "waveGold", "goldMultiplier", "waveObsidian", "medkit",
    "barrageExpansion", "giantBloodline", "spellbladeTraining", "bloodCrit", "deepFreeze", "orbitA",
    "orbitB", "staticField", "demolitionExpert", "allIn", "energySaver", "curseAura"
  ];
  const backgroundIds = [
    "gilded_citadel", "obsidian_singularity", "aurora_garden",
    "crimson_event_horizon", "emerald_machine_world", "glacial_star_cathedral",
    "solar_forge_throne", "neon_orbit_metropolis", "astral_ruins_sanctum", "prismatic_wormhole"
  ];
  assert.equal(turretIds.length, 34);
  for (const language of ["zh", "en", "ja", "ko", "ru", "es"]) {
    const pack = context.window.V2_I18N[language];
    assert.equal(pack.ui.workshopTab.length > 0, true);
    assert.equal(pack.ui.locked.length > 0, true, `${language}.ui.locked`);
    assert.equal(pack.ui.mainSlots.length > 0, true);
    assert.equal(Array.isArray(pack.enemies.basic), true, `${language}.enemies.basic`);
    assert.equal(Array.isArray(pack.cards.fighter), true, `${language}.cards.fighter`);
    assert.equal(pack.controls.settings.length > 0, true, `${language}.controls.settings`);
    assert.equal(pack.controls.pause.length > 0, true, `${language}.controls.pause`);
    assert.equal(pack.controls.home.length > 0, true, `${language}.controls.home`);
    assert.equal(pack.home.heroSubtitle.length > 0, true, `${language}.home.heroSubtitle`);
    assert.equal(pack.policy.length > 0, true, `${language}.policy`);
    assert.equal(pack.rewardedAds.watchSupply.length > 0, true, `${language}.rewardedAds.watchSupply`);
    for (const id of autoUpgradeIds) assert.equal(pack.autoUpgrade.labels[id].length > 0, true, `${language}.autoUpgrade.${id}`);
    for (const id of backgroundIds) assert.equal(Array.isArray(pack.backgroundStore.items[id]), true, `${language}.backgroundStore.${id}`);
    for (const id of turretIds) assert.equal(Array.isArray(pack.turrets[id]), true, `${language}.${id}`);
    for (const id of expansionUpgradeIds) {
      assert.equal(Array.isArray(pack.upgrades[id]), true, `${language}.upgrades.${id}`);
      assert.equal(Array.isArray(pack.meta[id]), true, `${language}.meta.${id}`);
    }
  }
});

test("v2 UI reads auto-upgrades and battle controls from the centralized six-language bundle", () => {
  assert.doesNotMatch(v2Features, /const AUTO_UPGRADE_I18N/);
  assert.match(v2Features, /return getV2LanguagePack\(\)\?\.autoUpgrade/);
  assert.match(v2Features, /const labels = getAutoUpgradeText\(\)\.labels/);
  assert.match(v2Features, /settingsButton\.textContent = controls\.settings/);
  assert.match(v2Features, /pauseButton\.textContent = isPaused \? controls\.resume : controls\.pause/);
  assert.match(v2Features, /homeButton\.textContent = controls\.home/);
});

test("all feature modules follow one persisted global language event in the Android app", () => {
  assert.match(indexHtml, /function setSpaceTowerLanguage\(language, persist = true\)/);
  assert.match(indexHtml, /window\.dispatchEvent\(new CustomEvent\("space-tower-language-changed"/);
  assert.match(indexHtml, /window\.refreshSpaceTowerV2Language\?\.\(\)/);
  assert.match(indexHtml, /window\.reconcileSpaceTowerLanguage = reconcileSpaceTowerLanguage/);
  assert.match(indexHtml, /window\.addEventListener\("pageshow", reconcile\)/);
  assert.match(indexHtml, /appStateChange/);
  assert.match(v2Features, /window\.refreshSpaceTowerV2Language = refreshV2LocalizedUi/);
  assert.match(ultimateSystem, /window\.addEventListener\("space-tower-language-changed", refreshUltimateLanguage\)/);
  assert.doesNotMatch(ultimateSystem, /\blanguageSelect\b|\bsettingsLanguage\b/);
  assert.doesNotMatch(v2Features, /v2BaseApplyLanguage/);
  assert.doesNotMatch(ultimateSystem, /ultimateBaseApplyLanguage/);
  const expectedAssetRevisions = {
    "v2-i18n.js": "2.9.24",
    "v2-features.js": "2.9.24",
    "ultimate-system.js": "2.9.24",
    "telemetry-system.js": "2.9.24",
  };
  for (const [asset, revision] of Object.entries(expectedAssetRevisions)) {
    assert.match(indexHtml, new RegExp(`${asset.replace(".", "\\.")}\\?v=${revision.replaceAll(".", "\\.")}`));
  }
});

test("home and settings use WebView-safe six-language buttons with no native language select", () => {
  assert.match(indexHtml, /id="languagePicker"[^>]*role="group"/);
  assert.match(indexHtml, /id="settingsLanguage"[^>]*role="group"/);
  assert.doesNotMatch(indexHtml, /<select[^>]+id="languageSelect"/);
  assert.doesNotMatch(indexHtml, /<select[^>]+id="settingsLanguage"/);
  assert.doesNotMatch(indexHtml, /language-native-control|languagePickerButton|languagePickerMenu|role="listbox"/);
  assert.doesNotMatch(v2Features, /languageSelect|initializeHomeLanguagePicker|language-picker-ready/);
  assert.doesNotMatch(v2Css, /language-native-control|language-picker-trigger|language-picker-menu|language-picker-ready/);
  for (const language of ["zh", "en", "ja", "ko", "ru", "es"]) {
    const controls = indexHtml.match(new RegExp(`data-language-choice="${language}"`, "g")) || [];
    assert.equal(controls.length, 2, `${language} must exist once on Home and once in Settings`);
  }
  assert.match(indexHtml, /function syncLanguageButtonControls\(language\)/);
  assert.match(indexHtml, /button\.addEventListener\("click", \(\) => setSpaceTowerLanguage\(button\.dataset\.languageChoice\)\)/);
  assert.match(indexHtml, /button\.setAttribute\("aria-pressed", String\(active\)\)/);
  assert.match(v2Css, /\.language-button-grid,\s*\.settings-language-grid\s*\{[\s\S]*?grid-template-columns:\s*repeat\(3,/);
  assert.match(v2Css, /background-image:\s*none !important/);
  assert.match(v2Css, /\.home-page-tabs\s*\{\s*position:\s*static !important;/);
});

test("one six-language shell bundle owns every home navigation label", () => {
  assert.match(v2Features, /homePlayTab\.textContent = ui\.playTab/);
  assert.match(v2Features, /homeTasksTab\.textContent = ui\.tasksTab/);
  for (const key of ["playTab", "tasksTab", "codexTab", "workshopTab", "storeTab"]) {
    assert.equal((v2I18n.match(new RegExp(`${key}:`, "g")) || []).length >= 6, true, `${key} must cover six languages`);
  }
});

test("home quick actions keep the compact command layout", () => {
  assert.match(indexHtml, /<div class="home-menu">\s*<button class="shop-cta" id="shopOpenButton"/);
  assert.match(v2Css, /\.home-menu #shopOpenButton\s*\{[\s\S]*?rgba\(113, 45, 172/);
  assert.match(v2Features, /card\.dataset\.lockedLabel = ui\.locked/);
  assert.match(v2Css, /content:\s*attr\(data-locked-label\)/);
  assert.match(v2Css, /\.home-menu\s*\{\s*grid-template-columns:\s*repeat\(3,/);
  assert.match(v2Css, /\.home-menu > button\s*\{\s*grid-column:\s*auto !important;/);
});

test("rewarded ads keep their limits while permanent ad-free adds direct claims and capped post-run ads", () => {
  const pkg = JSON.parse(packageJson);
  assert.equal(pkg.dependencies["@capacitor-community/admob"], "^8.0.0");
  assert.match(androidManifest, /com\.google\.android\.gms\.ads\.APPLICATION_ID/);
  assert.match(androidStrings, /ca-app-pub-4461762858602817~8934265392/);
  assert.match(v2Features, /ca-app-pub-4461762858602817\/9681205002/);
  assert.match(v2Features, /ca-app-pub-4461762858602817\/5964221194/);
  assert.match(v2Features, /const REWARDED_OBSIDIAN_AMOUNT = 5;/);
  assert.match(indexHtml, /const REWARDED_SUPPLY_DAILY_LIMIT = 5;/);
  assert.match(indexHtml, /rewardedSupplyClaims/);
  assert.match(v2Features, /rewardedSupplyButton\.disabled = rewardedAdBusy \|\| !supplyState\.unlocked \|\| supplyState\.remaining <= 0/);
  assert.match(v2Features, /text\.dailyRemaining/);
  assert.equal((v2I18n.match(/unlimited:/g) || []).length, 6);
  assert.match(v2I18n, /up to 5 times daily/);
  assert.match(v2I18n, /ウェーブ10到達後に解放/);
  assert.match(v2I18n, /하루 최대 5회/);
  assert.match(v2Features, /const REWARDED_REVIVE_OBSIDIAN_COST = 30;/);
  assert.match(v2Features, /const REWARDED_REVIVE_MIN_WAVE = 10;/);
  assert.match(v2Features, /rewardedReviveUsed = true;/);
  assert.match(v2Features, /prepareRewardVideoAd/);
  assert.match(v2Features, /showRewardVideoAd/);
  assert.match(v2Features, /requestConsentInfo/);
  assert.match(v2Features, /showConsentForm/);
  assert.match(v2Features, /showPrivacyOptionsForm/);
  assert.match(v2Features, /privacyOptionsRequirementStatus === "REQUIRED"/);
  assert.match(v2Features, /return !nativeApp && \(/);
  assert.match(v2Features, /getSpaceTowerRewardedAdStatus/);
  assert.match(indexHtml, /id="settingsPrivacyButton"/);
  assert.match(indexHtml, /space-tower-privacy-options-status/);
  assert.match(v2Features, /POST_RUN_INTERSTITIAL_FIRST_RUN = 2/);
  assert.match(v2Features, /POST_RUN_INTERSTITIAL_INTERVAL = 3/);
  assert.match(v2Features, /POST_RUN_INTERSTITIAL_COOLDOWN_MS = 10 \* 60 \* 1000/);
  assert.match(v2Features, /hasSpaceTowerNoAds/);
  assert.match(v2Features, /showInterstitial/);
  assert.match(v2Features, /prepareInterstitial/);
  assert.match(indexHtml, /id="rewardedSupplyButton"/);
  assert.match(indexHtml, /id="rewardedReviveAdButton"/);
});

test("all rewarded placements use one safe bridge and release-channel-specific AdMob IDs", async () => {
  const bridgeSource = indexHtml.match(/async function requestRewardedAd\(placement\) \{[\s\S]*?\n    \}/)?.[0] || "";
  const bridgeContext = { window: {} };
  vm.runInNewContext(`${bridgeSource}; this.requestRewardedAd = requestRewardedAd;`, bridgeContext);
  assert.equal(await bridgeContext.requestRewardedAd("result_double"), false);
  bridgeContext.window.showRewardedAd = async (placement) => placement === "card_reroll";
  assert.equal(await bridgeContext.requestRewardedAd("card_reroll"), true);

  const modeSource = v2Features.match(/function getRewardedAdMode\(\) \{[\s\S]*?\n\}/)?.[0] || "";
  const modeContext = { window: { SPACE_TOWER_AD_CONFIG: { mode: "test" } } };
  vm.runInNewContext(`${modeSource}; this.getRewardedAdMode = getRewardedAdMode;`, modeContext);
  assert.equal(modeContext.getRewardedAdMode(), "test");
  modeContext.window.SPACE_TOWER_AD_CONFIG.mode = "production";
  assert.equal(modeContext.getRewardedAdMode(), "production");

  const previewSource = v2Features.match(/function shouldUseRewardedAdPreview\([\s\S]*?\n\}/)?.[0] || "";
  const previewContext = {};
  vm.runInNewContext(`${previewSource}; this.shouldUseRewardedAdPreview = shouldUseRewardedAdPreview;`, previewContext);
  assert.equal(previewContext.shouldUseRewardedAdPreview(true, false, "https:", "localhost"), false);
  assert.equal(previewContext.shouldUseRewardedAdPreview(false, false, "http:", "localhost"), true);
  assert.equal(previewContext.shouldUseRewardedAdPreview(false, false, "https:", "space-tower-defense.pages.dev"), false);

  assert.match(indexHtml, /src="admob-config\.js\?v=2\.9\.24"/);
  assert.match(admobDefault, /mode:\s*"test"/);
  assert.match(admobClosedTest, /mode:\s*"test"/);
  assert.match(admobProduction, /mode:\s*"production"/);
  assert.match(admobProduction, /interstitialUnitId:\s*"ca-app-pub-4461762858602817\/9198662696"/);
  assert.match(androidBuildScript, /\[ValidateSet\("closed-test", "production"\)\]/);
  assert.match(androidBuildScript, /release\\admob\.\$Channel\.js/);
  assert.match(v2Features, /const adId = isTesting \? GOOGLE_REWARDED_TEST_UNIT_ID : getConfiguredRewardedUnitId\(placement\)/);
});

test("v2 language switches restore immutable baseline text before applying a new pack", () => {
  assert.match(v2Features, /const V2_DEFINITION_BASELINE/);
  assert.match(v2Features, /V2_DEFINITION_BASELINE\.turrets\.get/);
  assert.match(v2Features, /V2_DEFINITION_BASELINE\.meta\.get/);
});

test("launch mailbox grants the specified first-login, wave, boss, and D2-D7 Obsidian rewards", () => {
  for (const [id, amount] of [
    ["first_login", 80], ["wave_5", 3], ["wave_10", 5], ["wave_20", 6],
    ["wave_30", 8], ["wave_40", 10], ["wave_50", 15], ["wave_60", 10],
    ["wave_70", 12], ["wave_75", 15], ["wave_80", 10], ["wave_90", 16],
    ["boss_100", 30], ["login_d2", 10], ["login_d3", 12], ["login_d4", 15],
    ["login_d5", 18], ["login_d6", 22], ["login_d7", 30]
  ]) {
    assert.match(indexHtml, new RegExp(`id: "${id}"[^\\n]+amount: ${amount}`), `${id} reward amount`);
  }
  assert.match(indexHtml, /id: "first_login"[^\n]+adDouble: false/);
  assert.equal([...indexHtml.matchAll(/kind: "(?:wave|boss|login)"[^\n]+adDouble: true/g)].length, 18);
  assert.match(indexHtml, /requestRewardedAd\("launch_reward_double"/);
  assert.match(indexHtml, /if \(wave === 100 && enemy\.bossRank === "destroyer_boss"\) unlockLaunchReward\("boss_100"/);
  assert.match(indexHtml, /recordLaunchRewardLogin\(\);\s*recordDailyProgress\("login", 1, "set"\)/);
  assert.match(indexHtml, /launchRewards:/);
});

test("daily and weekly rewards use the tier-scaled sustainable economy", () => {
  assert.match(indexHtml, /let DAILY_TASK_BONUS_REWARD = 6/);
  for (const [id, reward] of [["daily_login", 2], ["daily_kills_100", 3], ["daily_upgrades_8", 4], ["daily_boss_1", 5]]) {
    assert.match(indexHtml, new RegExp(`id: "${id}"[^\\n]+reward: ${reward}`));
  }
  for (const [id, reward] of [["weekly_kills_3000", 10], ["weekly_boss_20", 15], ["weekly_wave_300", 20]]) {
    assert.match(indexHtml, new RegExp(`id: "${id}"[^\\n]+reward: ${reward}`));
  }
  assert.match(indexHtml, /Math\.min\(3, 1 \+ Math\.max\(0, unlockedTier - 1\) \* 0\.1\)/);
  assert.match(indexHtml, /Math\.max\(1, Math\.round\(Math\.max\(0, Number\(baseReward\) \|\| 0\) \* getEngagementTierMultiplier\(\)\)\)/);
  assert.match(indexHtml, /Math\.floor\(\(end - start\) \* 0\.04\)/);
  assert.match(indexHtml, /milestone % 500 === 0 \? 25 : milestone % 100 === 0 \? 6 : 1/);
});

test("permanent upgrade costs use the smoothed curve and Orbit controllers unlock once at Tier 3", () => {
  assert.match(indexHtml, /const linear = level \* \(curve\.costLinearBase \+ def\.baseCost \* curve\.costBaseLinearRate\)/);
  assert.match(indexHtml, /const softCurve = Math\.pow\(level, curve\.costSoftPower\)/);
  assert.match(indexHtml, /applyOfficialProgression\(config\)/);
  assert.match(indexHtml, /if \(!def \|\| isMetaUpgradeLocked\(def\) \|\| isMetaUpgradeMaxed\(def\)\) return/);
  assert.match(v2Features, /id: "orbitA"[^\n]+maxLevel: 1, unlockTier: 3/);
  assert.match(v2Features, /id: "orbitB"[^\n]+maxLevel: 1, unlockTier: 3/);
});

test("wave 100 destroyer retains base damage caps before the explicit Boss attack multipliers", () => {
  assert.match(indexHtml, /destroyer:\s*\{[\s\S]*?hpScale:\s*1200/);
  assert.match(indexHtml, /destroyer:\s*\{[\s\S]*?physicalDefenseBonus:\s*14/);
  assert.match(indexHtml, /contactMaxHpRatio:\s*0\.35/);
  assert.match(indexHtml, /beamHpRatio:\s*0\.035/);
  assert.match(indexHtml, /beamMaxHpRatio:\s*0\.08/);
  assert.match(indexHtml, /enemy\.beamTimer = rand\(6\.5, 9\.0\)/);
  assert.match(indexHtml, /const damage = Math\.min\(rawDamage, damageCap\)/);
  assert.match(indexHtml, /const isDestroyer = bossType\.name === "destroyer_boss"/);
  assert.match(indexHtml, /const hpScale = bossType\.hpScale/);
  assert.match(indexHtml, /hpLinear: Math\.min\(5/);
});
