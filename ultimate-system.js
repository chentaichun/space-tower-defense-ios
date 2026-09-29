/* Space Tower Defense ultimate system.
   One equipped ultimate, five-star progression, 300-second cooldown, monster drops and card packs. */

const ULTIMATE_SAVE_KEY = "spaceTowerUltimateV1";
const ULTIMATE_FRAGMENT_TARGET = 50;
const ULTIMATE_MAX_STARS = 5;
const ULTIMATE_COOLDOWN_SECONDS = 300;
const ULTIMATE_FRAGMENT_PITY_TARGET = 180;
const ULTIMATE_WISHLIST_DROP_RATE = 0.65;
const ULTIMATE_GRADE_DROP = Object.freeze({ A: 0.0002, B: 0.0003, C: 0.0005, D: 0.0007, E: 0.001, F: 0.01 });
const ULTIMATE_GRADE_COLOR = Object.freeze({
  A: "#ff6b8d",
  B: "#ff9b61",
  C: "#ffe06a",
  D: "#77f4b5",
  E: "#70dcff",
  F: "#c290ff"
});

function getUltimateFragmentTarget() {
  const live = Number(window.SPACE_TOWER_RUNTIME_BALANCE?.ultimate?.fragmentTarget);
  return Number.isFinite(live) && live > 0 ? Math.floor(live) : ULTIMATE_FRAGMENT_TARGET;
}

function getUltimateMaxStars() {
  const live = Number(window.SPACE_TOWER_RUNTIME_BALANCE?.ultimate?.maxStars);
  return clamp(Number.isFinite(live) ? Math.floor(live) : ULTIMATE_MAX_STARS, 1, ULTIMATE_MAX_STARS);
}

function getUltimateCooldownSeconds() {
  const live = Number(window.SPACE_TOWER_RUNTIME_BALANCE?.ultimate?.cooldownSeconds);
  return Number.isFinite(live) && live >= 0 ? live : ULTIMATE_COOLDOWN_SECONDS;
}

function getUltimateGradeDrop(grade) {
  const bundled = ULTIMATE_GRADE_DROP[grade] || 0;
  const live = Number(window.SPACE_TOWER_RUNTIME_BALANCE?.ultimate?.gradeDropChance?.[grade]);
  return Number.isFinite(live) && live >= 0 ? Math.min(live, bundled) : bundled;
}

const ULTIMATE_DEFS = Object.freeze([
  { id: "core_self_destruct", grade: "A", icon: "✹", values: [25, 50, 75, 90, 100], unit: "percent" },
  { id: "black_hole_detonation", grade: "B", icon: "◉", values: [1, 3, 5, 7, 9], secondary: [10, 20, 30, 40, 50], unit: "secondsPercent" },
  { id: "coin_railgun", grade: "D", icon: "⌁", values: [2, 3, 5, 8, 10], unit: "multiplier" },
  { id: "barrage_reversal", grade: "F", icon: "↺", values: [1, 3, 5, 7, 10], unit: "seconds" },
  { id: "allegiance_swap", grade: "B", icon: "⇄", values: [1, 3, 5, 7, 10], unit: "seconds" },
  { id: "satellite_judgment", grade: "C", icon: "☄", values: [20, 30, 40, 50, 60], unit: "percent" },
  { id: "system_reboot", grade: "F", icon: "⟳", values: [3, 4, 5, 6, 7], unit: "seconds" },
  { id: "absolute_defense", grade: "E", icon: "⬡", values: [5, 6, 7, 8, 10], unit: "seconds" },
  { id: "nano_first_aid", grade: "C", icon: "✚", values: [20, 40, 60, 80, 100], unit: "percent" },
  { id: "shield_overload", grade: "C", icon: "◇", values: [6, 7, 8, 9, 10], unit: "seconds" },
  { id: "death_mark", grade: "F", icon: "♢", values: [5, 6, 7, 8, 10], unit: "seconds" },
  { id: "global_emp", grade: "D", icon: "ϟ", values: [3, 5, 7, 9, 12], unit: "seconds" },
  { id: "phase_shelter", grade: "F", icon: "◌", values: [5, 10, 15, 20, 25], unit: "seconds" },
  { id: "overclock_a", grade: "B", icon: "A", values: [500, 600, 700, 800, 1000], unit: "percent" },
  { id: "overclock_b", grade: "B", icon: "B", values: [500, 600, 700, 800, 1000], unit: "percent" },
  { id: "giant_barrage", grade: "D", icon: "⬢", values: [5, 6, 7, 8, 10], unit: "seconds" },
  { id: "blood_rage", grade: "A", icon: "♥", values: [5, 6, 7, 8, 10], unit: "seconds" },
  { id: "energy_devourer", grade: "B", icon: "∞", values: [10, 12, 14, 16, 18], unit: "seconds" },
  { id: "frozen_world", grade: "E", icon: "❄", values: [6, 7, 8, 9, 10], unit: "seconds" },
  { id: "execution_aura", grade: "A", icon: "†", values: [15, 20, 25, 30, 50], unit: "percent" },
  { id: "judgment_chain", grade: "B", icon: "⛓", values: [10, 20, 30, 40, 50], unit: "percent" },
  { id: "golden_touch", grade: "C", icon: "◆", values: [1, 2, 3, 4, 5], unit: "multiplier" },
  { id: "emergency_blueprint", grade: "E", icon: "▦", values: [2, 2, 2, 2, 2], unit: "choice" },
  { id: "bounty_order", grade: "F", icon: "◎", values: [5, 6, 7, 8, 10], unit: "seconds" },
  { id: "space_exploration", grade: "E", icon: "✦", values: [5, 6, 7, 8, 10], unit: "seconds" },
  { id: "divine_sanctuary", grade: "A", icon: "✧", values: [10, 30, 50, 70, 100], unit: "percent" }
]);

