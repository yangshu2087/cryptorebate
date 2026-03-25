"use client";

import type { ComponentProps, MouseEvent } from "react";
import { Link } from "@/i18n/navigation";
import {
  captureAnalyticsEvent,
  type AnalyticsProperties,
} from "@/lib/posthog-client";
import { queueClickLog } from "@/lib/click-log";

type TrackedInternalLinkProps = ComponentProps<typeof Link> & {
  analytics?: AnalyticsProperties;
  eventName?: string;
};

export function TrackedInternalLink({
  analytics,
  eventName = "internal content link clicked",
  onClick,
  ...props
}: TrackedInternalLinkProps) {
  const stringifyHref = () => {
    if (typeof props.href === "string") {
      return props.href;
    }

    if (typeof props.href === "object" && props.href !== null) {
      const pathname =
        "pathname" in props.href && typeof props.href.pathname === "string"
          ? props.href.pathname
          : "";
      const query =
        "query" in props.href &&
        props.href.query &&
        typeof props.href.query === "object"
          ? new URLSearchParams(
              Object.entries(props.href.query).flatMap(([key, value]) =>
                value == null ? [] : [[key, String(value)]]
              )
            ).toString()
          : "";

      if (!pathname) return undefined;
      return query ? `${pathname}?${query}` : pathname;
    }

    return undefined;
  };

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    if (event.defaultPrevented) return;
    captureAnalyticsEvent(eventName, analytics);
    queueClickLog(eventName, analytics, {
      targetUrl: stringifyHref(),
    });
  };

  return <Link {...props} onClick={handleClick} />;
}
