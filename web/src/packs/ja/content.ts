import type { LanguagePack } from "../../core/types";

type P = LanguagePack;
const yt = (q: string) => "https://www.youtube.com/results?search_query=" + encodeURIComponent(q);

export const phrases: P["phrases"] = [
  { id: "greet", title: "Greetings", icon: "👋", items: [
    { jp: "おはようございます", ro: "ohayō gozaimasu", en: "Good morning", hi: "सुप्रभात" },
    { jp: "こんにちは", ro: "konnichiwa", en: "Hello / Good afternoon", hi: "नमस्ते" },
    { jp: "こんばんは", ro: "konbanwa", en: "Good evening", hi: "शुभ संध्या" },
    { jp: "おやすみなさい", ro: "oyasuminasai", en: "Good night", hi: "शुभ रात्रि" },
    { jp: "さようなら", ro: "sayōnara", en: "Goodbye (for a long time)", hi: "अलविदा" },
    { jp: "じゃあね / またね", ro: "jā ne / mata ne", en: "See you (casual)", hi: "फिर मिलेंगे" },
    { jp: "お元気ですか", ro: "o genki desu ka", en: "How are you?", hi: "आप कैसे हैं?" },
    { jp: "元気です", ro: "genki desu", en: "I’m fine", hi: "मैं ठीक हूँ" },
  ] },
  { id: "intro", title: "Introduce yourself", icon: "🙋", items: [
    { jp: "はじめまして", ro: "hajimemashite", en: "Nice to meet you (first time)", hi: "आपसे मिलकर खुशी हुई" },
    { jp: "私はラヴィです", ro: "watashi wa ravi desu", en: "I am Ravi", hi: "मैं रवि हूँ", note: "Replace ラヴィ with your own name in katakana." },
    { jp: "インドから来ました", ro: "indo kara kimashita", en: "I came from India", hi: "मैं भारत से आया हूँ" },
    { jp: "日本語を勉強しています", ro: "nihongo o benkyō shite imasu", en: "I am studying Japanese", hi: "मैं जापानी सीख रहा हूँ" },
    { jp: "よろしくお願いします", ro: "yoroshiku onegai shimasu", en: "Please treat me well (said after intros)", hi: "कृपया मेरा ध्यान रखिए" },
  ] },
  { id: "polite", title: "Thanks & sorry", icon: "🙏", items: [
    { jp: "ありがとうございます", ro: "arigatō gozaimasu", en: "Thank you very much", hi: "बहुत धन्यवाद" },
    { jp: "どういたしまして", ro: "dō itashimashite", en: "You’re welcome", hi: "कोई बात नहीं" },
    { jp: "すみません", ro: "sumimasen", en: "Excuse me / sorry", hi: "माफ़ कीजिए" },
    { jp: "ごめんなさい", ro: "gomen nasai", en: "I’m sorry", hi: "मुझे माफ़ करें" },
    { jp: "大丈夫です", ro: "daijōbu desu", en: "It’s OK / I’m fine", hi: "ठीक है" },
    { jp: "お願いします", ro: "onegai shimasu", en: "Please (requesting)", hi: "कृपया" },
  ] },
  { id: "help", title: "When you’re stuck", icon: "🆘", items: [
    { jp: "分かりません", ro: "wakarimasen", en: "I don’t understand", hi: "मुझे समझ नहीं आया" },
    { jp: "もう一度お願いします", ro: "mō ichido onegai shimasu", en: "Once more, please", hi: "कृपया एक बार और" },
    { jp: "ゆっくり話してください", ro: "yukkuri hanashite kudasai", en: "Please speak slowly", hi: "कृपया धीरे बोलिए" },
    { jp: "英語を話せますか", ro: "eigo o hanasemasu ka", en: "Can you speak English?", hi: "क्या आप अंग्रेज़ी बोल सकते हैं?" },
    { jp: "これは日本語で何と言いますか", ro: "kore wa nihongo de nan to iimasu ka", en: "How do you say this in Japanese?", hi: "इसे जापानी में क्या कहते हैं?" },
    { jp: "助けてください", ro: "tasukete kudasai", en: "Please help me", hi: "कृपया मेरी मदद कीजिए" },
  ] },
  { id: "food", title: "Food & restaurants", icon: "🍜", items: [
    { jp: "いただきます", ro: "itadakimasu", en: "(before eating)", hi: "खाने से पहले" },
    { jp: "ごちそうさまでした", ro: "gochisōsama deshita", en: "(after eating — thanks for the meal)", hi: "खाने के बाद धन्यवाद" },
    { jp: "メニューをください", ro: "menyū o kudasai", en: "The menu, please", hi: "मेन्यू दीजिए" },
    { jp: "これをください", ro: "kore o kudasai", en: "This one, please", hi: "यह दीजिए" },
    { jp: "おいしいです", ro: "oishii desu", en: "It’s delicious", hi: "स्वादिष्ट है" },
    { jp: "ベジタリアンです", ro: "bejitarian desu", en: "I’m vegetarian", hi: "मैं शाकाहारी हूँ" },
    { jp: "肉と魚は食べられません", ro: "niku to sakana wa taberaremasen", en: "I can’t eat meat or fish", hi: "मैं मांस और मछली नहीं खा सकता" },
    { jp: "お会計お願いします", ro: "okaikei onegai shimasu", en: "The bill, please", hi: "बिल दीजिए" },
  ] },
  { id: "travel", title: "Getting around", icon: "🚆", items: [
    { jp: "駅はどこですか", ro: "eki wa doko desu ka", en: "Where is the station?", hi: "स्टेशन कहाँ है?" },
    { jp: "トイレはどこですか", ro: "toire wa doko desu ka", en: "Where is the toilet?", hi: "शौचालय कहाँ है?" },
    { jp: "東京まで一枚", ro: "tōkyō made ichimai", en: "One ticket to Tokyo", hi: "टोक्यो का एक टिकट" },
    { jp: "この電車は大阪に行きますか", ro: "kono densha wa ōsaka ni ikimasu ka", en: "Does this train go to Osaka?", hi: "क्या यह ट्रेन ओसाका जाती है?" },
    { jp: "まっすぐ行ってください", ro: "massugu itte kudasai", en: "Please go straight", hi: "सीधे जाइए" },
    { jp: "右 / 左", ro: "migi / hidari", en: "right / left", hi: "दाएँ / बाएँ" },
  ] },
  { id: "shop", title: "Shopping", icon: "🛍️", items: [
    { jp: "いくらですか", ro: "ikura desu ka", en: "How much is it?", hi: "कितने का है?" },
    { jp: "カードで払えますか", ro: "kādo de haraemasu ka", en: "Can I pay by card?", hi: "क्या कार्ड से भुगतान कर सकते हैं?" },
    { jp: "袋はいりません", ro: "fukuro wa irimasen", en: "I don’t need a bag", hi: "थैली नहीं चाहिए" },
    { jp: "見ているだけです", ro: "mite iru dake desu", en: "I’m just looking", hi: "बस देख रहा हूँ" },
  ] },
  { id: "feel", title: "Feelings & reactions", icon: "😊", items: [
    { jp: "すごい！", ro: "sugoi", en: "Amazing!", hi: "कमाल!" },
    { jp: "本当？", ro: "hontō", en: "Really?", hi: "सच में?" },
    { jp: "なるほど", ro: "naruhodo", en: "I see / that makes sense", hi: "अच्छा, समझ गया" },
    { jp: "楽しかったです", ro: "tanoshikatta desu", en: "It was fun", hi: "मज़ा आया" },
    { jp: "疲れました", ro: "tsukaremashita", en: "I’m tired", hi: "मैं थक गया" },
    { jp: "頑張って！", ro: "ganbatte", en: "Do your best! / Good luck!", hi: "लगे रहो! / शुभकामनाएँ!" },
  ] },
];

