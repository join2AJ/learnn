"""Builds the French word list (2,000 most-spoken lemmas) and the sentence bank.

Sources (all open):
  - wordfreq (code MIT, data CC BY-SA 4.0): spoken/written frequency of French surface forms
  - simplemma (MIT): lemmatisation (mangeons -> manger)
  - English Wiktionary via kaikki.org / wiktextract (CC BY-SA 4.0): meaning, part of speech, gender, IPA
  - Tatoeba (CC BY 2.0 FR): example sentences with English translations

Usage: python build_words_fr.py <data dir with fr_dict.jsonl, fra_sentences.tsv, fra-eng_links.tsv> <eng_sentences.tsv>
Writes web/src/packs/fr/data/core.json, sentences.json and scripts/fr/hindi_todo.tsv
"""
import json, re, sys, pathlib, collections, unicodedata
import wordfreq, simplemma

ROOT = pathlib.Path(__file__).resolve().parents[2]
D = pathlib.Path(sys.argv[1]); ENG = pathlib.Path(sys.argv[2])
OUT = ROOT / "web/src/packs/fr/data"; OUT.mkdir(parents=True, exist_ok=True)

ELISION = {"l": "le", "d": "de", "j": "je", "qu": "que", "n": "ne", "s": "se", "c": "ce", "m": "me", "t": "te", "jusqu": "jusque", "lorsqu": "lorsque", "puisqu": "puisque"}
FIX = {"au": "à", "aux": "à", "du": "de", "des": "un", "les": "le", "la": "le", "une": "un", "l'": "le", "été": "être", "ai": "avoir", "as": "avoir", "est": "être"}
SKIP = set("ok oh ah hein euh hé bah ouais mdr lol etc".split())
lem = lambda w: simplemma.lemmatize(w, lang="fr")

def norm_token(t):
    t = t.lower().strip("'’-")
    if t in ELISION: return ELISION[t]
    return t

# ---------- 1. frequency by lemma ----------
freq = collections.Counter()
for w in wordfreq.top_n_list("fr", 40000):
    if not re.fullmatch(r"[a-zàâäçéèêëîïôöûùüÿœæ'’-]+", w) or w in SKIP: continue
    t = norm_token(w)
    l = FIX.get(t) or lem(t)
    freq[l] += wordfreq.word_frequency(w, "fr")
    # "le" also covers la/les; "un" covers une
for k in ("la", "les"): freq["le"] += 0
lemmas = [l for l, _ in freq.most_common(6000)]

# ---------- 2. dictionary ----------
POS_OK = {"noun": "noun", "verb": "verb", "adj": "adj", "adv": "adv", "pron": "pron", "prep": "prep", "conj": "conj",
          "det": "det", "article": "det", "intj": "interj", "num": "num", "particle": "particle", "contraction": "det", "phrase": "expr"}
dic = collections.defaultdict(list)
for line in open(D / "fr_dict.jsonl", encoding="utf-8"):
    e = json.loads(line)
    if e["pos"] in POS_OK: dic[e["w"]].append(e)

def clean_gloss(g):
    g = re.sub(r"\([^)]*\)", "", g)            # drop (transitive) etc.
    g = re.split(r";|:", g)[0].strip(" ,.")
    return g[:48]

