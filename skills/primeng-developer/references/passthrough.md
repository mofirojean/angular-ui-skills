# PassThrough (`pt`) API

> Status: outline. Fill in.

## What it is

- Per-component prop that injects classes, attributes, or event handlers into any internal DOM section
- The primary customization surface in PrimeNG (replaces forking component source)

## Section names

- Every component documents its `pt` section keys (e.g. Button has `root`, `label`, `icon`, `loadingIcon`)
- Where to find the section list (component docs page → "PT" tab)

## Value shapes

- **String** — applied as a class to the section's root element
- **Object** — applied as attributes (`class`, `style`, event listeners, ARIA)
- **Function** — receives a context (instance, parent state) and returns string/object dynamically

## Global `pt` via `providePrimeNG`

- Apply the same `pt` rules across every instance of a component app-wide
- Useful for design-system enforcement
- Precedence: instance `pt` > global `pt`

## Nested-component prefix (`pc*`)

- When component A internally renders component B, target B from A's `pt` with the `pc<Name>` prefix
- Example: `pt: { pcBadge: { root: '...' } }` on a Button styles the nested Badge

## `ptOptions`

- `mergeSections: true | false` — merge instance and global section objects
- `mergeProps: true | false | function` — control how individual props merge

## When to use `pt` vs design tokens vs Unstyled

- Token first (theme-wide change)
- `pt` second (per-component override that the token system can't express)
- Unstyled last (you've fundamentally outgrown PrimeNG's styling)

## Common pitfalls

- Forgetting to import the `pt` types — TS will allow typos that silently no-op
- Class collisions when both global and instance `pt` set the same section without merge
- Pseudo-selectors and complex states (`:hover`, `data-p-highlight`) — when `pt` falls short and you need a CSS file
