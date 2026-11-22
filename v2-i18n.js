/* Complete localization for the v2 systems. Keep gameplay IDs stable; only display text is translated. */
window.V2_I18N = {
  zh: {
    emergency_shield: ["殘血護盾核", "核心生命首次低於 30% 時啟動；星級 1–5 分別提供 1–5 次傷害護盾。"],
    frost_core: ["冰晶減速核", "不瞄準，每發隨機射向一架敵機；命中減速 10%（排位 35%），持續 2.5 秒；升星會提高減速幅度。"],
    flame_core: ["烈焰點燃核", "命中灼燒 4 秒，每秒造成魔攻 14% 傷害；燃燒中的敵機被擊毀時，火焰會跳到最近的一架敵機。升星會提高灼燒傷害。"],
    reflect_bastion: ["反射金剛塔", "每座提供 2 級反擊強度；核心受到碰撞時對敵人造成反傷，升星會提高強度。"],
    shield_generator: ["護盾產生器", "每座讓核心受到的所有傷害降低 2%；升星會提高減傷幅度。"],
    ui: {
      codexTab: "敵機圖鑑", workshopTab: "砲台工坊", codexKicker: "敵機檔案", codexTitle: "敵方戰機圖鑑",
      codexDescription: "解鎖更高階級，辨識每種戰機的能力與反制方式。", workshopKicker: "砲台工坊", workshopTitle: "砲台碎片工坊",
      unknownEnemy: "未知敵機。", tier: "階級", wave: "波次", clear: "晴空",
      lockedWorkshop: "階級 2 才能啟用副砲；現在仍可先查看各型副砲資料。",
      openWorkshop: "階級 {tier} 可同時啟用 {slots} 座副砲。50 枚同型碎片可組裝並升星。",
      availableSlots: "可用欄位", assembled: "已組裝", heldFragments: "持有碎片", fragments: "碎片",
      build: "組裝", active: "啟用", equip: "裝備", obsidianUnlock: "黑曜石解鎖", healNow: "立即回復", tacticalModules: "戰術模組", obsidianHint: "需先用黑曜石解鎖",
      rareDrop: "稀有掉落", fragmentSuffix: "碎片", rangedShot: "遠程砲擊", repair: "維修", arcBlock: "弧盾格擋",
      shield: "護盾", defected: "已策反", miniTurretName: "戰地副砲",
      miniTurretDescription: "本局臨時部署 1 座連射副砲；永久副砲則由首頁碎片工坊組裝。",
      fighterDescription: "部署 1 架軌道戰機；戰機庫與局內編隊升級可把上限提高至 8 架。"
    },
    enemies: {
      basic: ["基礎突擊機", "標準直線突擊單位。", ["基礎", "直線"]], runner: ["高速突擊機", "速度快、裝甲薄，會迅速壓縮反應時間。", ["高速", "輕甲"]],
      swarm: ["蜂群戰機", "成群進場，以數量穿透單點火力。", ["群體", "輕型"]], tank: ["重甲攻城艦", "高生命、低速度，撞擊威力極高。", ["重甲", "高傷"]],
      armored: ["裝甲戰機", "物理裝甲優秀，魔法傷害更容易處理。", ["物防", "菁英"]], berserker: ["狂熱戰機", "生命越低速度越快，殘血時會瘋狂突進。", ["狂暴", "加速"]],
      erratic: ["亂流戰機", "以不規則曲線前進，會擾亂主砲瞄準節奏。", ["閃避", "變軌"]], splitter: ["分裂母體", "被摧毀後分裂成兩架高速幼體。", ["分裂", "增殖"]],
      ranged: ["遠程砲擊機", "停在核心外圍發射魔法光束，必須優先擊落。", ["遠程", "魔傷"]], healer: ["維修支援機", "緩慢前進並定期修復附近受傷戰機。", ["治療", "支援"]],
      full_shield: ["全域護盾機", "可破壞的全向護盾會先吸收所有攻擊。", ["護盾", "全向"]], buffer: ["超頻領航機", "留下加速航跡，經過的敵軍會獲得移速與防禦增益。", ["增益", "航跡"]],
      frontal_shield: ["弧盾護衛機", "不可破壞的前方弧盾阻擋直射砲火，範圍攻擊可繞過。", ["前盾", "護衛"]]
    },
    environments: {
      solar: ["太陽風暴", "雙方推進加速，主砲攻速 +12%。"], nebula: ["離子星霧", "偵測範圍 -12%，魔法傷害 +18%。"],
      gravity: ["重力裂隙", "敵軍移速 -10%，擊退效果增強。"], crystal: ["晶體碎帶", "物理傷害 +10%，敵軍裝甲 +6%。"]
    },
    turrets: {
      kinetic: ["連射副砲", "穩定高速射擊，適合清除蜂群。"], frost: ["霜脈副砲", "命中疊加緩速，協助主砲控制戰線。"],
      arc: ["電弧副砲", "發射高穿透魔法脈衝，克制裝甲單位。"], rail: ["磁軌副砲", "低射速高傷害，優先處理重型目標。"],
      mine: ["佈雷副砲", "命中有機率引爆小範圍地雷。"]
    },
    upgrades: {
      defenseRate: ["防禦率", "防禦"], physicalArmor: ["物防", "防禦"], magicArmor: ["魔防", "防禦"], slowModule: ["緩速砲率", "控制"],
      knockbackModule: ["擊退率", "控制"], reflectModule: ["反傷", "防禦"], mineRadius: ["地雷範圍", "爆破"], mineChance: ["地雷機率", "爆破"],
      fighterCap: ["軌道編隊", "召喚"], waveGold: ["波次金幣", "經濟"], goldMultiplier: ["金幣倍率", "經濟"], waveObsidian: ["波次黑曜石", "經濟"], medkit: ["補包", "生命"]
    },
    meta: {
      defenseRate: ["防禦率模組", "解鎖局內防禦率；每級開局額外減傷 1.2%。"], slowModule: ["寒霜控制模組", "解鎖局內緩速砲率；每級開局緩速機率 +1%。"],
      knockbackModule: ["動能擊退模組", "解鎖局內擊退率；每級開局擊退機率 +0.7%。"], reflectModule: ["鏡面反傷模組", "解鎖局內反傷；每級提供 2 級開局反擊強度。"],
      mineRadius: ["地雷感應半徑", "解鎖局內地雷範圍；每級開局爆炸半徑 +6px。"], mineChance: ["自動佈雷協議", "解鎖局內地雷；每級觸發機率 +0.4%。"],
      fighterHangar: ["軌道戰機庫", "解鎖局內軌道編隊；每級開局增加 2 架，最多 8 架。"], waveGold: ["波次金幣協議", "解鎖局內波次金幣；每級通關波次額外 +3 金幣。"],
      goldMultiplier: ["採礦倍率核心", "解鎖局內金幣倍率；每級開局擊殺收益 +1.5%。"], waveObsidian: ["黑曜石回收器", "解鎖局內黑曜石波次獎勵；每級提供 2 級回收強度。"],
      medkit: ["戰地補包", "解鎖局內補包；每級回復量 +4%。"], physicalDefense: ["物理防禦", "解鎖局內物理防禦；每級降低敵方撞擊與實體攻擊傷害。"],
      magicDefense: ["魔法防禦", "解鎖局內魔法防禦；每級降低遠程光束與魔法傷害。"]
    },
    cards: {
      chance_slow: ["低溫彈鏈", "控制", "主砲命中有機率施加強力緩速；升星提高機率與持續時間。"], blind_rounds: ["致盲閃光彈", "控制", "主砲有機率致盲敵機，使遠程攻擊失效並降低推進效率。"],
      defection: ["敵我逆轉", "戰術", "命中基礎小兵時有機率策反，轉向撞擊 Boss 或高威脅敵機。"], black_hole: ["微型黑洞", "控制", "定期生成引力核心，把範圍內敵軍集中到一點；升星縮短冷卻。"],
      extra_row: ["雙列火網", "輸出", "主砲兩側增加一排同步彈幕；升星提高側砲傷害。"], mini_turret: ["戰地副砲", "召喚", "本局臨時部署 1 座連射副砲；永久副砲則由首頁碎片工坊組裝。"],
      fighter: ["軌道戰機", "召喚", "部署 1 架軌道戰機；戰機庫與局內編隊升級可把上限提高至 8 架。"]
    }
  },

  en: {
    emergency_shield: ["Emergency Shield Core", "Triggers the first time core HP falls below 30%; stars 1–5 grant 1–5 damage-blocking shield charges."],
    frost_core: ["Frost Slow Core", "Never aims: each shot flies at a random enemy. Hits slow by 10% (35% in Ranked) for 2.5 seconds; stars increase the slow."],
    flame_core: ["Flame Ignition Core", "Hits burn for 4 seconds for 14% of Magic ATK per second. When a burning enemy is destroyed, the fire leaps to the nearest enemy. Stars increase burn damage."],
    reflect_bastion: ["Reflect Bastion", "Each unit grants 2 counterattack levels; core collisions reflect damage, and stars increase the strength."],
    shield_generator: ["Shield Generator", "Each unit reduces all damage taken by the core by 2%; stars increase the reduction."],
    ui: {
      codexTab: "ENEMIES", workshopTab: "AUX FORGE", codexKicker: "ENEMY ARCHIVE", codexTitle: "Enemy Fighter Codex",
      codexDescription: "Unlock higher Tiers to identify every fighter's abilities and counters.", workshopKicker: "AUXILIARY FORGE", workshopTitle: "Auxiliary Turret Forge",
      unknownEnemy: "Unknown hostile craft.", tier: "TIER", wave: "WAVE", clear: "CLEAR",
      lockedWorkshop: "Auxiliary turrets activate at Tier 2. You can still review every model now.",
      openWorkshop: "Tier {tier} supports {slots} active auxiliary turrets. Assemble and rank up with 50 matching fragments.",
      availableSlots: "Active slots", assembled: "Assembled", heldFragments: "Fragments", fragments: "FRAGMENTS",
      build: "Assemble", active: "Active", equip: "Equip", obsidianUnlock: "Unlock with Obsidian", healNow: "Heal now", tacticalModules: "TACTICAL MODULES", obsidianHint: "Unlock with Obsidian first",
      rareDrop: "Rare drop", fragmentSuffix: "fragment", rangedShot: "RANGED STRIKE", repair: "REPAIR", arcBlock: "ARC BLOCK",
      shield: "SHIELD", defected: "DEFECTED", miniTurretName: "Field Turret",
      miniTurretDescription: "Deploy one temporary rapid-fire turret this run. Permanent turrets are assembled in the home forge.",
      fighterDescription: "Deploy one orbital fighter. Hangar and in-run upgrades can raise the limit to eight."
    },
    enemies: {
      basic: ["Assault Fighter", "A standard fighter that attacks in a straight line.", ["Basic", "Direct"]], runner: ["Interceptor", "Fast and lightly armored, leaving very little reaction time.", ["Fast", "Light"]],
      swarm: ["Swarm Fighter", "Attacks in groups to overwhelm focused fire with sheer numbers.", ["Swarm", "Light"]], tank: ["Siege Dreadnought", "Extremely durable and slow, with devastating collision damage.", ["Heavy", "Impact"]],
      armored: ["Armored Fighter", "Strong physical armor makes magic damage the better counter.", ["Armor", "Elite"]], berserker: ["Berserker Fighter", "Accelerates as its health falls and charges wildly near destruction.", ["Berserk", "Haste"]],
      erratic: ["Drift Fighter", "Moves along irregular curves to disrupt turret tracking.", ["Evasive", "Drift"]], splitter: ["Splitter Carrier", "Splits into two fast offspring when destroyed.", ["Split", "Multiply"]],
      ranged: ["Ranged Bomber", "Stops outside the core and fires magic beams. Eliminate it first.", ["Ranged", "Magic"]], healer: ["Repair Support", "Advances slowly and periodically repairs nearby damaged fighters.", ["Heal", "Support"]],
      full_shield: ["Omni-Shield Fighter", "A breakable all-direction shield absorbs attacks before its hull.", ["Shield", "Omni"]], buffer: ["Overclock Pathfinder", "Leaves a wake that boosts allied speed and defenses.", ["Buff", "Trail"]],
      frontal_shield: ["Arc-Shield Escort", "An unbreakable frontal shield blocks direct fire; area damage bypasses it.", ["Front Shield", "Escort"]]
    },
    environments: {
      solar: ["Solar Storm", "Both sides accelerate; main-turret attack speed +12%."], nebula: ["Ion Nebula", "Detection range -12%; magic damage +18%."],
      gravity: ["Gravity Rift", "Enemy speed -10%; knockback is amplified."], crystal: ["Crystal Belt", "Physical damage +10%; enemy armor +6."]
    },
    turrets: {
      kinetic: ["Rapid-Fire Turret", "Reliable high-speed fire built to clear swarms."], frost: ["Frostpulse Turret", "Stacks slow on hit to help the main turret control the front."],
      arc: ["Arc Turret", "Fires high-penetration magic pulses against armored units."], rail: ["Rail Turret", "Slow, high-damage shots prioritize heavy targets."],
      mine: ["Minelayer Turret", "Hits can trigger a small-area mine blast."]
    },
    upgrades: {
      defenseRate: ["Damage Reduction", "Defense"], physicalArmor: ["Physical Armor", "Defense"], magicArmor: ["Magic Armor", "Defense"], slowModule: ["Slow Chance", "Control"],
      knockbackModule: ["Knockback Chance", "Control"], reflectModule: ["Retaliation", "Defense"], mineRadius: ["Mine Radius", "Demolition"], mineChance: ["Mine Chance", "Demolition"],
      fighterCap: ["Orbital Wing", "Summon"], waveGold: ["Wave Gold", "Economy"], goldMultiplier: ["Gold Multiplier", "Economy"], waveObsidian: ["Wave Obsidian", "Economy"], medkit: ["Medkit", "Life"]
    },
    meta: {
      defenseRate: ["Damage Reduction Module", "Unlocks in-run damage reduction; each level adds 1.2% at the start."], slowModule: ["Cryo Control Module", "Unlocks in-run slow chance; each level adds 1% at the start."],
      knockbackModule: ["Kinetic Repulsion Module", "Unlocks in-run knockback; each level adds 0.7% at the start."], reflectModule: ["Reflective Retaliation Module", "Unlocks retaliation; each level adds two starting levels."],
      mineRadius: ["Mine Sensor Radius", "Unlocks mine radius; each level adds 6px at the start."], mineChance: ["Automatic Minelaying Protocol", "Unlocks mines; each level adds 0.4% trigger chance."],
      fighterHangar: ["Orbital Fighter Hangar", "Unlocks the orbital wing; each level adds two starting fighters, up to eight."], waveGold: ["Wave Gold Protocol", "Unlocks wave gold; each level grants +3 gold per cleared wave."],
      goldMultiplier: ["Mining Multiplier Core", "Unlocks the gold multiplier; each level adds 1.5% starting kill income."], waveObsidian: ["Obsidian Recycler", "Unlocks Obsidian wave rewards; each level adds two recovery levels."],
      medkit: ["Field Medkit", "Unlocks the in-run medkit; each level adds 4% healing."], physicalDefense: ["Physical Defense", "Unlocks physical defense to reduce collision and kinetic damage."],
      magicDefense: ["Magic Defense", "Unlocks magic defense to reduce ranged beams and magic damage."]
    },
    cards: {
      chance_slow: ["Cryogenic Chain", "Control", "Main-turret hits can apply a powerful slow. Stars raise chance and duration."], blind_rounds: ["Blinding Flash Rounds", "Control", "Shots can blind fighters, disabling ranged attacks and slowing their advance."],
      defection: ["Turncoat Protocol", "Tactics", "Hits can convert basic enemies, sending them into a Boss or priority target."], black_hole: ["Micro Black Hole", "Control", "Periodically creates a gravity core that pulls enemies together. Stars reduce cooldown."],
      extra_row: ["Twin-Row Barrage", "Damage", "Adds synchronized side volleys to the main turret. Stars increase side-shot damage."], mini_turret: ["Field Turret", "Summon", "Deploy one temporary rapid-fire turret this run. Permanent turrets come from the home forge."],
      fighter: ["Orbital Fighter", "Summon", "Deploy one orbital fighter; hangar and in-run upgrades raise the cap to eight."]
    }
  },

  ja: {
    emergency_shield: ["瀕死シールドコア", "コアHPが初めて30%未満になると発動し、1～5星でダメージを防ぐシールドを1～5回付与します。"],
    frost_core: ["氷晶減速コア", "狙いを定めず、毎発ランダムな敵へ発射。命中時に10%（ランク戦は35%）減速を2.5秒付与し、星上げで減速量が増加します。"],
    flame_core: ["火炎着火コア", "命中時に4秒間燃焼し、毎秒魔攻14%のダメージ。燃焼中の敵を倒すと、炎が最も近い敵へ燃え移ります。星上げで燃焼ダメージが増加します。"],
    reflect_bastion: ["反射バスティオン", "1基につき反撃強度を2レベル付与。コアへの衝突ダメージを反射し、星上げで強度が増加します。"],
    shield_generator: ["シールド発生器", "1基につきコアが受ける全ダメージを2%軽減し、星上げで軽減率が増加します。"],
    ui: {
      codexTab: "敵機図鑑", workshopTab: "副砲工房", codexKicker: "敵機アーカイブ", codexTitle: "敵戦闘機図鑑", codexDescription: "上位Tierを解放し、各敵機の能力と対策を把握しよう。",
      workshopKicker: "副砲工房", workshopTitle: "副砲フラグメント工房", unknownEnemy: "未確認の敵機。", tier: "TIER", wave: "WAVE", clear: "平穏",
      lockedWorkshop: "副砲はTier 2から起動できます。現在も各モデルの情報は確認できます。", openWorkshop: "Tier {tier}では副砲を{slots}基まで起動可能。同種フラグメント50個で組立・昇星します。",
      availableSlots: "起動枠", assembled: "組立済み", heldFragments: "所持フラグメント", fragments: "フラグメント", build: "組み立て", active: "起動中", equip: "装備",
      obsidianUnlock: "黒曜石で解放", healNow: "今すぐ回復", tacticalModules: "戦術モジュール", obsidianHint: "先に黒曜石で解放", rareDrop: "レアドロップ", fragmentSuffix: "フラグメント", rangedShot: "遠距離砲撃", repair: "修復", arcBlock: "アーク防御",
      shield: "シールド", defected: "寝返り", miniTurretName: "野戦副砲", miniTurretDescription: "このラン中だけ速射副砲を1基展開。恒久副砲はホームの工房で組み立てます。",
      fighterDescription: "軌道戦闘機を1機展開。格納庫とラン内強化で上限を8機まで増やせます。"
    },
    enemies: {
      basic: ["強襲戦闘機", "直線で突入する標準型ユニット。", ["基本", "直進"]], runner: ["高速迎撃機", "高速・軽装甲で反応時間を一気に奪う。", ["高速", "軽装"]],
      swarm: ["スウォーム戦闘機", "群れで侵入し、数で集中砲火を突破する。", ["群体", "軽型"]], tank: ["重装攻城艦", "非常に頑丈で遅く、衝突ダメージが大きい。", ["重装", "衝撃"]],
      armored: ["装甲戦闘機", "物理装甲が高く、魔法攻撃が有効。", ["装甲", "エリート"]], berserker: ["狂戦戦闘機", "HPが減るほど加速し、瀕死時に猛突進する。", ["狂戦", "加速"]],
      erratic: ["乱流戦闘機", "不規則な曲線移動で砲台の照準を乱す。", ["回避", "変則"]], splitter: ["分裂母艦", "撃破されると高速の幼体2機に分裂する。", ["分裂", "増殖"]],
      ranged: ["遠距離砲撃機", "コアの外周で停止し魔法ビームを放つ。優先撃破対象。", ["遠距離", "魔法"]], healer: ["修理支援機", "低速で前進し、周囲の損傷した敵機を定期修復する。", ["治療", "支援"]],
      full_shield: ["全周シールド機", "破壊可能な全方向シールドが機体より先に攻撃を吸収する。", ["シールド", "全周"]], buffer: ["オーバークロック先導機", "航跡上の味方に移動速度と防御力を付与する。", ["強化", "航跡"]],
      frontal_shield: ["アークシールド護衛機", "破壊不能の前方盾が直射を防ぐ。範囲攻撃は貫通可能。", ["前方盾", "護衛"]]
    },
    environments: { solar: ["太陽嵐", "双方が加速し、主砲攻撃速度+12%。"], nebula: ["イオン星雲", "探知範囲-12%、魔法ダメージ+18%。"], gravity: ["重力裂け目", "敵の移動速度-10%、ノックバック強化。"], crystal: ["結晶帯", "物理ダメージ+10%、敵装甲+6。"] },
    turrets: { kinetic: ["速射副砲", "安定した高速射撃で群れを排除。"], frost: ["フロストパルス副砲", "命中ごとに減速を重ね、前線を制御。"], arc: ["アーク副砲", "高貫通の魔法パルスで装甲敵に対抗。"], rail: ["レール副砲", "低速・高威力で重目標を優先攻撃。"], mine: ["機雷敷設副砲", "命中時に小範囲の機雷爆発が発生することがある。"] },
    upgrades: { defenseRate: ["ダメージ軽減", "防御"], physicalArmor: ["物理防御", "防御"], magicArmor: ["魔法防御", "防御"], slowModule: ["減速確率", "制御"], knockbackModule: ["ノックバック率", "制御"], reflectModule: ["反射", "防御"], mineRadius: ["機雷範囲", "爆破"], mineChance: ["機雷確率", "爆破"], fighterCap: ["軌道編隊", "召喚"], waveGold: ["ウェーブ金貨", "経済"], goldMultiplier: ["金貨倍率", "経済"], waveObsidian: ["ウェーブ黒曜石", "経済"], medkit: ["救急キット", "生命"] },
    meta: {
      defenseRate: ["防御率モジュール", "ラン内ダメージ軽減を解放。各レベルで開始時+1.2%。"], slowModule: ["冷却制御モジュール", "ラン内減速率を解放。各レベルで開始時+1%。"], knockbackModule: ["動的反発モジュール", "ラン内ノックバック率を解放。各レベルで開始時+0.7%。"], reflectModule: ["反射装甲モジュール", "ラン内反射を解放。各レベルで開始時2レベル追加。"], mineRadius: ["機雷感知半径", "ラン内機雷範囲を解放。各レベルで開始時+6px。"], mineChance: ["自動機雷敷設プロトコル", "ラン内機雷を解放。各レベルで発動率+0.4%。"], fighterHangar: ["軌道戦闘機格納庫", "ラン内軌道編隊を解放。各レベルで開始時+2機、上限8機。"], waveGold: ["ウェーブ金貨プロトコル", "ラン内ウェーブ金貨を解放。各レベルでクリア時+3金貨。"], goldMultiplier: ["採掘倍率コア", "ラン内金貨倍率を解放。各レベルで開始時撃破収入+1.5%。"], waveObsidian: ["黒曜石回収装置", "黒曜石ウェーブ報酬を解放。各レベルで回収強度+2。"], medkit: ["野戦救急キット", "ラン内救急キットを解放。各レベルで回復量+4%。"], physicalDefense: ["物理防御", "衝突・実体攻撃を軽減する物理防御を解放。"], magicDefense: ["魔法防御", "遠距離ビームと魔法ダメージを軽減。"]
    },
    cards: { chance_slow: ["低温弾鎖", "制御", "主砲命中時に強力な減速を付与。星で確率と持続時間上昇。"], blind_rounds: ["閃光目潰し弾", "制御", "敵機を盲目にし、遠距離攻撃を封じて進行を遅らせる。"], defection: ["敵味方反転", "戦術", "基本敵を寝返らせ、Bossや優先目標へ突撃させる。"], black_hole: ["マイクロブラックホール", "制御", "重力核で敵を一点に集める。星でクールダウン短縮。"], extra_row: ["二列弾幕", "火力", "主砲の両側に同期弾幕を追加。星で側弾ダメージ上昇。"], mini_turret: ["野戦副砲", "召喚", "このラン中だけ速射副砲を1基展開。恒久副砲はホーム工房で組立。"], fighter: ["軌道戦闘機", "召喚", "軌道戦闘機を1機展開。格納庫とラン内強化で上限8機。"] }
  },

  ko: {
    emergency_shield: ["빈사 보호막 코어", "코어 HP가 처음 30% 미만이 되면 발동하며, 1–5성에서 피해를 막는 보호막을 1–5회 제공합니다."],
    frost_core: ["빙결 감속 코어", "조준하지 않고 매 발 무작위 적에게 발사합니다. 적중 시 2.5초 동안 10%(랭크전 35%) 감속하며, 성급이 오르면 감속량이 증가합니다."],
    flame_core: ["화염 점화 코어", "적중 시 4초 동안 초당 마법 공격력의 14%로 연소 피해를 줍니다. 불타는 적이 파괴되면 불길이 가장 가까운 적에게 옮겨붙습니다. 성급이 오르면 피해가 증가합니다."],
    reflect_bastion: ["반사 보루", "1기마다 반격 강도 2레벨을 제공하며 코어 충돌 피해를 반사합니다. 성급이 오르면 강도가 증가합니다."],
    shield_generator: ["보호막 생성기", "1기마다 코어가 받는 모든 피해를 2% 줄이며, 성급이 오르면 감소량이 증가합니다."],
    ui: {
      codexTab: "적기 도감", workshopTab: "보조포 공방", codexKicker: "적기 기록", codexTitle: "적 전투기 도감", codexDescription: "상위 Tier를 해금해 각 전투기의 능력과 대응법을 확인하세요.",
      workshopKicker: "보조포 공방", workshopTitle: "보조포 파편 공방", unknownEnemy: "미확인 적기.", tier: "티어", wave: "웨이브", clear: "정상",
      lockedWorkshop: "보조포는 Tier 2부터 활성화됩니다. 지금도 각 모델의 정보는 볼 수 있습니다.", openWorkshop: "Tier {tier}에서는 보조포 {slots}문을 동시에 가동할 수 있습니다. 같은 파편 50개로 조립 및 성급 상승합니다.",
      availableSlots: "가동 슬롯", assembled: "조립 완료", heldFragments: "보유 파편", fragments: "파편", build: "조립", active: "가동 중", equip: "장착", obsidianUnlock: "흑요석으로 해금", healNow: "즉시 회복", tacticalModules: "전술 모듈", obsidianHint: "먼저 흑요석으로 해금",
      rareDrop: "희귀 획득", fragmentSuffix: "파편", rangedShot: "원거리 포격", repair: "수리", arcBlock: "아크 방어", shield: "보호막", defected: "전향", miniTurretName: "야전 보조포",
      miniTurretDescription: "이번 전투에 임시 속사 보조포 1문을 배치합니다. 영구 보조포는 홈 공방에서 조립합니다.", fighterDescription: "궤도 전투기 1기를 배치합니다. 격납고와 전투 내 강화로 최대 8기까지 운용합니다."
    },
    enemies: {
      basic: ["강습 전투기", "직선으로 돌진하는 표준 유닛.", ["기본", "직선"]], runner: ["고속 요격기", "빠르고 장갑이 얇아 대응 시간을 크게 줄입니다.", ["고속", "경장갑"]], swarm: ["군집 전투기", "무리로 진입해 숫자로 집중 화력을 돌파합니다.", ["군집", "경형"]], tank: ["중장 공성함", "매우 튼튼하고 느리며 충돌 피해가 큽니다.", ["중장", "충격"]], armored: ["장갑 전투기", "물리 장갑이 높아 마법 피해가 효과적입니다.", ["장갑", "정예"]], berserker: ["광전 전투기", "체력이 낮을수록 빨라지며 빈사 상태에서 돌진합니다.", ["광전", "가속"]], erratic: ["난류 전투기", "불규칙한 곡선 이동으로 포탑 조준을 흐트립니다.", ["회피", "변칙"]], splitter: ["분열 모함", "파괴되면 빠른 소형기 2기로 분열합니다.", ["분열", "증식"]], ranged: ["원거리 포격기", "코어 밖에서 멈춰 마법 광선을 발사하므로 우선 제거해야 합니다.", ["원거리", "마법"]], healer: ["수리 지원기", "느리게 전진하며 주변의 손상된 아군을 주기적으로 수리합니다.", ["치유", "지원"]], full_shield: ["전방위 보호막기", "파괴 가능한 전방위 보호막이 기체보다 먼저 공격을 흡수합니다.", ["보호막", "전방위"]], buffer: ["오버클럭 선도기", "항적을 지난 아군의 이동 속도와 방어력을 강화합니다.", ["강화", "항적"]], frontal_shield: ["아크 실드 호위기", "파괴 불가 전방 실드가 직사를 막고 범위 공격은 통과합니다.", ["전방 실드", "호위"]]
    },
    environments: { solar: ["태양 폭풍", "양측이 가속되고 주포 공격 속도 +12%."], nebula: ["이온 성운", "탐지 범위 -12%, 마법 피해 +18%."], gravity: ["중력 균열", "적 이동 속도 -10%, 밀쳐내기 강화."], crystal: ["수정 지대", "물리 피해 +10%, 적 장갑 +6."] },
    turrets: { kinetic: ["속사 보조포", "안정적인 고속 사격으로 군집을 정리합니다."], frost: ["서리맥 보조포", "명중마다 감속을 누적해 전선을 제어합니다."], arc: ["전기 아크 보조포", "관통 마법 펄스로 장갑 유닛을 제압합니다."], rail: ["레일 보조포", "느리지만 강력한 사격으로 중형 목표를 우선합니다."], mine: ["지뢰 살포 보조포", "명중 시 소범위 지뢰 폭발이 발생할 수 있습니다."] },
    upgrades: { defenseRate: ["피해 감소", "방어"], physicalArmor: ["물리 방어", "방어"], magicArmor: ["마법 방어", "방어"], slowModule: ["감속 확률", "제어"], knockbackModule: ["밀쳐내기 확률", "제어"], reflectModule: ["반사 피해", "방어"], mineRadius: ["지뢰 범위", "폭파"], mineChance: ["지뢰 확률", "폭파"], fighterCap: ["궤도 편대", "소환"], waveGold: ["웨이브 골드", "경제"], goldMultiplier: ["골드 배율", "경제"], waveObsidian: ["웨이브 흑요석", "경제"], medkit: ["구급품", "생명"] },
    meta: { defenseRate: ["피해 감소 모듈", "전투 내 피해 감소를 해금하고 레벨마다 시작 수치 +1.2%."], slowModule: ["극저온 제어 모듈", "전투 내 감속 확률을 해금하고 레벨마다 시작 확률 +1%."], knockbackModule: ["운동 에너지 밀쳐내기 모듈", "전투 내 밀쳐내기 확률을 해금하고 레벨마다 시작 확률 +0.7%."], reflectModule: ["반사 보복 모듈", "전투 내 반사 피해를 해금하고 레벨마다 시작 단계 +2."], mineRadius: ["지뢰 감지 반경", "전투 내 지뢰 범위를 해금하고 레벨마다 시작 반경 +6px."], mineChance: ["자동 지뢰 살포 프로토콜", "전투 내 지뢰를 해금하고 레벨마다 발동 확률 +0.4%."], fighterHangar: ["궤도 전투기 격납고", "전투 내 궤도 편대를 해금하고 레벨마다 시작 전투기 +2, 최대 8기."], waveGold: ["웨이브 골드 프로토콜", "전투 내 웨이브 골드를 해금하고 레벨마다 클리어 골드 +3."], goldMultiplier: ["채굴 배율 코어", "전투 내 골드 배율을 해금하고 레벨마다 시작 처치 수익 +1.5%."], waveObsidian: ["흑요석 회수기", "흑요석 웨이브 보상을 해금하고 레벨마다 회수 단계 +2."], medkit: ["야전 구급품", "전투 내 구급품을 해금하고 레벨마다 회복량 +4%."], physicalDefense: ["물리 방어", "충돌과 실체 공격 피해를 줄이는 물리 방어를 해금합니다."], magicDefense: ["마법 방어", "원거리 광선과 마법 피해를 줄입니다."] },
    cards: { chance_slow: ["저온 탄환 연쇄", "제어", "주포 명중 시 강력한 감속을 부여합니다. 별이 오르면 확률과 지속시간이 증가합니다."], blind_rounds: ["섬광 실명탄", "제어", "적기를 실명시켜 원거리 공격을 막고 진군을 늦춥니다."], defection: ["적아 역전", "전술", "기본 적을 전향시켜 Boss나 우선 목표에 충돌시킵니다."], black_hole: ["소형 블랙홀", "제어", "중력 코어가 적을 한 점으로 끌어모읍니다. 별이 오르면 재사용 대기시간이 감소합니다."], extra_row: ["이중 열 탄막", "화력", "주포 양옆에 동기 탄막을 추가하고 별마다 측면탄 피해가 증가합니다."], mini_turret: ["야전 보조포", "소환", "이번 전투에 임시 속사 보조포 1문을 배치합니다."], fighter: ["궤도 전투기", "소환", "궤도 전투기 1기를 배치하며 최대 8기까지 강화합니다."] }
  },

  ru: {
    emergency_shield: ["Ядро аварийного щита", "Срабатывает при первом падении здоровья ядра ниже 30%; 1–5 звёзд дают 1–5 зарядов щита, блокирующих урон."],
    frost_core: ["Ледяное ядро", "Не целится: каждый выстрел летит в случайного врага. Попадания замедляют на 10% (в рейтинге 35%) на 2,5 с; звёзды усиливают замедление."],
    flame_core: ["Огненное ядро", "Попадания поджигают на 4 с и наносят 14% магической атаки в секунду. Когда горящий враг уничтожен, пламя перекидывается на ближайшего врага. Звёзды усиливают горение."],
    reflect_bastion: ["Отражающий бастион", "Каждая башня даёт 2 уровня контратаки; столкновения с ядром отражают урон, а звёзды усиливают эффект."],
    shield_generator: ["Генератор щита", "Каждая башня снижает весь урон по ядру на 2%; звёзды усиливают снижение."],
    ui: {
      codexTab: "ВРАГИ", workshopTab: "ЦЕХ ОРУДИЙ", codexKicker: "АРХИВ ВРАГОВ", codexTitle: "Атлас вражеских кораблей", codexDescription: "Открывайте новые Tier, изучайте способности кораблей и способы противодействия.",
      workshopKicker: "ЦЕХ ВСПОМОГАТЕЛЬНЫХ ОРУДИЙ", workshopTitle: "Сборка вспомогательных орудий", unknownEnemy: "Неизвестный корабль.", tier: "УРОВЕНЬ", wave: "ВОЛНА", clear: "СПОКОЙНО",
      lockedWorkshop: "Орудия активируются с Tier 2. Характеристики моделей уже доступны.", openWorkshop: "На Tier {tier} можно активировать {slots} орудий. Для сборки и повышения звёзд нужно 50 одинаковых фрагментов.",
      availableSlots: "Активные слоты", assembled: "Собрано", heldFragments: "Фрагменты", fragments: "ФРАГМЕНТЫ", build: "Собрать", active: "Активно", equip: "Оснастить", obsidianUnlock: "Открыть за обсидиан", healNow: "Лечиться", tacticalModules: "ТАКТИЧЕСКИЕ МОДУЛИ", obsidianHint: "Сначала открыть за обсидиан",
      rareDrop: "Редкая добыча", fragmentSuffix: "фрагмент", rangedShot: "ДАЛЬНИЙ УДАР", repair: "РЕМОНТ", arcBlock: "БЛОК ДУГОЙ", shield: "ЩИТ", defected: "ПЕРЕВЕРБОВАН",
      miniTurretName: "Полевая пушка", miniTurretDescription: "Развернуть одну временную скорострельную пушку. Постоянные орудия собираются в главном цехе.", fighterDescription: "Развернуть один орбитальный истребитель. Ангар и улучшения повышают лимит до восьми."
    },
    enemies: {
      basic: ["Штурмовик", "Стандартная единица с прямолинейной атакой.", ["Базовый", "Прямой"]], runner: ["Перехватчик", "Быстрый и слабо бронированный — почти не оставляет времени на реакцию.", ["Быстрый", "Лёгкий"]], swarm: ["Роевой истребитель", "Атакует группой и прорывает точечный огонь числом.", ["Рой", "Лёгкий"]], tank: ["Осадный дредноут", "Очень прочный и медленный; столкновение наносит огромный урон.", ["Тяжёлый", "Удар"]], armored: ["Бронированный истребитель", "Сильная физическая броня делает магию лучшим ответом.", ["Броня", "Элита"]], berserker: ["Берсерк", "Ускоряется при потере здоровья и яростно атакует на грани уничтожения.", ["Ярость", "Разгон"]], erratic: ["Маневровый истребитель", "Движется по ломаной траектории и сбивает наведение башни.", ["Уклонение", "Манёвр"]], splitter: ["Носитель-делитель", "После уничтожения распадается на два быстрых корабля.", ["Деление", "Рой"]], ranged: ["Дальний бомбардировщик", "Останавливается у ядра и стреляет магическим лучом. Приоритетная цель.", ["Дальний", "Магия"]], healer: ["Ремонтный корабль", "Медленно летит и периодически чинит повреждённых союзников.", ["Лечение", "Поддержка"]], full_shield: ["Корабль полного щита", "Разрушаемый круговой щит принимает удары раньше корпуса.", ["Щит", "Круговой"]], buffer: ["Разгонщик", "Его след повышает скорость и защиту союзников.", ["Усиление", "След"]], frontal_shield: ["Эскорт с дуговым щитом", "Неразрушимый фронтальный щит блокирует прямой огонь; урон по площади проходит.", ["Фронтальный щит", "Эскорт"]]
    },
    environments: { solar: ["Солнечная буря", "Обе стороны ускорены; скорость главного орудия +12%."], nebula: ["Ионная туманность", "Дальность обнаружения -12%; магический урон +18%."], gravity: ["Гравитационный разлом", "Скорость врагов -10%; отбрасывание усилено."], crystal: ["Кристаллический пояс", "Физический урон +10%; броня врагов +6."] },
    turrets: { kinetic: ["Скорострельное орудие", "Стабильный быстрый огонь против роёв."], frost: ["Морозное орудие", "Накапливает замедление и удерживает линию фронта."], arc: ["Дуговое орудие", "Пробивные магические импульсы против брони."], rail: ["Рельсовое орудие", "Редкие мощные выстрелы по тяжёлым целям."], mine: ["Минное орудие", "Попадания могут вызвать небольшой взрыв мины."] },
    upgrades: { defenseRate: ["Снижение урона", "Защита"], physicalArmor: ["Физ. броня", "Защита"], magicArmor: ["Маг. броня", "Защита"], slowModule: ["Шанс замедления", "Контроль"], knockbackModule: ["Шанс отбрасывания", "Контроль"], reflectModule: ["Ответный урон", "Защита"], mineRadius: ["Радиус мины", "Взрыв"], mineChance: ["Шанс мины", "Взрыв"], fighterCap: ["Орбитальное звено", "Призыв"], waveGold: ["Золото за волну", "Экономика"], goldMultiplier: ["Множитель золота", "Экономика"], waveObsidian: ["Обсидиан за волну", "Экономика"], medkit: ["Аптечка", "Жизнь"] },
    meta: { defenseRate: ["Модуль снижения урона", "Открывает снижение урона; каждый уровень даёт +1,2% на старте."], slowModule: ["Криомодуль контроля", "Открывает замедление; каждый уровень даёт +1% на старте."], knockbackModule: ["Модуль кинетического отталкивания", "Открывает отбрасывание; каждый уровень даёт +0,7% на старте."], reflectModule: ["Модуль отражения", "Открывает ответный урон; каждый уровень даёт два стартовых уровня."], mineRadius: ["Радиус датчика мин", "Открывает радиус мин; каждый уровень даёт +6 px на старте."], mineChance: ["Протокол автоматических мин", "Открывает мины; каждый уровень даёт +0,4% к срабатыванию."], fighterHangar: ["Ангар орбитальных истребителей", "Открывает звено; каждый уровень даёт два стартовых истребителя, максимум восемь."], waveGold: ["Протокол золота за волну", "Открывает золото за волну; каждый уровень даёт +3 за прохождение."], goldMultiplier: ["Ядро множителя добычи", "Открывает множитель золота; каждый уровень даёт +1,5% к начальному доходу."], waveObsidian: ["Переработчик обсидиана", "Открывает награды обсидианом; каждый уровень даёт два уровня переработки."], medkit: ["Полевая аптечка", "Открывает аптечку; каждый уровень даёт +4% к лечению."], physicalDefense: ["Физическая защита", "Снижает урон столкновений и физических атак."], magicDefense: ["Магическая защита", "Снижает урон дальних лучей и магии."] },
    cards: { chance_slow: ["Криоцепь", "Контроль", "Попадания главной башни могут сильно замедлять. Звёзды повышают шанс и длительность."], blind_rounds: ["Ослепляющие заряды", "Контроль", "Могут ослепить врага, отключить дальнюю атаку и замедлить движение."], defection: ["Протокол перебежчика", "Тактика", "Может обратить базового врага против Boss или приоритетной цели."], black_hole: ["Микрочёрная дыра", "Контроль", "Периодически стягивает врагов в одну точку. Звёзды уменьшают перезарядку."], extra_row: ["Двойной огневой ряд", "Урон", "Добавляет боковые залпы; звёзды повышают их урон."], mini_turret: ["Полевая пушка", "Призыв", "Развернуть временное скорострельное орудие."], fighter: ["Орбитальный истребитель", "Призыв", "Развернуть один истребитель; лимит повышается до восьми."] }
  },

  es: {
    emergency_shield: ["Núcleo de escudo de emergencia", "Se activa la primera vez que el núcleo baja del 30 % de vida; las estrellas 1–5 otorgan 1–5 cargas que bloquean daño."],
    frost_core: ["Núcleo de ralentización gélida", "No apunta: cada disparo va a un enemigo al azar. Los impactos ralentizan un 10 % (35 % en Clasificatoria) durante 2,5 s; las estrellas aumentan la ralentización."],
    flame_core: ["Núcleo de ignición", "Los impactos queman durante 4 s e infligen un 14 % del ATQ mágico por segundo. Si un enemigo en llamas es destruido, el fuego salta al enemigo más cercano. Las estrellas aumentan el daño."],
    reflect_bastion: ["Bastión reflector", "Cada unidad otorga 2 niveles de contraataque; las colisiones con el núcleo reflejan daño y las estrellas aumentan la potencia."],
    shield_generator: ["Generador de escudo", "Cada unidad reduce en un 2 % todo el daño recibido por el núcleo; las estrellas aumentan la reducción."],
    ui: {
      codexTab: "ENEMIGOS", workshopTab: "FORJA AUX.", codexKicker: "ARCHIVO ENEMIGO", codexTitle: "Códice de cazas enemigos", codexDescription: "Desbloquea Tiers superiores para conocer las habilidades y contramedidas de cada caza.",
      workshopKicker: "FORJA DE TORRETAS AUXILIARES", workshopTitle: "Forja de fragmentos auxiliares", unknownEnemy: "Nave hostil desconocida.", tier: "NIVEL", wave: "OLEADA", clear: "DESPEJADO",
      lockedWorkshop: "Las torretas auxiliares se activan en Tier 2. Ya puedes consultar todos los modelos.", openWorkshop: "Tier {tier} permite {slots} torretas activas. Reúne 50 fragmentos iguales para montar y subir estrellas.",
      availableSlots: "Ranuras activas", assembled: "Montadas", heldFragments: "Fragmentos", fragments: "FRAGMENTOS", build: "Montar", active: "Activa", equip: "Equipar", obsidianUnlock: "Desbloquear con obsidiana", healNow: "Curar ahora", tacticalModules: "MÓDULOS TÁCTICOS", obsidianHint: "Desbloquea antes con obsidiana",
      rareDrop: "Botín raro", fragmentSuffix: "fragmento", rangedShot: "ATAQUE A DISTANCIA", repair: "REPARAR", arcBlock: "BLOQUEO DE ARCO", shield: "ESCUDO", defected: "CONVERTIDO",
      miniTurretName: "Torreta de campo", miniTurretDescription: "Despliega una torreta temporal de tiro rápido. Las permanentes se montan en la forja principal.", fighterDescription: "Despliega un caza orbital. El hangar y las mejoras elevan el límite hasta ocho."
    },
    enemies: {
      basic: ["Caza de asalto", "Unidad estándar que ataca en línea recta.", ["Básico", "Directo"]], runner: ["Interceptor", "Rápido y con poco blindaje; deja muy poco tiempo de reacción.", ["Rápido", "Ligero"]], swarm: ["Caza enjambre", "Ataca en grupo para superar el fuego concentrado por cantidad.", ["Enjambre", "Ligero"]], tank: ["Acorazado de asedio", "Muy resistente y lento, con daño de colisión devastador.", ["Pesado", "Impacto"]], armored: ["Caza blindado", "Su gran blindaje físico hace que la magia sea la mejor respuesta.", ["Blindaje", "Élite"]], berserker: ["Caza berserker", "Acelera al perder vida y carga con furia cuando está a punto de caer.", ["Furia", "Aceleración"]], erratic: ["Caza errático", "Se mueve en curvas irregulares para romper el seguimiento de la torreta.", ["Evasivo", "Errático"]], splitter: ["Portador divisor", "Al ser destruido se divide en dos naves rápidas.", ["División", "Multiplica"]], ranged: ["Bombardero remoto", "Se detiene fuera del núcleo y dispara rayos mágicos. Objetivo prioritario.", ["Distancia", "Magia"]], healer: ["Unidad reparadora", "Avanza lentamente y repara periódicamente a los aliados dañados.", ["Curación", "Apoyo"]], full_shield: ["Caza de escudo total", "Un escudo omnidireccional destruible absorbe los ataques antes del casco.", ["Escudo", "Total"]], buffer: ["Guía de sobrecarga", "Deja una estela que mejora velocidad y defensa aliadas.", ["Mejora", "Estela"]], frontal_shield: ["Escolta de escudo de arco", "Su escudo frontal indestructible bloquea tiros directos; el daño de área lo ignora.", ["Escudo frontal", "Escolta"]]
    },
    environments: { solar: ["Tormenta solar", "Ambos bandos aceleran; velocidad de la torreta principal +12%."], nebula: ["Nebulosa iónica", "Alcance de detección -12%; daño mágico +18%."], gravity: ["Fisura gravitatoria", "Velocidad enemiga -10%; retroceso aumentado."], crystal: ["Cinturón de cristal", "Daño físico +10%; blindaje enemigo +6."] },
    turrets: { kinetic: ["Torreta de fuego rápido", "Fuego rápido y estable para limpiar enjambres."], frost: ["Torreta criopulso", "Acumula ralentización al impactar y controla el frente."], arc: ["Torreta de arco", "Pulsos mágicos penetrantes contra unidades blindadas."], rail: ["Torreta de riel", "Disparos lentos y potentes contra objetivos pesados."], mine: ["Torreta minadora", "Los impactos pueden activar una pequeña explosión de mina."] },
    upgrades: { defenseRate: ["Reducción de daño", "Defensa"], physicalArmor: ["Armadura física", "Defensa"], magicArmor: ["Armadura mágica", "Defensa"], slowModule: ["Prob. de ralentizar", "Control"], knockbackModule: ["Prob. de retroceso", "Control"], reflectModule: ["Contraataque", "Defensa"], mineRadius: ["Radio de mina", "Demolición"], mineChance: ["Prob. de mina", "Demolición"], fighterCap: ["Escuadrón orbital", "Invocación"], waveGold: ["Oro por oleada", "Economía"], goldMultiplier: ["Multiplicador de oro", "Economía"], waveObsidian: ["Obsidiana por oleada", "Economía"], medkit: ["Botiquín", "Vida"] },
    meta: { defenseRate: ["Módulo de reducción", "Desbloquea reducción de daño; cada nivel añade 1,2% al inicio."], slowModule: ["Módulo de control criogénico", "Desbloquea ralentización; cada nivel añade 1% al inicio."], knockbackModule: ["Módulo de repulsión cinética", "Desbloquea retroceso; cada nivel añade 0,7% al inicio."], reflectModule: ["Módulo de represalia reflectante", "Desbloquea contraataque; cada nivel añade dos niveles iniciales."], mineRadius: ["Radio de sensor de minas", "Desbloquea el radio de mina; cada nivel añade 6 px al inicio."], mineChance: ["Protocolo de minado automático", "Desbloquea minas; cada nivel añade 0,4% de activación."], fighterHangar: ["Hangar de cazas orbitales", "Desbloquea el escuadrón; cada nivel añade dos cazas iniciales, hasta ocho."], waveGold: ["Protocolo de oro por oleada", "Desbloquea oro por oleada; cada nivel añade 3 al superarla."], goldMultiplier: ["Núcleo multiplicador de minería", "Desbloquea el multiplicador; cada nivel añade 1,5% al ingreso inicial por bajas."], waveObsidian: ["Reciclador de obsidiana", "Desbloquea recompensas de obsidiana; cada nivel añade dos niveles de recuperación."], medkit: ["Botiquín de campaña", "Desbloquea el botiquín; cada nivel añade 4% de curación."], physicalDefense: ["Defensa física", "Reduce el daño por colisión y ataques físicos."], magicDefense: ["Defensa mágica", "Reduce los rayos remotos y el daño mágico."] },
    cards: { chance_slow: ["Cadena criogénica", "Control", "Los impactos pueden ralentizar con fuerza. Las estrellas aumentan probabilidad y duración."], blind_rounds: ["Munición cegadora", "Control", "Puede cegar, desactivar ataques remotos y frenar el avance enemigo."], defection: ["Protocolo de deserción", "Táctica", "Puede convertir enemigos básicos contra el Boss u objetivos prioritarios."], black_hole: ["Microagujero negro", "Control", "Agrupa enemigos en un punto. Las estrellas reducen el enfriamiento."], extra_row: ["Barrera de doble fila", "Daño", "Añade salvas laterales sincronizadas; las estrellas aumentan su daño."], mini_turret: ["Torreta de campo", "Invocación", "Despliega una torreta temporal de tiro rápido."], fighter: ["Caza orbital", "Invocación", "Despliega un caza orbital; el límite puede subir hasta ocho."] }
  },
  koExpansion: {
    ui: {
      workshopTab: "포탑 공방", workshopKicker: "포탑 공방", workshopTitle: "주포·보조포 파편 공방",
      openWorkshop: "Tier {tier}: 주포 {mainSlots}칸, 보조포 {supportSlots}칸. 같은 파편 50개로 포탑을 조립하고 성급을 올립니다.",
      mainSlots: "주포 슬롯", auxiliarySlots: "보조포 슬롯", mainTurrets: "주포", auxiliaryTurrets: "보조포", grade: "등급"
    },
    turrets: {
      emergency_shield: ["빈사 보호막 코어", "체력이 30% 아래로 내려가면 전투당 한 번 피해를 막는 보호막을 얻습니다."],
      frost_core: ["빙정 감속 코어", "명중 시 약한 피해와 1.5초 동안 5% 감속을 부여합니다."],
      flame_core: ["화염 점화 코어", "적을 점화해 지속 마법 피해를 줍니다."],
      full_hp_berserk: ["만피 광전 코어", "코어 체력이 100%일 때 광전 상태가 되어 공격 속도 +15%(랭크전 40%). 코어가 피해를 입으면 해제됩니다."],
      weakening_curse: ["약화 저주 코어", "매번 2연발로 무작위 적을 공격합니다. 명중한 적에게 저주 표식을 남겨 3초 동안 코어에 주는 피해를 15%(랭크전 35%) 줄입니다."],
      heavy_cannon: ["중형 대포 코어", "느리지만 강력합니다. 명중 시 충격파로 대상과 주변 적을 함께 뒤로 밀어냅니다."],
      pulse_quantum: ["추적 양자 포탑", "체력이 가장 높은 적을 고정 조준해 파괴할 때까지 공격합니다. 명중할 때마다 양자 펄스가 주변 적에게도 피해를 줍니다."],
      gatling: ["개틀링 기관포", "매우 빠르고 위력이 낮은 연사. 계속 쏠수록 총열이 빨라져 최대 60% 가속하며, 목표가 없으면 서서히 느려집니다."],
      split_cannon: ["2단 분열포", "포탄이 전진한 뒤 좌우 두 발로 갈라집니다."],
      arcane_core: ["비전 코어", "추적 에너지 구체가 작은 범위에 마법 폭발을 일으킵니다."],
      reflect_bastion: ["반사 금강 포탑", "코어가 들이받힐 때마다 그 피해를 흡수해 프리즘 고리가 한 칸 찹니다. 2칸이 차면 프리즘 충격파로 주변 모든 적에게 축적 피해의 몇 배(랭크전 8배, 일반 모드 6배)에 자신의 포탄 18발에 해당하는 일격을 더해 줍니다. 성급으로 피해 증가."],
      scatter_heavy: ["중형 산탄포", "공격마다 근거리 산탄 8발을 동시에 발사합니다."],
      double_burst: ["이중 연사 코어", "평행 관통탄 두 발을 빠르게 쏘아 일직선의 적을 꿰뚫습니다(각 최대 6체). 두 발 모두 맞은 적에게는 「쌍격 공명」으로 50% 추가 피해."],
      annihilation_laser: ["섬멸 레이저 포탑", "1.2초간 지속되는 섬멸 광선으로 선상의 모든 적을 관통합니다. 광선이 달아오를수록 단계마다 피해가 15% 증가합니다."],
      void_devourer: ["공허 포식 포탑", "처치를 누적하면(랭크전은 5회마다) 적 무리 속에 3초간 블랙홀을 소환합니다. 범위 안의 적은 붙잡혀 크게 느려지고 지속 피해를 받습니다."],
      vulnerability_mark: ["취약 표식 코어", "빠르게 난사하며 매 발 무작위 적에게 표식을 남겨 받는 모든 피해가 15%(랭크전 30%) 증가합니다. 표식된 보스 외 적은 체력 15% 미만이 되면 즉시 처형됩니다."],
      missile_nest: ["미사일 둥지", "소형 추적 미사일 6발을 일제 발사합니다. 하늘로 흩어졌다가 급강하해 목표를 추격하며, 재사용 10초 동안 포드에 장전 상태가 표시됩니다."],
      charged_laser: ["충전 레이저포", "3초 충전 후 고위력 레이저를 발사합니다."],
      frost_rail: ["빙결 레일 포탑", "지속 냉각 광선으로 선상의 적을 관통해 피해를 주고 5%(랭크전 20%) 감속합니다."],
      shield_generator: ["보호막 생성기", "하나당 코어가 받는 모든 피해를 2%(랭크전 6%, 최대 30%) 줄이고 코어에 육각 보호막을 펼칩니다. 들이받히면 물결이 퍼집니다. 성급으로 감소량 증가."],
      flame_sprayer: ["화염 분사 포탑", "적에게 연료탄을 던져 궤도 위에 3초간 불바다를 만듭니다(포탑당 최대 3곳). 지나가는 적은 지속 피해를 입고 불붙습니다."],
      long_range_sniper: ["장거리 저격포", "체력이 가장 높은 적(보스 우선)을 고정하고 초고속 레이저탄을 쏩니다. 매 발 반드시 치명타. 보스 피해 +50%."],
      chain_arc: ["연쇄 전기 포탑", "번개가 적 5기 사이를 튕기며, 맞은 적을 각각 0.5초간 마비시킵니다(크게 감속)."],
      crit_resonance: ["치명 공명 포탑", "인접 포탑과 공명: 치명타 확률 +5%(랭크전 +10%), 공명 중인 포탑은 치명타 피해가 2배가 됩니다."],
      time_slow: ["시공 감속 포탑", "시계 장치 감속장을 펼칩니다. 안의 적은 시간이 느려져 잔상을 남기며 5%(랭크전 20%) 감속합니다."],
      cluster_bomb: ["확산 폭탄 포탑", "명중하면 적 앞쪽 궤도에 지뢰를 설치합니다(포탑당 최대 4개). 적이 밟으면 폭발하고, 그 폭발이 근처 지뢰를 유폭시켜 연쇄 폭발합니다."],
      mining_gold: ["골드 채굴 포탑", "공격하지 않고 채굴에 전념: 매 웨이브 종료 시 추가 골드, 랭크전에서는 5초마다 골드 주머니(2＋성급)도 캐냅니다."],
      soul_drain: ["영혼 흡수 포탑", "처치한 적의 영혼을 뽑아 코어로 날려 체력을 0.5%(랭크전 1.5%) 회복합니다."],
      shadow_replica: ["그림자 복제 포탑", "필드에서 가장 강한 포탑의 그림자가 되어 같은 탄을 같은 특수 효과와 함께 쏩니다. 피해는 그 20%(랭크전 45%)."],
      antimatter: ["반물질 포탑", "포탑 위에서 반물질 구체를 천천히 응축한 뒤 무작위 적에게 던져 소멸 폭발을 일으킵니다. 범위 안의 적은 각자 최대 체력의 20%(보스는 절반)＋추가 기본 피해를 받습니다. 재사용 30초."]
    },
    upgrades: {
      barrageExpansion: ["탄막 확장", "공격"], giantBloodline: ["거인 혈통", "생명"], spellbladeTraining: ["마검 수련", "특수"],
      bloodCrit: ["흡혈 치명타", "생명"], deepFreeze: ["심층 동결", "특수"], orbitA: ["궤도 A", "특수"], orbitB: ["궤도 B", "특수"],
      staticField: ["정전기장", "범위"], demolitionExpert: ["폭파 전문가", "범위"], allIn: ["배수진", "특수"],
      energySaver: ["절전 코어", "특수"], curseAura: ["저주 오라", "범위"]
    },
    meta: {
      barrageExpansion: ["탄막 확장 모듈", "레벨마다 시작 공격 속도 +0.02%."],
      giantBloodline: ["거인 혈통 모듈", "레벨마다 시작 최대 체력 +2%, 공격 속도 -0.6%."],
      spellbladeTraining: ["마검 수련 모듈", "레벨마다 물리 공격의 0.06%를 마법 공격에 추가합니다."],
      bloodCrit: ["흡혈 치명타 모듈", "레벨마다 치명타 회복량 +2 HP."], deepFreeze: ["심층 동결 모듈", "빙결된 적이 받는 피해가 레벨마다 6% 증가합니다."],
      orbitA: ["궤도 A 제어기", "Tier 3에서 해금; 두 번째 중간 궤도를 영구 개방하며 1회만 구매할 수 있습니다."], orbitB: ["궤도 B 제어기", "Tier 3에서 해금; 세 번째 외곽 궤도를 영구 개방하며 1회만 구매할 수 있습니다."],
      staticField: ["정전기장 모듈", "레벨마다 주변 적에게 주는 초당 피해 +0.1% 마법 공격력."],
      demolitionExpert: ["폭파 전문가 모듈", "모든 범위 공격 반경이 레벨마다 0.2% 증가합니다."],
      allIn: ["배수진 모듈", "보조포 미장착 시 주포 피해가 레벨마다 2% 증가합니다."],
      energySaver: ["절전 코어 모듈", "기초 강화 비용을 레벨마다 1.5% 줄이며 최대 90%입니다."],
      curseAura: ["저주 오라 모듈", "새 적의 초기 체력을 레벨마다 0.04% 줄입니다."]
    }
  },
  ruExpansion: {
    ui: {
      workshopTab: "ЦЕХ БАШЕН", workshopKicker: "ЦЕХ БАШЕН", workshopTitle: "Цех главных и вспомогательных башен",
      openWorkshop: "Tier {tier}: главных слотов — {mainSlots}, вспомогательных — {supportSlots}. Для сборки и повышения звёзд нужно 50 одинаковых фрагментов.",
      mainSlots: "Главные слоты", auxiliarySlots: "Вспом. слоты", mainTurrets: "ГЛАВНЫЕ БАШНИ", auxiliaryTurrets: "ВСПОМОГАТЕЛЬНЫЕ БАШНИ", grade: "КЛАСС"
    },
    turrets: {
      emergency_shield: ["Ядро последнего щита", "При здоровье ниже 30% один раз за бой получает щит от урона."],
      frost_core: ["Кристалл заморозки", "Попадания замедляют на 5% на 1,5 секунды."],
      flame_core: ["Ядро воспламенения", "Поджигает врагов и наносит периодический магический урон."],
      full_hp_berserk: ["Ядро полной ярости", "При полном здоровье ядра впадает в ярость: +15% скорострельности (в рейтинге 40%). Любой урон ядру прекращает ярость."],
      weakening_curse: ["Ядро ослабления", "Стреляет очередью из 2 снарядов по случайным врагам. Поражённый враг получает метку проклятия: 3 с наносит ядру на 15% меньше урона (в рейтинге 35%)."],
      heavy_cannon: ["Ядро тяжёлой пушки", "Медленные мощные снаряды. Каждое попадание создаёт ударную волну, отбрасывающую цель и врагов рядом."],
      pulse_quantum: ["Импульсная квантовая башня", "Захватывает врага с наибольшим здоровьем и стреляет, пока он не уничтожен; каждое попадание даёт квантовый импульс по врагам рядом."],
      gatling: ["Пулемёт Гатлинга", "Очень быстрый огонь с малым уроном. Непрерывная стрельба раскручивает стволы до +60% скорости; без целей они замедляются."],
      split_cannon: ["Двухступенчатая пушка", "Снаряд разделяется на левый и правый после полёта."],
      arcane_core: ["Мистическое ядро", "Самонаводящиеся сферы взрываются магией по небольшой области."],
      reflect_bastion: ["Отражающий бастион", "Каждый таран ядра башня поглощает и заполняет одно деление призмы. При 2 делениях выпускает призменную волну по всем врагам рядом: урон, кратный накопленному (8× в рейтинге, 6× в обычном режиме), плюс удар силой 18 собственных снарядов. Звёзды усиливают."],
      scatter_heavy: ["Тяжёлый дробовик", "Каждая атака выпускает восемь ближних дробин."],
      double_burst: ["Ядро двойного залпа", "Быстро выпускает 2 параллельных пробивающих снаряда, прошивающих целый ряд врагов (до 6 каждый). Враг, поражённый обоими, вызывает «Двойной резонанс»: +50% урона."],
      annihilation_laser: ["Лазер уничтожения", "Выпускает луч уничтожения на 1,2 с, пробивающий всех врагов на линии; луч раскаляется, каждый импульс наносит на 15% больше."],
      void_devourer: ["Пожиратель пустоты", "Накопленные убийства (в рейтинге каждые 5) призывают в гущу врагов чёрную дыру на 3 с: попавшие в неё корабли удерживаются, сильно замедляются и получают постоянный урон."],
      vulnerability_mark: ["Ядро метки уязвимости", "Быстро стреляет вразброс: каждый выстрел метит случайного врага, и тот получает на 15% больше любого урона (в рейтинге 30%); помеченный враг (не босс) с здоровьем ниже 15% казнится мгновенно."],
      missile_nest: ["Ракетное гнездо", "Залп из шести самонаводящихся ракет: сначала разлетаются в небе, затем пикируют на цели; перезарядка 10 с, на установке видна загрузка."],
      charged_laser: ["Зарядная лазерная пушка", "После 3 секунд зарядки выпускает мощный лазер."],
      frost_rail: ["Морозная рельсовая башня", "Непрерывный замораживающий луч пробивает врагов на линии, нанося урон и замедляя на 5% (в рейтинге 20%)."],
      shield_generator: ["Генератор щита", "Каждый снижает весь урон по ядру на 2% (в рейтинге 6%, до 30%) и поднимает над ядром шестиугольный щит, по которому при таране идёт рябь; звёзды усиливают снижение."],
      flame_sprayer: ["Огнемётная башня", "Бросает зажигательные бомбы, которые разливают на трассе море огня на 3 с (до 3 очагов на башню); проходящие враги получают урон и загораются."],
      long_range_sniper: ["Дальнобойный снайпер", "Захватывает врага с наибольшим здоровьем (боссы в приоритете) и стреляет сверхбыстрыми лазерными зарядами, всегда критическими; +50% урона боссам."],
      chain_arc: ["Цепная дуговая башня", "Молния прыгает между 5 врагами и парализует каждого поражённого на 0,5 с (сильное замедление)."],
      crit_resonance: ["Башня резонанса критов", "Резонирует с соседними башнями: +5% шанса крита (в рейтинге +10%), а резонирующие башни наносят критами 2× урона."],
      time_slow: ["Башня замедления времени", "Создаёт часовое поле замедления: время для врагов внутри тянется, оставляя остаточные образы; замедление 5% (в рейтинге 20%)."],
      cluster_bomb: ["Кассетная башня", "Каждое попадание ставит мину на трассе перед врагами (до 4 на башню). Наступивший враг подрывает её, а взрыв детонирует соседние мины цепочкой."],
      mining_gold: ["Золотодобывающая башня", "Не атакует — добывает: бонусное золото после каждой волны, а в рейтинге ещё и мешочек золота каждые 5 с (2 + звёзды)."],
      soul_drain: ["Башня похищения душ", "Убийства вырывают душу врага, и она летит к ядру, восстанавливая 0,5% здоровья (в рейтинге 1,5%)."],
      shadow_replica: ["Теневая копия", "Становится тенью сильнейшей башни на поле: стреляет теми же снарядами с теми же особыми эффектами, нанося 20% её урона (в рейтинге 45%)."],
      antimatter: ["Башня антиматерии", "Медленно сгущает над башней шар антиматерии и бросает его в случайного врага, где тот аннигилирует: каждый враг во взрыве получает 20% своего максимального здоровья (боссы — вдвое меньше) плюс дополнительный базовый урон; перезарядка 30 с."]
    },
    upgrades: {
      barrageExpansion: ["Расширение залпа", "Атака"], giantBloodline: ["Кровь гиганта", "Жизнь"], spellbladeTraining: ["Магический клинок", "Особое"],
      bloodCrit: ["Кровавый крит", "Жизнь"], deepFreeze: ["Глубокая заморозка", "Особое"], orbitA: ["Орбита A", "Особое"], orbitB: ["Орбита B", "Особое"],
      staticField: ["Статическое поле", "Область"], demolitionExpert: ["Эксперт-подрывник", "Область"], allIn: ["Всё или ничего", "Особое"],
      energySaver: ["Энергосбережение", "Особое"], curseAura: ["Аура проклятия", "Область"]
    },
    meta: {
      barrageExpansion: ["Модуль расширения залпа", "Скорость огня на старте +0,02% за уровень."],
      giantBloodline: ["Модуль крови гиганта", "Максимум здоровья на старте +2%, скорость огня -0,6% за уровень."],
      spellbladeTraining: ["Модуль магического клинка", "Добавляет к магии 0,06% физической атаки за уровень."],
      bloodCrit: ["Модуль кровавого крита", "Лечение от крита +2 HP за уровень."], deepFreeze: ["Модуль глубокой заморозки", "Замороженные враги получают на 6% больше урона за уровень."],
      orbitA: ["Контроллер орбиты A", "Открывается на Tier 3; навсегда открывает среднюю орбиту, покупается один раз."], orbitB: ["Контроллер орбиты B", "Открывается на Tier 3; навсегда открывает внешнюю орбиту, покупается один раз."],
      staticField: ["Модуль статического поля", "Урон в секунду ближайшим врагам +0,1% магической атаки за уровень."],
      demolitionExpert: ["Модуль подрывника", "Радиус всех атак по области +0,2% за уровень."],
      allIn: ["Модуль «Всё или ничего»", "Без вспомогательных башен урон главных +2% за уровень."],
      energySaver: ["Модуль энергосбережения", "Стоимость базовых улучшений -1,5% за уровень, максимум 90%."],
      curseAura: ["Модуль ауры проклятия", "Начальное здоровье новых врагов -0,04% за уровень."]
    }
  },
  esExpansion: {
    ui: {
      workshopTab: "FORJA DE TORRETAS", workshopKicker: "FORJA DE TORRETAS", workshopTitle: "Forja de torretas principales y auxiliares",
      openWorkshop: "Tier {tier}: {mainSlots} espacios principales y {supportSlots} auxiliares. Reúne 50 fragmentos para montar y subir estrellas.",
      mainSlots: "Espacios principales", auxiliarySlots: "Espacios auxiliares", mainTurrets: "TORRETAS PRINCIPALES", auxiliaryTurrets: "TORRETAS AUXILIARES", grade: "GRADO"
    },
    turrets: {
      emergency_shield: ["Núcleo de escudo final", "Por debajo del 30% de vida, obtiene una barrera de daño una vez por partida."],
      frost_core: ["Núcleo de cristal gélido", "Los impactos ralentizan un 5% durante 1,5 segundos."],
      flame_core: ["Núcleo incendiario", "Prende a los enemigos e inflige daño mágico continuo."],
      full_hp_berserk: ["Núcleo furioso a plena vida", "Con el núcleo a vida máxima entra en furia: +15% de cadencia (40% en Clasificatoria). Cualquier daño al núcleo la termina."],
      weakening_curse: ["Núcleo de maldición débil", "Dispara 2 proyectiles a enemigos al azar. Los alcanzados llevan una marca de maldición: durante 3 s hacen un 15% menos de daño al núcleo (35% en Clasificatoria)."],
      heavy_cannon: ["Núcleo de cañón pesado", "Proyectiles lentos y potentes. Cada impacto lanza una onda expansiva que empuja al objetivo y a los enemigos cercanos."],
      pulse_quantum: ["Torreta cuántica de pulso", "Fija al enemigo con más vida y dispara hasta destruirlo; cada impacto libera un pulso cuántico que alcanza a los enemigos cercanos."],
      gatling: ["Ametralladora Gatling", "Disparo muy rápido y de bajo daño. Disparar sin parar acelera los cañones hasta un 60%; sin objetivos se frenan poco a poco."],
      split_cannon: ["Cañón divisor de dos fases", "El proyectil se divide a izquierda y derecha tras avanzar."],
      arcane_core: ["Núcleo arcano", "Orbes guiados explotan con magia en un área pequeña."],
      reflect_bastion: ["Bastión reflectante", "Cada embestida al núcleo carga un segmento del prisma con ese daño. Con 2 cargas libera una onda prismática que golpea a todos los enemigos cercanos con un múltiplo del daño acumulado (8× en Clasificatoria, 6× en modo normal) más un golpe equivalente a 18 de sus proyectiles. Las estrellas lo aumentan."],
      scatter_heavy: ["Cañón de dispersión pesado", "Dispara ocho perdigones de corto alcance por ataque."],
      double_burst: ["Núcleo de doble ráfaga", "Dispara rápido 2 proyectiles perforantes paralelos que atraviesan toda una fila de enemigos (hasta 6 cada uno). Un enemigo alcanzado por ambos activa Resonancia doble: +50% de daño."],
      annihilation_laser: ["Láser de aniquilación", "Dispara un rayo de aniquilación de 1,2 s que atraviesa a todos los enemigos de su línea; se calienta y cada pulso hace un 15% más."],
      void_devourer: ["Devorador del vacío", "Las bajas acumuladas (cada 5 en Clasificatoria) invocan entre los enemigos un agujero negro de 3 s: las naves atrapadas quedan retenidas, muy ralentizadas y reciben daño continuo."],
      vulnerability_mark: ["Núcleo de marca vulnerable", "Dispara rápido y al azar: cada disparo marca a un enemigo aleatorio, que recibe un 15% más de todo el daño (30% en Clasificatoria); un enemigo marcado que no sea jefe por debajo del 15% de vida es ejecutado al instante."],
      missile_nest: ["Nido de misiles", "Lanza seis micromisiles guiados que se dispersan por el cielo y luego caen en picado sobre los objetivos; recarga de 10 s, con la recarga visible en el lanzador."],
      charged_laser: ["Cañón láser cargado", "Carga 3 segundos y dispara un láser de gran daño."],
      frost_rail: ["Torreta de riel gélido", "Proyecta un rayo congelante continuo que atraviesa a los enemigos de su línea, dañándolos y ralentizando un 5 % (20 % en Clasificatoria)."],
      shield_generator: ["Generador de escudo", "Cada uno reduce un 2 % todo el daño al núcleo (6 % en Clasificatoria, hasta 30 %) y despliega un escudo hexagonal sobre él que ondula al ser embestido; las estrellas aumentan la reducción."],
      flame_sprayer: ["Torreta lanzallamas", "Lanza bombas de combustible que crean en la pista un mar de fuego de 3 s (hasta 3 por torreta); los enemigos que lo cruzan sufren daño continuo y arden."],
      long_range_sniper: ["Francotirador de largo alcance", "Fija al enemigo con más vida (jefes primero) y dispara rayos láser ultrarrápidos que siempre son críticos; +50 % de daño a jefes."],
      chain_arc: ["Torreta de arco encadenado", "El rayo salta entre 5 enemigos y paraliza a cada uno que alcanza durante 0,5 s (ralentización fuerte)."],
      crit_resonance: ["Torreta de resonancia crítica", "Resuena con las torretas vecinas: +5 % de probabilidad crítica (10 % en Clasificatoria) y las torretas en resonancia hacen críticos de 2× daño."],
      time_slow: ["Torreta de ralentización temporal", "Proyecta un campo de relojería: el tiempo se arrastra para los enemigos dentro, que dejan estelas, ralentizados un 5 % (20 % en Clasificatoria)."],
      cluster_bomb: ["Torreta de bomba de racimo", "Cada impacto coloca una mina en la pista delante de los enemigos (hasta 4 por torreta). Al pisarla estalla, y la explosión detona las minas cercanas en cadena."],
      mining_gold: ["Torreta minera de oro", "No ataca, solo excava: oro extra tras cada oleada y, en Clasificatoria, una bolsa de oro cada 5 s (2 + estrellas)."],
      soul_drain: ["Torreta de drenaje de alma", "Las bajas arrancan el alma del enemigo, que vuela al núcleo y restaura un 0,5 % de su vida (1,5 % en Clasificatoria)."],
      shadow_replica: ["Torreta réplica sombría", "Se convierte en la sombra de la torreta más fuerte del campo: dispara los mismos proyectiles con los mismos efectos especiales al 20 % de su daño (45 % en Clasificatoria)."],
      antimatter: ["Torreta de antimateria", "Condensa poco a poco una esfera de antimateria sobre la torreta y la lanza a un enemigo al azar, donde se aniquila: cada enemigo en la explosión recibe el 20 % de su vida máxima (la mitad los jefes) más daño base adicional; recarga de 30 s."]
    },
    upgrades: {
      barrageExpansion: ["Expansión de ráfaga", "Ataque"], giantBloodline: ["Linaje gigante", "Vida"], spellbladeTraining: ["Disciplina mágica", "Especial"],
      bloodCrit: ["Crítico sanguíneo", "Vida"], deepFreeze: ["Congelación profunda", "Especial"], orbitA: ["Órbita A", "Especial"], orbitB: ["Órbita B", "Especial"],
      staticField: ["Campo estático", "Área"], demolitionExpert: ["Experto en demolición", "Área"], allIn: ["Todo o nada", "Especial"],
      energySaver: ["Núcleo eficiente", "Especial"], curseAura: ["Aura maldita", "Área"]
    },
    meta: {
      barrageExpansion: ["Módulo de expansión", "Velocidad de ataque inicial +0,02% por nivel."],
      giantBloodline: ["Módulo de linaje gigante", "Vida máxima inicial +2% y velocidad -0,6% por nivel."],
      spellbladeTraining: ["Módulo de disciplina mágica", "Añade a magia un 0,06% del ataque físico por nivel."],
      bloodCrit: ["Módulo de crítico sanguíneo", "Curación crítica +2 de vida por nivel."], deepFreeze: ["Módulo de congelación profunda", "Los enemigos congelados reciben un 6% más de daño por nivel."],
      orbitA: ["Control de órbita A", "Se desbloquea en Tier 3; abre para siempre la órbita intermedia y solo se compra una vez."], orbitB: ["Control de órbita B", "Se desbloquea en Tier 3; abre para siempre la órbita exterior y solo se compra una vez."],
      staticField: ["Módulo de campo estático", "Daño por segundo a enemigos cercanos +0,1% del ataque mágico por nivel."],
      demolitionExpert: ["Módulo de demolición", "Aumenta un 0,2% por nivel el radio de todos los ataques de área."],
      allIn: ["Módulo Todo o nada", "Sin torretas auxiliares, el daño principal sube un 2% por nivel."],
      energySaver: ["Módulo de ahorro", "Reduce un 1,5% por nivel el coste de mejoras básicas, hasta un 90%."],
      curseAura: ["Módulo de aura maldita", "Los nuevos enemigos empiezan con un 0,04% menos de vida por nivel."]
    }
  }
};

