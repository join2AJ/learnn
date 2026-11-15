/** Small DSP toolkit for the Sound Lab: FFT, spectrograms, pitch, LPC formants, formant synthesis. */

export function fft(re: Float32Array, im: Float32Array) {
  const n = re.length;
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) { [re[i], re[j]] = [re[j], re[i]]; [im[i], im[j]] = [im[j], im[i]]; }
  }
  for (let len = 2; len <= n; len <<= 1) {
    const ang = (-2 * Math.PI) / len;
    const wr = Math.cos(ang), wi = Math.sin(ang);
    for (let i = 0; i < n; i += len) {
      let cr = 1, ci = 0;
      for (let k = 0; k < len / 2; k++) {
        const a = i + k, b = a + len / 2;
        const tr = re[b] * cr - im[b] * ci, ti = re[b] * ci + im[b] * cr;
        re[b] = re[a] - tr; im[b] = im[a] - ti;
        re[a] += tr; im[a] += ti;
        const nr = cr * wr - ci * wi; ci = cr * wi + ci * wr; cr = nr;
      }
    }
  }
}

const hann = (n: number) => { const w = new Float32Array(n); for (let i = 0; i < n; i++) w[i] = 0.5 - 0.5 * Math.cos((2 * Math.PI * i) / (n - 1)); return w; };

/** Returns dB magnitude frames [frame][bin] for a mono buffer. */
export function stft(x: Float32Array, size = 1024, hop = 256) {
  const w = hann(size);
  const frames: Float32Array[] = [];
  const re = new Float32Array(size), im = new Float32Array(size);
  for (let s = 0; s + size <= x.length; s += hop) {
    for (let i = 0; i < size; i++) { re[i] = x[s + i] * w[i]; im[i] = 0; }
    fft(re, im);
    const mag = new Float32Array(size / 2);
    for (let k = 0; k < size / 2; k++) mag[k] = 10 * Math.log10(re[k] * re[k] + im[k] * im[k] + 1e-12);
    frames.push(mag);
  }
  return frames;
}

/** Perceptual colour map (dark → indigo → vermilion → gold → white). */
export function heat(t: number): [number, number, number] {
  t = Math.max(0, Math.min(1, t));
  const stops: [number, number, number, number][] = [
    [0, 12, 14, 28], [0.25, 46, 52, 120], [0.5, 170, 40, 90], [0.72, 236, 92, 50], [0.9, 250, 196, 80], [1, 255, 250, 225],
  ];
  for (let i = 1; i < stops.length; i++) {
    if (t <= stops[i][0]) {
      const a = stops[i - 1], b = stops[i];
      const u = (t - a[0]) / (b[0] - a[0]);
      return [a[1] + (b[1] - a[1]) * u, a[2] + (b[2] - a[2]) * u, a[3] + (b[3] - a[3]) * u];
    }
  }
  return [255, 250, 225];
}

/** Draw a column of magnitudes (dB) into an ImageData column, linear 0..maxHz. */
export function paintColumn(img: ImageData, x: number, mag: Float32Array | Uint8Array, sampleRate: number, maxHz: number, floorDb = -100, ceilDb = -20, isByte = false) {
  const h = img.height;
  const nyq = sampleRate / 2;
  const bins = mag.length;
  for (let y = 0; y < h; y++) {
    const hz = ((h - 1 - y) / (h - 1)) * maxHz;
    const bin = Math.min(bins - 1, Math.round((hz / nyq) * bins));
    const v = isByte ? (mag[bin] as number) / 255 : ((mag[bin] as number) - floorDb) / (ceilDb - floorDb);
    const [r, g, b] = heat(v);
    const o = (y * img.width + x) * 4;
    img.data[o] = r; img.data[o + 1] = g; img.data[o + 2] = b; img.data[o + 3] = 255;
  }
}

/** Render a full spectrogram of a buffer to a canvas. */
export function renderSpectrogram(cv: HTMLCanvasElement, x: Float32Array, sampleRate: number, maxHz = 6000) {
  const ctx = cv.getContext("2d")!;
  const W = cv.width, H = cv.height;
  const size = sampleRate > 30000 ? 2048 : 1024;
  const hop = Math.max(64, Math.floor((x.length - size) / W));
  const frames = stft(x, size, hop);
  let peak = -200;
  frames.forEach((f) => f.forEach((v) => { if (v > peak) peak = v; }));
  const img = ctx.createImageData(W, H);
  for (let col = 0; col < W; col++) {
    const f = frames[Math.min(frames.length - 1, Math.floor((col / W) * frames.length))];
    if (f) paintColumn(img, col, f, sampleRate, maxHz, peak - 70, peak);
  }
  ctx.putImageData(img, 0, 0);
}

/** Autocorrelation pitch estimate (Hz) or 0 when unvoiced/quiet. */
export function pitch(buf: Float32Array, sr: number, minHz = 70, maxHz = 450) {
  let rms = 0;
  for (let i = 0; i < buf.length; i++) rms += buf[i] * buf[i];
  rms = Math.sqrt(rms / buf.length);
  if (rms < 0.01) return 0;
  const minLag = Math.floor(sr / maxHz), maxLag = Math.floor(sr / minHz);
  let best = 0, bestLag = 0;
  const n = buf.length - maxLag;
  if (n <= 0) return 0;
  let e0 = 0;
  for (let i = 0; i < n; i++) e0 += buf[i] * buf[i];
  for (let lag = minLag; lag <= maxLag; lag++) {
    let s = 0, e1 = 0;
    for (let i = 0; i < n; i++) { s += buf[i] * buf[i + lag]; e1 += buf[i + lag] * buf[i + lag]; }
    const c = s / Math.sqrt(e0 * e1 + 1e-9);
    if (c > best) { best = c; bestLag = lag; }
  }
  if (best < 0.6 || !bestLag) return 0;
  return sr / bestLag;
}

