"""
Extends the word list with the next most frequent Japanese words and builds a sentence bank.

Sources (all open):
  * wordfreq (Robyn Speer et al.) - frequency of every word (Zipf scale)
  * JMdict (EDRDG, CC BY-SA 4.0) - readings, part of speech, English meanings
  * Tatoeba (CC BY 2.0 FR) - real Japanese sentences with English translations
Run with a Python that has: wordfreq, fugashi, unidic-lite, mecab-python3, ipadic
  python scripts/build_words.py <data_dir> <how_many_new_words>
Outputs: web/src/packs/ja/data/core.json (adds words + "z"/"rank"), data/sentences.json, scripts/new_words.tsv
"""
import gzip, json, math, re, sys, pathlib, collections, xml.etree.ElementTree as ET
import wordfreq, fugashi

ROOT = pathlib.Path(__file__).resolve().parent.parent
DATA = pathlib.Path(sys.argv[1]); NEW = int(sys.argv[2]) if len(sys.argv) > 2 else 1000
core_p = ROOT / "web/src/packs/ja/data/core.json"
core = json.load(open(core_p, encoding="utf-8"))
words = core["words"]
tag = fugashi.Tagger()

KATA = str.maketrans({chr(c): chr(c - 0x60) for c in range(0x30A1, 0x30F7)})
def hira(s): return (s or "").translate(KATA)
R = dict(zip("あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをんがぎぐげござじずぜぞだぢづでどばびぶべぼぱぴぷぺぽぁぃぅぇぉゔ",
  "a i u e o ka ki ku ke ko sa shi su se so ta chi tsu te to na ni nu ne no ha hi fu he ho ma mi mu me mo ya yu yo ra ri ru re ro wa o n ga gi gu ge go za ji zu ze zo da ji zu de do ba bi bu be bo pa pi pu pe po a i u e o vu".split()))
def romaji(k):
    s, out, i = hira(k), "", 0
    while i < len(s):
        c, n = s[i], s[i + 1] if i + 1 < len(s) else ""
        if c == "っ":
            nx = romaji(s[i + 1:i + 3]); out += ("t" if nx.startswith("ch") else nx[:1]); i += 1; continue
        if c == "ー":
            m = re.search(r"[aeiou]$", out); out += m.group(0) if m else ""; i += 1; continue
        if n and n in "ゃゅょ" and c in R:
            b = R[c]; v = {"ゃ": "a", "ゅ": "u", "ょ": "o"}[n]
            out += ("sh" if b == "shi" else "ch" if b == "chi" else "j" if b == "ji" else b[:-1] + "y") + v; i += 2; continue
        out += R.get(c, c); i += 1
    return out

# ---------- 1. frequencies ----------
def zipf(w): return round(wordfreq.zipf_frequency(w, "ja"), 2)
for w in words:
    w["z"] = max(zipf(w["w"]), zipf(w["r"]) if w["r"] != w["w"] else 0)

have = set()
for w in words: have.add(w["w"]); have.add(w["r"])

KEEP = {"名詞", "動詞", "形容詞", "形状詞", "副詞", "代名詞", "連体詞", "感動詞", "接続詞"}
cand = collections.defaultdict(float); info = {}
for tok in wordfreq.top_n_list("ja", 40000):
    ms = tag(tok)
    if len(ms) != 1: continue
    m = ms[0]; f = m.feature
    if f.pos1 not in KEEP or f.pos2 in ("固有名詞", "数詞") or (f.pos1 == "名詞" and f.pos2 == "助動詞語幹"): continue
    lemma = f.orthBase or f.lemma
    if not lemma or re.search(r"[A-Za-z0-9０-９Ａ-Ｚａ-ｚ]", lemma) or len(lemma) < 1: continue
    if re.fullmatch(r"[ぁ-ゖ]", lemma): continue
    cand[lemma] += wordfreq.word_frequency(tok, "ja")
    info.setdefault(lemma, (f.pos1, f.kanaBase or f.kana, (f.lemma or "").split("-")[0]))

