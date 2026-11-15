# Nihongo Path - Security, Continuity & Risk Review

**Scope:** Nihongo Path v2.8 Android app (WebView shell + offline React app), its source repository and its build/release process.
**Lenses:** ISO/IEC 27001:2022 (Annex A controls), ISO 22301:2019 (business continuity), ISO 31000:2018 (risk management), NIST CSF 2.0 (Govern, Identify, Protect, Detect, Respond, Recover).
**Method:** code and configuration review of this repository; no penetration test, no device forensics. This is a gap review, not a certification audit - a one-person, no-server app cannot be "ISO certified", but the controls still tell us where it is weak.

---

## 1. Summary

The app's architecture is already privacy-friendly: **no server, no account, no analytics, no ads, all data on the phone.** That removes most classic risks (breaches of a central database, credential theft, server downtime).

The real risks are in **release and key management, personal data of minors, third-party licences, and continuity of the project itself** (single developer, single build machine, single signing key).

| Priority | Finding | Fix effort |
|---|---|---|
| 🔴 High | The APK signing key and its password are committed to the repository | 1 hour + one-time re-install for current users |
| 🔴 High | Age is collected, including "Under 13" / "13–17", and voice recordings are stored - children's data rules (India DPDP Act 2023, COPPA, GDPR-K) | Fixed partly in 2.8; finish with a privacy policy |
| 🟠 Medium | No published privacy policy / licence notice - required for the Play Store and for CC BY-SA data (KanjiVG, JMdict, wordfreq) | 2–3 hours |
| ✅ Fixed in 2.8 | Voice recordings were included in Android cloud backup | done |
| 🟠 Medium | No automated build, tests or dependency scanning; the build depends on one machine and on Maven Central behaving | 1 day |
| 🟠 Medium | Learner data lives only on the phone - phone lost = progress lost unless the learner exported it | 1–2 days for a safer backup |
| 🟡 Low | No crash or error reporting - problems on real phones are invisible | half day (opt-in) |
| 🟡 Low | AI-written example sentences and auto-matched dictionary data may contain mistakes | ongoing review |

**Already fixed in v2.8:** recordings and drawings are excluded from cloud backup, cleartext traffic is explicitly blocked, a Privacy & your data screen, "delete recordings" and "delete all my data", Reset now also wipes recordings and drawings, age is optional with a note for under-18s, and the Support page shows no payment link until one is configured.

---

## 2. ISO/IEC 27001:2022 - information security controls

| Control (Annex A) | Status | Evidence / gap | Recommendation |
|---|---|---|---|
| 5.1 Policies for information security | ❌ Missing | No written security or privacy policy | One-page `SECURITY.md` + `PRIVACY.md` (how to report issues, what data exists) |
| 5.9 Inventory of information assets | ⚠️ Partial | Data stores: localStorage (`np2:*`), IndexedDB `np-recordings`, `np-writing` - documented only in code | Keep the data-inventory table from section 6 in `PRIVACY.md` |
| 5.12 / 5.13 Classification & labelling | ⚠️ Partial | Voice recordings and age are personal data; the app treats them like progress data | Label voice/age as *personal* - exclude from backups, delete on request (done) |
| 5.17 / 8.24 Authentication & cryptographic keys | 🔴 Gap | `android/app/nihongopath.keystore` + password in `build.gradle` are in git | Generate a new upload key outside git, store it in a password manager + offline copy; use **Play App Signing** so Google holds the distribution key |
| 5.19–5.23 Supplier & cloud services | ⚠️ Partial | Google speech recognition (may send audio to Google), Google TTS, YouTube links, Tatoeba/JMdict/KanjiVG data | List the suppliers in the privacy policy; prefer on-device recognition where the phone supports it |
| 5.32 Intellectual property rights | ⚠️ Partial | KanjiVG (CC BY-SA 3.0), JMdict (CC BY-SA 4.0), wordfreq data (CC BY-SA 4.0), Tatoeba (CC BY 2.0 FR) - credited in Settings → About | Add `LICENSES.md`; the **share-alike** data files must be redistributable under the same licence (keep data in separate JSON files, as now) |
| 5.34 Privacy & PII protection | ⚠️ Partial → improved | Name, age range, reasons, voice, handwriting; all local | Done: data screen + delete. To do: privacy policy URL, parental notice for minors |
| 8.1 User endpoint devices | ✅ Good | Data in app-private storage, no external storage, no file access from WebView | - |
| 8.9 Configuration management | ⚠️ Partial | WebView hardened (`allowFileAccess=false`, `allowContentAccess=false`, assets via `https://appassets…`) | ✅ `usesCleartextTraffic="false"` and backup exclusions added in 2.8 |
| 8.12 Data leakage prevention | ⚠️ Partial | `allowBackup="true"` + backup rules include `app_webview/` → recordings can reach Google Drive backup | ✅ Done in 2.8: IndexedDB (recordings, drawings) excluded from cloud backup |
| 8.25–8.29 Secure development & testing | ❌ Missing | No CI, no unit tests, no lint/SAST, no dependency audit | GitHub Actions: `npm ci && npm run build`, `npm audit`, Gradle `lint`, `./gradlew assembleRelease`; a few unit tests for SRS, conjugation, scoring |
| 8.28 Secure coding (JS bridge) | ✅ Mostly good | `@JavascriptInterface` bridge only on our own origin; external URLs leave the WebView | Optionally check the calling origin inside each bridge method |
| 8.30 Outsourced development | ⚠️ | Code was largely AI-assisted | Human review before each release (the checklist in section 8) |
| 8.32 Change management | ⚠️ Partial | Versioned APKs, changelog, "What's new" screen | Tag releases in git; keep the previous APK for rollback |

