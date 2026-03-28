import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  buildCompetitorGapSerpWinnersArtifact,
  buildCompetitorGapSummaryFromResearch,
  extractDuckDuckGoHtmlResults,
  loadCompetitorGapResearchTemplates,
  normalizeResearchProviders,
  selectPersistedCompetitorGapSummary,
} from "./competitor-gap-research";

const sampleHtml = `
<div class="result">
  <a class="result__a" href="https://www.binance.com/en/support/faq">Binance Referral Program | Binance</a>
  <a class="result__snippet">Use the official Binance referral page and avoid phishing domains.</a>
</div>
<div class="result">
  <a class="result__a" href="https://example-affiliate.com/binance-code">Best Binance referral code</a>
  <a class="result__snippet">Third-party invite code article with signup tips.</a>
</div>
`;

describe("competitor gap live research", () => {
  it("extracts live SERP results from DuckDuckGo HTML", () => {
    const results = extractDuckDuckGoHtmlResults(sampleHtml);

    expect(results).toHaveLength(2);
    expect(results[0]).toEqual(
      expect.objectContaining({
        title: "Binance Referral Program | Binance",
        url: "https://www.binance.com/en/support/faq",
      })
    );
    expect(results[0]?.snippet).toContain("official Binance referral");
  });

  it("chooses multiple providers from env and explicit input", () => {
    expect(normalizeResearchProviders(undefined, { SERPER_API_KEY: "a", BRAVE_SEARCH_API_KEY: "b" } as NodeJS.ProcessEnv)).toEqual([
      "serper",
      "brave",
      "duckduckgo-html",
    ]);

    expect(normalizeResearchProviders("brave,duckduckgo-html,brave")).toEqual([
      "brave",
      "duckduckgo-html",
    ]);
  });

  it("loads configurable query templates from JSON", async () => {
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "competitor-gap-"));
    const configPath = path.join(tempDir, "templates.json");
    await fs.writeFile(
      configPath,
      JSON.stringify([
        {
          templateId: "finding-binance-official-trust",
          query: "binance invite code official site",
          topic: "custom binance trust layer",
        },
      ])
    );

    const templates = await loadCompetitorGapResearchTemplates(configPath);
    expect(templates).toHaveLength(1);
    expect(templates[0]?.query).toBe("binance invite code official site");
    expect(templates[0]?.topic).toBe("custom binance trust layer");
  });

  it("supports custom template ids when observations carry template metadata", () => {
    const summary = buildCompetitorGapSummaryFromResearch([
      {
        templateId: "custom-mexc-login-gap",
        query: "mexc login referral code issue",
        results: [
          {
            title: "MEXC help center login issue",
            url: "https://www.mexc.com/support/login-issue",
            snippet: "Official help page for login and referral issues.",
            domain: "mexc.com",
          },
        ],
        template: {
          templateId: "custom-mexc-login-gap",
          query: "mexc login referral code issue",
          exchangeSlug: "mexc",
          locale: "en",
          topic: "mexc login / referral troubleshooting",
          suggestedAction: "publish",
          confidence: "medium",
          defaultCompetitorType: "help-center",
          ourGap: "We need a clearer MEXC troubleshooting page for login and referral issues.",
        },
      },
    ]);

    expect(summary.status).toBe("success");
    expect(summary.findings[0]?.exchangeSlug).toBe("mexc");
    expect(summary.findings[0]?.topic).toContain("mexc login");
  });

  it("builds missing-gap and SERP-winners artifacts from observations", () => {
    const observations = [
      {
        templateId: "finding-binance-official-trust",
        query: "binance official site referral code",
        results: extractDuckDuckGoHtmlResults(sampleHtml),
        providerReports: [
          { provider: "duckduckgo-html" as const, status: "success" as const, resultCount: 2 },
          { provider: "brave" as const, status: "failed" as const, resultCount: 0, error: "Missing API key" },
        ],
      },
      {
        templateId: "finding-okx-signup-fallback",
        query: "okx signup referral code restrictions",
        results: [
          {
            title: "OKX referral code FAQ",
            url: "https://www.okx.com/help/okx-referral-code-faq",
            snippet: "Users can enter a referral code manually and restrictions depend on residence.",
            domain: "okx.com",
          },
        ],
        providerReports: [
          { provider: "duckduckgo-html" as const, status: "success" as const, resultCount: 1 },
        ],
      },
    ];

    const summary = buildCompetitorGapSummaryFromResearch(observations);
    const winners = buildCompetitorGapSerpWinnersArtifact({
      observations,
      providersRequested: ["duckduckgo-html", "brave"],
    });

    expect(summary.status).toBe("success");
    expect(summary.topicsReviewed).toBe(2);
    expect(summary.serpWinnersLearnedFrom).toBeGreaterThanOrEqual(2);
    expect(summary.findings[0]?.competitorPattern).toContain("binance.com");
    expect(summary.findings.some((finding) => finding.exchangeSlug === "okx")).toBe(true);

    expect(winners.status).toBe("success");
    expect(winners.providersRequested).toEqual(["duckduckgo-html", "brave"]);
    expect(winners.records[0]?.providersUsed).toEqual(["duckduckgo-html"]);
    expect(winners.records[0]?.dominantDomains).toContain("binance.com");
    expect(winners.totalWinnerUrls).toBe(3);
  });

  it("keeps the previous missing-gap summary when live research has no findings", () => {
    const fallback = selectPersistedCompetitorGapSummary(
      {
        status: "warning",
        generatedAt: "2026-03-28T00:00:00Z",
        summary: "No winners found",
        serpWinnersLearnedFrom: 0,
        topicsReviewed: 5,
        publishCandidates: 0,
        refreshCandidates: 0,
        internalLinkCandidates: 0,
        distributionCandidates: 0,
        findings: [],
      },
      {
        status: "success",
        generatedAt: "2026-03-27T00:00:00Z",
        summary: "Existing summary",
        serpWinnersLearnedFrom: 6,
        topicsReviewed: 8,
        publishCandidates: 2,
        refreshCandidates: 3,
        internalLinkCandidates: 2,
        distributionCandidates: 2,
        findings: [
          {
            id: "finding-binance-official-trust",
            exchangeSlug: "binance",
            locale: "en",
            topic: "existing",
            competitorType: "official",
            competitorPattern: "existing",
            ourGap: "existing",
            suggestedAction: "refresh",
            confidence: "high",
          },
        ],
      }
    );

    expect(fallback.usedFallbackSummary).toBe(true);
    expect(fallback.summary.summary).toBe("Existing summary");
  });
});
