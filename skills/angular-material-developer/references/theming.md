# Theming (Material 3)

Angular Material v19 introduced **Material 3 (M3)** as the new default theming system. The legacy M2 system (with `mat.define-light-theme` / `mat.define-dark-theme`) still works but is documented as legacy in [migration.md](./migration.md).

## The mat.theme() mixin

Theming starts in `src/styles.scss`:

```scss
@use '@angular/material' as mat;

html {
  color-scheme: light dark;
  @include mat.theme((
    color: mat.$violet-palette,
    typography: Roboto,
    density: 0,
  ));
}
```

This single mixin emits all the CSS variables every Material component consumes. Pick:

- **`color`**, a prebuilt palette OR a custom palette map.
- **`typography`**, a font family string, OR a typography config map.
- **`density`**, integer from `0` (most spacious) to `-5` (most compact). `0` is the default, `-1` is a one-step tighter feel, `-3` is dense table mode.

## Prebuilt palettes

Material 3 ships 11 prebuilt palettes. Use any directly:

```scss
color: mat.$azure-palette,
color: mat.$blue-palette,
color: mat.$chartreuse-palette,
color: mat.$cyan-palette,
color: mat.$green-palette,
color: mat.$magenta-palette,
color: mat.$orange-palette,
color: mat.$red-palette,
color: mat.$rose-palette,
color: mat.$spring-green-palette,
color: mat.$violet-palette,
color: mat.$yellow-palette,
```

Each palette is a tonal scale generated from a hue anchor, M3's signature look.

## Dark mode

Two options:

**Automatic via `color-scheme: light dark`** , the browser picks based on `prefers-color-scheme`. Material's tokens swap automatically:

```scss
html {
  color-scheme: light dark;
  @include mat.theme(( color: mat.$violet-palette, ... ));
}
```

**Manual toggle via a class** , own the swap:

```scss
html.theme-light { color-scheme: light; }
html.theme-dark  { color-scheme: dark; }

html { @include mat.theme((color: mat.$violet-palette, ...)); }
```

Then in TypeScript flip `document.documentElement.classList.toggle('theme-dark')` based on a signal. Material reads `color-scheme` at runtime, no re-render needed.

## Custom palettes

For brand color matching, build a custom palette via the schematic. The command name in Material v21 is `theme-color`, **not** `m3-theme` (older docs and tutorials still cite the deprecated name):

```
ng generate @angular/material:theme-color \
  --primary-color="#0d9488" \
  --tertiary-color="#f97316" \
  --directory="src/styles"
```

It writes a `<directory>_theme-colors.scss` with a fully-tuned tonal scale exposing `$primary-palette` and `$tertiary-palette` Sass maps. Then use it:

```scss
@use '@angular/material' as mat;
@use 'styles/theme-colors' as brand;

html {
  color-scheme: light dark;
  @include mat.theme((
    color: (
      primary: brand.$primary-palette,
      tertiary: brand.$tertiary-palette,
    ),
    typography: Roboto,
    density: 0,
  ));
}
```

**Note on `--directory`:** the schematic concatenates the directory value onto the filename (so `--directory=src/styles` produces `src/styles_theme-colors.scss` at workspace root, not `src/styles/_theme-colors.scss` in a folder). Move the file into a proper folder + rename to a partial (`_theme-colors.scss`) after generation if you want clean structure.

## Per-component overrides

Sometimes you need a button or a card that breaks the global theme. Material exposes `mat.<component>-overrides()` mixins:

```scss
.danger-button-zone {
  @include mat.button-overrides((
    filled-container-color: var(--mat-sys-error),
    filled-label-text-color: var(--mat-sys-on-error),
  ));
}
```

Every Material component has an `*-overrides()` mixin. The token names match the variables exposed in Material's reference docs.

## Typography

Pass a font family string (uses sensible defaults for sizes):

```scss
typography: 'Inter, system-ui, sans-serif',
```

Or a full config map for fine-grained control:

```scss
typography: (
  plain-family: Inter,
  brand-family: 'Inter Display',
  bold-weight: 600,
  medium-weight: 500,
  regular-weight: 400,
),
```

Font files still need to be loaded by your app (via `<link rel="stylesheet">` in `index.html` or `@import url(...)` in `styles.scss`).

## Density

`density: 0` is the default Material spacing. Negative integers compress every component proportionally:

| density | Visual effect |
|---|---|
| `0` | Default. Form fields ~56px tall, buttons ~36px. |
| `-1` | Slightly tighter, good for forms-heavy admin UIs. |
| `-2` | Form fields ~48px, buttons ~32px. Compact dashboards. |
| `-3` | Form fields ~40px, buttons ~28px. Dense tables. |
| `-4` to `-5` | Extreme. Most surfaces become awkward, use only for embedded contexts. |

Density propagates through every component automatically.

## Common pitfalls

1. **`mat.theme()` placed at `:root`, not `html`.** Material expects `html { ... }` so the `color-scheme` cascade works. Putting it on `:root` works for vars but breaks native control coloring.
2. **Two `mat.theme()` blocks in the same file.** The second overrides the first silently, no warning.
3. **Setting density to a positive number.** Density is negative integers only (or zero). `density: 1` is rejected, `density: -1` is correct.
4. **Forgetting `color-scheme`.** Without it, native scrollbars and form controls stay light even under a dark Material theme.
5. **M2 mixins in an M3 file.** `mat.define-light-theme()` and `mat.all-component-themes()` are M2. In an M3 file (`mat.theme()` present) they compile but emit nothing useful. See [migration.md](./migration.md).
