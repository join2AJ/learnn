import { useMemo } from "react";
import { ArrowRight, AudioLines, Brain, Layers, Mic, PenLine, Sparkles } from "lucide-react";
import { go } from "../core/router";
import { dayKey, today, useProgress, useSettings } from "../core/store";
import { levelOf } from "../core/rewards";
import { dueCount } from "../core/srs";
import { nextStep } from "../core/path";
import { pendingMs } from "../core/timeTracker";
import { usePack } from "../pack";
import { Bar, Ring, Say, tap } from "../ui/kit";

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
      <div className="hdr flat" style={{ paddingBottom: 4 }}>
        <div className="grow">
          <div className="jp" style={{ fontSize: 24, fontWeight: 700, letterSpacing: ".01em" }}>{g.jp}{s.name ? "、" + s.name + "さん" : ""}</div>
          <div className="sm mu">{g.ro} · {g.en}</div>
        </div>
        <button className="chip" onClick={() => go("/me")} aria-label="Streak"><span className="streak-flame">🔥</span><b>{p.streak.count}</b></button>
      </div>

      {/* Hero: goal + level + next step */}
      <div className="card hero tint-ink mt8">
        <div className="row gap16">
          <Ring pct={goalPct} size={86} stroke={9} color="#ff7a5c" track="rgba(255,255,255,.14)">
            <div><div style={{ fontSize: 20, fontWeight: 800 }}>{Math.floor(mins)}</div><div style={{ fontSize: 10, opacity: .7 }}>/ {s.dailyGoalMin} min</div></div>
          </Ring>
          <div className="grow">
            <div className="kicker">Level {lv.level} · <span className="jp">{lvName.jp}</span></div>
            <div style={{ fontSize: 20, fontWeight: 800, margin: "2px 0 8px" }}>{lvName.en}</div>
            <Bar pct={lv.pct} white />
            <div className="xs mu mt4">{p.xp - lv.cur} / {lv.next - lv.cur} XP to level {lv.level + 1}</div>
          </div>
        </div>
        <button className="card tap mt16" style={{ background: "rgba(255,255,255,.08)", boxShadow: "inset 0 0 0 1px rgba(255,255,255,.12)", color: "#fff", padding: 14 }} onClick={() => { tap(); go(step.to); }}>
          <div className="row">
            <div className="jp" style={{ width: 46, height: 46, borderRadius: 14, background: "var(--shu)", display: "grid", placeItems: "center", fontSize: step.jp.length > 2 ? 13 : 18, fontWeight: 700, flex: "none" }}>{step.jp}</div>
            <div className="grow"><div className="kicker">Up next</div><div style={{ fontWeight: 800 }}>{step.title}</div><div className="xs mu">{step.sub}</div></div>
            <ArrowRight size={20} />
          </div>
        </button>
      </div>

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
          <Say text={wotd.r} />
        </div>
        <div className="lg mt8" style={{ fontWeight: 700 }}>{wotd.m}</div>
        {s.showHindi && <div className="hi">{wotd.h}</div>}
        <div className="divider" />
        <div className="row top">
          <div className="grow">
            <div className="jp" style={{ fontSize: 17 }}>{wotd.s}</div>
            {s.showRomaji && <div className="xs mu2">{wotd.sr}</div>}
            <div className="sm mu">{wotd.st}</div>
          </div>
          <Say text={wotd.s} size="s" />
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
        <div className="kicker">{tip.icon} {tip.sec}</div>
        <div style={{ fontWeight: 800, fontSize: 16, marginTop: 4 }}>{tip.title} {tip.jp && <span className="jp mu" style={{ fontWeight: 500, fontSize: 14 }}>{tip.jp}</span>}</div>
        <div className="sm mt4" style={{ lineHeight: 1.55 }}>{tip.text}</div>
        {tip.india && s.showHindi && <div className="sm mt8" style={{ lineHeight: 1.5 }}>🇮🇳 {tip.india}</div>}
      </div>

      <div className="card flat mt12" style={{ background: "transparent" }}>
        <div className="kicker">Did you know?</div>
        <div className="sm mt4">{fact}</div>
      </div>
    </div>
  );
}
