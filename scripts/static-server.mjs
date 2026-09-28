// Minimal static file server for testing the Next.js static export (`out/`)
// the way a real static host would: directory requests resolve to
// index.html, unknown paths fall back to a 404 page, and responses are
// gzip-compressed when the client accepts it (every real static host —
// Vercel, Netlify, S3+CloudFront, nginx — compresses text assets by
// default; serving them raw here would understate real-world performance,
// e.g. in a Lighthouse run against this server). Used only by Playwright's
// webServer config and manual verification — not part of the shipped site,
// so it isn't worth pulling in a dependency like `serve` for.
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { gzip } from "node:zlib";
import { promisify } from "node:util";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const gzipAsync = promisify(gzip);

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

// Compressing already-compressed formats (images, fonts) wastes CPU for no
// size benefit — only worth it for text-based assets.
const COMPRESSIBLE_EXTENSIONS = new Set([".html", ".js", ".mjs", ".css", ".json", ".svg", ".txt", ".xml"]);

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

async function send(req, res, status, file) {
  const body = await readFile(file);
  const contentType = MIME_TYPES[extname(file)] ?? "application/octet-stream";
  const acceptsGzip = (req.headers["accept-encoding"] ?? "").includes("gzip");

  if (acceptsGzip && COMPRESSIBLE_EXTENSIONS.has(extname(file))) {
    const compressed = await gzipAsync(body);
    res.writeHead(status, { "Content-Type": contentType, "Content-Encoding": "gzip" });
    res.end(compressed);
  } else {
    res.writeHead(status, { "Content-Type": contentType });
    res.end(body);
  }
}

const server = createServer(async (req, res) => {
  const file = await resolveFile(req.url ?? "/");

  if (file) {
    await send(req, res, 200, file);
    return;
  }

  try {
    await send(req, res, 404, join(ROOT, "404", "index.html"));
  } catch {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("404 Not Found");
  }
});

server.listen(PORT, () => {
  console.log(`Static export served at http://localhost:${PORT}`);
});
