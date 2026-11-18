# Next-draft approval and publication flow (AIPH3 test of ideas A + B)

## Intent

Let an employer who returns about 65 days after a single job ad, with a draft of the next ad, move that draft to a paid publication when the purchase needs someone else's approval. The prototype is test material for the course opportunity "the employer starts the next ad but does not pay" (ideas A: approval request, B: blocker and decision date). It is not evidence that repeat purchases increase.

## Scope

- Routes: `/#/app/oferty/:id/publikacja` (employer), `/#/zgoda/:token` (approver, outside the workspace shell), changed editor and job list, reminder on `/#/app`.
- State: optional `publicationResults` and `purchaseFlows` arrays (default `[]`, so version-1 saves and imports still parse). Actions: `save_job_draft`, `draft_reason`, `move_date`, `request_approval`, `request_opened`, `request_decision`, `decision_day`, `pay_and_publish`.
- Seed: BrightLabs (Karolina) and Northstar Health (Tomasz) each have an expired previous ad and a draft. Previous results are aggregates of real rows in the AIPH3 case CSV files (strong: co-001185 / pur-002374, 35 applications, 6 interviews, 5 continued, median 2.5 days to first contact; weak: co-000930 / pur-002304, 37 / 5 / 0 / 2.5). Dates are relative to the scenario reset.
- Design (changed 2026-11-17 at the product owner's request): DoRoboty Design, register "Praca" (see `docs/design-system/DOROBOTY-DESIGN.md`). Tokens pasted verbatim into `src/design-system/tokens.css`; components in `src/design-system/praca.css` and `components.tsx`. Converted along the test path: employer shell (ink app bar with mark + wordmark, light sidebar), Pulpit, Ogłoszenia, job editor, draft publication page, both dialogs and the approver page. The first Poster People version of the flow (`src/app/purchase.css`) was removed.

## Acceptance criteria

1. Saving a new or draft job offers "Zapisz draft" and "Opublikuj i zapłać"; editing a published job is unchanged.
2. After "Zapisz draft" a named dialog asks for the blocker and the decision date; "Pomiń" closes it without data.
3. "Poproś o zgodę" creates a link; the approver page shows previous result, draft preview and price, records opening, and accepts approve or decline with a required reason.
4. The recruiter's open tab shows the decision without reload.
5. On the decision day (or after the prototype-only simulation) overview and job list show a reminder with publish-and-pay and move date.
6. Payment is clearly simulated; it publishes for 30 days and cannot be repeated.
7. No horizontal overflow at 390px; dialogs are named and close on Escape; result headings receive focus after decisions.

## Evidence (2026-11-17, after the DoRoboty Design conversion)

- `npm run typecheck`, `npm run lint`, Prettier on changed files, `npm test` (30 tests, 3 for this flow): pass.
- Scripted walk with Playwright on the installed Google Chrome (no browser download) at 1440px and 390px: dashboard → job list → editor → "Zapisz draft" → reason dialog → request → approver approves in a second tab → recruiter tab synced → simulated decision day → reminder on Pulpit → payment dialog → published; Northstar variant declined with a reason. No page errors and no horizontal overflow on any of the 22 screenshots (kept in the product owner's vault, not in the repo).
- Browser journeys (`tests/e2e`, all 37) run locally with a temporary Playwright config using `channel: "chrome"` (installed Google Chrome; Playwright Chromium is still not provisioned): 35 passed, 2 failed. Both failures are the persona PDF tests: the system Chrome PDF viewer loads `chrome-extension://…/index.html`, which the test counts as an external request. Not caused by this change (not re-run on `main` to confirm). The 3 new journeys and the updated publish journey pass. `./scripts/verify` was not run as a whole.
- Known deviations from DoRoboty Design: Inter is not bundled (fallback Segoe UI Variable); Base UI select popups are still Poster People styled; Kandydaci / Organizacja / Ustawienia content inside the new shell is not converted; no "Wycofaj wniosek" action (no withdraw logic); dialog B keeps the experiment label "Przypomnij mi tego dnia" instead of the skill's "Zapisz draft".
- Not done: separate review pass, 320px and keyboard-only pass on every control.
