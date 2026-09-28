import { describe, expect, it } from "vitest";
import { addMonths, formatMonthYear, interpolate } from "./format";

describe("interpolate", () => {
  it("replaces a single placeholder", () => {
    expect(interpolate("You need at least {min} a month.", { min: "$122.50" })).toBe(
      "You need at least $122.50 a month.",
    );
  });

  it("leaves an unmatched placeholder untouched", () => {
    expect(interpolate("Hello {name}", {})).toBe("Hello {name}");
  });

  it("replaces multiple distinct placeholders", () => {
    expect(interpolate("{a} and {b}", { a: "1", b: "2" })).toBe("1 and 2");
  });
});

describe("addMonths", () => {
  it("adds months within the same year", () => {
    const result = addMonths(new Date(2026, 0, 15), 3);
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth()).toBe(3); // April
  });

  it("rolls over into the next year", () => {
    const result = addMonths(new Date(2026, 8, 1), 6);
    expect(result.getFullYear()).toBe(2027);
    expect(result.getMonth()).toBe(2); // March
  });

  it("rolls over across multiple years", () => {
    const result = addMonths(new Date(2026, 8, 1), 55); // the 7000@21%/200 case
    expect(result.getFullYear()).toBe(2031);
    expect(result.getMonth()).toBe(3); // April
  });
});

describe("formatMonthYear", () => {
  it("formats a date as 'Month Year' in the given locale", () => {
    expect(formatMonthYear(new Date(2031, 3, 1), "en-US")).toBe("April 2031");
  });
});
