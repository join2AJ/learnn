import { useEffect, useState } from "react";
import { BookOpen, Compass, Dumbbell, Home as HomeIcon, User } from "lucide-react";
import { go, sectionOf, useRoute } from "./core/router";
import { onUi, toast, UiEvent, useProgress, useSettings } from "./core/store";
import { setSection, startTracker } from "./core/timeTracker";
import { setNativeTheme, setWarn, speak } from "./core/native";
import { Confetti, tap } from "./ui/kit";
import { usePack } from "./pack";
import { dueCount } from "./core/srs";
import Home from "./screens/Home";
import Learn from "./screens/Learn";
import Practice from "./screens/Practice";
import Explore from "./screens/Explore";
import Me from "./screens/Me";
import Onboarding from "./screens/Onboarding";

const TABS = [
  { id: "", label: "Home", Icon: HomeIcon },
  { id: "learn", label: "Learn", Icon: BookOpen },
  { id: "practice", label: "Practice", Icon: Dumbbell },
  { id: "explore", label: "Explore", Icon: Compass },
  { id: "me", label: "Me", Icon: User },
];

export default function App() {
  const route = useRoute();
  const settings = useSettings();
  const progress = useProgress();
  const p = usePack();
  const [toastMsg, setToast] = useState<{ text: string; tone?: string } | null>(null);
  const [xp, setXp] = useState<{ n: number; k: number } | null>(null);
  const [cele, setCele] = useState<Extract<UiEvent, { type: "celebrate" }> | null>(null);
  const [confetti, setConfetti] = useState(0);

  useEffect(() => { startTracker(); setWarn((m) => toast(m, "warn")); }, []);
  useEffect(() => { setSection(sectionOf(route.parts)); window.scrollTo(0, 0); }, [route.path]);

  // theme
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => {
      const dark = settings.theme === "dark" || (settings.theme === "auto" && mq.matches);
      document.documentElement.dataset.theme = dark ? "dark" : "light";
      document.querySelector('meta[name="theme-color"]')?.setAttribute("content", dark ? "#0e1016" : "#f7f3ec");
      setNativeTheme(dark);
    };
    apply(); mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [settings.theme]);

  useEffect(() => onUi((e) => {
    if (e.type === "toast") { setToast({ text: e.text, tone: e.tone }); window.setTimeout(() => setToast(null), 3200); }
    else if (e.type === "xp") { setXp({ n: e.amount, k: Date.now() }); window.setTimeout(() => setXp(null), 1600); }
    else if (e.type === "celebrate") {
      setCele(e); setConfetti((c) => c + 1); tap(30);
      if (e.jp && settings.autoplay) speak(e.jp, { lang: p.ttsLang });
    }
  }), [settings.autoplay, p.ttsLang]);

  if (!settings.onboarded) return <Onboarding />;

  const top = route.parts[0] || "";
  const navTop = top === "lab" ? "practice" : top;
  const due = dueCount(Object.keys(progress.srs), progress);

  let screen;
  switch (top) {
    case "learn": screen = <Learn route={route} />; break;
    case "practice": case "lab": screen = <Practice route={route} />; break;
    case "explore": screen = <Explore route={route} />; break;
    case "me": screen = <Me route={route} />; break;
    default: screen = <Home />;
  }

  return (
    <div className="app">
      <div key={route.path + "?" + route.query.toString()}>{screen}</div>
      <nav className="nav" aria-label="Main">
        {TABS.map(({ id, label, Icon }) => (
          <button key={id} className={navTop === id ? "on" : ""} aria-current={navTop === id}
            onClick={() => { tap(); go("/" + id); }}>
            <Icon size={22} strokeWidth={navTop === id ? 2.5 : 2} />
            {label}
            {id === "practice" && due > 0 && <span className="dot">{due > 99 ? "99+" : due}</span>}
          </button>
        ))}
      </nav>
      {toastMsg && <div className="toast" role="status">{toastMsg.tone === "warn" ? "⚠️" : toastMsg.tone === "ok" ? "✅" : "💡"} {toastMsg.text}</div>}
      {xp && <div className="xp-pop" key={xp.k}>+{xp.n} XP</div>}
      <Confetti run={confetti} />
      {cele && (<>
        <div className="scrim" style={{ zIndex: 89 }} onClick={() => setCele(null)} />
        <div className="modal" role="dialog">
          <div className="big">{cele.icon || "🎉"}</div>
          {cele.jp && <div className="jp" style={{ fontSize: 22, fontWeight: 700, color: "var(--shu)" }}>{cele.jp}</div>}
          <h2 style={{ margin: "6px 0 4px", fontSize: 22 }}>{cele.title}</h2>
          <p className="mu" style={{ margin: "0 0 18px" }}>{cele.sub}</p>
          <button className="btn primary block" onClick={() => setCele(null)}>Continue</button>
        </div>
      </>)}
    </div>
  );
}
