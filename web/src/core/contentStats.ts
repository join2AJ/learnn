import type { LanguagePack, LetterCell } from "./types";
import { BADGES } from "./rewards";

/** Counts of everything a language pack contains (shown in Settings → What's inside). */
export function contentStats(pk: LanguagePack) {
  const cells = (id: string) => pk.alphabets.find((a) => a.id === id)?.groups.flatMap((g) => g.rows.flatMap((r) => r.cells.filter(Boolean) as LetterCell[])) || [];
  const lessonEx = pk.lessons.flatMap((l) => l.blocks.flatMap((b) => b.examples || []));
  const phraseItems = pk.phrases.flatMap((g) => g.items);
  const pronEx = pk.pronunciation.flatMap((t) => t.examples);
  const verbs = pk.words.filter((w) => pk.conjugate?.(w));
  const sentences = pk.words.filter((w) => w.s).length + pk.coreGrammar.length + lessonEx.length + phraseItems.length + pronEx.length + pk.sentenceBuilder.length + pk.particleQuiz.length;
  const hindi = pk.words.filter((w) => w.h).length + pk.coreGrammar.length + [...lessonEx, ...phraseItems, ...pronEx].filter((e) => e.hi).length + pk.sentenceBuilder.length;
  const types: Record<string, number> = {};
  pk.words.forEach((w) => (types[w.t] = (types[w.t] || 0) + 1));
  const res = pk.resources.flatMap((g) => g.items);
  return {
    words: pk.words.length, types,
    coreGrammar: pk.coreGrammar.length,
    sentences, wordSentences: pk.words.filter((w) => w.s).length, lessonExamples: lessonEx.length,
    phrases: phraseItems.length, phraseGroups: pk.phrases.length,
    lessons: pk.lessons.length, units: new Set(pk.lessons.map((l) => l.unit)).size, lessonQuiz: pk.lessons.reduce((a, l) => a + l.quiz.length, 0),
    hiragana: cells("hira").length, katakana: cells("kata").length, kanji: cells("kanji").length,
    strokeChars: Object.keys(pk.strokes).length, mnemonics: pk.alphabets.reduce((a, x) => a + Object.keys(x.mnemonics || {}).length, 0),
    verbs: verbs.length, verbForms: verbs.length * 20,
    culture: pk.culture.length, cultureItems: pk.culture.reduce((a, c) => a + c.items.length, 0),
    pron: pk.pronunciation.length, sounds: pk.sounds.length, vowels: pk.vowels.length, pitchWords: pk.pitch.length,
    sentenceBuilder: pk.sentenceBuilder.length, particleQuiz: pk.particleQuiz.length,
    resources: res.length, youtube: res.filter((r) => r.kind === "youtube" || r.kind === "search").length,
    sentenceBank: 3200,
    quizTypes: 8, badges: BADGES.length, roadmap: pk.roadmap.length, hindi,
  };
}
