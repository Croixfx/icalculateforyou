import { describe, expect, it } from "vitest";
import { currencyForRegion } from "./regionCurrency";

describe("currencyForRegion", () => {
  it("still maps the well-known regions the old hand-made list had", () => {
    expect(currencyForRegion("US")).toBe("USD");
    expect(currencyForRegion("GB")).toBe("GBP");
    expect(currencyForRegion("JP")).toBe("JPY");
  });

  it("maps regions the previous ~90-region hand-made map omitted", () => {
    expect(currencyForRegion("RW")).toBe("RWF"); // Rwanda
    expect(currencyForRegion("KZ")).toBe("KZT"); // Kazakhstan
    expect(currencyForRegion("ET")).toBe("ETB"); // Ethiopia
    expect(currencyForRegion("CR")).toBe("CRC"); // Costa Rica
    expect(currencyForRegion("MN")).toBe("MNT"); // Mongolia
    expect(currencyForRegion("FJ")).toBe("FJD"); // Fiji
  });

  it("maps a dollarized country to the foreign currency it actually uses, not its own historical one", () => {
    expect(currencyForRegion("EC")).toBe("USD"); // Ecuador adopted the US dollar in 2000
  });

  it("is case-insensitive", () => {
    expect(currencyForRegion("rw")).toBe("RWF");
  });

  it("falls back to USD for a region with no assigned currency (e.g. Antarctica) or an unknown code", () => {
    expect(currencyForRegion("AQ")).toBe("USD");
    expect(currencyForRegion("ZZ")).toBe("USD");
    expect(currencyForRegion(undefined)).toBe("USD");
  });
});
