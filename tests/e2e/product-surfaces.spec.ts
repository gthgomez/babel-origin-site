import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const snapshot = JSON.parse(
  readFileSync(resolve(root, "src/data/product-status.json"), "utf8")
);
const changelog = JSON.parse(
  readFileSync(resolve(root, "src/data/changelog.json"), "utf8")
);

test.describe("tour", () => {
  test("tour never dispatches a provider request", async ({ page }) => {
    const providerRequests: string[] = [];
    page.on("request", (req) => {
      const url = req.url();
      if (!/localhost|127\.0\.0\.1/.test(new URL(url).hostname)) {
        providerRequests.push(url);
      }
    });
    await page.goto("/tour/");
    // Interact with every tab/section control available.
    const controls = page.locator('[role="tab"], .tour-nav button, button');
    const count = await controls.count();
    for (let i = 0; i < count; i++) {
      await controls.nth(i).click({ timeout: 1000 }).catch(() => {});
    }
    expect(providerRequests, `tour sent requests: ${providerRequests.join(", ")}`).toEqual([]);
    // At least one reference label is visible after all that interaction.
    const visibleLabels = page.locator(".reference-label:visible");
    await expect(visibleLabels.first()).toBeVisible();
  });

  test("reference label survives tab switching", async ({ page }) => {
    await page.goto("/tour/");
    const tabs = page.locator('[role="tab"]');
    const n = await tabs.count();
    for (let i = 0; i < n; i++) {
      await tabs.nth(i).click();
      const activePanel = page.locator(".tour-panel:not([hidden])");
      await expect(activePanel.locator(".reference-label")).toBeVisible();
    }
  });
});

test.describe("download", () => {
  test("unknown download has no binary CTA", async ({ page }) => {
    await page.goto("/download/");
    // Buttons/links may only exist for real actions: the source install path
    // and genuinely available binary assets from the snapshot.
    const allowed = new Set(["/docs/getting-started/install/"]);
    const hrefs = await page
      .locator(".actions a[href]")
      .evaluateAll((els) => els.map((e) => (e as HTMLAnchorElement).getAttribute("href")));
    expect(hrefs.length).toBeGreaterThan(0);
    for (const href of hrefs) {
      const ok =
        allowed.has(href!) ||
        snapshot.distributions.some(
          (d: { assetUrl?: string; availability: string }) =>
            d.assetUrl === href && d.availability === "available"
        );
      expect(ok, `unexpected install action href ${href}`).toBe(true);
    }
    // Unavailable distributions are plain text, not click targets that
    // pretend to install. Their label must not be an anchor; only the
    // explicit "See status" pointer may link.
    for (const dist of snapshot.distributions.filter(
      (d: { kind: string; availability: string }) =>
        d.kind !== "source" && d.availability !== "available"
    )) {
      const label = page.locator(".install-notices li", { hasText: dist.label });
      await expect(label).toHaveCount(1);
      await expect(label.locator("strong a")).toHaveCount(0);
    }
    // npm must be shown as unavailable.
    await expect(page.locator("body")).toContainText(/no published npm package/i);
  });
});

test.describe("status", () => {
  test("status page is a dated snapshot, not live monitoring", async ({ page }) => {
    await page.goto("/status/");
    await expect(page.locator("body")).toContainText(snapshot.sourceRevision.slice(0, 12));
    await expect(page.locator("body")).toContainText(snapshot.reviewedAt);
    // Must not present itself as operational monitoring: no uptime claims.
    const body = (await page.locator("body").textContent()) ?? "";
    expect(body).not.toMatch(/all systems operational|\d{2,3}(\.\d+)?% uptime|live monitoring:/i);
  });
});

test.describe("changelog", () => {
  test("development milestone is not a release", async ({ page }) => {
    await page.goto("/changelog/");
    for (const entry of changelog.filter((e: { category: string }) => e.category === "development")) {
      const item = page.locator("li, article", { hasText: entry.title }).first();
      await expect(item).toContainText(/development|not a release|source milestone/i);
    }
    // The release entry is labeled as a release.
    const release = page.locator("li, article", { hasText: "v0.1.0" }).first();
    await expect(release).toContainText(/release/i);
  });
});

test.describe("security", () => {
  test("website and product security boundaries are distinct", async ({ page }) => {
    await page.goto("/security/");
    const body = (await page.locator("body").textContent()) ?? "";
    expect(body).toMatch(/site|website/i);
    expect(body).toMatch(/Babel (product|harness|repository)/i);
    // The site page must not claim product compliance certifications.
    expect(body).not.toMatch(/is (SOC 2|ISO 27001) certified|we are certified/i);
  });
});
