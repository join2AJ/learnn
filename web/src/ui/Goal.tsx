import { useState } from "react";
import { Flag } from "lucide-react";
import { dayKey, getProgress, setSettings, useProgress, useSettings } from "../core/store";
import { go } from "../core/router";
import { Bar, tap } from "./kit";

export const GOAL_LABELS = ["Trip to Japan", "JLPT exam", "Job interview", "Meet friends", "Just for me"];

/** Words still to learn, days left, words per day needed vs. your recent pace. */
export function goalStatus(goal: { words: number; date: string }, known: number, learned7: number) {
  const end = new Date(goal.date + "T23:59:59");
  const days = Math.max(1, Math.ceil((end.getTime() - Date.now()) / 86_400_000));
  const left = Math.max(0, goal.words - known);
  const need = Math.ceil(left / days);
  const pace = Math.round((learned7 / 7) * 10) / 10;
  return { days, left, need, pace, ok: left === 0 || pace >= need, done: left === 0, past: end.getTime() < Date.now() };
}

export function GoalCard() {
  const s = useSettings();
  const p = useProgress();
  if (!s.goal) return (
    <button className="card tap mt12 flat" style={{ background: "transparent" }} onClick={() => go("/me/settings")}>
      <div className="row"><Flag size={20} color="var(--shu)" /><div className="grow"><div style={{ fontWeight: 800 }}>Set a personal goal</div><div className="xs mu">e.g. 600 words by February for your trip - get a daily plan</div></div></div>
    </button>
  );
  const learned7 = Array.from({ length: 7 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() - i); return p.days[dayKey(d)]?.learned || 0; }).reduce((a, b) => a + b, 0);
  const st = goalStatus(s.goal, p.known.length, learned7);
  return (
    <div className="card mt12">
      <div className="row"><Flag size={20} color="var(--shu)" /><div className="grow"><div className="kicker">Your goal · {s.goal.label}</div><div style={{ fontWeight: 800 }}>{s.goal.words.toLocaleString()} words by {new Date(s.goal.date).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}</div></div></div>
      <div className="mt8"><Bar pct={p.known.length / s.goal.words} color={st.ok ? "var(--matcha)" : "var(--gold)"} /></div>
      <div className="sm mt8">{st.done ? "Goal reached - おめでとう!" : st.past ? "The date has passed - set a new goal in Settings." : <>{p.known.length} / {s.goal.words} known · {st.days} days left · <b>{st.need} new words/day</b> needed</>}</div>
      {!st.done && !st.past && <div className="xs mt4" style={{ color: st.ok ? "var(--matcha)" : "var(--gold)", fontWeight: 700 }}>{st.ok ? "On track - your pace is " + st.pace + " words/day" : "Behind - your pace is " + st.pace + "/day. Study a few more cards today."}</div>}
    </div>
  );
}

export function GoalEditor() {
  const s = useSettings();
  const d0 = new Date(); d0.setMonth(d0.getMonth() + 3);
  const [words, setWords] = useState(s.goal?.words || 600);
  const [date, setDate] = useState(s.goal?.date || dayKey(d0));
  const [label, setLabel] = useState(s.goal?.label || GOAL_LABELS[0]);
  const known = getProgress().known.length;
  const st = goalStatus({ words, date }, known, 0);
  return (
    <div>
      <div className="sm mu" style={{ fontWeight: 700 }}>What for?</div>
      <div className="row wrap gap6 mt8">{GOAL_LABELS.map((l) => <button key={l} className={"chip" + (label === l ? " shu on" : "")} onClick={() => { tap(); setLabel(l); }}>{l}</button>)}</div>
      <div className="sm mu mt12" style={{ fontWeight: 700 }}>How many words?</div>
      <div className="row wrap gap6 mt8">{[300, 600, 1000, 1500, 2000].map((n) => <button key={n} className={"chip" + (words === n ? " shu on" : "")} onClick={() => { tap(); setWords(n); }}>{n.toLocaleString()}</button>)}</div>
      <div className="row mt12"><span className="sm grow" style={{ fontWeight: 700 }}>By when?</span>
        <input type="date" value={date} min={dayKey()} onChange={(e) => setDate(e.target.value)} style={{ height: 40, borderRadius: 12, border: 0, background: "var(--surface-2)", color: "var(--ink)", padding: "0 10px" }} /></div>
      <div className="sm mt12" style={{ background: "var(--surface-2)", borderRadius: 12, padding: "10px 12px" }}>That’s about <b>{st.need} new words a day</b> for {st.days} days{st.need > 30 ? " - very ambitious; consider a later date." : st.need > 20 ? " - a strong pace." : " - very doable."}</div>
      <div className="row mt12">
        {s.goal && <button className="btn grow" onClick={() => setSettings({ goal: null })}>Remove goal</button>}
        <button className="btn primary grow" onClick={() => { tap(); setSettings({ goal: { words, date, label } }); }}>{s.goal ? "Update goal" : "Set goal"}</button>
      </div>
    </div>
  );
}
