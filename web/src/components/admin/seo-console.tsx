import type { ComponentType } from "react";
import { AlertTriangle, ArrowUpRight, Bot, CircleAlert, ExternalLink, LineChart, ShieldCheck, Sparkles, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { LOCALES, LOCALE_LABELS, SITE_URL } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { exchanges } from "@/data/exchanges";
import {
  getUnifiedSeoPageHref,
  getUnifiedSeoPageLabels,
} from "@/lib/automation/catalog";
import { getInternalLinkSlots } from "@/lib/automation/internal-links";
import type { DataReality } from "@/lib/automation/data-reality";
import type { SeoDashboardData } from "@/lib/automation/operator-console";
import type { AutomationAlert, QueryOpportunity, RoiEntry } from "@/lib/automation/types";

const views = ["overview", "opportunities", "roi", "alerts", "pages"] as const;
type ViewMode = (typeof views)[number];
const viewLabels: Record<ViewMode, string> = {
  overview: "总览",
  opportunities: "机会",
  roi: "收益",
  alerts: "告警",
  pages: "页面",
};

const ZH_LOCALE_LABELS: Record<string, string> = {
  en: "英语",
  zh: "简体中文",
  "zh-tw": "繁體中文",
  ja: "日语",
  ko: "韩语",
  ru: "俄语",
  es: "西班牙语",
  pt: "葡萄牙语",
  vi: "越南语",
  th: "泰语",
  hi: "印地语",
};

const STATUS_LABELS: Record<string, string> = {
  success: "成功",
  failed: "失败",
  warning: "警告",
  disabled: "已禁用",
  skipped: "已跳过",
  never_run: "尚无运行记录",
  queued: "排队中",
  in_progress: "运行中",
  completed: "已完成",
  cancelled: "已取消",
  timed_out: "超时",
  action_required: "需要处理",
  startup_failure: "启动失败",
  generated: "已生成",
  validated: "已校验",
  published: "已发布",
  refresh_due: "待刷新",
  underperforming: "低表现",
  quarantined: "已隔离",
  deprecated: "已废弃",
};

const PARTNER_PROVIDER_LABELS: Record<string, string> = {
  generic: "Affiliate 通用报表源",
  "csv-portal": "Affiliate CSV 月度导入",
  "okx-broker": "OKX Broker API（高级可选）",
  "gate-api4": "Gate APIv4（高级可选）",
};

type SeoConsoleProps = {
  locale: string;
  view: string | undefined;
  exchange: string | undefined;
  dataLocale: string | undefined;
  pageType: string | undefined;
  dashboardData: SeoDashboardData;
};

function isViewMode(value: string | undefined): value is ViewMode {
  return !!value && views.includes(value as ViewMode);
}

function isKnownLocale(value: string | undefined) {
  return !!value && LOCALES.includes(value as (typeof LOCALES)[number]);
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("zh-CN").format(value);
}

function formatUsd(value: number) {
  return new Intl.NumberFormat("zh-CN", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: value >= 1000 ? 0 : 2,
  }).format(value);
}

function formatSuccessRate(published: number, failed: number) {
  const attempts = published + failed;
  if (attempts === 0) return "0.0%";
  return `${((published / attempts) * 100).toFixed(1)}%`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatGscAnalyticsMode(mode: string) {
  switch (mode) {
    case "query-page":
      return "query+page";
    case "page-only":
      return "page-only fallback";
    case "empty":
      return "empty";
    default:
      return mode;
  }
}

function buildHref(locale: string, params: Record<string, string | undefined>) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value && value !== "all") {
      query.set(key, value);
    }
  }
  const suffix = query.toString();
  return `/${locale}/admin/seo${suffix ? `?${suffix}` : ""}`;
}

function buildApiHref(path: string, params: Record<string, string | undefined>) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value && value !== "all") {
      query.set(key, value);
    }
  }
  const suffix = query.toString();
  return `${path}${suffix ? `?${suffix}` : ""}`;
}

