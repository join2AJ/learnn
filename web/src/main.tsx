import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles.css";
import { flush } from "./core/store";
import { flushTime } from "./core/timeTracker";
import { toast } from "./core/store";

// Content protection: no copying, selecting or long-press menus outside text boxes.
const editable = (t: EventTarget | null) => !!(t as HTMLElement | null)?.closest?.("input, textarea, [contenteditable]");
["copy", "cut", "contextmenu", "selectstart", "dragstart"].forEach((ev) => document.addEventListener(ev, (e) => { if (!editable(e.target)) e.preventDefault(); }, { capture: true }));
(window as unknown as { __npToast: (t: string) => void }).__npToast = (t) => toast(t, "warn");

window.addEventListener("pagehide", () => { flushTime(); flush(); });
// Load browser voices early (web fallback only).
try { window.speechSynthesis?.getVoices(); } catch { /* ignore */ }

createRoot(document.getElementById("root")!).render(<App />);
