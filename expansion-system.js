/* Space Tower Defense 2.9 expansion: tiers, stores, music, consumables and analytics. */

const EXPANSION_SAVE_KEY = "spaceTowerExpansionV1";
const SPEED_LICENSE_COSTS = Object.freeze({ 4: 2000, 5: 3000, 10: 5000 });
const CLOSED_TEST_LAUNCH_PROMO_ACTIVE = false;
const FUSION_STONE_PRICE = 1000;
const MUSIC_TRACK_PRICE = 8000;
const CONSUMABLE_IDS = Object.freeze([
  "reviveTicket", "obsidianDoubleVoucher", "skipWaveVoucher", "freeUpgradeVoucher",
  "goldDoubleVoucher", "bossSealVoucher", "stageProtectionVoucher"
]);
const UTILITY_AD_DAILY_LIMIT = 3;
const UTILITY_OBSIDIAN_OFFERS = Object.freeze({
  reviveTicket: Object.freeze({ price: 30, weeklyLimit: 3 }),
  obsidianDoubleVoucher: Object.freeze({ price: 0, weeklyLimit: 0, rewardOnly: true }),
  skipWaveVoucher: Object.freeze({ price: 15, weeklyLimit: 5 }),
  freeUpgradeVoucher: Object.freeze({ price: 15, weeklyLimit: 5 }),
  goldDoubleVoucher: Object.freeze({ price: 40, weeklyLimit: 2 }),
  bossSealVoucher: Object.freeze({ price: 50, weeklyLimit: 1 }),
  stageProtectionVoucher: Object.freeze({ price: 40, weeklyLimit: 2 })
});
const ORIGINAL_MUSIC_CATALOG = Object.freeze([
  ["sunset_orbit", "Sunset Orbit", "日落軌道", "sunset-orbit.ogg"],
  ["foundation_pulse", "Foundation Pulse", "基石脈衝", "foundation-pulse.ogg"],
  ["ion_islands", "Ion Islands", "離子群島", "ion-islands.ogg"],
  ["moving_starward", "Moving Starward", "向星而行", "moving-starward.ogg"],
  ["fortaleza_nebula", "Fortaleza Nebula", "星雲堡壘", "fortaleza-nebula.ogg"],
  ["neon_affinity", "Neon Affinity", "霓虹引力", "neon-affinity.ogg"],
  ["past_the_nebula", "Past the Nebula", "越過星雲", "past-the-nebula.ogg"],
  ["slow_comet_highway", "Slow Comet Highway", "慢速彗星公路", "slow-comet-highway.ogg"],
  ["horizon_signal", "Horizon Signal", "地平線訊號", "horizon-signal.ogg"],
  ["pan_orbit_drive", "Pan-Orbit Drive", "全軌道驅動", "pan-orbit-drive.ogg"],
  ["blizzard_relay", "Blizzard Relay", "暴雪中繼站", "blizzard-relay.ogg"],
  ["homeward_signal", "Homeward Signal", "歸航訊號", "homeward-signal.ogg"],
  ["sunday_starway", "Sunday Starway", "週日星路", "sunday-starway.ogg"],
  ["happy_day", "Happy Day", "快樂日", "happy-day.ogg"],
  ["water_pop", "Water Pop", "水漾泡泡", "water-pop.ogg"],
  ["earth_wonder", "Earth Wonder", "地球奇境", "earth-wonder.ogg"],
  ["rock", "Rock", "搖滾", "rock.ogg"],
  ["dark", "Dark", "暗黑", "dark.ogg"],
  ["emotional_japan", "Emotional Japan", "日本情懷", "emotional-japan.ogg"],
  ["happy_life", "Happy Life", "幸福生活", "happy-life.ogg"],
  ["bright", "Bright", "光明", "bright.ogg"],
  ["anime", "Anime", "動漫", "anime.ogg"],
  ["tension", "Tension", "緊張", "tension.ogg"]
].map(([id, name, zhName, file]) => Object.freeze({ id, name, zhName, asset: `assets/music/${file}` })));

const EXPANSION_PACKS = Object.freeze({
  normal: {
    id: "normal", name: "星隕補給艙", currency: "obsidian", oneCost: 200, tenCost: 1800,
    rewards: [
      ["turret_core", 10, "砲塔專屬晶核", "turretCore", 1],
      ["obsidian_100000", 5, "20,000 黑曜石", "obsidian", 20000],
      ["obsidian_50000", 8, "10,000 黑曜石", "obsidian", 10000],
      ["obsidian_10000", 5, "4,000 黑曜石", "obsidian", 4000],
      ["obsidian_5000", 10, "2,000 黑曜石", "obsidian", 2000],
      ["obsidian_2000", 20, "1,000 黑曜石", "obsidian", 1000],
      ["obsidian_1000", 50, "500 黑曜石", "obsidian", 500],
      ["obsidian_500", 100, "300 黑曜石", "obsidian", 300],
      ["obsidian_200", 200, "200 黑曜石", "obsidian", 200],
      ["obsidian_100", 500, "100 黑曜石", "obsidian", 100],
      ["space_coin_10", 100, "10 太空幣", "spaceCoins", 10],
      ["space_coin_3", 400, "3 太空幣", "spaceCoins", 3],
      ["turret_shard_20", 30, "隨機砲塔碎片 ×20", "turretFragments", 20],
      ["turret_shard_10", 60, "隨機砲塔碎片 ×10", "turretFragments", 10],
      ["turret_shard_5", 120, "隨機砲塔碎片 ×5", "turretFragments", 5],
      ["turret_shard_2", 290, "隨機砲塔碎片 ×2", "turretFragments", 2],
      ["ultimate_shard_3", 200, "隨機絕招碎片 ×3", "ultimateFragments", 3],
      ["ultimate_shard_1", 1400, "隨機絕招碎片 ×1", "ultimateFragments", 1],
      ["turret_shard_8", 82, "隨機砲塔碎片 ×8", "turretFragments", 8],
      ["obsidian_20", 3000, "40 黑曜石", "obsidian", 40],
      ["obsidian_50", 1000, "80 黑曜石", "obsidian", 80],
      ["obsidian_1", 400, "25 黑曜石", "obsidian", 25],
      ["space_coin_19000", 10, "19,000 太空幣", "spaceCoins", 19000],
      ["space_coin_1", 2000, "1 太空幣", "spaceCoins", 1]
    ]
  },
  supreme: {
    id: "supreme", name: "皇極星庫", currency: "spaceCoins", oneCost: 2000, tenCost: 19000,
    rewards: [
      ["turret_core", 20, "砲塔專屬晶核", "turretCore", 1],
      ["obsidian_100000", 10, "30,000 黑曜石", "obsidian", 30000],
      ["obsidian_50000", 20, "15,000 黑曜石", "obsidian", 15000],
      ["obsidian_20000", 50, "8,000 黑曜石", "obsidian", 8000],
      ["obsidian_10000", 100, "5,000 黑曜石", "obsidian", 5000],
      ["space_coin_50000", 1, "50,000 太空幣", "spaceCoins", 50000],
      ["space_coin_5000", 20, "5,000 太空幣", "spaceCoins", 5000],
      ["speed_4", 80, "4 倍速永久解鎖卷", "speedVoucher", 4],
      ["speed_5", 40, "5 倍速永久解鎖卷", "speedVoucher", 5],
      ["speed_10", 10, "10 倍速永久解鎖卷", "speedVoucher", 10],
      ["premium_background", 50, "隨機典藏背景", "premiumBackground", 1],
      ["permanent_upgrade", 100, "隨機永久強化 +1", "permanentUpgrade", 1],
      ["tactical_card", 100, "隨機戰術卡永久解鎖", "tacticalCard", 1],
      ["wishlist_turret_100", 10, "願望砲塔碎片 ×100", "wishlistTurretFragments", 100],
      ["wishlist_ultimate_50", 20, "願望絕招碎片 ×50", "wishlistUltimateFragments", 50],
      ["all_turret_2", 20, "全砲塔碎片 ×2", "allTurretFragments", 2],
      ["all_ultimate_1", 40, "全絕招碎片 ×1", "allUltimateFragments", 1],
      ["turret_shard_50", 30, "隨機砲塔碎片 ×50", "turretFragments", 50],
      ["ultimate_shard_20", 75, "隨機絕招碎片 ×20", "ultimateFragments", 20],
      ["elite_bundle", 100, "菁英戰備組：砲塔碎片 ×10＋絕招碎片 ×5", "eliteBundle", 1],
      ["revive_ticket", 4, "復活卷", "reviveTicket", 1],
      ["obsidian_double_voucher", 100, "黑曜石翻倍卷", "obsidianDoubleVoucher", 1],
      ["turret_shard_1", 2500, "隨機砲塔碎片 ×1", "turretFragments", 1],
      ["turret_shard_2", 1250, "隨機砲塔碎片 ×2", "turretFragments", 2],
      ["ultimate_shard_1", 2500, "隨機絕招碎片 ×1", "ultimateFragments", 1],
      ["ultimate_shard_2", 1250, "隨機絕招碎片 ×2", "ultimateFragments", 2],
      ["skip_wave_voucher", 300, "跳回合卷（不能跳過 Boss）", "skipWaveVoucher", 1],
      ["free_upgrade_voucher", 300, "局內免費升級一次", "freeUpgradeVoucher", 1],
      ["gold_double_voucher", 300, "前 200 回合金幣翻倍卷", "goldDoubleVoucher", 1],
      ["boss_seal_voucher", 300, "Boss 封印卷", "bossSealVoucher", 1],
      ["stage_protection_voucher", 300, "關卡保護卷（5 波，Boss 不適用）", "stageProtectionVoucher", 1]
    ]
  }
});

const EXPANSION_TEXT = Object.freeze({
  zh: { ultimate: "絕招", deploy: "開始出擊", resume: "繼續上一局", login: "登入完成後由大廳選擇出擊", locked: "尚未解鎖", useVoucher: "使用解鎖卷", buy: "使用 {cost} 黑曜石永久解鎖 {speed} 倍速？", need: "黑曜石不足", loginRequired: "請先登入帳號，才能進行卡包抽取。", drawing: "正在開啟補給艙…", promo: "每抽累積星塵與稀有保底；首次 100 抽送 50 抽，之後每 100 抽送 20 抽。" },
  en: { ultimate: "Ultimates", deploy: "Deploy", resume: "Resume Run", login: "Sign in, then deploy from the lobby", locked: "Locked", useVoucher: "Use unlock voucher", buy: "Permanently unlock {speed}× for {cost} Obsidian?", need: "Not enough Obsidian", loginRequired: "Sign in before opening card packs.", drawing: "Opening supply chamber…", promo: "Every pull builds Stardust and rare pity. The first 100 pulls give 50 free; each later 100 gives 20." },
  ja: { ultimate: "必殺技", deploy: "出撃開始", resume: "前回から再開", login: "ログイン後、ロビーから出撃してください", locked: "未解放", useVoucher: "解放券を使用", buy: "黒曜石 {cost} で {speed} 倍速を永久解放しますか？", need: "黒曜石が不足しています", loginRequired: "カードパックを開けるにはログインしてください。", drawing: "補給庫を開封中…", promo: "抽選ごとに星屑とレア保証が進行。最初の100回で50回、以後100回ごとに20回を進呈。" },
  ko: { ultimate: "궁극기", deploy: "출격", resume: "이전 게임 계속", login: "로그인 후 로비에서 출격하세요", locked: "잠김", useVoucher: "해금권 사용", buy: "흑요석 {cost}개로 {speed}배속을 영구 해금할까요?", need: "흑요석이 부족합니다", loginRequired: "카드 팩을 열려면 로그인하세요.", drawing: "보급고 여는 중…", promo: "뽑을 때마다 별가루와 희귀 보장이 누적됩니다. 첫 100회는 50회, 이후 100회마다 20회를 드립니다." },
  ru: { ultimate: "Ульты", deploy: "В бой", resume: "Продолжить бой", login: "Войдите и начните бой из лобби", locked: "Закрыто", useVoucher: "Использовать пропуск", buy: "Навсегда открыть скорость ×{speed} за {cost} обсидиана?", need: "Недостаточно обсидиана", loginRequired: "Войдите, чтобы открывать наборы.", drawing: "Открытие хранилища…", promo: "Каждое открытие даёт пыль и прогресс редкого гаранта. Первые 100 дают 50, следующие 100 — 20 открытий." },
  es: { ultimate: "Definitivas", deploy: "Desplegar", resume: "Continuar partida", login: "Inicia sesión y despliega desde el vestíbulo", locked: "Bloqueado", useVoucher: "Usar cupón", buy: "¿Desbloquear ×{speed} para siempre por {cost} obsidianas?", need: "No hay suficiente obsidiana", loginRequired: "Inicia sesión para abrir paquetes.", drawing: "Abriendo cámara…", promo: "Cada tirada suma polvo y garantía rara. Las primeras 100 dan 50; cada 100 posteriores dan 20 tiradas." }
});

function expansionText() {
  return EXPANSION_TEXT[currentLanguage] || EXPANSION_TEXT.en;
}

function createDefaultExpansionProgress() {
  return {
    revision: 0,
    speedUnlocks: { 4: false, 5: false, 10: false },
    speedVouchers: { 4: 0, 5: 0, 10: 0 },
    premiumBackgrounds: [],
    unlockedCards: [],
    consumables: Object.fromEntries(CONSUMABLE_IDS.map((id) => [id, 0])),
    utilityClaims: {
      day: "",
      adClaims: 0,
      week: "",
      purchases: Object.fromEntries(CONSUMABLE_IDS.map((id) => [id, 0]))
    },
    fusionStones: 0,
    ownedMusic: [],
    equippedMusic: "default",
    normalPaidPulls: 0,
    supremePaidPulls: 0,
    gachaPulls: { normal: 0, supreme: 0 },
    gachaPity: { normal: 0, supreme: 0 },
    starDust: 0,
    promoMail: { normal: 0, supreme: 0 },
    packVouchers: { normal: 0, supreme: 0 },
    launchBonusGranted: 0
  };
}

