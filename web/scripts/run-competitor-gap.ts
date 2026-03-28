#!/usr/bin/env tsx

import { materializeCompetitorGapActionPlan } from "@/lib/automation/competitor-gap-actions";
import {
  COMPETITOR_GAP_SERP_WINNERS_PATH,
  DEFAULT_COMPETITOR_GAP_TEMPLATE_PATH,
  ensureCompetitorGapSummary,
} from "@/lib/automation/competitor-gap-research";
import { COMPETITOR_GAP_SUMMARY_PATH } from "@/lib/automation/competitor-gap";
import { insertSyncRun } from "@/lib/automation/db-store";

function parseArgs(argv: string[]) {
  let providers: string | undefined;
  let templatesPath: string | undefined;

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--providers") {
      providers = argv[index + 1];
      index += 1;
    } else if (arg === "--templates") {
      templatesPath = argv[index + 1];
      index += 1;
    }
  }

  return {
    live: argv.includes("--live"),
    providers,
    templatesPath,
  };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const startedAt = new Date().toISOString();
  const { summary, researchSummary, observations, serpWinners, providers, usedFallbackSummary, live } =
    await ensureCompetitorGapSummary({
      live: args.live,
      providers: args.providers,
      templatesPath: args.templatesPath,
    });
  const plan = await materializeCompetitorGapActionPlan();

  const status =
    summary.status === "failed" || plan.status === "failed"
      ? "failed"
      : plan.totalActions > 0
        ? "success"
        : "warning";

  await insertSyncRun(
    {
      id: `weekly_competitor_gap_scan-${Date.now()}`,
      job: "weekly_competitor_gap_scan",
      status,
      startedAt,
      completedAt: new Date().toISOString(),
      summary: `Competitor gap ${live ? "live" : "summary"} actions=${plan.totalActions} publish=${plan.publishActions} refresh=${plan.refreshActions} internal-link=${plan.internalLinkActions}`,
    },
    {
      liveResearch: live,
      providers,
      templatesPath: args.templatesPath ?? DEFAULT_COMPETITOR_GAP_TEMPLATE_PATH,
      observationsReviewed: observations.length,
      liveSummaryStatus: researchSummary?.status ?? summary.status,
      usedFallbackSummary: usedFallbackSummary ?? false,
      competitorGapSummaryStatus: summary.status,
      summaryGeneratedAt: summary.generatedAt,
      serpWinnerUrls: serpWinners?.totalWinnerUrls ?? 0,
      planGeneratedAt: plan.generatedAt,
      totalActions: plan.totalActions,
      publishActions: plan.publishActions,
      refreshActions: plan.refreshActions,
      internalLinkActions: plan.internalLinkActions,
      distributionActions: plan.distributionActions,
      topActions: plan.actions.slice(0, 8),
    }
  );

  console.log(
    JSON.stringify(
      {
        ok: status !== "failed",
        liveResearch: {
          enabled: live,
          providers,
          observations: observations.length,
          summaryStatus: researchSummary?.status ?? summary.status,
          usedFallbackSummary: usedFallbackSummary ?? false,
        },
        artifacts: {
          serpWinners: live ? COMPETITOR_GAP_SERP_WINNERS_PATH : null,
          missingGaps: COMPETITOR_GAP_SUMMARY_PATH,
          pageActions: "src/data/generated/competitor-gap-actions.json",
        },
        summaryStatus: summary.status,
        summaryGeneratedAt: summary.generatedAt,
        serpWinnerUrls: serpWinners?.totalWinnerUrls ?? 0,
        plan,
      },
      null,
      2
    )
  );

  if (status === "failed") {
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
