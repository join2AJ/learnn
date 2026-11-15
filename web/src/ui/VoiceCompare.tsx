import { useEffect, useRef, useState } from "react";
import { Mic, Play, RotateCcw, Volume2 } from "lucide-react";
import { bandProfile, expectedDuration, pitchTrack, playBuffer, renderSpectrogram, synthWord, trimSilence } from "../core/dsp";
import { closeMic, openMic, record, toBuffer } from "../core/mic";
import { emitUi, getProgress, toast, updateProgress, bumpDay, VoiceRec } from "../core/store";
import { award, checkBadges } from "../core/rewards";
import { speak } from "../core/native";
import { romaji } from "../packs/ja/verbs";
import { usePack } from "../pack";
import { tap } from "./kit";

/** Small 🎙 button: opens the record-and-compare sheet for any text. */
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

type Result = VoiceRec & { mine: AudioBuffer; contour: number[] };

export default function VoiceCompare({ text, ro, en }: { text: string; ro?: string; en?: string }) {
  const pk = usePack();
  const roma = (ro || romaji(text)).replace(/[^a-zA-Zāīūēō' ]/g, " ").trim();
  const refCv = useRef<HTMLCanvasElement>(null);
  const myCv = useRef<HTMLCanvasElement>(null);
  const refBuf = useRef<AudioBuffer | null>(null);
  const [refBands, setRefBands] = useState<[number, number, number]>([0.4, 0.35, 0.25]);
  const [state, setState] = useState<"idle" | "rec" | "done">("idle");
  const [count, setCount] = useState(0);
  const [res, setRes] = useState<Result | null>(null);
  const exp = expectedDuration(roma);
  const recSec = Math.min(6, Math.max(2, exp * 1.8 + 0.8));
  const history = (getProgress().voiceLog || []).filter((v) => v.w === text).slice(-5);

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

  const go = async () => {
    tap(20);
    const m = await openMic(); if (!m) return;
    setState("rec"); setRes(null);
    setCount(Math.ceil(recSec));
    const iv = window.setInterval(() => setCount((c) => Math.max(0, c - 1)), 1000);
    const { data, sr } = await record(m, recSec);
    window.clearInterval(iv); closeMic(m);
    const cut = trimSilence(data, sr);
    if (!cut || cut.length < sr * 0.15) { setState("idle"); toast("I couldn’t hear you — hold the phone closer and speak loudly.", "warn"); return; }
    const { bands, db } = bandProfile(cut, sr);
    const { contour, range } = pitchTrack(cut, sr);
    const dur = cut.length / sr;
    const bandDiff = bands.reduce((a, b, i) => a + Math.abs(b - refBands[i]), 0);
    const loud = db < -32 ? 0.6 : db < -26 ? 0.85 : 1;
    const pace = Math.min(dur, exp) / Math.max(dur, exp);
    const score = Math.round(Math.max(0, Math.min(1, (1 - bandDiff * 1.6) * 0.55 + loud * 0.25 + pace * 0.2)) * 100);
    const rec: VoiceRec = { t: Date.now(), w: text, bands, ref: refBands, db, dur, exp, f0: range, score };
    updateProgress((p) => { p.voiceLog = [...(p.voiceLog || []), rec].slice(-300); bumpDay(p, (d) => { d.spoke = (d.spoke || 0) + 1; }); });
    award(3); checkBadges();
    setRes({ ...rec, mine: toBuffer(cut, sr), contour });
    setState("done");
    requestAnimationFrame(() => { const c = myCv.current; if (c) { c.width = 320; c.height = 120; renderSpectrogram(c, cut, sr, 6000); } });
  };

  const tips: string[] = [];
  if (res) {
    if (res.db < -32) tips.push("🔊 Too quiet — speak LOUDER, from your chest. Loud practice builds confidence and clearer sounds.");
    else if (res.db < -26) tips.push("🔉 A bit soft — a little louder will sound more confident.");
    else tips.push("💪 Great volume.");
    if (res.dur > res.exp * 1.6) tips.push("🐢 Slower than natural — keep every beat short and even.");
    else if (res.dur < res.exp * 0.6) tips.push("⚡ Very fast — give each mora its own beat.");
    else tips.push("⏱️ Good pace.");
    const d = res.bands.map((b, i) => b - res.ref[i]);
    if (d[2] < -0.05) tips.push("✨ High band is weak — make s / sh / ts and い・え crisper.");
    if (d[0] > 0.06) tips.push("🎚️ Lots of low energy — open your mouth more and push the sound forward.");
    if (res.f0[1] && res.f0[1] / Math.max(1, res.f0[0]) < 1.12 && res.exp > 0.4) tips.push("🎵 Very flat melody — Japanese words rise and fall (pitch accent). Copy the voice’s ups and downs.");
  }

  return (
    <div>
      <div className="row top">
        <div className="grow">
          <div className="kicker">Record & compare</div>
          <div className="jp" style={{ fontSize: text.length > 10 ? 22 : 32, fontWeight: 700, lineHeight: 1.3 }}>{text}</div>
          <div className="sm mu">{roma}{en ? " · " + en : ""}</div>
        </div>
        <button className="say" onClick={() => speak(text, { lang: pk.ttsLang, rate: 0.85 })} aria-label="Listen"><Volume2 size={18} /></button>
      </div>

      <div className="grid2 mt12" style={{ gap: 8 }}>
        <div>
          <div className="xs mu" style={{ fontWeight: 700 }}>Reference (synthetic) <button className="xs" style={{ color: "var(--shu)", fontWeight: 700 }} onClick={() => refBuf.current && playBuffer(refBuf.current)}>▶ tone</button></div>
          <canvas ref={refCv} className="spectro mt4" style={{ height: 90 }} />
        </div>
        <div>
          <div className="xs mu" style={{ fontWeight: 700 }}>You {res && <button className="xs" style={{ color: "var(--shu)", fontWeight: 700 }} onClick={() => playBuffer(res.mine)}>▶ play</button>}</div>
          <canvas ref={myCv} className="spectro mt4" style={{ height: 90, opacity: res ? 1 : 0.35 }} />
        </div>
      </div>

      <button className={"btn lg block mt12 " + (state === "rec" ? "dark" : "primary")} onClick={go} disabled={state === "rec"}>
        {state === "rec" ? <>● Recording… {count}s — say it now, loudly</> : state === "done" ? <><RotateCcw size={17} /> Record again</> : <><Mic size={18} /> Record me ({recSec.toFixed(1)}s)</>}
      </button>

      {res && (
        <div className="mt12">
          <div className="row"><div style={{ fontSize: 34, fontWeight: 800, color: res.score >= 70 ? "var(--matcha)" : res.score >= 50 ? "var(--gold)" : "var(--shu)" }}>{res.score}</div>
            <div className="grow sm"><b>{res.score >= 75 ? "すごい！ Very close" : res.score >= 55 ? "いいね！ Getting there" : "Keep going — listen & repeat"}</b><div className="xs mu">Sound-shape match · volume · pace</div></div>
            <button className="btn sm" onClick={() => playBuffer(res.mine)}><Play size={14} /> Mine</button></div>

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
            <div className="row xs mu gap16"><span>🟩 you</span><span>⬜ reference</span></div>
          </div>

          <div className="grid3 mt8">
            <div className="stat"><div className="v" style={{ fontSize: 19 }}>{Math.round(res.db)} dB</div><div className="k">Loudness {res.db >= -26 ? "✓" : "↑"}</div></div>
            <div className="stat"><div className="v" style={{ fontSize: 19 }}>{res.dur.toFixed(1)}s</div><div className="k">Length (≈{res.exp.toFixed(1)}s)</div></div>
            <div className="stat"><div className="v" style={{ fontSize: 19 }}>{res.f0[0] ? Math.round(res.f0[0]) + "–" + Math.round(res.f0[1]) : "–"}</div><div className="k">Pitch Hz</div></div>
          </div>
          {res.contour.some((x) => x > 0) && <Contour c={res.contour} />}
          <div className="feedback ok" style={{ background: "var(--surface-2)" }}>{tips.map((t) => <div key={t} className="sm" style={{ padding: "2px 0" }}>{t}</div>)}</div>
        </div>
      )}

      {history.length > 0 && (
        <div className="xs mu mt12">Your recent scores for this: {history.map((h) => h.score).join(" → ")}</div>
      )}
      <div className="xs mu2 mt8" style={{ lineHeight: 1.45 }}>The reference is generated from the sounds of the word (not a recording of a native speaker), so use it for the overall shape: vowels in the low/mid bands, s/sh/ts hiss up high. Always copy the 🔊 voice for the real sound.</div>
    </div>
  );
}

function Contour({ c }: { c: number[] }) {
  const v = c.filter((x) => x > 0); const lo = Math.min(...v), hi = Math.max(...v);
  const W = 320, H = 54; let d = "", pen = false;
  c.forEach((x, i) => { if (!x) { pen = false; return; } const px = (i / Math.max(1, c.length - 1)) * W, py = H - 6 - ((x - lo) / Math.max(1, hi - lo)) * (H - 12); d += (pen ? "L" : "M") + px.toFixed(1) + "," + py.toFixed(1); pen = true; });
  return (
    <div className="mt8">
      <div className="xs mu" style={{ fontWeight: 700 }}>YOUR MELODY (pitch over time)</div>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ background: "var(--surface-2)", borderRadius: 12, marginTop: 4 }}><path d={d} fill="none" stroke="var(--matcha)" strokeWidth="3" strokeLinecap="round" /></svg>
    </div>
  );
}
