import { ReactNode, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, Turtle, Volume2 } from "lucide-react";
import { onSpeaking, speak, vibrate } from "../core/native";
import { getSettings } from "../core/store";
import { back } from "../core/router";
import { pack } from "../pack";

/** Speaker button: speaks text with the current pack's voice; pulses while speaking. */
let sayId = 0;
export function Say({ text, size = "m", rate, label, slow }: { text: string; size?: "s" | "m"; rate?: number; label?: string; slow?: boolean }) {
  const id = useRef("say" + ++sayId).current;
  const [on, setOn] = useState(false);
  useEffect(() => onSpeaking((x) => setOn(x === id)), [id]);
  return (
    <button aria-label={label || "Play " + text} className={"say" + (size === "s" ? " s" : "") + (on ? " on" : "")}
      onClick={(e) => { e.stopPropagation(); tap(); speak(text, { lang: pack().ttsLang, rate: slow ? 0.5 : rate ?? getSettings().rate, id }); }}>
      {slow ? <Turtle size={size === "s" ? 15 : 18} strokeWidth={2.2} /> : <Volume2 size={size === "s" ? 15 : 18} strokeWidth={2.4} />}
    </button>
  );
}

export const tap = (ms = 8) => { if (getSettings().haptics) vibrate(ms); };

export function Header({ title, sub, backTo, right, flat }: { title: ReactNode; sub?: ReactNode; backTo?: string | true; right?: ReactNode; flat?: boolean }) {
  return (
    <div className={"hdr" + (flat ? " flat" : "")}>
      {backTo && <button className="icon-btn" aria-label="Back" onClick={() => { tap(); back(typeof backTo === "string" ? backTo : "/"); }}><ChevronLeft size={22} /></button>}
      <div className="grow"><h1>{title}</h1>{sub && <div className="sub">{sub}</div>}</div>
      {right}
    </div>
  );
}

export function Ring({ pct, size = 64, stroke = 7, color = "var(--shu)", track = "var(--surface-3)", children }: { pct: number; size?: number; stroke?: number; color?: string; track?: string; children?: ReactNode }) {
  const r = (size - stroke) / 2, c = 2 * Math.PI * r;
  return (
    <div className="ring-wrap" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - Math.max(0, Math.min(1, pct)))} style={{ transition: "stroke-dashoffset .8s cubic-bezier(.2,.8,.2,1)" }} />
      </svg>
      <div className="lbl">{children}</div>
    </div>
  );
}

export const Bar = ({ pct, color, white, thin }: { pct: number; color?: string; white?: boolean; thin?: boolean }) => (
  <div className={"bar" + (white ? " white" : "") + (thin ? " thin" : "")}><i style={{ width: Math.max(0, Math.min(100, pct * 100)) + "%", background: color }} /></div>
);

export function Seg<T extends string>({ value, options, onChange }: { value: T; options: [T, ReactNode][]; onChange: (v: T) => void }) {
  return <div className="seg">{options.map(([k, l]) => <button key={k} className={value === k ? "on" : ""} onClick={() => { tap(); onChange(k); }}>{l}</button>)}</div>;
}

export const Switch = ({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) => (
  <button role="switch" aria-checked={on} className={"switch" + (on ? " on" : "")} onClick={() => { tap(); onChange(!on); }} />
);

export function Sheet({ open, onClose, children }: { open: boolean; onClose: () => void; children: ReactNode }) {
  useEffect(() => {
    if (!open) return;
    // Android back closes the sheet: push a dummy hash entry.
    const h = location.hash;
    history.pushState({ sheet: 1 }, "", h);
    const pop = () => onClose();
    window.addEventListener("popstate", pop);
    return () => { window.removeEventListener("popstate", pop); if (history.state?.sheet) history.back(); };
  }, [open]); // eslint-disable-line
  if (!open) return null;
  return createPortal(<><div className="scrim" onClick={onClose} /><div className="sheet" role="dialog"><div className="grab" />{children}</div></>, document.body);
}

/** Renders text; every run of Japanese becomes tap-to-hear (dotted underline). */
const JP_RUN = /([\u3040-\u30ff\u3400-\u9fff\uff66-\uff9f々〜ー][\u3040-\u30ff\u3400-\u9fff\uff66-\uff9f々〜ー、・（）()]*)/g;
export function Jp({ text }: { text: string }) {
  const parts = text.split(JP_RUN);
  return <>{parts.map((p, i) => (i % 2 === 1
    ? <button key={i} className="jp-tap" onClick={(e) => { e.stopPropagation(); tap(); speak(p.replace(/[（）()]/g, ""), { lang: pack().ttsLang, rate: getSettings().rate }); }}>{p}</button>
    : <span key={i}>{p}</span>))}</>;
}

/** **bold** markdown only — enough for lesson copy. Japanese inside is tappable. */
export function Md({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return <>{parts.map((p, i) => (p.startsWith("**") ? <b key={i}><Jp text={p.slice(2, -2)} /></b> : <Jp key={i} text={p} />))}</>;
}

/** Celebration confetti on a canvas. */
export function Confetti({ run }: { run: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (!run) return;
    const cv = ref.current!; const ctx = cv.getContext("2d")!;
    const W = (cv.width = innerWidth * devicePixelRatio), H = (cv.height = innerHeight * devicePixelRatio);
    const colors = ["#e0452b", "#f1bd55", "#2f4b8a", "#3f8a4f", "#e47aa0", "#ffffff"];
    const ps = Array.from({ length: 140 }, () => ({
      x: W / 2 + (Math.random() - .5) * W * .3, y: H * .45, vx: (Math.random() - .5) * 26 * devicePixelRatio, vy: (-Math.random() * 26 - 8) * devicePixelRatio,
      s: (6 + Math.random() * 8) * devicePixelRatio, r: Math.random() * 6, vr: (Math.random() - .5) * .4, c: colors[(Math.random() * colors.length) | 0], shape: Math.random() < .3 ? 1 : 0,
    }));
    let raf = 0, t = 0;
    const step = () => {
      t++; ctx.clearRect(0, 0, W, H);
      ps.forEach((p) => {
        p.vy += .9 * devicePixelRatio; p.vx *= .985; p.x += p.vx; p.y += p.vy; p.r += p.vr;
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.fillStyle = p.c; ctx.globalAlpha = Math.max(0, 1 - t / 140);
        if (p.shape) { ctx.beginPath(); ctx.arc(0, 0, p.s / 2.4, 0, 7); ctx.fill(); } else ctx.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2);
        ctx.restore();
      });
      if (t < 140) raf = requestAnimationFrame(step); else ctx.clearRect(0, 0, W, H);
    };
    step();
    return () => cancelAnimationFrame(raf);
  }, [run]);
  return <canvas ref={ref} className="confetti" style={{ width: "100%", height: "100%" }} />;
}

export const fmtMin = (ms: number) => {
  const m = Math.round(ms / 60000);
  if (m < 60) return m + "m";
  return Math.floor(m / 60) + "h " + (m % 60) + "m";
};

export function shuffle<T>(a: T[]): T[] { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; [b[i], b[j]] = [b[j], b[i]]; } return b; }
export const pick = <T,>(a: T[]) => a[(Math.random() * a.length) | 0];
