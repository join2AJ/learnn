import { useState } from "react";
import { Check, Download, RotateCcw, Volume2 } from "lucide-react";
import { dayKey, emitUi, resetProgress, setSettings, toast, useSettings } from "../core/store";
import { appVersion, openTtsSettings, speak, ttsStatus } from "../core/native";
import { PACKS } from "../packs/registry";
import { usePack } from "../pack";
import { go } from "../core/router";
import { deleteMedia } from "../core/privacy";
import { contentStats } from "../core/contentStats";
import { APP_VERSION } from "../changelog";
import { Header, Seg, Switch, tap , Fold } from "../ui/kit";
import { GoalEditor } from "../ui/Goal";

export default function Settings() {
  const s = useSettings();
  const pk = usePack();
  const [confirm, setConfirm] = useState(false);
  const tts = ttsStatus();
  const Row = ({ t, d, children }: { t: string; d?: string; children: React.ReactNode }) => (
    <div className="li"><span className="grow"><div className="t">{t}</div>{d && <div className="d">{d}</div>}</span>{children}</div>
  );
  return (
    <div className="screen">
      <Header title="Settings" backTo="/me" />

      <div className="section-title" style={{ marginTop: 6 }}><h2>Language</h2></div>
      <div className="list">
        {PACKS.map((x) => (
          <button key={x.id} className="li" disabled={x.status !== "ready"} style={{ opacity: x.status === "ready" ? 1 : .5 }} onClick={() => { tap(); setSettings({ lang: x.id }); }}>
            <span className="ico soft-gold" style={{ fontSize: 22 }}>{x.flag}</span>
            <span className="grow"><div className="t">{x.name} <span className="jp mu" style={{ fontWeight: 500 }}>{x.native}</span></div><div className="d">{x.status === "ready" ? x.tagline : "Planned - same engine, new content pack"}</div></span>
            {s.lang === x.id && <Check color="var(--matcha)" />}
          </button>
        ))}
      </div>

      <div className="section-title"><h2>Profile & goals</h2></div>
      <div className="list">
        <div className="li"><span className="grow"><div className="t">Name</div><input type="text" value={s.name} onChange={(e) => setSettings({ name: e.target.value })} placeholder="Your name" className="mt8" /></span></div>
        <div className="li" style={{ display: "block" }}><div className="t">Daily goal · {s.dailyGoalMin} min</div><input type="range" min={5} max={120} step={5} value={s.dailyGoalMin} onChange={(e) => setSettings({ dailyGoalMin: +e.target.value })} className="mt8" /></div>
        <div className="li" style={{ display: "block" }}><div className="t">New words per day · {s.newPerDay}</div><input type="range" min={5} max={40} step={5} value={s.newPerDay} onChange={(e) => setSettings({ newPerDay: +e.target.value })} className="mt8" /></div>
      </div>

      <div className="section-title"><h2>Personal goal</h2></div>
      <div className="card"><GoalEditor /></div>

      <div className="section-title"><h2>Display</h2></div>
      <div className="list">
        <Row t="Show Hindi (हिन्दी)" d="Meanings and comparisons"><Switch on={s.showHindi} onChange={(v) => setSettings({ showHindi: v })} /></Row>
        <Row t="Show romaji" d="Turn off once you can read kana"><Switch on={s.showRomaji} onChange={(v) => setSettings({ showRomaji: v })} /></Row>
        <Row t="Vibration" d="Haptic feedback on taps"><Switch on={s.haptics} onChange={(v) => setSettings({ haptics: v })} /></Row>
        <div className="li" style={{ display: "block" }}><div className="t" style={{ marginBottom: 8 }}>Theme</div><Seg value={s.theme} options={[["auto", "Auto"], ["light", "Light"], ["dark", "Dark"]]} onChange={(v) => setSettings({ theme: v })} /></div>
      </div>

      <div className="section-title"><h2>Voice</h2></div>
      <div className="list">
        <Row t="Auto-play audio" d="Speak cards and quiz items automatically"><Switch on={s.autoplay} onChange={(v) => setSettings({ autoplay: v })} /></Row>
        <div className="li" style={{ display: "block" }}>
          <div className="row"><div className="t grow">Speech speed · {s.rate.toFixed(2)}×</div><button className="btn sm" onClick={() => speak("こんにちは、日本語を勉強しましょう。", { lang: pk.ttsLang, rate: s.rate })}><Volume2 size={15} /> Test</button></div>
          <input type="range" min={0.5} max={1.3} step={0.05} value={s.rate} onChange={(e) => setSettings({ rate: +e.target.value })} className="mt8" />
        </div>
        <Row t="Japanese voice" d={tts.native ? (tts.ready ? (tts.voice ? "Installed ✓" : "Not installed - tap to install") : "Starting…") : "Using browser voices"}>
          {tts.native && <button className="btn sm" onClick={openTtsSettings}>Open</button>}
        </Row>
      </div>

      <div className="section-title"><h2>Pledge & help</h2></div>
      <div className="list">
        <Row t={s.pledge ? "Pledge: " + s.pledge.min + " min/day for 30 days" : "No pledge yet"} d={s.pledge ? "Started " + s.pledge.start + " - renew to start a new 30 days at your current goal" : "Promise a daily time and earn streak badges"}>
          <button className="btn sm" onClick={() => { setSettings({ pledge: { min: s.dailyGoalMin, start: dayKey(), days: 30 } }); toast("New 30-day pledge started", "ok"); }}>{s.pledge ? "Renew" : "Pledge"}</button>
        </Row>
        <Row t="Edit profile" d={[s.age, (s.reasons || []).join(", ")].filter(Boolean).join(" · ") || "Name, age, reasons"}><button className="btn sm" onClick={() => setSettings({ profiled: false })}>Edit</button></Row>
        <Row t="Privacy & your data" d="What is stored, what leaves the phone, delete everything"><button className="btn sm" onClick={() => go("/me/privacy")}>Open</button></Row>
        <Row t="Support the app" d="Optional - the app stays free"><button className="btn sm" onClick={() => go("/me/support")}>Open</button></Row>
        <Row t="App tour" d="How to use each tab"><button className="btn sm" onClick={() => emitUi({ type: "tour" })}>Show</button></Row>
        <Row t="What’s new" d={"Changes in v" + APP_VERSION + " and earlier"}><button className="btn sm" onClick={() => emitUi({ type: "whatsnew" })}>Show</button></Row>
      </div>

      <div className="section-title"><h2>Backup</h2></div>
      <button className="card tap" onClick={() => go("/me/backup")}>
        <div className="row"><Download size={22} color="var(--ai)" /><div className="grow"><div style={{ fontWeight: 800 }}>Backup & restore</div><div className="xs mu">{s.backup.last ? "Last: " + new Date(s.backup.last).toLocaleString() : "No backup yet"} · auto: {s.backup.auto}</div></div></div>
      </button>
      <div className="card mt12">
        {!confirm ? <button className="btn ghost block" style={{ color: "var(--shu)" }} onClick={() => setConfirm(true)}><RotateCcw size={15} /> Reset all progress</button>
          : <div className="col"><div className="sm" style={{ color: "var(--shu)", fontWeight: 700 }}>Reset progress, recordings and drawings? Settings stay.</div><div className="row"><button className="btn grow" onClick={() => setConfirm(false)}>Cancel</button><button className="btn primary grow" onClick={async () => { await deleteMedia(); resetProgress(); setConfirm(false); toast("Progress, recordings and drawings reset"); }}>Yes, reset</button></div></div>}
      </div>

      <Fold title="What’s inside" summary={contentStats(pk).words.toLocaleString() + " words · " + (contentStats(pk).sentences + contentStats(pk).sentenceBank).toLocaleString() + " sentences · tap for everything"}>
      {(() => { const c = contentStats(pk); const items: [string, string][] = [
        ["Core words (most spoken first)", c.words.toLocaleString()], ["Example sentences", c.sentences.toLocaleString()], ["Sentence bank (Tatoeba)", c.sentenceBank.toLocaleString()], ["Hindi translations", c.hindi.toLocaleString()],
        ["Grammar lessons", c.lessons + " in " + c.units + " units"], ["Core grammar words", String(c.coreGrammar)], ["Lesson quiz questions", String(c.lessonQuiz)],
        ["Survival phrases", c.phrases + " in " + c.phraseGroups + " topics"], ["Hiragana / Katakana", c.hiragana + " / " + c.katakana], ["Starter kanji", String(c.kanji)],
        ["Stroke-order characters", String(c.strokeChars)], ["Memory tricks", String(c.mnemonics)], ["Verbs to conjugate", c.verbs + " × 20 forms = " + c.verbForms.toLocaleString()],
        ["Culture insights", c.cultureItems + " in " + c.culture + " sections"], ["Pronunciation rules", String(c.pron)], ["Sound Lab references", c.sounds + " sounds · " + c.vowels + " vowels · " + c.pitchWords + " pitch words"],
        ["Quiz types", c.quizTypes + " (+" + (c.sentenceBuilder + c.particleQuiz) + " builder/particle items)"], ["Badges", String(c.badges)], ["Videos & resources", c.resources + " (" + c.youtube + " YouTube)"],
      ]; return (
        <div className="list">{items.map(([k, v]) => <div key={k} className="li" style={{ padding: "11px 16px" }}><span className="grow sm" style={{ fontWeight: 600 }}>{k}</span><span className="sm" style={{ fontWeight: 800 }}>{v}</span></div>)}
          <div className="li" style={{ display: "block" }}><div className="xs mu">Words by type: {Object.entries(c.types).sort((a, b) => b[1] - a[1]).map(([t, n]) => t + " " + n).join(" · ")}</div></div></div>); })()}
      </Fold>

      <div className="section-title"><h2>About</h2></div>
      <div className="card sm" style={{ lineHeight: 1.6 }}>
        <div><b>Nihongo Path</b> · v{APP_VERSION} ({appVersion()})</div>
        <button className="mu mt8 xs" style={{ background: "none", border: 0, padding: 0, textDecoration: "underline", color: "var(--ink-3)" }} onClick={() => go("/me/licenses")}>Licences</button>
      </div>
    </div>
  );
}