const ULTIMATE_TEXT = {
  zh: {
    ui: {
      kicker: "ULTIMATE CORE", title: "絕招核心", description: "最多裝備 1 種絕招、最高 5 星；每星需要 50 個同名碎片。主動絕招冷卻 300 秒，碎片可由擊殺與卡包取得。",
      fragments: "碎片", upgrade: "升星", equip: "裝備", equipped: "已裝備", max: "滿星", passive: "被動",
      ready: "就緒", cooldown: "冷卻", noEquipped: "未裝備", unavailable: "目前無法施放", grade: "級",
      starValues: "星級效果", acquired: "獲得絕招碎片", cardPack: "卡包獎勵", chooseTwo: "藍圖緊急實裝：本次三選二",
      bossRequired: "需要 Boss 在場且持有金幣", activated: "絕招啟動", replacement: "已裝備新絕招"
    },
    items: [
      ["核心自爆衝擊", "全螢幕造成巨量傷害，並將所有非 Boss 敵人朝外圍擊退一半距離。"],
      ["黑洞引爆", "戰場中央生成可吸入 Boss 的巨型黑洞，結束時引發全螢幕爆炸。"],
      ["金幣充能軌道砲", "Boss 在場時消耗全部金幣，依金幣數量與星級倍率造成軌道砲傷害。"],
      ["彈幕逆轉雨", "將期間內的敵方遠程彈幕轉化為我方追蹤飛彈。"],
      ["敵友互換", "瞬間將全場非 Boss 敵機轉化為我方友軍。"],
      ["衛星單體天罰", "鎖定 Boss，以貫穿光束削去其一定比例的當前生命。"],
      ["系統強制重啟", "立即回復主砲 30% 生命，並進入無敵狀態。"],
      ["絕對防禦光幕", "展開完全免疫碰撞、光束與彈幕傷害的實體能量罩。"],
      ["奈米機械急救", "立即修復一定比例生命，接著 5 秒內每秒回復最大生命 5%。"],
      ["護盾過載爆破", "獲得最大生命 200% 的臨時護盾；到期時爆發全場 3 秒眩暈。"],
      ["預知死亡印記", "期間受到致命傷時免死，消耗印記並回復 20% 生命。"],
      ["全域 EMP 癱瘓", "清空敵方遠程彈幕並使全場敵人無法移動與攻擊。"],
      ["虛化避難", "主砲暫停攻擊並免疫傷害；副砲仍可繼續作戰。"],
      ["核心極限超頻 A", "8 秒內主砲與副砲攻速 +200%，暴擊傷害提升至星級數值。"],
      ["核心極限超頻 B", "8 秒內最大生命 +200%，並獲得星級數值的絕對防禦。"],
      ["巨人化彈幕", "期間所有實體子彈體積 +100%、傷害翻倍並具有超強擊退。"],
      ["汲血狂暴天賦", "期間每次攻擊造成的 50% 傷害轉化為主砲護盾。"],
      ["噬能者", "期間每擊殺一名敵人，攻速額外 +1%，疊加無上限。"],
      ["冰封萬里", "完全凍結全場敵人，凍結期間承受的物理傷害 +50%。"],
      ["處決光環", "立即斬殺全場生命低於星級門檻的敵人。"],
      ["斷罪連鎖", "連結全場精英與 Boss，將受到傷害的一部分共享給其他連結目標。"],
      ["點石成金", "清除所有藍色普通小怪，並將其剩餘生命依倍率轉化為金幣。"],
      ["藍圖緊急實裝", "手動啟動後，下一次每 25 關的特技卡從三選一改為三選二。"],
      ["懸賞令", "期間擊殺任何敵人均獲得 2 倍金幣；掉落黑曜石時也會翻倍。"],
      ["太空探索", "期間每次擊殺有 50% 機率獲得 1 枚太空幣。"],
      ["神聖庇護", "淨化負面狀態；10 關內下一次致命傷害有星級機率完全無效。"]
    ]
  },
  en: {
    ui: {
      kicker: "ULTIMATE CORE", title: "Ultimate Core", description: "Equip one ultimate and raise it to 5 stars; each star costs 50 matching shards. Active ultimates have a 300-second cooldown, and shards come from kills and card packs.",
      fragments: "Shards", upgrade: "Rank Up", equip: "Equip", equipped: "Equipped", max: "Max", passive: "Passive",
      ready: "Ready", cooldown: "Cooldown", noEquipped: "No ultimate", unavailable: "Cannot activate now", grade: "Grade",
      starValues: "Star effect", acquired: "Ultimate shard acquired", cardPack: "Card pack reward", chooseTwo: "Emergency Blueprint: choose 2 of 3",
      bossRequired: "A boss and some gold are required", activated: "Ultimate activated", replacement: "New ultimate equipped"
    },
    items: [
      ["Core Self-Destruct Shock", "Deals massive screen-wide damage and pushes every non-boss enemy halfway toward the outer edge."],
      ["Black Hole Detonation", "Creates a giant central black hole that can pull bosses, then detonates across the whole field."],
      ["Gold-Charged Orbital Cannon", "While a boss is present, consumes all gold and converts it into orbital damage using the star multiplier."],
      ["Barrage Reversal Rain", "Converts hostile ranged fire during the effect into friendly homing missiles."],
      ["Allegiance Swap", "Instantly converts every non-boss enemy fighter on the field into an ally."],
      ["Satellite Judgment", "Locks onto a boss and removes a percentage of its current HP with a piercing beam."],
      ["Forced System Reboot", "Immediately restores 30% main-turret HP and grants invulnerability."],
      ["Absolute Defense Screen", "Deploys a barrier that fully blocks collisions, beams, and projectile damage."],
      ["Nanomachine First Aid", "Instantly repairs a percentage of HP, then restores 5% max HP per second for 5 seconds."],
      ["Overloaded Shield Burst", "Grants a temporary shield equal to 200% max HP; expiration stuns the entire field for 3 seconds."],
      ["Foreseen Death Mark", "A fatal hit during the effect is negated, consuming the mark and restoring 20% HP."],
      ["Global EMP Shutdown", "Clears hostile ranged fire and prevents all enemies from moving or attacking."],
      ["Phase Shelter", "The main turret stops firing and becomes invulnerable while auxiliary turrets keep attacking."],
      ["Core Limit Overclock A", "For 8 seconds, main and auxiliary fire rate rises by 200% and critical damage reaches the star value."],
      ["Core Limit Overclock B", "For 8 seconds, max HP rises by 200% and absolute defense gains the star value."],
      ["Giant Barrage", "All physical projectiles double in size and damage and gain extreme knockback."],
      ["Blood-Drain Frenzy", "Converts 50% of all attack damage dealt during the effect into a shield for the main turret."],
      ["Energy Devourer", "Each kill during the effect adds 1% fire rate with no stack limit."],
      ["World Freeze", "Freezes every enemy and makes them take 50% more physical damage while frozen."],
      ["Execution Aura", "Instantly executes every enemy below the star-level HP threshold."],
      ["Chain of Condemnation", "Links all elites and bosses, sharing part of received damage with the other linked targets."],
      ["Golden Touch", "Clears all basic blue enemies and converts their remaining HP into gold at the star multiplier."],
      ["Emergency Blueprint Deployment", "Activate manually to change the next 25-wave skill-card draft from choose 1 of 3 to choose 2 of 3."],
      ["Bounty Order", "Kills during the effect grant double gold; any obsidian drop is doubled as well."],
      ["Space Exploration", "Each kill during the effect has a 50% chance to award 1 Space Coin."],
      ["Divine Sanctuary", "Cleanses debuffs; for 10 waves, the next fatal hit has the star chance to be completely negated."]
    ]
  },
  ja: {
    ui: {
      kicker: "アルティメットコア", title: "必殺技コア", description: "必殺技を1つ装備し、最大5★まで強化できます。1★ごとに同名の欠片50個が必要です。クールダウンは300秒で、欠片は撃破とカードパックから入手します。",
      fragments: "欠片", upgrade: "昇星", equip: "装備", equipped: "装備中", max: "最大", passive: "パッシブ",
      ready: "使用可能", cooldown: "再使用", noEquipped: "未装備", unavailable: "現在は発動できません", grade: "グレード",
      starValues: "星効果", acquired: "必殺技の欠片を獲得", cardPack: "カードパック報酬", chooseTwo: "緊急設計図：3枚から2枚選択",
      bossRequired: "Bossとゴールドが必要です", activated: "必殺技発動", replacement: "必殺技を変更しました"
    },
    items: [
      ["コア自爆衝撃", "画面全体に大ダメージを与え、Boss以外の敵を外周に向けて半分の距離だけ押し戻す。"],
      ["ブラックホール爆破", "中央にBossも吸引する巨大ブラックホールを生成し、終了時に全体爆発を起こす。"],
      ["金貨充填軌道砲", "Boss出現中に全ゴールドを消費し、星倍率で軌道砲ダメージへ変換する。"],
      ["弾幕反転雨", "効果中の敵遠距離攻撃を味方の追尾ミサイルへ反転する。"],
      ["敵味方反転", "フィールド上のBoss以外の敵機を瞬時に味方へ変換する。"],
      ["衛星単体天罰", "Bossをロックし、貫通光線で現在HPを割合削減する。"],
      ["システム強制再起動", "主砲HPを即座に30%回復し、無敵状態になる。"],
      ["絶対防御光幕", "衝突・光線・弾幕ダメージを完全に無効化するバリアを展開する。"],
      ["ナノマシン応急修理", "HPを即時割合回復し、その後5秒間、毎秒最大HPの5%を回復する。"],
      ["シールド過負荷爆破", "最大HP200%分の一時シールドを獲得し、終了時に全体を3秒スタンする。"],
      ["予知死亡印", "効果中の致命傷を一度無効化し、印を消費してHPを20%回復する。"],
      ["全域EMP停止", "敵の遠距離攻撃を消去し、全敵の移動と攻撃を停止する。"],
      ["虚相避難", "主砲は攻撃停止して無敵になり、副砲は攻撃を継続する。"],
      ["コア限界オーバークロックA", "8秒間、主砲・副砲の攻速+200%、クリティカルダメージを星数値まで強化する。"],
      ["コア限界オーバークロックB", "8秒間、最大HP+200%、星数値の絶対防御を得る。"],
      ["巨大化弾幕", "実体弾のサイズとダメージを2倍にし、超強力なノックバックを付与する。"],
      ["吸血狂乱", "効果中に与えた攻撃ダメージの50%を主砲シールドへ変換する。"],
      ["エネルギー捕食者", "効果中の撃破1体ごとに攻速+1%。スタック上限なし。"],
      ["万里氷封", "全敵を完全凍結し、凍結中の物理被ダメージを50%増加させる。"],
      ["処刑オーラ", "HPが星数のしきい値未満の全敵を即座に処刑する。"],
      ["断罪連鎖", "全エリートとBossを連結し、受けたダメージの一部を他の連結対象へ共有する。"],
      ["点石成金", "青い通常敵を全消去し、残りHPを星倍率でゴールドへ変換する。"],
      ["設計図緊急実装", "手動発動後、次の25Waveスキルカードで3枚から2枚選べる。"],
      ["懸賞令", "効果中の撃破ゴールドが2倍になり、黒曜石が落ちた場合も2倍になる。"],
      ["宇宙探索", "効果中の撃破ごとに50%でスペースコインを1枚獲得する。"],
      ["神聖加護", "弱体を浄化し、10Wave以内の次の致命傷を星確率で完全無効化する。"]
    ]
  },
  ko: {
    ui: {
      kicker: "궁극기 코어", title: "궁극기 코어", description: "궁극기 1개를 장착하고 최대 5성까지 강화하세요. 별마다 같은 이름의 조각 50개가 필요합니다. 재사용 대기시간은 300초이며 조각은 처치와 카드 팩에서 획득합니다.",
      fragments: "조각", upgrade: "별 상승", equip: "장착", equipped: "장착됨", max: "최대", passive: "패시브",
      ready: "준비", cooldown: "재사용", noEquipped: "미장착", unavailable: "지금은 사용할 수 없습니다", grade: "등급",
      starValues: "별 효과", acquired: "궁극기 조각 획득", cardPack: "카드 팩 보상", chooseTwo: "긴급 설계도: 3개 중 2개 선택",
      bossRequired: "Boss와 골드가 필요합니다", activated: "궁극기 발동", replacement: "궁극기를 교체했습니다"
    },
    items: [
      ["코어 자폭 충격", "화면 전체에 막대한 피해를 주고 Boss가 아닌 모든 적을 바깥쪽 경계까지의 절반 거리만큼 밀어냅니다."],
      ["블랙홀 폭발", "Boss도 끌어당기는 거대 블랙홀을 중앙에 만들고 종료 시 전장 전체를 폭발시킵니다."],
      ["골드 충전 궤도포", "Boss가 있을 때 모든 골드를 소모해 별 배율만큼 궤도포 피해로 바꿉니다."],
      ["탄막 역전의 비", "효과 중 적 원거리 공격을 아군 추적 미사일로 전환합니다."],
      ["적아 교환", "전장의 Boss가 아닌 모든 적 전투기를 즉시 아군으로 바꿉니다."],
      ["위성 단일 천벌", "Boss를 조준해 관통 광선으로 현재 체력을 일정 비율 제거합니다."],
      ["시스템 강제 재시작", "주포 체력을 즉시 30% 회복하고 무적 상태가 됩니다."],
      ["절대 방어 광막", "충돌, 광선, 탄막 피해를 완전히 막는 에너지 장벽을 펼칩니다."],
      ["나노머신 응급처치", "체력을 즉시 일정 비율 회복하고 5초 동안 매초 최대 체력의 5%를 회복합니다."],
      ["보호막 과부하 폭발", "최대 체력 200%의 임시 보호막을 얻고 만료 시 전장을 3초 기절시킵니다."],
      ["예지 사망 표식", "효과 중 치명타를 한 번 무효화하고 표식을 소모해 체력 20%를 회복합니다."],
      ["전역 EMP 마비", "적 원거리 공격을 지우고 모든 적의 이동과 공격을 정지시킵니다."],
      ["위상 대피", "주포는 공격을 멈추고 무적이 되며 보조포는 계속 공격합니다."],
      ["코어 한계 오버클럭 A", "8초 동안 주포와 보조포 공격 속도 +200%, 치명타 피해가 별 수치로 상승합니다."],
      ["코어 한계 오버클럭 B", "8초 동안 최대 체력 +200%, 별 수치의 절대 방어를 얻습니다."],
      ["거대화 탄막", "모든 실탄 크기와 피해를 2배로 만들고 강력한 밀쳐내기를 부여합니다."],
      ["흡혈 광폭 재능", "효과 중 가한 공격 피해의 50%를 주포 보호막으로 전환합니다."],
      ["에너지 포식자", "효과 중 적 처치마다 공격 속도 +1%. 중첩 제한이 없습니다."],
      ["빙결 세계", "모든 적을 완전히 얼리고 빙결 중 받는 물리 피해를 50% 증가시킵니다."],
      ["처형 오라", "체력이 별 단계 기준보다 낮은 모든 적을 즉시 처형합니다."],
      ["단죄의 사슬", "모든 정예와 Boss를 연결해 받은 피해 일부를 다른 연결 대상과 공유합니다."],
      ["연금술", "파란 일반 적을 모두 제거하고 남은 체력을 별 배율만큼 골드로 바꿉니다."],
      ["설계도 긴급 실장", "수동 발동 후 다음 25Wave 스킬 카드에서 3개 중 2개를 선택합니다."],
      ["현상금 명령", "효과 중 처치 골드가 2배가 되며 흑요석이 나오면 그 수도 2배가 됩니다."],
      ["우주 탐사", "효과 중 처치할 때마다 50% 확률로 스페이스 코인 1개를 얻습니다."],
      ["신성한 가호", "약화 효과를 정화하고 10Wave 안의 다음 치명타를 별 확률로 완전히 무효화합니다."]
    ]
  },
  ru: {
    ui: {
      kicker: "ЯДРО УЛЬТЫ", title: "Ультимативное ядро", description: "Можно экипировать одну ульту и улучшить её до 5 звёзд; каждая звезда стоит 50 одноимённых осколков. Перезарядка — 300 секунд, осколки выпадают за убийства и из наборов карт.",
      fragments: "Осколки", upgrade: "Повысить", equip: "Экипировать", equipped: "Экипировано", max: "Макс.", passive: "Пассивно",
      ready: "Готово", cooldown: "Откат", noEquipped: "Не выбрано", unavailable: "Сейчас применить нельзя", grade: "Класс",
      starValues: "Эффект звёзд", acquired: "Получен осколок ульты", cardPack: "Награда набора", chooseTwo: "Экстренный чертёж: выберите 2 из 3",
      bossRequired: "Нужны Boss и золото", activated: "Ульта активирована", replacement: "Ульта заменена"
    },
    items: [
      ["Удар самоуничтожения ядра", "Наносит огромный урон всему экрану и отбрасывает всех врагов, кроме Boss, на полпути к внешнему краю."],
      ["Взрыв чёрной дыры", "Создаёт в центре огромную чёрную дыру, затягивающую даже Boss, а затем взрывает всё поле."],
      ["Золотая орбитальная пушка", "При наличии Boss тратит всё золото и превращает его в орбитальный урон со звёздным множителем."],
      ["Дождь обратного огня", "На время превращает вражеские дальние атаки в союзные самонаводящиеся ракеты."],
      ["Смена сторон", "Мгновенно превращает всех вражеских истребителей, кроме Boss, в союзников."],
      ["Кара спутника", "Поражает Boss лучом и снимает процент его текущего здоровья."],
      ["Принудительная перезагрузка", "Мгновенно восстанавливает 30% здоровья главной башни и даёт неуязвимость."],
      ["Экран абсолютной защиты", "Полностью блокирует урон от столкновений, лучей и снарядов."],
      ["Наноремонт", "Сразу восстанавливает долю здоровья, затем 5 секунд лечит по 5% максимального здоровья в секунду."],
      ["Взрыв перегруженного щита", "Даёт щит на 200% максимального здоровья; при окончании оглушает всё поле на 3 секунды."],
      ["Метка предвиденной смерти", "Смертельный удар расходует метку, отменяется и восстанавливает 20% здоровья."],
      ["Глобальный EMP", "Убирает дальние атаки врагов и останавливает движение и атаки всех противников."],
      ["Фазовое укрытие", "Главная башня перестаёт стрелять и становится неуязвимой, вспомогательные продолжают бой."],
      ["Предельный разгон A", "На 8 секунд повышает скорострельность всех башен на 200%, а критический урон — до звёздного значения."],
      ["Предельный разгон B", "На 8 секунд повышает максимум здоровья на 200% и даёт абсолютную защиту по звёздному значению."],
      ["Гигантский залп", "Удваивает размер и урон физических снарядов и даёт сильнейшее отбрасывание."],
      ["Кровососущая ярость", "Преобразует 50% нанесённого урона в щит главной башни."],
      ["Пожиратель энергии", "Каждое убийство за время эффекта даёт +1% скорострельности без ограничения стаков."],
      ["Ледяной мир", "Полностью замораживает всех врагов и увеличивает получаемый ими физический урон на 50%."],
      ["Аура казни", "Мгновенно уничтожает всех врагов ниже звёздного порога здоровья."],
      ["Цепь осуждения", "Связывает элитных врагов и Boss, разделяя часть урона между остальными связанными целями."],
      ["Золотое касание", "Убирает обычных синих врагов и превращает их оставшееся здоровье в золото со звёздным множителем."],
      ["Экстренное внедрение чертежа", "После ручной активации следующий выбор на 25-й волне позволяет взять 2 карты навыков из 3."],
      ["Ордер на награду", "Убийства дают двойное золото; выпавший обсидиан также удваивается."],
      ["Космическая разведка", "Каждое убийство имеет 50% шанс дать 1 космическую монету."],
      ["Священное покровительство", "Снимает ослабления; в течение 10 волн следующая смертельная атака отменяется со звёздным шансом."]
    ]
  },
  es: {
    ui: {
      kicker: "NÚCLEO DEFINITIVO", title: "Núcleo definitivo", description: "Equipa una definitiva y súbela hasta 5 estrellas; cada estrella cuesta 50 fragmentos iguales. La recarga es de 300 segundos y los fragmentos llegan de bajas y sobres de cartas.",
      fragments: "Fragmentos", upgrade: "Subir estrella", equip: "Equipar", equipped: "Equipado", max: "Máx.", passive: "Pasiva",
      ready: "Lista", cooldown: "Recarga", noEquipped: "Sin definitiva", unavailable: "No se puede activar ahora", grade: "Grado",
      starValues: "Efecto por estrella", acquired: "Fragmento de definitiva obtenido", cardPack: "Recompensa del sobre", chooseTwo: "Plano de emergencia: elige 2 de 3",
      bossRequired: "Se requiere un Boss y oro", activated: "Definitiva activada", replacement: "Definitiva cambiada"
    },
    items: [
      ["Choque de autodestrucción", "Inflige daño masivo a toda la pantalla y empuja a todos los enemigos salvo Boss hasta la mitad del camino hacia el borde exterior."],
      ["Detonación de agujero negro", "Crea un agujero negro central que atrae incluso a Boss y después explota en todo el campo."],
      ["Cañón orbital cargado con oro", "Con un Boss presente, consume todo el oro y lo convierte en daño orbital con el multiplicador estelar."],
      ["Lluvia de fuego invertido", "Convierte los ataques enemigos a distancia en misiles aliados guiados durante el efecto."],
      ["Intercambio de bandos", "Convierte al instante en aliados a todos los cazas enemigos que no sean Boss."],
      ["Castigo satelital", "Fija a un Boss y elimina un porcentaje de su vida actual con un rayo perforante."],
      ["Reinicio forzado del sistema", "Restaura al instante un 30% de vida de la torreta principal y otorga invulnerabilidad."],
      ["Pantalla de defensa absoluta", "Bloquea por completo daño de colisiones, rayos y proyectiles."],
      ["Primeros auxilios nanomecánicos", "Repara al instante un porcentaje de vida y luego cura un 5% de vida máxima por segundo durante 5 segundos."],
      ["Explosión de escudo sobrecargado", "Otorga un escudo de 200% de vida máxima; al terminar aturde todo el campo durante 3 segundos."],
      ["Marca de muerte prevista", "Un golpe mortal consume la marca, se anula y restaura un 20% de vida."],
      ["Apagón EMP global", "Elimina ataques enemigos a distancia e impide que todos los enemigos se muevan o ataquen."],
      ["Refugio de fase", "La torreta principal deja de atacar y se vuelve invulnerable; las auxiliares siguen disparando."],
      ["Sobrecarga límite A", "Durante 8 segundos, las torretas ganan 200% de cadencia y el daño crítico alcanza el valor estelar."],
      ["Sobrecarga límite B", "Durante 8 segundos, la vida máxima sube 200% y la defensa absoluta obtiene el valor estelar."],
      ["Andanada gigante", "Duplica tamaño y daño de los proyectiles físicos y añade un retroceso extremo."],
      ["Frenesí vampírico", "Convierte el 50% del daño infligido durante el efecto en escudo para la torreta principal."],
      ["Devorador de energía", "Cada baja durante el efecto añade 1% de cadencia sin límite de acumulaciones."],
      ["Mundo congelado", "Congela a todos los enemigos y aumenta en 50% el daño físico que reciben."],
      ["Aura de ejecución", "Ejecuta al instante a todos los enemigos por debajo del umbral de vida estelar."],
      ["Cadena de condena", "Enlaza élites y Boss para compartir parte del daño recibido con los demás objetivos enlazados."],
      ["Toque de oro", "Elimina enemigos azules básicos y convierte su vida restante en oro con el multiplicador estelar."],
      ["Despliegue urgente de planos", "Tras activarla manualmente, la próxima selección de cada 25 oleadas permite elegir 2 de 3 cartas de habilidad."],
      ["Orden de recompensa", "Las bajas dan el doble de oro; cualquier obsidiana que caiga también se duplica."],
      ["Exploración espacial", "Cada baja durante el efecto tiene 50% de probabilidad de dar 1 moneda espacial."],
      ["Amparo divino", "Limpia perjuicios; durante 10 oleadas, el siguiente golpe mortal se anula con la probabilidad estelar."]
    ]
  }
};

