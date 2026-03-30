import type { Exchange } from "@/types/exchange";
import type { OpportunityFocusLane } from "./focus";

export const AUTOMATION_DYNAMIC_PAGE_TYPES = [
  "login",
  "country-availability",
  "deposit-withdrawal",
  "copy-trading",
  "trading-bot",
  "proof-of-reserves",
  "verification-troubleshooting",
  "new-listings",
] as const;

export type AutomationDynamicPageType =
  (typeof AUTOMATION_DYNAMIC_PAGE_TYPES)[number];

export type AutomationSource = "gsc" | "manual" | "analytics" | "partner";

export type ExternalSyncStatus =
  | "success"
  | "failed"
  | "skipped"
  | "disabled"
  | "unknown";

export type AutomationLifecycleStage =
  | "discovered"
  | "generated"
  | "validated"
  | "published"
  | "refresh_due"
  | "underperforming"
  | "quarantined"
  | "deprecated";

export type QuerySignal = {
  id: string;
  source: AutomationSource;
  locale: string;
  exchangeSlug: Exchange["slug"];
  query: string;
  intent: string;
  pageType: string;
  impressions: number;
  clicks: number;
  ctr: number;
  position: number;
  growthRate: number;
  observedAt: string;
  monetizationPotential: number;
};

export type QueryCluster = {
  id: string;
  locale: string;
  exchangeSlug: Exchange["slug"];
  intent: string;
  pageType: string;
  queries: string[];
  demand: number;
  monetization: number;
  rankGap: number;
  intentClarity: number;
  freshnessNeed: number;
  localePriority: number;
  exchangePriority: number;
  score: number;
  observedAt: string;
};

export type QueryOpportunity = {
  id: string;
  clusterId: string;
  locale: string;
  exchangeSlug: Exchange["slug"];
  intent: string;
  pageType: string;
  primaryQuery: string;
  score: number;
  recommendedAction: "publish" | "refresh" | "expand" | "prune";
  stage: AutomationLifecycleStage;
  focusLane: OpportunityFocusLane;
  discoveryPriority: number;
  qualityScore: number;
  projectedEpcUsd: number;
  projectedMonthlyRevenueUsd: number;
  observedAt: string;
};

export type ContentBrief = {
  id: string;
  opportunityId: string;
  locale: string;
  exchangeSlug: Exchange["slug"];
  pageType: string;
  primaryQuery: string;
  angle: string;
  mustCoverFacts: string[];
  ctaType: "register" | "learn" | "compare";
  comparisonPeers: [Exchange["slug"], Exchange["slug"]];
  generatedAt: string;
};

export type AutomationSeoPage = {
  id: string;
  locale: string;
  exchangeSlug: Exchange["slug"];
  pageType: string;
  queryClusterId: string;
  primaryQuery: string;
  secondaryQueries: string[];
  metadata: {
    title: string;
    description: string;
    keywords: string[];
  };
  heroTitle: string;
  heroDescription: string;
  answerBox: {
    title: string;
    body: string;
    bullets: string[];
  };
  factCard: { label: string; value: string }[];
  fit: {
    title: string;
    goodFor: string[];
    notIdealFor: string[];
  };
  sections: { title: string; body: string; bullets?: string[] }[];
  faq: { q: string; a: string }[];
  cta: {
    label: string;
    helperText: string;
    href?: string;
  };
  lastReviewed: string;
  refreshDueAt: string;
  stage: AutomationLifecycleStage;
  qualityScore: number;
  publishedAt?: string;
};

export type AffiliateClick = {
  id: string;
  exchangeSlug: Exchange["slug"];
  locale: string;
  pageType: string;
  pageUrl: string;
  queryClusterId: string;
  clickedAt: string;
  source?: "client" | "imported" | "synthetic";
  dataSource?: "real" | "synthetic";
  targetUrl?: string;
  sessionId?: string;
  visitorId?: string;
  primaryQuery?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
  referrer?: string;
};

