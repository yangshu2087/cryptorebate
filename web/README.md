# CryptoRebate

Global crypto exchange rebate platform. Compare trading fees and rebate rates across major exchanges, and register through referral links to save on trading fees.

Live at: **https://cryptorebate.app**

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS v4 + shadcn/ui
- **i18n**: next-intl with `[locale]` routing (`en`, `zh`, `zh-tw`, `ja`, `ko`, `ru`, `es`, `pt`, `vi`, `th`, `hi`)
- **Theming**: next-themes (light / dark mode)
- **Deployment**: Vercel

## Route Structure

All routes are under `src/app/[locale]/`:

| Route | Description |
|---|---|
| `/` | Homepage with featured exchanges, savings estimator, FAQ |
| `/exchanges` | Exchange list with sorting and filtering |
| `/exchanges/[slug]` | Exchange detail page (fees, pros/cons, tutorial, FAQ) |
| `/exchanges/[slug]/[pageType]` | GEO/SEO cluster pages for referral code, signup/KYC, fees, official site, app download, and safety review |
| `/brand/[topic]` | Brand-demand pages such as `cryptorebate-binance`, localized and auto-published |
| `/calculator` | Fee calculator comparing exchanges by trading volume |
| `/about` | How rebates work, risk disclosure |
| `/disclosure` | Affiliate disclosure (revenue model, partner list) |
| `/legal` | Privacy policy and terms of use |

Discovery routes at the app root:

| Route | Description |
|---|---|
| `/sitemap.xml` | Main sitemap covering static, exchange, GEO, and brand pages |
| `/brand-sitemap.xml` | Brand-page sitemap for branded search demand |
| `/fresh-7d-sitemap.xml` | Recently published/refreshed automation pages from the last 7 days |
| `/feed.xml` | RSS feed for fresh pages and branded content |

Current GEO page types:

- `referral-code`
- `signup-kyc`
- `fees-rebate`
- `official-site`
- `app-download`
- `safety-review`

Current GEO coverage:

- `7 exchanges × 6 page types × 11 locales = 462` GEO URLs

## Data Source

Exchange data lives in `src/data/exchanges.ts` as a static TypeScript array. Each exchange entry includes:

- Slug, name, logo path
- Referral code and link
- Fee structure (spot/futures maker/taker, token discount)
- Rebate rates (spot and futures)
- Metadata (founded year, headquarters, trading pairs)
- Feature flags (spot, futures, options, copy trading, staking)
- KYC requirements and tags

Current supported exchanges (7):
- Binance
- OKX
- Bybit
- Bitget
- Gate.io
- KuCoin
- Huobi / HTX

### Adding or Updating an Exchange

1. Add or edit the exchange object in `src/data/exchanges.ts`
2. Add the exchange logo to `public/images/exchanges/` (recommended: `{slug}.png` or `{slug}.svg`)
3. Add translation strings under `exchanges.{slug}` in **all locale files** under `messages/` (description, pros, cons, bestFor, tutorial steps, FAQ)
4. The exchange detail page at `/exchanges/[slug]` renders automatically from the data

## i18n

Message files are at:

- `messages/en.json`
- `messages/zh.json`
- `messages/zh-tw.json`
- `messages/ja.json`
- `messages/ko.json`
- `messages/ru.json`
- `messages/es.json`
- `messages/pt.json`
- `messages/vi.json`
- `messages/th.json`
- `messages/hi.json`

Default locale is `en`.

All user-visible text must be in message files. Use `useTranslations` (client) or `getTranslations` (server/metadata) from next-intl.

## Brand Assets

Primary brand assets are under `public/images/brand/`:
- `cryptorebate-mark.svg`
- `cryptorebate-wordmark.svg`
- `cryptorebate-wordmark-dark.svg`
- `cryptorebate-wordmark-monochrome.svg`

Usage and guardrails are documented in project root:
- `../brand-assets-usage.md`
- `../logo-wordmark-spec.md`

## Development

```bash
npm install
npm run dev
```

Open http://localhost:3000 to view the site.

### Analytics Environment

PostHog is wired in with a client-side setup behind a consent gate. To enable it, add:

```bash
NEXT_PUBLIC_POSTHOG_TOKEN=your_project_token
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
```

Use `.env.local` for local development, and set the same values in Vercel Project Environment Variables for production.

Analytics behavior:

- PostHog initializes only after the visitor accepts analytics
- Click logs are sent to `POST /api/clicks` only after consent
- The consent decision is stored in localStorage and a first-party cookie

## API Endpoints

Minimal API coverage is now available under App Router route handlers:

- `GET /api/exchanges`
  - Returns all 7 exchanges in display order
- `GET /api/exchanges?slug=binance`
  - Returns one exchange payload with numeric rebate fields
- `POST /api/clicks`
  - Accepts consent-gated click logs with `event`, `page_url`, `referrer`, `timestamp`, UTM fields, analytics properties, and normalized attribution fields such as `locale`, `exchange_slug`, `page_type`, `query_cluster_id`, `landing_page_key`, `session_id`, and `visitor_id`
  - In writable environments the route can append normalized click imports to disk; on Vercel it still logs a normalized attribution object to server logs

