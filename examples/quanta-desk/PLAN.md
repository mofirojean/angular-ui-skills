# Quanta Desk, Build Plan

> **Status:** Plan. Not yet scaffolded. See "Next session: where to start" at the bottom.

A reference Angular application built with the `primeng-developer` skill. The point is not the app, the point is that **building this proves the skill is correct**. Every PrimeNG component the skill documents gets used here; anything that doesn't match docs → fix the skill, then keep going.

## What it is

**Quanta Desk**, a portfolio / trading desk dashboard for a fictional retail brokerage. Watchlists, holdings table with tax-lot drilldown, performance charts, a trade-placement wizard, research notes, market news.

The narrative fits PrimeNG's strengths well: Table is its flagship and a brokerage UI exercises Table's hardest features (sort, freeze, virtual scroll, lazy load, inline edit, expansion). TreeTable, Charts, OrderList, Stepper, Editor, AutoComplete, DatePicker (range mode), Splitter, MegaMenu, Carousel, DataView, Galleria all fit naturally.

## Goals

1. **Validate the skill end-to-end.** Use every PrimeNG component the skill documents at least once. Wherever the skill is wrong, surface it now, not after publishing.
2. **Produce a portfolio-grade example.** Real interactions, real layouts, dark mode, keyboard nav, no console errors. Something we can point users at.
3. **Stay shippable in slices.** Each phase ends with a runnable app, no waterfall.

## Out of scope

- Auth (mock a logged-in user)
- Real market data (mock data in services, randomized within plausible ranges)
- SSR (later)
- Unit / E2E tests (this is manual visual + functional validation; the *skill* is what we're testing, not the app)
- Real trade execution (the trade wizard ends with a toast, no backend)

## Tech stack

- **Angular**, latest stable (v21+). Reactive Forms per project preference. Signal Forms moves in when Angular v22 ships stable.
- **PrimeNG v21**, install via the skill's `setup.md` instructions (also a meta-validation).
- **Aura preset** from `@primeuix/themes`. Dark mode via class selector aligned with Tailwind.
- **Tailwind v4**, with `tailwindcss-primeui` plugin and `cssLayer` enabled.
- **PrimeIcons** for component icons.
- **Chart.js**, PrimeNG's `<p-chart>` wraps it; install per docs.
- No additional state library, signals + services only.

## Pages

### 1. Dashboard (`/`)
Landing snapshot. The first thing a user sees.
- 4 KPI **Cards**: Portfolio value, Day P/L, Cash, Buying power
- "Performance" **Chart** (line, multi-period via DatePicker range)
- "Top movers" **Table** (5 rows, sortable, link to holding detail)
- "Market news" **Carousel** with category chips
- **Skeleton** placeholders while data loads (400ms fake delay)
- **MeterGroup** for sector allocation breakdown

### 2. Holdings (`/holdings`)
The flagship Table page.
- **Filters bar**: ticker search (**AutoComplete**), sector **Select**, status **SelectButton** (All / Long / Short)
- **Table**: ticker, name, quantity, avg cost, market value, day change %, total P/L. Sortable (multi), filterable, paginated, frozen ticker column, resizable columns, inline-editable target weight column.
- Row expansion → **TreeTable** below showing tax lots for that holding
- Right-click row → **ContextMenu** (Buy more, Sell, Set price alert, Add note)
- Row Dropdown overflow menu (same actions; ContextMenu duplicate for discoverability)
- "Add holding" → opens **Drawer** with a form
- Bulk select with checkbox column + bulk **Toolbar** (Sell all, Tag, Export)

### 3. Holding detail (`/holdings/:ticker`)
- **Splitter** layout: left = chart + key stats, right = research panel
- Left: Performance **Chart** with timeframe **Tabs** (1D / 1W / 1M / YTD / 1Y / 5Y), DatePicker for custom range, fundamentals **Card** grid
- Right (Tabs): Overview · Tax Lots (TreeTable) · Research Notes (**Editor**) · Documents (**Galleria** for PDF/img previews) · Alerts (toggle list)
- Header **Breadcrumb** + ticker, **Tag**s for sector / risk badge

### 4. Watchlist (`/watchlist`)
- Two **OrderList**s side-by-side or a **PickList** between "All instruments" and "My watchlist"
- **DataView** grid/list switcher below for each watched ticker as a card
- Per-card sparkline **Chart**
- **AutoComplete** at the top for adding tickers
- Bulk reorder via drag-drop

### 5. Trade (`/trade`)
- **Stepper** wizard (linear): 1) Instrument (AutoComplete + sector summary card), 2) Side (SelectButton Buy/Sell) + Order type (Select: market / limit / stop), 3) Size (InputNumber, Slider %, percent of cash visual), 4) Review + confirm (**ConfirmDialog**)
- Each step has a Reactive Forms group
- Final submit → **Toast** success + redirect to /trades