export const roadmap: P["roadmap"] = [
  { id: "p0", title: "Sounds & mindset", when: "Day 1", goal: "Hear and say the 5 vowels and the rhythm of Japanese.",
    tasks: [{ text: "Read ‘Scripts’ overview", check: "scripts" }, { text: "Pronunciation: vowels, long vowels, small っ", check: "pron" }, { text: "Open Sound Lab and see your own あいうえお", check: "lab" }],
    checkpoint: "You can say あ い う え お clearly and know that Japanese is mora-timed." },
  { id: "p1", title: "Hiragana", when: "Days 1–7", goal: "Read all 46 hiragana + voiced + combos.",
    tasks: [{ text: "~10 new kana a day in chart order", check: "hira10" }, { text: "Kana quiz daily until 90%+", check: "hira46" }, { text: "Write each kana 3× with stroke order", check: "write10" }],
    checkpoint: "Read ありがとう, すし, がっこう without romaji." },
  { id: "p2", title: "Katakana", when: "Days 8–14", goal: "Read loanwords: コーヒー, インド, テレビ.",
    tasks: [{ text: "Same chart order as hiragana", check: "kata10" }, { text: "Master シ/ツ and ソ/ン pairs", check: "kata46" }],
    checkpoint: "Read your name and 10 food words in katakana." },
  { id: "p3", title: "Survival grammar + first 100 words", when: "Weeks 2–3", goal: "Build です sentences, particles, ます verbs.",
    tasks: [{ text: "Grammar Unit 1 (Foundations)", check: "unit1" }, { text: "Learn the 30 core grammar words", check: "core30" }, { text: "Know words 1–100 (≈65% of speech)", check: "w100" }, { text: "Learn 20 survival phrases out loud", check: "phr" }],
    checkpoint: "Introduce yourself and ask 3 questions." },
  { id: "p4", title: "Verbs, tenses, adjectives", when: "Weeks 4–8", goal: "Past, negative, て-form, adjectives.",
    tasks: [{ text: "Grammar Units 2–4", check: "unit4" }, { text: "Words 101–300", check: "w300" }, { text: "Daily: 20 min comprehensible input (YouTube)" }, { text: "Weekly: speak 30 min with a tutor/partner" }],
    checkpoint: "Describe your day in 5 sentences, past and present." },
  { id: "p5", title: "Words 301–1,000 + kanji", when: "Months 3–5", goal: "Finish the 1,000-word core and first 100 kanji.",
    tasks: [{ text: "Grammar Unit 5", check: "unit5" }, { text: "Words 301–600", check: "w600" }, { text: "Words 601–1,000", check: "w1000" }, { text: "Learn kanji through words you know" }],
    checkpoint: "Hold a 10-minute conversation on familiar topics. JLPT N5 level." },
  { id: "p6", title: "Grow to N4 → N3", when: "Months 6–18", goal: "2,000–3,700 words, 300–650 kanji, natural listening.",
    tasks: [{ text: "Read NHK News Web Easy weekly" }, { text: "Watch anime/dramas with Japanese subtitles" }, { text: "Shadow native audio 10 min a day" }],
    checkpoint: "Understand slow native conversations and simple news." },
];

