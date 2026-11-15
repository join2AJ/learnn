import type { LanguagePack } from "./types";
import type { Progress } from "./store";
import { HIRA46, KATA46, masteredSet } from "./rewards";

/** Auto-checks for roadmap tasks, computed from real progress. */
export function checkTask(check: string | undefined, p: Progress, pk: LanguagePack): boolean {
  if (!check) return false;
  const unitDone = (u: string) => pk.lessons.filter((l) => l.unit.startsWith(u)).every((l) => p.lessons[l.id]);
  switch (check) {
    case "scripts": case "pron": case "core30": case "phr": return !!p.roadmap[check];
    case "lab": return p.labSessions > 0;
    case "hira10": return masteredSet(p, HIRA46) >= 10;
    case "hira46": return masteredSet(p, HIRA46) >= 46;
    case "kata10": return masteredSet(p, KATA46) >= 10;
    case "kata46": return masteredSet(p, KATA46) >= 46;
    case "write10": return p.writes >= 10;
    case "unit1": return unitDone("1");
    case "unit4": return unitDone("2") && unitDone("3") && unitDone("4");
    case "unit5": return unitDone("5");
    case "w100": return p.known.length >= 100;
    case "w300": return p.known.length >= 300;
    case "w600": return p.known.length >= 600;
    case "w1000": return p.known.length >= 1000;
    case "w2000": return p.known.length >= 2000;
  }
  return false;
}

export function phaseProgress(pk: LanguagePack, p: Progress) {
  return pk.roadmap.map((ph) => {
    const checks = ph.tasks.filter((t) => t.check);
    const done = checks.filter((t) => checkTask(t.check, p, pk)).length;
    return { ph, done, total: checks.length, pct: checks.length ? done / checks.length : 0 };
  });
}

/** The single most useful next action for the learner. */
export function nextStep(pk: LanguagePack, p: Progress): { title: string; sub: string; to: string; jp: string } {
  const hira = masteredSet(p, HIRA46), kata = masteredSet(p, KATA46);
  if (!p.roadmap.scripts) return { title: "Meet the 3 scripts", sub: "2-minute overview: hiragana, katakana, kanji", to: "/learn/scripts", jp: "字" };
  if (hira < 46) return { title: "Hiragana · " + hira + "/46 mastered", sub: hira < 10 ? "Learn the first rows with sound + stroke order" : "Quiz yourself until every cell turns green", to: hira < 10 ? "/learn/kana/hira" : "/practice/quiz/kana?set=hira", jp: "あ" };
  if (kata < 46) return { title: "Katakana · " + kata + "/46 mastered", sub: "Same sounds, sharper shapes", to: kata < 10 ? "/learn/kana/kata" : "/practice/quiz/kana?set=kata", jp: "ア" };
  const next = pk.lessons.find((l) => !p.lessons[l.id]);
  if (next && (Object.keys(p.lessons).length < 5 || p.known.length >= Object.keys(p.lessons).length * 20)) return { title: next.title, sub: "Grammar · " + next.minutes + " min · " + next.unit, to: "/learn/grammar/" + next.id, jp: "文" };
  if (p.known.length < 2000) return { title: "Words " + (p.known.length + 1) + "–" + Math.min(2000, p.known.length + 20), sub: "Flashcards with spaced repetition", to: "/practice/cards", jp: "語" };
  return { title: "Keep reviewing", sub: "Spaced repetition keeps everything fresh", to: "/practice/cards", jp: "復" };
}
