#!/usr/bin/env tsx

import {
  enqueueGscFocusPageRowDailySummaryFromDb,
  enqueueDistributionJobsFromDb,
  insertSyncRun,
  publishQueuedDistributionJobsFromDb,
  recordGscFocusPageRowFirstSeenEventsFromDb,
} from "../src/lib/automation/db-store";
import { regenerateAutomationState } from "../src/lib/automation/persistence";
import { runExternalSync } from "../src/lib/automation/external-sync";

function parseMode() {
  const modeIndex = process.argv.findIndex((arg) => arg === "--mode");
  if (modeIndex >= 0 && process.argv[modeIndex + 1]) {
    return process.argv[modeIndex + 1];
  }

  const inline = process.argv.find((arg) => arg.startsWith("--mode="));
  return inline?.split("=")[1] ?? "generate";
}

function createRun(
  job: Parameters<typeof insertSyncRun>[0]["job"],
  status: Parameters<typeof insertSyncRun>[0]["status"],
  summary: string,
  startedAt: string,
  meta: Record<string, unknown> = {}
) {
  const completedAt = new Date().toISOString();
  return {
    run: {
      id: `${job}-${completedAt}-${Math.random().toString(36).slice(2, 8)}`,
      job,
      status,
      summary,
      startedAt,
      completedAt,
    },
    meta,
  };
}