export const resources: P["resources"] = [
  { id: "yt-ci", title: "YouTube · listen & understand (comprehensible input)", items: [
    { title: "にほんごのじかん Nihongo no Jikan", url: "https://www.youtube.com/@nihongo-no-jikan", kind: "youtube", level: "Beginner → Intermediate", note: "Slow, clear Japanese-only stories with visuals." },
    { title: "Comprehensible Japanese", url: yt("Comprehensible Japanese complete beginner"), kind: "search", level: "Complete beginner", note: "Illustrated Japanese-only stories, very slow." },
    { title: "Japanese Immersion with Asami", url: yt("Japanese Immersion with Asami"), kind: "search", level: "Beginner", note: "Easy daily-life Japanese without English." },
    { title: "Natural Japanese (NIJ)", url: "https://www.youtube.com/@nijapanese", kind: "youtube", level: "Beginner+", note: "Natural speech at learner-friendly speed." },
    { title: "Onomappu", url: "https://www.youtube.com/@onomappu", kind: "youtube", level: "Intermediate", note: "Slow natural Japanese podcasts and vlogs." },
  ] },
  { id: "yt-lessons", title: "YouTube · grammar & lessons", items: [
    { title: "Japanese Ammo with Misa", url: "https://www.youtube.com/@JapaneseAmmowithMisa", kind: "youtube", level: "All levels", note: "Clear grammar explanations with examples." },
    { title: "ToKini Andy", url: "https://www.youtube.com/@TokiniAndy", kind: "youtube", level: "Beginner", note: "Hiragana, katakana and Genki-textbook walk-throughs." },
    { title: "Learn Japanese From Zero!", url: "https://www.youtube.com/@JapaneseFromZero", kind: "youtube", level: "Beginner", note: "Structured course that follows the From Zero books." },
    { title: "JapanesePod101", url: "https://www.youtube.com/@japanesepod101", kind: "youtube", level: "All levels", note: "Huge library: phrases, listening, kana." },
    { title: "Japanese with Shun", url: "https://www.youtube.com/@JapaneseWithShun", kind: "youtube", level: "Beginner+", note: "Natural expressions and real-life Japanese." },
    { title: "Cure Dolly (organic grammar)", url: yt("Cure Dolly Japanese grammar from the ground up"), kind: "search", level: "Beginner+", note: "A different, logic-first take on particles." },
  ] },
  { id: "yt-pron", title: "YouTube · pronunciation & pitch accent", items: [
    { title: "Dogen", url: "https://www.youtube.com/@Dogen", kind: "youtube", level: "All levels", note: "Pitch accent and pronunciation deep-dives." },
    { title: "Hiragana pronunciation (search)", url: yt("hiragana pronunciation native speaker"), kind: "search", note: "Hear every kana from native speakers." },
    { title: "Japanese R sound (search)", url: yt("how to pronounce Japanese R sound"), kind: "search", note: "The flap between r, l and d." },
    { title: "Shadowing practice (search)", url: yt("Japanese shadowing practice beginner"), kind: "search", note: "Repeat-after-me drills." },
  ] },
  { id: "web", title: "Websites & dictionaries", items: [
    { title: "Jisho.org", url: "https://jisho.org", kind: "web", note: "Best free Japanese–English dictionary." },
    { title: "Tofugu: Learn Hiragana", url: "https://www.tofugu.com/japanese/learn-hiragana/", kind: "web", note: "Mnemonic-based hiragana guide." },
    { title: "Tae Kim’s Guide to Japanese", url: "https://guidetojapanese.org/learn/", kind: "web", note: "Free grammar guide from basics up." },
    { title: "NHK World — Easy Japanese", url: "https://www.nhk.or.jp/lesson/en/", kind: "web", note: "Free 48-lesson audio course with Hindi option." },
    { title: "NHK News Web Easy", url: "https://www3.nhk.or.jp/news/easy/", kind: "web", level: "N4+", note: "Real news in simple Japanese with furigana." },
    { title: "Marugoto (Japan Foundation)", url: "https://www.marugoto.org/en/", kind: "web", note: "Official course aligned with JF standards." },
    { title: "OJAD pitch-accent dictionary", url: "https://www.gavo.t.u-tokyo.ac.jp/ojad/eng/pages/home", kind: "web", note: "See the pitch pattern of any word." },
    { title: "Imabi", url: "https://www.imabi.org", kind: "web", note: "Very deep grammar reference." },
    { title: "Tatoeba", url: "https://tatoeba.org", kind: "web", note: "Millions of example sentences with audio." },
    { title: "JLPT official site", url: "https://www.jlpt.jp/e/", kind: "web", note: "Test dates, levels, sample questions." },
  ] },
  { id: "apps", title: "Apps & speaking partners", items: [
    { title: "Anki", url: "https://apps.ankiweb.net", kind: "app", note: "Spaced-repetition flashcards for later stages." },
    { title: "WaniKani", url: "https://www.wanikani.com", kind: "app", note: "Kanji + vocabulary with mnemonics (first levels free)." },
    { title: "italki", url: "https://www.italki.com", kind: "app", note: "Paid tutors from about $8/hour." },
    { title: "HelloTalk", url: "https://www.hellotalk.com", kind: "app", note: "Free language exchange with Japanese speakers." },
  ] },
];

