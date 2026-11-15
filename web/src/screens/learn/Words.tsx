import { useMemo, useState } from "react";
import { Check, Repeat, Search } from "lucide-react";
import { go } from "../../core/router";
import { updateProgress, useProgress, useSettings } from "../../core/store";
import { award } from "../../core/rewards";
import { usePack } from "../../pack";
import { Header, Say, tap } from "../../ui/kit";
import { RecBtn } from "../../ui/VoiceCompare";

const TIERS: [string, number, number][] = [["All", 1, 1000], ["1–100", 1, 100], ["101–300", 101, 300], ["301–600", 301, 600], ["601–1000", 601, 1000]];
const TYPE_COL: Record<string, string> = { verb: "var(--ai)", noun: "var(--matcha)", "i-adj": "var(--gold)", "na-adj": "var(--gold)", adverb: "var(--shu)", pron: "var(--plum)", num: "var(--ai)" };

/** Estimated share of everyday speech covered by the top-n words (fit through 100→65%, 1000→82%). */
export const coverage = (n: number) => (n <= 0 ? 0 : Math.max(0, Math.min(92, 31 + 7.38 * Math.log(n))));

export function CoverageChart({ known }: { known: number }) {
  const W = 320, H = 120, pad = 26;
  const xs = (n: number) => pad + (Math.log10(Math.max(1, n)) / 3) * (W - pad - 8);
  const ys = (c: number) => H - 18 - (c / 100) * (H - 30);
  const pts = Array.from({ length: 60 }, (_, i) => { const n = Math.pow(10, (i / 59) * 3); return [xs(n), ys(coverage(n))]; });
  const d = "M" + pts.map((p) => p.map((v) => v.toFixed(1)).join(",")).join("L");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" className="chart" role="img" aria-label="Coverage curve">
      {[0, 50, 100].map((c) => <g key={c}><line x1={pad} x2={W - 8} y1={ys(c)} y2={ys(c)} stroke="var(--line)" /><text x={2} y={ys(c) + 3}>{c}%</text></g>)}
      {[1, 10, 100, 1000].map((n) => <text key={n} x={xs(n)} y={H - 4} textAnchor={n === 1000 ? "end" : n === 1 ? "start" : "middle"}>{n}</text>)}
      <path d={d + `L${xs(1000)},${ys(0)}L${xs(1)},${ys(0)}Z`} fill="var(--shu-soft)" />
      <path d={d} fill="none" stroke="var(--shu)" strokeWidth="2.5" />
      {known > 0 && <g><line x1={xs(known)} x2={xs(known)} y1={ys(0)} y2={ys(coverage(known))} stroke="var(--ink)" strokeDasharray="3 3" /><circle cx={xs(known)} cy={ys(coverage(known))} r="5" fill="var(--ink)" /><text x={Math.min(W - 60, xs(known) + 6)} y={ys(coverage(known)) - 6} style={{ fill: "var(--ink)", fontWeight: 700 }}>you: {Math.round(coverage(known))}%</text></g>}
    </svg>
  );
}

