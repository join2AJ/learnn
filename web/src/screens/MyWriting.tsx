import { useEffect, useMemo, useState } from "react";
import { PenLine, Search, Trash2 } from "lucide-react";
import { go } from "../core/router";
import { useProgress } from "../core/store";
import { allWrites, deleteWrite, WriteRec } from "../core/writeStore";
import { usePack } from "../pack";
import { Header, Sheet } from "../ui/kit";
import { StrokeView } from "../ui/StrokeView";

const sc = (s: number) => (s >= 85 ? "var(--matcha)" : s >= 70 ? "var(--ai)" : s >= 50 ? "var(--gold)" : "var(--shu)");
const grade = (s: number) => (s >= 90 ? "Excellent" : s >= 80 ? "Very good" : s >= 70 ? "Good" : s >= 50 ? "Getting there" : "Keep practising");

/** Your drawing over the faint correct character; numbers mark where each of your strokes started. */
export function Drawing({ r, size = 64, numbers = false }: { r: WriteRec; size?: number; numbers?: boolean }) {
  const pk = usePack();
  const paths = pk.strokes[r.ch] || [];
  const COL = ["#e0452b", "#2f4b8a", "#3f8a4f", "#d29a2e", "#7b4fb0", "#e47aa0", "#0e9aa7", "#8a5a44"];
  return (
    <svg viewBox="0 0 109 109" width={size} height={size} style={{ background: "var(--surface-2)", borderRadius: size / 5, flex: "none" }}>
      {paths.map((d, i) => <path key={i} d={d} fill="none" stroke="var(--line-2)" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />)}
      {r.strokes.map((st, i) => {
        let d = ""; for (let k = 0; k < st.length; k += 2) d += (k ? "L" : "M") + st[k] + "," + st[k + 1];
        return <g key={i}>
          <path d={d} fill="none" stroke={numbers ? COL[i % COL.length] : "var(--ink)"} strokeWidth={numbers ? 4.5 : 5} strokeLinecap="round" strokeLinejoin="round" />
          {numbers && <><circle cx={st[0]} cy={st[1]} r="5" fill={COL[i % COL.length]} /><text x={st[0]} y={st[1] + 2.6} textAnchor="middle" style={{ fill: "#fff", fontSize: 7, fontWeight: 800 }}>{i + 1}</text></>}
        </g>;
      })}
    </svg>
  );
}

