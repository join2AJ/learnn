import hashlib, urllib.parse, urllib.request, time, sys, io, json
from PIL import Image
UA={"User-Agent":"NihongoPath-builder/1.0 (educational Japanese learning app)"}
names={"fuji":"View_of_Mount_Fuji_from_Ōwakudani_20211202.jpg","inari":"Torii_path_with_lantern_at_Fushimi_Inari_Taisha_Shrine,_Kyoto,_Japan.jpg","kinkaku":"Golden_Pavilion_Kinkaku-ji_water_mirror_2024.jpg","shibuya":"Shibuya_Crossing,_Aerial.jpg"}
out=sys.argv[1]
for k,n in names.items():
    h=hashlib.md5(n.encode()).hexdigest(); q=urllib.parse.quote(n)
    urls=[f"https://upload.wikimedia.org/wikipedia/commons/thumb/{h[0]}/{h[:2]}/{q}/{w}px-{q}" for w in (3840, 1920)]
    import os
    if os.path.exists(f"{out}/{k}.jpg"): continue
    data=None
    for u in urls:
        ok=False
        for wait in (90,180,300):
            time.sleep(wait)
            try:
                data=urllib.request.urlopen(urllib.request.Request(u,headers=UA),timeout=120).read(); ok=True; break
            except Exception as e: print(k,"retry",getattr(e,"code",e))
        if ok: break
    if data is None: print(k,"FAILED"); continue
    im=Image.open(io.BytesIO(data)).convert("RGB"); print(k,"original",im.size)
    # scale so the height is 2600 px (enough for a 1920 px tall crop plus the slow zoom)
    if im.height<2600: print(k,"WARNING: source smaller than ideal")
    s=2600/im.height if im.height>2600 else 1
    im=im.resize((round(im.width*s),round(im.height*s)),Image.LANCZOS)
    im.save(f"{out}/{k}.jpg",quality=92); print(k,"saved",im.size)
