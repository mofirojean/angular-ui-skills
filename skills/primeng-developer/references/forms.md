# Forms integration

> Status: outline. Fill in.

## Reactive Forms (recommended)

- All PrimeNG form components are CVA-compliant
- `formControlName` / `[formControl]` work directly
- Example: a small form with InputText + Select + Checkbox

## The `[invalid]` input (v20+)

- Replaces the legacy `.ng-invalid.ng-dirty` styling hook
- How to bind it: `[invalid]="ctrl.invalid && ctrl.touched"`
- Which components expose it (verify against docs; common ones: InputText, Select, DatePicker, MultiSelect, Textarea, AutoComplete)

## Validation display

- Show errors with `<small class="p-error">` next to the field
- `Message` component for inline form-level errors

## Template-driven forms

- `[(ngModel)]` works on every CVA component
- When to prefer Reactive over Template (the project default per the workspace guide)

## Signal Forms (Angular v22+)

- PrimeNG works via CVA so Signal Forms should integrate, but this is untested as of PrimeNG v21
- Recommend Reactive Forms until Angular v22 ships and Signal Forms stabilizes

## Field wrappers

- `FloatLabel`, `IftaLabel`, `IconField` and how they compose with controls
- Accessibility implications (the wrapper must own the `<label>`)

## Common pitfalls

- DatePicker / MultiSelect: setting an initial value as `Date` vs `string` — pick one and stick to it
- AutoComplete: `optionLabel` + `optionValue` interaction with form value type
- Submitting forms with `Enter` inside an `AutoComplete` that has open suggestions
