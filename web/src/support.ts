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

/** Privacy contact (required by the DPDP Act: grievance officer). Fill in before publishing. */
export const CONTACT = {
  developer: "Nihongo Path",
  grievanceOfficer: "",  // name of the person who handles privacy requests
  email: "",             // e.g. "privacy@yourdomain.com"
  policyUrl: "",         // public URL of the privacy policy (needed for Google Play)
  policyUpdated: "16 November 2026",
};
export const hasSupport = () => !!(SUPPORT.upiId || SUPPORT.buyMeACoffee || SUPPORT.kofi || SUPPORT.githubSponsors);

/** "Build your own app" requests. Fill at least one so requests reach you directly;
 *  if all are empty the app opens the share sheet / copies the request instead. */
export const BUILD_CONTACT = {
  email: "",      // e.g. "apps@yourdomain.com"
  whatsapp: "",   // international number without + or spaces, e.g. "919876543210"
};

/** Your story on the About page. Edit freely - this is a starting draft written in your voice. */
export const ABOUT_ME = {
  title: "Why I made Nihongo Path",
  paragraphs: [
    "I have always been drawn to Japan - the care people put into everyday things, the calm of its temples, the energy of its cities, and a language that sounds as beautiful as it looks on paper.",
    "When I started learning Japanese myself, I wanted one app that explained things simply, let me hear and record every word, showed my pronunciation, and connected Japanese to English and Hindi. I couldn't find it, so I built it.",
    "Nihongo Path is free, works offline and keeps your data on your phone. I hope it makes your first steps in Japanese as exciting as mine were. がんばってください！",
  ],
};
