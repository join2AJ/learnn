import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { dayKey, getProgress, setSettings, useSettings } from "../core/store";
import { checkBadges } from "../core/rewards";
import { PACKS } from "../packs/registry";
import { speak, vibrate } from "../core/native";
import { Switch, tap } from "../ui/kit";

const AGES = ["Under 13", "13–17", "18–24", "25–34", "35–44", "45–59", "60+"];
const REASONS: [string, string][] = [["travel", "✈️ Travel to Japan"], ["anime", "🎌 Anime, manga, games"], ["job", "💼 Job in Japan"], ["jlpt", "📝 Pass the JLPT"], ["study", "🎓 Study in Japan"], ["friends", "🤝 Friends or family"], ["business", "🏢 Business / clients"], ["fun", "🧠 Brain training & fun"]];
const TIMES = [10, 15, 20, 30, 45, 60];

export default function Onboarding() {
  const s = useSettings();
  // Users who finished the old onboarding jump straight to the new profile questions.
  const [step, setStep] = useState(s.onboarded ? 3 : 0);
  const [name, setName] = useState(s.name);
  const [age, setAge] = useState(s.age);
  const [reasons, setReasons] = useState<string[]>(s.reasons || []);
  const [mins, setMins] = useState(s.dailyGoalMin || 20);
  const next = () => { tap(); setStep(step + 1); };
  const backBtn = step > (s.onboarded ? 3 : 1) && <button className="icon-btn" aria-label="Back" onClick={() => setStep(step - 1)}><ArrowLeft size={20} /></button>;
  const total = 6, shown = step;
  const Head = ({ kicker, title, sub }: { kicker: string; title: string; sub?: string }) => (<>
    <div className="row">{backBtn}<div className="grow"><div className="kicker">{kicker}</div></div><span className="xs mu">{shown}/{total}</span></div>
    <div className="bar thin mt8"><i style={{ width: (shown / total) * 100 + "%" }} /></div>
    <h1 style={{ fontSize: 27, margin: "18px 0 4px", letterSpacing: "-.02em", lineHeight: 1.2 }}>{title}</h1>
    {sub && <p className="mu" style={{ marginTop: 0 }}>{sub}</p>}
  </>);

  if (step === 0) return (
    <div className="onb tint-shu" style={{ position: "relative", overflow: "hidden" }}>
      <div className="serif" style={{ position: "absolute", top: "8vh", right: -20, fontSize: 260, opacity: .12, lineHeight: 1, fontWeight: 700 }}>道</div>
      <div className="kicker">Welcome · ようこそ</div>
      <div className="big-jp" style={{ margin: "14px 0 10px" }}>日本語<br />の道</div>
      <h1 style={{ fontSize: 30, margin: "0 0 10px", letterSpacing: "-.02em" }}>Nihongo Path</h1>
      <p className="mu" style={{ fontSize: 16, margin: "0 0 26px", maxWidth: 420 }}>From your very first あ to real conversations — explained in English and हिन्दी.</p>
      <button className="btn white lg block" onClick={() => { next(); speak("ようこそ", { lang: "ja-JP" }); }}>Let’s begin <ArrowRight size={18} /></button>
    </div>
  );

  if (step === 1) return (
    <div className="onb" style={{ justifyContent: "flex-start", paddingTop: 32 }}>
      <Head kicker="How it works" title="One clear path, 20 minutes a day" />
      {[["1", "あ", "Read", "Hiragana & katakana in 2 weeks — sound, Hindi hint, memory trick and animated stroke order."],
        ["2", "🔊", "Listen & speak", "Every word and sentence is spoken. Record yourself and see your voice’s spectrum vs a reference."],
        ["3", "文", "Understand", "Short grammar lessons comparing English, Hindi and Japanese, then 1,000 most-used words."],
        ["4", "🔁", "Remember", "Flashcards come back right before you’d forget. Quizzes, writing and speaking checks."],
        ["5", "⛩️", "Connect", "Culture: what Japanese people love, dislike and expect — so you behave right, not just speak right."]].map(([n, ic, t, d]) => (
        <div key={n} className="row top card" style={{ marginTop: 10, padding: 14 }}>
          <div className="jp" style={{ width: 42, height: 42, borderRadius: 13, background: "var(--shu-soft)", color: "var(--shu)", display: "grid", placeItems: "center", fontSize: 20, fontWeight: 700, flex: "none" }}>{ic}</div>
          <div><div style={{ fontWeight: 800 }}>{t}</div><div className="sm mu">{d}</div></div>
        </div>
      ))}
      <div style={{ flex: 1 }} />
      <button className="btn primary lg block mt24" onClick={next}>Sounds good <ArrowRight size={18} /></button>
    </div>
  );

  if (step === 2) return (
    <div className="onb" style={{ justifyContent: "flex-start", paddingTop: 32 }}>
      <Head kicker="Language" title="What do you want to learn?" sub="Japanese is ready. The same engine will power more languages soon." />
      <div className="list mt8">
        {PACKS.map((pk) => (
          <button key={pk.id} className="li" disabled={pk.status !== "ready"} style={{ opacity: pk.status === "ready" ? 1 : .55 }} onClick={() => { tap(); setSettings({ lang: pk.id }); }}>
            <span className="ico soft-gold" style={{ fontSize: 22 }}>{pk.flag}</span>
            <span className="grow"><div className="t">{pk.name} <span className="mu jp" style={{ fontWeight: 500 }}>{pk.native}</span></div><div className="d">{pk.status === "ready" ? pk.tagline : "Coming soon"}</div></span>
            {s.lang === pk.id && pk.status === "ready" && <Check color="var(--matcha)" />}
          </button>
        ))}
      </div>
      <div style={{ flex: 1 }} />
      <button className="btn primary lg block mt24" onClick={next}>Continue <ArrowRight size={18} /></button>
    </div>
  );

  if (step === 3) return (
    <div className="onb" style={{ justifyContent: "flex-start", paddingTop: 32 }}>
      <Head kicker="About you" title="Nice to meet you! What’s your name?" sub="はじめまして — we’ll use it to cheer you on." />
      <input type="text" value={name} placeholder="Your name" onChange={(e) => setName(e.target.value)} autoComplete="given-name" />
      {name.trim() && <div className="card soft-shu mt12" style={{ boxShadow: "none" }}><div className="jp" style={{ fontSize: 20, fontWeight: 700 }}>はじめまして、{name.trim()}さん！</div><div className="xs mu">hajimemashite, {name.trim()}-san — nice to meet you</div></div>}
      <div className="sm mu mt16" style={{ fontWeight: 700 }}>Your age</div>
      <div className="row wrap mt8 gap6">{AGES.map((a) => <button key={a} className={"chip" + (age === a ? " shu on" : "")} onClick={() => { tap(); setAge(a); }}>{a}</button>)}</div>
      <div className="xs mu mt8">Used only on this phone to suggest a sensible daily pace.</div>
      <div style={{ flex: 1 }} />
      <button className="btn primary lg block mt24" disabled={!name.trim() || !age} onClick={() => { setSettings({ name: name.trim(), age }); if (name.trim()) speak("はじめまして、" + name.trim() + "さん", { lang: "ja-JP" }); next(); }}>Continue <ArrowRight size={18} /></button>
    </div>
  );

  if (step === 4) return (
    <div className="onb" style={{ justifyContent: "flex-start", paddingTop: 32 }}>
      <Head kicker="Your why" title="Why are you learning Japanese?" sub="Pick all that apply. A strong reason keeps you going on hard days." />
      <div className="grid2">
        {REASONS.map(([k, l]) => { const on = reasons.includes(k); return (
          <button key={k} className="tile" style={{ minHeight: 64, justifyContent: "center", boxShadow: on ? "inset 0 0 0 2px var(--shu), var(--shadow-1)" : undefined, background: on ? "var(--shu-soft)" : undefined }}
            onClick={() => { tap(); setReasons(on ? reasons.filter((x) => x !== k) : [...reasons, k]); }}>
            <span className="t" style={{ fontSize: 14 }}>{l}</span>
          </button>); })}
      </div>
      <div style={{ flex: 1 }} />
      <button className="btn primary lg block mt24" disabled={!reasons.length} onClick={() => { setSettings({ reasons }); next(); }}>Continue <ArrowRight size={18} /></button>
    </div>
  );

  if (step === 5) {
    const wpd = mins <= 15 ? 10 : mins <= 30 ? 15 : mins <= 45 ? 22 : 30;
    const dt = new Date(); dt.setDate(dt.getDate() + (mins <= 15 ? 18 : 14) + Math.ceil(1000 / wpd));
    const young = age === "Under 13";
    return (
      <div className="onb" style={{ justifyContent: "flex-start", paddingTop: 32 }}>
        <Head kicker="Commitment" title="How much time can you give every day?" sub={young ? "10–20 minutes a day is perfect for your age." : "Choose what you can do even on a busy day — consistency beats long sessions."} />
        <div className="grid3">
          {TIMES.map((m) => (
            <button key={m} className="tile" style={{ minHeight: 80, alignItems: "center", justifyContent: "center", boxShadow: mins === m ? "inset 0 0 0 2px var(--shu), var(--shadow-1)" : undefined, background: mins === m ? "var(--shu-soft)" : undefined }}
              onClick={() => { tap(); setMins(m); }}>
              <span style={{ fontSize: 22, fontWeight: 800 }}>{m}</span><span className="d">min / day</span>
            </button>
          ))}
        </div>
        <div className="card tint-ink mt16">
          <div className="kicker">At {mins} min a day</div>
          <div className="sm mt4" style={{ lineHeight: 1.7 }}>✅ Read both kana in about <b>{mins <= 15 ? 3 : 2} weeks</b><br />✅ About <b>{wpd} new words</b> a day<br />✅ 1,000 core words by around <b>{dt.toLocaleDateString(undefined, { month: "long", year: "numeric" })}</b></div>
        </div>
        <div className="list mt12">
          <div className="li"><span className="grow"><div className="t">Show Hindi (हिन्दी)</div></span><Switch on={s.showHindi} onChange={(v) => setSettings({ showHindi: v })} /></div>
          <div className="li"><span className="grow"><div className="t">Show romaji</div><div className="d">Turn off once you read kana</div></span><Switch on={s.showRomaji} onChange={(v) => setSettings({ showRomaji: v })} /></div>
        </div>
        <div style={{ flex: 1 }} />
        <button className="btn primary lg block mt24" onClick={() => { setSettings({ dailyGoalMin: mins, newPerDay: wpd }); next(); }}>Continue <ArrowRight size={18} /></button>
      </div>
    );
  }

  return <Pledge name={name.trim() || "I"} mins={mins} reasons={reasons} back={backBtn} />;
}

