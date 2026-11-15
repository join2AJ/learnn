import type { LucideIcon } from "lucide-react";
import {
  Activity, AudioWaveform, Award, Ban, BookOpen, BookOpenCheck, Brain, Briefcase, Building2, CircleCheck, Compass, Earth, Flag, Flame,
  Flower2, Gamepad2, Gauge, GraduationCap, Hand, Handshake, Heart, HeartHandshake, Hourglass, Landmark, Languages, Layers, Library, LifeBuoy,
  Lightbulb, Medal, Megaphone, MessagesSquare, Mic, Music, NotebookPen, PartyPopper, PenLine, Plane, Repeat, Rocket, ShieldCheck, ShoppingBag,
  SlidersHorizontal, Smile, Sparkles, Sprout, Star, Target, Timer, TrainFront, TriangleAlert, Trophy, Turtle, Users, UtensilsCrossed, Volume1,
  Volume2, Zap,
} from "lucide-react";

/** One icon family for the whole app. Content files refer to icons by these keys. */
export const ICONS: Record<string, LucideIcon> = {
  sprout: Sprout, flame: Flame, handshake: Handshake, medal: Medal, award: Award, trophy: Trophy, timer: Timer, megaphone: Megaphone,
  pen: PenLine, wave: AudioWaveform, library: Library, landmark: Landmark, notebook: NotebookPen, bookCheck: BookOpenCheck, book: BookOpen,
  flower: Flower2, layers: Layers, earth: Earth, plane: Plane, briefcase: Briefcase, grad: GraduationCap, building: Building2, users: Users,
  game: Gamepad2, brain: Brain, heart: Heart, ban: Ban, check: CircleCheck, alert: TriangleAlert, chat: MessagesSquare, sparkles: Sparkles,
  bulb: Lightbulb, turtle: Turtle, volume: Volume2, volumeLow: Volume1, gauge: Gauge, music: Music, rocket: Rocket, star: Star, party: PartyPopper,
  smile: Smile, food: UtensilsCrossed, train: TrainFront, shop: ShoppingBag, help: LifeBuoy, hand: Hand, compass: Compass, repeat: Repeat,
  flag: Flag, shield: ShieldCheck, heartHand: HeartHandshake, activity: Activity, zap: Zap, target: Target, languages: Languages,
  hourglass: Hourglass, mic: Mic, sliders: SlidersHorizontal,
};

export function Icon({ name, size = 20, color, stroke = 2.2 }: { name: string; size?: number; color?: string; stroke?: number }) {
  const C = ICONS[name];
  if (!C) return <span style={{ fontSize: size * 0.9, lineHeight: 1, fontWeight: 700, color }} className="jp">{name}</span>; // kana/kanji glyphs
  return <C size={size} color={color} strokeWidth={stroke} />;
}

/** Icon inside a soft rounded tile (tone = CSS colour variable name without --). */
export function IconTile({ name, tone = "shu", size = 40, icon = 20, round }: { name: string; tone?: string; size?: number; icon?: number; round?: boolean }) {
  return (
    <span style={{ width: size, height: size, borderRadius: round ? "50%" : size * 0.32, display: "inline-grid", placeItems: "center", flex: "none", background: `var(--${tone}-soft)`, color: `var(--${tone})` }}>
      <Icon name={name} size={icon} />
    </span>
  );
}

/** Small language pill used instead of flag emoji. */
export function LangPill({ l }: { l: "en" | "hi" | "ja" }) {
  const m = { en: ["EN", "ai"], hi: ["हि", "gold"], ja: ["日", "shu"] }[l];
  return <span style={{ minWidth: 26, height: 22, padding: "0 6px", borderRadius: 7, display: "inline-grid", placeItems: "center", flex: "none", fontSize: 11, fontWeight: 800, background: `var(--${m[1]})`, color: "#fff" }}>{m[0]}</span>;
}
