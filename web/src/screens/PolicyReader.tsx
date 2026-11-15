import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowDown, Check, X } from "lucide-react";
import PolicyText from "./PolicyText";

/** Full-screen privacy policy on top of everything. "I have read it" unlocks once the reader reaches the end. */
export default function PolicyReader({ open, onClose, onRead }: { open: boolean; onClose: () => void; onRead?: () => void }) {
  const box = useRef<HTMLDivElement>(null);
  const [end, setEnd] = useState(false);
  const [pct, setPct] = useState(0);
  const check = () => {
    const b = box.current; if (!b) return;
    const max = b.scrollHeight - b.clientHeight;
    setPct(max <= 0 ? 1 : b.scrollTop / max);
    if (b.scrollTop >= max - 40) setEnd(true);
  };
  useEffect(() => { if (open) { setEnd(false); setPct(0); window.setTimeout(check, 50); } }, [open]);
  if (!open) return null;
  return createPortal(
    <div role="dialog" aria-label="Privacy policy" style={{ position: "fixed", inset: 0, zIndex: 300, background: "var(--bg)", display: "flex", flexDirection: "column" }}>
      <div className="row" style={{ padding: "calc(12px + var(--safe-t)) 16px 10px", borderBottom: "1px solid var(--line)" }}>
        <div className="grow"><div style={{ fontWeight: 800, fontSize: 18 }}>Privacy policy</div><div className="xs mu">{end ? "Thanks for reading" : "Please read to the end - " + Math.round(pct * 100) + "%"}</div></div>
        <button className="icon-btn" aria-label="Close" onClick={onClose}><X size={20} /></button>
      </div>
      <div style={{ height: 3, background: "var(--line)" }}><div style={{ height: 3, width: pct * 100 + "%", background: "var(--shu)", transition: "width .15s" }} /></div>
      <div ref={box} onScroll={check} style={{ flex: 1, overflowY: "auto", padding: "8px 18px 24px", WebkitOverflowScrolling: "touch" }}><PolicyText /></div>
      <div style={{ padding: "10px 16px calc(14px + var(--safe-b))", borderTop: "1px solid var(--line)" }}>
        {onRead ? (
          end ? <button className="btn primary block" onClick={() => { onRead(); onClose(); }}><Check size={17} /> I have read it</button>
            : <button className="btn white block" onClick={() => box.current?.scrollBy({ top: box.current.clientHeight * 0.85, behavior: "smooth" })}><ArrowDown size={17} /> Keep reading</button>
        ) : <button className="btn white block" onClick={onClose}>Close</button>}
      </div>
    </div>, document.body);
}
