import { useMemo, useState } from "react";
import { PenLine, Zap } from "lucide-react";
import { go } from "../../core/router";
import { useProgress, useSettings } from "../../core/store";
import { isMastered } from "../../core/rewards";
import { speak } from "../../core/native";
import type { LetterCell } from "../../core/types";
import { usePack } from "../../pack";
import { toHira } from "../../packs/ja/kana";
import { Header, Say, Seg, Sheet, tap } from "../../ui/kit";
import { StrokeView } from "../../ui/StrokeView";

export default function KanaChart({ id }: { id: string }) {
  const pk = usePack();
  const s = useSettings();
  const p = useProgress();
  const [sel, setSel] = useState<LetterCell | null>(null);
  const alpha = pk.alphabets.find((a) => a.id === id) || pk.alphabets[0];
  const all = alpha.groups.flatMap((g) => g.rows.flatMap((r) => r.cells.filter(Boolean) as LetterCell[]));
  const mastered = all.filter((c) => isMastered(p.kana[c.ch])).length;

  return (
    <div className="screen">
      <Header title={alpha.name + " · " + alpha.native} sub={mastered + "/" + all.length + " mastered · tap any character"} backTo="/learn" />
      <Seg value={alpha.id} options={pk.alphabets.map((a) => [a.id, <span className="jp">{a.native}</span>] as [string, React.ReactNode])} onChange={(v) => go("/learn/kana/" + v, true)} />
      <div className="row mt12 gap6">
        <button className="btn primary sm grow" onClick={() => go("/practice/quiz/kana?set=" + alpha.id)}><Zap size={16} /> Quiz this script</button>
        <button className="btn sm grow" onClick={() => go("/practice/write?set=" + alpha.id)}><PenLine size={16} /> Writing</button>
      </div>
      <div className="sm mu mt12" style={{ lineHeight: 1.5 }}>{alpha.blurb}</div>

      {alpha.groups.map((g) => (
        <div key={g.id}>
          <div className="section-title"><h2>{g.title}</h2><span className="mu">{g.subtitle}</span></div>
          <div className="kgrid">
            {g.rows.map((r, ri) => (
              <div key={ri} className="krow" style={{ gridTemplateColumns: (r.label ? "18px " : "") + `repeat(${g.cols}, 1fr)` }}>
                {r.label && <div className="lab">{r.label}</div>}
                {r.cells.map((c, ci) => c ? (
                  <button key={ci} className={"kcell" + (alpha.id === "kanji" ? " kanji" : "") + (isMastered(p.kana[c.ch]) ? " m" : "")}
                    onClick={() => { tap(); setSel(c); speak(alpha.id === "kanji" ? c.ch : c.ch, { lang: pk.ttsLang, rate: s.rate }); }}>
                    <b>{c.ch}</b>
                    <span className="r">{alpha.id === "kanji" ? c.rom.split(" / ")[0] : c.rom}</span>
                    {s.showHindi && c.hint && alpha.id !== "kanji" && <span className="h">{c.hint}</span>}
                  </button>
                ) : <div key={ci} className="kcell empty" />)}
              </div>
            ))}
          </div>
          {g.note && <div className="card flat mt8 sm" style={{ background: "transparent", lineHeight: 1.55 }}>{g.note}</div>}
        </div>
      ))}

      {alpha.id !== "kanji" && (
        <div className="card mt16">
          <div style={{ fontWeight: 800 }}>Three rules to learn with the chart</div>
          <ul className="sm" style={{ lineHeight: 1.7, margin: "6px 0 0", paddingLeft: 18 }}>
            <li>Small <b className="jp">っ</b> doubles the next consonant: きって kitte (stamp) — like Hindi पक्का.</li>
            <li>Long vowels: hiragana adds あいう (おかあさん); katakana uses <b className="jp">ー</b> (コーヒー).</li>
            <li><b className="jp">は</b> is read “wa” and <b className="jp">へ</b> “e” when they are particles.</li>
          </ul>
        </div>
      )}

      <Sheet open={!!sel} onClose={() => setSel(null)}>{sel && <CellDetail c={sel} alphaId={alpha.id} mnemonic={alpha.mnemonics?.[sel.ch]} />}</Sheet>
    </div>
  );
}

function CellDetail({ c, alphaId, mnemonic }: { c: LetterCell; alphaId: string; mnemonic?: string }) {
  const pk = usePack();
  const s = useSettings();
  const p = useProgress();
  const stat = p.kana[c.ch];
  const examples = useMemo(() => {
    if (alphaId === "kanji") return pk.words.filter((w) => w.w.includes(c.ch)).slice(0, 3);
    const h = toHira(c.ch);
    return pk.words.filter((w) => (alphaId === "kata" ? w.r.includes(c.ch) || w.w.includes(c.ch) : w.r.startsWith(h))).slice(0, 3);
  }, [c, alphaId, pk]);
  return (
    <div>
      <div className="row top">
        <div className="grow">
          <div className="kicker">{alphaId === "kanji" ? "Kanji" : alphaId === "kata" ? "Katakana" : "Hiragana"}</div>
          <div style={{ fontSize: 30, fontWeight: 800, lineHeight: 1.1 }}>{c.rom}</div>
          {s.showHindi && c.hint && <div className="hi lg">{c.hint}</div>}
          {stat && <div className="xs mu mt4">Quiz: {stat.c} right · {stat.w} wrong {isMastered(stat) ? "· ✅ mastered" : ""}</div>}
        </div>
        <Say text={c.ch} />
      </div>
      <div className="mt12"><StrokeView ch={c.ch} size={200} /></div>
      <div className="xs mu center mt8">{pk.strokes[c.ch]?.length || "?"} strokes · first stroke in red · tap ↻ to replay</div>
      {mnemonic && <div className="card soft-gold mt12" style={{ boxShadow: "none" }}><div className="kicker">Memory trick</div><div className="mt4">{mnemonic}</div></div>}
      {examples.length > 0 && (
        <div className="mt12">
          <div className="kicker">In real words</div>
          {examples.map((w) => (
            <div key={w.n} className="ex">
              <div className="grow"><div className="j">{w.w} <span className="sm mu">{w.r !== w.w ? w.r : ""}</span></div><div className="e">{w.m}{s.showHindi && <span className="hi"> · {w.h}</span>}</div></div>
              <Say text={w.r} size="s" />
            </div>
          ))}
        </div>
      )}
      <button className="btn primary block mt16" onClick={() => go("/practice/write?ch=" + encodeURIComponent(c.ch))}><PenLine size={17} /> Practise writing {c.ch}</button>
    </div>
  );
}
