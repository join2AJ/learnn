import { useState } from "react";
import { RotateCcw } from "lucide-react";
import { usePack } from "../pack";

/** Animated stroke order from KanjiVG paths (109×109 viewBox). */
export function StrokeView({ ch, size = 180, speed = 0.55, showNumbers = true, ghost = true }: { ch: string; size?: number; speed?: number; showNumbers?: boolean; ghost?: boolean }) {
  const pk = usePack();
  const paths = pk.strokes[ch];
  const [k, setK] = useState(0);
  if (!paths) return <div className="jp center" style={{ fontSize: size * 0.7, lineHeight: 1 }}>{ch}</div>;
  return (
    <div style={{ position: "relative", width: size, height: size, margin: "0 auto" }}>
      <svg key={k} viewBox="0 0 109 109" width={size} height={size} className="stroke-anim" style={{ background: "var(--surface-2)", borderRadius: 22 }}>
        <line x1="54.5" y1="6" x2="54.5" y2="103" stroke="var(--line-2)" strokeDasharray="2 3" strokeWidth=".6" />
        <line x1="6" y1="54.5" x2="103" y2="54.5" stroke="var(--line-2)" strokeDasharray="2 3" strokeWidth=".6" />
        {ghost && paths.map((d, i) => <path key={"g" + i} d={d} fill="none" stroke="var(--line-2)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" style={{ animation: "none", strokeDasharray: "none", strokeDashoffset: 0 }} />)}
        {paths.map((d, i) => (
          <path key={i} d={d} pathLength={1} fill="none" stroke={i === 0 ? "var(--shu)" : "var(--ink)"} strokeWidth="4.2" strokeLinecap="round" strokeLinejoin="round"
            style={{ ["--len" as string]: 1, ["--dur" as string]: speed + "s", ["--delay" as string]: i * (speed + 0.15) + "s" }} />
        ))}
        {showNumbers && paths.map((d, i) => {
          const m = d.match(/^M\s*([\d.]+)[ ,]([\d.]+)/);
          if (!m) return null;
          return <text key={"n" + i} x={+m[1] - 5} y={+m[2] - 2} fontSize="7" fill="var(--shu)" fontWeight="700" style={{ opacity: 0, animation: `appear .2s ${i * (speed + 0.15)}s forwards` }}>{i + 1}</text>;
        })}
      </svg>
      <button className="icon-btn" style={{ position: "absolute", right: 6, bottom: 6, width: 34, height: 34 }} aria-label="Replay stroke order" onClick={() => setK(k + 1)}><RotateCcw size={16} /></button>
    </div>
  );
}
export const strokeCount = (pk: { strokes: Record<string, string[]> }, ch: string) => pk.strokes[ch]?.length || 0;
