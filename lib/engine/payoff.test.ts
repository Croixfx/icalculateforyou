import { describe, expect, it } from "vitest";
import { amortizationSchedule, monthsToPayoff, paymentForTarget } from "./payoff";

describe("monthsToPayoff", () => {
  it("matches the known case: 7000 at 21% nominal, 200/month", () => {
    const result = monthsToPayoff(7000, 0.21, "nominal", 200);
    expect(result.months).toBe(55);
    expect(result.totalInterest).toBeCloseTo(3930, -1);
  });

  it("effective rate results in less interest than nominal for the same annual rate", () => {
    const nominal = monthsToPayoff(7000, 0.21, "nominal", 200);
    const effective = monthsToPayoff(7000, 0.21, "effective", 200);
    expect(effective.totalInterest).toBeLessThan(nominal.totalInterest);
    expect(effective.months).toBeLessThanOrEqual(nominal.months);
  });

  it("computes months = balance / payment exactly at 0% interest", () => {
    const result = monthsToPayoff(1200, 0, "nominal", 100);
    expect(result.months).toBe(1200 / 100);
    expect(result.totalInterest).toBe(0);
    expect(result.totalPaid).toBe(1200);
  });

  it("throws a clear error when the payment does not cover monthly interest", () => {
    // 10000 balance at 24% nominal -> 2% monthly interest -> 200/month interest-only
    expect(() => monthsToPayoff(10000, 0.24, "nominal", 150)).toThrow(
      /does not cover the monthly interest/,
    );
  });

  it("handles a very high interest rate", () => {
    const result = monthsToPayoff(1000, 2.5, "nominal", 500);
    expect(result.months).toBeGreaterThan(0);
    expect(result.schedule.at(-1)?.balance).toBe(0);
  });

  it("handles a tiny balance", () => {
    const result = monthsToPayoff(1, 0.3, "nominal", 50);
    expect(result.months).toBe(1);
    // 1 month of interest at 2.5%/month is included in the single payoff payment
    expect(result.totalPaid).toBeCloseTo(1.025, 5);
  });

  it("pays off in a single month when the payment exceeds balance + interest", () => {
    const result = monthsToPayoff(100, 0.1, "nominal", 10000);
    expect(result.months).toBe(1);
    expect(result.totalPaid).toBeCloseTo(100.8333, 3);
  });
});

describe("paymentForTarget", () => {
  it("agrees with monthsToPayoff in a round trip (nominal rate)", () => {
    const target = 24;
    const payment = paymentForTarget(5000, 0.15, "nominal", target);
    const result = monthsToPayoff(5000, 0.15, "nominal", payment);
    expect(result.months).toBe(target);
  });

  it("agrees with monthsToPayoff in a round trip (effective rate)", () => {
    const target = 36;
    const payment = paymentForTarget(8000, 0.18, "effective", target);
    const result = monthsToPayoff(8000, 0.18, "effective", payment);
    expect(result.months).toBe(target);
  });

  it("at 0% interest, payment is simply balance / months", () => {
    expect(paymentForTarget(10000, 0, "nominal", 40)).toBeCloseTo(250, 10);
  });
});

describe("amortizationSchedule", () => {
  it("rows sum to the totals and the final balance is exactly 0", () => {
    const schedule = amortizationSchedule(7000, 0.21, "nominal", 200);
    const totalInterest = schedule.reduce((sum, row) => sum + row.interest, 0);
    const totalPrincipal = schedule.reduce((sum, row) => sum + row.principal, 0);
    const totalPayment = schedule.reduce((sum, row) => sum + row.payment, 0);

    expect(totalPrincipal).toBeCloseTo(7000, 6);
    expect(totalPayment).toBeCloseTo(totalInterest + totalPrincipal, 6);
    expect(schedule.at(-1)?.balance).toBe(0);
  });

  it("reduces the final payment so the balance never goes negative", () => {
    const schedule = amortizationSchedule(100, 0.1, "nominal", 10000);
    expect(schedule).toHaveLength(1);
    expect(schedule[0].payment).toBeLessThan(10000);
    expect(schedule[0].balance).toBe(0);
  });

  it("returns an empty schedule for a zero balance", () => {
    expect(amortizationSchedule(0, 0.1, "nominal", 100)).toEqual([]);
  });
});
