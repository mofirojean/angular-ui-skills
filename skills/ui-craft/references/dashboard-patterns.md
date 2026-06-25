# Dashboard patterns

Concrete recipes for the patterns that come up over and over in dashboards. Each pattern is library-agnostic; for library-specific component picks see [library-bridge.md](library-bridge.md).

## KPI cards

The "headline number" card. Variants run from minimal (label + value) to rich (label + value + delta + sparkline).

```html
<article class="rounded-lg border border-border bg-card p-5">
  <div class="flex items-start justify-between">
    <p class="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
      Open pull requests
    </p>
    <span class="inline-flex items-center gap-1 text-[10.5px] font-mono px-1.5 py-0.5 rounded-full
                 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
      <ng-icon name="lucideArrowUp" size="10" />
      +12.4%
    </span>
  </div>
  <p class="mt-3 text-3xl font-semibold tabular-nums tracking-tight">142</p>
  <p class="mt-1 text-xs text-muted-foreground">vs 126 last week</p>

  <!-- Optional sparkline -->
  <div class="mt-4 h-8">
    <!-- chart -->
  </div>
</article>
```

Rules:
- Label is small, muted, uppercase. The value is what matters.
- Delta gets its own colored chip. Always include direction icon + percentage + period.
- Sparkline is optional but high-ROI when the data has a time dimension.
- KPI cards live in a row of 3-4. On smaller screens, stack via grid `auto-fit`.

## Table polish

A polished table has all of these moving parts. Most beginner tables have *none*.

```html
<div class="rounded-lg border border-border overflow-hidden">
  <!-- Sticky header -->
  <div class="sticky top-0 z-10 bg-muted/40 border-b border-border grid items-center gap-3 px-4 py-2.5
              text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground"
       style="grid-template-columns: 32px minmax(0, 1fr) 120px 96px 88px">
    <span></span>
    <span>Title</span>
    <span>Author</span>
    <span class="text-right">Diff</span>
    <span class="text-right">Updated</span>
  </div>

  <!-- Rows -->
  <ul class="divide-y divide-border">
    @for (row of rows; track row.id) {
      <li class="group grid items-center gap-3 px-4 py-2.5 hover:bg-muted/40 transition-colors"
          [class.opacity-60]="row.archived"
          style="grid-template-columns: 32px minmax(0, 1fr) 120px 96px 88px">
        <input type="checkbox" class="size-3.5 accent-foreground" />
        <div class="min-w-0">
          <div class="flex items-center gap-2">
            <span class="text-[10.5px] font-mono px-1.5 py-0.5 rounded" [ngClass]="toneFor(row.status)">
              {{ row.status }}
            </span>
            <span class="text-sm font-medium truncate group-hover:text-primary">{{ row.title }}</span>
          </div>
          <p class="text-xs text-muted-foreground truncate">{{ row.repo }} · {{ row.branch }}</p>
        </div>
        <span class="text-sm">{{ row.author }}</span>
        <span class="text-right text-xs font-mono">
          <span class="text-emerald-600 dark:text-emerald-400">+{{ row.added }}</span>
          <span class="text-red-600 dark:text-red-400 ml-1">-{{ row.removed }}</span>
        </span>
        <span class="text-right text-xs text-muted-foreground tabular-nums">{{ row.updatedAgo }}</span>

        <!-- Hover-revealed actions -->
        <div class="absolute right-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
          <!-- (positioned absolute within row, requires the row to be `relative`) -->
        </div>
      </li>
    }
  </ul>
</div>
```

The eight things this table does right:

1. **Status chips** in a tone derived from the value, not raw text
2. **Truncation** with `min-w-0` and `truncate` on the long column
3. **Numeric right-alignment** with `tabular-nums`
4. **Muted secondary text** for repo/branch
5. **Inactive row tint** via `opacity-60`
6. **Sticky header** with `sticky top-0`
7. **Hover actions** revealed via `group-hover`
8. **Compact density**: `py-2.5`, `text-sm`, `gap-3`. Not airy.

## Filter bar

A filter bar gets the user from "show me everything" to "show me what I want" in one row.

```html
<div class="border-b border-border bg-background/95 backdrop-blur sticky top-0 z-10 px-4 py-2 flex items-center gap-2 flex-wrap">
  <!-- Status toggle group -->
  <div class="inline-flex items-center rounded-md border border-border bg-card p-0.5">
    @for (s of statuses; track s.key) {
      <button (click)="setStatus(s.key)"
              class="px-2.5 py-1 text-xs rounded transition-colors"
              [class.bg-muted]="status() === s.key"
              [class.text-foreground]="status() === s.key"
              [class.text-muted-foreground]="status() !== s.key">
        {{ s.label }}
        <span class="ml-1 text-[10px] tabular-nums">{{ s.count }}</span>
      </button>
    }
  </div>

  <!-- Combobox filters -->
  <button hlmBtn variant="outline" size="sm" class="gap-2">
    <ng-icon name="lucideFolderGit2" size="12" />
    Repo
    <ng-icon name="lucideChevronDown" size="11" class="opacity-60" />
  </button>
  <button hlmBtn variant="outline" size="sm" class="gap-2">
    <ng-icon name="lucideCircleUserRound" size="12" />
    Author
    <ng-icon name="lucideChevronDown" size="11" class="opacity-60" />
  </button>

  <!-- Date range -->
  <button hlmBtn variant="outline" size="sm" class="gap-2">
    <ng-icon name="lucideCalendar" size="12" />
    Last 7 days
  </button>

  <div class="flex-1"></div>

  <!-- Search -->
  <div class="relative">
    <ng-icon name="lucideSearch" size="12" class="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
    <input type="text" placeholder="Search..."
           class="pl-7 pr-2 py-1 text-xs bg-background border border-border rounded-md w-56 focus:outline-none focus:ring-1 focus:ring-ring" />
  </div>

  <!-- Save as view -->
  <button hlmBtn variant="ghost" size="sm" class="gap-1.5">
    <ng-icon name="lucideBookmark" size="12" />
    Save view
  </button>
</div>
```

