import { monthlyRateFromAnnual } from "./rate";
import type { AmortizationRow, PayoffResult, RateType } from "./types";

const MAX_MONTHS = 1200; // 100 years, a practical safety cap against runaway loops
const EPSILON = 1e-9; // snaps floating-point dust (e.g. 1.1e-16) to an exact 0 balance

function assertPaymentCoversInterest(
  balance: number,
  monthlyRate: number,
  monthlyPayment: number,
): void {
  if (monthlyPayment <= 0) {
    throw new Error("monthlyPayment must be greater than 0");
  }
  const firstMonthInterest = balance * monthlyRate;
  if (monthlyPayment <= firstMonthInterest) {
    throw new Error(
      "monthlyPayment does not cover the monthly interest; balance would never decrease",
    );
  }
}

/**
 * Simulates a single debt's amortization month by month, no rounding applied.
 * The final payment is reduced so the balance lands at exactly 0.
 */
export function amortizationSchedule(
  balance: number,
  annualRate: number,
  rateType: RateType,
  monthlyPayment: number,
): AmortizationRow[] {
  if (balance < 0) {
    throw new Error("balance must not be negative");
  }
  const monthlyRate = monthlyRateFromAnnual(annualRate, rateType);

  const schedule: AmortizationRow[] = [];
  if (balance === 0) {
    return schedule;
  }

  if (monthlyRate > 0) {
    assertPaymentCoversInterest(balance, monthlyRate, monthlyPayment);
  } else if (monthlyPayment <= 0) {
    throw new Error("monthlyPayment must be greater than 0");
  }

  let remaining = balance;
  let month = 0;

  while (remaining > 0 && month < MAX_MONTHS) {
    month += 1;
    const interest = remaining * monthlyRate;
    const scheduledPayment = Math.min(monthlyPayment, remaining + interest);
    const principal = scheduledPayment - interest;
    remaining = Math.max(0, remaining - principal);
    if (remaining < EPSILON) {
      remaining = 0;
    }

    schedule.push({
      month,
      payment: scheduledPayment,
      interest,
      principal,
      balance: remaining,
    });
  }

  if (remaining > 0) {
    throw new Error("monthlyPayment does not pay off the balance within a reasonable time frame");
  }

  return schedule;
}

/**
 * Computes months to payoff, total interest, and total paid for a single debt.
 */
export function monthsToPayoff(
  balance: number,
  annualRate: number,
  rateType: RateType,
  monthlyPayment: number,
): PayoffResult {
  const schedule = amortizationSchedule(balance, annualRate, rateType, monthlyPayment);

  const totalInterest = schedule.reduce((sum, row) => sum + row.interest, 0);
  const totalPaid = schedule.reduce((sum, row) => sum + row.payment, 0);

  return {
    months: schedule.length,
    totalInterest,
    totalPaid,
    schedule,
  };
}

/**
 * Computes the monthly payment required to pay off a balance in exactly `months` payments.
 */
export function paymentForTarget(
  balance: number,
  annualRate: number,
  rateType: RateType,
  months: number,
): number {
  if (balance < 0) {
    throw new Error("balance must not be negative");
  }
  if (!Number.isFinite(months) || months <= 0) {
    throw new Error("months must be a positive number");
  }

  const monthlyRate = monthlyRateFromAnnual(annualRate, rateType);

  if (monthlyRate === 0) {
    return balance / months;
  }

  const factor = Math.pow(1 + monthlyRate, months);
  return (balance * monthlyRate * factor) / (factor - 1);
}
