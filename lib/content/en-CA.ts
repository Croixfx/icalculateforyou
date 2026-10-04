import { buildCalculatorStrings } from "./calculatorStrings";
import { buildMultiDebtStrings } from "./multiDebtStrings";
import { buildSiteContent } from "./siteContent";
import { REGIONS } from "./regions";
import type { SiteStrings } from "./types";

export const strings: SiteStrings = {
  meta: {
    title: "Debt Payoff Calculator for Canada | CalculatorHub",
    description:
      "Free debt payoff calculator for Canada. Compare the avalanche and snowball methods, see your payoff date, and calculate total interest in Canadian dollars.",
  },
  header: {
    siteName: "CalculatorHub",
    nav: [
      { label: "Global site", href: "/" },
      { label: "Compare multiple debts", href: "/ca/avalanche-vs-snowball/" },
    ],
  },
  hero: {
    title: "Pay Off Debt Faster",
    subtitle:
      "Build a personalized payoff plan in Canadian dollars using the avalanche or snowball method.",
  },
  calculator: buildCalculatorStrings("US"),
  content: buildSiteContent(REGIONS.ca, "US"),
  multiDebt: buildMultiDebtStrings(REGIONS.ca, "US"),
  footer: {
    disclaimer:
      "This calculator does not constitute financial advice.",
    copyright: "CalculatorHub. All rights reserved.",
    nav: [],
  },
};
