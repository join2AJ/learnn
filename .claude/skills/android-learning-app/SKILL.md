---
name: android-learning-app
description: Playbook for building a polished offline Android learning app (language or skills) the way this owner wants it - React+TypeScript+Vite inside an Android WebView shell, audio everywhere, voice recording/analysis, gamification, privacy/DPDP compliance, encrypted content and backups, Play Store launch, promo video, Instagram posts. Use when starting or extending any new Android app for this owner (Artin Studios), when they ask for "an app like Nihongo Path", or when preparing an app for release, store listing, audit or marketing.
---

# Android learning app playbook (Artin Studios)

Built from the full history of Nihongo Path (see `docs/PROJECT_HISTORY.md`). Follow it from day one so the owner does not have to ask for the same things again.

## 1. How this owner likes to work

- **Ship an APK after every change** and send it with `SendUserFile`, plus a screenshot contact sheet of what changed. Always say which version and that it installs over the previous one.
- **Never create or switch the signing key** without explicit permission ("Don't sign any new key"). Every build must be signed with the same key so updates install over old ones and keep progress. Verify the cert SHA-256 after each build.
- **Never remove existing features** when adding new ones; if asked "did you remove anything?", check and answer honestly.
- **Test before shipping**: headless Chromium (Playwright) screenshots of every changed screen, check for page errors, look at the images yourself, fix layout issues before sending.
- **Be honest about limits** (e.g. "no app is 100% uncrackable", "IP address isn't collected and why", "I can't hear audio here - I measured it"). Never fake results.
- **Ask for missing personal data** (email, WhatsApp, UPI, story, names) instead of inventing it; use placeholders that hide the feature until filled.
- Writing style in the UI: plain words, short sentences, **no long em dashes (—) - use "-"**, English + हिन्दी side by side, Japanese with romaji.

## 2. Design rules the owner asked for

- Modern **line icons** (lucide) - no old emoji icons in the UI. **Exception: flags 🇬🇧 🇮🇳 🇯🇵 for language labels** (owner loved them).
- **One accent colour per screen** - never two competing orange cards. Highlight only the call to action (Support = pink, Build-an-app = blue, primary = shu/orange).
- **Large sections collapse** (Fold) with a one-line summary; short personal story stays open.
- Badges grouped in **3-4 sections**, each badge tappable with progress and "how to earn".
- Quiz feedback **stays until the user taps Next**; when showing the answer, fade everything else.
- Intro = **swipeable full-screen slides with real app screenshots**, a spoken word per slide, a **sound on/off** toggle, Skip, then a short setup. The same slides are the app tour (`?` on Home), shown once to existing users after an update.
- Every screen works on small phones (360×640) and in dark mode; check both.
- Show a **"What's new"** popup after each update (changelog in the app).

## 3. Feature checklist for a learning app

Learning: scripts/alphabet with stroke order + tracing score, pronunciation guide, grammar lessons with quizzes, verb conjugator, words ranked by real **spoken frequency** with example sentences and the target word **highlighted in colour**, sentence bank, topic packs, exam levels (JLPT-style), survival phrases, culture (likes, dislikes, etiquette, famous for, attractions with photos), interactive map with a quiz game, roadmap/timeline, resources/YouTube.

Audio & voice: TTS on every word (normal + slow), tap any target-language text to hear it, record & compare (verify the word ≥80% first, then spectrogram, Low/Mid/High bands, pitch per beat, vowel map), recordings saved and replayable, Sound Lab.

Motivation: Today's plan that ticks itself, streaks, XP + levels (**tap level → XP by activity, XP per day, level history, ladder, how to earn**), 30+ grouped badges, pledge, personal goal, daily-goal ring, practice logs (writing + speaking), time per section.

Profile & settings: name, optional age range, reasons, daily time, pledge; Hindi/romaji toggles, speech speed, theme, haptics, What's inside (content stats), Licences (small link).

Me/About: one **About us** page - app description, Our story (open), Support us (donate/share), Build an app like this (request form: category → sub-category, features, budget ₹, timeline, stage, contact). Share page (invite card JPG + level card JPG). Feedback page (Say thanks with stars / Report a problem with category → sub-category → how often → description + **mandatory device & app details** / Suggest an idea). All sent via the user's own WhatsApp/email/share sheet - nothing uploaded.

Data: backup to Downloads, scheduled daily/weekly backup + reminder notification, **cloud copy to Google Drive/OneDrive via the system file picker** (ACTION_CREATE_DOCUMENT, persistable URI), restore from file, **own encrypted backup format** (see §5).

## 4. Architecture & build (what worked)

