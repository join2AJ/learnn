import { bumpDay, dayKey, emitUi, getProgress, getSettings, Progress, today, updateProgress } from "./store";
import { vibrate } from "./native";

export const LEVEL_XP = [0, 100, 250, 500, 900, 1400, 2000, 2800, 3800, 5000, 6500, 8500, 11000, 14000, 18000, 23000, 30000];

export function levelOf(xp: number) {
  let i = 0;
  while (i + 1 < LEVEL_XP.length && xp >= LEVEL_XP[i + 1]) i++;
  const cur = LEVEL_XP[i];
  const next = LEVEL_XP[i + 1] ?? cur + 10000;
  return { level: i + 1, cur, next, pct: Math.min(1, (xp - cur) / (next - cur)) };
}

export interface Badge { id: string; icon: string; title: string; desc: string; test: (p: Progress) => boolean; }
export const BADGES: Badge[] = [
  { id: "first", icon: "sprout", title: "First step", desc: "Earn your first XP", test: (p) => p.xp > 0 },
  { id: "kana10", icon: "あ", title: "Kana sprout", desc: "Answer 10 kana right", test: (p) => sumKana(p) >= 10 },
  { id: "kana100", icon: "zap", title: "Kana runner", desc: "Answer 100 kana right", test: (p) => sumKana(p) >= 100 },
  { id: "hira", icon: "ひ", title: "Hiragana master", desc: "Master all 46 basic hiragana", test: (p) => masteredSet(p, HIRA46) >= 46 },
  { id: "kata", icon: "カ", title: "Katakana master", desc: "Master all 46 basic katakana", test: (p) => masteredSet(p, KATA46) >= 46 },
  { id: "w50", icon: "book", title: "50 words", desc: "Mark 50 words as known", test: (p) => p.known.length >= 50 },
  { id: "w100", icon: "bookCheck", title: "100 words", desc: "≈65% of everyday speech", test: (p) => p.known.length >= 100 },
  { id: "w300", icon: "library", title: "300 words", desc: "Daily-life vocabulary", test: (p) => p.known.length >= 300 },
  { id: "w1000", icon: "landmark", title: "1,000 words", desc: "Half of the core pack", test: (p) => p.known.length >= 1000 },
  { id: "w2000", icon: "crown", title: "2,000 words", desc: "Finish the whole core pack", test: (p) => p.known.length >= 2000 },
  { id: "lesson1", icon: "notebook", title: "Grammar begins", desc: "Finish your first grammar lesson", test: (p) => Object.keys(p.lessons).length >= 1 },
  { id: "lesson10", icon: "brain", title: "Grammar brain", desc: "Finish 10 grammar lessons", test: (p) => Object.keys(p.lessons).length >= 10 },
  { id: "streak3", icon: "flame", title: "On fire", desc: "3-day streak", test: (p) => p.streak.best >= 3 },
  { id: "streak7", icon: "zap", title: "One week", desc: "7-day streak", test: (p) => p.streak.best >= 7 },
  { id: "streak30", icon: "flower", title: "Sakura month", desc: "30-day streak", test: (p) => p.streak.best >= 30 },
  { id: "review100", icon: "layers", title: "Card shark", desc: "100 flashcard reviews", test: (p) => totalReviews(p) >= 100 },
  { id: "speak10", icon: "megaphone", title: "Loud & proud", desc: "10 words spoken correctly", test: (p) => p.speak.ok >= 10 },
  { id: "write10", icon: "pen", title: "Calligrapher", desc: "Practise writing 10 characters", test: (p) => p.writes >= 10 },
  { id: "lab", icon: "wave", title: "Sound scientist", desc: "Open the Sound Lab mic", test: (p) => p.labSessions >= 1 },
  { id: "culture", icon: "earth", title: "Culture curious", desc: "Read 5 culture sections", test: (p) => Object.keys(p.culturesRead).length >= 5 },
  { id: "hour", icon: "timer", title: "Hour of power", desc: "Study 60 minutes total", test: (p) => totalMs(p) >= 3600_000 },
  { id: "perfect", icon: "target", title: "Perfect round", desc: "10/10 in a quiz", test: (p) => p.quiz.best >= 10 },
  { id: "pledge", icon: "handshake", title: "Pledge made", desc: "Promised your daily study time", test: () => !!getSettings().pledge },
  { id: "keep3", icon: "target", title: "Promise kept ×3", desc: "Daily goal met 3 days in a row", test: (p) => goalStreak(p).best >= 3 },
  { id: "keep7", icon: "medal", title: "Promise kept ×7", desc: "Daily goal met 7 days in a row", test: (p) => goalStreak(p).best >= 7 },
  { id: "keep21", icon: "award", title: "Habit formed", desc: "Daily goal met 21 days in a row", test: (p) => goalStreak(p).best >= 21 },
  { id: "keep30", icon: "trophy", title: "Pledge fulfilled", desc: "30 days of keeping your promise", test: (p) => goalStreak(p).best >= 30 },
  { id: "write50", icon: "pen", title: "Brush master", desc: "Check 50 drawings", test: (p) => p.writes >= 50 },
  { id: "writeAce", icon: "target", title: "Sharp hand", desc: "Score 90%+ on 10 characters", test: (p) => Object.values(p.writeLog || {}).filter((v) => v.best >= 90).length >= 10 },
  { id: "writeHira", icon: "ひ", title: "Hiragana by hand", desc: "Write all 46 hiragana at 70%+", test: (p) => Array.from(HIRA46).every((c) => (p.writeLog?.[c]?.best || 0) >= 70) },
  { id: "voice10", icon: "mic", title: "Voice explorer", desc: "Record and compare 10 words", test: (p) => (p.voiceLog || []).length >= 10 },
];

