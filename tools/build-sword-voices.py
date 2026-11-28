"""Build wuxia sword-ring (劍鳴) clips from CC0 recordings.
The attack is the real recording; the ring is extended from the partials measured in a real ringing-metal
recording: each partial becomes a pair of slightly detuned decaying sines, so they beat like a struck blade.
Sources (CC0, kept in assets/audio/source/sword): artisticdude "RPG Sound Pack" (sword-unsheathe2, metal-ringing)
and StarNinjas "20 sword sound effects" (sword.10, sword_clash.10), both on OpenGameArt.
Usage (from the project root): python -I tools/build-sword-voices.py"""
import subprocess, sys, os, wave
import numpy as np

RATE = 32000
src_dir, out_dir = "assets/audio/source/sword", "assets/audio/sword"
os.makedirs(out_dir, exist_ok=True)
P = lambda *parts: os.path.join(src_dir, *parts)

def load(path):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-ac", "1", "-ar", str(RATE), "-f", "f32le", "-"],
                         capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.float32).astype(np.float64)

def peak_index(x):
    env = np.convolve(np.abs(x), np.ones(160) / 160, mode="same")
    return int(np.argmax(env))

def partials(x, n=6, t0=0.04, t1=0.45, fmin=900, fmax=11000):
    """Strongest spectral peaks of the recording's tail (its real resonant modes)."""
    i = peak_index(x)
    seg = x[i + int(t0 * RATE): i + int(t1 * RATE)]
    seg = np.pad(seg, (0, max(0, 8192 - len(seg))))
    spec = np.abs(np.fft.rfft(seg * np.hanning(len(seg))))
    freqs = np.fft.rfftfreq(len(seg), 1 / RATE)
    spec[(freqs < fmin) | (freqs > fmax)] = 0
    picks = []
    for _ in range(n):
        k = int(np.argmax(spec))
        if spec[k] <= 0: break
        picks.append((freqs[k], spec[k]))
        lo, hi = max(0, k - 40), k + 40           # suppress the neighbourhood (~150 Hz)
        spec[lo:hi] = 0
    top = max(a for _, a in picks)
    return [(f, a / top) for f, a in picks]

def ring(modes, dur, pitch=1.0, decay=1.0, beat=1.1, seed=1):
    rng = np.random.default_rng(seed)
    t = np.arange(int(dur * RATE)) / RATE
    out = np.zeros_like(t)
    for f, a in modes:
        f *= pitch
        tau = decay * (0.55 + 0.9 * (3000 / max(f, 1500)) ** 0.8)   # higher modes die sooner
        for d in (-beat / 2, beat / 2):
            out += a * np.sin(2 * np.pi * (f + d * (f / 4000)) * t + rng.uniform(0, 6.28)) * np.exp(-t / tau)
    out *= np.minimum(1, t / 0.004)                                  # no click at the start
    return out / (np.max(np.abs(out)) + 1e-9)

def resample(x, factor):
    """Pitch by resampling (factor < 1 = lower and longer)."""
    n = int(len(x) / factor)
    return np.interp(np.arange(n) * factor, np.arange(len(x)), x)

def compose(attack, modes, ring_gain, dur, pitch=1.0, decay=1.0, beat=1.1, attack_pitch=1.0, sub=0.0):
    a = resample(attack, attack_pitch) if attack_pitch != 1 else attack.copy()
    a /= np.max(np.abs(a)) + 1e-9
    i = peak_index(a)
    total = int(dur * RATE)
    out = np.zeros(max(total, len(a)))
    out[:len(a)] += a
    r = ring(modes, dur - i / RATE, pitch, decay, beat)
    out[i:i + len(r)] += ring_gain * r[:len(out) - i]
    if sub:  # a low body under the Sword Array release
        t = np.arange(len(out) - i) / RATE
        out[i:] += sub * np.sin(2 * np.pi * 220 * pitch * t) * np.exp(-t / 0.35) * np.minimum(1, t / 0.01)
    out = out[:total]
    fade = int(0.25 * RATE)
    out[-fade:] *= np.linspace(1, 0, fade) ** 2
    return out / (np.max(np.abs(out)) + 1e-9) * 0.89               # about -1 dBFS

def save(name, x):
    data = (np.clip(x, -1, 1) * 32767).astype("<i2").tobytes()
    with wave.open(os.path.join(out_dir, name), "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(RATE); w.writeframes(data)

unsheathe = load(P("sword-unsheathe2.wav"))
metal_ring = load(P("metal-ringing.wav"))
blade = load(P("starninjas-sword.10.ogg"))
clash = load(P("starninjas-sword_clash.10.ogg"))

warm = partials(metal_ring)       # ~3.5 kHz family: a fuller ancient-blade ring
bright = partials(blade)          # ~5.6 kHz family: a thin, high blade
print("warm modes", [(round(f), round(a, 2)) for f, a in warm])
print("bright modes", [(round(f), round(a, 2)) for f, a in bright])

# Sounds follow actions (owner's direction): drawing a sword, the blade humming at full qi, a strike, the Sword Array.
# The warm ring is the one the owner picked ("B warm": decay 1.35, beat 0.9).
draw_attack = unsheathe[: peak_index(unsheathe) + int(0.22 * RATE)]
# Each sword leaving the case: the real unsheathe "shing" with a short ring, three pitches.
for k, p in enumerate((1.0, 1.08, 1.16)):
    save(f"draw_{k + 1}.wav", compose(draw_attack, warm, 0.25, 0.45, pitch=p, decay=0.3, beat=0.9, attack_pitch=p))
# The blade humming once the qi is full (ring only, soft swell, no strike).
hum = ring(warm, 1.4, pitch=0.92, decay=1.35, beat=0.9)
t = np.arange(len(hum)) / RATE
hum *= np.minimum(1, t / 0.25) ** 2
hum[-int(0.3 * RATE):] *= np.linspace(1, 0, int(0.3 * RATE)) ** 2
save("hum.wav", hum / (np.max(np.abs(hum)) + 1e-9) * 0.6)
# A strike: metal clash followed by the warm sword ring.
clash_attack = clash[: peak_index(clash) + int(0.18 * RATE)]
save("strike.wav", compose(clash_attack, warm, 0.6, 1.5, decay=1.35, beat=0.9))
# Later strikes in the same volley: clash with a short ring.
save("strike_short.wav", compose(clash_attack, warm, 0.3, 0.45, pitch=1.06, decay=0.25))
# Sword Array loosing together: lower, longer, with body.
save("array.wav", compose(unsheathe, warm, 0.7, 2.2, pitch=0.75, decay=1.8, beat=0.7, attack_pitch=0.85, sub=0.25))
print("done")
