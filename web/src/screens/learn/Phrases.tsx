import { useEffect, useRef, useState } from "react";
import { Play, Square } from "lucide-react";
import { updateProgress, useProgress } from "../../core/store";
import { onSpeaking, speak, stopSpeaking } from "../../core/native";
import { usePack } from "../../pack";
import { Header } from "../../ui/kit";
import { ExampleRow } from "./Grammar";
import { Icon, IconTile } from "../../ui/icons";

export default function Phrases() {
  const pk = usePack();
  const p = useProgress();
  const [g, setG] = useState(pk.phrases[0].id);
  const [playing, setPlaying] = useState(false);
  const queue = useRef<string[]>([]);
  useEffect(() => { if (!p.roadmap.phr) updateProgress((q) => { q.roadmap.phr = true; }); }, []); // eslint-disable-line
  useEffect(() => onSpeaking((id) => {
    if (id === null && queue.current.length) {
      const nxt = queue.current.shift()!;
      window.setTimeout(() => speak(nxt, { lang: pk.ttsLang, id: "q" }), 700);
    } else if (id === null) setPlaying(false);
  }), [pk.ttsLang]);
  useEffect(() => () => { queue.current = []; stopSpeaking(); }, []);
  const group = pk.phrases.find((x) => x.id === g)!;
  const playAll = () => {
    if (playing) { queue.current = []; stopSpeaking(); setPlaying(false); return; }
    const items = group.items.map((i) => i.jp);
    queue.current = items.slice(1);
    setPlaying(true);
    speak(items[0], { lang: pk.ttsLang, id: "q" });
  };
  return (
    <div className="screen">
      <Header title="Survival phrases" sub="Say each one out loud 3 times" backTo="/learn" />
      <div className="chips">
        {pk.phrases.map((x) => <button key={x.id} className={"chip" + (x.id === g ? " on" : "")} onClick={() => { setG(x.id); queue.current = []; stopSpeaking(); setPlaying(false); }}><Icon name={x.icon} size={15} /> {x.title}</button>)}
      </div>
      <div className="card mt12">
        <div className="row"><div className="grow row" style={{ fontWeight: 800, fontSize: 17, gap: 10 }}><IconTile name={group.icon} size={34} icon={18} />{group.title}</div>
          <button className="btn sm primary" onClick={playAll}>{playing ? <><Square size={14} /> Stop</> : <><Play size={14} /> Play all</>}</button></div>
        {group.items.map((e) => <ExampleRow key={e.jp} e={e} />)}
      </div>
      <div className="card flat mt12 sm" style={{ background: "transparent", lineHeight: 1.55 }}><b>Shadowing:</b> play a phrase, pause, then repeat it aloud copying the rhythm and melody. Then test yourself in <b>Practice → Speak</b>.</div>
    </div>
  );
}