function normalizeExpansionProgress(raw) {
  const result = createDefaultExpansionProgress();
  if (!raw || typeof raw !== "object") return result;
  result.revision = Math.max(0, Math.floor(Number(raw.revision) || 0));
  for (const speed of [4, 5, 10]) {
    result.speedUnlocks[speed] = raw.speedUnlocks?.[speed] === true;
    result.speedVouchers[speed] = Math.max(0, Math.floor(Number(raw.speedVouchers?.[speed]) || 0));
  }
  result.premiumBackgrounds = Array.isArray(raw.premiumBackgrounds) ? [...new Set(raw.premiumBackgrounds.map(String))].slice(0, 32) : [];
  result.unlockedCards = Array.isArray(raw.unlockedCards) ? [...new Set(raw.unlockedCards.map(String))].slice(0, 128) : [];
  for (const id of CONSUMABLE_IDS) result.consumables[id] = Math.max(0, Math.floor(Number(raw.consumables?.[id]) || 0));
  result.utilityClaims.day = String(raw.utilityClaims?.day || "").slice(0, 10);
  result.utilityClaims.adClaims = Math.min(UTILITY_AD_DAILY_LIMIT, Math.max(0, Math.floor(Number(raw.utilityClaims?.adClaims) || 0)));
  result.utilityClaims.week = String(raw.utilityClaims?.week || "").slice(0, 10);
  for (const id of CONSUMABLE_IDS) {
    result.utilityClaims.purchases[id] = Math.min(
      UTILITY_OBSIDIAN_OFFERS[id].weeklyLimit,
      Math.max(0, Math.floor(Number(raw.utilityClaims?.purchases?.[id]) || 0))
    );
  }
  result.fusionStones = Math.max(0, Math.floor(Number(raw.fusionStones) || 0));
  const musicIds = new Set(ORIGINAL_MUSIC_CATALOG.map((track) => track.id));
  result.ownedMusic = Array.isArray(raw.ownedMusic) ? [...new Set(raw.ownedMusic.map(String).filter((id) => musicIds.has(id)))].slice(0, ORIGINAL_MUSIC_CATALOG.length) : [];
  result.equippedMusic = musicIds.has(String(raw.equippedMusic)) && result.ownedMusic.includes(String(raw.equippedMusic)) ? String(raw.equippedMusic) : "default";
  result.normalPaidPulls = Math.max(0, Math.floor(Number(raw.normalPaidPulls) || 0));
  result.supremePaidPulls = Math.max(0, Math.floor(Number(raw.supremePaidPulls) || 0));
  result.starDust = Math.max(0, Math.floor(Number(raw.starDust) || 0));
  for (const packId of ["normal", "supreme"]) {
    result.gachaPulls[packId] = Math.max(0, Math.floor(Number(raw.gachaPulls?.[packId]) || 0));
    result.gachaPity[packId] = Math.min(9, Math.max(0, Math.floor(Number(raw.gachaPity?.[packId] ?? result.gachaPulls[packId] % 10) || 0)));
    result.promoMail[packId] = Math.max(0, Math.floor(Number(raw.promoMail?.[packId]) || 0));
    result.packVouchers[packId] = Math.max(0, Math.floor(Number(raw.packVouchers?.[packId]) || 0));
  }
  result.launchBonusGranted = Math.max(0, Math.floor(Number(raw.launchBonusGranted) || 0));
  return result;
}

function loadExpansionProgress() {
  try { return normalizeExpansionProgress(JSON.parse(localStorage.getItem(EXPANSION_SAVE_KEY) || "null")); }
  catch { return createDefaultExpansionProgress(); }
}

let expansionProgress = loadExpansionProgress();

function saveExpansionProgress(options = {}) {
  expansionProgress = normalizeExpansionProgress(expansionProgress);
  if (options.bumpRevision !== false) expansionProgress.revision += 1;
  if (!DEV_MODE) localStorage.setItem(EXPANSION_SAVE_KEY, JSON.stringify(expansionProgress));
  renderSpeedLicenses();
  renderSupplyPacks();
  renderUtilityStore();
  renderMusicStore();
  renderConsumableDock();
  renderLaunchMailbox?.();
  if (options.cloud !== false) queueCloudSave({ critical: options.critical === true });
}

window.isSpaceTowerSpeedUnlocked = (speed) => Number(speed) < 4 || expansionProgress.speedUnlocks[Number(speed)] === true;
window.requestSpaceTowerSpeedUnlock = (speed) => {
  const resolved = Number(speed);
  const cost = SPEED_LICENSE_COSTS[resolved];
  if (!cost || expansionProgress.speedUnlocks[resolved]) return;
  const text = expansionText();
  const voucherCount = expansionProgress.speedVouchers[resolved] || 0;
  if (voucherCount > 0) {
    expansionProgress.speedVouchers[resolved] -= 1;
    expansionProgress.speedUnlocks[resolved] = true;
    saveExpansionProgress({ critical: true });
    showTaskToast(`${resolved}×`, text.useVoucher);
    return;
  }
  if (!DEV_MODE && obsidian < cost) {
    showTaskToast(text.locked, text.need);
    return;
  }
  const prompt = text.buy.replace("{cost}", cost.toLocaleString()).replace("{speed}", resolved);
  if (!window.confirm(prompt)) return;
  if (!DEV_MODE) obsidian -= cost;
  trackObsidianSpend("speed_license", String(resolved), cost);
  expansionProgress.speedUnlocks[resolved] = true;
  saveObsidian({ critical: true });
  saveExpansionProgress({ critical: true });
  showTaskToast(`${resolved}×`, text.useVoucher);
};

function renderSpeedLicenses() {
  for (const button of speedButtons) {
    const speed = Number(button.dataset.speed);
    if (speed < 4) continue;
    const unlocked = window.isSpaceTowerSpeedUnlocked(speed);
    button.classList.toggle("speed-locked", !unlocked);
    button.setAttribute("aria-label", unlocked ? `${speed}×` : `${speed}× · ${expansionText().locked}`);
    button.title = unlocked ? `${speed}×` : `${expansionText().locked} · ${SPEED_LICENSE_COSTS[speed].toLocaleString()} 黑曜石 · 卷 ${expansionProgress.speedVouchers[speed]}`;
    button.textContent = `${unlocked ? "" : "🔒 "}${speed}×`;
  }
}

let gachaPreviewReward = DEV_MODE ? new URLSearchParams(window.location.search).get("gachaPreview") : "";

function drawLocalReward(pack) {
  if (gachaPreviewReward) {
    const requested = gachaPreviewReward;
    gachaPreviewReward = "";
    const previewReward = requested === "mythic"
      ? pack.rewards.find((reward) => reward[3] === "turretCore" || reward[1] <= 10)
      : requested === "legendary"
        ? pack.rewards.find((reward) => reward[1] > 10 && reward[1] <= 50)
        : null;
    if (previewReward) return previewReward;
  }
  let roll = Math.floor(Math.random() * 10000);
  for (const reward of pack.rewards) {
    if (roll < reward[1]) return reward;
    roll -= reward[1];
  }
  return pack.rewards[pack.rewards.length - 1];
}

function randomFrom(items) { return items[Math.floor(Math.random() * items.length)]; }

const GACHA_RARITY_ORDER = Object.freeze({ common: 0, rare: 1, epic: 2, legendary: 3, mythic: 4 });
const GACHA_RARITY_TEXT = Object.freeze({
  zh: { common: "普通", rare: "稀有", epic: "史詩", legendary: "傳說", mythic: "星鑄" },
  en: { common: "COMMON", rare: "RARE", epic: "EPIC", legendary: "LEGENDARY", mythic: "MYTHIC" },
  ja: { common: "ノーマル", rare: "レア", epic: "エピック", legendary: "レジェンド", mythic: "神話" },
  ko: { common: "일반", rare: "희귀", epic: "영웅", legendary: "전설", mythic: "신화" },
  ru: { common: "ОБЫЧНЫЙ", rare: "РЕДКИЙ", epic: "ЭПИЧЕСКИЙ", legendary: "ЛЕГЕНДАРНЫЙ", mythic: "МИФИЧЕСКИЙ" },
  es: { common: "COMÚN", rare: "RARO", epic: "ÉPICO", legendary: "LEGENDARIO", mythic: "MÍTICO" }
});
const GACHA_UI_TEXT = Object.freeze({
  zh: { storeBackground: "戰場外觀", storePacks: "星際卡包", reveal: "補給艙開啟", continue: "收下獎勵", voucher: "免費抽數", voucherUnit: "抽", mailTitle: "100 抽贈抽券", mailDesc: "正式上架首週活動 · {pack} 免費 100 抽", claim: "領取 100 抽", mailDelivered: "免費 100 抽已寄至星際信箱。", voucherUsed: "已使用免費抽數。" },
  en: { storeBackground: "Battlefields", storePacks: "Card Packs", reveal: "Supply opened", continue: "Collect", voucher: "Pack voucher", voucherUnit: "pulls", mailTitle: "100-pull reward voucher", mailDesc: "Launch-week reward · 100 pulls for {pack}", claim: "Claim voucher", mailDelivered: "A 100-pull voucher was delivered to Star Mail.", voucherUsed: "Pack voucher used." },
  ja: { storeBackground: "戦場外観", storePacks: "カードパック", reveal: "補給庫開封", continue: "受け取る", voucher: "専用券", voucherUnit: "回", mailTitle: "100回分の特典券", mailDesc: "正式リリース初週 · {pack} 専用100回券", claim: "券を受け取る", mailDelivered: "100回券が星間メールに届きました。", voucherUsed: "パック専用券を使用しました。" },
  ko: { storeBackground: "전장 외형", storePacks: "카드 팩", reveal: "보급고 개봉", continue: "보상 받기", voucher: "전용 이용권", voucherUnit: "회", mailTitle: "100회 보상권", mailDesc: "정식 출시 첫 주 · {pack} 전용 100회 이용권", claim: "이용권 받기", mailDelivered: "100회 이용권이 우편함에 도착했습니다.", voucherUsed: "팩 이용권을 사용했습니다." },
  ru: { storeBackground: "Поля боя", storePacks: "Наборы карт", reveal: "Хранилище открыто", continue: "Забрать", voucher: "Купон набора", voucherUnit: "открытий", mailTitle: "Купон на 100 открытий", mailDesc: "Первая неделя релиза · 100 открытий набора {pack}", claim: "Получить купон", mailDelivered: "Купон на 100 открытий доставлен в почту.", voucherUsed: "Купон набора использован." },
  es: { storeBackground: "Campos", storePacks: "Paquetes", reveal: "Suministro abierto", continue: "Recoger", voucher: "Cupón del paquete", voucherUnit: "tiradas", mailTitle: "Cupón de 100 tiradas", mailDesc: "Primera semana · 100 tiradas para {pack}", claim: "Recoger cupón", mailDelivered: "El cupón de 100 tiradas llegó al correo.", voucherUsed: "Cupón del paquete utilizado." }
});

const GACHA_FEATURE_TEXT = Object.freeze({
  zh: { contents: "查看內容", possibleRewards: "可能取得內容", close: "關閉", turretWish: "願望砲塔", ultimateWish: "願望絕招", chooseWish: "請先選擇願望目標", dust: "星塵", redeemTurret: "50 星塵換願望砲塔碎片 ×10", redeemUltimate: "100 星塵換願望絕招碎片 ×10", guarantee: "稀有保底 {current}/{target} · 再 {count} 抽必出", support: "{needed} 抽送 {reward} 抽 · {current}/{needed}", tapToReveal: "點擊金卡揭曉大獎", hiddenPrize: "金卡大獎 · 點擊翻開", milestones: "願望里程：30 抽 ×10、50 抽 ×25、100 抽 ×50；每 200 抽再送另一類願望碎片 ×50", loyaltyReceived: "已送入 {count} 抽，可直接免費抽取。", bonusTitle: "贈抽已到帳", dustReceived: "獲得 {count} 星塵。", redeemed: "星塵兌換完成。" },
  en: { contents: "View contents", possibleRewards: "Possible contents", close: "Close", turretWish: "Turret wishlist", ultimateWish: "Ultimate wishlist", chooseWish: "Choose a wishlist target first", dust: "Stardust", redeemTurret: "50 Stardust → 10 wishlisted turret fragments", redeemUltimate: "100 Stardust → 10 wishlisted ultimate fragments", guarantee: "Rare pity {current}/{target} · guaranteed in {count}", support: "{needed} pulls give {reward} free · {current}/{needed}", tapToReveal: "Tap a gold card to reveal the prize", hiddenPrize: "Gold prize · tap to reveal", milestones: "Wishlist milestones: 30 pulls ×10, 50 ×25, 100 ×50; every 200 adds ×50 from the other wishlist", loyaltyReceived: "{count} free pulls added and ready to use.", bonusTitle: "Free pulls delivered", dustReceived: "Received {count} Stardust.", redeemed: "Stardust redeemed." },
  ja: { contents: "内容を見る", possibleRewards: "入手可能な内容", close: "閉じる", turretWish: "希望砲塔", ultimateWish: "希望必殺技", chooseWish: "希望対象を選択してください", dust: "星屑", redeemTurret: "星屑50 → 希望砲塔の欠片×10", redeemUltimate: "星屑100 → 希望必殺技の欠片×10", guarantee: "レア保証 {current}/{target} · あと{count}回", support: "{needed}回で{reward}回分進呈 · {current}/{needed}", tapToReveal: "金カードをタップして大当たりを開封", hiddenPrize: "金カード · タップして開封", milestones: "希望マイル：30回×10、50回×25、100回×50。200回ごとに別種の希望欠片×50", loyaltyReceived: "無料{count}回分を付与しました。", bonusTitle: "無料分を付与", dustReceived: "星屑を{count}獲得。", redeemed: "星屑を交換しました。" },
  ko: { contents: "내용 보기", possibleRewards: "획득 가능 내용", close: "닫기", turretWish: "희망 포탑", ultimateWish: "희망 궁극기", chooseWish: "희망 대상을 먼저 선택하세요", dust: "별가루", redeemTurret: "별가루 50 → 희망 포탑 조각 ×10", redeemUltimate: "별가루 100 → 희망 궁극기 조각 ×10", guarantee: "희귀 보장 {current}/{target} · {count}회 남음", support: "{needed}회 뽑으면 {reward}회 무료 · {current}/{needed}", tapToReveal: "금 카드를 눌러 대상을 확인하세요", hiddenPrize: "금 카드 · 눌러서 공개", milestones: "희망 마일: 30회×10, 50회×25, 100회×50; 200회마다 다른 희망 조각×50", loyaltyReceived: "무료 {count}회가 지급되었습니다.", bonusTitle: "무료 뽑기 지급", dustReceived: "별가루 {count}개 획득.", redeemed: "별가루 교환 완료." },
  ru: { contents: "Состав", possibleRewards: "Возможное содержимое", close: "Закрыть", turretWish: "Желаемая турель", ultimateWish: "Желаемая ульта", chooseWish: "Сначала выберите желаемую цель", dust: "Звёздная пыль", redeemTurret: "50 пыли → 10 фрагментов желаемой турели", redeemUltimate: "100 пыли → 10 фрагментов желаемой ульты", guarantee: "Редкий гарант {current}/{target} · осталось {count}", support: "{needed} открытий = {reward} бесплатно · {current}/{needed}", tapToReveal: "Нажмите золотую карту, чтобы открыть приз", hiddenPrize: "Золотой приз · нажмите, чтобы открыть", milestones: "Этапы желания: 30×10, 50×25, 100×50; каждые 200 — ещё 50 фрагментов другого типа", loyaltyReceived: "Добавлено бесплатных открытий: {count}.", bonusTitle: "Бесплатные открытия начислены", dustReceived: "Получено звёздной пыли: {count}.", redeemed: "Звёздная пыль обменена." },
  es: { contents: "Ver contenido", possibleRewards: "Contenido posible", close: "Cerrar", turretWish: "Torreta deseada", ultimateWish: "Definitiva deseada", chooseWish: "Elige primero un objetivo deseado", dust: "Polvo estelar", redeemTurret: "50 de polvo → 10 fragmentos de torreta deseada", redeemUltimate: "100 de polvo → 10 fragmentos de definitiva deseada", guarantee: "Garantía rara {current}/{target} · faltan {count}", support: "{needed} tiradas dan {reward} gratis · {current}/{needed}", tapToReveal: "Toca la carta dorada para revelar el premio", hiddenPrize: "Premio dorado · toca para revelar", milestones: "Hitos: 30×10, 50×25, 100×50; cada 200 añade ×50 del otro deseo", loyaltyReceived: "Se añadieron {count} tiradas gratis.", bonusTitle: "Tiradas gratis entregadas", dustReceived: "Recibiste {count} de polvo estelar.", redeemed: "Polvo estelar canjeado." }
});
const GACHA_VOUCHER_REWARD_TEXT = Object.freeze({
  zh: "免費抽卡 ×{amount}", en: "Free pulls ×{amount}", ja: "無料抽選 ×{amount}",
  ko: "무료 뽑기 ×{amount}", ru: "Бесплатные открытия ×{amount}", es: "Tiradas gratis ×{amount}"
});

