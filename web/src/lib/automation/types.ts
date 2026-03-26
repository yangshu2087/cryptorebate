import type { Exchange } from "@/types/exchange";

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
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
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
};

export type CommissionEvent = {
  id: string;
  exchangeSlug: Exchange["slug"];
  queryClusterId: string;
  commissionUsd: number;
  recordedAt: string;
  source: "api" | "csv" | "synthetic";
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

export type AutomationAlert = {
  id: string;
  level: "info" | "warning" | "critical";
  type:
    | "publish_rate_limit"
    | "sync_failure"
    | "schema_validation"
    | "ctr_collapse"
    | "index_no_click"
    | "earnings_anomaly"
    | "dead_link";
  message: string;
  scope: {
    locale?: string;
    exchangeSlug?: Exchange["slug"];
    pageType?: string;
  };
  triggeredAt: string;
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

export type AutomationRun = {
  id: string;
  job:
    | "daily_gsc_ingest"
    | "daily_query_clustering"
    | "daily_opportunity_scoring"
    | "daily_page_generation"
    | "daily_page_publish"
    | "daily_page_refresh"
    | "daily_revenue_sync"
    | "daily_roi_recompute"
    | "weekly_staleness_audit"
    | "weekly_underperformance_pruning";
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
};
