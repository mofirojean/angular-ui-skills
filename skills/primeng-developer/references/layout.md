# Layout

Containers and structural components. Many of them (Accordion, Tabs, Stepper) use a composed sub-component pattern in v18+, not a single tag with config inputs.

## Accordion

Multi-panel collapsible region. v18+ uses sub-components instead of an `[multiple]` + `tabs` config:

```typescript
import { Accordion, AccordionPanel, AccordionHeader, AccordionContent } from 'primeng/accordion';
```

```html
<p-accordion [(value)]="activePanel" [multiple]="false">
  <p-accordion-panel value="general">
    <p-accordion-header>General</p-accordion-header>
    <p-accordion-content>
      <!-- panel body -->
    </p-accordion-content>
  </p-accordion-panel>

  <p-accordion-panel value="security">
    <p-accordion-header>Security</p-accordion-header>
    <p-accordion-content>
      <!-- panel body -->
    </p-accordion-content>
  </p-accordion-panel>
</p-accordion>
```

| Input | Type | Notes |
|---|---|---|
| `[(value)]` | string \| number \| array | Currently open panel(s). Use an array when `[multiple]="true"`. |
| `[multiple]` | boolean | Allow more than one panel open. |
| `[selectOnFocus]` | boolean | Open the panel on keyboard focus, not just click. |

Events: `(onOpen)`, `(onClose)`.

## Panel

Single collapsible container.

```typescript
import { Panel } from 'primeng/panel';
```

```html
<p-panel header="Notes" [toggleable]="true">
  <!-- content -->
</p-panel>
```

| Input | Type | Notes |
|---|---|---|
| `header` | string | Header label. |
| `[toggleable]` | boolean | Show expand/collapse toggle. |
| `[collapsed]` | boolean | Initial state when toggleable. |

Events: `(onExpand)`, `(onCollapse)`.

## Tabs

Modern tab API (replaces `TabView` / `TabPanel`).

```typescript
import { Tabs, TabList, Tab, TabPanels, TabPanel } from 'primeng/tabs';
```

```html
<p-tabs [(value)]="activeTab">
  <p-tablist>
    <p-tab value="overview">
      <i class="pi pi-chart-bar"></i>
      Overview
    </p-tab>
    <p-tab value="settings">
      <i class="pi pi-cog"></i>
      Settings
    </p-tab>
  </p-tablist>
  <p-tabpanels>
    <p-tabpanel value="overview">...</p-tabpanel>
    <p-tabpanel value="settings">...</p-tabpanel>
  </p-tabpanels>
</p-tabs>
```

| Input | Type | Notes |
|---|---|---|
| `[(value)]` | string \| number | Active tab value. Match `value` on `<p-tab>` and `<p-tabpanel>`. |
| `[scrollable]` | boolean | Horizontal scroll for many tabs. |

Events: `(valueChange)`.

`value` must match between a `<p-tab>` and its corresponding `<p-tabpanel>`. Mismatched values render no content silently.

## Stepper

Multi-step wizard. Same compositional pattern as Tabs.

```typescript
import { Stepper, StepList, Step, StepPanels, StepPanel } from 'primeng/stepper';
```

```html
<p-stepper [(value)]="currentStep" [linear]="true">
  <p-step-list>
    <p-step value="1">Account</p-step>
    <p-step value="2">Profile</p-step>
    <p-step value="3">Review</p-step>
  </p-step-list>
  <p-step-panels>
    <p-step-panel value="1">...</p-step-panel>
    <p-step-panel value="2">...</p-step-panel>
    <p-step-panel value="3">...</p-step-panel>
  </p-step-panels>
</p-stepper>
```

| Input | Type | Notes |
|---|---|---|
| `[(value)]` | string \| number | Current step. |
| `[linear]` | boolean | Forces forward-only progression until the current step is "valid". |
| `orientation` | `'horizontal' \| 'vertical'` | Layout. |

When `[linear]="true"`, mark a step as completed by changing `value` only after the step's content reports valid (e.g. on form submit). The component doesn't validate for you, it gates *navigation*.

Stepper replaces the deprecated `Steps` component from v17.

## Splitter

Resizable horizontal or vertical split.

```typescript
import { Splitter, SplitterPanel } from 'primeng/splitter';
```

```html
<p-splitter
  [panelSizes]="[30, 70]"
  [minSizes]="[20, 40]"
  layout="horizontal"
  [style]="{ height: '40rem' }"
>
  <ng-template pTemplate>
    <!-- left panel -->
  </ng-template>
  <ng-template pTemplate>
    <!-- right panel -->
  </ng-template>
</p-splitter>
```

| Input | Type | Notes |
|---|---|---|
| `layout` | `'horizontal' \| 'vertical'` | Split direction. |
| `[panelSizes]` | `number[]` | Initial sizes as percentages. Sum to 100. |
| `[minSizes]` | `number[]` | Minimum sizes per panel. |
| `gutterSize` | number | Drag handle thickness in px. |

Nest splitters for grid-style splits (sidebar + main, with main split into top/bottom).

