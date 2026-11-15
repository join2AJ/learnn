import type { LanguagePack, Word, CoreGrammar } from "../../core/types";
import core from "./data/core.json";
import strokes from "./data/strokes.json";
import { alphabets } from "./kana";
import { lessons } from "./lessons";
import { culture } from "./culture";
import { conjugate, verbGroup } from "./verbs";
import * as C from "./content";

const japanese: LanguagePack = {
  id: "ja", name: "Japanese", native: "日本語", flag: "🇯🇵", ttsLang: "ja-JP", status: "ready",
  tagline: "Hiragana → 1,000 core words → real conversation",
  greeting: C.greeting,
  alphabets,
  strokes: strokes as Record<string, string[]>,
  words: (core as { words: Word[] }).words,
  coreGrammar: (core as { grammar: CoreGrammar[] }).grammar,
  lessons, culture,
  phrases: C.phrases, roadmap: C.roadmap, resources: C.resources, pronunciation: C.pronunciation,
  vowels: C.vowels, sounds: C.sounds, pitch: C.pitch, praise: C.praise, levels: C.levels,
  verbGroup, conjugate,
  sentenceBuilder: C.sentenceBuilder, particleQuiz: C.particleQuiz,
  scriptsIntro: C.scriptsIntro, compareTable: C.compareTable, facts: C.facts,
};
export default japanese;
