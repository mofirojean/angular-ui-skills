# Setup

## Install via schematics (recommended)

```
ng add ng-zorro-antd
```

The schematic asks four questions and wires everything for you:

1. **Use icons (recommended)**, adds `provideNzIcons(IconDefinitions)` to `app.config.ts`.
2. **Set up custom theme file**, creates `src/theme.less` and configures `angular.json` to compile it.
3. **Choose the locale**, registers `provideNzI18n(<locale>)` and imports the matching locale into `app.config.ts`.
4. **Choose components / template**, blank or a starter template (sidebar, dashboard).

After it finishes:
- `provideNzI18n` and (optionally) `provideNzIcons` are registered in `app.config.ts`.
- `ng-zorro-antd/ng-zorro-antd.min.css` (or `.less`) is added to `angular.json` `styles`.
- `provideAnimationsAsync()` is registered (NG-ZORRO needs Angular animations).
- `@angular/cdk` is installed as a peer.

## Manual install

```
npm install ng-zorro-antd
npm install @angular/cdk
```

Then in `app.config.ts`:

```ts
import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { en_US, provideNzI18n } from 'ng-zorro-antd/i18n';
import { provideNzIcons } from 'ng-zorro-antd/icon';
import { registerLocaleData } from '@angular/common';
import en from '@angular/common/locales/en';

registerLocaleData(en);

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),    // optional, NG-ZORRO supports zoneless
    provideAnimationsAsync(),            // required for Modal, Drawer, etc.
    provideNzI18n(en_US),                // required for DatePicker, Pagination, table empty text
    provideNzIcons(),                    // required if you use <nz-icon>
  ],
};
```

Add the base styles in `angular.json`:

```json
"styles": [
  "node_modules/ng-zorro-antd/ng-zorro-antd.min.css",
  "src/styles.css"
]
```

Or, if you want LESS-variable theming, swap the `.css` for `src/styles.less` that imports `ng-zorro-antd/ng-zorro-antd.less`. See [theming.md](./theming.md).

## Importing components

NG-ZORRO v18+ ships every component as a standalone class. Prefer the standalone import for new code:

```ts
import { NzButtonComponent } from 'ng-zorro-antd/button';

@Component({
  imports: [NzButtonComponent],
  template: `<button nz-button nzType="primary">Save</button>`,
})
export class SaveControl {}
```

Older code uses module imports (still supported, do not introduce new usages):

```ts
import { NzButtonModule } from 'ng-zorro-antd/button';

@Component({
  imports: [NzButtonModule],
  template: `<button nz-button nzType="primary">Save</button>`,
})
```

## Icon registration

`<nz-icon>` only renders icons that have been registered. Two patterns:

**Register everything (largest bundle, simplest):**
```ts
import * as AllIcons from '@ant-design/icons-angular/icons';
const icons = Object.values({ ...AllIcons });
provideNzIcons(icons);
```

**Register only what you use (recommended):**
```ts
import { UserOutline, SettingOutline } from '@ant-design/icons-angular/icons';
provideNzIcons([UserOutline, SettingOutline]);
```

## Common pitfalls

1. **Forgetting `provideNzI18n`.** Symptom: DatePicker renders without month/day labels, Table empty text is missing, console errors about "no locale provided". Fix: register a locale in `app.config.ts`.
2. **Forgetting `provideAnimationsAsync`.** Symptom: Modal/Drawer pop in/out without animation, dropdowns appear without easing. Fix: add the provider.
3. **Major-version mismatch.** Installing `ng-zorro-antd@21` into an Angular 20 project fails npm peer checks. The major numbers MUST match. Upgrade Angular first.
4. **Mixing module and standalone imports for the same component.** Both work, but importing `NzButtonModule` AND `NzButtonComponent` in the same component bloats the bundle. Pick one per component.
5. **Using `<nz-icon>` without registering the icon.** Symptom: blank space where the icon should be, console warning "icon not found". Fix: add the icon to `provideNzIcons([...])`.