---

## 3. ISO 22301:2019 - business continuity

"Business" here means: *the app keeps working for learners, and the project survives problems with its developer, tools or suppliers.*

| Disruption | Impact | Current state | Recommendation (RTO / RPO) |
|---|---|---|---|
| Learner loses or changes phone | All progress, recordings and drawings lost | Manual "Export" text in Settings; Android backup may restore | Monthly reminder to export; optional **file export to Google Drive / Downloads** (RPO ≤ 30 days); later an optional encrypted cloud sync |
| Signing key lost | No more updates for existing installs - users must uninstall and lose data | Single copy in repo | Two offline copies of the key + Play App Signing (RTO: same day) |
| Developer unavailable | Project stalls | Single maintainer | README build guide (done), second trusted maintainer with repo access, documented release steps |
| Build machine or registry outage | Can't ship fixes (we hit flaky Maven Central during this build) | Builds worked only via a Google mirror | CI with dependency caching; commit `gradle/verification-metadata.xml`; keep a last-known-good APK |
| GitHub account lost or locked | Source unavailable | One remote | Mirror to a second remote (GitLab or Bitbucket) + local archive (RPO: each release) |
| Google speech / TTS changes | Speaking features degrade | App falls back to listen-again flow; TTS settings link | Keep the fallbacks; test on 2–3 Android versions before release |
| Third-party data licence change | Must remove content | Data in separate JSON files | Keep licence copies in `LICENSES.md`; data can be swapped without code changes |

**Minimum continuity kit:** (1) key in a password manager + USB drive, (2) repo mirror, (3) the last 3 APKs, (4) `RELEASE.md` checklist, (5) contact details of a backup maintainer.

---

## 4. ISO 31000:2018 - risk register

Likelihood (L) and impact (I) on a 1–5 scale; score = L × I.

| # | Risk | L | I | Score | Treatment | Owner |
|---|---|---|---|---|---|---|
| R1 | Leaked signing key used to publish a fake "update" | 3 | 5 | **15** | Reduce: rotate key, Play App Signing, remove key from git history | Developer |
| R2 | Children's data handled without parental consent (DPDP §9) | 3 | 4 | **12** | Reduce: keep data on device, make age optional (done), parental notice, privacy policy | Developer |
| R3 | Store rejection: missing privacy policy / data-safety form | 4 | 3 | **12** | Reduce: publish policy, fill Play Data Safety honestly (mic, on-device storage, Google speech) | Developer |
| R4 | Licence non-compliance (CC BY-SA data) | 2 | 4 | 8 | Reduce: `LICENSES.md`, attribution screen (exists), keep data separate | Developer |
| R5 | Learner data loss (phone change) | 4 | 2 | 8 | Reduce: export reminders, file export, optional sync | Developer |
| R6 | Wrong or unnatural content (AI sentences, auto dictionary matches) | 3 | 2 | 6 | Reduce: "Report a mistake" button, native-speaker review of the top 500 words | Content |
| R7 | Recordings land in cloud backups unexpectedly | 3 | 2 | 6 | Reduce: exclude from backup rules | Developer |
| R8 | Supply-chain issue in npm/Gradle dependencies | 2 | 3 | 6 | Reduce: lockfiles (present), `npm audit` + Dependabot in CI | Developer |
| R9 | Single maintainer unavailable | 2 | 3 | 6 | Share: second maintainer; document releases | Developer |
| R10 | Donation channel misuse or confusion (fake UPI IDs) | 2 | 3 | 6 | Reduce: links only from the official app/site, show the verified payee name | Developer |

**Risk appetite (suggested):** accept scores ≤ 6 with monitoring; scores ≥ 8 need a treatment before the next public release.