def entry(l):
    cands = [e for e in dic.get(l, []) if any(not g.startswith("@form") for g in e["g"])]
    if not cands: return None
    # prefer the part of speech that matches how common the word is used
    order = ["article", "det", "pron", "prep", "verb", "adv", "adj", "conj", "num", "intj", "noun", "particle", "contraction", "phrase"]
    real = lambda e: sum(1 for g in e["g"] if not g.startswith("@form"))
    cands.sort(key=lambda e: (-real(e), order.index(e["pos"]) if e["pos"] in order else 99))
    if l in ("être", "avoir", "faire", "aller", "pouvoir", "vouloir", "devoir", "savoir", "dire", "voir", "venir", "prendre"):
        cands.sort(key=lambda e: e["pos"] != "verb")
    e = cands[0]
    if l in POS: e = next((x for x in cands if POS_OK[x["pos"]] == POS[l]), e)
    glosses = [clean_gloss(g) for g in e["g"] if not g.startswith("@form")]
    glosses = [g for g in glosses if g]
    if not glosses: return None
    parts = []
    for g in glosses[:2]:
        for x in g.split(", "):
            if x and x.lower() not in [y.lower() for y in parts]: parts.append(x)
    m = ", ".join(parts[:3]) if len(glosses[0]) <= 22 else glosses[0]
    if l in MEAN: m = MEAN[l]
    ipa = e["ipa"].strip("/[]")
    gen = e["gen"][:1] if e["pos"] == "noun" else ""
    return {"pos": POS_OK[e["pos"]], "m": m, "ipa": ipa, "gen": gen, "fem": e.get("fem", ""), "pl": e.get("pl", "")}

from meanings_fr import MEAN, DROP, POS, DISPLAY
# Hindi + hand corrections: lemma \t hindi ("-" = drop) [\t english] [\t display] [\t pos]
HI = {}
for f in sorted(pathlib.Path(__file__).parent.glob("hindi_fr_*.tsv")):
    for line in open(f, encoding="utf-8"):
        c = line.rstrip("\n").split("\t")
        if len(c) < 2 or not c[0]: continue
        if c[1].strip() == "-": DROP.add(c[0]); continue
        HI[c[0]] = c
VOWEL = "aâàeéèêëiîïoôuûùüyœæ"
H_ASPIRE = set("héros haut hauteur honte hasard hache haine hall hareng haricot hibou hockey homard hors housse hamburger handicap hangar hausse hâte hérisson huit hurler hutte hameau hanche harpe hasard hausser hennir hiérarchie hongrie hollande hublot huée".split())
def display(l, e):
    if l in DISPLAY: return DISPLAY[l]
    if e["pos"] != "noun" or not e["gen"]: return l
    if l[0] in VOWEL or (l[0] == "h" and l not in H_ASPIRE): return "l'" + l
    return ("le " if e["gen"] == "m" else "la ") + l

words = []
seen = set()
for l in lemmas:
    if len(words) >= 2000: break
    if l in MEAN and l in DROP: continue
    if l in seen or len(l) < 1 or (len(l) == 1 and l not in ("à", "a", "y", "ô")): continue
    if l[0].isupper(): continue
    if l in DROP: continue
    e = entry(l)
    if not e: continue
    if e["pos"] == "noun" and e["m"][:1].isupper() and " " not in e["m"]: continue   # country / proper names
    seen.add(l)
    words.append({"lemma": l, **e})

# ---------- 3. Tatoeba sentences ----------
eng = {}
for line in open(ENG, encoding="utf-8"):
    p = line.rstrip("\n").split("\t")
    if len(p) >= 3: eng[p[0]] = p[2]
fr2en = {}
for line in open(D / "fra-eng_links.tsv"):
    a, b = line.split()[:2]
    if b in eng and a not in fr2en: fr2en[a] = eng[b]
rank = {w["lemma"]: i + 1 for i, w in enumerate(words)}
TOK = re.compile(r"[a-zàâäçéèêëîïôöûùüÿœæ]+(?:['’])?", re.I)
sents = []
for line in open(D / "fra_sentences.tsv", encoding="utf-8"):
    sid, _, txt = line.rstrip("\n").split("\t")[:3]
    if sid not in fr2en or len(txt) > 70 or len(txt) < 8 or any(c.isdigit() for c in txt): continue
    toks = [norm_token(t.rstrip("'’")) for t in TOK.findall(txt)]
    if not 2 <= len(toks) <= 9: continue
    ls = [FIX.get(t) or lem(t) for t in toks]
    rs = [rank.get(x, 9999) for x in ls]
    if max(rs) > 2000: continue
    sents.append((max(rs), len(txt), txt, fr2en[sid], set(ls)))
