import { getPack } from "./packs/registry";
import { getSettings, useSettings } from "./core/store";

/** Current language pack (non-reactive), and a hook version for components. */
export const pack = () => getPack(getSettings().lang);
export const usePack = () => getPack(useSettings().lang);
