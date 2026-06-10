# Switchboard, Build Plan

> **Status:** Plan. Not yet scaffolded. See "Next session: where to start" at the bottom.

A reference Angular application built with the `ng-zorro-developer` skill. The point is not the app, the point is that **building this proves the skill is correct**. Every NG-ZORRO component the skill documents gets used here; anything that doesn't match docs → fix the skill, then keep going.

## What it is

**Switchboard**, a support / help-desk operations console for a fictional SaaS company. Inbound tickets, queue routing, agent assignment, conversation threads, SLA timers, knowledge base, team admin, settings.

The narrative fits NG-ZORRO's strengths well: Table is the flagship and a ticket queue exercises Table's hardest features (sort, filter, lazy load, virtual scroll, frozen columns, row expansion, inline edit, bulk select). Drawer and Modal carry the form load. Tree, Tabs, Timeline, Comment, Steps, Calendar, Statistic, Descriptions all fit naturally into the helpdesk story. The retro "switchboard operator" naming gives us a small visual identity hook without pulling away from a serious enterprise feel.

## Goals

1. **Validate the skill end-to-end.** Use every NG-ZORRO component the skill documents at least once. Wherever the skill is wrong, surface it now, not after publishing.
2. **Produce a portfolio-grade example.** Real interactions, real layouts, light + dark mode, keyboard nav, no console errors. Something we can point users at.
3. **Stay shippable in slices.** Each phase ends with a runnable app, no waterfall.

## Out of scope

