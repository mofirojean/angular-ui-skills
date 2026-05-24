# Forms integration

All PrimeNG form components implement `ControlValueAccessor`, so they work with both Reactive Forms (`formControl` / `formControlName`) and Template-driven Forms (`[(ngModel)]`) out of the box. v20+ added a unified `[invalid]` input that replaces relying on `.ng-invalid.ng-dirty` selectors.

## Reactive Forms (recommended)

The canonical pattern across all controls:

```typescript
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputText } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { Checkbox } from 'primeng/checkbox';
import { Message } from 'primeng/message';
import { Button } from 'primeng/button';

@Component({
  imports: [ReactiveFormsModule, InputText, Select, Checkbox, Message, Button],
  template: `
    <form [formGroup]="form" (ngSubmit)="submit()" class="flex flex-col gap-3">
      <input
        pInputText
        formControlName="email"
        [invalid]="isInvalid('email')"
        placeholder="you@example.com"
      />
      @if (isInvalid('email')) {
        <p-message severity="error" size="small" variant="simple">
          {{ errorFor('email') }}
        </p-message>
      }

      <p-select
        formControlName="role"
        [options]="roles"
        optionLabel="label"
        optionValue="value"
        [invalid]="isInvalid('role')"
        placeholder="Select role"
      />

      <p-checkbox formControlName="agree" [binary]="true" [invalid]="isInvalid('agree')" />

      <p-button type="submit" label="Submit" [disabled]="form.invalid" />
    </form>
  `,
})
export class SignupForm {
  private fb = inject(FormBuilder);
  protected readonly submitted = signal(false);

  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    role: ['', Validators.required],
    agree: [false, Validators.requiredTrue],
  });

  roles = [
    { label: 'Editor', value: 'editor' },
    { label: 'Viewer', value: 'viewer' },
  ];

  isInvalid(name: string): boolean {
    const ctrl = this.form.get(name);
    return !!ctrl?.invalid && (ctrl.dirty || ctrl.touched || this.submitted());
  }

  errorFor(name: string): string {
    const errors = this.form.get(name)?.errors;
    if (!errors) return '';
    if (errors['required']) return 'This field is required.';
    if (errors['email']) return 'Enter a valid email.';
    return 'Invalid value.';
  }

  submit() {
    this.submitted.set(true);
    if (this.form.invalid) return;
    // ...
  }
}
```

Key patterns:

- One `isInvalid(name)` helper centralizes the "invalid AND user has interacted" logic.
- `[invalid]` on the control draws the inline error styling (red border, error icon where applicable).
- `<p-message>` next to the control surfaces the error text. Severity `error` for blocking, `warn` for soft warnings.

## The `[invalid]` input (v20+)

Every form-bearing PrimeNG component exposes `[invalid]`. Bind it to your "should this look broken right now?" expression. PrimeNG handles the visual treatment per its preset (token: `<component>.invalid.border.color`, etc.).

```html
<input pInputText formControlName="firstName" [invalid]="isInvalid('firstName')" />
<p-select formControlName="country" [invalid]="isInvalid('country')" ... />
<p-datepicker formControlName="window" [invalid]="isInvalid('window')" />
<p-multiselect formControlName="tags" [invalid]="isInvalid('tags')" ... />
```

Old pattern (still works but deprecated guidance):

```css
/* drives error styling via Angular's automatic classes */
.ng-invalid.ng-dirty { ... }
```

New pattern is to *bind explicitly* via `[invalid]`. Benefits:

- Works the same way across every form component without touching CSS.
- Independent of Angular's `ng-*` class state, you choose when to show errors (typically after touch + submit, not on first paint).
- Plays nicely with custom validation flows that don't update `ng-dirty` predictably.

## Template-driven forms

`[(ngModel)]` works on every control:

```html
<input pInputText [(ngModel)]="name" #nameRef="ngModel" required [invalid]="nameRef.invalid && nameRef.touched" />
```

For new code prefer Reactive Forms (the workspace's documented default). Template-driven shines for small, self-contained inputs.

## Signal Forms (Angular v22+)

Angular's experimental Signal Forms API is expected to stabilize in v22. PrimeNG's CVA-based components should integrate via the same adapter, but as of PrimeNG v21 this is untested. Recommendation: stick with Reactive Forms until both stabilize.

## Field wrappers

The `FloatLabel`, `IftaLabel`, and `IconField` components are presentational wrappers. They don't implement CVA themselves, your control inside owns the form binding.

```html
<p-floatlabel>
  <input pInputText id="email" formControlName="email" [invalid]="isInvalid('email')" />
  <label for="email">Email</label>
</p-floatlabel>
```

The label's `for` attribute must match the input's `id`. Without it the label isn't announced for screen readers.

See [form-controls.md](./form-controls.md) for the full wrapper inventory.

## Validation display patterns

PrimeNG ships `<p-message>` for inline errors. Use it consistently below or beside the control:

```html
<input pInputText formControlName="email" [invalid]="isInvalid('email')" />
@if (isInvalid('email')) {
  <p-message severity="error" size="small" variant="simple">{{ errorFor('email') }}</p-message>
}
```

For form-level errors (e.g. "Something went wrong, try again"), use `<p-message>` at the form root with `severity="error"`. For server-side rejection or transient async failures, use `Toast` via `MessageService` (see [overlays.md](./overlays.md)).

## Common pitfalls

1. **Showing errors immediately on form load** , feels noisy. Gate `[invalid]` on a touched / dirty / submitted check.
2. **DatePicker initial value type mismatch** , the picker expects a `Date` for `selectionMode="single"`, a `Date[]` for `'multiple'`, and `[Date, Date]` for `'range'`. Seeding with the wrong shape throws at runtime.
3. **AutoComplete with object suggestions but a string form value** , set `optionLabel` *and* `optionValue` so the form value stays a primitive key, otherwise the form serializes the full object.
4. **Submit on Enter inside an open AutoComplete suggestion list** , Enter selects the highlighted suggestion, not the form. Wrap `<form>` with `(keydown.enter)` if you need different behavior.
5. **MultiSelect form value default of `null`** , components expect `[]` for empty multi-select. Seed with `[]` to avoid first-render flicker.
6. **Checkbox without `[binary]="true"`** for a single boolean , defaults to array mode. Always set `[binary]="true"` for single-checkbox booleans.
7. **InputMask `[unmask]` toggled at runtime** , the form value shape changes. Pick once and don't switch.
