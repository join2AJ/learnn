/** Japan map content: 8 regions, 47 prefectures, key cities. Map outlines: Global Map Japan (GSI). */

export interface Region { id: string; name: string; ja: string; ro: string; color: string; about: string; hi: string }
export interface Pref { id: number; en: string; ja: string; kana: string; ro: string; region: string; capital: string; famous: string; hi: string }
export interface City { name: string; ja: string; ro: string; lon: number; lat: number; pop: string; about: string; tip: string; phrase?: [string, string, string] }

export const REGIONS: Region[] = [
  { id: "hokkaido", name: "Hokkaido", ja: "北海道", ro: "Hokkaidō", color: "#5aa1d6", about: "The wild north: snowy winters, ski resorts, dairy farms, seafood and the Sapporo Snow Festival.", hi: "बर्फ़ीला उत्तर - स्कीइंग, डेयरी और समुद्री भोजन।" },
  { id: "tohoku", name: "Tohoku", ja: "東北", ro: "Tōhoku", color: "#6cc4a0", about: "Mountains, hot springs, apples, rice and quiet countryside festivals.", hi: "पहाड़, गर्म झरने, सेब और चावल।" },
  { id: "kanto", name: "Kanto", ja: "関東", ro: "Kantō", color: "#e0452b", about: "Greater Tokyo - the capital region where about a third of Japan lives.", hi: "टोक्यो क्षेत्र - देश की लगभग एक-तिहाई आबादी यहीं रहती है।" },
  { id: "chubu", name: "Chubu", ja: "中部", ro: "Chūbu", color: "#e8a33c", about: "The Japanese Alps, Mt Fuji, Nagoya’s car industry and the snowy Sea of Japan coast.", hi: "जापानी आल्प्स, फ़ूजी पर्वत और कार उद्योग।" },
  { id: "kansai", name: "Kansai", ja: "関西", ro: "Kansai", color: "#9a67d1", about: "Historic heart of Japan: Kyoto, Nara, Osaka and Kobe. Famous for its own dialect (Kansai-ben) and food.", hi: "ऐतिहासिक दिल - क्योटो, नारा, ओसाका। अपनी बोली (कंसाई-बेन) के लिए मशहूर।" },
  { id: "chugoku", name: "Chugoku", ja: "中国", ro: "Chūgoku", color: "#4a6fc2", about: "Hiroshima, Miyajima’s floating torii, sand dunes and the Seto Inland Sea.", hi: "हिरोशिमा, मियाजिमा और सेतो अंतर्देशीय सागर।" },
  { id: "shikoku", name: "Shikoku", ja: "四国", ro: "Shikoku", color: "#e47aa0", about: "The smallest main island: the 88-temple pilgrimage, udon and whirlpools.", hi: "सबसे छोटा मुख्य द्वीप - 88 मंदिरों की तीर्थयात्रा।" },
  { id: "kyushu", name: "Kyushu & Okinawa", ja: "九州・沖縄", ro: "Kyūshū / Okinawa", color: "#3f8a4f", about: "Volcanoes, hot springs, ramen, and the subtropical islands of Okinawa.", hi: "ज्वालामुखी, गर्म झरने और उष्णकटिबंधीय ओकिनावा।" },
];

const R = (id: number) => (id === 1 ? "hokkaido" : id <= 7 ? "tohoku" : id <= 14 ? "kanto" : id <= 23 ? "chubu" : id <= 30 ? "kansai" : id <= 35 ? "chugoku" : id <= 39 ? "shikoku" : "kyushu");

