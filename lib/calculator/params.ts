import type { CalculatorFormState, CalculatorMode } from "./types";

const MODE_VALUES = new Set<CalculatorMode>(["duration", "target"]);
const RATE_TYPE_VALUES = new Set(["nominal", "effective"]);
const TARGET_DATE_PATTERN = /^\d{4}-\d{2}$/;
const CURRENCY_PATTERN = /^[A-Za-z]{3}$/;

/**
 * Serializes the calculator's form state into URL query parameters, so any
 * result can be shared as a link. Only fields relevant to the current mode
 * are written, and a zero "what if" slider is omitted (it's the default).
 */
export function encodeFormState(state: CalculatorFormState): URLSearchParams {
  const params = new URLSearchParams();

  params.set("mode", state.mode);
  if (state.balance.trim() !== "") params.set("balance", state.balance);
  if (state.ratePercent.trim() !== "") params.set("rate", state.ratePercent);
  params.set("rateType", state.rateType);

  if (state.mode === "duration" && state.payment.trim() !== "") {
    params.set("payment", state.payment);
  }
  if (state.mode === "target" && state.targetDate.trim() !== "") {
    params.set("targetDate", state.targetDate);
  }

  if (state.extraPercent.trim() !== "" && state.extraPercent !== "0") {
    params.set("extra", state.extraPercent);
  }
  if (state.currency.trim() !== "") {
    params.set("currency", state.currency);
  }

  return params;
}

/**
 * Reads known calculator fields out of a URL's query string. Values are
 * returned as raw strings, exactly like `encodeFormState` wrote them — the
 * same validation.ts functions used for typed input then decide whether
 * each one is actually usable, so there is one parsing/validation path for
 * both a typed value and a value restored from a shared link.
 *
 * Unknown params are ignored; enum-like fields (mode, rateType, currency's
 * shape, targetDate's shape) are dropped unless they match exactly, so a
 * hand-edited or stale URL degrades to the calculator's defaults instead
 * of producing an inconsistent state.
 */
export function decodeFormState(search: string | URLSearchParams): Partial<CalculatorFormState> {
  const params = typeof search === "string" ? new URLSearchParams(search) : search;
  const result: Partial<CalculatorFormState> = {};

  const mode = params.get("mode");
  if (mode && MODE_VALUES.has(mode as CalculatorMode)) {
    result.mode = mode as CalculatorMode;
  }

  const rateType = params.get("rateType");
  if (rateType && RATE_TYPE_VALUES.has(rateType)) {
    result.rateType = rateType as CalculatorFormState["rateType"];
  }

  const balance = params.get("balance");
  if (balance) result.balance = balance;

  const rate = params.get("rate");
  if (rate) result.ratePercent = rate;

  const payment = params.get("payment");
  if (payment) result.payment = payment;

  const targetDate = params.get("targetDate");
  if (targetDate && TARGET_DATE_PATTERN.test(targetDate)) result.targetDate = targetDate;

  const extra = params.get("extra");
  if (extra) result.extraPercent = extra;

  const currency = params.get("currency");
  if (currency && CURRENCY_PATTERN.test(currency)) result.currency = currency.toUpperCase();

  return result;
}

/** Builds a full shareable URL for the given base page and form state. */
export function buildShareUrl(baseUrl: string, state: CalculatorFormState): string {
  const query = encodeFormState(state).toString();
  return query ? `${baseUrl}?${query}` : baseUrl;
}
