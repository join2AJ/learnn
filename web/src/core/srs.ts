import { bumpDay, getProgress, Progress, SrsCard, updateProgress } from "./store";

/** A light SM-2 variant. Grades: 0 again, 1 hard, 2 good, 3 easy. Intervals in days. */
const DAY = 86_400_000;
const MIN = 60_000;

export function schedule(c: SrsCard | undefined, grade: 0 | 1 | 2 | 3, now = Date.now()): SrsCard {
  const card: SrsCard = c ? { ...c } : { due: now, ivl: 0, ease: 2.5, reps: 0, lapses: 0, last: now };
  if (grade === 0) {
    card.lapses++;
    card.reps = 0;
    card.ivl = 0;
    card.ease = Math.max(1.3, card.ease - 0.2);
    card.due = now + 2 * MIN;
  } else {
    card.reps++;
    if (card.reps === 1) card.ivl = grade === 1 ? 0.3 : grade === 2 ? 1 : 3;
    else if (card.reps === 2) card.ivl = grade === 1 ? 2 : grade === 2 ? 3 : 6;
    else card.ivl = Math.round(card.ivl * (grade === 1 ? 1.2 : grade === 2 ? card.ease : card.ease * 1.3) * 10) / 10;
    card.ease = Math.max(1.3, card.ease + (grade === 1 ? -0.15 : grade === 3 ? 0.15 : 0));
    card.due = now + card.ivl * DAY;
  }
  card.last = now;
  return card;
}

export function previewLabel(c: SrsCard | undefined, grade: 0 | 1 | 2 | 3) {
  const n = schedule(c, grade, 0);
  const ms = n.due;
  if (ms < 60 * MIN) return Math.max(1, Math.round(ms / MIN)) + "m";
  if (ms < DAY) return Math.round(ms / (60 * MIN)) + "h";
  const d = ms / DAY;
  return d < 30 ? Math.round(d) + "d" : Math.round(d / 30) + "mo";
}

/** Build a session: due cards first, then up to `newLimit` unseen cards from `pool` order. */
export function buildQueue(pool: string[], newLimit: number, p: Progress = getProgress(), now = Date.now()) {
  const due = pool.filter((id) => p.srs[id] && p.srs[id].due <= now).sort((a, b) => p.srs[a].due - p.srs[b].due);
  const fresh = pool.filter((id) => !p.srs[id]).slice(0, newLimit);
  return { due, fresh, queue: [...due, ...fresh] };
}

export function grade(id: string, g: 0 | 1 | 2 | 3, onKnown?: (p: Progress) => void) {
  updateProgress((p) => {
    const wasNew = !p.srs[id];
    p.srs[id] = schedule(p.srs[id], g);
    bumpDay(p, (d) => { d.reviews++; if (wasNew) d.learned++; if (g > 0) d.correct++; else d.wrong++; });
    if (g >= 2 && p.srs[id].reps >= 2) onKnown?.(p);
  });
}

export function dueCount(pool: string[], p: Progress = getProgress(), now = Date.now()) {
  let n = 0;
  for (const id of pool) if (p.srs[id] && p.srs[id].due <= now) n++;
  return n;
}
