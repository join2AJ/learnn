"""Fetch KanjiVG stroke paths (CC BY-SA 3.0, kanjivg.tagaini.net) for kana and the
kanji used in the first N words, and write a compact JSON: {char: [pathD, ...]}."""
import json, re, sys, urllib.request, concurrent.futures as cf, pathlib
root = pathlib.Path(__file__).resolve().parent.parent
core = json.load(open(root / "web/src/packs/ja/data/core.json", encoding="utf-8"))
N = int(sys.argv[1]) if len(sys.argv) > 1 else 400
EXTRA = sys.argv[2] if len(sys.argv) > 2 else ""
chars = []
hira = "あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをんがぎぐげござじずぜぞだぢづでどばびぶべぼぱぴぷぺぽゃゅょっ"
kata = "".join(chr(ord(c) + 0x60) for c in hira) + "ー"
chars += list(hira) + list(kata)
for c in EXTRA:
    if c not in chars: chars.append(c)
for w in core["words"][:N]:
    for c in w["w"]:
        if 0x4E00 <= ord(c) <= 0x9FFF and c not in chars:
            chars.append(c)
def fetch(c):
    url = "https://raw.githubusercontent.com/KanjiVG/kanjivg/master/kanji/%05x.svg" % ord(c)
    try:
        svg = urllib.request.urlopen(url, timeout=30).read().decode("utf-8")
    except Exception as e:
        return c, None
    paths = re.findall(r'<path[^>]*\sd="([^"]+)"', svg)
    # shorten numbers to 1 decimal to save space
    paths = [re.sub(r"(\d+\.\d)\d+", r"\1", p) for p in paths]
    return c, paths
out = {}
with cf.ThreadPoolExecutor(16) as ex:
    for c, p in ex.map(fetch, chars):
        if p: out[c] = p
missing = [c for c in chars if c not in out]
json.dump(out, open(root / "web/src/packs/ja/data/strokes.json", "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
print(len(out), "chars; missing:", "".join(missing))
