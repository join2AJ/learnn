"""Composes a 1080x1920 promo video from app screenshots (vertical, for Reels/Shorts/WhatsApp Status)."""
import subprocess, math, sys
from PIL import Image, ImageDraw, ImageFont, ImageFilter
W, H, FPS = 1080, 1920, 30
INTER = "/usr/share/fonts/opentype/inter/Inter-%s.otf"
JP = "/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc"
f = lambda w, s: ImageFont.truetype(INTER % w, s)
fj = lambda s: ImageFont.truetype(JP, s)
BG1, BG2, SHU = (18, 20, 28), (40, 22, 30), (255, 99, 71)

def bg():
    im = Image.new("RGB", (W, H), BG1); d = ImageDraw.Draw(im)
    for y in range(H):
        t = y / H; d.line([(0, y), (W, y)], fill=tuple(int(BG1[i] * (1 - t) + BG2[i] * t) for i in range(3)))
    glow = Image.new("RGB", (W, H), (0, 0, 0)); ImageDraw.Draw(glow).ellipse((-300, 1100, 900, 2300), fill=(120, 40, 40))
    return Image.blend(im, glow.filter(ImageFilter.GaussianBlur(220)), 0.35)
BG = bg()

import os
from functools import lru_cache
@lru_cache(maxsize=80)
def load(p): return Image.open(p).convert("RGB")
def phone(shot, scroll):
    """Screenshot inside a rounded phone frame; scroll = 0..1 picks a frame from the scrolled capture."""
    sw, sh = 780, 1688  # 390x844 @2x
    d = shot[:-4]
    if os.path.isdir(d):
        fr_ = sorted(os.listdir(d)); view = load(os.path.join(d, fr_[round(scroll * (len(fr_) - 1))]))
    else: view = load(shot)
    view = view.crop((0, 0, sw, sh))
    fr = Image.new("RGBA", (sw + 36, sh + 36), (0, 0, 0, 0))
    ImageDraw.Draw(fr).rounded_rectangle((0, 0, sw + 35, sh + 35), 80, fill=(8, 8, 10, 255), outline=(70, 70, 80, 255), width=3)
    m = Image.new("L", (sw, sh), 0); ImageDraw.Draw(m).rounded_rectangle((0, 0, sw - 1, sh - 1), 64, fill=255)
    fr.paste(view, (18, 18), m)
    return fr

def ease(t): return 0.5 - 0.5 * math.cos(math.pi * min(1, max(0, t)))

def caption(d, title, sub, jp, a):
    c = lambda col: tuple(int(col[i] * a + BG1[i] * (1 - a)) for i in range(3))
    y = 110
    if jp: d.text((W // 2, y), jp, font=fj(54), fill=c(SHU), anchor="mm"); y += 80
    d.text((W // 2, y), title, font=f("Bold", 66), fill=c((255, 255, 255)), anchor="mm")
    d.text((W // 2, y + 76), sub, font=f("Medium", 38), fill=c((200, 200, 210)), anchor="mm")

SCENES = [  # shot, title, subtitle, jp, seconds
    ("home", "Learn Japanese, step by step", "A daily path made for beginners", "毎日少しずつ", 3.6),
    ("kana", "Hiragana & Katakana", "Hear every sound · stroke-order writing", "ひらがな・カタカナ", 3.6),
    ("learn", "2,000 words + grammar", "In spoken-frequency order, English & Hindi", "単語と文法", 3.6),
    ("cards", "Smart flashcards", "Spaced repetition remembers for you", "フラッシュカード", 3.2),
    ("speak", "Speak and get feedback", "Record your voice, compare with native", "話してみよう", 3.4),
    ("lab", "See your pronunciation", "Spectrogram, pitch & vowel map", "発音ラボ", 3.4),
    ("map", "Play the map of Japan", "Find all 47 prefectures", "日本地図", 3.2),
    ("geo", "See what Japan looks like", "Seas, mountains, islands & sights", "風景", 3.0),
    ("famous", "Famous places & culture", "Attractions with photos, etiquette tips", "名所と文化", 3.8),
    ("me", "Badges, streaks & progress", "Recordings and writing saved on your phone", "がんばって！", 3.4),
]

def title_card(d, a, big="Nihongo Path", jp="日本語の道", sub="Learn Japanese · free · offline", sub2="English + Hindi · no ads · no account"):
    c = lambda col: tuple(int(col[i] * a + BG1[i] * (1 - a)) for i in range(3))
    d.rounded_rectangle((W // 2 - 110, 560, W // 2 + 110, 780), 56, fill=c(SHU))
    d.text((W // 2, 668), "道", font=fj(150), fill=c((255, 255, 255)), anchor="mm")
    d.text((W // 2, 900), big, font=f("Bold", 100), fill=c((255, 255, 255)), anchor="mm")
    d.text((W // 2, 1010), jp, font=fj(64), fill=c(SHU), anchor="mm")
    d.text((W // 2, 1130), sub, font=f("Medium", 44), fill=c((220, 220, 230)), anchor="mm")
    d.text((W // 2, 1200), sub2, font=f("Regular", 36), fill=c((170, 170, 185)), anchor="mm")

ff = subprocess.Popen(["ffmpeg", "-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-",
                       "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "20", "-preset", "medium", "-movflags", "+faststart", sys.argv[1]], stdin=subprocess.PIPE)
emit = lambda im: ff.stdin.write(im.tobytes())

for i in range(int(2.6 * FPS)):  # intro
    im = BG.copy(); title_card(ImageDraw.Draw(im), ease(i / 18)); emit(im)
for shot, t, s, jp, sec in SCENES:
    n = int(sec * FPS); tall = os.path.isdir(shot)
    for i in range(n):
        tt = i / n; a = ease(i / 10) * ease((n - i) / 8)
        im = BG.copy()
        p = phone(shot + ".png", ease((tt - 0.15) / 0.8) if tall else 0)
        scale = 0.80 + 0.02 * tt
        p = p.resize((int(p.width * scale), int(p.height * scale)))
        slide = int((1 - ease(i / 10)) * 80)
        im.paste(p, ((W - p.width) // 2, 330 + slide), p)
        caption(ImageDraw.Draw(im), t, s, jp, a); emit(im)
for i in range(int(3.4 * FPS)):  # outro
    im = BG.copy(); title_card(ImageDraw.Draw(im), ease(i / 18), sub="Start your Japanese journey today", sub2="Free on Android"); emit(im)
ff.stdin.close(); ff.wait(); print("done")