sents.sort()
best = {}; loose = {}
use = collections.Counter()
for mx, ln, txt, en, ls in sents:
    low = " " + re.sub(r"[^a-zàâäçéèêëîïôöûùüÿœæ']+", " ", txt.lower()) + " "
    for x in ls:
        use[x] += 1
        if x in rank and len(txt) >= 10 and len(low.split()) >= 3:
            if x not in best and (" " + x + " " in low or "'" + x + " " in low): best[x] = (txt, en)
            elif x not in loose: loose[x] = (txt, en)
for x, v in loose.items(): best.setdefault(x, v)
total = sum(use.values()) or 1

# ---------- 4. topics ----------
src = (ROOT / "scripts/add_jlpt_topics.py").read_text()
a = src.index("TOPICS = {"); b = src.index("\n}\n", a) + 2
ns = {}; exec(src[a:b], ns)
TOPICS = dict(ns["TOPICS"])
TOPICS["school"] = TOPICS["school"].replace("|kanji|english|japanese", "|english|french")
TOPICS["shopping"] = TOPICS["shopping"].replace(r"|\byen\b", r"|euro")
TOPICS["food"] = TOPICS["food"].replace("|sushi|ramen", "|cheese|croissant")
RX = {t: re.compile(r"\b(?:" + rx.replace("\\b", "") + r")(?:s|es)?\b") for t, rx in TOPICS.items()}

out = []
for i, w in enumerate(words, 1):
    s, st = best.get(w["lemma"], ("", ""))
    lvl = 5 if i <= 500 else 4 if i <= 1000 else 3
    tp = [t for t, rx in RX.items() if rx.search(w["m"].lower())][:3]
    if w["pos"] in ("interj", "expr"): tp.append("phrases")
    o = HI.get(w["lemma"], [])
    get = lambda k: o[k].strip() if len(o) > k and o[k].strip() else ""
    item = {"n": i, "w": get(3) or display(w["lemma"], w), "r": w["lemma"], "ro": w["ipa"], "t": get(4) or w["pos"], "m": get(2) or w["m"], "h": get(1),
            "s": s, "sr": "", "st": st, "rank": i, "jlpt": lvl, "tp": tp,
            "z": round(wordfreq.zipf_frequency(w["lemma"], "fr"), 2), "pm": round(use[w["lemma"]] / total * 1e6)}
    if w["gen"] and item["t"] == "noun": item["k"] = ("masculine" if w["gen"] == "m" else "feminine") + (" · plural " + w["pl"] if w["pl"] and w["pl"] != w["lemma"] + "s" else "")
    if w["fem"] and w["pos"] == "adj": item["k"] = "feminine: " + w["fem"]
    out.append(item)

json.dump({"words": out, "grammar": []}, open(OUT / "core.json", "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
bank = []
seen_t = set()
for mx, ln, txt, en, ls in sents:
    if txt in seen_t: continue
    seen_t.add(txt)
    lvl = 100 if mx <= 100 else 300 if mx <= 300 else 600 if mx <= 600 else 1000 if mx <= 1000 else 2000
    bank.append({"jp": txt, "ro": "", "en": en, "hi": "", "lvl": lvl, "z": mx})
# keep a balanced bank: up to 800 per level, simplest first
per = collections.defaultdict(list)
for b_ in bank: per[b_["lvl"]].append(b_)
bank = [x for l in (100, 300, 600, 1000, 2000) for x in per[l][:800]]
json.dump(bank, open(OUT / "sentences.json", "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
with open(ROOT / "scripts/fr/hindi_todo.tsv", "w", encoding="utf-8") as f:
    for w in out:
        if not w["h"]: f.write(f"{w['n']}\t{w['w']}\t{w['t']}\t{w['m']}\n")
print("words", len(out), "with sentence", sum(1 for w in out if w["s"]), "bank", len(bank), {l: len(per[l]) for l in per})
