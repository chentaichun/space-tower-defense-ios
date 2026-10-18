const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const projectDir = path.resolve(__dirname, '..');
const baseUrl = 'http://127.0.0.1:8877';
const outputDir = path.join(projectDir, 'store-assets', 'google-ads-battle-v2');
const outputPath = path.join(outputDir, 'battle-master.webm');
const duration = Math.max(45, Math.min(110, Number(process.env.BATTLE_DURATION || 84)));

async function main() {
  fs.mkdirSync(outputDir, { recursive: true });

  const browser = await chromium.launch({
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: true,
    args: [
      '--autoplay-policy=no-user-gesture-required',
      '--disable-background-timer-throttling',
      '--disable-renderer-backgrounding',
      '--force-color-profile=srgb'
    ]
  });

  const context = await browser.newContext({
    acceptDownloads: true,
    viewport: { width: 1920, height: 1080 },
    screen: { width: 1920, height: 1080 },
    deviceScaleFactor: 1,
    colorScheme: 'dark'
  });

  const page = await context.newPage();
  page.on('console', (message) => console.log(`[browser:${message.type()}] ${message.text()}`));
  page.on('pageerror', (error) => console.error(`[browser:pageerror] ${error.stack || error.message}`));
  await page.addInitScript(() => { window.SPACE_TOWER_DEV_MODE = true; });
  await page.goto(`${baseUrl}/index.html?lang=en`, { waitUntil: 'networkidle' });
  await page.evaluate(() => {
    document.querySelector('#languagePicker [data-language-choice="en"]')?.click();
    document.querySelector('#guestStart')?.click();
  });
  await page.waitForTimeout(600);

  await page.evaluate(() => document.querySelector('#deploymentButton')?.click());
  await page.waitForTimeout(700);

  const skipTutorial = page.locator('#tutorialSkipButton');
  if (await skipTutorial.isVisible()) await skipTutorial.click({ force: true });
  const pauseButton = page.locator('#pauseButton');
  if ((await pauseButton.textContent() || '').trim().toLowerCase() === 'continue') await pauseButton.click({ force: true });
  await page.evaluate(() => document.querySelector('[data-speed="3"]')?.click());

  await page.evaluate(() => {
    activeRunTier = 10;
    selectedTier = 10;
    const backgroundState = getBackgroundStoreState();
    backgroundState.owned = V2_BACKGROUND_DEFS.map((item) => item.id);
    backgroundState.equipped = 'obsidian_singularity';
    shopState.backgroundStore = backgroundState;

    const upgradePlan = {
      attack: 44,
      speed: 23,
      hp: 65,
      regen: 65,
      magic: 36,
      critChance: 62,
      critDamage: 42
    };
    for (const [upgrade, count] of Object.entries(upgradePlan)) {
      const button = document.querySelector(`[data-upgrade="${upgrade}"]`);
      for (let index = 0; index < count; index += 1) button?.click();
    }

    const cards = [
      ['fighter', 4], ['mini_turret', 6], ['attack_boost', 3], ['speed_boost', 3],
      ['magic_damage', 3], ['emp', 3], ['gray_drone_swarm', 3], ['frost_rounds', 3],
      ['chain_blast', 3], ['weakpoint_mark', 3], ['piercing_sniper', 3],
      ['reactive_shield', 3], ['command_relay', 3], ['range_boost', 5],
      ['overload_magazine', 3]
    ];
    for (const [cardId, count] of cards) {
      const card = SPECIAL_CARDS.find((item) => item.id === cardId);
      for (let index = 0; card && index < count; index += 1) card.apply();
    }

    applyCoreDamage = () => 0;
    if (typeof applyCoreDamageV2 === 'function') applyCoreDamageV2 = () => 0;
    towerStats.maxHp = 999999999999;
    towerStats.regen = 999999999;
    coreHp = towerStats.maxHp;

    window.__adsSpawnFormation = (enemyCount = 24, bossKey = '') => {
      const types = Object.values(ENEMY_TYPES).filter((type) => wave >= type.unlockWave);
      const availableTypes = types.length ? types : [ENEMY_TYPES.basic];
      for (let index = 0; index < enemyCount; index += 1) {
        const type = availableTypes[index % availableTypes.length];
        const baseStats = getEnemyStats(wave, type);
        const angle = (index / Math.max(1, enemyCount)) * Math.PI * 2 + (index % 5) * 0.065;
        const band = 0.72 + (index % 5) * 0.075;
        const x = clamp(tower.x + Math.cos(angle) * width * 0.40 * band, 36, width - 36);
        const y = clamp(tower.y + Math.sin(angle) * height * 0.39 * band, 36, height - 36);
        const hp = Math.max(1, Math.round(baseStats.hp * (index % 6 === 0 ? 4.2 : 2.1)));
        spawnEnemyFromStats(
          { ...baseStats, hp },
          x,
          y,
          rand(19, 26) * baseStats.sizeScale,
          { hp, maxHp: hp, speed: Math.max(6, Math.min(18, baseStats.speed * 0.34)) }
        );
      }

      if (bossKey && BOSS_TYPES[bossKey]) {
        const bossStats = getBossStats(wave, BOSS_TYPES[bossKey]);
        const hp = Math.max(1, Math.round(bossStats.hp * 6));
        spawnEnemyFromStats(
          { ...bossStats, hp },
          width * 0.76,
          height * 0.26,
          Math.max(76, 26 * bossStats.sizeScale),
          { hp, maxHp: hp, speed: Math.max(3.5, Math.min(8, bossStats.speed * 0.18)) }
        );
      }
      enemiesSpawned = getBasicEnemyStats(wave).count;
      bossSpawnedThisWave = Boolean(bossKey);
    };

    window.__adsSetBattle = (targetWave, backgroundId, enemyCount = 24, bossKey = '') => {
      activeRunTier = 10;
      const background = getBackgroundStoreState();
      background.owned = V2_BACKGROUND_DEFS.map((item) => item.id);
      background.equipped = backgroundId;
      shopState.backgroundStore = background;
      getV2BackgroundImage(V2_BACKGROUND_DEFS.find((item) => item.id === backgroundId));
      devJumpToWave(targetWave);
      coreHp = towerStats.maxHp;
      running = true;
      isPaused = false;
      choosingCard = false;
      cardChoice.classList.add('hidden');
      devPanel.style.display = 'none';
      document.querySelector('#resultScreen')?.classList.add('hidden');
      document.querySelector('#homeScreen')?.classList.add('hidden');
      window.__adsSpawnFormation(enemyCount, bossKey);
      updateHud();
    };

    window.__adsCardPicker = window.setInterval(() => {
      const choice = document.querySelector('#cardGrid button');
      if (choice && !document.querySelector('#cardChoice')?.classList.contains('hidden')) choice.click();
      if (coreHp < towerStats.maxHp * 0.82) coreHp = towerStats.maxHp;
    }, 140);

    window.__adsDensityKeeper = window.setInterval(() => {
      const alive = enemies.filter((enemy) => enemy.hp > 0).length;
      if (alive < 16) window.__adsSpawnFormation(9, '');
    }, 760);

    window.__adsSetBattle(240, 'obsidian_singularity', 26, 'destroyer');
  });

  const stages = [
    [4, 320, 'neon_orbit_metropolis', 28, 'ufo'],
    [8, 420, 'glacial_star_cathedral', 26, 'mothership'],
    [12, 540, 'prismatic_wormhole', 30, 'destroyer'],
    [16, 650, 'aurora_garden', 28, 'ufo'],
    [20, 760, 'solar_forge_throne', 30, 'mothership'],
    [24, 825, 'emerald_machine_world', 30, 'destroyer'],
    [28, 900, 'gilded_citadel', 32, 'mothership'],
    [32, 975, 'obsidian_singularity', 32, 'destroyer'],
    [36, 1080, 'glacial_star_cathedral', 30, 'ufo'],
    [40, 1180, 'prismatic_wormhole', 34, 'mothership'],
    [44, 1280, 'neon_orbit_metropolis', 34, 'destroyer'],
    [48, 1380, 'solar_forge_throne', 34, 'ufo'],
    [52, 1480, 'aurora_garden', 36, 'mothership'],
    [56, 1600, 'emerald_machine_world', 36, 'destroyer'],
    [60, 1750, 'gilded_citadel', 38, 'mothership'],
    [64, 1900, 'obsidian_singularity', 38, 'destroyer'],
    [68, 2050, 'prismatic_wormhole', 40, 'ufo'],
    [72, 2200, 'glacial_star_cathedral', 40, 'mothership'],
    [76, 2400, 'solar_forge_throne', 42, 'destroyer'],
    [80, 2600, 'neon_orbit_metropolis', 42, 'mothership']
  ];
  for (const [at, wave, background, count, boss] of stages) {
    if (at < duration) {
      setTimeout(() => page.evaluate(
        ([targetWave, backgroundId, enemyCount, bossKey]) => {
          window.__adsSetBattle(targetWave, backgroundId, enemyCount, bossKey);
        },
        [wave, background, count, boss]
      ).catch((error) => console.error(`STAGE_ERROR ${error.message}`)), at * 1000);
    }
  }

  const downloadPromise = page.waitForEvent('download', { timeout: (duration + 30) * 1000 });
  await page.evaluate(async ({ duration }) => {
    const W = 1920;
    const H = 1080;
    const FPS = 30;
    const gameCanvas = document.querySelector('#game');
    const output = document.createElement('canvas');
    output.width = W;
    output.height = H;
    output.style.cssText = 'position:fixed;left:-20000px;top:0;width:1920px;height:1080px;';
    document.body.appendChild(output);
    const g = output.getContext('2d', { alpha: false });

    const stream = output.captureStream(FPS);
    const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
      ? 'video/webm;codecs=vp9'
      : 'video/webm';
    const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 16000000 });
    const chunks = [];
    recorder.ondataavailable = (event) => { if (event.data?.size) chunks.push(event.data); };
    const downloadDone = new Promise((resolve) => {
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const href = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = href;
        link.download = 'battle-master.webm';
        document.body.appendChild(link);
        link.click();
        link.remove();
        setTimeout(() => URL.revokeObjectURL(href), 5000);
        resolve();
      };
    });

    const started = performance.now();
    recorder.start(250);
    const render = (now) => {
      const elapsed = (now - started) / 1000;
      const cameraPhase = Math.floor(elapsed / 4) % 4;
      const scales = [1.02, 1.08, 1.12, 1.05];
      const offsets = [[0, 0], [-78, 42], [92, -48], [0, -38]];
      const scale = scales[cameraPhase] + (elapsed % 4) * 0.003;
      const [offsetX, offsetY] = offsets[cameraPhase];
      g.fillStyle = '#01040d';
      g.fillRect(0, 0, W, H);
      g.save();
      g.translate(W / 2, H / 2);
      g.scale(scale, scale);
      g.drawImage(gameCanvas, -W / 2 + offsetX, -H / 2 + offsetY, W, H);
      g.restore();

      const vignette = g.createRadialGradient(W / 2, H / 2, 360, W / 2, H / 2, 1160);
      vignette.addColorStop(0, 'rgba(0,0,0,0)');
      vignette.addColorStop(1, 'rgba(0,0,0,.30)');
      g.fillStyle = vignette;
      g.fillRect(0, 0, W, H);

      if (elapsed < duration) requestAnimationFrame(render);
      else if (recorder.state === 'recording') recorder.stop();
    };
    requestAnimationFrame(render);
    setTimeout(() => {
      if (recorder.state === 'recording') recorder.stop();
    }, (duration + 3) * 1000);
    window.__adsBattleDone = downloadDone;
  }, { duration });

  const download = await downloadPromise;
  await download.saveAs(outputPath);
  await page.evaluate(() => window.__adsBattleDone);
  console.log(JSON.stringify({ outputPath, duration, width: 1920, height: 1080, audio: false }, null, 2));
  await browser.close();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
