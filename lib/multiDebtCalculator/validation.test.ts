import { describe, expect, it } from "vitest";
import {
  resolveDebtName,
  sumOfMinPayments,
  validateBudget,
  validateDebtBalance,
  validateDebtMinPayment,
  validateDebtRate,
} from "./validation";
import type { DebtFormRow } from "./types";

describe("validateDebtBalance / validateDebtMinPayment", () => {
  it("accepts a positive amount", () => {
    expect(validateDebtBalance("6000")).toEqual({ ok: true, value: 6000 });
    expect(validateDebtMinPayment("120")).toEqual({ ok: true, value: 120 });
  });

  it("rejects zero, negative, blank, and non-numeric input", () => {
    expect(validateDebtBalance("0").ok).toBe(false);
    expect(validateDebtBalance("-5").ok).toBe(false);
    expect(validateDebtBalance("").ok).toBe(false);
    expect(validateDebtBalance("abc").ok).toBe(false);
  });
});

describe("validateDebtRate", () => {
  it("accepts zero and positive rates", () => {
    expect(validateDebtRate("0")).toEqual({ ok: true, value: 0 });
    expect(validateDebtRate("24.99")).toEqual({ ok: true, value: 24.99 });
  });

  it("rejects a negative rate", () => {
    expect(validateDebtRate("-1").ok).toBe(false);
  });
});

describe("resolveDebtName", () => {
  it("uses the typed name when present", () => {
    expect(resolveDebtName("Car loan", 2)).toBe("Car loan");
  });

  it("trims surrounding whitespace", () => {
    expect(resolveDebtName("  Card A  ", 1)).toBe("Card A");
  });

  it("falls back to a positional placeholder when blank", () => {
    expect(resolveDebtName("", 3)).toBe("Debt 3");
    expect(resolveDebtName("   ", 1)).toBe("Debt 1");
  });
});

describe("sumOfMinPayments", () => {
  it("adds up every debt's minimum payment", () => {
    const debts: DebtFormRow[] = [
      { id: "a", name: "A", balance: "1000", ratePercent: "10", minPayment: "30" },
      { id: "b", name: "B", balance: "2000", ratePercent: "5", minPayment: "50" },
    ];
    expect(sumOfMinPayments(debts)).toBe(80);
  });

  it("treats an invalid minimum payment as 0 rather than throwing", () => {
    const debts: DebtFormRow[] = [
      { id: "a", name: "A", balance: "1000", ratePercent: "10", minPayment: "not a number" },
      { id: "b", name: "B", balance: "2000", ratePercent: "5", minPayment: "50" },
    ];
    expect(sumOfMinPayments(debts)).toBe(50);
  });

  it("returns 0 for an empty debt list", () => {
    expect(sumOfMinPayments([])).toBe(0);
  });
});

describe("validateBudget", () => {
  it("accepts a budget at or above the minimum required", () => {
    expect(validateBudget("400", 400)).toEqual({ ok: true, value: 400 });
    expect(validateBudget("500", 400)).toEqual({ ok: true, value: 500 });
  });

  it("reports how much more is needed when below the combined minimums", () => {
    expect(validateBudget("300", 400)).toEqual({ ok: false, error: { code: "belowMinimum", min: 400 } });
  });

  it("still reports ordinary invalid-number errors before checking the minimum", () => {
    expect(validateBudget("", 400)).toEqual({ ok: false, error: { code: "required" } });
    expect(validateBudget("not a number", 400)).toEqual({ ok: false, error: { code: "notANumber" } });
    expect(validateBudget("-10", 400)).toEqual({ ok: false, error: { code: "mustBePositive" } });
  });
});
