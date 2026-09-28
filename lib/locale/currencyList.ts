import { REGION_TO_CURRENCY } from "./regionCurrency";

/**
 * Used only when the runtime doesn't support Intl.supportedValuesOf (older
 * Safari). Everywhere else, the full ISO 4217 list comes straight from the
 * runtime itself — see getSupportedCurrencies().
 */
const FALLBACK_CURRENCIES = Array.from(new Set(Object.values(REGION_TO_CURRENCY))).sort();

/** Every ISO 4217 currency code the runtime knows how to format. */
export function getSupportedCurrencies(): string[] {
  if (typeof Intl.supportedValuesOf === "function") {
    try {
      return Intl.supportedValuesOf("currency");
    } catch {
      return FALLBACK_CURRENCIES;
    }
  }
  return FALLBACK_CURRENCIES;
}

/** A human-readable name for a currency code (e.g. "JPY" -> "Japanese Yen"). */
export function getCurrencyDisplayName(code: string, locale?: string): string {
  try {
    return new Intl.DisplayNames(locale, { type: "currency" }).of(code) ?? code;
  } catch {
    return code;
  }
}

export interface CurrencyOption {
  code: string;
  name: string;
}

/** Currency options for a <select>, sorted by display name in the given locale. */
export function getCurrencyOptions(locale?: string): CurrencyOption[] {
  return getSupportedCurrencies()
    .map((code) => ({ code, name: getCurrencyDisplayName(code, locale) }))
    .sort((a, b) => a.name.localeCompare(b.name, locale));
}
