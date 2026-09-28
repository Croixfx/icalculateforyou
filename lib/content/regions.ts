import type { RegionConfig, RegionKey } from "./types";

export const SITE_URL = "https://www.calculatorhub.example";

export const REGIONS: Record<RegionKey, RegionConfig> = {
  default: {
    key: "default",
    path: "/",
    hreflang: "x-default",
    locale: "en-US",
    currency: "USD",
    countryName: "the world",
  },
  us: {
    key: "us",
    path: "/us/",
    hreflang: "en-US",
    locale: "en-US",
    currency: "USD",
    countryName: "the United States",
  },
  uk: {
    key: "uk",
    path: "/uk/",
    hreflang: "en-GB",
    locale: "en-GB",
    currency: "GBP",
    countryName: "the United Kingdom",
  },
  ca: {
    key: "ca",
    path: "/ca/",
    hreflang: "en-CA",
    locale: "en-CA",
    currency: "CAD",
    countryName: "Canada",
  },
  au: {
    key: "au",
    path: "/au/",
    hreflang: "en-AU",
    locale: "en-AU",
    currency: "AUD",
    countryName: "Australia",
  },
};

/**
 * The full set of alternate-language URLs for hreflang tags, shared by every
 * page since all regional variants (plus the global default) always exist
 * together.
 */
export function alternateLanguages(): Record<string, string> {
  const languages: Record<string, string> = {};
  for (const region of Object.values(REGIONS)) {
    languages[region.hreflang] = `${SITE_URL}${region.path}`;
  }
  return languages;
}
