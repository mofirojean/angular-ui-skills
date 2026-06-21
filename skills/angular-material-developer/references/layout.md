# Layout

Containers and section primitives: Card, Divider, ExpansionPanel, GridList, List, Stepper, Tabs, Tree.

## MatCard

A surface with optional header / image / actions slots.

- Import: `import { MatCard, MatCardHeader, MatCardTitle, MatCardSubtitle, MatCardContent, MatCardActions, MatCardImage } from '@angular/material/card';`
- Markup:
  ```html
  <mat-card appearance="outlined">
    <mat-card-header>
      <mat-card-title>Title</mat-card-title>
      <mat-card-subtitle>Subtitle</mat-card-subtitle>
    </mat-card-header>
    <img mat-card-image src="/cover.jpg" alt="" />
    <mat-card-content>Body</mat-card-content>
    <mat-card-actions align="end">
      <button mat-button>Cancel</button>
      <button mat-flat-button>Save</button>
    </mat-card-actions>
  </mat-card>
  ```
- `appearance`: `'elevated'` (default, shadow) or `'outlined'` (border, no shadow).

## MatDivider

Horizontal or vertical line.

- Import: `import { MatDivider } from '@angular/material/divider';`
- Markup: `<mat-divider />` or `<mat-divider vertical />`
- Inset: `<mat-divider inset />` adds horizontal margin so it doesn't go edge-to-edge.

## MatExpansionPanel

Accordion-style collapsible. Use `MatAccordion` to make multiple panels exclusive.

- Import: `import { MatAccordion, MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelTitle, MatExpansionPanelDescription } from '@angular/material/expansion';`
- Markup:
  ```html
  <mat-accordion>
    <mat-expansion-panel>
      <mat-expansion-panel-header>
        <mat-panel-title>Personal info</mat-panel-title>
        <mat-panel-description>Name, email, etc.</mat-panel-description>
      </mat-expansion-panel-header>
      <p>Body content...</p>
    </mat-expansion-panel>
    <mat-expansion-panel>
      ...
    </mat-expansion-panel>
  </mat-accordion>
  ```
- For independent panels (multiple can be open), drop the `mat-accordion` wrapper.

## MatGridList

CSS-grid layout with fixed-aspect tiles.

- Import: `import { MatGridList, MatGridTile } from '@angular/material/grid-list';`
- Markup:
  ```html
  <mat-grid-list cols="4" rowHeight="120px" gutterSize="12px">
    @for (item of items(); track item.id) {
      <mat-grid-tile [colspan]="item.wide ? 2 : 1">
        {{ item.label }}
      </mat-grid-tile>
    }
  </mat-grid-list>
  ```
- Use `rowHeight="2:1"` (aspect ratio) or a number/string in px.

## MatList / MatActionList / MatSelectionList / MatNavList

Several list flavors:

- Import: `import { MatList, MatListItem, MatActionList, MatNavList, MatSelectionList, MatListOption } from '@angular/material/list';`
- Flavours:
  ```html
  <mat-list>                              <!-- static -->
    <mat-list-item>Plain row</mat-list-item>
  </mat-list>

  <mat-action-list>                       <!-- buttons -->
    <button mat-list-item (click)="select(item)">{{ item.label }}</button>
  </mat-action-list>

  <mat-nav-list>                          <!-- router links -->
    <a mat-list-item [routerLink]="['/x']" routerLinkActive="active">X</a>
  </mat-nav-list>

  <mat-selection-list [(ngModel)]="selected">
    <mat-list-option *ngFor="let f of files" [value]="f.id">{{ f.name }}</mat-list-option>
  </mat-selection-list>
  ```

## MatStepper

Linear or non-linear wizard. Built on CDK Stepper.

