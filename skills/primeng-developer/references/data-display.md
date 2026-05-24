# Data display

Components that render collections, tables, trees, galleries. `Table` is the flagship with by far the largest surface; the others are specialized.

## Table

PrimeNG's data grid. The largest API in the library, this file gives the shape, see the official Table docs for the full reference.

```typescript
import { Table, TableModule } from 'primeng/table';
```

```html
<p-table
  [value]="orders"
  [columns]="cols"
  [paginator]="true"
  [rows]="10"
  [rowsPerPageOptions]="[10, 25, 50]"
  selectionMode="single"
  [(selection)]="selected"
  sortMode="multiple"
>
  <ng-template pTemplate="header">
    <tr>
      <th pSortableColumn="id">ID <p-sortIcon field="id" /></th>
      <th pSortableColumn="customer">Customer <p-sortIcon field="customer" /></th>
      <th>Total</th>
    </tr>
  </ng-template>
  <ng-template pTemplate="body" let-row>
    <tr [pSelectableRow]="row">
      <td>{{ row.id }}</td>
      <td>{{ row.customer }}</td>
      <td>{{ row.total | currency }}</td>
    </tr>
  </ng-template>
</p-table>
```

### Common inputs

| Input | Type | Notes |
|---|---|---|
| `[value]` | `T[]` | The rows. |
| `[columns]` | `any[]` | Optional column metadata (often you set this and project columns dynamically). |
| `[paginator]` | boolean | Show paginator footer. |
| `[rows]` | number | Page size. |
| `[rowsPerPageOptions]` | `number[]` | Page-size dropdown values. |
| `sortMode` | `'single' \| 'multiple'` | Multi-column sort with shift-click when `'multiple'`. |
| `sortField`, `sortOrder` | string, `1 \| -1` | Initial sort. |
| `selectionMode` | `'single' \| 'multiple' \| 'checkbox'` | Row selection. |
| `[(selection)]` | `T \| T[]` | Two-way selected value. |
| `[globalFilterFields]` | `string[]` | Properties searched by the global filter input. |
| `[lazy]` | boolean | Server-side data, paired with `(onLazyLoad)`. |
| `[virtualScroll]` | boolean | Windowed rendering for huge datasets. |
| `virtualScrollItemSize` | number | Row height in px. Required when virtual-scrolling. |
| `[scrollable]`, `scrollHeight` | boolean, string | Fixed-height scroll container. |
| `[expandedRowKeys]` | object | Row expansion state. |
| `[resizableColumns]`, `[reorderableColumns]` | boolean | User-driven column ops. |
| `[responsiveLayout]` | `'scroll' \| 'stack'` | Mobile fallback strategy. |
| `[editingRowKeys]` | object | Inline-edit state. |

### Events

`(onSelectionChange)`, `(onSort)`, `(onPage)`, `(onLazyLoad)`, `(onRowExpand)`, `(onRowCollapse)`, `(onEditInit)`, `(onEditComplete)`, `(onEditCancel)`, `(onFilter)`.

### Supporting directives

| Directive | Use |
|---|---|
| `pSortableColumn="field"` | Makes a `<th>` a sort toggle. |
| `<p-sortIcon field="...">` | Renders the asc/desc arrow. |
| `pSelectableRow` | Marks a `<tr>` as selectable. |
| `pEditableRow`, `pEditableColumn` | Inline-edit hooks for row or cell modes. |
| `pRowToggler="row"` | Toggles row expansion from a button. |
| `<p-rowExpander />` | Standard expander button. |

### Patterns

- **Lazy loading**: set `[lazy]="true"`, handle `(onLazyLoad)` to fetch a page from the server, then update `[value]` and `[totalRecords]`.
- **Virtual scroll**: pair `[virtualScroll]="true"` with `virtualScrollItemSize` (height in px). Don't use with pagination.
- **Inline edit**: cell-mode with `pEditableColumn`, row-mode with `pEditableRow`. Use the `input` template for the editor, the `output` template for the displayed value.

## Tree

Hierarchical node tree.

```typescript
import { Tree } from 'primeng/tree';
import { TreeNode } from 'primeng/api';
```

