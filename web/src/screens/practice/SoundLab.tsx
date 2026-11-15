import { useEffect, useMemo, useRef, useState } from "react";
import { Mic, MicOff, Play, Square, Volume2 } from "lucide-react";
import { useSettings } from "../../core/store";
import { award } from "../../core/rewards";
import { speak } from "../../core/native";
import { formants, paintColumn, pitch, playBuffer, renderSpectrogram, synthesize } from "../../core/dsp";
import { closeMic, Mic as MicH, openMic, record, toBuffer } from "../../core/mic";
import type { SoundRef, VowelRef } from "../../core/types";
import { usePack } from "../../pack";
import { Header, Seg, tap } from "../../ui/kit";
import { toast } from "../../core/store";
import { LangPill } from "../../ui/icons";

/* ---------------- vowel chart ---------------- */
const F2MAX = 2700, F2MIN = 600, F1MIN = 200, F1MAX = 950;
const COL: Record<string, string> = { target: "var(--shu)", en: "var(--ai)", hi: "var(--gold)" };
function VowelChart({ refs, show, live, trail, scale = 1, onTap, height = 260 }: { refs: VowelRef[]; show: Record<string, boolean>; live?: [number, number] | null; trail?: [number, number][]; scale?: number; onTap?: (v: VowelRef) => void; height?: number }) {
  const W = 340, H = height, pl = 30, pr = 10, pt = 14, pb = 24;
  const x = (f2: number) => pl + ((F2MAX - f2) / (F2MAX - F2MIN)) * (W - pl - pr);
  const y = (f1: number) => pt + ((f1 - F1MIN) / (F1MAX - F1MIN)) * (H - pt - pb);
  const target = refs.filter((r) => r.lang === "target");
  const poly = ["i", "e", "a", "o", "ɯ"].map((ipa) => target.find((t) => t.ipa === ipa)).filter(Boolean) as VowelRef[];
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" className="chart" style={{ background: "var(--surface)", borderRadius: 18 }}>
      {[500, 1000, 1500, 2000, 2500].map((f) => <g key={f}><line x1={x(f)} x2={x(f)} y1={pt} y2={H - pb} stroke="var(--line)" /><text x={x(f) - 10} y={H - 8}>{f}</text></g>)}
      {[300, 500, 700, 900].map((f) => <g key={f}><line x1={pl} x2={W - pr} y1={y(f)} y2={y(f)} stroke="var(--line)" /><text x={2} y={y(f) + 3}>{f}</text></g>)}
      <text x={W - 92} y={pt + 8} style={{ fontWeight: 700 }}>← front · back →</text>
      <text x={pl + 4} y={H - pb - 4} style={{ fontWeight: 700 }}>open ↓</text>
      {show.target && <polygon points={poly.map((v) => x(v.f2 * scale) + "," + y(v.f1 * scale)).join(" ")} fill="var(--shu-soft)" stroke="var(--shu)" strokeOpacity=".4" />}
      {refs.filter((r) => show[r.lang]).map((r, i) => (
        <g key={i} onClick={() => onTap?.(r)} style={{ cursor: "pointer" }}>
          <circle cx={x(r.f2 * scale)} cy={y(r.f1 * scale)} r={r.lang === "target" ? 15 : 5} fill={r.lang === "target" ? COL.target : "var(--surface)"} stroke={COL[r.lang]} strokeWidth={r.lang === "target" ? 0 : 2} />
          {r.lang === "target"
            ? <text x={x(r.f2 * scale)} y={y(r.f1 * scale) + 5} textAnchor="middle" style={{ fill: "#fff", fontSize: 14, fontFamily: "var(--jp)", fontWeight: 700 }}>{r.label.split(" ")[0]}</text>
            : <text x={x(r.f2 * scale) + 7} y={y(r.f1 * scale) + 3} style={{ fill: COL[r.lang], fontSize: 9, fontWeight: 700 }}>{r.label.replace(/^(EN|हि) /, "")}</text>}
        </g>
      ))}
      {trail?.map(([f1, f2], i) => <circle key={i} cx={x(f2)} cy={y(f1)} r={3} fill="var(--matcha)" opacity={(i + 1) / trail.length * 0.6} />)}
      {live && <g><circle cx={x(live[1])} cy={y(live[0])} r={10} fill="var(--matcha)" stroke="#fff" strokeWidth="3" /><text x={x(live[1]) + 13} y={y(live[0]) + 4} style={{ fill: "var(--matcha)", fontWeight: 800, fontSize: 11 }}>you</text></g>}
    </svg>
  );
}