function Pledge({ name, mins, reasons, back }: { name: string; mins: number; reasons: string[]; back: React.ReactNode }) {
  const [hold, setHold] = useState(0);
  const timer = useRef<number | undefined>();
  const done = hold >= 1;
  const why = REASONS.filter(([k]) => reasons.includes(k)).map(([, l]) => l.replace(/^\S+\s/, "").toLowerCase());
  const start = () => {
    if (done) return;
    const t0 = Date.now();
    timer.current = window.setInterval(() => {
      const v = Math.min(1, (Date.now() - t0) / 1600);
      setHold(v);
      if (v >= 1) { window.clearInterval(timer.current); vibrate(40); }
    }, 30);
  };
  const stop = () => { window.clearInterval(timer.current); setHold((h) => (h >= 1 ? 1 : 0)); };
  useEffect(() => () => window.clearInterval(timer.current), []);
  const finish = () => {
    tap(20);
    setSettings({ pledge: { min: mins, start: dayKey(), days: 30 }, onboarded: true, profiled: true });
    void getProgress();
    checkBadges();
    speak("約束します！頑張りましょう！", { lang: "ja-JP" });
    location.hash = "#/";
  };
  return (
    <div className="onb" style={{ justifyContent: "flex-start", paddingTop: 32 }}>
      <div className="row">{back}<div className="grow"><div className="kicker">Your pledge · 約束</div></div><span className="xs mu">6/6</span></div>
      <div className="bar thin mt8"><i style={{ width: "100%" }} /></div>
      <div className="card mt24" style={{ padding: 22, background: "var(--surface)", boxShadow: "var(--shadow-2)", position: "relative", overflow: "hidden" }}>
        <div className="serif" style={{ position: "absolute", right: -6, bottom: -30, fontSize: 130, opacity: .07, fontWeight: 700 }}>約束</div>
        <div className="kicker">I promise</div>
        <p style={{ fontSize: 19, lineHeight: 1.55, margin: "10px 0", fontWeight: 600 }}>
          I, <b style={{ color: "var(--shu)" }}>{name}</b>, will study Japanese for <b style={{ color: "var(--shu)" }}>{mins} minutes every day</b> for the next <b>30 days</b>{why.length ? <> — because I want to <b>{why.slice(0, 2).join(" and ")}</b></> : null}.
        </p>
        <p className="sm mu" style={{ margin: 0 }}>Even on busy days I’ll do at least a few flashcards. Every day I keep my promise earns XP, and streaks of 3, 7, 21 and 30 days unlock badges.</p>
        <div className="jp mt12" style={{ fontSize: 18, fontWeight: 700 }}>毎日頑張ります！ <span className="sm mu" style={{ fontFamily: "var(--font)", fontWeight: 500 }}>(mainichi ganbarimasu — I’ll do my best every day)</span></div>
      </div>
      <div className="center mt24">
        <button aria-label="Press and hold to sign the pledge" onPointerDown={start} onPointerUp={stop} onPointerLeave={stop} onPointerCancel={stop}
          style={{ width: 120, height: 120, borderRadius: "50%", position: "relative", background: done ? "var(--matcha)" : "var(--shu)", color: "#fff", boxShadow: "0 12px 30px color-mix(in srgb, var(--shu) 40%, transparent)", touchAction: "none", userSelect: "none" }}>
          <svg width="120" height="120" style={{ position: "absolute", inset: 0, transform: "rotate(-90deg)" }}><circle cx="60" cy="60" r="55" fill="none" stroke="rgba(255,255,255,.9)" strokeWidth="6" strokeDasharray={345} strokeDashoffset={345 * (1 - hold)} strokeLinecap="round" /></svg>
          <span style={{ fontSize: done ? 40 : 30 }}>{done ? "✓" : "🤝"}</span>
        </button>
        <div className="sm mu mt12">{done ? "Signed! お約束ありがとう。" : "Press and hold to sign"}</div>
      </div>
      <div style={{ flex: 1 }} />
      <button className="btn primary lg block mt24" disabled={!done} onClick={finish}>I’m in — start my first day <ArrowRight size={18} /></button>
    </div>
  );
}