```html
<p-tree
  [value]="files"
  selectionMode="checkbox"
  [(selection)]="picked"
  [(expandedKeys)]="expanded"
/>
```

| Input | Type | Notes |
|---|---|---|
| `[value]` | `TreeNode[]` | The tree data. |
| `selectionMode` | `'single' \| 'multiple' \| 'checkbox'` | |
| `[(selection)]` | varies by mode | Selected node(s). |
| `[(expandedKeys)]` | `{ [key: string]: boolean }` | Expansion state. |
| `[lazy]` | boolean | Load children on expand via `(onNodeExpand)`. |
| `[draggableNodes]`, `[droppableNodes]` | boolean | Drag-drop reorder. |

Events: `(onNodeSelect)`, `(onNodeUnselect)`, `(onNodeExpand)`, `(onNodeCollapse)`, `(onLazyLoad)`, `(onNodeDrop)`.

## TreeTable

Tree + tabular columns. Same body/header templates as `Table`, applied to tree data.

```typescript
import { TreeTable } from 'primeng/treetable';
```

```html
<p-treeTable [value]="nodes" [columns]="cols" [paginator]="true" [rows]="20">
  <ng-template pTemplate="header" let-columns>
    <tr><th *ngFor="let c of columns">{{ c.header }}</th></tr>
  </ng-template>
  <ng-template pTemplate="body" let-row let-rowData="rowData" let-columns="columns">
    <tr>
      <td *ngFor="let c of columns; let i = index">
        <p-treeTableToggler *ngIf="i === 0" [rowNode]="row" />
        {{ rowData[c.field] }}
      </td>
    </tr>
  </ng-template>
</p-treeTable>
```

Same input/event surface as Table for paging, sorting, selection.

## DataView

List/grid switcher for non-tabular collections.

```typescript
import { DataView } from 'primeng/dataview';
```

```html
<p-dataView [value]="products" [paginator]="true" [rows]="9" [layout]="layout()">
  <ng-template pTemplate="list" let-item>...</ng-template>
  <ng-template pTemplate="grid" let-item>...</ng-template>
</p-dataView>
```

| Input | Type | Notes |
|---|---|---|
| `[value]` | `T[]` | Collection. |
| `[paginator]`, `[rows]` | boolean, number | Pagination. |
| `layout` | `'list' \| 'grid'` | Active template. |
| `sortField`, `sortOrder` | string, `1 \| -1` | Initial sort. |
| `[lazy]` | boolean | Pairs with `(onLazyLoad)`. |

Events: `(onPage)`, `(onSort)`, `(onLazyLoad)`.

Use DataView for product catalogs, image galleries, content cards, anything where rows of cells feel wrong.

## Paginator

Standalone pagination control. Use when you have a custom data renderer (not Table / DataView) and need page controls.

```typescript
import { Paginator } from 'primeng/paginator';
```

```html
<p-paginator
  [rows]="pageSize"
  [totalRecords]="total()"
  [(first)]="offset"
  [rowsPerPageOptions]="[10, 25, 50]"
  (onPageChange)="loadPage($event)"
/>
```

| Input | Type | Notes |
|---|---|---|
| `[rows]` | number | Page size. |
| `[totalRecords]` | number | Total item count. |
| `[(first)]` | number | Zero-based offset of the first item on the current page. |
| `[rowsPerPageOptions]` | `number[]` | Page-size dropdown. |
| `[showFirstLastIcon]`, `[showJumpToPageDropdown]`, `[showCurrentPageReport]` | boolean | Display toggles. |

Event: `(onPageChange)` , `{ first, rows, page, pageCount }`.

## PickList

Dual-list transfer widget (assignees, selected vs available, etc.).

```typescript
import { PickList } from 'primeng/picklist';
```

```html
<p-pickList
  [source]="available"
  [target]="assigned"
  sourceHeader="Available"
  targetHeader="Assigned"
  [showSourceControls]="false"
  [showTargetControls]="false"
  [responsive]="true"
>
  <ng-template let-item pTemplate="item">{{ item.name }}</ng-template>
</p-pickList>
```

Events: `(onMoveToTarget)`, `(onMoveToSource)`, `(onSourceReorder)`, `(onTargetReorder)`.

