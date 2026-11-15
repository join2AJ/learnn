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

/* ===================== word-level voice analysis ===================== */

/** Cut leading/trailing silence (20 ms frames, relative threshold). */
export function trimSilence(x: Float32Array, sr: number) {
  const f = Math.floor(sr * 0.02), n = Math.floor(x.length / f);
  const e = Array.from({ length: n }, (_, i) => { let s = 0; for (let j = 0; j < f; j++) s += x[i * f + j] ** 2; return Math.sqrt(s / f); });
  const peak = Math.max(...e, 1e-6);
  const thr = Math.max(0.006, peak * 0.08);
  const a = e.findIndex((v) => v > thr);
  if (a < 0) return null;
  let b = n - 1; while (b > a && e[b] <= thr) b--;
  return x.subarray(Math.max(0, (a - 2) * f), Math.min(x.length, (b + 3) * f));
}

/** Share of spectral energy in Low (80–500 Hz), Mid (500–2000), High (2000–6000) and loudness in dBFS. */
export function bandProfile(x: Float32Array, sr: number): { bands: [number, number, number]; db: number } {
  const size = 2048, hop = 1024, bins = size / 2, hz = sr / size;
  const acc = [0, 0, 0];
  let rms = 0;
  for (let i = 0; i < x.length; i++) rms += x[i] * x[i];
  rms = Math.sqrt(rms / Math.max(1, x.length));
  const frames = stft(x, size, hop);
  frames.forEach((fr) => {
    for (let k = 1; k < bins; k++) {
      const f = k * hz, p = Math.pow(10, fr[k] / 10);
      if (f >= 80 && f < 500) acc[0] += p; else if (f < 2000 && f >= 500) acc[1] += p; else if (f < 6000 && f >= 2000) acc[2] += p;
    }
  });
  // perceptual weighting: compare in log domain so fricatives aren't drowned by the low voice energy
  const lg = acc.map((v) => Math.max(0, 10 * Math.log10(v + 1e-12) + 80));
  const t = lg.reduce((a, b) => a + b, 0) || 1;
  return { bands: [lg[0] / t, lg[1] / t, lg[2] / t], db: 20 * Math.log10(rms + 1e-9) };
}

/** Pitch track (10 ms hop), median filtered; returns [min,max] Hz of voiced frames plus contour. */
export function pitchTrack(x: Float32Array, sr: number) {
  const hop = Math.floor(sr / 100), size = Math.floor(sr * 0.04);
  const ps: number[] = [];
  for (let i = 0; i + size < x.length; i += hop) ps.push(pitch(x.subarray(i, i + size), sr));
  const med = ps.map((_, i) => { const w = ps.slice(Math.max(0, i - 3), i + 4).filter((v) => v > 0).sort((a, b) => a - b); return ps[i] > 0 && w.length ? w[w.length >> 1] : 0; });
  const v = med.filter((p) => p > 0).sort((a, b) => a - b);
  const range: [number, number] = v.length ? [v[Math.floor(v.length * 0.1)], v[Math.floor(v.length * 0.9)]] : [0, 0];
  return { contour: med, range };
}

const V: Record<string, [number, number, number]> = { a: [760, 1300, 2500], i: [300, 2250, 3000], u: [350, 1380, 2400], e: [480, 1950, 2600], o: [500, 850, 2500] };
const NASAL: [number, number, number] = [280, 1500, 2500];
type Seg = { dur: number; voice: number; f: [number, number, number]; noise: number; band?: [number, number] };

