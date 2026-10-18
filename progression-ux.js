/* Clear early goals, contextual enemy data and factual shop value. */
const PROGRESSION_COPY = {
  zh: {
    intel: "敵人數值", wave: "波數", columns: ["敵人種類", "生命", "防禦（物理／魔法）", "傷害", "速度", "特殊能力"],
    note: "生成時數值；包含階級、環境與常駐效果。傷害為防禦減免前，速度為每秒移動距離；戰鬥中的加速、減速與受傷效果會另外改變數值。", collision: "碰撞", ranged: "遠程", none: "無", close: "關閉", next: "下一波", advanced: "進階自動升級", goal: "下一個目標", upgrade: "先用金幣升級攻擊、生命或攻速", card: "第 5 波選擇特技卡", shield: "擊敗第 10 波 Boss：入門護盾砲台", rewards: "查看可領獎勵", permanent: "永久強化：下一局也會保留", preview: "效果預覽", oneStar: "一星效果", more: "更多貨幣包", rewardOnly: "獎勵限定", utilityDescription: "每天可自選 3 次廣告獎勵，也可直接用黑曜石購買道具。黑曜石加成券僅由獎勵取得。", damageTaken: "承受傷害", source: "最後傷害來源", physical: "物理", magic: "魔法", defenseAdvice: "下局先提升生命與物理防禦；金幣升級只影響當局。", magicAdvice: "下局先提升生命與魔法防禦；金幣升級只影響當局。", draws: "可單抽次數", purpose: "用於永久強化與補給", ownedFirst: "已擁有與接近解鎖的裝備優先", restore: "永久權益 · 換裝置後可恢復購買", summon: "召喚護衛", beam: "光束", pulse: "脈衝", cap: "本局 +50%，最多 +15；共用每日上限 25", nextValue: "下級增加", milestone: "波次獎勵", claim: "領取", amount: "增加", trial: "預覽不消耗道具", shieldReady: "入門護盾碎片已備齊，前往工坊組裝"
  },
  en: {
    intel: "Enemy stats", wave: "Wave", columns: ["Enemy", "HP", "Defense (physical / magic)", "Damage", "Speed", "Abilities"],
    note: "Spawn values include tier, environment and persistent effects. Damage is before defense; speed is distance per second. Temporary combat buffs, slows and injury effects may change these values.", collision: "Contact", ranged: "Ranged", none: "None", close: "Close", next: "Next wave", advanced: "Advanced auto-upgrade", goal: "Next goal", upgrade: "Spend gold on attack, HP or fire rate", card: "Choose a skill card at wave 5", shield: "Defeat wave 10 Boss: starter shield turret", rewards: "View available rewards", permanent: "Permanent upgrades carry into your next run", preview: "Effect preview", oneStar: "One-star effect", more: "More currency packs", rewardOnly: "Reward only", utilityDescription: "Choose up to 3 ad rewards daily, or buy items directly with obsidian. Obsidian vouchers are rewards only.", damageTaken: "Damage taken", source: "Last damage source", physical: "Physical", magic: "Magic", defenseAdvice: "Next run, improve HP and physical defense. Gold upgrades last for one run.", magicAdvice: "Next run, improve HP and magic defense. Gold upgrades last for one run.", draws: "Single draws", purpose: "For permanent upgrades and supply draws", ownedFirst: "Owned and near-unlock gear first", restore: "Permanent benefit · Restore purchases after changing devices", summon: "Summons escorts", beam: "Beam", pulse: "Pulse", cap: "+50% this run, up to +15; shared daily cap: 25", nextValue: "Next level adds", milestone: "Wave rewards", claim: "Claim", amount: "Gain", trial: "Preview uses no items", shieldReady: "Starter shield fragments ready. Assemble it in the workshop"
  },
  ja: {
    intel: "敵の数値", wave: "ウェーブ", columns: ["敵の種類", "HP", "防御（物理／魔法）", "ダメージ", "速度", "特殊能力"], note: "出現時の値。階級・環境・常時効果を反映。ダメージは防御適用前、速度は毎秒の移動距離。戦闘中の一時効果は別途適用されます。", collision: "接触", ranged: "遠距離", none: "なし", close: "閉じる", next: "次のウェーブ", advanced: "自動強化の詳細", goal: "次の目標", upgrade: "金貨で攻撃・HP・攻速を強化", card: "第5波でスキルカードを選択", shield: "第10波ボス撃破：入門シールド砲台", rewards: "受取可能な報酬", permanent: "永久強化は次の出撃にも引き継がれます", preview: "効果プレビュー", oneStar: "星1の効果", more: "他の通貨パック", rewardOnly: "報酬限定", utilityDescription: "広告報酬は毎日3回。黒曜石で直接購入も可能。黒曜石加算券は報酬限定です。", damageTaken: "被ダメージ", source: "最後の攻撃元", physical: "物理", magic: "魔法", defenseAdvice: "次はHPと物理防御を強化。金貨強化は今回の出撃のみ。", magicAdvice: "次はHPと魔法防御を強化。金貨強化は今回の出撃のみ。", draws: "単発回数", purpose: "永久強化と補給に使用", ownedFirst: "所有済み・解放間近を優先", restore: "永久特典・機種変更後は購入を復元", summon: "護衛召喚", beam: "ビーム", pulse: "パルス", cap: "今回+50%、最大+15。共通の日次上限25", nextValue: "次のレベル", milestone: "ウェーブ報酬", claim: "受取", amount: "増加", trial: "プレビューは消費なし", shieldReady: "シールドの欠片が揃いました。工房で組み立てましょう"
  },
  ko: {
    intel: "적 능력치", wave: "웨이브", columns: ["적 종류", "체력", "방어 (물리 / 마법)", "피해", "속도", "특수 능력"], note: "등장 시 능력치입니다. 티어, 환경, 지속 효과를 반영합니다. 피해는 방어 적용 전, 속도는 초당 이동 거리이며 전투 중 일시 효과는 별도입니다.", collision: "접촉", ranged: "원거리", none: "없음", close: "닫기", next: "다음 웨이브", advanced: "고급 자동 강화", goal: "다음 목표", upgrade: "골드로 공격력, 체력, 공격 속도 강화", card: "5웨이브에서 스킬 카드 선택", shield: "10웨이브 보스 처치: 입문 보호막 포탑", rewards: "받을 수 있는 보상", permanent: "영구 강화는 다음 전투에도 유지됩니다", preview: "효과 미리보기", oneStar: "1성 효과", more: "다른 재화 팩", rewardOnly: "보상 전용", utilityDescription: "광고 보상은 하루 3회 선택할 수 있습니다. 흑요석으로 바로 구매할 수도 있습니다. 흑요석 보너스권은 보상 전용입니다.", damageTaken: "받은 피해", source: "마지막 피해 원인", physical: "물리", magic: "마법", defenseAdvice: "다음 전투는 체력과 물리 방어를 강화하세요. 골드 강화는 한 전투만 유지됩니다.", magicAdvice: "다음 전투는 체력과 마법 방어를 강화하세요. 골드 강화는 한 전투만 유지됩니다.", draws: "단일 뽑기", purpose: "영구 강화 및 보급에 사용", ownedFirst: "보유 및 해금 직전 장비 우선", restore: "영구 혜택 · 기기 변경 후 구매 복원", summon: "호위 소환", beam: "광선", pulse: "펄스", cap: "이번 전투 +50%, 최대 +15. 공통 일일 한도 25", nextValue: "다음 레벨 증가", milestone: "웨이브 보상", claim: "받기", amount: "증가", trial: "미리보기는 아이템을 소비하지 않습니다", shieldReady: "보호막 조각이 모였습니다. 공방에서 조립하세요"
  },
  ru: {
    intel: "Характеристики врагов", wave: "Волна", columns: ["Враг", "Здоровье", "Защита (физ. / маг.)", "Урон", "Скорость", "Способности"], note: "Значения при появлении с учётом уровня, среды и постоянных эффектов. Урон до защиты, скорость — расстояние в секунду. Временные боевые эффекты меняют значения.", collision: "Контакт", ranged: "Дальний", none: "Нет", close: "Закрыть", next: "Следующая волна", advanced: "Настройки автоулучшения", goal: "Следующая цель", upgrade: "Улучшите атаку, здоровье или темп огня за золото", card: "Выберите карту на волне 5", shield: "Победите босса волны 10: стартовая щитовая турель", rewards: "Доступные награды", permanent: "Постоянные улучшения сохраняются между боями", preview: "Просмотр эффекта", oneStar: "Эффект одной звезды", more: "Другие наборы валюты", rewardOnly: "Только награда", utilityDescription: "До 3 наград за рекламу в день или прямая покупка за обсидиан. Купон обсидиана доступен только как награда.", damageTaken: "Полученный урон", source: "Последний источник урона", physical: "Физический", magic: "Магический", defenseAdvice: "В следующем бою улучшите здоровье и физическую защиту. Улучшения за золото действуют один бой.", magicAdvice: "В следующем бою улучшите здоровье и магическую защиту. Улучшения за золото действуют один бой.", draws: "Одиночные розыгрыши", purpose: "Для постоянных улучшений и снабжения", ownedFirst: "Сначала имеющееся и близкое к открытию", restore: "Постоянный бонус · Восстановите покупки на новом устройстве", summon: "Вызывает эскорт", beam: "Луч", pulse: "Импульс", cap: "+50% за бой, не более +15; общий лимит в день: 25", nextValue: "Следующий уровень", milestone: "Награды за волны", claim: "Получить", amount: "Прирост", trial: "Просмотр не расходует предметы", shieldReady: "Фрагменты щита собраны. Соберите турель в мастерской"
  },
  es: {
    intel: "Estadísticas enemigas", wave: "Oleada", columns: ["Enemigo", "Vida", "Defensa (física / mágica)", "Daño", "Velocidad", "Habilidades"], note: "Valores al aparecer con nivel, entorno y efectos permanentes. Daño antes de defensa; velocidad en distancia por segundo. Los efectos temporales de combate pueden cambiarlos.", collision: "Contacto", ranged: "A distancia", none: "Ninguna", close: "Cerrar", next: "Siguiente oleada", advanced: "Mejora automática avanzada", goal: "Siguiente objetivo", upgrade: "Usa oro para mejorar ataque, vida o cadencia", card: "Elige una carta en la oleada 5", shield: "Derrota al jefe de la oleada 10: torreta de escudo inicial", rewards: "Ver premios disponibles", permanent: "Las mejoras permanentes duran entre partidas", preview: "Vista del efecto", oneStar: "Efecto de una estrella", more: "Más paquetes de moneda", rewardOnly: "Solo recompensa", utilityDescription: "Elige hasta 3 premios de anuncios al día o compra directamente con obsidiana. El cupón de obsidiana solo se obtiene como premio.", damageTaken: "Daño recibido", source: "Última fuente de daño", physical: "Físico", magic: "Mágico", defenseAdvice: "Mejora vida y defensa física en la siguiente partida. Las mejoras con oro duran una partida.", magicAdvice: "Mejora vida y defensa mágica en la siguiente partida. Las mejoras con oro duran una partida.", draws: "Tiradas individuales", purpose: "Para mejoras permanentes y suministros", ownedFirst: "Primero equipo propio y próximo a desbloquear", restore: "Ventaja permanente · Restaura compras al cambiar de dispositivo", summon: "Invoca escoltas", beam: "Rayo", pulse: "Pulso", cap: "+50% por partida, hasta +15; límite diario compartido: 25", nextValue: "Siguiente nivel añade", milestone: "Premios de oleada", claim: "Recibir", amount: "Ganancia", trial: "La vista no consume objetos", shieldReady: "Fragmentos de escudo listos. Ensámblalo en el taller"
  }
};
window.spaceTowerUxText = () => PROGRESSION_COPY[currentLanguage] || PROGRESSION_COPY.en;
const uxText = window.spaceTowerUxText;
const uxNumber = value => Number(value).toLocaleString(undefined, { maximumFractionDigits: 2 });

