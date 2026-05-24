# Theming

PrimeNG v18+ uses a design-token theme system. Tokens compile to CSS variables; you override tokens (not CSS) to customize the look.

## The three tiers

1. **Primitive tokens**, context-free values. The color palette is the canonical example: `green.50` through `green.900`.
2. **Semantic tokens**, context-aware aliases that point at primitives. `primary.color` resolves to (e.g.) `green.500`.
3. **Component tokens**, per-component knobs that map to semantics. `button.background` resolves to `primary.color`, which resolves to `green.500`.

The cascade flows **Primitive → Semantic → Component → CSS variable**. Override at any tier; lower tiers re-resolve automatically.

## How tokens become CSS variables

Every token compiles to a CSS variable prefixed with `--p-` (the prefix is configurable via `theme.options.prefix`).

| Token | CSS variable |
|---|---|
| `primary.color` | `--p-primary-color` |
| `surface.ground` | `--p-surface-ground` |
| `button.border.radius` | `--p-button-border-radius` |

Use them in your own CSS:

```css
.my-card {
  background: var(--p-surface-50);
  color: var(--p-text-color);
}
```

## Presets

`@primeuix/themes` ships four presets, Aura, Lara, Nora, Material. They're each a full token tree you can drop in:

```typescript
import Aura from '@primeuix/themes/aura';

providePrimeNG({
  theme: { preset: Aura },
})
```

Swap presets by changing the import + the `preset:` reference. Token names are stable across presets, `primary.color` exists everywhere, so component overrides keep working when you swap.

## Customizing a preset with `definePreset`

Import `definePreset` and pass `(basePreset, overrides)`:

```typescript
import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';

const MissionControl = definePreset(Aura, {
  primitive: {
    green: {
      50: '#f0fdf4',
      500: '#22c55e',
      900: '#15803d',
    },
  },
  semantic: {
    primary: {
      color: '{green.500}',
      contrastColor: '#ffffff',
    },
    surface: {
      0: '#ffffff',
      50: '#f9fafb',
      900: '#111827',
    },
  },
  components: {
    button: {
      borderRadius: '0.5rem',
    },
    inputtext: {
      borderRadius: '0.25rem',
    },
  },
});

export default MissionControl;
```

Then wire it in `app.config.ts`:

```typescript
import MissionControl from './theme/mission-control';

providePrimeNG({
  theme: { preset: MissionControl },
})
```

The `{green.500}` syntax is a **token reference**, it tells PrimeNG "resolve this at compile time to whatever `green.500` is". Use references whenever one semantic token points at another (e.g. `primary.color` → `{green.500}`).

> **Type safety caveat:** the overrides object is loosely typed, nested paths accept any string. TypeScript won't catch typos like `bordeRadius` or invalid token references. Treat token names as you would CSS strings: check the preset source if you're not sure.

## Runtime preset switching

Inject the `PrimeNG` service and call methods on it:

```typescript
import { Component, inject } from '@angular/core';
import { PrimeNG } from 'primeng/config';
import OceanPreset from './theme/ocean';

@Component({ /* ... */ })
export class ThemeSwitcher {
  private primeng = inject(PrimeNG);

  goOcean() {
    this.primeng.usePreset(OceanPreset);   // full preset swap
  }

  bumpPrimary() {
    this.primeng.updatePreset({            // merge a partial override
      semantic: { primary: { color: '#3b82f6' } },
    });
  }

  updatePrimary() {
    this.primeng.updatePrimaryPalette({    // shorthand for primary palette
      50: '#eff6ff',
      500: '#3b82f6',
      900: '#1e3a8a',
    });
  }

  updateSurface() {
    this.primeng.updateSurfacePalette({    // shorthand for surface palette
      0: '#ffffff',
      50: '#f9fafb',
      900: '#111827',
    });
  }
}
```

Pick based on scope:
- `usePreset(NewPreset)`, full swap (theme picker UI).
- `updatePreset({...})`, partial merge into the current preset.
- `updatePrimaryPalette(...)` / `updateSurfacePalette(...)`, single-palette shortcuts.

All four mutate the live DOM tokens, so the UI updates immediately with no re-render needed.

## Dark mode

Configure via `theme.options.darkModeSelector`:

