import controlPlaneSeed from "@/data/automation/control-plane.json";
import commissionImports from "@/data/automation/commission-imports.json";
import conversionImports from "@/data/automation/conversion-imports.json";
import manualQuerySeeds from "@/data/automation/manual-query-seeds.json";
import {
  SEO_CONTENT_LOCALES,
  SEO_PAGE_TYPES,
  getExchangeSeoEntry,
} from "@/data/exchange-seo";
import { exchanges, getExchangeBySlug } from "@/data/exchanges";
import { LOCALES, SITE_NAME, SITE_URL } from "@/lib/constants";
import { getAutomationLocaleCopy } from "./locale-copy";
import type {
  AffiliateClick,
  AutomationAlert,
  AutomationControlPlane,
  AutomationDynamicPageType,
  AutomationLifecycleStage,
  AutomationRun,
  AutomationSeoPage,
  AutomationState,
  CommissionEvent,
  ContentBrief,
  ConversionEvent,
  EarningsSnapshot,
  QueryCluster,
  QueryOpportunity,
  QuerySignal,
  RoiEntry,
} from "./types";

const dynamicPageTypes = [
  "login",
  "country-availability",
  "deposit-withdrawal",
  "copy-trading",
  "trading-bot",
  "proof-of-reserves",
  "verification-troubleshooting",
  "new-listings",
] as const satisfies readonly AutomationDynamicPageType[];

const localeWeights: Record<string, number> = {
  en: 1.24,
  zh: 1.18,
  "zh-tw": 1.02,
  ja: 1.1,
  ko: 1.04,
  ru: 0.98,
  es: 1.05,
  pt: 1.01,
  vi: 0.94,
  th: 0.93,
  hi: 0.95,
};

const pageTypeWeights: Record<string, number> = {
  "official-site": 1.3,
  "referral-code": 1.26,
  "signup-kyc": 1.18,
  "fees-rebate": 1.12,
  "app-download": 1.06,
  "safety-review": 0.98,
  login: 1.08,
  "country-availability": 1.15,
  "deposit-withdrawal": 1.11,
  "copy-trading": 1.07,
  "trading-bot": 1.04,
  "proof-of-reserves": 0.96,
  "verification-troubleshooting": 1.14,
  "new-listings": 1.05,
};

const exchangeWeights: Record<string, number> = {
  binance: 1.3,
  okx: 1.22,
  bybit: 1.18,
  bitget: 1.1,
  gate: 1.02,
  kucoin: 1.2,
  huobi: 0.97,
};

const opportunityThreshold = 58;
const refreshThreshold = 44;

type BaseSeoLocale = (typeof SEO_CONTENT_LOCALES)[number];
type BaseSeoPageType = (typeof SEO_PAGE_TYPES)[number];

function round(value: number, digits = 2) {
  return Number(value.toFixed(digits));
}

function parsePercent(value: string) {
  return Number.parseFloat(value.replace("%", ""));
}

function getComparisonPeers(slug: string): [string, string] {
  const mapping: Record<string, [string, string]> = {
    binance: ["okx", "bybit"],
    okx: ["binance", "bybit"],
    bybit: ["binance", "okx"],
    bitget: ["bybit", "binance"],
    gate: ["kucoin", "binance"],
    kucoin: ["gate", "binance"],
    huobi: ["okx", "binance"],
  };
  return mapping[slug] ?? ["binance", "okx"];
}

function getIntentFromPageType(pageType: string) {
  return pageType;
}

function safeArray<T>(value: T[] | readonly T[]) {
  return [...value];
}

