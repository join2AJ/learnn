/** Wipes everything the app stores on this phone: progress, settings, voice recordings and drawings. */
export async function deleteAllData() {
  const dbs = ["np-recordings", "np-writing"];
  await Promise.all(dbs.map((n) => new Promise<void>((res) => { try { const r = indexedDB.deleteDatabase(n); r.onsuccess = r.onerror = r.onblocked = () => res(); } catch { res(); } })));
  try {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i) || ""; if (k.startsWith("np2:")) keys.push(k); }
    keys.forEach((k) => localStorage.removeItem(k));
  } catch { /* ignore */ }
}
/** Deletes only the saved voice recordings and drawings (keeps progress and settings). */
export async function deleteMedia() {
  await Promise.all(["np-recordings", "np-writing"].map((n) => new Promise<void>((res) => { try { const r = indexedDB.deleteDatabase(n); r.onsuccess = r.onerror = r.onblocked = () => res(); } catch { res(); } })));
  try {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i) || ""; if (k.startsWith("np2:rec:") || k === "np2:writes") keys.push(k); }
    keys.forEach((k) => localStorage.removeItem(k));
  } catch { /* ignore */ }
}
