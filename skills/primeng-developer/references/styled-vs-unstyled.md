# Styled vs Unstyled mode

PrimeNG ships two ways to consume the library. Pick before you start, switching mid-project is doable but invasive.

## The two modes at a glance

| Mode | Who ships CSS? | Customization path | Best for |
|---|---|---|---|
| **Styled** (default) | PrimeNG | Design tokens + `pt` | Most projects, especially without a design system |
| **Unstyled** | You (typically Tailwind) | `pt` + utility classes | Teams with an existing design system or pixel-perfect Figma library |

In Styled mode, PrimeNG emits all the CSS variables and theme rules for the active preset. In Unstyled mode, *"the css variables of the design tokens and the css rule sets that utilize them are not included"*, you supply everything visual.

## Picking a mode

**Use Styled when:**
- New project, no fixed design system.
- You want dark mode and accessibility tokens for free.
- Token-level customization (via [theming.md](./theming.md)) covers your needs.

**Use Unstyled when:**
- The team already owns a Tailwind-driven design system.
- You need pixel-perfect alignment with a Figma library.
- You want fewer CSS bytes shipped from PrimeNG (Tailwind owns the bundle).

If you're not sure, default to Styled. Unstyled is the bigger commitment.

## Enabling Unstyled mode

### Globally

```typescript
import { ApplicationConfig } from '@angular/core';
import { providePrimeNG } from 'primeng/config';

export const appConfig: ApplicationConfig = {
  providers: [
    providePrimeNG({
      unstyled: true,
      pt: {
        button: {
          root: 'bg-teal-500 hover:bg-teal-700 active:bg-teal-900 cursor-pointer py-2 px-4 rounded-full border-0 flex gap-2',
          label: 'text-white font-bold text-lg',
          icon: 'text-white !text-xl',
        },
      },
    }),
  ],
};
```

Once `unstyled: true` is set, every component renders with no built-in styles, you must supply them via `pt` (either globally as above, or per-instance).

### Per-instance opt-in

Stay in Styled mode globally but mark a single component as unstyled:

```html
<p-button [unstyled]="true" label="Custom Styled" class="my-classes" />
```

Useful for incremental migration or one-off custom components inside a Styled app.

## Pairing Unstyled with Tailwind

`tailwindcss-primeui` is the recommended plugin. *"Tailwind CSS is perfect fit for the unstyled mode."*

**Tailwind v4** (CSS entry point):

```css
@import "tailwindcss";
@import "tailwindcss-primeui";
```

**Tailwind v3** (config plugin):

```javascript
// tailwind.config.js
module.exports = {
  plugins: [require('tailwindcss-primeui')],
};
```

What the plugin gives you:

- Color utilities mapped to PrimeNG semantic tokens: `bg-primary`, `text-surface-500`, `text-muted-color`
- Animation utilities for `styleclass` and `animateonscroll` directives
- Variants for PrimeNG component states: `p-outlined:`, `p-vertical:`

The semantic color utilities are the big win, they let you write `class="bg-primary"` instead of hardcoding `bg-blue-500`, and the color follows your active preset.

## Volt UI (reference patterns)

PrimeTek ships **Volt UI**, a reference set of unstyled-and-restyled components, *"based on the unstyled PrimeVue and Tailwind CSS v4"*. Volt uses a *"code ownership model where the components are located in the application codebase rather than node_modules"*, you copy the components into your repo and own them outright (similar to Spartan/ng's Helm pattern).

**Status (as of PrimeNG v21):** Volt is Vue-only today. *"Volt will also be available for PrimeReact... In the future, PrimeTek may bring Volt to Angular via PrimeNG if there is significant community demand."*

For Angular projects, treat Volt-Vue as a reference for *which* `pt` rules to apply per component, not as a drop-in dependency.

## How `pt` behaves in each mode

**Styled mode**, `pt` is **additive**, classes layer on top of the theme:

```html
<p-button label="Save" [pt]="{ root: 'ring-2 ring-offset-2 ring-amber-500' }" />
```

The button keeps its preset background, color, and radius; the ring gets added.

**Unstyled mode**, `pt` is **load-bearing**, no built-in styles exist, you supply all of them:

```html
<p-button
  [unstyled]="true"
  [pt]="{
    root: 'bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded',
    label: 'text-white font-bold',
  }"
/>
```

See [passthrough.md](./passthrough.md) for the full `pt` API.

## Dark mode

**Styled mode**: dark mode is handled by `theme.options.darkModeSelector` (see [theming.md](./theming.md)). PrimeNG emits separate dark-mode token values automatically.

**Unstyled mode**: PrimeNG's `darkModeSelector` is **inert**, you implement dark mode through Tailwind's `dark:` variants instead:

```html
<p-button
  [unstyled]="true"
  [pt]="{
    root: 'bg-blue-600 dark:bg-blue-400 text-white dark:text-gray-900',
  }"
/>
```

Configure Tailwind's `darkMode` to align with however your app toggles dark (`'class'` with a custom class on `<html>` is the most common pattern).

## Bundle size

Not officially quantified. Rough trade-off:

- **Styled** ships PrimeNG's theme CSS (roughly 50, 100 KB depending on preset, often less after gzip).
- **Unstyled** drops that entirely, but you pay the cost in Tailwind output, which depends on how aggressively your build prunes unused utilities.

For most projects the difference is in the same order of magnitude. Don't choose Unstyled for bundle size alone, choose it for customization control.

## Migration: Styled to Unstyled

Order of operations:

1. Set `unstyled: true` in `providePrimeNG()`.
2. Install `tailwindcss-primeui` and add it to your Tailwind setup.
3. Define a **global `pt`** in `providePrimeNG()` covering every component you use, the global rules become your "theme". Skipping this step means every instance needs its own `pt`.
4. Remove any usage of `styleClass` (the input is meaningful only in Styled mode for some components).
5. Drop reliance on `--p-*` CSS variables in custom stylesheets, they're no longer emitted.
6. Audit overlays carefully (Dialog, Drawer, Popover, Toast), z-index, positioning, and backdrop styling must all be re-applied via `pt`.

Expect this to take longer than you think. The conversion itself is mechanical, but every component you touch needs a styling decision.

## Common pitfalls

1. **Unstyled mode with no `pt`** renders components with zero styling, often invisible. Always pair `unstyled: true` with at least a global `pt` config.
2. **Forgetting `tailwindcss-primeui`** in Unstyled mode means you don't get the semantic color utilities; `bg-primary` won't resolve.
3. **Setting `[unstyled]="true"` on one instance without supplying styles** renders that single instance broken while everything else looks fine, easy to miss in code review.
4. **Dark mode mismatch**: in Unstyled mode, setting `darkModeSelector: '.my-app-dark'` does nothing, configure Tailwind dark mode instead.
5. **Mixing styled and unstyled in the same component tree** is allowed but confusing, document the boundary clearly if you do it.