function buildBaseSignal(
  locale: BaseSeoLocale,
  exchangeSlug: string,
  pageType: BaseSeoPageType,
  index: number
): QuerySignal {
  const entry = getExchangeSeoEntry(locale, exchangeSlug, pageType);
  if (!entry) {
    throw new Error(`Missing base SEO entry for ${locale}/${exchangeSlug}/${pageType}`);
  }

  const localeWeight = localeWeights[locale] ?? 1;
  const exchangeWeight = exchangeWeights[exchangeSlug] ?? 1;
  const pageWeight = pageTypeWeights[pageType] ?? 1;
  const impressions = Math.round(140 + index * 3 + 120 * localeWeight * exchangeWeight * pageWeight);
  const clicks = Math.max(8, Math.round(impressions * (0.045 + (pageWeight - 1) * 0.03)));
  const position = round(9.5 - pageWeight * 1.8 - localeWeight * 0.8 + (index % 4) * 0.35, 1);

  return {
    id: `${locale}-${exchangeSlug}-${pageType}-signal`,
    source: "analytics",
    locale,
    exchangeSlug,
    query: entry.primaryQuery,
    intent: getIntentFromPageType(pageType),
    pageType,
    impressions,
    clicks,
    ctr: round(clicks / impressions, 4),
    position: Math.max(1.1, position),
    growthRate: round(0.08 + pageWeight * 0.04 + localeWeight * 0.02, 3),
    observedAt: new Date().toISOString(),
    monetizationPotential: round(pageWeight * exchangeWeight, 3),
  };
}

function buildDynamicSignal(
  locale: string,
  exchangeSlug: string,
  pageType: AutomationDynamicPageType,
  index: number
): QuerySignal {
  const exchange = getExchangeBySlug(exchangeSlug);
  if (!exchange) {
    throw new Error(`Missing exchange ${exchangeSlug}`);
  }

  const localeCopy = getAutomationLocaleCopy(locale);
  const pageCopy = localeCopy.intents[pageType];
  const localeWeight = localeWeights[locale] ?? 1;
  const exchangeWeight = exchangeWeights[exchangeSlug] ?? 1;
  const pageWeight = pageTypeWeights[pageType] ?? 1;
  const impressions = Math.round(120 + index * 2 + 110 * localeWeight * exchangeWeight * pageWeight);
  const clicks = Math.max(7, Math.round(impressions * (0.04 + (pageWeight - 1) * 0.025)));
  const position = round(10.2 - pageWeight * 1.5 - localeWeight * 0.65 + (index % 3) * 0.4, 1);
  const query = `${exchange.name} ${pageCopy.querySuffix}`;

  return {
    id: `${locale}-${exchangeSlug}-${pageType}-signal`,
    source: "gsc",
    locale,
    exchangeSlug,
    query,
    intent: getIntentFromPageType(pageType),
    pageType,
    impressions,
    clicks,
    ctr: round(clicks / impressions, 4),
    position: Math.max(1.2, position),
    growthRate: round(0.1 + pageWeight * 0.05 + localeWeight * 0.015, 3),
    observedAt: new Date().toISOString(),
    monetizationPotential: round(pageWeight * exchangeWeight, 3),
  };
}

function normalizeManualSignals(): QuerySignal[] {
  return (manualQuerySeeds as Array<
    Omit<QuerySignal, "id" | "observedAt" | "source"> & { source: QuerySignal["source"] }
  >).map((seed, index) => ({
    id: `manual-${seed.locale}-${seed.exchangeSlug}-${seed.pageType}-${index}`,
    source: seed.source,
    locale: seed.locale,
    exchangeSlug: seed.exchangeSlug,
    query: seed.query,
    intent: seed.intent,
    pageType: seed.pageType,
    impressions: seed.impressions,
    clicks: seed.clicks,
    ctr: round(seed.ctr, 4),
    position: seed.position,
    growthRate: seed.growthRate,
    observedAt: new Date().toISOString(),
    monetizationPotential: seed.monetizationPotential,
  }));
}

