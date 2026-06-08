# Navigation

Wayfinding components: menus, breadcrumbs, tabs, pagination, steps, dropdowns, page header, anchor.

## Menu

Horizontal, vertical, or inline tree of links. Pairs with Router for app-shell navigation.

- Import: `import { NzMenuDirective, NzMenuItemComponent, NzSubMenuComponent } from 'ng-zorro-antd/menu';`
- Markup:
  ```html
  <ul nz-menu nzMode="inline" nzTheme="dark">
    <li nz-menu-item routerLink="/dashboard" routerLinkActive="ant-menu-item-selected">
      <nz-icon nzType="dashboard" />
      <span>Dashboard</span>
    </li>
    <li nz-submenu nzTitle="Reports" nzIcon="bar-chart">
      <ul>
        <li nz-menu-item routerLink="/reports/daily">Daily</li>
        <li nz-menu-item routerLink="/reports/monthly">Monthly</li>
      </ul>
    </li>
  </ul>
  ```
- Inputs: `nzMode` (`'horizontal' | 'inline' | 'vertical'`), `nzTheme` (`'light' | 'dark'`), `[nzInlineCollapsed]` (collapsed sider state), `[nzSelectable]`.
- For active state with Angular Router, use `routerLinkActive` on the `nz-menu-item`.

## Dropdown

Click/hover-triggered overlay of actions, often anchored to a button.

- Import: `import { NzDropDownDirective, NzDropdownMenuComponent } from 'ng-zorro-antd/dropdown';`
- Markup:
  ```html
  <button nz-button nz-dropdown [nzDropdownMenu]="menu">
    Actions <nz-icon nzType="down" />
  </button>
  <nz-dropdown-menu #menu="nzDropdownMenu">
    <ul nz-menu>
      <li nz-menu-item>Edit</li>
      <li nz-menu-item nzDanger>Delete</li>
    </ul>
  </nz-dropdown-menu>
  ```
- Inputs on the trigger: `nzTrigger` (`'click' | 'hover'`), `nzPlacement`, `[nzVisible]`, `(nzVisibleChange)`.

## Breadcrumb

Trail of navigation up the tree. Often static and bound to the active route.

- Import: `import { NzBreadCrumbComponent, NzBreadCrumbItemComponent } from 'ng-zorro-antd/breadcrumb';`
- Markup:
  ```html
  <nz-breadcrumb>
    <nz-breadcrumb-item><a routerLink="/">Home</a></nz-breadcrumb-item>
    <nz-breadcrumb-item><a routerLink="/holdings">Holdings</a></nz-breadcrumb-item>
    <nz-breadcrumb-item>AAPL</nz-breadcrumb-item>
  </nz-breadcrumb>
  ```
- Auto-mode: `<nz-breadcrumb nzAutoGenerate />` walks the active route tree and pulls labels from `route.data.breadcrumb`.

## Tabs

Switch between sibling views without route change.

- Import: `import { NzTabsModule } from 'ng-zorro-antd/tabs';` (or the standalone classes from the same path)
- Markup:
  ```html
  <nz-tabset [nzSelectedIndex]="0" (nzSelectChange)="onTab($event)">
    <nz-tab nzTitle="Overview"><app-overview /></nz-tab>
    <nz-tab nzTitle="Performance"><app-performance /></nz-tab>
    <nz-tab nzTitle="Notes"><app-notes /></nz-tab>
  </nz-tabset>
  ```
- Inputs on `nz-tabset`: `nzType` (`'line' | 'card'`), `nzTabPosition` (`'top' | 'right' | 'bottom' | 'left'`), `[nzCentered]`, `[nzAnimated]`, `(nzSelectedIndexChange)`.
- Use route-driven tabs for deep-linkable surfaces, bind `nzSelectedIndex` to a signal that mirrors a route param.

## Pagination

Page-jump control for tables and lists.

- Import: `import { NzPaginationComponent } from 'ng-zorro-antd/pagination';`
- Markup:
  ```html
  <nz-pagination
    [nzPageIndex]="page()"
    [nzTotal]="total()"
    [nzPageSize]="size()"
    [nzShowSizeChanger]="true"
    (nzPageIndexChange)="setPage($event)"
    (nzPageSizeChange)="setSize($event)"
  />
  ```
- Use the table-embedded paginator when working with `<nz-table>` (driven by table's `[nzPageSize]` and `[nzPageIndex]`), use standalone `<nz-pagination>` for non-table lists.

## Steps

Linear wizard progress indicator.

- Import: `import { NzStepsComponent, NzStepComponent } from 'ng-zorro-antd/steps';`
- Markup:
  ```html
  <nz-steps [nzCurrent]="current()" nzDirection="horizontal">
    <nz-step nzTitle="Instrument" nzDescription="Pick a ticker" />
    <nz-step nzTitle="Side" nzDescription="Buy or sell" />
    <nz-step nzTitle="Size" />
    <nz-step nzTitle="Review" />
  </nz-steps>
  ```
- Pair with a Reactive Forms group per step for linear wizards. See [forms.md](./forms.md).

## PageHeader

Title row with breadcrumb slot, back arrow, sub-title, and trailing actions.

- Import: `import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';`
- Markup:
  ```html
  <nz-page-header (nzBack)="goBack()" nzTitle="AAPL" nzSubtitle="Apple Inc.">
    <nz-page-header-tags><nz-tag nzColor="green">Long</nz-tag></nz-page-header-tags>
    <nz-page-header-extra>
      <button nz-button nzType="primary">Trade</button>
    </nz-page-header-extra>
  </nz-page-header>
  ```

## Anchor

Sticky-scroll table of contents that highlights the current section.

- Import: `import { NzAnchorComponent, NzAnchorLinkComponent } from 'ng-zorro-antd/anchor';`
- Markup:
  ```html
  <nz-anchor>
    <nz-link nzHref="#intro" nzTitle="Intro" />
    <nz-link nzHref="#api" nzTitle="API" />
    <nz-link nzHref="#examples" nzTitle="Examples" />
  </nz-anchor>
  ```
- Useful for long docs / settings pages.

## Common pitfalls

1. **`<nz-menu>` doesn't highlight the active route** , add `routerLinkActive="ant-menu-item-selected"` on each `nz-menu-item`. The directive doesn't auto-sync with the router.
2. **`nz-tabset` re-creates content on tab change** , default behaviour. To keep state alive across tabs, project content lazily via `<ng-template>` and only render the active tab.
3. **Dropdown placement is wrong inside `overflow: hidden` parents** , NG-ZORRO overlays use the CDK and append to the body by default; if you've forced `appendTo`, switch back to the default.
4. **Anchor links don't scroll to target** , the anchor element must have a matching `id` attribute on the page, the `nzHref` is hash-based.