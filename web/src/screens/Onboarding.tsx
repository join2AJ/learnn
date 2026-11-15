import { useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import { setSettings, useSettings } from "../core/store";
import { PACKS } from "../packs/registry";
import { speak } from "../core/native";
import { Switch, tap } from "../ui/kit";

export default function Onboarding() {
  const s = useSettings();
  const [step, setStep] = useState(0);
  const [name, setName] = useState(s.name);
  const next = () => { tap(); setStep(step + 1); };

  if (step === 0) return (
    <div className="onb tint-shu" style={{ position: "relative", overflow: "hidden" }}>
      <div className="serif" style={{ position: "absolute", top: "8vh", right: -20, fontSize: 260, opacity: .12, lineHeight: 1, fontWeight: 700 }}>道</div>
      <div className="kicker">Welcome · ようこそ</div>
      <div className="big-jp" style={{ margin: "14px 0 10px" }}>日本語<br />の道</div>
      <h1 style={{ fontSize: 30, margin: "0 0 10px", letterSpacing: "-.02em" }}>Nihongo Path</h1>
      <p className="mu" style={{ fontSize: 16, margin: "0 0 26px", maxWidth: 420 }}>
        From your very first あ to real conversations — scripts, sounds, grammar, 1,000 core words, culture and a Sound Lab that shows your voice. Explained in English and हिन्दी.
      </p>
      <button className="btn white lg block" onClick={() => { next(); speak("ようこそ", { lang: "ja-JP" }); }}>Let’s begin <ArrowRight size={18} /></button>
    </div>
  );

  if (step === 1) return (
    <div className="onb" style={{ justifyContent: "flex-start", paddingTop: 40 }}>
      <div className="kicker">Step 1 of 2</div>
      <h1 style={{ fontSize: 28, margin: "8px 0 4px" }}>What do you want to learn?</h1>
      <p className="mu" style={{ marginTop: 0 }}>Japanese is ready. The same engine will power more languages soon.</p>
      <div className="list mt12">
        {PACKS.map((pk) => (
          <button key={pk.id} className="li" disabled={pk.status !== "ready"} style={{ opacity: pk.status === "ready" ? 1 : .55 }}
            onClick={() => { tap(); setSettings({ lang: pk.id }); }}>
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

  return (
    <div className="onb" style={{ justifyContent: "flex-start", paddingTop: 40 }}>
      <div className="kicker">Step 2 of 2</div>
      <h1 style={{ fontSize: 28, margin: "8px 0 16px" }}>Make it yours</h1>
      <label className="sm mu" htmlFor="nm">Your name (optional)</label>
      <input id="nm" type="text" value={name} placeholder="e.g. Priya" onChange={(e) => setName(e.target.value)} className="mt4" />
      <div className="sm mu mt16">Daily goal</div>
      <div className="grid3 mt8">
        {[[10, "Casual", "🌱"], [20, "Regular", "🔥"], [45, "Intense", "⚡"]].map(([m, l, e]) => (
          <button key={m} className="tile" style={{ minHeight: 96, alignItems: "center", boxShadow: s.dailyGoalMin === m ? "inset 0 0 0 2px var(--shu)" : undefined }}
            onClick={() => { tap(); setSettings({ dailyGoalMin: m as number }); }}>
            <span style={{ fontSize: 24 }}>{e}</span><span className="t">{m} min</span><span className="d">{l}</span>
          </button>
        ))}
      </div>
      <div className="list mt16">
        <div className="li"><span className="grow"><div className="t">Show Hindi (हिन्दी)</div><div className="d">Meanings and comparisons in Hindi</div></span><Switch on={s.showHindi} onChange={(v) => setSettings({ showHindi: v })} /></div>
        <div className="li"><span className="grow"><div className="t">Show romaji</div><div className="d">Latin letters under Japanese — turn off once you read kana</div></span><Switch on={s.showRomaji} onChange={(v) => setSettings({ showRomaji: v })} /></div>
      </div>
      <div style={{ flex: 1 }} />
      <button className="btn primary lg block mt24" onClick={() => { tap(); setSettings({ name: name.trim(), onboarded: true }); location.hash = "#/"; }}>Start learning <ArrowRight size={18} /></button>
    </div>
  );
}
