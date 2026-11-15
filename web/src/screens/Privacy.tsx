import { useState } from "react";
import { Download, HardDrive, Mic, ShieldCheck, Trash2, Wifi } from "lucide-react";
import { go } from "../core/router";
import { deleteAllData, deleteMedia } from "../core/privacy";
import { dayKey, setSettings, updateProgress, toast, useSettings } from "../core/store";
import { CONTACT } from "../support";
import { childMode } from "../core/child";
import { Header } from "../ui/kit";

/** Plain-language data notice + controls (ISO 27001 / DPDP-style transparency). */
export default function Privacy() {
  const [confirm, setConfirm] = useState<"" | "media" | "all">("");
  const Row = ({ icon, t, d }: { icon: React.ReactNode; t: string; d: React.ReactNode }) => (
    <div className="li" style={{ alignItems: "flex-start" }}><span className="ico soft-ai" style={{ color: "var(--ai)" }}>{icon}</span><span className="grow"><div className="t">{t}</div><div className="d">{d}</div></span></div>
  );
  return (
    <div className="screen">
      <Header title="Privacy & your data" sub="What the app keeps, where, and how to delete it" backTo="/me/settings" />
      <div className="card soft-matcha" style={{ boxShadow: "none" }}>
        <div className="row top" style={{ gap: 10 }}><ShieldCheck size={22} color="var(--matcha)" /><div className="sm" style={{ lineHeight: 1.6 }}><b>No account, no ads, no tracking.</b> Nihongo Path has no server. Everything you do stays on this phone unless you export it yourself.</div></div>
      </div>
      <ChildStatus />
      <button className="card tap mt12" onClick={() => go("/me/policy")}><div className="row"><ShieldCheck size={20} color="var(--ai)" /><div className="grow"><div style={{ fontWeight: 800 }}>Read the full privacy policy</div><div className="xs mu">Your rights under India’s DPDP Act and the EU GDPR</div></div></div></button>
      <div className="list mt12">
        <Row icon={<HardDrive size={19} />} t="Stored on this phone only" d="Your name, age range, reasons, pledge, progress, XP, study time, voice recordings (sound + analysis) and drawings. Kept in the app’s private storage." />
        <Row icon={<Wifi size={19} />} t="What leaves the phone" d={<>Only when you use them: <b>speech recognition</b> (Speak aloud, word check) is done by your phone’s Google speech service, which may send audio to Google. <b>Links</b> to YouTube and websites open in your browser. Text-to-speech uses your phone’s voice engine.</>} />
        <Row icon={<Mic size={19} />} t="Microphone" d="Used only while you press a record button or run the Sound Lab. Nothing is recorded in the background." />
        <Row icon={<HardDrive size={19} />} t="Phone backups" d="If Android backup is on, your progress and settings can be restored on a new phone. Voice recordings and drawings are never included in cloud backups." />
      </div>
      <div className="section-title"><h2>Delete</h2></div>
      <button className="card tap soft-ai" style={{ boxShadow: "none", marginBottom: 12 }} onClick={() => go("/me/backup")}>
        <div className="row"><Download size={20} color="var(--ai)" /><div className="grow"><div style={{ fontWeight: 800 }}>Back up first</div><div className="xs mu">Save your progress to a file before deleting anything</div></div></div>
      </button>
      <div className="card">
        {confirm === "media" ? (
          <div className="col"><div className="sm" style={{ fontWeight: 700 }}>Delete every voice recording and drawing?</div><div className="row"><button className="btn grow" onClick={() => setConfirm("")}>Cancel</button><button className="btn grow" style={{ background: "var(--shu)", color: "#fff" }} onClick={async () => { await deleteMedia(); updateProgress((p) => { p.voiceLog = []; p.writeLog = {}; }); setConfirm(""); toast("Recordings and drawings deleted", "ok"); }}>Yes, delete</button></div></div>
        ) : <button className="btn block" style={{ whiteSpace: "normal", height: "auto", minHeight: 46, padding: "10px 14px" }} onClick={() => setConfirm("media")}><Trash2 size={16} /> Delete recordings & drawings</button>}
        <div className="divider" />
        {confirm === "all" ? (
          <div><div className="sm" style={{ fontWeight: 700, color: "var(--shu)" }}>This erases everything - progress, XP, pledge, recordings, drawings, settings. It can’t be undone. Export a backup first if you might want it.</div>
            <div className="row mt12"><button className="btn grow" onClick={() => setConfirm("")}>Cancel</button><button className="btn grow" style={{ background: "var(--shu)", color: "#fff" }} onClick={async () => { await deleteAllData(); location.hash = "#/"; location.reload(); }}>Yes, erase</button></div></div>
        ) : <button className="btn ghost block" style={{ color: "var(--shu)", whiteSpace: "normal", height: "auto", minHeight: 46, padding: "10px 14px" }} onClick={() => setConfirm("all")}><Trash2 size={16} /> Delete ALL my data</button>}
      </div>
      <div className="section-title"><h2>Grievance contact</h2></div>
      <div className="card sm" style={{ lineHeight: 1.6 }}>
        <div><b>Grievance officer:</b> {CONTACT.grievanceOfficer || "to be added"}</div>
        <div><b>Email:</b> {CONTACT.email ? <a href={"mailto:" + CONTACT.email}>{CONTACT.email}</a> : "to be added"}</div>
        <div className="xs mu mt4">For access, correction, deletion or complaints. In India you can also approach the Data Protection Board of India.</div>
      </div>
      <div className="xs mu mt12" style={{ lineHeight: 1.5 }}>Uninstalling the app also deletes all of its data.</div>
    </div>
  );
}

