# Layout

> Status: outline. Fill in.

## Accordion

- Multi-panel collapsible region
- `[multiple]` for multi-open, `[(activeIndex)]` for controlled state
- Lazy content patterns

## Panel

- Collapsible single panel with header + content
- Toggle button + custom header template

## Tabs

- Modern tab API in v18+ (replaces TabView)
- `[(value)]` for controlled active tab
- Closable tabs, scrollable tabs

## Stepper

- Multi-step flows
- Linear vs non-linear navigation
- Replaces deprecated Steps component

## Splitter

- Resizable horizontal/vertical split
- `[panelSizes]`, `[minSizes]`
- Nested splitters for grids

## Fieldset

- `<fieldset>` styled wrapper with optional toggle
- Use for form sections

## Divider

- Horizontal / vertical divider with optional centered label
- `[type]`: solid, dashed, dotted

## Toolbar

- Slotted header bar (start / center / end)
- Common shell pattern

## Card

- Header / subheader / content / footer slots
- Lightweight container with consistent padding + radius

## Scroller (VirtualScroller)

- Windowed list rendering for very long lists
- `[itemSize]`, `[items]`, `<ng-template let-item>`
- When to use vs CDK Virtual Scroll

## ScrollTop

- Floating "back to top" button
- `[target]`: `'window'` | `'parent'`

## BlockUI

- Visual lock of a region during async work
- `[blocked]`, optional spinner overlay