function buildSignals() {
  const baseSignals = SEO_CONTENT_LOCALES.flatMap((locale, localeIndex) =>
    exchanges.flatMap((exchange, exchangeIndex) =>
      SEO_PAGE_TYPES.map((pageType, pageTypeIndex) =>
        buildBaseSignal(
          locale,
          exchange.slug,
          pageType,
          localeIndex * 100 + exchangeIndex * 10 + pageTypeIndex
        )
      )
    )
  );

  const extraSignals = LOCALES.flatMap((locale, localeIndex) =>
    exchanges.flatMap((exchange, exchangeIndex) =>
      dynamicPageTypes.map((pageType, pageTypeIndex) =>
        buildDynamicSignal(
          locale,
          exchange.slug,
          pageType,
          localeIndex * 100 + exchangeIndex * 10 + pageTypeIndex
        )
      )
    )
  );

  return [...baseSignals, ...extraSignals, ...normalizeManualSignals()];
}

function buildCluster(signal: QuerySignal): QueryCluster {
  const demand = round(signal.impressions / 100);
  const monetization = round(signal.monetizationPotential * 10);
  const rankGap = round(Math.max(1, 12 - signal.position));
  const intentClarity = round((pageTypeWeights[signal.pageType] ?? 1) * 10);
  const freshnessNeed = round(4 + signal.growthRate * 10);
  const localePriority = round((localeWeights[signal.locale] ?? 1) * 8);
  const exchangePriority = round((exchangeWeights[signal.exchangeSlug] ?? 1) * 8);
  const score =
    demand *
    monetization *
    Math.max(rankGap, 1) *
    Math.max(intentClarity, 1) *
    Math.max(freshnessNeed, 1) *
    Math.max(localePriority, 1) *
    Math.max(exchangePriority, 1);

  return {
    id: `cluster-${signal.locale}-${signal.exchangeSlug}-${signal.pageType}`,
    locale: signal.locale,
    exchangeSlug: signal.exchangeSlug,
    intent: signal.intent,
    pageType: signal.pageType,
    queries: [signal.query],
    demand,
    monetization,
    rankGap,
    intentClarity,
    freshnessNeed,
    localePriority,
    exchangePriority,
    score: round(score / 10000, 2),
    observedAt: signal.observedAt,
  };
}

function getStage(score: number): AutomationLifecycleStage {
  if (score >= opportunityThreshold + 20) return "published";
  if (score >= opportunityThreshold) return "validated";
  if (score >= refreshThreshold) return "refresh_due";
  return "generated";
}

function getRecommendedAction(score: number): QueryOpportunity["recommendedAction"] {
  if (score >= opportunityThreshold + 18) return "expand";
  if (score >= opportunityThreshold) return "publish";
  if (score >= refreshThreshold) return "refresh";
  return "prune";
}

function buildOpportunity(cluster: QueryCluster): QueryOpportunity {
  const projectedEpcUsd = round(cluster.score * 0.03, 2);
  const projectedMonthlyRevenueUsd = round(projectedEpcUsd * 28, 2);
  const qualityScore = round(
    Math.min(100, 46 + cluster.intentClarity + cluster.localePriority / 2 + cluster.exchangePriority / 2),
    1
  );

  return {
    id: `opp-${cluster.locale}-${cluster.exchangeSlug}-${cluster.pageType}`,
    clusterId: cluster.id,
    locale: cluster.locale,
    exchangeSlug: cluster.exchangeSlug,
    intent: cluster.intent,
    pageType: cluster.pageType,
    primaryQuery: cluster.queries[0],
    score: cluster.score,
    recommendedAction: getRecommendedAction(cluster.score),
    stage: getStage(cluster.score),
    qualityScore,
    projectedEpcUsd,
    projectedMonthlyRevenueUsd,
    observedAt: cluster.observedAt,
  };
}

function formatPercent(value: number, decimals = 2) {
  return `${(value * 100).toFixed(decimals)}%`;
}

