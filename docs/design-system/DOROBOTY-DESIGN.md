# DoRoboty Design — the application's design system

**DoRoboty Design is the design system of this application** (decision of the product owner, 2026-11-17; whole application converted 2026-11-18). Poster People is retired: its host styles were removed from `src/`, and `agent-kit/` plus the Poster People guides (`README.md`, `IMPLEMENTATION.md`, `HOST-COMPONENTS.md`, `RECORDS.md`, `VERIFICATION.md`, `STATUS.md`) are kept only as a historical reference. Do not build from them.

## Where it lives

| Material                                                                                        | Location                                                                                           |
| ----------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| Rules (copied from the product owner's skill `doroboty-design`, 2026-11-13; private paths→repo) | [doroboty-design/SKILL.md](doroboty-design/SKILL.md)                                               |
| Tokens with measured contrast, components, Polish copy rules                                    | [doroboty-design/references/](doroboty-design/references/)                                         |
| Tokens in code (verbatim `:root` block + register switch)                                       | [src/design-system/tokens.css](../../src/design-system/tokens.css)                                 |
| Bridge from the old host token names (`--gui-*`, shadcn roles) to the tokens                    | [src/design-system/bridge.css](../../src/design-system/bridge.css)                                 |
| Document base, form controls                                                                    | [base.css](../../src/design-system/base.css), [controls.css](../../src/design-system/controls.css) |
| Register "Praca" components (app bar, sidebar, cards, ledger, dialogs, buttons)                 | [src/design-system/praca.css](../../src/design-system/praca.css)                                   |
| Register "Komfort" (top bar + stripe, offer card, band, match frame, job cards, listing)        | [src/design-system/komfort.css](../../src/design-system/komfort.css)                               |
| Application record, CV row, process history, Match Score                                        | [src/design-system/records.css](../../src/design-system/records.css)                               |
| React parts: brand mark, step bar, status pill, amount, category tag, dialog, sticky actions    | [src/design-system/components.tsx](../../src/design-system/components.tsx)                         |

`tokens.css` and the copied skill are excluded from Prettier. `tokens.css` stays byte-identical to the source; the copied skill matches it except that references to the product owner's private notes and folders were replaced with paths in this repository (2026-11-18). Shared primitives in `src/components/ui/` (Button, Input, Textarea, Checkbox, Select) render DoRoboty Design classes, so `variant="default"` is the indigo primary and `variant="outline"` the secondary.

## Registers

- **Praca** — recruiter, budget holder, operator: ink app bar with the mark and wordmark, light sidebar, cool canvas, light headings, indigo action, one yellow "current step" per view. Root: `.ds .ds-canvas`.
- **Komfort** — candidate and public pages: light top bar with the category stripe, warm canvas, bold headings, one column ≤ 720px (`Page`), warm tags, one decorative band, one match frame, safety line under the main action. Root: `.ds .reg-komfort`.

| Route                                                                                                                 | Register |
| --------------------------------------------------------------------------------------------------------------------- | -------- |
| `/`, `/#/oferty`, `/#/oferty/:slug`, `/#/firmy/:slug`, `/#/metodologia`, `/#/polityka-prywatnosci`, `/#/auth/sign-in` | Komfort  |
| Candidate workspace: `/#/app`, profile, saved, `/#/aplikuj/:slug`, applications and detail, settings                  | Komfort  |
| Employer workspace: Pulpit, Ogłoszenia, editor, draft publication, Kandydaci and detail, Organizacja, Ustawienia      | Praca    |
| `/#/zgoda/:token` approval request (budget holder)                                                                    | Praca    |
| Operator: `/#/app/case`, settings                                                                                     | Praca    |

## Documented deviations

- **Font:** Inter is not bundled (downloading it needs the product owner's approval); the token stack falls back to Segoe UI Variable / system UI.
- **Listing width:** the job listing and home use a 1120px container with a filter column; the skill's Komfort rule is one 720px column. Offer, application and account pages keep 720px.
- **Komfort top bar** collapses to the Menu button at ≤ 960px (the skill says ≤ 720px) because candidate navigation has six links.
- **Match Score** is a neutral tag with the text-similarity caption; the previous colour bands were removed (colour must not carry meaning alone, and a score is not a status).
- **Success confetti** (earlier host request) is kept, recoloured to the category pool and the action colour.

## Rules for new and changed UI

1. Read `doroboty-design/SKILL.md` and its references before coding; pick the register first.
2. Wrap pages in `Page` (Komfort column) or rely on the Praca shell; portalled UI carries `.ds` itself (`DsDialog`, `ConfirmDialog`, filter sheet).
3. Reuse `src/design-system/` parts and classes; add a part there before repeating markup in a feature.
4. Label invented content `PRZYKŁAD` / `DEMO` and put a source caption under case numbers.
5. Render at 1440px and 390px and look at the screenshots before claiming a screen is done.
