# CryptoRebate Brand Assets Usage Guide

## 1. Purpose

This file is the **practical usage map** for the current CryptoRebate brand system.

It answers 4 questions clearly:

1. **Which file should be used in which scenario**
2. **Which asset is the default choice**
3. **Which asset should not be misused**
4. **How dev / design / content work should stay consistent**

This is the final working handoff layer on top of:

- `logo-redesign-brief.md`
- `logo-generation-prompts.md`
- `logo-wordmark-spec.md`

---

## 2. Current source-of-truth files

### Brand strategy / spec
- `logo-redesign-brief.md`
- `logo-generation-prompts.md`
- `logo-wordmark-spec.md`
- `brand-assets-usage.md` ← this file

### Brand image assets
- `web/public/images/brand/cryptorebate-mark.svg`
- `web/public/images/brand/cryptorebate-wordmark.svg`
- `web/public/images/brand/cryptorebate-wordmark-dark.svg`
- `web/public/images/brand/cryptorebate-wordmark-monochrome.svg`

### App / icon assets
- `web/src/app/icon.svg`
- `web/src/app/apple-icon.svg`
- `web/src/app/favicon.ico`

### Live product integration
- `web/src/components/layout/header.tsx`
- `web/src/components/layout/footer.tsx`
- `web/src/app/[locale]/layout.tsx`
- `web/src/app/[locale]/opengraph-image.tsx`
- `web/src/app/[locale]/twitter-image.tsx`
- `web/src/components/seo/json-ld.tsx`
- `web/src/lib/constants.ts`

---

## 3. Default brand hierarchy

Current brand hierarchy is:

### Level 1 — Product name
- `CryptoRebate`

### Level 2 — Supporting tagline
- ZH: `先比返佣，再注册交易所`
- EN: `Compare rebates before you register`

### Level 3 — Brand positioning sentence
Use when longer explanation is needed:

#### ZH
CryptoRebate 是一个帮助用户在注册交易所之前，先比较返佣、手续费、邀请码与 KYC 条件的可信工具型产品。

#### EN
CryptoRebate is a trusted decision tool that helps users compare rebates, fees, invite codes, and KYC requirements before registering on a crypto exchange.

Rule:
- **Level 1 is the logo layer**
- **Level 2 is UI supporting copy**
- **Level 3 is explanatory copy / docs / social / metadata layer**

Do not merge all 3 into one crowded visual block.

---

## 4. Asset-by-asset usage

### 4.1 `cryptorebate-mark.svg`

**What it is**
- standalone icon-only brand mark
- compact brand recognition asset

**Use it for**
- very tight UI spaces
- avatar-like contexts
- icon support near text
- fallback small-size logo treatment
- places where full wordmark would be too long

**Typical good uses**
- compact mobile nav
- app-like badge use
- internal asset previews
- future favicon-adjacent previews

**Do not use it as the only brand asset when**
- the full brand should be clearly introduced
- a header has enough width for wordmark
- a footer is trying to feel product-grade and stable

**Rule of thumb**
- if space is small → use mark
- if trust/readability matters and space is available → prefer wordmark

---

### 4.2 `cryptorebate-wordmark.svg`

**What it is**
- primary horizontal lockup for light backgrounds

**This is the default brand asset for:**
- desktop header
- footer on light background
- docs screenshots
- product presentation surfaces
- brand handoff references

**Use it when**
- white or light background
- enough horizontal room
- brand clarity matters
- first impression needs to feel like a real product

**Current live usage**
- desktop header
- footer (light mode)

**Do not use it when**
- background is dark and contrast is weak
- width is too narrow
- favicon/app icon context

---

### 4.3 `cryptorebate-wordmark-dark.svg`

**What it is**
- horizontal lockup optimized for dark backgrounds

**Use it for**
- dark mode UI
- dark hero areas
- dark footer/header sections
- dark social card or mockup composition

**Current live usage**
- header dark mode
- footer dark mode

**Do not use it on**
- bright white background if the white wordmark loses edge definition

---

### 4.4 `cryptorebate-wordmark-monochrome.svg`

**What it is**
- single-color fallback / restricted-palette version

**Use it for**
- one-color situations
- print-like export
- emboss/stamp-like applications
- laser / etch / simplified output
- emergency fallback where full color is not allowed

**Do not use it as the default website header asset**
unless there is a deliberate visual reason.

---

### 4.5 `icon.svg`

**What it is**
- app icon / Next icon route asset
- primary browser tab / app-like icon expression

**Use it for**
- browser tab icon path
- app-like icon usage in site metadata
- pinned/share icon support where square icon format is expected

**Rule**
- treat this as an **icon system asset**, not a header logo replacement

---

### 4.6 `apple-icon.svg`

**What it is**
- Apple-specific icon variant

**Use it for**
- Apple touch icon path
- device shortcut / pinned web app cases

**Rule**
- do not manually swap it for random png exports unless required by platform behavior

---

### 4.7 `favicon.ico`

**What it is**
- legacy compatibility fallback

**Use it for**
- browser fallback only

**Rule**
- the active visual direction is now driven by `icon.svg`
- keep `favicon.ico` as compatibility support, not as the main design source of truth