---

## 5. NIST CSF 2.0 - profile (current → target)

Maturity tiers: 1 Partial · 2 Risk-informed · 3 Repeatable · 4 Adaptive.

| Function | Current | Target (6 months) | Key actions |
|---|---|---|---|
| **Govern (GV)** | 1 | 2 | Privacy policy, security contact, risk register (section 4) reviewed each release |
| **Identify (ID)** | 2 | 3 | Asset and data inventory (section 6), supplier list, SBOM generated in CI |
| **Protect (PR)** | 2 | 3 | Key management, backup exclusions, CI checks, least data collected (age optional ✔) |
| **Detect (DE)** | 1 | 2 | Opt-in crash reporting (no personal data), GitHub issue template, Dependabot alerts |
| **Respond (RS)** | 1 | 2 | `SECURITY.md` with how to report, a 48-hour triage promise, a hotfix release procedure |
| **Recover (RC)** | 1 | 3 | Rollback APK, key backups, repo mirror, learner export/import (exists) |

---

## 6. Personal data inventory

| Data | Where | Leaves phone? | Retention | Delete |
|---|---|---|---|---|
| Name, age range, reasons, pledge | localStorage `np2:settings` | No (unless the learner exports) | Until deleted / uninstalled | Settings → Privacy |
| Progress, XP, study time, logs | localStorage `np2:progress:*` | No | Same | Reset / Privacy |
| Voice recordings (16 kHz PCM) + analysis | IndexedDB `np-recordings` | No (excluded from cloud backup since 2.8) | Same | Privacy → delete recordings |
| Handwriting strokes + scores | IndexedDB `np-writing` | No (excluded from cloud backup) | Same | Same |
| Speech for recognition | Google speech service on the phone | **Yes - may be processed by Google** | Google's policy | Not under app control - disclose |
| Exported backup text | Wherever the learner pastes it | Learner's choice | Learner's choice | Learner |

---

## 7. Earning support without charging

The app stays free with no locked features. Ways to ask for support, roughly in order of fit:

1. **In-app Support page (built in 2.8).** Fill in `web/src/support.ts`:
   - **UPI** (best in India - zero fees, one tap: ₹49 / ₹99 / ₹199 buttons are ready),
   - **Buy Me a Coffee / Ko-fi** (cards, international, one-time or monthly),
   - **GitHub Sponsors** (if the code is public).

   Show the page gently: after a 7-day streak, after a level-up, or from Me → Support. Never interrupt a lesson.
2. **Google Play distribution.** Google's Payments policy restricts linking to outside payment methods for digital content inside Play apps. Before publishing on Play, check the current policy. A compliant option is a **"Supporter" in-app product via Google Play Billing** that only unlocks a thank-you badge and an app-icon colour, with no learning features. Keep the UPI/coffee links in the sideloaded APK and on your website.
3. **Supporter perks that don't split learners:** a name in the "Thank you" credits, a supporter badge, early access to new language packs, a voice/theme pack.
4. **Your YouTube channel and community.** Short videos showing the Sound Lab and spectrograms ("see your Japanese pronunciation") are very shareable. Link the app in descriptions and pin a support link.
5. **Grants and partners.** Japan Foundation programmes, the Japanese-language departments of Indian universities, and Japanese-language schools in India (sponsored "powered by" placement in the Resources tab, clearly labelled).
6. **Transparency builds trust.** A simple public page: "This month: ₹X received, spent on Y; next goal: Korean pack".

Before you go live: a payee name that matches your bank details, a support email, a line in the privacy policy that payments are handled by the payment provider, and correct tax treatment of the income.

---

## 8. Release checklist (use before every APK)

- [ ] `npm ci && npm run build` and `./gradlew assembleRelease` from a clean checkout
- [ ] Version bumped in `build.gradle` **and** `changelog.ts`; What's new text checked
- [ ] Smoke test on one Android 13+ and one older phone: TTS, record & compare, Speak aloud, Write, Sound Lab, export/import
- [ ] `npm audit` clean (or known issues noted)
- [ ] APK signed with the **offline** key; SHA-256 of the APK published next to the download
- [ ] Previous APK kept for rollback; git tag `vX.Y` pushed

---

## 9. Action plan

| When | Action |
|---|---|
| This week | Rotate the signing key out of git (Play App Signing if publishing); publish `PRIVACY.md` + `LICENSES.md`; fill `support.ts` |
| This month | GitHub Actions CI (build, lint, `npm audit`); `SECURITY.md`; repo mirror; export-reminder notification; "Report a mistake" button |
| Next quarter | Opt-in crash reporting; optional encrypted cloud backup; native-speaker review of the top 500 words and the sentence bank; second maintainer |