// Run the same final stat functions used by spawning. Restore context synchronously.
function getEnemyIntelRows(tier, targetWave) {
  const oldTier = activeRunTier;
  const oldWave = wave;
  try {
    activeRunTier = clampTier(tier);
    wave = Math.max(1, Math.floor(Number(targetWave) || 1));
    const types = Object.values(ENEMY_TYPES).filter(type => getEnemyTypeWeight(type, wave) > 0);
    const rows = types.map(type => ({ stats: getEnemyStats(wave, type), name: getV2EnemyInfo(type.name)[0], ability: getV2EnemyInfo(type.name)[1] }));
    const boss = getBossTypeForWave(wave);
    if (boss) {
      const stats = getBossStats(wave, boss);
      rows.push({ stats, name: getLocalizedBossName(boss), ability: "" });
      if (stats.escortCarrier) rows.push({ stats: getEscortStats(wave), name: getLocalizedEnemyName("alien_escort"), ability: "" });
    }
    const env = getActiveEnvironment(activeRunTier, wave);
    const slowAura = clamp(auxiliaryTurrets.filter(item => item.kind === "time_slow").reduce((sum, item) => sum + 0.05 * getV2TurretEffectMultiplier(item.kind), 0), 0, 0.5);
    return rows.map(row => {
      const stat = { ...row.stats };
      stat.hp = Math.max(1, Math.round(stat.hp * (1 - clamp(towerStats.curseAura || 0, 0, 0.5))));
      stat.speed *= (env?.id === "solar" ? 1.08 : env?.id === "gravity" ? 0.9 : 1) * (1 - slowAura);
      const abilities = [row.ability];
      if (stat.escortCarrier) abilities.push(uxText().summon);
      if (stat.beam) abilities.push(uxText().beam);
      if (stat.pulseAttack) abilities.push(uxText().pulse);
      return { ...row, stats: stat, ability: abilities.filter(Boolean).join(" · ") || uxText().none };
    });
  } finally { activeRunTier = oldTier; wave = oldWave; }
}

