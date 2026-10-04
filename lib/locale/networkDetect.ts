/**
 * Real-location country guess via Cloudflare's own geo-trace endpoint
 * (same origin, no third-party service, no signup, no API key - Cloudflare
 * already knows every visitor's country since it's the host serving the
 * request, and exposes it back at /cdn-cgi/trace as `loc=XX`). Far more
 * reliable than guessing from the browser's language setting (a Rwandan
 * visitor with their browser set to en-US was never detectable that way).
 *
 * Resolves null on any failure - network error, ad blocker, timeout, or a
 * host that isn't served by Cloudflare (e.g. local dev) - so every caller
 * always has a safe fallback to the existing browser-language detection.
 */
export async function detectCountryFromNetwork(): Promise<string | null> {
  if (typeof window === "undefined" || typeof fetch === "undefined") {
    return null;
  }

  // /cdn-cgi/trace only exists on an actual Cloudflare-served request; on
  // localhost (local dev, and the Playwright suite's static-export server)
  // it's a guaranteed 404. Chromium logs failed fetches to the console
  // regardless of how the JS handles the response, so attempting it here
  // would show up as a console error on every local run even though the
  // code itself degrades gracefully - skip it outright rather than
  // generate noise for a request that can never succeed in that context.
  if (["localhost", "127.0.0.1"].includes(window.location.hostname)) {
    return null;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 2000);

  try {
    const res = await fetch("/cdn-cgi/trace", { signal: controller.signal });
    if (!res.ok) return null;
    const text = await res.text();
    const match = /^loc=([A-Z]{2})$/m.exec(text);
    return match ? match[1] : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}
