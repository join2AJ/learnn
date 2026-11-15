import type { Alphabet, LetterGroup, LetterRow } from "../../core/types";

export const HI: Record<string, string> = {a:"अ",i:"इ",u:"उ",e:"ए",o:"ओ",ka:"क",ki:"कि",ku:"कु",ke:"के",ko:"को",sa:"स",shi:"शि",su:"सु",se:"से",so:"सो",ta:"त",chi:"चि",tsu:"त्सु",te:"ते",to:"तो",na:"न",ni:"नि",nu:"नु",ne:"ने",no:"नो",ha:"ह",hi:"हि",fu:"फु",he:"हे",ho:"हो",ma:"म",mi:"मि",mu:"मु",me:"मे",mo:"मो",ya:"य",yu:"यु",yo:"यो",ra:"र",ri:"रि",ru:"रु",re:"रे",ro:"रो",wa:"व",wo:"ओ",n:"न्",
ga:"ग",gi:"गि",gu:"गु",ge:"गे",go:"गो",za:"ज़",ji:"जि",zu:"ज़ु",ze:"ज़े",zo:"ज़ो",da:"द",de:"दे",do:"दो",ba:"ब",bi:"बि",bu:"बु",be:"बे",bo:"बो",pa:"प",pi:"पि",pu:"पु",pe:"पे",po:"पो",
kya:"क्य",kyu:"क्यु",kyo:"क्यो",sha:"श",shu:"शु",sho:"शो",cha:"च",chu:"चु",cho:"चो",nya:"न्य",nyu:"न्यु",nyo:"न्यो",hya:"ह्य",hyu:"ह्यु",hyo:"ह्यो",mya:"म्य",myu:"म्यु",myo:"म्यो",rya:"र्य",ryu:"र्यु",ryo:"र्यो",gya:"ग्य",gyu:"ग्यु",gyo:"ग्यो",ja:"ज",ju:"जु",jo:"जो",bya:"ब्य",byu:"ब्यु",byo:"ब्यो",pya:"प्य",pyu:"प्यु",pyo:"प्यो"};

export const toKata = (s: string) => s.replace(/[ぁ-ゖ]/g, (c) => String.fromCharCode(c.charCodeAt(0) + 0x60));
export const toHira = (s: string) => s.replace(/[ァ-ヶ]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0x60));

type RowDef = [string, string, string[], string];
const BASIC: RowDef[] = [
  ["a", "あいうえお", ["a", "i", "u", "e", "o"], "Day 1"],
  ["k", "かきくけこ", ["ka", "ki", "ku", "ke", "ko"], "Day 1"],
  ["s", "さしすせそ", ["sa", "shi", "su", "se", "so"], "Day 2"],
  ["t", "たちつてと", ["ta", "chi", "tsu", "te", "to"], "Day 2"],
  ["n", "なにぬねの", ["na", "ni", "nu", "ne", "no"], "Day 3"],
  ["h", "はひふへほ", ["ha", "hi", "fu", "he", "ho"], "Day 3"],
  ["m", "まみむめも", ["ma", "mi", "mu", "me", "mo"], "Day 4"],
  ["y", "や_ゆ_よ", ["ya", "", "yu", "", "yo"], "Day 4"],
  ["r", "らりるれろ", ["ra", "ri", "ru", "re", "ro"], "Day 4"],
  ["w", "わ___を", ["wa", "", "", "", "wo"], "Day 5"],
  ["n", "ん____", ["n", "", "", "", ""], "Day 5"],
];
const DAKU: RowDef[] = [
  ["g", "がぎぐげご", ["ga", "gi", "gu", "ge", "go"], "Day 6"],
  ["z", "ざじずぜぞ", ["za", "ji", "zu", "ze", "zo"], "Day 6"],
  ["d", "だぢづでど", ["da", "ji", "zu", "de", "do"], "Day 6"],
  ["b", "ばびぶべぼ", ["ba", "bi", "bu", "be", "bo"], "Day 6"],
  ["p", "ぱぴぷぺぽ", ["pa", "pi", "pu", "pe", "po"], "Day 6"],
];
const YOON: RowDef[] = [
  ["ky", "きゃきゅきょ", ["kya", "kyu", "kyo"], "Day 7"], ["sh", "しゃしゅしょ", ["sha", "shu", "sho"], "Day 7"],
  ["ch", "ちゃちゅちょ", ["cha", "chu", "cho"], "Day 7"], ["ny", "にゃにゅにょ", ["nya", "nyu", "nyo"], "Day 7"],
  ["hy", "ひゃひゅひょ", ["hya", "hyu", "hyo"], "Day 7"], ["my", "みゃみゅみょ", ["mya", "myu", "myo"], "Day 7"],
  ["ry", "りゃりゅりょ", ["rya", "ryu", "ryo"], "Day 7"], ["gy", "ぎゃぎゅぎょ", ["gya", "gyu", "gyo"], "Day 7"],
  ["j", "じゃじゅじょ", ["ja", "ju", "jo"], "Day 7"], ["by", "びゃびゅびょ", ["bya", "byu", "byo"], "Day 7"],
  ["py", "ぴゃぴゅぴょ", ["pya", "pyu", "pyo"], "Day 7"],
];

