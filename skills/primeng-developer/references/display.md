# Display

Small, presentational components: avatars, badges, chips, tags, progress indicators, message banners, and a couple of niche utilities. None of them implement `ControlValueAccessor`, they're not form controls, just visuals.

## Avatar

User-image / initials placeholder.

```typescript
import { Avatar, AvatarGroup } from 'primeng/avatar';
```

```html
<p-avatar image="/img/mj.jpg" shape="circle" size="large" />
<p-avatar label="MJ" shape="circle" />
<p-avatar icon="pi pi-user" shape="square" />

<p-avatargroup>
  <p-avatar image="/img/a.jpg" shape="circle" />
  <p-avatar image="/img/b.jpg" shape="circle" />
  <p-avatar label="+3" shape="circle" />
</p-avatargroup>
```

| Input | Type | Notes |
|---|---|---|
| `[image]` | string | Image URL. |
| `[icon]` | string | PrimeIcons class. |
| `label` | string | Initials or short text. |
| `size` | `'normal' \| 'large' \| 'xlarge'` | Default `'normal'`. |
| `shape` | `'square' \| 'circle'` | Default `'square'`. |

`AvatarGroup` stacks avatars with a slight overlap, useful for team / participant rows.

## Badge

Count or status pip. Two forms:

```typescript
import { Badge, BadgeDirective } from 'primeng/badge';
```

```html
<!-- standalone -->
<p-badge value="8" severity="danger" />

<!-- as a directive on a host -->
<p-button icon="pi pi-bell" pBadge value="3" severity="danger" aria-label="3 unread" />
```

| Input | Type | Notes |
|---|---|---|
| `value` | string \| number | The badge content. |
| `severity` | `'success' \| 'info' \| 'warn' \| 'danger' \| 'contrast' \| 'secondary'` | Color intent. |
| `size` | `'large' \| 'xlarge'` | Optional sizing. |

The `pBadge` directive form attaches a badge to its host without wrapper markup. Common pattern: notification icon with unread count.

## OverlayBadge

Wraps a host element with a floating corner badge.

```typescript
import { OverlayBadge } from 'primeng/overlaybadge';
```

```html
<p-overlaybadge value="2" severity="info">
  <p-avatar image="/img/me.jpg" shape="circle" size="large" />
</p-overlaybadge>
```

Use when the host can't directly receive `pBadge` (because it's a composite component or you need the badge positioned outside its bounding box).

## Chip

Removable tag with optional icon or image.

```typescript
import { Chip } from 'primeng/chip';
```

```html
<p-chip label="Apple" image="/img/apple.png" [removable]="true" (onRemove)="drop('apple')" />
<p-chip label="Beta" icon="pi pi-sparkles" />
```

| Input | Type | Notes |
|---|---|---|
| `label` | string | Chip text. |
| `[image]`, `[icon]` | string | Prefix visual. |
| `[removable]` | boolean | Show X button. |

Event: `(onRemove)`.

## Tag

Compact status pill. No remove affordance, the read-only cousin of Chip.

```typescript
import { Tag } from 'primeng/tag';
```

```html
<p-tag value="Active" severity="success" />
<p-tag value="Draft" severity="warn" [rounded]="true" />
<p-tag value="New" icon="pi pi-sparkles" />
```

| Input | Type | Notes |
|---|---|---|
| `value` | string | Tag text. |
| `severity` | `'success' \| 'info' \| 'warn' \| 'danger' \| 'contrast' \| 'secondary'` | Color. |
| `[rounded]` | boolean | Pill-shaped corners. |
| `icon` | string | Optional leading icon. |

## Image

`<img>` with built-in zoom / rotate / preview lightbox.

```typescript
import { Image } from 'primeng/image';
```

```html
<p-image src="/img/hero.jpg" alt="Annual report cover" width="320" [preview]="true" />
```

| Input | Type | Notes |
|---|---|---|
| `src`, `alt` | string | Required for accessibility. |
| `width`, `height` | string | CSS dimensions. |
| `[preview]` | boolean | Click to open fullscreen viewer with zoom + rotate controls. |

For galleries of multiple images use `Galleria` (see [data-display.md](./data-display.md)).

## Skeleton

Loading placeholder.

```typescript
import { Skeleton } from 'primeng/skeleton';
```

```html
<p-skeleton width="100%" height="2rem" />
<p-skeleton shape="circle" size="3rem" />
<p-skeleton width="60%" height="1rem" borderRadius="9999px" />
```

| Input | Type | Notes |
|---|---|---|
| `shape` | `'rectangle' \| 'circle'` | Default `'rectangle'`. |
| `size` | string | For circles, sets diameter (e.g. `'3rem'`). |
| `width`, `height`, `borderRadius` | string | CSS values for rectangles. |
| `animation` | `'wave' \| 'none'` | Default `'wave'`. |

Compose skeletons inside a `[hidden]`-toggled wrapper or use `*ngIf` on the loading flag.

## ProgressBar

Linear progress, determinate or indeterminate.

```typescript
import { ProgressBar } from 'primeng/progressbar';
```

```html
<p-progressbar [value]="uploadPct()" [showValue]="true" />
<p-progressbar mode="indeterminate" />
```

