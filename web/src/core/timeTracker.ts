import { bumpDay, updateProgress } from "./store";
import { checkGoal, touchStreak } from "./rewards";

/**
 * Counts active study time per section. Time only counts while the app is visible
 * and the learner interacted within the last 60 s (so an idle screen isn't counted).
 */
let section = "Home";
let lastInput = Date.now();
let pending: Record<string, number> = {};
let started = false;

export const setSection = (s: string) => { section = s; };
export const getSection = () => section;

export function startTracker() {
  if (started) return;
  started = true;
  const mark = () => { lastInput = Date.now(); };
  ["pointerdown", "keydown", "touchstart", "scroll", "wheel"].forEach((e) => window.addEventListener(e, mark, { passive: true, capture: true }));
  window.setInterval(() => {
    if (document.visibilityState !== "visible") return;
    if (Date.now() - lastInput > 60_000) return;
    pending[section] = (pending[section] || 0) + 1000;
  }, 1000);
  window.setInterval(flushTime, 10_000);
  document.addEventListener("visibilitychange", () => { if (document.visibilityState === "hidden") flushTime(); });
}

export function flushTime() {
  const entries = Object.entries(pending);
  if (!entries.length) return;
  pending = {};
  updateProgress((p) => {
    bumpDay(p, (d) => {
      for (const [s, ms] of entries) { d.sec[s] = (d.sec[s] || 0) + ms; d.ms += ms; }
    });
    if (entries.reduce((a, [, ms]) => a + ms, 0) > 0) touchStreak(p);
  });
  checkGoal();
}

/** Live (unflushed) seconds, so the stats screen can include them. */
export const pendingMs = () => Object.values(pending).reduce((a, b) => a + b, 0);
