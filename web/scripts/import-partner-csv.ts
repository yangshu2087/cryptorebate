import fs from "node:fs/promises";
import path from "node:path";
import { normalisePartnerPayload } from "@/lib/automation/external-partner-sync";
import { importPartnerEventsToDb } from "@/lib/automation/db-store";
import {
  AUTOMATION_PATHS,
  appendCommissionsToDisk,
  appendConversionsToDisk,
  regenerateAutomationState,
} from "@/lib/automation/persistence";
import { exchanges } from "@/data/exchanges";
import type { CommissionEvent, ConversionEvent } from "@/lib/automation/types";

const EXCHANGE_SLUGS = exchanges.map((exchange) => exchange.slug);

function printHelp() {
  console.log(`\nMonthly affiliate CSV import\n\nUsage:\n  npm run partner:import:csv -- --exchange okx --file /absolute/path/to/okx.csv\n\nOptions:\n  --exchange <slug>          One of: ${EXCHANGE_SLUGS.join(", ")}\n  --file <path>              Absolute or repo-relative CSV file path\n  --mode <mode>              combined | conversions | commissions (default: combined)\n  --locale <locale>          Fallback locale when CSV does not include locale (default: en)\n  --pageType <pageType>      Fallback page type when CSV does not include pageType (default: official-site)\n  --dry-run                  Parse and preview without writing imports\n  --allow-duplicates         Append all parsed rows without duplicate filtering\n  --help                     Show this message\n\nCSV expectations:\n  The importer reads header-based CSV rows and tries to map common fields such as:\n  - locale / lang\n  - pageType / page_type\n  - queryClusterId / query_cluster_id\n  - registeredAt / registered_at / date / timestamp\n  - tradedAt / traded_at\n  - status\n  - firstDepositUsd / first_deposit_usd\n  - commissionUsd / commission_usd / amount / commission / rebate\n  - recordedAt / recorded_at / date / timestamp / ts\n\nIf locale/pageType/queryClusterId are missing, the fallback locale + pageType will be used to derive a cluster id.\n`);
}

type CliOptions = {
  exchangeSlug: string;
  filePath: string;
  mode: "combined" | "conversions" | "commissions";
  fallbackLocale: string;
  fallbackPageType: string;
  dryRun: boolean;
  allowDuplicates: boolean;
};

function parseArgs(argv: string[]): CliOptions {
  const values = new Map<string, string>();
  const flags = new Set<string>();

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token?.startsWith("--")) continue;
    const key = token.slice(2);
    const next = argv[index + 1];
    if (next && !next.startsWith("--")) {
      values.set(key, next);
      index += 1;
    } else {
      flags.add(key);
    }
  }

  if (flags.has("help")) {
    printHelp();
    process.exit(0);
  }

  const exchangeSlug = values.get("exchange")?.trim() ?? "";
  const filePath = values.get("file")?.trim() ?? "";
  const mode = (values.get("mode")?.trim() as CliOptions["mode"] | undefined) ?? "combined";
  const fallbackLocale = values.get("locale")?.trim() ?? "en";
  const fallbackPageType = values.get("pageType")?.trim() ?? "official-site";
  const dryRun = flags.has("dry-run");
  const allowDuplicates = flags.has("allow-duplicates");

  if (!exchangeSlug || !EXCHANGE_SLUGS.includes(exchangeSlug as (typeof EXCHANGE_SLUGS)[number])) {
    throw new Error(`--exchange is required and must be one of: ${EXCHANGE_SLUGS.join(", ")}`);
  }

  if (!filePath) {
    throw new Error("--file is required");
  }

  if (!["combined", "conversions", "commissions"].includes(mode)) {
    throw new Error("--mode must be one of: combined, conversions, commissions");
  }

  return {
    exchangeSlug,
    filePath,
    mode,
    fallbackLocale,
    fallbackPageType,
    dryRun,
    allowDuplicates,
  };
}

function resolveInputPath(rawPath: string) {
  if (path.isAbsolute(rawPath)) return rawPath;
  return path.resolve(process.cwd(), rawPath);
}

async function readJsonFile<T>(filePath: string, fallback: T): Promise<T> {
  try {
    const content = await fs.readFile(filePath, "utf8");
    return JSON.parse(content) as T;
  } catch {
    return fallback;
  }
}

function conversionKey(item: Omit<ConversionEvent, "id"> | ConversionEvent) {
  return [
    item.exchangeSlug,
    item.queryClusterId,
    item.registeredAt,
    item.tradedAt ?? "",
    item.firstDepositUsd ?? "",
    item.status,
    item.source ?? "",
    item.dataSource ?? "",
  ].join("::");
}

