#!/usr/bin/env tsx

type CliArgs = {
  locale?: string;
  slug?: string;
  pageType?: string;
  topic?: string;
  paths: string[];
};

function parseArgs(argv: string[]): CliArgs {
  const values = new Map<string, string>();
  const paths: string[] = [];

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token?.startsWith("--")) continue;
    const key = token.slice(2);
    const next = argv[index + 1];
    if (next && !next.startsWith("--")) {
      if (key === "path") {
        paths.push(next);
      } else {
        values.set(key, next);
      }
      index += 1;
    }
  }

  return {
    locale: values.get("locale"),
    slug: values.get("slug"),
    pageType: values.get("pageType"),
    topic: values.get("topic"),
    paths,
  };
}

async function main() {
  const siteUrl = process.env.AUTOMATION_SITE_URL;
  const secret = process.env.AUTOMATION_REVALIDATE_SECRET;

  if (!siteUrl || !secret) {
    console.log(
      JSON.stringify(
        {
          ok: true,
          skipped: true,
          reason: "AUTOMATION_SITE_URL or AUTOMATION_REVALIDATE_SECRET is not configured",
        },
        null,
        2
      )
    );
    return;
  }

  const args = parseArgs(process.argv.slice(2));
  const response = await fetch(`${siteUrl}/api/revalidate/seo`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-automation-secret": secret,
    },
    body: JSON.stringify(args),
  });

  const payload = await response.json().catch(() => null);
  console.log(
    JSON.stringify(
      {
        ok: response.ok,
        status: response.status,
        payload,
      },
      null,
      2
    )
  );

  if (!response.ok) {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(
    JSON.stringify(
      {
        ok: false,
        error: error instanceof Error ? error.message : String(error),
      },
      null,
      2
    )
  );
  process.exit(1);
});
