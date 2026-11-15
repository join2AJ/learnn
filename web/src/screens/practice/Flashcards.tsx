import { useMemo, useState } from "react";
import { RotateCcw } from "lucide-react";
import { go } from "../../core/router";
import { getProgress, today, useProgress, useSettings } from "../../core/store";
import { award, isMastered } from "../../core/rewards";
import { buildQueue, grade, previewLabel } from "../../core/srs";
import { speak } from "../../core/native";
import type { LetterCell } from "../../core/types";
import { usePack } from "../../pack";
import { Bar, Header, pick, Say, Seg, tap } from "../../ui/kit";
import { RecBtn } from "../../ui/VoiceCompare";
import { FreqMeter } from "../../core/freq";
import type { Word } from "../../core/types";
import { Icon } from "../../ui/icons";

const DECKS = [
  { id: "words", top: "Words", sub: "शब्द", name: "Words (2,000 core)", en: "the most-spoken Japanese words, most frequent first, with meaning and an example sentence.", hi: "सबसे ज़्यादा बोले जाने वाले 2,000 जापानी शब्द - अर्थ और वाक्य के साथ।" },
  { id: "hira", top: "ひらがな", sub: "Hiragana", name: "Hiragana", en: "the basic Japanese alphabet used for native words and grammar endings.", hi: "मूल जापानी वर्णमाला - जापानी शब्दों और व्याकरण के लिए।" },
  { id: "kata", top: "カタカナ", sub: "Katakana", name: "Katakana", en: "the same sounds in angular shapes, used for foreign words like コーヒー (coffee).", hi: "वही ध्वनियाँ, कोणीय अक्षर - विदेशी शब्दों के लिए (जैसे コーヒー = कॉफ़ी)।" },
  { id: "kanji", top: "漢字", sub: "Kanji", name: "Kanji", en: "characters from Chinese that carry meaning, like 日 (sun/day) and 山 (mountain).", hi: "चीनी से आए अर्थ वाले अक्षर - जैसे 日 (सूर्य/दिन), 山 (पहाड़)।" },
];

type Card = { word?: Word; id: string; front: string; reading?: string; romaji?: string; meaning: string; hindi?: string; s?: string; sr?: string; st?: string; speakText: string; kind: "word" | "kana" };