/* ---------------- screen ---------------- */
export default function SoundLab() {
  const [tab, setTab] = useState<"live" | "vowels" | "sounds" | "pitch">("live");
  return (
    <div className="screen">
      <Header title="Sound Lab" sub="See what Japanese sounds look like — and how yours compare" backTo="/practice" />
      <Seg value={tab} options={[["live", "Live"], ["vowels", "Vowels"], ["sounds", "Sounds"], ["pitch", "Pitch"]]} onChange={setTab} />
      <div className="mt12">
        {tab === "live" && <Live />}
        {tab === "vowels" && <Vowels />}
        {tab === "sounds" && <Sounds />}
        {tab === "pitch" && <Pitch />}
      </div>
    </div>
  );
}

function FreqAxis({ maxHz, h }: { maxHz: number; h: number }) {
  const ticks = [0, 1000, 2000, 3000, 4000, 5000, 6000].filter((t) => t <= maxHz);
  return <div style={{ position: "absolute", left: 6, top: 0, height: h, pointerEvents: "none" }}>{ticks.map((t) => <div key={t} style={{ position: "absolute", top: (1 - t / maxHz) * h - 7, fontSize: 10, color: "rgba(255,255,255,.65)", fontWeight: 700 }}>{t ? t / 1000 + "k" : ""}</div>)}</div>;
}

