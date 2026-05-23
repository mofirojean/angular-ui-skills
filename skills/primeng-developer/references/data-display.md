# Data display

> Status: outline. Fill in.

## Table

- PrimeNG's flagship component — large API surface
- Basic shape: `[value]` + `<ng-template pTemplate="header|body|...">`
- Sorting (single + multi), filtering, pagination
- Selection: single, multiple, radio/checkbox
- Lazy loading (`(onLazyLoad)`)
- Row expansion, row grouping, frozen columns
- Reordering: rows + columns
- Export (CSV, optional XLSX)
- Inline editing (cell + row modes)
- Virtual scrolling

## Tree

- Hierarchical node list
- Selection modes, lazy children
- Drag-drop reorder

## TreeTable

- Tree + tabular columns
- Same template patterns as Table

## DataView

- Card / list grid alternative to Table
- Layout switcher (list ↔ grid)
- Pagination + lazy loading

## Paginator

- Standalone paginator (without Table)
- Custom templates for first / prev / next / last
- Page size selector

## PickList

- Two-list transfer UI (source ↔ target)
- Reorderable

## OrderList

- Single-list reorder with up/down/move-to-top/bottom

## Timeline

- Vertical or horizontal event timeline
- Alternate alignment

## Carousel

- Multi-item carousel (not a hero rotator — that's Galleria)
- Responsive `numVisible` + `numScroll`
- Autoplay

## Galleria

- Image / media gallery with thumbnails + indicators
- Lightbox / inline modes
- Custom item template
