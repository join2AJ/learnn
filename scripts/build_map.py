import json, math, sys
d = json.load(open(sys.argv[1]))
W = 360
lat0 = 36
def proj(lon, lat):
    return (lon * math.cos(math.radians(lat0)), -lat)
# bounds excluding Okinawa
pts = []
for f in d["features"]:
    if f["properties"]["id"] == 47: continue
    g = f["geometry"]; polys = g["coordinates"] if g["type"] == "MultiPolygon" else [g["coordinates"]]
    for poly in polys:
        for ring in poly: pts += [proj(*p) for p in ring]
minx = min(p[0] for p in pts); maxx = max(p[0] for p in pts); miny = min(p[1] for p in pts); maxy = max(p[1] for p in pts)
sc = W / (maxx - minx); H = (maxy - miny) * sc
out = {}
for f in d["features"]:
    pid = f["properties"]["id"]; g = f["geometry"]
    polys = g["coordinates"] if g["type"] == "MultiPolygon" else [g["coordinates"]]
    # Okinawa: inset in the top-left box
    if pid == 47:
        polys = [poly for poly in polys if max(p[0] for p in poly[0]) > 126.5]   # main Okinawa islands only
        opts = [proj(*p) for poly in polys for ring in poly for p in ring]
        ox0 = min(p[0] for p in opts); oy0 = min(p[1] for p in opts)
        ox1 = max(p[0] for p in opts); oy1 = max(p[1] for p in opts)
        osc = min(76 / (ox1 - ox0), 46 / (oy1 - oy0))   # fill the inset box (x 10-86, y 24-70)
        tf = lambda x, y: (10 + (x - ox0) * osc, 24 + (y - oy0) * osc)
    else:
        tf = lambda x, y: ((x - minx) * sc, (y - miny) * sc)
    dstr = ""
    for poly in polys:
        for ring in poly:
            xy = [tf(*proj(*p)) for p in ring]
            dstr += "M" + "L".join(f"{x:.1f},{y:.1f}" for x, y in xy) + "Z"
    out[pid] = dstr
# label anchor = capital positions computed later in app via lon/lat projection
json.dump({"w": W, "h": round(H, 1), "minx": minx, "miny": miny, "sc": sc, "lat0": lat0, "paths": out}, open(sys.argv[2], "w"), separators=(",", ":"))
print("H", H, "bytes", len(json.dumps(out)))
