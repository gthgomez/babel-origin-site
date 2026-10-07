import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";

import { resolve } from "node:path";

const root = process.cwd();
const snapshot = JSON.parse(
  readFileSync(resolve(root, "src/data/product-status.json"), "utf8")
);

test.describe("homepage product assertions", () => {
  test("hero has a real next step", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "A coding agent that shows its work."
    );
    const cta = page.locator(".hero .button.primary");
    await expect(cta).toHaveAccessibleName(/Get started/i);
    expect(await cta.getAttribute("href")).toBe("/docs/getting-started/quickstart");
    // Secondary action goes to the canonical product repository.
    const github = page.locator(".hero .button.secondary");
    expect(await github.getAttribute("href")).toBe("https://github.com/gthgomez/Babel");
  });

  test("chat is visually the primary mode", async ({ page }) => {
    await page.goto("/");
    const modes = page.locator("#limits .card");
    await expect(modes).toHaveCount(3);
    await expect(modes.first()).toContainText("Chat");
    // The primary-mode badge is on the Chat card.
    await expect(modes.first().locator(".mode-badge")).toHaveText("Daily default");
  });

  test("preview/reference label stays visible near media", async ({ page }) => {
    await page.goto("/");
    const label = page.locator("#proof .reference-label");
    await expect(label).toBeVisible();
    await expect(label).toHaveText(/reference preview/i);
  });

  test("status cards match the shared snapshot", async ({ page }) => {
    await page.goto("/");
    const section = page.locator("#current-state");
    for (const id of ["chat", "plan", "deep", "desktop"]) {
      const feature = snapshot.features.find((f: { id: string }) => f.id === id);
      await expect(section).toContainText(feature.label);
    }
    // The desktop card must not read as a released download.
    const desktopCard = section.locator(".card", { hasText: "Desktop shell" });
    await expect(desktopCard).toContainText("Preview");
    await expect(desktopCard).toContainText("unsigned");
    const source = section.getByRole("link", { name: "product source" });
    await expect(source).toHaveAttribute(
      "href",
      `https://github.com/gthgomez/Babel/blob/${snapshot.sourceRevision}/README.md`
    );
  });

  test("page has no horizontal overflow", async ({ page }) => {
    await page.goto("/");
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth
    );
    expect(overflow).toBeLessThanOrEqual(0);
  });
});

test.describe("mobile navigation", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
  });

  test("mobile navigation is keyboard operable", async ({ page }) => {
    const toggle = page.locator(".nav-toggle");
    await expect(toggle).toBeVisible();
    // Keyboard: focus and press Enter.
    await toggle.focus();
    await page.keyboard.press("Enter");
    await expect(toggle).toHaveAttribute("aria-expanded", "true");
    await expect(page.locator("#site-nav")).toBeVisible();
    // Escape closes and returns focus.
    await page.keyboard.press("Escape");
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    await expect(toggle).toBeFocused();
  });

  test("skip link works", async ({ page }) => {
    await page.keyboard.press("Tab");
    const skip = page.locator(".skip-link");
    await expect(skip).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page.locator("#main-content")).toBeFocused();
  });
});
