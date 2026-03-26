import { NextResponse } from "next/server";
import { getAutomationState } from "@/lib/automation/catalog";
import { getRoiFromDb } from "@/lib/automation/db-store";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("mode") === "query" ? "query" : "page";
  const locale = searchParams.get("locale");
  const exchangeSlug = searchParams.get("exchange");

  const dbResult = await getRoiFromDb(mode, {
    locale,
    exchangeSlug,
  });

  if (dbResult) {
    return NextResponse.json(
      {
        data: dbResult.data,
        meta: {
          count: dbResult.data.length,
          mode,
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

  const source =
    mode === "query"
      ? getAutomationState().queryRoiDaily
      : getAutomationState().pageRoiDaily;

  const data = source
    .filter((item) => (!locale ? true : item.locale === locale))
    .filter((item) => (!exchangeSlug ? true : item.exchangeSlug === exchangeSlug))
    .sort((a, b) => b.commissionsUsd - a.commissionsUsd);

  return NextResponse.json(
    {
      data,
      meta: {
        count: data.length,
        mode,
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
