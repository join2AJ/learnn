"""Original soundtrack for the Nihongo Path promo (100 BPM, Japanese 'yo' scale), synthesised with numpy.
Timeline matches video.html: bar = 2.4 s, 21 bars = 50.4 s."""
import numpy as np, wave, sys
SR = 44100
DUR = 52.0
N = int(SR * DUR)
L = np.zeros(N); R = np.zeros(N)
BEAT = 0.6; BAR = 2.4
rng = np.random.default_rng(7)

def mtof(m): return 440.0 * 2 ** ((m - 69) / 12)
def put(sig, t, pan=0.0, gain=1.0):
    i = int(t * SR)
    if i >= N: return
    sig = sig[: N - i] * gain
    L[i:i + len(sig)] += sig * np.sqrt(0.5 * (1 - pan))
    R[i:i + len(sig)] += sig * np.sqrt(0.5 * (1 + pan))

def fftconv(x, k):
    n = len(x) + len(k) - 1; nf = 1 << (n - 1).bit_length()
    return np.fft.irfft(np.fft.rfft(x, nf) * np.fft.rfft(k, nf), nf)[:len(x)]
def lowpass_k(fc, taps=255):
    n = np.arange(taps) - taps // 2
    h = np.sinc(2 * fc / SR * n) * np.hamming(taps); return h / h.sum()
def highpass(x, fc):
    return x - fftconv(x, lowpass_k(fc))

# ---- instruments ----
def koto(m, dur=1.6, vel=1.0):
    f = mtof(m); t = np.arange(int(SR * dur)) / SR
    bend = 1 + 0.012 * np.exp(-t * 30)  # small pitch drop on attack like a plucked silk string
    ph = 2 * np.pi * np.cumsum(f * bend) / SR
    s = np.zeros_like(t)
    for h in range(1, 9):
        amp = (1 / h) * (0.9 if h % 2 else 0.55)
        s += amp * np.sin(h * ph * (1 + 0.0007 * h * h)) * np.exp(-t * (2.2 + 1.6 * h))
    att = np.minimum(1, t / 0.003)
    return 0.44 * vel * s * att

def pad(ms, dur):
    t = np.arange(int(SR * dur)) / SR; s = np.zeros_like(t)
    for m in ms:
        for d in (-0.07, 0.0, 0.07):
            f = mtof(m + d)
            s += (np.sin(2 * np.pi * f * t) + 0.3 * np.sin(4 * np.pi * f * t) + 0.12 * np.sin(6 * np.pi * f * t))
    env = np.minimum(1, t / 0.6) * np.minimum(1, (dur - t) / 0.8)
    return 0.03 * s * np.clip(env, 0, 1)

def bass(m, dur):
    t = np.arange(int(SR * dur)) / SR; f = mtof(m)
    s = np.sin(2 * np.pi * f * t) + 0.25 * np.sin(4 * np.pi * f * t)
    s = np.tanh(1.6 * s)
    env = np.minimum(1, t / 0.01) * np.exp(-t * 2.2)
    return 0.26 * s * env

def kick():
    t = np.arange(int(SR * 0.45)) / SR
    f = 45 + 110 * np.exp(-t * 28)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 7)
    return 0.75 * np.tanh(2 * s)

def clap():
    t = np.arange(int(SR * 0.25)) / SR
    n = rng.standard_normal(len(t))
    n = highpass(n, 900) - highpass(n, 4000) * 0.5
    env = np.exp(-t * 22) + 0.6 * np.exp(-((t - 0.012) * 300) ** 2) + 0.5 * np.exp(-((t - 0.024) * 300) ** 2)
    return 0.22 * n * env

def hat(open_=False):
    t = np.arange(int(SR * (0.25 if open_ else 0.06))) / SR
    n = highpass(rng.standard_normal(len(t)), 7000)
    return 0.07 * n * np.exp(-t * (14 if open_ else 70))

