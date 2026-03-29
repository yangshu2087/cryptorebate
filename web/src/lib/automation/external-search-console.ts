import { JWT, OAuth2Client } from "google-auth-library";
import { exchanges } from "@/data/exchanges";
import { LOCALES, SITE_URL } from "@/lib/constants";
import type { QuerySignal } from "./types";
import type { SearchConsoleConfig } from "./external-config";
import type { SearchConsolePageObservation } from "./gsc-focus-page-monitor";

type SearchConsoleRow = {
  keys?: string[];
  clicks?: number;
  impressions?: number;
  ctr?: number;
  position?: number;
};

type SearchConsoleResponse = {
  rows?: SearchConsoleRow[];
};

type SearchConsoleDimension = "query" | "page";

export type SearchConsoleSyncReport = {
  enabled: boolean;
  status: "success" | "failed" | "skipped" | "disabled";
  configured: boolean;
  property?: string;
  authMode?: SearchConsoleConfig["authMode"];
  lastSyncAt?: string;
  rowsFetched: number;
  signalsWritten: number;
  searchAnalyticsMode?: "query-page" | "page-only" | "empty";
  note?: string;
  error?: string;
};

export type SearchConsoleSitemapSubmitReport = {
  enabled: boolean;
  configured: boolean;
  status: "success" | "failed" | "skipped" | "disabled";
  property?: string;
  authMode?: SearchConsoleConfig["authMode"];
  submitted: string[];
  lastSubmittedAt?: string;
  error?: string;
};

export function normaliseSearchConsoleSitemapUrl(sitemapUrl: string) {
  const trimmed = sitemapUrl.trim();
  if (!trimmed) return null;

  try {
    return new URL(trimmed, SITE_URL).toString();
  } catch {
    return null;
  }
}

const pageTypeKeywords: Record<string, string[]> = {
  "referral-code": [
    "referral",
    "invite",
    "invitation",
    "邀请码",
    "紹介コード",
    "추천",
    "código",
    "código de referido",
    "codigo de referidos",
    "рефераль",
  ],
  "signup-kyc": [
    "signup",
    "sign up",
    "register",
    "registration",
    "kyc",
    "verification",
    "注册",
    "認証",
    "가입",
    "вериф",
  ],
  "fees-rebate": [
    "fee",
    "fees",
    "rebate",
    "commission",
    "手续费",
    "手数料",
    "수수료",
    "comisión",
    "comissão",
    "комис",
  ],
  "official-site": [
    "official",
    "site",
    "website",
    "官网",
    "官方",
    "公式",
    "공식",
    "oficial",
    "официаль",
  ],
  "app-download": [
    "app",
    "download",
    "apk",
    "ios",
    "下载",
    "ダウンロード",
    "다운로드",
    "descargar",
    "baixar",
    "скачать",
  ],
  "safety-review": [
    "safe",
    "safety",
    "review",
    "legit",
    "scam",
    "security",
    "安全",
    "正规",
    "評判",
    "安全性",
    "seguro",
    "segurança",
    "безопас",
  ],
  login: ["login", "log in", "sign in", "登录", "登入", "ログイン", "로그인", "вход"],
  "country-availability": [
    "country",
    "available",
    "availability",
    "restricted",
    "region",
    "supported country",
    "国家",
    "地区",
    "地域",
    "국가",
    "страна",
  ],
  "deposit-withdrawal": [
    "deposit",
    "withdraw",
    "withdrawal",
    "withdrawals",
    "充值",
    "提现",
    "入金",
    "出金",
    "입금",
    "출금",
  ],
  "copy-trading": ["copy trading", "copytrade", "跟单", "コピートレード", "카피 트레이딩"],
  "trading-bot": ["trading bot", "bot", "grid bot", "机器人", "бот", "봇"],
  "proof-of-reserves": [
    "proof of reserves",
    "reserves",
    "储备金证明",
    "準備金",
    "지급준비금",
  ],
  "verification-troubleshooting": [
    "verification",
    "kyc failed",
    "kyc problem",
    "审核失败",
    "验证失败",
    "認証できない",
    "인증 실패",
  ],
  "new-listings": [
    "new listings",
    "listed",
    "listing",
    "上新",
    "新币",
    "新規上場",
    "신규 상장",
  ],
};

