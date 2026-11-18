---
name: doroboty-design
description: Design or build any new DoRoboty.ai screen, component or flow in the agreed visual style (direction A + D, registers "Praca" and "Komfort"). Use whenever the human asks for a DoRoboty.ai screen, mockup, prototype view, email or printable page for employers, budget holders or candidates, or asks to review a screen against the design system.
---

# DoRoboty Design

Design new DoRoboty.ai screens so they look and behave as if one team made all of them. The rules below are the agreed design system. They come from the visual-direction research of 2026-11-13.

Write all UI copy in Polish. Talk to the human in the language they use.

## How to invoke

- "Zaprojektuj ekran …", "zrób widok …", "dodaj stronę dla kandydata …" for DoRoboty.ai
- Any prototype screen in this repository (`src/features/`)
- "Czy ten ekran trzyma się design systemu?"

## Before you design

1. Read `AGENTS.md` and `BRIEF.md`. DoRoboty.ai is a fictional training case. Every invented number, company or person on a screen is labelled `PRZYKŁAD` or `DEMO`, and every number taken from the case carries a source caption.
2. Check the newest decisions in `docs/decisions/` and task notes in `docs/tasks/`. A newer decision overrides this skill. If it does, say so and follow the decision.
3. **Pick the register.** Write it down before you draw anything:
   - **Praca**: recruiter, budget holder, admin. The goal is focus on a task.
   - **Komfort**: candidate. The goal is comfort and safety.
   - A screen seen by both (for example the job ad preview inside a purchase request) uses the register of the person **looking at it now**. The component inside stays identical.
4. Name the one job of the screen in one sentence ("Decydent zatwierdza albo odkłada publikację"). If you need two sentences, the screen does two jobs, so split it.

Load `references/tokens.md` for the exact values and `references/components.md` for component anatomy before writing code. `references/copy.md` holds the Polish wording rules.

## Core rule: one grammar, two doses

Both registers share the same skeleton, type family, numbers, statuses, buttons and components. **Komfort is Praca plus a measured dose of warmth.** It never adds new components or new logic. If you catch yourself inventing a candidate-only component, stop and check `references/components.md` first.

| | Praca | Komfort |
|---|---|---|
| Canvas | cool `--canvas` `#F6F6F8` | warm `--canvas-warm` `#F8F5EF` |
| Card radius | 12px | 16px |
| Page title | 28px / weight 380 | 32px / weight 700, −0.02em |
| Body | 15–16px | 16–17px, line-height 1.6 |
| Row height | ~48px | ~56px |
| Pastels | only inside category tags and status pills | category tags, one icon tile per section, decorative band |
| Gradient frame | never | at most one per screen, only for the match explanation |
| Brand bar | dark app bar (ink), see "Brand" | light top bar + 3px category stripe |
| Navigation | left sidebar under the app bar | top bar, single content column ≤ 720px |

## Brand: the user always knows where they are

The brand is never a bare word. It is always **the mark + the wordmark**, in a bar that contrasts with the content. Decided 2026-11-13 after the skill test, where a plain „DoRoboty.ai” in the sidebar looked bare.

