import { describe, expect, it, vi } from "vitest";
import { DEFAULT_LOCALE, SITE_URL } from "@/lib/constants";
import {
  auditCoverageRepair,
  getDefaultCoverageRepairSummary,
  normalizeCoverageRepairSummary,
} from "./coverage-audit";

function buildLinkHeader(xDefaultTarget: string) {
  return [
    `<${SITE_URL}/zh>; rel="alternate"; hreflang="zh"`,
    `<${xDefaultTarget}>; rel="alternate"; hreflang="x-default"`,
  ].join(", ");
}

describe("auditCoverageRepair", () => {
  it("flags redirect, 404, and discovery risks when x-default still points at root and assets are missing", async () => {
    const fetchMock = vi.fn(async (input: string | URL) => {
      const url = input.toString();

      if (url === `${SITE_URL}/${DEFAULT_LOCALE}`) {
        return new Response("", {
          status: 200,
          headers: {
            link: buildLinkHeader(`${SITE_URL}/`),
          },
        });
      }

      if (url === `${SITE_URL}/`) {
        return new Response("", {
          status: 307,
          headers: {
            location: `/${DEFAULT_LOCALE}`,
          },
        });
      }

      return new Response("", { status: 404 });
    });

    const summary = await auditCoverageRepair(SITE_URL, DEFAULT_LOCALE, fetchMock as typeof fetch);

    expect(summary.redirectIssueCount).toBe(1);
    expect(summary.notFoundIssueCount).toBe(2);
    expect(summary.discoveryIssueCount).toBeGreaterThan(0);
    expect(summary.xDefaultHealthy).toBe(false);
    expect(summary.status).toBe("failed");
    expect(summary.issueCount).toBe(
      summary.redirectIssueCount + summary.notFoundIssueCount + summary.discoveryIssueCount
    );
  });

  it("marks the coverage repair state healthy when x-default points to /en and key assets return 200", async () => {
    const fetchMock = vi.fn(async (input: string | URL) => {
      const url = input.toString();

      if (url === `${SITE_URL}/`) {
        return new Response("", {
          status: 307,
          headers: {
            location: `/${DEFAULT_LOCALE}`,
          },
        });
      }

      if (url.startsWith(SITE_URL)) {
        return new Response("", {
          status: 200,
          headers: url === `${SITE_URL}/${DEFAULT_LOCALE}`
            ? {
                link: buildLinkHeader(`${SITE_URL}/${DEFAULT_LOCALE}`),
              }
            : undefined,
        });
      }

      return new Response("", { status: 200 });
    });

    const summary = await auditCoverageRepair(SITE_URL, DEFAULT_LOCALE, fetchMock as typeof fetch);

    expect(summary.redirectIssueCount).toBe(0);
    expect(summary.notFoundIssueCount).toBe(0);
    expect(summary.discoveryIssueCount).toBe(0);
    expect(summary.xDefaultHealthy).toBe(true);
    expect(summary.status).toBe("healthy");
    expect(summary.label).toBe("已修复待验证");
    expect(summary.issueCount).toBe(0);
  });

  it("normalizes missing artifacts to a never-run fallback", () => {
    const summary = normalizeCoverageRepairSummary(null, SITE_URL, DEFAULT_LOCALE);

    expect(summary).toEqual(getDefaultCoverageRepairSummary(SITE_URL, DEFAULT_LOCALE));
  });
});