function rows(defs: RowDef[], yoon: boolean, f: (s: string) => string): LetterRow[] {
  return defs.map(([lab, chars, romas, day]) => {
    const arr = yoon ? chars.match(/.[ゃゅょ]/g)! : Array.from(chars);
    return {
      label: (lab || "n") + " · " + day,
      cells: arr.map((c, i) => (c === "_" || !romas[i] ? null : { ch: f(c), rom: romas[i], hint: HI[romas[i]] })),
    };
  });
}

function groups(f: (s: string) => string, kata: boolean): LetterGroup[] {
  return [
    { id: "basic", title: "Basic 46", subtitle: "Days 1–5", cols: 5, rows: rows(BASIC, false, f),
      note: "Order: a → k → s → t → n → h → m → y → r → w → ん. Irregular sounds: し shi, ち chi, つ tsu, ふ fu. " + (kata ? "ヲ is almost only used in old texts." : "を (wo) is pronounced “o” and is only used as a particle.") },
    { id: "daku", title: "Voiced ゛ and ゜", subtitle: "Day 6", cols: 5, rows: rows(DAKU, false, f),
      note: "Two dots (dakuten) voice a sound: k→g, s→z, t→d, h→b. A small circle (handakuten) turns h→p. ぢ/づ sound like じ/ず and are rare." },
    { id: "yoon", title: "Combo sounds", subtitle: "Day 7", cols: 3, rows: rows(YOON, true, f),
      note: "A small ゃ ゅ ょ merges with the kana before it: き + ゃ = kya. It counts as ONE beat (mora), like a Hindi conjunct क्य." },
  ];
}

const HIRA_MNEMO: Record<string, string> = {
  "あ": "A cross and a big loop — a fork stabbing an apple: “Ah!”",
  "い": "Two eels swimming side by side: “ee”.",
  "う": "A little hat over a curved back — someone bowing and saying “ooh”.",
  "え": "A runner with a zig-zag leg, shouting “eh!” at the start line.",
  "お": "Like あ but with an extra flick on the right — “Oh! the apple grew a stem.”",
  "か": "A blade with a spark beside it — “KA-boom!”",
  "き": "A key with two teeth.",
  "く": "A bird’s open beak “<” calling “ku-ku” (cuckoo).",
  "け": "A keg standing next to a wall.",
  "こ": "Two short worms lying in a cocoon.",
  "さ": "A key that lost a tooth — sad: “sa…”.",
  "し": "A fishing hook — “she” goes fishing.",
  "す": "A swing hanging from a bar, looping round: “swing”.",
  "せ": "A mouth with one long tooth saying “say”.",
  "そ": "A zig-zag thread from a sewing needle: “sew”.",
  "た": "Looks like the letters “t” and “a” written together.",
  "ち": "A cheerleader with a curved arm — or a reversed number 5: “chi”.",
  "つ": "A single big wave: “tsunami”.",
  "て": "A hand reaching out — and て really is part of 手 (te, hand).",
  "と": "A toe with a thorn stuck in it.",
  "な": "A nun with a cross, kneeling with a knot.",
  "に": "A knee (|) next to two lines: “knee”.",
  "ぬ": "Noodles with a pair of chopsticks (and a loop at the end).",
  "ね": "A cat (neko) with a curly tail.",
  "の": "A “No entry” sign — one circle with a slash.",
  "は": "A wall and a smiling “ha!” beside it.",
  "ひ": "A big grin: “hee-hee”.",
  "ふ": "Mount Fuji with clouds floating around it.",
  "へ": "A gentle hill — “hey, a hill!”",
  "ほ": "Like は with an extra bar — a garden hoe.",
  "ま": "A rope tied twice with a loop — mama’s knot.",
  "み": "Looks like the number 21: “me at twenty-one”.",
  "む": "A cow (with a tail) going “moo”.",
  "め": "An eye with an eyelash — め also means eye (目).",
  "も": "A hook with two extra bait lines: “more fish”.",
  "や": "A yak’s horns and face.",
  "ゆ": "A fish swimming in a U-shaped stream: “you”.",
  "よ": "A yo-yo hanging on its string.",
  "ら": "A rabbit sitting with one ear up: “ra”.",
  "り": "Two reeds by a river.",
  "る": "A road that ends in a roundabout loop: “roo”.",
  "れ": "A man kneeling to re-tie his shoe.",
  "ろ": "る without the loop — a road with no roundabout.",
  "わ": "Like ね without the tail-loop: a waterfall dropping straight.",
  "を": "A fighter punching upward: “whoa!”",
  "ん": "A cursive lowercase n.",
};

