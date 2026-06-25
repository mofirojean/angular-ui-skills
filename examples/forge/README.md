# Forge

A reference Angular app built with [Spartan/ng](https://www.spartan.ng) to validate the [`spartan-ng-developer` skill](../../skills/spartan-ng-developer). The app is a fictional code-review console for an Angular monorepo dev team, picked because PR-review workflows exercise the densest part of Spartan's Helm catalog (Sidebar, Dialog, Command, Dropdown, Sheet, Sonner, Tabs, Avatar, Badge) on a single product surface.

**Live demo:** https://forge-opal-eta.vercel.app

> **Status**, in progress. Phase 0 (scaffold) + Phase 1 (shell + routes) shipped. PR queue, PR detail, author profile, and settings are rendered with static mock content for visual completeness. ⌘K command palette is wired and functional. The flagship validation surfaces (TanStack Data Table for the inbox, file tree + diff viewer for the Files tab, threaded inline comments) ship in subsequent phases per [`PLAN.md`](./PLAN.md).

## Stack

- Angular v21, standalone, zoneless change detection (`provideZonelessChangeDetection`)
- `@spartan-ng/cli@1.0.1` + `@spartan-ng/brain@1.0.1`, Spartan went stable in June 2026
- Tailwind v4 with the explicit layer-import pattern Spartan requires (`theme, base, components, utilities`)
- `@angular/cdk@21` (overlay, menu, drag-drop primitives Spartan composes underneath)
- `@ng-icons/core` + `@ng-icons/lucide` for the icon system
- `ngx-sonner` for the toast layer
- Reactive Forms (Signal Forms moves in when Angular v22 ships stable)
- Mock data only, no backend

## What's inside

| Route | Surfaces |
|---|---|
| `/` Inbox | Filter pill bar, PR list with status pills, label chips, author meta, reviewer avatar stack, diff size, relative timestamps. Static rows for visual completeness |
| `/pr/:id` PR detail | Breadcrumb + status pill + branch direction + reviewer avatar stack + Comment / Approve / More actions. Tab strip (Conversation / Files / Commits / Checks). Conversation tab populated with a mixed timeline (PR description card, comments, "pushed 3 commits" event, review-approved card) and a Markdown-hint composer at the bottom |
| `/author/:handle` | Large rounded-circle avatar + identity + bio. 4 metric cards (Open PRs / Reviewed / Merged / Comments). Activity tabs with a recent-activity list (Reviewed / Pushed to / Opened / Commented on / Merged) |
| `/settings` | Page-level secondary sidebar with 5 sections (Profile / Notifications / Keyboard / Display / Integrations). Active Profile section: name, handle (with `forge.dev/` prefix), bio textarea, timezone select, Discard / Save buttons |
| Global | ⌘K (or Ctrl+K) command palette via `hlm-command-dialog`, Navigation group (Inbox / PR / Author / Settings) + Actions group (Toggle theme with snackbar confirmation / Sign out mock). Light + dark theme toggle in the header. Sidebar with Reviews + Workspace nav groups, Pinned-repositories static block with CI-status dots, user dropdown with profile / settings / sign out menu |

## Theming

Spartan ships the Neutral palette by default; Forge runs with that base + the standard `:root` / `:root.dark` CSS-variable block from the skill's [`theming.md`](../../skills/spartan-ng-developer/references/theming.md). Toggle via the header sun/moon icon (persists in `localStorage`) or via the ⌘K palette "Toggle theme" command (fires a Sonner toast confirming the new mode).

The sidebar uses the dedicated `--sidebar-*` token family so it can carry a distinct background tint from the main content area without re-themeing everything.

## Spartan gotchas worth surfacing

These all came out of the Phase 0 + Phase 1 build and are folded into the skill's reference docs:

- **`@angular/cdk@22` peer-dep on Angular 21**, `npm install @angular/cdk` defaults to the latest major and breaks the install with `ERESOLVE`. Pin to `@angular/cdk@^21` (or whatever matches your Angular major). Spartan's brain accepts `>=21 <23`.
- **`init` and `ui-theme` schematics are interactive**, the prompts live inside the generator code via `enquirer` and ignore `--defaults`. From CI or any non-TTY environment, follow the "Non-interactive install" path in [`setup.md`](../../skills/spartan-ng-developer/references/setup.md) (install deps manually, write `styles.css`, write `components.json`, then the per-component `ng g @spartan-ng/cli:ui <name>` flow works).
- **Transitive Helm dependencies**, generating `command` pulls `input-group`; `field` pulls `separator`; `sidebar` pulls `skeleton` and `tooltip`. The generator handles this automatically (you'll see extra `CREATE` lines), but the build fails if you import a component you haven't generated yet. For first-batch installs, the interactive picker (`ng g @spartan-ng/cli:ui` with no name) is faster than generating one at a time.
- **`sonner` needs `ngx-sonner` as a separate `npm install`**, the schematic writes the Helm wrapper but doesn't install the underlying npm package. `npm install ngx-sonner` after generating the `sonner` Helm.
- **Strict-semantic Helm selectors**, `ul[hlmSidebarMenu]`, `li[hlmSidebarMenuItem]`, `div[hlmSidebarGroupContent]`, `main[hlmSidebarInset]`. Wrong element = `NG8001`.
- **Some Helm components are directive-only**, `<hlm-sidebar-rail />` doesn't exist; the form is `<button hlmSidebarRail></button>`. Same for `hlmSidebarTrigger`, `hlmDropdownMenuTrigger`. Check `selector:` in the generated source when in doubt.
- **Sidebar collapse-mode**, the host gets `class="group"` + `data-collapsible="icon"` only when actually collapsed. Use `group-data-[collapsible=icon]:hidden` on text wrappers and `group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0` on icon containers to keep the icon strip clean.
- **`hlmSidebarMenuButton` auto-applies `size-8! p-2!`** in collapsed mode, which clips children larger than 16px. Override with `group-data-[collapsible=icon]:p-0! group-data-[collapsible=icon]:justify-center` (the `!` is required, without it the override loses to the directive's `p-2!`).
- **`hlm-avatar` requires `hlmAvatarFallback` directive on initials children**, a plain `<span>` doesn't get the centering CSS. Add the directive.
- **Use `host: {}` metadata, not `@HostListener` / `@HostBinding`**, the decorator form gets no compile-time type check on the event/binding name. Forge wires the global ⌘K shortcut via the `host` config in `app.ts`.

All folded into [`setup.md`](../../skills/spartan-ng-developer/references/setup.md), [`helm-conventions.md`](../../skills/spartan-ng-developer/references/helm-conventions.md), [`layout.md`](../../skills/spartan-ng-developer/references/layout.md), and [`display.md`](../../skills/spartan-ng-developer/references/display.md).

## Run it

```bash
cd examples/forge
npm install
npm start
```

Then open `http://localhost:4200/`. Try `Ctrl+K` (or `⌘K` on macOS) to open the command palette.

## Build

```bash
npm run build
```

Outputs to `dist/forge/browser/`. Configured for the Vercel `angular` framework preset, see `vercel.json`.

## Component coverage

The first wave of Helm components generated in Phase 0:

```
avatar  badge  button  card  command  dialog  dropdown-menu
field   input  input-group  label  separator  sheet  sidebar
skeleton  sonner  table  tabs  tooltip  utils
```

Coverage table mapping each component to where it's used in the app lives in [`PLAN.md`](./PLAN.md#component-coverage-used-vs-documented). Anything documented in the skill but unused after the remaining phases ship will be flagged as a skill-trim candidate.