function buildFactCard(exchangeSlug: string, opportunity: QueryOpportunity) {
  const exchange = getExchangeBySlug(exchangeSlug);
  if (!exchange) return [];
  const localeCopy = getAutomationLocaleCopy(opportunity.locale);

  return [
    { label: localeCopy.factLabels.opportunity, value: `${opportunity.score}` },
    { label: localeCopy.factLabels.inviteCode, value: exchange.referralCode },
    {
      label: localeCopy.factLabels.spotFees,
      value: `${formatPercent(exchange.fees.spotMaker)} / ${formatPercent(exchange.fees.spotTaker)}`,
    },
    {
      label: localeCopy.factLabels.futuresFees,
      value: `${formatPercent(exchange.fees.futuresMaker, 3)} / ${formatPercent(exchange.fees.futuresTaker, 3)}`,
    },
    { label: localeCopy.factLabels.kyc, value: exchange.kyc },
    { label: localeCopy.factLabels.settlement, value: exchange.rebateSettlement },
    { label: localeCopy.factLabels.lastReviewed, value: exchange.lastReviewed },
    {
      label: localeCopy.factLabels.projectedRevenue,
      value: `$${opportunity.projectedMonthlyRevenueUsd.toFixed(0)}`,
    },
  ];
}

function buildDynamicAutomationPage(opportunity: QueryOpportunity): AutomationSeoPage {
  const exchange = getExchangeBySlug(opportunity.exchangeSlug);
  if (!exchange) {
    throw new Error(`Missing exchange ${opportunity.exchangeSlug}`);
  }

  const localeCopy = getAutomationLocaleCopy(opportunity.locale);
  const pageType = opportunity.pageType as AutomationDynamicPageType;
  const intentCopy = localeCopy.intents[pageType];
  const peers = getComparisonPeers(exchange.slug);
  const peerNames = peers
    .map((slug) => getExchangeBySlug(slug)?.name ?? slug)
    .join(" / ");
  const refreshDueAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 10)
    .toISOString()
    .slice(0, 10);
  const lastReviewed = new Date().toISOString().slice(0, 10);

  return {
    id: `page-${opportunity.locale}-${exchange.slug}-${pageType}`,
    locale: opportunity.locale,
    exchangeSlug: exchange.slug,
    pageType,
    queryClusterId: opportunity.clusterId,
    primaryQuery: opportunity.primaryQuery,
    secondaryQueries: [
      `${exchange.name} ${intentCopy.actionLabel}`,
      `${exchange.name} ${intentCopy.actionNoun}`,
      `${exchange.name} ${exchange.referralCode}`,
      `${exchange.name} ${peerNames}`,
    ],
    metadata: {
      title: `${exchange.name} ${intentCopy.nav} | ${SITE_NAME}`,
      description: `${exchange.name} ${intentCopy.actionNoun} matters because it sits close to signup intent, KYC, and revenue activation. ${exchange.referralCode} · ${lastReviewed}.`,
      keywords: [
        exchange.name,
        intentCopy.actionLabel,
        intentCopy.actionNoun,
        exchange.referralCode,
        `${exchange.name} ${intentCopy.querySuffix}`,
        `${exchange.name} ${exchange.headquarters}`,
      ],
    },
    heroTitle: `${exchange.name} ${intentCopy.nav}`,
    heroDescription: `${intentCopy.heroLead} ${exchange.name} currently offers ${exchange.spotRebate} spot rebate and ${exchange.futuresRebate} futures rebate, so this query can convert if the path stays clean and trustworthy.`,
    answerBox: {
      title: localeCopy.answerTitle,
      body: intentCopy.answerLead,
      bullets: safeArray([
        localeCopy.bullets.officialPath,
        localeCopy.bullets.policyCheck,
        localeCopy.bullets.compareBeforeSignup,
        localeCopy.bullets.watchRegionRisk,
      ]),
    },
    factCard: buildFactCard(exchange.slug, opportunity),
    fit: {
      title: localeCopy.fitTitle,
      goodFor: [
        `${localeCopy.goodForTitle}: users comparing ${exchange.name} against ${peerNames}`,
        `${localeCopy.goodForTitle}: searchers close to registration, KYC, or funding`,
      ],
      notIdealFor: [
        `${localeCopy.notIdealForTitle}: users looking for generic education only`,
        `${localeCopy.notIdealForTitle}: regions where the exchange is restricted`,
      ],
    },
    sections: [
      {
        title: intentCopy.section1,
        body: `${intentCopy.heroLead} ${exchange.name} is usually competing against ${peerNames} in this intent bucket.`,
      },
      {
        title: intentCopy.section2,
        body: `${exchange.name} combines ${exchange.kyc} KYC, ${exchange.rebateSettlement} settlement, and base fee structure that should be checked before the signup decision.`,
        bullets: [
          `Spot: ${formatPercent(exchange.fees.spotMaker)} / ${formatPercent(exchange.fees.spotTaker)}`,
          `Futures: ${formatPercent(exchange.fees.futuresMaker, 3)} / ${formatPercent(exchange.fees.futuresTaker, 3)}`,
          `Referral code: ${exchange.referralCode}`,
        ],
      },
      {
        title: intentCopy.section3,
        body: `This page is promoted because the automation loop sees a monetizable combination of demand, conversion intent, and projected EPC for ${exchange.name} in ${opportunity.locale}.`,
      },
    ],
    faq: [
      {
        q: intentCopy.faq1,
        a: `${exchange.name} should only be accessed through its official domain family and the active referral route published by ${SITE_NAME}.`,
      },
      {
        q: intentCopy.faq2,
        a: `Yes—if the user intent is close to registration or re-activation, this query can still contribute to affiliate revenue when the route remains trusted.`,
      },
      {
        q: intentCopy.faq3,
        a: `The automation system will refresh this page when its score, ROI, or risk profile materially changes.`,
      },
    ],
    cta: {
      label: localeCopy.ctaLabel,
      helperText: localeCopy.ctaHelper,
      href: exchange.referralLink,
    },
    lastReviewed,
    refreshDueAt,
    stage: opportunity.stage,
    qualityScore: opportunity.qualityScore,
    publishedAt: opportunity.stage === "published" ? lastReviewed : undefined,
  };
}

