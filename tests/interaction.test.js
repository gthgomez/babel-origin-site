import { describe, it, expect, beforeEach } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { JSDOM } from "jsdom";

const root = resolve(__dirname, "..");
const demoHtml = readFileSync(resolve(root, "demo/index.html"), "utf8");
const siteJs = readFileSync(resolve(root, "assets/site.js"), "utf8");

function setupDom() {
  const dom = new JSDOM(demoHtml, {
    runScripts: "outside-only",
    url: "http://localhost/demo/",
  });
  dom.window.eval(siteJs);
  dom.window.document.dispatchEvent(
    new dom.window.Event("DOMContentLoaded", { bubbles: true })
  );
  return dom;
}

function getButtons(dom) {
  return Array.from(dom.window.document.querySelectorAll("[data-command]"));
}

function getOutput(dom) {
  return dom.window.document.getElementById("demo-output");
}

describe("demo command card switcher", () => {
  let dom;

  beforeEach(() => {
    dom = setupDom();
  });

  it("shows the ask command output initially", () => {
    const output = getOutput(dom);
    expect(output).not.toBeNull();
    expect(output.textContent).toContain('bl ask "Why is this failing?"');
    expect(output.textContent).toContain("status: read_only");
  });

  it("marks the ask card as active initially", () => {
    const buttons = getButtons(dom);
    const askBtn = buttons.find((b) => b.dataset.command === "ask");
    expect(askBtn.classList.contains("active")).toBe(true);
  });

  it("updates output when plan card is clicked", () => {
    const buttons = getButtons(dom);
    const planBtn = buttons.find((b) => b.dataset.command === "plan");
    planBtn.click();

    const output = getOutput(dom);
    expect(output.textContent).toContain('bl plan "Split this safely"');
    expect(output.textContent).toContain("status: plan_only");
  });

  it("updates output when fix card is clicked", () => {
    const buttons = getButtons(dom);
    const fixBtn = buttons.find((b) => b.dataset.command === "fix");
    fixBtn.click();

    const output = getOutput(dom);
    expect(output.textContent).toContain('bl fix "Fix the failing test"');
    expect(output.textContent).toContain("status: verified_edit_target");
  });

  it("updates output when doctor card is clicked", () => {
    const buttons = getButtons(dom);
    const doctorBtn = buttons.find((b) => b.dataset.command === "doctor");
    doctorBtn.click();

    const output = getOutput(dom);
    expect(output.textContent).toContain("babel doctor --scope all --json");
    expect(output.textContent).toContain("status: blocked");
  });

  it("toggles the active class to the clicked card", () => {
    const buttons = getButtons(dom);
    const planBtn = buttons.find((b) => b.dataset.command === "plan");
    planBtn.click();

    expect(planBtn.classList.contains("active")).toBe(true);
    const askBtn = buttons.find((b) => b.dataset.command === "ask");
    expect(askBtn.classList.contains("active")).toBe(false);
  });

  it("ensures only one card is active at a time", () => {
    const buttons = getButtons(dom);

    for (const btn of buttons) {
      btn.click();
      const activeButtons = getButtons(dom).filter((b) =>
        b.classList.contains("active")
      );
      expect(activeButtons).toHaveLength(1);
      expect(activeButtons[0]).toBe(btn);
    }
  });

  it("cycles through all commands correctly", () => {
    const buttons = getButtons(dom);
    const expectedCommands = ["ask", "plan", "fix", "doctor"];

    for (let i = 0; i < buttons.length; i++) {
      const btn = buttons[i];
      btn.click();
      expect(btn.dataset.command).toBe(expectedCommands[i]);
      expect(btn.classList.contains("active")).toBe(true);
    }
  });
});
