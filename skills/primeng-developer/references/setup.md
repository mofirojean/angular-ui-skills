# Setup

How to install PrimeNG v18+ in an Angular project, wire the config, and confirm it renders.

## Install

```sh
npm install primeng @primeuix/themes @primeuix/styles
```

Three packages:

- **`primeng`**, the component library itself.
- **`@primeuix/themes`**, design-token presets (Aura, Lara, Nora, Material). Required for Styled mode (the default).
- **`@primeuix/styles`**, base styles the components compile against. PrimeNG pulls this in for you, but install it explicitly so npm pins the version.

> **Do not import from `@primeng/themes` or `primeng/resources`.** Those paths existed before v18 and no longer ship. v18+ replaces the old SCSS theme system with `@primeuix/themes`.

PrimeNG v21 targets Angular v17+ (standalone APIs and `provideAnimationsAsync()` are both required).

## Wire `app.config.ts`

This is the minimum config to make components render:

```typescript
import { ApplicationConfig } from '@angular/core';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';

export const appConfig: ApplicationConfig = {
  providers: [
    providePrimeNG({
      theme: {
        preset: Aura,
      },
    }),
  ],
};
```

> **PrimeNG v21+ uses native CSS animations.** `provideAnimationsAsync()` is **no longer required** for PrimeNG itself, and `showTransitionOptions` / `hideTransitionOptions` are deprecated. On v18, v19, v20 you DO need `provideAnimationsAsync()` from `@angular/platform-browser/animations/async`, add it there. See [migration.md](./migration.md).

## Choose a preset

`@primeuix/themes` ships four presets. Import from `@primeuix/themes/<name>`:

| Preset | Import path | Feel |
|---|---|---|
| Aura | `@primeuix/themes/aura` | Modern, balanced. Recommended default. |
| Lara | `@primeuix/themes/lara` | Bootstrap-adjacent, slightly denser. |
| Nora | `@primeuix/themes/nora` | Tighter borders, more compact. |
| Material | `@primeuix/themes/material` | Material Design 3-ish. |

Swap by changing one import + the `preset:` reference. See [theming.md](./theming.md) for runtime preset switching and `definePreset()` overrides.

## `providePrimeNG` options

The full shape:

```typescript
providePrimeNG({
  theme: {
    preset: Aura,
    options: {
      prefix: 'p', // CSS variable prefix → --p-primary-color, etc.
      darkModeSelector: 'system', // 'system' | '.my-dark-class' | 'false'
      cssLayer: false, // or { name: 'primeng', order: '...' }
    },
  },
  ripple: false, // material-style ripple on click; off by default
  inputVariant: 'outlined', // 'outlined' | 'filled'
  overlayAppendTo: 'self', // 'self' | 'body', where overlays attach in the DOM
  zIndex: { modal: 1100, overlay: 1000, menu: 1000, tooltip: 1100 },
  csp: { nonce: '...' }, // for strict CSP environments
  translation: { accept: 'OK', reject: 'Cancel', /* ...full i18n bundle */ },
  filterMatchModeOptions: { /* per-data-type Table filter modes */ },
})
```

Most projects only need `theme`. Reach for the others when you have a specific reason.

## CSS layer setup (Tailwind v4 / strict cascade)

If the project uses Tailwind v4 or any other CSS that competes with PrimeNG's selectors, enable the `primeng` layer:

```typescript
providePrimeNG({
  theme: {
    preset: Aura,
    options: {
      cssLayer: {
        name: 'primeng',
        order: 'base, theme, primeng, components, utilities',
      },
    },
  },
})
```

Order matters: PrimeNG must come **after** Tailwind's `base` and `theme` (so resets land first) but **before** `utilities` (so `class="bg-blue-500"` can still override PrimeNG defaults).

## Verify the install

Drop a Button somewhere visible and run `ng serve`:

```typescript
// any standalone component
import { Button } from 'primeng/button';

@Component({
  selector: 'app-root',
  imports: [Button],
  template: `<p-button label="Hello PrimeNG" />`,
})
export class App {}
```

If the button renders with primary-color background and rounded corners → setup is correct. If it renders as a plain `<button>` with no styling → almost always one of the pitfalls below.

## Common pitfalls

1. **Forgetting `provideAnimationsAsync()` on v18, v19, v20.** Symptom: Dialog won't open, Toast doesn't slide, Accordion content jumps without animating. Add the provider. (Not needed on v21+, which uses CSS animations.)

2. **Importing from `@primeng/themes`.** Symptom: TypeScript error "module not found". Fix: change to `@primeuix/themes/<preset>`. `@primeng/themes` is deprecated in v20 and removed in v22.

3. **Importing `primeng/resources/themes/...`.** Symptom: same as above. The old SCSS theme system is gone in v18+. Remove the import and add `providePrimeNG({ theme: { preset: ... } })`.

4. **Mixing `*Module` with standalone class imports.** PrimeNG v18+ ships both for back-compat, but pick one per consumer. New code: import the class (e.g. `Button` from `primeng/button`), add it to the component's `imports: [...]`. Don't mix `ButtonModule` and `Button` in the same project.

5. **Using v17 component names** (`Calendar`, `Dropdown`, `OverlayPanel`, `Sidebar`, `InputSwitch`). v18 renamed them, see [migration.md](./migration.md).

6. **CSS conflicts with Tailwind v4.** Symptom: PrimeNG components inherit Tailwind's preflight too aggressively, or Tailwind utilities don't override PrimeNG defaults. Fix: enable `cssLayer` with the order shown above.

7. **`unstyled` mode without Tailwind setup.** Symptom: components render with no styles at all. Either turn off `unstyled` (use the preset) or pair it with `tailwindcss-primeui`. See [styled-vs-unstyled.md](./styled-vs-unstyled.md).
