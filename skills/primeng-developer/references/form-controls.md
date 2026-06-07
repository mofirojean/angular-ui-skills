# Form controls

PrimeNG v18+ ships every form control as a standalone class. Import the class, add it to your component's `imports: [...]`, and bind it to a `formControl` or `formControlName`.

```typescript
import { Select } from 'primeng/select';
import { InputText } from 'primeng/inputtext';

@Component({
  imports: [ReactiveFormsModule, Select, InputText, /* ... */],
  template: `...`,
})
```

All controls below implement `ControlValueAccessor`, all support the `[invalid]` input (v20+) for inline error styling. See [forms.md](./forms.md) for the Reactive Forms integration patterns.

## Text inputs

### InputText
Directive form on a native input.
- Import: `import { InputText } from 'primeng/inputtext';`
- Markup: `<input pInputText type="text" formControlName="name" />`
- Useful props: `type`, `placeholder`, `disabled`, `readonly`, `[invalid]`
- Events: `(focus)`, `(blur)`, `(input)`

### Textarea
- Import: `import { Textarea } from 'primeng/textarea';`
- Markup: `<textarea pTextarea rows="3" [autoResize]="true"></textarea>`
- Props: `rows`, `cols`, `[autoResize]`, `maxlength`, `[invalid]`
- Events: `(focus)`, `(blur)`, `(resize)`

### Password
Masked input with an optional strength feedback panel.
- Import: `import { Password } from 'primeng/password';`
- Markup: `<p-password [toggleMask]="true" [feedback]="false" formControlName="pwd" />`
- Props: `[toggleMask]`, `[feedback]`, `promptLabel`, `weakLabel`, `mediumLabel`, `strongLabel`, `[invalid]`

### InputMask
Masked formatting input (phone numbers, IDs, etc.).
- Import: `import { InputMask } from 'primeng/inputmask';`
- Markup: `<p-inputmask mask="(999) 999-9999" formControlName="phone" />`
- Props: `mask`, `slotChar`, `[autoClear]`, `[unmask]`, `[invalid]`
- Gotcha: with `[unmask]="true"` the form value is digits-only; without it the value includes the mask characters.

### InputNumber
Numeric input with locale-aware formatting (currency, decimals, grouping).
- Import: `import { InputNumber } from 'primeng/inputnumber';`
- Markup: `<p-inputnumber mode="currency" currency="USD" formControlName="amount" />`
- Props: `mode` (`'decimal' | 'currency'`), `currency`, `min`, `max`, `step`, `minFractionDigits`, `maxFractionDigits`, `[showButtons]`, `[invalid]`

### InputOtp
Segmented one-time-code input.
- Import: `import { InputOtp } from 'primeng/inputotp';`
- Markup: `<p-inputotp [length]="6" [integerOnly]="true" formControlName="code" />`
- Props: `length`, `[integerOnly]`, `[mask]`, `disabled`, `[invalid]`
- Form value: concatenated string of digits.

### Editor
Rich-text editor (Quill under the hood).
- Import: `import { Editor } from 'primeng/editor';`
- Markup: `<p-editor formControlName="body" [style]="{ height: '320px' }" />`
- Props: `modules`, `formats`, `placeholder`, `readonly`
- Events: `(onTextChange)`, `(onSelectionChange)`, `(onInit)`
- Form value: HTML string.

## Selection

### Select
Single-value dropdown. (Was `Dropdown` in v17.)
- Import: `import { Select } from 'primeng/select';`
- Markup: `<p-select [options]="users" optionLabel="name" optionValue="id" formControlName="ownerId" />`
- Props: `options`, `optionLabel`, `optionValue`, `optionDisabled`, `[filter]`, `placeholder`, `[invalid]`
- Events: `(onChange)`, `(onShow)`, `(onHide)`
- Gotcha: when `optionValue` is omitted, the form value is the entire option object. Pick a strategy and stick with it.

