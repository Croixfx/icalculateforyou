import type { DebtFormRow, MultiDebtFormState } from "./types";

const CURRENCY_PATTERN = /^[A-Za-z]{3}$/;
const MAX_DEBTS = 20; // sane upper bound against a malicious/garbled URL

interface EncodedDebt {
  name: string;
  balance: string;
  rate: string;
  minPayment: string;
}

function isEncodedDebt(value: unknown): value is EncodedDebt {
  if (typeof value !== "object" || value === null) return false;
  const d = value as Record<string, unknown>;
  return typeof d.name === "string" && typeof d.balance === "string" && typeof d.rate === "string" && typeof d.minPayment === "string";
}

/**
 * Serializes the whole debt list as one JSON-in-a-param value (URLSearchParams
 * percent-encodes it automatically), rather than a scheme like debt0Name=,
 * debt1Name=... - the list can be any length, and this keeps encode/decode a
 * single well-defined shape instead of an open-ended set of indexed keys.
 */
export function encodeMultiDebtState(state: MultiDebtFormState): URLSearchParams {
  const params = new URLSearchParams();

  const encodedDebts: EncodedDebt[] = state.debts.map((d) => ({
    name: d.name,
    balance: d.balance,
    rate: d.ratePercent,
    minPayment: d.minPayment,
  }));
  params.set("debts", JSON.stringify(encodedDebts));

  if (state.budget.trim() !== "") params.set("budget", state.budget);
  if (state.currency.trim() !== "") params.set("currency", state.currency);

  return params;
}

/**
 * Reads a shared multi-debt link back into form state. Same philosophy as
 * the single-debt calculator's decodeFormState: a malformed or hand-edited
 * URL (bad JSON, a debt missing a field, too many debts) degrades to
 * "ignore the debts param" rather than throwing or producing a half-valid
 * state - validation.ts then decides whether each restored value is
 * actually usable, exactly like a typed value would be.
 */
export function decodeMultiDebtState(search: string | URLSearchParams): Partial<MultiDebtFormState> {
  const params = typeof search === "string" ? new URLSearchParams(search) : search;
  const result: Partial<MultiDebtFormState> = {};

  const debtsRaw = params.get("debts");
  if (debtsRaw) {
    try {
      const parsed: unknown = JSON.parse(debtsRaw);
      if (Array.isArray(parsed)) {
        const debts: DebtFormRow[] = parsed
          .filter(isEncodedDebt)
          .slice(0, MAX_DEBTS)
          .map((d, i) => ({
            id: `d${i}`,
            name: d.name,
            balance: d.balance,
            ratePercent: d.rate,
            minPayment: d.minPayment,
          }));
        if (debts.length > 0) result.debts = debts;
      }
    } catch {
      // Malformed JSON in a stale/hand-edited URL - fall back to defaults.
    }
  }

  const budget = params.get("budget");
  if (budget) result.budget = budget;

  const currency = params.get("currency");
  if (currency && CURRENCY_PATTERN.test(currency)) result.currency = currency.toUpperCase();

  return result;
}

/** Builds a full shareable URL for the given base page and form state. */
export function buildMultiDebtShareUrl(baseUrl: string, state: MultiDebtFormState): string {
  const query = encodeMultiDebtState(state).toString();
  return query ? `${baseUrl}?${query}` : baseUrl;
}