const GACHA_CONTENT_TEXT = Object.freeze({
  zh: {
    storeKicker: "軌道補給", packsTitle: "星際卡包", pullOne: "{count} 抽", pullMany: "{count} 抽", bonus: "加贈", opened: "{pack} 開啟完成。", drawFailed: "抽取失敗，請稍後再試。", claimFailed: "抵用券領取失敗，請稍後再試。",
    obsidian: "黑曜石", spaceCoins: "太空幣",
    normal: { name: "星隕補給艙", kicker: "流星補給", description: "24 種戰備物資，適合日常養成。" },
    supreme: { name: "皇極星庫", kicker: "帝皇星庫", description: "31 種高階物資，僅能使用太空幣抽取。" },
    rewards: { turretCore: "砲塔專屬晶核", obsidian: "{amount} 黑曜石", spaceCoins: "{amount} 太空幣", turretFragments: "隨機砲塔碎片 ×{amount}", ultimateFragments: "隨機絕招碎片 ×{amount}", speedVoucher: "{speed} 倍速永久解鎖卷", premiumBackground: "隨機典藏背景", permanentUpgrade: "隨機永久強化 +1", tacticalCard: "隨機戰術卡永久解鎖", wishlistTurretFragments: "願望砲塔碎片 ×{amount}", wishlistUltimateFragments: "願望絕招碎片 ×{amount}", allTurretFragments: "全砲塔碎片 ×{amount}", allUltimateFragments: "全絕招碎片 ×{amount}", eliteBundle: "菁英雙核箱：砲塔 ×{turret}＋絕招 ×{ultimate}" }
  },
  en: {
    storeKicker: "ORBITAL SUPPLY", packsTitle: "Card Packs", pullOne: "{count} pull", pullMany: "{count} pulls", bonus: "BONUS", opened: "{pack} opened.", drawFailed: "Draw failed. Please try again.", claimFailed: "Could not claim the voucher. Please try again.",
    obsidian: "Obsidian", spaceCoins: "Space Coins",
    normal: { name: "Meteor Supply Pod", kicker: "METEOR SUPPLY", description: "24 field supplies for everyday progression." },
    supreme: { name: "Imperial Star Vault", kicker: "IMPERIAL VAULT", description: "31 premium rewards, available only with Space Coins." },
    rewards: { turretCore: "Turret-specific Core", obsidian: "{amount} Obsidian", spaceCoins: "{amount} Space Coins", turretFragments: "Random Turret Fragments ×{amount}", ultimateFragments: "Random Ultimate Fragments ×{amount}", speedVoucher: "Permanent {speed}× Speed Voucher", premiumBackground: "Random Collector Background", permanentUpgrade: "Random Permanent Upgrade +1", tacticalCard: "Random Tactical Card Unlock", wishlistTurretFragments: "Wishlisted Turret Fragments ×{amount}", wishlistUltimateFragments: "Wishlisted Ultimate Fragments ×{amount}", allTurretFragments: "All Turret Fragments ×{amount}", allUltimateFragments: "All Ultimate Fragments ×{amount}", eliteBundle: "Elite Twin-Core Crate: Turret ×{turret} + Ultimate ×{ultimate}" }
  },
  ja: {
    storeKicker: "軌道補給", packsTitle: "カードパック", pullOne: "{count}回", pullMany: "{count}回", bonus: "ボーナス", opened: "{pack}を開封しました。", drawFailed: "抽選に失敗しました。もう一度お試しください。", claimFailed: "券を受け取れませんでした。もう一度お試しください。",
    obsidian: "黒曜石", spaceCoins: "スペースコイン",
    normal: { name: "流星補給庫", kicker: "メテオ補給", description: "日々の育成に適した24種類の戦備物資。" },
    supreme: { name: "皇極星庫", kicker: "皇帝星庫", description: "スペースコイン限定の高級物資31種類。" },
    rewards: { turretCore: "砲塔専用コア", obsidian: "黒曜石 ×{amount}", spaceCoins: "スペースコイン ×{amount}", turretFragments: "ランダム砲塔の欠片 ×{amount}", ultimateFragments: "ランダム必殺技の欠片 ×{amount}", speedVoucher: "{speed}倍速永久解放券", premiumBackground: "ランダム限定背景", permanentUpgrade: "ランダム永久強化 +1", tacticalCard: "ランダム戦術カード永久解放", wishlistTurretFragments: "希望砲塔の欠片 ×{amount}", wishlistUltimateFragments: "希望必殺技の欠片 ×{amount}", allTurretFragments: "全砲塔の欠片 ×{amount}", allUltimateFragments: "全必殺技の欠片 ×{amount}", eliteBundle: "精鋭ツインコア箱：砲塔 ×{turret}＋必殺技 ×{ultimate}" }
  },
  ko: {
    storeKicker: "궤도 보급", packsTitle: "카드 팩", pullOne: "{count}회", pullMany: "{count}회", bonus: "보너스", opened: "{pack} 개봉 완료.", drawFailed: "추첨에 실패했습니다. 다시 시도해 주세요.", claimFailed: "이용권을 받을 수 없습니다. 다시 시도해 주세요.",
    obsidian: "흑요석", spaceCoins: "우주 코인",
    normal: { name: "유성 보급고", kicker: "메테오 보급", description: "일상 성장에 적합한 전투 물자 24종." },
    supreme: { name: "황극 성고", kicker: "황제 성고", description: "우주 코인으로만 획득 가능한 고급 물자 31종." },
    rewards: { turretCore: "포탑 전용 코어", obsidian: "흑요석 ×{amount}", spaceCoins: "우주 코인 ×{amount}", turretFragments: "무작위 포탑 조각 ×{amount}", ultimateFragments: "무작위 궁극기 조각 ×{amount}", speedVoucher: "{speed}배속 영구 해금권", premiumBackground: "무작위 컬렉션 배경", permanentUpgrade: "무작위 영구 강화 +1", tacticalCard: "무작위 전술 카드 영구 해금", wishlistTurretFragments: "희망 포탑 조각 ×{amount}", wishlistUltimateFragments: "희망 궁극기 조각 ×{amount}", allTurretFragments: "모든 포탑 조각 ×{amount}", allUltimateFragments: "모든 궁극기 조각 ×{amount}", eliteBundle: "정예 트윈 코어 상자: 포탑 ×{turret}＋궁극기 ×{ultimate}" }
  },
  ru: {
    storeKicker: "ОРБИТАЛЬНОЕ СНАБЖЕНИЕ", packsTitle: "Наборы карт", pullOne: "{count} открытие", pullMany: "{count} открытий", bonus: "БОНУС", opened: "Набор «{pack}» открыт.", drawFailed: "Не удалось открыть набор. Попробуйте ещё раз.", claimFailed: "Не удалось получить купон. Попробуйте ещё раз.",
    obsidian: "обсидиана", spaceCoins: "космомонет",
    normal: { name: "Метеорный контейнер", kicker: "МЕТЕОРНЫЙ ЗАПАС", description: "24 вида припасов для ежедневного развития." },
    supreme: { name: "Имперское звёздное хранилище", kicker: "ИМПЕРСКОЕ ХРАНИЛИЩЕ", description: "31 элитная награда только за космомонеты." },
    rewards: { turretCore: "Уникальное ядро турели", obsidian: "{amount} обсидиана", spaceCoins: "{amount} космомонет", turretFragments: "Случайные фрагменты турели ×{amount}", ultimateFragments: "Случайные фрагменты ульты ×{amount}", speedVoucher: "Постоянный пропуск скорости ×{speed}", premiumBackground: "Случайный коллекционный фон", permanentUpgrade: "Случайное постоянное усиление +1", tacticalCard: "Случайная тактическая карта", wishlistTurretFragments: "Фрагменты желаемой турели ×{amount}", wishlistUltimateFragments: "Фрагменты желаемой ульты ×{amount}", allTurretFragments: "Фрагменты всех турелей ×{amount}", allUltimateFragments: "Фрагменты всех ульт ×{amount}", eliteBundle: "Элитный двойной контейнер: турель ×{turret} + ульта ×{ultimate}" }
  },
  es: {
    storeKicker: "SUMINISTRO ORBITAL", packsTitle: "Paquetes", pullOne: "{count} tirada", pullMany: "{count} tiradas", bonus: "BONUS", opened: "Se abrió {pack}.", drawFailed: "La tirada falló. Inténtalo de nuevo.", claimFailed: "No se pudo recoger el cupón. Inténtalo de nuevo.",
    obsidian: "obsidianas", spaceCoins: "monedas espaciales",
    normal: { name: "Cámara de Suministros Meteoro", kicker: "SUMINISTRO METEORO", description: "24 suministros de combate para el progreso diario." },
    supreme: { name: "Bóveda Estelar Imperial", kicker: "BÓVEDA IMPERIAL", description: "31 recompensas superiores, solo con monedas espaciales." },
    rewards: { turretCore: "Núcleo exclusivo de torreta", obsidian: "{amount} obsidianas", spaceCoins: "{amount} monedas espaciales", turretFragments: "Fragmentos de torreta aleatoria ×{amount}", ultimateFragments: "Fragmentos de definitiva aleatoria ×{amount}", speedVoucher: "Cupón permanente de velocidad ×{speed}", premiumBackground: "Fondo de colección aleatorio", permanentUpgrade: "Mejora permanente aleatoria +1", tacticalCard: "Carta táctica aleatoria permanente", wishlistTurretFragments: "Fragmentos de torreta deseada ×{amount}", wishlistUltimateFragments: "Fragmentos de definitiva deseada ×{amount}", allTurretFragments: "Fragmentos de todas las torretas ×{amount}", allUltimateFragments: "Fragmentos de todas las definitivas ×{amount}", eliteBundle: "Caja doble de élite: torreta ×{turret} + definitiva ×{ultimate}" }
  }
});

const EXPANSION_REWARD_TEXT = Object.freeze({
  zh: { reviveTicket: "復活卷", obsidianDoubleVoucher: "局內黑曜石 +50%（上限 15）", skipWaveVoucher: "跳回合卷（Boss 不適用）", freeUpgradeVoucher: "局內免費升級一次", goldDoubleVoucher: "前 200 波金幣翻倍卷", bossSealVoucher: "Boss 封印卷", stageProtectionVoucher: "關卡保護卷（5 波，Boss 不適用）" },
  en: { reviveTicket: "Revive Ticket", obsidianDoubleVoucher: "+50% in-run Obsidian (max 15)", skipWaveVoucher: "Wave Skip (not bosses)", freeUpgradeVoucher: "One Free Run Upgrade", goldDoubleVoucher: "Double Gold for 200 Waves", bossSealVoucher: "Boss Seal", stageProtectionVoucher: "Stage Shield (5 waves, not bosses)" },
  ja: { reviveTicket: "復活券", obsidianDoubleVoucher: "バトル内黒曜石+50%（最大15）", skipWaveVoucher: "ウェーブスキップ券（Boss不可）", freeUpgradeVoucher: "バトル内無料強化1回", goldDoubleVoucher: "200ウェーブ金貨2倍券", bossSealVoucher: "Boss封印券", stageProtectionVoucher: "ステージ保護券（5ウェーブ、Boss不可）" },
  ko: { reviveTicket: "부활권", obsidianDoubleVoucher: "게임 내 흑요석 +50%(최대 15)", skipWaveVoucher: "웨이브 스킵권(Boss 제외)", freeUpgradeVoucher: "게임 내 무료 강화 1회", goldDoubleVoucher: "200웨이브 골드 2배권", bossSealVoucher: "Boss 봉인권", stageProtectionVoucher: "스테이지 보호권(5웨이브, Boss 제외)" },
  ru: { reviveTicket: "Билет возрождения", obsidianDoubleVoucher: "+50% обсидиана в бою (до 15)", skipWaveVoucher: "Пропуск волны (кроме босса)", freeUpgradeVoucher: "Одно бесплатное улучшение", goldDoubleVoucher: "Двойное золото на 200 волн", bossSealVoucher: "Печать босса", stageProtectionVoucher: "Защита на 5 волн (кроме босса)" },
  es: { reviveTicket: "Cupón de reanimación", obsidianDoubleVoucher: "+50% obsidiana en partida (máx. 15)", skipWaveVoucher: "Saltar oleada (no jefes)", freeUpgradeVoucher: "Una mejora gratis", goldDoubleVoucher: "Oro doble durante 200 oleadas", bossSealVoucher: "Sello de jefe", stageProtectionVoucher: "Protección 5 oleadas (no jefes)" }
});