export type ConversionEvent = {
  id: string;
  exchangeSlug: Exchange["slug"];
  queryClusterId: string;
  registeredAt: string;
  tradedAt?: string;
  firstDepositUsd?: number;
  status: "registered" | "funded" | "traded";
  source?: "api" | "csv" | "imported" | "synthetic";
  dataSource?: "real" | "synthetic";
};

export type CommissionEvent = {
  id: string;
  exchangeSlug: Exchange["slug"];
  queryClusterId: string;
  commissionUsd: number;
  recordedAt: string;
  source: "api" | "csv" | "synthetic";
  dataSource?: "real" | "synthetic";
};

export type EarningsSnapshot = {
  id: string;
  exchangeSlug: Exchange["slug"];
  date: string;
  clicks: number;
  registrations: number;
  fundedUsers: number;
  tradedUsers: number;
  commissionUsd: number;
  epcUsd: number;
};

export type RoiEntry = {
  id: string;
  key: string;
  locale: string;
  exchangeSlug: Exchange["slug"];
  pageType: string;
  primaryQuery: string;
  clicks: number;
  registrations: number;
  commissionsUsd: number;
  epcUsd: number;
  rpmUsd: number;
  observedAt: string;
};

export type CompetitorGapAction =
  | "publish"
  | "refresh"
  | "internal-link"
  | "distribution"
  | "defer";

export type CompetitorGapFinding = {
  id: string;
  exchangeSlug: Exchange["slug"] | "cross-exchange";
  locale: string | "multi-locale";
  topic: string;
  competitorType: "official" | "affiliate" | "review" | "help-center" | "mixed";
  competitorPattern: string;
  ourGap: string;
  suggestedAction: CompetitorGapAction;
  confidence: "high" | "medium" | "low";
};

export type CompetitorGapSummary = {
  status: "success" | "warning" | "failed" | "skipped" | "never_run";
  generatedAt: string;
  summary: string;
  serpWinnersLearnedFrom: number;
  topicsReviewed: number;
  publishCandidates: number;
  refreshCandidates: number;
  internalLinkCandidates: number;
  distributionCandidates: number;
  findings: CompetitorGapFinding[];
};

export type CompetitorGapSerpResearchProvider = "duckduckgo-html" | "serper" | "brave";

export type CompetitorGapSerpResult = {
  title: string;
  url: string;
  snippet: string;
  domain: string;
};

export type CompetitorGapSerpProviderReport = {
  provider: CompetitorGapSerpResearchProvider;
  status: "success" | "failed" | "skipped";
  resultCount: number;
  error?: string;
};

export type CompetitorGapSerpWinnerRecord = {
  templateId: string;
  query: string;
  exchangeSlug: Exchange["slug"] | "cross-exchange";
  locale: string | "multi-locale";
  topic: string;
  providersUsed: CompetitorGapSerpResearchProvider[];
  providerReports: CompetitorGapSerpProviderReport[];
  dominantDomains: string[];
  topResults: CompetitorGapSerpResult[];
};

export type CompetitorGapSerpWinnersArtifact = {
  status: "success" | "warning" | "failed" | "never_run";
  generatedAt: string;
  providersRequested: CompetitorGapSerpResearchProvider[];
  templateCount: number;
  totalWinnerUrls: number;
  records: CompetitorGapSerpWinnerRecord[];
};

export type CompetitorGapPageAction = {
  id: string;
  findingId: string;
  action: Exclude<CompetitorGapAction, "defer">;
  priority: "p1" | "p2" | "p3";
  exchangeSlug: Exchange["slug"];
  locale: string;
  pageType: string;
  routePath: string;
  title: string;
  topic: string;
  reason: string;
  confidence: CompetitorGapFinding["confidence"];
  sourceCompetitorType: CompetitorGapFinding["competitorType"];
};

export type CompetitorGapActionPlan = {
  status: "success" | "warning" | "failed" | "never_run";
  generatedAt: string;
  summaryGeneratedAt: string;
  totalActions: number;
  publishActions: number;
  refreshActions: number;
  internalLinkActions: number;
  distributionActions: number;
  actions: CompetitorGapPageAction[];
};

