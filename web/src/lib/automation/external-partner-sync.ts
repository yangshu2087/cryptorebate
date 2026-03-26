import crypto from "node:crypto";
import { parse as parseCsv } from "csv-parse/sync";
import { read, utils } from "xlsx";
import type { CommissionEvent, ConversionEvent, ExternalPartnerSyncState } from "./types";
import type { PartnerSyncConfig } from "./external-config";

type PartnerPayload = {
  conversions?: unknown[];
  commissions?: unknown[];
};

type PartnerNormaliseOptions = {
  fallbackAttribution?: PartnerSyncConfig["fallbackAttribution"];
  source?: CommissionEvent["source"];
};

type OkxBrokerDownloadResponse = {
  code?: string;
  msg?: string;
  data?: Array<{
    fileHref?: string;
    state?: string;
    ts?: string;
  }>;
};

type OkxBrokerCreateResponse = {
  code?: string;
  msg?: string;
  data?: Array<{
    result?: string;
    ts?: string;
  }>;
};

class PartnerSyncSkipError extends Error {}

function createBaseReport(config: PartnerSyncConfig): ExternalPartnerSyncState {
  return {
    exchangeSlug: config.exchangeSlug,
    enabled: config.enabled,
    configured: false,
    status: config.enabled ? "skipped" : "disabled",
    provider: config.provider,
    format: config.format,
    method: config.method,
    mode: config.mode,
    fallbackLocale: config.fallbackAttribution.locale,
    fallbackPageType: config.fallbackAttribution.pageType,
    recordsFetched: 0,
    conversionsWritten: 0,
    commissionsWritten: 0,
  };
}

function getHeaderMap(config: PartnerSyncConfig) {
  const headers: Record<string, string> = {};

  if (config.authType === "bearer" && config.token) {
    headers.Authorization = `Bearer ${config.token}`;
    return headers;
  }

  if (config.authType === "header" && config.token) {
    headers[config.authHeaderName ?? "X-API-Key"] = config.token;
    return headers;
  }

  return headers;
}

function buildClusterId(
  exchangeSlug: string,
  locale?: string,
  pageType?: string,
  queryClusterId?: string,
  fallback?: PartnerNormaliseOptions["fallbackAttribution"]
) {
  if (queryClusterId) return queryClusterId;
  const resolvedLocale = locale || fallback?.locale;
  const resolvedPageType = pageType || fallback?.pageType;
  if (!resolvedLocale || !resolvedPageType) return undefined;
  return `cluster-${resolvedLocale}-${exchangeSlug}-${resolvedPageType}`;
}

