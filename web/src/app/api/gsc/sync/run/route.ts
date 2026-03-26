import { NextResponse } from "next/server";
import { runExternalSync } from "@/lib/automation/external-sync";

export const runtime = "nodejs";

export async function POST() {
  try {
    const { state, gsc } = await runExternalSync("gsc");

    return NextResponse.json({
      ok: true,
      data: {
        generatedAt: state.generatedAt,
        totalSignals: state.metrics.totalSignals,
        totalOpportunities: state.metrics.totalOpportunities,
        gsc: gsc?.report ?? null,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown GSC sync error";
    const readOnlyRuntime =
      process.env.VERCEL === "1" &&
      /(EROFS|read-only|Read-only file system)/i.test(message);

    return NextResponse.json(
      {
        ok: false,
        error: readOnlyRuntime
          ? "Vercel runtime is read-only. Persisted GSC sync should run through the daily automation workflow or a writable worker."
          : message,
        meta: {
          runtime: process.env.VERCEL === "1" ? "vercel" : "local",
          mode: "gsc",
          readOnlyRuntime,
        },
      },
      {
        status: readOnlyRuntime ? 409 : 500,
      }
    );
  }
}
