import type { AutomationAlert } from "@/lib/automation/types";

const REPO_OWNER = "yangshu2087";
const REPO_NAME = "cryptorebate";
const CTA_LIVE_AUDIT_WORKFLOW = "cta-live-audit.yml";

type GitHubWorkflowRunApiResponse = {
  workflow_runs?: GitHubWorkflowRun[];
};

export type GitHubWorkflowRun = {
  id: number;
  html_url: string;
  status: string;
  conclusion: string | null;
  created_at: string;
  updated_at: string;
  run_number: number;
  display_title?: string;
  event?: string;
};

export type CtaLiveAuditStatus = {
  workflow: "cta-live-audit";
  runId: number;
  runNumber: number;
  status: string;
  conclusion: string | null;
  htmlUrl: string;
  createdAt: string;
  updatedAt: string;
};

function mapConclusionToLevel(
  conclusion: string | null
): AutomationAlert["level"] {
  if (conclusion === "cancelled") {
    return "warning";
  }

  return "critical";
}

function mapConclusionLabel(conclusion: string | null) {
  switch (conclusion) {
    case "failure":
      return "失败";
    case "cancelled":
      return "已取消";
    case "timed_out":
      return "超时";
    case "action_required":
      return "需要人工处理";
    case "startup_failure":
      return "启动失败";
    default:
      return conclusion ?? "未知状态";
  }
}

export function deriveCtaLiveAuditAlert(
  run: CtaLiveAuditStatus | null
): AutomationAlert | null {
  if (
    !run ||
    run.status !== "completed" ||
    run.conclusion === "success"
  ) {
    return null;
  }

  return {
    id: `alert-cta-live-audit-${run.runId}`,
    level: mapConclusionToLevel(run.conclusion),
    type: "external_workflow_failure",
    message: `CTA Live Audit 最近一次运行${mapConclusionLabel(run.conclusion)}，需要检查线上 CTA 验收链路。`,
    scope: {},
    triggeredAt: run.updatedAt,
    href: run.htmlUrl,
    source: "external",
    sourceLabel: "GitHub Actions · CTA Live Audit",
  };
}

export async function getCtaLiveAuditStatus(): Promise<CtaLiveAuditStatus | null> {
  try {
    const response = await fetch(
      `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/actions/workflows/${CTA_LIVE_AUDIT_WORKFLOW}/runs?per_page=1`,
      {
        headers: {
          Accept: "application/vnd.github+json",
          "User-Agent": "cryptorebate-admin-seo",
        },
        next: {
          revalidate: 300,
        },
      }
    );

    if (!response.ok) {
      return null;
    }

    const data =
      (await response.json()) as GitHubWorkflowRunApiResponse;
    const latest = data.workflow_runs?.[0];

    if (!latest) {
      return {
        workflow: "cta-live-audit",
        runId: 0,
        runNumber: 0,
        status: "never_run",
        conclusion: null,
        htmlUrl: `https://github.com/${REPO_OWNER}/${REPO_NAME}/actions/workflows/${CTA_LIVE_AUDIT_WORKFLOW}`,
        createdAt: "",
        updatedAt: "",
      };
    }

    return {
      workflow: "cta-live-audit",
      runId: latest.id,
      runNumber: latest.run_number,
      status: latest.status,
      conclusion: latest.conclusion,
      htmlUrl: latest.html_url,
      createdAt: latest.created_at,
      updatedAt: latest.updated_at,
    };
  } catch {
    return null;
  }
}

export async function getCtaLiveAuditAlert() {
  const run = await getCtaLiveAuditStatus();
  return deriveCtaLiveAuditAlert(run);
}
