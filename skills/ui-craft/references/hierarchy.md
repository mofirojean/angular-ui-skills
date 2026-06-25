# Hierarchy

From *Refactoring UI* Ch. 2. Hierarchy is the discipline of making sure the reader's eye lands on the *important* thing first, the *useful* thing second, and only optionally on everything else.

## Not all elements are equal

The instinct of a beginner is to make every element the same: same heading size, same button weight, same text color. The result is a wall of grey, and the reader has to read all of it to find the answer.

Treat your page like a newspaper. There's a headline, a subhead, a byline, body copy, captions, asides. Each tier of importance has a different *size, weight, color, or position* to set it apart.

## The three hierarchy levers

You can emphasize an element by combining three levers. **Always reach for the lower-cost levers first.**

1. **Color and weight** (cheap, subtle): `font-medium` vs `font-normal`, `text-foreground` vs `text-muted-foreground`. These are the *first* tools, not the last.
2. **Size** (medium, more disruptive to layout): `text-sm` vs `text-base` vs `text-lg`. Be careful; raising size affects line-height and spacing.
3. **Treatment** (heavy, breaks the rhythm): a badge, a background fill, an underline, a border. Reserve for elements that *must* stand alone.

Beginners reach for treatment first. Experts emphasize the headline via *weight + color*, leaving the layout calm.

## Size isn't everything

Two pieces of text can be visually different without changing their size. Use weight and color first.

```html
<!-- Beginner pattern: emphasize the title by making it bigger -->
<div>
  <h3 class="text-xl">Total revenue</h3>
  <p>$48,230</p>
</div>

<!-- Better: keep the number the loud element, calm the label -->
<div>
  <p class="text-xs uppercase tracking-wider text-muted-foreground">Total revenue</p>
  <p class="text-2xl font-semibold tabular-nums">$48,230</p>
</div>
```

Notice the label *got smaller* and the value stayed visually dominant via weight + size. The hierarchy is louder because the label de-emphasized itself.

## Emphasize by de-emphasizing

The opposite move is often the right one. Instead of making the important thing more visible, make everything else *less* visible.

A row of buttons where one is primary and the rest are secondary:

- **Wrong**: primary is filled blue, secondaries are filled grey. All have backgrounds. Visual noise.
- **Right**: primary is filled, secondaries are ghost (text-only) or outlined. The filled one stands alone.

A header with a status chip:

- **Wrong**: every metadata field has a background tint. The chip blends in.
- **Right**: only the status chip has a fill. Everything else is text + muted color. The chip stands alone.

## Don't use grey text on colored backgrounds

This is the most common beginner mistake. A muted grey label is fine on a white background. The same grey on a tinted background (`bg-muted/40`, `bg-emerald-50`, `bg-blue-100`) becomes unreadable because the contrast collapses.

When you tint the background, *brighten or saturate the foreground* in proportion. Or use a darker shade of the same hue (`text-emerald-700 on bg-emerald-50`, never `text-zinc-500 on bg-emerald-50`).

## Labels are a last resort

If a piece of UI needs a label to be understood, ask whether the label can be eliminated by improving the affordance.

- A user avatar with a name beside it: the name might be redundant if the avatar tooltip shows the name on hover
- A "Filters" label above a row of toggle chips: the chips themselves announce that they're filters via shape (rounded, grouped, with a state)
- An icon button: still needs a label *for accessibility*, but the label moves into `aria-label` + tooltip, not visible chrome

When you can't eliminate the label, *de-emphasize it ruthlessly*. Use `text-xs`, `text-muted-foreground`, `uppercase tracking-wider`. Pull it above the value, not beside it. The value is what the user came for; the label is the prop.

## Separate visual hierarchy from document hierarchy

Document hierarchy is `<h1>`, `<h2>`, `<h3>` for accessibility and SEO. Visual hierarchy is *what looks important*. They aren't always the same.

You can use `<h2>` for a section title visually styled at `text-xs uppercase tracking-wider text-muted-foreground` if the semantic structure demands it but the design wants the section header to be quiet. Use `<p class="text-2xl font-semibold">` for a "headline-looking" element that is structurally just a paragraph (e.g., a KPI value).

Don't choose a heading level by font size. Choose it by document outline, then style independently.

## Balance weight and contrast

Two equally important elements should weigh visually the same. When they don't, fix it by tuning *one or the other*, not both.

- A button group where Primary feels heavier than Secondary: usually the right move is to *de-emphasize Secondary* (make it ghost), not make Primary bigger.
- A two-column layout where the right rail looks heavier than the main column: usually the rail's section headings are too strong. Tame them with smaller text and muted color.

## Semantics are secondary

You write `<button>` for clickable things and `<a>` for navigation. That's the document layer. Visual hierarchy is a separate concern; don't let semantics force a particular look.

A "Settings" link that visually wants to feel like a button can absolutely be an `<a>` with a button's classes. A button that visually wants to look like a text link is still a `<button>` if it triggers an action.

## Checklist when reviewing a screen

- Can I name the *primary* element in 1 second? If no, hierarchy is broken.
- Are the secondary elements visibly secondary? If they're all "competing", de-emphasize all but one.
- Is any label competing with its value for attention? Mute the label.
- Is any colored background killing the foreground contrast? Brighten the foreground.
- Are two buttons of different importance the same weight? Change one to ghost.

## Cross-reference

- [typography.md](typography.md), the type scale that lets you grade text correctly
- [color.md](color.md), how to build a grey scale and a tone system
- [spacing.md](spacing.md), spacing is also a hierarchy lever (group via proximity)
