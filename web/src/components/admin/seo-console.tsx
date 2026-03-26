import type { ComponentType } from "react";
import { AlertTriangle, ArrowUpRight, Bot, CircleAlert, ExternalLink, LineChart, ShieldCheck, Sparkles, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { LOCALES, LOCALE_LABELS, SITE_URL } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { exchanges } from "@/data/exchanges";
import {
  getAutomationState,
  getUnifiedSeoPageHref,
  getUnifiedSeoPageLabels,
} from "@/lib/automation/catalog";
import { getAutomationDataReality } from "@/lib/automation/data-reality";
import type { DataReality } from "@/lib/automation/data-reality";
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
  generated: "已生成",
  validated: "已校验",
  published: "已发布",
  refresh_due: "待刷新",
  underperforming: "低表现",
  quarantined: "已隔离",
  deprecated: "已废弃",
};

const PARTNER_PROVIDER_LABELS: Record<string, string> = {
  generic: "通用 URL 源",
  "csv-portal": "CSV 报表源",
  "okx-broker": "OKX Broker API",
  "gate-api4": "Gate APIv4",
};

type SeoConsoleProps = {
  locale: string;
  view: string | undefined;
  exchange: string | undefined;
  dataLocale: string | undefined;
  pageType: string | undefined;
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

function formatDate(value: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
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

export function SeoConsole({ locale, view, exchange, dataLocale, pageType }: SeoConsoleProps) {
  const state = getAutomationState();
  const dataReality = getAutomationDataReality(state);
  const activeView: ViewMode = isViewMode(view) ? view : "overview";
  const selectedExchange: string = exchanges.some((item) => item.slug === exchange) ? exchange ?? "all" : "all";
  const selectedDataLocale = isKnownLocale(dataLocale) ? String(dataLocale) : "all";
  const labelsLocale = "zh";
  const generatedAt = formatDate(state.generatedAt);
  const configuredPartnerCount = dataReality.flags.configuredPartnerCount;

  const filteredOpportunities = state.opportunities
    .filter((item) => (selectedExchange === "all" ? true : item.exchangeSlug === selectedExchange))
    .filter((item) => (selectedDataLocale === "all" ? true : item.locale === selectedDataLocale))
    .filter((item) => (!pageType || pageType === "all" ? true : item.pageType === pageType))
    .sort((a, b) => b.score - a.score);

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

  const filteredAlerts = state.alerts.filter((item) => {
    const exchangePass = selectedExchange === "all" ? true : item.scope.exchangeSlug === selectedExchange;
    const localePass = selectedDataLocale === "all" ? true : item.scope.locale === selectedDataLocale;
    return exchangePass && localePass;
  });

  const exchangeSummaries = exchanges
    .map((item) => {
      const opps = state.opportunities.filter((opp) => opp.exchangeSlug === item.slug);
      const roi = state.pageRoiDaily.filter((entry) => entry.exchangeSlug === item.slug);
      const alerts = state.alerts.filter((alert) => alert.scope.exchangeSlug === item.slug);
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
              当前数据来源：automation state + 线上 API（<span className="font-medium">{SITE_URL}</span>）
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <MetricCard
          icon={Sparkles}
          label="信号数"
          value={formatNumber(state.metrics.totalSignals)}
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
          value={formatNumber(state.metrics.totalOpportunities)}
          helper="跨语言、跨交易所排序后的页面机会"
          reality={dataReality.metrics.opportunities}
          realityHint="机会分数来自评分模型，不是实际流量或实际收入。"
        />
        <MetricCard
          icon={Bot}
          label="已发布页面"
          value={formatNumber(state.metrics.publishedPages)}
          helper="当前被自动化系统视为有效的页面数"
          reality={dataReality.metrics.publishedPages}
          realityHint="这是系统真实已生成/已纳入状态快照的页面资产数。"
        />
        <MetricCard
          icon={LineChart}
          label="月度预估收益"
          value={formatUsd(state.metrics.monthlyProjectedRevenueUsd)}
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
          value={formatNumber(state.alerts.length)}
          helper={`${state.controlPlane.quarantinedPageKeys.length} 个隔离页面键 · 平均质量分 ${state.metrics.averageQualityScore}`}
          reality={dataReality.metrics.alerts}
          realityHint="当前为规则型自动化告警，不等同于生产事故监控。"
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
              <p>Partner 同步源数：<span className="font-medium text-foreground">{state.externalSources.partners.length}</span></p>
              <p>Partner 已配置源：<span className="font-medium text-foreground">{configuredPartnerCount}</span></p>
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
                    <p className="font-semibold">{item.name}</p>
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
                      </div>
                      <p className="mt-3 text-xs text-muted-foreground">触发时间：{formatDate(item.triggeredAt)}</p>
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
            </div>
            <p className="mt-3 text-lg font-semibold tracking-tight">{item.primaryQuery}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              动作：{item.recommendedAction} · 阶段：{item.stage}
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
