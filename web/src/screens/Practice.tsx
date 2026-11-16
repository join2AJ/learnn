import { ArrowRight, AudioLines, Play, Ear, Layers, ListOrdered, Mic, PenLine, Puzzle, Repeat, Type } from "lucide-react";
import type { Route } from "../core/router";
import { go } from "../core/router";
import { useProgress } from "../core/store";
import { dueCount } from "../core/srs";
import { pack, usePack } from "../pack";
import { Header } from "../ui/kit";
import Flashcards from "./practice/Flashcards";
import Quiz from "./practice/Quiz";
import Speak from "./practice/Speak";
import Write from "./practice/Write";
import SoundLab from "./practice/SoundLab";

export default function Practice({ route }: { route: Route }) {
  if (route.parts[0] === "lab") return <SoundLab />;
  const [, sub, mode] = route.parts;
  switch (sub) {
    case "cards": return <Flashcards deck={route.query.get("deck") || "words"} />;
    case "quiz": return <Quiz mode={mode || "kana"} set={route.query.get("set") || pack().alphabets[0].id} />;
    case "speak": return <Speak />;
    case "write": return <Write initial={route.query.get("ch")} set={route.query.get("set") || pack().alphabets[0].id} />;
  }
  return <Hub />;
}

function Hub() {
  const p = useProgress();
  const pk = usePack();
  const due = dueCount(Object.keys(p.srs), p);
  const ja = pk.id === "ja";
  const quizzes: [string, string, React.ReactNode, string, string][] = [
    ...(ja ? [["/practice/quiz/kana?set=hira", "Hiragana sprint", <span className="jp" style={{ fontWeight: 700, color: "var(--shu)" }}>あ</span>, "soft-shu", "Recognise kana fast"],
    ["/practice/quiz/kana?set=kata", "Katakana sprint", <span className="jp" style={{ fontWeight: 700, color: "var(--ai)" }}>ア</span>, "soft-ai", "Loanword alphabet"]] as [string, string, React.ReactNode, string, string][]
      : pk.alphabets.slice(0, 2).map((a, i) => ["/practice/quiz/kana?set=" + a.id, a.name + " sprint", <span style={{ fontWeight: 800, color: i ? "var(--ai)" : "var(--shu)" }}>{a.groups[0].rows[0].cells[0]!.ch}</span>, i ? "soft-ai" : "soft-shu", "Hear it, recognise it"] as [string, string, React.ReactNode, string, string])),
    ["/practice/quiz/listen", "Listening", <Ear size={19} color="var(--plum)" />, "soft-plum", "Hear it, pick the meaning"],
    ["/practice/quiz/meaning", "Meaning match", <Type size={19} color="var(--gold)" />, "soft-gold", pk.name + " → English/Hindi"],
    ["/practice/quiz/reverse", "Say it in " + pk.name, <Repeat size={19} color="var(--matcha)" />, "soft-matcha", "English → " + pk.name],
    ["/practice/quiz/particle", ja ? "Particle fill-in" : "Articles & prepositions", <Puzzle size={19} color="var(--shu)" />, "soft-shu", ja ? "は が を に で…" : "le, la, du, au, en…"],
    ["/practice/quiz/build", "Sentence builder", <ListOrdered size={19} color="var(--ai)" />, "soft-ai", "Put words in order"],
    ["/practice/quiz/verb", "Verb forms", <Repeat size={19} color="var(--plum)" />, "soft-plum", ja ? "Past, negative, て-form…" : "Present, past, future…"],
  ];
  return (
    <div className="screen">
      <Header title="Practice" sub="Short sessions every day beat long ones once a week" />
      <button className="card tap hero tint-shu" onClick={() => go("/practice/cards")}>
        <div className="watermark">復</div>
        <div className="row">
          <div className="grow">
            <div className="kicker">Spaced repetition</div>
            <div style={{ fontSize: 22, fontWeight: 800, margin: "2px 0" }}>{due ? due + " cards due" : "Flashcards"}</div>
            <div className="sm mu">{due ? "Review now while they’re about to fade" : "Learn new words with smart reviews"}</div>
          </div>
          <Layers size={34} />
        </div>
      </button>
      <div className="grid2 mt12">
        <button className="tile" onClick={() => go("/practice/speak")}><span className="ico soft-matcha"><Mic size={20} color="var(--matcha)" /></span><span className="t">Speak aloud</span><span className="d">Speech recognition checks you</span></button>
        {pk.writing !== false && <button className="tile" onClick={() => go("/practice/write")}><span className="ico soft-gold"><PenLine size={20} color="var(--gold)" /></span><span className="t">Write</span><span className="d">Trace with stroke order</span></button>}
        {pk.writing !== false && <button className="tile" onClick={() => go("/me/writing")}><span className="ico soft-gold"><PenLine size={20} color="var(--gold)" /></span><span className="t">My writing</span><span className="d">Every drawing & accuracy</span></button>}
        <button className="tile" onClick={() => go("/lab")}><span className="ico soft-plum"><AudioLines size={20} color="var(--plum)" /></span><span className="t">Sound Lab</span><span className="d">Spectrogram & pitch</span></button>
        <button className="tile" onClick={() => go("/me/recordings")}><span className="ico soft-matcha"><Play size={20} color="var(--matcha)" /></span><span className="t">My recordings</span><span className="d">Replay & review all</span></button>
        <button className="tile" onClick={() => go("/practice/cards?deck=" + pk.alphabets[0].id)}><span className="ico soft-shu jp" style={{ color: "var(--shu)", fontWeight: 700 }}>{ja ? "か" : "é"}</span><span className="t">{ja ? "Kana cards" : "Letter cards"}</span><span className="d">{ja ? "Hiragana deck" : pk.alphabets[0].name + " deck"}</span></button>
      </div>
      <div className="section-title"><h2>Quizzes</h2><span className="mu">10 questions · XP for each</span></div>
      <div className="list">
        {quizzes.map(([to, t, ico, tint, d]) => (
          <button key={to} className="li" onClick={() => go(to)}><span className={"ico " + tint}>{ico}</span><span className="grow"><div className="t">{t}</div><div className="d">{d}</div></span><ArrowRight size={18} className="mu2" /></button>
        ))}
      </div>
      <div className="card flat mt12 sm mu" style={{ background: "transparent" }}>Lifetime: {p.quiz.correct} correct · {p.quiz.wrong} wrong · best round {p.quiz.best}/10 · {pk.words.length} words available</div>
    </div>
  );
}