### MultiSelect
Multi-value dropdown with chips or checkbox display.
- Import: `import { MultiSelect } from 'primeng/multiselect';`
- Markup: `<p-multiselect [options]="tags" optionLabel="name" formControlName="tagIds" display="chip" />`
- Props: `options`, `optionLabel`, `optionValue`, `[filter]`, `display` (`'chip' | 'comma'`), `maxSelectedLabels`, `[invalid]`
- Form value: array.

### CascadeSelect
Nested category dropdown (e.g. Country, State, City).
- Import: `import { CascadeSelect } from 'primeng/cascadeselect';`
- Markup: `<p-cascadeselect [options]="geo" optionLabel="name" optionValue="code" optionGroupLabel="name" [optionGroupChildren]="['states', 'cities']" formControlName="locationCode" />`
- Props: `options`, `optionLabel`, `optionValue`, `optionGroupLabel`, `optionGroupChildren`, `[invalid]`

### TreeSelect
Hierarchical selector (file tree, org chart).
- Import: `import { TreeSelect } from 'primeng/treeselect';`
- Markup: `<p-treeselect [options]="nodes" selectionMode="checkbox" formControlName="folders" />`
- Props: `options` (`TreeNode[]`), `selectionMode` (`'single' | 'multiple' | 'checkbox'`), `placeholder`, `[invalid]`
- Events: `(onNodeSelect)`, `(onNodeUnselect)`

### Listbox
Inline (always-visible) list selector.
- Import: `import { Listbox } from 'primeng/listbox';`
- Markup: `<p-listbox [options]="items" optionLabel="label" [multiple]="true" [filter]="true" formControlName="picks" />`
- Props: `options`, `optionLabel`, `optionValue`, `[multiple]`, `[filter]`, `[virtualScroll]`, `[invalid]`

### SelectButton
Segmented button group (single or multi).
- Import: `import { SelectButton } from 'primeng/selectbutton';`
- Markup: `<p-selectbutton [options]="modes" optionLabel="label" optionValue="value" formControlName="mode" />`
- Props: `options`, `optionLabel`, `optionValue`, `[multiple]`, `[allowEmpty]`, `[invalid]`
- Use over a `<p-tabs>` when the choice drives form state, not a panel switch.

### AutoComplete
Typeahead input.
- Import: `import { AutoComplete } from 'primeng/autocomplete';`
- Markup:
  ```html
  <p-autocomplete
    [suggestions]="filteredUsers"
    optionLabel="name"
    (completeMethod)="searchUsers($event)"
    formControlName="ownerId"
  />
  ```
- Props: `suggestions`, `optionLabel`, `optionValue`, `[multiple]`, `[forceSelection]`, `minQueryLength` (v20+, replaces `minLength`), `[invalid]`
- Events: `(completeMethod)`, `(onSelect)`, `(onUnselect)`, `(onSearch)`
- Gotcha: `suggestions` is **you-controlled**, listen to `completeMethod`, filter your data, then update the bound array. Async filtering is the most common use.

## Boolean

### Checkbox
- Import: `import { Checkbox } from 'primeng/checkbox';`
- Markup (binary): `<p-checkbox [binary]="true" formControlName="agree" />`
- Markup (group): bind several checkboxes to the same `formControlName` and set `value="x"` on each; the form value is an array of selected values.
- Props: `[binary]`, `value`, `name`, `disabled`, `[invalid]`

### RadioButton
- Import: `import { RadioButton } from 'primeng/radiobutton';`
- Markup: `<p-radiobutton name="size" value="md" formControlName="size" />`
- Props: `name`, `value`, `disabled`, `[invalid]`
- Group via shared `name` + same `formControlName`.

### ToggleSwitch
On/off switch. (Was `InputSwitch` in v17.)
- Import: `import { ToggleSwitch } from 'primeng/toggleswitch';`
- Markup: `<p-toggleswitch formControlName="notifications" />`
- Props: `disabled`, `[invalid]`
- Form value: boolean.

### ToggleButton
Single button that toggles between two labels/icons.
- Import: `import { ToggleButton } from 'primeng/togglebutton';`
- Markup: `<p-togglebutton onLabel="On" offLabel="Off" onIcon="pi pi-check" offIcon="pi pi-times" formControlName="enabled" />`
- Props: `onLabel`, `offLabel`, `onIcon`, `offIcon`, `[invalid]`

