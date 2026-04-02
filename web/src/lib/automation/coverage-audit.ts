import fs from "node:fs/promises";
import path from "node:path";
import { DEFAULT_LOCALE, SITE_URL } from "@/lib/constants";

export type CoverageRepairCheck = {
  key: string;
  label: string;
  category: "redirect" | "not-found" | "discovery" | "observation";
  status: "ok" | "issue" | "error";
  url: string;
  httpStatus: number | null;
  detail: string;
};

export type CoverageRepairSummary = {
  status: "healthy" | "failed" | "never_run";
  label: string;
  checkedAt: string;
  expectedIndexTarget: string;
  xDefaultTarget: string | null;
  xDefaultHealthy: boolean;
  redirectIssueCount: number;
  notFoundIssueCount: number;
  discoveryIssueCount: number;
  issueCount: number;
  checks: CoverageRepairCheck[];
  action: string;
};

export const COVERAGE_REPAIR_ARTIFACT_PATH = path.join(
  process.cwd(),
  "src",
  "data",
  "generated",
  "coverage-repair.json"
);

const CRITICAL_404_PATHS = [
  "/apple-touch-icon.png",
  "/apple-icon.svg",
  "/favicon.svg",
] as const;
const DISCOVERY_ASSET_PATHS = [
  "/robots.txt",
  "/sitemap.xml",
  "/focus-sitemap.xml",
  "/brand-sitemap.xml",
  "/fresh-7d-sitemap.xml",
  "/feed.xml",
] as const;

function getKeyEntrypointPaths(defaultLocale: string) {
  return [
    `/${defaultLocale}/exchanges`,
    `/${defaultLocale}/exchanges/binance`,
    `/${defaultLocale}/exchanges/binance/referral-code`,
  ] as const;
}

export function getDefaultCoverageRepairSummary(
  siteUrl = SITE_URL,
  defaultLocale = DEFAULT_LOCALE
): CoverageRepairSummary {
  const expectedIndexTarget = normalizeAbsoluteUrl(`/${defaultLocale}`, siteUrl);
  return {
    status: "never_run",
    label: "尚无 coverage audit",
    checkedAt: "",
    expectedIndexTarget,
    xDefaultTarget: null,
    xDefaultHealthy: false,
    redirectIssueCount: 0,
    notFoundIssueCount: 0,
    discoveryIssueCount: 0,
    issueCount: 0,
    checks: [],
    action: "先运行 daily coverage audit，生成 sitemap/feed/关键入口的快照后，这里才会显示稳定结果。",
  };
}

function normalizeAbsoluteUrl(value: string, baseUrl: string) {
  const url = new URL(value, baseUrl);
  if (url.pathname !== "/") {
    url.pathname = url.pathname.replace(/\/+$/, "");
  }
  url.hash = "";
  return url.toString();
}

function extractAlternateTarget(linkHeader: string | null, hreflang: string, baseUrl: string) {
  if (!linkHeader) return null;

  for (const entry of linkHeader.split(/,\s*(?=<)/)) {
    if (!entry.includes(`hreflang="${hreflang}"`)) continue;
    const match = entry.match(/^<([^>]+)>/);
    if (!match) return null;
    return normalizeAbsoluteUrl(match[1], baseUrl);
  }

  return null;
}

function getTimeoutSignal(timeoutMs = 5000) {
  if (typeof AbortSignal === "undefined") return undefined;
  if (typeof AbortSignal.timeout !== "function") return undefined;
  return AbortSignal.timeout(timeoutMs);
}

async function safeFetch(fetchImpl: typeof fetch, url: string, init?: RequestInit) {
  try {
    const response = await fetchImpl(url, {
      cache: "no-store",
      redirect: "manual",
      signal: getTimeoutSignal(),
      ...init,
    });
    return { response, error: null };
  } catch (error) {
    return {
      response: null,
      error: error instanceof Error ? error.message : "unknown fetch failure",
    };
  }
}

function countIssues(checks: CoverageRepairCheck[], category: CoverageRepairCheck["category"]) {
  return checks.filter((check) => check.category === category && check.status !== "ok").length;
}

function normalizeCheck(input: unknown, index: number, siteUrl: string): CoverageRepairCheck {
  const record = input && typeof input === "object" ? (input as Record<string, unknown>) : {};
  return {
    key: String(record.key ?? `coverage-check-${index}`),
    label: String(record.label ?? "未命名检查"),
    category:
      (record.category as CoverageRepairCheck["category"] | undefined) ?? "observation",
    status: (record.status as CoverageRepairCheck["status"] | undefined) ?? "error",
    url: normalizeAbsoluteUrl(String(record.url ?? siteUrl), siteUrl),
    httpStatus:
      typeof record.httpStatus === "number"
        ? record.httpStatus
        : record.httpStatus == null
          ? null
          : Number(record.httpStatus),
    detail: String(record.detail ?? ""),
  };
}

