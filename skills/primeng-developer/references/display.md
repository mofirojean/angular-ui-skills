# Display

> Status: outline. Fill in.

## Avatar

- Image / label / icon variants
- `size`: `normal`, `large`, `xlarge`
- `shape`: `square`, `circle`
- `AvatarGroup` for stacks

## Badge

- Numeric + label
- Severities, sizes
- Used standalone or via `pBadge` directive on another element

## OverlayBadge

- Badge floated over a host element (e.g. notifications icon)

## Chip

- Tag-style element with optional image + removable
- `[removable]` + `(onRemove)`

## Tag

- Compact status indicator
- Severities, rounded, icon

## Image

- Image with preview/lightbox
- `[preview]` opens a fullscreen viewer

## Skeleton

- Loading placeholders
- `shape`: `rectangle` / `circle`
- `[width]`, `[height]`, `[animation]`

## ProgressBar

- Determinate (`[value]`) and indeterminate modes
- `mode`: `determinate` | `indeterminate`

## ProgressSpinner

- Indeterminate spinner
- `[strokeWidth]`, `[animationDuration]`

## Message

- Inline alert (info / success / warn / error)
- `[closable]`
- Use for form-level errors and page banners

## MeterGroup

- Stacked / segmented progress bar
- For breakdowns (e.g. usage by category)

## Inplace

- Click-to-reveal editor pattern
- "Display" → "edit" content swap

## Ripple

- Directive (`pRipple`) — adds material-style ripple to a host
- Requires `provideRipple()` global enable (verify exact API name in docs)

## Terminal

- Inline terminal UI (uncommon — niche use)

## Tag vs Chip vs Badge

- Quick decision guide:
  - Status pill = **Tag**
  - Removable label = **Chip**
  - Counter / notification dot = **Badge**
