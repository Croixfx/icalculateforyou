import { buildCalculatorStrings } from "./calculatorStrings";
import { buildSiteContent } from "./siteContent";
import { REGIONS } from "./regions";
import type { SiteStrings } from "./types";

export const strings: SiteStrings = {
  meta: {
    title: "Debt Payoff Calculator for the United States | CalculatorHub",
    description:
      "Free debt payoff calculator for the U.S. Compare the avalanche and snowball methods, see your payoff date, and calculate total interest in US dollars.",
  },
  header: {
    siteName: "CalculatorHub",
    nav: [{ label: "Global site", href: "/" }],
  },
  hero: {
    title: "Pay Off Debt Faster",
    subtitle:
      "Build a personalized payoff plan in US dollars using the avalanche or snowball method.",
  },
  calculator: buildCalculatorStrings("US"),
  content: buildSiteContent(REGIONS.us, "US"),
  footer: {
    disclaimer:
      "This calculator is for educational purposes only and does not constitute financial advice.",
    copyright: "CalculatorHub. All rights reserved.",
  },
};
