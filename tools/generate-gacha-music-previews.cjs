const fs = require("fs");
const path = require("path");

const SAMPLE_RATE = 44100;
const DURATION = 8;
const TAU = Math.PI * 2;
const outputDir = "C:\\Users\\User\\Desktop\\SpaceTower-Gacha-Music-Previews";

const tracks = [
  ["01-star-core-ignition.wav", "starCore", 126],
  ["02-imperial-coronation.wav", "imperial", 108],
  ["03-crystal-warp.wav", "crystal", 144],
  ["04-void-choir.wav", "voidChoir", 76],
  ["05-cosmic-jackpot.wav", "jackpot", 132],
  ["06-neon-ronin.wav", "ronin", 124],
  ["07-reactor-pulse.wav", "reactor", 138],
  ["08-aurora-drift.wav", "aurora", 84],
  ["09-mech-victory.wav", "mech", 116],
  ["10-singularity-descent.wav", "singularity", 92]
];

function midi(n) { return 440 * Math.pow(2, (n - 69) / 12); }
function clamp(v) { return Math.max(-1, Math.min(1, v)); }
function env(t, start, length, attack = 0.03, release = 0.25) {
  const x = t - start;
  if (x < 0 || x > length) return 0;
  return Math.min(1, x / attack, (length - x) / release);
}
function osc(type, phase) {
  const p = phase / TAU;
  if (type === "saw") return 2 * (p - Math.floor(p + 0.5));
  if (type === "square") return Math.sin(phase) >= 0 ? 1 : -1;
  if (type === "tri") return 2 * Math.abs(2 * (p - Math.floor(p + 0.5))) - 1;
  return Math.sin(phase);
}