- **The mark:** three horizontal bars of decreasing length (Build, Apply, Lead), inherited from the landing page. SVG viewBox 0 0 24 24, bars `x=2` at `y=4/10/16`, widths `20/14/8`, height 4, `rx=1`. Shown at 22–24px. On dark surfaces the bars take `--cat-1/2/3`; on light surfaces they are ink. The mark is never recoloured otherwise and never shown without the wordmark in a header.
- **The wordmark:** „DoRoboty” 700, 19px, −0.02em + „.ai” in a quieter tone (`--on-dark-2` on dark, `--ink-3` on light). It is not in the action colour, because indigo means "clickable action".
- **Praca, the app bar:** full width, 56px, `--brand-bar` (ink) background, sticky at the top. From left to right: mark + wordmark, a thin divider, the product name („Panel firmy”, „Panel decydenta”), then on the right the company switcher (a pill on `rgba(255,255,255,.1)`) and the account avatar (initials on `--cat-2`). The sidebar sits **below** the bar, stays light and holds only navigation. The company name lives in the bar, not in the sidebar.
- **Mobile Praca:** the same ink bar, 56px: mark + wordmark on the left, a „Menu” button with a white outline on the right. The product name and company move into the menu.
- **Komfort:** a light top bar (`--surface`, 64px; 56px on mobile, sticky) with the mark in ink and the wordmark, then a 3px stripe under it in the three category accents (`--brand-stripe`). Navigation sits in the bar (active item `--action-soft`), and the account sits on the right. It is calmer than the work bar but still branded. Tested on the candidate offer screen on 2026-11-13.
- Printable or e-mailed documents (the purchase request): mark + wordmark at the top left in ink, no dark bar.
- Reference implementations (read the one for your register before coding): Praca `src/design-system/praca.css`, Komfort `src/design-system/komfort.css`.

## Colour: every colour has one job

- **Neutral by default.** Text is ink on white or canvas. If a colour does not mean something specific, it does not appear.
- **Action = indigo `#3446B8`.** Primary buttons and links only. Never decoration, never a background area.
- **"Jesteś tutaj" = yellow `#FFE27A` with a 2px inset `#F2C200` edge.** Exactly one yellow element per view: the current step of a process (step bar). Never a button, never a large area, never a tab.
- **Active navigation item** (sidebar or top bar) is `--action-soft` fill + ink text at 600, not yellow. This keeps the single yellow free for the process step. (Changed on 2026-11-13 after the skill test: the earlier "yellow for nav" collided with the step bar.)
- **Status colours:** positive green, waiting or overdue rust, error or rejection raspberry. Each appears as coloured text on its soft tint (a status pill) or as a number. Never as a card background.
- **Rust on a number means "you must act".** A count that waits for someone else (e.g. a request pending at the budget holder) stays ink; its subline says who it waits for.
- **Category colours come from the pool by mapping, never hand-picked.** `build → cat-1` (mint), `apply → cat-2` (sky), `lead → cat-3` (peach). A new role gets the next free slot (`cat-4` lavender, `cat-5` sage) as one new line in the mapping. With more than five categories, the extra ones get the neutral tag. Butter `#FFF3C4` is reserved for info messages and is never a category.
- **A colour never carries meaning alone.** A category is always name + icon + colour. A status is always a word + colour.
- **Telling status from category:** a status pill has coloured text, 12px, radius 6. A category tag has ink text, an icon, 12.5–13px, radius 8.
- **Do not use:** gradients on buttons, coloured shadows, dark mode (not designed yet), more than one yellow element per view, D's full-screen yellow, pink.

## Typography

- One family: **Inter**, loaded from a local file (offline requirement). Fallback stack: `"Inter", "Segoe UI Variable Text", "Segoe UI", system-ui, sans-serif`. If the font file is missing in the project, say so and use the fallback. Do not fetch it from a CDN.
- Praca headings are light (380–400). Komfort headings are bold (700). Body is 400. Emphasis inside a sentence is 600.
- **Numbers are always** `font-variant-numeric: tabular-nums` and right-aligned in lists and tables.
- **Money:** the main amount is large (28–34px, weight 380, −0.03em). Only the grosze part (`,00`) sits at 0.6em, raised. The currency („zł”) is 0.6em on the baseline, never raised. Salary ranges („14 000–18 000 zł”) have no grosze. Smaller amounts in rows stay in one size.
- Metadata is 13px, `--ink-3`, +0.1px. Source captions are 11px monospace (`ui-monospace, Consolas`). Monospace is used **only** for source captions and DEMO labels.
- Maximum line length is 72 characters for prose.
- Page title in Praca is the name of the place („Pulpit”, „Drafty”, „Wniosek o publikację”). A greeting („Dzień dobry, Ewa”) is optional and goes into the subline, not the title.
- Icons: one line-icon set, 1.5px stroke, 18px in navigation and tags, 20px in icon tiles, colour ink or ink-2. No filled or multicolour icons.

