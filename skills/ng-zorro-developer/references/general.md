# General

The "General" category in NG-ZORRO docs holds the foundational building blocks reused everywhere else: buttons, icons, typography, and the floating action button. Most components in this file are **attribute directives** applied to native elements.

## Button

`<button nz-button>` on a native `<button>`. Applies Ant Design styling and exposes inputs for size, type, shape, loading, danger, ghost.

- Import: `import { NzButtonComponent } from 'ng-zorro-antd/button';`
- Markup:
  ```html
  <button nz-button nzType="primary" (click)="save()">Save</button>
  <button nz-button nzType="default" nzDanger>Delete</button>
  <button nz-button nzType="text">Cancel</button>
  ```
- Inputs: `nzType` (`'primary' | 'default' | 'dashed' | 'link' | 'text'`), `nzSize` (`'large' | 'default' | 'small'`), `nzShape` (`'circle' | 'round'`), `[nzLoading]`, `[nzGhost]`, `[nzDanger]`, `[nzBlock]`, `[disabled]` (native).
- The directive uses the native `<button>` element, so `type="button"` / `type="submit"` and `[disabled]` behave normally.

### Button group

```html
<nz-button-group>
  <button nz-button>Left</button>
  <button nz-button>Middle</button>
  <button nz-button>Right</button>
</nz-button-group>
```

Useful for segmented action bars. Combine with `nzType="primary"` per button for emphasis.

## FloatButton

Fixed-position FAB. Useful for "scroll to top", "open feedback", "quick add".

- Import: `import { NzFloatButtonComponent, NzFloatButtonGroupComponent } from 'ng-zorro-antd/float-button';`
- Markup:
  ```html
  <nz-float-button nzIcon="customer-service" nzType="primary" (nzOnClick)="openChat()" />

  <nz-float-button-group nzTrigger="hover" nzType="primary" nzIcon="comment">
    <nz-float-button nzIcon="customer-service" />
    <nz-float-button nzIcon="question-circle" />
  </nz-float-button-group>
  ```
- Position via inputs: `nzPlacement` (`'top' | 'left' | 'right' | 'bottom'`), or CSS positioning on the host.

## Icon

Vector icons from `@ant-design/icons-angular`. Every icon must be registered before use, see [setup.md](./setup.md).

- Import: `import { NzIconComponent } from 'ng-zorro-antd/icon';`
- Markup: `<nz-icon nzType="user" nzTheme="outline" />`
- Inputs: `nzType` (icon name), `nzTheme` (`'outline' | 'fill' | 'twotone'`), `[nzSpin]`, `[nzRotate]`, `nzTwotoneColor`.
- Common slots: `nzInputPrefix` / `nzInputSuffix` on inputs, `nzPrefixIcon` on inputs, button content.

### Registration patterns

See [setup.md](./setup.md). The short version: prefer per-component registration so the bundle stays trim.

```ts
import { UserOutline, SettingOutline } from '@ant-design/icons-angular/icons';
provideNzIcons([UserOutline, SettingOutline]);
```

## Typography

Headings, paragraphs, and inline text with consistent type ramp. Most useful for marketing surfaces and dense data labels.

- Import: `import { NzTypographyComponent } from 'ng-zorro-antd/typography';`
- Markup:
  ```html
  <h1 nz-typography>h1. Quanta Desk</h1>
  <p nz-typography>Body copy with <a nz-typography>inline link</a>.</p>

  <h4 nz-typography>
    <span nz-text nzType="secondary">Helper text</span>
  </h4>

  <p nz-typography nzCopyable>npm install ng-zorro-antd</p>
  ```
- The same directive applies to `<h1>`, `<p>`, `<span>`. Type-ramp inputs: `nzType` (`'secondary' | 'success' | 'warning' | 'danger'`), `[nzMark]`, `[nzCode]`, `[nzKeyboard]`, `[nzCopyable]`, `[nzEditable]`, `[nzDelete]`, `[nzStrong]`, `[nzItalic]`.
- For long-form content, use the `nz-typography` block as a wrapper so paragraph spacing and heading scale stay consistent.

## Common pitfalls

1. **`<nz-icon>` blank, no warning** , the icon isn't registered. Add it to `provideNzIcons([...])`.
2. **Button `[disabled]` ignored** , using the directive on a `<div>` instead of `<button>`. The directive needs a real `<button>` to inherit `disabled` semantics.
3. **`nzBlock` not full-width inside flex parent** , `nzBlock` sets `display: block` and `width: 100%`, but a flex parent may shrink it. Wrap in a flex item with `flex: 1`.