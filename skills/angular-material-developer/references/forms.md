# Forms

Material's form components are built around `<mat-form-field>` plus a control directive (`MatInput`, `MatSelect`, `MatDatepicker`, etc). All controls implement `ControlValueAccessor` so they drop into Reactive Forms (default), Template-driven Forms (`ngModel`), and Signal Forms (Angular v22+).

## Reactive Forms (recommended)

```ts
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';

@Component({
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule],
  template: `
    <form [formGroup]="form" (ngSubmit)="submit()">
      <mat-form-field appearance="outline">
        <mat-label>Email</mat-label>
        <input matInput type="email" formControlName="email" />
        @if (form.controls.email.hasError('required')) {
          <mat-error>Email is required</mat-error>
        }
        @if (form.controls.email.hasError('email')) {
          <mat-error>Invalid email format</mat-error>
        }
      </mat-form-field>

      <mat-form-field appearance="outline">
        <mat-label>Role</mat-label>
        <mat-select formControlName="role">
          <mat-option value="admin">Admin</mat-option>
          <mat-option value="user">User</mat-option>
        </mat-select>
      </mat-form-field>

      <button mat-flat-button type="submit" [disabled]="form.invalid">Save</button>
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

### MatFormField features

- **`appearance`** , `'fill'` (default, filled background) or `'outline'` (bordered).
- **`floatLabel`** , `'auto'` (default, floats when focused or filled) or `'always'`.
- **`<mat-label>`** , the accessible name. Always provide one.
- **`<mat-error>`** , validation message shown when the inner control is invalid AND dirty/touched (Material handles the state matching).
- **`<mat-hint>`** , helper text below the field. Pair with `align="end"` for character counters: `<mat-hint align="end">{{ value().length }}/280</mat-hint>`.
- **`<mat-icon matPrefix>`** / **`<mat-icon matSuffix>`** , inline icons.
- **`subscriptSizing`** , `'fixed'` (default, reserves space for hint/error) or `'dynamic'` (collapses when empty).

## ErrorStateMatcher

`<mat-error>` displays when the control is invalid AND touched (default). Override for custom logic:

```ts
import { ErrorStateMatcher } from '@angular/material/core';

class ImmediateErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: AbstractControl | null): boolean {
    return !!(control && control.invalid);  // ignore touched / dirty
  }
}

// Per-field:
<input matInput formControlName="email" [errorStateMatcher]="immediate" />

// Or globally:
{ provide: ErrorStateMatcher, useClass: ImmediateErrorStateMatcher }
```

## Custom form-field controls

When you need a `<mat-form-field>` to wrap a control you wrote, implement `MatFormFieldControl<T>`:

```ts
@Component({
  selector: 'app-color-picker',
  providers: [{ provide: MatFormFieldControl, useExisting: ColorPicker }],
  template: `<input [value]="value" (input)="onChange($event)" />`,
})
export class ColorPicker implements MatFormFieldControl<string>, ControlValueAccessor, OnDestroy {
  // 12-ish required members, see Material docs for the full contract.
  ...
}
```

It's a heavy contract. Most apps don't need it, just wrap a native `<input matInput>` inside a `<mat-form-field>`.

## Async validators

Material doesn't change how Angular async validators work, the `<mat-error>` shows when the form-control transitions to invalid. To show a spinner while pending:

```html
<mat-form-field>
  <mat-label>Username</mat-label>
  <input matInput formControlName="username" />
  @if (form.controls.username.pending) {
    <mat-progress-spinner matSuffix mode="indeterminate" diameter="18" />
  }
  @if (form.controls.username.hasError('taken')) {
    <mat-error>Username is taken</mat-error>
  }
</mat-form-field>
```

## Signal Forms (Angular v22, stable)

Signal Forms shipped stable in Angular v22 (2026-06-03). Material's CVA implementations work the same way whether you're on Reactive Forms or Signal Forms, the `<mat-form-field>` markup is unchanged. See `angular-developer`'s `signal-forms.md` for the canonical `form()` / `field()` / `validators()` shape.

## Common pitfalls

1. **`<mat-error>` not showing** , the control must be invalid AND touched. Either touch the field (focus and blur) or override `ErrorStateMatcher`.
2. **`<mat-label>` missing** , the field works but accessibility audits flag it. Always provide a label.
3. **Subscript space underneath** , `subscriptSizing="fixed"` (default) reserves space for hint/error. For tight grids, set `subscriptSizing="dynamic"` on the form-field.
4. **Custom validator's message doesn't surface** , `<mat-error>` checks `hasError(...)`. Make sure the validator returns the same key name (e.g. `{ 'usernameTaken': true }` → `hasError('usernameTaken')`).
5. **Two-way binding with `[(ngModel)]` on `mat-select`** , works, but mixing with Reactive Forms in the same component gets confusing. Pick one.
