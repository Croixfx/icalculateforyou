import { buildCalculatorStrings } from "./calculatorStrings";
import { buildMultiDebtStrings } from "./multiDebtStrings";
import { buildSiteContent } from "./siteContent";
import { REGIONS } from "./regions";
import type { SiteStrings } from "./types";

export const strings: SiteStrings = {
  meta: {
    title: "Debt Payoff Calculator for the UK | CalculatorHub",
    description:
      "Free debt payoff calculator for the UK. Compare the avalanche and snowball methods, see your payoff date, and calculate total interest in pounds sterling.",
  },
  header: {
    siteName: "CalculatorHub",
    nav: [
      { label: "Global site", href: "/" },
      { label: "Compare multiple debts", href: "/uk/avalanche-vs-snowball/" },
    ],
  },
  hero: {
    title: "Pay Off Debt Faster",
    subtitle:
      "Build a personalised payoff plan in pounds sterling using the avalanche or snowball method.",
  },
  calculator: buildCalculatorStrings("GB"),
  content: buildSiteContent(REGIONS.uk, "GB"),
  multiDebt: buildMultiDebtStrings(REGIONS.uk, "GB"),
  footer: {
    disclaimer:
      "This calculator does not constitute financial advice.",
    copyright: "CalculatorHub. All rights reserved.",
    nav: [],
  },
};