const KATA_MNEMO: Record<string, string> = {
  "ア": "An axe chopping down.", "イ": "An easel standing up.", "ウ": "Like う with a box hat.", "エ": "An elevator I-beam.",
  "オ": "An opera singer with arms out.", "カ": "Same as か without the spark.", "キ": "A key, like き.", "ク": "A cook’s hat.",
  "ケ": "A K tilted over.", "コ": "Two corners of a box.", "サ": "A saddle.", "シ": "Smiling eyes — strokes go UP from the left (shi).",
  "ス": "A swimmer in a dive.", "セ": "Same shape idea as せ.", "ソ": "Two strokes — the long one falls DOWN like a sewing needle (so).",
  "タ": "Ta-da! A ク with an extra line.", "チ": "A cheerleader with a big pom-pom.", "ツ": "Eyes looking down — strokes go DOWN from the top (tsu).",
  "テ": "A telephone pole.", "ト": "A totem pole with a branch.", "ナ": "A knife cross.", "ニ": "Two lines: ni (2 is 二 ni!).",
  "ヌ": "A noodle-cutting knife.", "ネ": "A necktie.", "ノ": "A single slash: “No!”", "ハ": "A laughing mouth: ha-ha.",
  "ヒ": "A heel.", "フ": "A hook like ふ simplified.", "ヘ": "Same as へ.", "ホ": "A holy cross.", "マ": "A mama’s apron.",
  "ミ": "Three lines — me, myself and I.", "ム": "A moo-ing cow’s face.", "メ": "A messy X.", "モ": "Like も without the hook.",
  "ヤ": "Like や.", "ユ": "A U-turn sign.", "ヨ": "A yo-yo trick in E shape.", "ラ": "A rabbit’s ear on top.", "リ": "Like り.",
  "ル": "Two roots.", "レ": "A ladder leg.", "ロ": "A square road block.", "ワ": "A wine glass.", "ヲ": "A man with a stick.",
  "ン": "Like ソ but the long stroke goes UP — like a smile (n).",
};

