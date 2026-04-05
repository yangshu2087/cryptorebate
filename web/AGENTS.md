# CryptoRebate Web Front-end Guide

## Purpose

- `web/` is the production Next.js front-end for CryptoRebate.
- Optimize for trustworthy, polished, multilingual product UI rather than generic demo styling.

## Working rules

- Read the repo root `AGENTS.md` first, then this file, then `../docs/agent-handoff.md` before continuing existing work.
- Read `design/README.md`, `design/design-system.md`, and `docs/ui-acceptance-checklist.md` before substantial UI changes.
- Prefer the existing stack:
  - Next.js App Router
  - Tailwind CSS v4
  - shadcn/ui
  - next-intl
- Keep active Figma references in `design/figma-links.md` for the current UI task.
- Reuse existing components and utility patterns before introducing one-off markup or ad hoc classes.
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

- Run the smallest useful web verification from `web/`.
- If the change is visual, prefer browser verification over static code inspection alone.

## DESIGN.md workflow

- Keep repository-level `DESIGN.md` as the source of truth for look-and-feel constraints used by AI agents.
- For front-end tasks, read `DESIGN.md` before implementation and follow its token, component, state, and responsive rules.
- If the repo has a web app (for example `web/` or `apps/web/`), also read that web app's `DESIGN.md` and `docs/ui-acceptance-checklist.md`.
- Do not clone third-party brand styles directly from public references; adapt with project-approved tokens and product intent.
- Before finalizing UI work, run narrow code checks and at least one browser visual verification pass.
