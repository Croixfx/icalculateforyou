import type { RateType } from "@/lib/engine";

export type CalculatorMode = "duration" | "target";

/**
 * The calculator's form state, kept as raw strings (mirroring <input> values)
 * so there is exactly one place numeric parsing happens — validation.ts —
 * whether a value came from typing or from a shared URL.
 */
export interface CalculatorFormState {
  mode: CalculatorMode;
  balance: string;
  ratePercent: string;
  rateType: RateType;
  payment: string;
  targetDate: string; // "YYYY-MM"
  extraPercent: string;
  currency: string;
}
