import { expect, test, type Page } from "@playwright/test";

const PAGES = ["/", "/us/", "/uk/", "/ca/", "/au/"];
const MULTI_DEBT_PAGES = [
  "/avalanche-vs-snowball/",
  "/us/avalanche-vs-snowball/",
  "/uk/avalanche-vs-snowball/",
  "/ca/avalanche-vs-snowball/",
  "/au/avalanche-vs-snowball/",
];
const ALL_PAGES = [...PAGES, ...MULTI_DEBT_PAGES];

async function collectConsoleIssues(page: Page) {
  const messages: { type: string; text: string }[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error" || msg.type() === "warning") {
      messages.push({ type: msg.type(), text: msg.text() });
    }
  });
  page.on("pageerror", (err) => {
    messages.push({ type: "pageerror", text: err.message });
  });
  return messages;
}

for (const path of ALL_PAGES) {
  test(`no console errors/warnings on ${path}`, async ({ page }) => {
    const issues = await collectConsoleIssues(page);
    const response = await page.goto(path);
    expect(response?.status(), `HTTP status for ${path}`).toBe(200);
    await page.waitForLoadState("networkidle");
    // Give client-side effects (URL param hydration, currency detection) a tick to run.
    await page.waitForTimeout(300);

    if (issues.length > 0) {
      console.log(`Console issues on ${path}:`, JSON.stringify(issues, null, 2));
    }
    expect(issues, `console issues on ${path}`).toEqual([]);
  });
}

for (const path of ALL_PAGES) {
  test(`every internal link on ${path} resolves to 200`, async ({ page, request }) => {
    await page.goto(path);
    await page.waitForLoadState("networkidle");

    const hrefs = await page.$$eval("a[href]", (anchors) =>
      anchors
        .map((a) => a.getAttribute("href"))
        .filter((href): href is string => !!href && !href.startsWith("http") && !href.startsWith("mailto:")),
    );

    const unique = [...new Set(hrefs)];
    const results: { href: string; status: number }[] = [];

    for (const href of unique) {
      const res = await request.get(href, { failOnStatusCode: false });
      results.push({ href, status: res.status() });
    }

    const broken = results.filter((r) => r.status !== 200);
    if (broken.length > 0) {
      console.log(`Broken links on ${path}:`, JSON.stringify(broken, null, 2));
    }
    expect(broken, `broken links on ${path}`).toEqual([]);
  });
}

test("hreflang alternate URLs all resolve to 200", async ({ page, request }) => {
  await page.goto("/us/");
  const hreflangUrls = await page.$$eval('link[rel="alternate"]', (links) =>
    links.map((l) => l.getAttribute("href")).filter((h): h is string => !!h),
  );
  expect(hreflangUrls.length).toBeGreaterThan(0);

  for (const url of hreflangUrls) {
    const path = new URL(url).pathname;
    const res = await request.get(path, { failOnStatusCode: false });
    expect(res.status(), `${url} -> ${path}`).toBe(200);
  }
});

test("hreflang alternate URLs on the avalanche-vs-snowball page all resolve to 200", async ({ page, request }) => {
  await page.goto("/us/avalanche-vs-snowball/");
  const hreflangUrls = await page.$$eval('link[rel="alternate"]', (links) =>
    links.map((l) => l.getAttribute("href")).filter((h): h is string => !!h),
  );
  expect(hreflangUrls.length).toBeGreaterThan(0);

  for (const url of hreflangUrls) {
    const path = new URL(url).pathname;
    const res = await request.get(path, { failOnStatusCode: false });
    expect(res.status(), `${url} -> ${path}`).toBe(200);
  }
});

test("canonical URL is present and resolvable on every page", async ({ page, request }) => {
  for (const path of ALL_PAGES) {
    await page.goto(path);
    const canonical = await page.$eval('link[rel="canonical"]', (l) => l.getAttribute("href"));
    expect(canonical, `canonical on ${path}`).toBeTruthy();
    const canonicalPath = new URL(canonical!).pathname || "/";
    const res = await request.get(canonicalPath, { failOnStatusCode: false });
    expect(res.status(), `canonical ${canonical} -> ${canonicalPath}`).toBe(200);
  }
});
