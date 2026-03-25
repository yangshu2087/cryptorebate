"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import {
  captureAnalyticsEvent,
  type AnalyticsProperties,
} from "@/lib/posthog-client";
import { queueClickLog } from "@/lib/click-log";

export function CopyButton({
  text,
  analytics,
}: {
  text: string;
  analytics?: AnalyticsProperties;
}) {
  const [copied, setCopied] = useState(false);
  const t = useTranslations("exchanges");

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    captureAnalyticsEvent("invite code copied", analytics);
    queueClickLog("invite code copied", analytics, {
      targetUrl: `code:${text}`,
    });
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleCopy}
      className="gap-1.5 text-xs"
    >
      {copied ? (
        <>
          <Check className="h-3 w-3" />
          {t("copied")}
        </>
      ) : (
        <>
          <Copy className="h-3 w-3" />
          {t("copyCode")}
        </>
      )}
    </Button>
  );
}
