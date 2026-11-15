/**
 * Bridge to the Android shell (MainActivity exposes `window.Native`).
 * Every call has a browser fallback so the app also runs in Chrome for development.
 */

interface NativeApi {
  speak(text: string, lang: string, rate: number, id: string): void;
  stopSpeaking(): void;
  ttsStatus(): string; // {"ready":bool,"voice":bool}
  openTtsSettings(): void;
  startListening(lang: string): void;
  stopListening(): void;
  hasMic(): boolean;
  requestMic(): void;
  vibrate(ms: number): void;
  openExternal(url: string): void;
  appVersion(): string;
  setTheme?(dark: boolean): void;
}

declare global {
  interface Window {
    Native?: NativeApi;
    __nativeTts?: (e: { type: string; id: string }) => void;
    __nativeSpeech?: (e: { type: string; texts?: string[]; error?: string }) => void;
    __nativePerm?: (granted: boolean) => void;
    webkitSpeechRecognition?: any;
    SpeechRecognition?: any;
    webkitAudioContext?: typeof AudioContext;
  }
}

const N = () => (typeof window !== "undefined" ? window.Native : undefined);
export const isNative = () => !!N();

/* ---------------- text to speech ---------------- */
type SpeakListener = (id: string | null) => void;
const speakListeners = new Set<SpeakListener>();
let speakingId: string | null = null;
const setSpeaking = (id: string | null) => { speakingId = id; speakListeners.forEach((l) => l(id)); };
export const onSpeaking = (l: SpeakListener) => { speakListeners.add(l); return () => { speakListeners.delete(l); }; };
export const currentSpeaking = () => speakingId;

if (typeof window !== "undefined") {
  window.__nativeTts = (e) => {
    if (e.type === "start") setSpeaking(e.id);
    else if (speakingId === e.id) setSpeaking(null);
  };
}

let warn: (m: string) => void = () => {};
export const setWarn = (f: (m: string) => void) => { warn = f; };

let seq = 0;
export function speak(text: string, opts: { lang?: string; rate?: number; id?: string } = {}) {
  const lang = opts.lang || "ja-JP";
  const rate = opts.rate ?? 0.9;
  const id = opts.id || "s" + ++seq;
  const n = N();
  if (n) {
    try {
      const st = JSON.parse(n.ttsStatus() || "{}");
      if (st.ready && !st.voice) warn("Japanese voice missing — Settings → Voice to install it.");
    } catch { /* ignore */ }
    setSpeaking(id);
    n.speak(text, lang, rate, id);
    return id;
  }
  try {
    const ss = window.speechSynthesis;
    if (!ss) { warn("Speech is not available in this browser."); return id; }
    const u = new SpeechSynthesisUtterance(text);
    const v = ss.getVoices().find((x) => x.lang?.toLowerCase().replace("_", "-").startsWith(lang.slice(0, 2)));
    if (v) u.voice = v;
    u.lang = lang;
    u.rate = rate;
    u.onstart = () => setSpeaking(id);
    u.onend = u.onerror = () => { if (speakingId === id) setSpeaking(null); };
    ss.cancel();
    setTimeout(() => ss.speak(u), 30);
  } catch {
    warn("Speech was blocked.");
  }
  return id;
}

export function stopSpeaking() {
  const n = N();
  if (n) n.stopSpeaking();
  else try { window.speechSynthesis?.cancel(); } catch { /* ignore */ }
  setSpeaking(null);
}

export function ttsStatus(): { ready: boolean; voice: boolean; native: boolean } {
  const n = N();
  if (n) {
    try { return { ...JSON.parse(n.ttsStatus()), native: true }; } catch { return { ready: false, voice: false, native: true }; }
  }
  const has = typeof window !== "undefined" && !!window.speechSynthesis;
  const voice = has && window.speechSynthesis.getVoices().some((v) => v.lang?.startsWith("ja"));
  return { ready: has, voice, native: false };
}
export const openTtsSettings = () => N()?.openTtsSettings();

/* ---------------- speech recognition ---------------- */
export type SpeechEvent = { type: "partial" | "result" | "error" | "end" | "ready"; texts?: string[]; error?: string };
let speechCb: ((e: SpeechEvent) => void) | null = null;
let webRec: any = null;
if (typeof window !== "undefined") window.__nativeSpeech = (e) => speechCb?.(e as SpeechEvent);

export function speechSupported() {
  return !!N() || !!(typeof window !== "undefined" && (window.SpeechRecognition || window.webkitSpeechRecognition));
}

export function listen(lang: string, cb: (e: SpeechEvent) => void) {
  speechCb = cb;
  const n = N();
  if (n) { n.startListening(lang); return; }
  const R = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!R) { cb({ type: "error", error: "Speech recognition not supported here." }); return; }
  webRec = new R();
  webRec.lang = lang;
  webRec.interimResults = true;
  webRec.maxAlternatives = 5;
  webRec.onresult = (ev: any) => {
    const last = ev.results[ev.results.length - 1];
    const texts = Array.from(last).map((a: any) => a.transcript as string);
    cb({ type: last.isFinal ? "result" : "partial", texts });
  };
  webRec.onerror = (ev: any) => cb({ type: "error", error: ev.error });
  webRec.onend = () => cb({ type: "end" });
  webRec.start();
}
export function stopListening() {
  const n = N();
  if (n) n.stopListening();
  else try { webRec?.stop(); } catch { /* ignore */ }
}

/* ---------------- microphone permission (for Sound Lab) ---------------- */
export function ensureMic(): Promise<boolean> {
  const n = N();
  if (!n) return Promise.resolve(true); // browser asks on getUserMedia
  if (n.hasMic()) return Promise.resolve(true);
  return new Promise((res) => {
    window.__nativePerm = (g) => res(g);
    n.requestMic();
  });
}

/* ---------------- misc ---------------- */
export function vibrate(ms = 12) {
  const n = N();
  if (n) n.vibrate(ms);
  else try { navigator.vibrate?.(ms); } catch { /* ignore */ }
}
export function openExternal(url: string) {
  const n = N();
  if (n) n.openExternal(url);
  else window.open(url, "_blank", "noopener");
}
export const appVersion = () => N()?.appVersion() || "web";
export const setNativeTheme = (dark: boolean) => { try { N()?.setTheme?.(dark); } catch { /* older shell */ } };