## Deployment

Deploy on Vercel with the following configuration:

- **Root Directory**: `web` (the monorepo root contains other projects)
- **Production Project**: `cryptorebate`
- **Framework Preset**: Next.js (auto-detected)
- **Build Command**: default (`next build`)
- **Output Directory**: default (`.next`)
- **Domain Redirect**: `www.cryptorebate.app` is forced to `https://cryptorebate.app` by `vercel.json` (permanent redirect)

Quick deploy commands:

```bash
npm run check
npm run automation:generate
npm run automation:sync-gsc
npm run automation:submit:sitemaps
npm run automation:sync-earnings
npm run partner:import:csv -- --exchange okx --file /absolute/path/to/okx.csv
npm run partner:import:csv:dry-run -- --exchange binance --file /absolute/path/to/binance.csv
npm run deploy:vercel
bash ../scripts/sync-automation-secrets.sh
```

Important deployment rule:

- Do not run raw `npx vercel --prod` from `web/`. The Vercel project already uses `Root Directory = web`, so direct deploys from inside `web/` can resolve to `web/web`.
- Safe options:
  - From repo root: `npx vercel --prod`
  - From `web/`: `npm run deploy:vercel` or `npm run deploy:vercel:preview`


## Data Quality Gates

- `npm run check` runs lint + test + build in one command
- `npm run test` includes schema checks for exchange data
- Logo paths are validated against files under `public/`
- Referral links are validated as URLs and checked against an approved partner-domain allowlist
- GitHub Actions workflow `.github/workflows/quality-gates.yml` enforces these checks on `push` and `pull_request`

## SEO / GEO Automation Loop

- `npm run automation:generate` recomputes signals, opportunities, pages, ROI, and earnings snapshot
- `src/lib/automation/*` holds the automation engine, locale packs, catalog, and persistence logic
- `src/app/api/opportunities`, `pages`, `stats/seo`, `earnings`, `roi`, `control/*`, `conversions/import`, and `earnings/sync/run` expose the automation control plane
- `src/app/api/stats/seo` now also returns `attribution`, `dataReality`, and `operatorSummary` for the admin console and Telegram operator digests
- `/en/admin/seo` now reads the DB-first operator payload path first, so the console prefers Postgres-backed snapshot/state, distribution queue status, and sync cards before falling back to local JSON
- `src/app/brand-sitemap.xml/route.ts`, `fresh-7d-sitemap.xml/route.ts`, and `feed.xml/route.ts` expose discovery endpoints for Google and self-owned distribution channels
- `src/data/automation/*` stores the control plane and import seeds
- `src/data/generated/automation-state.json` is the generated automation snapshot
- `.github/workflows/automation-loop.yml` runs the automation pipeline daily and commits refreshed snapshot output
- The same automation loop can now ingest real external sources when secrets are configured:
  - Google Search Console via service-account or refresh-token OAuth
- Search Console API sitemap/feed submission for `sitemap.xml`, `brand-sitemap.xml`, `fresh-7d-sitemap.xml`, and `feed.xml`
- Self-owned distribution queue via `distribution_jobs`:
  - Telegram auto-publish when `AUTOMATION_TELEGRAM_BOT_TOKEN` and `AUTOMATION_TELEGRAM_CHAT_ID` are configured
  - X auto-publish when `AUTOMATION_X_ENABLED=true` and `AUTOMATION_X_ACCESS_TOKEN` are configured
  - otherwise jobs stay `pending` and are visible in `/en/admin/seo`
  - Partner earnings feeds for Binance / OKX / Bybit / Bitget / Gate / KuCoin / Huobi via provider-aware sync modes
    - Default operating model: **affiliate-first + monthly CSV import**
    - `csv-portal`: portal/export CSV endpoint (recommended default)
    - `generic`: direct JSON / CSV endpoint if an affiliate portal exposes one
    - `okx-broker`: signed OKX Broker API rebate download flow (advanced optional)
    - `gate-api4`: signed Gate APIv4 broker/report endpoint (advanced optional)
- Generated external snapshots are written to:
  - `src/data/generated/gsc-query-signals.json`
  - `src/data/generated/partner-conversions.json`
  - `src/data/generated/partner-commissions.json`
  - `src/data/generated/external-sync-state.json`

### Monthly CSV Import

For the default affiliate-first workflow, import monthly portal CSVs directly into the automation state:

```bash
npm run partner:import:csv -- --exchange okx --file /absolute/path/to/okx.csv
npm run partner:import:csv -- --exchange gate --file /absolute/path/to/gate.csv --mode commissions
npm run partner:import:csv:dry-run -- --exchange bybit --file /absolute/path/to/bybit.csv --locale en --pageType official-site
```

