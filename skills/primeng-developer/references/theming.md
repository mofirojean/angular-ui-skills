# Theming

> Status: outline. Fill in.

## Design-token model

- Three tiers: primitive → semantic → component
- How tokens map to CSS variables (`var(--p-primary-color)`, etc.)
- Token prefix configurable via `options.prefix`

## Presets

- Aura, Lara, Nora, Material — when to pick which
- Import path: `@primeuix/themes/<preset>`

## Dark mode

- `darkModeSelector` option: `'system'` | `'.my-app-dark'` | custom | `'false'`
- Toggling dark mode at runtime (class on `<html>`)
- Aligning with Tailwind's `darkMode` config when both are used

## Customizing a preset

- `definePreset(Aura, {...})` for token overrides
- Primary palette override: `updatePrimaryPalette({ ... })`
- Surface palette override: `updateSurfacePalette({ ... })`
- Component-level token override via `components.<name>`

## Runtime preset switching

- `usePreset(NewPreset)` to swap entirely
- `updatePreset({...})` to merge changes
- When this is useful (theme switcher UI)

## Accessing tokens in TypeScript

- `$dt('primary.color')` helper for resolving a token to its CSS variable
- When to use `$dt` vs reading `var(--p-...)` directly

## CSS layer order

- Default: `base, theme, primeng, components, utilities`
- How to set with `providePrimeNG({ theme: { options: { cssLayer: {...} } } })`
- Tailwind v4 compatibility notes
