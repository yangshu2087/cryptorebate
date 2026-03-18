import { describe, it, expect } from "vitest";
import { exchanges, getExchangeBySlug, getAllExchangeSlugs } from "./exchanges";

describe("exchanges data integrity", () => {
  it("has at least 5 exchanges", () => {
    expect(exchanges.length).toBeGreaterThanOrEqual(5);
  });

  it("every exchange has required fields", () => {
    for (const ex of exchanges) {
      expect(ex.slug).toBeTruthy();
      expect(ex.name).toBeTruthy();
      expect(ex.referralCode).toBeTruthy();
      expect(ex.referralLink).toMatch(/^https:\/\//);
      expect(ex.spotRebate).toMatch(/\d+%/);
      expect(ex.futuresRebate).toMatch(/\d+%/);
      expect(ex.fees.spotMaker).toBeGreaterThan(0);
      expect(ex.fees.spotTaker).toBeGreaterThan(0);
      expect(ex.fees.futuresMaker).toBeGreaterThan(0);
      expect(ex.fees.futuresTaker).toBeGreaterThan(0);
      expect(ex.logo).toBeTruthy();
      expect(ex.tags.length).toBeGreaterThan(0);
    }
  });

  it("slugs are unique", () => {
    const slugs = exchanges.map((e) => e.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("referral links are valid URLs", () => {
    for (const ex of exchanges) {
      expect(() => new URL(ex.referralLink)).not.toThrow();
    }
  });

  it("getExchangeBySlug returns correct exchange", () => {
    const binance = getExchangeBySlug("binance");
    expect(binance).toBeDefined();
    expect(binance!.name).toBe("Binance");
  });

  it("getExchangeBySlug returns undefined for unknown slug", () => {
    expect(getExchangeBySlug("nonexistent")).toBeUndefined();
  });

  it("getAllExchangeSlugs returns all slugs", () => {
    const slugs = getAllExchangeSlugs();
    expect(slugs).toContain("binance");
    expect(slugs).toContain("okx");
    expect(slugs).toContain("bybit");
    expect(slugs).toContain("bitget");
    expect(slugs).toContain("gate");
  });

  it("fees are reasonable (between 0 and 1%)", () => {
    for (const ex of exchanges) {
      expect(ex.fees.spotMaker).toBeLessThan(0.01);
      expect(ex.fees.spotTaker).toBeLessThan(0.01);
      expect(ex.fees.futuresMaker).toBeLessThan(0.01);
      expect(ex.fees.futuresTaker).toBeLessThan(0.01);
    }
  });
});
