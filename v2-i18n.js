/* Complete localization for the v2 systems. Keep gameplay IDs stable; only display text is translated. */
window.V2_I18N = {
  zh: {
    emergency_shield: ["殘血護盾核", "核心生命首次低於 30% 時啟動；星級 1–5 分別提供 1–5 次傷害護盾。"],
    frost_core: ["冰晶減速核", "命中造成 5% 減速，持續 2.5 秒；升星會提高減速幅度。"],
    flame_core: ["烈焰點燃核", "命中灼燒 4 秒，每秒造成魔攻 14% 傷害；升星會提高灼燒傷害。"],
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
    frost_core: ["Frost Slow Core", "Hits slow by 5% for 2.5 seconds; stars increase the slow amount."],
    flame_core: ["Flame Ignition Core", "Hits burn for 4 seconds and deal 14% of Magic ATK each second; stars increase burn damage."],
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
    frost_core: ["氷晶減速コア", "命中時に5%減速を2.5秒付与し、星上げで減速量が増加します。"],
    flame_core: ["火炎着火コア", "命中時に4秒間燃焼し、毎秒魔攻14%のダメージ。星上げで燃焼ダメージが増加します。"],
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
    frost_core: ["빙결 감속 코어", "적중 시 2.5초 동안 5% 감속하며, 성급이 오르면 감속량이 증가합니다."],
    flame_core: ["화염 점화 코어", "적중 시 4초 동안 초당 마법 공격력의 14%로 연소 피해를 주며, 성급이 오르면 피해가 증가합니다."],
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
    frost_core: ["Ледяное ядро", "Попадания замедляют на 5% на 2,5 с; звёзды усиливают замедление."],
    flame_core: ["Огненное ядро", "Попадания поджигают на 4 с и наносят 14% магической атаки в секунду; звёзды усиливают горение."],
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
    frost_core: ["Núcleo de ralentización gélida", "Los impactos ralentizan un 5 % durante 2,5 s; las estrellas aumentan la ralentización."],
    flame_core: ["Núcleo de ignición", "Los impactos queman durante 4 s e infligen un 14 % del ATQ mágico por segundo; las estrellas aumentan el daño."],
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
      full_hp_berserk: ["만피 광전 코어", "코어 체력이 100%일 때 공격 속도가 15% 증가합니다."],
      weakening_curse: ["약화 저주 코어", "명중한 적의 공격력이 15% 감소합니다."],
      heavy_cannon: ["중형 대포 코어", "느리지만 강력하며 큰 밀쳐내기를 줍니다."],
      pulse_quantum: ["추적 양자 포탑", "전장에서 체력이 가장 높은 적을 정밀 타격합니다."],
      gatling: ["개틀링 기관포", "매우 빠른 저위력 연사로 명중 효과를 자주 발동합니다."],
      split_cannon: ["2단 분열포", "포탄이 전진한 뒤 좌우 두 발로 갈라집니다."],
      arcane_core: ["비전 코어", "추적 에너지 구체가 작은 범위에 마법 폭발을 일으킵니다."],
      reflect_bastion: ["반사 금강 포탑", "강한 보호막과 반사 피해로 접근한 적에게 반격합니다."],
      scatter_heavy: ["중형 산탄포", "공격마다 근거리 산탄 8발을 동시에 발사합니다."],
      double_burst: ["이중 연사 코어", "기본 탄환 두 발을 평행으로 발사합니다."],
      annihilation_laser: ["섬멸 레이저 포탑", "경로의 모든 적을 관통하는 광선을 발사합니다."],
      void_devourer: ["공허 포식 포탑", "처치를 누적하면 적을 끌어당기고 피해를 주는 소형 블랙홀을 소환합니다."],
      vulnerability_mark: ["취약 표식 코어", "표식이 남은 적이 이후 받는 피해가 15% 증가합니다."],
      missile_nest: ["미사일 둥지", "소형 추적 미사일 6발을 일제 발사합니다. 재사용 10초."],
      charged_laser: ["충전 레이저포", "3초 충전 후 고위력 레이저를 발사합니다."],
      frost_rail: ["빙결 레일 포탑", "지속 냉각 사격으로 대상을 5% 감속합니다."],
      shield_generator: ["보호막 생성기", "같은 주포 노드 주변 포탑에 추가 보호막을 제공합니다."],
      flame_sprayer: ["화염 분사 포탑", "전방 원뿔 범위를 계속 불태웁니다."],
      long_range_sniper: ["장거리 저격포", "외곽에서 먼 적이나 Boss를 우선 공격합니다."],
      chain_arc: ["연쇄 전기 포탑", "번개가 적 3~5기 사이를 튕깁니다."],
      crit_resonance: ["치명 공명 포탑", "같은 포탑 노드의 치명타 확률을 5% 높입니다."],
      time_slow: ["시공 감속 포탑", "적을 5% 감속하는 지속 영역을 펼칩니다."],
      cluster_bomb: ["확산 폭탄 포탑", "명중 후 소형 폭탄 3개로 갈라져 다시 폭발합니다."],
      mining_gold: ["골드 채굴 포탑", "공격하지 않고 매 웨이브 종료 시 추가 골드를 제공합니다."],
      soul_drain: ["영혼 흡수 포탑", "적 처치 시 주 코어 체력을 0.5% 회복합니다."],
      shadow_replica: ["그림자 복제 포탑", "주포 탄막을 20% 피해로 복제합니다."],
      antimatter: ["반물질 포탑", "대상 최대 체력의 10% 피해를 줍니다. 재사용 30초."]
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
      full_hp_berserk: ["Ядро полной ярости", "При полном здоровье скорость огня повышена на 15%."],
      weakening_curse: ["Ядро ослабления", "Атака поражённого врага снижается на 15%."],
      heavy_cannon: ["Ядро тяжёлой пушки", "Медленные мощные снаряды сильно отбрасывают."],
      pulse_quantum: ["Импульсная квантовая башня", "Точно бьёт врага с наибольшим запасом здоровья."],
      gatling: ["Пулемёт Гатлинга", "Очень быстрый огонь с малым уроном часто активирует эффекты попадания."],
      split_cannon: ["Двухступенчатая пушка", "Снаряд разделяется на левый и правый после полёта."],
      arcane_core: ["Мистическое ядро", "Самонаводящиеся сферы взрываются магией по небольшой области."],
      reflect_bastion: ["Отражающий бастион", "Мощный щит и ответный урон против приблизившихся врагов."],
      scatter_heavy: ["Тяжёлый дробовик", "Каждая атака выпускает восемь ближних дробин."],
      double_burst: ["Ядро двойного залпа", "Одновременно выпускает два параллельных снаряда."],
      annihilation_laser: ["Лазер уничтожения", "Пробивающий луч проходит через всех врагов на линии."],
      void_devourer: ["Пожиратель пустоты", "Серия убийств призывает микрочёрную дыру, стягивающую и ранящую врагов."],
      vulnerability_mark: ["Ядро метки уязвимости", "Помеченные враги получают на 15% больше последующего урона."],
      missile_nest: ["Ракетное гнездо", "Залп из шести самонаводящихся ракет; перезарядка 10 секунд."],
      charged_laser: ["Зарядная лазерная пушка", "После 3 секунд зарядки выпускает мощный лазер."],
      frost_rail: ["Морозная рельсовая башня", "Непрерывный холодный огонь замедляет на 5%."],
      shield_generator: ["Генератор щита", "Даёт дополнительный щит башням того же главного узла."],
      flame_sprayer: ["Огнемётная башня", "Непрерывно поджигает врагов в переднем конусе."],
      long_range_sniper: ["Дальнобойный снайпер", "С внешнего кольца предпочитает дальние цели и Boss."],
      chain_arc: ["Цепная дуговая башня", "Молния прыгает между 3–5 врагами."],
      crit_resonance: ["Башня резонанса критов", "Даёт узлу башен +5% шанса критического удара."],
      time_slow: ["Башня замедления времени", "Создаёт поле постоянного замедления врагов на 5%."],
      cluster_bomb: ["Кассетная башня", "Попадание делится на три вторичных взрыва."],
      mining_gold: ["Золотодобывающая башня", "Не атакует; даёт дополнительное золото после каждой волны."],
      soul_drain: ["Башня похищения душ", "Убийства восстанавливают главному ядру 0,5% здоровья."],
      shadow_replica: ["Теневая копия", "Копирует залп главной башни с 20% урона."],
      antimatter: ["Башня антиматерии", "Наносит 10% максимального здоровья цели; перезарядка 30 секунд."]
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
      full_hp_berserk: ["Núcleo furioso a plena vida", "Obtiene un 15% de velocidad de ataque con la vida al máximo."],
      weakening_curse: ["Núcleo de maldición débil", "Reduce un 15% el ataque de los enemigos alcanzados."],
      heavy_cannon: ["Núcleo de cañón pesado", "Proyectiles lentos y potentes con gran retroceso."],
      pulse_quantum: ["Torreta cuántica de pulso", "Ataca con precisión al enemigo con más vida."],
      gatling: ["Ametralladora Gatling", "Disparo muy rápido y de bajo daño para activar efectos con frecuencia."],
      split_cannon: ["Cañón divisor de dos fases", "El proyectil se divide a izquierda y derecha tras avanzar."],
      arcane_core: ["Núcleo arcano", "Orbes guiados explotan con magia en un área pequeña."],
      reflect_bastion: ["Bastión reflectante", "Gran escudo y represalia contra enemigos cercanos."],
      scatter_heavy: ["Cañón de dispersión pesado", "Dispara ocho perdigones de corto alcance por ataque."],
      double_burst: ["Núcleo de doble ráfaga", "Dispara dos proyectiles básicos paralelos."],
      annihilation_laser: ["Láser de aniquilación", "Un rayo perforante atraviesa a todos los enemigos de su trayectoria."],
      void_devourer: ["Devorador del vacío", "Las bajas acumuladas invocan un microagujero negro que atrae y daña."],
      vulnerability_mark: ["Núcleo de marca vulnerable", "Los enemigos marcados reciben un 15% más de daño posterior."],
      missile_nest: ["Nido de misiles", "Lanza seis micromisiles guiados; recarga de 10 segundos."],
      charged_laser: ["Cañón láser cargado", "Carga 3 segundos y dispara un láser de gran daño."],
      frost_rail: ["Torreta de riel gélido", "El fuego congelante continuo ralentiza un 5%."],
      shield_generator: ["Generador de escudo", "Da escudo adicional a las torretas del mismo nodo principal."],
      flame_sprayer: ["Torreta lanzallamas", "Quema continuamente a los enemigos en un cono frontal."],
      long_range_sniper: ["Francotirador de largo alcance", "Desde el anillo exterior prioriza objetivos lejanos o Boss."],
      chain_arc: ["Torreta de arco encadenado", "El rayo salta entre 3 y 5 enemigos."],
      crit_resonance: ["Torreta de resonancia crítica", "Añade un 5% de probabilidad crítica al nodo."],
      time_slow: ["Torreta de ralentización temporal", "Proyecta un campo que ralentiza un 5%."],
      cluster_bomb: ["Torreta de bomba de racimo", "El impacto se divide en tres explosiones secundarias."],
      mining_gold: ["Torreta minera de oro", "No ataca; concede oro adicional tras cada oleada."],
      soul_drain: ["Torreta de drenaje de alma", "Las bajas restauran un 0,5% de vida al núcleo principal."],
      shadow_replica: ["Torreta réplica sombría", "Copia la ráfaga principal con un 20% de daño."],
      antimatter: ["Torreta de antimateria", "Inflige el 10% de la vida máxima del objetivo; recarga de 30 segundos."]
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
      full_hp_berserk: ["滿血狂暴核", "核心生命維持 100% 時，額外提高 15% 攻速。"],
      weakening_curse: ["虛弱詛咒核", "被命中的敵人攻擊力降低 15%。"],
      heavy_cannon: ["重型加農核", "攻速慢、單發傷害高，命中帶有擊退。"],
      pulse_quantum: ["追脈量子塔", "自動鎖定全場生命值最高的敵人精準打擊。"],
      gatling: ["加特林機槍", "極高攻速、單發傷害低，專精頻繁觸發命中效果。"],
      split_cannon: ["兩段分裂砲", "子彈前進一段距離後，分裂為左右兩發。"],
      arcane_core: ["奧術核心", "發射追蹤能量球，命中後造成小範圍魔法爆破。"],
      reflect_bastion: ["反射金剛塔", "高生命護盾與反傷，近身敵人撞擊時受到高比例反傷。"],
      scatter_heavy: ["散彈重砲", "每次攻擊同時發射 8 發近距離擴散彈丸。"],
      double_burst: ["雙重連射核", "一次平行發射 2 發基礎子彈。"],
      annihilation_laser: ["毀滅雷射塔", "持續發射可穿透所有敵人的貫穿光束。"],
      void_devourer: ["虛空吞噬塔", "累積擊殺後召喚微型黑洞，集中並傷害敵群。"],
      vulnerability_mark: ["易傷標記核", "命中標記敵人，使其後續承受的所有傷害提高 15%。"],
      missile_nest: ["飛彈巢", "一次齊射 6 發微型追蹤飛彈，冷卻 10 秒。"],
      charged_laser: ["充能雷射砲", "蓄力 3 秒後發射一發高傷害毀滅雷射。"],
      frost_rail: ["冰霜導軌塔", "持續發射冰凍射線，被擊中者減速 5%。"],
      shield_generator: ["護盾產生器", "為同一主砲節點附近砲台提供額外護盾。"],
      flame_sprayer: ["烈焰噴射塔", "向前方錐形範圍持續噴火，造成範圍灼燒。"],
      long_range_sniper: ["狙擊長程砲", "架設於最外圈，優先攻擊最遠或 Boss 單位。"],
      chain_arc: ["連鎖電弧塔", "閃電在 3 至 5 個敵人之間彈跳。"],
      crit_resonance: ["暴擊共鳴塔", "提升同節點附近砲台 5% 暴擊率。"],
      time_slow: ["時空遲緩塔", "展開持續減速的遲緩場，使場內敵人減速 5%。"],
      cluster_bomb: ["擴散爆彈塔", "命中後分裂成 3 個小爆彈二次引爆。"],
      mining_gold: ["採礦金幣塔", "不具備攻擊力，每波結束提供額外金幣。"],
      soul_drain: ["靈魂汲取塔", "擊殺敵人時，為主砲恢復 0.5% 生命值。"],
      shadow_replica: ["影子複製塔", "複製主砲 20% 傷害的子彈彈幕。"],
      antimatter: ["反物質塔", "造成目標最大生命值 10% 的傷害，冷卻 30 秒。"]
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
      full_hp_berserk: ["Full-HP Berserker Core", "Gains 15% fire rate while the core is at full health."],
      weakening_curse: ["Weakening Curse Core", "Hit enemies deal 15% less damage."],
      heavy_cannon: ["Heavy Cannon Core", "Slow, powerful shells with strong knockback."],
      pulse_quantum: ["Pulse Quantum Turret", "Precisely targets the enemy with the highest health."],
      gatling: ["Gatling Gun", "Very high fire rate and low per-shot damage for frequent hit effects."],
      split_cannon: ["Two-Stage Split Cannon", "Shells split into left and right shots after traveling."],
      arcane_core: ["Arcane Core", "Tracking energy orbs explode in a small magic area."],
      reflect_bastion: ["Reflective Bastion", "High shielding and retaliation against enemies that close in."],
      scatter_heavy: ["Heavy Scatter Cannon", "Fires eight close-range pellets with every attack."],
      double_burst: ["Double Burst Core", "Fires two parallel standard rounds at once."],
      annihilation_laser: ["Annihilation Laser", "A piercing beam passes through every enemy in its path."],
      void_devourer: ["Void Devourer", "Accumulated kills summon a micro black hole that pulls and damages enemies."],
      vulnerability_mark: ["Vulnerability Mark Core", "Marked enemies take 15% more damage from later attacks."],
      missile_nest: ["Missile Nest", "Fires six micro homing missiles in a volley; 10-second cooldown."],
      charged_laser: ["Charged Laser Cannon", "Charges for 3 seconds, then fires a high-damage laser."],
      frost_rail: ["Frost Rail Turret", "Sustained freezing fire slows targets by 5%."],
      shield_generator: ["Shield Generator", "Provides extra shielding to turrets around the same main node."],
      flame_sprayer: ["Flame Sprayer", "Continuously burns enemies in a forward cone."],
      long_range_sniper: ["Long-Range Sniper", "Deployed on the outer ring and prioritizes distant targets or bosses."],
      chain_arc: ["Chain Arc Turret", "Lightning jumps between three to five enemies."],
      crit_resonance: ["Critical Resonance Turret", "Adds 5% critical chance to its turret node."],
      time_slow: ["Temporal Slow Turret", "Projects a field that slows enemies by 5%."],
      cluster_bomb: ["Cluster Bomb Turret", "Hits split into three smaller secondary explosions."],
      mining_gold: ["Gold Mining Turret", "Does not attack; grants bonus Gold after every wave."],
      soul_drain: ["Soul Drain Turret", "Enemy kills restore 0.5% of the main core's health."],
      shadow_replica: ["Shadow Replica Turret", "Copies the main turret's barrage at 20% damage."],
      antimatter: ["Antimatter Turret", "Deals 10% of a target's maximum health; 30-second cooldown."]
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
      full_hp_berserk: ["満タン狂戦コア", "コアHPが100%の間、攻撃速度+15%。"],
      weakening_curse: ["弱体呪詛コア", "命中した敵の攻撃力を15%低下。"],
      heavy_cannon: ["重砲コア", "低速・高威力で、命中時に強くノックバック。"],
      pulse_quantum: ["追脈量子砲", "フィールドで最もHPの高い敵を精密攻撃。"],
      gatling: ["ガトリング砲", "超高速・低威力の連射で命中効果を頻発させる。"],
      split_cannon: ["二段分裂砲", "弾が進んだ後、左右2発に分裂する。"],
      arcane_core: ["秘術コア", "追尾エネルギー弾が小範囲の魔法爆発を起こす。"],
      reflect_bastion: ["反射金剛砲", "強力なシールドと反射で接近した敵に反撃。"],
      scatter_heavy: ["重散弾砲", "攻撃ごとに近距離散弾を8発同時射撃。"],
      double_burst: ["二連射コア", "通常弾を平行に2発同時発射。"],
      annihilation_laser: ["殲滅レーザー砲", "射線上の全敵を貫通する光線を放つ。"],
      void_devourer: ["虚空捕食砲", "撃破を重ねると敵を引き寄せて傷つける小型ブラックホールを召喚。"],
      vulnerability_mark: ["脆弱標識コア", "標識された敵の以後の被ダメージ+15%。"],
      missile_nest: ["ミサイルネスト", "小型追尾ミサイル6発を斉射。クールダウン10秒。"],
      charged_laser: ["充填レーザー砲", "3秒チャージ後、高威力レーザーを発射。"],
      frost_rail: ["氷霜レール砲", "持続冷凍射撃で対象を5%減速。"],
      shield_generator: ["シールド発生器", "同じ主砲ノード周辺の砲台に追加シールドを供給。"],
      flame_sprayer: ["火炎放射砲", "前方の扇形範囲を継続燃焼。"],
      long_range_sniper: ["長距離狙撃砲", "外周から遠距離目標やBossを優先射撃。"],
      chain_arc: ["連鎖電弧砲", "雷撃が3～5体の敵を跳ねる。"],
      crit_resonance: ["会心共鳴砲", "同じ砲台ノードの会心率+5%。"],
      time_slow: ["時空遅延砲", "敵を5%減速する持続フィールドを展開。"],
      cluster_bomb: ["拡散爆弾砲", "命中後、3個の小型爆弾に分裂して再爆発。"],
      mining_gold: ["採掘金貨砲", "攻撃せず、各ウェーブ終了時に追加ゴールドを獲得。"],
      soul_drain: ["魂吸収砲", "敵撃破時に主コアHPを0.5%回復。"],
      shadow_replica: ["影複製砲", "主砲弾幕を20%ダメージで複製。"],
      antimatter: ["反物質砲", "対象の最大HP10%分のダメージ。クールダウン30秒。"]
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
for (const [lang, text] of Object.entries({"zh": ["碧焰龍息砲", "追蹤碧焰命中後，連鎖至另外 2 個目標，連鎖傷害為 55%。新手包專屬，固定一星。"], "en": ["Emerald Drake", "Homing emerald bolts chain to 2 more targets for 55% damage. Starter exclusive; fixed at one star."], "ja": ["碧焔ドラグーン", "追尾する碧焔が命中後、別の2体へ55%のダメージで連鎖。スターターパック限定、1星固定。"], "ko": ["비취 드레이크", "유도 비취탄이 적중 후 다른 적 2명에게 55% 피해로 연쇄됩니다. 스타터 팩 전용, 1성 고정."], "ru": ["Изумрудный дракон", "Самонаводящийся снаряд поражает ещё 2 цели с 55% урона. Только в стартовом наборе; одна звезда."], "es": ["Dragón Esmeralda", "Los proyectiles teledirigidos saltan a 2 objetivos más con un 55 % de daño. Exclusivo del pack inicial; una estrella fija."]})) window.V2_I18N[lang].turrets.emerald_drake = text;

const V2_NEW_MAIN_TURRET_I18N = {
  zh: {
    capacitor_pulse: ["蓄能脈衝砲", "每第 5 發蓄能彈命中時，對同一目標追加該發 60% 物理傷害。"],
    royal_tide: ["寶藍潮汐砲", "每第 4 發寶藍彈釋放半徑 96 的潮汐波，對周圍敵人造成該發 35% 魔法傷害並減速 8%，持續 2 秒。"],
    phase_echo: ["相位回聲砲", "每發命中都會產生相位回聲，對同一目標追加該發 45% 物理傷害。"]
  },
  en: {
    capacitor_pulse: ["Capacitor Pulse", "Every 5th charged round deals an extra 60% of that hit as physical damage to the same target."],
    royal_tide: ["Royal Sapphire Tide", "Every 4th sapphire round releases a radius-96 tide that deals 35% of the hit as magic damage nearby and slows by 8% for 2 seconds."],
    phase_echo: ["Phase Echo Cannon", "Every hit creates a phase echo that deals an extra 45% of that hit as physical damage to the same target."]
  },
  ja: {
    capacitor_pulse: ["蓄電パルス砲", "5発目ごとの蓄電弾は、命中した同じ標的へその60%の物理追加ダメージを与えます。"],
    royal_tide: ["ロイヤルサファイア潮砲", "4発目ごとの蒼玉弾が半径96の潮波を放ち、周囲へ命中ダメージの35%の魔法ダメージと8%減速を2秒間与えます。"],
    phase_echo: ["位相エコー砲", "命中するたび位相エコーが発生し、同じ標的へその45%の物理追加ダメージを与えます。"]
  },
  ko: {
    capacitor_pulse: ["축전 펄스포", "5번째 축전탄이 적중하면 같은 대상에게 해당 피해의 60%를 물리 추가 피해로 줍니다."],
    royal_tide: ["로열 사파이어 파도포", "4번째 사파이어탄이 반경 96의 파도를 일으켜 주변에 해당 피해의 35% 마법 피해를 주고 2초 동안 8% 감속합니다."],
    phase_echo: ["위상 메아리포", "공격이 적중할 때마다 위상 메아리가 같은 대상에게 해당 피해의 45%를 물리 추가 피해로 줍니다."]
  },
  ru: {
    capacitor_pulse: ["Накопительная импульсная пушка", "Каждый 5-й заряженный снаряд наносит той же цели ещё 60% урона попадания как физический урон."],
    royal_tide: ["Королевская сапфировая волна", "Каждый 4-й сапфировый снаряд создаёт волну радиусом 96: 35% урона попадания как магический урон по области и замедление 8% на 2 с."],
    phase_echo: ["Пушка фазового эха", "Каждое попадание создаёт фазовое эхо и наносит той же цели ещё 45% урона попадания как физический урон."]
  },
  es: {
    capacitor_pulse: ["Cañón de pulso capacitivo", "Cada 5.º proyectil cargado inflige al mismo objetivo un 60 % adicional del impacto como daño físico."],
    royal_tide: ["Marea de zafiro real", "Cada 4.º proyectil de zafiro libera una marea de radio 96 que causa un 35 % del impacto como daño mágico en área y ralentiza un 8 % durante 2 s."],
    phase_echo: ["Cañón de eco de fase", "Cada impacto crea un eco de fase que inflige al mismo objetivo un 45 % adicional del impacto como daño físico."]
  }
};

for (const [language, items] of Object.entries(V2_NEW_MAIN_TURRET_I18N)) {
  Object.assign(window.V2_I18N[language].turrets, items);
}

const V2_VIP_TURRET_I18N = {
  zh: {
    vip_prism_lancer: ["幻稜折光砲", "棱鏡光束貫穿敵人，命中後留下相位回聲。"], vip_thunder_throne: ["雷霆王座", "鎖定強敵，金色電弧連鎖五個目標。"], vip_frost_bloom: ["霜月花冠", "霜花在敵群中綻放，造成範圍傷害與緩速。"], vip_star_phoenix: ["熔星鳳凰", "火羽分裂爆破，留下持續灼燒。"], vip_abyssal_tide: ["深海潮汐", "潮汐脈衝擴散，造成範圍傷害與緩速。"],
    vip_quantum_crown: ["量子皇冕", "追蹤星彈與紫金連鎖光弧。集滿 100 碎片可組裝。"], vip_singularity_king: ["黑洞君王", "擊殺蓄積引力，召喚牽引敵人的黑洞。集滿 100 碎片可組裝。"], vip_solar_judgment: ["赤陽審判", "赤金光束貫穿敵人並施加灼燒。集滿 100 碎片可組裝。"], vip_nebula_hymn: ["星雲聖歌", "星雲護盾與共鳴光環守護砲台。集滿 100 碎片可組裝。"], vip_chrono_axis: ["時序天樞", "時序齒環緩速敵群，冰晶電弧連鎖命中。集滿 100 碎片可組裝。"]
  },
  en: {
    vip_prism_lancer: ["Prismatic Lancer", "A prism beam pierces enemies and leaves a phase echo."], vip_thunder_throne: ["Thunder Throne", "Golden arcs target powerful enemies and chain across five targets."], vip_frost_bloom: ["Moonfrost Bloom", "Frost petals burst among enemies, damaging and slowing them."], vip_star_phoenix: ["Starforge Phoenix", "Fiery feathers split, explode, and keep burning."], vip_abyssal_tide: ["Abyssal Tide", "Tidal pulses spread area damage and slowing."],
    vip_quantum_crown: ["Quantum Crown", "Homing stars chain through enemies. Assemble with 100 shards."], vip_singularity_king: ["Singularity King", "Kills charge a black hole that pulls enemies. Assemble with 100 shards."], vip_solar_judgment: ["Solar Judgment", "A golden beam pierces and burns enemies. Assemble with 100 shards."], vip_nebula_hymn: ["Nebula Hymn", "A stellar shield and aura support nearby turrets. Assemble with 100 shards."], vip_chrono_axis: ["Chrono Axis", "Time gears slow enemies while icy arcs chain between them. Assemble with 100 shards."]
  },
  ja: {
    vip_prism_lancer: ["幻稜ランサー", "プリズム光線が敵を貫き、位相の残響を残す。"], vip_thunder_throne: ["雷霆の玉座", "黄金の電弧が強敵を狙い、5体へ連鎖する。"], vip_frost_bloom: ["月霜の花冠", "霜の花びらが範囲攻撃と減速を与える。"], vip_star_phoenix: ["熔星の鳳凰", "炎の羽が分裂・爆発し、燃焼を残す。"], vip_abyssal_tide: ["深海の潮流", "潮の衝撃が範囲ダメージと減速を与える。"],
    vip_quantum_crown: ["量子の王冠", "追尾する星が敵に連鎖。欠片100個で組立可能。"], vip_singularity_king: ["特異点の王", "撃破で力をため、敵を引き寄せるブラックホールを生成。欠片100個で組立可能。"], vip_solar_judgment: ["太陽の審判", "黄金の光線が敵を貫き燃やす。欠片100個で組立可能。"], vip_nebula_hymn: ["星雲の聖歌", "星のシールドとオーラで砲台を支援。欠片100個で組立可能。"], vip_chrono_axis: ["時空の軸", "時の歯車が敵を減速し、氷の電弧が連鎖。欠片100個で組立可能。"]
  },
  ko: {
    vip_prism_lancer: ["환릉 프리즘포", "프리즘 광선이 적을 관통하고 위상 잔향을 남깁니다."], vip_thunder_throne: ["천둥의 왕좌", "황금 전격이 강적을 노려 다섯 대상에게 연쇄됩니다."], vip_frost_bloom: ["달서리 화관", "서리 꽃잎이 범위 피해와 둔화를 줍니다."], vip_star_phoenix: ["용성 불사조", "화염 깃털이 분열 폭발하고 화상을 남깁니다."], vip_abyssal_tide: ["심해의 파도", "파도 충격이 범위 피해와 둔화를 줍니다."],
    vip_quantum_crown: ["양자 왕관", "유도 별탄이 적 사이를 연쇄합니다. 조각 100개로 조립합니다."], vip_singularity_king: ["특이점의 왕", "처치로 힘을 모아 적을 끌어당기는 블랙홀을 만듭니다. 조각 100개로 조립합니다."], vip_solar_judgment: ["태양의 심판", "황금 광선이 적을 관통하고 불태웁니다. 조각 100개로 조립합니다."], vip_nebula_hymn: ["성운의 찬가", "별의 보호막과 오라로 포탑을 지원합니다. 조각 100개로 조립합니다."], vip_chrono_axis: ["시간의 축", "시간 톱니가 적을 늦추고 얼음 전격이 연쇄됩니다. 조각 100개로 조립합니다."]
  },
  ru: {
    vip_prism_lancer: ["Призматический копейщик", "Призматический луч пронзает врагов и оставляет фазовое эхо."], vip_thunder_throne: ["Громовой трон", "Золотые разряды поражают сильных врагов и цепляют пять целей."], vip_frost_bloom: ["Лунный морозный цветок", "Морозные лепестки наносят урон по области и замедляют."], vip_star_phoenix: ["Звёздный феникс", "Огненные перья разделяются, взрываются и поджигают."], vip_abyssal_tide: ["Глубинный прилив", "Приливные импульсы наносят урон по области и замедляют."],
    vip_quantum_crown: ["Квантовая корона", "Самонаводящиеся звёзды цепляют врагов. Сборка за 100 осколков."], vip_singularity_king: ["Король сингулярности", "Убийства заряжают чёрную дыру, притягивающую врагов. Сборка за 100 осколков."], vip_solar_judgment: ["Солнечный суд", "Золотой луч пронзает и поджигает врагов. Сборка за 100 осколков."], vip_nebula_hymn: ["Гимн туманности", "Звёздный щит и аура усиливают башни. Сборка за 100 осколков."], vip_chrono_axis: ["Ось времени", "Часовые шестерни замедляют, ледяные разряды поражают цепью. Сборка за 100 осколков."]
  },
  es: {
    vip_prism_lancer: ["Lancero prismático", "Un rayo prismático atraviesa enemigos y deja un eco de fase."], vip_thunder_throne: ["Trono del trueno", "Arcos dorados buscan enemigos fuertes y saltan entre cinco objetivos."], vip_frost_bloom: ["Flor de escarcha lunar", "Pétalos helados causan daño en área y ralentizan."], vip_star_phoenix: ["Fénix estelar", "Plumas de fuego se dividen, explotan y queman."], vip_abyssal_tide: ["Marea abisal", "Pulsos de marea causan daño en área y ralentizan."],
    vip_quantum_crown: ["Corona cuántica", "Estrellas guiadas encadenan enemigos. Se arma con 100 fragmentos."], vip_singularity_king: ["Rey de la singularidad", "Las bajas cargan un agujero negro que atrae enemigos. Se arma con 100 fragmentos."], vip_solar_judgment: ["Juicio solar", "Un rayo dorado atraviesa y quema enemigos. Se arma con 100 fragmentos."], vip_nebula_hymn: ["Himno de la nebulosa", "Un escudo estelar y un aura apoyan a las torretas. Se arma con 100 fragmentos."], vip_chrono_axis: ["Eje cronal", "Engranajes frenan y rayos helados se encadenan. Se arma con 100 fragmentos."]
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
