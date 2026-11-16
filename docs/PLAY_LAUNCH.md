# Google Play launch kit - Nihongo Path v4.1

Developer: **Artin Studios** · Contact: **artinstudios.official@gmail.com**
Upload file: `release/NihongoPath-v4.1.aab` · Graphics: `release/play/` · Privacy policy page: `docs/privacy-policy.html`

---

## 1. Launch checklist

| # | Item | Status |
|---|---|---|
| 1 | Android App Bundle (.aab), target SDK 36 (Android 16), back gesture support | ✅ done |
| 2 | Developer contact email + grievance officer in the app and policy | ✅ done |
| 3 | Payment/tip links hidden in the Play build (`PLAY_STORE_BUILD = true`) | ✅ done |
| 4 | Icon 512×512, feature graphic 1024×500, 8 phone screenshots (1080×1920) | ✅ done |
| 5 | Store listing text, data safety answers, content rating answers | ✅ below |
| 6 | **Host the privacy policy** at a public URL and paste it in Play Console | ⏳ you |
| 7 | **Play App Signing with our existing key** (see section 2 - critical) | ⏳ you |
| 8 | Install v4.1 on a real phone and check it opens | ⏳ you |
| 9 | Closed test: 12+ testers for 14 days (new personal accounts only) | ⏳ you |
| 10 | Ideally: a fluent Japanese speaker reviews a sample of sentences | ⏳ recommended |

---

## 2. App signing - read this before uploading (critical)

The app's lessons are encrypted with a key tied to the **signing certificate** (SHA-256 `62:F5:B3:AA:…:6F:23:90`).
If Google re-signs the app with a *different* key, the app will only show "This copy of Nihongo Path cannot open its content".

When Play Console asks how to sign the app (Setup → App signing), choose **"Use a different key / Export and upload a key from Java keystore"** and upload *our* key:

1. In Play Console, download the **PEPK tool** and the encryption public key it shows.
2. Run (on your computer, with `android/app/nihongopath.keystore`):
   `java -jar pepk.jar --keystore=nihongopath.keystore --alias=nihongopath --output=output.zip --include-cert --rsa-aes-encryption --encryption-key-path=encryption_public_key.pem`
   (store and key password: `nihongopath`)
3. Upload `output.zip` in Play Console. Google then signs every download with this same key → content and `.npbak` backups keep working.
4. Optionally create a separate **upload key** later (Play lets you register it); that does not change what users get.

After this, move the keystore out of the repository and keep two offline copies (password manager + USB). Losing it means no more updates for current users.

---

## 3. Store listing

**App name (30):** Nihongo Path: Learn Japanese

**Short description (80):** Learn Japanese from zero - in English & Hindi. Speak, write, read. Free, offline.

**Full description:**

Learn Japanese from your very first あ - with every word explained in English and हिन्दी.

Nihongo Path is a free, offline, beginner-first Japanese course. No ads, no account, and your progress stays on your phone.

📖 READ & WRITE
• All 104 hiragana and katakana with sound, Hindi hints and memory tricks
• Animated stroke order - trace with your finger and get a score
• 60 starter kanji with meanings
• A 7-day plan that tells you exactly what to learn next

🗣️ SPEAK - AND SEE YOUR VOICE
• Every word and sentence is spoken aloud (normal and slow)
• Record yourself: the app checks the word, shows your voice next to a native reference, and where your vowels land on a mouth map
• Sound Lab with live spectrogram and pitch

📚 2,000 WORDS PEOPLE REALLY USE
• Most-spoken words first, each with an example sentence and Hindi meaning
• 5,000+ example sentences, 25 grammar lessons, verb conjugator (20 forms)
• Smart flashcards that come back just before you forget
• Topic packs (food, travel, family…) and JLPT N5–N1 levels

🗾 DISCOVER JAPAN
• Interactive map of all 47 prefectures with a "Find the prefecture" game
• 18 famous places with photos, best season and tips
• Culture & etiquette: what Japanese people love, dislike and expect

🏆 STAY MOTIVATED
• Daily plan, streaks, XP levels and 30+ badges
• Personal goal ("600 words before my trip")
• See where your XP comes from and your level history

🔒 PRIVATE BY DESIGN
• Works fully offline · no ads · no tracking · no account
• Encrypted backups to your phone, Google Drive or OneDrive

Start today - 15 minutes a day is enough. がんばって！

**Category:** Education · **Tags:** Language learning, Education
**Contact email:** artinstudios.official@gmail.com
**Privacy policy URL:** (your hosted URL of `docs/privacy-policy.html`)

---

## 4. Data safety form (answers)

- **Does your app collect or share any of the required user data types?** → **No** for collection by the developer: everything is stored only on the device, there is no server.
  - Note for the reviewer field: "Speech recognition uses the device's Google speech service when the user taps the mic; the app itself does not transmit or store audio off-device."
- **Is all data encrypted in transit?** → Not applicable (the app sends no user data). Answer *Yes* if asked (no cleartext traffic allowed).
- **Can users request data deletion?** → Yes - in the app: Settings → Privacy → Delete everything.
- **Feedback emails** are sent by the user through their own email app; nothing is collected automatically.

## 5. Content rating questionnaire

Category: **Reference, News, or Educational**. Answer **No** to violence, sexual content, profanity, drugs, gambling, user-generated content sharing, location sharing, purchases. Expected rating: **Everyone / 3+ (PEGI 3, IARC 3+)**.

## 6. Target audience

Choose **13–15, 16–17, 18+** (not under 13). The app already asks for parent consent for under-18s and runs a child mode without saved recordings.

## 7. App access / ads

- App access: **All functionality available without special access**.
- Ads: **No ads**.
- Government app / financial / health: **No**.

## 8. Permissions declared

INTERNET (links/YouTube/speech service), RECORD_AUDIO (record & compare pronunciation - only when the user taps the mic), POST_NOTIFICATIONS + RECEIVE_BOOT_COMPLETED (optional backup reminders), VIBRATE. No location, contacts, SMS, camera or storage permissions.

## 9. Hosting the privacy policy (pick one)

- **GitHub Pages** (repo must be public): Settings → Pages → deploy from `docs/` → URL like `https://<user>.github.io/learnn/privacy-policy.html`.
- **Google Sites** (free, works with the Gmail account): new site → paste the text of `docs/privacy-policy.html` → Publish.
- Then paste the URL in Play Console → App content → Privacy policy, and send it to us to add inside the app (`CONTACT.policyUrl`).