const enemyStatsDialog = document.getElementById("intelStatRows");
let enemyIntelTier = 1;
let enemyIntelWave = 1;
let enemyIntelRenderedAt = 0;
let enemyIntelRenderKey = "";
function renderEnemyStatsDialog() {
  const labels = ENEMY_STAT_I18N[currentLanguage] || ENEMY_STAT_I18N.en;
  intelStatHeaders.forEach((header, index) => { header.textContent = labels.columns[index]; });
  enemyStatsDialog.innerHTML = getEnemyIntelRows(enemyIntelTier, enemyIntelWave).map(({ stats: s, name }) => {
    let ranged = 0;
    if (s.ability === "ranged") ranged = Math.max(2, Math.round(s.collisionDamage * 1.25));
    if (s.beam) {
      const raw = Math.max(2, Math.round(towerStats.maxHp * (s.beamHpRatio || 0.035) + Math.sqrt(enemyIntelWave) * (s.beamWaveScale || 0.025)));
      const cap = Math.max(2, Math.round(towerStats.maxHp * (s.beamMaxHpRatio || 0.08)));
      ranged = Math.max(ranged, Math.min(raw, cap) * (s.beamDamageMultiplier || BOSS_ATTACK_BALANCE.beamMultiplier));
    }
    if (s.pulseAttack) {
      const raw = Math.max(2, Math.round(towerStats.maxHp * (s.pulseHpRatio || 0.025)));
      const cap = Math.max(2, Math.round(towerStats.maxHp * (s.pulseMaxHpRatio || 0.05)));
      ranged = Math.max(ranged, Math.min(raw, cap) * BOSS_ATTACK_BALANCE.pulseMultiplier);
    }
    const values = [s.hp, s.collisionDamage, ranged, s.physicalDefense, s.magicDefense];
    return `<tr><td>${escapeHtml(name)}</td>${values.map((value, index) => `<td>${index === 2 && value === 0 ? "—" : formatCompactNumber(value)}</td>`).join("")}</tr>`;
  }).join("");
}
function refreshCurrentEnemyStats() {
  if (!document.body.classList.contains("in-game") || !battleIntelOpen) return;
  enemyIntelTier = activeRunTier;
  enemyIntelWave = wave;
  const renderKey = `${currentLanguage}:${activeRunTier}:${wave}:${towerStats.maxHp}:${towerStats.curseAura}:${auxiliaryTurrets.map(item => `${item.kind}:${getV2TurretEffectMultiplier(item.kind)}`).join(",")}`;
  if (renderKey === enemyIntelRenderKey) return;
  enemyIntelRenderKey = renderKey;
  renderEnemyStatsDialog();
}
const progressionBaseUpdateBattleIntel = updateBattleIntel;
updateBattleIntel = function () {
  progressionBaseUpdateBattleIntel();
  refreshCurrentEnemyStats();
};
const progressionBaseSetBattleIntelDrawer = setBattleIntelDrawer;
setBattleIntelDrawer = function (open) {
  progressionBaseSetBattleIntelDrawer(open);
  if (open) { enemyIntelRenderedAt = 0; refreshCurrentEnemyStats(); }
};

const firstUpgradeHint = document.createElement("p");
firstUpgradeHint.className = "first-upgrade-hint";
document.getElementById("upgradePanel").prepend(firstUpgradeHint);
let progressionGoalKey = "";
function renderProgressionGoals() {
  const t = uxText();
  const key = `${currentLanguage}:${firstDeployment.completed.join()}`;
  if (key === progressionGoalKey) return;
  progressionGoalKey = key;
  firstUpgradeHint.textContent = t.upgrade;
  firstUpgradeHint.hidden = firstDeployment.completed[0];
  document.getElementById("upgradeAdvancedLabel").textContent = t.advanced;
  document.querySelectorAll(".enemy-stats-open").forEach(button => { button.textContent = t.intel; });
}
const progressionBaseRenderFirstDeployment = renderFirstDeployment;
renderFirstDeployment = function () { progressionBaseRenderFirstDeployment(); renderProgressionGoals(); };

