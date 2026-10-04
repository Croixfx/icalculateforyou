import type { RegionConfig } from "./types";
import type { Spelling } from "./calculatorStrings";
import type { MultiDebtPageStrings } from "./types";

/**
 * Copy for the avalanche-vs-snowball multi-debt page. Mirrors the split used
 * for the single-debt calculator: most of it only varies by spelling
 * (buildCalculatorStrings), with just meta/hero personalized per region
 * (buildSiteContent) - generated once per call instead of duplicated across
 * all five content files.
 */
export function buildMultiDebtStrings(region: RegionConfig, spelling: Spelling): MultiDebtPageStrings {
  const personalized = spelling === "GB" ? "personalised" : "personalized";
  const organizing = spelling === "GB" ? "organising" : "organizing";
  const forRegion = region.key === "default" ? "" : ` for ${region.countryName}`;
  const inCurrency = region.key === "default" ? "any currency" : region.currency;

  return {
    meta: {
      title: `Avalanche vs. Snowball: Multi-Debt Payoff Calculator${forRegion} | CalculatorHub`,
      description: `Compare the avalanche and snowball methods across all your debts at once${forRegion}. See which one is cheaper, how much it saves, and when you'll be debt-free in ${inCurrency}.`,
    },
    hero: {
      title: "Avalanche vs. Snowball",
      subtitle: `Add every debt you're ${organizing} at once, set a monthly budget, and see a ${personalized} side-by-side comparison of both payoff strategies.`,
    },
    calculator: {
      debtsHeading: "Your debts",
      debtNameLabel: "Debt name",
      debtNamePlaceholder: "Debt {n}",
      debtBalanceLabel: "Balance",
      debtRateLabel: "Interest rate (APR %)",
      debtMinPaymentLabel: "Minimum payment",
      addDebtButton: "Add another debt",
      removeDebtButton: "Remove {name}",
      currencyLabel: "Currency",

      budgetHeading: "Total monthly budget",
      budgetLabel: "How much can you put toward all debts combined each month?",
      budgetTooLowMessage:
        "That's less than the combined minimum payments on these debts. You'll need at least {min} a month before any extra can go toward paying them down faster.",

      comparisonHeading: "Avalanche vs. snowball",
      avalancheHeading: "Avalanche",
      avalancheDescription: "Extra money goes to the highest interest rate first.",
      snowballHeading: "Snowball",
      snowballDescription: "Extra money goes to the smallest balance first.",
      debtFreeDateLabel: "Debt-free date",
      totalInterestLabel: "Total interest",
      payoffOrderLabel: "Payoff order",
      clearedInMonthLabel: "cleared month {month}",
      winnerMessage: "{method} saves you {amount} ({percent}) in total interest compared to the other method.",
      tieMessage: "Both methods cost about the same in total interest for these debts.",
      motivationNote:
        "Avalanche always saves the same or more in interest, since it targets the most expensive debt first. Snowball can still be worth it if clearing whole debts quickly - even smaller ones - is what keeps you motivated to stick with the plan.",

      chartTitle: "Total remaining debt over time",
      chartXAxisLabel: "Months",
      chartAvalancheLabel: "Avalanche",
      chartSnowballLabel: "Snowball",

      errorRequired: "Enter a value.",
      errorNotANumber: "Enter a valid number.",
      errorMustBePositive: "Enter a number greater than 0.",
      errorTooLarge: "Enter a number no larger than {max}.",

      copyLinkButton: "Copy link to this comparison",
      copyLinkCopied: "Link copied",
    },
    content: {
      explainerHeading: "How to use this comparison",
      explainerBody:
        "Add every debt you're carrying — balance, interest rate, and minimum payment — then set the total amount you can put toward all of them each month. That budget has to cover every minimum payment combined; whatever's left over goes entirely to one debt at a time. Avalanche puts it toward whichever debt has the highest interest rate; snowball puts it toward whichever has the smallest balance. Once a targeted debt clears, its minimum payment joins the leftover budget and moves to the next one in line, so the extra payment toward the current target grows every time a debt is paid off. Avalanche always matches or beats snowball on total interest, since it pays down the most expensive debt first — but snowball clears individual debts faster, which can make it easier to stick with if seeing quick wins is what keeps you going.",
    },
  };
}
