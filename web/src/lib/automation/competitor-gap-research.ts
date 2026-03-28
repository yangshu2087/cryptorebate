import { execFile as execFileCallback } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import { readCompetitorGapSummary, writeCompetitorGapSummary } from "@/lib/automation/competitor-gap";
import type {
  CompetitorGapFinding,
  CompetitorGapSerpProviderReport,
  CompetitorGapSerpResearchProvider,
  CompetitorGapSerpResult,
  CompetitorGapSerpWinnerRecord,
  CompetitorGapSerpWinnersArtifact,
  CompetitorGapSummary,
} from "@/lib/automation/types";

export type ResearchProviderId = CompetitorGapSerpResearchProvider;
export type LiveSerpResult = CompetitorGapSerpResult;
export type ProviderObservationReport = CompetitorGapSerpProviderReport;

export type CompetitorGapResearchObservation = {
  templateId: string;
  query: string;
  results: LiveSerpResult[];
  providerReports?: ProviderObservationReport[];
  template?: CompetitorGapResearchTemplate;
};

export type CompetitorGapResearchTemplate = {
  templateId: string;
  query: string;
  exchangeSlug: CompetitorGapFinding["exchangeSlug"];
  locale: CompetitorGapFinding["locale"];
  topic: string;
  suggestedAction: CompetitorGapFinding["suggestedAction"];
  confidence: CompetitorGapFinding["confidence"];
  defaultCompetitorType: CompetitorGapFinding["competitorType"];
  ourGap: string;
};

export const COMPETITOR_GAP_SERP_WINNERS_PATH = path.join(
  process.cwd(),
  "src",
  "data",
  "generated",
  "competitor-gap-serp-winners.json"
);

export const DEFAULT_COMPETITOR_GAP_TEMPLATE_PATH = path.join(
  process.cwd(),
  "src",
  "data",
  "automation",
  "competitor-gap-query-templates.json"
);

const SERPER_API_KEYS = ["AUTOMATION_SERPER_API_KEY", "SERPER_API_KEY"] as const;
const BRAVE_API_KEYS = ["AUTOMATION_BRAVE_SEARCH_API_KEY", "BRAVE_SEARCH_API_KEY"] as const;
const SUPPORTED_RESEARCH_PROVIDERS = ["duckduckgo-html", "serper", "brave"] as const satisfies readonly ResearchProviderId[];
const PROVIDER_SET = new Set<ResearchProviderId>(SUPPORTED_RESEARCH_PROVIDERS);
const execFile = promisify(execFileCallback);

export const DEFAULT_COMPETITOR_GAP_LIVE_TEMPLATES: CompetitorGapResearchTemplate[] = [
  {
    templateId: "finding-binance-official-trust",
    query: "binance official site referral code",
    exchangeSlug: "binance",
    locale: "en",
    topic: "binance official site / referral entry trust layer",
    suggestedAction: "refresh",
    confidence: "high",
    defaultCompetitorType: "affiliate",
    ourGap:
      "Our official-site and referral-code pages should state the official domain, phishing warning, and exact fallback registration path more aggressively in the first screen instead of relying mainly on generic comparison framing.",
  },
  {
    templateId: "finding-okx-signup-fallback",
    query: "okx signup referral code restrictions",
    exchangeSlug: "okx",
    locale: "en",
    topic: "okx signup with referral code and regional restrictions",
    suggestedAction: "refresh",
    confidence: "high",
    defaultCompetitorType: "official",
    ourGap:
      "CryptoRebate should make manual referral-code fallback and residence-based eligibility much more explicit on OKX signup/KYC pages, not just mention the invite link.",
  },
  {
    templateId: "finding-okx-referral-faq-cluster",
    query: "okx referral faq dex referral code difference",
    exchangeSlug: "okx",
    locale: "en",
    topic: "okx referral faq vs dex referral confusion",
    suggestedAction: "publish",
    confidence: "medium",
    defaultCompetitorType: "official",
    ourGap:
      "We need a clearer page section or dedicated supporting coverage that separates account signup referral, campaign rewards, and DEX referral so users do not misread the path.",
  },
  {
    templateId: "finding-bybit-signup-kyc-helpstyle",
    query: "bybit signup kyc restricted countries help",
    exchangeSlug: "bybit",
    locale: "en",
    topic: "bybit signup / kyc help-center style answers",
    suggestedAction: "refresh",
    confidence: "high",
    defaultCompetitorType: "official",
    ourGap:
      "Our Bybit signup-kyc coverage should read more like an answer page with concrete steps, restricted-country warnings, and document expectations before the CTA.",
  },
  {
    templateId: "finding-cross-exchange-signup-friction",
    query: "referral link not working restricted country exchange signup",
    exchangeSlug: "cross-exchange",
    locale: "multi-locale",
    topic: "registration friction and referral-link fallback",
    suggestedAction: "internal-link",
    confidence: "medium",
    defaultCompetitorType: "help-center",
    ourGap:
      "This topic is still under-linked in our hubs; it should be surfaced as a recurring internal-link and distribution candidate across signup-kyc and official-site families.",
  },
];

