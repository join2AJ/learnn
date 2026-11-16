import type { CoreGrammar, LanguagePack } from "../../core/types";

type P = LanguagePack;
const yt = (q: string) => "https://www.youtube.com/results?search_query=" + encodeURIComponent(q);

export const phrases: P["phrases"] = [
  { id: "greet", title: "Greetings", icon: "hand", items: [
    { jp: "Bonjour", ro: "bɔ̃.ʒuʁ", en: "Hello / Good morning", hi: "नमस्ते" },
    { jp: "Bonsoir", ro: "bɔ̃.swaʁ", en: "Good evening", hi: "शुभ संध्या" },
    { jp: "Salut !", ro: "sa.ly", en: "Hi! / Bye! (friends)", hi: "हाय!" },
    { jp: "Au revoir", ro: "o ʁə.vwaʁ", en: "Goodbye", hi: "फिर मिलेंगे" },
    { jp: "Bonne nuit", ro: "bɔn nɥi", en: "Good night", hi: "शुभ रात्रि" },
    { jp: "À bientôt !", ro: "a bjɛ̃.to", en: "See you soon!", hi: "जल्द मिलते हैं!" },
    { jp: "Comment ça va ?", ro: "kɔ.mɑ̃ sa va", en: "How are you?", hi: "आप कैसे हैं?" },
    { jp: "Ça va bien, merci.", ro: "sa va bjɛ̃ mɛʁ.si", en: "I’m fine, thanks.", hi: "मैं ठीक हूँ, धन्यवाद।" },
  ] },
  { id: "polite", title: "Polite words", icon: "heart", items: [
    { jp: "Merci beaucoup", ro: "mɛʁ.si bo.ku", en: "Thank you very much", hi: "बहुत धन्यवाद" },
    { jp: "S’il vous plaît", ro: "sil vu plɛ", en: "Please (polite)", hi: "कृपया" },
    { jp: "De rien", ro: "də ʁjɛ̃", en: "You’re welcome", hi: "कोई बात नहीं" },
    { jp: "Excusez-moi", ro: "ɛk.sky.ze mwa", en: "Excuse me", hi: "माफ़ कीजिए" },
    { jp: "Pardon", ro: "paʁ.dɔ̃", en: "Sorry / Pardon?", hi: "माफ़ कीजिए" },
    { jp: "Je suis désolé(e)", ro: "ʒə sɥi de.zɔ.le", en: "I’m sorry", hi: "मुझे खेद है" },
    { jp: "Enchanté(e) !", ro: "ɑ̃.ʃɑ̃.te", en: "Nice to meet you!", hi: "आपसे मिलकर ख़ुशी हुई!" },
  ] },
  { id: "me", title: "About me", icon: "users", items: [
    { jp: "Je m’appelle Priya.", ro: "ʒə ma.pɛl", en: "My name is Priya.", hi: "मेरा नाम प्रिया है।" },
    { jp: "Je viens d’Inde.", ro: "ʒə vjɛ̃ dɛ̃d", en: "I’m from India.", hi: "मैं भारत से हूँ।" },
    { jp: "J’habite à Mumbai.", ro: "ʒa.bit a", en: "I live in Mumbai.", hi: "मैं मुंबई में रहता/रहती हूँ।" },
    { jp: "J’apprends le français.", ro: "ʒa.pʁɑ̃ lə fʁɑ̃.sɛ", en: "I’m learning French.", hi: "मैं फ़्रेंच सीख रहा/रही हूँ।" },
    { jp: "Je parle un peu français.", ro: "ʒə paʁl œ̃ pø fʁɑ̃.sɛ", en: "I speak a little French.", hi: "मैं थोड़ी फ़्रेंच बोलता/बोलती हूँ।" },
    { jp: "Vous parlez anglais ?", ro: "vu paʁ.le ɑ̃.ɡlɛ", en: "Do you speak English?", hi: "क्या आप अंग्रेज़ी बोलते हैं?" },
    { jp: "Je ne comprends pas.", ro: "ʒə nə kɔ̃.pʁɑ̃ pa", en: "I don’t understand.", hi: "मुझे समझ नहीं आया।" },
    { jp: "Pouvez-vous répéter, s’il vous plaît ?", ro: "pu.ve vu ʁe.pe.te", en: "Can you repeat, please?", hi: "क्या आप दोहरा सकते हैं?" },
  ] },
  { id: "food", title: "Café & restaurant", icon: "food", items: [
    { jp: "Une table pour deux, s’il vous plaît.", ro: "yn tabl puʁ dø", en: "A table for two, please.", hi: "दो लोगों के लिए एक टेबल, कृपया।" },
    { jp: "La carte, s’il vous plaît.", ro: "la kaʁt", en: "The menu, please.", hi: "मेन्यू दीजिए।" },
    { jp: "Je voudrais un café.", ro: "ʒə vu.dʁɛ œ̃ ka.fe", en: "I’d like a coffee.", hi: "मुझे एक कॉफ़ी चाहिए।" },
    { jp: "Je suis végétarien(ne).", ro: "ʒə sɥi ve.ʒe.ta.ʁjɛ̃", en: "I’m vegetarian.", hi: "मैं शाकाहारी हूँ।" },
    { jp: "C’est délicieux !", ro: "sɛ de.li.sjø", en: "It’s delicious!", hi: "यह बहुत स्वादिष्ट है!" },
    { jp: "L’addition, s’il vous plaît.", ro: "la.di.sjɔ̃", en: "The bill, please.", hi: "बिल दीजिए।" },
    { jp: "Une carafe d’eau, s’il vous plaît.", ro: "yn ka.ʁaf do", en: "A jug of tap water, please.", hi: "पानी का एक जग, कृपया।" },
  ] },
  { id: "travel", title: "Travel & directions", icon: "train", items: [
    { jp: "Où est la gare ?", ro: "u ɛ la ɡaʁ", en: "Where is the station?", hi: "स्टेशन कहाँ है?" },
    { jp: "Où sont les toilettes ?", ro: "u sɔ̃ le twa.lɛt", en: "Where are the toilets?", hi: "शौचालय कहाँ है?" },
    { jp: "C’est loin ?", ro: "sɛ lwɛ̃", en: "Is it far?", hi: "क्या यह दूर है?" },
    { jp: "À gauche / à droite / tout droit", ro: "a ɡoʃ / a dʁwat / tu dʁwa", en: "Left / right / straight on", hi: "बाएँ / दाएँ / सीधे" },
    { jp: "Un billet pour Paris, s’il vous plaît.", ro: "œ̃ bi.jɛ puʁ pa.ʁi", en: "A ticket to Paris, please.", hi: "पेरिस का एक टिकट, कृपया।" },
    { jp: "À quelle heure part le train ?", ro: "a kɛl œʁ paʁ lə tʁɛ̃", en: "What time does the train leave?", hi: "ट्रेन कितने बजे जाती है?" },
    { jp: "J’ai une réservation.", ro: "ʒe yn ʁe.zɛʁ.va.sjɔ̃", en: "I have a booking.", hi: "मेरी बुकिंग है।" },
  ] },
  { id: "shop", title: "Shopping & money", icon: "shop", items: [
    { jp: "Combien ça coûte ?", ro: "kɔ̃.bjɛ̃ sa kut", en: "How much is it?", hi: "यह कितने का है?" },
    { jp: "C’est trop cher.", ro: "sɛ tʁo ʃɛʁ", en: "It’s too expensive.", hi: "यह बहुत महँगा है।" },
    { jp: "Je regarde seulement.", ro: "ʒə ʁə.ɡaʁd sœl.mɑ̃", en: "I’m just looking.", hi: "मैं बस देख रहा/रही हूँ।" },
    { jp: "Je peux payer par carte ?", ro: "ʒə pø pe.je paʁ kaʁt", en: "Can I pay by card?", hi: "क्या मैं कार्ड से भुगतान कर सकता/सकती हूँ?" },
    { jp: "Je le prends.", ro: "ʒə lə pʁɑ̃", en: "I’ll take it.", hi: "मैं इसे लूँगा/लूँगी।" },
  ] },
  { id: "help", title: "Help & emergencies", icon: "help", items: [
    { jp: "Au secours !", ro: "o sə.kuʁ", en: "Help!", hi: "बचाओ!" },
    { jp: "Appelez un médecin !", ro: "a.ple œ̃ med.sɛ̃", en: "Call a doctor!", hi: "डॉक्टर को बुलाइए!" },
    { jp: "J’ai mal ici.", ro: "ʒe mal i.si", en: "It hurts here.", hi: "यहाँ दर्द है।" },
    { jp: "J’ai perdu mon passeport.", ro: "ʒe pɛʁ.dy mɔ̃ pas.pɔʁ", en: "I lost my passport.", hi: "मेरा पासपोर्ट खो गया है।" },
    { jp: "Je suis perdu(e).", ro: "ʒə sɥi pɛʁ.dy", en: "I’m lost.", hi: "मैं रास्ता भटक गया/गई हूँ।" },
  ] },
];

