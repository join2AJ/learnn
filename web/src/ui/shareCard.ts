import type { Progress, Settings } from "../core/store";
import { levelOf } from "../core/rewards";
import { shareImage } from "../core/native";

const W = 1080, H = 1350;
const font = () => getComputedStyle(document.body).fontFamily || "sans-serif";
const JP = '"Noto Serif JP", "Hiragino Mincho ProN", serif';

function base(c1: string, c2: string) {
  const cv = document.createElement("canvas"); cv.width = W; cv.height = H;
  const g = cv.getContext("2d")!;
  const gr = g.createRadialGradient(W * 0.85, 0, 50, W * 0.6, H * 0.4, H);
  gr.addColorStop(0, c1); gr.addColorStop(1, c2);
  g.fillStyle = gr; g.fillRect(0, 0, W, H);
  // petals
  g.fillStyle = "rgba(255,214,226,.35)";
  for (let i = 0; i < 26; i++) { const x = (i * 197) % W, y = (i * 311) % H, r = 10 + (i % 4) * 4; g.save(); g.translate(x, y); g.rotate(i); g.beginPath(); g.ellipse(0, 0, r, r * 0.6, 0, 0, Math.PI * 2); g.fill(); g.restore(); }
  // watermark
  g.fillStyle = "rgba(255,255,255,.07)"; g.font = `800 760px ${JP}`; g.textAlign = "right"; g.textBaseline = "alphabetic"; g.fillText("道", W + 80, H - 120);
  return { cv, g };
}
function logo(g: CanvasRenderingContext2D, x: number, y: number, s = 96) {
  g.fillStyle = "#fff"; round(g, x, y, s, s, s * 0.28); g.fill();
  g.fillStyle = "#e2553c"; g.font = `800 ${s * 0.62}px ${JP}`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("道", x + s / 2, y + s / 2 + 4);
}
function round(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath();
}
function text(g: CanvasRenderingContext2D, t: string, x: number, y: number, size: number, weight = 700, color = "#fff", align: CanvasTextAlign = "left", fam = font()) {
  g.fillStyle = color; g.font = `${weight} ${size}px ${fam}`; g.textAlign = align; g.textBaseline = "alphabetic"; g.fillText(t, x, y);
}
function chip(g: CanvasRenderingContext2D, t: string, x: number, y: number) {
  g.font = `800 34px ${font()}`; const w = g.measureText(t).width + 56;
  g.fillStyle = "#fff"; round(g, x, y, w, 70, 35); g.fill(); text(g, t, x + 28, y + 47, 34, 800, "#1d1d22"); return w;
}

/** Shareable "my level" card (1080×1350 JPEG). */
export function levelCard(p: Progress, s: Settings, levelName: { jp: string; en: string }, wordsTotal: number): string {
  const { cv, g } = base("#3a3f7a", "#14162b");
  const lv = levelOf(p.xp);
  logo(g, 70, 70); text(g, "Nihongo Path", 190, 135, 50, 800); text(g, "日本語の道", 190, 178, 30, 600, "rgba(255,255,255,.75)", "left", JP);
  text(g, (s.name ? s.name + " is" : "I’m") + " learning Japanese", 70, 330, 56, 800);
  // ring
  const cx = 250, cy = 560, r = 150;
  g.lineWidth = 26; g.strokeStyle = "rgba(255,255,255,.14)"; g.beginPath(); g.arc(cx, cy, r, 0, Math.PI * 2); g.stroke();
  g.strokeStyle = "#f1bd55"; g.lineCap = "round"; g.beginPath(); g.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * Math.max(0.02, lv.pct)); g.stroke();
  text(g, "LEVEL", cx, cy - 40, 30, 700, "rgba(255,255,255,.7)", "center"); text(g, String(lv.level), cx, cy + 55, 120, 900, "#fff", "center");
  text(g, levelName.jp, 470, 520, 84, 800, "#fff", "left", JP); text(g, levelName.en, 470, 590, 44, 700, "#f1bd55");
  text(g, p.xp.toLocaleString() + " XP", 470, 650, 36, 600, "rgba(255,255,255,.8)");
  // stats
  const st: [string, string][] = [[String(p.streak.count), "day streak"], [String(p.known.length), "words of " + wordsTotal.toLocaleString()], [String(Object.keys(p.badges).length), "badges"], [String(Object.values(p.days).filter((d) => d.ms > 60000).length), "active days"]];
  st.forEach(([v, k], i) => {
    const x = 70 + (i % 2) * 480, y = 780 + Math.floor(i / 2) * 190;
    g.fillStyle = "rgba(255,255,255,.1)"; round(g, x, y, 450, 160, 32); g.fill();
    text(g, v, x + 36, y + 92, 70, 900); text(g, k, x + 36, y + 135, 30, 600, "rgba(255,255,255,.75)");
  });
  text(g, "Free · offline · English + हिन्दी", 70, 1220, 34, 700, "rgba(255,255,255,.85)");
  text(g, "がんばって！", W - 70, 1220, 40, 800, "#f1bd55", "right", JP);
  return cv.toDataURL("image/jpeg", 0.9);
}

/** Shareable invite card for the app (1080×1350 JPEG). */
export function appCard(words: number, sentences: number): string {
  const { cv, g } = base("#ef6a4a", "#7d1f35");
  logo(g, W / 2 - 90, 120, 180);
  text(g, "Nihongo Path", W / 2, 420, 92, 900, "#fff", "center");
  text(g, "日本語の道", W / 2, 490, 46, 600, "rgba(255,255,255,.85)", "center", JP);
  text(g, "Learn Japanese from your very first あ", W / 2, 580, 42, 700, "#fff", "center");
  const rows: [string, string][] = [["あ", "All 104 kana with sound & stroke order"], ["話", "Speak and see your own voice"], ["語", words.toLocaleString() + " words · " + sentences.toLocaleString() + " sentences"], ["地", "Map of Japan, places & culture"]];
  rows.forEach(([k, t], i) => {
    const y = 660 + i * 120;
    g.fillStyle = "rgba(255,255,255,.18)"; round(g, 120, y, 840, 100, 30); g.fill();
    g.fillStyle = "#fff"; round(g, 140, y + 15, 70, 70, 20); g.fill();
    text(g, k, 175, y + 66, 44, 800, "#e2553c", "center", JP);
    text(g, t, 240, y + 63, 36, 700);
  });
  let x = 150; ["Free", "Offline", "English + हिन्दी", "No ads"].forEach((c) => { x += chip(g, c, x, 1170) + 16; });
  return cv.toDataURL("image/jpeg", 0.9);
}

export function shareCard(dataUrl: string, name: string, message: string) {
  shareImage(dataUrl.split(",")[1], name, message);
}
