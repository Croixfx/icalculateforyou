import type { RateType } from "./types";

/**
 * Converts an annual rate to an effective monthly rate.
 * "nominal": annual rate compounded monthly (rate / 12).
 * "effective": effective annual rate ((1 + rate)^(1/12) - 1).
 */
export function monthlyRateFromAnnual(annualRate: number, rateType: RateType): number {
  if (annualRate < 0) {
    throw new Error("annualRate must not be negative");
  }
  if (rateType === "nominal") {
    return annualRate / 12;
  }
  return Math.pow(1 + annualRate, 1 / 12) - 1;
}