function Live() {
  const pk = usePack();
  const cv = useRef<HTMLCanvasElement>(null);
  const mic = useRef<MicH | null>(null);
  const [on, setOn] = useState(false);
  const [read, setRead] = useState<{ f0: number; f1: number; f2: number; near: string } | null>(null);
  const [trail, setTrail] = useState<[number, number][]>([]);
  const [scale, setScale] = useState(1);
  const raf = useRef(0);
  const H = 220, MAXHZ = 5000;

  const stop = () => { cancelAnimationFrame(raf.current); closeMic(mic.current); mic.current = null; setOn(false); };
  useEffect(() => stop, []); // eslint-disable-line

  const start = async () => {
    tap(20);
    const m = await openMic(); if (!m) return;
    mic.current = m; setOn(true);
    const c = cv.current!; c.width = 360; c.height = H;
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = "#0c0e1c"; ctx.fillRect(0, 0, c.width, c.height);
    const freq = new Float32Array(m.an.frequencyBinCount);
    const time = new Float32Array(m.an.fftSize);
    const colImg = ctx.createImageData(1, H);
    let ef1 = 0, ef2 = 0, frame = 0;
    const tr: [number, number][] = [];
    const targets = pk.vowels.filter((v) => v.lang === "target");
    const loop = () => {
      m.an.getFloatFrequencyData(freq);
      ctx.drawImage(c, -2, 0);
      paintColumn(colImg, 0, freq, m.ctx.sampleRate, MAXHZ, -105, -35);
      ctx.putImageData(colImg, c.width - 2, 0);
      ctx.putImageData(colImg, c.width - 1, 0);
      if (frame++ % 3 === 0) {
        m.an.getFloatTimeDomainData(time);
        const f0 = pitch(time, m.ctx.sampleRate);
        const fm = f0 ? formants(time, m.ctx.sampleRate) : null;
        if (fm && fm.f1 < 1000 && fm.f2 < 3000) {
          ef1 = ef1 ? ef1 * 0.6 + fm.f1 * 0.4 : fm.f1; ef2 = ef2 ? ef2 * 0.6 + fm.f2 * 0.4 : fm.f2;
          let near = "", best = 1e9;
          targets.forEach((t) => { const d = Math.hypot((t.f1 * scale - ef1) / 1, (t.f2 * scale - ef2) / 2.5); if (d < best) { best = d; near = t.label; } });
          setRead({ f0, f1: ef1, f2: ef2, near: best < 220 ? near : "" });
          tr.push([ef1, ef2]); if (tr.length > 18) tr.shift(); setTrail([...tr]);
        } else if (!f0) { setRead((r) => (r ? { ...r, f0: 0 } : r)); }
      }
      raf.current = requestAnimationFrame(loop);
    };
    loop();
  };

  return (
    <div>
      <div className="card" style={{ padding: 12 }}>
        <div style={{ position: "relative" }}>
          <canvas ref={cv} className="spectro" style={{ height: H }} width={360} height={H} />
          <FreqAxis maxHz={MAXHZ} h={H} />
          {!on && <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", color: "#fff", textAlign: "center", padding: 20 }}>
            <div><div style={{ display: "grid", placeItems: "center", marginBottom: 6 }}><Mic size={30} /></div><div style={{ fontWeight: 800 }}>Live spectrogram</div><div className="sm" style={{ opacity: .75 }}>Time flows right → left. Bright bands are your formants — the “shape” of each vowel.</div></div>
          </div>}
        </div>
        <div className="row mt12">
          <button className={"btn " + (on ? "dark" : "primary") + " grow"} onClick={on ? stop : start}>{on ? <><MicOff size={17} /> Stop</> : <><Mic size={17} /> Start microphone</>}</button>
        </div>
        <div className="grid3 mt12">
          <div className="stat"><div className="v">{read?.f0 ? Math.round(read.f0) : "–"}</div><div className="k">Pitch Hz</div></div>
          <div className="stat"><div className="v">{read ? Math.round(read.f1) : "–"}</div><div className="k">F1 (openness)</div></div>
          <div className="stat"><div className="v">{read ? Math.round(read.f2) : "–"}</div><div className="k">F2 (front/back)</div></div>
        </div>
      </div>
      <div className="card">
        <div className="row"><div className="grow"><div style={{ fontWeight: 800 }}>Where your vowel lands</div><div className="xs mu">Say あ… い… う… え… お… slowly and hold each one.</div></div>
          {read?.near && <span className="tag jp" style={{ background: "var(--matcha)", color: "#fff", height: 30, fontSize: 15 }}>≈ {read.near}</span>}</div>
        <div className="mt8"><VowelChart refs={pk.vowels} show={{ target: true, en: false, hi: false }} live={read && read.f1 ? [read.f1, read.f2] : null} trail={trail} scale={scale} onTap={(v) => speak(v.example || v.label, { lang: pk.ttsLang })} /></div>
        <div className="mt8"><Seg value={String(scale)} options={[["1", "Lower voice"], ["1.15", "Higher voice"]]} onChange={(v) => setScale(+v)} /></div>
        <div className="xs mu mt8" style={{ lineHeight: 1.5 }}>Targets are average adult values; higher voices have formants ~15% higher, so switch the scale. Estimates come from LPC analysis on your phone — use quiet surroundings.</div>
      </div>
    </div>
  );
}