const V2_EXPANSION_I18N = {
  zh: {
    ui: {
      workshopTab: "砲台工坊", workshopKicker: "砲台工坊", workshopTitle: "主砲與副砲碎片工坊",
      openWorkshop: "階級 {tier}：主砲 {mainSlots} 格、副砲 {supportSlots} 格。50 枚同型碎片可組裝並升星。",
      mainSlots: "主砲欄位", auxiliarySlots: "副砲欄位", mainTurrets: "主砲", auxiliaryTurrets: "副砲", grade: "強度"
    },
    turrets: {
      emergency_shield: ["殘血護盾核", "生命低於 30% 時，每局自動獲得 1 次傷害護盾。"],
      frost_core: ["冰晶減速核", "命中造成少量傷害，並附帶 5% 減速 1.5 秒。"],
      flame_core: ["烈焰點燃核", "命中使敵人陷入灼燒，持續受到魔法傷害。"],
      full_hp_berserk: ["滿血狂暴核", "核心生命維持 100% 時進入狂暴，攻速提高 15%（排位 40%）；核心一受傷就解除。"],
      weakening_curse: ["虛弱詛咒核", "每次 2 連發、隨機射向敵機；被命中的敵機背上詛咒印記，3 秒內撞擊核心的傷害降低 15%（排位 35%）。"],
      heavy_cannon: ["重型加農核", "攻速慢、單發傷害高；命中時炸出衝擊波，把目標和周圍的敵機一起往回推。"],
      pulse_quantum: ["追脈量子塔", "鎖定全場生命值最高的敵機，打到擊毀才換目標；每次命中釋放量子脈衝，波及周圍敵機。"],
      gatling: ["加特林機槍", "極高攻速、單發傷害低；連續射擊會越轉越快，最高再快 60%，沒有目標時慢慢停轉。"],
      split_cannon: ["兩段分裂砲", "子彈前進一段距離後，分裂為左右兩發。"],
      arcane_core: ["奧術核心", "發射追蹤能量球，命中後造成小範圍魔法爆破。"],
      reflect_bastion: ["反射金剛塔", "核心每被撞一次就吸收這次傷害，砲台上的稜鏡環填滿一格；吸滿 2 次放出稜鏡衝擊波，對周圍所有敵機造成累積傷害的數倍（排位 8 倍、主遊戲 6 倍），再加上相當於 18 發自身砲彈的重擊。升星提高傷害。"],
      scatter_heavy: ["散彈重砲", "每次攻擊同時發射 8 發近距離擴散彈丸。"],
      double_burst: ["雙重連射核", "快速射出 2 道平行貫穿彈，沿直線穿透整排敵機（每道最多 6 架）；同一架被兩道都打中時觸發「雙擊共振」，追加 50% 傷害。"],
      annihilation_laser: ["毀滅雷射塔", "發射一道持續 1.2 秒的毀滅光束，貫穿射線上所有敵機；光束越燒越熱，每段傷害遞增 15%。"],
      void_devourer: ["虛空吞噬塔", "累積擊殺（排位每 5 次）後，在敵群中召喚 3 秒的黑洞：範圍內敵機被吸住大幅減速，並持續受到傷害。"],
      vulnerability_mark: ["易傷標記核", "快速亂射、每發隨機標記一架敵機，使其承受的所有傷害提高 15%（排位 30%）；被標記的非首領敵機血量低於 15% 時直接處決。"],
      missile_nest: ["飛彈巢", "一次齊射 6 發微型追蹤飛彈：先往空中散開，再俯衝追擊目標，冷卻 10 秒；彈艙會顯示裝填進度。"],
      charged_laser: ["充能雷射砲", "蓄力 3 秒後發射一發高傷害毀滅雷射。"],
      frost_rail: ["冰霜導軌塔", "持續發射冰凍射線，貫穿射線上的敵機，造成傷害並減速 5%（排位 20%）。"],
      shield_generator: ["護盾產生器", "每座讓核心受到的所有傷害降低 2%（排位 6%，最多 30%），並在核心張開六角護盾，被撞時泛起漣漪；升星會提高減傷幅度。"],
      flame_sprayer: ["烈焰噴射塔", "朝敵機拋出火油彈，落地在軌道上燃起持續 3 秒的火海（每座最多 3 片），經過的敵機持續受傷並著火。"],
      long_range_sniper: ["狙擊長程砲", "鎖定血量最高的敵機（首領優先），射出極速雷射彈，每發必定暴擊；對首領傷害 +50%。"],
      chain_arc: ["連鎖電弧塔", "閃電在 5 個敵機之間彈跳，每個被電到的敵機麻痺 0.5 秒（大幅減速）。"],
      crit_resonance: ["暴擊共鳴塔", "與相鄰砲台共鳴：附近砲台暴擊率 +5%（排位 +10%），且共鳴中的砲台暴擊傷害提高到 2 倍。"],
      time_slow: ["時空遲緩塔", "展開時鐘遲緩場，場內敵機時間變慢、拖出殘影，減速 5%（排位 20%）。"],
      cluster_bomb: ["擴散爆彈塔", "命中後在敵機前方的軌道埋下地雷（每座最多 4 顆），敵機踩到就爆炸；爆炸會引爆附近的地雷，形成連環爆。"],
      mining_gold: ["採礦金幣塔", "不攻擊，專心挖礦：每波結束提供額外金幣；排位中還會每 5 秒挖出一袋金幣（2＋星級）。"],
      soul_drain: ["靈魂汲取塔", "擊殺敵機時抽出它的靈魂，飛回核心恢復 0.5% 生命值（排位 1.5%）。"],
      shadow_replica: ["影子複製塔", "化身場上最強砲台的影子：射出和它一樣的子彈、帶著同樣的特殊效果，傷害為其 20%（排位 45%）。"],
      antimatter: ["反物質塔", "在砲台上方慢慢凝聚反物質球，滿了就隨機射向一架敵機並湮滅爆開：範圍內每架敵機受到自身最大生命 20%（首領減半）＋額外基礎傷害，冷卻 30 秒。"]
    },
    upgrades: {
      barrageExpansion: ["彈幕擴張", "攻擊"], giantBloodline: ["巨人血脈", "生命"], spellbladeTraining: ["魔武雙修", "特殊"],
      bloodCrit: ["汲血暴擊", "生命"], deepFreeze: ["深度凍結", "特殊"], orbitA: ["軌道 A", "特殊"], orbitB: ["軌道 B", "特殊"],
      staticField: ["靜電場", "範圍"], demolitionExpert: ["爆破專家", "範圍"], allIn: ["孤注一擲", "特殊"],
      energySaver: ["節能核心", "特殊"], curseAura: ["詛咒光環", "範圍"]
    },
    meta: {
      barrageExpansion: ["彈幕擴張模組", "解鎖彈幕擴張；每級開局攻速 +0.02%。"],
      giantBloodline: ["巨人血脈模組", "解鎖巨人血脈；每級開局最大生命 +2%，攻速 -0.6%。"],
      spellbladeTraining: ["魔武雙修模組", "每級將物攻的 0.06% 額外加成到魔攻。"],
      bloodCrit: ["汲血暴擊模組", "每級讓暴擊回復量 +2 點生命。"],
      deepFreeze: ["深度凍結模組", "冰凍敵人承受的傷害每級提高 6%。"],
      orbitA: ["軌道 A 控制器", "Tier 3 解鎖；永久開啟第二圈（中圈）砲台軌道，僅可購買一次。"], orbitB: ["軌道 B 控制器", "Tier 3 解鎖；永久開啟第三圈（外圈）砲台軌道，僅可購買一次。"],
      staticField: ["靜電場模組", "每級讓附近敵人每秒受到的傷害 +0.1% 魔攻。"],
      demolitionExpert: ["爆破專家模組", "每級提高所有範圍傷害的爆炸半徑 0.2%。"],
      allIn: ["孤注一擲模組", "未安裝副砲時，主砲傷害每級提高 2%。"],
      energySaver: ["節能核心模組", "基礎數值升級金幣花費每級降低 1.5%，上限 90%。"],
      curseAura: ["詛咒光環模組", "新生成敵人的初始生命每級降低 0.04%。"]
    }
  },
  en: {
    ui: {
      workshopTab: "TURRET WORKSHOP", workshopKicker: "TURRET WORKSHOP", workshopTitle: "Main & Auxiliary Turret Workshop",
      openWorkshop: "Tier {tier}: {mainSlots} main slots and {supportSlots} auxiliary slots. Use 50 matching fragments to assemble or rank up.",
      mainSlots: "Main slots", auxiliarySlots: "Aux slots", mainTurrets: "MAIN TURRETS", auxiliaryTurrets: "AUXILIARY TURRETS", grade: "GRADE"
    },
    turrets: {
      emergency_shield: ["Last-Stand Shield Core", "Below 30% HP, gains one damage-blocking shield once per run."],
      frost_core: ["Frost Crystal Core", "Hits deal light damage and slow by 5% for 1.5 seconds."],
      flame_core: ["Ignition Core", "Hits ignite enemies and deal ongoing magic damage."],
      full_hp_berserk: ["Full-HP Berserker Core", "Goes berserk while the core is at full health: +15% fire rate (40% in Ranked). Any core damage ends it."],
      weakening_curse: ["Weakening Curse Core", "Fires 2 shots at random enemies. Hit enemies carry a curse mark: for 3 seconds they deal 15% less damage to the core (35% in Ranked)."],
      heavy_cannon: ["Heavy Cannon Core", "Slow, powerful shells. Each hit blasts a shockwave that pushes the target and nearby enemies back."],
      pulse_quantum: ["Pulse Quantum Turret", "Locks onto the enemy with the most health and keeps firing until it is destroyed; each hit releases a quantum pulse that hits nearby enemies."],
      gatling: ["Gatling Gun", "Very high fire rate, low damage per shot. Sustained fire spins the barrels up to 60% faster; they wind down with no target."],
      split_cannon: ["Two-Stage Split Cannon", "Shells split into left and right shots after traveling."],
      arcane_core: ["Arcane Core", "Tracking energy orbs explode in a small magic area."],
      reflect_bastion: ["Reflective Bastion", "Each time the core is rammed, the turret absorbs that damage and fills one prism charge. At 2 charges it releases a prism shockwave hitting every nearby enemy for a multiple of the stored damage (8× in Ranked, 6× in main mode) plus a blow worth 18 of its own shells. Stars raise it."],
      scatter_heavy: ["Heavy Scatter Cannon", "Fires eight close-range pellets with every attack."],
      double_burst: ["Double Burst Core", "Rapidly fires 2 parallel piercing rounds that tear through a whole line of enemies (up to 6 each). An enemy struck by both triggers Twin Resonance for +50% damage."],
      annihilation_laser: ["Annihilation Laser", "Fires a 1.2-second annihilation beam that pierces every enemy on its line; the beam heats up, each pulse dealing 15% more."],
      void_devourer: ["Void Devourer", "Accumulated kills (every 5 in Ranked) summon a 3-second black hole among the enemies: ships caught inside are held, heavily slowed and keep taking damage."],
      vulnerability_mark: ["Vulnerability Mark Core", "Rapid scattershots each mark a random enemy so it takes 15% more damage from everything (30% in Ranked); a marked non-boss enemy below 15% health is executed instantly."],
      missile_nest: ["Missile Nest", "Fires a volley of six micro homing missiles that scatter into the sky, then dive onto targets; 10-second cooldown, with the pod showing its reload."],
      charged_laser: ["Charged Laser Cannon", "Charges for 3 seconds, then fires a high-damage laser."],
      frost_rail: ["Frost Rail Turret", "Projects a continuous freezing ray that pierces enemies on its line, damaging them and slowing by 5% (20% in Ranked)."],
      shield_generator: ["Shield Generator", "Each one reduces all damage to the core by 2% (6% in Ranked, up to 30%) and raises a hex shield over the core that ripples when rammed; stars raise the reduction."],
      flame_sprayer: ["Flame Sprayer", "Lobs fuel bombs that burst into a 3-second sea of fire on the track (up to 3 per turret); enemies passing through keep taking damage and catch fire."],
      long_range_sniper: ["Long-Range Sniper", "Locks onto the enemy with the most health (bosses first) and fires ultra-fast laser bolts that always crit; +50% damage to bosses."],
      chain_arc: ["Chain Arc Turret", "Lightning jumps between 5 enemies, paralysing each one it strikes for 0.5 seconds (heavily slowed)."],
      crit_resonance: ["Critical Resonance Turret", "Resonates with neighbouring turrets: +5% crit chance (10% in Ranked), and resonating turrets crit for 2× damage."],
      time_slow: ["Temporal Slow Turret", "Projects a clockwork slow field: time drags for enemies inside, leaving afterimages, slowed by 5% (20% in Ranked)."],
      cluster_bomb: ["Cluster Bomb Turret", "Each hit plants a mine on the track ahead of the enemies (up to 4 per turret). Enemies that step on one set it off, and the blast detonates nearby mines in a chain."],
      mining_gold: ["Gold Mining Turret", "Does not attack — it mines: bonus Gold after every wave, and in Ranked it also digs up a pouch of Gold every 5 seconds (2 + stars)."],
      soul_drain: ["Soul Drain Turret", "Kills tear out the enemy's soul, which flies back to heal the core for 0.5% of its health (1.5% in Ranked)."],
      shadow_replica: ["Shadow Replica Turret", "Becomes the shadow of the strongest turret on the field: fires the same rounds with the same special effects at 20% of its damage (45% in Ranked)."],
      antimatter: ["Antimatter Turret", "Slowly condenses an antimatter orb above the turret, then hurls it at a random enemy where it annihilates: every enemy in the blast takes 20% of its own maximum health (half for bosses) plus extra base damage; 30-second cooldown."]
    },
    upgrades: {
      barrageExpansion: ["Barrage Expansion", "Attack"], giantBloodline: ["Giant Bloodline", "Life"], spellbladeTraining: ["Spellblade Training", "Special"],
      bloodCrit: ["Blood Crit", "Life"], deepFreeze: ["Deep Freeze", "Special"], orbitA: ["Orbit A", "Special"], orbitB: ["Orbit B", "Special"],
      staticField: ["Static Field", "Area"], demolitionExpert: ["Demolition Expert", "Area"], allIn: ["All In", "Special"],
      energySaver: ["Energy Saver", "Special"], curseAura: ["Curse Aura", "Area"]
    },
    meta: {
      barrageExpansion: ["Barrage Expansion Module", "Unlocks Barrage Expansion; +0.02% starting fire rate per level."],
      giantBloodline: ["Giant Bloodline Module", "Unlocks Giant Bloodline; +2% starting max HP and -0.6% fire rate per level."],
      spellbladeTraining: ["Spellblade Module", "Adds 0.06% of physical attack to magic attack per level."],
      bloodCrit: ["Blood Crit Module", "Critical healing gains +2 HP per level."],
      deepFreeze: ["Deep Freeze Module", "Frozen enemies take 6% more damage per level."],
      orbitA: ["Orbit A Controller", "Unlocks at Tier 3; permanently opens the middle turret orbit and can be bought once."], orbitB: ["Orbit B Controller", "Unlocks at Tier 3; permanently opens the outer turret orbit and can be bought once."],
      staticField: ["Static Field Module", "Nearby damage per second gains 0.1% of magic attack per level."],
      demolitionExpert: ["Demolition Module", "Increases all area-effect radii by 0.2% per level."],
      allIn: ["All-In Module", "With no auxiliary turrets equipped, main turret damage rises 2% per level."],
      energySaver: ["Energy Saver Module", "Cuts basic in-run upgrade costs by 1.5% per level, up to 90%."],
      curseAura: ["Curse Aura Module", "New enemies start with 0.04% less health per level."]
    }
  },
  ja: {
    ui: {
      workshopTab: "砲台工房", workshopKicker: "砲台工房", workshopTitle: "主砲・副砲フラグメント工房",
      openWorkshop: "Tier {tier}：主砲{mainSlots}枠、副砲{supportSlots}枠。同型フラグメント50個で組立・昇星します。",
      mainSlots: "主砲枠", auxiliarySlots: "副砲枠", mainTurrets: "主砲", auxiliaryTurrets: "副砲", grade: "等級"
    },
    turrets: {
      emergency_shield: ["瀕死シールドコア", "HP30%未満で、1ランに一度だけ攻撃を防ぐシールドを得る。"],
      frost_core: ["氷晶減速コア", "命中時に小ダメージと5%減速を1.5秒付与。"],
      flame_core: ["烈火点火コア", "命中した敵を燃焼させ、継続魔法ダメージを与える。"],
      full_hp_berserk: ["満タン狂戦コア", "コアHPが100%の間は狂戦状態になり攻撃速度+15%（ランク戦は40%）。コアが傷つくと解除。"],
      weakening_curse: ["弱体呪詛コア", "毎回2連射でランダムな敵を撃つ。命中した敵に呪いの印を刻み、3秒間コアへのダメージを15%（ランク戦は35%）低下。"],
      heavy_cannon: ["重砲コア", "低速・高威力。命中時に衝撃波を放ち、標的と周囲の敵をまとめて押し戻す。"],
      pulse_quantum: ["追脈量子砲", "最もHPの高い敵をロックし、撃破するまで攻撃し続ける。命中ごとに量子パルスが周囲の敵にも当たる。"],
      gatling: ["ガトリング砲", "超高速・低威力の連射。撃ち続けるほど砲身が回転し最大60%加速、標的がいないと徐々に減速。"],
      split_cannon: ["二段分裂砲", "弾が進んだ後、左右2発に分裂する。"],
      arcane_core: ["秘術コア", "追尾エネルギー弾が小範囲の魔法爆発を起こす。"],
      reflect_bastion: ["反射金剛砲", "コアが体当たりされるたびにそのダメージを吸収し、プリズム環が1段たまる。2段で周囲の全敵へプリズム衝撃波を放ち、蓄えたダメージの数倍（ランク戦8倍、通常モード6倍）に自身の砲弾18発分を加えた一撃を与える。星でダメージアップ。"],
      scatter_heavy: ["重散弾砲", "攻撃ごとに近距離散弾を8発同時射撃。"],
      double_burst: ["二連射コア", "平行な貫通弾2発を高速で放ち、直線上の敵をまとめて貫く（各最大6体）。両方に当たった敵には「双撃共鳴」で50%追加。"],
      annihilation_laser: ["殲滅レーザー砲", "1.2秒間続く殲滅光線を放ち、射線上の全敵を貫通。光線は熱を増し、1段ごとにダメージ15%上昇。"],
      void_devourer: ["虚空捕食砲", "撃破を重ねると（ランク戦は5回ごと）敵群の中へ3秒間のブラックホールを召喚。範囲内の敵は捕らえられて大きく減速し、継続ダメージを受ける。"],
      vulnerability_mark: ["脆弱標識コア", "高速で乱れ撃ち、1発ごとにランダムな敵へ標識を付け全被ダメージ+15%（ランク戦は30%）。標識されたボス以外の敵はHP15%未満で即座に処刑。"],
      missile_nest: ["ミサイルネスト", "小型追尾ミサイル6発を斉射。空へ散開してから急降下で標的を追う。クールダウン10秒、ポッドに装填状況を表示。"],
      charged_laser: ["充填レーザー砲", "3秒チャージ後、高威力レーザーを発射。"],
      frost_rail: ["氷霜レール砲", "持続する冷凍光線を照射し、射線上の敵を貫いてダメージと5%（ランク戦は20%）減速を与える。"],
      shield_generator: ["シールド発生器", "1基ごとにコアへの全ダメージを2%軽減（ランク戦は6%、最大30%）し、コアに六角シールドを張る。体当たりされると波紋が走る。星で軽減率アップ。"],
      flame_sprayer: ["火炎放射砲", "敵へ燃料弾を投げ、落ちた軌道上に3秒間の火の海を広げる（1基最大3か所）。通過する敵は継続ダメージを受けて燃える。"],
      long_range_sniper: ["長距離狙撃砲", "最もHPの高い敵（ボス優先）をロックし、超高速レーザー弾を放つ。毎発必ず会心。ボスへのダメージ+50%。"],
      chain_arc: ["連鎖電弧砲", "雷撃が5体の敵を跳ね、当たった敵をそれぞれ0.5秒麻痺させる（大幅減速）。"],
      crit_resonance: ["会心共鳴砲", "隣接する砲台と共鳴：会心率+5%（ランク戦は+10%）、共鳴中の砲台は会心ダメージが2倍に。"],
      time_slow: ["時空遅延砲", "時計仕掛けの遅延フィールドを展開。内部の敵は時間が遅れて残像を引き、5%（ランク戦は20%）減速。"],
      cluster_bomb: ["拡散爆弾砲", "命中すると敵の前方の軌道に地雷を設置（1基最大4個）。敵が踏むと爆発し、その爆発が近くの地雷を誘爆して連鎖する。"],
      mining_gold: ["採掘金貨砲", "攻撃せず採掘に専念：各ウェーブ終了時に追加ゴールド。ランク戦では5秒ごとにゴールド袋（2＋星数）も掘り出す。"],
      soul_drain: ["魂吸収砲", "撃破した敵の魂を抜き取り、コアへ飛ばしてHPを0.5%（ランク戦は1.5%）回復。"],
      shadow_replica: ["影複製砲", "場で最強の砲台の影となり、同じ弾を同じ特殊効果付きで撃つ。ダメージはその20%（ランク戦は45%）。"],
      antimatter: ["反物質砲", "砲台の上で反物質球をゆっくり凝縮し、ランダムな敵へ放って消滅爆発。範囲内の敵はそれぞれ自身の最大HPの20%（ボスは半分）＋追加の基礎ダメージを受ける。クールダウン30秒。"]
    },
    upgrades: {
      barrageExpansion: ["弾幕拡張", "攻撃"], giantBloodline: ["巨人血統", "生命"], spellbladeTraining: ["魔武両修", "特殊"],
      bloodCrit: ["吸血会心", "生命"], deepFreeze: ["深度凍結", "特殊"], orbitA: ["軌道A", "特殊"], orbitB: ["軌道B", "特殊"],
      staticField: ["静電場", "範囲"], demolitionExpert: ["爆破専門家", "範囲"], allIn: ["背水の陣", "特殊"],
      energySaver: ["省エネコア", "特殊"], curseAura: ["呪詛オーラ", "範囲"]
    },
    meta: {
      barrageExpansion: ["弾幕拡張モジュール", "1レベルごとに開始時攻速+0.02%。"],
      giantBloodline: ["巨人血統モジュール", "1レベルごとに開始時最大HP+2%、攻速-0.6%。"],
      spellbladeTraining: ["魔武両修モジュール", "物攻の0.06%をレベルごとに魔攻へ加算。"],
      bloodCrit: ["吸血会心モジュール", "会心回復量を1レベルごとに+2HP。"], deepFreeze: ["深度凍結モジュール", "凍結中の敵の被ダメージをレベルごとに6%増加。"],
      orbitA: ["軌道A制御器", "Tier 3で解放。中軌道を永久開放し、購入は1回のみ。"], orbitB: ["軌道B制御器", "Tier 3で解放。外軌道を永久開放し、購入は1回のみ。"],
      staticField: ["静電場モジュール", "周囲の敵への毎秒ダメージをレベルごとに魔攻+0.1%。"],
      demolitionExpert: ["爆破専門モジュール", "全範囲攻撃の半径をレベルごとに0.2%増加。"],
      allIn: ["背水モジュール", "副砲未装備時、主砲ダメージをレベルごとに2%増加。"],
      energySaver: ["省エネコアモジュール", "基本強化コストをレベルごとに1.5%軽減、上限90%。"],
      curseAura: ["呪詛オーラモジュール", "新しい敵の初期HPをレベルごとに0.04%減少。"]
    }
  }
};

