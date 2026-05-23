# Accessibility

> Status: outline. Fill in.

## What PrimeNG provides for free

- WCAG 2.1 AA compliance baseline across components
- Proper ARIA roles, states, and properties on all interactive components
- Keyboard navigation matching WAI-ARIA Authoring Practices

## `p-sr-only` utility

- Screen-reader-only text helper
- When to use it (label-less icon buttons, decorative-but-meaningful visuals)

## Per-component a11y notes

Each component's docs page has an "Accessibility" tab. Highlight the ones that need extra care:

- **Button** — must have an accessible name (label, `[aria-label]`, or visible text)
- **Dialog** — focus trap is automatic; document the title-id wiring for `aria-labelledby`
- **DatePicker** — keyboard nav inside the picker; document month/year jumps
- **Select / MultiSelect** — combobox pattern; `aria-activedescendant` handled internally
- **Table** — sort buttons need accessible names; row selection announces via aria-live
- **Menu (all variants)** — arrow-key navigation; document Esc-to-close
- **Toast** — `aria-live="polite"` by default; use `severity="error"` for assertive

## Focus management

- PrimeNG manages focus inside overlays (Dialog, Drawer, Popover)
- Returning focus to the trigger on close — automatic in most components; verify per component

## Color contrast and tokens

- Default tokens meet AA contrast; document the ones at risk (subtle text, ghost buttons)
- How to verify a custom preset still passes AA

## Testing checklist

- Tab through the page — focus order matches visual order?
- Esc closes overlays?
- Screen reader announces state changes (selection, validation)?
- All icon-only buttons have `aria-label` or visible label?