export default function Words() {
  const pk = usePack();
  const s = useSettings();
  const p = useProgress();
  const known = useMemo(() => new Set(p.known), [p.known]);
  const [q, setQ] = useState("");
  const [tier, setTier] = useState(0);
  const [type, setType] = useState("All");
  const [hideKnown, setHideKnown] = useState(false);
  const [limit, setLimit] = useState(30);
  const types = useMemo(() => ["All", ...Array.from(new Set(pk.words.map((w) => w.t)))], [pk]);
  const list = useMemo(() => {
    const t = q.trim().toLowerCase();
    const [, a, b] = TIERS[tier];
    return pk.words.filter((w) => w.n >= a && w.n <= b && (type === "All" || w.t === type) && (!hideKnown || !known.has(w.n)) &&
      (!t || [w.w, w.r, w.ro, w.m, w.h, w.s, w.st].some((x) => (x || "").toLowerCase().includes(t))));
  }, [q, tier, type, hideKnown, known, pk]);

  const toggle = (n: number) => {
    tap();
    const was = known.has(n);
    if (was) updateProgress((x) => { x.known = x.known.filter((k) => k !== n); });
    else award(2, (x) => { if (!x.known.includes(n)) x.known.push(n); });
  };

  return (
    <div className="screen">
      <Header title="1,000 core words" sub={p.known.length + " known · ordered by how often Japanese people use them"} backTo="/learn" />
      <div className="card">
        <div className="row"><div className="grow"><div style={{ fontWeight: 800 }}>How much you’ll understand</div><div className="xs mu">Estimated share of everyday speech covered by the top-N words (Mindomax corpus anchors).</div></div></div>
        <CoverageChart known={p.known.length} />
      </div>
      <div style={{ position: "relative" }} className="mt12">
        <Search size={18} style={{ position: "absolute", left: 14, top: 14 }} className="mu2" />
        <input type="search" placeholder="Search Japanese, romaji, English or हिन्दी" value={q} onChange={(e) => { setQ(e.target.value); setLimit(30); }} style={{ paddingLeft: 40 }} />
      </div>
      <div className="chips mt8">
        {TIERS.map(([l], i) => <button key={l} className={"chip" + (tier === i ? " on" : "")} onClick={() => { setTier(i); setLimit(30); }}>{l}</button>)}
        <button className={"chip" + (hideKnown ? " on" : "")} onClick={() => setHideKnown(!hideKnown)}>Hide known</button>
      </div>
      <div className="chips mt4">
        {types.map((t) => <button key={t} className={"chip" + (type === t ? " shu on" : "")} onClick={() => { setType(t); setLimit(30); }}>{t}</button>)}
      </div>
      <div className="row mt8"><span className="sm mu">{list.length} words</span><button className="btn sm primary right" onClick={() => go("/practice/cards")}>Study as flashcards</button></div>

      {list.slice(0, limit).map((w) => {
        const k = known.has(w.n);
        return (
          <div key={w.n} className="card" style={k ? { boxShadow: "inset 0 0 0 1.5px color-mix(in srgb, var(--matcha) 50%, transparent), var(--shadow-1)" } : undefined}>
            <div className="row top">
              <div className="grow">
                <div className="row gap6 wrap"><span className="xs mu2">#{w.n}</span><span className="tag" style={{ background: TYPE_COL[w.t] || "var(--ink-3)", color: "#fff" }}>{w.t}</span></div>
                <div className="row" style={{ alignItems: "baseline", gap: 8 }}>
                  <span className="jp" style={{ fontSize: 30, fontWeight: 600 }}>{w.w}</span>
                  {w.r !== w.w && <span className="jp mu">{w.r}</span>}
                  {s.showRomaji && <span className="sm mu2">{w.ro}</span>}
                </div>
              </div>
              <div className="row gap6"><Say text={w.r} /><RecBtn text={w.w} ro={w.ro} en={w.m} size="m" /></div>
            </div>
            <div style={{ fontWeight: 700, marginTop: 2 }}>{w.m}{s.showHindi && <span className="hi" style={{ fontWeight: 500 }}> · {w.h}</span>}</div>
            <div className="ex" style={{ paddingBottom: 4 }}>
              <div className="grow"><div className="j" style={{ fontSize: 17 }}>{w.s}</div>{s.showRomaji && <div className="r">{w.sr}</div>}<div className="e mu">{w.st}</div></div>
              <Say text={w.s} size="s" />
            </div>
            {(w.p || w.k) && <div className="xs mu">💡 {[w.p, w.k].filter(Boolean).join(" · ")}</div>}
            <div className="row mt8">
              <button className={"btn sm " + (k ? "ok" : "ghost")} onClick={() => toggle(w.n)}>{k ? <><Check size={15} /> Known</> : "Mark known"}</button>
              {w.t === "verb" && pk.conjugate?.(w) && <button className="btn sm ghost" onClick={() => go("/learn/verbs?w=" + encodeURIComponent(w.w))}><Repeat size={14} /> Conjugate</button>}
            </div>
          </div>
        );
      })}
      {limit < list.length && <button className="btn block mt12" onClick={() => setLimit(limit + 40)}>Show more ({list.length - limit} left)</button>}
    </div>
  );
}
