import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Volume2 } from "lucide-react";
import { speak } from "../core/native";
import { tap } from "../ui/kit";
import { Icon } from "../ui/icons";

type Slide = { id: string; bg: [string, string]; kicker: string; title: string; text: string; jp: string; jpRo: string; jpEn: string; front?: string; back?: string; chips: [string, string][] };

const SLIDES: Slide[] = [
  { id: "hello", bg: ["#e2553c", "#8f2a3c"], kicker: "Welcome · ようこそ · स्वागत है", title: "Learn Japanese from your very first あ", text: "A friendly path from zero to real conversations - explained in English and हिन्दी. Free, offline, no ads.", jp: "ようこそ", jpRo: "yōkoso", jpEn: "welcome", chips: [["book", "2,000 words"], ["chat", "5,000+ sentences"], ["shield", "100% offline"]] },
  { id: "read", bg: ["#2f6fb0", "#1b2f5c"], kicker: "Read & write", title: "Read and write in days, not months", text: "All 104 kana with sound, Hindi hints and memory tricks. Watch each stroke, trace it with your finger and get a score.", jp: "あいうえお", jpRo: "a i u e o", jpEn: "the 5 vowels", front: "kana", back: "write", chips: [["volume", "Hear every sound"], ["pen", "Stroke order"]] },
  { id: "speak", bg: ["#c2410c", "#5b1d0e"], kicker: "Speak", title: "Speak - and see your own voice", text: "Record any word or sentence. The app checks what you said, draws your spectrum and shows where your vowels land.", jp: "こんにちは", jpRo: "konnichiwa", jpEn: "hello", front: "speak", back: "lab", chips: [["mic", "Record & replay"], ["wave", "Voice analysis"]] },
  { id: "words", bg: ["#3f7d4e", "#173726"], kicker: "Words that matter", title: "The 2,000 words people really say", text: "Most-spoken words first, each with an example sentence, Hindi meaning and smart flashcards that return just before you forget.", jp: "食べる", jpRo: "taberu", jpEn: "to eat", front: "words", back: "cards", chips: [["layers", "Smart flashcards"], ["flag", "JLPT N5–N1"]] },
  { id: "japan", bg: ["#7a3fa0", "#2c1745"], kicker: "Discover Japan", title: "Explore the country behind the language", text: "A map of all 47 prefectures, famous places with photos, culture and etiquette - what people love and what to avoid.", jp: "日本", jpRo: "Nihon", jpEn: "Japan", front: "famous", back: "geo", chips: [["earth", "Map & places"], ["heart", "Culture"]] },
  { id: "grow", bg: ["#b7791f", "#4a2c0b"], kicker: "Every day", title: "A little every day - and see yourself grow", text: "A daily plan that ticks itself, streaks, XP, 30+ badges and a personal goal. Your progress stays on your phone.", jp: "がんばって", jpRo: "ganbatte", jpEn: "you can do it!", front: "home", chips: [["flame", "Streaks"], ["trophy", "Badges"], ["target", "Goals"]] },
];

/** First-run intro: swipe through real screens of the app, each slide says a Japanese word aloud. */
export default function Intro({ onDone }: { onDone: () => void }) {
  const [i, setI] = useState(0);
  const [dir, setDir] = useState(1);
  const x0 = useRef<number | null>(null);
  const sl = SLIDES[i];
  const last = i === SLIDES.length - 1;
  const say = () => speak(sl.jp, { lang: "ja-JP", rate: 0.85 });
  useEffect(() => { const t = window.setTimeout(say, 450); return () => window.clearTimeout(t); }, [i]); // eslint-disable-line
  const goTo = (n: number) => { if (n < 0 || n >= SLIDES.length) return; tap(); setDir(n > i ? 1 : -1); setI(n); };

  return (
    <div className="intro" style={{ background: `radial-gradient(120% 70% at 80% 0%, ${sl.bg[0]}, ${sl.bg[1]} 70%)` }}
      onPointerDown={(e) => { x0.current = e.clientX; }}
      onPointerUp={(e) => { if (x0.current == null) return; const dx = e.clientX - x0.current; x0.current = null; if (Math.abs(dx) > 50) goTo(i + (dx < 0 ? 1 : -1)); }}>
      <div className="intro-petals" aria-hidden="true">{Array.from({ length: 9 }, (_, k) => <i key={k} style={{ left: (k * 11 + 5) % 100 + "%", animationDelay: k * 1.3 + "s", animationDuration: 9 + (k % 4) * 2 + "s" }} />)}</div>
      <div className="intro-top">
        <div className="intro-bars">{SLIDES.map((s, k) => <button key={s.id} aria-label={"Slide " + (k + 1)} onClick={() => goTo(k)}><i style={{ width: k < i ? "100%" : k === i ? "100%" : "0%", opacity: k <= i ? 1 : 0 }} /></button>)}</div>
        {!last && <button className="intro-skip" onClick={() => { tap(); onDone(); }}>Skip</button>}
      </div>

      <div key={sl.id} className="intro-stage" style={{ ["--dir" as string]: dir }}>
        {sl.front ? (
          <div className="intro-phones">
            {sl.back && <div className="phone back"><img src={"intro/" + sl.back + ".webp"} alt="" /></div>}
            <div className={"phone front" + (sl.back ? "" : " solo")}><img src={"intro/" + sl.front + ".webp"} alt={sl.title} /></div>
          </div>
        ) : (
          <div className="intro-hero">
            <div className="intro-logo"><span>道</span></div>
            <div className="intro-name">Nihongo Path</div>
            <div className="intro-jpname">日本語の道</div>
          </div>
        )}
        <div className="intro-chips">{sl.chips.map(([ic, t], k) => <span key={t} style={{ animationDelay: 0.25 + k * 0.12 + "s" }}><Icon name={ic} size={14} /> {t}</span>)}</div>
      </div>

      <div key={sl.id + "t"} className="intro-text">
        <div className="intro-kicker">{sl.kicker}</div>
        <h1>{sl.title}</h1>
        <p>{sl.text}</p>
        <button className="intro-say" onClick={(e) => { e.stopPropagation(); say(); }}>
          <Volume2 size={16} /><span className="jp">{sl.jp}</span><span className="ro">{sl.jpRo} · {sl.jpEn}</span>
        </button>
      </div>

      <div className="intro-nav">
        {i > 0 && <button className="intro-back" aria-label="Back" onClick={() => goTo(i - 1)}><ArrowLeft size={20} /></button>}
        <button className="intro-next" onClick={() => (last ? (tap(), onDone()) : goTo(i + 1))}>{last ? "Set up in 1 minute" : i === 0 ? "Show me the app" : "Next"} <ArrowRight size={18} /></button>
      </div>
    </div>
  );
}