export const pronunciation: P["pronunciation"] = [
  { id: "vowels", title: "The 5 pure vowels", text: "Japanese has only 5 vowels: a i u e o. They are short, clean and never glide (English ‘go’ = go-u; Japanese ご is just ‘go’).",
    en: "English has ~12–20 vowel sounds. Japanese a ≈ ‘a’ in father (shorter), i ≈ ‘ee’, u ≈ ‘oo’ without rounding lips, e ≈ ‘e’ in pet, o ≈ ‘o’ in more.",
    hi: "Hindi speakers: あ≈अ/आ (between), い≈इ, う≈उ (lips NOT rounded), え≈ए, お≈ओ. Very close to Hindi!",
    examples: [{ jp: "あいうえお", ro: "a i u e o", en: "the five vowels", hi: "अ इ उ ए ओ" }, { jp: "いえ", ro: "ie", en: "house", hi: "घर" }, { jp: "あおい", ro: "aoi", en: "blue", hi: "नीला" }] },
  { id: "mora", title: "Rhythm: every beat is equal", text: "Japanese is timed by morae (beats). Each kana = one beat, ん = one beat, small っ = one beat of silence, long vowel = two beats. Speak like a metronome.",
    en: "English stresses some syllables (BA-na-na). Japanese gives every beat equal length and no stress: ba-na-na.",
    hi: "Like reciting a Sanskrit shloka — each syllable gets its own measured beat.",
    examples: [{ jp: "にほん", ro: "ni-ho-n", en: "Japan (3 beats)", hi: "जापान" }, { jp: "とうきょう", ro: "to-o-kyo-o", en: "Tokyo (4 beats, not 2!)", hi: "टोक्यो" }] },
  { id: "long", title: "Long vowels change meaning", text: "Holding a vowel twice as long makes a different word. Hiragana adds あいう (おかあさん); katakana uses ー (コーヒー).",
    en: "Like ‘ship’ vs ‘sheep’ but more systematic.",
    hi: "Exactly like Hindi छोटी/बड़ी मात्रा: दिन vs दीन, कुल vs कूल.",
    examples: [{ jp: "おばさん", ro: "obasan", en: "aunt", hi: "आंटी" }, { jp: "おばあさん", ro: "obāsan", en: "grandmother", hi: "दादी/नानी" }, { jp: "ゆき", ro: "yuki", en: "snow", hi: "बर्फ़" }, { jp: "ゆうき", ro: "yūki", en: "courage", hi: "हिम्मत" }] },
  { id: "tsu", title: "Small っ: the double consonant", text: "A small っ means pause for one beat, then hit the next consonant hard: きって kitte.",
    en: "Like the gap in ‘bookcase’ (boo-k-case).",
    hi: "Exactly like Hindi द्वित्व: पक्का (pakkā), बच्चा (bacchā), सत्ता.",
    examples: [{ jp: "きて", ro: "kite", en: "come (te-form)", hi: "आओ" }, { jp: "きって", ro: "kitte", en: "stamp", hi: "डाक टिकट" }, { jp: "がっこう", ro: "gakkō", en: "school", hi: "स्कूल" }] },
  { id: "r", title: "The Japanese R", text: "Not English r, not l: a quick flap — the tongue tip taps the ridge behind your teeth once.",
    en: "Like the ‘tt’ in American ‘butter’ or ‘d’ in ‘ladder’ said fast.",
    hi: "Very close to Hindi र (a single tap) or the flap ड़. Hindi speakers usually get this right naturally!",
    examples: [{ jp: "ありがとう", ro: "arigatō", en: "thank you", hi: "धन्यवाद" }, { jp: "りんご", ro: "ringo", en: "apple", hi: "सेब" }, { jp: "くるま", ro: "kuruma", en: "car", hi: "गाड़ी" }] },
  { id: "unaspirated", title: "No puff of air on k, t, p", text: "Japanese k, t, p are lightly aspirated at most. Never strongly breathy.",
    en: "English ‘pin’ has a puff of air (pʰ). Japanese ぱ is softer.",
    hi: "Use the UNaspirated row: क not ख, त not थ, प not फ. Japanese has no ख/थ/फ/घ/ध/भ distinction.",
    examples: [{ jp: "たこ", ro: "tako", en: "octopus", hi: "ऑक्टोपस" }, { jp: "ぱん", ro: "pan", en: "bread", hi: "ब्रेड" }] },
  { id: "fu", title: "Tricky sounds: ふ つ し ち ん", text: "ふ fu: blow softly through rounded lips (between f and h). つ tsu: t+s together. し shi, ち chi. ん changes to m before b/p/m (しんぶん → shimbun).",
    en: "ふ is not English f — no teeth on lip. つ is the ‘ts’ in ‘cats’.",
    hi: "ふ is between फ and ह (no teeth). つ = त्सु. ん is like अनुस्वार ं — it adapts to the next sound (संबंध).",
    examples: [{ jp: "ふじさん", ro: "fujisan", en: "Mt Fuji", hi: "फ़ूजी पर्वत" }, { jp: "つなみ", ro: "tsunami", en: "tsunami", hi: "सुनामी" }, { jp: "しんぶん", ro: "shimbun", en: "newspaper", hi: "अख़बार" }] },
  { id: "devoice", title: "Whispered vowels", text: "i and u between voiceless consonants (k, s, t, h, p) are often whispered: です → ‘dess’, すき → ‘ski’.",
    en: "Like the barely-there vowel in ‘potato’ → ‘p’tato’.",
    hi: "Like the schwa deletion in Hindi: कमला → kam-lā, not ka-ma-lā.",
    examples: [{ jp: "です", ro: "des(u)", en: "is", hi: "है" }, { jp: "すきです", ro: "s(u)ki des(u)", en: "I like it", hi: "पसंद है" }, { jp: "ひと", ro: "h(i)to", en: "person", hi: "व्यक्ति" }] },
  { id: "pitch", title: "Pitch accent (high/low)", text: "Japanese uses pitch, not stress. Each beat is High or Low; the pattern can change meaning: はし (HL) chopsticks vs はし (LH) bridge.",
    en: "English uses loudness stress: REcord vs reCORD.",
    hi: "Hindi uses stress and intonation too; Japanese pitch is a musical up-down on each beat. See the Sound Lab pitch tracker.",
    examples: [{ jp: "箸", ro: "hashi (HL)", en: "chopsticks", hi: "चॉपस्टिक" }, { jp: "橋", ro: "hashi (LH)", en: "bridge", hi: "पुल" }, { jp: "雨", ro: "ame (HL)", en: "rain", hi: "बारिश" }, { jp: "飴", ro: "ame (LH)", en: "candy", hi: "टॉफ़ी" }] },
];