| Input | Type | Notes |
|---|---|---|
| `[value]` | number (0, 100) | Determinate value. |
| `mode` | `'determinate' \| 'indeterminate'` | Default `'determinate'`. |
| `[showValue]` | boolean | Show percentage label. |
| `unit` | string | Suffix (default `'%'`). |
| `color` | string | CSS color or token (`'var(--p-primary-color)'`). |

## ProgressSpinner

Circular indeterminate spinner.

```typescript
import { ProgressSpinner } from 'primeng/progressspinner';
```

```html
<p-progressspinner strokeWidth="4" animationDuration=".8s" />
```

Inputs: `strokeWidth`, `animationDuration`, `fill`, `styleClass`.

## Message

Inline alert banner.

```typescript
import { Message } from 'primeng/message';
```

```html
<p-message severity="info" text="3 fields need attention." />

<p-message severity="error" [closable]="true" (onClose)="dismiss()">
  <i class="pi pi-times-circle"></i>
  <span>Failed to save changes. Try again.</span>
</p-message>
```

| Input | Type | Notes |
|---|---|---|
| `severity` | `'success' \| 'info' \| 'warn' \| 'error' \| 'secondary' \| 'contrast'` | Color + default icon. |
| `text` | string | Short body. Use content projection for richer layouts. |
| `[closable]` | boolean | Show X. |
| `life` | number | Auto-dismiss in ms. |
| `icon` | string | Override default severity icon. |

Event: `(onClose)`.

Message is **inline**, embedded in the page. For transient pop-up notifications, use `Toast` (see [overlays.md](./overlays.md)).

## MeterGroup

Stacked progress bar, segments by category.

```typescript
import { MeterGroup } from 'primeng/metergroup';
```

```html
<p-metergroup [value]="usage" [max]="100" labelPosition="end" orientation="horizontal" />
```

```typescript
usage = [
  { label: 'Storage',  value: 32, color: 'var(--p-primary-color)' },
  { label: 'Database', value: 18, color: '#22c55e' },
  { label: 'Logs',     value: 9,  color: '#f59e0b' },
];
```

Useful for "X of Y used, broken down by Z" patterns: storage quotas, time budgets, capacity dashboards.

| Input | Type | Notes |
|---|---|---|
| `[value]` | `{ label, value, color, icon? }[]` | Segments. |
| `[max]` | number | Default 100. |
| `[min]` | number | Default 0. |
| `orientation` | `'horizontal' \| 'vertical'` | |
| `labelPosition` | `'start' \| 'end'` | Legend position. |
| `labelOrientation` | `'horizontal' \| 'vertical'` | Legend layout. |

## Inplace

Click-to-reveal editor pattern.

```typescript
import { Inplace, InplaceDisplay, InplaceContent } from 'primeng/inplace';
```

```html
<p-inplace #inplace>
  <ng-template pTemplate="display">Click to edit</ng-template>
  <ng-template pTemplate="content">
    <input pInputText [(ngModel)]="value" (blur)="inplace.deactivate()" />
  </ng-template>
</p-inplace>
```

| Input | Type | Notes |
|---|---|---|
| `[active]` | boolean | Two-way binding for current state. |
| `[closable]` | boolean | Show close button in content mode. |

Events: `(onActivate)`, `(onDeactivate)`.

Use for spreadsheet-style cells where each value can be edited in place.

## Ripple

Material-style ripple effect on click. Directive form.

```typescript
import { Ripple } from 'primeng/ripple';
```

```html
<button pRipple class="my-button">Click me</button>
```

Required in `app.config.ts`:

```typescript
providePrimeNG({ ripple: true })
```

Without the global flag, the directive renders but the animation is disabled.

## Terminal

Inline command-line UI. Niche, mainly useful for in-app help / admin consoles.

```typescript
import { Terminal, TerminalService } from 'primeng/terminal';
```

```html
<p-terminal welcomeMessage="Welcome" prompt=">" />
```

Wire commands via `TerminalService`:

```typescript
constructor(private term: TerminalService) {
  this.term.commandHandler.subscribe((cmd) => {
    this.term.sendResponse(`You typed: ${cmd}`);
  });
}
```

## Tag vs Chip vs Badge , quick picker

| Need | Use |
|---|---|
| Status pill (read-only) | **Tag** |
| Removable label / token | **Chip** |
| Counter or dot indicator | **Badge** (or **OverlayBadge** when the host can't take a directive) |

## Common pitfalls

1. **Avatar without `image` or `label` or `icon`** , renders an empty circle, easy to miss in code review.
2. **`pBadge` on an `<a>` or `<button>` with `position: static`** , the badge positions absolutely against the host; if the host isn't positioned, the badge floats to the page root. Set `position: relative` on the host.
3. **Skeleton sizes that don't match the eventual content** , the layout shift when content loads defeats the point. Match real dimensions.
4. **`<p-message>` for transient notifications** , use Toast instead. Message is for in-page banners.
5. **`pRipple` without `ripple: true`** in `providePrimeNG` , the directive is a no-op.
6. **MeterGroup `[max]` not set when values can exceed 100** , values clip silently. Set max explicitly.