# ---------- 2. JMdict ----------
print("parsing JMdict…", file=sys.stderr)
jm = collections.defaultdict(list)
txt = open(DATA / "JMdict_e", encoding="utf-8").read()
txt = re.sub(r"&([\w-]+);", r"\1", txt)                       # keep entity names as plain text
txt = re.sub(r"<!DOCTYPE.*?\]>", "", txt, flags=re.S)
for e in ET.fromstring(txt).iter("entry"):
    kebs = [k.findtext("keb") for k in e.findall("k_ele")]
    rebs = [r.findtext("reb") for r in e.findall("r_ele")]
    pri = any(x.text for x in e.iter() if x.tag in ("ke_pri", "re_pri"))
    senses = []; pos = []; misc = []
    for s in e.findall("sense"):
        p = [x.text for x in s.findall("pos")]; pos += p
        misc += [x.text for x in s.findall("misc")]
        g = [x.text for x in s.findall("gloss")]
        if g: senses.append(g)
    rec = {"k": kebs, "r": rebs, "pri": pri, "pos": pos, "misc": misc, "senses": senses}
    for k in kebs + rebs: jm[k].append(rec)

def best_entry(lemma, kana, ud):
    es = [e for e in jm.get(lemma, []) if e["pri"]]           # common words only
    if not es: return None
    kana_only = re.fullmatch(r"[ぁ-ゖー]+", lemma) is not None
    def key(e):
        return (ud not in e["k"],                                 # UniDic says which kanji it is
                bool(kana_only and e["k"] and "uk" not in e["misc"]),  # a kana word should be one usually written in kana
                hira(kana) not in [hira(r) for r in e["r"]])
    return sorted(es, key=key)[0]

TYPE = [("v1", "verb"), ("v5", "verb"), ("vs", "verb"), ("vk", "verb"), ("adj-i", "i-adj"), ("adj-na", "na-adj"), ("adv", "adverb"),
        ("pn", "pron"), ("int", "interj"), ("conj", "conj"), ("adj-pn", "pre-noun"), ("exp", "expr"), ("n", "noun")]
def wtype(pos, pos1):
    for p in pos:
        for key, t in TYPE:
            if p == key or p.startswith(key + "-") or (key in ("v5", "v1") and p.startswith(key)):
                if key == "vs" and pos1 == "名詞": return "noun"
                return t
    return {"動詞": "verb", "形容詞": "i-adj", "形状詞": "na-adj", "副詞": "adverb", "代名詞": "pron"}.get(pos1, "noun")

BAD = {"vulg", "X", "arch", "obs", "derog", "sens", "rare", "obsc"}
SKIP = set("的 あり エロ クソ まぁ ホント 馬鹿 よし ガン 尻 ハイ すげ くそ ガ ロー イン 楽天 いける あんまり 自殺 和 あぁ マンガ 奴隷 殺害 アホ アリ ノー カー ニュー リア スト 伝 魔 えー 殺人 ワン 連れ 獣 帯 たら けど じゃ より たち もん なん って けれど など ほど まで だけ しか ばかり くらい ぐらい さえ こそ ながら つつ".split())
GODAN = dict(zip("うくぐすつぬぶむる", "いきぎしちにびみり"))
STEMS = set()
for src in [w["w"] for w in words if w["t"] == "verb"] + [k for k, v in jm.items() if any(p.startswith(("v1", "v5")) for e in v for p in e["pos"])][:0]:
    STEMS.add(src[:-1]); STEMS.add(src[:-1] + GODAN.get(src[-1], ""))
for lemma0 in list(cand):
    for e in jm.get(lemma0, []):
        if any(p.startswith("v1") for p in e["pos"]): STEMS.add(lemma0[:-1])
        if any(p.startswith("v5") for p in e["pos"]) and lemma0[-1] in GODAN: STEMS.add(lemma0[:-1] + GODAN[lemma0[-1]])
NSFW = r"(?i)\b(porn|erotic|sexual|sex\b|penis|vagina|naked|nude|horny|fuck|drug|breast|underwear|panties)"

