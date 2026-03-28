import fs from "node:fs/promises";
import path from "node:path";
import type { CompetitorGapFinding, CompetitorGapSummary } from "@/lib/automation/types";

const COMPETITOR_GAP_SUMMARY_PATH = path.join(
  process.cwd(),
  "src",
  "data",
  "generated",
  "competitor-gap-summary.json"
);

export function getDefaultCompetitorGapSummary(): CompetitorGapSummary {
  return {
    status: "never_run",
    generatedAt: "",
    summary: "尚无竞品空缺扫描结果。",
    serpWinnersLearnedFrom: 0,
    topicsReviewed: 0,
    publishCandidates: 0,
    refreshCandidates: 0,
    internalLinkCandidates: 0,
    distributionCandidates: 0,
    findings: [],
  };
}

function normalizeFinding(item: unknown, index: number): CompetitorGapFinding {
  const record = item && typeof item === "object" ? (item as Record<string, unknown>) : {};

  return {
    id: String(record.id ?? `finding-${index}`),
    exchangeSlug:
      (record.exchangeSlug as CompetitorGapFinding["exchangeSlug"] | undefined) ??
      "cross-exchange",
    locale:
      (record.locale as CompetitorGapFinding["locale"] | undefined) ?? "multi-locale",
    topic: String(record.topic ?? "未命名主题"),
    competitorType:
      (record.competitorType as CompetitorGapFinding["competitorType"] | undefined) ??
      "mixed",
    competitorPattern: String(record.competitorPattern ?? ""),
    ourGap: String(record.ourGap ?? ""),
    suggestedAction:
      (record.suggestedAction as CompetitorGapFinding["suggestedAction"] | undefined) ??
      "defer",
    confidence:
      (record.confidence as CompetitorGapFinding["confidence"] | undefined) ?? "medium",
  };
}

export function normalizeCompetitorGapSummary(input: unknown): CompetitorGapSummary {
  const fallback = getDefaultCompetitorGapSummary();
  if (!input || typeof input !== "object") return fallback;
  const record = input as Record<string, unknown>;

  return {
    status: (record.status as CompetitorGapSummary["status"] | undefined) ?? fallback.status,
    generatedAt: String(record.generatedAt ?? fallback.generatedAt),
    summary: String(record.summary ?? fallback.summary),
    serpWinnersLearnedFrom: Number(record.serpWinnersLearnedFrom ?? 0),
    topicsReviewed: Number(record.topicsReviewed ?? 0),
    publishCandidates: Number(record.publishCandidates ?? 0),
    refreshCandidates: Number(record.refreshCandidates ?? 0),
    internalLinkCandidates: Number(record.internalLinkCandidates ?? 0),
    distributionCandidates: Number(record.distributionCandidates ?? 0),
    findings: Array.isArray(record.findings) ? record.findings.map(normalizeFinding) : [],
  };
}

export async function readCompetitorGapSummary(): Promise<CompetitorGapSummary> {
  try {
    const raw = await fs.readFile(COMPETITOR_GAP_SUMMARY_PATH, "utf8");
    return normalizeCompetitorGapSummary(JSON.parse(raw));
  } catch {
    return getDefaultCompetitorGapSummary();
  }
}