for (const language of ["ko", "ru", "es"]) {
  const pack = window.V2_I18N[language];
  const expansion = window.V2_I18N[`${language}Expansion`];
  if (!pack || !expansion) continue;
  Object.assign(pack.ui, expansion.ui || {});
  Object.assign(pack.turrets, expansion.turrets || {});
  Object.assign(pack.upgrades, expansion.upgrades || {});
  Object.assign(pack.meta, expansion.meta || {});
  delete window.V2_I18N[`${language}Expansion`];
}

for (const [language, expansion] of Object.entries(V2_EXPANSION_I18N)) {
  const pack = window.V2_I18N[language];
  if (!pack) continue;
  Object.assign(pack.ui, expansion.ui || {});
  Object.assign(pack.turrets, expansion.turrets || {});
  Object.assign(pack.upgrades, expansion.upgrades || {});
  Object.assign(pack.meta, expansion.meta || {});
}

const V2_WORKSHOP_AND_BACKGROUND_I18N = {
  zh: {
    ui: { equipped: "已裝備", owned: "持有", decrease: "卸下 1 座", increase: "裝備 1 座" },
    backgroundStore: {
      kicker: "外觀戰備庫", title: "戰場背景商店",
      description: "購買並裝備專屬戰場。全部高級背景都會讓局內金幣與黑曜石獲取提升 2%。",
      buy: "購買並裝備", equip: "裝備", equipped: "已裝備", owned: "已擁有", defaultAction: "恢復預設背景",
      insufficient: "太空幣不足", purchaseSuccess: "背景已購買並裝備。", equipSuccess: "背景已裝備。", defaultSuccess: "已恢復預設戰場背景。",
      price: "10,000 太空幣", effect: "金幣、黑曜石獲取 ×1.02",
      items: {
        gilded_citadel: ["黃金天穹要塞", "金鑄環城與恆星熔爐包圍戰線，像在帝國王座前迎戰。"],
        obsidian_singularity: ["黑曜石奇點", "紫晶尖塔環繞微型奇點，冷冽能量沿戰場邊緣脈動。"],
        aurora_garden: ["極光量子庭園", "青藍晶林與極光共振，打造清澈而華麗的異星戰區。"]
      }
    }
  },
  en: {
    ui: { equipped: "Equipped", owned: "Owned", decrease: "Unequip one", increase: "Equip one" },
    backgroundStore: {
      kicker: "COSMIC ARMORY", title: "Battlefield Backgrounds",
      description: "Buy and equip an exclusive battlefield. Every premium background grants +2% Gold and Obsidian earned in battle.",
      buy: "Buy & Equip", equip: "Equip", equipped: "Equipped", owned: "Owned", defaultAction: "Use Default Background",
      insufficient: "Not enough Space Coins", purchaseSuccess: "Background purchased and equipped.", equipSuccess: "Background equipped.", defaultSuccess: "Default battlefield restored.",
      price: "10,000 Space Coins", effect: "Gold & Obsidian earned ×1.02",
      items: {
        gilded_citadel: ["Gilded Sky Citadel", "A stellar forge and golden ring-city frame every battle like an imperial throne."],
        obsidian_singularity: ["Obsidian Singularity", "Violet crystal spires orbit a micro-singularity pulsing along the combat perimeter."],
        aurora_garden: ["Aurora Quantum Garden", "Cyan crystal groves resonate beneath an aurora in a pristine alien warzone."]
      }
    }
  },
  ja: {
    ui: { equipped: "装備中", owned: "所持", decrease: "1基外す", increase: "1基装備" },
    backgroundStore: {
      kicker: "コズミック武装庫", title: "戦場背景ストア",
      description: "専用戦場を購入して装備。高級背景はすべて、戦闘中のゴールドと黒曜石獲得量を2%増加させます。",
      buy: "購入して装備", equip: "装備", equipped: "装備中", owned: "所持済み", defaultAction: "標準背景に戻す",
      insufficient: "スペースコイン不足", purchaseSuccess: "背景を購入して装備しました。", equipSuccess: "背景を装備しました。", defaultSuccess: "標準戦場に戻しました。",
      price: "10,000 スペースコイン", effect: "ゴールド・黒曜石獲得 ×1.02",
      items: {
        gilded_citadel: ["黄金天空要塞", "恒星炉と黄金の環状都市が、帝国の玉座のように戦線を包む。"],
        obsidian_singularity: ["黒曜石シンギュラリティ", "紫晶の尖塔が小型特異点を囲み、戦場外周に冷たい力が脈動する。"],
        aurora_garden: ["オーロラ量子庭園", "青緑の結晶林と極光が共鳴する、鮮麗な異星戦域。"]
      }
    }
  },
  ko: {
    ui: { equipped: "장착됨", owned: "보유", decrease: "1문 해제", increase: "1문 장착" },
    backgroundStore: {
      kicker: "코스믹 무기고", title: "전장 배경 상점",
      description: "전용 전장을 구매하고 장착하세요. 모든 고급 배경은 전투 골드와 흑요석 획득량을 2% 높입니다.",
      buy: "구매 및 장착", equip: "장착", equipped: "장착됨", owned: "보유", defaultAction: "기본 배경 사용",
      insufficient: "스페이스 코인이 부족합니다", purchaseSuccess: "배경을 구매하고 장착했습니다.", equipSuccess: "배경을 장착했습니다.", defaultSuccess: "기본 전장으로 복원했습니다.",
      price: "10,000 스페이스 코인", effect: "골드·흑요석 획득 ×1.02",
      items: {
        gilded_citadel: ["황금 천공 요새", "항성 용광로와 황금 환상 도시가 황제의 왕좌처럼 전선을 감쌉니다."],
        obsidian_singularity: ["흑요석 특이점", "보랏빛 수정 첨탑이 소형 특이점을 돌며 전장 가장자리에 냉기를 퍼뜨립니다."],
        aurora_garden: ["오로라 양자 정원", "청록 수정 숲과 오로라가 공명하는 선명하고 화려한 외계 전장입니다."]
      }
    }
  },
  ru: {
    ui: { equipped: "Установлено", owned: "В наличии", decrease: "Снять одну", increase: "Установить одну" },
    backgroundStore: {
      kicker: "КОСМИЧЕСКИЙ АРСЕНАЛ", title: "Фоны поля боя",
      description: "Покупайте и выбирайте уникальные поля боя. Каждый премиальный фон даёт +2% к золоту и обсидиану в бою.",
      buy: "Купить и выбрать", equip: "Выбрать", equipped: "Выбрано", owned: "Куплено", defaultAction: "Вернуть стандартный фон",
      insufficient: "Недостаточно космомонет", purchaseSuccess: "Фон куплен и выбран.", equipSuccess: "Фон выбран.", defaultSuccess: "Стандартное поле боя восстановлено.",
      price: "10 000 космомонет", effect: "Золото и обсидиан ×1,02",
      items: {
        gilded_citadel: ["Золотая небесная цитадель", "Звёздная кузница и золотой город-кольцо превращают битву в защиту имперского трона."],
        obsidian_singularity: ["Обсидиановая сингулярность", "Фиолетовые кристаллы окружают микросингулярность и пульсируют по краю поля."],
        aurora_garden: ["Квантовый сад авроры", "Бирюзовые кристальные рощи сияют под авророй на чистом инопланетном фронте."]
      }
    }
  },
  es: {
    ui: { equipped: "Equipada", owned: "En posesión", decrease: "Quitar una", increase: "Equipar una" },
    backgroundStore: {
      kicker: "ARSENAL CÓSMICO", title: "Fondos de batalla",
      description: "Compra y equipa un campo exclusivo. Todos los fondos prémium aumentan un 2% el oro y la obsidiana obtenidos en combate.",
      buy: "Comprar y equipar", equip: "Equipar", equipped: "Equipada", owned: "Comprado", defaultAction: "Usar fondo original",
      insufficient: "No tienes suficientes monedas espaciales", purchaseSuccess: "Fondo comprado y equipado.", equipSuccess: "Fondo equipado.", defaultSuccess: "Campo de batalla original restaurado.",
      price: "10.000 monedas espaciales", effect: "Oro y obsidiana ×1,02",
      items: {
        gilded_citadel: ["Ciudadela celeste dorada", "Una forja estelar y una ciudad anular dorada enmarcan la batalla como un trono imperial."],
        obsidian_singularity: ["Singularidad de obsidiana", "Agujas de cristal violeta orbitan una microsingularidad que pulsa en el perímetro."],
        aurora_garden: ["Jardín cuántico de aurora", "Bosques de cristal cian resuenan bajo una aurora en un frente alienígena impecable."]
      }
    }
  }
};

