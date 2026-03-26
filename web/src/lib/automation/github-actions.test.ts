import { describe, expect, it } from "vitest";
import {
  deriveCtaLiveAuditAlert,
  type CtaLiveAuditStatus,
} from "./github-actions";

function buildStatus(
  overrides: Partial<CtaLiveAuditStatus> = {}
): CtaLiveAuditStatus {
  return {
    workflow: "cta-live-audit",
    runId: 123456,
    runNumber: 42,
    status: "completed",
    conclusion: "success",
    htmlUrl:
      "https://github.com/yangshu2087/cryptorebate/actions/runs/123456",
    createdAt: "2026-03-26T01:15:00.000Z",
    updatedAt: "2026-03-26T01:20:00.000Z",
    ...overrides,
  };
}

describe("CTA live audit GitHub alert mapping", () => {
  it("does not create an alert when the workflow has never run", () => {
    expect(
      deriveCtaLiveAuditAlert(
        buildStatus({
          status: "never_run",
          conclusion: null,
        })
      )
    ).toBeNull();
  });

  it("does not create an alert when the latest run succeeded", () => {
    expect(deriveCtaLiveAuditAlert(buildStatus())).toBeNull();
  });

  it("creates an external workflow alert when the latest run failed", () => {
    const alert = deriveCtaLiveAuditAlert(
      buildStatus({
        conclusion: "failure",
      })
    );

    expect(alert).not.toBeNull();
    expect(alert?.type).toBe("external_workflow_failure");
    expect(alert?.level).toBe("critical");
    expect(alert?.href).toContain("/actions/runs/123456");
    expect(alert?.source).toBe("external");
    expect(alert?.sourceLabel).toContain("CTA Live Audit");
  });

  it("returns a warning-level alert for cancelled runs", () => {
    const alert = deriveCtaLiveAuditAlert(
      buildStatus({
        conclusion: "cancelled",
      })
    );

    expect(alert?.level).toBe("warning");
    expect(alert?.message).toContain("已取消");
  });
});
