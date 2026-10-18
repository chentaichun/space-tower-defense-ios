/* Shared turret definitions and starting-health policy for the workshop and ranked mode. */
(() => {
const V2_TURRET_DEFS = [
  { id: "basic_cannon", healthRole: "assault", healthFactor: 1, role: "main", strengthGrade: 1, name: "基礎砲台", icon: "▷", color: "#a7e9f5", description: "最初持有的標準砲台，發射單發物理彈。一般模式初始物攻 10、每秒 4.17 發；排位使用獨立基準。", damage: 1, speed: 1, rankedDamage: 0.28, rankedSpeed: 0.7, damageType: "physical", tutorialExclusive: true, acquisition: "初始持有" },
  { id: "rookie_rapid", healthRole: "assault", healthFactor: 0.85, role: "main", strengthGrade: 1, name: "輕型快射砲", icon: "Ⅱ", color: "#80e8b5", description: "快速發射細小實體彈，單發傷害與耐久較低。", damage: 0.16, speed: 1.1, damageType: "physical", tutorialExclusive: true, acquisition: "完成新手教學" },
  { id: "rookie_spark", healthRole: "burst", healthFactor: 0.8, role: "main", strengthGrade: 1, name: "微光魔法砲", icon: "✧", color: "#c4a9f5", description: "發射單顆微光魔法彈，攻速較慢、血量較低。", damage: 0.32, speed: 0.52, damageType: "magic", tutorialExclusive: true, acquisition: "完成新手教學" },
  { id: "rookie_guard", healthRole: "tank", healthFactor: 1.4, role: "main", strengthGrade: 1, name: "裝甲守衛砲", icon: "⬡", color: "#e9c88d", description: "裝甲厚實、血量較高；以低速單發物理彈掩護陣地。", damage: 0.2, speed: 0.55, damageType: "physical", tutorialExclusive: true, acquisition: "完成第 1 場一般模式" },
  { id: "rookie_chill", healthRole: "control", healthFactor: 1.05, role: "main", strengthGrade: 1, name: "薄霜減速砲", icon: "❄", color: "#8dd5eb", description: "發射小型冰晶彈，命中減速 3%，持續 2.5 秒。", damage: 0.24, speed: 0.6, damageType: "magic", frost: 0.03, tutorialExclusive: true, acquisition: "完成第 2 場一般模式" },
  { id: "emergency_shield", healthRole: "tank", healthFactor: 1.6, role: "main", strengthGrade: 1, name: "殘血護盾核", icon: "◈", color: "#7fe8ff", description: "核心生命首次低於 30% 時啟動；星級 1–5 分別提供 1–5 次傷害護盾。", damage: 0, speed: 0 },
  { id: "frost_core", healthRole: "control", healthFactor: 1.05, role: "main", strengthGrade: 2, name: "冰晶減速核", icon: "❄", color: "#a9f6ff", description: "命中造成 5% 減速，持續 2.5 秒；升星會提高減速幅度。", damage: 0.36, speed: 0.72, damageType: "magic", frost: 0.05 },
  { id: "flame_core", healthRole: "burst", healthFactor: 0.85, role: "main", strengthGrade: 2, name: "烈焰點燃核", icon: "♨", color: "#ff9b72", description: "命中灼燒 4 秒，每秒造成魔攻 14% 傷害；升星會提高灼燒傷害。", damage: 0.34, speed: 0.74, damageType: "magic", burn: true },
  { id: "full_hp_berserk", healthRole: "assault", healthFactor: 0.9, role: "main", strengthGrade: 3, name: "滿血狂暴核", icon: "✹", color: "#ffe16f", description: "核心生命維持 100% 時，額外提高 15% 攻速。", damage: 0.28, speed: 0.9, damageType: "physical", fullHpRate: 0.15 },
  { id: "weakening_curse", healthRole: "control", healthFactor: 1.05, role: "main", strengthGrade: 3, name: "虛弱詛咒核", icon: "☾", color: "#cba3ff", description: "被命中的敵人攻擊力降低 15%。", damage: 0.3, speed: 0.8, damageType: "magic", weaken: 0.15 },
  { id: "heavy_cannon", healthRole: "bruiser", healthFactor: 1.25, role: "main", strengthGrade: 4, name: "重型加農核", icon: "⬢", color: "#ffb66e", description: "攻速慢、單發傷害高，命中帶有擊退。", damage: 1.25, speed: 0.28, damageType: "physical", knockback: 46 },
  { id: "pulse_quantum", healthRole: "burst", healthFactor: 0.8, role: "main", strengthGrade: 4, name: "追脈量子塔", icon: "◎", color: "#7dd9ff", description: "自動鎖定全場生命值最高的敵人精準打擊。", damage: 0.78, speed: 0.46, damageType: "magic", highestHp: true },
  { id: "gatling", healthRole: "assault", healthFactor: 0.9, role: "main", strengthGrade: 5, name: "加特林機槍", icon: "≋", color: "#80ffc7", description: "極高攻速、單發傷害低，專精擊退與頻繁觸發命中效果。", damage: 0.12, speed: 2.3, damageType: "physical", knockback: 10 },
  { id: "split_cannon", healthRole: "assault", healthFactor: 0.95, role: "main", strengthGrade: 5, name: "兩段分裂砲", icon: "Y", color: "#ffcf7a", description: "子彈前進一段距離後，分裂為左右兩發。", damage: 0.62, speed: 0.54, damageType: "physical", split: true },
  { id: "arcane_core", healthRole: "burst", healthFactor: 0.8, role: "main", strengthGrade: 6, name: "奧術核心", icon: "✦", color: "#d59cff", description: "發射追蹤能量球，命中後造成小範圍魔法爆破。", damage: 0.76, speed: 0.42, damageType: "magic", homing: true, area: 86 },
  { id: "reflect_bastion", healthRole: "tank", healthFactor: 1.5, role: "main", strengthGrade: 6, name: "反射金剛塔", icon: "◇", color: "#9de8ff", description: "每座提供 2 級反擊強度；核心受到碰撞時對敵人造成反傷，升星會提高強度。", damage: 0.48, speed: 0.48, damageType: "physical", reflect: 1.1 },
  { id: "scatter_heavy", healthRole: "bruiser", healthFactor: 1.15, role: "main", strengthGrade: 7, name: "散彈重砲", icon: "✺", color: "#ffad89", description: "每次攻擊同時發射 8 發近距離擴散彈丸。", damage: 0.18, speed: 0.36, damageType: "physical", pellets: 8, spread: 0.42 },
  { id: "double_burst", healthRole: "assault", healthFactor: 0.9, role: "main", strengthGrade: 7, name: "雙重連射核", icon: "Ⅱ", color: "#8ff7ff", description: "一次平行發射 2 發基礎子彈。", damage: 0.58, speed: 0.62, damageType: "physical", pellets: 2, parallel: true },
  { id: "annihilation_laser", healthRole: "burst", healthFactor: 0.75, role: "main", strengthGrade: 8, name: "毀滅雷射塔", icon: "━", color: "#ff74bd", description: "持續發射可穿透所有敵人的貫穿光束。", damage: 1.35, speed: 0.24, damageType: "magic", beam: true },
  { id: "void_devourer", healthRole: "control", healthFactor: 1.05, role: "main", strengthGrade: 8, name: "虛空吞噬塔", icon: "●", color: "#8e6cff", description: "累積擊殺後召喚微型黑洞，集中並傷害敵群。", damage: 0.7, speed: 0.5, damageType: "magic", void: true },
  { id: "vulnerability_mark", healthRole: "support", healthFactor: 0.9, role: "main", strengthGrade: 8, name: "易傷標記核", icon: "⌖", color: "#ff6f91", description: "命中標記敵人，使其後續承受的所有傷害提高 15%。", damage: 0.46, speed: 0.58, damageType: "physical", vulnerability: 0.15 },
  { id: "emerald_drake", healthRole: "assault", healthFactor: 0.9, role: "main", strengthGrade: 8, name: "碧焰龍息砲", icon: "✧", color: "#63ffad", description: "追蹤碧焰命中後，連鎖至另外 2 個目標，連鎖傷害為 55%。新手包專屬，固定一星。", damage: 0.64, speed: 0.48, damageType: "magic", homing: true, chain: 3, starterExclusive: true },
  { id: "capacitor_pulse", healthRole: "assault", healthFactor: 1, role: "main", strengthGrade: 1, name: "蓄能脈衝砲", icon: "◉", color: "#ffd978", description: "每第 5 發蓄能彈命中時，對同一目標追加該發 60% 物理傷害。", damage: 0.25, speed: 0.72, damageType: "physical", capacitorEvery: 5, capacitorBonus: 0.6 },
  { id: "royal_tide", healthRole: "control", healthFactor: 1.1, role: "main", strengthGrade: 3, name: "寶藍潮汐砲", icon: "≋", color: "#1f5cff", description: "每第 4 發寶藍彈釋放半徑 96 的潮汐波，對周圍敵人造成該發 35% 魔法傷害並減速 8%，持續 2 秒。", damage: 0.42, speed: 0.58, damageType: "magic", tideEvery: 4, tideDamage: 0.35, tideRadius: 96, tideSlow: 0.08 },
  { id: "phase_echo", healthRole: "burst", healthFactor: 0.85, role: "main", strengthGrade: 4, name: "相位回聲砲", icon: "◇", color: "#ff72ed", description: "每發命中都會產生相位回聲，對同一目標追加該發 45% 物理傷害。", damage: 0.52, speed: 0.46, damageType: "physical", phaseEcho: 0.45 },
  { id: "missile_nest", healthRole: "burst", healthFactor: 0.9, role: "auxiliary", strengthGrade: 1, name: "飛彈巢", icon: "➹", color: "#ffbc72", description: "一次齊射 6 發微型追蹤飛彈，冷卻 10 秒。", damage: 0.22, speed: 0.1, damageType: "physical", missiles: 6, cooldown: 10 },
  { id: "charged_laser", healthRole: "burst", healthFactor: 0.75, role: "auxiliary", strengthGrade: 2, name: "充能雷射砲", icon: "⌁", color: "#ff8fd5", description: "蓄力 3 秒後發射一發高傷害毀滅雷射。", damage: 1.15, speed: 0.33, damageType: "magic", beam: true, cooldown: 3 },
  { id: "frost_rail", healthRole: "control", healthFactor: 1.05, role: "auxiliary", strengthGrade: 2, name: "冰霜導軌塔", icon: "❅", color: "#9df4ff", description: "持續發射冰凍射線，被擊中者減速 5%。", damage: 0.25, speed: 0.92, damageType: "magic", frost: 0.05 },
  { id: "shield_generator", healthRole: "tank", healthFactor: 1.6, role: "auxiliary", strengthGrade: 3, name: "護盾產生器", icon: "⬡", color: "#87c7ff", description: "每座讓核心受到的所有傷害降低 2%；升星會提高減傷幅度。", damage: 0, speed: 0, shield: true },
  { id: "flame_sprayer", healthRole: "bruiser", healthFactor: 1.1, role: "auxiliary", strengthGrade: 3, name: "烈焰噴射塔", icon: "♨", color: "#ff835f", description: "向前方錐形範圍持續噴火，造成範圍灼燒。", damage: 0.13, speed: 1.8, damageType: "magic", burn: true, area: 64 },
  { id: "long_range_sniper", healthRole: "burst", healthFactor: 0.75, role: "auxiliary", strengthGrade: 4, name: "狙擊長程砲", icon: "⌖", color: "#ffe583", description: "架設於最外圈，優先攻擊最遠或 Boss 單位。", damage: 1.42, speed: 0.24, damageType: "physical", highestHp: true, range: 1.7 },
  { id: "chain_arc", healthRole: "burst", healthFactor: 0.85, role: "auxiliary", strengthGrade: 4, name: "連鎖電弧塔", icon: "ϟ", color: "#c8a2ff", description: "閃電在 3 至 5 個敵人之間彈跳。", damage: 0.32, speed: 0.56, damageType: "magic", chain: 5 },
  { id: "crit_resonance", healthRole: "support", healthFactor: 0.95, role: "auxiliary", strengthGrade: 5, name: "暴擊共鳴塔", icon: "✧", color: "#fff09a", description: "提升同節點附近砲台 5% 暴擊率。", damage: 0.22, speed: 0.66, damageType: "physical", critAura: 0.05 },
  { id: "time_slow", healthRole: "control", healthFactor: 1.05, role: "auxiliary", strengthGrade: 5, name: "時空遲緩塔", icon: "◴", color: "#8bdcff", description: "展開持續減速的遲緩場，使場內敵人減速 5%。", damage: 0.08, speed: 0.72, damageType: "magic", slowAura: 0.05 },
  { id: "cluster_bomb", healthRole: "burst", healthFactor: 0.85, role: "auxiliary", strengthGrade: 6, name: "擴散爆彈塔", icon: "✹", color: "#ff9e72", description: "命中後分裂成 3 個小爆彈二次引爆。", damage: 0.48, speed: 0.42, damageType: "physical", cluster: 3, area: 72 },
  { id: "mining_gold", healthRole: "support", healthFactor: 1.1, role: "auxiliary", strengthGrade: 6, name: "採礦金幣塔", icon: "¤", color: "#ffd36e", description: "不具備攻擊力，每波結束提供額外金幣。", damage: 0, speed: 0, mining: true },
  { id: "soul_drain", healthRole: "support", healthFactor: 1, role: "auxiliary", strengthGrade: 7, name: "靈魂汲取塔", icon: "☥", color: "#85ffb6", description: "擊殺敵人時，為主砲恢復 0.5% 生命值。", damage: 0.5, speed: 0.48, damageType: "magic", lifeSteal: 0.005 },
  { id: "shadow_replica", healthRole: "assault", healthFactor: 0.85, role: "auxiliary", strengthGrade: 7, name: "影子複製塔", icon: "◐", color: "#ad9bff", description: "複製主砲 20% 傷害的子彈彈幕。", damage: 0.2, speed: 0.82, damageType: "physical", shadow: true },
  { id: "antimatter", healthRole: "burst", healthFactor: 0.7, role: "auxiliary", strengthGrade: 8, name: "反物質塔", icon: "⊗", color: "#ff69ce", description: "造成目標最大生命值 10% 的傷害，冷卻 30 秒。", damage: 0, speed: 0.033, damageType: "magic", antimatter: 0.1, cooldown: 30 },
  { id: "vip_prism_lancer", healthRole: "burst", healthFactor: 0.75, role: "main", strengthGrade: 8, rarity: "rare", vipExclusive: true, name: "幻稜折光砲", icon: "✧", color: "#51e5ff", description: "鑽石棱鏡發射穿透光束，命中再留下相位回聲。", damage: 1.08, speed: 0.32, damageType: "magic", beam: true, phaseEcho: 0.35 },
  { id: "vip_thunder_throne", healthRole: "burst", healthFactor: 0.8, role: "main", strengthGrade: 8, rarity: "rare", vipExclusive: true, name: "雷霆王座", icon: "ϟ", color: "#bd76ff", description: "鎖定強敵，金色電弧連鎖五個目標。", damage: 0.74, speed: 0.5, damageType: "magic", highestHp: true, chain: 5 },
  { id: "vip_frost_bloom", healthRole: "control", healthFactor: 1.05, role: "main", strengthGrade: 8, rarity: "rare", vipExclusive: true, name: "霜月花冠", icon: "❆", color: "#5df5e1", description: "月華冰彈展開霜花，範圍命中並減速敵群。", damage: 0.44, speed: 0.68, damageType: "magic", frost: 0.12, area: 96 },
  { id: "vip_star_phoenix", healthRole: "burst", healthFactor: 0.8, role: "main", strengthGrade: 8, rarity: "rare", vipExclusive: true, name: "熔星鳳凰", icon: "✹", color: "#ff526d", description: "鳳凰火羽分裂，爆破後持續灼燒。", damage: 0.77, speed: 0.46, damageType: "magic", split: true, burn: true, area: 80 },
  { id: "vip_abyssal_tide", healthRole: "control", healthFactor: 1.1, role: "main", strengthGrade: 8, rarity: "rare", vipExclusive: true, name: "深海潮汐", icon: "≈", color: "#3d93ff", description: "潮汐脈衝擴散，命中附加緩速與範圍傷害。", damage: 0.56, speed: 0.54, damageType: "magic", frost: 0.08, area: 110 },
  { id: "vip_quantum_crown", healthRole: "burst", healthFactor: 0.8, role: "main", strengthGrade: 8, rarity: "legendary", vipExclusive: true, name: "量子皇冕", icon: "♛", color: "#e456ff", description: "帝冠星彈追蹤目標，命中後以紫金弧光連鎖六敵。需 100 碎片組裝。", damage: 1.04, speed: 0.52, damageType: "magic", homing: true, chain: 6, area: 88 },
  { id: "vip_singularity_king", healthRole: "control", healthFactor: 1.05, role: "main", strengthGrade: 8, rarity: "legendary", vipExclusive: true, name: "黑洞君王", icon: "◉", color: "#9770ff", description: "每次擊殺蓄積引力，召喚收束敵群的黑洞。需 100 碎片組裝。", damage: 0.92, speed: 0.48, damageType: "magic", void: true, area: 100 },
  { id: "vip_solar_judgment", healthRole: "burst", healthFactor: 0.7, role: "main", strengthGrade: 8, rarity: "legendary", vipExclusive: true, name: "赤陽審判", icon: "☼", color: "#ff7839", description: "赤金審判光束貫穿全場，留下灼熱印記。需 100 碎片組裝。", damage: 1.52, speed: 0.26, damageType: "magic", beam: true, burn: true },
  { id: "vip_nebula_hymn", healthRole: "tank", healthFactor: 1.5, role: "main", strengthGrade: 8, rarity: "legendary", vipExclusive: true, name: "星雲聖歌", icon: "✺", color: "#ff77c4", description: "星雲護盾與共鳴光環守護主砲，提升附近砲台暴擊。需 100 碎片組裝。", damage: 0.26, speed: 0.68, damageType: "magic", shield: true, critAura: 0.08 },
  { id: "vip_chrono_axis", healthRole: "control", healthFactor: 1.05, role: "main", strengthGrade: 8, rarity: "legendary", vipExclusive: true, name: "時序天樞", icon: "◴", color: "#43ffc4", description: "時序齒環緩速敵群，冰晶電弧連鎖命中。需 100 碎片組裝。", damage: 0.62, speed: 0.58, damageType: "magic", slowAura: 0.09, frost: 0.1, chain: 5 }
];

const gradeHealth = Object.freeze([0, 100, 110, 120, 135, 150, 165, 180, 200]);
const rarityHealth = Object.freeze({ rare: 210, legendary: 230 });
const roles = Object.freeze({ tank: '坦克', bruiser: '重裝', assault: '突擊', burst: '爆發', control: '控制', support: '輔助' });
const byId = new Map(V2_TURRET_DEFS.map(turret => [turret.id, turret]));
function health(turretOrId) {
  const turret = typeof turretOrId === 'string' ? byId.get(turretOrId) : turretOrId;
  if (!turret || !byId.has(turret.id)) throw new RangeError('Unknown turret');
  const base = turret.vipExclusive ? rarityHealth[turret.rarity] : gradeHealth[turret.strengthGrade];
  return Math.round(base * turret.healthFactor);
}
function loadoutHealth(ids) {
  if (!Array.isArray(ids) || ids.length !== 5 || new Set(ids).size !== 5 || ids.some(id => !byId.has(id))) {
    throw new RangeError('Select exactly five different turrets');
  }
  return ids.reduce((sum, id) => sum + health(id), 0);
}
globalThis.SpaceTowerCatalog = Object.freeze({ turrets: V2_TURRET_DEFS, byId, gradeHealth, rarityHealth, roles, health, loadoutHealth });
})();