export function normalizeCoverageRepairSummary(
  input: unknown,
  siteUrl = SITE_URL,
  defaultLocale = DEFAULT_LOCALE
): CoverageRepairSummary {
  const fallback = getDefaultCoverageRepairSummary(siteUrl, defaultLocale);
  if (!input || typeof input !== "object") return fallback;
  const record = input as Record<string, unknown>;
  const checks = Array.isArray(record.checks)
    ? record.checks.map((item, index) => normalizeCheck(item, index, siteUrl))
    : [];
  const redirectIssueCount = Number(record.redirectIssueCount ?? countIssues(checks, "redirect"));
  const notFoundIssueCount = Number(record.notFoundIssueCount ?? countIssues(checks, "not-found"));
  const discoveryIssueCount = Number(record.discoveryIssueCount ?? countIssues(checks, "discovery"));
  const issueCount = Number(record.issueCount ?? redirectIssueCount + notFoundIssueCount + discoveryIssueCount);

  return {
    status:
      (record.status as CoverageRepairSummary["status"] | undefined) ??
      (issueCount === 0 ? "healthy" : checks.length > 0 ? "failed" : fallback.status),
    label: String(record.label ?? (issueCount === 0 ? "已修复待验证" : `待修复 ${issueCount} 项`)),
    checkedAt: String(record.checkedAt ?? fallback.checkedAt),
    expectedIndexTarget: normalizeAbsoluteUrl(
      String(record.expectedIndexTarget ?? fallback.expectedIndexTarget),
      siteUrl
    ),
    xDefaultTarget:
      record.xDefaultTarget == null ? null : normalizeAbsoluteUrl(String(record.xDefaultTarget), siteUrl),
    xDefaultHealthy: Boolean(record.xDefaultHealthy),
    redirectIssueCount,
    notFoundIssueCount,
    discoveryIssueCount,
    issueCount,
    checks,
    action: String(record.action ?? fallback.action),
  };
}

