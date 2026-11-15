import { useEffect, useMemo, useState } from "react";
import { ArrowRight, CheckCircle2, Circle, ExternalLink, Globe, Map, PlayCircle, Smartphone } from "lucide-react";
import type { Route } from "../core/router";
import { go } from "../core/router";
import { useProgress, useSettings } from "../core/store";
import { award } from "../core/rewards";
import { openExternal } from "../core/native";
import { checkTask, phaseProgress } from "../core/path";
import { usePack } from "../pack";
import { Bar, Header, Jp, Say, Seg } from "../ui/kit";
import { Icon, IconTile, LangPill } from "../ui/icons";

export default function Explore({ route }: { route: Route }) {
  const [, sub, id] = route.parts;
  if (sub === "culture") return id ? <CultureView id={id} /> : <CultureList />;
  if (sub === "roadmap") return <Roadmap />;
  if (sub === "resources") return <Resources />;
  return <Hub />;
}

const TONE: Record<string, [string, string]> = { like: ["soft-sakura", "var(--sakura)"], dislike: ["soft-shu", "var(--shu)"], do: ["soft-matcha", "var(--matcha)"], dont: ["soft-gold", "var(--gold)"], value: ["soft-plum", "var(--plum)"], info: ["soft-ai", "var(--ai)"] };

function Hub() {
  const pk = usePack();
  const p = useProgress();
  const phases = phaseProgress(pk, p);
  const cur = phases.find((x) => x.pct < 1) || phases[phases.length - 1];
  return (
    <div className="screen">
      <Header title="Explore" sub="Culture, your roadmap, videos and resources" />
      <button className="card tap hero tint-matcha" onClick={() => go("/explore/roadmap")}>
        <div className="watermark">道</div>
        <div className="kicker"><Map size={12} style={{ verticalAlign: -1 }} /> Roadmap · {cur.ph.when}</div>
        <div style={{ fontSize: 20, fontWeight: 800, margin: "2px 0 8px" }}>{cur.ph.title}</div>
        <Bar pct={cur.pct} white />
        <div className="xs mu mt4">{cur.done}/{cur.total} auto-checked tasks · tap for the full timeline</div>
      </button>

      <div className="section-title"><h2>Know the people · 日本の文化</h2><span className="mu">{Object.keys(p.culturesRead).length}/{pk.culture.length} read</span></div>
      <div className="grid2">
        {pk.culture.map((c) => (
          <button key={c.id} className={"tile " + TONE[c.tone][0]} style={{ boxShadow: "none" }} onClick={() => go("/explore/culture/" + c.id)}>
            <IconTile name={c.icon} tone={TONE[c.tone][1].slice(6, -1)} size={42} icon={21} />
            <span className="t">{c.title}</span>
            <span className="d">{c.items.length} insights {p.culturesRead[c.id] ? "· ✓" : ""}</span>
          </button>
        ))}
      </div>

      <div className="section-title"><h2>Watch & read</h2></div>
      <button className="card tap" onClick={() => go("/explore/resources")}>
        <div className="row"><span className="yt"><PlayCircle size={24} /></span><div className="grow"><div style={{ fontWeight: 800 }}>YouTube channels & resources</div><div className="sm mu">Comprehensible input, grammar, pitch accent, dictionaries, tutors</div></div><ArrowRight size={18} /></div>
      </button>
    </div>
  );
}

function CultureList() {
  const pk = usePack();
  return (
    <div className="screen">
      <Header title="Culture" backTo="/explore" />
      <div className="list">{pk.culture.map((c) => <button key={c.id} className="li" onClick={() => go("/explore/culture/" + c.id)}><IconTile name={c.icon} tone={TONE[c.tone][1].slice(6, -1)} size={38} icon={19} /><span className="grow"><div className="t">{c.title}</div><div className="d">{c.intro}</div></span></button>)}</div>
    </div>
  );
}

