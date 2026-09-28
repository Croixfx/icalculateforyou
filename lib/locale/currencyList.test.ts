import { describe, expect, it } from "vitest";
import { getCurrencyDisplayName, getCurrencyOptions, getSupportedCurrencies } from "./currencyList";

describe("getSupportedCurrencies", () => {
  it("includes our four SEO-focus currencies and other major currencies", () => {
    const currencies = getSupportedCurrencies();
    for (const code of ["USD", "GBP", "CAD", "AUD", "EUR", "JPY", "INR"]) {
      expect(currencies).toContain(code);
    }
  });

  it("returns a large ISO 4217 list, not just our curated region map", () => {
    expect(getSupportedCurrencies().length).toBeGreaterThan(100);
  });
});

describe("getCurrencyDisplayName", () => {
  it("returns a human-readable name", () => {
    expect(getCurrencyDisplayName("JPY", "en")).toBe("Japanese Yen");
    expect(getCurrencyDisplayName("USD", "en")).toBe("US Dollar");
  });

  it("falls back to the raw code for an unrecognized value instead of throwing", () => {
    expect(getCurrencyDisplayName("ZZZ", "en")).toBe("ZZZ");
  });
});

describe("getCurrencyOptions", () => {
  it("returns one option per supported currency, each with a code and name", () => {
    const options = getCurrencyOptions("en");
    expect(options.length).toBe(getSupportedCurrencies().length);
    const usd = options.find((o) => o.code === "USD");
    expect(usd?.name).toBe("US Dollar");
  });

  it("is sorted by display name", () => {
    const names = getCurrencyOptions("en").map((o) => o.name);
    const sorted = [...names].sort((a, b) => a.localeCompare(b, "en"));
    expect(names).toEqual(sorted);
  });
});
