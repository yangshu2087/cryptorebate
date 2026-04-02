import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { getIntlMiddlewareRouting } from "./i18n/middleware-config";
import { DEFAULT_LOCALE } from "./lib/constants";
import { rewriteXDefaultAlternateLinkHeader } from "./lib/alternate-links";

const intlMiddleware = createMiddleware(getIntlMiddlewareRouting());
const CANONICAL_HOST = "cryptorebate.app";
const WWW_HOST = `www.${CANONICAL_HOST}`;

export default function proxy(request: NextRequest) {
  const host = request.headers.get("host")?.toLowerCase().split(":")[0];

  if (host === WWW_HOST) {
    const url = request.nextUrl.clone();
    url.hostname = CANONICAL_HOST;
    url.port = "";

    return NextResponse.redirect(url, 301);
  }

  const response = intlMiddleware(request);
  const linkHeader = response.headers.get("link");
  const rewritten = rewriteXDefaultAlternateLinkHeader(
    linkHeader,
    DEFAULT_LOCALE
  );

  if (rewritten && rewritten !== linkHeader) {
    response.headers.set("link", rewritten);
  }

  return response;
}

export const config = {
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
};
