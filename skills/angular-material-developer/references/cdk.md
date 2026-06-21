# Angular CDK

The Component Dev Kit (`@angular/cdk`) ships headless primitives Material composes on top of. You can use them on their own when you need a primitive but don't want Material's styling.

CDK is installed automatically with Material as a peer dependency, no extra install step.

## Overlay

Position-anchored floating elements (the basis for menus, tooltips, dialogs, autocomplete).

- Import: `import { Overlay, OverlayRef, OverlayConfig } from '@angular/cdk/overlay';`
- Use case: build a custom popover from scratch.
- Pattern:
  ```ts
  constructor(private overlay = inject(Overlay)) {}

  open(origin: ElementRef) {
    const ref = this.overlay.create({
      positionStrategy: this.overlay.position()
        .flexibleConnectedTo(origin)
        .withPositions([{ originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top' }]),
      hasBackdrop: true,
      backdropClass: 'cdk-overlay-transparent-backdrop',
    });
    ref.attach(new ComponentPortal(MyPopover));
    ref.backdropClick().subscribe(() => ref.detach());
  }
  ```

## Portal

Render content somewhere else in the DOM tree. Used inside Overlay and on its own.

- Import: `import { CdkPortal, CdkPortalOutlet, ComponentPortal, TemplatePortal } from '@angular/cdk/portal';`
- Use case: render a header's actions slot from inside a child route component.
- Pattern: define a portal in the source location, project it via `<ng-container [cdkPortalOutlet]="...">` somewhere else.

## A11y

Accessibility helpers.

- **`FocusTrap`** , trap keyboard focus inside an element (Material Dialog uses this). Import: `cdkTrapFocus` directive.
- **`FocusMonitor`** , track focus origin (keyboard vs mouse) so you can style only keyboard focus rings.
  ```ts
  constructor(private focus = inject(FocusMonitor)) {}
  ngAfterViewInit() {
    this.focus.monitor(this.host.nativeElement, true);
  }
  ```
- **`LiveAnnouncer`** , push transient text to screen readers (aria-live regions). Material's Sort uses it. Inject the service:
  ```ts
  this.live.announce('5 items selected');
  ```
- **`ListKeyManager`** , keyboard navigation for option lists (arrow keys, home/end, type-ahead). Used by `MatSelect`, `MatMenu`.

## DragDrop

- Import: `import { CdkDrag, CdkDropList, CdkDropListGroup, CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';`
- Sortable list:
  ```html
  <div cdkDropList (cdkDropListDropped)="onDrop($event)">
    @for (item of items(); track item.id) {
      <div cdkDrag>{{ item.label }}</div>
    }
  </div>
  ```
- **Kanban (multi-column) pattern.** Wrap all columns in `cdkDropListGroup` instead of wiring each pair with `cdkDropListConnectedTo`, the group auto-connects every descendant `cdkDropList`. Pass a stage-key as `cdkDropListData` so the drop handler knows the target column without needing array indices:
  ```html
  <div cdkDropListGroup>
    @for (col of columns; track col.stage) {
      <div
        cdkDropList
        [cdkDropListData]="col.stage"
        (cdkDropListDropped)="onDrop($event)"
      >
        @for (card of itemsByStage(col.stage)(); track card.id) {
          <article cdkDrag [cdkDragData]="card">...</article>
        }
      </div>
    }
  </div>
  ```
  ```ts
  protected onDrop(event: CdkDragDrop<Stage>): void {
    const target = event.container.data;       // the stage we dropped into
    const card = event.item.data as Card;      // the dragged card
    if (card.stage === target) return;
    this.data.moveCardToStage(card.id, target);
  }
  ```
  When the data source is a signal of cards (`hires = signal<Card[]>`), the drop handler is a tiny update mutator on the signal, no `transferArrayItem` needed because filtering by stage happens at render time.
- **Custom drag preview.** Project a `*cdkDragPreview` template inside the draggable to control what's rendered under the cursor during drag:
  ```html
  <article cdkDrag [cdkDragData]="card">
    <div *cdkDragPreview class="drag-preview">
      <span class="avatar">{{ card.name | initials }}</span>
      <strong>{{ card.name }}</strong>
    </div>
    ...
  </article>
  ```
- **Drag handle** (only part of the element initiates drag): apply `cdkDragHandle` to a child element.

## VirtualScroll

Render large lists efficiently by only mounting visible rows.

- Import: `import { CdkVirtualScrollViewport, CdkVirtualForOf } from '@angular/cdk/scrolling';`
- Markup:
  ```html
  <cdk-virtual-scroll-viewport itemSize="56" class="viewport">
    <div *cdkVirtualFor="let row of rows" class="row">{{ row.name }}</div>
  </cdk-virtual-scroll-viewport>
  ```
- The viewport needs an explicit height. `itemSize` must match the actual rendered row height.

## Stepper (CDK)

Headless stepper, the engine behind Material's `mat-stepper`. Use directly when you need a custom-styled wizard.

- Import: `import { CdkStepper, CdkStep } from '@angular/cdk/stepper';`

## ScrollDispatcher

Listen to scroll events from any registered scrollable. Useful for "show shadow on scroll" patterns.

- Import: `import { ScrollDispatcher, CdkScrollable } from '@angular/cdk/scrolling';`
- Pattern:
  ```ts
  constructor(private scroll = inject(ScrollDispatcher)) {}
  ngOnInit() {
    this.scroll.scrolled().subscribe((cdk) => {
      // cdk is the CdkScrollable that emitted, or null for window scroll
    });
  }
  ```

## Layout (Breakpoints)

Responsive breakpoint observer.

- Import: `import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';`
- Pattern:
  ```ts
  constructor(private bp = inject(BreakpointObserver)) {}

  readonly isHandset = toSignal(
    this.bp.observe(Breakpoints.Handset).pipe(map((s) => s.matches)),
    { initialValue: false },
  );
  ```
- Built-in queries: `Handset`, `Tablet`, `Web`, `XSmall`, `Small`, `Medium`, `Large`, `XLarge`, and Set variants (`HandsetPortrait`, etc.).

## Common pitfalls

1. **Overlay without `provideAnimationsAsync()`** , dialogs jump in. Same provider needed for CDK overlays in Material apps.
2. **`cdk-virtual-scroll-viewport` with no explicit height** , renders zero rows. Always set a height on the viewport.
3. **`cdkDrag` inside a parent with `overflow: hidden`** , the drag preview clips. CDK's drag preview lives in a CDK-managed portal, so the parent's overflow shouldn't matter, but if you're using a custom preview, watch out.
4. **`FocusTrap` on an element not yet in the DOM** , the trap silently fails. Apply it after the element is rendered (use `afterNextRender`).
5. **`BreakpointObserver` polled on every change detection** , use `toSignal()` once and read the signal. Don't call `.observe()` repeatedly.
