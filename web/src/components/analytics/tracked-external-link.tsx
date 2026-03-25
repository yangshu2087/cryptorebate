"use client";

import type { ComponentPropsWithoutRef, MouseEvent } from "react";
import {
  captureAnalyticsEvent,
  type AnalyticsProperties,
} from "@/lib/posthog-client";
import { queueClickLog } from "@/lib/click-log";

type TrackedExternalLinkProps = ComponentPropsWithoutRef<"a"> & {
  analytics?: AnalyticsProperties;
  eventName?: string;
};

export function TrackedExternalLink({
  analytics,
  eventName = "exchange cta clicked",
  onClick,
  ...props
}: TrackedExternalLinkProps) {
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    if (event.defaultPrevented) return;
    captureAnalyticsEvent(eventName, analytics);
    queueClickLog(eventName, analytics, {
      targetUrl: typeof props.href === "string" ? props.href : undefined,
    });
  };

  return <a {...props} onClick={handleClick} />;
}
