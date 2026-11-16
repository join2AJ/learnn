import type { LanguagePack, Word, CoreGrammar } from "../../core/types";
import core from "./data/core.json";
import strokes from "./data/strokes.json";
import { alphabets } from "./kana";
import { lessons } from "./lessons";
import { culture } from "./culture";
import { conjugate, verbGroup } from "./verbs";
import * as C from "./content";
import { JLPT_INFO, TOPICS } from "./topics";
import { toHira } from "./kana";
import { romaji } from "./verbs";

const japanese: LanguagePack = {
  id: "ja", name: "Japanese", native: "日本語", flag: "🇯🇵", ttsLang: "ja-JP", status: "ready",
  tagline: "Hiragana → 2,000 most-spoken words → real conversation",
  greeting: C.greeting,
  alphabets,
  strokes: strokes as Record<string, string[]>,
  words: [...(core as { words: Word[] }).words].sort((a, b) => (a.rank ?? a.n) - (b.rank ?? b.n)),
  coreGrammar: (core as { grammar: CoreGrammar[] }).grammar,
  lessons, culture,
  phrases: C.phrases, roadmap: C.roadmap, resources: C.resources, pronunciation: C.pronunciation,
  vowels: C.vowels, sounds: C.sounds, pitch: C.pitch, praise: C.praise, levels: C.levels,
  verbGroup, conjugate,
  sentenceBuilder: C.sentenceBuilder, particleQuiz: C.particleQuiz,
  scriptsIntro: C.scriptsIntro, compareTable: C.compareTable, facts: C.facts,
  exam: { name: "JLPT", short: (n) => "N" + n, levels: JLPT_INFO, note: "JLPT levels from open community lists (Jonathan Waller / open-anki-jlpt-decks). The official test publishes no word list, so treat levels as a guide." },
  topics: TOPICS,
  loadSentences: () => import("./data/sentences.json").then((m) => m.default as never),
  normalize: (s) => toHira(s).replace(/[\s、。！？!?,.・「」『』〜~]/g, "").toLowerCase(),
  romanize: romaji, romanLabel: "romaji", writing: true, hasPitch: true, country: "Japan",
};
export default japanese;
