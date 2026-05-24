# PassThrough (`pt`) API

PrimeNG's primary customization surface. Use `pt` to inject classes, attributes, or styles into any internal DOM section of a component, without forking the component source.

## When to reach for `pt`

In escalating order of weight:

1. **Design tokens** (see [theming.md](./theming.md)), when the change should apply theme-wide.
2. **`pt`**, when one component (or one instance) needs to override what tokens can't express. Also: when you need to attach ARIA, data-attrs, or event listeners to a nested DOM section.
3. **Unstyled mode** + `pt`, when the whole design system is hand-rolled (see [styled-vs-unstyled.md](./styled-vs-unstyled.md)).

## Section names

Every component exposes a set of section names corresponding to its internal DOM. Each component's docs page on primeng.org has a **PT Viewer** that lists them. Common pattern:

| Section | What it targets |
|---|---|
| `root` | The component's outermost element |
| `label` | The text label (Button, Tag, Chip) |
| `icon` | Icon slot (Button, Message) |
| `header` / `content` / `footer` | Composite components (Dialog, Card, Panel) |

Section names are kebab-case in docs, camelCase in code: `root`, `headerCell`, `pcCancelButton`.

## Value shapes per section

```typescript
<p-button
  [pt]="{
    root: 'p-2', // string → applied as class
    label: { class: 'font-bold' }, // object → arbitrary attrs
    icon: {
      class: 'text-white !text-xl',
      style: { fontSize: '1.5rem' },
      'aria-hidden': true,
      'data-testid': 'btn-icon',
    },
  }"
/>
```

- **String**, shorthand for `{ class: '...' }`. Most common.
- **Object**, any attribute: `class`, `style`, `aria-*`, `data-*`, event listeners.
- **Function**, `(context) => string | object`. Use when the value depends on component state.

```typescript
[pt]="{
  root: (ctx) => ctx.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
}"
```

The context object is component-specific, check the component's TS types or PT Viewer for what's available.

## Nested-component prefix (`pc*`)

When component A renders component B internally, target B's sections from A's `pt` using the `pc<Name>` prefix:

```typescript
<p-button
  [pt]="{
    root: 'p-2',
    pcBadge: {                  // targets the Badge that Button renders internally
      root: 'bg-red-500 text-white',
    },
  }"
/>
```

`pc` = "Prime Component". The prefix exists so PrimeNG can distinguish "this DOM section" from "this nested component instance".

## Global `pt` in `providePrimeNG`

Apply rules to every instance of a component, app-wide:

```typescript
import { ApplicationConfig } from '@angular/core';
import { providePrimeNG } from 'primeng/config';

export const appConfig: ApplicationConfig = {
  providers: [
    providePrimeNG({
      unstyled: true,
      pt: {
        button: {
          root: 'bg-teal-500 hover:bg-teal-700 active:bg-teal-900 py-2 px-4 rounded-full flex gap-2',
          label: 'text-white font-bold text-lg',
          icon: 'text-white !text-xl',
        },
        inputtext: {
          root: 'border border-gray-300 rounded-md px-3 py-2',
        },
      },
    }),
  ],
};
```

Keys are component names in lowercase (no hyphens, no `p-` prefix): `button`, `inputtext`, `confirmdialog`, etc.

## `ptOptions`, merge semantics

When both global and instance `pt` exist for the same component, `ptOptions` controls how they combine:

```typescript
<p-button
  [pt]="{ root: 'shadow-lg' }"
  [ptOptions]="{ mergeSections: true, mergeProps: false }"
/>
```

| Option | Default | What it does |
|---|---|---|
| `mergeSections` | `true` | Include sections from the global config that the instance didn't specify. |
| `mergeProps` | `false` | When the same section exists in both, merge their props (`true`) or instance fully replaces global (`false`). |

`mergeProps` can also be a function for fine-grained control:

```typescript
[ptOptions]="{
  mergeProps: (globalValue, instanceValue) => `${globalValue} ${instanceValue}`
}"
```

The function receives `(global, instance)` and returns the resolved value.

**Default behavior** (`mergeSections: true, mergeProps: false`): the instance's sections override global sections cleanly; sections the instance doesn't touch inherit from global.

## Precedence summary

For a component using both global and instance `pt`:

1. Instance `pt` section is set → instance wins (unless `mergeProps: true` merges them).
2. Instance `pt` section is absent → global section applies (unless `mergeSections: false` blocks it).
3. Neither set → component renders with theme defaults only.

`ptOptions` lives on the instance; you can also set defaults globally via `providePrimeNG({ ptOptions: { ... } })`.

## Styled vs Unstyled

```typescript
// Styled mode, pt is additive on top of theme styles
<p-button [pt]="{ root: 'ring-2 ring-amber-500' }" />

// Unstyled mode, pt provides ALL styles (no theme classes emitted)
<p-button
  [pt]="{
    root: 'bg-blue-600 px-4 py-2 rounded text-white font-medium',
    label: 'text-sm',
  }"
/>
```

In Unstyled mode, `pt` is the primary way to ship styles to the component. Pair with `tailwindcss-primeui` for Tailwind-driven design systems. See [styled-vs-unstyled.md](./styled-vs-unstyled.md).

## Use cases

**1. Add a one-off style without writing CSS:**
```typescript
<p-button [pt]="{ root: 'ring-2 ring-offset-2 ring-amber-500' }" label="Caution" />
```

**2. Inject ARIA on an internal section:**
```typescript
<p-button
  icon="pi pi-trash"
  [pt]="{ icon: { 'aria-hidden': true } }"
  aria-label="Delete row"
/>
```

**3. Attach data-attrs for testing:**
```typescript
<p-table [pt]="{ root: { 'data-testid': 'orders-table' } }" />
```

**4. Style a nested component without wrapping in a directive:**
```typescript
<p-confirmdialog
  [pt]="{
    pcAcceptButton: { root: 'bg-destructive hover:bg-destructive/90' },
    pcRejectButton: { root: 'variant-ghost' },
  }"
/>
```

**5. State-aware classes via function:**
```typescript
<p-tag
  [pt]="{
    root: (ctx) => ctx.severity === 'success' ? 'ring-2 ring-emerald-300' : ''
  }"
/>
```

## TypeScript types

Each component exports a `PassThrough` interface, typically named `<Component>PassThroughOptions` (e.g. `ButtonPassThroughOptions`). The PT Viewer on each docs page documents available sections; import the type if you want compile-time safety on section names. Loosely-typed `pt` is also accepted at the cost of catching typos at runtime.

## Common pitfalls

1. **Typoing a section name**, won't error; the rule just no-ops. Cross-check against the PT Viewer.
2. **Forgetting `pc` prefix on nested components**, `badge: {...}` does nothing inside a Button; you need `pcBadge: {...}`.
3. **Class collisions when both global and instance set the same section without merge**, instance silently replaces global. Set `mergeProps: true` if you wanted them to compose.
4. **Pseudo-selectors and complex states in classes**, `pt` works for everything Tailwind can express (`hover:`, `focus-visible:`, `data-[state=open]:`). For everything else, write a stylesheet keyed off `data-pc-*` attributes that PrimeNG sets internally.
5. **Reaching for `pt` before tokens**, if you find yourself writing the same `pt` rule on 20 buttons, override the `button.*` token instead.