const P: [number, string, string, string, string, string, string, string][] = [
  [1, "Hokkaido", "北海道", "ほっかいどう", "Hokkaidō", "Sapporo", "Snow festival, skiing, milk, crab and ramen", "बर्फ़ उत्सव, स्कीइंग, दूध और केकड़ा"],
  [2, "Aomori", "青森県", "あおもりけん", "Aomori", "Aomori", "Apples and the giant Nebuta lantern festival", "सेब और नेबुता लालटेन उत्सव"],
  [3, "Iwate", "岩手県", "いわてけん", "Iwate", "Morioka", "Wanko soba (endless noodle bowls) and Hiraizumi temples", "वानको सोबा नूडल्स और हिराइज़ुमी मंदिर"],
  [4, "Miyagi", "宮城県", "みやぎけん", "Miyagi", "Sendai", "Matsushima bay and grilled beef tongue (gyūtan)", "मात्सुशिमा खाड़ी और ग्यूतान"],
  [5, "Akita", "秋田県", "あきたけん", "Akita", "Akita", "Akita dogs, rice and Kanto pole-lantern festival", "आकिता कुत्ते और चावल"],
  [6, "Yamagata", "山形県", "やまがたけん", "Yamagata", "Yamagata", "Cherries, Zao snow monsters and Yamadera temple", "चेरी फल और यामादेरा मंदिर"],
  [7, "Fukushima", "福島県", "ふくしまけん", "Fukushima", "Fukushima", "Peaches, sake and the samurai town of Aizu", "आड़ू, साके और आइज़ू"],
  [8, "Ibaraki", "茨城県", "いばらきけん", "Ibaraki", "Mito", "Natto (fermented soybeans) and Hitachi flower park", "नात्तो और हिताची फूल पार्क"],
  [9, "Tochigi", "栃木県", "とちぎけん", "Tochigi", "Utsunomiya", "Nikko shrines, strawberries and gyoza", "निक्को मंदिर, स्ट्रॉबेरी और ग्योज़ा"],
  [10, "Gunma", "群馬県", "ぐんまけん", "Gunma", "Maebashi", "Kusatsu hot springs and daruma dolls", "कुसात्सु गर्म झरने और दारुमा गुड़िया"],
  [11, "Saitama", "埼玉県", "さいたまけん", "Saitama", "Saitama", "Kawagoe’s old ‘Little Edo’ streets; Tokyo commuter towns", "कावागोए की पुरानी गलियाँ"],
  [12, "Chiba", "千葉県", "ちばけん", "Chiba", "Chiba", "Narita airport and Tokyo Disney Resort", "नारिता हवाई अड्डा और टोक्यो डिज़्नी"],
  [13, "Tokyo", "東京都", "とうきょうと", "Tōkyō", "Tokyo (Shinjuku)", "The capital: Shibuya crossing, Asakusa, Skytree, food everywhere", "राजधानी - शिबुया, असाकुसा, स्काईट्री"],
  [14, "Kanagawa", "神奈川県", "かながわけん", "Kanagawa", "Yokohama", "Yokohama Chinatown, Kamakura’s Great Buddha, Hakone", "योकोहामा, कामाकुरा के बुद्ध, हाकोने"],
  [15, "Niigata", "新潟県", "にいがたけん", "Niigata", "Niigata", "The best rice and sake; deep snow", "सबसे अच्छा चावल और साके"],
  [16, "Toyama", "富山県", "とやまけん", "Toyama", "Toyama", "Snow walls of the Tateyama Alpine Route; seafood", "ताटेयामा की बर्फ़ की दीवारें"],
  [17, "Ishikawa", "石川県", "いしかわけん", "Ishikawa", "Kanazawa", "Kenrokuen garden and gold leaf in Kanazawa", "केनरोकुएन बग़ीचा और सोने की पत्ती"],
  [18, "Fukui", "福井県", "ふくいけん", "Fukui", "Fukui", "Dinosaur fossils and Eiheiji Zen temple", "डायनासोर जीवाश्म और ज़ेन मंदिर"],
  [19, "Yamanashi", "山梨県", "やまなしけん", "Yamanashi", "Kofu", "Mt Fuji’s Five Lakes, grapes and wine", "फ़ूजी की पाँच झीलें और अंगूर"],
  [20, "Nagano", "長野県", "ながのけん", "Nagano", "Nagano", "Snow monkeys in hot springs, Zenkoji, 1998 Winter Olympics", "गर्म झरनों में बंदर, ज़ेनकोजी"],
  [21, "Gifu", "岐阜県", "ぎふけん", "Gifu", "Gifu", "Shirakawa-go thatched villages and Takayama old town", "शिराकावा-गो के फूस के घर"],
  [22, "Shizuoka", "静岡県", "しずおかけん", "Shizuoka", "Shizuoka", "Green tea fields with views of Mt Fuji", "हरी चाय के खेत और फ़ूजी का दृश्य"],
  [23, "Aichi", "愛知県", "あいちけん", "Aichi", "Nagoya", "Toyota, Nagoya castle and miso katsu", "टोयोटा, नागोया क़िला"],
  [24, "Mie", "三重県", "みえけん", "Mie", "Tsu", "Ise Grand Shrine, pearls and ninja of Iga", "इसे महामंदिर, मोती और इगा के निंजा"],
  [25, "Shiga", "滋賀県", "しがけん", "Shiga", "Otsu", "Lake Biwa - Japan’s largest lake", "बिवा झील - जापान की सबसे बड़ी झील"],
  [26, "Kyoto", "京都府", "きょうとふ", "Kyōto", "Kyoto", "Old capital: 1,600 temples, geisha, Fushimi Inari gates", "पुरानी राजधानी - मंदिर, गेइशा, फ़ुशिमी इनारी"],
  [27, "Osaka", "大阪府", "おおさかふ", "Ōsaka", "Osaka", "‘Japan’s kitchen’: takoyaki, okonomiyaki, comedy and Dotonbori", "‘जापान की रसोई’ - ताकोयाकी, दोतोनबोरी"],
  [28, "Hyogo", "兵庫県", "ひょうごけん", "Hyōgo", "Kobe", "Kobe beef and white Himeji castle", "कोबे बीफ़ और हिमेजी क़िला"],
  [29, "Nara", "奈良県", "ならけん", "Nara", "Nara", "Bowing deer and the giant Buddha of Todaiji", "झुकने वाले हिरण और तोदाइजी के बड़े बुद्ध"],
  [30, "Wakayama", "和歌山県", "わかやまけん", "Wakayama", "Wakayama", "Koyasan monasteries, Kumano pilgrim trails, oranges", "कोयासान मठ और कुमानो तीर्थ मार्ग"],
  [31, "Tottori", "鳥取県", "とっとりけん", "Tottori", "Tottori", "Sand dunes and pears; Japan’s smallest population", "रेत के टीले और नाशपाती"],
  [32, "Shimane", "島根県", "しまねけん", "Shimane", "Matsue", "Izumo Grand Shrine, where gods gather each autumn", "इज़ुमो महामंदिर"],
  [33, "Okayama", "岡山県", "おかやまけん", "Okayama", "Okayama", "Korakuen garden, white peaches and the Momotaro legend", "कोराकुएन बग़ीचा और मोमोतारो कथा"],
  [34, "Hiroshima", "広島県", "ひろしまけん", "Hiroshima", "Hiroshima", "Peace Memorial, Miyajima’s floating torii, okonomiyaki", "शांति स्मारक और मियाजिमा का तैरता तोरी"],
  [35, "Yamaguchi", "山口県", "やまぐちけん", "Yamaguchi", "Yamaguchi", "Kintaikyo wooden bridge and fugu (pufferfish)", "किंताइक्यो पुल और फ़ुगु मछली"],
  [36, "Tokushima", "徳島県", "とくしまけん", "Tokushima", "Tokushima", "Awa Odori dance festival and Naruto whirlpools", "आवा ओदोरी नृत्य और नारुतो भँवर"],
  [37, "Kagawa", "香川県", "かがわけん", "Kagawa", "Takamatsu", "Sanuki udon - ‘udon prefecture’ - and art islands", "सानुकी उडोन नूडल्स"],
  [38, "Ehime", "愛媛県", "えひめけん", "Ehime", "Matsuyama", "Dogo Onsen (one of the oldest hot springs) and mikan oranges", "दोगो ओनसेन और मिकान संतरे"],
  [39, "Kochi", "高知県", "こうちけん", "Kōchi", "Kochi", "Seared bonito (katsuo) and the clear Shimanto river", "कात्सुओ मछली और शिमांतो नदी"],
  [40, "Fukuoka", "福岡県", "ふくおかけん", "Fukuoka", "Fukuoka", "Hakata tonkotsu ramen and yatai food stalls", "हाकाता रामेन और याताई ठेले"],
  [41, "Saga", "佐賀県", "さがけん", "Saga", "Saga", "Arita porcelain and the hot-air balloon festival", "अरिता चीनी मिट्टी और गुब्बारा उत्सव"],
  [42, "Nagasaki", "長崎県", "ながさきけん", "Nagasaki", "Nagasaki", "Historic port open to the world; Peace Park; castella cake", "ऐतिहासिक बंदरगाह, शांति पार्क"],
  [43, "Kumamoto", "熊本県", "くまもとけん", "Kumamoto", "Kumamoto", "Kumamoto castle, Mt Aso volcano and Kumamon the bear", "कुमामोतो क़िला, आसो ज्वालामुखी, कुमामोन"],
  [44, "Oita", "大分県", "おおいたけん", "Ōita", "Oita", "Beppu and Yufuin - the hot-spring capital of Japan", "बेप्पू - गर्म झरनों की राजधानी"],
  [45, "Miyazaki", "宮崎県", "みやざきけん", "Miyazaki", "Miyazaki", "Surf beaches, mangoes and Takachiho gorge", "सर्फ़ समुद्र तट, आम और ताकाचिहो घाटी"],
  [46, "Kagoshima", "鹿児島県", "かごしまけん", "Kagoshima", "Kagoshima", "Active volcano Sakurajima and Yakushima’s ancient cedars", "सक्रिय ज्वालामुखी साकुराजिमा"],
  [47, "Okinawa", "沖縄県", "おきなわけん", "Okinawa", "Naha", "Coral beaches, Ryukyu culture and long-living people", "मूंगा समुद्र तट और र्यूक्यू संस्कृति"],
];
export const PREFS: Pref[] = P.map(([id, en, ja, kana, ro, capital, famous, hi]) => ({ id, en, ja, kana, ro, capital, famous, hi, region: R(id) }));