## Layout and content order

Every screen reads top to bottom in this order:

1. **Where am I**: page title and, in a flow, the step bar with the current step in yellow.
2. **What needs me**: state tiles with counts (Praca) or the role and company (Komfort). If all counts are zero, show one sentence with the next step instead of a row of zeros.
3. **The decision or the fact that matters**, written as a sentence with its consequence (see below).
4. **Facts**: tags, a table or rows of label ↔ value.
5. **Details**: long text, history, comments.
6. **Action**: in the card, or in the sticky action bar if the content is longer than one screen.

**Praca layout:** dark app bar (56px, full width) on top; below it the sidebar (240px, light) | content max 1040px | optional detail drawer on the right (420px, floating, with shadow). Lists over 7 columns become a drawer pattern instead.

**Komfort layout:** top bar | one column ≤ 720px, centred | sticky action bar at the bottom.

### Sentence with consequence (the most important pattern)

Every request, approval, status or task is written as a full sentence: **who + what + consequence + amount or date.**

> „Anna Wróbel prosi o publikację ogłoszenia Data Engineer. Jeśli zatwierdzisz, ogłoszenie ruszy w ciągu 1 dnia roboczego.” + amount `990,00 zł` on its own line.

- Never truncate the consequence. On narrow screens the sentence wraps to 2–3 lines, and the amount and date move to their own line below. Ellipsis is allowed only for names and titles, never for the clause with „jeśli” or the amount.
- The person who asked sees the same fact from the other side, also with the consequence: „Wniosek czeka na decyzję Marka od 2 dni. Jeśli zatwierdzi, ogłoszenie ruszy w ciągu 1 dnia roboczego.” + tertiary link „Wycofaj wniosek”.

### Which step is current

