import fs from "node:fs/promises";
import path from "node:path";
import { exchanges } from "@/data/exchanges";
import { readCompetitorGapSummary } from "@/lib/automation/competitor-gap";
import type {
  CompetitorGapActionPlan,
  CompetitorGapFinding,
  CompetitorGapPageAction,
  CompetitorGapSummary,
} from "@/lib/automation/types";

const COMPETITOR_GAP_ACTIONS_PATH = path.join(
  process.cwd(),
  "src",
  "data",
  "generated",
  "competitor-gap-actions.json"
);

const CORE_PRIORITY_PAGE_TYPES = [
  "official-site",
  "referral-code",
  "signup-kyc",
  "fees-rebate",
] as const;

const HIGH_PRIORITY_EXCHANGES = new Set(["binance", "okx", "bybit"]);
const VALID_EXCHANGE_SLUGS = new Set(exchanges.map((exchange) => exchange.slug));
const FALLBACK_INTERNAL_LINK_EXCHANGES = ["binance", "okx"] as const;

function unique<T>(values: T[]) {
  return [...new Set(values)];
}

function buildRoutePath(exchangeSlug: string, pageType: string) {
  return `/exchanges/${exchangeSlug}/${pageType}`;
}

function inferPageTypes(finding: CompetitorGapFinding): string[] {
  const strongHaystack = `${finding.topic} ${finding.competitorPattern}`.toLowerCase();
  const supportHaystack = finding.ourGap.toLowerCase();
  const pageTypes: string[] = [];

  if (
    strongHaystack.includes("official site") ||
    strongHaystack.includes("official domain") ||
    strongHaystack.includes("phishing") ||
    supportHaystack.includes("official domain")
  ) {
    pageTypes.push("official-site");
  }
  if (
    strongHaystack.includes("referral") ||
    strongHaystack.includes("invite") ||
    strongHaystack.includes("referral code") ||
    strongHaystack.includes("invite link") ||
    supportHaystack.includes("manual referral")
  ) {
    pageTypes.push("referral-code");
  }
  if (
    strongHaystack.includes("signup") ||
    strongHaystack.includes("sign up") ||
    strongHaystack.includes("kyc") ||
    strongHaystack.includes("register") ||
    supportHaystack.includes("signup/kyc")
  ) {
    pageTypes.push("signup-kyc");
  }
  if (/(^|\b)(fee|fees|rebate)\b/.test(strongHaystack)) {
    pageTypes.push("fees-rebate");
  }
  if (
    strongHaystack.includes("country") ||
    strongHaystack.includes("residence") ||
    strongHaystack.includes("region") ||
    strongHaystack.includes("restriction") ||
    supportHaystack.includes("eligibility")
  ) {
    pageTypes.push("country-availability");
  }
  if (
    strongHaystack.includes("fallback") ||
    strongHaystack.includes("fail") ||
    strongHaystack.includes("friction") ||
    strongHaystack.includes("troubleshooting") ||
    strongHaystack.includes("confusion") ||
    strongHaystack.includes("help-center") ||
    strongHaystack.includes("help center") ||
    supportHaystack.includes("fallback")
  ) {
    pageTypes.push("verification-troubleshooting");
  }

  if (finding.exchangeSlug === "cross-exchange" && finding.suggestedAction === "internal-link") {
    return ["official-site", "signup-kyc"];
  }

  if (pageTypes.length === 0) {
    pageTypes.push(
      finding.suggestedAction === "publish" ? "verification-troubleshooting" : "official-site"
    );
  }

  if (finding.suggestedAction === "publish") {
    const publishable = pageTypes.filter((pageType) => !CORE_PRIORITY_PAGE_TYPES.includes(pageType as (typeof CORE_PRIORITY_PAGE_TYPES)[number]));
    if (publishable.length > 0) {
      return unique(publishable);
    }
    return ["verification-troubleshooting"];
  }

  return unique(pageTypes);
}

function inferPriority(finding: CompetitorGapFinding, pageType: string): CompetitorGapPageAction["priority"] {
  if (
    finding.confidence === "high" &&
    HIGH_PRIORITY_EXCHANGES.has(finding.exchangeSlug) &&
    CORE_PRIORITY_PAGE_TYPES.includes(pageType as (typeof CORE_PRIORITY_PAGE_TYPES)[number])
  ) {
    return "p1";
  }

  if (finding.confidence === "high" || pageType === "verification-troubleshooting") {
    return "p2";
  }

  return "p3";
}

function buildActionTitle(finding: CompetitorGapFinding, pageType: string) {
  const actionLabel =
    finding.suggestedAction === "publish"
      ? "新建"
      : finding.suggestedAction === "refresh"
        ? "刷新"
        : finding.suggestedAction === "internal-link"
          ? "内链推送"
          : "分发";

  return `${actionLabel} ${finding.exchangeSlug === "cross-exchange" ? "重点交易所" : finding.exchangeSlug} ${pageType}`;
}