Notes:
- `--exchange` is required and must match one of the 7 supported exchanges
- `--file` can be absolute or repo-relative
- `--mode` defaults to `combined`; use `commissions` or `conversions` when the CSV only contains one type
- missing `locale` / `pageType` / `queryClusterId` values are backfilled from `--locale` and `--pageType`
- duplicate rows are skipped by default; pass `--allow-duplicates` only if you intentionally want to re-import identical records

### External Source Environment

Use `web/.env.example` as the reference template.

Core GSC variables:

- `AUTOMATION_GSC_ENABLED`
- `AUTOMATION_GSC_PROPERTY`
- `AUTOMATION_GSC_AUTH_MODE`
- `AUTOMATION_GSC_SUBMIT_SITEMAPS`
- `AUTOMATION_SITE_URL`
- `AUTOMATION_GSC_SERVICE_ACCOUNT_JSON` or `AUTOMATION_GSC_CLIENT_EMAIL` + `AUTOMATION_GSC_PRIVATE_KEY`
- `AUTOMATION_GSC_CLIENT_ID`
- `AUTOMATION_GSC_CLIENT_SECRET`
- `AUTOMATION_GSC_REFRESH_TOKEN`
- `AUTOMATION_X_ENABLED`
- `AUTOMATION_X_ACCESS_TOKEN`
- `AUTOMATION_X_API_BASE_URL`

Partner sync variables follow the pattern:

- `AUTOMATION_PARTNER_<EXCHANGE>_ENABLED`
- `AUTOMATION_PARTNER_<EXCHANGE>_PROVIDER`
- `AUTOMATION_PARTNER_<EXCHANGE>_URL`
- `AUTOMATION_PARTNER_<EXCHANGE>_FORMAT`
- `AUTOMATION_PARTNER_<EXCHANGE>_MODE`
- `AUTOMATION_PARTNER_<EXCHANGE>_METHOD`
- `AUTOMATION_PARTNER_<EXCHANGE>_AUTH_TYPE`
- `AUTOMATION_PARTNER_<EXCHANGE>_AUTH_HEADER`
- `AUTOMATION_PARTNER_<EXCHANGE>_TOKEN`
- `AUTOMATION_PARTNER_<EXCHANGE>_KEY`
- `AUTOMATION_PARTNER_<EXCHANGE>_SECRET`
- `AUTOMATION_PARTNER_<EXCHANGE>_PASSPHRASE`
- `AUTOMATION_PARTNER_<EXCHANGE>_REPORT_KIND`
- `AUTOMATION_PARTNER_<EXCHANGE>_BROKER_TYPE`
- `AUTOMATION_PARTNER_<EXCHANGE>_WINDOW_DAYS`
- `AUTOMATION_PARTNER_<EXCHANGE>_BODY_JSON`
- `AUTOMATION_PARTNER_<EXCHANGE>_FALLBACK_LOCALE`
- `AUTOMATION_PARTNER_<EXCHANGE>_FALLBACK_PAGE_TYPE`

Where `<EXCHANGE>` is one of:

- `BINANCE`
- `OKX`
- `BYBIT`
- `BITGET`
- `GATE`
- `KUCOIN`
- `HUOBI`

The internal operator console is available at `/en/admin/seo`, but the UI copy is intentionally fixed to Simplified Chinese for operator consistency.

Operator docs:
- `../real-data-vs-simulated-v1.md`
- `../admin-console-operator-guide-v1.md`
- `../partner-source-spec-v1.md`
- `../automation-alerts-runbook-v1.md`

### Recommended monthly workflow
For the current business model, treat partner sync as:
1. affiliate/referral first
2. monthly CSV export from each exchange portal at the beginning of the month
3. import into automation state
4. use advanced API/broker providers only if you later obtain real partner credentials and want to automate beyond CSV

## Minimal Analytics Events

The first PostHog pass captures:

- `$pageview`
- `savings estimator adjusted`
- `exchange cta clicked`
- `invite code copied`
- `analytics consent granted`

The implementation lives in:

- `instrumentation-client.ts`
- `src/lib/analytics-consent.ts`
- `src/lib/click-log.ts`
- `src/lib/posthog-client.ts`
- `src/app/api/clicks/route.ts`
- `src/components/analytics/tracked-external-link.tsx`

## SEO Notes

- Each page has `generateMetadata` with title, description, and `alternates` for language variants
- Canonical URLs point to `https://cryptorebate.app/{locale}/{path}`
- Exchange detail pages use dynamic metadata with exchange name and rebate rate
- GEO cluster pages add `WebPage`, `FAQPage`, `BreadcrumbList`, and `HowTo` where appropriate
- Static data means pages are statically generated at build time for optimal performance

## Legal / Compliance

- **Affiliate Disclosure** (`/disclosure`): Required transparency page explaining the referral business model. Lists all partner exchanges and confirms no extra cost to users.
- **Privacy & Terms** (`/legal`): Covers minimal data collection (analytics, locale cookie), referral link behavior, investment disclaimer, and limitation of liability.
- **Risk Disclosure**: Present on the About page and in the site-wide footer disclaimer. CryptoRebate does not provide investment advice.
