import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { dayKey, getProgress, setSettings, useSettings } from "../core/store";
import { checkBadges } from "../core/rewards";
import { PACKS } from "../packs/registry";
import { speak, vibrate } from "../core/native";
import { Switch, tap } from "../ui/kit";
import PolicyReader from "./PolicyReader";
import { ParentConsent } from "./Privacy";
import { MINOR_AGES } from "../core/child";
import { StrokeView } from "../ui/StrokeView";
import { Icon } from "../ui/icons";
import { GoalEditor } from "../ui/Goal";

const AGES = ["Under 13", "13–17", "18–24", "25–34", "35–44", "45–59", "60+", "Prefer not to say"];
const REASONS: [string, string, string][] = [["travel", "Travel to Japan", "plane"], ["anime", "Anime, manga, games", "game"], ["job", "Job in Japan", "briefcase"], ["jlpt", "Pass the JLPT", "notebook"], ["study", "Study in Japan", "grad"], ["friends", "Friends or family", "users"], ["business", "Business / clients", "building"], ["fun", "Brain training & fun", "brain"]];
const TIMES = [10, 15, 20, 30, 45, 60];

export default function Onboarding() {
  const s = useSettings();
  // Users who finished the old onboarding jump straight to the new profile questions.
  const [step, setStep] = useState(s.onboarded ? 4 : 0);
  const [name, setName] = useState(s.name);
  const [age, setAge] = useState(s.age);
  const [reasons, setReasons] = useState<string[]>(s.reasons || []);
  const [mins, setMins] = useState(s.dailyGoalMin || 20);
  const [consent, setConsent] = useState(s.privacyOk);
  const [policy, setPolicy] = useState(false);
  const [readPolicy, setReadPolicy] = useState(s.privacyOk);
  const [parentView, setParentView] = useState(false);
  const next = () => { tap(); setParentView(false); setStep(step + 1); };
  const backBtn = step > (s.onboarded ? 4 : 1) && <button className="icon-btn" aria-label="Back" onClick={() => setStep(step - 1)}><ArrowLeft size={20} /></button>;
  const total = 7, shown = step;
  const Head = ({ kicker, title, sub }: { kicker: string; title: string; sub?: string }) => (<>
    <div className="row">{backBtn}<div className="grow"><div className="kicker">{kicker}</div></div><span className="xs mu">{shown}/{total}</span></div>
    <div className="bar thin mt8"><i style={{ width: (shown / total) * 100 + "%" }} /></div>
    <h1 style={{ fontSize: 27, margin: "18px 0 4px", letterSpacing: "-.02em", lineHeight: 1.2 }}>{title}</h1>
    {sub && <p className="mu" style={{ marginTop: 0 }}>{sub}</p>}
  </>);

  if (step === 0) return (
    <div className="onb tint-shu" style={{ position: "relative", overflow: "hidden", justifyContent: "space-between" }}>
      <div className="serif" style={{ position: "absolute", top: "6vh", right: -24, fontSize: 250, opacity: .1, lineHeight: 1, fontWeight: 700 }}>道</div>
      <div style={{ paddingTop: "8vh" }}>
        <div className="kicker">Welcome · ようこそ · स्वागत है</div>
        <div className="kana-cycle mt16" aria-hidden="true">{["あ", "ア", "日", "語"].map((k, i) => <span key={k} style={{ animationDelay: i * 2 + "s" }}>{k}</span>)}</div>
      </div>
      <div>
        <h1 style={{ fontSize: 34, margin: "0 0 6px", letterSpacing: "-.02em", lineHeight: 1.1 }}>Nihongo Path</h1>
        <p style={{ fontSize: 17, margin: "0 0 8px", opacity: .92, lineHeight: 1.45 }}>Learn Japanese from your very first あ to real conversations - explained in English and हिन्दी.</p>
        <p style={{ fontSize: 15, margin: "0 0 22px", opacity: .85 }}>Let us show you around in 30 seconds.</p>
        <button className="btn white lg block" onClick={() => { next(); speak("ようこそ", { lang: "ja-JP" }); }}>Let’s begin <ArrowRight size={18} /></button>
        <div className="xs center mt8" style={{ opacity: .8 }}>Takes about one minute to set up</div>
      </div>
    </div>
  );

  if (step === 1) return <Showcase onDone={next} />;

  if (step === 2) return (
    <div className="onb" style={{ justifyContent: "flex-start", paddingTop: 32 }}>
      <Head kicker="Your journey" title="Here’s how you’ll go from zero to talking" />
      <div style={{ position: "relative", marginTop: 4 }}>
        <div style={{ position: "absolute", left: 20, top: 24, bottom: 24, width: 2, background: "linear-gradient(var(--shu), var(--matcha))", opacity: .5 }} />
        {[["あ", "Week 1–2", "Read the alphabets", "Hiragana and katakana with sound, Hindi hints, memory tricks and stroke order.", "var(--shu)"],
          ["語", "Week 2–4", "First 100 words + simple sentences", "Already about 65% of everyday spoken Japanese. Introduce yourself.", "#e8793a"],
          ["文", "Month 1–3", "Grammar, verbs and tenses", "Compared with English and Hindi - Japanese uses the same word order as Hindi.", "var(--ai)"],
          ["話", "Month 3–5", "1,000 words · JLPT N5", "Hold short conversations about daily life, food, travel and work.", "var(--matcha)"]].map(([k, when, t, d, c]) => (
          <div key={when} className="row top" style={{ gap: 12, padding: "8px 0", position: "relative" }}>
            <div className="jp" style={{ width: 42, height: 42, borderRadius: 14, background: c, color: "#fff", display: "grid", placeItems: "center", fontSize: 20, fontWeight: 700, flex: "none", boxShadow: "0 0 0 4px var(--bg)" }}>{k}</div>
            <div className="card grow" style={{ padding: "10px 12px", marginTop: 0 }}>
              <div className="kicker" style={{ color: c }}>{when}</div>
              <div style={{ fontWeight: 800 }}>{t}</div>
              <div className="xs mu">{d}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="card mt8" style={{ padding: 12 }}>
        <div className="kicker">Every day</div>
        <div className="grid2 mt8" style={{ gap: 8 }}>
          {[["layers", "Review flashcards"], ["book", "One short lesson"], ["mic", "Speak & record"], ["pen", "Write characters"]].map(([ic, t]) => (
            <div key={t} className="row sm" style={{ gap: 8, fontWeight: 600 }}><span style={{ color: "var(--shu)" }}><Icon name={ic} size={17} /></span>{t}</div>
          ))}
        </div>
        <div className="xs mu mt8">Home shows a “Today’s plan” that ticks itself as you go.</div>
      </div>
      <div style={{ flex: 1 }} />
      <button className="btn primary lg block mt16" onClick={next}>Sounds good <ArrowRight size={18} /></button>
    </div>
  );

  if (step === 3) return (
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

  if (step === 4 && parentView) return (
    <div className="onb" style={{ justifyContent: "flex-start", paddingTop: 32 }}>
      <Head kicker="For parents" title="Please ask a parent or guardian" sub="Because you’re under 18, the law asks a parent to agree before voice recordings are saved." />
      <ParentConsent onDone={next} />
      <button className="btn ghost block mt12" onClick={() => { setSettings({ parentConsent: null }); next(); }}>Continue in child mode</button>
      <div className="xs mu mt8" style={{ lineHeight: 1.5 }}>Child mode: everything works, but voice recordings and drawings are not saved and support/payment links are hidden. A parent can agree later in Settings → Privacy.</div>
    </div>
  );

  if (step === 4) return (
    <div className="onb" style={{ justifyContent: "flex-start", paddingTop: 32 }}>
      <Head kicker="About you" title="Nice to meet you! What’s your name?" sub="はじめまして - we’ll use it to cheer you on." />
      <input type="text" value={name} placeholder="Your name" onChange={(e) => setName(e.target.value)} autoComplete="given-name" />
      {name.trim() && <div className="card soft-shu mt12" style={{ boxShadow: "none" }}><div className="jp" style={{ fontSize: 20, fontWeight: 700 }}>はじめまして、{name.trim()}さん！</div><div className="xs mu">hajimemashite, {name.trim()}-san - nice to meet you</div></div>}
      <div className="sm mu mt16" style={{ fontWeight: 700 }}>Your age (optional)</div>
      <div className="row wrap mt8 gap6">{AGES.map((a) => <button key={a} className={"chip" + (age === a ? " shu on" : "")} onClick={() => { tap(); setAge(a); }}>{a}</button>)}</div>
      <div className="xs mu mt8">Optional. Stays on this phone only and is used to suggest a sensible daily pace. Under 18? Please check with a parent before using voice features.</div>
      <div style={{ flex: 1 }} />
      <label className="row top mt16 sm" style={{ gap: 10, lineHeight: 1.5 }}>
        <input type="checkbox" checked={consent} onChange={(e) => { if (!readPolicy) { e.preventDefault(); setPolicy(true); return; } setConsent(e.target.checked); }} style={{ width: 20, height: 20, marginTop: 2, accentColor: "var(--shu)" }} />
        <span>I agree that my profile, progress, voice recordings and drawings are stored <b>on this phone only</b>, as explained in the <button style={{ color: "var(--shu)", fontWeight: 700, textDecoration: "underline" }} onClick={(e) => { e.preventDefault(); setPolicy(true); }}>privacy policy</button>. I can delete them any time.</span>
      </label>
      {!readPolicy && <button className="btn white block mt8" onClick={() => setPolicy(true)}>Read the privacy policy (needed to continue)</button>}
      {readPolicy && !consent && <div className="xs mt8" style={{ color: "var(--matcha)", fontWeight: 700 }}>✓ Policy read - tick the box to agree.</div>}
      <PolicyReader open={policy} onClose={() => setPolicy(false)} onRead={() => setReadPolicy(true)} />
      <button className="btn primary lg block mt24" disabled={!name.trim() || !consent} onClick={() => {
        const minor = MINOR_AGES.includes(age);
        setSettings({ name: name.trim(), age, minor, privacyOk: true });
        if (name.trim()) speak("はじめまして、" + name.trim() + "さん", { lang: "ja-JP" });
        if (minor && !s.parentConsent) setParentView(true); else next();
      }}>Continue <ArrowRight size={18} /></button>
    </div>
  );

  if (step === 5) return (
    <div className="onb" style={{ justifyContent: "flex-start", paddingTop: 32 }}>
      <Head kicker="Your why" title="Why are you learning Japanese?" sub="Pick all that apply. A strong reason keeps you going on hard days." />
      <div className="grid2">
        {REASONS.map(([k, l, ic]) => { const on = reasons.includes(k); return (
          <button key={k} className="tile" style={{ minHeight: 84, justifyContent: "center", boxShadow: on ? "inset 0 0 0 2px var(--shu), var(--shadow-1)" : undefined, background: on ? "var(--shu-soft)" : undefined }}
            onClick={() => { tap(); setReasons(on ? reasons.filter((x) => x !== k) : [...reasons, k]); }}>
            <span className="row gap6" style={{ color: on ? "var(--shu)" : "var(--ink-2)" }}><Icon name={ic} size={20} /></span><span className="t" style={{ fontSize: 14 }}>{l}</span>
          </button>); })}
      </div>
      <div style={{ flex: 1 }} />
      <button className="btn primary lg block mt24" disabled={!reasons.length} onClick={() => { setSettings({ reasons }); next(); }}>Continue <ArrowRight size={18} /></button>
    </div>
  );

  if (step === 6) {
    const wpd = mins <= 15 ? 10 : mins <= 30 ? 15 : mins <= 45 ? 22 : 30;
    const dt = new Date(); dt.setDate(dt.getDate() + (mins <= 15 ? 18 : 14) + Math.ceil(1000 / wpd));
    const young = age === "Under 13";
    return (
      <div className="onb" style={{ justifyContent: "flex-start", paddingTop: 32 }}>
        <Head kicker="Commitment" title="How much time can you give every day?" sub={young ? "10–20 minutes a day is perfect for your age." : "Choose what you can do even on a busy day - consistency beats long sessions."} />
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
          <div className="sm mt4" style={{ lineHeight: 1.9 }}>{[<>Read both kana in about <b>{mins <= 15 ? 3 : 2} weeks</b></>, <>About <b>{wpd} new words</b> a day</>, <>1,000 core words by around <b>{dt.toLocaleDateString(undefined, { month: "long", year: "numeric" })}</b></>].map((t, i) => <div key={i} className="row gap6"><Icon name="check" size={16} color="#7fe0a0" />{t}</div>)}</div>
        </div>
        <details className="card mt12" style={{ padding: 14 }}><summary style={{ fontWeight: 800, cursor: "pointer" }}>Have a deadline? Set a personal goal (optional)</summary><div className="mt12"><GoalEditor /></div></details>
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
  const why = REASONS.filter(([k]) => reasons.includes(k)).map(([, l]) => l.toLowerCase());
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
      <div className="row">{back}<div className="grow"><div className="kicker">Your pledge · 約束</div></div><span className="xs mu">7/7</span></div>
      <div className="bar thin mt8"><i style={{ width: "100%" }} /></div>
      <div className="card mt24" style={{ padding: 22, background: "var(--surface)", boxShadow: "var(--shadow-2)", position: "relative", overflow: "hidden" }}>
        <div className="serif" style={{ position: "absolute", right: -6, bottom: -30, fontSize: 130, opacity: .07, fontWeight: 700 }}>約束</div>
        <div className="kicker">I promise</div>
        <p style={{ fontSize: 19, lineHeight: 1.55, margin: "10px 0", fontWeight: 600 }}>
          I, <b style={{ color: "var(--shu)" }}>{name}</b>, will study Japanese for <b style={{ color: "var(--shu)" }}>{mins} minutes every day</b> for the next <b>30 days</b>{why.length ? <> - because I want to <b>{why.slice(0, 2).join(" and ")}</b></> : null}.
        </p>
        <p className="sm mu" style={{ margin: 0 }}>Even on busy days I’ll do at least a few flashcards. Every day I keep my promise earns XP, and streaks of 3, 7, 21 and 30 days unlock badges.</p>
        <div className="jp mt12" style={{ fontSize: 18, fontWeight: 700 }}>毎日頑張ります！ <span className="sm mu" style={{ fontFamily: "var(--font)", fontWeight: 500 }}>(mainichi ganbarimasu - I’ll do my best every day)</span></div>
      </div>
      <div className="center mt24">
        <button aria-label="Press and hold to sign the pledge" onPointerDown={start} onPointerUp={stop} onPointerLeave={stop} onPointerCancel={stop}
          style={{ width: 120, height: 120, borderRadius: "50%", position: "relative", background: done ? "var(--matcha)" : "var(--shu)", color: "#fff", boxShadow: "0 12px 30px color-mix(in srgb, var(--shu) 40%, transparent)", touchAction: "none", userSelect: "none" }}>
          <svg width="120" height="120" style={{ position: "absolute", inset: 0, transform: "rotate(-90deg)" }}><circle cx="60" cy="60" r="55" fill="none" stroke="rgba(255,255,255,.9)" strokeWidth="6" strokeDasharray={345} strokeDashoffset={345 * (1 - hold)} strokeLinecap="round" /></svg>
          <span style={{ position: "relative", display: "grid", placeItems: "center" }}><Icon name={done ? "check" : "handshake"} size={done ? 46 : 40} /></span>
        </button>
        <div className="sm mu mt12">{done ? "Signed! お約束ありがとう。" : "Press and hold to sign"}</div>
      </div>
      <div style={{ flex: 1 }} />
      <button className="btn primary lg block mt24" disabled={!done} onClick={finish}>I’m in - start my first day <ArrowRight size={18} /></button>
    </div>
  );
}

/** "What is Nihongo Path" - five slides with live mini demos, shown before setup. */
function Showcase({ onDone }: { onDone: () => void }) {
  const [i, setI] = useState(0);
  const Kana = () => (
    <div className="row" style={{ gap: 6, justifyContent: "center" }}>
      {[["あ", "a", "अ"], ["か", "ka", "क"], ["さ", "sa", "स"], ["た", "ta", "त"]].map(([k, r, h]) => (
        <div key={k} className="kcell" style={{ width: 60 }}><b>{k}</b><span className="r">{r}</span><span className="h">{h}</span></div>
      ))}
    </div>
  );
  const Spectro = () => (
    <div className="row" style={{ gap: 10, justifyContent: "center", alignItems: "stretch" }}>
      <div style={{ width: 130, height: 110, borderRadius: 14, background: "linear-gradient(0deg,#0c0e1c 0%,#2e3478 30%,#aa285a 55%,#ec5c32 70%,#fac450 80%,#0c0e1c 100%)", position: "relative", overflow: "hidden" }}>
        {[18, 46, 74, 102].map((x) => <i key={x} style={{ position: "absolute", left: x, top: 0, bottom: 0, width: 10, background: "rgba(12,14,28,.55)" }} />)}
      </div>
      <svg viewBox="0 0 110 110" width="110" height="110" style={{ background: "var(--surface)", borderRadius: 14 }}>
        {[["い", 22, 22], ["え", 36, 50], ["あ", 60, 92], ["お", 92, 52], ["う", 70, 26]].map(([l, x, y]) => <g key={l as string}><circle cx={x as number} cy={y as number} r="10" fill="var(--shu)" /><text x={x as number} y={(y as number) + 4} textAnchor="middle" style={{ fill: "#fff", fontSize: 10, fontWeight: 800 }}>{l}</text></g>)}
        <circle cx="64" cy="80" r="7" fill="var(--matcha)" stroke="#fff" strokeWidth="2" />
      </svg>
    </div>
  );
  const Cards = () => (
    <div className="row" style={{ gap: 10, justifyContent: "center" }}>
      <div className="card" style={{ width: 120, textAlign: "center", margin: 0, padding: 12 }}><div className="jp" style={{ fontSize: 30, fontWeight: 700 }}>食べる</div><div className="xs mu">to eat · खाना</div><div className="row mt4" style={{ justifyContent: "center", gap: 2 }}>{[1, 2, 3, 4, 5].map((n) => <i key={n} style={{ width: 4, height: 4 + n * 2, borderRadius: 2, background: n <= 4 ? "var(--gold)" : "var(--line-2)", display: "block" }} />)}</div></div>
      <div className="col" style={{ gap: 6 }}>{[["food", "Food"], ["train", "Travel"], ["users", "Family"]].map(([ic, t]) => <span key={t} className="chip" style={{ height: 30 }}><Icon name={ic} size={14} /> {t}</span>)}</div>
    </div>
  );
  const Rewards = () => (
    <div className="row" style={{ gap: 10, justifyContent: "center" }}>
      {["flame", "medal", "trophy", "handshake"].map((ic) => <div key={ic} style={{ width: 54, height: 54, borderRadius: 27, display: "grid", placeItems: "center", background: "var(--gold-soft)", color: "var(--gold)", boxShadow: "inset 0 0 0 2px color-mix(in srgb, var(--gold) 40%, transparent)" }}><Icon name={ic} size={24} /></div>)}
    </div>
  );
  const slides: { k: string; title: string; text: string; demo: React.ReactNode }[] = [
    { k: "Learn", title: "Learn Japanese from zero", text: "The 3 scripts with sound, Hindi hints and memory tricks, 25 short grammar lessons and the 2,000 most-spoken words - all explained in English and हिन्दी.", demo: <Kana /> },
    { k: "Speak", title: "Speak - and see your voice", text: "Every word is spoken aloud. Record yourself: the app checks the words, draws your spectrogram and shows where your vowels land on a mouth map.", demo: <Spectro /> },
    { k: "Write", title: "Write with real stroke order", text: "Watch each character being drawn, trace it with your finger, and get an accuracy score for shape, stroke count and order.", demo: <div style={{ display: "grid", placeItems: "center" }}><StrokeView ch="あ" size={120} speed={0.5} showNumbers={false} /></div> },
    { k: "Remember", title: "Remember with smart review", text: "Flashcards come back just before you’d forget. Study by topic (food, travel, family…) or JLPT level, with quizzes, a sentence bank and a frequency meter.", demo: <Cards /> },
    { k: "Stay", title: "Stay motivated - and understand Japan", text: "XP, streaks, 30+ badges, a daily pledge and a personal goal - plus culture notes on what Japanese people love, dislike and expect.", demo: <Rewards /> },
  ];
  const sl = slides[i];
  const last = i === slides.length - 1;
  return (
    <div className="onb" style={{ justifyContent: "flex-start", paddingTop: 32 }}>
      <div className="row"><div className="kicker grow">What is Nihongo Path · {i + 1}/{slides.length}</div><button className="sm mu" onClick={onDone}>Skip</button></div>
      <div className="row mt8" style={{ gap: 6 }}>{slides.map((x, k) => <button key={x.k} onClick={() => setI(k)} aria-label={x.k} style={{ flex: 1, height: 5, borderRadius: 3, background: k <= i ? "var(--shu)" : "var(--line-2)" }} />)}</div>
      <div key={i} className="card mt24" style={{ padding: "22px 16px", minHeight: 170, display: "grid", placeItems: "center", animation: "screenIn .35s both" }}>{sl.demo}</div>
      <div className="kicker mt24" style={{ color: "var(--shu)" }}>{sl.k}</div>
      <h1 style={{ fontSize: 27, margin: "4px 0 8px", letterSpacing: "-.02em", lineHeight: 1.2 }}>{sl.title}</h1>
      <p className="mu" style={{ fontSize: 16, lineHeight: 1.55, margin: 0 }}>{sl.text}</p>
      <div style={{ flex: 1 }} />
      <div className="row mt24">
        {i > 0 && <button className="btn lg" onClick={() => setI(i - 1)}><ArrowLeft size={18} /></button>}
        <button className="btn primary lg grow" onClick={() => { tap(); if (last) onDone(); else setI(i + 1); }}>{last ? "See your journey" : "Next"} <ArrowRight size={18} /></button>
      </div>
    </div>
  );
}
