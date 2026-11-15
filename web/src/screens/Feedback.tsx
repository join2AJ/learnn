import { useMemo, useState } from "react";
import { Bug, Check, Copy, Heart, Lightbulb, Mail, MessageCircle, Share2, Star } from "lucide-react";
import { getProgress, getSettings, toast, useSettings } from "../core/store";
import { levelOf, totalMs } from "../core/rewards";
import { appVersion, deviceInfo, openExternal, shareText, ttsStatus } from "../core/native";
import { APP_VERSION } from "../changelog";
import { BUILD_CONTACT } from "../support";
import { Header, Switch, tap } from "../ui/kit";

type Kind = "thanks" | "problem" | "idea";
const PROBLEMS: Record<string, string[]> = {
  "Audio & voice": ["No sound", "Wrong pronunciation", "Voice too fast / slow"],
  "Speaking & recording": ["Mic not working", "Speech not recognised", "Recording not saved", "Voice analysis looks wrong"],
  "Learning content": ["Wrong meaning", "Wrong Hindi", "Wrong reading / romaji", "Typo", "Missing word or topic"],
  "Practice": ["Flashcards", "Quiz", "Writing pad", "Map game"],
  "Progress & rewards": ["XP / level wrong", "Streak lost", "Badge not unlocked", "Stats wrong"],
  "Backup & data": ["Backup failed", "Restore failed", "Cloud backup", "Lost progress"],
  "Display & speed": ["Layout broken", "Text too small / large", "Dark mode", "Slow or freezes", "App crashes"],
  "Other": ["Something else"],
};
const IDEAS = ["New feature", "More words / lessons", "New language", "Design", "Other"];
const OFTEN = ["Every time", "Sometimes", "Happened once"];

