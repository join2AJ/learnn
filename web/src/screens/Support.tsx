import { Coffee, Github, Heart, IndianRupee, Share2 } from "lucide-react";
import { SUPPORT, hasSupport } from "../support";
import { openExternal } from "../core/native";
import { toast } from "../core/store";
import { useEffect } from "react";
import { go } from "../core/router";
import { childMode } from "../core/child";

/** Optional, voluntary support - the app stays free with no locked features. */
export function SupportBlock() {
  const share = async () => {
    const text = "I’m learning Japanese with Nihongo Path - free, with Hindi explanations, voice analysis and stroke order." + (SUPPORT.shareUrl ? " " + SUPPORT.shareUrl : "");
    try { if (navigator.share) { await navigator.share({ text }); return; } } catch { /* fall back */ }
    openExternal("https://wa.me/?text=" + encodeURIComponent(text));
  };
  const upi = (amt: number) => openExternal(`upi://pay?pa=${encodeURIComponent(SUPPORT.upiId)}&pn=${encodeURIComponent(SUPPORT.upiName || "Nihongo Path")}&am=${amt}&cu=INR&tn=${encodeURIComponent("Support Nihongo Path")}`);
  if (childMode()) return <div className="card sm">Thank you for learning with us!</div>;
  return (
    <>
      <div className="card">
        <div className="row top" style={{ gap: 12 }}>
          <Heart size={22} color="var(--sakura)" style={{ flex: "none", marginTop: 2 }} />
          <div className="sm" style={{ lineHeight: 1.55 }}>No ads, no tracking, nothing locked. If the app helps you, a small contribution pays for new languages, more words and better voice tools.</div>
        </div>
      </div>
      {SUPPORT.upiId && (
        <div className="card mt12">
          <div className="row"><IndianRupee size={20} color="var(--matcha)" /><b className="grow">UPI (India)</b></div>
          <div className="grid3 mt12">{[49, 99, 199].map((a) => <button key={a} className="btn" onClick={() => upi(a)}>₹{a}</button>)}</div>
          <button className="btn ghost block mt8" onClick={() => { navigator.clipboard?.writeText(SUPPORT.upiId); toast("UPI ID copied", "ok"); }}>Copy UPI ID: {SUPPORT.upiId}</button>
        </div>
      )}
      {(SUPPORT.buyMeACoffee || SUPPORT.kofi) && (
        <div className="list mt12">
          {SUPPORT.buyMeACoffee && <button className="li" onClick={() => openExternal(SUPPORT.buyMeACoffee)}><span className="ico soft-gold"><Coffee size={19} color="var(--gold)" /></span><span className="grow"><div className="t">Buy me a coffee</div><div className="d">Cards & international payments</div></span></button>}
          {SUPPORT.kofi && <button className="li" onClick={() => openExternal(SUPPORT.kofi)}><span className="ico soft-sakura"><Coffee size={19} color="var(--sakura)" /></span><span className="grow"><div className="t">Ko-fi</div><div className="d">One-time or monthly</div></span></button>}
          {SUPPORT.githubSponsors && <button className="li" onClick={() => openExternal(SUPPORT.githubSponsors)}><span className="ico soft-ai"><Github size={19} color="var(--ai)" /></span><span className="grow"><div className="t">GitHub Sponsors</div><div className="d">For developers</div></span></button>}
        </div>
      )}
      {!hasSupport() && <div className="card flat mt12 sm mu">Ways to contribute are coming soon.</div>}
      <div className="section-title"><h2>Free ways to help</h2></div>
      <div className="list">
        <button className="li" onClick={share}><span className="ico soft-matcha"><Share2 size={19} color="var(--matcha)" /></span><span className="grow"><div className="t">Share with a friend</div><div className="d">The best support is another learner</div></span></button>
      </div>
    </>
  );
}

/** Old route: support now lives on the About page. */
export default function Support() { return <SupportRedirect />; }
function SupportRedirect() { useEffect(() => { go("/me/about", true); }, []); return null; }
