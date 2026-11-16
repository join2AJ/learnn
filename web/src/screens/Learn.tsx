import { Layers, ArrowRight, AudioLines, BookA, Brain, Languages, MessageCircle, Repeat, Sparkle, Speech } from "lucide-react";
import type { Route } from "../core/router";
import { go } from "../core/router";
import { useProgress } from "../core/store";
import { HIRA46, KATA46, masteredSet } from "../core/rewards";
import { usePack } from "../pack";
import { Bar, Header } from "../ui/kit";
import Scripts from "./learn/Scripts";
import KanaChart from "./learn/KanaChart";
import Pronunciation from "./learn/Pronunciation";
import { GrammarList, LessonView, CoreGrammarView } from "./learn/Grammar";
import Verbs from "./learn/Verbs";
import Words from "./learn/Words";
import Phrases from "./learn/Phrases";
import Sentences from "./learn/Sentences";
import Topics from "./learn/Topics";

export default function Learn({ route }: { route: Route }) {
  const [, sub, id] = route.parts;
  switch (sub) {
    case "scripts": return <Scripts />;
    case "kana": return <KanaChart id={id || ""} />;
    case "pron": return <Pronunciation />;
    case "grammar": return id ? <LessonView id={id} /> : <GrammarList />;
    case "core": return <CoreGrammarView />;
    case "verbs": return <Verbs initial={route.query.get("w")} />;
    case "words": return <Words />;
    case "phrases": return <Phrases />;
    case "sentences": return <Sentences />;
    case "topics": return <Topics id={id} />;
  }
  return <LearnHub />;
}

function LearnHub() {
  const pk = usePack();
  const p = useProgress();
  const hira = masteredSet(p, HIRA46) / 46, kata = masteredSet(p, KATA46) / 46;
  const lessonsDone = Object.keys(p.lessons).length;
  const Item = ({ to, icon, tint, title, desc, pct }: { to: string; icon: React.ReactNode; tint: string; title: string; desc: string; pct?: number }) => (
    <button className="li" onClick={() => go(to)}>
      <span className={"ico " + tint}>{icon}</span>
      <span className="grow"><div className="t">{title}</div><div className="d">{desc}</div>{pct !== undefined && <div className="mt8"><Bar pct={pct} thin /></div>}</span>
      <ArrowRight size={18} className="mu2" />
    </button>
  );
  return (
    <div className="screen">
      <Header title="Learn" sub="Follow top to bottom - that’s the fastest path" />
      <div className="section-title" style={{ marginTop: 6 }}><h2>1 · {pk.id === "ja" ? "Scripts & sounds" : "Alphabet & sounds"}</h2></div>
      {pk.id !== "ja" ? (
      <div className="list">
        <Item to="/learn/scripts" tint="soft-gold" icon={<Languages size={19} color="var(--gold)" />} title={pk.name + " alphabet & sounds"} desc={"How " + pk.name + " sounds vs English & Hindi"} />
        {pk.alphabets.map((a) => { const cells = a.groups.flatMap((g) => g.rows.flatMap((r) => r.cells.filter(Boolean))).map((c) => c!.ch); const m = masteredSet(p, new Set(cells)); return (
          <Item key={a.id} to={"/learn/kana/" + a.id} tint="soft-shu" icon={<span style={{ color: a.color, fontWeight: 800 }}>{cells[0]}</span>} title={a.name + " · " + a.native} desc={m + "/" + cells.length + " mastered · " + a.count} pct={m / cells.length} />); })}
        <Item to="/learn/pron" tint="soft-plum" icon={<Speech size={19} color="var(--plum)" />} title="How to speak" desc={pk.pronunciation.slice(0, 4).map((t) => t.title.toLowerCase()).join(", ")} />
        <Item to="/lab" tint="soft-sakura" icon={<AudioLines size={19} color="var(--sakura)" />} title="Sound Lab" desc="Spectrogram and vowel chart" />
      </div>) : (
      <div className="list">
        <Item to="/learn/scripts" tint="soft-gold" icon={<Languages size={19} color="var(--gold)" />} title="The 3 scripts, compared" desc="Hiragana, katakana, kanji vs English & Hindi" />
        <Item to="/learn/kana/hira" tint="soft-shu" icon={<span className="jp" style={{ color: "var(--shu)", fontWeight: 700 }}>あ</span>} title="Hiragana · ひらがな" desc={Math.round(hira * 46) + "/46 mastered · stroke order + sound"} pct={hira} />
        <Item to="/learn/kana/kata" tint="soft-ai" icon={<span className="jp" style={{ color: "var(--ai)", fontWeight: 700 }}>ア</span>} title="Katakana · カタカナ" desc={Math.round(kata * 46) + "/46 mastered"} pct={kata} />
        <Item to="/learn/kana/kanji" tint="soft-matcha" icon={<span className="serif" style={{ color: "var(--matcha)", fontWeight: 700 }}>日</span>} title="Starter kanji · 漢字" desc="60 essential characters with meanings" />
        <Item to="/learn/pron" tint="soft-plum" icon={<Speech size={19} color="var(--plum)" />} title="How to speak" desc="Vowels, rhythm, R, long sounds, pitch accent" />
        <Item to="/lab" tint="soft-sakura" icon={<AudioLines size={19} color="var(--sakura)" />} title="Sound Lab" desc="Spectrogram, vowel chart, pitch tracker" />
      </div>)}

      <div className="section-title"><h2>2 · Grammar</h2><span className="mu">{lessonsDone}/{pk.lessons.length}</span></div>
      <div className="list">
        <Item to="/learn/grammar" tint="soft-ai" icon={<Brain size={19} color="var(--ai)" />} title="Grammar course" desc="Parts of speech, tenses, verbs, nouns, adjectives, politeness" pct={lessonsDone / pk.lessons.length} />
        <Item to="/learn/core" tint="soft-shu" icon={<Sparkle size={19} color="var(--shu)" />} title="30 core grammar words" desc={pk.coreGrammar.slice(0, 5).map((g) => g.w.split(" ")[0]).join(" ") + "… the words that hold sentences together"} />
        <Item to="/learn/verbs" tint="soft-matcha" icon={<Repeat size={19} color="var(--matcha)" />} title="Verb conjugator" desc={"Every tense & form for " + pk.words.filter((w) => pk.conjugate?.(w)).length + " verbs"} />
      </div>

      <div className="section-title"><h2>3 · Words & phrases</h2></div>
      <div className="list">
        <Item to="/learn/words" tint="soft-gold" icon={<BookA size={19} color="var(--gold)" />} title="2,000 core words" desc={p.known.length + " known · most spoken first, with Hindi + sentences"} pct={p.known.length / 2000} />
        <Item to="/learn/phrases" tint="soft-sakura" icon={<MessageCircle size={19} color="var(--sakura)" />} title="Survival phrases" desc="Greetings, food, travel, shopping - tap to hear" />
        <Item to="/learn/topics" tint="soft-matcha" icon={<Layers size={19} color="var(--matcha)" />} title={"Topic packs & " + (pk.exam?.name || "") + " levels"} desc={"Food, family, travel, " + (pk.exam ? Object.keys(pk.exam.levels).map(Number).sort((a, b) => b - a).map((n) => pk.exam!.short(n)).join("–") : "") + "… study by theme"} />
        <Item to="/learn/sentences" tint="soft-ai" icon={<MessageCircle size={19} color="var(--ai)" />} title="Sentence bank" desc={(pk.id === "ja" ? "3,200" : "4,000") + " real sentences, simplest & most common first"} />
      </div>
    </div>
  );
}