export const roadmap: P["roadmap"] = [
  { id: "p0", title: "Sounds & mindset", when: "Day 1", goal: "Hear the French vowels, the throat r and the nasal sounds.",
    tasks: [{ text: "Read ‘French alphabet & sounds’ overview", check: "scripts" }, { text: "Pronunciation: silent letters, nasal vowels, the French r", check: "pron" }, { text: "Open Sound Lab and see your own a-e-i-o-u", check: "lab" }],
    checkpoint: "You can say bonjour, merci and au revoir with the right sounds." },
  { id: "p1", title: "Alphabet, accents & sounds", when: "Days 1–7", goal: "Read any French word aloud.",
    tasks: [{ text: "Letter names: spell your name in French", check: "abc26" }, { text: "Accents: é è ê ç", check: "acc" }, { text: "20 key sounds: ou, oi, eau, an, on, in…", check: "snd" }],
    checkpoint: "Read château, croissant, beaucoup and boulangerie correctly." },
  { id: "p2", title: "First 100 words + survival phrases", when: "Weeks 2–4", goal: "Greet, introduce yourself, order food.",
    tasks: [{ text: "Learn the 30 core grammar words", check: "core30" }, { text: "Survival phrases", check: "phr" }, { text: "Know 100 words", check: "w100" }, { text: "Grammar unit 1 (articles, être, avoir)", check: "unit1" }],
    checkpoint: "Introduce yourself in 5 sentences and order a coffee." },
  { id: "p3", title: "Grammar core", when: "Months 1–3", goal: "Present tense, gender, questions, negation, past and future.",
    tasks: [{ text: "Grammar units 2–4", check: "unit4" }, { text: "Know 300 words", check: "w300" }],
    checkpoint: "Talk about your day yesterday and plans for tomorrow." },
  { id: "p4", title: "A2 / DELF A2", when: "Months 3–6", goal: "Everyday conversations about family, work, travel and shopping.",
    tasks: [{ text: "Grammar unit 5", check: "unit5" }, { text: "Know 600 words", check: "w600" }, { text: "Know 1,000 words", check: "w1000" }],
    checkpoint: "Understand slow French podcasts on everyday topics." },
  { id: "p5", title: "B1 independence", when: "Months 6–12", goal: "Follow conversations, give opinions, travel on your own.",
    tasks: [{ text: "Know 2,000 words", check: "w2000" }],
    checkpoint: "Watch Easy French street interviews and follow most of it." },
];