function normaliseIsoDate(raw: unknown) {
  const value = String(raw ?? "").trim();
  if (!value) return "";
  if (/^\d{13}$/.test(value) || /^\d{10}$/.test(value)) {
    const millis = value.length === 10 ? Number(value) * 1000 : Number(value);
    const date = new Date(millis);
    return Number.isNaN(date.getTime()) ? "" : date.toISOString();
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString();
}

function normaliseConversionRow(
  exchangeSlug: string,
  row: Record<string, unknown>,
  index: number,
  options: PartnerNormaliseOptions = {}
): ConversionEvent | null {
  const locale = String(row.locale ?? row.lang ?? "").trim() || undefined;
  const pageType = String(row.pageType ?? row.page_type ?? "").trim() || undefined;
  const queryClusterId = buildClusterId(
    exchangeSlug,
    locale,
    pageType,
    String(row.queryClusterId ?? row.query_cluster_id ?? "").trim() || undefined,
    options.fallbackAttribution
  );
  const registeredAt = normaliseIsoDate(
    row.registeredAt ?? row.registered_at ?? row.date ?? row.timestamp ?? row.registeredTs
  );

  if (!queryClusterId || !registeredAt) return null;

  return {
    id: String(row.id ?? `${exchangeSlug}-conversion-${index}`),
    exchangeSlug,
    queryClusterId,
    registeredAt,
    tradedAt: normaliseIsoDate(row.tradedAt ?? row.traded_at) || undefined,
    firstDepositUsd: Number(row.firstDepositUsd ?? row.first_deposit_usd ?? 0) || undefined,
    status:
      (String(row.status ?? "registered").trim() as ConversionEvent["status"]) ??
      "registered",
  };
}

function normaliseCommissionRow(
  exchangeSlug: string,
  row: Record<string, unknown>,
  index: number,
  options: PartnerNormaliseOptions = {}
): CommissionEvent | null {
  const locale = String(row.locale ?? row.lang ?? "").trim() || undefined;
  const pageType = String(row.pageType ?? row.page_type ?? "").trim() || undefined;
  const queryClusterId = buildClusterId(
    exchangeSlug,
    locale,
    pageType,
    String(row.queryClusterId ?? row.query_cluster_id ?? "").trim() || undefined,
    options.fallbackAttribution
  );
  const recordedAt = normaliseIsoDate(
    row.recordedAt ?? row.recorded_at ?? row.date ?? row.timestamp ?? row.ts
  );
  const commissionUsd = Number(
    row.commissionUsd ??
      row.commission_usd ??
      row.amount ??
      row.commission ??
      row.brokerRebate ??
      row.broker_rebate ??
      row.rebate ??
      0
  );

  if (!queryClusterId || !recordedAt || !Number.isFinite(commissionUsd)) return null;

  return {
    id: String(row.id ?? row.ordId ?? `${exchangeSlug}-commission-${index}`),
    exchangeSlug,
    queryClusterId,
    commissionUsd,
    recordedAt,
    source: options.source ?? "api",
  };
}

export function normalisePartnerPayload(
  exchangeSlug: string,
  payload: PartnerPayload | Record<string, unknown>[] | string,
  format: PartnerSyncConfig["format"],
  options: PartnerNormaliseOptions = {}
) {
  let rows: Record<string, unknown>[] = [];
  let mode: "array" | "object" = "object";

  if (format === "csv") {
    rows = parseCsv(payload as string, {
      columns: true,
      skip_empty_lines: true,
    }) as Record<string, unknown>[];
    mode = "array";
  } else if (Array.isArray(payload)) {
    rows = payload as Record<string, unknown>[];
    mode = "array";
  }

  const conversions =
    mode === "array"
      ? (rows
          .map((row, index) => normaliseConversionRow(exchangeSlug, row, index, options))
          .filter(Boolean) as ConversionEvent[])
      : ((((payload as PartnerPayload).conversions ?? []) as Record<string, unknown>[])
          .map((row, index) => normaliseConversionRow(exchangeSlug, row, index, options))
          .filter(Boolean) as ConversionEvent[]);

  const commissions =
    mode === "array"
      ? (rows
          .map((row, index) =>
            normaliseCommissionRow(exchangeSlug, row, index, {
              ...options,
              source: options.source ?? (format === "csv" ? "csv" : "api"),
            })
          )
          .filter(Boolean) as CommissionEvent[])
      : ((((payload as PartnerPayload).commissions ?? []) as Record<string, unknown>[])
          .map((row, index) =>
            normaliseCommissionRow(exchangeSlug, row, index, {
              ...options,
              source: options.source ?? "api",
            })
          )
          .filter(Boolean) as CommissionEvent[]);

  return { conversions, commissions };
}

function parseSpreadsheetRows(buffer: Buffer) {
  const workbook = read(buffer, { type: "buffer" });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) return [] as Record<string, unknown>[];
  return utils.sheet_to_json<Record<string, unknown>>(workbook.Sheets[sheetName], {
    defval: "",
  });
}

