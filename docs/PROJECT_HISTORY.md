# Nihongo Path - project history

What was asked, what was built, and what we learned. Newest at the bottom.
Developer: Artin Studios · artinstudios.official@gmail.com · App id `com.nihongopath.app`

## Starting point
The owner uploaded a v1.2 JSX prototype, an xlsx with 1,000 words + 30 grammar items + Hindi, and a zip. The brief was a **beginner-first Japanese learning APK** with:
alphabets, speaking, writing, roadmap/timeline, English + Hindi comparison, tenses/verbs/nouns, speech spectrogram/frequency view, superb UI/UX, read-aloud (TTS) everywhere, flashcards, quizzes, rewards, fast learning, bottom nav, YouTube/resources, a culture tab (likes, dislikes, behaviour), a multi-language-ready base, and study-time stats per section.

## Version by version

| Ver | What the owner asked for / feedback | What was built |
|---|---|---|
| v2.0 | Full app from the brief | React + TS + Vite app inside an Android WebView shell, offline, TTS, SRS flashcards, quizzes, XP/levels/badges, culture, roadmap, resources, per-section time tracking |
| v2.1 | Audio missing in places; app intro; record every word and plot its spectrum; ask name/age/why/time and make a pledge with a badge | Onboarding profile + pledge, app tour, Today's plan, record-and-compare voice analysis, tap-to-hear on all Japanese |
| v2.2 | "Use new icons, not old ones like 🎙" | Consistent line-icon set (lucide) |
| v2.3 | "Flags 🇬🇧 🇮🇳 🇯🇵 were awesome" | Kept flags for language labels only |
| - | "Have you removed anything from the previous builds?" | Answered honestly; nothing was removed |
| v2.4 | Review all recordings; low/medium/high pitch and "where I stand" | Saved recordings, My recordings, where-you-stand gauges, per-beat H/M/L melody, band explanations |
| v2.5 | Play button must play; explain "900 / 2500"; writing points once per drawing; dashboard log of all tries | One check per drawing, practice log, axis explanations, playback fallback |
| v2.6 | Check the spoken word ≥80% before analysis; vowel positions per beat; My writing with accuracy & awards; better intro; replace AI dashes "—" with "-"; next-character button; highlight Day 1-5/6; explain flashcard tabs in English/Hindi | One-shot record + recognise, vowel map per beat, My writing, new intro, dash cleanup |
| v2.7 | Day 2 shown on day 1; Speak aloud should save recordings; content stats; "tell users what is new after an update" | TODAY/NEXT fix, saved Speak recordings, What's inside, What's new popup |
| v2.8 | More words & sentences in frequency order; ISO 27001/22301/31000/NIST CSF audit; how to earn support | 2,000 words by spoken frequency + Hindi, 3,200-sentence bank, frequency meter, `docs/AUDIT.md`, privacy screen + delete, support page |
| v2.9 | DPDP/GDPR lens; backup link; delete button overflow; daily/weekly auto backup; what data can we collect; WOTD sentence record; app worth/earnings | Backup/restore to Downloads, scheduled backups + reminders, privacy fixes |
| - | "Don't sign any new key… do the rest" | **Kept the original signing key forever** |
| v3.0 | Highlight the word in example sentences in another colour; readable/explorable badges; JLPT tags & topic packs; privacy policy, grievance contact, under-18 handling; intro should first tell what the app is | Highlighted words, badge detail sheets, 15 topic packs + JLPT N5-N1, personal goal, English-first cards, privacy policy + consent + parent consent/child mode, showcase intro |
| v3.1 | Include a map of Japan | Interactive SVG map: 47 prefectures, 8 regions, cities, "Find the prefecture" game |
| v3.2 | Show what Japan looks like; famous things & attractions in culture; About section with my interest in Japan and "build your own Android app" (category, sub-category, features, budget) | Landscape & Sights map layers, 18 attractions with CC photos, Famous-for page, About + app-request form, 18 Wikimedia photos credited |
| v3.2 | Quiz highlight disappears in a second; fade all other colours | Answer stays until **Next**, other prefectures fade |
| v3.2 | Make a short promo video | 40 s vertical video |
| v3.3 | The privacy policy opened behind the screen, so users ticked without reading | Full-screen reader; must scroll to the end before "I agree" |
| v3.4 | Don't show KanjiVG prominently ("the heart of the app"); share screenshots | Credits moved to a small Licences page (licence-required minimum); screenshot set |
| v3.5 | Credits only where legally necessary; improve the intro ("told you many times"); about text under Support; the video's scrolled frames look bad; add music | Swipeable intro with real screens + spoken words; minimal licences; new video built frame by frame with original synthesised music |
| v3.6 | Two orange cards compete for attention; About/Build page looks bad; order should be story → support → build | One About us page, one accent colour, cleaner request form |
| v3.7 | "We will build it for you" wording; Build card in a different colour; donate must be clickable; sections collapsed until tapped; highlight support; tour still old | Collapsible sections, pink Support, blue Build, "I want to donate", new slides as the tour |
| v3.8 | Keep Our story open; mute in the tour; Google Drive/OneDrive backup; collapse big stats; group badges (3-4); tap level → why these points & level history | Sound on/off in tour, cloud backup via the system picker (+ auto-updated cloud copy), Fold sections, 4 badge groups, Level page (XP by activity, XP/day, level history, ladder, how to earn) |
| video | Add an English voice-over; check the beats | Piper TTS (LJSpeech, public domain), music ducking, -14 LUFS; beat check: 100 BPM, all cuts on downbeats |
| v3.9 | Support highlighted in Settings too; nobody can reverse-engineer or copy content; share level as JPG and share the app with a nice image + message; thanks/problem/idea feedback with category, sub-category and device details | Encrypted app bundle (AES-256-GCM, key from signing cert), copy/select blocked, debugging off, share cards, Feedback page |
| v4.0 | Device details mandatory for problem reports; backups in the app's own format nobody can decrypt | Encrypted `.npbak` backups (gzip + AES-256-GCM, tamper-evident) |
| video | Zoomed photo pixels look bad | Full-resolution photos with a pan instead of a zoom; postcard frames for small photos |
| social | 5 Instagram posts | 1080×1350 posts + captions with hashtags (`release/instagram/`) |
| v4.1 | Is it ready for Play? Are the audit points closed? Use artinstudios.official@gmail.com | Target SDK 36, back gesture, contact email everywhere, payment links hidden for Play, AAB, icon/feature graphic/screenshots, privacy-policy web page, `docs/PLAY_LAUNCH.md`, audit status table |

## Still waiting on the owner
- Public URL for the privacy policy (Google Sites or GitHub Pages)
- Play App Signing with **our** key via PEPK (critical for the encryption)
- Real-device test of the encrypted builds; 12-tester / 14-day closed test
- WhatsApp number, UPI ID / support links (non-Play builds), personal story text for About
| v4.2 | Build the French course hidden during the closed test, then switch it on after the Japanese launch | Multi-language engine (screens read the active pack); hidden French pack: 2,000 words by spoken frequency with English + Hindi + gender + IPA + Tatoeba sentence, 4,000-sentence bank, alphabet/accents/20 sounds, 7 pronunciation topics, 21 grammar lessons, 30 core words, conjugator (384 verbs × 20 forms), phrases, culture, roadmap, CEFR levels, French vowel map. Unlock: Settings → tap the version 7 times |