### 6. Trades (`/trades`)
- Filterable Table: date range (**DatePicker** range), instrument (AutoComplete), side (SelectButton), status (MultiSelect)
- Row click → **Sheet**-like detail (use **Dialog** with `position="right"` or `<p-drawer>`)
- Lazy loading + virtual scroll for many rows
- **Paginator** standalone for jump-to-page

### 7. Research (`/research`)
- **MegaMenu** at top, browse by sector / theme / region
- DataView of research notes (cards), filterable by tag
- Editor in a Dialog to compose a new note
- **Galleria** previewing PDF / image attachments
- **Carousel** of featured analyst picks

### 8. Settings (`/settings`)
- **Tabs**: Profile · Trading preferences · Notifications · API keys · Billing
- **Profile**: Every remaining form control the skill documents that we haven't used yet (Password, ColorPicker, Knob, Rating, ToggleSwitch, RadioButton, Textarea, etc.)
- **Trading prefs**: SelectButton for default order type, Slider for risk tolerance, Checkbox for confirm-before-submit
- **Notifications**: grid of ToggleSwitch per channel × event matrix
- **API keys**: Table with Tag for environment + InputMask for key display + ConfirmDialog before revoke
- **Billing**: ProgressBar for usage, Card with current plan, MeterGroup for cost breakdown

### 9. 404
- **Empty** state with "Back to dashboard" Button

## Global shell

- **Drawer** (off-canvas on mobile, sticky on desktop), primary nav, Ctrl/⌘+B to collapse
- **Header (Toolbar)**:
  - Start: app logo + Breadcrumb
  - Center: global **AutoComplete** search
  - End: Cmd+K command palette trigger, notifications **Badge**, **Avatar** with **Menu** dropdown
- **MegaMenu** below the Toolbar on the Research page only (Markets browse)
- **Toast** mounted at app root for action confirmations
- **ConfirmDialog** mounted at app root for destructive actions
- **Tooltip** on every icon-only button
- Dark mode toggle in header (theme.options.darkModeSelector aligned with Tailwind)

## Coverage map

