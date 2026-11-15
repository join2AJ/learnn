import { useSyncExternalStore } from "react";

/* ---------- shapes ---------- */
export interface Settings {
  lang: string;
  name: string;
  onboarded: boolean;
  showHindi: boolean;
  showRomaji: boolean;
  rate: number;
  theme: "auto" | "light" | "dark";
  dailyGoalMin: number;
  newPerDay: number;
  haptics: boolean;
  autoplay: boolean;
  profiled: boolean;
  toured: boolean;
  age: string;
  reasons: string[];
  pledge: { min: number; start: string; days: number } | null;
}

export interface SrsCard { due: number; ivl: number; ease: number; reps: number; lapses: number; last: number; }
/** Summary of one voice recording (audio itself is not stored). */
export interface VoiceRec { t: number; w: string; bands: [number, number, number]; ref: [number, number, number]; db: number; dur: number; exp: number; f0: [number, number]; score: number; match?: number; }
export interface DayStat { ms: number; sec: Record<string, number>; xp: number; reviews: number; correct: number; wrong: number; learned: number; spoke?: number; }

export interface Progress {
  xp: number;
  known: number[];
  kana: Record<string, { c: number; w: number }>;
  lessons: Record<string, number>;
  srs: Record<string, SrsCard>;
  badges: Record<string, number>;
  quiz: { correct: number; wrong: number; best: number };
  speak: { ok: number; tries: number };
  writes: number;
  writeLog: Record<string, { n: number; best: number; last: number; t: number; scores: number[] }>;
  labSessions: number;
  days: Record<string, DayStat>;
  streak: { count: number; best: number; last: string };
  goalHit: Record<string, boolean>;
  roadmap: Record<string, boolean>;
  culturesRead: Record<string, boolean>;
  voiceLog: VoiceRec[];
  started: number;
}

const defSettings: Settings = {
  lang: "ja", name: "", onboarded: false, showHindi: true, showRomaji: true, rate: 0.9,
  theme: "auto", dailyGoalMin: 20, newPerDay: 15, haptics: true, autoplay: true, profiled: false, toured: false, age: "", reasons: [], pledge: null,
};
const defProgress = (): Progress => ({
  xp: 0, known: [], kana: {}, lessons: {}, srs: {}, badges: {}, quiz: { correct: 0, wrong: 0, best: 0 },
  speak: { ok: 0, tries: 0 }, writes: 0, writeLog: {}, labSessions: 0, days: {}, streak: { count: 0, best: 0, last: "" },
  goalHit: {}, roadmap: {}, culturesRead: {}, voiceLog: [], started: Date.now(),
});

/* ---------- persistence ---------- */
const SK = "np2:settings";
const PK = (lang: string) => "np2:progress:" + lang;
function read<T>(k: string, d: T): T {
  try { const v = localStorage.getItem(k); return v ? { ...d, ...JSON.parse(v) } : d; } catch { return d; }
}
function write(k: string, v: unknown) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* ignore */ } }

let settings: Settings = read(SK, defSettings);
let progress: Progress = read(PK(settings.lang), defProgress());

const subs = new Set<() => void>();
const emit = () => subs.forEach((f) => f());
const subscribe = (f: () => void) => { subs.add(f); return () => { subs.delete(f); }; };

let saveTimer: number | undefined;
function scheduleSave() {
  clearTimeout(saveTimer);
  saveTimer = window.setTimeout(() => { write(SK, settings); write(PK(settings.lang), progress); }, 250);
}
export function flush() { clearTimeout(saveTimer); write(SK, settings); write(PK(settings.lang), progress); }

export const getSettings = () => settings;
export const getProgress = () => progress;
export function setSettings(p: Partial<Settings>) {
  const langChanged = p.lang && p.lang !== settings.lang;
  if (langChanged) flush();
  settings = { ...settings, ...p };
  if (langChanged) progress = read(PK(settings.lang), defProgress());
  scheduleSave(); emit();
}
export function updateProgress(f: (p: Progress) => void) {
  const next: Progress = structuredCloneSafe(progress);
  f(next);
  progress = next;
  scheduleSave(); emit();
}
function structuredCloneSafe<T>(v: T): T {
  // shallow-copy top level + one level of objects is enough for React change detection
  const o: any = { ...(v as any) };
  for (const k of Object.keys(o)) {
    const x = o[k];
    if (Array.isArray(x)) o[k] = x.slice();
    else if (x && typeof x === "object") o[k] = { ...x };
  }
  return o;
}
export function resetProgress() { progress = defProgress(); scheduleSave(); emit(); }
export function exportAll() { return JSON.stringify({ settings, progress }, null, 0); }
export function importAll(json: string) {
  const d = JSON.parse(json);
  if (d.settings) settings = { ...defSettings, ...d.settings };
  if (d.progress) progress = { ...defProgress(), ...d.progress };
  flush(); emit();
}

export const useSettings = () => useSyncExternalStore(subscribe, getSettings);
export const useProgress = () => useSyncExternalStore(subscribe, getProgress);

/* ---------- dates ---------- */
export const dayKey = (d = new Date()) => {
  const z = (n: number) => String(n).padStart(2, "0");
  return d.getFullYear() + "-" + z(d.getMonth() + 1) + "-" + z(d.getDate());
};
export const emptyDay = (): DayStat => ({ ms: 0, sec: {}, xp: 0, reviews: 0, correct: 0, wrong: 0, learned: 0 });
export function today(p: Progress = progress): DayStat { return p.days[dayKey()] || emptyDay(); }
export function bumpDay(p: Progress, f: (d: DayStat) => void) {
  const k = dayKey();
  const d = { ...(p.days[k] || emptyDay()) };
  d.sec = { ...d.sec };
  f(d);
  p.days[k] = d;
}

/* ---------- event bus for toasts + celebrations ---------- */
export type UiEvent =
  | { type: "toast"; text: string; tone?: "ok" | "info" | "warn" }
  | { type: "xp"; amount: number }
  | { type: "celebrate"; title: string; sub: string; jp?: string; icon?: string }
  | { type: "voice"; text: string; ro?: string; en?: string; reviewT?: number }
  | { type: "tour" };
const ui = new Set<(e: UiEvent) => void>();
export const onUi = (f: (e: UiEvent) => void) => { ui.add(f); return () => { ui.delete(f); }; };
export const emitUi = (e: UiEvent) => ui.forEach((f) => f(e));
export const toast = (text: string, tone: "ok" | "info" | "warn" = "info") => emitUi({ type: "toast", text, tone });
