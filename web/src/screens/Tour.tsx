import { useState } from "react";
import { ArrowRight, BookOpen, Compass, Dumbbell, Home, Mic, User } from "lucide-react";
import { tap } from "../ui/kit";

const SLIDES = [
  { icon: <span style={{ fontSize: 40 }}>🧭</span>, title: "Your 20-minute daily routine", body: (
    <ol className="sm" style={{ lineHeight: 1.8, paddingLeft: 20, margin: 0, textAlign: "left" }}>
      <li><b>5 min · Flashcards</b> — review what’s due, learn a few new cards.</li>
      <li><b>5 min · Learn</b> — one kana row or one grammar lesson.</li>
      <li><b>5 min · Speak</b> — say words out loud and record them (🎙).</li>
      <li><b>5 min · Listen</b> — a YouTube video from Explore → Resources.</li>
    </ol>) , note: "The Home screen shows “Today’s plan” and ticks each task for you." },
  { icon: <Home size={40} />, title: "Home — what to do next", body: <p>The <b>Up next</b> card always points to your next step: scripts → hiragana → katakana → grammar → words. Just keep tapping it.</p>, note: "Your daily-goal ring, level, streak and pledge are here too." },
  { icon: <BookOpen size={40} />, title: "Learn — the course", body: <p>Scripts with <b>stroke order</b>, how to pronounce, 24 grammar lessons (tenses, verbs, nouns…), a verb conjugator, 1,000 words and survival phrases — all with English & हिन्दी.</p>, note: "Tap 🔊 to hear, 🐢 for slow, and any dotted 日本語 text to hear it." },
  { icon: <Dumbbell size={40} />, title: "Practice — make it stick", body: <p>Flashcards that return right before you forget, 8 quiz types, a writing pad that scores your strokes, and <b>Speak aloud</b> with speech recognition.</p>, note: "The red dot on Practice = cards waiting for review." },
  { icon: <Mic size={40} />, title: "🎙 Record & see your voice", body: <p>The green mic button next to words records you and draws your <b>spectrum</b>: low / mid / high energy compared to a reference, plus loudness, speed and melody — with tips.</p>, note: "The Sound Lab (Practice) shows a live spectrogram and your vowels on a chart." },
  { icon: <Compass size={40} />, title: "Explore — people & resources", body: <p>Japanese culture: what people love and dislike, etiquette, communication, Japan–India links. Plus your roadmap, timeline, JLPT levels and YouTube channels.</p>, note: "" },
  { icon: <User size={40} />, title: "Me — your progress", body: <p>Total time, time per section, daily chart, accuracy, mastery, voice history and badges. Settings has Hindi/romaji toggles, voice speed and backup.</p>, note: "Tap the ? on Home any time to see this tour again." },
];

export default function Tour({ onDone }: { onDone: () => void }) {
  const [i, setI] = useState(0);
  const s = SLIDES[i];
  const last = i === SLIDES.length - 1;
  return (
    <>
      <div className="scrim" style={{ zIndex: 97 }} />
      <div className="modal" style={{ zIndex: 98, textAlign: "center", padding: "26px 20px 18px" }} role="dialog" aria-label="App tour">
        <div style={{ width: 78, height: 78, borderRadius: 24, margin: "0 auto 12px", display: "grid", placeItems: "center", background: "var(--shu-soft)", color: "var(--shu)" }}>{s.icon}</div>
        <div className="kicker">How it works · {i + 1}/{SLIDES.length}</div>
        <h2 style={{ margin: "6px 0 10px", fontSize: 21 }}>{s.title}</h2>
        <div className="sm" style={{ lineHeight: 1.6 }}>{s.body}</div>
        {s.note && <div className="xs mu mt8">{s.note}</div>}
        <div className="row mt16" style={{ justifyContent: "center", gap: 6 }}>{SLIDES.map((_, k) => <i key={k} style={{ width: k === i ? 18 : 7, height: 7, borderRadius: 4, background: k === i ? "var(--shu)" : "var(--line-2)", transition: "all .25s", display: "block" }} />)}</div>
        <div className="row mt16">
          <button className="btn ghost grow" onClick={() => { tap(); onDone(); }}>{last ? "Close" : "Skip"}</button>
          <button className="btn primary grow" onClick={() => { tap(); if (last) onDone(); else setI(i + 1); }}>{last ? "Start learning" : "Next"} <ArrowRight size={16} /></button>
        </div>
      </div>
    </>
  );
}
