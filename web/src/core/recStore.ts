/**
 * Saves the audio of every voice recording on the device (IndexedDB), downsampled to
 * 16 kHz 16-bit mono (~32 KB per second), so learners can replay and re-analyse them.
 */
const DB = "np-recordings", STORE = "recs", SR = 16000;

export interface StoredRec { t: number; w: string; sr: number; pcm: ArrayBuffer; contour: number[]; }

let dbp: Promise<IDBDatabase> | null = null;
function db(): Promise<IDBDatabase> {
  if (!dbp) dbp = new Promise((res, rej) => {
    const r = indexedDB.open(DB, 1);
    r.onupgradeneeded = () => r.result.createObjectStore(STORE, { keyPath: "t" });
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  });
  return dbp;
}
function tx<T>(mode: IDBTransactionMode, f: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return db().then((d) => new Promise<T>((res, rej) => {
    const q = f(d.transaction(STORE, mode).objectStore(STORE));
    q.onsuccess = () => res(q.result);
    q.onerror = () => rej(q.error);
  }));
}

export function encode(x: Float32Array, sr: number): ArrayBuffer {
  const n = Math.floor((x.length * SR) / sr);
  const out = new Int16Array(n);
  for (let i = 0; i < n; i++) {
    const p = (i * sr) / SR, k = Math.floor(p), f = p - k;
    const v = (x[k] || 0) * (1 - f) + (x[k + 1] || 0) * f;
    out[i] = Math.max(-32768, Math.min(32767, Math.round(v * 32767)));
  }
  return out.buffer;
}
export function decode(r: StoredRec): Float32Array {
  const a = new Int16Array(r.pcm), out = new Float32Array(a.length);
  for (let i = 0; i < a.length; i++) out[i] = a[i] / 32768;
  return out;
}

/* Fallback when IndexedDB is unavailable: localStorage, base64 at 8 kHz. */
const LK = (t: number) => "np2:rec:" + t;
function b64(buf: ArrayBuffer) { let s = ""; const u = new Uint8Array(buf); for (let i = 0; i < u.length; i += 0x8000) s += String.fromCharCode(...u.subarray(i, i + 0x8000)); return btoa(s); }
function unb64(s: string) { const b = atob(s); const u = new Uint8Array(b.length); for (let i = 0; i < b.length; i++) u[i] = b.charCodeAt(i); return u.buffer; }
function lsSave(t: number, w: string, x: Float32Array, sr: number, contour: number[]) {
  const pcm = encode(x, sr), half = new Int16Array(pcm).filter((_, i) => i % 2 === 0);
  try { localStorage.setItem(LK(t), JSON.stringify({ t, w, sr: SR / 2, pcm: b64(half.buffer), contour })); return true; } catch { return false; }
}
function lsGet(t: number): StoredRec | undefined {
  try { const v = localStorage.getItem(LK(t)); if (!v) return undefined; const o = JSON.parse(v); return { ...o, pcm: unb64(o.pcm) }; } catch { return undefined; }
}

/** Saves the audio; returns true when it is stored somewhere. */
export async function saveRec(t: number, w: string, x: Float32Array, sr: number, contour: number[]): Promise<boolean> {
  try { await tx("readwrite", (s) => s.put({ t, w, sr: SR, pcm: encode(x, sr), contour } as StoredRec)); return true; }
  catch { return lsSave(t, w, x, sr, contour); }
}
export async function getRec(t: number): Promise<StoredRec | undefined> {
  let r: StoredRec | undefined;
  try { r = await tx("readonly", (s) => s.get(t) as IDBRequest<StoredRec | undefined>); } catch { /* fall through */ }
  return r || lsGet(t);
}
export async function allRecs(): Promise<StoredRec[]> { try { return await tx("readonly", (s) => s.getAll() as IDBRequest<StoredRec[]>); } catch { return []; } }
export async function putRec(r: StoredRec) { try { await tx("readwrite", (s) => s.put(r)); } catch { /* ignore */ } }
export const pcmToB64 = (b: ArrayBuffer) => b64(b);
export const b64ToPcm = (s: string) => unb64(s);
export async function deleteRec(t: number) { try { await tx("readwrite", (s) => s.delete(t)); } catch { /* ignore */ } try { localStorage.removeItem(LK(t)); } catch { /* ignore */ } }
export async function savedKeys(): Promise<Set<number>> {
  const out = new Set<number>();
  try { ((await tx("readonly", (s) => s.getAllKeys())) as number[]).forEach((k) => out.add(k)); } catch { /* ignore */ }
  try { for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i) || ""; if (k.startsWith("np2:rec:")) out.add(+k.slice(8)); } } catch { /* ignore */ }
  return out;
}