for (const [language, translation] of Object.entries(V2_WORKSHOP_AND_BACKGROUND_I18N)) {
  const pack = window.V2_I18N[language];
  if (!pack) continue;
  Object.assign(pack.ui, translation.ui || {});
  pack.backgroundStore = translation.backgroundStore;
}

// One authoritative language bundle for every v2 interface added after launch.
// New controls must be added here in all six languages before they are rendered.
const V2_CENTRAL_I18N = {
  zh: {
    controls: { settings: "設定", pause: "暫停", resume: "繼續", home: "首頁" },
    home: {
      heroKicker: "軌道指揮中心", heroSubtitle: "整備砲台、選擇戰區，守住最後一道星際防線。",
      missionKicker: "作戰部署", missionTitle: "選擇作戰階級",
      pilotKicker: "駕駛員連線", pilotTitle: "登入並同步進度"
    },
    autoUpgrade: {
      title: "自動升級", hint: "達到設定金幣後，依選定順序自動購買並循環。",
      enabled: "啟用", threshold: "啟動金幣", edit: "調整", on: "自動：開", off: "自動：關",
      empty: "請至少選擇 1 項升級", storeTab: "商店",
      labels: {
        attack: "物攻", magic: "魔攻", speed: "攻速", hp: "生命", regen: "回血", critChance: "暴率", critDamage: "暴傷",
        defenseRate: "防禦率", physicalArmor: "物理護甲", magicArmor: "魔法護甲", slowModule: "緩速模組",
        knockbackModule: "擊退模組", reflectModule: "反傷模組", mineRadius: "地雷範圍", mineChance: "地雷機率",
        fighterCap: "戰機上限", waveGold: "每波金幣", goldMultiplier: "金幣倍率", waveObsidian: "每波黑曜石",
        medkit: "醫療包", barrageExpansion: "彈幕擴張", giantBloodline: "巨人血統", spellbladeTraining: "魔劍士訓練",
        bloodCrit: "血性暴擊", deepFreeze: "深度凍結", orbitA: "軌道砲 A", orbitB: "軌道砲 B",
        staticField: "靜電場", demolitionExpert: "爆破專家", allIn: "孤注一擲", energySaver: "節能模式", curseAura: "詛咒光環"
      }
    },
    backgroundStore: {
      description: "購買並裝備專屬戰場。全部 10 款高級背景都會讓局內金幣與黑曜石獲取提升 2%。",
      price: "10,000 太空幣",
      items: {
        crimson_event_horizon: ["赤紅事件視界", "血紅吸積盤撕裂黑暗，讓每一波進攻都像末日倒數。"],
        emerald_machine_world: ["翠綠機械星環", "遠古巨構與翡翠能源脈絡環抱一座沉睡的機械世界。"],
        glacial_star_cathedral: ["冰星大教堂", "冰藍晶柱在星光中延伸，構成寂靜而莊嚴的宇宙聖殿。"],
        solar_forge_throne: ["太陽熔爐王座", "熔金環帶與恆星鍛造場點亮帝王般的灼熱戰線。"],
        neon_orbit_metropolis: ["霓虹軌道都會", "青紫霓虹城市沿行星弧線閃耀，像永不熄滅的未來夜景。"],
        astral_ruins_sanctum: ["星界遺跡聖所", "漂浮古蹟與金色星圖守護被遺忘的深空祕境。"],
        prismatic_wormhole: ["稜彩蟲洞", "彩色引力光帶扭曲星海，通往無法預測的下一個宇宙。"]
      }
    },
    rewardedAds: {
      supplyKicker: "每日補給訊號", supplyTitle: "黑曜石補給",
      supplyDescription: "所有玩家皆可使用；每次完成獎勵式廣告可獲得 5 黑曜石，每日最多 5 次。",
      watchSupply: "觀看廣告 · +5", unlimited: "每日最多 5 次",
      dailyRemaining: "今日剩餘：{remaining}/{limit}", supplyComplete: "今日補給已領完",
      granted: "已獲得 5 黑曜石。", loading: "正在準備獎勵廣告……", unavailable: "目前沒有可播放的獎勵廣告，請稍後再試。",
      failed: "廣告未完整播放，因此沒有發放獎勵。",
      reviveKicker: "緊急重啟", reviveTitle: "緊急復活",
      reviveDescription: "第 10 波後每局可復活一次，回復 50% 核心生命並清除眼前敵機。",
      watchRevive: "看廣告復活", spendRevive: "使用 30 黑曜石", useReviveTicket: "使用復活卷", insufficientObsidian: "黑曜石不足",
      reviveUsed: "本局復活已使用", revived: "核心重新啟動，戰鬥繼續！"
    }
  },
  en: {
    controls: { settings: "Settings", pause: "Pause", resume: "Resume", home: "Home" },
    home: {
      heroKicker: "ORBITAL COMMAND", heroSubtitle: "Configure the arsenal, select a sector, and hold the final interstellar line.",
      missionKicker: "DEPLOYMENT", missionTitle: "Select Battle Tier",
      pilotKicker: "PILOT LINK", pilotTitle: "Sign In & Sync Progress"
    },
    autoUpgrade: {
      title: "Auto Upgrade", hint: "At the Gold threshold, buy selected upgrades in a repeating order.",
      enabled: "Enabled", threshold: "Start at Gold", edit: "Edit", on: "AUTO: ON", off: "AUTO: OFF",
      empty: "Select at least one upgrade", storeTab: "Store",
      labels: {
        attack: "Physical ATK", magic: "Magic ATK", speed: "Attack Speed", hp: "Health", regen: "Regeneration",
        critChance: "Crit Chance", critDamage: "Crit Damage", defenseRate: "Defense Rate", physicalArmor: "Physical Armor",
        magicArmor: "Magic Armor", slowModule: "Slow Module", knockbackModule: "Knockback Module", reflectModule: "Reflect Module",
        mineRadius: "Mine Radius", mineChance: "Mine Chance", fighterCap: "Fighter Limit", waveGold: "Wave Gold",
        goldMultiplier: "Gold Multiplier", waveObsidian: "Wave Obsidian", medkit: "Medkit", barrageExpansion: "Barrage Expansion",
        giantBloodline: "Giant Bloodline", spellbladeTraining: "Spellblade Training", bloodCrit: "Blood Crit",
        deepFreeze: "Deep Freeze", orbitA: "Orbital Cannon A", orbitB: "Orbital Cannon B", staticField: "Static Field",
        demolitionExpert: "Demolition Expert", allIn: "All In", energySaver: "Energy Saver", curseAura: "Curse Aura"
      }
    },
    backgroundStore: {
      description: "Buy and equip an exclusive battlefield. All 10 premium backgrounds grant +2% Gold and Obsidian earned in battle.",
      price: "10,000 Space Coins",
      items: {
        crimson_event_horizon: ["Crimson Event Horizon", "A blood-red accretion disk tears through the dark and turns every wave into a final countdown."],
        emerald_machine_world: ["Emerald Machine World", "Ancient megastructures and emerald power veins encircle a sleeping mechanical planet."],
        glacial_star_cathedral: ["Glacial Star Cathedral", "Ice-blue crystal pillars rise through starlight to form a silent cosmic sanctuary."],
        solar_forge_throne: ["Solar Forge Throne", "Molten-gold rings and a stellar foundry ignite an imperial battle line."],
        neon_orbit_metropolis: ["Neon Orbit Metropolis", "Cyan and violet towers glow along a planetary arc like an endless future night."],
        astral_ruins_sanctum: ["Astral Ruins Sanctum", "Floating relics and golden star maps guard a forgotten deep-space sanctuary."],
        prismatic_wormhole: ["Prismatic Wormhole", "Bands of spectral gravity twist the stars toward an unknowable universe beyond."]
      }
    },
    rewardedAds: {
      supplyKicker: "DAILY SUPPLY SIGNAL", supplyTitle: "Obsidian Supply",
      supplyDescription: "Available to every player. Complete a rewarded ad for 5 Obsidian, up to 5 times daily.",
      watchSupply: "Watch Ad · +5", unlimited: "Up to 5 daily",
      dailyRemaining: "Claims left today: {remaining}/{limit}", supplyComplete: "Today's supply is complete",
      granted: "5 Obsidian received.", loading: "Preparing rewarded ad…", unavailable: "No rewarded ad is available right now. Try again later.",
      failed: "The ad was not completed, so no reward was granted.",
      reviveKicker: "EMERGENCY REBOOT", reviveTitle: "Emergency Revive",
      reviveDescription: "After Wave 10, revive once per run with 50% Core HP and clear nearby hostiles.",
      watchRevive: "Watch Ad to Revive", spendRevive: "Spend 30 Obsidian", useReviveTicket: "Use Revive Ticket", insufficientObsidian: "Not enough Obsidian",
      reviveUsed: "Revive already used this run", revived: "Core rebooted. Battle resumed!"
    }
  },
  ja: {
    controls: { settings: "設定", pause: "一時停止", resume: "再開", home: "ホーム" },
    home: {
      heroKicker: "軌道司令部", heroSubtitle: "砲台を整備し、戦域を選び、最後の星間防衛線を守れ。",
      missionKicker: "作戦展開", missionTitle: "バトルTierを選択",
      pilotKicker: "パイロットリンク", pilotTitle: "ログインして進行を同期"
    },
    autoUpgrade: {
      title: "自動強化", hint: "指定ゴールドに達すると、選択した強化を順番に繰り返し購入します。",
      enabled: "有効", threshold: "開始ゴールド", edit: "調整", on: "自動：ON", off: "自動：OFF",
      empty: "強化を1つ以上選択", storeTab: "ストア",
      labels: {
        attack: "物理攻撃", magic: "魔法攻撃", speed: "攻撃速度", hp: "生命", regen: "回復", critChance: "会心率",
        critDamage: "会心ダメージ", defenseRate: "防御率", physicalArmor: "物理装甲", magicArmor: "魔法装甲",
        slowModule: "減速モジュール", knockbackModule: "ノックバック", reflectModule: "反射モジュール",
        mineRadius: "地雷範囲", mineChance: "地雷確率", fighterCap: "戦闘機上限", waveGold: "ウェーブゴールド",
        goldMultiplier: "ゴールド倍率", waveObsidian: "ウェーブ黒曜石", medkit: "医療キット",
        barrageExpansion: "弾幕拡張", giantBloodline: "巨人の血統", spellbladeTraining: "魔剣訓練",
        bloodCrit: "血の会心", deepFreeze: "ディープフリーズ", orbitA: "軌道砲A", orbitB: "軌道砲B",
        staticField: "静電場", demolitionExpert: "爆破の達人", allIn: "オールイン", energySaver: "省エネ", curseAura: "呪いのオーラ"
      }
    },
    backgroundStore: {
      description: "専用戦場を購入して装備。全10種の高級背景は戦闘中のゴールドと黒曜石獲得量を2%増加させます。",
      price: "10,000 スペースコイン",
      items: {
        crimson_event_horizon: ["深紅の事象の地平面", "血紅の降着円盤が闇を裂き、全ウェーブを終末への秒読みに変える。"],
        emerald_machine_world: ["翠緑の機械世界", "古代巨大構造物と翠の動力線が眠る機械惑星を取り囲む。"],
        glacial_star_cathedral: ["氷星大聖堂", "氷青の結晶柱が星明かりへ伸び、静かな宇宙聖堂を形作る。"],
        solar_forge_throne: ["太陽炉の玉座", "溶融金の環と恒星工廠が帝王の戦線を燃え上がらせる。"],
        neon_orbit_metropolis: ["ネオン軌道都市", "青紫の塔群が惑星弧に沿って輝く、終わらない未来の夜。"],
        astral_ruins_sanctum: ["星界遺跡の聖域", "浮遊遺跡と黄金の星図が忘れられた深宇宙の聖所を守る。"],
        prismatic_wormhole: ["プリズムワームホール", "虹色の重力帯が星海を歪め、未知の宇宙へ続いている。"]
      }
    },
    rewardedAds: {
      supplyKicker: "デイリー補給信号", supplyTitle: "黒曜石補給",
      supplyDescription: "すべてのプレイヤーが利用できます。広告を最後まで見ると黒曜石5個、1日5回まで。",
      watchSupply: "広告を見る · +5", unlimited: "1日5回まで",
      dailyRemaining: "本日の残り：{remaining}/{limit}", supplyComplete: "本日の補給は完了しました",
      granted: "黒曜石を5個獲得しました。", loading: "リワード広告を準備中…", unavailable: "現在再生できる広告がありません。後でもう一度お試しください。",
      failed: "広告が完了しなかったため、報酬は付与されませんでした。",
      reviveKicker: "緊急再起動", reviveTitle: "緊急復活",
      reviveDescription: "ウェーブ10以降、1ゲームに1回だけコアHP50%で復活し、周囲の敵を排除します。",
      watchRevive: "広告を見て復活", spendRevive: "黒曜石30個を使用", useReviveTicket: "復活券を使用", insufficientObsidian: "黒曜石が不足",
      reviveUsed: "このゲームでは復活済み", revived: "コア再起動。戦闘再開！"
    }
  },
  ko: {
    controls: { settings: "설정", pause: "일시정지", resume: "계속", home: "홈" },
    home: {
      heroKicker: "궤도 사령부", heroSubtitle: "포탑을 정비하고 전장을 선택해 최후의 성간 방어선을 지키세요.",
      missionKicker: "작전 배치", missionTitle: "전투 Tier 선택",
      pilotKicker: "파일럿 링크", pilotTitle: "로그인 및 진행 동기화"
    },
    autoUpgrade: {
      title: "자동 강화", hint: "설정한 골드에 도달하면 선택한 강화를 순서대로 반복 구매합니다.",
      enabled: "사용", threshold: "시작 골드", edit: "조정", on: "자동: 켬", off: "자동: 끔",
      empty: "강화를 1개 이상 선택하세요", storeTab: "상점",
      labels: {
        attack: "물리 공격", magic: "마법 공격", speed: "공격 속도", hp: "생명력", regen: "재생", critChance: "치명타 확률",
        critDamage: "치명타 피해", defenseRate: "방어율", physicalArmor: "물리 방어", magicArmor: "마법 방어",
        slowModule: "감속 모듈", knockbackModule: "넉백 모듈", reflectModule: "반사 모듈", mineRadius: "지뢰 범위",
        mineChance: "지뢰 확률", fighterCap: "전투기 상한", waveGold: "웨이브 골드", goldMultiplier: "골드 배율",
        waveObsidian: "웨이브 흑요석", medkit: "구급 키트", barrageExpansion: "탄막 확장", giantBloodline: "거인 혈통",
        spellbladeTraining: "마검사 훈련", bloodCrit: "혈기 치명타", deepFreeze: "심층 동결", orbitA: "궤도포 A",
        orbitB: "궤도포 B", staticField: "정전기장", demolitionExpert: "폭파 전문가", allIn: "올인",
        energySaver: "절전 모드", curseAura: "저주 오라"
      }
    },
    backgroundStore: {
      description: "전용 전장을 구매하고 장착하세요. 고급 배경 10종은 모두 전투 골드와 흑요석 획득량을 2% 높입니다.",
      price: "10,000 스페이스 코인",
      items: {
        crimson_event_horizon: ["진홍빛 사건의 지평선", "핏빛 강착 원반이 암흑을 가르며 모든 웨이브를 종말의 카운트다운으로 만듭니다."],
        emerald_machine_world: ["에메랄드 기계 행성", "고대 거대 구조물과 녹색 동력선이 잠든 기계 행성을 감쌉니다."],
        glacial_star_cathedral: ["빙성 대성당", "얼음빛 수정 기둥이 별빛 속에 솟아 고요한 우주 성소를 이룹니다."],
        solar_forge_throne: ["태양 용광로 왕좌", "용융 금빛 고리와 항성 공장이 제왕의 전선을 불태웁니다."],
        neon_orbit_metropolis: ["네온 궤도 도시", "청보라색 도시가 행성의 곡선을 따라 끝없는 미래의 밤처럼 빛납니다."],
        astral_ruins_sanctum: ["성계 유적 성소", "부유 유적과 황금 별자리가 잊힌 심우주 성소를 지킵니다."],
        prismatic_wormhole: ["프리즘 웜홀", "무지갯빛 중력 띠가 별바다를 뒤틀어 미지의 우주로 이어집니다."]
      }
    },
    rewardedAds: {
      supplyKicker: "일일 보급 신호", supplyTitle: "흑요석 보급",
      supplyDescription: "모든 플레이어가 이용할 수 있습니다. 보상형 광고를 끝까지 보면 흑요석 5개, 하루 최대 5회입니다.",
      watchSupply: "광고 보기 · +5", unlimited: "하루 최대 5회",
      dailyRemaining: "오늘 남은 횟수: {remaining}/{limit}", supplyComplete: "오늘 보급을 모두 받았습니다",
      granted: "흑요석 5개를 받았습니다.", loading: "보상형 광고 준비 중…", unavailable: "현재 이용 가능한 광고가 없습니다. 잠시 후 다시 시도하세요.",
      failed: "광고를 끝까지 보지 않아 보상이 지급되지 않았습니다.",
      reviveKicker: "비상 재부팅", reviveTitle: "비상 부활",
      reviveDescription: "웨이브 10 이후 게임당 1회, 코어 HP 50%로 부활하고 주변 적을 제거합니다.",
      watchRevive: "광고 보고 부활", spendRevive: "흑요석 30개 사용", useReviveTicket: "부활권 사용", insufficientObsidian: "흑요석 부족",
      reviveUsed: "이번 게임에서 이미 부활함", revived: "코어 재부팅 완료. 전투 재개!"
    }
  },
  ru: {
    controls: { settings: "Настройки", pause: "Пауза", resume: "Продолжить", home: "Главная" },
    home: {
      heroKicker: "ОРБИТАЛЬНОЕ КОМАНДОВАНИЕ", heroSubtitle: "Настройте орудия, выберите сектор и удержите последний межзвёздный рубеж.",
      missionKicker: "РАЗВЁРТЫВАНИЕ", missionTitle: "Выберите боевой Tier",
      pilotKicker: "СВЯЗЬ С ПИЛОТОМ", pilotTitle: "Вход и синхронизация"
    },
    autoUpgrade: {
      title: "Автоулучшение", hint: "При достижении порога золота выбранные улучшения покупаются по кругу.",
      enabled: "Включено", threshold: "Порог золота", edit: "Изменить", on: "АВТО: ВКЛ", off: "АВТО: ВЫКЛ",
      empty: "Выберите хотя бы одно улучшение", storeTab: "Магазин",
      labels: {
        attack: "Физ. атака", magic: "Маг. атака", speed: "Скорость атаки", hp: "Здоровье", regen: "Регенерация",
        critChance: "Шанс крита", critDamage: "Урон крита", defenseRate: "Защита", physicalArmor: "Физ. броня",
        magicArmor: "Маг. броня", slowModule: "Модуль замедления", knockbackModule: "Модуль отбрасывания",
        reflectModule: "Модуль отражения", mineRadius: "Радиус мин", mineChance: "Шанс мины", fighterCap: "Лимит истребителей",
        waveGold: "Золото за волну", goldMultiplier: "Множитель золота", waveObsidian: "Обсидиан за волну",
        medkit: "Аптечка", barrageExpansion: "Расширение залпа", giantBloodline: "Кровь гиганта",
        spellbladeTraining: "Тренировка магоклинка", bloodCrit: "Кровавый крит", deepFreeze: "Глубокая заморозка",
        orbitA: "Орбитальная пушка A", orbitB: "Орбитальная пушка B", staticField: "Статическое поле",
        demolitionExpert: "Эксперт-подрывник", allIn: "Ва-банк", energySaver: "Экономия энергии", curseAura: "Аура проклятия"
      }
    },
    backgroundStore: {
      description: "Покупайте и выбирайте уникальные поля боя. Все 10 премиальных фонов дают +2% к золоту и обсидиану.",
      price: "10 000 космомонет",
      items: {
        crimson_event_horizon: ["Багровый горизонт событий", "Кровавый аккреционный диск разрывает тьму и превращает каждую волну в обратный отсчёт."],
        emerald_machine_world: ["Изумрудный мир-машина", "Древние мегаструктуры и зелёные энергоканалы окружают спящую механическую планету."],
        glacial_star_cathedral: ["Ледяной звёздный собор", "Ледяные кристаллы поднимаются к звёздам, образуя безмолвное космическое святилище."],
        solar_forge_throne: ["Трон солнечной кузницы", "Расплавленные золотые кольца и звёздный завод зажигают имперский рубеж."],
        neon_orbit_metropolis: ["Неоновый орбитальный мегаполис", "Бирюзово-фиолетовый город сияет вдоль дуги планеты, как бесконечная ночь будущего."],
        astral_ruins_sanctum: ["Святилище астральных руин", "Парящие реликвии и золотые звёздные карты охраняют забытое убежище дальнего космоса."],
        prismatic_wormhole: ["Призматическая червоточина", "Радужные полосы гравитации искажают звёзды и ведут в неизвестную вселенную."]
      }
    },
    rewardedAds: {
      supplyKicker: "ЕЖЕДНЕВНЫЙ СИГНАЛ", supplyTitle: "Запас обсидиана",
      supplyDescription: "Доступно всем игрокам. За просмотр рекламы с наградой — 5 обсидиана, не более 5 раз в день.",
      watchSupply: "Смотреть · +5", unlimited: "До 5 раз в день",
      dailyRemaining: "Осталось сегодня: {remaining}/{limit}", supplyComplete: "Запас на сегодня получен",
      granted: "Получено 5 обсидиана.", loading: "Подготовка рекламы с наградой…", unavailable: "Сейчас реклама недоступна. Повторите позже.",
      failed: "Реклама не была просмотрена полностью, награда не выдана.",
      reviveKicker: "АВАРИЙНЫЙ ЗАПУСК", reviveTitle: "Экстренное возрождение",
      reviveDescription: "После волны 10 — одно возрождение за бой с 50% HP ядра и зачисткой ближайших врагов.",
      watchRevive: "Реклама и возрождение", spendRevive: "Потратить 30 обсидиана", useReviveTicket: "Использовать билет", insufficientObsidian: "Недостаточно обсидиана",
      reviveUsed: "Возрождение уже использовано", revived: "Ядро перезапущено. Бой продолжается!"
    }
  },
  es: {
    controls: { settings: "Ajustes", pause: "Pausa", resume: "Continuar", home: "Inicio" },
    home: {
      heroKicker: "COMANDO ORBITAL", heroSubtitle: "Configura las torretas, elige un sector y defiende la última línea interestelar.",
      missionKicker: "DESPLIEGUE", missionTitle: "Selecciona el Tier",
      pilotKicker: "ENLACE DE PILOTO", pilotTitle: "Inicia sesión y sincroniza"
    },
    autoUpgrade: {
      title: "Mejora automática", hint: "Al alcanzar el oro indicado, compra las mejoras seleccionadas en ciclo.",
      enabled: "Activa", threshold: "Oro inicial", edit: "Ajustar", on: "AUTO: SÍ", off: "AUTO: NO",
      empty: "Elige al menos una mejora", storeTab: "Tienda",
      labels: {
        attack: "Ataque físico", magic: "Ataque mágico", speed: "Vel. de ataque", hp: "Vida", regen: "Regeneración",
        critChance: "Prob. crítica", critDamage: "Daño crítico", defenseRate: "Defensa", physicalArmor: "Armadura física",
        magicArmor: "Armadura mágica", slowModule: "Módulo lento", knockbackModule: "Módulo de empuje",
        reflectModule: "Módulo de reflejo", mineRadius: "Radio de mina", mineChance: "Prob. de mina",
        fighterCap: "Límite de cazas", waveGold: "Oro por oleada", goldMultiplier: "Multiplicador de oro",
        waveObsidian: "Obsidiana por oleada", medkit: "Botiquín", barrageExpansion: "Expansión de andanada",
        giantBloodline: "Linaje gigante", spellbladeTraining: "Entrenamiento mágico", bloodCrit: "Crítico sangriento",
        deepFreeze: "Congelación profunda", orbitA: "Cañón orbital A", orbitB: "Cañón orbital B",
        staticField: "Campo estático", demolitionExpert: "Experto en demolición", allIn: "Todo o nada",
        energySaver: "Ahorro de energía", curseAura: "Aura de maldición"
      }
    },
    backgroundStore: {
      description: "Compra y equipa un campo exclusivo. Los 10 fondos prémium aumentan un 2% el oro y la obsidiana obtenidos.",
      price: "10.000 monedas espaciales",
      items: {
        crimson_event_horizon: ["Horizonte carmesí", "Un disco de acreción rojo sangre rasga la oscuridad y convierte cada oleada en una cuenta atrás."],
        emerald_machine_world: ["Mundo máquina esmeralda", "Megaestructuras antiguas y líneas verdes de energía rodean un planeta mecánico dormido."],
        glacial_star_cathedral: ["Catedral estelar glacial", "Pilares de cristal helado ascienden entre las estrellas formando un santuario cósmico."],
        solar_forge_throne: ["Trono de la forja solar", "Anillos de oro fundido y una forja estelar encienden un frente imperial."],
        neon_orbit_metropolis: ["Metrópolis orbital de neón", "Torres cian y violeta brillan sobre el arco planetario como una noche futura sin fin."],
        astral_ruins_sanctum: ["Santuario de ruinas astrales", "Reliquias flotantes y mapas estelares dorados protegen un santuario olvidado."],
        prismatic_wormhole: ["Agujero de gusano prismático", "Bandas de gravedad multicolor retuercen las estrellas hacia un universo desconocido."]
      }
    },
    rewardedAds: {
      supplyKicker: "SEÑAL DIARIA", supplyTitle: "Suministro de obsidiana",
      supplyDescription: "Disponible para todos los jugadores. Completa un anuncio con recompensa para recibir 5 de obsidiana, hasta 5 veces al día.",
      watchSupply: "Ver anuncio · +5", unlimited: "Hasta 5 al día",
      dailyRemaining: "Restantes hoy: {remaining}/{limit}", supplyComplete: "Suministro diario completado",
      granted: "Has recibido 5 de obsidiana.", loading: "Preparando anuncio con recompensa…", unavailable: "No hay anuncios disponibles ahora. Inténtalo más tarde.",
      failed: "El anuncio no se completó y no se entregó la recompensa.",
      reviveKicker: "REINICIO DE EMERGENCIA", reviveTitle: "Reanimación de emergencia",
      reviveDescription: "Tras la oleada 10, revive una vez por partida con 50% de vida y elimina enemigos cercanos.",
      watchRevive: "Ver anuncio y revivir", spendRevive: "Usar 30 de obsidiana", useReviveTicket: "Usar cupón de reanimación", insufficientObsidian: "No hay suficiente obsidiana",
      reviveUsed: "Ya reviviste en esta partida", revived: "Núcleo reiniciado. ¡Continúa la batalla!"
    }
  }
};