def taiko():
    t = np.arange(int(SR * 1.2)) / SR
    f = 62 + 40 * np.exp(-t * 18)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 3.2)
    skin = fftconv(rng.standard_normal(len(t)), lowpass_k(1200)) * np.exp(-t * 30)
    return 0.9 * np.tanh(1.5 * body + 0.8 * skin)

def bell(m, dur=2.2, vel=1.0):
    t = np.arange(int(SR * dur)) / SR; f = mtof(m)
    mod = 2.4 * np.exp(-t * 3) * np.sin(2 * np.pi * f * 3.5 * t)
    s = np.sin(2 * np.pi * f * t + mod) * np.exp(-t * 2.4)
    return 0.16 * vel * s * np.minimum(1, t / 0.002)

def whoosh(dur=0.55, up=True):
    t = np.arange(int(SR * dur)) / SR
    n = rng.standard_normal(len(t))
    # crossfade between a dark and a bright filtered noise to mimic a sweep
    dark = fftconv(n, lowpass_k(600)); bright = highpass(n, 2500)
    x = t / dur; x = x if up else 1 - x
    env = np.sin(np.pi * np.clip(t / dur, 0, 1)) ** 2
    return 0.18 * env * ((1 - x) * dark * 2.2 + x * bright)

def shimmer(dur=2.0):
    t = np.arange(int(SR * dur)) / SR; s = np.zeros_like(t)
    for k, m in enumerate([86, 88, 91, 93, 95, 98]):
        s += np.sin(2 * np.pi * mtof(m) * t) * np.exp(-((t - k * 0.06) * 6) ** 2 * 0.3) * (t > k * 0.06)
    return 0.03 * s * np.exp(-t * 1.5)

# ---- harmony: D yo-scale (D E G A B) ----
D = 50
CHORDS = [[50, 57, 62, 66], [47, 54, 59, 62], [43, 50, 55, 59], [45, 52, 57, 61]]  # D, Bm, G, A
ROOTS = [38, 35, 31, 33]
YO = [62, 64, 67, 69, 71, 74, 76, 79, 81, 83, 86]
# melody: (beat offset in 8ths, scale index) per bar, 4 phrases cycling
PHR = [
    [(0, 5), (2, 4), (3, 3), (4, 5), (6, 7)],
    [(0, 6), (1, 5), (2, 4), (4, 3), (6, 4)],
    [(0, 2), (2, 3), (3, 4), (4, 5), (5, 4), (6, 2)],
    [(0, 3), (2, 4), (4, 6), (6, 5), (7, 4)],
]
NBARS = 21
SECT = {}  # bar -> section
for b in range(NBARS):
    SECT[b] = "intro" if b < 2 else "build" if b < 4 else "full" if b < 10 else "break" if b < 12 else "full" if b < 18 else "outro"

