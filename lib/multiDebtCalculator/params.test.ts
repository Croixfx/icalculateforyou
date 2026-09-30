import { describe, expect, it } from "vitest";
import { buildMultiDebtShareUrl, decodeMultiDebtState, encodeMultiDebtState } from "./params";
import type { MultiDebtFormState } from "./types";

const state: MultiDebtFormState = {
  debts: [
    { id: "a", name: "Card A", balance: "6000", ratePercent: "25", minPayment: "120" },
    { id: "b", name: "Card B", balance: "1000", ratePercent: "8", minPayment: "30" },
  ],
  budget: "400",
  currency: "USD",
};

describe("encodeMultiDebtState / decodeMultiDebtState round trip", () => {
  it("round-trips every debt field, the budget, and the currency", () => {
    const encoded = encodeMultiDebtState(state);
    const decoded = decodeMultiDebtState(encoded);

    expect(decoded.budget).toBe("400");
    expect(decoded.currency).toBe("USD");
    expect(decoded.debts).toHaveLength(2);
    expect(decoded.debts?.[0]).toMatchObject({ name: "Card A", balance: "6000", ratePercent: "25", minPayment: "120" });
    expect(decoded.debts?.[1]).toMatchObject({ name: "Card B", balance: "1000", ratePercent: "8", minPayment: "30" });
  });

  it("accepts a plain query string as well as URLSearchParams", () => {
    const query = encodeMultiDebtState(state).toString();
    expect(decodeMultiDebtState(query).budget).toBe("400");
  });
});

describe("decodeMultiDebtState error tolerance", () => {
  it("ignores a debts param that isn't valid JSON instead of throwing", () => {
    expect(() => decodeMultiDebtState("debts=not-json&budget=400")).not.toThrow();
    const decoded = decodeMultiDebtState("debts=not-json&budget=400");
    expect(decoded.debts).toBeUndefined();
    expect(decoded.budget).toBe("400");
  });

  it("ignores a debts param that's valid JSON but not an array", () => {
    const decoded = decodeMultiDebtState(`debts=${encodeURIComponent(JSON.stringify({ oops: true }))}`);
    expect(decoded.debts).toBeUndefined();
  });

  it("drops individual debts missing a required field instead of failing the whole list", () => {
    const malformed = [
      { name: "Good", balance: "100", rate: "10", minPayment: "20" },
      { name: "Missing balance", rate: "10", minPayment: "20" },
    ];
    const decoded = decodeMultiDebtState(`debts=${encodeURIComponent(JSON.stringify(malformed))}`);
    expect(decoded.debts).toHaveLength(1);
    expect(decoded.debts?.[0].name).toBe("Good");
  });

  it("caps an absurdly long debts array instead of accepting it unbounded", () => {
    const many = Array.from({ length: 500 }, (_, i) => ({
      name: `Debt ${i}`,
      balance: "100",
      rate: "10",
      minPayment: "20",
    }));
    const decoded = decodeMultiDebtState(`debts=${encodeURIComponent(JSON.stringify(many))}`);
    expect(decoded.debts?.length).toBeLessThanOrEqual(20);
  });

  it("drops a malformed currency and uppercases a valid one", () => {
    expect(decodeMultiDebtState("currency=usd").currency).toBe("USD");
    expect(decodeMultiDebtState("currency=US").currency).toBeUndefined();
  });

  it("returns an empty object for an empty query string", () => {
    expect(decodeMultiDebtState("")).toEqual({});
  });

  it("ignores unknown params", () => {
    expect(decodeMultiDebtState("utm_source=newsletter&budget=400")).toEqual({ budget: "400" });
  });
});

describe("buildMultiDebtShareUrl", () => {
  it("appends the encoded query to the base URL", () => {
    const url = buildMultiDebtShareUrl("https://www.calculatorhub.example/avalanche-vs-snowball/", state);
    expect(url.startsWith("https://www.calculatorhub.example/avalanche-vs-snowball/?debts=")).toBe(true);
    expect(url).toContain("budget=400");
    expect(url).toContain("currency=USD");
  });
});
