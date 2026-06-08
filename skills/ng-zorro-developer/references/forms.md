# Forms

Every NG-ZORRO Data Entry component implements `ControlValueAccessor`, so they drop into Reactive Forms (default), Template-driven Forms (`ngModel`), and Signal Forms (Angular v22+) without adapters.

## Reactive Forms (recommended)

```ts
import { ReactiveFormsModule } from '@angular/forms';
import { NzFormModule } from 'ng-zorro-antd/form';

@Component({
  imports: [ReactiveFormsModule, NzFormModule, NzInputDirective, NzSelectComponent /* ... */],
  template: `
    <form nz-form [formGroup]="form" (ngSubmit)="submit()">
      <nz-form-item>
        <nz-form-label nzRequired nzFor="email">Email</nz-form-label>
        <nz-form-control
          nzErrorTip="Please enter a valid email"
          nzSuccessTip="Looks good"
        >
          <input nz-input id="email" formControlName="email" />
        </nz-form-control>
      </nz-form-item>

      <nz-form-item>
        <nz-form-label nzFor="role">Role</nz-form-label>
        <nz-form-control>
          <nz-select id="role" formControlName="role">
            <nz-option nzValue="admin" nzLabel="Admin" />
            <nz-option nzValue="user" nzLabel="User" />
          </nz-select>
        </nz-form-control>
      </nz-form-item>

      <button nz-button nzType="primary" type="submit" [disabled]="form.invalid">Save</button>
    </form>
  `,
})
export class UserForm {
  form = inject(FormBuilder).group({
    email: ['', [Validators.required, Validators.email]],
    role: ['user', Validators.required],
  });

  submit() {
    if (this.form.valid) console.log(this.form.value);
  }
}
```

### The `nz-form-item` / `nz-form-control` / `nz-form-label` triad

- **`<form nz-form>`** , registers the form against NG-ZORRO so child controls pick up the layout (`nzLayout`).
- **`<nz-form-item>`** , one row of the form. Wraps a label + control pair.
- **`<nz-form-label>`** , label with optional `nzRequired` red asterisk, `nzFor` matches the input's `id`.
- **`<nz-form-control>`** , wraps the control. Reads validation state from the inner `formControlName` and shows `nzErrorTip` / `nzSuccessTip` / `nzValidatingTip` / `nzExtra`.

### Form layouts

```html
<form nz-form nzLayout="vertical">...</form>     <!-- default for forms with multi-line inputs -->
<form nz-form nzLayout="horizontal">...</form>   <!-- label inline, control right -->
<form nz-form nzLayout="inline">...</form>       <!-- everything in one row, for filters -->
```

Use `nzLabelAlign="right"` / `"left"` on `nz-form-label` to align label text within its column.

### Error tip strategies

```html
<!-- 1. Static error tip -->
<nz-form-control nzErrorTip="Required">
  <input nz-input formControlName="email" />
</nz-form-control>

<!-- 2. Per-validator tip via TemplateRef -->
<nz-form-control [nzErrorTip]="errorTpl">
  <input nz-input formControlName="email" />
</nz-form-control>
<ng-template #errorTpl let-control>
  @if (control.errors?.['required']) { Email is required }
  @if (control.errors?.['email']) { Invalid email format }
</ng-template>

<!-- 3. Async validation, show spinner while pending -->
<nz-form-control [nzValidateStatus]="form.controls.username" nzValidatingTip="Checking...">
  <input nz-input formControlName="username" />
</nz-form-control>
```

### Async validators

Async validators show the `nzValidatingTip` while pending and the `nzErrorTip` once resolved.

```ts
function usernameAvailableValidator(api: UsersApi): AsyncValidatorFn {
  return (ctrl) => api.checkAvailable(ctrl.value).pipe(
    map(available => available ? null : { taken: true }),
  );
}
```

## Signal Forms (Angular v22+)

Once Angular v22 ships Signal Forms stable, NG-ZORRO's CVA implementations work the same way, the form layer is decoupled. The triad markup is unchanged.

## Template-driven (`ngModel`)

Works, but reach for Reactive Forms for anything beyond a single field. Template-driven shines for tiny prototypes:

```html
<input nz-input [(ngModel)]="search" placeholder="Search" />
```

## Custom controls (ControlValueAccessor)

If you wrap NG-ZORRO controls in a re-usable component, expose it via `NG_VALUE_ACCESSOR` so consumers can bind `formControlName`:

```ts
@Component({
  selector: 'app-ticker-picker',
  imports: [NzAutocompleteComponent, NzInputDirective],
  template: `
    <input nz-input [nzAutocomplete]="auto" [value]="display" (input)="onInput($event)" (blur)="onBlur()" />
    <nz-autocomplete #auto>
      @for (o of options(); track o) { <nz-auto-option [nzValue]="o">{{ o }}</nz-auto-option> }
    </nz-autocomplete>
  `,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => TickerPicker), multi: true }],
})
export class TickerPicker implements ControlValueAccessor { /* ... */ }
```

## Common pitfalls

1. **`nz-form-label` not aligning** , forgot `nzFor` matching the input's `id`. Required even though the visual layout is column-flex.
2. **Required asterisk missing** , `nzRequired` is a separate input, the validator on the FormControl doesn't auto-set it. Add `nzRequired` to the label.
3. **`nzErrorTip` doesn't show** , the inner control needs to be **dirty and touched** (or the form submitted) before NG-ZORRO renders errors. Either run `form.markAllAsTouched()` on submit or use `nzValidateStatus` to force display.
4. **Form-level disable doesn't propagate** , call `form.disable()` and `form.enable()` on the FormGroup, NG-ZORRO controls observe the disabled state automatically.
5. **Validator order matters** , async validators run only if sync validators pass. If the field is required AND async-checked, the user sees "Required" first, then the async check after they type a value.