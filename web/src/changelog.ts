/** Shown once after each update ("What's new"). Newest first. */
export const APP_VERSION = "4.2";
export const CHANGELOG: { v: string; date: string; items: [string, string][] }[] = [
  { v: "4.2", date: "18 Nov 2026", items: [
    ["sparkles", "Behind the scenes: the app is now ready for more languages - screens adapt to each course."],
    ["volume", "Voice settings follow the course language."],
  ] },
  { v: "4.1", date: "17 Nov 2026", items: [
    ["shield", "Ready for Google Play: updated for Android 16, new back-gesture support, privacy contact added."],
    ["chat", "Feedback, app requests and donation messages now go straight to our email."],
  ] },
  { v: "4.0", date: "17 Nov 2026", items: [
    ["shield", "Backups now use Nihongo Path’s own encrypted .npbak format - only the official app can open them (old .json backups still restore)."],
    ["chat", "Problem reports always include device & app details so issues can be fixed quickly."],
  ] },
  { v: "3.9", date: "17 Nov 2026", items: [
    ["chat", "Send feedback: say thanks with a star rating, report a problem (category → what exactly → how often) or suggest an idea - device and app details can be added so we can fix it faster."],
    ["sparkles", "Share the app with a beautiful invite picture, and share your level card as a JPG."],
    ["shield", "Content protection: the app’s lessons and words are encrypted and can only be opened by the official app; text can’t be copied."],
    ["heart", "Support the app is highlighted in Settings too."],
  ] },
  { v: "3.8", date: "17 Nov 2026", items: [
    ["earth", "Cloud backup: save to Google Drive, OneDrive or any cloud app - or keep one cloud copy updated with every backup."],
    ["star", "Tap your level to see where your XP came from, XP per day, when you reached each level and how to earn more."],
    ["award", "Badges grouped into 4 sections; big stats sections open when you tap them."],
    ["volume", "Tour: turn the sound on or off with one tap."],
  ] },
  { v: "3.7", date: "17 Nov 2026", items: [
    ["compass", "New app tour: the colourful swipe-through slides with real screens (also under ? on Home)."],
    ["heart", "About us: tap a section to open it. “Support us” has an “I want to donate” button; “Build an app like this” - we will build it for you."],
  ] },
  { v: "3.6", date: "17 Nov 2026", items: [
    ["heart", "One “About us” page: our story, how to support the app, and a request form for your own Android app - simpler and calmer."],
  ] },
  { v: "3.5", date: "17 Nov 2026", items: [
    ["sparkles", "Brand-new intro: swipe through real screens of the app, hear Japanese on every slide, then set up in a minute."],
    ["heart", "Support page now tells the story of the app and why it was made."],
    ["sliders", "Cleaner screens: credits trimmed to one small Licences page."],
  ] },
  { v: "3.4", date: "17 Nov 2026", items: [
    ["sliders", "Tidier Settings: credits moved to a separate Open-source licences page."],
  ] },
  { v: "3.3", date: "17 Nov 2026", items: [
    ["shield", "Privacy policy now opens full-screen on top of everything, shows how far you have read, and must be read to the end before you can tick “I agree”."],
  ] },
  { v: "3.2", date: "17 Nov 2026", items: [
    ["earth", "Map of Japan: new Landscape view (seas, neighbours, Mt Fuji, Japanese Alps, Lake Biwa, the 4 main islands) and Sights view with famous places on the map."],
    ["landmark", "Explore: “Japan is famous for…” - 10 things Japan is known for and 18 top attractions with photos, best season and tips (English & Hindi)."],
    ["help", "About page: why this app was made, and a form to request your own Android app - pick category, features, budget and timeline."],
  ] },
  { v: "3.1", date: "16 Nov 2026", items: [
    ["compass", "Map of Japan (Explore): 47 prefectures in 8 regions - tap to hear names in Japanese, see the capital and what each is famous for (English & Hindi), zoom into regions, big-city tips and phrases."],
    ["target", "New game: “Find the prefecture” on the map."],
  ] },
  { v: "3.0", date: "16 Nov 2026", items: [
    ["layers", "Topic packs (food, travel, family… 15 themes) and JLPT N5–N1 packs - browse and study each as flashcards."],
    ["flag", "Personal goal: e.g. 600 words by February for your trip, with the words per day you need."],
    ["repeat", "Flashcards: “English first” mode - see the meaning, say the Japanese. JLPT tags and filter on words."],
    ["award", "Badges you can explore: progress on every badge and how to earn it."],
    ["shield", "Privacy policy, grievance contact, consent, and parent consent / child mode for learners under 18."],
    ["compass", "New intro: see what the app does before setting up."],
  ] },
  { v: "2.9", date: "16 Nov 2026", items: [
    ["layers", "Backup & restore: save a backup file to Downloads/NihongoPath (survives uninstall), restore from a file, optionally include recordings and drawings."],
    ["timer", "Automatic backup every day or every week at a time you choose, with a reminder notification."],
    ["mic", "Word of the day: record button on the example sentence too."],
    ["shield", "Privacy screen: “Back up first” link and tidier delete buttons."],
  ] },
  { v: "2.8", date: "16 Nov 2026", items: [
    ["book", "2,000 words (was 1,000) with Hindi - all ordered by how often they are spoken, with a “how common” meter (e.g. heard about 1 in 23 words)."],
    ["chat", "Sentence bank: 3,200 real sentences, simplest first, filter by top-100 / 300 / 600 / 1,000 / 2,000 words."],
    ["shield", "Privacy & your data: see what is stored and delete recordings or everything. Reset now also clears recordings and drawings."],
    ["heart", "Support page - the app stays free; support is optional."],
  ] },
  { v: "2.7", date: "16 Nov 2026", items: [
    ["mic", "Speak aloud now saves every attempt to My recordings with the full voice analysis and what the phone heard."],
    ["flag", "Kana chart: TODAY follows the calendar day of your plan, NEXT marks the row to learn - plus an ahead / behind note."],
    ["sparkles", "This “What’s new” screen after every update, and Settings → What’s inside with counts of all content."],
  ] },
  { v: "2.6", date: "15 Nov 2026", items: [
    ["check", "Words are checked first: details appear only when what you said matches 80%+."],
    ["target", "Where your vowels land: each beat of your recording on the mouth map, with tips."],
    ["pen", "My writing: every drawing saved with shape, coverage, stroke count, order and direction."],
    ["compass", "New welcome and journey screens, Day labels on kana rows, Prev / Next in the kana card."],
  ] },
  { v: "2.5", date: "15 Nov 2026", items: [
    ["pen", "Writing is checked once per drawing; practice log on the dashboard."],
    ["bulb", "Vowel chart axes explained (what 300…900 and 1000…2500 mean)."],
  ] },
  { v: "2.4", date: "15 Nov 2026", items: [
    ["mic", "Recordings keep their sound: replay everything in My recordings."],
    ["gauge", "Where you stand: pitch, melody, loudness and pace gauges."],
  ] },
];
