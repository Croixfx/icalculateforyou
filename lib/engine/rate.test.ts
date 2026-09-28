import { describe, expect, it } from "vitest";
import { monthlyRateFromAnnual } from "./rate";

describe("monthlyRateFromAnnual", () => {
  it("divides by 12 for nominal rates", () => {
    expect(monthlyRateFromAnnual(0.21, "nominal")).toBeCloseTo(0.0175, 10);
  });

  it("compounds for effective rates", () => {
    const expected = Math.pow(1.21, 1 / 12) - 1;
    expect(monthlyRateFromAnnual(0.21, "effective")).toBeCloseTo(expected, 10);
  });

  it("returns 0 for a 0% rate regardless of type", () => {
    expect(monthlyRateFromAnnual(0, "nominal")).toBe(0);
    expect(monthlyRateFromAnnual(0, "effective")).toBe(0);
  });

  it("effective rate is lower than nominal rate for the same annual rate", () => {
    const nominal = monthlyRateFromAnnual(0.21, "nominal");
    const effective = monthlyRateFromAnnual(0.21, "effective");
    expect(effective).toBeLessThan(nominal);
  });

  it("throws on a negative rate", () => {
    expect(() => monthlyRateFromAnnual(-0.05, "nominal")).toThrow();
  });
});
