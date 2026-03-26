import { NextResponse } from "next/server";
import { runExternalSync } from "@/lib/automation/external-sync";

export const runtime = "nodejs";

export async function POST() {
  try {
    const { state, partners } = await runExternalSync("partners");

    return NextResponse.json({
      ok: true,
      data: {
        generatedAt: state.generatedAt,
        projectedRevenue: state.metrics.monthlyProjectedRevenueUsd,
        opportunities: state.metrics.totalOpportunities,
        publishedPages: state.metrics.publishedPages,
        alerts: state.alerts.length,
        partnerSync: partners?.reports ?? [],
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown partner sync error";
    const readOnlyRuntime =
      process.env.VERCEL === "1" &&
      /(EROFS|read-only|Read-only file system)/i.test(message);

    return NextResponse.json(
      {
        ok: false,
        error: readOnlyRuntime
          ? "Vercel runtime is read-only. Persisted partner sync should run through the daily automation workflow or a writable worker."
          : message,
        meta: {
          runtime: process.env.VERCEL === "1" ? "vercel" : "local",
          mode: "partners",
          readOnlyRuntime,
        },
      },
      {
        status: readOnlyRuntime ? 409 : 500,
      }
    );
  }
}
