#!/usr/bin/env tsx

import { materializeCoverageRepairArtifact } from "../src/lib/automation/coverage-audit";

async function main() {
  const summary = await materializeCoverageRepairArtifact();
  console.info(
    JSON.stringify(
      {
        checkedAt: summary.checkedAt,
        status: summary.status,
        label: summary.label,
        redirectIssueCount: summary.redirectIssueCount,
        notFoundIssueCount: summary.notFoundIssueCount,
        discoveryIssueCount: summary.discoveryIssueCount,
        issueCount: summary.issueCount,
      },
      null,
      2
    )
  );
}

main().catch((error) => {
  console.error("[coverage-audit]", error);
  process.exit(1);
});