export type AutomationAlert = {
  id: string;
  level: "info" | "warning" | "critical";
  type:
    | "publish_rate_limit"
    | "sync_failure"
    | "external_workflow_failure"
    | "schema_validation"
    | "ctr_collapse"
    | "index_no_click"
    | "gsc_page_row_first_seen"
    | "earnings_anomaly"
    | "dead_link";
  message: string;
  scope: {
    locale?: string;
    exchangeSlug?: Exchange["slug"];
    pageType?: string;
  };
  triggeredAt: string;
  href?: string;
  source?: "internal" | "external";
  sourceLabel?: string;
};

export type GscFocusPageRowMonitorEntry = {
  key: string;
  locale: string;
  exchangeSlug: Exchange["slug"];
  pageType: string;
  routePath: string;
  url: string;
  seenInPageRows: boolean;
  firstSeenAt?: string;
  lastSeenAt?: string;
  lastCheckedAt: string;
  latestImpressions?: number;
  latestClicks?: number;
  latestCtr?: number;
  latestPosition?: number;
};

export type ExternalGscSyncState = {
  enabled: boolean;
  configured: boolean;
  status: ExternalSyncStatus;
  authMode?: "service-account" | "refresh-token";
  property?: string;
  lastSyncAt?: string;
  rowsFetched: number;
  signalsWritten: number;
  searchAnalyticsMode?: "query-page" | "page-only" | "empty";
  note?: string;
  focusPageRows?: GscFocusPageRowMonitorEntry[];
  sitemapSubmitStatus?: ExternalSyncStatus;
  sitemapsSubmitted?: string[];
  lastSitemapSubmitAt?: string;
  sitemapSubmitError?: string;
  error?: string;
};

export type ExternalPartnerSyncState = {
  exchangeSlug: Exchange["slug"];
  enabled: boolean;
  configured: boolean;
  status: ExternalSyncStatus;
  provider?: "generic" | "csv-portal" | "okx-broker" | "gate-api4";
  format?: "json" | "csv";
  method?: "GET" | "POST";
  mode?: "combined" | "commissions" | "conversions";
  fallbackLocale?: string;
  fallbackPageType?: string;
  lastSyncAt?: string;
  recordsFetched: number;
  conversionsWritten: number;
  commissionsWritten: number;
  error?: string;
};

export type ExternalSourcesState = {
  generatedAt?: string;
  gsc: ExternalGscSyncState;
  partners: ExternalPartnerSyncState[];
};

export type DistributionChannel = "telegram" | "x";

export type DistributionJobStatus =
  | "pending"
  | "queued"
  | "in_progress"
  | "published"
  | "failed"
  | "skipped";

export type DistributionJobPayload = {
  title: string;
  summary: string;
  url: string;
  exchangeSlug?: Exchange["slug"] | null;
  pageType?: string | null;
  topic?: string | null;
  primaryQuery?: string | null;
  refreshScore?: number | null;
  source?: "page" | "brand" | "internal-link-refresh" | "gsc-focus-page-row";
  sourceLabel?: string | null;
  tags?: string[];
};

export type DistributionJob = {
  id: string;
  channel: DistributionChannel;
  locale: string;
  exchangeSlug?: Exchange["slug"] | null;
  pageType?: string | null;
  topic?: string | null;
  routePath: string;
  status: DistributionJobStatus;
  payload: DistributionJobPayload;
  retryCount: number;
  lastAttemptAt?: string | null;
  nextAttemptAt?: string | null;
  error?: string | null;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string | null;
};

export type AutomationInternalLinkTarget = {
  locale: string;
  exchangeSlug: Exchange["slug"];
  pageType: string;
  href: string;
  title: string;
  primaryQuery: string;
  source: "base" | "dynamic";
  score: number;
};

export type AutomationInternalLinkGroup = {
  locale: string;
  exchangeSlug: Exchange["slug"];
  guides: AutomationInternalLinkTarget[];
};

export type AutomationInternalLinkLocaleSlot = {
  locale: string;
  guides: AutomationInternalLinkTarget[];
};

export type AutomationInternalLinkQuestionSlot = {
  locale: string;
  pageType: string;
  guides: AutomationInternalLinkTarget[];
};

