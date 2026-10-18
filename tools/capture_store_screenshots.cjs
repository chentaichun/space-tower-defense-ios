const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const projectDir = path.resolve(__dirname, '..');
const outputDir = path.join(projectDir, 'store-assets', 'screenshots-v2');

const shots = [
  '01-choose-your-tech-path.png',
  '02-orbital-fighter-crossfire.png',
  '03-ultimate-boss-star-destroyer.png',
  '04-emp-pulse-frost-lockdown.png',
  '05-drone-swarm-chain-blast.png',
  '06-mothership-sniper-assault.png',
  '07-engineer-your-tower-build.png'
];

async function stageBase(page, wave, skills = []) {
  await page.evaluate(({ targetWave, skillIds }) => {
    devJumpToWave(targetWave);
    cardEffects = createCardEffects();
    specialState = createSpecialState();
    enemies = [];
    bullets = [];
    particles = [];
    shockwaves = [];
    scorePopups = [];
    auxiliaryTurrets = [];
    fighters = [];
    drones = [];
    laserBeams = [];
    bossWarning = null;
    choosingCard = false;
    offeredCards = [];
    cardChoice.classList.add('hidden');

    towerStats.attack = 720;
    towerStats.attackSpeed = 54;
    towerStats.maxHp = 12000;
    towerStats.regen = 320;
    towerStats.magicAttack = 460;
    towerStats.critChance = 0.34;
    towerStats.critDamage = 3.4;
    tower.attack = towerStats.attack;
    coreHp = 10200;
    gold = DEV_RESOURCE_AMOUNT;
    obsidian = DEV_RESOURCE_AMOUNT;

    for (const [cardId, count] of skillIds) {
      const card = SPECIAL_CARDS.find((item) => item.id === cardId);
      for (let i = 0; card && i < count; i += 1) card.apply();
    }

    // Freeze simulation through the card-choice gate without drawing the large
    // "Paused" overlay. This preserves the exact combat frame for the capture.
    running = true;
    isPaused = false;
    choosingCard = true;
    fireTimer = 999;
    devPanel.style.display = 'none';
    document.querySelector('#resultScreen')?.classList.add('hidden');
    document.querySelector('#homeScreen')?.classList.add('hidden');
    document.querySelector('#tutorialOverlay')?.classList.add('hidden');
    updateHud();
  }, { targetWave: wave, skillIds: skills });
}

async function setBadge(page, title, subtitle, accent = '#68e8ff') {
  await page.evaluate(({ titleText, subtitleText, accentColor }) => {
    document.querySelector('#storeSceneBadge')?.remove();
    const badge = document.createElement('div');
    badge.id = 'storeSceneBadge';
    badge.innerHTML = `<b>${titleText}</b><span>${subtitleText}</span>`;
    badge.style.cssText = `
      position:fixed;left:50%;bottom:42px;z-index:120;transform:translateX(-50%);
      min-width:620px;max-width:900px;padding:16px 34px 15px;text-align:center;
      border:1px solid ${accentColor};border-radius:20px;background:rgba(2,8,24,.82);
      box-shadow:0 0 36px ${accentColor}55,inset 0 0 30px rgba(8,18,48,.85);
      color:#fff;font-family:Inter,Arial,sans-serif;pointer-events:none;backdrop-filter:blur(8px)`;
    badge.querySelector('b').style.cssText = `display:block;font-size:29px;line-height:1.1;letter-spacing:2px;color:${accentColor};text-shadow:0 0 18px ${accentColor}`;
    badge.querySelector('span').style.cssText = 'display:block;margin-top:7px;font-size:16px;font-weight:700;letter-spacing:.7px;color:#dcecff';
    document.body.appendChild(badge);
  }, { titleText: title, subtitleText: subtitle, accentColor: accent });
}

async function capture(page, filename) {
  await page.waitForTimeout(120);
  await page.screenshot({ path: path.join(outputDir, filename), type: 'png' });
}