/** Parent / guardian consent form (DPDP §9, GDPR Art. 8). */
export function ParentConsent({ onDone }: { onDone?: () => void }) {
  const [name, setName] = useState("");
  const [ok, setOk] = useState(false);
  return (
    <div className="card mt12">
      <div className="sm" style={{ lineHeight: 1.6 }}><b>Parent or guardian:</b> Nihongo Path stores the learner’s progress, voice recordings and handwriting <b>only on this phone</b>. Nothing is sent to the developer. Speech recognition may use the phone’s Google service. There are no ads and no tracking.</div>
      <input type="text" className="mt12" value={name} onChange={(e) => setName(e.target.value)} placeholder="Parent / guardian name" />
      <label className="row top mt12 sm" style={{ gap: 10, lineHeight: 1.5 }}>
        <input type="checkbox" checked={ok} onChange={(e) => setOk(e.target.checked)} style={{ width: 20, height: 20, marginTop: 2, accentColor: "var(--shu)" }} />
        <span>I am this learner’s parent or legal guardian and I agree to the privacy policy, including saving voice recordings on this phone.</span>
      </label>
      <button className="btn primary block mt12" disabled={!ok || name.trim().length < 2} onClick={() => { setSettings({ parentConsent: { name: name.trim(), date: dayKey() } }); toast("Thank you - parent consent saved", "ok"); onDone?.(); }}>Parent agrees</button>
    </div>
  );
}

function ChildStatus() {
  const s = useSettings();
  if (!s.minor) return null;
  if (!childMode()) return (
    <div className="card mt12 soft-matcha" style={{ boxShadow: "none" }}><div className="sm"><b>Parent consent given</b> by {s.parentConsent!.name} on {s.parentConsent!.date}.</div>
      <button className="btn sm mt8" onClick={() => setSettings({ parentConsent: null })}>Withdraw consent (switch to child mode)</button></div>
  );
  return (
    <div className="mt12">
      <div className="card soft-gold" style={{ boxShadow: "none" }}><div className="sm" style={{ lineHeight: 1.55 }}><b>Child mode is on.</b> Voice recordings and drawings are analysed but not saved, and support links are hidden. A parent or guardian can agree below to turn on saving.</div></div>
      <ParentConsent />
    </div>
  );
}