const ULTIMATE_HEADER_TEXT = {
  zh: "最多裝備 1 種絕招，最高 5 星；每星需要 50 個同名碎片。冷卻 300 秒。",
  en: "Equip one ultimate, upgrade it to 5 stars, and spend 50 matching shards per star. Cooldown: 300 seconds.",
  ja: "必殺技は1つ装備でき、最大5★。1★ごとに同名の欠片50個が必要です。クールダウン：300秒。",
  ko: "필살기 1개를 장착하고 최대 5성까지 강화합니다. 별마다 같은 파편 50개가 필요합니다. 재사용 대기시간: 300초.",
  ru: "Можно установить одну ульту и улучшить её до 5 звёзд. Каждая звезда стоит 50 одинаковых осколков. Перезарядка: 300 секунд.",
  es: "Equipa una definitiva y mejórala hasta 5 estrellas. Cada estrella cuesta 50 fragmentos iguales. Recarga: 300 segundos."
};

const ULTIMATE_WISHLIST_TEXT = Object.freeze({
  zh: { title: "絕招心願", any: "隨機絕招" },
  en: { title: "Ultimate Wishlist", any: "Any ultimate" },
  ja: { title: "必殺技の願望", any: "ランダム必殺技" },
  ko: { title: "필살기 위시리스트", any: "무작위 필살기" },
  ru: { title: "Желаемая ульта", any: "Любая ульта" },
  es: { title: "Definitiva deseada", any: "Cualquier definitiva" }
});

