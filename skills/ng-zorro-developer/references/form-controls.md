# Form Controls (Data Entry)

Every NG-ZORRO Data Entry component implements `ControlValueAccessor`, so it works seamlessly with Reactive Forms and (in v22+) Signal Forms via `formControlName` / `formControl` / `ngModel`. See [forms.md](./forms.md) for the wiring strategy.

## Input

Native `<input>` with NG-ZORRO styling. Use the attribute directive.

- Import: `import { NzInputDirective } from 'ng-zorro-antd/input';`
- Markup: `<input nz-input placeholder="Search" formControlName="query" />`
- Inputs: `[nzSize]` (`'large' | 'default' | 'small'`), `[nzStatus]` (`'error' | 'warning'` for unstyled validation states), `[nzBorderless]`.

### nz-input-group

Wraps an input plus prefix / suffix / addons.

```html
<nz-input-group nzPrefixIcon="user" [nzSuffix]="suffixTpl">
  <input nz-input placeholder="username" />
</nz-input-group>
<ng-template #suffixTpl><nz-icon nzType="check" /></ng-template>
```

Use `nzAddOnBefore` / `nzAddOnAfter` for bordered addons (e.g. URL prefix), `nzPrefix` / `nzSuffix` for in-field decoration (icons, char count).

## InputNumber

Numeric input with steppers and parser/formatter hooks.

- Import: `import { NzInputNumberComponent } from 'ng-zorro-antd/input-number';`
- Markup:
  ```html
  <nz-input-number
    formControlName="amount"
    [nzMin]="0"
    [nzMax]="100"
    [nzStep]="0.1"
    [nzPrecision]="2"
    nzFormatter="value => `$ ${value}`"
  />
  ```

## Select

Single or multi-select dropdown with optional search.

- Import: `import { NzSelectComponent, NzOptionComponent } from 'ng-zorro-antd/select';`
- Markup:
  ```html
  <nz-select formControlName="sector" [nzShowSearch]="true">
    @for (s of sectors(); track s.id) {
      <nz-option [nzValue]="s.id" [nzLabel]="s.name" />
    }
  </nz-select>
  ```
- Inputs: `[nzMode]` (`'default' | 'multiple' | 'tags'`), `[nzAllowClear]`, `[nzShowSearch]`, `[nzServerSearch]` (defer filtering to host), `nzMaxTagCount`.

## AutoComplete

Free-text input with suggestion list.

- Import: `import { NzAutocompleteComponent, NzAutocompleteOptionComponent } from 'ng-zorro-antd/auto-complete';`
- Markup:
  ```html
  <input nz-input formControlName="ticker" [nzAutocomplete]="auto" />
  <nz-autocomplete #auto>
    @for (o of options(); track o) {
      <nz-auto-option [nzValue]="o">{{ o }}</nz-auto-option>
    }
  </nz-autocomplete>
  ```

## DatePicker

Date and range picker. Locale-aware, depends on `provideNzI18n`.

- Import: `import { NzDatePickerComponent, NzRangePickerComponent } from 'ng-zorro-antd/date-picker';`
- Markup:
  ```html
  <nz-date-picker formControlName="settleDate" nzFormat="yyyy-MM-dd" />
  <nz-range-picker formControlName="window" [nzShowTime]="true" />
  ```

## TimePicker

Time-of-day picker. Pairs with DatePicker via `[nzShowTime]`.

- Import: `import { NzTimePickerComponent } from 'ng-zorro-antd/time-picker';`
- Markup: `<nz-time-picker formControlName="alertTime" nzFormat="HH:mm" />`

## Cascader

Hierarchical select (country → state → city).

- Import: `import { NzCascaderComponent } from 'ng-zorro-antd/cascader';`
- Markup: `<nz-cascader [nzOptions]="regions()" formControlName="region" />`
- Each option in `nzOptions` has shape `{ value, label, children?, isLeaf?, disabled? }`.

## TreeSelect

Tree-shaped select for hierarchical data.

- Import: `import { NzTreeSelectComponent } from 'ng-zorro-antd/tree-select';`
- Markup:
  ```html
  <nz-tree-select
    [nzNodes]="categoryTree()"
    [nzCheckable]="true"
    formControlName="categoryIds"
  />
  ```