async function writeCoverageRepairArtifact(summary: CoverageRepairSummary) {
  await fs.mkdir(path.dirname(COVERAGE_REPAIR_ARTIFACT_PATH), { recursive: true });
  await fs.writeFile(COVERAGE_REPAIR_ARTIFACT_PATH, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
}

export async function readCoverageRepairArtifact(
  siteUrl = SITE_URL,
  defaultLocale = DEFAULT_LOCALE
): Promise<CoverageRepairSummary> {
  try {
    const raw = await fs.readFile(COVERAGE_REPAIR_ARTIFACT_PATH, "utf8");
    return normalizeCoverageRepairSummary(JSON.parse(raw), siteUrl, defaultLocale);
  } catch {
    return getDefaultCoverageRepairSummary(siteUrl, defaultLocale);
  }
}

export async function auditCoverageRepair(
  siteUrl = SITE_URL,
  defaultLocale = DEFAULT_LOCALE,
  fetchImpl: typeof fetch = fetch
): Promise<CoverageRepairSummary> {
  const checkedAt = new Date().toISOString();
  const expectedIndexTarget = normalizeAbsoluteUrl(`/${defaultLocale}`, siteUrl);
  const localizedHomeUrl = expectedIndexTarget;
  const rootUrl = normalizeAbsoluteUrl("/", siteUrl);
  const discoveryAssetUrls = DISCOVERY_ASSET_PATHS.map((pathname) => ({
    pathname,
    url: normalizeAbsoluteUrl(pathname, siteUrl),
  }));
  const keyEntrypoints = getKeyEntrypointPaths(defaultLocale).map((pathname) => ({
    pathname,
    url: normalizeAbsoluteUrl(pathname, siteUrl),
  }));

  const [localizedHome, root, ...rest] = await Promise.all([
    safeFetch(fetchImpl, localizedHomeUrl),
    safeFetch(fetchImpl, rootUrl),
    ...CRITICAL_404_PATHS.map((pathname) => safeFetch(fetchImpl, normalizeAbsoluteUrl(pathname, siteUrl))),
    ...discoveryAssetUrls.map((item) => safeFetch(fetchImpl, item.url)),
    ...keyEntrypoints.map((item) => safeFetch(fetchImpl, item.url)),
  ]);

  const criticalAssets = rest.slice(0, CRITICAL_404_PATHS.length);
  const discoveryAssets = rest.slice(
    CRITICAL_404_PATHS.length,
    CRITICAL_404_PATHS.length + discoveryAssetUrls.length
  );
  const entrypointResults = rest.slice(CRITICAL_404_PATHS.length + discoveryAssetUrls.length);

  const xDefaultTarget = extractAlternateTarget(
    localizedHome.response?.headers.get("link") ?? null,
    "x-default",
    siteUrl
  );
  const xDefaultHealthy = xDefaultTarget === expectedIndexTarget;
  const rootRedirectTarget = root.response?.headers.get("location")
    ? normalizeAbsoluteUrl(root.response.headers.get("location") as string, siteUrl)
    : null;
  const rootRedirectHealthy =
    root.response != null &&
    root.response.status >= 300 &&
    root.response.status < 400 &&
    rootRedirectTarget === expectedIndexTarget;

  const checks: CoverageRepairCheck[] = [
    {
      key: "x-default-index-target",
      label: "x-default 默认入口必须直达可索引首页",
      category: "redirect",
      status: localizedHome.error ? "error" : xDefaultHealthy ? "ok" : "issue",
      url: localizedHomeUrl,
      httpStatus: localizedHome.response?.status ?? null,
      detail: localizedHome.error
        ? `检查失败：${localizedHome.error}`
        : xDefaultHealthy
          ? `当前 x-default 指向 ${xDefaultTarget}`
          : `当前 x-default 指向 ${xDefaultTarget ?? "缺失"}，应改为 ${expectedIndexTarget}`,
    },
    {
      key: "root-entry-redirect",
      label: "根路径 / 只应做规范化跳转到默认语言页",
      category: "observation",
      status: root.error ? "error" : rootRedirectHealthy ? "ok" : "issue",
      url: rootUrl,
      httpStatus: root.response?.status ?? null,
      detail: root.error
        ? `检查失败：${root.error}`
        : rootRedirectHealthy
          ? `当前 ${root.response?.status} → ${rootRedirectTarget}`
          : `当前跳转目标为 ${rootRedirectTarget ?? "缺失"}，预期 ${expectedIndexTarget}`,
    },
  ];

  for (let index = 0; index < CRITICAL_404_PATHS.length; index += 1) {
    const pathname = CRITICAL_404_PATHS[index];
    const result = criticalAssets[index];
    const url = normalizeAbsoluteUrl(pathname, siteUrl);
    const healthy = result.response?.status === 200;
    checks.push({
      key: `asset-${pathname.replace(/[^a-z0-9]+/gi, "-")}`,
      label: `${pathname} 关键资源`,
      category: "not-found",
      status: result.error ? "error" : healthy ? "ok" : "issue",
      url,
      httpStatus: result.response?.status ?? null,
      detail: result.error
        ? `检查失败：${result.error}`
        : healthy
          ? "返回 200，可从浏览器与 Google 资源抓取中正常获取。"
          : `当前返回 ${result.response?.status ?? "unknown"}，容易继续触发 Search Console 404。`,
    });
  }

  for (let index = 0; index < discoveryAssetUrls.length; index += 1) {
    const item = discoveryAssetUrls[index];
    const result = discoveryAssets[index];
    const healthy = result.response?.status === 200;
    checks.push({
      key: `discovery-${item.pathname.replace(/[^a-z0-9]+/gi, "-")}`,
      label: `${item.pathname} 发现资产`,
      category: "discovery",
      status: result.error ? "error" : healthy ? "ok" : "issue",
      url: item.url,
      httpStatus: result.response?.status ?? null,
      detail: result.error
        ? `检查失败：${result.error}`
        : healthy
          ? "返回 200，可继续作为 Google 发现与再抓取信号。"
          : `当前返回 ${result.response?.status ?? "unknown"}，会削弱 sitemap/feed/robots 的发现链路。`,
    });
  }

  for (let index = 0; index < keyEntrypoints.length; index += 1) {
    const item = keyEntrypoints[index];
    const result = entrypointResults[index];
    const healthy = result.response?.status === 200;
    checks.push({
      key: `entry-${item.pathname.replace(/[^a-z0-9]+/gi, "-")}`,
      label: `${item.pathname} 关键入口页`,
      category: "discovery",
      status: result.error ? "error" : healthy ? "ok" : "issue",
      url: item.url,
      httpStatus: result.response?.status ?? null,
      detail: result.error
        ? `检查失败：${result.error}`
        : healthy
          ? "返回 200，可继续作为首页 / hub / 焦点页的站内发现入口。"
          : `当前返回 ${result.response?.status ?? "unknown"}，会影响首页之外页面进入 page rows 的机会。`,
    });
  }

  const redirectIssueCount = countIssues(checks, "redirect");
  const notFoundIssueCount = countIssues(checks, "not-found");
  const discoveryIssueCount = countIssues(checks, "discovery");
  const issueCount = redirectIssueCount + notFoundIssueCount + discoveryIssueCount;

  return {
    status: issueCount === 0 ? "healthy" : "failed",
    label: issueCount === 0 ? "已修复待验证" : `待修复 ${issueCount} 项`,
    checkedAt,
    expectedIndexTarget,
    xDefaultTarget,
    xDefaultHealthy,
    redirectIssueCount,
    notFoundIssueCount,
    discoveryIssueCount,
    issueCount,
    checks,
    action:
      issueCount === 0
        ? "daily coverage audit 已确认 redirect / 404 / discovery assets 当前健康；现在去 Search Console 对对应问题点“验证修复”，然后等待 Google 重新抓取。"
        : "daily coverage audit 仍发现 redirect / 404 / discovery assets 风险项；优先修这些 live issues，再去 Search Console 点“验证修复”。",
  };
}

export async function materializeCoverageRepairArtifact(
  siteUrl = SITE_URL,
  defaultLocale = DEFAULT_LOCALE,
  fetchImpl: typeof fetch = fetch
) {
  const summary = await auditCoverageRepair(siteUrl, defaultLocale, fetchImpl);
  await writeCoverageRepairArtifact(summary);
  return summary;
}