// Existing onboarding completion flag makes the one-time starter award persistent.
window.grantV2FirstDeploymentFragment = function () {
  const turret = V2_TURRET_DEFS.find(item => item.id === "emergency_shield");
  if (!turret) return false;
  const amount = Math.max(0, getV2FragmentTarget() - (v2Progress.fragments[turret.id] || 0));
  if (v2Progress.assembled[turret.id] > 0 || amount === 0) return false;
  v2Progress.fragments[turret.id] += amount;
  v2Progress.lifetimeFragments += amount;
  saveV2Progress({ critical: true });
  showTaskToast(uxText().milestone, uxText().shieldReady);
  trackGameEvent("fragment_awarded", { system: "turret", item_id: turret.id, amount, source: "first_deployment" });
  return true;
};

window.spaceTowerResultAdvice = () => {
  const t = uxText();
  const incoming = runStats.incomingDamage || {};
  const source = runStats.lastDamageSource;
  const name = source ? (Object.values(BOSS_TYPES).find(b => b.name === source) ? getLocalizedBossName(Object.values(BOSS_TYPES).find(b => b.name === source)) : getV2EnemyInfo(source)[0]) : "";
  const advice = (incoming.magic || 0) > (incoming.physical || 0) ? t.magicAdvice : t.defenseAdvice;
  return `${name ? `${escapeHtml(t.source)}: ${escapeHtml(name)} · ` : ""}${t.damageTaken}: ${t.physical} ${uxNumber(incoming.physical || 0)} / ${t.magic} ${uxNumber(incoming.magic || 0)}<br>${escapeHtml(advice)}`;
};

// Show only factual effects and their limits beside the purchase.
const UTILITY_EFFECT_COPY = {
  zh: ["倒下時復活一次", "本局黑曜石 +50%，最多 +15；共用每日上限 25", "跳過一個非 Boss 波次", "下一次金幣升級免費", "本局前 200 波金幣 ×2", "封印目前 Boss，2.6 秒後移除", "阻擋一般敵人傷害 5 波"],
  en: ["One revive after defeat", "+50% run obsidian, up to +15; shared daily cap 25", "Skip one non-Boss wave", "Your next gold upgrade is free", "Gold ×2 through wave 200 this run", "Seal the current Boss; removed after 2.6 seconds", "Block normal enemy damage for 5 waves"],
  ja: ["敗北時に1回復活", "黒曜石+50%、最大+15。日次共通上限25", "ボス以外の1波をスキップ", "次の金貨強化が無料", "今回の第200波まで金貨×2", "現在のボスを封印し、2.6秒後に除去", "通常敵のダメージを5波防ぐ"],
  ko: ["패배 후 1회 부활", "흑요석+50%, 최대+15. 일일 공통 한도25", "보스 없는 웨이브 1회 건너뛰기", "다음 골드 강화 무료", "이번 전투 200웨이브까지 골드×2", "현재 보스 봉인 후 2.6초 뒤 제거", "5웨이브 동안 일반 적 피해 차단"],
  ru: ["Одно возрождение после поражения", "+50% обсидиана, до +15; общий лимит 25 в день", "Пропуск одной волны без босса", "Следующее улучшение за золото бесплатно", "Золото ×2 до волны 200 в этом бою", "Запечатывает босса и убирает через 2,6 с", "Блокирует обычных врагов на 5 волн"],
  es: ["Una reanimación tras perder", "+50% obsidiana, hasta +15; límite diario compartido 25", "Saltar una oleada sin jefe", "La siguiente mejora con oro es gratis", "Oro ×2 hasta la oleada 200 de esta partida", "Sella al jefe y lo elimina tras 2,6 s", "Bloquea daño de enemigos normales durante 5 oleadas"]
};
window.spaceTowerUtilityDescription = id => (UTILITY_EFFECT_COPY[currentLanguage] || UTILITY_EFFECT_COPY.en)[CONSUMABLE_IDS.indexOf(id)] || "";

function enrichShop() {
  const t = uxText();
  const products = [...shopGrid.querySelectorAll(".shop-product")];
  for (const item of products) {
    const product = findShopProduct(item.querySelector("[data-shop-product]")?.dataset.shopProduct);
    if (!product) continue;
    const pack = product.currencyType === "spaceCoin" ? EXPANSION_PACKS.supreme : EXPANSION_PACKS.normal;
    const credited = product.amount * (product.currencyType !== "spaceCoin" && !shopFirstPurchaseClaimed ? 2 : 1);
    const count = Math.floor(credited / pack.oneCost);
    const detail = document.createElement("p");
    detail.className = "shop-purpose";
    detail.textContent = `${product.currencyType === "spaceCoin" ? getSpaceCoinName() : t.purpose} · ${t.draws}: ${count}`;
    item.append(detail);
  }
  const extra = products.filter((item, index) => products.filter(p => p.dataset.currency === item.dataset.currency).indexOf(item) >= 2);
  if (extra.length) {
    const more = document.createElement("details");
    more.className = "more-currency-packs";
    if (SHOP_SALE_PREVIEW) more.open = true;
    more.innerHTML = `<summary>${t.more}</summary><div class="shop-extra-grid"></div>`;
    for (const item of extra) more.lastElementChild.append(item);
    shopGrid.append(more);
  }
  for (const grid of [privilegeGrid, storePrivilegeGrid]) {
    const note = document.createElement("p"); note.className = "privilege-restore-note"; note.textContent = t.restore; grid.append(note);
  }
}
const progressionBaseRenderShop = renderShop;
renderShop = function () { progressionBaseRenderShop(); enrichShop(); };
const progressionBaseRenderObsidian = renderObsidian;
renderObsidian = function () { progressionBaseRenderObsidian(); renderUtilityStore(); };

