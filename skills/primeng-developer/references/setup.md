# Setup

> Status: outline. Fill in.

## Install

- Required npm packages: `primeng`, `@primeuix/themes`, `@primeuix/styles`
- Peer-dep / Angular version compatibility (target: PrimeNG v21, Angular v17+)
- Optional: `@primeuix/themes` extras (presets), `tailwindcss-primeui` (only for Unstyled mode)

## Wire `app.config.ts`

- `provideAnimationsAsync()` — what it does, why required
- `providePrimeNG({ theme: { preset: Aura } })` — minimal config
- Putting both in the `providers` array

## Choose a preset

- Aura (recommended default), Lara, Nora, Material — one-line summary of each
- Where the preset import comes from: `@primeuix/themes/aura` (NOT `@primeng/themes`)

## CSS layer setup

- `cssLayer: { name: 'primeng', order: 'base, theme, primeng, components, utilities' }`
- Why layer order matters when mixing with Tailwind v4

## Verify the install

- A hello-world Button that confirms styles render
- What "unstyled output" usually means (forgot the theme import, wrong preset path)

## Common pitfalls

- Forgetting `provideAnimationsAsync()` — symptom + fix
- Importing from `@primeng/themes` (wrong) instead of `@primeuix/themes`
- Using v17 component names after upgrading (link to [migration.md](./migration.md))
- Mixing standalone class with `*Module` import — pick one