async function main() {
  fs.mkdirSync(outputDir, { recursive: true });

  const browser = await chromium.launch({
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: true,
    args: [
      '--disable-background-timer-throttling',
      '--disable-renderer-backgrounding',
      '--force-color-profile=srgb'
    ]
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    screen: { width: 1920, height: 1080 },
    deviceScaleFactor: 1,
    colorScheme: 'dark'
  });

  const page = await context.newPage();
  await page.addInitScript(() => {
    window.SPACE_TOWER_DEV_MODE = true;
  });
  await page.goto('http://127.0.0.1:8765/index.html?lang=es&dev=1', { waitUntil: 'networkidle' });
  await page.locator('#guestStart').click();
  await page.waitForTimeout(450);

  // The current lobby flow first selects guest mode, then starts the run with
  // the localized Deploy button.
  await page.locator('#deploymentButton').click();
  await page.waitForTimeout(450);

  const skipTutorial = page.locator('#tutorialSkipButton');
  if (await skipTutorial.isVisible()) await skipTutorial.click();
  await page.locator('[data-speed="3"]').click();

  // 1. A deliberate skill selection: three clear build-defining mechanics.
  await stageBase(page, 125, [['attack_boost', 4], ['speed_boost', 4]]);
  await page.evaluate(() => {
    const wanted = ['fighter', 'emp', 'magic_damage'];
    offeredCards = wanted.map((id) => SPECIAL_CARDS.find((card) => card.id === id));
    choosingCard = true;
    cardGrid.innerHTML = '';
    const extra = getExtraText();
    cardChoiceTitle.textContent = formatLocalized(extra.cardChoiceTitle, { wave });
    cardChoiceSubtitle.textContent = extra.cardChoiceSubtitle;
    for (const card of offeredCards) {
      const displayCard = getLocalizedCard(card);
      const button = document.createElement('button');
      button.className = 'skill-card';
      button.type = 'button';
      button.dataset.card = card.id;
      button.innerHTML = `${getCardArt(card.id)}<span>${displayCard.category}</span><b>${displayCard.name}</b><p>${displayCard.description}</p>${renderCardTags(card)}`;
      cardGrid.appendChild(button);
    }
    cardChoice.classList.remove('hidden');
  });
  await capture(page, shots[0]);

  // 2. Four orbital fighters firing simultaneously across a crowded battlefield.
  await stageBase(page, 180, [
    ['fighter', 4], ['command_relay', 5], ['mini_turret', 6],
    ['speed_boost', 5], ['magic_damage', 3]
  ]);
  await page.evaluate(() => {
    const positions = [
      [250, 235], [510, 145], [780, 250], [1110, 150], [1390, 260], [1680, 170],
      [260, 520], [530, 420], [1380, 430], [1660, 540]
    ];
    const types = ['runner', 'swarm', 'tank', 'armored'];
    positions.forEach(([x, y], index) => {
      const type = ENEMY_TYPES[types[index % types.length]] || Object.values(ENEMY_TYPES)[0];
      const stats = getEnemyStats(wave, type);
      spawnEnemyFromStats(stats, x, y, (index % 3 === 0 ? 25 : 21) * stats.sizeScale);
    });
    fighters.forEach((fighter, index) => {
      const pos = getFighterPosition(fighter, index, performance.now());
      fighter.x = pos.x;
      fighter.y = pos.y;
      const target = enemies[(index * 2 + 1) % enemies.length];
      laserBeams.push({ x1: fighter.x, y1: fighter.y, x2: target.x, y2: target.y, life: 1, maxLife: 1, color: '#9df7ff', innerColor: '#ffffff', width: 7 });
      createHit(target.x, target.y, target, 3200 + index * 420, '#9df7ff', index % 2 === 0, 'physical');
    });
  });
  await setBadge(page, 'ORBITAL FIGHTER CROSS-FIRE', 'Deploy a patrol squadron and erase threats with synchronized lasers.');
  await capture(page, shots[1]);

  // 3. The actual ultimate boss firing its star beam while the core counterattacks.
  await stageBase(page, 300, [
    ['fighter', 2], ['reactive_shield', 4], ['piercing_sniper', 4],
    ['weakpoint_mark', 5], ['magic_damage', 4]
  ]);
  await page.evaluate(() => {
    const stats = getBossStats(wave, BOSS_TYPES.destroyer);
    const boss = spawnEnemyFromStats(stats, width * 0.76, height * 0.26, 18 * stats.sizeScale);
    boss.hp = Math.round(boss.maxHp * 0.74);
    boss.beamTimer = -1;
    bossWarning = { text: getExtraText().bossDestroyerWarning, life: 2.2, maxLife: 2.8, color: stats.color };
    updateBossSpecial(boss, 0.1);
    cardEffects.reactiveShieldTimer = 5;
    triggerReactiveShield();
    fighters.forEach((fighter, index) => {
      const pos = getFighterPosition(fighter, index, performance.now());
      fighter.x = pos.x;
      fighter.y = pos.y;
      laserBeams.push({ x1: fighter.x, y1: fighter.y, x2: boss.x, y2: boss.y, life: 1, maxLife: 1, color: '#9df7ff', innerColor: '#ffffff', width: 6 });
    });
    laserBeams.push({ x1: tower.x, y1: tower.y, x2: boss.x, y2: boss.y, life: 1, maxLife: 1, color: '#ffef9a', innerColor: '#ffffff', width: 7 });
    createHit(boss.x, boss.y, boss, 12800, '#ffef9a', true, 'physical');
    boss.flash = 0;
  });
  await setBadge(page, 'ULTIMATE BOSS: STAR DESTROYER', 'Survive the lock-on beam, break its armor, and defend the core.', '#ff7f9c');
  await capture(page, shots[2]);

  // 4. EMP Pulse and Frost Rounds visibly lock an entire ring of enemies in place.
  await stageBase(page, 225, [
    ['emp', 6], ['frost_rounds', 6], ['mini_turret', 5],
    ['range_boost', 5], ['speed_boost', 4]
  ]);
  await page.evaluate(() => {
    const types = Object.values(ENEMY_TYPES);
    for (let i = 0; i < 22; i += 1) {
      const angle = (Math.PI * 2 * i) / 22;
      const radius = 230 + (i % 4) * 52;
      const type = types[i % types.length];
      const stats = getEnemyStats(wave, type);
      const enemy = spawnEnemyFromStats(stats, tower.x + Math.cos(angle) * radius, tower.y + Math.sin(angle) * radius * 0.68, 20 * stats.sizeScale);
      enemy.frostSlow = 0.66;
      enemy.frostTime = 4;
    }
    cardEffects.empTimer = 0;
    updateEmp(0.1);
    const empWave = shockwaves[shockwaves.length - 1];
    if (empWave) empWave.life = 0.38;
    enemies.filter((_, index) => index % 5 === 0).forEach((enemy) => {
      scorePopups.push({ x: enemy.x, y: enemy.y - enemy.size, vy: 0, life: 1, text: 'SLOWED', color: '#8ff4ff' });
    });
  });
  await setBadge(page, 'EMP PULSE + FROST LOCKDOWN', 'Freeze the advance, control the battlefield, and strike on your terms.');
  await capture(page, shots[3]);

  // 5. Drone swarm and chain explosions create a visually distinct orange/gray assault.
  await stageBase(page, 275, [
    ['gray_drone_swarm', 5], ['chain_blast', 5], ['overload_magazine', 5],
    ['command_relay', 5], ['magic_damage', 4]
  ]);
  await page.evaluate(() => {
    const types = Object.values(ENEMY_TYPES);
    for (let i = 0; i < 24; i += 1) {
      const col = i % 8;
      const row = Math.floor(i / 8);
      const type = types[i % types.length];
      const stats = getEnemyStats(wave, type);
      spawnEnemyFromStats(stats, 310 + col * 185 + (row % 2) * 48, 180 + row * 185, 19 * stats.sizeScale);
    }
    for (let i = 0; i < 12; i += 1) {
      spawnDrone();
      const drone = drones[drones.length - 1];
      const target = enemies[(i * 2) % enemies.length];
      drone.x = tower.x + (target.x - tower.x) * (0.28 + (i % 4) * 0.13);
      drone.y = tower.y + (target.y - tower.y) * (0.28 + (i % 4) * 0.13);
      drone.vx = (target.x - drone.x) * 1.6;
      drone.vy = (target.y - drone.y) * 1.6;
    }
    const originalRandom = Math.random;
    Math.random = () => 0;
    [4, 11, 18].forEach((index) => triggerChainBlast(enemies[index]));
    Math.random = originalRandom;
    [6, 13, 20].forEach((index) => createHit(enemies[index].x, enemies[index].y, enemies[index], 8200, '#ff9f5a', true, 'magic'));
    shockwaves.filter((item) => item.color === '#ff9f5a').forEach((item) => {
      item.emp = false;
      item.r = 96;
      item.life = 0.3;
    });
  });
  await setBadge(page, 'DRONE SWARM + CHAIN BLAST', 'Launch autonomous hunters and turn one takedown into a battlefield-wide detonation.', '#ffad66');
  await capture(page, shots[4]);

  // 6. A carrier boss, escorts, weakpoint mark, and piercing sniper beam.
  await stageBase(page, 250, [
    ['fighter', 3], ['command_relay', 4], ['weakpoint_mark', 5],
    ['piercing_sniper', 4], ['frost_rounds', 3]
  ]);
  await page.evaluate(() => {
    const stats = getBossStats(wave, BOSS_TYPES.mothership);
    const boss = spawnEnemyFromStats(stats, width * 0.72, height * 0.28, 18 * stats.sizeScale);
    boss.hp = Math.round(boss.maxHp * 0.62);
    boss.weakpointTime = 6;
    boss.weakpointPulse = 1;
    spawnBossEscorts(boss, 10);
    bossWarning = { text: getExtraText().bossMothershipWarning, life: 2.15, maxLife: 2.8, color: stats.color };
    laserBeams.push({ x1: tower.x, y1: tower.y, x2: boss.x, y2: boss.y, life: 1, maxLife: 1, color: '#ffef9a', innerColor: '#ffffff', width: 9 });
    createHit(boss.x, boss.y, boss, 15600, '#ffef9a', true, 'physical');
    boss.flash = 0;
    fighters.forEach((fighter, index) => {
      const pos = getFighterPosition(fighter, index, performance.now());
      fighter.x = pos.x;
      fighter.y = pos.y;
      const target = enemies[1 + index * 2] || boss;
      laserBeams.push({ x1: fighter.x, y1: fighter.y, x2: target.x, y2: target.y, life: 1, maxLife: 1, color: '#9df7ff', innerColor: '#ffffff', width: 6 });
    });
  });
  await setBadge(page, 'MOTHERSHIP SIEGE', 'Mark the weakpoint, pierce the carrier, and cut through its escort formation.', '#d6c4ff');
  await capture(page, shots[5]);

  // 7. Finish with the actual upgrade drawer and a visibly developed tower build.
  await stageBase(page, 350, [
    ['fighter', 4], ['mini_turret', 8], ['emp', 4], ['frost_rounds', 4],
    ['magic_damage', 5], ['command_relay', 4], ['range_boost', 4]
  ]);
  await page.evaluate(() => {
    for (const [type, count] of [['attack', 55], ['speed', 48], ['hp', 42], ['regen', 36], ['magic', 50], ['critChance', 30], ['critDamage', 30]]) {
      const button = document.querySelector(`[data-upgrade="${type}"]`);
      for (let i = 0; i < count; i += 1) button?.click();
    }
    const stats = getBossStats(wave, BOSS_TYPES.mothership);
    const boss = spawnEnemyFromStats(stats, width * 0.78, height * 0.18, 18 * stats.sizeScale);
    boss.hp = Math.round(boss.maxHp * 0.82);
    fighters.forEach((fighter, index) => {
      const pos = getFighterPosition(fighter, index, performance.now());
      fighter.x = pos.x;
      fighter.y = pos.y;
    });
  });
  const drawer = page.locator('#upgradeDrawerToggle');
  if ((await drawer.getAttribute('aria-expanded')) !== 'true') await drawer.click();
  await setBadge(page, 'ENGINEER YOUR OWN TOWER', 'Invest, specialize, and combine technologies into a build that is uniquely yours.', '#d8ff45');
  await page.evaluate(() => {
    const badge = document.querySelector('#storeSceneBadge');
    if (badge) {
      badge.style.top = '118px';
      badge.style.bottom = 'auto';
    }
  });
  await capture(page, shots[6]);

  const files = shots.map((name) => ({
    name,
    bytes: fs.statSync(path.join(outputDir, name)).size
  }));
  console.log(JSON.stringify({ outputDir, files }, null, 2));
  await browser.close();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
