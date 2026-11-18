@AGENTS.md

Start with npm ci and npm run dev. Do not infer work from historical course material. Keep durable task notes in docs/tasks and review the actual diff before claiming completion.

## UI work is based on the local design system

**DoRoboty Design** is the application's design system (product owner's decision 2026-11-17; whole application converted 2026-11-18).

Read [docs/design-system/DOROBOTY-DESIGN.md](docs/design-system/DOROBOTY-DESIGN.md) first, then the copied skill [doroboty-design/SKILL.md](docs/design-system/doroboty-design/SKILL.md) and its [references](docs/design-system/doroboty-design/references/) (tokens with measured contrast, components, Polish copy rules). Pick the register before you draw: **Praca** for employer, budget holder and operator screens, **Komfort** for candidate and public pages.

Build from `src/design-system/` (tokens, bridge, base, controls, `praca.css`, `komfort.css`, `records.css`, `components.tsx`) and the shared primitives in `src/components/ui/`, which already render DoRoboty Design. Keep `src/design-system/tokens.css` byte-identical to the skill. Preserve hash routing, Zod, persona data, localStorage and the application/employer workflows. Label invented content PRZYKŁAD / DEMO, keep one primary button and one yellow current step per view, and render new screens at 1440px and 390px before claiming completion.

Poster People (docs/design-system/agent-kit and its guides) is retired and kept only as a historical reference; `npm run design-system:check` still verifies that archived kit. Do not build new UI from it.
