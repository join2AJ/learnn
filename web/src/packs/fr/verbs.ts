import type { VerbForm, Word } from "../../core/types";

/** French conjugator: regular -er / -ir / -re verbs + irregular families (with prefixes: comprendre, devenir…). */
type Irr = { p: string; f: string; pp: string; sj: string; imp?: [string, string, string]; pres?: string; etre?: boolean; impers?: boolean };
const IRR: Record<string, Irr> = {
  "être": { p: "suis es est sommes êtes sont", f: "ser", pp: "été", sj: "sois", imp: ["sois", "soyons", "soyez"], pres: "étant" },
  "avoir": { p: "ai as a avons avez ont", f: "aur", pp: "eu", sj: "aie", imp: ["aie", "ayons", "ayez"], pres: "ayant" },
  "aller": { p: "vais vas va allons allez vont", f: "ir", pp: "allé", sj: "aille", imp: ["va", "allons", "allez"], etre: true },
  "faire": { p: "fais fais fait faisons faites font", f: "fer", pp: "fait", sj: "fasse" },
  "pouvoir": { p: "peux peux peut pouvons pouvez peuvent", f: "pourr", pp: "pu", sj: "puisse" },
  "vouloir": { p: "veux veux veut voulons voulez veulent", f: "voudr", pp: "voulu", sj: "veuille", imp: ["veuille", "veuillons", "veuillez"] },
  "devoir": { p: "dois dois doit devons devez doivent", f: "devr", pp: "dû", sj: "doive" },
  "savoir": { p: "sais sais sait savons savez savent", f: "saur", pp: "su", sj: "sache", imp: ["sache", "sachons", "sachez"], pres: "sachant" },
  "dire": { p: "dis dis dit disons dites disent", f: "dir", pp: "dit", sj: "dise" },
  "voir": { p: "vois vois voit voyons voyez voient", f: "verr", pp: "vu", sj: "voie" },
  "venir": { p: "viens viens vient venons venez viennent", f: "viendr", pp: "venu", sj: "vienne" },
  "tenir": { p: "tiens tiens tient tenons tenez tiennent", f: "tiendr", pp: "tenu", sj: "tienne" },
  "prendre": { p: "prends prends prend prenons prenez prennent", f: "prendr", pp: "pris", sj: "prenne" },
  "mettre": { p: "mets mets met mettons mettez mettent", f: "mettr", pp: "mis", sj: "mette" },
  "partir": { p: "pars pars part partons partez partent", f: "partir", pp: "parti", sj: "parte" },
  "sortir": { p: "sors sors sort sortons sortez sortent", f: "sortir", pp: "sorti", sj: "sorte" },
  "dormir": { p: "dors dors dort dormons dormez dorment", f: "dormir", pp: "dormi", sj: "dorme" },
  "sentir": { p: "sens sens sent sentons sentez sentent", f: "sentir", pp: "senti", sj: "sente" },
  "servir": { p: "sers sers sert servons servez servent", f: "servir", pp: "servi", sj: "serve" },
  "mentir": { p: "mens mens ment mentons mentez mentent", f: "mentir", pp: "menti", sj: "mente" },
  "ouvrir": { p: "ouvre ouvres ouvre ouvrons ouvrez ouvrent", f: "ouvrir", pp: "ouvert", sj: "ouvre", imp: ["ouvre", "ouvrons", "ouvrez"] },
  "couvrir": { p: "couvre couvres couvre couvrons couvrez couvrent", f: "couvrir", pp: "couvert", sj: "couvre", imp: ["couvre", "couvrons", "couvrez"] },
  "offrir": { p: "offre offres offre offrons offrez offrent", f: "offrir", pp: "offert", sj: "offre", imp: ["offre", "offrons", "offrez"] },
  "souffrir": { p: "souffre souffres souffre souffrons souffrez souffrent", f: "souffrir", pp: "souffert", sj: "souffre", imp: ["souffre", "souffrons", "souffrez"] },
  "cueillir": { p: "cueille cueilles cueille cueillons cueillez cueillent", f: "cueiller", pp: "cueilli", sj: "cueille", imp: ["cueille", "cueillons", "cueillez"] },
  "croire": { p: "crois crois croit croyons croyez croient", f: "croir", pp: "cru", sj: "croie" },
  "connaître": { p: "connais connais connaît connaissons connaissez connaissent", f: "connaîtr", pp: "connu", sj: "connaisse" },
  "paraître": { p: "parais parais paraît paraissons paraissez paraissent", f: "paraîtr", pp: "paru", sj: "paraisse" },
  "naître": { p: "nais nais naît naissons naissez naissent", f: "naîtr", pp: "né", sj: "naisse" },
  "vivre": { p: "vis vis vit vivons vivez vivent", f: "vivr", pp: "vécu", sj: "vive" },
  "suivre": { p: "suis suis suit suivons suivez suivent", f: "suivr", pp: "suivi", sj: "suive" },
  "lire": { p: "lis lis lit lisons lisez lisent", f: "lir", pp: "lu", sj: "lise" },
  "crire": { p: "cris cris crit crivons crivez crivent", f: "crir", pp: "crit", sj: "crive" },
  "boire": { p: "bois bois boit buvons buvez boivent", f: "boir", pp: "bu", sj: "boive" },
  "cevoir": { p: "çois çois çoit cevons cevez çoivent", f: "cevr", pp: "çu", sj: "çoive" },
  "courir": { p: "cours cours court courons courez courent", f: "courr", pp: "couru", sj: "coure" },
  "mourir": { p: "meurs meurs meurt mourons mourez meurent", f: "mourr", pp: "mort", sj: "meure" },
  "falloir": { p: "- - faut - - -", f: "faudr", pp: "fallu", sj: "faille", impers: true },
  "valoir": { p: "vaux vaux vaut valons valez valent", f: "vaudr", pp: "valu", sj: "vaille" },
  "uire": { p: "uis uis uit uisons uisez uisent", f: "uir", pp: "uit", sj: "uise" },
  "rire": { p: "ris ris rit rions riez rient", f: "rir", pp: "ri", sj: "rie" },
  "plaire": { p: "plais plais plaît plaisons plaisez plaisent", f: "plair", pp: "plu", sj: "plaise" },
  "aindre": { p: "ains ains aint aignons aignez aignent", f: "aindr", pp: "aint", sj: "aigne" },
  "eindre": { p: "eins eins eint eignons eignez eignent", f: "eindr", pp: "eint", sj: "eigne" },
  "battre": { p: "bats bats bat battons battez battent", f: "battr", pp: "battu", sj: "batte" },
  "envoyer": { p: "envoie envoies envoie envoyons envoyez envoient", f: "enverr", pp: "envoyé", sj: "envoie", imp: ["envoie", "envoyons", "envoyez"] },
  "conclure": { p: "conclus conclus conclut concluons concluez concluent", f: "conclur", pp: "conclu", sj: "conclue" },
  "inclure": { p: "inclus inclus inclut incluons incluez incluent", f: "inclur", pp: "inclus", sj: "inclue" },
  "suffire": { p: "suffis suffis suffit suffisons suffisez suffisent", f: "suffir", pp: "suffi", sj: "suffise" },
};
const KEYS = Object.keys(IRR).sort((a, b) => b.length - a.length);
const ETRE = new Set("aller venir devenir revenir parvenir intervenir arriver partir repartir sortir entrer rentrer rester retourner monter descendre tomber naître mourir passer".split(" "));
const NO_IR2 = /(quérir|fuir)$/;

