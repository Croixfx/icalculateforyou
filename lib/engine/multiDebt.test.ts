import { describe, expect, it } from "vitest";
import { multiDebtPlan } from "./multiDebt";
import type { Debt } from "./types";

const divergentDebts: Debt[] = [
  { id: "A", balance: 6000, annualRate: 0.25, rateType: "nominal", minPayment: 120 },
  { id: "B", balance: 1000, annualRate: 0.08, rateType: "nominal", minPayment: 30 },
  { id: "C", balance: 3000, annualRate: 0.15, rateType: "nominal", minPayment: 60 },
];
const divergentBudget = 400;

describe("multiDebtPlan", () => {
  it("avalanche targets the highest rate first", () => {
    const plan = multiDebtPlan(divergentDebts, divergentBudget, "avalanche");
    expect(plan.order).toEqual(["A", "C", "B"]);
    expect(plan.debtFreeMonth).toBe(34);
    expect(plan.totalInterest).toBeCloseTo(2878.8, 0);
  });

  it("snowball targets the smallest balance first", () => {
    const plan = multiDebtPlan(divergentDebts, divergentBudget, "snowball");
    expect(plan.order).toEqual(["B", "C", "A"]);
    expect(plan.debtFreeMonth).toBe(36);
    expect(plan.totalInterest).toBeCloseTo(3884.95, 0);
  });

  it("avalanche never pays more total interest than snowball for the same debts", () => {
    const avalanche = multiDebtPlan(divergentDebts, divergentBudget, "avalanche");
    const snowball = multiDebtPlan(divergentDebts, divergentBudget, "snowball");
    expect(avalanche.totalInterest).toBeLessThanOrEqual(snowball.totalInterest);
  });

  it("every debt reaches a payoff month and totals add up", () => {
    const plan = multiDebtPlan(divergentDebts, divergentBudget, "avalanche");
    expect(plan.debts).toHaveLength(divergentDebts.length);
    for (const entry of plan.debts) {
      expect(entry.payoffMonth).toBeGreaterThan(0);
    }
    const summedInterest = plan.debts.reduce((sum, d) => sum + d.totalInterest, 0);
    expect(summedInterest).toBeCloseTo(plan.totalInterest, 6);
    expect(plan.debtFreeMonth).toBe(Math.max(...plan.debts.map((d) => d.payoffMonth)));
  });

  it("throws a clear error when the budget is below the sum of minimum payments", () => {
    expect(() => multiDebtPlan(divergentDebts, 100, "avalanche")).toThrow(
      /less than the sum of all minimum payments/,
    );
  });

  it("handles a single-debt plan (budget equals engine's single-debt payoff)", () => {
    const debts: Debt[] = [
      { id: "solo", balance: 7000, annualRate: 0.21, rateType: "nominal", minPayment: 50 },
    ];
    const plan = multiDebtPlan(debts, 200, "avalanche");
    expect(plan.order).toEqual(["solo"]);
    expect(plan.debtFreeMonth).toBe(55);
    expect(plan.debts[0].totalInterest).toBeCloseTo(3930, -1);
  });

  it("puts all surplus budget toward the target only, not every debt at once", () => {
    const debts: Debt[] = [
      { id: "A", balance: 100, annualRate: 0.1, rateType: "nominal", minPayment: 10 },
      { id: "B", balance: 50, annualRate: 0.2, rateType: "nominal", minPayment: 10 },
    ];
    const plan = multiDebtPlan(debts, 10000, "avalanche");
    // B has the higher rate so it's the avalanche target and clears in month 1;
    // A only receives its minimum payment until B is gone, so it takes until month 2.
    expect(plan.order).toEqual(["B", "A"]);
    expect(plan.debtFreeMonth).toBe(2);
  });
});
