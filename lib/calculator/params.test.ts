import { describe, expect, it } from "vitest";
import { buildShareUrl, decodeFormState, encodeFormState } from "./params";
import type { CalculatorFormState } from "./types";

const durationState: CalculatorFormState = {
  mode: "duration",
  balance: "7000",
  ratePercent: "21",
  rateType: "nominal",
  payment: "200",
  targetDate: "",
  extraPercent: "0",
  currency: "USD",
};

const targetState: CalculatorFormState = {
  mode: "target",
  balance: "5000",
  ratePercent: "15",
  rateType: "effective",
  payment: "",
  targetDate: "2028-06",
  extraPercent: "10",
  currency: "GBP",
};

describe("encodeFormState", () => {
  it("includes the payment field but not targetDate in duration mode", () => {
    const params = encodeFormState(durationState);
    expect(params.get("mode")).toBe("duration");
    expect(params.get("payment")).toBe("200");
    expect(params.has("targetDate")).toBe(false);
  });

  it("includes the targetDate field but not payment in target mode", () => {
    const params = encodeFormState(targetState);
    expect(params.get("mode")).toBe("target");
    expect(params.get("targetDate")).toBe("2028-06");
    expect(params.has("payment")).toBe(false);
  });

  it("omits a zero 'what if' extra since it's the default", () => {
    const params = encodeFormState(durationState);
    expect(params.has("extra")).toBe(false);
  });

  it("includes a non-zero 'what if' extra", () => {
    const params = encodeFormState(targetState);
    expect(params.get("extra")).toBe("10");
  });
});

describe("decodeFormState", () => {
  it("round-trips duration mode exactly", () => {
    const encoded = encodeFormState(durationState);
    const decoded = decodeFormState(encoded);
    expect(decoded).toEqual({
      mode: "duration",
      balance: "7000",
      ratePercent: "21",
      rateType: "nominal",
      payment: "200",
      currency: "USD",
    });
  });

  it("round-trips target mode exactly", () => {
    const encoded = encodeFormState(targetState);
    const decoded = decodeFormState(encoded);
    expect(decoded).toEqual({
      mode: "target",
      balance: "5000",
      ratePercent: "15",
      rateType: "effective",
      targetDate: "2028-06",
      extraPercent: "10",
      currency: "GBP",
    });
  });

  it("accepts a plain query string as well as URLSearchParams", () => {
    expect(decodeFormState("mode=duration&balance=100")).toEqual({
      mode: "duration",
      balance: "100",
    });
  });

  it("drops an invalid mode instead of accepting garbage", () => {
    expect(decodeFormState("mode=yolo&balance=100")).toEqual({ balance: "100" });
  });

  it("drops an invalid rateType", () => {
    expect(decodeFormState("rateType=compound")).toEqual({});
  });

  it("drops a malformed targetDate", () => {
    expect(decodeFormState("targetDate=not-a-date")).toEqual({});
    expect(decodeFormState("targetDate=2026-9")).toEqual({}); // must be zero-padded
  });

  it("drops a malformed currency and uppercases a valid one", () => {
    expect(decodeFormState("currency=usd")).toEqual({ currency: "USD" });
    expect(decodeFormState("currency=US")).toEqual({});
    expect(decodeFormState("currency=1234")).toEqual({});
  });

  it("ignores unknown params", () => {
    expect(decodeFormState("utm_source=newsletter&balance=100")).toEqual({ balance: "100" });
  });

  it("returns an empty object for an empty query string", () => {
    expect(decodeFormState("")).toEqual({});
  });
});

describe("buildShareUrl", () => {
  it("appends the encoded query to the base URL", () => {
    const url = buildShareUrl("https://www.calculatorhub.example/us/", durationState);
    expect(url).toBe(
      "https://www.calculatorhub.example/us/?mode=duration&balance=7000&rate=21&rateType=nominal&payment=200&currency=USD",
    );
  });

  it("returns the bare base URL when there is nothing to encode", () => {
    const empty: CalculatorFormState = {
      mode: "duration",
      balance: "",
      ratePercent: "",
      rateType: "nominal",
      payment: "",
      targetDate: "",
      extraPercent: "0",
      currency: "",
    };
    expect(buildShareUrl("https://www.calculatorhub.example/us/", empty)).toBe(
      "https://www.calculatorhub.example/us/?mode=duration&rateType=nominal",
    );
  });
});