/** Approximate adult male formants (Hz). Japanese from Keating & Huffman / Nishi et al. style averages; English from Hillenbrand et al. (1995); Hindi approximate literature averages. */
export const vowels: P["vowels"] = [
  { ipa: "a", label: "あ a", f1: 760, f2: 1300, f3: 2500, lang: "target", example: "あさ" },
  { ipa: "i", label: "い i", f1: 300, f2: 2250, f3: 3000, lang: "target", example: "いぬ" },
  { ipa: "ɯ", label: "う u", f1: 350, f2: 1380, f3: 2400, lang: "target", example: "うみ" },
  { ipa: "e", label: "え e", f1: 480, f2: 1950, f3: 2600, lang: "target", example: "えき" },
  { ipa: "o", label: "お o", f1: 500, f2: 850, f3: 2500, lang: "target", example: "おと" },
  { ipa: "iː", label: "EN beet", f1: 342, f2: 2322, f3: 3000, lang: "en" },
  { ipa: "ɪ", label: "EN bit", f1: 427, f2: 2034, f3: 2684, lang: "en" },
  { ipa: "ɛ", label: "EN bet", f1: 580, f2: 1799, f3: 2605, lang: "en" },
  { ipa: "æ", label: "EN bat", f1: 588, f2: 1952, f3: 2601, lang: "en" },
  { ipa: "ɑ", label: "EN father", f1: 768, f2: 1333, f3: 2522, lang: "en" },
  { ipa: "ɔ", label: "EN thought", f1: 652, f2: 997, f3: 2538, lang: "en" },
  { ipa: "u", label: "EN boot", f1: 378, f2: 997, f3: 2343, lang: "en" },
  { ipa: "ʌ", label: "EN but", f1: 623, f2: 1200, f3: 2550, lang: "en" },
  { ipa: "ə", label: "हि अ", f1: 600, f2: 1350, f3: 2500, lang: "hi" },
  { ipa: "aː", label: "हि आ", f1: 780, f2: 1250, f3: 2500, lang: "hi" },
  { ipa: "iː", label: "हि ई", f1: 290, f2: 2300, f3: 3000, lang: "hi" },
  { ipa: "uː", label: "हि ऊ", f1: 330, f2: 800, f3: 2300, lang: "hi" },
  { ipa: "eː", label: "हि ए", f1: 420, f2: 2050, f3: 2700, lang: "hi" },
  { ipa: "oː", label: "हि ओ", f1: 450, f2: 850, f3: 2450, lang: "hi" },
];

