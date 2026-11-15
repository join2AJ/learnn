import { useMemo } from "react";
import { Settings as Cog } from "lucide-react";
import type { Route } from "../core/router";
import { go } from "../core/router";
import { dayKey, emptyDay, useProgress, useSettings } from "../core/store";
import { BADGES, HIRA46, KATA46, levelOf, masteredSet, totalMs, totalReviews } from "../core/rewards";
import { pendingMs } from "../core/timeTracker";
import { usePack } from "../pack";
import { Bar, fmtMin, Header, Ring } from "../ui/kit";
import Settings from "./Settings";

const SEC_COL: Record<string, string> = {
  Alphabet: "#e0452b", Writing: "#d29a2e", Pronunciation: "#7b4fb0", Grammar: "#2f4b8a", Vocabulary: "#3f8a4f", Phrases: "#e47aa0",
  Flashcards: "#c2361f", Quizzes: "#4a6fc2", Speaking: "#5aa86a", "Sound Lab": "#9a67d1", Culture: "#e2ac46", Roadmap: "#2f7a45",
  Resources: "#8f8c98", Home: "#5d5b67", Stats: "#a9a8b6", Settings: "#a9a8b6",
};

export default function Me({ route }: { route: Route }) {
  if (route.parts[1] === "settings") return <Settings />;
  return <Stats />;
}

