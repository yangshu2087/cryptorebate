import { describe, it, expect } from "vitest";
import { parseRebate, calculateSavings } from "./rebate";

describe("parseRebate", () => {
  it("parses fixed rebate like '20%'", () => {
    const result = parseRebate("20%");
    expect(result.min).toBe(0.2);
    expect(result.max).toBe(0.2);
    expect(result.display).toBe(0.2);
  });

  it("parses range rebate like '20-45%'", () => {
    const result = parseRebate("20-45%");
    expect(result.min).toBe(0.2);
    expect(result.max).toBe(0.45);
    expect(result.display).toBe(0.2); // conservative: uses min
  });

  it("parses range rebate like '20-70%'", () => {
    const result = parseRebate("20-70%");
    expect(result.min).toBe(0.2);
    expect(result.max).toBe(0.7);
  });

  it("parses '33%'", () => {
    const result = parseRebate("33%");
    expect(result.min).toBeCloseTo(0.33);
    expect(result.max).toBeCloseTo(0.33);
  });
});

describe("calculateSavings", () => {
  it("calculates correctly for fixed rebate", () => {
    const result = calculateSavings(100000, 0.001, 0.001, "20%");
    expect(result.monthlyFee).toBe(100); // 100000 * 0.001
    expect(result.monthlyRebateMin).toBe(20); // 100 * 0.2
    expect(result.yearlyMin).toBe(240); // 20 * 12
    expect(result.isRange).toBe(false);
  });

  it("calculates correctly for range rebate", () => {
    const result = calculateSavings(100000, 0.001, 0.001, "20-45%");
    expect(result.monthlyFee).toBe(100);
    expect(result.monthlyRebateMin).toBe(20);
    expect(result.monthlyRebateMax).toBe(45);
    expect(result.yearlyMin).toBe(240);
    expect(result.yearlyMax).toBe(540);
    expect(result.isRange).toBe(true);
  });

  it("returns 0 for 0 volume", () => {
    const result = calculateSavings(0, 0.001, 0.001, "20%");
    expect(result.monthlyFee).toBe(0);
    expect(result.yearlyMin).toBe(0);
  });
});
