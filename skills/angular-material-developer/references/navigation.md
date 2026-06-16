# Navigation

Wayfinding primitives: Menu, Sidenav, Toolbar.

## MatToolbar

A horizontal bar at the top of a section or the page.

- Import: `import { MatToolbar, MatToolbarRow } from '@angular/material/toolbar';`
- Markup:
  ```html
  <mat-toolbar color="primary">
    <button mat-icon-button><mat-icon>menu</mat-icon></button>
    <span>Roster</span>
    <span class="spacer"></span>
    <button mat-icon-button><mat-icon>notifications</mat-icon></button>
  </mat-toolbar>
  ```
- Multi-row: stack `<mat-toolbar-row>` elements inside.
- The toolbar does not position itself, place it inside a sidenav container or directly in the app shell.

## MatSidenav / MatSidenavContainer

App shell with a slide-in side panel.

- Import: `import { MatSidenav, MatSidenavContainer, MatSidenavContent } from '@angular/material/sidenav';`
- Markup:
  ```html
  <mat-sidenav-container class="app-shell">
    <mat-sidenav #side mode="side" opened>
      <mat-toolbar>App</mat-toolbar>
      <mat-nav-list>
        <a mat-list-item routerLink="/" routerLinkActive="active">Home</a>
        <a mat-list-item routerLink="/people" routerLinkActive="active">People</a>
      </mat-nav-list>
    </mat-sidenav>

    <mat-sidenav-content>
      <mat-toolbar>
        <button mat-icon-button (click)="side.toggle()"><mat-icon>menu</mat-icon></button>
        <span>{{ pageTitle() }}</span>
      </mat-toolbar>
      <main>
        <router-outlet />
      </main>
    </mat-sidenav-content>
  </mat-sidenav-container>
  ```
- Modes:
  - `mode="side"` , pushes the content (great for desktop)
  - `mode="over"` , overlays the content with a backdrop (mobile-style)
  - `mode="push"` , pushes content + dims it
- `opened` / `mode` typically driven by a viewport-width signal so the sidenav is `over` on phones and `side` on desktop. See [accessibility.md](./accessibility.md) for the breakpoint observer pattern.

## MatMenu

Dropdown menu opened by a trigger button.

- Import: `import { MatMenu, MatMenuTrigger, MatMenuItem } from '@angular/material/menu';`
- Markup:
  ```html
  <button mat-button [matMenuTriggerFor]="actions">
    Actions <mat-icon>arrow_drop_down</mat-icon>
  </button>
  <mat-menu #actions="matMenu">
    <button mat-menu-item (click)="edit()">
      <mat-icon>edit</mat-icon> Edit
    </button>
    <button mat-menu-item (click)="archive()">
      <mat-icon>archive</mat-icon> Archive
    </button>
    <mat-divider />
    <button mat-menu-item (click)="delete()" class="danger">
      <mat-icon>delete</mat-icon> Delete
    </button>
  </mat-menu>
  ```
- Nested submenus: bind another `[matMenuTriggerFor]` on a `mat-menu-item`.

## Tab navigation

For top-level tab navigation tied to routes, use `mat-tab-nav-bar` + `mat-tab-link` (different from `mat-tab-group`):

```html
<nav mat-tab-nav-bar [tabPanel]="tabPanel">
  <a mat-tab-link routerLink="overview" routerLinkActive #rla="routerLinkActive" [active]="rla.isActive">
    Overview
  </a>
  <a mat-tab-link routerLink="activity" routerLinkActive #rla="routerLinkActive" [active]="rla.isActive">
    Activity
  </a>
</nav>
<mat-tab-nav-panel #tabPanel>
  <router-outlet />
</mat-tab-nav-panel>
```

## Common pitfalls

1. **`mat-sidenav` without `mat-sidenav-container`** , doesn't render correctly. Always wrap.
2. **`mat-sidenav-content` missing** , the main content goes wherever it likes, breaking the push behaviour. Wrap router-outlet in `<mat-sidenav-content>`.
3. **Menu items with custom buttons** , Material expects `button mat-menu-item`. Using a `<div>` or `<a>` breaks keyboard navigation. For routing, use `<a mat-menu-item routerLink="...">`.
4. **Toolbar inside a scrolling container** , doesn't stick. Use `position: sticky` on the toolbar or wrap the whole shell in CDK's `ScrollDispatcher` for shadow-on-scroll effects.
5. **Sidenav `opened` two-way binding** , use `(openedChange)="..."` to react to user toggles, not just `[opened]="..."`. Otherwise dismissing via backdrop click doesn't propagate.
