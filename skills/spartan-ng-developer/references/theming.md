# Theming

Spartan's theme system is built on **CSS custom properties** (variables) referenced by Tailwind utility classes. Light vs dark theme is a class toggle on `<html>`. Custom themes are additional variables registered via Tailwind v4's `@theme inline` directive.

> **Spartan is optimized for Tailwind v4.** Some theming features (custom variables exposed as utility classes) don't work cleanly with v3. New projects should be on v4.

## 1. The CSS variable model

Spartan defines ~25 semantic variables in two contexts:
- `:root` - the default (light) theme.
- `.dark` - overrides applied when the `.dark` class is present on `<html>`.

Components consume these via Tailwind utilities - e.g. `bg-background`, `text-foreground`, `border-border` resolve to `oklch(...)` values from the variables.

### Variable categories

| Group | Variables | Purpose |
|---|---|---|
| Page surface | `--background`, `--foreground` | Default body bg/text |
| Card | `--card`, `--card-foreground` | Card surface |
| Popover | `--popover`, `--popover-foreground` | Popover/tooltip surface |
| Primary | `--primary`, `--primary-foreground` | Primary actions |
| Secondary | `--secondary`, `--secondary-foreground` | Secondary actions |
| Muted | `--muted`, `--muted-foreground` | De-emphasized content |
| Accent | `--accent`, `--accent-foreground` | Highlights |
| Destructive | `--destructive` | Errors / destructive actions |
| Form / outline | `--border`, `--input`, `--ring` | Borders, input borders, focus rings |
| Sidebar | `--sidebar`, `--sidebar-foreground`, `--sidebar-primary`, `--sidebar-primary-foreground`, `--sidebar-accent`, `--sidebar-accent-foreground`, `--sidebar-border`, `--sidebar-ring` | Sidebar component theme (independent of main page) |
| Radius | `--radius` | Border-radius scale (default `0.625rem`) |

## 2. Default theme block

Add the following to your global stylesheet (`src/styles.css`) after the Tailwind/Spartan layer imports from [setup.md](setup.md). This is the default neutral theme.

```css
:root {
  color-scheme: light;
  --font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
  --radius: 0.625rem;
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.145 0 0);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.145 0 0);
  --primary: oklch(0.205 0 0);
  --primary-foreground: oklch(0.985 0 0);
  --secondary: oklch(0.97 0 0);
  --secondary-foreground: oklch(0.205 0 0);
  --muted: oklch(0.97 0 0);
  --muted-foreground: oklch(0.556 0 0);
  --accent: oklch(0.97 0 0);
  --accent-foreground: oklch(0.205 0 0);
  --destructive: oklch(0.577 0.245 27.325);
  --border: oklch(0.922 0 0);
  --input: oklch(0.922 0 0);
  --ring: oklch(0.708 0 0);
  --sidebar: oklch(0.985 0 0);
  --sidebar-foreground: oklch(0.145 0 0);
  --sidebar-primary: oklch(0.205 0 0);
  --sidebar-primary-foreground: oklch(0.985 0 0);
  --sidebar-accent: oklch(0.97 0 0);
  --sidebar-accent-foreground: oklch(0.205 0 0);
  --sidebar-border: oklch(0.922 0 0);
  --sidebar-ring: oklch(0.708 0 0);
}

:root.dark {
  color-scheme: dark;
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  --card: oklch(0.205 0 0);
  --card-foreground: oklch(0.985 0 0);
  --popover: oklch(0.205 0 0);
  --popover-foreground: oklch(0.985 0 0);
  --primary: oklch(0.922 0 0);
  --primary-foreground: oklch(0.205 0 0);
  --secondary: oklch(0.269 0 0);
  --secondary-foreground: oklch(0.985 0 0);
  --muted: oklch(0.269 0 0);
  --muted-foreground: oklch(0.708 0 0);
  --accent: oklch(0.269 0 0);
  --accent-foreground: oklch(0.985 0 0);
  --destructive: oklch(0.704 0.191 22.216);
  --border: oklch(1 0 0 / 10%);
  --input: oklch(1 0 0 / 15%);
  --ring: oklch(0.556 0 0);
  --sidebar: oklch(0.205 0 0);
  --sidebar-foreground: oklch(0.985 0 0);
  --sidebar-primary: oklch(0.985 0 0);
  --sidebar-primary-foreground: oklch(0.205 0 0);
  --sidebar-accent: oklch(0.269 0 0);
  --sidebar-accent-foreground: oklch(0.985 0 0);
  --sidebar-border: oklch(1 0 0 / 10%);
  --sidebar-ring: oklch(0.556 0 0);
}
```

After the two variable blocks, the `ui-theme` schematic also appends a base layer that applies the border/foreground tokens globally:

```css
@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

> **Use `oklch()`, not hex or HSL.** Spartan's defaults are in `oklch` (perceptually uniform color space) for better dark-mode contrast and easier tweaking. Stay in `oklch` when defining custom values - mixing color spaces produces inconsistent perceived lightness.

> **Dark-mode selector is `:root.dark`** — the class goes on `<html>` (which IS `:root`). A `body.dark` or scoped `.dark` selector won't match Spartan's stylesheet.

## 3. Toggling dark mode

Apply or remove the `.dark` class on `<html>`. A minimal Angular theme service:

```ts
import { Injectable, inject, signal } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly _mode = signal<'light' | 'dark'>('light');
  readonly mode = this._mode.asReadonly();

  setMode(mode: 'light' | 'dark') {
    this._mode.set(mode);
    this.document.documentElement.classList.toggle('dark', mode === 'dark');
  }

  toggle() {
    this.setMode(this._mode() === 'light' ? 'dark' : 'light');
  }
}
```

Wire to a button:

```html
<button hlmBtn variant="outline" (click)="theme.toggle()">
  Toggle theme
</button>
```

For SSR: read the user's preference at server-render time (cookie, `prefers-color-scheme` header) and emit the `.dark` class server-side to avoid a light-mode flash on hydration.

## 4. Custom theme variables

To add domain-specific colors (e.g. a `warning` color) and use them with Tailwind utilities like `bg-warning`:

```css
/* 1. Define the variables in :root and .dark */
:root {
  --warning: oklch(0.84 0.16 84);
  --warning-foreground: oklch(0.28 0.07 46);
}

.dark {
  --warning: oklch(0.41 0.11 46);
  --warning-foreground: oklch(0.99 0.02 95);
}

/* 2. Expose them to Tailwind via @theme inline */
@theme inline {
  --color-warning: var(--warning);
  --color-warning-foreground: var(--warning-foreground);
}
```

Now in templates:

```html
<div class="bg-warning text-warning-foreground">Warning content</div>
```

> **The `@theme inline` block is what makes the variable usable as `bg-X` / `text-X` / `border-X`.** Skipping it means the variable exists but Tailwind generates no utility for it.

## 5. Preset themes

Spartan ships five neutral base themes - each with its own `:root` + `.dark` variable values:

- **Neutral** (achromatic) - the default shown above
- **Stone** (warm neutral)
- **Zinc** (cool neutral)
- **Gray** (balanced neutral)
- **Slate** (blue-tinted neutral)

Switch the active theme by replacing the variable values in `:root` and `.dark`. The Spartan docs site at [spartan.ng/documentation/theming](https://spartan.ng/documentation/theming) shows each preset's full variable block - copy the one that matches the user's brand.

## 6. Per-component theming

To override a variable for a scoped region only, redefine the variable on a parent element:

```html
<section class="[--primary:oklch(0.6_0.2_25)]">
  <!-- Helm components inside use the overridden --primary -->
  <button hlmBtn>Custom primary</button>
</section>
```

This works because CSS variables cascade. Useful for marketing pages or feature-flag-gated style tests without touching global theme.

## 7. Tailwind v3 limitations

If the project is locked to Tailwind v3, the following won't work cleanly:

- The `@theme inline` directive - v3 doesn't recognize it. Custom-variable colors must be added via `tailwind.config.js` `theme.extend.colors` instead.
- Some Spartan components may have visual regressions because the preset assumes v4 layer ordering.

The Spartan docs are explicit: "spartan/ui is optimized for Tailwind CSS v4. Some theming features may not work correctly with v3." For new projects, start on v4. For existing v3 projects, plan a migration if heavy theming is needed.

## 8. Generating a theme via CLI

```sh
# Angular CLI
ng g @spartan-ng/cli:ui-theme

# Nx
npx nx g @spartan-ng/cli:ui-theme
```

This schematic seeds (or replaces) the theme variable block in `src/styles.css`. Useful right after `init` to apply a different preset. Re-running replaces the block - back up custom additions first.

## 9. Common gotchas

| Symptom | Cause | Fix |
|---|---|---|
| `bg-warning` (custom utility) is undefined | Missing `@theme inline` block exposing the variable | Add the `@theme inline { --color-warning: var(--warning); }` block |
| Dark mode toggle does nothing | `.dark` class isn't on `<html>` | Toggle via `document.documentElement.classList.toggle('dark', isDark)` |
| Flash of wrong theme on page load | Theme set in component lifecycle, after initial render | Set the class in `index.html` head script or during SSR |
| Custom variable values look wrong vs preset | Mixed color spaces (hex / hsl alongside oklch) | Convert everything to `oklch()` for consistency |
| Sidebar looks unthemed | Custom theme didn't override the `--sidebar-*` variables | Update all 8 sidebar variables in both `:root` and `.dark` |
| Component still light in dark mode | `.dark` selector only applies to descendants; component renders in a portal outside `<html>` | Verify portal containers also receive the `.dark` class (CDK overlay containers inherit by default if `.dark` is on `<html>`) |

## See also

- [Back to SKILL.md](../SKILL.md)
- [Setup](setup.md) - Tailwind preset + layer imports must be in place before the theme block.
- [Helm conventions](helm-conventions.md) - how Helm components consume these variables internally.
- Official docs: [spartan.ng/documentation/theming](https://spartan.ng/documentation/theming) - full preset variable blocks.
