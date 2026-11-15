# Promo video

1. `cd web && npx vite build && npx vite preview --port 4173`
2. `node scripts/promo/capture_screens.js scripts/promo/a` - app screenshots (then copy 6 photos from `web/public/photos` into `a/`)
3. `node scripts/promo/frames.js frames 30` - renders `video.html` frame by frame (1080×1920)
4. `python3 scripts/promo/music.py music.wav` - original soundtrack (synthesised, no third-party audio)
5. `ffmpeg -framerate 30 -i frames/%05d.jpg -i music.wav -c:v libx264 -pix_fmt yuv420p -crf 18 -c:a aac -b:a 192k -shortest promo.mp4`
6. Voice-over: `echo "<line>" | piper -m en_US-ljspeech-high.onnx --length-scale 0.95 -f vo/lN.wav` for each line in `voiceover.txt` (Piper TTS, LJSpeech voice - public-domain dataset), then `python3 mix_voice.py vo/mix.wav` (music ducks ~7.5 dB under the voice) and encode with `-af loudnorm=I=-14:TP=-1`.
