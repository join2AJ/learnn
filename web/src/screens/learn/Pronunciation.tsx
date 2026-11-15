import { useEffect } from "react";
import { AudioLines } from "lucide-react";
import { go } from "../../core/router";
import { updateProgress, useProgress, useSettings } from "../../core/store";
import { openExternal } from "../../core/native";
import { usePack } from "../../pack";
import { Header, Jp, Say } from "../../ui/kit";
import { RecBtn } from "../../ui/VoiceCompare";
import { LangPill } from "../../ui/icons";

export default function Pronunciation() {
  const pk = usePack();
  const s = useSettings();
  const p = useProgress();
  useEffect(() => { if (!p.roadmap.pron) updateProgress((q) => { q.roadmap.pron = true; }); }, []); // eslint-disable-line
  return (
    <div className="screen">
      <Header title="How to speak" sub="9 rules that make you sound natural" backTo="/learn" />
      <button className="card tap tint-plum" onClick={() => go("/lab")}>
        <div className="row"><AudioLines size={28} /><div className="grow"><div style={{ fontWeight: 800 }}>See your pronunciation</div><div className="sm mu">The Sound Lab draws a live spectrogram and shows where your vowels land vs native targets.</div></div></div>
      </button>
      {pk.pronunciation.map((t, i) => (
        <div className="card" key={t.id}>
          <div className="row"><span className="tag" style={{ background: "var(--shu)", color: "#fff" }}>{i + 1}</span><div style={{ fontWeight: 800, fontSize: 16 }}>{t.title}</div></div>
          <div className="prose sm mt8"><Jp text={t.text} /></div>
          <div className="cmp mt8">
            <div style={{ background: "var(--ai-soft)" }}><LangPill l="en" /><span><Jp text={t.en} /></span></div>
            {s.showHindi && <div style={{ background: "var(--gold-soft)" }}><LangPill l="hi" /><span><Jp text={t.hi} /></span></div>}
          </div>
          <div className="mt8">
            {t.examples.map((e) => (
              <div className="ex" key={e.jp + e.ro}>
                <div className="grow"><div className="j">{e.jp}</div><div className="r">{e.ro}</div><div className="e">{e.en}{s.showHindi && e.hi && <span className="hi"> · {e.hi}</span>}</div></div>
                <Say text={e.jp} size="s" />
                <Say text={e.jp} size="s" slow label="Play slowly" />
                <RecBtn text={e.jp} ro={e.ro} en={e.en} />
              </div>
            ))}
          </div>
        </div>
      ))}
      <button className="btn ghost block mt16" onClick={() => openExternal("https://www.youtube.com/results?search_query=" + encodeURIComponent("Japanese pronunciation guide for beginners"))}>▶ Watch pronunciation videos on YouTube</button>
    </div>
  );
}