/** Turn romaji into timed segments (one mora ≈ 130 ms). */
export function romajiSegments(ro: string): Seg[] {
  const s = ro.toLowerCase().replace(/ā/g, "aa").replace(/ī/g, "ii").replace(/ū/g, "uu").replace(/ē/g, "ee").replace(/ō/g, "ou").replace(/[^a-z' ]/g, " ");
  const re = /(ky|gy|sh|ch|ts|ny|hy|my|ry|by|py|[kgsztdnhbpmyrwfj])?([aeiou])|(n)(?![aeiouy])|([kstpcgdbhfmrjz])(?=\4)|( +)/g;
  const out: Seg[] = [];
  const M = 0.13;
  let m: RegExpExecArray | null;
  while ((m = re.exec(s))) {
    if (m[5]) { out.push({ dur: 0.06, voice: 0, f: V.a, noise: 0 }); continue; }
    if (m[4]) { out.push({ dur: M, voice: 0, f: V.a, noise: 0 }); continue; } // small っ: one silent beat
    if (m[3]) { out.push({ dur: M, voice: 0.55, f: NASAL, noise: 0 }); continue; } // ん
    const c = m[1] || "", v = V[m[2]];
    const glide = c.length === 2 && c[1] === "y" ? V.i : c === "w" ? V.u : c === "y" ? V.i : null;
    let cd = 0.04;
    if (/^(s|z)$/.test(c)) out.push({ dur: cd = 0.06, voice: c === "z" ? 0.25 : 0, f: v, noise: 0.9, band: [4500, 8000] });
    else if (/^(sh|j|ch)$/.test(c)) { if (c === "ch") out.push({ dur: 0.03, voice: 0, f: v, noise: 0 }); out.push({ dur: cd = 0.06, voice: c === "j" ? 0.25 : 0, f: v, noise: 0.9, band: [2200, 5000] }); }
    else if (c === "ts") { out.push({ dur: 0.03, voice: 0, f: v, noise: 0 }); out.push({ dur: cd = 0.05, voice: 0, f: v, noise: 0.9, band: [4000, 8000] }); }
    else if (/^(h|f|hy)$/.test(c)) out.push({ dur: cd = 0.05, voice: 0, f: v, noise: 0.6, band: [600, 3500] });
    else if (/^(k|g|t|d|p|b|ky|gy|by|py)$/.test(c)) { out.push({ dur: 0.045, voice: /[gdb]/.test(c) ? 0.15 : 0, f: v, noise: 0 }); out.push({ dur: cd = 0.015, voice: 0, f: v, noise: 1, band: c[0] === "k" || c[0] === "g" ? [1200, 3000] : c[0] === "t" || c[0] === "d" ? [3000, 6000] : [500, 1500] }); }
    else if (/^(n|m|ny|my)$/.test(c)) out.push({ dur: cd = 0.05, voice: 0.6, f: NASAL, noise: 0 });
    else if (/^(r|ry)$/.test(c)) out.push({ dur: cd = 0.02, voice: 0.5, f: [400, 1400, 2300], noise: 0 });
    else cd = 0;
    if (glide) out.push({ dur: 0.04, voice: 0.8, f: glide, noise: 0 });
    out.push({ dur: Math.max(0.06, M - cd), voice: 1, f: v, noise: 0 });
  }
  return out;
}

/** Synthesize an approximate reference for a word from its romaji (source-filter model). */
export async function synthWord(ro: string, f0 = 140): Promise<AudioBuffer> {
  const segs = romajiSegments(ro);
  const sr = 22050, dur = Math.max(0.3, segs.reduce((a, s) => a + s.dur, 0) + 0.15);
  const ctx = new OfflineAudioContext(1, Math.floor(sr * dur), sr);
  const osc = ctx.createOscillator(); osc.type = "sawtooth";
  osc.frequency.setValueAtTime(f0 * 1.05, 0); osc.frequency.linearRampToValueAtTime(f0 * 0.85, dur);
  const vg = ctx.createGain(); vg.gain.value = 0; vg.connect(ctx.destination);
  const bps = [0, 1, 2].map((i) => { const b = ctx.createBiquadFilter(); b.type = "bandpass"; b.Q.value = 6 - i; const g = ctx.createGain(); g.gain.value = [3, 1.8, 0.8][i]; osc.connect(b); b.connect(g); g.connect(vg); return b; });
  const nb = ctx.createBuffer(1, Math.floor(sr * dur), sr); const nd = nb.getChannelData(0); for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
  const ns = ctx.createBufferSource(); ns.buffer = nb;
  const nbp = ctx.createBiquadFilter(); nbp.type = "bandpass"; nbp.Q.value = 1.2;
  const ng = ctx.createGain(); ng.gain.value = 0; ns.connect(nbp); nbp.connect(ng); ng.connect(ctx.destination);
  let t = 0.05;
  for (const s of segs) {
    vg.gain.setTargetAtTime(s.voice * 0.9, t, 0.008);
    ng.gain.setTargetAtTime(s.noise * 1.6, t, 0.005);
    s.f.forEach((F, i) => bps[i].frequency.setTargetAtTime(F, t, 0.015));
    if (s.band) { const c = Math.sqrt(s.band[0] * s.band[1]); nbp.frequency.setValueAtTime(c, t); nbp.Q.setValueAtTime(c / (s.band[1] - s.band[0]), t); }
    t += s.dur;
  }
  vg.gain.setTargetAtTime(0, t, 0.02); ng.gain.setTargetAtTime(0, t, 0.01);
  osc.start(); ns.start();
  return ctx.startRendering();
}
/** Expected duration at a natural learner pace (~150 ms per mora). */
export const expectedDuration = (ro: string) => Math.max(0.3, romajiSegments(ro).reduce((a, s) => a + s.dur, 0) * 1.15);