const EXPANSION_STORE_TEXT = Object.freeze({
  zh: { utilities: "戰備道具", music: "音樂", utilityKicker: "戰備倉庫", utilityTitle: "融合石與消耗品", utilityDesc: "消耗品每日可看廣告自選 3 次；用完後可用黑曜石購買，並有每週上限。融合石於階級 5 解鎖。", fusion: "融合石", fusionDesc: "升星時自動補足缺少的專屬晶核。", lockedTier: "階級 5 解鎖", buy: "購買", owned: "持有", watchAd: "看廣告領取", dailyAds: "今日廣告自選剩餘", weekly: "本週", weeklyLimit: "本週已達上限", afterAds: "3 次廣告用完後開放", adFailed: "廣告未完成，未扣除次數", claimed: "領取完成", musicKicker: "原創配樂", musicTitle: "星際音樂庫", musicDesc: "23 首本作原創循環曲，每首 8,000 黑曜石；裝備已購買音樂時，局內金幣與黑曜石 ×1.02。", musicBonus: "裝備加成：局內金幣、黑曜石 ×1.02", preview: "試聽", equip: "裝備", equipped: "已裝備", need: "餘額不足", bought: "購買完成" },
  en: { utilities: "Utilities", music: "Music", utilityKicker: "BATTLE STORES", utilityTitle: "Fusion Stones & Consumables", utilityDesc: "Choose any consumable from up to 3 rewarded ads daily. Obsidian purchases unlock after all 3 claims and have weekly limits. Fusion Stones unlock at Tier 5.", fusion: "Fusion Stone", fusionDesc: "Automatically replaces missing turret-specific cores during rank-up.", lockedTier: "Unlocks at Tier 5", buy: "Buy", owned: "Owned", watchAd: "Watch ad & claim", dailyAds: "Ad choices left today", weekly: "This week", weeklyLimit: "Weekly limit reached", afterAds: "Unlocks after 3 ad claims", adFailed: "Ad not completed; no claim used", claimed: "Claimed", musicKicker: "ORIGINAL SCORE", musicTitle: "Stellar Music Library", musicDesc: "23 original loops, 8,000 Obsidian each. Equipping purchased music grants ×1.02 in-run Gold and Obsidian.", musicBonus: "Equipped bonus: in-run Gold & Obsidian ×1.02", preview: "Preview", equip: "Equip", equipped: "Equipped", need: "Insufficient balance", bought: "Purchased" },
  ja: { utilities: "戦備道具", music: "音楽", utilityKicker: "戦備倉庫", utilityTitle: "融合石と消耗品", utilityDesc: "消耗品は1日3回まで広告を見て選択獲得できます。3回獲得後は週上限付きで黒曜石購入が可能です。融合石はTier 5で解放。", fusion: "融合石", fusionDesc: "昇星時に不足した専用コアを自動で補います。", lockedTier: "Tier 5で解放", buy: "購入", owned: "所持", watchAd: "広告を見て獲得", dailyAds: "本日の広告選択残り", weekly: "今週", weeklyLimit: "週間上限です", afterAds: "広告3回獲得後に解放", adFailed: "広告が未完了のため回数は消費されません", claimed: "獲得完了", musicKicker: "オリジナル楽曲", musicTitle: "星間音楽庫", musicDesc: "オリジナル曲23曲、各8,000黒曜石。購入した曲の装備中はバトル内ゴールドと黒曜石×1.02。", musicBonus: "装備ボーナス：バトル内ゴールド・黒曜石 ×1.02", preview: "試聴", equip: "装備", equipped: "装備中", need: "残高不足", bought: "購入完了" },
  ko: { utilities: "전투 도구", music: "음악", utilityKicker: "전투 창고", utilityTitle: "융합석과 소모품", utilityDesc: "소모품은 하루 최대 3번 광고를 보고 선택 획득할 수 있습니다. 3회 후에는 주간 한도 내에서 흑요석으로 구매합니다. 융합석은 Tier 5에 해금됩니다.", fusion: "융합석", fusionDesc: "성급 상승 시 부족한 전용 코어를 자동 보충합니다.", lockedTier: "Tier 5 해금", buy: "구매", owned: "보유", watchAd: "광고 보고 받기", dailyAds: "오늘 남은 광고 선택", weekly: "이번 주", weeklyLimit: "주간 한도 도달", afterAds: "광고 3회 후 해금", adFailed: "광고 미완료: 횟수 미차감", claimed: "획득 완료", musicKicker: "오리지널 음악", musicTitle: "성간 음악 라이브러리", musicDesc: "오리지널 루프 23곡, 각 8,000 흑요석. 구매한 음악 장착 시 게임 내 골드와 흑요석 ×1.02.", musicBonus: "장착 보너스: 게임 내 골드·흑요석 ×1.02", preview: "미리듣기", equip: "장착", equipped: "장착됨", need: "잔액 부족", bought: "구매 완료" },
  ru: { utilities: "Снаряжение", music: "Музыка", utilityKicker: "БОЕВОЙ СКЛАД", utilityTitle: "Камни синтеза и расходники", utilityDesc: "До 3 раз в день выберите расходник за просмотр рекламы. После 3 получений его можно купить за обсидиан с недельным лимитом. Камни синтеза открываются на уровне 5.", fusion: "Камень синтеза", fusionDesc: "Автоматически заменяет недостающие ядра при повышении звезды.", lockedTier: "Откроется на уровне 5", buy: "Купить", owned: "Есть", watchAd: "Реклама и награда", dailyAds: "Выборов за рекламу сегодня", weekly: "За неделю", weeklyLimit: "Недельный лимит", afterAds: "После 3 рекламных наград", adFailed: "Реклама не завершена; попытка сохранена", claimed: "Получено", musicKicker: "ОРИГИНАЛЬНАЯ МУЗЫКА", musicTitle: "Звёздная фонотека", musicDesc: "23 оригинальных трека по 8 000 обсидиана. Выбранная купленная музыка даёт ×1,02 к золоту и обсидиану в бою.", musicBonus: "Бонус выбора: золото и обсидиан в бою ×1,02", preview: "Слушать", equip: "Выбрать", equipped: "Выбрано", need: "Недостаточно средств", bought: "Куплено" },
  es: { utilities: "Utilidades", music: "Música", utilityKicker: "ARSENAL", utilityTitle: "Piedras de fusión y consumibles", utilityDesc: "Elige un consumible viendo hasta 3 anuncios diarios. Tras las 3 recompensas, podrás comprar con obsidiana dentro del límite semanal. Las piedras de fusión se desbloquean en el nivel 5.", fusion: "Piedra de fusión", fusionDesc: "Sustituye automáticamente núcleos faltantes al subir de estrella.", lockedTier: "Se desbloquea en nivel 5", buy: "Comprar", owned: "Tienes", watchAd: "Ver anuncio y recibir", dailyAds: "Elecciones por anuncio hoy", weekly: "Esta semana", weeklyLimit: "Límite semanal alcanzado", afterAds: "Tras 3 recompensas de anuncio", adFailed: "Anuncio incompleto; no gastaste un intento", claimed: "Recibido", musicKicker: "MÚSICA ORIGINAL", musicTitle: "Biblioteca musical estelar", musicDesc: "23 pistas originales, 8.000 obsidianas cada una. Una pista comprada equipada da ×1,02 al oro y la obsidiana de partida.", musicBonus: "Bonificación equipada: oro y obsidiana de partida ×1,02", preview: "Escuchar", equip: "Equipar", equipped: "Equipada", need: "Saldo insuficiente", bought: "Comprado" }
});

function gachaUiText() { return GACHA_UI_TEXT[currentLanguage] || GACHA_UI_TEXT.en; }
function gachaFeatureText() { return GACHA_FEATURE_TEXT[currentLanguage] || GACHA_FEATURE_TEXT.en; }
function gachaRarityText(rarity) { return (GACHA_RARITY_TEXT[currentLanguage] || GACHA_RARITY_TEXT.en)[rarity]; }
function gachaFormat(template, values = {}) { return String(template || "").replace(/\{(\w+)\}/g, (_, key) => values[key] ?? ""); }
function gachaContentText() { return GACHA_CONTENT_TEXT[currentLanguage] || GACHA_CONTENT_TEXT.en; }
function gachaPackText(packOrId) { return gachaContentText()[typeof packOrId === "string" ? packOrId : packOrId.id]; }
function localizedPackName(pack) { return gachaPackText(pack)?.name || pack.name; }
function localizedPullCount(count) {
  const text = gachaContentText();
  return gachaFormat(Number(count) === 1 ? text.pullOne : text.pullMany, { count: Number(count).toLocaleString() });
}
function localizedRewardLabel(definition) {
  if (!definition) return "";
  const [, , fallback, kind, amount] = definition;
  const template = kind === "packVoucher"
    ? (GACHA_VOUCHER_REWARD_TEXT[currentLanguage] || GACHA_VOUCHER_REWARD_TEXT.en)
    : gachaContentText().rewards[kind] || (EXPANSION_REWARD_TEXT[currentLanguage] || EXPANSION_REWARD_TEXT.en)[kind];
  if (!template) return fallback;
  return gachaFormat(template, { amount: Number(amount || 0).toLocaleString(), speed: amount, turret: 10, ultimate: 5 });
}

function getPromotionMailEntries() {
  const text = gachaUiText();
  return Object.values(EXPANSION_PACKS).flatMap((pack) => {
    const count = Math.max(0, Math.floor(Number(expansionProgress.promoMail?.[pack.id]) || 0));
    if (!count) return [];
    return [{
      id: `gacha_100_${pack.id}`,
      packId: pack.id,
      count,
      title: `${localizedPackName(pack)} · ${text.mailTitle}`,
      description: gachaFormat(text.mailDesc, { pack: localizedPackName(pack) }),
      claimLabel: text.claim,
      voucherAmount: 100
    }];
  });
}

async function claimPromotionMail(packId) {
  const pack = EXPANSION_PACKS[packId];
  if (!pack || Math.max(0, Number(expansionProgress.promoMail?.[packId]) || 0) < 1) return;
  if (DEV_MODE) {
    expansionProgress.promoMail[packId] -= 1;
    expansionProgress.packVouchers[packId] += 100;
    saveExpansionProgress({ critical: true });
    showTaskToast(gachaUiText().mailTitle, `${localizedPackName(pack)} · +100 ${gachaUiText().voucherUnit}`);
    return;
  }
  const response = await fetch(apiUrl("/api/shop/promo-mail"), {
    method: "POST",
    headers: shopAuthHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ pack: packId, requestId: crypto.randomUUID() })
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Unable to claim promotion mail.");
  if (data.save) applyCloudSave(data.save);
  showTaskToast(gachaUiText().mailTitle, `${localizedPackName(pack)} · +${data.voucherPullsAdded || 100} ${gachaUiText().voucherUnit}`);
}

window.getSpaceTowerPromotionMails = getPromotionMailEntries;
window.claimSpaceTowerPromotionMail = async (packId) => {
  try { await claimPromotionMail(String(packId || "")); }
  catch (error) { showTaskToast(gachaUiText().mailTitle, error.message || gachaContentText().claimFailed); }
};

function resolvePackReward(pack, rawReward) {
  const id = Array.isArray(rawReward) ? rawReward[0] : rawReward?.id;
  const definition = pack.rewards.find((item) => item[0] === id) || [id, rawReward?.weight ?? 10000, id, rawReward?.kind || "unknown", rawReward?.amount || 1];
  return { id, weight: definition[1], label: localizedRewardLabel(definition), kind: definition[3], amount: definition[4], raw: rawReward };
}

function rarityForPackReward(reward) {
  if (reward.kind === "packVoucher") return "legendary";
  if (reward.kind === "turretCore" || reward.weight <= 10) return "mythic";
  if (reward.weight <= 50 || reward.kind === "premiumBackground") return "legendary";
  if (reward.weight <= 200 || ["speedVoucher", "permanentUpgrade", "tacticalCard", "wishlistTurretFragments", "wishlistUltimateFragments"].includes(reward.kind)) return "epic";
  if (reward.weight <= 500 || ["allTurretFragments", "allUltimateFragments"].includes(reward.kind)) return "rare";
  return "common";
}

const GACHA_MUSIC_URLS = Object.freeze({
  anticipation: "assets/sfx/gacha-anticipation.ogg?v=2",
  jackpot: "assets/sfx/gacha-jackpot-music.ogg?v=2"
});
const gachaMusicPlayers = new Map();
let gachaBgmDuckVersion = 0;

function ensureGachaMusicPlayer(id) {
  let player = gachaMusicPlayers.get(id);
  if (player) return player;
  player = new Audio(GACHA_MUSIC_URLS[id]);
  player.preload = "auto";
  player.setAttribute("playsinline", "");
  gachaMusicPlayers.set(id, player);
  player.load();
  return player;
}

function duckGachaBgm(duration) {
  const version = ++gachaBgmDuckVersion;
  if (bgmAudio) bgmAudio.volume = clamp(userSettings.volume * .06, 0, 1);
  if (bgmGain && audioCtx) bgmGain.gain.setTargetAtTime(userSettings.bgm ? .025 : 0, audioCtx.currentTime, .035);
  window.setTimeout(() => {
    if (version !== gachaBgmDuckVersion) return;
    updateBgmAudioVolume?.();
    if (bgmGain && audioCtx) bgmGain.gain.setTargetAtTime(userSettings.bgm ? .18 : 0, audioCtx.currentTime, .12);
  }, duration);
}

function playGachaMusic(id) {
  if (!userSettings?.sfx) return;
  if (id === "jackpot") {
    const anticipation = gachaMusicPlayers.get("anticipation");
    if (anticipation) {
      anticipation.pause();
      anticipation.currentTime = 0;
    }
  }
  const player = ensureGachaMusicPlayer(id);
  player.pause();
  player.currentTime = 0;
  player.muted = false;
  player.volume = clamp((Number(userSettings.volume) || .7) * (id === "jackpot" ? 1 : .9), 0, 1);
  duckGachaBgm(id === "jackpot" ? 3600 : 4700);
  const started = player.play();
  if (started?.catch) started.catch(() => {});
}

for (const id of Object.keys(GACHA_MUSIC_URLS)) ensureGachaMusicPlayer(id);

function playGachaRaritySound(rarity) {
  if ((GACHA_RARITY_ORDER[rarity] || 0) < GACHA_RARITY_ORDER.legendary) return;
  playGachaMusic("jackpot");
}

function localRewardIsRare(pack, rawReward) {
  return GACHA_RARITY_ORDER[rarityForPackReward(resolvePackReward(pack, rawReward))] >= GACHA_RARITY_ORDER.rare;
}

function makeLocalBonusReward(id, kind, amount) {
  return { id, kind, amount, weight: 0, bonus: true };
}

function applyLocalGachaPityGuarantee(pack, rewards, pityBefore) {
  const result = [...rewards];
  let pity = Math.min(9, Math.max(0, Math.floor(Number(pityBefore) || 0)));
  for (let index = 0; index < result.length; index += 1) {
    if (localRewardIsRare(pack, result[index])) {
      pity = 0;
      continue;
    }
    pity += 1;
    if (pity < 10) continue;
    const kind = pack.id === "supreme" ? "wishlistUltimateFragments" : "wishlistTurretFragments";
    result[index] = makeLocalBonusReward(`pity_guarantee_${index + 1}`, kind, 5);
    pity = 0;
  }
  return { results: result, pity };
}

