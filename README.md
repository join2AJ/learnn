# Nihongo Path — learn Japanese fast (Android)

**Install:** download [`release/NihongoPath-v2.0.apk`](release/NihongoPath-v2.0.apk) to your phone, open it and allow "install unknown apps". Android 7.0+.

A beginner-first Japanese course with English **and Hindi** explanations:

| Tab | What's inside |
|---|---|
| **Home** | Greeting, daily-goal ring, level/XP, "Up next" step chosen from your progress, word of the day, culture tip |
| **Learn** | The 3 scripts compared with English & Hindi · Hiragana / Katakana / 60 starter kanji charts with sound, Hindi hints, memory tricks and **animated stroke order** · How to speak (9 pronunciation rules) · 24-lesson grammar course (parts of speech, tense map, verb groups, ます/plain forms, て-form, adjectives, conditionals, keigo…) · 30 core grammar words · verb conjugator (20 forms × 170+ verbs) · 1,000 frequency-ranked words with sentences · survival phrases |
| **Practice** | Spaced-repetition flashcards · 8 quiz types (kana, listening, meaning, reverse, particles, sentence builder, verb forms) · **Speak aloud** with speech recognition · **Writing pad** with shape scoring · **Sound Lab**: live spectrogram, your vowels plotted against Japanese/English/Hindi formant targets, reference "sound shapes", pitch-accent tracker |
| **Explore** | Culture (values, what people love / dislike, etiquette do's & don'ts, communication, Japan–India links, festivals) · roadmap with auto-ticking tasks + personal timeline + JLPT table · YouTube channels & resources |
| **Me** | Total time, time per section, 14-day chart, 10-week heatmap, accuracy, mastery bars, 21 badges · Settings (Hindi/romaji, voice speed, theme, goals, backup/restore) |

Rewards: XP and levels (初心者 → 伝説), streaks, daily-goal bonus, badges, confetti and spoken praise (すごい！よくできました！).

## Project layout

```
web/                 React + TypeScript app (Vite). Builds into android/app/src/main/assets/www
  src/core/          language-agnostic engine: storage, SRS, rewards, time tracking, DSP, native bridge
  src/packs/ja/      the Japanese content pack (kana, lessons, culture, phrases, sounds, data/*.json)
  src/packs/registry.ts   list of language packs
  src/screens/       UI
android/             Native shell: WebView + Japanese TTS + speech recognition + mic + haptics
scripts/build_strokes.py  fetches KanjiVG stroke paths into web/src/packs/ja/data/strokes.json
```

## Build

```bash
cd web && npm install && npm run build        # writes the web app into the Android assets
cd ../android && ./gradlew assembleRelease     # APK in app/build/outputs/apk/release/
```
Or open `android/` in Android Studio and press Run. The APK is signed with the committed
`app/nihongopath.keystore` so new builds install as updates (it is not a Play Store key).

## Adding another language

The engine only talks to the `LanguagePack` interface (`web/src/core/types.ts`). Create
`web/src/packs/<id>/index.ts` exporting a pack (alphabets, words, lessons, culture, phrases,
vowel formants, praise…), import it in `registry.ts` and mark it `ready`. Progress is stored
per language.

## Phone setup tips
- No sound? Settings → System → Languages → Text-to-speech → install the **Japanese** voice (or Me → Settings → Japanese voice).
- Speak aloud needs the Google app's speech recognition (internet, or the offline Japanese pack).

## Credits
Stroke order: [KanjiVG](https://kanjivg.tagaini.net) (CC BY-SA 3.0). Word ranks: Mindomax (OpenSubtitles + Tatoeba) and wordfreq. Example sentences are AI-written; formant values are rounded literature averages.