for b in range(NBARS):
    t0 = b * BAR; sec = SECT[b]; ch = CHORDS[b % 4]; root = ROOTS[b % 4]
    last = b == NBARS - 1
    put(pad(ch, BAR + 0.9 if not last else 4.5), t0, gain=1.0 if sec != "break" else 1.3)
    if sec in ("full", "outro", "build"):
        for k, (off, dur) in enumerate([(0, 0.9), (1.5, 0.3), (2, 0.9), (3.5, 0.5)] if sec != "build" else [(0, 1.2), (2, 1.2)]):
            put(bass(root + (12 if k == 1 else 0), dur), t0 + off * BEAT, gain=0.9 if sec == "build" else 1.0)
    if sec in ("full", "outro") and not last:
        for q in range(4):
            put(kick(), t0 + q * BEAT, gain=0.72)
        for q in (1, 3): put(clap(), t0 + q * BEAT, pan=0.05)
        for e in range(8): put(hat(open_=(e % 4 == 3)), t0 + e * BEAT / 2 + 0.005, pan=0.3 if e % 2 else -0.2, gain=1.0 if e % 2 else 0.7)
        for e in range(16):
            if e % 4 in (1, 3): put(hat(), t0 + e * BEAT / 4, pan=0.4, gain=0.35)
    if sec == "build":
        put(kick(), t0, gain=0.8); put(kick(), t0 + 2 * BEAT, gain=0.8)
        for e in range(8): put(hat(), t0 + e * BEAT / 2, pan=0.25, gain=0.6 if b == 2 else 0.85)
        if b == 3:
            for e in range(8): put(clap(), t0 + 1.2 + e * BEAT / 4, gain=0.25 + e * 0.06)  # snare roll into the drop
    # melody
    if sec in ("full", "outro", "break", "intro") and not last:
        for off, idx in PHR[b % 4]:
            vel = 0.8 if sec in ("intro", "break") else 1.0
            put(koto(YO[idx], 1.8, vel), t0 + off * BEAT / 2, pan=-0.25)
            if sec == "full" and off % 2 == 0: put(koto(YO[idx] - 12, 1.2, 0.35), t0 + off * BEAT / 2 + 0.01, pan=0.3)
    if last:
        put(koto(74, 3.5), t0); put(koto(69, 3.5, 0.7), t0 + 0.05); put(koto(66, 3.5, 0.6), t0 + 0.1); put(koto(62, 3.5, 0.6), t0 + 0.15)
        put(bell(86, 4.0, 0.9), t0 + 0.2); put(taiko(), t0, gain=0.9); put(bass(38, 3.0), t0)

# ---- sound effects synced to the picture ----
put(bell(86, 2.5), 0.05); put(shimmer(2.5), 0.05); put(taiko(), 0.0, gain=0.7)
SCENES = [4.8, 9.6, 14.4, 19.2, 24.0, 28.8, 33.6, 38.4, 43.2]
for s in SCENES:
    put(whoosh(0.6), s - 0.45, pan=-0.2, gain=0.9)
# kana pops in scene 1 (0.6 s after start, every 0.3 s), each a koto pluck up the scale
for i in range(12):
    put(koto(YO[i % len(YO)] + (12 if i > 9 else 0), 0.9, 0.55), 4.8 + 0.6 + i * 0.3 + 0.05, pan=0.35)
# photo cuts: taiko on each new photo
for i in range(4): put(taiko(), 24.0 + i * 1.2, gain=0.8 if i else 1.0)
# stats chimes
for i in range(6): put(bell(79 + [0, 2, 5, 7, 9, 12][i], 1.4, 0.8), 33.6 + 0.4 + i * 0.35, pan=-0.3 + i * 0.12)
# feature-scene chip pops (0.7 s + i*0.15)
for s in (9.6, 14.4, 19.2, 28.8, 38.4):
    for i in range(3): put(bell(91 + i * 2, 0.5, 0.35), s + 0.72 + i * 0.15, pan=0.4)
# outro: logo + button
put(shimmer(2.5), 43.25); put(bell(93, 2.0, 0.6), 44.1)

# ---- mix: simple room reverb (multi-tap feedback-free) + master ----
def reverb(x):
    out = x.copy()
    for d, g in [(0.029, 0.32), (0.041, 0.28), (0.053, 0.25), (0.067, 0.2), (0.089, 0.16), (0.113, 0.12), (0.149, 0.09), (0.191, 0.06)]:
        k = int(d * SR); out[k:] += x[:-k] * g
    return fftconv(out, lowpass_k(7000, 63))
L2 = 0.82 * L + 0.18 * reverb(R); R2 = 0.82 * R + 0.18 * reverb(L)
mix = np.stack([L2, R2], 1)
t = np.arange(N) / SR
mix *= np.clip((51.2 - t) / 1.0, 0, 1)[:, None]  # fade out with the picture
mix = np.tanh(mix * 1.15) / np.tanh(1.15)
peak = np.max(np.abs(mix)); mix = mix / peak * 0.89
pcm = (mix * 32767).astype(np.int16)
with wave.open(sys.argv[1], "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
print("rms", float(np.sqrt(np.mean(mix ** 2))), "peak", float(np.max(np.abs(mix))))