```typescript
providePrimeNG({
  theme: {
    preset: Aura,
    options: {
      darkModeSelector: 'system', // default, follows OS via prefers-color-scheme
      // darkModeSelector: '.my-app-dark', // class on <html>/<body>
      // darkModeSelector: false, // disable dark mode entirely
    },
  },
})
```

| Value | Behavior |
|---|---|
| `'system'` (default) | Listens to `@media (prefers-color-scheme: dark)`. |
| `'.classname'` | Dark mode active when that class is present on an ancestor (typically `<html>`). |
| `false` | No dark mode; only light tokens emit. |

**Class-based toggle pattern:**

```typescript
toggleDark() {
  document.documentElement.classList.toggle('my-app-dark');
}
```

When using a class selector, align it with Tailwind's `darkMode` config, set Tailwind's `darkMode: ['class', '.my-app-dark']` so both systems flip in lockstep.

**Per-scheme token values**, define a token differently for light vs dark:

```typescript
definePreset(Aura, {
  semantic: {
    surface: {
      ground: {
        colorScheme: {
          light: '#ffffff',
          dark: '#1f2937',
        },
      },
    },
  },
})
```

This is how the shipped presets do dark mode internally; you only need it when overriding a token that should differ between modes.

## Reading tokens from TypeScript with `$dt`

```typescript
import { $dt } from '@primeuix/themes';

const primary = $dt('primary.color');
// { value: '#22c55e', variable: '--p-primary-color', ... }
```

Use cases:
- Setting a token value on an inline `style` binding from component code.
- Feeding token values to a non-PrimeNG library (charts, custom canvas).

For CSS, prefer `var(--p-primary-color)` directly, `$dt` is for code that needs the value at runtime.

## CSS layer setup

When PrimeNG sits alongside Tailwind, opt into a CSS layer so the cascade is predictable:

```typescript
providePrimeNG({
  theme: {
    preset: Aura,
    options: {
      cssLayer: {
        name: 'primeng',
        order: 'base, theme, primeng, utilities',
      },
    },
  },
})
```

**Tailwind v4**, declare layers in your CSS entry:

```css
@import "tailwindcss";
@import "@primeuix/themes";
```

Tailwind v4 automatically wraps utilities in a `utilities` layer; PrimeNG joins via the `primeng` layer you named above.

**Tailwind v3**, declare layers explicitly:

```css
@layer base, primeng, utilities;
```

And add the PrimeUI plugin:

```javascript
// tailwind.config.js
module.exports = {
  plugins: [require('tailwindcss-primeui')],
};
```

Rule of thumb either way: **`primeng` must come after `base` and `theme`, before `utilities`**. That way Tailwind's reset lands first, PrimeNG paints on top, and your `class="bg-red-500"` overrides still win.

Without `cssLayer`, PrimeNG and Tailwind specificity-fight on every shared selector. Symptoms: `class="bg-blue-500"` doesn't override a PrimeNG default, or Tailwind preflight visibly breaks PrimeNG visuals. Fix is always: enable the layer.

## Where to find token names

There's no single canonical "all tokens" reference. Sources to check, in order:

1. **The component's docs page** on primeng.org has a *Theming* section listing every token that component exposes.
2. **The preset source** under `@primeuix/themes/<preset>`, read the JSON-shaped export to see what's available.
3. **DevTools**, inspect a rendered component and look at the computed `--p-*` variables.

When customizing, override what you find; don't guess token names.

## Common pitfalls

1. **Overriding the wrong tier.** If `primary.color` needs to change site-wide, override the **semantic** token, not every component that uses it. Component-level overrides are for one-off tweaks.

2. **Forgetting `{ }` around token references.** `color: 'green.500'` is treated as a literal string `"green.500"`. The correct form is `color: '{green.500}'`.

3. **Token name typos.** Loosely typed, no compile-time check. If a token "doesn't apply", check the spelling against the preset source.

4. **Dark mode class mismatch with Tailwind.** If PrimeNG uses `.my-app-dark` and Tailwind uses `.dark`, only one of them switches when you toggle. Align the class names.

5. **No `cssLayer` + Tailwind v4.** Tailwind utilities silently lose to PrimeNG defaults. Enable the layer.

6. **Editing the shipped preset.** Never modify `node_modules/@primeuix/themes/...`, your override won't survive `npm install`. Always use `definePreset()` and a local file.
