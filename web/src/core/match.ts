import { pack } from "../pack";

export const norm = (s: string) => { const f = pack().normalize; return f ? f(s) : s.toLowerCase().replace(/[\s\p{P}]/gu, ""); };
function lev(a: string, b: string) {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[a.length][b.length];
}
export function matchScore(heard: string[], targets: string[]) {
  let best = 0;
  for (const h of heard) for (const t of targets) {
    const a = norm(h), b = norm(t);
    if (!a || !b) continue;
    if (a === b || a.includes(b)) return 1;
    best = Math.max(best, 1 - lev(a, b) / Math.max(a.length, b.length));
  }
  return best;
}

