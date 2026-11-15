import { exportAll, getSettings, importAll, setSettings } from "./store";
import { allRecs, b64ToPcm, pcmToB64, putRec } from "./recStore";
import { allWrites, saveWrite, WriteRec } from "./writeStore";
import { contentKeyHex, saveBackupFile, writeCloud } from "./native";
import { APP_VERSION } from "../changelog";

/* ---------- .npbak: Nihongo Path's own encrypted backup format ----------
 * "NPBAK1" header + base64( iv[12] | AES-256-GCM( gzip(JSON) ) ).
 * The key is derived from the app's content key (bound to the official signing certificate),
 * so only the official Nihongo Path app can open a backup - on any phone. */
const MAGIC = "NPBAK1";
async function backupKey(): Promise<CryptoKey> {
  const hex = contentKeyHex();
  if (!hex) throw new Error("Backups can only be opened in the official Nihongo Path app");
  const raw = new Uint8Array(hex.match(/../g)!.map((h) => parseInt(h, 16)));
  const hk = await crypto.subtle.importKey("raw", raw, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const kb = await crypto.subtle.sign("HMAC", hk, new TextEncoder().encode("np-backup-v1"));
  return crypto.subtle.importKey("raw", kb, "AES-GCM", false, ["encrypt", "decrypt"]);
}
async function pipe(data: Uint8Array, t: "gzip" | "gunzip"): Promise<Uint8Array> {
  const CS = (window as unknown as { CompressionStream?: new (f: string) => GenericTransformStream; DecompressionStream?: new (f: string) => GenericTransformStream });
  const Ctor = t === "gzip" ? CS.CompressionStream : CS.DecompressionStream;
  if (!Ctor) return data;
  const stream = new Blob([data]).stream().pipeThrough(new Ctor("gzip") as unknown as TransformStream<Uint8Array, Uint8Array>);
  return new Uint8Array(await new Response(stream).arrayBuffer());
}
const toB64 = (u8: Uint8Array) => { let s = ""; for (let i = 0; i < u8.length; i += 0x8000) s += String.fromCharCode(...u8.subarray(i, i + 0x8000)); return btoa(s); };
const fromB64 = (b: string) => { const s = atob(b.replace(/\s+/g, "")); const u = new Uint8Array(s.length); for (let i = 0; i < s.length; i++) u[i] = s.charCodeAt(i); return u; };
async function seal(json: string): Promise<string> {
  const z = await pipe(new TextEncoder().encode(json), "gzip");
  const flag = new Uint8Array([("CompressionStream" in window) ? 1 : 0]);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv, additionalData: new TextEncoder().encode(MAGIC) }, await backupKey(), z));
  const out = new Uint8Array(1 + 12 + ct.length); out.set(flag, 0); out.set(iv, 1); out.set(ct, 13);
  return MAGIC + "\n" + toB64(out);
}
async function unseal(text: string): Promise<string> {
  const t = text.trim();
  if (!t.startsWith(MAGIC)) return t; // old .json backups still restore
  const raw = fromB64(t.slice(MAGIC.length));
  let pt: ArrayBuffer;
  try { pt = await crypto.subtle.decrypt({ name: "AES-GCM", iv: raw.slice(1, 13), additionalData: new TextEncoder().encode(MAGIC) }, await backupKey(), raw.slice(13)); }
  catch { throw new Error("This backup is damaged or was not made by Nihongo Path"); }
  const u = new Uint8Array(pt);
  return new TextDecoder().decode(raw[0] ? await pipe(u, "gunzip") : u);
}

/** Full backup, sealed in the .npbak format. Recordings/drawings are optional because they can be large. */
export async function buildBackup(media: boolean): Promise<string> { return seal(await buildBackupJson(media)); }
async function buildBackupJson(media: boolean): Promise<string> {
  const base = JSON.parse(exportAll());
  const out: Record<string, unknown> = { app: "nihongo-path", version: APP_VERSION, created: new Date().toISOString(), ...base };
  if (media) {
    out.recordings = (await allRecs()).map((r) => ({ ...r, pcm: pcmToB64(r.pcm) }));
    out.writes = await allWrites();
  }
  return JSON.stringify(out);
}

export async function restoreBackup(text: string): Promise<{ recordings: number; writes: number }> {
  const d = JSON.parse(await unseal(text));
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
  const name = `nihongo-path-backup-${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}-${z(d.getHours())}${z(d.getMinutes())}.npbak`;
  const data = await buildBackup(media);
  const where = saveBackupFile(name, data);
  if (where.startsWith("error:")) throw new Error(where.slice(6));
  if (getSettings().backup.cloud) { const r = writeCloud(data); if (r !== "ok" && r !== "none") console.warn("cloud backup", r); }
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

export function backupName() {
  const d = new Date(), z = (n: number) => String(n).padStart(2, "0");
  return `nihongo-path-backup-${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}.npbak`;
}
