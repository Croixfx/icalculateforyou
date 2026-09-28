import { describe, expect, it } from "vitest";
import {
  clampExtraPercent,
  MAX_BALANCE,
  MAX_RATE_PERCENT,
  MAX_TARGET_MONTHS,
  parseNumberInput,
  validateBalance,
  validatePayment,
  validateRatePercent,
  validateTargetDate,
} from "./validation";

describe("parseNumberInput", () => {
  it("parses a plain number", () => {
    expect(parseNumberInput("7000")).toBe(7000);
  });

  it("strips thousands separators", () => {
    expect(parseNumberInput("7,000.50")).toBe(7000.5);
  });

  it("trims surrounding whitespace", () => {
    expect(parseNumberInput("  200  ")).toBe(200);
  });

  it("returns null for an empty string", () => {
    expect(parseNumberInput("")).toBeNull();
    expect(parseNumberInput("   ")).toBeNull();
  });

  it("returns null for non-numeric text", () => {
    expect(parseNumberInput("abc")).toBeNull();
    expect(parseNumberInput("12abc")).toBeNull();
  });

  it("returns null for Infinity / NaN spellings", () => {
    expect(parseNumberInput("Infinity")).toBeNull();
    expect(parseNumberInput("NaN")).toBeNull();
  });
});

describe("validateBalance", () => {
  it("accepts a positive balance", () => {
    expect(validateBalance("7000")).toEqual({ ok: true, value: 7000 });
  });

  it("rejects an empty value as required", () => {
    expect(validateBalance("")).toEqual({ ok: false, error: { code: "required" } });
  });

  it("rejects non-numeric text", () => {
    expect(validateBalance("abc")).toEqual({ ok: false, error: { code: "notANumber" } });
  });

  it("rejects zero and negative balances", () => {
    expect(validateBalance("0")).toEqual({ ok: false, error: { code: "mustBePositive" } });
    expect(validateBalance("-100")).toEqual({ ok: false, error: { code: "mustBePositive" } });
  });

  it("rejects a balance above the sane maximum", () => {
    expect(validateBalance(String(MAX_BALANCE + 1))).toEqual({
      ok: false,
      error: { code: "tooLarge", max: MAX_BALANCE },
    });
  });
});

describe("validateRatePercent", () => {
  it("accepts 0% (an interest-free debt)", () => {
    expect(validateRatePercent("0")).toEqual({ ok: true, value: 0 });
  });

  it("rejects a negative rate", () => {
    expect(validateRatePercent("-1")).toEqual({ ok: false, error: { code: "mustBePositive" } });
  });

  it("rejects a rate above the sane maximum", () => {
    expect(validateRatePercent(String(MAX_RATE_PERCENT + 1))).toEqual({
      ok: false,
      error: { code: "tooLarge", max: MAX_RATE_PERCENT },
    });
  });
});

describe("validatePayment", () => {
  it("accepts a payment that covers the monthly interest", () => {
    // 7000 balance at 21% nominal -> 1.75%/month -> $122.50 interest
    const result = validatePayment("200", { balance: 7000, ratePercent: 21, rateType: "nominal" });
    expect(result).toEqual({ ok: true, value: 200 });
  });

  it("rejects a payment that doesn't cover monthly interest, with the minimum needed", () => {
    const result = validatePayment("100", { balance: 7000, ratePercent: 21, rateType: "nominal" });
    expect(result.ok).toBe(false);
    if (!result.ok && result.error.code === "paymentTooLow") {
      expect(result.error.minPayment).toBeCloseTo(122.5, 5);
    } else {
      throw new Error("expected a paymentTooLow error");
    }
  });

  it("accepts any positive payment at 0% interest", () => {
    expect(validatePayment("10", { balance: 7000, ratePercent: 0, rateType: "nominal" })).toEqual({
      ok: true,
      value: 10,
    });
  });

  it("rejects a zero or negative payment", () => {
    expect(validatePayment("0", { balance: 7000, ratePercent: 21, rateType: "nominal" })).toEqual({
      ok: false,
      error: { code: "mustBePositive" },
    });
  });
});

describe("validateTargetDate", () => {
  const now = new Date(2026, 8, 28); // 2026-09-28, matches the harness clock this feature was built against

  it("computes whole months to a future date", () => {
    expect(validateTargetDate("2028-09", now)).toEqual({ ok: true, value: 24 });
  });

  it("accepts next month as the minimum valid target", () => {
    expect(validateTargetDate("2026-10", now)).toEqual({ ok: true, value: 1 });
  });

  it("rejects the current month and past dates as not in the future", () => {
    expect(validateTargetDate("2026-09", now)).toEqual({ ok: false, error: { code: "dateNotInFuture" } });
    expect(validateTargetDate("2020-01", now)).toEqual({ ok: false, error: { code: "dateNotInFuture" } });
  });

  it("rejects a target date beyond the maximum horizon", () => {
    const result = validateTargetDate("2100-01", now);
    expect(result).toEqual({ ok: false, error: { code: "dateTooFar", maxMonths: MAX_TARGET_MONTHS } });
  });

  it("rejects malformed input", () => {
    expect(validateTargetDate("", now)).toEqual({ ok: false, error: { code: "required" } });
    expect(validateTargetDate("not-a-date", now)).toEqual({ ok: false, error: { code: "notANumber" } });
    expect(validateTargetDate("2026-13", now)).toEqual({ ok: false, error: { code: "notANumber" } });
  });
});

describe("clampExtraPercent", () => {
  it("passes through a value already in range", () => {
    expect(clampExtraPercent("25")).toBe(25);
  });

  it("clamps above the maximum down to 50", () => {
    expect(clampExtraPercent("999")).toBe(50);
  });

  it("clamps below zero up to 0", () => {
    expect(clampExtraPercent("-10")).toBe(0);
  });

  it("treats invalid input as 0", () => {
    expect(clampExtraPercent("abc")).toBe(0);
    expect(clampExtraPercent("")).toBe(0);
  });
});