function buildReason(finding: CompetitorGapFinding, pageType: string) {
  return `${finding.topic} → ${pageType}：${finding.ourGap}`;
}

function createAction(
  finding: CompetitorGapFinding,
  exchangeSlug: string,
  locale: string,
  pageType: string,
  index = 0
): CompetitorGapPageAction {
  return {
    id: `${finding.id}:${exchangeSlug}:${locale}:${pageType}:${index}`,
    findingId: finding.id,
    action: finding.suggestedAction === "defer" ? "refresh" : finding.suggestedAction,
    priority: inferPriority(finding, pageType),
    exchangeSlug: exchangeSlug as CompetitorGapPageAction["exchangeSlug"],
    locale,
    pageType,
    routePath: buildRoutePath(exchangeSlug, pageType),
    title: buildActionTitle(finding, pageType),
    topic: finding.topic,
    reason: buildReason(finding, pageType),
    confidence: finding.confidence,
    sourceCompetitorType: finding.competitorType,
  };
}

function expandFindingToActions(finding: CompetitorGapFinding): CompetitorGapPageAction[] {
  const pageTypes = inferPageTypes(finding);

  if (finding.exchangeSlug !== "cross-exchange" && VALID_EXCHANGE_SLUGS.has(finding.exchangeSlug)) {
    const locale = finding.locale === "multi-locale" ? "en" : finding.locale;
    return pageTypes.map((pageType, index) =>
      createAction(finding, finding.exchangeSlug, locale, pageType, index)
    );
  }

  const crossExchangePageTypes = pageTypes.length > 0 ? pageTypes : ["verification-troubleshooting"];
  return FALLBACK_INTERNAL_LINK_EXCHANGES.flatMap((exchangeSlug) =>
    crossExchangePageTypes.map((pageType, index) =>
      createAction(finding, exchangeSlug, "en", pageType, index)
    )
  );
}

export function deriveCompetitorGapActions(summary: CompetitorGapSummary): CompetitorGapPageAction[] {
  if (summary.status === "never_run") return [];

  return summary.findings
    .filter((finding) => finding.suggestedAction !== "defer")
    .flatMap(expandFindingToActions)
    .sort((a, b) => {
      const priorityRank = { p1: 0, p2: 1, p3: 2 };
      const actionRank = { refresh: 0, publish: 1, "internal-link": 2, distribution: 3 };
      return (
        priorityRank[a.priority] - priorityRank[b.priority] ||
        actionRank[a.action] - actionRank[b.action] ||
        a.exchangeSlug.localeCompare(b.exchangeSlug) ||
        a.pageType.localeCompare(b.pageType)
      );
    });
}

export function getDefaultCompetitorGapActionPlan(): CompetitorGapActionPlan {
  return {
    status: "never_run",
    generatedAt: "",
    summaryGeneratedAt: "",
    totalActions: 0,
    publishActions: 0,
    refreshActions: 0,
    internalLinkActions: 0,
    distributionActions: 0,
    actions: [],
  };
}

export function buildCompetitorGapActionPlan(summary: CompetitorGapSummary): CompetitorGapActionPlan {
  const actions = deriveCompetitorGapActions(summary);
  return {
    status: summary.status === "failed" ? "failed" : summary.status === "never_run" ? "never_run" : actions.length > 0 ? "success" : "warning",
    generatedAt: new Date().toISOString(),
    summaryGeneratedAt: summary.generatedAt,
    totalActions: actions.length,
    publishActions: actions.filter((action) => action.action === "publish").length,
    refreshActions: actions.filter((action) => action.action === "refresh").length,
    internalLinkActions: actions.filter((action) => action.action === "internal-link").length,
    distributionActions: actions.filter((action) => action.action === "distribution").length,
    actions,
  };
}

export async function readCompetitorGapActionPlan(): Promise<CompetitorGapActionPlan> {
  try {
    const raw = await fs.readFile(COMPETITOR_GAP_ACTIONS_PATH, "utf8");
    return JSON.parse(raw) as CompetitorGapActionPlan;
  } catch {
    return getDefaultCompetitorGapActionPlan();
  }
}

export async function writeCompetitorGapActionPlan(plan: CompetitorGapActionPlan) {
  await fs.mkdir(path.dirname(COMPETITOR_GAP_ACTIONS_PATH), { recursive: true });
  await fs.writeFile(COMPETITOR_GAP_ACTIONS_PATH, `${JSON.stringify(plan, null, 2)}\n`, "utf8");
}

export async function materializeCompetitorGapActionPlan() {
  const summary = await readCompetitorGapSummary();
  const plan = buildCompetitorGapActionPlan(summary);
  await writeCompetitorGapActionPlan(plan);
  return plan;
}

export { COMPETITOR_GAP_ACTIONS_PATH };
