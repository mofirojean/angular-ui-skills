# Form controls

> Status: outline. Fill in.

Each subsection: import path, signal/standard inputs, ReactiveForms binding, `[invalid]` support (v20+), accessibility notes, common gotchas. Reference the official docs page; do not invent APIs.

## Text inputs

### InputText
### Textarea
### Password
### InputMask
### InputNumber
### InputOtp
### Editor

## Selection

### Select
### MultiSelect
### CascadeSelect
### TreeSelect
### Listbox
### SelectButton
### AutoComplete

## Boolean

### Checkbox
### RadioButton
### ToggleSwitch
### ToggleButton

## Numeric / continuous

### Slider
### Rating
### Knob

## Date / color

### DatePicker
### ColorPicker

## Labels and field wrappers

### FloatLabel
### IftaLabel
### IconField

## Cross-cutting

- All form controls implement `ControlValueAccessor` → work with `formControl` / `formControlName` out of the box
- `[invalid]` input (v20+) replaces relying on `.ng-invalid.ng-dirty`
- See [forms.md](./forms.md) for ReactiveForms / Signal Forms patterns