## Checkbox

Single, group, and "select all" patterns.

- Import: `import { NzCheckboxComponent, NzCheckboxGroupComponent, NzCheckboxWrapperComponent } from 'ng-zorro-antd/checkbox';`
- Markup:
  ```html
  <label nz-checkbox formControlName="accepted">I agree to the terms</label>

  <nz-checkbox-group formControlName="flavours" [nzOptions]="['vanilla', 'chocolate', 'mint']" />
  ```

## Radio

Single-select group, with `nz-radio-group`.

- Import: `import { NzRadioComponent, NzRadioGroupComponent } from 'ng-zorro-antd/radio';`
- Markup:
  ```html
  <nz-radio-group formControlName="side">
    <label nz-radio nzValue="buy">Buy</label>
    <label nz-radio nzValue="sell">Sell</label>
  </nz-radio-group>
  ```

## Switch

Boolean toggle, animates on change.

- Import: `import { NzSwitchComponent } from 'ng-zorro-antd/switch';`
- Markup: `<nz-switch formControlName="notifications" [nzCheckedChildren]="onTpl" [nzUnCheckedChildren]="offTpl" />`

## Slider

Range or single-value horizontal/vertical slider.

- Import: `import { NzSliderComponent } from 'ng-zorro-antd/slider';`
- Markup: `<nz-slider formControlName="risk" [nzMin]="0" [nzMax]="100" [nzMarks]="{ 0: 'Low', 100: 'High' }" />`

## Rate

Star rating, 1 to N.

- Import: `import { NzRateComponent } from 'ng-zorro-antd/rate';`
- Markup: `<nz-rate formControlName="rating" [nzAllowHalf]="true" />`

## ColorPicker

Hex / RGB / HSB colour selection.

- Import: `import { NzColorPickerComponent } from 'ng-zorro-antd/color-picker';`
- Markup: `<nz-color-picker formControlName="accent" nzFormat="hex" [nzAllowClear]="true" />`

## Upload

File upload with drag-drop, list, and preview. Wraps Angular's HTTP for you.

- Import: `import { NzUploadComponent, NzUploadFile } from 'ng-zorro-antd/upload';`
- Markup:
  ```html
  <nz-upload
    [nzAction]="uploadUrl"
    [nzMultiple]="true"
    [nzShowUploadList]="true"
    [(nzFileList)]="files"
  >
    <button nz-button><nz-icon nzType="upload" /> Choose files</button>
  </nz-upload>
  ```
- For drag-drop:
  ```html
  <nz-upload nzType="drag" [nzAction]="uploadUrl">
    <p><nz-icon nzType="inbox" /></p>
    <p>Click or drag files here to upload</p>
  </nz-upload>
  ```

## Transfer

Two-list shuttle, move items left/right.

- Import: `import { NzTransferComponent } from 'ng-zorro-antd/transfer';`
- Markup: `<nz-transfer [nzDataSource]="items" [nzTargetKeys]="selected" (nzChange)="onMove($event)" />`

## Mention

`@`-style mention picker inside a textarea.

- Import: `import { NzMentionComponent, NzMentionTriggerDirective } from 'ng-zorro-antd/mention';`
- Use case: chat composer, comment fields.

## Form (the container)

`nz-form-item` + `nz-form-control` + `nz-form-label` is how every input above gets its label, error tip, and required asterisk. See [forms.md](./forms.md) for the full wiring.

## Common pitfalls

1. **DatePicker shows raw English labels** , `provideNzI18n` not registered or wrong locale, see [setup.md](./setup.md).
2. **Select dropdown clipped inside scroll containers** , overlays append to body by default, do NOT override `nzDropdownClassName` to position the panel locally. Trust the CDK overlay.
3. **Upload `nzAction` not firing** , if `nzAction` is missing, Upload runs in "manual" mode and waits for `(nzChange)` handling. Either set `nzAction` to a URL or wire the upload manually via `beforeUpload`.
4. **InputNumber formats but parses NaN** , supplying `nzFormatter` without `nzParser` keeps the formatted string in the model. Provide both.
5. **Switch never emits `(nzCheckedChange)`** , `formControlName` already handles the change, only listen to `(nzCheckedChange)` for non-form scenarios.