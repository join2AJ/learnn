import { getSettings } from "./store";
/** Child mode: learner said they are under 18 and no parent/guardian has consented yet. */
export const childMode = () => { const s = getSettings(); return !!s.minor && !s.parentConsent; };
export const MINOR_AGES = ["Under 13", "13–17"];
