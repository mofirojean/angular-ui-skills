# Layout

App-shell primitives, content separators, and spacing helpers. Plus the two "Other" components (Affix, Watermark) since they're layout-adjacent.

## Layout (shell)

Page chrome, Header / Sider / Content / Footer.

- Import: `import { NzLayoutComponent, NzHeaderComponent, NzSiderComponent, NzContentComponent, NzFooterComponent } from 'ng-zorro-antd/layout';`
- Markup:
  ```html
  <nz-layout class="min-h-screen">
    <nz-sider nzCollapsible [(nzCollapsed)]="collapsed">
      <!-- Logo + menu -->
    </nz-sider>
    <nz-layout>
      <nz-header>App header</nz-header>
      <nz-content>Routed content</nz-content>
      <nz-footer>© 2026</nz-footer>
    </nz-layout>
  </nz-layout>
  ```
- Sider inputs: `[nzCollapsible]`, `[(nzCollapsed)]`, `nzWidth`, `nzCollapsedWidth`, `nzBreakpoint` (`'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl'`), `nzTheme` (`'light' | 'dark'`).
- Nesting: `<nz-layout>` can contain another `<nz-layout>`, that's how you get a sider next to a header+content+footer column.

## Grid

24-column grid with responsive breakpoints. Use `nz-row` / `nz-col`.

- Import: `import { NzRowDirective, NzColDirective } from 'ng-zorro-antd/grid';`
- Markup:
  ```html
  <div nz-row nzGutter="16">
    <div nz-col nzXs="24" nzMd="12" nzLg="8">A</div>
    <div nz-col nzXs="24" nzMd="12" nzLg="8">B</div>
    <div nz-col nzXs="24" nzMd="24" nzLg="8">C</div>
  </div>
  ```
- Gutter modes: number (horizontal only), `[a, b]` (horizontal + vertical), `{ xs: 8, md: 16, lg: 24 }` (responsive).
- Breakpoint inputs: `nzXs` (<576px), `nzSm` (≥576), `nzMd` (≥768), `nzLg` (≥992), `nzXl` (≥1200), `nzXxl` (≥1600).

## Flex (v17+)

Thin wrapper around CSS Flexbox with token-aligned gap presets.

- Import: `import { NzFlexDirective } from 'ng-zorro-antd/flex';`
- Markup: `<div nz-flex nzJustify="space-between" nzAlign="center" [nzGap]="16">...</div>`
- Inputs: `nzVertical` (boolean), `nzJustify`, `nzAlign`, `nzGap` (number or `'small' | 'middle' | 'large'`), `nzWrap`.

Use `nz-flex` over hand-rolled `display: flex` when the project standardises on NG-ZORRO spacing tokens, the `nzGap` accepts the same token names used elsewhere.

## Space

Inline spacing between siblings without using gap manually.

- Import: `import { NzSpaceComponent } from 'ng-zorro-antd/space';`
- Markup: `<nz-space [nzSize]="'middle'"><button nz-button>A</button><button nz-button>B</button></nz-space>`
- Inputs: `nzSize` (`'small' | 'middle' | 'large' | number | [number, number]`), `nzDirection` (`'horizontal' | 'vertical'`), `nzAlign`, `nzWrap`, `nzSplit` (TemplateRef for separator).

Prefer `nz-flex` for layout, prefer `nz-space` for "spread a row of action buttons evenly".

## Divider

Horizontal or vertical rule, optionally with a label.

- Import: `import { NzDividerComponent } from 'ng-zorro-antd/divider';`
- Markup:
  ```html
  <nz-divider />
  <nz-divider nzText="Or" nzOrientation="center" />
  <span>before</span><nz-divider nzType="vertical" /><span>after</span>
  ```
- Inputs: `nzType` (`'horizontal' | 'vertical'`), `nzText`, `nzOrientation` (`'left' | 'right' | 'center'`), `[nzDashed]`, `[nzPlain]`.

## Splitter (v18+)

Resizable two-pane split. Drag handle between left/right or top/bottom.

- Import: `import { NzSplitterComponent, NzSplitterPanelComponent } from 'ng-zorro-antd/splitter';`
- Markup:
  ```html
  <nz-splitter style="height: 400px">
    <nz-splitter-panel nzDefaultSize="30%" nzMin="20%">Sidebar</nz-splitter-panel>
    <nz-splitter-panel>Main</nz-splitter-panel>
  </nz-splitter>
  ```
- Useful for IDE-style layouts, master/detail views.

## Affix (Other)

Pins a child to the viewport once the user scrolls past a threshold.

- Import: `import { NzAffixComponent } from 'ng-zorro-antd/affix';`
- Markup: `<nz-affix [nzOffsetTop]="64"><button nz-button>Stuck</button></nz-affix>`
- Use cases: sticky page header (within a scrollable container), sticky action bar.

## Watermark (Other)

Tiled background watermark on a wrapped element, used for confidential dashboards.

- Import: `import { NzWatermarkComponent } from 'ng-zorro-antd/watermark';`
- Markup: `<nz-watermark nzContent="Confidential">...page content...</nz-watermark>`
- Inputs: `nzContent` (string or string[]), `nzImage`, `nzWidth`, `nzHeight`, `nzRotate`, `nzZIndex`, `nzGap`, `nzOffset`.

## Common pitfalls

1. **`nz-sider` doesn't collapse responsively** , set `nzBreakpoint` AND `[nzCollapsedWidth]="0"` for the mobile-hidden pattern.
2. **`nz-row` gutter visible at edges** , gutter is applied as padding on each `nz-col`, the parent `nz-row` also gets negative margin to offset. If you wrap `nz-row` in a fixed-width container, set the container's `padding-inline` to match the gutter.
3. **Watermark not showing** , `nz-watermark` needs a sized wrapper (non-zero height). It tiles via a background-image on the wrapper.