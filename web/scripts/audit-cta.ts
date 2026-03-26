import fs from "node:fs";
import path from "node:path";
import { exchanges, getExchangeBySlug } from "@/data/exchanges";
import {
  SEO_CONTENT_LOCALES,
  SEO_PAGE_TYPES,
  getExchangeSeoEntry,
  isExchangeSeoPageType,
} from "@/data/exchange-seo";
import {
  getAutomationState,
  getUnifiedSeoPageHref,
} from "@/lib/automation/catalog";

const SITE = "https://cryptorebate.app";
const ROOT_DIR = path.resolve(process.cwd(), "..");
const OUTPUT_DIR = path.join(ROOT_DIR, "output");

type AuditMode = "base" | "dynamic" | "all";

type CodeMismatch = {
  scope: "base" | "dynamic";
  locale: string;
  slug: string;
  pageType: string;
  expected: string;
  actual: string;
};

type OnlineResult = {
  scope: "base" | "dynamic";
  locale: string;
  slug: string;
  pageType: string;
  url: string;
  expected: string;
  status: number;
  hasExpectedHref: boolean;
  ok: boolean;
  error?: string;
};

type AuditPage = {
  scope: "base" | "dynamic";
  locale: string;
  slug: string;
  pageType: string;
  url: string;
  expected: string;
};

function parseMode(argv: string[]): AuditMode {
  const index = argv.findIndex((arg) => arg === "--mode");
  const value = index >= 0 ? argv[index + 1] : undefined;

  if (!value) {
    return "all";
  }

  if (value === "base" || value === "dynamic" || value === "all") {
    return value;
  }

  throw new Error(`Unsupported mode: ${value}`);
}

function getTimestamp() {
  return new Date().toISOString().slice(0, 10);
}

function buildBasePages() {
  return SEO_CONTENT_LOCALES.flatMap((locale) =>
    exchanges.flatMap((exchange) =>
      SEO_PAGE_TYPES.map((pageType) => ({
        scope: "base" as const,
        locale,
        slug: exchange.slug,
        pageType,
        url: `${SITE}/${locale}/exchanges/${exchange.slug}/${pageType}`,
        expected: exchange.referralLink,
      }))
    )
  );
}

function buildDynamicPages() {
  const state = getAutomationState();

  return state.pages
    .filter(
      (page) =>
        !isExchangeSeoPageType(page.pageType) &&
        page.stage !== "deprecated" &&
        page.stage !== "quarantined"
    )
    .map((page) => {
      const exchange = getExchangeBySlug(page.exchangeSlug);
      if (!exchange) {
        throw new Error(`Missing exchange for dynamic page ${page.id}`);
      }

      return {
        scope: "dynamic" as const,
        locale: page.locale,
        slug: page.exchangeSlug,
        pageType: page.pageType,
        url: `${SITE}/${page.locale}${getUnifiedSeoPageHref(
          page.exchangeSlug,
          page.pageType
        )}`,
        expected: exchange.referralLink,
      };
    });
}

function collectBaseCodeMismatches(): CodeMismatch[] {
  const mismatches: CodeMismatch[] = [];

  for (const locale of SEO_CONTENT_LOCALES) {
    for (const exchange of exchanges) {
      for (const pageType of SEO_PAGE_TYPES) {
        const entry = getExchangeSeoEntry(locale, exchange.slug, pageType);
        if (!entry) {
          throw new Error(`Missing base entry for ${locale}/${exchange.slug}/${pageType}`);
        }

        const expected = exchange.referralLink;
        const actual = entry.cta.href ?? entry.exchange.referralLink;

        if (actual !== expected) {
          mismatches.push({
            scope: "base",
            locale,
            slug: exchange.slug,
            pageType,
            expected,
            actual,
          });
        }
      }
    }
  }

  return mismatches;
}