/** Thanks, problem reports and ideas - sent by the user's own WhatsApp / email / share sheet. */
export default function Feedback() {
  const s = useSettings();
  const [kind, setKind] = useState<Kind>("thanks");
  const [stars, setStars] = useState(5);
  const [cat, setCat] = useState("");
  const [sub, setSub] = useState("");
  const [often, setOften] = useState("");
  const [msg, setMsg] = useState("");
  const [steps, setSteps] = useState("");
  const [name, setName] = useState(s.name || "");
  const [contact, setContact] = useState("");
  const [diag, setDiag] = useState(true);
  const [copied, setCopied] = useState(false);

  const info = useMemo(() => {
    const p = getProgress(), st = getSettings(), d = deviceInfo(), lv = levelOf(p.xp), tts = ttsStatus();
    const active = Object.values(p.days).filter((x) => x.ms > 60000).length;
    const rows: [string, string][] = [
      ["App version", APP_VERSION + " (" + appVersion() + ")"],
      ["Device", [d.manufacturer, d.model].filter(Boolean).join(" ") || String(d.model || "-")],
      ["Android", d.android ? d.android + " (SDK " + d.sdk + ")" : "-"],
      ["WebView", String(d.webview || "-")],
      ["Screen", String(d.screen || "-")],
      ["Language", String(d.locale || navigator.language)],
      ["Installed", d.installed ? new Date(Number(d.installed)).toLocaleDateString() : "-"],
      ["Joined (first study)", new Date(p.started).toLocaleDateString()],
      ["Level / XP", lv.level + " / " + p.xp],
      ["Words known", String(p.known.length)],
      ["Streak (best)", p.streak.count + " (" + p.streak.best + ")"],
      ["Active days", String(active)],
      ["Study time", Math.round(totalMs(p) / 60000) + " min"],
      ["Badges", String(Object.keys(p.badges).length)],
      ["Recordings", String((p.voiceLog || []).length)],
      ["Japanese voice", tts.voice ? "installed" : "missing"],
      ["Settings", `hindi ${st.showHindi ? "on" : "off"}, romaji ${st.showRomaji ? "on" : "off"}, speed ${st.rate}, theme ${st.theme}`],
      ["Last backup", st.backup.last ? new Date(st.backup.last).toLocaleString() : "never"],
    ];
    return rows;
  }, []);

  const ready = kind === "thanks" ? msg.trim().length >= 2 : kind === "problem" ? !!(cat && sub && msg.trim().length >= 10) : !!(cat && msg.trim().length >= 10);
  const subject = kind === "thanks" ? "Thank you - Nihongo Path" : kind === "problem" ? `Problem: ${cat} > ${sub}` : `Idea: ${cat}`;
  const text = [
    `[${kind === "thanks" ? "THANK YOU" : kind === "problem" ? "PROBLEM REPORT" : "IDEA"}] Nihongo Path v${APP_VERSION}`,
    "",
    kind === "thanks" ? "Rating: " + "★".repeat(stars) + "☆".repeat(5 - stars) : kind === "problem" ? `Category: ${cat} > ${sub}\nHow often: ${often || "-"}` : `Area: ${cat}`,
    "",
    msg.trim(),
    ...(kind === "problem" && steps.trim() ? ["", "Steps to reproduce:", steps.trim()] : []),
    "",
    "From: " + (name.trim() || "-") + (contact.trim() ? " · " + contact.trim() : ""),
    ...(diag ? ["", "--- Device & app details ---", ...info.map(([k, v]) => k + ": " + v)] : []),
  ].join("\n");

  const send = (via: "wa" | "mail" | "share") => {
    tap();
    if (via === "wa") openExternal(`https://wa.me/${BUILD_CONTACT.whatsapp}?text=${encodeURIComponent(text)}`);
    else if (via === "mail") openExternal(`mailto:${BUILD_CONTACT.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`);
    else if (!shareText(subject, text)) copy();
  };
  const copy = async () => { try { await navigator.clipboard.writeText(text); setCopied(true); toast("Copied", "ok"); } catch { toast("Couldn't copy", "warn"); } };
  const pick = (k: Kind) => { tap(); setKind(k); setCat(""); setSub(""); setDiag(k !== "thanks"); };

  return (
    <div className="screen">
      <Header title="Send feedback" sub="We read every message" backTo="/me/settings" />
      <div className="grid3" style={{ gap: 8 }}>
        {([["thanks", "Say thanks", Heart, "tint-sakura"], ["problem", "Report a problem", Bug, "tint-shu"], ["idea", "Suggest an idea", Lightbulb, "tint-ai"]] as const).map(([k, t, I, tone]) => (
          <button key={k} className={"card tap " + (kind === k ? tone : "")} style={{ margin: 0, padding: "14px 8px", textAlign: "center", boxShadow: kind === k ? undefined : "none", outline: kind === k ? "none" : "1px solid var(--line)" }} onClick={() => pick(k)}>
            <I size={22} /><div className="sm" style={{ fontWeight: 800, marginTop: 6, lineHeight: 1.2 }}>{t}</div>
          </button>
        ))}
      </div>

      <div className="card mt12">
        {kind === "thanks" && (<>
          <div style={{ fontWeight: 800 }}>How do you like Nihongo Path?</div>
          <div className="row mt8" style={{ gap: 6 }}>{[1, 2, 3, 4, 5].map((n) => <button key={n} aria-label={n + " stars"} onClick={() => { tap(); setStars(n); }} style={{ background: "none", border: 0, padding: 2 }}><Star size={34} color="var(--gold)" fill={n <= stars ? "var(--gold)" : "none"} /></button>)}</div>
          <textarea className="ta mt12" rows={4} value={msg} onChange={(e) => setMsg(e.target.value)} placeholder="Your message - what helped you most? ありがとう！" />
        </>)}
        {kind === "problem" && (<>
          <div style={{ fontWeight: 800 }}>What is the problem about?</div>
          <div className="chips mt8" style={{ flexWrap: "wrap" }}>{Object.keys(PROBLEMS).map((c) => <button key={c} className={"chip" + (cat === c ? " on" : "")} onClick={() => { tap(); setCat(c); setSub(PROBLEMS[c].length === 1 ? PROBLEMS[c][0] : ""); }}>{c}</button>)}</div>
          {cat && <><div className="xs mu mt12" style={{ fontWeight: 700 }}>What exactly?</div><div className="chips mt4" style={{ flexWrap: "wrap" }}>{PROBLEMS[cat].map((x) => <button key={x} className={"chip" + (sub === x ? " on" : "")} onClick={() => { tap(); setSub(x); }}>{x}</button>)}</div></>}
          <div className="xs mu mt12" style={{ fontWeight: 700 }}>How often?</div>
          <div className="chips mt4" style={{ flexWrap: "wrap" }}>{OFTEN.map((x) => <button key={x} className={"chip" + (often === x ? " on" : "")} onClick={() => { tap(); setOften(x); }}>{x}</button>)}</div>
          <textarea className="ta mt12" rows={4} value={msg} onChange={(e) => setMsg(e.target.value)} placeholder="Describe what went wrong (which screen, which word…)" />
          <textarea className="ta mt8" rows={3} value={steps} onChange={(e) => setSteps(e.target.value)} placeholder="Steps to make it happen again (optional)" />
        </>)}
        {kind === "idea" && (<>
          <div style={{ fontWeight: 800 }}>What is your idea about?</div>
          <div className="chips mt8" style={{ flexWrap: "wrap" }}>{IDEAS.map((c) => <button key={c} className={"chip" + (cat === c ? " on" : "")} onClick={() => { tap(); setCat(c); }}>{c}</button>)}</div>
          <textarea className="ta mt12" rows={4} value={msg} onChange={(e) => setMsg(e.target.value)} placeholder="Tell us your idea" />
        </>)}
        <input type="text" className="mt12" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name (optional)" />
        <input type="text" className="mt8" value={contact} onChange={(e) => setContact(e.target.value)} placeholder="Email or WhatsApp, if you want a reply (optional)" />
      </div>

      <div className="card mt12">
        <div className="row"><div className="grow"><div style={{ fontWeight: 800 }}>Include device & app details</div><div className="xs mu">Helps us fix problems faster</div></div><Switch on={diag} onChange={setDiag} /></div>
        {diag && <details className="mt8"><summary className="xs" style={{ fontWeight: 700, color: "var(--shu)" }}>See exactly what is included</summary>
          <div className="mt8">{info.map(([k, v]) => <div key={k} className="row xs" style={{ padding: "3px 0" }}><span className="mu" style={{ width: 130, flex: "none" }}>{k}</span><span className="grow" style={{ fontWeight: 600 }}>{v}</span></div>)}</div>
        </details>}
        <div className="xs mu mt8">Nothing is uploaded by the app. Your message goes only through the app you pick below, and only when you press send.</div>
      </div>

      {!ready && <div className="xs mu mt12 center">{kind === "thanks" ? "Write a short message" : kind === "problem" ? "Pick a category, what exactly, and describe it (10+ characters)" : "Pick an area and describe your idea"}</div>}
      <div className="col gap8 mt12">
        {BUILD_CONTACT.whatsapp && <button className="btn primary block" disabled={!ready} onClick={() => send("wa")}><MessageCircle size={17} /> Send on WhatsApp</button>}
        {BUILD_CONTACT.email && <button className={"btn block " + (BUILD_CONTACT.whatsapp ? "white" : "primary")} disabled={!ready} onClick={() => send("mail")}><Mail size={17} /> Send by email</button>}
        {!BUILD_CONTACT.whatsapp && !BUILD_CONTACT.email && <button className="btn primary block" disabled={!ready} onClick={() => send("share")}><Share2 size={17} /> Send</button>}
        <button className="btn white block" disabled={!ready} onClick={copy}>{copied ? <Check size={17} /> : <Copy size={17} />} {copied ? "Copied" : "Copy message"}</button>
      </div>
    </div>
  );
}