export const resources: P["resources"] = [
  { id: "yt", title: "YouTube · listen & understand", items: [
    { title: "Français avec Pierre", url: "https://www.youtube.com/@Francaisavecpierre", kind: "youtube", level: "Beginner → Intermediate", note: "Clear French lessons on grammar, pronunciation and daily life." },
    { title: "InnerFrench", url: "https://www.youtube.com/@innerFrench", kind: "youtube", level: "Intermediate", note: "Interesting topics in slow, clear French." },
    { title: "Easy French", url: "https://www.youtube.com/@EasyFrench", kind: "youtube", level: "All levels", note: "Street interviews with French + English subtitles." },
    { title: "French comprehensible input for beginners", url: yt("French comprehensible input complete beginner"), kind: "search", level: "Complete beginner", note: "Very slow, visual French-only stories." },
    { title: "TV5MONDE · apprendre le français", url: "https://apprendre.tv5monde.com", kind: "web", level: "A1 → B2", note: "Free exercises with real TV videos, by CEFR level." },
  ] },
  { id: "grammar", title: "Grammar & pronunciation", items: [
    { title: "French nasal vowels explained", url: yt("French nasal vowels pronunciation an on in"), kind: "search", level: "Beginner", note: "The 3 nasal sounds that make French sound French." },
    { title: "How to pronounce the French R", url: yt("how to pronounce the French R"), kind: "search", level: "Beginner", note: "The throat r - step by step." },
    { title: "French in Hindi (search)", url: yt("learn French in Hindi beginners"), kind: "search", level: "Beginner", note: "Lessons explained in Hindi." },
  ] },
  { id: "exam", title: "DELF exams", items: [
    { title: "France Éducation international · DELF", url: "https://www.france-education-international.fr/diplome/delf-tout-public", kind: "web", level: "A1 → B2", note: "Official DELF exam information and sample papers." },
    { title: "Alliance Française India", url: "https://www.afindia.org", kind: "web", level: "All", note: "Classes and DELF exam centres across India." },
  ] },
];