function CultureView({ id }: { id: string }) {
  const pk = usePack();
  const s = useSettings();
  const p = useProgress();
  const idx = pk.culture.findIndex((c) => c.id === id);
  const c = pk.culture[idx];
  useEffect(() => { if (c && !p.culturesRead[c.id]) award(5, (x) => { x.culturesRead[c.id] = true; }); }, [id]); // eslint-disable-line
  if (!c) return <div className="screen"><Header title="Not found" backTo="/explore" /></div>;
  const next = pk.culture[idx + 1];
  return (
    <div className="screen">
      <Header title={<span className="row" style={{ gap: 10 }}><IconTile name={c.icon} tone={TONE[c.tone][1].slice(6, -1)} size={34} icon={18} />{c.title}</span>} backTo="/explore" />
      <div className={"card " + TONE[c.tone][0]} style={{ boxShadow: "none" }}><div className="sm" style={{ fontWeight: 600, lineHeight: 1.55 }}>{c.intro}</div><div className="xs mu mt4">Tip: tap any <span className="jp-tap">日本語</span> to hear it.</div></div>
      {c.items.map((it, i) => (
        <div className="card" key={i} style={{ borderLeft: "4px solid " + TONE[c.tone][1] }}>
          <div style={{ fontWeight: 800, fontSize: 16 }}>{it.title}</div>
          {it.jp && <div className="row gap6"><span className="jp sm" style={{ color: TONE[c.tone][1], fontWeight: 600 }}>{it.jp}</span><Say text={it.jp.replace(/[(（].*$/, "").trim()} size="s" /></div>}
          <div className="sm mt4" style={{ lineHeight: 1.6 }}><Jp text={it.text} /></div>
          {it.india && s.showHindi && <div className="sm mt8 soft-gold" style={{ padding: "8px 10px", borderRadius: 12, lineHeight: 1.5, display: "flex", gap: 8 }}><LangPill l="hi" /><span><Jp text={it.india} /></span></div>}
        </div>
      ))}
      {next && <button className="btn primary block mt16" onClick={() => go("/explore/culture/" + next.id, true)}>Next: {next.title} <ArrowRight size={16} /></button>}
    </div>
  );
}

const JLPT: [string, string, string, string, string][] = [
  ["N5", "~800", "~100", "325–500 h", "Basic phrases, simple sentences"],
  ["N4", "~1,500", "~300", "575–1,000 h", "Everyday conversation, slowly"],
  ["N3", "~3,750", "~650", "950–1,700 h", "Everyday situations at near-natural speed"],
  ["N2", "~6,000", "~1,000", "1,600–2,600 h", "News, work, most TV"],
  ["N1", "~10,000", "~2,000", "3,000–4,800 h", "Complex, abstract Japanese"],
];

function Roadmap() {
  const pk = usePack();
  const p = useProgress();
  const s = useSettings();
  const phases = phaseProgress(pk, p);
  const [daily, setDaily] = useState(String(s.dailyGoalMin >= 45 ? 60 : s.dailyGoalMin >= 20 ? 30 : 15));
  const plan = useMemo(() => {
    const m = +daily;
    // words/day scale with time; kana week fixed. Hours from FSI-style estimates for N5.
    const wpd = m <= 15 ? 8 : m <= 30 ? 15 : m <= 60 ? 25 : 35;
    const kanaDays = m <= 15 ? 21 : m <= 30 ? 14 : 10;
    const wordDays = Math.ceil(Math.max(0, 1000 - p.known.length) / wpd);
    const n5Days = Math.ceil((400 * 60) / m);
    const fmt = (d: number) => { const dt = new Date(); dt.setDate(dt.getDate() + d); return dt.toLocaleDateString(undefined, { month: "short", year: "numeric" }); };
    return { wpd, kanaDays, wordDays, n5Days, fmt };
  }, [daily, p.known.length]);
  return (
    <div className="screen">
      <Header title="Roadmap & timeline" sub="Tasks tick automatically as you progress" backTo="/explore" />
      <div className="card">
        <div style={{ fontWeight: 800 }}>Your timeline</div>
        <div className="sm mu mt4">How much time can you give each day?</div>
        <div className="mt8"><Seg value={daily} options={[["15", "15 min"], ["30", "30 min"], ["60", "1 hour"], ["120", "2 hours"]]} onChange={setDaily} /></div>
        <div className="grid3 mt12">
          <div className="stat"><div className="v">{plan.kanaDays}d</div><div className="k">Both kana</div></div>
          <div className="stat"><div className="v">{plan.wpd}</div><div className="k">New words/day</div></div>
          <div className="stat"><div className="v">{plan.wordDays}d</div><div className="k">To 1,000 words</div></div>
        </div>
        <div className="sm mt12" style={{ lineHeight: 1.6 }}>At this pace you’ll finish the 1,000-word core around <b>{plan.fmt(plan.kanaDays + plan.wordDays)}</b> and reach JLPT N5 level around <b>{plan.fmt(plan.n5Days)}</b>.</div>
        <div className="xs mu mt4">Estimates. The US Foreign Service Institute rates Japanese among the hardest languages for English speakers (~2,200 class hours to professional level). Daily consistency matters more than session length.</div>
      </div>

      <div className="section-title"><h2>Phases</h2></div>
      {phases.map(({ ph, done, total, pct }, i) => (
        <div className="row top" key={ph.id} style={{ gap: 12 }}>
          <div className="col" style={{ alignItems: "center", gap: 0, flex: "none", width: 28 }}>
            <div style={{ width: 28, height: 28, borderRadius: 14, display: "grid", placeItems: "center", background: pct === 1 ? "var(--matcha)" : pct > 0 ? "var(--shu)" : "var(--surface-3)", color: pct > 0 ? "#fff" : "var(--ink-2)", fontWeight: 800, fontSize: 13 }}>{pct === 1 ? "✓" : i + 1}</div>
            {i < phases.length - 1 && <div style={{ width: 2, flex: 1, minHeight: 40, background: "var(--line-2)" }} />}
          </div>
          <div className="card grow" style={{ marginTop: 0, marginBottom: 12 }}>
            <div className="row"><div className="grow"><div className="kicker">{ph.when}</div><div style={{ fontWeight: 800, fontSize: 16 }}>{ph.title}</div></div>{total > 0 && <span className="tag">{done}/{total}</span>}</div>
            <div className="sm mu mt4">{ph.goal}</div>
            <div className="mt8">
              {ph.tasks.map((t, k) => { const ok = checkTask(t.check, p, pk); return (
                <div key={k} className="row sm" style={{ padding: "4px 0", alignItems: "flex-start" }}>
                  {t.check ? (ok ? <CheckCircle2 size={17} color="var(--matcha)" style={{ flex: "none", marginTop: 1 }} /> : <Circle size={17} className="mu2" style={{ flex: "none", marginTop: 1 }} />) : <span style={{ width: 17, textAlign: "center", flex: "none" }}>•</span>}
                  <span style={ok ? { textDecoration: "line-through", color: "var(--ink-3)" } : undefined}>{t.text}</span>
                </div>); })}
            </div>
            <div className="xs mt8" style={{ background: "var(--surface-2)", padding: "8px 10px", borderRadius: 10, display: "flex", gap: 6, alignItems: "flex-start" }}><Icon name="flag" size={14} color="var(--matcha)" /><span><b>Checkpoint:</b> {ph.checkpoint}</span></div>
          </div>
        </div>
      ))}

      <div className="section-title"><h2>JLPT levels</h2><span className="mu">Japan’s official test</span></div>
      <div className="tbl-wrap" style={{ background: "var(--surface)" }}>
        <table className="tbl"><thead><tr><th>Level</th><th>Words</th><th>Kanji</th><th>Study hours*</th><th>You can…</th></tr></thead>
          <tbody>{JLPT.map((r) => <tr key={r[0]}>{r.map((c, i) => <td key={i}>{c}</td>)}</tr>)}</tbody></table>
      </div>
      <div className="xs mu mt8">*Approximate hours for learners without a kanji background (Japan Foundation / JLPT survey ranges). This app’s 1,000 words + grammar course ≈ N5 and part of N4.</div>
    </div>
  );
}

function Resources() {
  const pk = usePack();
  const icon = (k: string) => k === "youtube" || k === "search" ? <span className="yt"><PlayCircle size={22} /></span> : k === "app" ? <span className="yt" style={{ background: "var(--ai)" }}><Smartphone size={20} /></span> : <span className="yt" style={{ background: "var(--matcha)" }}><Globe size={20} /></span>;
  return (
    <div className="screen">
      <Header title="Videos & resources" sub="Opens in YouTube / your browser" backTo="/explore" />
      <div className="card soft-ai" style={{ boxShadow: "none" }}>
        <div className="sm" style={{ lineHeight: 1.6 }}><b>The fastest method:</b> 20–30 min a day of <b>comprehensible input</b> (videos you can mostly follow) + this app for words and grammar + one weekly speaking session.</div>
      </div>
      {pk.resources.map((g) => (
        <div key={g.id}>
          <div className="section-title"><h2>{g.title}</h2></div>
          {g.items.map((r) => (
            <button key={r.url} className="link-row" onClick={() => openExternal(r.url)}>
              {icon(r.kind)}
              <span className="grow"><div style={{ fontWeight: 700 }}>{r.title}</div><div className="xs mu">{r.note}</div>{r.level && <span className="tag mt4">{r.level}</span>}</span>
              <ExternalLink size={16} className="mu2" />
            </button>
          ))}
        </div>
      ))}
      <div className="xs mu mt16">Channels marked with a search link open a YouTube search so you always reach the current channel. Listed for learning; not affiliated.</div>
    </div>
  );
}
