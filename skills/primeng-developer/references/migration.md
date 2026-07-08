# Migration notes

PrimeNG has a clear v17 → v18 split (rewrite of theming, several renames), then incremental no-breaking-change releases for v19, v20, and v21. The biggest source of AI errors is using v17 names after v18+ renames, this file documents each.

PrimeNG adopted **semantic versioning + a no-breaking-change policy starting v20**. Treat v19/v20/v21 upgrades as drop-in (with one exception in v21, see below).

## v17 → v18 (the big one)

### Renamed components

Old import paths still work but are deprecated. Migrate.

| v17 name | v18+ name | New import path |
|---|---|---|
| Calendar | DatePicker | `primeng/datepicker` |
| Dropdown | Select | `primeng/select` |
| InputSwitch | ToggleSwitch | `primeng/toggleswitch` |
| OverlayPanel | Popover | `primeng/popover` |
| Sidebar | Drawer | `primeng/drawer` |

### Removed components

Replaced functionality elsewhere.

| Removed | Replacement |
|---|---|
| TriStateCheckbox | Checkbox with `indeterminate` option |
| DataViewLayoutOptions | SelectButton |
| `pAnimate` directive | `pAnimateOnScroll` |
| Messages component | Loop over array and render a Message per item |
| Message interface in `primeng/api` | Renamed to `ToastMessageOptions` |

### Deprecated components (still functional, slated for removal)

| Deprecated | Replacement |
|---|---|
| Chips | AutoComplete with `[multiple]="true"` and typeahead off |
| TabMenu | Tabs without panels |
| Steps | Stepper without panels |
| InlineMessage | Message component |
| TabView | The new Tabs component family |
| Old Accordion API (`AccordionTab`, `activeIndex`) | New AccordionPanel / AccordionHeader / AccordionContent + `[(value)]` |

### Theme system rewrite

The legacy SCSS theme system is gone. There is no `theme.css` import anymore.

**v17 (legacy):**
```typescript
// styles.scss or angular.json styles array
@import "primeng/resources/themes/lara-light-blue/theme.css";
@import "primeng/resources/primeng.css";
```

**v18+:**
```typescript
// app.config.ts
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';

providers: [
  providePrimeNG({ theme: { preset: Aura } }),
]
```

Drop every reference to `primeng/resources/...`. Install `@primeuix/themes`. See [theming.md](./theming.md).

### Removed style classes

| v17 class | Replacement |
|---|---|
| `.p-link` | Use `<p-button variant="link">` |
| `.p-highlight` | Per-component class, e.g. `.p-select-option-selected` |
| `.p-fluid` | The new `[fluid]` input on supported components, or the `Fluid` component |

### Other v18 breakers

- **`Sidebar` (now `Drawer`) `size` property removed** , use responsive class utilities.
- **`PrimeNGConfig`** , replaced by injecting `PrimeNG` from `primeng/config`. Initial config now happens in `providePrimeNG()`.

### `PrimeFlex` users

If you used PrimeFlex CSS for layout utilities, upgrade to **PrimeFlex v4**. v3 is incompatible with PrimeNG v18+.

## v19 → v20

Mostly additive. The two notable items:

### `[invalid]` input on form controls

v20 added a unified `[invalid]` input to every form-bearing component. It replaces relying on Angular's automatic `.ng-invalid.ng-dirty` selectors.

**Old (still works, deprecated):**
```html
<input pInputText formControlName="email" />
<!-- styles via .ng-invalid.ng-dirty in CSS -->
```

**New (recommended):**
```html
<input pInputText formControlName="email" [invalid]="isInvalid('email')" />
```

You decide when to mark a control invalid (typically `dirty && (touched || submitted)`). See [forms.md](./forms.md).

### `pTemplate` silently fails with standalone component imports

`pTemplate` is a directive (`PrimeTemplate` from `primeng/api`). When you import a component's standalone class (`import { OrderList } from 'primeng/orderlist'`), `PrimeTemplate` is **not** pulled into your template's compilation scope, so `<ng-template pTemplate="item">` compiles cleanly as an unknown attribute and the template **never registers**. There is no build error and no runtime error, the component just renders its fallback (usually empty labels or blank rows). Legacy `*Module` imports (`TableModule`, etc.) don't hit this because they re-export `SharedModule`, which carries `PrimeTemplate`.

**Broken (standalone import + pTemplate):**
```typescript
import { OrderList } from 'primeng/orderlist';
```
```html
<p-orderList [value]="tracks">
  <ng-template pTemplate="item" let-track>{{ track.title }}</ng-template>
  <!-- renders empty rows: pTemplate is inert without SharedModule -->
</p-orderList>
```

**Fixed (template reference, the v21-preferred form):**
```html
<p-orderList [value]="tracks">
  <ng-template #item let-track>{{ track.title }}</ng-template>
</p-orderList>
```

Every v21 component content-queries named template refs directly (`#item`, `#header`, `#body`, `#content`, `#display`, `#empty`, …) with `PrimeTemplate` kept only as a legacy fallback. Since `pTemplate` is deprecated for removal in v22 anyway, always use the `#ref` form in new code.

### `styleClass` deprecated in favor of native `class`

Every host-enabled component (Table, DataView, ProgressBar, FileUpload, Slider, Toast, and most others) previously exposed a `styleClass: string | undefined` input to inject classes into the rendered element. It's deprecated since v20 because Angular's native `class` binding already reaches the host element.

**Old (deprecated, still works):**
```html
<p-table [value]="rows" styleClass="songs-table">…</p-table>
<p-progressBar [value]="pct" styleClass="import-progress" />
```

**New (v20+):**
```html
<p-table [value]="rows" class="songs-table">…</p-table>
<p-progressBar [value]="pct" class="import-progress" />
```