new = []
for lemma, fr in sorted(cand.items(), key=lambda x: -x[1]):
    if lemma in have: continue
    pos1, kana, ud = info[lemma]
    if lemma in SKIP: continue
    e = best_entry(lemma, kana, ud)
    if not e or not e["senses"] or BAD & set(e["misc"]): continue
    if e["pos"] and e["pos"][0] in ("suf", "pref", "ctr", "aux", "aux-v", "aux-adj", "prt", "cop"): continue
    if re.fullmatch(r"[ぁ-ゖー]{1,2}", lemma) and "uk" not in e["misc"] and not any(p in ("int", "adv", "conj") for p in e["pos"]): continue
    ud_read = hira(kana)
    if not re.fullmatch(r"[ァ-ヶー]+", lemma) and ud_read and ud_read not in [hira(r) for r in e["r"]]:
        continue                                   # dictionary entry doesn't match how the word is read here
    if pos1 == "名詞" and lemma in STEMS: continue     # verb stem picked up as a noun (出し, 上げ…)
    if re.search(NSFW, " ".join(sum(e["senses"], []))): continue
    reading = lemma if re.fullmatch(r"[ァ-ヶー]+", lemma) else (ud_read or e["r"][0])
    if e["r"] and hira(reading) not in [hira(r) for r in e["r"]]: reading = e["r"][0]
    if reading in have and lemma != reading: continue
    gl = "; ".join(", ".join(g[:2]) for g in e["senses"][:2])
    gl = re.sub(r"\s*\(.*?\)", "", gl)[:60].strip("; ,")
    new.append({"w": lemma, "r": reading, "ro": romaji(reading), "t": wtype(e["pos"], pos1), "m": gl,
                "z": round(math.log10(fr * 1e9), 2), "b": "wordfreq + JMdict", "h": "", "s": "", "sr": "", "st": "", "p": "", "k": ""})
    have.add(lemma); have.add(reading)
    if len(new) >= NEW: break
print(len(new), "new words", file=sys.stderr)

# ---------- 3. ranks: top 100 spoken first, then everything by frequency ----------
start = max(w["n"] for w in words) + 1
for i, w in enumerate(new): w["n"] = start + i
allw = words + new
top = [w for w in allw if w["n"] <= 100]
rest = sorted([w for w in allw if w["n"] > 100], key=lambda w: -w["z"])
for i, w in enumerate(top + rest): w["rank"] = i + 1
rank_of = {}
for w in allw:
    rank_of.setdefault(w["w"], w["rank"]); rank_of.setdefault(w["r"], w["rank"])

# ---------- 4. Tatoeba sentences ----------
print("reading Tatoeba…", file=sys.stderr)
eng = {}
for line in open(DATA / "eng_sentences.tsv", encoding="utf-8"):
    i, _, t = line.rstrip("\n").split("\t", 2); eng[i] = t
hin = {}
for line in open(DATA / "hin_sentences.tsv", encoding="utf-8"):
    i, _, t = line.rstrip("\n").split("\t", 2); hin[i] = t
j2e = {}
for line in open(DATA / "jpn-eng_links.tsv"):
    a, b = line.split()
    if b in eng and a not in j2e: j2e[a] = eng[b]
j2h = {}
for line in open(DATA / "jpn-hin_links.tsv"):
    a, b = line.split()
    if b in hin: j2h[a] = hin[b]

