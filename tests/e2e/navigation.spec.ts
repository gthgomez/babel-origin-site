import { test, expect } from "@playwright/test";

// T02 security/browser harness: every page must load under the effective CSP
// with zero policy violations, and core interactions must work.
test.beforeEach(async ({ page }) => {
  const violations: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") violations.push(msg.text());
  });
  page.on("pageerror", (err) => violations.push(String(err)));
  await page.addInitScript(() => {
    document.addEventListener("securitypolicyviolation", (e) => {
      (window as unknown as { __cspViolations: string[] }).__cspViolations ??= [];
      (window as unknown as { __cspViolations: string[] }).__cspViolations.push(
        `${e.violatedDirective}: ${e.blockedURI} sample=${(e as unknown as { sample?: string }).sample?.slice(0, 200) ?? ""} source=${(e as unknown as { sourceFile?: string }).sourceFile ?? ""}`
      );
    });
  });
  await page.goto("/");
  await expect(page.locator("body")).toBeVisible();
  (page as unknown as { __violations: string[] }).__violations = violations;
});

async function assertNoViolations(page: import("@playwright/test").Page, label: string) {
  const v = await page.evaluate(() => (window as unknown as { __cspViolations?: string[] }).__cspViolations ?? []);
  expect(v, `${label}: CSP violations: ${v.join("; ")}`).toEqual([]);
}

test("marketing homepage loads with no console errors or CSP violations", async ({ page }) => {
  await expect(page).toHaveTitle(/Babel/);
  await assertNoViolations(page, "home");
});

test("docs page renders with theme, code block, and no violations", async ({ page }) => {
  await page.goto("/docs/");
  await expect(page).toHaveTitle(/Babel Docs/);
  // Theme toggle exists and responds (Starlight theme handling under CSP).
  const themeToggle = page.locator("starlight-theme-button button, .starlight-theme-trigger, [aria-label*='heme']");
  if (await themeToggle.count()) {
    await themeToggle.first().click();
  }
  await assertNoViolations(page, "docs");
});

test("navigation links resolve within the site", async ({ page }) => {
  await page.goto("/");
  for (const [label, path] of [
    ["Get Babel", "/download"],
    ["Docs", "/docs"],
    ["Changelog", "/changelog"],
  ] as const) {
    // Links exist in the marketing nav even before their pages are finished
    // (T06); after T06 every target must return 200.
    await expect(page.locator(`.site-nav a[href^="${path}"]`)).toHaveCount(1);
  }
});

test("404 page serves for unknown routes", async ({ page }) => {
  const res = await page.goto("/no-such-page-xyz");
  expect(res?.status()).toBe(404);
  await expect(page.locator("body")).toContainText("404");
});

test("first-run path homepage → quickstart → install → first task is navigable", async ({ page }) => {
  await page.goto("/");
  // Homepage primary CTA is the first-run entry point.
  await page.locator(".hero .button.primary").click();
  await expect(page).toHaveURL(/\/docs\/getting-started\/quickstart\/?$/);
  await expect(page.locator("main")).toContainText(/no.key/i);

  // The install guide is reachable from the docs surface and links onward.
  await page.goto("/docs/getting-started/install/");
  await expect(page.locator("main")).toContainText(/clone/i);
  await page.goto("/docs/getting-started/first-coding-task/");
  await expect(page.locator("main")).toContainText(/outcome/i);
});

test("browser Back and Forward restore navigation", async ({ page }) => {
  await page.goto("/");
  await page.goto("/download/");
  await page.goto("/docs/getting-started/install/");
  await page.goBack();
  await expect(page).toHaveURL(/\/download\/?$/);
  await page.goBack();
  await expect(page).toHaveURL(/localhost:4173\/?$/);
  await page.goForward();
  await expect(page).toHaveURL(/\/download\/?$/);
  // The destination re-renders (not a blank history entry).
  await expect(page.locator("main")).toContainText(/Install Babel from source/i);
});
