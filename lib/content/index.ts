import { strings as auStrings } from "./en-AU";
import { strings as caStrings } from "./en-CA";
import { strings as defaultStrings } from "./en-default";
import { strings as gbStrings } from "./en-GB";
import { strings as usStrings } from "./en-US";
import { REGIONS, SITE_URL, alternateLanguages } from "./regions";
import type { RegionKey, SiteStrings } from "./types";

const STRINGS_BY_REGION: Record<RegionKey, SiteStrings> = {
  default: defaultStrings,
  us: usStrings,
  uk: gbStrings,
  ca: caStrings,
  au: auStrings,
};

export function getStrings(region: RegionKey): SiteStrings {
  return STRINGS_BY_REGION[region];
}

export { REGIONS, SITE_URL, alternateLanguages };
export type { RegionKey, RegionConfig, SiteStrings, CalculatorStrings, ContentStrings, FaqItem } from "./types";
