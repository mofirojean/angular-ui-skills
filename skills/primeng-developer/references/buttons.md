# Buttons

PrimeNG ships three button components. `Button` covers ~95% of cases; `SplitButton` and `SpeedDial` exist for specific action-cluster patterns.

## Button

Two equivalent forms, both supported:

- **Component**: `<p-button label="Save" icon="pi pi-check" />`
- **Directive**: `<button pButton type="submit">Save</button>` on a native `<button>`

```typescript
import { Button } from 'primeng/button';

@Component({ imports: [Button], template: `...` })
```

### Inputs

| Input | Type | Notes |
|---|---|---|
| `label` | string | Button text. Deprecated as a `pButton` input in v20+, use the `pButtonLabel` directive on the host for new code. |
| `icon` | string | PrimeIcons class (e.g. `"pi pi-check"`). Deprecated as a `pButton` input, use `pButtonIcon`. |
| `iconPos` | `'left' \| 'right' \| 'top' \| 'bottom'` | Position of the icon relative to label. |
| `severity` | `'primary' \| 'secondary' \| 'success' \| 'info' \| 'warn' \| 'help' \| 'danger' \| 'contrast'` | Color intent. |
| `variant` | `'outlined' \| 'text'` | Visual style. |
| `[raised]` | boolean | Elevated shadow. |
| `[rounded]` | boolean | Full pill corners. |
| `[link]` | boolean | Renders as a text link with no background. |
| `size` | `'small' \| 'large'` | Sizing (omit for default). |
| `[loading]` | boolean | Spinner + disables clicks. |
| `loadingIcon` | string | Custom spinner icon class. |
| `[disabled]` | boolean | Disables interaction. |
| `type` | `'button' \| 'submit' \| 'reset'` | Native button type (works on both component and directive form). |

### Events

- `(onClick)` , click handler. Standard `MouseEvent`.

### Patterns

```html
<!-- primary call to action -->
<p-button label="Save" icon="pi pi-check" (onClick)="save()" />

<!-- destructive confirm -->
<p-button label="Delete" icon="pi pi-trash" severity="danger" variant="outlined" />

<!-- icon-only (REQUIRES aria-label) -->
<p-button icon="pi pi-refresh" [rounded]="true" aria-label="Reload data" />

<!-- loading state -->
<p-button label="Saving..." [loading]="saving()" (onClick)="save()" />

<!-- on a native button -->
<button pButton type="submit" severity="primary">Submit</button>
```

### v21 deprecation: directive composition

The `pButton` directive deprecated its `label`, `icon`, `iconPos`, and `loadingIcon` inputs in v20+. New code should compose the directive with `pButtonLabel` and `pButtonIcon`:

```html
<!-- v17-v19 style (still works, deprecated) -->
<button pButton label="Save" icon="pi pi-check"></button>

<!-- v20+ recommended -->
<button pButton>
  <i pButtonIcon class="pi pi-check"></i>
  <span pButtonLabel>Save</span>
</button>
```

The `<p-button>` component form continues to accept the simpler `label` / `icon` inputs.

## SplitButton

Primary action plus a dropdown of secondary actions.

```typescript
import { SplitButton } from 'primeng/splitbutton';
import { MenuItem } from 'primeng/api';
```

```html
<p-splitbutton
  label="Save"
  icon="pi pi-check"
  [model]="saveActions"
  (onClick)="save()"
/>
```

```typescript
saveActions: MenuItem[] = [
  { label: 'Save as draft', icon: 'pi pi-file', command: () => this.saveDraft() },
  { label: 'Save & close', icon: 'pi pi-times', command: () => this.saveAndClose() },
  { separator: true },
  { label: 'Discard', icon: 'pi pi-ban', command: () => this.discard() },
];
```

### Inputs

| Input | Type | Notes |
|---|---|---|
| `label` | string | Primary button text. |
| `icon` | string | Primary button icon. |
| `model` | `MenuItem[]` | Dropdown items. See [menus.md](./menus.md) for the `MenuItem` shape. |
| `severity` | `'primary' \| ... \| 'contrast'` | Same set as Button. |
| `[raised]`, `[rounded]`, `[text]`, `[outlined]`, `[disabled]` | boolean | Same visual modifiers as Button. |

### Events

- `(onClick)` , primary button click.
- `(onMenuShow)` / `(onMenuHide)` , dropdown lifecycle.

### When to use

Reach for SplitButton when there's one obvious default action plus a small set of related alternates (Save / Save as draft / Save & close). For unrelated actions, use a regular Button next to a `Menu` overlay instead, the visual coupling of SplitButton implies "alternate forms of the same action".

## SpeedDial

Floating action button that fans out into a menu.

```typescript
import { SpeedDial } from 'primeng/speeddial';
```

```html
<p-speeddial
  [model]="quickActions"
  direction="up"
  type="linear"
  [mask]="true"
  showIcon="pi pi-plus"
  hideIcon="pi pi-times"
/>
```

### Inputs

| Input | Type | Notes |
|---|---|---|
| `model` | `MenuItem[]` | Action items. Same shape as SplitButton. |
| `type` | `'linear' \| 'circle' \| 'semi-circle' \| 'quarter-circle'` | Layout of the fanned-out items. |
| `direction` | `'up' \| 'down' \| 'left' \| 'right' \| 'up-left' \| 'up-right' \| 'down-left' \| 'down-right'` | Where items expand. |
| `[mask]` | boolean | Backdrop overlay when open. Improves focus and dismisses on backdrop click. |
| `showIcon` | string | Icon when closed (commonly `"pi pi-plus"`). |
| `hideIcon` | string | Icon when open (commonly `"pi pi-times"`). |
| `radius` | number | Circle layouts only, the radius of the arc. |
| `transitionDelay` | number | Stagger between item animations (ms). |

### Events

- `(onShow)` / `(onHide)` , menu open/close.
- `(onVisibleChange)` , consolidated visibility change.

### When to use

SpeedDial is a *mobile-first* pattern. On a desktop dashboard, a regular toolbar with Buttons usually communicates affordances more clearly. Use SpeedDial when:

- You need a floating control over scrollable content.
- The available actions are exploratory (the user opens the dial to see what's there).
- Real estate is tight.

## Accessibility

All three components ship sane defaults: `role="button"`, focus rings, Enter / Space activation, `aria-disabled` when disabled.

**Required by you:**
- Icon-only buttons must set `aria-label`. The component won't error if you forget, but screen readers will announce nothing.
- SplitButton/SpeedDial models that drive navigation should set `routerLink` on the `MenuItem`, not rely on `command`. `routerLink` brings keyboard focus management and history support for free.

## Common pitfalls

1. **Forgetting `aria-label` on icon-only buttons** , silent a11y failure.
2. **Mixing `label`/`icon` inputs and `pButtonLabel`/`pButtonIcon` directives** in the same `pButton`. Pick one; the directive form is recommended for v20+.
3. **Wrong severity for destructive actions** , use `severity="danger"`, not a custom red class. The severity drives both color and any built-in confirmation patterns downstream (e.g. ConfirmDialog severity inference).
4. **SplitButton with no `model`** , renders a plain button with a non-functional caret. Always supply `model`, even an empty array, before binding.
5. **SpeedDial without `[mask]="true"` on touch** , easy to dismiss accidentally by panning. The mask catches taps and gives a clear close affordance.
