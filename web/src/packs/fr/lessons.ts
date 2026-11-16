import type { Lesson } from "../../core/types";

export const lessons: Lesson[] = [
  /* ===================== UNIT 1 · FOUNDATIONS ===================== */
  {
    id: "map", unit: "1 · Foundations", title: "The map: what’s in French grammar", jp: "La grammaire", minutes: 6,
    summary: "Every part of speech on one page - and where Hindi and English help you.",
    video: "French grammar overview for beginners",
    blocks: [
      { kind: "text", text: "French grammar has **gender** (every noun is masculine or feminine - like Hindi), **articles** (le, la, un, une - like English a/the but with gender), verbs that **change for every person** (je parle, nous parlons) and the same **S-V-O order as English**." },
      { kind: "table", title: "Parts of speech", head: ["Part", "French", "Example", "Notes"], rows: [
        ["Noun", "le nom", "la maison (house)", "Masculine or feminine - learn it WITH the article"],
        ["Article", "l’article", "le, la, les, un, une, des", "Almost every noun needs one"],
        ["Pronoun", "le pronom", "je, tu, il, elle, nous, vous", "Never dropped (unlike Hindi/Japanese)"],
        ["Verb", "le verbe", "parler (to speak)", "Changes with person and tense"],
        ["Adjective", "l’adjectif", "grand / grande", "Agrees with the noun; usually AFTER it"],
        ["Adverb", "l’adverbe", "très, bien, vite", "Often ends in -ment (= -ly)"],
        ["Preposition", "la préposition", "à, de, dans, sur", "Before the noun, like English"],
      ] },
      { kind: "compare", title: "Three languages side by side", compare: {
        en: "English: I (S) drink (V) water (O). The cat - no gender.",
        hi: "हिन्दी: मैं (S) पानी (O) पीता हूँ (V)। Nouns have gender: बिल्ली (f), कुत्ता (m).",
        jp: "Français : Je (S) bois (V) de l’eau (O). English order + Hindi-style gender: le chien (m), la chatte (f).",
      } },
      { kind: "tip", text: "Always learn a noun WITH its article: not ‘maison’ but ‘la maison’. The article tells you the gender forever." },
    ],
    quiz: [
      { q: "French word order is mostly like…", options: ["Hindi (S-O-V)", "English (S-V-O)", "Japanese", "free"], answer: 1, explain: "Je bois de l’eau - subject, verb, object." },
      { q: "Every French noun has…", options: ["no gender", "a gender: masculine or feminine", "three genders", "a gender only for people"], answer: 1, explain: "Like Hindi: le livre (m), la table (f)." },
      { q: "The best way to learn a noun is…", options: ["alone", "with its article (la maison)", "only in plural", "with its English word"], answer: 1 },
    ],
  },
  {
    id: "articles", unit: "1 · Foundations", title: "Le, la, les - gender and articles", jp: "Les articles", minutes: 8,
    summary: "The / a / some - and how to tell masculine from feminine.",
    video: "French articles le la les un une des explained",
    blocks: [
      { kind: "table", title: "Articles", head: ["", "Masculine", "Feminine", "Plural"], rows: [
        ["the", "le (l’)", "la (l’)", "les"],
        ["a / an", "un", "une", "des (some)"],
        ["some (uncountable)", "du", "de la", "-"],
      ] },
      { kind: "text", text: "Before a vowel or silent h, le and la become **l’**: l’ami, l’eau, l’hôtel. Plural **les** is the same for both genders - and the final -s of the noun is silent, so the article tells you it’s plural." },
      { kind: "table", title: "Gender clues (not 100%)", head: ["Usually masculine", "Usually feminine"], rows: [
        ["-age (le fromage)", "-tion (la nation)"], ["-ment (le moment)", "-té (la liberté)"], ["-eau (le bateau)", "-ette (la baguette)"], ["-isme (le tourisme)", "-ure (la voiture)"],
      ] },
      { kind: "examples", examples: [
        { jp: "le livre, la table, les livres", ro: "", en: "the book, the table, the books", hi: "किताब, मेज़, किताबें" },
        { jp: "un ami, une amie, des amis", ro: "", en: "a (male) friend, a (female) friend, some friends", hi: "एक दोस्त, एक सहेली, कुछ दोस्त" },
        { jp: "Je bois du café et de la limonade.", ro: "", en: "I drink (some) coffee and (some) lemonade.", hi: "मैं कॉफ़ी और नींबू पानी पीता हूँ।" },
      ] },
      { kind: "compare", compare: { en: "English: a/the - no gender.", hi: "हिन्दी: no articles, but gender shows on verbs and adjectives (अच्छा लड़का / अच्छी लड़की).", jp: "Français : the article carries the gender (le garçon / la fille)." } },
    ],
    quiz: [
      { q: "‘The water’ (eau is feminine):", options: ["la eau", "l’eau", "le eau", "les eau"], answer: 1, explain: "Before a vowel, la → l’." },
      { q: "‘Some bread’ (pain is masculine):", options: ["de la pain", "du pain", "des pain", "un pain"], answer: 1 },
      { q: "Words ending in -tion are usually…", options: ["masculine", "feminine"], answer: 1, explain: "la nation, la question, l’information." },
    ],
  },
  {
    id: "etre", unit: "1 · Foundations", title: "Être - to be", jp: "Le verbe être", minutes: 7,
    summary: "I am, you are… the most important verb.",
    video: "French verb être conjugation",
    blocks: [
      { kind: "table", title: "être (present)", head: ["French", "English", "Hindi"], rows: [
        ["je suis", "I am", "मैं हूँ"], ["tu es", "you are (friend)", "तुम हो"], ["il / elle est", "he / she is", "वह है"],
        ["nous sommes", "we are", "हम हैं"], ["vous êtes", "you are (polite / plural)", "आप हैं"], ["ils / elles sont", "they are", "वे हैं"],
      ] },
      { kind: "examples", examples: [
        { jp: "Je suis indien. / Je suis indienne.", ro: "", en: "I am Indian (m / f).", hi: "मैं भारतीय हूँ।", note: "Nationalities and jobs: no article!" },
        { jp: "Elle est médecin.", ro: "", en: "She is a doctor.", hi: "वह डॉक्टर है।" },
        { jp: "C’est mon frère.", ro: "", en: "It’s / That’s my brother.", hi: "यह मेरा भाई है।" },
      ] },
      { kind: "tip", text: "c’est = it is / that is. Use it before a noun with an article: c’est un ami, c’est la gare." },
    ],
    quiz: [
      { q: "‘We are’:", options: ["nous êtes", "nous sommes", "nous sont", "nous suis"], answer: 1 },
      { q: "‘She is a teacher’:", options: ["Elle est une professeur", "Elle est professeure", "Elle es professeure", "Elle sont professeure"], answer: 1, explain: "No article after être for jobs." },
      { q: "vous êtes is used for…", options: ["one friend", "a stranger or a group", "only children", "yourself"], answer: 1 },
    ],
  },
  {
    id: "avoir", unit: "1 · Foundations", title: "Avoir - to have (and your age)", jp: "Le verbe avoir", minutes: 7,
    summary: "I have, you have… and why French people ‘have’ their age.",
    video: "French verb avoir conjugation and expressions",
    blocks: [
      { kind: "table", title: "avoir (present)", head: ["French", "English", "Hindi"], rows: [
        ["j’ai", "I have", "मेरे पास है"], ["tu as", "you have", "तुम्हारे पास है"], ["il / elle a", "he / she has", "उसके पास है"],
        ["nous avons", "we have", "हमारे पास है"], ["vous avez", "you have", "आपके पास है"], ["ils / elles ont", "they have", "उनके पास है"],
      ] },
      { kind: "table", title: "Expressions with avoir", head: ["French", "English", "Hindi"], rows: [
        ["j’ai 20 ans", "I am 20", "मैं 20 साल का/की हूँ"], ["j’ai faim", "I am hungry", "मुझे भूख लगी है"], ["j’ai soif", "I am thirsty", "मुझे प्यास लगी है"],
        ["j’ai froid / chaud", "I am cold / hot", "मुझे ठंड / गर्मी लग रही है"], ["j’ai peur", "I am afraid", "मुझे डर लग रहा है"], ["j’ai besoin de…", "I need…", "मुझे … चाहिए"],
      ] },
      { kind: "compare", compare: { en: "English: I AM hungry, I AM 20.", hi: "हिन्दी: मुझे भूख लगी है - feelings ‘happen to’ you.", jp: "Français : J’AI faim, J’AI 20 ans - you ‘have’ hunger and years." } },
    ],
    quiz: [
      { q: "‘I am 25’:", options: ["Je suis 25", "J’ai 25 ans", "Je 25 ans", "J’ai 25"], answer: 1 },
      { q: "‘They have’:", options: ["ils ont", "ils sont", "ils avez", "ils a"], answer: 0 },
      { q: "‘I am hungry’:", options: ["Je suis faim", "J’ai faim", "J’ai fin", "Je faim"], answer: 1 },
    ],
  },
  {
    id: "pronouns", unit: "1 · Foundations", title: "Tu or vous? Subject pronouns", jp: "Tu ou vous ?", minutes: 5,
    summary: "je, tu, il, elle, on, nous, vous, ils, elles - and politeness.",
    blocks: [
      { kind: "table", title: "Subject pronouns", head: ["French", "English", "Hindi"], rows: [
        ["je (j’)", "I", "मैं"], ["tu", "you (friend, child)", "तुम / तू"], ["il / elle", "he, it / she, it", "वह"], ["on", "we (spoken) / people", "हम / लोग"],
        ["nous", "we", "हम"], ["vous", "you (polite or plural)", "आप / तुम सब"], ["ils / elles", "they (m or mixed / all f)", "वे"],
      ] },
      { kind: "compare", compare: { en: "English has one ‘you’.", hi: "हिन्दी: तू / तुम / आप.", jp: "Français : tu ≈ तुम (friends), vous ≈ आप (strangers, elders, work - and any group)." } },
      { kind: "tip", text: "A group of 10 women and 1 man is ils - masculine wins in French grammar." },
    ],
    quiz: [
      { q: "Talking to a shopkeeper you use…", options: ["tu", "vous"], answer: 1 },
      { q: "In speech, ‘we’ is very often…", options: ["on", "nous only", "ils", "vous"], answer: 0, explain: "On y va ! = Let’s go!" },
      { q: "‘They’ for a group of girls:", options: ["ils", "elles", "elle", "on"], answer: 1 },
    ],
  },
  /* ===================== UNIT 2 · SENTENCES ===================== */
  {
    id: "er", unit: "2 · Sentences", title: "Regular -er verbs (parler)", jp: "Les verbes en -er", minutes: 8,
    summary: "90% of French verbs follow this one pattern.",
    video: "French regular er verbs present tense",
    blocks: [
      { kind: "pattern", title: "Pattern", text: "parler → stem parl- + ending\nje parle · tu parles · il parle · nous parlons · vous parlez · ils parlent" },
      { kind: "text", text: "Good news: je parle, tu parles, il parle and ils parlent all **sound the same** (‘parl’) - the endings -e, -es, -ent are silent. Only nous (-ons) and vous (-ez) sound different." },
      { kind: "examples", examples: [
        { jp: "Je parle hindi et anglais.", ro: "", en: "I speak Hindi and English.", hi: "मैं हिंदी और अंग्रेज़ी बोलता/बोलती हूँ।" },
        { jp: "Nous habitons à Delhi.", ro: "", en: "We live in Delhi.", hi: "हम दिल्ली में रहते हैं।" },
        { jp: "Vous aimez le cricket ?", ro: "", en: "Do you like cricket?", hi: "क्या आपको क्रिकेट पसंद है?" },
        { jp: "Ils travaillent beaucoup.", ro: "", en: "They work a lot.", hi: "वे बहुत काम करते हैं।" },
      ] },
      { kind: "tip", text: "Try the Verb conjugator: every -er verb from the 2,000 words is there with 20 forms." },
    ],
    quiz: [
      { q: "‘We speak’:", options: ["nous parlez", "nous parlons", "nous parle", "nous parlent"], answer: 1 },
      { q: "Which ending is NOT silent?", options: ["-e", "-es", "-ent", "-ez"], answer: 3 },
      { q: "‘She likes’ (aimer):", options: ["elle aime", "elle aimes", "elle aiment", "elle aimez"], answer: 0 },
    ],
  },
  {
    id: "neg", unit: "2 · Sentences", title: "Saying no: ne … pas", jp: "La négation", minutes: 6,
    summary: "Wrap the verb: je ne parle pas.",
    blocks: [
      { kind: "pattern", title: "Pattern", text: "ne + verb + pas\nJe parle → Je ne parle pas\nne → n’ before a vowel: Je n’aime pas" },
      { kind: "table", title: "Other negatives", head: ["French", "English", "Hindi"], rows: [
        ["ne … jamais", "never", "कभी नहीं"], ["ne … plus", "no longer, not any more", "अब नहीं"], ["ne … rien", "nothing", "कुछ नहीं"], ["ne … personne", "nobody", "कोई नहीं"],
      ] },
      { kind: "text", text: "In everyday speech the **ne** often disappears: ‘Je sais pas’ (I dunno). In writing, always keep it. After a negative, un/une/du/des become **de**: J’ai un chat → Je n’ai pas de chat." },
      { kind: "examples", examples: [
        { jp: "Je ne comprends pas.", ro: "", en: "I don’t understand.", hi: "मुझे समझ नहीं आया।" },
        { jp: "Il ne mange jamais de viande.", ro: "", en: "He never eats meat.", hi: "वह कभी मांस नहीं खाता।" },
      ] },
    ],
    quiz: [
      { q: "‘I don’t like’:", options: ["Je ne aime pas", "Je n’aime pas", "Je pas aime", "Je n’aime"], answer: 1 },
      { q: "‘I don’t have a car’:", options: ["Je n’ai pas une voiture", "Je n’ai pas de voiture", "Je n’ai voiture", "Je pas ai voiture"], answer: 1 },
      { q: "ne … plus means…", options: ["more", "never", "no longer", "nothing"], answer: 2 },
    ],
  },
  {
    id: "questions", unit: "2 · Sentences", title: "Asking questions", jp: "Les questions", minutes: 7,
    summary: "Three ways to ask - from casual to formal - and the question words.",
    blocks: [
      { kind: "table", title: "Three ways", head: ["Style", "Example", "English"], rows: [
        ["Rising voice (casual)", "Tu parles français ?", "You speak French?"], ["Est-ce que (neutral)", "Est-ce que tu parles français ?", "Do you speak French?"], ["Inversion (formal)", "Parlez-vous français ?", "Do you speak French?"],
      ] },
      { kind: "table", title: "Question words", head: ["French", "English", "Hindi"], rows: [
        ["qui", "who", "कौन"], ["que / qu’est-ce que", "what", "क्या"], ["où", "where", "कहाँ"], ["quand", "when", "कब"], ["comment", "how", "कैसे"], ["pourquoi", "why", "क्यों"], ["combien", "how much / many", "कितना"], ["quel / quelle", "which / what", "कौन सा"],
      ] },
      { kind: "examples", examples: [
        { jp: "Où est la gare ?", ro: "", en: "Where is the station?", hi: "स्टेशन कहाँ है?" },
        { jp: "Qu’est-ce que tu fais ?", ro: "", en: "What are you doing?", hi: "तुम क्या कर रहे हो?" },
        { jp: "Combien ça coûte ?", ro: "", en: "How much does it cost?", hi: "यह कितने का है?" },
      ] },
      { kind: "compare", compare: { en: "English needs ‘do’: Do you speak…?", hi: "हिन्दी: क्या + rising tone: क्या तुम बोलते हो?", jp: "Français : est-ce que works exactly like क्या: Est-ce que tu parles… ?" } },
    ],
    quiz: [
      { q: "est-ce que works most like Hindi…", options: ["क्या", "कौन", "कहाँ", "क्यों"], answer: 0 },
      { q: "‘Why?’", options: ["Pourquoi ?", "Comment ?", "Quand ?", "Qui ?"], answer: 0 },
      { q: "Most casual question:", options: ["Parlez-vous anglais ?", "Est-ce que vous parlez anglais ?", "Vous parlez anglais ?"], answer: 2 },
    ],
  },
  {
    id: "adjectives", unit: "2 · Sentences", title: "Adjectives: agreement and position", jp: "Les adjectifs", minutes: 7,
    summary: "petit / petite / petits / petites - and why most go after the noun.",
    blocks: [
      { kind: "table", title: "Agreement", head: ["", "Masculine", "Feminine"], rows: [["singular", "un livre vert", "une table verte"], ["plural", "des livres verts", "des tables vertes"]] },
      { kind: "text", text: "Add **-e** for feminine and **-s** for plural. Often you hear the difference only in the feminine: vert (‘ver’) / verte (‘vert’). Most adjectives go **after** the noun: une voiture rouge. A few short, common ones go **before** (BAGS: Beauty, Age, Goodness, Size): un beau jardin, une petite maison, un bon repas, un grand homme." },
      { kind: "compare", compare: { en: "English: adjective before the noun (a red car), never changes.", hi: "हिन्दी: changes with gender: अच्छा लड़का / अच्छी लड़की.", jp: "Français : changes with gender AND number, usually after the noun: une voiture rouge." } },
      { kind: "examples", examples: [
        { jp: "un garçon intelligent / une fille intelligente", ro: "", en: "a clever boy / a clever girl", hi: "एक होशियार लड़का / एक होशियार लड़की" },
        { jp: "une petite maison blanche", ro: "", en: "a small white house", hi: "एक छोटा सफ़ेद घर" },
      ] },
    ],
    quiz: [
      { q: "‘A green table’ (table is f.):", options: ["une verte table", "une table vert", "une table verte", "un table vert"], answer: 2 },
      { q: "Which goes BEFORE the noun?", options: ["rouge", "petit", "intelligent", "français"], answer: 1 },
      { q: "Plural of ‘grand’ (masc.):", options: ["grande", "grands", "grandes", "grand"], answer: 1 },
    ],
  },
  {
    id: "possessive", unit: "2 · Sentences", title: "My, your, his: possessives", jp: "Les possessifs", minutes: 6,
    summary: "mon, ma, mes… agree with the thing owned.",
    blocks: [
      { kind: "table", title: "Possessives", head: ["", "masc.", "fem.", "plural"], rows: [
        ["my", "mon", "ma", "mes"], ["your (tu)", "ton", "ta", "tes"], ["his / her", "son", "sa", "ses"], ["our", "notre", "notre", "nos"], ["your (vous)", "votre", "votre", "vos"], ["their", "leur", "leur", "leurs"],
      ] },
      { kind: "text", text: "**Agree with the thing**, not the owner: sa voiture = his car OR her car (voiture is feminine). Before a vowel use mon/ton/son even for feminine: mon amie." },
      { kind: "compare", compare: { en: "English: his vs her depends on the owner.", hi: "हिन्दी: उसका / उसकी agrees with the THING - like French! उसकी गाड़ी = his/her car.", jp: "Français : sa voiture = उसकी गाड़ी. Same logic as Hindi!" } },
    ],
    quiz: [
      { q: "‘My mother’:", options: ["mon mère", "ma mère", "mes mère", "me mère"], answer: 1 },
      { q: "‘Her brother’:", options: ["sa frère", "son frère", "ses frère", "leur frère"], answer: 1, explain: "frère is masculine → son." },
      { q: "‘My friend’ (female, amie):", options: ["ma amie", "mon amie", "mes amie"], answer: 1, explain: "Before a vowel, mon." },
    ],
  },
  /* ===================== UNIT 3 · VERBS & TIME ===================== */
  {
    id: "irregular", unit: "3 · Verbs & time", title: "Key irregular verbs: aller, faire, venir, prendre", jp: "Les verbes irréguliers", minutes: 8,
    summary: "The verbs you use every minute.",
    blocks: [
      { kind: "table", title: "Present tense", head: ["", "aller (go)", "faire (do)", "venir (come)", "prendre (take)"], rows: [
        ["je", "vais", "fais", "viens", "prends"], ["tu", "vas", "fais", "viens", "prends"], ["il/elle", "va", "fait", "vient", "prend"],
        ["nous", "allons", "faisons", "venons", "prenons"], ["vous", "allez", "faites", "venez", "prenez"], ["ils/elles", "vont", "font", "viennent", "prennent"],
      ] },
      { kind: "examples", examples: [
        { jp: "Je vais au marché.", ro: "", en: "I’m going to the market.", hi: "मैं बाज़ार जा रहा/रही हूँ।" },
        { jp: "Il fait beau.", ro: "", en: "The weather is nice.", hi: "मौसम अच्छा है।" },
        { jp: "Je viens d’Inde.", ro: "", en: "I come from India.", hi: "मैं भारत से हूँ।" },
        { jp: "Je prends le train.", ro: "", en: "I take the train.", hi: "मैं ट्रेन लेता/लेती हूँ।" },
      ] },
    ],
    quiz: [
      { q: "‘They go’:", options: ["ils allent", "ils vont", "ils vais", "ils allez"], answer: 1 },
      { q: "‘You (vous) do’:", options: ["vous faisez", "vous faites", "vous fait", "vous font"], answer: 1 },
      { q: "‘Il fait beau’ is about…", options: ["food", "weather", "work", "beauty"], answer: 1 },
    ],
  },
  {
    id: "futurproche", unit: "3 · Verbs & time", title: "Near future: je vais + verb", jp: "Le futur proche", minutes: 5,
    summary: "The easiest way to talk about the future.",
    blocks: [
      { kind: "pattern", title: "Pattern", text: "aller (present) + infinitive\nJe vais manger. = I am going to eat.\nNous allons voyager. = We are going to travel." },
      { kind: "examples", examples: [
        { jp: "Demain, je vais travailler.", ro: "", en: "Tomorrow I’m going to work.", hi: "कल मैं काम करूँगा/करूँगी।" },
        { jp: "Qu’est-ce que tu vas faire ce soir ?", ro: "", en: "What are you going to do tonight?", hi: "तुम आज शाम क्या करोगे?" },
        { jp: "Il ne va pas venir.", ro: "", en: "He isn’t going to come.", hi: "वह नहीं आएगा।" },
      ] },
      { kind: "compare", compare: { en: "English: I’m going to + verb - the same idea!", hi: "हिन्दी: मैं खाने वाला हूँ - very close.", jp: "Français : Je vais manger." } },
    ],
    quiz: [
      { q: "‘We are going to eat’:", options: ["Nous allons mangeons", "Nous allons manger", "Nous mangerons aller", "Nous va manger"], answer: 1 },
      { q: "Negative ‘I’m not going to come’:", options: ["Je ne vais pas venir", "Je vais ne pas venir", "Je ne vais venir pas"], answer: 0 },
      { q: "The second verb is in the…", options: ["present", "infinitive", "past"], answer: 1 },
    ],
  },
  {
    id: "passecompose", unit: "3 · Verbs & time", title: "Past: the passé composé", jp: "Le passé composé", minutes: 9,
    summary: "I ate, I went: avoir/être + past participle.",
    video: "French passé composé avoir être explained",
    blocks: [
      { kind: "pattern", title: "Pattern", text: "avoir (present) + past participle\nJ’ai mangé. Tu as fini. Il a vendu.\n-er → -é · -ir → -i · -re → -u" },
      { kind: "text", text: "About 17 verbs of **movement/change** use **être** instead: aller, venir, arriver, partir, entrer, sortir, monter, descendre, naître, mourir, rester, tomber, retourner, (re)devenir… Then the participle agrees like an adjective: elle est allée, ils sont partis." },
      { kind: "examples", examples: [
        { jp: "Hier, j’ai regardé un film.", ro: "", en: "Yesterday I watched a film.", hi: "कल मैंने एक फ़िल्म देखी।" },
        { jp: "Elle est allée à Paris.", ro: "", en: "She went to Paris.", hi: "वह पेरिस गई।" },
        { jp: "Nous avons pris le bus.", ro: "", en: "We took the bus.", hi: "हमने बस ली।" },
      ] },
      { kind: "compare", compare: { en: "English: I have eaten / I ate.", hi: "हिन्दी: मैंने खाया (ने + past) / मैं गया (no ने for going!).", jp: "Français : j’ai mangé (avoir) / je suis allé (être) - a similar split to Hindi ने!" } },
    ],
    quiz: [
      { q: "‘I finished’:", options: ["J’ai fini", "Je suis fini", "J’ai finir", "J’ai finé"], answer: 0 },
      { q: "‘She arrived’:", options: ["Elle a arrivé", "Elle est arrivée", "Elle est arrivé", "Elle arrive"], answer: 1 },
      { q: "Past participle of prendre:", options: ["prendu", "prenu", "pris", "prit"], answer: 2 },
    ],
  },
  {
    id: "imparfait", unit: "3 · Verbs & time", title: "Past: imparfait (was doing, used to)", jp: "L’imparfait", minutes: 7,
    summary: "Background, habits and descriptions in the past.",
    blocks: [
      { kind: "pattern", title: "Pattern", text: "nous-form stem + -ais, -ais, -ait, -ions, -iez, -aient\nnous parlons → je parlais · nous finissons → je finissais\nOnly exception: être → j’étais" },
      { kind: "table", title: "Imparfait or passé composé?", head: ["Imparfait", "Passé composé"], rows: [["background / description: Il faisait beau.", "event / action: Il a commencé à pleuvoir."], ["habit: Je jouais au cricket.", "one-time: J’ai joué hier."], ["was doing: Je dormais…", "…when the phone rang: …quand le téléphone a sonné."]] },
      { kind: "compare", compare: { en: "English: I was sleeping / I used to play.", hi: "हिन्दी: मैं सो रहा था / मैं खेलता था.", jp: "Français : je dormais / je jouais - one tense covers both!" } },
    ],
    quiz: [
      { q: "‘I was’ (être):", options: ["je suis", "j’étais", "j’ai été", "je serais"], answer: 1 },
      { q: "Habit in the past uses…", options: ["imparfait", "passé composé", "futur"], answer: 0 },
      { q: "‘We used to eat’:", options: ["nous mangions", "nous mangeons", "nous avons mangé", "nous mangerons"], answer: 0 },
    ],
  },
  {
    id: "futur", unit: "3 · Verbs & time", title: "Future simple: I will", jp: "Le futur simple", minutes: 6,
    summary: "infinitive + -ai, -as, -a, -ons, -ez, -ont.",
    blocks: [
      { kind: "pattern", title: "Pattern", text: "parler → je parlerai, tu parleras, il parlera, nous parlerons, vous parlerez, ils parleront\nIrregular stems: être → ser-, avoir → aur-, aller → ir-, faire → fer-, venir → viendr-, pouvoir → pourr-" },
      { kind: "examples", examples: [
        { jp: "Je serai médecin.", ro: "", en: "I will be a doctor.", hi: "मैं डॉक्टर बनूँगा/बनूँगी।" },
        { jp: "Nous irons en France l’année prochaine.", ro: "", en: "We will go to France next year.", hi: "हम अगले साल फ़्रांस जाएँगे।" },
      ] },
      { kind: "tip", text: "In conversation, je vais + verb (futur proche) is more common. Use the futur simple for plans further away, promises and formal writing." },
    ],
    quiz: [
      { q: "‘I will have’:", options: ["j’avrai", "j’aurai", "j’aurais", "j’avoirai"], answer: 1 },
      { q: "‘They will go’:", options: ["ils iront", "ils allront", "ils vont", "ils iraient"], answer: 0 },
      { q: "Future endings look like…", options: ["être", "avoir in the present", "aller"], answer: 1, explain: "-ai, -as, -a, -ons, -ez, -ont." },
    ],
  },
  /* ===================== UNIT 4 · EVERYDAY TOOLS ===================== */
  {
    id: "numbers", unit: "4 · Everyday tools", title: "Numbers, time and dates", jp: "Les nombres", minutes: 8,
    summary: "0–100, telling the time, days and months.",
    blocks: [
      { kind: "table", title: "Numbers", head: ["", "", "", ""], rows: [
        ["1 un", "2 deux", "3 trois", "4 quatre"], ["5 cinq", "6 six", "7 sept", "8 huit"], ["9 neuf", "10 dix", "11 onze", "12 douze"], ["20 vingt", "30 trente", "50 cinquante", "60 soixante"],
        ["70 soixante-dix (60+10)", "80 quatre-vingts (4×20)", "90 quatre-vingt-dix", "100 cent"],
      ] },
      { kind: "text", text: "Time: **Il est trois heures** (it’s 3 o’clock), **et demie** (half past), **et quart** (quarter past), **moins le quart** (quarter to). Days and months are not capitalised: lundi, mardi… janvier, février…" },
      { kind: "examples", examples: [
        { jp: "Quelle heure est-il ? Il est huit heures et demie.", ro: "", en: "What time is it? It’s half past eight.", hi: "कितने बजे हैं? साढ़े आठ बजे हैं।" },
        { jp: "Mon anniversaire est le 15 août.", ro: "", en: "My birthday is on 15 August.", hi: "मेरा जन्मदिन 15 अगस्त को है।" },
      ] },
      { kind: "compare", compare: { en: "English: eighty = 8 tens.", hi: "हिन्दी: अस्सी - its own word.", jp: "Français : quatre-vingts = four twenties! 99 = quatre-vingt-dix-neuf (4×20+10+9)." } },
    ],
    quiz: [
      { q: "80 in French:", options: ["huitante", "quatre-vingts", "octante", "soixante-vingt"], answer: 1 },
      { q: "‘It’s half past 2’:", options: ["Il est deux heures et demie", "Il est demi deux", "Il est deux et quart"], answer: 0 },
      { q: "Days of the week are…", options: ["capitalised", "not capitalised"], answer: 1 },
    ],
  },
  {
    id: "prepositions", unit: "4 · Everyday tools", title: "à, de, en, dans - places and countries", jp: "Les prépositions", minutes: 7,
    summary: "au cinéma, en France, à Paris, du Canada.",
    blocks: [
      { kind: "table", title: "Contractions", head: ["", "Rule", "Example"], rows: [["à + le", "au", "au cinéma"], ["à + les", "aux", "aux États-Unis"], ["de + le", "du", "du Canada"], ["de + les", "des", "des États-Unis"]] },
      { kind: "table", title: "Going to / living in", head: ["Place", "Use", "Example"], rows: [["city", "à", "à Paris, à Delhi"], ["feminine country (-e)", "en", "en France, en Inde"], ["masculine country", "au", "au Japon, au Canada"], ["plural country", "aux", "aux États-Unis"]] },
      { kind: "examples", examples: [
        { jp: "J’habite en Inde, à Bangalore.", ro: "", en: "I live in India, in Bangalore.", hi: "मैं भारत में, बैंगलोर में रहता/रहती हूँ।" },
        { jp: "Le livre est dans le sac.", ro: "", en: "The book is in the bag.", hi: "किताब बैग में है।" },
      ] },
    ],
    quiz: [
      { q: "‘to the cinema’:", options: ["à le cinéma", "au cinéma", "en cinéma"], answer: 1 },
      { q: "‘in Japan’ (le Japon):", options: ["en Japon", "au Japon", "à Japon"], answer: 1 },
      { q: "‘in India’ (l’Inde, f.):", options: ["au Inde", "en Inde", "à Inde"], answer: 1 },
    ],
  },
  {
    id: "reflexive", unit: "4 · Everyday tools", title: "Daily routine: reflexive verbs", jp: "Les verbes pronominaux", minutes: 7,
    summary: "je me lève, je m’appelle - actions you do to yourself.",
    blocks: [
      { kind: "pattern", title: "Pattern", text: "je me lève · tu te lèves · il se lève · nous nous levons · vous vous levez · ils se lèvent\nPast with être: je me suis levé(e)" },
      { kind: "examples", examples: [
        { jp: "Je m’appelle Arjun.", ro: "", en: "My name is Arjun (I call myself Arjun).", hi: "मेरा नाम अर्जुन है।" },
        { jp: "Je me réveille à 7 heures.", ro: "", en: "I wake up at 7.", hi: "मैं 7 बजे उठता/उठती हूँ।" },
        { jp: "On se voit demain !", ro: "", en: "See you tomorrow!", hi: "कल मिलते हैं!" },
      ] },
      { kind: "compare", compare: { en: "English: I wash myself (rare).", hi: "हिन्दी: ख़ुद को / अपने आप.", jp: "Français : very common - se laver, se lever, s’habiller, se souvenir." } },
    ],
    quiz: [
      { q: "‘We get up’ (se lever):", options: ["nous se levons", "nous nous levons", "nous levons-nous"], answer: 1 },
      { q: "Reflexive verbs in the past use…", options: ["avoir", "être"], answer: 1 },
      { q: "‘My name is…’", options: ["Mon nom est…", "Je m’appelle…", "Both are correct"], answer: 2, explain: "Je m’appelle is the everyday way." },
    ],
  },
  /* ===================== UNIT 5 · NEXT LEVEL ===================== */
  {
    id: "pronounsobj", unit: "5 · Next level", title: "Object pronouns: le, la, lui, y, en", jp: "Les pronoms compléments", minutes: 9,
    summary: "Je le vois - pronouns go BEFORE the verb.",
    blocks: [
      { kind: "table", title: "Object pronouns", head: ["", "French", "Example"], rows: [
        ["it / him / her", "le, la, les", "Je le vois. (I see it/him)"], ["to him / to her", "lui, leur", "Je lui parle. (I speak to him/her)"], ["there", "y", "J’y vais. (I’m going there)"], ["some / of it", "en", "J’en veux. (I want some)"],
      ] },
      { kind: "compare", compare: { en: "English: I see HIM - after the verb.", hi: "हिन्दी: मैं उसे देखता हूँ - before the verb!", jp: "Français : Je LE vois - before the verb, like Hindi." } },
    ],
    quiz: [
      { q: "‘I know him’:", options: ["Je connais le", "Je le connais", "Le je connais"], answer: 1 },
      { q: "‘We’re going there’:", options: ["Nous allons y", "Nous y allons", "Y nous allons"], answer: 1 },
      { q: "‘Do you want some?’", options: ["Tu en veux ?", "Tu veux en ?", "Tu le veux ?"], answer: 0 },
    ],
  },
  {
    id: "conditional", unit: "5 · Next level", title: "Politeness: je voudrais (conditional)", jp: "Le conditionnel", minutes: 6,
    summary: "I would like, could you… - the polite form.",
    blocks: [
      { kind: "pattern", title: "Pattern", text: "future stem + imparfait endings\nvouloir → je voudrais · pouvoir → pourriez-vous · aimer → j’aimerais" },
      { kind: "examples", examples: [
        { jp: "Je voudrais un thé, s’il vous plaît.", ro: "", en: "I would like a tea, please.", hi: "मुझे एक चाय चाहिए, कृपया।" },
        { jp: "Pourriez-vous m’aider ?", ro: "", en: "Could you help me?", hi: "क्या आप मेरी मदद कर सकते हैं?" },
        { jp: "Si j’avais le temps, je voyagerais.", ro: "", en: "If I had time, I would travel.", hi: "अगर मेरे पास समय होता, तो मैं यात्रा करता।" },
      ] },
      { kind: "tip", text: "‘Je veux’ (I want) can sound rude in a shop. ‘Je voudrais’ is the polite standard - like ‘मुझे चाहिए’ said softly." },
    ],
    quiz: [
      { q: "Polite way to order:", options: ["Je veux un café", "Je voudrais un café", "Je vais un café"], answer: 1 },
      { q: "‘Could you…?’ (polite):", options: ["Pouvez-vous… / Pourriez-vous… ?", "Tu peux… ?", "Vous voulez… ?"], answer: 0 },
      { q: "Conditional endings are the same as…", options: ["futur", "imparfait", "présent"], answer: 1 },
    ],
  },
  {
    id: "comparisons", unit: "5 · Next level", title: "More, less, the best: comparisons", jp: "Les comparaisons", minutes: 6,
    summary: "plus … que, moins … que, aussi … que, le meilleur.",
    blocks: [
      { kind: "table", title: "Comparing", head: ["French", "English", "Hindi"], rows: [
        ["plus grand que", "bigger than", "से बड़ा"], ["moins cher que", "less expensive than", "से सस्ता"], ["aussi rapide que", "as fast as", "जितना तेज़"], ["le plus beau", "the most beautiful", "सबसे सुंदर"], ["meilleur / le meilleur", "better / the best", "बेहतर / सबसे अच्छा"],
      ] },
      { kind: "examples", examples: [
        { jp: "Delhi est plus grande que Paris.", ro: "", en: "Delhi is bigger than Paris.", hi: "दिल्ली पेरिस से बड़ी है।" },
        { jp: "C’est le meilleur restaurant de la ville.", ro: "", en: "It’s the best restaurant in town.", hi: "यह शहर का सबसे अच्छा रेस्टोरेंट है।" },
      ] },
    ],
    quiz: [
      { q: "‘better’ (bon):", options: ["plus bon", "meilleur", "mieux bon"], answer: 1 },
      { q: "‘as tall as’:", options: ["aussi grand que", "plus grand que", "si grand comme"], answer: 0 },
      { q: "‘the cheapest’:", options: ["le moins cher", "le plus cher", "moins cher"], answer: 0 },
    ],
  },
];
