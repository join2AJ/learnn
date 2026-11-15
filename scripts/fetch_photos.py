"""Downloads the lead Wikipedia photo of each attraction, keeps only openly licensed ones,
resizes to WebP and writes credits to web/src/packs/ja/data/photos.json.
Polite: one request every ~1.5 s, descriptive User-Agent."""
import json, re, time, io, urllib.request, urllib.parse, pathlib, sys
from PIL import Image
ROOT = pathlib.Path(__file__).resolve().parent.parent
UA = {"User-Agent": "NihongoPath-builder/1.0 (educational Japanese learning app)"}
src = (ROOT / "web/src/packs/ja/attractions.ts").read_text(encoding="utf-8")
items = re.findall(r'id: "([^"]+)", wiki: "([^"]+)"', src)
import urllib.error
def get(url, binary=False):
    for wait in (4, 15, 40, 90):
        time.sleep(wait)
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=40) as r:
                b = r.read(); return b if binary else b.decode("utf-8", "replace")
        except urllib.error.HTTPError as e:
            if e.code != 429: raise
    raise RuntimeError("rate limited")
OK = re.compile(r"(cc-by|cc-zero|cc0|pd-|public domain)", re.I)
out = json.load(open(ROOT / "web/src/packs/ja/data/photos.json")) if (ROOT / "web/src/packs/ja/data/photos.json").exists() else {}
for sid, wiki in items:
    if sid in out: continue
    try:
        s = json.loads(get("https://en.wikipedia.org/api/rest_v1/page/summary/" + urllib.parse.quote(wiki)))
        img = (s.get("originalimage") or {}).get("source") or (s.get("thumbnail") or {}).get("source")
        if not img: print("no image", sid); continue
        fname = urllib.parse.unquote(re.search(r"/commons/(?:thumb/)?\w/\w\w/([^/?]+)", img).group(1))
        raw = get("https://commons.wikimedia.org/wiki/File:" + urllib.parse.quote(fname.replace(" ", "_")) + "?action=raw")
        lic = re.findall(r"(?<![\w-])(cc-by(?:-sa)?-[\d.]+(?:-[a-z]{2})?|cc-zero|cc0|pd-[\w-]+)", raw, re.I)
        if not lic or not OK.search(lic[0]): print("skip licence", sid, lic[:1]); continue
        am = re.search(r"\|\s*[Aa]uthor\s*=\s*(.+)", raw)
        author = re.sub(r"\[\[(?:[^|\]]*\|)?([^\]]+)\]\]", r"\1", am.group(1) if am else "Unknown")
        author = re.sub(r"\[https?://\S+ ([^\]]+)\]", r"\1", author)
        author = re.sub(r"\{\{[^}]*\}\}|<[^>]+>|''", "", author).strip()[:80] or "Wikimedia Commons contributor"
        base = "https://upload.wikimedia.org/wikipedia/commons/thumb/"
        h = re.search(r"/commons/(?:thumb/)?(\w/\w\w)/", img).group(1)
        thumb = base + h + "/" + urllib.parse.quote(fname) + "/960px-" + urllib.parse.quote(fname)
        if fname.lower().endswith(".svg"): print("svg skip", sid); continue
        data = get(thumb, binary=True)
        im = Image.open(io.BytesIO(data)).convert("RGB")
        im.thumbnail((640, 480))
        im.save(ROOT / "web/public/photos" / (sid + ".webp"), "WEBP", quality=68)
        out[sid] = {"file": "photos/" + sid + ".webp", "author": author, "license": lic[0].strip().upper(), "source": "https://commons.wikimedia.org/wiki/File:" + fname.replace(" ", "_")}
        print("ok", sid, lic[0], author[:40])
    except Exception as e:
        print("fail", sid, e)
json.dump(out, open(ROOT / "web/src/packs/ja/data/photos.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print(len(out), "photos")
