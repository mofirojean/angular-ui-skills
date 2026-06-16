# Migration

Angular Material follows Angular's major version. Major numbers ALWAYS match `@angular/core`, when you bump Angular you bump Material in the same PR.

## v15, the standalone components cutover

- Every component became a standalone class. `MatButton`, `MatCard`, `MatFormField`, etc. now import directly: `import { MatButton } from '@angular/material/button'`.
- The legacy `MatButtonModule` and friends still export, prefer the standalone class in new code.

## v17, MDC migration complete

- Material v17 finished the migration to Google's MDC web component base. Old "legacy-*" components (`<mat-legacy-input>`, `<mat-legacy-card>`, etc.) were removed.
- If you see `mat-legacy-*` in old code, that's pre-v17, rename to the unprefixed version.

## v19, Material 3 becomes the default

The biggest break since standalone. M3 (Material 3) replaced M2 (Material 2) as the recommended theming engine.

**M2 (legacy):**
```scss
@use '@angular/material' as mat;

$theme: mat.define-light-theme((
  color: (
    primary: mat.define-palette(mat.$indigo-palette),
    accent: mat.define-palette(mat.$pink-palette, A200, A100, A400),
  ),
));

@include mat.all-component-themes($theme);
```

**M3 (current):**
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

The two compile to very different CSS, components themselves are largely unchanged (a few props were renamed). See [theming.md](./theming.md) for the M3 API in depth.

### Automated M2 → M3 migration

```
ng update @angular/material@19 --migrate-only
```

The schematic:
- Replaces `mat.define-light-theme(...)` calls with `mat.theme(...)`.
- Picks the closest M3 prebuilt palette for each M2 color choice.
- Comments out M2-specific mixins it can't translate (e.g. `mat.define-palette` with custom HSL tweaks), with a TODO for manual review.

After running, **expect to manually re-tune** primary/accent colors, the auto-picked palette is rarely a perfect match.

## v20, density expanded

- Density now accepts the full `0` → `-5` range, was effectively `0` → `-3` before.
- A few component default token names were renamed (e.g. `--mdc-filled-button-container-color` → `--mat-button-filled-container-color`). Most code unaffected, but custom token overrides need touch-up.

## v21, signal-based inputs

- Many component inputs migrated from `@Input()` to `input()`. The binding shape in templates is unchanged.
- `provideAnimationsAsync()` is still required, no change there.
- The `MatLuxonDateModule` and other date-adapter modules continue to work as before.

## v22, Angular 22 dependency

- Material v22 requires Angular v22. Both are now released in lockstep.
- No theming or component API changes from v21 to v22, this is purely a peer-dep bump.

## Cross-major upgrade pattern

1. **Upgrade Angular first.** `ng update @angular/core@<n> @angular/cli@<n>`.
2. **Upgrade Material + CDK to the same major.** `ng update @angular/material@<n>`. The CDK is pulled along automatically.
3. **Run `--migrate-only`** if jumping a major that ships theming changes (notably v18 → v19).
4. **Re-tune colors.** Automated palette picks rarely match brand exactly.
5. **`ng build`.** Look for "unknown mixin" or "undefined function" errors in `.scss`, those are M2 calls in an M3 context. Fix per [theming.md](./theming.md).

## Renamed / removed APIs to watch

| Old | New | Since |
|---|---|---|
| `mat-legacy-*` selectors | `mat-*` (unprefixed) | v17 |
| `MatButtonModule` (default) | Standalone `MatButton` import | v15 (preferred), v17 (canonical) |
| `mat.define-light-theme()` / `mat.define-dark-theme()` | `mat.theme()` mixin | v19 |
| `mat.all-component-themes($theme)` | Implicit, `mat.theme()` covers it | v19 |
| `mat.define-palette()` (custom hue tweaks) | Prebuilt palettes OR the `m3-theme` schematic | v19 |
| `mat.core()` | Implicit, called by `mat.theme()` | v19 |

If you encounter `mat.core()` or `mat.all-component-themes()` in old code, it's pre-v19. Run the v19 migration schematic.
