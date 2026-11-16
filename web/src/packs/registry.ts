import type { LanguagePack } from "../core/types";
import { getSettings } from "../core/store";
import japanese from "./ja";
import french from "./fr";

/**
 * All language packs. To add a language: create src/packs/<id>/index.ts that
 * exports a LanguagePack, import it here and set status "ready".
 * French is built but hidden until the beta switch is on (tap the version 7× in Settings).
 */
export interface PackMeta { id: string; name: string; native: string; flag: string; status: "ready" | "planned"; tagline: string; beta?: boolean }

const PLANNED: PackMeta[] = [
  { id: "ko", name: "Korean", native: "한국어", flag: "🇰🇷", status: "planned", tagline: "Hangul in a day, then the same path" },
  { id: "zh", name: "Mandarin", native: "中文", flag: "🇨🇳", status: "planned", tagline: "Tones + pinyin + the same Sound Lab" },
  { id: "es", name: "Spanish", native: "Español", flag: "🇪🇸", status: "planned", tagline: "Fast start with shared Latin roots" },
  { id: "de", name: "German", native: "Deutsch", flag: "🇩🇪", status: "planned", tagline: "Cases made simple" },
];
export const betaOn = () => !!getSettings().beta;
/** Languages to show in pickers (French appears as ready only with the beta switch). */
export const packList = (): PackMeta[] => [
  japanese,
  betaOn() ? { ...french, beta: true } : { id: "fr", name: "French", native: "Français", flag: "🇫🇷", status: "planned", tagline: "Nasal vowels visualised in Sound Lab" },
  ...PLANNED,
];

const READY: Record<string, LanguagePack> = { ja: japanese, fr: french };
export const getPack = (id: string): LanguagePack => (id === "fr" && !betaOn() ? japanese : READY[id] || japanese);
