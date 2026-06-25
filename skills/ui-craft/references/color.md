# Working with color

From *Refactoring UI* Ch. 5. Color is where amateur dashboards reveal themselves fastest. The fix is mostly mechanical: build a real palette, define it once in tokens, and use semantic names everywhere.

## Ditch hex for HSL (or OKLCH)

Hex codes (`#3b82f6`) are unreadable. You can't tell at a glance if two colors are related, or which is darker, or which is more saturated. HSL (`hsl(217 91% 60%)`) and OKLCH (`oklch(0.65 0.21 257)`) expose the structure.

Modern stack: define tokens in OKLCH (perceptually uniform, better for dark mode) and let Tailwind v4 / CSS variables handle conversion.

```css
@theme {
  --color-emerald-500: oklch(0.72 0.17 162);
  --color-foreground: oklch(0.145 0 0);
  --color-muted-foreground: oklch(0.55 0 0);
  --color-background: oklch(1 0 0);
}
```

When you're handed a hex from a designer, convert it to OKLCH using a color picker before pasting it into tokens. Future-you adjusting the lightness will thank you.

## You need more colors than you think

A real palette has 9-10 shades per hue, not just a "light blue" and "dark blue":

```
50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950
```

Each step is a meaningful step in lightness. Tailwind ships this for you (`emerald-50` through `emerald-950`). Use the shades directly:

- `50` / `100`: tinted backgrounds for subtle highlight (`bg-emerald-50` for a success row tint)
- `200` / `300`: borders, dividers in light mode
- `400` / `500`: brand mid-tone, default accent
- `600` / `700`: text on light backgrounds (`text-emerald-700` reads on `bg-emerald-50`)
- `800` / `900` / `950`: backgrounds in dark mode, deep accents

Don't invent shades. If you need "between 400 and 500" you usually need a different *hue*, not a half-step.

## Define your shades up front

A common mistake: choose shades as you go, ad-hoc. Result: 17 slightly-different greys, none related. Instead, define the full palette once, then refer to it.

Token model:

```css
/* base */
--color-primary: var(--color-emerald-600);
--color-primary-foreground: var(--color-white);
--color-secondary: var(--color-zinc-100);
--color-muted: var(--color-zinc-100);
--color-muted-foreground: var(--color-zinc-500);
--color-accent: var(--color-zinc-100);
--color-accent-foreground: var(--color-zinc-900);
--color-destructive: var(--color-red-500);
--color-border: var(--color-zinc-200);
--color-input: var(--color-zinc-200);
--color-ring: var(--color-emerald-600);

/* dark mode override */
.dark {
  --color-primary: var(--color-emerald-500);
  --color-muted: var(--color-zinc-800);
  --color-muted-foreground: var(--color-zinc-400);
  --color-border: var(--color-zinc-800);
  --color-input: var(--color-zinc-800);
}
```

Now every component uses semantic names (`text-muted-foreground`) rather than `text-zinc-500`. Dark mode comes for free.

## Don't let lightness kill your saturation

A common rookie palette goes from saturated mid-tones to grey/desaturated extremes. The "darker" shades look muddy, the "lighter" shades look washed out.

In OKLCH and HSL, *chroma/saturation should stay constant* or even *increase* as lightness moves away from 50%. Real saturated colors at light values are vivid pinks and yellows; real saturated colors at dark values are deep indigos and emeralds.

If your `emerald-50` looks grey, raise its chroma. If your `emerald-900` looks black, raise its chroma. The chroma is what makes the color identifiable, not just the lightness.

## Greys don't have to be grey

Pure greys (zinc, neutral) are fine. But a slight hue cast, slightly blue greys (slate), slightly warm greys (stone), adds character without effort.

- **`zinc`**: pure cool grey. Crisp, technical.
- **`slate`**: blue-grey. Calm, professional.
- **`gray`**: neutral. Default.
- **`stone`**: warm grey. Friendly, paper-like.

Pick one and stick with it across the whole app. Mixing is jarring.

For dark mode, the same family stays. `zinc-900` and `zinc-950` are still cool, just deeper.

## Accessible doesn't have to mean ugly

Contrast is non-negotiable. Body text needs WCAG 4.5:1 against background. Large text (18pt+) needs 3:1. UI components and graphical objects need 3:1.

Tools to validate: Chrome DevTools' contrast checker, `color-contrast()` function in modern CSS.

But accessible palettes don't have to be high-contrast everywhere. A muted secondary label at `text-zinc-500` on `bg-white` is exactly 5.0:1, meets AA. Going to `text-zinc-700` for "more contrast" makes the label compete with primary text. Tune for the *role* of the element, not just the contrast ratio.

## Don't rely on color alone

Color is a signal that fails for the 8% of users with color blindness, in print, in poor lighting, and in monochrome screenshots. Always pair color with a second signal.

- Status chips: color + icon (✓ for pass, × for fail, ⏳ for pending)
- Diff lines: red/green background *and* `+` / `-` prefix
- Required form fields: red asterisk *and* "Required" text in error state
- Sortable columns: chevron arrow direction *and* color shift

```html
<!-- Bad: color is the only signal -->
<span class="text-red-600">Failed</span>

<!-- Good: icon + color + text -->
<span class="inline-flex items-center gap-1 text-red-600">
  <ng-icon name="lucideCircleX" size="12" />
  Failed
</span>
```

## A tone system for status

For dashboards, define these tones once and reuse:

```ts
type Tone = 'success' | 'warning' | 'error' | 'info' | 'neutral';

const toneClass: Record<Tone, string> = {
  success: 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-500/30 dark:bg-emerald-950 dark:text-emerald-300',
  warning: 'bg-amber-100  text-amber-700  ring-1 ring-amber-500/30  dark:bg-amber-950  dark:text-amber-300',
  error:   'bg-red-100    text-red-700    ring-1 ring-red-500/30    dark:bg-red-950    dark:text-red-300',
  info:    'bg-sky-100    text-sky-700    ring-1 ring-sky-500/30    dark:bg-sky-950    dark:text-sky-300',
  neutral: 'bg-zinc-100   text-zinc-700   ring-1 ring-zinc-500/30   dark:bg-zinc-800   dark:text-zinc-300',
};
```

Every status badge, chip, and tone-tinted row pulls from this. Never write a bespoke color combo per element.

## When to use a colored background

Avoid coloring entire backgrounds unless you're conveying meaning:

- A whole-row colored background means *this row is in a special state* (selected, errored, highlighted). Reserve for that.
- A whole-page colored background is almost always wrong. Use neutral background + tinted accent regions.
- Card backgrounds: use `bg-card` (which is `bg-white` in light, `bg-zinc-900` in dark). Never colored.
- Tinted sections (`bg-muted/40`) for emphasis: yes, sparingly.

## Color checklist

- Did I use semantic tokens (`text-muted-foreground`) instead of raw shades (`text-zinc-500`)?
- Is dark mode working from the same tokens, with overrides only where needed?
- Is every status communicated by color *and* something else (icon, text, shape)?
- Did I pick one neutral family (zinc / slate / stone) and stick to it?
- Are my tinted backgrounds paired with darker-hue foregrounds (`text-emerald-700` on `bg-emerald-50`), not greys?

## Cross-reference

- [hierarchy.md](hierarchy.md), color as a hierarchy lever
- [data-driven-ui.md](data-driven-ui.md), color as a data signal
- The four library skills' `theming.md` for token wiring
