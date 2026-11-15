import { useMemo, useState } from "react";
import { ArrowRight, BookHeart, Check, ChevronDown, Copy, Heart, Mail, MessageCircle, Send, Share2, Smartphone } from "lucide-react";
import { go } from "../core/router";
import { SupportBlock } from "./Support";
import { ABOUT_ME, BUILD_CONTACT } from "../support";
import { APP_VERSION } from "../changelog";
import { openExternal, shareText } from "../core/native";
import { contentStats } from "../core/contentStats";
import { usePack } from "../pack";
import { useSettings } from "../core/store";
import { Header, tap } from "../ui/kit";
import { toast } from "../core/store";

/** Category → sub-categories for app requests. */
export const APP_CATEGORIES: Record<string, string[]> = {
  "Education & learning": ["Language learning", "School / coaching institute", "Exam preparation", "Kids learning", "Online courses", "Quiz & flashcards"],
  "Business": ["Shop / e-commerce", "Restaurant / food ordering", "Booking & appointments", "Inventory & billing", "Staff / attendance", "Customer loyalty"],
  "Health & fitness": ["Workout & yoga", "Diet & nutrition", "Clinic / doctor booking", "Habit & meditation", "Period / pregnancy tracker"],
  "Community & personal": ["Society / club / NGO", "Temple / religious", "Events & weddings", "Family organiser", "Portfolio / personal brand"],
  "Utilities & productivity": ["Notes & to-do", "Expense / budget tracker", "Scanner & documents", "Reminders & alarms", "Calculator / converter"],
  "Games & entertainment": ["Puzzle / quiz game", "Kids game", "Music / audio", "Story / comic reader"],
  "Other": ["Something else - I’ll describe it"],
};
const FEATURES = ["User login / accounts", "Works offline", "Payments (UPI / cards)", "Push notifications", "Chat / messaging", "Maps & location", "Camera / photo upload", "Audio / voice", "Video", "Admin dashboard", "Multiple languages (English / Hindi / …)", "Reports & charts", "Booking / calendar", "Website too", "iPhone (iOS) too", "Play Store publishing"];
const BUDGETS = ["Under ₹10,000", "₹10,000 – 25,000", "₹25,000 – 50,000", "₹50,000 – 1 lakh", "₹1 – 3 lakh", "Above ₹3 lakh", "Not sure - advise me"];
const TIMELINES = ["As soon as possible", "Within 1 month", "1 – 3 months", "Flexible"];
const STAGES = ["Just an idea", "Have a design / sketch", "Have an existing app to improve"];

