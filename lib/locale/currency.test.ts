import { describe, expect, it } from "vitest";
import { formatCurrency, getCurrencyFractionDigits, roundForDisplay } from "./currency";

describe("formatCurrency", () => {
  it("formats USD (en-US)", () => {
    expect(formatCurrency(1234.5, "USD", "en-US")).toBe("$1,234.50");
  });

  it("formats GBP (en-GB)", () => {
    expect(formatCurrency(1234.5, "GBP", "en-GB")).toBe("£1,234.50");
  });

  it("formats EUR in German format (de-DE): comma decimal, dot grouping", () => {
    expect(formatCurrency(1234.5, "EUR", "de-DE")).toBe("1.234,50 €");
  });

  it("formats JPY with zero decimal places (ja-JP)", () => {
    expect(formatCurrency(1234, "JPY", "ja-JP")).toBe("￥1,234");
    expect(formatCurrency(1234.9, "JPY", "ja-JP")).toBe("￥1,235");
  });

  it("formats INR with Indian digit grouping (en-IN)", () => {
    expect(formatCurrency(1234567.89, "INR", "en-IN")).toBe("₹12,34,567.89");
  });

  it("formats CAD (en-CA)", () => {
    expect(formatCurrency(1234.5, "CAD", "en-CA")).toBe("$1,234.50");
  });

  it("formats AUD (en-AU)", () => {
    expect(formatCurrency(1234.5, "AUD", "en-AU")).toBe("$1,234.50");
  });
});

describe("getCurrencyFractionDigits", () => {
  it("returns 2 for USD/EUR/GBP", () => {
    expect(getCurrencyFractionDigits("USD")).toBe(2);
    expect(getCurrencyFractionDigits("EUR")).toBe(2);
    expect(getCurrencyFractionDigits("GBP")).toBe(2);
  });

  it("returns 0 for JPY", () => {
    expect(getCurrencyFractionDigits("JPY")).toBe(0);
  });

  it("returns 3 for a three-decimal currency (BHD)", () => {
    expect(getCurrencyFractionDigits("BHD")).toBe(3);
  });
});

describe("roundForDisplay", () => {
  it("rounds to 2 decimals for USD", () => {
    expect(roundForDisplay(19.9951, "USD")).toBe(20);
    expect(roundForDisplay(19.994, "USD")).toBe(19.99);
  });

  it("rounds to whole numbers for JPY", () => {
    expect(roundForDisplay(1234.6, "JPY")).toBe(1235);
  });

  it("never mutates the raw calculation value it's given", () => {
    const raw = 1929.6623994796114;
    const rounded = roundForDisplay(raw, "USD");
    expect(raw).toBe(1929.6623994796114);
    expect(rounded).toBe(1929.66);
  });
});
