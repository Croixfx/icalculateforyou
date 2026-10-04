import { afterEach, describe, expect, it, vi } from "vitest";
import { detectCountryFromNetwork } from "./networkDetect";

afterEach(() => {
  vi.unstubAllGlobals();
});

function mockBrowser(hostname: string, impl: (input: unknown, init?: RequestInit) => Promise<Response>) {
  vi.stubGlobal("window", { location: { hostname } });
  vi.stubGlobal("fetch", vi.fn(impl));
}

describe("detectCountryFromNetwork", () => {
  it("returns null when there is no window (server / static export)", async () => {
    expect(await detectCountryFromNetwork()).toBeNull();
  });

  it("skips the request on localhost instead of generating a guaranteed-404 console error", async () => {
    const fetchSpy = vi.fn();
    mockBrowser("localhost", fetchSpy);
    expect(await detectCountryFromNetwork()).toBeNull();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("parses the loc= line out of Cloudflare's trace response", async () => {
    mockBrowser("icalculateforyou.pages.dev", async () =>
      new Response("fl=123\nh=example.com\nip=1.2.3.4\nloc=RW\nts=123\n", { status: 200 }),
    );
    expect(await detectCountryFromNetwork()).toBe("RW");
  });

  it("returns null when the response has no loc= line", async () => {
    mockBrowser("icalculateforyou.pages.dev", async () => new Response("fl=123\nh=example.com\n", { status: 200 }));
    expect(await detectCountryFromNetwork()).toBeNull();
  });

  it("returns null on a non-ok response instead of throwing", async () => {
    mockBrowser("icalculateforyou.pages.dev", async () => new Response("not found", { status: 404 }));
    expect(await detectCountryFromNetwork()).toBeNull();
  });

  it("returns null when fetch rejects (network error, ad blocker, etc.)", async () => {
    mockBrowser("icalculateforyou.pages.dev", async () => {
      throw new Error("network error");
    });
    expect(await detectCountryFromNetwork()).toBeNull();
  });
});
