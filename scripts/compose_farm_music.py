"""Render three original, loopable farm scores. Requires numpy and ffmpeg.

All notes and synthesis below are original; no third-party samples are used.
The timbres suggest plucked strings and soft bamboo flute, not instrument recordings.
"""
from pathlib import Path
import json
import subprocess
import tempfile
import wave
import numpy as np

ROOT = Path(__file__).resolve().parents[1]
SR = 22050
BEAT = .75
LENGTH = 128 * BEAT

SCORES = {
    'morning': ('햇살 든 텃밭', 60, [
        [0, 2, 4, 7, 9, 7, 4, 2], [4, 7, 9, 12, 9, 7, 4, None],
        [2, 4, 7, 4, 2, 0, -3, 0], [4, 2, 0, None, 2, 4, 2, 0],
    ], [0, -5, -3, 0]),
    'evening': ('처마 아래 저녁', 57, [
        [0, None, 7, 4, 2, None, 0, -3], [0, 4, 7, None, 9, 7, 4, None],
        [7, 4, 2, None, 0, -3, -5, None], [-3, 0, 2, 4, 2, 0, None, None],
    ], [0, -3, -5, 0]),
    'rain': ('빗방울과 작은 연못', 62, [
        [0, 2, None, 7, 4, None, 2, None], [4, None, 7, 9, 7, None, 4, 2],
        [2, None, 0, -3, 0, None, 2, 7], [4, 2, None, 0, -3, 0, None, None],
    ], [0, -5, -3, -5]),
}

def frequency(midi):
    return 440 * 2 ** ((midi - 69) / 12)

def render(mode):
    title, root, phrases, chords = SCORES[mode]
    count = round(LENGTH * SR)
    output = np.zeros((count, 2), dtype=np.float64)
    def note(start, midi, duration, amp, kind='pluck', pan=0):
        t = np.arange(round(duration * SR)) / SR
        f = frequency(midi)
        if kind == 'flute':
            phase = 2 * np.pi * f * t + .018 * np.sin(2 * np.pi * 4.3 * t)
            signal = np.sin(phase) + .08 * np.sin(phase * 2)
            envelope = np.minimum(t / .15, 1) * np.minimum((duration - t) / .35, 1)
            signal *= np.maximum(envelope, 0) * np.exp(-t / 6)
        elif kind == 'pad':
            signal = np.sin(2*np.pi*f*t) + .12*np.sin(2*np.pi*f*2*t)
            signal *= np.sin(np.pi*t/duration) ** 2
        else:
            signal = sum(np.sin(2*np.pi*f*h*t) * np.exp(-t*(1.5+h*.9)) / h**1.5 for h in range(1, 6))
            signal *= np.minimum(t/.008, 1)
        signal *= amp
        # Circular addition gives reverb tails across the loop boundary, without a seam.
        for delay, gain in [(0, 1), (.19, .16), (.37, .09), (.61, .04)]:
            indices = (round((start + delay) * SR) + np.arange(len(t))) % count
            output[indices, 0] += signal * gain * np.sqrt((1-pan)/2)
            output[indices, 1] += signal * gain * np.sqrt((1+pan)/2)
    for bar in range(16):
        phrase = phrases[bar % 4]
        chord = chords[(bar // 2) % 4]
        section = bar // 4
        for step, pitch in enumerate(phrase):
            if pitch is None:
                continue
            midi = root + pitch + (12 if section == 2 else 0)
            note((bar*8+step)*BEAT, midi, 2.5, .075 if mode != 'rain' else .06, pan=-.15)
            if section in (1, 3) and step % 2 == 0:
                note((bar*8+step+.15)*BEAT, root+pitch+12, BEAT*1.7, .025, 'flute', .25)
        for step, pitch in [(0, 0), (3, 7), (5, 12)]:
            note((bar*8+step)*BEAT, root-12+chord+pitch, 3.5, .036, pan=.2)
        note(bar*8*BEAT, root-24+chord, 8*BEAT, .022, 'pad')
    peak = float(np.abs(output).max())
    output *= .38 / max(peak, .001)
    return title, output

def main():
    destination = ROOT / 'audio'
    destination.mkdir(exist_ok=True)
    manifest = {'version': 1, 'origin': 'Original composition and procedural synthesis; no samples', 'tracks': []}
    for mode in SCORES:
        title, samples = render(mode)
        with tempfile.NamedTemporaryFile(suffix='.wav') as tmp:
            with wave.open(tmp.name, 'wb') as stream:
                stream.setnchannels(2)
                stream.setsampwidth(2)
                stream.setframerate(SR)
                stream.writeframes((samples * 32767).astype('<i2').tobytes())
            encoded = subprocess.check_output(['ffmpeg', '-nostdin', '-loglevel', 'error', '-i', tmp.name, '-c:a', 'libmp3lame', '-b:a', '64k', '-f', 'mp3', 'pipe:1'])
            if len(encoded) < 700000:
                raise RuntimeError('Incomplete encoded score: '+mode)
            (destination / (mode+'.mp3')).write_bytes(encoded)
        manifest['tracks'].append({'id': mode, 'title': title, 'seconds': LENGTH, 'file': mode+'.mp3', 'peak': round(float(np.abs(samples).max()), 5)})
    (destination / 'manifest.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2)+'\n')
    print(json.dumps(manifest, ensure_ascii=False))

if __name__ == '__main__':
    main()
