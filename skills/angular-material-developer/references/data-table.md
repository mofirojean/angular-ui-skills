# Data Table

Material's Table is the most powerful and most fiddly part of the library. It's a CDK-backed structural component that lets you compose columns, sort, paginate, filter, and embed sub-rows.

## MatTable

- Import: `import { MatTable, MatColumnDef, MatHeaderCell, MatHeaderCellDef, MatHeaderRow, MatHeaderRowDef, MatCell, MatCellDef, MatRow, MatRowDef } from '@angular/material/table';`
- Or the convenience module: `import { MatTableModule } from '@angular/material/table';`

### Minimal example

```html
<table mat-table [dataSource]="rows()">
  <ng-container matColumnDef="id">
    <th mat-header-cell *matHeaderCellDef>ID</th>
    <td mat-cell *matCellDef="let row">{{ row.id }}</td>
  </ng-container>

  <ng-container matColumnDef="name">
    <th mat-header-cell *matHeaderCellDef>Name</th>
    <td mat-cell *matCellDef="let row">{{ row.name }}</td>
  </ng-container>

  <ng-container matColumnDef="email">
    <th mat-header-cell *matHeaderCellDef>Email</th>
    <td mat-cell *matCellDef="let row">{{ row.email }}</td>
  </ng-container>

  <tr mat-header-row *matHeaderRowDef="['id', 'name', 'email']"></tr>
  <tr mat-row *matRowDef="let row; columns: ['id', 'name', 'email']"></tr>
</table>
```

Key pieces:
- **`[dataSource]`** , an array, a `MatTableDataSource<T>`, or a custom `DataSource<T>`.
- **`<ng-container matColumnDef="key">`** , one per column.
- **`*matHeaderCellDef`** + **`*matCellDef`** , the structural directives that emit the rows.
- **`*matHeaderRowDef`** , the array of column keys to display.
- **`*matRowDef`** , the same array for body rows.

### MatTableDataSource

The default data source. Wraps an array and adds sort + paginator + filter integration:

```ts
import { MatTableDataSource } from '@angular/material/table';

dataSource = new MatTableDataSource<Ticket>([]);

ngOnInit() {
  this.dataSource.data = this.api.tickets();
}
```

### Sort

- Import: `import { MatSort, MatSortHeader } from '@angular/material/sort';`
- Markup:
  ```html
  <table mat-table [dataSource]="dataSource" matSort>
    <ng-container matColumnDef="name">
      <th mat-header-cell *matHeaderCellDef mat-sort-header>Name</th>
      <td mat-cell *matCellDef="let row">{{ row.name }}</td>
    </ng-container>
    ...
  </table>
  ```
- Wire up the sort to the data source:
  ```ts
  ngAfterViewInit() {
    this.dataSource.sort = this.sort();
  }

  // Where `sort()` is a viewChild on MatSort.
  ```

### Pagination

- Import: `import { MatPaginator } from '@angular/material/paginator';`
- Markup:
  ```html
  <table mat-table [dataSource]="dataSource" matSort>...</table>
  <mat-paginator [pageSizeOptions]="[10, 25, 50]" pageSize="10" showFirstLastButtons />
  ```
- Wire:
  ```ts
  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator();
  }
  ```

### Filter

`MatTableDataSource` ships with a free-text filter that searches all cell values:

```ts
applyFilter(query: string) {
  this.dataSource.filter = query.trim().toLowerCase();
}
```

For custom filter logic, override `dataSource.filterPredicate`.

### Row expansion

Add a second row with a detail template:

```html
<ng-container matColumnDef="expandedDetail">
  <td mat-cell *matCellDef="let row" [attr.colspan]="displayedColumns.length">
    <div class="row-detail" [@detailExpand]="row === expanded ? 'expanded' : 'collapsed'">
      ...detail content...
    </div>
  </td>
</ng-container>

<tr mat-row *matRowDef="let row; columns: displayedColumns; let i = index" (click)="expanded = expanded === row ? null : row"></tr>
<tr mat-row *matRowDef="let row; columns: ['expandedDetail']; when: isExpansionDetailRow"></tr>
```

### Selection

CDK ships `SelectionModel<T>` for managing selected rows:

```ts
import { SelectionModel } from '@angular/cdk/collections';

selection = new SelectionModel<Ticket>(true /* multi */, [] /* initial */);
```

Wire a header checkbox + per-row checkboxes to it.

## Common pitfalls

1. **`*matRowDef` columns don't match `*matHeaderRowDef`** , the body row is empty even though the table compiles. Always pass the same array.
2. **Sort doesn't sort** , `dataSource.sort = this.sort()` happens in `ngOnInit` before the viewChild is queryable. Move to `ngAfterViewInit`.
3. **Paginator shows but doesn't paginate** , same issue, wire in `ngAfterViewInit`.
4. **Filter ignores nested object fields** , `MatTableDataSource`'s default predicate flattens the row to a string of top-level values. Override `filterPredicate` for deep search.
5. **Server-side pagination doesn't work with `MatTableDataSource`** , the default data source assumes all rows are loaded. For server-side data, implement a custom `DataSource<T>` that calls your API per page change. The CDK `DataSource` API is what `MatTableDataSource` extends.
6. **`mat-paginator` is below the table** , inside a flex container, it can grow past the viewport. Wrap in a scroll container, or use the page-size and sticky-header patterns in [layout.md](./layout.md).
