import { describe, expect, it } from "vitest";
import { getDefaultCompetitorGapSummary, normalizeCompetitorGapSummary } from "./competitor-gap";

describe("competitor gap summary", () => {
  it("returns a safe default summary", () => {
    const summary = getDefaultCompetitorGapSummary();
    expect(summary.status).toBe("never_run");
    expect(summary.findings).toEqual([]);
    expect(summary.summary).toContain("尚无竞品空缺扫描结果");
  });

  it("normalizes partial inputs into a complete summary", () => {
    const summary = normalizeCompetitorGapSummary({
      status: "success",
      findings: [{ topic: "binance official site", suggestedAction: "publish" }],
    });

    expect(summary.status).toBe("success");
    expect(summary.publishCandidates).toBe(0);
    expect(summary.findings[0]?.topic).toBe("binance official site");
    expect(summary.findings[0]?.suggestedAction).toBe("publish");
    expect(summary.findings[0]?.exchangeSlug).toBe("cross-exchange");
  });
});
