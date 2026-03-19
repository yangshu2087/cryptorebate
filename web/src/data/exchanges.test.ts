import { describe, it, expect } from "vitest";
import enMessages from "../../messages/en.json";
import zhMessages from "../../messages/zh.json";
import { exchanges, getExchangeBySlug, getAllExchangeSlugs } from "./exchanges";

const exchangeContentKeys = [
  "description",
  "pros",
  "cons",
  "bestFor",
  "tutorial",
  "faq",
] as const;

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

  it("every exchange has regionRestrictions array", () => {
    for (const ex of exchanges) {
      expect(Array.isArray(ex.regionRestrictions)).toBe(true);
    }
  });

  it("every exchange has valid kycDifficulty", () => {
    for (const ex of exchanges) {
      expect(["easy", "moderate", "strict"]).toContain(ex.kycDifficulty);
    }
  });

  it("every exchange has rebateAutoActivate boolean", () => {
    for (const ex of exchanges) {
      expect(typeof ex.rebateAutoActivate).toBe("boolean");
    }
  });

  it("every exchange has supported rebateSettlement values", () => {
    for (const ex of exchanges) {
      expect(["daily", "instant"]).toContain(ex.rebateSettlement);
    }
  });

  it("every exchange has platformTokenStacking boolean", () => {
    for (const ex of exchanges) {
      expect(typeof ex.platformTokenStacking).toBe("boolean");
    }
  });

  it("platform token stacking fields stay consistent", () => {
    for (const ex of exchanges) {
      if (ex.platformTokenStacking) {
        expect(ex.fees.tokenName).toBeTruthy();
        expect(ex.fees.tokenDiscount).toBeTypeOf("number");
        expect(ex.fees.tokenDiscount).toBeGreaterThan(0);
      } else {
        expect(ex.fees.tokenName).toBeUndefined();
        expect(ex.fees.tokenDiscount).toBeUndefined();
      }
    }
  });

  it("every exchange has valid lastReviewed date string", () => {
    for (const ex of exchanges) {
      expect(typeof ex.lastReviewed).toBe("string");
      const date = new Date(ex.lastReviewed);
      expect(date.toString()).not.toBe("Invalid Date");
    }
  });

  it("fees are reasonable (between 0 and 1%)", () => {
    for (const ex of exchanges) {
      expect(ex.fees.spotMaker).toBeLessThan(0.01);
      expect(ex.fees.spotTaker).toBeLessThan(0.01);
      expect(ex.fees.futuresMaker).toBeLessThan(0.01);
      expect(ex.fees.futuresTaker).toBeLessThan(0.01);
    }
  });

  it.each([
    ["en", enMessages],
    ["zh", zhMessages],
  ])("includes complete exchange translations for %s", (_locale, messages) => {
    for (const ex of exchanges) {
      const entry = messages.exchanges[ex.slug as keyof typeof messages.exchanges];

      expect(entry).toBeTruthy();

      for (const key of exchangeContentKeys) {
        expect(entry).toHaveProperty(key);
      }

      expect(entry.description).toBeTruthy();
      expect(entry.bestFor).toBeTruthy();
      expect(entry.pros.length).toBeGreaterThan(0);
      expect(entry.cons.length).toBeGreaterThan(0);
      expect(entry.tutorial.length).toBeGreaterThan(0);
      expect(entry.faq.length).toBeGreaterThan(0);
    }
  });
});
