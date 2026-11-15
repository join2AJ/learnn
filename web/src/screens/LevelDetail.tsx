import { useMemo } from "react";
import { Check, Lock } from "lucide-react";
import { dayKey, useProgress } from "../core/store";
import { LEVEL_XP, levelOf } from "../core/rewards";
import { usePack } from "../pack";
import { Bar, Header, Ring } from "../ui/kit";

const COL: Record<string, string> = { Flashcards: "var(--matcha)", Quizzes: "var(--ai)", Grammar: "var(--plum)", Alphabet: "var(--shu)", Writing: "#c2410c", Speaking: "var(--sakura)", "Sound Lab": "#0e7490", Vocabulary: "var(--gold)", Culture: "#7a3fa0", Phrases: "#3f7d4e", Home: "var(--ink-3)" };

const RULES: [string, string][] = [
  ["Flashcard review", "1 XP (Again) · 3 XP (Hard/Good/Easy)"],
  ["Quiz answer right", "2 XP · 4 XP on a streak of 4+"],
  ["Finish a quiz", "5 XP · 15 XP for a perfect score"],
  ["Grammar lesson", "20 XP first time · 5 XP repeat · 3 XP per check"],
  ["Writing a character", "1 XP · 5 XP at 70%+ · 7 XP at 85%+"],
  ["Speak a word correctly", "8 XP · 2 XP per try"],
  ["Record & compare your voice", "3 XP"],
  ["Sound Lab", "2–5 XP"],
  ["Mark a word as known", "2 XP"],
  ["Read a culture section", "5 XP"],
  ["Map quiz", "3 XP per answer · 5–15 XP per game"],
];