export const pronunciation: P["pronunciation"] = [
  { id: "silent", title: "Silent letters", text: "Most final consonants are silent: petit, grand, vous, est. The final -e is silent too: une, belle. Remember CaReFuL: c, r, f, l are often pronounced at the end (sac, bonjour, neuf, mal).",
    en: "English also has silent letters (knight), but French has many more - especially at the end of words.",
    hi: "Hindi is written as it sounds; French is not. Learn the rules: the last consonant is usually silent.",
    examples: [{ jp: "petit", ro: "pə.ti", en: "small (t silent)", hi: "छोटा" }, { jp: "vous", ro: "vu", en: "you (s silent)", hi: "आप" }, { jp: "Paris", ro: "pa.ʁi", en: "Paris (s silent)", hi: "पेरिस" }, { jp: "bonjour", ro: "bɔ̃.ʒuʁ", en: "hello (r is said!)", hi: "नमस्ते" }] },
  { id: "nasal", title: "Nasal vowels", text: "an/en, on, in/ain/ein, un: the vowel goes through the nose and the n is NOT pronounced. They change meaning: lent (slow) vs long (long) vs lin (linen).",
    en: "English has no nasal vowels - this is the sound that makes French recognisable.",
    hi: "Hindi has them! Like माँ, हँस, कहाँ (चंद्रबिंदु). French an ≈ आँ, on ≈ ओं, in ≈ ऐं.",
    examples: [{ jp: "enfant", ro: "ɑ̃.fɑ̃", en: "child", hi: "बच्चा" }, { jp: "bonbon", ro: "bɔ̃.bɔ̃", en: "sweet", hi: "टॉफ़ी" }, { jp: "pain", ro: "pɛ̃", en: "bread", hi: "रोटी" }, { jp: "un", ro: "œ̃", en: "one", hi: "एक" }] },
  { id: "r", title: "The French R", text: "Made at the back of the throat (uvular), like a soft gargle. Say ‘g’, then relax and let air rub through - that is the French r.",
    en: "Not the English r and not rolled like Spanish.",
    hi: "Close to Urdu/Hindi ग़ (ग़ज़ल, ग़लत) - softer. Never the rolled Hindi र.",
    examples: [{ jp: "rouge", ro: "ʁuʒ", en: "red", hi: "लाल" }, { jp: "Paris", ro: "pa.ʁi", en: "Paris", hi: "पेरिस" }, { jp: "merci", ro: "mɛʁ.si", en: "thank you", hi: "धन्यवाद" }] },
  { id: "u", title: "u vs ou", text: "u (tu) = say ‘ee’ with lips rounded. ou (tout) = ‘oo’. They are different words: tu (you) / tout (all), rue (street) / roue (wheel).",
    en: "English has no French u - lips round but tongue stays forward.",
    hi: "Say इ, then round your lips like for उ without moving the tongue - that is the French u.",
    examples: [{ jp: "tu", ro: "ty", en: "you", hi: "तुम" }, { jp: "tout", ro: "tu", en: "all", hi: "सब" }, { jp: "rue", ro: "ʁy", en: "street", hi: "गली" }, { jp: "roue", ro: "ʁu", en: "wheel", hi: "पहिया" }] },
  { id: "liaison", title: "Liaison - words join up", text: "A silent final consonant is pronounced when the next word starts with a vowel: les amis = lé-z-ami, vous avez = vou-z-avé. It makes French flow.",
    en: "Like ‘an apple’ vs ‘a pear’ in English, but much more common.",
    hi: "Words glide into each other - like a chant where syllables link.",
    examples: [{ jp: "les amis", ro: "le.za.mi", en: "the friends", hi: "दोस्त" }, { jp: "vous avez", ro: "vu.za.ve", en: "you have", hi: "आपके पास है" }, { jp: "un grand homme", ro: "œ̃ ɡʁɑ̃.tɔm", en: "a great man", hi: "एक महान आदमी" }] },
  { id: "stress", title: "Rhythm & stress", text: "French gives every syllable nearly equal length and puts a light stress on the LAST syllable of a phrase: ba-na-NE, res-tau-RANT.",
    en: "English stresses the first syllables (BA-na-na, RES-taurant). French is flat and lifts at the end.",
    hi: "Like reciting evenly, with the voice rising a little on the last syllable.",
    examples: [{ jp: "restaurant", ro: "ʁɛs.to.ʁɑ̃", en: "restaurant", hi: "रेस्टोरेंट" }, { jp: "chocolat", ro: "ʃɔ.kɔ.la", en: "chocolate", hi: "चॉकलेट" }] },
  { id: "elision", title: "Elision: l’, j’, d’", text: "Short words drop their vowel before another vowel or a silent h: le + ami = l’ami, je + aime = j’aime, de + eau = d’eau.",
    en: "Like English ‘don’t’ - but compulsory in French.",
    hi: "Two vowels don’t sit next to each other - one disappears, marked by an apostrophe.",
    examples: [{ jp: "l’homme", ro: "lɔm", en: "the man", hi: "आदमी" }, { jp: "j’aime", ro: "ʒɛm", en: "I love", hi: "मुझे पसंद है" }, { jp: "c’est", ro: "sɛ", en: "it is", hi: "यह है" }] },
];