for (const [language, description] of Object.entries(ULTIMATE_HEADER_TEXT)) {
  if (ULTIMATE_TEXT[language]?.ui) ULTIMATE_TEXT[language].ui.description = description;
}

function getUltimateLanguagePack(language = currentLanguage) {
  return ULTIMATE_TEXT[language] || ULTIMATE_TEXT.en;
}

function getUltimateUi() {
  return getUltimateLanguagePack().ui;
}

function getUltimateText(definition, language = currentLanguage) {
  const index = ULTIMATE_DEFS.indexOf(definition);
  return (getUltimateLanguagePack(language).items[index] || ULTIMATE_TEXT.en.items[index]);
}

function createDefaultUltimateProgress() {
  return {
    revision: 0,
    fragments: Object.fromEntries(ULTIMATE_DEFS.map((item) => [item.id, 0])),
    stars: Object.fromEntries(ULTIMATE_DEFS.map((item) => [item.id, 0])),
    equipped: "",
    lifetimeFragments: 0,
    fragmentWishlist: "",
    fragmentPity: 0
  };
}

function normalizeUltimateProgress(raw) {
  const result = createDefaultUltimateProgress();
  if (!raw || typeof raw !== "object") return result;
  result.revision = Math.max(0, Math.floor(Number(raw.revision) || 0));
  for (const definition of ULTIMATE_DEFS) {
    result.fragments[definition.id] = Math.max(0, Math.floor(Number(raw.fragments?.[definition.id]) || 0));
    result.stars[definition.id] = clamp(Math.floor(Number(raw.stars?.[definition.id]) || 0), 0, getUltimateMaxStars());
  }
  result.equipped = ULTIMATE_DEFS.some((item) => item.id === raw.equipped) && result.stars[raw.equipped] > 0
    ? raw.equipped
    : "";
  result.lifetimeFragments = Math.max(0, Math.floor(Number(raw.lifetimeFragments) || 0));
  result.fragmentWishlist = ULTIMATE_DEFS.some((item) => item.id === raw.fragmentWishlist) ? raw.fragmentWishlist : "";
  result.fragmentPity = clamp(Math.floor(Number(raw.fragmentPity) || 0), 0, ULTIMATE_FRAGMENT_PITY_TARGET - 1);
  return result;
}

function loadUltimateProgress() {
  try {
    return normalizeUltimateProgress(JSON.parse(localStorage.getItem(ULTIMATE_SAVE_KEY) || "null"));
  } catch {
    localStorage.removeItem(ULTIMATE_SAVE_KEY);
    return createDefaultUltimateProgress();
  }
}

let ultimateProgress = loadUltimateProgress();
if (DEV_MODE) {
  const orderedDefinitions = [...ULTIMATE_DEFS].sort((left, right) => Number(getUltimateStars(right.id) > 0) - Number(getUltimateStars(left.id) > 0) || (ultimateProgress.fragments[right.id] || 0) - (ultimateProgress.fragments[left.id] || 0) || "ABCDEF".indexOf(left.grade) - "ABCDEF".indexOf(right.grade));
  for (const definition of orderedDefinitions) {
    ultimateProgress.fragments[definition.id] = Math.max(ultimateProgress.fragments[definition.id], 999);
    ultimateProgress.stars[definition.id] = getUltimateMaxStars();
  }
  if (!ultimateProgress.equipped) ultimateProgress.equipped = ULTIMATE_DEFS[0].id;
}

function saveUltimateProgress(options = {}) {
  ultimateProgress = normalizeUltimateProgress(ultimateProgress);
  if (options.bumpRevision !== false) ultimateProgress.revision += 1;
  if (!DEV_MODE) localStorage.setItem(ULTIMATE_SAVE_KEY, JSON.stringify(ultimateProgress));
  renderUltimateWorkshop();
  updateUltimateTrigger();
  if (options.cloud !== false) queueCloudSave({ critical: options.critical === true });
}

function getEquippedUltimate() {
  const definition = ULTIMATE_DEFS.find((item) => item.id === ultimateProgress.equipped);
  if (!definition || ultimateProgress.stars[definition.id] <= 0) return null;
  return definition;
}

function getUltimateStars(id) {
  return clamp(Math.floor(Number(ultimateProgress.stars[id]) || 0), 0, getUltimateMaxStars());
}

function getUltimateValue(definition) {
  const star = getUltimateStars(definition.id);
  return star > 0 ? definition.values[star - 1] : definition.values[0];
}

function formatUltimateValues(definition) {
  const values = definition.values;
  if (definition.unit === "secondsPercent") {
    return `${values.join("/")}s · ${definition.secondary.join("/")}%`;
  }
  if (definition.unit === "seconds") return `${values.join("/")}s`;
  if (definition.unit === "percent") return `${values.join("/")}%`;
  if (definition.unit === "multiplier") return `×${values.join("/")}`;
  if (definition.unit === "choice") return "3 → 2";
  return values.join("/");
}

const ultimateWorkshop = document.createElement("section");
ultimateWorkshop.className = "ultimate-workshop";
ultimateWorkshop.id = "ultimateWorkshop";
const ultimateHomePanel = document.querySelector("#homeUltimatePage .ultimate-home-panel");
if (ultimateHomePanel) ultimateHomePanel.appendChild(ultimateWorkshop);
else turretWorkshopGrid.insertAdjacentElement("afterend", ultimateWorkshop);

const ultimateBattleAura = document.createElement("div");
ultimateBattleAura.className = "ultimate-battle-aura";
ultimateBattleAura.id = "ultimateBattleAura";
document.body.appendChild(ultimateBattleAura);

const ultimateTrigger = document.createElement("button");
ultimateTrigger.type = "button";
ultimateTrigger.className = "ultimate-trigger";
ultimateTrigger.id = "ultimateTrigger";
ultimateTrigger.innerHTML = "<strong></strong><b>✦</b><small></small>";
document.body.appendChild(ultimateTrigger);