function getLocalMilestoneRewards(packId, pullBefore, pullAfter) {
  const rewards = [];
  const mainKind = packId === "supreme" ? "wishlistUltimateFragments" : "wishlistTurretFragments";
  const otherKind = packId === "supreme" ? "wishlistTurretFragments" : "wishlistUltimateFragments";
  for (let total = pullBefore + 1; total <= pullAfter; total += 1) {
    const position = total % 100;
    if (position === 30) rewards.push(makeLocalBonusReward(`milestone_${total}_30`, mainKind, 10));
    if (position === 50) rewards.push(makeLocalBonusReward(`milestone_${total}_50`, mainKind, 25));
    if (position === 0) rewards.push(makeLocalBonusReward(`milestone_${total}_100`, mainKind, 50));
    if (total % 200 === 0) rewards.push(makeLocalBonusReward(`milestone_${total}_200`, otherKind, 50));
  }
  return rewards;
}

function getLocalSupportVouchers(before, after) {
  let amount = 0;
  for (let milestone = (Math.floor(before / 100) + 1) * 100; milestone <= after; milestone += 100) amount += milestone === 100 ? 50 : 20;
  return amount;
}

function makeVoucherDisplayReward(packId, amount) {
  return { id: `free_pulls_${packId}_${amount}`, kind: "packVoucher", amount, weight: 50, bonus: true };
}

function rewardEmblem(kind) {
  if (kind === "turretCore") return "◆";
  if (kind === "obsidian") return "⬟";
  if (kind === "spaceCoins") return "◉";
  if (kind === "speedVoucher") return "»";
  if (kind === "premiumBackground") return "✦";
  if (kind === "tacticalCard") return "▣";
  if (kind === "permanentUpgrade") return "↑";
  if (kind.includes("Ultimate") || kind === "ultimateFragments") return "✧";
  if (kind.includes("Turret") || kind === "turretFragments") return "⌁";
  return "◇";
}

function ensureGachaReveal() {
  let reveal = document.getElementById("gachaReveal");
  if (reveal) return reveal;
  reveal = document.createElement("section");
  reveal.id = "gachaReveal";
  reveal.className = "gacha-reveal";
  reveal.hidden = true;
  reveal.setAttribute("role", "dialog");
  reveal.setAttribute("aria-modal", "true");
  document.body.appendChild(reveal);
  return reveal;
}

function playDrawReveal(pack, rawRewards, bonusPulls = 0) {
  const rewards = rawRewards.map((reward) => {
    const resolved = resolvePackReward(pack, reward);
    return { ...resolved, rarity: rarityForPackReward(resolved) };
  });
  const highest = rewards.reduce((best, reward) => GACHA_RARITY_ORDER[reward.rarity] > GACHA_RARITY_ORDER[best] ? reward.rarity : best, "common");
  const reveal = ensureGachaReveal();
  const text = gachaUiText();
  const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
  const openingDelay = reducedMotion ? 0 : 760 + GACHA_RARITY_ORDER[highest] * 110;
  reveal.className = `gacha-reveal rarity-${highest}`;
  reveal.style.setProperty("--opening-delay", `${openingDelay}ms`);
  const content = gachaContentText();
  const feature = gachaFeatureText();
  const cards = rewards.map((reward, index) => {
    const delay = openingDelay + Math.min(index, 14) * 90;
    const isPrize = GACHA_RARITY_ORDER[reward.rarity] >= GACHA_RARITY_ORDER.legendary;
    const front = `<span class="gacha-card-face gacha-card-front"><span class="gacha-card-frame" aria-hidden="true"></span><span class="gacha-card-emblem"><b>${rewardEmblem(reward.kind)}</b></span><small>${escapeHtml(gachaRarityText(reward.rarity))}</small><strong>${escapeHtml(reward.label)}</strong></span>`;
    if (!isPrize) return `<article class="gacha-card rarity-${reward.rarity}" style="--card-delay:${delay}ms">${front}</article>`;
    const back = `<span class="gacha-card-face gacha-card-back"><span class="gacha-card-frame" aria-hidden="true"></span><b>✦</b><small>${escapeHtml(feature.hiddenPrize)}</small></span>`;
    return `<button class="gacha-card rarity-${reward.rarity} is-prize is-face-down" type="button" data-reveal-prize data-rarity="${reward.rarity}" aria-expanded="false" aria-label="${escapeHtml(feature.hiddenPrize)}" style="--card-delay:${delay}ms"><span class="gacha-card-shell">${back}${front}</span></button>`;
  }).join("");
  const prizeCount = rewards.filter((reward) => GACHA_RARITY_ORDER[reward.rarity] >= GACHA_RARITY_ORDER.legendary).length;
  reveal.innerHTML = `<div class="gacha-vault-sequence" aria-hidden="true"><i class="gacha-vault-orbit orbit-a"></i><i class="gacha-vault-orbit orbit-b"></i><i class="gacha-vault-beam"></i><div class="gacha-vault-core"><b>${pack.id === "normal" ? "✦" : "♛"}</b></div><div class="gacha-vault-shards">${Array.from({ length: 12 }, (_, index) => `<i style="--shard:${index}"></i>`).join("")}</div></div><div class="gacha-reveal-stage"><span class="gacha-reveal-kicker">${escapeHtml(gachaRarityText(highest))}</span><h2>${escapeHtml(localizedPackName(pack))}</h2><p class="gacha-reveal-subtitle">${escapeHtml(text.reveal)} · ${escapeHtml(localizedPullCount(rewards.length))}${bonusPulls ? ` · ${escapeHtml(content.bonus)} +${bonusPulls}` : ""}${prizeCount ? `<br><b>${escapeHtml(feature.tapToReveal)}</b>` : ""}</p><div class="gacha-reveal-grid${rewards.length === 1 ? " single" : ""}">${cards}</div><button class="gacha-reveal-continue" type="button">${escapeHtml(text.continue)}</button></div>`;
  reveal.hidden = false;
  const delay = reducedMotion ? 0 : Math.min(2600, openingDelay + 460 + rewards.length * 90);
  const button = reveal.querySelector(".gacha-reveal-continue");
  button.disabled = true;
  let openingFinished = delay === 0;
  let unopenedPrizes = prizeCount;
  const enableContinue = () => {
    if (!openingFinished || unopenedPrizes > 0) return;
    button.disabled = false;
    button.focus();
  };
  for (const prizeCard of reveal.querySelectorAll("[data-reveal-prize]")) {
    prizeCard.addEventListener("click", () => {
      if (prizeCard.classList.contains("is-open")) return;
      prizeCard.classList.add("is-open");
      prizeCard.classList.remove("is-face-down");
      prizeCard.setAttribute("aria-expanded", "true");
      playGachaRaritySound(prizeCard.dataset.rarity);
      reveal.classList.add("prize-opening");
      window.setTimeout(() => reveal.classList.remove("prize-opening"), 720);
      unopenedPrizes -= 1;
      enableContinue();
    }, { once: true });
  }
  window.setTimeout(() => { openingFinished = true; enableContinue(); }, delay);
  return new Promise((resolve) => {
    button.addEventListener("click", () => { reveal.hidden = true; resolve(); }, { once: true });
  });
}

function applyLocalDrawRewards(rewards) {
  let obsidianReward = 0;
  let spaceCoinReward = 0;
  const turretIds = window.getSpaceTowerTurretIds?.() || [];
  const ultimateIds = window.getSpaceTowerUltimateIds?.() || [];
  for (const reward of rewards) {
    const kind = Array.isArray(reward) ? reward[3] : reward.kind;
    const amount = Array.isArray(reward) ? reward[4] : reward.amount;
    if (kind === "obsidian") obsidianReward += amount;
    else if (kind === "spaceCoins") spaceCoinReward += amount;
    else if (kind === "turretCore") window.grantSpaceTowerTurretCore?.(randomFrom(turretIds), 1, "card_pack");
    else if (kind === "turretFragments" || kind === "wishlistTurretFragments") window.grantSpaceTowerTurretFragments?.(kind === "wishlistTurretFragments" && turretIds.includes(v2Progress.fragmentWishlist) ? v2Progress.fragmentWishlist : randomFrom(turretIds), amount, "card_pack");
    else if (kind === "ultimateFragments" || kind === "wishlistUltimateFragments") window.grantSpaceTowerUltimateFragments?.(kind === "wishlistUltimateFragments" && ultimateIds.includes(ultimateProgress.fragmentWishlist) ? ultimateProgress.fragmentWishlist : randomFrom(ultimateIds), amount, "card_pack");
    else if (kind === "allTurretFragments") for (const id of turretIds) window.grantSpaceTowerTurretFragments?.(id, amount, "card_pack");
    else if (kind === "allUltimateFragments") for (const id of ultimateIds) window.grantSpaceTowerUltimateFragments?.(id, amount, "card_pack");
    else if (kind === "eliteBundle") {
      window.grantSpaceTowerTurretFragments?.(randomFrom(turretIds), 10, "card_pack");
      window.grantSpaceTowerUltimateFragments?.(randomFrom(ultimateIds), 5, "card_pack");
    } else if (kind === "speedVoucher") expansionProgress.speedVouchers[amount] += 1;
    else if (kind === "premiumBackground") {
      const backgroundId = randomFrom(["gilded_citadel", "obsidian_singularity", "aurora_garden", "crimson_event_horizon", "prismatic_wormhole"]);
      expansionProgress.premiumBackgrounds = [...new Set([...expansionProgress.premiumBackgrounds, backgroundId])];
      shopState.backgroundStore.owned = [...new Set([...shopState.backgroundStore.owned, backgroundId])];
      saveShopState();
    }
    else if (kind === "permanentUpgrade") {
      const definition = randomFrom(META_UPGRADE_DEFS);
      if (definition) metaUpgrades[definition.id] = getMetaLevel(definition.id) + 1;
    } else if (kind === "tacticalCard") {
      const card = randomFrom(SPECIAL_CARDS.filter((item) => item.unlockCost));
      if (card) metaUpgrades[getCardUnlockMetaId(card.id)] = 1;
    } else if (CONSUMABLE_IDS.includes(kind)) expansionProgress.consumables[kind] += Math.max(1, Number(amount) || 1);
  }
  if (obsidianReward) { obsidian += obsidianReward; saveObsidian({ critical: true }); }
  if (spaceCoinReward) { spaceCoins += spaceCoinReward; saveSpaceCoins({ critical: true }); }
  saveMetaUpgrades({ critical: true });
  saveExpansionProgress({ critical: true });
}

function displayDrawResults(pack, rewards) {
  const resultBox = document.querySelector("#supplyPackSection .pack-results");
  if (!resultBox) return;
  const counts = new Map();
  for (const result of rewards) {
    const id = Array.isArray(result) ? result[0] : result.id;
    const definition = pack.rewards.find((item) => item[0] === id) || [id, result?.weight ?? 0, id, result?.kind, result?.amount];
    const label = localizedRewardLabel(definition) || id;
    counts.set(label, (counts.get(label) || 0) + 1);
  }
  resultBox.innerHTML = `<strong>${escapeHtml(localizedPackName(pack))} · ${escapeHtml(localizedPullCount(rewards.length))}</strong><div>${[...counts].map(([label, count]) => `<span>${escapeHtml(label)}${count > 1 ? ` × ${count}` : ""}</span>`).join("")}</div>`;
}

function setSupplyPackStatus(message, isError = false) {
  const status = document.querySelector("#supplyPackSection .pack-status");
  if (!status) return;
  status.textContent = String(message || "");
  status.classList.toggle("error", Boolean(isError));
}

async function drawSupplyPack(packId, pulls) {
  const pack = EXPANSION_PACKS[packId];
  if (!pack) return;
  initAudio?.({ startMusic: false });
  await unlockAudio?.();
  const cost = pulls === 10 ? pack.tenCost : pack.oneCost;
  const voucherBalance = Math.max(0, Math.floor(Number(expansionProgress.packVouchers?.[packId]) || 0));
  const useVoucher = voucherBalance >= pulls;
  const balance = pack.currency === "obsidian" ? obsidian : spaceCoins;
  if (!DEV_MODE && !playerSessionToken) {
    setSupplyPackStatus(expansionText().loginRequired, true);
    return;
  }
  if (!DEV_MODE && !useVoucher && balance < cost) {
    setSupplyPackStatus(expansionText().need, true);
    return;
  }
  playGachaMusic("anticipation");
  setSupplyPackStatus(expansionText().drawing);
  document.getElementById("supplyPackSection")?.classList.add("busy");
  try {
    if (DEV_MODE) {
      const totalBefore = expansionProgress.gachaPulls[packId];
      const totalAfter = totalBefore + pulls;
      const guaranteed = applyLocalGachaPityGuarantee(pack, Array.from({ length: pulls }, () => drawLocalReward(pack)), expansionProgress.gachaPity[packId]);
      const results = guaranteed.results;
      const bonusRewards = getLocalMilestoneRewards(packId, totalBefore, totalAfter);
      let loyaltyVoucherPulls = 0;
      if (useVoucher) expansionProgress.packVouchers[packId] -= pulls;
      else {
        const paidField = packId === "normal" ? "normalPaidPulls" : "supremePaidPulls";
        const paidBefore = expansionProgress[paidField];
        expansionProgress[paidField] += pulls;
        loyaltyVoucherPulls = getLocalSupportVouchers(paidBefore, expansionProgress[paidField]);
        expansionProgress.packVouchers[packId] += loyaltyVoucherPulls;
      }
      const starDustEarned = pulls + (pulls === 10 ? 2 : 0);
      expansionProgress.gachaPulls[packId] = totalAfter;
      expansionProgress.gachaPity[packId] = guaranteed.pity;
      expansionProgress.starDust += starDustEarned;
      const allRewards = [...results, ...bonusRewards];
      applyLocalDrawRewards(allRewards);
      const revealRewards = loyaltyVoucherPulls ? [...allRewards, makeVoucherDisplayReward(packId, loyaltyVoucherPulls)] : allRewards;
      await playDrawReveal(pack, revealRewards, loyaltyVoucherPulls || bonusRewards.length);
      displayDrawResults(pack, revealRewards);
      if (loyaltyVoucherPulls) {
        const message = gachaFormat(gachaFeatureText().loyaltyReceived, { count: loyaltyVoucherPulls });
        setSupplyPackStatus(message);
        showTaskToast(gachaFeatureText().bonusTitle, message);
      }
      else setSupplyPackStatus(`${useVoucher ? gachaUiText().voucherUsed : gachaFormat(gachaContentText().opened, { pack: localizedPackName(pack) })} ${gachaFormat(gachaFeatureText().dustReceived, { count: starDustEarned })}`);
      return;
    }
    const response = await fetch(apiUrl("/api/shop/draw"), {
      method: "POST",
      headers: shopAuthHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({ pack: packId, pulls, useVoucher, requestId: crypto.randomUUID() })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || "Draw failed.");
    if (data.save) applyCloudSave(data.save);
    const allRewards = [...(data.results || []), ...(data.bonusRewards || [])];
    const revealRewards = data.loyaltyVoucherPulls ? [...allRewards, makeVoucherDisplayReward(packId, data.loyaltyVoucherPulls)] : allRewards;
    await playDrawReveal(pack, revealRewards, data.loyaltyVoucherPulls || (data.bonusRewards || []).length);
    displayDrawResults(pack, revealRewards);
    if (data.loyaltyVoucherPulls) {
      const message = gachaFormat(gachaFeatureText().loyaltyReceived, { count: data.loyaltyVoucherPulls });
      setSupplyPackStatus(message);
      showTaskToast(gachaFeatureText().bonusTitle, message);
    }
    else setSupplyPackStatus(`${data.voucherPullsUsed ? gachaUiText().voucherUsed : gachaFormat(gachaContentText().opened, { pack: localizedPackName(pack) })} ${gachaFormat(gachaFeatureText().dustReceived, { count: data.starDustEarned || pulls })}`);
  } catch (error) {
    setSupplyPackStatus(error.message || gachaContentText().drawFailed, true);
  } finally {
    document.getElementById("supplyPackSection")?.classList.remove("busy");
  }
}

function ensurePackContentsModal() {
  let modal = document.getElementById("packContentsModal");
  if (modal) return modal;
  modal = document.createElement("section");
  modal.id = "packContentsModal";
  modal.className = "pack-contents-modal";
  modal.hidden = true;
  modal.setAttribute("role", "dialog");
  modal.setAttribute("aria-modal", "true");
  document.body.appendChild(modal);
  modal.addEventListener("click", (event) => {
    if (event.target === modal || event.target.closest("[data-close-pack-contents]")) modal.hidden = true;
  });
  return modal;
}

function openPackContents(packId) {
  const pack = EXPANSION_PACKS[packId];
  if (!pack) return;
  const modal = ensurePackContentsModal();
  const feature = gachaFeatureText();
  modal.innerHTML = `<div class="pack-contents-panel"><header><div><span>${escapeHtml(gachaPackText(pack).kicker)}</span><h2>${escapeHtml(localizedPackName(pack))}</h2><p>${escapeHtml(feature.possibleRewards)}</p></div><button type="button" data-close-pack-contents aria-label="${escapeHtml(feature.close)}">×</button></header><ul>${pack.rewards.map((reward) => `<li><i>${escapeHtml(rewardEmblem(reward[3]))}</i><span>${escapeHtml(localizedRewardLabel(reward))}</span></li>`).join("")}</ul><button class="pack-contents-close" type="button" data-close-pack-contents>${escapeHtml(feature.close)}</button></div>`;
  modal.hidden = false;
  modal.querySelector("[data-close-pack-contents]")?.focus();
}

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    const modal = document.getElementById("packContentsModal");
    if (modal && !modal.hidden) modal.hidden = true;
  }
});