function synth(kind, bpm) {
  const length = SAMPLE_RATE * DURATION;
  const left = new Float32Array(length);
  const right = new Float32Array(length);
  const beat = 60 / bpm;
  let seed = 9173 + kind.length * 7919;
  const random = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296) * 2 - 1;

  function note(start, duration, noteNumber, gain, type = "sine", pan = 0, detune = 0, shimmer = 0) {
    const from = Math.max(0, Math.floor(start * SAMPLE_RATE));
    const to = Math.min(length, Math.ceil((start + duration) * SAMPLE_RATE));
    const frequency = midi(noteNumber) * Math.pow(2, detune / 1200);
    for (let i = from; i < to; i++) {
      const t = i / SAMPLE_RATE;
      const x = t - start;
      const a = env(t, start, duration, Math.min(0.12, duration * 0.2), Math.min(0.5, duration * 0.4));
      const phase = TAU * frequency * x;
      const tone = osc(type, phase) * 0.78 + Math.sin(phase * 2.01) * shimmer;
      left[i] += tone * a * gain * (1 - pan) * 0.5;
      right[i] += tone * a * gain * (1 + pan) * 0.5;
    }
  }
  function pad(start, duration, chord, gain, type = "sine") {
    chord.forEach((n, index) => {
      note(start, duration, n, gain, type, -0.55 + index * (1.1 / Math.max(1, chord.length - 1)), index % 2 ? 5 : -5, 0.12);
      note(start, duration, n + 12, gain * 0.28, "sine", 0.5 - index * 0.2, 0, 0.08);
    });
  }
  function kick(at, gain = 0.8) {
    const from = Math.floor(at * SAMPLE_RATE), to = Math.min(length, from + Math.floor(0.34 * SAMPLE_RATE));
    for (let i = from; i < to; i++) {
      const x = (i - from) / SAMPLE_RATE;
      const phase = TAU * (45 * x + 65 * (1 - Math.exp(-18 * x)) / 18);
      const v = Math.sin(phase) * Math.exp(-13 * x) * gain;
      left[i] += v * 0.5; right[i] += v * 0.5;
    }
  }
  function noiseHit(at, duration = 0.18, gain = 0.2, pan = 0) {
    const from = Math.floor(at * SAMPLE_RATE), to = Math.min(length, from + Math.floor(duration * SAMPLE_RATE));
    let filtered = 0;
    for (let i = from; i < to; i++) {
      const x = (i - from) / SAMPLE_RATE;
      filtered = filtered * 0.55 + random() * 0.45;
      const v = filtered * Math.exp(-18 * x / duration) * gain;
      left[i] += v * (1 - pan) * 0.5; right[i] += v * (1 + pan) * 0.5;
    }
  }
  function riser(start, duration, gain = 0.22) {
    const from = Math.floor(start * SAMPLE_RATE), to = Math.min(length, Math.floor((start + duration) * SAMPLE_RATE));
    let phase = 0;
    for (let i = from; i < to; i++) {
      const x = (i - from) / SAMPLE_RATE, q = x / duration;
      phase += TAU * (90 + 800 * q * q) / SAMPLE_RATE;
      const v = (Math.sin(phase) * 0.5 + random() * 0.12) * q * q * gain;
      left[i] += v * 0.48; right[i] += v * 0.52;
    }
  }

  const progressions = {
    starCore: [[48, 55, 60, 63], [46, 53, 58, 62], [51, 58, 63, 67], [43, 50, 55, 60]],
    imperial: [[50, 57, 62, 66], [46, 53, 58, 62], [48, 55, 60, 64], [50, 57, 62, 69]],
    crystal: [[57, 60, 64, 69], [55, 59, 62, 67], [52, 57, 60, 64], [53, 57, 60, 65]],
    voidChoir: [[41, 48, 53, 56], [40, 47, 52, 55], [38, 45, 50, 53], [36, 43, 48, 52]],
    jackpot: [[60, 64, 67, 72], [57, 60, 64, 69], [62, 65, 69, 74], [55, 59, 62, 67]],
    ronin: [[50, 55, 57, 62], [48, 53, 55, 60], [45, 50, 52, 57], [47, 52, 54, 59]],
    reactor: [[43, 50, 55, 58], [41, 48, 53, 57], [39, 46, 51, 55], [38, 45, 50, 53]],
    aurora: [[53, 60, 64, 69], [50, 57, 62, 65], [48, 55, 60, 64], [55, 62, 67, 71]],
    mech: [[48, 55, 60, 64], [50, 57, 62, 65], [53, 60, 65, 69], [55, 62, 67, 71]],
    singularity: [[36, 43, 48, 51], [35, 42, 47, 50], [33, 40, 45, 48], [31, 38, 43, 47]]
  };
  const chords = progressions[kind];
  const bars = 4, barLength = DURATION / bars;
  chords.forEach((chord, bar) => pad(bar * barLength, barLength + 0.18, chord, kind === "voidChoir" || kind === "aurora" ? 0.13 : 0.09, kind === "reactor" ? "saw" : "sine"));

  if (["starCore", "crystal", "jackpot", "ronin", "reactor"].includes(kind)) {
    const pattern = kind === "ronin" ? [0, 2, 1, 3, 1, 2, 0, 3] : [0, 1, 2, 1, 3, 2, 1, 2];
    for (let step = 0; step < 32; step++) {
      const chord = chords[Math.floor(step / 8)];
      const n = chord[pattern[step % 8]] + (kind === "crystal" || kind === "jackpot" ? 24 : 12);
      note(step * DURATION / 32, DURATION / 38, n, kind === "crystal" ? 0.22 : 0.15, kind === "reactor" ? "square" : "tri", step % 2 ? 0.45 : -0.45, 0, 0.18);
    }
  }
  if (["starCore", "jackpot", "reactor", "mech"].includes(kind)) {
    for (let b = 0; b < DURATION / beat; b++) {
      kick(b * beat, b % 4 === 0 ? 0.82 : 0.58);
      if (b % 2 === 1) noiseHit(b * beat, 0.16, kind === "mech" ? 0.24 : 0.16, b % 4 === 1 ? -0.25 : 0.25);
    }
  }
  if (kind === "imperial" || kind === "mech") {
    const melody = kind === "imperial" ? [62, 66, 69, 74, 73, 69, 66, 62] : [60, 64, 67, 72, 74, 72, 67, 76];
    melody.forEach((n, i) => note(i, 0.82, n, 0.2, "saw", i % 2 ? 0.15 : -0.15, 0, 0.1));
  }
  if (kind === "voidChoir" || kind === "aurora" || kind === "singularity") {
    const melody = kind === "aurora" ? [81, 79, 76, 74, 76, 79, 81, 86] : kind === "voidChoir" ? [65, 63, 60, 58, 56, 55, 53, 51] : [60, 58, 55, 53, 51, 48, 46, 43];
    melody.forEach((n, i) => note(i, 1.25, n, 0.16, "sine", Math.sin(i) * 0.55, 0, 0.2));
  }
  if (kind === "ronin") {
    [74, 72, 69, 67, 69, 72, 74, 79].forEach((n, i) => note(i, 0.45, n, 0.2, "tri", i % 2 ? 0.25 : -0.25, 0, 0.1));
  }
  riser(5.8, 1.7, kind === "singularity" ? 0.32 : 0.2);
  kick(7.52, kind === "aurora" ? 0.35 : 0.95);
  note(7.48, 0.5, chords[3][0] + 24, 0.25, "sine", 0, 0, 0.25);

  const delay = Math.floor(0.19 * SAMPLE_RATE);
  for (let i = delay; i < length; i++) {
    left[i] += right[i - delay] * 0.13;
    right[i] += left[i - delay] * 0.13;
  }
  let peak = 0;
  for (let i = 0; i < length; i++) peak = Math.max(peak, Math.abs(left[i]), Math.abs(right[i]));
  const scale = peak ? 0.88 / peak : 1;
  for (let i = 0; i < length; i++) {
    const fade = Math.min(1, i / (0.025 * SAMPLE_RATE), (length - i) / (0.16 * SAMPLE_RATE));
    left[i] = clamp(Math.tanh(left[i] * scale * 1.08) * fade);
    right[i] = clamp(Math.tanh(right[i] * scale * 1.08) * fade);
  }
  return { left, right };
}

function writeWav(file, left, right) {
  const frames = left.length;
  const buffer = Buffer.alloc(44 + frames * 4);
  buffer.write("RIFF", 0); buffer.writeUInt32LE(36 + frames * 4, 4); buffer.write("WAVE", 8);
  buffer.write("fmt ", 12); buffer.writeUInt32LE(16, 16); buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(2, 22); buffer.writeUInt32LE(SAMPLE_RATE, 24); buffer.writeUInt32LE(SAMPLE_RATE * 4, 28);
  buffer.writeUInt16LE(4, 32); buffer.writeUInt16LE(16, 34); buffer.write("data", 36); buffer.writeUInt32LE(frames * 4, 40);
  for (let i = 0; i < frames; i++) {
    buffer.writeInt16LE(Math.round(clamp(left[i]) * 32767), 44 + i * 4);
    buffer.writeInt16LE(Math.round(clamp(right[i]) * 32767), 46 + i * 4);
  }
  fs.writeFileSync(file, buffer);
}

fs.mkdirSync(outputDir, { recursive: true });
for (const [filename, kind, bpm] of tracks) {
  const { left, right } = synth(kind, bpm);
  writeWav(path.join(outputDir, filename), left, right);
}
console.log(`Generated ${tracks.length} previews in ${outputDir}`);
