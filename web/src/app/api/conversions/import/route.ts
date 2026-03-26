import { NextResponse } from "next/server";
import {
  appendCommissionsToDisk,
  appendConversionsToDisk,
  regenerateAutomationState,
} from "@/lib/automation/persistence";
import { importPartnerEventsToDb } from "@/lib/automation/db-store";

type ImportPayload = {
  conversions?: Array<{
    exchangeSlug: string;
    queryClusterId: string;
    registeredAt: string;
    tradedAt?: string;
    firstDepositUsd?: number;
    status: "registered" | "funded" | "traded";
  }>;
  commissions?: Array<{
    exchangeSlug: string;
    queryClusterId: string;
    commissionUsd: number;
    recordedAt: string;
    source: "api" | "csv" | "synthetic";
  }>;
};

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as ImportPayload | null;
  if (!body || (!body.conversions?.length && !body.commissions?.length)) {
    return NextResponse.json(
      { error: "conversions or commissions payload is required" },
      { status: 400 }
    );
  }

  if (body.conversions?.length) {
    await appendConversionsToDisk(body.conversions);
  }
  if (body.commissions?.length) {
    await appendCommissionsToDisk(body.commissions);
  }

  await importPartnerEventsToDb({
    conversions: body.conversions,
    commissions: body.commissions,
  });

  const state = await regenerateAutomationState();

  return NextResponse.json({
    ok: true,
    data: {
      conversionsImported: body.conversions?.length ?? 0,
      commissionsImported: body.commissions?.length ?? 0,
      generatedAt: state.generatedAt,
    },
  });
}
