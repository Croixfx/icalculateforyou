import { expect, test, type Page } from "@playwright/test";

// "Balance" is also a substring of the payoff chart's aria-label ("Balance
// over time: ..."), so getByLabel("Balance") is ambiguous once the chart is
// showing. #balance is the input's id and is always unambiguous.
function balanceInput(page: Page) {
  return page.locator("#balance");
}

const results = (page: Page) => page.locator("dl").first();

test.describe("debt payoff calculator (US region)", () => {
  test.use({ permissions: ["clipboard-read", "clipboard-write"] });

  test("duration mode: entering balance/rate/payment shows live results", async ({ page }) => {
    await page.goto("/us/");

    await balanceInput(page).fill("7000");
    await page.getByLabel("Interest rate (APR %)").fill("21");
    await page.locator("#payment").fill("200");

    await expect(page.getByText("Results", { exact: true })).toBeVisible();
    await expect(results(page).getByText("55", { exact: true })).toBeVisible(); // months
    await expect(results(page).getByText(/^\$3,9\d\d\.\d\d$/)).toBeVisible(); // total interest ~$3,930
  });

  test("payment too low shows a friendly minimum-payment message, not a raw error", async ({ page }) => {
    await page.goto("/us/");
    await balanceInput(page).fill("7000");
    await page.getByLabel("Interest rate (APR %)").fill("21");
    await page.locator("#payment").fill("50");

    const message = page.getByText("won't cover the interest");
    await expect(message).toBeVisible();
    await expect(message).toContainText("$122.50");
  });

  test("advanced section: switching to effective rate changes the result", async ({ page }) => {
    await page.goto("/us/");
    await balanceInput(page).fill("7000");
    await page.getByLabel("Interest rate (APR %)").fill("21");
    await page.locator("#payment").fill("200");

    const monthsBefore = await results(page).locator("dd").nth(1).innerText();

    await page.getByText("Advanced", { exact: true }).click();
    await page.getByLabel("Effective annual rate").check();

    const monthsAfter = await results(page).locator("dd").nth(1).innerText();
    expect(monthsAfter).not.toBe(monthsBefore);
  });

  test("target mode: entering a target date shows the required payment", async ({ page }) => {
    await page.goto("/us/");
    await page.getByRole("tab", { name: "Pay off by a date" }).click();
    await balanceInput(page).fill("5000");
    await page.getByLabel("Interest rate (APR %)").fill("15");
    await page.getByLabel("Target payoff date").fill("2028-06");

    await expect(page.getByText("Required monthly payment")).toBeVisible();
  });

  test("what-if slider shows months and interest saved", async ({ page }) => {
    await page.goto("/us/");
    await balanceInput(page).fill("7000");
    await page.getByLabel("Interest rate (APR %)").fill("21");
    await page.locator("#payment").fill("200");

    const slider = page.getByLabel("Extra monthly payment");
    await slider.fill("20");

    await expect(page.getByText("months sooner")).toBeVisible();
    await expect(page.getByText("less interest")).toBeVisible();
  });

  test("payoff chart renders an SVG with two series once what-if is active", async ({ page }) => {
    await page.goto("/us/");
    await balanceInput(page).fill("7000");
    await page.getByLabel("Interest rate (APR %)").fill("21");
    await page.locator("#payment").fill("200");
    await page.getByLabel("Extra monthly payment").fill("20");

    const chart = page.locator("svg[role='img']");
    await expect(chart).toBeVisible();
    await expect(chart.locator("path")).toHaveCount(2);
  });

  test("amortization schedule is open by default and can be collapsed", async ({ page }) => {
    await page.goto("/us/");
    await balanceInput(page).fill("7000");
    await page.getByLabel("Interest rate (APR %)").fill("21");
    await page.locator("#payment").fill("200");

    const table = page.locator("table");
    await expect(table).toBeVisible();
    await expect(page.getByText("Hide amortization schedule")).toBeVisible();

    await page.getByText("Hide amortization schedule").click();
    await expect(table).toBeHidden();
    await expect(page.getByText("Show amortization schedule")).toBeVisible();
  });

  test("currency selector changes the displayed currency", async ({ page }) => {
    await page.goto("/us/");
    await balanceInput(page).fill("7000");
    await page.getByLabel("Interest rate (APR %)").fill("21");
    await page.locator("#payment").fill("200");

    await expect(results(page).getByText(/^\$3,9\d\d\.\d\d$/)).toBeVisible();

    await page.getByLabel("Currency").selectOption("JPY");
    await expect(results(page).getByText(/^¥3,9\d\d$/)).toBeVisible();
  });

  test("copy link button copies a URL containing the entered values", async ({ page }) => {
    await page.goto("/us/");
    await balanceInput(page).fill("7000");
    await page.getByLabel("Interest rate (APR %)").fill("21");
    await page.locator("#payment").fill("200");

    await page.getByRole("button", { name: "Copy link to this result" }).click();
    await expect(page.getByText("Link copied")).toBeVisible();

    const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboardText).toContain("balance=7000");
    expect(clipboardText).toContain("rate=21");
    expect(clipboardText).toContain("payment=200");
  });

  test("a shared link restores the same inputs and results on load", async ({ page }) => {
    await page.goto("/us/?mode=duration&balance=7000&rate=21&rateType=nominal&payment=200&currency=USD");
    await page.waitForTimeout(300);

    await expect(balanceInput(page)).toHaveValue("7000");
    await expect(page.getByLabel("Interest rate (APR %)")).toHaveValue("21");
    await expect(page.locator("#payment")).toHaveValue("200");
    await expect(results(page).getByText(/^\$3,9\d\d\.\d\d$/)).toBeVisible();
  });

  test("form is pre-filled with an example so results are visible on load, no scrolling or typing required", async ({
    page,
  }) => {
    await page.goto("/us/");
    await expect(page.getByText("Enter a value")).toHaveCount(0);
    await expect(balanceInput(page)).toHaveValue("7000");
    await expect(page.getByLabel("Interest rate (APR %)")).toHaveValue("21");
    await expect(page.locator("#payment")).toHaveValue("200");
    await expect(page.getByText("Results", { exact: true })).toBeVisible();

    // The results panel must be within the initial viewport (no scroll needed).
    const viewportHeight = page.viewportSize()?.height ?? 0;
    const box = await page.getByText("Results", { exact: true }).boundingBox();
    expect(box).not.toBeNull();
    expect(box!.y + box!.height).toBeLessThanOrEqual(viewportHeight);
  });
});

test.describe("calculator smoke test on other regions", () => {
  for (const [path, currencySymbol] of [
    ["/uk/", "£"],
    ["/ca/", "$"],
    ["/au/", "$"],
    ["/", "$"],
  ] as const) {
    test(`${path} calculator computes results in the region's default currency`, async ({ page }) => {
      await page.goto(path);
      await balanceInput(page).fill("7000");
      await page.getByLabel("Interest rate (APR %)").fill("21");
      await page.locator("#payment").fill("200");

      await expect(page.getByText("Results", { exact: true })).toBeVisible();
      const pattern = new RegExp(`^\\${currencySymbol}3,9\\d\\d\\.\\d\\d$`);
      await expect(results(page).getByText(pattern)).toBeVisible();
    });
  }
});