const TEMPLATE_BY_ID: Record<string, CompetitorGapResearchTemplate> = Object.fromEntries(
  DEFAULT_COMPETITOR_GAP_LIVE_TEMPLATES.map((template) => [template.templateId, template])
);

function decodeHtml(value: string) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeResultUrl(rawUrl: string) {
  try {
    const decoded = decodeURIComponent(rawUrl);
    if (decoded.startsWith("http://") || decoded.startsWith("https://")) {
      return decoded;
    }
  } catch {
    // ignore decode failure
  }

  if (rawUrl.startsWith("http://") || rawUrl.startsWith("https://")) {
    return rawUrl;
  }

  try {
    const url = new URL(rawUrl, "https://duckduckgo.com");
    const uddg = url.searchParams.get("uddg");
    if (uddg) {
      return decodeURIComponent(uddg);
    }
    return url.toString();
  } catch {
    return rawUrl;
  }
}

function toDomain(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "unknown";
  }
}

function uniqueByUrl(results: LiveSerpResult[]) {
  const seen = new Set<string>();
  return results.filter((result) => {
    if (!result.url || seen.has(result.url)) return false;
    seen.add(result.url);
    return true;
  });
}

function getEnvValue(keys: readonly string[], env: NodeJS.ProcessEnv) {
  for (const key of keys) {
    const value = env[key];
    if (value) return value;
  }
  return undefined;
}

function getSerperApiKey(env: NodeJS.ProcessEnv) {
  return getEnvValue(SERPER_API_KEYS, env);
}

function getBraveApiKey(env: NodeJS.ProcessEnv) {
  return getEnvValue(BRAVE_API_KEYS, env);
}

export function normalizeResearchProviders(
  requested?: string[] | string,
  env: NodeJS.ProcessEnv = process.env
): ResearchProviderId[] {
  const normalizedRequested = Array.isArray(requested)
    ? requested
    : typeof requested === "string"
      ? requested.split(",")
      : [];

  const candidates = normalizedRequested
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean)
    .filter((value): value is ResearchProviderId => PROVIDER_SET.has(value as ResearchProviderId));

  const deduped = [...new Set(candidates)];

  if (deduped.length > 0) {
    return deduped;
  }

  const defaults: ResearchProviderId[] = [];
  if (getSerperApiKey(env)) defaults.push("serper");
  if (getBraveApiKey(env)) defaults.push("brave");
  defaults.push("duckduckgo-html");
  return [...new Set(defaults)];
}

