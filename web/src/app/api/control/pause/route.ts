import { NextResponse } from "next/server";
import {
  readControlPlaneFromDisk,
  regenerateAutomationState,
  writeControlPlaneToDisk,
} from "@/lib/automation/persistence";

export async function POST() {
  const controlPlane = await readControlPlaneFromDisk();
  controlPlane.paused = true;
  await writeControlPlaneToDisk(controlPlane);
  const state = await regenerateAutomationState();

  return NextResponse.json({
    ok: true,
    data: {
      paused: true,
      generatedAt: state.generatedAt,
    },
  });
}
