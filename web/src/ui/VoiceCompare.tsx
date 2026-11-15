import { useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronUp, Mic, Play, RotateCcw, Volume2 } from "lucide-react";
import { bandProfile, expectedDuration, moraeOf, pitchTrack, playBuffer, renderSpectrogram, synthWord, trimSilence } from "../core/dsp";
import { closeMic, openMic, record, toBuffer } from "../core/mic";
import { decode, getRec, saveRec } from "../core/recStore";
import { emitUi, getProgress, toast, updateProgress, bumpDay, useSettings, VoiceRec } from "../core/store";
import { award, checkBadges } from "../core/rewards";
import { asrUnsupported, captureNative, captureSupported, listen, speak, speechSupported, stopListening } from "../core/native";
import { matchScore } from "../core/match";
import { VowelChart, VowelPoint } from "./VowelChart";
import { formants } from "../core/dsp";
import { go } from "../core/router";
import { romaji } from "../packs/ja/verbs";
import { usePack } from "../pack";
import { tap } from "./kit";
import { Icon } from "./icons";

/** Small mic button: opens the record-and-compare sheet for any text. */
export function RecBtn({ text, ro, en, size = "s" }: { text: string; ro?: string; en?: string; size?: "s" | "m" }) {
  return (
    <button aria-label={"Record yourself saying " + text} className={"say" + (size === "s" ? " s" : "")} style={{ background: "var(--matcha-soft)", color: "var(--matcha)" }}
      onClick={(e) => { e.stopPropagation(); tap(); emitUi({ type: "voice", text, ro, en }); }}>
      <Mic size={size === "s" ? 15 : 18} strokeWidth={2.4} />
    </button>
  );
}

const BAND_NAMES = ["Low", "Mid", "High"];
const BAND_DESC = ["80–500 Hz · voice body, vowels’ base", "500–2000 Hz · vowel colour (a/o/u)", "2–6 kHz · consonants s, sh, ts, i/e"];

type Result = VoiceRec & { mine: AudioBuffer | null; contour: number[] };

