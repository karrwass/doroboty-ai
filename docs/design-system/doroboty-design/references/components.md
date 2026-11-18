# Components

Every component exists once and serves both registers. The register changes only tokens (canvas, radius, heading weight). Snippets are minimal reference markup, not a library. Adapt the content and keep the structure.

## App bar (brand)

Praca: full width, 56px, `--brand-bar`, sticky. Komfort: `--surface`, 64px, `border-bottom: 3px solid` drawn with `--brand-stripe`. The rules are in SKILL.md, section "Brand". The implementation is in `src/design-system/praca.css`.

```html
<svg width="0" height="0" style="position:absolute" aria-hidden="true">
  <symbol id="mark" viewBox="0 0 24 24">
    <rect x="2" y="4" width="20" height="4" rx="1" class="b1"/>
    <rect x="2" y="10" width="14" height="4" rx="1" class="b2"/>
    <rect x="2" y="16" width="8" height="4" rx="1" class="b3"/>
  </symbol>
</svg>
<header class="appbar on-dark">
  <a class="brand" href="#"><svg class="mark" aria-hidden="true"><use href="#mark"/></svg>
    <span>DoRoboty<span class="ai">.ai</span></span></a>
  <span class="sep" aria-hidden="true"></span>
  <span class="prod">Panel firmy</span>
  <div class="right">
    <button class="org">Nordlab Sp. z o.o. <small>PRZYKŁAD</small></button>
    <span class="av" aria-label="Konto: Ewa">EW</span>
  </div>
</header>
```

```css
.on-dark .mark .b1 { fill: var(--cat-1); } .on-dark .mark .b2 { fill: var(--cat-2); } .on-dark .mark .b3 { fill: var(--cat-3); }
.mark .b1, .mark .b2, .mark .b3 { fill: var(--ink); } /* light surfaces */
```

## Step bar ("jesteś tutaj")

Shows the place in a flow: Draft → Wniosek o zgodę → Decyzja → Publikacja (employer) or Oferta → Aplikacja → Odpowiedź (candidate).

- Steps are chips (radius 8, 13px). Done steps: ink-2 text with a ✓. Current step: `--here` fill + `inset 0 0 0 2px var(--here-edge)`, ink text 600. Future steps: white with `--rule` border.
- Exactly one current step. Use `aria-current="step"`.

```html
<ol class="steps" aria-label="Etapy">
  <li class="step done">✓ Draft</li>
  <li class="step here" aria-current="step">Wniosek o zgodę</li>
  <li class="step">Decyzja</li>
</ol>
```

## State tiles

Top of every Praca screen. 2–4 tiles: a large number (amount size, weight 380), a label, and an optional subline. Only a count that needs **the viewer's** action is coloured `--warn`; counts waiting on someone else stay ink with a subline naming who („u Marka od 2 dni”). On mobile, tiles become rows: label + subline left, number right. When all counts are zero, replace the tiles with one sentence and one action.

## Request sentence card (decision card)

The core Praca pattern. Anatomy, top to bottom:

1. The sentence: who (600) + what (object in 600) + consequence.
2. A row: the amount (large, grosze reduced) on the left and a status pill on the right („Czeka na Twoją decyzję · 2 dni”).
3. Optional facts block (rows label ↔ value with a source caption).
4. Actions: primary + secondary („Zatwierdzam publikację” / „Nie teraz”).

The requester's view of the same card replaces the actions with a status line and a tertiary link: „Wniosek czeka na decyzję Marka · Wycofaj wniosek”.

## Fact rows (ledger)

Label left in `--ink-2`, value right in ink, tabular, 1px `--rule` divider. Used for the result of the previous publication, prices, and package status. End with a source caption (11px mono, `--ink-3`): „dane: publications.csv · IX 2026” or „dane przykładowe”.

The final total of a calculation may use a double rule (convention from the landing page). Use it once per screen at most.

## Status pill

Coloured text on a soft tint, 12px, radius 6, padding 2px 8px. Always a word, never only a dot. Vocabulary: „Czeka na decyzję” (warn), „Zatwierdzono” (pos), „Odrzucono · powód” (err), „Draft” (neutral `--tag-cool`, ink-2 text), „Opublikowane” (pos), „Wygasło” (neutral, ink-2 text).

## Category tag and fact tag

- Category tag: `--cat-<role>` fill, ink text 13px, line icon, radius 8, padding 5px 9px. Always contains the role name.
- Fact tag (mode, location, salary range, response time): neutral `--tag-warm` (Komfort) or `--tag-cool` (Praca) fill, icon + short phrase. No "Label: value" format; write „Hybrydowo”, „18–24 tys. zł B2B”, „Odpowiedź do 3 dni”.
- At most 5 tags per card, the rest as „+N”.

## Job ad card (the bridge)

The same card appears in the employer's draft preview, inside the purchase request, and on the candidate's offer page. Anatomy: role title (Komfort 32/700, Praca 20/600), company · location · PRZYKŁAD label, tags row, then optional sections. Do not fork a "candidate version". Only the register tokens change.

Long role titles wrap to two lines; never use a fixed height with clipping (the research found clipped titles at a reference site).

## Match explanation frame (Komfort only, max one per screen)

A card with a 1.5px gradient border (`linear-gradient(120deg, #7FD1B5, #9DB4F2, #F2A98A)` via `border-box` background), an icon tile and the honest text: weights (umiejętności 35% · zadania 30% · doświadczenie 20% · warunki 15%) and „To ocena zgodności tekstów, a nie szansa na zatrudnienie.”

## Section heading with icon tile (Komfort)

A 30–36px tile, radius 8, fill from an **unmapped** pool slot (`cat-4`, `cat-5`) or `--tag-warm`, never a mapped category colour; line icon in ink; then the heading at 600–650. One tile per section.

## Decorative band (Komfort, CSS only)

54–80px high, radius per register, butter base with 3 soft radial blobs in cat-1/cat-2/cat-3. `aria-hidden="true"`. At most one per page, at the top.

## Sticky action bar

White, `border-top: 1px solid var(--rule)`, `box-shadow: var(--shadow-sticky)`. Secondary on the left, primary on the right. Show it with IntersectionObserver when the in-page primary leaves the viewport. Used for „Aplikuj”, „Zatwierdzam publikację”, „Opublikuj i zapłać”.

## Detail drawer (Praca)

Right side, 420px, white, `--r-card`, `--shadow-float`, close button with `aria-label="Zamknij"`. Content order: amount → timeline (who → what) → status of any request with a tertiary undo link → comments. On mobile it becomes a full screen with a back button.

## Dialog „Co wstrzymuje publikację?”

Max 480px. Title as a question; options as radio cards (radius 8, selected = `--action-soft` + indigo border); one date field „Kiedy spodziewasz się decyzji?”; primary „Zapisz draft” + tertiary „Pomiń”. Esc closes.

## Empty state

One sentence saying what is missing and why it matters, plus one primary action. No illustration in Praca; a single icon tile is allowed in Komfort.

## Lists and tables

Desktop: header 13px `--ink-3`, rows ~48px (Praca) / ~56px (Komfort), amounts right-aligned. Mobile: each row becomes two lines (title + amount / secondary facts). Status filters as underlined tabs with counts („Drafty 2”); the yellow is reserved for the step bar and the active nav, not for tabs.