export function BuildApp() {
  const st = useSettings();
  const [cat, setCat] = useState("");
  const [sub, setSub] = useState("");
  const [feat, setFeat] = useState<string[]>([]);
  const [budget, setBudget] = useState("");
  const [time, setTime] = useState("");
  const [stage, setStage] = useState("");
  const [name, setName] = useState(st.name || "");
  const [contact, setContact] = useState("");
  const [desc, setDesc] = useState("");
  const [copied, setCopied] = useState(false);

  const ready = !!(cat && sub && budget && name.trim() && contact.trim() && desc.trim().length >= 10);
  const missing = [!cat && "category", cat && !sub && "sub-category", !budget && "budget", !name.trim() && "your name", !contact.trim() && "how to reach you", desc.trim().length < 10 && "a short description"].filter(Boolean);
  const text = [
    "New app request (from Nihongo Path v" + APP_VERSION + ")",
    "",
    "Name: " + name.trim(),
    "Contact: " + contact.trim(),
    "Category: " + cat + " > " + sub,
    "Stage: " + (stage || "-"),
    "Features: " + (feat.length ? feat.join(", ") : "-"),
    "Budget: " + budget,
    "Timeline: " + (time || "-"),
    "",
    "About the app:",
    desc.trim(),
  ].join("\n");
  const subject = "App request: " + (sub || cat || "new app");

  const copy = async () => {
    try { await navigator.clipboard.writeText(text); setCopied(true); toast("Request copied"); }
    catch { toast("Couldn't copy - select the text below"); }
  };
  const send = (via: "mail" | "wa" | "share") => {
    tap();
    if (via === "mail") openExternal(`mailto:${BUILD_CONTACT.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`);
    else if (via === "wa") openExternal(`https://wa.me/${BUILD_CONTACT.whatsapp}?text=${encodeURIComponent(text)}`);
    else if (!shareText(subject, text)) copy();
  };
  const toggle = (f: string) => setFeat((x) => (x.includes(f) ? x.filter((y) => y !== f) : [...x, f]));

  return (
    <div className="screen">
      <Header title="Build an app like this" sub="Tell us what you need - we will build it for you" backTo="/me/about" />
      <div className="card" style={{ padding: "4px 16px" }}>
      <Step n={1} title="What kind of app?">
        <div className="chips" style={{ flexWrap: "wrap" }}>{Object.keys(APP_CATEGORIES).map((c) => <button key={c} className={"chip" + (cat === c ? " on" : "")} onClick={() => { tap(); setCat(c); setSub(APP_CATEGORIES[c].length === 1 ? APP_CATEGORIES[c][0] : ""); }}>{c}</button>)}</div>
        {cat && <><div className="xs mu mt12" style={{ fontWeight: 700 }}>Sub-category</div>
          <div className="chips mt4" style={{ flexWrap: "wrap" }}>{APP_CATEGORIES[cat].map((x) => <button key={x} className={"chip" + (sub === x ? " on" : "")} onClick={() => { tap(); setSub(x); }}>{x}</button>)}</div></>}
      </Step>

      <Step n={2} title="Which features?" hint="Pick all that apply">
        <div className="chips" style={{ flexWrap: "wrap" }}>{FEATURES.map((f) => <button key={f} className={"chip" + (feat.includes(f) ? " on" : "")} onClick={() => { tap(); toggle(f); }}>{feat.includes(f) && <Check size={13} />}{f}</button>)}</div>
      </Step>

      <Step n={3} title="Budget you are ready to spend">
        <div className="chips" style={{ flexWrap: "wrap" }}>{BUDGETS.map((b) => <button key={b} className={"chip" + (budget === b ? " on" : "")} onClick={() => { tap(); setBudget(b); }}>{b}</button>)}</div>
        <div className="xs mu mt12" style={{ fontWeight: 700 }}>When do you need it?</div>
        <div className="chips mt4" style={{ flexWrap: "wrap" }}>{TIMELINES.map((b) => <button key={b} className={"chip" + (time === b ? " on" : "")} onClick={() => { tap(); setTime(b); }}>{b}</button>)}</div>
        <div className="xs mu mt12" style={{ fontWeight: 700 }}>Where are you now?</div>
        <div className="chips mt4" style={{ flexWrap: "wrap" }}>{STAGES.map((b) => <button key={b} className={"chip" + (stage === b ? " on" : "")} onClick={() => { tap(); setStage(b); }}>{b}</button>)}</div>
      </Step>

      <Step n={4} title="Tell me about it">
        <textarea className="ta" rows={4} value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="What should the app do? Who will use it? Any app you like as an example?" style={{ width: "100%", resize: "vertical" }} />
        <input type="text" className="mt8" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" style={{ width: "100%" }} />
        <input type="text" className="mt8" value={contact} onChange={(e) => setContact(e.target.value)} placeholder="Phone / WhatsApp or email" style={{ width: "100%" }} />
        <div className="xs mu mt8">Only sent when you press a button below, through your own email or WhatsApp. Nothing is stored or uploaded by this app.</div>
      </Step>

      </div>
      {!ready && <div className="xs mu mt12 center">Still needed: {missing.join(", ")}</div>}
      <div className="col gap8 mt12">
        {BUILD_CONTACT.whatsapp && <button className="btn primary block" disabled={!ready} onClick={() => send("wa")}><MessageCircle size={17} /> Send on WhatsApp</button>}
        {BUILD_CONTACT.email && <button className={"btn block " + (BUILD_CONTACT.whatsapp ? "white" : "primary")} disabled={!ready} onClick={() => send("mail")}><Mail size={17} /> Send by email</button>}
        {!BUILD_CONTACT.whatsapp && !BUILD_CONTACT.email && <button className="btn primary block" disabled={!ready} onClick={() => send("share")}><Share2 size={17} /> Send request</button>}
        <button className="btn white block" disabled={!ready} onClick={copy}>{copied ? <Check size={17} /> : <Copy size={17} />} {copied ? "Copied" : "Copy request"}</button>
      </div>
      {ready && <details className="mt12"><summary className="xs mu" style={{ fontWeight: 700 }}><Send size={12} style={{ verticalAlign: -2 }} /> Preview</summary><pre className="card flat xs mt8" style={{ whiteSpace: "pre-wrap", fontFamily: "inherit" }}>{text}</pre></details>}
    </div>
  );
}

