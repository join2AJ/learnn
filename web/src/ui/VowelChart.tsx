import type { VowelRef } from "../core/types";

/* ---------------- vowel chart ---------------- */
const F2MAX = 2700, F2MIN = 600, F1MIN = 200, F1MAX = 950;
const COL: Record<string, string> = { target: "var(--shu)", en: "var(--ai)", hi: "var(--gold)" };
export interface VowelPoint { f1: number; f2: number; label: string; target?: [number, number]; ok?: boolean }
export function VowelChart({ refs, show, live, trail, scale = 1, onTap, height = 260, points }: { refs: VowelRef[]; show: Record<string, boolean>; live?: [number, number] | null; trail?: [number, number][]; scale?: number; onTap?: (v: VowelRef) => void; height?: number; points?: VowelPoint[] }) {
  const W = 340, H = height, pl = 40, pr = 10, pt = 14, pb = 30;
  const x = (f2: number) => pl + ((F2MAX - f2) / (F2MAX - F2MIN)) * (W - pl - pr);
  const y = (f1: number) => pt + ((f1 - F1MIN) / (F1MAX - F1MIN)) * (H - pt - pb);
  const target = refs.filter((r) => r.lang === "target");
  const poly = ["i", "e", "a", "o", "ɯ"].map((ipa) => target.find((t) => t.ipa === ipa)).filter(Boolean) as VowelRef[];
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" className="chart" style={{ background: "var(--surface)", borderRadius: 18 }}>
      {[1000, 1500, 2000, 2500].map((f) => <g key={f}><line x1={x(f)} x2={x(f)} y1={pt} y2={H - pb} stroke="var(--line)" /><text x={x(f)} y={H - 12} textAnchor="middle">{f}</text></g>)}
      <text x={(W + pl) / 2} y={H - 1} textAnchor="middle" style={{ fontWeight: 700, fontSize: 9 }}>F2 Hz - tongue position: front (い) ← → back (お)</text>
      <text x={9} y={(H - pb + pt) / 2} textAnchor="middle" transform={`rotate(-90 9 ${(H - pb + pt) / 2})`} style={{ fontWeight: 700, fontSize: 9 }}>F1 Hz - mouth opening ↓</text>
      {[300, 500, 700, 900].map((f) => <g key={f}><line x1={pl} x2={W - pr} y1={y(f)} y2={y(f)} stroke="var(--line)" /><text x={pl - 3} y={y(f) + 3} textAnchor="end">{f}</text></g>)}
      <text x={W - pr - 2} y={pt + 9} textAnchor="end" style={{ fontWeight: 700 }}>closed mouth</text>
      <text x={W - pr - 2} y={H - pb - 4} textAnchor="end" style={{ fontWeight: 700 }}>open mouth</text>
      {show.target && <polygon points={poly.map((v) => x(v.f2 * scale) + "," + y(v.f1 * scale)).join(" ")} fill="var(--shu-soft)" stroke="var(--shu)" strokeOpacity=".4" />}
      {refs.filter((r) => show[r.lang]).map((r, i) => (
        <g key={i} onClick={() => onTap?.(r)} style={{ cursor: "pointer" }}>
          <circle cx={x(r.f2 * scale)} cy={y(r.f1 * scale)} r={r.lang === "target" ? 15 : 5} fill={r.lang === "target" ? COL.target : "var(--surface)"} stroke={COL[r.lang]} strokeWidth={r.lang === "target" ? 0 : 2} />
          {r.lang === "target"
            ? <text x={x(r.f2 * scale)} y={y(r.f1 * scale) + 5} textAnchor="middle" style={{ fill: "#fff", fontSize: 14, fontFamily: "var(--jp)", fontWeight: 700 }}>{r.label.split(" ")[0]}</text>
            : <text x={x(r.f2 * scale) + 7} y={y(r.f1 * scale) + 3} style={{ fill: COL[r.lang], fontSize: 9, fontWeight: 700 }}>{r.label.replace(/^(EN|हि) /, "")}</text>}
        </g>
      ))}
      {trail?.map(([f1, f2], i) => <circle key={i} cx={x(f2)} cy={y(f1)} r={3} fill="var(--matcha)" opacity={(i + 1) / trail.length * 0.6} />)}
      {points?.map((pt, i) => { const cx = x(Math.max(F2MIN, Math.min(F2MAX, pt.f2))), cy = y(Math.max(F1MIN, Math.min(F1MAX, pt.f1))); return <g key={"p" + i}>
        {pt.target && <line x1={cx} y1={cy} x2={x(pt.target[1])} y2={y(pt.target[0])} stroke={pt.ok ? "var(--matcha)" : "var(--gold)"} strokeWidth="1.5" strokeDasharray="3 3" />}
        <circle cx={cx} cy={cy} r={9} fill={pt.ok ? "var(--matcha)" : "var(--gold)"} stroke="var(--surface)" strokeWidth="2" />
        <text x={cx} y={cy + 3.5} textAnchor="middle" style={{ fill: "#fff", fontSize: 9, fontWeight: 800 }}>{pt.label}</text></g>; })}
      {live && <g><circle cx={x(live[1])} cy={y(live[0])} r={10} fill="var(--matcha)" stroke="#fff" strokeWidth="3" /><text x={x(live[1]) + 13} y={y(live[0]) + 4} style={{ fill: "var(--matcha)", fontWeight: 800, fontSize: 11 }}>you</text></g>}
    </svg>
  );
}

