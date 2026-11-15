import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import { setSettings, useSettings } from "../core/store";
import { MINOR_AGES } from "../core/child";
import PolicyReader from "./PolicyReader";

/** One-time notice for learners who set up the app before the privacy policy existed. */
export default function PrivacyNotice() {
  const s = useSettings();
  const [ok, setOk] = useState(false);
  const [open, setOpen] = useState(false);
  const [read, setRead] = useState(false);
  const minor = MINOR_AGES.includes(s.age);
  return (
    <>
      <div className="scrim" style={{ zIndex: 97 }} />
      <div className="modal" style={{ zIndex: 98, textAlign: "left" }} role="dialog" aria-label="Privacy notice">
        <div className="row"><span style={{ width: 44, height: 44, borderRadius: 14, display: "grid", placeItems: "center", background: "var(--matcha-soft)", color: "var(--matcha)" }}><ShieldCheck size={22} /></span><h2 style={{ margin: 0, fontSize: 20 }}>Your privacy</h2></div>
        <p className="sm" style={{ lineHeight: 1.6 }}>Nihongo Path keeps your profile, progress, voice recordings and drawings <b>only on this phone</b>. No account, no ads, no tracking. Speech recognition may use your phone’s Google service. You can export or delete everything in Settings → Privacy.</p>
        {minor && <p className="sm" style={{ lineHeight: 1.5, background: "var(--gold-soft)", padding: "8px 10px", borderRadius: 10 }}>You told us you are under 18. Until a parent agrees (Settings → Privacy), the app runs in <b>child mode</b>: recordings and drawings aren’t saved.</p>}
        <button className="sm" style={{ color: "var(--shu)", fontWeight: 700, textDecoration: "underline" }} onClick={() => setOpen(true)}>{read ? "✓ Policy read - open again" : "Read the full privacy policy (needed to continue)"}</button>
        <label className="row top mt12 sm" style={{ gap: 10 }}><input type="checkbox" checked={ok} onChange={(e) => { if (!read) { setOpen(true); return; } setOk(e.target.checked); }} style={{ width: 20, height: 20, accentColor: "var(--shu)" }} /><span>I understand and agree.</span></label>
        <button className="btn primary block mt12" disabled={!ok} onClick={() => setSettings({ privacyOk: true, minor })}>Continue</button>
      </div>
      <PolicyReader open={open} onClose={() => setOpen(false)} onRead={() => setRead(true)} />
    </>
  );
}