export function extractDuckDuckGoHtmlResults(html: string): LiveSerpResult[] {
  const blocks = Array.from(html.matchAll(/<div[^>]*class="[^"]*result[^"]*"[^>]*>([\s\S]*?)<\/div>/g));
  const parsed = blocks
    .map((match) => {
      const block = match[1] ?? "";
      const anchorMatch = block.match(
        /<a[^>]*class="[^"]*result__a[^"]*"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/i
      );
      if (!anchorMatch) return null;

      const snippetMatch =
        block.match(/<a[^>]*class="[^"]*result__snippet[^"]*"[^>]*>([\s\S]*?)<\/a>/i) ??
        block.match(
          /<div[^>]*class="[^"]*(?:result__snippet|result__extras__url)[^"]*"[^>]*>([\s\S]*?)<\/div>/i
        ) ??
        block.match(/<span[^>]*class="[^"]*result__snippet[^"]*"[^>]*>([\s\S]*?)<\/span>/i);

      const url = normalizeResultUrl(anchorMatch[1] ?? "");
      const title = decodeHtml(anchorMatch[2] ?? "");
      const snippet = decodeHtml(snippetMatch?.[1] ?? "");
      return { title, url, snippet, domain: toDomain(url) } satisfies LiveSerpResult;
    })
    .filter((result): result is LiveSerpResult => Boolean(result?.title && result.url));

  if (parsed.length > 0) return parsed;

  return Array.from(
    html.matchAll(
      /<a[^>]*class="[^"]*result__a[^"]*"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi
    )
  ).map((match) => {
    const url = normalizeResultUrl(match[1] ?? "");
    const title = decodeHtml(match[2] ?? "");
    return { title, url, snippet: "", domain: toDomain(url) } satisfies LiveSerpResult;
  });
}

async function fetchDuckDuckGoHtmlResults(query: string) {
  return fetchDuckDuckGoHtmlResultsViaPython(query);
}

async function fetchDuckDuckGoHtmlResultsViaPython(query: string) {
  const pythonScript = `
import html, json, re, sys, urllib.parse, urllib.request
from urllib.parse import unquote, urlparse, parse_qs

query = sys.argv[1]
url = "https://html.duckduckgo.com/html/?q=" + urllib.parse.quote(query)
req = urllib.request.Request(
    url,
    headers={
        "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
        "accept": "text/html,application/xhtml+xml",
    },
)
with urllib.request.urlopen(req, timeout=20) as response:
    markup = response.read().decode("utf-8", "ignore")

pattern = re.compile(r'<a[^>]*class="[^"]*result__a[^"]*"[^>]*href="([^"]+)"[^>]*>(.*?)</a>', re.I | re.S)
results = []
for href, raw_title in pattern.findall(markup):
    href = html.unescape(href)
    if href.startswith('//duckduckgo.com/l/?'):
        qs = parse_qs(urlparse('https:' + href).query)
        href = unquote((qs.get('uddg') or [''])[0])
    if not href:
        continue
    title = re.sub(r'<[^>]+>', ' ', raw_title)
    title = html.unescape(re.sub(r'\s+', ' ', title)).strip()
    if not title:
        continue
    try:
        domain = urlparse(href).hostname or 'unknown'
    except Exception:
        domain = 'unknown'
    domain = re.sub(r'^www\.', '', domain)
    results.append({
        'title': title,
        'url': href,
        'snippet': '',
        'domain': domain,
    })

# de-duplicate while preserving order
seen = set()
unique = []
for item in results:
    if item['url'] in seen:
        continue
    seen.add(item['url'])
    unique.append(item)

sys.stdout.write(json.dumps(unique[:10]))
`;

  const { stdout } = await execFile("python3", ["-c", pythonScript, query], {
    maxBuffer: 8 * 1024 * 1024,
  });
  const parsed = JSON.parse(stdout) as Array<{ title?: string; url?: string; snippet?: string; domain?: string }>;
  return parsed
    .map((item) => {
      const url = item.url?.trim() ?? "";
      const title = item.title?.trim() ?? "";
      if (!url || !title) return null;
      return {
        title,
        url,
        snippet: item.snippet?.trim() ?? "",
        domain: item.domain?.trim() ?? toDomain(url),
      } satisfies LiveSerpResult;
    })
    .filter((item): item is LiveSerpResult => Boolean(item));
}

async function fetchSerperResults(
  query: string,
  fetchImpl: typeof fetch,
  apiKey: string
): Promise<LiveSerpResult[]> {
  const response = await fetchImpl("https://google.serper.dev/search", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "content-type": "application/json",
    },
    body: JSON.stringify({ q: query, gl: "us", hl: "en", num: 10 }),
  });

  if (!response.ok) {
    throw new Error(`Serper request failed: ${response.status}`);
  }

  const payload = (await response.json()) as {
    organic?: Array<{ title?: string; link?: string; snippet?: string }>;
  };

  return (payload.organic ?? [])
    .map((item) => {
      const url = item.link ?? "";
      return {
        title: item.title?.trim() ?? "",
        url,
        snippet: item.snippet?.trim() ?? "",
        domain: toDomain(url),
      } satisfies LiveSerpResult;
    })
    .filter((item) => item.title && item.url);
}

