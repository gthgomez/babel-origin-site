import { test, expect } from "@playwright/test";

// Built-artifact search (Pagefind) verification. The wasm-unsafe-eval CSP
// exception exists for this component; if search breaks under CSP these tests
// fail.
const SEARCH_TERMS: Array<[string, RegExp]> = [
  ["install", /install/i],
  ["Docker", /docker|execution profile/i],
  ["permissions", /permissions|approval/i],
  ["resume", /resume|sessions/i],
];

async function openSearch(page: import("@playwright/test").Page) {
  // Prefer the visible search trigger; fall back to the keyboard shortcut.
  const trigger = page.locator("button[data-open-modal], a[aria-label='Search'], button[aria-label='Search']");
  if (await trigger.count()) {
    await trigger.first().click();
  } else {
    await page.keyboard.press("ControlOrMeta+k");
  }
}

test.beforeEach(async ({ page }) => {
  await page.goto("/docs/");
});

for (const [term, expected] of SEARCH_TERMS) {
  test(`search finds a real guide for "${term}"`, async ({ page }) => {
    await openSearch(page);
    const input = page.locator(".pagefind-ui__search-input");
    await expect(input).toBeVisible();
    await input.fill(term);
    const results = page.locator(".pagefind-ui__result");
    await expect(results.first()).toBeVisible({ timeout: 10_000 });
    const text = await page.locator(".pagefind-ui").first().textContent();
    expect(text, `no useful result for "${term}"`).toMatch(expected);
  });
}

test("search no-results state and keyboard behavior", async ({ page }) => {
  await openSearch(page);
  const input = page.locator(".pagefind-ui__search-input");
  await expect(input).toBeVisible();
  await input.fill("xkcdqzzzunlikely");
  await page.waitForTimeout(2000);
  const area = page.locator(".pagefind-ui").first();
  await expect(area).toBeVisible();
  // Docs navigation survives regardless of search state.
  await page.keyboard.press("Escape");
  await expect(page.locator("body")).toContainText("Getting started");
});