const VOW = /^[aàâeéèêëiîïoôuùûyh]/i;
const subj = ["je", "tu", "il/elle", "nous", "vous", "ils/elles"];
const el = (pro: string, v: string) => (pro === "je" && VOW.test(v) && !/^h(a|é|o)/.test(v) ? "j'" + v : pro + " " + v);
const ne = (v: string) => (VOW.test(v) ? "n'" + v : "ne " + v);

type Group = "er" | "ir" | "re" | "irr";
function resolve(inf: string): { g: Group; pres: string[]; fut: string; pp: string; sj: string; imp: [string, string, string]; ppres: string; impers?: boolean } | null {
  for (const k of KEYS) {
    if (!inf.endsWith(k)) continue;
    const pre = inf.slice(0, inf.length - k.length);
    if (k === "rire" && pre && pre !== "sou") continue;          // écrire etc. are handled by "crire"
    if (k === "lire" && pre && pre !== "é" && pre !== "re") continue;
    if (k === "dire" && pre && !["re", "inter", "pré", "contre"].includes(pre)) continue;
    if (k === "uire" && !/(cond|constr|détr|prod|réd|trad|introd|sed|ind)$/.test(pre)) continue;
    const d = IRR[k];
    const pres = d.p.split(" ").map((x) => (x === "-" ? "" : pre + x));
    if (k === "dire" && pre && pre !== "re") pres[4] = pre + "disez";
    const nousStem = pres[3] ? pres[3].replace(/ons$/, "") : pre + d.f;
    const imp: [string, string, string] = d.imp ? d.imp.map((x) => pre + x) as [string, string, string] : [pres[1].replace(/s$/, inf === "aller" ? "" : "s"), pres[3], pres[4]];
    const fut = inf === "prévoir" ? "prévoir" : pre + d.f;
    return { g: "irr", pres, fut, pp: pre + d.pp, sj: pre + d.sj, imp, ppres: d.pres ? pre + d.pres : nousStem + "ant", impers: d.impers };
  }
  if (inf.endsWith("er")) {
    let st = inf.slice(0, -2);
    const soft = (e: string) => (/c$/.test(st) && /^[ao]/.test(e) ? st.slice(0, -1) + "ç" : /g$/.test(st) && /^[ao]/.test(e) ? st + "e" : st);
    // stem changes in je/tu/il/ils (and future for e→è / doubling)
    let strong = st, futSt = inf;
    if (/(app|r?app|j|rej)e[lt]$/.test(st) || /^(appel|rappel|jet|rejet)$/.test(st)) { strong = st + st.slice(-1); futSt = strong + "er"; }
    else if (/e[^aeiouyé]$/.test(st) && /[^e]e[bcdfgjklmnpqrstvz]$/.test(st)) { strong = st.replace(/e([^aeiouy])$/, "è$1"); futSt = strong + "er"; }
    else if (/é[^aeiouyéèê]+$/.test(st)) { strong = st.replace(/é([^aeiouyéèê]+)$/, "è$1"); }
    else if (/(o|u)y$/.test(st)) { strong = st.slice(0, -1) + "i"; futSt = strong + "er"; }
    const pres = [strong + "e", strong + "es", strong + "e", soft("ons") + "ons", st + "ez", strong + "ent"];
    return { g: "er", pres, fut: futSt, pp: st + "é", sj: strong + "e", imp: [strong + "e", soft("ons") + "ons", st + "ez"], ppres: soft("ant") + "ant" };
  }
  if (inf.endsWith("ir") && !NO_IR2.test(inf)) {
    const st = inf.slice(0, -2);
    const pres = [st + "is", st + "is", st + "it", st + "issons", st + "issez", st + "issent"];
    return { g: "ir", pres, fut: inf, pp: st + "i", sj: st + "isse", imp: [st + "is", st + "issons", st + "issez"], ppres: st + "issant" };
  }
  if (inf.endsWith("re")) {
    const st = inf.slice(0, -2);
    const pres = [st + "s", st + "s", st, st + "ons", st + "ez", st + "ent"];
    return { g: "re", pres, fut: inf.slice(0, -1), pp: st + "u", sj: st + "e", imp: [st + "s", st + "ons", st + "ez"], ppres: st + "ant" };
  }
  return null;
}