- `web/` React 18 + TS + Vite (`base: "./"`, output straight into `android/app/src/main/assets/www`, `inlineDynamicImports: true` so there is one bundle). Hash router, `useSyncExternalStore` store in localStorage, IndexedDB for recordings/drawings.
- `android/` plain Java `Activity` + WebView via `WebViewAssetLoader` (`https://appassets.androidplatform.net/assets/www/index.html`), JS bridge `Native` (speak, recordAndRecognize, saveBackup, saveBackupAs/pickCloudTarget/writeCloudTarget, shareText, shareImage via FileProvider, deviceInfo, contentKey, scheduleBackup, openExternal, setTheme, vibrate). R8 minify + keep rules for the bridge. compile/target SDK = latest required by Play (36 in 2026), `OnBackInvokedCallback` for Android 13+/16 back.
- Build: `cd web && npx tsc --noEmit && npx vite build`, then `cd android && ANDROID_HOME=/opt/android-sdk ./gradlew --no-daemon -q -I mirror.gradle assembleRelease bundleRelease`. If Maven Central returns 429/404, use an init script pointing to `https://maven-central.storage-download.googleapis.com/maven2/`.
- Data pipelines in `scripts/` (Python venv): wordfreq + fugashi/unidic for frequency, JMdict for meanings, Tatoeba for sentences, KanjiVG strokes, GSI map simplified with mapshaper, Wikimedia photos (only CC BY/BY-SA/CC0; record author + licence; Wikimedia rate-limits hard - sleep 4-90 s with backoff, use standard thumb sizes like 960px).
- Test: `npx vite preview --port 4173` + Playwright scripts (inject `window.__npKey` for encrypted builds; seed localStorage with `addInitScript` only if empty; full-page screenshots show sticky headers mid-page - that's an artefact).

## 5. Security, privacy & compliance (do these by default)

- **Encrypt the app bundle**: post-build Vite plugin AES-256-GCM-encrypts the JS bundle into `assets/app.bin`; an inline loader gets the key from `Native.contentKey()` (HMAC-SHA256 of the **signing certificate** + package with a pepper built at runtime) and runs it from a blob. Verify Java and Node derive the same key. A re-signed copy shows "install the official app".
- **Encrypted backups** `.npbak`: `NPBAK1` + base64(flag | iv | AES-GCM(gzip(JSON))), key = HMAC(contentKey, "np-backup-v1"), AAD = magic; old JSON still restores.
- Block copy/select/context menu outside inputs; `setWebContentsDebuggingEnabled(false)`; `usesCleartextTraffic=false`; `allowFileAccess=false`; exclude recordings from Android cloud backup.
- Privacy: no server, no analytics, no ads. Optional age; **under-18 → parent consent or child mode** (no recordings saved, no payment links). Full-screen **privacy policy that must be scrolled to the end** before the consent tick. Grievance officer + email (DPDP). Privacy screen: what is stored, export, delete everything. Never collect IP/location.
- Licences: keep full credits in `LICENSES.md`; in-app only the legally required minimum on a small Licences page + per-photo credit lines.
- Audit doc (`docs/AUDIT.md`) through ISO 27001 / 22301 / 31000 / NIST CSF + DPDP/GDPR, with a status table kept up to date.

## 6. Play Store launch checklist

AAB signed with the same key; **Play App Signing must use our existing key via PEPK** (otherwise encrypted content breaks); target latest SDK; hide tip/donation payment links in the Play build (`PLAY_STORE_BUILD`), keep "I want to donate" as an email; contact email + public privacy-policy URL (Google Sites / GitHub Pages from `docs/privacy-policy.html`); icon 512, feature graphic 1024×500, screenshots ≤ 2:1 (use 1080×1920); short (80) + full description; data safety = no data collected; content rating = Everyone; target audience 13+; new personal accounts need 12 testers × 14 days. Template: `docs/PLAY_LAUNCH.md`.

## 7. Marketing assets

- **Promo video** (1080×1920, ~50 s): HTML page with a `render(t)` function rendered frame by frame by Playwright at 30 fps → ffmpeg. Real app screens on tilted phones over bright gradient scenes, kana pop-ins, stat counters, logo intro/outro, photo montage. **Never zoom low-res photos** - use full-resolution originals with a slow pan, or postcard frames over a blurred copy. No scrolling-screenshot scenes.
- **Music**: original, synthesised with numpy (koto-style pluck, pads, bass, kick/clap/hats, taiko on photo cuts, chimes on stats, whooshes on transitions), 100 BPM, scene cuts on downbeats; verify beat grid and loudness (-14 LUFS, true peak -1).
- **Voice-over**: Piper TTS `en_US-ljspeech-high` (public-domain dataset), one line per scene, music ducked ~7.5 dB under the voice.
- **Instagram**: 5 posts at 1080×1350 (launch, speaking, a "did you know" comparison with the learner's language, a 7-day challenge, travel) + captions with emoji bullets, a CTA ("link in bio", "save this", "comment START") and 12-15 hashtags. Keep photo credits on images.
- Share cards in the app (canvas → JPEG → Android share sheet).

## 8. Gotchas we hit

- A `Sheet` inside an animated container renders behind overlays → portal it to `document.body`; give full-screen overlays a high z-index.
- `pagehide` flush can overwrite test localStorage → seed only if empty.
- Bridge methods must be kept by R8; FileProvider needs `res/xml/share_paths.xml`.
- Android 16 (target 36) no longer calls `onBackPressed` → register `OnBackInvokedCallback`.
- Wikimedia: action API 429s; REST `page/summary` works; `?action=raw` for licence; non-standard thumb widths return 400.
- Play screenshots taller than 2:1 are rejected.
- Encryption key mismatch = app opens to a blank "official app" message → always verify keys match and test the release on a phone.