async function redeemStardust(offer) {
  const isTurret = offer === "turret";
  const cost = isTurret ? 50 : 100;
  const target = isTurret ? v2Progress.fragmentWishlist : ultimateProgress.fragmentWishlist;
  if (!target) return setSupplyPackStatus(gachaFeatureText().chooseWish, true);
  if (expansionProgress.starDust < cost) return setSupplyPackStatus(expansionText().need, true);
  document.getElementById("supplyPackSection")?.classList.add("busy");
  try {
    if (DEV_MODE) {
      expansionProgress.starDust -= cost;
      if (isTurret) window.grantSpaceTowerTurretFragments?.(target, 10, "stardust");
      else window.grantSpaceTowerUltimateFragments?.(target, 10, "stardust");
      saveExpansionProgress({ critical: true });
    } else {
      if (!playerSessionToken) throw new Error(expansionText().loginRequired);
      const response = await fetch(apiUrl("/api/shop/redeem-dust"), {
        method: "POST",
        headers: shopAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ offer, requestId: crypto.randomUUID() })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || gachaContentText().drawFailed);
      if (data.save) applyCloudSave(data.save);
    }
    setSupplyPackStatus(gachaFeatureText().redeemed);
  } catch (error) {
    setSupplyPackStatus(error.message || gachaContentText().drawFailed, true);
  } finally {
    document.getElementById("supplyPackSection")?.classList.remove("busy");
  }
}

function getTurretWishlistOptions() {
  return V2_TURRET_DEFS.filter((item) => !item.starterExclusive).map((item) => `<option value="${item.id}" ${v2Progress.fragmentWishlist === item.id ? "selected" : ""}>G${item.strengthGrade} · ${escapeHtml(item.name)}</option>`).join("");
}

function getUltimateWishlistOptions() {
  return ULTIMATE_DEFS.map((item) => `<option value="${item.id}" ${ultimateProgress.fragmentWishlist === item.id ? "selected" : ""}>${item.grade} · ${escapeHtml(getUltimateText(item)[0])}</option>`).join("");
}

function renderSupplyPacks() {
  const root = document.getElementById("supplyPackSection");
  if (homeStarDustLabel) homeStarDustLabel.textContent = gachaFeatureText().dust;
  if (homeStarDustValue) homeStarDustValue.textContent = formatCompactNumber(expansionProgress.starDust);
  if (!root) return;
  const content = gachaContentText();
  const feature = gachaFeatureText();
  root.innerHTML = `<header><span>${escapeHtml(content.storeKicker)}</span><h3>${escapeHtml(content.packsTitle)}</h3><p>${escapeHtml(expansionText().promo)}</p></header><section class="gacha-control-panel"><div class="gacha-wishlist"><label>${escapeHtml(feature.turretWish)}<select id="gachaTurretWishlist"><option value="">—</option>${getTurretWishlistOptions()}</select></label><label>${escapeHtml(feature.ultimateWish)}<select id="gachaUltimateWishlist"><option value="">—</option>${getUltimateWishlistOptions()}</select></label></div><div class="gacha-dust"><strong>✧ ${escapeHtml(feature.dust)} <b>${expansionProgress.starDust.toLocaleString()}</b></strong><button type="button" data-dust-offer="turret" ${expansionProgress.starDust < 50 || !v2Progress.fragmentWishlist ? "disabled" : ""}>${escapeHtml(feature.redeemTurret)}</button><button type="button" data-dust-offer="ultimate" ${expansionProgress.starDust < 100 || !ultimateProgress.fragmentWishlist ? "disabled" : ""}>${escapeHtml(feature.redeemUltimate)}</button></div><p>${escapeHtml(feature.milestones)}</p></section><div class="pack-status" aria-live="polite"></div><div class="supply-pack-grid"></div><div class="pack-results" aria-live="polite"></div>`;
  const grid = root.querySelector(".supply-pack-grid");
  for (const pack of Object.values(EXPANSION_PACKS)) {
    const packText = gachaPackText(pack);
    const currencyName = pack.currency === "obsidian" ? content.obsidian : content.spaceCoins;
    const voucherBalance = Math.max(0, Math.floor(Number(expansionProgress.packVouchers?.[pack.id]) || 0));
    const article = document.createElement("article");
    article.className = `supply-pack-card ${pack.id}`;
    const onePayment = voucherBalance >= 1 ? gachaUiText().voucher : `${pack.oneCost.toLocaleString()} ${currencyName}`;
    const tenPayment = voucherBalance >= 10 ? gachaUiText().voucher : `${pack.tenCost.toLocaleString()} ${currencyName}`;
    const paidPulls = expansionProgress[pack.id === "normal" ? "normalPaidPulls" : "supremePaidPulls"];
    const pityProgress = Math.min(9, Math.max(0, Math.floor(Number(expansionProgress.gachaPity?.[pack.id]) || 0)));
    const guaranteeRemaining = 10 - pityProgress;
    const supportProgress = paidPulls % 100;
    const supportReward = paidPulls < 100 ? 50 : 20;
    const pityLabel = gachaFormat(feature.guarantee, { current: pityProgress, target: 10, count: guaranteeRemaining });
    const giftLabel = gachaFormat(feature.support, { needed: 100, current: supportProgress, reward: supportReward });
    article.innerHTML = `<button class="pack-emblem" type="button" data-pack-info="${pack.id}" aria-label="${escapeHtml(feature.contents)}"><i></i><b>${pack.id === "normal" ? "✦" : "♛"}</b></button><div><small>${escapeHtml(packText.kicker)}</small><h4>${escapeHtml(packText.name)}</h4><p>${escapeHtml(packText.description)}</p><button class="pack-contents-trigger" type="button" data-pack-info="${pack.id}">${escapeHtml(feature.contents)}</button><div class="pack-progress"><label><span>${escapeHtml(pityLabel)}</span><progress max="10" value="${pityProgress}" aria-label="${escapeHtml(pityLabel)}"></progress></label><label><span>${escapeHtml(giftLabel)}</span><progress max="100" value="${supportProgress}" aria-label="${escapeHtml(giftLabel)}"></progress></label></div><div class="pack-voucher-balance"><span>${escapeHtml(gachaUiText().voucher)}</span><b>${voucherBalance.toLocaleString()} ${escapeHtml(gachaUiText().voucherUnit)}</b></div></div><div class="pack-actions"><button type="button" data-pack="${pack.id}" data-pulls="1">${escapeHtml(localizedPullCount(1))} · ${escapeHtml(onePayment)}</button><button type="button" data-pack="${pack.id}" data-pulls="10">${escapeHtml(localizedPullCount(10))} · ${escapeHtml(tenPayment)}</button></div>`;
    grid.appendChild(article);
  }
}

document.getElementById("supplyPackSection")?.addEventListener("click", (event) => {
  const info = event.target.closest("[data-pack-info]");
  if (info) return openPackContents(info.dataset.packInfo);
  const dust = event.target.closest("[data-dust-offer]");
  if (dust) return redeemStardust(dust.dataset.dustOffer);
  const button = event.target.closest("[data-pack][data-pulls]");
  if (button) drawSupplyPack(button.dataset.pack, Number(button.dataset.pulls));
});

document.getElementById("supplyPackSection")?.addEventListener("change", (event) => {
  if (event.target.id === "gachaTurretWishlist") {
    v2Progress.fragmentWishlist = V2_TURRET_DEFS.some((item) => !item.starterExclusive && item.id === event.target.value) ? event.target.value : "";
    saveV2Progress({ critical: true });
    renderSupplyPacks();
  }
  if (event.target.id === "gachaUltimateWishlist") {
    ultimateProgress.fragmentWishlist = ULTIMATE_DEFS.some((item) => item.id === event.target.value) ? event.target.value : "";
    saveUltimateProgress({ critical: true });
    renderSupplyPacks();
  }
});

const storeBackgroundTab = document.getElementById("storeBackgroundTab");
const storePacksTab = document.getElementById("storePacksTab");
const storeUtilitiesTab = document.getElementById("storeUtilitiesTab");
const storeMusicTab = document.getElementById("storeMusicTab");
const storeBackgroundSubpage = document.getElementById("storeBackgroundSubpage");
const storePacksSubpage = document.getElementById("storePacksSubpage");
const storeUtilitiesSubpage = document.getElementById("storeUtilitiesSubpage");
const storeMusicSubpage = document.getElementById("storeMusicSubpage");
const utilityStoreSection = document.getElementById("utilityStoreSection");
const musicStoreSection = document.getElementById("musicStoreSection");
const musicCredit = document.getElementById("musicCredit");
let musicPreviewAudio = null;

function expansionStoreText() { return EXPANSION_STORE_TEXT[currentLanguage] || EXPANSION_STORE_TEXT.en; }

function setStoreSection(section) {
  if (section === "utilities") renderUtilityStore();
  if (section === "music") renderMusicStore();
  if (section === "packs") renderSupplyPacks();
  for (const [id, tab, page] of [
    ["background", storeBackgroundTab, storeBackgroundSubpage],
    ["packs", storePacksTab, storePacksSubpage],
    ["utilities", storeUtilitiesTab, storeUtilitiesSubpage],
    ["music", storeMusicTab, storeMusicSubpage]
  ]) {
    const selected = section === id;
    tab?.setAttribute("aria-selected", String(selected));
    page?.classList.toggle("hidden", !selected);
    if (page) page.hidden = !selected;
  }
}

storeBackgroundTab?.addEventListener("click", () => setStoreSection("background"));
storePacksTab?.addEventListener("click", () => setStoreSection("packs"));
storeUtilitiesTab?.addEventListener("click", () => setStoreSection("utilities"));
storeMusicTab?.addEventListener("click", () => setStoreSection("music"));

function trackObsidianSpend(sink, itemId, amount) {
  window.spaceTowerTrackEvent?.("obsidian_spend", { sink, item_id: itemId, amount: Math.max(0, Math.floor(Number(amount) || 0)) });
}

function getConsumableCount(id) { return Math.max(0, Math.floor(Number(expansionProgress.consumables?.[id]) || 0)); }
function consumeConsumable(id) {
  if (!CONSUMABLE_IDS.includes(id) || getConsumableCount(id) < 1) return false;
  expansionProgress.consumables[id] -= 1;
  saveExpansionProgress({ critical: true });
  return true;
}

window.getSpaceTowerFusionStoneCount = () => expansionProgress.fusionStones;
window.consumeSpaceTowerFusionStones = (amount) => {
  const requested = Math.max(0, Math.floor(Number(amount) || 0));
  if (requested < 1 || expansionProgress.fusionStones < requested) return false;
  expansionProgress.fusionStones -= requested;
  saveExpansionProgress({ critical: true });
  return true;
};
window.getSpaceTowerReviveTicketCount = () => getConsumableCount("reviveTicket");
window.consumeSpaceTowerReviveTicket = () => consumeConsumable("reviveTicket");