const infOf = (w: Word) => w.r.replace(/^(se |s')/, "");
export function verbGroup(w: Word): string | null {
  if (w.t !== "verb") return null;
  return resolve(infOf(w))?.g ?? null;
}
export const verbGroups: Record<string, [string, string]> = {
  er: ["Regular -er (1st group)", "var(--matcha)"], ir: ["Regular -ir like finir (2nd group)", "var(--ai)"],
  re: ["Regular -re like vendre", "var(--plum)"], irr: ["Irregular (3rd group)", "var(--shu)"],
};

/* ---------- English templates ---------- */
const IRR_EN: Record<string, [string, string]> = {
  be: ["was", "been"], have: ["had", "had"], go: ["went", "gone"], do: ["did", "done"], make: ["made", "made"], say: ["said", "said"], see: ["saw", "seen"],
  know: ["knew", "known"], take: ["took", "taken"], come: ["came", "come"], give: ["gave", "given"], find: ["found", "found"], think: ["thought", "thought"],
  get: ["got", "got"], put: ["put", "put"], leave: ["left", "left"], feel: ["felt", "felt"], become: ["became", "become"], hold: ["held", "held"],
  bring: ["brought", "brought"], begin: ["began", "begun"], keep: ["kept", "kept"], write: ["wrote", "written"], read: ["read", "read"], run: ["ran", "run"],
  speak: ["spoke", "spoken"], eat: ["ate", "eaten"], drink: ["drank", "drunk"], sleep: ["slept", "slept"], buy: ["bought", "bought"], sell: ["sold", "sold"],
  lose: ["lost", "lost"], win: ["won", "won"], meet: ["met", "met"], pay: ["paid", "paid"], send: ["sent", "sent"], spend: ["spent", "spent"],
  understand: ["understood", "understood"], fall: ["fell", "fallen"], hear: ["heard", "heard"], mean: ["meant", "meant"], tell: ["told", "told"],
  build: ["built", "built"], choose: ["chose", "chosen"], fly: ["flew", "flown"], forget: ["forgot", "forgotten"], grow: ["grew", "grown"], hide: ["hid", "hidden"],
  lead: ["led", "led"], lend: ["lent", "lent"], rise: ["rose", "risen"], set: ["set", "set"], shoot: ["shot", "shot"], sing: ["sang", "sung"], sit: ["sat", "sat"],
  stand: ["stood", "stood"], steal: ["stole", "stolen"], swear: ["swore", "sworn"], teach: ["taught", "taught"], throw: ["threw", "thrown"], wake: ["woke", "woken"],
  wear: ["wore", "worn"], beat: ["beat", "beaten"], break: ["broke", "broken"], catch: ["caught", "caught"], cost: ["cost", "cost"], cut: ["cut", "cut"],
  draw: ["drew", "drawn"], drive: ["drove", "driven"], fight: ["fought", "fought"], forbid: ["forbade", "forbidden"], hit: ["hit", "hit"], hurt: ["hurt", "hurt"],
  let: ["let", "let"], lie: ["lied", "lied"], seek: ["sought", "sought"], show: ["showed", "shown"], die: ["died", "died"], can: ["could", "been able to"],
  must: ["had to", "had to"], prefer: ["preferred", "preferred"], refer: ["referred", "referred"], stop: ["stopped", "stopped"], plan: ["planned", "planned"], admit: ["admitted", "admitted"], occur: ["occurred", "occurred"], regret: ["regretted", "regretted"], want: ["wanted", "wanted"], suffer: ["suffered", "suffered"], open: ["opened", "opened"], offer: ["offered", "offered"],
};
function enBase(m: string) { return m.split(/[;,(]/)[0].trim().replace(/^to /, "").replace(/^be able to$/, "can"); }
function enS(v: string) { const [h, ...r] = v.split(" "); const s = h === "be" ? "is" : h === "have" ? "has" : h === "can" || h === "must" ? h : /(s|sh|ch|x|o)$/.test(h) ? h + "es" : /[^aeiou]y$/.test(h) ? h.slice(0, -1) + "ies" : h + "s"; return [s, ...r].join(" "); }
function enPast(v: string, i: 0 | 1) { const [h, ...r] = v.split(" "); const irr = IRR_EN[h]; const p = irr ? irr[i] : /e$/.test(h) ? h + "d" : /[^aeiou]y$/.test(h) ? h.slice(0, -1) + "ied" : h + "ed"; return [p, ...r].join(" "); }
function enIng(v: string) { const [h, ...r] = v.split(" "); const g = h === "be" ? "being" : /ie$/.test(h) ? h.slice(0, -2) + "ying" : /[^e]e$/.test(h) ? h.slice(0, -1) + "ing" : h + "ing"; return [g, ...r].join(" "); }

export function conjugate(w: Word): VerbForm[] | null {
  if (w.t !== "verb") return null;
  const inf = infOf(w);
  const r = resolve(inf);
  if (!r) return null;
  const b = enBase(w.m);
  const aux = ETRE.has(inf) ? IRR["être"].p.split(" ") : IRR["avoir"].p.split(" ");
  const pp = r.pp + (ETRE.has(inf) ? "(e)" : "");
  const imparfaitStem = inf === "être" ? "ét" : r.pres[3] ? r.pres[3].replace(/ons$/, "") : r.fut.replace(/r$/, "");
  const ENP = ["I", "you", "he/she", "we", "you (all)", "they"];
  const HI = ["मैं", "तुम", "वह", "हम", "आप/तुम सब", "वे"];
  const forms: VerbForm[] = [];
  if (r.impers) {
    forms.push({ key: "p3", label: "Present · il", jp: "il " + r.pres[2], ro: "", en: "it " + enS(b), hi: "वर्तमान" });
  } else {
    r.pres.forEach((v, i) => forms.push({ key: "p" + i, label: "Present · " + subj[i], jp: el(subj[i].split("/")[0], v), ro: "", en: ENP[i] + " " + (i === 2 ? enS(b) : b === "be" ? (i === 0 ? "am" : "are") : b), hi: "वर्तमान · " + HI[i] }));
  }
  const je = (v: string) => el("je", v);
  const P1 = r.impers ? (v: string) => "il " + v : je;
  const who = r.impers ? "it" : "I";
  forms.push(
    { key: "pc", label: "Passé composé (past)", jp: r.impers ? "il a " + r.pp : el("je", aux[0]) + " " + pp, ro: "", en: who + " " + enPast(b, 0) + " / " + (r.impers ? "has" : "have") + " " + enPast(b, 1), hi: "भूतकाल (पूर्ण)" },
    { key: "imp", label: "Imparfait (was …ing / used to)", jp: P1(imparfaitStem + (r.impers ? "ait" : "ais")), ro: "", en: who + " was " + enIng(b) + " / used to " + b, hi: "भूतकाल (अपूर्ण)" },
    { key: "fut", label: "Futur simple (will)", jp: P1(r.fut + (r.impers ? "a" : "ai")), ro: "", en: who + " will " + b, hi: "भविष्य" },
  );
  if (!r.impers) forms.push({ key: "fp", label: "Futur proche (going to)", jp: "je vais " + inf, ro: "", en: "I am going to " + b, hi: "निकट भविष्य" });
  forms.push(
    { key: "cond", label: "Conditionnel (would)", jp: P1(r.fut + "ais"), ro: "", en: who + " would " + b, hi: "शर्त / विनम्रता" },
    { key: "subj", label: "Subjonctif (that I …)", jp: r.impers ? "qu'il " + r.sj : (VOW.test(r.sj) ? "que j'" : "que je ") + r.sj, ro: "", en: "that " + (r.impers ? "it " : "I ") + b, hi: "इच्छा / ज़रूरत" },
  );
  if (!r.impers) forms.push(
    { key: "imp1", label: "Imperative · tu", jp: r.imp[0] + " !", ro: "", en: b.charAt(0).toUpperCase() + b.slice(1) + "!", hi: "आज्ञा (तुम)" },
    { key: "imp2", label: "Imperative · nous", jp: r.imp[1] + " !", ro: "", en: "Let's " + b + "!", hi: "आइए…" },
    { key: "imp3", label: "Imperative · vous (polite)", jp: r.imp[2] + " !", ro: "", en: b.charAt(0).toUpperCase() + b.slice(1) + "! (polite)", hi: "आज्ञा (आप)" },
    { key: "neg", label: "Negative", jp: "je " + ne(r.pres[0]) + " pas", ro: "", en: b === "be" ? "I am not" : "I don't " + b, hi: "नकारात्मक" },
    { key: "q", label: "Question", jp: "Est-ce que tu " + r.pres[1] + " ?", ro: "", en: b === "be" ? "Are you…?" : "Do you " + b + "?", hi: "प्रश्न" },
    { key: "pqp", label: "Plus-que-parfait (had …)", jp: el("je", ETRE.has(inf) ? "étais" : "avais") + " " + pp, ro: "", en: "I had " + enPast(b, 1), hi: "पूर्ण भूतकाल" },
  );
  forms.push(
    { key: "ppa", label: "Past participle", jp: r.pp, ro: "", en: enPast(b, 1), hi: "भूत कृदंत" },
    { key: "ppr", label: "Present participle", jp: r.ppres, ro: "", en: enIng(b), hi: "वर्तमान कृदंत" },
  );
  return forms;
}
