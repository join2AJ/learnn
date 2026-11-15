import { useMemo, useState } from "react";
import { ChevronRight, Heart, Lock, Settings as Cog } from "lucide-react";
import type { Route } from "../core/router";
import { go } from "../core/router";
import { dayKey, emptyDay, useProgress, useSettings } from "../core/store";
import { BADGE_HOW, BADGES, goalStreak, HIRA46, KATA46, levelOf, masteredSet, pledgeStatus, totalMs, totalReviews } from "../core/rewards";
import { emitUi } from "../core/store";
import { pendingMs } from "../core/timeTracker";
import { usePack } from "../pack";
import { Bar, fmtMin, Header, Ring, Seg, Sheet } from "../ui/kit";
import Settings from "./Settings";
import Recordings from "./Recordings";
import MyWriting from "./MyWriting";
import Privacy from "./Privacy";
import Backup from "./Backup";
import About, { BuildApp } from "./About";
import Support from "./Support";
import PolicyText from "./PolicyText";
import { Icon, IconTile } from "../ui/icons";

const SEC_COL: Record<string, string> = {
  Alphabet: "#e0452b", Writing: "#d29a2e", Pronunciation: "#7b4fb0", Grammar: "#2f4b8a", Vocabulary: "#3f8a4f", Phrases: "#e47aa0",
  Flashcards: "#c2361f", Quizzes: "#4a6fc2", Speaking: "#5aa86a", "Sound Lab": "#9a67d1", Culture: "#e2ac46", Roadmap: "#2f7a45",
  Resources: "#8f8c98", Home: "#5d5b67", Stats: "#a9a8b6", Settings: "#a9a8b6",
};

export default function Me({ route }: { route: Route }) {
  if (route.parts[1] === "settings") return <Settings />;
  if (route.parts[1] === "recordings") return <Recordings />;
  if (route.parts[1] === "writing") return <MyWriting />;
  if (route.parts[1] === "privacy") return <Privacy />;
  if (route.parts[1] === "backup") return <Backup />;
  if (route.parts[1] === "support") return <Support />;
  if (route.parts[1] === "about") return <About />;
  if (route.parts[1] === "build") return <BuildApp />;
  if (route.parts[1] === "licenses") return <div className="screen"><Header title="Licences" backTo="/me/settings" /><div className="card xs mu" style={{ lineHeight: 1.8 }}>
    KanjiVG © Ulrich Apel, CC BY-SA 3.0<br />JMdict © EDRDG, CC BY-SA 4.0<br />wordfreq, CC BY-SA 4.0<br />Tatoeba, CC BY 2.0 FR<br />地球地図日本 © GSI<br />Photos: Wikimedia Commons (per photo)
  </div></div>;
  if (route.parts[1] === "policy") return <div className="screen"><Header title="Privacy policy" backTo="/me/privacy" /><div className="card"><PolicyText /></div></div>;
  return <Stats />;
}

