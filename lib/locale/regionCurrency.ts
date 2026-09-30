import territoryCurrency from "./territoryCurrency.json";

/**
 * ISO 3166-1 territory -> current ISO 4217 currency, for every territory
 * Unicode CLDR tracks (254 of them - the handful it omits, like
 * Antarctica, genuinely have no currency of their own). Generated from
 * cldr-core by scripts/generate-territory-currency.mjs; see that script
 * for how "current" is picked and re-run it to pick up a currency
 * changeover (e.g. a country adopting the euro) once CLDR publishes it.
 * cldr-core itself is a devDependency only - this module ships just the
 * small static JSON it produced, no CLDR package at runtime.
 */
export const REGION_TO_CURRENCY: Record<string, string> = territoryCurrency;

/**
 * Best-effort currency guess for a region code. Falls back to USD for any
 * region not in the map, since this is only ever a starting suggestion that
 * the visitor can change via the manual currency selector.
 */
export function currencyForRegion(region: string | undefined): string {
  if (!region) return "USD";
  return REGION_TO_CURRENCY[region.toUpperCase()] ?? "USD";
}