- Import: `import { MatStepper, MatStep, MatStepLabel } from '@angular/material/stepper';`
- Markup:
  ```html
  <mat-stepper linear>
    <mat-step [stepControl]="customerForm" label="Customer">
      <form [formGroup]="customerForm">...</form>
      <button mat-button matStepperNext>Next</button>
    </mat-step>
    <mat-step [stepControl]="orderForm" label="Order">
      ...
      <button mat-button matStepperPrevious>Back</button>
      <button mat-flat-button matStepperNext>Next</button>
    </mat-step>
    <mat-step label="Review">
      ...
      <button mat-button matStepperPrevious>Back</button>
      <button mat-flat-button (click)="submit()">Submit</button>
    </mat-step>
  </mat-stepper>
  ```
- `orientation="vertical"` for stacked layout.

## MatTabGroup

Tab navigation.

- Import: `import { MatTabGroup, MatTab, MatTabLabel } from '@angular/material/tabs';`
- Markup:
  ```html
  <mat-tab-group [(selectedIndex)]="active" animationDuration="0ms">
    <mat-tab label="Overview">...</mat-tab>
    <mat-tab label="Activity">...</mat-tab>
    <mat-tab label="Settings">
      <ng-template matTabLabel><mat-icon>settings</mat-icon> Settings</ng-template>
      ...
    </mat-tab>
  </mat-tab-group>
  ```
- `mat-tab-nav-bar` is a separate component for router-linked tab navigation.

## MatTree

Hierarchical view.

- Import: `import { MatTree, MatTreeNode, MatNestedTreeNode } from '@angular/material/tree';`
- Two flavors:
  - **Flat tree** , flattens the data via `MatTreeFlattener`, performs better on large trees.
  - **Nested tree** , each node renders its children directly inside.
- The v17+ API uses `childrenAccessor` or `levelAccessor` (no `treeControl`):
  ```html
  <mat-tree [dataSource]="nodes" [childrenAccessor]="childrenOf">
    <mat-tree-node *matTreeNodeDef="let node" matTreeNodePadding>...</mat-tree-node>
    <mat-tree-node *matTreeNodeDef="let node; when: hasChildren" matTreeNodePadding matTreeNodeToggle>...</mat-tree-node>
  </mat-tree>
  ```
- `childrenAccessor` is typed `(node: T) => T[] | Observable<T[]>` , **not** `readonly T[]`. If your domain model uses `readonly children: readonly T[]`, you must spread on the way out:
  ```ts
  childrenOf = (n: TreeNode): TreeNode[] => [...n.children];
  ```
  Otherwise TypeScript errors with `Type 'readonly TreeNode[]' is not assignable to type 'TreeNode[] | Observable<TreeNode[]>'`.
- Markup is otherwise verbose, refer to the Material docs for a full example.

## Common pitfalls

1. **`mat-grid-list` ignores `cols` after first render** , `cols` is consumed at init. Changing it dynamically requires a re-render (e.g. wrap in `@if`).
2. **`mat-stepper linear` without `stepControl`** , the Next button stays disabled. Each step needs a control to validate against.
3. **`mat-tab-group` re-creates tab content on switch** , state inside resets every time. To preserve, render content lazily with `<ng-template matTabContent>`.
4. **`mat-accordion` without `multi`** , only one panel can be open at a time. Add `multi` if you want independent toggling.
5. **`mat-list-option` outside `mat-selection-list`** , won't render. Always wrap.
6. **Two-line `mat-list-item` resists `align-self: center` overrides on the leading icon.** Material's MDC list-item applies internal padding inside `.mat-mdc-list-item-unscoped-content` that competes with your alignment rules, the icon drifts toward the top edge even when `min-height` is generous. For tight vertical alignment, drop the `mat-list-item` structure entirely and use a plain `<button>` with `display: flex; align-items: center;` and your own icon + text-block children. The `examples/roster` settings sub-sidebar uses this pattern.
7. **`childrenAccessor` rejects `readonly T[]`** , see the MatTree section above. Spread the readonly array into a mutable one in the accessor.