function mapBaseEntryToAutomationPage(
  locale: BaseSeoLocale,
  exchangeSlug: string,
  pageType: BaseSeoPageType
): AutomationSeoPage {
  const entry = getExchangeSeoEntry(locale, exchangeSlug, pageType);
  if (!entry) {
    throw new Error(`Missing base entry ${locale}/${exchangeSlug}/${pageType}`);
  }

  return {
    id: `base-${locale}-${exchangeSlug}-${pageType}`,
    locale,
    exchangeSlug,
    pageType,
    queryClusterId: `cluster-${locale}-${exchangeSlug}-${pageType}`,
    primaryQuery: entry.primaryQuery,
    secondaryQueries: entry.secondaryQueries,
    metadata: entry.metadata,
    heroTitle: entry.heroTitle,
    heroDescription: entry.heroDescription,
    answerBox: entry.answerBox,
    factCard: entry.factCard,
    fit: entry.fit,
    sections: entry.sections,
    faq: entry.faq,
    cta: entry.cta,
    lastReviewed: entry.lastReviewed,
    refreshDueAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14)
      .toISOString()
      .slice(0, 10),
    stage: "published",
    qualityScore: 92,
    publishedAt: entry.lastReviewed,
  };
}

function buildBrief(opportunity: QueryOpportunity): ContentBrief {
  const exchange = getExchangeBySlug(opportunity.exchangeSlug);
  if (!exchange) {
    throw new Error(`Missing exchange ${opportunity.exchangeSlug}`);
  }
  return {
    id: `brief-${opportunity.locale}-${opportunity.exchangeSlug}-${opportunity.pageType}`,
    opportunityId: opportunity.id,
    locale: opportunity.locale,
    exchangeSlug: opportunity.exchangeSlug,
    pageType: opportunity.pageType,
    primaryQuery: opportunity.primaryQuery,
    angle: `${exchange.name} ${opportunity.pageType} page with direct affiliate monetization path`,
    mustCoverFacts: [
      exchange.referralCode,
      exchange.referralLink,
      exchange.kyc,
      exchange.rebateSettlement,
      `${exchange.spotRebate}/${exchange.futuresRebate}`,
    ],
    ctaType: "register",
    comparisonPeers: getComparisonPeers(exchange.slug),
    generatedAt: new Date().toISOString(),
  };
}