function renderUltimateWorkshop() {
  if (!ultimateWorkshop) return;
  const ui = getUltimateUi();
  const wishlistText = ULTIMATE_WISHLIST_TEXT[currentLanguage] || ULTIMATE_WISHLIST_TEXT.en;
  const orderedDefinitions = [...ULTIMATE_DEFS].sort((left, right) => Number(getUltimateStars(right.id) > 0) - Number(getUltimateStars(left.id) > 0) || (ultimateProgress.fragments[right.id] || 0) - (ultimateProgress.fragments[left.id] || 0) || "ABCDEF".indexOf(left.grade) - "ABCDEF".indexOf(right.grade));
  const wishlistOptions = orderedDefinitions.map((definition) => {
    const [name] = getUltimateText(definition);
    return `<option value="${definition.id}" ${ultimateProgress.fragmentWishlist === definition.id ? "selected" : ""}>${definition.grade} · ${escapeHtml(name)}</option>`;
  }).join("");
  ultimateWorkshop.innerHTML = `
    <header class="ultimate-workshop-heading">
      <span>${escapeHtml(ui.kicker)}</span>
      <h3>${escapeHtml(ui.title)}</h3>
      <p>${escapeHtml(ui.description)}</p>
    </header>
    <section class="fragment-wishlist-panel ultimate-wishlist-panel">
      <div class="fragment-wishlist-copy"><strong>${escapeHtml(wishlistText.title)}</strong></div>
      <select data-ultimate-fragment-wishlist aria-label="${escapeHtml(wishlistText.title)}"><option value="">${escapeHtml(wishlistText.any)}</option>${wishlistOptions}</select>
    </section>
    <div class="ultimate-grid"></div>`;
  const grid = ultimateWorkshop.querySelector(".ultimate-grid");
  for (const definition of orderedDefinitions) {
    const [name, description] = getUltimateText(definition);
    const stars = getUltimateStars(definition.id);
    const fragments = ultimateProgress.fragments[definition.id];
    const equipped = ultimateProgress.equipped === definition.id;
    const maxStars = getUltimateMaxStars();
    const fragmentTarget = getUltimateFragmentTarget();
    const canUpgrade = stars < maxStars && fragments >= fragmentTarget;
    const action = canUpgrade ? "upgrade" : stars > 0 ? "equip" : "locked";
    const actionLabel = canUpgrade ? ui.upgrade : equipped ? ui.equipped : stars > 0 ? ui.equip : ui.upgrade;
    const actionDisabled = action === "locked" || (action === "equip" && equipped);
    const card = document.createElement("article");
    card.className = `ultimate-card${equipped ? " equipped" : ""}`;
    card.style.setProperty("--ultimate-color", ULTIMATE_GRADE_COLOR[definition.grade]);
    card.innerHTML = `
      <div class="ultimate-card-top">
        <div class="ultimate-icon">${definition.icon}</div>
        <div class="ultimate-card-title"><span>${escapeHtml(ui.grade)} ${definition.grade}</span><b>${escapeHtml(name)}</b></div>
        <div class="ultimate-stars">${"★".repeat(stars)}${"☆".repeat(maxStars - stars)}</div>
      </div>
      <p>${escapeHtml(description)}</p>
      <div class="ultimate-values">${escapeHtml(ui.starValues)} · ${escapeHtml(formatUltimateValues(definition))}</div>
      <div class="ultimate-progress" style="--progress:${Math.min(100, fragments / fragmentTarget * 100)}%"><i></i></div>
      <div class="ultimate-actions">
        <small>${escapeHtml(ui.fragments)} ${fragments} / ${fragmentTarget}</small>
        <button type="button" data-ultimate-action="${action}" data-ultimate-id="${definition.id}" class="${canUpgrade ? "" : "secondary"}" ${actionDisabled ? "disabled" : ""}>${escapeHtml(actionLabel)}</button>
      </div>`;
    grid.appendChild(card);
  }
}

ultimateWorkshop.addEventListener("click", (event) => {
  const button = event.target.closest("[data-ultimate-id]");
  if (!button || button.disabled) return;
  const definition = ULTIMATE_DEFS.find((item) => item.id === button.dataset.ultimateId);
  if (!definition) return;
  if (button.dataset.ultimateAction === "upgrade") {
    const fragmentTarget = getUltimateFragmentTarget();
    if (ultimateProgress.fragments[definition.id] < fragmentTarget || getUltimateStars(definition.id) >= getUltimateMaxStars()) return;
    ultimateProgress.fragments[definition.id] -= fragmentTarget;
    ultimateProgress.stars[definition.id] += 1;
    if (!ultimateProgress.equipped) ultimateProgress.equipped = definition.id;
    saveUltimateProgress({ critical: true });
    return;
  }
  if (button.dataset.ultimateAction === "equip" && getUltimateStars(definition.id) > 0) {
    ultimateProgress.equipped = definition.id;
    saveUltimateProgress({ critical: true });
    showTaskToast(getUltimateUi().replacement, getUltimateText(definition)[0]);
  }
});

ultimateWorkshop.addEventListener("change", (event) => {
  const select = event.target.closest("[data-ultimate-fragment-wishlist]");
  if (!select) return;
  ultimateProgress.fragmentWishlist = ULTIMATE_DEFS.some((item) => item.id === select.value) ? select.value : "";
  saveUltimateProgress({ critical: true });
  window.spaceTowerTrackEvent?.("fragment_wishlist_changed", { system: "ultimate", item_id: ultimateProgress.fragmentWishlist || "any" });
});

function grantUltimateFragment(definition, sourceLabel, enemy = null) {
  if (!definition) return false;
  ultimateProgress.fragments[definition.id] += 1;
  ultimateProgress.lifetimeFragments += 1;
  ultimateProgress.fragmentPity = 0;
  if (runStats) runStats.ultimateFragments = (runStats.ultimateFragments || 0) + 1;
  const [name] = getUltimateText(definition);
  showTaskToast(sourceLabel, `${definition.icon} ${name} · ${ultimateProgress.fragments[definition.id]} / ${getUltimateFragmentTarget()}`);
  if (enemy && scorePopups) {
    pushVisualEffect(scorePopups, 56, { x: enemy.x, y: enemy.y - enemy.size * 2.9, vy: -16, life: 0.95, text: `${definition.icon} ${name}`, color: ULTIMATE_GRADE_COLOR[definition.grade] });
  }
  saveUltimateProgress({ cloud: false });
  queueCloudSave();
  window.spaceTowerTrackEvent?.("fragment_awarded", { system: "ultimate", item_id: definition.id, grade: definition.grade, source: enemy ? "enemy_drop" : "card_pack" });
  return true;
}

function maybeDropUltimateFragment(enemy) {
  ultimateProgress.fragmentPity = Math.min(ULTIMATE_FRAGMENT_PITY_TARGET, ultimateProgress.fragmentPity + 1);
  const guaranteed = ultimateProgress.fragmentPity >= ULTIMATE_FRAGMENT_PITY_TARGET;
  const wished = ULTIMATE_DEFS.find((item) => item.id === ultimateProgress.fragmentWishlist);
  const pool = wished ? ULTIMATE_DEFS.filter((item) => item.id !== wished.id) : ULTIMATE_DEFS;
  const definition = wished && (guaranteed || Math.random() < ULTIMATE_WISHLIST_DROP_RATE)
    ? wished
    : pool[Math.floor(Math.random() * pool.length)];
  if (!definition || (!guaranteed && Math.random() >= getUltimateGradeDrop(definition.grade))) {
    if (!DEV_MODE && ultimateProgress.fragmentPity % 10 === 0) localStorage.setItem(ULTIMATE_SAVE_KEY, JSON.stringify(normalizeUltimateProgress(ultimateProgress)));
    return false;
  }
  return grantUltimateFragment(definition, getUltimateUi().acquired, enemy);
}

function grantUltimateCardPack() {
  const wished = ULTIMATE_DEFS.find((item) => item.id === ultimateProgress.fragmentWishlist);
  if (wished && Math.random() < ULTIMATE_WISHLIST_DROP_RATE) return grantUltimateFragment(wished, getUltimateUi().cardPack);
  const gradeEntries = ["A", "B", "C", "D", "E", "F"].map((grade) => [grade, getUltimateGradeDrop(grade)]);
  const totalWeight = gradeEntries.reduce((sum, [, weight]) => sum + weight, 0);
  let roll = Math.random() * totalWeight;
  let selectedGrade = "F";
  for (const [grade, weight] of gradeEntries) {
    roll -= weight;
    if (roll <= 0) {
      selectedGrade = grade;
      break;
    }
  }
  const candidates = ULTIMATE_DEFS.filter((item) => item.grade === selectedGrade);
  return grantUltimateFragment(candidates[Math.floor(Math.random() * candidates.length)], getUltimateUi().cardPack);
}

window.grantSpaceTowerUltimateFragments = (ultimateId, amount = 1, source = "external") => {
  const definition = ULTIMATE_DEFS.find((item) => item.id === ultimateId);
  const safeAmount = Math.max(0, Math.floor(Number(amount) || 0));
  if (!definition || safeAmount <= 0) return false;
  ultimateProgress.fragments[definition.id] += safeAmount;
  ultimateProgress.lifetimeFragments += safeAmount;
  saveUltimateProgress({ critical: true });
  window.spaceTowerTrackEvent?.("ultimate_fragments_awarded", { ultimate_id: definition.id, amount: safeAmount, source });
  return true;
};
window.getSpaceTowerUltimateIds = () => ULTIMATE_DEFS.map((item) => item.id);

const ultimateBaseGetLocalSavePayload = getLocalSavePayload;
getLocalSavePayload = function () {
  return { ...ultimateBaseGetLocalSavePayload(), ultimateProgress: normalizeUltimateProgress(ultimateProgress) };
};

const ultimateBaseGetStableSavePayload = getStableSavePayload;
getStableSavePayload = function () {
  const stable = JSON.parse(ultimateBaseGetStableSavePayload());
  stable.ultimateProgress = normalizeUltimateProgress(ultimateProgress);
  return JSON.stringify(stable);
};

const ultimateBaseApplyCloudSave = applyCloudSave;
applyCloudSave = function (save, options = {}) {
  ultimateBaseApplyCloudSave(save, options);
  if (!save?.ultimateProgress) return;
  const remote = normalizeUltimateProgress(save.ultimateProgress);
  if (options.replaceLocalProgress === true) {
    ultimateProgress = remote;
  } else {
    const local = normalizeUltimateProgress(ultimateProgress);
    const remoteIsNewer = remote.revision > local.revision;
    const legacyMigration = local.revision === 0 && remote.revision === 0 && local.lifetimeFragments === 0 && remote.lifetimeFragments > 0;
    ultimateProgress = remoteIsNewer || legacyMigration ? remote : local;
  }
  localStorage.setItem(ULTIMATE_SAVE_KEY, JSON.stringify(ultimateProgress));
  renderUltimateWorkshop();
  updateUltimateTrigger();
};

