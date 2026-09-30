import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const PAGES = ["/", "/us/", "/uk/", "/ca/", "/au/"];
const MULTI_DEBT_PAGES = [
  "/avalanche-vs-snowball/",
  "/us/avalanche-vs-snowball/",
  "/uk/avalanche-vs-snowball/",
  "/ca/avalanche-vs-snowball/",
  "/au/avalanche-vs-snowball/",
];

for (const path of [...PAGES, ...MULTI_DEBT_PAGES]) {
  test(`${path} has no automatic accessibility violations (default pre-filled state)`, async ({ page }) => {
    await page.goto(path);
    await page.waitForLoadState("networkidle");

    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();

    if (results.violations.length > 0) {
      console.log(`Violations on ${path}:`, JSON.stringify(results.violations, null, 2));
    }
    expect(results.violations, `a11y violations on ${path}`).toEqual([]);
  });
}

test("/us/ has no violations once filled in with results, chart, and schedule showing", async ({ page }) => {
  await page.goto("/us/");
  await page.locator("#balance").fill("7000");
  await page.getByLabel("Interest rate (APR %)").fill("21");
  await page.locator("#payment").fill("200");
  await page.getByLabel("Extra monthly payment").fill("15");
  // Amortization schedule is open by default, so it's already part of this check.
  await page.waitForTimeout(200);

  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();

  if (results.violations.length > 0) {
    console.log("Violations on filled /us/:", JSON.stringify(results.violations, null, 2));
  }
  expect(results.violations, "a11y violations on filled /us/").toEqual([]);
});

test("/us/ has no violations in dark mode", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/us/");
  await page.locator("#balance").fill("7000");
  await page.getByLabel("Interest rate (APR %)").fill("21");
  await page.locator("#payment").fill("200");
  await page.waitForTimeout(200);

  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();

  if (results.violations.length > 0) {
    console.log("Violations on dark /us/:", JSON.stringify(results.violations, null, 2));
  }
  expect(results.violations, "a11y violations on dark /us/").toEqual([]);
});

test("/us/avalanche-vs-snowball/ has no violations once the comparison is showing", async ({ page }) => {
  await page.goto("/us/avalanche-vs-snowball/");
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(200);

  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();

  if (results.violations.length > 0) {
    console.log("Violations on filled /us/avalanche-vs-snowball/:", JSON.stringify(results.violations, null, 2));
  }
  expect(results.violations, "a11y violations on filled /us/avalanche-vs-snowball/").toEqual([]);
});

test("/us/avalanche-vs-snowball/ has no violations in dark mode", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/us/avalanche-vs-snowball/");
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(200);

  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();

  if (results.violations.length > 0) {
    console.log("Violations on dark /us/avalanche-vs-snowball/:", JSON.stringify(results.violations, null, 2));
  }
  expect(results.violations, "a11y violations on dark /us/avalanche-vs-snowball/").toEqual([]);
});
