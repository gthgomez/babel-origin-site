// Serves dist/ locally with the same response headers vercel.json declares,
// so browser tests exercise the intended delivery environment.
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { resolve, extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("../dist", import.meta.url)));
const port = Number(process.env.PORT || 4173);

const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".mjs": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".wasm": "application/wasm",
};

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url ?? "/", "http://localhost");
    let pathname = decodeURIComponent(url.pathname);
    // Mirror Vercel cleanUrls + trailingSlash:false behavior.
    if (pathname !== "/" && pathname.endsWith("/")) pathname = pathname.slice(0, -1);
    const candidate = normalize(join(root, pathname));
    if (!candidate.startsWith(root)) {
      res.writeHead(403).end();
      return;
    }
    let target = join(candidate, "index.html");
    let status = 200;
    try {
      const s = await stat(candidate);
      if (s.isFile()) target = candidate;
    } catch {
      if (await exists(candidate + ".html")) target = candidate + ".html";
      else {
        target = join(root, "404.html");
        status = 404;
      }
    }
    const body = await readFile(target);
    res.writeHead(status, {
      "Content-Type": types[extname(target)] ?? "application/octet-stream",
      "Referrer-Policy": "strict-origin-when-cross-origin",
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
      "X-DNS-Prefetch-Control": "off",
    });
    res.end(body);
  } catch {
    res.writeHead(404, { "Content-Type": "text/plain" }).end("Not found");
  }
});

function exists(p) {
  return stat(p).then(
    () => true,
    () => false
  );
}

server.listen(port, () => console.log(`dist server on http://localhost:${port}`));