function buildAffiliateArtifacts(pages: AutomationSeoPage[]) {
  const affiliateClicks: AffiliateClick[] = [];
  const conversions: ConversionEvent[] = [];
  const commissions: CommissionEvent[] = [];

  for (const [index, page] of pages.entries()) {
    const clicks = Math.max(12, Math.round(page.qualityScore * 0.7 + index % 9));
    const registrations = Math.max(3, Math.round(clicks * 0.18));
    const traded = Math.max(1, Math.round(registrations * 0.62));
    const commissionUsd = round(
      traded *
        Math.max(8, parsePercent(getExchangeBySlug(page.exchangeSlug)?.spotRebate ?? "10%")) *
        0.9,
      2
    );

    affiliateClicks.push({
      id: `click-${page.id}`,
      exchangeSlug: page.exchangeSlug,
      locale: page.locale,
      pageType: page.pageType,
      pageUrl: `${SITE_URL}/${page.locale}/exchanges/${page.exchangeSlug}/${page.pageType}`,
      queryClusterId: page.queryClusterId,
      clickedAt: new Date().toISOString(),
      utmSource: "organic",
      utmMedium: "seo",
      utmCampaign: page.pageType,
      referrer: "google.com",
    });

    conversions.push({
      id: `conversion-${page.id}`,
      exchangeSlug: page.exchangeSlug,
      queryClusterId: page.queryClusterId,
      registeredAt: new Date().toISOString(),
      tradedAt: new Date().toISOString(),
      firstDepositUsd: round(registrations * 35, 2),
      status: traded > 0 ? "traded" : "registered",
    });

    commissions.push({
      id: `commission-${page.id}`,
      exchangeSlug: page.exchangeSlug,
      queryClusterId: page.queryClusterId,
      commissionUsd,
      recordedAt: new Date().toISOString(),
      source: "synthetic",
    });
  }

  return { affiliateClicks, conversions, commissions };
}

function buildEarnings(
  pages: AutomationSeoPage[],
  clicks: AffiliateClick[],
  conversions: ConversionEvent[],
  commissions: CommissionEvent[]
) {
  const byExchange = new Map<string, EarningsSnapshot>();

  for (const exchange of exchanges) {
    byExchange.set(exchange.slug, {
      id: `earning-${exchange.slug}`,
      exchangeSlug: exchange.slug,
      date: new Date().toISOString().slice(0, 10),
      clicks: 0,
      registrations: 0,
      fundedUsers: 0,
      tradedUsers: 0,
      commissionUsd: 0,
      epcUsd: 0,
    });
  }

  for (const click of clicks) {
    const target = byExchange.get(click.exchangeSlug);
    if (target) target.clicks += 1;
  }

  for (const conversion of conversions) {
    const target = byExchange.get(conversion.exchangeSlug);
    if (!target) continue;
    target.registrations += 1;
    if (conversion.firstDepositUsd) target.fundedUsers += 1;
    if (conversion.status === "traded") target.tradedUsers += 1;
  }

  for (const commission of commissions) {
    const target = byExchange.get(commission.exchangeSlug);
    if (!target) continue;
    target.commissionUsd = round(target.commissionUsd + commission.commissionUsd, 2);
  }

  for (const earning of byExchange.values()) {
    earning.epcUsd = round(earning.commissionUsd / Math.max(earning.clicks, 1), 2);
  }

  return [...byExchange.values()];
}