for (const [language, translation] of Object.entries(V2_CENTRAL_I18N)) {
  const pack = window.V2_I18N[language];
  if (!pack) continue;
  pack.controls = translation.controls;
  pack.home = translation.home;
  pack.autoUpgrade = translation.autoUpgrade;
  pack.rewardedAds = translation.rewardedAds;
  pack.backgroundStore = {
    ...(pack.backgroundStore || {}),
    ...translation.backgroundStore,
    items: {
      ...(pack.backgroundStore?.items || {}),
      ...(translation.backgroundStore?.items || {})
    }
  };
}

/*
 * Canonical app-shell language bundle.
 *
 * The home navigation, Codex and Workshop used to be assembled from several
 * generations of language tables. Keep every visible shell string together
 * here so changing the language on the home screen updates the whole app.
 */
const V2_APP_SHELL_I18N = {
  zh: {
    currency: { obsidian: "黑曜石", spaceCoin: "太空幣", starDust: "星塵" },
    policy: "隱私權政策與帳號刪除",
    home: {
      heroKicker: "軌道指揮中心", heroSubtitle: "整備砲台、選擇戰區，守住最後一道星際防線。",
      missionKicker: "作戰部署", missionTitle: "作戰階級",
      pilotKicker: "駕駛員連線", pilotTitle: "登入",
      appDownloadKicker: "ANDROID APP", appDownloadLabel: "立即下載",
      screenLabel: "遊戲首頁", sectionsLabel: "首頁功能", tierLabel: "作戰階級"
    },
    ui: {
      playTab: "出擊", tasksTab: "任務", codexTab: "敵機圖鑑", workshopTab: "砲台工坊", storeTab: "商店", locked: "鎖定",
      codexKicker: "敵機檔案", codexTitle: "敵機圖鑑",
      codexDescription: "查看已發現敵機的能力、出現條件與反制方式。",
      workshopKicker: "砲台工坊", workshopTitle: "砲台工坊",
      openWorkshop: "Tier {tier} · 主砲 {mainSlots} 格 · 副砲 {supportSlots} 格 · 50 枚同型碎片可組裝並升星",
      mainSlots: "主砲槽", auxiliarySlots: "副砲槽", assembled: "已組裝", heldFragments: "碎片總數",
      mainTurrets: "主砲", auxiliaryTurrets: "副砲", grade: "等級", fragments: "碎片",
      build: "組裝", equipped: "已裝備", owned: "持有", decrease: "卸下 1 座", increase: "裝備 1 座"
    },
    signIn: "登入"
  },
  en: {
    currency: { obsidian: "Obsidian", spaceCoin: "Space Coins", starDust: "Stardust" },
    policy: "Privacy Policy & Account Deletion",
    home: {
      heroKicker: "ORBITAL COMMAND", heroSubtitle: "Configure your arsenal, choose a sector, and hold the final interstellar line.",
      missionKicker: "DEPLOYMENT", missionTitle: "Battle Tier",
      pilotKicker: "PILOT LINK", pilotTitle: "Sign In",
      appDownloadKicker: "ANDROID APP", appDownloadLabel: "DOWNLOAD NOW",
      screenLabel: "Game Home", sectionsLabel: "Home Sections", tierLabel: "Battle Tier"
    },
    ui: {
      playTab: "Play", tasksTab: "Missions", codexTab: "Codex", workshopTab: "Workshop", storeTab: "Store", locked: "LOCKED",
      codexKicker: "ENEMY ARCHIVE", codexTitle: "Enemy Codex",
      codexDescription: "Review discovered enemy abilities, encounter requirements, and counters.",
      workshopKicker: "TURRET WORKSHOP", workshopTitle: "Turret Workshop",
      openWorkshop: "Tier {tier} · {mainSlots} main slots · {supportSlots} auxiliary slots · 50 matching shards to assemble or rank up",
      mainSlots: "Main Slots", auxiliarySlots: "Aux Slots", assembled: "Assembled", heldFragments: "Total Shards",
      mainTurrets: "MAIN TURRETS", auxiliaryTurrets: "AUXILIARY TURRETS", grade: "GRADE", fragments: "SHARDS",
      build: "Assemble", equipped: "Equipped", owned: "Owned", decrease: "Unequip one", increase: "Equip one"
    },
    signIn: "Sign In"
  },
  ja: {
    currency: { obsidian: "黒曜石", spaceCoin: "スペースコイン", starDust: "星屑" },
    policy: "プライバシーポリシーとアカウント削除",
    home: {
      heroKicker: "軌道司令部", heroSubtitle: "砲台を整備し、戦域を選び、星間防衛線を守り抜こう。",
      missionKicker: "作戦配置", missionTitle: "バトルTier",
      pilotKicker: "パイロットリンク", pilotTitle: "ログイン",
      appDownloadKicker: "ANDROID APP", appDownloadLabel: "今すぐダウンロード",
      screenLabel: "ゲームホーム", sectionsLabel: "ホームメニュー", tierLabel: "バトルTier"
    },
    ui: {
      playTab: "出撃", tasksTab: "ミッション", codexTab: "敵機図鑑", workshopTab: "砲台工房", storeTab: "ストア", locked: "ロック",
      codexKicker: "敵機アーカイブ", codexTitle: "敵機図鑑",
      codexDescription: "発見済み敵機の能力、出現条件、対策を確認できます。",
      workshopKicker: "砲台工房", workshopTitle: "砲台工房",
      openWorkshop: "Tier {tier} · 主砲{mainSlots}枠 · 副砲{supportSlots}枠 · 同型の欠片50個で組立・昇星",
      mainSlots: "主砲枠", auxiliarySlots: "副砲枠", assembled: "組立済み", heldFragments: "欠片合計",
      mainTurrets: "主砲", auxiliaryTurrets: "副砲", grade: "等級", fragments: "欠片",
      build: "組み立て", equipped: "装備中", owned: "所持", decrease: "1基外す", increase: "1基装備"
    },
    signIn: "ログイン"
  },
  ko: {
    currency: { obsidian: "흑요석", spaceCoin: "스페이스 코인", starDust: "별가루" },
    policy: "개인정보처리방침 및 계정 삭제",
    home: {
      heroKicker: "궤도 사령부", heroSubtitle: "포탑을 정비하고 전장을 선택해 최후의 성간 방어선을 지키세요.",
      missionKicker: "작전 배치", missionTitle: "전투 Tier",
      pilotKicker: "파일럿 링크", pilotTitle: "로그인",
      appDownloadKicker: "ANDROID APP", appDownloadLabel: "지금 다운로드",
      screenLabel: "게임 홈", sectionsLabel: "홈 메뉴", tierLabel: "전투 Tier"
    },
    ui: {
      playTab: "출격", tasksTab: "임무", codexTab: "적기 도감", workshopTab: "포탑 공방", storeTab: "상점", locked: "잠김",
      codexKicker: "적기 기록", codexTitle: "적기 도감",
      codexDescription: "발견한 적기의 능력, 출현 조건, 대응법을 확인하세요.",
      workshopKicker: "포탑 공방", workshopTitle: "포탑 공방",
      openWorkshop: "Tier {tier} · 주포 {mainSlots}칸 · 보조포 {supportSlots}칸 · 같은 파편 50개로 조립·성급 상승",
      mainSlots: "주포 슬롯", auxiliarySlots: "보조포 슬롯", assembled: "조립 완료", heldFragments: "전체 파편",
      mainTurrets: "주포", auxiliaryTurrets: "보조포", grade: "등급", fragments: "파편",
      build: "조립", equipped: "장착됨", owned: "보유", decrease: "1문 해제", increase: "1문 장착"
    },
    signIn: "로그인"
  },
  ru: {
    currency: { obsidian: "Обсидиан", spaceCoin: "Космомонеты", starDust: "Звёздная пыль" },
    policy: "Политика конфиденциальности и удаление аккаунта",
    home: {
      heroKicker: "ОРБИТАЛЬНОЕ КОМАНДОВАНИЕ", heroSubtitle: "Настройте орудия, выберите сектор и удержите последний межзвёздный рубеж.",
      missionKicker: "РАЗВЁРТЫВАНИЕ", missionTitle: "Боевой Tier",
      pilotKicker: "СВЯЗЬ С ПИЛОТОМ", pilotTitle: "Вход",
      appDownloadKicker: "ANDROID APP", appDownloadLabel: "СКАЧАТЬ",
      screenLabel: "Главная игры", sectionsLabel: "Разделы главной", tierLabel: "Боевой Tier"
    },
    ui: {
      playTab: "В бой", tasksTab: "Задания", codexTab: "Атлас врагов", workshopTab: "Цех башен", storeTab: "Магазин", locked: "ЗАКРЫТО",
      codexKicker: "АРХИВ ВРАГОВ", codexTitle: "Атлас врагов",
      codexDescription: "Изучайте способности, условия появления и способы противодействия обнаруженным врагам.",
      workshopKicker: "ЦЕХ БАШЕН", workshopTitle: "Цех башен",
      openWorkshop: "Tier {tier} · главных: {mainSlots} · вспомогательных: {supportSlots} · 50 осколков для сборки или звезды",
      mainSlots: "Главные", auxiliarySlots: "Вспомогательные", assembled: "Собрано", heldFragments: "Всего осколков",
      mainTurrets: "ГЛАВНЫЕ БАШНИ", auxiliaryTurrets: "ВСПОМОГАТЕЛЬНЫЕ БАШНИ", grade: "КЛАСС", fragments: "ОСКОЛКИ",
      build: "Собрать", equipped: "Установлено", owned: "В наличии", decrease: "Снять одну", increase: "Установить одну"
    },
    signIn: "Войти"
  },
  es: {
    currency: { obsidian: "Obsidiana", spaceCoin: "Monedas espaciales", starDust: "Polvo estelar" },
    policy: "Política de privacidad y eliminación de cuenta",
    home: {
      heroKicker: "MANDO ORBITAL", heroSubtitle: "Configura las torretas, elige un sector y defiende la última línea interestelar.",
      missionKicker: "DESPLIEGUE", missionTitle: "Tier de combate",
      pilotKicker: "ENLACE DE PILOTO", pilotTitle: "Iniciar sesión",
      appDownloadKicker: "ANDROID APP", appDownloadLabel: "DESCARGAR AHORA",
      screenLabel: "Inicio del juego", sectionsLabel: "Secciones de inicio", tierLabel: "Tier de combate"
    },
    ui: {
      playTab: "Jugar", tasksTab: "Misiones", codexTab: "Códice enemigo", workshopTab: "Taller de torretas", storeTab: "Tienda", locked: "BLOQUEADO",
      codexKicker: "ARCHIVO ENEMIGO", codexTitle: "Códice enemigo",
      codexDescription: "Consulta habilidades, condiciones de aparición y contramedidas de los enemigos descubiertos.",
      workshopKicker: "TALLER DE TORRETAS", workshopTitle: "Taller de torretas",
      openWorkshop: "Tier {tier} · {mainSlots} espacios principales · {supportSlots} auxiliares · 50 fragmentos para montar o subir estrellas",
      mainSlots: "Principales", auxiliarySlots: "Auxiliares", assembled: "Montadas", heldFragments: "Fragmentos totales",
      mainTurrets: "TORRETAS PRINCIPALES", auxiliaryTurrets: "TORRETAS AUXILIARES", grade: "GRADO", fragments: "FRAGMENTOS",
      build: "Montar", equipped: "Equipada", owned: "En posesión", decrease: "Quitar una", increase: "Equipar una"
    },
    signIn: "Iniciar sesión"
  }
};

