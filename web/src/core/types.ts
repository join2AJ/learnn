/**
 * Language-pack contract. The app engine (SRS, quizzes, stats, rewards, Sound Lab,
 * navigation) only talks to this interface, so adding Korean, Spanish, Hindi…
 * means writing a new pack folder under src/packs/<id>/ and registering it.
 */

export type Bi = { en: string; hi?: string };

export interface Word {
  n: number;          // frequency rank (1 = most common)
  w: string;          // written form (may contain kanji)
  r: string;          // reading (kana)
  ro: string;         // romanization
  t: string;          // part of speech
  m: string;          // English meaning
  h: string;          // Hindi meaning
  s: string;          // example sentence
  sr: string;         // sentence romanization
  st: string;         // sentence English
  p?: string;         // pronunciation note
  k?: string;         // remark / usage note
  b?: string;         // rank basis
  z?: number;         // Zipf frequency (wordfreq)
  pm?: number;        // uses per million words in everyday sentences (Tatoeba)
  rank?: number;      // position when ordered by how often it is spoken (1 = most)
  jlpt?: number;      // JLPT level 5 (N5, easiest) … 1 (N1)
  tp?: string[];      // topic ids
}

export interface CoreGrammar {
  n: number; w: string; ro: string; m: string; sh: string;
  s: string; sr: string; st: string; h: string;
}

export interface Example {
  jp: string;      // target-language text (spoken by TTS)
  ro: string;      // romanization
  en: string;
  hi?: string;
  note?: string;
}

export interface LetterCell { ch: string; rom: string; hint?: string; }
export interface LetterRow { label: string; cells: (LetterCell | null)[]; }
export interface LetterGroup { id: string; title: string; subtitle?: string; note?: string; cols: number; rows: LetterRow[]; }
export interface Alphabet {
  id: string; name: string; native: string; color: string;
  blurb: string; usedFor: string; count: string;
  groups: LetterGroup[];
  mnemonics?: Record<string, string>;
}

export interface QuizQ { q: string; options: string[]; answer: number; explain?: string; }

export interface LessonBlock {
  kind: "text" | "table" | "examples" | "compare" | "tip" | "pattern";
  title?: string;
  text?: string;
  head?: string[];
  rows?: string[][];
  examples?: Example[];
  compare?: { en: string; hi: string; jp: string };
}

export interface Lesson {
  id: string;
  unit: string;
  title: string;
  jp: string;
  minutes: number;
  summary: string;
  blocks: LessonBlock[];
  quiz: QuizQ[];
  video?: string; // YouTube search query
}

export interface PhraseGroup { id: string; title: string; icon: string; items: Example[]; }

export interface CultureItem { title: string; jp?: string; text: string; india?: string; }
export interface CultureSection { id: string; title: string; icon: string; tone: "like" | "dislike" | "do" | "dont" | "value" | "info"; intro: string; items: CultureItem[]; }

export interface RoadmapPhase {
  id: string; title: string; when: string; goal: string;
  tasks: { text: string; check?: string }[];
  checkpoint: string;
}

export interface Resource { title: string; url: string; kind: "youtube" | "web" | "app" | "search"; level?: string; note: string; }
export interface ResourceGroup { id: string; title: string; items: Resource[]; }

export interface PronTopic { id: string; title: string; text: string; en: string; hi: string; examples: Example[]; }

export interface VowelRef { ipa: string; label: string; f1: number; f2: number; f3: number; lang: "target" | "en" | "hi"; example?: string; }
export interface SoundRef { id: string; label: string; jp: string; kind: "vowel" | "fricative" | "nasal"; f?: [number, number, number]; band?: [number, number]; desc: string; }

export interface Praise { jp: string; ro: string; en: string; }

export interface VerbForm { key: string; label: string; jp: string; ro: string; en: string; hi?: string }

export interface LanguagePack {
  id: string;
  name: string;
  native: string;
  flag: string;
  ttsLang: string;
  status: "ready" | "planned";
  tagline: string;
  greeting: (hour: number) => { jp: string; ro: string; en: string };
  alphabets: Alphabet[];
  strokes: Record<string, string[]>;
  words: Word[];
  coreGrammar: CoreGrammar[];
  lessons: Lesson[];
  phrases: PhraseGroup[];
  culture: CultureSection[];
  roadmap: RoadmapPhase[];
  resources: ResourceGroup[];
  pronunciation: PronTopic[];
  vowels: VowelRef[];
  sounds: SoundRef[];
  pitch: { word: string; ro: string; en: string; pattern: number[] }[];
  praise: Praise[];
  levels: { min: number; jp: string; en: string }[];
  verbGroup?: (w: Word) => string | null;
  conjugate?: (w: Word) => VerbForm[] | null;
  sentenceBuilder: { jp: string[]; en: string; hi: string; ro: string }[];
  particleQuiz: { before: string; after: string; answer: string; options: string[]; en: string }[];
  scriptsIntro: { title: string; text: string }[];
  compareTable: { head: string[]; rows: string[][] };
  facts: string[];
  /** Exam levels stored in Word.jlpt (5 = easiest). e.g. JLPT N5-N1, CEFR A1-C1. */
  exam?: { name: string; short: (n: number) => string; levels: Record<number, { name: string; desc: string; hi: string }>; note: string };
  topics?: { id: string; name: string; hi: string; icon: string; tone: string }[];
  loadSentences?: () => Promise<{ jp: string; ro: string; en: string; hi: string; lvl: number; z: number }[]>;
  /** Normalise text before comparing what the learner said with the target. */
  normalize?: (s: string) => string;
  /** Text → pronunciation guide (romaji for Japanese). */
  romanize?: (s: string) => string;
  romanLabel?: string;        // "romaji", "pronunciation"
  writing?: boolean;          // stroke-order writing practice available
  verbLabels?: Record<string, [string, string]>; // verb group → [label, colour]
  hasPitch?: boolean;         // pitch-accent drills available
  country?: string;           // "Japan", "France" - used in titles
}
