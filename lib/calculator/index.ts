export { addMonths, formatMonthYear, interpolate } from "./format";
export { buildShareUrl, decodeFormState, encodeFormState } from "./params";
export type { CalculatorFormState, CalculatorMode } from "./types";
export {
  clampExtraPercent,
  MAX_BALANCE,
  MAX_EXTRA_PERCENT,
  MAX_RATE_PERCENT,
  MAX_TARGET_MONTHS,
  MIN_EXTRA_PERCENT,
  MIN_TARGET_MONTHS,
  parseNumberInput,
  validateBalance,
  validatePayment,
  validateRatePercent,
  validateTargetDate,
} from "./validation";
export type { FieldResult, ValidationError } from "./validation";
