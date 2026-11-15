import { useEffect, useState } from "react";
import { ArrowRight, CheckCircle2, Clock, PlayCircle } from "lucide-react";
import { go } from "../../core/router";
import { updateProgress, useProgress, useSettings } from "../../core/store";
import { award, recordAnswer } from "../../core/rewards";
import { openExternal, speak } from "../../core/native";
import type { Example, LessonBlock } from "../../core/types";
import { usePack } from "../../pack";
import { Bar, Header, Jp, Md, pick, Say, tap } from "../../ui/kit";
import { RecBtn } from "../../ui/VoiceCompare";

export function GrammarList() {
  const pk = usePack();
  const p = useProgress();
  const units = Array.from(new Set(pk.lessons.map((l) => l.unit)));
  const done = Object.keys(p.lessons).length;
  return (
    <div className="screen">
      <Header title="Grammar course" sub={done + " of " + pk.lessons.length + " lessons complete"} backTo="/learn" />
      <div className="card hero tint-ai">
        <div className="watermark">文</div>
        <div className="kicker">Built for speed</div>
        <div style={{ fontWeight: 800, fontSize: 18, margin: "4px 0 6px" }}>Each lesson: 5–10 minutes, real examples with audio, English + Hindi comparison, and a 3-question check.</div>
        <Bar pct={done / pk.lessons.length} white />
      </div>
      {units.map((u) => (
        <div key={u}>
          <div className="section-title"><h2>Unit {u}</h2></div>
          <div className="list">
            {pk.lessons.filter((l) => l.unit === u).map((l) => (
              <button key={l.id} className="li" onClick={() => go("/learn/grammar/" + l.id)}>
                <span className={"ico " + (p.lessons[l.id] ? "soft-matcha" : "soft-ai")}>
                  {p.lessons[l.id] ? <CheckCircle2 size={20} color="var(--matcha)" /> : <span className="jp" style={{ fontSize: 16, fontWeight: 700, color: "var(--ai)" }}>{l.jp.replace(/[・と]/g, "").slice(0, 1)}</span>}
                </span>
                <span className="grow"><div className="t">{l.title}</div><div className="d">{l.summary}</div></span>
                <span className="xs mu2 row gap4"><Clock size={12} />{l.minutes}m</span>
              </button>
            ))}
          </div>
        </div>
      ))}
      <button className="card tap mt16" onClick={() => go("/learn/verbs")}>
        <div className="row"><div className="grow"><div style={{ fontWeight: 800 }}>Verb conjugator</div><div className="sm mu">See all 20 forms of any verb — present, past, negative, て, potential…</div></div><ArrowRight size={18} /></div>
      </button>
    </div>
  );
}

export function ExampleRow({ e }: { e: Example }) {
  const s = useSettings();
  return (
    <div className="ex">
      <div className="grow">
        <div className="j">{e.jp}</div>
        {s.showRomaji && <div className="r">{e.ro}</div>}
        <div className="e">{e.en}</div>
        {s.showHindi && e.hi && <div className="hi sm">{e.hi}</div>}
        {e.note && <div className="xs mu mt4">💡 {e.note}</div>}
      </div>
      <div className="col gap6"><Say text={e.jp} size="s" /><Say text={e.jp} size="s" slow /><RecBtn text={e.jp} ro={e.ro} en={e.en} /></div>
    </div>
  );
}

function Block({ b }: { b: LessonBlock }) {
  const s = useSettings();
  switch (b.kind) {
    case "text": return <div className="card prose">{b.title && <b>{b.title}</b>}<p><Md text={b.text!} /></p></div>;
    case "pattern": return <div className="card">{b.title && <div className="kicker">{b.title}</div>}<div className="pattern mt4"><Jp text={b.text!} /></div></div>;
    case "tip": return <div className="card soft-gold" style={{ boxShadow: "none" }}><div className="kicker">💡 Tip</div><div className="sm mt4" style={{ lineHeight: 1.6 }}><Md text={b.text!} /></div></div>;
    case "table": return (
      <div className="card">{b.title && <div style={{ fontWeight: 800, marginBottom: 8 }}>{b.title}</div>}
        <div className="tbl-wrap"><table className="tbl"><thead><tr>{b.head!.map((h, i) => <th key={i}>{h}</th>)}</tr></thead>
          <tbody>{b.rows!.map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j}><Jp text={c} /></td>)}</tr>)}</tbody></table></div></div>);
    case "examples": return <div className="card"><div className="kicker">Examples · tap 🔊 to hear, 🐢 for slow</div>{b.examples!.map((e) => <ExampleRow key={e.jp} e={e} />)}</div>;
    case "compare": return (
      <div className="card">{<div style={{ fontWeight: 800, marginBottom: 8 }}>{b.title || "Compare"}</div>}
        <div className="cmp">
          <div style={{ background: "var(--ai-soft)" }}><span className="flag">🇬🇧</span><span><Jp text={b.compare!.en} /></span></div>
          {s.showHindi && <div style={{ background: "var(--gold-soft)" }}><span className="flag">🇮🇳</span><span><Jp text={b.compare!.hi} /></span></div>}
          <div style={{ background: "var(--shu-soft)" }}><span className="flag">🇯🇵</span><span><Jp text={b.compare!.jp} /></span></div>
        </div></div>);
  }
  return null;
}