for (const [language, translation] of Object.entries(V2_APP_SHELL_I18N)) {
  const pack = window.V2_I18N[language];
  if (!pack) continue;
  pack.currency = translation.currency;
  pack.policy = translation.policy;
  pack.home = { ...(pack.home || {}), ...translation.home };
  Object.assign(pack.ui, translation.ui);
  if (typeof I18N !== "undefined" && I18N[language]) I18N[language].start = translation.signIn;
}

// Starter turret uses the same language lifecycle as every workshop unit.
for (const [lang, text] of Object.entries({"zh": ["碧焰龍息砲", "追蹤碧焰命中後，連鎖至另外 3 個目標（55% 傷害），每個被燒到的敵機都會留下 3 秒碧焰灼燒。新手包專屬，固定一星。"], "en": ["Emerald Drake", "Homing emerald bolts chain to 3 more targets for 55% damage, leaving a 3-second emerald burn on every enemy they touch. Starter exclusive; fixed at one star."], "ja": ["碧焔ドラグーン", "追尾する碧焔が命中後、別の3体へ55%のダメージで連鎖し、触れた敵すべてに3秒間の碧焔燃焼を残す。スターターパック限定、1星固定。"], "ko": ["비취 드레이크", "유도 비취탄이 적중 후 다른 적 3명에게 55% 피해로 연쇄되며, 닿은 모든 적에게 3초간 비취 화염을 남깁니다. 스타터 팩 전용, 1성 고정."], "ru": ["Изумрудный дракон", "Самонаводящийся снаряд поражает ещё 3 цели с 55% урона и оставляет на каждой изумрудное горение на 3 с. Только в стартовом наборе; одна звезда."], "es": ["Dragón Esmeralda", "Los proyectiles teledirigidos saltan a 3 objetivos más con un 55 % de daño y dejan una quemadura esmeralda de 3 s en cada enemigo alcanzado. Exclusivo del pack inicial; una estrella fija."]})) window.V2_I18N[lang].turrets.emerald_drake = text;

const V2_NEW_MAIN_TURRET_I18N = {
  zh: {
    capacitor_pulse: ["蓄能脈衝砲", "每第 5 發蓄能彈釋放電磁脈衝：目標追加該發 150% 傷害，脈衝波再擴散打到周圍敵機（60%）。"],
    royal_tide: ["寶藍潮汐砲", "每第 4 發寶藍彈掀起潮汐浪：把周圍敵機往回推，造成該發 35% 魔法傷害，並減速 8%（排位 25%）2 秒。"],
    phase_echo: ["相位回聲砲", "每發命中都會產生相位回聲，對同一目標追加該發 45% 物理傷害。"]
  },
  en: {
    capacitor_pulse: ["Capacitor Pulse", "Every 5th charged round releases an electromagnetic pulse: +150% of that hit to the target, and the pulse wave spreads to nearby enemies (60%)."],
    royal_tide: ["Royal Sapphire Tide", "Every 4th sapphire round raises a tidal wave that pushes nearby enemies back, deals 35% of the hit as magic damage and slows by 8% (25% in Ranked) for 2 seconds."],
    phase_echo: ["Phase Echo Cannon", "Every hit creates a phase echo that deals an extra 45% of that hit as physical damage to the same target."]
  },
  ja: {
    capacitor_pulse: ["蓄電パルス砲", "5発目ごとの蓄電弾が電磁パルスを放つ：標的へ150%の追加ダメージ、波動が周囲の敵へ広がり60%を与える。"],
    royal_tide: ["ロイヤルサファイア潮砲", "4発目ごとの蒼玉弾が潮の大波を起こし、周囲の敵を押し戻して命中ダメージの35%の魔法ダメージと8%（ランク戦は25%）減速を2秒間与えます。"],
    phase_echo: ["位相エコー砲", "命中するたび位相エコーが発生し、同じ標的へその45%の物理追加ダメージを与えます。"]
  },
  ko: {
    capacitor_pulse: ["축전 펄스포", "5번째 축전탄마다 전자기 펄스를 방출합니다: 대상에게 150% 추가 피해, 펄스파가 주변 적에게 퍼져 60% 피해."],
    royal_tide: ["로열 사파이어 파도포", "4번째 사파이어탄이 해일을 일으켜 주변 적을 뒤로 밀어내고 해당 피해의 35% 마법 피해와 2초간 8%(랭크전 25%) 감속을 줍니다."],
    phase_echo: ["위상 메아리포", "공격이 적중할 때마다 위상 메아리가 같은 대상에게 해당 피해의 45%를 물리 추가 피해로 줍니다."]
  },
  ru: {
    capacitor_pulse: ["Накопительная импульсная пушка", "Каждый 5-й заряженный снаряд выпускает электромагнитный импульс: +150% урона цели, а волна импульса бьёт врагов рядом (60%)."],
    royal_tide: ["Королевская сапфировая волна", "Каждый 4-й сапфировый снаряд поднимает приливную волну: отбрасывает врагов рядом, наносит 35% урона попадания как магический урон и замедляет на 8% (в рейтинге 25%) на 2 с."],
    phase_echo: ["Пушка фазового эха", "Каждое попадание создаёт фазовое эхо и наносит той же цели ещё 45% урона попадания как физический урон."]
  },
  es: {
    capacitor_pulse: ["Cañón de pulso capacitivo", "Cada 5.º proyectil cargado libera un pulso electromagnético: +150 % del impacto al objetivo y la onda alcanza a los enemigos cercanos (60 %)."],
    royal_tide: ["Marea de zafiro real", "Cada 4.º proyectil de zafiro levanta una ola que empuja hacia atrás a los enemigos cercanos, causa un 35 % del impacto como daño mágico y ralentiza un 8 % (25 % en Clasificatoria) durante 2 s."],
    phase_echo: ["Cañón de eco de fase", "Cada impacto crea un eco de fase que inflige al mismo objetivo un 45 % adicional del impacto como daño físico."]
  }
};

for (const [language, items] of Object.entries(V2_NEW_MAIN_TURRET_I18N)) {
  Object.assign(window.V2_I18N[language].turrets, items);
}

const V2_VIP_TURRET_I18N = {
  zh: {
    vip_prism_lancer: ["幻稜折光砲", "折光矩陣：鑽石稜鏡的光束先射向陣地上的友軍砲台，在它們頭上的稜鏡節點折射接力（最多 3 座，一路逼近敵人），再從最後一個節點貫穿敵陣。每經過一座砲台傷害 +25%，並讓那座砲台 2 秒內攻速 +20%。"], vip_thunder_throne: ["雷霆王座", "鎖定血量最高的強敵，從天空劈下金紫色天雷，落點炸出雷環並沿地面連鎖五個目標。王座天罰：每第 3 次攻擊同時劈下 3 道天雷，打血量最高的 3 架敵機，各自連鎖並定身 0.6 秒。"], vip_frost_bloom: ["霜月花冠", "月華冰彈在落點綻開霜花，範圍命中並減速敵群；砲台上方的月亮隨每次攻擊由新月漸盈。滿月霜華：每第 4 次攻擊升起巨大滿月，場上所有敵機受到傷害、減速 50% 持續 2 秒（首領減半），並各綻開一朵霜花。"], vip_star_phoenix: ["熔星鳳凰", "熔星羽毛命中後插在敵機身上（最多 3 根，持續 8 秒）。星座爆燃：每第 5 次攻擊，場上所有帶星羽的敵機被星線連成一張星座圖並同時爆燃，每根星羽造成一次重擊、波及身旁敵機，並灼燒 3 秒。（暴擊率 +25%）"], vip_abyssal_tide: ["深海潮汐", "潮汐脈衝擴散，命中附加緩速與範圍傷害。深淵巨獸：每第 5 次攻擊，一條深海巨獸從航道上敵機最密集處破浪而出，逆著航道游過，重擊沿途每架敵機並把它們往回拖、減速 40% 持續 2 秒（首領幾乎拖不動）。"],
    vip_quantum_crown: ["量子皇冕", "帝冠星彈追蹤目標，命中後讓敵機進入量子糾纏 5 秒（最多 6 架），彼此以紫金量子絲線相連；任何砲台對其中一架造成的傷害，其他糾纏敵機都同步承受 25%。加冕：每第 5 次攻擊，金色皇冠降在血量最高的敵機上，量子崩塌，對所有糾纏敵機各造成 2 倍傷害。需 100 碎片組裝。"], vip_singularity_king: ["黑洞君王", "奇點坍縮：每第 6 次攻擊，在航道上敵機最密集處撕開黑洞 2.4 秒，把附近敵機沿航道吸攏到中心並持續傷害；結束時坍縮成超新星爆炸，對聚攏的敵機造成重擊與其最大生命 8% 的傷害（首領較低）。需 100 碎片組裝。"], vip_solar_judgment: ["赤陽審判", "赤金審判光束貫穿全場並灼燒。烈日審判：每第 4 次攻擊，戰場上方升起烈日，巨大的陽炎光柱由左至右掃過全場，灼傷沿途每架敵機並烙上太陽印記；1.2 秒後印記同時引爆成日珥爆焰，造成重擊、灼燒 3 秒並波及周圍。需 100 碎片組裝。"], vip_nebula_hymn: ["星雲聖歌", "星雲護盾守護主砲。聖歌合唱：每 1.2 秒唱出一個節拍，每第 4 拍進入副歌——星雲樂譜光帶依序流過陣地上每一座砲台，所有砲台立刻額外開火一次。需 100 碎片組裝。"], vip_chrono_axis: ["時序天樞", "時晶彈附帶冰晶減速。時間靜止：每第 4 次攻擊，戰場浮現巨大時鐘，所有敵機完全靜止 1.5 秒（首領 0.6 秒）；靜止期間所有砲台造成的傷害會被累積，時間恢復時每架敵機再承受累積傷害的 50%。需 100 碎片組裝。"]
  },
  en: {
    vip_prism_lancer: ["Prismatic Lancer", "Prism Matrix: the diamond prism's beam is first thrown to your own turrets, refracting through a crystal node above each (up to 3, always closing in on the enemy), then pierces the enemy line from the last node. Each relay adds +25% damage and gives that turret +20% attack speed for 2 seconds."], vip_thunder_throne: ["Thunder Throne", "Locks onto the toughest enemy and calls a gold-and-violet bolt down from the sky; it bursts into an electric ring and forks along the ground to five targets. Throne's Judgment: every 3rd attack drops 3 bolts at once on the 3 toughest enemies, each forking and stunning for 0.6 seconds."], vip_frost_bloom: ["Moonfrost Bloom", "Moonlit ice shells bloom into frost flowers, hitting and slowing groups; the moon above the turret waxes with every attack. Full Moon Frost: every 4th attack raises a giant full moon — every enemy on the field takes damage, is slowed by 50% for 2 seconds (half on bosses) and blooms with a frost flower."], vip_star_phoenix: ["Starforge Phoenix", "Molten star feathers lodge in enemies (up to 3, lasting 8 seconds). Constellation Blaze: every 5th attack links every feathered enemy into one constellation and ignites them all — each feather strikes hard, splashes nearby enemies and burns for 3 seconds. (+25% crit chance)"], vip_abyssal_tide: ["Abyssal Tide", "Tidal pulses spread, slowing and hitting an area. Abyssal Leviathan: every 5th attack a deep-sea leviathan breaches where the track is most crowded and swims back along it against the flow, striking every enemy it passes, dragging it back down the track and slowing it by 40% for 2 seconds (bosses barely move)."],
    vip_quantum_crown: ["Quantum Crown", "Crown star shells home in and entangle the enemy for 5 seconds (up to 6), joined by violet-gold quantum threads; any damage any turret deals to one entangled enemy echoes 25% into every other. Coronation: every 5th attack a golden crown descends on the toughest enemy and the entanglement collapses, dealing 2× damage to every entangled enemy. Requires 100 shards to assemble."], vip_singularity_king: ["Singularity King", "Singularity Collapse: every 6th attack tears open a black hole for 2.4 seconds where the track is most crowded, drawing nearby enemies along the track into its core and grinding them; it then collapses into a supernova, hitting the gathered enemies hard plus 8% of their max HP (less on bosses). Requires 100 shards to assemble."], vip_solar_judgment: ["Solar Judgment", "A crimson-gold judgment beam pierces the whole field and burns. Solar Judgment: every 4th attack a blazing sun rises above the field and sweeps a colossal ray across it, scorching every enemy it touches and branding it with a sun sigil; 1.2 seconds later every sigil erupts in a solar flare — heavy damage, 3 seconds of burning and splash. Requires 100 shards to assemble."], vip_nebula_hymn: ["Nebula Hymn", "A nebula shield guards the main cannon. Hymn Chorus: it sings a beat every 1.2 seconds, and every 4th beat is the chorus — a nebula score flows through every turret on the board in turn and each of them instantly fires an extra shot. Requires 100 shards to assemble."], vip_chrono_axis: ["Chrono Axis", "Chrono shells chill and slow. Time Stop: every 4th attack a vast clock appears over the field and every enemy freezes for 1.5 seconds (bosses 0.6); damage any turret deals meanwhile is stored, and when time resumes each enemy takes an extra 50% of what it stored. Requires 100 shards to assemble."]
  },
  ja: {
    vip_prism_lancer: ["幻稜ランサー", "屈折マトリクス：ダイヤ棱鏡の光線はまず味方の砲台へ飛び、各砲台の上の棱鏡ノードで屈折して中継（最大3基、敵へ近づく順）し、最後のノードから敵陣を貫く。中継1基ごとにダメージ+25%、その砲台の攻撃速度が2秒間+20%。"], vip_thunder_throne: ["雷霆の玉座", "最もHPの高い強敵を狙い、天から金紫の雷を落とす。着弾点で雷の輪が弾け、地を這って5体へ連鎖。王座の裁き：3回目ごとに天雷を3本同時に落とし、HP上位3体を撃ち、それぞれ連鎖して0.6秒スタン。"], vip_frost_bloom: ["月霜の花冠", "月華の氷弾が着弾点で霜の花を咲かせ、範囲攻撃と減速。砲台の上の月は攻撃ごとに満ちていく。満月霜華：4回目ごとに巨大な満月が昇り、戦場の全敵にダメージ、2秒間50%減速（ボスは半分）、それぞれに霜の花が咲く。"], vip_star_phoenix: ["熔星の鳳凰", "熔星の羽が敵に刺さる（最大3本、8秒）。星座爆燃：5回目ごとに羽の刺さった全ての敵を星の線で星座につなぎ、一斉に爆燃。羽1本ごとに強打、周囲にも波及し、3秒間燃焼。（会心率+25%）"], vip_abyssal_tide: ["深海の潮流", "潮汐の波動が広がり、範囲ダメージと減速を与える。深淵の巨獣：5回目ごとに深海の巨獣が航路で敵の最も密な場所から現れ、流れに逆らって泳ぎ、通過した敵すべてを強打して後ろへ引き戻し、2秒間40%減速（ボスはほぼ動かない）。"],
    vip_quantum_crown: ["量子の王冠", "帝冠の星弾が追尾し、命中した敵を5秒間量子もつれ状態にする（最大6体）。紫金の量子の糸でつながり、どの砲台が与えたダメージも他のもつれた敵に25%伝わる。戴冠：5回目ごとに黄金の王冠がHP最大の敵に降り、量子崩壊で全てのもつれた敵に2倍ダメージ。組み立てに欠片100個が必要。"], vip_singularity_king: ["特異点の王", "特異点崩壊：6回目ごとに航路で敵が最も密な場所へ2.4秒間ブラックホールを開き、近くの敵を航路に沿って中心へ引き寄せて削る。最後は超新星となって爆発し、集めた敵に強打と最大HPの8%ダメージ（ボスは低め）。組み立てに欠片100個が必要。"], vip_solar_judgment: ["太陽の審判", "赤金の審判光線が戦場全体を貫き焼く。烈日の審判：4回目ごとに戦場の上に烈日が昇り、巨大な陽炎の光柱が左から右へ全域を薙ぎ払い、触れた敵すべてを焼いて太陽の印を刻む。1.2秒後に全ての印が日珥となって爆発し、強打・3秒燃焼・周囲へ波及。組み立てに欠片100個が必要。"], vip_nebula_hymn: ["星雲の聖歌", "星雲の盾が主砲を守る。聖歌の合唱：1.2秒ごとに拍を刻み、4拍目ごとにサビへ――星雲の楽譜の光が陣地の全砲台を順に流れ、全ての砲台が即座にもう一度発射する。組み立てに欠片100個が必要。"], vip_chrono_axis: ["時空の軸", "時晶弾が冷気で減速させる。時間停止：4回目ごとに戦場に巨大な時計が現れ、全ての敵が1.5秒完全停止（ボスは0.6秒）。停止中に全砲台が与えたダメージは蓄積され、時間が戻る瞬間に各敵は蓄積ダメージの50%を追加で受ける。組み立てに欠片100個が必要。"]
  },
  ko: {
    vip_prism_lancer: ["환릉 프리즘포", "굴절 매트릭스: 다이아몬드 프리즘의 광선이 먼저 아군 포탑으로 향해 각 포탑 위의 프리즘 노드에서 굴절·중계(최대 3기, 적에게 다가가는 순)한 뒤 마지막 노드에서 적진을 관통합니다. 중계할 때마다 피해 +25%, 그 포탑은 2초간 공격 속도 +20%."], vip_thunder_throne: ["천둥의 왕좌", "가장 체력이 높은 강적을 노려 하늘에서 금보라 번개를 내리칩니다. 낙뢰 지점에서 번개 고리가 터지고 땅을 타고 다섯 목표로 연쇄됩니다. 왕좌의 심판: 3번째 공격마다 번개 3줄기를 동시에 떨어뜨려 체력 상위 3기를 치고, 각각 연쇄하며 0.6초 기절시킵니다."], vip_frost_bloom: ["달서리 화관", "월화 얼음탄이 착탄 지점에서 서리꽃을 피워 범위 공격과 감속을 줍니다. 포탑 위의 달은 공격할 때마다 차오릅니다. 보름달 서리꽃: 4번째 공격마다 거대한 보름달이 떠올라 전장의 모든 적에게 피해를 주고 2초간 50% 감속(보스는 절반)시키며 각각 서리꽃을 피웁니다."], vip_star_phoenix: ["용성 불사조", "용성 깃털이 명중하면 적에게 박힙니다 (최대 3개, 8초). 별자리 폭연: 5번째 공격마다 깃털이 박힌 모든 적을 별빛 선으로 이어 별자리를 만들고 동시에 폭발시킵니다. 깃털마다 강타하고 주변 적에게도 피해를 주며 3초간 불태웁니다. (치명타 확률 +25%)"], vip_abyssal_tide: ["심해의 파도", "조수 파동이 퍼져 범위 피해와 감속을 줍니다. 심연의 거수: 5번째 공격마다 심해 거수가 항로에서 적이 가장 많은 곳에서 솟구쳐 흐름을 거슬러 헤엄치며, 지나가는 모든 적을 강타하고 뒤로 끌어당기며 2초간 40% 감속시킵니다 (보스는 거의 밀리지 않음)."],
    vip_quantum_crown: ["양자 왕관", "제관 별탄이 목표를 추적해 명중한 적을 5초간 양자 얽힘 상태로 만듭니다 (최대 6기). 자금색 양자 실로 서로 이어지며, 어느 포탑이든 한 기에 준 피해의 25%가 다른 얽힌 적 모두에게 전해집니다. 대관: 5번째 공격마다 황금 왕관이 체력이 가장 높은 적에게 내려앉고 양자 붕괴로 얽힌 모든 적에게 2배 피해를 줍니다. 조립에 조각 100개가 필요합니다."], vip_singularity_king: ["특이점의 왕", "특이점 붕괴: 6번째 공격마다 항로에서 적이 가장 많은 곳에 2.4초간 블랙홀을 열어 주변 적을 항로를 따라 중심으로 끌어모으며 피해를 줍니다. 마지막에 초신성으로 폭발해 모인 적에게 강타와 최대 HP 8% 피해(보스는 낮게)를 줍니다. 조립에 조각 100개가 필요합니다."], vip_solar_judgment: ["태양의 심판", "적금빛 심판 광선이 전장을 관통하며 불태웁니다. 열일의 심판: 4번째 공격마다 전장 위로 태양이 떠올라 거대한 양염 광주가 왼쪽에서 오른쪽으로 전장을 휩쓸고, 닿은 모든 적을 태우며 태양 인장을 새깁니다. 1.2초 후 모든 인장이 홍염으로 폭발해 강한 피해, 3초 화상, 주변 피해를 줍니다. 조립에 조각 100개가 필요합니다."], vip_nebula_hymn: ["성운의 찬가", "성운 보호막이 주포를 지킵니다. 성가 합창: 1.2초마다 한 박자를 노래하고, 4번째 박자마다 후렴이 시작됩니다 — 성운 악보 빛줄기가 진지의 모든 포탑을 차례로 흐르며 모든 포탑이 즉시 한 번 더 발사합니다. 조립에 조각 100개가 필요합니다."], vip_chrono_axis: ["시간의 축", "시정탄이 냉기로 감속시킵니다. 시간 정지: 4번째 공격마다 전장에 거대한 시계가 나타나 모든 적이 1.5초간 완전히 멈춥니다 (보스는 0.6초). 정지 중 모든 포탑이 준 피해는 축적되며, 시간이 다시 흐를 때 각 적은 축적 피해의 50%를 추가로 받습니다. 조립에 조각 100개가 필요합니다."]
  },
  ru: {
    vip_prism_lancer: ["Призматический копейщик", "Призматическая матрица: луч алмазной призмы сначала летит к вашим башням, преломляясь в кристаллах над ними (до 3, всё ближе к врагу), а затем из последнего узла пронзает строй врагов. Каждое преломление даёт +25% урона и ускоряет атаку этой башни на 20% на 2 с."], vip_thunder_throne: ["Громовой трон", "Наводится на самого живучего врага и обрушивает с неба золотисто-фиолетовую молнию: она взрывается электрическим кольцом и по земле перескакивает на пять целей. Суд Трона: каждая 3-я атака — 3 молнии сразу по 3 самым живучим врагам, каждая с цепью и оглушением на 0,6 с."], vip_frost_bloom: ["Лунный морозный цветок", "Лунные ледяные снаряды распускаются инеевыми цветами, поражая и замедляя группы; луна над башней растёт с каждой атакой. Полнолуние: каждая 4-я атака поднимает огромную полную луну — все враги на поле получают урон, замедляются на 50% на 2 с (боссы — вдвое меньше) и покрываются инеевым цветком."], vip_star_phoenix: ["Звёздный феникс", "Перья расплавленной звезды застревают во врагах (до 3, на 8 с). Созвездие пламени: каждая 5-я атака связывает всех оперённых врагов в созвездие и поджигает их разом — каждое перо бьёт сильно, задевает соседей и жжёт 3 с. (+25% к шансу крита)"], vip_abyssal_tide: ["Глубинный прилив", "Приливные импульсы расходятся, замедляя и поражая область. Левиафан бездны: каждая 5-я атака — глубоководный левиафан всплывает там, где врагов больше всего, и плывёт против течения маршрута, нанося удар каждому, утягивая его назад и замедляя на 40% на 2 с (боссы почти не сдвигаются)."],
    vip_quantum_crown: ["Квантовая корона", "Звёздные снаряды короны наводятся на цель и запутывают врага на 5 с (до 6), связывая их фиолетово-золотыми квантовыми нитями; любой урон любой башни по одному запутанному врагу на 25% передаётся всем остальным. Коронация: каждая 5-я атака опускает золотую корону на самого живучего врага, запутанность схлопывается — 2× урона каждому запутанному. Нужно 100 осколков для сборки."], vip_singularity_king: ["Король сингулярности", "Коллапс сингулярности: каждая 6-я атака на 2,4 с открывает чёрную дыру там, где врагов больше всего, стягивая соседей по маршруту к центру и перемалывая их; затем она взрывается сверхновой — тяжёлый удар плюс 8% макс. здоровья собранным врагам (боссам — меньше). Нужно 100 осколков для сборки."], vip_solar_judgment: ["Солнечный суд", "Багрово-золотой луч суда пронзает всё поле и жжёт. Солнечный суд: каждая 4-я атака поднимает над полем пылающее солнце, и исполинский луч проходит по полю слева направо, обжигая каждого врага и ставя на нём солнечную печать; через 1,2 с все печати взрываются протуберанцами — тяжёлый урон, горение 3 с и задевание соседей. Нужно 100 осколков для сборки."], vip_nebula_hymn: ["Гимн туманности", "Туманный щит защищает главное орудие. Хор гимна: каждые 1,2 с звучит такт, а каждый 4-й такт — припев: туманная партитура проходит через все башни на поле, и каждая сразу делает дополнительный выстрел. Нужно 100 осколков для сборки."], vip_chrono_axis: ["Ось времени", "Хроноснаряды охлаждают и замедляют. Остановка времени: каждая 4-я атака вызывает над полем огромные часы — все враги замирают на 1,5 с (боссы на 0,6); урон любых башен в это время копится, и когда время идёт снова, каждый враг получает ещё 50% накопленного. Нужно 100 осколков для сборки."]
  },
  es: {
    vip_prism_lancer: ["Lancero prismático", "Matriz prismática: el haz del prisma de diamante viaja primero a tus torretas y se refracta en un nodo de cristal sobre cada una (hasta 3, acercándose al enemigo), luego atraviesa la línea enemiga desde el último nodo. Cada relevo suma +25% de daño y da a esa torreta +20% de velocidad de ataque durante 2 s."], vip_thunder_throne: ["Trono del trueno", "Fija al enemigo más resistente y hace caer del cielo un rayo dorado y violeta que estalla en un anillo eléctrico y salta por el suelo a cinco objetivos. Juicio del Trono: cada 3.er ataque lanza 3 rayos a la vez sobre los 3 enemigos más resistentes, cada uno en cadena y aturdiendo 0,6 s."], vip_frost_bloom: ["Flor de escarcha lunar", "Los proyectiles de hielo lunar florecen en flores de escarcha que golpean y ralentizan grupos; la luna sobre la torreta crece con cada ataque. Luna llena helada: cada 4.º ataque alza una enorme luna llena: todos los enemigos del campo reciben daño, se ralentizan un 50% durante 2 s (la mitad en jefes) y florece en cada uno una flor de escarcha."], vip_star_phoenix: ["Fénix estelar", "Las plumas de estrella fundida se clavan en los enemigos (hasta 3, durante 8 s). Constelación ardiente: cada 5.º ataque une a todos los enemigos con plumas en una constelación y los enciende a la vez: cada pluma golpea fuerte, salpica a los cercanos y quema 3 s. (+25% de probabilidad de crítico)"], vip_abyssal_tide: ["Marea abisal", "Pulsos de marea que se expanden, ralentizan y dañan en área. Leviatán abisal: cada 5.º ataque un leviatán emerge donde la ruta está más llena y nada contra la corriente, golpea a cada enemigo a su paso, lo arrastra hacia atrás y lo ralentiza un 40% durante 2 s (a los jefes apenas los mueve)."],
    vip_quantum_crown: ["Corona cuántica", "Los proyectiles estelares de la corona persiguen y entrelazan al enemigo durante 5 s (hasta 6), unidos por hilos cuánticos violeta y oro; todo daño de cualquier torreta a uno de ellos se refleja un 25% en los demás. Coronación: cada 5.º ataque una corona dorada desciende sobre el enemigo más resistente y el entrelazamiento colapsa, causando 2× de daño a cada enemigo entrelazado. Requiere 100 fragmentos para ensamblar."], vip_singularity_king: ["Rey de la singularidad", "Colapso de singularidad: cada 6.º ataque abre un agujero negro durante 2,4 s donde la ruta está más llena, arrastra a los enemigos cercanos por la ruta hacia su núcleo y los desgasta; luego estalla en una supernova que golpea fuerte a los reunidos más un 8% de su vida máxima (menos en jefes). Requiere 100 fragmentos para ensamblar."], vip_solar_judgment: ["Juicio solar", "Un haz de juicio carmesí y dorado atraviesa todo el campo y quema. Juicio solar: cada 4.º ataque un sol ardiente se alza sobre el campo y barre con un rayo colosal de lado a lado, quemando a cada enemigo y marcándolo con un sello solar; 1,2 s después todos los sellos estallan en llamaradas solares: gran daño, 3 s de quemadura y salpicadura. Requiere 100 fragmentos para ensamblar."], vip_nebula_hymn: ["Himno de la nebulosa", "Un escudo nebular protege el cañón principal. Coro del himno: canta un compás cada 1,2 s y cada 4.º compás es el estribillo: una partitura nebular recorre todas las torretas del campo y cada una dispara al instante un tiro extra. Requiere 100 fragmentos para ensamblar."], vip_chrono_axis: ["Eje cronal", "Los proyectiles cronales congelan y ralentizan. Tiempo detenido: cada 4.º ataque aparece un enorme reloj sobre el campo y todos los enemigos se congelan 1,5 s (jefes 0,6); el daño de cualquier torreta durante ese tiempo se acumula, y al reanudarse cada enemigo recibe un 50% extra de lo acumulado. Requiere 100 fragmentos para ensamblar."]
  }
};
for (const [language, items] of Object.entries(V2_VIP_TURRET_I18N)) Object.assign(window.V2_I18N[language].turrets, items);

