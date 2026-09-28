// Minimal static file server for testing the Next.js static export (`out/`)
// the way a real static host would: directory requests resolve to
// index.html, unknown paths fall back to a 404 page. Used only by
// Playwright's webServer config — not part of the shipped site, so it isn't
// worth pulling in a dependency like `serve` for.
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(fileURLToPath(new URL(".", import.meta.url)), "..", "out");
const PORT = Number(process.env.PORT ?? 4173);

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
};

async function resolveFile(urlPath) {
  const decoded = decodeURIComponent(urlPath.split("?")[0].split("#")[0]);
  const safePath = normalize(decoded).replace(/^(\.\.[/\\])+/, "");
  const candidates = safePath.endsWith("/")
    ? [join(ROOT, safePath, "index.html")]
    : [join(ROOT, safePath), join(ROOT, safePath, "index.html"), join(ROOT, `${safePath}.html`)];

  for (const candidate of candidates) {
    try {
      const info = await stat(candidate);
      if (info.isFile()) return candidate;
    } catch {
      // try next candidate
    }
  }
  return null;
}

const server = createServer(async (req, res) => {
  const file = await resolveFile(req.url ?? "/");

  if (file) {
    const body = await readFile(file);
    res.writeHead(200, { "Content-Type": MIME_TYPES[extname(file)] ?? "application/octet-stream" });
    res.end(body);
    return;
  }

  try {
    const notFoundBody = await readFile(join(ROOT, "404", "index.html"));
    res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
    res.end(notFoundBody);
  } catch {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("404 Not Found");
  }
});

server.listen(PORT, () => {
  console.log(`Static export served at http://localhost:${PORT}`);
});
