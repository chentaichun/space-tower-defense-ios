"""Generate compact original loopable music for Space Tower Defense.

The sequences and synthesis are authored for this project and do not sample or
reproduce the YouTube references supplied during design. Output is 22.05 kHz
mono WAV; the release workflow transcodes the files to Ogg Vorbis.
"""

from __future__ import annotations

import math
import random
import struct
import wave
from pathlib import Path


SAMPLE_RATE = 22_050
BEATS = 32


TRACKS = (
    ("spectral-vanguard", 126, 45, (0, 7, 3, 10), "pulse"),
    ("sunset-orbit", 112, 48, (0, 5, 9, 7), "warm"),
    ("foundation-pulse", 118, 43, (0, 3, 7, 10), "house"),
    ("ion-islands", 108, 50, (0, 9, 5, 7), "bright"),
    ("moving-starward", 96, 45, (0, 5, 7, 3), "acoustic"),
    ("fortaleza-nebula", 102, 52, (0, 7, 10, 5), "latin"),
    ("neon-affinity", 124, 47, (0, 9, 7, 5), "dance"),
    ("past-the-nebula", 116, 43, (0, 10, 5, 7), "pop"),
    ("slow-comet-highway", 88, 40, (0, 5, 3, 7), "rock"),
    ("horizon-signal", 92, 38, (0, 7, 8, 5), "cinematic"),
    ("pan-orbit-drive", 130, 45, (0, 3, 10, 7), "electro"),
    ("blizzard-relay", 100, 43, (0, 5, 10, 7), "country"),
    ("homeward-signal", 94, 48, (0, 9, 5, 0), "calm"),
    ("sunday-starway", 84, 50, (0, 5, 7, 9), "ambient"),
)


def midi_frequency(note: float) -> float:
    return 440.0 * (2.0 ** ((note - 69.0) / 12.0))


def osc(phase: float, shape: str) -> float:
    cycle = phase - math.floor(phase)
    if shape == "sine":
        return math.sin(phase * math.tau)
    if shape == "triangle":
        return 1.0 - 4.0 * abs(cycle - 0.5)
    if shape == "square":
        return 1.0 if cycle < 0.5 else -1.0
    return 2.0 * cycle - 1.0


def envelope(position: float, length: float, attack: float = 0.02, release: float = 0.12) -> float:
    return min(1.0, position / max(attack, 1e-6), (length - position) / max(release, 1e-6))


def render_track(slug: str, bpm: int, root: int, progression: tuple[int, ...], style: str, target: Path) -> None:
    seconds_per_beat = 60.0 / bpm
    duration = BEATS * seconds_per_beat
    frames = int(duration * SAMPLE_RATE)
    rng = random.Random(slug)
    noise = [rng.uniform(-1.0, 1.0) for _ in range(frames)]
    melody_steps = (0, 7, 12, 7, 3, 10, 7, 5) if style in {"pulse", "house", "dance", "electro"} else (0, 3, 7, 10, 7, 5, 3, 7)
    if style in {"ambient", "calm", "cinematic"}:
        melody_steps = (0, 7, 5, 12, 10, 7, 3, 5)

    samples: list[int] = []
    for index in range(frames):
        t = index / SAMPLE_RATE
        beat = t / seconds_per_beat
        beat_index = int(beat)
        beat_phase = beat - beat_index
        chord_root = root + progression[(beat_index // 8) % len(progression)]

        bass_note = chord_root - 12 + (12 if beat_index % 8 in {6, 7} else 0)
        bass_phase = t * midi_frequency(bass_note)
        bass_shape = "saw" if style in {"rock", "electro", "pulse"} else "triangle"
        bass = osc(bass_phase, bass_shape) * envelope(beat_phase * seconds_per_beat, seconds_per_beat, 0.015, 0.16) * 0.24

        chord = 0.0
        chord_shape = "triangle" if style not in {"rock", "electro"} else "saw"
        for interval in (0, 3 if style in {"cinematic", "ambient"} else 4, 7):
            chord += osc(t * midi_frequency(chord_root + interval), chord_shape)
        chord *= 0.075
        chord *= 0.72 + 0.28 * math.sin(math.tau * t / max(duration / 4.0, 1.0))

        eighth = int(beat * 2)
        eighth_phase = beat * 2 - eighth
        melody_note = chord_root + 12 + melody_steps[eighth % len(melody_steps)]
        lead_shape = "square" if style in {"bright", "electro", "pulse"} else "triangle"
        lead = osc(t * midi_frequency(melody_note), lead_shape) * envelope(eighth_phase * seconds_per_beat / 2, seconds_per_beat / 2, 0.012, 0.08) * 0.10

        kick_phase = beat_phase * seconds_per_beat
        kick = math.sin(math.tau * (72.0 - 35.0 * min(kick_phase / 0.18, 1.0)) * kick_phase) * math.exp(-kick_phase * 18.0) * 0.34
        snare_phase = ((beat + 1.0) % 2.0) * seconds_per_beat
        snare = noise[index] * math.exp(-snare_phase * 24.0) * (0.16 if beat_index % 2 == 1 else 0.0)
        hat_phase = (beat * 2.0 % 1.0) * seconds_per_beat / 2.0
        hat = noise[index] * math.exp(-hat_phase * 65.0) * (0.045 if style not in {"ambient", "calm"} else 0.018)

        pad = math.sin(math.tau * t / duration) ** 2
        mix = bass + chord * (0.75 + pad * 0.25) + lead + kick + snare + hat
        fade = min(1.0, t / 0.18, (duration - t) / 0.18)
        samples.append(int(max(-1.0, min(1.0, mix * fade)) * 29_000))

    target.parent.mkdir(parents=True, exist_ok=True)
    with wave.open(str(target), "wb") as wav:
        wav.setnchannels(1)
        wav.setsampwidth(2)
        wav.setframerate(SAMPLE_RATE)
        wav.writeframes(b"".join(struct.pack("<h", sample) for sample in samples))


def main() -> None:
    output = Path(__file__).resolve().parents[1] / "tmp" / "music-src-20260820"
    for track in TRACKS:
        render_track(*track, output / f"{track[0]}.wav")
        print(track[0])


if __name__ == "__main__":
    main()
