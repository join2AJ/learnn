import { ReactNode, useEffect, useMemo, useState } from "react";
import { RotateCcw, Volume2 } from "lucide-react";
import { go } from "../../core/router";
import { getProgress, updateProgress, useSettings } from "../../core/store";
import { award, recordAnswer } from "../../core/rewards";
import { speak } from "../../core/native";
import type { LanguagePack, LetterCell, Word } from "../../core/types";
import { usePack } from "../../pack";
import { Bar, Header, pick, Say, shuffle, tap } from "../../ui/kit";

interface Q {
  prompt: ReactNode;
  speakText?: string;
  autoSpeak?: boolean;
  options: { label: ReactNode; key: string; jp?: boolean }[];
  answer: string;
  explain?: ReactNode;
  onResult?: (ok: boolean) => void;
  build?: { tokens: string[]; answer: string[] };
}

const TITLES: Record<string, string> = { kana: "Kana sprint", listen: "Listening", meaning: "Meaning match", reverse: "Say it in Japanese", particle: "Particle fill-in", build: "Sentence builder", verb: "Verb forms" };
const N = 10;

function wordPool(pk: LanguagePack) {
  const known = new Set(getProgress().known);
  const size = Math.max(120, known.size + 60);
  return pk.words.filter((w) => w.n <= size && w.t !== "expr" && w.m.length < 40);
}
const distract = <T,>(pool: T[], ans: T, n: number, key: (t: T) => string) => {
  const out = new Map<string, T>([[key(ans), ans]]);
  let guard = 0;
  while (out.size < n && guard++ < 200) { const x = pick(pool); out.set(key(x), x); }
  return shuffle(Array.from(out.values()));
};