const HIRA46 = "あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをん";
const KATA46 = Array.from(HIRA46).map((c) => String.fromCharCode(c.charCodeAt(0) + 0x60)).join("");
export const sumKana = (p: Progress) => Object.values(p.kana).reduce((a, b) => a + b.c, 0);
export const isMastered = (s?: { c: number; w: number }) => !!s && s.c >= 3 && s.c >= s.w * 2;
export const masteredSet = (p: Progress, set: string) => Array.from(set).filter((c) => isMastered(p.kana[c])).length;
export const totalMs = (p: Progress) => Object.values(p.days).reduce((a, d) => a + d.ms, 0);
export const totalReviews = (p: Progress) => Object.values(p.days).reduce((a, d) => a + d.reviews, 0);
export { HIRA46, KATA46 };

/** Award XP, update streak, and fire level-up / badge celebrations. */
/** Consecutive days with the daily goal met: current run (ending today or yesterday) and best run. */
export function goalStreak(p: Progress) {
  const days = Object.keys(p.goalHit).filter((k) => p.goalHit[k]).sort();
  let best = 0, run = 0, prev = "";
  for (const k of days) {
    const d = new Date(k + "T12:00:00"); d.setDate(d.getDate() - 1);
    run = prev === dayKey(d) ? run + 1 : 1; best = Math.max(best, run); prev = k;
  }
  const y = new Date(); y.setDate(y.getDate() - 1);
  const cur = prev === dayKey() || prev === dayKey(y) ? run : 0;
  return { cur, best };
}
/** Days since the pledge started (1-based) and how many of them met the goal. */
export function pledgeStatus(p: Progress) {
  const pl = getSettings().pledge;
  if (!pl) return null;
  const start = new Date(pl.start + "T12:00:00");
  const day = Math.min(pl.days, Math.floor((Date.now() - start.getTime()) / 86_400_000) + 1);
  const kept = Object.keys(p.goalHit).filter((k) => p.goalHit[k] && k >= pl.start).length;
  return { ...pl, day: Math.max(1, day), kept };
}

export function award(xp: number, f?: (p: Progress) => void) {
  const before = getProgress();
  const lvBefore = levelOf(before.xp).level;
  updateProgress((p) => {
    p.xp += xp;
    bumpDay(p, (d) => { d.xp += xp; });
    f?.(p);
    touchStreak(p);
  });
  if (xp > 0) emitUi({ type: "xp", amount: xp });
  const after = getProgress();
  const lv = levelOf(after.xp).level;
  if (lv > lvBefore) {
    if (getSettings().haptics) vibrate(40);
    emitUi({ type: "celebrate", title: "Level " + lv + "!", sub: "You levelled up. Keep the momentum going.", jp: "レベルアップ！", icon: "star" });
  }
  checkBadges();
}

export function touchStreak(p: Progress) {
  const k = dayKey();
  if (p.streak.last === k) return;
  const y = new Date(); y.setDate(y.getDate() - 1);
  const count = p.streak.last === dayKey(y) ? p.streak.count + 1 : 1;
  p.streak = { count, best: Math.max(p.streak.best, count), last: k };
}

export function checkBadges() {
  const p = getProgress();
  const fresh = BADGES.filter((b) => !p.badges[b.id] && b.test(p));
  if (!fresh.length) return;
  updateProgress((q) => { fresh.forEach((b) => (q.badges[b.id] = Date.now())); });
  const b = fresh[0];
  emitUi({ type: "celebrate", title: "Badge unlocked", sub: b.title + " - " + b.desc, jp: "おめでとう！", icon: b.icon });
}

export function checkGoal() {
  const s = getSettings();
  const p = getProgress();
  const k = dayKey();
  if (p.goalHit[k]) return;
  if (today(p).ms >= s.dailyGoalMin * 60_000) {
    updateProgress((q) => { q.goalHit[k] = true; });
    award(30);
    emitUi({ type: "celebrate", title: "Daily goal reached", sub: s.dailyGoalMin + " minutes today. +30 XP bonus.", jp: "よくできました！", icon: "target" });
  }
}

/** Record a right/wrong answer in the day stats. */
export function recordAnswer(ok: boolean) {
  updateProgress((p) => {
    bumpDay(p, (d) => { if (ok) d.correct++; else d.wrong++; });
    if (ok) p.quiz.correct++; else p.quiz.wrong++;
  });
}