function Step({ n, title, hint, children }: { n: number; title: string; hint?: string; children: React.ReactNode }) {
  return (
    <div style={{ padding: "16px 0", borderTop: n > 1 ? "1px solid var(--line)" : "none" }}>
      <div className="row" style={{ marginBottom: 10 }}>
        <span className="xs" style={{ fontWeight: 800, color: "var(--ink-3)", width: 18 }}>{n}</span>
        <div className="grow" style={{ fontWeight: 800 }}>{title}</div>
        {hint && <span className="xs mu">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

/** App description + developer story (shown on About and Support). */
export function AboutBlock() {
  const pk = usePack();
  const stats = useMemo(() => contentStats(pk), [pk]);
  return (
    <div className="card" style={{ marginTop: 0 }}>
      <div className="row" style={{ gap: 12, marginBottom: 8 }}>
        <span className="jp" style={{ width: 46, height: 46, borderRadius: 14, display: "grid", placeItems: "center", background: "var(--shu)", color: "#fff", fontSize: 26, fontWeight: 800, flex: "none" }}>道</span>
        <div><div style={{ fontWeight: 800, fontSize: 18 }}>Nihongo Path</div><div className="jp xs mu">日本語の道</div></div>
      </div>
      <div className="sm" style={{ lineHeight: 1.6 }}>A free, offline, beginner-first way to learn Japanese - with English and Hindi side by side. {stats.words.toLocaleString()} words in spoken-frequency order, {(stats.sentences + stats.sentenceBank).toLocaleString()} example sentences, all kana with stroke order, grammar, verbs, culture, a map of Japan, and a voice lab that shows your pronunciation.</div>
      <div className="xs mu mt8">No ads · no account · your data stays on your phone.</div>
    </div>
  );
}

/** Collapsible section: closed until tapped. */
function Fold({ id, open, onToggle, icon, title, sub, tone, children }: { id: string; open: boolean; onToggle: () => void; icon: React.ReactNode; title: string; sub: string; tone?: string; children: React.ReactNode }) {
  return (
    <div id={id} className={"card mt12 " + (tone || "")} style={{ padding: 0, overflow: "hidden", ...(tone ? { boxShadow: "none" } : {}) }}>
      <button className="row" style={{ width: "100%", padding: 16, background: "none", border: 0, color: "inherit", textAlign: "left", gap: 12 }} aria-expanded={open} onClick={() => { tap(); onToggle(); }}>
        <span style={{ width: 40, height: 40, borderRadius: 12, display: "grid", placeItems: "center", flex: "none", background: tone ? "rgba(255,255,255,.2)" : "var(--surface-2)" }}>{icon}</span>
        <span className="grow"><div style={{ fontWeight: 800, fontSize: 16 }}>{title}</div><div className="xs" style={{ opacity: 0.8 }}>{sub}</div></span>
        <ChevronDown size={20} style={{ transition: "transform .25s", transform: open ? "rotate(180deg)" : "none", flex: "none" }} />
      </button>
      {open && <div style={{ padding: "0 16px 16px", animation: "screenIn .3s both" }}>{children}</div>}
    </div>
  );
}

export default function About() {
  const start = /open=(\w+)/.exec(location.hash)?.[1] || "";
  const [open, setOpen] = useState<string>(start);
  const toggle = (k: string) => setOpen(open === k ? "" : k);
  return (
    <div className="screen">
      <Header title="About us" sub={"Nihongo Path · version " + APP_VERSION} backTo="/me" />
      <AboutBlock />
      <Fold id="story" open={open === "story"} onToggle={() => toggle("story")} icon={<BookHeart size={20} />} title="Our story" sub={ABOUT_ME.title}>
        {ABOUT_ME.paragraphs.map((t, i) => <p key={i} className="sm" style={{ lineHeight: 1.65, margin: i ? "10px 0 0" : 0 }}>{t}</p>)}
      </Fold>
      <Fold id="support" open={open === "support"} onToggle={() => toggle("support")} icon={<Heart size={20} color="#fff" />} title="Support us" sub="Donate or share - keep it free for every learner" tone="tint-sakura">
        <SupportBlock />
      </Fold>
      <Fold id="build" open={open === "build"} onToggle={() => toggle("build")} icon={<Smartphone size={20} color="#fff" />} title="Build an app like this" sub="We will build your Android app for you" tone="tint-ai">
        <div className="sm" style={{ lineHeight: 1.55 }}>For a shop, school, clinic, community or your own idea - choose the type of app, the features you want and your budget, and we will build it for you.</div>
        <button className="btn white block mt12" onClick={() => go("/me/build")}>Request your app <ArrowRight size={16} /></button>
      </Fold>
    </div>
  );
}