export const vowels: P["vowels"] = [
  { ipa: "i", label: "i (lit)", f1: 280, f2: 2250, f3: 2900, lang: "target", example: "lit" },
  { ipa: "e", label: "é (été)", f1: 400, f2: 2050, f3: 2650, lang: "target", example: "été" },
  { ipa: "ɛ", label: "è (mère)", f1: 550, f2: 1800, f3: 2500, lang: "target", example: "mère" },
  { ipa: "a", label: "a (patte)", f1: 700, f2: 1450, f3: 2600, lang: "target", example: "patte" },
  { ipa: "ɔ", label: "o (porte)", f1: 550, f2: 950, f3: 2500, lang: "target", example: "porte" },
  { ipa: "o", label: "ô (beau)", f1: 400, f2: 800, f3: 2400, lang: "target", example: "beau" },
  { ipa: "u", label: "ou (tout)", f1: 300, f2: 750, f3: 2300, lang: "target", example: "tout" },
  { ipa: "y", label: "u (tu)", f1: 270, f2: 1850, f3: 2150, lang: "target", example: "tu" },
  { ipa: "ø", label: "eu (deux)", f1: 390, f2: 1600, f3: 2300, lang: "target", example: "deux" },
  { ipa: "œ", label: "eu (peur)", f1: 550, f2: 1500, f3: 2400, lang: "target", example: "peur" },
  { ipa: "ɑ̃", label: "an (temps)", f1: 650, f2: 1000, f3: 2600, lang: "target", example: "temps" },
  { ipa: "ɔ̃", label: "on (bon)", f1: 470, f2: 800, f3: 2500, lang: "target", example: "bon" },
  { ipa: "ɛ̃", label: "in (vin)", f1: 600, f2: 1550, f3: 2550, lang: "target", example: "vin" },
  { ipa: "iː", label: "EN beet", f1: 342, f2: 2322, f3: 3000, lang: "en" },
  { ipa: "ɛ", label: "EN bet", f1: 580, f2: 1799, f3: 2605, lang: "en" },
  { ipa: "ɑ", label: "EN father", f1: 768, f2: 1333, f3: 2522, lang: "en" },
  { ipa: "u", label: "EN boot", f1: 378, f2: 997, f3: 2343, lang: "en" },
  { ipa: "ʌ", label: "EN but", f1: 623, f2: 1200, f3: 2550, lang: "en" },
  { ipa: "aː", label: "हि आ", f1: 780, f2: 1250, f3: 2500, lang: "hi" },
  { ipa: "iː", label: "हि ई", f1: 290, f2: 2300, f3: 3000, lang: "hi" },
  { ipa: "uː", label: "हि ऊ", f1: 330, f2: 800, f3: 2300, lang: "hi" },
  { ipa: "eː", label: "हि ए", f1: 420, f2: 2050, f3: 2700, lang: "hi" },
  { ipa: "oː", label: "हि ओ", f1: 450, f2: 850, f3: 2450, lang: "hi" },
];

export const sounds: P["sounds"] = [
  { id: "i", label: "i", jp: "i", kind: "vowel", f: [280, 2250, 2900], desc: "Tongue high and front, lips spread. Very low F1, very high F2." },
  { id: "y", label: "u", jp: "tu", kind: "vowel", f: [270, 1850, 2150], desc: "Like i but lips ROUNDED - rounding pulls F2 and F3 down. The sound English and Hindi don’t have." },
  { id: "u", label: "ou", jp: "ou", kind: "vowel", f: [300, 750, 2300], desc: "Tongue back, lips rounded. F2 very low (≈750 Hz)." },
  { id: "a", label: "a", jp: "a", kind: "vowel", f: [700, 1450, 2600], desc: "Open mouth. High F1, bands close together in the middle." },
  { id: "e", label: "é", jp: "été", kind: "vowel", f: [400, 2050, 2650], desc: "Closed e - between i and è on the chart." },
  { id: "an", label: "an", jp: "an", kind: "nasal", f: [650, 1000, 2600], desc: "Nasal vowel: air through the nose adds a low hum and weakens the upper bands." },
  { id: "s", label: "s", jp: "s", kind: "fricative", band: [4500, 8000], desc: "Hiss high up (4.5–8 kHz)." },
  { id: "ch", label: "ch", jp: "ch", kind: "fricative", band: [2200, 5000], desc: "‘sh’ - lower, wider hiss than s." },
  { id: "j", label: "j", jp: "je", kind: "fricative", band: [2000, 5000], desc: "Voiced ‘zh’ - same band as ch plus a voice buzz at the bottom." },
  { id: "r", label: "r", jp: "r", kind: "fricative", band: [800, 3000], desc: "Throat r: soft noise low in the spectrum, shaped by the next vowel." },
];

