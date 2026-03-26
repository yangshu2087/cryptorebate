import { NextResponse } from "next/server";
import { getAutomationState } from "@/lib/automation/catalog";
import { listOpportunitiesFromDb } from "@/lib/automation/db-store";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const locale = searchParams.get("locale");
  const exchangeSlug = searchParams.get("exchange");
  const pageType = searchParams.get("pageType");
  const stage = searchParams.get("stage");
  const limit = Number.parseInt(searchParams.get("limit") ?? "50", 10);

  const dbResult = await listOpportunitiesFromDb({
    locale,
    exchangeSlug,
    pageType,
    stage,
    limit,
  });

  if (dbResult) {
    return NextResponse.json(
      {
        data: dbResult.data,
        meta: {
          count: dbResult.data.length,
          generatedAt: dbResult.generatedAt,
        },
      },
      {
        headers: {
          "cache-control": "public, s-maxage=900, stale-while-revalidate=3600",
        },
      }
    );
  }

  const data = getAutomationState().opportunities
    .filter((item) => (!locale ? true : item.locale === locale))
    .filter((item) => (!exchangeSlug ? true : item.exchangeSlug === exchangeSlug))
    .filter((item) => (!pageType ? true : item.pageType === pageType))
    .filter((item) => (!stage ? true : item.stage === stage))
    .sort((a, b) => b.score - a.score)
    .slice(0, Number.isNaN(limit) ? 50 : limit);

  return NextResponse.json(
    {
      data,
      meta: {
        count: data.length,
        generatedAt: getAutomationState().generatedAt,
      },
    },
    {
      headers: {
        "cache-control": "public, s-maxage=900, stale-while-revalidate=3600",
      },
    }
  );
}
