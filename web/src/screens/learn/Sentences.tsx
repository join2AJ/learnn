import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { useSettings } from "../../core/store";
import { usePack } from "../../pack";
import { Header, Say } from "../../ui/kit";
import { RecBtn } from "../../ui/VoiceCompare";

interface Sent { jp: string; ro: string; en: string; hi: string; lvl: number; z: number }
const LEVELS: [string, number][] = [["Top 100 words", 100], ["Top 300", 300], ["Top 600", 600], ["Top 1,000", 1000], ["Top 2,000", 2000]];
const lvlLabel = (l: number) => (l <= 100 ? "only top-100 words" : l <= 300 ? "top-300 words" : l <= 600 ? "top-600 words" : l <= 1000 ? "top-1,000 words" : "top-2,000 words");

/** 3,200 real Japanese sentences (Tatoeba), easiest and most common first. */
export default function Sentences() {
  const s = useSettings();
  const [all, setAll] = useState<Sent[] | null>(null);
  const [lvl, setLvl] = useState(300);
  const [q, setQ] = useState("");
  const [limit, setLimit] = useState(30);
  const pk = usePack();
  useEffect(() => { setAll(null); pk.loadSentences?.().then((d) => setAll(d as Sent[])); }, [pk.id]);
  const list = useMemo(() => {
    if (!all) return [];
    const t = q.trim().toLowerCase();
    return all.filter((x) => x.lvl <= lvl && (!t || x.jp.includes(q.trim()) || x.en.toLowerCase().includes(t) || x.ro.includes(t)));
  }, [all, lvl, q]);
  return (
    <div className="screen">
      <Header title="Sentence bank" sub={(all ? all.length.toLocaleString() : "3,200") + " real sentences · simplest & most common first"} backTo="/learn" />
      <div className="card soft-ai" style={{ boxShadow: "none" }}>
        <div className="sm" style={{ lineHeight: 1.55 }}>Every sentence is real {pk.name} written by people, ordered by how common its words are. Pick a level: “Top 300” shows sentences built <b>only</b> from the 300 most-spoken words, so you can read them early.</div>
      </div>
      <div className="chips mt12">{LEVELS.map(([l, v]) => <button key={v} className={"chip" + (lvl === v ? " on" : "")} onClick={() => { setLvl(v); setLimit(30); }}>{l}</button>)}</div>
      <div style={{ position: "relative" }} className="mt8">
        <Search size={18} style={{ position: "absolute", left: 14, top: 14 }} className="mu2" />
        <input type="search" placeholder={"Search " + pk.name + " or English"} value={q} onChange={(e) => { setQ(e.target.value); setLimit(30); }} style={{ paddingLeft: 40 }} />
      </div>
      <div className="sm mu mt8">{all ? list.length.toLocaleString() + " sentences" : "Loading…"}</div>
      {list.slice(0, limit).map((x, i) => (
        <div key={x.jp + i} className="card" style={{ padding: 12 }}>
          <div className="row top">
            <div className="grow">
              <div className="jp" style={{ fontSize: 18, lineHeight: 1.45 }}>{x.jp}</div>
              {s.showRomaji && <div className="xs mu2" style={{ fontStyle: "italic" }}>{x.ro}</div>}
              <div className="sm">{x.en}</div>
              {s.showHindi && x.hi && <div className="sm hi">{x.hi}</div>}
              <div className="xs mu mt4">Uses {lvlLabel(x.lvl)}</div>
            </div>
            <div className="col gap6"><Say text={x.jp} size="s" /><Say text={x.jp} size="s" slow /><RecBtn text={x.jp} ro={x.ro} en={x.en} /></div>
          </div>
        </div>
      ))}
      {limit < list.length && <button className="btn block mt12" onClick={() => setLimit(limit + 40)}>Show more ({(list.length - limit).toLocaleString()})</button>}
      <div className="xs mu mt12">Sentences from Tatoeba (tatoeba.org), CC BY 2.0 FR. Romaji is generated automatically.</div>
    </div>
  );
}
