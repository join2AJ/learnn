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

export async function saveRec(t: number, w: string, x: Float32Array, sr: number, contour: number[]) {
  try { await tx("readwrite", (s) => s.put({ t, w, sr: SR, pcm: encode(x, sr), contour } as StoredRec)); } catch { /* storage unavailable */ }
}
export async function getRec(t: number): Promise<StoredRec | undefined> {
  try { return await tx("readonly", (s) => s.get(t) as IDBRequest<StoredRec | undefined>); } catch { return undefined; }
}
export async function deleteRec(t: number) { try { await tx("readwrite", (s) => s.delete(t)); } catch { /* ignore */ } }
export async function savedKeys(): Promise<Set<number>> {
  try { return new Set((await tx("readonly", (s) => s.getAllKeys())) as number[]); } catch { return new Set(); }
}