async function parseDownloadedRows(response: Response) {
  const url = response.url.toLowerCase();
  const contentType = response.headers.get("content-type")?.toLowerCase() ?? "";

  if (contentType.includes("text/csv") || url.endsWith(".csv")) {
    const text = await response.text();
    return parseCsv(text, {
      columns: true,
      skip_empty_lines: true,
    }) as Record<string, unknown>[];
  }

  if (contentType.includes("zip") || url.endsWith(".zip")) {
    throw new Error("Downloaded partner report is a ZIP archive. Please provide a direct CSV/XLS/XLSX export URL.");
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  return parseSpreadsheetRows(buffer);
}

function sha512Hex(value: string) {
  return crypto.createHash("sha512").update(value).digest("hex");
}

function signGateRequest(config: PartnerSyncConfig, url: URL, body: string) {
  if (!config.apiKey || !config.apiSecret) {
    throw new Error("Gate API key and secret are required for gate-api4 provider");
  }

  const timestamp = Math.floor(Date.now() / 1000).toString();
  const query = url.searchParams.toString();
  const signString = [config.method, url.pathname, query, sha512Hex(body), timestamp].join("\n");
  const sign = crypto
    .createHmac("sha512", config.apiSecret)
    .update(signString)
    .digest("hex");

  return {
    KEY: config.apiKey,
    Timestamp: timestamp,
    SIGN: sign,
  };
}

function signOkxRequest(config: PartnerSyncConfig, requestPath: string, body: string) {
  if (!config.apiKey || !config.apiSecret || !config.apiPassphrase) {
    throw new Error("OKX API key, secret, and passphrase are required for okx-broker provider");
  }

  const timestamp = new Date().toISOString();
  const prehash = `${timestamp}${config.method}${requestPath}${body}`;
  const signature = crypto
    .createHmac("sha256", config.apiSecret)
    .update(prehash)
    .digest("base64");

  return {
    "OK-ACCESS-KEY": config.apiKey,
    "OK-ACCESS-SIGN": signature,
    "OK-ACCESS-TIMESTAMP": timestamp,
    "OK-ACCESS-PASSPHRASE": config.apiPassphrase,
  };
}

function getPartnerWindow(config: PartnerSyncConfig) {
  const end = new Date();
  const begin = new Date(end);
  begin.setUTCDate(begin.getUTCDate() - Math.max(1, Math.min(config.windowDays, 180)));
  const format = (date: Date) => {
    const year = date.getUTCFullYear();
    const month = `${date.getUTCMonth() + 1}`.padStart(2, "0");
    const day = `${date.getUTCDate()}`.padStart(2, "0");
    return `${year}${month}${day}`;
  };

  return {
    begin: format(begin),
    end: format(end),
  };
}

async function runGenericSource(config: PartnerSyncConfig) {
  if (!config.url) {
    throw new Error("Missing partner sync URL");
  }

  const body = config.method === "POST" ? config.requestBody ?? "" : "";
  const response = await fetch(config.url, {
    method: config.method,
    headers: {
      ...getHeaderMap(config),
      Accept: config.format === "json" ? "application/json" : "text/csv",
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    body: body || undefined,
  });

  if (!response.ok) {
    throw new Error(`Partner sync failed (${response.status})`);
  }

  const payload =
    config.format === "json"
      ? ((await response.json()) as PartnerPayload | Record<string, unknown>[])
      : await response.text();

  return normalisePartnerPayload(config.exchangeSlug, payload, config.format, {
    fallbackAttribution: config.fallbackAttribution,
  });
}

async function runGateApiSource(config: PartnerSyncConfig) {
  if (!config.url) {
    throw new Error("Gate partner sync requires a full report URL under AUTOMATION_PARTNER_<EXCHANGE>_URL");
  }

  const url = new URL(config.url);
  const body = config.method === "POST" ? config.requestBody ?? "" : "";
  const signedHeaders = signGateRequest(config, url, body);

  const response = await fetch(url, {
    method: config.method,
    headers: {
      Accept: config.format === "json" ? "application/json" : "text/csv",
      ...signedHeaders,
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    body: body || undefined,
  });

  if (!response.ok) {
    throw new Error(`Gate partner sync failed (${response.status})`);
  }

  const payload =
    config.format === "json"
      ? ((await response.json()) as PartnerPayload | Record<string, unknown>[])
      : await response.text();

  return normalisePartnerPayload(config.exchangeSlug, payload, config.format, {
    fallbackAttribution: config.fallbackAttribution,
    source: config.format === "csv" ? "csv" : "api",
  });
}

async function fetchOkxSigned(
  config: PartnerSyncConfig,
  method: "GET" | "POST",
  pathWithQuery: string,
  body = ""
) {
  const url = new URL(pathWithQuery, "https://www.okx.com");
  const signedHeaders = signOkxRequest({ ...config, method }, `${url.pathname}${url.search}`, body);
  const response = await fetch(url, {
    method,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...signedHeaders,
    },
    body: body || undefined,
  });

  if (!response.ok) {
    throw new Error(`OKX broker sync failed (${response.status})`);
  }

  return response.json();
}

function normaliseOkxReportRows(config: PartnerSyncConfig, rows: Record<string, unknown>[]) {
  return rows
    .map((row, index) =>
      normaliseCommissionRow(config.exchangeSlug, row, index, {
        fallbackAttribution: config.fallbackAttribution,
        source: "api",
      })
    )
    .filter(Boolean) as CommissionEvent[];
}

async function runOkxBrokerSource(config: PartnerSyncConfig) {
  const reportKind = config.reportKind ?? "fd";
  const { begin, end } = getPartnerWindow(config);
  const brokerTypeSegment = config.brokerType ? `&brokerType=${config.brokerType}` : "";

  let downloadResponse: OkxBrokerDownloadResponse;

  if (reportKind === "fd") {
    const createBody = JSON.stringify({
      begin,
      end,
      ...(config.brokerType ? { brokerType: config.brokerType } : {}),
    });
    const createResponse = (await fetchOkxSigned(
      config,
      "POST",
      "/api/v5/broker/fd/rebate-per-orders",
      createBody
    )) as OkxBrokerCreateResponse;

    if (createResponse.code && createResponse.code !== "0") {
      throw new Error(createResponse.msg || `OKX report creation failed (${createResponse.code})`);
    }

    downloadResponse = (await fetchOkxSigned(
      config,
      "GET",
      `/api/v5/broker/fd/rebate-per-orders?type=false&begin=${begin}&end=${end}${brokerTypeSegment}`
    )) as OkxBrokerDownloadResponse;
  } else {
    downloadResponse = (await fetchOkxSigned(
      config,
      "GET",
      `/api/v5/broker/dma/rebate-per-orders?type=false&begin=${begin}&end=${end}${brokerTypeSegment}`
    )) as OkxBrokerDownloadResponse;
  }

  if (downloadResponse.code && downloadResponse.code !== "0") {
    throw new Error(downloadResponse.msg || `OKX report fetch failed (${downloadResponse.code})`);
  }

  const latest = downloadResponse.data?.[0];
  if (!latest?.fileHref) {
    throw new PartnerSyncSkipError(
      "OKX report download link is not ready yet. Re-run the sync after the report finishes generating."
    );
  }
  if (latest.state && latest.state !== "finished") {
    throw new PartnerSyncSkipError(
      `OKX report generation state is ${latest.state}. Re-run after it finishes.`
    );
  }

  const fileResponse = await fetch(latest.fileHref, {
    headers: {
      Accept: "text/csv, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    },
  });

  if (!fileResponse.ok) {
    throw new Error(`OKX report download failed (${fileResponse.status})`);
  }

  const rows = await parseDownloadedRows(fileResponse);
  return {
    conversions: [] as ConversionEvent[],
    commissions: normaliseOkxReportRows(config, rows),
  };
}

export async function syncPartnerSource(
  config: PartnerSyncConfig
): Promise<{
  conversions: ConversionEvent[];
  commissions: CommissionEvent[];
  report: ExternalPartnerSyncState;
}> {
  const baseReport = createBaseReport(config);

  if (!config.enabled) {
    return {
      conversions: [],
      commissions: [],
      report: baseReport,
    };
  }

  try {
    const result =
      config.provider === "okx-broker"
        ? await runOkxBrokerSource(config)
        : config.provider === "gate-api4"
          ? await runGateApiSource(config)
          : await runGenericSource(config);

    const totalRecords = result.conversions.length + result.commissions.length;

    return {
      ...result,
      report: {
        ...baseReport,
        configured: true,
        status: "success",
        lastSyncAt: new Date().toISOString(),
        recordsFetched: totalRecords,
        conversionsWritten: result.conversions.length,
        commissionsWritten: result.commissions.length,
      },
    };
  } catch (error) {
    return {
      conversions: [],
      commissions: [],
      report: {
        ...baseReport,
        configured: Boolean(
          config.provider === "okx-broker"
            ? config.apiKey && config.apiSecret && config.apiPassphrase
            : config.provider === "gate-api4"
              ? config.url && config.apiKey && config.apiSecret
              : config.url
        ),
        status: error instanceof PartnerSyncSkipError ? "skipped" : "failed",
        error: error instanceof Error ? error.message : "Unknown partner sync error",
      },
    };
  }
}