function Vowels() {
  const pk = usePack();
  const s = useSettings();
  const [show, setShow] = useState<Record<string, boolean>>({ target: true, en: true, hi: s.showHindi });
  const [sel, setSel] = useState<VowelRef | null>(null);
  const play = async (v: VowelRef) => {
    tap(); setSel(v);
    if (v.lang === "target") speak(v.label.split(" ")[0], { lang: pk.ttsLang });
    else playBuffer(await synthesize({ kind: "vowel", f: [v.f1, v.f2, v.f3] }, 0.7));
  };
  return (
    <div>
      <div className="card">
        <div style={{ fontWeight: 800 }}>The vowel map</div>
        <div className="sm mu mt4" style={{ lineHeight: 1.55 }}>Every vowel is defined by two resonances: <b>F1</b> (how open your mouth is) and <b>F2</b> (how far forward your tongue is). Japanese uses just 5 spots; English uses many more. Tap a dot to hear it.</div>
        <div className="row wrap mt12 gap6">
          <button className={"chip" + (show.target ? " shu on" : "")} onClick={() => setShow({ ...show, target: !show.target })}><LangPill l="ja" /> Japanese</button>
          <button className={"chip" + (show.en ? " on" : "")} onClick={() => setShow({ ...show, en: !show.en })}><LangPill l="en" /> English</button>
          <button className={"chip" + (show.hi ? " on" : "")} onClick={() => setShow({ ...show, hi: !show.hi })}><LangPill l="hi" /> Hindi</button>
        </div>
        <div className="mt12"><VowelChart refs={pk.vowels} show={show} onTap={play} height={300} /></div>
        {sel && <div className="feedback ok"><b>{sel.label}</b> · F1 {sel.f1} Hz · F2 {sel.f2} Hz {sel.lang !== "target" && <span className="xs mu">(synthesised)</span>}</div>}
      </div>
      <div className="card soft-gold" style={{ boxShadow: "none" }}>
        <div style={{ fontWeight: 800 }}>What the map tells you</div>
        <ul className="sm" style={{ lineHeight: 1.65, paddingLeft: 18, margin: "6px 0 0" }}>
          <li>Japanese <b className="jp">う</b> sits much further <b>forward</b> (higher F2) than English “oo” or Hindi ऊ — keep your lips relaxed, not rounded.</li>
          <li>Hindi <span className="hi">इ ए ओ आ</span> land almost exactly on Japanese <span className="jp">い え お あ</span>. You already own 4 of 5 vowels!</li>
          <li>English speakers: avoid gliding “ay”/“oh” — Japanese <span className="jp">え</span> and <span className="jp">お</span> are pure, steady points.</li>
        </ul>
      </div>
      <div className="xs mu" style={{ lineHeight: 1.5 }}>Approximate adult-male averages: English from Hillenbrand et al. (1995); Japanese and Hindi from published acoustic studies, rounded.</div>
    </div>
  );
}

function Sounds() {
  const pk = usePack();
  const [sel, setSel] = useState<SoundRef>(pk.sounds[0]);
  const ref = useRef<HTMLCanvasElement>(null);
  const mine = useRef<HTMLCanvasElement>(null);
  const buf = useRef<AudioBuffer | null>(null);
  const [rec, setRec] = useState<"idle" | "rec" | "done">("idle");
  const myBuf = useRef<AudioBuffer | null>(null);
  useEffect(() => {
    let live = true;
    synthesize({ kind: sel.kind, f: sel.f, band: sel.band }, 1.0).then((b) => {
      if (!live) return; buf.current = b;
      const c = ref.current!; c.width = 360; c.height = 200; renderSpectrogram(c, b.getChannelData(0), b.sampleRate, 6000);
    });
    setRec("idle");
    return () => { live = false; };
  }, [sel]);
  const recordMine = async () => {
    tap(20);
    const m = await openMic(); if (!m) return;
    setRec("rec");
    const { data, sr } = await record(m, 1.6);
    closeMic(m);
    myBuf.current = toBuffer(data, sr);
    setRec("done");
    requestAnimationFrame(() => { const c = mine.current!; c.width = 360; c.height = 200; renderSpectrogram(c, data, sr, 6000); });
    award(2);
  };
  return (
    <div>
      <div className="grid3">
        {pk.sounds.map((x) => (
          <button key={x.id} className="tile" style={{ minHeight: 76, alignItems: "center", justifyContent: "center", boxShadow: sel.id === x.id ? "inset 0 0 0 2px var(--shu), var(--shadow-1)" : undefined }} onClick={() => { tap(); setSel(x); }}>
            <span className="jp" style={{ fontSize: 26, fontWeight: 700 }}>{x.jp}</span><span className="xs mu">{x.label} · {x.kind}</span>
          </button>
        ))}
      </div>
      <div className="card mt12" style={{ padding: 12 }}>
        <div className="row"><div className="grow"><div style={{ fontWeight: 800 }}><span className="jp">{sel.jp}</span> “{sel.label}” — what it looks like</div><div className="xs mu">Synthesised reference · 0–6 kHz</div></div>
          <button className="btn sm" onClick={() => buf.current && playBuffer(buf.current)}><Play size={14} /> Tone</button>
          <button className="btn sm" onClick={() => speak(sel.jp, { lang: pk.ttsLang })}><Volume2 size={14} /> Voice</button></div>
        <div style={{ position: "relative" }} className="mt8">
          <canvas ref={ref} className="spectro" style={{ height: 200 }} />
          <FreqAxis maxHz={6000} h={200} />
          {sel.f && sel.f.map((f, i) => <div key={i} style={{ position: "absolute", right: 8, top: (1 - f / 6000) * 200 - 8, fontSize: 10, fontWeight: 800, color: "#fff", background: "rgba(224,69,43,.85)", padding: "1px 6px", borderRadius: 6 }}>F{i + 1} {f}</div>)}
        </div>
        <div className="sm mt8" style={{ lineHeight: 1.55 }}>{sel.desc}</div>
      </div>
      <div className="card" style={{ padding: 12 }}>
        <div className="row"><div className="grow"><div style={{ fontWeight: 800 }}>Your version</div><div className="xs mu">Record 1.6 s and compare the bands</div></div>
          <button className={"btn sm " + (rec === "rec" ? "dark" : "primary")} onClick={recordMine} disabled={rec === "rec"}><Mic size={14} /> {rec === "rec" ? "Recording…" : "Record"}</button>
          {rec === "done" && <button className="btn sm" onClick={() => myBuf.current && playBuffer(myBuf.current)}><Play size={14} /></button>}</div>
        <div style={{ position: "relative" }} className="mt8">
          <canvas ref={mine} className="spectro" style={{ height: rec === "done" ? 200 : 0, transition: "height .3s" }} />
          {rec === "done" && <FreqAxis maxHz={6000} h={200} />}
        </div>
        {rec !== "done" && <div className="xs mu mt4">Say <b className="jp">{sel.jp}{sel.kind === "vowel" ? "ー" : ""}</b> steadily for the whole recording.</div>}
      </div>
    </div>
  );
}