Use `[class]="expr()"` or `[ngClass]="{ 'is-active': cond }"` for dynamic values. Existing `::ng-deep` selectors that matched both classes on one element (`.foo.p-fileupload`) continue to work because PrimeNG's host metadata puts its `p-*` class on the same host element that receives your `class` attribute.

### Package source migration

The internal styles and tokens moved from `@primeng/themes` to `@primeuix/themes` (shared with PrimeVue, PrimeReact).

```typescript
// before
import Aura from '@primeng/themes/aura';

// after (PrimeNG v20+)
import Aura from '@primeuix/themes/aura';
```

`@primeng/themes` is deprecated but still re-exports `@primeuix/themes` for backward compatibility, slated for removal in v22.

### v20 deprecations (removal in v22)

| API | Replacement |
|---|---|
| `@primeng/themes` | `@primeuix/themes` |
| `pTemplate="x"` | `<ng-template #x>` with template ref, see the warning below |
| `styleClass` on host-enabled components | Native `class` attribute, see the section below |
| Global `inputStyle` config | `inputVariant` |
| CamelCase selectors (`<p-confirmDialog>`) | Kebab-case (`<p-confirmdialog>`) , both work today |
| `pButton` `icon`, `label`, `iconPos`, `loadingIcon` properties | `pButtonIcon` and `pButtonLabel` directives |
| `pButton buttonProps` property | Set button properties directly on the element |
| `<p-button>` `badgeClass` property | `badgeSeverity` |
| AutoComplete `minLength` | `minQueryLength` |
| Paginator `dropdownAppendTo` | `appendTo` |
| Message `text` and `escape` properties | Content projection |
| Password `maxLength` | `maxlength` (native) |
| TreeSelect `containerStyle` / `containerStyleClass` | `style` / `class` |
| Table `responsiveLayout` | Always defaults to `scroll`; `stack` mode needs custom impl |
| `pBadge` directive | `OverlayBadge` component |

### v20 removals (deprecated in v18, removed in v20)

Components: Calendar, Dropdown, InputSwitch, OverlayPanel, Sidebar, Chips, TabMenu, Steps, Messages, InlineMessage, TabView. If you're on v20 and still importing these by old names, **they will not resolve**, update the import paths.

## v20 → v21

Drop-in upgrade with **one exception**:

### `provideAnimationsAsync()` is no longer required

PrimeNG v21 migrated from Angular's animations package to **native CSS-based animations** (because Angular deprecated `@angular/animations` in v20.2).

**Implications:**
- You can **remove `provideAnimationsAsync()`** from `app.config.ts`. It still works (and is required for many other Angular libraries), but PrimeNG no longer needs it.
- `showTransitionOptions` and `hideTransitionOptions` properties on components are deprecated and **no longer functional**. They don't throw, but customizations are ignored. Move animation customization to CSS class overrides , see [animations docs](https://primeng.org/guides/animations) for the new approach.

### v21 deprecations (removal in v22)

| API | Replacement |
|---|---|
| `showTransitionOptions` | Native CSS animations |
| `hideTransitionOptions` | Native CSS animations |
| Directive PT attribute prefix (e.g. `ptInputText`) | Suffix form (e.g. `pInputTextPT`) |
| `contextMenuSelectionMode="joint"` | `"separate"` (default in v22; applies to Tree, TreeTable, Table) |

### What's new in v21

- **PassThrough (`pt`)** , richer customization surface (see [passthrough.md](./passthrough.md)).
- **Unstyled mode** , fully supported workflow with `tailwindcss-primeui` (see [styled-vs-unstyled.md](./styled-vs-unstyled.md)).
- **Native CSS animations** , the rewrite mentioned above.
- **Initial zoneless support** , Components run cleanly under `provideZonelessChangeDetection()`.
- **`@primeuix/styles` and `@primeuix/themes`** , both should be `2.0.2+`. Fresh installs handle this automatically.

## Pre-flight checklist when adopting

If you're migrating an existing project to PrimeNG v21:

1. **Drop SCSS theme imports** , no more `primeng/resources/...`.
2. **Install** `@primeuix/themes @primeuix/styles` (if not already) and wire `providePrimeNG({ theme: { preset: Aura } })` in `app.config.ts`.
3. **Rename v17 component imports** , `Calendar → DatePicker`, `Dropdown → Select`, `InputSwitch → ToggleSwitch`, `OverlayPanel → Popover`, `Sidebar → Drawer`.
4. **Migrate `@primeng/themes` imports** to `@primeuix/themes`.
5. **Switch validation styling to `[invalid]`** on form controls. Stop relying on `.ng-invalid.ng-dirty` selectors.
6. **Remove or keep `provideAnimationsAsync()`** , no longer required by PrimeNG v21, but other libraries (Angular Material, etc.) might need it.
7. **Audit `*Module` imports** , prefer standalone class imports for new code (`import { Button } from 'primeng/button'`).
8. **Drop `showTransitionOptions` / `hideTransitionOptions`** , they're no-ops in v21.
9. **Search for `Messages` (plural)** , replace with array + loop of `Message`.
10. **Rename every `styleClass="…"` to `class="…"`** , see the v20 deprecations section above; the class attribute reaches the host element and behaves identically.
11. **Replace `pTemplate="x"` with `<ng-template #x>`** , mandatory wherever the component is imported standalone (the directive isn't in scope and fails silently), and the `#ref` form is the v21-preferred syntax everywhere else.
12. **Run `ng build`** and verify no compile errors. Visual changes are likely (the new tokens differ from the v17 SCSS theme).

## When in doubt

Each component's docs page (e.g. `primeng.org/select`) shows the **current** API. If something in older code looks unfamiliar, search the v18 / v19 / v20 migration sections of the official docs , the rename or replacement is usually one click away.
