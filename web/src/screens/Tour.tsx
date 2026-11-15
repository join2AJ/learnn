import Intro from "./Intro";

/** App tour = the same swipeable slides as the first-run intro (real app screens + audio). */
export default function Tour({ onDone }: { onDone: () => void }) {
  return <Intro onDone={onDone} tour />;
}
