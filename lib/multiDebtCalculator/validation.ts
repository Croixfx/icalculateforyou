import { validateBalance, validateRatePercent, type FieldResult, type ValidationError } from "@/lib/calculator";
import type { DebtFormRow } from "./types";

/**
 * A debt's balance and minimum payment are both "a positive currency amount,
 * capped at the same sane maximum" — exactly the single-debt calculator's
 * balance rule, so these just delegate to it rather than duplicating it.
 */
export function validateDebtBalance(raw: string): FieldResult {
  return validateBalance(raw);
}

export function validateDebtMinPayment(raw: string): FieldResult {
  return validateBalance(raw);
}

export function validateDebtRate(raw: string): FieldResult {
  return validateRatePercent(raw);
}

/**
 * A blank debt name isn't an error - it just falls back to "Debt {n}" for
 * display and sharing, the same placeholder shown in the empty field.
 */
export function resolveDebtName(raw: string, position: number): string {
  const trimmed = raw.trim();
  return trimmed !== "" ? trimmed : `Debt ${position}`;
}

export interface BudgetBelowMinimumError {
  code: "belowMinimum";
  min: number;
}

export type BudgetValidationError = ValidationError | BudgetBelowMinimumError;
export type BudgetResult = { ok: true; value: number } | { ok: false; error: BudgetValidationError };

/**
 * Validates the total monthly budget: it must first be a valid positive
 * amount (same rule as a debt balance), then must cover every debt's
 * minimum payment combined - otherwise the engine's own plan would be
 * infeasible before a single dollar goes toward paying anything down
 * faster.
 */
export function validateBudget(raw: string, minRequired: number): BudgetResult {
  const base = validateBalance(raw);
  if (!base.ok) return base;
  if (base.value < minRequired) {
    return { ok: false, error: { code: "belowMinimum", min: minRequired } };
  }
  return base;
}

/** Sums the minimum payments across every debt row, treating an invalid one as 0. */
export function sumOfMinPayments(debts: DebtFormRow[]): number {
  return debts.reduce((sum, d) => {
    const result = validateDebtMinPayment(d.minPayment);
    return sum + (result.ok ? result.value : 0);
  }, 0);
}