## Fieldset

Styled `<fieldset>` wrapper with optional collapse.

```typescript
import { Fieldset } from 'primeng/fieldset';
```

```html
<p-fieldset legend="Billing address" [toggleable]="true">
  <!-- form fields -->
</p-fieldset>
```

Use for grouping form sections. Inputs: `legend`, `[toggleable]`, `[collapsed]`.

## Divider

Visual separator.

```typescript
import { Divider } from 'primeng/divider';
```

```html
<p-divider />
<p-divider type="dashed" />
<p-divider align="center">OR</p-divider>
<p-divider layout="vertical" />
```

| Input | Type | Notes |
|---|---|---|
| `layout` | `'horizontal' \| 'vertical'` | Default `'horizontal'`. |
| `type` | `'solid' \| 'dashed' \| 'dotted'` | Line style. |
| `align` | `'left' \| 'center' \| 'right'` (horizontal) or `'top' \| 'center' \| 'bottom'` (vertical) | Position of any centered label content. |

## Card

Container with conventional slots.

```typescript
import { Card } from 'primeng/card';
```

```html
<p-card header="Metrics" subheader="Last 24 hours">
  <ng-template pTemplate="content">
    <!-- body -->
  </ng-template>
  <ng-template pTemplate="footer">
    <p-button label="View report" variant="text" />
  </ng-template>
</p-card>
```

Inputs `header` and `subheader` are convenience strings; for richer headers use the `header` template.

## Toolbar

Slotted top/bottom bar with start, center, and end groups.

```typescript
import { Toolbar } from 'primeng/toolbar';
```

```html
<p-toolbar>
  <ng-template pTemplate="start">
    <p-button label="New" icon="pi pi-plus" />
    <p-button label="Upload" icon="pi pi-upload" variant="outlined" />
  </ng-template>
  <ng-template pTemplate="center">
    <input pInputText placeholder="Search" />
  </ng-template>
  <ng-template pTemplate="end">
    <p-button label="Settings" icon="pi pi-cog" variant="text" />
  </ng-template>
</p-toolbar>
```

Use as a page header bar or as the footer of a workspace shell.

## Scroller (VirtualScroller)

Windowed list rendering for very long item collections.

```typescript
import { Scroller } from 'primeng/scroller';
```

```html
<p-scroller
  [items]="rows"
  [itemSize]="32"
  [style]="{ height: '20rem' }"
>
  <ng-template pTemplate="item" let-item>
    <div class="px-3 py-1">{{ item.label }}</div>
  </ng-template>
</p-scroller>
```

| Input | Type | Notes |
|---|---|---|
| `items` | `any[]` | Full dataset. |
| `itemSize` | number \| `[number, number]` | Pixel height (or `[height, width]` for grid). |
| `orientation` | `'vertical' \| 'horizontal' \| 'both'` | Scroll direction. |
| `height`, `style` | various | Container sizing. |

For tabular data with virtual scroll, use `<p-table [virtualScroll]="true">` instead (see [data-display.md](./data-display.md)). Use Scroller for non-table lists.

## ScrollTop

Floating "back to top" button.

```typescript
import { ScrollTop } from 'primeng/scrolltop';
```

```html
<p-scrolltop target="window" [threshold]="400" behavior="smooth" />
```

| Input | Type | Notes |
|---|---|---|
| `target` | `'window' \| 'parent'` | Where to listen and where to scroll. |
| `threshold` | number | Scroll distance (px) before showing the button. |
| `behavior` | `'smooth' \| 'auto'` | Scroll animation. |

For `target="parent"`, the ScrollTop attaches to its parent's overflow container.

## BlockUI

Visual lock over a region during async work.

```typescript
import { BlockUI } from 'primeng/blockui';
```

```html
<p-blockui [blocked]="loading()">
  <p-card>
    <ng-template pTemplate="content">...</ng-template>
  </p-card>
</p-blockui>
```

| Input | Type | Notes |
|---|---|---|
| `[blocked]` | boolean | Show the overlay. |
| `target` | string | CSS selector if you want to block a sibling instead of the projected content. |
| `[autoZIndex]`, `[baseZIndex]` | various | Stacking control. |

Use over loading regions to prevent double-clicks during in-flight operations. For full-screen blocking during navigation, prefer route resolvers or a dedicated overlay.

## Common pitfalls

1. **Mismatched `value` across Tabs / Stepper / Accordion sub-components** , a typo on `<p-tab value="foo">` vs `<p-tabpanel value="bar">` renders empty silently.
2. **`[panelSizes]` that doesn't sum to 100** , the Splitter renormalizes but the result rarely matches expectations.
3. **Scroller without a fixed `height`** , virtualization fails and all items render. Always set a container height.
4. **Using `TabView` / `TabPanel`** from v17 in new code , they're deprecated. Use `Tabs` / `Tab` / `TabPanel` (note the renames). See [migration.md](./migration.md).
5. **Card `header` / `subheader` as templates and as inputs simultaneously** , pick one form per slot.