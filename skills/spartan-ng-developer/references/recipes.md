# Recipes

Cookbook patterns that compound multiple Helm components into a purpose-built surface. None of these are shipped Helm components, the recipe is the contribution.

Recipes live here when:
- The surface isn't one component, it's an assembly of several
- Multiple consumers will want the same shape
- The pattern has subtle gotchas worth documenting once

---

## Diff viewer

A code-diff display with syntax highlighting, per-line gutter strip, hunk separators, file tree, and inline line-comment composer. Used in code-review tooling.

**Reference implementation**: `examples/forge/src/app/pages/pr-detail/`, files-tab branch.

### Architecture

```
┌─ File tree (left, 288px)              ┬─ Diff viewer (right, 1fr) ──┐
│ src/                                  │ File header (sticky)         │
│   runtime/                            │   path breadcrumb · lang     │
│     scheduler.ts        M  +24 -14    │   +24 / −14 · viewed · ⋯     │
│     lock-manager.ts     A  +31  -0    │ ────────────────────────────│
│   config/                             │ Hunk header: Lines 38–55     │
│   docs/                               │ │                            │
│ package.json            M   +2  -6    │ │ 38  38  [code with tokens] │
└───────────────────────────────────────┴─┴────────────────────────────┘
```

Five orthogonal concerns:

1. **Syntax highlighting** — a small TS tokenizer + token-to-class mapping
2. **Per-line gutter strip** — colored 4px column instead of inline `+`/`-` prefix
3. **Hunk header parsing** — `@@ -38,12 +38,18 @@` → `Lines 38–55` + context
4. **File tree** — flat path list → folder/file tree → flat visible list with depth
5. **Inline comment composer** — hover icon per line → drop-down composer below

### 1. Tokenizer (no dependency)

Don't pull in Shiki or Prism for a static demo. A ~150 LOC TS-only tokenizer is enough. The token kinds:

```ts
type TokenKind =
  | 'plain' | 'keyword' | 'string' | 'comment'
  | 'type'  | 'fn'      | 'num'    | 'op' | 'punct';
```

A keyword set + a types set + a heuristic ("identifier followed by `(` is a function call unless it's `if`/`for`/`return`") covers most real TS lines. PascalCase identifiers default to type. Numbers, strings (with backslash escape handling), and line-comments cover the rest.

Map each kind to a Tailwind class once:

```ts
function tokenClass(t: TokenKind): string {
  switch (t) {
    case 'keyword': return 'text-violet-600 dark:text-violet-300';
    case 'string':  return 'text-emerald-600 dark:text-emerald-300';
    case 'comment': return 'text-zinc-500 italic';
    case 'type':    return 'text-amber-600 dark:text-amber-400';
    case 'fn':      return 'text-sky-600 dark:text-sky-300';
    case 'num':     return 'text-rose-500 dark:text-rose-400';
    case 'op':
    case 'punct':   return 'text-zinc-500 dark:text-zinc-400';
    default:        return '';
  }
}
```

For non-TS languages, fall back to a simpler tokenizer or plain text. JSON gets keywords for `true`/`false`/`null`, strings, numbers, punct.

### 2. Pre-compute innerHTML, don't loop spans in the template

The naive shape would be:

```html
<div class="whitespace-pre">
  @for (tok of line.tokens; track $index) {
    <span [ngClass]="tokenClass(tok.t)">{{ tok.v }}</span>
  }
</div>
```

This **breaks indentation**. The `whitespace-pre` parent picks up the newlines and indentation Angular's `@for` block emits between sibling elements, treating them as visible whitespace.

The fix: pre-build a sanitized HTML string per line and bind via `[innerHTML]`:

```ts
import { DomSanitizer, type SafeHtml } from '@angular/platform-browser';

private buildLineHtml(tokens: readonly Token[]): SafeHtml {
  let firstSeen = false;
  const parts = tokens.map(tok => {
    let text = escapeHtml(tok.v);
    const isLeading = !firstSeen && tok.t === 'plain' && /^[ \t]+$/.test(tok.v);
    firstSeen = true;
    // NBSP for leading whitespace, bulletproofs indentation against any
    // browser or framework whitespace normalization
    if (isLeading) {
      text = text.replace(/ /g, '&nbsp;').replace(/\t/g, '&nbsp;&nbsp;');
    }
    if (tok.t === 'plain') return text;
    return `<span class="${tokenClass(tok.t)}">${text}</span>`;
  });
  return this.sanitizer.bypassSecurityTrustHtml(parts.join(''));
}
```

