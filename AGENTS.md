# 007 CryptoRebate Repository Guide

## Purpose

- This repository combines product docs, SEO/GEO automation assets, and the real Next.js front-end app under `web/`.
- Treat the git root as the source of truth for history, automation state, release workflow, and shared agent handoff.
- Treat `web/` as the primary front-end implementation surface.

## Working rules

- Before changing code, identify whether the task is:
  - repository-level automation or content work
  - front-end work inside `web/`
- For front-end work, read in this order before editing:
  1. `DESIGN.md`
  2. `web/AGENTS.md`
  3. `web/design/README.md`
  4. `web/design/design-system.md`
  5. `web/docs/ui-acceptance-checklist.md`
  6. `docs/agent-handoff.md`
- Keep UI-only changes inside `web/` unless the task explicitly requires repo-level docs, deployment wiring, or automation updates.
- Do not casually rewrite generated files under `web/src/data/generated/`; these are automation-owned and may already be dirty for unrelated reasons.
- Keep front-end design inputs checked in under `web/design/` so Codex, Cursor, and humans share the same source artifacts.
- If you use external inspirations, record the chosen 1-2 references plus the translated local rule change in `web/design/README.md` or `docs/agent-handoff.md`.
- Use short-lived branches for meaningful changes and avoid direct pushes to `main`.
- Prefer the local wrapper `./scripts/handoff-refresh.sh` to refresh handoff metadata without overwriting the human summary sections.

## Front-end implementation lanes

- `web/src/app/` — routes, layouts, metadata, and top-level page composition.
- `web/src/components/` — reusable UI primitives plus feature sections.
- `web/src/lib/` — formatting, helpers, UI logic, and integration glue.
- `web/src/data/` — content and automation-fed datasets; treat `generated/` as automation-owned unless the task is explicitly about generation.

## Front-end workflow

- Start from the best available design source:
  - Figma
  - checked-in design docs
  - screenshots
  - Stitch / AI Studio artifacts
- For UI tasks, prefer this implementation loop:
  1. read the design sources listed above
  2. identify the narrowest path in `web/src/` that owns the change
  3. implement with existing components/tokens before adding one-off values
  4. run narrow code checks
  5. run browser verification at 375 / 768 / 1024 / 1440 when layout or interaction changed
  6. refresh `docs/agent-handoff.md` before pausing
- Prefer existing components, Tailwind tokens, and local UI patterns over one-off visual values.

## Verification

- Always run `git status --short` after edits.
- For front-end-only changes, verify from `web/` with the narrowest useful command:
  - `npm run lint` for component or styling edits
  - `npm run test` for UI logic, formatting, or rendering helpers
  - `npm run ui:review` for the common lint + test + handoff path
  - `npm run build` when routing, metadata, localization, or data shaping could affect rendering
- Before calling UI work complete, document which design inputs were used, which breakpoints were checked, and any remaining visual gaps.

## DESIGN.md workflow

- Keep repository-level `DESIGN.md` as the source of truth for look-and-feel constraints used by AI agents.
- For front-end tasks, read `DESIGN.md` before implementation and follow its token, component, state, and responsive rules.
- If the repo has a web app (for example `web/` or `apps/web/`), also read that web app's `DESIGN.md` and `docs/ui-acceptance-checklist.md`.
- Do not clone third-party brand styles directly from public references; adapt with project-approved tokens and product intent.
- Before finalizing UI work, run narrow code checks and at least one browser visual verification pass.