function Stats() {
  const [badge, setBadge] = useState<string | null>(null);
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
  const tiers: [string, number, number][] = [["1–100", 1, 100], ["101–300", 101, 300], ["301–600", 301, 600], ["601–1000", 601, 1000], ["1001–2000", 1001, 2000]];
  const rankOf = new Map(pk.words.map((w) => [w.n, w.rank ?? w.n]));
  const known = new Set(p.known.map((n) => rankOf.get(n) ?? n));

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
              <div><div className="row gap4" style={{ fontSize: 20, fontWeight: 800 }}><Icon name="flame" size={19} color="#ff7a3d" />{p.streak.count}</div><div className="xs mu">day streak</div></div>
              <div><div style={{ fontSize: 20, fontWeight: 800 }}>{p.streak.best}</div><div className="xs mu">best</div></div>
              <div><div style={{ fontSize: 20, fontWeight: 800 }}>{activeDays}</div><div className="xs mu">active days</div></div>
            </div>
          </div>
        </div>
      </div>

      {(() => { const ps = pledgeStatus(p); const gs = goalStreak(p); return ps ? (
        <div className="card soft-gold mt12" style={{ boxShadow: "none" }}>
          <div className="row"><IconTile name="handshake" tone="gold" size={40} icon={21} /><div className="grow"><div style={{ fontWeight: 800 }}>Pledge: {ps.min} min a day</div><div className="xs mu">Day {ps.day} of {ps.days} · goal met {ps.kept} days · current run {gs.cur} · best {gs.best}</div></div></div>
          <div className="mt8"><Bar pct={ps.kept / ps.days} color="var(--gold)" /></div>
          <div className="xs mu mt4">Next badge: {gs.best < 3 ? "3" : gs.best < 7 ? "7" : gs.best < 21 ? "21" : "30"} days in a row</div>
        </div>) : null; })()}

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

      <VoiceSection />
      <PracticeLog />

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

      <button className="card tap mt16" onClick={() => go("/me/about")}>
        <div className="row"><Heart size={22} color="var(--sakura)" /><div className="grow"><div style={{ fontWeight: 800 }}>About us</div><div className="xs mu">Our story · support us · build an app like this</div></div><ChevronRight size={18} /></div>
      </button>

      <div className="section-title"><h2>Badges</h2><span className="mu">{Object.keys(p.badges).length}/{BADGES.length}</span></div>
      <Sheet open={!!badge} onClose={() => setBadge(null)}>{badge && <BadgeDetail id={badge} onGo={(to) => { setBadge(null); go(to); }} />}</Sheet>
      <div className="xs mu" style={{ margin: "-4px 2px 10px" }}>Tap a badge to see how to earn it.</div>
      <div className="grid3">
        {BADGES.map((b) => { const got = !!p.badges[b.id]; const pr = BADGE_HOW[b.id]?.prog(p) || [0, 1]; return (
          <button key={b.id} className={"badge-tile" + (got ? "" : " locked")} onClick={() => setBadge(b.id)}>
            <div className="b" style={{ position: "relative" }}><Icon name={b.icon} size={24} color={got ? "var(--gold)" : "var(--ink-2)"} />{!got && <span style={{ position: "absolute", right: -2, bottom: -2, width: 20, height: 20, borderRadius: 10, background: "var(--surface-3)", display: "grid", placeItems: "center" }}><Lock size={11} /></span>}</div>
            <div className="t">{b.title}</div>
            {got ? <div className="xs" style={{ color: "var(--gold)", fontWeight: 700 }}>Earned</div>
              : <><div className="bar thin" style={{ width: "80%" }}><i style={{ width: (pr[0] / pr[1]) * 100 + "%", background: "var(--gold)" }} /></div><div className="xs mu" style={{ fontWeight: 700 }}>{pr[0]} / {pr[1]}</div></>}
          </button>); })}
      </div>
    </div>
  );
}