export const sounds: P["sounds"] = [
  { id: "a", label: "a", jp: "あ", kind: "vowel", f: [760, 1300, 2500], desc: "Open mouth, tongue low. F1 is HIGH (≈760 Hz) — the bands sit close together in the middle." },
  { id: "i", label: "i", jp: "い", kind: "vowel", f: [300, 2250, 3000], desc: "Tongue high and front. F1 very low, F2 very high — the widest gap of any vowel." },
  { id: "u", label: "u", jp: "う", kind: "vowel", f: [350, 1380, 2400], desc: "Lips relaxed, NOT rounded. F2 is higher than English ‘oo’ (≈1000 Hz) — the tell-tale Japanese u." },
  { id: "e", label: "e", jp: "え", kind: "vowel", f: [480, 1950, 2600], desc: "Mid-front. Halfway between あ and い on the chart." },
  { id: "o", label: "o", jp: "お", kind: "vowel", f: [500, 850, 2500], desc: "Lips slightly rounded, tongue back. F1 and F2 both low and close together." },
  { id: "n", label: "n", jp: "ん", kind: "nasal", f: [280, 1500, 2500], desc: "Nasal hum: strong energy below 400 Hz, weak higher bands." },
  { id: "s", label: "s", jp: "す", kind: "fricative", band: [4500, 8000], desc: "Hiss with energy high up (4.5–8 kHz)." },
  { id: "sh", label: "sh", jp: "し", kind: "fricative", band: [2200, 5000], desc: "Lower, wider hiss than s (2–5 kHz) — tongue further back." },
  { id: "h", label: "h", jp: "は", kind: "fricative", band: [600, 3500], desc: "Soft breathy noise, shaped by the following vowel." },
];

export const pitch: P["pitch"] = [
  { word: "箸", ro: "ha-shi", en: "chopsticks", pattern: [1, 0] },
  { word: "橋", ro: "ha-shi", en: "bridge", pattern: [0, 1] },
  { word: "雨", ro: "a-me", en: "rain", pattern: [1, 0] },
  { word: "飴", ro: "a-me", en: "candy", pattern: [0, 1] },
  { word: "ありがとう", ro: "a-ri-ga-to-u", en: "thank you", pattern: [0, 1, 1, 0, 0] },
  { word: "日本", ro: "ni-ho-n", en: "Japan", pattern: [0, 1, 0] },
];

