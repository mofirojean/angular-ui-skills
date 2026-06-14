# Data Display

Components that render information without taking input. Tables, lists, cards, badges, trees, calendars, descriptions, statistic blocks.

Tooltip and Popover live in [overlays.md](./overlays.md) since they're hint surfaces. Everything else in the "Data Display" category lives here.

## Table

The flagship. Sortable, filterable, paginated, virtually scrollable, with row expansion and fixed columns.

- Import: `import { NzTableComponent } from 'ng-zorro-antd/table';` (and `NzThAddOnComponent`, `NzTdAddOnComponent` for sort/filter headers)
- Markup:
  ```html
  <nz-table
    #table
    [nzData]="rows()"
    [nzPageSize]="20"
    [nzShowPagination]="true"
    [nzShowSizeChanger]="true"
    nzSize="small"
  >
    <thead>
      <tr>
        <th nzColumnKey="ticker" [nzSortFn]="sortByTicker">Ticker</th>
        <th>Name</th>
        <th nzAlign="right">Qty</th>
        <th nzWidth="80px"></th>
      </tr>
    </thead>
    <tbody>
      @for (r of table.data; track r.ticker) {
        <tr>
          <td>{{ r.ticker }}</td>
          <td>{{ r.name }}</td>
          <td nzAlign="right">{{ r.qty }}</td>
          <td><button nz-button nzType="text">⋮</button></td>
        </tr>
      }
    </tbody>
  </nz-table>
  ```
- Inputs to know: `nzData`, `nzPageSize`, `nzPageIndex`, `[nzShowPagination]`, `[nzShowSizeChanger]`, `nzScroll` (`{ x: '1200px', y: '400px' }` for fixed-header / horizontal scroll), `[nzLoading]`, `nzSize`, `[nzBordered]`, `[nzVirtualItemSize]` (enable virtual scroll).
- For server-side data, set `[nzData]="[]"` initial, listen to `(nzPageIndexChange)` / `(nzPageSizeChange)` / `(nzSortOrderChange)` / `(nzFilterChange)`, and refetch.
- Row expansion: use `[nzExpand]` on a second `<tr>` per row, toggled by a signal.

## Tree

Collapsible hierarchical view, selectable, checkable, draggable.

- Import: `import { NzTreeComponent, NzTreeNodeOptions } from 'ng-zorro-antd/tree';`
- Markup: `<nz-tree [nzData]="nodes()" [nzCheckable]="true" (nzClick)="onNode($event)" />`
- `NzTreeNodeOptions`: `{ title, key, children?, isLeaf?, disabled?, expanded?, selected?, checked? }`.

## TreeView (CDK-backed, v17+)

Lower-level tree with full template control. Use when `nz-tree` can't express what you need.

## Calendar

Month / year grid view, supports per-cell template projection for dashboards.

- Import: `import { NzCalendarComponent } from 'ng-zorro-antd/calendar';`
- Markup:
  ```html
  <nz-calendar [(ngModel)]="selectedDate">
    <ng-container *nzDateCell="let d">
      @if (eventsOn(d); as evts) {
        <ul class="events">@for (e of evts; track e.id) { <li>{{ e.label }}</li> }</ul>
      }
    </ng-container>
  </nz-calendar>
  ```

## Card

Container with header / body / footer / cover / actions slots.

- Import: `import { NzCardComponent } from 'ng-zorro-antd/card';`
- Markup:
  ```html
  <nz-card nzTitle="Portfolio" [nzExtra]="extraTpl">
    Body content
  </nz-card>
  <ng-template #extraTpl><a>More</a></ng-template>
  ```
- Inputs: `nzTitle`, `nzExtra`, `[nzBordered]`, `[nzHoverable]`, `[nzLoading]`, `nzSize`, `[nzActions]` (array of TemplateRef for footer action row).

## List

Flexible vertical/horizontal list with header, footer, pagination, virtual-scroll.

- Import: `import { NzListModule } from 'ng-zorro-antd/list';`
- Markup:
  ```html
  <nz-list nzItemLayout="horizontal" [nzDataSource]="items()" [nzRenderItem]="item">
    <ng-template #item let-it>
      <nz-list-item>
        <nz-list-item-meta nzTitle="{{ it.title }}" nzDescription="{{ it.desc }}" />
      </nz-list-item>
    </ng-template>
  </nz-list>
  ```

## Descriptions

Key-value detail panels. Best for "View object" pages.

