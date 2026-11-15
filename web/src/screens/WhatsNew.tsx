import { ArrowRight } from "lucide-react";
import { APP_VERSION, CHANGELOG } from "../changelog";
import { Icon } from "../ui/icons";

/** Popup listing what changed since the version the learner last saw. */
export default function WhatsNew({ since, onDone }: { since: string; onDone: () => void }) {
  const newer = CHANGELOG.filter((c) => !since || parseFloat(c.v) > parseFloat(since));
  const list = newer.length ? newer : CHANGELOG.slice(0, 1);
  return (
    <>
      <div className="scrim" style={{ zIndex: 97 }} onClick={onDone} />
      <div className="modal" style={{ zIndex: 98, textAlign: "left", padding: "22px 18px 16px", maxHeight: "82vh", overflowY: "auto" }} role="dialog" aria-label="What's new">
        <div className="row"><span style={{ width: 44, height: 44, borderRadius: 14, display: "grid", placeItems: "center", background: "var(--shu-soft)", color: "var(--shu)" }}><Icon name="sparkles" size={22} /></span>
          <div className="grow"><div className="kicker">Updated to v{APP_VERSION}</div><h2 style={{ margin: 0, fontSize: 21 }}>What’s new</h2></div></div>
        {list.map((c) => (
          <div key={c.v} className="mt16">
            <div className="xs mu" style={{ fontWeight: 800 }}>VERSION {c.v} · {c.date}</div>
            {c.items.map(([ic, t]) => (
              <div key={t} className="row top sm mt8" style={{ gap: 10, lineHeight: 1.5 }}><span style={{ color: "var(--shu)", marginTop: 2 }}><Icon name={ic} size={17} /></span><span>{t}</span></div>
            ))}
          </div>
        ))}
        <button className="btn primary block mt16" onClick={onDone}>Got it <ArrowRight size={16} /></button>
      </div>
    </>
  );
}
