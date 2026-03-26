import { NextResponse } from "next/server";
import { buildSeoDashboardData } from "@/lib/automation/operator-console";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const locale = searchParams.get("locale") ?? undefined;
  const dashboard = await buildSeoDashboardData(locale);

  return NextResponse.json(
    {
      data: dashboard,
      meta: {
        generatedAt: dashboard.state.generatedAt,
      },
    },
    {
      headers: {
        "cache-control": "public, s-maxage=900, stale-while-revalidate=3600",
      },
    }
  );
}
