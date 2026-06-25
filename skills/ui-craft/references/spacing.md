# Layout and spacing

From *Refactoring UI* Ch. 3. Spacing is the silent layer of design. Done well, it disappears. Done badly, it leaves the reader feeling cramped or scattered without knowing why.

## Start with too much whitespace

Always begin with more padding than you think you need. It's much easier to remove space than to add it, because by the time you realize you needed more, you've already filled the gap with content.

For dashboards specifically:
- Padding inside cards: minimum `p-4` (16px), often `p-6` (24px)
- Gap between top-level sections of a page: `gap-6` to `gap-8`
- Gap between rows in a list: `gap-3` to `gap-5`
- Internal gap inside a row (avatar, name, timestamp): `gap-2` to `gap-3`

When in doubt, go wider. You'll trim later.

## Establish a spacing and sizing system

Never use arbitrary pixel values when a scale will do. Tailwind's default scale (`1`, `1.5`, `2`, `2.5`, `3`, `4`, `5`, `6`, `8`, `10`, `12`, `16`, `20`, `24`) is non-linear by design: small steps near zero, larger steps at the top. Use it directly.

Hard rules:

- Never `m-[7px]` when `m-1.5` (6px) or `m-2` (8px) is available. Constrain choices.
- All spacing on the page should come from the same scale. If you find yourself reaching for `mt-[13px]`, your hierarchy is forcing a fix in spacing that should be a fix in size or weight.
- Component-level overrides happen *at the system boundary*: a button has its own internal padding, sized by the library, controlled by the size variant.

For type scale, see [typography.md](typography.md). The two scales should compose: a `text-sm` row gets `py-2` padding, a `text-base` row gets `py-3`, a `text-lg` row gets `py-4`. Pick one and propagate.

## You don't have to fill the whole screen

A common beginner mistake: every page expands to `100%` width and every section stretches to fill it. The result is wall-to-wall content with no reading rhythm.

- Set a `max-w-*` on the page's content container based on what the content needs:
  - Reading-shaped surfaces (PR conversation, article, doc): `max-w-3xl` or `max-w-4xl` so line-length stays in the 65-75ch range
  - Two-column layouts (conversation + rail): `max-w-6xl` so each column gets enough room
  - Table-shaped surfaces (inbox, log viewer): `max-w-screen-2xl` (constrain only to avoid ridiculous monitor widths)
- Center the container with `mx-auto` so it sits in the middle of the viewport
- Let the chrome (sidebar, header) span full width; only the *content* container has a max-width

## Grids are overrated

Twelve-column grids are great for marketing pages. They're terrible for dashboards. A dashboard's layout is driven by *what data needs to fit in what region*, not by a fixed grid.

Use:
- CSS Grid with `grid-template-columns` set to the actual sizes you need (`200px minmax(0, 1fr) 240px` for a sidebar + main + rail)
- Flexbox for one-dimensional rows (toolbar, row of buttons)
- `auto-fit` / `auto-fill` for responsive card grids (`grid-template-columns: repeat(auto-fit, minmax(280px, 1fr))`)

Avoid `col-span-6 col-md-4 col-lg-3` ladders. They produce arbitrary breakpoints that don't match real content needs.

## Relative sizing doesn't scale

`width: 50%` looks the same on every screen but reads differently. At 1200px, 50% is a comfortable reading column. At 2400px, 50% is unreadable. At 600px (a phone), 50% is a sliver.

Anchor sizes to *fixed scales* whenever the content has an absolute character:
- Sidebar nav: `w-60` (240px) regardless of viewport (people don't want a 600px sidebar on a 4K screen)
- Detail rail: `w-60` to `w-72`
- Reading content: `max-w-3xl` / `max-w-4xl`
- Avatars, icons, badges: always fixed (`size-6`, `size-8`)

Use relative units only when the data is genuinely proportional (a progress bar's fill, a column in a layout that always shares space with another column).

## Avoid ambiguous spacing

If a label, value, and metadata are all equally spaced apart, the reader can't tell which two are grouped. **Group via proximity.**

```
[ Label ]
[ Value          ]   <- close to its label
                     <- big gap
[ Metadata       ]
                     <- big gap
[ Next section   ]
```

Concretely: a label-and-value pair should have `mb-1` between them and `mb-4` or `mb-6` separating them from the next pair. If you use `mb-3` for both, the relationship dissolves.

For multi-section forms, the gaps between top-level sections should be *visibly larger* than gaps within a section. A `space-y-6` form with `space-y-2` per section beats one big `space-y-4`.

## Padding, margin, gap: pick one consistently

Modern CSS gives three ways to space children: `padding` on the parent, `margin` on the children, `gap` in a flex/grid container. Stick to *gap-first* whenever the children are in a flex or grid (which is almost always).

```html
<!-- Avoid: margin on every child -->
<div>
  <a class="mr-2">One</a>
  <a class="mr-2">Two</a>
  <a class="mr-2">Three</a>
</div>

<!-- Prefer: gap on the flex parent -->
<div class="flex gap-2">
  <a>One</a>
  <a>Two</a>
  <a>Three</a>
</div>
```

Margin is for separating a child from a sibling *across* a layout boundary (e.g., `mt-8` on the first item after a heading). Padding is for inside-the-box space.

## Sticky chrome, scrolling content

For any dense surface with a header and a scrollable body:

- Make the header `flex-shrink-0` so it can't be squashed
- Make the body `flex-1 min-h-0 overflow-auto`
- Either `position: sticky; top: 0` the header inside the scroll container, or split into two containers where only the body scrolls

The `min-h-0` is the trick. Without it, the flex child can't shrink below its content size, and the overflow never engages.

If you also want absolute reliability (the header *cannot* be pushed off-screen), promote the host to `position: absolute; inset: 0; display: flex; flex-direction: column; overflow: hidden`. This pins the surface to its parent regardless of percent-height calculation quirks.

## Spacing checklist

- Did I start too wide and then tighten, or too tight and then widen? Always start wider.
- Are all my spacings on a scale (Tailwind's 0-24 scale, or your own multiples of 4px)?
- Are grouped items closer together than unrelated items?
- Are my sections big enough that the reader can rest between them?
- Have I let the content set the column width, or am I just using `w-1/2` and hoping?

## Cross-reference

- [typography.md](typography.md), type scale that composes with spacing
- [hierarchy.md](hierarchy.md), proximity as a grouping signal
- [dashboard-patterns.md](dashboard-patterns.md), concrete layout templates