async function fetchBraveResults(
  query: string,
  fetchImpl: typeof fetch,
  apiKey: string
): Promise<LiveSerpResult[]> {
  const url = `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=10`;
  const response = await fetchImpl(url, {
    headers: {
      accept: "application/json",
      "x-subscription-token": apiKey,
    },
  });

  if (!response.ok) {
    throw new Error(`Brave request failed: ${response.status}`);
  }

  const payload = (await response.json()) as {
    web?: { results?: Array<{ title?: string; url?: string; description?: string }> };
  };

  return (payload.web?.results ?? [])
    .map((item) => {
      const url = item.url ?? "";
      return {
        title: item.title?.trim() ?? "",
        url,
        snippet: item.description?.trim() ?? "",
        domain: toDomain(url),
      } satisfies LiveSerpResult;
    })
    .filter((item) => item.title && item.url);
}

async function fetchProviderResults(
  provider: ResearchProviderId,
  query: string,
  fetchImpl: typeof fetch,
  env: NodeJS.ProcessEnv
): Promise<LiveSerpResult[]> {
  switch (provider) {
    case "duckduckgo-html":
      return fetchDuckDuckGoHtmlResults(query, fetchImpl);
    case "serper": {
      const apiKey = getSerperApiKey(env);
      if (!apiKey) throw new Error("Missing SERPER API key");
      return fetchSerperResults(query, fetchImpl, apiKey);
    }
    case "brave": {
      const apiKey = getBraveApiKey(env);
      if (!apiKey) throw new Error("Missing Brave Search API key");
      return fetchBraveResults(query, fetchImpl, apiKey);
    }
  }
}

function normalizeTemplateRecord(input: unknown): CompetitorGapResearchTemplate | null {
  if (!input || typeof input !== "object") return null;
  const record = input as Record<string, unknown>;
  const templateId = String(record.templateId ?? "").trim();
  if (!templateId) return null;

  const fallback = TEMPLATE_BY_ID[templateId];
  if (!fallback && !record.query) return null;

  const rawExchange = String(record.exchangeSlug ?? fallback?.exchangeSlug ?? "cross-exchange");
  const rawLocale = String(record.locale ?? fallback?.locale ?? "multi-locale");
  const rawCompetitorType = String(
    record.defaultCompetitorType ?? fallback?.defaultCompetitorType ?? "mixed"
  );
  const rawAction = String(record.suggestedAction ?? fallback?.suggestedAction ?? "defer");
  const rawConfidence = String(record.confidence ?? fallback?.confidence ?? "medium");

  return {
    templateId,
    query: String(record.query ?? fallback?.query ?? "").trim(),
    exchangeSlug:
      rawExchange === "cross-exchange"
        ? "cross-exchange"
        : (rawExchange as CompetitorGapFinding["exchangeSlug"]),
    locale: rawLocale === "multi-locale" ? "multi-locale" : rawLocale,
    topic: String(record.topic ?? fallback?.topic ?? templateId).trim(),
    suggestedAction: rawAction as CompetitorGapFinding["suggestedAction"],
    confidence: rawConfidence as CompetitorGapFinding["confidence"],
    defaultCompetitorType: rawCompetitorType as CompetitorGapFinding["competitorType"],
    ourGap: String(record.ourGap ?? fallback?.ourGap ?? "").trim(),
  };
}

export async function loadCompetitorGapResearchTemplates(configPath?: string) {
  const resolvedPath = configPath ?? DEFAULT_COMPETITOR_GAP_TEMPLATE_PATH;
  try {
    const raw = await fs.readFile(resolvedPath, "utf8");
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return DEFAULT_COMPETITOR_GAP_LIVE_TEMPLATES;
    }

    const templates = parsed
      .map(normalizeTemplateRecord)
      .filter((template): template is CompetitorGapResearchTemplate => Boolean(template && template.query));

    return templates.length > 0 ? templates : DEFAULT_COMPETITOR_GAP_LIVE_TEMPLATES;
  } catch {
    return DEFAULT_COMPETITOR_GAP_LIVE_TEMPLATES;
  }
}

