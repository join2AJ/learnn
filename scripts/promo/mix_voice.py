import numpy as np, wave, subprocess, sys
SR=44100
def readwav(p):
    raw=subprocess.run(["ffmpeg","-v","error","-i",p,"-f","f32le","-ac","1","-ar",str(SR),"-"],capture_output=True).stdout
    return np.frombuffer(raw,np.float32).astype(np.float64)
w=wave.open("music_v1.wav"); m=np.frombuffer(w.readframes(w.getnframes()),np.int16).reshape(-1,2).astype(np.float64)/32768
N=len(m); vo=np.zeros(N)
for i,line in enumerate(open("vo/lines.txt")):
    t=float(line.split("|")[0]); v=readwav(f"vo/l{i}.wav")
    # gentle high-pass (remove rumble) + light compression
    v=v-np.convolve(v,np.ones(200)/200,mode="same")
    v=np.tanh(v*2.2)/np.tanh(2.2)
    a=int(t*SR); vo[a:a+len(v)]+=v[:N-a]
# ducking envelope from voice activity
act=np.convolve(np.abs(vo),np.ones(2205)/2205,mode="same")>0.01
env=np.where(act,0.42,1.0)  # about -7.5 dB under the voice
# smooth: fast attack 60 ms, release 350 ms
out=np.empty(N); g=1.0; atk=np.exp(-1/(0.06*SR)); rel=np.exp(-1/(0.35*SR))
for i in range(0,N,64):
    tgt=env[i]; c=atk if tgt<g else rel
    g=tgt+(g-tgt)*c**64; out[i:i+64]=g
mix=m*out[:,None]+np.stack([vo,vo],1)*0.95
mix/=max(1e-9,np.abs(mix).max())/0.95
pcm=(mix*32767).astype(np.int16)
o=wave.open(sys.argv[1],"wb"); o.setnchannels(2); o.setsampwidth(2); o.setframerate(SR); o.writeframes(pcm.tobytes()); o.close()
print("ok")
