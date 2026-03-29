import { describe, expect, it } from "vitest";
import { getUnifiedSeoEntry } from "./catalog";
import { buildSerpBlockModel } from "./serp-blocks";

describe("serp blocks", () => {
  it("builds domain, comparison, steps, and restrictions for focus pages", () => {
    const entry = getUnifiedSeoEntry("en", "binance", "official-site");
    expect(entry).toBeDefined();

    const model = buildSerpBlockModel(entry!);

    expect(model.domainCheck.officialDomain).toContain("binance.com");
    expect(model.comparisonRows).toHaveLength(3);
    expect(model.signupSteps.length).toBeGreaterThanOrEqual(4);
    expect(model.regionRestrictions.length).toBeGreaterThan(0);
    expect(model.regionSummary.toLowerCase()).toContain("restricted");
  });
});
