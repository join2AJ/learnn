import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, MapPin, RotateCcw, Target, ZoomOut } from "lucide-react";
import map from "../packs/ja/data/japan_map.json";
import { CITIES, City, JAPAN_FACTS, Pref, PREFS, REGIONS } from "../packs/ja/japan";
import { useSettings } from "../core/store";
import { award, recordAnswer } from "../core/rewards";
import { speak } from "../core/native";
import { usePack } from "../pack";
import { Header, Say, Seg, Sheet, shuffle, tap } from "../ui/kit";
import { RecBtn } from "../ui/VoiceCompare";
import { SIGHTS, Sight } from "../packs/ja/attractions";
import { kindColor, SightGrid, SightSheet } from "../ui/Sights";

/** Geography labels: [x, y, text, jp, kind] in map coordinates. */
const SEAS: [number, number, string, string][] = [[60, 140, "Sea of Japan", "日本海"], [215, 300, "Pacific Ocean", "太平洋"], [48, 330, "East China Sea", "東シナ海"]];
const LANDS: [number, number, string][] = [[2, 196, "← Korea"], [96, 18, "Russia ↑"], [20, 92, "← China"]];

const M = map as { w: number; h: number; minx: number; miny: number; sc: number; lat0: number; paths: Record<string, string> };
const proj = (lon: number, lat: number) => [(lon * Math.cos((M.lat0 * Math.PI) / 180) - M.minx) * M.sc, (-lat - M.miny) * M.sc];
const regionOf = (id: string) => REGIONS.find((r) => r.id === id)!;
const GEO = {
  fuji: proj(138.73, 35.36), biwa: proj(136.08, 35.25),
  alps: [proj(137.55, 36.85), proj(137.65, 36.3), proj(137.7, 35.75), proj(138.1, 35.3)],
  islands: [[...proj(142.8, 43.5), "HOKKAIDO"], [...proj(139.6, 37.9), "HONSHU"], [...proj(133.4, 33.65), "SHIKOKU"], [...proj(130.85, 32.7), "KYUSHU"]] as [number, number, string][],
};
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
  const [layer, setLayer] = useState<"pref" | "geo" | "sights">("pref");
  const [sight, setSight] = useState<Sight | null>(null);
  const svg = useRef<SVGSVGElement>(null);
  // quiz
  const [order, setOrder] = useState<Pref[]>([]);
  const [qi, setQi] = useState(0);
  const [score, setScore] = useState(0);
  const [flash, setFlash] = useState<{ id: number; ok: boolean; tapped: number } | null>(null);

  useEffect(() => {
    if (!region || !svg.current) { setVb(FULL); return; }
    const g = svg.current.querySelector(`[data-region="${region}"]`) as SVGGElement | null;
    if (!g) return;
    const b = g.getBBox(); const pad = Math.max(b.width, b.height) * 0.12;
    setVb(`${b.x - pad} ${b.y - pad} ${b.width + pad * 2} ${b.height + pad * 2}`);
  }, [region]);

  const startQuiz = () => { setMode("quiz"); setRegion(null); setOrder(shuffle(PREFS).slice(0, 10)); setQi(0); setScore(0); setFlash(null); };
  const next = () => { tap(); setFlash(null); if (qi + 1 >= order.length) { award(score >= 8 ? 15 : 5); setQi(order.length); } else setQi(qi + 1); };
  const target = mode === "quiz" ? order[qi] : null;
  useEffect(() => { if (target) speak(target.ja.replace(/[都道府県]$/, ""), { lang: pk.ttsLang }); }, [target?.id]); // eslint-disable-line

  const onPref = (p: Pref) => {
    tap();
    if (mode === "quiz" && target) {
      if (flash) return;
      const ok = p.id === target.id;
      recordAnswer(ok); if (ok) { setScore((x) => x + 1); award(3); }
      setFlash({ id: target.id, ok, tapped: p.id });
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
          {flash && <>
            <div className="sm mt4" style={{ fontWeight: 800, color: flash.ok ? "var(--matcha)" : "var(--shu)" }}>{flash.ok ? "正解！ Correct - " + target.en + " is in " + regionOf(target.region).name : "Not quite - " + target.en + " is the green one" + (PREFS.find((x) => x.id === flash.tapped) ? " (you tapped " + PREFS.find((x) => x.id === flash.tapped)!.en + ", in red)" : "")}</div>
            <button className="btn primary block mt8" onClick={next}>{qi + 1 >= order.length ? "See score" : "Next"} <ArrowRight size={16} /></button>
          </>}
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
          {mode === "explore" && layer === "geo" && <rect x={-200} y={-200} width={M.w + 400} height={M.h + 400} fill="var(--ai)" fillOpacity={0.12} />}
          <rect x="4" y="10" width="88" height="66" rx="8" fill="none" stroke="var(--line-2)" strokeDasharray="3 3" />
          <text x="9" y="20" style={{ fontSize: 7, fill: "var(--ink-3)", fontWeight: 700 }}>Okinawa 沖縄</text>
          {REGIONS.map((rg) => (
            <g key={rg.id} data-region={rg.id}>
              {PREFS.filter((p) => p.region === rg.id).map((p) => {
                if (flash) {
                  const isAns = p.id === flash.id, isWrong = !flash.ok && p.id === flash.tapped;
                  return <path key={p.id} d={M.paths[p.id]} fill={isAns ? "var(--matcha)" : isWrong ? "var(--shu)" : "var(--ink-3)"} fillOpacity={isAns || isWrong ? 1 : 0.12} stroke={isAns ? "#fff" : "var(--surface)"} strokeWidth={(isAns ? 1.6 : 0.7) / k} strokeLinejoin="round" style={{ transition: "fill-opacity .35s" }} />;
                }
                const isSel = pref?.id === p.id;
                const dim = region && region !== rg.id;
                const plain = mode === "explore" && layer !== "pref";
                const fill = isSel ? "var(--shu)" : plain ? (layer === "geo" ? "#8fb87a" : "var(--ink-3)") : rg.color;
                return <path key={p.id} d={M.paths[p.id]} fill={fill} fillOpacity={dim ? 0.18 : isSel ? 0.95 : plain ? (layer === "geo" ? 0.85 : 0.28) : 0.6} stroke="var(--surface)" strokeWidth={0.7 / k} strokeLinejoin="round" onClick={() => onPref(p)} style={{ cursor: "pointer" }} />;
              })}
            </g>
          ))}
          {mode === "explore" && layer === "geo" && (<g style={{ pointerEvents: "none" }}>
            {SEAS.map(([x, y, t, j]) => <text key={t} x={x} y={y} textAnchor="middle" style={{ fontSize: 8 / k, fontStyle: "italic", fill: "var(--ai)", fontWeight: 700 }}>{t}<tspan x={x} dy={9 / k} className="jp" style={{ fontStyle: "normal" }}>{j}</tspan></text>)}
            {LANDS.map(([x, y, t]) => <text key={t} x={x} y={y} style={{ fontSize: 7.5 / k, fill: "var(--ink-3)", fontWeight: 700 }}>{t}</text>)}
            <path d={`M${GEO.alps.map((q) => q.join(",")).join(" L")}`} fill="none" stroke="#7a5c3e" strokeWidth={5 / k} strokeOpacity={0.45} strokeLinecap="round" strokeLinejoin="round" />
            <text x={GEO.alps[0][0] - 6 / k} y={GEO.alps[0][1] - 4 / k} textAnchor="end" style={{ fontSize: 7 / k, fill: "#7a5c3e", fontWeight: 800, paintOrder: "stroke", stroke: "var(--surface)", strokeWidth: 2 / k }}>Japanese Alps</text>
            <path d={`M${GEO.fuji[0] - 6 / k},${GEO.fuji[1] + 4 / k} L${GEO.fuji[0]},${GEO.fuji[1] - 7 / k} L${GEO.fuji[0] + 6 / k},${GEO.fuji[1] + 4 / k} Z`} fill="#6b6f7a" stroke="#fff" strokeWidth={0.8 / k} />
            <path d={`M${GEO.fuji[0] - 2.3 / k},${GEO.fuji[1] - 2.8 / k} L${GEO.fuji[0]},${GEO.fuji[1] - 7 / k} L${GEO.fuji[0] + 2.3 / k},${GEO.fuji[1] - 2.8 / k} Z`} fill="#fff" />
            <text x={GEO.fuji[0] + 7 / k} y={GEO.fuji[1] + 8 / k} style={{ fontSize: 7 / k, fontWeight: 800, fill: "var(--ink)", paintOrder: "stroke", stroke: "var(--surface)", strokeWidth: 2 / k }}>Mt Fuji 3,776 m</text>
            <ellipse cx={GEO.biwa[0]} cy={GEO.biwa[1]} rx={2.4 / k} ry={5 / k} fill="var(--ai)" fillOpacity={0.8} />
            <text x={GEO.biwa[0] - 4 / k} y={GEO.biwa[1] + 12 / k} textAnchor="end" style={{ fontSize: 6.5 / k, fontWeight: 700, fill: "var(--ai)", paintOrder: "stroke", stroke: "var(--surface)", strokeWidth: 2 / k }}>Lake Biwa</text>
            {GEO.islands.map(([x, y, t]) => <text key={t} x={x} y={y} textAnchor="middle" style={{ fontSize: 9 / k, fontWeight: 800, fill: "#2f4a24", letterSpacing: 1 }}>{t}</text>)}
          </g>)}
          {mode === "explore" && layer === "sights" && SIGHTS.map((g) => { const [x, y] = proj(g.lon, g.lat); const on = sight?.id === g.id; return (
            <g key={g.id} onClick={() => { tap(); setSight(g); }} style={{ cursor: "pointer" }}>
              <circle cx={x} cy={y} r={(on ? 6.5 : 5) / k} fill={kindColor(g.kind)} stroke="var(--surface)" strokeWidth={1.4 / k} />
              <circle cx={x} cy={y} r={1.6 / k} fill="var(--surface)" />
            </g>); })}
          {mode === "explore" && layer === "pref" && cities.map(({ c, xy }) => (
            <g key={c.name} onClick={() => { tap(); setCity(c); speak(c.ja, { lang: pk.ttsLang }); }} style={{ cursor: "pointer" }}>
              <circle cx={xy[0]} cy={xy[1]} r={3 / k} fill="var(--ink)" stroke="var(--surface)" strokeWidth={1.2 / k} />
              <text x={xy[0] + 4 / k} y={xy[1] + 3 / k} style={{ fontSize: 8 / k, fontWeight: 800, fill: "var(--ink)", paintOrder: "stroke", stroke: "var(--surface)", strokeWidth: 2.5 / k }}>{c.name}</text>
            </g>
          ))}
        </svg>
        {zoomed && <button className="icon-btn" style={{ position: "absolute", right: 10, top: 10 }} aria-label="Show all of Japan" onClick={() => setRegion(null)}><ZoomOut size={18} /></button>}
      </div>

      {mode === "explore" && (<>
        <div className="mt8"><Seg value={layer} options={[["pref", "Prefectures"], ["geo", "Landscape"], ["sights", "Sights"]]} onChange={(v) => { tap(); setLayer(v as typeof layer); }} /></div>
        {layer === "geo" && <div className="card mt8" style={{ padding: 12 }}>
          <div style={{ fontWeight: 800 }}>What Japan looks like</div>
          <div className="sm mt4" style={{ lineHeight: 1.6 }}>Japan is a chain of 14,000+ islands about 3,000 km long - four big ones: <b>Hokkaido</b> (snowy north), <b>Honshu</b> (main island: Tokyo, Kyoto, Osaka), <b>Shikoku</b> and <b>Kyushu</b>, plus subtropical <b>Okinawa</b>. About 73% is mountains and forest, so most people live on narrow coastal plains. It sits on the Pacific “Ring of Fire” with 111 active volcanoes - which also gives it thousands of hot springs.</div>
          {s.showHindi && <div className="sm hi mt4">जापान 14,000 से ज़्यादा द्वीपों की 3,000 किमी लंबी श्रृंखला है - 73% हिस्सा पहाड़ और जंगल है।</div>}
        </div>}
        {layer === "sights" && <div className="xs mu mt8">Tap a dot to see the place. Colours: <b style={{ color: kindColor("Shrine") }}>shrine</b> · <b style={{ color: kindColor("Temple") }}>temple</b> · <b style={{ color: kindColor("Castle") }}>castle</b> · <b style={{ color: kindColor("Nature") }}>nature</b> · <b style={{ color: kindColor("City") }}>city</b></div>}
        {layer === "sights" && <><div className="section-title"><h2>Famous places</h2><span className="mu">{SIGHTS.length}</span></div><SightGrid /></>}
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
        <div className="xs mu mt12">Map outlines: 地球地図日本 (Global Map Japan), Geospatial Information Authority of Japan (GSI). Photos: Wikimedia Commons contributors (credited on each place).</div>
      </>)}

      <SightSheet s={sight} onClose={() => setSight(null)} />
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
