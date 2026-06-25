# Finishing touches

From *Refactoring UI* Ch. 8. The 5% of work that distinguishes a portfolio-grade UI from a "looks fine" UI. None of these are individually expensive; together they add up to "this app feels considered."

## Supercharge the defaults

Default styles from a CSS reset or a component library are *baseline*. They're not the finished surface. Add small touches that lift them.

- **Headings**: not just bigger, but `font-semibold tracking-tight`. The tight letter-spacing makes them feel intentional at larger sizes.
- **Buttons**: not just a colored rectangle. Subtle hover state (`hover:bg-primary/90`), active state (`active:translate-y-px`), focus ring (`focus-visible:ring-2`).
- **Inputs**: not just bordered. Subtle focus state with a ring, error state with a tinted background, success state with a checkmark suffix.
- **Links inside body text**: underline on hover, slight color shift, but never the default `color: blue; text-decoration: underline` from the reset.

## Add color with accent borders

A common pattern: a sidebar with all-grey nav items. The active one needs to stand out. Default move: change the background. Better move: keep the background the same, add a *left accent border* in the brand color.

```html
<li>
  <a routerLink="/inbox"
     class="flex items-center gap-2 px-3 py-2 border-l-2 border-transparent"
     routerLinkActive="border-primary bg-muted/40 text-foreground">
    <ng-icon name="lucideInbox" size="14" />
    Inbox
  </a>
</li>
```

The 2px border on the left + the tinted background is a quieter, more elegant "active" state than a bold background fill.

Same pattern works for:
- Active tab indicators (`border-b-2 border-foreground` on the active tab)
- Quote blocks (`border-l-4 border-muted pl-4`)
- Alert variants (`border-l-4 border-amber-500` for warnings)

## Decorate your backgrounds

Empty backgrounds feel empty. Add one of:

- **A subtle grid pattern** at very low opacity (`opacity: 0.02`-`0.04`)
- **A radial gradient fade** from a brand color at low opacity in one corner
- **Noise texture** at ultra-low opacity (the `data:image/svg+xml,...` pattern works)
- **Two soft color blobs** at far corners, blurred heavily (`bg-rose-500/[0.04] blur-[120px]`)

These should be invisible at first glance and only register when the user "feels" the page. Done loudly, they're tacky. Done quietly, they're polish.

```html
<section class="relative">
  <div aria-hidden="true" class="pointer-events-none absolute inset-0">
    <div class="absolute -left-32 top-32 size-80 rounded-full bg-rose-500/[0.04] blur-[120px]"></div>
    <div class="absolute -right-32 bottom-24 size-80 rounded-full bg-blue-500/[0.04] blur-[120px]"></div>
  </div>
  <div class="relative">
    <!-- content -->
  </div>
</section>
```

## Don't overlook empty states

See [hidden-ui.md](hidden-ui.md) for the four parts of a good empty state. Adding them is the single highest-ROI polish move because they're the screens new users see most often.

For each empty state:
- Use a quiet illustration (not stock-photo), a monochrome icon, or a small svg matching the brand
- Title in present tense, subtitle that explains *why* and *what next*
- A primary action when the user can do something
- Avoid "Oops! Nothing here yet 😭" copy. Be sincere.

## Use fewer borders

Beginners reach for `border` whenever two things should be separated. Pros use *value contrast, spacing, or a single hairline* instead.

Before:
```html
<div class="border rounded-lg p-4 mb-4">
  <h3 class="border-b pb-2 mb-2">Section title</h3>
  <div class="border-t pt-2">
    <p class="border-l pl-2">Body</p>
  </div>
</div>
```

After:
```html
<div class="rounded-lg bg-card p-6 mb-6">
  <h3 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
    Section title
  </h3>
  <div class="space-y-2">
    <p>Body</p>
  </div>
</div>
```

The second version uses background tint, spacing, and typography to imply structure. No borders needed.

When you do use borders, use *one* hairline at the level of separation that matters most. A table doesn't need vertical column borders; horizontal row borders (`divide-y divide-border`) carry the structure.

## Think outside the box

Some polish moves break the rectangle:

- **Overlapping avatars** in a reviewer stack (`-space-x-2` so they overlap)
- **A badge that pokes out of a card corner** (`absolute -top-2 -right-2`)
- **A vertical timeline connector** that runs the full height of a section, with avatars or icons anchored to it via `ring-4 ring-background`
- **A button that overlaps a header image** so it sits half-on the image, half on the page
- **A diff line gutter chevron** that pokes out of the line-number column on hover

Each move says "this surface was considered." Use them sparingly; one or two per page is plenty.

## Micro-interactions and transitions

The cheapest polish is making things move with intent:

- **`transition-colors`** on every hover/active state (200ms default)
- **`transition-transform`** on any element with `hover:scale-105` or `hover:-translate-y-0.5`
- **Stagger animation** on list entries (`animation-delay: calc(var(--i) * 50ms)`), feels alive, doesn't add load time
- **Toast slide-in** from the side
- **Modal fade + scale** from `opacity-0 scale-95` to `opacity-100 scale-100`

Rules:
- Default duration: 150-200ms. Faster feels twitchy, slower feels broken.
- Use `ease-out` for entry, `ease-in` for exit
- `prefers-reduced-motion: reduce` should kill non-essential animations

```css
@media (prefers-reduced-motion: reduce) {
  *, ::before, ::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

## Numeric typography polish

Numbers in a UI deserve special care:

- Always `tabular-nums` for any number in a column or table
- For large numbers, separate thousands: `48,230` not `48230`
- For currency, use a smaller currency symbol: `<span class="text-muted-foreground text-sm">$</span><span class="text-2xl">48,230</span>`
- For percentages, the unit (`%`) is smaller than the digit
- For diffs, give the `+` and `-` colors (`text-emerald-600` and `text-red-600`)

```html
<p class="text-3xl font-semibold tabular-nums">
  <span class="text-muted-foreground text-lg align-top">$</span>48,230
  <span class="ml-2 text-sm text-emerald-600 font-mono">+12.4%</span>
</p>
```

## Stick the landing

For a portfolio-grade dashboard, the surfaces that matter most for "feel":

1. **The header / nav**, every screen, first impression
2. **The inbox / list view**, what users see 80% of the time
3. **The detail page**, where users live when working
4. **The empty state of the inbox**, the surface a new user sees first

Polish these four to a 9/10. The rest can be at 7/10. The brain anchors quality assessment on the screens it sees most.

## Finishing checklist

- Did I use accent borders instead of background fills for active states?
- Are my empty states sincere, with action paths?
- Did I prune redundant borders, replacing them with spacing or contrast?
- Are there 1-2 "broken-out-of-the-box" elements per page (overlap, badge poke-out)?
- Does every hover/focus state have a transition?
- Are numbers using `tabular-nums` and proper thousand separators?

## Cross-reference

- [hidden-ui.md](hidden-ui.md), empty / loading / error state mechanics
- [color.md](color.md), accent colors
- [depth.md](depth.md), overlap and hover lift
