import type { LanguagePack } from "../core/types";
import japanese from "./ja";

/**
 * All language packs. To add a language: create src/packs/<id>/index.ts that
 * exports a LanguagePack, import it here and set status "ready".
 */
export interface PackMeta { id: string; name: string; native: string; flag: string; status: "ready" | "planned"; tagline: string; }

export const PACKS: PackMeta[] = [
  japanese,
  { id: "ko", name: "Korean", native: "한국어", flag: "한", status: "planned", tagline: "Hangul in a day, then the same path" },
  { id: "zh", name: "Mandarin", native: "中文", flag: "中", status: "planned", tagline: "Tones + pinyin + the same Sound Lab" },
  { id: "es", name: "Spanish", native: "Español", flag: "Es", status: "planned", tagline: "Fast start with shared Latin roots" },
  { id: "fr", name: "French", native: "Français", flag: "Fr", status: "planned", tagline: "Nasal vowels visualised in Sound Lab" },
  { id: "de", name: "German", native: "Deutsch", flag: "De", status: "planned", tagline: "Cases made simple" },
];

const READY: Record<string, LanguagePack> = { ja: japanese };
export const getPack = (id: string): LanguagePack => READY[id] || japanese;
