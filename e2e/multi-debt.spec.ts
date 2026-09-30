import { expect, test, type Page } from "@playwright/test";

function debtRows(page: Page) {
  return page.locator("[id^='name-']");
}

function removeButtons(page: Page) {
  return page.locator("button[aria-label^='Remove']");
}

test.describe("avalanche-vs-snowball calculator", () => {
  test.use({ permissions: ["clipboard-read", "clipboard-write"] });

  test("starts with 3 example debts pre-filled and a working comparison", async ({ page }) => {
    await page.goto("/us/avalanche-vs-snowball/");
    await expect(debtRows(page)).toHaveCount(3);
    await expect(page.getByText("Avalanche vs. snowball", { exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Avalanche", exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Snowball", exact: true })).toBeVisible();
  });

  test("adding a debt appends a new blank row", async ({ page }) => {
    await page.goto("/us/avalanche-vs-snowball/");
    await page.getByText("+ Add another debt").click();
    await expect(debtRows(page)).toHaveCount(4);
    await expect(debtRows(page).nth(3)).toHaveValue("");
  });

  test("removing a debt drops that row and recomputes the comparison", async ({ page }) => {
    await page.goto("/us/avalanche-vs-snowball/");
    const firstName = await debtRows(page).first().inputValue();
    await removeButtons(page).first().click();
    await expect(debtRows(page)).toHaveCount(2);
    const names = await debtRows(page).evaluateAll((inputs) => inputs.map((el) => (el as HTMLInputElement).value));
    expect(names).not.toContain(firstName);
  });

  test("the remove button disables once only one debt is left", async ({ page }) => {
    await page.goto("/us/avalanche-vs-snowball/");
    await removeButtons(page).first().click();
    await removeButtons(page).first().click();
    await expect(debtRows(page)).toHaveCount(1);
    await expect(removeButtons(page).first()).toBeDisabled();
  });

  test("an invalid balance shows an inline error and hides the comparison", async ({ page }) => {
    await page.goto("/us/avalanche-vs-snowball/");
    await page.locator("[id^='balance-']").first().fill("-500");
    await expect(page.getByText("Enter a number greater than 0.")).toBeVisible();
    await expect(page.getByText("Avalanche vs. snowball", { exact: true })).toHaveCount(0);
  });

  test("a non-numeric interest rate shows an inline error", async ({ page }) => {
    await page.goto("/us/avalanche-vs-snowball/");
    await page.locator("[id^='rate-']").first().fill("not a number");
    await expect(page.getByText("Enter a valid number.")).toBeVisible();
  });

  test("a blank debt name falls back to a placeholder in the results instead of blocking the comparison", async ({ page }) => {
    await page.goto("/us/avalanche-vs-snowball/");
    await page.locator("[id^='name-']").first().fill("");
    await expect(page.getByText("Avalanche vs. snowball", { exact: true })).toBeVisible();
    await expect(page.getByText("Debt 1").first()).toBeVisible();
  });

  test("a budget below the combined minimum payments shows the minimum needed, not a broken result", async ({ page }) => {
    await page.goto("/us/avalanche-vs-snowball/");
    await page.locator("#budget").fill("100");
    await expect(page.getByText(/You'll need at least \$540\.00 a month/)).toBeVisible();
    await expect(page.getByText("Avalanche vs. snowball", { exact: true })).toHaveCount(0);
  });

  test("raising the budget back above the minimum restores the comparison", async ({ page }) => {
    await page.goto("/us/avalanche-vs-snowball/");
    await page.locator("#budget").fill("100");
    await expect(page.getByText(/You'll need at least/)).toBeVisible();
    await page.locator("#budget").fill("700");
    await expect(page.getByText("Avalanche vs. snowball", { exact: true })).toBeVisible();
  });

  test("avalanche and snowball both show a debt-free date, total interest, and a full payoff order", async ({ page }) => {
    await page.goto("/us/avalanche-vs-snowball/");

    // "Avalanche"/"Snowball" also appear in the section heading above ("Avalanche
    // vs. Snowball"), so match the card's own h3 exactly and climb to its
    // parent card <div> rather than filtering on a substring match.
    const avalancheCard = page.getByRole("heading", { name: "Avalanche", exact: true }).locator("xpath=..");
    const snowballCard = page.getByRole("heading", { name: "Snowball", exact: true }).locator("xpath=..");

    await expect(avalancheCard.getByText("Debt-free date")).toBeVisible();
    await expect(avalancheCard.getByText("Total interest")).toBeVisible();
    await expect(avalancheCard.getByText(/cleared month \d+/).first()).toBeVisible();

    await expect(snowballCard.getByText("Debt-free date")).toBeVisible();
    await expect(snowballCard.getByText("Total interest")).toBeVisible();
    await expect(snowballCard.getByText(/cleared month \d+/).first()).toBeVisible();

    // Avalanche targets the highest rate first (Credit card A, 24.99%) - snowball
    // targets the smallest balance first (Credit card B, $3,000) - so the two
    // methods' payoff orders genuinely differ for the example debts.
    const avalancheOrder = await avalancheCard.locator("ol li").allInnerTexts();
    const snowballOrder = await snowballCard.locator("ol li").allInnerTexts();
    expect(avalancheOrder[0]).toContain("Credit card A");
    expect(snowballOrder[0]).toContain("Credit card B");
  });

  test("states which method wins and by how much", async ({ page }) => {
    await page.goto("/us/avalanche-vs-snowball/");
    await expect(page.getByText(/saves you .+ in total interest/)).toBeVisible();
  });

  test("renders a two-series chart once the comparison is showing", async ({ page }) => {
    await page.goto("/us/avalanche-vs-snowball/");
    const chart = page.locator("svg[role='img']");
    await expect(chart).toBeVisible();
    await expect(chart.locator("path")).toHaveCount(2);
  });

  test("copy link button copies a URL containing every debt, the budget, and the currency", async ({ page }) => {
    await page.goto("/us/avalanche-vs-snowball/");
    await page.getByRole("button", { name: "Copy link to this comparison" }).click();
    await expect(page.getByText("Link copied")).toBeVisible();

    const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
    const url = new URL(clipboardText);
    expect(url.searchParams.get("budget")).toBe("700");
    expect(url.searchParams.get("currency")).toBe("USD");
    const debts = JSON.parse(url.searchParams.get("debts")!);
    expect(debts).toContainEqual(expect.objectContaining({ name: "Credit card A" }));
  });

  test("a shared link restores every debt, the budget, and the comparison", async ({ page }) => {
    await page.goto(
      "/us/avalanche-vs-snowball/?debts=" +
        encodeURIComponent(
          JSON.stringify([
            { name: "Loan A", balance: "1000", rate: "10", minPayment: "50" },
            { name: "Loan B", balance: "2000", rate: "5", minPayment: "40" },
          ]),
        ) +
        "&budget=300&currency=USD",
    );
    await page.waitForTimeout(300);

    await expect(debtRows(page)).toHaveCount(2);
    await expect(debtRows(page).first()).toHaveValue("Loan A");
    await expect(debtRows(page).nth(1)).toHaveValue("Loan B");
    await expect(page.locator("#budget")).toHaveValue("300");
    await expect(page.getByText("Avalanche vs. snowball", { exact: true })).toBeVisible();
  });
});
