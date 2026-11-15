import { useMemo } from "react";
import { Share2 } from "lucide-react";
import { useProgress, useSettings } from "../core/store";
import { levelOf } from "../core/rewards";
import { contentStats } from "../core/contentStats";
import { usePack } from "../pack";
import { SUPPORT } from "../support";
import { Header, tap } from "../ui/kit";
import { appCard, levelCard, shareCard } from "../ui/shareCard";

export const inviteText = (name?: string) =>
  `${name ? name + " invites you" : "Join me"} to learn Japanese with Nihongo Path 🇯🇵\n\n` +
  "✨ All hiragana & katakana with sound and stroke order\n🎙️ Speak and see your own voice\n📚 2,000 most-spoken words, explained in English & हिन्दी\n🗾 Map of Japan, culture and famous places\n\nFree · offline · no ads. がんばって！" +
  (SUPPORT.shareUrl ? "\n\n" + SUPPORT.shareUrl : "");

/** Share the app or your level as a picture. */
export default function Share() {
  const pk = usePack();
  const p = useProgress();
  const s = useSettings();
  const c = useMemo(() => contentStats(pk), [pk]);
  const lv = levelOf(p.xp);
  const lvName = [...pk.levels].reverse().find((l) => lv.level >= l.min) || pk.levels[0];
  const app = useMemo(() => appCard(c.words, c.sentences + c.sentenceBank), [c]);
  const mine = useMemo(() => levelCard(p, s, lvName, pk.words.length), [p.xp, p.streak.count, p.known.length, s.name]); // eslint-disable-line
  return (
    <div className="screen">
      <Header title="Share" sub="Invite friends · show your progress" backTo="/me" />
      <div className="card" style={{ padding: 12 }}>
        <img src={app} alt="Nihongo Path invite card" style={{ width: "100%", borderRadius: 16, display: "block" }} />
        <div className="sm mt12" style={{ whiteSpace: "pre-line", lineHeight: 1.5 }}>{inviteText(s.name)}</div>
        <button className="btn primary block mt12" onClick={() => { tap(); shareCard(app, "nihongo-path.jpg", inviteText(s.name)); }}><Share2 size={17} /> Share the app</button>
      </div>
      <div className="section-title"><h2>Your level card</h2></div>
      <div className="card" style={{ padding: 12 }}>
        <img src={mine} alt="Your level card" style={{ width: "100%", borderRadius: 16, display: "block" }} />
        <button className="btn block mt12" onClick={() => { tap(); shareCard(mine, "my-japanese-level.jpg", `I’m level ${lv.level} (${lvName.en}) in Japanese on Nihongo Path - ${p.xp.toLocaleString()} XP and a ${p.streak.count}-day streak! 🇯🇵 Learn with me - it’s free.` + (SUPPORT.shareUrl ? " " + SUPPORT.shareUrl : "")); }}><Share2 size={17} /> Share my level (JPG)</button>
      </div>
    </div>
  );
}
