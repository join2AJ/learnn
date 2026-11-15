import type { VerbForm, Word } from "../../core/types";
import { toHira } from "./kana";

/* ---------- kana → romaji (Hepburn) ---------- */
const R: Record<string, string> = {
  あ:"a",い:"i",う:"u",え:"e",お:"o",か:"ka",き:"ki",く:"ku",け:"ke",こ:"ko",さ:"sa",し:"shi",す:"su",せ:"se",そ:"so",
  た:"ta",ち:"chi",つ:"tsu",て:"te",と:"to",な:"na",に:"ni",ぬ:"nu",ね:"ne",の:"no",は:"ha",ひ:"hi",ふ:"fu",へ:"he",ほ:"ho",
  ま:"ma",み:"mi",む:"mu",め:"me",も:"mo",や:"ya",ゆ:"yu",よ:"yo",ら:"ra",り:"ri",る:"ru",れ:"re",ろ:"ro",わ:"wa",を:"o",ん:"n",
  が:"ga",ぎ:"gi",ぐ:"gu",げ:"ge",ご:"go",ざ:"za",じ:"ji",ず:"zu",ぜ:"ze",ぞ:"zo",だ:"da",ぢ:"ji",づ:"zu",で:"de",ど:"do",
  ば:"ba",び:"bi",ぶ:"bu",べ:"be",ぼ:"bo",ぱ:"pa",ぴ:"pi",ぷ:"pu",ぺ:"pe",ぽ:"po",ぁ:"a",ぃ:"i",ぅ:"u",ぇ:"e",ぉ:"o",ゔ:"vu",
};
export function romaji(kana: string): string {
  const s = toHira(kana);
  let out = "";
  for (let i = 0; i < s.length; i++) {
    const c = s[i], n = s[i + 1];
    if (c === "っ") { const nx = romaji(s.slice(i + 1, i + 3)); out += nx ? (nx.startsWith("ch") ? "t" : nx[0]) : ""; continue; }
    if (c === "ー") { const m = out.match(/[aeiou]$/); out += m ? m[0] : ""; continue; }
    if (n && "ゃゅょ".includes(n) && R[c]) {
      const base = R[c];
      const v = n === "ゃ" ? "a" : n === "ゅ" ? "u" : "o";
      out += (base === "shi" ? "sh" : base === "chi" ? "ch" : base === "ji" ? "j" : base.slice(0, -1) + "y") + v;
      i++; continue;
    }
    if (c === "ん" && n && "あいうえおやゆよ".includes(n)) { out += "n'"; continue; }
    out += R[c] ?? c;
  }
  return out;
}

/* ---------- verb groups ---------- */
const GODAN_RU = new Set(["知る","入る","走る","減る","帰る","切る","要る","限る","喋る","滑る","蹴る","焦る","握る","照る","参る"]);
const ROW: Record<string, [string, string, string, string]> = {
  う: ["わ", "い", "え", "お"], く: ["か", "き", "け", "こ"], ぐ: ["が", "ぎ", "げ", "ご"], す: ["さ", "し", "せ", "そ"],
  つ: ["た", "ち", "て", "と"], ぬ: ["な", "に", "ね", "の"], ぶ: ["ば", "び", "べ", "ぼ"], む: ["ま", "み", "め", "も"], る: ["ら", "り", "れ", "ろ"],
};
const IE = new Set("いきぎしじちぢにひびぴみりえけげせぜてでねへべぺめれ");

export function verbGroup(w: Word): "ichidan" | "godan" | "suru" | "kuru" | "fixed" | null {
  if (w.t !== "verb") return null;
  if (w.w === "ください" || w.w === "なさい") return "fixed";
  if (w.r === "する" || w.r.endsWith("する")) return "suru";
  if (w.r === "くる") return "kuru";
  const last = w.r.slice(-1);
  if (last !== "る") return ROW[last] ? "godan" : null;
  if (GODAN_RU.has(w.w)) return "godan";
  const prev = w.r.slice(-2, -1);
  return IE.has(prev) ? "ichidan" : "godan";
}

