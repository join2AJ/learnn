import type { Alphabet } from "../../core/types";

const C = (ch: string, rom: string, hint: string) => ({ ch, rom, hint });

/** French alphabet: letter names, accents and the key letter-combination sounds (with Hindi sound hints). */
export const alphabets: Alphabet[] = [
  {
    id: "abc", name: "Alphabet", native: "L'alphabet", color: "var(--ai)", count: "26 letters",
    blurb: "The same 26 letters as English - but they are named and often pronounced differently.",
    usedFor: "Spelling your name, emails, codes - and knowing which letters are silent.",
    groups: [
      { id: "vow", title: "Vowels", subtitle: "a e i o u y", cols: 6, note: "French vowels are short and pure - no gliding like English “go-u”.",
        rows: [{ label: "Day 1", cells: [C("a", "ah", "आ"), C("e", "uh", "अ"), C("i", "ee", "ई"), C("o", "oh", "ओ"), C("u", "ü", "यू*"), C("y", "ee-grek", "इग्रेक")] }] },
      { id: "con", title: "Consonants", subtitle: "Letter names", cols: 5,
        rows: [
          { label: "Day 1", cells: [C("b", "bay", "बे"), C("c", "say", "से"), C("d", "day", "दे"), C("f", "ef", "एफ़"), C("g", "zhay", "जे")] },
          { label: "Day 2", cells: [C("h", "ash", "आश"), C("j", "zhee", "ज़ी"), C("k", "kah", "का"), C("l", "el", "एल"), C("m", "em", "एम")] },
          { label: "Day 2", cells: [C("n", "en", "एन"), C("p", "pay", "पे"), C("q", "kü", "क्यू*"), C("r", "air", "एर"), C("s", "es", "एस")] },
          { label: "Day 3", cells: [C("t", "tay", "ते"), C("v", "vay", "वे"), C("w", "doo-bluh-vay", "दुब्ल-वे"), C("x", "eeks", "इक्स"), C("z", "zed", "ज़ेद")] },
        ] },
    ],
    mnemonics: {
      a: "Like the ‘a’ in father - always open: papa, ami.",
      e: "Without accent it is often a soft ‘uh’ (le, petit) or silent at the end (une, belle).",
      i: "Always ‘ee’ - never ‘eye’: ici, merci.",
      u: "Say ‘ee’ and round your lips like for ‘oo’ - that is the French u (tu, rue). It doesn’t exist in English or Hindi.",
      y: "Called ‘i grec’ (Greek i) - sounds like i: stylo, il y a.",
      c: "Hard ‘k’ before a/o/u (café), soft ‘s’ before e/i (merci, cinéma).",
      g: "Hard ‘g’ before a/o/u (gare), soft ‘zh’ before e/i (manger, girafe).",
      h: "Always silent! homme = ‘om’, hôtel = ‘otel’.",
      j: "Soft ‘zh’ like the s in ‘measure’: je, jour.",
      r: "Made in the throat, a bit like a soft गर्र (ग़). Never rolled like Hindi र.",
      s: "‘s’, but ‘z’ between two vowels: maison = ‘mayzon’.",
      t: "Usually silent at the end of a word: petit, chat.",
      q: "Almost always qu = ‘k’: qui, quatre.",
      w: "Rare - in borrowed words like week-end, wagon.",
    },
  },
  {
    id: "acc", name: "Accents", native: "Les accents", color: "var(--plum)", count: "13 marks",
    blurb: "Accents change the sound of a vowel - or show a silent letter that disappeared long ago.",
    usedFor: "Reading correctly: é (ay) and è (eh) are different sounds. ç keeps c soft.",
    groups: [
      { id: "acc1", title: "Accents on e", subtitle: "the most important", cols: 4,
        rows: [{ label: "Day 3", cells: [C("é", "ay (aigu)", "ए"), C("è", "eh (grave)", "ऐ"), C("ê", "eh (circonflexe)", "ऐ"), C("ë", "eh (tréma)", "ए")] }] },
      { id: "acc2", title: "Other accents", subtitle: "à â ù û î ï ô", cols: 4,
        rows: [
          { label: "Day 4", cells: [C("à", "ah", "आ"), C("â", "ah (long)", "आ"), C("ù", "ü", "यू*"), C("û", "ü", "यू*")] },
          { label: "Day 4", cells: [C("î", "ee", "ई"), C("ï", "ee (separate)", "ई"), C("ô", "oh (closed)", "ओ"), null] },
        ] },
      { id: "acc3", title: "Special letters", subtitle: "ç œ æ", cols: 3,
        rows: [{ label: "Day 4", cells: [C("ç", "s (cédille)", "स"), C("œ", "eu (sœur)", "ऑ*"), C("æ", "ay", "ए")] }] },
    ],
    mnemonics: {
      "é": "Accent aigu - like ‘ay’ in ‘say’ but short: café, été. Very common!",
      "è": "Accent grave - open ‘eh’ like in ‘bed’: mère, très.",
      "ê": "Same sound as è. The ^ often marks a lost s: forêt = forest, fête = feast.",
      "ë": "Tréma: say the vowel separately: Noël = No-el.",
      "à": "Only changes meaning, not sound: a (has) vs à (to/at).",
      "ù": "Only in où (where) - to tell it apart from ou (or).",
      "ç": "Cédille keeps c soft (s) before a/o/u: français, garçon, ça.",
      "œ": "o and e joined: sœur (sister), cœur (heart), œil (eye).",
      "î": "The ^ again marks a lost s: île = isle.",
      "ô": "Closed ‘oh’: hôtel, côte.",
    },
  },
  {
    id: "snd", name: "Sounds", native: "Les sons", color: "var(--shu)", count: "20 key sounds",
    blurb: "French spelling uses letter groups for single sounds. Learn these 20 and you can read almost any word.",
    usedFor: "Reading aloud: eau = ‘o’, oi = ‘wa’, an = nasal ‘ã’.",
    groups: [
      { id: "s1", title: "Vowel groups", subtitle: "two or three letters, one sound", cols: 4,
        rows: [
          { label: "Day 5", cells: [C("ou", "oo", "ऊ"), C("oi", "wa", "वा"), C("au", "oh", "ओ"), C("eau", "oh", "ओ")] },
          { label: "Day 5", cells: [C("ai", "eh", "ऐ"), C("ei", "eh", "ऐ"), C("eu", "uh (lips round)", "ऑ*"), C("ui", "wee", "वी")] },
        ] },
      { id: "s2", title: "Nasal vowels", subtitle: "air through the nose - the French sound", cols: 4, note: "Do not pronounce the n or m - just let the vowel ring in your nose, like Hindi अनुस्वार / चंद्रबिंदु (माँ, हँसना).",
        rows: [{ label: "Day 6", cells: [C("an", "ã (an/en)", "आँ"), C("on", "õ", "ओं"), C("in", "ẽ (in/ain/ein)", "ऐं"), C("un", "œ̃", "अं")] }] },
      { id: "s3", title: "Consonant groups", subtitle: "", cols: 4,
        rows: [
          { label: "Day 6", cells: [C("ch", "sh", "श"), C("gn", "ny", "न्य"), C("ill", "y", "य"), C("qu", "k", "क")] },
          { label: "Day 7", cells: [C("ph", "f", "फ़"), C("th", "t", "त"), C("gu", "g", "ग"), C("tion", "syon", "स्यों")] },
        ] },
    ],
    mnemonics: {
      ou: "Like ‘oo’ in food: vous, nous, bonjour.",
      oi: "Always ‘wa’: moi, toi, voiture, croissant.",
      eau: "Three letters, one sound ‘o’: beau, eau (water), bateau.",
      ai: "‘eh’: maison, je fais, lait.",
      eu: "Say ‘eh’ with rounded lips: deux, peu, bleu. Not in Hindi - practise in Sound Lab!",
      an: "Nasal: open mouth, air through the nose - enfant, France, temps. Like आँ in माँ.",
      on: "Nasal ‘o’: bonjour, maison, non. Like ओं.",
      in: "Nasal ‘e’: vin, pain, matin, plein.",
      ch: "Always ‘sh’: chat, chocolat, chercher.",
      gn: "‘ny’ like in canyon: montagne, champagne, gagner.",
      ill: "Usually ‘y’: fille, famille, travailler (but ville, mille = ‘eel’).",
      qu: "‘k’ - the u is silent: qui, que, quatre.",
      tion: "‘syon’ - nation, attention, information.",
    },
  },
];
