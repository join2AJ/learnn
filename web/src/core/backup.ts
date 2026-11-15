import { exportAll, getSettings, importAll, setSettings } from "./store";
import { allRecs, b64ToPcm, pcmToB64, putRec } from "./recStore";
import { allWrites, saveWrite, WriteRec } from "./writeStore";
import { saveBackupFile } from "./native";
import { APP_VERSION } from "../changelog";

/** Full backup as JSON text. Recordings/drawings are optional because they can be large. */
export async function buildBackup(media: boolean): Promise<string> {
  const base = JSON.parse(exportAll());
  const out: Record<string, unknown> = { app: "nihongo-path", version: APP_VERSION, created: new Date().toISOString(), ...base };
  if (media) {
    out.recordings = (await allRecs()).map((r) => ({ ...r, pcm: pcmToB64(r.pcm) }));
    out.writes = await allWrites();
  }
  return JSON.stringify(out);
}

export async function restoreBackup(text: string): Promise<{ recordings: number; writes: number }> {
  const d = JSON.parse(text);
  if (!d.settings && !d.progress) throw new Error("Not a Nihongo Path backup");
  const keepBackup = getSettings().backup;
  importAll(JSON.stringify({ settings: d.settings, progress: d.progress }));
  setSettings({ backup: { ...keepBackup, ...(d.settings?.backup || {}) } });
  let recordings = 0, writes = 0;
  for (const r of d.recordings || []) { await putRec({ ...r, pcm: b64ToPcm(r.pcm) }); recordings++; }
  for (const w of (d.writes || []) as WriteRec[]) { await saveWrite(w); writes++; }
  return { recordings, writes };
}

/** Writes a backup file now. Returns the file location (or throws). */
export async function backupNow(media = getSettings().backup.media): Promise<string> {
  const d = new Date(), z = (n: number) => String(n).padStart(2, "0");
  const name = `nihongo-path-backup-${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}-${z(d.getHours())}${z(d.getMinutes())}.json`;
  const where = saveBackupFile(name, await buildBackup(media));
  if (where.startsWith("error:")) throw new Error(where.slice(6));
  setSettings({ backup: { ...getSettings().backup, last: Date.now(), where } });
  return where;
}

/** Most recent scheduled time at or before now (for daily / weekly schedules). */
function lastSlot(b: ReturnType<typeof getSettings>["backup"], now = new Date()) {
  const t = new Date(now); t.setHours(b.hour, b.minute, 0, 0);
  if (b.auto === "daily") { if (t > now) t.setDate(t.getDate() - 1); return t.getTime(); }
  const jsDay = (b.weekday - 1 + 7) % 7; // Calendar.SUNDAY=1 → JS 0
  t.setDate(t.getDate() - ((t.getDay() - jsDay + 7) % 7));
  if (t > now) t.setDate(t.getDate() - 7);
  return t.getTime();
}
/** True when a scheduled backup is due (missed slot since the last backup). */
export function backupDue() {
  const b = getSettings().backup;
  if (b.auto === "off") return false;
  return b.last < lastSlot(b);
}
export function nextBackupText() {
  const b = getSettings().backup;
  if (b.auto === "off") return "";
  const t = new Date(lastSlot(b)); t.setDate(t.getDate() + (b.auto === "daily" ? 1 : 7));
  return t.toLocaleString(undefined, { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}