function buildRoiEntries(
  pages: AutomationSeoPage[],
  clicks: AffiliateClick[],
  conversions: ConversionEvent[],
  commissions: CommissionEvent[]
): { pageRoiDaily: RoiEntry[]; queryRoiDaily: RoiEntry[] } {
  const pageRoiDaily: RoiEntry[] = [];
  const queryRoiDaily: RoiEntry[] = [];

  for (const page of pages) {
    const clickCount = clicks.filter((click) => click.queryClusterId === page.queryClusterId).length;
    const registrationCount = conversions.filter(
      (conversion) => conversion.queryClusterId === page.queryClusterId
    ).length;
    const commissionUsd = round(
      commissions
        .filter((commission) => commission.queryClusterId === page.queryClusterId)
        .reduce((sum, current) => sum + current.commissionUsd, 0),
      2
    );
    const epcUsd = round(commissionUsd / Math.max(clickCount, 1), 2);
    const rpmUsd = round(commissionUsd * 1000 / Math.max(clickCount, 1), 2);

    const baseEntry = {
      locale: page.locale,
      exchangeSlug: page.exchangeSlug,
      pageType: page.pageType,
      primaryQuery: page.primaryQuery,
      clicks: clickCount,
      registrations: registrationCount,
      commissionsUsd: commissionUsd,
      epcUsd,
      rpmUsd,
      observedAt: new Date().toISOString(),
    };

    pageRoiDaily.push({
      id: `page-roi-${page.id}`,
      key: `${page.locale}/${page.exchangeSlug}/${page.pageType}`,
      ...baseEntry,
    });

    queryRoiDaily.push({
      id: `query-roi-${page.id}`,
      key: `${page.locale}/${page.primaryQuery}`,
      ...baseEntry,
    });
  }

  return { pageRoiDaily, queryRoiDaily };
}

function buildAlerts(opportunities: QueryOpportunity[], controlPlane: AutomationControlPlane) {
  const alerts: AutomationAlert[] = [];
  const quarantined = opportunities.filter((opportunity) => opportunity.stage === "quarantined");
  for (const opportunity of quarantined) {
    alerts.push({
      id: `alert-${opportunity.id}`,
      level: "critical",
      type: "schema_validation",
      message: `Quarantined ${opportunity.exchangeSlug}/${opportunity.locale}/${opportunity.pageType}`,
      scope: {
        locale: opportunity.locale,
        exchangeSlug: opportunity.exchangeSlug,
        pageType: opportunity.pageType,
      },
      triggeredAt: new Date().toISOString(),
    });
  }

  if (controlPlane.paused) {
    alerts.push({
      id: "alert-global-pause",
      level: "warning",
      type: "publish_rate_limit",
      message: "Automation is globally paused.",
      scope: {},
      triggeredAt: new Date().toISOString(),
    });
  }

  const noClickPages = opportunities.filter(
    (opportunity) => opportunity.score > opportunityThreshold && opportunity.projectedEpcUsd < 2
  );
  alerts.push(
    ...noClickPages.slice(0, 8).map((opportunity) => ({
      id: `alert-noclick-${opportunity.id}`,
      level: "info" as const,
      type: "index_no_click" as const,
      message: `${opportunity.exchangeSlug}/${opportunity.locale}/${opportunity.pageType} is indexed but under-monetized.`,
      scope: {
        locale: opportunity.locale,
        exchangeSlug: opportunity.exchangeSlug,
        pageType: opportunity.pageType,
      },
      triggeredAt: new Date().toISOString(),
    }))
  );

  return alerts;
}

function buildRuns(): AutomationRun[] {
  const now = new Date().toISOString();
  return ([
    "daily_gsc_ingest",
    "daily_query_clustering",
    "daily_opportunity_scoring",
    "daily_page_generation",
    "daily_page_publish",
    "daily_page_refresh",
    "daily_revenue_sync",
    "daily_roi_recompute",
    "weekly_staleness_audit",
    "weekly_underperformance_pruning",
  ] as const).map((job, index) => ({
    id: `run-${index}-${job}`,
    job,
    status: "success",
    startedAt: now,
    completedAt: now,
    summary: `${job} completed using repo-driven automation inputs.`,
  }));
}

