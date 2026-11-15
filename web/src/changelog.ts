/** Shown once after each update ("What's new"). Newest first. */
export const APP_VERSION = "2.9";
export const CHANGELOG: { v: string; date: string; items: [string, string][] }[] = [
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