export type AutomationInternalLinkExchangeSlot = {
  locale: string;
  exchangeSlug: Exchange["slug"];
  guides: AutomationInternalLinkTarget[];
};

export type AutomationInternalLinkBrandSlot = {
  locale: string;
  topic: string;
  guides: AutomationInternalLinkTarget[];
};

export type AutomationInternalLinkManifest = {
  refreshedAt: string;
  exchangeGroups: AutomationInternalLinkGroup[];
  slots: {
    homepageHeroSecondary: AutomationInternalLinkLocaleSlot[];
    homepageQuestionClusters: AutomationInternalLinkQuestionSlot[];
    exchangeHubFocus: AutomationInternalLinkLocaleSlot[];
    exchangeDetailFocus: AutomationInternalLinkExchangeSlot[];
    brandSupporting: AutomationInternalLinkBrandSlot[];
  };
};

export type AutomationRun = {
  id: string;
  job:
    | "daily_gsc_ingest"
    | "daily_query_clustering"
    | "daily_opportunity_scoring"
    | "daily_page_generation"
    | "daily_page_publish"
    | "daily_page_refresh"
    | "daily_internal_link_refresh"
    | "daily_coverage_audit"
    | "daily_distribution_enqueue"
    | "daily_distribution_publish"
    | "daily_alert_eval"
    | "daily_revenue_sync"
    | "daily_roi_recompute"
    | "monthly_partner_csv_import"
    | "weekly_staleness_audit"
    | "weekly_underperformance_pruning"
    | "weekly_competitor_gap_scan";
  status: "success" | "warning" | "failed";
  startedAt: string;
  completedAt: string;
  summary: string;
};

export type AutomationControlPlane = {
  paused: boolean;
  rolloutMode: "full-automatic";
  publishDailyLimitPerExchange: number;
  refreshDailyLimitPerExchange: number;
  quarantinedLocales: string[];
  quarantinedExchanges: Exchange["slug"][];
  quarantinedPageTypes: string[];
  quarantinedPageKeys: string[];
};

export type AutomationMetrics = {
  totalSignals: number;
  totalOpportunities: number;
  publishedPages: number;
  quarantinedPages: number;
  monthlyProjectedRevenueUsd: number;
  averageQualityScore: number;
};

export type AttributionSummary = {
  clicks: number;
  realClicks: number;
  syntheticClicks: number;
  conversions: number;
  realConversions: number;
  syntheticConversions: number;
  commissions: number;
  realCommissions: number;
  syntheticCommissions: number;
  realCommissionUsd: number;
  syntheticCommissionUsd: number;
  sevenDayClicks: number;
  sevenDayRegistrations: number;
  sevenDayCommissionUsd: number;
  realCoverageRate: number;
  byLocale: Array<{
    locale: string;
    clicks: number;
    conversions: number;
    commissionsUsd: number;
    dataSource: "real" | "synthetic" | "mixed" | "none";
  }>;
  byPageType: Array<{
    pageType: string;
    clicks: number;
    conversions: number;
    commissionsUsd: number;
    dataSource: "real" | "synthetic" | "mixed" | "none";
  }>;
  byExchange: Array<{
    exchangeSlug: Exchange["slug"];
    clicks: number;
    conversions: number;
    commissionsUsd: number;
    dataSource: "real" | "synthetic" | "mixed" | "none";
  }>;
};

export type AutomationState = {
  version: 1;
  generatedAt: string;
  controlPlane: AutomationControlPlane;
  runs: AutomationRun[];
  signals: QuerySignal[];
  clusters: QueryCluster[];
  opportunities: QueryOpportunity[];
  briefs: ContentBrief[];
  pages: AutomationSeoPage[];
  affiliateClicks: AffiliateClick[];
  conversions: ConversionEvent[];
  commissions: CommissionEvent[];
  earnings: EarningsSnapshot[];
  pageRoiDaily: RoiEntry[];
  queryRoiDaily: RoiEntry[];
  alerts: AutomationAlert[];
  externalSources: ExternalSourcesState;
  metrics: AutomationMetrics;
  attribution: AttributionSummary;
  internalLinks: AutomationInternalLinkManifest;
};
