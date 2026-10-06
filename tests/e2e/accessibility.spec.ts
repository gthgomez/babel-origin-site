import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

// Automated accessibility checks on covered public pages. Automated tooling is
// not a WCAG certification; manual keyboard/SR checks are recorded separately
// in the handoff.
const PAGES = ["/", "/docs/", "/tour/", "/download/", "/status/", "/changelog/", "/security/"];

for (const path of PAGES) {
  test(`no critical or serious axe findings on ${path}`, async ({ page }) => {
    await page.goto(path);
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    const serious = results.violations.filter((v) =>
      v.impact === "critical" || v.impact === "serious"
    );
    const detail = serious
      .map((v) => `${v.id}(${v.impact}): ${v.nodes.slice(0, 3).map((n) => n.target.join(" ")).join(", ")}`)
      .join("; ");
    expect(serious, `${path}: ${detail}`).toEqual([]);
  });
}

test("skip link and landmarks on homepage", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("a.skip-link")).toHaveCount(1);
  await expect(page.locator("main#main-content")).toHaveCount(1);
  await expect(page.locator("header")).toHaveCount(1);
  await expect(page.locator("footer")).toHaveCount(1);
});
