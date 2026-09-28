// One-off check (not part of the test suite): scans every page at every
// breakpoint, empty and filled with the what-if slider active, for
// horizontal overflow (scrollWidth > clientWidth) — the same class of bug
// as the what-if row that clipped its dollar amount off-screen at 375px.
import { chromium } from "@playwright/test";

const BASE_URL = "http://localhost:4173";
const PAGES = ["/", "/us/", "/uk/", "/ca/", "/au/"];
const WIDTHS = [375, 768, 1280];

const browser = await chromium.launch();
let anyOverflow = false;

for (const path of PAGES) {
  for (const width of WIDTHS) {
    for (const colorScheme of ["light", "dark"]) {
      const context = await browser.newContext({ viewport: { width, height: 900 }, colorScheme });
      const page = await context.newPage();
      await page.goto(`${BASE_URL}${path}`);
      await page.waitForLoadState("networkidle");

      await page.locator("#balance").fill("7000");
      await page.getByLabel("Interest rate (APR %)").fill("21");
      await page.locator("#payment").fill("200");
      await page.getByLabel("Extra monthly payment").fill("15");
      await page.locator("summary").last().click(); // "Show amortization/amortisation schedule" (spelling varies by region)
      await page.waitForTimeout(150);

      const overflow = await page.evaluate(() => {
        const el = document.documentElement;
        return { scrollWidth: el.scrollWidth, clientWidth: el.clientWidth };
      });

      if (overflow.scrollWidth > overflow.clientWidth) {
        anyOverflow = true;
        console.log(
          `OVERFLOW ${path} @${width}px ${colorScheme}: scrollWidth=${overflow.scrollWidth} > clientWidth=${overflow.clientWidth}`,
        );
      }
      await context.close();
    }
  }
}

await browser.close();
console.log(anyOverflow ? "\nFAIL: overflow found" : "\nOK: no horizontal overflow on any page/width/theme");
process.exit(anyOverflow ? 1 : 0);
