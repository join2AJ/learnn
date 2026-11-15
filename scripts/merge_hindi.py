"""Fill in Hindi meanings for words that don't have one, from scripts/hindi_new.txt (word=hindi)."""
import json, pathlib
ROOT = pathlib.Path(__file__).resolve().parent.parent
p = ROOT / "web/src/packs/ja/data/core.json"
core = json.load(open(p, encoding="utf-8"))
hm = dict(l.split("=", 1) for l in open(ROOT / "scripts/hindi_new.txt", encoding="utf-8").read().splitlines() if "=" in l)
missing = []
for w in core["words"]:
    if not w.get("h"):
        if w["w"] in hm: w["h"] = hm[w["w"]]
        else: missing.append(w["w"])
json.dump(core, open(p, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
print("missing Hindi:", len(missing), " ".join(missing))
