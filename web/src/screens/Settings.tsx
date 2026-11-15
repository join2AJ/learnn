import { useState } from "react";
import { Check, Download, RotateCcw, Upload, Volume2 } from "lucide-react";
import { dayKey, emitUi, exportAll, importAll, resetProgress, setSettings, toast, useSettings } from "../core/store";
import { appVersion, openExternal, openTtsSettings, speak, ttsStatus } from "../core/native";
import { PACKS } from "../packs/registry";
import { usePack } from "../pack";
import { Header, Seg, Switch, tap } from "../ui/kit";

export default function Settings() {
  const s = useSettings();
  const pk = usePack();
  const [confirm, setConfirm] = useState(false);
  const [backup, setBackup] = useState("");
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
            <span className="grow"><div className="t">{x.name} <span className="jp mu" style={{ fontWeight: 500 }}>{x.native}</span></div><div className="d">{x.status === "ready" ? x.tagline : "Planned — same engine, new content pack"}</div></span>
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
        <Row t="Japanese voice" d={tts.native ? (tts.ready ? (tts.voice ? "Installed ✓" : "Not installed — tap to install") : "Starting…") : "Using browser voices"}>
          {tts.native && <button className="btn sm" onClick={openTtsSettings}>Open</button>}
        </Row>
      </div>

      <div className="section-title"><h2>Pledge & help</h2></div>
      <div className="list">
        <Row t={s.pledge ? "Pledge: " + s.pledge.min + " min/day for 30 days" : "No pledge yet"} d={s.pledge ? "Started " + s.pledge.start + " — renew to start a new 30 days at your current goal" : "Promise a daily time and earn streak badges"}>
          <button className="btn sm" onClick={() => { setSettings({ pledge: { min: s.dailyGoalMin, start: dayKey(), days: 30 } }); toast("New 30-day pledge started", "ok"); }}>{s.pledge ? "Renew" : "Pledge"}</button>
        </Row>
        <Row t="Edit profile" d={[s.age, (s.reasons || []).join(", ")].filter(Boolean).join(" · ") || "Name, age, reasons"}><button className="btn sm" onClick={() => setSettings({ profiled: false })}>Edit</button></Row>
        <Row t="App tour" d="How to use each tab"><button className="btn sm" onClick={() => emitUi({ type: "tour" })}>Show</button></Row>
      </div>

      <div className="section-title"><h2>Backup</h2></div>
      <div className="card">
        <div className="sm mu">Progress is saved on this phone only. Copy the backup text somewhere safe (notes, email to yourself) and paste it back after reinstalling.</div>
        <div className="row mt12">
          <button className="btn sm grow" onClick={async () => { const t = exportAll(); setBackup(t); try { await navigator.clipboard.writeText(t); toast("Backup copied to clipboard", "ok"); } catch { toast("Select and copy the text below"); } }}><Download size={15} /> Export</button>
          <button className="btn sm grow" onClick={() => { try { importAll(backup); toast("Progress restored", "ok"); } catch { toast("That backup text is not valid", "warn"); } }} disabled={!backup.trim()}><Upload size={15} /> Import</button>
        </div>
        <textarea value={backup} onChange={(e) => setBackup(e.target.value)} placeholder="Backup text appears here, or paste one to import" style={{ width: "100%", minHeight: 70, marginTop: 10, borderRadius: 12, border: 0, boxShadow: "inset 0 0 0 1px var(--line)", background: "var(--surface-2)", padding: 10, fontSize: 11, fontFamily: "monospace" }} />
        {!confirm ? <button className="btn ghost block mt12" style={{ color: "var(--shu)" }} onClick={() => setConfirm(true)}><RotateCcw size={15} /> Reset all progress</button>
          : <div className="row mt12"><button className="btn grow" onClick={() => setConfirm(false)}>Cancel</button><button className="btn primary grow" onClick={() => { resetProgress(); setConfirm(false); toast("Progress reset"); }}>Yes, reset</button></div>}
      </div>

      <div className="section-title"><h2>About</h2></div>
      <div className="card sm" style={{ lineHeight: 1.6 }}>
        <div><b>Nihongo Path</b> · v2.4 ({appVersion()})</div>
        <div className="mu mt4">Built as a multi-language engine: each language is a content pack (scripts, words, grammar, culture, sounds). Japanese is the first pack.</div>
        <div className="mu mt8">Credits: stroke order from <a onClick={() => openExternal("https://kanjivg.tagaini.net")}>KanjiVG</a> (CC BY-SA 3.0, Ulrich Apel). Word ranks from Mindomax (OpenSubtitles + Tatoeba) and the wordfreq project. Example sentences were AI-written and reviewed; treat them as study material. Formant values are rounded literature averages.</div>
      </div>
    </div>
  );
}
