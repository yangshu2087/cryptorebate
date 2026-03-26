import { describe, expect, it } from "vitest";
import { buildAutomationState } from "./engine";

describe("internal link refresh manifest", () => {
  it("builds exchange groups and prioritizes surfaced guides", () => {
    const state = buildAutomationState();

    expect(state.internalLinks.exchangeGroups.length).toBeGreaterThan(0);

    const binanceEnGroup = state.internalLinks.exchangeGroups.find(
      (group) => group.locale === "en" && group.exchangeSlug === "binance"
    );

    expect(binanceEnGroup).toBeDefined();
    expect(binanceEnGroup?.guides.length).toBeGreaterThan(0);
    expect(binanceEnGroup?.guides[0]?.href).toContain("/exchanges/binance/");
    expect(binanceEnGroup?.guides.some((guide) => guide.pageType === "official-site")).toBe(
      true
    );
  });
});
