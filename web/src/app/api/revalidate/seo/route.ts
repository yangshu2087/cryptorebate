import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

type RevalidateBody = {
  secret?: string;
  locale?: string;
  slug?: string;
  pageType?: string;
  topic?: string;
  paths?: string[];
};

function isAuthorized(secret?: string | null) {
  const expected = process.env.AUTOMATION_REVALIDATE_SECRET;
  if (!expected) {
    return false;
  }
  return secret === expected;
}

function buildPaths(body: RevalidateBody) {
  const paths = new Set<string>([
    "/sitemap.xml",
    "/brand-sitemap.xml",
    "/fresh-7d-sitemap.xml",
    "/feed.xml",
    "/robots.txt",
  ]);

  for (const path of body.paths ?? []) {
    if (path.startsWith("/")) {
      paths.add(path);
    }
  }

  if (body.locale) {
    paths.add(`/${body.locale}`);
    paths.add(`/${body.locale}/exchanges`);

    if (body.slug) {
      paths.add(`/${body.locale}/exchanges/${body.slug}`);
      if (body.pageType) {
        paths.add(`/${body.locale}/exchanges/${body.slug}/${body.pageType}`);
      }
    }

    if (body.topic) {
      paths.add(`/${body.locale}/brand/${body.topic}`);
    }
  }

  return [...paths];
}

export async function POST(request: Request) {
  const url = new URL(request.url);
  const requestSecret =
    request.headers.get("x-automation-secret") ??
    url.searchParams.get("secret");
  const body = (await request.json().catch(() => ({}))) as RevalidateBody;
  const mergedSecret = body.secret ?? requestSecret;

  if (!isAuthorized(mergedSecret)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const paths = buildPaths(body);
  for (const path of paths) {
    revalidatePath(path);
  }

  return NextResponse.json({
    ok: true,
    data: {
      revalidated: paths,
    },
  });
}
