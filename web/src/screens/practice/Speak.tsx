import { useEffect, useMemo, useState } from "react";
import { AudioLines, Mic, SkipForward, ThumbsUp } from "lucide-react";
import { go } from "../../core/router";
import { updateProgress, useProgress, useSettings } from "../../core/store";
import { award } from "../../core/rewards";
import { listen, speak, speechSupported, stopListening } from "../../core/native";
import { usePack } from "../../pack";
import { toHira } from "../../packs/ja/kana";
import { Header, pick, Say, Seg, shuffle, tap } from "../../ui/kit";

const norm = (s: string) => toHira(s).replace(/[\s、。！？!?,.・「」『』〜~]/g, "").toLowerCase();
function lev(a: string, b: string) {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[a.length][b.length];
}
export function matchScore(heard: string[], targets: string[]) {
  let best = 0;
  for (const h of heard) for (const t of targets) {
    const a = norm(h), b = norm(t);
    if (!a || !b) continue;
    if (a === b || a.includes(b)) return 1;
    best = Math.max(best, 1 - lev(a, b) / Math.max(a.length, b.length));
  }
  return best;
}

type Item = { jp: string; alt: string[]; ro: string; en: string; hi?: string };

export default function Speak() {
  const pk = usePack();
  const s = useSettings();
  const p = useProgress();
  const [mode, setMode] = useState<"phrases" | "words">("phrases");
  const items = useMemo<Item[]>(() => mode === "phrases"
    ? shuffle(pk.phrases.flatMap((g) => g.items.filter((i) => !i.jp.includes("/")).map((i) => ({ jp: i.jp, alt: [i.jp], ro: i.ro, en: i.en, hi: i.hi }))))
    : shuffle(pk.words.filter((w) => w.n <= Math.max(150, p.known.length + 50)).map((w) => ({ jp: w.w, alt: [w.w, w.r], ro: w.ro, en: w.m, hi: w.h }))), [mode, pk]); // eslint-disable-line
  const [idx, setIdx] = useState(0);
  const [state, setState] = useState<"idle" | "listening" | "done">("idle");
  const [heard, setHeard] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [err, setErr] = useState("");
  const item = items[idx % items.length];
  const supported = speechSupported();

  useEffect(() => () => stopListening(), []);
  useEffect(() => { setState("idle"); setHeard([]); setErr(""); }, [idx, mode]);

  const start = () => {
    tap(20); setErr(""); setHeard([]); setState("listening");
    listen(pk.ttsLang, (e) => {
      if (e.type === "partial" && e.texts) setHeard(e.texts);
      else if (e.type === "result" && e.texts) {
        setHeard(e.texts);
        const sc = matchScore(e.texts, item.alt);
        setScore(sc); setState("done");
        const ok = sc >= 0.75;
        updateProgress((x) => { x.speak = { ok: x.speak.ok + (ok ? 1 : 0), tries: x.speak.tries + 1 }; });
        if (ok) { award(8); speak(pick(pk.praise).jp, { lang: pk.ttsLang }); }
      } else if (e.type === "error") { setErr(String(e.error || "Didn’t catch that")); setState("idle"); }
      else if (e.type === "end") setState((st) => (st === "listening" ? "idle" : st));
    });
  };

  const ok = state === "done" && score >= 0.75;
  return (
    <div className="screen">
      <Header title="Speak aloud" sub={p.speak.ok + " correct of " + p.speak.tries + " tries"} backTo="/practice" />
      <Seg value={mode} options={[["phrases", "Phrases"], ["words", "Words"]]} onChange={(v) => { setMode(v); setIdx(0); }} />

      <div className="card hero mt16 center" style={{ padding: 24 }}>
        <div className="kicker">Say this out loud</div>
        <div className="jp" style={{ fontSize: item.jp.length > 10 ? 26 : 38, fontWeight: 700, margin: "8px 0 4px", lineHeight: 1.3 }}>{item.jp}</div>
        {s.showRomaji && <div className="mu">{item.ro}</div>}
        <div style={{ fontWeight: 700, marginTop: 4 }}>{item.en}</div>
        {s.showHindi && item.hi && <div className="hi">{item.hi}</div>}
        <div className="row mt12" style={{ justifyContent: "center" }}><Say text={item.jp} /><Say text={item.jp} slow /></div>
      </div>

      <div className="center mt24">
        <button className={"mic-btn" + (state === "listening" ? " on" : "")} aria-label="Start speaking" onClick={() => (state === "listening" ? stopListening() : start())} disabled={!supported}>
          <Mic size={40} />
        </button>
        <div className="sm mu mt12">{!supported ? "Speech recognition isn’t available on this device." : state === "listening" ? "Listening… speak clearly and loudly" : "Tap the mic, then speak"}</div>
      </div>

      {heard.length > 0 && (
        <div className={"feedback " + (state === "done" ? (ok ? "ok" : "bad") : "")} style={state !== "done" ? { background: "var(--surface-2)" } : undefined}>
          <div className="kicker">I heard</div>
          <div className="jp lg" style={{ fontWeight: 700 }}>{heard[0]}</div>
          {state === "done" && <div className="mt8"><b>{ok ? "✅ " + pick(pk.praise).jp + " Match " + Math.round(score * 100) + "%" : "Close — " + Math.round(score * 100) + "% match. Listen again and copy the rhythm."}</b></div>}
        </div>
      )}
      {err && <div className="feedback bad"><b>Didn’t catch that.</b><div className="sm">{err === "no-speech" || err.includes("7") ? "No speech detected — try again a bit louder." : err}</div></div>}

      <div className="row mt16">
        <button className="btn grow" onClick={() => { tap(); setIdx(idx + 1); }}><SkipForward size={16} /> Next</button>
        {!supported && <button className="btn grow" onClick={() => { award(2); setIdx(idx + 1); }}><ThumbsUp size={16} /> I said it</button>}
        <button className="btn grow" onClick={() => go("/lab")}><AudioLines size={16} /> Sound Lab</button>
      </div>
      <div className="card flat mt16 sm mu" style={{ background: "transparent", lineHeight: 1.55 }}>
        Uses your phone’s speech recognition in Japanese (Google). If it says “not available”, install Japanese in Settings → System → Languages → On-device speech recognition, or check your internet connection.
      </div>
    </div>
  );
}