Pattern notes:

- Status filter is a **toggle group** with counts (not a dropdown). Counts are critical: they tell the user how many results sit behind each filter.
- Categorical filters (Repo, Author) are **combobox triggers** that open a popover with multi-select. Each shows the current value in the trigger label.
- Date filter is a **fixed range chooser** with presets (Last 7/30/90 days, Custom).
- Search is the **last** input on the right, with a small width. Don't make it a hero element.
- "Save view" lets power users persist filter combinations. Reach for it on lists used daily.

## Sidebar nav density

Sidebars stack vertically and benefit from compact rows.

```html
<aside class="w-60 border-r border-border bg-muted/20 p-2 flex flex-col gap-0.5">
  <a routerLink="/inbox"
     class="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors"
     routerLinkActive="bg-muted/60 text-foreground font-medium">
    <ng-icon name="lucideInbox" size="14" />
    <span class="flex-1">Inbox</span>
    <span class="text-[10px] tabular-nums text-muted-foreground">12</span>
  </a>
  <!-- more items -->

  <div class="my-2 h-px bg-border/60"></div>

  <p class="px-3 py-1 text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground">
    Pinned
  </p>
  <!-- pinned items at the same density -->
</aside>
```

- `w-60` (240px) is the safe default. `w-56` for compact, `w-64` for roomy.
- `py-1.5` per item is compact, `py-2` standard, `py-2.5` roomy.
- Icons at `size-3.5` or `size-4`. Larger icons make the sidebar feel chunky.
- Badges (counts, status dots) on the right edge, muted.
- Section labels are uppercase, muted, smaller text. Visually quiet.

## Detail page right rail

For PR / issue / record detail surfaces, a right rail with metadata is the GitHub/GitLab pattern:

```html
<div class="max-w-6xl mx-auto grid gap-8 grid-cols-1 lg:grid-cols-[minmax(0,1fr)_240px]">
  <div class="min-w-0">
    <!-- main content -->
  </div>
  <aside class="text-sm">
    <section class="py-3 border-b border-border">
      <header class="flex items-center justify-between mb-2">
        <span class="text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground">
          Assignee
        </span>
        <button class="size-5 inline-flex items-center justify-center rounded text-muted-foreground hover:bg-muted">
          <ng-icon name="lucideSettings" size="11" />
        </button>
      </header>
      <div class="flex items-center gap-2">
        <hlm-avatar class="size-6">...</hlm-avatar>
        <span class="text-xs font-medium">Sasha Lin</span>
      </div>
    </section>

    <section class="py-3 border-b border-border"><!-- Reviewers --></section>
    <section class="py-3 border-b border-border"><!-- Labels --></section>
    <section class="py-3 border-b border-border"><!-- Milestone --></section>
    <section class="py-3"><!-- Participants --></section>
  </aside>
</div>
```

Rail sections share a layout:
- Small uppercase muted header on the top
- Optional edit gear on the right
- Content below

## Command palette

The `cmd+k` palette is the discoverability layer of any non-trivial dashboard. Spartan ships `HlmCommandDialog`; PrimeNG has `<p-autocomplete>` you can wrap; NG-ZORRO has `nz-cdk-overlay` + `nz-autocomplete`; Material has `MatDialog` + `MatAutocomplete`.

Minimum content:
- **Navigation** group: every named route
- **Actions** group: theme toggle, sign out, settings shortcuts
- Optional: **Search results** group (live-filtered as the user types)

Bind `cmd+k` / `ctrl+k` globally:

```ts
host: { '(window:keydown)': 'onGlobalKey($event)' }

onGlobalKey(event: KeyboardEvent): void {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault();
    this.palette.toggle();
  }
}
```

## Dashboard skeleton (loading)

For each KPI / table / chart, show a skeleton mirroring the eventual layout:

```html
<div class="rounded-lg border border-border p-5 animate-pulse">
  <div class="h-3 w-24 rounded bg-muted"></div>
  <div class="mt-3 h-8 w-20 rounded bg-muted"></div>
  <div class="mt-2 h-3 w-32 rounded bg-muted/60"></div>
</div>
```

Stagger the animation delay across siblings so the page feels alive:

```html
@for (i of [0,1,2,3]; track i) {
  <div class="animate-pulse" [style.animation-delay.ms]="i * 100">
    ...
  </div>
}
```

## Cross-reference

- [data-driven-ui.md](data-driven-ui.md), making the table reflect the data
- [progressive-disclosure.md](progressive-disclosure.md), hidden row actions
- [library-bridge.md](library-bridge.md), library-specific component picks
