# Working on DoRoboty.ai Case

This is an AIPH3 teaching prototype, separate from the public production portal.
Read BRIEF.md, docs/case/CASE_PROTOCOL.md, TODO.md and relevant FEATURES.md entries before product work.

## Start and boundaries

- Participant setup: Node.js 24, npm ci, npm run dev (http://127.0.0.1:3001).
- Role selection is a simulation, not security.
- Share plain Zod schemas between forms and domain operations.
- Preserve human editing and approval. Use synthetic data only.
- Keep historical case evidence separate from prototype state. Include only baseline in participant packages; source history and instructor materials must not be distributed.

## Workflow

1. Record intent and acceptance criteria in docs/tasks/ for changes larger than one line.
2. Do not let multiple agents write in one worktree.
3. Implement and run ./scripts/verify before claiming completion; explain actual failures.
4. Perform a separate review pass before merging. Record durable lessons when useful.

## Product behavior register

FEATURES.md describes current behavior, not a roadmap. Update it in the same change/commit for added, changed, removed or simulated flows. Preserve stable IDs, route/role/data boundaries and source/test references. Do not equate source coverage with an executed test or deployment. For changes without behavioral impact, record that the register was reviewed and did not need updating.

## Required design system

**DoRoboty Design** is the application's design system (product owner's decision 2026-11-17; whole application converted 2026-11-18).

Read [docs/design-system/DOROBOTY-DESIGN.md](docs/design-system/DOROBOTY-DESIGN.md) first, then the copied skill [doroboty-design/SKILL.md](docs/design-system/doroboty-design/SKILL.md) and its [references](docs/design-system/doroboty-design/references/) (tokens with measured contrast, components, Polish copy rules). Pick the register before you draw: **Praca** for employer, budget holder and operator screens, **Komfort** for candidate and public pages.

Build from `src/design-system/` (tokens, bridge, base, controls, `praca.css`, `komfort.css`, `records.css`, `components.tsx`) and the shared primitives in `src/components/ui/`, which already render DoRoboty Design. Keep `src/design-system/tokens.css` byte-identical to the skill. Preserve hash routing, Zod, persona data, localStorage and the application/employer workflows. Label invented content PRZYKŁAD / DEMO, keep one primary button and one yellow current step per view, and render new screens at 1440px and 390px before claiming completion.

Poster People (docs/design-system/agent-kit and its guides) is retired and kept only as a historical reference; `npm run design-system:check` still verifies that archived kit. Do not build new UI from it.

## Standards

- Code, comments and authored engineering documentation are English; end-user UI and canonical AIPH source wording are Polish.
- Use npm, Node.js 24 and package-lock.json. No second package manager.
- Features belong in src/features; src/components/ui contains shared Base UI primitives.
- For UI changes follow docs/design-system/DOROBOTY-DESIGN.md and reuse src/design-system/ with the existing Base UI primitives and render composition API. Do not restore Poster People styles or require global design skills.
- Use React Router hash routes.
- Never log private free text or introduce secrets into the frontend.

## Validation

- npm run check verifies formatting, lint, types, unit tests, static build and browser journeys. ./scripts/verify runs the same gate.
- npm run dev never installs browser binaries or system tools. Browser tests require a provisioned Playwright Chromium; if missing, report it. Do not install OS dependencies automatically.
- Check mobile/desktop, keyboard access, error states and data recovery.
- Report what actually ran. Local checks do not prove CI, publishing or human approval.
