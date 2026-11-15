import { useEffect, useState } from "react";

/** Tiny hash router: #/learn/kana?x=1. Hash history makes Android's back button work via WebView.goBack(). */
export interface Route { path: string; parts: string[]; query: URLSearchParams; }

function parse(): Route {
  const h = (location.hash || "#/").slice(1);
  const [path, qs] = h.split("?");
  const p = path || "/";
  return { path: p, parts: p.split("/").filter(Boolean), query: new URLSearchParams(qs || "") };
}

export function useRoute() {
  const [r, setR] = useState(parse);
  useEffect(() => {
    const f = () => setR(parse());
    window.addEventListener("hashchange", f);
    return () => window.removeEventListener("hashchange", f);
  }, []);
  return r;
}

export function go(path: string, replace = false) {
  const h = "#" + path;
  if (replace) history.replaceState(null, "", h);
  else if (location.hash !== h) location.hash = h;
  if (replace) window.dispatchEvent(new HashChangeEvent("hashchange"));
}
export function back(fallback = "/") {
  if (history.length > 1) history.back();
  else go(fallback, true);
}

/** Map a route to a stats section name (used by the time tracker). */
export function sectionOf(parts: string[]): string {
  const [a, b] = parts;
  if (!a) return "Home";
  const map: Record<string, string> = {
    kana: "Alphabet", scripts: "Alphabet", write: "Writing", pron: "Pronunciation", grammar: "Grammar", verbs: "Grammar",
    words: "Vocabulary", sentences: "Vocabulary", phrases: "Phrases", cards: "Flashcards", quiz: "Quizzes", speak: "Speaking", lab: "Sound Lab",
    culture: "Culture", roadmap: "Roadmap", resources: "Resources", me: "Stats", settings: "Settings",
    recordings: "Speaking", writing: "Writing", privacy: "Settings", backup: "Settings", support: "Settings",
    learn: "Learn hub", practice: "Practice hub", explore: "Explore hub",
  };
  if ((a === "learn" || a === "practice" || a === "explore" || a === "me") && b && map[b]) return map[b];
  return map[a] || "Other";
}