const baseEn = (m: string) => m.split(/[;,(]/)[0].trim().replace(/^to /, "");
const ing = (b: string) => {
  const [v, ...rest] = b.split(" ");
  const g = v.endsWith("ie") ? v.slice(0, -2) + "ying" : v.endsWith("e") && !v.endsWith("ee") && v !== "be" ? v.slice(0, -1) + "ing" : v + "ing";
  return [g, ...rest].join(" ");
};

/** Conjugate on both the written form and the reading, so kanji are kept. */
export function conjugate(w: Word): VerbForm[] | null {
  const g = verbGroup(w);
  if (!g || g === "fixed") return null;
  const b = baseEn(w.m);
  type Stem = (end: string) => [string, string];
  // returns [written, reading] for a given replacement of the final kana
  const swap = (cut: number, add: string, addR = add): [string, string] => [w.w.slice(0, w.w.length - cut) + add, w.r.slice(0, w.r.length - cut) + addR];

  let f: Record<string, [string, string]>;
  if (g === "ichidan") {
    const s: Stem = (e) => swap(1, e);
    f = { dict: [w.w, w.r], masu: s("ます"), nai: s("ない"), masen: s("ません"), ta: s("た"), mashita: s("ました"), nakatta: s("なかった"),
      masendeshita: s("ませんでした"), te: s("て"), teiru: s("ている"), tai: s("たい"), mashou: s("ましょう"), you: s("よう"),
      pot: s("られる"), pass: s("られる"), caus: s("させる"), ba: s("れば"), tara: s("たら"), imp: s("ろ"), proh: [w.w + "な", w.r + "な"] };
  } else if (g === "suru") {
    const s = (e: string) => swap(2, e);
    f = { dict: [w.w, w.r], masu: s("します"), nai: s("しない"), masen: s("しません"), ta: s("した"), mashita: s("しました"), nakatta: s("しなかった"),
      masendeshita: s("しませんでした"), te: s("して"), teiru: s("している"), tai: s("したい"), mashou: s("しましょう"), you: s("しよう"),
      pot: w.r === "する" ? ["できる", "できる"] : s("できる"), pass: s("される"), caus: s("させる"), ba: s("すれば"), tara: s("したら"), imp: s("しろ"), proh: [w.w + "な", w.r + "な"] };
  } else if (g === "kuru") {
    const k = (wr: string, rd: string): [string, string] => (w.w.startsWith("来") ? ["来" + wr, rd] : [rd, rd]);
    f = { dict: [w.w, w.r], masu: k("ます", "きます"), nai: k("ない", "こない"), masen: k("ません", "きません"), ta: k("た", "きた"), mashita: k("ました", "きました"),
      nakatta: k("なかった", "こなかった"), masendeshita: k("ませんでした", "きませんでした"), te: k("て", "きて"), teiru: k("ている", "きている"), tai: k("たい", "きたい"),
      mashou: k("ましょう", "きましょう"), you: k("よう", "こよう"), pot: k("られる", "こられる"), pass: k("られる", "こられる"), caus: k("させる", "こさせる"),
      ba: k("れば", "くれば"), tara: k("たら", "きたら"), imp: k("い", "こい"), proh: k("るな", "くるな") };
  } else {
    const last = w.r.slice(-1);
    const [a, i, e, o] = ROW[last];
    const s = (e2: string) => swap(1, e2);
    let te: string, ta: string;
    if (w.r === "いく" || w.r.endsWith("いく") && w.w.endsWith("行く")) { te = "って"; ta = "った"; }
    else if ("うつる".includes(last)) { te = "って"; ta = "った"; }
    else if ("むぶぬ".includes(last)) { te = "んで"; ta = "んだ"; }
    else if (last === "く") { te = "いて"; ta = "いた"; }
    else if (last === "ぐ") { te = "いで"; ta = "いだ"; }
    else { te = "して"; ta = "した"; }
    const nai: [string, string] = w.r === "ある" ? ["ない", "ない"] : s(a + "ない");
    const nakatta: [string, string] = w.r === "ある" ? ["なかった", "なかった"] : s(a + "なかった");
    f = { dict: [w.w, w.r], masu: s(i + "ます"), nai, masen: s(i + "ません"), ta: s(ta), mashita: s(i + "ました"), nakatta,
      masendeshita: s(i + "ませんでした"), te: s(te), teiru: s(te + "いる"), tai: s(i + "たい"), mashou: s(i + "ましょう"), you: s(o + "う"),
      pot: s(e + "る"), pass: s(a + "れる"), caus: s(a + "せる"), ba: s(e + "ば"), tara: s(ta + "ら"), imp: s(e), proh: [w.w + "な", w.r + "な"] };
  }

  const L: [string, string, string, string][] = [
    ["dict", "Dictionary (plain present/future)", "I " + b + " / will " + b, "सामान्य: करता हूँ / करूँगा"],
    ["masu", "Polite present (ます)", "I " + b + " (polite)", "विनम्र वर्तमान"],
    ["nai", "Plain negative (ない)", "I don’t " + b, "नहीं करता"],
    ["masen", "Polite negative (ません)", "I don’t " + b + " (polite)", "विनम्र नकार"],
    ["ta", "Plain past (た)", "I did " + b, "भूतकाल: किया"],
    ["mashita", "Polite past (ました)", "I did " + b + " (polite)", "विनम्र भूतकाल"],
    ["nakatta", "Plain past negative", "I didn’t " + b, "नहीं किया"],
    ["masendeshita", "Polite past negative", "I didn’t " + b + " (polite)", "विनम्र: नहीं किया"],
    ["te", "て-form (connector)", b + " and… / please (+ください)", "करके / कृपया"],
    ["teiru", "Progressive (ている)", "am " + ing(b), "कर रहा हूँ"],
    ["tai", "Want to (たい)", "want to " + b, "करना चाहता हूँ"],
    ["mashou", "Let’s (ましょう)", "let’s " + b, "चलो करें"],
    ["you", "Volitional (plain)", "let’s " + b + " / I’ll " + b, "चलो… (अनौपचारिक)"],
    ["pot", "Potential (can)", "can " + b, "कर सकता हूँ"],
    ["pass", "Passive", "be " + b + "-ed (by)", "कर्मवाच्य: किया जाना"],
    ["caus", "Causative", "make / let someone " + b, "करवाना"],
    ["ba", "Conditional (ば)", "if I " + b, "अगर करूँ तो"],
    ["tara", "Conditional (たら)", "if / when I " + b, "जब/अगर किया तो"],
    ["imp", "Imperative (rough)", b + "! (command)", "आदेश: करो!"],
    ["proh", "Prohibitive (rough)", "don’t " + b + "!", "मत करो!"],
  ];
  return L.map(([key, label, en, hi]) => ({ key, label, jp: f[key][0], ro: romaji(f[key][1]), en, hi }));
}