/**
 * Estimate F1/F2 with LPC: low-pass + decimate to ~11 kHz, pre-emphasis, Hamming window,
 * autocorrelation + Levinson-Durbin, then pick peaks of the LPC envelope.
 */
export function formants(buf: Float32Array, sr: number, order = 12): { f1: number; f2: number; env: Float32Array; envHz: number } | null {
  const dec = Math.max(1, Math.round(sr / 11025));
  const fs = sr / dec;
  const m = Math.floor(buf.length / dec);
  const x = new Float32Array(m);
  for (let i = 0; i < m; i++) { let s = 0; for (let j = 0; j < dec; j++) s += buf[i * dec + j]; x[i] = s / dec; }
  let rms = 0;
  for (let i = 0; i < m; i++) rms += x[i] * x[i];
  if (Math.sqrt(rms / m) < 0.01) return null;
  for (let i = m - 1; i > 0; i--) x[i] = x[i] - 0.95 * x[i - 1];
  for (let i = 0; i < m; i++) x[i] *= 0.54 - 0.46 * Math.cos((2 * Math.PI * i) / (m - 1));
  const r = new Float64Array(order + 1);
  for (let k = 0; k <= order; k++) { let s = 0; for (let i = 0; i + k < m; i++) s += x[i] * x[i + k]; r[k] = s; }
  if (r[0] === 0) return null;
  r[0] *= 1.0001;
  const a = new Float64Array(order + 1); a[0] = 1;
  let e = r[0];
  for (let i = 1; i <= order; i++) {
    let acc = r[i];
    for (let j = 1; j < i; j++) acc += a[j] * r[i - j];
    const k = -acc / e;
    const prev = a.slice();
    for (let j = 1; j < i; j++) a[j] = prev[j] + k * prev[i - j];
    a[i] = k;
    e *= 1 - k * k;
    if (e <= 0) return null;
  }
  const N = 256, envHz = Math.min(fs / 2, 4000);
  const env = new Float32Array(N);
  for (let b = 0; b < N; b++) {
    const w = (Math.PI * ((b / N) * envHz)) / (fs / 2);
    let re = 0, im = 0;
    for (let j = 0; j <= order; j++) { re += a[j] * Math.cos(w * j); im -= a[j] * Math.sin(w * j); }
    env[b] = -10 * Math.log10(re * re + im * im + 1e-12);
  }
  const peaks: number[] = [];
  for (let b = 1; b < N - 1; b++) if (env[b] > env[b - 1] && env[b] >= env[b + 1]) peaks.push((b / N) * envHz);
  const cand = peaks.filter((f) => f > 200);
  if (cand.length < 2) return null;
  return { f1: cand[0], f2: cand[1], env, envHz };
}

/** Synthesize a vowel (source-filter model) or a fricative (filtered noise). */
export async function synthesize(spec: { f?: [number, number, number]; band?: [number, number]; kind: string }, dur = 0.9, f0 = 130): Promise<AudioBuffer> {
  const sr = 22050;
  const ctx = new OfflineAudioContext(1, Math.floor(sr * dur), sr);
  const out = ctx.createGain();
  out.gain.setValueAtTime(0, 0);
  out.gain.linearRampToValueAtTime(0.9, 0.05);
  out.gain.setValueAtTime(0.9, dur - 0.12);
  out.gain.linearRampToValueAtTime(0, dur);
  out.connect(ctx.destination);
  if (spec.kind === "fricative" && spec.band) {
    const n = ctx.createBuffer(1, Math.floor(sr * dur), sr);
    const d = n.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource(); src.buffer = n;
    const bp = ctx.createBiquadFilter(); bp.type = "bandpass";
    bp.frequency.value = Math.sqrt(spec.band[0] * spec.band[1]);
    bp.Q.value = bp.frequency.value / (spec.band[1] - spec.band[0]);
    const g = ctx.createGain(); g.gain.value = 2.2;
    src.connect(bp); bp.connect(g); g.connect(out);
    src.start();
  } else if (spec.f) {
    const osc = ctx.createOscillator();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(f0 * 1.05, 0);
    osc.frequency.linearRampToValueAtTime(f0 * 0.92, dur);
    const bw = [90, 110, 170];
    const gains = [1, 0.6, 0.25];
    spec.f.forEach((F, i) => {
      const bp = ctx.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = F; bp.Q.value = F / bw[i];
      const g = ctx.createGain(); g.gain.value = gains[i] * (spec.kind === "nasal" && i > 0 ? 0.35 : 1) * 3;
      osc.connect(bp); bp.connect(g); g.connect(out);
    });
    if (spec.kind === "nasal") {
      const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 350; lp.Q.value = 4;
      const g = ctx.createGain(); g.gain.value = 1.4;
      osc.connect(lp); lp.connect(g); g.connect(out);
    }
    osc.start();
  }
  return ctx.startRendering();
}

let liveCtx: AudioContext | null = null;
export function audioCtx() {
  if (!liveCtx) { const C = window.AudioContext || window.webkitAudioContext!; liveCtx = new C(); }
  if (liveCtx.state === "suspended") liveCtx.resume();
  return liveCtx;
}
export function playBuffer(b: AudioBuffer) {
  const ctx = audioCtx();
  const src = ctx.createBufferSource();
  src.buffer = b; src.connect(ctx.destination); src.start();
  return src;
}
