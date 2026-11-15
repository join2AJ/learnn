import { useEffect, useMemo, useRef, useState } from "react";
import { MapPin, RotateCcw, Target, ZoomOut } from "lucide-react";
import map from "../packs/ja/data/japan_map.json";
import { CITIES, City, JAPAN_FACTS, Pref, PREFS, REGIONS } from "../packs/ja/japan";
import { useSettings } from "../core/store";
import { award, recordAnswer } from "../core/rewards";
import { speak } from "../core/native";
import { usePack } from "../pack";
import { Header, Say, Seg, Sheet, shuffle, tap } from "../ui/kit";
import { RecBtn } from "../ui/VoiceCompare";

const M = map as { w: number; h: number; minx: number; miny: number; sc: number; lat0: number; paths: Record<string, string> };
const proj = (lon: number, lat: number) => [(lon * Math.cos((M.lat0 * Math.PI) / 180) - M.minx) * M.sc, (-lat - M.miny) * M.sc];
const regionOf = (id: string) => REGIONS.find((r) => r.id === id)!;
const FULL = `-6 -6 ${M.w + 12} ${M.h + 12}`;

/** Interactive map of Japan: 8 regions, 47 prefectures, key cities, and a find-the-prefecture quiz. */
export default function JapanMap() {
  const pk = usePack();
  const s = useSettings();
  const [mode, setMode] = useState<"explore" | "quiz">("explore");
  const [region, setRegion] = useState<string | null>(null);
  const [pref, setPref] = useState<Pref | null>(null);
  const [city, setCity] = useState<City | null>(null);
  const [vb, setVb] = useState(FULL);
  const svg = useRef<SVGSVGElement>(null);
  // quiz
  const [order, setOrder] = useState<Pref[]>([]);
  const [qi, setQi] = useState(0);
  const [score, setScore] = useState(0);
  const [flash, setFlash] = useState<{ id: number; ok: boolean } | null>(null);

  useEffect(() => {
    if (!region || !svg.current) { setVb(FULL); return; }
    const g = svg.current.querySelector(`[data-region="${region}"]`) as SVGGElement | null;
    if (!g) return;
    const b = g.getBBox(); const pad = Math.max(b.width, b.height) * 0.12;
    setVb(`${b.x - pad} ${b.y - pad} ${b.width + pad * 2} ${b.height + pad * 2}`);
  }, [region]);

  const startQuiz = () => { setMode("quiz"); setRegion(null); setOrder(shuffle(PREFS).slice(0, 10)); setQi(0); setScore(0); setFlash(null); };
  const target = mode === "quiz" ? order[qi] : null;
  useEffect(() => { if (target) speak(target.ja.replace(/[都道府県]$/, ""), { lang: pk.ttsLang }); }, [target?.id]); // eslint-disable-line

  const onPref = (p: Pref) => {
    tap();
    if (mode === "quiz" && target) {
      if (flash) return;
      const ok = p.id === target.id;
      recordAnswer(ok); if (ok) { setScore((x) => x + 1); award(3); }
      setFlash({ id: target.id, ok });
      window.setTimeout(() => { setFlash(null); if (qi + 1 >= order.length) { award(score + (ok ? 1 : 0) >= 8 ? 15 : 5); setQi(order.length); } else setQi(qi + 1); }, 1300);
      return;
    }
    setPref(p); speak(p.ja, { lang: pk.ttsLang, rate: s.rate });
  };

  const cities = useMemo(() => CITIES.filter((c) => c.name !== "Naha").map((c) => ({ c, xy: proj(c.lon, c.lat) })), []);
  const zoomed = vb !== FULL;
  const k = (M.w + 12) / (+vb.split(" ")[2] || M.w + 12); // zoom factor: keep labels the same size on screen
  const r = region ? regionOf(region) : null;
  const done = mode === "quiz" && qi >= order.length && order.length > 0;

  return (
    <div className="screen">
      <Header title="Map of Japan" sub="日本地図 · 8 regions · 47 prefectures" backTo="/explore" />
      <Seg value={mode} options={[["explore", "Explore"], ["quiz", "Find the prefecture"]]} onChange={(v) => (v === "quiz" ? startQuiz() : (setMode("explore"), setOrder([])))} />

      {mode === "quiz" && !done && target && (
        <div className="card mt12 center" style={{ padding: 12 }}>
          <div className="kicker">Question {qi + 1} / {order.length} · score {score}</div>
          <div className="row mt4" style={{ justifyContent: "center" }}><span className="jp" style={{ fontSize: 26, fontWeight: 800 }}>{target.ja}</span><Say text={target.ja} size="s" /></div>
          <div className="sm mu">{target.ro} - tap it on the map</div>
          {flash && <div className="sm mt4" style={{ fontWeight: 800, color: flash.ok ? "var(--matcha)" : "var(--shu)" }}>{flash.ok ? "正解！ Correct" : "It’s here - highlighted in green"}</div>}
        </div>
      )}
      {done && (
        <div className="card mt12 center tint-matcha">
          <div style={{ fontSize: 34, fontWeight: 800 }}>{score} / {order.length}</div>
          <div className="sm mu">{score >= 8 ? "すごい！ You know Japan’s map." : "Keep exploring - try again!"}</div>
          <button className="btn white mt12" onClick={startQuiz}><RotateCcw size={16} /> Play again</button>
        </div>
      )}

      <div className="card mt12" style={{ padding: 8, position: "relative" }}>
        <svg ref={svg} viewBox={vb} width="100%" style={{ display: "block", transition: "all .4s", touchAction: "manipulation" }} role="img" aria-label="Map of Japan">
          <rect x="4" y="10" width="88" height="66" rx="8" fill="none" stroke="var(--line-2)" strokeDasharray="3 3" />
          <text x="9" y="20" style={{ fontSize: 7, fill: "var(--ink-3)", fontWeight: 700 }}>Okinawa 沖縄</text>
          {REGIONS.map((rg) => (
            <g key={rg.id} data-region={rg.id}>
              {PREFS.filter((p) => p.region === rg.id).map((p) => {
                const isSel = pref?.id === p.id || (flash && flash.id === p.id);
                const dim = region && region !== rg.id;
                const fill = flash && flash.id === p.id ? "var(--matcha)" : isSel ? "var(--shu)" : rg.color;
                return <path key={p.id} d={M.paths[p.id]} fill={fill} fillOpacity={dim ? 0.18 : isSel || (flash && flash.id === p.id) ? 0.95 : 0.6} stroke="var(--surface)" strokeWidth={0.7 / k} strokeLinejoin="round" onClick={() => onPref(p)} style={{ cursor: "pointer" }} />;
              })}
            </g>
          ))}
          {mode === "explore" && cities.map(({ c, xy }) => (
            <g key={c.name} onClick={() => { tap(); setCity(c); speak(c.ja, { lang: pk.ttsLang }); }} style={{ cursor: "pointer" }}>
              <circle cx={xy[0]} cy={xy[1]} r={3 / k} fill="var(--ink)" stroke="var(--surface)" strokeWidth={1.2 / k} />
              <text x={xy[0] + 4 / k} y={xy[1] + 3 / k} style={{ fontSize: 8 / k, fontWeight: 800, fill: "var(--ink)", paintOrder: "stroke", stroke: "var(--surface)", strokeWidth: 2.5 / k }}>{c.name}</text>
            </g>
          ))}
        </svg>
        {zoomed && <button className="icon-btn" style={{ position: "absolute", right: 10, top: 10 }} aria-label="Show all of Japan" onClick={() => setRegion(null)}><ZoomOut size={18} /></button>}
      </div>

      {mode === "explore" && (<>
        <div className="xs mu mt8">Tap a prefecture to hear its name · tap a region below to zoom in · tap a city dot for travel tips.</div>
        <div className="chips mt8">
          {REGIONS.map((rg) => <button key={rg.id} className={"chip" + (region === rg.id ? " on" : "")} onClick={() => { tap(); setRegion(region === rg.id ? null : rg.id); }}><i style={{ width: 10, height: 10, borderRadius: 3, background: rg.color, display: "block" }} />{rg.name}</button>)}
        </div>
        {r && (
          <div className="card mt8">
            <div className="row"><span className="jp" style={{ fontSize: 22, fontWeight: 800 }}>{r.ja}</span><span className="mu">{r.ro}</span><Say text={r.ja} size="s" /></div>
            <div className="sm mt4">{r.about}</div>
            {s.showHindi && <div className="sm hi">{r.hi}</div>}
            <div className="row wrap gap6 mt8">{PREFS.filter((p) => p.region === r.id).map((p) => <button key={p.id} className="chip" onClick={() => onPref(p)}><span className="jp">{p.ja}</span></button>)}</div>
          </div>
        )}
        <div className="section-title"><h2>Japan in numbers</h2></div>
        <div className="list">{JAPAN_FACTS.map(([k, v]) => <div key={k} className="li" style={{ padding: "11px 16px" }}><span className="sm" style={{ fontWeight: 700, width: 100 }}>{k}</span><span className="sm grow">{v}</span></div>)}</div>
        <div className="section-title"><h2>Big cities</h2></div>
        <div className="grid2">{CITIES.map((c) => <button key={c.name} className="tile" style={{ minHeight: 80 }} onClick={() => { tap(); setCity(c); speak(c.ja, { lang: pk.ttsLang }); }}><span className="row gap6"><MapPin size={16} color="var(--shu)" /><span className="jp" style={{ fontWeight: 800, fontSize: 18 }}>{c.ja}</span></span><span className="t">{c.name}</span><span className="d">{c.pop}</span></button>)}</div>
        <button className="btn primary block mt16" onClick={startQuiz}><Target size={17} /> Play “Find the prefecture”</button>
        <div className="xs mu mt12">Map outlines: 地球地図日本 (Global Map Japan), Geospatial Information Authority of Japan (GSI).</div>
      </>)}

      <Sheet open={!!pref} onClose={() => setPref(null)}>{pref && (
        <div>
          <div className="row top">
            <div className="grow">
              <div className="kicker" style={{ color: regionOf(pref.region).color }}>{regionOf(pref.region).name} · {regionOf(pref.region).ja}</div>
              <div className="jp" style={{ fontSize: 40, fontWeight: 800, lineHeight: 1.15 }}>{pref.ja}</div>
              <div className="jp mu">{pref.kana} · {pref.ro}</div>
              <div style={{ fontWeight: 700 }}>{pref.en} Prefecture</div>
            </div>
            <div className="row gap6"><Say text={pref.ja} /><RecBtn text={pref.ja} ro={pref.ro} en={pref.en} size="m" /></div>
          </div>
          <div className="card flat mt12" style={{ padding: 12 }}>
            <div className="sm"><b>Capital:</b> {pref.capital}</div>
            <div className="sm mt4"><b>Famous for:</b> {pref.famous}</div>
            {s.showHindi && <div className="sm hi mt4">{pref.hi}</div>}
          </div>
          <div className="xs mu mt8">都 to = metropolis (Tokyo) · 道 dō = circuit (Hokkaido) · 府 fu = urban prefecture (Osaka, Kyoto) · 県 ken = prefecture</div>
        </div>
      )}</Sheet>
      <Sheet open={!!city} onClose={() => setCity(null)}>{city && (
        <div>
          <div className="row top">
            <div className="grow"><div className="kicker">City · population {city.pop}</div><div className="jp" style={{ fontSize: 40, fontWeight: 800 }}>{city.ja}</div><div className="mu">{city.ro} · {city.name}</div></div>
            <Say text={city.ja} />
          </div>
          <div className="sm mt8" style={{ lineHeight: 1.6 }}>{city.about}</div>
          <div className="card flat mt12 soft-gold" style={{ padding: 12, boxShadow: "none" }}><b className="sm">Tip:</b> <span className="sm">{city.tip}</span></div>
          {city.phrase && <div className="card flat mt12" style={{ padding: 12 }}>
            <div className="kicker">Useful here</div>
            <div className="row mt4"><div className="grow"><div className="jp" style={{ fontSize: 18 }}>{city.phrase[0]}</div><div className="xs mu2">{city.phrase[1]}</div><div className="sm">{city.phrase[2]}</div></div><Say text={city.phrase[0]} size="s" /><RecBtn text={city.phrase[0]} ro={city.phrase[1]} en={city.phrase[2]} /></div>
          </div>}
        </div>
      )}</Sheet>
    </div>
  );
}