const equipmentPreview = document.createElement("dialog");
equipmentPreview.className = "progression-dialog equipment-preview";
document.body.append(equipmentPreview);
document.addEventListener("click", event => {
  const trigger = event.target.closest("[data-equipment-preview]");
  if (!trigger) return;
  const t = uxText();
  const isUltimate = trigger.dataset.previewKind === "ultimate";
  const item = (isUltimate ? ULTIMATE_DEFS : V2_TURRET_DEFS).find(d => d.id === trigger.dataset.equipmentPreview);
  if (!item) return;
  const [name, description] = isUltimate ? getUltimateText(item) : [item.name, item.description];
  const singleStar = isUltimate ? { ...item, values: item.values.slice(0, 1), secondary: item.secondary?.slice(0, 1) } : null;
  equipmentPreview.innerHTML = `<header><h2>${escapeHtml(name)}</h2><button data-preview-close>${t.close}</button></header><p>${t.trial}</p><canvas width="720" height="400" role="img" aria-label="${escapeHtml(`${name} · ${t.preview}`)}"></canvas><button type="button" class="preview-playback" data-preview-playback aria-label="Pause" aria-pressed="false">Ⅱ</button>${isUltimate ? `<p>${escapeHtml(formatUltimateValues(singleStar))}</p>` : ""}<p>${escapeHtml(description)}</p>${isUltimate ? "" : renderTurretStatGrid(item, 1)}<small>${t.oneStar}</small>`;
  equipmentPreview.showModal();
  startEquipmentAnimation(equipmentPreview.querySelector("canvas"), item, isUltimate);
});
equipmentPreview.addEventListener("click", event => { if (event.target.closest("[data-preview-close]")) equipmentPreview.close(); });


// A self-contained illustration: no combat globals, inventory, rewards or RNG are mutated.
const ULTIMATE_PREVIEW_EFFECTS = Object.freeze({
  core_self_destruct: "repel", black_hole_detonation: "blackhole", coin_railgun: "railgun",
  barrage_reversal: "reverse", allegiance_swap: "allies", satellite_judgment: "satellite",
  system_reboot: "reboot", absolute_defense: "invulnerable", nano_first_aid: "heal",
  shield_overload: "shield", death_mark: "mark", global_emp: "emp", phase_shelter: "phase",
  overclock_a: "rapid", overclock_b: "fortify", giant_barrage: "giant", blood_rage: "rage",
  energy_devourer: "absorb", frozen_world: "freeze", execution_aura: "execute",
  judgment_chain: "chain", golden_touch: "gold", emergency_blueprint: "blueprint",
  bounty_order: "bounty", space_exploration: "explore", divine_sanctuary: "sanctuary"
});
let stopEquipmentAnimation = () => {};
function startEquipmentAnimation(canvas, item, isUltimate) {
  stopEquipmentAnimation();
  const context = canvas.getContext("2d");
  const sprite = document.createElement("canvas");
  sprite.width = sprite.height = 240;
  drawTurretPreviewCanvas(sprite, isUltimate ? V2_TURRET_DEFS.find(turret => turret.id === "capacitor_pulse") : item, { transparent: true });
  let frame = 0, elapsed = 0, previous = null, paused = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches || false, stopped = false;
  const playback = equipmentPreview.querySelector("[data-preview-playback]");
  const playbackText = ({zh:["播放", "暫停"],en:["Play", "Pause"],ja:["再生", "一時停止"],ko:["재생", "일시 정지"],ru:["Воспроизвести", "Пауза"],es:["Reproducir", "Pausa"]})[currentLanguage] || ["Play", "Pause"];
  const updatePlayback = () => { playback.textContent = paused ? "▷" : "Ⅱ"; playback.setAttribute("aria-pressed", String(paused)); playback.setAttribute("aria-label", playbackText[paused ? 0 : 1]); };
  updatePlayback();
  const animate = now => {
    frame = 0;
    if (stopped || !equipmentPreview.open || document.hidden || paused) return;
    if (previous !== null) elapsed += Math.min(100, now - previous);
    previous = now;
    drawEquipmentBattleFrame(context, sprite, item, isUltimate, elapsed / 1000);
    frame = requestAnimationFrame(animate);
  };
  const resume = () => {
    cancelAnimationFrame(frame); frame = 0; previous = null;
    if (!stopped && !document.hidden && !paused && equipmentPreview.open) frame = requestAnimationFrame(animate);
  };
  playback.onclick = () => {
    paused = !paused;
    updatePlayback();
    resume();
  };
  document.addEventListener("visibilitychange", resume);
  stopEquipmentAnimation = () => {
    stopped = true; cancelAnimationFrame(frame);
    document.removeEventListener("visibilitychange", resume);
    playback.onclick = null;
  };
  drawEquipmentBattleFrame(context, sprite, item, isUltimate, 0);
  resume();
}
equipmentPreview.addEventListener("close", () => stopEquipmentAnimation());

