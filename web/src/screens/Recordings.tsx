import { useEffect, useMemo, useState } from "react";
import { Pause, Play, Search, Trash2 } from "lucide-react";
import { emitUi, toast, updateProgress, useProgress, VoiceRec } from "../core/store";
import { deleteRec, decode, getRec, savedKeys } from "../core/recStore";
import { audioCtx } from "../core/dsp";
import { usePack } from "../pack";
import { Header, tap } from "../ui/kit";
import { Icon } from "../ui/icons";

const scoreCol = (s: number) => (s >= 70 ? "var(--matcha)" : s >= 50 ? "var(--gold)" : "var(--shu)");
const voiceZone = (f: number) => (f < 120 ? "low" : f < 200 ? "mid" : f < 280 ? "high" : "very high");

let current: AudioBufferSourceNode | null = null;

export default function Recordings() {
  const pk = usePack();
  const p = useProgress();
  const [q, setQ] = useState("");
  const [saved, setSaved] = useState<Set<number>>(new Set());
  const [playing, setPlaying] = useState<number | null>(null);
  const [confirm, setConfirm] = useState<number | null>(null);
  const [limit, setLimit] = useState(40);
  useEffect(() => { savedKeys().then(setSaved); }, [p.voiceLog]);

  const all = useMemo(() => [...(p.voiceLog || [])].reverse(), [p.voiceLog]);
  const list = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return all;
    return all.filter((r) => { const w = pk.words.find((x) => x.w === r.w); return [r.w, w?.ro, w?.m, w?.r].some((x) => (x || "").toLowerCase().includes(t)); });
  }, [all, q, pk]);

  const play = async (r: VoiceRec) => {
    tap();
    try { current?.stop(); } catch { /* already stopped */ }
    if (playing === r.t) { setPlaying(null); return; }
    const st = await getRec(r.t);
    if (!st) {
      toast("No sound was saved for this one - it was recorded before v2.4. Opening it so you can record it again.", "info");
      const w = pk.words.find((x) => x.w === r.w);
      emitUi({ type: "voice", text: r.w, ro: w?.ro, en: w?.m, reviewT: r.t });
      return;
    }
    const x = decode(st); const ctx = audioCtx();
    const b = ctx.createBuffer(1, x.length, st.sr); b.getChannelData(0).set(x);
    const src = ctx.createBufferSource(); src.buffer = b; src.connect(ctx.destination); src.start();
    current = src; setPlaying(r.t); src.onended = () => setPlaying((v) => (v === r.t ? null : v));
  };
  const remove = (r: VoiceRec) => {
    deleteRec(r.t);
    updateProgress((x) => { x.voiceLog = (x.voiceLog || []).filter((v) => v.t !== r.t); });
    setConfirm(null);
  };

  const n = all.length;
  const avg = (f: (r: VoiceRec) => number) => (n ? all.reduce((a, r) => a + f(r), 0) / n : 0);
  const voiced = all.filter((r) => r.f0[0] > 0);
  const f0 = voiced.length ? voiced.reduce((a, r) => a + (r.f0[0] + r.f0[1]) / 2, 0) / voiced.length : 0;
  const words = new Set(all.map((r) => r.w)).size;
  const best = useMemo(() => {
    const m = new Map<string, number[]>();
    [...(p.voiceLog || [])].forEach((r) => m.set(r.w, [...(m.get(r.w) || []), r.score]));
    return [...m.entries()].filter(([, s]) => s.length >= 2).map(([w, s]) => ({ w, first: s[0], last: s[s.length - 1], n: s.length })).sort((a, b) => (b.last - b.first) - (a.last - a.first)).slice(0, 5);
  }, [p.voiceLog]);

  let lastDay = "";
  return (
    <div className="screen">
      <Header title="My recordings" sub={n + " recordings · " + words + " different words"} backTo="/me" />

      {n === 0 ? (
        <div className="card center" style={{ padding: 28 }}>
          <div style={{ display: "grid", placeItems: "center" }}><Icon name="mic" size={40} color="var(--matcha)" /></div>
          <div style={{ fontWeight: 800, marginTop: 8 }}>No recordings yet</div>
          <div className="sm mu mt4">Tap the green mic next to any word or sentence. Every recording is saved here with its sound and full analysis.</div>
        </div>
      ) : (<>
        <div className="grid2">
          <div className="stat"><div className="v" style={{ color: scoreCol(avg((r) => r.score)) }}>{Math.round(avg((r) => r.score))}</div><div className="k">Average score</div></div>
          <div className="stat"><div className="v">{f0 ? Math.round(f0) : "–"}<span className="sm mu"> Hz</span></div><div className="k">Your voice: {f0 ? voiceZone(f0) + " pitch" : "–"}</div></div>
          <div className="stat"><div className="v">{Math.round(avg((r) => r.db))}<span className="sm mu"> dB</span></div><div className="k">Avg loudness {avg((r) => r.db) >= -26 ? "· good" : "· speak louder"}</div></div>
          <div className="stat"><div className="v">{(avg((r) => r.dur / r.exp)).toFixed(1)}×</div><div className="k">Avg pace vs natural</div></div>
        </div>

        {best.length > 0 && (
          <div className="card mt12">
            <div className="kicker">Most improved</div>
            {best.map((b) => (
              <div key={b.w} className="row" style={{ padding: "6px 0" }}>
                <span className="jp grow" style={{ fontWeight: 700 }}>{b.w}</span>
                <span className="xs mu">{b.n} tries</span>
                <span className="sm" style={{ fontWeight: 800 }}><span style={{ color: scoreCol(b.first) }}>{b.first}</span> → <span style={{ color: scoreCol(b.last) }}>{b.last}</span></span>
              </div>
            ))}
          </div>
        )}

        <div style={{ position: "relative" }} className="mt12">
          <Search size={18} style={{ position: "absolute", left: 14, top: 14 }} className="mu2" />
          <input type="search" placeholder="Find a word (Japanese, romaji or English)" value={q} onChange={(e) => setQ(e.target.value)} style={{ paddingLeft: 40 }} />
        </div>

        <div className="mt8">
          {list.slice(0, limit).map((r) => {
            const d = new Date(r.t);
            const day = d.toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short", year: "numeric" });
            const head = day !== lastDay ? (lastDay = day) : null;
            const w = pk.words.find((x) => x.w === r.w);
            const has = saved.has(r.t);
            return (
              <div key={r.t}>
                {head && <div className="kicker" style={{ margin: "16px 4px 8px" }}>{head}</div>}
                <div className="card" style={{ padding: 12, marginTop: 8 }}>
                  <div className="row">
                    <button className="say" style={{ background: has ? "var(--matcha-soft)" : "var(--surface-2)", color: has ? "var(--matcha)" : "var(--ink-3)" }} aria-label="Play recording" onClick={() => play(r)}>
                      {playing === r.t ? <Pause size={17} /> : <Play size={17} />}
                    </button>
                    <button className="grow" style={{ textAlign: "left", minWidth: 0 }} onClick={() => emitUi({ type: "voice", text: r.w, ro: w?.ro, en: w?.m, reviewT: r.t })}>
                      <div className="jp" style={{ fontWeight: 700, fontSize: 17, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.w}</div>
                      <div className="xs mu">{d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} · {Math.round(r.db)} dB · {r.dur.toFixed(1)}s · {r.f0[0] ? Math.round(r.f0[0]) + "–" + Math.round(r.f0[1]) + " Hz" : "no pitch"}{has ? "" : " · no sound saved (before v2.4)"}</div>
                      <div className="row mt4" style={{ gap: 3 }}>
                        {r.bands.map((b, i) => <div key={i} title={["Low", "Mid", "High"][i]} style={{ height: 5, width: b * 120, borderRadius: 3, background: ["var(--ai)", "var(--gold)", "var(--shu)"][i], opacity: 0.8 }} />)}
                      </div>
                    </button>
                    <span className="tag" style={{ background: scoreCol(r.score), color: "#fff", height: 28, fontSize: 14, minWidth: 38, justifyContent: "center" }}>{r.score}</span>
                    {confirm === r.t
                      ? <button className="btn sm" style={{ background: "var(--shu)", color: "#fff" }} onClick={() => remove(r)}>Delete</button>
                      : <button className="icon-btn ghost" aria-label="Delete recording" onClick={() => setConfirm(r.t)}><Trash2 size={17} className="mu2" /></button>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {limit < list.length && <button className="btn block mt12" onClick={() => setLimit(limit + 40)}>Show more ({list.length - limit})</button>}
        <div className="xs mu mt12" style={{ lineHeight: 1.5 }}>Tap a recording to open its full analysis. Colour bars = Low / Mid / High balance. Audio is stored only on this phone (about 30 KB per second); recordings made before v2.4 kept their scores but not their sound.</div>
      </>)}
    </div>
  );
}