export function LessonView({ id }: { id: string }) {
  const pk = usePack();
  const p = useProgress();
  const idx = pk.lessons.findIndex((l) => l.id === id);
  const l = pk.lessons[idx];
  const [qi, setQi] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  useEffect(() => { setQi(0); setPicked(null); setScore(0); setFinished(false); }, [id]);
  if (!l) return <div className="screen"><Header title="Lesson not found" backTo="/learn/grammar" /></div>;
  const q = l.quiz[qi];
  const next = pk.lessons[idx + 1];

  const answer = (i: number) => {
    if (picked !== null) return;
    tap();
    setPicked(i);
    const ok = i === q.answer;
    recordAnswer(ok);
    if (ok) { setScore((x) => x + 1); award(3); }
  };
  const advance = () => {
    if (qi + 1 < l.quiz.length) { setQi(qi + 1); setPicked(null); return; }
    setFinished(true);
    const first = !p.lessons[l.id];
    updateProgress((x) => { x.lessons[l.id] = Date.now(); });
    award(first ? 20 : 5);
    const pr = pick(pk.praise);
    speak(pr.jp, { lang: pk.ttsLang });
  };

  return (
    <div className="screen">
      <Header title={l.title} sub={<span>{l.unit} · {l.minutes} min · <span className="jp">{l.jp}</span></span>} backTo="/learn/grammar"
        right={p.lessons[l.id] ? <CheckCircle2 color="var(--matcha)" /> : undefined} />
      <div className="card soft-ai" style={{ boxShadow: "none" }}><div className="sm" style={{ fontWeight: 600 }}>{l.summary}</div></div>
      {l.blocks.map((b, i) => <Block key={i} b={b} />)}
      {l.video && <button className="link-row mt12" onClick={() => openExternal("https://www.youtube.com/results?search_query=" + encodeURIComponent(l.video!))}>
        <span className="yt"><PlayCircle size={22} /></span><span className="grow"><div style={{ fontWeight: 700 }}>Watch on YouTube</div><div className="xs mu">“{l.video}”</div></span><ArrowRight size={16} />
      </button>}

      <div className="section-title"><h2>Check yourself</h2><span className="mu">{finished ? score + "/" + l.quiz.length : (qi + 1) + "/" + l.quiz.length}</span></div>
      {!finished ? (
        <div className="card">
          <div style={{ fontWeight: 700, fontSize: 16 }}><Jp text={q.q} /></div>
          <div className={"opts mt12" + (q.options.some((o) => o.length > 14) ? " one" : "")}>
            {q.options.map((o, i) => (
              <button key={i} className={"opt" + (picked === null ? "" : i === q.answer ? " ok" : i === picked ? " bad" : " dim")} style={{ fontSize: 15 }} onClick={() => answer(i)}><span className="jp">{o}</span></button>
            ))}
          </div>
          {picked !== null && (
            <div className={"feedback " + (picked === q.answer ? "ok" : "bad")}>
              <b>{picked === q.answer ? pick(pk.praise).jp + " Correct." : "Not quite — answer: " + q.options[q.answer]}</b>
              {q.explain && <div className="sm mt4">{q.explain}</div>}
              <button className="btn primary block mt12" onClick={advance}>{qi + 1 < l.quiz.length ? "Next question" : "Finish lesson"}</button>
            </div>
          )}
        </div>
      ) : (
        <div className="card center tint-matcha">
          <div style={{ fontSize: 44 }}>{score === l.quiz.length ? "🏆" : "✅"}</div>
          <div style={{ fontWeight: 800, fontSize: 20 }}>Lesson complete · {score}/{l.quiz.length}</div>
          <div className="sm mu mt4">Say each example out loud once more — speaking is what makes it stick.</div>
          {next ? <button className="btn white block mt16" onClick={() => go("/learn/grammar/" + next.id, true)}>Next: {next.title} <ArrowRight size={16} /></button>
            : <button className="btn white block mt16" onClick={() => go("/learn/grammar")}>Back to course</button>}
        </div>
      )}
    </div>
  );
}

export function CoreGrammarView() {
  const pk = usePack();
  const s = useSettings();
  const p = useProgress();
  useEffect(() => { if (!p.roadmap.core30) updateProgress((q) => { q.roadmap.core30 = true; }); }, []); // eslint-disable-line
  const max = parseFloat(pk.coreGrammar[0].sh);
  return (
    <div className="screen">
      <Header title="30 core grammar words" sub="Ranked by share of ALL spoken words" backTo="/learn" />
      <div className="card soft-shu" style={{ boxShadow: "none" }}>
        <div className="sm" style={{ lineHeight: 1.6 }}>These particles and endings are tiny but everywhere: together they make up roughly <b>40%</b> of every word you’ll hear. Learn them first and every sentence suddenly has a skeleton.</div>
      </div>
      {pk.coreGrammar.map((g) => (
        <div className="card" key={g.n}>
          <div className="row">
            <span className="tag">#{g.n}</span>
            <span className="jp" style={{ fontSize: 28, fontWeight: 700 }}>{g.w}</span>
            <span className="mu">{g.ro}</span>
            <span className="right xs mu">{g.sh}</span>
          </div>
          <div className="mt4"><Bar pct={parseFloat(g.sh) / max} thin /></div>
          <div style={{ fontWeight: 700, marginTop: 8 }}>{g.m}{s.showHindi && <span className="hi" style={{ fontWeight: 500 }}> · {g.h}</span>}</div>
          <ExampleRow e={{ jp: g.s, ro: g.sr, en: g.st }} />
        </div>
      ))}
    </div>
  );
}
