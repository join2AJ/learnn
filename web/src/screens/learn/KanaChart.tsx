import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, PenLine, Zap } from "lucide-react";
import { go } from "../../core/router";
import { useProgress, useSettings } from "../../core/store";
import { isMastered } from "../../core/rewards";
import { speak } from "../../core/native";
import type { LetterCell } from "../../core/types";
import { usePack } from "../../pack";
import { Header, Say, Seg, Sheet, tap } from "../../ui/kit";
import { StrokeView } from "../../ui/StrokeView";
import { RecBtn } from "../../ui/VoiceCompare";

export default function KanaChart({ id }: { id: string }) {
  const pk = usePack();
  const s = useSettings();
  const p = useProgress();
  const [sel, setSel] = useState<LetterCell | null>(null);
  const alpha = pk.alphabets.find((a) => a.id === id) || pk.alphabets[0];
  const all = alpha.groups.flatMap((g) => g.rows.flatMap((r) => r.cells.filter(Boolean) as LetterCell[]));
  const mastered = all.filter((c) => isMastered(p.kana[c.ch])).length;
  // NEXT = first row with an unmastered character; TODAY = your calendar day of the 7-day kana plan
  let todayRow = "", nextDay = 0;
  if (alpha.id !== "kanji") for (const g of alpha.groups) { const ri = g.rows.findIndex((r) => r.cells.some((c) => c && !isMastered(p.kana[c.ch]))); if (ri >= 0) { todayRow = g.id + ri; nextDay = parseInt(g.rows[ri].label.replace(/^.*Day /, "")) || 0; break; } }
  const startD = new Date(p.started); startD.setHours(0, 0, 0, 0);
  const now0 = new Date(); now0.setHours(0, 0, 0, 0);
  const planDay = Math.round((now0.getTime() - startD.getTime()) / 86_400_000) + 1 + (alpha.id === "kata" ? -7 : 0);
  const idx = sel ? all.findIndex((c) => c.ch === sel.ch) : -1;
  const step = (d: number) => { const c = all[(idx + d + all.length) % all.length]; tap(); setSel(c); speak(c.ch, { lang: pk.ttsLang, rate: s.rate }); };

  return (
    <div className="screen">
      <Header title={alpha.name + " · " + alpha.native} sub={mastered + "/" + all.length + " mastered · tap any character"} backTo="/learn" />
      <Seg value={alpha.id} options={pk.alphabets.map((a) => [a.id, <span className="jp">{a.native}</span>] as [string, React.ReactNode])} onChange={(v) => go("/learn/kana/" + v, true)} />
      <div className="row mt12 gap6">
        <button className="btn primary sm grow" onClick={() => go("/practice/quiz/kana?set=" + alpha.id)}><Zap size={16} /> Quiz this script</button>
        {pk.writing !== false && <button className="btn sm grow" onClick={() => go("/practice/write?set=" + alpha.id)}><PenLine size={16} /> Writing</button>}
      </div>
      <div className="sm mu mt12" style={{ lineHeight: 1.5 }}>{alpha.blurb}</div>
      {pk.id === "ja" && alpha.id !== "kanji" && nextDay > 0 && (
        <div className="card flat mt12" style={{ padding: "10px 12px" }}>
          <div className="sm"><b>Plan day {Math.max(1, planDay)}</b> of the 7-day {alpha.name.toLowerCase()} plan · next to learn: <b style={{ color: "var(--shu)" }}>Day {nextDay} rows</b></div>
          <div className="xs mu mt4">{nextDay > Math.max(1, planDay) ? "You’re ahead of schedule - great! Keep going or review." : nextDay < Math.max(1, planDay) ? "A little behind the plan - a few minutes today will catch you up." : "Right on schedule."} The plan day changes at midnight; NEXT moves when you master a row in quizzes.</div>
        </div>
      )}

      {alpha.groups.map((g, gi) => (
        <div key={g.id}>
          <div className="section-title"><h2>{g.title}</h2>{g.subtitle && <span className="tag" style={{ background: DAY_COL[gi % DAY_COL.length], color: "#fff", height: 26, fontSize: 12 }}>{g.subtitle.toUpperCase()}</span>}</div>
          <div className="kgrid">
            {g.rows.map((r, ri) => (
              <div key={ri} className="krow" style={{ gridTemplateColumns: (r.label ? "26px " : "") + `repeat(${g.cols}, 1fr)`, ...(todayRow === g.id + ri ? { outline: "2px solid var(--shu)", outlineOffset: 3, borderRadius: 16 } : {}) }}>
                {r.label && <DayLabel label={r.label} next={todayRow === g.id + ri} planDay={planDay} />}
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

      {pk.id !== "ja" && (
        <div className="card mt16">
          <div style={{ fontWeight: 800 }}>Three rules to read French</div>
          <ul className="sm" style={{ lineHeight: 1.7, margin: "6px 0 0", paddingLeft: 18 }}>
            <li>The last consonant is usually <b>silent</b>: peti(t), vou(s), Pari(s) - except c, r, f, l (sac, bonjour, neuf, mal).</li>
            <li>A final <b>-e</b> without accent is silent: un<b>e</b>, bell<b>e</b>. With an accent it is said: caf<b>é</b>.</li>
            <li><b>n</b> or <b>m</b> after a vowel makes it nasal (an, on, in) - unless another vowel follows: bon / bonne.</li>
          </ul>
        </div>
      )}
      {pk.id === "ja" && alpha.id !== "kanji" && (
        <div className="card mt16">
          <div style={{ fontWeight: 800 }}>Three rules to learn with the chart</div>
          <ul className="sm" style={{ lineHeight: 1.7, margin: "6px 0 0", paddingLeft: 18 }}>
            <li>Small <b className="jp">っ</b> doubles the next consonant: きって kitte (stamp) - like Hindi पक्का.</li>
            <li>Long vowels: hiragana adds あいう (おかあさん); katakana uses <b className="jp">ー</b> (コーヒー).</li>
            <li><b className="jp">は</b> is read “wa” and <b className="jp">へ</b> “e” when they are particles.</li>
          </ul>
        </div>
      )}

      <Sheet open={!!sel} onClose={() => setSel(null)}>{sel && <CellDetail key={sel.ch} c={sel} alphaId={alpha.id} mnemonic={alpha.mnemonics?.[sel.ch]} onStep={step} pos={(idx + 1) + " / " + all.length} />}</Sheet>
    </div>
  );
}

function CellDetail({ c, alphaId, mnemonic, onStep, pos }: { c: LetterCell; alphaId: string; mnemonic?: string; onStep: (d: number) => void; pos: string }) {
  const pk = usePack();
  const s = useSettings();
  const p = useProgress();
  const stat = p.kana[c.ch];
  const examples = useMemo(() => {
    if (alphaId === "kanji") return pk.words.filter((w) => w.w.includes(c.ch)).slice(0, 3);
    if (pk.id !== "ja") { const ch = c.ch.toLowerCase(); const bare = (w: string) => w.replace(/^(le |la |les |l'|un |une )/i, "").toLowerCase(); return pk.words.filter((w) => (ch.length === 1 && /[a-z]/.test(ch) ? bare(w.w).startsWith(ch) : bare(w.w).includes(ch))).slice(0, 3); }
    const h = c.ch.replace(/[ァ-ヶ]/g, (x) => String.fromCharCode(x.charCodeAt(0) - 0x60));
    return pk.words.filter((w) => (alphaId === "kata" ? w.r.includes(c.ch) || w.w.includes(c.ch) : w.r.startsWith(h))).slice(0, 3);
  }, [c, alphaId, pk]);
  return (
    <div>
      <div className="row top">
        <div className="grow">
          <div className="kicker">{pk.alphabets.find((a) => a.id === alphaId)?.name || alphaId}</div>
          <div style={{ fontSize: 30, fontWeight: 800, lineHeight: 1.1 }}>{c.rom}</div>
          {s.showHindi && c.hint && <div className="hi lg">{c.hint}</div>}
          {stat && <div className="xs mu mt4">Quiz: {stat.c} right · {stat.w} wrong {isMastered(stat) ? "· mastered ✓" : ""}</div>}
        </div>
        <div className="row gap6"><Say text={c.ch} /><RecBtn text={c.ch} ro={c.rom} size="m" /></div>
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
              <Say text={w.r} size="s" /><RecBtn text={w.w} ro={w.ro} en={w.m} />
            </div>
          ))}
        </div>
      )}
      <div className="row mt16" style={{ gap: 8 }}>
        <button className="btn" aria-label="Previous character" onClick={() => onStep(-1)}><ChevronLeft size={18} /> Prev</button>
        <button className="btn primary grow" onClick={() => go("/practice/write?ch=" + encodeURIComponent(c.ch))}><PenLine size={17} /> Write {c.ch}</button>
        <button className="btn" aria-label="Next character" onClick={() => onStep(1)}>Next <ChevronRight size={18} /></button>
      </div>
      <div className="xs mu center mt8">{pos} · use Next to move on without writing</div>
    </div>
  );
}

const DAY_COL = ["var(--shu)", "var(--ai)", "var(--plum)", "var(--matcha)"];
const DAYS = ["var(--shu)", "#e8793a", "var(--gold)", "var(--matcha)", "var(--ai)", "var(--plum)", "var(--sakura)"];
/** Row label as a coloured "Day N" pill; today's row is highlighted. */
function DayLabel({ label, next, planDay }: { label: string; next: boolean; planDay: number }) {
  const [row, day] = label.split(" · ");
  const n = parseInt((day || "").replace(/\D/g, "")) || 1;
  const today = n === Math.max(1, Math.min(7, planDay));
  const col = DAYS[(n - 1) % DAYS.length];
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 3 }}>
      <span style={{ writingMode: "vertical-rl", transform: "rotate(180deg)", fontSize: 10, fontWeight: 800, color: "#fff", background: col, borderRadius: 8, padding: "6px 3px", letterSpacing: ".04em" }}>{(day || "").toUpperCase()}</span>
      {(today || next) && <span style={{ fontSize: 8, fontWeight: 900, color: next ? "var(--shu)" : "var(--matcha)", letterSpacing: ".04em" }}>{next ? "NEXT" : "TODAY"}</span>}
      <span style={{ fontSize: 10, fontWeight: 800, color: "var(--ink-3)" }}>{row}</span>
    </div>
  );
}