export const praise: P["praise"] = [
  { jp: "Bravo !", ro: "bʁa.vo", en: "Well done!" }, { jp: "Super !", ro: "sy.pɛʁ", en: "Great!" },
  { jp: "Parfait !", ro: "paʁ.fɛ", en: "Perfect!" }, { jp: "Continue comme ça !", ro: "kɔ̃.ti.ny kɔm sa", en: "Keep it up!" },
  { jp: "Excellent !", ro: "ɛk.sɛ.lɑ̃", en: "Excellent!" }, { jp: "Génial !", ro: "ʒe.njal", en: "Brilliant!" },
  { jp: "C’est juste !", ro: "sɛ ʒyst", en: "Correct!" }, { jp: "Très bien !", ro: "tʁɛ bjɛ̃", en: "Very good!" },
];

export const levels: P["levels"] = [
  { min: 1, jp: "Débutant", en: "Beginner" }, { min: 3, jp: "Apprenti", en: "Apprentice" }, { min: 5, jp: "Élève", en: "Student" },
  { min: 7, jp: "Voyageur", en: "Traveller" }, { min: 9, jp: "Explorateur", en: "Explorer" }, { min: 11, jp: "Connaisseur", en: "Connoisseur" },
  { min: 13, jp: "Professeur", en: "Teacher" }, { min: 15, jp: "Maître", en: "Master" }, { min: 17, jp: "Légende", en: "Legend" },
];

export const sentenceBuilder: P["sentenceBuilder"] = [
  { jp: ["Je", "suis", "étudiant."], en: "I am a student.", hi: "मैं छात्र हूँ।", ro: "" },
  { jp: ["Je", "bois", "de l’eau."], en: "I drink water.", hi: "मैं पानी पीता हूँ।", ro: "" },
  { jp: ["Qu’est-ce que", "c’est", "?"], en: "What is it?", hi: "यह क्या है?", ro: "" },
  { jp: ["Où", "est", "la gare ?"], en: "Where is the station?", hi: "स्टेशन कहाँ है?", ro: "" },
  { jp: ["J’aime", "beaucoup", "le chocolat."], en: "I really like chocolate.", hi: "मुझे चॉकलेट बहुत पसंद है।", ro: "" },
  { jp: ["Nous", "allons", "au cinéma", "ce soir."], en: "We are going to the cinema tonight.", hi: "हम आज रात सिनेमा जा रहे हैं।", ro: "" },
  { jp: ["Il", "ne", "parle", "pas", "anglais."], en: "He doesn’t speak English.", hi: "वह अंग्रेज़ी नहीं बोलता।", ro: "" },
  { jp: ["Elle", "a", "deux", "frères."], en: "She has two brothers.", hi: "उसके दो भाई हैं।", ro: "" },
  { jp: ["Je", "voudrais", "un café,", "s’il vous plaît."], en: "I’d like a coffee, please.", hi: "मुझे एक कॉफ़ी चाहिए, कृपया।", ro: "" },
  { jp: ["Hier,", "j’ai", "mangé", "une pizza."], en: "Yesterday I ate a pizza.", hi: "कल मैंने पिज़्ज़ा खाया।", ro: "" },
  { jp: ["Demain,", "je", "vais", "travailler."], en: "Tomorrow I’m going to work.", hi: "कल मैं काम करने जाऊँगा।", ro: "" },
  { jp: ["Tu", "viens", "avec", "nous ?"], en: "Are you coming with us?", hi: "क्या तुम हमारे साथ आ रहे हो?", ro: "" },
];

/** Article & preposition quiz (the French equivalent of the particle quiz). */
export const particleQuiz: P["particleQuiz"] = [
  { before: "J’ai", after: "chat.", answer: "un", options: ["un", "une", "le", "des"], en: "I have a cat. (chat is masculine)" },
  { before: "C’est", after: "maison de Paul.", answer: "la", options: ["la", "le", "les", "un"], en: "It’s Paul’s house. (maison is feminine)" },
  { before: "Je bois", after: "eau.", answer: "de l’", options: ["de l’", "du", "de la", "des"], en: "I drink (some) water." },
  { before: "Il mange", after: "pain.", answer: "du", options: ["du", "de la", "des", "le"], en: "He eats (some) bread." },
  { before: "Nous allons", after: "cinéma.", answer: "au", options: ["au", "à la", "aux", "à le"], en: "We go to the cinema. (à + le = au)" },
  { before: "J’habite", after: "Inde.", answer: "en", options: ["en", "au", "à", "dans"], en: "I live in India. (feminine country → en)" },
  { before: "Elle habite", after: "Paris.", answer: "à", options: ["à", "en", "au", "dans"], en: "She lives in Paris. (city → à)" },
  { before: "Ils viennent", after: "Canada.", answer: "du", options: ["du", "de", "des", "en"], en: "They come from Canada. (de + le = du)" },
  { before: "J’aime", after: "pommes.", answer: "les", options: ["les", "des", "la", "une"], en: "I like apples. (general liking → les)" },
  { before: "Il n’a pas", after: "voiture.", answer: "de", options: ["de", "une", "la", "des"], en: "He doesn’t have a car. (after negation un/une → de)" },
  { before: "Le livre est", after: "la table.", answer: "sur", options: ["sur", "sous", "dans", "à"], en: "The book is on the table." },
  { before: "Je vais", after: "États-Unis.", answer: "aux", options: ["aux", "au", "en", "à"], en: "I’m going to the USA. (plural country → aux)" },
];

