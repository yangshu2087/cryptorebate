import { describe, it, expect } from "vitest";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { exchanges, getExchangeBySlug, getAllExchangeSlugs } from "./exchanges";

const exchangeContentKeys = [
  "description",
  "pros",
  "cons",
  "bestFor",
  "tutorial",
  "faq",
] as const;

const requiredHomeKeys = [
  "heroBadge",
  "heroTitle",
  "heroSubtitle",
  "brandCardSubtitle",
  "brandCardDescription",
  "ctaBrowse",
  "ctaCalculator",
] as const;

const requiredMetadataKeys = [
  "siteName",
  "siteTagline",
  "siteDescription",
  "homeTitle",
  "exchangesTitle",
  "calculatorTitle",
  "aboutTitle",
  "disclosureTitle",
  "legalTitle",
] as const;

const messagesDir = join(process.cwd(), "messages");
const publicDir = join(process.cwd(), "public");

const allowedReferralHosts: Record<string, string[]> = {
  binance: ["www.binance.com", "binance.com"],
  okx: ["www.okx.com", "okx.com"],
  bybit: ["partner.bybit.com", "www.bybit.com", "bybit.com"],
  bitget: ["partner.bitget.com", "www.bitget.com", "bitget.com"],
  gate: ["www.gate.com", "gate.com", "www.gate.io", "gate.io", "www.gateport.company", "gateport.company"],
  kucoin: ["www.kucoin.com", "kucoin.com"],
  huobi: ["www.htx.com", "htx.com", "www.htx.com.gt", "htx.com.gt"],
};

const localeMessages = readdirSync(messagesDir)
  .filter((file) => file.endsWith(".json"))
  .map((file) => [
    file.replace(".json", ""),
    JSON.parse(readFileSync(join(messagesDir, file), "utf8")),
  ] as const);

describe("exchanges data integrity", () => {
  it("has at least 7 exchanges", () => {
    expect(exchanges.length).toBeGreaterThanOrEqual(7);
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

  it("order values are unique positive integers", () => {
    const orders = exchanges.map((e) => e.order);
    expect(new Set(orders).size).toBe(orders.length);

    for (const order of orders) {
      expect(Number.isInteger(order)).toBe(true);
      expect(order).toBeGreaterThan(0);
    }
  });

  it("order values form a contiguous sequence starting from 1", () => {
    const ordered = [...exchanges].map((e) => e.order).sort((a, b) => a - b);
    ordered.forEach((value, index) => {
      expect(value).toBe(index + 1);
    });
  });

  it("referral links are valid URLs", () => {
    for (const ex of exchanges) {
      expect(() => new URL(ex.referralLink)).not.toThrow();
    }
  });

  it("every exchange logo asset exists in public directory", () => {
    for (const ex of exchanges) {
      expect(ex.logo.startsWith("/")).toBe(true);
      const logoPath = join(publicDir, ex.logo.replace(/^\//, ""));
      expect(
        existsSync(logoPath),
        `missing logo asset for ${ex.slug}: ${logoPath}`
      ).toBe(true);
    }
  });

  it("referral links use approved partner domains", () => {
    for (const ex of exchanges) {
      const host = new URL(ex.referralLink).hostname.toLowerCase();
      const allowedHosts = allowedReferralHosts[ex.slug];

      expect(allowedHosts, `missing domain allowlist for ${ex.slug}`).toBeTruthy();
      expect(
        allowedHosts,
        `host ${host} is not allowlisted for ${ex.slug}`
      ).toContain(host);
    }
  });

  it("referral links include their configured referral code", () => {
    for (const ex of exchanges) {
      expect(
        ex.referralLink.toLowerCase(),
        `${ex.slug} link does not include referral code ${ex.referralCode}`
      ).toContain(ex.referralCode.toLowerCase());
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
    expect(slugs).toContain("kucoin");
    expect(slugs).toContain("huobi");
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

  it("lastReviewed is not in the future and stays recent", () => {
    const now = Date.now();
    const oneYearMs = 366 * 24 * 60 * 60 * 1000;

    for (const ex of exchanges) {
      const reviewedAt = new Date(`${ex.lastReviewed}T00:00:00.000Z`).getTime();
      expect(reviewedAt).toBeLessThanOrEqual(now);
      expect(now - reviewedAt).toBeLessThanOrEqual(oneYearMs);
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

  it("rebate percentages are numeric and within 1-100%", () => {
    for (const ex of exchanges) {
      const spot = Number.parseFloat(ex.spotRebate.replace("%", ""));
      const futures = Number.parseFloat(ex.futuresRebate.replace("%", ""));

      expect(Number.isFinite(spot)).toBe(true);
      expect(Number.isFinite(futures)).toBe(true);
      expect(spot).toBeGreaterThan(0);
      expect(futures).toBeGreaterThan(0);
      expect(spot).toBeLessThanOrEqual(100);
      expect(futures).toBeLessThanOrEqual(100);
    }
  });

  it("region restrictions are non-empty, deduplicated labels", () => {
    for (const ex of exchanges) {
      expect(ex.regionRestrictions.length).toBeGreaterThan(0);
      expect(new Set(ex.regionRestrictions).size).toBe(ex.regionRestrictions.length);
      for (const region of ex.regionRestrictions) {
        expect(region.trim().length).toBeGreaterThan(0);
      }
    }
  });

  it.each(localeMessages)(
    "includes complete exchange translations for %s",
    (_locale, messages) => {
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
    }
  );

  it.each(localeMessages)(
    "includes required home conversion copy keys for %s",
    (_locale, messages) => {
      for (const key of requiredHomeKeys) {
        expect(messages.home).toHaveProperty(key);
        expect(messages.home[key]).toBeTruthy();
      }
    }
  );

  it.each(localeMessages)(
    "includes core metadata keys for %s",
    (_locale, messages) => {
      for (const key of requiredMetadataKeys) {
        expect(messages.metadata).toHaveProperty(key);
        expect(messages.metadata[key]).toBeTruthy();
      }
    }
  );
});
