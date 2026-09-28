import { monthlyRateFromAnnual, type RateType } from "@/lib/engine";

export const MAX_BALANCE = 1_000_000_000_000; // 1 trillion — generous across every currency, guards against typos/Infinity
export const MAX_RATE_PERCENT = 1000; // 1000% APR — extreme but real predatory rates exist; guards against unit typos (e.g. 21000 instead of 21)
export const MAX_TARGET_MONTHS = 600; // 50 years, a practical cap for "pay off by a date" mode
export const MIN_TARGET_MONTHS = 1;
export const MAX_EXTRA_PERCENT = 50;
export const MIN_EXTRA_PERCENT = 0;

export type ValidationError =
  | { code: "required" }
  | { code: "notANumber" }
  | { code: "mustBePositive" }
  | { code: "tooLarge"; max: number }
  | { code: "paymentTooLow"; minPayment: number }
  | { code: "dateNotInFuture" }
  | { code: "dateTooFar"; maxMonths: number };

export type FieldResult<T = number> = { ok: true; value: T } | { ok: false; error: ValidationError };

/**
 * Parses a number typed by a user (or restored from a URL), tolerating
 * thousands separators ("7,000") and surrounding whitespace. Returns null
 * for anything that isn't a finite number.
 */
export function parseNumberInput(raw: string): number | null {
  const cleaned = raw.trim().replace(/,/g, "");
  if (cleaned === "") return null;
  const value = Number(cleaned);
  return Number.isFinite(value) ? value : null;
}

export function validateBalance(raw: string): FieldResult {
  const value = parseNumberInput(raw);
  if (value === null) return { ok: false, error: raw.trim() === "" ? { code: "required" } : { code: "notANumber" } };
  if (value <= 0) return { ok: false, error: { code: "mustBePositive" } };
  if (value > MAX_BALANCE) return { ok: false, error: { code: "tooLarge", max: MAX_BALANCE } };
  return { ok: true, value };
}

export function validateRatePercent(raw: string): FieldResult {
  const value = parseNumberInput(raw);
  if (value === null) return { ok: false, error: raw.trim() === "" ? { code: "required" } : { code: "notANumber" } };
  if (value < 0) return { ok: false, error: { code: "mustBePositive" } };
  if (value > MAX_RATE_PERCENT) return { ok: false, error: { code: "tooLarge", max: MAX_RATE_PERCENT } };
  return { ok: true, value };
}

/**
 * Validates a monthly payment against the balance's monthly interest —
 * the engine will throw on this same condition, but the UI needs the
 * minimum required payment ahead of time to show a friendly message.
 */
export function validatePayment(
  raw: string,
  context: { balance: number; ratePercent: number; rateType: RateType },
): FieldResult {
  const value = parseNumberInput(raw);
  if (value === null) return { ok: false, error: raw.trim() === "" ? { code: "required" } : { code: "notANumber" } };
  if (value <= 0) return { ok: false, error: { code: "mustBePositive" } };

  const monthlyRate = monthlyRateFromAnnual(context.ratePercent / 100, context.rateType);
  const monthlyInterest = context.balance * monthlyRate;
  if (monthlyRate > 0 && value <= monthlyInterest) {
    return { ok: false, error: { code: "paymentTooLow", minPayment: monthlyInterest } };
  }
  return { ok: true, value };
}

/**
 * Validates a "YYYY-MM" target date against `now`, returning the number of
 * whole months between them on success.
 */
export function validateTargetDate(raw: string, now: Date): FieldResult {
  if (raw.trim() === "") return { ok: false, error: { code: "required" } };
  const match = /^(\d{4})-(\d{2})$/.exec(raw.trim());
  if (!match) return { ok: false, error: { code: "notANumber" } };

  const year = Number(match[1]);
  const month = Number(match[2]); // 1-12
  if (month < 1 || month > 12) return { ok: false, error: { code: "notANumber" } };

  const months = (year - now.getFullYear()) * 12 + (month - 1 - now.getMonth());
  if (months < MIN_TARGET_MONTHS) return { ok: false, error: { code: "dateNotInFuture" } };
  if (months > MAX_TARGET_MONTHS) return { ok: false, error: { code: "dateTooFar", maxMonths: MAX_TARGET_MONTHS } };
  return { ok: true, value: months };
}

/** Clamps the "what if" extra-payment slider to a sane 0-50% range. */
export function clampExtraPercent(raw: string): number {
  const value = parseNumberInput(raw) ?? 0;
  return Math.min(MAX_EXTRA_PERCENT, Math.max(MIN_EXTRA_PERCENT, value));
}