---

## 5. Scenario mapping

### 5.1 Header

#### Desktop header
**Default:**
- `cryptorebate-wordmark.svg`
- dark mode → `cryptorebate-wordmark-dark.svg`

**Supporting copy:**
- optional muted tagline next to or under the logo

**Do not:**
- use only favicon-style icon if width is available
- place a long paragraph directly beside the logo

#### Mobile header
**Default:**
- `cryptorebate-mark.svg` + text brand name in UI

Reason:
- more flexible in tight width
- reduces compression risk
- easier to keep nav stable

---

### 5.2 Footer

**Default:**
- `cryptorebate-wordmark.svg`
- dark mode → `cryptorebate-wordmark-dark.svg`

**Supporting copy:**
- tagline allowed
- site description allowed

**Do not:**
- make the tagline visually louder than `CryptoRebate`
- over-stack too many brand elements in one cluster

---

### 5.3 Favicon / browser tab / pinned icon

**Default:**
- `icon.svg`
- `favicon.ico` as compatibility fallback

**Do not use:**
- horizontal wordmark
- long text
- tagline

---

### 5.4 Social preview / OG image / Twitter image

**Default behavior:**
- use generated social cards
- do not just drop the raw logo onto an empty background and call it done

**Current live files:**
- `web/src/app/[locale]/opengraph-image.tsx`
- `web/src/app/[locale]/twitter-image.tsx`

**Include in social card:**
- brand name
- core promise
- strong product-style visual hierarchy

**Do not include:**
- too many exchange logos
- noisy affiliate-style marketing graphics
- exaggerated promo language

---

### 5.5 SEO / metadata / structured data

**Brand text source**
- `web/src/lib/constants.ts`

**Metadata integration**
- `web/src/app/[locale]/layout.tsx`

**Structured data integration**
- `web/src/components/seo/json-ld.tsx`

**Rule**
- text branding and visual branding must stay aligned
- if tagline or description changes, review:
  - constants
  - metadata
  - OG/social card
  - JSON-LD

Do not update only one layer.

---

## 6. Copy usage rules

### Brand name
Always use:
- `CryptoRebate`

Do not randomly switch between:
- Crypto Rebate
- crypto rebate
- CRYPTOREBATE

except where casing is forced by technical or stylistic constraints.

### Tagline
Use exactly:
- ZH: `先比返佣，再注册交易所`
- EN: `Compare rebates before you register`

Do not invent multiple near-duplicate variants in product UI unless intentionally testing messaging.

### Positioning language
Prefer language like:
- trusted decision tool
- comparison-first
- fee savings
- rebate comparison
- compare before signup

Avoid language like:
- biggest cashback ever
- insane rewards
- moon savings
- low-quality affiliate/coupon tone

---

## 7. Design guardrails

### Keep
- blue as the trust anchor
- gold as a small accent only
- simple geometric silhouette
- product-grade restraint

### Avoid
- neon cyberpunk styling
- exchange-logo lookalikes
- token / meme-coin aesthetics
- casino / gambling energy
- chart-to-the-moon visuals
- overuse of glow/shadow/glass effects

### Practical visual test
Before approving any new use, ask:
1. Does this still look like a credible product?
2. Is the brand name still readable?
3. Would this be confused with an exchange logo or spammy affiliate page?
4. Does it still work at smaller sizes?

If any answer is weak, the usage is wrong.

---

## 8. Developer handoff rules

### If editing header/footer branding
Check all of these together:
- `web/src/components/layout/header.tsx`
- `web/src/components/layout/footer.tsx`
- light/dark asset pairing
- mobile vs desktop behavior

### If editing icons
Check all of these together:
- `web/src/app/icon.svg`
- `web/src/app/apple-icon.svg`
- `web/src/app/[locale]/layout.tsx`
- browser tab rendering after build

### If editing social brand presentation
Check all of these together:
- `web/src/app/[locale]/opengraph-image.tsx`
- `web/src/app/[locale]/twitter-image.tsx`
- `web/src/app/[locale]/layout.tsx`
- locale copy consistency

### If editing brand copy
Check all of these together:
- `web/src/lib/constants.ts`
- `web/messages/zh.json`
- `web/messages/en.json`
- metadata / OG / JSON-LD outputs

---

## 9. Minimum QA checklist

Before merging future brand edits, verify:

- [ ] desktop header looks correct in light mode
- [ ] desktop header looks correct in dark mode
- [ ] mobile header does not overflow
- [ ] footer brand block remains readable
- [ ] favicon/icon renders correctly
- [ ] OG image route works
- [ ] Twitter image route works
- [ ] zh/en wording remains aligned
- [ ] brand name casing is consistent
- [ ] build passes

Minimum required command:
- `npm run build`

---

## 10. Current working decision

For the current production phase, the rule is:

- **Desktop brand default:** horizontal wordmark
- **Mobile compact default:** icon mark + text
- **Tab/app icon default:** `icon.svg`
- **Social preview default:** generated OG / Twitter image routes
- **Fallback compatibility:** `favicon.ico`

This is the current source-of-truth usage model unless a later brand redesign explicitly replaces it.
