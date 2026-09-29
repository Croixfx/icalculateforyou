import { afterEach, describe, expect, it, vi } from "vitest";
import { detectLocale, getPreferredCurrency, resolveCurrency, setPreferredCurrency } from "./detect";

function mockBrowser(language: string, languages: string[] = [language]) {
  vi.stubGlobal("window", {});
  vi.stubGlobal("navigator", { language, languages });
}

function mockLocalStorage() {
  const store = new Map<string, string>();
  const localStorage = {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
    removeItem: (key: string) => {
      store.delete(key);
    },
  };
  vi.stubGlobal("window", { localStorage });
  return localStorage;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("detectLocale", () => {
  it("falls back to en-US/USD when there is no window (server / static export)", () => {
    expect(detectLocale()).toEqual({ locale: "en-US", currency: "USD" });
  });

  it("maps en-GB to GBP", () => {
    mockBrowser("en-GB");
    expect(detectLocale()).toEqual({ locale: "en-GB", currency: "GBP" });
  });

  it("maps a French Canadian locale (fr-CA) to CAD", () => {
    mockBrowser("fr-CA");
    expect(detectLocale().currency).toBe("CAD");
  });

  it("maps en-AU to AUD", () => {
    mockBrowser("en-AU");
    expect(detectLocale().currency).toBe("AUD");
  });

  it("maps a bare language with no region (e.g. 'de') to a sensible currency via likely-subtag maximization", () => {
    mockBrowser("de");
    expect(detectLocale().currency).toBe("EUR");
  });

  it("falls back to USD for an unmapped region", () => {
    mockBrowser("en-XX");
    expect(detectLocale().currency).toBe("USD");
  });

  it("maps a Rwandan locale (rw-RW) to RWF", () => {
    mockBrowser("rw-RW");
    expect(detectLocale().currency).toBe("RWF");
  });
});

describe("manual currency override", () => {
  it("returns null when nothing has been saved", () => {
    mockLocalStorage();
    expect(getPreferredCurrency()).toBeNull();
  });

  it("persists and reads back a manually selected currency", () => {
    mockLocalStorage();
    setPreferredCurrency("EUR");
    expect(getPreferredCurrency()).toBe("EUR");
  });

  it("resolveCurrency prefers the manual override over detection", () => {
    const storage = mockLocalStorage();
    storage.setItem("preferredCurrency", "JPY");
    expect(resolveCurrency()).toBe("JPY");
  });

  it("resolveCurrency falls back to detection when no override is saved", () => {
    const store = new Map<string, string>();
    vi.stubGlobal("window", {
      localStorage: {
        getItem: (key: string) => store.get(key) ?? null,
        setItem: (key: string, value: string) => store.set(key, value),
      },
    });
    vi.stubGlobal("navigator", { language: "en-GB", languages: ["en-GB"] });
    expect(resolveCurrency()).toBe("GBP");
  });
});