function makeQuestions(mode: string, set: string, pk: LanguagePack, hindi: boolean): Q[] {
  const H = (w: Word) => (hindi ? <div className="hi xs" style={{ fontWeight: 500 }}>{w.h}</div> : null);
  if (mode === "kana") {
    const a = pk.alphabets.find((x) => x.id === set) || pk.alphabets[0];
    const cells = a.groups.flatMap((g) => g.rows.flatMap((r) => r.cells.filter(Boolean) as LetterCell[]));
    const p = getProgress();
    // weight weak and unseen kana higher, favour the basic 46 at first
    const weighted = cells.flatMap((c, i) => { const st = p.kana[c.ch]; const w = !st ? 3 : st.w >= st.c ? 4 : st.c < 3 ? 2 : 1; return Array(i < 46 || a.id === "kanji" ? w : 1).fill(c); });
    const chosen: LetterCell[] = [];
    let guard = 0;
    while (chosen.length < N && guard++ < 500) { const c = pick(weighted); if (!chosen.includes(c)) chosen.push(c); }
    return chosen.map((c, i) => {
      const rec = (ok: boolean) => updateProgress((x) => { const k = x.kana[c.ch] || { c: 0, w: 0 }; x.kana[c.ch] = ok ? { c: k.c + 1, w: k.w } : { c: k.c, w: k.w + 1 }; });
      const reverse = a.id !== "kanji" && i % 3 === 2;
      const opts = distract(cells, c, 4, (x) => x.rom);
      return reverse
        ? { prompt: <div style={{ fontSize: 56, fontWeight: 800 }}>{c.rom}</div>, speakText: c.ch, autoSpeak: true, answer: c.ch, options: opts.map((o) => ({ key: o.ch, label: o.ch, jp: true })), onResult: rec, explain: <span><span className="jp">{c.ch}</span> = {c.rom}{hindi && c.hint ? " = " + c.hint : ""}</span> }
        : { prompt: <div className={a.id === "kanji" ? "qbig serif" : "qbig"}>{c.ch}</div>, speakText: c.ch, answer: c.rom, options: opts.map((o) => ({ key: o.rom, label: a.id === "kanji" ? o.hint?.split(" · ")[0] : o.rom })), onResult: rec, explain: <span><span className="jp">{c.ch}</span> = {c.rom}{hindi && c.hint ? " · " + c.hint : ""}</span> };
    });
  }
  if (mode === "particle") {
    return shuffle(pk.particleQuiz).slice(0, N).map((x) => ({
      prompt: <div className="jp" style={{ fontSize: 28, lineHeight: 1.5 }}>{x.before}<span style={{ display: "inline-block", minWidth: 44, borderBottom: "3px solid var(--shu)", margin: "0 4px" }}>&nbsp;</span>{x.after}</div>,
      speakText: x.before + x.answer + x.after, answer: x.answer, options: shuffle(x.options).map((o) => ({ key: o, label: o, jp: true })),
      explain: <span><span className="jp">{x.before}<b style={{ color: "var(--shu)" }}>{x.answer}</b>{x.after}</span> — {x.en}</span>,
    }));
  }
  if (mode === "build") {
    return shuffle(pk.sentenceBuilder).slice(0, 8).map((x) => ({
      prompt: <div><div style={{ fontSize: 20, fontWeight: 800 }}>{x.en}</div>{hindi && <div className="hi">{x.hi}</div>}</div>,
      speakText: x.jp.join(""), answer: x.jp.join("|"), options: [], build: { tokens: shuffle(x.jp), answer: x.jp },
      explain: <span><span className="jp">{x.jp.join(" ")}</span> · {x.ro}</span>,
    }));
  }
  if (mode === "verb") {
    const verbs = pk.words.filter((w) => w.n <= 400 && pk.conjugate?.(w));
    const keys = ["masu", "nai", "ta", "mashita", "te", "teiru", "tai", "masen", "nakatta", "pot"];
    return Array.from({ length: N }, () => {
      const v = pick(verbs); const forms = pk.conjugate!(v)!; const k = pick(keys); const f = forms.find((x) => x.key === k)!;
      const others = shuffle(forms.filter((x) => x.jp !== f.jp && x.key !== "dict")).slice(0, 3);
      return {
        prompt: <div><div className="jp" style={{ fontSize: 40, fontWeight: 700 }}>{v.w}</div><div className="mu">{v.m}</div><div className="tag mt8" style={{ background: "var(--ai)", color: "#fff", height: 28, fontSize: 13 }}>→ {f.label}</div></div>,
        speakText: f.jp, answer: f.jp, options: shuffle([f, ...others]).map((o) => ({ key: o.jp, label: o.jp, jp: true })),
        explain: <span><span className="jp">{f.jp}</span> ({f.ro}) — {f.en}</span>,
      };
    });
  }
  const pool = wordPool(pk);
  const chosen = shuffle(pool).slice(0, N);
  return chosen.map((w) => {
    const opts = distract(pool, w, 4, (x) => x.m);
    if (mode === "listen") return {
      prompt: <div className="mu">Listen and choose the meaning</div>, speakText: w.r, autoSpeak: true, answer: w.m,
      options: opts.map((o) => ({ key: o.m, label: <div><div>{o.m}</div>{H(o)}</div> })), explain: <span><span className="jp">{w.w}</span> ({w.r} · {w.ro}) = {w.m}</span>,
    };
    if (mode === "reverse") return {
      prompt: <div><div style={{ fontSize: 26, fontWeight: 800 }}>{w.m}</div>{hindi && <div className="hi lg">{w.h}</div>}</div>, speakText: w.r, answer: w.w,
      options: opts.map((o) => ({ key: o.w, label: <div><div>{o.w}</div><div className="xs mu2" style={{ fontFamily: "var(--font)" }}>{o.r !== o.w ? o.r : ""}</div></div>, jp: true })), explain: <span><span className="jp">{w.w}</span> ({w.ro}) = {w.m}</span>,
    };
    return {
      prompt: <div><div className="jp" style={{ fontSize: 48, fontWeight: 600 }}>{w.w}</div><div className="mu jp">{w.r !== w.w ? w.r : ""}</div></div>, speakText: w.r, answer: w.m,
      options: opts.map((o) => ({ key: o.m, label: <div><div>{o.m}</div>{H(o)}</div> })), explain: <span><span className="jp">{w.w}</span> · {w.ro} = {w.m}</span>,
    };
  });
}

