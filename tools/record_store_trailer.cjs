const { chromium } = require('playwright');
const path = require('path');

const projectDir = path.resolve(__dirname, '..');
const outputPath = path.join(projectDir, 'store-assets', 'space-tower-defense-trailer.webm');
const previewPath = path.join(projectDir, 'store-assets', 'space-tower-defense-trailer-preview.png');

async function main() {
  const browser = await chromium.launch({
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: true,
    args: ['--autoplay-policy=no-user-gesture-required', '--disable-background-timer-throttling']
  });

  const context = await browser.newContext({
    acceptDownloads: true,
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1
  });

  const page = await context.newPage();
  await page.addInitScript(() => {
    window.SPACE_TOWER_DEV_MODE = true;
  });
  await page.goto('http://127.0.0.1:8765/index.html', { waitUntil: 'networkidle' });
  await page.locator('#languageSelect').selectOption('en');
  await page.getByRole('button', { name: 'Guest', exact: true }).click();
  await page.waitForTimeout(500);

  const skipTutorial = page.locator('#tutorialSkipButton');
  if (await skipTutorial.isVisible()) await skipTutorial.click();

  const pauseButton = page.locator('#pauseButton');
  if ((await pauseButton.textContent() || '').trim().toLowerCase() === 'continue') {
    await pauseButton.click();
  }

  await page.locator('[data-speed="10"]').click();

  await page.evaluate(() => {
    const upgrades = ['attack', 'speed', 'hp', 'regen', 'magic', 'critChance', 'critDamage'];
    for (const upgrade of upgrades) {
      const button = document.querySelector(`[data-upgrade="${upgrade}"]`);
      for (let i = 0; i < 90; i += 1) button?.click();
    }
    window.__autoCardPicker = window.setInterval(() => {
      const choice = document.querySelector('#cardGrid button');
      if (choice && !document.querySelector('#cardChoice')?.classList.contains('hidden')) choice.click();
    }, 120);
  });

  await page.locator('#devWaveInput').fill('90');
  await page.locator('#devJumpWaveButton').click();
  await page.waitForTimeout(600);

  const downloadPromise = page.waitForEvent('download', { timeout: 60000 });

  await page.evaluate(async () => {
    const W = 1920;
    const H = 1080;
    const DURATION = 29;
    const gameCanvas = document.querySelector('#game');
    const output = document.createElement('canvas');
    output.width = W;
    output.height = H;
    output.id = 'trailerCapture';
    output.style.cssText = 'position:fixed;left:-20000px;top:0;width:1920px;height:1080px;';
    document.body.appendChild(output);
    window.__trailerCanvas = output;
    const g = output.getContext('2d', { alpha: false });

    const feature = new Image();
    feature.src = '/store-assets/play-feature-graphic-1024x500.png';
    await feature.decode();

    const stream = output.captureStream(30);

    const audio = new AudioContext();
    await audio.resume();
    const audioOut = audio.createMediaStreamDestination();
    const master = audio.createGain();
    master.gain.value = 0.38;
    master.connect(audioOut);

    const bass = audio.createOscillator();
    const bassGain = audio.createGain();
    bass.type = 'sawtooth';
    bass.frequency.value = 55;
    bassGain.gain.value = 0.0001;
    bass.connect(bassGain).connect(master);
    bass.start();

    const pulse = audio.createOscillator();
    const pulseGain = audio.createGain();
    pulse.type = 'square';
    pulse.frequency.value = 110;
    pulseGain.gain.value = 0.0001;
    pulse.connect(pulseGain).connect(master);
    pulse.start();

    const nowAudio = audio.currentTime;
    for (let t = 0; t < DURATION; t += 0.5) {
      const intensity = t < 4 ? 0.035 : 0.055 + Math.min(0.035, t / 700);
      bassGain.gain.setValueAtTime(0.0001, nowAudio + t);
      bassGain.gain.exponentialRampToValueAtTime(intensity, nowAudio + t + 0.025);
      bassGain.gain.exponentialRampToValueAtTime(0.0001, nowAudio + t + 0.23);
      if (Math.round(t * 2) % 2 === 0) {
        pulseGain.gain.setValueAtTime(0.0001, nowAudio + t);
        pulseGain.gain.exponentialRampToValueAtTime(0.018, nowAudio + t + 0.015);
        pulseGain.gain.exponentialRampToValueAtTime(0.0001, nowAudio + t + 0.09);
      }
    }
    stream.addTrack(audioOut.stream.getAudioTracks()[0]);

    const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')
      ? 'video/webm;codecs=vp9,opus'
      : 'video/webm';
    const recorder = new MediaRecorder(stream, {
      mimeType,
      videoBitsPerSecond: 10000000,
      audioBitsPerSecond: 160000
    });
    const chunks = [];
    recorder.ondataavailable = (event) => {
      if (event.data?.size) chunks.push(event.data);
    };

    const downloadDone = new Promise((resolve) => {
      recorder.onstop = () => {
        bass.stop();
        pulse.stop();
        audio.close();
        const blob = new Blob(chunks, { type: 'video/webm' });
        const href = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = href;
        link.download = 'space-tower-defense-trailer.webm';
        document.body.appendChild(link);
        link.click();
        link.remove();
        setTimeout(() => URL.revokeObjectURL(href), 5000);
        resolve();
      };
    });

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

    const drawCover = (image, scale = 1) => {
      const iw = image.naturalWidth;
      const ih = image.naturalHeight;
      const base = Math.max(W / iw, H / ih) * scale;
      const dw = iw * base;
      const dh = ih * base;
      g.drawImage(image, (W - dw) / 2, (H - dh) / 2, dw, dh);
    };

    const drawText = (text, x, y, size, weight = 800, align = 'center', color = '#fff') => {
      g.save();
      g.font = `${weight} ${size}px Arial, sans-serif`;
      g.textAlign = align;
      g.textBaseline = 'middle';
      g.fillStyle = color;
      g.shadowColor = 'rgba(0,0,0,.95)';
      g.shadowBlur = 18;
      g.shadowOffsetY = 4;
      g.fillText(text, x, y);
      g.restore();
    };

    const drawGameplayHud = (elapsed) => {
      const gradient = g.createLinearGradient(0, 0, 0, 190);
      gradient.addColorStop(0, 'rgba(2,7,20,.92)');
      gradient.addColorStop(1, 'rgba(2,7,20,0)');
      g.fillStyle = gradient;
      g.fillRect(0, 0, W, 220);

      g.fillStyle = 'rgba(4,12,32,.76)';
      roundedRect(58, 42, 540, 104, 28);
      g.fill();
      g.strokeStyle = '#32d8ff';
      g.lineWidth = 3;
      g.stroke();
      drawText('SPACE TOWER DEFENSE', 90, 78, 34, 900, 'left', '#ffffff');
      drawText('ACTUAL GAMEPLAY', 90, 118, 20, 700, 'left', '#64e7ff');

      const waveText = document.querySelector('#wave')?.textContent?.trim() || '-';
      const coreText = document.querySelector('#core')?.textContent?.trim() || '-';
      const killsText = document.querySelector('#hits')?.textContent?.trim() || '-';
      const stats = [
        ['WAVE', waveText],
        ['CORE', coreText],
        ['KILLS', killsText],
        ['SPEED', '10X']
      ];
      stats.forEach(([label, value], index) => {
        const x = 1180 + index * 175;
        g.fillStyle = 'rgba(4,12,32,.78)';
        roundedRect(x, 46, 150, 92, 20);
        g.fill();
        g.strokeStyle = index === 0 ? '#d8ff45' : '#6c86ff';
        g.lineWidth = 2;
        g.stroke();
        drawText(label, x + 75, 72, 16, 700, 'center', '#9fb8d9');
        drawText(value, x + 75, 108, 28, 900, 'center', '#ffffff');
      });

      const captions = [
        [4.2, 9.0, 'CHOOSE YOUR TECH PATH'],
        [9.0, 14.0, 'EVOLVE POWERFUL TOWERS'],
        [14.0, 20.0, 'ADAPT TO EVERY WAVE'],
        [20.0, 25.5, 'FORGE YOUR OWN STRATEGY']
      ];
      const caption = captions.find(([from, to]) => elapsed >= from && elapsed < to);
      if (caption) {
        const [, , text] = caption;
        const local = Math.min(elapsed - caption[0], caption[1] - elapsed);
        const alpha = Math.min(1, local * 2.2);
        g.save();
        g.globalAlpha = alpha;
        const bar = g.createLinearGradient(0, 0, W, 0);
        bar.addColorStop(0, 'rgba(0,0,0,0)');
        bar.addColorStop(0.18, 'rgba(0,4,18,.78)');
        bar.addColorStop(0.82, 'rgba(0,4,18,.78)');
        bar.addColorStop(1, 'rgba(0,0,0,0)');
        g.fillStyle = bar;
        g.fillRect(0, 865, W, 128);
        drawText(text, W / 2, 925, 56, 900, 'center', '#ffffff');
        g.restore();
      }
    };

    const started = performance.now();
    recorder.start(250);

    window.setTimeout(() => {
      document.querySelector('#devWaveInput').value = '195';
      document.querySelector('#devJumpWaveButton').click();
    }, 9000);
    window.setTimeout(() => {
      document.querySelector('#devWaveInput').value = '345';
      document.querySelector('#devJumpWaveButton').click();
    }, 15000);
    window.setTimeout(() => {
      document.querySelector('#devWaveInput').value = '495';
      document.querySelector('#devJumpWaveButton').click();
    }, 21000);

    const render = (now) => {
      const elapsed = (now - started) / 1000;
      g.save();
      g.fillStyle = '#020613';
      g.fillRect(0, 0, W, H);

      if (elapsed < 4.2 || elapsed >= 25.5) {
        const endCard = elapsed >= 25.5;
        const zoom = 1 + (endCard ? (elapsed - 25.5) : elapsed) * 0.008;
        drawCover(feature, zoom);
        const shade = g.createLinearGradient(0, 0, 0, H);
        shade.addColorStop(0, 'rgba(0,3,15,.18)');
        shade.addColorStop(0.55, 'rgba(0,3,15,.10)');
        shade.addColorStop(1, 'rgba(0,3,15,.78)');
        g.fillStyle = shade;
        g.fillRect(0, 0, W, H);
        if (!endCard) {
          drawText('BUILD. EVOLVE. SURVIVE.', W / 2, 940, 48, 900, 'center', '#ffffff');
        } else {
          g.fillStyle = 'rgba(0,3,14,.52)';
          g.fillRect(0, 0, W, H);
          drawText('DEFEND THE STARS', W / 2, 460, 80, 900, 'center', '#ffffff');
          drawText('WITH YOUR OWN STRATEGY', W / 2, 550, 48, 800, 'center', '#6ee7ff');
          drawText('SPACE TOWER DEFENSE', W / 2, 680, 34, 800, 'center', '#d8ff45');
        }
      } else {
        g.drawImage(gameCanvas, 0, 0, W, H);
        const vignette = g.createRadialGradient(W / 2, H / 2, 360, W / 2, H / 2, 1120);
        vignette.addColorStop(0, 'rgba(0,0,0,0)');
        vignette.addColorStop(1, 'rgba(0,0,0,.45)');
        g.fillStyle = vignette;
        g.fillRect(0, 0, W, H);
        drawGameplayHud(elapsed);
      }
      g.restore();

      if (elapsed < DURATION) requestAnimationFrame(render);
      else recorder.stop();
    };
    requestAnimationFrame(render);
    window.__trailerDone = downloadDone;
  });

  const download = await downloadPromise;
  await download.saveAs(outputPath);
  await page.evaluate(() => window.__trailerDone);

  const verify = await context.newPage();
  await verify.setContent(`
    <style>html,body{margin:0;background:#000}video{width:1920px;height:1080px;object-fit:contain}</style>
    <video id="v" muted src="http://127.0.0.1:8765/store-assets/space-tower-defense-trailer.webm"></video>
  `);
  await verify.locator('#v').evaluate(async (video) => {
    await new Promise((resolve, reject) => {
      video.onloadedmetadata = resolve;
      video.onerror = reject;
    });
    video.currentTime = 18;
    await new Promise((resolve) => { video.onseeked = resolve; });
  });
  await verify.screenshot({ path: previewPath });

  const metadata = await verify.locator('#v').evaluate((video) => ({
    duration: video.duration,
    width: video.videoWidth,
    height: video.videoHeight
  }));
  console.log(JSON.stringify({ outputPath, previewPath, ...metadata }, null, 2));
  await browser.close();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