function Stats() {
  const pk = usePack();
  const s = useSettings();
  const p = useProgress();
  const lv = levelOf(p.xp);
  const lvName = [...pk.levels].reverse().find((l) => lv.level >= l.min) || pk.levels[0];
  const total = totalMs(p) + pendingMs();
  const days = useMemo(() => Array.from({ length: 14 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() - (13 - i)); const k = dayKey(d); return { k, d, st: p.days[k] || emptyDay() }; }), [p.days]);
  const heat = useMemo(() => Array.from({ length: 70 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() - (69 - i)); return p.days[dayKey(d)]?.ms || 0; }), [p.days]);
  const secs = useMemo(() => {
    const m: Record<string, number> = {};
    Object.values(p.days).forEach((d) => Object.entries(d.sec).forEach(([k, v]) => { if (!["Learn hub", "Practice hub", "Explore hub", "Other"].includes(k)) m[k] = (m[k] || 0) + v; }));
    return Object.entries(m).sort((a, b) => b[1] - a[1]);
  }, [p.days]);
  const secTotal = secs.reduce((a, [, v]) => a + v, 0) || 1;
  const maxDay = Math.max(1, ...days.map((d) => d.st.ms));
  const acc = p.quiz.correct + p.quiz.wrong ? p.quiz.correct / (p.quiz.correct + p.quiz.wrong) : 0;
  const activeDays = Object.values(p.days).filter((d) => d.ms > 60_000).length;
  const tiers: [string, number, number][] = [["1–100", 1, 100], ["101–300", 101, 300], ["301–600", 301, 600], ["601–1000", 601, 1000]];
  const known = new Set(p.known);

  return (
    <div className="screen">
      <Header title={s.name || "Your progress"} sub={"Studying since " + new Date(p.started).toLocaleDateString()} right={<button className="icon-btn" aria-label="Settings" onClick={() => go("/me/settings")}><Cog size={20} /></button>} />

      <div className="card hero tint-ink">
        <div className="row gap16">
          <Ring pct={lv.pct} size={92} stroke={9} color="#f1bd55" track="rgba(255,255,255,.14)">
            <div><div style={{ fontSize: 11, opacity: .7 }}>LEVEL</div><div style={{ fontSize: 28, fontWeight: 800 }}>{lv.level}</div></div>
          </Ring>
          <div className="grow">
            <div className="jp" style={{ fontSize: 22, fontWeight: 800 }}>{lvName.jp}</div>
            <div className="mu">{lvName.en} · {p.xp.toLocaleString()} XP</div>
            <div className="row mt8 gap16">
              <div><div style={{ fontSize: 20, fontWeight: 800 }}>🔥 {p.streak.count}</div><div className="xs mu">day streak</div></div>
              <div><div style={{ fontSize: 20, fontWeight: 800 }}>{p.streak.best}</div><div className="xs mu">best</div></div>
              <div><div style={{ fontSize: 20, fontWeight: 800 }}>{activeDays}</div><div className="xs mu">active days</div></div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid2 mt12">
        <div className="stat"><div className="v">{fmtMin(total)}</div><div className="k">Total study time</div></div>
        <div className="stat"><div className="v">{p.known.length}</div><div className="k">Words known</div></div>
        <div className="stat"><div className="v">{Math.round(acc * 100)}%</div><div className="k">Quiz accuracy ({p.quiz.correct + p.quiz.wrong})</div></div>
        <div className="stat"><div className="v">{totalReviews(p)}</div><div className="k">Card reviews</div></div>
      </div>

      <div className="section-title"><h2>Last 14 days</h2><span className="mu">minutes / day · goal {s.dailyGoalMin}</span></div>
      <div className="card">
        <svg viewBox="0 0 320 130" width="100%" className="chart">
          {(() => { const gy = 110 - ((s.dailyGoalMin * 60000) / Math.max(maxDay, s.dailyGoalMin * 60000)) * 96; return <g><line x1="0" x2="320" y1={gy} y2={gy} stroke="var(--gold)" strokeDasharray="4 4" /><text x="2" y={gy - 3} style={{ fill: "var(--gold)" }}>goal</text></g>; })()}
          {days.map((d, i) => {
            const h = (d.st.ms / Math.max(maxDay, s.dailyGoalMin * 60000)) * 96;
            const isToday = i === 13;
            return <g key={d.k}>
              <rect x={i * 22.8 + 3} y={110 - h} width="16" height={Math.max(2, h)} rx="5" fill={isToday ? "var(--shu)" : d.st.ms >= s.dailyGoalMin * 60000 ? "var(--matcha)" : "var(--ai)"} opacity={d.st.ms ? 1 : 0.25} />
              <text x={i * 22.8 + 11} y="124" textAnchor="middle">{d.d.toLocaleDateString(undefined, { weekday: "narrow" })}</text>
              {d.st.ms > 0 && <text x={i * 22.8 + 11} y={106 - h} textAnchor="middle" style={{ fontSize: 8 }}>{Math.round(d.st.ms / 60000)}</text>}
            </g>;
          })}
        </svg>
      </div>

      <div className="section-title"><h2>Where your time goes</h2>{secs[0] && <span className="mu">Most: {secs[0][0]}</span>}</div>
      <div className="card">
        {secs.length === 0 ? <div className="sm mu">Study for a minute and your sections will appear here.</div> : (<>
          <div style={{ display: "flex", height: 14, borderRadius: 7, overflow: "hidden" }}>{secs.map(([k, v]) => <div key={k} style={{ width: (v / secTotal) * 100 + "%", background: SEC_COL[k] || "var(--ink-3)" }} />)}</div>
          <div className="mt12">
            {secs.map(([k, v]) => (
              <div key={k} className="row" style={{ padding: "6px 0" }}>
                <span style={{ width: 10, height: 10, borderRadius: 3, background: SEC_COL[k] || "var(--ink-3)", flex: "none" }} />
                <span className="grow sm" style={{ fontWeight: 600 }}>{k}</span>
                <span className="sm mu">{fmtMin(v)}</span>
                <span className="xs mu2" style={{ width: 38, textAlign: "right" }}>{Math.round((v / secTotal) * 100)}%</span>
              </div>
            ))}
          </div>
        </>)}
      </div>

      <div className="section-title"><h2>Activity</h2><span className="mu">last 10 weeks</span></div>
      <div className="card">
        <div className="heat">{heat.map((ms, i) => <i key={i} title={Math.round(ms / 60000) + " min"} style={ms ? { background: "var(--matcha)", opacity: 0.25 + Math.min(1, ms / (s.dailyGoalMin * 60000)) * 0.75 } : undefined} />)}</div>
      </div>

      <div className="section-title"><h2>Mastery</h2></div>
      <div className="card">
        {[["Hiragana", masteredSet(p, HIRA46) / 46, masteredSet(p, HIRA46) + "/46", "var(--shu)"], ["Katakana", masteredSet(p, KATA46) / 46, masteredSet(p, KATA46) + "/46", "var(--ai)"],
          ["Grammar lessons", Object.keys(p.lessons).length / pk.lessons.length, Object.keys(p.lessons).length + "/" + pk.lessons.length, "var(--plum)"],
          ["Culture sections", Object.keys(p.culturesRead).length / pk.culture.length, Object.keys(p.culturesRead).length + "/" + pk.culture.length, "var(--gold)"],
          ...tiers.map(([l, a, b]) => { const n = Array.from({ length: b - a + 1 }, (_, i) => a + i).filter((x) => known.has(x)).length; return ["Words " + l, n / (b - a + 1), n + "/" + (b - a + 1), "var(--matcha)"]; }),
        ].map(([l, pct, t, c]) => (
          <div key={l as string} style={{ padding: "6px 0" }}>
            <div className="row sm"><span className="grow" style={{ fontWeight: 600 }}>{l}</span><span className="mu">{t}</span></div>
            <div className="mt4"><Bar pct={pct as number} color={c as string} thin /></div>
          </div>
        ))}
        <div className="row sm mt8 mu"><span className="grow">Speaking: {p.speak.ok}/{p.speak.tries} correct</span><span>Writing: {p.writes} characters</span></div>
      </div>

      <div className="section-title"><h2>Badges</h2><span className="mu">{Object.keys(p.badges).length}/{BADGES.length}</span></div>
      <div className="grid3">
        {BADGES.map((b) => (
          <div key={b.id} className={"badge-tile" + (p.badges[b.id] ? "" : " locked")}>
            <div className="b">{b.icon}</div><div className="t">{b.title}</div><div className="xs mu" style={{ lineHeight: 1.25 }}>{b.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

