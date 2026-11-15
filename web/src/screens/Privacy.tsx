import { useState } from "react";
import { Download, HardDrive, Mic, ShieldCheck, Trash2, Wifi } from "lucide-react";
import { go } from "../core/router";
import { deleteAllData, deleteMedia } from "../core/privacy";
import { updateProgress, toast } from "../core/store";
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
      <div className="xs mu mt12" style={{ lineHeight: 1.5 }}>Uninstalling the app also deletes all of its data. Questions: contact the developer listed on the download page.</div>
    </div>
  );
}