/** Starter kanji (all appear in the top words, with KanjiVG stroke order). */
const KANJI: [string, string, string, string][] = [
  ["日", "nichi / hi", "day, sun", "दिन, सूर्य"], ["一", "ichi", "one", "एक"], ["二", "ni", "two", "दो"], ["三", "san", "three", "तीन"], ["人", "hito / jin", "person", "व्यक्ति"],
  ["大", "dai / ō", "big", "बड़ा"], ["小", "shō / chii", "small", "छोटा"], ["中", "naka / chū", "middle, inside", "बीच, अंदर"], ["上", "ue", "above", "ऊपर"], ["下", "shita", "below", "नीचे"],
  ["本", "hon", "book, origin", "किताब, मूल"], ["今", "ima", "now", "अभी"], ["時", "toki / ji", "time, o’clock", "समय"], ["年", "toshi / nen", "year", "साल"], ["何", "nani", "what", "क्या"],
  ["私", "watashi", "I, private", "मैं"], ["自", "ji", "self", "स्वयं"], ["分", "fun / wakaru", "minute; understand", "मिनट; समझना"], ["言", "iu", "say", "कहना"], ["思", "omou", "think", "सोचना"],
  ["生", "sei / ikiru", "life, birth", "जीवन"], ["子", "ko", "child", "बच्चा"], ["手", "te", "hand", "हाथ"], ["気", "ki", "spirit, air", "भाव, मन"], ["前", "mae", "before, front", "पहले, सामने"],
  ["後", "ato / go", "after, behind", "बाद, पीछे"], ["来", "kuru / rai", "come", "आना"], ["行", "iku", "go", "जाना"], ["見", "miru", "see", "देखना"], ["出", "deru", "exit, leave", "निकलना"],
  ["入", "hairu", "enter", "घुसना"], ["学", "gaku", "study", "पढ़ाई"], ["先", "saki / sen", "ahead, previous", "आगे"], ["名", "na / mei", "name", "नाम"], ["話", "hanasu", "talk", "बात करना"],
  ["食", "taberu", "eat", "खाना"], ["飲", "nomu", "drink", "पीना"], ["読", "yomu", "read", "पढ़ना"], ["書", "kaku", "write", "लिखना"], ["聞", "kiku", "hear, ask", "सुनना"],
  ["水", "mizu", "water", "पानी"], ["火", "hi / ka", "fire", "आग"], ["木", "ki", "tree", "पेड़"], ["金", "kane / kin", "gold, money", "सोना, पैसा"], ["月", "tsuki / getsu", "moon, month", "चाँद, महीना"],
  ["山", "yama", "mountain", "पहाड़"], ["川", "kawa", "river", "नदी"], ["口", "kuchi", "mouth", "मुँह"], ["目", "me", "eye", "आँख"], ["心", "kokoro", "heart, mind", "दिल, मन"],
  ["女", "onna", "woman", "महिला"], ["男", "otoko", "man", "पुरुष"], ["力", "chikara", "power", "शक्ति"], ["円", "en", "yen, circle", "येन, गोल"], ["会", "au / kai", "meet", "मिलना"],
  ["国", "kuni", "country", "देश"], ["語", "go", "language", "भाषा"], ["友", "tomo", "friend", "दोस्त"], ["家", "ie / ka", "house", "घर"], ["車", "kuruma", "car", "गाड़ी"],
];

export const kanjiMeaning: Record<string, { en: string; hi: string; rd: string }> = Object.fromEntries(KANJI.map(([c, rd, en, hi]) => [c, { en, hi, rd }]));

const kanjiGroups: LetterGroup[] = [0, 1, 2, 3, 4, 5].map((g) => ({
  id: "k" + g, title: ["Numbers & basics", "Time & self", "Thinking & life", "Movement & study", "Nature & body", "People & places"][g],
  subtitle: "10 kanji", cols: 5,
  rows: [0, 1].map((r) => ({
    label: "",
    cells: KANJI.slice(g * 10 + r * 5, g * 10 + r * 5 + 5).map(([ch, rd, en, hi]) => ({ ch, rom: rd, hint: en + " · " + hi })),
  })),
}));

export const alphabets: Alphabet[] = [
  { id: "hira", name: "Hiragana", native: "ひらがな", color: "var(--shu)", count: "46 + 25 voiced + 33 combos",
    blurb: "The core phonetic script. Every Japanese sound can be written in hiragana. Children learn it first.",
    usedFor: "Grammar endings (食べ**ます**), particles (は を に), and native words without common kanji.",
    groups: groups((s) => s, false), mnemonics: HIRA_MNEMO },
  { id: "kata", name: "Katakana", native: "カタカナ", color: "var(--ai)", count: "Same 46 sounds, angular shapes",
    blurb: "The same sounds as hiragana with sharper shapes. Long vowels use a dash ー (コーヒー kōhī).",
    usedFor: "Foreign loanwords (テレビ TV, インド India), names, sound effects and emphasis — like italics.",
    groups: groups(toKata, true), mnemonics: KATA_MNEMO },
  { id: "kanji", name: "Kanji", native: "漢字", color: "var(--matcha)", count: "~2,136 in daily use · start with 60",
    blurb: "Characters borrowed from Chinese. Each carries meaning, and usually has a Japanese (kun) and a Chinese-derived (on) reading.",
    usedFor: "Word stems: nouns, verb and adjective roots. They make text fast to scan because there are no spaces.",
    groups: kanjiGroups },
];
