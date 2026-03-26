import { NextResponse } from "next/server";
import { regenerateAutomationState } from "@/lib/automation/persistence";

type RebuildClusterPayload = {
  clusterId?: string;
};

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as RebuildClusterPayload | null;
  if (!body?.clusterId) {
    return NextResponse.json({ error: "clusterId is required" }, { status: 400 });
  }

  const state = await regenerateAutomationState();
  const cluster = state.clusters.find((item) => item.id === body.clusterId);

  if (!cluster) {
    return NextResponse.json({ error: "Cluster not found" }, { status: 404 });
  }

  return NextResponse.json({
    ok: true,
    data: {
      cluster,
      generatedAt: state.generatedAt,
    },
  });
}
