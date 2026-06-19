const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const textFiles = [
  "index.html",
  "demo/index.html",
  "assets/site.css",
  "assets/site.js",
  "README.md",
  "vercel.json"
];

const requiredFiles = [
  ...textFiles,
  "favicon.ico"
];

const banned = [
  /production-ready agent/i,
  /production-ready system/i,
  /production AI control plane/i,
  /autonomous agent/i,
  /reliable autonomous worker/i,
  /176 registered/i,
  /recorded-provider/i,
  /governance-replay/i,
  /C:\\Workspace/i,
  /Babel-private/i,
  /service-role/i,
  /api[_-]?key/i
];

const required = [
  /Prompt-Stack Validation CLI Prototype|prompt-stack validation/i,
  /https:\/\/github\.com\/gthgomez\/Babel/,
  /not production-ready|not a production agent|Not:<\/strong> production-ready/i,
  /doctor --scope all/i,
  /demo\/index\.html|\/demo\//
];

let combined = "";

for (const relative of requiredFiles) {
  const full = path.join(root, relative);
  if (!fs.existsSync(full)) {
    throw new Error(`Missing required file: ${relative}`);
  }
}

for (const relative of textFiles) {
  const full = path.join(root, relative);
  combined += `\n\n--- ${relative} ---\n${fs.readFileSync(full, "utf8")}`;
}

const failures = [];

for (const pattern of banned) {
  if (pattern.test(combined)) {
    failures.push(`Banned pattern found: ${pattern}`);
  }
}

for (const pattern of required) {
  if (!pattern.test(combined)) {
    failures.push(`Required pattern missing: ${pattern}`);
  }
}

if (!fs.existsSync(path.join(root, "assets", "babel-terminal-proof.png"))) {
  failures.push("Missing visual proof asset: assets/babel-terminal-proof.png");
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}

const publicHtml = [
  fs.readFileSync(path.join(root, "index.html"), "utf8"),
  fs.readFileSync(path.join(root, "demo", "index.html"), "utf8")
].join("\n");

if (/HARDENING_PLAN\.md|Hardening plan|>Hardening</i.test(publicHtml)) {
  console.error("Internal hardening plan must not be linked from public HTML.");
  process.exit(1);
}

console.log("Babel origin static check passed.");
