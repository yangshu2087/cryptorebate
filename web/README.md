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
| `/calculator` | Fee calculator comparing exchanges by trading volume |
| `/about` | How rebates work, risk disclosure |
| `/disclosure` | Affiliate disclosure (revenue model, partner list) |
| `/legal` | Privacy policy and terms of use |

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

## Deployment

Deploy on Vercel with the following configuration:

- **Root Directory**: `web` (the monorepo root contains other projects)
- **Framework Preset**: Next.js (auto-detected)
- **Build Command**: default (`next build`)
- **Output Directory**: default (`.next`)
- **Domain Redirect**: `www.cryptorebate.app` is forced to `https://cryptorebate.app` by `vercel.json` (301)

Quick deploy commands:

```bash
npm run check
npm run deploy:vercel
```

## Data Quality Gates

- `npm run check` runs lint + test + build in one command
- `npm run test` includes schema checks for exchange data
- Logo paths are validated against files under `public/`
- Referral links are validated as URLs and checked against an approved partner-domain allowlist
- GitHub Actions workflow `.github/workflows/quality-gates.yml` enforces these checks on `push` and `pull_request`

## SEO Notes

- Each page has `generateMetadata` with title, description, and `alternates` for language variants
- Canonical URLs point to `https://cryptorebate.app/{locale}/{path}`
- Exchange detail pages use dynamic metadata with exchange name and rebate rate
- Static data means pages are statically generated at build time for optimal performance

## Legal / Compliance

- **Affiliate Disclosure** (`/disclosure`): Required transparency page explaining the referral business model. Lists all partner exchanges and confirms no extra cost to users.
- **Privacy & Terms** (`/legal`): Covers minimal data collection (analytics, locale cookie), referral link behavior, investment disclaimer, and limitation of liability.
- **Risk Disclosure**: Present on the About page and in the site-wide footer disclaimer. CryptoRebate does not provide investment advice.