function createUltimateRuntime() {
  return {
    cooldownRemaining: 0,
    invulnerableTimer: 0,
    barrageReversalTimer: 0,
    nanoHealTimer: 0,
    nanoHealPerSecond: 0,
    shieldHp: 0,
    shieldTimer: 0,
    deathMarkTimer: 0,
    phaseTimer: 0,
    overclockATimer: 0,
    overclockAValue: 0,
    overclockBTimer: 0,
    overclockBValue: 0,
    overclockBBaseMaxHp: 0,
    giantTimer: 0,
    bloodRageTimer: 0,
    energyTimer: 0,
    energyStacks: 0,
    frozenTimer: 0,
    chainTimer: 0,
    chainRatio: 0,
    bountyTimer: 0,
    explorationTimer: 0,
    blueprintArmed: false,
    blackHole: null,
    divineUntilWave: 0,
    divineChance: 0,
    divineReady: false
  };
}

function normalizeUltimateRuntime(raw) {
  const result = createUltimateRuntime();
  if (!raw || typeof raw !== "object") return result;
  for (const key of Object.keys(result)) {
    if (key === "blackHole") continue;
    if (typeof result[key] === "boolean") result[key] = Boolean(raw[key]);
    else result[key] = Math.max(0, Number(raw[key]) || 0);
  }
  if (raw.blackHole && typeof raw.blackHole === "object") {
    result.blackHole = {
      remaining: Math.max(0, Number(raw.blackHole.remaining) || 0),
      max: Math.max(0.01, Number(raw.blackHole.max) || 0.01),
      damagePercent: clamp(Number(raw.blackHole.damagePercent) || 0, 0, 1)
    };
  }
  return result;
}

let ultimateRuntime = createUltimateRuntime();
let ultimateSharedDamageGuard = false;
let ultimateCardPicksRemaining = 1;
let ultimateTriggerStamp = "";

function setUltimateAura(definition, active) {
  const color = definition ? ULTIMATE_GRADE_COLOR[definition.grade] : "#7fe8ff";
  ultimateBattleAura.style.setProperty("--ultimate-color", color);
  ultimateBattleAura.classList.toggle("active", Boolean(active));
}

function updateUltimateTrigger() {
  if (!ultimateTrigger) return;
  const definition = getEquippedUltimate();
  const ui = getUltimateUi();
  const [name] = definition ? getUltimateText(definition) : [ui.title];
  const cooldown = Math.max(0, ultimateRuntime.cooldownRemaining);
  const status = !definition ? ui.noEquipped : cooldown > 0 ? `${Math.ceil(cooldown)}s` : ui.ready;
  const stamp = `${currentLanguage}|${definition?.id || ""}|${Math.ceil(cooldown)}|${gameStarted}|${running}`;
  if (stamp === ultimateTriggerStamp) return;
  ultimateTriggerStamp = stamp;
  ultimateTrigger.style.setProperty("--ultimate-color", definition ? ULTIMATE_GRADE_COLOR[definition.grade] : "#7fe8ff");
  ultimateTrigger.querySelector("strong").textContent = name;
  ultimateTrigger.querySelector("b").textContent = definition?.icon || "✦";
  ultimateTrigger.querySelector("small").textContent = status;
  ultimateTrigger.disabled = !definition || cooldown > 0 || !gameStarted || !running;
  ultimateTrigger.classList.toggle("ready", Boolean(definition && cooldown <= 0));
  ultimateTrigger.classList.toggle("cooling", cooldown > 0);
  ultimateTrigger.setAttribute("aria-label", `${name} · ${status}`);
}

function addUltimateShockwave(color, scale = 1) {
  pushVisualEffect(shockwaves, 48, {
    x: tower.x,
    y: tower.y,
    r: tower.radius * 0.6,
    life: 1.05,
    maxLife: 1.05,
    color,
    emp: true,
    ultimateScale: scale
  });
  shake = Math.max(shake, 9 * scale);
}

function getLivingBoss() {
  return enemies.find((enemy) => enemy.isBoss && enemy.hp > 0) || null;
}

function stunAllEnemies(duration) {
  for (const enemy of enemies) {
    if (enemy.hp > 0) enemy.ultimateStunTime = Math.max(enemy.ultimateStunTime || 0, duration);
  }
}

function executeUltimate(definition) {
  const value = getUltimateValue(definition);
  const color = ULTIMATE_GRADE_COLOR[definition.grade];
  if (definition.id === "coin_railgun" && (!getLivingBoss() || gold <= 0)) {
    showTaskToast(getUltimateUi().unavailable, getUltimateUi().bossRequired);
    return false;
  }

  switch (definition.id) {
    case "core_self_destruct": {
      for (const enemy of enemies) {
        if (enemy.hp <= 0) continue;
        applyEnemyDamage(enemy, Math.max(1, Math.round(enemy.maxHp * value / 100)), "area", enemy.x, enemy.y, color, true);
        if (!enemy.isBoss && enemy.hp > 0) {
          const angle = Math.atan2(enemy.y - tower.y, enemy.x - tower.x);
          const edgeDistance = Math.max(width, height);
          enemy.x += (tower.x + Math.cos(angle) * edgeDistance - enemy.x) * getKnockbackScale(enemy);
          enemy.y += (tower.y + Math.sin(angle) * edgeDistance - enemy.y) * getKnockbackScale(enemy);
        }
      }
      addUltimateShockwave(color, 2.4);
      break;
    }
    case "black_hole_detonation": {
      ultimateRuntime.blackHole = {
        remaining: value,
        max: value,
        damagePercent: definition.secondary[getUltimateStars(definition.id) - 1] / 100
      };
      setUltimateAura(definition, true);
      break;
    }
    case "coin_railgun": {
      const boss = getLivingBoss();
      const spent = Math.max(0, gold);
      gold = 0;
      laserBeams.push({ x1: tower.x, y1: 0, x2: boss.x, y2: boss.y, life: 0.82, maxLife: 0.82, color, innerColor: "#ffffff", width: 18 });
      applyEnemyDamage(boss, Math.max(1, Math.round(spent * value)), "magic", boss.x, boss.y, color, true);
      addUltimateShockwave(color, 1.8);
      break;
    }
    case "barrage_reversal":
      ultimateRuntime.barrageReversalTimer = value;
      break;
    case "allegiance_swap": {
      const targets = enemies.filter((enemy) => !enemy.isBoss && enemy.hp > 0);
      for (const enemy of targets) {
        enemy.hp = 0;
        enemy.rewarded = true;
        v2ConvertedFighters.push({ x: enemy.x, y: enemy.y, life: value, target: getLivingBoss() });
      }
      addUltimateShockwave(color, 1.5);
      break;
    }
    case "satellite_judgment": {
      const boss = getLivingBoss();
      if (boss) {
        laserBeams.push({ x1: boss.x, y1: -120, x2: boss.x, y2: boss.y, life: 0.9, maxLife: 0.9, color, innerColor: "#ffffff", width: 24 });
        const damage = Math.max(1, Math.round(boss.hp * value / 100));
        boss.hp -= damage;
        runStats.damageDealt += damage;
        createHit(boss.x, boss.y, boss, damage, color, true, "magic");
        if (boss.hp <= 0) awardEnemyGold(boss);
      } else {
        showTaskToast(getUltimateUi().unavailable, getUltimateUi().bossRequired);
        return false;
      }
      break;
    }
    case "system_reboot":
      coreHp = Math.min(towerStats.maxHp, coreHp + towerStats.maxHp * 0.3);
      ultimateRuntime.invulnerableTimer = Math.max(ultimateRuntime.invulnerableTimer, value);
      addUltimateShockwave(color, 1.4);
      break;
    case "absolute_defense":
      ultimateRuntime.invulnerableTimer = Math.max(ultimateRuntime.invulnerableTimer, value);
      setUltimateAura(definition, true);
      break;
    case "nano_first_aid":
      coreHp = Math.min(towerStats.maxHp, coreHp + towerStats.maxHp * value / 100);
      ultimateRuntime.nanoHealTimer = 5;
      ultimateRuntime.nanoHealPerSecond = towerStats.maxHp * 0.05;
      addUltimateShockwave(color, 1);
      break;
    case "shield_overload":
      ultimateRuntime.shieldHp = towerStats.maxHp * 2;
      ultimateRuntime.shieldTimer = value;
      setUltimateAura(definition, true);
      break;
    case "death_mark":
      ultimateRuntime.deathMarkTimer = value;
      break;
    case "global_emp":
      laserBeams = [];
      stunAllEnemies(value);
      addUltimateShockwave(color, 2);
      break;
    case "phase_shelter":
      ultimateRuntime.phaseTimer = value;
      setUltimateAura(definition, true);
      break;
    case "overclock_a":
      ultimateRuntime.overclockATimer = 8;
      ultimateRuntime.overclockAValue = value;
      break;
    case "overclock_b":
      ultimateRuntime.overclockBTimer = 8;
      ultimateRuntime.overclockBValue = value;
      ultimateRuntime.overclockBBaseMaxHp = towerStats.maxHp;
      towerStats.maxHp *= 3;
      coreHp += ultimateRuntime.overclockBBaseMaxHp * 2;
      break;
    case "giant_barrage":
      ultimateRuntime.giantTimer = value;
      break;
    case "blood_rage":
      ultimateRuntime.bloodRageTimer = value;
      break;
    case "energy_devourer":
      ultimateRuntime.energyTimer = value;
      ultimateRuntime.energyStacks = 0;
      break;
    case "frozen_world":
      ultimateRuntime.frozenTimer = value;
      stunAllEnemies(value);
      addUltimateShockwave(color, 1.8);
      break;
    case "execution_aura":
      for (const enemy of enemies) {
        if (enemy.hp > 0 && enemy.hp / Math.max(1, enemy.maxHp) < value / 100) {
          enemy.hp = 0;
          awardEnemyGold(enemy);
        }
      }
      addUltimateShockwave(color, 1.5);
      break;
    case "judgment_chain":
      ultimateRuntime.chainTimer = 10;
      ultimateRuntime.chainRatio = value / 100;
      break;
    case "golden_touch": {
      let convertedGold = 0;
      for (const enemy of enemies) {
        if (enemy.type !== "basic" || enemy.hp <= 0) continue;
        convertedGold += Math.max(0, Math.round(enemy.hp * value));
        enemy.hp = 0;
        enemy.rewarded = true;
      }
      gold += convertedGold;
      runStats.goldEarned += convertedGold;
      pushVisualEffect(scorePopups, 56, { x: tower.x, y: tower.y - tower.radius * 3, vy: -18, life: 0.9, text: `+${formatGold(convertedGold)}`, color });
      addUltimateShockwave(color, 1.4);
      break;
    }
    case "emergency_blueprint":
      ultimateRuntime.blueprintArmed = true;
      break;
    case "bounty_order":
      ultimateRuntime.bountyTimer = value;
      break;
    case "space_exploration":
      ultimateRuntime.explorationTimer = value;
      break;
    case "divine_sanctuary":
      for (const enemy of enemies) {
        enemy.v2Weaken = 0;
        enemy.frostSlow = 0;
        enemy.frostTime = 0;
      }
      ultimateRuntime.divineUntilWave = wave + 10;
      ultimateRuntime.divineChance = value / 100;
      ultimateRuntime.divineReady = true;
      break;
    default:
      return false;
  }

  ultimateRuntime.cooldownRemaining = getUltimateCooldownSeconds();
  const [name] = getUltimateText(definition);
  showTaskToast(getUltimateUi().activated, name);
  addUltimateShockwave(color, 0.8);
  updateHud();
  updateUltimateTrigger();
  saveActiveRunCheckpoint();
  return true;
}

