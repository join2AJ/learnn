"""Adds JLPT level ("jlpt": 5..1) and topic tags ("tp": [...]) to every word in core.json.
JLPT lists: open-anki-jlpt-decks (MIT, Jamie Sinclair), based on Jonathan Waller's JLPT lists (tanos.co.uk, CC BY).
Usage: python scripts/add_jlpt_topics.py <dir with n5.csv … n1.csv>"""
import csv, json, re, sys, pathlib
ROOT = pathlib.Path(__file__).resolve().parent.parent
p = ROOT / "web/src/packs/ja/data/core.json"
core = json.load(open(p, encoding="utf-8"))
D = pathlib.Path(sys.argv[1])
lvl = {}
for n in (1, 2, 3, 4, 5):   # easier levels overwrite harder ones
    for row in csv.DictReader(open(D / f"n{n}.csv", encoding="utf-8")):
        for k in {row["expression"], row["reading"]}:
            for part in re.split(r"[;、,]", k):
                part = part.strip()
                if part: lvl[part] = n
TOPICS = {
  "food": r"eat|food|rice|meal|drink|tea\b|coffee|fish|meat|vegetable|fruit|bread|egg|sugar|salt|cook|restaurant|delicious|taste|lunch|breakfast|dinner|sushi|ramen|beer|wine|milk|apple|soup|kitchen|hungry|curry|candy|snack|beef|pork|chicken|noodle|dishes|dish",
  "people": r"family|mother|father|parent|child|son\b|daughter|brother|sister|husband|wife|grandmother|grandfather|grandchild|grandparent|baby|uncle|aunt|friend|boyfriend|girlfriend|person|people|\bman\b|woman|\bboy|\bgirl|married|marriage|marry|guest|neighbour|neighbor|everyone",
  "time": r"\btime\b|\bday|week|month|year|today|tomorrow|yesterday|morning|evening|night|noon|hour|minute|o'clock|now\b|early|late\b|season|spring|summer|autumn|winter|monday|tuesday|wednesday|thursday|friday|saturday|sunday|weekend|holiday|birthday|future|past\b|soon|always|sometimes",
  "numbers": r"\bone\b|\btwo\b|three|four|five|six|seven|eight|nine|\bten\b|hundred|thousand|million|number|count|half|double|many|few\b|several",
  "travel": r"station|train|\bbus\b|\bcar\b|airport|plane|travel|trip|road|street|\bmap\b|hotel|ticket|\bleft\b|north|south|east|west|city|country|town|village|bridge|taxi|bicycle|\bwalk|ride|tour|abroad|foreign",
  "home": r"house|home|\broom|door|window|\bbed\b|bath|toilet|table|chair|desk|clean|wash|sleep|wake|clothes|shirt|shoe|umbrella|\bkey\b|furniture|garden|live\b|daily life",
  "school": r"school|student|teacher|study|learn|class|lesson|test|exam|homework|\bbook|read|write|\bword|language|question|answer|university|college|dictionary|letter|kanji|english|japanese",
  "work": r"\bwork|\bjob\b|company|office|business|meeting|boss|employee|employer|employment|salary|profession|occupation|industry|manager|president|staff|career|factory",
  "body": r"\bbody|head\b|face\b|\beye|\bear\b|nose|mouth|tooth|teeth|hand\b|foot|feet|\bleg\b|\barm\b|hair|heart|blood|bone|skin|sick|sickness|illness|illness|hospital|doctor|medicine|pain|hurt|health|fever|tired|injury|injured|nurse",
  "nature": r"weather|rain|snow|wind|cloud|\bsun\b|moon|\bstar\b|\bsky|\bsea\b|ocean|river|mountain|tree|flower|forest|animal|\bdog|\bcat\b|bird|\bhot\b|\bcold\b|warm|cool\b|typhoon|earthquake|nature|plant|fire\b|cherry|insect|horse|\bcow",
  "feelings": r"happy|\bsad|angry|\blove|dislike|disliked|fear|afraid|scary|scared|lonely|glad|worry|worried|anxiety|anxious|feeling|emotion|surprise|surprised|gentle|\bfun\b|enjoy|interesting|boring|nervous|embarrassed|embarrassing|\bhope|regret|thank|sorry",
  "shopping": r"\bbuy|sell|\bshop|store|money|\byen\b|price|expensive|cheap|\bpay|cost|market|\bbag\b|gift|sale\b|purchase|wallet",
  "media": r"computer|internet|phone|mail|video|movie|film|music|\bsong|game|anime|manga|news|camera|photo|\bapp\b|website|online|program|data|radio|television|\btv\b|channel|broadcast",
  "describe": r"\bred\b|\bblue\b|white|black|yellow|green|colou?r|\bbig\b|large|small|little|long\b|short|\bnew\b|\bold\b|high|\blow\b|beautiful|pretty|ugly|fast|slow|heavy|bright|dark|strong|weak|easy|difficult|good|bad\b|same|different",
}
# every keyword must start at a word boundary ("eat" must not match "heat")
RX = {t: re.compile(r"\b(?:" + rx.replace("\\b", "") + r")(?:s|es)?\b") for t, rx in TOPICS.items()}
from collections import Counter
cnt = Counter(); tagged = 0
for w in core["words"]:
    n = lvl.get(w["w"]) or lvl.get(w["r"])
    if n: w["jlpt"] = n; tagged += 1
    else: w.pop("jlpt", None)
    m = w["m"].lower()
    tp = [t for t, rx in RX.items() if rx.search(m)]
    if w["t"] in ("interj", "expr"): tp.append("phrases")
    w["tp"] = tp[:3]
    cnt.update(w["tp"])
json.dump(core, open(p, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
print("JLPT tagged:", tagged, "of", len(core["words"]), Counter(w.get("jlpt") for w in core["words"]))
print("topics:", dict(cnt))
