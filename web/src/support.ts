/**
 * Voluntary support links. Leave a value empty to hide that option.
 * Fill these in with your own IDs - nothing is shown until at least one is set.
 */
export const SUPPORT = {
  upiId: "",            // e.g. "yourname@okaxis"  (India - any UPI app)
  upiName: "",          // name shown in the UPI app
  buyMeACoffee: "",     // e.g. "https://www.buymeacoffee.com/yourname"
  kofi: "",             // e.g. "https://ko-fi.com/yourname"
  githubSponsors: "",   // e.g. "https://github.com/sponsors/yourname"
  shareUrl: "",         // where friends can download the app (website / Play Store link)
};
export const hasSupport = () => !!(SUPPORT.upiId || SUPPORT.buyMeACoffee || SUPPORT.kofi || SUPPORT.githubSponsors);