function activateEquippedUltimate() {
  const definition = getEquippedUltimate();
  if (!definition || ultimateRuntime.cooldownRemaining > 0 || !gameStarted || !running || isPaused || choosingCard) return false;
  return executeUltimate(definition);
}

ultimateTrigger.addEventListener("click", activateEquippedUltimate);

function redirectHostileShot(context, damage) {
  const source = context?.sourceEnemy;
  const target = source && source.hp > 0 ? source : findPriorityEnemy();
  if (!target) return;
  const angle = Math.atan2(target.y - tower.y, target.x - tower.x);
  bullets.push({
    x: tower.x,
    y: tower.y,
    vx: Math.cos(angle) * TOWER_BASE.projectileSpeed * 1.25,
    vy: Math.sin(angle) * TOWER_BASE.projectileSpeed * 1.25,
    r: 6,
    damage: Math.max(1, Math.round(damage * 2 + getPhysicalDamage() * 0.5)),
    damageType: "magic",
    source: "ultimate",
    sourceKind: "barrage_reversal",
    ultimateHomingTarget: target,
    color: ULTIMATE_GRADE_COLOR.F,
    life: 2.2,
    trail: []
  });
}

const ultimateBaseApplyCoreDamage = applyCoreDamage;
applyCoreDamage = function (damage, x = tower.x, y = tower.y, context = {}) {
  const rawDamage = Math.max(0, Number(damage) || 0);
  if (rawDamage <= 0) return 0;
  if (ultimateRuntime.barrageReversalTimer > 0 && context.ranged) {
    redirectHostileShot(context, rawDamage);
    return 0;
  }
  if (ultimateRuntime.invulnerableTimer > 0 || ultimateRuntime.phaseTimer > 0) return 0;

  let remaining = rawDamage;
  if (ultimateRuntime.overclockBTimer > 0) {
    remaining *= 100 / (100 + ultimateRuntime.overclockBValue);
  }
  if (ultimateRuntime.shieldHp > 0) {
    const absorbed = Math.min(ultimateRuntime.shieldHp, remaining);
    ultimateRuntime.shieldHp -= absorbed;
    remaining -= absorbed;
    pushVisualEffect(scorePopups, 56, { x, y: y - 18, vy: -14, life: 0.45, text: `SHIELD -${Math.round(absorbed)}`, color: "#7fe8ff" });
  }
  if (remaining <= 0.001) return rawDamage;

  const before = coreHp;
  const result = ultimateBaseApplyCoreDamage(remaining, x, y, context);
  if (coreHp <= 0 && ultimateRuntime.deathMarkTimer > 0) {
    ultimateRuntime.deathMarkTimer = 0;
    coreHp = Math.max(1, towerStats.maxHp * 0.2);
    showTaskToast(getUltimateText(ULTIMATE_DEFS.find((item) => item.id === "death_mark"))[0], "HP 20%");
  } else if (
    coreHp <= 0
    && ultimateRuntime.divineReady
    && wave <= ultimateRuntime.divineUntilWave
    && Math.random() < ultimateRuntime.divineChance
  ) {
    ultimateRuntime.divineReady = false;
    coreHp = Math.max(1, before);
    showTaskToast(getUltimateText(ULTIMATE_DEFS.find((item) => item.id === "divine_sanctuary"))[0], getUltimateUi().ready);
  }
  return result;
};

function applyGiantProjectileEffect(startIndex) {
  if (ultimateRuntime.giantTimer <= 0) return;
  for (let index = startIndex; index < bullets.length; index += 1) {
    const bullet = bullets[index];
    if (!bullet || bullet.ultimateGiant) continue;
    bullet.ultimateGiant = true;
    bullet.r *= 2;
    bullet.damage *= 2;
    bullet.v2Knockback = Math.max(90, Number(bullet.v2Knockback) || 0);
    bullet.color = "#ffd36e";
  }
}

const ultimateBaseFireAt = fireAt;
fireAt = function (target) {
  if (ultimateRuntime.phaseTimer > 0) return;
  const before = bullets.length;
  ultimateBaseFireAt(target);
  applyGiantProjectileEffect(before);
};

const ultimateBasePushWorkshopBullet = pushWorkshopBullet;
pushWorkshopBullet = function (...args) {
  const before = bullets.length;
  ultimateBasePushWorkshopBullet(...args);
  applyGiantProjectileEffect(before);
};

const ultimateBaseGetAttackSpeed = getAttackSpeed;
getAttackSpeed = function () {
  let value = ultimateBaseGetAttackSpeed();
  if (ultimateRuntime.overclockATimer > 0) value *= 3;
  if (ultimateRuntime.energyTimer > 0) value *= 1 + ultimateRuntime.energyStacks * 0.01;
  return value;
};

const ultimateBaseGetCritDamage = getCritDamage;
getCritDamage = function () {
  const value = ultimateBaseGetCritDamage();
  return ultimateRuntime.overclockATimer > 0 ? Math.max(value, ultimateRuntime.overclockAValue / 100) : value;
};

const ultimateBaseApplyEnemyDamage = applyEnemyDamage;
applyEnemyDamage = function (enemy, rawDamage, damageType, x, y, popupColor = "#ffffff", critical = false) {
  let adjusted = rawDamage;
  if (ultimateRuntime.frozenTimer > 0 && damageType === "physical") adjusted *= 1.5;
  const dealt = ultimateBaseApplyEnemyDamage(enemy, adjusted, damageType, x, y, popupColor, critical);
  if (dealt > 0 && ultimateRuntime.bloodRageTimer > 0) {
    ultimateRuntime.shieldHp += dealt * 0.5;
  }
  if (dealt > 0 && ultimateRuntime.chainTimer > 0 && !ultimateSharedDamageGuard && (enemy.isBoss || enemy.type !== "basic")) {
    const linked = enemies.filter((item) => item !== enemy && item.hp > 0 && (item.isBoss || item.type !== "basic"));
    if (linked.length) {
      ultimateSharedDamageGuard = true;
      const sharedPerTarget = dealt * ultimateRuntime.chainRatio / linked.length;
      for (const target of linked) ultimateBaseApplyEnemyDamage(target, sharedPerTarget, "area", target.x, target.y, "#ff9b61");
      ultimateSharedDamageGuard = false;
    }
  }
  return dealt;
};

const ultimateBaseAwardEnemyGold = awardEnemyGold;
awardEnemyGold = function (enemy) {
  if (enemy.rewarded) return;
  const goldBefore = gold;
  const obsidianBefore = obsidian;
  ultimateBaseAwardEnemyGold(enemy);
  if (!enemy.rewarded) return;
  const earnedGold = Math.max(0, gold - goldBefore);
  const earnedObsidian = Math.max(0, obsidian - obsidianBefore);
  if (ultimateRuntime.bountyTimer > 0) {
    gold += earnedGold;
    runStats.goldEarned += earnedGold;
    if (earnedObsidian > 0) {
      obsidian += earnedObsidian;
      runStats.obsidianEarned += earnedObsidian;
      saveObsidian();
    }
  }
  if (ultimateRuntime.explorationTimer > 0 && Math.random() < 0.5) {
    spaceCoins += 1;
    saveSpaceCoins();
    pushVisualEffect(scorePopups, 56, { x: enemy.x, y: enemy.y - enemy.size * 2.35, vy: -15, life: 0.7, text: "+1 SC", color: "#70dcff" });
  }
  if (ultimateRuntime.energyTimer > 0) ultimateRuntime.energyStacks += 1;
  maybeDropUltimateFragment(enemy);
};

function tickUltimateTimer(key, dt) {
  ultimateRuntime[key] = Math.max(0, (Number(ultimateRuntime[key]) || 0) - dt);
}

function updateUltimateBlackHole(dt) {
  const blackHole = ultimateRuntime.blackHole;
  if (!blackHole) return;
  blackHole.remaining -= dt;
  const centerX = width * 0.5;
  const centerY = height * 0.5;
  const radius = Math.max(width, height) * 0.78;
  for (const enemy of enemies) {
    if (enemy.hp <= 0) continue;
    const dx = centerX - enemy.x;
    const dy = centerY - enemy.y;
    const distance = Math.max(1, Math.hypot(dx, dy));
    const pull = (enemy.isBoss ? 150 : 520) * (1 - Math.min(1, distance / radius));
    enemy.x += dx / distance * pull * dt;
    enemy.y += dy / distance * pull * dt;
  }
  if (blackHole.remaining > 0) return;
  for (const enemy of enemies) {
    if (enemy.hp <= 0) continue;
    applyEnemyDamage(enemy, Math.max(1, Math.round(enemy.maxHp * blackHole.damagePercent)), "area", enemy.x, enemy.y, "#ff9b61", true);
  }
  pushVisualEffect(shockwaves, 48, { x: centerX, y: centerY, r: 12, life: 1.25, maxLife: 1.25, color: "#c290ff", emp: true, ultimateScale: 2.5 });
  ultimateRuntime.blackHole = null;
}