## Numeric / continuous

### Slider
- Import: `import { Slider } from 'primeng/slider';`
- Markup: `<p-slider min="0" max="100" step="5" formControlName="threshold" />`
- Range mode: `<p-slider [range]="true" formControlName="bounds" />` (value is `[min, max]`)
- Props: `min`, `max`, `step`, `[range]`, `orientation` (`'horizontal' | 'vertical'`), `[invalid]`

### Rating
Star rating.
- Import: `import { Rating } from 'primeng/rating';`
- Markup: `<p-rating formControlName="score" [stars]="5" />`
- Props: `stars`, `[cancel]`, `disabled`, `[readonly]`, `[invalid]`

### Knob
Circular dial input.
- Import: `import { Knob } from 'primeng/knob';`
- Markup: `<p-knob min="0" max="100" size="80" formControlName="volume" />`
- Props: `min`, `max`, `step`, `size`, `strokeWidth`, `valueColor`, `[invalid]`

## Date / color

### DatePicker
Date picker overlay (was `Calendar` in v17).
- Import: `import { DatePicker } from 'primeng/datepicker';`
- Markup: `<p-datepicker [showTime]="true" selectionMode="range" formControlName="window" />`
- Props: `selectionMode` (`'single' | 'multiple' | 'range'`), `[showTime]`, `[timeOnly]`, `dateFormat`, `minDate`, `maxDate`, `[showIcon]`, `[invalid]`
- Form value: `Date`, `Date[]`, or `[Date, Date]` depending on `selectionMode`. Pick one mode per binding and don't switch at runtime.
- **Mask input (v21.1.0+):** typed entry is supported via the underlying input's mask pattern. Pair with `dateFormat` so the displayed text and parsed value agree.

### ColorPicker
- Import: `import { ColorPicker } from 'primeng/colorpicker';`
- Markup: `<p-colorpicker format="hex" formControlName="accent" />`
- Props: `format` (`'hex' | 'rgb' | 'hsb'`), `[inline]`, `disabled`, `appendTo`, `[invalid]`

## Label wrappers

These are presentational, they don't implement CVA, they wrap your real input.

### FloatLabel
Label that floats above on focus/fill.
- Import: `import { FloatLabel } from 'primeng/floatlabel';`
- Markup:
  ```html
  <p-floatlabel>
    <input pInputText id="firstName" formControlName="firstName" />
    <label for="firstName">First name</label>
  </p-floatlabel>
  ```

### IftaLabel
Label sits above the value inside the input (think Material's filled style).
- Import: `import { IftaLabel } from 'primeng/iftalabel';`
- Markup: same shape as FloatLabel.

### IconField
Adornment wrapper for icons inside/around the input.
- Import: `import { IconField, InputIcon } from 'primeng/iconfield';`
- Markup:
  ```html
  <p-iconfield iconPosition="left">
    <p-input-icon class="pi pi-search" />
    <input pInputText placeholder="Search" />
  </p-iconfield>
  ```

## Common pitfalls

1. **`optionValue` omitted** on `Select` / `MultiSelect` makes the form value the full object instead of a key, easy to mismatch with backend payloads.
2. **`AutoComplete` suggestions stay stale** if you forget to refresh the bound array inside `(completeMethod)`. The component does not filter for you.
3. **`DatePicker` mode mismatch**: binding a `Date` to a `selectionMode="range"` picker throws at runtime. Pick the right mode and seed the form with the matching shape (`null`, single `Date`, or `[Date, Date]`).
4. **InputMask form value** changes shape depending on `[unmask]`. Decide once at the model layer.
5. **Checkbox group** without `[binary]="true"` expects an array form value. Single-checkbox use needs `[binary]="true"` to bind to a boolean.
6. **Using v17 names** (`Calendar`, `Dropdown`, `InputSwitch`), see [migration.md](./migration.md).