export const praise: P["praise"] = [
  { jp: "すごい！", ro: "sugoi!", en: "Amazing!" }, { jp: "よくできました！", ro: "yoku dekimashita!", en: "Well done!" },
  { jp: "完璧！", ro: "kanpeki!", en: "Perfect!" }, { jp: "その調子！", ro: "sono chōshi!", en: "Keep it up!" },
  { jp: "上手ですね！", ro: "jōzu desu ne!", en: "You’re good at this!" }, { jp: "天才！", ro: "tensai!", en: "Genius!" },
  { jp: "正解！", ro: "seikai!", en: "Correct!" }, { jp: "いいね！", ro: "ii ne!", en: "Nice!" },
];

export const levels: P["levels"] = [
  { min: 1, jp: "初心者", en: "Beginner" }, { min: 3, jp: "見習い", en: "Apprentice" }, { min: 5, jp: "学生", en: "Student" },
  { min: 7, jp: "冒険者", en: "Adventurer" }, { min: 9, jp: "侍", en: "Samurai" }, { min: 11, jp: "先輩", en: "Senpai" },
  { min: 13, jp: "先生", en: "Sensei" }, { min: 15, jp: "達人", en: "Master" }, { min: 17, jp: "伝説", en: "Legend" },
];

export const sentenceBuilder: P["sentenceBuilder"] = [
  { jp: ["私は", "学生", "です"], en: "I am a student.", hi: "मैं छात्र हूँ।", ro: "watashi wa gakusei desu" },
  { jp: ["私は", "水を", "飲みます"], en: "I drink water.", hi: "मैं पानी पीता हूँ।", ro: "watashi wa mizu o nomimasu" },
  { jp: ["これは", "何", "ですか"], en: "What is this?", hi: "यह क्या है?", ro: "kore wa nan desu ka" },
  { jp: ["駅は", "どこ", "ですか"], en: "Where is the station?", hi: "स्टेशन कहाँ है?", ro: "eki wa doko desu ka" },
  { jp: ["明日", "東京に", "行きます"], en: "I will go to Tokyo tomorrow.", hi: "मैं कल टोक्यो जाऊँगा।", ro: "ashita tōkyō ni ikimasu" },
  { jp: ["図書館で", "本を", "読みます"], en: "I read books at the library.", hi: "मैं पुस्तकालय में किताबें पढ़ता हूँ।", ro: "toshokan de hon o yomimasu" },
  { jp: ["昨日", "映画を", "見ました"], en: "I watched a movie yesterday.", hi: "मैंने कल फ़िल्म देखी।", ro: "kinō eiga o mimashita" },
  { jp: ["私は", "カレーが", "好きです"], en: "I like curry.", hi: "मुझे करी पसंद है।", ro: "watashi wa karē ga suki desu" },
  { jp: ["ゆっくり", "話して", "ください"], en: "Please speak slowly.", hi: "कृपया धीरे बोलिए।", ro: "yukkuri hanashite kudasai" },
  { jp: ["インドは", "日本より", "大きいです"], en: "India is bigger than Japan.", hi: "भारत जापान से बड़ा है।", ro: "indo wa nihon yori ōkii desu" },
  { jp: ["机の上に", "本が", "あります"], en: "There is a book on the desk.", hi: "मेज़ पर किताब है।", ro: "tsukue no ue ni hon ga arimasu" },
  { jp: ["一緒に", "ご飯を", "食べませんか"], en: "Shall we eat together?", hi: "साथ में खाना खाएँ?", ro: "issho ni gohan o tabemasen ka" },
  { jp: ["電車で", "会社に", "行きます"], en: "I go to work by train.", hi: "मैं ट्रेन से दफ़्तर जाता हूँ।", ro: "densha de kaisha ni ikimasu" },
  { jp: ["日本語が", "少し", "話せます"], en: "I can speak a little Japanese.", hi: "मैं थोड़ी जापानी बोल सकता हूँ।", ro: "nihongo ga sukoshi hanasemasu" },
  { jp: ["暑いから", "窓を", "開けます"], en: "It’s hot, so I’ll open the window.", hi: "गर्मी है, इसलिए खिड़की खोलता हूँ।", ro: "atsui kara mado o akemasu" },
];

