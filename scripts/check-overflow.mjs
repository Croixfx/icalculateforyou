// One-off check (not part of the test suite): scans every page at every
// breakpoint, empty and filled with the what-if slider active, for
// horizontal overflow (scrollWidth > clientWidth) — the same class of bug
// as the what-if row that clipped its dollar amount off-screen at 375px.
import { chromium } from "@playwright/test";

const BASE_URL = "http://localhost:4173";
const PAGES = ["/", "/us/", "/uk/", "/ca/", "/au/"];
const MULTI_DEBT_PAGES = [
  "/avalanche-vs-snowball/",
  "/us/avalanche-vs-snowball/",
  "/uk/avalanche-vs-snowball/",
  "/ca/avalanche-vs-snowball/",
  "/au/avalanche-vs-snowball/",
];
const WIDTHS = [375, 768, 1280];

const browser = await chromium.launch();
let anyOverflow = false;

async function checkOverflow(path, width, colorScheme, fill) {
  const context = await browser.newContext({ viewport: { width, height: 900 }, colorScheme });
  const page = await context.newPage();
  await page.goto(`${BASE_URL}${path}`);
  await page.waitForLoadState("networkidle");
  await fill(page);
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

for (const path of PAGES) {
  for (const width of WIDTHS) {
    for (const colorScheme of ["light", "dark"]) {
      await checkOverflow(path, width, colorScheme, async (page) => {
        await page.locator("#balance").fill("7000");
        await page.getByLabel("Interest rate (APR %)").fill("21");
        await page.locator("#payment").fill("200");
        await page.getByLabel("Extra monthly payment").fill("15");
        await page.locator("summary").last().click(); // "Show amortization/amortisation schedule" (spelling varies by region)
      });
    }
  }
}

for (const path of MULTI_DEBT_PAGES) {
  for (const width of WIDTHS) {
    for (const colorScheme of ["light", "dark"]) {
      await checkOverflow(path, width, colorScheme, async (page) => {
        // Default state already has 3 pre-filled debts and a working
        // comparison; also exercise a long typed debt name, since that's the
        // one field with no character cap.
        await page.locator("[id^='name-']").first().fill("A fairly long credit card name to stress-test wrapping");
      });
    }
  }
}

await browser.close();
console.log(anyOverflow ? "\nFAIL: overflow found" : "\nOK: no horizontal overflow on any page/width/theme");
process.exit(anyOverflow ? 1 : 0);