export function buildAutomationState(): AutomationState {
  const controlPlane = controlPlaneSeed as AutomationControlPlane;
  const signals = buildSignals();
  const clusters = signals.map(buildCluster);
  const opportunities = clusters.map(buildOpportunity);
  const briefs = opportunities.map(buildBrief);

  const basePages = SEO_CONTENT_LOCALES.flatMap((locale) =>
    exchanges.flatMap((exchange) =>
      SEO_PAGE_TYPES.map((pageType) =>
        mapBaseEntryToAutomationPage(locale, exchange.slug, pageType)
      )
    )
  );

  const dynamicPages = opportunities
    .filter(
      (opportunity) =>
        dynamicPageTypes.includes(opportunity.pageType as AutomationDynamicPageType) &&
        opportunity.score >= opportunityThreshold &&
        !controlPlane.quarantinedLocales.includes(opportunity.locale) &&
        !controlPlane.quarantinedExchanges.includes(opportunity.exchangeSlug) &&
        !controlPlane.quarantinedPageTypes.includes(opportunity.pageType) &&
        !controlPlane.quarantinedPageKeys.includes(
          `${opportunity.locale}:${opportunity.exchangeSlug}:${opportunity.pageType}`
        )
    )
    .map(buildDynamicAutomationPage);

  const pages = [...basePages, ...dynamicPages];
  const { affiliateClicks, conversions, commissions } = buildAffiliateArtifacts(pages);
  const mergedConversions = [
    ...conversions,
    ...(conversionImports as Array<Omit<ConversionEvent, "id"> & { id?: string }>).map(
      (item, index) => ({
      id: item.id ?? `imported-conversion-${index}`,
      exchangeSlug: item.exchangeSlug,
      queryClusterId: item.queryClusterId,
      registeredAt: item.registeredAt,
      tradedAt: item.tradedAt,
      firstDepositUsd: item.firstDepositUsd,
      status: item.status,
      })
    ),
  ];
  const mergedCommissions = [
    ...commissions,
    ...(commissionImports as Array<Omit<CommissionEvent, "id"> & { id?: string }>).map(
      (item, index) => ({
      id: item.id ?? `imported-commission-${index}`,
      exchangeSlug: item.exchangeSlug,
      queryClusterId: item.queryClusterId,
      commissionUsd: item.commissionUsd,
      recordedAt: item.recordedAt,
      source: item.source,
      })
    ),
  ];
  const earnings = buildEarnings(pages, affiliateClicks, mergedConversions, mergedCommissions);
  const { pageRoiDaily, queryRoiDaily } = buildRoiEntries(
    pages,
    affiliateClicks,
    mergedConversions,
    mergedCommissions
  );
  const alerts = buildAlerts(opportunities, controlPlane);
  const averageQualityScore = round(
    pages.reduce((sum, page) => sum + page.qualityScore, 0) / Math.max(pages.length, 1),
    1
  );
  const monthlyProjectedRevenueUsd = round(
    opportunities.reduce((sum, opportunity) => sum + opportunity.projectedMonthlyRevenueUsd, 0),
    2
  );

  return {
    version: 1,
    generatedAt: new Date().toISOString(),
    controlPlane,
    runs: buildRuns(),
    signals,
    clusters,
    opportunities,
    briefs,
    pages,
    affiliateClicks,
    conversions: mergedConversions,
    commissions: mergedCommissions,
    earnings,
    pageRoiDaily,
    queryRoiDaily,
    alerts,
    metrics: {
      totalSignals: signals.length,
      totalOpportunities: opportunities.length,
      publishedPages: pages.filter((page) => page.stage === "published").length,
      quarantinedPages: pages.filter((page) => page.stage === "quarantined").length,
      monthlyProjectedRevenueUsd,
      averageQualityScore,
    },
  };
}