function prepareUltimateEnemyState(dt) {
  for (const enemy of enemies) {
    if ((enemy.ultimateStunTime || 0) <= 0) continue;
    enemy._ultimateBaseSpeed = enemy.speed;
    enemy.speed = 0;
    enemy.blindTime = Math.max(enemy.blindTime || 0, dt + 0.15);
    if (Number.isFinite(enemy.beamTimer)) enemy.beamTimer += dt;
    if (Number.isFinite(enemy.abilityTimer)) enemy.abilityTimer += dt;
  }
  for (const bullet of bullets) {
    const target = bullet.ultimateHomingTarget;
    if (!target || target.hp <= 0) continue;
    const angle = Math.atan2(target.y - bullet.y, target.x - bullet.x);
    const speed = Math.max(180, Math.hypot(bullet.vx, bullet.vy));
    const desiredX = Math.cos(angle) * speed;
    const desiredY = Math.sin(angle) * speed;
    bullet.vx += (desiredX - bullet.vx) * clamp(dt * 8, 0, 1);
    bullet.vy += (desiredY - bullet.vy) * clamp(dt * 8, 0, 1);
  }
}

function finishUltimateEnemyState(dt) {
  for (const enemy of enemies) {
    if (Number.isFinite(enemy._ultimateBaseSpeed)) {
      enemy.speed = enemy._ultimateBaseSpeed;
      delete enemy._ultimateBaseSpeed;
    }
    enemy.ultimateStunTime = Math.max(0, (enemy.ultimateStunTime || 0) - dt);
  }
}

function restoreOverclockB() {
  if (ultimateRuntime.overclockBBaseMaxHp <= 0) return;
  const baseMaxHp = ultimateRuntime.overclockBBaseMaxHp;
  towerStats.maxHp = baseMaxHp;
  coreHp = Math.min(coreHp, baseMaxHp);
  ultimateRuntime.overclockBBaseMaxHp = 0;
  ultimateRuntime.overclockBValue = 0;
}

function updateUltimateRuntime(dt) {
  if (ultimateRuntime.cooldownRemaining > 0) tickUltimateTimer("cooldownRemaining", dt);
  if (ultimateRuntime.nanoHealTimer > 0) {
    const appliedTime = Math.min(dt, ultimateRuntime.nanoHealTimer);
    coreHp = Math.min(towerStats.maxHp, coreHp + ultimateRuntime.nanoHealPerSecond * appliedTime);
    tickUltimateTimer("nanoHealTimer", dt);
  }
  if (ultimateRuntime.shieldTimer > 0) {
    const before = ultimateRuntime.shieldTimer;
    tickUltimateTimer("shieldTimer", dt);
    if (before > 0 && ultimateRuntime.shieldTimer <= 0) {
      ultimateRuntime.shieldHp = 0;
      stunAllEnemies(3);
      addUltimateShockwave("#70dcff", 2);
    }
  }
  for (const key of [
    "invulnerableTimer", "barrageReversalTimer", "deathMarkTimer", "phaseTimer", "overclockATimer",
    "giantTimer", "bloodRageTimer", "energyTimer", "frozenTimer", "chainTimer", "bountyTimer", "explorationTimer"
  ]) {
    if (ultimateRuntime[key] > 0) tickUltimateTimer(key, dt);
  }
  if (ultimateRuntime.overclockBTimer > 0) {
    const before = ultimateRuntime.overclockBTimer;
    tickUltimateTimer("overclockBTimer", dt);
    if (before > 0 && ultimateRuntime.overclockBTimer <= 0) restoreOverclockB();
  }
  if (ultimateRuntime.energyTimer <= 0) ultimateRuntime.energyStacks = 0;
  if (ultimateRuntime.chainTimer <= 0) ultimateRuntime.chainRatio = 0;
  if (ultimateRuntime.divineReady && wave > ultimateRuntime.divineUntilWave) ultimateRuntime.divineReady = false;
  updateUltimateBlackHole(dt);

  const active = Boolean(
    ultimateRuntime.blackHole
    || ultimateRuntime.invulnerableTimer > 0
    || ultimateRuntime.shieldTimer > 0
    || ultimateRuntime.phaseTimer > 0
  );
  setUltimateAura(getEquippedUltimate(), active);
  updateUltimateTrigger();
}

const ultimateBaseUpdate = update;
update = function (dt) {
  const active = gameStarted && !isPaused && !choosingCard && running;
  if (active) prepareUltimateEnemyState(dt);
  ultimateBaseUpdate(dt);
  if (!active) {
    updateUltimateTrigger();
    return;
  }
  finishUltimateEnemyState(dt);
  updateUltimateRuntime(dt);
};

const ultimateBaseDrawEffects = drawEffects;
drawEffects = function () {
  ultimateBaseDrawEffects();
  const blackHole = ultimateRuntime.blackHole;
  if (!blackHole) return;
  const ratio = clamp(blackHole.remaining / blackHole.max, 0, 1);
  const x = width * 0.5;
  const y = height * 0.5;
  const radius = (80 + (1 - ratio) * 110) * battleVisualScale;
  const gradient = ctx.createRadialGradient(x, y, 2, x, y, radius);
  gradient.addColorStop(0, "rgba(0,0,0,1)");
  gradient.addColorStop(0.14, "rgba(194,144,255,0.92)");
  gradient.addColorStop(0.38, "rgba(75,214,255,0.24)");
  gradient.addColorStop(1, "rgba(0,0,0,0)");
  ctx.save();
  ctx.globalAlpha = 0.7 + Math.sin(performance.now() * 0.008) * 0.2;
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
};

const ultimateBasePresentCardChoice = presentCardChoice;
presentCardChoice = function () {
  ultimateBasePresentCardChoice();
  const blueprint = getEquippedUltimate()?.id === "emergency_blueprint" && ultimateRuntime.blueprintArmed;
  ultimateCardPicksRemaining = blueprint ? 2 : 1;
  if (blueprint) {
    ultimateRuntime.blueprintArmed = false;
    cardChoiceSubtitle.textContent = getUltimateUi().chooseTwo;
    saveActiveRunCheckpoint();
  }
};

const ultimateBaseChooseCard = chooseCard;
chooseCard = function (cardId) {
  const selected = offeredCards.find((item) => item.id === cardId);
  if (!selected) return;
  if (ultimateCardPicksRemaining > 1) {
    selected.apply();
    v2CardStars[cardId] = Math.min(V2_CARD_MAX_STARS, (v2CardStars[cardId] || 0) + 1);
    offeredCards = offeredCards.filter((item) => item.id !== cardId);
    cardGrid.querySelector(`[data-card="${cardId}"]`)?.remove();
    ultimateCardPicksRemaining -= 1;
    recordDailyProgress("skillCards", 1);
    recordAchievementProgress("skillCards", 1);
    updateHud();
    cardChoiceSubtitle.textContent = getUltimateUi().chooseTwo;
    saveActiveRunCheckpoint();
    return;
  }
  ultimateBaseChooseCard(cardId);
  ultimateCardPicksRemaining = 1;
  grantUltimateCardPack();
  queueCloudSave();
  saveActiveRunCheckpoint();
};

const ultimateBaseResetGame = resetGame;
resetGame = function () {
  ultimateBaseResetGame();
  ultimateRuntime = createUltimateRuntime();
  ultimateCardPicksRemaining = 1;
  ultimateTriggerStamp = "";
  setUltimateAura(null, false);
  updateUltimateTrigger();
};

const ultimateBaseSaveActiveRunCheckpoint = saveActiveRunCheckpoint;
saveActiveRunCheckpoint = function () {
  const result = ultimateBaseSaveActiveRunCheckpoint();
  if (!result) return result;
  try {
    const key = getActiveRunSaveKey();
    const checkpoint = JSON.parse(localStorage.getItem(key) || "null");
    if (checkpoint && checkpoint.version === 3) {
      checkpoint.ultimateRuntime = normalizeUltimateRuntime(ultimateRuntime);
      checkpoint.ultimateCardPicksRemaining = ultimateCardPicksRemaining;
      localStorage.setItem(key, JSON.stringify(checkpoint));
    }
  } catch {
    // The base checkpoint remains valid if the optional ultimate payload cannot be appended.
  }
  return result;
};

const ultimateBaseRestoreActiveRunCheckpoint = restoreActiveRunCheckpoint;
restoreActiveRunCheckpoint = function () {
  const checkpoint = loadActiveRunCheckpoint();
  const result = ultimateBaseRestoreActiveRunCheckpoint();
  if (!result) return result;
  ultimateRuntime = normalizeUltimateRuntime(checkpoint?.ultimateRuntime);
  ultimateCardPicksRemaining = clamp(Math.floor(Number(checkpoint?.ultimateCardPicksRemaining) || 1), 1, 2);
  updateUltimateTrigger();
  return result;
};

function refreshUltimateLanguage() {
  ultimateTriggerStamp = "";
  renderUltimateWorkshop();
  updateUltimateTrigger();
  if (choosingCard && ultimateCardPicksRemaining > 1) cardChoiceSubtitle.textContent = getUltimateUi().chooseTwo;
}

window.addEventListener("space-tower-language-changed", refreshUltimateLanguage);

renderUltimateWorkshop();
updateUltimateTrigger();
