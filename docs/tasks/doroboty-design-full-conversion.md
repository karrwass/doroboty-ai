# Convert the whole application to DoRoboty Design

## Intent

The product owner chose DoRoboty Design (skill `doroboty-design`, copied to `docs/design-system/doroboty-design/`) as the application's design system. The employer test path was converted on 2026-11-17 (`draft-approval-flow.md`). This task converts every remaining screen and retires Poster People.

## Scope

- Foundation: `src/design-system/bridge.css` maps the old host token names (`--gui-*`, shadcn roles) to DoRoboty Design tokens; `base.css` (document base, focus, skip link) and `controls.css` (inputs, checkbox, select, extra button variants). Button, Input, Textarea and Checkbox primitives render DS classes.
- Register Komfort (`komfort.css`): light top bar with category stripe, footer, `Page` column, offer card with band and logo tile, safety line, match explanation frame, section icon tiles, rows, job card, listing (search, category buttons, filters, chips, pagination, map), mobile filter sheet, sticky action bar, success burst recoloured to the category pool.
- Records (`records.css`): application record with underlined tabs, process history, CV row and preview, neutral Match Score tag.
- Screens: home, listing, offer, company, methodology, privacy, person picker, not found, candidate account/profile/saved/apply/applications/detail, settings, employer Kandydaci/detail/Organizacja/Ustawienia, operator case page, confirmation dialog.
- Removed: Poster People host styles (`src/app/*.css` except `globals.css`), the Timeless fonts, the robot brand mark. Favicon is the DoRoboty mark. The immutable `docs/design-system/agent-kit` stays as a historical reference.
- Guidance: AGENTS.md, CLAUDE.md, GUI.md, README.md, BRIEF.md, `docs/design-system/DOROBOTY-DESIGN.md`, FEATURES.md.
- Tests: Poster People geometry journeys replaced with DoRoboty Design assertions (one-column offer, warm Komfort canvas, Inter family, 32/27px Komfort titles, 30px tabular amounts, 16px Komfort cards, indigo pill primary, one yellow step, section below the sticky bar); behaviour journeys unchanged except labels that moved.

## Acceptance criteria

1. No route renders Poster People styles; every screen uses one of the two registers.
2. Behaviour, routes, labels used by assistive technology and stored data are unchanged.
3. No horizontal overflow at 390px; long unbroken content wraps in records.
4. Unit tests and browser journeys pass, except environment-only failures that are documented.

## Evidence (2026-11-18)

- `npm run typecheck`, `npm run lint`, Prettier on changed files, `npm test` (30): pass.
- Browser journeys (37) with a local Playwright config using the installed Google Chrome (`channel: "chrome"`; Playwright Chromium is not provisioned): 35 passed. The 2 failures are the persona PDF tests: Chrome's built-in PDF viewer loads `chrome-extension://…`, which the test counts as an external request; same result before this change.
- Scripted screenshots of 21 screens plus menu, filter sheet, filtered listing and confirmation dialog at 1440px and 390px: no page errors, no horizontal overflow.
- Documented deviations: see `docs/design-system/DOROBOTY-DESIGN.md` (font not bundled, wider listing, top-bar breakpoint, neutral Match Score, kept confetti).
- Not done: separate review pass, full keyboard-only walk of every screen, `./scripts/verify` as a whole (`design-system:check` and `verify:packet` fail on CRLF checkouts already on `main`).