function SectionHeading({ title, description }: { title: string; description?: string }) {
  return (
    <div className="mb-4 flex items-start justify-between gap-4">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
        {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
      </div>
    </div>
  );
}

function DataRealityBadge({ reality }: { reality: DataReality }) {
  const styles: Record<DataReality, string> = {
    真实: "border-emerald-200 bg-emerald-50 text-emerald-700",
    估算: "border-amber-200 bg-amber-50 text-amber-700",
    模拟: "border-sky-200 bg-sky-50 text-sky-700",
    未接通: "border-zinc-200 bg-zinc-50 text-zinc-700",
  };

  return <span className={cn("rounded-full border px-2.5 py-1 text-xs font-medium", styles[reality])}>{reality}</span>;
}

function MetricCard({
  icon: Icon,
  label,
  value,
  helper,
  reality,
  realityHint,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
  helper: string;
  reality: DataReality;
  realityHint?: string;
}) {
  return (
    <Card className="border-border/70">
      <CardContent className="flex items-start gap-4 p-5">
        <div className="rounded-2xl bg-brand/10 p-2 text-brand">
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-muted-foreground">{label}</p>
            <DataRealityBadge reality={reality} />
          </div>
          <p className="mt-1 text-2xl font-semibold tracking-tight">{value}</p>
          <p className="mt-1 text-xs text-muted-foreground">{helper}</p>
          {realityHint ? <p className="mt-2 text-xs text-muted-foreground">{realityHint}</p> : null}
        </div>
      </CardContent>
    </Card>
  );
}

function RankBar({ value, max }: { value: number; max: number }) {
  const width = max === 0 ? 0 : Math.max(6, Math.round((value / max) * 100));
  return (
    <div className="mt-2 h-2 rounded-full bg-muted">
      <div className="h-2 rounded-full bg-brand" style={{ width: `${width}%` }} />
    </div>
  );
}

function AlertBadge({ level }: { level: AutomationAlert["level"] }) {
  const variant = level === "critical" ? "destructive" : level === "warning" ? "outline" : "secondary";
  const label = level === "critical" ? "严重" : level === "warning" ? "警告" : "信息";
  return <Badge variant={variant}>{label}</Badge>;
}

function FocusLaneBadge({ lane }: { lane: QueryOpportunity["focusLane"] }) {
  const styles: Record<QueryOpportunity["focusLane"], string> = {
    focus: "border-emerald-200 bg-emerald-50 text-emerald-700",
    background: "border-amber-200 bg-amber-50 text-amber-700",
    hold: "border-zinc-200 bg-zinc-50 text-zinc-700",
  };
  const labels: Record<QueryOpportunity["focusLane"], string> = {
    focus: "焦点",
    background: "背景",
    hold: "冻结",
  };

  return <span className={cn("rounded-full border px-2.5 py-1 text-xs font-medium", styles[lane])}>{labels[lane]}</span>;
}

function StatusCard({
  title,
  status,
  description,
  href,
  meta,
}: {
  title: string;
  status: string;
  description: string;
  href?: string | null;
  meta?: string;
}) {
  return (
    <Card className="border-border/70">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="mt-1 text-lg font-semibold">{status}</p>
          </div>
          <Badge variant={status.includes("失败") || status.includes("超时") ? "destructive" : "secondary"}>
            状态卡
          </Badge>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
        {meta ? <p className="mt-3 text-xs text-muted-foreground">{meta}</p> : null}
        {href ? (
          <a
            href={href}
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-brand hover:underline"
          >
            查看详情
            <ExternalLink className="h-4 w-4" />
          </a>
        ) : null}
      </CardContent>
    </Card>
  );
}

function SummaryList({
  title,
  description,
  items,
}: {
  title: string;
  description: string;
  items: Array<{ label: string; value: string }>;
}) {
  return (
    <Card className="border-border/70">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map((item) => (
          <div key={item.label} className="flex items-center justify-between gap-3 rounded-xl border border-border/60 px-4 py-3">
            <span className="text-sm text-muted-foreground">{item.label}</span>
            <span className="text-sm font-semibold text-foreground">{item.value}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function SeoConsole({
  locale,
  view,
  exchange,
  dataLocale,
  pageType,
  dashboardData,
}: SeoConsoleProps) {
  const state = dashboardData.state;
  const dataReality = dashboardData.dataReality;
  const combinedAlerts = dashboardData.alerts;
  const ctaLiveAuditStatus = dashboardData.ctaLiveAudit;
  const activeView: ViewMode = isViewMode(view) ? view : "overview";
  const selectedExchange: string = exchanges.some((item) => item.slug === exchange) ? exchange ?? "all" : "all";
  const selectedDataLocale = isKnownLocale(dataLocale) ? String(dataLocale) : "all";
  const labelsLocale = "zh";
  const generatedAt = formatDate(state.generatedAt);
  const configuredPartnerCount = dataReality.flags.configuredPartnerCount;
  const displayMetrics = dashboardData.metrics as Record<string, number>;

  const filteredOpportunities = state.opportunities
    .filter((item) => (selectedExchange === "all" ? true : item.exchangeSlug === selectedExchange))
    .filter((item) => (selectedDataLocale === "all" ? true : item.locale === selectedDataLocale))
    .filter((item) => (!pageType || pageType === "all" ? true : item.pageType === pageType))
    .sort((a, b) => (b.discoveryPriority ?? 0) - (a.discoveryPriority ?? 0) || b.score - a.score);

  const filteredPageRoi = state.pageRoiDaily
    .filter((item) => (selectedExchange === "all" ? true : item.exchangeSlug === selectedExchange))
    .filter((item) => (selectedDataLocale === "all" ? true : item.locale === selectedDataLocale))
    .filter((item) => (!pageType || pageType === "all" ? true : item.pageType === pageType))
    .sort((a, b) => b.commissionsUsd - a.commissionsUsd);

  const filteredQueryRoi = state.queryRoiDaily
    .filter((item) => (selectedExchange === "all" ? true : item.exchangeSlug === selectedExchange))
    .filter((item) => (selectedDataLocale === "all" ? true : item.locale === selectedDataLocale))
    .filter((item) => (!pageType || pageType === "all" ? true : item.pageType === pageType))
    .sort((a, b) => b.commissionsUsd - a.commissionsUsd);

  const filteredPages = state.pages
    .filter((item) => (selectedExchange === "all" ? true : item.exchangeSlug === selectedExchange))
    .filter((item) => (selectedDataLocale === "all" ? true : item.locale === selectedDataLocale))
    .filter((item) => (!pageType || pageType === "all" ? true : item.pageType === pageType))
    .sort((a, b) => b.qualityScore - a.qualityScore);

  const filteredAlerts = combinedAlerts.filter((item) => {
    const exchangePass = selectedExchange === "all" ? true : item.scope.exchangeSlug === selectedExchange;
    const localePass = selectedDataLocale === "all" ? true : item.scope.locale === selectedDataLocale;
    return exchangePass && localePass;
  });
  const filteredDistributionJobs = dashboardData.distributionJobs.filter((item) => {
    const exchangePass =
      selectedExchange === "all" ? true : item.exchangeSlug === selectedExchange;
    const localePass =
      selectedDataLocale === "all" ? true : item.locale === selectedDataLocale;
    const pageTypePass =
      !pageType || pageType === "all" ? true : item.pageType === pageType;
    return exchangePass && localePass && pageTypePass;
  });

  const filteredCompetitorGapActions = dashboardData.competitorGapActionPlan.actions.filter((item) => {
    const exchangePass =
      selectedExchange === "all" ? true : item.exchangeSlug === selectedExchange;
    const localePass =
      selectedDataLocale === "all" ? true : item.locale === selectedDataLocale;
    const pageTypePass =
      !pageType || pageType === "all" ? true : item.pageType === pageType;
    return exchangePass && localePass && pageTypePass;
  });
  const filteredSerpWinnerRecords = dashboardData.competitorGapSerpWinners.records.filter((item) => {
    const exchangePass =
      selectedExchange === "all"
        ? true
        : item.exchangeSlug === selectedExchange || item.exchangeSlug === "cross-exchange";
    const localePass =
      selectedDataLocale === "all"
        ? true
        : item.locale === selectedDataLocale || item.locale === "multi-locale";
    return exchangePass && localePass;
  });
  const filteredProviderHits = filteredSerpWinnerRecords.reduce(
    (acc, record) => {
      const hitProviders = new Set(
        record.providerReports
          .filter((report) => report.status === "success" && report.resultCount > 0)
          .map((report) => report.provider)
      );
      for (const provider of hitProviders) {
        acc[provider] = (acc[provider] ?? 0) + 1;
      }
      return acc;
    },
    { "duckduckgo-html": 0, serper: 0, brave: 0 } as Record<string, number>
  );
  const filteredDominantDomains = Object.entries(
    filteredSerpWinnerRecords.reduce<Record<string, number>>((acc, record) => {
      for (const domain of record.dominantDomains) {
        acc[domain] = (acc[domain] ?? 0) + 1;
      }
      return acc;
    }, {})
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);
  const topSerpWinners = filteredSerpWinnerRecords
    .flatMap((record) =>
      record.topResults.slice(0, 3).map((result) => ({
        ...result,
        templateId: record.templateId,
        topic: record.topic,
        query: record.query,
      }))
    )
    .slice(0, 8);

  const exchangeSummaries = exchanges
    .map((item) => {
      const opps = state.opportunities.filter((opp) => opp.exchangeSlug === item.slug);
      const roi = state.pageRoiDaily.filter((entry) => entry.exchangeSlug === item.slug);
      const alerts = combinedAlerts.filter((alert) => alert.scope.exchangeSlug === item.slug);
      return {
        slug: item.slug,
        name: item.name,
        opportunityCount: opps.length,
        projectedRevenueUsd: opps.reduce((sum, opp) => sum + opp.projectedMonthlyRevenueUsd, 0),
        realizedRevenueUsd: roi.reduce((sum, entry) => sum + entry.commissionsUsd, 0),
        alertCount: alerts.length,
      };
    })
    .sort((a, b) => b.projectedRevenueUsd - a.projectedRevenueUsd);

  const pageTypeOptions = Array.from(
    new Set(state.opportunities.map((item) => item.pageType).concat(state.pages.map((item) => item.pageType)))
  ).sort();
  const statusCards = dashboardData.operatorSummary.statusCards;
  const internalLinkSlots = getInternalLinkSlots(state.internalLinks);
  const flattenedSlotGuides = [
    ...internalLinkSlots.homepageHeroSecondary.flatMap((slot) => slot.guides),
    ...internalLinkSlots.homepageQuestionClusters.flatMap((slot) => slot.guides),
    ...internalLinkSlots.exchangeHubFocus.flatMap((slot) => slot.guides),
    ...internalLinkSlots.exchangeDetailFocus.flatMap((slot) => slot.guides),
    ...internalLinkSlots.brandSupporting.flatMap((slot) => slot.guides),
  ];
  const internalLinkTopPageTypes = Object.entries(
    flattenedSlotGuides.reduce<Record<string, number>>((acc, guide) => {
      acc[guide.pageType] = (acc[guide.pageType] ?? 0) + 1;
      return acc;
    }, {})
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);
  const focusSlotSections = [
    {
      key: "homepageHeroSecondary",
      title: "首页 Hero 次推荐",
      description: "首页 hero 下方二级推荐位，优先推焦点主题簇。",
      items: internalLinkSlots.homepageHeroSecondary
        .filter((slot) => selectedDataLocale === "all" || slot.locale === selectedDataLocale)
        .flatMap((slot) =>
          slot.guides.slice(0, 3).map((guide) => ({
            slotLabel: `首页 · ${ZH_LOCALE_LABELS[slot.locale] ?? slot.locale}`,
            guide,
          }))
        )
        .slice(0, 6),
    },
    {
      key: "homepageQuestionClusters",
      title: "首页高意图问题簇",
      description: "把高意图问题页集中推到首页问题入口。",
      items: internalLinkSlots.homepageQuestionClusters
        .filter((slot) => selectedDataLocale === "all" || slot.locale === selectedDataLocale)
        .flatMap((slot) =>
          slot.guides.slice(0, 2).map((guide) => ({
            slotLabel: `${ZH_LOCALE_LABELS[slot.locale] ?? slot.locale} · ${getUnifiedSeoPageLabels(labelsLocale, slot.pageType).short}`,
            guide,
          }))
        )
        .slice(0, 8),
    },
    {
      key: "exchangeHubFocus",
      title: "Exchanges Hub 焦点位",
      description: "语言级 hub 页面统一推当前焦点交易所主题簇。",
      items: internalLinkSlots.exchangeHubFocus
        .filter((slot) => selectedDataLocale === "all" || slot.locale === selectedDataLocale)
        .flatMap((slot) =>
          slot.guides.slice(0, 3).map((guide) => ({
            slotLabel: `Hub · ${ZH_LOCALE_LABELS[slot.locale] ?? slot.locale}`,
            guide,
          }))
        )
        .slice(0, 8),
    },
    {
      key: "exchangeDetailFocus",
      title: "交易所详情焦点位",
      description: "交易所详情页显式推 official-site / referral-code / signup-kyc / fees-rebate。",
      items: internalLinkSlots.exchangeDetailFocus
        .filter((slot) => selectedDataLocale === "all" || slot.locale === selectedDataLocale)
        .filter((slot) => selectedExchange === "all" || slot.exchangeSlug === selectedExchange)
        .flatMap((slot) =>
          slot.guides.slice(0, 3).map((guide) => ({
            slotLabel: `${slot.exchangeSlug} · ${ZH_LOCALE_LABELS[slot.locale] ?? slot.locale}`,
            guide,
          }))
        )
        .slice(0, 8),
    },
    {
      key: "brandSupporting",
      title: "品牌页支持位",
      description: "品牌页只做支持层，用来承接品牌词和内链分发。",
      items: internalLinkSlots.brandSupporting
        .filter((slot) => selectedDataLocale === "all" || slot.locale === selectedDataLocale)
        .flatMap((slot) =>
          slot.guides.slice(0, 2).map((guide) => ({
            slotLabel: `${slot.topic} · ${ZH_LOCALE_LABELS[slot.locale] ?? slot.locale}`,
            guide,
          }))
        )
        .slice(0, 8),
    },
  ].filter((section) => section.items.length > 0);
  const exchangeRealityCounts = (["真实", "估算", "模拟", "未接通"] as const).map((reality) => ({
    reality,
    count: dataReality.partnerByExchange.filter((item) => item.reality === reality).length,
  }));
  const failureSummary = {
    critical: dashboardData.operatorSummary.failureTrend.criticalAlerts,
    warning: dashboardData.operatorSummary.failureTrend.warningAlerts,
    partnerFailed: dashboardData.operatorSummary.failureTrend.partnerFailures,
    distributionFailed: dashboardData.operatorSummary.failureTrend.distributionFailures,
  };

  const statsApiHref = buildApiHref("/api/stats/seo", {
    locale: selectedDataLocale === "all" ? undefined : selectedDataLocale,
  });
  const opportunitiesApiHref = buildApiHref("/api/opportunities", {
    locale: selectedDataLocale === "all" ? undefined : selectedDataLocale,
    exchange: selectedExchange === "all" ? undefined : selectedExchange,
    pageType: pageType === "all" ? undefined : pageType,
    limit: "10",
  });
  const roiApiHref = buildApiHref("/api/roi", {
    mode: "page",
    locale: selectedDataLocale === "all" ? undefined : selectedDataLocale,
    exchange: selectedExchange === "all" ? undefined : selectedExchange,
  });
  const pagesApiHref = buildApiHref("/api/pages", {
    locale: selectedDataLocale === "all" ? undefined : selectedDataLocale,
    exchange: selectedExchange === "all" ? undefined : selectedExchange,
    pageType: pageType === "all" ? undefined : pageType,
  });

  const maxProjected = Math.max(...exchangeSummaries.map((item) => item.projectedRevenueUsd), 0);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">运营控制台</Badge>
            <Badge variant="outline">禁止收录</Badge>
            <Badge variant={state.controlPlane.paused ? "destructive" : "default"}>
              {state.controlPlane.paused ? "已暂停" : "自动化运行中"}
            </Badge>
            <DataRealityBadge reality={dataReality.metrics.signals} />
            <DataRealityBadge reality={dataReality.metrics.projectedRevenue} />
          </div>
          <h1 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">
            SEO / GEO 自动化控制台
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-7 text-muted-foreground md:text-base">
            这里是站内 SEO / GEO 自动化的实时运营视图，集中展示机会队列、收益、告警、已生成页面，以及当前控制面状态。
            该页面仅供内部查看，不参与搜索引擎收录。
          </p>
        </div>
        <Card className="min-w-[280px] border-border/70">
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">快照生成时间</p>
            <p className="mt-1 text-lg font-semibold">{generatedAt}</p>
            <p className="mt-2 text-xs text-muted-foreground">
              当前数据来源：DB-first operator payload，必要时回退到 snapshot / 本地 JSON（<span className="font-medium">{SITE_URL}</span>）
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <MetricCard
          icon={Sparkles}
          label="信号数"
          value={formatNumber(displayMetrics.totalSignals ?? state.metrics.totalSignals)}
          helper="当前进入引擎的 query 与需求信号数量"
          reality={dataReality.metrics.signals}
          realityHint={
            dataReality.flags.hasRealGscSignals
              ? "当前已包含真实 Search Console query 信号。"
              : "当前仍以系统种子、规则生成与手工 seed 为主。"
          }
        />
        <MetricCard
          icon={TrendingUp}
          label="机会数"
          value={formatNumber(displayMetrics.totalOpportunities ?? state.metrics.totalOpportunities)}
          helper="跨语言、跨交易所排序后的页面机会"
          reality={dataReality.metrics.opportunities}
          realityHint="机会分数来自评分模型，不是实际流量或实际收入。"
        />
        <MetricCard
          icon={Bot}
          label="已发布页面"
          value={formatNumber(displayMetrics.publishedPages ?? state.metrics.publishedPages)}
          helper="当前被自动化系统视为有效的页面数"
          reality={dataReality.metrics.publishedPages}
          realityHint="这是系统真实已生成/已纳入状态快照的页面资产数。"
        />
        <MetricCard
          icon={LineChart}
          label="月度预估收益"
          value={formatUsd(displayMetrics.monthlyProjectedRevenueUsd ?? state.metrics.monthlyProjectedRevenueUsd)}
          helper="基于机会分数与收益模型的当前预估"
          reality={dataReality.metrics.projectedRevenue}
          realityHint={
            dataReality.flags.hasRealPartnerData
              ? "当前为模型估算值，已开始受真实 partner 数据影响。"
              : "当前仍是模型估算，不代表真实已结算佣金。"
          }
        />
          <MetricCard
          icon={CircleAlert}
          label="告警数"
          value={formatNumber(combinedAlerts.length)}
          helper={`${state.controlPlane.quarantinedPageKeys.length} 个隔离页面键 · 平均质量分 ${displayMetrics.averageQualityScore ?? state.metrics.averageQualityScore}`}
          reality={dataReality.metrics.alerts}
          realityHint="当前为规则型自动化告警，不等同于生产事故监控。"
        />
      </div>

      <div className="mt-8 grid gap-4 xl:grid-cols-2">
        <SummaryList
          title="Discovery Lane（自然发现线）"
          description="这一列只看自然搜索发现相关指标，不再和收益模拟盘混在一起。"
          items={[
            { label: "GSC rows", value: formatNumber(dashboardData.discovery.gscRowsFetched) },
            { label: "有曝光页面", value: formatNumber(dashboardData.discovery.pagesWithImpressions) },
            { label: "Top 20 queries", value: formatNumber(dashboardData.discovery.queriesTop20) },
            { label: "Top 10 queries", value: formatNumber(dashboardData.discovery.queriesTop10) },
            { label: "焦点已发布页", value: formatNumber(dashboardData.discovery.focusPagesPublished) },
            { label: "焦点已浮出页", value: formatNumber(dashboardData.discovery.focusPagesSurfaced) },
            { label: "真实 CTA 点击（7d）", value: formatNumber(dashboardData.discovery.realCtaClicks7d) },
          ]}
        />
        <SummaryList
          title="Monetization Lane（收益归因线）"
          description="这一列只看点击、注册、佣金与真实覆盖率，避免把估算值误当自然发现。"
          items={[
            { label: "Affiliate clicks", value: formatNumber(dashboardData.monetization.affiliateClicks) },
            { label: "真实 clicks", value: formatNumber(dashboardData.monetization.realAffiliateClicks) },
            { label: "Registrations", value: formatNumber(dashboardData.monetization.registrations) },
            { label: "真实 registrations", value: formatNumber(dashboardData.monetization.realRegistrations) },
            { label: "总佣金", value: formatUsd(dashboardData.monetization.commissionsUsd) },
            { label: "真实佣金", value: formatUsd(dashboardData.monetization.realCommissionUsd) },
            { label: "模拟/估算佣金", value: formatUsd(dashboardData.monetization.syntheticCommissionUsd) },
            { label: "真实覆盖率", value: `${(dashboardData.monetization.realCoverageRate * 100).toFixed(1)}%` },
          ]}
        />
      </div>

      <div className="mt-8 grid gap-4 xl:grid-cols-4">
        <StatusCard
          title="最近一次 CTA Live Audit"
          status={statusCards.ctaLiveAudit.label}
          description="用于确认线上 CTA 全量验收是否通过。成功只显示状态，失败会进入告警区。"
          meta={
            statusCards.ctaLiveAudit.updatedAt
              ? `最近更新时间：${formatDate(statusCards.ctaLiveAudit.updatedAt)} · Run #${statusCards.ctaLiveAudit.runNumber}`
              : "当前还没有历史运行记录。"
          }
          href={statusCards.ctaLiveAudit.href}
        />
        <StatusCard
          title="最近一次 GSC Sync"
          status={statusCards.gscSync.label}
          description="用于确认真实 Search Console query 是否持续拉入自动化状态。"
          meta={`最近同步：${
            statusCards.gscSync.updatedAt
              ? formatDate(statusCards.gscSync.updatedAt)
              : "暂无"
          } · rows ${formatNumber(statusCards.gscSync.rowsFetched)} / signals ${formatNumber(
            statusCards.gscSync.signalsWritten
          )} · mode ${formatGscAnalyticsMode(statusCards.gscSync.searchAnalyticsMode)} · sitemap 提交 ${
            STATUS_LABELS[statusCards.gscSync.sitemapSubmitStatus] ??
            statusCards.gscSync.sitemapSubmitStatus ??
            "未运行"
          }${statusCards.gscSync.note ? ` · ${statusCards.gscSync.note}` : ""}`}
        />
        <StatusCard
          title="最近一次 Partner Sync"
          status={statusCards.partnerSync.label}
          description="用于确认真实 registration / commission 是否开始从 partner source 回流。"
          meta={`最近同步：${
            statusCards.partnerSync.updatedAt
              ? formatDate(statusCards.partnerSync.updatedAt)
              : "暂无"
          } · 已配置 ${statusCards.partnerSync.configuredCount} / 7`}
        />
        <StatusCard
          title="最近一次内链刷新"
          status={statusCards.internalLinkRefresh.label}
          description="显示 daily_internal_link_refresh 最近一次产出的内链刷新结果，用于驱动首页、列表页和交易所详情页推荐位。"
          meta={`最近刷新：${
            statusCards.internalLinkRefresh.updatedAt
              ? formatDate(statusCards.internalLinkRefresh.updatedAt)
              : "暂无"
          } · 语言 ${formatNumber(statusCards.internalLinkRefresh.localesCovered)} · 交易所分组 ${formatNumber(
            statusCards.internalLinkRefresh.exchangeGroups
          )} · 已浮出链接 ${formatNumber(statusCards.internalLinkRefresh.surfacedGuides)}`}
        />
        <StatusCard
          title="最近一次竞品空缺扫描"
          status={statusCards.competitorGap.label}
          description="显示 007-competitor-gap-monitor 最近一次输出的竞品空缺摘要，用于驱动 publish / refresh / 内链动作。"
          meta={`最近扫描：${
            statusCards.competitorGap.updatedAt
              ? formatDate(statusCards.competitorGap.updatedAt)
              : "暂无"
          } · 主题 ${formatNumber(statusCards.competitorGap.topicsReviewed)} · publish ${formatNumber(
            statusCards.competitorGap.publishCandidates
          )} · refresh ${formatNumber(statusCards.competitorGap.refreshCandidates)} · 内链 ${formatNumber(
            statusCards.competitorGap.internalLinkCandidates
          )} · 具体动作 ${formatNumber(statusCards.competitorGap.concreteActions)}`}
        />
        <StatusCard
          title="自有渠道分发队列"
          status={statusCards.distribution.label}
          description="Telegram / X 的发布队列、待发布和失败状态会在这里统一显示。"
          meta={`已发布 ${formatNumber(statusCards.distribution.published)} · 排队中 ${formatNumber(
            statusCards.distribution.queued
          )} · 待发布 ${formatNumber(statusCards.distribution.pending)} · 失败 ${formatNumber(
            statusCards.distribution.failed
          )}`}
        />
      </div>

      <div className="mt-8 grid gap-4 xl:grid-cols-4">
        <SummaryList
          title="7 家交易所真实度分布"
          description="按 partner source 的当前接入情况看各交易所处于真实、估算、模拟还是未接通。"
          items={exchangeRealityCounts.map((item) => ({
            label: item.reality,
            value: `${item.count} 家`,
          }))}
        />
        <SummaryList
          title="最近 7 天变化"
          description="目前按 attribution 摘要看过去 7 天点击、注册、佣金与真实覆盖率。"
          items={[
            { label: "点击", value: formatNumber(state.attribution.sevenDayClicks) },
            { label: "注册", value: formatNumber(state.attribution.sevenDayRegistrations) },
            { label: "佣金", value: formatUsd(state.attribution.sevenDayCommissionUsd) },
            { label: "真实覆盖率", value: `${(state.attribution.realCoverageRate * 100).toFixed(1)}%` },
          ]}
        />
        <SummaryList
          title="失败趋势"
          description="把当前最需要运营关注的失败信号集中到一张卡片。"
          items={[
            { label: "严重告警", value: formatNumber(failureSummary.critical) },
            { label: "警告告警", value: formatNumber(failureSummary.warning) },
            { label: "Partner 失败源", value: formatNumber(failureSummary.partnerFailed) },
            { label: "分发失败", value: formatNumber(failureSummary.distributionFailed) },
            {
              label: "CTA Live Audit",
              value:
                ctaLiveAuditStatus?.status === "completed" &&
                ctaLiveAuditStatus.conclusion === "success"
                  ? "成功"
                  : STATUS_LABELS[ctaLiveAuditStatus?.status ?? "never_run"] ??
                    ctaLiveAuditStatus?.status ??
                    "尚无运行记录",
            },
          ]}
        />
        <SummaryList
          title="渠道发布成功率"
          description="按当前 distribution_jobs 统计 Telegram / X 队列发布成功率，便于判断自有渠道是否通畅。"
          items={[
            {
              label: "总体",
              value: formatSuccessRate(
                dashboardData.distributionSummary.published,
                dashboardData.distributionSummary.failed
              ),
            },
            {
              label: "Telegram",
              value: formatSuccessRate(
                dashboardData.distributionSummary.byChannel.telegram.published,
                dashboardData.distributionSummary.byChannel.telegram.failed
              ),
            },
            {
              label: "X",
              value: formatSuccessRate(
                dashboardData.distributionSummary.byChannel.x.published,
                dashboardData.distributionSummary.byChannel.x.failed
              ),
            },
            {
              label: "排队 / 待发布",
              value: `${formatNumber(dashboardData.distributionSummary.queued)} / ${formatNumber(
                dashboardData.distributionSummary.pending
              )}`,
            },
          ]}
        />
        <SummaryList
          title="内链刷新结果"
          description="显示当前 internal link refresh 把哪些页型和分组实际推到了推荐位。"
          items={[
            { label: "已覆盖语言", value: formatNumber(statusCards.internalLinkRefresh.localesCovered) },
            { label: "交易所分组", value: formatNumber(statusCards.internalLinkRefresh.exchangeGroups) },
            { label: "已浮出链接", value: formatNumber(statusCards.internalLinkRefresh.surfacedGuides) },
            {
              label: "最常浮出页型",
              value:
                internalLinkTopPageTypes
                  .map(([pageType]) => getUnifiedSeoPageLabels(labelsLocale, pageType).short)
                  .join(" / ") || "暂无",
            },
          ]}
        />
        <SummaryList
          title="竞品空缺摘要"
          description="显示最近一次 competitor gap monitor 的摘要和动作规模。"
          items={[
            { label: "SERP 样本", value: formatNumber(dashboardData.competitorGapSummary.serpWinnersLearnedFrom) },
            { label: "主题数", value: formatNumber(dashboardData.competitorGapSummary.topicsReviewed) },
            { label: "Publish 候选", value: formatNumber(dashboardData.competitorGapSummary.publishCandidates) },
            { label: "Refresh 候选", value: formatNumber(dashboardData.competitorGapSummary.refreshCandidates) },
            { label: "具体页面动作", value: formatNumber(dashboardData.competitorGapActionPlan.totalActions) },
          ]}
        />
        <SummaryList
          title="SERP winners 摘要"
          description="显示 live competitor-gap research 最近一次命中的 provider 和赢家规模。"
          items={[
            { label: "winner URL", value: formatNumber(statusCards.competitorGap.totalWinnerUrls) },
            { label: "DuckDuckGo 命中", value: formatNumber(statusCards.competitorGap.providerHits.duckduckgoHtml) },
            { label: "Serper 命中", value: formatNumber(statusCards.competitorGap.providerHits.serper) },
            { label: "Brave 命中", value: formatNumber(statusCards.competitorGap.providerHits.brave) },
          ]}
        />
      </div>

      <div className="mt-8 grid gap-4 xl:grid-cols-[1.2fr_1fr]">
        <Card className="border-border/70">
          <CardHeader>
            <CardTitle>筛选栏</CardTitle>
            <CardDescription>无需离开页面，直接用这组快捷筛选收窄当前运营视图。</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">视图</p>
              <div className="flex flex-wrap gap-2">
                {views.map((item) => (
                  <a
                    key={item}
                    href={buildHref(locale, {
                      view: item,
                      exchange: selectedExchange === "all" ? undefined : selectedExchange,
                      dataLocale: selectedDataLocale === "all" ? undefined : selectedDataLocale,
                      pageType: pageType === "all" ? undefined : pageType,
                    })}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-sm transition-colors",
                      activeView === item
                        ? "border-brand bg-brand text-white"
                        : "border-border bg-background hover:border-brand/40 hover:text-brand"
                    )}
                  >
                    {viewLabels[item]}
                  </a>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">交易所</p>
              <div className="flex flex-wrap gap-2">
                <a
                  href={buildHref(locale, {
                    view: activeView,
                    dataLocale: selectedDataLocale === "all" ? undefined : selectedDataLocale,
                    pageType: pageType === "all" ? undefined : pageType,
                  })}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-sm transition-colors",
                    selectedExchange === "all"
                      ? "border-brand bg-brand text-white"
                      : "border-border bg-background hover:border-brand/40 hover:text-brand"
                  )}
                >
                  全部交易所
                </a>
                {exchanges.map((item) => (
                  <a
                    key={item.slug}
                    href={buildHref(locale, {
                      view: activeView,
                      exchange: item.slug,
                      dataLocale: selectedDataLocale === "all" ? undefined : selectedDataLocale,
                      pageType: pageType === "all" ? undefined : pageType,
                    })}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-sm transition-colors",
                      selectedExchange === item.slug
                        ? "border-brand bg-brand text-white"
                        : "border-border bg-background hover:border-brand/40 hover:text-brand"
                    )}
                  >
                    {item.name}
                  </a>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">数据语言</p>
              <div className="flex flex-wrap gap-2">
                <a
                  href={buildHref(locale, {
                    view: activeView,
                    exchange: selectedExchange === "all" ? undefined : selectedExchange,
                    pageType: pageType === "all" ? undefined : pageType,
                  })}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-sm transition-colors",
                    selectedDataLocale === "all"
                      ? "border-brand bg-brand text-white"
                      : "border-border bg-background hover:border-brand/40 hover:text-brand"
                  )}
                >
                  全部语言
                </a>
                {LOCALES.map((item) => (
                  <a
                    key={item}
                    href={buildHref(locale, {
                      view: activeView,
                      exchange: selectedExchange === "all" ? undefined : selectedExchange,
                      dataLocale: item,
                      pageType: pageType === "all" ? undefined : pageType,
                    })}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-sm transition-colors",
                      selectedDataLocale === item
                        ? "border-brand bg-brand text-white"
                        : "border-border bg-background hover:border-brand/40 hover:text-brand"
                    )}
                  >
                    {ZH_LOCALE_LABELS[item] ?? LOCALE_LABELS[item]}
                  </a>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">页面类型</p>
              <div className="flex flex-wrap gap-2">
                <a
                  href={buildHref(locale, {
                    view: activeView,
                    exchange: selectedExchange === "all" ? undefined : selectedExchange,
                    dataLocale: selectedDataLocale === "all" ? undefined : selectedDataLocale,
                  })}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-sm transition-colors",
                    !pageType || pageType === "all"
                      ? "border-brand bg-brand text-white"
                      : "border-border bg-background hover:border-brand/40 hover:text-brand"
                  )}
                >
                  全部类型
                </a>
                {pageTypeOptions.map((item) => (
                  <a
                    key={item}
                    href={buildHref(locale, {
                      view: activeView,
                      exchange: selectedExchange === "all" ? undefined : selectedExchange,
                      dataLocale: selectedDataLocale === "all" ? undefined : selectedDataLocale,
                      pageType: item,
                    })}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-sm transition-colors",
                      pageType === item
                        ? "border-brand bg-brand text-white"
                        : "border-border bg-background hover:border-brand/40 hover:text-brand"
                    )}
                  >
                    {getUnifiedSeoPageLabels(labelsLocale, item).short}
                  </a>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/70">
          <CardHeader>
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle>实时接口</CardTitle>
              <DataRealityBadge reality={dataReality.modules.realtimeApi} />
            </div>
            <CardDescription>这些链接会直接打开当前线上 API 返回的数据，也是自动化系统和运营查看所依赖的同一份来源。</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {[
              { label: "统计", href: statsApiHref },
              { label: "机会队列", href: opportunitiesApiHref },
              { label: "收益", href: roiApiHref },
              { label: "页面", href: pagesApiHref },
            ].map((item) => (
              <a
                key={item.label}
                href={item.href}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between rounded-xl border border-border/70 px-4 py-3 transition-colors hover:border-brand/30 hover:bg-muted/20"
                >
                <span>{item.label}</span>
                <span className="inline-flex items-center gap-1 text-brand">
                  打开
                  <ExternalLink className="h-4 w-4" />
                </span>
              </a>
            ))}
            <Separator className="my-3" />
            <div className="space-y-2 text-xs text-muted-foreground">
              <p>发布模式：<span className="font-medium text-foreground">{state.controlPlane.rolloutMode}</span></p>
              <p>每家交易所每日发布上限：<span className="font-medium text-foreground">{state.controlPlane.publishDailyLimitPerExchange}</span></p>
              <p>每家交易所每日刷新上限：<span className="font-medium text-foreground">{state.controlPlane.refreshDailyLimitPerExchange}</span></p>
              <p>隔离语言数：<span className="font-medium text-foreground">{state.controlPlane.quarantinedLocales.length}</span></p>
              <p>GSC 同步状态：<span className="font-medium text-foreground">{STATUS_LABELS[state.externalSources.gsc.status] ?? state.externalSources.gsc.status}</span></p>
              <p>GSC analytics 模式：<span className="font-medium text-foreground">{formatGscAnalyticsMode(state.externalSources.gsc.searchAnalyticsMode ?? "empty")}</span></p>
              <p>GSC sitemap 提交：<span className="font-medium text-foreground">{STATUS_LABELS[state.externalSources.gsc.sitemapSubmitStatus ?? "skipped"] ?? state.externalSources.gsc.sitemapSubmitStatus ?? "未运行"}</span></p>
              {state.externalSources.gsc.note ? (
                <p>GSC 说明：<span className="font-medium text-foreground">{state.externalSources.gsc.note}</span></p>
              ) : null}
              <p>Partner 同步源数：<span className="font-medium text-foreground">{state.externalSources.partners.length}</span></p>
              <p>Partner 已配置源：<span className="font-medium text-foreground">{configuredPartnerCount}</span></p>
              <p>CTA Live Audit：<span className="font-medium text-foreground">{ctaLiveAuditStatus ? `${STATUS_LABELS[ctaLiveAuditStatus.status] ?? ctaLiveAuditStatus.status}${ctaLiveAuditStatus.conclusion ? ` / ${STATUS_LABELS[ctaLiveAuditStatus.conclusion] ?? ctaLiveAuditStatus.conclusion}` : ""}` : "未读取"}</span></p>
              <p>数据判读：<span className="font-medium text-foreground">真实 = 线上接口 / 已接入源；估算 = 模型推算；模拟 = seed / synthetic；未接通 = 尚未配置真实源</span></p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <Card className="border-border/70">
          <CardHeader>
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle>交易所变现看板</CardTitle>
              <DataRealityBadge reality={dataReality.modules.exchangeBoard} />
            </div>
            <CardDescription>按 7 家交易所快速查看预估收益和页面侧已实现佣金。</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {exchangeSummaries.map((item) => (
              <div key={item.slug} className="rounded-2xl border border-border/60 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold">{item.name}</p>
                      <DataRealityBadge
                        reality={
                          dataReality.partnerByExchange.find((entry) => entry.exchangeSlug === item.slug)
                            ?.reality ?? "未接通"
                        }
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {item.opportunityCount} 个机会 · {item.alertCount} 个告警
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-brand">{formatUsd(item.projectedRevenueUsd)}</p>
                    <p className="text-xs text-muted-foreground">预估</p>
                  </div>
                </div>
                <RankBar value={item.projectedRevenueUsd} max={maxProjected} />
                <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                  <span>页面侧已实现收益</span>
                  <span className="font-medium text-foreground">{formatUsd(item.realizedRevenueUsd)}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-border/70">
          <CardHeader>
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle>最近自动化任务</CardTitle>
              <DataRealityBadge reality={dataReality.modules.runs} />
            </div>
            <CardDescription>当前快照里记录的最新 pipeline 任务结果。</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {state.runs.slice(0, 8).map((run) => (
              <div key={run.id} className="rounded-2xl border border-border/60 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold">{run.job}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{run.summary}</p>
                  </div>
                  <Badge variant={run.status === "failed" ? "destructive" : run.status === "warning" ? "outline" : "secondary"}>
                    {STATUS_LABELS[run.status] ?? run.status}
                  </Badge>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">{formatDate(run.completedAt)}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <Card className="border-border/70">
          <CardHeader>
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle>内链刷新浮出结果</CardTitle>
              <DataRealityBadge reality="真实" />
            </div>
            <CardDescription>
              这里直接显示 daily_internal_link_refresh 最近一次选出来的推荐位链接，不再只是页面排序上的隐式变化。
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {focusSlotSections.length ? (
              <div className="space-y-4">
                {focusSlotSections.map((section) => (
                  <div key={section.key} className="rounded-2xl border border-border/60 p-4">
                    <div className="mb-3">
                      <p className="text-sm font-semibold text-foreground">{section.title}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{section.description}</p>
                    </div>
                    <div className="space-y-3">
                      {section.items.map(({ slotLabel, guide }) => (
                        <div key={`${section.key}:${slotLabel}:${guide.locale}:${guide.exchangeSlug}:${guide.pageType}`} className="rounded-2xl border border-border/60 p-4">
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <Badge variant="secondary">{slotLabel}</Badge>
                                <Badge variant="outline">{guide.exchangeSlug}</Badge>
                                <Badge variant="outline">{getUnifiedSeoPageLabels(labelsLocale, guide.pageType).short}</Badge>
                                <Badge variant={guide.source === "dynamic" ? "secondary" : "outline"}>
                                  {guide.source === "dynamic" ? "动态" : "基础"}
                                </Badge>
                              </div>
                              <p className="mt-3 font-semibold">{guide.title}</p>
                              <p className="mt-1 text-sm text-muted-foreground">{guide.primaryQuery}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-semibold text-brand">{guide.score.toFixed(1)}</p>
                              <p className="text-xs text-muted-foreground">refresh score</p>
                            </div>
                          </div>
                          <div className="mt-3 text-xs text-muted-foreground">{guide.href}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-border/70 px-4 py-8 text-sm text-muted-foreground">
                当前筛选条件下暂无内链刷新推荐位。
              </div>
            )}
          </CardContent>
        </Card>
        <Card className="border-border/70">
          <CardHeader>
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle>最近一次竞品空缺结论</CardTitle>
              <Badge variant="outline">weekly operator signal</Badge>
            </div>
            <CardDescription>{dashboardData.competitorGapSummary.summary}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-2xl border border-border/60 p-4">
              <p className="text-sm font-semibold text-foreground">provider 命中情况</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {[
                  { label: "DuckDuckGo", value: filteredProviderHits["duckduckgo-html"] },
                  { label: "Serper", value: filteredProviderHits.serper },
                  { label: "Brave", value: filteredProviderHits.brave },
                ].map((item) => (
                  <Badge key={item.label} variant="outline">
                    {item.label} · {formatNumber(item.value)}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-border/60 p-4">
              <p className="text-sm font-semibold text-foreground">dominant domains</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {filteredDominantDomains.length > 0 ? (
                  filteredDominantDomains.map(([domain, count]) => (
                    <Badge key={domain} variant="secondary">
                      {domain} · {formatNumber(count)}
                    </Badge>
                  ))
                ) : (
                  <span className="text-sm text-muted-foreground">暂无 live SERP 命中域名。</span>
                )}
              </div>
            </div>
            <div className="rounded-2xl border border-border/60 p-4">
              <p className="text-sm font-semibold text-foreground">top SERP winners</p>
              <div className="mt-3 space-y-3">
                {topSerpWinners.length > 0 ? (
                  topSerpWinners.map((winner) => (
                    <div key={`${winner.templateId}:${winner.url}`} className="rounded-xl border border-border/60 p-3">
                      <p className="font-medium">{winner.title}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {winner.domain} · {winner.query}
                      </p>
                      {winner.snippet ? (
                        <p className="mt-2 text-sm text-muted-foreground">{winner.snippet}</p>
                      ) : null}
                      <a
                        href={winner.url}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-brand hover:underline"
                      >
                        打开赢家页面
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  ))
                ) : (
                  <div className="rounded-xl border border-dashed border-border/70 p-3 text-sm text-muted-foreground">
                    当前筛选条件下暂无 top SERP winners。通常是 live research 尚未命中，或该筛选范围暂无可展示结果。
                  </div>
                )}
              </div>
            </div>
            {dashboardData.competitorGapSummary.findings.length > 0 ? (
              dashboardData.competitorGapSummary.findings.slice(0, 5).map((finding) => (
                <div key={finding.id} className="rounded-2xl border border-border/60 p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline">{finding.exchangeSlug}</Badge>
                    <Badge variant="outline">{finding.locale}</Badge>
                    <Badge variant="secondary">{finding.suggestedAction}</Badge>
                    <Badge variant="outline">{finding.confidence}</Badge>
                  </div>
                  <p className="mt-3 font-semibold">{finding.topic}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{finding.competitorPattern}</p>
                  <p className="mt-2 text-sm">{finding.ourGap}</p>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-border/70 p-4 text-sm text-muted-foreground">
                还没有可展示的竞品空缺结论。等 `007-competitor-gap-monitor` 首次产出后，这里会显示最近一次 publish / refresh / 内链建议。
              </div>
            )}
            <Separator />
            <div className="space-y-3">
              <div>
                <p className="text-sm font-semibold text-foreground">反推后的具体页面动作</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  基于最近一次 competitor gap 摘要，把建议落到具体 route、页型和执行动作，便于直接进入 publish / refresh / internal-link 队列。
                </p>
              </div>
              {filteredCompetitorGapActions.length > 0 ? (
                filteredCompetitorGapActions.slice(0, 8).map((action) => (
                  <div key={action.id} className="rounded-2xl border border-border/60 p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline">{action.exchangeSlug}</Badge>
                      <Badge variant="outline">{action.locale}</Badge>
                      <Badge variant="outline">{getUnifiedSeoPageLabels(labelsLocale, action.pageType).short}</Badge>
                      <Badge variant="secondary">{action.action}</Badge>
                      <Badge variant="outline">{action.priority.toUpperCase()}</Badge>
                    </div>
                    <p className="mt-3 font-semibold">{action.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{action.topic}</p>
                    <p className="mt-2 text-sm">{action.reason}</p>
                    <div className="mt-3 text-xs text-muted-foreground">{action.routePath}</div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-border/70 p-4 text-sm text-muted-foreground">
                  当前筛选条件下暂无具体页面动作。运行 `npm run automation:competitor-gap` 后，这里会展示最新反推结果。
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <Card className="border-border/70">
          <CardHeader>
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle>自有渠道分发队列</CardTitle>
              <DataRealityBadge reality="真实" />
            </div>
            <CardDescription>
              这里展示 distribution_jobs 的当前队列。Telegram / X 配置完凭据后会从待发布变成排队中并自动投递。
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {filteredDistributionJobs.length ? (
              filteredDistributionJobs.slice(0, 12).map((job) => (
                <div key={job.id} className="rounded-2xl border border-border/60 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline">{job.channel === "telegram" ? "Telegram" : "X"}</Badge>
                        <Badge
                          variant={
                            job.status === "failed"
                              ? "destructive"
                              : job.status === "published"
                                ? "secondary"
                                : "outline"
                          }
                        >
                          {STATUS_LABELS[job.status] ?? job.status}
                        </Badge>
                        {job.payload.sourceLabel ? (
                          <Badge variant="secondary">{job.payload.sourceLabel}</Badge>
                        ) : null}
                        {job.exchangeSlug ? <Badge variant="outline">{job.exchangeSlug}</Badge> : null}
                        {job.pageType ? <Badge variant="outline">{job.pageType}</Badge> : null}
                        {job.payload.refreshScore != null ? (
                          <Badge variant="outline">刷新分 {job.payload.refreshScore.toFixed(1)}</Badge>
                        ) : null}
                      </div>
                      <p className="mt-3 font-semibold">{job.payload.title}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{job.payload.summary}</p>
                      {job.payload.primaryQuery ? (
                        <p className="mt-2 text-xs text-muted-foreground">
                          主查询：{job.payload.primaryQuery}
                        </p>
                      ) : null}
                    </div>
                    <div className="text-right text-xs text-muted-foreground">
                      <p>{ZH_LOCALE_LABELS[job.locale] ?? job.locale}</p>
                      <p className="mt-1">
                        {job.publishedAt ? `已发布：${formatDate(job.publishedAt)}` : `更新时间：${formatDate(job.updatedAt)}`}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
                    <span>{job.routePath}</span>
                    <a
                      href={job.payload.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-sm font-medium text-brand hover:underline"
                    >
                      打开页面
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                  {job.error ? <p className="mt-3 text-xs text-destructive">错误：{job.error}</p> : null}
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-border/70 px-4 py-8 text-sm text-muted-foreground">
                当前筛选条件下暂无分发任务。
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <Card className="border-border/70">
          <CardHeader>
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle>Partner Earnings 同步源</CardTitle>
              <DataRealityBadge reality={dataReality.modules.partnerSources} />
            </div>
            <CardDescription>区分 API-native 与门户报表型接入，方便快速判断哪家交易所已经具备真实外部自动源。</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {state.externalSources.partners.map((source) => (
              <div key={source.exchangeSlug} className="rounded-2xl border border-border/60 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">
                      {exchanges.find((item) => item.slug === source.exchangeSlug)?.name ?? source.exchangeSlug}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {PARTNER_PROVIDER_LABELS[source.provider ?? "generic"] ?? source.provider ?? "通用 URL 源"}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge variant={source.status === "failed" ? "destructive" : source.status === "success" ? "default" : "outline"}>
                      {STATUS_LABELS[source.status] ?? source.status}
                    </Badge>
                    <DataRealityBadge
                      reality={
                        dataReality.partnerByExchange.find((item) => item.exchangeSlug === source.exchangeSlug)?.reality ??
                        "未接通"
                      }
                    />
                  </div>
                </div>
                <div className="mt-3 space-y-1 text-xs text-muted-foreground">
                  <p>配置状态：<span className="font-medium text-foreground">{source.configured ? "已配置" : "未配置"}</span></p>
                  <p>请求方式：<span className="font-medium text-foreground">{source.method ?? "GET"}</span></p>
                  <p>Fallback 页面：<span className="font-medium text-foreground">{source.fallbackLocale}/{source.exchangeSlug}/{source.fallbackPageType}</span></p>
                  <p>写入记录：<span className="font-medium text-foreground">{formatNumber(source.commissionsWritten + source.conversionsWritten)}</span></p>
                  {source.error ? <p className="text-destructive">错误：{source.error}</p> : null}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 space-y-8">
        {(activeView === "overview" || activeView === "opportunities") && (
          <section>
            <SectionHeading title="高优先级机会" description="在当前筛选条件下分数最高的一批页面机会。" />
            <div className="mb-4"><DataRealityBadge reality={dataReality.modules.opportunities} /></div>
            <div className="grid gap-4 lg:grid-cols-2">
              {filteredOpportunities.slice(0, 12).map((item) => (
                <OpportunityCard key={item.id} locale={locale} item={item} />
              ))}
            </div>
          </section>
        )}

        {(activeView === "overview" || activeView === "roi") && (
          <section>
            <SectionHeading title="页面 ROI 排行" description="当前带来最强佣金信号的页面。" />
            <div className="mb-4"><DataRealityBadge reality={dataReality.modules.pageRoi} /></div>
            <div className="grid gap-4 lg:grid-cols-2">
              {filteredPageRoi.slice(0, 12).map((item) => (
                <RoiCard key={item.id} locale={locale} item={item} mode="page" />
              ))}
            </div>
          </section>
        )}

        {(activeView === "overview" || activeView === "roi") && (
          <section>
            <SectionHeading title="查询 ROI 排行" description="按佣金贡献排序的 query cluster。" />
            <div className="mb-4"><DataRealityBadge reality={dataReality.modules.queryRoi} /></div>
            <div className="grid gap-4 lg:grid-cols-2">
              {filteredQueryRoi.slice(0, 12).map((item) => (
                <RoiCard key={item.id} locale={locale} item={item} mode="query" />
              ))}
            </div>
          </section>
        )}

        {(activeView === "overview" || activeView === "alerts") && (
          <section>
            <SectionHeading title="告警" description="当前筛选条件下的自动化告警与异常状态。" />
            <div className="mb-4"><DataRealityBadge reality={dataReality.modules.alerts} /></div>
            {filteredAlerts.length ? (
              <div className="grid gap-4 lg:grid-cols-2">
                {filteredAlerts.map((item) => (
                  <Card key={item.id} className="border-border/70">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <div className={cn(
                            "mt-0.5 rounded-xl p-2",
                            item.level === "critical" ? "bg-destructive/10 text-destructive" : item.level === "warning" ? "bg-amber-100 text-amber-700" : "bg-muted text-foreground"
                          )}>
                            <AlertTriangle className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-semibold">{item.type}</p>
                            <p className="mt-1 text-sm text-muted-foreground">{item.message}</p>
                          </div>
                        </div>
                        <AlertBadge level={item.level} />
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                        {item.scope.exchangeSlug ? <span>交易所：{item.scope.exchangeSlug}</span> : null}
                        {item.scope.locale ? <span>语言：{ZH_LOCALE_LABELS[item.scope.locale] ?? item.scope.locale}</span> : null}
                        {item.scope.pageType ? <span>类型：{getUnifiedSeoPageLabels(labelsLocale, item.scope.pageType).short}</span> : null}
                        {item.sourceLabel ? <span>来源：{item.sourceLabel}</span> : null}
                      </div>
                      <p className="mt-3 text-xs text-muted-foreground">触发时间：{formatDate(item.triggeredAt)}</p>
                      {item.href ? (
                        <a
                          href={item.href}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-brand hover:underline"
                        >
                          查看运行
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      ) : null}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="border-border/70">
                <CardContent className="flex items-center gap-3 p-6 text-sm text-muted-foreground">
                  <ShieldCheck className="h-5 w-5 text-emerald-600" />
                  当前筛选条件下没有命中的告警。
                </CardContent>
              </Card>
            )}
          </section>
        )}

        {(activeView === "overview" || activeView === "pages") && (
          <section>
            <SectionHeading title="已生成页面" description="当前 automation state 中的页面，按质量分排序。" />
            <div className="mb-4"><DataRealityBadge reality={dataReality.modules.pages} /></div>
            <div className="grid gap-4 lg:grid-cols-2">
              {filteredPages.slice(0, 12).map((page) => (
                <Card key={page.id} className="border-border/70">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-semibold">{page.exchangeSlug} · {getUnifiedSeoPageLabels(page.locale, page.pageType).short}</p>
                        <p className="mt-1 text-sm text-muted-foreground">{page.primaryQuery}</p>
                      </div>
                      <Badge variant={page.stage === "published" ? "secondary" : page.stage === "quarantined" ? "destructive" : "outline"}>
                        {STATUS_LABELS[page.stage] ?? page.stage}
                      </Badge>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-3 text-xs text-muted-foreground sm:grid-cols-4">
                      <div>
                        <p className="font-medium text-foreground">{ZH_LOCALE_LABELS[page.locale] ?? page.locale}</p>
                        <p>语言</p>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{page.qualityScore}</p>
                        <p>质量分</p>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{formatDate(page.lastReviewed)}</p>
                        <p>最近复核</p>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{formatDate(page.refreshDueAt)}</p>
                        <p>下次刷新</p>
                      </div>
                    </div>
                    <a
                      href={`/${locale}${getUnifiedSeoPageHref(page.exchangeSlug, page.pageType)}`}
                      className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-brand hover:underline"
                    >
                      打开落地页
                      <ArrowUpRight className="h-4 w-4" />
                    </a>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function OpportunityCard({ locale, item }: { locale: string; item: QueryOpportunity }) {
  const pageHref = `/${locale}${getUnifiedSeoPageHref(item.exchangeSlug, item.pageType)}`;
  return (
    <Card className="border-border/70">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">{ZH_LOCALE_LABELS[item.locale] ?? item.locale}</Badge>
              <Badge variant="outline">{item.exchangeSlug}</Badge>
              <Badge variant="outline">{getUnifiedSeoPageLabels("zh", item.pageType).short}</Badge>
              <FocusLaneBadge lane={item.focusLane} />
            </div>
            <p className="mt-3 text-lg font-semibold tracking-tight">{item.primaryQuery}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              动作：{item.recommendedAction} · 阶段：{item.stage} · discovery priority {formatNumber(item.discoveryPriority)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">分数</p>
            <p className="text-2xl font-semibold text-brand">{item.score}</p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
          <Metric label="质量分" value={String(item.qualityScore)} />
          <Metric label="预估 EPC" value={formatUsd(item.projectedEpcUsd)} />
          <Metric label="月度收益" value={formatUsd(item.projectedMonthlyRevenueUsd)} />
          <Metric label="观测时间" value={formatDate(item.observedAt)} />
        </div>
        <a href={pageHref} className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-brand hover:underline">
          打开落地页
          <ArrowUpRight className="h-4 w-4" />
        </a>
      </CardContent>
    </Card>
  );
}

function RoiCard({ locale, item, mode }: { locale: string; item: RoiEntry; mode: "page" | "query" }) {
  const pageHref = `/${locale}${getUnifiedSeoPageHref(item.exchangeSlug, item.pageType)}`;
  return (
    <Card className="border-border/70">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">{ZH_LOCALE_LABELS[item.locale] ?? item.locale}</Badge>
              <Badge variant="outline">{item.exchangeSlug}</Badge>
              <Badge variant="outline">{getUnifiedSeoPageLabels("zh", item.pageType).short}</Badge>
            </div>
            <p className="mt-3 text-lg font-semibold tracking-tight">{item.primaryQuery}</p>
            <p className="mt-1 text-sm text-muted-foreground">{mode === "page" ? "页面 ROI" : "查询 ROI"} · key: {item.key}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">佣金</p>
            <p className="text-2xl font-semibold text-brand">{formatUsd(item.commissionsUsd)}</p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
          <Metric label="点击" value={formatNumber(item.clicks)} />
          <Metric label="注册" value={formatNumber(item.registrations)} />
          <Metric label="EPC" value={formatUsd(item.epcUsd)} />
          <Metric label="RPM" value={formatUsd(item.rpmUsd)} />
        </div>
        <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
          <span>{formatDate(item.observedAt)}</span>
          <a href={pageHref} className="inline-flex items-center gap-1 text-sm font-medium text-brand hover:underline">
            打开落地页
            <ArrowUpRight className="h-4 w-4" />
          </a>
        </div>
      </CardContent>
    </Card>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-muted/40 px-3 py-2">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-semibold text-foreground">{value}</p>
    </div>
  );
}