function commissionKey(item: Omit<CommissionEvent, "id"> | CommissionEvent) {
  return [
    item.exchangeSlug,
    item.queryClusterId,
    item.recordedAt,
    item.commissionUsd,
    item.source,
    item.dataSource ?? "",
  ].join("::");
}

function stripConversionIds(items: ConversionEvent[]): Array<Omit<ConversionEvent, "id">> {
  return items.map((item) => {
    const { id, ...rest } = item;
    void id;
    return {
      ...rest,
      source: rest.source ?? "csv",
      dataSource: rest.dataSource ?? "real",
    };
  });
}

function stripCommissionIds(items: CommissionEvent[]): Array<Omit<CommissionEvent, "id">> {
  return items.map((item) => {
    const { id, ...rest } = item;
    void id;
    return {
      ...rest,
      source: rest.source ?? "csv",
      dataSource: rest.dataSource ?? "real",
    };
  });
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const inputPath = resolveInputPath(options.filePath);
  const csv = await fs.readFile(inputPath, "utf8");

  const parsed = normalisePartnerPayload(options.exchangeSlug, csv, "csv", {
    fallbackAttribution: {
      locale: options.fallbackLocale,
      pageType: options.fallbackPageType,
    },
    source: "csv",
  });

  const parsedConversions = stripConversionIds(parsed.conversions).map((item) => ({
    ...item,
    source: item.source ?? "csv",
    dataSource: "real" as const,
  }));
  const parsedCommissions = stripCommissionIds(parsed.commissions).map((item) => ({
    ...item,
    source: item.source ?? "csv",
    dataSource: "real" as const,
  }));

  const filteredConversions =
    options.mode === "commissions" ? [] : parsedConversions;
  const filteredCommissions =
    options.mode === "conversions" ? [] : parsedCommissions;

  const existingConversions = await readJsonFile<ConversionEvent[]>(
    AUTOMATION_PATHS.conversionImports,
    []
  );
  const existingCommissions = await readJsonFile<CommissionEvent[]>(
    AUTOMATION_PATHS.commissionImports,
    []
  );

  const existingConversionKeys = new Set(existingConversions.map(conversionKey));
  const existingCommissionKeys = new Set(existingCommissions.map(commissionKey));

  const dedupedConversions = options.allowDuplicates
    ? filteredConversions
    : filteredConversions.filter((item) => !existingConversionKeys.has(conversionKey(item)));
  const dedupedCommissions = options.allowDuplicates
    ? filteredCommissions
    : filteredCommissions.filter((item) => !existingCommissionKeys.has(commissionKey(item)));

  const summary = {
    ok: true,
    exchangeSlug: options.exchangeSlug,
    inputPath,
    mode: options.mode,
    fallbackLocale: options.fallbackLocale,
    fallbackPageType: options.fallbackPageType,
    dryRun: options.dryRun,
    allowDuplicates: options.allowDuplicates,
    parsed: {
      conversions: filteredConversions.length,
      commissions: filteredCommissions.length,
    },
    duplicatesSkipped: {
      conversions: filteredConversions.length - dedupedConversions.length,
      commissions: filteredCommissions.length - dedupedCommissions.length,
    },
    toImport: {
      conversions: dedupedConversions.length,
      commissions: dedupedCommissions.length,
    },
  };

  if (options.dryRun) {
    console.log(JSON.stringify(summary, null, 2));
    return;
  }

  if (!dedupedConversions.length && !dedupedCommissions.length) {
    console.log(
      JSON.stringify(
        {
          ...summary,
          generatedAt: null,
          message: "No new rows to import after duplicate filtering.",
        },
        null,
        2
      )
    );
    return;
  }

  if (dedupedConversions.length) {
    await appendConversionsToDisk(dedupedConversions);
  }
  if (dedupedCommissions.length) {
    await appendCommissionsToDisk(dedupedCommissions);
  }

  await importPartnerEventsToDb({
    conversions: dedupedConversions,
    commissions: dedupedCommissions,
  });

  const state = await regenerateAutomationState();

  console.log(
    JSON.stringify(
      {
        ...summary,
        generatedAt: state.generatedAt,
        attribution: {
          realCoverageRate: state.attribution.realCoverageRate,
          realClicks: state.attribution.realClicks,
          realConversions: state.attribution.realConversions,
          realCommissions: state.attribution.realCommissions,
        },
      },
      null,
      2
    )
  );
}

main().catch((error) => {
  console.error(
    JSON.stringify(
      {
        ok: false,
        error: error instanceof Error ? error.message : String(error),
      },
      null,
      2
    )
  );
  process.exit(1);
});