export const scriptsIntro: P["scriptsIntro"] = [
  { title: "Same letters as English - different sounds", text: "French uses the **26 letters** you know, plus **accents** (é è ê à ç…). The challenge is not the letters but how they sound: many final letters are **silent**, and letter groups make single sounds (**eau** = o, **oi** = wa)." },
  { title: "Three things make French sound French", text: "**Nasal vowels** (an, on, in) - Hindi has these too (माँ, हँसना)! The **throat r**, close to ग़. And the rounded **u** (tu), which neither English nor Hindi has." },
  { title: "Learn in this order", text: "1. Letter names and the 5 vowels (day 1) → 2. Accents (days 3–4) → 3. The 20 key sounds (days 5–7) → then words, always with audio. After one week you can read any French word aloud." },
];

export const compareTable: P["compareTable"] = {
  head: ["", "English", "Hindi", "French"],
  rows: [
    ["Script", "Latin alphabet", "Devanagari", "Latin alphabet + accents"],
    ["Spelling = sound?", "Often not", "Almost always", "Rules, but many silent letters"],
    ["Gender of nouns", "None (only he/she)", "Masculine / feminine", "Masculine / feminine (le / la) - like Hindi!"],
    ["Articles", "a / the", "None", "un, une, le, la, les, du, de la…"],
    ["Word order", "S-V-O", "S-O-V", "S-V-O (pronouns before the verb: je le vois)"],
    ["Adjectives", "Before the noun", "Before the noun", "Usually after: une voiture rouge"],
    ["Verb endings", "Few (I go, he goes)", "Change with person & gender", "Change with every person: je parle, nous parlons"],
    ["Politeness", "please / sir", "तू / तुम / आप", "tu (friends) / vous (polite) - like तुम / आप"],
    ["Nasal vowels", "No", "Yes (चंद्रबिंदु)", "Yes - an, on, in, un"],
    ["Plural", "book / books", "किताब / किताबें", "livre / livres (s is silent!)"],
  ],
};

export const facts: P["facts"] = [
  "French has masculine and feminine nouns - just like Hindi. But the gender often differs: la lune (moon) is feminine, चाँद is masculine.",
  "tu and vous work like तुम and आप: tu for friends and family, vous for strangers and politeness.",
  "About 30% of English words come from French: restaurant, menu, ballet, information.",
  "French is spoken on 5 continents by over 300 million people - it’s an official language in 29 countries.",
  "Pondicherry (Puducherry) was French until 1954 - you can still see French street names there.",
  "The final s of plurals is silent: livre and livres sound exactly the same. The article tells you the number: le livre / les livres.",
  "The top 100 words cover around half of everyday spoken French.",
  "French numbers get creative: 80 is quatre-vingts - four twenties.",
];

export const greeting: P["greeting"] = (h) =>
  h < 18 ? { jp: "Bonjour", ro: "bɔ̃.ʒuʁ", en: "Hello / good day" } : { jp: "Bonsoir", ro: "bɔ̃.swaʁ", en: "Good evening" };

