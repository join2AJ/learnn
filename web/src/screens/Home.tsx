import { useMemo } from "react";
import { ArrowRight, AudioLines, Brain, CheckCircle2, Circle, HelpCircle, Layers, Mic, PenLine, Sparkles } from "lucide-react";
import { go } from "../core/router";
import { dayKey, emitUi, today, useProgress, useSettings } from "../core/store";
import { goalStreak, levelOf, pledgeStatus } from "../core/rewards";
import { dueCount } from "../core/srs";
import { nextStep } from "../core/path";
import { pendingMs } from "../core/timeTracker";
import { usePack } from "../pack";
import { Bar, Jp, Ring, Say, tap } from "../ui/kit";
import { RecBtn } from "../ui/VoiceCompare";
import { Icon, IconTile, LangPill } from "../ui/icons";
import { HlJp, HlRo } from "../ui/Highlight";
import { GoalCard } from "../ui/Goal";

const hash = (s: string) => { let h = 0; for (const c of s) h = (h * 31 + c.charCodeAt(0)) | 0; return Math.abs(h); };

export default function Home() {
  const pk = usePack();
  const s = useSettings();
  const p = useProgress();
  const g = pk.greeting(new Date().getHours());
  const lv = levelOf(p.xp);
  const lvName = [...pk.levels].reverse().find((l) => lv.level >= l.min) || pk.levels[0];
  const mins = (today(p).ms + pendingMs()) / 60000;
  const goalPct = mins / s.dailyGoalMin;
  const step = nextStep(pk, p);
  const due = dueCount(Object.keys(p.srs), p);
  const seed = hash(dayKey());
  const wotd = useMemo(() => pk.words[seed % 300], [pk, seed]);
  const tip = useMemo(() => { const all = pk.culture.flatMap((c) => c.items.map((i) => ({ ...i, sec: c.title, icon: c.icon }))); return all[seed % all.length]; }, [pk, seed]);
  const fact = pk.facts[seed % pk.facts.length];

  return (
    <div className="screen">
      <div className="hdr flat" style={{ paddingBottom: 4, position: "relative" }}>
        <div className="grow">
          <div className="jp" style={{ fontSize: 24, fontWeight: 700, letterSpacing: ".01em" }}>{g.jp}{s.name ? "、" + s.name + "さん" : ""}</div>
          <div className="sm mu">{g.ro} · {g.en}</div>
        </div>
        <button className="icon-btn ghost" aria-label="How to use this app" onClick={() => emitUi({ type: "tour" })}><HelpCircle size={22} /></button>
        <button className="chip" onClick={() => go("/me")} aria-label="Streak"><Icon name="flame" size={18} color="#ff7a3d" /><b>{p.streak.count}</b></button>
      </div>

      {/* Hero: goal + level + next step */}
      <div className="card hero tint-ink mt8">
        <div className="row gap16">
          <Ring pct={goalPct} size={86} stroke={9} color="#ff7a5c" track="rgba(255,255,255,.14)">
            <div><div style={{ fontSize: 20, fontWeight: 800 }}>{Math.floor(mins)}</div><div style={{ fontSize: 10, opacity: .7 }}>/ {s.dailyGoalMin} min</div></div>
          </Ring>
          <div className="grow" role="button" onClick={() => go("/me/level")} style={{ cursor: "pointer" }}>
            <div className="kicker">Level {lv.level} · <span className="jp">{lvName.jp}</span> ›</div>
            <div style={{ fontSize: 20, fontWeight: 800, margin: "2px 0 8px" }}>{lvName.en}</div>
            <Bar pct={lv.pct} white />
            <div className="xs mu mt4">{p.xp - lv.cur} / {lv.next - lv.cur} XP to level {lv.level + 1}</div>
          </div>
        </div>
        <button className="card tap mt16" style={{ background: "rgba(255,255,255,.08)", boxShadow: "inset 0 0 0 1px rgba(255,255,255,.12)", color: "#fff", padding: 14 }} onClick={() => { tap(); go(step.to); }}>
          <div className="row">
            <div className="jp" style={{ width: 46, height: 46, borderRadius: 14, background: "var(--shu)", display: "grid", placeItems: "center", fontSize: 24, fontWeight: 700, flex: "none" }}>{step.jp}</div>
            <div className="grow"><div className="kicker">Up next</div><div style={{ fontWeight: 800 }}>{step.title}</div><div className="xs mu">{step.sub}</div></div>
            <ArrowRight size={20} />
          </div>
        </button>
      </div>

      <TodayPlan />
      <GoalCard />

      {/* Quick actions */}
      <div className="grid2 mt16">
        <button className="tile" onClick={() => go("/practice/cards")}>
          <span className="ico soft-shu"><Layers size={20} color="var(--shu)" /></span>
          <span className="t">Review cards</span><span className="d">{due ? due + " due now" : "Learn new words"}</span>
          {due > 0 && <span className="tag" style={{ position: "absolute", top: 12, right: 12, background: "var(--shu)", color: "#fff" }}>{due}</span>}
        </button>
        <button className="tile" onClick={() => go("/practice/quiz/kana?set=hira")}>
          <span className="ico soft-ai jp" style={{ color: "var(--ai)", fontWeight: 700 }}>あ</span>
          <span className="t">Kana sprint</span><span className="d">10 quick questions</span>
        </button>
        <button className="tile" onClick={() => go("/practice/speak")}>
          <span className="ico soft-matcha"><Mic size={20} color="var(--matcha)" /></span>
          <span className="t">Speak aloud</span><span className="d">Say it, get checked</span>
        </button>
        <button className="tile" onClick={() => go("/lab")}>
          <span className="ico soft-plum"><AudioLines size={20} color="var(--plum)" /></span>
          <span className="t">Sound Lab</span><span className="d">See your voice live</span>
        </button>
      </div>

      {/* Word of the day */}
      <div className="section-title"><h2>Word of the day</h2><span className="mu">#{wotd.n} most common</span></div>
      <div className="card">
        <div className="row top">
          <div className="grow">
            <div className="jp" style={{ fontSize: 40, fontWeight: 600, lineHeight: 1.1 }}>{wotd.w}</div>
            <div className="mu jp">{wotd.r}{s.showRomaji && <span className="mu2"> · {wotd.ro}</span>}</div>
          </div>
          <div className="row gap6"><Say text={wotd.r} /><RecBtn text={wotd.w} ro={wotd.ro} en={wotd.m} size="m" /></div>
        </div>
        <div className="lg mt8" style={{ fontWeight: 700 }}>{wotd.m}</div>
        {s.showHindi && <div className="hi">{wotd.h}</div>}
        <div className="divider" />
        <div className="row top">
          <div className="grow">
            <div className="jp" style={{ fontSize: 17 }}><HlJp text={wotd.s} word={wotd} /></div>
            {s.showRomaji && <div className="xs mu2"><HlRo text={wotd.sr} word={wotd} /></div>}
            <div className="sm mu">{wotd.st}</div>
          </div>
          <div className="row gap6"><Say text={wotd.s} size="s" /><RecBtn text={wotd.s} ro={wotd.sr} en={wotd.st} /></div>
        </div>
      </div>

      {/* Explore shortcuts */}
      <div className="section-title"><h2>Keep exploring</h2></div>
      <div className="list">
        <button className="li" onClick={() => go("/learn/grammar")}><span className="ico soft-ai"><Brain size={19} color="var(--ai)" /></span><span className="grow"><div className="t">Grammar course</div><div className="d">{Object.keys(p.lessons).length}/{pk.lessons.length} lessons · tenses, verbs, particles</div></span><ArrowRight size={18} className="mu2" /></button>
        <button className="li" onClick={() => go("/practice/write")}><span className="ico soft-gold"><PenLine size={19} color="var(--gold)" /></span><span className="grow"><div className="t">Writing practice</div><div className="d">Animated stroke order + tracing pad</div></span><ArrowRight size={18} className="mu2" /></button>
        <button className="li" onClick={() => go("/explore/roadmap")}><span className="ico soft-matcha"><Sparkles size={19} color="var(--matcha)" /></span><span className="grow"><div className="t">Your roadmap</div><div className="d">Timeline from day 1 to JLPT N3</div></span><ArrowRight size={18} className="mu2" /></button>
      </div>

      {/* Culture tip */}
      <div className="section-title"><h2>Culture tip</h2><button className="sm" style={{ color: "var(--shu)", fontWeight: 700 }} onClick={() => go("/explore")}>More</button></div>
      <div className="card soft-sakura" style={{ boxShadow: "none" }}>
        <div className="kicker row gap6"><Icon name={tip.icon} size={14} /> {tip.sec}</div>
        <div style={{ fontWeight: 800, fontSize: 16, marginTop: 4 }}>{tip.title} {tip.jp && <span className="mu" style={{ fontWeight: 500, fontSize: 14 }}><Jp text={tip.jp} /></span>}</div>
        <div className="sm mt4" style={{ lineHeight: 1.55 }}><Jp text={tip.text} /></div>
        {tip.india && s.showHindi && <div className="sm mt8 row top" style={{ lineHeight: 1.5, gap: 8 }}><LangPill l="hi" /><span><Jp text={tip.india} /></span></div>}
      </div>

      <div className="card flat mt12" style={{ background: "transparent" }}>
        <div className="kicker">Did you know?</div>
        <div className="sm mt4"><Jp text={fact} /></div>
      </div>
    </div>
  );
}