/** Explains the learner's level: where the XP came from, when each level was reached, and what's next. */
export default function LevelDetail() {
  const pk = usePack();
  const p = useProgress();
  const lv = levelOf(p.xp);
  const nameOf = (l: number) => [...pk.levels].reverse().find((x) => l >= x.min) || pk.levels[0];

  const bySrc = useMemo(() => {
    const m: Record<string, number> = {};
    Object.values(p.days).forEach((d) => Object.entries(d.xpBy || {}).forEach(([k, v]) => { m[k] = (m[k] || 0) + v; }));
    const tracked = Object.values(m).reduce((a, b) => a + b, 0);
    const list = Object.entries(m).sort((a, b) => b[1] - a[1]);
    return { list, earlier: Math.max(0, p.xp - tracked) };
  }, [p.days, p.xp]);

  const history = useMemo(() => {
    const keys = Object.keys(p.days).sort();
    const daySum = keys.reduce((a, k) => a + (p.days[k].xp || 0), 0);
    let cum = Math.max(0, p.xp - daySum); // XP not recorded per day
    const reached: Record<number, string> = {};
    for (const k of keys) {
      cum += p.days[k].xp || 0;
      for (let l = 2; l <= LEVEL_XP.length; l++) if (!reached[l] && cum >= LEVEL_XP[l - 1]) reached[l] = k;
    }
    return Array.from({ length: lv.level - 1 }, (_, i) => {
      const l = i + 2;
      const t = p.levelUps?.[l];
      const d = t ? new Date(t) : reached[l] ? new Date(reached[l] + "T12:00:00") : null;
      const after = d ? Math.max(0, Math.round((d.getTime() - p.started) / 86400000)) : null;
      return { l, d, after };
    }).reverse();
  }, [p.days, p.xp, p.levelUps, p.started, lv.level]);

  const days14 = Array.from({ length: 14 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() - (13 - i)); return { d, xp: p.days[dayKey(d)]?.xp || 0 }; });
  const maxXp = Math.max(10, ...days14.map((x) => x.xp));
  const best = Object.entries(p.days).sort((a, b) => (b[1].xp || 0) - (a[1].xp || 0))[0];
  const nm = nameOf(lv.level);

  return (
    <div className="screen">
      <Header title={"Level " + lv.level} sub={nm.en + " · " + p.xp.toLocaleString() + " XP"} backTo="/me" />
      <div className="card hero tint-ink">
        <div className="row gap16">
          <Ring pct={lv.pct} size={92} stroke={9} color="#f1bd55" track="rgba(255,255,255,.14)"><div><div style={{ fontSize: 11, opacity: .7 }}>LEVEL</div><div style={{ fontSize: 28, fontWeight: 800 }}>{lv.level}</div></div></Ring>
          <div className="grow">
            <div className="jp" style={{ fontSize: 22, fontWeight: 800 }}>{nm.jp}</div>
            <div className="mu">{p.xp.toLocaleString()} XP total</div>
            <div className="sm mt8">{(lv.next - p.xp).toLocaleString()} XP to level {lv.level + 1}</div>
            <div className="mt4"><Bar pct={lv.pct} white /></div>
          </div>
        </div>
      </div>

      <div className="section-title"><h2>Where your XP came from</h2></div>
      <div className="card">
        {bySrc.list.length === 0 && bySrc.earlier === 0 && <div className="sm mu">Practise anything to earn your first XP.</div>}
        {bySrc.list.map(([k, v]) => (
          <div key={k} style={{ padding: "6px 0" }}>
            <div className="row sm"><span className="grow" style={{ fontWeight: 700 }}>{k}</span><span style={{ fontWeight: 800 }}>{v.toLocaleString()} XP</span><span className="xs mu" style={{ width: 42, textAlign: "right" }}>{Math.round((v / Math.max(1, p.xp)) * 100)}%</span></div>
            <div className="mt4"><Bar pct={v / Math.max(1, p.xp)} color={COL[k] || "var(--ai)"} thin /></div>
          </div>
        ))}
        {bySrc.earlier > 0 && (
          <div style={{ padding: "6px 0" }}>
            <div className="row sm"><span className="grow" style={{ fontWeight: 700 }}>Earlier activity</span><span style={{ fontWeight: 800 }}>{bySrc.earlier.toLocaleString()} XP</span><span className="xs mu" style={{ width: 42, textAlign: "right" }}>{Math.round((bySrc.earlier / Math.max(1, p.xp)) * 100)}%</span></div>
            <div className="mt4"><Bar pct={bySrc.earlier / Math.max(1, p.xp)} color="var(--ink-3)" thin /></div>
            <div className="xs mu mt4">Earned before version 3.8, when XP wasn’t split by activity yet.</div>
          </div>
        )}
      </div>

      <div className="section-title"><h2>XP per day</h2>{best && best[1].xp > 0 && <span className="mu">Best day: {best[1].xp} XP</span>}</div>
      <div className="card">
        <svg viewBox="0 0 320 120" width="100%" className="chart">
          {days14.map((x, i) => { const h = (x.xp / maxXp) * 90; return <g key={i}>
            <rect x={i * 22.8 + 3} y={100 - h} width="16" height={Math.max(2, h)} rx="5" fill={i === 13 ? "var(--shu)" : "var(--gold)"} opacity={x.xp ? 1 : 0.25} />
            {x.xp > 0 && <text x={i * 22.8 + 11} y={96 - h} textAnchor="middle" style={{ fontSize: 8 }}>{x.xp}</text>}
            <text x={i * 22.8 + 11} y="114" textAnchor="middle">{x.d.toLocaleDateString(undefined, { weekday: "narrow" })}</text>
          </g>; })}
        </svg>
      </div>

      <div className="section-title"><h2>Your level history</h2></div>
      <div className="list">
        {history.length === 0 && <div className="li sm mu">Reach 100 XP for level 2 - your level-ups will be listed here.</div>}
        {history.map(({ l, d, after }) => (
          <div key={l} className="li">
            <span style={{ width: 36, height: 36, borderRadius: 18, display: "grid", placeItems: "center", background: "var(--gold-soft)", color: "var(--gold)", fontWeight: 800, flex: "none" }}>{l}</span>
            <span className="grow"><div className="t">Level {l} · {nameOf(l).en}</div><div className="d">{LEVEL_XP[l - 1].toLocaleString()} XP{d ? " · " + d.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }) + (after != null ? " · day " + (after + 1) : "") : ""}</div></span>
            <Check size={18} color="var(--matcha)" />
          </div>
        ))}
      </div>

      <div className="section-title"><h2>All levels</h2></div>
      <div className="list">
        {LEVEL_XP.map((x, i) => { const l = i + 1, got = lv.level >= l; return (
          <div key={l} className="li" style={{ padding: "10px 16px", opacity: got ? 1 : 0.65, background: l === lv.level ? "var(--gold-soft)" : undefined }}>
            <span className="sm" style={{ fontWeight: 800, width: 34 }}>{l}</span>
            <span className="grow sm"><span className="jp">{nameOf(l).jp}</span> <span className="mu">{nameOf(l).en}</span></span>
            <span className="sm" style={{ fontWeight: 700 }}>{x.toLocaleString()} XP</span>
            {!got && <Lock size={13} style={{ marginLeft: 6 }} />}
          </div>); })}
      </div>

      <div className="section-title"><h2>How to earn XP</h2></div>
      <div className="list">{RULES.map(([a, b]) => <div key={a} className="li" style={{ padding: "10px 16px", alignItems: "flex-start" }}><span className="sm grow" style={{ fontWeight: 700 }}>{a}</span><span className="xs mu" style={{ maxWidth: "52%", textAlign: "right" }}>{b}</span></div>)}</div>
    </div>
  );
}

