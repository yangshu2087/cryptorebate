# 007 CryptoRebate Repository Guide

## Purpose

- This repository combines product docs, SEO/GEO automation assets, and the real Next.js front-end app under `web/`.
- Treat the git root as the source of truth for history, automation state, and release workflow.
- Treat `web/` as the primary front-end implementation surface.

## Working rules

- Before changing code, identify whether the task is:
  - repository-level automation or content work
  - front-end work inside `web/`
- For front-end work, read `web/AGENTS.md`, `docs/agent-handoff.md`, and the checked-in design guidance before implementation.
- Do not casually rewrite generated files under `web/src/data/generated/`; these often change from automation runs and may already be dirty for unrelated reasons.
- Keep front-end design inputs checked in under `web/design/` so Codex, Cursor, and humans share the same source artifacts.
- Use short-lived branches for meaningful changes and avoid direct pushes to `main`.
- Prefer the local wrapper `./scripts/handoff-refresh.sh` to refresh handoff metadata without overwriting the human summary sections.

## Front-end design workflow

- Start from the best available design source:
  - Figma
  - checked-in design docs
  - screenshots
  - Stitch / AI Studio artifacts
- For UI tasks, read:
  - `web/design/README.md`
  - `web/design/design-system.md`
  - `web/docs/ui-acceptance-checklist.md`
- Prefer existing components, Tailwind tokens, and local UI patterns over one-off visual values.
- Verify important UI work in a browser at multiple widths before calling it complete.

## Verification

- Always run `git status --short` after edits.
- For front-end-only changes, prefer narrow verification from `web/` such as the smallest lint, test, or browser check that proves the changed path still works.

## DESIGN.md workflow

- Keep repository-level `DESIGN.md` as the source of truth for look-and-feel constraints used by AI agents.
- For front-end tasks, read `DESIGN.md` before implementation and follow its token, component, state, and responsive rules.
- If the repo has a web app (for example `web/` or `apps/web/`), also read that web app's `DESIGN.md` and `docs/ui-acceptance-checklist.md`.
- Do not clone third-party brand styles directly from public references; adapt with project-approved tokens and product intent.
- Before finalizing UI work, run narrow code checks and at least one browser visual verification pass.
