import type { CalculatorStrings } from "./types";

export type Spelling = "US" | "GB";

/**
 * Calculator UI copy barely varies by region — mostly the "amortization" /
 * "amortisation" spelling — so it's generated once per spelling variant
 * instead of duplicated across all five content files.
 */
export function buildCalculatorStrings(spelling: Spelling): CalculatorStrings {
  const amortization = spelling === "GB" ? "amortisation" : "amortization";

  return {
    modeDuration: "How long will it take?",
    modeTarget: "Pay off by a date",
    balanceLabel: "Balance",
    ratePercentLabel: "Interest rate (APR %)",
    paymentLabel: "Monthly payment",
    targetDateLabel: "Target payoff date",
    currencyLabel: "Currency",
    advancedToggle: "Advanced",
    rateTypeLabel: "Rate type",
    rateTypeNominal: "Nominal (compounded monthly)",
    rateTypeEffective: "Effective annual rate",
    resultsHeading: "Results",
    debtFreeDateLabel: "Debt-free date",
    monthsLabel: "Months to pay off",
    totalInterestLabel: "Total interest",
    totalPaidLabel: "Total paid",
    requiredPaymentLabel: "Required monthly payment",
    paymentTooLowMessage:
      "That payment won't cover the interest each month, so the balance would never go down. You'll need at least {min} a month.",
    errorRequired: "Enter a value.",
    errorNotANumber: "Enter a valid number.",
    errorMustBePositive: "Enter a number greater than 0.",
    errorTooLarge: "Enter a number no larger than {max}.",
    errorDateNotInFuture: "Choose a date at least one month from now.",
    errorDateTooFar: "Choose a date within the next {years} years.",
    errorTooSlow: "That can't be calculated with these numbers — try a higher payment, a shorter target, or a lower rate.",
    whatIfHeading: "What if you paid more?",
    whatIfLabel: "Extra monthly payment",
    whatIfMonthsSaved: "months sooner",
    whatIfInterestSaved: "less interest",
    chartTitle: "Balance over time",
    chartBaselineLabel: "Your plan",
    chartWhatIfLabel: "With extra payment",
    chartYAxisLabel: "Remaining balance",
    chartXAxisLabel: "Months",
    scheduleToggleShow: `Show ${amortization} schedule`,
    scheduleToggleHide: `Hide ${amortization} schedule`,
    scheduleMonthHeader: "Month",
    schedulePaymentHeader: "Payment",
    scheduleInterestHeader: "Interest",
    schedulePrincipalHeader: "Principal",
    scheduleBalanceHeader: "Balance",
    copyLinkButton: "Copy link to this result",
    copyLinkCopied: "Link copied",
  };
}
