import { NextResponse } from "next/server";
import { getAutomationState } from "@/lib/automation/catalog";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const locale = searchParams.get("locale");
  const exchangeSlug = searchParams.get("exchange");
  const stage = searchParams.get("stage");
  const pageType = searchParams.get("pageType");

  const data = getAutomationState().pages
    .filter((item) => (!locale ? true : item.locale === locale))
    .filter((item) => (!exchangeSlug ? true : item.exchangeSlug === exchangeSlug))
    .filter((item) => (!stage ? true : item.stage === stage))
    .filter((item) => (!pageType ? true : item.pageType === pageType));

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
