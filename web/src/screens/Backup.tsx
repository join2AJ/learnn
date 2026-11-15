import { useRef, useState } from "react";
import { Clock, Download, FileUp, HardDriveDownload } from "lucide-react";
import { setSettings, toast, useSettings } from "../core/store";
import { backupNow, buildBackup, nextBackupText, restoreBackup } from "../core/backup";
import { cancelBackupReminder, nativeBackup, scheduleBackupReminder } from "../core/native";
import { Header, Seg, Switch, tap } from "../ui/kit";

const DAYS: [number, string][] = [[2, "Mon"], [3, "Tue"], [4, "Wed"], [5, "Thu"], [6, "Fri"], [7, "Sat"], [1, "Sun"]];

/** Back up to a file, restore from a file, and schedule automatic backups. */
export default function Backup() {
  const s = useSettings();
  const b = s.backup;
  const [busy, setBusy] = useState(false);
  const [text, setText] = useState("");
  const fileIn = useRef<HTMLInputElement>(null);
  const set = (p: Partial<typeof b>) => {
    const nb = { ...b, ...p };
    setSettings({ backup: nb });
    if (nb.auto === "off") cancelBackupReminder();
    else scheduleBackupReminder(nb.hour, nb.minute, nb.auto === "daily" ? -1 : nb.weekday);
  };
  const now = async () => {
    tap(); setBusy(true);
    try { const where = await backupNow(); toast("Backup saved to " + where, "ok"); }
    catch (e) { toast("Backup failed: " + (e as Error).message, "warn"); }
    setBusy(false);
  };
  const restoreText = async (t: string) => {
    try { const r = await restoreBackup(t); toast("Restored progress" + (r.recordings ? `, ${r.recordings} recordings` : "") + (r.writes ? `, ${r.writes} drawings` : ""), "ok"); }
    catch (e) { toast("That file is not a valid backup: " + (e as Error).message, "warn"); }
  };
  const pickFile = async (f?: File) => { if (f) await restoreText(await f.text()); if (fileIn.current) fileIn.current.value = ""; };
  const time = String(b.hour).padStart(2, "0") + ":" + String(b.minute).padStart(2, "0");

  return (
    <div className="screen">
      <Header title="Backup & restore" sub="Keep your progress safe" backTo="/me/settings" />

      <div className="card hero tint-ai">
        <HardDriveDownload size={28} />
        <div style={{ fontWeight: 800, fontSize: 18, marginTop: 6 }}>Back up now</div>
        <div className="sm mu mt4">{nativeBackup() ? "Saves a file to Downloads/NihongoPath on your phone. It stays there even if you uninstall the app - you can also copy it to Google Drive." : "Downloads a backup file."}</div>
        <div className="row mt12"><span className="sm grow">Include voice recordings & drawings (bigger file)</span><Switch on={b.media} onChange={(v) => set({ media: v })} /></div>
        <button className="btn white block mt12" disabled={busy} onClick={now}><Download size={17} /> {busy ? "Saving…" : "Save backup file"}</button>
        <div className="xs mu mt8">{b.last ? "Last backup: " + new Date(b.last).toLocaleString() + (b.where ? " · " + b.where : "") : "No backup yet"}</div>
      </div>

      <div className="section-title"><h2>Automatic backup</h2>{b.auto !== "off" && <span className="mu">next ≈ {nextBackupText()}</span>}</div>
      <div className="card">
        <Seg value={b.auto} options={[["off", "Off"], ["daily", "Every day"], ["weekly", "Every week"]]} onChange={(v) => set({ auto: v })} />
        {b.auto !== "off" && (<>
          <div className="row mt12"><Clock size={18} className="mu" /><span className="sm grow" style={{ fontWeight: 600 }}>Time</span>
            <input type="time" value={time} onChange={(e) => { const [h, m] = e.target.value.split(":").map(Number); if (!isNaN(h)) set({ hour: h, minute: m || 0 }); }}
              style={{ height: 40, borderRadius: 12, border: 0, background: "var(--surface-2)", color: "var(--ink)", padding: "0 10px", fontSize: 15 }} /></div>
          {b.auto === "weekly" && <div className="row wrap gap6 mt12">{DAYS.map(([d, l]) => <button key={d} className={"chip" + (b.weekday === d ? " shu on" : "")} onClick={() => set({ weekday: d })}>{l}</button>)}</div>}
          <div className="xs mu mt12" style={{ lineHeight: 1.5 }}>At that time you’ll get a notification - tap it and the backup is saved. If the app is opened after a missed time, it backs up automatically. (Android doesn’t let apps read your learning data in the background, so the app must open for a moment.)</div>
        </>)}
      </div>

      <div className="section-title"><h2>Restore</h2></div>
      <div className="card">
        <input ref={fileIn} type="file" accept=".json,application/json" style={{ display: "none" }} onChange={(e) => pickFile(e.target.files?.[0])} />
        <button className="btn block" onClick={() => fileIn.current?.click()}><FileUp size={17} /> Restore from a backup file</button>
        <div className="xs mu mt8">Pick a <b>nihongo-path-backup-….json</b> file (e.g. from Downloads/NihongoPath). This replaces the current progress.</div>
        <div className="divider" />
        <div className="sm" style={{ fontWeight: 700 }}>Or copy / paste as text</div>
        <div className="row mt8">
          <button className="btn sm grow" onClick={async () => { const t = await buildBackup(false); setText(t); try { await navigator.clipboard.writeText(t); toast("Backup copied", "ok"); } catch { toast("Select and copy the text below"); } }}>Copy backup text</button>
          <button className="btn sm grow" disabled={!text.trim()} onClick={() => restoreText(text)}>Restore from text</button>
        </div>
        <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Paste a backup here to restore" style={{ width: "100%", minHeight: 64, marginTop: 10, borderRadius: 12, border: 0, boxShadow: "inset 0 0 0 1px var(--line)", background: "var(--surface-2)", color: "var(--ink)", padding: 10, fontSize: 11, fontFamily: "monospace" }} />
      </div>
    </div>
  );
}
