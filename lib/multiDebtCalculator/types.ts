/**
 * One debt row in the form, kept as raw strings (mirroring <input> values)
 * for the same reason as the single-debt calculator's form state — exactly
 * one place does numeric parsing, whether the value came from typing or a
 * shared URL. `id` is a client-only key for React/removal, never something
 * the user sees or that gets validated.
 */
export interface DebtFormRow {
  id: string;
  name: string;
  balance: string;
  ratePercent: string;
  minPayment: string;
}

export interface MultiDebtFormState {
  debts: DebtFormRow[];
  budget: string;
  currency: string;
}