const V2_COMPACT_CARD_I18N = {
  zh: {
    gold_boost: ["星際採礦", "經濟", "每星使擊殺金幣 ×1.12。"],
    attack_boost: ["強化彈頭", "輸出", "每星使物理傷害 +18%。"],
    speed_boost: ["超頻供能", "輸出", "每星使主砲與副砲攻速 +16%。"],
    mini_turret: ["戰地副砲", "召喚", "部署 1 座臨時連射副砲。"],
    core_expand: ["核心擴容", "防禦", "最大生命 +25%，並回復增加量的 50%。"],
    magic_damage: ["虛空能量", "魔攻", "附加魔傷：首星 25%，之後每星 +15%。"],
    bleed: ["破甲裂傷", "持續傷害", "命中扣目前生命 0.5%；之後每星 +0.25%，上限 2%。"],
    fighter: ["軌道戰機", "召喚", "部署 1 架軌道戰機。"],
    range_boost: ["雷達擴張", "功能", "每星使攻擊範圍 +12%，上限 60%。"],
    emp: ["電磁脈衝", "控制", "每 12 秒全場減速 35%，持續 2 秒；升星強化。"],
    reflect_armor: ["反傷裝甲", "反傷", "核心受撞擊時反彈傷害；每星提高反傷。"],
    gray_drone_swarm: ["灰翼無人機群", "召喚", "定期派出自爆無人機；每星增加數量與頻率。"],
    frost_rounds: ["極凍彈藥", "控制", "命中疊加減速，最高 70%；Boss 效果降低。"],
    knockback_rounds: ["震退彈頭", "控制", "每星提供 3% 擊退機率，最高 15%。"],
    command_relay: ["指揮中繼站", "召喚", "每星使召喚傷害 +16%、攻速 +8%。"],
    chain_blast: ["連鎖爆破", "爆發", "擊殺小怪有機率引發範圍爆炸；每星強化。"],
    overload_magazine: ["過載彈匣", "爆發", "定期觸發過載重擊；每星更快、更強。"],
    weakpoint_mark: ["弱點標記", "狙擊", "標記最高生命敵人，使其承受物傷 +8%／星。"],
    piercing_sniper: ["穿甲狙擊", "狙擊", "定期對高威脅目標發射穿透重彈；每星強化。"],
    reactive_shield: ["反應護盾", "反傷", "受傷後短暫提高反傷與生命回復；每星強化。"],
    chance_slow: ["低溫彈鏈", "控制", "主砲每星 +5.5% 強力減速機率。"],
    blind_rounds: ["致盲閃光彈", "控制", "主砲 6.3% 起致盲；每星機率 +2.8%。"],
    defection: ["敵我逆轉", "戰術", "主砲 1.2% 起策反基礎敵機；每星 +0.6%。"],
    black_hole: ["微型黑洞", "控制", "定期聚集敵軍；每星縮短冷卻並擴大範圍。"],
    extra_row: ["雙列火網", "輸出", "追加左右側彈，各 10% 傷害；每星 +5%。"],
    armor_breaker: ["破甲彈芯", "輸出", "物理攻擊每星忽略 6% 護甲，最多 30%。"],
    plasma_burst: ["電漿爆環", "魔攻", "每 8 次主砲命中引爆範圍魔傷；每星提高威力。"],
    finisher: ["終結協議", "輸出", "對生命低於 30% 的敵人每星傷害 +8%。"],
    shield_recharge: ["護盾回充", "防禦", "定時補充 1 層護盾；每星縮短回充並提高上限。"],
    ricochet: ["折射彈道", "戰術", "主砲 8% 起彈射鄰近敵人，造成 45% 物傷；每星 +3%。"],
    repair_nanites: ["修復奈米群", "生命", "每星每秒回復最大生命 0.03%。"],
    bounty_matrix: ["賞金矩陣", "經濟", "每星使擊殺金幣 ×1.04。"],
    last_stand: ["背水超頻", "輸出", "核心生命低於 35% 時，每星攻速 +8%。"]
  },
  en: {
    gold_boost: ["Star Mining", "Economy", "Kill Gold ×1.12 per star."], attack_boost: ["Reinforced Rounds", "Damage", "+18% physical damage per star."],
    speed_boost: ["Overclock Feed", "Damage", "+16% main and support fire rate per star."], mini_turret: ["Field Turret", "Summon", "Deploy 1 temporary rapid-fire turret."],
    core_expand: ["Core Expansion", "Defense", "+25% max HP; heal 50% of the gained HP."], magic_damage: ["Void Energy", "Magic", "Add 25% magic damage; later stars add 15%."],
    bleed: ["Rending Wound", "DoT", "Hits remove 0.5% current HP; +0.25% per star, max 2%."], fighter: ["Orbital Fighter", "Summon", "Deploy 1 orbital fighter."],
    range_boost: ["Radar Expansion", "Utility", "+12% range per star, max 60%."], emp: ["EMP", "Control", "Every 12s, slow all enemies by 35% for 2s; stars improve it."],
    reflect_armor: ["Reflective Armor", "Retaliation", "Core impacts reflect damage; stars increase it."], gray_drone_swarm: ["Graywing Swarm", "Summon", "Launch suicide drones; stars add drones and speed."],
    frost_rounds: ["Cryo Rounds", "Control", "Hits stack slow up to 70%; reduced on Bosses."], knockback_rounds: ["Kinetic Rounds", "Control", "+3% knockback chance per star, max 15%."],
    command_relay: ["Command Relay", "Summon", "+16% summon damage and +8% fire rate per star."], chain_blast: ["Chain Blast", "Burst", "Non-Boss kills may explode; stars improve the blast."],
    overload_magazine: ["Overload Magazine", "Burst", "Trigger periodic overload shots; stars make them faster and stronger."], weakpoint_mark: ["Weakpoint Mark", "Sniper", "Mark the highest-HP enemy: +8% physical damage per star."],
    piercing_sniper: ["Piercing Sniper", "Sniper", "Fire piercing rounds at priority targets; stars improve them."], reactive_shield: ["Reactive Shield", "Retaliation", "Taking damage briefly boosts reflection and regen; stars improve it."],
    chance_slow: ["Cryogenic Chain", "Control", "+5.5% powerful-slow chance per star."], blind_rounds: ["Flashblind Rounds", "Control", "Blind chance starts at 6.3%; +2.8% per star."],
    defection: ["Turncoat Protocol", "Tactics", "Convert basic enemies from 1.2% chance; +0.6% per star."], black_hole: ["Micro Black Hole", "Control", "Pull enemies together; stars expand it and reduce cooldown."],
    extra_row: ["Twin-Row Barrage", "Damage", "Add two 10% side shots; +5% damage per star."], armor_breaker: ["Armor Breaker", "Damage", "Physical hits ignore 6% armor per star, max 30%."],
    plasma_burst: ["Plasma Ring", "Magic", "Every 8 main hits trigger area magic damage; stars raise power."], finisher: ["Finisher Protocol", "Damage", "+8% damage per star against enemies below 30% HP."],
    shield_recharge: ["Shield Recharge", "Defense", "Recharge 1 shield; stars shorten cooldown and raise the cap."], ricochet: ["Ricochet Path", "Tactics", "8% starting chance to bounce for 45% damage; +3% per star."],
    repair_nanites: ["Repair Nanites", "Life", "Regenerate 0.03% max HP per second per star."], bounty_matrix: ["Bounty Matrix", "Economy", "Kill Gold ×1.04 per star."],
    last_stand: ["Last-Stand Overclock", "Damage", "Below 35% core HP, +8% fire rate per star."]
  },
  ja: {
    gold_boost: ["星間採掘", "経済", "1星ごとに撃破ゴールド×1.12。"], attack_boost: ["強化弾頭", "火力", "1星ごとに物理ダメージ+18%。"], speed_boost: ["過給供給", "火力", "1星ごとに主砲・副砲の連射+16%。"], mini_turret: ["野戦副砲", "召喚", "一時速射砲を1基展開。"],
    core_expand: ["コア拡張", "防御", "最大HP+25%、増加分の50%回復。"], magic_damage: ["虚空エネルギー", "魔法", "魔法追加25%。以降の星は+15%。"], bleed: ["装甲裂傷", "継続", "命中で現在HP0.5%。以降+0.25%、上限2%。"], fighter: ["軌道戦闘機", "召喚", "軌道戦闘機を1機展開。"],
    range_boost: ["レーダー拡張", "機能", "1星ごとに射程+12%、上限60%。"], emp: ["電磁パルス", "制御", "12秒ごとに全敵を35%減速、2秒。星で強化。"], reflect_armor: ["反射装甲", "反撃", "コア衝突時に反射。星で反射強化。"], gray_drone_swarm: ["グレイウィング群", "召喚", "自爆ドローンを発進。星で数と頻度増加。"],
    frost_rounds: ["極凍弾", "制御", "命中で減速を蓄積、上限70%。Bossは軽減。"], knockback_rounds: ["反発弾頭", "制御", "1星ごとにノックバック率+3%、上限15%。"], command_relay: ["指揮中継器", "召喚", "1星ごとに召喚ダメージ+16%、連射+8%。"], chain_blast: ["連鎖爆破", "爆発", "雑魚撃破時に範囲爆発。星で強化。"],
    overload_magazine: ["過負荷弾倉", "爆発", "定期的に過負荷射撃。星で高速・高威力化。"], weakpoint_mark: ["弱点標識", "狙撃", "最高HPの敵を標識し、物理被害+8%/星。"], piercing_sniper: ["貫通狙撃", "狙撃", "優先標的へ貫通弾。星で強化。"], reactive_shield: ["反応シールド", "反撃", "被弾後、反射と回復を一時強化。星で強化。"],
    chance_slow: ["低温弾鎖", "制御", "1星ごとに強減速確率+5.5%。"], blind_rounds: ["閃光盲目弾", "制御", "盲目率6.3%から。1星ごとに+2.8%。"], defection: ["敵味方反転", "戦術", "基本敵の転向率1.2%から。1星ごとに+0.6%。"], black_hole: ["小型ブラックホール", "制御", "敵を集束。星で範囲拡大・再使用短縮。"], extra_row: ["二列弾幕", "火力", "左右に10%弾を追加。1星ごとに+5%。"],
    armor_breaker: ["破甲弾芯", "火力", "物理攻撃が1星ごとに装甲6%無視、上限30%。"], plasma_burst: ["プラズマ環", "魔法", "主砲8命中ごとに範囲魔法攻撃。星で強化。"], finisher: ["終結プロトコル", "火力", "HP30%未満へ1星ごとにダメージ+8%。"], shield_recharge: ["シールド充填", "防御", "シールドを1補充。星で短縮・上限増加。"],
    ricochet: ["屈折弾道", "戦術", "8%から45%威力で跳弾。1星ごとに+3%。"], repair_nanites: ["修復ナノ群", "生命", "1星ごとに毎秒最大HP0.03%回復。"], bounty_matrix: ["賞金マトリクス", "経済", "1星ごとに撃破ゴールド×1.04。"], last_stand: ["背水過給", "火力", "コアHP35%未満で連射+8%/星。"]
  },
  ko: {
    gold_boost: ["성간 채굴", "경제", "성급마다 처치 골드 ×1.12."], attack_boost: ["강화 탄두", "화력", "성급마다 물리 피해 +18%."], speed_boost: ["오버클럭 공급", "화력", "성급마다 주포·보조포 공속 +16%."], mini_turret: ["야전 보조포", "소환", "임시 속사 보조포 1문 배치."],
    core_expand: ["코어 확장", "방어", "최대 HP +25%, 증가분의 50% 회복."], magic_damage: ["공허 에너지", "마법", "마법 추가 피해 25%, 이후 성급마다 +15%."], bleed: ["장갑 열상", "지속", "현재 HP 0.5% 피해, 이후 +0.25%, 최대 2%."], fighter: ["궤도 전투기", "소환", "궤도 전투기 1기 배치."],
    range_boost: ["레이더 확장", "기능", "성급마다 사거리 +12%, 최대 60%."], emp: ["전자기 펄스", "제어", "12초마다 전 적 35% 감속, 2초. 성급으로 강화."], reflect_armor: ["반사 장갑", "반격", "코어 충돌 피해를 반사. 성급마다 강화."], gray_drone_swarm: ["회색날개 군집", "소환", "자폭 드론 출격. 성급마다 수와 빈도 증가."],
    frost_rounds: ["극저온 탄약", "제어", "명중 시 감속 누적, 최대 70%. 보스는 감소."], knockback_rounds: ["밀쳐내기 탄두", "제어", "성급마다 밀쳐내기 확률 +3%, 최대 15%."], command_relay: ["지휘 중계기", "소환", "성급마다 소환 피해 +16%, 공속 +8%."], chain_blast: ["연쇄 폭발", "폭발", "일반 적 처치 시 범위 폭발. 성급으로 강화."],
    overload_magazine: ["과부하 탄창", "폭발", "주기적으로 과부하 사격. 성급마다 더 빠르고 강해짐."], weakpoint_mark: ["약점 표식", "저격", "최고 HP 적 표식, 물리 피해 +8%/성급."], piercing_sniper: ["관통 저격", "저격", "우선 목표에 관통 중탄. 성급으로 강화."], reactive_shield: ["반응 보호막", "반격", "피격 후 반사와 회복 일시 강화. 성급으로 강화."],
    chance_slow: ["저온 탄환 연쇄", "제어", "성급마다 강력 감속 확률 +5.5%."], blind_rounds: ["섬광 실명탄", "제어", "실명 확률 6.3%부터, 성급마다 +2.8%."], defection: ["적아 역전", "전술", "기본 적 전향 1.2%부터, 성급마다 +0.6%."], black_hole: ["소형 블랙홀", "제어", "적을 집결. 성급마다 범위 증가·재사용 감소."], extra_row: ["이중 열 탄막", "화력", "좌우 10% 탄 추가, 성급마다 +5%."],
    armor_breaker: ["장갑 파쇄 탄심", "화력", "물리 공격이 성급마다 장갑 6% 무시, 최대 30%."], plasma_burst: ["플라즈마 고리", "마법", "주포 8회 적중마다 범위 마법 피해. 성급으로 강화."], finisher: ["마무리 프로토콜", "화력", "HP 30% 미만 적에게 성급마다 피해 +8%."], shield_recharge: ["보호막 충전", "방어", "보호막 1회 충전. 성급마다 대기시간 감소·상한 증가."],
    ricochet: ["굴절 탄도", "전술", "8%부터 45% 피해로 도탄, 성급마다 +3%."], repair_nanites: ["수리 나노군", "생명", "성급마다 초당 최대 HP 0.03% 회복."], bounty_matrix: ["현상금 매트릭스", "경제", "성급마다 처치 골드 ×1.04."], last_stand: ["배수진 오버클럭", "화력", "코어 HP 35% 미만 시 공속 +8%/성급."]
  },
  ru: {
    gold_boost: ["Звёздная добыча", "Экономика", "Золото за убийства ×1,12 за звезду."], attack_boost: ["Усиленные снаряды", "Урон", "+18% физического урона за звезду."], speed_boost: ["Разгон подачи", "Урон", "+16% скорострельности орудий за звезду."], mini_turret: ["Полевая пушка", "Призыв", "Разместить 1 временную скорострельную пушку."],
    core_expand: ["Расширение ядра", "Защита", "+25% макс. HP и лечение на 50% прироста."], magic_damage: ["Энергия пустоты", "Магия", "+25% магического урона; следующие звёзды +15%."], bleed: ["Разрыв брони", "Урон со временем", "0,5% текущего HP; затем +0,25% за звезду, до 2%."], fighter: ["Орбитальный истребитель", "Призыв", "Разместить 1 орбитальный истребитель."],
    range_boost: ["Расширение радара", "Функция", "+12% дальности за звезду, до 60%."], emp: ["ЭМИ", "Контроль", "Каждые 12 с: замедление всех на 35% на 2 с; звёзды усиливают."], reflect_armor: ["Отражающая броня", "Ответ", "Столкновения с ядром отражают урон; звёзды усиливают."], gray_drone_swarm: ["Рой Серокрылов", "Призыв", "Запуск дронов-камикадзе; звёзды увеличивают число и частоту."],
    frost_rounds: ["Криоснаряды", "Контроль", "Попадания складывают замедление до 70%; Boss получает меньше."], knockback_rounds: ["Отбрасывающие снаряды", "Контроль", "+3% шанса отбрасывания за звезду, до 15%."], command_relay: ["Командный ретранслятор", "Призыв", "+16% урона и +8% скорости призывов за звезду."], chain_blast: ["Цепной взрыв", "Взрыв", "Убийства обычных врагов могут вызвать взрыв; звёзды усиливают."],
    overload_magazine: ["Перегруженный магазин", "Взрыв", "Периодические перегруженные выстрелы; звёзды ускоряют и усиливают."], weakpoint_mark: ["Метка слабости", "Снайпер", "Цель с макс. HP получает +8% физ. урона за звезду."], piercing_sniper: ["Бронебойный снайпер", "Снайпер", "Пробивающий выстрел по приоритетной цели; звёзды усиливают."], reactive_shield: ["Реактивный щит", "Ответ", "После урона временно усиливает отражение и регенерацию."],
    chance_slow: ["Криоцепь", "Контроль", "+5,5% шанса сильного замедления за звезду."], blind_rounds: ["Ослепляющие заряды", "Контроль", "Шанс ослепления от 6,3%; +2,8% за звезду."], defection: ["Протокол перебежчика", "Тактика", "Обращение базового врага от 1,2%; +0,6% за звезду."], black_hole: ["Микрочёрная дыра", "Контроль", "Стягивает врагов; звёзды расширяют и ускоряют."], extra_row: ["Двойной огневой ряд", "Урон", "Два боковых выстрела по 10%; +5% за звезду."],
    armor_breaker: ["Бронелом", "Урон", "Физические атаки игнорируют 6% брони за звезду, до 30%."], plasma_burst: ["Плазменное кольцо", "Магия", "Каждые 8 попаданий: магический взрыв; звёзды усиливают."], finisher: ["Протокол добивания", "Урон", "+8% урона за звезду по целям ниже 30% HP."], shield_recharge: ["Перезарядка щита", "Защита", "Восстанавливает 1 щит; звёзды сокращают интервал и повышают лимит."],
    ricochet: ["Рикошет", "Тактика", "Шанс от 8%: 45% урона второй цели; +3% за звезду."], repair_nanites: ["Ремонтные наниты", "Жизнь", "Регенерация 0,03% макс. HP/с за звезду."], bounty_matrix: ["Матрица награды", "Экономика", "Золото за убийства ×1,04 за звезду."], last_stand: ["Последний разгон", "Урон", "Ниже 35% HP ядра: +8% скорострельности за звезду."]
  },
  es: {
    gold_boost: ["Minería estelar", "Economía", "Oro por baja ×1,12 por estrella."], attack_boost: ["Munición reforzada", "Daño", "+18 % de daño físico por estrella."], speed_boost: ["Suministro acelerado", "Daño", "+16 % de cadencia de torretas por estrella."], mini_turret: ["Torreta de campo", "Invocación", "Despliega 1 torreta temporal de tiro rápido."],
    core_expand: ["Expansión del núcleo", "Defensa", "+25 % de vida máxima y cura el 50 % del aumento."], magic_damage: ["Energía del vacío", "Magia", "Añade 25 % de daño mágico; siguientes estrellas +15 %."], bleed: ["Herida perforante", "Daño continuo", "Quita 0,5 % de vida actual; luego +0,25 %, máximo 2 %."], fighter: ["Caza orbital", "Invocación", "Despliega 1 caza orbital."],
    range_boost: ["Expansión de radar", "Función", "+12 % de alcance por estrella, máximo 60 %."], emp: ["PEM", "Control", "Cada 12 s ralentiza a todos un 35 % durante 2 s; estrellas mejoran."], reflect_armor: ["Armadura reflectante", "Represalia", "Los impactos al núcleo reflejan daño; estrellas lo aumentan."], gray_drone_swarm: ["Enjambre Ala Gris", "Invocación", "Lanza drones suicidas; estrellas aumentan cantidad y frecuencia."],
    frost_rounds: ["Munición criogénica", "Control", "Los impactos acumulan ralentización hasta 70 %; menor en Bosses."], knockback_rounds: ["Munición cinética", "Control", "+3 % de empuje por estrella, máximo 15 %."], command_relay: ["Relé de mando", "Invocación", "+16 % de daño y +8 % de cadencia invocada por estrella."], chain_blast: ["Explosión en cadena", "Explosión", "Las bajas comunes pueden explotar; estrellas mejoran la explosión."],
    overload_magazine: ["Cargador sobrecargado", "Explosión", "Disparos sobrecargados periódicos; estrellas aceleran y potencian."], weakpoint_mark: ["Marca de debilidad", "Francotirador", "El enemigo con más vida recibe +8 % de daño físico por estrella."], piercing_sniper: ["Francotirador perforante", "Francotirador", "Disparo perforante a objetivos prioritarios; estrellas lo mejoran."], reactive_shield: ["Escudo reactivo", "Represalia", "Al recibir daño, mejora brevemente reflejo y regeneración."],
    chance_slow: ["Cadena criogénica", "Control", "+5,5 % de ralentización fuerte por estrella."], blind_rounds: ["Munición cegadora", "Control", "Ceguera desde 6,3 %; +2,8 % por estrella."], defection: ["Protocolo desertor", "Táctica", "Convierte enemigos básicos desde 1,2 %; +0,6 % por estrella."], black_hole: ["Microagujero negro", "Control", "Agrupa enemigos; estrellas amplían y reducen enfriamiento."], extra_row: ["Barrera de doble fila", "Daño", "Añade dos tiros laterales de 10 %; +5 % por estrella."],
    armor_breaker: ["Perforador de armadura", "Daño", "Ataques físicos ignoran 6 % de armadura por estrella, máximo 30 %."], plasma_burst: ["Anillo de plasma", "Magia", "Cada 8 impactos causa daño mágico de área; estrellas lo aumentan."], finisher: ["Protocolo final", "Daño", "+8 % de daño por estrella contra enemigos bajo 30 % de vida."], shield_recharge: ["Recarga de escudo", "Defensa", "Recarga 1 escudo; estrellas reducen espera y suben el límite."],
    ricochet: ["Trayectoria de rebote", "Táctica", "Desde 8 % rebota por 45 % de daño; +3 % por estrella."], repair_nanites: ["Nanitas de reparación", "Vida", "Regenera 0,03 % de vida máxima/s por estrella."], bounty_matrix: ["Matriz de recompensa", "Economía", "Oro por baja ×1,04 por estrella."], last_stand: ["Sobrecarga final", "Daño", "Bajo 35 % de vida del núcleo: +8 % de cadencia por estrella."]
  }
};