const exchangeAliases: Record<string, string[]> = {
  binance: ["binance", "币安", "安币", "binan", "바이낸스", "バイナンス"],
  okx: ["okx", "okex", "欧易", "오케이엑스", "オーケーエックス"],
  bybit: ["bybit", "바이비트", "バイビット", "拜бит", "拜比特"],
  bitget: ["bitget", "比特给", "비트겟", "ビットゲット"],
  gate: ["gate", "gate.io", "芝麻开门", "게이트", "ゲート"],
  kucoin: ["kucoin", "库币", "쿠코인", "クーコイン"],
  huobi: ["huobi", "htx", "火币", "후오비", "フォビ"],
};

function getDateDaysAgo(daysAgo: number) {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - daysAgo);
  return date.toISOString().slice(0, 10);
}

function getTodayDate() {
  return new Date().toISOString().slice(0, 10);
}

async function querySearchAnalyticsRows(
  config: SearchConsoleConfig,
  token: string,
  dimensions: SearchConsoleDimension[],
  options: {
    rowLimit?: number;
    dimensionFilterGroups?: Array<{
      filters: Array<{
        dimension: SearchConsoleDimension;
        operator: "equals";
        expression: string;
      }>;
    }>;
  } = {}
) {
  const endpoint = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(
    config.property ?? ""
  )}/searchAnalytics/query`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      startDate: getDateDaysAgo(config.startDaysAgo),
      endDate: getTodayDate(),
      dimensions,
      rowLimit: options.rowLimit ?? config.rowLimit,
      type: "web",
      ...(options.dimensionFilterGroups
        ? { dimensionFilterGroups: options.dimensionFilterGroups }
        : {}),
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`GSC request failed (${response.status}): ${body}`);
  }

  const payload = (await response.json()) as SearchConsoleResponse;
  return payload.rows ?? [];
}

async function getAccessToken(
  config: SearchConsoleConfig,
  mode: "readonly" | "write" = "readonly"
) {
  const scopes =
    mode === "write"
      ? ["https://www.googleapis.com/auth/webmasters"]
      : ["https://www.googleapis.com/auth/webmasters.readonly"];

  if (!config.authMode) {
    throw new Error("Missing AUTOMATION_GSC_AUTH_MODE");
  }

  if (config.authMode === "service-account") {
    if (config.serviceAccountJson) {
      const credentials = JSON.parse(config.serviceAccountJson) as {
        client_email?: string;
        private_key?: string;
      };
      const client = new JWT({
        email: credentials.client_email,
        key: credentials.private_key,
        scopes,
      });
      const token = await client.getAccessToken();
      if (!token.token) throw new Error("Failed to obtain GSC service-account token");
      return token.token;
    }

    if (!config.clientEmail || !config.privateKey) {
      throw new Error("Missing GSC service-account credentials");
    }

    const client = new JWT({
      email: config.clientEmail,
      key: config.privateKey,
      scopes,
    });
    const token = await client.getAccessToken();
    if (!token.token) throw new Error("Failed to obtain GSC service-account token");
    return token.token;
  }

  if (!config.clientId || !config.clientSecret || !config.refreshToken) {
    throw new Error("Missing GSC OAuth refresh-token credentials");
  }

  const client = new OAuth2Client(config.clientId, config.clientSecret);
  client.setCredentials({ refresh_token: config.refreshToken });
  const token = await client.getAccessToken();
  if (!token.token) throw new Error("Failed to obtain GSC refresh-token access token");
  return token.token;
}

function parseAutomationPath(pageUrl?: string) {
  if (!pageUrl) return null;

  try {
    const url = new URL(pageUrl, SITE_URL);
    const parts = url.pathname.split("/").filter(Boolean);
    const locale = parts[0];
    if (!locale || !LOCALES.includes(locale as (typeof LOCALES)[number])) return null;
    if (parts[1] !== "exchanges") return null;
    const exchangeSlug = parts[2];
    const pageType = parts[3];
    if (!exchangeSlug || !pageType) return null;
    return { locale, exchangeSlug, pageType };
  } catch {
    return null;
  }
}

function inferExchangeSlug(query: string) {
  const lowered = query.toLowerCase();
  return (
    exchanges.find((exchange) =>
      (exchangeAliases[exchange.slug] ?? [exchange.name.toLowerCase()]).some((alias) =>
        lowered.includes(alias.toLowerCase())
      )
    )?.slug ?? null
  );
}

function inferPageType(query: string) {
  const lowered = query.toLowerCase();
  for (const [pageType, keywords] of Object.entries(pageTypeKeywords)) {
    if (keywords.some((keyword) => lowered.includes(keyword.toLowerCase()))) {
      return pageType;
    }
  }
  return null;
}

function inferLocale(query: string) {
  if (/[\u4e00-\u9fff]/.test(query)) return "zh";
  if (/[\u3040-\u30ff]/.test(query)) return "ja";
  if (/[\u3130-\u318F\uAC00-\uD7AF]/.test(query)) return "ko";
  if (/[\u0400-\u04FF]/.test(query)) return "ru";
  if (/[\u0900-\u097F]/.test(query)) return "hi";
  if (/[\u0E00-\u0E7F]/.test(query)) return "th";
  return "en";
}

function getMonetizationPotential(exchangeSlug: string, pageType: string) {
  const exchange = exchanges.find((item) => item.slug === exchangeSlug);
  if (!exchange) return 1;
  const rebateWeight = Number.parseFloat(exchange.spotRebate.replace("%", "")) / 10;
  const pageTypeWeight =
    {
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
    }[pageType] ?? 1;

  return Number((rebateWeight * pageTypeWeight).toFixed(3));
}

export function mapSearchConsoleRowsToSignals(rows: SearchConsoleRow[]): QuerySignal[] {
  return rows.flatMap((row, index) => {
    const query = row.keys?.[0];
    const pageUrl = row.keys?.[1];
    if (!query) return [];

    const parsedPath = parseAutomationPath(pageUrl);
    const exchangeSlug = parsedPath?.exchangeSlug ?? inferExchangeSlug(query);
    const pageType = parsedPath?.pageType ?? inferPageType(query);
    const locale = parsedPath?.locale ?? inferLocale(query);

    if (!exchangeSlug || !pageType) return [];

    return [
      {
        id: `gsc-${locale}-${exchangeSlug}-${pageType}-${index}`,
        source: "gsc",
        locale,
        exchangeSlug,
        query,
        intent: pageType,
        pageType,
        impressions: Math.max(0, Math.round(row.impressions ?? 0)),
        clicks: Math.max(0, Math.round(row.clicks ?? 0)),
        ctr: Number((row.ctr ?? 0).toFixed(4)),
        position: Number((row.position ?? 0).toFixed(2)),
        growthRate: Number(Math.max(0.02, Math.min(0.6, (row.ctr ?? 0) * 1.8)).toFixed(3)),
        observedAt: new Date().toISOString(),
        monetizationPotential: getMonetizationPotential(exchangeSlug, pageType),
      },
    ];
  });
}

export async function fetchSearchConsoleSignals(
  config: SearchConsoleConfig
): Promise<{ signals: QuerySignal[]; report: SearchConsoleSyncReport }> {
  if (!config.enabled) {
    return {
      signals: [],
      report: {
        enabled: false,
        status: "disabled",
        configured: false,
        rowsFetched: 0,
        signalsWritten: 0,
      },
    };
  }

  if (!config.property || !config.authMode) {
    return {
      signals: [],
      report: {
        enabled: true,
        status: "skipped",
        configured: false,
        authMode: config.authMode,
        property: config.property,
        rowsFetched: 0,
        signalsWritten: 0,
        error: "Missing property or auth mode",
      },
    };
  }

  try {
    const token = await getAccessToken(config, "readonly");
    const queryAndPageRows = await querySearchAnalyticsRows(config, token, ["query", "page"]);
    const pageOnlyRows =
      queryAndPageRows.length === 0
        ? await querySearchAnalyticsRows(config, token, ["page"])
        : [];
    const rows = queryAndPageRows.length > 0 ? queryAndPageRows : pageOnlyRows;
    const signals = mapSearchConsoleRowsToSignals(queryAndPageRows);
    const searchAnalyticsMode =
      queryAndPageRows.length > 0
        ? "query-page"
        : pageOnlyRows.length > 0
          ? "page-only"
          : "empty";
    const note =
      searchAnalyticsMode === "page-only"
        ? `Search Console query+page rows were empty; fell back to page-only analytics rows (${pageOnlyRows.length}).`
        : searchAnalyticsMode === "empty"
          ? "Search Console returned no query+page or page-only rows for the current lookback window."
          : undefined;

    return {
      signals,
      report: {
        enabled: true,
        status: "success",
        configured: true,
        property: config.property,
        authMode: config.authMode,
        lastSyncAt: new Date().toISOString(),
        rowsFetched: rows.length,
        signalsWritten: signals.length,
        searchAnalyticsMode,
        note,
      },
    };
  } catch (error) {
    return {
      signals: [],
      report: {
        enabled: true,
        status: "failed",
        configured: true,
        property: config.property,
        authMode: config.authMode,
        rowsFetched: 0,
        signalsWritten: 0,
        error: error instanceof Error ? error.message : "Unknown GSC sync error",
      },
    };
  }
}

export async function fetchSearchConsolePageObservations(
  config: SearchConsoleConfig,
  pageUrls: string[]
): Promise<SearchConsolePageObservation[]> {
  if (!config.enabled || !config.property || !config.authMode || pageUrls.length === 0) {
    return [];
  }

  const token = await getAccessToken(config, "readonly");
  const uniqueUrls = Array.from(new Set(pageUrls));
  const rows = await Promise.all(
    uniqueUrls.map(async (pageUrl) => {
      const observationRows = await querySearchAnalyticsRows(config, token, ["page"], {
        rowLimit: 1,
        dimensionFilterGroups: [
          {
            filters: [
              {
                dimension: "page",
                operator: "equals",
                expression: pageUrl,
              },
            ],
          },
        ],
      });

      const row = observationRows[0];
      if (!row) return null;

      return {
        url: pageUrl,
        clicks: Math.max(0, Math.round(row.clicks ?? 0)),
        impressions: Math.max(0, Math.round(row.impressions ?? 0)),
        ctr: Number((row.ctr ?? 0).toFixed(4)),
        position: Number((row.position ?? 0).toFixed(2)),
      } satisfies SearchConsolePageObservation;
    })
  );

  return rows.filter((row): row is SearchConsolePageObservation => Boolean(row));
}

export async function submitSearchConsoleSitemaps(
  config: SearchConsoleConfig,
  sitemapUrls: string[]
): Promise<SearchConsoleSitemapSubmitReport> {
  const uniqueUrls = Array.from(
    new Set(
      sitemapUrls
        .map((url) => normaliseSearchConsoleSitemapUrl(url))
        .filter((url): url is string => Boolean(url))
    )
  );

  if (!config.enabled) {
    return {
      enabled: false,
      configured: false,
      status: "disabled",
      property: config.property,
      authMode: config.authMode,
      submitted: [],
    };
  }

  if (!config.submitSitemaps) {
    return {
      enabled: true,
      configured: Boolean(config.property && config.authMode),
      status: "skipped",
      property: config.property,
      authMode: config.authMode,
      submitted: [],
    };
  }

  if (!config.property || !config.authMode) {
    return {
      enabled: true,
      configured: false,
      status: "skipped",
      property: config.property,
      authMode: config.authMode,
      submitted: [],
      error: "Missing property or auth mode",
    };
  }

  try {
    const token = await getAccessToken(config, "write");
    const submitted: string[] = [];

    for (const sitemapUrl of uniqueUrls) {
      const endpoint = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(
        config.property
      )}/sitemaps/${encodeURIComponent(sitemapUrl)}`;

      const response = await fetch(endpoint, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const body = await response.text();
        throw new Error(`Sitemap submit failed (${response.status}) for ${sitemapUrl}: ${body}`);
      }

      submitted.push(sitemapUrl);
    }

    return {
      enabled: true,
      configured: true,
      status: "success",
      property: config.property,
      authMode: config.authMode,
      submitted,
      lastSubmittedAt: new Date().toISOString(),
    };
  } catch (error) {
    return {
      enabled: true,
      configured: true,
      status: "failed",
      property: config.property,
      authMode: config.authMode,
      submitted: [],
      error:
        error instanceof Error
          ? error.message
          : "Unknown Search Console sitemap submit error",
    };
  }
}
