# Forge, Build Plan

> **Status:** Plan. Not yet scaffolded. See "Next session: where to start" at the bottom.

A reference Angular application built with the `spartan-ng-developer` skill. The point is not the app, the point is that **building this proves the skill is correct**. Every Helm component the skill documents gets used here; anything that doesn't match docs → fix the skill, then keep going.

## What it is

**Forge**, a code-review console for a fictional Angular monorepo dev team. Browse a queue of open pull requests, drill into a PR to see the diff, file tree, and conversation, leave threaded inline comments, approve / request changes / merge. GitHub Pull Requests + Linear + Reviewable.io aesthetic, but a polished Angular alternative instead of yet-another-React one.

The narrative fits the project's audience exactly (devs using AI coding tools), exercises Spartan/ng's chrome (Sidebar, Resizable, Tabs, Tree, Command, Sheet) against a dense workspace surface, and validates the conversation-thread DNA we proved out in Apex against a totally different shape (lines of code instead of chat messages).

## Goals

1. **Validate the skill end-to-end.** Use every Helm component the skill documents at least once. Anywhere the skill drifts from upstream Spartan/ng, the skill gets fixed, not the app.
2. **Produce a portfolio-grade example.** Real interactions, real layouts, dark mode, keyboard nav, no console errors. Something we can point users at as "this is what a polished Spartan app feels like."
3. **Stay shippable in slices.** Each build phase ends runnable + commitable, no waterfall.

## Out of scope

