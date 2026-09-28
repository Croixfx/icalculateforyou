/**
 * Formats a numeric amount as currency using Intl.NumberFormat, which already
 * knows the correct fraction digits per ISO 4217 currency (e.g. JPY has 0,
 * USD/EUR have 2, BHD has 3) — we never hardcode decimal places ourselves.
 */
export function formatCurrency(amount: number, currency: string, locale?: string): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(amount);
}

/**
 * Formats a numeric amount as a plain decimal number using the currency's
 * standard fraction digits, without a currency symbol (e.g. for input fields).
 */
export function formatDecimal(amount: number, currency: string, locale?: string): string {
  const fractionDigits = getCurrencyFractionDigits(currency);
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(amount);
}

/**
 * Returns the number of decimal digits a currency is normally displayed with
 * (0 for JPY/KRW, 2 for USD/EUR/GBP, 3 for BHD/KWD, etc.), derived from
 * Intl.NumberFormat itself so it stays correct for every ISO 4217 currency.
 */
export function getCurrencyFractionDigits(currency: string): number {
  const parts = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).formatToParts(1);
  const fraction = parts.find((part) => part.type === "fraction");
  return fraction ? fraction.value.length : 0;
}

/**
 * Rounds a raw calculation result to the currency's display precision.
 * Only ever use this for display — never feed the rounded value back into
 * the engine, which must keep working with unrounded numbers.
 */
export function roundForDisplay(amount: number, currency: string): number {
  const digits = getCurrencyFractionDigits(currency);
  const factor = 10 ** digits;
  return Math.round(amount * factor) / factor;
}
