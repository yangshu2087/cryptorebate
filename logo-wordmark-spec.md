# CryptoRebate Horizontal Wordmark Spec

## 1. Purpose

This document defines the **horizontal wordmark lockup** for CryptoRebate so the team can use a consistent brand treatment across:

- website header
- footer
- social previews
- design handoff
- favicon/icon system support
- future app / dashboard surfaces

This is not the final forever brand system, but it is the **working production spec** for the current phase.

## 2. Source assets

Primary assets live here:

- `web/public/images/brand/cryptorebate-mark.svg`
- `web/public/images/brand/cryptorebate-wordmark.svg`
- `web/public/images/brand/cryptorebate-wordmark-dark.svg`
- `web/public/images/brand/cryptorebate-wordmark-monochrome.svg`

Related app icons:
- `web/src/app/icon.svg`
- `web/src/app/apple-icon.svg`

## 3. Strategic role of the wordmark

The icon answers:
- return path
- rebate
- savings back

The horizontal wordmark adds:
- product legitimacy
- readability in nav/header contexts
- stronger memory through a stable full brand name
- a more SaaS/product-like feel compared with icon-only usage

In short:

> icon = recognition
> wordmark = trust + readability

## 4. Structure

The horizontal wordmark has 2 parts:

1. **Brand mark**
   - rounded-square blue tile
   - white inner return-path form
   - gold accent arrow

2. **Wordmark**
   - one-line `CryptoRebate`
   - dark slate text on light background
   - white text on dark background
   - no decorative effects

## 5. Production variants

### 5.1 Primary full-color
Use:
- `cryptorebate-wordmark.svg`

Best for:
- white / light background
- website header
- docs
- product screenshots

### 5.2 Dark-background version
Use:
- `cryptorebate-wordmark-dark.svg`

Best for:
- dark UI
- dark hero section
- dark social card

### 5.3 Monochrome version
Use:
- `cryptorebate-wordmark-monochrome.svg`

Best for:
- 1-color print
- stamp / emboss style use
- restricted palette environments
- fallback situations

## 6. Color guidance

### Primary colors
- Brand blue: `#0A6CFF`
- Deep brand blue: `#004AC2`
- Accent gold: `#F6C343`
- Wordmark ink: `#0F172A`
- White: `#FFFFFF`

### Color rules
- Do not recolor the icon casually.
- Do not use gradient text for the wordmark.
- Accent gold should remain small and functional.
- If only one color is allowed, use the monochrome asset instead of manually recoloring the full-color file.

## 7. Typography logic

The current SVG wordmark is outlined for consistency and portability.

Typography intent:
- modern
- readable
- product-grade
- slightly tight and efficient
- not futuristic, not playful

Practical rule:
- when using the official SVG, **do not rebuild the wordmark manually in random fonts**
- if later translated into a live text logo system, choose a clean sans with strong UI legibility and restrained personality

## 8. Spacing and clear space

Define `X` as the width of the gold arrow stroke cap thickness, approximated visually from the mark.

Minimum clear space around the full horizontal wordmark:
- top: `1.5X`
- bottom: `1.5X`
- left: `1.5X`
- right: `1.5X`

Practical product simplification:
- in navbar usage, keep at least **12px vertical breathing room**
- do not place other icons, badges, or CTA buttons flush against the logo

## 9. Minimum sizes

### Web header
- recommended width: `176px–220px`
- do not go below `148px` width for the full horizontal wordmark

### Footer
- recommended width: `180px–240px`

### Social / docs
- recommended width: `220px+`

### Tiny contexts
- below `148px`, prefer:
  - icon-only mark
  - or icon + text stack handled in UI

Important:
- do not force the full wordmark into favicon use
- favicon should remain icon-only

## 10. Usage rules

### Use the horizontal wordmark when:
- introducing the brand in header / footer
- the full name should be seen clearly
- trust and legitimacy matter more than compactness
- in docs, product handoff, or design presentation

### Use the icon-only mark when:
- favicon
- app icon
- very tight mobile space
- avatar-like usage
- decorative support usage

## 11. Do / Don’t

### Do
- use official SVG assets
- choose the correct light/dark variant
- preserve aspect ratio
- keep the mark and wordmark together as provided
- use icon-only mark when space is tight

### Don’t
- stretch horizontally or vertically
- recolor text and icon independently without a brand reason
- add shadows, glows, bevels, glass effects, or neon styling
- rotate the icon
- separate the gold arrow into an independent decorative element
- rebuild the wordmark with arbitrary fonts in production UI

## 12. Current recommended product behavior

### Header
- desktop: prefer horizontal wordmark
- mobile: icon + text stack is acceptable if space is constrained

### Footer
- use horizontal wordmark or icon + brand text block
- keep tagline secondary, not louder than the brand name

### SEO / social
- site title remains text-first
- social previews may use icon-only or wordmark depending on composition

## 13. Relationship to tagline

Current tagline:
- ZH: `先比返佣，再注册交易所`
- EN: `Compare rebates before you register`

Rules:
- tagline is **supporting copy**, not part of the core logo artwork
- do not fuse the tagline permanently into the SVG wordmark
- in header/footer, tagline may appear as adjacent UI text, smaller and muted

## 14. Recommended next step

If the project continues into a more formal design phase, the next brand package should add:
- a true designer-crafted wordmark
- kerning refinement
- dark/light lockup review
- social card compositions
- usage sheet with examples
- a compact secondary lockup
- a brand token file for Figma/dev

## 15. Working decision

For the current production phase, the decision is:

> Use the horizontal wordmark as the default brand lockup in spacious web contexts, and keep the icon-only mark for favicon and compact placements.
