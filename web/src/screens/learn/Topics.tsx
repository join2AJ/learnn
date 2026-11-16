import { useMemo } from "react";
import { Layers } from "lucide-react";
import { go } from "../../core/router";
import { useProgress, useSettings } from "../../core/store";
import { usePack } from "../../pack";
import { Bar, Header, Say } from "../../ui/kit";
import { IconTile } from "../../ui/icons";
import { RecBtn } from "../../ui/VoiceCompare";
import { FreqMeter } from "../../core/freq";

/** Topic packs + JLPT level packs. */
export default function Topics({ id }: { id?: string }) {
  const pk = usePack();
  const p = useProgress();
  const known = useMemo(() => new Set(p.known), [p.known]);
  if (id) return <Pack id={id} />;
  const stat = (f: (w: typeof pk.words[0]) => boolean) => { const ws = pk.words.filter(f); return { n: ws.length, k: ws.filter((w) => known.has(w.n)).length }; };
  return (
    <div className="screen">
      <Header title="Topic packs" sub={"Learn words by theme or by " + (pk.exam?.name || "") + " level"} backTo="/learn" />
      <div className="section-title" style={{ marginTop: 6 }}><h2>By topic</h2><span className="mu">{(pk.topics || []).length} packs</span></div>
      <div className="grid2">
        {(pk.topics || []).map((t) => { const st = stat((w) => (w.tp || []).includes(t.id)); return (
          <button key={t.id} className="tile" onClick={() => go("/learn/topics/topic:" + t.id)}>
            <IconTile name={t.icon} tone={t.tone} size={44} icon={22} />
            <span className="t">{t.name}</span>
            <span className="d">{st.n} words · {st.k} known</span>
            <Bar pct={st.k / Math.max(1, st.n)} thin color={`var(--${t.tone})`} />
          </button>); })}
      </div>
      <div className="section-title"><h2>By JLPT level</h2><span className="mu">Japan’s official test</span></div>
      <div className="list">
        {pk.exam && Object.keys(pk.exam.levels).map(Number).sort((a, b) => b - a).map((n) => { const st = stat((w) => w.jlpt === n); return (
          <button key={n} className="li" onClick={() => go("/learn/topics/jlpt:" + n)}>
            <span className="ico" style={{ background: "var(--ai-soft)", color: "var(--ai)", fontWeight: 800 }}>N{n}</span>
            <span className="grow"><div className="t">{pk.exam!.name} {pk.exam!.levels[n].name} · {st.n} words</div><div className="d">{pk.exam!.levels[n].desc}</div><div className="mt8"><Bar pct={st.k / Math.max(1, st.n)} thin /></div></span>
          </button>); })}
      </div>
      <div className="xs mu mt12">{pk.exam?.note}</div>
    </div>
  );
}

function Pack({ id }: { id: string }) {
  const pk = usePack();
  const s = useSettings();
  const p = useProgress();
  const known = new Set(p.known);
  const topic = id.startsWith("topic:") ? (pk.topics || []).find((t) => t.id === id.slice(6)) : undefined;
  const jl = id.startsWith("jlpt:") ? +id.slice(5) : 0;
  const words = pk.words.filter((w) => (topic ? (w.tp || []).includes(topic.id) : w.jlpt === jl));
  const k = words.filter((w) => known.has(w.n)).length;
  return (
    <div className="screen">
      <Header title={topic ? topic.name : (pk.exam?.name || "") + " " + (pk.exam?.levels[jl]?.name || jl)} sub={words.length + " words · " + k + " known · most spoken first"} backTo="/learn/topics" />
      <div className={"card hero tint-" + (topic ? (["shu", "ai", "matcha", "plum", "gold"].includes(topic.tone) ? topic.tone : "shu") : "ai")}>
        <div className="row">{topic && <IconTile name={topic.icon} tone={topic.tone} size={48} icon={24} />}<div className="grow"><div style={{ fontWeight: 800, fontSize: 18 }}>{topic ? topic.name : (pk.exam?.name || "") + " " + (pk.exam?.levels[jl]?.name || jl)}</div><div className="sm mu">{topic ? (s.showHindi ? topic.hi : "") : pk.exam?.levels[jl]?.desc}</div></div></div>
        <div className="mt12"><Bar pct={k / Math.max(1, words.length)} white /></div>
        <button className="btn white block mt12" onClick={() => go("/practice/cards?deck=" + id)}><Layers size={17} /> Study this pack</button>
      </div>
      <div className="list mt12">
        {words.map((w) => (
          <div key={w.n} className="li" style={{ alignItems: "flex-start" }}>
            <div className="grow">
              <div className="row gap6"><span className="jp" style={{ fontSize: 20, fontWeight: 700 }}>{w.w}</span>{w.r !== w.w && <span className="jp sm mu">{w.r}</span>}{known.has(w.n) && <span className="tag" style={{ background: "var(--matcha)", color: "#fff" }}>known</span>}{w.jlpt && <span className="tag">{pk.exam?.short(w.jlpt)}</span>}</div>
              <div className="sm">{w.m}{s.showHindi && <span className="hi"> · {w.h}</span>}</div>
              <div className="mt4"><FreqMeter w={w} compact /></div>
            </div>
            <div className="row gap6"><Say text={w.r} size="s" /><RecBtn text={w.w} ro={w.ro} en={w.m} /></div>
          </div>
        ))}
      </div>
    </div>
  );
}
