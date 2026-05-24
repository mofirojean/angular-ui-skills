# Mission Control - Build Plan

> **Status:** Plan. Not yet scaffolded. See "Next session: where to start" at the bottom.

A reference Angular application built with the `spartan-ng-developer` skill. The point is not the app - the point is that **building this proves the skill is correct**. Every component the skill documents gets used here; anything that doesn't match docs → fix the skill, then keep going.

## What it is

**Mission Control** - admin dashboard for a fictional AI agent platform. Think Vercel + Linear + a CI dashboard, applied to a runtime that runs autonomous agents. Users register agents, schedule runs, watch them execute, install community agents from a marketplace.

The narrative is on-theme for the repo (agent skills) and gives every Spartan component a natural home - no contrived "showcase" feel.

## Goals

1. **Validate the skill end-to-end.** Use all 56 Helm components at least once. Anywhere the skill is wrong, surface it now, not after publishing.
2. **Produce a portfolio-grade example.** Real interactions, real layouts, dark mode, keyboard nav, no console errors. Something we can point users at.
3. **Stay shippable in slices.** Each build phase ends with a runnable app - no waterfall.

## Out of scope

- Auth (mock a logged-in user)
- Real backend / API calls (mock data in services)
- SSR (later)
- Unit/E2E tests (this is manual visual + functional validation; the *skill* is what we're testing, not the app)

## Tech stack

- **Angular** - latest stable (v21 at writing); we'll use Reactive Forms per [project preference](../../memory/feedback_forms_strategy.md). Signal Forms moves in when Angular v22 ships stable.
- **Spartan/ng** - latest. Install via the skill's own `setup.md` instructions (this is also a meta-validation).
- **Tailwind v4** - recommended by Spartan.
- **TanStack Angular Table** - required by Spartan's Data Table.
- **ngx-scrollbar** - required by Spartan's Scroll Area.
- **@ng-icons/lucide** - required by Spartan's Icon.

## Pages

### 1. Overview (`/`)
KPI tiles + recent activity. The first thing a user sees.
- 4 KPI **Cards**: Runs Today, Success Rate, Cost This Month, Active Agents
- "Recent runs" **Table** (5 rows; link to /runs)
- "Activity feed" **Item** list with timestamps
- **Skeleton** placeholders while data "loads" (faked with a 400ms delay)

### 2. Agents (`/agents`)
List + detail.
- **Filters bar**: search **Input Group** (icon prefix), status **Toggle Group**, owner **Combobox**
- **Data Table** (TanStack): Name, Owner, Status (**Badge**), Last Run, Created. Sortable, paginated.
- Row hover → **Dropdown Menu** (Run · Edit · Disable · Delete with **Alert Dialog** confirm)
- Right-click row → **Context Menu** (same actions)
- Click row → `/agents/:id` detail
- Detail uses **Tabs**: Overview · Config · Runs · Logs · Permissions
  - **Config** tab is the full-form showcase - every form control type
  - **Logs** tab is a **Resizable** split (timeline tree ⇆ JSON viewer inside **Scroll Area**)
  - **Permissions** tab uses **Accordion** sections

### 3. Runs (`/runs`)
Filterable table + side-drawer detail.
- **Date range** filter (**Date Picker** range mode) + **Select** status + **Combobox** agent
- **Data Table** + **Pagination**
- Click row → **Sheet** slides in from the right with run detail (output, timing, logs)

### 4. Schedules (`/schedules`)
- **Calendar** (multi-mode) - scheduled days highlighted
- "New schedule" → **Dialog** with a form (Date Picker, Combobox for agent, Toggle Group for cadence, Slider for retry count, **Switch** for enabled)
- Upcoming schedules **Item** list below

### 5. Marketplace (`/marketplace`)
- Top: **Carousel** of featured agents with **Aspect Ratio** previews
- Filter chips in **Popover**s + search
- Grid of agent **Card**s; **Hover Card** on author name → preview
- "Install" → **Dialog** → step 2 is **Input OTP** (2FA confirm to publish) → **Sonner** toast on success

### 6. Settings (`/settings`)
Tabs: Profile · Team · Billing · Notifications · Integrations
- **Profile**: every remaining form control we haven't used yet (Native Select, Radio Group, Textarea, Checkbox, Toggle, …)
- **Team**: Table with **Avatar**s and role **Select**; invite **Dialog**
- **Notifications**: grid of **Switch**es
- **Integrations**: **Item** list with **Toggle** per integration

### 7. 404
- **Empty** state with "Back home" **Button**

## Global shell

- **Sidebar** (`HlmSidebarService`) - primary nav, Ctrl/⌘+B to collapse, mobile-responsive
- **Header**:
  - Left: app logo + **Breadcrumb**
  - Middle: **Menubar** (File · Edit · View · Run · Help - e.g. *File → New Agent* opens the create dialog)
  - Right: search button (**Command** palette via Cmd+K), notifications, **Avatar** with **Dropdown Menu**
- **Command palette** - global Cmd+K. Navigate + run actions. **Kbd** chips visible in items.
- **Dark mode** toggle in header (the canonical pattern from `theming.md`)
- **Sonner** toaster mounted at app root for all "X succeeded / failed" feedback
- **Tooltip** on every icon-only button
- **Navigation Menu** flyout for the Marketplace category dropdown in the header

## Coverage map (all 56)

| Category | Component | Where it lives |
|---|---|---|
| Form | Autocomplete | Marketplace search |
| Form | Button | everywhere |
| Form | Button Group | Action clusters in detail headers |
| Form | Checkbox | Settings → Notifications |
| Form | Combobox | Agents filter, Schedule form |
| Form | Date Picker | Runs filter, Schedule form |
| Form | Field | wraps every form input |
| Form | Input | search, all text inputs |
| Form | Input Group | search with icon |
| Form | Input OTP | Marketplace install confirm |
| Form | Label | every form |
| Form | Native Select | Settings → low-fi fallback |
| Form | Radio Group | Settings → Profile theme picker |
| Form | Select | filters, settings |
| Form | Slider | Schedule retry count |
| Form | Switch | Settings → Notifications + Integrations |
| Form | Textarea | Agent description |
| Form | Toggle | Settings → display preferences |
| Form | Toggle Group | Agents status filter, alignment in editor |
| Overlay | Alert Dialog | Delete confirm |
| Overlay | Command | Cmd+K palette |
| Overlay | Context Menu | Right-click agent row |
| Overlay | Dialog | Create agent, install agent |
| Overlay | Dropdown Menu | Header user menu, row actions |
| Overlay | Hover Card | Author preview on Marketplace |
| Overlay | Menubar | Header app menu |
| Overlay | Navigation Menu | Marketplace category flyout |
| Overlay | Popover | Filter chips, color picker |
| Overlay | Sheet | Run detail drawer |
| Overlay | Sonner | All action confirmations |
| Overlay | Tooltip | every icon-only button |
| Layout | Accordion | Agent → Permissions |
| Layout | Aspect Ratio | Marketplace preview thumbnails |
| Layout | Card | KPI tiles, marketplace items |
| Layout | Collapsible | Sidebar sub-sections |
| Layout | Resizable | Agent → Logs split view |
| Layout | Scroll Area | Logs stream, sidebar overflow |
| Layout | Separator | Section dividers |
| Layout | Sidebar | Global nav |
| Layout | Tabs | Agent detail, Settings |
| Display | Alert | "3 agents need attention" banners |
| Display | Avatar | Header user, team members |
| Display | Badge | Status pills on rows |
| Display | Empty | 404, no-results states |
| Display | Icon | everywhere |
| Display | Item | Activity feed, integrations list |
| Display | Kbd | Shortcuts in Command palette |
| Display | Progress | Run-in-progress bars |
| Display | Skeleton | Loading states |
| Display | Spinner | Inline async indicators |
| Data | Breadcrumb | Header path |
| Data | Calendar | Schedules page |
| Data | Carousel | Marketplace featured |
| Data | Data Table | Agents, Runs (TanStack-powered) |
| Data | Pagination | All large lists |
| Data | Table | Recent runs, Team members |

## Build phases

Small slices. Each phase ends runnable + commitable.

### Phase 0 - Foundation
1. `cd examples` → `ng new mission-control --routing --style=css --ssr=false`
2. Move this `PLAN.md` into the new project root if `ng new` complains about the directory.
3. Follow `references/setup.md` from the skill: `ng g @spartan-ng/cli:init` → `ng g @spartan-ng/cli:ui-theme`.
4. Generate the first wave of Helm components: `button card input label field sidebar sheet dialog dropdown-menu tabs table badge icon avatar tooltip`.
5. `ng serve` - confirm the dev server runs, a hello-Spartan button renders, dark mode toggles via the theme service in `theming.md`.
6. **Validation gate:** every step above came from the skill. If anything went sideways, fix the skill before continuing.

### Phase 1 - Shell + routing
Sidebar + header + main outlet. Route stubs for all 7 pages. Theme toggle. Mock user in header dropdown. **Sonner** toaster mounted.

### Phase 2 - Overview
KPI Cards, Recent Runs Table, Activity feed Item list. Skeleton loaders.

### Phase 3 - Agents (list + detail)
Data Table with TanStack, filter bar, row Dropdown/Context menu, Alert Dialog confirm. Detail page with Tabs; build the full Config form here (every form control gets used).

### Phase 4 - Runs + Schedules
Runs filterable table + Sheet detail. Schedules Calendar + Dialog form.

### Phase 5 - Marketplace
Carousel + Card grid + Hover Card. Install Dialog → Input OTP → Sonner.

### Phase 6 - Settings
All tabs: Profile · Team · Billing · Notifications · Integrations.

### Phase 7 - Polish
- **Command palette** (Cmd+K) last - by now we know every route and action it should expose
- Empty / loading / error states everywhere
- Keyboard shortcuts visible (Kbd hints)
- Mobile responsive (sidebar collapse)
- Accessibility sweep: Tab order, focus rings, screen-reader smoke test (see `accessibility.md`)

## Definition of done

- All 56 components used at least once (check against the coverage map above)
- Dark mode works on every page
- Cmd+K palette navigates and runs actions
- No console errors in any route
- Lighthouse a11y ≥ 95
- A 30-second demo recording exists for the README

## Validation loop (the whole reason this exists)

For every component used:
1. Open the skill's reference file for it (e.g. `references/overlays.md` for Dialog).
2. Copy the canonical example structure into the app.
3. Build. If anything compiles wrong or behaves wrong → **the skill is wrong**, fix it before the app.

Don't paper over skill bugs in the app. The app is the test.

## Next session: where to start

```sh
cd "D:\Projects\Open Source\angular-ui-skills\examples"
# Tell Claude: "start Phase 0 of the Mission Control plan"
```

Claude should:
1. Read `examples/mission-control/PLAN.md` (this file)
2. Read the skill's `setup.md` and `theming.md`
3. Begin Phase 0 - scaffold the Angular app, run Spartan init + ui-theme, generate the first wave of components, get the dev server up.

Each phase is its own commit (or PR). Don't try to land the whole app in one go.