export default function Flashcards({ deck }: { deck: string }) {
  const pk = usePack();
  const s = useSettings();
  const p = useProgress();

  const cards = useMemo(() => {
    const m = new Map<string, Card>();
    if (deck === "words") pk.words.forEach((w) => m.set("w:" + w.n, { word: w, id: "w:" + w.n, front: w.w, reading: w.r, romaji: w.ro, meaning: w.m, hindi: w.h, s: w.s, sr: w.sr, st: w.st, speakText: w.r, kind: "word" }));
    else {
      const a = pk.alphabets.find((x) => x.id === deck);
      a?.groups.forEach((g) => g.rows.forEach((r) => (r.cells.filter(Boolean) as LetterCell[]).forEach((c) =>
        m.set("k:" + c.ch, { id: "k:" + c.ch, front: c.ch, romaji: c.rom, meaning: c.rom, hindi: c.hint, speakText: c.ch, kind: "kana" }))));
    }
    return m;
  }, [deck, pk]);

  const [session] = useState(() => {
    const learnedToday = today(getProgress()).learned;
    const newLimit = Math.max(deck === "words" ? 5 : 10, (deck === "words" ? s.newPerDay : 20) - learnedToday);
    return buildQueue(Array.from(cards.keys()), newLimit, getProgress());
  });
  const [queue, setQueue] = useState<string[]>(session.queue);
  const [flip, setFlip] = useState(false);
  const [stats, setStats] = useState({ done: 0, again: 0 });
  const total = session.queue.length;
  const card = queue[0] ? cards.get(queue[0]) : undefined;

  const doFlip = () => { tap(); setFlip(!flip); if (!flip && card && s.autoplay) speak(card.speakText, { lang: pk.ttsLang, rate: s.rate }); };
  const doGrade = (g: 0 | 1 | 2 | 3) => {
    if (!card) return;
    tap(g === 0 ? 20 : 8);
    grade(card.id, g, (x) => {
      if (card.kind === "word") { const n = +card.id.slice(2); if (!x.known.includes(n)) x.known.push(n); }
      else { const ch = card.id.slice(2); const k = x.kana[ch] || { c: 0, w: 0 }; x.kana[ch] = { c: k.c + 1, w: k.w }; }
    });
    award(g === 0 ? 1 : 3);
    setStats((st) => ({ done: st.done + (g > 0 ? 1 : 0), again: st.again + (g === 0 ? 1 : 0) }));
    setFlip(false);
    setQueue((q) => (g === 0 ? [...q.slice(1, 4), q[0], ...q.slice(4)] : q.slice(1)));
  };

  const deckSel = (
    <>
      <Seg value={deck} options={DECKS.map((d) => [d.id, <span style={{ display: "flex", flexDirection: "column", lineHeight: 1.15 }}><span className={d.id === "words" ? "" : "jp"}>{d.top}</span><span style={{ fontSize: 10, fontWeight: 600, opacity: .75 }}>{d.sub}</span></span>] as [string, React.ReactNode])}
        onChange={(v) => go("/practice/cards?deck=" + v, true)} />
      {(() => { const d = DECKS.find((x) => x.id === deck)!; return (
        <div className="card flat mt8" style={{ padding: "10px 12px", background: "transparent" }}>
          <div className="sm"><b>{d.name}</b> - {d.en}</div>
          {s.showHindi && <div className="sm hi">{d.hi}</div>}
        </div>); })()}
    </>
  );

  if (!card) {
    const pr = pick(pk.praise);
    return (
      <div className="screen">
        <Header title="Flashcards" backTo="/practice" />
        {deckSel}
        <div className="card hero tint-matcha center mt16">
          <div style={{ display: "grid", placeItems: "center" }}><Icon name="party" size={52} /></div>
          <div className="jp" style={{ fontSize: 26, fontWeight: 800 }}>{pr.jp}</div>
          <div style={{ fontWeight: 800, fontSize: 20 }}>{total ? "Session complete" : "Nothing due right now"}</div>
          <div className="sm mu mt4">{total ? stats.done + " cards reviewed · " + stats.again + " to relearn" : "Come back later - reviews appear right before you’d forget."}</div>
          <div className="row mt16" style={{ justifyContent: "center" }}>
            <button className="btn white" onClick={() => go("/practice/cards?deck=" + deck + "&r=" + Date.now(), true)}><RotateCcw size={16} /> More cards</button>
            <button className="btn ghost" style={{ color: "#fff", boxShadow: "inset 0 0 0 1.5px rgba(255,255,255,.5)" }} onClick={() => go("/practice/quiz/listen")}>Listening quiz</button>
          </div>
        </div>
      </div>
    );
  }

  const srsCard = p.srs[card.id];
  const isNew = !srsCard;
  return (
    <div className="screen">
      <Header title="Flashcards" sub={(total - queue.length + 1) + " / " + total + " · " + (session.due.length) + " review · " + session.fresh.length + " new"} backTo="/practice" />
      {deckSel}
      <div className="mt12"><Bar pct={(total - queue.length) / Math.max(1, total)} /></div>
      <div className={"flip mt16" + (flip ? " on" : "")} onClick={doFlip}>
        <div className="flip-inner">
          <div className="face">
            <span className="tag" style={{ position: "absolute", top: 14, left: 14, background: isNew ? "var(--gold)" : "var(--surface-2)", color: isNew ? "#fff" : undefined }}>{isNew ? "NEW" : "REVIEW"}</span>
            {card.kind === "kana" && isMastered(p.kana[card.front]) && <span className="tag" style={{ position: "absolute", top: 14, right: 14 }}>mastered</span>}
            <div className="huge" style={{ fontSize: card.front.length > 4 ? 44 : card.kind === "kana" ? 96 : 64 }}>{card.front}</div>
            <div className="sm mu2 mt16">Tap to reveal</div>
          </div>
          <div className="face back">
            {card.kind === "word" ? (<>
              <div className="jp" style={{ fontSize: 30, fontWeight: 600 }}>{card.front}</div>
              <div className="jp mu" style={{ fontSize: 18 }}>{card.reading}{s.showRomaji && <span className="mu2"> · {card.romaji}</span>}</div>
              <div style={{ fontWeight: 800, fontSize: 21, marginTop: 8 }}>{card.meaning}</div>
              {s.showHindi && <div className="hi lg">{card.hindi}</div>}
              {card.word && <div className="mt4"><FreqMeter w={card.word} /></div>}
              <div className="divider" style={{ width: "100%" }} />
              <div className="row" style={{ textAlign: "left", width: "100%" }}>
                <div className="grow"><div className="jp" style={{ fontSize: 16 }}>{card.s}</div>{s.showRomaji && <div className="xs mu2">{card.sr}</div>}<div className="xs mu">{card.st}</div></div>
                <Say text={card.s!} size="s" />
              </div>
            </>) : (<>
              <div className="jp" style={{ fontSize: 80, lineHeight: 1 }}>{card.front}</div>
              <div style={{ fontWeight: 800, fontSize: 34 }}>{card.romaji}</div>
              {s.showHindi && card.hindi && <div className="hi" style={{ fontSize: 24 }}>{card.hindi}</div>}
            </>)}
            <div className="row gap6" style={{ position: "absolute", top: 12, right: 12 }}><Say text={card.speakText} /><RecBtn text={card.front} ro={card.romaji} en={card.meaning} size="m" /></div>
          </div>
        </div>
      </div>
      {flip ? (
        <div className="grade mt16">
          <button style={{ background: "var(--shu-soft)", color: "var(--shu)" }} onClick={() => doGrade(0)}>Again<small>{previewLabel(srsCard, 0)}</small></button>
          <button style={{ background: "var(--gold-soft)", color: "var(--gold)" }} onClick={() => doGrade(1)}>Hard<small>{previewLabel(srsCard, 1)}</small></button>
          <button style={{ background: "var(--matcha-soft)", color: "var(--matcha)" }} onClick={() => doGrade(2)}>Good<small>{previewLabel(srsCard, 2)}</small></button>
          <button style={{ background: "var(--ai-soft)", color: "var(--ai)" }} onClick={() => doGrade(3)}>Easy<small>{previewLabel(srsCard, 3)}</small></button>
        </div>
      ) : (
        <button className="btn primary lg block mt16" onClick={doFlip}>Show answer</button>
      )}
      <div className="xs mu center mt12">Say the answer out loud before you flip - active recall is 2× faster than re-reading.</div>
    </div>
  );
}
