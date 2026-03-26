import { NextResponse } from "next/server";
import {
  readControlPlaneFromDisk,
  regenerateAutomationState,
  writeControlPlaneToDisk,
} from "@/lib/automation/persistence";

type RevertPagePayload = {
  locale?: string;
  exchangeSlug?: string;
  pageType?: string;
};

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as RevertPagePayload | null;
  if (!body?.locale || !body.exchangeSlug || !body.pageType) {
    return NextResponse.json(
      { error: "locale, exchangeSlug, and pageType are required" },
      { status: 400 }
    );
  }

  const controlPlane = await readControlPlaneFromDisk();
  const pageKey = `${body.locale}:${body.exchangeSlug}:${body.pageType}`;

  if (!controlPlane.quarantinedPageKeys.includes(pageKey)) {
    controlPlane.quarantinedPageKeys.push(pageKey);
  }

  await writeControlPlaneToDisk(controlPlane);
  const state = await regenerateAutomationState();

  return NextResponse.json({
    ok: true,
    data: {
      pageKey,
      generatedAt: state.generatedAt,
    },
  });
}
