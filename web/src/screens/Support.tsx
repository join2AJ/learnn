import { Coffee, Github, Heart, IndianRupee, Share2 } from "lucide-react";
import { BUILD_CONTACT, SUPPORT, hasSupport } from "../support";
import { openExternal, shareText } from "../core/native";
import { toast } from "../core/store";
import { useEffect } from "react";
import { go } from "../core/router";
import { childMode } from "../core/child";

/** Optional, voluntary support - the app stays free with no locked features. */
export function SupportBlock() {
  const share = () => go("/me/share");
  const upi = (amt: number) => openExternal(`upi://pay?pa=${encodeURIComponent(SUPPORT.upiId)}&pn=${encodeURIComponent(SUPPORT.upiName || "Nihongo Path")}&am=${amt}&cu=INR&tn=${encodeURIComponent("Support Nihongo Path")}`);
  const askDonate = () => {
    const msg = "Hi! I'd like to donate to support Nihongo Path. Please send me how I can contribute.";
    if (BUILD_CONTACT.whatsapp) openExternal(`https://wa.me/${BUILD_CONTACT.whatsapp}?text=${encodeURIComponent(msg)}`);
    else if (BUILD_CONTACT.email) openExternal(`mailto:${BUILD_CONTACT.email}?subject=${encodeURIComponent("Donation for Nihongo Path")}&body=${encodeURIComponent(msg)}`);
    else if (!shareText("Donation for Nihongo Path", msg)) toast("Donations open very soon - thank you!", "ok");
  };
  if (childMode()) return <div className="sm">Thank you for learning with us!</div>;
  return (
    <>
      <div className="sm" style={{ lineHeight: 1.55 }}>No ads, no tracking, nothing locked. If the app helps you, a small contribution pays for new languages, more words and better voice tools.</div>
      {SUPPORT.upiId && (
        <div className="card mt12">
          <div className="row"><IndianRupee size={20} /><b className="grow">UPI (India)</b></div>
          <div className="grid3 mt12">{[49, 99, 199].map((a) => <button key={a} className="btn white" onClick={() => upi(a)}>₹{a}</button>)}</div>
          <button className="btn ghost block mt8" style={{ color: "#fff" }} onClick={() => { navigator.clipboard?.writeText(SUPPORT.upiId); toast("UPI ID copied", "ok"); }}>Copy UPI ID: {SUPPORT.upiId}</button>
        </div>
      )}
      {SUPPORT.buyMeACoffee && <button className="btn white block mt12" onClick={() => openExternal(SUPPORT.buyMeACoffee)}><Coffee size={17} /> Buy me a coffee</button>}
      {SUPPORT.kofi && <button className="btn white block mt8" onClick={() => openExternal(SUPPORT.kofi)}><Coffee size={17} /> Ko-fi</button>}
      {SUPPORT.githubSponsors && <button className="btn white block mt8" onClick={() => openExternal(SUPPORT.githubSponsors)}><Github size={17} /> GitHub Sponsors</button>}
      {!hasSupport() && <button className="btn white block mt12" onClick={askDonate}><Heart size={17} /> I want to donate</button>}
      <button className="btn block mt8" style={{ background: "rgba(255,255,255,.18)", color: "#fff" }} onClick={share}><Share2 size={17} /> Share with a friend</button>
    </>
  );
}

/** Old route: support now lives on the About page. */
export default function Support() { return <SupportRedirect />; }
function SupportRedirect() { useEffect(() => { go("/me/about", true); }, []); return null; }
