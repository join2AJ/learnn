import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Eraser, Eye, EyeOff, Undo2 } from "lucide-react";
import { toast, updateProgress, useProgress, useSettings } from "../../core/store";
import { award, checkBadges } from "../../core/rewards";
import { saveWrite, strokeEnds } from "../../core/writeStore";
import { go } from "../../core/router";
import { speak } from "../../core/native";
import type { LetterCell } from "../../core/types";
import { usePack } from "../../pack";
import { Header, pick, Say, Seg, tap } from "../../ui/kit";
import { StrokeView } from "../../ui/StrokeView";

type Pt = [number, number];
const G = 64; // scoring grid

/** Rasterise strokes into a G×G boolean grid (with a given pen width in 109-units). */
function raster(draw: (ctx: CanvasRenderingContext2D) => void) {
  const c = document.createElement("canvas"); c.width = c.height = G;
  const ctx = c.getContext("2d")!;
  ctx.scale(G / 109, G / 109); ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.strokeStyle = "#000";
  draw(ctx);
  const d = ctx.getImageData(0, 0, G, G).data;
  const out = new Uint8Array(G * G);
  for (let i = 0; i < G * G; i++) out[i] = d[i * 4 + 3] > 40 ? 1 : 0;
  return out;
}

export default function Write({ initial, set }: { initial: string | null; set: string }) {
  const pk = usePack();
  const s = useSettings();
  const [alpha, setAlpha] = useState(initial ? (pk.alphabets.find((a) => a.groups.some((g) => g.rows.some((r) => r.cells.some((c) => c?.ch === initial))))?.id || set) : set);
  const chars = useMemo(() => {
    const a = pk.alphabets.find((x) => x.id === alpha)!;
    return a.groups.flatMap((g) => g.rows.flatMap((r) => r.cells.filter(Boolean) as LetterCell[])).filter((c) => pk.strokes[c.ch]);
  }, [alpha, pk]);
  const [i, setI] = useState(() => Math.max(0, chars.findIndex((c) => c.ch === initial)));
  const cell = chars[Math.min(i, chars.length - 1)];
  const paths = pk.strokes[cell.ch] || [];
  const cv = useRef<HTMLCanvasElement>(null);
  const [strokes, setStrokes] = useState<Pt[][]>([]);
  const cur = useRef<Pt[] | null>(null);
  const [guide, setGuide] = useState(true);
  const [result, setResult] = useState<{ score: number; count: number; shape: number; ink: number; cover: number; order: number; dir: number } | null>(null);
  const log = useProgress().writeLog?.[cell.ch];

  useEffect(() => { setStrokes([]); setResult(null); }, [cell.ch]);

  const redraw = (list: Pt[][]) => {
    const c = cv.current; if (!c) return;
    const ctx = c.getContext("2d")!;
    const k = c.width / 109;
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.lineWidth = 6 * k;
    list.forEach((st, si) => {
      ctx.strokeStyle = si === list.length - 1 && cur.current ? "#e0452b" : getComputedStyle(document.documentElement).getPropertyValue("--ink").trim() || "#111";
      ctx.beginPath(); st.forEach(([x, y], j) => (j ? ctx.lineTo(x * k, y * k) : ctx.moveTo(x * k, y * k))); ctx.stroke();
    });
  };
  useEffect(() => {
    const c = cv.current!; const r = c.getBoundingClientRect();
    c.width = r.width * devicePixelRatio; c.height = r.height * devicePixelRatio; redraw(strokes);
  }, [cell.ch]); // eslint-disable-line
  useEffect(() => redraw(strokes), [strokes]); // eslint-disable-line

  const pos = (e: React.PointerEvent): Pt => { const r = cv.current!.getBoundingClientRect(); return [((e.clientX - r.left) / r.width) * 109, ((e.clientY - r.top) / r.height) * 109]; };
  const down = (e: React.PointerEvent) => {
    if (result) { toast("Already checked - tap Clear to write it again.", "info"); return; }
    (e.target as Element).setPointerCapture(e.pointerId); cur.current = [pos(e)];
  };
  const move = (e: React.PointerEvent) => { if (!cur.current) return; cur.current.push(pos(e)); redraw([...strokes, cur.current]); };
  const up = () => { if (!cur.current) return; const st = cur.current; cur.current = null; if (st.length > 1 || strokes.length === 0) setStrokes([...strokes, st]); };

  const check = () => {
    if (result || !strokes.length) return; // one check per drawing
    tap(14);
    const tmpl = raster((ctx) => { ctx.lineWidth = 9; paths.forEach((d) => ctx.stroke(new Path2D(d))); });
    const tmplWide = raster((ctx) => { ctx.lineWidth = 20; paths.forEach((d) => ctx.stroke(new Path2D(d))); });
    const user = raster((ctx) => { ctx.lineWidth = 9; strokes.forEach((st) => { ctx.beginPath(); st.forEach(([x, y], j) => (j ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.stroke(); }); });
    const userWide = raster((ctx) => { ctx.lineWidth = 20; strokes.forEach((st) => { ctx.beginPath(); st.forEach(([x, y], j) => (j ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.stroke(); }); });
    let u = 0, uIn = 0, t = 0, tIn = 0;
    for (let k = 0; k < G * G; k++) { if (user[k]) { u++; if (tmplWide[k]) uIn++; } if (tmpl[k]) { t++; if (userWide[k]) tIn++; } }
    const precision = u ? uIn / u : 0, recall = t ? tIn / t : 0;
    const shape = precision + recall ? (2 * precision * recall) / (precision + recall) : 0;
    const countOk = strokes.length === paths.length;
    // stroke order + direction: compare each stroke's start/end with the template stroke at the same position
    const ends = strokeEnds(paths);
    let order = 0, dir = 0;
    strokes.forEach((st, k) => {
      const e = ends[k]; if (!e) return;
      const a = st[0], b = st[st.length - 1];
      const dS = Math.hypot(a[0] - e.s[0], a[1] - e.s[1]), dE = Math.hypot(a[0] - e.e[0], a[1] - e.e[1]);
      if (dS < 24) order++;
      if (dS < dE && Math.hypot(b[0] - e.e[0], b[1] - e.e[1]) < Math.hypot(b[0] - e.s[0], b[1] - e.s[1])) dir++;
    });
    const orderR = paths.length ? order / paths.length : 1;
    const score = Math.round(Math.min(1, shape * (countOk ? 1 : 0.85) * (0.85 + 0.15 * orderR)) * 100);
    setResult({ score, count: strokes.length, shape: Math.round(shape * 100), ink: Math.round(precision * 100), cover: Math.round(recall * 100), order, dir });
    saveWrite({ t: Date.now(), ch: cell.ch, set: alpha, strokes: strokes.map((st) => st.filter((_, j) => j % 2 === 0 || j === st.length - 1).flatMap(([x, y]) => [Math.round(x * 2) / 2, Math.round(y * 2) / 2])),
      score, shape: Math.round(shape * 100), ink: Math.round(precision * 100), cover: Math.round(recall * 100), count: strokes.length, expected: paths.length, order, dir });
    updateProgress((x) => {
      x.writes++;
      const prev = x.writeLog?.[cell.ch];
      x.writeLog = { ...(x.writeLog || {}), [cell.ch]: { n: (prev?.n || 0) + 1, best: Math.max(prev?.best || 0, score), last: score, t: Date.now(), scores: [...(prev?.scores || []), score].slice(-20) } };
    });
    // +1 XP for every honest try, bonus for good writing
    award(score >= 85 ? 7 : score >= 70 ? 5 : 1);
    if (score >= 70) speak(pick(pk.praise).jp, { lang: pk.ttsLang });
    checkBadges();
  };

  const go2 = (d: number) => { tap(); setI((i + d + chars.length) % chars.length); };

  return (
    <div className="screen">
      <Header title="Writing practice" sub="Watch the stroke order, then trace it" backTo="/practice" />
      <Seg value={alpha} options={pk.alphabets.map((a) => [a.id, <span className="jp">{a.native}</span>] as [string, React.ReactNode])} onChange={(v) => { setAlpha(v); setI(0); }} />
      <div className="row mt12">
        <button className="icon-btn" onClick={() => go2(-1)} aria-label="Previous"><ChevronLeft /></button>
        <div className="grow center">
          <div className="row" style={{ justifyContent: "center" }}><span className="jp" style={{ fontSize: 28, fontWeight: 700 }}>{cell.ch}</span><span style={{ fontWeight: 800, fontSize: 18 }}>{cell.rom}</span>{s.showHindi && cell.hint && alpha !== "kanji" && <span className="hi">{cell.hint}</span>}<Say text={cell.ch} size="s" /></div>
          <div className="xs mu">{alpha === "kanji" ? cell.hint : ""} {paths.length} strokes · {i + 1}/{chars.length}</div>
        </div>
        <button className="icon-btn" onClick={() => go2(1)} aria-label="Next"><ChevronRight /></button>
      </div>
      <div className="row mt12 top" style={{ gap: 12 }}>
        <div style={{ flex: "none" }}><StrokeView key={cell.ch} ch={cell.ch} size={110} speed={0.45} showNumbers={false} /></div>
        <div className="sm mu grow" style={{ lineHeight: 1.5 }}>
          <b style={{ color: "var(--ink)" }}>Rules:</b> top → bottom, left → right, horizontal before vertical. The first stroke is shown in red. Lift your finger between strokes.
        </div>
      </div>
      <div className="pad mt12">
        {guide && <svg className="guide" viewBox="0 0 109 109">
          <line x1="54.5" y1="4" x2="54.5" y2="105" stroke="var(--line-2)" strokeDasharray="2 3" strokeWidth=".5" />
          <line x1="4" y1="54.5" x2="105" y2="54.5" stroke="var(--line-2)" strokeDasharray="2 3" strokeWidth=".5" />
          {paths.map((d, k) => <path key={k} d={d} fill="none" stroke="var(--surface-3)" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />)}
        </svg>}
        <canvas ref={cv} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} aria-label="Drawing area" />
      </div>
      <div className="row mt12" style={{ justifyContent: "center" }}>
        <button className="btn sm" onClick={() => setGuide(!guide)}>{guide ? <EyeOff size={15} /> : <Eye size={15} />} {guide ? "Hide guide" : "Show guide"}</button>
        <button className="btn sm" onClick={() => setStrokes(strokes.slice(0, -1))} disabled={!strokes.length || !!result}><Undo2 size={15} /> Undo</button>
        <button className="btn sm" onClick={() => { setStrokes([]); setResult(null); }}><Eraser size={15} /> Clear</button>
      </div>
      {result ? <button className="btn lg block mt12" onClick={() => { tap(); setStrokes([]); setResult(null); }}><Eraser size={17} /> Clear & write again</button>
        : <button className="btn primary lg block mt12" disabled={!strokes.length} onClick={check}>Check my writing</button>}
      {log && <div className="xs mu center mt8">This character: tried {log.n}× · best {log.best}% · last {log.last}%{log.scores.length > 1 ? " · history " + log.scores.slice(-6).join(" → ") : ""}</div>}
      {result && (
        <div className={"feedback " + (result.score >= 70 ? "ok" : "bad")}>
          <div className="row"><div style={{ fontSize: 32, fontWeight: 800 }}>{result.score}%</div>
            <div className="grow sm">
              <div><b>{result.score >= 85 ? pick(pk.praise).jp + " Beautiful!" : result.score >= 70 ? "Good shape!" : "Keep practising"}</b></div>
              <div>Strokes: {result.count} / {paths.length} {result.count === paths.length ? "✓" : "- check the stroke order animation"}</div>
            </div>
          </div>
          <div className="grid3 mt8" style={{ gap: 6 }}>
            {[["Shape", result.shape + "%"], ["Ink on target", result.ink + "%"], ["Coverage", result.cover + "%"], ["Strokes", result.count + "/" + paths.length], ["Order", result.order + "/" + paths.length], ["Direction", result.dir + "/" + paths.length]].map(([k, v]) => (
              <div key={k} className="stat" style={{ padding: 8, boxShadow: "none", background: "var(--surface)" }}><div className="v" style={{ fontSize: 16 }}>{v}</div><div className="k" style={{ fontSize: 10 }}>{k}</div></div>))}
          </div>
          <div className="row mt12"><button className="btn grow" onClick={() => go("/me/writing")}>My writing</button>{result.score >= 70 && <button className="btn primary grow" onClick={() => go2(1)}>Next character →</button>}</div>
        </div>
      )}
    </div>
  );
}
