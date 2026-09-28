// One-off visual verification script (not part of the test suite). Captures
// the /us/ page at three breakpoints in both themes, empty and filled in,
// so they can be eyeballed for cramped/misaligned layout.
import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";

const OUT_DIR = process.argv[2] ?? "./screenshots";
const BASE_URL = "http://localhost:4173";
const VIEWPORTS = [
  { name: "375", width: 375, height: 900 },
  { name: "768", width: 768, height: 1100 },
  { name: "1280", width: 1280, height: 1100 },
];

await mkdir(OUT_DIR, { recursive: true });

const browser = await chromium.launch();

for (const scheme of ["light", "dark"]) {
  for (const viewport of VIEWPORTS) {
    const context = await browser.newContext({ viewport, colorScheme: scheme });
    const page = await context.newPage();

    await page.goto(`${BASE_URL}/us/`);
    await page.waitForLoadState("networkidle");
    await page.screenshot({
      path: `${OUT_DIR}/us-${scheme}-${viewport.name}-empty.png`,
      fullPage: true,
    });

    await page.locator("#balance").fill("7000");
    await page.getByLabel("Interest rate (APR %)").fill("21");
    await page.locator("#payment").fill("200");
    await page.getByLabel("Extra monthly payment").fill("15");
    await page.waitForTimeout(200);
    await page.screenshot({
      path: `${OUT_DIR}/us-${scheme}-${viewport.name}-filled.png`,
      fullPage: true,
    });

    await context.close();
  }
}

// Also grab the root page (nav differs) and the amortization table open, at one size.
{
  const context = await browser.newContext({ viewport: VIEWPORTS[0], colorScheme: "light" });
  const page = await context.newPage();
  await page.goto(`${BASE_URL}/`);
  await page.waitForLoadState("networkidle");
  await page.screenshot({ path: `${OUT_DIR}/root-light-375-empty.png`, fullPage: true });
  await context.close();
}
{
  const context = await browser.newContext({ viewport: VIEWPORTS[2], colorScheme: "light" });
  const page = await context.newPage();
  await page.goto(`${BASE_URL}/us/`);
  await page.locator("#balance").fill("7000");
  await page.getByLabel("Interest rate (APR %)").fill("21");
  await page.locator("#payment").fill("200");
  await page.getByText("Show amortization schedule").click();
  await page.waitForTimeout(200);
  await page.screenshot({ path: `${OUT_DIR}/us-light-1280-schedule-open.png`, fullPage: true });
  await context.close();
}

await browser.close();
console.log("Screenshots saved to", OUT_DIR);
