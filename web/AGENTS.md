# CryptoRebate Web Front-end Guide

## Purpose

- `web/` is the production Next.js front-end for CryptoRebate.
- Optimize for trustworthy, polished, multilingual product UI rather than generic demo styling.

## Read order

Before continuing existing UI work, read these files in order:

1. `../AGENTS.md`
2. `../DESIGN.md`
3. `AGENTS.md`
4. `DESIGN.md`
5. `design/README.md`
6. `design/design-system.md`
7. `docs/ui-acceptance-checklist.md`
8. `../docs/agent-handoff.md`

## Working rules

- Prefer the existing stack:
  - Next.js App Router under `src/app/`
  - Tailwind CSS v4
  - shadcn/ui
  - next-intl
- Keep route, layout, metadata, and page-level composition changes in `src/app/`.
- Keep reusable UI and section-level components in `src/components/`.
- Keep formatting, helper logic, and UI glue in `src/lib/`.
- Treat `src/data/generated/` as automation-owned unless the task is explicitly about the generation pipeline.
- Store Figma links in `design/figma-links.md` and keep screenshots, Stitch/AI Studio exports, and design notes under `design/`.
- Reuse existing components and utility patterns before introducing one-off markup or ad hoc classes.
- If you use external inspiration, translate it into local tokens/components and record the chosen references in `design/README.md` or `../docs/agent-handoff.md`.
- Treat visual states as part of the implementation:
  - loading
  - empty
  - error
  - hover
  - focus-visible
  - disabled
- For responsive UI work, check at 375, 768, 1024, and 1440 widths when feasible.
- Use `../scripts/handoff-refresh.sh` before pausing when design work is in progress.
- For regular UI review, prefer `npm run ui:review` so lint, tests, and handoff refresh stay aligned.

## Verification

- Run the smallest useful web verification from `web/`:
  - `npm run lint` for most component and style edits
  - `npm run test` when UI logic or helpers changed
  - `npm run build` when routes, layouts, metadata, or rendering boundaries changed
  - `npm run ui:review` for the default review path before handoff or PR
- If the change is visual, prefer browser verification over static code inspection alone.
- If browser verification is skipped, state the gap explicitly in the handoff or PR summary.

## Completion standard

Before declaring UI work done, summarize:

1. what design inputs were used
2. what external inspirations were used, if any
3. which states and breakpoints were checked
4. what remains visually unverified

## DESIGN.md workflow

- Keep repository-level `DESIGN.md` as the source of truth for look-and-feel constraints used by AI agents.
- For front-end tasks, read `DESIGN.md` before implementation and follow its token, component, state, and responsive rules.
- If the repo has a web app (for example `web/` or `apps/web/`), also read that web app's `DESIGN.md` and `docs/ui-acceptance-checklist.md`.
- Do not clone third-party brand styles directly from public references; adapt with project-approved tokens and product intent.
- Before finalizing UI work, run narrow code checks and at least one browser visual verification pass.
