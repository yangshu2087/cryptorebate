import fs from "node:fs/promises";
import path from "node:path";
import type {
  AutomationControlPlane,
  AutomationState,
  CommissionEvent,
  ConversionEvent,
  ExternalSourcesState,
  QuerySignal,
} from "./types";
import { buildAutomationState } from "./engine";
import { resetAutomationStateCache } from "./catalog";

function resolvePath(...parts: string[]) {
  return path.join(process.cwd(), ...parts);
}

export const AUTOMATION_PATHS = {
  controlPlane: resolvePath("src", "data", "automation", "control-plane.json"),
  conversionImports: resolvePath(
    "src",
    "data",
    "automation",
    "conversion-imports.json"
  ),
  commissionImports: resolvePath(
    "src",
    "data",
    "automation",
    "commission-imports.json"
  ),
  generatedGscSignals: resolvePath(
    "src",
    "data",
    "generated",
    "gsc-query-signals.json"
  ),
  generatedPartnerConversions: resolvePath(
    "src",
    "data",
    "generated",
    "partner-conversions.json"
  ),
  generatedPartnerCommissions: resolvePath(
    "src",
    "data",
    "generated",
    "partner-commissions.json"
  ),
  externalSyncState: resolvePath(
    "src",
    "data",
    "generated",
    "external-sync-state.json"
  ),
  snapshotDir: resolvePath("src", "data", "generated"),
  snapshot: resolvePath("src", "data", "generated", "automation-state.json"),
};

async function readJsonFile<T>(filePath: string): Promise<T> {
  const content = await fs.readFile(filePath, "utf8");
  return JSON.parse(content) as T;
}

async function writeJsonFile(filePath: string, value: unknown) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

export async function readControlPlaneFromDisk() {
  return readJsonFile<AutomationControlPlane>(AUTOMATION_PATHS.controlPlane);
}

export async function readExternalSyncStateFromDisk() {
  try {
    return await readJsonFile<ExternalSourcesState>(AUTOMATION_PATHS.externalSyncState);
  } catch {
    return null;
  }
}

export async function writeControlPlaneToDisk(controlPlane: AutomationControlPlane) {
  await writeJsonFile(AUTOMATION_PATHS.controlPlane, controlPlane);
}

export async function appendConversionsToDisk(
  items: Omit<ConversionEvent, "id">[]
) {
  const current = await readJsonFile<Array<Partial<ConversionEvent>>>(
    AUTOMATION_PATHS.conversionImports
  );
  const timestamp = new Date().toISOString();
  const merged = [
    ...current,
    ...items.map((item, index) => ({
      id: `${item.exchangeSlug}-${item.queryClusterId}-${timestamp}-${index}`,
      ...item,
    })),
  ];
  await writeJsonFile(AUTOMATION_PATHS.conversionImports, merged);
}

export async function appendCommissionsToDisk(
  items: Omit<CommissionEvent, "id">[]
) {
  const current = await readJsonFile<Array<Partial<CommissionEvent>>>(
    AUTOMATION_PATHS.commissionImports
  );
  const timestamp = new Date().toISOString();
  const merged = [
    ...current,
    ...items.map((item, index) => ({
      id: `${item.exchangeSlug}-${item.queryClusterId}-${timestamp}-${index}`,
      ...item,
    })),
  ];
  await writeJsonFile(AUTOMATION_PATHS.commissionImports, merged);
}

export async function writeGeneratedGscSignalsToDisk(items: QuerySignal[]) {
  await writeJsonFile(AUTOMATION_PATHS.generatedGscSignals, items);
}

export async function writeGeneratedPartnerConversionsToDisk(items: ConversionEvent[]) {
  await writeJsonFile(AUTOMATION_PATHS.generatedPartnerConversions, items);
}

export async function writeGeneratedPartnerCommissionsToDisk(items: CommissionEvent[]) {
  await writeJsonFile(AUTOMATION_PATHS.generatedPartnerCommissions, items);
}

export async function writeExternalSyncStateToDisk(state: ExternalSourcesState) {
  await writeJsonFile(AUTOMATION_PATHS.externalSyncState, state);
}

export async function writeAutomationStateSnapshot(state: AutomationState) {
  await writeJsonFile(AUTOMATION_PATHS.snapshot, {
    version: state.version,
    generatedAt: state.generatedAt,
    controlPlane: state.controlPlane,
    runs: state.runs,
    metrics: state.metrics,
    alerts: state.alerts,
    externalSources: state.externalSources,
    signalsPreview: state.signals.slice(0, 120),
    opportunities: state.opportunities.slice(0, 250),
    pages: state.pages.filter((page) => page.id.startsWith("page-")).slice(0, 250),
    earnings: state.earnings,
    pageRoiDaily: state.pageRoiDaily.slice(0, 250),
    queryRoiDaily: state.queryRoiDaily.slice(0, 250),
  });
}

export async function regenerateAutomationState() {
  resetAutomationStateCache();
  const state = buildAutomationState();
  await writeAutomationStateSnapshot(state);
  resetAutomationStateCache();
  return state;
}