function inferCompetitorType(
  template: CompetitorGapResearchTemplate,
  results: LiveSerpResult[]
): CompetitorGapFinding["competitorType"] {
  const haystack = results
    .slice(0, 3)
    .flatMap((result) => [result.domain, result.title, result.snippet, result.url])
    .join(" ")
    .toLowerCase();

  if (/support|help|faq|learn|academy/.test(haystack)) {
    return "help-center";
  }
  if (
    /binance\.com|okx\.com|bybit\.com|gate\.io|bitget\.com|kucoin\.com|htx\.com|mexc\.com/.test(
      haystack
    )
  ) {
    return "official";
  }
  if (/review|vs|compare/.test(haystack)) {
    return "review";
  }
  if (/referral|invite|bonus|code/.test(haystack)) {
    return "affiliate";
  }
  return template.defaultCompetitorType;
}

function buildCompetitorPattern(results: LiveSerpResult[]) {
  if (results.length === 0) {
    return "No reliable live SERP results were captured for this query.";
  }

  const winners = results.slice(0, 3).map((result) => {
    const snippet = result.snippet ? ` — ${result.snippet}` : "";
    return `${result.domain} (${result.title}${snippet})`;
  });

  return `Top live SERP winners: ${winners.join("; ")}.`;
}

export function buildCompetitorGapSummaryFromResearch(
  observations: CompetitorGapResearchObservation[]
): CompetitorGapSummary {
  const findings = observations
    .map((observation) => {
      const template = observation.template ?? TEMPLATE_BY_ID[observation.templateId];
      if (!template || observation.results.length === 0) return null;

      return {
        id: template.templateId,
        exchangeSlug: template.exchangeSlug,
        locale: template.locale,
        topic: template.topic,
        competitorType: inferCompetitorType(template, observation.results),
        competitorPattern: buildCompetitorPattern(observation.results),
        ourGap: template.ourGap,
        suggestedAction: template.suggestedAction,
        confidence: template.confidence,
      } satisfies CompetitorGapFinding;
    })
    .filter((finding): finding is CompetitorGapFinding => Boolean(finding));

  const domainCount = new Set(
    observations.flatMap((observation) => observation.results.map((result) => result.domain))
  ).size;

  return {
    status: findings.length > 0 ? "success" : "warning",
    generatedAt: new Date().toISOString(),
    summary:
      findings.length > 0
        ? "本次 live SERP 研究显示：高意图查询的头部结果仍以官方 help / referral 解释页和强信任型 affiliate 入口页为主，适合继续强化 official-site、referral-code、signup-kyc 与注册受阻排障内容。"
        : "本次 live SERP 研究未抓到足够稳定的可用结果，建议保留现有摘要并稍后重试。",
    serpWinnersLearnedFrom: domainCount,
    topicsReviewed: observations.length,
    publishCandidates: findings.filter((finding) => finding.suggestedAction === "publish").length,
    refreshCandidates: findings.filter((finding) => finding.suggestedAction === "refresh").length,
    internalLinkCandidates: findings.filter((finding) => finding.suggestedAction === "internal-link").length,
    distributionCandidates: findings.filter((finding) => finding.suggestedAction === "distribution").length,
    findings,
  } satisfies CompetitorGapSummary;
}

export function buildCompetitorGapSerpWinnersArtifact(input: {
  observations: CompetitorGapResearchObservation[];
  providersRequested: ResearchProviderId[];
}): CompetitorGapSerpWinnersArtifact {
  const records = input.observations.map((observation) => {
    const template =
      observation.template ?? TEMPLATE_BY_ID[observation.templateId] ?? DEFAULT_COMPETITOR_GAP_LIVE_TEMPLATES[0];
    const providerReports = observation.providerReports ?? [];
    const dominantDomains = [...new Set(observation.results.map((result) => result.domain))].slice(0, 8);
    const providersUsed = providerReports
      .filter((report) => report.status === "success" && report.resultCount > 0)
      .map((report) => report.provider);

    return {
      templateId: observation.templateId,
      query: observation.query,
      exchangeSlug: template.exchangeSlug,
      locale: template.locale,
      topic: template.topic,
      providersUsed,
      providerReports,
      dominantDomains,
      topResults: observation.results.slice(0, 8),
    } satisfies CompetitorGapSerpWinnerRecord;
  });

  return {
    status: records.length > 0 ? "success" : "warning",
    generatedAt: new Date().toISOString(),
    providersRequested: input.providersRequested,
    templateCount: input.observations.length,
    totalWinnerUrls: records.reduce((sum, record) => sum + record.topResults.length, 0),
    records,
  };
}

