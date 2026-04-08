# UI Acceptance Checklist

Use this before calling a front-end task complete.

## Design inputs

- [ ] Repo `DESIGN.md` was reviewed
- [ ] Figma / screenshot / design notes were reviewed
- [ ] `web/design/` guidance was reviewed
- [ ] Existing components and tokens were preferred over one-off values
- [ ] External inspirations, if used, were translated rather than copied

## Visual quality

- [ ] Typography hierarchy is obvious
- [ ] Spacing is consistent
- [ ] Alignment feels intentional
- [ ] No accidental clipping or overflow is visible
- [ ] CTA emphasis and trust/risk messaging feel balanced

## States

- [ ] Loading state exists where data waits
- [ ] Empty state exists where no data is plausible
- [ ] Error state exists where failures are plausible
- [ ] Hover state is defined where feedback matters
- [ ] Focus-visible state is obvious
- [ ] Disabled state looks intentional

## Responsive behavior

- [ ] Checked at 375 width
- [ ] Checked at 768 width
- [ ] Checked at 1024 width
- [ ] Checked at 1440 width
- [ ] No unexpected horizontal scrolling

## Accessibility

- [ ] Interactive controls are keyboard reachable
- [ ] Focus order is reasonable
- [ ] Contrast is acceptable for primary content and controls

## Verification

- [ ] Browser verification was run
- [ ] Console errors were checked
- [ ] Remaining visual gaps, if any, are documented
- [ ] Handoff was refreshed when the task spans sessions or tools
