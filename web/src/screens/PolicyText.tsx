import { CONTACT } from "../support";

/** The privacy policy. Same text as docs/PRIVACY.md (keep both in sync). */
export default function PolicyText() {
  const contact = CONTACT.email ? <a href={"mailto:" + CONTACT.email}>{CONTACT.email}</a> : <i>(contact email to be added by the developer)</i>;
  const H = ({ children }: { children: React.ReactNode }) => <h3 style={{ margin: "18px 0 6px", fontSize: 16 }}>{children}</h3>;
  return (
    <div className="prose sm" style={{ lineHeight: 1.65 }}>
      <p><b>Nihongo Path - Privacy Policy</b><br /><span className="mu">Last updated: {CONTACT.policyUpdated}</span></p>
      <p>Nihongo Path helps you learn Japanese. We built it so that <b>your data stays on your phone</b>. There is no account, no server, no advertising and no tracking.</p>
      <H>1. Who is responsible</H>
      <p>{CONTACT.developer} is the data fiduciary (India, DPDP Act 2023) and controller (EU GDPR) for how the app handles personal data. Grievance officer: {CONTACT.grievanceOfficer || <i>(name to be added)</i>} - {contact}.</p>
      <H>2. What the app stores - only on your phone</H>
      <ul>
        <li>Profile you enter: name, optional age range, reasons for learning, daily goal, pledge, personal goal.</li>
        <li>Learning progress: XP, streaks, words known, quiz answers, study time per section.</li>
        <li>Voice recordings you make (sound + pronunciation analysis) and handwriting you draw (strokes + scores).</li>
        <li>Settings and backup preferences.</li>
      </ul>
      <p>The developer never receives this data. It is kept in the app’s private storage until you delete it or uninstall the app.</p>
      <H>3. Why</H>
      <p>Only to run the app for you: show your progress, schedule reviews, give pronunciation and handwriting feedback, and back up your data when you ask. Your voice is used for <b>feedback only</b> - never to identify you.</p>
      <H>4. What leaves your phone</H>
      <ul>
        <li><b>Speech recognition</b> (Speak aloud, word check) uses your phone’s speech service (usually Google), which may process audio on Google’s servers under Google’s privacy policy.</li>
        <li><b>Links</b> to YouTube and websites open in your browser or the YouTube app.</li>
        <li><b>Backups</b> you save go to your phone’s Downloads folder; you choose whether to copy them elsewhere. Android cloud backup may include progress and settings, never recordings or drawings.</li>
        <li><b>Support payments</b> (optional) are handled entirely by the payment app you choose (UPI, Buy Me a Coffee, Ko-fi); the app does not see payment details.</li>
      </ul>
      <H>5. Your consent and your rights</H>
      <p>You agree to this policy when you set up the app, and you can withdraw consent at any time by deleting your data. You can <b>see</b> your data in the app, <b>export</b> it (Settings → Backup), <b>correct</b> it (Settings), and <b>erase</b> it (Settings → Privacy → Delete). For any request or complaint, contact the grievance officer above; in India you may also approach the Data Protection Board of India, and in the EU your data protection authority.</p>
      <H>6. Children</H>
      <p>Learners under 18 need a parent or guardian’s consent to use voice recording. Without it the app runs in <b>child mode</b>: pronunciation analysis works but recordings and drawings are not saved, and support/payment links are hidden. The app never shows ads or tracks behaviour.</p>
      <H>7. Security</H>
      <p>Data stays in private app storage; the app uses no server and blocks unencrypted network traffic. Anyone with access to your unlocked phone may see your progress - use your phone’s screen lock.</p>
      <H>8. Changes</H>
      <p>If this policy changes, the app shows the new version after an update.</p>
    </div>
  );
}
