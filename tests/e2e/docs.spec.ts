import { test, expect } from "@playwright/test";
import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();

const expectedGuides = [
  "getting-started/install",
  "getting-started/quickstart",
  "getting-started/first-coding-task",
  "getting-started/troubleshooting",
  "using-babel/chat",
  "using-babel/plan",
  "using-babel/deep",
  "using-babel/sessions-and-recovery",
  "interfaces/overview",
  "interfaces/desktop",
  "configuration/models-and-providers",
  "safety/permissions",
  "safety/execution-profiles",
  "verification/overview",
  "customization/project-instructions",
  "reference/cli",
  "architecture/overview",
];

function docsContentFiles(base = "src/content/docs"): string[] {
  const out: string[] = [];
  const entries = readdirSync(resolve(root, base), { withFileTypes: true });
  for (const e of entries) {
    const rel = `${base}/${e.name}`;
    if (e.isDirectory()) out.push(...docsContentFiles(rel));
    else if (/\.mdx?$/.test(e.name)) out.push(rel);
  }
  return out;
}

test.describe("documentation integrity", () => {
  test("all required guides exist, render, and carry a source note", async ({ page }) => {
    for (const guide of expectedGuides) {
      const res = await page.goto(`/docs/${guide}/`);
      expect(res?.status(), `/docs/${guide}/ missing`).toBe(200);
      await expect(page.locator(".source-note"), `${guide} missing source note`).toHaveCount(1);
      await expect(page.locator(".source-note")).toContainText("Implementation source");
    }
  });

  test("sidebar has no placeholder routes", async ({ page }) => {
    await page.goto("/docs/");
    const sidebar = page.locator("starlight-sidebar, nav[aria-label], aside nav").first();
    const text = await page.locator("body").textContent();
    expect(text).not.toMatch(/coming soon|TODO|placeholder/i);
    // Every sidebar link resolves within the site.
    const links = await page.locator("a[href^='/docs/']").all();
    expect(links.length).toBeGreaterThan(10);
  });

  test("quickstart separates no-key and provider-backed steps", async ({ page }) => {
    await page.goto("/docs/getting-started/quickstart/");
    const body = await page.locator("main").textContent();
    expect(body).toMatch(/no.key/i);
    expect(body).toMatch(/provider.backed/i);
    // Step 1 must not require a key; the doctor command appears before any
    // credential mention of an actual key value.
    const doctorIdx = body!.indexOf("doctor");
    const keyIdx = body!.toLowerCase().indexOf("copy-item");
    expect(doctorIdx).toBeGreaterThanOrEqual(0);
    expect(keyIdx).toBeGreaterThan(doctorIdx);
  });

  test("coding guide does not offer dev_local as a test/build bypass", async ({ page }) => {
    await page.goto("/docs/getting-started/first-coding-task/");
    const body = (await page.locator("main").textContent()) ?? "";
    expect(body).toMatch(/denied without Docker|inspection commands only|not a\s+way\s+to\s+unblock|not a workaround/i);
    expect(body).not.toMatch(/dev_local (will|can) (run|execute) (your |the )?(tests|build)/i);
  });

  test("source and edit links have distinct owners", async ({ page }) => {
    await page.goto("/docs/using-babel/chat/");
    const edit = page.locator(".source-note-links a", { hasText: "Suggest an edit" });
    const source = page.locator(".source-note-links a", { hasText: "Implementation source" });
    expect(await edit.getAttribute("href")).toContain("github.com/gthgomez/babel-origin-site");
    expect(await source.getAttribute("href")).toContain("github.com/gthgomez/Babel/");
    // Source links are pinned to a full revision.
    expect(await source.getAttribute("href")).toMatch(/2aa0200dcf65a18d80183a8eecd5e5c370c9f7f3/);
  });
});
