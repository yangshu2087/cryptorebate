import { NextResponse } from "next/server";
import { getAutomationState } from "@/lib/automation/catalog";
import { getLatestAutomationSnapshotFromDb, getPageByIdFromDb } from "@/lib/automation/db-store";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const dbPage = await getPageByIdFromDb(id);
  if (dbPage) {
    const snapshot = await getLatestAutomationSnapshotFromDb();
    return NextResponse.json({
      data: dbPage,
      meta: {
        generatedAt: snapshot?.generated_at ?? "",
      },
    });
  }

  const page = getAutomationState().pages.find((item) => item.id === id);

  if (!page) {
    return NextResponse.json({ error: "Page not found" }, { status: 404 });
  }

  return NextResponse.json({
    data: page,
    meta: {
      generatedAt: getAutomationState().generatedAt,
    },
  });
}
