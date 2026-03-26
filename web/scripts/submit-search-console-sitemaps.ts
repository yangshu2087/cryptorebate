#!/usr/bin/env tsx

import { getSearchConsoleConfig } from "@/lib/automation/external-config";
import { getDiscoveryAssetUrls } from "@/lib/automation/discovery";
import { submitSearchConsoleSitemaps } from "@/lib/automation/external-search-console";

async function main() {
  const config = getSearchConsoleConfig();
  const urls = getDiscoveryAssetUrls();
  const report = await submitSearchConsoleSitemaps(config, urls);

  console.log(
    JSON.stringify(
      {
        ok: report.status === "success" || report.status === "skipped" || report.status === "disabled",
        report,
      },
      null,
      2
    )
  );

  if (report.status === "failed") {
    process.exit(1);
  }
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
