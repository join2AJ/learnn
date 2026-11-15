import type { Lesson } from "../../core/types";

export const lessons: Lesson[] = [
  /* ===================== UNIT 1 · FOUNDATIONS ===================== */
  {
    id: "map", unit: "1 · Foundations", title: "The map: what’s in Japanese grammar", jp: "文法の地図", minutes: 6,
    summary: "Every part of speech in one page — and why Hindi speakers have a head start.",
    video: "Japanese grammar overview for beginners",
    blocks: [
      { kind: "text", text: "Japanese grammar is regular and logical. There are only **two tenses** (past and non-past), **no plural forms**, **no gender**, **no articles** (a/the), and verbs **do not change for the person** (I / you / he all use the same verb). What you must learn instead: particles, verb endings, and politeness levels." },
      { kind: "table", title: "Parts of speech", head: ["Part", "Japanese", "Example", "Notes"], rows: [
        ["Noun", "名詞 meishi", "本 hon (book)", "No plural, no gender, no a/the"],
        ["Pronoun", "代名詞", "私 watashi (I)", "Often dropped when obvious"],
        ["Verb", "動詞 dōshi", "食べる taberu (eat)", "Always at the END. 3 groups"],
        ["い-adjective", "形容詞", "高い takai (tall)", "Conjugates like a verb (高かった = was tall)"],
        ["な-adjective", "形容動詞", "静か shizuka (quiet)", "Acts like a noun; needs な before a noun"],
        ["Adverb", "副詞", "とても totemo (very)", "Comes before what it modifies"],
        ["Particle", "助詞 joshi", "は を に で", "Tiny tags AFTER words that mark their role"],
        ["Copula", "です / だ", "学生です (am a student)", "“is / am / are”"],
        ["Counter", "助数詞", "三人 san-nin (3 people)", "Number + counter, like ‘3 sheets of’"],
        ["Conjunction", "接続詞", "でも demo (but)", "Starts a sentence"],
      ] },
      { kind: "compare", title: "Why Hindi helps", compare: {
        en: "English: I (S) drink (V) water (O). — verb in the middle, prepositions BEFORE nouns (in Delhi).",
        hi: "हिन्दी: मैं (S) पानी (O) पीता हूँ (V)। — verb at the end, postpositions AFTER nouns (दिल्ली में).",
        jp: "日本語: 私は (S) 水を (O) 飲みます (V)。 — exactly the Hindi order! Particles は/を work like ने/को/में.",
      } },
      { kind: "examples", examples: [
        { jp: "私は水を飲みます。", ro: "watashi wa mizu o nomimasu", en: "I drink water.", hi: "मैं पानी पीता हूँ।" },
        { jp: "東京に行きます。", ro: "tōkyō ni ikimasu", en: "(I) go to Tokyo.", hi: "(मैं) टोक्यो जाता हूँ।", note: "Subject dropped — clear from context." },
      ] },
      { kind: "tip", text: "Learn in this order: です sentences → particles → verb ます forms → past/negative → て-form → plain forms. Each step unlocks hundreds of sentences." },
    ],
    quiz: [
      { q: "Where does the verb go in a Japanese sentence?", options: ["At the start", "In the middle", "At the end", "Anywhere"], answer: 2, explain: "Like Hindi, Japanese is verb-final (SOV)." },
      { q: "How many tenses does Japanese have?", options: ["12", "3", "2", "1"], answer: 2, explain: "Past and non-past. Aspect (ている) covers ‘-ing’." },
      { q: "Particles come ___ the word they mark.", options: ["before", "after", "instead of", "inside"], answer: 1, explain: "Like Hindi postpositions: 東京に = टोक्यो में." },
    ],
  },
  {
    id: "desu", unit: "1 · Foundations", title: "X is Y: です and だ", jp: "です・だ", minutes: 7,
    summary: "The first sentence pattern: A は B です — ‘A is B’.",
    video: "Japanese desu da explained beginner",
    blocks: [
      { kind: "pattern", title: "Pattern", text: "A は B です。 → A is B (polite)\nA は B だ。 → A is B (casual)" },
      { kind: "table", title: "です in four forms", head: ["", "Polite", "Casual", "English", "Hindi"], rows: [
        ["Present", "です desu", "だ da", "is", "है"],
        ["Negative", "じゃありません ja arimasen", "じゃない ja nai", "is not", "नहीं है"],
        ["Past", "でした deshita", "だった datta", "was", "था"],
        ["Past negative", "じゃありませんでした", "じゃなかった", "was not", "नहीं था"],
      ] },
      { kind: "examples", examples: [
        { jp: "私は学生です。", ro: "watashi wa gakusei desu", en: "I am a student.", hi: "मैं छात्र हूँ।" },
        { jp: "田中さんは先生じゃありません。", ro: "tanaka san wa sensei ja arimasen", en: "Mr Tanaka is not a teacher.", hi: "तनाका जी शिक्षक नहीं हैं।" },
        { jp: "昨日は雨でした。", ro: "kinō wa ame deshita", en: "Yesterday was rainy.", hi: "कल बारिश थी।" },
        { jp: "これはペンだ。", ro: "kore wa pen da", en: "This is a pen. (casual)", hi: "यह पेन है।" },
      ] },
      { kind: "compare", compare: {
        en: "English changes the verb: I am / you are / he is.",
        hi: "Hindi changes too: मैं हूँ / तुम हो / वह है.",
        jp: "Japanese never changes: 私は学生です / あなたは学生です / 彼は学生です — always です.",
      } },
      { kind: "tip", text: "The u in です is almost silent: say “dess”. Add さん (san) after other people’s names — never your own." },
    ],
    quiz: [
      { q: "“It was a holiday” (polite) → 休みで___。", options: ["す", "した", "しょう", "はない"], answer: 1, explain: "でした = was (polite)." },
      { q: "Casual form of です?", options: ["だ", "ます", "か", "ね"], answer: 0 },
      { q: "“I’m not a doctor” → 医者___。", options: ["です", "でした", "じゃありません", "だった"], answer: 2 },
    ],
  },
  {
    id: "wa-ga", unit: "1 · Foundations", title: "は vs が: topic and subject", jp: "は と が", minutes: 8,
    summary: "は sets the topic (‘as for…’); が points at the subject (‘it is X who…’).",
    video: "wa vs ga Japanese explained simply",
    blocks: [
      { kind: "text", text: "は (written ha, said **wa**) marks the **topic**: what the sentence is about, often known information. が marks the **subject**, especially new or emphasised information, and it is used with likes, skills, existence and questions words." },
      { kind: "table", head: ["Use", "Particle", "Example"], rows: [
        ["Known topic / contrast", "は", "私は学生です (As for me, I’m a student)"],
        ["New info / answer to who?", "が", "誰が来ましたか — 田中さんが来ました"],
        ["Likes, dislikes", "が", "猫が好きです (I like cats)"],
        ["Skills, wants", "が", "日本語が分かります (I understand Japanese)"],
        ["Exists (ある/いる)", "が", "犬がいます (There is a dog)"],
      ] },
      { kind: "examples", examples: [
        { jp: "象は鼻が長い。", ro: "zō wa hana ga nagai", en: "Elephants have long trunks. (As for elephants, the trunk is long.)", hi: "हाथी की सूँड लंबी होती है।" },
        { jp: "誰が来ましたか。", ro: "dare ga kimashita ka", en: "Who came?", hi: "कौन आया?" },
        { jp: "私はカレーが好きです。", ro: "watashi wa karē ga suki desu", en: "I like curry.", hi: "मुझे करी पसंद है।", note: "Like Hindi ‘मुझे… पसंद है’ — the liked thing is the grammatical subject." },
      ] },
      { kind: "tip", text: "Question words (誰 who, 何 what, どれ which) take が, never は. The answer also uses が." },
    ],
    quiz: [
      { q: "“Who is the teacher?” → 誰___先生ですか。", options: ["は", "が", "を", "に"], answer: 1 },
      { q: "“I like sushi” → 寿司___好きです。", options: ["を", "が", "で", "へ"], answer: 1 },
      { q: "How is the particle は pronounced?", options: ["ha", "wa", "ba", "he"], answer: 1 },
    ],
  },
  {
    id: "questions", unit: "1 · Foundations", title: "Questions and question words", jp: "疑問詞", minutes: 6,
    summary: "Add か to make a question. No word-order change needed.",
    video: "Japanese question words nani dare doko itsu",
    blocks: [
      { kind: "pattern", text: "Statement + か → question.  学生です → 学生ですか (Are you a student?)" },
      { kind: "table", head: ["Japanese", "Romaji", "English", "Hindi"], rows: [
        ["何", "nani / nan", "what", "क्या"], ["誰", "dare", "who", "कौन"], ["どこ", "doko", "where", "कहाँ"],
        ["いつ", "itsu", "when", "कब"], ["なぜ / どうして", "naze / dōshite", "why", "क्यों"], ["どう", "dō", "how", "कैसे"],
        ["いくら", "ikura", "how much (price)", "कितने का"], ["いくつ", "ikutsu", "how many", "कितने"], ["どれ / どの", "dore / dono", "which", "कौन-सा"],
      ] },
      { kind: "examples", examples: [
        { jp: "これは何ですか。", ro: "kore wa nan desu ka", en: "What is this?", hi: "यह क्या है?" },
        { jp: "トイレはどこですか。", ro: "toire wa doko desu ka", en: "Where is the toilet?", hi: "शौचालय कहाँ है?" },
        { jp: "これはいくらですか。", ro: "kore wa ikura desu ka", en: "How much is this?", hi: "यह कितने का है?" },
        { jp: "いつ来ますか。", ro: "itsu kimasu ka", en: "When will you come?", hi: "आप कब आएँगे?" },
      ] },
      { kind: "compare", compare: { en: "English moves words: You are → Are you…?", hi: "Hindi adds क्या: क्या आप छात्र हैं?", jp: "Japanese adds か at the end: 学生ですか。 Same idea as Hindi’s क्या, just at the end." } },
      { kind: "tip", text: "In speech, a rising tone alone makes a question: 行く？ (iku↗) = Are you going?" },
    ],
    quiz: [
      { q: "‘Where’ in Japanese?", options: ["いつ", "どこ", "誰", "何"], answer: 1 },
      { q: "To turn a polite sentence into a question, add…", options: ["ね", "よ", "か", "の"], answer: 2 },
      { q: "いくら asks about…", options: ["time", "price", "people", "place"], answer: 1 },
    ],
  },
  {
    id: "kosoado", unit: "1 · Foundations", title: "This, that, that over there: こそあど", jp: "こそあど", minutes: 5,
    summary: "One system for this/that/which — ko (near me), so (near you), a (far), do (question).",
    video: "Japanese kosoado kore sore are dore",
    blocks: [
      { kind: "table", head: ["", "こ (near me)", "そ (near you)", "あ (far)", "ど (?)"], rows: [
        ["thing", "これ", "それ", "あれ", "どれ"], ["+ noun", "この本", "その本", "あの本", "どの本"],
        ["place", "ここ", "そこ", "あそこ", "どこ"], ["way", "こう", "そう", "ああ", "どう"],
      ] },
      { kind: "compare", compare: { en: "English has 2 levels: this / that.", hi: "Hindi has 2: यह / वह (and यहाँ / वहाँ).", jp: "Japanese has 3: これ (near me) / それ (near you) / あれ (far from both)." } },
      { kind: "examples", examples: [
        { jp: "それは私の傘です。", ro: "sore wa watashi no kasa desu", en: "That (near you) is my umbrella.", hi: "वह (आपके पास) मेरा छाता है।" },
        { jp: "あの人は誰ですか。", ro: "ano hito wa dare desu ka", en: "Who is that person over there?", hi: "वह व्यक्ति कौन है?" },
        { jp: "ここに座ってください。", ro: "koko ni suwatte kudasai", en: "Please sit here.", hi: "कृपया यहाँ बैठिए।" },
      ] },
    ],
    quiz: [
      { q: "“That book over there” →", options: ["この本", "その本", "あの本", "どの本"], answer: 2 },
      { q: "“Here” →", options: ["ここ", "そこ", "あそこ", "どこ"], answer: 0 },
      { q: "Before a noun, これ becomes…", options: ["この", "ここ", "こう", "こんな"], answer: 0 },
    ],
  },

  /* ===================== UNIT 2 · NOUNS & PARTICLES ===================== */
  {
    id: "nouns", unit: "2 · Nouns & particles", title: "Nouns: no plural, no gender, no ‘the’", jp: "名詞", minutes: 5,
    summary: "本 means book, books, a book, the book. Context does the work.",
    video: "Japanese nouns plural no articles beginner",
    blocks: [
      { kind: "text", text: "Japanese nouns never change form. 猫 (neko) = cat / cats / a cat / the cat. For people you may add たち (tachi): 私たち = we, 子供たち = children. Nouns join with の: 私の本 (my book), 日本の車 (a Japanese car)." },
      { kind: "compare", compare: { en: "English: book → books; a/the; he/she/it.", hi: "Hindi: किताब → किताबें; and gender: अच्छा लड़का / अच्छी लड़की.", jp: "Japanese: 本 stays 本. No gender — adjectives never change for gender. One less thing to memorise!" } },
      { kind: "examples", examples: [
        { jp: "猫が三匹います。", ro: "neko ga san biki imasu", en: "There are three cats.", hi: "तीन बिल्लियाँ हैं।", note: "Plural shown only by the number." },
        { jp: "私たちは友達です。", ro: "watashi tachi wa tomodachi desu", en: "We are friends.", hi: "हम दोस्त हैं।" },
        { jp: "母の車は赤いです。", ro: "haha no kuruma wa akai desu", en: "My mother’s car is red.", hi: "मेरी माँ की गाड़ी लाल है।" },
      ] },
      { kind: "tip", text: "の works like Hindi का/की/के — but never changes for gender: 母の車, 母の本 (माँ की गाड़ी, माँ की किताब)." },
    ],
    quiz: [
      { q: "‘Books’ in Japanese?", options: ["本たち", "本々", "本", "本ら"], answer: 2 },
      { q: "‘My friend’ →", options: ["私は友達", "私の友達", "私を友達", "私に友達"], answer: 1 },
      { q: "Do Japanese adjectives change for gender?", options: ["Yes", "No"], answer: 1 },
    ],
  },
  {
    id: "particles1", unit: "2 · Nouns & particles", title: "Particles を に で へ", jp: "を・に・で・へ", minutes: 9,
    summary: "Object, destination/time, place of action/means, direction.",
    video: "Japanese particles o ni de e explained",
    blocks: [
      { kind: "table", head: ["Particle", "Role", "Hindi", "Example"], rows: [
        ["を (o)", "direct object", "को / —", "パンを食べる (eat bread)"],
        ["に (ni)", "destination, time, target", "को / में / पर", "七時に起きる (get up at 7)"],
        ["で (de)", "place of action; by means of", "में / से", "家で勉強する (study at home); バスで (by bus)"],
        ["へ (e)", "direction (toward)", "की ओर", "日本へ行く (go toward Japan)"],
      ] },
      { kind: "examples", examples: [
        { jp: "毎朝コーヒーを飲みます。", ro: "maiasa kōhī o nomimasu", en: "I drink coffee every morning.", hi: "मैं हर सुबह कॉफ़ी पीता हूँ।" },
        { jp: "学校に行きます。", ro: "gakkō ni ikimasu", en: "I go to school.", hi: "मैं स्कूल जाता हूँ।" },
        { jp: "図書館で本を読みます。", ro: "toshokan de hon o yomimasu", en: "I read books at the library.", hi: "मैं पुस्तकालय में किताबें पढ़ता हूँ।" },
        { jp: "電車で会社に行きます。", ro: "densha de kaisha ni ikimasu", en: "I go to the office by train.", hi: "मैं ट्रेन से दफ़्तर जाता हूँ।" },
      ] },
      { kind: "tip", text: "に = where something IS or GOES (point). で = where something HAPPENS (stage). 東京に住む (live in Tokyo) but 東京で働く (work in Tokyo)." },
    ],
    quiz: [
      { q: "“I eat lunch at a restaurant” → レストラン___昼ご飯を食べます。", options: ["に", "で", "を", "へ"], answer: 1 },
      { q: "“I wake up at 6” → 六時___起きます。", options: ["で", "を", "に", "が"], answer: 2 },
      { q: "“I read a book” → 本___読みます。", options: ["を", "に", "で", "は"], answer: 0 },
    ],
  },
  {
    id: "particles2", unit: "2 · Nouns & particles", title: "Particles の と も から まで", jp: "の・と・も・から・まで", minutes: 7,
    summary: "Of, and/with, also, from, until.",
    video: "Japanese particles no to mo kara made",
    blocks: [
      { kind: "table", head: ["Particle", "Meaning", "Hindi", "Example"], rows: [
        ["の", "of, ’s", "का/की/के", "私の名前 (my name)"], ["と", "and (full list); with", "और; के साथ", "友達と行く (go with a friend)"],
        ["も", "also, too", "भी", "私も学生です (I’m a student too)"], ["から", "from; because", "से; क्योंकि", "九時から (from 9)"],
        ["まで", "until, up to", "तक", "五時まで (until 5)"], ["や", "and (partial list)", "और (आदि)", "本やペン (books, pens, etc.)"],
      ] },
      { kind: "examples", examples: [
        { jp: "パンと卵を買いました。", ro: "pan to tamago o kaimashita", en: "I bought bread and eggs.", hi: "मैंने ब्रेड और अंडे ख़रीदे।" },
        { jp: "私も行きます。", ro: "watashi mo ikimasu", en: "I’ll go too.", hi: "मैं भी जाऊँगा।" },
        { jp: "九時から五時まで働きます。", ro: "ku ji kara go ji made hatarakimasu", en: "I work from 9 to 5.", hi: "मैं नौ से पाँच बजे तक काम करता हूँ।" },
      ] },
      { kind: "tip", text: "も REPLACES は, が and を: 私も (not 私はも). With other particles it follows them: 東京にも (to Tokyo too)." },
    ],
    quiz: [
      { q: "‘Until’ →", options: ["から", "まで", "も", "と"], answer: 1 },
      { q: "“My sister too” → 姉___", options: ["はも", "も", "がも", "の"], answer: 1 },
      { q: "“With my mother” → 母___", options: ["と", "の", "を", "も"], answer: 0 },
    ],
  },
  {
    id: "numbers", unit: "2 · Nouns & particles", title: "Numbers and counters", jp: "数と助数詞", minutes: 9,
    summary: "1–10, big numbers (万 = 10,000) and the most useful counters.",
    video: "Japanese numbers 1 to 100 and counters",
    blocks: [
      { kind: "table", head: ["#", "Kanji", "Reading", "Hindi"], rows: [
        ["1", "一", "ichi", "एक"], ["2", "二", "ni", "दो"], ["3", "三", "san", "तीन"], ["4", "四", "yon / shi", "चार"], ["5", "五", "go", "पाँच"],
        ["6", "六", "roku", "छह"], ["7", "七", "nana / shichi", "सात"], ["8", "八", "hachi", "आठ"], ["9", "九", "kyū / ku", "नौ"], ["10", "十", "jū", "दस"],
        ["100", "百", "hyaku", "सौ"], ["1,000", "千", "sen", "हज़ार"], ["10,000", "万", "man", "दस हज़ार"],
      ] },
      { kind: "text", text: "Numbers build like Lego: 23 = 二十三 (ni-jū-san, ‘two-ten-three’). Japanese groups big numbers by **10,000 (万)** — like Hindi groups by लाख and करोड़ instead of the English million." },
      { kind: "table", title: "Key counters", head: ["Counter", "For", "Example"], rows: [
        ["〜つ", "general things (1–9)", "ひとつ, ふたつ, みっつ"], ["〜人 nin", "people", "一人 hitori, 二人 futari, 三人 san-nin"],
        ["〜枚 mai", "flat things (paper, shirts)", "二枚 ni-mai"], ["〜本 hon", "long things (pens, bottles)", "一本 ippon, 三本 sanbon"],
        ["〜匹 hiki", "small animals", "一匹 ippiki"], ["〜円 en", "yen", "百円 hyaku-en"], ["〜時 ji / 〜分 fun", "o’clock / minutes", "三時十分 san-ji juppun"],
      ] },
      { kind: "examples", examples: [
        { jp: "りんごを三つください。", ro: "ringo o mittsu kudasai", en: "Three apples, please.", hi: "तीन सेब दीजिए।" },
        { jp: "家族は四人です。", ro: "kazoku wa yonin desu", en: "There are four people in my family.", hi: "मेरे परिवार में चार लोग हैं।" },
        { jp: "千五百円です。", ro: "sen go hyaku en desu", en: "It’s 1,500 yen.", hi: "पंद्रह सौ येन है।" },
      ] },
      { kind: "tip", text: "四 (shi) sounds like 死 death and 九 (ku) like 苦 suffering, so people prefer yon and kyū. Gifts in sets of 4 are avoided." },
    ],
    quiz: [
      { q: "How do you say 30?", options: ["さんじゅう", "さんぜん", "さんひゃく", "みっつ"], answer: 0 },
      { q: "Counter for people?", options: ["枚", "本", "人", "匹"], answer: 2 },
      { q: "一万 equals…", options: ["1,000", "10,000", "100,000", "1,000,000"], answer: 1 },
    ],
  },
  {
    id: "time", unit: "2 · Nouns & particles", title: "Time, days and dates", jp: "時間と曜日", minutes: 7,
    summary: "Today/tomorrow, clock time, weekdays (named after the 5 elements + sun & moon).",
    video: "Japanese days of the week and telling time",
    blocks: [
      { kind: "table", head: ["Japanese", "Romaji", "English", "Hindi"], rows: [
        ["今日", "kyō", "today", "आज"], ["明日", "ashita", "tomorrow", "कल (आने वाला)"], ["昨日", "kinō", "yesterday", "कल (बीता)"],
        ["今", "ima", "now", "अभी"], ["毎日", "mainichi", "every day", "रोज़"], ["朝 / 昼 / 夜", "asa / hiru / yoru", "morning / noon / night", "सुबह / दोपहर / रात"],
      ] },
      { kind: "table", title: "Days of the week", head: ["Day", "Japanese", "Element", "Hindi day"], rows: [
        ["Sun", "日曜日 nichiyōbi", "sun 日", "रविवार (रवि = सूर्य)"], ["Mon", "月曜日 getsuyōbi", "moon 月", "सोमवार (सोम = चंद्र)"],
        ["Tue", "火曜日 kayōbi", "fire 火 (Mars)", "मंगलवार (मंगल = Mars)"], ["Wed", "水曜日 suiyōbi", "water 水 (Mercury)", "बुधवार (बुध = Mercury)"],
        ["Thu", "木曜日 mokuyōbi", "wood 木 (Jupiter)", "गुरुवार (गुरु = Jupiter)"], ["Fri", "金曜日 kin’yōbi", "metal 金 (Venus)", "शुक्रवार (शुक्र = Venus)"],
        ["Sat", "土曜日 doyōbi", "earth 土 (Saturn)", "शनिवार (शनि = Saturn)"],
      ] },
      { kind: "compare", compare: { en: "English days come from Norse gods and planets.", hi: "Hindi days are named after the same seven celestial bodies (रवि, सोम, मंगल…).", jp: "Japanese uses the SAME planet order as Hindi! Mars=Tuesday in both (火 fire-star / मंगल)." } },
      { kind: "examples", examples: [
        { jp: "今、何時ですか。", ro: "ima nan ji desu ka", en: "What time is it now?", hi: "अभी कितने बजे हैं?" },
        { jp: "三時半です。", ro: "san ji han desu", en: "It’s half past three.", hi: "साढ़े तीन बजे हैं।" },
        { jp: "明日は日曜日です。", ro: "ashita wa nichiyōbi desu", en: "Tomorrow is Sunday.", hi: "कल रविवार है।" },
      ] },
      { kind: "tip", text: "Relative times (今日, 明日, 毎日) take NO particle. Clock times and dates take に: 三時に, 月曜日に." },
    ],
    quiz: [
      { q: "Wednesday is named after…", options: ["fire", "water", "wood", "gold"], answer: 1 },
      { q: "‘Yesterday’ →", options: ["明日", "昨日", "今日", "毎日"], answer: 1 },
      { q: "“At 7 o’clock” →", options: ["七時で", "七時に", "七時を", "七時"], answer: 1 },
    ],
  },
  {
    id: "aru-iru", unit: "2 · Nouns & particles", title: "There is / I have: ある and いる", jp: "ある・いる", minutes: 6,
    summary: "ある for things, いる for living beings. Also how to say ‘have’.",
    video: "Japanese aru iru difference",
    blocks: [
      { kind: "pattern", text: "Place に Thing が あります。 → There is a thing in/at place.\nPlace に Person/Animal が います。 → There is a person/animal at place." },
      { kind: "examples", examples: [
        { jp: "机の上に本があります。", ro: "tsukue no ue ni hon ga arimasu", en: "There’s a book on the desk.", hi: "मेज़ पर एक किताब है।" },
        { jp: "公園に子供がいます。", ro: "kōen ni kodomo ga imasu", en: "There are children in the park.", hi: "पार्क में बच्चे हैं।" },
        { jp: "お金がありません。", ro: "okane ga arimasen", en: "I don’t have money.", hi: "मेरे पास पैसे नहीं हैं।" },
        { jp: "兄弟がいますか。", ro: "kyōdai ga imasu ka", en: "Do you have siblings?", hi: "क्या आपके भाई-बहन हैं?" },
      ] },
      { kind: "compare", compare: { en: "English: I have money.", hi: "Hindi: मेरे पास पैसे हैं — ‘near me there is money’.", jp: "Japanese: お金があります — ‘money exists’. Same logic as Hindi’s मेरे पास!" } },
      { kind: "tip", text: "Plants and robots use ある (not alive in the ‘moving’ sense). Taxis with drivers — speakers often use いる!" },
    ],
    quiz: [
      { q: "There is a cat → 猫が___。", options: ["あります", "います", "です", "します"], answer: 1 },
      { q: "There is a station → 駅が___。", options: ["あります", "います"], answer: 0 },
      { q: "Negative of ある (plain)?", options: ["あらない", "ない", "いない", "ありない"], answer: 1 },
    ],
  },

  /* ===================== UNIT 3 · VERBS & TENSES ===================== */
  {
    id: "verb-groups", unit: "3 · Verbs & tenses", title: "The 3 verb groups", jp: "動詞のグループ", minutes: 8,
    summary: "Every verb ends in -u. Know its group and you can conjugate it perfectly.",
    video: "Japanese verb groups ichidan godan irregular",
    blocks: [
      { kind: "table", head: ["Group", "How to spot", "Examples", "Stem for ます"], rows: [
        ["Group 2 · る-verbs (ichidan)", "ends in -iru / -eru", "食べる taberu, 見る miru, 起きる okiru", "drop る → 食べ + ます"],
        ["Group 1 · う-verbs (godan)", "everything else", "飲む nomu, 書く kaku, 話す hanasu, 待つ matsu", "u → i: 飲み + ます"],
        ["Group 3 · irregular", "only two!", "する suru (do), 来る kuru (come)", "します, 来ます kimasu"],
      ] },
      { kind: "text", text: "Watch out: some -iru/-eru verbs are actually う-verbs: 帰る kaeru (return), 入る hairu (enter), 走る hashiru (run), 知る shiru (know), 切る kiru (cut). They become 帰ります, 入ります…" },
      { kind: "examples", examples: [
        { jp: "毎日日本語を勉強します。", ro: "mainichi nihongo o benkyō shimasu", en: "I study Japanese every day.", hi: "मैं रोज़ जापानी पढ़ता हूँ।", note: "Noun + する makes a verb, like Hindi noun + करना (पढ़ाई करना)." },
        { jp: "七時に起きます。", ro: "shichi ji ni okimasu", en: "I get up at seven.", hi: "मैं सात बजे उठता हूँ।" },
        { jp: "手紙を書きます。", ro: "tegami o kakimasu", en: "I write a letter.", hi: "मैं चिट्ठी लिखता हूँ।" },
      ] },
      { kind: "compare", compare: { en: "English has ~200 irregular verbs (go/went/gone).", hi: "Hindi: mostly regular but with gender (गया/गई) and person (जाता हूँ/जाते हो).", jp: "Japanese: just 2 irregular verbs, no gender, no person. Open the Verb Conjugator to see every form." } },
    ],
    quiz: [
      { q: "Which group is 飲む (nomu)?", options: ["る-verb", "う-verb", "irregular"], answer: 1 },
      { q: "ます form of 食べる?", options: ["食べります", "食べます", "食べみます", "食べいます"], answer: 1 },
      { q: "帰る (kaeru, return) is a…", options: ["る-verb", "う-verb (exception!)", "irregular"], answer: 1 },
    ],
  },
  {
    id: "tenses", unit: "3 · Verbs & tenses", title: "Tense map: English vs Hindi vs Japanese", jp: "時制", minutes: 8,
    summary: "English has 12 tense forms, Hindi about as many. Japanese gets by with 2 + aspect.",
    video: "Japanese tenses explained present past te iru",
    blocks: [
      { kind: "table", title: "One verb: 食べる (eat) · खाना", head: ["Meaning", "English", "Hindi", "Japanese (polite)"], rows: [
        ["Habit / present", "I eat", "मैं खाता हूँ", "食べます"],
        ["Future", "I will eat", "मैं खाऊँगा", "食べます (same!)"],
        ["Progressive", "I am eating", "मैं खा रहा हूँ", "食べています"],
        ["Simple past", "I ate", "मैंने खाया", "食べました"],
        ["Past progressive", "I was eating", "मैं खा रहा था", "食べていました"],
        ["Present perfect", "I have eaten", "मैंने खा लिया है", "もう食べました"],
        ["Not yet", "I haven’t eaten yet", "मैंने अभी नहीं खाया", "まだ食べていません"],
        ["Negative present", "I don’t eat", "मैं नहीं खाता", "食べません"],
        ["Negative past", "I didn’t eat", "मैंने नहीं खाया", "食べませんでした"],
      ] },
      { kind: "text", text: "**Non-past** (ます / dictionary form) covers present habits AND the future — time words (明日 tomorrow) make it clear. **Past** (ました / た) covers simple past and most perfect meanings. **ている** adds ‘ongoing’ or ‘resulting state’." },
      { kind: "examples", examples: [
        { jp: "明日、東京に行きます。", ro: "ashita tōkyō ni ikimasu", en: "I will go to Tokyo tomorrow.", hi: "मैं कल टोक्यो जाऊँगा।" },
        { jp: "もう宿題をしました。", ro: "mō shukudai o shimashita", en: "I have already done my homework.", hi: "मैंने होमवर्क कर लिया है।" },
        { jp: "今、雨が降っています。", ro: "ima ame ga futte imasu", en: "It is raining now.", hi: "अभी बारिश हो रही है।" },
        { jp: "結婚しています。", ro: "kekkon shite imasu", en: "I am married.", hi: "मेरी शादी हो चुकी है।", note: "ている = resulting state, not ‘marrying right now’." },
      ] },
    ],
    quiz: [
      { q: "“I will eat” in polite Japanese?", options: ["食べました", "食べます", "食べています", "食べたい"], answer: 1 },
      { q: "“I am reading” →", options: ["読みます", "読んでいます", "読みました", "読もう"], answer: 1 },
      { q: "How many grammatical tenses?", options: ["2", "3", "6", "12"], answer: 0 },
    ],
  },
  {
    id: "masu", unit: "3 · Verbs & tenses", title: "Polite verbs: ます, ません, ました", jp: "ます形", minutes: 8,
    summary: "The four polite endings you’ll use all day.",
    video: "Japanese masu form conjugation beginner",
    blocks: [
      { kind: "table", head: ["", "Ending", "飲む (drink)", "Hindi"], rows: [
        ["Present / future", "〜ます", "飲みます nomimasu", "पीता हूँ / पिऊँगा"], ["Negative", "〜ません", "飲みません nomimasen", "नहीं पीता"],
        ["Past", "〜ました", "飲みました nomimashita", "पिया"], ["Past negative", "〜ませんでした", "飲みませんでした", "नहीं पिया"],
      ] },
      { kind: "examples", examples: [
        { jp: "お酒を飲みません。", ro: "osake o nomimasen", en: "I don’t drink alcohol.", hi: "मैं शराब नहीं पीता।" },
        { jp: "昨日、映画を見ました。", ro: "kinō eiga o mimashita", en: "I watched a movie yesterday.", hi: "मैंने कल फ़िल्म देखी।" },
        { jp: "朝ご飯を食べませんでした。", ro: "asagohan o tabemasen deshita", en: "I didn’t eat breakfast.", hi: "मैंने नाश्ता नहीं किया।" },
      ] },
      { kind: "tip", text: "Speak polite ます Japanese to strangers, shop staff, teachers and colleagues. It’s never wrong — casual forms are for friends and family." },
    ],
    quiz: [
      { q: "‘Did not go’ (polite) →", options: ["行きません", "行きませんでした", "行きました", "行かない"], answer: 1 },
      { q: "‘Will buy’ →", options: ["買います", "買いました", "買いません", "買った"], answer: 0 },
      { q: "Polite form is safe with…", options: ["only friends", "strangers and colleagues", "nobody"], answer: 1 },
    ],
  },
  {
    id: "plain", unit: "3 · Verbs & tenses", title: "Casual verbs: ない, た, なかった", jp: "普通形", minutes: 9,
    summary: "The plain forms friends use — and that grammar patterns are built on.",
    video: "Japanese plain form nai ta conjugation",
    blocks: [
      { kind: "table", head: ["Group", "Dictionary", "ない (not)", "た (did)", "なかった (didn’t)"], rows: [
        ["る-verb", "食べる", "食べない", "食べた", "食べなかった"], ["う-verb (く)", "書く", "書かない", "書いた", "書かなかった"],
        ["う-verb (む)", "飲む", "飲まない", "飲んだ", "飲まなかった"], ["う-verb (う)", "買う", "買わない", "買った", "買わなかった"],
        ["する", "する", "しない", "した", "しなかった"], ["来る", "来る (くる)", "来ない (こない)", "来た (きた)", "来なかった (こなかった)"],
      ] },
      { kind: "text", text: "For う-verbs: ない = change final u → a (書く→書か + ない). Exception: う becomes わ (買う → 買わない). The た form follows the same sound rules as the て-form (next lesson)." },
      { kind: "examples", examples: [
        { jp: "今日は行かない。", ro: "kyō wa ikanai", en: "I’m not going today. (casual)", hi: "आज नहीं जाऊँगा।" },
        { jp: "もう食べた？", ro: "mō tabeta", en: "Did you eat already? (casual)", hi: "खाना खा लिया?" },
        { jp: "全然分からなかった。", ro: "zenzen wakaranakatta", en: "I didn’t understand at all.", hi: "बिल्कुल समझ नहीं आया।" },
      ] },
    ],
    quiz: [
      { q: "Plain negative of 話す (hanasu)?", options: ["話さない", "話しない", "話すない", "話せない"], answer: 0 },
      { q: "Plain past of 飲む?", options: ["飲みた", "飲んだ", "飲った", "飲いた"], answer: 1 },
      { q: "Plain negative of 来る?", options: ["きない", "くない", "こない", "来らない"], answer: 2 },
    ],
  },
  {
    id: "te-form", unit: "3 · Verbs & tenses", title: "The て-form: please, and, -ing", jp: "て形", minutes: 10,
    summary: "One form, many jobs: requests, linking actions, progressive, permission.",
    video: "Japanese te form song rules",
    blocks: [
      { kind: "table", title: "How to make it (う-verbs)", head: ["Ending", "→ て", "Example"], rows: [
        ["う つ る", "って", "買う→買って, 待つ→待って, 帰る→帰って"], ["む ぶ ぬ", "んで", "飲む→飲んで, 遊ぶ→遊んで, 死ぬ→死んで"],
        ["く", "いて", "書く→書いて (exception: 行く→行って)"], ["ぐ", "いで", "泳ぐ→泳いで"], ["す", "して", "話す→話して"],
        ["る-verbs", "drop る + て", "食べる→食べて, 見る→見て"], ["irregular", "", "する→して, 来る→来て (きて)"],
      ] },
      { kind: "table", title: "What it does", head: ["Pattern", "Meaning", "Example"], rows: [
        ["〜てください", "please do", "見てください (please look)"], ["〜て、〜", "and then", "起きて、食べて、行く"],
        ["〜ている", "is doing / state", "勉強している (is studying)"], ["〜てもいい", "may I…", "入ってもいいですか (may I come in?)"],
        ["〜てはいけない", "must not", "ここで吸ってはいけません (no smoking here)"],
      ] },
      { kind: "examples", examples: [
        { jp: "ちょっと待ってください。", ro: "chotto matte kudasai", en: "Please wait a moment.", hi: "ज़रा रुकिए।" },
        { jp: "朝起きて、シャワーを浴びて、会社に行きます。", ro: "asa okite, shawā o abite, kaisha ni ikimasu", en: "In the morning I get up, shower and go to work.", hi: "सुबह उठकर, नहाकर दफ़्तर जाता हूँ।", note: "Exactly like Hindi -कर: उठकर, नहाकर." },
        { jp: "写真を撮ってもいいですか。", ro: "shashin o totte mo ii desu ka", en: "May I take a photo?", hi: "क्या मैं फ़ोटो ले सकता हूँ?" },
      ] },
    ],
    quiz: [
      { q: "て-form of 書く?", options: ["書って", "書いて", "書んで", "書して"], answer: 1 },
      { q: "て-form of 行く?", options: ["行いて", "行って", "行んで", "行きて"], answer: 1 },
      { q: "“Please speak slowly” → ゆっくり___ください。", options: ["話して", "話す", "話した", "話し"], answer: 0 },
    ],
  },
  {
    id: "want-lets", unit: "3 · Verbs & tenses", title: "Want, let’s, shall we: たい・ましょう・ませんか", jp: "たい・ましょう", minutes: 6,
    summary: "Express wishes and make invitations politely.",
    video: "Japanese tai mashou masen ka",
    blocks: [
      { kind: "table", head: ["Pattern", "Meaning", "Example", "Hindi"], rows: [
        ["stem + たい", "want to", "日本に行きたい", "जापान जाना चाहता हूँ"], ["stem + たくない", "don’t want to", "働きたくない", "काम नहीं करना चाहता"],
        ["stem + ましょう", "let’s", "行きましょう", "चलो चलें"], ["stem + ませんか", "won’t you…? (invite)", "一緒に食べませんか", "साथ में खाएँ?"],
      ] },
      { kind: "examples", examples: [
        { jp: "お寿司が食べたいです。", ro: "osushi ga tabetai desu", en: "I want to eat sushi.", hi: "मुझे सुशी खानी है।" },
        { jp: "一緒に映画を見ませんか。", ro: "issho ni eiga o mimasen ka", en: "Would you like to watch a movie together?", hi: "क्या साथ में फ़िल्म देखें?" },
        { jp: "はい、見ましょう！", ro: "hai, mimashō", en: "Yes, let’s watch!", hi: "हाँ, देखते हैं!" },
      ] },
      { kind: "tip", text: "〜ませんか (‘won’t you?’) is softer and more polite than 〜ましょう. Japanese invitations leave space to say no." },
    ],
    quiz: [
      { q: "“I want to sleep” →", options: ["寝ます", "寝たい", "寝ましょう", "寝ない"], answer: 1 },
      { q: "Most polite invitation?", options: ["行こう", "行きましょう", "行きませんか"], answer: 2 },
      { q: "たい conjugates like a…", options: ["noun", "い-adjective", "な-adjective"], answer: 1, explain: "食べたくない, 食べたかった." },
    ],
  },

  /* ===================== UNIT 4 · ADJECTIVES ===================== */
  {
    id: "i-adj", unit: "4 · Adjectives", title: "い-adjectives", jp: "い形容詞", minutes: 7,
    summary: "Adjectives that conjugate for tense themselves: 高い → 高かった.",
    video: "Japanese i adjectives conjugation",
    blocks: [
      { kind: "table", head: ["", "Form", "高い (expensive)", "English"], rows: [
        ["Present", "〜い", "高い(です)", "is expensive"], ["Negative", "〜くない", "高くない(です)", "isn’t expensive"],
        ["Past", "〜かった", "高かった(です)", "was expensive"], ["Past negative", "〜くなかった", "高くなかった(です)", "wasn’t expensive"],
        ["Adverb", "〜く", "早く (quickly)", "-ly"], ["Linking", "〜くて", "安くておいしい", "cheap AND tasty"],
      ] },
      { kind: "examples", examples: [
        { jp: "このラーメンはおいしいです。", ro: "kono rāmen wa oishii desu", en: "This ramen is delicious.", hi: "यह रामेन स्वादिष्ट है।" },
        { jp: "昨日は寒かったです。", ro: "kinō wa samukatta desu", en: "It was cold yesterday.", hi: "कल ठंड थी।" },
        { jp: "あまり高くないです。", ro: "amari takaku nai desu", en: "It’s not very expensive.", hi: "ज़्यादा महँगा नहीं है।" },
      ] },
      { kind: "tip", text: "Irregular: いい (good) → よくない, よかった. Watch out: きれい (pretty) and 嫌い (dislike) end in い but are な-adjectives!" },
    ],
    quiz: [
      { q: "Past of 楽しい (fun)?", options: ["楽しいでした", "楽しかった", "楽しだった", "楽しくた"], answer: 1 },
      { q: "Negative of いい?", options: ["いくない", "よくない", "いいない", "よいない"], answer: 1 },
      { q: "“Quickly” from 早い →", options: ["早い", "早く", "早な", "早に"], answer: 1 },
    ],
  },
  {
    id: "na-adj", unit: "4 · Adjectives", title: "な-adjectives", jp: "な形容詞", minutes: 6,
    summary: "Adjectives that behave like nouns: use な before a noun and です/だ for tense.",
    video: "Japanese na adjectives",
    blocks: [
      { kind: "table", head: ["", "Form", "静か (quiet)"], rows: [
        ["Before noun", "〜な + noun", "静かな部屋 (a quiet room)"], ["Present", "〜です / だ", "静かです"],
        ["Negative", "〜じゃありません / じゃない", "静かじゃない"], ["Past", "〜でした / だった", "静かでした"],
        ["Adverb", "〜に", "静かに (quietly)"],
      ] },
      { kind: "examples", examples: [
        { jp: "京都は有名な町です。", ro: "kyōto wa yūmei na machi desu", en: "Kyoto is a famous city.", hi: "क्योटो एक मशहूर शहर है।" },
        { jp: "野菜が好きじゃないです。", ro: "yasai ga suki ja nai desu", en: "I don’t like vegetables.", hi: "मुझे सब्ज़ियाँ पसंद नहीं हैं।" },
        { jp: "静かにしてください。", ro: "shizuka ni shite kudasai", en: "Please be quiet.", hi: "कृपया शांत रहिए।" },
      ] },
      { kind: "tip", text: "Common な-adjectives: 好き (like), 嫌い (dislike), 上手 (good at), 下手 (bad at), 元気 (healthy), 大丈夫 (OK), 便利 (convenient), 大切 (important)." },
    ],
    quiz: [
      { q: "“A beautiful flower” → きれい___花", options: ["い", "な", "の", "に"], answer: 1 },
      { q: "“Was healthy” → 元気___", options: ["かった", "でした", "くない", "な"], answer: 1 },
      { q: "Which is a な-adjective?", options: ["高い", "安い", "好き", "大きい"], answer: 2 },
    ],
  },
  {
    id: "compare", unit: "4 · Adjectives", title: "Comparing: より・一番・方", jp: "比較", minutes: 6,
    summary: "Better than, the best, which is more…?",
    video: "Japanese comparison yori ichiban hou",
    blocks: [
      { kind: "pattern", text: "A は B より [adj]  → A is more [adj] than B\nA の方が [adj]  → A is more [adj]\n〜で 一番 [adj]  → the most [adj] in…" },
      { kind: "examples", examples: [
        { jp: "インドは日本より大きいです。", ro: "indo wa nihon yori ōkii desu", en: "India is bigger than Japan.", hi: "भारत जापान से बड़ा है।", note: "より = से, exactly like Hindi!" },
        { jp: "コーヒーと紅茶とどちらが好きですか。", ro: "kōhī to kōcha to dochira ga suki desu ka", en: "Which do you like more, coffee or tea?", hi: "आपको कॉफ़ी और चाय में से क्या ज़्यादा पसंद है?" },
        { jp: "紅茶の方が好きです。", ro: "kōcha no hō ga suki desu", en: "I prefer tea.", hi: "मुझे चाय ज़्यादा पसंद है।" },
        { jp: "富士山は日本で一番高い山です。", ro: "fujisan wa nihon de ichiban takai yama desu", en: "Mt Fuji is the highest mountain in Japan.", hi: "फ़ूजी पर्वत जापान का सबसे ऊँचा पहाड़ है।" },
      ] },
      { kind: "compare", compare: { en: "English changes the adjective: big → bigger → biggest.", hi: "Hindi adds से / सबसे: से बड़ा, सबसे बड़ा.", jp: "Japanese adds より / 一番 and never changes the adjective — same as Hindi." } },
    ],
    quiz: [
      { q: "‘Than’ →", options: ["より", "方", "一番", "も"], answer: 0 },
      { q: "‘The most’ →", options: ["より", "一番", "とても", "方"], answer: 1 },
      { q: "より behaves like Hindi…", options: ["का", "से", "में", "को"], answer: 1 },
    ],
  },

  /* ===================== UNIT 5 · NEXT LEVEL ===================== */
  {
    id: "can", unit: "5 · Next level", title: "Can: potential form", jp: "可能形", minutes: 7,
    summary: "話せる (can speak), 食べられる (can eat), できる (can do).",
    video: "Japanese potential form can do",
    blocks: [
      { kind: "table", head: ["Group", "Rule", "Example"], rows: [
        ["う-verb", "u → e + る", "話す → 話せる (can speak)"], ["る-verb", "る → られる", "食べる → 食べられる"],
        ["する", "→ できる", "運転できる (can drive)"], ["来る", "→ 来られる (こられる)", ""],
        ["Any verb", "dictionary + ことができる", "泳ぐことができる (formal)"],
      ] },
      { kind: "examples", examples: [
        { jp: "日本語が少し話せます。", ro: "nihongo ga sukoshi hanasemasu", en: "I can speak a little Japanese.", hi: "मैं थोड़ी जापानी बोल सकता हूँ।" },
        { jp: "辛い物が食べられますか。", ro: "karai mono ga taberaremasu ka", en: "Can you eat spicy food?", hi: "क्या आप तीखा खा सकते हैं?" },
        { jp: "ピアノができます。", ro: "piano ga dekimasu", en: "I can play piano.", hi: "मैं पियानो बजा सकता हूँ।" },
      ] },
      { kind: "tip", text: "With potential verbs the object usually takes が: 日本語が話せる. In casual speech people drop ら: 食べれる (ra-nuki) — understood, but say 食べられる in polite speech." },
    ],
    quiz: [
      { q: "‘Can read’ from 読む →", options: ["読める", "読まれる", "読みられる", "読もう"], answer: 0 },
      { q: "‘Can do’ →", options: ["しれる", "できる", "される", "すれる"], answer: 1 },
      { q: "‘Can see’ from 見る →", options: ["見れる only", "見られる", "見せる", "見える only"], answer: 1 },
    ],
  },
  {
    id: "if", unit: "5 · Next level", title: "If and when: たら・ば・と", jp: "条件", minutes: 8,
    summary: "Three ways to say ‘if’. Start with たら — it works almost everywhere.",
    video: "Japanese conditionals tara ba to nara",
    blocks: [
      { kind: "table", head: ["Form", "How", "Feel", "Example"], rows: [
        ["たら", "past + ら", "if / when (most versatile)", "雨が降ったら、行きません"], ["ば", "u→e + ば", "if (condition → result)", "安ければ買います"],
        ["と", "dictionary + と", "whenever (automatic)", "春になると、桜が咲く"], ["なら", "noun/verb + なら", "if it’s about…", "東京なら、電車が便利"],
      ] },
      { kind: "examples", examples: [
        { jp: "時間があったら、手伝ってください。", ro: "jikan ga attara, tetsudatte kudasai", en: "If you have time, please help me.", hi: "अगर समय हो तो मदद कीजिए।" },
        { jp: "家に帰ったら、電話します。", ro: "ie ni kaettara, denwa shimasu", en: "When I get home, I’ll call.", hi: "घर पहुँचकर फ़ोन करूँगा।" },
        { jp: "このボタンを押すと、ドアが開きます。", ro: "kono botan o osu to, doa ga akimasu", en: "When you press this button, the door opens.", hi: "यह बटन दबाने पर दरवाज़ा खुलता है।" },
      ] },
    ],
    quiz: [
      { q: "Most versatile ‘if’?", options: ["と", "ば", "たら", "なら"], answer: 2 },
      { q: "たら form of 行く?", options: ["行くたら", "行ったら", "行きたら", "行けたら"], answer: 1 },
      { q: "“Whenever spring comes…” uses…", options: ["と", "たら", "なら"], answer: 0 },
    ],
  },
  {
    id: "because-but", unit: "5 · Next level", title: "Because and but: から・ので・けど・が", jp: "理由と逆接", minutes: 6,
    summary: "Join two sentences with a reason or a contrast.",
    video: "Japanese kara node kedo explained",
    blocks: [
      { kind: "table", head: ["Word", "Meaning", "Feel"], rows: [
        ["から", "because, so", "direct, personal reason"], ["ので", "because, since", "softer, more polite"],
        ["けど", "but (casual)", "also softens a sentence"], ["が", "but (polite/written)", "connects two clauses"], ["でも", "but (start of sentence)", ""],
      ] },
      { kind: "examples", examples: [
        { jp: "暑いから、窓を開けます。", ro: "atsui kara, mado o akemasu", en: "It’s hot, so I’ll open the window.", hi: "गर्मी है, इसलिए खिड़की खोलता हूँ।", note: "Reason comes FIRST, like Hindi ‘गर्मी है, इसलिए…’" },
        { jp: "頭が痛いので、休みます。", ro: "atama ga itai node, yasumimasu", en: "I have a headache, so I’ll rest.", hi: "सिर दर्द है, इसलिए आराम करूँगा।" },
        { jp: "高いけど、買います。", ro: "takai kedo, kaimasu", en: "It’s expensive, but I’ll buy it.", hi: "महँगा है, लेकिन ख़रीदूँगा।" },
      ] },
      { kind: "tip", text: "Japanese often stops at けど to sound polite and indirect: ちょっと分からないんですけど… (I don’t quite understand, but…)." },
    ],
    quiz: [
      { q: "More polite ‘because’?", options: ["から", "ので"], answer: 1 },
      { q: "Casual ‘but’?", options: ["けど", "ので", "から", "まで"], answer: 0 },
      { q: "The reason comes…", options: ["before the result", "after the result"], answer: 0 },
    ],
  },
  {
    id: "keigo", unit: "5 · Next level", title: "Politeness levels and keigo", jp: "敬語", minutes: 8,
    summary: "Casual, polite, honorific, humble — and which one to use when.",
    video: "Japanese keigo explained beginner",
    blocks: [
      { kind: "table", head: ["Level", "To whom", "‘to eat’", "Hindi feel"], rows: [
        ["Casual 普通形", "friends, family", "食べる", "तू / तुम खाओ"], ["Polite 丁寧語", "everyone else", "食べます", "आप खाइए"],
        ["Honorific 尊敬語", "raises the OTHER person", "召し上がる meshiagaru", "आप भोजन ग्रहण कीजिए"], ["Humble 謙譲語", "lowers YOURSELF", "いただく itadaku", "मैं ग्रहण करूँगा"],
      ] },
      { kind: "compare", compare: { en: "English shows politeness with please / would you / sir.", hi: "Hindi builds it into pronouns and verbs: तू → तुम → आप; खा → खाओ → खाइए.", jp: "Japanese builds it into verbs and vocabulary — similar to Hindi’s आप system, with separate ‘raising’ and ‘lowering’ words." } },
      { kind: "examples", examples: [
        { jp: "いらっしゃいませ。", ro: "irasshaimase", en: "Welcome! (shop staff)", hi: "पधारिए / स्वागत है।" },
        { jp: "少々お待ちください。", ro: "shōshō omachi kudasai", en: "Please wait a moment. (very polite)", hi: "कृपया थोड़ा प्रतीक्षा करें।" },
        { jp: "いただきます。", ro: "itadakimasu", en: "(said before eating — ‘I humbly receive’)", hi: "भोजन से पहले कहा जाता है" },
      ] },
      { kind: "tip", text: "As a learner, polite ます/です is all you need. You’ll HEAR keigo from staff; just recognise it." },
    ],
    quiz: [
      { q: "Safe default level for strangers?", options: ["Casual", "Polite ます", "Humble only"], answer: 1 },
      { q: "Honorific language raises…", options: ["yourself", "the other person"], answer: 1 },
      { q: "Hindi parallel to keigo?", options: ["तू/तुम/आप levels", "gender", "plural"], answer: 0 },
    ],
  },
  {
    id: "sentence-end", unit: "5 · Next level", title: "Sentence endings: ね・よ・よね", jp: "終助詞", minutes: 5,
    summary: "Tiny endings that add feeling: agreement, new info, checking.",
    video: "Japanese sentence ending particles ne yo",
    blocks: [
      { kind: "table", head: ["Ending", "Feel", "Example", "Hindi feel"], rows: [
        ["ね", "seeking agreement", "いい天気ですね", "…है ना?"], ["よ", "telling new info", "おいしいですよ", "…है, सच में!"],
        ["よね", "checking shared info", "明日休みですよね", "कल छुट्टी है ना, हम्म?"], ["かな", "wondering", "雨が降るかな", "…होगा क्या?"],
      ] },
      { kind: "examples", examples: [
        { jp: "今日は暑いですね。", ro: "kyō wa atsui desu ne", en: "It’s hot today, isn’t it?", hi: "आज गर्मी है ना?" },
        { jp: "この店、安いですよ。", ro: "kono mise, yasui desu yo", en: "This shop is cheap, you know.", hi: "यह दुकान सस्ती है, सच में।" },
      ] },
      { kind: "tip", text: "Overusing よ can sound pushy. ね is your friend in small talk — it invites the other person to agree." },
    ],
    quiz: [
      { q: "To seek agreement, add…", options: ["よ", "ね", "か", "な"], answer: 1 },
      { q: "To give new information, add…", options: ["ね", "よ", "の", "も"], answer: 1 },
      { q: "ね is like Hindi…", options: ["है ना?", "क्योंकि", "से", "भी"], answer: 0 },
    ],
  },
];
