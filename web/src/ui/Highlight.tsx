import type { Word } from "../core/types";

/** Candidate surface forms of a word inside a sentence: as written, reading, and conjugation stems. */
function forms(w: Word): string[] {
  const out = new Set<string>([w.w, w.r]);
  const stem = (s: string, n: number) => (s.length > n ? s.slice(0, s.length - n) : "");
  if (w.t === "verb") {
    for (const s of [w.w, w.r]) {
      if (s.endsWith("する")) out.add(stem(s, 2) + "し").add(stem(s, 2) + "さ").add(stem(s, 2));
      else if (s.length >= 2) out.add(stem(s, 1));          // 食べ(る), 書(く) → covers ます/た/ない forms
    }
  }
  if (w.t === "i-adj") for (const s of [w.w, w.r]) if (s.endsWith("い") && s.length >= 2) out.add(stem(s, 1));
  return [...out].filter((f) => f && (f.length >= 2 || /[㐀-鿿]/.test(f))).sort((a, b) => b.length - a.length);
}

/** Splits text around the first match of any candidate (plus following kana for conjugations). */
function split(text: string, cands: string[], extendKana: boolean): [string, string, string] | null {
  for (const c of cands) {
    const i = text.indexOf(c);
    if (i < 0) continue;
    let end = i + c.length;
    if (extendKana) while (end < text.length && /[ぁ-ゖ]/.test(text[end]) && end - i < c.length + 3 && !"はがをにでへとものやかね、。".includes(text[end])) end++;
    return [text.slice(0, i), text.slice(i, end), text.slice(end)];
  }
  return null;
}

const MARK = { color: "var(--shu)", fontWeight: 800, background: "var(--shu-soft)", borderRadius: 5, padding: "0 2px" };

/** Example sentence with the studied word highlighted. */
export function HlJp({ text, word }: { text: string; word: Word }) {
  const p = split(text, forms(word), word.t === "verb" || word.t === "i-adj");
  if (!p) return <>{text}</>;
  return <>{p[0]}<mark style={MARK}>{p[1]}</mark>{p[2]}</>;
}

/** Romaji line with the word's romaji highlighted (ignoring spaces). */
export function HlRo({ text, word }: { text: string; word: Word }) {
  const ro = word.ro.replace(/\s+/g, "").toLowerCase();
  const key = word.t === "verb" ? ro.slice(0, Math.max(2, ro.length - 2)) : word.t === "i-adj" ? ro.slice(0, Math.max(2, ro.length - 1)) : ro;
  if (key.length < 2) return <>{text}</>;
  // map positions in the space-less string back to the original text
  const idx: number[] = []; let flat = "";
  for (let i = 0; i < text.length; i++) if (text[i] !== " ") { idx.push(i); flat += text[i].toLowerCase(); }
  const at = flat.indexOf(key);
  if (at < 0) return <>{text}</>;
  const a = idx[at], b = idx[Math.min(idx.length - 1, at + key.length - 1)] + 1;
  return <>{text.slice(0, a)}<mark style={{ ...MARK, fontWeight: 700 }}>{text.slice(a, b)}</mark>{text.slice(b)}</>;
}
