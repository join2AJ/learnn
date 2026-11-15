import type { Word } from "./types";

/** How often a word is used, from per-million counts in ~200,000 everyday Tatoeba sentences. */
export function freqInfo(w: Word) {
  const pm = w.pm ?? 0;
  const level = pm >= 500 ? 5 : pm >= 100 ? 4 : pm >= 20 ? 3 : pm >= 5 ? 2 : 1;
  const label = ["Rare in conversation", "Less common", "Common", "Very common", "Extremely common"][level - 1];
  const hi = ["बातचीत में दुर्लभ", "कम आम", "आम", "बहुत आम", "बेहद आम"][level - 1];
  const oneIn = pm > 0 ? Math.max(1, Math.round(1e6 / pm)) : 0;
  return { level, label, hi, oneIn, pm, rank: w.rank ?? w.n };
}

export function FreqMeter({ w, compact }: { w: Word; compact?: boolean }) {
  const f = freqInfo(w);
  const col = ["var(--ink-3)", "var(--ai)", "var(--matcha)", "var(--gold)", "var(--shu)"][f.level - 1];
  return (
    <span className="row gap6" style={{ alignItems: "center" }} title={f.label}>
      <span style={{ display: "inline-flex", gap: 2, alignItems: "flex-end" }}>
        {[1, 2, 3, 4, 5].map((i) => <i key={i} style={{ display: "block", width: 4, height: 4 + i * 2, borderRadius: 2, background: i <= f.level ? col : "var(--line-2)" }} />)}
      </span>
      <span className="xs" style={{ color: col, fontWeight: 700 }}>{f.label}{!compact && f.oneIn ? <span className="mu" style={{ fontWeight: 500 }}> · about 1 in {f.oneIn.toLocaleString()} words</span> : null}</span>
    </span>
  );
}
