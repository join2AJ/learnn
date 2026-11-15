import { useState } from "react";
import { CalendarDays, Camera, Lightbulb, MapPin } from "lucide-react";
import photos from "../packs/ja/data/photos.json";
import { SIGHTS, Sight } from "../packs/ja/attractions";
import { PREFS } from "../packs/ja/japan";
import { useSettings } from "../core/store";
import { openExternal, speak } from "../core/native";
import { usePack } from "../pack";
import { Say, Sheet, tap } from "./kit";

type Photo = { file: string; author: string; license: string; source: string };
const P = photos as Record<string, Photo>;
export const photoOf = (id: string): Photo | undefined => P[id];
const KIND_COLOR: Record<string, string> = { Nature: "var(--matcha)", Shrine: "var(--shu)", Temple: "var(--gold)", City: "var(--ai)", Castle: "var(--plum)", History: "var(--ink-2)", Village: "var(--matcha)", Festival: "var(--sakura)", Food: "var(--shu)" };
export const kindColor = (k: string) => KIND_COLOR[k] || "var(--ai)";

/** Photo (or a coloured placeholder with the Japanese name when no openly-licensed photo is bundled). */
export function SightPhoto({ s, h = 130, radius = 14 }: { s: Sight; h?: number; radius?: number }) {
  const ph = P[s.id];
  const [bad, setBad] = useState(false);
  if (!ph || bad) return (
    <div style={{ height: h, borderRadius: radius, display: "grid", placeItems: "center", background: `linear-gradient(135deg, color-mix(in srgb, ${kindColor(s.kind)} 35%, var(--surface-2)), var(--surface-2))` }}>
      <span className="jp" style={{ fontSize: Math.min(30, h / 3.2, 150 / s.ja.length), fontWeight: 800, color: kindColor(s.kind), padding: "0 8px", textAlign: "center" }}>{s.ja}</span>
    </div>);
  return <img src={ph.file} alt={s.name} loading="lazy" onError={() => setBad(true)} style={{ width: "100%", height: h, objectFit: "cover", borderRadius: radius, display: "block", background: "var(--surface-2)" }} />;
}

export function SightCard({ s, onOpen }: { s: Sight; onOpen: () => void }) {
  return (
    <button className="card tap" style={{ padding: 0, overflow: "hidden", textAlign: "left" }} onClick={() => { tap(); onOpen(); }}>
      <SightPhoto s={s} h={110} radius={0} />
      <div style={{ padding: "8px 10px 10px" }}>
        <div className="xs" style={{ fontWeight: 800, color: kindColor(s.kind), textTransform: "uppercase", letterSpacing: 0.5 }}>{s.kind}</div>
        <div style={{ fontWeight: 800, fontSize: 14, lineHeight: 1.25 }}>{s.name}</div>
        <div className="jp xs mu">{s.ja}</div>
      </div>
    </button>
  );
}

export function SightSheet({ s, onClose }: { s: Sight | null; onClose: () => void }) {
  const st = useSettings();
  const pk = usePack();
  const ph = s ? P[s.id] : undefined;
  const pref = s ? PREFS.find((p) => p.id === s.pref) : undefined;
  return (
    <Sheet open={!!s} onClose={onClose}>{s && (
      <div>
        <SightPhoto s={s} h={190} />
        <div className="row top mt12">
          <div className="grow">
            <div className="kicker" style={{ color: kindColor(s.kind) }}>{s.kind}{pref ? " · " + pref.en : ""}</div>
            <div style={{ fontWeight: 800, fontSize: 20 }}>{s.name}</div>
            <div className="row gap6"><span className="jp" style={{ fontSize: 18, fontWeight: 700 }} onClick={() => speak(s.ja, { lang: pk.ttsLang, rate: st.rate })}>{s.ja}</span><span className="sm mu">{s.ro}</span></div>
          </div>
          <Say text={s.ja} />
        </div>
        <div className="sm mt8" style={{ lineHeight: 1.6 }}>{s.about}</div>
        {st.showHindi && <div className="sm hi mt4">{s.hi}</div>}
        <div className="card flat mt12" style={{ padding: 12 }}>
          <div className="row sm top gap6"><CalendarDays size={16} color="var(--ai)" /><span><b>Best time:</b> {s.season}</span></div>
          <div className="row sm top gap6 mt8"><Lightbulb size={16} color="var(--gold)" /><span><b>Tip:</b> {s.tip}</span></div>
          {pref && <div className="row sm top gap6 mt8"><MapPin size={16} color="var(--shu)" /><span><b>Prefecture:</b> <span className="jp">{pref.ja}</span> {pref.en}</span></div>}
        </div>
        {ph && <button className="xs mu mt8 row gap6" style={{ background: "none", border: 0, padding: 0, color: "var(--ink-3)", textAlign: "left" }} onClick={() => openExternal(ph.source)}><Camera size={12} /> Photo: {ph.author} · {ph.license} · Wikimedia Commons</button>}
      </div>
    )}</Sheet>
  );
}

export function SightGrid({ list = SIGHTS }: { list?: Sight[] }) {
  const [open, setOpen] = useState<Sight | null>(null);
  return (<>
    <div className="grid2">{list.map((s) => <SightCard key={s.id} s={s} onOpen={() => setOpen(s)} />)}</div>
    <SightSheet s={open} onClose={() => setOpen(null)} />
  </>);
}