Two important details:

- `escapeHtml` runs on each token's text (escape `&`, `<`, `>`, `"`) before concatenation, so user-controlled diff content can't inject markup
- **Leading whitespace specifically** gets replaced with `&nbsp;`. Inter-word spaces stay as regular spaces so copy-paste still yields clean code, but leading indentation is non-breaking and immune to any whitespace normalization in any browser or DI layer

Pre-compute once per file selection via a `computed` signal:

```ts
protected readonly tokenizedHunks = computed(() => {
  const diff = this.selectedDiff();
  const lang = detectLang(diff.path);
  return diff.hunks.map(hunk => ({
    header: hunk.header,
    lines: hunk.lines.map(line => ({
      kind: line.kind,
      oldNo: line.oldNo,
      newNo: line.newNo,
      html: this.buildLineHtml(tokenize(line.text, lang)),
    })),
  }));
});
```

Then the template is one binding:

```html
<div class="whitespace-pre overflow-x-auto pr-4 pl-3" [innerHTML]="line.html"></div>
```

### 3. Per-line layout via grid + gutter strip

Drop the inline `+`/`-` prefix. Replace with a colored strip column on the left of the code.

```html
<div
  class="group relative grid items-stretch hover:bg-muted/40 transition-colors"
  style="grid-template-columns: 44px 44px 4px minmax(0, 1fr)"
  [class.bg-emerald-500/[0.07]]="line.kind === 'add'"
  [class.bg-red-500/[0.07]]="line.kind === 'del'"
>
  <span class="text-right pr-2 text-[10.5px] text-muted-foreground/60 select-none tabular-nums">
    {{ line.oldNo }}
  </span>
  <span class="text-right pr-2 text-[10.5px] text-muted-foreground/60 select-none tabular-nums">
    {{ line.newNo }}
  </span>
  <span aria-hidden="true"
        [class.bg-emerald-500]="line.kind === 'add'"
        [class.bg-red-500]="line.kind === 'del'"></span>
  <div class="whitespace-pre overflow-x-auto pr-4 pl-3 py-0.5" [innerHTML]="line.html"></div>
</div>
```

Background tint at `/[0.07]` opacity. Gutter strip at full color. The combination reads as "this line is added/removed" without the inline prefix that fights the code for attention.