export function selectPersistedCompetitorGapSummary(
  liveSummary: CompetitorGapSummary,
  existingSummary: CompetitorGapSummary
) {
  const shouldReuseExisting =
    liveSummary.findings.length === 0 && existingSummary.findings.length > 0;
  return {
    summary: shouldReuseExisting ? existingSummary : liveSummary,
    usedFallbackSummary: shouldReuseExisting,
  };
}

export async function writeCompetitorGapSerpWinnersArtifact(
  artifact: CompetitorGapSerpWinnersArtifact
) {
  await fs.mkdir(path.dirname(COMPETITOR_GAP_SERP_WINNERS_PATH), { recursive: true });
  await fs.writeFile(
    COMPETITOR_GAP_SERP_WINNERS_PATH,
    `${JSON.stringify(artifact, null, 2)}\n`,
    "utf8"
  );
}

export function getDefaultCompetitorGapSerpWinnersArtifact(): CompetitorGapSerpWinnersArtifact {
  return {
    status: "never_run",
    generatedAt: "",
    providersRequested: [],
    templateCount: 0,
    totalWinnerUrls: 0,
    records: [],
  };
}

function normalizeSerpProviderReport(input: unknown): ProviderObservationReport | null {
  if (!input || typeof input !== "object") return null;
  const record = input as Record<string, unknown>;
  const provider = String(record.provider ?? "").trim() as ResearchProviderId;
  if (!PROVIDER_SET.has(provider)) return null;

  return {
    provider,
    status: (String(record.status ?? "skipped").trim() as ProviderObservationReport["status"]) ?? "skipped",
    resultCount: Number(record.resultCount ?? 0),
    error: record.error ? String(record.error) : undefined,
  };
}

function normalizeSerpResult(input: unknown): LiveSerpResult | null {
  if (!input || typeof input !== "object") return null;
  const record = input as Record<string, unknown>;
  const url = String(record.url ?? "").trim();
  const title = String(record.title ?? "").trim();
  if (!url || !title) return null;

  return {
    title,
    url,
    snippet: String(record.snippet ?? "").trim(),
    domain: String(record.domain ?? toDomain(url)).trim() || toDomain(url),
  };
}

export function normalizeCompetitorGapSerpWinnersArtifact(
  input: unknown
): CompetitorGapSerpWinnersArtifact {
  const fallback = getDefaultCompetitorGapSerpWinnersArtifact();
  if (!input || typeof input !== "object") return fallback;
  const record = input as Record<string, unknown>;

  return {
    status:
      (String(record.status ?? fallback.status).trim() as CompetitorGapSerpWinnersArtifact["status"]) ??
      fallback.status,
    generatedAt: String(record.generatedAt ?? fallback.generatedAt),
    providersRequested: Array.isArray(record.providersRequested)
      ? record.providersRequested
          .map((item) => String(item).trim())
          .filter((item): item is ResearchProviderId => PROVIDER_SET.has(item as ResearchProviderId))
      : fallback.providersRequested,
    templateCount: Number(record.templateCount ?? 0),
    totalWinnerUrls: Number(record.totalWinnerUrls ?? 0),
    records: Array.isArray(record.records)
      ? record.records
          .map((item) => {
            if (!item || typeof item !== "object") return null;
            const row = item as Record<string, unknown>;
            return {
              templateId: String(row.templateId ?? ""),
              query: String(row.query ?? ""),
              exchangeSlug:
                (String(row.exchangeSlug ?? "cross-exchange").trim() as CompetitorGapFinding["exchangeSlug"]) ??
                "cross-exchange",
              locale: (String(row.locale ?? "multi-locale").trim() as CompetitorGapFinding["locale"]) ?? "multi-locale",
              topic: String(row.topic ?? ""),
              providersUsed: Array.isArray(row.providersUsed)
                ? row.providersUsed
                    .map((provider) => String(provider).trim())
                    .filter((provider): provider is ResearchProviderId =>
                      PROVIDER_SET.has(provider as ResearchProviderId)
                    )
                : [],
              providerReports: Array.isArray(row.providerReports)
                ? row.providerReports
                    .map(normalizeSerpProviderReport)
                    .filter((provider): provider is ProviderObservationReport => Boolean(provider))
                : [],
              dominantDomains: Array.isArray(row.dominantDomains)
                ? row.dominantDomains.map((domain) => String(domain)).filter(Boolean)
                : [],
              topResults: Array.isArray(row.topResults)
                ? row.topResults
                    .map(normalizeSerpResult)
                    .filter((result): result is LiveSerpResult => Boolean(result))
                : [],
            } satisfies CompetitorGapSerpWinnerRecord;
          })
          .filter((item): item is CompetitorGapSerpWinnerRecord => Boolean(item))
      : fallback.records,
  };
}