export default function VoiceCompare({ text, ro, en, reviewT }: { text: string; ro?: string; en?: string; reviewT?: number }) {
  const pk = usePack();
  const word = pk.words.find((w) => w.w === text);
  const roma = (ro || word?.ro || romaji(text)).replace(/[^a-zA-Zāīūēō' ]/g, " ").trim();
  const meaning = en || word?.m;
  const refCv = useRef<HTMLCanvasElement>(null);
  const myCv = useRef<HTMLCanvasElement>(null);
  const refBuf = useRef<AudioBuffer | null>(null);
  const [refBands, setRefBands] = useState<[number, number, number]>([0.4, 0.35, 0.25]);
  const [state, setState] = useState<"idle" | "rec" | "checking" | "done">("idle");
  const [count, setCount] = useState(0);
  const [res, setRes] = useState<Result | null>(null);
  const [noAudio, setNoAudio] = useState(false);
  const [check, setCheck] = useState<{ heard: string; score: number } | null>(null);
  const exp = expectedDuration(roma);
  const recSec = Math.min(6, Math.max(2, exp * 1.8 + 0.8));
  const history = (getProgress().voiceLog || []).filter((v) => v.w === text);

  const drawMine = (x: Float32Array, sr: number) => requestAnimationFrame(() => { const c = myCv.current; if (c) { c.width = 320; c.height = 120; renderSpectrogram(c, x, sr, 6000); } });

  useEffect(() => {
    let live = true;
    synthWord(roma || "a").then((b) => {
      if (!live) return;
      refBuf.current = b;
      const d = b.getChannelData(0);
      setRefBands(bandProfile(d, b.sampleRate).bands);
      const c = refCv.current; if (c) { c.width = 320; c.height = 120; renderSpectrogram(c, d, b.sampleRate, 6000); }
    });
    return () => { live = false; };
  }, [roma]);

  // Review mode: open a saved recording with its audio and analysis.
  useEffect(() => {
    if (!reviewT) return;
    const rec = (getProgress().voiceLog || []).find((r) => r.t === reviewT);
    if (!rec) return;
    getRec(reviewT).then((st) => {
      if (st) {
        const x = decode(st);
        setRes({ ...rec, mine: toBuffer(x, st.sr), contour: st.contour });
        drawMine(x, st.sr);
      } else { setRes({ ...rec, mine: null, contour: [] }); setNoAudio(true); }
      setState("done");
    });
  }, [reviewT]); // eslint-disable-line

  const alts = [text, word?.r, word?.w].filter(Boolean) as string[];
  const needCheck = text.replace(/[^\u3040-\u30ff\u3400-\u9fff]/g, "").length >= 2;

  /** Ask the recogniser what was said (separate listen, used when the phone can't recognise our own recording). */
  const listenOnce = () => new Promise<string[] | null>((resolve) => {
    if (!speechSupported()) { resolve(null); return; }
    let best: string[] | null = null, done = false;
    const end = (v: string[] | null) => { if (!done) { done = true; resolve(v); } };
    listen(pk.ttsLang, (e) => {
      if (e.type === "result" && e.texts) end(e.texts);
      else if (e.type === "partial" && e.texts) best = e.texts;
      else if (e.type === "error") end(e.error === "no-speech" ? [] : best);
      else if (e.type === "end") window.setTimeout(() => end(best || []), 300);
    });
    window.setTimeout(() => { stopListening(); end(best || []); }, 8000);
  });

  const go2 = async () => {
    tap(20);
    setRes(null); setNoAudio(false); setCheck(null);
    let data: Float32Array, sr: number, heard: string[] | null = null;
    setState("rec"); setCount(Math.ceil(recSec));
    const iv = window.setInterval(() => setCount((c) => Math.max(0, c - 1)), 1000);
    if (captureSupported()) {
      const c = await captureNative(pk.ttsLang, Math.round(recSec * 1000));
      window.clearInterval(iv);
      if (!c.pcm) { setState("idle"); toast("Microphone is not available - allow microphone access and try again.", "warn"); return; }
      data = c.pcm; sr = c.sr;
      heard = asrUnsupported(c) ? null : (c.texts || []);
    } else {
      const m = await openMic(); if (!m) { window.clearInterval(iv); setState("idle"); return; }
      const r = await record(m, recSec); window.clearInterval(iv); closeMic(m);
      data = r.data; sr = r.sr;
    }
    const cut = trimSilence(data, sr);
    if (!cut || cut.length < sr * 0.15) { setState("idle"); toast("I couldn’t hear you - hold the phone closer and speak loudly.", "warn"); return; }
    // 1) Check the words first: only analyse if you said the right thing (≥ 80% match).
    let match: number | undefined;
    if (needCheck) {
      if (heard === null) { setState("checking"); heard = await listenOnce(); }
      if (heard !== null) {
        match = matchScore(heard, alts);
        if (match < 0.8) { setCheck({ heard: heard[0] || "", score: match }); setState("idle"); tap(40); return; }
      }
    }
    const { bands, db } = bandProfile(cut, sr);
    const { contour, range } = pitchTrack(cut, sr);
    const dur = cut.length / sr;
    const bandDiff = bands.reduce((a, b, i) => a + Math.abs(b - refBands[i]), 0);
    const loud = db < -32 ? 0.6 : db < -26 ? 0.85 : 1;
    const pace = Math.min(dur, exp) / Math.max(dur, exp);
    const score = Math.round(Math.max(0, Math.min(1, (1 - bandDiff * 1.6) * 0.55 + loud * 0.25 + pace * 0.2)) * 100);
    const rec: VoiceRec = { t: Date.now(), w: text, bands, ref: refBands, db, dur, exp, f0: range, score, match };
    updateProgress((p) => { p.voiceLog = [...(p.voiceLog || []), rec].slice(-300); bumpDay(p, (d) => { d.spoke = (d.spoke || 0) + 1; }); });
    saveRec(rec.t, text, cut, sr, contour).then((ok) => { if (!ok) toast("Couldn’t save the sound of this recording on the phone (storage full?). The analysis is saved.", "warn"); });
    award(3); checkBadges();
    setRes({ ...rec, mine: toBuffer(cut, sr), contour });
    setState("done");
    drawMine(cut, sr);
  };

  const tips: string[] = [];
  if (res) {
    if (res.db < -32) tips.push("volume|Too quiet - speak LOUDER, from your chest. Loud practice builds confidence and clearer sounds.");
    else if (res.db < -26) tips.push("volumeLow|A bit soft - a little louder will sound more confident.");
    else tips.push("check|Great volume.");
    if (res.dur > res.exp * 1.6) tips.push("turtle|Slower than natural - keep every beat short and even.");
    else if (res.dur < res.exp * 0.6) tips.push("zap|Very fast - give each mora its own beat.");
    else tips.push("timer|Good pace.");
    const d = res.bands.map((b, i) => b - res.ref[i]);
    if (d[2] < -0.05) tips.push("sparkles|High band is weak - make s / sh / ts and い・え crisper.");
    if (d[0] > 0.06) tips.push("sliders|Lots of low energy - open your mouth more and push the sound forward.");
    if (res.f0[1] && res.f0[1] / Math.max(1, res.f0[0]) < 1.12 && res.exp > 0.4) tips.push("music|Very flat melody - Japanese words rise and fall (pitch accent). Copy the voice’s ups and downs.");
  }
  const when = reviewT ? new Date(reviewT) : null;

  return (
    <div>
      <div className="row top">
        <div className="grow">
          <div className="kicker">{when ? "Recording · " + when.toLocaleDateString() + " " + when.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Record & compare"}</div>
          <div className="jp" style={{ fontSize: text.length > 10 ? 22 : 32, fontWeight: 700, lineHeight: 1.3 }}>{text}</div>
          <div className="sm mu">{roma}{meaning ? " · " + meaning : ""}</div>
        </div>
        <button className="say" onClick={() => speak(text, { lang: pk.ttsLang, rate: 0.85 })} aria-label="Listen"><Volume2 size={18} /></button>
      </div>

      <div className="grid2 mt12" style={{ gap: 8 }}>
        <div>
          <div className="xs mu" style={{ fontWeight: 700 }}>Reference (synthetic) <button className="xs" style={{ color: "var(--shu)", fontWeight: 700 }} onClick={() => refBuf.current && playBuffer(refBuf.current)}>▶ tone</button></div>
          <canvas ref={refCv} className="spectro mt4" style={{ height: 90 }} />
        </div>
        <div>
          <div className="xs mu" style={{ fontWeight: 700 }}>You {res?.mine && <button className="xs" style={{ color: "var(--shu)", fontWeight: 700 }} onClick={() => playBuffer(res.mine!)}>▶ play</button>}</div>
          <canvas ref={myCv} className="spectro mt4" style={{ height: 90, opacity: res?.mine ? 1 : 0.35 }} />
        </div>
      </div>
      {noAudio && <div className="xs mu mt4">Audio wasn’t saved for this one (recorded before v2.4) - the analysis is still here.</div>}

      <button className={"btn lg block mt12 " + (state === "rec" || state === "checking" ? "dark" : "primary")} onClick={go2} disabled={state === "rec" || state === "checking"}>
        {state === "checking" ? <>● Say it once more - checking the words…</> : state === "rec" ? <>● Recording… {count}s - say it now, loudly</> : state === "done" ? <><RotateCcw size={17} /> Record again</> : <><Mic size={18} /> Record me ({recSec.toFixed(1)}s)</>}
      </button>

      {check && (
        <div className="feedback bad">
          <div className="row top" style={{ gap: 10 }}><Icon name="alert" size={22} color="var(--shu)" />
            <div className="grow">
              <b>That didn’t sound like 「{text}」 - please try again</b>
              <div className="sm mt4">I heard: <span className="jp" style={{ fontWeight: 700 }}>{check.heard || "(nothing clear)"}</span> · match {Math.round(check.score * 100)}% (need 80%)</div>
              <div className="xs mu mt4">Tap the speaker, listen, then record again. Details appear once the words match.</div>
            </div></div>
        </div>
      )}
      {res && (
        <div className="mt12">
          {res.match !== undefined && <div className="xs mt4 row gap4" style={{ color: "var(--matcha)", fontWeight: 700 }}><Icon name="check" size={14} /> Words checked: {Math.round(res.match * 100)}% match</div>}
          <div className="row"><div style={{ fontSize: 34, fontWeight: 800, color: res.score >= 70 ? "var(--matcha)" : res.score >= 50 ? "var(--gold)" : "var(--shu)" }}>{res.score}</div>
            <div className="grow sm"><b>{res.score >= 75 ? "すごい！ Very close" : res.score >= 55 ? "いいね！ Getting there" : "Keep going - listen & repeat"}</b><div className="xs mu">Sound-shape match · volume · pace</div></div>
            {res.mine && <button className="btn sm" onClick={() => playBuffer(res.mine!)}><Play size={14} /> Mine</button>}</div>

          <div className="card flat mt8" style={{ padding: 12 }}>
            <div className="xs mu" style={{ fontWeight: 700, marginBottom: 6 }}>FREQUENCY BALANCE · you vs reference</div>
            {res.bands.map((b, i) => (
              <div key={i} style={{ marginBottom: 8 }}>
                <div className="row xs"><b style={{ width: 34 }}>{BAND_NAMES[i]}</b><span className="mu2 grow">{BAND_DESC[i]}</span><span>{Math.round(b * 100)}% / {Math.round(res.ref[i] * 100)}%</span></div>
                <div style={{ position: "relative", height: 16, marginTop: 3 }}>
                  <div style={{ position: "absolute", left: 0, top: 0, height: 7, width: b * 100 + "%", background: "var(--matcha)", borderRadius: 4 }} />
                  <div style={{ position: "absolute", left: 0, top: 9, height: 7, width: res.ref[i] * 100 + "%", background: "var(--ink-3)", borderRadius: 4, opacity: 0.6 }} />
                </div>
              </div>
            ))}
            <div className="row xs mu gap16"><span className="row gap4"><i style={{ width: 10, height: 10, borderRadius: 3, background: "var(--matcha)", display: "block" }} />you</span><span className="row gap4"><i style={{ width: 10, height: 10, borderRadius: 3, background: "var(--ink-3)", opacity: .6, display: "block" }} />reference</span></div>
          </div>

          <div className="grid3 mt8">
            <div className="stat"><div className="v" style={{ fontSize: 19 }}>{Math.round(res.db)} dB</div><div className="k">Loudness {res.db >= -26 ? "✓" : "↑"}</div></div>
            <div className="stat"><div className="v" style={{ fontSize: 19 }}>{res.dur.toFixed(1)}s</div><div className="k">Length (≈{res.exp.toFixed(1)}s)</div></div>
            <div className="stat"><div className="v" style={{ fontSize: 19 }}>{res.f0[0] ? Math.round(res.f0[0]) + "–" + Math.round(res.f0[1]) : "–"}</div><div className="k">Pitch Hz</div></div>
          </div>

          {res.contour.some((x) => x > 0) && <MoraMelody c={res.contour} roma={roma} />}
          {res.mine && <VowelMap buf={res.mine} contour={res.contour} roma={roma} f0={res.f0} />}
          <WhereYouStand r={res} />
          <div className="feedback ok" style={{ background: "var(--surface-2)" }}>{tips.map((t) => { const [ic, msg] = t.split("|"); return <div key={t} className="sm row top" style={{ padding: "3px 0", gap: 8 }}><span style={{ color: "var(--matcha)", marginTop: 1 }}><Icon name={ic} size={16} /></span><span>{msg}</span></div>; })}</div>
          <Explain />
        </div>
      )}

      {history.length > 0 && (
        <div className="mt16">
          <div className="row"><div className="xs mu grow" style={{ fontWeight: 700 }}>ALL YOUR ATTEMPTS AT THIS ({history.length})</div>
            <button className="xs" style={{ color: "var(--shu)", fontWeight: 700 }} onClick={() => { history.length && go("/me/recordings"); }}>All recordings →</button></div>
          <div className="row wrap gap6 mt8">
            {history.slice(-12).reverse().map((h) => (
              <button key={h.t} className="chip" style={h.t === res?.t ? { boxShadow: "inset 0 0 0 2px var(--shu)" } : undefined} onClick={() => emitUi({ type: "voice", text, ro, en, reviewT: h.t })}>
                <b style={{ color: h.score >= 70 ? "var(--matcha)" : h.score >= 50 ? "var(--gold)" : "var(--shu)" }}>{h.score}</b>
                <span className="xs mu">{new Date(h.t).toLocaleDateString(undefined, { day: "numeric", month: "short" })}</span>
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="xs mu2 mt12" style={{ lineHeight: 1.45 }}>The reference is generated from the sounds of the word (not a recording of a native speaker), so use it for the overall shape: vowels in the low/mid bands, s/sh/ts hiss up high. Always copy the speaker voice for the real sound.</div>
    </div>
  );
}

/** Pitch contour split into the word's beats; each beat labelled High / Mid / Low relative to your own range. */
function MoraMelody({ c, roma }: { c: number[]; roma: string }) {
  const v = c.filter((x) => x > 0); const lo = Math.min(...v), hi = Math.max(...v);
  const morae = moraeOf(roma);
  const first = c.findIndex((x) => x > 0), last = c.length - 1 - [...c].reverse().findIndex((x) => x > 0);
  const W = 320, H = 96, top = 8, bot = 22;
  const y = (f: number) => top + (1 - (f - lo) / Math.max(1, hi - lo)) * (H - top - bot);
  let d = "", pen = false;
  c.forEach((f, i) => { if (!f) { pen = false; return; } const px = (i / Math.max(1, c.length - 1)) * W; d += (pen ? "L" : "M") + px.toFixed(1) + "," + y(f).toFixed(1); pen = true; });
  const n = Math.max(1, morae.length);
  const seg = Array.from({ length: n }, (_, k) => {
    const a = first + Math.floor(((last - first + 1) * k) / n), b = first + Math.floor(((last - first + 1) * (k + 1)) / n);
    const part = c.slice(a, b).filter((x) => x > 0);
    const avg = part.length ? part.reduce((s, x) => s + x, 0) / part.length : 0;
    const rel = avg ? (avg - lo) / Math.max(1, hi - lo) : -1;
    return { a, b, avg, lvl: rel < 0 ? "–" : rel > 0.66 ? "H" : rel > 0.33 ? "M" : "L" };
  });
  const col = { H: "var(--shu)", M: "var(--gold)", L: "var(--ai)", "–": "var(--ink-3)" } as Record<string, string>;
  const flat = hi / Math.max(1, lo) < 1.12;
  return (
    <div className="mt12">
      <div className="xs mu" style={{ fontWeight: 700 }}>YOUR MELODY · each beat High / Mid / Low (in your own range)</div>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ background: "var(--surface-2)", borderRadius: 12, marginTop: 4 }}>
        {[["H", 0.83], ["M", 0.5], ["L", 0.17]].map(([l, r]) => <g key={l as string}><line x1="0" x2={W} y1={top + (1 - (r as number)) * (H - top - bot)} y2={top + (1 - (r as number)) * (H - top - bot)} stroke="var(--line)" strokeDasharray="3 4" /><text x="3" y={top + (1 - (r as number)) * (H - top - bot) - 2} style={{ fontSize: 8, fill: "var(--ink-3)", fontWeight: 700 }}>{l === "H" ? "high" : l === "M" ? "mid" : "low"}</text></g>)}
        {seg.map((s, k) => k > 0 && <line key={k} x1={(s.a / Math.max(1, c.length - 1)) * W} x2={(s.a / Math.max(1, c.length - 1)) * W} y1={top} y2={H - bot + 4} stroke="var(--line-2)" />)}
        <path d={d} fill="none" stroke="var(--matcha)" strokeWidth="3" strokeLinecap="round" />
        {seg.map((s, k) => { const cx = (((s.a + s.b) / 2) / Math.max(1, c.length - 1)) * W; return <g key={"m" + k}>
          <text x={cx} y={H - 9} textAnchor="middle" style={{ fontSize: 9, fill: "var(--ink)", fontWeight: 700 }}>{morae[k] || ""}</text>
          <text x={cx} y={H - 1} textAnchor="middle" style={{ fontSize: 8, fill: col[s.lvl], fontWeight: 800 }}>{s.lvl}</text></g>; })}
      </svg>
      <div className="xs mu mt4" style={{ lineHeight: 1.45 }}>
        Your pattern: <b>{seg.map((s) => s.lvl).join(" ")}</b>. {flat ? "Your voice stayed almost flat - Japanese words step up and down between beats." : "Compare with the speaker voice: in Japanese the pitch usually jumps between the 1st and 2nd beat (up or down)."}
      </div>
    </div>
  );
}

/** Gauge with coloured zones and a marker for where you are. */
function Gauge({ label, value, min, max, zones, unit, show, range }: { label: string; value: number; min: number; max: number; zones: [number, string, string][]; unit: string; show: string; range?: [number, number] }) {
  const pct = (x: number) => Math.max(0, Math.min(100, ((x - min) / (max - min)) * 100));
  const zone = zones.find(([to]) => value <= to) || zones[zones.length - 1];
  let from = min;
  return (
    <div style={{ marginBottom: 14 }}>
      <div className="row xs"><b className="grow">{label}</b><span style={{ fontWeight: 800, color: zone[2] }}>{show} · {zone[1]}</span></div>
      <div style={{ position: "relative", height: 26, marginTop: 4 }}>
        <div style={{ position: "absolute", top: 8, left: 0, right: 0, height: 10, borderRadius: 5, overflow: "hidden", display: "flex" }}>
          {zones.map(([to, , c]) => { const w = pct(Math.min(to, max)) - pct(from); from = to; return <div key={to} style={{ width: w + "%", background: c, opacity: 0.35 }} />; })}
        </div>
        {range && <div style={{ position: "absolute", top: 8, height: 10, left: pct(range[0]) + "%", width: Math.max(1, pct(range[1]) - pct(range[0])) + "%", background: zone[2], borderRadius: 5, opacity: 0.7 }} />}
        <div style={{ position: "absolute", left: `calc(${pct(value)}% - 7px)`, top: 4, width: 14, height: 18, borderRadius: 7, background: zone[2], border: "3px solid var(--surface)", boxShadow: "var(--shadow-1)" }} />
      </div>
      <div className="row" style={{ justifyContent: "space-between" }}>{zones.map(([, l]) => <span key={l} className="xs mu2" style={{ fontSize: 10 }}>{l}</span>)}</div>
      <div className="xs mu2" style={{ fontSize: 10 }}>{min}{unit} … {max}{unit}</div>
    </div>
  );
}

function WhereYouStand({ r }: { r: VoiceRec }) {
  const avgF0 = r.f0[0] ? (r.f0[0] + r.f0[1]) / 2 : 0;
  const semis = r.f0[0] ? 12 * Math.log2(r.f0[1] / Math.max(1, r.f0[0])) : 0;
  const pace = r.dur / r.exp;
  return (
    <div className="card flat mt12" style={{ padding: 12 }}>
      <div className="xs mu" style={{ fontWeight: 700, marginBottom: 8 }}>WHERE YOU STAND</div>
      {avgF0 > 0 && <Gauge label="Voice pitch (how low or high your voice is)" value={avgF0} min={60} max={350} unit=" Hz" show={Math.round(avgF0) + " Hz"} range={r.f0}
        zones={[[120, "low voice", "var(--ai)"], [200, "mid voice", "var(--matcha)"], [280, "high voice", "var(--gold)"], [350, "very high", "var(--shu)"]]} />}
      {avgF0 > 0 && <Gauge label="Melody (rise & fall inside the word)" value={semis} min={0} max={14} unit=" st" show={semis.toFixed(1) + " semitones"}
        zones={[[2, "flat", "var(--shu)"], [9, "natural", "var(--matcha)"], [14, "very expressive", "var(--gold)"]]} />}
      <Gauge label="Loudness" value={r.db} min={-50} max={0} unit=" dB" show={Math.round(r.db) + " dB"}
        zones={[[-32, "too quiet", "var(--shu)"], [-26, "soft", "var(--gold)"], [-8, "good", "var(--matcha)"], [0, "very loud", "var(--gold)"]]} />
      <Gauge label="Pace (your length ÷ natural length)" value={pace} min={0.3} max={2.5} unit="×" show={pace.toFixed(1) + "×"}
        zones={[[0.7, "fast", "var(--gold)"], [1.4, "natural", "var(--matcha)"], [2.5, "slow", "var(--gold)"]]} />
    </div>
  );
}

function Explain() {
  const s = useSettings();
  const [open, setOpen] = useState(false);
  return (
    <div className="card flat mt12" style={{ padding: 12 }}>
      <button className="row" style={{ width: "100%" }} onClick={() => setOpen(!open)}>
        <Icon name="bulb" size={16} color="var(--gold)" /><b className="sm grow" style={{ textAlign: "left" }}>What do Low / Mid / High mean?</b>{open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>
      {open && (
        <div className="sm mt8" style={{ lineHeight: 1.6 }}>
          <p style={{ margin: "0 0 8px" }}><b>Two different things are measured:</b></p>
          <p style={{ margin: "0 0 8px" }}><b>1. Frequency balance (Low / Mid / High bands)</b> - how your sound energy is spread, like the bass, mid and treble on a speaker.
            <br />• <b>Low</b> (80–500 Hz): the “body” of your voice and the base of every vowel.
            <br />• <b>Mid</b> (500–2000 Hz): what makes あ sound different from お or う.
            <br />• <b>High</b> (2000–6000 Hz): the hiss of s, sh, ts and the brightness of い and え.
            <br />If your High is lower than the reference, your consonants are soft; if Low is much higher, the sound is muffled.</p>
          <p style={{ margin: "0 0 8px" }}><b>2. Voice pitch (Hz)</b> - how fast your vocal cords vibrate: deep voices ≈ 85–155 Hz, higher voices ≈ 165–255 Hz. Everyone is different and that’s fine; what matters in Japanese is the <b>melody</b> - each beat is higher or lower than the one before (pitch accent). The melody chart labels each beat <b>H</b> / <b>M</b> / <b>L</b> within your own range.</p>
          {s.showHindi && <p className="hi" style={{ margin: 0 }}>Low/Mid/High बैंड = आवाज़ का बेस, बीच और तीखापन (स्पीकर के bass/treble जैसा)। Pitch (Hz) = आवाज़ कितनी भारी या पतली है। जापानी में हर अक्षर (mora) ऊँचा या नीचा बोला जाता है - इसे pitch accent कहते हैं।</p>}
        </div>
      )}
    </div>
  );
}

const VOWEL_LABEL: Record<string, string> = { a: "あ", i: "い", u: "う", e: "え", o: "お" };

/** Plots the vowel of every beat you said on the vowel map, next to the Japanese target. */
function VowelMap({ buf, contour, roma, f0 }: { buf: AudioBuffer; contour: number[]; roma: string; f0: [number, number] }) {
  const pk = usePack();
  const x = buf.getChannelData(0), sr = buf.sampleRate;
  const morae = moraeOf(roma);
  const scale = (f0[0] + f0[1]) / 2 > 165 ? 1.15 : 1;
  const targets = pk.vowels.filter((v) => v.lang === "target");
  const first = contour.findIndex((v) => v > 0), last = contour.length - 1 - [...contour].reverse().findIndex((v) => v > 0);
  const hop = sr / 100, n = Math.max(1, morae.length);
  const pts: (VowelPoint & { v: string; tip: string })[] = [];
  if (first >= 0) morae.forEach((m, k) => {
    const v = m.slice(-1); if (!"aiueo".includes(v)) return;
    const a = first + ((last - first + 1) * k) / n, b = first + ((last - first + 1) * (k + 1)) / n;
    const mid = Math.floor(((a + b) / 2) * hop), win = Math.floor(sr * 0.04);
    const est: { f1: number; f2: number }[] = [];
    for (const off of [-win, 0, win]) { const s0 = Math.max(0, mid + off - win / 2); const r = formants(x.subarray(s0, s0 + win), sr); if (r && r.f1 < 1000 && r.f2 < 3000) est.push(r); }
    if (!est.length) return;
    est.sort((p, q) => p.f1 - q.f1); const e = est[est.length >> 1];
    const t = targets.find((q) => q.label.startsWith(VOWEL_LABEL[v]))!;
    const tf1 = t.f1 * scale, tf2 = t.f2 * scale;
    const ok = Math.abs(e.f1 - tf1) < 160 && Math.abs(e.f2 - tf2) < 380;
    let tip = "on target";
    if (!ok) {
      const tips: string[] = [];
      if (e.f1 - tf1 > 160) tips.push("close your mouth a little");
      if (tf1 - e.f1 > 160) tips.push("open your mouth wider");
      if (e.f2 - tf2 > 380) tips.push("pull your tongue back");
      if (tf2 - e.f2 > 380) tips.push(v === "u" ? "keep lips relaxed, tongue more forward" : "move your tongue forward");
      tip = tips.join(", ");
    }
    pts.push({ f1: e.f1, f2: e.f2, label: VOWEL_LABEL[v], target: [tf1, tf2], ok, v: m, tip });
  });
  if (!pts.length) return null;
  return (
    <div className="card flat mt12" style={{ padding: 12 }}>
      <div className="xs mu" style={{ fontWeight: 700 }}>WHERE YOUR VOWELS LAND · each beat on the mouth map</div>
      <div className="xs mu2 mt4">Red circles = Japanese targets · green = your vowel close to target · gold = off target (dashed line shows how far). Up = closed mouth, down = open; left = tongue forward, right = back.</div>
      <div className="mt8"><VowelChart refs={pk.vowels} show={{ target: true, en: false, hi: false }} scale={scale} points={pts} height={240} /></div>
      <div className="mt8">
        {pts.map((p, i) => (
          <div key={i} className="row sm" style={{ padding: "3px 0" }}>
            <span className="tag" style={{ background: p.ok ? "var(--matcha)" : "var(--gold)", color: "#fff", minWidth: 44, justifyContent: "center" }}>{p.v}</span>
            <span className="grow">{p.ok ? "Good - on the target" : p.tip}</span>
            <span className="xs mu2">F1 {Math.round(p.f1)} · F2 {Math.round(p.f2)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