| Category | Component | Where it lives |
|---|---|---|
| Form | AutoComplete | Global search, ticker pickers, Trade step 1 |
| Form | Button | everywhere |
| Form | CascadeSelect | Settings, asset-class cascade |
| Form | Checkbox | Filters, settings |
| Form | ColorPicker | Settings, chart color overrides |
| Form | DatePicker | Trade history filters, performance range |
| Form | Editor | Holding detail → research notes |
| Form | FloatLabel | wraps inputs in forms |
| Form | IconField | search inputs |
| Form | IftaLabel | alternative label style demoed in Settings |
| Form | InputMask | API keys, account number display |
| Form | InputNumber | Trade size, settings |
| Form | InputOtp | Confirm trade with 2FA in step 4 |
| Form | InputText | every text input |
| Form | Knob | Settings, risk score visualizer |
| Form | Listbox | Settings, market presets |
| Form | MultiSelect | Trades filter |
| Form | Password | Settings → API keys form |
| Form | RadioButton | Settings, theme preference |
| Form | Rating | Research note, analyst confidence |
| Form | Select | Filters, settings |
| Form | SelectButton | Side picker, period switcher |
| Form | Slider | Trade size %, settings |
| Form | Textarea | Research note short form |
| Form | ToggleButton | Settings, theme manual override |
| Form | ToggleSwitch | Notifications, every on/off setting |
| Form | TreeSelect | Settings, sector hierarchy picker |
| Button | Button | everywhere |
| Button | SpeedDial | Mobile FAB for "place trade" |
| Button | SplitButton | Order actions (Save / Save as alert / Save as default) |
| Overlay | ConfirmDialog | Destructive confirms (revoke API key, sell all) |
| Overlay | ConfirmPopup | Inline confirms (delete note) |
| Overlay | Dialog | Trade confirm, new research note |
| Overlay | Drawer | "Add holding" form, mobile sidebar |
| Overlay | DynamicDialog | "Edit holding" via DialogService |
| Overlay | Popover | Chart annotation tools, advanced filters |
| Overlay | Toast | All action confirmations |
| Overlay | Tooltip | every icon-only button |
| Layout | Accordion | Settings sections |
| Layout | BlockUI | Trade wizard during submit |
| Layout | Card | KPI tiles, fundamentals, news items |
| Layout | Divider | Section separators |
| Layout | Fieldset | Settings groupings |
| Layout | Panel | Holding detail side widgets |
| Layout | Scroller | Long instrument lists in watchlist |
| Layout | ScrollTop | Long research feed |
| Layout | Splitter | Holding detail (chart ⇆ research) |
| Layout | Stepper | Trade wizard |
| Layout | Tabs | Holding detail, settings, period switcher |
| Layout | Toolbar | App header, bulk-action toolbar on holdings |
| Display | Avatar | Header user, analyst bylines |
| Display | Badge | Notifications, unread research alerts |
| Display | Chip | Active filters, tags on research notes |
| Display | Image | Research attachments |
| Display | Inplace | Inline rename of watchlists |
| Display | Message | Inline form errors, page banners |
| Display | MeterGroup | Sector allocation, usage on Settings |
| Display | OverlayBadge | Avatar with unread count |
| Display | ProgressBar | Trade submitting, usage on Settings |
| Display | ProgressSpinner | Inline async indicators |
| Display | Ripple | Buttons (global enable via providePrimeNG) |
| Display | Skeleton | Loading states |
| Display | Tag | Status pills on holdings, sectors, risk |
| Display | Terminal | Settings → Diagnostics page (small) |
| Data | Carousel | Market news strip on Dashboard |
| Data | DataView | Watchlist cards (grid/list switch) |
| Data | Galleria | Research attachments preview |
| Data | OrderList | Watchlist reordering |
| Data | Paginator | Trades table standalone |
| Data | PickList | Watchlist add/remove |
| Data | Table | Holdings, Trades, Top movers |
| Data | Timeline | Holding detail → activity history |
| Data | Tree | Settings → sector hierarchy |
| Data | TreeTable | Holdings tax-lot drilldown |
| Menu | Breadcrumb | Header path |
| Menu | ContextMenu | Right-click holdings row |
| Menu | Dock | Optional: mobile-style action launcher (small page) |
| Menu | MegaMenu | Research page browse |
| Menu | Menu | Avatar dropdown |
| Menu | MenuBar | Optional secondary nav |
| Menu | PanelMenu | Settings sidebar |
| Menu | TieredMenu | Trades export menu (CSV / XLSX / PDF / JSON with sub-options) |
| Chart | Chart | Performance, sparklines, allocation pie |

## Build phases

Small slices. Each phase ends runnable + committable.