function drawEquipmentBattleFrame(c, sprite, item, isUltimate, seconds) {
  if (!isUltimate && item.vipExclusive) return drawVipCombatPreview(c, item, seconds);
  const t = seconds % 10, active = t > 1 && t < 6.5;
  const kind = isUltimate ? ULTIMATE_PREVIEW_EFFECTS[item.id] : "turret";
  const color = isUltimate ? ULTIMATE_GRADE_COLOR[item.grade] : item.color;
  const core = { x: 130, y: 214 };
  const lerp = (a, b, p) => a + (b - a) * Math.max(0, Math.min(1, p));
  const ring = (x, y, radius, alpha = 1, tint = color, width = 2) => {
    c.save(); c.globalAlpha = Math.max(0, Math.min(1, alpha)); c.strokeStyle = tint; c.lineWidth = width;
    c.beginPath(); c.arc(x, y, Math.max(0, radius), 0, Math.PI * 2); c.stroke(); c.restore();
  };
  const line = (x1, y1, x2, y2, width = 3, tint = color, alpha = 1) => {
    c.save(); c.globalAlpha = Math.max(0, Math.min(1, alpha)); c.strokeStyle = tint; c.lineWidth = width;
    c.shadowBlur = 10; c.shadowColor = tint; c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.stroke(); c.restore();
  };
  const dot = (x, y, radius, tint = color) => { c.fillStyle = tint; c.beginPath(); c.arc(x, y, radius, 0, Math.PI * 2); c.fill(); };
  const burst = (x, y, phase, scale = 1) => {
    if (phase < 0 || phase > 1) return;
    ring(x, y, 8 + phase * 38 * scale, 1 - phase, color, 3);
    for (let i = 0; i < 9; i++) { const a = i * Math.PI * 2 / 9; line(x + Math.cos(a) * phase * 40 * scale, y + Math.sin(a) * phase * 40 * scale, x + Math.cos(a) * (phase * 40 + 6) * scale, y + Math.sin(a) * (phase * 40 + 6) * scale, 2, color, 1 - phase); }
  };
  const hpBar = (x, y, hp, tint = "#ff8294", width = 40) => { c.fillStyle = "#162c3b"; c.fillRect(x - width / 2, y, width, 4); c.fillStyle = tint; c.fillRect(x - width / 2, y, width * Math.max(0, Math.min(1, hp)), 4); };
  const symbol = (x, y, label, tint = color) => { c.fillStyle = tint; c.font = "bold 23px system-ui"; c.textAlign = "center"; c.fillText(label, x, y); };
  c.clearRect(0, 0, 720, 400);
  const bg = c.createRadialGradient(310, 210, 20, 310, 210, 460);
  bg.addColorStop(0, "#10283c"); bg.addColorStop(1, "#030a17"); c.fillStyle = bg; c.fillRect(0, 0, 720, 400);
  for (let i = 0; i < 55; i++) { c.globalAlpha = .25 + .15 * Math.sin(seconds + i); dot((i * 137 + 23) % 720, (i * 79 + 17) % 400, i % 3 === 0 ? 1.3 : .7, "#a9d7e8"); } c.globalAlpha = 1;
  ring(core.x, core.y, 82, .15, "#85ceeb"); ring(core.x, core.y, 158, .1, "#85ceeb");
  const frozen = active && ["freeze", "emp"].includes(kind);
  const targets = Array.from({ length: 4 }, (_, i) => {
    let x = 488 + (i % 2) * 115 - (frozen ? 8 : Math.sin(t * .65) * 14), y = [211, 117, 298, 235][i];
    if (kind === "repel" && active) x += Math.min(1, (t - 1) * 2) * 110;
    if ((kind === "blackhole" || item.void) && active) { const p = Math.min(.8, (t - 1) / 5); x = lerp(x, 516, p); y = lerp(y, 211, p); }
    if (item.knockback && t % 1.8 > .85) x += Math.max(0, 1 - (t % 1.8 - .85)) * Math.min(35, item.knockback);
    return { x, y };
  });
  const target = targets[0];
  if (active && ["railgun", "satellite", "chain"].includes(kind)) { ring(target.x, target.y, 29, .7); symbol(target.x, target.y - 40, "BOSS"); }
  const vanished = active && ["gold", "execute"].includes(kind);
  for (const [i, enemy] of targets.entries()) {
    if (vanished && (kind === "gold" || i === 0)) { for (let coin = 0; coin < 3; coin++) symbol(enemy.x + coin * 15 - 15, enemy.y - ((t * 28 + coin * 17) % 70), kind === "gold" ? "◆" : "✦", color); continue; }
    const tint = active && kind === "allies" && i > 0 ? "#80ffc7" : frozen ? "#9eefff" : "#ff8294";
    c.save(); c.translate(enemy.x, enemy.y); c.rotate(Math.PI / 4); c.fillStyle = "#241a30"; c.strokeStyle = tint; c.lineWidth = 2; c.fillRect(-11, -11, 22, 22); c.strokeRect(-11, -11, 22, 22); c.restore();
    hpBar(enemy.x, enemy.y - 25, kind === "execute" && i === 0 ? .1 : !isUltimate && item.damage > 0 && t % 1.8 > .85 ? .6 : 1, tint);
    if (frozen) { ring(enemy.x, enemy.y, 25, .8); symbol(enemy.x, enemy.y + 8, kind === "freeze" ? "❄" : "ϟ"); }
    if (active && ["bounty"].includes(kind)) { ring(enemy.x, enemy.y, 28, .8); symbol(enemy.x, enemy.y - 38, kind === "bounty" ? "◆" : "⌖"); }
  }
  const phase = active && kind === "phase";
  c.save(); c.globalAlpha = phase ? .28 + .12 * Math.sin(t * 6) : 1;
  c.drawImage(sprite, core.x - 76, core.y - 82, 152, 152); c.restore();
  hpBar(core.x, core.y + 53, active && ["heal", "reboot", "fortify"].includes(kind) ? Math.min(1, .3 + (t - 1) * .25) : .65, "#80e8bc", 64);
  const projectile = (p, destination = target, offset = 0, radius = 4, tint = color, curved = false) => {
    const x = lerp(core.x + 38, destination.x, p), y = lerp(core.y + offset, destination.y, p) + (curved ? Math.sin(p * Math.PI) * offset : 0);
    line(x - 12, y, x, y, radius, tint); dot(x, y, radius, "#eaffff");
  };
  const aura = (radius = 55) => { ring(core.x, core.y, radius + Math.sin(t * 3) * 3, .8); ring(core.x, core.y, radius + 9, .25); };
  const healing = () => { for (let i = 0; i < 5; i++) symbol(core.x - 44 + i * 22, core.y + 15 - ((t * 30 + i * 13) % 80), "+", "#80ffc7"); };
  if (!isUltimate) {
    const period = item.id === "gatling" ? .32 : item.id === "full_hp_berserk" ? .7 : item.cooldown || 1.8;
    const shot = t % period, p = shot / Math.min(.85, period * .65), hit = p >= 1;
    if (item.mining) { if (active) for (let i = 0; i < 4; i++) symbol(core.x - 30 + i * 20, core.y - 30 - ((t * 28 + i * 20) % 90), "◆", "#ffd36e"); }
    else if (item.shield || item.id === "emergency_shield") { aura(); const incoming = t % 2 / 2; line(lerp(target.x, core.x + 60, incoming), core.y, lerp(target.x, core.x + 60, incoming) + 13, core.y, 3, "#ff8294"); if (incoming > .8) burst(core.x + 58, core.y, (incoming - .8) * 5); }
    else if (item.beam || item.id === "frost_rail") {
      if (item.id === "charged_laser" && shot < 2.4) ring(core.x + 40, core.y, 4 + shot * 5, .8);
      else { line(core.x + 35, core.y, 690, core.y, 9 + Math.sin(t * 35) * 2, color, .7); line(core.x + 35, core.y, 690, core.y, 2, "#fff"); burst(target.x, target.y, (t * 3) % 1); }
    } else if (item.id === "flame_sprayer") {
      for (let i = 0; i < 24; i++) { const p = (t * 1.4 + i / 24) % 1; dot(lerp(core.x + 35, target.x, p), core.y + Math.sin(i * 9) * p * 60, 3 + p * 9, i % 2 ? "#ff884f" : "#ffd276"); }
    } else if (item.chain && item.id === "chain_arc") {
      if (shot > .5) for (let i = 0; i < 4; i++) { const from = i ? targets[i - 1] : core, to = targets[i]; line(from.x, from.y, (from.x + to.x) / 2, (from.y + to.y) / 2 + Math.sin(t * 40) * 12, 3); line((from.x + to.x) / 2, (from.y + to.y) / 2 + Math.sin(t * 40) * 12, to.x, to.y, 3); }
    } else if (!hit) {
      const count = item.missiles || item.pellets || (item.shadow ? 3 : 1);
      for (let i = 0; i < count; i++) {
        const offset = (i - (count - 1) / 2) * (item.parallel ? 12 : 18);
        const destination = item.missiles ? targets[i % 4] : { x: target.x, y: target.y + (item.parallel || item.pellets > 2 ? offset : 0) };
        if (item.split && p > .45) for (const split of [-1, 1]) projectile(p, { x: target.x, y: target.y + split * (p - .45) * 95 });
        else projectile(p, destination, offset, item.id === "heavy_cannon" ? 8 : 4, color, !!item.homing || !!item.missiles);
      }
    } else {
      burst(target.x, target.y, (shot - Math.min(.85, period * .65)) / .65, item.area ? 1.8 : 1);
      if (item.chain) for (let i = 0; i < 2; i++) line(targets[i].x, targets[i].y, targets[i + 1].x, targets[i + 1].y, 3);
      if (item.cluster) for (let i = 0; i < 3; i++) { const a = i * Math.PI * 2 / 3; burst(target.x + Math.cos(a) * 38, target.y + Math.sin(a) * 38, (shot - .95) / .65); }
      if (item.phaseEcho) burst(target.x + 10, target.y, (shot - 1.15) / .5);
      if (item.lifeSteal) { projectile(1 - Math.min(1, (shot - .85) / .8), target, 0, 4, "#80ffc7"); healing(); }
      if (item.frost) symbol(target.x, target.y + 8, "❄");
      if (item.burn) for (let i = 0; i < 7; i++) dot(target.x + Math.sin(i * 7) * 18, target.y + 8 - ((t * 35 + i * 9) % 42), 3, "#ffad63");
      if (item.weaken || item.vulnerability) { ring(target.x, target.y, 28, .8); symbol(target.x, target.y - 34, item.weaken ? "↓" : "⌖"); }
    }
    if (item.void && active) { ring(516, 211, 36 + Math.sin(t * 5) * 6, .8); dot(516, 211, 24, "#030613"); }
    if (item.slowAura) { ring(target.x, target.y, 90, .4); for (const e of targets) symbol(e.x, e.y - 33, "◴"); }
    if (item.critAura || item.fullHpRate || item.reflect) aura(48);
    if (item.capacitorEvery) { const count = Math.floor(t / period) % item.capacitorEvery; for (let i = 0; i < item.capacitorEvery; i++) dot(core.x - 24 + i * 12, core.y - 55, 3, i <= count ? color : "#294455"); if (count === item.capacitorEvery - 1 && hit) burst(target.x, target.y, (shot - .85) / .7, 2); }
    if (item.tideEvery && Math.floor(t / period) % item.tideEvery === item.tideEvery - 1 && hit) ring(target.x, target.y, (shot - .85) * 120, .7);
  } else if (active) {
    const p = (t - 1) % 1.5 / 1.5;
    switch (kind) {
      case "repel": ring(core.x, core.y, (t - 1) * 310, Math.max(0, 1 - (t - 1) / 2), color, 7); break;
      case "blackhole": dot(516, 211, 30, "#01030b"); for (let i = 0; i < 4; i++) ring(516, 211, 30 + ((i * 20 - t * 24) % 80 + 80) % 80, .7); if (t > 5) burst(516, 211, (t - 5) / 1.5, 4); break;
      case "railgun": case "satellite": line(kind === "railgun" ? core.x : target.x, 0, target.x, target.y, 19, color, .75); line(kind === "railgun" ? core.x : target.x, 0, target.x, target.y, 4, "#fff"); burst(target.x, target.y, p, 2); break;
      case "reverse": for (let i = 0; i < 7; i++) { const q = (p + i / 7) % 1; projectile(q < .5 ? 1 - q * 2 : (q - .5) * 2, targets[i % 4], i * 4, 3, q < .5 ? "#ff8294" : color); } aura(); break;
      case "allies": for (let i = 1; i < 4; i++) line(targets[i].x, targets[i].y, target.x, target.y, 2, "#80ffc7", .5 + .5 * Math.sin(t * 12)); break;
      case "heal": healing(); aura(); break;
      case "reboot": healing(); aura(); ring(core.x, core.y, 65 + p * 55, 1 - p); break;
      case "invulnerable": case "shield": aura(kind === "shield" ? 67 : 53); for (let i = 0; i < 3; i++) { const q = (p + i / 3) % 1; line(lerp(target.x, core.x + 70, q), core.y + i * 12 - 12, lerp(target.x, core.x + 70, q) + 15, core.y + i * 12 - 12, 3, "#ff8294"); } if (kind === "shield") hpBar(core.x, core.y + 61, 1, color, 64); break;
      case "emp": case "freeze": ring(core.x, core.y, p * 620, 1 - p, color, 4); break;
      case "phase": aura(); projectile(1 - p, { x: 680, y: core.y }, 0, 3, "#ff8294"); break;
      case "fortify": aura(68); hpBar(core.x, core.y + 61, 1, color, 64); break;
      case "rapid": case "giant": case "rage": for (let i = 0; i < (kind === "rapid" ? 14 : 5); i++) projectile((p + i / (kind === "rapid" ? 14 : 5)) % 1, targets[i % 4], i * 2, kind === "giant" ? 11 : 4); aura(); if (kind === "rage") { ring(core.x, core.y, 62, .9); hpBar(core.x, core.y + 61, p, color, 64); } if (kind === "fortify") ring(core.x, core.y, 68, .8); break;
      case "absorb": for (let i = 0; i < 5; i++) { const e = targets[i % 4], q = (p + i / 5) % 1; dot(lerp(e.x, core.x, q), lerp(e.y, core.y, q), 4); } aura(50 + p * 12); break;
      case "chain": for (let i = 0; i < 4; i++) { const from = i ? targets[i - 1] : core; line(from.x, from.y, targets[i].x, targets[i].y, 3, color, 1 - p); } break;
      case "mark": aura(); symbol(core.x, core.y - 62, "♢"); line(lerp(target.x, core.x + 55, p), core.y, lerp(target.x, core.x + 55, p) + 14, core.y, 4, "#ff8294"); if (p > .75) { burst(core.x + 50, core.y, (p - .75) * 4); healing(); } break;
      case "execute": ring(core.x, core.y, p * 620, 1 - p, color, 4); break;
      case "gold": aura(); break;
      case "blueprint": for (let i = 0; i < 3; i++) { c.strokeStyle = i < 2 ? color : "#526477"; c.lineWidth = 2; c.strokeRect(320 + i * 92, 160 - Math.sin(t * 2 + i) * 5, 68, 88); symbol(354 + i * 92, 211, i < 2 ? "✓" : "+", i < 2 ? color : "#526477"); } break;
      case "bounty": projectile(p); for (const e of targets) symbol(e.x, e.y - 40 - p * 25, "◆"); break;
      case "explore": ring(core.x, core.y, p * 610, 1 - p); for (let i = 0; i < 4; i++) { symbol(340 + i * 80, 150 + Math.sin(i * 4) * 55 - p * 20, "✦"); } break;
      case "sanctuary": for (let i = 0; i < 3; i++) ring(core.x, core.y, 50 + i * 14 + Math.sin(t * 2) * 4, .7 - i * .15); burst(core.x + 60, core.y, p); break;
    }
  }
  // The loop progress is visual only; numerical effects remain in the item description.
  c.fillStyle = "#183347"; c.fillRect(24, 380, 672, 2); c.fillStyle = color; c.fillRect(24, 380, 672 * t / 10, 2);
}

