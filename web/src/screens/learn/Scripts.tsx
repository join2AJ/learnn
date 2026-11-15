import { useEffect } from "react";
import { ArrowRight } from "lucide-react";
import { go } from "../../core/router";
import { updateProgress, useProgress } from "../../core/store";
import { usePack } from "../../pack";
import { Header, Jp, Md, Say } from "../../ui/kit";
import { LangPill } from "../../ui/icons";

export default function Scripts() {
  const pk = usePack();
  const p = useProgress();
  useEffect(() => { if (!p.roadmap.scripts) updateProgress((q) => { q.roadmap.scripts = true; }); }, []); // eslint-disable-line
  const sample = "私はインドから来ました。";
  return (
    <div className="screen">
      <Header title="The scripts" sub="What the ‘alphabets’ are and how they compare" backTo="/learn" />

      <div className="card hero tint-ink">
        <div className="kicker">One sentence, three scripts</div>
        <div className="row mt8">
          <div className="jp grow" style={{ fontSize: 26, lineHeight: 1.5 }}>
            <span style={{ color: "#9fe0a9" }}>私</span><span style={{ color: "#ffb39f" }}>は</span><span style={{ color: "#a9bdf5" }}>インド</span><span style={{ color: "#ffb39f" }}>から</span><span style={{ color: "#9fe0a9" }}>来</span><span style={{ color: "#ffb39f" }}>ました。</span>
          </div>
          <Say text={sample} />
        </div>
        <div className="sm mu">watashi wa indo kara kimashita — “I came from India.” · मैं भारत से आया हूँ।</div>
        <div className="row wrap mt12 gap6 xs">
          <span className="tag" style={{ background: "rgba(159,224,169,.2)", color: "#c8f0cf" }}>Kanji = meaning</span>
          <span className="tag" style={{ background: "rgba(255,179,159,.2)", color: "#ffd3c7" }}>Hiragana = grammar</span>
          <span className="tag" style={{ background: "rgba(169,189,245,.2)", color: "#d2ddfb" }}>Katakana = foreign words</span>
        </div>
      </div>

      {pk.scriptsIntro.map((s) => (
        <div className="card" key={s.title}><div style={{ fontWeight: 800 }}>{s.title}</div><div className="prose sm mt4"><Md text={s.text} /></div></div>
      ))}

      <div className="section-title"><h2>Open each script</h2></div>
      {pk.alphabets.map((a) => (
        <button key={a.id} className="card tap" onClick={() => go("/learn/kana/" + a.id)}>
          <div className="row">
            <div className="jp" style={{ width: 64, height: 64, borderRadius: 20, display: "grid", placeItems: "center", background: a.color, color: "#fff", fontSize: 26, fontWeight: 700, flex: "none" }}>{a.native.slice(0, 1)}</div>
            <div className="grow">
              <div style={{ fontWeight: 800, fontSize: 17 }}>{a.name} <span className="jp mu" style={{ fontWeight: 500 }}>{a.native}</span></div>
              <div className="xs mu">{a.count}</div>
              <div className="sm mt4">{a.blurb}</div>
              <div className="xs mu mt4"><b>Used for:</b> <Md text={a.usedFor} /></div>
            </div>
            <ArrowRight size={18} className="mu2" />
          </div>
        </button>
      ))}

      <div className="section-title"><h2>English vs Hindi vs Japanese</h2></div>
      <div className="tbl-wrap" style={{ background: "var(--surface)" }}>
        <table className="tbl">
          <thead><tr>{pk.compareTable.head.map((h) => <th key={h}>{h}</th>)}</tr></thead>
          <tbody>{pk.compareTable.rows.map((r) => <tr key={r[0]}>{r.map((c, i) => <td key={i}><Jp text={c} /></td>)}</tr>)}</tbody>
        </table>
      </div>

      <div className="card soft-gold mt16" style={{ boxShadow: "none" }}>
        <div className="row gap6" style={{ fontWeight: 800 }}><LangPill l="hi" /> Hindi speakers: a big head start</div>
        <div className="sm mt4" style={{ lineHeight: 1.6 }}>The kana chart (a i u e o · ka ki ku ke ko) was organised by Buddhist scholars who studied Sanskrit — it follows the same phonetic logic as <span className="hi">अ इ उ ए ओ · क कि कु के को</span>. Each kana is a syllable just like a Devanagari letter with its मात्रा.</div>
      </div>
      <button className="btn primary lg block mt16" onClick={() => go("/learn/kana/hira")}>Start hiragana <ArrowRight size={18} /></button>
    </div>
  );
}