### Phase 0, Foundation
1. `cd examples` → `ng new quanta-desk --routing --style=css --ssr=false --skip-tests`
2. Move this PLAN.md into the new project root if `ng new` complains.
3. Follow `setup.md` from the skill: install `primeng @primeuix/themes @primeuix/styles primeicons` + `tailwindcss-primeui`.
4. Wire `app.config.ts` with `providePrimeNG({ theme: { preset: Aura, options: { darkModeSelector: '.dark', cssLayer: { name: 'primeng', order: 'base, theme, primeng, utilities' } } } })`.
5. Configure Tailwind v4 with the layer setup from theming.md.
6. Generate a Button somewhere visible and verify it renders themed.
7. **Validation gate:** every step above came from the skill. If anything went sideways, fix the skill before continuing.

### Phase 1, Shell + routing
Sidebar Drawer + header Toolbar + main outlet. Route stubs for all 9 pages. Theme toggle. Mock user in header dropdown. Toast + ConfirmDialog mounted at root.

### Phase 2, Dashboard
KPI Cards, performance Chart, Top Movers Table, Market News Carousel, MeterGroup sector allocation. Skeleton loaders during simulated load.

### Phase 3, Holdings (list)
Big-Table page: TanStack-style features, multi sort, frozen column, resizable columns, inline edit (target weight), row expansion → tax-lot TreeTable, ContextMenu + row Dropdown overflow, AutoComplete + Select + SelectButton filter bar.

### Phase 4, Holding detail
Splitter layout. Chart + period Tabs + DatePicker range on left. Tabs panel on right with Overview, Tax Lots (TreeTable), Research Notes (Editor in Dialog), Documents (Galleria), Alerts (ToggleSwitch list). Breadcrumb + Tag in header.

### Phase 5, Watchlist + Trade wizard
PickList for watchlist management; DataView grid/list switcher. Sparkline Chart per card. Stepper-based Trade wizard with multi-form-group Reactive Forms, InputOtp on confirm, BlockUI during submit, ConfirmDialog before commit.

### Phase 6, Trades + Research
Trades Table with DatePicker range + MultiSelect + AutoComplete filters, virtual scroll, Paginator. Row → DynamicDialog detail. Research page with MegaMenu, DataView cards, Editor in Dialog for new notes, Galleria attachments, TieredMenu for export.

### Phase 7, Settings
All Tabs: Profile, Trading prefs, Notifications, API keys, Billing. Every remaining form control we haven't used yet lives here (Password, ColorPicker, Knob, Rating, RadioButton, Textarea, IftaLabel, etc.).

### Phase 8, Polish
- Command palette (Cmd+K) using DynamicDialog + AutoComplete
- Empty / loading / error states everywhere
- Keyboard shortcuts visible (Kbd hints if available, otherwise styled `<kbd>`)
- Mobile responsive (Drawer collapse, responsive Table)
- Accessibility sweep: Tab order, focus rings, screen-reader smoke test (see accessibility.md)
- Dark mode pass on every page

## Definition of done

- Every component in the coverage map used at least once
- Dark mode works on every page
- Cmd+K palette navigates and runs actions
- No console errors in any route
- Lighthouse a11y ≥ 95
- A 30-second demo recording exists for the README

## Validation loop (the whole reason this exists)

For every component used:
1. Open the skill's reference file (e.g. `references/overlays.md` for Dialog).
2. Copy the canonical example structure into the app.
3. Build. If anything compiles wrong or behaves wrong → **the skill is wrong**, fix it before the app.

Don't paper over skill bugs in the app. The app is the test.

## Next session: where to start

```sh
cd "D:\Projects\Open Source\angular-ui-skills\examples"
# Tell Claude: "start Phase 0 of the Quanta Desk plan"
```

Claude should:
1. Read `examples/quanta-desk/PLAN.md` (this file)
2. Read the skill's `setup.md` and `theming.md`
3. Begin Phase 0, scaffold the Angular app, install PrimeNG, wire `providePrimeNG`, get the dev server up.

Each phase is its own commit (or PR). Don't try to land the whole app in one go.
