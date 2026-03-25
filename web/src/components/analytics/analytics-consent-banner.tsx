"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import {
  getAnalyticsConsent,
  setAnalyticsConsent,
  type AnalyticsConsentStatus,
} from "@/lib/analytics-consent";
import { captureAnalyticsEvent, initPostHog } from "@/lib/posthog-client";

export function AnalyticsConsentBanner() {
  const t = useTranslations("consent");
  const [consent, setConsent] = useState<AnalyticsConsentStatus | null | "loading">(
    "loading"
  );

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setConsent(getAnalyticsConsent());
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  if (consent === "loading" || consent !== null) {
    return null;
  }

  const handleChoice = (nextConsent: AnalyticsConsentStatus) => {
    setAnalyticsConsent(nextConsent);
    setConsent(nextConsent);

    if (nextConsent === "granted") {
      initPostHog();
      captureAnalyticsEvent("analytics consent granted", {
        source: "banner",
      });
    }
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border/80 bg-background/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 md:flex-row md:items-center md:justify-between">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold">{t("title")}</p>
          <p className="mt-1 text-sm text-muted-foreground">{t("description")}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" onClick={() => handleChoice("granted")}>
            {t("accept")}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleChoice("denied")}
          >
            {t("decline")}
          </Button>
          <Link
            href="/legal"
            className="inline-flex h-9 items-center rounded-md px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            {t("learnMore")}
          </Link>
        </div>
      </div>
    </div>
  );
}
