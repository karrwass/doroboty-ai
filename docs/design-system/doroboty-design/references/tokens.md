# Tokens

Paste this `:root` block into the screen's stylesheet. Do not retype or round the values. Status: decided on 2026-11-13 (project log, entry „Skill doroboty-design”). The contrast ratios in the comments are WCAG 2.x ratios computed on 2026-11-13. The metadata colour was darkened from the study's `#8B8E9C` (3.3:1) to `#66697A`. The lavender and sage hues are proposals; their contrast with ink is measured and passes.

```css
:root {
  /* text */
  --ink: #1C1D26;            /* 16.8:1 on white */
  --ink-2: #575A6B;          /* 6.8:1 on white, 6.3:1 on warm canvas */
  --ink-3: #66697A;          /* metadata; 5.4:1 white, 5.0 canvas, 5.0 warm canvas */
  --ink-disabled: #8A8D9B;   /* 3.3:1 – disabled and decoration only, never information */

  /* surfaces */
  --surface: #FFFFFF;
  --canvas: #F6F6F8;         /* Praca */
  --canvas-warm: #F8F5EF;    /* Komfort */
  --tag-warm: #F3EFE8;       /* neutral tag in Komfort; ink 14.6:1 */
  --tag-cool: #EEEFF3;       /* neutral tag in Praca */

  /* lines */
  --rule: #E6E6EC;           /* dividers, card borders (decorative, 1.2:1) */
  --border-control: #8A8D9B; /* inputs and secondary buttons need 3:1 */

  /* brand bar (dark) */
  --brand-bar: #1C1D26;              /* = ink */
  --on-dark: #FFFFFF;                /* 16.8:1 on brand bar */
  --on-dark-2: rgba(255,255,255,.72);/* 9.2:1 – product name, ".ai", secondary */
  --on-dark-fill: rgba(255,255,255,.10); /* company pill, hover */
  --on-dark-rule: rgba(255,255,255,.22); /* divider in the bar */
  --brand-stripe: linear-gradient(90deg, #7FD1B5 0 33.3%, #9DB4F2 33.3% 66.6%, #F2A98A 66.6%); /* Komfort, 3px */

  /* action */
  --action: #3446B8;         /* white text 7.7:1 */
  --action-hover: #2A3A9E;   /* white text 9.6:1 */
  --action-soft: #E8ECFB;    /* selected row, light highlight */
  --focus: #3446B8;

  /* "jesteś tutaj" */
  --here: #FFE27A;           /* ink 13.1:1 */
  --here-edge: #F2C200;      /* 2px inset edge, decorative */

  /* status: text colour on soft tint */
  --pos: #1A6E47;  --pos-soft: #DDF1E6;   /* 5.3:1 on tint */
  --warn: #A24A00; --warn-soft: #FCE9DB;  /* 5.1:1 on tint */
  --err: #B3264A;  --err-soft: #FBE4EA;   /* 5.3:1 on tint */
  --info-soft: #FFF3C4;                   /* ink text 15.1:1 */

  /* category pool – use through the mapping below, never directly */
  --cat-1: #DDF1E6;  /* mint     – ink 14.2:1 */
  --cat-2: #E1E8FA;  /* sky      – ink 13.7:1 */
  --cat-3: #FBE3D6;  /* peach    – ink 13.6:1 */
  --cat-4: #ECE5F8;  /* lavender – ink 13.7:1 (proposal) */
  --cat-5: #E6EDDC;  /* sage     – ink 14.0:1 (proposal) */

  /* category mapping – add a new role here, nowhere else */
  --cat-build: var(--cat-1);
  --cat-apply: var(--cat-2);
  --cat-lead:  var(--cat-3);

  /* type */
  --font: "Inter", "Segoe UI Variable Text", "Segoe UI", system-ui, -apple-system, sans-serif;
  --mono: ui-monospace, "Cascadia Mono", Consolas, monospace;
  --fs-meta: 13px;   --fs-body: 15px;  --fs-body-c: 16px;
  --fs-title: 28px;  --fs-title-c: 32px;
  --fs-amount: 30px;
  --fw-light: 380;   --fw-body: 400;   --fw-strong: 600;  --fw-title-c: 700;

  /* shape and space */
  --r-control: 8px;  --r-pill: 999px;  --r-pill-status: 6px;
  --r-card: 12px;    --r-card-c: 16px;
  --space-1: 4px; --space-2: 8px; --space-3: 12px; --space-4: 16px; --space-5: 24px; --space-6: 32px; --space-7: 48px;
  --shadow-float: 0 8px 28px rgba(28,29,38,.12);   /* drawer, dialog */
  --shadow-sticky: 0 -6px 18px rgba(28,29,38,.06); /* sticky action bar */
}
```

## Register switch

Put `class="reg-komfort"` on `<body>` for candidate screens:

```css
.reg-komfort { --canvas: var(--canvas-warm); --r-card: var(--r-card-c); --fs-title: var(--fs-title-c); --fs-body: var(--fs-body-c); }
.reg-komfort h1 { font-weight: var(--fw-title-c); letter-spacing: -0.02em; }
```

## Adding a role (category)

1. Take the next free slot (`--cat-4`, then `--cat-5`).
2. Add one line: `--cat-govern: var(--cat-4);`.
3. Add the role's icon. That is all; components read `--cat-<role>`.
4. With more than five roles, extra roles use `--tag-cool` / `--tag-warm`. Raise it with the human: at that size the taxonomy needs a rethink, not the palette.

## Pairs not to use

| Pair | Ratio | Why |
|---|---|---|
| `--ink-disabled` text on white | 3.3 | Below 4.5; only for disabled states |
| `--here-edge` as text | 1.7 | Decorative edge only |
| `--rule` as an input border | 1.2 | Controls need 3:1; use `--border-control` |
| white text on any pastel | < 1.5 | Pastels always take ink text |