- Auth (mock a signed-in reviewer)
- Real Git / backend (mock data; no `git diff` runtime parsing, the diffs are static fixtures)
- Real syntax highlighting at runtime (use a lightweight pre-tokenized approach or [Shiki](https://shiki.style) loaded once, no Monaco)
- Real-time collaboration (no presence cursors, no live comments)
- SSR (later)
- Unit / E2E tests (this is manual visual + functional validation, the *skill* is what we're testing, not the app)

## Tech stack

- **Angular**, latest stable (v21+). Reactive Forms per project preference. Signal Forms moves in when Angular v22 ships stable.
- **Spartan/ng**, latest alpha. Install via the skill's own `setup.md` so the install path is meta-validated too.
- **Tailwind v4**, recommended by Spartan.
- **TanStack Angular Table**, required by Spartan's Data Table.
- **ngx-scrollbar**, required by Spartan's Scroll Area.
- **@ng-icons/lucide**, required by Spartan's Icon.
- **Shiki** for syntax highlighting of diff hunks, loaded once at app boot, tokens cached.
- **diff** (npm) for unified-to-side-by-side hunk parsing on the mock fixtures.
- **[ngx-transforms](https://www.npmjs.com/package/ngx-transforms)** for `| initials`, `| timeAgo`, `| truncate`, dogfood the user's own library.
- **No state library**, signals + a single `MockDataService`.
- **Zoneless**, opt in via `provideZonelessChangeDetection()`.

## Pages

### 1. Inbox (`/`)
Default landing. The reviewer's queue.
- **Filters bar**, status **Toggle Group** (Needs review / Waiting on author / Approved / All), repo **Combobox**, author **Combobox**, label **Combobox** (multi), date **Date Picker** range
- **Data Table** (TanStack-powered), columns: Title + branch, Repo, Author, Labels (**Badge** stack), Status (**Badge** with state colour), Diff size (`+12 / -8`), Updated (relative time via `| timeAgo`), Reviewer avatars (**Avatar** stack)
- Row click → `/pr/:id`
- Row hover → **Dropdown Menu** (Open, Copy link, Subscribe / unsubscribe, Mark as read, Hide)
- Right-click row → **Context Menu** (same actions)
- **Pagination** at the bottom
- Empty / loading states via **Empty** + **Skeleton**

### 2. PR detail (`/pr/:id`)
The flagship surface. Resizable three-pane layout: file tree | diff viewer | conversation rail.
- **Breadcrumb** header (org / repo / PR #) with title + **Badge** status, age via `| timeAgo`
- **Sub-header** with action **Button Group** (Review · Approve · Request changes · Comment), reviewer **Avatar** stack + add-reviewer **Sheet** trigger, label editor **Popover**, three-dot **Dropdown Menu** (Pin, Subscribe, Lock conversation, Delete)
- **Tabs** below header, Conversation / Files changed (default) / Commits / Checks
- **Resizable** main area:
  - **Tree** (file tree, modified / added / deleted icons, file-name search, collapse-all toggle)
  - Diff viewer (see Page 3 below)
  - Conversation rail (open threads, scroll-spy active thread)
- File tree on handset collapses into a **Sheet**, conversation rail into a second **Sheet**

### 3. Diff viewer (inside `/pr/:id` Files tab)
The single most ambitious surface.
- **Toggle Group** for view mode (Unified / Side-by-side), wrap (Wrap / No-wrap), whitespace (Hide / Show)
- Hunk header row with file name, language **Badge**, +/- counts, "Viewed" **Checkbox**, three-dot **Dropdown Menu** (Copy path, Open file, Mark not viewed)
- Hunk body, monospace with line numbers, Shiki-highlighted, diff-coloured line backgrounds
- Hover a line → "+ Add comment" affordance, click → inline comment composer drops in below the line
- Inline comment threads, **Avatar** + author + timestamp + body, supports replies + resolve/unresolve
- Suggested-change pill, optional v2 feature, skip for v1

### 4. Conversation tab (inside `/pr/:id`)
Stacked timeline of every event.
- Comment cards (top-level PR comments, not file-anchored)
- Review summary cards (Approved / Requested changes with the review body)
- Event rows (force-pushed, branch renamed, reviewer added, label added) via compact **Item**
- Composer at the bottom, **Textarea** + **Button Group** (Comment · Approve · Request changes), Markdown preview **Tabs** (Write / Preview)
- Activity from new commits collapses into "**N** commits since last review" pill that expands a **Collapsible**

### 5. Commits tab (inside `/pr/:id`)
- **Table**, column: short SHA (**Hover Card** shows full SHA + parent), commit message, author **Avatar**, date, CI status **Badge**
- Click a commit → opens a focused diff for that commit only

### 6. Checks tab (inside `/pr/:id`)
- **Card** per check (CI suite, lint, type check, e2e), with **Progress** for in-flight checks, **Badge** for pass/fail/skipped, "View logs" → **Sheet** with pre-formatted log output

### 7. Author profile (`/author/:handle`)
Lighter page, exists mostly to validate the secondary-route shape.
- **Avatar** + name + role + tenure
- **Tabs**, Open PRs · Reviewed · Authored / merged
- **Tabs** content is **Data Table** of the corresponding PRs

### 8. Settings (`/settings`)
- Secondary **Sidebar** with sections, Profile / Notifications / Keyboard shortcuts / Display
- **Profile** form, Reactive Forms with **Input**, **Textarea**, **Combobox** (timezone), **Avatar** upload
- **Notifications**, list of preferences with **Switch**
- **Keyboard shortcuts**, **Table** of action / **Kbd** combo
- **Display**, density toggle, theme override, monospace font picker

### Cross-cutting

- **⌘K command palette** via **Command**, jump to PR, jump to file inside a PR, switch repo, change theme, sign out, open keyboard shortcuts
- **Notifications inbox** via **Sheet** opened from a header bell, **Badge** count on the bell, **Item** list of events
- **Light + dark themes** via the `ThemeService` pattern in `theming.md`
- **Toast feedback** via **Sonner** for review submit, comment posted, link copied, undo on destructive actions
- **Empty states** everywhere a list can be empty
- **Loading states** everywhere data "loads", **Skeleton** placeholders during a 400 ms simulated fetch

## Component coverage (used vs. documented)

The skill's SKILL.md router catalogues 56 Helm components. Goal is to use every one in Forge or in another validator app.

| Category | Component | Used in |
|---|---|---|
| **Form** | Autocomplete | File search inside PR detail |
| | Button | Everywhere |
| | Button Group | Review actions, view-mode toggle |
| | Checkbox | "Viewed" per file, bulk-select in inbox |
| | Combobox | Repo / author / label filters |
| | Date Picker | Inbox date-range filter |
| | Field | Every form |
| | Input | Searches, settings |
| | Input Group | Inbox search with icon prefix |
| | Input OTP | Settings → two-factor sub-section |
| | Label | Every form |
| | Native Select | Display density in settings |
| | Radio Group | Review type selector in composer |
| | Select | Sort order, label colour picker |
| | Slider | Diff viewer font-size in settings |
| | Switch | Notification preferences |
| | Textarea | Comment composer, PR description |
| | Toggle | Side-by-side / unified, wrap, whitespace |
| | Toggle Group | Inbox status filter, diff view mode |
| **Overlays** | Alert Dialog | Confirm "Resolve all threads" |
| | Command | ⌘K palette |
| | Context Menu | Inbox row right-click, file tree right-click |
| | Dialog | New label, edit reviewer assignment, suggestion preview |
| | Dropdown Menu | Inbox row menu, PR three-dot menu, comment menu |
| | Hover Card | Commit short-SHA hover, label hover, author hover |
| | Menubar | Top app menubar (File / Edit / View / Help, optional) |
| | Navigation Menu | Header repo switcher mega-menu |
| | Popover | Label editor, branch picker |
| | Sheet | File tree on handset, reviewer assignment, notifications inbox, check logs |
| | Sonner | All toasts |
| | Tooltip | Icon-only buttons, hover hints |
| **Layout** | Accordion | Settings sections in compact mode |
| | Aspect Ratio | Avatar placeholder in author profile header |
| | Card | KPI cards (optional Overview page), Settings Display cards |
| | Collapsible | "N new commits since last review" expander |
| | Resizable | PR detail three-pane split |
| | Scroll Area | Diff viewer scroll body, file tree, conversation rail |
| | Separator | Form section dividers |
| | Sidebar | Global nav, Settings secondary nav |
| | Tabs | PR detail tabs, comment composer Write / Preview |
| **Display** | Alert | Branch protection warning, merge conflict banner |
| | Avatar | Reviewers, authors, comment headers |
| | Badge | PR status, labels, CI status, language tag |
| | Empty | Empty inbox, no comments yet |
| | Icon | Everywhere |
| | Item | Conversation timeline events, notifications |
| | Kbd | Keyboard-shortcut hints, ⌘K trigger label |
| | Progress | CI check progress |
| | Skeleton | Loading states everywhere |
| | Spinner | Inline async indicators (saving comment, submitting review) |
| **Data** | Breadcrumb | PR detail header path |
| | Calendar | Inbox date-range picker pop-out |
| | Carousel | Settings → "Tips & shortcuts" carousel (optional) |
| | Data Table | Inbox, Author profile tabs |
| | Pagination | Inbox |
| | Table | Commits tab, Keyboard-shortcuts settings |

Coverage gaps after Forge ships will be flagged in the skill's "Used in real example" callouts. Anything documented but unused means we either find a fit or trim the skill's claim.

## Build phases

Small slices. Each phase ends runnable + commitable.

### Phase 0, foundation
1. `cd examples && ng new forge --routing --style=css --ssr=false --skip-git`
2. Follow the skill's `setup.md`, `ng g @spartan-ng/cli:init` → `ng g @spartan-ng/cli:ui-theme`
3. Generate the first wave of Helm components, `button card input label field sidebar tabs table badge icon avatar tooltip dialog command sheet`
4. `ng serve`, confirm dev server runs, hello-Spartan button renders, dark mode toggles
5. **Validation gate**, every step from the skill verbatim, if anything went sideways fix the skill before continuing

### Phase 1, shell + routing
Sidebar + header + main outlet. Route stubs for all 8 surfaces. Theme toggle. Mock current reviewer in the header dropdown. **Sonner** toaster mounted.

### Phase 2, inbox
TanStack-powered **Data Table** with filters, row Dropdown / Context menus, pagination, skeleton, empty state. Mock data for ~25 PRs across various statuses and repos.

### Phase 3, PR detail shell
Header with breadcrumb / title / status, sub-header with action Button Group + reviewer avatars + label popover, **Tabs** with Conversation / Files / Commits / Checks (placeholder bodies).

### Phase 4, file tree + unified diff viewer
**Resizable** split, **Tree** in the left pane with file-status icons, diff viewer in the middle with Shiki-highlighted hunks (unified view first). "Viewed" checkbox per file.

### Phase 5, side-by-side diff + diff actions
Side-by-side toggle, wrap toggle, whitespace toggle. Per-line hover → "Add comment" affordance. Mark-as-viewed persistence in the signal store.

### Phase 6, inline comment threads + review composer
Threads anchor to lines, support reply, edit, resolve, react. Top-level conversation tab composer with **Tabs** Write / Preview. Review submission, Approve / Request changes / Comment fires Sonner.

### Phase 7, commits tab + checks tab + activity timeline
Commits table with hover-card SHAs. Checks page with Progress + Sheet log viewer. Conversation tab event timeline with Item rows.

### Phase 8, polish
- **Command palette** (⌘K) wired to every route + every action
- **Author profile** + **Settings** surfaces
- Empty / loading / error states everywhere
- Keyboard shortcuts visible (Kbd hints throughout)
- Mobile responsive, file tree → Sheet, conversation rail → Sheet
- Accessibility sweep, tab order, focus rings, screen-reader smoke test
- Wire into `.github/workflows/deploy.yml` matrix + Vercel project for `forge-*.vercel.app`

## Mock data shape

A single `MockDataService` with signals:

- `pullRequests: WritableSignal<PullRequest[]>` (25, across 4 mock repos)
- `currentReviewer: Signal<Reviewer>` (the signed-in mock user)
- `repos: WritableSignal<Repo[]>` (4, monorepo style)
- `labels: WritableSignal<Label[]>` (12 labels with colours)

Each `PullRequest` carries enough to render every surface, files + hunks + comments + commits + checks + reviewers + labels + status + timestamps.

Diff fixtures are 6-8 hand-authored, varied across small / medium / large, languages TS / HTML / SCSS / Markdown / JSON, and edit kinds (add / modify / delete / rename / pure-whitespace).

## Definition of done

- All 56 Helm components used at least once (verified against the coverage table above)
- All 8 routes navigable
- Light + dark mode work end-to-end
- ⌘K palette navigates and runs every documented action
- `ng build` clean, no console errors / warnings in the browser
- Lighthouse a11y ≥ 95 on the inbox + PR detail
- README polish + screenshot for the docs site (`docs/public/projects/forge-light-mode.png`)
- Wired into `.github/workflows/deploy.yml` + Vercel
- Folded any skill-drift findings back into the skill's reference files

## Validation loop (the whole reason this exists)

For every Helm component used:
1. Open the skill's reference file for it (e.g. `references/data-display.md` for Data Table).
2. Copy the canonical example structure into the app.
3. Build. If anything compiles wrong or behaves wrong → **the skill is wrong**, fix it before the app.

Don't paper over skill bugs in the app. The app is the test.

## Next session, where to start

```sh
cd "D:\Projects\Open Source\angular-ui-skills\examples"
# Tell Claude: "start Phase 0 of the Forge plan"
```

The agent should:
1. Read `examples/forge/PLAN.md` (this file)
2. Read the skill's `setup.md` and `theming.md`
3. Begin Phase 0, scaffold the Angular app, run Spartan init + ui-theme, generate the first wave of components, get the dev server up

Each phase is its own commit (or PR). Don't try to land the whole app in one go.