function getUtilityDayKey(now = new Date()) {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getUtilityWeekKey(now = new Date()) {
  const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
  return getUtilityDayKey(monday);
}

function refreshUtilityClaimWindows() {
  const today = getUtilityDayKey();
  const week = getUtilityWeekKey();
  if (expansionProgress.utilityClaims.day !== today) {
    expansionProgress.utilityClaims.day = today;
    expansionProgress.utilityClaims.adClaims = 0;
  }
  if (expansionProgress.utilityClaims.week !== week) {
    expansionProgress.utilityClaims.week = week;
    expansionProgress.utilityClaims.purchases = Object.fromEntries(CONSUMABLE_IDS.map((id) => [id, 0]));
  }
  return expansionProgress.utilityClaims;
}

let utilityClaimBusy = false;

function renderUtilityStore() {
  if (!utilityStoreSection) return;
  const text = expansionStoreText();
  const unlocked = DEV_MODE || unlockedTier >= 5;
  const claims = refreshUtilityClaimWindows();
  const adRemaining = Math.max(0, UTILITY_AD_DAILY_LIMIT - claims.adClaims);
  window.setHomeStoreBadge?.(unlocked ? adRemaining : 0);
  const inventory = CONSUMABLE_IDS.map((id) => {
    const offer = UTILITY_OBSIDIAN_OFFERS[id];
    const bought = claims.purchases[id] || 0;
    const atWeeklyLimit = bought >= offer.weeklyLimit;
    const obsidianBuyUnlocked = !offer.rewardOnly;
    const buyDisabled = !obsidianBuyUnlocked || atWeeklyLimit || (!DEV_MODE && obsidian < offer.price);
    const buyLabel = !obsidianBuyUnlocked ? (window.spaceTowerUxText?.().rewardOnly || "Reward only") : atWeeklyLimit ? text.weeklyLimit : `${text.buy} · ${offer.price.toLocaleString()} OBS`;
    return `<article class="expansion-store-card"><h4>${escapeHtml((EXPANSION_REWARD_TEXT[currentLanguage] || EXPANSION_REWARD_TEXT.en)[id])}</h4><div class="store-card-balance"><span>${escapeHtml(text.owned)}</span><b>${getConsumableCount(id).toLocaleString()}</b></div><p>${escapeHtml(window.spaceTowerUtilityDescription?.(id) || "")}</p>${offer.rewardOnly ? "" : `<small>${escapeHtml(text.weekly)} ${bought}/${offer.weeklyLimit}</small>`}<div class="expansion-store-actions"><button class="secondary" type="button" data-claim-utility="${id}" ${adRemaining > 0 && !utilityClaimBusy ? "" : "disabled"}>${escapeHtml(text.watchAd)}</button><button type="button" data-buy-utility="${id}" ${buyDisabled ? "disabled" : ""}>${escapeHtml(buyLabel)}</button></div></article>`;
  }).join("");
  utilityStoreSection.innerHTML = `<header><span>${escapeHtml(text.utilityKicker)}</span><h3>${escapeHtml(text.utilityTitle)}</h3><p>${escapeHtml(window.spaceTowerUxText?.().utilityDescription || text.utilityDesc)}</p><strong>${escapeHtml(text.dailyAds)}：${adRemaining}/${UTILITY_AD_DAILY_LIMIT}</strong></header><div class="expansion-store-grid"><article class="expansion-store-card"><h4>◆ ${escapeHtml(text.fusion)}</h4><p>${escapeHtml(text.fusionDesc)}</p><div class="store-card-balance"><span>${escapeHtml(text.owned)}</span><b>${expansionProgress.fusionStones.toLocaleString()}</b></div><div class="expansion-store-actions"><button type="button" data-buy-fusion ${unlocked && (DEV_MODE || spaceCoins >= FUSION_STONE_PRICE) ? "" : "disabled"}>${escapeHtml(unlocked ? `${text.buy} · ${FUSION_STONE_PRICE.toLocaleString()} ${getSpaceCoinName()}` : text.lockedTier)}</button></div></article>${inventory}</div>`;
}

function buyFusionStone() {
  const text = expansionStoreText();
  if (!DEV_MODE && unlockedTier < 5) return;
  if (!DEV_MODE && spaceCoins < FUSION_STONE_PRICE) { showTaskToast(text.fusion, text.need); return; }
  if (!DEV_MODE) spaceCoins -= FUSION_STONE_PRICE;
  expansionProgress.fusionStones += 1;
  saveSpaceCoins({ critical: true });
  saveExpansionProgress({ critical: true });
  showTaskToast(text.fusion, `${text.bought} · +1`);
}

async function claimUtilityWithAd(id) {
  if (!CONSUMABLE_IDS.includes(id) || utilityClaimBusy) return;
  const text = expansionStoreText();
  const claims = refreshUtilityClaimWindows();
  if (claims.adClaims >= UTILITY_AD_DAILY_LIMIT) return;
  utilityClaimBusy = true;
  renderUtilityStore();
  let completed = false;
  try { completed = await window.showRewardedAd?.("utility_consumable"); }
  catch (error) { window.spaceTowerRecordException?.(error, { feature: "utility_reward" }); }
  finally { utilityClaimBusy = false; }
  const currentClaims = refreshUtilityClaimWindows();
  if (!completed) {
    renderUtilityStore();
    showTaskToast((EXPANSION_REWARD_TEXT[currentLanguage] || EXPANSION_REWARD_TEXT.en)[id], text.adFailed);
    return;
  }
  if (currentClaims.adClaims >= UTILITY_AD_DAILY_LIMIT) { renderUtilityStore(); return; }
  currentClaims.adClaims += 1;
  expansionProgress.consumables[id] += 1;
  window.spaceTowerTrackEvent?.("utility_rewarded_claim", { item_id: id, daily_claim: currentClaims.adClaims });
  saveExpansionProgress({ critical: true });
  showTaskToast((EXPANSION_REWARD_TEXT[currentLanguage] || EXPANSION_REWARD_TEXT.en)[id], `${text.claimed} · +1`);
}

function buyUtilityWithObsidian(id) {
  const offer = UTILITY_OBSIDIAN_OFFERS[id];
  if (!offer || offer.rewardOnly) return;
  const text = expansionStoreText();
  const claims = refreshUtilityClaimWindows();

  if ((claims.purchases[id] || 0) >= offer.weeklyLimit) { showTaskToast(text.utilities, text.weeklyLimit); return; }
  if (!DEV_MODE && obsidian < offer.price) { showTaskToast(text.utilities, text.need); return; }
  if (!DEV_MODE) obsidian -= offer.price;
  claims.purchases[id] += 1;
  expansionProgress.consumables[id] += 1;
  trackObsidianSpend("utility_store", id, offer.price);
  saveObsidian({ critical: true });
  saveExpansionProgress({ critical: true });
  showTaskToast((EXPANSION_REWARD_TEXT[currentLanguage] || EXPANSION_REWARD_TEXT.en)[id], `${text.bought} · +1`);
}

function getMusicTrack(id) { return ORIGINAL_MUSIC_CATALOG.find((track) => track.id === id) || null; }
function localizedMusicName(track) { return currentLanguage === "zh" ? track.zhName : track.name; }
window.getSpaceTowerEquippedMusicUrl = () => getMusicTrack(expansionProgress.equippedMusic)?.asset || "assets/music/echoes-of-lumen.ogg";
window.getSpaceTowerEquippedMusicTitle = () => localizedMusicName(getMusicTrack(expansionProgress.equippedMusic) || { name: "Echoes of Lumen", zhName: "流明回響" });
window.getSpaceTowerMusicRewardMultiplier = () => getMusicTrack(expansionProgress.equippedMusic) ? 1.02 : 1;

function restartEquippedMusic() {
  if (bgmAudio) bgmAudio.pause();
  bgmAudio = null;
  bgmFileFailed = false;
  if (userSettings.bgm && audioCtx) startBgm();
  renderMusicCredit();
}

function renderMusicCredit() {
  if (!musicCredit) return;
  const original = currentLanguage === "zh" ? "原創音樂" : "ORIGINAL MUSIC";
  musicCredit.textContent = `${original} · ${window.getSpaceTowerEquippedMusicTitle()}`;
}

function renderMusicStore() {
  if (!musicStoreSection) return;
  const text = expansionStoreText();
  musicStoreSection.innerHTML = `<header><span>${escapeHtml(text.musicKicker)}</span><h3>${escapeHtml(text.musicTitle)}</h3><p>${escapeHtml(text.musicDesc)}</p></header><div class="expansion-store-grid">${ORIGINAL_MUSIC_CATALOG.map((track) => {
    const owned = expansionProgress.ownedMusic.includes(track.id);
    const equipped = expansionProgress.equippedMusic === track.id;
    return `<article class="expansion-store-card music"><small>ORIGINAL LOOP</small><h4>${escapeHtml(localizedMusicName(track))}</h4><p>${escapeHtml(track.name)}</p><strong>${escapeHtml(text.musicBonus)}</strong><div class="expansion-store-actions"><button class="secondary" type="button" data-preview-music="${track.id}">${escapeHtml(text.preview)}</button><button type="button" data-music-action="${track.id}" ${!owned && !DEV_MODE && obsidian < MUSIC_TRACK_PRICE ? "disabled" : ""}>${escapeHtml(equipped ? text.equipped : owned ? text.equip : `${text.buy} · ${MUSIC_TRACK_PRICE.toLocaleString()} OBS`)}</button></div></article>`;
  }).join("")}</div>`;
}

function previewMusic(trackId) {
  const track = getMusicTrack(trackId);
  if (!track) return;
  musicPreviewAudio?.pause();
  musicPreviewAudio = new Audio(track.asset);
  musicPreviewAudio.volume = clamp(userSettings.volume * 0.55, 0, 1);
  musicPreviewAudio.play().catch(() => {});
  window.setTimeout(() => { if (musicPreviewAudio) { musicPreviewAudio.pause(); musicPreviewAudio = null; } }, 15000);
}

function buyOrEquipMusic(trackId) {
  const track = getMusicTrack(trackId);
  if (!track) return;
  const text = expansionStoreText();
  if (!expansionProgress.ownedMusic.includes(track.id)) {
    if (!DEV_MODE && obsidian < MUSIC_TRACK_PRICE) { showTaskToast(text.music, text.need); return; }
    if (!DEV_MODE) obsidian -= MUSIC_TRACK_PRICE;
    expansionProgress.ownedMusic.push(track.id);
    saveObsidian({ critical: true });
    trackObsidianSpend("music_store", track.id, MUSIC_TRACK_PRICE);
  }
  expansionProgress.equippedMusic = track.id;
  saveExpansionProgress({ critical: true });
  restartEquippedMusic();
  showTaskToast(localizedMusicName(track), text.equipped);
}

utilityStoreSection?.addEventListener("click", (event) => {
  if (event.target.closest("[data-buy-fusion]")) buyFusionStone();
  const claim = event.target.closest("[data-claim-utility]");
  if (claim) void claimUtilityWithAd(claim.dataset.claimUtility);
  const buy = event.target.closest("[data-buy-utility]");
  if (buy) buyUtilityWithObsidian(buy.dataset.buyUtility);
});
musicStoreSection?.addEventListener("click", (event) => {
  const preview = event.target.closest("[data-preview-music]");
  if (preview) previewMusic(preview.dataset.previewMusic);
  const action = event.target.closest("[data-music-action]");
  if (action) buyOrEquipMusic(action.dataset.musicAction);
});

function createRunConsumableState() {
  return { obsidianDouble: false, obsidianDoubleApplied: false, freeUpgrade: false, goldDouble: false, stageProtectionThroughWave: 0, stageProtectionUsed: false };
}
let runConsumables = createRunConsumableState();

window.getSpaceTowerRunConsumableState = () => ({ ...runConsumables });
window.restoreSpaceTowerRunConsumableState = (raw) => {
  runConsumables = { ...createRunConsumableState(), ...(raw && typeof raw === "object" ? raw : {}) };
  renderConsumableDock();
};
window.isSpaceTowerGoldDoubleActive = (waveNumber = wave) => runConsumables.goldDouble && Number(waveNumber) <= 200;
window.isSpaceTowerFreeUpgradeActive = () => runConsumables.freeUpgrade;
window.consumeSpaceTowerFreeUpgrade = () => {
  if (!runConsumables.freeUpgrade) return false;
  runConsumables.freeUpgrade = false;
  renderConsumableDock();
  return true;
};

const CONSUMABLE_DOCK_TEXT = Object.freeze({
  zh: { drawer: "戰備", obsidianDoubleVoucher: "黑曜石 +50%", skipWaveVoucher: "跳過此波", freeUpgradeVoucher: "免費升級", goldDoubleVoucher: "金幣 ×2", bossSealVoucher: "封印 Boss", stageProtectionVoucher: "保護 5 波", used: "已啟用", activation: "已啟動", unavailable: "目前不可使用" },
  en: { drawer: "GEAR", obsidianDoubleVoucher: "Obsidian +50%", skipWaveVoucher: "Skip Wave", freeUpgradeVoucher: "Free Upgrade", goldDoubleVoucher: "Gold ×2", bossSealVoucher: "Seal Boss", stageProtectionVoucher: "Shield 5 Waves", used: "Activated", activation: "Activated", unavailable: "Unavailable now" },
  ja: { drawer: "装備", obsidianDoubleVoucher: "黒曜石 +50%", skipWaveVoucher: "ウェーブスキップ", freeUpgradeVoucher: "無料強化", goldDoubleVoucher: "金貨 ×2", bossSealVoucher: "Boss封印", stageProtectionVoucher: "5ウェーブ保護", used: "有効", activation: "発動", unavailable: "今は使用不可" },
  ko: { drawer: "장비", obsidianDoubleVoucher: "흑요석 +50%", skipWaveVoucher: "웨이브 스킵", freeUpgradeVoucher: "무료 강화", goldDoubleVoucher: "골드 ×2", bossSealVoucher: "Boss 봉인", stageProtectionVoucher: "5웨이브 보호", used: "활성화", activation: "활성화", unavailable: "지금 사용 불가" },
  ru: { drawer: "СНАР.", obsidianDoubleVoucher: "Обсидиан +50%", skipWaveVoucher: "Пропустить", freeUpgradeVoucher: "Бесплатное усиление", goldDoubleVoucher: "Золото ×2", bossSealVoucher: "Печать босса", stageProtectionVoucher: "Защита 5 волн", used: "Активно", activation: "Активировано", unavailable: "Сейчас недоступно" },
  es: { drawer: "EQUIPO", obsidianDoubleVoucher: "Obsidiana +50%", skipWaveVoucher: "Saltar oleada", freeUpgradeVoucher: "Mejora gratis", goldDoubleVoucher: "Oro ×2", bossSealVoucher: "Sellar jefe", stageProtectionVoucher: "Protección 5 oleadas", used: "Activado", activation: "Efecto activo", unavailable: "No disponible ahora" }
});

function consumableDockText() { return CONSUMABLE_DOCK_TEXT[currentLanguage] || CONSUMABLE_DOCK_TEXT.en; }
function consumableActivationTitle(id) {
  const text = consumableDockText();
  return `${text[id]} · ${text.activation}`;
}
function isBossPresent() { return enemies.some((enemy) => enemy?.isBoss && enemy.hp > 0); }
function isConsumableAlreadyActivated(id) {
  if (id === "obsidianDoubleVoucher") return runConsumables.obsidianDouble || getBattleObsidianRemaining("multiplier") <= 0;
  if (id === "goldDoubleVoucher") return runConsumables.goldDouble;
  if (id === "freeUpgradeVoucher") return runConsumables.freeUpgrade;
  if (id === "stageProtectionVoucher") return runConsumables.stageProtectionUsed;
  return false;
}
function isConsumableActionDisabled(id) {
  if (getConsumableCount(id) < 1) return true;
  if (id === "obsidianDoubleVoucher") return runConsumables.obsidianDouble || getBattleObsidianRemaining("multiplier") <= 0;
  if (id === "goldDoubleVoucher") return runConsumables.goldDouble || wave > 200;
  if (id === "freeUpgradeVoucher") return runConsumables.freeUpgrade;
  if (id === "stageProtectionVoucher") return runConsumables.stageProtectionUsed;
  if (id === "skipWaveVoucher") return Boolean(getBossTypeForWave(wave)) || isBossPresent();
  if (id === "bossSealVoucher") return !isBossPresent();
  return false;
}

let consumableDrawerOpen = false;

function setConsumableDrawer(open) {
  consumableDrawerOpen = Boolean(open);
  const drawer = document.getElementById("consumableDrawer");
  const toggle = document.getElementById("consumableDrawerToggle");
  drawer?.classList.toggle("open", consumableDrawerOpen);
  toggle?.setAttribute("aria-expanded", String(consumableDrawerOpen));
}

function renderConsumableDock() {
  const drawer = document.getElementById("consumableDrawer");
  const dock = document.getElementById("consumableDock");
  const toggle = document.getElementById("consumableDrawerToggle");
  const label = document.getElementById("consumableDrawerLabel");
  const count = document.getElementById("consumableDrawerCount");
  if (!drawer || !dock || !toggle || !label || !count) return;
  const text = consumableDockText();
  const ids = ["obsidianDoubleVoucher", "skipWaveVoucher", "freeUpgradeVoucher", "goldDoubleVoucher", "bossSealVoucher", "stageProtectionVoucher"]
    .filter((id) => getConsumableCount(id) > 0 && !isConsumableAlreadyActivated(id));
  drawer.hidden = !gameStarted || !running || !document.body.classList.contains("in-game") || ids.length === 0;
  if (drawer.hidden) {
    dock.innerHTML = "";
    setConsumableDrawer(false);
    return;
  }
  label.textContent = text.drawer;
  count.textContent = String(ids.length);
  drawer.classList.toggle("open", consumableDrawerOpen);
  toggle.setAttribute("aria-expanded", String(consumableDrawerOpen));
  dock.innerHTML = ids.map((id) => `<button type="button" data-consumable-action="${id}" ${isConsumableActionDisabled(id) ? "disabled" : ""}>${escapeHtml(text[id])}<b>×${getConsumableCount(id)}</b></button>`).join("");
}

let consumableEffectTimer = 0;
function playConsumableEffect(id, title, detail = "") {
  const stage = document.getElementById("consumableEffectStage");
  if (!stage) return;
  window.clearTimeout(consumableEffectTimer);
  const kind = id === "goldDoubleVoucher" ? "gold"
    : id === "obsidianDoubleVoucher" ? "obsidian"
      : id === "skipWaveVoucher" ? "skip"
        : id === "bossSealVoucher" ? "boss"
          : id === "stageProtectionVoucher" ? "protection" : "upgrade";
  const colors = { gold: "#f4bd28", obsidian: "#4b136e", skip: "#6deaff", boss: "#ff71df", protection: "#65eeff", upgrade: "#7ff4d9" };
  const usesHexActivation = kind === "gold" || kind === "obsidian";
  let hexField = "";
  if (usesHexActivation) {
    const hexWidth = Math.max(44, Math.min(76, Math.min(window.innerWidth, window.innerHeight) * 0.12));
    const hexHeight = hexWidth * 0.866;
    const horizontalStep = hexWidth * 0.755;
    const columns = Math.ceil(window.innerWidth / horizontalStep) + 3;
    const rows = Math.ceil(window.innerHeight / hexHeight) + 3;
    const cells = [];
    for (let column = 0; column < columns; column += 1) {
      for (let row = 0; row < rows; row += 1) {
        const left = column * horizontalStep - hexWidth;
        const top = row * hexHeight + (column % 2 ? hexHeight * 0.5 : 0) - hexHeight;
        const delay = Math.min(0.48, (column / Math.max(1, columns - 1)) * 0.3 + (row / Math.max(1, rows - 1)) * 0.18);
        const tone = (column * 3 + row * 5) % 4;
        cells.push(`<i class="voucher-hex" style="left:${left.toFixed(1)}px;top:${top.toFixed(1)}px;width:${hexWidth.toFixed(1)}px;height:${hexHeight.toFixed(1)}px;--delay:${delay.toFixed(3)}s;--tone:${tone}"></i>`);
      }
    }
    hexField = `<div class="voucher-hex-field" aria-hidden="true">${cells.join("")}</div>`;
  }
  stage.className = `consumable-effect-stage effect-${kind}`;
  stage.style.setProperty("--effect-color", colors[kind]);
  stage.innerHTML = `${hexField}<div class="effect-title">${escapeHtml(title)}${detail ? `<small>${escapeHtml(detail)}</small>` : ""}</div>`;
  stage.hidden = false;
  consumableEffectTimer = window.setTimeout(() => { stage.hidden = true; stage.innerHTML = ""; }, usesHexActivation ? 2050 : 1750);
}

function activateRunConsumable(id) {
  if (!gameStarted || !running || isConsumableActionDisabled(id)) { showTaskToast(consumableDockText()[id] || "", consumableDockText().unavailable); return; }
  if (!consumeConsumable(id)) return;
  if (id === "obsidianDoubleVoucher") runConsumables.obsidianDouble = true;
  if (id === "goldDoubleVoucher") runConsumables.goldDouble = true;
  if (id === "freeUpgradeVoucher") runConsumables.freeUpgrade = true;
  if (id === "stageProtectionVoucher") {
    runConsumables.stageProtectionUsed = true;
    runConsumables.stageProtectionThroughWave = wave + 4;
  }
  if (id === "skipWaveVoucher") {
    playConsumableEffect(id, consumableDockText()[id], `WAVE ${wave} → ${wave + 1}`);
    enemies = [];
    bullets = [];
    enemiesSpawned = getBasicEnemyStats(wave).count;
    wavePauseTimer = Math.max(wavePauseTimer, RUNTIME_BALANCE.wave.pause);
  }
  if (id === "bossSealVoucher") {
    for (const enemy of enemies) {
      if (!enemy?.isBoss || enemy.hp <= 0) continue;
      enemy.bossSealTimer = 2.6;
      enemy.contactCooldown = Math.max(Number(enemy.contactCooldown) || 0, 3);
    }
    bossWarning = null;
  }
  if (id !== "skipWaveVoucher") playConsumableEffect(id, consumableActivationTitle(id));
  window.spaceTowerTrackEvent?.("consumable_use", { item_id: id, wave, tier: activeRunTier });
  showTaskToast(consumableDockText()[id], consumableDockText().used);
  setConsumableDrawer(false);
  renderConsumableDock();
}

document.getElementById("consumableDrawerToggle")?.addEventListener("click", () => {
  setConsumableDrawer(!consumableDrawerOpen);
});
document.getElementById("consumableDock")?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-consumable-action]");
  if (button) activateRunConsumable(button.dataset.consumableAction);
});
document.addEventListener("pointerdown", (event) => {
  if (consumableDrawerOpen && !event.target.closest("#consumableDrawer")) setConsumableDrawer(false);
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && consumableDrawerOpen) setConsumableDrawer(false);
});

