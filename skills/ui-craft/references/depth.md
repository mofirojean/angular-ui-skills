# Creating depth

From *Refactoring UI* Ch. 6. Depth is what makes a flat-looking dashboard feel like a real surface with stacked layers, instead of a Word document.

## Emulate a light source

Pick a direction for the light, then use it consistently for *every* shadow on the page.

The convention: light comes from *above*. Shadows fall *below* and slightly to the right (or just below). Never mix light directions on the same page; the brain notices and the page feels wrong without knowing why.

```css
/* All shadows in this app use this direction */
.shadow-sm { box-shadow: 0 1px 2px 0 oklch(0 0 0 / 0.05); }
.shadow    { box-shadow: 0 1px 3px 0 oklch(0 0 0 / 0.1), 0 1px 2px -1px oklch(0 0 0 / 0.1); }
.shadow-md { box-shadow: 0 4px 6px -1px oklch(0 0 0 / 0.1), 0 2px 4px -2px oklch(0 0 0 / 0.1); }
.shadow-lg { box-shadow: 0 10px 15px -3px oklch(0 0 0 / 0.1), 0 4px 6px -4px oklch(0 0 0 / 0.1); }
.shadow-xl { box-shadow: 0 20px 25px -5px oklch(0 0 0 / 0.1), 0 8px 10px -6px oklch(0 0 0 / 0.1); }
```

Tailwind's defaults follow this convention. Use them directly.

## Use shadows to convey elevation

Shadow size maps to *how far above the page* the element is. Bigger shadow = floating higher. The order from lowest to highest:

| Elevation | Shadow | Used for |
|---|---|---|
| Flush | none | Page background, card body |
| Resting | `shadow-sm` | Inputs, default cards on a tinted background |
| Lifted | `shadow` / `shadow-md` | Buttons on hover, sticky headers |
| Floating | `shadow-lg` | Popovers, dropdowns, tooltips |
| Modal | `shadow-2xl` | Dialogs, sheets |

Don't mix elevations randomly. A button at `shadow-2xl` looks broken because it's "floating" higher than the modal that would actually float above it.

## Shadows can have two parts

Real shadows have two components:

1. **Close shadow**, small, tight, just under the object (the contact shadow). Makes it feel like it sits on the surface.
2. **Ambient shadow**, large, soft, spreads out further. Makes it feel like it occupies space.

Tailwind's `shadow-md` / `shadow-lg` already implement this with two `box-shadow` declarations. Don't replace them with single-layer shadows.

## Even flat designs can have depth

A flat design (no shadows at all) can still feel layered if you use *value contrast* between layers:

- Page background: very light grey (`bg-zinc-50`)
- Card on the page: white (`bg-white`)
- Element inside the card (an active row, a selected item): slightly tinted (`bg-muted/40`)

Each layer has different luminance, so they read as stacked even without shadow. This is the "shadcn aesthetic" and the default for Spartan/ng.

In dark mode, the same gradient inverts:
- Background: deep `bg-zinc-950`
- Card: `bg-zinc-900`
- Active element: `bg-zinc-800`

The page reads as layered without a single drop-shadow.

## Overlap to create layers

Sometimes the cheapest depth cue is *overlap*. An avatar that overlaps the top edge of a card. A status badge that pokes out of a card's top-right corner. A label that sits half-on, half-off a section divider.

```html
<div class="relative rounded-lg border border-border bg-card p-6 pt-10">
  <hlm-avatar class="absolute -top-6 left-6 size-12 ring-4 ring-background">
    ...
  </hlm-avatar>
  <h3 class="text-base font-semibold">Sasha Lin</h3>
  <p class="text-sm text-muted-foreground">Staff engineer · 3 years</p>
</div>
```

The avatar pokes above the card. The `ring-4 ring-background` carves it visually out of the card's edge. This is depth via overlap, no shadow needed.

## Borders, dividers, and outlines

Borders are a depth tool. Used sparingly, they read as the edge of an object. Used everywhere, they shred the page into a wireframe.

Rules:
- A card has a `border border-border` to separate it from the page
- A row inside a list has a `border-b border-border` only when the visual hierarchy needs the separation. Often, a `divide-y divide-border` on the list is enough.
- A button has no border unless it's a `variant="outline"`
- Section dividers: a horizontal rule (`border-t border-border my-6`) or just spacing. Spacing usually wins.

When in doubt, **fewer borders, more contrast**. Borders are last resort.

## Hover states use elevation

When the user hovers a clickable card, a small elevation change tells them "this responds":

```html
<article class="rounded-lg border border-border bg-card shadow-sm
                hover:shadow-md hover:-translate-y-0.5
                transition-all duration-200">
```

The `-translate-y-0.5` lifts the card 2px on hover. The shadow grows from `sm` to `md`. The transition makes it feel responsive without being twitchy.

For dense surfaces (table rows), the hover state is usually `hover:bg-muted/40`, no shadow. Shadows in tables look gimmicky.

## Inset shadow / sunken state

Occasionally you want the opposite: an element that looks pressed *into* the surface. Use `shadow-inner`:

- Code blocks (`pre`) with a sunken background
- Form inputs with a subtle sunken state when focused-down or filled
- Sliders showing the track

```css
.code-block { box-shadow: inset 0 2px 4px 0 oklch(0 0 0 / 0.06); }
```

## Glow / focus rings

A focus ring is technically depth: the ring "lifts" the focused element above peers. Always use `:focus-visible` (not `:focus`) so the ring only appears for keyboard navigation, not mouse clicks.

```css
:focus-visible {
  outline: 2px solid var(--color-ring);
  outline-offset: 2px;
}
```

Use a slightly darker offset on tinted backgrounds so the ring stays visible.

## Depth checklist

- Is there *one* light direction in the app, and are all shadows obeying it?
- Are my elevations in a stack (lowest to highest), with no random `shadow-2xl` button next to a `shadow-sm` modal?
- Did I try value contrast before reaching for shadows?
- Did I use overlap as a depth cue where it'd be cleaner than a shadow?
- Are borders the last resort, not the first?

## Cross-reference

- [color.md](color.md), value contrast between layers
- [finishing.md](finishing.md), accent borders and background decoration
- [hierarchy.md](hierarchy.md), depth is one way to emphasize without size
