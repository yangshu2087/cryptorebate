import fs from "node:fs/promises";
import path from "node:path";
import type {
  AutomationControlPlane,
  AutomationState,
  CommissionEvent,
  ConversionEvent,
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

export async function writeAutomationStateSnapshot(state: AutomationState) {
  await writeJsonFile(AUTOMATION_PATHS.snapshot, {
    version: state.version,
    generatedAt: state.generatedAt,
    controlPlane: state.controlPlane,
    runs: state.runs,
    metrics: state.metrics,
    alerts: state.alerts,
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
