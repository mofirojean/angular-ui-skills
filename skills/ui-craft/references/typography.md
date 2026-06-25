# Designing text

From *Refactoring UI* Ch. 4. Typography in a UI is mostly about constraint: pick a scale, stick to it, don't reach for arbitrary sizes.

## Establish a type scale

A type scale is a predefined list of font sizes. Every text element on the page picks from the list. Nothing in between is allowed.

Tailwind's default scale is excellent and roughly:

| Class | Size | Usage |
|---|---|---|
| `text-[10px]` | 10px | Metadata, hint text, kbd chips, super-fine print |
| `text-xs` | 12px | Table rows, secondary text, dashboard density |
| `text-[13px]` / `text-sm` | 13-14px | Body text in dense surfaces, form fields |
| `text-base` | 16px | Reading prose, primary content |
| `text-lg` | 18px | Section headings, card titles |
| `text-xl` | 20px | Page subtitles, prominent labels |
| `text-2xl` | 24px | KPI numbers, page titles in compact layouts |
| `text-3xl` | 30px | Page titles, marketing headlines |
| `text-4xl`+ | 36px+ | Hero text only |

For dashboards, the working range is `[10px]` to `xl`. Anything bigger should be reserved for hero KPI values or page titles.

Don't use 11px, 13px, 15px, 17px unless you have a *very* good reason. Each step out of the scale weakens the system.

## Use good fonts

Default system fonts are fine. Webfonts (Inter, Manrope, IBM Plex Sans, JetBrains Mono) elevate the surface visibly with minimal effort. Rules:

- One sans-serif for the UI (Inter is the safe default)
- One monospaced for code, line numbers, SHAs (JetBrains Mono or IBM Plex Mono)
- Don't use serifs in dashboards (reading rhythm gets weird at small sizes)
- Load the variable-weight version (Inter Variable) so you can hit any weight without separate font files
- Avoid Roboto, Arial, they read as defaults

```css
/* In your global stylesheet */
@font-face {
  font-family: 'Inter';
  src: url('/fonts/InterVariable.woff2') format('woff2-variations');
  font-weight: 100 900;
}

body { font-family: 'Inter', ui-sans-serif, system-ui, sans-serif; }
code, pre { font-family: 'JetBrains Mono', ui-monospace, monospace; }
```

## Keep line length in check

Optimal reading line length is 45-75 characters. Wider lines exhaust the eye; the reader loses their place when wrapping to the next line.

For prose-shaped content (PR descriptions, comments, articles), constrain via `max-w-prose` (≈65ch) or `max-w-3xl` (≈48rem).

For dashboard cells (table rows, KPI labels), line length is less critical because the content is short. But still don't let a `<p>` of body text expand to 1200px wide.

## Baseline, not center

When you align text *vertically* with another element (an icon, an avatar, a badge), align by *baseline*, not by visual center. The baseline is the line that letters sit on, where text actually reads from.

```html
<!-- Inline with an icon -->
<div class="flex items-baseline gap-2">
  <ng-icon name="lucideGitPullRequestArrow" size="14" class="translate-y-0.5" />
  <span class="text-sm">142 open pull requests</span>
</div>
```

Note: `items-baseline` on flex containers does what you want. The `translate-y-0.5` on the icon is a small visual nudge because icons rarely have a real baseline.

For larger size differences (a big KPI number next to a smaller label), baseline alignment matters even more. The "+$2,840" badge next to "$48,230" should sit with its baseline at the same place as the big number's baseline, not its center.

## Line-height is proportional

The bigger the font, the *smaller* the line-height ratio. Tight headings, loose body text.

| Font size | line-height |
|---|---|
| 30px+ | `leading-tight` (1.25) |
| 18-24px | `leading-snug` (1.375) |
| 14-16px | `leading-relaxed` (1.625) for prose, `leading-6` for UI |
| 12px | `leading-5` (20px) |
| 10px | `leading-4` (16px) |

Default `leading-normal` (1.5) is fine for most UI text. Reach for `leading-tight` on large headings only.

## Not every link needs a color

Body-prose links should be blue (or your accent color) with `hover:underline`. But:

- A link inside a sidebar nav that's already in a navigation context doesn't need to be blue. It's understood to be clickable by position.
- A link inside a table row (e.g., the PR title that opens the detail) reads as the row's primary text. Color it the same as other primary text; the row's hover state is the affordance.
- Breadcrumb links: `text-muted-foreground` with `hover:text-foreground`. The hover is the entire affordance.

Reserve link-blue for inline links in body text where the user might miss them.

## Align with readability in mind

- Body text: **always left-aligned** in LTR languages. Justified is hostile (creates rivers). Right and center kill scannability.
- Numbers in a column: **right-aligned** so digits align by place value. `text-right tabular-nums`.
- Labels above values: usually left-aligned with the value (same column)
- Form fields with labels above: labels left-aligned with the field

Centered text is for short, standalone elements (KPI numbers, empty state titles, dialog confirmations).

## Use letter-spacing effectively

- All-caps labels: `tracking-wider` (0.05em) or `tracking-widest` (0.1em). Without letter-spacing, all-caps text looks cramped.
- Large headings (24px+): `tracking-tight` (-0.025em). Default letter-spacing at large sizes looks too airy.
- Body text and most UI: default tracking. Don't fiddle.
- Monospace text: default. Mono fonts are designed to render at default tracking.

```html
<span class="text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground">
  Total revenue
</span>
```

## Font weights to use

- `font-normal` (400), body text
- `font-medium` (500), UI labels, button text, table-row primary fields
- `font-semibold` (600), headings, KPI values, section titles
- `font-bold` (700), reserve for actual emphasis. Modern UI rarely uses bold; semibold reads as the "strong" weight.

Avoid `font-light` (300) or thinner in dashboards. Thin weights look fragile at small sizes and rarely have meaningful contrast against the background.

## Tabular numbers

Whenever digits need to align across rows (counts, currency, dates), apply `tabular-nums` (or `font-variant-numeric: tabular-nums`). Without it, the `1` is narrower than the `8`, and your right-aligned column looks ragged.

```html
<td class="text-right tabular-nums font-mono">{{ value }}</td>
```

For code, line numbers, SHAs: monospace gives you tabular by default.

## Typography checklist

- Did I pick from a scale, or invent a one-off size?
- Are headings tighter (line-height) than body text?
- Are labels muted and lighter weight than values?
- Are columns of numbers right-aligned with `tabular-nums`?
- Are all-caps labels using `tracking-wider`?
- Are body links blue, but UI links neutral?

## Cross-reference

- [hierarchy.md](hierarchy.md), weight + color hierarchy
- [color.md](color.md), text color tokens and muted greys
- [spacing.md](spacing.md), type scale composes with spacing scale