/** Four concrete tasks for today, ticked automatically - answers "what do I do now?". */
function TodayPlan() {
  const p = useProgress();
  const s = useSettings();
  const d = today(p);
  const mins = (d.ms + pendingMs()) / 60000;
  const ps = pledgeStatus(p);
  const gs = goalStreak(p);
  const tasks: [boolean, string, string, string][] = [
    [d.reviews >= 10, "Review 10 flashcards", (Math.min(10, d.reviews)) + "/10", "/practice/cards"],
    [d.correct + d.wrong >= 5, "Answer 5 quiz or lesson questions", Math.min(5, d.correct + d.wrong) + "/5", "/practice"],
    [(d.spoke || 0) >= 3, "Say 3 words out loud and record them", Math.min(3, d.spoke || 0) + "/3", "/practice/speak"],
    [mins >= s.dailyGoalMin, "Study " + s.dailyGoalMin + " minutes (your goal)", Math.floor(mins) + "/" + s.dailyGoalMin + " min", "/learn"],
  ];
  const done = tasks.filter((t) => t[0]).length;
  return (
    <div className="card mt16">
      <div className="row"><div className="grow"><div className="kicker">Today’s plan</div><div style={{ fontWeight: 800, fontSize: 17 }}>{done === 4 ? "All done - お疲れさま！" : done + " of 4 done"}</div></div>
        <Ring pct={done / 4} size={44} stroke={5} color="var(--matcha)"><span className="xs" style={{ fontWeight: 800 }}>{done}/4</span></Ring></div>
      <div className="mt8">
        {tasks.map(([ok, t, n, to]) => (
          <button key={t} className="row" style={{ width: "100%", padding: "8px 0", textAlign: "left" }} onClick={() => go(to)}>
            {ok ? <CheckCircle2 size={20} color="var(--matcha)" /> : <Circle size={20} className="mu2" />}
            <span className="grow sm" style={{ fontWeight: 600, textDecoration: ok ? "line-through" : undefined, color: ok ? "var(--ink-3)" : undefined }}>{t}</span>
            <span className="xs mu">{n}</span>
          </button>
        ))}
      </div>
      {ps && (
        <div className="soft-gold mt8" style={{ borderRadius: 14, padding: "10px 12px" }}>
          <div className="row"><IconTile name="handshake" tone="gold" size={34} icon={18} /><div className="grow"><div className="sm" style={{ fontWeight: 800 }}>Your pledge · day {ps.day} of {ps.days}</div><div className="xs mu">{ps.min} min a day · kept {ps.kept} day{ps.kept === 1 ? "" : "s"} · current run {gs.cur}</div></div></div>
          <div className="row mt8" style={{ gap: 3, flexWrap: "wrap" }}>
            {Array.from({ length: ps.days }, (_, i) => { const dt = new Date(ps.start + "T12:00:00"); dt.setDate(dt.getDate() + i); const k = dayKey(dt); const hit = p.goalHit[k]; const past = i < ps.day - 1; return <i key={i} style={{ width: 8, height: 8, borderRadius: 3, display: "block", background: hit ? "var(--matcha)" : past ? "var(--shu)" : i === ps.day - 1 ? "var(--gold)" : "var(--line-2)", opacity: hit || past ? 1 : 0.7 }} />; })}
          </div>
        </div>
      )}
      <div className="xs mu mt8"><Jp text="Tap a task to jump straight there. 頑張って！" /></div>
    </div>
  );
}