export const particleQuiz: P["particleQuiz"] = [
  { before: "私", after: "学生です。", answer: "は", options: ["は", "を", "に", "で"], en: "I am a student." },
  { before: "パン", after: "食べます。", answer: "を", options: ["を", "に", "が", "の"], en: "I eat bread." },
  { before: "学校", after: "行きます。", answer: "に", options: ["に", "を", "で", "も"], en: "I go to school." },
  { before: "家", after: "勉強します。", answer: "で", options: ["で", "に", "を", "へ"], en: "I study at home." },
  { before: "私", after: "本です。", answer: "の", options: ["の", "は", "を", "と"], en: "It’s my book." },
  { before: "友達", after: "映画を見ます。", answer: "と", options: ["と", "の", "を", "に"], en: "I watch a movie with a friend." },
  { before: "猫", after: "好きです。", answer: "が", options: ["が", "を", "に", "で"], en: "I like cats." },
  { before: "七時", after: "起きます。", answer: "に", options: ["に", "で", "を", "が"], en: "I get up at 7." },
  { before: "九時", after: "五時まで働きます。", answer: "から", options: ["から", "まで", "に", "で"], en: "I work from 9 to 5." },
  { before: "バス", after: "行きます。", answer: "で", options: ["で", "に", "を", "と"], en: "I go by bus." },
  { before: "私", after: "行きます。", answer: "も", options: ["も", "を", "の", "で"], en: "I will go too." },
  { before: "誰", after: "来ましたか。", answer: "が", options: ["が", "は", "を", "に"], en: "Who came?" },
  { before: "机の上", after: "猫がいます。", answer: "に", options: ["に", "で", "を", "の"], en: "There is a cat on the desk." },
  { before: "これ", after: "何ですか。", answer: "は", options: ["は", "を", "が", "に"], en: "What is this?" },
];

export const scriptsIntro: P["scriptsIntro"] = [
  { title: "Japanese has no single alphabet — it has three scripts", text: "**Hiragana** (ひらがな) for grammar and native words, **Katakana** (カタカナ) for foreign words, and **Kanji** (漢字) for meaning-carrying word stems. A normal sentence mixes all three: 私**は**インド**から来ました**。" },
  { title: "Kana are syllables, not letters", text: "Each kana is a whole sound (ka, shi, tsu). That makes them much closer to Hindi Devanagari (क, कि, कु) than to English letters (k + a)." },
  { title: "Learn them in this order", text: "1. Hiragana (1 week) → 2. Katakana (1 week) → 3. Kanji gradually, through words you already know. Romaji (Latin letters) is a crutch — drop it as soon as you can read kana." },
];

export const compareTable: P["compareTable"] = {
  head: ["", "English", "Hindi", "Japanese"],
  rows: [
    ["Script type", "Alphabet (letters)", "Abugida (consonant + vowel mark)", "Syllabary (kana) + logograms (kanji)"],
    ["Symbols to start", "26 letters", "~46 letters + मात्राएँ", "46 hiragana + 46 katakana"],
    ["Written order", "a, b, c, d…", "अ आ इ… क ख ग… (by mouth position)", "a i u e o, ka ki ku… (same phonetic logic as Hindi!)"],
    ["Spaces between words", "Yes", "Yes", "No — kanji/kana switches show word breaks"],
    ["Spelling = sound?", "Often not (though, through)", "Almost always", "Kana: always. Kanji: must learn readings"],
    ["Vowels", "12–20 sounds", "10–11 (with long/short)", "5 (each short or long)"],
    ["Word order", "S-V-O", "S-O-V", "S-O-V"],
    ["Prepositions", "Before nouns (in Delhi)", "After nouns (दिल्ली में)", "After nouns (デリーで)"],
    ["Gender", "he/she only", "Masculine/feminine everywhere", "None"],
    ["Plural", "book/books", "किताब/किताबें", "No plural form"],
    ["Tenses", "12 forms", "~12+ forms", "2 tenses + aspect"],
    ["Politeness", "please / sir", "तू / तुम / आप", "Casual / polite / honorific / humble"],
  ],
};

export const facts: P["facts"] = [
  "The kana chart order (a-ka-sa-ta-na) was designed by monks who studied Sanskrit — it follows the same mouth-position logic as Devanagari.",
  "Japanese and Hindi share the same verb-at-the-end order: 私は水を飲みます = मैं पानी पीता हूँ.",
  "The top 100 words plus 30 grammar items cover about 65% of everyday spoken Japanese.",
  "カレーライス (curry rice) is one of Japan’s most popular home dishes.",
  "Japanese has only 2 irregular verbs: する (do) and 来る (come).",
  "The day names follow the same planets as Hindi: 火曜日 (Mars) = मंगलवार.",
  "ありがとう is 5 beats: a-ri-ga-to-u. Give each beat equal time.",
  "Japanese has no plural, no gender and no articles — three things you never have to learn.",
];

export const greeting: P["greeting"] = (h) =>
  h < 11 ? { jp: "おはようございます", ro: "ohayō gozaimasu", en: "Good morning" }
    : h < 18 ? { jp: "こんにちは", ro: "konnichiwa", en: "Good afternoon" }
      : { jp: "こんばんは", ro: "konbanwa", en: "Good evening" };
