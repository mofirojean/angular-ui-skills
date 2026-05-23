# Styled vs Unstyled mode

> Status: outline. Fill in.

## The two modes

- **Styled** (default) — PrimeNG ships its own styles, themed via design tokens. Lowest setup cost.
- **Unstyled** — PrimeNG ships only behavior; you provide all the styles (typically Tailwind).

## When to pick Styled

- New project with no existing design system
- You want dark mode + accessibility "for free"
- You're fine with token-level customization

## When to pick Unstyled

- The team already owns a Tailwind-based design system
- You need pixel-perfect alignment with a Figma library
- You want fewer CSS bytes shipped to the client

## Enabling Unstyled

- `providePrimeNG({ unstyled: true })`
- Per-component opt-in: `[unstyled]="true"` on a single instance

## Pairing Unstyled with Tailwind

- `tailwindcss-primeui` plugin: what it provides
- Volt UI as a reference implementation of "Unstyled + Tailwind"
- Suggested Tailwind config: dark mode, layer order, theme tokens that map to PrimeNG tokens

## What changes between modes

- `pt` API works in both modes
- Theme presets only apply in Styled mode
- `definePreset` has no effect in Unstyled

## Hybrid: Styled base + per-component Unstyled

- When this makes sense (rare but valid)
- Gotchas with `pt` and global config interacting