function collectDynamicCodeMismatches(): CodeMismatch[] {
  const state = getAutomationState();
  const mismatches: CodeMismatch[] = [];

  for (const page of state.pages) {
    if (
      isExchangeSeoPageType(page.pageType) ||
      page.stage === "deprecated" ||
      page.stage === "quarantined"
    ) {
      continue;
    }

    const exchange = getExchangeBySlug(page.exchangeSlug);
    if (!exchange) {
      throw new Error(`Missing exchange for dynamic page ${page.id}`);
    }

    const expected = exchange.referralLink;
    const actual = page.cta.href ?? exchange.referralLink;

    if (actual !== expected) {
      mismatches.push({
        scope: "dynamic",
        locale: page.locale,
        slug: page.exchangeSlug,
        pageType: page.pageType,
        expected,
        actual,
      });
    }
  }

  return mismatches;
}

async function auditOnlinePage(page: AuditPage): Promise<OnlineResult> {
  try {
    const response = await fetch(page.url, {
      signal: AbortSignal.timeout(30_000),
    });
    const html = await response.text();
    const hasExpectedHref = html.includes(page.expected);

    return {
      ...page,
      status: response.status,
      hasExpectedHref,
      ok: response.status === 200 && hasExpectedHref,
    };
  } catch (error) {
    return {
      ...page,
      status: 0,
      hasExpectedHref: false,
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

async function auditOnline(pages: AuditPage[]) {
  const concurrency = 12;
  const results: OnlineResult[] = [];

  for (let i = 0; i < pages.length; i += concurrency) {
    const batch = pages.slice(i, i + concurrency);
    results.push(...(await Promise.all(batch.map(auditOnlinePage))));
  }

  return results;
}

function summarizeByKey(
  results: OnlineResult[],
  keys: string[]
): Record<string, { checked: number; failures: number }> {
  return Object.fromEntries(
    keys.map((key) => {
      const subset = results.filter((result) => {
        if (exchanges.some((exchange) => exchange.slug === key)) {
          return result.slug === key;
        }
        if (SEO_CONTENT_LOCALES.includes(key as (typeof SEO_CONTENT_LOCALES)[number])) {
          return result.locale === key;
        }
        return result.pageType === key;
      });

      return [
        key,
        {
          checked: subset.length,
          failures: subset.filter((result) => !result.ok).length,
        },
      ];
    })
  );
}

async function main() {
  const mode = parseMode(process.argv.slice(2));
  const basePages = mode === "dynamic" ? [] : buildBasePages();
  const dynamicPages = mode === "base" ? [] : buildDynamicPages();
  const pages = [...basePages, ...dynamicPages];
  const codeMismatches = [
    ...(mode === "dynamic" ? [] : collectBaseCodeMismatches()),
    ...(mode === "base" ? [] : collectDynamicCodeMismatches()),
  ];
  const onlineResults = await auditOnline(pages);
  const onlineFailures = onlineResults.filter((result) => !result.ok);
  const exchangeKeys = exchanges.map((exchange) => exchange.slug);
  const localeKeys = [...new Set(pages.map((page) => page.locale))].sort();
  const pageTypeKeys = [...new Set(pages.map((page) => page.pageType))].sort();
  const outputFile = path.join(
    OUTPUT_DIR,
    mode === "all"
      ? `cta-audit-${getTimestamp()}.json`
      : `${mode}-cta-audit-${getTimestamp()}.json`
  );

  const summary = {
    site: SITE,
    mode,
    checkedAt: new Date().toISOString(),
    totalChecked: pages.length,
    codeMismatches: codeMismatches.length,
    onlineFailures: onlineFailures.length,
    byExchange: summarizeByKey(onlineResults, exchangeKeys),
    byLocale: summarizeByKey(onlineResults, localeKeys),
    byPageType: summarizeByKey(onlineResults, pageTypeKeys),
    codeMismatchesPreview: codeMismatches.slice(0, 20),
    onlineFailuresPreview: onlineFailures.slice(0, 20),
  };

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  fs.writeFileSync(
    outputFile,
    `${JSON.stringify({ summary, codeMismatches, onlineResults }, null, 2)}\n`,
    "utf8"
  );

  console.log(
    JSON.stringify(
      {
        ...summary,
        reportFile: outputFile,
      },
      null,
      2
    )
  );

  if (codeMismatches.length > 0 || onlineFailures.length > 0) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
