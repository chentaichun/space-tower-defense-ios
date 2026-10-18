const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const projectDir = path.resolve(__dirname, '..');
const baseUrl = 'http://127.0.0.1:8877';
const outputDir = path.join(projectDir, 'promo-video', 'work');
const outputPath = path.join(outputDir, 'space-tower-defense-release-promo-master.webm');
const promoDuration = Math.max(8, Math.min(120, Number(process.env.PROMO_DURATION || 120)));

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
  await page.goto(`${baseUrl}/index.html`, { waitUntil: 'networkidle' });
  await page.locator('#languagePicker [data-language-choice="en"]').click();
  await page.locator('#guestStart').click();
  await page.waitForTimeout(600);

  const skipTutorial = page.locator('#tutorialSkipButton');
  if (await skipTutorial.isVisible()) await skipTutorial.click();
  const pauseButton = page.locator('#pauseButton');
  if ((await pauseButton.textContent() || '').trim().toLowerCase() === 'continue') await pauseButton.click();
  await page.locator('[data-speed="3"]').click();

  await page.evaluate(() => {
    activeRunTier = 10;
    selectedTier = 10;
    const backgroundState = getBackgroundStoreState();
    backgroundState.owned = V2_BACKGROUND_DEFS.map((item) => item.id);
    backgroundState.equipped = 'obsidian_singularity';
    shopState.backgroundStore = backgroundState;

    const upgradePlan = {
      attack: 48,
      speed: 24,
      hp: 70,
      regen: 70,
      magic: 38,
      critChance: 70,
      critDamage: 45
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

    window.__promoSpawnFormation = (enemyCount = 20, bossKey = '') => {
      const types = Object.values(ENEMY_TYPES).filter((type) => wave >= type.unlockWave);
      const availableTypes = types.length ? types : [ENEMY_TYPES.basic];
      for (let index = 0; index < enemyCount; index += 1) {
        const type = availableTypes[index % availableTypes.length];
        const baseStats = getEnemyStats(wave, type);
        const angle = (index / Math.max(1, enemyCount)) * Math.PI * 2 + (index % 4) * 0.08;
        const band = 0.72 + (index % 4) * 0.1;
        const x = clamp(tower.x + Math.cos(angle) * width * 0.38 * band, 34, width - 34);
        const y = clamp(tower.y + Math.sin(angle) * height * 0.37 * band, 34, height - 34);
        const hp = Math.max(1, Math.round(baseStats.hp * (index % 5 === 0 ? 3.2 : 1.55)));
        spawnEnemyFromStats(
          { ...baseStats, hp },
          x,
          y,
          rand(18, 24) * baseStats.sizeScale,
          { hp, maxHp: hp, speed: Math.max(7, Math.min(19, baseStats.speed * 0.38)) }
        );
      }

      if (bossKey && BOSS_TYPES[bossKey]) {
        const bossStats = getBossStats(wave, BOSS_TYPES[bossKey]);
        const hp = Math.max(1, Math.round(bossStats.hp * 4.5));
        spawnEnemyFromStats(
          { ...bossStats, hp },
          width * 0.77,
          height * 0.28,
          Math.max(70, 24 * bossStats.sizeScale),
          { hp, maxHp: hp, speed: Math.max(4, Math.min(9, bossStats.speed * 0.2)) }
        );
      }
      enemiesSpawned = getBasicEnemyStats(wave).count;
      bossSpawnedThisWave = Boolean(bossKey);
    };

    window.__promoSetCinematicBattle = (targetWave, backgroundId, enemyCount = 20, bossKey = '') => {
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
      window.__promoSpawnFormation(enemyCount, bossKey);
      updateHud();
    };

    window.__promoCardPicker = window.setInterval(() => {
      const choice = document.querySelector('#cardGrid button');
      if (choice && !document.querySelector('#cardChoice')?.classList.contains('hidden')) choice.click();
      if (coreHp < towerStats.maxHp * 0.8) coreHp = towerStats.maxHp;
    }, 160);

    window.__promoDensityKeeper = window.setInterval(() => {
      const alive = enemies.filter((enemy) => enemy.hp > 0).length;
      if (alive < 14) window.__promoSpawnFormation(6, '');
    }, 1050);

    window.__promoSetCinematicBattle(300, 'obsidian_singularity', 18, 'destroyer');
  });

  const downloadPromise = page.waitForEvent('download', { timeout: 180000 });

  await page.evaluate(async ({ promoDuration }) => {
    const W = 1920;
    const H = 1080;
    const FPS = 30;
    const DURATION = promoDuration;
    const gameCanvas = document.querySelector('#game');
    const output = document.createElement('canvas');
    output.width = W;
    output.height = H;
    output.style.cssText = 'position:fixed;left:-20000px;top:0;width:1920px;height:1080px;';
    document.body.appendChild(output);
    const g = output.getContext('2d', { alpha: false });

    const assetPaths = {
      cover: '/promo-video/cover/Trailer-Cover-v4-Art.png',
      sourceFeature: '/store-assets/source-feature-art.png',
      choice: '/store-assets/screenshots-v2/01-choose-your-tech-path.png',
      fighter: '/store-assets/screenshots-v2/02-orbital-fighter-crossfire.png',
      boss: '/store-assets/screenshots-v2/03-ultimate-boss-star-destroyer.png',
      emp: '/store-assets/screenshots-v2/04-emp-pulse-frost-lockdown.png',
      drone: '/store-assets/screenshots-v2/05-drone-swarm-chain-blast.png',
      quantum: '/promo-video/concepts/future-concept-quantum-convergence.png'
    };
    const images = {};
    await Promise.all(Object.entries(assetPaths).map(async ([key, src]) => {
      const image = new Image();
      image.src = src;
      await image.decode();
      images[key] = image;
    }));

    const stream = output.captureStream(FPS);
    const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
      ? 'video/webm;codecs=vp9'
      : 'video/webm';
    const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 15000000 });
    const chunks = [];
    recorder.ondataavailable = (event) => { if (event.data?.size) chunks.push(event.data); };
    const downloadDone = new Promise((resolve) => {
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const href = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = href;
        link.download = 'space-tower-defense-release-promo-master.webm';
        document.body.appendChild(link);
        link.click();
        link.remove();
        setTimeout(() => URL.revokeObjectURL(href), 5000);
        resolve();
      };
    });

    const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
    const ease = (value) => {
      const x = clamp(value, 0, 1);
      return x * x * (3 - 2 * x);
    };
    const roundedRect = (x, y, w, h, radius) => {
      const r = Math.min(radius, w / 2, h / 2);
      g.beginPath();
      g.moveTo(x + r, y);
      g.arcTo(x + w, y, x + w, y + h, r);
      g.arcTo(x + w, y + h, x, y + h, r);
      g.arcTo(x, y + h, x, y, r);
      g.arcTo(x, y, x + w, y, r);
      g.closePath();
    };
    const drawText = (text, x, y, size, weight = 800, align = 'center', color = '#fff', alpha = 1) => {
      g.save();
      g.globalAlpha = alpha;
      g.font = `${weight} ${size}px Arial, sans-serif`;
      g.textAlign = align;
      g.textBaseline = 'middle';
      g.fillStyle = color;
      g.shadowColor = 'rgba(0,0,0,.9)';
      g.shadowBlur = 14;
      g.shadowOffsetY = 3;
      g.fillText(text, x, y);
      g.restore();
    };
    const drawCover = (image, scale = 1, offsetX = 0, offsetY = 0) => {
      const base = Math.max(W / image.naturalWidth, H / image.naturalHeight) * scale;
      const dw = image.naturalWidth * base;
      const dh = image.naturalHeight * base;
      g.drawImage(image, (W - dw) / 2 + offsetX, (H - dh) / 2 + offsetY, dw, dh);
    };
    const drawVignette = (strength = 0.48) => {
      const vignette = g.createRadialGradient(W / 2, H / 2, 320, W / 2, H / 2, 1160);
      vignette.addColorStop(0, 'rgba(0,0,0,0)');
      vignette.addColorStop(1, `rgba(0,0,0,${strength})`);
      g.fillStyle = vignette;
      g.fillRect(0, 0, W, H);
    };
    const drawBars = () => {
      g.fillStyle = 'rgba(0,2,9,.92)';
      g.fillRect(0, 0, W, 54);
      g.fillRect(0, H - 54, W, 54);
    };
    const drawStars = (elapsed, count = 34, alpha = 0.42) => {
      g.save();
      for (let index = 0; index < count; index += 1) {
        const seed = index * 97.31;
        const x = (seed * 17 + elapsed * (4 + index % 3)) % (W + 40) - 20;
        const y = (seed * 31) % H;
        const pulse = 0.45 + Math.sin(elapsed * 1.2 + index) * 0.3;
        g.globalAlpha = alpha * pulse;
        g.fillStyle = index % 5 === 0 ? '#86eaff' : '#ffffff';
        g.beginPath();
        g.arc(x, y, index % 7 === 0 ? 1.8 : 1, 0, Math.PI * 2);
        g.fill();
      }
      g.restore();
    };
    const drawSceneLabel = (title, local, duration) => {
      const alpha = Math.min(ease(local / 0.35), ease((duration - local) / 0.32));
      g.save();
      g.globalAlpha = alpha;
      g.fillStyle = '#74eaff';
      g.fillRect(W / 2 - 58, 934, 116, 3);
      g.restore();
      drawText(title, W / 2, 978, 40, 800, 'center', '#ffffff', alpha);
    };
    const drawEngineLabel = () => {
      drawText('CURRENT GAME ENGINE  /  HIGH-WAVE SIMULATION', 70, 88, 16, 700, 'left', '#80eaff', 0.82);
    };
    const drawTransitionFlash = (local, color = '#72eaff') => {
      const alpha = clamp(1 - local / 0.12, 0, 1) * 0.16;
      if (alpha <= 0) return;
      g.save();
      g.globalAlpha = alpha;
      g.fillStyle = color;
      g.fillRect(0, 0, W, H);
      g.restore();
    };

    const drawHook = (elapsed) => {
      const reveal = ease(elapsed / 3.4);
      const scale = 1.34 - reveal * 0.34;
      const offsetX = -245 + reveal * 245;
      const offsetY = 26 - reveal * 26;
      drawCover(images.cover, scale, offsetX, offsetY);
      g.fillStyle = `rgba(0,4,18,${0.22 - reveal * 0.08})`;
      g.fillRect(0, 0, W, H);
      drawVignette(0.5);
      drawStars(elapsed, 30, 0.34);

      if (elapsed > 1.1) {
        const beamProgress = ease((elapsed - 1.1) / 0.75);
        const x1 = 420;
        const y1 = 585;
        const x2 = 1275;
        const y2 = 352;
        const endX = x1 + (x2 - x1) * beamProgress;
        const endY = y1 + (y2 - y1) * beamProgress;
        g.save();
        g.lineCap = 'round';
        g.strokeStyle = 'rgba(91,226,255,.28)';
        g.lineWidth = 28;
        g.beginPath();
        g.moveTo(x1, y1);
        g.lineTo(endX, endY);
        g.stroke();
        g.strokeStyle = 'rgba(220,251,255,.9)';
        g.lineWidth = 5;
        g.stroke();
        g.restore();
      }

      const titleAlpha = ease((elapsed - 2.05) / 0.45);
      if (titleAlpha > 0) {
        g.fillStyle = `rgba(0,6,22,${0.46 * titleAlpha})`;
        roundedRect(304, 112, 1312, 188, 22);
        g.fill();
        drawText('SPACE TOWER DEFENSE', W / 2, 186, 86, 900, 'center', '#ffffff', titleAlpha);
        drawText('THE LAST CORE STILL STANDS', W / 2, 258, 26, 800, 'center', '#75e9ff', titleAlpha);
      }
      const fadeIn = clamp(elapsed / 0.28, 0, 1);
      if (fadeIn < 1) {
        g.fillStyle = `rgba(0,2,10,${1 - fadeIn})`;
        g.fillRect(0, 0, W, H);
      }
      drawBars();
    };

    const cameraModes = [
      { scale: 1.02, x: 0, y: 0 },
      { scale: 1.11, x: -125, y: 72 },
      { scale: 1.15, x: 150, y: -82 },
      { scale: 1.07, x: 0, y: -76 },
      { scale: 1.12, x: -90, y: -34 }
    ];
    const drawGameplay = (elapsed, from, to, title) => {
      const local = elapsed - from;
      const duration = to - from;
      const mode = cameraModes[Math.floor(from) % cameraModes.length];
      const push = ease(local / duration) * 0.045;
      g.save();
      g.translate(W / 2, H / 2);
      g.scale(mode.scale + push, mode.scale + push);
      g.drawImage(gameCanvas, -W / 2 + mode.x, -H / 2 + mode.y, W, H);
      g.restore();
      g.fillStyle = 'rgba(1,10,28,.07)';
      g.fillRect(0, 0, W, H);
      drawVignette(0.34);
      drawStars(elapsed, 18, 0.18);
      drawEngineLabel();
      drawSceneLabel(title, local, duration);
      drawTransitionFlash(local);
      drawBars();
    };

    const drawFeature = (image, local, duration, label = 'IN-GAME CAPTURE', caption = '') => {
      const p = ease(local / duration);
      drawCover(image, 1.0 + p * 0.055, (0.5 - p) * 26, (p - 0.5) * 12);
      g.fillStyle = 'rgba(0,8,24,.08)';
      g.fillRect(0, 0, W, H);
      drawVignette(0.36);
      drawText(label, 70, 88, 16, 700, 'left', '#d8ff72', 0.86);
      if (caption) drawSceneLabel(caption, local, duration);
      drawTransitionFlash(local, '#d8ff72');
      drawBars();
    };

    const drawConcept = (local, duration) => {
      const p = ease(local / duration);
      drawCover(images.quantum, 1.02 + p * 0.055, (0.5 - p) * 20, 0);
      g.fillStyle = 'rgba(0,7,24,.12)';
      g.fillRect(0, 0, W, H);
      drawVignette(0.42);
      drawText('FUTURE CONCEPT  /  NOT IN CURRENT BUILD', 70, 88, 16, 700, 'left', '#7cecff', 0.9);
      drawSceneLabel('QUANTUM CONVERGENCE', local, duration);
      drawTransitionFlash(local);
      drawBars();
    };

    const drawEndCard = (elapsed) => {
      const local = elapsed - 116;
      drawCover(images.cover, 1.02 + local * 0.009, -10 + local * 3, 0);
      g.fillStyle = 'rgba(0,5,20,.52)';
      g.fillRect(0, 0, W, H);
      drawVignette(0.5);
      drawStars(local, 30, 0.36);
      drawText('SPACE TOWER DEFENSE', W / 2, 398, 82, 900, 'center', '#ffffff');
      drawText('BUILD  -  EVOLVE  -  SURVIVE', W / 2, 480, 26, 800, 'center', '#75e9ff');
      g.fillStyle = 'rgba(0,8,27,.74)';
      roundedRect(650, 590, 620, 84, 20);
      g.fill();
      g.strokeStyle = '#d8ff72';
      g.lineWidth = 2;
      g.stroke();
      drawText('FULL RELEASE  -  COMING SOON', W / 2, 632, 28, 900, 'center', '#e6ff91');
      drawText('COMING TO GOOGLE PLAY', W / 2, 732, 20, 700, 'center', '#ffffff', 0.88);
      drawBars();
    };

    const stages = [
      [4.8, 300, 'obsidian_singularity', 18, 'destroyer'],
      [9, 180, 'neon_orbit_metropolis', 20, 'ufo'],
      [13, 225, 'glacial_star_cathedral', 20, 'mothership'],
      [17, 350, 'prismatic_wormhole', 22, 'destroyer'],
      [33, 275, 'aurora_garden', 18, 'ufo'],
      [37, 400, 'solar_forge_throne', 22, 'mothership'],
      [41, 550, 'emerald_machine_world', 22, 'destroyer'],
      [45, 650, 'prismatic_wormhole', 24, 'mothership'],
      [49, 825, 'obsidian_singularity', 22, 'destroyer'],
      [57, 300, 'glacial_star_cathedral', 18, 'mothership'],
      [61, 495, 'neon_orbit_metropolis', 22, 'destroyer'],
      [65, 650, 'gilded_citadel', 22, 'mothership'],
      [69, 825, 'prismatic_wormhole', 24, 'destroyer'],
      [80, 225, 'aurora_garden', 18, 'ufo'],
      [84, 400, 'obsidian_singularity', 22, 'destroyer'],
      [88, 550, 'glacial_star_cathedral', 22, 'mothership'],
      [92, 825, 'prismatic_wormhole', 24, 'destroyer'],
      [101, 300, 'neon_orbit_metropolis', 20, 'mothership'],
      [105, 650, 'obsidian_singularity', 24, 'destroyer'],
      [109, 900, 'prismatic_wormhole', 26, 'destroyer'],
      [113, 1200, 'solar_forge_throne', 28, 'destroyer']
    ];
    for (const [at, wave, background, count, boss] of stages) {
      setTimeout(() => window.__promoSetCinematicBattle(wave, background, count, boss), at * 1000);
    }

    const gameplayScenes = [
      [5, 9, 'ULTIMATE BOSS LOCK-ON'],
      [9, 13, 'ORBITAL FIGHTERS DEPLOYED'],
      [13, 17, 'FREEZE THE ADVANCE'],
      [17, 21, 'BREAK THE SIEGE'],
      [33, 37, 'AURORA FRONT'],
      [37, 41, 'SOLAR FORGE'],
      [41, 45, 'EMERALD MACHINE WORLD'],
      [45, 49, 'PRISMATIC WORMHOLE'],
      [49, 52, 'WAVE 825'],
      [57, 61, 'MOTHERSHIP APPROACH'],
      [61, 65, 'NO SAFE ORBIT'],
      [65, 69, 'CITADEL UNDER FIRE'],
      [69, 75, 'PUSH BEYOND WAVE 800'],
      [80, 84, 'CONTROL THE FIELD'],
      [84, 88, 'DESTROYER LOCK-ON'],
      [88, 92, 'HOLD THE GLACIAL LINE'],
      [92, 96, 'ONE CORE. ONE CHANCE.'],
      [101, 105, 'THE FINAL ASSAULT'],
      [105, 109, 'VOID FRONT'],
      [109, 113, 'WAVE 900'],
      [113, 116, 'HOW FAR CAN YOU GO?']
    ];
    const features = [
      { image: 'boss', caption: '' },
      { image: 'fighter', caption: '' },
      { image: 'emp', caption: '' },
      { image: 'drone', caption: '' }
    ];

    const started = performance.now();
    recorder.start(250);
    let renderFailed = false;
    const render = (now) => {
      try {
        const elapsed = (now - started) / 1000;
        g.fillStyle = '#01040d';
        g.fillRect(0, 0, W, H);

        if (elapsed < 5) {
          drawHook(elapsed);
        } else if (elapsed < 21) {
          const scene = gameplayScenes.find(([from, to]) => elapsed >= from && elapsed < to);
          drawGameplay(elapsed, scene[0], scene[1], scene[2]);
        } else if (elapsed < 33) {
          const index = Math.min(3, Math.floor((elapsed - 21) / 3));
          drawFeature(images[features[index].image], (elapsed - 21) % 3, 3, 'IN-GAME CAPTURE', features[index].caption);
        } else if (elapsed < 52) {
          const scene = gameplayScenes.find(([from, to]) => elapsed >= from && elapsed < to);
          drawGameplay(elapsed, scene[0], scene[1], scene[2]);
        } else if (elapsed < 57) {
          drawFeature(images.sourceFeature, elapsed - 52, 5, 'OFFICIAL KEY ART', 'BUILD YOUR LAST STAND');
        } else if (elapsed < 75) {
          const scene = gameplayScenes.find(([from, to]) => elapsed >= from && elapsed < to);
          drawGameplay(elapsed, scene[0], scene[1], scene[2]);
        } else if (elapsed < 80) {
          drawFeature(images.choice, elapsed - 75, 5, 'IN-GAME CAPTURE');
        } else if (elapsed < 96) {
          const scene = gameplayScenes.find(([from, to]) => elapsed >= from && elapsed < to);
          drawGameplay(elapsed, scene[0], scene[1], scene[2]);
        } else if (elapsed < 101) {
          drawConcept(elapsed - 96, 5);
        } else if (elapsed < 116) {
          const scene = gameplayScenes.find(([from, to]) => elapsed >= from && elapsed < to);
          drawGameplay(elapsed, scene[0], scene[1], scene[2]);
        } else {
          drawEndCard(elapsed);
        }

        if (elapsed < DURATION) requestAnimationFrame(render);
        else if (recorder.state === 'recording') recorder.stop();
      } catch (error) {
        renderFailed = true;
        console.error(`PROMO_RENDER_ERROR: ${error?.stack || error}`);
        if (recorder.state === 'recording') recorder.stop();
      }
    };
    requestAnimationFrame(render);
    setTimeout(() => {
      if (recorder.state === 'recording') {
        console.log(`PROMO_WATCHDOG_STOP renderFailed=${renderFailed}`);
        recorder.stop();
      }
    }, (DURATION + 3) * 1000);
    window.__promoDone = downloadDone;
  }, { promoDuration });

  const download = await downloadPromise;
  await download.saveAs(outputPath);
  await page.evaluate(() => window.__promoDone);
  console.log(JSON.stringify({ outputPath, duration: promoDuration, width: 1920, height: 1080, audio: false }, null, 2));
  await browser.close();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