- Auth (mock a logged-in agent)
- Real ticket backend (mock data in services, randomized within plausible ranges)
- SSR (later)
- Unit / E2E tests (this is manual visual + functional validation; the *skill* is what we're testing, not the app)
- Real email / Slack integrations (the new-ticket wizard ends with a toast, no outbound)

## Tech stack

- **Angular**, latest stable (v21+). Reactive Forms per project preference. Signal Forms moves in when Angular v22 ships stable.
- **NG-ZORRO v21**, install via the skill's `setup.md` schematic (`ng add ng-zorro-antd`, also a meta-validation).
- **LESS-variable theming** with a custom `@primary-color` and `@border-radius-base`. Dark mode via the shipped `ng-zorro-antd.dark.less` bundle, swapped at runtime via a `<link>` tag flip per the docs' recommended pattern.
- **PrimeIcons-free**, NG-ZORRO ships `@ant-design/icons-angular`, register only what we use.
- **Charts**, lightweight, `@ant-design/charts` if the wrappers fit cleanly, otherwise raw Chart.js inside `nz-card`.
- **No additional state library**, signals + services only.
- **Zoneless**, NG-ZORRO advertises zoneless support; we'll opt in via `provideZonelessChangeDetection()`.

## Pages

### 1. Dashboard (`/`)
Landing snapshot. The first thing an agent sees when they log in.
- 4 KPI **Statistic** blocks in **Cards**: Open tickets, In progress, Resolved today, SLA breaches
- "Volume" **chart** (line, last 14 days) inside an `nz-card`
- "Agents on shift" **Avatar group** with **Badge** for online state
- "Recent tickets" **Table** (5 rows, sortable, link to detail)
- "Announcements" **Carousel** with **Tag** chips per category
- **Skeleton** placeholders while data loads (400ms fake delay)
- **FloatButton** for "scroll to top" / "open feedback"

### 2. Tickets (`/tickets`)
The flagship Table page.
- **Filters bar**: subject search (**AutoComplete**), status **Segmented** (All / Open / Pending / Resolved), priority **Select**, assignee **TreeSelect** (by team → agent), date range **RangePicker**
- **Table**: id, subject, customer, priority, status, assignee, created, last reply, SLA-remaining. Sortable (multi), filterable (column header filters), paginated, frozen left columns, resizable columns, inline-editable priority column
- Row expansion → **Descriptions** showing the first message body, attachments, tags
- Right-click row → **Dropdown** (Assign, Reassign, Close, Merge, Add tag)
- Bulk select via checkbox column + bulk **Toolbar** (Bulk close, Bulk assign, Export, Tag)
- **Pagination** bottom-bar with size changer
- "New ticket" → opens **Drawer** with a **Steps** wizard inside

### 3. Ticket detail (`/tickets/:id`)
Two-pane split via **Splitter**: conversation on the left, metadata panel on the right.
- Header: **PageHeader** with **Breadcrumb**, ticket id, **Tag** for status, **Avatar** for assignee, action buttons (Assign / Resolve / Close)
- Left (**Tabs**): Conversation, Activity, Related, Customer
  - **Conversation**: **List** of **Comment** blocks (avatar, author, datetime, body, attachments via **Image** preview); reply composer with `nz-input` textarea, **Mention** for `@agent` lookup, **Upload** for attachments
  - **Activity**: **Timeline** of all events (created, replied, assigned, status change, SLA)
  - **Related**: **Table** of related tickets (same customer, same tag)
  - **Customer**: **Descriptions** block (name, email, plan, signups, prior tickets count)
- Right side panel (sticky via **Affix**, scrollable inside): **Collapse** with sections
  - Status / Assignee / Priority / Tags (each row an editable control)
  - **Statistic.Countdown** for SLA remaining
  - "Knowledge suggestions" **List** (clickable, opens **Drawer** for preview)
- Confidential ticket marker: **Watermark** behind the panel for tickets flagged sensitive

### 4. Queues (`/queues`)
Multi-mode view of unresolved tickets.
- **Segmented** to switch between Kanban / Table / Calendar
- **Kanban**: horizontal scroll with `nz-card` columns (To do / In progress / Waiting / Resolved). Cards show **Avatar**, **Tag** (priority), **Badge** (urgency), **Tooltip** for full subject. Drag-drop via Angular CDK
- **Calendar mode**: `nz-calendar` with ticket cells per day (assignment date)
- **Table mode**: minimal column set, link to detail
- Toggle "show only mine" via **Switch** at the top

### 5. Knowledge base (`/kb`)
Internal help-article wiki.
- **Layout** with side **Tree** for categories (drag-drop reorder enabled)
- **Cascader** at top for quick navigation ("Product → Feature → Topic")
- **AutoComplete** search at the top
- Per-article view: **Anchor** sticky in-page TOC, **Typography** for the body, **Tag**s for categories, **Rate** at the bottom ("Was this helpful?")
- "New article" → **Modal** with a long form

### 6. Agents (`/agents`)
Team management.
- **Table** of agents: avatar, name, role, online status (**Badge**), current load (**Progress** bar), tickets resolved this week, average response time
- Row click → **Modal** with agent detail: **Descriptions**, **Timeline** of recent activity, performance **Charts**, **QRCode** for "pair mobile app"
- "Invite agent" → **Modal** with a **Form** (email, role, teams)
- Role / permission editor: **Transfer** between "Available" and "Granted" permission lists
- **InputNumber** for max concurrent tickets per agent

### 7. Settings (`/settings`)
Workspace configuration.
- Left **Anchor** nav: General, Notifications, Automations, Integrations, Business hours, Billing
- Each section is a `nz-card` with a **Form**
- General: workspace name (**Input**), logo (**Upload**), accent (**ColorPicker**), default language
- Notifications: **List** of preferences with **Switch** toggles, sound **Slider**
- Business hours: **TimePicker** range per weekday
- Automations: **Steps** wizard for creating a new automation rule
- Integrations: **List** of connected services with **Switch** and **Popconfirm** for disconnect
- Billing: plan summary in **Statistic** blocks + **Table** of invoices

### 8. Not found (`/**`)
Catch-all. **Result** with `nzStatus="404"` and a primary action button back to `/`.

### Cross-cutting

- **Command palette** via global `Ctrl+K` → **Modal** with search **AutoComplete** for navigation, ticket lookup, common actions
- **Notifications inbox** opened from header bell icon → **Drawer** with **List** of system notifications (toggle read/unread, archive); the live new-event toasts come through `NzNotificationService`
- **Toast feedback** via `NzMessageService` (save success, copy-to-clipboard) and `NzNotificationService` (new ticket arrived, SLA breach)
- **Confirmation** on destructive actions via `NzModalService.confirm()` or inline `Popconfirm`
- **Dark mode toggle** in the header
- **App shell**: `nz-layout` with `nz-sider` (collapsible) + `nz-header` + `nz-content` + `nz-footer`. Sider has `nz-menu` with router-linked items.

## Component coverage (used vs. documented)

This list mirrors the skill's [SKILL.md](../../skills/ng-zorro-developer/SKILL.md) router. The goal is 100% coverage.

| Category | Component | Used in |
|---|---|---|
| **General** | Button | Everywhere |
| | FloatButton | Dashboard scroll-top, feedback |
| | Icon | Everywhere |
| | Typography | KB articles, settings |
| **Layout** | Layout, Sider, Header, Content, Footer | App shell |
| | Grid (Row/Col) | Dashboard KPI grid |
| | Flex | Header toolbars |
| | Space | Action bars |
| | Divider | Settings sections |
| | Splitter | Ticket detail split |
| **Navigation** | Menu | Sider nav |
| | Dropdown | Row context menus |
| | Breadcrumb | Page headers |
| | Tabs | Ticket detail, settings |
| | Pagination | Table footers |
| | Steps | New-ticket wizard, automations |
| | PageHeader | Ticket detail header |
| | Anchor | Settings nav, KB article TOC |
| **Data Entry** | AutoComplete | Search bars, command palette |
| | Cascader | KB category navigator |
| | Checkbox | Table bulk select, filter forms |
| | ColorPicker | Settings accent |
| | DatePicker, RangePicker | Filters |
| | Form (item, label, control) | Every form |
| | Input | Searches, replies |
| | InputNumber | Agent load cap |
| | Mention | Reply composer |
| | Radio | New-ticket form |
| | Rate | "Was this helpful?" |
| | Select | Filter dropdowns |
| | SelectButton (n/a in NG-ZORRO, use Segmented) | n/a |
| | Slider | Notification sound volume |
| | Switch | Toggles in settings, "show only mine" |
| | TimePicker | Business hours |
| | Transfer | Permission editor |
| | TreeSelect | Assignee filter |
| | Upload | Reply attachments, settings logo |
| **Data Display** | Avatar | Everywhere |
| | Badge | Online state, ticket counts |
| | Calendar | Queue calendar mode |
| | Card | Dashboard tiles, KB articles |
| | Carousel | Dashboard announcements |
| | Collapse | Ticket detail side panel |
| | Comment | Conversation thread |
| | Descriptions | Customer panel, agent detail |
| | Empty | Tables / lists no-data state |
| | Image | Attachment previews |
| | List | Conversation, KB, notifications inbox |
| | QRCode | Agent detail "pair mobile app" |
| | Segmented | Queue mode switcher |
| | Statistic | Dashboard KPIs, SLA countdown |
| | Table | Tickets, agents, billing |
| | Tag | Status, priority, categories |
| | Timeline | Activity log |
| | Tree | KB categories |
| | TreeView | Audit log (alternative to Tree) |
| **Feedback** | Alert | SLA breach banner |
| | Drawer | Ticket detail (mobile), notifications inbox, new-ticket wizard |
| | Message | Save / copy toasts |
| | Modal | Agent detail, new article, invite agent, confirmations |
| | Notification | New ticket arrived, SLA breach |
| | Popconfirm | Disconnect integration, delete row |
| | Popover | Avatar hover detail |
| | Progress | Agent load |
| | Result | 404 page |
| | Skeleton | Loading placeholders |
| | Spin | Inline loaders |
| | Tooltip | Icon-only buttons everywhere |
| **Other** | Affix | Ticket detail side panel |
| | Watermark | Confidential ticket marker |

Gaps after this app ships go straight into the skill's "Used in real example" callouts. Anything documented but not used means we either find a fit or trim the skill's claim.

## Phases (shippable slices)

### Phase 0, scaffold + shell
- Angular CLI scaffold, `ng add ng-zorro-antd` with the icon and theme prompts
- `app.config.ts` providers: `provideZonelessChangeDetection`, `provideAnimationsAsync`, `provideNzI18n(en_US)`, `provideNzIcons([...])`, `provideNzModal`, `provideNzMessage`, `provideNzNotification`, `provideNzDrawer`
- LESS theme file with custom `@primary-color` and `@border-radius-base`
- App shell: `nz-layout` with collapsible `nz-sider` (Menu), `nz-header` (logo, search, notifications, theme toggle, avatar dropdown), `nz-content`, `nz-footer`
- Route stubs for all 8 pages
- Dark mode runtime toggle

### Phase 1, dashboard
- 4 Statistic cards + 14-day volume chart + agent-presence row + recent-tickets table + announcements carousel
- Mock data service, hardcoded but plausible
- Skeleton states

### Phase 2, tickets table
- Filters bar
- The flagship Table with frozen columns, virtual scroll, row expansion, bulk select, column resize, inline edit
- Pagination
- "New ticket" Drawer placeholder (form lands in Phase 3)

### Phase 3, ticket detail
- Splitter layout
- PageHeader + Tabs
- Conversation tab with Comment list + reply composer (Mention + Upload)
- Activity Timeline
- Right side panel with Collapse, Statistic.Countdown, knowledge suggestions
- Watermark for sensitive tickets

### Phase 4, queues + new-ticket wizard
- Segmented switcher Kanban / Table / Calendar
- Kanban with CDK drag-drop
- Calendar mode
- New-ticket Steps wizard inside the Drawer

### Phase 5, KB + settings
- Tree categories with drag-drop reorder
- Article view with Anchor TOC
- Settings with Anchor side nav, Form per section, TimePicker for hours, Transfer for permissions, Upload for logo

### Phase 6, agents + system overlays
- Agents table with Progress load bars
- Agent detail Modal with charts + QRCode
- Invite-agent Modal
- Command palette (Ctrl+K)
- Notifications inbox Drawer
- Global Message / Notification wiring

### Phase 7, polish
- Accessibility pass (keyboard, screen reader, focus visible)
- Mobile responsive pass (the lesson from Apex)
- Empty states everywhere
- Loading states everywhere
- Dark mode QA on every page
- README polish + screenshot for docs site
- Wire into deploy pipeline + Vercel project

## Mock data shape

A single `MockDataService` with signals exposes:
- `tickets: WritableSignal<Ticket[]>` (200 rows, varied status/priority/age)
- `agents: WritableSignal<Agent[]>` (12 agents)
- `customers: WritableSignal<Customer[]>` (60 customers)
- `articles: WritableSignal<KbArticle[]>` (30 articles, tree-shaped via parentId)
- `notifications: WritableSignal<SystemNotification[]>` (mixed read/unread)

All derived state via `computed()`. Setters mutate the signals so the UI reacts.

## What "done" looks like

- All 8 routes navigable
- Light + dark mode work end-to-end
- Every component in the table above has at least one usage
- `ng build` clean, no console errors / warnings in the browser
- Lighthouse a11y ≥ 95 on the dashboard
- Screenshots taken for the docs site
- Wired into `.github/workflows/deploy.yml` matrix and live on Vercel under `switchboard-*.vercel.app`

## Next session, where to start

1. **Scaffold the app**: `cd examples && ng new switchboard --routing --standalone --skip-git --style=less --strict --inline-style=false`
2. **Add NG-ZORRO**: `cd switchboard && ng add ng-zorro-antd` (pick "Yes" for icons, "Yes" for custom theme, locale `en_US`, no template)
3. **Verify install**: `npm run start` and confirm the placeholder Welcome page renders without console errors
4. **Commit Phase 0 scaffold**: `feat(examples): Scaffold switchboard foundation with NG-ZORRO and LESS theming`
5. Open `examples/switchboard/PLAN.md` (this file) for the Phase 0 shell checklist and start building.

If `ng add ng-zorro-antd` ever conflicts with the project's Angular version, follow the [skill's setup.md](../../skills/ng-zorro-developer/references/setup.md) manual-install path instead. The skill's directions are the source of truth, this PLAN is downstream of them.
