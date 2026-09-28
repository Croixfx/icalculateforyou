import { monthlyRateFromAnnual } from "./rate";
import type { Debt, DebtPayoffEntry, MultiDebtPlan, MultiDebtStrategy } from "./types";

const MAX_MONTHS = 1200; // 100 years, a practical safety cap against runaway loops
const EPSILON = 1e-9; // snaps floating-point dust (e.g. 1.1e-16) to an exact 0 balance

interface Working {
  id: string;
  monthlyRate: number;
  minPayment: number;
  remaining: number;
  totalInterest: number;
  payoffMonth: number | null;
}

function sortOrder(debts: Debt[], strategy: MultiDebtStrategy): string[] {
  const withRate = debts.map((d) => ({
    id: d.id,
    balance: d.balance,
    monthlyRate: monthlyRateFromAnnual(d.annualRate, d.rateType),
  }));

  const sorted =
    strategy === "avalanche"
      ? withRate.slice().sort((a, b) => b.monthlyRate - a.monthlyRate)
      : withRate.slice().sort((a, b) => a.balance - b.balance);

  return sorted.map((d) => d.id);
}

/**
 * Simulates paying off multiple debts at once under a fixed monthly budget.
 * Minimums are paid on every debt; all leftover budget goes to the target
 * debt chosen by the strategy. When a debt clears, its former minimum
 * payment becomes part of the leftover budget for the next target.
 */
export function multiDebtPlan(
  debts: Debt[],
  monthlyBudget: number,
  strategy: MultiDebtStrategy,
): MultiDebtPlan {
  if (debts.length === 0) {
    throw new Error("debts must contain at least one debt");
  }

  const totalMinPayments = debts.reduce((sum, d) => sum + d.minPayment, 0);
  if (monthlyBudget < totalMinPayments) {
    throw new Error(
      "monthlyBudget is less than the sum of all minimum payments; the plan is infeasible",
    );
  }

  const priorityOrder = sortOrder(debts, strategy);

  const working = new Map<string, Working>(
    debts.map((d) => [
      d.id,
      {
        id: d.id,
        monthlyRate: monthlyRateFromAnnual(d.annualRate, d.rateType),
        minPayment: d.minPayment,
        remaining: d.balance,
        totalInterest: 0,
        payoffMonth: null,
      },
    ]),
  );

  let month = 0;
  let outstandingCount = debts.filter((d) => d.balance > 0).length;

  while (outstandingCount > 0 && month < MAX_MONTHS) {
    month += 1;

    const targetId = priorityOrder.find((id) => working.get(id)!.remaining > 0);
    if (!targetId) break;

    let otherPayments = 0;

    for (const id of priorityOrder) {
      if (id === targetId) continue;
      const debt = working.get(id)!;
      if (debt.remaining <= 0) continue;

      const interest = debt.remaining * debt.monthlyRate;
      const payment = Math.min(debt.minPayment, debt.remaining + interest);
      const principal = payment - interest;

      debt.remaining = Math.max(0, debt.remaining - principal);
      if (debt.remaining < EPSILON) {
        debt.remaining = 0;
      }
      debt.totalInterest += interest;
      otherPayments += payment;

      if (debt.remaining === 0 && debt.payoffMonth === null) {
        debt.payoffMonth = month;
        outstandingCount -= 1;
      }
    }

    const target = working.get(targetId)!;
    const targetInterest = target.remaining * target.monthlyRate;
    const targetPayment = Math.min(
      monthlyBudget - otherPayments,
      target.remaining + targetInterest,
    );
    const targetPrincipal = targetPayment - targetInterest;

    target.remaining = Math.max(0, target.remaining - targetPrincipal);
    if (target.remaining < EPSILON) {
      target.remaining = 0;
    }
    target.totalInterest += targetInterest;

    if (target.remaining === 0 && target.payoffMonth === null) {
      target.payoffMonth = month;
      outstandingCount -= 1;
    }
  }

  if (outstandingCount > 0) {
    throw new Error("monthlyBudget does not pay off all debts within a reasonable time frame");
  }

  const entries: DebtPayoffEntry[] = Array.from(working.values()).map((w) => ({
    id: w.id,
    payoffMonth: w.payoffMonth!,
    totalInterest: w.totalInterest,
  }));

  const order = entries
    .slice()
    .sort((a, b) => a.payoffMonth - b.payoffMonth)
    .map((e) => e.id);

  const totalInterest = entries.reduce((sum, e) => sum + e.totalInterest, 0);
  const debtFreeMonth = entries.reduce((max, e) => Math.max(max, e.payoffMonth), 0);

  return {
    order,
    debts: entries,
    totalInterest,
    debtFreeMonth,
  };
}