export default function MyWriting() {
  const p = useProgress();
  const [list, setList] = useState<WriteRec[]>([]);
  const [q, setQ] = useState("");
  const [sel, setSel] = useState<WriteRec | null>(null);
  const [limit, setLimit] = useState(40);
  useEffect(() => { allWrites().then(setList); }, [p.writes]);
  const shown = useMemo(() => (q.trim() ? list.filter((r) => r.ch === q.trim() || r.ch.includes(q.trim())) : list), [list, q]);
  const avg = list.length ? Math.round(list.reduce((a, r) => a + r.score, 0) / list.length) : 0;
  const chars = new Set(list.map((r) => r.ch)).size;
  const perfectOrder = list.length ? Math.round((list.filter((r) => r.order === r.expected && r.count === r.expected).length / list.length) * 100) : 0;
  const improved = useMemo(() => {
    const m = new Map<string, number[]>();
    [...list].reverse().forEach((r) => m.set(r.ch, [...(m.get(r.ch) || []), r.score]));
    return [...m.entries()].filter(([, s]) => s.length >= 2).map(([ch, s]) => ({ ch, first: s[0], last: s[s.length - 1], n: s.length })).sort((a, b) => (b.last - b.first) - (a.last - a.first)).slice(0, 5);
  }, [list]);
  let lastDay = "";
  return (
    <div className="screen">
      <Header title="My writing" sub={list.length + " drawings · " + chars + " characters"} backTo="/me" right={<button className="icon-btn" aria-label="Write" onClick={() => go("/practice/write")}><PenLine size={19} /></button>} />
      {list.length === 0 ? (
        <div className="card center" style={{ padding: 28 }}>
          <div style={{ display: "grid", placeItems: "center" }}><PenLine size={40} color="var(--gold)" /></div>
          <div style={{ fontWeight: 800, marginTop: 8 }}>No drawings yet</div>
          <div className="sm mu mt4">Open Practice → Write, draw a character and tap “Check my writing”. Every attempt is saved here with how accurate it was.</div>
          <button className="btn primary mt16" onClick={() => go("/practice/write")}>Start writing</button>
        </div>
      ) : (<>
        <div className="grid2">
          <div className="stat"><div className="v" style={{ color: sc(avg) }}>{avg}%</div><div className="k">Average accuracy</div></div>
          <div className="stat"><div className="v">{list.length}</div><div className="k">Drawings checked</div></div>
          <div className="stat"><div className="v">{chars}</div><div className="k">Different characters</div></div>
          <div className="stat"><div className="v">{perfectOrder}%</div><div className="k">Perfect stroke order</div></div>
        </div>
        {improved.length > 0 && (
          <div className="card mt12">
            <div className="kicker">Most improved</div>
            {improved.map((b) => (
              <div key={b.ch} className="row" style={{ padding: "6px 0" }}>
                <span className="jp grow" style={{ fontWeight: 700, fontSize: 20 }}>{b.ch}</span><span className="xs mu">{b.n} tries</span>
                <span className="sm" style={{ fontWeight: 800 }}><span style={{ color: sc(b.first) }}>{b.first}</span> → <span style={{ color: sc(b.last) }}>{b.last}</span></span>
              </div>
            ))}
          </div>
        )}
        <div style={{ position: "relative" }} className="mt12">
          <Search size={18} style={{ position: "absolute", left: 14, top: 14 }} className="mu2" />
          <input type="search" placeholder="Find a character, e.g. あ" value={q} onChange={(e) => setQ(e.target.value)} style={{ paddingLeft: 40 }} />
        </div>
        {shown.slice(0, limit).map((r) => {
          const d = new Date(r.t);
          const day = d.toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short", year: "numeric" });
          const head = day !== lastDay ? (lastDay = day) : null;
          return (
            <div key={r.t}>
              {head && <div className="kicker" style={{ margin: "16px 4px 8px" }}>{head}</div>}
              <button className="card tap" style={{ padding: 10, marginTop: 8 }} onClick={() => setSel(r)}>
                <div className="row">
                  <Drawing r={r} size={62} />
                  <div className="grow" style={{ minWidth: 0 }}>
                    <div className="row gap6"><span className="jp" style={{ fontSize: 22, fontWeight: 700 }}>{r.ch}</span><span className="xs mu">{d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span></div>
                    <div className="xs mu">Shape {r.shape}% · strokes {r.count}/{r.expected} · order {r.order}/{r.expected}</div>
                    <div className="xs" style={{ color: sc(r.score), fontWeight: 700 }}>{grade(r.score)}</div>
                  </div>
                  <span className="tag" style={{ background: sc(r.score), color: "#fff", height: 30, fontSize: 15, minWidth: 46, justifyContent: "center" }}>{r.score}%</span>
                </div>
              </button>
            </div>
          );
        })}
        {limit < shown.length && <button className="btn block mt12" onClick={() => setLimit(limit + 40)}>Show more ({shown.length - limit})</button>}
      </>)}
      <Sheet open={!!sel} onClose={() => setSel(null)}>{sel && <Detail r={sel} onDelete={() => { deleteWrite(sel.t); setList(list.filter((x) => x.t !== sel.t)); setSel(null); }} />}</Sheet>
    </div>
  );
}

function Detail({ r, onDelete }: { r: WriteRec; onDelete: () => void }) {
  const p = useProgress();
  const log = p.writeLog?.[r.ch];
  const [confirm, setConfirm] = useState(false);
  const rows: [string, string, number, string][] = [
    ["Overall accuracy", r.score + "%", r.score, "Shape match, adjusted for stroke count and order"],
    ["Shape match", r.shape + "%", r.shape, "How closely your lines follow the real character"],
    ["Ink on target", r.ink + "%", r.ink, "How much of what you drew sits on the character (low = extra lines)"],
    ["Coverage", r.cover + "%", r.cover, "How much of the character you drew (low = parts missing)"],
    ["Stroke count", r.count + " / " + r.expected, r.count === r.expected ? 100 : 40, r.count === r.expected ? "Correct number of strokes" : r.count > r.expected ? "Too many strokes - lift your finger only between strokes" : "Too few - some strokes were joined or missed"],
    ["Stroke order", r.order + " / " + r.expected, (r.order / Math.max(1, r.expected)) * 100, "Strokes started in the right place, in the right sequence"],
    ["Direction", r.dir + " / " + r.expected, (r.dir / Math.max(1, r.expected)) * 100, "Strokes drawn the right way (top→bottom, left→right)"],
  ];
  return (
    <div>
      <div className="kicker">{new Date(r.t).toLocaleString()}</div>
      <div className="row mt8" style={{ gap: 14, alignItems: "center" }}>
        <Drawing r={r} size={150} numbers />
        <div className="col" style={{ alignItems: "center", gap: 4 }}><StrokeView ch={r.ch} size={110} speed={0.45} /><span className="xs mu">correct order</span></div>
      </div>
      <div className="xs mu mt8">Left: your drawing - coloured numbers show where each of your strokes began. Right: the correct stroke order.</div>
      <div className="row mt12"><div style={{ fontSize: 40, fontWeight: 800, color: sc(r.score) }}>{r.score}%</div><div className="grow"><b>{grade(r.score)}</b><div className="xs mu">{log ? "This character: " + log.n + " tries · best " + log.best + "%" : ""}</div></div></div>
      <div className="card flat mt8" style={{ padding: 12 }}>
        {rows.map(([k, v, pct, d]) => (
          <div key={k} style={{ padding: "6px 0" }}>
            <div className="row sm"><b className="grow">{k}</b><span style={{ fontWeight: 800, color: sc(pct) }}>{v}</span></div>
            <div className="bar thin mt4"><i style={{ width: Math.max(3, pct) + "%", background: sc(pct) }} /></div>
            <div className="xs mu2 mt4">{d}</div>
          </div>
        ))}
      </div>
      <div className="row mt12">
        <button className="btn primary grow" onClick={() => go("/practice/write?ch=" + encodeURIComponent(r.ch))}><PenLine size={16} /> Write {r.ch} again</button>
        {confirm ? <button className="btn" style={{ background: "var(--shu)", color: "#fff" }} onClick={onDelete}>Delete</button>
          : <button className="icon-btn" aria-label="Delete drawing" onClick={() => setConfirm(true)}><Trash2 size={18} /></button>}
      </div>
    </div>
  );
}