`minmax(0, 1fr)` on the code column is required so the cell can shrink (default `1fr` resolves to `minmax(auto, 1fr)` which won't shrink below content).

### 4. Hunk header parsing

Raw git output looks like `@@ -38,12 +38,18 @@ export class RunScheduler {`. Generic. Parse it:

```ts
protected parseHunk(header: string): { range: string; ctx: string } {
  const m = /@@\s+-(\d+),?(\d*)\s+\+(\d+),?(\d*)\s+@@(.*)/.exec(header);
  if (!m) return { range: header, ctx: '' };
  const newStart = +m[3];
  const newCount = m[4] ? +m[4] : 1;
  return { range: `Lines ${newStart}–${newStart + newCount - 1}`, ctx: m[5].trim() };
}
```

Render as a section divider, not a code-band stripe:

```html
@let parsed = parseHunk(hunk.header);
<div class="flex items-center gap-3 px-4 py-1.5 bg-muted/20 border-y border-border/70">
  <span class="size-1 rounded-full bg-muted-foreground/40 rotate-45"></span>
  <span class="font-mono text-[11px] font-semibold tabular-nums">{{ parsed.range }}</span>
  @if (parsed.ctx) {
    <span class="font-mono text-[11px] text-muted-foreground/80 truncate">{{ parsed.ctx }}</span>
  }
</div>
```

### 5. File tree from flat paths

Flat input: `['src/runtime/scheduler.ts', 'src/runtime/types.ts', 'package.json']`. Build a nested map, then flatten back to a depth-tagged list.

```ts
type TreeMap = Map<string, TreeMap | ChangedFile>;

function buildFileTree(files: readonly ChangedFile[]): TreeNode[] {
  const root: TreeMap = new Map();
  for (const f of files) {
    const parts = f.path.split('/');
    let cursor = root;
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      let next = cursor.get(part);
      if (!(next instanceof Map)) { next = new Map(); cursor.set(part, next); }
      cursor = next;
    }
    cursor.set(parts[parts.length - 1], f);
  }
  const out: TreeNode[] = [];
  walk(root, '', 0, out);
  return out;
}
```

`walk()` sorts folders first within each level, alphabetical, and emits `{ kind, path, name, depth, ... }` entries.

In the template, render flat, indent by `depth`:

```html
@for (node of visibleTree(); track node.path) {
  <li>
    @if (node.kind === 'folder') {
      <button (click)="toggleFolder(node.path)"
              [style.padding-left.rem]="0.5 + node.depth * 0.85">
        <ng-icon [name]="isFolderExpanded(node.path) ? 'lucideChevronDown' : 'lucideChevronRight'" />
        ...
      </button>
    } @else {
      <button (click)="selectedFilePath.set(node.path)"
              [style.padding-left.rem]="0.5 + node.depth * 0.85 + 0.85">
        ...
      </button>
    }
  </li>
}
```

`visibleTree` is a `computed` that filters out nodes whose ancestors are collapsed. A `expandedFolders` `signal<ReadonlySet<string>>` tracks which folders are open.

### 6. Hover-to-comment per line

The diff line is `position: relative` and has the `group` modifier. The "add comment" button is `position: absolute` inside the row, `opacity-0 group-hover:opacity-100`, positioned at `left-[80px]` (just past the line-number gutter).

**Important**: position the button as a sibling of the code column, not a child. If you put it inside the `overflow-x-auto pr-4` code column, its negative-translate offsets cause horizontal scrollbar artifacts on hover.

```html
<button
  type="button"
  (click)="toggleComment(key)"
  class="absolute top-1/2 left-[80px] -translate-y-1/2 size-5 rounded-md bg-primary
         text-primary-foreground shadow-md ring-2 ring-background
         flex items-center justify-center z-20 opacity-0 group-hover:opacity-100
         focus-visible:opacity-100 hover:scale-110 transition-all"
  [class.!opacity-100]="commentingKey() === key"
  aria-label="Add a comment on this line"
>
  <ng-icon name="lucideMessageSquarePlus" size="11" />
</button>
```

When clicked, a composer card renders immediately below the line:

```html
@if (commentingKey() === key) {
  <div class="bg-muted/15 px-4 py-3 border-y border-border/70">
    <div class="ml-[92px] max-w-2xl relative">
      <!-- a small rotated square anchors the composer to the line above -->
      <span aria-hidden="true"
            class="absolute -top-3 left-3 size-3 rotate-45
                   bg-card border-l border-t border-sky-500/40"></span>
      <form class="rounded-lg bg-card border border-border ring-1 ring-sky-500/20 shadow-lg overflow-hidden">
        <!-- composer header, markdown toolbar, textarea, footer -->
      </form>
    </div>
  </div>
}
```

The `ml-[92px]` aligns the composer to the start of the code column (88px gutter + a tiny extra). The rotated square at `-top-3 left-3` visually "points up" to the commented line.

### Gotchas

- **Don't render tokens via `@for` of `<span>`s with `whitespace-pre` on the parent.** Use `[innerHTML]` with a pre-built sanitized string. The block-syntax control flow emits whitespace between siblings that `whitespace-pre` then renders as visible space.
- **Leading whitespace via NBSP, not regular space.** Regular leading whitespace can be normalized away in some contexts. NBSPs are non-breaking and immune.
- **Code column needs `minmax(0, 1fr)`.** `1fr` alone won't shrink below intrinsic content size, breaking the layout when lines are long.
- **`overflow-x-auto` on the code column, not the row.** Long lines scroll per-line, not as a whole-row scrollbar.
- **Place the hover comment button as a row sibling, not a child of the code column.** Otherwise its negative offsets bleed through the column's `overflow-x` and create phantom horizontal scrollbars.
- **The `+`/`-` prefix is decoration, not data.** The colored gutter strip + tinted background carry the signal, and the line numbers carry the position. Inline prefix is redundant and competes with code for attention.

### Cross-reference

- [Forge example app](../../../examples/forge/src/app/pages/pr-detail/) — the working implementation
- [helm-conventions.md](helm-conventions.md) — host metadata, signal inputs
- [data-display.md](data-display.md) — Table directives the file tree builds on
- [ui-craft skill](../../ui-craft/) — the design principles behind the visual choices (gutter strip over inline prefix, language pill, hunk separator)