- Import: `import { NzDescriptionsComponent, NzDescriptionsItemComponent } from 'ng-zorro-antd/descriptions';`
- Markup:
  ```html
  <nz-descriptions nzTitle="AAPL" nzBordered nzSize="small">
    <nz-descriptions-item nzTitle="Sector">Technology</nz-descriptions-item>
    <nz-descriptions-item nzTitle="Quantity">120</nz-descriptions-item>
    <nz-descriptions-item nzTitle="Avg cost" [nzSpan]="2">$184.20</nz-descriptions-item>
  </nz-descriptions>
  ```
- Layout via 24-column `nzSpan` per item.

## Statistic

Single big number with optional prefix / suffix / decimal handling. Often inside `nz-card`.

- Import: `import { NzStatisticComponent } from 'ng-zorro-antd/statistic';`
- Markup: `<nz-statistic nzTitle="Day P/L" [nzValue]="dayPL()" nzPrefix="$" [nzValueStyle]="{ color: '#16a34a' }" />`

## Avatar / Badge / Tag

Tight identity / status decorators. Often inline inside tables and lists.

```html
<nz-avatar nzText="K" nzSize="large" />
<nz-avatar nzIcon="user" />
<nz-badge [nzCount]="5"><nz-avatar nzIcon="user" /></nz-badge>

<nz-tag nzColor="green">Long</nz-tag>
<nz-tag nzColor="red">Short</nz-tag>
```

## Carousel

Horizontal/vertical slider. Useful for hero banners and news strips.

- Import: `import { NzCarouselComponent, NzCarouselContentDirective } from 'ng-zorro-antd/carousel';`
- Markup:
  ```html
  <nz-carousel [nzAutoPlay]="true" nzEffect="fade">
    <div nz-carousel-content>Slide A</div>
    <div nz-carousel-content>Slide B</div>
  </nz-carousel>
  ```

## Collapse

Accordion or independent panels.

- Import: `import { NzCollapseComponent, NzCollapsePanelComponent } from 'ng-zorro-antd/collapse';`
- Markup:
  ```html
  <nz-collapse [nzAccordion]="true">
    <nz-collapse-panel nzHeader="Section A" [nzActive]="true">Body A</nz-collapse-panel>
    <nz-collapse-panel nzHeader="Section B">Body B</nz-collapse-panel>
  </nz-collapse>
  ```

## Image

Click-to-zoom preview, fallback, lazy load.

- Import: `import { NzImageDirective } from 'ng-zorro-antd/image';`
- Markup: `<img nz-image nzSrc="https://example.com/cover.jpg" [nzFallback]="placeholder" />`

## QRCode

Inline QR generation for share/auth surfaces.

- Import: `import { NzQRCodeComponent } from 'ng-zorro-antd/qr-code';`
- Markup: `<nz-qrcode [nzValue]="shareUrl()" [nzSize]="200" nzLevel="H" [nzColor]="'#000'" />`

## Segmented (v15+)

Pill toggle with N options. Lighter than `nz-tabs` for in-content view switches.

- Import: `import { NzSegmentedComponent } from 'ng-zorro-antd/segmented';`
- Markup: `<nz-segmented [nzOptions]="['Day', 'Week', 'Month']" [(ngModel)]="period" />`

## Timeline

Vertical activity stream.

- Import: `import { NzTimelineComponent, NzTimelineItemComponent } from 'ng-zorro-antd/timeline';`
- Markup:
  ```html
  <nz-timeline>
    <nz-timeline-item nzColor="green">Order placed</nz-timeline-item>
    <nz-timeline-item nzColor="blue">Filled at $184.20</nz-timeline-item>
    <nz-timeline-item nzColor="red">Refund requested</nz-timeline-item>
  </nz-timeline>
  ```

## Empty

The "no data" placeholder. Used by Table / List by default, can be customised globally via `provideNzConfig`.

- Import: `import { NzEmptyComponent } from 'ng-zorro-antd/empty';`
- Markup: `<nz-empty nzNotFoundContent="No holdings yet" />`

## Comment

Threaded reply markup (avatar, author, content, datetime, actions). Mostly used in admin / forum surfaces.

- Import: `import { NzCommentComponent } from 'ng-zorro-antd/comment';`

## Common pitfalls

1. **Table doesn't refresh when `nzData` mutates in place** , NG-ZORRO does reference-equality. Push a new array (`[...rows, newRow]`) or a signal-derived value.
2. **Server-side Table pagination ignores `[nzPageSize]`** , server-side mode requires `[nzFrontPagination]="false"` and `[nzTotal]="totalCount"`.
3. **Tree drag-drop reorders the wrong node** , `nz-tree` clones nodes by reference. If you mutate the original `nzData`, drag/drop computes stale paths. Reassign the array on each change.
4. **Calendar shows wrong week start** , set the locale via `provideNzI18n`, the week start follows the locale's convention.