function Pitch() {
  const pk = usePack();
  const [wi, setWi] = useState(0);
  const w = pk.pitch[wi];
  const [contour, setContour] = useState<number[] | null>(null);
  const [state, setState] = useState<"idle" | "rec">("idle");
  const [mine, setMine] = useState<number[] | null>(null);
  useEffect(() => { setContour(null); setMine(null); }, [wi]);

  const rec = async () => {
    tap(20);
    const m = await openMic(); if (!m) return;
    setState("rec");
    const { data, sr } = await record(m, 2.0);
    closeMic(m); setState("idle");
    const hop = Math.floor(sr / 100), size = Math.floor(sr * 0.04);
    const ps: number[] = [];
    for (let i = 0; i + size < data.length; i += hop) ps.push(pitch(data.subarray(i, i + size), sr));
    // keep the voiced region
    const first = ps.findIndex((x) => x > 0), last = ps.length - 1 - [...ps].reverse().findIndex((x) => x > 0);
    if (first < 0) { toast("No voice detected — speak louder.", "warn"); return; }
    const seg = ps.slice(first, last + 1);
    // remove octave jumps with a median filter
    const med = seg.map((_, i) => { const win = seg.slice(Math.max(0, i - 3), i + 4).filter((x) => x > 0).sort((a, b) => a - b); return win.length ? win[win.length >> 1] : 0; });
    setContour(med);
    // per-mora H/L
    const n = w.pattern.length;
    const avg = Array.from({ length: n }, (_, k) => { const part = med.slice(Math.floor((k / n) * med.length), Math.floor(((k + 1) / n) * med.length)).filter((x) => x > 0); return part.reduce((a, b) => a + b, 0) / Math.max(1, part.length); });
    const mean = avg.reduce((a, b) => a + b, 0) / n;
    const hl = avg.map((a) => (a > mean ? 1 : 0));
    setMine(hl);
    if (hl.every((x, k) => x === w.pattern[k])) award(5);
  };

  const plot = useMemo(() => {
    if (!contour) return null;
    const v = contour.filter((x) => x > 0);
    const lo = Math.min(...v), hi = Math.max(...v);
    const W = 320, H = 120;
    const pts = contour.map((x, i) => (x > 0 ? [(i / (contour.length - 1)) * W, H - 10 - ((x - lo) / Math.max(1, hi - lo)) * (H - 20)] : null));
    let d = ""; let pen = false;
    pts.forEach((p) => { if (!p) { pen = false; return; } d += (pen ? "L" : "M") + p[0].toFixed(1) + "," + p[1].toFixed(1); pen = true; });
    return { d, W, H, lo, hi };
  }, [contour]);

  const n = w.pattern.length;
  const moras = w.ro.split("-");
  return (
    <div>
      <div className="card">
        <div style={{ fontWeight: 800 }}>Pitch accent</div>
        <div className="sm mu mt4" style={{ lineHeight: 1.55 }}>Japanese words have a melody: each beat is <b>High</b> or <b>Low</b>. Same sounds, different melody = different word. Listen, then record yourself and compare.</div>
        <div className="chips mt12">{pk.pitch.map((x, i) => <button key={i} className={"chip" + (i === wi ? " on" : "")} onClick={() => setWi(i)}><span className="jp">{x.word}</span>&nbsp;{x.en}</button>)}</div>
      </div>
      <div className="card center">
        <div className="jp" style={{ fontSize: 44, fontWeight: 700 }}>{w.word}</div>
        <div className="mu">{w.ro.replace(/-/g, "")} · {w.en}</div>
        <svg viewBox="0 0 320 110" width="100%" className="mt8">
          {w.pattern.map((h, k) => {
            const x = n > 1 ? 30 + (k * 260) / (n - 1) : 160;
            const y = h ? 28 : 70;
            const nx = k + 1 < n ? 30 + ((k + 1) * 260) / (n - 1) : null;
            const ny = k + 1 < n ? (w.pattern[k + 1] ? 28 : 70) : null;
            return <g key={k}>
              {nx !== null && <line x1={x} y1={y} x2={nx} y2={ny!} stroke="var(--shu)" strokeWidth="3" />}
              <circle cx={x} cy={y} r={9} fill={h ? "var(--shu)" : "var(--surface)"} stroke="var(--shu)" strokeWidth="3" />
              <text x={x} y={100} textAnchor="middle" style={{ fill: "var(--ink)", fontSize: 13, fontWeight: 700 }}>{moras[k]}</text>
              {mine && <text x={x} y={y === 28 ? 14 : 92} textAnchor="middle" style={{ fill: mine[k] === h ? "var(--matcha)" : "var(--shu)", fontSize: 10, fontWeight: 800 }}>{mine[k] ? "you H" : "you L"}</text>}
            </g>;
          })}
        </svg>
        <div className="row mt8" style={{ justifyContent: "center" }}>
          <button className="btn" onClick={() => speak(w.word, { lang: pk.ttsLang, rate: 0.7 })}><Volume2 size={16} /> Listen</button>
          <button className={"btn " + (state === "rec" ? "dark" : "primary")} onClick={rec} disabled={state === "rec"}>{state === "rec" ? <><Square size={14} /> Recording 2s…</> : <><Mic size={16} /> Record me</>}</button>
        </div>
        {mine && <div className={"feedback " + (mine.every((x, k) => x === w.pattern[k]) ? "ok" : "bad")}>
          <b>{mine.every((x, k) => x === w.pattern[k]) ? "Your melody matches! ✓" : "Melody differs — listen again and exaggerate the high beat."}</b>
          <div className="xs mu mt4">Target: {w.pattern.map((x) => (x ? "H" : "L")).join(" ")} · You: {mine.map((x) => (x ? "H" : "L")).join(" ")}</div>
        </div>}
      </div>
      {plot && (
        <div className="card">
          <div style={{ fontWeight: 800 }}>Your pitch contour</div>
          <svg viewBox={`0 0 ${plot.W} ${plot.H}`} width="100%" className="chart mt8" style={{ background: "var(--surface-2)", borderRadius: 14 }}>
            <path d={plot.d} fill="none" stroke="var(--matcha)" strokeWidth="3" strokeLinecap="round" />
            <text x={4} y={12}>{Math.round(plot.hi)} Hz</text><text x={4} y={plot.H - 2}>{Math.round(plot.lo)} Hz</text>
          </svg>
          <div className="xs mu mt4">Pitch measured every 10 ms by autocorrelation; only voiced parts are drawn.</div>
        </div>
      )}
      <div className="xs mu" style={{ lineHeight: 1.5 }}>Patterns are Tokyo standard Japanese. Look up any word’s pitch in the OJAD dictionary (Explore → Resources).</div>
    </div>
  );
}
