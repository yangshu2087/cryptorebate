#!/usr/bin/env tsx

import { regenerateAutomationState } from "../src/lib/automation/persistence";

function parseMode() {
  const modeIndex = process.argv.findIndex((arg) => arg === "--mode");
  if (modeIndex >= 0 && process.argv[modeIndex + 1]) {
    return process.argv[modeIndex + 1];
  }

  const inline = process.argv.find((arg) => arg.startsWith("--mode="));
  return inline?.split("=")[1] ?? "generate";
}

async function main() {
  const mode = parseMode();
  const state = await regenerateAutomationState();

  const payload = {
    mode,
    generatedAt: state.generatedAt,
    signals: state.metrics.totalSignals,
    opportunities: state.metrics.totalOpportunities,
    publishedPages: state.metrics.publishedPages,
    projectedRevenue: state.metrics.monthlyProjectedRevenueUsd,
    alerts: state.alerts.length,
  };

  console.info(JSON.stringify(payload, null, 2));
}

main().catch((error) => {
  console.error("[automation-pipeline]", error);
  process.exit(1);
});