const expansionBaseUpdateBossMovement = updateBossMovement;
updateBossMovement = function (enemy, angle, controlSlow, dt) {
  if (enemy?.bossSealTimer > 0) return;
  return expansionBaseUpdateBossMovement(enemy, angle, controlSlow, dt);
};
const expansionBaseUpdateBossSpecial = updateBossSpecial;
updateBossSpecial = function (enemy, dt) {
  if (enemy?.bossSealTimer > 0) return;
  return expansionBaseUpdateBossSpecial(enemy, dt);
};

const expansionBaseUpdateForConsumables = update;
update = function (dt) {
  for (const enemy of enemies) {
    if (!enemy?.isBoss || !(enemy.bossSealTimer > 0)) continue;
    enemy.bossSealTimer = Math.max(0, enemy.bossSealTimer - dt);
    if (enemy.bossSealTimer <= 0) {
      enemy.hp = 0;
      pushVisualEffect(shockwaves, 48, { x: enemy.x, y: enemy.y, r: enemy.size * 0.8, life: 0.8, maxLife: 0.8, color: "#ff74df", emp: true });
    }
  }
  return expansionBaseUpdateForConsumables(dt);
};

const expansionBaseDrawEnemiesForSeal = drawEnemies;
drawEnemies = function () {
  expansionBaseDrawEnemiesForSeal();
  const now = performance.now() * 0.006;
  for (const enemy of enemies) {
    if (!enemy?.isBoss || !(enemy.bossSealTimer > 0)) continue;
    const radius = enemy.size * (1.15 + Math.sin(now * 1.7) * 0.05) * battleVisualScale;
    ctx.save();
    ctx.translate(enemy.x, enemy.y);
    ctx.strokeStyle = "rgba(255,113,223,.96)";
    ctx.fillStyle = "rgba(122,45,191,.12)";
    ctx.shadowBlur = 24;
    ctx.shadowColor = "#ff5cdb";
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let side = 0; side < 6; side += 1) {
      const angle = -Math.PI / 2 + side * Math.PI / 3;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      if (side === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.rotate(-now * 0.45);
    ctx.setLineDash([8, 7]);
    ctx.beginPath();
    ctx.arc(0, 0, radius * 1.3, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = "#fff0fc";
    ctx.font = `900 ${Math.max(18, enemy.size * 0.52)}px serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("封", 0, 0);
    ctx.restore();
  }
};

const expansionBaseDrawEffectsForConsumables = drawEffects;
drawEffects = function () {
  expansionBaseDrawEffectsForConsumables();
  if (!gameStarted || !running || !tower) return;
  const now = performance.now() * 0.001;
  ctx.save();
  if (runConsumables.stageProtectionThroughWave >= wave) {
    const radius = tower.radius * 2.25 + Math.sin(now * 3.1) * 4;
    ctx.translate(tower.x, tower.y);
    ctx.rotate(-0.45 + Math.sin(now * 0.7) * 0.08);
    ctx.globalAlpha = 0.72;
    ctx.strokeStyle = "#76efff";
    ctx.shadowBlur = 24;
    ctx.shadowColor = "#52dcff";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(0, 0, radius, -Math.PI * 0.82, Math.PI * 0.82);
    ctx.stroke();
    ctx.globalAlpha = 0.18;
    ctx.lineWidth = 13;
    ctx.stroke();
  }
  ctx.restore();
};

const expansionBaseApplyCoreDamage = applyCoreDamage;
applyCoreDamage = function (damage, x, y, options = {}) {
  const protectedWave = runConsumables.stageProtectionThroughWave >= wave;
  const sourceEnemy = options?.sourceEnemy;
  if (protectedWave && !sourceEnemy?.isBoss) return 0;
  return expansionBaseApplyCoreDamage(damage, x, y, options);
};

const expansionBaseEndRun = endRun;
endRun = function () {
  if (running && runConsumables.obsidianDouble && !runConsumables.obsidianDoubleApplied) {
    const bonus = Math.min(15, Math.max(0, Math.floor((Number(runStats?.obsidianEarned) || 0) * 0.5)));
    runConsumables.obsidianDoubleApplied = true;
    if (bonus > 0) {
      window.grantSpaceTowerBattleObsidian?.(bonus, "multiplier");
    }
  }
  return expansionBaseEndRun();
};

const expansionBaseResetGame = resetGame;
resetGame = function () {
  runConsumables = createRunConsumableState();
  const result = expansionBaseResetGame();
  renderConsumableDock();
  return result;
};

const expansionBaseUpdateHud = updateHud;
updateHud = function () {
  const result = expansionBaseUpdateHud();
  renderConsumableDock();
  return result;
};

const expansionBaseGetLocalSavePayload = getLocalSavePayload;
getLocalSavePayload = function () { return { ...expansionBaseGetLocalSavePayload(), expansionProgress: normalizeExpansionProgress(expansionProgress) }; };
const expansionBaseGetStableSavePayload = getStableSavePayload;
getStableSavePayload = function () {
  const stable = JSON.parse(expansionBaseGetStableSavePayload());
  stable.expansionProgress = normalizeExpansionProgress(expansionProgress);
  return JSON.stringify(stable);
};
const expansionBaseApplyCloudSave = applyCloudSave;
applyCloudSave = function (save, options = {}) {
  expansionBaseApplyCloudSave(save, options);
  if (!save?.expansionProgress) return;
  const remote = normalizeExpansionProgress(save.expansionProgress);
  const local = normalizeExpansionProgress(expansionProgress);
  expansionProgress = options.replaceLocalProgress === true || remote.revision > local.revision ? remote : local;
  localStorage.setItem(EXPANSION_SAVE_KEY, JSON.stringify(expansionProgress));
  renderSpeedLicenses();
  renderSupplyPacks();
  renderUtilityStore();
  renderMusicStore();
  renderConsumableDock();
  renderLaunchMailbox?.();
};

window.updateDeploymentButton = function () {
  const button = document.getElementById("deploymentButton");
  if (!button) return;
  let hasCheckpoint = false;
  try { hasCheckpoint = Boolean(loadActiveRunCheckpoint?.()); } catch { hasCheckpoint = false; }
  const continueLabels = { zh: "繼續出擊", en: "Continue Deployment", ja: "出撃を続ける", ko: "계속 출격", ru: "Продолжить вылет", es: "Continuar despliegue" };
  button.textContent = hasCheckpoint ? expansionText().resume : (continueLabels[currentLanguage] || continueLabels.en);
};

function refreshExpansionLanguage() {
  const tab = document.getElementById("homeUltimateTab");
  if (tab) tab.textContent = expansionText().ultimate;
  if (storeBackgroundTab) storeBackgroundTab.textContent = gachaUiText().storeBackground;
  if (storePacksTab) storePacksTab.textContent = gachaUiText().storePacks;
  if (storeUtilitiesTab) storeUtilitiesTab.textContent = expansionStoreText().utilities;
  if (storeMusicTab) storeMusicTab.textContent = expansionStoreText().music;
  window.updateDeploymentButton();
  renderSpeedLicenses();
  renderSupplyPacks();
  renderUtilityStore();
  renderMusicStore();
  renderConsumableDock();
  renderMusicCredit();
}

window.addEventListener("space-tower-language-changed", refreshExpansionLanguage);
window.addEventListener("space-tower-cloud-save-applied", () => { renderSpeedLicenses(); renderSupplyPacks(); renderUtilityStore(); renderMusicStore(); renderConsumableDock(); renderLaunchMailbox?.(); });
window.SPACE_TOWER_GACHA_PACKS = EXPANSION_PACKS;
window.SPACE_TOWER_LAUNCH_PROMO_ACTIVE = CLOSED_TEST_LAUNCH_PROMO_ACTIVE;
refreshExpansionLanguage();
