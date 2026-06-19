const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const publicDir = path.join(root, "public");

const copyTargets = [
  "index.html",
  "favicon.ico",
  "assets",
  "demo"
];

fs.rmSync(publicDir, { recursive: true, force: true });
fs.mkdirSync(publicDir, { recursive: true });

for (const relative of copyTargets) {
  const source = path.join(root, relative);
  const target = path.join(publicDir, relative);
  fs.cpSync(source, target, { recursive: true });
}

console.log("Built public static output in public/.");