function addEquipmentPreviewButtons() {
  const t = uxText();
  for (const button of document.querySelectorAll("[data-v2-toggle-details], [data-ultimate-id]")) {
    const card = button.closest("article");
    if (!card || card.querySelector("[data-equipment-preview]")) continue;
    const preview = document.createElement("button");
    preview.className = "equipment-preview-trigger secondary";
    preview.innerHTML = `<span aria-hidden="true">▷</span> ${escapeHtml(t.preview)}`;
    preview.type = "button";
    preview.dataset.equipmentPreview = button.dataset.v2ToggleDetails || button.dataset.ultimateId;
    preview.dataset.previewKind = button.dataset.ultimateId ? "ultimate" : "turret";
    card.append(preview);
  }
}
const progressionBaseRenderWorkshop = renderV2Workshop;
renderV2Workshop = function () { progressionBaseRenderWorkshop(); addEquipmentPreviewButtons(); };
const progressionBaseRenderUltimate = renderUltimateWorkshop;
renderUltimateWorkshop = function () { progressionBaseRenderUltimate(); addEquipmentPreviewButtons(); };

const progressionBaseRenderMeta = renderMetaUpgrades;
renderMetaUpgrades = function () {
  progressionBaseRenderMeta();
  const t = uxText();
  for (const button of document.querySelectorAll("[data-meta]")) {
    const def = META_UPGRADE_DEFS.find(d => d.id === button.dataset.meta);
    if (!def) continue;
    const hint = document.createElement("small");
    hint.className = "meta-next-value";
    const level = getMetaLevel(def.id);
    const increment = def.id === "regen" ? def.step + (Math.pow(level + 1, 1.18) - Math.pow(level, 1.18)) * 0.006 : def.step;
    hint.textContent = `${t.nextValue}: +${uxNumber(def.unit === "%" ? increment * 100 : increment)}${def.unit === "%" ? "%" : ""}`;
    hint.hidden = isMetaUpgradeMaxed(def);
    button.before(hint);
  }
};
const progressionBaseUpdateHud = updateHud;
updateHud = function () { progressionBaseUpdateHud(); renderProgressionGoals(); };
window.addEventListener("space-tower-language-changed", () => {
  renderProgressionGoals(); renderUtilityStore(); renderShop(); renderV2Workshop(); renderUltimateWorkshop();
  enemyIntelRenderedAt = 0;
  refreshCurrentEnemyStats();
  if (equipmentPreview.open) equipmentPreview.close();
});
renderProgressionGoals(); renderUtilityStore(); renderShop(); renderV2Workshop(); renderUltimateWorkshop(); renderMetaUpgrades();
