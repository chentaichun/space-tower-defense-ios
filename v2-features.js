/* Space Tower Defense v2 systems.
   Loaded after the original game so old saves and the live v1 runtime stay compatible. */

const V2_SAVE_KEY = "spaceTowerV2Progress";
const V2_FRAGMENT_TARGET = 50;
const V2_FRAGMENT_PITY_TARGET = 120;
const V2_WISHLIST_DROP_RATE = 0.68;
const V2_TURRET_MAX_STARS = 5;
const V2_CARD_MAX_STARS = 5;
const V2_TURRET_CORE_DROP_BASE = 0.00001;
const V2_TURRET_CORE_TIER_MULTIPLIER = 1.1;
const V2_TURRET_CORE_REQUIREMENTS = Object.freeze([3, 5, 10, 20]);
const AUTO_UPGRADE_KEY = "spaceTowerAutoUpgradeV1";
const BASE_AUTO_UPGRADE_IDS = ["attack", "magic", "speed", "hp", "regen", "critChance", "critDamage"];
const AUTO_UPGRADE_IDS = [
  ...BASE_AUTO_UPGRADE_IDS,
  "defenseRate", "physicalArmor", "magicArmor", "slowModule", "knockbackModule", "reflectModule",
  "mineRadius", "mineChance", "fighterCap", "waveGold", "goldMultiplier", "waveObsidian", "medkit",
  "barrageExpansion", "giantBloodline", "spellbladeTraining", "bloodCrit", "deepFreeze", "orbitA",
  "orbitB", "staticField", "demolitionExpert", "allIn", "energySaver", "curseAura"
];
const V2_BACKGROUND_PRICE = 10000;
const V2_BACKGROUND_REWARD_MULTIPLIER = 1.02;
const V2_BACKGROUND_DEFS = [
  { id: "gilded_citadel", asset: "assets/backgrounds/gilded-citadel.webp", accent: "#ffd36e" },
  { id: "obsidian_singularity", asset: "assets/backgrounds/obsidian-singularity.webp", accent: "#b58cff" },
  { id: "aurora_garden", asset: "assets/backgrounds/aurora-quantum-garden.webp", accent: "#65f5e0" },
  { id: "crimson_event_horizon", asset: "assets/backgrounds/crimson-event-horizon.webp", accent: "#ff5b78" },
  { id: "emerald_machine_world", asset: "assets/backgrounds/emerald-machine-world.webp", accent: "#62f7aa" },
  { id: "glacial_star_cathedral", asset: "assets/backgrounds/glacial-star-cathedral.webp", accent: "#91e8ff" },
  { id: "solar_forge_throne", asset: "assets/backgrounds/solar-forge-throne.webp", accent: "#ffb45e" },
  { id: "neon_orbit_metropolis", asset: "assets/backgrounds/neon-orbit-metropolis.webp", accent: "#5cf2ff" },
  { id: "astral_ruins_sanctum", asset: "assets/backgrounds/astral-ruins-sanctum.webp", accent: "#e9ca78" },
  { id: "prismatic_wormhole", asset: "assets/backgrounds/prismatic-wormhole.webp", accent: "#d28cff" },
  { id: "obsidian_crown_throne", asset: "assets/backgrounds/obsidian-crown-throne-v2.webp", accent: "#d9a9ff", vipExclusive: true }
];
const v2BackgroundImages = new Map();

function getV2BackgroundImage(definition) {
  if (!definition || typeof Image === "undefined") return null;
  if (!v2BackgroundImages.has(definition.id)) {
    const image = new Image();
    image.decoding = "async";
    image.src = definition.asset;
    v2BackgroundImages.set(definition.id, image);
  }
  return v2BackgroundImages.get(definition.id);
}

function normalizeAutoUpgradeConfig(raw) {
  const source = raw && typeof raw === "object" ? raw : {};
  const threshold = Number(source.threshold);
  const sequence = Array.isArray(source.sequence)
    ? source.sequence.filter((id, index, items) => AUTO_UPGRADE_IDS.includes(id) && items.indexOf(id) === index)
    : [];
  return {
    enabled: source.enabled === true,
    threshold: clamp(Math.floor(Number.isFinite(threshold) ? threshold : 100), 0, 999999999),
    sequence: sequence.length ? sequence : ["attack", "magic", "speed"]
  };
}

function loadAutoUpgradeConfig() {
  try {
    return normalizeAutoUpgradeConfig(JSON.parse(localStorage.getItem(AUTO_UPGRADE_KEY) || "null"));
  } catch {
    localStorage.removeItem(AUTO_UPGRADE_KEY);
    return normalizeAutoUpgradeConfig();
  }
}

let autoUpgradeConfig = loadAutoUpgradeConfig();
let autoUpgradeIndex = 0;
let autoUpgradeLastPurchaseAt = 0;

const V2_ENEMY_TEXT = {
  basic: ["基礎突擊機", "標準直線突擊單位。", ["基礎", "直線"]],
  runner: ["高速突擊機", "速度快、裝甲薄，會迅速壓縮反應時間。", ["高速", "輕甲"]],
  swarm: ["蜂群戰機", "成群進場，以數量穿透單點火力。", ["群體", "輕型"]],
  tank: ["重甲攻城艦", "高生命、低速度，撞擊威力極高。", ["重甲", "高傷"]],
  armored: ["裝甲戰機", "物理裝甲優秀，魔法傷害更容易處理。", ["物防", "菁英"]],
  berserker: ["狂熱戰機", "生命越低速度越快，殘血時會瘋狂突進。", ["狂暴", "加速"]],
  erratic: ["亂流戰機", "以不規則曲線前進，會擾亂主砲瞄準節奏。", ["閃避", "變軌"]],
  splitter: ["分裂母體", "被摧毀後分裂成兩架高速幼體。", ["分裂", "增殖"]],
  ranged: ["遠程砲擊機", "停在核心外圍發射魔法光束，必須優先擊落。", ["遠程", "魔傷"]],
  healer: ["維修支援機", "緩慢前進並定期修復附近受傷戰機。", ["治療", "支援"]],
  full_shield: ["全域護盾機", "可破壞的全向護盾會先吸收所有攻擊。", ["護盾", "全向"]],
  buffer: ["超頻領航機", "留下加速航跡，經過的敵軍會獲得移速與防禦增益。", ["增益", "航跡"]],
  frontal_shield: ["弧盾護衛機", "不可破壞的前方弧盾阻擋直射砲火，範圍攻擊可繞過。", ["前盾", "護衛"]]
};

const V2_ENVIRONMENTS = [
  { id: "solar", name: "太陽風暴", color: "#ff9f5a", description: "雙方推進加速，主砲攻速 +12%。" },
  { id: "nebula", name: "離子星霧", color: "#b88cff", description: "偵測範圍 -12%，魔法傷害 +18%。" },
  { id: "gravity", name: "重力裂隙", color: "#62e8ff", description: "敵軍移速 -10%，擊退效果增強。" },
  { id: "crystal", name: "晶體碎帶", color: "#85ffb6", description: "物理傷害 +10%，敵軍裝甲 +6%。" }
];

const V2_FRAGMENT_CHANCE_BY_GRADE = {
  1: 0.001333,
  2: 0.000941,
  3: 0.0007,
  4: 0.000565,
  5: 0.00037,
  6: 0.000281,
  7: 0.0001,
  8: 0.00004
};

function getV2FragmentChance(grade) {
  const bundled = V2_FRAGMENT_CHANCE_BY_GRADE[grade] || 0;
  const live = Number(window.SPACE_TOWER_RUNTIME_BALANCE?.v2?.fragmentChanceByGrade?.[grade]);
  return Number.isFinite(live) && live >= 0 ? Math.min(live, bundled) : bundled;
}

function getV2FragmentTarget() {
  const live = Number(window.SPACE_TOWER_RUNTIME_BALANCE?.v2?.fragmentTarget);
  // The v2.7 progression contract requires 50 shards per star.  Older live
  // balance payloads used 20 and must not silently restore that retired rule.
  return Number.isFinite(live) && live > 0 ? Math.max(V2_FRAGMENT_TARGET, Math.floor(live)) : V2_FRAGMENT_TARGET;
}

function getTurretFragmentTarget(turret) {
  return turret?.rarity === "legendary" ? 100 : getV2FragmentTarget();
}

function getV2TurretMaxStars() {
  const live = Number(window.SPACE_TOWER_RUNTIME_BALANCE?.v2?.maxStars);
  return clamp(Number.isFinite(live) ? Math.floor(live) : V2_TURRET_MAX_STARS, 1, V2_TURRET_MAX_STARS);
}

const V2_TURRET_STAR_TEXT = Object.freeze({
  zh: { rankUp: "升星", max: "滿星", core: "專屬晶核", fusion: "融合石", noCore: "首星免晶核", bonus: "第 1 星組裝解鎖；第 2–5 星：傷害 +12% · 攻速 +5% · 數值型技能效果 +8%" },
  en: { rankUp: "Rank Up", max: "Max Stars", core: "Dedicated Core", fusion: "Fusion Stones", noCore: "First star needs no core", bonus: "Star 1 assembles and unlocks; stars 2–5: +12% damage · +5% fire rate · +8% numeric skill effects" },
  ja: { rankUp: "昇星", max: "最大", core: "専用コア", fusion: "融合石", noCore: "初星はコア不要", bonus: "1星で組立・解放。2～5星：ダメージ+12%・連射+5%・数値型スキル効果+8%" },
  ko: { rankUp: "성급 상승", max: "최대 성급", core: "전용 코어", fusion: "융합석", noCore: "첫 성급은 코어 불필요", bonus: "1성은 조립·해금, 2–5성은 피해 +12% · 공속 +5% · 수치형 스킬 효과 +8%" },
  ru: { rankUp: "Повысить", max: "Макс. звёзд", core: "Особое ядро", fusion: "Камни синтеза", noCore: "Для первой звезды ядро не нужно", bonus: "1-я звезда собирает и открывает; 2–5: урон +12% · скорострельность +5% · числовые эффекты +8%" },
  es: { rankUp: "Subir estrella", max: "Máx. estrellas", core: "Núcleo exclusivo", fusion: "Piedras de fusión", noCore: "La primera estrella no requiere núcleo", bonus: "La estrella 1 monta y desbloquea; estrellas 2–5: daño +12 % · cadencia +5 % · efectos numéricos +8 %" }
});

const V2_TURRET_DEFS = [
  { id: "emergency_shield", role: "main", strengthGrade: 1, name: "殘血護盾核", icon: "◈", color: "#7fe8ff", description: "核心生命首次低於 30% 時啟動；星級 1–5 分別提供 1–5 次傷害護盾。", damage: 0, speed: 0 },
  { id: "frost_core", role: "main", strengthGrade: 2, name: "冰晶減速核", icon: "❄", color: "#a9f6ff", description: "命中造成 5% 減速，持續 2.5 秒；升星會提高減速幅度。", damage: 0.36, speed: 0.72, damageType: "magic", frost: 0.05 },
  { id: "flame_core", role: "main", strengthGrade: 2, name: "烈焰點燃核", icon: "♨", color: "#ff9b72", description: "命中灼燒 4 秒，每秒造成魔攻 14% 傷害；升星會提高灼燒傷害。", damage: 0.34, speed: 0.74, damageType: "magic", burn: true },
  { id: "full_hp_berserk", role: "main", strengthGrade: 3, name: "滿血狂暴核", icon: "✹", color: "#ffe16f", description: "核心生命維持 100% 時，額外提高 15% 攻速。", damage: 0.28, speed: 0.9, damageType: "physical", fullHpRate: 0.15 },
  { id: "weakening_curse", role: "main", strengthGrade: 3, name: "虛弱詛咒核", icon: "☾", color: "#cba3ff", description: "被命中的敵人攻擊力降低 15%。", damage: 0.3, speed: 0.8, damageType: "magic", weaken: 0.15 },
  { id: "heavy_cannon", role: "main", strengthGrade: 4, name: "重型加農核", icon: "⬢", color: "#ffb66e", description: "攻速慢、單發傷害高，命中帶有擊退。", damage: 1.25, speed: 0.28, damageType: "physical", knockback: 46 },
  { id: "pulse_quantum", role: "main", strengthGrade: 4, name: "追脈量子塔", icon: "◎", color: "#7dd9ff", description: "自動鎖定全場生命值最高的敵人精準打擊。", damage: 0.78, speed: 0.46, damageType: "magic", highestHp: true },
  { id: "gatling", role: "main", strengthGrade: 5, name: "加特林機槍", icon: "≋", color: "#80ffc7", description: "極高攻速、單發傷害低，專精擊退與頻繁觸發命中效果。", damage: 0.12, speed: 2.3, damageType: "physical", knockback: 10 },
  { id: "split_cannon", role: "main", strengthGrade: 5, name: "兩段分裂砲", icon: "Y", color: "#ffcf7a", description: "子彈前進一段距離後，分裂為左右兩發。", damage: 0.62, speed: 0.54, damageType: "physical", split: true },
  { id: "arcane_core", role: "main", strengthGrade: 6, name: "奧術核心", icon: "✦", color: "#d59cff", description: "發射追蹤能量球，命中後造成小範圍魔法爆破。", damage: 0.76, speed: 0.42, damageType: "magic", homing: true, area: 86 },
  { id: "reflect_bastion", role: "main", strengthGrade: 6, name: "反射金剛塔", icon: "◇", color: "#9de8ff", description: "每座提供 2 級反擊強度；核心受到碰撞時對敵人造成反傷，升星會提高強度。", damage: 0.48, speed: 0.48, damageType: "physical", reflect: 1.1 },
  { id: "scatter_heavy", role: "main", strengthGrade: 7, name: "散彈重砲", icon: "✺", color: "#ffad89", description: "每次攻擊同時發射 8 發近距離擴散彈丸。", damage: 0.18, speed: 0.36, damageType: "physical", pellets: 8, spread: 0.42 },
  { id: "double_burst", role: "main", strengthGrade: 7, name: "雙重連射核", icon: "Ⅱ", color: "#8ff7ff", description: "一次平行發射 2 發基礎子彈。", damage: 0.58, speed: 0.62, damageType: "physical", pellets: 2, parallel: true },
  { id: "annihilation_laser", role: "main", strengthGrade: 8, name: "毀滅雷射塔", icon: "━", color: "#ff74bd", description: "持續發射可穿透所有敵人的貫穿光束。", damage: 1.35, speed: 0.24, damageType: "magic", beam: true },
  { id: "void_devourer", role: "main", strengthGrade: 8, name: "虛空吞噬塔", icon: "●", color: "#8e6cff", description: "累積擊殺後召喚微型黑洞，集中並傷害敵群。", damage: 0.7, speed: 0.5, damageType: "magic", void: true },
  { id: "vulnerability_mark", role: "main", strengthGrade: 8, name: "易傷標記核", icon: "⌖", color: "#ff6f91", description: "命中標記敵人，使其後續承受的所有傷害提高 15%。", damage: 0.46, speed: 0.58, damageType: "physical", vulnerability: 0.15 },
  { id: "emerald_drake", role: "main", strengthGrade: 8, name: "碧焰龍息砲", icon: "✧", color: "#63ffad", description: "追蹤碧焰命中後，連鎖至另外 2 個目標，連鎖傷害為 55%。新手包專屬，固定一星。", damage: 0.64, speed: 0.48, damageType: "magic", homing: true, chain: 3, starterExclusive: true },
  { id: "capacitor_pulse", role: "main", strengthGrade: 1, name: "蓄能脈衝砲", icon: "◉", color: "#ffd978", description: "每第 5 發蓄能彈命中時，對同一目標追加該發 60% 物理傷害。", damage: 0.25, speed: 0.72, damageType: "physical", capacitorEvery: 5, capacitorBonus: 0.6 },
  { id: "royal_tide", role: "main", strengthGrade: 3, name: "寶藍潮汐砲", icon: "≋", color: "#1f5cff", description: "每第 4 發寶藍彈釋放半徑 96 的潮汐波，對周圍敵人造成該發 35% 魔法傷害並減速 8%，持續 2 秒。", damage: 0.42, speed: 0.58, damageType: "magic", tideEvery: 4, tideDamage: 0.35, tideRadius: 96, tideSlow: 0.08 },
  { id: "phase_echo", role: "main", strengthGrade: 4, name: "相位回聲砲", icon: "◇", color: "#ff72ed", description: "每發命中都會產生相位回聲，對同一目標追加該發 45% 物理傷害。", damage: 0.52, speed: 0.46, damageType: "physical", phaseEcho: 0.45 },
  { id: "missile_nest", role: "auxiliary", strengthGrade: 1, name: "飛彈巢", icon: "➹", color: "#ffbc72", description: "一次齊射 6 發微型追蹤飛彈，冷卻 10 秒。", damage: 0.22, speed: 0.1, damageType: "physical", missiles: 6, cooldown: 10 },
  { id: "charged_laser", role: "auxiliary", strengthGrade: 2, name: "充能雷射砲", icon: "⌁", color: "#ff8fd5", description: "蓄力 3 秒後發射一發高傷害毀滅雷射。", damage: 1.15, speed: 0.33, damageType: "magic", beam: true, cooldown: 3 },
  { id: "frost_rail", role: "auxiliary", strengthGrade: 2, name: "冰霜導軌塔", icon: "❅", color: "#9df4ff", description: "持續發射冰凍射線，被擊中者減速 5%。", damage: 0.25, speed: 0.92, damageType: "magic", frost: 0.05 },
  { id: "shield_generator", role: "auxiliary", strengthGrade: 3, name: "護盾產生器", icon: "⬡", color: "#87c7ff", description: "每座讓核心受到的所有傷害降低 2%；升星會提高減傷幅度。", damage: 0, speed: 0, shield: true },
  { id: "flame_sprayer", role: "auxiliary", strengthGrade: 3, name: "烈焰噴射塔", icon: "♨", color: "#ff835f", description: "向前方錐形範圍持續噴火，造成範圍灼燒。", damage: 0.13, speed: 1.8, damageType: "magic", burn: true, area: 64 },
  { id: "long_range_sniper", role: "auxiliary", strengthGrade: 4, name: "狙擊長程砲", icon: "⌖", color: "#ffe583", description: "架設於最外圈，優先攻擊最遠或 Boss 單位。", damage: 1.42, speed: 0.24, damageType: "physical", highestHp: true, range: 1.7 },
  { id: "chain_arc", role: "auxiliary", strengthGrade: 4, name: "連鎖電弧塔", icon: "ϟ", color: "#c8a2ff", description: "閃電在 3 至 5 個敵人之間彈跳。", damage: 0.32, speed: 0.56, damageType: "magic", chain: 5 },
  { id: "crit_resonance", role: "auxiliary", strengthGrade: 5, name: "暴擊共鳴塔", icon: "✧", color: "#fff09a", description: "提升同節點附近砲台 5% 暴擊率。", damage: 0.22, speed: 0.66, damageType: "physical", critAura: 0.05 },
  { id: "time_slow", role: "auxiliary", strengthGrade: 5, name: "時空遲緩塔", icon: "◴", color: "#8bdcff", description: "展開持續減速的遲緩場，使場內敵人減速 5%。", damage: 0.08, speed: 0.72, damageType: "magic", slowAura: 0.05 },
  { id: "cluster_bomb", role: "auxiliary", strengthGrade: 6, name: "擴散爆彈塔", icon: "✹", color: "#ff9e72", description: "命中後分裂成 3 個小爆彈二次引爆。", damage: 0.48, speed: 0.42, damageType: "physical", cluster: 3, area: 72 },
  { id: "mining_gold", role: "auxiliary", strengthGrade: 6, name: "採礦金幣塔", icon: "¤", color: "#ffd36e", description: "不具備攻擊力，每波結束提供額外金幣。", damage: 0, speed: 0, mining: true },
  { id: "soul_drain", role: "auxiliary", strengthGrade: 7, name: "靈魂汲取塔", icon: "☥", color: "#85ffb6", description: "擊殺敵人時，為主砲恢復 0.5% 生命值。", damage: 0.5, speed: 0.48, damageType: "magic", lifeSteal: 0.005 },
  { id: "shadow_replica", role: "auxiliary", strengthGrade: 7, name: "影子複製塔", icon: "◐", color: "#ad9bff", description: "複製主砲 20% 傷害的子彈彈幕。", damage: 0.2, speed: 0.82, damageType: "physical", shadow: true },
  { id: "antimatter", role: "auxiliary", strengthGrade: 8, name: "反物質塔", icon: "⊗", color: "#ff69ce", description: "造成目標最大生命值 10% 的傷害，冷卻 30 秒。", damage: 0, speed: 0.033, damageType: "magic", antimatter: 0.1, cooldown: 30 },
  { id: "vip_prism_lancer", role: "main", strengthGrade: 8, rarity: "rare", vipExclusive: true, name: "幻稜折光砲", icon: "✧", color: "#b9f6ff", description: "鑽石棱鏡發射穿透光束，命中再留下相位回聲。", damage: 1.08, speed: 0.32, damageType: "magic", beam: true, phaseEcho: 0.35 },
  { id: "vip_thunder_throne", role: "main", strengthGrade: 8, rarity: "rare", vipExclusive: true, name: "雷霆王座", icon: "ϟ", color: "#ffe174", description: "鎖定強敵，金色電弧連鎖五個目標。", damage: 0.74, speed: 0.5, damageType: "magic", highestHp: true, chain: 5 },
  { id: "vip_frost_bloom", role: "auxiliary", strengthGrade: 8, rarity: "rare", vipExclusive: true, name: "霜月花冠", icon: "❆", color: "#b6eaff", description: "月華冰彈展開霜花，範圍命中並減速敵群。", damage: 0.44, speed: 0.68, damageType: "magic", frost: 0.12, area: 96 },
  { id: "vip_star_phoenix", role: "main", strengthGrade: 8, rarity: "rare", vipExclusive: true, name: "熔星鳳凰", icon: "✹", color: "#ffad7b", description: "鳳凰火羽分裂，爆破後持續灼燒。", damage: 0.77, speed: 0.46, damageType: "magic", split: true, burn: true, area: 80 },
  { id: "vip_abyssal_tide", role: "auxiliary", strengthGrade: 8, rarity: "rare", vipExclusive: true, name: "深海潮汐", icon: "≈", color: "#71d5ff", description: "潮汐脈衝擴散，命中附加緩速與範圍傷害。", damage: 0.56, speed: 0.54, damageType: "magic", frost: 0.08, area: 110 },
  { id: "vip_quantum_crown", role: "main", strengthGrade: 8, rarity: "legendary", vipExclusive: true, name: "量子皇冕", icon: "♛", color: "#e6c2ff", description: "帝冠星彈追蹤目標，命中後以紫金弧光連鎖六敵。需 100 碎片組裝。", damage: 1.04, speed: 0.52, damageType: "magic", homing: true, chain: 6, area: 88 },
  { id: "vip_singularity_king", role: "main", strengthGrade: 8, rarity: "legendary", vipExclusive: true, name: "黑洞君王", icon: "◉", color: "#a48aff", description: "每次擊殺蓄積引力，召喚收束敵群的黑洞。需 100 碎片組裝。", damage: 0.92, speed: 0.48, damageType: "magic", void: true, area: 100 },
  { id: "vip_solar_judgment", role: "main", strengthGrade: 8, rarity: "legendary", vipExclusive: true, name: "赤陽審判", icon: "☼", color: "#ffcf7a", description: "赤金審判光束貫穿全場，留下灼熱印記。需 100 碎片組裝。", damage: 1.52, speed: 0.26, damageType: "magic", beam: true, burn: true },
  { id: "vip_nebula_hymn", role: "auxiliary", strengthGrade: 8, rarity: "legendary", vipExclusive: true, name: "星雲聖歌", icon: "✺", color: "#ffc6e9", description: "星雲護盾與共鳴光環守護主砲，提升附近砲台暴擊。需 100 碎片組裝。", damage: 0.26, speed: 0.68, damageType: "magic", shield: true, critAura: 0.08 },
  { id: "vip_chrono_axis", role: "auxiliary", strengthGrade: 8, rarity: "legendary", vipExclusive: true, name: "時序天樞", icon: "◴", color: "#8df9f3", description: "時序齒環緩速敵群，冰晶電弧連鎖命中。需 100 碎片組裝。", damage: 0.62, speed: 0.58, damageType: "magic", slowAura: 0.09, frost: 0.1, chain: 5 }
];

const V2_MAIN_TURRET_VISUALS = Object.freeze({
  emergency_shield: "shield_hex",
  frost_core: "frost_crystal",
  flame_core: "flame_reactor",
  full_hp_berserk: "solar_blades",
  weakening_curse: "curse_crescent",
  heavy_cannon: "siege_barrel",
  pulse_quantum: "quantum_orbits",
  gatling: "gatling_rotor",
  split_cannon: "split_fork",
  arcane_core: "arcane_sigil",
  reflect_bastion: "reflect_bastion",
  scatter_heavy: "scatter_fan",
  double_burst: "twin_rails",
  annihilation_laser: "laser_lance",
  void_devourer: "void_ring",
  emerald_drake: "emerald_drake",
  vulnerability_mark: "target_reticle",
  capacitor_pulse: "capacitor_coil",
  royal_tide: "royal_tide",
  phase_echo: "phase_echo",
  vip_prism_lancer: "vip_prism_lancer",
  vip_thunder_throne: "vip_thunder_throne",
  vip_star_phoenix: "vip_star_phoenix",
  vip_quantum_crown: "vip_quantum_crown",
  vip_singularity_king: "vip_singularity_king",
  vip_solar_judgment: "vip_solar_judgment"
});

function drawEmeraldDrake(context, radius) {
  context.save();
  context.lineWidth = radius * 0.1;
  context.fillStyle = "#08382d";
  context.beginPath();
  context.moveTo(-radius, 0); context.lineTo(-radius * .6, -radius * .72);
  context.lineTo(radius * .5, -radius * .55); context.lineTo(radius * 1.5, 0);
  context.lineTo(radius * .5, radius * .55); context.lineTo(-radius * .6, radius * .72);
  context.closePath(); context.fill(); context.stroke();
  for (const side of [-1, 1]) {
    context.beginPath(); context.moveTo(-radius * .25, side * radius * .5);
    context.lineTo(-radius * .8, side * radius * 1.13);
    context.lineTo(radius * .8, side * radius * .76);
    context.lineTo(radius * 1.8, side * radius * .18); context.stroke();
    context.fillStyle = "#daffe7";
    context.beginPath(); context.ellipse(radius * .47, side * radius * .26, radius * .2, radius * .07, -side * .25, 0, Math.PI * 2); context.fill();
  }
  context.fillStyle = "#63ffad";
  context.beginPath(); context.moveTo(-radius * .6, 0); context.lineTo(-radius * .1, -radius * .23);
  context.lineTo(radius * .24, 0); context.lineTo(-radius * .1, radius * .23); context.closePath(); context.fill();
  context.restore();
}

function getMainTurretVisual(definition) {
  return V2_MAIN_TURRET_VISUALS[definition?.id] || "standard_core";
}

const V2_TURRET_SYNERGY = Object.freeze({
  emergency_shield: "fortress", frost_core: "control", flame_core: "arcane", full_hp_berserk: "fortress",
  weakening_curse: "control", heavy_cannon: "assault", pulse_quantum: "arcane", gatling: "assault",
  split_cannon: "assault", arcane_core: "arcane", reflect_bastion: "fortress", scatter_heavy: "assault",
  double_burst: "assault", annihilation_laser: "arcane", void_devourer: "arcane", vulnerability_mark: "control",
  capacitor_pulse: "assault", royal_tide: "control", phase_echo: "arcane",
  missile_nest: "fleet", charged_laser: "arcane", frost_rail: "control", shield_generator: "fortress",
  flame_sprayer: "arcane", long_range_sniper: "assault", chain_arc: "arcane", crit_resonance: "assault",
  time_slow: "control", cluster_bomb: "assault", mining_gold: "prosperity", soul_drain: "fortress",
  shadow_replica: "fleet", antimatter: "arcane",
  vip_prism_lancer: "arcane", vip_thunder_throne: "assault", vip_frost_bloom: "control",
  vip_star_phoenix: "arcane", vip_abyssal_tide: "control", vip_quantum_crown: "arcane",
  vip_singularity_king: "control", vip_solar_judgment: "assault", vip_nebula_hymn: "fortress", vip_chrono_axis: "control"
});

const V2_WISHLIST_TEXT = Object.freeze({
  zh: { title: "心願碎片", any: "隨機砲台", hint: "心願命中率 68%；保底必定獲得心願砲台。", pity: "碎片保底 {current} / {target}" },
  en: { title: "Shard Wishlist", any: "Any turret", hint: "Wishlist chance: 68%. Pity always grants the wished turret.", pity: "Shard pity {current} / {target}" },
  ja: { title: "フラグメント願望", any: "ランダム砲台", hint: "願望命中率68%。天井では選択した砲台を確定入手。", pity: "天井 {current} / {target}" },
  ko: { title: "조각 위시리스트", any: "무작위 포탑", hint: "위시 적중률 68%. 천장에서는 선택 포탑을 확정 획득합니다.", pity: "조각 천장 {current} / {target}" },
  ru: { title: "Желаемый фрагмент", any: "Любая турель", hint: "Шанс желания 68%. Гарант всегда даёт выбранную турель.", pity: "Гарант {current} / {target}" },
  es: { title: "Fragmento deseado", any: "Cualquier torreta", hint: "Probabilidad de deseo: 68 %. La garantía siempre otorga la torreta elegida.", pity: "Garantía {current} / {target}" }
});

const V2_RUN_UPGRADES = [
  { id: "defenseRate", meta: "defenseRate", name: "防禦率", step: 0.012, cap: 0.45, unit: "%", category: "防禦", base: 32, growth: 1.035 },
  { id: "physicalArmor", meta: "physicalDefense", name: "物防", step: 1, cap: 999, unit: "", category: "防禦", base: 26, growth: 1.03 },
  { id: "magicArmor", meta: "magicDefense", name: "魔防", step: 1, cap: 999, unit: "", category: "防禦", base: 25, growth: 1.03 },
  { id: "slowModule", meta: "slowModule", name: "緩速砲率", step: 0.025, cap: 0.5, unit: "%", category: "控制", base: 34, growth: 1.038 },
  { id: "knockbackModule", meta: "knockbackModule", name: "擊退率", step: 0.016, cap: 0.28, unit: "%", category: "控制", base: 38, growth: 1.04 },
  { id: "reflectModule", meta: "reflectModule", name: "反傷", step: 1, cap: 12, unit: "級", category: "防禦", base: 42, growth: 1.045 },
  { id: "mineRadius", meta: "mineRadius", name: "地雷範圍", step: 12, cap: 260, unit: "px", category: "爆破", base: 44, growth: 1.04 },
  { id: "mineChance", meta: "mineChance", name: "地雷機率", step: 0.008, cap: 0.18, unit: "%", category: "爆破", base: 48, growth: 1.045 },
  { id: "fighterCap", meta: "fighterHangar", name: "軌道編隊", step: 1, cap: 8, unit: "架", category: "召喚", base: 58, growth: 1.05 },
  { id: "waveGold", meta: "waveGold", name: "波次金幣", step: 3, cap: 180, unit: "G", category: "經濟", base: 28, growth: 1.035 },
  { id: "goldMultiplier", meta: "goldMultiplier", name: "金幣倍率", step: 0.03, cap: 1.8, unit: "%", category: "經濟", base: 46, growth: 1.045 },
  { id: "waveObsidian", meta: "waveObsidian", name: "波次黑曜石", step: 1, cap: 10, unit: "級", category: "經濟", base: 72, growth: 1.055 },
  { id: "medkit", meta: "medkit", name: "補包", step: 0.3, cap: 1, unit: "%", category: "生命", base: 30, growth: 1.04, consumable: true },
  { id: "barrageExpansion", meta: "barrageExpansion", name: "彈幕擴張", step: 0.0001, cap: 1, unit: "%", category: "攻擊", base: 54, growth: 1.045 },
  { id: "giantBloodline", meta: "giantBloodline", name: "巨人血脈", step: 0.02, cap: 1, unit: "%", category: "生命", base: 58, growth: 1.048 },
  { id: "spellbladeTraining", meta: "spellbladeTraining", name: "魔武雙修", step: 0.0003, cap: 0.3, unit: "%", category: "特殊", base: 62, growth: 1.05 },
  { id: "bloodCrit", meta: "bloodCrit", name: "汲血暴擊", step: 1, cap: 100, unit: "HP", category: "生命", base: 64, growth: 1.052 },
  { id: "deepFreeze", meta: "deepFreeze", name: "深度凍結", step: 0.04, cap: 0.8, unit: "%", category: "特殊", base: 68, growth: 1.054 },
  { id: "orbitA", meta: "orbitA", name: "軌道 A", step: 1, cap: 1, unit: "", category: "特殊", base: 90, growth: 1 },
  { id: "orbitB", meta: "orbitB", name: "軌道 B", step: 1, cap: 1, unit: "", category: "特殊", base: 120, growth: 1 },
  { id: "staticField", meta: "staticField", name: "靜電場", step: 0.0005, cap: 0.05, unit: "%", category: "範圍", base: 72, growth: 1.055 },
  { id: "demolitionExpert", meta: "demolitionExpert", name: "爆破專家", step: 0.001, cap: 1, unit: "%", category: "範圍", base: 70, growth: 1.052 },
  { id: "allIn", meta: "allIn", name: "孤注一擲", step: 0.01, cap: 5, unit: "%", category: "特殊", base: 76, growth: 1.057 },
  { id: "energySaver", meta: "energySaver", name: "節能核心", step: 0.01, cap: 0.9, unit: "%", category: "特殊", base: 78, growth: 1.06 },
  { id: "curseAura", meta: "curseAura", name: "詛咒光環", step: 0.0002, cap: 0.5, unit: "%", category: "範圍", base: 74, growth: 1.056 }
];

function getV2LanguagePack(language = currentLanguage) {
  const packs = window.V2_I18N || {};
  return packs[language] || packs.en || packs.zh;
}

function getV2UiText() {
  return getV2LanguagePack()?.ui || {};
}

function getV2BackgroundStoreText() {
  return getV2LanguagePack()?.backgroundStore || getV2LanguagePack("en")?.backgroundStore || {};
}

function getV2EnemyInfo(id) {
  return getV2LanguagePack()?.enemies?.[id] || V2_ENEMY_TEXT[id] || [getLocalizedEnemyName(id), getV2UiText().unknownEnemy || "Unknown hostile craft.", []];
}

function formatV2Text(template, values = {}) {
  return String(template || "").replace(/\{(\w+)\}/g, (_, key) => values[key] ?? "");
}

let v2Progress = loadV2Progress();
if (DEV_MODE) {
  for (const turret of V2_TURRET_DEFS) {
    v2Progress.fragments[turret.id] = Math.max(v2Progress.fragments[turret.id], 999);
    v2Progress.cores[turret.id] = Math.max(v2Progress.cores[turret.id], 999);
    v2Progress.stars[turret.id] = getV2TurretMaxStars();
    v2Progress.assembled[turret.id] = Math.max(v2Progress.assembled[turret.id], 10);
  }
}
let v2CardStars = {};
let v2BlackHole = null;
let v2ConvertedFighters = [];
let v2LastEnvironmentId = "";
let v2EnvironmentBannerTimer = 0;
let v2WorkshopMainTurrets = [];
let v2StaticFieldTimer = 0;
let v2VoidKillCounter = 0;
let workshopFilters = { role: "all", ownership: "all", grade: "all", search: "" };
let workshopCompareIds = [];
let workshopExpandedIds = new Set();

const WORKSHOP_COMMAND_I18N = {
  zh: { formation: "目前戰鬥編隊", main: "主砲核心", aux: "副砲軌道", empty: "尚未裝備", presets: ["推關", "Boss", "資源"], apply: "套用", save: "儲存目前", saved: "已儲存", all: "全部", mainFilter: "主砲", auxFilter: "副砲", owned: "已擁有", rankable: "可升星", equipped: "已裝備", grade: "G1–G8", search: "搜尋砲台名稱", detail: "查看詳情", close: "收起詳情", compare: "比較", nextStar: "下一星實際數值", damage: "傷害", rate: "攻速", effect: "效果", noMatch: "沒有符合條件的砲台", chooseTwo: "選擇兩座砲台即可並排比較" },
  en: { formation: "Current battle formation", main: "Main core", aux: "Auxiliary orbit", empty: "Not equipped", presets: ["Progress", "Boss", "Resource"], apply: "Apply", save: "Save current", saved: "Saved", all: "All", mainFilter: "Main", auxFilter: "Auxiliary", owned: "Owned", rankable: "Can rank", equipped: "Equipped", grade: "G1–G8", search: "Search turret name", detail: "View details", close: "Close details", compare: "Compare", nextStar: "Next-star actual values", damage: "Damage", rate: "Rate", effect: "Effect", noMatch: "No turrets match these filters", chooseTwo: "Select two turrets for side-by-side comparison" },
  ja: { formation: "現在の戦闘編成", main: "主砲コア", aux: "副砲軌道", empty: "未装備", presets: ["攻略", "Boss", "資源"], apply: "適用", save: "現在を保存", saved: "保存済み", all: "すべて", mainFilter: "主砲", auxFilter: "副砲", owned: "所持", rankable: "昇星可能", equipped: "装備中", grade: "G1–G8", search: "砲台名を検索", detail: "詳細", close: "閉じる", compare: "比較", nextStar: "次の星の実数値", damage: "ダメージ", rate: "速度", effect: "効果", noMatch: "条件に一致する砲台はありません", chooseTwo: "2基を選択して比較" },
  ko: { formation: "현재 전투 편성", main: "주포 코어", aux: "보조포 궤도", empty: "미장착", presets: ["진행", "Boss", "자원"], apply: "적용", save: "현재 저장", saved: "저장됨", all: "전체", mainFilter: "주포", auxFilter: "보조포", owned: "보유", rankable: "승급 가능", equipped: "장착", grade: "G1–G8", search: "포탑 이름 검색", detail: "상세 보기", close: "접기", compare: "비교", nextStar: "다음 별 실제 수치", damage: "피해", rate: "공속", effect: "효과", noMatch: "조건에 맞는 포탑이 없습니다", chooseTwo: "포탑 두 개를 선택해 비교" },
  ru: { formation: "Текущая боевая схема", main: "Главное орудие", aux: "Вспомогательная орбита", empty: "Не установлено", presets: ["Прогресс", "Boss", "Ресурсы"], apply: "Применить", save: "Сохранить", saved: "Сохранено", all: "Все", mainFilter: "Главные", auxFilter: "Вспом.", owned: "Есть", rankable: "Можно повысить", equipped: "Установлено", grade: "G1–G8", search: "Поиск орудия", detail: "Подробнее", close: "Свернуть", compare: "Сравнить", nextStar: "Значения следующей звезды", damage: "Урон", rate: "Скорость", effect: "Эффект", noMatch: "Нет подходящих орудий", chooseTwo: "Выберите два орудия для сравнения" },
  es: { formation: "Formación de combate actual", main: "Núcleo principal", aux: "Órbita auxiliar", empty: "Sin equipar", presets: ["Progreso", "Boss", "Recursos"], apply: "Aplicar", save: "Guardar actual", saved: "Guardado", all: "Todo", mainFilter: "Principal", auxFilter: "Auxiliar", owned: "Propias", rankable: "Puede subir", equipped: "Equipadas", grade: "G1–G8", search: "Buscar torreta", detail: "Ver detalles", close: "Cerrar", compare: "Comparar", nextStar: "Valores reales de la siguiente estrella", damage: "Daño", rate: "Cadencia", effect: "Efecto", noMatch: "Ninguna torreta coincide", chooseTwo: "Selecciona dos torretas para compararlas" }
};

function createDefaultV2Progress() {
  return {
    revision: 0,
    fragments: Object.fromEntries(V2_TURRET_DEFS.map((item) => [item.id, 0])),
    cores: Object.fromEntries(V2_TURRET_DEFS.map((item) => [item.id, 0])),
    assembled: Object.fromEntries(V2_TURRET_DEFS.map((item) => [item.id, 0])),
    active: Object.fromEntries(V2_TURRET_DEFS.map((item) => [item.id, 0])),
    stars: Object.fromEntries(V2_TURRET_DEFS.map((item) => [item.id, 0])),
    lifetimeFragments: 0,
    fragmentWishlist: "",
    fragmentPity: 0,
    loadoutPresets: { progress: {}, boss: {}, resource: {} },
    slotOrder: { main: [], auxiliary: [] },
    activePreset: ""
  };
}

function normalizeV2Progress(raw) {
  const defaults = createDefaultV2Progress();
  if (!raw || typeof raw !== "object") return defaults;
  for (const bucket of ["fragments", "assembled", "active"]) {
    for (const turret of V2_TURRET_DEFS) {
      defaults[bucket][turret.id] = Math.max(0, Math.floor(Number(raw[bucket]?.[turret.id]) || 0));
    }
    const legacyMap = { kinetic: "missile_nest", frost: "frost_rail", arc: "chain_arc", rail: "long_range_sniper", mine: "cluster_bomb" };
    for (const [legacyId, currentId] of Object.entries(legacyMap)) {
      defaults[bucket][currentId] += Math.max(0, Math.floor(Number(raw[bucket]?.[legacyId]) || 0));
    }
  }
  for (const turret of V2_TURRET_DEFS) {
    defaults.cores[turret.id] = Math.max(0, Math.floor(Number(raw.cores?.[turret.id]) || 0));
    const explicitStars = Math.max(0, Math.floor(Number(raw.stars?.[turret.id]) || 0));
    const hasExplicitStars = raw.stars && Object.prototype.hasOwnProperty.call(raw.stars, turret.id);
    const migratedStars = hasExplicitStars
      ? explicitStars
      : Math.min(defaults.assembled[turret.id] || 0, getV2TurretMaxStars());
    defaults.stars[turret.id] = clamp(migratedStars, 0, getV2TurretMaxStars());
    defaults.assembled[turret.id] = defaults.stars[turret.id] > 0
      ? Math.max(1, defaults.assembled[turret.id])
      : 0;
    defaults.active[turret.id] = defaults.stars[turret.id] > 0
      ? Math.min(defaults.active[turret.id], defaults.assembled[turret.id])
      : 0;
  }
  defaults.lifetimeFragments = Math.max(0, Math.floor(Number(raw.lifetimeFragments) || 0));
  defaults.fragmentWishlist = V2_TURRET_DEFS.some((item) => item.id === raw.fragmentWishlist) ? raw.fragmentWishlist : "";
  defaults.fragmentPity = clamp(Math.floor(Number(raw.fragmentPity) || 0), 0, V2_FRAGMENT_PITY_TARGET - 1);
  for (const preset of ["progress", "boss", "resource"]) {
    for (const turret of V2_TURRET_DEFS) {
      defaults.loadoutPresets[preset][turret.id] = Math.max(0, Math.floor(Number(raw.loadoutPresets?.[preset]?.[turret.id]) || 0));
    }
  }
  defaults.activePreset = ["progress", "boss", "resource"].includes(raw.activePreset) ? raw.activePreset : "";
  for (const role of ["main", "auxiliary"]) {
    defaults.slotOrder[role] = (Array.isArray(raw.slotOrder?.[role]) ? raw.slotOrder[role] : [])
      .slice(0, 60).map((id) => V2_TURRET_DEFS.some((turret) => turret.id === id && turret.role === role) ? id : "");
  }
  defaults.revision = Math.max(0, Math.floor(Number(raw.revision) || 0));
  return defaults;
}

function loadV2Progress() {
  try {
    return normalizeV2Progress(JSON.parse(localStorage.getItem(V2_SAVE_KEY) || "null"));
  } catch {
    localStorage.removeItem(V2_SAVE_KEY);
    return createDefaultV2Progress();
  }
}

function getV2TurretStars(id) {
  return clamp(Math.floor(Number(v2Progress?.stars?.[id]) || 0), 0, getV2TurretMaxStars());
}

function getV2TurretDamageMultiplier(id) {
  const perRank = clamp(Number(window.SPACE_TOWER_RUNTIME_BALANCE?.v2?.starDamagePerRank) || 0.12, 0, 0.5);
  return 1 + Math.max(0, getV2TurretStars(id) - 1) * perRank;
}

function getV2TurretRateMultiplier(id) {
  const perRank = clamp(Number(window.SPACE_TOWER_RUNTIME_BALANCE?.v2?.starRatePerRank) || 0.05, 0, 0.25);
  return 1 + Math.max(0, getV2TurretStars(id) - 1) * perRank;
}

function getV2TurretEffectMultiplier(id) {
  const perRank = clamp(Number(window.SPACE_TOWER_RUNTIME_BALANCE?.v2?.starEffectPerRank) || 0.08, 0, 0.5);
  return 1 + Math.max(0, getV2TurretStars(id) - 1) * perRank;
}

function saveV2Progress(options = {}) {
  reconcileV2Equipment(unlockedTier);
  if (options.bumpRevision !== false) v2Progress.revision += 1;
  if (!DEV_MODE) localStorage.setItem(V2_SAVE_KEY, JSON.stringify(v2Progress));
  renderV2Workshop();
  queueCloudSave({ critical: options.critical === true });
}

function getTurretCoreRequirementForNextStar(currentStars) {
  const stars = Math.max(0, Math.floor(Number(currentStars) || 0));
  return stars <= 0 || stars >= getV2TurretMaxStars() ? 0 : V2_TURRET_CORE_REQUIREMENTS[stars - 1] || 0;
}

function getTurretCoreDropChance(tier = activeRunTier) {
  return V2_TURRET_CORE_DROP_BASE * Math.pow(V2_TURRET_CORE_TIER_MULTIPLIER, Math.max(0, clampTier(tier) - 1));
}

function renderTurretCoreIcon(turret) {
  if (!turret) return "";
  return `<span class="turret-core-icon" data-core-id="${turret.id}" style="--core-color:${turret.color}" aria-label="${escapeHtml(turret.name)}"><i></i><b>${turret.icon}</b></span>`;
}

function getTierUnlockRequirement(targetTier) {
  return Number(targetTier) === 2 ? 500 : 1500;
}

function getSupportSlotCap(tier = activeRunTier) {
  return clampTier(tier) * 3;
}

function getMainSlotCap(tier = activeRunTier) {
  return clampTier(tier);
}

function getActiveSupportCount() {
  return V2_TURRET_DEFS
    .filter((turret) => turret.role === "auxiliary")
    .reduce((sum, turret) => sum + (v2Progress.active[turret.id] || 0), 0);
}

function getActiveMainCount() {
  return V2_TURRET_DEFS
    .filter((turret) => turret.role === "main")
    .reduce((sum, turret) => sum + (v2Progress.active[turret.id] || 0), 0);
}

function getTurretRoleSlotCap(role, tier = unlockedTier) {
  return role === "main" ? getMainSlotCap(tier) : getSupportSlotCap(tier);
}

function getActiveTurretRoleCount(role) {
  return role === "main" ? getActiveMainCount() : getActiveSupportCount();
}

function reconcileV2Equipment(tier = unlockedTier) {
  for (const turret of V2_TURRET_DEFS) {
    v2Progress.stars[turret.id] = clamp(Math.floor(Number(v2Progress.stars[turret.id]) || 0), 0, getV2TurretMaxStars());
    v2Progress.assembled[turret.id] = v2Progress.stars[turret.id] > 0
      ? Math.max(1, Math.floor(Number(v2Progress.assembled[turret.id]) || 0))
      : 0;
    v2Progress.active[turret.id] = Math.min(
      Math.max(0, Math.floor(Number(v2Progress.active[turret.id]) || 0)),
      Math.max(0, Math.floor(Number(v2Progress.assembled[turret.id]) || 0))
    );
  }
  for (const role of ["main", "auxiliary"]) {
    let remaining = getTurretRoleSlotCap(role, tier);
    for (const turret of V2_TURRET_DEFS.filter((item) => item.role === role)) {
      const equipped = Math.min(v2Progress.active[turret.id], remaining);
      v2Progress.active[turret.id] = equipped;
      remaining -= equipped;
    }
  }
}

function getActiveEnvironment(tier = activeRunTier, waveNumber = wave) {
  if (Number(tier) < 3) return null;
  const sector = Math.floor((Math.max(1, waveNumber) - 1) / 40);
  return V2_ENVIRONMENTS[(sector + Number(tier) - 3) % V2_ENVIRONMENTS.length];
}

function ensureV2MetaDefaults() {
  let stored = {};
  try {
    const parsed = JSON.parse(localStorage.getItem(META_UPGRADES_KEY) || "null");
    if (parsed && typeof parsed === "object") stored = parsed;
  } catch {
    stored = {};
  }
  for (const def of META_UPGRADE_DEFS) {
    if (!Number.isFinite(Number(metaUpgrades[def.id]))) {
      metaUpgrades[def.id] = Number.isFinite(Number(stored[def.id]))
        ? Math.max(0, Math.floor(Number(stored[def.id]) || 0))
        : 0;
    }
    if (Number.isFinite(def.maxLevel)) metaUpgrades[def.id] = Math.min(def.maxLevel, metaUpgrades[def.id]);
  }
  for (const card of SPECIAL_CARDS) {
    if (!card.unlockCost) continue;
    const key = getCardUnlockMetaId(card.id);
    if (Number.isFinite(Number(metaUpgrades[key]))) continue;
    metaUpgrades[key] = Number.isFinite(Number(stored[key]))
      ? Math.max(0, Math.min(1, Math.floor(Number(stored[key]) || 0)))
      : 0;
  }
  if (!DEV_MODE) localStorage.setItem(META_UPGRADES_KEY, JSON.stringify(metaUpgrades));
}

// ---------- Definitions and balance ----------

Object.assign(ENEMY_TYPES, {
  berserker: { name: "berserker", unlockTier: 1, unlockWave: 12, weight: 15, weightGrowth: 0.45, maxWeight: 30, hpScale: 0.92, speedScale: 1.08, collisionScale: 0.9, physicalDefenseScale: 0.8, magicDefenseScale: 0.8, physicalDefenseBonus: 0, reward: 2, sizeScale: 0.92, color: "#ff8a72", strokeColor: "#ffd1c6", shape: "berserker", hitKickScale: 1.1, ability: "berserker" },
  erratic: { name: "erratic", unlockTier: 1, unlockWave: 18, weight: 12, weightGrowth: 0.35, maxWeight: 24, hpScale: 0.78, speedScale: 1.2, collisionScale: 0.72, physicalDefenseScale: 0.72, magicDefenseScale: 0.75, physicalDefenseBonus: 0, reward: 2, sizeScale: 0.82, color: "#7fffe5", strokeColor: "#d8fff8", shape: "erratic", hitKickScale: 1.15, ability: "erratic" },
  splitter: { name: "splitter", unlockTier: 2, unlockWave: 80, weight: 10, weightGrowth: 0.25, maxWeight: 20, hpScale: 1.2, speedScale: 0.86, collisionScale: 0.9, physicalDefenseScale: 0.9, magicDefenseScale: 0.9, physicalDefenseBonus: 2, reward: 3, sizeScale: 1.15, color: "#ffcf6e", strokeColor: "#fff0b2", shape: "splitter", hitKickScale: 0.78, ability: "splitter" },
  ranged: { name: "ranged", unlockTier: 2, unlockWave: 150, weight: 8, weightGrowth: 0.2, maxWeight: 16, hpScale: 0.82, speedScale: 0.78, collisionScale: 0.45, physicalDefenseScale: 0.8, magicDefenseScale: 1.05, physicalDefenseBonus: 1, reward: 3, sizeScale: 1.02, color: "#ff9de1", strokeColor: "#ffd8f4", shape: "ranged", hitKickScale: 0.82, ability: "ranged", ranged: true },
  healer: { name: "healer", unlockTier: 3, unlockWave: 120, weight: 7, weightGrowth: 0.14, maxWeight: 13, hpScale: 1.15, speedScale: 0.55, collisionScale: 0.5, physicalDefenseScale: 0.9, magicDefenseScale: 1.2, physicalDefenseBonus: 2, reward: 4, sizeScale: 1.08, color: "#72ffac", strokeColor: "#d6ffe5", shape: "healer", hitKickScale: 0.7, ability: "healer" },
  full_shield: { name: "full_shield", unlockTier: 3, unlockWave: 240, weight: 6, weightGrowth: 0.12, maxWeight: 12, hpScale: 1.35, speedScale: 0.66, collisionScale: 1.05, physicalDefenseScale: 1.1, magicDefenseScale: 1.1, physicalDefenseBonus: 4, reward: 5, sizeScale: 1.18, color: "#76b7ff", strokeColor: "#d7eaff", shape: "fullShield", hitKickScale: 0.55, ability: "full_shield", shieldScale: 0.75 },
  buffer: { name: "buffer", unlockTier: 4, unlockWave: 160, weight: 5, weightGrowth: 0.1, maxWeight: 10, hpScale: 0.75, speedScale: 1.42, collisionScale: 0.25, physicalDefenseScale: 0.65, magicDefenseScale: 0.65, physicalDefenseBonus: 0, reward: 5, sizeScale: 0.86, color: "#f2ff74", strokeColor: "#fbffc9", shape: "buffer", hitKickScale: 1.15, ability: "buffer" },
  frontal_shield: { name: "frontal_shield", unlockTier: 4, unlockWave: 300, weight: 4, weightGrowth: 0.08, maxWeight: 9, hpScale: 1.75, speedScale: 0.58, collisionScale: 1.2, physicalDefenseScale: 1.25, magicDefenseScale: 1.15, physicalDefenseBonus: 7, reward: 6, sizeScale: 1.3, color: "#8da8ff", strokeColor: "#e0e7ff", shape: "frontalShield", hitKickScale: 0.42, ability: "frontal_shield" }
});

for (const enemy of Object.values(ENEMY_TYPES)) {
  if (!enemy.unlockTier) enemy.unlockTier = 1;
}

const v2MetaDefs = [
  { id: "defenseRate", category: "defense", name: "防禦率模組", step: 0.012, unit: "%", baseCost: 25, growth: 1.1, description: "解鎖局內防禦率；每級開局額外減傷 1.2%。" },
  { id: "slowModule", category: "special", name: "寒霜控制模組", step: 0.01, unit: "%", baseCost: 29, growth: 1.1, description: "解鎖局內緩速砲率；每級開局緩速機率 +1%。" },
  { id: "knockbackModule", category: "special", name: "動能擊退模組", step: 0.007, unit: "%", baseCost: 31, growth: 1.1, description: "解鎖局內擊退率；每級開局擊退機率 +0.7%。" },
  { id: "reflectModule", category: "defense", name: "鏡面反傷模組", step: 2, unit: "級", baseCost: 35, growth: 1.11, description: "解鎖局內反傷；每級提供 2 級開局反擊強度。" },
  { id: "mineRadius", category: "range", name: "地雷感應半徑", step: 6, unit: "px", baseCost: 30, growth: 1.1, description: "解鎖局內地雷範圍；每級開局爆炸半徑 +6px。" },
  { id: "mineChance", category: "special", name: "自動佈雷協議", step: 0.004, unit: "%", baseCost: 37, growth: 1.11, description: "解鎖局內地雷；每級觸發機率 +0.4%。" },
  { id: "fighterHangar", category: "special", name: "軌道戰機庫", step: 2, unit: "架", baseCost: 42, growth: 1.11, description: "解鎖局內軌道編隊；每級開局增加 2 架，最多 8 架。" },
  { id: "waveGold", category: "special", name: "波次金幣協議", step: 3, unit: "G", baseCost: 26, growth: 1.1, description: "解鎖局內波次金幣；每級通關波次額外 +3 金幣。" },
  { id: "goldMultiplier", category: "special", name: "採礦倍率核心", step: 0.015, unit: "%", baseCost: 40, growth: 1.11, description: "解鎖局內金幣倍率；每級開局擊殺收益 +1.5%。" },
  { id: "waveObsidian", category: "special", name: "黑曜石回收器", step: 2, unit: "級", baseCost: 55, growth: 1.12, description: "解鎖局內黑曜石波次獎勵；每級提供 2 級回收強度。" },
  { id: "medkit", category: "life", name: "戰地補包", step: 0.04, unit: "%", baseCost: 28, growth: 1.1, description: "解鎖局內補包；每級回復量 +4%。" },
  { id: "barrageExpansion", category: "attack", name: "彈幕擴張模組", step: 0.0002, unit: "%", baseCost: 50, growth: 1.11, description: "解鎖彈幕擴張；每級開局攻速 +0.02%。" },
  { id: "giantBloodline", category: "life", name: "巨人血脈模組", step: 0.02, unit: "%", baseCost: 53, growth: 1.11, description: "解鎖巨人血脈；每級開局最大生命 +2%，攻速 -0.6%。" },
  { id: "spellbladeTraining", category: "special", name: "魔武雙修模組", step: 0.0006, unit: "%", baseCost: 55, growth: 1.12, description: "解鎖魔武雙修；每級將物攻的 0.06% 加成到魔攻。" },
  { id: "bloodCrit", category: "life", name: "汲血暴擊模組", step: 2, unit: "HP", baseCost: 58, growth: 1.12, description: "解鎖汲血暴擊；每級讓暴擊回復 +2 生命。" },
  { id: "deepFreeze", category: "special", name: "深度凍結模組", step: 0.06, unit: "%", baseCost: 60, growth: 1.12, description: "解鎖深度凍結；每級對冰凍敵人增傷 +6%。" },
  { id: "orbitA", category: "special", name: "軌道 A 控制器", step: 1, unit: "", baseCost: 75, growth: 1, maxLevel: 1, unlockTier: 3, description: "Tier 3 解鎖；永久開啟第二圈（中圈）砲台軌道，僅可購買一次。" },
  { id: "orbitB", category: "special", name: "軌道 B 控制器", step: 1, unit: "", baseCost: 95, growth: 1, maxLevel: 1, unlockTier: 3, description: "Tier 3 解鎖；永久開啟第三圈（外圈）砲台軌道，僅可購買一次。" },
  { id: "staticField", category: "range", name: "靜電場模組", step: 0.001, unit: "%", baseCost: 62, growth: 1.12, description: "解鎖靜電場；每級每秒傷害 +0.1% 魔攻。" },
  { id: "demolitionExpert", category: "range", name: "爆破專家模組", step: 0.002, unit: "%", baseCost: 61, growth: 1.12, description: "解鎖爆破專家；每級範圍半徑 +0.2%。" },
  { id: "allIn", category: "special", name: "孤注一擲模組", step: 0.02, unit: "%", baseCost: 67, growth: 1.12, description: "解鎖孤注一擲；未安裝副砲時每級主砲傷害 +2%。" },
  { id: "energySaver", category: "special", name: "節能核心模組", step: 0.015, unit: "%", baseCost: 65, growth: 1.12, description: "解鎖節能核心；每級基礎升級金幣花費 -1.5%，上限 90%。" },
  { id: "curseAura", category: "range", name: "詛咒光環模組", step: 0.0004, unit: "%", baseCost: 64, growth: 1.12, description: "解鎖詛咒光環；每級敵人初始生命 -0.04%。" }
];

for (const def of v2MetaDefs) {
  if (!META_UPGRADE_DEFS.some((item) => item.id === def.id)) META_UPGRADE_DEFS.push(def);
}
applyOfficialProgression({
  permanent: RUNTIME_BALANCE.permanent,
  engagement: RUNTIME_BALANCE.engagement
});
for (const def of META_UPGRADE_DEFS) {
  if (def.id === "physicalDefense") def.description = "解鎖局內物理防禦；每級降低敵方撞擊與實體攻擊傷害。";
  if (def.id === "magicDefense") def.description = "解鎖局內魔法防禦；每級降低遠程光束與魔法傷害。";
}

const v2BaseFormatMetaValue = formatMetaValue;
formatMetaValue = function (def) {
  if (V2_EXPANSION_UPGRADE_IDS?.includes(def.id) && def.unit === "%") {
    return `+${formatV2RunValue({ unit: "%" }, getMetaValue(def.id))}`;
  }
  return v2BaseFormatMetaValue(def);
};

const v2Cards = [
  { id: "chance_slow", name: "低溫彈鏈", category: "控制", description: "主砲命中有機率施加強力緩速；升星提高機率與持續時間。", unlockCost: 90, maxStacks: 5, apply: () => { cardEffects.chanceSlowLevel += 1; } },
  { id: "blind_rounds", name: "致盲閃光彈", category: "控制", description: "主砲有機率致盲敵機，使遠程攻擊失效並降低推進效率。", unlockCost: 95, maxStacks: 5, apply: () => { cardEffects.blindLevel += 1; } },
  { id: "defection", name: "敵我逆轉", category: "戰術", description: "命中基礎小兵時有機率策反，轉向撞擊 Boss 或高威脅敵機。", unlockCost: 115, maxStacks: 5, apply: () => { cardEffects.defectionLevel += 1; } },
  { id: "black_hole", name: "微型黑洞", category: "控制", description: "定期生成引力核心，把範圍內敵軍集中到一點；升星縮短冷卻。", unlockCost: 125, maxStacks: 5, apply: () => { cardEffects.blackHoleLevel += 1; cardEffects.blackHoleTimer = Math.min(cardEffects.blackHoleTimer, 2); } },
  { id: "extra_row", name: "雙列火網", category: "輸出", description: "主砲兩側增加一排同步彈幕；升星提高側砲傷害。", unlockCost: 120, maxStacks: 5, apply: () => { cardEffects.extraRowLevel += 1; } },
  { id: "armor_breaker", name: "破甲彈芯", category: "輸出", description: "物理攻擊每星忽略 6% 護甲，最多 30%。", unlockTier: 2, maxStacks: 5, apply: () => { cardEffects.armorBreakerLevel += 1; } },
  { id: "plasma_burst", name: "電漿爆環", category: "魔攻", description: "每 8 次主砲命中引爆魔法範圍傷害；每星提高威力。", unlockTier: 2, maxStacks: 5, apply: () => { cardEffects.plasmaBurstLevel += 1; } },
  { id: "finisher", name: "終結協議", category: "輸出", description: "對生命低於 30% 的敵人每星傷害 +8%。", unlockTier: 2, maxStacks: 5, apply: () => { cardEffects.finisherLevel += 1; } },
  { id: "shield_recharge", name: "護盾回充", category: "防禦", description: "定時補充 1 層護盾；每星縮短回充並提高上限。", unlockTier: 2, maxStacks: 5, apply: () => {
    cardEffects.shieldRechargeLevel += 1;
    const interval = Math.max(22, 52 - cardEffects.shieldRechargeLevel * 6);
    cardEffects.shieldRechargeTimer = cardEffects.shieldRechargeTimer > 0 ? Math.min(cardEffects.shieldRechargeTimer, interval) : interval;
  } },
  { id: "ricochet", name: "折射彈道", category: "戰術", description: "主砲 8% 起彈射鄰近敵人，造成 45% 物傷；每星機率 +3%。", unlockTier: 2, maxStacks: 5, apply: () => { cardEffects.ricochetLevel += 1; } },
  { id: "repair_nanites", name: "修復奈米群", category: "生命", description: "每星每秒回復最大生命 0.03%。", unlockTier: 2, maxStacks: 5, apply: () => { cardEffects.nanoRepairLevel += 1; } },
  { id: "bounty_matrix", name: "賞金矩陣", category: "經濟", description: "每星使擊殺金幣 ×1.04。", unlockTier: 2, maxStacks: 5, apply: () => { cardEffects.bountyMatrixLevel += 1; cardEffects.goldMultiplier *= 1.04; } },
  { id: "last_stand", name: "背水超頻", category: "輸出", description: "核心生命低於 35% 時，每星攻速 +8%。", unlockTier: 2, maxStacks: 5, apply: () => { cardEffects.lastStandLevel += 1; } }
];
for (const card of SPECIAL_CARDS) card.maxStacks = V2_CARD_MAX_STARS;
for (const card of v2Cards) {
  if (!SPECIAL_CARDS.some((item) => item.id === card.id)) SPECIAL_CARDS.push(card);
}
Object.assign(CARD_SYNERGY_TAGS, {
  chance_slow: "control", blind_rounds: "control", defection: "fleet", black_hole: "arcane", extra_row: "assault",
  armor_breaker: "assault", plasma_burst: "arcane", finisher: "assault", shield_recharge: "fortress",
  ricochet: "assault", repair_nanites: "fortress", bounty_matrix: "prosperity", last_stand: "assault"
});

for (const language of ["en", "ja", "ko", "ru", "es"]) {
  const pack = getV2LanguagePack(language);
  CONTENT_I18N[language] = CONTENT_I18N[language] || { cards: {}, meta: {} };
  CONTENT_I18N[language].cards = { ...(CONTENT_I18N[language].cards || {}), ...(pack.cards || {}) };
  CONTENT_I18N[language].meta = { ...(CONTENT_I18N[language].meta || {}), ...(pack.meta || {}) };
}

Object.assign(UPGRADE_COST_RULES,
  Object.fromEntries(V2_RUN_UPGRADES.map((item) => [item.id, { base: item.base, linear: 4.2, quadratic: 0.22, growth: item.growth }]))
);
Object.assign(UPGRADE_RULES,
  Object.fromEntries(V2_RUN_UPGRADES.map((item) => [item.id, { step: item.step }]))
);

const v2BaseGetUpgradeCost = getUpgradeCost;
getUpgradeCost = function (type) {
  const baseCost = v2BaseGetUpgradeCost(type);
  if (!BASE_AUTO_UPGRADE_IDS.includes(type)) return baseCost;
  const discount = clamp(Number(towerStats?.energySaver) || 0, 0, 0.9);
  return Math.max(1, Math.floor(baseCost * (1 - discount)));
};

for (const [language, text] of Object.entries(RUN_UI_I18N)) {
  text.enemyNames = { ...text.enemyNames };
  for (const id of Object.keys(V2_ENEMY_TEXT)) {
    text.enemyNames[id] = getV2LanguagePack(language)?.enemies?.[id]?.[0] || id.replaceAll("_", " ");
  }
}

const V2_DEFINITION_BASELINE = {
  environments: new Map(V2_ENVIRONMENTS.map((item) => [item.id, [item.name, item.description]])),
  turrets: new Map(V2_TURRET_DEFS.map((item) => [item.id, [item.name, item.description]])),
  upgrades: new Map(V2_RUN_UPGRADES.map((item) => [item.id, [item.name, item.category]])),
  meta: new Map(META_UPGRADE_DEFS.map((item) => [item.id, [item.name, item.description, item.unit]])),
  cards: new Map(SPECIAL_CARDS.map((item) => [item.id, [item.name, item.category, item.description]]))
};

function applyV2DefinitionLanguage() {
  const pack = getV2LanguagePack();
  for (const environment of V2_ENVIRONMENTS) {
    const baseline = V2_DEFINITION_BASELINE.environments.get(environment.id);
    if (baseline) [environment.name, environment.description] = baseline;
  }
  for (const turret of V2_TURRET_DEFS) {
    const baseline = V2_DEFINITION_BASELINE.turrets.get(turret.id);
    if (baseline) [turret.name, turret.description] = baseline;
  }
  for (const upgrade of V2_RUN_UPGRADES) {
    const baseline = V2_DEFINITION_BASELINE.upgrades.get(upgrade.id);
    if (baseline) [upgrade.name, upgrade.category] = baseline;
  }
  for (const definition of META_UPGRADE_DEFS) {
    const baseline = V2_DEFINITION_BASELINE.meta.get(definition.id);
    if (baseline) [definition.name, definition.description, definition.unit] = baseline;
  }
  for (const card of SPECIAL_CARDS) {
    const baseline = V2_DEFINITION_BASELINE.cards.get(card.id);
    if (baseline) [card.name, card.category, card.description] = baseline;
  }
  for (const environment of V2_ENVIRONMENTS) {
    const translated = pack.environments?.[environment.id];
    if (translated) [environment.name, environment.description] = translated;
  }
  for (const turret of V2_TURRET_DEFS) {
    const translated = pack.turrets?.[turret.id];
    if (translated) [turret.name, turret.description] = translated;
  }
  for (const upgrade of V2_RUN_UPGRADES) {
    const translated = pack.upgrades?.[upgrade.id];
    if (translated) [upgrade.name, upgrade.category] = translated;
  }
  for (const definition of META_UPGRADE_DEFS) {
    const translated = pack.meta?.[definition.id];
    if (translated) [definition.name, definition.description] = translated;
    if (["reflectModule", "waveObsidian"].includes(definition.id)) definition.unit = currentLanguage === "zh" ? "級" : " Lv.";
    if (definition.id === "fighterHangar") definition.unit = ({ zh: "架", ja: "機", ko: "기" })[currentLanguage] || "";
  }
  for (const card of SPECIAL_CARDS) {
    const translated = pack.cards?.[card.id];
    if (translated) [card.name, card.category, card.description] = translated;
  }
}

// ---------- Save compatibility ----------

const v2BaseGetLocalSavePayload = getLocalSavePayload;
getLocalSavePayload = function () {
  return {
    ...v2BaseGetLocalSavePayload(),
    v2Progress: normalizeV2Progress(v2Progress),
    autoUpgrade: normalizeAutoUpgradeConfig(autoUpgradeConfig)
  };
};

const v2BaseGetStableSavePayload = getStableSavePayload;
getStableSavePayload = function () {
  const stable = JSON.parse(v2BaseGetStableSavePayload());
  stable.v2Progress = normalizeV2Progress(v2Progress);
  stable.autoUpgrade = normalizeAutoUpgradeConfig(autoUpgradeConfig);
  return JSON.stringify(stable);
};

const v2BaseApplyCloudSave = applyCloudSave;
applyCloudSave = function (save, options = {}) {
  v2BaseApplyCloudSave(save, options);
  if (save?.autoUpgrade && (options.replaceLocalProgress === true || !localStorage.getItem(AUTO_UPGRADE_KEY))) {
    autoUpgradeConfig = normalizeAutoUpgradeConfig(save.autoUpgrade);
    localStorage.setItem(AUTO_UPGRADE_KEY, JSON.stringify(autoUpgradeConfig));
    renderAutoUpgradeControls();
  }
  if (options.replaceLocalProgress === true) {
    v2Progress = normalizeV2Progress(save?.v2Progress);
    reconcileV2Equipment(unlockedTier);
    localStorage.setItem(V2_SAVE_KEY, JSON.stringify(v2Progress));
    renderV2Workshop();
  } else if (save?.v2Progress) {
    const remote = normalizeV2Progress(save.v2Progress);
    const local = normalizeV2Progress(v2Progress);
    const migrateRemote = local.revision === 0 && remote.revision === 0 && local.lifetimeFragments === 0 && remote.lifetimeFragments > 0;
    if (remote.revision > local.revision || migrateRemote) v2Progress = remote;
    reconcileV2Equipment(unlockedTier);
    localStorage.setItem(V2_SAVE_KEY, JSON.stringify(v2Progress));
    renderV2Workshop();
  }
};

// ---------- Tier progression ----------

computeUnlockedTier = function (records = tierRecords) {
  let unlocked = 1;
  for (let tier = 1; tier < MAX_TIER; tier += 1) {
    if ((Number(records[tier]) || 1) >= getTierUnlockRequirement(tier + 1)) unlocked = tier + 1;
    else break;
  }
  return clampTier(unlocked);
};

renderTierSelector = function () {
  const locked = !isTierUnlocked(selectedTier);
  const selectedRecord = Math.max(1, Math.floor(Number(tierRecords[selectedTier]) || 1));
  const tierText = TIER_UI_I18N[currentLanguage] || TIER_UI_I18N.en;
  const requirement = getTierUnlockRequirement(selectedTier);
  const values = { tier: selectedTier, prev: Math.max(1, selectedTier - 1), wave: requirement, best: selectedRecord };
  tierIconButton.classList.toggle("locked", locked);
  tierIconText.innerHTML = `T${selectedTier}<small>${locked ? tierText.locked : tierText.open}</small>`;
  tierStatusText.textContent = locked ? formatLocalized(tierText.lockedLine, values) : formatLocalized(tierText.bestLine, values);
  deploymentButton.disabled = locked;
  deploymentButton.title = locked ? formatLocalized(tierText.lockedTitle, values) : "";
  renderV2Codex();
  renderV2Workshop();
};

// ---------- Home UI ----------

const homeCodexTab = document.getElementById("homeCodexTab");
const homeWorkshopTab = document.getElementById("homeWorkshopTab");
const homeUltimateTab = document.getElementById("homeUltimateTab");
const homeStoreTab = document.getElementById("homeStoreTab");
const homeVipPassButton = document.getElementById("homeVipPassButton");
const homeCodexPage = document.getElementById("homeCodexPage");
const homeWorkshopPage = document.getElementById("homeWorkshopPage");
const homeUltimatePage = document.getElementById("homeUltimatePage");
const homeStorePage = document.getElementById("homeStorePage");
const enemyCodexGrid = document.getElementById("enemyCodexGrid");
const turretWorkshopGrid = document.getElementById("turretWorkshopGrid");
const reservedStoreGrid = document.getElementById("reservedStoreGrid");
const backgroundDefaultButton = document.getElementById("backgroundDefaultButton");
const backgroundStoreStatus = document.getElementById("backgroundStoreStatus");
const workshopSummary = document.getElementById("workshopSummary");
const workshopCommandCenter = document.getElementById("workshopCommandCenter");
const workshopTierHint = document.getElementById("workshopTierHint");
const environmentHud = document.getElementById("environmentHud");
const fragmentHud = document.getElementById("fragmentHud");
const v2UpgradeGrid = document.getElementById("v2UpgradeGrid");
const autoUpgradeTitle = document.getElementById("autoUpgradeTitle");
const autoUpgradeHint = document.getElementById("autoUpgradeHint");
const autoUpgradeEnabled = document.getElementById("autoUpgradeEnabled");
const autoUpgradeEnabledLabel = document.getElementById("autoUpgradeEnabledLabel");
const autoUpgradeThresholdLabel = document.getElementById("autoUpgradeThresholdLabel");
const autoUpgradeThreshold = document.getElementById("autoUpgradeThreshold");
const autoUpgradeSequence = document.getElementById("autoUpgradeSequence");
const autoUpgradeRunToggle = document.getElementById("autoUpgradeRunToggle");
const autoUpgradeRunStatus = document.getElementById("autoUpgradeRunStatus");
const autoUpgradeEditButton = document.getElementById("autoUpgradeEditButton");
const autoUpgradeRunEditor = document.getElementById("autoUpgradeRunEditor");
const autoUpgradeRunThresholdLabel = document.getElementById("autoUpgradeRunThresholdLabel");
const autoUpgradeRunThreshold = document.getElementById("autoUpgradeRunThreshold");
const autoUpgradeRunSequence = document.getElementById("autoUpgradeRunSequence");
const homeHeroKicker = document.getElementById("homeHeroKicker");
const homeHeroSubtitle = document.getElementById("homeHeroSubtitle");
const appDownloadButton = document.getElementById("appDownloadButton");
const appDownloadKicker = document.getElementById("appDownloadKicker");
const appDownloadLabel = document.getElementById("appDownloadLabel");
const homeMissionKicker = document.getElementById("homeMissionKicker");
const homeMissionTitle = document.getElementById("homeMissionTitle");
const homePilotKicker = document.getElementById("homePilotKicker");
const homePilotTitle = document.getElementById("homePilotTitle");
const pilotLoginToggle = document.getElementById("pilotLoginToggle");
const commanderAvatarButton = document.getElementById("commanderAvatarButton");
const commanderAvatarArt = document.getElementById("commanderAvatarArt");
const commanderAvatarLevel = document.getElementById("commanderAvatarLevel");
const avatarPicker = document.getElementById("avatarPicker");
const avatarPickerTitle = document.getElementById("avatarPickerTitle");
const avatarPickerClose = document.getElementById("avatarPickerClose");
const avatarChoiceGrid = document.getElementById("avatarChoiceGrid");
const rewardedSupplyCard = document.getElementById("rewardedSupplyCard");
const rewardedSupplyKicker = document.getElementById("rewardedSupplyKicker");
const rewardedSupplyTitle = document.getElementById("rewardedSupplyTitle");
const rewardedSupplyDescription = document.getElementById("rewardedSupplyDescription");
const rewardedSupplyStatus = document.getElementById("rewardedSupplyStatus");
const rewardedSupplyButton = document.getElementById("rewardedSupplyButton");
const homeRewardedSupplyButton = document.getElementById("homeRewardedSupplyButton");
const homeRewardedSupplyTitle = document.getElementById("homeRewardedSupplyTitle");
const homeRewardedSupplyHint = document.getElementById("homeRewardedSupplyHint");
const rewardedRevivePanel = document.getElementById("rewardedRevivePanel");
const rewardedReviveKicker = document.getElementById("rewardedReviveKicker");
const rewardedReviveTitle = document.getElementById("rewardedReviveTitle");
const rewardedReviveDescription = document.getElementById("rewardedReviveDescription");
const rewardedReviveStatus = document.getElementById("rewardedReviveStatus");
const rewardedReviveAdButton = document.getElementById("rewardedReviveAdButton");
const rewardedReviveObsidianButton = document.getElementById("rewardedReviveObsidianButton");
const rewardedReviveTicketButton = document.getElementById("rewardedReviveTicketButton");
const v2EnvironmentBanner = document.createElement("div");
v2EnvironmentBanner.className = "v2-env-banner";
v2EnvironmentBanner.hidden = true;
document.body.appendChild(v2EnvironmentBanner);

const REWARDED_OBSIDIAN_AMOUNT = 5;
const REWARDED_REVIVE_OBSIDIAN_COST = 30;
const REWARDED_REVIVE_MIN_WAVE = 10;
const GOOGLE_REWARDED_TEST_UNIT_ID = IS_IOS_APP ? "ca-app-pub-3940256099942544/1712485313" : "ca-app-pub-3940256099942544/5224354917";
const GOOGLE_INTERSTITIAL_TEST_UNIT_ID = IS_IOS_APP ? "ca-app-pub-3940256099942544/4411468910" : "ca-app-pub-3940256099942544/1033173712";
const POST_RUN_INTERSTITIAL_FIRST_RUN = 2;
const POST_RUN_INTERSTITIAL_INTERVAL = 3;
const POST_RUN_INTERSTITIAL_COOLDOWN_MS = 10 * 60 * 1000;
const POST_RUN_AD_STATE_KEY = "spaceTowerPostRunAdStateV1";
const GOOGLE_REWARDED_PRODUCTION_UNIT_IDS = Object.freeze({
  daily_obsidian: "ca-app-pub-4461762858602817/9681205002",
  utility_consumable: "ca-app-pub-4461762858602817/9681205002",
  launch_reward_double: "ca-app-pub-4461762858602817/9681205002",
  run_revive: "ca-app-pub-4461762858602817/5964221194",
  result_double: "ca-app-pub-4461762858602817/9681205002",
  card_reroll: "ca-app-pub-4461762858602817/9681205002",
  trial_attempt: "ca-app-pub-4461762858602817/9681205002"
});
function shouldUseRewardedAdPreview(nativeApp, devMode, protocol, hostname) {
  // Capacitor serves bundled Android assets from https://localhost. Treating
  // every localhost origin as a browser preview silently bypassed AdMob in the
  // production app, so native runtimes must always use the native ad bridge.
  return !nativeApp && (
    devMode
    || protocol === "file:"
    || ["localhost", "127.0.0.1", "::1"].includes(hostname)
  );
}

const LOCAL_REWARDED_AD_PREVIEW = shouldUseRewardedAdPreview(
  IS_NATIVE_APP,
  DEV_MODE,
  location.protocol,
  location.hostname
);
let rewardedAdsReady = LOCAL_REWARDED_AD_PREVIEW;
let iosTrackingAuthorized = false;
let rewardedAdBusy = false;
let rewardedAdsInitialization = null;
let rewardedAdLastStage = LOCAL_REWARDED_AD_PREVIEW ? "web_preview" : "idle";
let rewardedAdLastPlacement = "";
let rewardedAdLastError = null;
let rewardedReviveUsed = false;
let rewardedSupplyMessage = "";
let rewardedReviveMessage = "";
let rewardedAdSeenThisRun = false;
let adRecoveryTimer = null;
let adRecoveryAttempts = 0;
let postRunAdGeneration = 0;

function scheduleAdRecovery() {
  if (adRecoveryTimer || adRecoveryAttempts >= 3 || !IS_NATIVE_APP) return;
  adRecoveryTimer = setTimeout(() => {
    adRecoveryTimer = null;
    if (document.hidden || rewardedAdsReady || rewardedAdBusy) return;
    adRecoveryAttempts += 1;
    void initializeRewardedAds();
  }, [15000, 60000, 180000][adRecoveryAttempts]);
}

window.addEventListener("online", () => {
  if (!rewardedAdsReady) { adRecoveryAttempts = 0; scheduleAdRecovery(); }
});
document.addEventListener("visibilitychange", () => {
  if (!document.hidden && !rewardedAdsReady) scheduleAdRecovery();
});

function getRewardedAdsText() {
  return getV2LanguagePack()?.rewardedAds || getV2LanguagePack("en")?.rewardedAds || {};
}

function getAdFreeActionLabel(fallback, reward = "") {
  if (!window.hasSpaceTowerNoAds?.()) return fallback;
  const labels = { zh: "免廣告直接領取", en: "Claim instantly", ja: "広告なしで受取", ko: "광고 없이 받기", ru: "Забрать без рекламы", es: "Cobrar sin anuncio" };
  return `${labels[currentLanguage] || labels.en}${reward ? ` · ${reward}` : ""}`;
}

function trackRewardedEvent(name, placement, detail = {}) {
  window.dispatchEvent(new CustomEvent("space-tower-analytics", {
    detail: { name, placement, at: Date.now(), ...detail }
  }));
}

function normalizeRewardedAdError(error) {
  if (!error) return { message: "Unknown rewarded-ad error" };
  if (typeof error === "string") return { message: error };
  return {
    code: error.code == null ? undefined : String(error.code),
    message: String(error.message || error.localizedMessage || error)
  };
}

function recordRewardedAdFailure(error, placement, stage) {
  const detail = normalizeRewardedAdError(error);
  rewardedAdLastStage = stage;
  rewardedAdLastPlacement = placement || rewardedAdLastPlacement;
  rewardedAdLastError = { ...detail, stage, at: Date.now() };
  trackRewardedEvent("rewarded_failed", rewardedAdLastPlacement, { stage, ...detail });
  window.spaceTowerRecordException?.(
    error instanceof Error ? error : new Error(detail.message),
    { feature: "rewarded_ad", placement: rewardedAdLastPlacement, stage, code: detail.code }
  );
  console.warn("[SpaceTower][RewardedAd]", stage, rewardedAdLastPlacement, detail.code || "", detail.message);
}

function getAdMobPlugin() {
  return window.Capacitor?.Plugins?.AdMob || null;
}

function updatePrivacyOptionsAvailability(consentInfo) {
  const required = consentInfo?.privacyOptionsRequirementStatus === "REQUIRED";
  window.dispatchEvent(new CustomEvent("space-tower-privacy-options-status", {
    detail: { required }
  }));
  return required;
}

function getRewardedAdMode() {
  return String((IS_IOS_APP ? window.SPACE_TOWER_AD_CONFIG?.ios?.mode : window.SPACE_TOWER_AD_CONFIG?.mode) || "test").toLowerCase() === "production"
    ? "production"
    : "test";
}

function getConfiguredRewardedUnitId(placement) {
  if (getRewardedAdMode() !== "production") return "";
  const runtimeConfig = IS_IOS_APP ? (window.SPACE_TOWER_AD_CONFIG?.ios || {}) : (window.SPACE_TOWER_AD_CONFIG || {});
  return String(
    runtimeConfig.rewardedUnitIds?.[placement]
    || runtimeConfig.rewardedUnitId
    || (!IS_IOS_APP && GOOGLE_REWARDED_PRODUCTION_UNIT_IDS[placement])
    || ""
  ).trim();
}

async function initializeRewardedAdsOnce() {
  if (LOCAL_REWARDED_AD_PREVIEW) {
    rewardedAdsReady = true;
    rewardedAdLastStage = "web_preview";
    renderRewardedSupply();
    return true;
  }
  const adMob = getAdMobPlugin();
  if (!IS_NATIVE_APP) {
    rewardedAdsReady = false;
    rewardedAdLastStage = "web_unavailable";
    renderRewardedSupply();
    return false;
  }
  if (!adMob) {
    rewardedAdsReady = false;
    recordRewardedAdFailure("Capacitor AdMob plugin is unavailable", rewardedAdLastPlacement, "plugin_unavailable");
    renderRewardedSupply();
    return false;
  }
  try {
    const isTesting = getRewardedAdMode() !== "production";
    rewardedAdLastStage = "requesting_consent";
    const consentBridge = window.Capacitor?.Plugins?.AdConsent;
    let consentInfo = consentBridge
      ? await consentBridge.requestConsent()
      : await adMob.requestConsentInfo();
    if (!consentBridge && consentInfo?.isConsentFormAvailable && consentInfo?.canRequestAds === false) {
      rewardedAdLastStage = "showing_consent";
      consentInfo = await adMob.showConsentForm();
    }
    updatePrivacyOptionsAvailability(consentInfo);
    iosTrackingAuthorized = consentInfo?.trackingAuthorized === true;
    rewardedAdsReady = false;
    if (consentInfo?.errorMessage) {
      trackRewardedEvent("ad_consent_error", "initialization", {
        code: String(consentInfo.errorCode), cached_consent: consentInfo.canRequestAds === true
      });
    }
    if (consentInfo?.canRequestAds === true) {
      rewardedAdLastStage = "initializing";
      await adMob.initialize({ initializeForTesting: isTesting });
      rewardedAdsReady = true;
      adRecoveryAttempts = 0;
      if (adRecoveryTimer) clearTimeout(adRecoveryTimer);
      adRecoveryTimer = null;
    } else if (consentInfo?.errorMessage) scheduleAdRecovery();
    rewardedAdLastStage = rewardedAdsReady ? "ready" : "consent_required";
    rewardedAdLastError = null;
  } catch (error) {
    updatePrivacyOptionsAvailability(null);
    rewardedAdsReady = false;
    recordRewardedAdFailure(error, rewardedAdLastPlacement, rewardedAdLastStage);
    scheduleAdRecovery();
  }
  renderRewardedSupply();
  return rewardedAdsReady;
}

async function initializeRewardedAds() {
  if (rewardedAdsInitialization) return rewardedAdsInitialization;
  rewardedAdsInitialization = initializeRewardedAdsOnce();
  try {
    return await rewardedAdsInitialization;
  } finally {
    rewardedAdsInitialization = null;
  }
}

async function showPrivacyOptions() {
  const adMob = getAdMobPlugin();
  const consentBridge = window.Capacitor?.Plugins?.AdConsent;
  const privacyPresenter = consentBridge?.showPrivacyOptionsForm ? consentBridge : adMob;
  if (!IS_NATIVE_APP || !privacyPresenter?.showPrivacyOptionsForm) return false;
  try {
    await privacyPresenter.showPrivacyOptionsForm();
    const consentInfo = consentBridge ? await consentBridge.requestConsent() : await adMob.requestConsentInfo();
    updatePrivacyOptionsAvailability(consentInfo);
    rewardedAdsReady = consentInfo?.canRequestAds === true;
    iosTrackingAuthorized = consentInfo?.trackingAuthorized === true;
    renderRewardedSupply();
    return true;
  } catch (error) {
    recordRewardedAdFailure(error, "privacy_options", "privacy_options_failed");
    return false;
  }
}

async function showOptInRewardedAd(placement, options = {}) {
  if (rewardedAdBusy) return false;
  if (window.hasSpaceTowerNoAds?.()) {
    trackRewardedEvent("rewarded_offer", placement, { ad_free: true });
    trackRewardedEvent("rewarded_skipped_entitlement", placement, { ad_free: true });
    trackRewardedEvent("rewarded_complete", placement, { ad_free: true });
    return true;
  }
  rewardedAdBusy = true;
  rewardedAdLastPlacement = placement;
  rewardedAdLastStage = "starting";
  rewardedAdLastError = null;
  trackRewardedEvent("rewarded_offer", placement);
  trackRewardedEvent("rewarded_ad_offer", placement);
  trackRewardedEvent("rewarded_start", placement);
  renderRewardedSupply();
  renderRewardedRevive();
  try {
    if (LOCAL_REWARDED_AD_PREVIEW) {
      await new Promise((resolve) => setTimeout(resolve, 650));
      trackRewardedEvent("rewarded_complete", placement, { test: true });
      trackRewardedEvent("rewarded_ad_complete", placement, { test: true });
      return true;
    }
    if (!rewardedAdsReady && !(await initializeRewardedAds())) return false;
    const adMob = getAdMobPlugin();
    if (!adMob) {
      recordRewardedAdFailure("Capacitor AdMob plugin is unavailable", placement, "plugin_unavailable");
      return false;
    }
    const isTesting = getRewardedAdMode() !== "production";
    const adId = isTesting ? GOOGLE_REWARDED_TEST_UNIT_ID : getConfiguredRewardedUnitId(placement);
    if (!adId) {
      recordRewardedAdFailure("No rewarded-ad unit is configured for this placement", placement, "unit_id_missing");
      return false;
    }
    rewardedAdLastStage = "loading";
    await adMob.prepareRewardVideoAd({
      adId,
      npa: IS_IOS_APP && !iosTrackingAuthorized,
      isTesting,
      immersiveMode: true,
      ...(options.ssvCustomData ? { ssv: { customData: String(options.ssvCustomData) } } : {})
    });
    rewardedAdLastStage = "showing";
    const reward = await adMob.showRewardVideoAd();
    const completed = Boolean(reward && (reward.type || Number.isFinite(Number(reward.amount))));
    if (completed) {
      rewardedAdSeenThisRun = true;
      rewardedAdLastStage = "completed";
      trackRewardedEvent("rewarded_complete", placement, { test: isTesting });
      trackRewardedEvent("rewarded_ad_complete", placement, { test: isTesting });
    } else {
      recordRewardedAdFailure("Rewarded ad closed without a reward", placement, "not_rewarded");
    }
    return completed;
  } catch (error) {
    recordRewardedAdFailure(error, placement, rewardedAdLastStage === "showing" ? "show_failed" : "load_failed");
    return false;
  } finally {
    rewardedAdBusy = false;
    renderRewardedSupply();
    renderRewardedRevive();
  }
}

function readPostRunAdState() {
  try {
    const value = JSON.parse(localStorage.getItem(POST_RUN_AD_STATE_KEY) || "null") || {};
    return { completedRuns: Math.max(0, Math.floor(Number(value.completedRuns) || 0)), lastShownAt: Math.max(0, Math.floor(Number(value.lastShownAt) || 0)), pending: value.pending === true };
  } catch {
    return { completedRuns: 0, lastShownAt: 0 };
  }
}

function writePostRunAdState(state) {
  if (DEV_MODE) return;
  localStorage.setItem(POST_RUN_AD_STATE_KEY, JSON.stringify(state));
}

function isPostRunInterstitialDue(completedRuns) {
  return completedRuns >= POST_RUN_INTERSTITIAL_FIRST_RUN
    && (completedRuns - POST_RUN_INTERSTITIAL_FIRST_RUN) % POST_RUN_INTERSTITIAL_INTERVAL === 0;
}

async function showConfirmedInterstitial(adMob, eligible, onShown) {
  const handles = [];
  let finish;
  const completion = new Promise(resolve => { finish = resolve; });
  try {
    handles.push(await adMob.addListener("interstitialAdShowed", onShown));
    handles.push(await adMob.addListener("interstitialAdDismissed", () => finish({})));
    handles.push(await adMob.addListener("interstitialAdFailedToShow", error => finish({ error })));
    if (!eligible()) return false;
    await adMob.showInterstitial();
    const result = await completion;
    if (result.error) throw result.error;
    return true;
  } finally {
    await Promise.allSettled(handles.map(handle => handle.remove()));
  }
}

async function maybeShowPostRunInterstitial() {
  const generation = postRunAdGeneration;
  const state = readPostRunAdState();
  state.completedRuns += 1;
  state.pending = state.pending || isPostRunInterstitialDue(state.completedRuns);
  writePostRunAdState(state);
  if (window.hasSpaceTowerNoAds?.() || rewardedAdSeenThisRun || !state.pending || rewardedAdBusy) return false;
  const eligible = () => generation === postRunAdGeneration && !document.hidden
    && !running && !commercePurchaseActive && commerceAppActive
    && !resultScreen.classList.contains("hidden") && !window.hasSpaceTowerNoAds?.();
  if (!eligible()) return false;
  if (Date.now() - state.lastShownAt < POST_RUN_INTERSTITIAL_COOLDOWN_MS) return false;
  if (IS_IOS_APP || !IS_NATIVE_APP || LOCAL_REWARDED_AD_PREVIEW) return false;
  const adMob = getAdMobPlugin();
  if (!adMob?.prepareInterstitial || !adMob?.showInterstitial) return false;
  const isTesting = getRewardedAdMode() !== "production";
  const adId = isTesting
    ? GOOGLE_INTERSTITIAL_TEST_UNIT_ID
    : String(window.SPACE_TOWER_AD_CONFIG?.interstitialUnitId || "").trim();
  if (!adId) {
    trackRewardedEvent("interstitial_unavailable", "post_run", { reason: "unit_id_missing" });
    return false;
  }
  rewardedAdBusy = true;
  try {
    if (!rewardedAdsReady && !(await initializeRewardedAds())) return false;
    if (!eligible()) return false;
    trackRewardedEvent("interstitial_load", "post_run", { completed_runs: state.completedRuns, test: isTesting });
    await adMob.prepareInterstitial({ adId, isTesting, immersiveMode: true });
    if (!eligible()) return false;
    return await showConfirmedInterstitial(adMob, eligible, () => {
      state.lastShownAt = Date.now();
      state.pending = false;
      writePostRunAdState(state);
      trackRewardedEvent("interstitial_show", "post_run", { completed_runs: state.completedRuns, test: isTesting });
    });
  } catch (error) {
    recordRewardedAdFailure(error, "post_run", "interstitial_failed");
    return false;
  } finally {
    rewardedAdBusy = false;
    renderRewardedSupply();
    renderRewardedRevive();
  }
}

window.maybeShowSpaceTowerPostRunInterstitial = maybeShowPostRunInterstitial;
window.resetSpaceTowerRunAdState = () => { rewardedAdSeenThisRun = false; postRunAdGeneration += 1; };

window.showRewardedAd = showOptInRewardedAd;
window.getSpaceTowerRewardedAdMode = getRewardedAdMode;
window.getSpaceTowerRewardedAdStatus = () => ({
  nativeApp: IS_NATIVE_APP,
  localPreview: LOCAL_REWARDED_AD_PREVIEW,
  mode: getRewardedAdMode(),
  ready: rewardedAdsReady,
  busy: rewardedAdBusy,
  lastStage: rewardedAdLastStage,
  lastPlacement: rewardedAdLastPlacement,
  lastError: rewardedAdLastError ? { ...rewardedAdLastError } : null
});
window.showSpaceTowerPrivacyOptions = showPrivacyOptions;

function renderRewardedSupply() {
  if (!rewardedSupplyCard) return;
  rewardedSupplyCard.hidden = false;
  if (homeRewardedSupplyButton) homeRewardedSupplyButton.hidden = false;
  const text = getRewardedAdsText();
  rewardedSupplyKicker.textContent = text.supplyKicker || "SUPPLY SIGNAL";
  rewardedSupplyTitle.textContent = text.supplyTitle || "Obsidian Supply";
  rewardedSupplyDescription.textContent = text.supplyDescription || "";
  const supplyState = window.getSpaceTowerRewardedSupplyState?.() || { unlocked: true, remaining: 5, limit: 5 };
  rewardedSupplyButton.textContent = getAdFreeActionLabel(text.watchSupply || "Watch Ad · +5", `+${REWARDED_OBSIDIAN_AMOUNT}`);
  rewardedSupplyButton.disabled = rewardedAdBusy || supplyState.remaining <= 0;
  rewardedSupplyStatus.textContent = rewardedSupplyMessage
    || (supplyState.remaining <= 0 ? (text.supplyComplete || "Today's supply is complete")
      : String(text.dailyRemaining || "Daily claims remaining: {remaining}/{limit}").replace("{remaining}", supplyState.remaining).replace("{limit}", supplyState.limit));
  if (homeRewardedSupplyTitle) homeRewardedSupplyTitle.textContent = text.supplyTitle || "Obsidian Supply";
  if (homeRewardedSupplyHint) homeRewardedSupplyHint.textContent = rewardedAdBusy ? (text.loading || "Loading…") : getAdFreeActionLabel(text.watchSupply || "Watch Ad · +5", `+${REWARDED_OBSIDIAN_AMOUNT}`);
  if (homeRewardedSupplyButton) homeRewardedSupplyButton.disabled = rewardedAdBusy || supplyState.remaining <= 0;
}

async function claimRewardedObsidian() {
  const text = getRewardedAdsText();
  const supplyState = window.getSpaceTowerRewardedSupplyState?.();
  if (supplyState && supplyState.remaining <= 0) {
    renderRewardedSupply();
    return;
  }
  rewardedSupplyMessage = text.loading || "";
  renderRewardedSupply();
  const completed = await showOptInRewardedAd("daily_obsidian");
  if (!completed) {
    rewardedSupplyMessage = rewardedAdsReady ? text.failed : text.unavailable;
    renderRewardedSupply();
    return;
  }
  const granted = window.grantSpaceTowerRewardedSupply?.(REWARDED_OBSIDIAN_AMOUNT) ?? 0;
  rewardedSupplyMessage = granted > 0 || DEV_MODE ? (text.granted || "") : (text.supplyComplete || "Today's supply is complete");
  renderObsidian();
  renderRewardedSupply();
}

function renderRewardedRevive() {
  if (!rewardedRevivePanel) return;
  const eligible = wave >= REWARDED_REVIVE_MIN_WAVE && !rewardedReviveUsed;
  rewardedRevivePanel.hidden = !eligible;
  if (!eligible) return;
  const text = getRewardedAdsText();
  rewardedReviveKicker.textContent = text.reviveKicker || "EMERGENCY REBOOT";
  rewardedReviveTitle.textContent = text.reviveTitle || "Emergency Revive";
  rewardedReviveDescription.textContent = text.reviveDescription || "";
  rewardedReviveAdButton.hidden = false;
  rewardedReviveAdButton.textContent = getAdFreeActionLabel(text.watchRevive || "Watch Ad to Revive");
  rewardedReviveObsidianButton.textContent = text.spendRevive || "Spend 30 Obsidian";
  if (rewardedReviveTicketButton) rewardedReviveTicketButton.textContent = `${text.useReviveTicket || "Use Revive Ticket"} · ${window.getSpaceTowerReviveTicketCount?.() || 0}`;
  rewardedReviveAdButton.disabled = rewardedAdBusy;
  rewardedReviveObsidianButton.disabled = rewardedAdBusy || (!DEV_MODE && obsidian < REWARDED_REVIVE_OBSIDIAN_COST);
  if (rewardedReviveTicketButton) rewardedReviveTicketButton.disabled = rewardedAdBusy || (window.getSpaceTowerReviveTicketCount?.() || 0) < 1;
  rewardedReviveObsidianButton.title = !DEV_MODE && obsidian < REWARDED_REVIVE_OBSIDIAN_COST
    ? text.insufficientObsidian || ""
    : "";
  rewardedReviveStatus.textContent = rewardedReviveMessage || "";
}

function performRewardedRevive(source) {
  if (rewardedReviveUsed || wave < REWARDED_REVIVE_MIN_WAVE) return false;
  rewardedReviveUsed = true;
  rewardedReviveMessage = getRewardedAdsText().revived || "";
  coreHp = Math.max(1, towerStats.maxHp * 0.5);
  const safeRadius = Math.max(getTowerRange() * 1.08, 240);
  enemies = enemies.filter((enemy) => dist(enemy, tower) > safeRadius);
  bullets = [];
  bossWarning = null;
  wavePauseTimer = Math.max(wavePauseTimer, 1.8);
  pushVisualEffect(shockwaves, 48, { x: tower.x, y: tower.y, r: 10, life: 0.8, maxLife: 0.8, color: "#83f5d3", emp: true });
  hideResultScreen();
  setUpgradeDrawer(false);
  running = true;
  isPaused = false;
  pauseButton.textContent = getV2LanguagePack()?.controls?.pause || EXTRA_I18N[currentLanguage].pause;
  updateHud();
  saveActiveRunCheckpoint();
  trackRewardedEvent("revive_complete", "run_revive", { source, wave });
  if (source === "rewarded_ad") trackRewardedEvent("revive_by_ad", "run_revive", { wave });
  return true;
}

async function reviveWithRewardedAd() {
  rewardedReviveMessage = getRewardedAdsText().loading || "";
  renderRewardedRevive();
  const completed = await showOptInRewardedAd("run_revive");
  if (!completed) {
    rewardedReviveMessage = rewardedAdsReady ? getRewardedAdsText().failed : getRewardedAdsText().unavailable;
    renderRewardedRevive();
    return;
  }
  performRewardedRevive("rewarded_ad");
}

function reviveWithObsidian() {
  if (!DEV_MODE && obsidian < REWARDED_REVIVE_OBSIDIAN_COST) {
    rewardedReviveMessage = getRewardedAdsText().insufficientObsidian || "";
    renderRewardedRevive();
    return;
  }
  if (!DEV_MODE) {
    obsidian -= REWARDED_REVIVE_OBSIDIAN_COST;
    saveObsidian({ critical: true });
  }
  window.spaceTowerTrackEvent?.("obsidian_spend", { sink: "run_revive", item_id: "revive", amount: REWARDED_REVIVE_OBSIDIAN_COST });
  performRewardedRevive("obsidian");
}

function reviveWithTicket() {
  if (!window.consumeSpaceTowerReviveTicket?.()) return;
  performRewardedRevive("revive_ticket");
}

rewardedSupplyButton?.addEventListener("click", claimRewardedObsidian);
homeRewardedSupplyButton?.addEventListener("click", claimRewardedObsidian);
rewardedReviveAdButton?.addEventListener("click", reviveWithRewardedAd);
rewardedReviveObsidianButton?.addEventListener("click", reviveWithObsidian);
rewardedReviveTicketButton?.addEventListener("click", reviveWithTicket);

const rewardedBaseShowResultScreen = showResultScreen;
showResultScreen = function () {
  rewardedBaseShowResultScreen();
  rewardedReviveMessage = "";
  renderRewardedRevive();
};

let leaderboardRefreshTimer = 0;

setHomePage = function (page, moveFocus = false) {
  const pages = [
    ["play", homePlayTab, homePlayPage],
    ["tasks", homeTasksTab, homeTasksPage],
    ["leaderboard", homeLeaderboardTab, homeLeaderboardPage],
    ["codex", homeCodexTab, homeCodexPage],
    ["workshop", homeWorkshopTab, homeWorkshopPage],
    ["ultimate", homeUltimateTab, homeUltimatePage],
    ["store", homeStoreTab, homeStorePage]
  ];
  const active = pages.some(([id]) => id === page) ? page : "play";
  for (const [id, tab, panel] of pages) {
    const selected = id === active;
    panel.classList.toggle("hidden", !selected);
    panel.hidden = !selected;
    tab.setAttribute("aria-selected", String(selected));
    tab.tabIndex = selected ? 0 : -1;
    if (selected && moveFocus) tab.focus();
  }
  if (active === "codex") renderV2Codex();
  if (leaderboardRefreshTimer) {
    window.clearInterval(leaderboardRefreshTimer);
    leaderboardRefreshTimer = 0;
  }
  if (active === "leaderboard") {
    void loadLeaderboard();
    leaderboardRefreshTimer = window.setInterval(() => {
      if (document.visibilityState === "visible" && !homeLeaderboardPage.hidden) void loadLeaderboard();
    }, 30000);
  }
  if (active === "workshop") renderV2Workshop();
  if (active === "ultimate" && typeof renderUltimateWorkshop === "function") renderUltimateWorkshop();
  if (active === "store") {
    renderBackgroundStore();
    renderRewardedSupply();
  }
  loginScreen.scrollTop = 0;
};

function renderV2Codex() {
  if (!enemyCodexGrid) return;
  const ui = getV2UiText();
  const unlocked = DEV_MODE ? MAX_TIER : unlockedTier;
  enemyCodexGrid.innerHTML = "";
  for (const type of Object.values(ENEMY_TYPES)) {
    const info = getV2EnemyInfo(type.name);
    const locked = unlocked < (type.unlockTier || 1);
    const card = document.createElement("article");
    card.className = `enemy-codex-card${locked ? " locked" : ""}`;
    card.dataset.lockedLabel = ui.locked || "LOCKED";
    card.style.setProperty("--accent", type.color || "#68e8ff");
    card.innerHTML = `<div class="codex-top"><div class="enemy-glyph">${getEnemyGlyph(type.name)}</div><div class="codex-meta"><span>${escapeHtml(ui.tier || "TIER")} ${type.unlockTier || 1} · ${escapeHtml(ui.wave || "WAVE")} ${type.unlockWave || 1}</span><b>${escapeHtml(info[0])}</b></div></div><p>${escapeHtml(info[1])}</p><div class="codex-tags">${info[2].map((tag) => `<i>${escapeHtml(tag)}</i>`).join("")}</div>`;
    enemyCodexGrid.appendChild(card);
  }
}

function getBackgroundStoreState() {
  shopState = normalizeShopState(shopState);
  return shopState.backgroundStore;
}

function getEquippedV2Background() {
  const state = getBackgroundStoreState();
  const definition = V2_BACKGROUND_DEFS.find((item) => item.id === state.equipped) || null;
  return definition?.vipExclusive && !window.hasSpaceTowerVip?.() ? null : definition;
}

function setBackgroundStoreStatus(message, danger = false) {
  if (!backgroundStoreStatus) return;
  backgroundStoreStatus.textContent = message || "";
  backgroundStoreStatus.classList.toggle("danger", danger);
}

function renderBackgroundStore() {
  if (!reservedStoreGrid) return;
  const text = getV2BackgroundStoreText();
  const state = getBackgroundStoreState();
  const storeKicker = document.getElementById("storeKicker");
  const storeTitle = document.getElementById("storeTitle");
  const storeDescription = document.getElementById("storeDescription");
  if (storeKicker) storeKicker.textContent = text.kicker || "COSMIC ARMORY";
  if (storeTitle) storeTitle.textContent = text.title || "Battlefield Backgrounds";
  if (storeDescription) storeDescription.textContent = text.description || "";
  if (backgroundDefaultButton) {
    backgroundDefaultButton.textContent = text.defaultAction || "Use Default Background";
    backgroundDefaultButton.disabled = state.equipped === "default";
  }
  reservedStoreGrid.innerHTML = "";
  for (const definition of V2_BACKGROUND_DEFS) {
    const vipActive = Boolean(window.hasSpaceTowerVip?.());
    const owned = definition.vipExclusive ? vipActive : state.owned.includes(definition.id);
    const equipped = owned && state.equipped === definition.id;
    const itemText = definition.vipExclusive
      ? (currentLanguage === "zh" ? ["黑曜王座", "星殿專屬戰場；裝備後，戰鬥取得的黑曜石 +10%。"] : ["Obsidian Crown Throne", "VIP battlefield; +10% Obsidian earned in battle while equipped."])
      : (text.items?.[definition.id] || [definition.id, ""]);
    const price = window.getSpaceTowerStorePrice?.(V2_BACKGROUND_PRICE) ?? V2_BACKGROUND_PRICE;
    const canBuy = DEV_MODE || spaceCoins >= price;
    const card = document.createElement("article");
    card.className = `background-product${equipped ? " equipped" : ""}`;
    card.style.setProperty("--accent", definition.accent);
    card.innerHTML = `
      <div class="background-preview" style="background-image:url('${definition.asset}')"><span>${escapeHtml(equipped ? text.equipped : owned ? text.owned : definition.vipExclusive ? "VIP" : `${price.toLocaleString()} ${getSpaceCoinName()}`)}</span></div>
      <div class="background-product-copy">
        <b>${escapeHtml(itemText[0])}</b>
        <p>${escapeHtml(itemText[1])}</p>
        <strong>${escapeHtml(definition.vipExclusive ? (currentLanguage === "zh" ? "戰鬥黑曜石 ×1.10" : "Battle Obsidian ×1.10") : text.effect || "Gold & Obsidian ×1.02")}</strong>
      </div>
      <button type="button" data-background-id="${definition.id}" ${equipped || (!definition.vipExclusive && !owned && !canBuy) ? "disabled" : ""}>
        ${escapeHtml(equipped ? text.equipped : owned ? text.equip : definition.vipExclusive ? (currentLanguage === "zh" ? "查看 VIP" : "View VIP") : text.buy)}
      </button>`;
    reservedStoreGrid.appendChild(card);
  }
}
window.renderSpaceTowerBackgroundStore = renderBackgroundStore;

function buyOrEquipBackground(id) {
  const definition = V2_BACKGROUND_DEFS.find((item) => item.id === id);
  if (!definition) return;
  if (definition.vipExclusive && !window.hasSpaceTowerVip?.()) {
    document.getElementById("storeVipTab")?.click();
    return;
  }
  const text = getV2BackgroundStoreText();
  const state = getBackgroundStoreState();
  const owned = state.owned.includes(id);
  const price = window.getSpaceTowerStorePrice?.(V2_BACKGROUND_PRICE) ?? V2_BACKGROUND_PRICE;
  if (!owned && !definition.vipExclusive && !DEV_MODE && spaceCoins < price) {
    setBackgroundStoreStatus(text.insufficient, true);
    return;
  }
  if (!owned) {
    if (!DEV_MODE && !definition.vipExclusive) spaceCoins -= price;
    state.owned.push(id);
  }
  state.equipped = id;
  shopState.backgroundStore = state;
  saveShopState();
  if (!DEV_MODE && !owned && !definition.vipExclusive) saveSpaceCoins({ critical: true });
  else {
    renderObsidian();
    queueCloudSave({ critical: true });
  }
  setBackgroundStoreStatus(owned ? text.equipSuccess : text.purchaseSuccess);
  getV2BackgroundImage(definition);
  renderBackgroundStore();
}

function equipDefaultBackground() {
  const text = getV2BackgroundStoreText();
  const state = getBackgroundStoreState();
  state.equipped = "default";
  shopState.backgroundStore = state;
  saveShopState();
  queueCloudSave();
  setBackgroundStoreStatus(text.defaultSuccess);
  renderBackgroundStore();
}

function getEnemyGlyph(type) {
  return ({ basic: "◆", runner: "➤", swarm: "◉", tank: "⬢", armored: "⬡", berserker: "✹", erratic: "〽", splitter: "◈", ranged: "⌁", healer: "+", full_shield: "◉", buffer: "ϟ", frontal_shield: "◖" })[type] || "◆";
}

function getWorkshopCommandText() {
  return WORKSHOP_COMMAND_I18N[currentLanguage] || WORKSHOP_COMMAND_I18N.en;
}

const WORKSHOP_STATS_I18N = {
  zh: { stats: "基礎素質", physical: "物理傷害", magic: "魔法傷害", rate: "每秒攻擊", cooldown: "冷卻", effect: "實際效果", passive: "被動型", range: "射程", perSecond: "次／秒", seconds: "秒", none: "—", shield: "護盾充能", slow: "減速", burn: "灼燒", weaken: "降攻", knockback: "擊退", area: "爆破半徑", vulnerability: "易傷", crit: "暴擊率", heal: "擊殺回血", maxHp: "最大生命傷害", missiles: "每輪飛彈", pellets: "每輪彈丸", mining: "每波產金", shadow: "主砲傷害複製", reflect: "反傷強化", speedBuff: "滿血攻速", blackHole: "黑洞觸發", standard: "標準命中特效" },
  en: { stats: "Base stats", physical: "Physical damage", magic: "Magic damage", rate: "Attacks/sec", cooldown: "Cooldown", effect: "Actual effect", passive: "Passive", range: "Range", perSecond: "/ sec", seconds: "sec", none: "—", shield: "Shield charges", slow: "Slow", burn: "Burn", weaken: "Attack reduction", knockback: "Knockback", area: "Blast radius", vulnerability: "Vulnerability", crit: "Crit chance", heal: "Kill healing", maxHp: "Max-HP damage", missiles: "Missiles/volley", pellets: "Shots/volley", mining: "Gold each wave", shadow: "Main damage copied", reflect: "Reflect boost", speedBuff: "Full-HP fire rate", blackHole: "Black-hole trigger", standard: "Standard hit effect" },
  ja: { stats: "基礎性能", physical: "物理ダメージ", magic: "魔法ダメージ", rate: "毎秒攻撃", cooldown: "クールダウン", effect: "実効果", passive: "パッシブ", range: "射程", perSecond: "回／秒", seconds: "秒", none: "—", shield: "シールド回数", slow: "減速", burn: "燃焼", weaken: "攻撃低下", knockback: "ノックバック", area: "爆発半径", vulnerability: "被ダメ増加", crit: "会心率", heal: "撃破回復", maxHp: "最大HPダメージ", missiles: "一斉ミサイル", pellets: "一斉弾数", mining: "Wave産出", shadow: "主砲ダメージ複製", reflect: "反射強化", speedBuff: "満タン時連射", blackHole: "ブラックホール", standard: "標準命中効果" },
  ko: { stats: "기본 능력치", physical: "물리 피해", magic: "마법 피해", rate: "초당 공격", cooldown: "재사용", effect: "실제 효과", passive: "패시브", range: "사거리", perSecond: "회/초", seconds: "초", none: "—", shield: "보호막 횟수", slow: "감속", burn: "연소", weaken: "공격 감소", knockback: "밀치기", area: "폭발 반경", vulnerability: "취약", crit: "치명타율", heal: "처치 회복", maxHp: "최대 HP 피해", missiles: "일제 미사일", pellets: "일제 탄환", mining: "웨이브 채굴", shadow: "주포 피해 복제", reflect: "반사 강화", speedBuff: "최대 HP 공속", blackHole: "블랙홀 발동", standard: "일반 명중 효과" },
  ru: { stats: "Базовые параметры", physical: "Физический урон", magic: "Магический урон", rate: "Атак/сек", cooldown: "Перезарядка", effect: "Реальный эффект", passive: "Пассивная", range: "Дальность", perSecond: "/сек", seconds: "с", none: "—", shield: "Заряды щита", slow: "Замедление", burn: "Горение", weaken: "Снижение атаки", knockback: "Отбрасывание", area: "Радиус взрыва", vulnerability: "Уязвимость", crit: "Крит. шанс", heal: "Лечение за убийство", maxHp: "Урон от макс. HP", missiles: "Ракет в залпе", pellets: "Снарядов в залпе", mining: "Золото за волну", shadow: "Копия урона", reflect: "Усиление отражения", speedBuff: "Скорость при полном HP", blackHole: "Чёрная дыра", standard: "Обычный эффект" },
  es: { stats: "Atributos base", physical: "Daño físico", magic: "Daño mágico", rate: "Ataques/s", cooldown: "Recarga", effect: "Efecto real", passive: "Pasiva", range: "Alcance", perSecond: "/s", seconds: "s", none: "—", shield: "Cargas de escudo", slow: "Ralentización", burn: "Quemadura", weaken: "Ataque reducido", knockback: "Retroceso", area: "Radio de explosión", vulnerability: "Vulnerabilidad", crit: "Prob. crítica", heal: "Curación por baja", maxHp: "Daño de vida máx.", missiles: "Misiles por salva", pellets: "Proyectiles por salva", mining: "Oro por oleada", shadow: "Daño principal copiado", reflect: "Reflejo mejorado", speedBuff: "Cadencia con vida llena", blackHole: "Activación de agujero negro", standard: "Efecto de impacto normal" }
};

const WORKSHOP_STAR_DETAIL_I18N = {
  zh: { assemble: "組裝後解鎖", max: "已達五星上限", damageGain: "傷害倍率", rateGain: "攻速倍率", effectGain: "技能效果", capacitor: "第 {every} 發追加傷害", tide: "潮汐波傷害／減速", phase: "相位回聲傷害", burnDps: "每秒魔攻／持續", priority: "優先生命最高敵人", pulse: "脈衝副傷／半徑", homing: "追蹤彈", split: "分裂彈", beam: "貫穿光束", voidPull: "黑洞牽引倍率", chain: "連鎖數／連鎖傷害", reflectLevel: "反擊強度" },
  en: { assemble: "Unlocked after assembly", max: "Five-star maximum reached", damageGain: "Damage multiplier", rateGain: "Fire-rate multiplier", effectGain: "Skill effect", capacitor: "Bonus damage every {every}th shot", tide: "Tide damage / slow", phase: "Phase Echo damage", burnDps: "Magic ATK per sec / duration", priority: "Targets highest-HP enemy", pulse: "Pulse splash / radius", homing: "Homing projectile", split: "Split rounds", beam: "Piercing beam", voidPull: "Black-hole pull multiplier", chain: "Chain count / damage", reflectLevel: "Counterattack strength" },
  ja: { assemble: "組立後に解放", max: "5星上限到達", damageGain: "ダメージ倍率", rateGain: "連射倍率", effectGain: "スキル効果", capacitor: "{every}発ごとの追加ダメージ", tide: "潮汐ダメージ／減速", phase: "位相エコーダメージ", burnDps: "毎秒魔攻／持続", priority: "最大HPの敵を優先", pulse: "パルス副ダメージ／半径", homing: "追尾弾", split: "分裂弾", beam: "貫通ビーム", voidPull: "ブラックホール牽引倍率", chain: "連鎖数／連鎖ダメージ", reflectLevel: "反撃強度" },
  ko: { assemble: "조립 후 해금", max: "5성 최대치 도달", damageGain: "피해 배율", rateGain: "공속 배율", effectGain: "스킬 효과", capacitor: "{every}번째 탄 추가 피해", tide: "파도 피해 / 감속", phase: "위상 메아리 피해", burnDps: "초당 마법 공격 / 지속", priority: "최대 HP 적 우선", pulse: "펄스 추가 피해 / 반경", homing: "유도탄", split: "분열탄", beam: "관통 광선", voidPull: "블랙홀 끌어당김 배율", chain: "연쇄 수 / 피해", reflectLevel: "반격 강도" },
  ru: { assemble: "Открывается после сборки", max: "Достигнут максимум 5 звёзд", damageGain: "Множитель урона", rateGain: "Множитель скорострельности", effectGain: "Эффект навыка", capacitor: "Доп. урон каждого {every}-го выстрела", tide: "Урон волны / замедление", phase: "Урон фазового эха", burnDps: "Маг. атака в сек. / длительность", priority: "Цель с наибольшим здоровьем", pulse: "Урон импульса / радиус", homing: "Самонаводящийся снаряд", split: "Разделяющиеся снаряды", beam: "Пробивающий луч", voidPull: "Множитель притяжения", chain: "Цепь / урон", reflectLevel: "Сила контратаки" },
  es: { assemble: "Se desbloquea al montarla", max: "Máximo de cinco estrellas alcanzado", damageGain: "Multiplicador de daño", rateGain: "Multiplicador de cadencia", effectGain: "Efecto de habilidad", capacitor: "Daño extra cada {every} disparos", tide: "Daño de marea / ralentización", phase: "Daño del eco de fase", burnDps: "ATQ mágico por s / duración", priority: "Prioriza al enemigo con más vida", pulse: "Daño de pulso / radio", homing: "Proyectil guiado", split: "Proyectiles divididos", beam: "Rayo perforante", voidPull: "Multiplicador de atracción", chain: "Cadena / daño", reflectLevel: "Potencia de contraataque" }
};

function getWorkshopStatsText() {
  return WORKSHOP_STATS_I18N[currentLanguage] || WORKSHOP_STATS_I18N.en;
}

function getWorkshopStarDetailText() {
  return WORKSHOP_STAR_DETAIL_I18N[currentLanguage] || WORKSHOP_STAR_DETAIL_I18N.en;
}

function renderTurretPortrait(turret) {
  if (turret.vipExclusive) {
    return `<figure class="turret-portrait vip-portrait ${turret.rarity}" style="--accent:${turret.color}" data-visual="${escapeHtml(turret.id)}"><img src="assets/turrets/${escapeHtml(turret.id)}.webp?v=2.9.30" alt="${escapeHtml(turret.name)}" loading="lazy" decoding="async"><i aria-hidden="true"></i></figure>`;
  }
  return `<figure class="turret-portrait" style="--accent:${turret.color}" data-visual="${escapeHtml(getMainTurretVisual?.(turret) || turret.id)}"><canvas width="192" height="192" data-turret-preview="${turret.id}" role="img" aria-label="${escapeHtml(turret.name)}"></canvas><i aria-hidden="true"></i></figure>`;
}

function tracePreviewPolygon(context, sides, radius, rotation = -Math.PI / 2) {
  context.beginPath();
  for (let point = 0; point < sides; point += 1) {
    const angle = rotation + point * Math.PI * 2 / sides;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    if (point === 0) context.moveTo(x, y); else context.lineTo(x, y);
  }
  context.closePath();
}

function drawVipTurretEmblem(context, turret, radius, time = 0) {
  const id = turret.id;
  const legendary = turret.rarity === "legendary";
  const gold = legendary ? "#ffe2a4" : "#c8f7ff";
  context.save();
  context.lineWidth = Math.max(1.4, radius * .075);
  context.strokeStyle = gold;
  context.fillStyle = "#071327";
  context.shadowColor = turret.color;
  context.shadowBlur = radius * .75;
  for (let ring = 0; ring < (legendary ? 3 : 2); ring += 1) {
    context.save();
    context.rotate((ring % 2 ? -1 : 1) * time * .28);
    context.globalAlpha = .65 - ring * .14;
    context.setLineDash(ring ? [radius * .22, radius * .18] : []);
    context.beginPath();
    context.arc(0, 0, radius * (1.42 + ring * .17), 0, Math.PI * 2);
    context.stroke();
    context.restore();
  }
  context.setLineDash([]);
  const petals = id.includes("bloom") || id.includes("hymn") ? 8 : id.includes("phoenix") || id.includes("solar") ? 7 : 6;
  for (let i = 0; i < petals; i += 1) {
    context.save();
    context.rotate(i * Math.PI * 2 / petals + time * (legendary ? .16 : .1));
    context.beginPath();
    context.moveTo(radius * .46, 0);
    context.quadraticCurveTo(radius * 1.02, -radius * .42, radius * 1.32, 0);
    context.quadraticCurveTo(radius * 1.02, radius * .42, radius * .46, 0);
    context.fillStyle = i % 2 ? `${turret.color}54` : `${turret.color}88`;
    context.fill(); context.stroke();
    context.restore();
  }
  if (id.includes("prism") || id.includes("quantum")) {
    context.save(); context.rotate(Math.PI / 4);
    context.fillStyle = "#0d2e4b"; context.fillRect(-radius * .46, -radius * .46, radius * .92, radius * .92);
    context.strokeRect(-radius * .46, -radius * .46, radius * .92, radius * .92);
    context.restore();
    context.beginPath(); context.moveTo(-radius * .42, 0); context.lineTo(0, -radius * .52); context.lineTo(radius * .42, 0); context.lineTo(0, radius * .52); context.closePath(); context.fillStyle = turret.color; context.fill(); context.stroke();
  } else if (id.includes("thunder") || id.includes("chrono")) {
    context.beginPath(); context.moveTo(-radius * .16, -radius * .68); context.lineTo(radius * .25, -radius * .12); context.lineTo(0, -radius * .1); context.lineTo(radius * .24, radius * .66); context.lineTo(-radius * .3, radius * .04); context.lineTo(-radius * .02, radius * .05); context.closePath(); context.fillStyle = turret.color; context.fill(); context.stroke();
    if (id.includes("chrono")) { context.beginPath(); context.arc(0, 0, radius * .75, 0, Math.PI * 2); context.stroke(); }
  } else if (id.includes("bloom") || id.includes("hymn")) {
    context.beginPath(); context.arc(0, 0, radius * .45, 0, Math.PI * 2); context.fillStyle = turret.color; context.fill(); context.stroke();
    context.beginPath(); context.arc(0, 0, radius * .22, 0, Math.PI * 2); context.fillStyle = "#ffffff"; context.fill();
  } else if (id.includes("phoenix") || id.includes("solar")) {
    context.beginPath(); context.moveTo(-radius * .62, radius * .2); context.quadraticCurveTo(-radius * .5, -radius * .65, 0, -radius * .85); context.quadraticCurveTo(radius * .48, -radius * .66, radius * .66, radius * .2); context.quadraticCurveTo(radius * .34, radius * .02, 0, radius * .7); context.quadraticCurveTo(-radius * .33, radius * .02, -radius * .62, radius * .2); context.closePath(); context.fillStyle = turret.color; context.fill(); context.stroke();
    context.beginPath(); context.arc(0, -radius * .08, radius * .18, 0, Math.PI * 2); context.fillStyle = "#fff7d7"; context.fill();
  } else if (id.includes("tide")) {
    for (let i = -1; i <= 1; i += 1) { context.beginPath(); context.arc(-radius * .08, i * radius * .24, radius * .57, -.88, .88); context.stroke(); }
    context.beginPath(); context.arc(-radius * .18, 0, radius * .22, 0, Math.PI * 2); context.fillStyle = turret.color; context.fill();
  } else if (id.includes("singularity")) {
    context.beginPath(); context.arc(0, 0, radius * .57, 0, Math.PI * 2); context.fillStyle = "#03020d"; context.fill(); context.stroke();
    context.save(); context.rotate(time * .5 + .35); context.beginPath(); context.ellipse(0, 0, radius * .9, radius * .28, 0, 0, Math.PI * 2); context.stroke(); context.restore();
  }
  if (turret.role === "main") {
    context.fillStyle = "#091729";
    context.fillRect(radius * .52, -radius * .12, radius * .76, radius * .24);
    context.strokeRect(radius * .52, -radius * .12, radius * .76, radius * .24);
    context.beginPath(); context.arc(radius * 1.34, 0, radius * .12, 0, Math.PI * 2); context.fillStyle = "#ffffff"; context.fill();
  }
  context.restore();
}

const vipBattleArt = new Map();
function getVipBattleArt(turret) {
  if (!turret?.vipExclusive || typeof Image === "undefined") return null;
  if (!vipBattleArt.has(turret.id)) {
    const art = new Image();
    art.decoding = "async";
    art.src = `assets/turrets/${turret.id}.webp?v=2.9.30`;
    vipBattleArt.set(turret.id, art);
  }
  const art = vipBattleArt.get(turret.id);
  return art?.complete && art.naturalWidth > 0 ? art : null;
}

function drawVipBattleArt(context, turret, radius, time = 0) {
  const art = getVipBattleArt(turret);
  if (!art) { drawVipTurretEmblem(context, turret, radius, time); return; }
  const size = radius * 3.1;
  context.drawImage(art, -size / 2, -size / 2, size, size);
}

function drawTurretPreviewCanvas(canvas, turret, { transparent = false } = {}) {
  if (!canvas || !turret) return;
  const preview = canvas.getContext("2d");
  const size = canvas.width;
  preview.clearRect(0, 0, size, size);
  if (!transparent) {
  const backdrop = preview.createRadialGradient(size * .5, size * .45, 4, size * .5, size * .5, size * .65);
  backdrop.addColorStop(0, `${turret.color}2e`);
  backdrop.addColorStop(.48, "rgba(8,25,50,.96)");
  backdrop.addColorStop(1, "rgba(2,8,22,.99)");
  preview.fillStyle = backdrop;
  preview.fillRect(0, 0, size, size);
  preview.save();
  preview.translate(size / 2, size / 2 + 8);
  preview.strokeStyle = `${turret.color}38`;
  preview.lineWidth = 2;
  preview.setLineDash([7, 7]);
  preview.beginPath(); preview.arc(0, 0, 71, 0, Math.PI * 2); preview.stroke();
  preview.setLineDash([]);
  for (let ray = 0; ray < 8; ray += 1) {
    preview.rotate(Math.PI / 4);
    preview.beginPath(); preview.moveTo(60, 0); preview.lineTo(70, 0); preview.stroke();
  }
  preview.restore();
  }
  preview.save();
  preview.translate(size / 2, size / 2 + 10);
  preview.rotate(transparent ? 0 : -.42);
  preview.shadowBlur = 22;
  preview.shadowColor = turret.color;
  preview.strokeStyle = turret.color;
  preview.fillStyle = "#071625";
  preview.lineWidth = 4;
  preview.lineJoin = "round";
  preview.lineCap = "round";
  const r = turret.role === "main" ? 38 : 32;
  const visual = turret.role === "main" ? getMainTurretVisual(turret) : turret.id;
  const barrel = (length = 55, width = 12, offset = 0) => { preview.fillRect(4, offset - width / 2, length, width); preview.strokeRect(4, offset - width / 2, length, width); };
  if (turret.vipExclusive) {
    drawVipTurretEmblem(preview, turret, r, .6);
  } else if (visual === "emerald_drake") {
    drawEmeraldDrake(preview, r);
  } else if (visual === "shield_hex" || visual === "shield_generator") {
    tracePreviewPolygon(preview, 6, r); preview.fill(); preview.stroke();
    tracePreviewPolygon(preview, 6, r * .63); preview.stroke();
    preview.beginPath(); preview.arc(0, 0, r * 1.34, 0, Math.PI * 2); preview.globalAlpha = .46; preview.stroke(); preview.globalAlpha = 1;
  } else if (visual === "frost_crystal" || visual === "frost_rail") {
    preview.save(); preview.rotate(Math.PI / 4); preview.fillRect(-r * .55, -r * .55, r * 1.1, r * 1.1); preview.strokeRect(-r * .55, -r * .55, r * 1.1, r * 1.1); preview.restore();
    for (let ray = 0; ray < 4; ray += 1) { preview.save(); preview.rotate(ray * Math.PI / 2); preview.beginPath(); preview.moveTo(0, 0); preview.lineTo(r * 1.3, 0); preview.stroke(); preview.restore(); }
    if (visual === "frost_rail") barrel(64, 8);
  } else if (visual === "flame_reactor" || visual === "flame_sprayer") {
    preview.beginPath(); preview.moveTo(r * 1.3, 0); preview.bezierCurveTo(r * .35, -r * 1.22, -r, -r * .72, -r * .7, 0); preview.bezierCurveTo(-r, r * .72, r * .35, r * 1.22, r * 1.3, 0); preview.fill(); preview.stroke();
    preview.fillStyle = turret.color; preview.beginPath(); preview.moveTo(r * .72, 0); preview.quadraticCurveTo(-r * .2, -r * .55, -r * .4, 0); preview.quadraticCurveTo(-r * .2, r * .55, r * .72, 0); preview.fill();
    if (visual === "flame_sprayer") { preview.globalAlpha = .35; preview.beginPath(); preview.moveTo(r, 0); preview.lineTo(r * 2.05, -r * .7); preview.lineTo(r * 2.05, r * .7); preview.closePath(); preview.fill(); }
  } else if (visual === "solar_blades") {
    preview.beginPath(); preview.arc(0, 0, r * .58, 0, Math.PI * 2); preview.fill(); preview.stroke();
    for (let bladeIndex = 0; bladeIndex < 3; bladeIndex += 1) { preview.save(); preview.rotate(bladeIndex * Math.PI * 2 / 3); preview.beginPath(); preview.moveTo(r * .52, -7); preview.lineTo(r * 1.45, 0); preview.lineTo(r * .52, 7); preview.stroke(); preview.restore(); } barrel(48, 7);
  } else if (visual === "curse_crescent") {
    preview.beginPath(); preview.arc(-4, 0, r, -2.2, 2.2); preview.stroke(); preview.beginPath(); preview.arc(13, 0, r * .78, 2.05, -2.05, true); preview.stroke(); preview.fillStyle = turret.color; preview.beginPath(); preview.arc(r, 0, 8, 0, Math.PI * 2); preview.fill();
  } else if (visual === "siege_barrel" || visual === "cluster_bomb") {
    tracePreviewPolygon(preview, 6, r, 0); preview.fill(); preview.stroke(); barrel(64, visual === "siege_barrel" ? 25 : 19); preview.lineWidth = 7; preview.beginPath(); preview.moveTo(68, -15); preview.lineTo(68, 15); preview.stroke();
  } else if (visual === "quantum_orbits" || visual === "time_slow") {
    preview.beginPath(); preview.arc(0, 0, r * .45, 0, Math.PI * 2); preview.fill(); preview.stroke();
    for (const tilt of [-.72, .72]) { preview.save(); preview.rotate(tilt); preview.beginPath(); preview.ellipse(0, 0, r * 1.2, r * .42, 0, 0, Math.PI * 2); preview.stroke(); preview.restore(); }
  } else if (visual === "gatling_rotor" || visual === "missile_nest") {
    preview.beginPath(); preview.arc(-5, 0, r * .76, 0, Math.PI * 2); preview.fill(); preview.stroke();
    const rows = visual === "missile_nest" ? [-18, 0, 18] : [-13, 0, 13];
    for (const offset of rows) barrel(visual === "missile_nest" ? 48 : 61, visual === "missile_nest" ? 10 : 6, offset);
    if (visual === "missile_nest") for (const offset of rows) { preview.beginPath(); preview.arc(55, offset, 5, 0, Math.PI * 2); preview.stroke(); }
  } else if (visual === "split_fork") {
    tracePreviewPolygon(preview, 5, r * .82, Math.PI); preview.fill(); preview.stroke();
    for (const fork of [-.45, .45]) { preview.beginPath(); preview.moveTo(4, 0); preview.lineTo(62, r * fork); preview.stroke(); }
  } else if (visual === "arcane_sigil" || visual === "crit_resonance") {
    tracePreviewPolygon(preview, visual === "arcane_sigil" ? 4 : 8, r, Math.PI / 4); preview.fill(); preview.stroke(); tracePreviewPolygon(preview, 4, r * .52, 0); preview.stroke(); barrel(47, 7);
  } else if (visual === "reflect_bastion") {
    tracePreviewPolygon(preview, 6, r * 1.08); preview.fill(); preview.stroke(); for (let plate = 0; plate < 3; plate += 1) { preview.save(); preview.rotate(plate * Math.PI * 2 / 3); preview.strokeRect(r * .42, -8, r * .62, 16); preview.restore(); } barrel(42, 8);
  } else if (visual === "scatter_fan") {
    preview.beginPath(); preview.arc(-8, 0, r, -1.9, 1.9); preview.lineTo(-8, 0); preview.closePath(); preview.fill(); preview.stroke(); for (let shot = -3; shot <= 3; shot += 1) { const angle = shot * .13; preview.beginPath(); preview.moveTo(5, 0); preview.lineTo(Math.cos(angle) * 62, Math.sin(angle) * 62); preview.stroke(); }
  } else if (visual === "twin_rails" || visual === "charged_laser" || visual === "long_range_sniper") {
    preview.beginPath(); preview.arc(-8, 0, r * .72, 0, Math.PI * 2); preview.fill(); preview.stroke();
    if (visual === "twin_rails") { barrel(62, 10, -13); barrel(62, 10, 13); }
    else barrel(visual === "long_range_sniper" ? 78 : 67, visual === "long_range_sniper" ? 7 : 15);
    if (visual === "long_range_sniper") { preview.beginPath(); preview.arc(12, 0, 9, 0, Math.PI * 2); preview.stroke(); }
  } else if (visual === "laser_lance") {
    preview.beginPath(); preview.moveTo(-r, 0); preview.lineTo(-8, -r * .75); preview.lineTo(r, -10); preview.lineTo(r * 1.8, 0); preview.lineTo(r, 10); preview.lineTo(-8, r * .75); preview.closePath(); preview.fill(); preview.stroke(); preview.strokeStyle = "#fff"; preview.beginPath(); preview.moveTo(0, 0); preview.lineTo(r * 1.75, 0); preview.stroke();
  } else if (visual === "void_ring" || visual === "antimatter") {
    preview.fillStyle = "rgba(0,1,7,.98)"; preview.beginPath(); preview.arc(0, 0, r * .72, 0, Math.PI * 2); preview.fill(); preview.stroke(); preview.setLineDash([15, 8]); preview.beginPath(); preview.ellipse(0, 0, r * 1.28, r * .55, .35, 0, Math.PI * 2); preview.stroke(); preview.setLineDash([]); if (visual === "antimatter") barrel(52, 11);
  } else if (visual === "capacitor_coil") {
    preview.beginPath(); preview.arc(0, 0, r * .72, 0, Math.PI * 2); preview.fill(); preview.stroke();
    for (let charge = 0; charge < 5; charge += 1) { preview.save(); preview.rotate(charge * Math.PI * 2 / 5); preview.fillStyle = charge === 4 ? "#ffffff" : turret.color; preview.fillRect(r * .82, -4, 12, 8); preview.restore(); }
    preview.beginPath(); preview.moveTo(r * .35, 0); preview.lineTo(r * 1.65, 0); preview.stroke();
  } else if (visual === "royal_tide") {
    preview.fillStyle = "rgba(13,45,142,.74)"; preview.beginPath(); preview.arc(0, 0, r * .78, 0, Math.PI * 2); preview.fill(); preview.stroke();
    for (const scale of [.65, 1.08, 1.45]) { preview.globalAlpha = 1.55 - scale; preview.beginPath(); preview.ellipse(0, 0, r * scale, r * scale * .42, 0, 0, Math.PI * 2); preview.stroke(); }
    preview.globalAlpha = 1; barrel(56, 8);
  } else if (visual === "phase_echo") {
    for (const shift of [-9, 9]) { preview.save(); preview.translate(0, shift); preview.globalAlpha = shift < 0 ? .95 : .36; tracePreviewPolygon(preview, 4, r * .78, Math.PI / 4); preview.fill(); preview.stroke(); barrel(58, 7); preview.restore(); }
  } else if (visual === "target_reticle") {
    preview.beginPath(); preview.arc(0, 0, r * .82, 0, Math.PI * 2); preview.fill(); preview.stroke(); preview.setLineDash([10, 7]); preview.beginPath(); preview.arc(0, 0, r * 1.16, 0, Math.PI * 2); preview.stroke(); preview.setLineDash([]); preview.beginPath(); preview.moveTo(-r * 1.3, 0); preview.lineTo(r * 1.55, 0); preview.moveTo(0, -r * 1.3); preview.lineTo(0, r * 1.3); preview.stroke();
  } else if (visual === "chain_arc") {
    tracePreviewPolygon(preview, 3, r); preview.fill(); preview.stroke(); preview.beginPath(); preview.moveTo(-16, -35); preview.lineTo(8, -8); preview.lineTo(-2, 2); preview.lineTo(31, 35); preview.stroke();
  } else if (visual === "mining_gold") {
    tracePreviewPolygon(preview, 6, r); preview.fill(); preview.stroke(); preview.fillStyle = turret.color; preview.font = "900 42px system-ui"; preview.textAlign = "center"; preview.textBaseline = "middle"; preview.fillText("◆", 0, 0);
  } else if (visual === "soul_drain") {
    preview.beginPath(); preview.moveTo(0, -r * 1.25); preview.lineTo(r * .72, r); preview.lineTo(0, r * .58); preview.lineTo(-r * .72, r); preview.closePath(); preview.fill(); preview.stroke(); preview.beginPath(); preview.arc(0, -5, 13, 0, Math.PI * 2); preview.stroke();
  } else if (visual === "shadow_replica") {
    preview.beginPath(); preview.arc(-11, 0, r * .72, Math.PI / 2, Math.PI * 1.5); preview.fill(); preview.stroke(); preview.globalAlpha = .48; preview.beginPath(); preview.arc(14, 0, r * .72, -Math.PI / 2, Math.PI / 2); preview.fill(); preview.stroke(); preview.globalAlpha = 1; barrel(52, 7, -8); barrel(52, 7, 8);
  } else {
    tracePreviewPolygon(preview, 6, r); preview.fill(); preview.stroke(); barrel(54, 10);
  }
  preview.restore();
  if (!transparent) {
  const vignette = preview.createRadialGradient(size / 2, size / 2, size * .2, size / 2, size / 2, size * .7);
  vignette.addColorStop(.55, "rgba(0,0,0,0)"); vignette.addColorStop(1, "rgba(0,0,0,.48)"); preview.fillStyle = vignette; preview.fillRect(0, 0, size, size);
  }
}

function drawWorkshopTurretPreviews(root = document) {
  root.querySelectorAll("canvas[data-turret-preview]").forEach((canvas) => {
    const turret = V2_TURRET_DEFS.find((item) => item.id === canvas.dataset.turretPreview);
    if (turret) drawTurretPreviewCanvas(canvas, turret);
  });
}

function renderSpaceTowerVipStore() {
  const rareGrid = document.getElementById("vipRareGrid");
  const legendaryGrid = document.getElementById("vipLegendaryGrid");
  if (!rareGrid || !legendaryGrid) return;
  const zh = currentLanguage === "zh";
  const active = Boolean(window.hasSpaceTowerVip?.());
  const state = window.getSpaceTowerVipState?.() || null;
  const product = window.getSpaceTowerVipProduct?.() || null;
  const busy = Boolean(window.isSpaceTowerVipPurchaseBusy?.());
  document.getElementById("vipStoreTitle").textContent = zh ? "星殿通行證" : "Celestial VIP Pass";
  document.getElementById("vipStoreBenefits").textContent = zh
    ? "每月 NT$120 · 免廣告 · 一般商城 8 折 · 專屬砲台與黑曜王座戰場"
    : "NT$120/month in Taiwan · Ad-free · 20% off the regular store · Exclusive turrets and battlefield";
  document.getElementById("vipRareTitle").textContent = zh ? "稀有砲台 · 黑曜石直購" : "Rare turrets · Buy with Obsidian";
  document.getElementById("vipLegendaryTitle").textContent = zh ? "傳說砲台 · 100 碎片組裝" : "Legendary turrets · Assemble with 100 shards";
  document.getElementById("vipLegendaryLimit").textContent = zh ? "每 10 碎片 500 黑曜石；集滿 100 碎片需 5,000 黑曜石。所有傳說砲台合計每週限購 10 碎片。" : "500 Obsidian per 10 shards; 5,000 Obsidian for all 100. Limit: 10 legendary shards total each week.";
  const subscribe = document.getElementById("vipSubscribeButton");
  subscribe.textContent = active ? (zh ? "VIP 已啟用" : "VIP active") : product?.formattedPrice ? `${zh ? "訂閱" : "Subscribe"} · ${product.formattedPrice}/${zh ? "月" : "month"}` : (zh ? "查看訂閱" : "View subscription");
  subscribe.disabled = active || busy;
  document.getElementById("vipStoreStatus").textContent = window.getSpaceTowerVipMessage?.() || (active ? (zh ? "專屬商品已解鎖" : "Exclusive items unlocked") : product ? (zh ? "每月自動續訂，可隨時在 App Store 或 Google Play 取消。" : "Renews monthly. Cancel anytime in your app store.") : (zh ? "訂閱商品尚未在商店開放" : "Subscription is not available in the app store yet"));
  const card = (turret) => {
    const legendary = turret.rarity === "legendary";
    const owned = !legendary && Boolean(state?.rareOwned?.includes(turret.id));
    const weeklyLimit = legendary && Number(state?.legendaryWeeklyUsed) >= 10;
    const disabled = !active || owned || weeklyLimit || busy;
    const action = owned ? (zh ? "已擁有" : "Owned") : weeklyLimit ? (zh ? "本週已達上限" : "Weekly limit reached") : active ? (zh ? "用黑曜石購買" : "Buy with Obsidian") : (zh ? "VIP 專屬" : "VIP exclusive");
    return `<article class="vip-turret-card ${turret.rarity}">${renderTurretPortrait(turret)}<div><b>${escapeHtml(turret.name)}</b><p>${escapeHtml(turret.description)}</p><small>${legendary ? (zh ? "10 碎片 · 500 黑曜石" : "10 shards · 500 Obsidian") : (zh ? "完整砲台 · 2,600 黑曜石" : "Full turret · 2,600 Obsidian")}</small></div><div class="vip-turret-actions"><button class="vip-preview-button" type="button" data-vip-preview="${escapeHtml(turret.id)}">${zh ? "實戰預覽" : "Battle preview"}</button><button type="button" data-vip-buy="${escapeHtml(turret.id)}" ${disabled ? "disabled" : ""}>${action}</button></div></article>`;
  };
  rareGrid.innerHTML = V2_TURRET_DEFS.filter((item) => item.vipExclusive && item.rarity === "rare").map(card).join("");
  legendaryGrid.innerHTML = V2_TURRET_DEFS.filter((item) => item.vipExclusive && item.rarity === "legendary").map(card).join("");
  drawWorkshopTurretPreviews(rareGrid);
  drawWorkshopTurretPreviews(legendaryGrid);
}
window.renderSpaceTowerVipStore = renderSpaceTowerVipStore;
document.getElementById("vipSubscribeButton")?.addEventListener("click", () => window.purchaseSpaceTowerVip?.());
document.getElementById("storeVipSubpage")?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-vip-buy]");
  if (button && !button.disabled) void window.purchaseSpaceTowerVipTurret?.(button.dataset.vipBuy);
});

function getTurretStarSnapshot(turret, stars) {
  const rankSteps = Math.max(0, stars - 1);
  const damage = 1 + rankSteps * (Number(turret.starDamagePerRank) || 0.12);
  const rate = 1 + rankSteps * (Number(turret.starRatePerRank) || 0.05);
  const effect = 1 + rankSteps * (Number(turret.starEffectPerRank) || 0.08);
  return { damage, rate, effect };
}

function getTurretActualStats(turret, stars = getV2TurretStars(turret.id)) {
  const multipliers = getTurretStarSnapshot(turret, Math.max(1, stars));
  const physicalBase = Math.max(1, Number(getPhysicalDamage?.()) || Number(towerStats?.attack) || 1);
  const magicBase = Math.max(1, Number(getMagicDamage?.()) || Math.round(physicalBase * .65));
  const damageBase = turret.damageType === "magic" ? magicBase : physicalBase;
  const damage = turret.antimatter
    ? turret.antimatter * multipliers.effect * 100
    : turret.damage > 0 ? Math.max(1, Math.round(damageBase * turret.damage * multipliers.damage)) : 0;
  const rate = turret.cooldown
    ? multipliers.rate / turret.cooldown
    : turret.speed > 0
      ? turret.speed * multipliers.rate / Math.max(.08, Number(getFireDelay?.()) || .65) / (turret.role === "auxiliary" ? 4 : 1)
      : 0;
  return { ...multipliers, damage, rate, physicalBase, magicBase };
}

function getTurretEffectStat(turret, stars = getV2TurretStars(turret.id)) {
  const text = getWorkshopStatsText();
  const detail = getWorkshopStarDetailText();
  const multiplier = getTurretStarSnapshot(turret, Math.max(1, stars)).effect;
  const percent = (value, digits = 1) => `${(value * multiplier * 100).toFixed(digits).replace(/\.0$/, "")}%`;
  if (turret.id === "emergency_shield") return `${text.shield} ${Math.max(1, stars)}`;
  if (turret.capacitorEvery) return `${formatV2Text(detail.capacitor, { every: turret.capacitorEvery })} +${percent(turret.capacitorBonus)}`;
  if (turret.tideEvery) return `${detail.tide} ${percent(turret.tideDamage)} / ${percent(turret.tideSlow)}`;
  if (turret.phaseEcho) return `${detail.phase} +${percent(turret.phaseEcho)}`;
  if (turret.id === "pulse_quantum") return `${detail.pulse} ${percent(0.28)} / ${Math.round(72 * multiplier)}`;
  if (turret.frost) return `${text.slow} ${percent(turret.frost)} / 2.5 ${text.seconds}`;
  if (turret.burn) return `${detail.burnDps} ${percent(0.14)} / 4 ${text.seconds}`;
  if (turret.weaken) return `${text.weaken} ${percent(turret.weaken)}`;
  if (turret.knockback) return `${text.knockback} ${Math.round(turret.knockback * multiplier)}`;
  if (turret.area) return `${text.area} ${Math.round(turret.area * multiplier)}`;
  if (turret.vulnerability) return `${text.vulnerability} ${percent(turret.vulnerability)}`;
  if (turret.fullHpRate) return `${text.speedBuff} +${percent(turret.fullHpRate)}`;
  if (turret.reflect) return `${detail.reflectLevel} +${(2 * multiplier).toFixed(2)}`;
  if (turret.shield) return `${text.shield} +${(2 * multiplier).toFixed(1)}%`;
  if (turret.critAura) return `${text.crit} +${percent(turret.critAura)}`;
  if (turret.slowAura) return `${text.slow} ${percent(turret.slowAura)}`;
  if (turret.lifeSteal) return `${text.heal} ${percent(turret.lifeSteal, 2)}`;
  if (turret.antimatter) return `${text.maxHp} ${(turret.antimatter * multiplier * 100).toFixed(1)}%`;
  if (turret.mining) return `${text.mining} ${multiplier.toFixed(2)}×`;
  if (turret.shadow) return `${text.shadow} ${(turret.damage * multiplier * 100).toFixed(1)}%`;
  if (turret.void) return `${detail.voidPull} ${multiplier.toFixed(2)}×`;
  if (turret.chain) return `${detail.chain} ${turret.chain - 1} / ${(55 * multiplier).toFixed(1)}%`;
  if (turret.split) return `${detail.split} 2 × 72%`;
  if (turret.beam) return detail.beam;
  if (turret.highestHp) return detail.priority;
  if (turret.homing) return detail.homing;
  if (turret.missiles) return `${text.missiles} ${turret.missiles}`;
  if (turret.pellets) return `${text.pellets} ${turret.pellets}`;
  return text.standard;
}

function renderTurretStatGrid(turret, stars, { compare = false } = {}) {
  const text = getWorkshopStatsText();
  const stats = getTurretActualStats(turret, stars);
  const damageLabel = turret.damageType === "magic" || turret.antimatter ? text.magic : text.physical;
  const damageValue = turret.antimatter ? `${stats.damage.toFixed(1)}% MAX HP` : stats.damage > 0 ? formatCompactNumber(stats.damage) : text.passive;
  const rateValue = turret.cooldown ? `${(1 / Math.max(.0001, stats.rate)).toFixed(2)} ${text.seconds}` : stats.rate > 0 ? `${stats.rate.toFixed(2)} ${text.perSecond}` : text.none;
  const damageScore = Math.min(100, Math.max(6, (turret.antimatter ? stats.damage / 15 : turret.damage * stats.damage / Math.max(1, stats.physicalBase) * 75)));
  const rateScore = Math.min(100, Math.max(6, stats.rate / 3 * 100));
  const effectScore = Math.min(100, 18 + (stats.effect - 1) * 130 + (turret.damage <= 0 ? 32 : 0));
  return `<section class="turret-stat-block ${compare ? "compare-stats" : ""}"><b>${escapeHtml(text.stats)} · ★${stars}</b><div class="turret-stat-grid"><div><span>${escapeHtml(damageLabel)}</span><strong>${escapeHtml(damageValue)}</strong><i style="--value:${damageScore}%"><b></b></i></div><div><span>${escapeHtml(turret.cooldown ? text.cooldown : text.rate)}</span><strong>${escapeHtml(rateValue)}</strong><i style="--value:${rateScore}%"><b></b></i></div><div><span>${escapeHtml(text.effect)}</span><strong>${escapeHtml(getTurretEffectStat(turret, stars))}</strong><i style="--value:${effectScore}%"><b></b></i></div></div></section>`;
}

function renderNextStarValues(turret, stars, text) {
  if (turret.starterExclusive) return "";
  const maxStars = getV2TurretMaxStars();
  const detail = getWorkshopStarDetailText();
  if (stars <= 0) {
    return `<section class="next-star-panel unlock"><b>${escapeHtml(detail.assemble)} · ★1</b><div class="next-star-values"><div><span>${escapeHtml(detail.damageGain)}</span><b>${turret.damage > 0 ? `${Number(turret.damage).toFixed(2)}×` : escapeHtml(getWorkshopStatsText().passive)}</b></div><div><span>${escapeHtml(detail.rateGain)}</span><b>${turret.speed > 0 ? `${Number(turret.speed).toFixed(2)}×` : escapeHtml(getWorkshopStatsText().none)}</b></div><div><span>${escapeHtml(detail.effectGain)}</span><b>${escapeHtml(getTurretEffectStat(turret, 1))}</b></div></div></section>`;
  }
  if (stars >= maxStars) return `<section class="next-star-panel max"><b>${escapeHtml(detail.max)} · ★${maxStars}</b></section>`;
  const nextStars = Math.min(maxStars, Math.max(1, stars + 1));
  const current = getTurretStarSnapshot(turret, Math.max(1, stars));
  const next = getTurretStarSnapshot(turret, nextStars);
  const rows = [];
  if (turret.damage > 0 || turret.antimatter) rows.push(`<div><span>${escapeHtml(detail.damageGain)}</span><b>${current.damage.toFixed(2)}× → ${next.damage.toFixed(2)}× <em>+12%</em></b></div>`);
  if (turret.speed > 0 || turret.cooldown) rows.push(`<div><span>${escapeHtml(detail.rateGain)}</span><b>${current.rate.toFixed(2)}× → ${next.rate.toFixed(2)}× <em>+5%</em></b></div>`);
  const currentEffect = getTurretEffectStat(turret, stars);
  const nextEffect = getTurretEffectStat(turret, nextStars);
  if (currentEffect !== nextEffect) rows.push(`<div><span>${escapeHtml(detail.effectGain)}</span><b>${escapeHtml(currentEffect)} → ${escapeHtml(nextEffect)} <em>+8%</em></b></div>`);
  return `<section class="next-star-panel"><b>${escapeHtml(text.nextStar)} · ★${nextStars}</b><div class="next-star-values">${rows.join("")}</div></section>`;
}

function getFilteredWorkshopTurrets() {
  const fragmentTarget = getV2FragmentTarget();
  const maxStars = getV2TurretMaxStars();
  const needle = workshopFilters.search.trim().toLocaleLowerCase();
  return V2_TURRET_DEFS.filter((turret) => {
    if (workshopFilters.role !== "all" && turret.role !== workshopFilters.role) return false;
    if (workshopFilters.grade !== "all" && String(turret.strengthGrade) !== workshopFilters.grade) return false;
    if (needle && !`${turret.name} ${turret.id}`.toLocaleLowerCase().includes(needle)) return false;
    const owned = (v2Progress.assembled[turret.id] || 0) > 0;
    const equipped = (v2Progress.active[turret.id] || 0) > 0;
    const rankable = (v2Progress.stars[turret.id] || 0) < maxStars && (v2Progress.fragments[turret.id] || 0) >= fragmentTarget;
    if (workshopFilters.ownership === "owned" && !owned) return false;
    if (workshopFilters.ownership === "rankable" && !rankable) return false;
    if (workshopFilters.ownership === "equipped" && !equipped) return false;
    return true;
  }).sort((a, b) => Number(b.role === "main") - Number(a.role === "main") || Number(v2Progress.assembled[b.id] > 0) - Number(v2Progress.assembled[a.id] > 0) || (v2Progress.fragments[b.id] || 0) - (v2Progress.fragments[a.id] || 0));
}

function renderWorkshopCommandCenter() {
  if (!workshopCommandCenter) return;
  const text = getWorkshopCommandText();
  const main = getWorkshopFormationSlots("main");
  const auxiliary = getWorkshopFormationSlots("auxiliary");
  const slot = (turret, role, index) => `<button type="button" class="formation-slot ${role}" data-v2-slot-role="${role}" data-v2-slot-index="${index}" data-v2-slot-turret="${turret?.id || ""}" style="--accent:${turret?.color || "#608099"}" aria-label="${escapeHtml(role === "main" ? text.main : text.aux)} ${index + 1}：${escapeHtml(turret?.name || text.empty)}；${currentLanguage === "zh" ? "點擊選擇砲台" : "Choose turret"}">${turret ? renderTurretPortrait(turret) : '<span class="formation-empty" aria-hidden="true">＋</span>'}<small>${escapeHtml(role === "main" ? text.main : text.aux)} ${index + 1}</small><b>${escapeHtml(turret?.name || text.empty)}</b></button>`;
  const formation = Array.from({ length: getMainSlotCap(unlockedTier) }, (_, index) => `<div class="formation-group">${slot(main[index], "main", index)}<div class="formation-supports">${Array.from({ length: 3 }, (_, support) => slot(auxiliary[index * 3 + support], "auxiliary", index * 3 + support)).join("")}</div></div>`).join("");
  const presetKeys = ["progress", "boss", "resource"];
  const presetHtml = presetKeys.map((key, index) => {
    const count = Object.values(v2Progress.loadoutPresets[key] || {}).reduce((sum, value) => sum + Math.max(0, Number(value) || 0), 0);
    return `<div class="loadout-preset"><b>${escapeHtml(text.presets[index])}</b><button type="button" data-v2-apply-preset="${key}">${escapeHtml(text.apply)}</button><small>${count ? `${count} slots` : text.empty}</small><button class="secondary" type="button" data-v2-save-preset="${key}">${escapeHtml(text.save)}</button></div>`;
  }).join("");
  const compare = workshopCompareIds.map((id) => V2_TURRET_DEFS.find((turret) => turret.id === id)).filter(Boolean);
  const compareHtml = compare.length === 2
    ? compare.map((turret) => {
      const stars = getV2TurretStars(turret.id);
      return `<div class="compare-column" style="--accent:${turret.color}"><header>${renderTurretPortrait(turret)}<div><b>G${turret.strengthGrade} · ${escapeHtml(turret.name)}</b><span>${"★".repeat(stars)}${"☆".repeat(getV2TurretMaxStars() - stars)}</span></div></header>${renderTurretStatGrid(turret, stars, { compare: true })}<p>${escapeHtml(turret.description)}</p></div>`;
    }).join("")
    : "";
  workshopCommandCenter.innerHTML = `<section class="workshop-formation"><header><b>${escapeHtml(text.formation)}</b><span>Tier ${unlockedTier}</span></header><div class="formation-groups">${formation}</div></section><details class="workshop-preset-drawer"><summary>${escapeHtml(text.presets.join(" · "))}</summary><section class="workshop-presets">${presetHtml}</section></details><section class="workshop-filter-bar" aria-label="Turret filters"><button type="button" data-v2-role="all" class="${workshopFilters.role === "all" ? "active" : ""}">${text.all}</button><button type="button" data-v2-role="main" class="${workshopFilters.role === "main" ? "active" : ""}">${text.mainFilter}</button><button type="button" data-v2-role="auxiliary" class="${workshopFilters.role === "auxiliary" ? "active" : ""}">${text.auxFilter}</button><button type="button" data-v2-ownership="owned" class="${workshopFilters.ownership === "owned" ? "active" : ""}">${text.owned}</button><button type="button" data-v2-ownership="rankable" class="${workshopFilters.ownership === "rankable" ? "active" : ""}">${text.rankable}</button><button type="button" data-v2-ownership="equipped" class="${workshopFilters.ownership === "equipped" ? "active" : ""}">${text.equipped}</button><select data-v2-grade aria-label="${text.grade}"><option value="all">${text.grade}</option>${Array.from({ length: 8 }, (_, index) => `<option value="${index + 1}" ${workshopFilters.grade === String(index + 1) ? "selected" : ""}>G${index + 1}</option>`).join("")}</select><input data-v2-search value="${escapeHtml(workshopFilters.search)}" placeholder="${escapeHtml(text.search)}" aria-label="${escapeHtml(text.search)}"></section><section class="turret-compare-panel" ${compare.length === 2 ? "" : "hidden"}>${compareHtml}</section>`;
  drawWorkshopTurretPreviews(workshopCommandCenter);
}

function getWorkshopFormationSlots(role) {
  const cap = getTurretRoleSlotCap(role);
  const remaining = Object.fromEntries(V2_TURRET_DEFS.filter((item) => item.role === role)
    .map((item) => [item.id, v2Progress.active[item.id] || 0]));
  const slots = Array.from({ length: cap }, (_, index) => {
    const id = v2Progress.slotOrder?.[role]?.[index];
    if (!id || !remaining[id]) return null;
    remaining[id] -= 1;
    return V2_TURRET_DEFS.find((item) => item.id === id);
  });
  for (const turret of V2_TURRET_DEFS.filter((item) => item.role === role)) {
    while (remaining[turret.id] > 0) {
      const empty = slots.indexOf(null);
      if (empty < 0) break;
      slots[empty] = turret;
      remaining[turret.id] -= 1;
    }
  }
  v2Progress.slotOrder[role] = slots.map((item) => item?.id || "");
  return slots;
}

const workshopSlotDialog = document.createElement("div");
workshopSlotDialog.className = "workshop-slot-dialog hidden";
workshopSlotDialog.setAttribute("role", "dialog");
workshopSlotDialog.setAttribute("aria-modal", "true");
document.body.append(workshopSlotDialog);
let workshopSlotSelection = null;
function closeWorkshopSlotDialog() {
  workshopSlotDialog.classList.add("hidden");
  workshopSlotDialog.innerHTML = "";
  workshopSlotSelection = null;
}
function openWorkshopSlotDialog(role, index) {
  const current = getWorkshopFormationSlots(role)[index];
  workshopSlotSelection = { role, index, currentId: current?.id || "" };
  const text = getWorkshopCommandText();
  const title = `${role === "main" ? text.main : text.aux} ${index + 1}`;
  const options = V2_TURRET_DEFS.filter((item) => item.role === role &&
    (v2Progress.assembled[item.id] || 0) > (v2Progress.active[item.id] || 0) - Number(item.id === current?.id));
  workshopSlotDialog.innerHTML = `<div class="workshop-slot-panel"><header><h2>${escapeHtml(title)}</h2><button type="button" data-slot-close aria-label="Close">×</button></header><p>${currentLanguage === "zh" ? "選擇已擁有的砲台，這一格會立即換裝。" : "Choose an owned turret for this slot."}</p><div class="workshop-slot-options">${options.map((item) => `<button type="button" data-slot-pick="${item.id}" style="--accent:${item.color}" ${item.id === current?.id ? "disabled" : ""}>${renderTurretPortrait(item)}<span><b>${escapeHtml(item.name)}</b><small>G${item.strengthGrade} · ${escapeHtml(item.description)}</small></span></button>`).join("") || `<p>${currentLanguage === "zh" ? "尚未擁有可用砲台；先收集碎片並組裝。" : "No available turret yet."}</p>`}</div>${current ? `<button type="button" class="slot-remove" data-slot-pick="">${currentLanguage === "zh" ? "卸下這格" : "Unequip slot"}</button>` : ""}</div>`;
  workshopSlotDialog.classList.remove("hidden");
  workshopSlotDialog.querySelector("[data-slot-close]")?.focus();
}
workshopSlotDialog.addEventListener("click", (event) => {
  if (event.target === workshopSlotDialog || event.target.closest("[data-slot-close]")) return closeWorkshopSlotDialog();
  const pick = event.target.closest("[data-slot-pick]");
  if (!pick || !workshopSlotSelection) return;
  const { role, index, currentId } = workshopSlotSelection;
  const nextId = pick.dataset.slotPick;
  if (nextId && !V2_TURRET_DEFS.some((item) => item.id === nextId && item.role === role)) return;
  if (nextId && (v2Progress.assembled[nextId] || 0) <= (v2Progress.active[nextId] || 0) - Number(nextId === currentId)) return;
  if (currentId) v2Progress.active[currentId] -= 1;
  if (nextId) v2Progress.active[nextId] += 1;
  v2Progress.slotOrder[role][index] = nextId;
  closeWorkshopSlotDialog();
  saveV2Progress({ critical: true });
  renderSynergyStrip?.();
});
document.addEventListener("keydown", (event) => { if (event.key === "Escape") closeWorkshopSlotDialog(); });

function saveWorkshopPreset(key) {
  if (!["progress", "boss", "resource"].includes(key)) return;
  v2Progress.loadoutPresets[key] = Object.fromEntries(V2_TURRET_DEFS.map((turret) => [turret.id, Math.max(0, Math.floor(Number(v2Progress.active[turret.id]) || 0))]));
  v2Progress.activePreset = key;
  saveV2Progress({ critical: true });
}

function applyWorkshopPreset(key) {
  if (!["progress", "boss", "resource"].includes(key)) return;
  const preset = v2Progress.loadoutPresets[key] || {};
  for (const turret of V2_TURRET_DEFS) v2Progress.active[turret.id] = Math.min(v2Progress.assembled[turret.id] || 0, Math.max(0, Math.floor(Number(preset[turret.id]) || 0)));
  v2Progress.activePreset = key;
  reconcileV2Equipment(unlockedTier);
  saveV2Progress({ critical: true });
  renderSynergyStrip?.();
}

function renderV3Workshop() {
  if (!turretWorkshopGrid) return;
  reconcileV2Equipment(unlockedTier);
  const ui = getV2UiText();
  const text = getWorkshopCommandText();
  const starText = V2_TURRET_STAR_TEXT[currentLanguage] || V2_TURRET_STAR_TEXT.en;
  const mainSlotCap = getMainSlotCap(unlockedTier);
  const supportSlotCap = getSupportSlotCap(unlockedTier);
  const activeMain = getActiveMainCount();
  const activeSupport = getActiveSupportCount();
  const assembled = V2_TURRET_DEFS.reduce((sum, turret) => sum + v2Progress.assembled[turret.id], 0);
  const fragments = V2_TURRET_DEFS.reduce((sum, turret) => sum + v2Progress.fragments[turret.id], 0);
  const cores = V2_TURRET_DEFS.reduce((sum, turret) => sum + v2Progress.cores[turret.id], 0);
  const fusionStones = window.getSpaceTowerFusionStoneCount?.() || 0;
  workshopTierHint.textContent = formatV2Text(ui.openWorkshop, { tier: unlockedTier, mainSlots: mainSlotCap, supportSlots: supportSlotCap, slots: supportSlotCap });
  workshopSummary.innerHTML = `<div>${escapeHtml(ui.mainSlots || "主砲欄位")}<b>${activeMain} / ${mainSlotCap}</b></div><div>${escapeHtml(ui.auxiliarySlots || ui.availableSlots || "副砲欄位")}<b>${activeSupport} / ${supportSlotCap}</b></div><div>${escapeHtml(ui.assembled)}<b>${assembled}</b></div><div>${escapeHtml(ui.heldFragments)}<b>${fragments}</b></div><div>${escapeHtml(starText.core)}<b>${cores}</b></div><div>${escapeHtml(starText.fusion)}<b>${fusionStones}</b></div>`;
  renderWorkshopCommandCenter();
  turretWorkshopGrid.innerHTML = "";
  const wishlistText = V2_WISHLIST_TEXT[currentLanguage] || V2_WISHLIST_TEXT.en;
  const wishlistPanel = document.createElement("section");
  wishlistPanel.className = "fragment-wishlist-panel";
  const wishlistOptions = V2_TURRET_DEFS.filter((item) => !item.starterExclusive && !item.vipExclusive).map((turret) => `<option value="${turret.id}" ${v2Progress.fragmentWishlist === turret.id ? "selected" : ""}>G${turret.strengthGrade} · ${escapeHtml(turret.name)}</option>`).join("");
  wishlistPanel.innerHTML = `<div class="fragment-wishlist-copy"><strong>${escapeHtml(wishlistText.title)}</strong><small>${escapeHtml(wishlistText.hint)}</small></div><select data-v2-fragment-wishlist aria-label="${escapeHtml(wishlistText.title)}"><option value="">${escapeHtml(wishlistText.any)}</option>${wishlistOptions}</select><div class="fragment-pity-line"><span>${escapeHtml(formatV2Text(wishlistText.pity, { current: v2Progress.fragmentPity, target: V2_FRAGMENT_PITY_TARGET }))}</span><i style="--progress:${v2Progress.fragmentPity / V2_FRAGMENT_PITY_TARGET * 100}%"></i></div>`;
  turretWorkshopGrid.appendChild(wishlistPanel);
  const maxStars = getV2TurretMaxStars();
  const filtered = getFilteredWorkshopTurrets();
  if (!filtered.length) turretWorkshopGrid.insertAdjacentHTML("beforeend", `<div class="workshop-empty">${escapeHtml(text.noMatch)}</div>`);
  let lastRole = "";
  for (const turret of filtered) {
    const fragmentTarget = getTurretFragmentTarget(turret);
    if (lastRole !== turret.role) {
      const heading = document.createElement("h3");
      heading.className = "workshop-role-heading";
      heading.textContent = turret.role === "main" ? (ui.mainTurrets || text.mainFilter) : (ui.auxiliaryTurrets || text.auxFilter);
      turretWorkshopGrid.appendChild(heading);
      lastRole = turret.role;
    }
    const count = v2Progress.fragments[turret.id];
    const built = v2Progress.assembled[turret.id];
    const equipped = v2Progress.active[turret.id];
    const stars = v2Progress.stars[turret.id];
    const coreCount = v2Progress.cores[turret.id];
    const coreRequirement = getTurretCoreRequirementForNextStar(stars);
    const canBuild = !turret.starterExclusive && ((stars < maxStars && count >= fragmentTarget && coreCount + fusionStones >= coreRequirement) || (stars >= maxStars && count >= fragmentTarget));
    const canEquip = built > equipped && getTurretRoleSlotCap(turret.role) > 0;
    const expanded = workshopExpandedIds.has(turret.id);
    const compared = workshopCompareIds.includes(turret.id);
    const card = document.createElement("article");
    card.className = `turret-forge-card ${turret.role} ${turret.rarity ? `vip-${turret.rarity}` : ""} ${compared ? "selected-compare" : ""}`;
    card.style.setProperty("--accent", turret.color);
    const buildLabel = stars >= maxStars ? (ui.build || "組裝") : stars > 0 ? starText.rankUp : ui.build;
    card.innerHTML = `<div class="forge-top">${renderTurretPortrait(turret)}<div class="forge-meta"><span>G${turret.strengthGrade} · ${count} / ${fragmentTarget} ${escapeHtml(ui.fragments)}</span><b>${escapeHtml(turret.name)}</b><small>${"★".repeat(stars)}${"☆".repeat(maxStars - stars)} · ${escapeHtml(ui.equipped || ui.active)} ${equipped}</small></div></div><div class="forge-quick-actions"><button type="button" data-v2-toggle-details="${turret.id}">${escapeHtml(expanded ? text.close : text.detail)}</button><button class="compare ${compared ? "active" : ""}" type="button" data-v2-compare="${turret.id}">${escapeHtml(text.compare)} ${compared ? "✓" : ""}</button></div><div class="forge-detail" ${expanded ? "" : "hidden"}><p>${escapeHtml(turret.description)}</p>${turret.vipExclusive ? `<button class="vip-preview-button" type="button" data-vip-preview="${escapeHtml(turret.id)}">${currentLanguage === "zh" ? "實戰預覽" : "Battle preview"}</button>` : ""}${renderTurretStatGrid(turret, stars)}${renderNextStarValues(turret, stars, text)}<div class="turret-core-requirement">${renderTurretCoreIcon(turret)}<span>${escapeHtml(starText.core)} <b>${coreCount}</b>${coreRequirement > 0 ? ` / ${coreRequirement}` : ` · ${escapeHtml(starText.noCore)}`}</span></div><div class="fragment-meter" style="--progress:${Math.min(100, count / fragmentTarget * 100)}%"><i></i></div><div class="forge-actions"><div class="forge-build-line"><span>${escapeHtml(ui.owned || ui.assembled)} <b>${built}</b></span><button type="button" data-v2-build="${turret.id}" ${canBuild ? "" : "disabled"}>${escapeHtml(buildLabel)}</button></div><div class="forge-equip-controls"><button class="secondary" type="button" data-v2-equip-change="${turret.id}" data-delta="-1" ${equipped > 0 ? "" : "disabled"}>−</button><strong>${escapeHtml(ui.equipped || ui.active)} (${equipped})</strong><button type="button" data-v2-equip-change="${turret.id}" data-delta="1" ${canEquip ? "" : "disabled"}>＋</button></div></div></div>`;
    if (turret.starterExclusive) {
      card.dataset.starterExclusive = "true";
      card.querySelector(".forge-meta > span").textContent = `G8 · ${window.getStarterPackText?.().exclusive || "Starter exclusive"}`;
      card.querySelector(".forge-meta > small").textContent = `${stars ? "★" : "☆"} · ${escapeHtml(ui.equipped || ui.active)} ${equipped}`;
      card.querySelectorAll(".turret-core-requirement, .fragment-meter, [data-v2-build], .next-star-values").forEach((element) => element.remove());
    }
    turretWorkshopGrid.appendChild(card);
  }
  drawWorkshopTurretPreviews(turretWorkshopGrid);
  if (fragmentHud) fragmentHud.textContent = String(v2Progress.lifetimeFragments);
}

function renderV2Workshop() {
  return renderV3Workshop();
  if (!turretWorkshopGrid) return;
  reconcileV2Equipment(unlockedTier);
  const ui = getV2UiText();
  const mainSlotCap = getMainSlotCap(selectedTier);
  const supportSlotCap = getSupportSlotCap(selectedTier);
  const activeMain = getActiveMainCount();
  const activeSupport = getActiveSupportCount();
  const assembled = V2_TURRET_DEFS.reduce((sum, turret) => sum + v2Progress.assembled[turret.id], 0);
  const fragments = V2_TURRET_DEFS.reduce((sum, turret) => sum + v2Progress.fragments[turret.id], 0);
  const cores = V2_TURRET_DEFS.reduce((sum, turret) => sum + v2Progress.cores[turret.id], 0);
  const fusionStones = window.getSpaceTowerFusionStoneCount?.() || 0;
  const starText = V2_TURRET_STAR_TEXT[currentLanguage] || V2_TURRET_STAR_TEXT.en;
  workshopTierHint.textContent = formatV2Text(ui.openWorkshop, {
    tier: selectedTier,
    mainSlots: mainSlotCap,
    supportSlots: supportSlotCap,
    slots: supportSlotCap
  });
  workshopSummary.innerHTML = `<div>${escapeHtml(ui.mainSlots || "主砲欄位")}<b>${activeMain} / ${mainSlotCap}</b></div><div>${escapeHtml(ui.auxiliarySlots || ui.availableSlots || "副砲欄位")}<b>${activeSupport} / ${supportSlotCap}</b></div><div>${escapeHtml(ui.assembled)}<b>${assembled}</b></div><div>${escapeHtml(ui.heldFragments)}<b>${fragments}</b></div><div>${escapeHtml(starText.core)}<b>${cores}</b></div><div>${escapeHtml(starText.fusion)}<b>${fusionStones}</b></div>`;
  turretWorkshopGrid.innerHTML = "";
  const wishlistText = V2_WISHLIST_TEXT[currentLanguage] || V2_WISHLIST_TEXT.en;
  const fragmentTarget = getV2FragmentTarget();
  const maxStars = getV2TurretMaxStars();
  const wishlistPanel = document.createElement("section");
  wishlistPanel.className = "fragment-wishlist-panel";
  const wishlistOptions = V2_TURRET_DEFS.filter((item) => !item.starterExclusive).map((turret) => `<option value="${turret.id}" ${v2Progress.fragmentWishlist === turret.id ? "selected" : ""}>G${turret.strengthGrade} · ${escapeHtml(turret.name)}</option>`).join("");
  wishlistPanel.innerHTML = `
    <div class="fragment-wishlist-copy"><strong>${escapeHtml(wishlistText.title)}</strong><small>${escapeHtml(wishlistText.hint)}</small></div>
    <select data-v2-fragment-wishlist aria-label="${escapeHtml(wishlistText.title)}"><option value="">${escapeHtml(wishlistText.any)}</option>${wishlistOptions}</select>
    <div class="fragment-pity-line"><span>${escapeHtml(formatV2Text(wishlistText.pity, { current: v2Progress.fragmentPity, target: V2_FRAGMENT_PITY_TARGET }))}</span><i style="--progress:${v2Progress.fragmentPity / V2_FRAGMENT_PITY_TARGET * 100}%"></i></div>`;
  turretWorkshopGrid.appendChild(wishlistPanel);
  let lastRole = "";
  for (const turret of V2_TURRET_DEFS) {
    const count = v2Progress.fragments[turret.id];
    const built = v2Progress.assembled[turret.id];
    const equipped = v2Progress.active[turret.id];
    const stars = v2Progress.stars[turret.id];
    const coreCount = v2Progress.cores[turret.id];
    const coreRequirement = getTurretCoreRequirementForNextStar(stars);
    const canRankUp = stars < maxStars && count >= fragmentTarget && coreCount + fusionStones >= coreRequirement;
    const canAssembleCopy = stars >= maxStars && count >= fragmentTarget;
    const canBuild = canRankUp || canAssembleCopy;
    const slotCap = getTurretRoleSlotCap(turret.role);
    const canEquip = built > equipped && slotCap > 0;
    if (lastRole !== turret.role) {
      const heading = document.createElement("h3");
      heading.className = "workshop-role-heading";
      heading.textContent = turret.role === "main" ? (ui.mainTurrets || "主砲") : (ui.auxiliaryTurrets || "副砲");
      turretWorkshopGrid.appendChild(heading);
      lastRole = turret.role;
    }
    const card = document.createElement("article");
    card.className = `turret-forge-card ${turret.role}`;
    card.style.setProperty("--accent", turret.color);
    const buildLabel = stars >= maxStars ? (ui.build || "組裝") : stars > 0 ? starText.rankUp : ui.build;
    card.innerHTML = `<div class="forge-top"><div class="turret-glyph">${turret.icon}</div><div class="forge-meta"><span>${escapeHtml(ui.grade || "G")} ${turret.strengthGrade} · ${count} / ${fragmentTarget} ${escapeHtml(ui.fragments)}</span><b>${escapeHtml(turret.name)}</b><small>${"★".repeat(stars)}${"☆".repeat(maxStars - stars)}</small></div></div><p>${escapeHtml(turret.description)}</p><small>${escapeHtml(starText.bonus)}</small><div class="turret-core-requirement">${renderTurretCoreIcon(turret)}<span>${escapeHtml(starText.core)} <b>${coreCount}</b>${stars >= maxStars ? ` · ${escapeHtml(ui.build || "組裝")} +1` : coreRequirement > 0 ? ` / ${coreRequirement}` : ` · ${escapeHtml(starText.noCore)}`}</span></div><div class="fragment-meter" style="--progress:${Math.min(100, count / fragmentTarget * 100)}%"><i></i></div><div class="forge-actions"><div class="forge-build-line"><span>${escapeHtml(ui.owned || ui.assembled)} <b>${built}</b></span><button type="button" data-v2-build="${turret.id}" ${canBuild ? "" : "disabled"}>${escapeHtml(buildLabel)}</button></div><div class="forge-equip-controls"><button class="secondary" type="button" data-v2-equip-change="${turret.id}" data-delta="-1" aria-label="${escapeHtml(ui.decrease || "Unequip one")}" ${equipped > 0 ? "" : "disabled"}>−</button><strong>${escapeHtml(ui.equipped || ui.active)} (${equipped})</strong><button type="button" data-v2-equip-change="${turret.id}" data-delta="1" aria-label="${escapeHtml(ui.increase || "Equip one")}" ${canEquip ? "" : "disabled"}>＋</button></div></div>`;
    if (turret.starterExclusive) {
      card.dataset.starterExclusive = "true";
      card.querySelector(".forge-meta > span").textContent = `G8 · ${window.getStarterPackText?.().exclusive || "Starter exclusive"}`;
      card.querySelector(".forge-meta > small").textContent = `${stars ? "★" : "☆"} · ${escapeHtml(ui.equipped || ui.active)} ${equipped}`;
      card.querySelectorAll(".turret-core-requirement, .fragment-meter, [data-v2-build], .next-star-values").forEach((element) => element.remove());
    }
    turretWorkshopGrid.appendChild(card);
  }
  if (fragmentHud) fragmentHud.textContent = String(v2Progress.lifetimeFragments);
}

function buildSupportTurret(id) {
  const turret = V2_TURRET_DEFS.find((item) => item.id === id);
  if (!turret || turret.starterExclusive) return;
  const fragmentTarget = getTurretFragmentTarget(turret);
  const stars = getV2TurretStars(id);
  const coreRequirement = getTurretCoreRequirementForNextStar(stars);
  const coreCount = Math.max(0, Number(v2Progress.cores[id]) || 0);
  const missingCores = Math.max(0, coreRequirement - coreCount);
  if ((v2Progress.fragments[id] || 0) < fragmentTarget) return;
  if (stars < getV2TurretMaxStars() && coreCount + (window.getSpaceTowerFusionStoneCount?.() || 0) < coreRequirement) return;
  v2Progress.fragments[id] -= fragmentTarget;
  if (stars < getV2TurretMaxStars()) {
    if (missingCores > 0 && !window.consumeSpaceTowerFusionStones?.(missingCores)) return;
    v2Progress.cores[id] -= Math.min(coreCount, coreRequirement);
    v2Progress.stars[id] += 1;
  }
  v2Progress.assembled[id] += 1;
  saveV2Progress({ critical: true });
}

function changeTurretEquipment(id, delta) {
  const turret = V2_TURRET_DEFS.find((item) => item.id === id);
  if (!turret) return;
  const direction = Math.sign(Number(delta) || 0);
  if (direction < 0 && v2Progress.active[id] > 0) {
    v2Progress.active[id] -= 1;
  } else if (direction > 0 && v2Progress.active[id] < v2Progress.assembled[id]) {
    const slotCap = getTurretRoleSlotCap(turret.role);
    if (slotCap <= 0) return;
    if (getActiveTurretRoleCount(turret.role) >= slotCap) {
      const replacement = [...V2_TURRET_DEFS]
        .reverse()
        .find((item) => item.role === turret.role && item.id !== id && v2Progress.active[item.id] > 0);
      if (!replacement) return;
      v2Progress.active[replacement.id] -= 1;
    }
    v2Progress.active[id] += 1;
  } else {
    return;
  }
  saveV2Progress({ critical: true });
  renderSynergyStrip?.();
  window.spaceTowerTrackEvent?.("turret_loadout_changed", { turret_id: id, equipped: v2Progress.active[id], role: turret.role });
}

homeCodexTab.addEventListener("click", () => setHomePage("codex"));
homeWorkshopTab.addEventListener("click", () => setHomePage("workshop"));
homeUltimateTab.addEventListener("click", () => setHomePage("ultimate"));
homeStoreTab.addEventListener("click", () => setHomePage("store"));
homeVipPassButton?.addEventListener("click", () => {
  homeStoreTab.click();
  document.getElementById("storeVipTab")?.click();
});
turretWorkshopGrid.addEventListener("click", (event) => {
  const build = event.target.closest("[data-v2-build]");
  const equip = event.target.closest("[data-v2-equip-change]");
  const toggle = event.target.closest("[data-v2-toggle-details]");
  const compare = event.target.closest("[data-v2-compare]");
  if (build) buildSupportTurret(build.dataset.v2Build);
  if (equip) changeTurretEquipment(equip.dataset.v2EquipChange, equip.dataset.delta);
  if (toggle) {
    const id = toggle.dataset.v2ToggleDetails;
    if (workshopExpandedIds.has(id)) workshopExpandedIds.delete(id);
    else workshopExpandedIds.add(id);
    renderV2Workshop();
  }
  if (compare) {
    const id = compare.dataset.v2Compare;
    if (workshopCompareIds.includes(id)) workshopCompareIds = workshopCompareIds.filter((item) => item !== id);
    else workshopCompareIds = [...workshopCompareIds.slice(-1), id];
    renderV2Workshop();
  }
});
turretWorkshopGrid.addEventListener("change", (event) => {
  const select = event.target.closest("[data-v2-fragment-wishlist]");
  if (!select) return;
  v2Progress.fragmentWishlist = V2_TURRET_DEFS.some((item) => item.id === select.value) ? select.value : "";
  saveV2Progress();
  window.spaceTowerTrackEvent?.("fragment_wishlist_changed", { system: "turret", item_id: v2Progress.fragmentWishlist || "any" });
});
workshopCommandCenter?.addEventListener("click", (event) => {
  const slot = event.target.closest("[data-v2-slot-role]");
  if (slot) return openWorkshopSlotDialog(slot.dataset.v2SlotRole, Number(slot.dataset.v2SlotIndex));
  const role = event.target.closest("[data-v2-role]");
  const ownership = event.target.closest("[data-v2-ownership]");
  const savePreset = event.target.closest("[data-v2-save-preset]");
  const applyPreset = event.target.closest("[data-v2-apply-preset]");
  if (role) {
    workshopFilters.role = role.dataset.v2Role;
    renderV2Workshop();
  }
  if (ownership) {
    const selected = ownership.dataset.v2Ownership;
    workshopFilters.ownership = workshopFilters.ownership === selected ? "all" : selected;
    renderV2Workshop();
  }
  if (savePreset) saveWorkshopPreset(savePreset.dataset.v2SavePreset);
  if (applyPreset) applyWorkshopPreset(applyPreset.dataset.v2ApplyPreset);
});
workshopCommandCenter?.addEventListener("change", (event) => {
  const grade = event.target.closest("[data-v2-grade]");
  if (!grade) return;
  workshopFilters.grade = grade.value;
  renderV2Workshop();
});
let workshopSearchTimer = null;
workshopCommandCenter?.addEventListener("input", (event) => {
  const search = event.target.closest("[data-v2-search]");
  if (!search) return;
  workshopFilters.search = search.value;
  clearTimeout(workshopSearchTimer);
  workshopSearchTimer = setTimeout(() => {
    renderV2Workshop();
    const nextSearch = workshopCommandCenter.querySelector("[data-v2-search]");
    nextSearch?.focus();
    nextSearch?.setSelectionRange(nextSearch.value.length, nextSearch.value.length);
  }, 140);
});
reservedStoreGrid?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-background-id]");
  if (button) buyOrEquipBackground(button.dataset.backgroundId);
});
backgroundDefaultButton?.addEventListener("click", equipDefaultBackground);

function getAutoUpgradeText() {
  return getV2LanguagePack()?.autoUpgrade || getV2LanguagePack("en")?.autoUpgrade || {};
}

function getAutoUpgradeLabel(id) {
  const labels = getAutoUpgradeText().labels || {};
  return labels[id] || getV2LanguagePack("en")?.autoUpgrade?.labels?.[id] || id;
}

function saveAutoUpgradeConfig() {
  autoUpgradeConfig = normalizeAutoUpgradeConfig(autoUpgradeConfig);
  localStorage.setItem(AUTO_UPGRADE_KEY, JSON.stringify(autoUpgradeConfig));
  autoUpgradeIndex %= Math.max(1, autoUpgradeConfig.sequence.length);
  renderAutoUpgradeControls();
  queueCloudSave();
}

function toggleAutoUpgradeSequence(id) {
  const sequence = [...autoUpgradeConfig.sequence];
  const index = sequence.indexOf(id);
  if (index >= 0 && sequence.length > 1) sequence.splice(index, 1);
  else if (index < 0) sequence.push(id);
  autoUpgradeConfig.sequence = sequence;
  saveAutoUpgradeConfig();
}

function renderAutoUpgradeSequence(container) {
  if (!container) return;
  container.innerHTML = "";
  for (const id of AUTO_UPGRADE_IDS) {
    const order = autoUpgradeConfig.sequence.indexOf(id);
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.autoUpgrade = id;
    button.dataset.order = order >= 0 ? `${order + 1}.` : "";
    button.className = order >= 0 ? "selected" : "";
    button.textContent = getAutoUpgradeLabel(id);
    button.addEventListener("click", () => toggleAutoUpgradeSequence(id));
    container.appendChild(button);
  }
}

function renderAutoUpgradeControls() {
  const ui = getAutoUpgradeText();
  const sequenceText = autoUpgradeConfig.sequence.map(getAutoUpgradeLabel).join(" → ");
  autoUpgradeTitle.textContent = ui.title;
  autoUpgradeHint.textContent = ui.hint;
  autoUpgradeEnabledLabel.textContent = ui.enabled;
  autoUpgradeThresholdLabel.textContent = ui.threshold;
  autoUpgradeRunThresholdLabel.textContent = ui.threshold;
  autoUpgradeEditButton.textContent = ui.edit;
  autoUpgradeEnabled.checked = autoUpgradeConfig.enabled;
  autoUpgradeThreshold.value = String(autoUpgradeConfig.threshold);
  autoUpgradeRunThreshold.value = String(autoUpgradeConfig.threshold);
  autoUpgradeRunToggle.textContent = autoUpgradeConfig.enabled ? ui.on : ui.off;
  autoUpgradeRunToggle.setAttribute("aria-pressed", String(autoUpgradeConfig.enabled));
  autoUpgradeRunStatus.textContent = autoUpgradeConfig.sequence.length
    ? `${formatGold(autoUpgradeConfig.threshold)} · ${sequenceText}`
    : ui.empty;
  renderAutoUpgradeSequence(autoUpgradeSequence);
  renderAutoUpgradeSequence(autoUpgradeRunSequence);
}

function setAutoUpgradeThreshold(value) {
  autoUpgradeConfig.threshold = clamp(Math.floor(Number(value) || 0), 0, 999999999);
  saveAutoUpgradeConfig();
}

autoUpgradeEnabled.addEventListener("change", () => {
  autoUpgradeConfig.enabled = autoUpgradeEnabled.checked;
  saveAutoUpgradeConfig();
});
autoUpgradeThreshold.addEventListener("input", () => setAutoUpgradeThreshold(autoUpgradeThreshold.value));
autoUpgradeRunThreshold.addEventListener("input", () => setAutoUpgradeThreshold(autoUpgradeRunThreshold.value));
autoUpgradeRunToggle.addEventListener("click", () => {
  autoUpgradeConfig.enabled = !autoUpgradeConfig.enabled;
  saveAutoUpgradeConfig();
});
autoUpgradeEditButton.addEventListener("click", () => {
  autoUpgradeRunEditor.classList.toggle("hidden");
});

const COMMANDER_AVATARS = Object.freeze({
  orbit: { glyph: "🧑‍🚀", names: { zh: "軌道先鋒", en: "Orbit Vanguard", ja: "軌道の先鋒", ko: "궤도 선봉", ru: "Орбитальный авангард", es: "Vanguardia orbital" } },
  nova: { glyph: "👩‍🚀", names: { zh: "新星領航", en: "Nova Pilot", ja: "ノヴァパイロット", ko: "노바 파일럿", ru: "Пилот Новы", es: "Piloto Nova" } },
  mecha: { glyph: "🤖", names: { zh: "機甲智核", en: "Mecha Core", ja: "メカコア", ko: "메카 코어", ru: "Меха-ядро", es: "Núcleo meca" } },
  fox: { glyph: "🦊", names: { zh: "星狐斥候", en: "Starfox Scout", ja: "星狐スカウト", ko: "별여우 정찰대", ru: "Звёздный лис", es: "Zorro estelar" } },
  dragon: { glyph: "🐲", names: { zh: "蒼龍守衛", en: "Azure Dragon", ja: "蒼龍ガード", ko: "청룡 수호대", ru: "Лазурный дракон", es: "Dragón celeste" } }
});
const AVATAR_UI_TEXT = Object.freeze({
  zh: { title: "選擇指揮官頭像", open: "選擇指揮官頭像", expand: "登入", switchAccount: "切換帳號", collapse: "收起" },
  en: { title: "Choose Commander Avatar", open: "Choose commander avatar", expand: "Sign in", switchAccount: "Switch account", collapse: "Collapse" },
  ja: { title: "司令官アバターを選択", open: "司令官アバターを選択", expand: "ログイン", switchAccount: "アカウント切替", collapse: "閉じる" },
  ko: { title: "사령관 아바타 선택", open: "사령관 아바타 선택", expand: "로그인", switchAccount: "계정 전환", collapse: "접기" },
  ru: { title: "Выберите аватар командира", open: "Выбрать аватар командира", expand: "Войти", switchAccount: "Сменить аккаунт", collapse: "Свернуть" },
  es: { title: "Elige avatar de comandante", open: "Elegir avatar de comandante", expand: "Iniciar sesión", switchAccount: "Cambiar cuenta", collapse: "Contraer" }
});

function renderCommanderAvatar() {
  const selected = COMMANDER_AVATARS[userSettings.commanderAvatar] || COMMANDER_AVATARS.orbit;
  const ui = AVATAR_UI_TEXT[currentLanguage] || AVATAR_UI_TEXT.en;
  commanderAvatarArt.textContent = selected.glyph;
  commanderAvatarArt.className = `pilot-avatar-art avatar-${userSettings.commanderAvatar || "orbit"}`;
  commanderAvatarLevel.textContent = `LV.${getCommanderLevel()}`;
  commanderAvatarButton.setAttribute("aria-label", ui.open);
  commanderAvatarButton.title = selected.names[currentLanguage] || selected.names.en;
  avatarPickerTitle.textContent = ui.title;
  avatarChoiceGrid.querySelectorAll("[data-avatar]").forEach((button) => {
    const avatar = COMMANDER_AVATARS[button.dataset.avatar];
    button.classList.toggle("selected", button.dataset.avatar === userSettings.commanderAvatar);
    button.setAttribute("aria-pressed", String(button.dataset.avatar === userSettings.commanderAvatar));
    const label = button.querySelector("b");
    if (label && avatar) label.textContent = avatar.names[currentLanguage] || avatar.names.en;
  });
}

function setAvatarPicker(open) {
  avatarPicker.hidden = !open;
  commanderAvatarButton.setAttribute("aria-expanded", String(open));
  document.body.classList.toggle("avatar-picker-open", open);
}

function renderPilotLoginToggle() {
  const consoleEl = document.querySelector(".home-pilot-console");
  const expanded = consoleEl?.classList.contains("expanded");
  const authenticated = consoleEl?.classList.contains("authenticated");
  const ui = AVATAR_UI_TEXT[currentLanguage] || AVATAR_UI_TEXT.en;
  pilotLoginToggle.textContent = expanded ? ui.collapse : authenticated ? ui.switchAccount : ui.expand;
  pilotLoginToggle.setAttribute("aria-expanded", String(Boolean(expanded)));
}
window.renderPilotLoginToggle = renderPilotLoginToggle;

commanderAvatarButton.addEventListener("click", () => setAvatarPicker(true));
avatarPickerClose.addEventListener("click", () => setAvatarPicker(false));
document.getElementById("lobbySettingsButton")?.addEventListener("click", () => setAvatarPicker(false));
avatarPicker.addEventListener("click", (event) => {
  if (event.target === avatarPicker) setAvatarPicker(false);
  const choice = event.target.closest("[data-avatar]");
  if (!choice || !COMMANDER_AVATARS[choice.dataset.avatar]) return;
  userSettings.commanderAvatar = choice.dataset.avatar;
  saveSettings();
  renderCommanderAvatar();
  setAvatarPicker(false);
  queueCloudSave();
});
pilotLoginToggle.addEventListener("click", () => {
  document.querySelector(".home-pilot-console")?.classList.toggle("expanded");
  renderPilotLoginToggle();
});

function dismissPilotLogin() {
  const panel = document.querySelector(".home-pilot-console");
  if (!panel?.classList.contains("expanded")) return;
  panel.classList.remove("expanded");
  document.activeElement?.blur();
  renderPilotAccountState();
  renderPilotLoginToggle();
}
// Capture the backdrop click so it cannot also activate a control underneath.
document.addEventListener("click", (event) => {
  const panel = document.querySelector(".home-pilot-console.expanded");
  if (!panel || panel.contains(event.target)) return;
  event.preventDefault();
  event.stopImmediatePropagation();
  dismissPilotLogin();
}, true);
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") dismissPilotLogin();
});

// ---------- Meta and run upgrade UI ----------

function isV2UpgradeUnlocked(def) {
  return DEV_MODE || getMetaLevel(def.meta) > 0;
}

function getV2UpgradeValue(def) {
  if (def.id === "physicalArmor") return towerStats.physicalDefense || 0;
  if (def.id === "magicArmor") return towerStats.magicDefense || 0;
  if (def.id === "slowModule") return towerStats.slowChance || 0;
  if (def.id === "knockbackModule") return towerStats.knockbackChance || 0;
  if (def.id === "reflectModule") return cardEffects.reflectLevel || 0;
  if (def.id === "mineRadius") return towerStats.mineRadius || 0;
  if (def.id === "mineChance") return towerStats.mineChance || 0;
  if (def.id === "fighterCap") return towerStats.fighterCap || 0;
  if (def.id === "waveGold") return towerStats.waveGoldBonus || 0;
  if (def.id === "goldMultiplier") return Math.max(0, (cardEffects.goldMultiplier || 1) - 1);
  if (def.id === "waveObsidian") return towerStats.waveObsidianLevel || 0;
  if (def.id === "medkit") return Math.min(1, (coreHp || 0) / Math.max(1, towerStats.maxHp || 1));
  if (def.id === "barrageExpansion") return towerStats.barrageExpansion || 0;
  if (def.id === "giantBloodline") return towerStats.giantBloodline || 0;
  if (def.id === "spellbladeTraining") return towerStats.spellbladeRatio || 0;
  if (def.id === "bloodCrit") return towerStats.bloodCritHeal || 0;
  if (def.id === "deepFreeze") return towerStats.deepFreezeBonus || 0;
  if (def.id === "orbitA") return towerStats.orbitA || 0;
  if (def.id === "orbitB") return towerStats.orbitB || 0;
  if (def.id === "staticField") return towerStats.staticFieldRatio || 0;
  if (def.id === "demolitionExpert") return towerStats.demolitionRadiusBonus || 0;
  if (def.id === "allIn") return towerStats.allInBonus || 0;
  if (def.id === "energySaver") return towerStats.energySaver || 0;
  if (def.id === "curseAura") return towerStats.curseAura || 0;
  return towerStats.defenseRate || 0;
}

function formatV2RunValue(def, value) {
  if (def.id === "medkit") return `${Math.round(value * 100)}% HP`;
  if (def.unit === "%") {
    const percent = value * 100;
    const digits = Math.abs(percent) < 0.1 ? 2 : Math.abs(percent) < 1 ? 1 : 0;
    const formatted = percent.toFixed(digits).replace(/(\.\d*?)0+$/, "$1").replace(/\.$/, "");
    return `${formatted}%`;
  }
  if (["reflectModule", "fighterCap", "waveObsidian", "orbitA", "orbitB"].includes(def.id)) return String(Math.round(value));
  return `${Math.round(value * 100) / 100}${def.unit || ""}`;
}

function renderV2UpgradeGrid() {
  if (!v2UpgradeGrid) return;
  const ui = getV2UiText();
  for (const def of V2_RUN_UPGRADES) {
    const unlocked = isV2UpgradeUnlocked(def);
    const value = getV2UpgradeValue(def);
    const cost = getUpgradeCost(def.id);
    const capped = !def.consumable && value >= def.cap - 0.000001;
    let button = v2UpgradeGrid.querySelector(`[data-v2-upgrade="${def.id}"]`);
    if (!button) {
      button = document.createElement("button");
      button.type = "button";
      button.dataset.v2Upgrade = def.id;
      button.innerHTML = "<span></span><b></b><small><em></em><strong></strong></small>";
      button.addEventListener("click", () => buyV2Upgrade(def.id));
      v2UpgradeGrid.appendChild(button);
    }
    button.className = `upgrade-card${unlocked ? "" : " locked"}${capped ? " capped" : ""}`;
    button.disabled = !unlocked || capped || (!DEV_MODE && gold < cost);
    button.querySelector("span").textContent = unlocked ? def.name : `🔒 ${def.name}`;
    button.querySelector("b").textContent = unlocked ? formatV2RunValue(def, value) : ui.obsidianUnlock;
    button.querySelector("em").textContent = def.consumable ? ui.healNow : `+${formatV2RunValue(def, def.step)}`;
    button.querySelector("strong").textContent = formatGold(cost);
  }
}

function buyV2Upgrade(id) {
  const def = V2_RUN_UPGRADES.find((item) => item.id === id);
  if (!def || !isV2UpgradeUnlocked(def)) return;
  if (!def.consumable && getV2UpgradeValue(def) >= def.cap - 0.000001) return;
  const cost = getUpgradeCost(id);
  if (!DEV_MODE && gold < cost) return;
  if (!DEV_MODE) gold -= cost;
  towerStats.upgrades[id] = (towerStats.upgrades[id] || 0) + 1;
  if (id === "defenseRate") towerStats.defenseRate = Math.min(def.cap, towerStats.defenseRate + def.step);
  else if (id === "physicalArmor") towerStats.physicalDefense += def.step;
  else if (id === "magicArmor") towerStats.magicDefense += def.step;
  else if (id === "slowModule") towerStats.slowChance = Math.min(def.cap, towerStats.slowChance + def.step);
  else if (id === "knockbackModule") towerStats.knockbackChance = Math.min(def.cap, towerStats.knockbackChance + def.step);
  else if (id === "reflectModule") cardEffects.reflectLevel = Math.min(def.cap, cardEffects.reflectLevel + 1);
  else if (id === "mineRadius") towerStats.mineRadius = Math.min(def.cap, towerStats.mineRadius + def.step);
  else if (id === "mineChance") towerStats.mineChance = Math.min(def.cap, towerStats.mineChance + def.step);
  else if (id === "fighterCap") {
    towerStats.fighterCap = Math.min(8, towerStats.fighterCap + 1);
    if (fighters.length < towerStats.fighterCap) fighters.push({ phase: fighters.length * 2.1, cooldown: rand(1.5, 4.5), x: tower.x, y: tower.y });
  } else if (id === "waveGold") towerStats.waveGoldBonus = Math.min(def.cap, towerStats.waveGoldBonus + def.step);
  else if (id === "goldMultiplier") cardEffects.goldMultiplier = Math.min(2.8, cardEffects.goldMultiplier + def.step);
  else if (id === "waveObsidian") towerStats.waveObsidianLevel = Math.min(def.cap, towerStats.waveObsidianLevel + 1);
  else if (id === "medkit") coreHp = Math.min(towerStats.maxHp, coreHp + towerStats.maxHp * (0.28 + getMetaValue("medkit")));
  else if (id === "barrageExpansion") towerStats.barrageExpansion = Math.min(def.cap, (towerStats.barrageExpansion || 0) + def.step);
  else if (id === "giantBloodline") {
    const hpGain = towerStats.maxHp * def.step;
    towerStats.giantBloodline = Math.min(def.cap, (towerStats.giantBloodline || 0) + def.step);
    towerStats.giantSpeedPenalty = Math.min(0.75, (towerStats.giantSpeedPenalty || 0) + 0.01);
    towerStats.maxHp += hpGain;
    coreHp += hpGain;
  } else if (id === "spellbladeTraining") towerStats.spellbladeRatio = Math.min(def.cap, (towerStats.spellbladeRatio || 0) + def.step);
  else if (id === "bloodCrit") towerStats.bloodCritHeal = Math.min(def.cap, (towerStats.bloodCritHeal || 0) + def.step);
  else if (id === "deepFreeze") towerStats.deepFreezeBonus = Math.min(def.cap, (towerStats.deepFreezeBonus || 0) + def.step);
  else if (id === "orbitA") towerStats.orbitA = 1;
  else if (id === "orbitB") towerStats.orbitB = 1;
  else if (id === "staticField") towerStats.staticFieldRatio = Math.min(def.cap, (towerStats.staticFieldRatio || 0) + def.step);
  else if (id === "demolitionExpert") towerStats.demolitionRadiusBonus = Math.min(def.cap, (towerStats.demolitionRadiusBonus || 0) + def.step);
  else if (id === "allIn") towerStats.allInBonus = Math.min(def.cap, (towerStats.allInBonus || 0) + def.step);
  else if (id === "energySaver") towerStats.energySaver = Math.min(def.cap, (towerStats.energySaver || 0) + def.step);
  else if (id === "curseAura") towerStats.curseAura = Math.min(def.cap, (towerStats.curseAura || 0) + def.step);
  updateHud();
  saveActiveRunCheckpoint();
}

const v2BaseRenderMetaUpgrades = renderMetaUpgrades;
renderMetaUpgrades = function () {
  ensureV2MetaDefaults();
  v2BaseRenderMetaUpgrades();
};

const v2BaseUpdateUpgradeUI = updateUpgradeUI;
updateUpgradeUI = function () {
  v2BaseUpdateUpgradeUI();
  renderV2UpgradeGrid();
};

// ---------- Cards: five-star progression ----------

const v2BaseCreateCardEffects = createCardEffects;
createCardEffects = function () {
  return {
    ...v2BaseCreateCardEffects(),
    chanceSlowLevel: 0,
    blindLevel: 0,
    defectionLevel: 0,
    blackHoleLevel: 0,
    blackHoleTimer: 10,
    extraRowLevel: 0,
    armorBreakerLevel: 0,
    plasmaBurstLevel: 0,
    plasmaBurstHits: 0,
    finisherLevel: 0,
    shieldRechargeLevel: 0,
    shieldRechargeTimer: 0,
    ricochetLevel: 0,
    nanoRepairLevel: 0,
    nanoRepairVisualTimer: 0,
    bountyMatrixLevel: 0,
    lastStandLevel: 0,
    lastStandVisualTimer: 0,
    lastStandWasActive: false
  };
};

const v2CardBaseGetAttackSpeed = getAttackSpeed;
getAttackSpeed = function () {
  const base = v2CardBaseGetAttackSpeed();
  const active = towerStats.maxHp > 0 && coreHp / towerStats.maxHp < 0.35;
  return base * (active ? 1 + cardEffects.lastStandLevel * 0.08 : 1);
};

const v2CardBaseGetRegenRate = getRegenRate;
getRegenRate = function () {
  return v2CardBaseGetRegenRate() + towerStats.maxHp * cardEffects.nanoRepairLevel * 0.0003;
};

getCardStacks = function (cardId) {
  return Math.max(0, Math.floor(v2CardStars[cardId] || 0));
};

const v2BaseChooseCard = chooseCard;
chooseCard = function (cardId) {
  const selected = offeredCards.find((item) => item.id === cardId);
  if (!selected) return;
  v2BaseChooseCard(cardId);
  v2CardStars[cardId] = Math.min(V2_CARD_MAX_STARS, (v2CardStars[cardId] || 0) + 1);
};

function getV2StarString(cardId, next = false) {
  const current = Math.min(V2_CARD_MAX_STARS, (v2CardStars[cardId] || 0) + (next ? 1 : 0));
  return `${"★".repeat(current)}${"☆".repeat(V2_CARD_MAX_STARS - current)}`;
}

const v2BasePresentCardChoice = presentCardChoice;
presentCardChoice = function () {
  v2BasePresentCardChoice();
  for (const button of cardGrid.querySelectorAll("[data-card]")) {
    const label = button.querySelector("span");
    if (label) label.insertAdjacentHTML("beforeend", `<i class="skill-stars">${getV2StarString(button.dataset.card, true)}</i>`);
  }
};

const v2BaseGetCardArtClass = getCardArtClass;
getCardArtClass = function (cardId) {
  const map = { chance_slow: "art-frost-rounds", blind_rounds: "art-emp", defection: "art-drone-swarm", black_hole: "art-magic", extra_row: "art-overload-mag" };
  return map[cardId] || v2BaseGetCardArtClass(cardId);
};

const V2_CARD_ART = Object.freeze({
  gold_boost: ["⛏", "×1.12", "gold"], attack_boost: ["➤", "+18%", "red"], speed_boost: ["ϟ", "+16%", "green"],
  mini_turret: ["⌖", "+1", "cyan"], core_expand: ["⬢", "+25%", "blue"], magic_damage: ["✦", "+MAG", "violet"],
  bleed: ["◒", "0.5%", "red"], fighter: ["▲", "+1", "cyan"], range_boost: ["◎", "+12%", "blue"], emp: ["⌁", "EMP", "cyan"],
  reflect_armor: ["◇", "REFLECT", "violet"], gray_drone_swarm: ["⋰⋱", "DRONE", "slate"], frost_rounds: ["❄", "SLOW", "cyan"],
  knockback_rounds: ["⇢", "PUSH", "blue"], command_relay: ["⌾", "SUMMON", "green"], chain_blast: ["✹", "BLAST", "orange"],
  overload_magazine: ["⚡", "BURST", "orange"], weakpoint_mark: ["⊙", "+8%", "gold"], piercing_sniper: ["╾━", "SNIPE", "red"],
  reactive_shield: ["⬡", "GUARD", "green"], chance_slow: ["❄", "+5.5%", "cyan"], blind_rounds: ["✺", "BLIND", "gold"],
  defection: ["↺", "TURN", "green"], black_hole: ["●", "PULL", "violet"], extra_row: ["≡", "2×SHOT", "cyan"],
  armor_breaker: ["◈", "-6% ARM", "red"], plasma_burst: ["✧", "8 HIT", "violet"], finisher: ["⌁", "+8%", "red"],
  shield_recharge: ["＋", "SHIELD", "blue"], ricochet: ["↗", "45%", "cyan"], repair_nanites: ["✚", "+0.03%", "green"],
  bounty_matrix: ["¤", "×1.04", "gold"], last_stand: ["▲", "+8% SPD", "orange"]
});

getCardArt = function (cardId) {
  const [icon, badge, tone] = V2_CARD_ART[cardId] || ["◆", "SKILL", "blue"];
  const card = SPECIAL_CARDS.find((item) => item.id === cardId);
  const label = card ? getLocalizedCard(card).name : cardId.replaceAll("_", " ");
  return `<div class="card-art semantic-card-art tone-${tone}" role="img" aria-label="${escapeHtml(label)}"><span class="card-art-orbit"></span><span class="card-art-icon">${escapeHtml(icon)}</span><strong class="card-art-badge">${escapeHtml(badge)}</strong></div>`;
};

// ---------- Reset, persistent supports and environment ----------

const V2_EXPANSION_UPGRADE_IDS = [
  "barrageExpansion", "giantBloodline", "spellbladeTraining", "bloodCrit", "deepFreeze", "orbitA",
  "orbitB", "staticField", "demolitionExpert", "allIn", "energySaver", "curseAura"
];

function initializeExpansionUpgradeState() {
  const levels = Object.fromEntries(V2_EXPANSION_UPGRADE_IDS.map((id) => [id, getMetaLevel(id)]));
  for (const id of V2_EXPANSION_UPGRADE_IDS) towerStats.upgrades[id] = levels[id];
  towerStats.barrageExpansion = getMetaValue("barrageExpansion");
  towerStats.giantBloodline = getMetaValue("giantBloodline");
  towerStats.giantSpeedPenalty = Math.min(0.6, levels.giantBloodline * 0.006);
  towerStats.spellbladeRatio = getMetaValue("spellbladeTraining");
  towerStats.bloodCritHeal = getMetaValue("bloodCrit");
  towerStats.deepFreezeBonus = getMetaValue("deepFreeze");
  towerStats.orbitA = levels.orbitA > 0 ? 1 : 0;
  towerStats.orbitB = levels.orbitB > 0 ? 1 : 0;
  towerStats.staticFieldRatio = getMetaValue("staticField");
  towerStats.demolitionRadiusBonus = getMetaValue("demolitionExpert");
  towerStats.allInBonus = getMetaValue("allIn");
  towerStats.energySaver = Math.min(0.9, getMetaValue("energySaver"));
  towerStats.curseAura = getMetaValue("curseAura");
  if (towerStats.giantBloodline > 0) towerStats.maxHp *= 1 + towerStats.giantBloodline;
}

const v2BaseResetGame = resetGame;
resetGame = function () {
  v2BaseResetGame();
  vipBattleImpacts.length = 0;
  vipBattleBeams.length = 0;
  vipImpactCooldown.clear();
  autoUpgradeIndex = 0;
  v2CardStars = {};
  v2BlackHole = null;
  v2ConvertedFighters = [];
  v2WorkshopMainTurrets = [];
  v2StaticFieldTimer = 0;
  v2VoidKillCounter = 0;
  towerStats.defenseRate = clamp(getMetaValue("defenseRate"), 0, 0.35);
  towerStats.slowChance = clamp(getMetaValue("slowModule"), 0, 0.35);
  towerStats.knockbackChance = clamp(getMetaValue("knockbackModule"), 0, 0.2);
  towerStats.mineRadius = 64 + getMetaValue("mineRadius");
  towerStats.mineChance = clamp(getMetaValue("mineChance"), 0, 0.12);
  towerStats.fighterCap = clamp(getMetaValue("fighterHangar"), 0, 8);
  const fighterStartX = tower?.x ?? width * 0.5;
  const fighterStartY = tower?.y ?? height * 0.5;
  for (let index = 0; index < towerStats.fighterCap; index += 1) {
    fighters.push({ phase: index * 2.1, cooldown: rand(1.5, 4.5), x: fighterStartX, y: fighterStartY });
  }
  towerStats.waveGoldBonus = getMetaValue("waveGold");
  towerStats.waveObsidianLevel = getMetaValue("waveObsidian");
  cardEffects.reflectLevel = Math.min(10, getMetaValue("reflectModule"));
  cardEffects.goldMultiplier *= 1 + getMetaValue("goldMultiplier");
  for (const def of V2_RUN_UPGRADES) towerStats.upgrades[def.id] = 0;
  initializeExpansionUpgradeState();
  coreHp = towerStats.maxHp;
  const mainCap = getMainSlotCap(activeRunTier);
  let mainInserted = 0;
  for (const turret of V2_TURRET_DEFS.filter((item) => item.role === "main")) {
    const count = Math.min(v2Progress.active[turret.id] || 0, v2Progress.assembled[turret.id] || 0, Math.max(0, mainCap - mainInserted));
    for (let index = 0; index < count; index += 1) {
      v2WorkshopMainTurrets.push({ fireTimer: rand(0.15, 0.9), phase: v2WorkshopMainTurrets.length * 1.37, kind: turret.id, shotCounter: 0 });
      mainInserted += 1;
    }
  }
  const supportCap = getSupportSlotCap(activeRunTier);
  let inserted = 0;
  for (const turret of V2_TURRET_DEFS.filter((item) => item.role === "auxiliary")) {
    const count = Math.min(v2Progress.active[turret.id] || 0, v2Progress.assembled[turret.id] || 0, Math.max(0, supportCap - inserted));
    for (let index = 0; index < count; index += 1) {
      auxiliaryTurrets.push({ fireTimer: rand(0.2, 1.1), phase: auxiliaryTurrets.length * 1.7, kind: turret.id, persistent: true });
      inserted += 1;
    }
  }
  const shieldGeneratorPower = auxiliaryTurrets
    .filter((item) => item.kind === "shield_generator")
    .reduce((sum, item) => sum + getV2TurretEffectMultiplier(item.kind), 0);
  const reflectBastionPower = v2WorkshopMainTurrets
    .filter((item) => item.kind === "reflect_bastion")
    .reduce((sum, item) => sum + getV2TurretEffectMultiplier(item.kind), 0);
  towerStats.defenseRate = clamp(towerStats.defenseRate + shieldGeneratorPower * 0.02, 0, 0.55);
  cardEffects.reflectLevel += reflectBastionPower * 2;
  towerStats.emergencyShieldUsed = false;
  showEnvironmentBanner(true);
  updateHud();
};

const v2MiniTurretCard = SPECIAL_CARDS.find((card) => card.id === "mini_turret");
if (v2MiniTurretCard) {
  v2MiniTurretCard.name = "戰地副砲";
  v2MiniTurretCard.description = "本局臨時部署 1 座連射副砲；永久副砲則由首頁碎片工坊組裝。";
  v2MiniTurretCard.apply = () => {
    if (auxiliaryTurrets.length < getSupportSlotCap(activeRunTier)) auxiliaryTurrets.push({ fireTimer: rand(0.2, 1.2), phase: auxiliaryTurrets.length * 1.7, kind: "missile_nest", temporary: true });
  };
}
const v2FighterCard = SPECIAL_CARDS.find((card) => card.id === "fighter");
if (v2FighterCard) {
  v2FighterCard.description = "部署 1 架軌道戰機；戰機庫、卡牌與局內金幣升級都可增加編隊，最多 8 架。";
  v2FighterCard.apply = () => {
    if (fighters.length >= 8) return;
    fighters.push({ phase: fighters.length * 2.1, cooldown: rand(1.5, 4.5), x: tower.x, y: tower.y });
    towerStats.fighterCap = Math.max(towerStats.fighterCap || 0, fighters.length);
  };
}

function showEnvironmentBanner(force = false) {
  const ui = getV2UiText();
  const env = getActiveEnvironment();
  const id = env?.id || "clear";
  if (!force && id === v2LastEnvironmentId) return;
  v2LastEnvironmentId = id;
  if (!env) {
    environmentHud.textContent = ui.clear || "CLEAR";
    v2EnvironmentBanner.hidden = true;
    return;
  }
  environmentHud.textContent = env.name;
  v2EnvironmentBanner.style.setProperty("--env", env.color);
  v2EnvironmentBanner.textContent = `${env.name} · ${env.description}`;
  v2EnvironmentBanner.hidden = false;
  v2EnvironmentBannerTimer = 4.5;
}

const v2BaseBeginNextWave = beginNextWave;
beginNextWave = function () {
  v2BaseBeginNextWave();
  if (towerStats.waveGoldBonus > 0) {
    const reward = window.applySpaceTowerBattleGoldMultiplier?.(Math.max(1, Math.round(towerStats.waveGoldBonus * (1 + Math.log1p(wave) * 0.08))))
      ?? Math.max(1, Math.round(towerStats.waveGoldBonus * (1 + Math.log1p(wave) * 0.08)));
    gold += reward;
    runStats.goldEarned += reward;
    pushVisualEffect(scorePopups, 56, { x: tower.x, y: tower.y - tower.radius * 2.8, vy: -17, life: 0.66, text: `WAVE +${formatGold(reward)}`, color: "#ffd36e" });
  }
  const obsLevel = towerStats.waveObsidianLevel || 0;
  const interval = Math.max(100, 250 - obsLevel * 10);
  if (obsLevel > 0 && wave % interval === 0) {
    const reward = Math.min(3, 1 + Math.floor(obsLevel / 5));
    const granted = window.grantSpaceTowerBattleObsidian?.(reward, "recycler") || 0;
    if (granted > 0) pushVisualEffect(scorePopups, 56, { x: tower.x, y: tower.y - tower.radius * 3.3, vy: -16, life: 0.72, text: `+${granted} OBS`, color: "#c7b7ff" });
  }
  const miningPower = auxiliaryTurrets
    .filter((item) => item.kind === "mining_gold")
    .reduce((sum, item) => sum + getV2TurretEffectMultiplier(item.kind), 0);
  if (miningPower > 0) {
    const reward = window.applySpaceTowerBattleGoldMultiplier?.(Math.max(1, Math.round(miningPower * (2 + Math.log1p(wave) * 0.7))))
      ?? Math.max(1, Math.round(miningPower * (2 + Math.log1p(wave) * 0.7)));
    gold += reward;
    runStats.goldEarned += reward;
    pushVisualEffect(scorePopups, 56, { x: tower.x, y: tower.y - tower.radius * 3.8, vy: -16, life: 0.7, text: `MINE +${formatGold(reward)}`, color: "#ffd36e" });
  }
  showEnvironmentBanner();
};

const v2BaseGetAttackSpeed = getAttackSpeed;
getAttackSpeed = function () {
  const env = getActiveEnvironment();
  const fullHpBerserk = coreHp >= towerStats.maxHp - 0.000001
    ? v2WorkshopMainTurrets.filter((item) => item.kind === "full_hp_berserk").reduce((sum, item) => sum + 0.15 * getV2TurretEffectMultiplier(item.kind), 0)
    : 0;
  const barrageMultiplier = 1 + (towerStats.barrageExpansion || 0);
  const giantMultiplier = 1 - clamp(towerStats.giantSpeedPenalty || 0, 0, 0.75);
  return v2BaseGetAttackSpeed() * barrageMultiplier * giantMultiplier * (1 + fullHpBerserk) * (env?.id === "solar" ? 1.12 : 1);
};
const v2BaseGetTowerRange = getTowerRange;
getTowerRange = function () {
  const env = getActiveEnvironment();
  return v2BaseGetTowerRange() * (env?.id === "nebula" ? 0.88 : 1);
};
const v2BaseGetMagicDamage = getMagicDamage;
getMagicDamage = function () {
  const env = getActiveEnvironment();
  const spellbladeBonus = getPhysicalDamage() * (towerStats.spellbladeRatio || 0);
  return Math.round((v2BaseGetMagicDamage() + spellbladeBonus) * (env?.id === "nebula" ? 1.18 : 1));
};
const v2BaseGetPhysicalDamage = getPhysicalDamage;
getPhysicalDamage = function () {
  const env = getActiveEnvironment();
  const barrageMultiplier = Math.max(0.1, 1 - (towerStats.barrageExpansion || 0));
  const allInMultiplier = auxiliaryTurrets.length === 0 ? 1 + (towerStats.allInBonus || 0) : 1;
  return Math.max(1, Math.round(v2BaseGetPhysicalDamage() * barrageMultiplier * allInMultiplier * (env?.id === "crystal" ? 1.1 : 1)));
};
const v2BaseGetCritChance = getCritChance;
getCritChance = function () {
  const resonanceBonus = auxiliaryTurrets
    .filter((item) => item.kind === "crit_resonance")
    .reduce((sum, item) => sum + 0.05 * getV2TurretEffectMultiplier(item.kind), 0);
  return clamp(v2BaseGetCritChance() + resonanceBonus, 0, CRIT_CHANCE_MAX);
};

// ---------- Early-wave pacing and enemy abilities ----------

const v2BaseGetBasicEnemyStats = getBasicEnemyStats;
getBasicEnemyStats = function (waveNumber) {
  const stats = v2BaseGetBasicEnemyStats(waveNumber);
  if (waveNumber <= 20) {
    const factor = 0.5 + (Math.max(1, waveNumber) - 1) / 19 * 0.5;
    stats.hp = Math.max(1, Math.round(stats.hp * factor));
    stats.count = Math.min(RUNTIME_BALANCE.wave.countCap, Math.max(stats.count + 2, Math.round(stats.count / factor)));
    stats.spawnInterval = Math.max(RUNTIME_BALANCE.wave.spawnIntervalMin, stats.spawnInterval * Math.max(0.58, factor * 0.88));
  }
  stats.count = Math.round(stats.count * MINOR_ENEMY_BALANCE.countMultiplier);
  return stats;
};

const v2BaseGetEnemyTypeWeight = getEnemyTypeWeight;
getEnemyTypeWeight = function (type, waveNumber) {
  if (activeRunTier < (type.unlockTier || 1)) return 0;
  return v2BaseGetEnemyTypeWeight(type, waveNumber);
};

function getV2GuaranteedEnemyTypes(waveNumber, tier = activeRunTier) {
  return Object.values(ENEMY_TYPES)
    .filter((type) => (type.unlockTier || 1) > 1
      && Number(tier) >= (type.unlockTier || 1)
      && Number(waveNumber) === Number(type.unlockWave))
    .sort((left, right) => (left.unlockTier || 1) - (right.unlockTier || 1)
      || String(left.name).localeCompare(String(right.name)));
}

const v2BaseChooseEnemyType = chooseEnemyType;
let v2GuaranteedEnemyWaveKey = "";
let v2GuaranteedEnemyQueue = [];
chooseEnemyType = function (waveNumber) {
  const waveKey = `${activeRunTier}:${waveNumber}`;
  if (waveKey !== v2GuaranteedEnemyWaveKey) {
    v2GuaranteedEnemyWaveKey = waveKey;
    v2GuaranteedEnemyQueue = getV2GuaranteedEnemyTypes(waveNumber);
  }
  return v2GuaranteedEnemyQueue.shift() || v2BaseChooseEnemyType(waveNumber);
};

const v2BaseGetEnemyStats = getEnemyStats;
getEnemyStats = function (waveNumber, type) {
  const stats = v2BaseGetEnemyStats(waveNumber, type);
  const env = getActiveEnvironment();
  if (env?.id === "crystal") stats.physicalDefense += 6 + activeRunTier * 2;
  return { ...stats, ability: type.ability || "", shieldScale: type.shieldScale || 0, ranged: Boolean(type.ranged) };
};

const v2BaseSpawnEnemyFromStats = spawnEnemyFromStats;
spawnEnemyFromStats = function (stats, x, y, size, extra = {}) {
  const enemy = v2BaseSpawnEnemyFromStats(stats, x, y, size, extra);
  enemy.ability = stats.ability || enemy.ability || "";
  enemy.abilityTimer = rand(1.1, 3.4);
  enemy.erraticPhase = rand(0, Math.PI * 2);
  enemy.trail = [];
  enemy.trailTimer = 0;
  enemy.blindTime = 0;
  enemy.v2BuffTimer = 0;
  enemy.v2BurnTime = 0;
  enemy.v2BurnDps = 0;
  enemy.v2Weaken = 0;
  enemy.v2Vulnerability = 0;
  const curseReduction = clamp(towerStats.curseAura || 0, 0, 0.5);
  if (curseReduction > 0) {
    enemy.maxHp = Math.max(1, Math.round(enemy.maxHp * (1 - curseReduction)));
    enemy.hp = Math.min(enemy.hp, enemy.maxHp);
  }
  if (enemy.ability === "full_shield") {
    enemy.shieldHp = Math.max(8, Math.round(enemy.maxHp * (stats.shieldScale || 0.75)));
    enemy.maxShieldHp = enemy.shieldHp;
  }
  return enemy;
};

function applyCoreDamageV2(rawDamage, damageType, x, y, label, sourceEnemy = null) {
  if (blockWithStartShield(x, y)) return;
  const defense = damageType === "magic" ? towerStats.magicDefense : towerStats.physicalDefense;
  const damage = Math.max(1, Math.round(rawDamage * (1 - clamp(towerStats.defenseRate || 0, 0, 0.55))) - Math.round(defense));
  applyCoreDamage(damage, x, y, { damageType, ranged: true, sourceEnemy });
  createTowerImpact(x, y, damage);
  if (label) pushVisualEffect(scorePopups, 56, { x: tower.x, y: tower.y - tower.radius * 2.6, vy: -17, life: 0.68, text: label, color: "#ff9de1" });
  if (coreHp <= towerStats.maxHp * 0.35) triggerDeathCounter();
  if (coreHp <= 0) endRun();
}

function updateV2EnemyAbilitiesBefore(dt) {
  const env = getActiveEnvironment();
  const slowAura = clamp(auxiliaryTurrets
    .filter((item) => item.kind === "time_slow")
    .reduce((sum, item) => sum + 0.05 * getV2TurretEffectMultiplier(item.kind), 0), 0, 0.5);
  for (const enemy of enemies) {
    enemy._v2BaseSpeed = enemy.speed;
    enemy._v2BaseCollision = enemy.collisionDamage;
    let speedMultiplier = (env?.id === "solar" ? 1.08 : env?.id === "gravity" ? 0.9 : 1) * (1 - slowAura);
    if (enemy.ability === "berserker") speedMultiplier *= 1 + (1 - clamp(enemy.hp / enemy.maxHp, 0, 1)) * 1.15;
    if (enemy.v2BuffTimer > 0) speedMultiplier *= 1.28;
    if (enemy.blindTime > 0) speedMultiplier *= 0.72;
    if (enemy.ability === "ranged" && Math.hypot(enemy.x - tower.x, enemy.y - tower.y) < getTowerRange() * 0.76) speedMultiplier = 0;
    enemy.speed *= speedMultiplier;
    enemy.collisionDamage *= (1 - clamp(towerStats.defenseRate || 0, 0, 0.55)) * (1 - clamp(enemy.v2Weaken || 0, 0, 0.75));
  }
}

function updateV2EnemyAbilitiesAfter(dt) {
  for (const enemy of enemies) {
    enemy.speed = enemy._v2BaseSpeed || enemy.speed;
    enemy.collisionDamage = enemy._v2BaseCollision || enemy.collisionDamage;
    enemy.blindTime = Math.max(0, (enemy.blindTime || 0) - dt);
    enemy.v2BuffTimer = Math.max(0, (enemy.v2BuffTimer || 0) - dt);
    if (enemy.v2BurnTime > 0 && enemy.hp > 0) {
      enemy.v2BurnTime = Math.max(0, enemy.v2BurnTime - dt);
      enemy.hp -= Math.max(0, enemy.v2BurnDps || 0) * dt;
      if (enemy.hp <= 0) awardEnemyGold(enemy);
    }
    enemy.abilityTimer -= dt;
    if (enemy.ability === "erratic") {
      const angle = Math.atan2(tower.y - enemy.y, tower.x - enemy.x) + Math.PI / 2;
      const sway = Math.sin(performance.now() * 0.004 + enemy.erraticPhase) * enemy.speed * 0.75 * dt;
      enemy.x = clamp(enemy.x + Math.cos(angle) * sway, -enemy.size * 2, width + enemy.size * 2);
      enemy.y = clamp(enemy.y + Math.sin(angle) * sway, -enemy.size * 2, height + enemy.size * 2);
    }
    if (enemy.ability === "ranged" && enemy.abilityTimer <= 0 && enemy.blindTime <= 0) {
      enemy.abilityTimer = Math.max(1.8, 4.0 - activeRunTier * 0.16);
      const raw = Math.max(2, Math.round(enemy.collisionDamage * 1.25));
      laserBeams.push({ x1: enemy.x, y1: enemy.y, x2: tower.x, y2: tower.y, life: 0.42, maxLife: 0.42, color: "#ff9de1", innerColor: "#ffffff", width: 5 });
      applyCoreDamageV2(raw, "magic", tower.x, tower.y, getV2UiText().rangedShot, enemy);
    }
    if (enemy.ability === "healer" && enemy.abilityTimer <= 0) {
      enemy.abilityTimer = 3.8;
      const radius = 150 + activeRunTier * 8;
      let healed = 0;
      for (const ally of enemies) {
        if (ally === enemy || ally.hp <= 0 || ally.hp >= ally.maxHp) continue;
        if (Math.hypot(ally.x - enemy.x, ally.y - enemy.y) > radius) continue;
        const amount = Math.max(1, Math.round(ally.maxHp * 0.075));
        ally.hp = Math.min(ally.maxHp, ally.hp + amount);
        healed += 1;
      }
      if (healed) {
        pushVisualEffect(shockwaves, 48, { x: enemy.x, y: enemy.y, r: 10, life: 0.5, maxLife: 0.5, color: "#72ffac", emp: true });
        pushVisualEffect(scorePopups, 56, { x: enemy.x, y: enemy.y - enemy.size, vy: -14, life: 0.55, text: `${getV2UiText().repair} ×${healed}`, color: "#72ffac" });
      }
    }
    if (enemy.ability === "buffer") {
      enemy.trailTimer -= dt;
      if (enemy.trailTimer <= 0) {
        enemy.trailTimer = 0.16;
        enemy.trail.push({ x: enemy.x, y: enemy.y, life: 2.8 });
        if (enemy.trail.length > 22) enemy.trail.shift();
      }
      for (const ally of enemies) {
        if (ally === enemy || ally.hp <= 0) continue;
        if (enemy.trail.some((point) => Math.hypot(point.x - ally.x, point.y - ally.y) <= 34 + ally.size * 0.5)) ally.v2BuffTimer = Math.max(ally.v2BuffTimer || 0, 2.2);
      }
    }
    for (const point of enemy.trail || []) point.life -= dt;
    if (enemy.trail) enemy.trail = enemy.trail.filter((point) => point.life > 0);
  }
}

function updateBlackHole(dt) {
  if (cardEffects.blackHoleLevel <= 0 && !v2BlackHole) return;
  if (cardEffects.blackHoleLevel > 0) cardEffects.blackHoleTimer -= dt;
  if (!v2BlackHole && cardEffects.blackHoleLevel > 0 && cardEffects.blackHoleTimer <= 0) {
    const target = findPriorityEnemy();
    if (target) v2BlackHole = { x: target.x, y: target.y, life: 2.8 + cardEffects.blackHoleLevel * 0.22, maxLife: 2.8 + cardEffects.blackHoleLevel * 0.22, radius: 145 + cardEffects.blackHoleLevel * 14 };
    cardEffects.blackHoleTimer = Math.max(8, 18 - cardEffects.blackHoleLevel * 1.6);
  }
  if (!v2BlackHole) return;
  v2BlackHole.life -= dt;
  for (const enemy of enemies) {
    const dx = v2BlackHole.x - enemy.x;
    const dy = v2BlackHole.y - enemy.y;
    const distance = Math.hypot(dx, dy);
    if (distance <= 2 || distance > v2BlackHole.radius) continue;
    const pull = (enemy.isBoss ? 42 : 160) * (1 - distance / v2BlackHole.radius);
    enemy.x += dx / distance * pull * dt;
    enemy.y += dy / distance * pull * dt;
    if (v2BlackHole.damagePerSecond > 0) {
      enemy.hp -= v2BlackHole.damagePerSecond * dt;
      if (enemy.hp <= 0) awardEnemyGold(enemy);
    }
  }
  if (v2BlackHole.life <= 0) v2BlackHole = null;
}

function updateConvertedFighters(dt) {
  for (const fighter of v2ConvertedFighters) {
    fighter.life -= dt;
    let target = fighter.target && fighter.target.hp > 0 ? fighter.target : findPriorityEnemy();
    fighter.target = target;
    if (!target) continue;
    const angle = Math.atan2(target.y - fighter.y, target.x - fighter.x);
    fighter.x += Math.cos(angle) * 310 * dt;
    fighter.y += Math.sin(angle) * 310 * dt;
    if (Math.hypot(target.x - fighter.x, target.y - fighter.y) <= target.size * 0.7 + 8) {
      const damage = Math.max(5, Math.round(getPhysicalDamage() * (1.5 + cardEffects.defectionLevel * 0.28)));
      applyEnemyDamage(target, damage, "area", target.x, target.y, "#85ffb6");
      pushVisualEffect(shockwaves, 48, { x: fighter.x, y: fighter.y, r: 8, life: 0.42, maxLife: 0.42, color: "#85ffb6", emp: true });
      fighter.life = 0;
    }
  }
  v2ConvertedFighters = v2ConvertedFighters.filter((fighter) => fighter.life > 0);
}

const v2BaseUpdate = update;
update = function (dt) {
  const active = gameStarted && !isPaused && !choosingCard && running;
  if (active) updateV2EnemyAbilitiesBefore(dt);
  v2BaseUpdate(dt);
  if (!active) return;
  updateWorkshopProjectiles(dt);
  updateWorkshopMainTurrets(dt);
  updateExpansionCombat(dt);
  updateV2EnemyAbilitiesAfter(dt);
  updateBlackHole(dt);
  updateConvertedFighters(dt);
  if (cardEffects.shieldRechargeLevel > 0) {
    cardEffects.shieldRechargeTimer -= dt;
    if (cardEffects.shieldRechargeTimer <= 0) {
      const cap = Math.ceil(cardEffects.shieldRechargeLevel / 2);
      specialState.shieldCharges = Math.min(cap, (specialState.shieldCharges || 0) + 1);
      cardEffects.shieldRechargeTimer = Math.max(22, 52 - cardEffects.shieldRechargeLevel * 6);
      pushVisualEffect(shockwaves, 48, { x: tower.x, y: tower.y, r: tower.radius * 1.35, life: 0.5, maxLife: 0.5, color: "#78b7ff", emp: true });
    }
  }
  if (cardEffects.nanoRepairLevel > 0 && coreHp < towerStats.maxHp) {
    cardEffects.nanoRepairVisualTimer -= dt;
    if (cardEffects.nanoRepairVisualTimer <= 0) {
      cardEffects.nanoRepairVisualTimer = 1.35;
      pushVisualEffect(shockwaves, 48, { x: tower.x, y: tower.y, r: tower.radius * 0.8, life: 0.6, maxLife: 0.6, color: "#67ffc1" });
      pushVisualEffect(scorePopups, 56, { x: tower.x, y: tower.y - tower.radius * 1.8, vy: -10, life: 0.58, text: "+", color: "#9fffd5" });
    }
  }
  const lastStandActive = cardEffects.lastStandLevel > 0 && towerStats.maxHp > 0 && coreHp / towerStats.maxHp < 0.35;
  if (lastStandActive) {
    if (!cardEffects.lastStandWasActive) {
      pushVisualEffect(shockwaves, 48, { x: tower.x, y: tower.y, r: tower.radius * 1.8, life: 0.7, maxLife: 0.7, color: "#ff6f45", emp: true });
    }
    cardEffects.lastStandVisualTimer -= dt;
    if (cardEffects.lastStandVisualTimer <= 0) {
      cardEffects.lastStandVisualTimer = 0.72;
      pushVisualEffect(shockwaves, 48, { x: tower.x, y: tower.y, r: tower.radius * 1.1, life: 0.46, maxLife: 0.46, color: "#ff9f5a", emp: true });
    }
  } else {
    cardEffects.lastStandVisualTimer = 0;
  }
  cardEffects.lastStandWasActive = lastStandActive;
  v2EnvironmentBannerTimer = Math.max(0, v2EnvironmentBannerTimer - dt);
  if (v2EnvironmentBannerTimer <= 0 && !v2EnvironmentBanner.hidden) v2EnvironmentBanner.hidden = true;
};

// ---------- Shields, control, cards and fragments ----------

const v2BaseApplyEnemyDamage = applyEnemyDamage;
applyEnemyDamage = function (enemy, rawDamage, damageType, x, y, popupColor = "#ffffff", critical = false) {
  let adjustedDamage = rawDamage;
  if ((enemy.frostTime || 0) > 0) adjustedDamage *= 1 + (towerStats.deepFreezeBonus || 0);
  adjustedDamage *= 1 + clamp(enemy.v2Vulnerability || 0, 0, 1.5);
  const finisherActive = cardEffects.finisherLevel > 0 && enemy.maxHp > 0 && enemy.hp / enemy.maxHp < 0.3;
  if (finisherActive) {
    adjustedDamage *= 1 + cardEffects.finisherLevel * 0.08;
  }
  if (enemy.ability === "frontal_shield" && damageType !== "area") {
    const hitDistance = Math.hypot((x ?? enemy.x) - enemy.x, (y ?? enemy.y) - enemy.y);
    const front = Math.atan2(tower.y - enemy.y, tower.x - enemy.x);
    const impact = Math.atan2((y ?? enemy.y) - enemy.y, (x ?? enemy.x) - enemy.x);
    const facing = Math.cos(impact - front);
    if (hitDistance > enemy.size * 0.12 && facing > 0.2) {
      pushVisualEffect(shockwaves, 48, { x, y, r: 5, life: 0.22, maxLife: 0.22, color: "#9db7ff" });
      pushVisualEffect(scorePopups, 56, { x: enemy.x, y: enemy.y - enemy.size, vy: -13, life: 0.42, text: getV2UiText().arcBlock, color: "#dfe7ff" });
      return 0;
    }
  }
  if (enemy.ability === "full_shield" && enemy.shieldHp > 0 && damageType !== "area") {
    const absorbed = Math.min(enemy.shieldHp, Math.max(1, Math.round(adjustedDamage)));
    enemy.shieldHp -= absorbed;
    pushVisualEffect(shockwaves, 48, { x: enemy.x, y: enemy.y, r: enemy.size * 0.65, life: 0.28, maxLife: 0.28, color: "#76b7ff" });
    pushVisualEffect(scorePopups, 56, { x: enemy.x, y: enemy.y - enemy.size, vy: -14, life: 0.45, text: `${getV2UiText().shield} -${absorbed}`, color: "#a9d2ff" });
    return 0;
  }
  const defenseBonus = enemy.v2BuffTimer > 0 ? 7 + activeRunTier * 2 : 0;
  const ignoredArmor = damageType === "physical"
    ? Math.floor(Math.max(0, enemy.physicalDefense) * Math.min(0.3, cardEffects.armorBreakerLevel * 0.06))
    : 0;
  enemy.physicalDefense += defenseBonus;
  enemy.magicDefense += defenseBonus;
  enemy.physicalDefense -= ignoredArmor;
  const result = v2BaseApplyEnemyDamage(enemy, adjustedDamage, damageType === "area" ? "physical" : damageType, x, y, popupColor, critical);
  enemy.physicalDefense += ignoredArmor - defenseBonus;
  enemy.magicDefense -= defenseBonus;
  const effectNow = performance.now();
  if (ignoredArmor > 0 && effectNow - (enemy.v2ArmorBreakFxAt || 0) >= 220) {
    enemy.v2ArmorBreakFxAt = effectNow;
    pushVisualEffect(shockwaves, 48, { x: enemy.x, y: enemy.y, r: enemy.size * 0.52, life: 0.24, maxLife: 0.24, color: "#ff6f82" });
  }
  if (finisherActive && effectNow - (enemy.v2FinisherFxAt || 0) >= 260) {
    enemy.v2FinisherFxAt = effectNow;
    const slash = enemy.size * 0.9;
    laserBeams.push({ x1: enemy.x - slash, y1: enemy.y + slash, x2: enemy.x + slash, y2: enemy.y - slash, life: 0.18, maxLife: 0.18, color: "#ff4f8a", innerColor: "#fff2f7", width: 3.5 });
  }
  if (critical && towerStats.bloodCritHeal > 0) coreHp = Math.min(towerStats.maxHp, coreHp + towerStats.bloodCritHeal);
  return result;
};

const vipBattleImpacts = [];
const vipBattleBeams = [];
const vipImpactCooldown = new Map();
const v2BaseApplyBulletControlEffects = applyBulletControlEffects;
applyBulletControlEffects = function (enemy, bullet) {
  v2BaseApplyBulletControlEffects(enemy, bullet);
  if (bullet.v2Frost) {
    enemy.frostSlow = Math.min(0.7, (enemy.frostSlow || 0) + bullet.v2Frost);
    enemy.frostTime = Math.max(enemy.frostTime || 0, 2.5);
  }
  if (bullet.v2BurnPower) {
    enemy.v2BurnTime = Math.max(enemy.v2BurnTime || 0, 4);
    enemy.v2BurnDps = Math.max(enemy.v2BurnDps || 0, Math.max(1, getMagicDamage() * 0.14 * bullet.v2BurnPower));
  }
  if (bullet.v2Weaken) enemy.v2Weaken = Math.max(enemy.v2Weaken || 0, bullet.v2Weaken);
  if (bullet.v2Vulnerability) enemy.v2Vulnerability = Math.max(enemy.v2Vulnerability || 0, bullet.v2Vulnerability);
  if (bullet.v2Knockback) {
    const angle = Math.atan2(enemy.y - tower.y, enemy.x - tower.x);
    const distance = (enemy.isBoss ? bullet.v2Knockback * 0.22 : bullet.v2Knockback) * getKnockbackScale(enemy);
    enemy.x += Math.cos(angle) * distance;
    enemy.y += Math.sin(angle) * distance;
  }
  if (bullet.v2Area) {
    const radius = bullet.v2Area * (1 + (towerStats.demolitionRadiusBonus || 0));
    for (const nearby of enemies) {
      if (nearby === enemy || nearby.hp <= 0 || Math.hypot(nearby.x - enemy.x, nearby.y - enemy.y) > radius) continue;
      applyEnemyDamage(nearby, Math.max(1, Math.round(bullet.damage * 0.45)), "area", nearby.x, nearby.y, bullet.color || "#ffb28f");
    }
  }
  const sourceDef = V2_TURRET_DEFS.find((item) => item.id === bullet.sourceKind);
  if (sourceDef?.vipExclusive) {
    const now = performance.now();
    if (now - (vipImpactCooldown.get(sourceDef.id) || 0) >= 120) {
      vipImpactCooldown.set(sourceDef.id, now);
      vipBattleImpacts.push({ x: enemy.x, y: enemy.y, id: sourceDef.id, color: sourceDef.color, at: now });
      if (vipBattleImpacts.length > 32) vipBattleImpacts.shift();
    }
  }
  if (bullet.v2Pulse) {
    pushVisualEffect(shockwaves, 48, { x: enemy.x, y: enemy.y, r: 10 * bullet.v2Pulse, life: 0.42, maxLife: 0.42, color: sourceDef?.color || "#7dd9ff", emp: true });
    for (const nearby of enemies) {
      if (nearby === enemy || nearby.hp <= 0 || Math.hypot(nearby.x - enemy.x, nearby.y - enemy.y) > 72 * bullet.v2Pulse) continue;
      applyEnemyDamage(nearby, Math.max(1, Math.round(bullet.damage * 0.28 * bullet.v2Pulse)), "area", nearby.x, nearby.y, sourceDef?.color || "#7dd9ff");
    }
  }
  if (bullet.v2Void) {
    pushVisualEffect(shockwaves, 48, { x: enemy.x, y: enemy.y, r: 8 * bullet.v2Void, life: 0.36, maxLife: 0.36, color: "#8e6cff" });
    for (const nearby of enemies) {
      if (nearby === enemy || nearby.hp <= 0) continue;
      const dx = enemy.x - nearby.x;
      const dy = enemy.y - nearby.y;
      const distance = Math.max(1, Math.hypot(dx, dy));
      if (distance > 120 * bullet.v2Void) continue;
      const pull = (nearby.isBoss ? 5 : 18) * bullet.v2Void;
      nearby.x += dx / distance * pull;
      nearby.y += dy / distance * pull;
    }
  }
  if (bullet.v2CapacitorBurst) {
    pushVisualEffect(shockwaves, 48, { x: enemy.x, y: enemy.y, r: 18, life: 0.46, maxLife: 0.46, color: sourceDef?.color || "#ffd978", emp: true });
    applyEnemyDamage(enemy, Math.max(1, Math.round(bullet.damage * bullet.v2CapacitorBurst)), "physical", enemy.x, enemy.y, sourceDef?.color || "#ffd978");
  }
  if (bullet.v2RoyalTideDamage) {
    pushVisualEffect(shockwaves, 48, { x: enemy.x, y: enemy.y, r: bullet.v2RoyalTideRadius * 0.35, life: 0.62, maxLife: 0.62, color: sourceDef?.color || "#1f5cff", emp: true });
    for (const nearby of enemies) {
      if (nearby === enemy || nearby.hp <= 0 || Math.hypot(nearby.x - enemy.x, nearby.y - enemy.y) > bullet.v2RoyalTideRadius) continue;
      applyEnemyDamage(nearby, Math.max(1, Math.round(bullet.damage * bullet.v2RoyalTideDamage)), "magic", nearby.x, nearby.y, sourceDef?.color || "#1f5cff");
      nearby.frostSlow = Math.min(0.7, (nearby.frostSlow || 0) + bullet.v2RoyalTideSlow);
      nearby.frostTime = Math.max(nearby.frostTime || 0, 2);
    }
  }
  if (bullet.v2PhaseEcho) {
    const offsetX = Math.cos(Math.atan2(enemy.y - tower.y, enemy.x - tower.x) + Math.PI / 2) * enemy.size;
    const offsetY = Math.sin(Math.atan2(enemy.y - tower.y, enemy.x - tower.x) + Math.PI / 2) * enemy.size;
    laserBeams.push({ x1: enemy.x + offsetX * 2.4, y1: enemy.y + offsetY * 2.4, x2: enemy.x, y2: enemy.y, life: 0.3, maxLife: 0.3, color: sourceDef?.color || "#ff72ed", innerColor: "#ffffff", width: 4 });
    pushVisualEffect(shockwaves, 48, { x: enemy.x, y: enemy.y, r: enemy.size * 0.7, life: 0.34, maxLife: 0.34, color: sourceDef?.color || "#ff72ed" });
    applyEnemyDamage(enemy, Math.max(1, Math.round(bullet.damage * bullet.v2PhaseEcho)), "physical", enemy.x, enemy.y, sourceDef?.color || "#ff72ed");
  }
  if (bullet.source === "main" && cardEffects.plasmaBurstLevel > 0) {
    cardEffects.plasmaBurstHits += 1;
    if (cardEffects.plasmaBurstHits >= 8) {
      cardEffects.plasmaBurstHits = 0;
      const radius = 84 + cardEffects.plasmaBurstLevel * 8;
      const damage = Math.max(1, Math.round(bullet.damage * (0.22 + cardEffects.plasmaBurstLevel * 0.05)));
      pushVisualEffect(shockwaves, 48, { x: enemy.x, y: enemy.y, r: radius * 0.35, life: 0.46, maxLife: 0.46, color: "#b987ff", emp: true });
      for (const nearby of enemies) {
        if (nearby.hp <= 0 || Math.hypot(nearby.x - enemy.x, nearby.y - enemy.y) > radius) continue;
        applyEnemyDamage(nearby, damage, "magic", nearby.x, nearby.y, "#c9a8ff");
      }
    }
  }
  if (bullet.source === "main" && cardEffects.ricochetLevel > 0 && Math.random() < 0.05 + cardEffects.ricochetLevel * 0.03) {
    const target = enemies
      .filter((item) => item !== enemy && item.hp > 0 && Math.hypot(item.x - enemy.x, item.y - enemy.y) <= 180)
      .sort((left, right) => Math.hypot(left.x - enemy.x, left.y - enemy.y) - Math.hypot(right.x - enemy.x, right.y - enemy.y))[0];
    if (target) {
      laserBeams.push({ x1: enemy.x, y1: enemy.y, x2: target.x, y2: target.y, life: 0.18, maxLife: 0.18, color: "#79efff", innerColor: "#ffffff", width: 2.5 });
      applyEnemyDamage(target, Math.max(1, Math.round(bullet.damage * 0.45)), "physical", target.x, target.y, "#79efff");
    }
  }
  if (sourceDef?.chain) {
    const chainEffect = getV2TurretEffectMultiplier(sourceDef.id);
    const chainTargets = enemies
      .filter((item) => item !== enemy && item.hp > 0 && Math.hypot(item.x - enemy.x, item.y - enemy.y) <= 170 * chainEffect)
      .sort((a, b) => Math.hypot(a.x - enemy.x, a.y - enemy.y) - Math.hypot(b.x - enemy.x, b.y - enemy.y))
      .slice(0, sourceDef.chain - 1);
    let from = enemy;
    if (sourceDef.id === "emerald_drake") addEmeraldImpact(enemy, chainTargets);
    for (const chained of chainTargets) {
      laserBeams.push({ x1: from.x, y1: from.y, x2: chained.x, y2: chained.y, life: 0.22, maxLife: 0.22, color: sourceDef.color, innerColor: "#ffffff", width: 3 });
      applyEnemyDamage(chained, Math.max(1, Math.round(bullet.damage * 0.55 * chainEffect)), "magic", chained.x, chained.y, sourceDef.color);
      from = chained;
    }
  }
  const slowChance = clamp((towerStats.slowChance || 0) + cardEffects.chanceSlowLevel * 0.055, 0, 0.65);
  if (Math.random() < slowChance) {
    enemy.frostSlow = Math.min(0.72, (enemy.frostSlow || 0) + 0.16 + cardEffects.chanceSlowLevel * 0.025);
    enemy.frostTime = Math.max(enemy.frostTime || 0, 2.2 + cardEffects.chanceSlowLevel * 0.25);
  }
  const knockChance = clamp((towerStats.knockbackChance || 0), 0, 0.35);
  if (Math.random() < knockChance) {
    const angle = Math.atan2(enemy.y - tower.y, enemy.x - tower.x);
    const distance = (enemy.isBoss ? 10 : 34) * (getActiveEnvironment()?.id === "gravity" ? 1.45 : 1) * getKnockbackScale(enemy);
    enemy.x += Math.cos(angle) * distance;
    enemy.y += Math.sin(angle) * distance;
  }
  if (cardEffects.blindLevel > 0 && Math.random() < 0.035 + cardEffects.blindLevel * 0.028) enemy.blindTime = Math.max(enemy.blindTime || 0, 2 + cardEffects.blindLevel * 0.3);
  if (bullet.source === "main" && enemy.type === "basic" && cardEffects.defectionLevel > 0 && Math.random() < 0.006 + cardEffects.defectionLevel * 0.006) {
    enemy.hp = 0;
    enemy.rewarded = true;
    v2ConvertedFighters.push({ x: enemy.x, y: enemy.y, life: 7, target: enemies.find((item) => item.isBoss && item.hp > 0) || null });
    pushVisualEffect(scorePopups, 56, { x: enemy.x, y: enemy.y - enemy.size, vy: -18, life: 0.62, text: getV2UiText().defected, color: "#85ffb6" });
  }
};

const v2BaseFireAt = fireAt;
fireAt = function (target) {
  const before = bullets.length;
  v2BaseFireAt(target);
  if (cardEffects.extraRowLevel <= 0 || bullets.length <= before) return;
  const source = bullets[bullets.length - 1];
  const baseAngle = Math.atan2(source.vy, source.vx);
  const ratio = 0.10 + Math.max(0, cardEffects.extraRowLevel - 1) * 0.05;
  for (const side of [-1, 1]) {
    const angle = baseAngle + side * (0.075 + cardEffects.extraRowLevel * 0.004);
    bullets.push({ ...source, x: source.x + Math.cos(baseAngle + side * Math.PI / 2) * 10, y: source.y + Math.sin(baseAngle + side * Math.PI / 2) * 10, vx: Math.cos(angle) * TOWER_BASE.projectileSpeed, vy: Math.sin(angle) * TOWER_BASE.projectileSpeed, r: Math.max(2.8, source.r * 0.72), damage: Math.max(1, Math.round(source.damage * ratio)), critical: false, charged: false, overloaded: false, source: "main", color: "#80eaff", trail: [] });
  }
};

function spawnSplitterChildren(enemy) {
  if (enemy.v2SplitSpawned) return;
  enemy.v2SplitSpawned = true;
  const baseType = ENEMY_TYPES.runner;
  const stats = getEnemyStats(wave, baseType);
  stats.hp = Math.max(1, Math.round(stats.hp / MINOR_ENEMY_BALANCE.hpMultiplier * 0.42)) * MINOR_ENEMY_BALANCE.hpMultiplier;
  stats.speed *= 1.18;
  stats.reward = Math.max(1, Math.round(enemy.reward * 0.2));
  const childCount = scaleMinorSummonCount(2, "splitter");
  for (let i = 0; i < childCount; i += 1) {
    const side = (i - (childCount - 1) / 2) * 2;
    spawnEnemyFromStats(stats, enemy.x + side * enemy.size * 0.38, enemy.y + side * 4, enemy.size * 0.48, { type: "splitling", ability: "", v2Child: true });
  }
}

function triggerV2Mine(enemy) {
  if ((towerStats.mineChance || 0) <= 0 || Math.random() >= towerStats.mineChance) return;
  const radius = towerStats.mineRadius || 64;
  const damage = Math.max(3, Math.round(getPhysicalDamage() * 0.7));
  pushVisualEffect(shockwaves, 48, { x: enemy.x, y: enemy.y, r: 8, life: 0.5, maxLife: 0.5, color: "#ff9f78", emp: true });
  for (const target of enemies) {
    if (target.hp <= 0 || Math.hypot(target.x - enemy.x, target.y - enemy.y) > radius) continue;
    applyEnemyDamage(target, target.isBoss ? Math.round(damage * 0.32) : damage, "area", target.x, target.y, "#ffb28f");
  }
}

function chooseTurretFragmentForDrop(forceWishlist = false) {
  const wished = V2_TURRET_DEFS.find((item) => !item.starterExclusive && !item.vipExclusive && item.id === v2Progress.fragmentWishlist);
  if (wished && (forceWishlist || Math.random() < V2_WISHLIST_DROP_RATE)) return wished;
  const freePool = V2_TURRET_DEFS.filter((item) => !item.starterExclusive && !item.vipExclusive);
  const pool = wished ? freePool.filter((item) => item.id !== wished.id) : freePool;
  return pool[Math.floor(Math.random() * pool.length)];
}

function grantTurretFragment(turret, enemy = null, source = "enemy_drop") {
  const ui = getV2UiText();
  if (!turret) return false;
  v2Progress.fragments[turret.id] += 1;
  v2Progress.lifetimeFragments += 1;
  v2Progress.fragmentPity = 0;
  if (runStats) runStats.fragments = (runStats.fragments || 0) + 1;
  if (enemy && scorePopups) pushVisualEffect(scorePopups, 56, { x: enemy.x, y: enemy.y - enemy.size * 2.25, vy: -16, life: 0.85, text: `${turret.icon} ${turret.name} ${ui.fragmentSuffix}`, color: turret.color });
  showTaskToast(ui.rareDrop, `${turret.name} ${ui.fragmentSuffix} ${v2Progress.fragments[turret.id]} / ${getTurretFragmentTarget(turret)}`);
  saveV2Progress();
  window.spaceTowerTrackEvent?.("fragment_awarded", { system: "turret", item_id: turret.id, grade: turret.strengthGrade, source });
  return true;
}

function maybeDropTurretFragment(enemy) {
  v2Progress.fragmentPity = Math.min(V2_FRAGMENT_PITY_TARGET, v2Progress.fragmentPity + 1);
  const guaranteed = v2Progress.fragmentPity >= V2_FRAGMENT_PITY_TARGET;
  const turret = chooseTurretFragmentForDrop(guaranteed);
  if (!turret || (!guaranteed && Math.random() >= getV2FragmentChance(turret.strengthGrade))) {
    if (!DEV_MODE && v2Progress.fragmentPity % 10 === 0) localStorage.setItem(V2_SAVE_KEY, JSON.stringify(normalizeV2Progress(v2Progress)));
    return false;
  }
  return grantTurretFragment(turret, enemy, guaranteed ? "pity" : "enemy_drop");
}

function grantTurretCore(turret, enemy = null, source = "enemy_drop") {
  if (!turret) return false;
  const starText = V2_TURRET_STAR_TEXT[currentLanguage] || V2_TURRET_STAR_TEXT.en;
  v2Progress.cores[turret.id] = Math.max(0, Math.floor(Number(v2Progress.cores[turret.id]) || 0)) + 1;
  if (enemy && scorePopups) {
    pushVisualEffect(scorePopups, 56, {
      x: enemy.x,
      y: enemy.y - enemy.size * 2.8,
      vy: -14,
      life: 1.15,
      text: `${turret.icon} ${starText.core}`,
      color: turret.color
    });
  }
  showTaskToast(starText.core, `${turret.name} ${starText.core} ×${v2Progress.cores[turret.id]}`);
  saveV2Progress({ critical: true });
  window.spaceTowerTrackEvent?.("turret_core_awarded", { turret_id: turret.id, tier: clampTier(activeRunTier), source });
  return true;
}

function maybeDropTurretCore(enemy) {
  if (Math.random() >= getTurretCoreDropChance(activeRunTier)) return false;
  const pool = V2_TURRET_DEFS.filter((item) => !item.starterExclusive && !item.vipExclusive);
  const turret = pool[Math.floor(Math.random() * pool.length)];
  return grantTurretCore(turret, enemy, "enemy_drop");
}

window.getSpaceTowerCoreDropChance = getTurretCoreDropChance;
window.grantSpaceTowerTurretCore = (turretId, amount = 1, source = "external") => {
  const turret = V2_TURRET_DEFS.find((item) => item.id === turretId);
  const safeAmount = Math.max(0, Math.floor(Number(amount) || 0));
  if (!turret || safeAmount <= 0) return false;
  v2Progress.cores[turret.id] += safeAmount;
  saveV2Progress({ critical: true });
  window.spaceTowerTrackEvent?.("turret_core_awarded", { turret_id: turret.id, amount: safeAmount, source });
  return true;
};
window.getSpaceTowerTurretIds = () => V2_TURRET_DEFS.filter((item) => !item.starterExclusive && !item.vipExclusive).map((item) => item.id);
window.getSpaceTowerPrizeTurretIds = () => V2_TURRET_DEFS.filter((item) => !item.starterExclusive).map((item) => item.id);
window.grantSpaceTowerTurretFragments = (turretId, amount = 1, source = "external") => {
  const turret = V2_TURRET_DEFS.find((item) => item.id === turretId);
  const safeAmount = Math.max(0, Math.floor(Number(amount) || 0));
  if (!turret || safeAmount <= 0) return false;
  v2Progress.fragments[turret.id] += safeAmount;
  v2Progress.lifetimeFragments += safeAmount;
  saveV2Progress({ critical: true });
  window.spaceTowerTrackEvent?.("turret_fragments_awarded", { turret_id: turret.id, amount: safeAmount, source });
  return true;
};

window.grantV2FirstDeploymentFragment = function () {
  const wished = V2_TURRET_DEFS.find((item) => !item.starterExclusive && !item.vipExclusive && item.id === v2Progress.fragmentWishlist);
  const fallback = V2_TURRET_DEFS.find((item) => item.id === "emergency_shield") || V2_TURRET_DEFS[0];
  return grantTurretFragment(wished || fallback, null, "first_deployment");
};

window.getV2SynergyCounts = function () {
  const counts = Object.fromEntries(["assault", "arcane", "control", "fleet", "fortress", "prosperity"].map((id) => [id, 0]));
  for (const turret of V2_TURRET_DEFS) {
    const active = Math.max(0, Math.floor(Number(v2Progress.active[turret.id]) || 0));
    const synergy = V2_TURRET_SYNERGY[turret.id];
    if (active > 0 && synergy) counts[synergy] += active;
  }
  return counts;
};

const v2BaseAwardEnemyGold = awardEnemyGold;
awardEnemyGold = function (enemy) {
  if (enemy.rewarded) return;
  const shouldSplit = enemy.ability === "splitter" && !enemy.v2Child;
  v2BaseAwardEnemyGold(enemy);
  if (cardEffects.bountyMatrixLevel > 0) {
    pushVisualEffect(shockwaves, 48, { x: enemy.x, y: enemy.y, r: enemy.size * 0.72, life: 0.42, maxLife: 0.42, color: "#ffd66b" });
    pushVisualEffect(scorePopups, 56, { x: enemy.x, y: enemy.y - enemy.size * 1.35, vy: -15, life: 0.52, text: "¤", color: "#ffe7a0" });
  }
  const soulDrainHealing = auxiliaryTurrets
    .filter((item) => item.kind === "soul_drain")
    .reduce((sum, item) => sum + 0.005 * getV2TurretEffectMultiplier(item.kind), 0);
  if (soulDrainHealing > 0) coreHp = Math.min(towerStats.maxHp, coreHp + towerStats.maxHp * soulDrainHealing);
  const voidCount = v2WorkshopMainTurrets.filter((item) => item.kind === "void_devourer").length;
  const voidPower = v2WorkshopMainTurrets
    .filter((item) => item.kind === "void_devourer")
    .reduce((sum, item) => sum + getV2TurretEffectMultiplier(item.kind), 0);
  if (voidCount > 0) {
    v2VoidKillCounter += 1;
    if (v2VoidKillCounter >= Math.max(8, 20 - voidCount * 2)) {
      v2VoidKillCounter = 0;
      v2BlackHole = {
        x: enemy.x,
        y: enemy.y,
        life: 3.2,
        maxLife: 3.2,
        radius: 150 + voidPower * 12,
        damagePerSecond: Math.max(1, getMagicDamage() * (0.18 + voidPower * 0.04))
      };
    }
  }
  maybeDropTurretFragment(enemy);
  maybeDropTurretCore(enemy);
  triggerV2Mine(enemy);
  if (shouldSplit) spawnSplitterChildren(enemy);
};

// ---------- Permanent auxiliary turret types ----------

function getWorkshopMainPosition(index, count = v2WorkshopMainTurrets.length) {
  const safeCount = Math.max(1, count);
  if (index <= 0 || safeCount === 1) return { x: tower.x, y: tower.y, angle: -Math.PI / 2, ring: 0 };
  const orbitIndex = index - 1;
  const outerOrbitEnabled = (towerStats.orbitB || 0) > 0;
  const firstRingCount = outerOrbitEnabled ? Math.min(6, safeCount - 1) : safeCount - 1;
  if (orbitIndex < firstRingCount) {
    const angle = -Math.PI / 2 + Math.PI * 2 * orbitIndex / Math.max(1, firstRingCount);
    const distance = tower.radius * ((towerStats.orbitA || 0) > 0 ? 5.2 : 3.7);
    return { x: tower.x + Math.cos(angle) * distance, y: tower.y + Math.sin(angle) * distance, angle, ring: 1 };
  }
  const secondIndex = orbitIndex - firstRingCount;
  const secondRingCount = Math.max(1, safeCount - 1 - firstRingCount);
  const angle = -Math.PI / 2 + Math.PI * 2 * secondIndex / secondRingCount + Math.PI / Math.max(3, secondRingCount);
  const distance = tower.radius * 8.5;
  return { x: tower.x + Math.cos(angle) * distance, y: tower.y + Math.sin(angle) * distance, angle, ring: 2 };
}

getAuxTurretPosition = function (index) {
  const parentCount = Math.max(1, v2WorkshopMainTurrets.length);
  const parentIndex = Math.floor(index / 3) % parentCount;
  const parent = getWorkshopMainPosition(parentIndex, parentCount);
  const slot = index % 3;
  const angle = parent.angle + Math.PI * 2 * slot / 3 + Math.PI / 6;
  const distance = tower.radius * 1.45;
  return {
    x: parent.x + Math.cos(angle) * distance,
    y: parent.y + Math.sin(angle) * distance,
    angle,
    parentIndex
  };
};

function getWorkshopTurretTarget(def, pos, rangeMultiplier = 1) {
  const range = getTowerRange() * (def.range || rangeMultiplier);
  if (def.highestHp) return findPriorityEnemy(range);
  return findNearestEnemyFrom(pos.x, pos.y, range);
}

function pushWorkshopBullet(def, pos, target, source, angleOffset = 0, lateral = 0, specialShot = {}) {
  const baseAngle = Math.atan2(target.y - pos.y, target.x - pos.x);
  const angle = baseAngle + angleOffset;
  const baseDamage = def.damageType === "magic"
    ? Math.max(1, getMagicDamage() || Math.round(getPhysicalDamage() * 0.65))
    : getPhysicalDamage();
  const starDamage = getV2TurretDamageMultiplier(def.id);
  const starEffect = getV2TurretEffectMultiplier(def.id);
  const rawDamage = Math.max(1, Math.round(baseDamage * Math.max(0.01, def.damage || 0) * starDamage * (source === "aux" ? getSummonDamageMultiplier() : 1)));
  const attackRoll = def.damageType === "magic" ? rollMagicAttackDamage(rawDamage) : rollPhysicalAttackDamage(rawDamage);
  const sideAngle = baseAngle + Math.PI / 2;
  bullets.push({
    x: pos.x + Math.cos(angle) * 10 + Math.cos(sideAngle) * lateral,
    y: pos.y + Math.sin(angle) * 10 + Math.sin(sideAngle) * lateral,
    vx: Math.cos(angle) * TOWER_BASE.projectileSpeed * 0.9,
    vy: Math.sin(angle) * TOWER_BASE.projectileSpeed * 0.9,
    r: attackRoll.critical ? 4.8 : source === "main-workshop" ? 4 : 3,
    damage: attackRoll.damage,
    damageType: def.damageType || "physical",
    source,
    sourceKind: def.id,
    critical: attackRoll.critical,
    color: def.color,
    v2Frost: (def.frost || 0) * starEffect,
    v2BurnPower: def.burn ? starEffect : 0,
    v2Weaken: (def.weaken || 0) * starEffect,
    v2Knockback: (def.knockback || 0) * starEffect,
    v2Area: (def.area || 0) * starEffect,
    v2Vulnerability: (def.vulnerability || 0) * starEffect,
    v2LifeSteal: (def.lifeSteal || 0) * starEffect,
    v2Visual: source === "main-workshop" ? getMainTurretVisual(def) : "auxiliary",
    v2Homing: source === "main-workshop" && Boolean(def.homing),
    v2Pulse: source === "main-workshop" && def.id === "pulse_quantum" ? starEffect : 0,
    v2Void: source === "main-workshop" && def.void ? starEffect : 0,
    v2SplitPending: source === "main-workshop" && Boolean(def.split),
    v2CapacitorBurst: specialShot.capacitor ? (def.capacitorBonus || 0) * starEffect : 0,
    v2RoyalTideDamage: specialShot.tide ? (def.tideDamage || 0) * starEffect : 0,
    v2RoyalTideRadius: specialShot.tide ? (def.tideRadius || 0) * starEffect : 0,
    v2RoyalTideSlow: specialShot.tide ? (def.tideSlow || 0) * starEffect : 0,
    v2PhaseEcho: (def.phaseEcho || 0) * starEffect,
    life: 1.35,
    trail: []
  });
}

function fireWorkshopTurret(def, pos, target, source, state = null) {
  if (!def || !target || def.damage <= 0 && !def.antimatter) return;
  if (def.antimatter) {
    const damage = Math.max(1, Math.round(target.maxHp * def.antimatter * getV2TurretEffectMultiplier(def.id)));
    laserBeams.push({ x1: pos.x, y1: pos.y, x2: target.x, y2: target.y, life: 0.5, maxLife: 0.5, color: def.color, innerColor: "#ffffff", width: 7 });
    applyEnemyDamage(target, damage, "magic", target.x, target.y, def.color);
    return;
  }
  if (def.beam) {
    const baseDamage = def.damageType === "magic" ? Math.max(1, getMagicDamage()) : getPhysicalDamage();
    const damage = Math.max(1, Math.round(baseDamage * def.damage * getV2TurretDamageMultiplier(def.id) * (source === "aux" ? getSummonDamageMultiplier() : 1)));
    laserBeams.push({ x1: pos.x, y1: pos.y, x2: target.x, y2: target.y, life: 0.38, maxLife: 0.38, color: def.color, innerColor: "#ffffff", width: source === "main-workshop" ? 8 : 6 });
    if (def.vipExclusive) {
      vipBattleBeams.push({ x1: pos.x, y1: pos.y, x2: target.x, y2: target.y, id: def.id, color: def.color, at: performance.now() });
      if (vipBattleBeams.length > 12) vipBattleBeams.shift();
      vipBattleImpacts.push({ x: target.x, y: target.y, id: def.id, color: def.color, at: performance.now() });
      if (vipBattleImpacts.length > 32) vipBattleImpacts.shift();
    }
    const dx = target.x - pos.x;
    const dy = target.y - pos.y;
    for (const enemy of enemies) {
      if (enemy.hp <= 0) continue;
      const hit = closestPointOnSegment(pos.x, pos.y, pos.x + dx * 1.35, pos.y + dy * 1.35, enemy.x, enemy.y);
      if (hit.distSq <= Math.pow(enemy.size * 0.72 + 6, 2)) applyEnemyDamage(enemy, damage, def.damageType || "magic", enemy.x, enemy.y, def.color);
    }
    return;
  }
  const shots = Math.max(1, def.missiles || def.pellets || 1);
  const shotNumber = Math.max(1, Math.floor(Number(state?.shotCounter) || 1));
  const specialShot = {
    capacitor: Boolean(def.capacitorEvery && shotNumber % def.capacitorEvery === 0),
    tide: Boolean(def.tideEvery && shotNumber % def.tideEvery === 0)
  };
  for (let shot = 0; shot < shots; shot += 1) {
    let offset = 0;
    let lateral = 0;
    if (def.parallel) lateral = (shot - (shots - 1) / 2) * 10;
    else if (shots > 1) offset = (shot - (shots - 1) / 2) * (def.spread || 0.08);
    pushWorkshopBullet(def, pos, target, source, offset, lateral, specialShot);
  }
  fireSound();
}

fireAuxTurret = function (index, target) {
  const mini = auxiliaryTurrets[index] || {};
  const def = V2_TURRET_DEFS.find((item) => item.id === mini.kind && item.role === "auxiliary") || V2_TURRET_DEFS.find((item) => item.id === "missile_nest");
  fireWorkshopTurret(def, getAuxTurretPosition(index), target, "aux");
};

updateAuxTurrets = function (dt) {
  auxiliaryTurrets.forEach((mini, index) => {
    const def = V2_TURRET_DEFS.find((item) => item.id === mini.kind && item.role === "auxiliary") || V2_TURRET_DEFS.find((item) => item.id === "missile_nest");
    const pos = getAuxTurretPosition(index);
    const target = getWorkshopTurretTarget(def, pos, 0.9);
    if (target) {
      const desired = Math.atan2(target.y - pos.y, target.x - pos.x);
      const current = Number.isFinite(mini.aimAngle) ? mini.aimAngle : pos.angle;
      const diff = Math.atan2(Math.sin(desired - current), Math.cos(desired - current));
      mini.aimAngle = current + diff * clamp(dt * 14, 0, 1);
    }
    mini.fireTimer -= dt;
    if (mini.fireTimer > 0 || !target || def.damage <= 0 && !def.antimatter) return;
    fireAuxTurret(index, target);
    const starRate = getV2TurretRateMultiplier(def.id);
    mini.fireTimer = def.cooldown
      ? def.cooldown / starRate
      : Math.max(0.12, getFireDelay() * 4 / Math.max(0.05, def.speed || 0.5) / getSummonRateMultiplier() / starRate);
  });
};

function updateWorkshopMainTurrets(dt) {
  v2WorkshopMainTurrets.forEach((main, index) => {
    const def = V2_TURRET_DEFS.find((item) => item.id === main.kind && item.role === "main");
    if (!def) return;
    const pos = getWorkshopMainPosition(index);
    const target = getWorkshopTurretTarget(def, pos, 1);
    if (target) {
      const desired = Math.atan2(target.y - pos.y, target.x - pos.x);
      const current = Number.isFinite(main.aimAngle) ? main.aimAngle : pos.angle;
      const diff = Math.atan2(Math.sin(desired - current), Math.cos(desired - current));
      main.aimAngle = current + diff * clamp(dt * 12, 0, 1);
    }
    main.muzzleFlash = Math.max(0, (main.muzzleFlash || 0) - dt * 5.8);
    main.recoil = Math.max(0, (main.recoil || 0) - dt * 7.2);
    main.fireTimer -= dt;
    if (main.fireTimer > 0 || !target || def.damage <= 0) return;
    main.shotCounter = Math.max(0, Math.floor(Number(main.shotCounter) || 0)) + 1;
    fireWorkshopTurret(def, pos, target, "main-workshop", main);
    main.muzzleFlash = 1;
    main.recoil = 1;
    const fullHpRate = def.fullHpRate && coreHp >= towerStats.maxHp - 0.001 ? 1 + def.fullHpRate : 1;
    main.fireTimer = Math.max(0.08, getFireDelay() / Math.max(0.05, (def.speed || 0.5) * fullHpRate * getV2TurretRateMultiplier(def.id)));
  });
}

function updateWorkshopProjectiles(dt) {
  for (const bullet of bullets) {
    if (bullet.source !== "main-workshop") continue;
    if (bullet.v2Homing) {
      let target = null;
      let nearestDistance = Number.POSITIVE_INFINITY;
      for (const candidate of enemies) {
        if (candidate.hp <= 0) continue;
        const distance = Math.hypot(candidate.x - bullet.x, candidate.y - bullet.y);
        if (distance >= nearestDistance) continue;
        nearestDistance = distance;
        target = candidate;
      }
      if (target) {
        const speed = Math.max(1, Math.hypot(bullet.vx, bullet.vy));
        const current = Math.atan2(bullet.vy, bullet.vx);
        const desired = Math.atan2(target.y - bullet.y, target.x - bullet.x);
        const turn = Math.atan2(Math.sin(desired - current), Math.cos(desired - current));
        const angle = current + turn * clamp(dt * 5.5, 0, 1);
        bullet.vx = Math.cos(angle) * speed;
        bullet.vy = Math.sin(angle) * speed;
      }
    }
    if (bullet.v2SplitPending && bullet.life <= 1.02) {
      bullet.v2SplitPending = false;
      const speed = Math.max(1, Math.hypot(bullet.vx, bullet.vy));
      const baseAngle = Math.atan2(bullet.vy, bullet.vx);
      bullet.damage = Math.max(1, Math.round(bullet.damage * 0.72));
      bullet.vx = Math.cos(baseAngle - 0.17) * speed;
      bullet.vy = Math.sin(baseAngle - 0.17) * speed;
      bullets.push({
        ...bullet,
        vx: Math.cos(baseAngle + 0.17) * speed,
        vy: Math.sin(baseAngle + 0.17) * speed,
        trail: [],
        v2SplitPending: false
      });
      pushVisualEffect(shockwaves, 48, { x: bullet.x, y: bullet.y, r: 4, life: 0.28, maxLife: 0.28, color: bullet.color });
    }
  }
}

function updateExpansionCombat(dt) {
  if (v2WorkshopMainTurrets.some((item) => item.kind === "emergency_shield") && !towerStats.emergencyShieldUsed && coreHp / Math.max(1, towerStats.maxHp) < 0.3) {
    towerStats.emergencyShieldUsed = true;
    const shieldStars = getV2TurretStars("emergency_shield");
    specialState.shieldCharges = Math.max(Math.max(1, shieldStars), specialState.shieldCharges || 0);
  }
  v2StaticFieldTimer -= dt;
  if ((towerStats.staticFieldRatio || 0) > 0 && v2StaticFieldTimer <= 0) {
    v2StaticFieldTimer = 1;
    const damage = Math.max(1, Math.round(getMagicDamage() * towerStats.staticFieldRatio));
    const radius = getTowerRange() * 0.42;
    for (const enemy of enemies) {
      if (enemy.hp > 0 && Math.hypot(enemy.x - tower.x, enemy.y - tower.y) <= radius) applyEnemyDamage(enemy, damage, "magic", enemy.x, enemy.y, "#8ff4ff");
    }
  }
}

function drawVipCombatGlyph(context, id, radius, time) {
  const r = Math.max(6, radius);
  context.save();
  context.lineWidth = Math.max(1.2, r * .075);
  context.lineCap = "round";
  context.lineJoin = "round";
  const circle = (x, y, size) => { context.beginPath(); context.arc(x, y, size, 0, Math.PI * 2); context.stroke(); };
  if (id === "vip_prism_lancer") {
    for (const side of [-1, 1]) {
      context.beginPath(); context.moveTo(side * r * .22, -r); context.lineTo(side * r * .85, 0);
      context.lineTo(side * r * .22, r); context.lineTo(side * r * .44, 0); context.closePath(); context.stroke();
    }
    context.beginPath(); context.moveTo(0, -r * 1.3); context.lineTo(0, r * 1.3); context.stroke();
  } else if (id === "vip_thunder_throne") {
    for (let branch = 0; branch < 5; branch += 1) {
      const a = branch * Math.PI * 2 / 5 + time * .18;
      context.save(); context.rotate(a); context.beginPath(); context.moveTo(r * .28, 0);
      context.lineTo(r * .56, -r * .18); context.lineTo(r * .65, r * .12);
      context.lineTo(r * 1.12, -r * .06); context.stroke(); context.restore();
    }
    circle(0, 0, r * .25);
  } else if (id === "vip_frost_bloom") {
    for (let petal = 0; petal < 6; petal += 1) {
      context.save(); context.rotate(petal * Math.PI / 3 + time * .16);
      context.beginPath(); context.moveTo(0, -r * .25); context.lineTo(-r * .22, -r * .74);
      context.lineTo(0, -r * 1.15); context.lineTo(r * .22, -r * .74); context.closePath(); context.stroke(); context.restore();
    }
    circle(0, 0, r * .24);
  } else if (id === "vip_star_phoenix") {
    for (const side of [-1, 1]) {
      context.beginPath(); context.moveTo(0, r * .65);
      context.bezierCurveTo(side * r * .25, -r * .1, side * r * 1.15, -r * .65, side * r * 1.2, -r * .18);
      context.quadraticCurveTo(side * r * .85, -r * .16, side * r * .42, r * .46); context.stroke();
    }
    context.beginPath(); context.moveTo(0, -r * 1.05); context.lineTo(r * .18, -r * .52);
    context.lineTo(0, r * .15); context.lineTo(-r * .18, -r * .52); context.closePath(); context.stroke();
  } else if (id === "vip_abyssal_tide") {
    for (const scale of [.5, .82, 1.1]) {
      context.beginPath(); context.arc(0, 0, r * scale, -.83 + time * .12, 1.1 + time * .12); context.stroke();
    }
    circle(-r * .28, -r * .27, r * .1);
  } else if (id === "vip_quantum_crown") {
    for (let jewel = 0; jewel < 6; jewel += 1) {
      const a = jewel * Math.PI / 3 + time * .28;
      const x = Math.cos(a) * r * .83, y = Math.sin(a) * r * .83;
      context.beginPath(); context.moveTo(x, y - r * .22); context.lineTo(x + r * .13, y);
      context.lineTo(x, y + r * .22); context.lineTo(x - r * .13, y); context.closePath(); context.stroke();
    }
    circle(0, 0, r * .3);
  } else if (id === "vip_singularity_king") {
    context.save(); context.fillStyle = "#03040d"; context.beginPath(); context.arc(0, 0, r * .42, 0, Math.PI * 2); context.fill(); context.restore();
    context.save(); context.rotate(time * .65); context.beginPath(); context.ellipse(0, 0, r * 1.13, r * .46, -.35, 0, Math.PI * 2); context.stroke(); context.restore();
    circle(0, 0, r * .53);
  } else if (id === "vip_solar_judgment") {
    circle(0, 0, r * .52);
    for (let ray = 0; ray < 8; ray += 1) {
      context.save(); context.rotate(ray * Math.PI / 4); context.beginPath(); context.moveTo(r * .68, 0);
      context.lineTo(r * (ray % 2 ? 1.08 : 1.3), 0); context.stroke(); context.restore();
    }
  } else if (id === "vip_nebula_hymn") {
    for (let shield = 0; shield < 2; shield += 1) {
      context.beginPath();
      for (let p = 0; p < 6; p += 1) {
        const a = p * Math.PI / 3 - Math.PI / 2 + shield * Math.PI / 6 + time * .08;
        const x = Math.cos(a) * r * (shield ? .64 : 1.08), y = Math.sin(a) * r * (shield ? .64 : 1.08);
        if (p === 0) context.moveTo(x, y); else context.lineTo(x, y);
      }
      context.closePath(); context.stroke();
    }
    circle(0, 0, r * .2);
  } else if (id === "vip_chrono_axis") {
    circle(0, 0, r * .9); circle(0, 0, r * .18);
    for (let tick = 0; tick < 12; tick += 1) {
      context.save(); context.rotate(tick * Math.PI / 6 + time * .22);
      context.beginPath(); context.moveTo(0, -r * .75); context.lineTo(0, -r * .92); context.stroke(); context.restore();
    }
    context.beginPath(); context.moveTo(0, 0); context.lineTo(r * .48, -r * .32); context.stroke();
  }
  context.restore();
}

// The showroom and live battle use the same signatures, so a preview represents
// the actual projectile, beam and impact rather than a generic particle sample.
function drawVipProjectileSignature(context, id, color, x, y, angle, size, time) {
  const r = Math.max(5, size);
  context.save();
  context.translate(x, y);
  context.rotate(angle);
  context.lineCap = "round";
  context.lineJoin = "round";
  context.shadowColor = color;
  context.shadowBlur = r * 1.8;
  context.strokeStyle = color;
  context.fillStyle = color;
  context.lineWidth = Math.max(1.5, r * .16);
  context.globalAlpha = .55;
  context.beginPath(); context.moveTo(-r * 3.2, 0); context.lineTo(-r * .55, 0); context.stroke();
  context.globalAlpha = 1;
  if (id === "vip_prism_lancer") {
    for (const offset of [-.54, 0, .54]) {
      context.beginPath(); context.moveTo(r * 1.5, offset * r);
      context.lineTo(-r * .15, (offset - .34) * r);
      context.lineTo(-r * 1.2, offset * r);
      context.lineTo(-r * .15, (offset + .34) * r); context.closePath();
      context.globalAlpha = offset ? .55 : 1; context.stroke();
    }
  } else if (id === "vip_thunder_throne" || id === "vip_chrono_axis") {
    context.beginPath(); context.moveTo(r * 1.45, 0); context.lineTo(r * .25, -r * .58);
    context.lineTo(r * .44, -r * .08); context.lineTo(-r * .7, r * .48);
    context.lineTo(-r * .38, -r * .07); context.lineTo(-r * 1.45, -r * .28); context.stroke();
    if (id === "vip_chrono_axis") {
      context.beginPath(); context.arc(0, 0, r * 1.2, -time * 1.4, -time * 1.4 + Math.PI * 1.3); context.stroke();
    }
  } else if (id === "vip_frost_bloom" || id === "vip_nebula_hymn") {
    for (let petal = 0; petal < 6; petal += 1) {
      context.save(); context.rotate(petal * Math.PI / 3 + time * .5);
      context.beginPath(); context.moveTo(0, -r * .25); context.lineTo(-r * .32, -r);
      context.lineTo(0, -r * 1.55); context.lineTo(r * .32, -r); context.closePath();
      context.stroke(); context.restore();
    }
    context.beginPath(); context.arc(0, 0, r * .35, 0, Math.PI * 2); context.fill();
  } else if (id === "vip_star_phoenix") {
    context.beginPath(); context.moveTo(r * 1.5, 0); context.quadraticCurveTo(-r * .1, -r * .8, -r * 1.5, -r * 1.05);
    context.quadraticCurveTo(-r * .7, -r * .1, -r * 1.65, r * 1.05);
    context.quadraticCurveTo(-r * .1, r * .8, r * 1.5, 0); context.stroke();
    context.beginPath(); context.moveTo(-r * .5, 0); context.lineTo(r * 1.25, 0); context.stroke();
  } else if (id === "vip_abyssal_tide") {
    for (const scale of [.7, 1.2, 1.7]) {
      context.beginPath(); context.ellipse(-r * .5, 0, r * scale, r * scale * .42, 0, -.9, .9); context.stroke();
    }
  } else if (id === "vip_quantum_crown") {
    for (let point = 0; point < 5; point += 1) {
      context.save(); context.rotate(point * Math.PI * 2 / 5 + time * .55);
      context.beginPath(); context.moveTo(0, -r * .48); context.lineTo(r * .28, -r * 1.5);
      context.lineTo(0, -r * 1.18); context.lineTo(-r * .28, -r * 1.5); context.closePath(); context.stroke(); context.restore();
    }
    context.beginPath(); context.arc(0, 0, r * .42, 0, Math.PI * 2); context.fill();
  } else if (id === "vip_singularity_king") {
    context.fillStyle = "#02030a"; context.beginPath(); context.arc(0, 0, r * .8, 0, Math.PI * 2); context.fill();
    context.save(); context.rotate(time * 2); context.beginPath(); context.ellipse(0, 0, r * 1.7, r * .48, 0, 0, Math.PI * 2); context.stroke(); context.restore();
  } else if (id === "vip_solar_judgment") {
    context.beginPath(); context.arc(0, 0, r * .65, 0, Math.PI * 2); context.fill();
    for (let ray = 0; ray < 6; ray += 1) {
      context.save(); context.rotate(ray * Math.PI / 3 + time * .18);
      context.beginPath(); context.moveTo(r * .8, 0); context.lineTo(r * 1.7, 0); context.stroke(); context.restore();
    }
  }
  context.fillStyle = "#ffffff";
  context.beginPath(); context.arc(0, 0, r * .26, 0, Math.PI * 2); context.fill();
  context.restore();
}

function drawVipBeamSignature(context, id, color, x1, y1, x2, y2, strength = 1, time = 0) {
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const length = Math.hypot(x2 - x1, y2 - y1);
  const wide = id === "vip_solar_judgment";
  context.save(); context.translate(x1, y1); context.rotate(angle);
  context.globalAlpha = Math.min(1, Math.max(0, strength));
  context.lineCap = "round"; context.shadowColor = color; context.shadowBlur = wide ? 30 : 19;
  for (const [width, alpha] of [[wide ? 26 : 15, .18], [wide ? 12 : 6, .68], [wide ? 4 : 2.4, 1]]) {
    context.globalAlpha = alpha * strength; context.strokeStyle = width < 5 ? "#fffdf2" : color;
    context.lineWidth = width; context.beginPath(); context.moveTo(0, 0); context.lineTo(length, 0); context.stroke();
  }
  context.globalAlpha = .72 * strength; context.strokeStyle = color; context.lineWidth = 2;
  if (wide) {
    for (const offset of [-19, 19]) {
      context.beginPath(); context.moveTo(0, offset * .3); context.lineTo(length, offset);
      context.stroke();
    }
    for (let tick = 1; tick < 5; tick += 1) {
      const x = length * tick / 5;
      context.beginPath(); context.moveTo(x, -19); context.lineTo(x + 8, 0); context.lineTo(x, 19); context.stroke();
    }
  } else {
    for (const side of [-1, 1]) {
      context.beginPath(); context.moveTo(0, 0);
      context.lineTo(length * .32, side * (11 + Math.sin(time * 8) * 3));
      context.lineTo(length * .67, side * 15); context.lineTo(length, 0); context.stroke();
    }
  }
  context.restore();
}

function drawVipImpactSignature(context, id, color, x, y, progress, time, scale = 1) {
  const fade = Math.max(0, 1 - progress);
  const radius = (12 + progress * 39) * scale;
  context.save(); context.translate(x, y);
  context.globalAlpha = fade;
  context.strokeStyle = color; context.fillStyle = color;
  context.lineWidth = Math.max(1.5, 3.4 * scale * fade);
  context.shadowColor = color; context.shadowBlur = 22 * scale;
  context.beginPath(); context.arc(0, 0, radius, 0, Math.PI * 2); context.stroke();
  if (id === "vip_singularity_king") {
    context.fillStyle = "#02030b"; context.beginPath(); context.arc(0, 0, radius * .58, 0, Math.PI * 2); context.fill();
    context.save(); context.rotate(time * 2); context.beginPath(); context.ellipse(0, 0, radius * 1.35, radius * .37, 0, 0, Math.PI * 2); context.stroke(); context.restore();
  } else if (id === "vip_abyssal_tide") {
    for (const offset of [.55, .82, 1.13]) {
      context.beginPath(); context.ellipse(0, 0, radius * offset, radius * offset * .45, progress * .3, 0, Math.PI * 2); context.stroke();
    }
  } else if (id === "vip_star_phoenix") {
    for (const side of [-1, 1]) {
      context.beginPath(); context.moveTo(0, radius * .45);
      context.bezierCurveTo(side * radius * .42, -radius * .6, side * radius * 1.55, -radius * 1.15, side * radius * 1.75, -radius * .2);
      context.stroke();
    }
  } else if (id === "vip_thunder_throne" || id === "vip_chrono_axis" || id === "vip_quantum_crown") {
    for (let branch = 0; branch < 6; branch += 1) {
      context.save(); context.rotate(branch * Math.PI / 3 + time * .2);
      context.beginPath(); context.moveTo(radius * .55, 0); context.lineTo(radius * .9, -radius * .12);
      context.lineTo(radius * 1.3, radius * .08); context.stroke(); context.restore();
    }
  } else {
    for (let ray = 0; ray < 8; ray += 1) {
      context.save(); context.rotate(ray * Math.PI / 4 + time * .08);
      context.beginPath(); context.moveTo(radius * .75, 0); context.lineTo(radius * 1.27, 0); context.stroke(); context.restore();
    }
  }
  context.globalAlpha = fade * .8;
  drawVipCombatGlyph(context, id, Math.max(8, radius * .64), time);
  context.restore();
}

const vipShowcase = document.createElement("section");
vipShowcase.id = "vipCombatShowcase";
vipShowcase.className = "vip-showcase";
vipShowcase.hidden = true;
vipShowcase.setAttribute("role", "dialog");
vipShowcase.setAttribute("aria-modal", "true");
vipShowcase.setAttribute("aria-labelledby", "vipShowcaseTitle");
vipShowcase.innerHTML = `<div class="vip-showcase-panel"><header class="vip-showcase-header"><div><small>VIP ARSENAL</small><h2 id="vipShowcaseTitle"></h2></div><button type="button" data-vip-showcase-close aria-label="關閉">×</button></header><canvas id="vipShowcaseCanvas" width="720" height="390" role="img" aria-label="砲台實戰特效模擬"></canvas><p class="vip-showcase-caption" id="vipShowcaseCaption"></p><nav class="vip-showcase-tabs" aria-label="VIP 砲台" id="vipShowcaseTabs"></nav></div>`;
document.body.append(vipShowcase);
let vipShowcaseTurret = null;
let vipShowcaseFrame = 0;
let vipShowcaseStarted = 0;

function drawVipShowcaseFrame(now) {
  if (vipShowcase.hidden || !vipShowcaseTurret) return;
  const turret = vipShowcaseTurret;
  const g = document.getElementById("vipShowcaseCanvas").getContext("2d");
  const w = 720, h = 390, time = now * .001;
  const phase = ((now - vipShowcaseStarted) / 1000) % 2.9;
  const source = { x: 135, y: 195 }, target = { x: 515, y: 195 };
  g.clearRect(0, 0, w, h);
  const field = g.createLinearGradient(0, 0, w, h);
  field.addColorStop(0, "#06192c"); field.addColorStop(.55, "#07152a"); field.addColorStop(1, "#160e29");
  g.fillStyle = field; g.fillRect(0, 0, w, h);
  g.strokeStyle = "#72a9ce21"; g.lineWidth = 1;
  for (let x = 0; x < w; x += 48) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); }
  for (let y = 0; y < h; y += 48) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
  for (let star = 0; star < 36; star += 1) {
    const x = (star * 173 + 49) % w, y = (star * 97 + 31) % h;
    g.globalAlpha = .18 + .18 * (1 + Math.sin(time * 1.7 + star)) / 2;
    g.fillStyle = star % 5 ? "#9bd9ee" : "#fff3d3";
    g.fillRect(x, y, star % 7 ? 1 : 2, star % 7 ? 1 : 2);
  }
  g.globalAlpha = 1;
  g.strokeStyle = `${turret.color}aa`; g.shadowColor = turret.color; g.shadowBlur = 17;
  g.lineWidth = 2;
  for (const r of [67, 81]) {
    g.beginPath(); g.arc(source.x, source.y, r, time * .15, time * .15 + Math.PI * 1.6); g.stroke();
  }
  g.shadowBlur = 0;
  const art = getVipBattleArt(turret);
  if (art) {
    g.save(); g.beginPath(); g.arc(source.x, source.y, 58, 0, Math.PI * 2); g.clip();
    g.drawImage(art, source.x - 58, source.y - 58, 116, 116); g.restore();
  } else {
    g.save(); g.translate(source.x, source.y); g.strokeStyle = turret.color;
    drawVipCombatGlyph(g, turret.id, 42, time); g.restore();
  }
  const drawTarget = (x, y, size, opacity = 1) => {
    g.save(); g.translate(x, y); g.globalAlpha = opacity;
    g.shadowColor = turret.color; g.shadowBlur = phase > 1.24 && phase < 1.95 ? 23 : 3;
    g.fillStyle = phase > 1.24 && phase < 1.95 ? "#283d59" : "#101e37";
    g.strokeStyle = phase > 1.24 && phase < 1.95 ? turret.color : "#6885a8"; g.lineWidth = 3;
    g.beginPath();
    for (let side = 0; side < 6; side += 1) {
      const angle = side * Math.PI / 3 + time * .08;
      const px = Math.cos(angle) * size, py = Math.sin(angle) * size;
      if (!side) g.moveTo(px, py); else g.lineTo(px, py);
    }
    g.closePath(); g.fill(); g.stroke();
    g.fillStyle = "#c6e8ed"; g.fillRect(-size * .6, -size - 18, size * 1.2, 3);
    g.fillStyle = turret.color; g.fillRect(-size * .6, -size - 18, size * 1.2 * (phase > 1.24 && phase < 1.95 ? .34 : .88), 3);
    g.restore();
  };
  drawTarget(target.x, target.y, 37);
  drawTarget(625, 106, 25, .7);
  drawTarget(625, 278, 25, .7);
  const charging = Math.max(0, Math.min(1, phase / .55));
  if (phase < .55) {
    g.save(); g.translate(source.x, source.y); g.globalAlpha = charging * .72;
    g.strokeStyle = turret.color; g.shadowColor = turret.color; g.shadowBlur = 18; g.lineWidth = 3;
    g.beginPath(); g.arc(0, 0, 72 - charging * 35, 0, Math.PI * 2); g.stroke();
    drawVipCombatGlyph(g, turret.id, 50 + charging * 8, time); g.restore();
  }
  if (turret.beam) {
    if (phase >= .55 && phase < 1.55) {
      drawVipBeamSignature(g, turret.id, turret.color, source.x + 65, source.y,
        target.x, target.y, Math.min(1, (phase - .55) * 4, (1.55 - phase) * 3), time);
    }
  } else if (phase >= .55 && phase < 1.44) {
    const travel = Math.min(1, (phase - .55) / .89);
    const px = source.x + 64 + (target.x - source.x - 64) * travel;
    const py = source.y - Math.sin(travel * Math.PI) * (turret.homing ? 58 : turret.id === "vip_star_phoenix" ? 34 : 8);
    drawVipProjectileSignature(g, turret.id, turret.color, px, py,
      Math.atan2(target.y - py, target.x - px), turret.rarity === "legendary" ? 17 : 14, time);
  }
  const impactStart = turret.beam ? 1.03 : 1.32;
  if (phase >= impactStart && phase < 2.28) {
    const progress = Math.min(1, (phase - impactStart) / .96);
    drawVipImpactSignature(g, turret.id, turret.color, target.x, target.y, progress, time, 1.65);
    if (turret.chain || turret.id === "vip_thunder_throne") {
      for (const other of [{ x: 625, y: 106 }, { x: 625, y: 278 }]) {
        g.save(); g.globalAlpha = (1 - progress) * .85; g.strokeStyle = turret.color;
        g.shadowColor = turret.color; g.shadowBlur = 15; g.lineWidth = 3;
        g.beginPath(); g.moveTo(target.x, target.y);
        g.lineTo((target.x + other.x) / 2, (target.y + other.y) / 2 + Math.sin(time * 15) * 12);
        g.lineTo(other.x, other.y); g.stroke(); g.restore();
      }
    }
  }
  if (turret.id === "vip_nebula_hymn" || turret.id === "vip_chrono_axis") {
    g.save(); g.translate(source.x, source.y); g.strokeStyle = turret.color;
    g.globalAlpha = .6 + Math.sin(time * 3) * .18; g.lineWidth = 2; g.shadowColor = turret.color; g.shadowBlur = 11;
    drawVipCombatGlyph(g, turret.id, 86, time); g.restore();
  }
  vipShowcaseFrame = requestAnimationFrame(drawVipShowcaseFrame);
}

function openVipCombatShowcase(id) {
  const turret = V2_TURRET_DEFS.find((item) => item.id === id && item.vipExclusive);
  if (!turret) return;
  vipShowcaseTurret = turret;
  const zh = currentLanguage === "zh";
  document.getElementById("vipShowcaseTitle").textContent = turret.name;
  document.getElementById("vipShowcaseCaption").textContent = turret.description;
  document.getElementById("vipShowcaseTabs").innerHTML = V2_TURRET_DEFS.filter((item) => item.vipExclusive)
    .map((item) => `<button type="button" data-vip-showcase-select="${escapeHtml(item.id)}" aria-pressed="${item.id === id}">${escapeHtml(item.name)}</button>`).join("");
  vipShowcase.querySelector("[data-vip-showcase-close]").setAttribute("aria-label", zh ? "關閉預覽" : "Close preview");
  vipShowcase.hidden = false;
  vipShowcaseStarted = performance.now();
  cancelAnimationFrame(vipShowcaseFrame);
  vipShowcaseFrame = requestAnimationFrame(drawVipShowcaseFrame);
  vipShowcase.querySelector("[data-vip-showcase-close]").focus();
}

function closeVipCombatShowcase() {
  vipShowcase.hidden = true;
  cancelAnimationFrame(vipShowcaseFrame);
}

document.addEventListener("click", (event) => {
  const preview = event.target.closest("[data-vip-preview]");
  if (preview) { openVipCombatShowcase(preview.dataset.vipPreview); return; }
  const select = event.target.closest("[data-vip-showcase-select]");
  if (select) { openVipCombatShowcase(select.dataset.vipShowcaseSelect); return; }
  if (event.target.closest("[data-vip-showcase-close]") || event.target === vipShowcase) closeVipCombatShowcase();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !vipShowcase.hidden) closeVipCombatShowcase();
});
window.openSpaceTowerVipCombatShowcase = openVipCombatShowcase;
if (/^(localhost|127\.0\.0\.1)$/i.test(location.hostname)) {
  const requestedVipPreview = new URLSearchParams(location.search).get("vip-preview");
  if (requestedVipPreview) window.addEventListener("load", () => openVipCombatShowcase(requestedVipPreview), { once: true });
}

function drawTurretEffectMarker(definition, position, radius) {
  if (!definition || !position) return;
  const time = performance.now() * 0.001;
  const pulse = 0.72 + Math.sin(time * 3.2 + position.x * 0.01) * 0.2;
  const effectRadius = Math.max(10, radius * 1.14);
  ctx.save();
  ctx.translate(position.x, position.y);
  ctx.scale(turretVisualScale, turretVisualScale);
  ctx.globalAlpha = pulse;
  ctx.strokeStyle = definition.color;
  ctx.fillStyle = definition.color;
  ctx.lineWidth = 1.35;
  ctx.shadowBlur = 8;
  ctx.shadowColor = definition.color;

  if (definition.vipExclusive) {
    drawVipCombatGlyph(ctx, definition.id, effectRadius, time);
    ctx.restore();
    return;
  }

  if (definition.shield || definition.reflect || definition.id === "emergency_shield") {
    ctx.beginPath();
    for (let point = 0; point < 6; point += 1) {
      const angle = point * Math.PI / 3 - Math.PI / 2;
      const x = Math.cos(angle) * effectRadius;
      const y = Math.sin(angle) * effectRadius;
      if (point === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.stroke();
  } else if (definition.frost || definition.slowAura) {
    ctx.rotate(time * 0.5);
    for (let point = 0; point < 4; point += 1) {
      const angle = point * Math.PI / 2;
      ctx.beginPath();
      ctx.arc(Math.cos(angle) * effectRadius, Math.sin(angle) * effectRadius, 1.8, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (definition.burn) {
    for (let ray = 0; ray < 5; ray += 1) {
      const angle = ray * Math.PI * 0.4 + time * 0.35;
      ctx.beginPath();
      ctx.moveTo(Math.cos(angle) * effectRadius * 0.72, Math.sin(angle) * effectRadius * 0.72);
      ctx.lineTo(Math.cos(angle) * effectRadius * 1.18, Math.sin(angle) * effectRadius * 1.18);
      ctx.stroke();
    }
  } else if (definition.void || definition.antimatter) {
    ctx.fillStyle = "rgba(2, 3, 10, 0.82)";
    ctx.beginPath();
    ctx.arc(0, 0, effectRadius * 0.56, 0, Math.PI * 2);
    ctx.fill();
    ctx.setLineDash([4, 3]);
    ctx.rotate(-time * 0.8);
    ctx.beginPath();
    ctx.arc(0, 0, effectRadius, 0.2, Math.PI * 1.72);
    ctx.stroke();
  } else if (definition.capacitorEvery) {
    ctx.rotate(time * 0.9);
    for (let charge = 0; charge < definition.capacitorEvery; charge += 1) {
      const angle = charge * Math.PI * 2 / definition.capacitorEvery;
      ctx.beginPath(); ctx.arc(Math.cos(angle) * effectRadius, Math.sin(angle) * effectRadius, charge === definition.capacitorEvery - 1 ? 2.8 : 1.7, 0, Math.PI * 2); ctx.fill();
    }
  } else if (definition.tideEvery) {
    for (const scale of [.72, 1, 1.28]) { ctx.globalAlpha = pulse * (1.4 - scale * .55); ctx.beginPath(); ctx.ellipse(0, 0, effectRadius * scale, effectRadius * scale * .42, 0, 0, Math.PI * 2); ctx.stroke(); }
  } else if (definition.phaseEcho) {
    for (const shift of [-1, 1]) { ctx.globalAlpha = shift < 0 ? .8 : .35; ctx.beginPath(); ctx.arc(0, shift * effectRadius * .35, effectRadius * .82, -1.2, 1.2); ctx.stroke(); }
  } else if (definition.chain || definition.beam || definition.vulnerability) {
    ctx.setLineDash([3, 3]);
    ctx.rotate(time * 0.7);
    ctx.beginPath();
    ctx.arc(0, 0, effectRadius, 0, Math.PI * 1.45);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(-effectRadius * 0.42, 0);
    ctx.lineTo(effectRadius * 0.42, 0);
    ctx.moveTo(0, -effectRadius * 0.42);
    ctx.lineTo(0, effectRadius * 0.42);
    ctx.stroke();
  } else {
    ctx.setLineDash([2, 4]);
    ctx.rotate(time * 0.55);
    ctx.beginPath();
    ctx.arc(0, 0, effectRadius, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.rotate(-time * 0.55);
  ctx.globalAlpha = 0.96;
  ctx.fillStyle = "rgba(3, 10, 23, 0.92)";
  ctx.beginPath();
  ctx.arc(effectRadius * 0.68, -effectRadius * 0.68, 6.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = definition.color;
  ctx.stroke();
  ctx.fillStyle = "#ffffff";
  ctx.font = "700 8px Inter, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(definition.icon, effectRadius * 0.68, -effectRadius * 0.68 + 0.4);
  ctx.restore();
}

function traceMainTurretPolygon(sides, radius, rotation = -Math.PI / 2) {
  ctx.beginPath();
  for (let point = 0; point < sides; point += 1) {
    const angle = rotation + point * Math.PI * 2 / sides;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    if (point === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
}

function drawWorkshopMainTurret(definition, position, aimAngle, state) {
  const radius = Math.max(12, tower.radius * 0.48);
  const visual = getMainTurretVisual(definition);
  const time = performance.now() * 0.001;
  const recoil = clamp(state?.recoil || 0, 0, 1);
  const flash = clamp(state?.muzzleFlash || 0, 0, 1);
  const forward = visual === "laser_lance" ? radius * 2.1 : radius * 1.65;
  ctx.save();
  ctx.translate(position.x, position.y);
  ctx.scale(turretVisualScale, turretVisualScale);
  ctx.rotate(aimAngle);
  ctx.translate(-recoil * (visual === "siege_barrel" ? 4.2 : 2.1), 0);
  ctx.shadowBlur = 18;
  ctx.shadowColor = definition.color;
  ctx.strokeStyle = definition.color;
  ctx.fillStyle = "#071625";
  ctx.lineWidth = 2.2;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";

  if (definition.vipExclusive) {
    drawVipBattleArt(ctx, definition, radius, time);
  } else if (visual === "emerald_drake") {
    drawEmeraldDrake(ctx, radius);
  } else if (visual === "shield_hex") {
    traceMainTurretPolygon(6, radius * 1.1);
    ctx.fill();
    ctx.stroke();
    ctx.globalAlpha = 0.62 + Math.sin(time * 3.2) * 0.18;
    traceMainTurretPolygon(6, radius * 0.7);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-radius * 0.7, 0);
    ctx.lineTo(0, radius * 0.56);
    ctx.lineTo(radius * 0.7, 0);
    ctx.stroke();
  } else if (visual === "frost_crystal") {
    ctx.rotate(Math.PI / 4);
    ctx.fillRect(-radius * 0.62, -radius * 0.62, radius * 1.24, radius * 1.24);
    ctx.strokeRect(-radius * 0.62, -radius * 0.62, radius * 1.24, radius * 1.24);
    ctx.rotate(-Math.PI / 4);
    for (let ray = 0; ray < 4; ray += 1) {
      ctx.save();
      ctx.rotate(ray * Math.PI / 2);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(radius * 1.48, 0);
      ctx.moveTo(radius * 0.9, 0);
      ctx.lineTo(radius * 0.65, -radius * 0.25);
      ctx.moveTo(radius * 0.9, 0);
      ctx.lineTo(radius * 0.65, radius * 0.25);
      ctx.stroke();
      ctx.restore();
    }
  } else if (visual === "flame_reactor") {
    ctx.beginPath();
    ctx.moveTo(radius * 1.24, 0);
    ctx.bezierCurveTo(radius * 0.35, -radius * 1.24, -radius * 0.9, -radius * 0.72, -radius * 0.65, 0);
    ctx.bezierCurveTo(-radius * 0.9, radius * 0.72, radius * 0.35, radius * 1.24, radius * 1.24, 0);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = definition.color;
    ctx.globalAlpha = 0.78;
    ctx.beginPath();
    ctx.moveTo(radius * 0.62, 0);
    ctx.quadraticCurveTo(-radius * 0.2, -radius * 0.55, -radius * 0.38, 0);
    ctx.quadraticCurveTo(-radius * 0.2, radius * 0.55, radius * 0.62, 0);
    ctx.fill();
  } else if (visual === "solar_blades") {
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.58, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.save();
    ctx.rotate(time * 1.8);
    for (let blade = 0; blade < 3; blade += 1) {
      ctx.rotate(Math.PI * 2 / 3);
      ctx.beginPath();
      ctx.moveTo(radius * 0.5, -radius * 0.14);
      ctx.lineTo(radius * 1.35, 0);
      ctx.lineTo(radius * 0.5, radius * 0.14);
      ctx.stroke();
    }
    ctx.restore();
    ctx.beginPath();
    ctx.moveTo(radius * 0.55, 0);
    ctx.lineTo(radius * 1.55, 0);
    ctx.stroke();
  } else if (visual === "curse_crescent") {
    ctx.beginPath();
    ctx.arc(-radius * 0.08, 0, radius * 0.86, -Math.PI * 0.7, Math.PI * 0.7);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(radius * 0.3, 0, radius * 0.68, Math.PI * 0.66, -Math.PI * 0.66, true);
    ctx.stroke();
    ctx.fillStyle = definition.color;
    ctx.beginPath();
    ctx.arc(radius * 0.92, 0, radius * 0.19, 0, Math.PI * 2);
    ctx.fill();
  } else if (visual === "siege_barrel") {
    traceMainTurretPolygon(6, radius * 0.92, 0);
    ctx.fill();
    ctx.stroke();
    ctx.fillRect(radius * 0.15, -radius * 0.35, radius * 1.45, radius * 0.7);
    ctx.strokeRect(radius * 0.15, -radius * 0.35, radius * 1.45, radius * 0.7);
    ctx.lineWidth = 3.2;
    ctx.beginPath();
    ctx.moveTo(radius * 1.6, -radius * 0.38);
    ctx.lineTo(radius * 1.6, radius * 0.38);
    ctx.stroke();
  } else if (visual === "quantum_orbits") {
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.45, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    for (const tilt of [-0.72, 0.72]) {
      ctx.save();
      ctx.rotate(tilt + Math.sin(time) * 0.1);
      ctx.beginPath();
      ctx.ellipse(0, 0, radius * 1.15, radius * 0.42, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
    ctx.fillStyle = definition.color;
    ctx.beginPath();
    ctx.arc(Math.cos(time * 2.4) * radius, Math.sin(time * 2.4) * radius * 0.38, 2.3, 0, Math.PI * 2);
    ctx.fill();
  } else if (visual === "gatling_rotor") {
    ctx.beginPath();
    ctx.arc(-radius * 0.12, 0, radius * 0.78, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    for (const offset of [-0.42, 0, 0.42]) {
      ctx.beginPath();
      ctx.moveTo(radius * 0.15, radius * offset);
      ctx.lineTo(radius * 1.55, radius * offset);
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.arc(-radius * 0.12, 0, radius * 0.24, 0, Math.PI * 2);
    ctx.stroke();
  } else if (visual === "split_fork") {
    traceMainTurretPolygon(5, radius * 0.82, Math.PI);
    ctx.fill();
    ctx.stroke();
    for (const fork of [-0.42, 0.42]) {
      ctx.beginPath();
      ctx.moveTo(radius * 0.1, 0);
      ctx.lineTo(radius * 1.5, radius * fork);
      ctx.stroke();
    }
  } else if (visual === "arcane_sigil") {
    ctx.save();
    ctx.rotate(time * 0.75);
    traceMainTurretPolygon(4, radius * 0.92, Math.PI / 4);
    ctx.fill();
    ctx.stroke();
    traceMainTurretPolygon(4, radius * 0.52, 0);
    ctx.stroke();
    ctx.restore();
    ctx.beginPath();
    ctx.moveTo(radius * 0.55, 0);
    ctx.lineTo(radius * 1.45, 0);
    ctx.stroke();
  } else if (visual === "reflect_bastion") {
    traceMainTurretPolygon(6, radius * 1.08);
    ctx.fill();
    ctx.stroke();
    for (let plate = 0; plate < 3; plate += 1) {
      ctx.save();
      ctx.rotate(plate * Math.PI * 2 / 3);
      ctx.strokeRect(radius * 0.45, -radius * 0.2, radius * 0.62, radius * 0.4);
      ctx.restore();
    }
    ctx.beginPath();
    ctx.moveTo(radius * 0.5, 0);
    ctx.lineTo(radius * 1.35, 0);
    ctx.stroke();
  } else if (visual === "scatter_fan") {
    ctx.beginPath();
    ctx.arc(-radius * 0.28, 0, radius * 0.9, -Math.PI * 0.62, Math.PI * 0.62);
    ctx.lineTo(-radius * 0.28, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    for (let barrel = -2; barrel <= 2; barrel += 1) {
      const angle = barrel * 0.18;
      ctx.beginPath();
      ctx.moveTo(radius * 0.15, 0);
      ctx.lineTo(Math.cos(angle) * radius * 1.5, Math.sin(angle) * radius * 1.5);
      ctx.stroke();
    }
  } else if (visual === "twin_rails") {
    ctx.beginPath();
    ctx.arc(-radius * 0.2, 0, radius * 0.72, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    for (const offset of [-0.36, 0.36]) {
      ctx.fillRect(radius * 0.05, radius * offset - radius * 0.16, radius * 1.52, radius * 0.32);
      ctx.strokeRect(radius * 0.05, radius * offset - radius * 0.16, radius * 1.52, radius * 0.32);
    }
  } else if (visual === "laser_lance") {
    ctx.beginPath();
    ctx.moveTo(-radius * 0.9, 0);
    ctx.lineTo(-radius * 0.2, -radius * 0.72);
    ctx.lineTo(radius * 0.9, -radius * 0.24);
    ctx.lineTo(radius * 1.75, 0);
    ctx.lineTo(radius * 0.9, radius * 0.24);
    ctx.lineTo(-radius * 0.2, radius * 0.72);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(radius * 0.12, 0);
    ctx.lineTo(radius * 1.72, 0);
    ctx.stroke();
  } else if (visual === "void_ring") {
    ctx.fillStyle = "rgba(1, 2, 8, 0.96)";
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.72, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.save();
    ctx.rotate(-time * 1.2);
    ctx.setLineDash([radius * 0.42, radius * 0.2]);
    ctx.beginPath();
    ctx.ellipse(0, 0, radius * 1.25, radius * 0.54, 0.35, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
    ctx.setLineDash([]);
  } else if (visual === "capacitor_coil") {
    ctx.beginPath(); ctx.arc(0, 0, radius * .72, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.save(); ctx.rotate(time * 1.8);
    for (let charge = 0; charge < 5; charge += 1) { ctx.rotate(Math.PI * 2 / 5); ctx.fillRect(radius * .78, -radius * .11, radius * .4, radius * .22); }
    ctx.restore(); ctx.beginPath(); ctx.moveTo(radius * .35, 0); ctx.lineTo(radius * 1.55, 0); ctx.stroke();
  } else if (visual === "royal_tide") {
    ctx.fillStyle = "rgba(13,45,142,.78)"; ctx.beginPath(); ctx.arc(0, 0, radius * .78, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    for (const scale of [.72, 1.08, 1.42]) { ctx.globalAlpha = 1.4 - scale * .48; ctx.beginPath(); ctx.ellipse(0, 0, radius * scale, radius * scale * .42, Math.sin(time) * .16, 0, Math.PI * 2); ctx.stroke(); }
    ctx.globalAlpha = 1; ctx.beginPath(); ctx.moveTo(radius * .35, 0); ctx.lineTo(radius * 1.55, 0); ctx.stroke();
  } else if (visual === "phase_echo") {
    for (const shift of [-.32, .32]) { ctx.save(); ctx.translate(0, radius * shift); ctx.globalAlpha = shift < 0 ? .92 : .34; traceMainTurretPolygon(4, radius * .78, Math.PI / 4); ctx.fill(); ctx.stroke(); ctx.beginPath(); ctx.moveTo(radius * .25, 0); ctx.lineTo(radius * 1.55, 0); ctx.stroke(); ctx.restore(); }
  } else if (visual === "target_reticle") {
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.82, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.setLineDash([radius * 0.32, radius * 0.22]);
    ctx.beginPath();
    ctx.arc(0, 0, radius * 1.12, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(-radius * 1.22, 0);
    ctx.lineTo(radius * 1.55, 0);
    ctx.moveTo(0, -radius * 1.22);
    ctx.lineTo(0, radius * 1.22);
    ctx.stroke();
  } else {
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(radius * 1.45, 0);
    ctx.lineTo(-radius * 0.2, -radius * 0.28);
    ctx.lineTo(-radius * 0.2, radius * 0.28);
    ctx.closePath();
    ctx.fillStyle = definition.color;
    ctx.fill();
  }

  if (flash > 0 && definition.damage > 0) {
    ctx.globalAlpha = flash;
    ctx.fillStyle = "#ffffff";
    ctx.shadowBlur = 26;
    ctx.beginPath();
    ctx.arc(forward, 0, 2.5 + flash * 5.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = definition.color;
    ctx.beginPath();
    ctx.moveTo(forward, 0);
    ctx.lineTo(forward + radius * (0.5 + flash * 0.35), 0);
    ctx.stroke();
  }
  ctx.restore();
}

function drawWorkshopMainTurrets() {
  v2WorkshopMainTurrets.forEach((main, index) => {
    const def = V2_TURRET_DEFS.find((item) => item.id === main.kind) || V2_TURRET_DEFS[0];
    const pos = getWorkshopMainPosition(index);
    drawWorkshopMainTurret(def, pos, Number.isFinite(main.aimAngle) ? main.aimAngle : pos.angle, main);
    drawTurretEffectMarker(def, pos, Math.max(12, tower.radius * 0.48));
  });
}

const v2BaseDrawTower = drawTower;
drawTower = function () {
  v2BaseDrawTower();
  drawWorkshopMainTurrets();
};

drawAuxTurrets = function () {
  auxiliaryTurrets.forEach((mini, index) => {
    const def = V2_TURRET_DEFS.find((item) => item.id === mini.kind) || V2_TURRET_DEFS.find((item) => item.id === "missile_nest");
    const pos = getAuxTurretPosition(index);
    ctx.save();
    ctx.translate(pos.x, pos.y);
    ctx.scale(turretVisualScale, turretVisualScale);
    ctx.rotate(Number.isFinite(mini.aimAngle) ? mini.aimAngle : pos.angle);
    ctx.shadowBlur = 12;
    ctx.shadowColor = def.color;
    ctx.fillStyle = "#0a1827";
    ctx.strokeStyle = def.color;
    ctx.lineWidth = 1.6;
    if (def.vipExclusive) drawVipBattleArt(ctx, def, 9, performance.now() * .001);
    else {
      ctx.beginPath();
      ctx.moveTo(10, 0);
      ctx.lineTo(-7, -7);
      ctx.lineTo(-4, 0);
      ctx.lineTo(-7, 7);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
    ctx.restore();
    drawTurretEffectMarker(def, pos, 9);
  });
};

const v2BaseDrawBullets = drawBullets;
drawBullets = function () {
  v2BaseDrawBullets();
  const time = performance.now() * 0.001;
  for (const bullet of bullets) {
    if (bullet.sourceKind?.startsWith("vip_")) {
      if (isRenderVisible(bullet.x, bullet.y, 80)) {
        drawVipProjectileSignature(ctx, bullet.sourceKind, bullet.color || "#ffffff", bullet.x, bullet.y,
          Math.atan2(bullet.vy, bullet.vx), Math.max(5, bullet.r * battleVisualScale * 1.8), time);
      }
      continue;
    }
    if (bullet.source !== "main-workshop") continue;
    if (!isRenderVisible(bullet.x, bullet.y, 120)) continue;
    if (bullet.sourceKind === "emerald_drake") { drawEmeraldProjectile(bullet); continue; }
    const visual = bullet.v2Visual || "standard_core";
    const radius = Math.max(3, bullet.r * 1.45) * battleVisualScale;
    const angle = Math.atan2(bullet.vy, bullet.vx);
    ctx.save();
    ctx.translate(bullet.x, bullet.y);
    ctx.scale(turretVisualScale, turretVisualScale);
    ctx.rotate(angle);
    ctx.strokeStyle = bullet.color || "#ffffff";
    ctx.fillStyle = bullet.color || "#ffffff";
    ctx.lineWidth = 1.4;
    ctx.shadowBlur = 13;
    ctx.shadowColor = bullet.color || "#ffffff";
    if (visual === "frost_crystal") {
      for (let ray = 0; ray < 4; ray += 1) {
        ctx.rotate(Math.PI / 2);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(radius * 1.35, 0);
        ctx.stroke();
      }
    } else if (visual === "flame_reactor") {
      ctx.globalAlpha = 0.76;
      for (let ember = 0; ember < 3; ember += 1) {
        ctx.beginPath();
        ctx.arc(-radius * (1.3 + ember * 0.72), Math.sin(time * 8 + ember) * radius * 0.45, radius * (0.42 - ember * 0.08), 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (visual === "solar_blades") {
      ctx.rotate(time * 4);
      for (let blade = 0; blade < 3; blade += 1) {
        ctx.rotate(Math.PI * 2 / 3);
        ctx.beginPath();
        ctx.moveTo(radius * 0.45, 0);
        ctx.lineTo(radius * 1.25, 0);
        ctx.stroke();
      }
    } else if (visual === "curse_crescent") {
      ctx.beginPath();
      ctx.arc(0, 0, radius * 1.05, -1.05, 1.05);
      ctx.stroke();
    } else if (visual === "siege_barrel") {
      ctx.globalAlpha = 0.74;
      ctx.beginPath();
      ctx.arc(0, 0, radius * 1.35, 0, Math.PI * 2);
      ctx.stroke();
    } else if (visual === "quantum_orbits") {
      for (const tilt of [-0.65, 0.65]) {
        ctx.save();
        ctx.rotate(tilt + time * 0.4);
        ctx.beginPath();
        ctx.ellipse(0, 0, radius * 1.5, radius * 0.5, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }
    } else if (visual === "gatling_rotor") {
      ctx.globalAlpha = 0.72;
      for (const offset of [-0.5, 0, 0.5]) {
        ctx.beginPath();
        ctx.moveTo(-radius * 2.2, radius * offset);
        ctx.lineTo(radius * 0.8, radius * offset);
        ctx.stroke();
      }
    } else if (visual === "split_fork") {
      ctx.beginPath();
      ctx.moveTo(-radius * 1.1, 0);
      ctx.lineTo(radius * 0.8, -radius * 0.65);
      ctx.moveTo(-radius * 1.1, 0);
      ctx.lineTo(radius * 0.8, radius * 0.65);
      ctx.stroke();
    } else if (visual === "arcane_sigil") {
      ctx.rotate(time * 2.2);
      traceMainTurretPolygon(4, radius * 1.25, Math.PI / 4);
      ctx.stroke();
    } else if (visual === "reflect_bastion") {
      traceMainTurretPolygon(6, radius * 1.25);
      ctx.stroke();
    } else if (visual === "scatter_fan") {
      for (let pellet = -1; pellet <= 1; pellet += 1) {
        ctx.beginPath();
        ctx.arc(-radius * 0.6, radius * pellet * 0.62, radius * 0.22, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (visual === "twin_rails") {
      for (const offset of [-0.52, 0.52]) {
        ctx.beginPath();
        ctx.arc(0, radius * offset, radius * 0.32, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (visual === "void_ring") {
      ctx.fillStyle = "rgba(1, 2, 8, 0.94)";
      ctx.beginPath();
      ctx.arc(0, 0, radius * 0.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.setLineDash([3, 2]);
      ctx.beginPath();
      ctx.ellipse(0, 0, radius * 1.6, radius * 0.62, -time, 0, Math.PI * 2);
      ctx.stroke();
    } else if (visual === "target_reticle") {
      ctx.beginPath();
      ctx.arc(0, 0, radius * 1.18, 0, Math.PI * 2);
      ctx.moveTo(-radius * 1.5, 0);
      ctx.lineTo(radius * 1.5, 0);
      ctx.moveTo(0, -radius * 1.5);
      ctx.lineTo(0, radius * 1.5);
      ctx.stroke();
    } else if (visual === "capacitor_coil") {
      ctx.beginPath(); ctx.arc(0, 0, radius * 1.15, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(-radius * 1.1, 0, radius * .42, 0, Math.PI * 2); ctx.fill();
    } else if (visual === "royal_tide") {
      for (const scale of [.7, 1.2, 1.7]) { ctx.globalAlpha = 1.18 - scale * .38; ctx.beginPath(); ctx.ellipse(-radius * .5, 0, radius * scale, radius * scale * .36, 0, 0, Math.PI * 2); ctx.stroke(); }
    } else if (visual === "phase_echo") {
      ctx.globalAlpha = .9; ctx.beginPath(); ctx.moveTo(-radius * 1.8, -radius * .6); ctx.lineTo(radius, 0); ctx.lineTo(-radius * 1.8, radius * .6); ctx.stroke();
      ctx.globalAlpha = .34; ctx.translate(-radius * 1.05, radius * .8); ctx.beginPath(); ctx.moveTo(-radius, -radius * .5); ctx.lineTo(radius, 0); ctx.lineTo(-radius, radius * .5); ctx.stroke();
    }
    ctx.restore();
  }
};

// ---------- Visual effects ----------

const v2BaseDrawBackground = drawBackground;
drawBackground = function (time) {
  const background = getEquippedV2Background();
  const image = getV2BackgroundImage(background);
  if (background && image?.complete && image.naturalWidth > 0) {
    const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight);
    const drawWidth = image.naturalWidth * scale;
    const drawHeight = image.naturalHeight * scale;
    const drift = Math.sin(time * 0.00008) * Math.min(16, Math.max(0, drawWidth - width) * 0.22);
    ctx.save();
    ctx.drawImage(image, (width - drawWidth) * 0.5 + drift, (height - drawHeight) * 0.5, drawWidth, drawHeight);
    const shade = ctx.createRadialGradient(width * 0.5, height * 0.48, 0, width * 0.5, height * 0.5, Math.max(width, height) * 0.7);
    shade.addColorStop(0, "rgba(1, 5, 16, 0.16)");
    shade.addColorStop(0.58, "rgba(1, 5, 16, 0.3)");
    shade.addColorStop(1, "rgba(1, 4, 13, 0.68)");
    ctx.fillStyle = shade;
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
  } else {
    v2BaseDrawBackground(time);
  }
  const env = getActiveEnvironment();
  if (!env) return;
  ctx.save();
  ctx.globalAlpha = 0.08 + Math.sin(time * 0.0007) * 0.025;
  ctx.fillStyle = env.color;
  ctx.fillRect(0, 0, width, height);
  ctx.globalAlpha = 0.2;
  ctx.strokeStyle = env.color;
  ctx.lineWidth = 1;
  const count = userSettings.quality === "low" ? 7 : 14;
  for (let i = 0; i < count; i += 1) {
    const x = (i * 137 + time * (env.id === "solar" ? 0.08 : 0.025)) % (width + 160) - 80;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x - 110, height);
    ctx.stroke();
  }
  ctx.restore();
};

const v2BaseDrawEnemies = drawEnemies;
drawEnemies = function () {
  ctx.save();
  for (const enemy of enemies) {
    if (enemy.ability !== "buffer" || !enemy.trail?.length) continue;
    ctx.strokeStyle = "rgba(242, 255, 116, 0.32)";
    ctx.lineWidth = 10 * battleVisualScale;
    ctx.lineCap = "round";
    ctx.beginPath();
    enemy.trail.forEach((point, index) => index ? ctx.lineTo(point.x, point.y) : ctx.moveTo(point.x, point.y));
    ctx.stroke();
  }
  ctx.restore();
  v2BaseDrawEnemies();
  for (const enemy of enemies) drawV2EnemyOverlay(enemy);
};

function drawV2EnemyOverlay(enemy) {
  if (!isRenderVisible(enemy.x, enemy.y, enemy.size * 3 + 100)) return;
  ctx.save();
  ctx.translate(enemy.x, enemy.y);
  ctx.scale(battleVisualScale, battleVisualScale);
  const s = enemy.size;
  if (enemy.ability === "frontal_shield") {
    const face = Math.atan2(tower.y - enemy.y, tower.x - enemy.x);
    ctx.rotate(face);
    ctx.shadowBlur = 18;
    ctx.shadowColor = "#9db7ff";
    ctx.strokeStyle = "rgba(205, 220, 255, 0.92)";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(0, 0, s * 1.05, -Math.PI * 0.34, Math.PI * 0.34);
    ctx.stroke();
  } else if (enemy.ability === "full_shield" && enemy.shieldHp > 0) {
    const ratio = enemy.shieldHp / enemy.maxShieldHp;
    ctx.shadowBlur = 18;
    ctx.shadowColor = "#76b7ff";
    ctx.strokeStyle = `rgba(118, 183, 255, ${0.35 + ratio * 0.55})`;
    ctx.lineWidth = 3 + ratio * 2;
    ctx.beginPath();
    ctx.arc(0, 0, s * 1.02, 0, Math.PI * 2);
    ctx.stroke();
  }
  if (enemy.ability === "healer") {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(-2, -s * 1.15, 4, 13);
    ctx.fillRect(-6.5, -s * 1.15 + 4.5, 13, 4);
  }
  if (enemy.ability === "ranged") {
    ctx.strokeStyle = "rgba(255, 157, 225, 0.65)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.9, 0, Math.PI * 2);
    ctx.stroke();
  }
  if (enemy.v2BuffTimer > 0) {
    ctx.strokeStyle = "rgba(242, 255, 116, 0.78)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, s * 1.12, 0, Math.PI * 2);
    ctx.stroke();
  }
  if (enemy.blindTime > 0) {
    ctx.fillStyle = "#ffffff";
    ctx.font = `900 ${Math.max(12, s * 0.48)}px system-ui`;
    ctx.textAlign = "center";
    ctx.fillText("×", 0, -s * 0.95);
  }
  ctx.restore();
}

const v2BaseDrawDrones = drawDrones;
drawDrones = function () {
  v2BaseDrawDrones();
  for (const fighter of v2ConvertedFighters) {
    ctx.save();
    ctx.translate(fighter.x, fighter.y);
    ctx.scale(battleVisualScale, battleVisualScale);
    ctx.rotate(performance.now() * 0.004);
    ctx.fillStyle = "#85ffb6";
    ctx.shadowBlur = 14;
    ctx.shadowColor = "#85ffb6";
    ctx.beginPath();
    ctx.moveTo(9, 0);
    ctx.lineTo(-7, -5);
    ctx.lineTo(-4, 0);
    ctx.lineTo(-7, 5);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
};

const v2BaseDrawEffects = drawEffects;
drawEffects = function () {
  if (v2BlackHole) {
    const ratio = clamp(v2BlackHole.life / v2BlackHole.maxLife, 0, 1);
    const visualRadius = v2BlackHole.radius * battleVisualScale;
    const gradient = ctx.createRadialGradient(v2BlackHole.x, v2BlackHole.y, 3 * battleVisualScale, v2BlackHole.x, v2BlackHole.y, visualRadius);
    gradient.addColorStop(0, "rgba(0,0,0,0.98)");
    gradient.addColorStop(0.12, "rgba(163,116,255,0.8)");
    gradient.addColorStop(0.5, "rgba(85,199,255,0.16)");
    gradient.addColorStop(1, "rgba(0,0,0,0)");
    ctx.globalAlpha = 0.45 + ratio * 0.45;
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(v2BlackHole.x, v2BlackHole.y, visualRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
  v2BaseDrawEffects();
  const now = performance.now();
  for (let index = vipBattleBeams.length - 1; index >= 0; index -= 1) {
    const beam = vipBattleBeams[index];
    const progress = (now - beam.at) / 420;
    if (progress >= 1) { vipBattleBeams.splice(index, 1); continue; }
    if (!isRenderVisible(beam.x2, beam.y2, 120)) continue;
    drawVipBeamSignature(ctx, beam.id, beam.color, beam.x1, beam.y1, beam.x2, beam.y2,
      (1 - progress) * battleVisualScale, now * .001);
  }
  for (let index = vipBattleImpacts.length - 1; index >= 0; index -= 1) {
    const effect = vipBattleImpacts[index];
    const progress = (now - effect.at) / 580;
    if (progress >= 1) { vipBattleImpacts.splice(index, 1); continue; }
    if (!isRenderVisible(effect.x, effect.y, 90)) continue;
    drawVipImpactSignature(ctx, effect.id, effect.color, effect.x, effect.y, progress,
      now * .001, battleVisualScale);
  }
};

// ---------- Active run checkpoints ----------

const ACTIVE_RUN_SAVE_PREFIX = "spaceTowerPausedRunV4:";
const ACTIVE_RUN_CHECKPOINT_MS = 5000;

function getActiveRunOwner(name = playerName) {
  return String(name || "Guest").trim().toLowerCase() || "guest";
}

function getActiveRunSaveKey(name = playerName) {
  return `${ACTIVE_RUN_SAVE_PREFIX}${getActiveRunOwner(name)}`;
}

function cloneActiveRunValue(value, fallback) {
  try {
    const serialized = JSON.stringify(value);
    return serialized === undefined ? fallback : JSON.parse(serialized);
  } catch {
    return fallback;
  }
}

function clearActiveRunCheckpoint(name = playerName) {
  localStorage.removeItem(getActiveRunSaveKey(name));
}

function saveActiveRunCheckpoint() {
  if (!gameStarted || !running || !isPaused || coreHp <= 0) return false;
  const elapsedMs = Math.max(0, performance.now() - (Number(runStats?.startedAt) || performance.now()));
  const savedRunStats = cloneActiveRunValue(runStats, {});
  delete savedRunStats.startedAt;
  const checkpoint = {
    version: 4,
    resumeEligible: true,
    owner: getActiveRunOwner(),
    savedAt: Date.now(),
    activeRunTier: clampTier(activeRunTier),
    selectedTier: clampTier(selectedTier),
    wave: Math.max(1, Math.floor(Number(wave) || 1)),
    gold: Math.max(0, Math.floor(Number(gold) || 0)),
    coreHp: Math.max(0, Number(coreHp) || 0),
    towerStats: cloneActiveRunValue(towerStats, {}),
    cardEffects: cloneActiveRunValue(cardEffects, {}),
    specialState: cloneActiveRunValue(specialState, {}),
    runStats: { ...savedRunStats, elapsedMs },
    consumableState: window.getSpaceTowerRunConsumableState?.() || null,
    runtime: {
      spawnTimer,
      fireTimer,
      hitCount,
      enemiesSpawned,
      bossSpawnedThisWave,
      wavePauseTimer,
      lastBossPreviewWave,
      choosingCard,
      offeredCardIds: offeredCards.map((card) => card.id),
      autoUpgradeIndex,
      rewardedReviveUsed,
      gameSpeed
    },
    enemies: cloneActiveRunValue(enemies, []),
    bullets: cloneActiveRunValue(bullets, []),
    v2WorkshopMainTurrets: cloneActiveRunValue(v2WorkshopMainTurrets, []),
    auxiliaryTurrets: cloneActiveRunValue(auxiliaryTurrets, []),
    fighters: cloneActiveRunValue(fighters, []),
    drones: cloneActiveRunValue(drones, []),
    laserBeams: cloneActiveRunValue(laserBeams, []),
    bossWarning: cloneActiveRunValue(bossWarning, null),
    v2CardStars: cloneActiveRunValue(v2CardStars, {}),
    v2BlackHole: cloneActiveRunValue(v2BlackHole, null),
    v2VoidKillCounter
  };
  try {
    localStorage.setItem(getActiveRunSaveKey(), JSON.stringify(checkpoint));
    return true;
  } catch {
    return false;
  }
}

function loadActiveRunCheckpoint(name = playerName) {
  try {
    const checkpoint = JSON.parse(localStorage.getItem(getActiveRunSaveKey(name)) || "null");
    if (!checkpoint || checkpoint.version !== 4 || checkpoint.resumeEligible !== true) {
      clearActiveRunCheckpoint(name);
      return null;
    }
    if (checkpoint.owner !== getActiveRunOwner(name)) return null;
    if (!Number.isFinite(Number(checkpoint.wave)) || Number(checkpoint.coreHp) <= 0) return null;
    return checkpoint;
  } catch {
    clearActiveRunCheckpoint(name);
    return null;
  }
}

function restoreActiveRunCheckpoint() {
  const checkpoint = loadActiveRunCheckpoint();
  if (!checkpoint) return false;
  clearActiveRunCheckpoint();
  activeRunTier = clampTier(checkpoint.activeRunTier);
  selectedTier = clampTier(checkpoint.selectedTier || checkpoint.activeRunTier);
  wave = Math.max(1, Math.floor(Number(checkpoint.wave) || 1));
  gold = Math.max(0, Math.floor(Number(checkpoint.gold) || 0));
  towerStats = { ...towerStats, ...(checkpoint.towerStats || {}) };
  towerStats.upgrades = { ...(towerStats.upgrades || {}), ...(checkpoint.towerStats?.upgrades || {}) };
  cardEffects = { ...createCardEffects(), ...(checkpoint.cardEffects || {}) };
  specialState = { ...createSpecialState(), ...(checkpoint.specialState || {}) };
  coreHp = clamp(Number(checkpoint.coreHp) || towerStats.maxHp, 0.01, Math.max(0.01, towerStats.maxHp));
  const savedRunStats = checkpoint.runStats || {};
  runStats = {
    ...createRunStats(),
    ...savedRunStats,
    startedAt: performance.now() - Math.max(0, Number(savedRunStats.elapsedMs) || 0)
  };
  delete runStats.elapsedMs;
  window.restoreSpaceTowerRunConsumableState?.(checkpoint.consumableState);

  const runtime = checkpoint.runtime || {};
  spawnTimer = Number.isFinite(Number(runtime.spawnTimer)) ? Number(runtime.spawnTimer) : 0.35;
  fireTimer = Number.isFinite(Number(runtime.fireTimer)) ? Number(runtime.fireTimer) : 0;
  hitCount = Math.max(0, Math.floor(Number(runtime.hitCount) || 0));
  enemiesSpawned = Math.max(0, Math.floor(Number(runtime.enemiesSpawned) || 0));
  bossSpawnedThisWave = Boolean(runtime.bossSpawnedThisWave);
  wavePauseTimer = Math.max(0, Number(runtime.wavePauseTimer) || 0);
  lastBossPreviewWave = Math.max(0, Math.floor(Number(runtime.lastBossPreviewWave) || 0));
  autoUpgradeIndex = Math.max(0, Math.floor(Number(runtime.autoUpgradeIndex) || 0));
  rewardedReviveUsed = Boolean(runtime.rewardedReviveUsed);
  const savedSpeed = Number(runtime.gameSpeed) || 1;
  gameSpeed = savedSpeed < 4 || window.isSpaceTowerSpeedUnlocked?.(savedSpeed) ? savedSpeed : 1;
  enemies = Array.isArray(checkpoint.enemies) ? checkpoint.enemies : [];
  bullets = Array.isArray(checkpoint.bullets) ? checkpoint.bullets : [];
  v2WorkshopMainTurrets = Array.isArray(checkpoint.v2WorkshopMainTurrets) ? checkpoint.v2WorkshopMainTurrets : [];
  auxiliaryTurrets = Array.isArray(checkpoint.auxiliaryTurrets) ? checkpoint.auxiliaryTurrets : [];
  fighters = Array.isArray(checkpoint.fighters) ? checkpoint.fighters : [];
  drones = Array.isArray(checkpoint.drones) ? checkpoint.drones : [];
  laserBeams = Array.isArray(checkpoint.laserBeams) ? checkpoint.laserBeams : [];
  bossWarning = checkpoint.bossWarning || null;
  particles = [];
  shockwaves = [];
  scorePopups = [];
  v2CardStars = checkpoint.v2CardStars && typeof checkpoint.v2CardStars === "object"
    ? checkpoint.v2CardStars
    : {};
  v2BlackHole = checkpoint.v2BlackHole || null;
  v2VoidKillCounter = Math.max(0, Math.floor(Number(checkpoint.v2VoidKillCounter) || 0));
  v2ConvertedFighters = [];
  choosingCard = false;
  offeredCards = [];
  cardChoice.classList.add("hidden");
  if (tower) tower.attack = towerStats.attack;
  running = true;
  isPaused = false;
  pauseButton.textContent = EXTRA_I18N[currentLanguage].pause;
  renderTierSelector();
  updateHud();
  showEnvironmentBanner(true);
  if (runtime.choosingCard) presentCardChoice();
  return true;
}

const activeRunBaseStartGame = startGame;
startGame = function (name) {
  activeRunBaseStartGame(name);
  if (gameStarted && running) {
    restoreActiveRunCheckpoint();
  }
};

const activeRunBaseBeginNextWave = beginNextWave;
beginNextWave = function () {
  activeRunBaseBeginNextWave();
  saveActiveRunCheckpoint();
};

const activeRunBaseBuyUpgrade = buyUpgrade;
buyUpgrade = function (type) {
  activeRunBaseBuyUpgrade(type);
  saveActiveRunCheckpoint();
};

function runAutoUpgradeTick() {
  if (!autoUpgradeConfig.enabled || !gameStarted || !running || isPaused || choosingCard) return;
  if (!autoUpgradeConfig.sequence.length || gold < autoUpgradeConfig.threshold) return;
  const now = performance.now();
  if (now - autoUpgradeLastPurchaseAt < 220) return;
  const id = autoUpgradeConfig.sequence[autoUpgradeIndex % autoUpgradeConfig.sequence.length];
  const v2Def = V2_RUN_UPGRADES.find((item) => item.id === id);
  const capped = v2Def
    ? (!v2Def.consumable && getV2UpgradeValue(v2Def) >= v2Def.cap - 0.000001) || (v2Def.consumable && getV2UpgradeValue(v2Def) >= 0.999999)
    : isUpgradeCapped(id);
  if (capped || v2Def && !isV2UpgradeUnlocked(v2Def)) {
    autoUpgradeIndex = (autoUpgradeIndex + 1) % autoUpgradeConfig.sequence.length;
    renderAutoUpgradeControls();
    return;
  }
  const cost = getUpgradeCost(id);
  if (!DEV_MODE && gold < cost) return;
  const levelBefore = Number(towerStats.upgrades[id]) || 0;
  if (v2Def) buyV2Upgrade(id);
  else activeRunBaseBuyUpgrade(id);
  if ((Number(towerStats.upgrades[id]) || 0) <= levelBefore) return;
  autoUpgradeLastPurchaseAt = now;
  autoUpgradeIndex = (autoUpgradeIndex + 1) % autoUpgradeConfig.sequence.length;
  renderAutoUpgradeControls();
}

const autoUpgradeBaseUpdate = update;
update = function (dt) {
  autoUpgradeBaseUpdate(dt);
  runAutoUpgradeTick();
};

const activeRunBaseRestartCurrentRun = restartCurrentRun;
restartCurrentRun = function () {
  clearActiveRunCheckpoint();
  activeRunBaseRestartCurrentRun();
  saveActiveRunCheckpoint();
};

const activeRunBaseEndRun = endRun;
endRun = function () {
  clearActiveRunCheckpoint();
  activeRunBaseEndRun();
  clearActiveRunCheckpoint();
};

const activeRunBaseReturnHome = returnHome;
returnHome = function () {
  if (isPaused) saveActiveRunCheckpoint();
  else clearActiveRunCheckpoint();
  activeRunBaseReturnHome();
  renderConsumableDock?.();
  window.updateDeploymentButton?.();
};

pauseButton.addEventListener("click", () => {
  if (!gameStarted || !running) return;
  if (isPaused) saveActiveRunCheckpoint();
  else clearActiveRunCheckpoint();
  window.updateDeploymentButton?.();
});

setInterval(saveActiveRunCheckpoint, ACTIVE_RUN_CHECKPOINT_MS);
window.addEventListener("pagehide", saveActiveRunCheckpoint);
window.addEventListener("freeze", saveActiveRunCheckpoint);
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden") saveActiveRunCheckpoint();
});
const activeRunAppPlugin = nativePlugin("App");
if (activeRunAppPlugin) {
  addNativeListenerSafely(activeRunAppPlugin, "appStateChange", ({ isActive }) => {
    if (!isActive) saveActiveRunCheckpoint();
  });
}

// ---------- Premium battlefield rewards ----------

let v2BackgroundGoldRemainder = 0;
let v2BackgroundObsidianRemainder = 0;

function getV2BackgroundRewardMultipliers() {
  const background = getEquippedV2Background();
  const backgroundMultiplier = background && !background.vipExclusive ? V2_BACKGROUND_REWARD_MULTIPLIER : 1;
  const musicMultiplier = Number(window.getSpaceTowerMusicRewardMultiplier?.()) || 1;
  return { gold: backgroundMultiplier * musicMultiplier, obsidian: (background?.vipExclusive ? 1.1 : backgroundMultiplier) * musicMultiplier };
}

function applyV2BackgroundRewardBonus(goldDelta = 0, obsidianDelta = 0) {
  const multiplier = getV2BackgroundRewardMultipliers();
  if (multiplier.gold <= 1 && multiplier.obsidian <= 1) return { gold: 0, obsidian: 0 };
  v2BackgroundGoldRemainder += Math.max(0, Number(goldDelta) || 0) * Math.max(0, multiplier.gold - 1);
  v2BackgroundObsidianRemainder += Math.max(0, Number(obsidianDelta) || 0) * Math.max(0, multiplier.obsidian - 1);
  const goldBonus = Math.floor(v2BackgroundGoldRemainder + 0.0000001);
  const obsidianBonus = Math.floor(v2BackgroundObsidianRemainder + 0.0000001);
  if (goldBonus > 0) {
    v2BackgroundGoldRemainder -= goldBonus;
    gold += goldBonus;
    runStats.goldEarned += goldBonus;
  }
  if (obsidianBonus > 0) {
    const granted = window.grantSpaceTowerBattleObsidian?.(obsidianBonus, "multiplier") || 0;
    v2BackgroundObsidianRemainder -= granted;
  }
  return { gold: goldBonus, obsidian: obsidianBonus };
}

const v2BackgroundBaseAwardEnemyGold = awardEnemyGold;
awardEnemyGold = function (enemy) {
  const goldBefore = gold;
  const obsidianBefore = obsidian;
  const result = v2BackgroundBaseAwardEnemyGold(enemy);
  applyV2BackgroundRewardBonus(gold - goldBefore, obsidian - obsidianBefore);
  return result;
};

const v2BackgroundBaseBeginNextWave = beginNextWave;
beginNextWave = function () {
  const goldBefore = gold;
  const obsidianBefore = obsidian;
  const result = v2BackgroundBaseBeginNextWave();
  applyV2BackgroundRewardBonus(gold - goldBefore, obsidian - obsidianBefore);
  return result;
};

const v2BackgroundBaseAwardRecordObsidianBonus = awardRecordObsidianBonus;
awardRecordObsidianBonus = function (fromWave, toWave) {
  const obsidianBefore = obsidian;
  const result = v2BackgroundBaseAwardRecordObsidianBonus(fromWave, toWave);
  applyV2BackgroundRewardBonus(0, obsidian - obsidianBefore);
  return result;
};

const v2BackgroundBaseResetGame = resetGame;
resetGame = function () {
  v2BackgroundGoldRemainder = 0;
  v2BackgroundObsidianRemainder = 0;
  rewardedReviveUsed = false;
  rewardedReviveMessage = "";
  v2BackgroundBaseResetGame();
};

// ---------- Runtime UI/language hooks ----------

const v2BaseUpdateHud = updateHud;
updateHud = function () {
  v2BaseUpdateHud();
  const env = getActiveEnvironment();
  if (environmentHud) environmentHud.textContent = env?.name || getV2UiText().clear || "CLEAR";
  if (fragmentHud) fragmentHud.textContent = String(v2Progress.lifetimeFragments);
  renderCommanderAvatar();
};

const v2BaseRenderObsidian = renderObsidian;
renderObsidian = function () {
  v2BaseRenderObsidian();
  const currency = getV2LanguagePack()?.currency || getV2LanguagePack("en")?.currency || {};
  if (homeObsidianLabel) homeObsidianLabel.textContent = currency.obsidian || "Obsidian";
  if (homeSpaceCoinLabel) homeSpaceCoinLabel.textContent = currency.spaceCoin || getSpaceCoinName();
  if (homeStarDustLabel) homeStarDustLabel.textContent = currency.starDust || "Stardust";
  renderBackgroundStore();
};

function refreshV2LocalizedUi() {
  applyV2DefinitionLanguage();
  rewardedSupplyMessage = "";
  rewardedReviveMessage = "";
  const ui = getV2UiText();
  const autoUi = getAutoUpgradeText();
  const controls = getV2LanguagePack()?.controls || getV2LanguagePack("en")?.controls || {};
  const home = getV2LanguagePack()?.home || getV2LanguagePack("en")?.home || {};
  const taskBadge = homeTasksTab.querySelector(".home-tab-badge");
  const storeBadge = homeStoreTab.querySelector(".home-tab-badge");
  homePlayTab.textContent = ui.playTab || homePlayTab.textContent;
  homeTasksTab.textContent = ui.tasksTab || homeTasksTab.textContent;
  if (taskBadge) homeTasksTab.appendChild(taskBadge);
  homeCodexTab.textContent = ui.codexTab;
  homeWorkshopTab.textContent = ui.workshopTab;
  homeStoreTab.textContent = ui.storeTab || autoUi.storeTab;
  if (storeBadge) homeStoreTab.appendChild(storeBadge);
  const vipShortcutCopy = {
    zh: ["星殿通行證", "免廣告 · 專屬砲台"],
    en: ["Celestial VIP Pass", "Ad-free · Exclusive turrets"],
    ja: ["星殿 VIP パス", "広告なし · 限定タレット"],
    ko: ["성전 VIP 패스", "광고 없음 · 전용 포탑"],
    ru: ["VIP-пропуск", "Без рекламы · Особые турели"],
    es: ["Pase VIP", "Sin anuncios · Torretas exclusivas"]
  }[currentLanguage] || ["Celestial VIP Pass", "Ad-free · Exclusive turrets"];
  document.getElementById("homeVipPassTitle").textContent = vipShortcutCopy[0];
  document.getElementById("homeVipPassHint").textContent = vipShortcutCopy[1];
  settingsButton.textContent = controls.settings || settingsButton.textContent;
  pauseButton.textContent = isPaused ? controls.resume : controls.pause;
  homeButton.textContent = controls.home || homeButton.textContent;
  if (homeHeroKicker) homeHeroKicker.textContent = home.heroKicker || "ORBITAL COMMAND";
  if (homeHeroSubtitle) homeHeroSubtitle.textContent = home.heroSubtitle || "";
  if (appDownloadKicker) appDownloadKicker.textContent = home.appDownloadKicker || "ANDROID APP";
  if (appDownloadLabel) appDownloadLabel.textContent = home.appDownloadLabel || "DOWNLOAD NOW";
  if (appDownloadButton) {
    appDownloadButton.hidden = IS_NATIVE_APP;
    appDownloadButton.setAttribute("aria-label", `${home.appDownloadLabel || "Download"} Space Tower Defense · Google Play`);
  }
  if (homeMissionKicker) homeMissionKicker.textContent = home.missionKicker || "DEPLOYMENT";
  if (homeMissionTitle) homeMissionTitle.textContent = home.missionTitle || "";
  if (homePilotKicker) homePilotKicker.textContent = home.pilotKicker || "PILOT LINK";
  if (homePilotTitle) homePilotTitle.textContent = home.pilotTitle || "";
  renderCommanderAvatar();
  renderPilotLoginToggle();
  loginScreen?.setAttribute("aria-label", home.screenLabel || "Game Home");
  homePageTabs?.setAttribute("aria-label", home.sectionsLabel || "Home Sections");
  tierSelector?.setAttribute("aria-label", home.tierLabel || "Battle Tier");
  const currency = getV2LanguagePack()?.currency || getV2LanguagePack("en")?.currency || {};
  if (homeObsidianLabel) homeObsidianLabel.textContent = currency.obsidian || "Obsidian";
  if (homeSpaceCoinLabel) homeSpaceCoinLabel.textContent = currency.spaceCoin || getSpaceCoinName();
  if (homeStarDustLabel) homeStarDustLabel.textContent = currency.starDust || "Stardust";
  const policyLabel = getV2LanguagePack()?.policy || getV2LanguagePack("en")?.policy || "Privacy Policy & Account Deletion";
  document.querySelectorAll(".policy-link").forEach((link) => {
    link.textContent = policyLabel;
  });
  document.getElementById("codexKicker").textContent = ui.codexKicker;
  document.getElementById("codexTitle").textContent = ui.codexTitle;
  document.getElementById("codexDescription").textContent = ui.codexDescription;
  document.getElementById("workshopKicker").textContent = ui.workshopKicker;
  document.getElementById("workshopTitle").textContent = ui.workshopTitle;
  setBackgroundStoreStatus("");
  renderMetaUpgrades();
  renderCardPreview();
  renderV2Codex();
  renderV2Workshop();
  renderBackgroundStore();
  renderRewardedSupply();
  renderRewardedRevive();
  renderV2UpgradeGrid();
  renderAutoUpgradeControls();
  showEnvironmentBanner(true);
  updateHud();
}

// The Android WebView must update the v2 shell in the same call stack as the
// base language change. A delayed DOM event allowed cached/older v2 labels to
// remain visible even though the base Play and Missions tabs had changed.
window.refreshSpaceTowerV2Language = refreshV2LocalizedUi;

// Activate and translate the home shell before the heavier game renderers run.
// This keeps language selection usable even if a later optional feature fails.
applyLanguage(currentLanguage);

// Reconcile old data with v2 definitions after the v1 bootstrap has completed.
ensureV2MetaDefaults();
unlockedTier = Math.max(unlockedTier, computeUnlockedTier(tierRecords));
if (selectedTier > unlockedTier) selectedTier = unlockedTier;
resetGame();
renderTierSelector();
renderMetaUpgrades();
renderCardPreview();
renderV2Codex();
renderV2Workshop();
renderBackgroundStore();
renderV2UpgradeGrid();
renderAutoUpgradeControls();
applyLanguage(currentLanguage);
initializeRewardedAds();
