# Form Controls

Material's form controls live inside `<mat-form-field>`, which wires up label positioning, error display, and the underline / outline. Most controls also implement `ControlValueAccessor` so they drop into Reactive Forms.

## MatFormField

The wrapper. Every other text-like control (input, select, textarea, datepicker, autocomplete) needs to sit inside one.

- Import: `import { MatFormField, MatLabel, MatError, MatHint, MatPrefix, MatSuffix } from '@angular/material/form-field';`
- Markup:
  ```html
  <mat-form-field appearance="outline">
    <mat-label>Email</mat-label>
    <input matInput type="email" formControlName="email" />
    <mat-icon matSuffix>email</mat-icon>
    <mat-hint>We'll never share it</mat-hint>
    <mat-error *ngIf="form.controls.email.hasError('required')">Required</mat-error>
  </mat-form-field>
  ```
- Inputs: `appearance` (`'fill' | 'outline'`, default `'fill'`), `floatLabel` (`'auto' | 'always'`), `hideRequiredMarker`, `subscriptSizing` (`'fixed' | 'dynamic'`).

## MatInput

The plain text input. Add `matInput` to a native `<input>` or `<textarea>`.

- Import: `import { MatInput } from '@angular/material/input';`
- Markup: `<input matInput type="text" formControlName="name" placeholder="Your name" />`
- Works with `type="text" | "email" | "number" | "password" | "search" | "tel" | "url"`.

## MatSelect

- Import: `import { MatSelect, MatOption } from '@angular/material/select';`
- Markup:
  ```html
  <mat-form-field>
    <mat-label>Role</mat-label>
    <mat-select formControlName="role" multiple>
      <mat-option value="admin">Admin</mat-option>
      <mat-option value="user">User</mat-option>
    </mat-select>
  </mat-form-field>
  ```

## MatAutocomplete

Free-text input with a suggestion list.

- Import: `import { MatAutocomplete, MatAutocompleteTrigger } from '@angular/material/autocomplete';`
- Markup:
  ```html
  <mat-form-field>
    <input matInput [matAutocomplete]="auto" formControlName="city" />
    <mat-autocomplete #auto="matAutocomplete">
      @for (c of filteredCities(); track c) { <mat-option [value]="c">{{ c }}</mat-option> }
    </mat-autocomplete>
  </mat-form-field>
  ```

## MatCheckbox

- Import: `import { MatCheckbox } from '@angular/material/checkbox';`
- Markup: `<mat-checkbox formControlName="newsletter">Subscribe</mat-checkbox>`
- Multi-state: bind `indeterminate` for tristate "select all" pattern.

## MatRadioGroup

- Import: `import { MatRadioGroup, MatRadioButton } from '@angular/material/radio';`
- Markup:
  ```html
  <mat-radio-group formControlName="size">
    <mat-radio-button value="s">Small</mat-radio-button>
    <mat-radio-button value="m">Medium</mat-radio-button>
    <mat-radio-button value="l">Large</mat-radio-button>
  </mat-radio-group>
  ```

## MatSlideToggle

Boolean toggle (Material's switch).

- Import: `import { MatSlideToggle } from '@angular/material/slide-toggle';`
- Markup: `<mat-slide-toggle formControlName="notifications">Notifications</mat-slide-toggle>`

## MatSlider

Range or single-value slider.

- Import: `import { MatSlider, MatSliderThumb, MatSliderRangeThumb } from '@angular/material/slider';`
- Markup:
  ```html
  <mat-slider min="0" max="100" step="10" discrete>
    <input matSliderThumb formControlName="volume" />
  </mat-slider>
  ```
- Range mode: replace `matSliderThumb` with `matSliderStartThumb` + `matSliderEndThumb`.

## MatDatepicker

Native date picker with a Material calendar overlay.

- Import: `import { MatDatepicker, MatDatepickerInput, MatDatepickerToggle } from '@angular/material/datepicker';`
- Date adapter required: `provideNativeDateAdapter()` or `provideLuxonDateAdapter()` in `app.config.ts`.
- Markup:
  ```html
  <mat-form-field>
    <mat-label>Start date</mat-label>
    <input matInput [matDatepicker]="picker" formControlName="startDate" />
    <mat-datepicker-toggle matIconSuffix [for]="picker" />
    <mat-datepicker #picker />
  </mat-form-field>
  ```
- For date ranges, use `mat-date-range-input` + `mat-date-range-picker`.

## Common pitfalls

1. **Input outside `<mat-form-field>`** , the label floats nowhere, validation styles don't apply. Always wrap.
2. **Missing date adapter** , `mat-datepicker` throws on init if no `provideNativeDateAdapter()` (or Luxon / Moment / Date-fns equivalent) is in the providers.
3. **`<mat-error>` without form-control errors** , the error slot reserves space (`subscriptSizing: 'fixed'`). To collapse the gap, set `subscriptSizing="dynamic"` on the form-field.
4. **`mat-radio-button` outside `mat-radio-group`** , works visually but the form binding silently fails. Always wrap.
5. **Density 0 form fields too tall** , Material defaults to 56px. For admin UIs try `density: -2` globally, or per-section with the override mixin.
