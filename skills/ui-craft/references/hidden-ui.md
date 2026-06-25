# UI is what you can't see

For every visible pixel in a polished app, there's invisible UI that makes it actually function. The empty state. The error state. The loading skeleton. The hover affordance. The tooltip on the icon-only button. The toast on save. The right-click menu. The keyboard shortcut.

A useful exercise: take a screenshot of your app and try to *list every interaction the UI implies but doesn't show*. If the list is short, the app is unfinished.

## The non-negotiables

For any async surface, the user must be able to encounter and recover from all three of these states:

1. **Loading**, A skeleton (not a spinner alone for table-shaped content; spinners are for button-shaped content). Skeletons mirror the eventual layout so the transition isn't jarring.
2. **Empty**, A placeholder explaining *why* it's empty and *what to do next*. "No pull requests in your inbox. When someone requests your review, they'll show up here."
3. **Error**, A clear message and a way out. "Couldn't load PRs. Retry?" Not a stack trace. Not a generic "Something went wrong."

If you ship a list without all three, you haven't shipped the list. You shipped the happy path.

## The icon-only button rule

Every icon-only button needs `aria-label` (for screen readers) and a tooltip (for everyone else). Without both, the user has to hover-and-guess.

```html
<!-- Wrong -->
<button hlmBtn variant="ghost" size="icon">
  <ng-icon name="lucideTrash2" size="14" />
</button>

<!-- Right -->
<button hlmBtn variant="ghost" size="icon"
        aria-label="Delete pull request"
        [hlmTooltipTrigger]="'Delete pull request'">
  <ng-icon name="lucideTrash2" size="14" />
</button>
```

Tooltip placement defaults work for top-toolbar buttons. For buttons that sit inside lists or tables, prefer `placement="left"` so the tooltip doesn't cover the row's content.

## Hover affordances

Anything clickable must look clickable on hover, even if it doesn't say "click me" at rest.

- **Rows in a list/table**: `hover:bg-muted/40` (subtle background tint)
- **Links inside text**: `hover:underline` or `hover:text-foreground`
- **Buttons**: the library already handles this; don't override
- **Hidden actions**: see [progressive-disclosure.md](progressive-disclosure.md) for the group-hover pattern
- **Avatars used as triggers**: a subtle `ring-2 ring-transparent hover:ring-border` so the user knows they can click

Don't use `cursor: pointer` to compensate for a missing visual hover state. The cursor change is the *last* hint, not the first.

## Focus rings

Focus rings are non-negotiable for keyboard users. The library defaults usually ship correctly, but custom controls often forget.

- Use `:focus-visible`, not `:focus`. The former excludes mouse-click focus and only shows the ring on tab.
- Default ring: `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`
- Inside dark themes, ensure ring contrast is above 3:1 against the background
- Never `outline: none` without a replacement

## Toast feedback for every quiet action

Any action that "completes" without changing the URL should fire a toast. This is hidden UI made visible at the moment it's needed.

- "Comment posted"
- "Link copied"
- "Branch switched to feat/x"
- "Theme switched to dark"
- "Undo" toasts for destructive actions (5-second timeout)

All four libraries have a toast / sonner primitive. Use the library's recommended placement (usually bottom-right for non-blocking, top-center for system-wide).

```ts
// Spartan + ngx-sonner
import { toast } from 'ngx-sonner';
toast.success('Link copied');

// PrimeNG
this.messageService.add({ severity: 'success', summary: 'Saved' });

// NG-ZORRO
this.message.success('Link copied');

// Material
this.snackBar.open('Link copied', undefined, { duration: 3000 });
```

## Keyboard shortcuts and the palette

Power users escape the mouse. Provide:

1. **A command palette** (`cmd+k` / `ctrl+k`) listing every navigable route and every recurring action
2. **Single-key shortcuts** for the most-used routes (`g i` for inbox, `g p` for pull requests, `?` for help)
3. **A `kbd` hint** next to relevant buttons so the shortcut is discoverable. `<kbd class="font-mono text-[10px]">⌘K</kbd>`
4. **A keyboard shortcuts page** in settings listing every shortcut

The palette doubles as a discovery surface: searching "approve" should find the approve action even on pages where it isn't visible.

## Right-click menus

For any list or table row, ask: "Are there 3+ secondary actions a power user wants?" If yes, add a context menu. This is hidden UI that experienced users find on their own.

```ts
// Spartan
<li hlmContextMenuTrigger [hlmContextMenu]="rowMenu" ...>
  ...
</li>
<ng-template #rowMenu>
  <div hlmContextMenu>
    <button hlmContextMenuItem (click)="copyLink(row)">Copy link</button>
    <button hlmContextMenuItem (click)="markRead(row)">Mark as read</button>
    <div hlmContextMenuSeparator></div>
    <button hlmContextMenuItem (click)="hide(row)">Hide</button>
  </div>
</ng-template>
```

## Empty states that earn their keep

A polished empty state has four parts:

1. **An illustration or icon** (subtle, monochrome, large)
2. **A title** in the present tense ("No reviews yet")
3. **A subtitle** explaining the *why* and the *next step* ("When someone requests your review, they'll show up here")
4. **A primary action** if the user can do something to escape the empty state ("Create a draft PR")

```html
<div class="flex flex-col items-center justify-center py-16 px-6 text-center max-w-sm mx-auto">
  <span class="mb-4 size-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
    <ng-icon name="lucideInbox" size="24" />
  </span>
  <h3 class="text-base font-semibold tracking-tight">No pull requests</h3>
  <p class="mt-1 text-sm text-muted-foreground">
    When someone requests your review, they'll show up here.
  </p>
  <button hlmBtn size="sm" class="mt-4 gap-2">
    <ng-icon name="lucideGitPullRequestArrow" size="14" />
    Open a draft PR
  </button>
</div>
```

## Loading skeletons

A skeleton must mirror the eventual layout. A spinner doesn't give the user a sense of the upcoming shape and feels slower.

Rules:
- Use the library's `Skeleton` primitive
- Match the size and shape of the eventual content (a `size-8 rounded-full` for an avatar slot, a `h-4 w-3/4` for a title line)
- Stagger the rows slightly (`animate-pulse [animation-delay:.1s]`) so the surface feels alive
- Show the skeleton after 200ms of waiting (anything sooner flashes for fast loads)

## Notifications and announcements

For a feature you just shipped, surface it once via a banner or sheet. Don't rely on users finding it. Use a dismissible state stored in localStorage.

```html
@if (!dismissedAnnounce) {
  <div class="border-b border-border bg-muted/40 px-4 py-2 flex items-center gap-3 text-sm">
    <ng-icon name="lucideSparkles" size="14" class="text-amber-500" />
    <span class="flex-1">New: Command palette is live, press <kbd>⌘K</kbd> to try it</span>
    <button hlmBtn variant="ghost" size="icon" (click)="dismiss()" aria-label="Dismiss">
      <ng-icon name="lucideX" size="13" />
    </button>
  </div>
}
```

## Cross-reference

- [progressive-disclosure.md](progressive-disclosure.md), when to hide and how to hint
- [data-driven-ui.md](data-driven-ui.md), empty states for data-shaped lists
- [finishing.md](finishing.md), empty state illustrations and decorated backgrounds