export const CITIES: City[] = [
  { name: "Tokyo", ja: "東京", ro: "Tōkyō", lon: 139.69, lat: 35.69, pop: "14 million", about: "Capital since 1868 (before that called Edo). Mega-city of neon districts, quiet shrines and the world’s busiest rail network.", tip: "Get a Suica/PASMO IC card - tap for trains, buses and convenience stores.", phrase: ["この電車は新宿に行きますか", "kono densha wa shinjuku ni ikimasu ka", "Does this train go to Shinjuku?"] },
  { name: "Yokohama", ja: "横浜", ro: "Yokohama", lon: 139.64, lat: 35.44, pop: "3.8 million", about: "Japan’s second-biggest city and historic port, 30 min from Tokyo.", tip: "Visit Chinatown and the Cup Noodles Museum." },
  { name: "Osaka", ja: "大阪", ro: "Ōsaka", lon: 135.50, lat: 34.69, pop: "2.8 million", about: "Friendly, loud and food-obsessed. People say ‘kuidaore’ - eat until you drop.", tip: "Locals say ‘ookini’ for thank you (Kansai dialect).", phrase: ["たこ焼きをください", "takoyaki o kudasai", "Takoyaki, please."] },
  { name: "Kyoto", ja: "京都", ro: "Kyōto", lon: 135.77, lat: 35.01, pop: "1.5 million", about: "Capital for over 1,000 years (794–1868). Temples, gardens, tea houses and geisha districts.", tip: "Go early to Fushimi Inari to avoid crowds; don’t chase geisha for photos.", phrase: ["写真を撮ってもいいですか", "shashin o totte mo ii desu ka", "May I take a photo?"] },
  { name: "Nagoya", ja: "名古屋", ro: "Nagoya", lon: 136.91, lat: 35.18, pop: "2.3 million", about: "Industrial hub (Toyota) between Tokyo and Osaka on the bullet train.", tip: "Try miso katsu and hitsumabushi (grilled eel)." },
  { name: "Sapporo", ja: "札幌", ro: "Sapporo", lon: 141.35, lat: 43.06, pop: "2 million", about: "Hokkaido’s capital: Snow Festival every February, beer and miso ramen.", tip: "Winters are very cold - bring warm, layered clothes." },
  { name: "Sendai", ja: "仙台", ro: "Sendai", lon: 140.87, lat: 38.27, pop: "1.1 million", about: "‘City of trees’ and gateway to Tohoku.", tip: "Try gyūtan (grilled beef tongue)." },
  { name: "Hiroshima", ja: "広島", ro: "Hiroshima", lon: 132.46, lat: 34.39, pop: "1.2 million", about: "Rebuilt city of peace; the Peace Memorial Park remembers 1945.", tip: "Take the ferry to Miyajima island at high tide." },
  { name: "Fukuoka", ja: "福岡", ro: "Fukuoka", lon: 130.40, lat: 33.59, pop: "1.6 million", about: "Relaxed, young city close to Korea; famous for ramen stalls.", tip: "Eat at a yatai (street stall) along the river at night." },
  { name: "Nara", ja: "奈良", ro: "Nara", lon: 135.80, lat: 34.69, pop: "350,000", about: "First permanent capital (710). Over 1,000 free-roaming deer.", tip: "Bow to the deer - many bow back! Buy only official deer crackers." },
  { name: "Kobe", ja: "神戸", ro: "Kōbe", lon: 135.20, lat: 34.69, pop: "1.5 million", about: "Stylish port city between mountains and sea - and a large Indian community.", tip: "Kobe has India Club and Indian restaurants near Kitano." },
  { name: "Naha", ja: "那覇", ro: "Naha", lon: 127.68, lat: 26.21, pop: "320,000", about: "Capital of Okinawa, once the Ryukyu Kingdom with its own culture and language.", tip: "‘Mensōre’ means welcome in Okinawan." },
];

export const JAPAN_FACTS: [string, string][] = [
  ["Islands", "About 14,000 islands; 4 main ones - Honshu, Hokkaido, Kyushu, Shikoku"],
  ["Area", "378,000 km² - about the size of Rajasthan + Gujarat"],
  ["Population", "About 124 million (India ≈ 1.4 billion)"],
  ["Capital", "Tokyo 東京"],
  ["Time zone", "JST = IST + 3 h 30 min"],
  ["Currency", "Yen 円 - ¥100 ≈ ₹55–60 (varies)"],
  ["Highest peak", "Mt Fuji 富士山, 3,776 m"],
];
