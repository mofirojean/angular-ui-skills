# Progressive disclosure

Most controls and metadata don't belong permanently on screen. They belong tucked behind hover, popover, sheet, or context menu, with a clear affordance hinting they exist. The skill is deciding *what stays visible* and *what hides* and *how visible the hint is*.

## The spectrum of explicitness

Every action in a UI sits somewhere on this spectrum:

| Level | Visibility | Example |
|---|---|---|
| **Always-visible global** | Permanent in the chrome | "New PR" button in the page header |
| **Always-visible per row** | Persistent in the row | The row title, the status chip |
| **Hover-revealed per row** | Appears on row hover with a hint | "+ Add comment" icon on a diff line |
| **Click-to-reveal** | Behind a chevron, kebab menu, or popover trigger | "Edit reviewers" gear in a metadata rail |
| **Right-click-revealed** | Context menu only | "Copy as curl", "Open in new tab" |
| **Keyboard shortcut only** | No on-screen affordance, documented in /help | `g i` to jump to inbox, `cmd+k` to open palette |

Each level is *louder* than the next. A beginner UI puts every action at "always-visible global" because that's the path of least design effort. A polished UI grades down: primary actions stay loud, secondary actions hover-reveal, power-user actions move to right-click or keyboard.

## How to grade an action down

Ask three questions:

1. **How often does the user need this?** Once per page = always-visible. Once per row, occasionally = hover. Once per session, advanced = right-click.
2. **Is it destructive or final?** Destructive actions (delete, force-push, drop database) should *never* be hover-only. Add a confirmation step. But they can be tucked into a kebab menu.
3. **Would a missing affordance leave the user stuck?** If the answer is yes, you need at least a hint (a small icon, a chevron, a "More" button). Never have hover-only actions with no visible trace.

## Concrete patterns

### Hover-revealed row action

Use the `group` + `group-hover:opacity-100` Tailwind pattern. The action's container fades in with the row. Position the action where the user's eye is already heading.

```html
<li class="group relative grid items-center gap-3 px-4 py-2 hover:bg-muted/40">
  <span>{{ row.title }}</span>
  <span class="text-muted-foreground text-xs">{{ row.ago }}</span>

  <div class="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
    <button hlmBtn variant="ghost" size="icon" class="size-7" aria-label="Copy link">
      <ng-icon name="lucideLink2" size="12" />
    </button>
    <button hlmBtn variant="ghost" size="icon" class="size-7" aria-label="More">
      <ng-icon name="lucideMoreHorizontal" size="12" />
    </button>
  </div>
</li>
```

Three things make this work:

1. `group` on the row so `group-hover` targets actions
2. `opacity-0 ... group-hover:opacity-100` with a transition so the appearance isn't jarring
3. Always-present focus visibility: focus on the hidden button via keyboard should still make it appear. Add `focus-visible:opacity-100` to honour keyboard nav.

```html
class="opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity"
```

### Popover for primary actions of a tucked-away surface

When an action is too important to hide on hover but too rare to deserve a permanent button, use a popover/dropdown.

- Spartan: `[hlmDropdownMenuTrigger]` on a small button
- PrimeNG: `<p-popover>` triggered by a button
- NG-ZORRO: `nz-dropdown`
- Material: `mat-menu`

Always show the trigger with a chevron or kebab so the affordance is visible. Never have an invisible trigger.

### Right-click context menu for power-user actions

When an action exists but only advanced users need it (copy ID, open in new tab, mark as read, hide, snooze), put it in a context menu that's only revealed by right-click. Document the right-click affordance in a tooltip or onboarding tour.

- Spartan: `HlmContextMenu`
- PrimeNG: `<p-contextmenu>` paired with `[pContextMenu]`
- NG-ZORRO: `nz-dropdown` with `nzTrigger="contextmenu"`
- Material: `matContextMenu` (or roll your own with `cdkOverlay`)

### Onboarding is progressive disclosure over time

When a user first lands on your app, don't show them the fully-loaded dashboard with 14 controls. Surface one thing at a time:

1. First load: a single tooltip pointing at the primary action ("Click here to create your first PR")
2. After they do that thing: a second tooltip appears, or a checklist in the corner ticks one item
3. Eventually: full surface, all tooltips dismissable, palette discoverable via `cmd+k`

You're not hiding functionality. You're sequencing it.

## Discoverability hints

For every hover-revealed or hidden action, the user needs a hint it exists. Three light-touch options:

- **A small triangle or dot** on the cell that has a comment (used by Google Sheets)
- **An ellipsis at the row's right edge** that's always visible (subtle but present)
- **A keyboard shortcut chip** next to relevant buttons (`⌘K`, `g i`, `?`), both teaches and discloses

Avoid:
- Onboarding modals that obscure the entire screen and require the user to read 4 paragraphs before they can use the app
- "Click here for more" gradients at the bottom of a list (cargo-culted from mobile, unnecessary on desktop)
- Animations longer than 200ms, they look like the page is broken

## Anti-patterns

- **Buttons inside table rows that don't fade**. The eye is dragged to them on every row. Either hide on hover or move into a kebab menu.
- **Hover-only primary actions**. Approve, Merge, Delete should not require hover-to-find.
- **Hover actions with no transition**. They appear suddenly and feel buggy.
- **Three layers of progressive disclosure**. A "More" menu inside a popover inside a hover-revealed cell. Pick one layer.

## Cross-reference

- [hidden-ui.md](hidden-ui.md), tooltips and empty/loading/error states
- [data-driven-ui.md](data-driven-ui.md), what stays on the screen in the first place
- The four library skills' `overlays.md` for the specific component APIs (popover, sheet, dialog, dropdown)