## OrderList

Single-list reordering.

```typescript
import { OrderList } from 'primeng/orderlist';
```

```html
<p-orderList [(value)]="items" [dragdrop]="true" [responsive]="true">
  <ng-template let-item pTemplate="item">{{ item.label }}</ng-template>
</p-orderList>
```

Event: `(onReorder)`.

## Timeline

Vertical or horizontal event timeline.

```typescript
import { Timeline } from 'primeng/timeline';
```

```html
<p-timeline [value]="events" align="alternate">
  <ng-template pTemplate="content" let-e>{{ e.title }}</ng-template>
  <ng-template pTemplate="opposite" let-e>{{ e.time }}</ng-template>
  <ng-template pTemplate="marker" let-e>
    <i class="pi" [ngClass]="e.icon"></i>
  </ng-template>
</p-timeline>
```

| Input | Notes |
|---|---|
| `[value]` | Array of event objects. |
| `layout` | `'vertical' \| 'horizontal'`. |
| `align` | `'left' \| 'right' \| 'alternate' \| 'top' \| 'bottom'`. |

No events , display-only.

## Carousel

Multi-item rotating gallery.

```typescript
import { Carousel } from 'primeng/carousel';
```

```html
<p-carousel
  [value]="featured"
  [numVisible]="3"
  [numScroll]="1"
  [circular]="true"
  [autoplayInterval]="5000"
  [responsiveOptions]="responsiveOpts"
>
  <ng-template let-item pTemplate="item">...</ng-template>
</p-carousel>
```

| Input | Type | Notes |
|---|---|---|
| `[value]` | `T[]` | Items. |
| `[numVisible]` | number | Visible slides per view. |
| `[numScroll]` | number | Slides advanced per nav click. |
| `[circular]` | boolean | Wrap from last back to first. |
| `[autoplayInterval]` | number | Autoplay tick in ms. 0 disables. |
| `[responsiveOptions]` | array | Per-breakpoint overrides for `numVisible` / `numScroll`. |

Carousel is the *multi-item* component. For single-image hero rotators, use Galleria.

## Galleria

Image / media gallery with thumbnails and lightbox.

```typescript
import { Galleria } from 'primeng/galleria';
```

```html
<!-- inline -->
<p-galleria
  [value]="images"
  [activeIndex]="0"
  [responsiveOptions]="responsiveOpts"
  [showThumbnails]="true"
  thumbnailsPosition="bottom"
>
  <ng-template pTemplate="item" let-image>
    <img [src]="image.src" [alt]="image.alt" />
  </ng-template>
  <ng-template pTemplate="thumbnail" let-image>
    <img [src]="image.thumb" [alt]="image.alt" />
  </ng-template>
</p-galleria>

<!-- lightbox -->
<p-galleria [(visible)]="lightbox" [fullScreen]="true" ... />
```

| Input | Type | Notes |
|---|---|---|
| `[value]` | `T[]` | Items. |
| `[activeIndex]` | number | Current item. |
| `[(visible)]` | boolean | Lightbox toggle when `fullScreen` is true. |
| `[showThumbnails]`, `thumbnailsPosition` | boolean, `'top'\|'bottom'\|'left'\|'right'` | Thumb strip. |
| `[showIndicators]` | boolean | Dot indicators. |
| `[circular]`, `[autoPlay]`, `[transitionInterval]` | various | Auto-rotation. |

## Common pitfalls

1. **Virtual scroll without `virtualScrollItemSize`** , the Table renders rows with zero height. Always set it.
2. **`[lazy]="true"` without handling `(onLazyLoad)`** , the table never populates beyond the initial value.
3. **Selection type mismatch**: `selectionMode="single"` binds to a single object; `'multiple'` binds to an array. Reset the form/state when mode changes.
4. **PickList with shared array reference** , if `source` and `target` are slices of the same array, transfers behave erratically. Use separate arrays.
5. **Galleria in lightbox mode without `[fullScreen]="true"`** , the `[(visible)]` binding is ignored.
6. **Mixing `[paginator]="true"` and `[virtualScroll]="true"`** on Table , conflicting strategies; pick one.