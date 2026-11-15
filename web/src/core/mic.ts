import { ensureMic } from "./native";
import { audioCtx } from "./dsp";
import { toast, updateProgress } from "./store";

/* ---------------- microphone helpers ---------------- */
export interface Mic { ctx: AudioContext; stream: MediaStream; src: MediaStreamAudioSourceNode; an: AnalyserNode; }
export async function openMic(): Promise<Mic | null> {
  if (!(await ensureMic())) { toast("Microphone permission is needed for the Sound Lab.", "warn"); return null; }
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } as MediaTrackConstraints });
    const ctx = audioCtx();
    const src = ctx.createMediaStreamSource(stream);
    const an = ctx.createAnalyser(); an.fftSize = 2048; an.smoothingTimeConstant = 0.2;
    src.connect(an);
    updateProgress((x) => { x.labSessions++; });
    return { ctx, stream, src, an };
  } catch (e) {
    toast("Could not open the microphone: " + (e as Error).message, "warn");
    return null;
  }
}
export const closeMic = (m: Mic | null) => { if (!m) return; m.src.disconnect(); m.stream.getTracks().forEach((t) => t.stop()); };

/** Record `sec` seconds of mono audio from a mic. */
export function record(m: Mic, sec: number): Promise<{ data: Float32Array; sr: number }> {
  return new Promise((res) => {
    const sp = m.ctx.createScriptProcessor(2048, 1, 1);
    const chunks: Float32Array[] = [];
    const total = Math.floor(m.ctx.sampleRate * sec);
    let n = 0;
    const mute = m.ctx.createGain(); mute.gain.value = 0;
    sp.onaudioprocess = (e) => {
      const d = e.inputBuffer.getChannelData(0); chunks.push(new Float32Array(d)); n += d.length;
      if (n >= total) {
        sp.disconnect(); m.src.disconnect(sp); mute.disconnect();
        const out = new Float32Array(n); let o = 0; chunks.forEach((c) => { out.set(c, o); o += c.length; });
        res({ data: out, sr: m.ctx.sampleRate });
      }
    };
    m.src.connect(sp); sp.connect(mute); mute.connect(m.ctx.destination);
  });
}
export const toBuffer = (d: Float32Array, sr: number) => { const b = audioCtx().createBuffer(1, d.length, sr); b.getChannelData(0).set(d); return b; };

