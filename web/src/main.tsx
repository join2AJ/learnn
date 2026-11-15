import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles.css";
import { flush } from "./core/store";
import { flushTime } from "./core/timeTracker";

window.addEventListener("pagehide", () => { flushTime(); flush(); });
// Load browser voices early (web fallback only).
try { window.speechSynthesis?.getVoices(); } catch { /* ignore */ }

createRoot(document.getElementById("root")!).render(<App />);
