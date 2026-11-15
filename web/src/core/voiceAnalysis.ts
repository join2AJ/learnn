import { bandProfile, expectedDuration, pitchTrack, synthWord, trimSilence } from "./dsp";
import { saveRec } from "./recStore";
import { bumpDay, updateProgress, VoiceRec } from "./store";
import { childMode } from "./child";

const refCache = new Map<string, [number, number, number]>();
async function refBandsFor(roma: string) {
  if (!refCache.has(roma)) { const b = await synthWord(roma || "a"); refCache.set(roma, bandProfile(b.getChannelData(0), b.sampleRate).bands); }
  return refCache.get(roma)!;
}

/** Analyse a recording, add it to the voice log and save its audio (same as the record & compare sheet). */
export async function analyzeAndSave(text: string, roma: string, data: Float32Array, sr: number, extra: { match?: number; heard?: string } = {}): Promise<VoiceRec | null> {
  const cut = trimSilence(data, sr);
  if (!cut || cut.length < sr * 0.15) return null;
  const ref = await refBandsFor(roma);
  const { bands, db } = bandProfile(cut, sr);
  const { contour, range } = pitchTrack(cut, sr);
  const dur = cut.length / sr, exp = expectedDuration(roma);
  const bandDiff = bands.reduce((a, b, i) => a + Math.abs(b - ref[i]), 0);
  const loud = db < -32 ? 0.6 : db < -26 ? 0.85 : 1;
  const pace = Math.min(dur, exp) / Math.max(dur, exp);
  const score = Math.round(Math.max(0, Math.min(1, (1 - bandDiff * 1.6) * 0.55 + loud * 0.25 + pace * 0.2)) * 100);
  const rec: VoiceRec = { t: Date.now(), w: text, bands, ref, db, dur, exp, f0: range, score, ...extra };
  updateProgress((p) => { p.voiceLog = [...(p.voiceLog || []), rec].slice(-300); bumpDay(p, (d) => { d.spoke = (d.spoke || 0) + 1; }); });
  if (!childMode()) await saveRec(rec.t, text, cut, sr, contour);
  return rec;
}
