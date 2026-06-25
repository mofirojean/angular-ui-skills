# Setup

## Install via schematics (recommended)

```
ng add @angular/material
```

The schematic asks three questions and wires everything for you:

1. **Custom theme or prebuilt?** Pick *Custom theme*, the schematic creates a `styles.scss` with `mat.theme()` and a default violet palette. The prebuilt themes use M2 internals and aren't recommended for new projects.
2. **Set up global typography?** Yes, this installs the Roboto font and wires `mat-typography` on `<body>`.
3. **Include browser animations?** Yes, this adds `provideAnimationsAsync()` to `app.config.ts`.

After it finishes:
- `@angular/material` and `@angular/cdk` are in `dependencies`.
- `src/styles.scss` contains a `mat.theme()` block with a default palette.
- `app.config.ts` includes `provideAnimationsAsync()`.
- `angular.json` `styles` array points at `src/styles.scss`.
- `<body class="mat-typography">` is added to `index.html` (if you opted in to typography).

## Manual install

```
npm install @angular/material @angular/cdk
```

In `src/styles.scss`:

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

In `angular.json`, set `"styles": ["src/styles.scss"]`.

In `app.config.ts`:

```ts
import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),    // optional, Material is zoneless-compatible
    provideAnimationsAsync(),            // required for ripples, menu, dialog, snackbar
    provideRouter(routes),
  ],
};
```

## Importing components

Material v15+ exports every component as a standalone class. Prefer the standalone import:

```ts
import { MatButton } from '@angular/material/button';

@Component({
  selector: 'app-save',
  imports: [MatButton],
  template: `<button mat-flat-button>Save</button>`,
})
export class SaveButton {}
```

The legacy `MatButtonModule` still re-exports the same classes, do not introduce new module imports in v15+ code.

## Common pitfalls

1. **No animations.** Symptom: ripples don't show, menu opens with no transition, dialog backdrop pops in. Fix: ensure `provideAnimationsAsync()` is in `app.config.ts`.
2. **Missing `@angular/animations` peer dep.** `ng add @angular/material --animations=enabled` does **not** always install `@angular/animations` as a top-level dep, even though `provideAnimationsAsync()` dynamically imports `@angular/animations/browser` at runtime. The build fails with `Could not resolve "@angular/animations/browser"`. Fix: `npm install @angular/animations@^21.2.0` (match your Angular minor). This same gotcha hits NG-ZORRO's animation provider too.
3. **Missing `@angular/cdk`.** Material cascades into CDK for overlay, portal, a11y. If `@angular/cdk` isn't in dependencies, dialogs and dropdowns throw on construction.
4. **`styles.css` instead of `styles.scss`.** The theming engine requires Sass. Rename and update `angular.json`.
5. **Color-scheme not set.** Without `color-scheme: light dark`, native form controls render in light mode even when your app is dark. Add it on `html` in `styles.scss`.
6. **Using `mat.define-light-theme()` in v19+.** That API is M2-only. Switch to `mat.theme()`, see [theming.md](./theming.md).
7. **Browser-default `<button>` border bleeds through "borderless" designs.** If you build custom controls (calendar cells, kanban cards, nav rows) on `<button>` elements, the user-agent stylesheet draws a `buttonborder` line that's especially visible in light mode. Explicitly set `border: none` on the host. This isn't Material-specific, but Material's heavy use of `<button>` for icon and list-item triggers makes it show up frequently.

8. **Using `@HostListener` / `@HostBinding` in new code.** Symptom: works, but the host expressions get no compile-time type check, and the decorators don't compose cleanly with signal-based APIs. Fix: declare host bindings via the `host: {}` metadata in `@Component` / `@Directive`, then enable `typeCheckHostBindings: true` under `angularCompilerOptions` in `tsconfig.json`. Pattern:
   ```ts
   @Component({
     // ...
     host: {
       '(window:keydown)': 'onKey($event)',
       '[class.dark]': "mode() === 'dark'",
     },
   })
   ```
   Event targets (`window:`, `document:`, `body:`) live inside the parentheses of the key. This is an Angular fundamentals topic, not Material-specific, but it shows up in every component you'll write.
