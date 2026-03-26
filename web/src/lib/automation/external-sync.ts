import { getPartnerSyncConfigs, getSearchConsoleConfig } from "./external-config";
import { syncPartnerSource } from "./external-partner-sync";
import { fetchSearchConsoleSignals } from "./external-search-console";
import {
  regenerateAutomationState,
  readExternalSyncStateFromDisk,
  writeExternalSyncStateToDisk,
  writeGeneratedGscSignalsToDisk,
  writeGeneratedPartnerCommissionsToDisk,
  writeGeneratedPartnerConversionsToDisk,
} from "./persistence";
import type { ExternalSourcesState } from "./types";

const emptyExternalState: ExternalSourcesState = {
  gsc: {
    enabled: false,
    configured: false,
    status: "unknown",
    rowsFetched: 0,
    signalsWritten: 0,
  },
  partners: [],
};

export async function syncSearchConsoleToDisk() {
  const config = getSearchConsoleConfig();
  const { signals, report } = await fetchSearchConsoleSignals(config);
  await writeGeneratedGscSignalsToDisk(signals);
  return { signals, report };
}

export async function syncPartnerSourcesToDisk() {
  const configs = getPartnerSyncConfigs();
  const reports = await Promise.all(configs.map((config) => syncPartnerSource(config)));
  const conversions = reports.flatMap((item) => item.conversions);
  const commissions = reports.flatMap((item) => item.commissions);
  await writeGeneratedPartnerConversionsToDisk(conversions);
  await writeGeneratedPartnerCommissionsToDisk(commissions);
  return { conversions, commissions, reports: reports.map((item) => item.report) };
}

export async function runExternalSync(
  mode: "gsc" | "partners" | "daily" | "all" = "all"
) {
  const previous = (await readExternalSyncStateFromDisk()) ?? emptyExternalState;
  const gsc =
    mode === "gsc" || mode === "daily" || mode === "all"
      ? await syncSearchConsoleToDisk()
      : null;
  const partners =
    mode === "partners" || mode === "daily" || mode === "all"
      ? await syncPartnerSourcesToDisk()
      : null;

  const externalState: ExternalSourcesState = {
    generatedAt: new Date().toISOString(),
    gsc: gsc?.report ?? previous.gsc ?? emptyExternalState.gsc,
    partners: partners?.reports ?? previous.partners ?? emptyExternalState.partners,
  };

  await writeExternalSyncStateToDisk(externalState);
  const state = await regenerateAutomationState();

  return {
    state,
    externalState,
    gsc,
    partners,
  };
}