The current step is **whose turn it is now**. Employer flow: Draft (recruiter is writing) → Wniosek o zgodę (recruiter is preparing or has not yet sent the request) → Decyzja (sent; the budget holder's turn) → Publikacja (approved; payment and go-live). A sent, pending request therefore shows **Decyzja** as current, and the earlier steps are done (✓). Candidate flow: Oferta → Aplikacja → Odpowiedź firmy.

### Labelling invented content

- `PRZYKŁAD` for invented people, companies, ads and quotes. `DEMO` for invented prices, conditions and numbers (counts, metrics).
- When everything inside a card or block is invented, put **one** label in the block header or caption („dane przykładowe · DEMO”) instead of tagging every name. Label item by item only when real and invented values are mixed.

## Buttons

- **Shape:** pill (radius 999px), 40px high on desktop, 44px minimum on touch, horizontal padding 16–20px, label 14–15px / 500.
- **Hierarchy:**
  - *Primary*: indigo fill, white text. **At most one per view** (one per card in a list of cards). It belongs to the action that moves the process forward **for the person looking at the screen**. If that person can only wait, there may be no primary at all. Example: a requester whose request has been pending ≥ 2 days gets primary „Przypomnij Markowi”; before that, no primary, only secondary „Otwórz draft” and tertiary „Wycofaj wniosek”.
  - *Secondary*: white fill, 1px `--border-control`, ink text.
  - *Tertiary*: text link in indigo, no border. For „Wycofaj wniosek”, „Szczegóły”, „Jak liczymy?”.
  - *Negative decision* („Nie teraz”, „Odrzuć”) is **secondary**, never red. Red is for errors, not for a legitimate choice. If the person must give a reason, it opens a short form.
  - *Destructive and irreversible* („Usuń draft”): secondary with raspberry text, plus a confirmation that names what is lost.
- **Labels are verbs with an object, in Polish, in first person when the user is deciding:** „Zatwierdzam publikację”, „Opublikuj i zapłać”, „Aplikuj”, „Przesuń datę”. Never „OK”, „Wyślij”, „Dalej” without an object.
- **Order:** primary first (left) in cards and dialogs on desktop. On mobile, buttons **inside content** stack full width with the primary on top. The **sticky action bar** is the exception on every width: two buttons side by side (50/50 on mobile), secondary left, primary right.
- **Tertiary links** keep a 44px hit area on touch (padding, not font size).
- **Sticky action bar:** white, top border, soft upward shadow. It appears when the main button scrolls out of view and hides when the in-page button is visible. Leave bottom padding so it never covers the last content.
- States: hover darkens indigo to `#2A3A9E`. Focus is a 2px indigo ring offset by 2px. Disabled uses `--ink-disabled` text on `--canvas`, and the reason is shown next to the button („Uzupełnij widełki, aby opublikować”).

## Mobile (≤ 720px)

- Tables become lists: label and main value on one line, the amount right-aligned, secondary facts on a second line. Never let a column of amounts scroll out of view.
- Tags wrap. Limit 5 tags per card; the rest go under „+N”.
- Sidebar becomes a top bar with a menu. The step bar wraps but keeps the yellow current step visible.
- Touch targets ≥ 44px.

## Graphics (Komfort only)

- **Now: CSS only.** A flat band of soft pastel blobs (cat-1, cat-2, cat-3 on butter) at the top of a candidate page, and icon tiles (30–36px, radius 8, pastel fill, line icon in ink).
- One icon tile per section heading, at most. **Tiles never use a mapped category colour** (`cat-1…3` today), because on an Apply offer a mint tile reads as "Build". Use the free pool slots (`cat-4`, `cat-5`) or `--tag-warm`. When every slot is mapped, tiles use `--tag-warm` only. The decorative band may mix all pastels, because it carries no meaning.
- Safety line for candidates: under the main action, one short sentence with a shield icon about who sees their data and how to withdraw („Twoje CV zobaczy tylko Nordlab. Możesz wycofać aplikację w każdej chwili.”). This is the "bezpieczeństwo" part of Komfort. It is text, not a badge.
- No photos required. A screen must look finished without company photos or logos.
- SVG illustrations are a later decision (after candidate tests). Do not introduce them unasked.

## Accessibility and honesty checks

- Text contrast ≥ 4.5:1. All token pairs in `references/tokens.md` are pre-measured; if you create a new pair, measure it.
- Never use `--ink-disabled` or `--rule` for information.
- Match Score is always described as text-similarity scoring, never as a chance of being hired.
- Every invented value carries `PRZYKŁAD` / `DEMO`; every case number carries a source caption.

## Where outputs go

- Screens are React features in `src/features/`, built from `src/design-system/` and `src/components/ui/` (see `docs/design-system/DOROBOTY-DESIGN.md`).
- Import the tokens as the `:root` block from `references/tokens.md`. Do not retype values.
- Record what you built in `docs/tasks/`.

## Before you hand it over

Render the screen at 1440px and 390px and look at the saved screenshots, not just the code. Headless Chrome with `--window-size` will not go below ~500px. For 390px, either set the viewport via the DevTools protocol (`Emulation.setDeviceMetricsOverride`, `mobile: true`) or load the page in a 390px-wide iframe and capture that. Check:

- [ ] Register chosen and applied consistently (canvas, radius, heading weight)
- [ ] Brand bar present: mark + wordmark, ink app bar in Praca, light bar + stripe in Komfort
- [ ] One primary button per view, labels are verb + object
- [ ] Exactly one yellow element (current process step); active nav uses `--action-soft`
- [ ] No colour without meaning; categories through the mapping
- [ ] Every request or status is a sentence with consequence, not truncated at 390px
- [ ] Amounts tabular, right-aligned, grosze reduced
- [ ] Tables turned into lists at 390px; no horizontal page scroll
- [ ] DEMO / PRZYKŁAD labels and source captions present
- [ ] Contrast pairs come from the token table

Tell the human which rules you could not follow and why. A deviation you hide becomes the next screen's precedent.
