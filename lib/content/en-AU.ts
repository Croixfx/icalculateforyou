import { buildCalculatorStrings } from "./calculatorStrings";
import { buildSiteContent } from "./siteContent";
import { REGIONS } from "./regions";
import type { SiteStrings } from "./types";

export const strings: SiteStrings = {
  meta: {
    title: "Debt Payoff Calculator for Australia | CalculatorHub",
    description:
      "Free debt payoff calculator for Australia. Compare the avalanche and snowball methods, see your payoff date, and calculate total interest in Australian dollars.",
  },
  header: {
    siteName: "CalculatorHub",
    nav: [{ label: "Global site", href: "/" }],
  },
  hero: {
    title: "Pay Off Debt Faster",
    subtitle:
      "Build a personalised payoff plan in Australian dollars using the avalanche or snowball method.",
  },
  calculator: buildCalculatorStrings("GB"),
  content: buildSiteContent(REGIONS.au, "GB"),
  footer: {
    disclaimer:
      "This calculator does not constitute financial advice.",
    copyright: "CalculatorHub. All rights reserved.",
  },
};