export async function readCompetitorGapSerpWinnersArtifact() {
  try {
    const raw = await fs.readFile(COMPETITOR_GAP_SERP_WINNERS_PATH, "utf8");
    return normalizeCompetitorGapSerpWinnersArtifact(JSON.parse(raw));
  } catch {
    return getDefaultCompetitorGapSerpWinnersArtifact();
  }
}

export async function runLiveCompetitorGapResearch(options?: {
  fetchImpl?: typeof fetch;
  templates?: CompetitorGapResearchTemplate[];
  providers?: ResearchProviderId[];
  env?: NodeJS.ProcessEnv;
}) {
  const fetchImpl = options?.fetchImpl ?? fetch;
  const env = options?.env ?? process.env;
  const templates = options?.templates ?? DEFAULT_COMPETITOR_GAP_LIVE_TEMPLATES;
  const providers = options?.providers ?? normalizeResearchProviders(undefined, env);

  const observations: CompetitorGapResearchObservation[] = [];

  for (const template of templates) {
    const providerReports: ProviderObservationReport[] = [];
    const mergedResults: LiveSerpResult[] = [];

    for (const provider of providers) {
      try {
        const results = await fetchProviderResults(provider, template.query, fetchImpl, env);
        providerReports.push({ provider, status: "success", resultCount: results.length });
        mergedResults.push(...results);
      } catch (error) {
        providerReports.push({
          provider,
          status: "failed",
          resultCount: 0,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    observations.push({
      templateId: template.templateId,
      query: template.query,
      results: uniqueByUrl(mergedResults),
      providerReports,
      template,
    });
  }

  const summary = buildCompetitorGapSummaryFromResearch(observations);
  const existingSummary = await readCompetitorGapSummary();
  const { summary: persistedSummary, usedFallbackSummary } =
    selectPersistedCompetitorGapSummary(summary, existingSummary);
  const serpWinners = buildCompetitorGapSerpWinnersArtifact({
    observations,
    providersRequested: providers,
  });

  await writeCompetitorGapSummary(persistedSummary);
  await writeCompetitorGapSerpWinnersArtifact(serpWinners);

  return {
    summary: persistedSummary,
    researchSummary: summary,
    observations,
    serpWinners,
    providers,
    usedFallbackSummary,
  };
}

export async function ensureCompetitorGapSummary(options?: {
  live?: boolean;
  providers?: string[] | string;
  templatesPath?: string;
  fetchImpl?: typeof fetch;
  env?: NodeJS.ProcessEnv;
}) {
  if (!options?.live) {
    return {
      summary: await readCompetitorGapSummary(),
      researchSummary: null,
      observations: [] as CompetitorGapResearchObservation[],
      serpWinners: null,
      providers: [] as ResearchProviderId[],
      usedFallbackSummary: false,
      live: false,
    };
  }

  const env = options.env ?? process.env;
  const templates = await loadCompetitorGapResearchTemplates(options.templatesPath);
  const providers = normalizeResearchProviders(options.providers, env);
  const { summary, researchSummary, observations, serpWinners, usedFallbackSummary } =
    await runLiveCompetitorGapResearch({
    fetchImpl: options.fetchImpl,
    templates,
    providers,
    env,
  });

  return {
    summary,
    researchSummary,
    observations,
    serpWinners,
    providers,
    usedFallbackSummary,
    live: true,
  };
}