/** 30 grammar words that hold every sentence together. */
const G = (n: number, w: string, ro: string, m: string, sh: string, s: string, st: string, h: string): CoreGrammar => ({ n, w, ro, m, sh, s, sr: "", st, h });
export const coreGrammar: CoreGrammar[] = [
  G(1, "le / la / les", "lə / la / le", "the", "le = masculine, la = feminine, les = plural, l’ before a vowel", "Le chat et la souris.", "The cat and the mouse.", "(निश्चित) यह/वह"),
  G(2, "un / une / des", "œ̃ / yn / de", "a, an / some", "un = masc., une = fem., des = plural ‘some’", "J’ai un frère et une sœur.", "I have a brother and a sister.", "एक / कुछ"),
  G(3, "de", "də", "of, from", "de + le = du, de + les = des", "Le livre de Marie.", "Marie’s book.", "का / की / के; से"),
  G(4, "à", "a", "to, at, in", "à + le = au, à + les = aux", "Je vais à Paris.", "I’m going to Paris.", "को / में / पर"),
  G(5, "être", "ɛtʁ", "to be", "je suis, tu es, il est, nous sommes, vous êtes, ils sont", "Je suis indien.", "I am Indian.", "होना"),
  G(6, "avoir", "a.vwaʁ", "to have", "j’ai, tu as, il a… also for age: j’ai 20 ans", "J’ai vingt ans.", "I am 20 (I have 20 years).", "के पास होना"),
  G(7, "et", "e", "and", "never pronounce the t", "Toi et moi.", "You and me.", "और"),
  G(8, "ne … pas", "nə … pa", "not", "goes around the verb: je ne sais pas", "Je ne parle pas chinois.", "I don’t speak Chinese.", "नहीं"),
  G(9, "je / tu / il / elle", "ʒə / ty / il / ɛl", "I / you / he / she", "je → j’ before a vowel", "Elle est médecin.", "She is a doctor.", "मैं / तुम / वह"),
  G(10, "nous / vous / ils / elles", "nu / vu / il / ɛl", "we / you / they", "vous = polite you or ‘you all’", "Vous êtes français ?", "Are you French?", "हम / आप / वे"),
  G(11, "on", "ɔ̃", "we / people", "spoken French uses on for ‘we’: on y va!", "On mange ensemble ?", "Shall we eat together?", "हम / लोग"),
  G(12, "ce / c’est", "sə / sɛ", "this / it is", "c’est + noun or adjective", "C’est bon !", "It’s good!", "यह है"),
  G(13, "il y a", "il i a", "there is / there are; ago", "il y a deux ans = two years ago", "Il y a un café ici.", "There is a café here.", "है / हैं; पहले"),
  G(14, "que / qu’", "kə", "that, what, than", "qu’est-ce que = what", "Qu’est-ce que tu veux ?", "What do you want?", "कि / क्या"),
  G(15, "qui", "ki", "who, which", "Qui est-ce ?", "Qui parle ?", "Who is speaking?", "कौन / जो"),
  G(16, "dans", "dɑ̃", "in, inside", "for physical inside", "Le chat est dans la boîte.", "The cat is in the box.", "में, अंदर"),
  G(17, "sur / sous", "syʁ / su", "on / under", "", "Le livre est sur la table.", "The book is on the table.", "पर / नीचे"),
  G(18, "pour", "puʁ", "for, in order to", "pour + verb = to do something", "C’est pour toi.", "It’s for you.", "के लिए"),
  G(19, "avec / sans", "a.vɛk / sɑ̃", "with / without", "", "Un café sans sucre.", "A coffee without sugar.", "के साथ / बिना"),
  G(20, "mais", "mɛ", "but", "", "C’est cher, mais c’est bon.", "It’s expensive, but it’s good.", "लेकिन"),
  G(21, "ou", "u", "or", "où (with accent) = where", "Thé ou café ?", "Tea or coffee?", "या"),
  G(22, "très / trop", "tʁɛ / tʁo", "very / too (much)", "", "Il fait très chaud.", "It’s very hot.", "बहुत / ज़्यादा"),
  G(23, "aussi", "o.si", "also, too", "", "Moi aussi !", "Me too!", "भी"),
  G(24, "mon / ma / mes", "mɔ̃ / ma / me", "my", "agrees with the THING owned, not the owner", "Ma mère et mon père.", "My mother and my father.", "मेरा / मेरी / मेरे"),
  G(25, "ton / ta / tes", "tɔ̃ / ta / te", "your (tu)", "", "C’est ton sac ?", "Is it your bag?", "तुम्हारा"),
  G(26, "son / sa / ses", "sɔ̃ / sa / se", "his / her / its", "sa voiture = his OR her car (car is feminine)", "Il aime sa voiture.", "He loves his car.", "उसका / उसकी"),
  G(27, "aller", "a.le", "to go", "aller + verb = going to (future)", "Je vais manger.", "I’m going to eat.", "जाना"),
  G(28, "faire", "fɛʁ", "to do, to make", "also weather: il fait beau", "Il fait beau aujourd’hui.", "The weather is nice today.", "करना"),
  G(29, "pouvoir / vouloir", "pu.vwaʁ / vu.lwaʁ", "can / want", "je peux / je veux; je voudrais = I would like", "Je voudrais un thé.", "I’d like a tea.", "सकना / चाहना"),
  G(30, "quand / où / comment / pourquoi", "kɑ̃ / u / kɔ.mɑ̃ / puʁ.kwa", "when / where / how / why", "the 4 key question words", "Où habites-tu ?", "Where do you live?", "कब / कहाँ / कैसे / क्यों"),
];