def wfr(lem): return wordfreq.zipf_frequency(lem, "ja")
sents = []
lemma_count, kana_count = collections.Counter(), collections.Counter()
for line in open(DATA / "jpn_sentences.tsv", encoding="utf-8"):
    i, _, s = line.rstrip("\n").split("\t", 2)
    if i not in j2e or not (5 <= len(s) <= 24) or re.search(r"[A-Za-z0-9「」『』（）()…・]", s): continue
    ms = tag(s)
    content = [m for m in ms if m.feature.pos1 in KEEP]
    if not content: continue
    lem = [(m.feature.orthBase or m.feature.lemma or m.surface) for m in content]
    ranks = [rank_of.get(l, 9999) for l in lem]
    hard = max(ranks)
    ro_parts = []
    for m in ms:
        f = m.feature
        if f.pos1 == "補助記号": continue
        if f.pos1 == "助詞" and m.surface in ("は", "へ", "を") and f.pos2 != "接続助詞": ro_parts.append({"は": "wa", "へ": "e", "を": "o"}[m.surface]); continue
        r = "わたし" if m.surface == "私" else (f.kana or m.surface)
        glue = f.pos1 == "助動詞" or f.pos1 == "接尾辞" or (f.pos2 == "接続助詞" and m.surface in ("て", "で", "ちゃ", "ば")) or m.surface == "ん" or (ro_parts and ro_parts[-1].endswith(("ッ", "っ")))
        if glue and ro_parts and not ro_parts[-1].isascii(): ro_parts[-1] += r
        else: ro_parts.append(r)
    for m in content: lemma_count[m.feature.orthBase or m.feature.lemma or m.surface] += 1; kana_count[hira(m.feature.kanaBase or "")] += 1
    sents.append({"id": i, "jp": s, "ro": " ".join(p if p.isascii() else romaji(p) for p in ro_parts), "en": j2e[i], "hi": j2h.get(i, ""), "lem": lem, "hard": hard,
                  "avgz": round(sum(wfr(l) for l in lem) / len(lem), 2)})
print(len(sents), "candidate sentences", file=sys.stderr)

# ---------- 5. how often each word is used in everyday sentences (per million words) ----------
total = sum(lemma_count.values())
for w in allw:
    kana_only = re.fullmatch(r"[ぁ-ゖー]+", w["w"]) is not None
    c = max(lemma_count.get(w["w"], 0), kana_count.get(hira(w["r"]), 0) if kana_only else 0)
    w["pm"] = round(c / total * 1e6, 1)
top = [w for w in allw if w["n"] <= 100]
rest = sorted([w for w in allw if w["n"] > 100], key=lambda w: (-w["pm"], -w["z"]))
for i, w in enumerate(top + rest): w["rank"] = i + 1
print("ranked by conversational frequency; corpus tokens:", total, file=sys.stderr)

# example sentence for every word that has none: easiest + shortest sentence containing it
by_lem = collections.defaultdict(list)
for s in sents:
    for l in set(s["lem"]): by_lem[l].append(s)
filled = 0
for w in allw:
    if w.get("s"): continue
    c = by_lem.get(w["w"]) or by_lem.get(w["r"])
    if not c: continue
    c2 = [s for s in c if len(s["jp"]) >= 7] or c
    s = min(c2, key=lambda s: (s["hard"], len(s["jp"])))
    w["s"], w["sr"], w["st"] = s["jp"], s["ro"], s["en"]; filled += 1
print(filled, "words got a sentence", file=sys.stderr)

# sentence bank: easiest sentences first (built only from the most common words)
bank, seen = [], set()
ROUGH = re.compile(r"(ねえ|っつ|てめえ|くそ|クソ|やがれ|ぞ！|だろうが)")
buckets = [(0, 100, 600), (100, 300, 700), (300, 600, 700), (600, 1000, 600), (1000, 2000, 600)]   # (from, to, how many)
for lo, hi, cap in buckets:
    got = 0
    for s in sorted([x for x in sents if lo < x["hard"] <= hi], key=lambda s: (-s["avgz"], len(s["jp"]))):
        if s["jp"] in seen or ROUGH.search(s["jp"]) or len(s["jp"]) < 6: continue
        seen.add(s["jp"]); bank.append({"jp": s["jp"], "ro": s["ro"], "en": s["en"], "hi": s["hi"], "lvl": s["hard"], "z": s["avgz"]}); got += 1
        if got >= cap: break
print(len(bank), "sentences in bank", file=sys.stderr)

core["words"] = allw
json.dump(core, open(core_p, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
json.dump(bank, open(ROOT / "web/src/packs/ja/data/sentences.json", "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
with open(ROOT / "scripts/new_words.tsv", "w", encoding="utf-8") as f:
    for w in new: f.write(f"{w['n']}\t{w['w']}\t{w['r']}\t{w['t']}\t{w['m']}\n")