export default function Quiz({ mode, set }: { mode: string; set: string }) {
  const pk = usePack();
  const s = useSettings();
  const [seed, setSeed] = useState(0);
  const qs = useMemo(() => makeQuestions(mode, set, pk, s.showHindi), [mode, set, pk, seed]); // eslint-disable-line
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [built, setBuilt] = useState<number[]>([]);
  const q = qs[i];
  const done = i >= qs.length;

  useEffect(() => { if (q?.autoSpeak && q.speakText) speak(q.speakText, { lang: pk.ttsLang, rate: s.rate }); }, [i, seed]); // eslint-disable-line
  useEffect(() => {
    if (!done) return;
    updateProgress((x) => { x.quiz.best = Math.max(x.quiz.best, Math.round((score / qs.length) * 10)); });
    award(score === qs.length ? 15 : 5);
    speak(score >= qs.length * 0.8 ? pick(pk.praise).jp : "頑張って！", { lang: pk.ttsLang });
  }, [done]); // eslint-disable-line

  const answer = (key: string) => {
    if (picked !== null) return;
    const ok = key === q.answer;
    tap(ok ? 10 : 30);
    setPicked(key);
    recordAnswer(ok);
    q.onResult?.(ok);
    if (ok) { setScore((x) => x + 1); setStreak((x) => x + 1); award(streak >= 4 ? 4 : 2); }
    else setStreak(0);
    if (!q.autoSpeak && q.speakText) speak(q.speakText, { lang: pk.ttsLang, rate: s.rate });
  };
  const next = () => { tap(); setPicked(null); setBuilt([]); setI(i + 1); };
  const restart = () => { setSeed(seed + 1); setI(0); setScore(0); setPicked(null); setStreak(0); setBuilt([]); };

  if (!q && !done) return <div className="screen"><Header title="Quiz" backTo="/practice" /><div className="empty-state">No questions available.</div></div>;

  if (done) {
    const pct = score / qs.length;
    return (
      <div className="screen">
        <Header title={TITLES[mode]} backTo="/practice" />
        <div className={"card hero center " + (pct >= 0.8 ? "tint-matcha" : pct >= 0.5 ? "tint-ai" : "tint-shu")}>
          <div style={{ fontSize: 56 }}>{pct === 1 ? "🏆" : pct >= 0.8 ? "🌟" : pct >= 0.5 ? "💪" : "🌱"}</div>
          <div className="jp" style={{ fontSize: 24, fontWeight: 800 }}>{pct >= 0.8 ? pick(pk.praise).jp : "頑張って！"}</div>
          <div style={{ fontSize: 40, fontWeight: 800 }}>{score} / {qs.length}</div>
          <div className="sm mu">{pct === 1 ? "Perfect round! +15 XP bonus" : pct >= 0.8 ? "Excellent — you’re ready for more." : "Every mistake is a future right answer. Try again!"}</div>
          <div className="row mt16" style={{ justifyContent: "center" }}>
            <button className="btn white" onClick={restart}><RotateCcw size={16} /> Again</button>
            <button className="btn ghost" style={{ color: "#fff", boxShadow: "inset 0 0 0 1.5px rgba(255,255,255,.5)" }} onClick={() => go("/practice")}>Done</button>
          </div>
        </div>
      </div>
    );
  }

  const ok = picked !== null && picked === q.answer;
  return (
    <div className="screen">
      <Header title={TITLES[mode] || "Quiz"} sub={"Question " + (i + 1) + " of " + qs.length + (streak >= 3 ? " · 🔥 " + streak + " streak" : "")} backTo="/practice" />
      <Bar pct={i / qs.length} />
      <div className="card mt16 center" style={{ minHeight: 180, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8 }}>
        {q.prompt}
        {q.speakText && (q.autoSpeak || picked !== null) && (
          <button className="btn sm" onClick={() => speak(q.speakText!, { lang: pk.ttsLang, rate: s.rate })}><Volume2 size={16} /> {picked === null ? "Play again" : "Hear it"}</button>
        )}
      </div>

      {q.build ? <Builder q={q} built={built} setBuilt={setBuilt} picked={picked} onCheck={(key) => answer(key)} /> : (
        <div className={"opts mt16" + (mode === "listen" || mode === "meaning" ? " one" : "")}>
          {q.options.map((o) => (
            <button key={o.key} className={"opt" + (o.jp ? " jp" : "") + (picked === null ? "" : o.key === q.answer ? " ok" : o.key === picked ? " bad" : " dim")} onClick={() => answer(o.key)}>{o.label}</button>
          ))}
        </div>
      )}

      {picked !== null && (
        <div className={"feedback " + (ok ? "ok" : "bad")}>
          <div className="row"><b className="grow">{ok ? pick(pk.praise).jp + " " + (streak >= 3 ? "🔥" : "") : "Almost!"}</b>{q.speakText && <Say text={q.speakText} size="s" />}</div>
          {q.explain && <div className="sm mt4">{q.explain}</div>}
          <button className="btn primary block mt12" onClick={next}>{i + 1 < qs.length ? "Next" : "See results"}</button>
        </div>
      )}
    </div>
  );
}

function Builder({ q, built, setBuilt, picked, onCheck }: { q: Q; built: number[]; setBuilt: (b: number[]) => void; picked: string | null; onCheck: (k: string) => void }) {
  const toks = q.build!.tokens;
  return (
    <div className="mt16">
      <div className="slot">{built.length ? built.map((ti, j) => <button key={j} className="token" onClick={() => picked === null && setBuilt(built.filter((_, k) => k !== j))}>{toks[ti]}</button>) : <span className="sm mu2" style={{ padding: "0 6px" }}>Tap the words in the right order…</span>}</div>
      <div className="row wrap mt12" style={{ justifyContent: "center" }}>
        {toks.map((t, ti) => <button key={ti} className={"token" + (built.includes(ti) ? " used" : "")} onClick={() => { tap(); setBuilt([...built, ti]); }}>{t}</button>)}
      </div>
      {picked === null && <button className="btn primary block mt16" disabled={built.length !== toks.length} onClick={() => onCheck(built.map((b) => toks[b]).join("|"))}>Check</button>}
    </div>
  );
}