async function main() {
  const mode = parseMode();
  const startedAt = new Date().toISOString();
  const syncMode =
    mode === "daily"
      ? "daily"
      : mode === "earnings"
        ? "partners"
        : mode === "gsc"
      ? "gsc"
      : null;

  try {
    const syncResult = syncMode ? await runExternalSync(syncMode) : null;
    const state = syncResult?.state ?? (await regenerateAutomationState());

    if (syncResult?.externalState?.gsc) {
      const gscRun = createRun(
        "daily_gsc_ingest",
        syncResult.externalState.gsc.status === "success"
          ? "success"
          : syncResult.externalState.gsc.status === "failed"
            ? "failed"
            : "warning",
        `GSC sync ${syncResult.externalState.gsc.status} · rows ${syncResult.externalState.gsc.rowsFetched} / signals ${syncResult.externalState.gsc.signalsWritten}`,
        startedAt,
        syncResult.externalState.gsc
      );
      await insertSyncRun(gscRun.run, gscRun.meta);

      if (syncResult.gscFocusPageRowFirstSeen?.length) {
        const firstSeenEntries = syncResult.gscFocusPageRowFirstSeen;
        const reminderResult =
          await recordGscFocusPageRowFirstSeenEventsFromDb(firstSeenEntries);
        const reminderRun = createRun(
          "daily_alert_eval",
          "success",
          `GSC focus page-row first-seen entries=${firstSeenEntries.length} telegram_jobs=${reminderResult?.jobs ?? 0}`,
          startedAt,
          {
            entries: firstSeenEntries,
            reminderResult,
          }
        );
        await insertSyncRun(reminderRun.run, reminderRun.meta);
      }

      if (mode === "daily" || mode === "all") {
        const dailySummaryResult =
          await enqueueGscFocusPageRowDailySummaryFromDb(
            syncResult.externalState.gsc.focusPageRows ?? [],
            startedAt.slice(0, 10)
          );
        if (dailySummaryResult?.enqueued) {
          const summaryRun = createRun(
            "daily_alert_eval",
            "success",
            `GSC focus monitor daily summary enqueued=${dailySummaryResult.enqueued}`,
            startedAt,
            {
              tracked:
                syncResult.externalState.gsc.focusPageRows?.length ?? 0,
              seen:
                syncResult.externalState.gsc.focusPageRows?.filter(
                  (entry) => entry.seenInPageRows
                ).length ?? 0,
            }
          );
          await insertSyncRun(summaryRun.run, summaryRun.meta);
        }
      }
    }

    if (syncResult?.externalState?.partners?.length) {
      const failedCount = syncResult.externalState.partners.filter(
        (item) => item.status === "failed"
      ).length;
      const successCount = syncResult.externalState.partners.filter(
        (item) => item.status === "success"
      ).length;
      const partnerRun = createRun(
        "daily_revenue_sync",
        failedCount > 0 ? "failed" : successCount > 0 ? "success" : "warning",
        `Partner sync success=${successCount} failed=${failedCount}`,
        startedAt,
        { partners: syncResult.externalState.partners }
      );
      await insertSyncRun(partnerRun.run, partnerRun.meta);
    }

    const internalLinkGroups = state.internalLinks.exchangeGroups.length;
    const surfacedGuides = state.internalLinks.exchangeGroups.reduce(
      (sum, group) => sum + group.guides.length,
      0
    );
    const internalLinkRun = createRun(
      "daily_internal_link_refresh",
      internalLinkGroups > 0 ? "success" : "warning",
      `Refreshed ${internalLinkGroups} exchange-link groups / ${surfacedGuides} surfaced guides`,
      startedAt,
      {
        refreshedAt: state.internalLinks.refreshedAt,
        exchangeGroups: internalLinkGroups,
        surfacedGuides,
      }
    );
    await insertSyncRun(internalLinkRun.run, internalLinkRun.meta);

    const distributionJobsEnqueued =
      mode === "daily" || mode === "publish" || mode === "distribute"
        ? await enqueueDistributionJobsFromDb(state)
        : null;
    if (distributionJobsEnqueued) {
      const enqueueRun = createRun(
        "daily_distribution_enqueue",
        "success",
        `Enqueued/refreshed ${distributionJobsEnqueued.length} distribution jobs`,
        startedAt,
        { count: distributionJobsEnqueued.length }
      );
      await insertSyncRun(enqueueRun.run, enqueueRun.meta);
    }

    const distributionJobsPublished =
      mode === "daily" || mode === "publish" || mode === "distribute"
        ? await publishQueuedDistributionJobsFromDb(12)
        : null;
    if (distributionJobsPublished) {
      const publishedCount = distributionJobsPublished.filter(
        (item) => item.status === "published"
      ).length;
      const failedCount = distributionJobsPublished.filter(
        (item) => item.status === "failed"
      ).length;
      const publishRun = createRun(
        "daily_distribution_publish",
        failedCount > 0 ? "warning" : "success",
        `Distribution publish published=${publishedCount} failed=${failedCount}`,
        startedAt,
        { jobs: distributionJobsPublished }
      );
      await insertSyncRun(publishRun.run, publishRun.meta);
    }

    const alertEvalRun = createRun(
      "daily_alert_eval",
      "success",
      `Alert evaluation complete · alerts=${state.alerts.length}`,
      startedAt,
      { alerts: state.alerts.length }
    );
    await insertSyncRun(alertEvalRun.run, alertEvalRun.meta);

    const payload = {
      mode,
      generatedAt: state.generatedAt,
      signals: state.metrics.totalSignals,
      opportunities: state.metrics.totalOpportunities,
      publishedPages: state.metrics.publishedPages,
      projectedRevenue: state.metrics.monthlyProjectedRevenueUsd,
      alerts: state.alerts.length,
      externalSources: state.externalSources,
      distributionJobsEnqueued: distributionJobsEnqueued?.length ?? 0,
      distributionJobsPublished:
        distributionJobsPublished?.filter((item) => item.status === "published")
          .length ?? 0,
    };

    console.info(JSON.stringify(payload, null, 2));
  } catch (error) {
    const failedRun = createRun(
      "daily_alert_eval",
      "failed",
      error instanceof Error ? error.message : "Automation loop failed",
      startedAt,
      {
        mode,
        stack: error instanceof Error ? error.stack : undefined,
      }
    );
    await insertSyncRun(failedRun.run, failedRun.meta);
    throw error;
  }
}

main().catch((error) => {
  console.error("[automation-pipeline]", error);
  process.exit(1);
});