for (const [language, cards] of Object.entries(V2_COMPACT_CARD_I18N)) {
  Object.assign(window.V2_I18N[language].cards, cards);
}

const V2_RECRUIT_I18N = {
  zh: {basic_cannon:['基礎砲台','最初持有的標準砲台，發射單發物理彈。一般模式初始物攻 10、每秒 4.17 發；排位使用獨立基準。'],rookie_rapid:['輕型快射砲','快速發射細小實體彈，單發傷害與耐久較低。'],rookie_spark:['微光魔法砲','發射單顆微光魔法彈，攻速較慢、血量較低。'],rookie_guard:['裝甲守衛砲','裝甲厚實、血量較高；以低速單發物理彈掩護陣地。'],rookie_chill:['薄霜減速砲','發射小型冰晶彈，命中減速 3%（排位 15%），持續 2.5 秒。']},
  en: {basic_cannon:['Basic Cannon','Your original cannon fires single physical rounds. Normal-mode base damage: 10, rate: 4.17/s. Ranked uses its own baseline.'],rookie_rapid:['Light Repeater','Fires small physical rounds rapidly, with low damage per shot and low durability.'],rookie_spark:['Glimmer Cannon','Fires a single magic orb. Slower fire rate and low durability.'],rookie_guard:['Armored Guard','Durable armor with slow, low-damage physical rounds.'],rookie_chill:['Light Frost Cannon','Small ice rounds slow the target by 3% (15% in Ranked) for 2.5 seconds.']},
  ja: {basic_cannon:['基本砲台','最初から所持する物理単発砲。通常モードの初期攻撃力10、毎秒4.17発。ランク戦は専用基準。'],rookie_rapid:['軽量速射砲','小型の物理弾を高速連射。単発威力と耐久は低い。'],rookie_spark:['微光魔法砲','魔法の光弾を1発発射。攻撃速度と耐久は低い。'],rookie_guard:['装甲守衛砲','厚い装甲と高いHP。低速の物理弾で防衛する。'],rookie_chill:['薄霜減速砲','小さな氷弾が命中した敵を2.5秒間3%（ランク戦は15%）減速。']},
  ko: {basic_cannon:['기본 포탑','처음부터 보유하는 단발 물리 포탑. 일반 모드 기본 공격력 10, 초당 4.17발. 랭크전은 별도 기준 적용.'],rookie_rapid:['경량 속사포','작은 물리 탄환을 빠르게 발사합니다. 한 발 피해와 내구도가 낮습니다.'],rookie_spark:['미광 마법포','마법 구체 한 발을 발사합니다. 공격 속도와 내구도가 낮습니다.'],rookie_guard:['장갑 수호포','높은 체력과 두꺼운 장갑. 느린 물리 탄환으로 방어합니다.'],rookie_chill:['서리 감속포','작은 얼음 탄환이 적을 2.5초 동안 3%(랭크전 15%) 감속시킵니다.']},
  ru: {basic_cannon:['Базовая пушка','Первое орудие с одиночными физическими снарядами. В обычном режиме: урон 10, 4,17 выстрела/с. В рейтинге отдельные параметры.'],rookie_rapid:['Лёгкая скорострельная пушка','Быстрые небольшие физические снаряды. Низкие разовый урон и прочность.'],rookie_spark:['Пушка мерцания','Одиночный магический шар. Невысокая скорострельность и прочность.'],rookie_guard:['Бронированный страж','Толстая броня и высокий запас HP. Медленно стреляет физическими снарядами.'],rookie_chill:['Пушка лёгкого инея','Ледяной снаряд замедляет цель на 3% (в рейтинге 15%) на 2,5 секунды.']},
  es: {basic_cannon:['Cañón básico','Tu cañón inicial dispara proyectiles físicos individuales. Modo normal: daño 10, cadencia 4,17/s. Clasificatoria usa otra base.'],rookie_rapid:['Repetidor ligero','Dispara pequeños proyectiles físicos rápidamente. Bajo daño por disparo y poca resistencia.'],rookie_spark:['Cañón de destello','Dispara un orbe mágico. Cadencia lenta y poca resistencia.'],rookie_guard:['Guardián blindado','Blindaje grueso y vida alta. Dispara proyectiles físicos lentamente.'],rookie_chill:['Cañón de escarcha ligera','Pequeños proyectiles de hielo ralentizan un 3% (15% en Clasificatoria) durante 2,5 segundos.']}
};
for(const [language,turrets] of Object.entries(V2_RECRUIT_I18N))Object.assign(window.V2_I18N[language].turrets,turrets);

// Value-pack turrets (bought through the monthly value packs).
const V2_OFFER_TURRET_I18N = {
  zh: {
    vital_orb: ["元氣聚能砲", "發射追蹤元氣彈，砲台周圍的元氣球每 8 秒蓄滿，化成光流為核心回復 6% 生命；核心滿血時改成元氣爆發，傷害核心附近的敵機。元氣聚能：周圍砲台攻速 +10%。"],
    icewall_orb: ["冰牆結界砲", "冰晶彈範圍減速 40%。每 6 秒在最前方敵機前築起冰牆 4 秒，擋住每架敵機 1 秒並減速 40%；冰牆碎裂時對附近敵機造成 5 倍傷害。"],
    bomb_orb: ["爆彈副砲", "拋射爆彈範圍爆炸，對範圍內敵機追加其最大生命 4% 的傷害並震退；每顆爆彈炸毀的敵機（最多 3 架）會再連鎖爆炸，波及周圍敵機。"],
    phoenix_orb: ["火鳳烈焰砲", "火鳳追蹤彈命中後範圍爆燃、灼燒敵群 4 秒。浴火俯衝：每 10 秒一隻巨大火鳳掠過整條航道，對沿途每架敵機造成 6 倍傷害並點燃。"],
    afterimage_orb: ["殘像幻影砲", "11 道紫色殘像在砲台周圍大圈環繞，掃過航道；殘像碰到敵機時造成傷害並削去其最大生命 0.5%（首領 25%）。"],
    sword_orb: ["千刃劍匣", "蓄力時古劍一把把浮現成劍環，蓄滿後 12 把古劍依序出匣，沿著弧線如劍河般湧向敵機，越近越快，每把可穿透 2 架。萬劍齊發：每第 3 次齊射化為金劍，先升起在砲台後方排成劍陣懸停，再一齊射出，傷害 1.5 倍。"],
    missile_orb: ["五芒飛彈艙", "每 4 秒發射 5 發飛彈，排成旋轉的正五邊形飛向目標，抵達後落成五芒星陣引爆：陣內所有敵機受到重創並定身 0.5 秒（首領較短）。"],
    ninja_orb: ["六芒忍刃砲", "每 3 秒擲出 6 枚迴旋手裏劍，各沿花瓣形弧線飛出再繞回砲台，合成一朵六瓣花；飛出和返回時各能斬同一架敵機一次，每枚最多斬 4 次。"],
    frostbite_orb: ["冰蝕寒霜砲", "冰稜箭每次命中，在敵機身上長出一層冰晶並微微減速；疊滿 5 層時敵機被凍成冰塊 1 秒（首領較短），隨後冰裂，造成其最大生命 12% 的傷害（首領較低），碎冰波及附近敵機並各疊 1 層冰蝕。"]
  },
  en: {
    vital_orb: ["Spirit Charger", "Fires homing spirit bolts. The spirit orb around the turret fills every 8 seconds and streams into the core to heal 6% HP; at full HP it bursts instead, damaging enemies near the core. Spirit Focus: nearby turrets gain +10% attack speed."],
    icewall_orb: ["Frost Wall Cannon", "Ice shells slow enemies in an area by 40%. Every 6 seconds an ice wall rises ahead of the lead enemy for 4 seconds, holding each ship for 1 second and slowing it by 40%; when it shatters it deals 5× damage to nearby enemies."],
    bomb_orb: ["Bomb Sub-cannon", "Lobbed bombs explode in an area, adding 4% of each enemy's max HP as damage and rocking them back; up to 3 ships destroyed by each bomb detonate in turn, hitting enemies around them."],
    phoenix_orb: ["Phoenix Blaze Cannon", "Homing phoenix shells erupt on impact and burn the swarm for 4 seconds. Phoenix Dive: every 10 seconds a giant phoenix sweeps the whole lane, dealing 6× damage to every enemy it passes and setting it ablaze."],
    afterimage_orb: ["Afterimage Cannon", "11 violet afterimages circle the turret in a wide ring that sweeps the lane; each one that touches an enemy deals damage plus 0.5% of its max HP (25% of that on bosses)."],
    sword_orb: ["Thousand-Blade Case", "While charging, ancient swords appear one by one in a ring; then 12 swords leave the case one after another and stream along a sweeping arc onto the enemy like a river of blades, speeding up as they close in, each piercing 2. Sword Array: every 3rd volley turns golden — the swords rise into a fan behind the turret, hover, then loose together for 1.5× damage."],
    missile_orb: ["Pentagram Missile Pod", "Every 4 seconds launches 5 missiles that fly to the target in a turning pentagon, then drop into a pentagram seal that detonates: every enemy inside takes heavy damage and is pinned for 0.5 seconds (bosses less)."],
    ninja_orb: ["Hexagram Shuriken Cannon", "Every 3 seconds throws 6 returning shuriken; each flies a petal-shaped loop out and back to the turret, together tracing a six-petal flower. A shuriken can cut a ship once going out and once coming back, up to 4 cuts each."],
    frostbite_orb: ["Frostbite Cannon", "Each ice lance grows a frost crystal on the enemy and slows it a little; at 5 stacks the enemy is frozen in ice for 1 second (bosses less), then shatters for 12% of its max HP (less on bosses), and the shards hit nearby enemies, adding a frostbite stack to each."]
  },
  ja: {
    vital_orb: ["元気チャージ砲", "追尾する元気弾を放つ。砲台の周りの元気球が8秒ごとに満ち、光の流れとなってコアHPを6%回復。コアが満タンなら元気爆発で周囲の敵を攻撃。元気集束：周囲の砲台の攻撃速度 +10%。"],
    icewall_orb: ["氷壁結界砲", "氷晶弾が範囲内の敵を40%減速。6秒ごとに先頭の敵の前に氷壁を4秒間築き、各機を1秒足止めして40%減速。砕ける時、周囲の敵に5倍ダメージ。"],
    bomb_orb: ["爆弾サブ砲", "放物線を描く爆弾が範囲爆発し、範囲内の敵機に最大HPの4%を追加ダメージしてノックバック。各爆弾で撃破した敵機（最大3機）が連鎖爆発し、周囲の敵を巻き込む。"],
    phoenix_orb: ["火鳳烈炎砲", "追尾する火鳳弾が着弾で爆炎を起こし、敵群を4秒間燃焼させる。浴火急降下：10秒ごとに巨大な火鳳が航路全体を翔け抜け、通過した全ての敵に6倍ダメージを与えて炎上させる。"],
    afterimage_orb: ["残像ファントム砲", "11の紫の残像が砲台の周りを大きく旋回して航路を掃き、触れた敵にダメージと最大HPの0.5%を与える（ボスはその25%）。"],
    sword_orb: ["千刃剣匣", "チャージ中、古剣が一本ずつ剣の輪となって現れ、満ちると12本が次々と匣を出て、弧を描く剣の河となって敵へ押し寄せ、近づくほど加速し、各剣は2体を貫通。万剣斉発：3回ごとの斉射は金の剣となり、砲台の後ろに扇状の剣陣を組んで浮かび、一斉に放たれて1.5倍ダメージ。"],
    missile_orb: ["五芒ミサイル艙", "4秒ごとに5発のミサイルを発射。回転する正五角形の隊形で目標へ飛び、着くと五芒星陣となって起爆。陣内の敵すべてに大ダメージを与え0.5秒拘束（ボスは短め）。"],
    ninja_orb: ["六芒忍刃砲", "3秒ごとに6枚の回旋手裏剣を投げる。各手裏剣は花弁形の弧を描いて砲台へ戻り、六弁の花を描く。行きと帰りで同じ敵を1回ずつ斬れ、1枚につき最大4回。"],
    frostbite_orb: ["氷蝕フロスト砲", "氷の矢が命中するたび敵に氷晶が1層つき、少し減速。5層で敵は1秒間氷漬けになり（ボスは短め）、その後砕けて最大HPの12%ダメージ（ボスは低め）。氷片が周囲の敵にも当たり、それぞれ氷蝕を1層付与。"]
  },
  ko: {
    vital_orb: ["원기 집속포", "유도 원기탄을 쏩니다. 포탑 주변의 원기 구체가 8초마다 차오르면 빛줄기로 코어 HP를 6% 회복하고, 코어가 가득 차 있으면 원기 폭발로 코어 근처의 적을 공격합니다. 원기 집속: 주변 포탑 공격 속도 +10%."],
    icewall_orb: ["빙벽 결계포", "빙정탄이 범위 내 적을 40% 감속합니다. 6초마다 선두 적 앞에 빙벽을 4초간 세워 각 적을 1초 붙잡고 40% 감속시키며, 부서질 때 주변 적에게 5배 피해를 줍니다."],
    bomb_orb: ["폭탄 보조포", "포물선으로 던진 폭탄이 범위 폭발하며 범위 내 적에게 최대 HP의 4% 추가 피해를 주고 밀쳐냅니다. 폭탄마다 격파한 적(최대 3기)이 연쇄 폭발해 주변 적을 휩씁니다."],
    phoenix_orb: ["화봉 열염포", "유도 화봉탄이 착탄 시 폭발해 적 무리를 4초간 불태웁니다. 불사조 강하: 10초마다 거대한 화봉이 항로 전체를 휩쓸어 지나는 모든 적에게 6배 피해를 주고 불태웁니다."],
    afterimage_orb: ["잔상 환영포", "11개의 보라색 잔상이 포탑 주위를 크게 돌며 항로를 휩쓸고, 닿은 적에게 피해와 최대 HP 0.5%를 줍니다 (보스는 그 25%)."],
    sword_orb: ["천인검갑", "충전하는 동안 고검이 한 자루씩 검의 고리로 나타나고, 가득 차면 12자루가 차례로 검갑을 떠나 호를 그리는 검의 강처럼 적에게 몰려가며 가까울수록 빨라지고 각각 2기를 관통합니다. 만검제발: 3번째 일제 사격마다 금빛 검이 포탑 뒤에 부채꼴 검진을 이루어 떠 있다가 일제히 날아가 1.5배 피해를 줍니다."],
    missile_orb: ["오망 미사일 포드", "4초마다 미사일 5발을 발사합니다. 회전하는 정오각형 대형으로 목표까지 날아가 오망성 진으로 떨어져 폭발하며, 진 안의 모든 적에게 큰 피해를 주고 0.5초간 묶습니다 (보스는 짧게)."],
    ninja_orb: ["육망 인검포", "3초마다 회전 수리검 6개를 던집니다. 각 수리검은 꽃잎 모양 호를 그리며 포탑으로 돌아와 여섯 잎 꽃을 그리고, 갈 때와 올 때 같은 적을 한 번씩 벨 수 있으며 개당 최대 4회입니다."],
    frostbite_orb: ["빙식 서리포", "얼음 창이 명중할 때마다 적에게 얼음 결정이 한 겹 자라며 조금 감속됩니다. 5겹이 되면 적이 1초간 얼음에 갇히고(보스는 짧게) 이후 깨지며 최대 HP의 12% 피해(보스는 낮게)를 주고, 파편이 주변 적을 맞혀 각각 빙식 1겹을 더합니다."]
  },
  ru: {
    vital_orb: ["Пушка духа", "Самонаводящиеся снаряды духа. Шар духа вокруг башни заполняется каждые 8 с и течёт в ядро, восстанавливая 6% здоровья; при полном здоровье ядра взрывается, раня врагов рядом с ядром. Фокус духа: соседние башни стреляют на 10% быстрее."],
    icewall_orb: ["Пушка ледяной стены", "Ледяные снаряды замедляют врагов в области на 40%. Каждые 6 с перед ведущим врагом на 4 с встаёт ледяная стена: она держит каждый корабль 1 с и замедляет на 40%, а раскалываясь, наносит соседним врагам 5× урона."],
    bomb_orb: ["Бомбовая подпушка", "Навесные бомбы взрываются по области, нанося 4% макс. здоровья врага и отбрасывая; до 3 кораблей, уничтоженных бомбой, взрываются следом, задевая соседних врагов."],
    phoenix_orb: ["Пушка огненного феникса", "Самонаводящиеся снаряды феникса взрываются, поджигают врагов на 4 с. Пике феникса: каждые 10 с гигантский феникс проносится по всему маршруту, нанося каждому врагу на пути 6× урона и поджигая его."],
    afterimage_orb: ["Призрачная пушка", "11 фиолетовых призраков кружат широким кольцом вокруг башни, задевая маршрут; каждый, коснувшись врага, наносит урон и 0,5% его макс. здоровья (боссам — четверть этого)."],
    sword_orb: ["Ларец тысячи клинков", "Во время заряда древние мечи один за другим встают кольцом; затем 12 мечей по очереди вылетают из ларца и рекой клинков несутся по дуге к врагу, ускоряясь у цели и пробивая по 2. Строй мечей: каждый 3-й залп — золотые мечи веером зависают за башней и разом бьют с уроном ×1,5."],
    missile_orb: ["Пентаграммный ракетный отсек", "Каждые 4 с выпускает 5 ракет: вращающимся пятиугольником они летят к цели и падают в печать-пентаграмму, которая взрывается — все враги внутри получают тяжёлый урон и скованы на 0,5 с (боссы — меньше)."],
    ninja_orb: ["Гексаграммная пушка сюрикенов", "Каждые 3 с бросает 6 возвращающихся сюрикенов: каждый летит петлёй-лепестком и возвращается к башне, вместе они рисуют шестилепестковый цветок. Сюрикен может рассечь корабль по разу туда и обратно, до 4 ударов."],
    frostbite_orb: ["Пушка ледяной эрозии", "Каждое ледяное копьё наращивает на враге кристалл и слегка замедляет; на 5 стаках враг вмерзает в лёд на 1 с (боссы — меньше), затем раскалывается, получая 12% макс. здоровья (боссы — меньше), а осколки бьют соседей и дают им по стаку обморожения."]
  },
  es: {
    vital_orb: ["Cañón de Espíritu", "Dispara proyectiles guiados de espíritu. El orbe de espíritu se llena cada 8 s y fluye al núcleo para curar el 6 %; con el núcleo lleno, estalla y daña a los enemigos cercanos. Foco espiritual: las torretas cercanas ganan +10 % de velocidad de ataque."],
    icewall_orb: ["Cañón Muro Helado", "Los proyectiles de hielo ralentizan un 40% en área. Cada 6 s se alza un muro de hielo ante el enemigo líder durante 4 s: retiene cada nave 1 s y la ralentiza un 40%; al romperse inflige 5× de daño a los enemigos cercanos."],
    bomb_orb: ["Subcañón Bomba", "Las bombas lanzadas en parábola explotan en área, infligen un 4% de la vida máxima y empujan; hasta 3 naves destruidas por cada bomba estallan en cadena y dañan a los enemigos cercanos."],
    phoenix_orb: ["Cañón Fénix Ardiente", "Proyectiles guiados del fénix que estallan, queman al enjambre 4 s. Picado del fénix: cada 10 s un fénix gigante recorre toda la ruta, inflige 6× de daño a cada enemigo que cruza y lo incendia."],
    afterimage_orb: ["Cañón Espejismo", "11 espejismos violetas giran en un amplio anillo alrededor de la torreta barriendo la ruta; cada uno que toca a un enemigo inflige daño y un 0,5% de su vida máxima (un 25% de eso a los jefes)."],
    sword_orb: ["Cofre de Mil Hojas", "Al cargar, las espadas antiguas aparecen una a una en un anillo; luego 12 espadas salen del cofre una tras otra y fluyen en un arco hacia el enemigo como un río de hojas, acelerando al acercarse y atravesando 2 cada una. Formación de espadas: cada 3.ª andanada se vuelve dorada: las espadas se alzan en abanico tras la torreta, flotan y se lanzan juntas con 1,5× de daño."],
    missile_orb: ["Cápsula Pentagrama", "Cada 4 s lanza 5 misiles que vuelan hacia el objetivo en un pentágono giratorio y caen formando un sello de pentagrama que estalla: todos los enemigos dentro reciben gran daño y quedan inmovilizados 0,5 s (los jefes, menos)."],
    ninja_orb: ["Cañón Shuriken Hexagrama", "Cada 3 s lanza 6 shuriken que regresan: cada uno traza un bucle en forma de pétalo y vuelve a la torreta, dibujando juntos una flor de seis pétalos. Puede cortar a una nave una vez a la ida y otra a la vuelta, hasta 4 cortes."],
    frostbite_orb: ["Cañón Escarcha Corrosiva", "Cada lanza de hielo hace crecer un cristal de escarcha en el enemigo y lo ralentiza un poco; con 5 acumulaciones queda congelado 1 s (los jefes, menos) y luego se rompe, sufriendo un 12% de su vida máxima (menos en jefes); los fragmentos golpean a los cercanos y les añaden una acumulación."]
  }
};
for (const [language, items] of Object.entries(V2_OFFER_TURRET_I18N)) {
  if (window.V2_I18N?.[language]?.turrets) Object.assign(window.V2_I18N[language].turrets, items);
}
