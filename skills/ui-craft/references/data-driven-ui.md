# Data drives the UI

The single biggest tell of a generic dashboard is that the UI was built first, then the data was poured into it. Good interfaces invert that. The *shape, density, alignment, color, and component choice* all come from inspecting the data being displayed.

## The diagnostic question

Before you render any table, list, or chart, ask: **what are the variables in this row, and what does each variable's type imply?**

| Data shape | UI consequence |
|---|---|
| Enumerated values (status, department, role) with ≤10 possibilities | Chip / Badge, not free text. Each value gets a stable color tone. |
| Numbers used for comparison (counts, revenue, %, diff) | `tabular-nums`, right-aligned, monospaced if precision matters. |
| Numbers with units (currency, MB, ms) | Pair with a smaller, muted unit (`12.4`<small>`ms`</small>). |
| Long text (titles, paths, descriptions) | Truncate with `truncate` + `[title]="value"` tooltip, give the column `min-w-0`. |
| Time-bound rows (events, logs, commits) | Strong consider: this should be a timeline, not a table. |
| Boolean state with clear winner (active / inactive, on / off) | Active rows full color, inactive rows muted (`opacity-60` or `text-muted-foreground`). Never the same weight. |
| Identity (people, repos, projects) | Avatar / icon + name, never a raw id column. |
| URL or external link | Underline on hover, external icon if leaving app. |

## Anti-pattern: the all-grey table

The fastest way to spot a beginner dashboard is a table where every cell is the same color, same weight, same alignment, same size. The data has shape; the UI should reflect that shape.

**Before:**
```html
<table>
  <tr>
    <td>Sasha Lin</td>
    <td>Engineering</td>
    <td>Active</td>
    <td>3</td>
    <td>2026-06-15</td>
  </tr>
</table>
```

**After:**
```html
<tr [class.opacity-60]="!row.active">
  <td>
    <div class="flex items-center gap-2">
      <hlm-avatar class="size-6">...</hlm-avatar>
      <span class="font-medium">{{ row.name }}</span>
    </div>
  </td>
  <td>
    <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs"
          [ngClass]="departmentTone(row.department)">
      {{ row.department }}
    </span>
  </td>
  <td>
    <span class="inline-flex items-center gap-1 text-xs">
      <span class="size-1.5 rounded-full"
            [class.bg-emerald-500]="row.active"
            [class.bg-zinc-400]="!row.active"></span>
      {{ row.active ? 'Active' : 'Inactive' }}
    </span>
  </td>
  <td class="text-right tabular-nums font-mono">{{ row.openPrs }}</td>
  <td class="text-muted-foreground text-xs">{{ row.lastSeen | timeAgo }}</td>
</tr>
```

What changed:
- Identity column got an avatar (eye locks faster on a face than a name)
- Enumerated value (department) became a chip with a tone derived from the value
- Status got a colored dot + label (color is a hint, label is the truth)
- Numeric column is right-aligned with `tabular-nums` so digits align by place value
- Date became a relative time, muted, smaller (it's metadata, not the answer)
- Inactive rows get `opacity-60` so the active set leads the eye

## When the data is time-bound, use a timeline

If the rows of your "table" all have a timestamp and that timestamp is the primary axis of meaning, **stop**. A table with a sort-by-time column is the wrong format. Use a timeline.

A timeline:
- Renders a vertical connector line and anchors each event to it
- Mixes content shapes per row (a comment is a card; "user pushed 3 commits" is a one-line event)
- Lets the reader skim the *kinds* of events, not just their timestamps

Forge's PR detail conversation tab is a real example. So is the GitHub PR timeline. Read the example app `examples/forge/src/app/pages/pr-detail/` for the pattern in code.

## When the data has a meaningful x-axis, add a chart

The moment your table has a numeric column varying over time, ask: would a chart show this *instantly* instead of forcing the reader to scan 30 rows?

- Activity over the last 30 days → line chart
- Distribution across categories → bar chart (horizontal if the labels are long)
- Part-of-whole → stacked bar; reach for donut/pie only if the segments are < 5
- A single KPI with a trend → big number + 30-day sparkline beside it

Always pair the chart with the table, don't replace one with the other. The chart is for "what's happening", the table is for "show me the details".

## Color comes from the data, not the palette

A red status icon on a "build failed" row is doing real work. The red draws the eye to the urgent thing. But a red chip on a "design" label is decoration, color-as-vibe. The reader can't tell what red means anymore.

Rule: **a color in a dashboard should be a signal a user can decode.** If you can't write a one-sentence legend for a color, drop it to a neutral.

The five universal data colors:
- `emerald` / green = healthy, success, passing, added
- `red` / rose = error, failed, removed, urgent
- `amber` / yellow = pending, warning, in-progress, waiting
- `sky` / blue = informational, links, draft
- `zinc` / neutral = inactive, skipped, default

Tones should be reproducible in dark mode by swapping shade and adding ring/border instead of background:

```css
/* light */
.tone-success { @apply bg-emerald-100 text-emerald-700 ring-1 ring-emerald-500/30; }
/* dark */
.dark .tone-success { @apply bg-emerald-950 text-emerald-300 ring-emerald-500/30; }
```

## Density follows the data

A dashboard for a senior reviewer who looks at it every hour needs to be denser than a marketing-page dashboard glanced at once a week. Density is a setting, not a default. Lean compact, then loosen if the user complains.

- `text-xs` (12px) for row content, `text-[11px]` for metadata, `text-sm` (14px) only for emphasized rows
- `py-2` for table rows in normal density, `py-1.5` for compact, `py-3` only when rows have rich content (avatar + multiple lines)
- Tab triggers, filter chips, secondary buttons all get `size="sm"` from the library
- Reserve `size="md"` for primary actions (Save, Approve, Submit)

## Cross-reference

- [progressive-disclosure.md](progressive-disclosure.md), moving controls behind hover and popover
- [hierarchy.md](hierarchy.md), weight + size + color as the three hierarchy levers
- [dashboard-patterns.md](dashboard-patterns.md), concrete recipes for KPI cards, filter bars, etc.
- [color.md](color.md), building a tone system from the ground up
