/** Every handwriting attempt (strokes + accuracy details), stored on the device in IndexedDB. */
export interface WriteRec {
  t: number; ch: string; set: string;
  strokes: number[][];          // each stroke flattened [x0,y0,x1,y1,…] in the 109×109 KanjiVG space
  score: number; shape: number; ink: number; cover: number;
  count: number; expected: number; order: number; dir: number;
}
const DB = "np-writing", STORE = "writes";
let dbp: Promise<IDBDatabase> | null = null;
const db = () => (dbp ||= new Promise((res, rej) => {
  const r = indexedDB.open(DB, 1);
  r.onupgradeneeded = () => r.result.createObjectStore(STORE, { keyPath: "t" });
  r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error);
}));
function tx<T>(mode: IDBTransactionMode, f: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return db().then((d) => new Promise<T>((res, rej) => { const q = f(d.transaction(STORE, mode).objectStore(STORE)); q.onsuccess = () => res(q.result); q.onerror = () => rej(q.error); }));
}
const LS = "np2:writes";
const lsAll = (): WriteRec[] => { try { return JSON.parse(localStorage.getItem(LS) || "[]"); } catch { return []; } };

export async function saveWrite(r: WriteRec) {
  try { await tx("readwrite", (s) => s.put(r)); }
  catch { try { localStorage.setItem(LS, JSON.stringify([...lsAll(), r].slice(-150))); } catch { /* full */ } }
}
export async function allWrites(): Promise<WriteRec[]> {
  let a: WriteRec[] = [];
  try { a = await tx("readonly", (s) => s.getAll() as IDBRequest<WriteRec[]>); } catch { /* ignore */ }
  return [...a, ...lsAll()].sort((x, y) => y.t - x.t);
}
export async function deleteWrite(t: number) {
  try { await tx("readwrite", (s) => s.delete(t)); } catch { /* ignore */ }
  try { localStorage.setItem(LS, JSON.stringify(lsAll().filter((r) => r.t !== t))); } catch { /* ignore */ }
}

/** Start and end point of each template stroke (SVG path geometry). */
export function strokeEnds(paths: string[]): { s: [number, number]; e: [number, number] }[] {
  const ns = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(ns, "svg");
  svg.setAttribute("style", "position:absolute;width:0;height:0;overflow:hidden");
  document.body.appendChild(svg);
  const out = paths.map((d) => {
    const p = document.createElementNS(ns, "path"); p.setAttribute("d", d); svg.appendChild(p);
    const L = p.getTotalLength(), a = p.getPointAtLength(0), b = p.getPointAtLength(L);
    return { s: [a.x, a.y] as [number, number], e: [b.x, b.y] as [number, number] };
  });
  svg.remove();
  return out;
}
