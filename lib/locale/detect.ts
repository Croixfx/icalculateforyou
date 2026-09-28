import { currencyForRegion } from "./regionCurrency";
import type { LocaleInfo } from "./types";

const DEFAULT_LOCALE: LocaleInfo = { locale: "en-US", currency: "USD" };
const STORAGE_KEY = "preferredCurrency";

/**
 * Extracts the ISO 3166 region (e.g. "GB" from "en-GB") from a BCP 47 locale
 * tag using Intl.Locale, which understands maximization/likely-subtags
 * better than a naive string split.
 */
function regionFromLocale(locale: string): string | undefined {
  try {
    const parsed = new Intl.Locale(locale);
    const region = parsed.maximize().region;
    return region;
  } catch {
    const parts = locale.split("-");
    return parts.length > 1 ? parts[parts.length - 1] : undefined;
  }
}

/**
 * Guesses the visitor's locale and currency from the browser. Returns the
 * US default when run outside a browser (SSR / static export) or when the
 * browser exposes no usable language.
 */
export function detectLocale(): LocaleInfo {
  // Guard on `window`, not `navigator` — Node 21+ exposes a global
  // `navigator` reflecting the build machine's OS locale, which would
  // otherwise leak into this statically-exported site's server render.
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return DEFAULT_LOCALE;
  }

  const locale = navigator.languages?.[0] ?? navigator.language;
  if (!locale) {
    return DEFAULT_LOCALE;
  }

  const region = regionFromLocale(locale);
  const currency = currencyForRegion(region);

  return { locale, currency };
}

/**
 * Reads a manually-selected currency override saved by the currency
 * selector, if any. Returns null if none was saved or storage is
 * unavailable (private browsing, SSR, etc).
 */
export function getPreferredCurrency(): string | null {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

/**
 * Saves a manually-selected currency override so it persists across visits,
 * taking priority over the auto-detected currency on future page loads.
 */
export function setPreferredCurrency(currency: string): void {
  if (typeof window === "undefined") {
    return;
  }
  try {
    window.localStorage.setItem(STORAGE_KEY, currency);
  } catch {
    // Storage unavailable (private browsing, quota, etc) — override just won't persist.
  }
}

/**
 * Resolves the currency to use: a manual override if one was saved,
 * otherwise the browser-detected currency.
 */
export function resolveCurrency(): string {
  return getPreferredCurrency() ?? detectLocale().currency;
}
