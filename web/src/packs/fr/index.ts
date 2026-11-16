import type { LanguagePack, Word } from "../../core/types";
import core from "./data/core.json";
import { alphabets } from "./alphabet";
import { lessons } from "./lessons";
import { culture } from "./culture";
import { conjugate, verbGroup, verbGroups } from "./verbs";
import * as C from "./content";
import { TOPICS } from "../ja/topics";

const strip = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "");

/** French course pack. Hidden until the beta switch is on (see Settings). */
const french: LanguagePack = {
  id: "fr", name: "French", native: "Français", flag: "🇫🇷", ttsLang: "fr-FR", status: "ready",
  tagline: "Alphabet & sounds → 2,000 most-spoken words → real conversation",
  greeting: C.greeting,
  alphabets,
  strokes: {},
  words: [...(core as { words: Word[] }).words].sort((a, b) => (a.rank ?? a.n) - (b.rank ?? b.n)),
  coreGrammar: C.coreGrammar,
  lessons, culture,
  phrases: C.phrases, roadmap: C.roadmap, resources: C.resources, pronunciation: C.pronunciation,
  vowels: C.vowels, sounds: C.sounds, pitch: [], praise: C.praise, levels: C.levels,
  verbGroup, conjugate, verbLabels: verbGroups,
  sentenceBuilder: C.sentenceBuilder, particleQuiz: C.particleQuiz,
  scriptsIntro: C.scriptsIntro, compareTable: C.compareTable, facts: C.facts,
  exam: {
    name: "CEFR", short: (n) => ({ 5: "A1", 4: "A2", 3: "B1", 2: "B2", 1: "C1" } as Record<number, string>)[n] || "",
    levels: {
      5: { name: "A1", desc: "Beginner - greetings, simple everyday phrases", hi: "शुरुआती" },
      4: { name: "A2", desc: "Elementary - routine tasks, simple conversations", hi: "प्रारंभिक" },
      3: { name: "B1", desc: "Intermediate - travel, work, opinions", hi: "मध्यम" },
    },
    note: "Levels follow word frequency (top 500 ≈ A1, 1,000 ≈ A2, 2,000 ≈ B1 vocabulary). DELF exams publish no official word list, so treat them as a guide.",
  },
  topics: TOPICS,
  loadSentences: () => import("./data/sentences.json").then((m) => m.default as never),
  normalize: (s) => strip(s.toLowerCase()).replace(/['’]/g, " ").replace(/[^a-z0-9 ]/g, "").replace(/\s+/g, ""),
  romanize: (s) => s, romanLabel: "pronunciation", writing: false, hasPitch: false, country: "France",
};
export default french;
