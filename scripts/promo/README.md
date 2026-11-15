# Promo video

1. `cd web && npx vite build && npx vite preview --port 4173`
2. `node scripts/promo/capture_screens.js scripts/promo/a` - app screenshots (then copy 6 photos from `web/public/photos` into `a/`)
3. `node scripts/promo/frames.js frames 30` - renders `video.html` frame by frame (1080×1920)
4. `python3 scripts/promo/music.py music.wav` - original soundtrack (synthesised, no third-party audio)
5. `ffmpeg -framerate 30 -i frames/%05d.jpg -i music.wav -c:v libx264 -pix_fmt yuv420p -crf 18 -c:a aac -b:a 192k -shortest promo.mp4`