function VoiceSection() {
  const p = useProgress();
  const log = p.voiceLog || [];
  if (!log.length) return (
    <><div className="section-title"><h2>Your voice</h2></div>
      <div className="card sm mu">Tap the green mic button next to any word to record yourself. Your low / mid / high balance, loudness and scores will be tracked here.</div></>
  );
  const recent = log.slice(-20);
  const avg = (k: (r: typeof log[0]) => number) => recent.reduce((a, r) => a + k(r), 0) / recent.length;
  const bands = [0, 1, 2].map((i) => avg((r) => r.bands[i]));
  const ref = [0, 1, 2].map((i) => avg((r) => r.ref[i]));
  const db = avg((r) => r.db), score = avg((r) => r.score);
  const last = log.slice(-12);
  return (
    <>
      <div className="section-title"><h2>Your voice</h2><button className="sm" style={{ color: "var(--shu)", fontWeight: 700 }} onClick={() => go("/me/recordings")}>All {log.length} recordings →</button></div>
      <div className="card">
        <div className="grid3">
          <div className="stat" style={{ boxShadow: "none", background: "var(--surface-2)" }}><div className="v">{Math.round(score)}</div><div className="k">Avg score</div></div>
          <div className="stat" style={{ boxShadow: "none", background: "var(--surface-2)" }}><div className="v">{Math.round(db)}</div><div className="k">Avg dB {db < -26 ? "· louder!" : "✓"}</div></div>
          <div className="stat" style={{ boxShadow: "none", background: "var(--surface-2)" }}><div className="v">{Math.round(avg((r) => r.dur / r.exp) * 100)}%</div><div className="k">Pace vs natural</div></div>
        </div>
        <div className="xs mu mt12" style={{ fontWeight: 700 }}>FREQUENCY BALANCE (last {recent.length}) · you vs reference</div>
        {["Low", "Mid", "High"].map((n, i) => (
          <div key={n} className="row xs mt4"><b style={{ width: 34 }}>{n}</b>
            <div className="grow" style={{ position: "relative", height: 14 }}>
              <div style={{ position: "absolute", top: 0, height: 6, width: bands[i] * 100 + "%", background: "var(--matcha)", borderRadius: 3 }} />
              <div style={{ position: "absolute", top: 8, height: 6, width: ref[i] * 100 + "%", background: "var(--ink-3)", opacity: .6, borderRadius: 3 }} />
            </div>
            <span style={{ width: 70, textAlign: "right" }}>{Math.round(bands[i] * 100)}% / {Math.round(ref[i] * 100)}%</span></div>
        ))}
        <div className="xs mu mt12" style={{ fontWeight: 700 }}>SCORE TREND</div>
        <svg viewBox="0 0 300 60" width="100%" className="chart mt4">
          <polyline fill="none" stroke="var(--shu)" strokeWidth="2.5" points={last.map((r, i) => (i / Math.max(1, last.length - 1)) * 290 + 5 + "," + (55 - (r.score / 100) * 50)).join(" ")} />
          {last.map((r, i) => <circle key={i} cx={(i / Math.max(1, last.length - 1)) * 290 + 5} cy={55 - (r.score / 100) * 50} r="3" fill="var(--shu)" />)}
        </svg>
        <div className="mt8">
          {log.slice(-5).reverse().map((r) => (
            <button key={r.t} className="row" style={{ width: "100%", padding: "6px 0" }} onClick={() => emitUi({ type: "voice", text: r.w, reviewT: r.t })}>
              <span className="jp grow" style={{ textAlign: "left", fontWeight: 600 }}>{r.w}</span>
              <span className="xs mu">{Math.round(r.db)} dB · {r.dur.toFixed(1)}s</span>
              <span className="tag" style={{ background: r.score >= 70 ? "var(--matcha)" : r.score >= 50 ? "var(--gold)" : "var(--shu)", color: "#fff" }}>{r.score}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

const sc = (v: number) => (v >= 70 ? "var(--matcha)" : v >= 50 ? "var(--gold)" : "var(--shu)");

/** Everything the learner has written or recorded: what, how many tries, best and last score. */
function PracticeLog() {
  const pk = usePack();
  const p = useProgress();
  const [tab, setTab] = useState<"write" | "voice">("write");
  const [all, setAll] = useState(false);
  const wl = Object.entries(p.writeLog || {}).sort((a, b) => b[1].t - a[1].t);
  const vm = new Map<string, { n: number; best: number; last: number; t: number; lastT: number }>();
  (p.voiceLog || []).forEach((r) => { const v = vm.get(r.w) || { n: 0, best: 0, last: 0, t: 0, lastT: 0 }; vm.set(r.w, { n: v.n + 1, best: Math.max(v.best, r.score), last: r.score, t: r.t, lastT: r.t }); });
  const vl = [...vm.entries()].sort((a, b) => b[1].t - a[1].t);
  const wTries = wl.reduce((a, [, v]) => a + v.n, 0);
  const vTries = (p.voiceLog || []).length;
  const rows = tab === "write" ? wl : vl;
  const shown = all ? rows : rows.slice(0, 8);
  return (
    <>
      <div className="section-title"><h2>Practice log</h2><span className="row gap6"><button className="sm" style={{ color: "var(--shu)", fontWeight: 700 }} onClick={() => go("/me/writing")}>My writing →</button></span></div>
      <div className="card">
        <Seg value={tab} options={[["write", "Writing (" + wTries + ")"], ["voice", "Speaking (" + vTries + ")"]]} onChange={(v) => { setTab(v); setAll(false); }} />
        {tab === "write" && wl.length > 0 && (
          <div className="mt12" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(44px, 1fr))", gap: 6 }}>
            {wl.map(([ch, v]) => (
              <button key={ch} onClick={() => go("/practice/write?ch=" + encodeURIComponent(ch))} title={v.n + " tries, best " + v.best + "%"}
                style={{ aspectRatio: "1", borderRadius: 12, background: "var(--surface-2)", boxShadow: "inset 0 -3px 0 " + sc(v.best), display: "grid", placeItems: "center", position: "relative" }}>
                <span className="jp" style={{ fontSize: 20, fontWeight: 600 }}>{ch}</span>
                <span style={{ position: "absolute", top: 2, right: 4, fontSize: 9, fontWeight: 800, color: "var(--ink-3)" }}>{v.n}×</span>
              </button>
            ))}
          </div>
        )}
        {rows.length === 0 ? (
          <div className="sm mu mt12">{tab === "write" ? "Nothing written yet - open Practice → Write and check a character." : "Nothing recorded yet - tap the green mic next to any word."}</div>
        ) : (
          <div className="mt12">
            <div className="row xs mu2" style={{ fontWeight: 700, padding: "0 0 4px" }}><span className="grow">{tab === "write" ? "CHARACTER" : "WORD"}</span><span style={{ width: 46, textAlign: "center" }}>TRIES</span><span style={{ width: 46, textAlign: "center" }}>BEST</span><span style={{ width: 46, textAlign: "center" }}>LAST</span></div>
            {shown.map(([k, v]) => (
              <button key={k} className="row" style={{ width: "100%", padding: "7px 0", borderTop: "1px solid var(--line)" }}
                onClick={() => { if (tab === "write") go("/practice/write?ch=" + encodeURIComponent(k)); else { const w = pk.words.find((x) => x.w === k); emitUi({ type: "voice", text: k, ro: w?.ro, en: w?.m, reviewT: (v as { lastT: number }).lastT }); } }}>
                <span className="grow" style={{ textAlign: "left", minWidth: 0 }}>
                  <span className="jp" style={{ fontWeight: 700 }}>{k}</span>
                  <span className="xs mu"> · {new Date(v.t).toLocaleDateString(undefined, { day: "numeric", month: "short" })}</span>
                </span>
                <span style={{ width: 46, textAlign: "center", fontWeight: 700 }}>{v.n}</span>
                <span style={{ width: 46, textAlign: "center", fontWeight: 800, color: sc(v.best) }}>{v.best}</span>
                <span style={{ width: 46, textAlign: "center", fontWeight: 700, color: sc(v.last) }}>{v.last}</span>
              </button>
            ))}
            {rows.length > 8 && <button className="btn sm block mt8" onClick={() => setAll(!all)}>{all ? "Show less" : "Show all " + rows.length}</button>}
          </div>
        )}
      </div>
    </>
  );
}

function BadgeDetail({ id, onGo }: { id: string; onGo: (to: string) => void }) {
  const p = useProgress();
  const b = BADGES.find((x) => x.id === id)!;
  const how = BADGE_HOW[id];
  const got = p.badges[id];
  const [cur, tot] = how?.prog(p) || [0, 1];
  return (
    <div className="center">
      <div style={{ width: 96, height: 96, borderRadius: 48, margin: "6px auto 10px", display: "grid", placeItems: "center", background: got ? "linear-gradient(135deg, var(--gold-soft), var(--sakura-soft))" : "var(--surface-2)", boxShadow: got ? "inset 0 0 0 3px color-mix(in srgb, var(--gold) 50%, transparent)" : "inset 0 0 0 2px var(--line-2)" }}>
        <Icon name={b.icon} size={44} color={got ? "var(--gold)" : "var(--ink-2)"} />
      </div>
      <h2 style={{ margin: "0 0 4px" }}>{b.title}</h2>
      <div className="mu">{b.desc}</div>
      {got ? <div className="tag mt12" style={{ background: "var(--gold)", color: "#fff", height: 28 }}>Earned {new Date(got).toLocaleDateString()}</div> : (
        <div className="card flat mt16" style={{ textAlign: "left" }}>
          <div className="row sm"><b className="grow">Progress</b><b>{cur} / {tot}</b></div>
          <div className="bar mt8"><i style={{ width: (cur / tot) * 100 + "%", background: "var(--gold)" }} /></div>
          <div className="sm mt12" style={{ lineHeight: 1.55 }}><b>How to earn it:</b> {how?.how}</div>
        </div>
      )}
      {!got && how && <button className="btn primary block mt16" onClick={() => onGo(how.to)}>Go earn it →</button>}
    </div>
  );
}
