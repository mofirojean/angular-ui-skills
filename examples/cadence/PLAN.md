# Cadence, Build Plan

> **Status:** Plan. Not yet scaffolded. See "Next session: where to start" at the bottom.

A reference Angular application built with the `angular-material-developer` skill. The point is not the app, the point is that **building this proves the skill is correct on a shape Roster did not cover**. Roster validated the form-heavy half of Material's moat (MatTable directory, tabbed profiles, dialogs, steppers, form fields at depth). Cadence validates the **calendar half**: MatDatepicker and MatTimepicker at depth, a custom time-grid calendar built on Material's design tokens, CDK Drag-Drop as the primary event-manipulation surface, and recurring-event rendering that has to stay consistent across four different view projections of the same data model.

## What it is

**Cadence**, a scheduling and booking app for a shared office: meeting rooms and bookable people (coaches, IT support, a photographer). Browse availability on a calendar that renders day / week / month / agenda views, drag on the time grid to create a booking, drag an existing booking to move it, resize to extend it. Book through a stepper wizard (what → when → who → review) with real conflict detection. Recurring bookings follow RRULE-style rules (every weekday, every 2nd Tuesday, monthly on the 15th) with per-instance exceptions ("edit this occurrence / this and following / all"). Everything persists locally so the calendar survives reloads.

## Goals

1. **Validate the skill on calendar-shaped UI.** A custom time grid + Material date/time pickers + CDK drag-drop exercise Angular Material on a layout that isn't a form or a table.
2. **Cover the Material/CDK surface Roster didn't lean on.** MatDatepicker range selection and custom header, MatTimepicker, `MatCalendar` embedded as a mini month picker, CDK DragDrop free positioning on a grid (not list reorder), CDK Overlay for event peek popovers, MatBottomSheet for mobile event details, MatButtonToggle as the view switcher.
3. **Pass the acid test:** a recurring event with exceptions renders identically in day, week, month, and agenda views, and editing "this and following" splits the series without corrupting any view.
4. **Stay shippable in slices.** Each phase ends with a runnable app, no waterfall.

## Out of scope

- Auth and multi-user presence (single local user, attendees are mock people)
- Backend, everything persists in IndexedDB via `idb`, seeded with demo data on first run
- Timezones (one implicit local timezone; the model stores ISO strings)
- Email / push notifications, external calendar sync (ICS import maybe later, not v1)
- SSR, unit / E2E tests (manual + headless-Chrome validation, the *skill* is what we're testing)

## Tech stack

- **Angular v21**, standalone components, signals, control flow syntax, zoneless
- **Angular Material v21** with Material 3 theming (`mat.theme` with a custom palette), light-first
- **@angular/cdk**: DragDrop (grid event move/resize/create), Overlay (event peek card), A11y (focus trap in wizard)
- **date-fns** + **@angular/material-date-fns-adapter** as the DateAdapter, all date math through date-fns
- **[`rrule`](https://www.npmjs.com/package/rrule)** for recurrence expansion (RFC 5545 semantics without hand-rolling edge cases)
- **[`idb`](https://www.npmjs.com/package/idb)** for persistence (bookings / resources / settings stores), same wrapper Echo uses
- **[ngx-transforms](https://www.npmjs.com/package/ngx-transforms)** for `| initials` on people avatars and `| timeAgo` on booking activity
- **Reactive forms** throughout the wizard and settings

### The calendar grid (this is what makes Cadence a real test)

Material ships no calendar-grid component, and that's the point: the skill has to prove Material's tokens, typography, and density system can carry a fully custom surface.

- **Month view**: CSS grid of day cells, event chips with overflow "+3 more" popover (CDK Overlay)
- **Week / day views**: time-gutter grid (30-min rows), events absolutely positioned by start/duration, overlap resolution by column packing
- **Drag interactions** via CDK DragDrop: drag empty grid to create (ghost preview snapping to 15-min increments), drag chip to move, drag bottom edge to resize
- **Agenda view**: grouped MatList by day, virtual-scrolled
- **Recurrence expansion** happens in a `ScheduleService`: rrule expands a series into concrete instances for the visible range, exceptions overlay, all four views consume the same expanded list

## Visual identity

Light-first, calm, airy. The fleet already has dark noir (Quanta Desk), dark violet (Echo), warm cream (Apex), and neutral light (Roster, Switchboard). Cadence goes **crisp white with a deep teal accent**, generous whitespace, hairline grid borders, event chips as the only saturated elements (per-resource hues). Dark mode exists via Material's color-scheme support but light is the hero.

## Pages

### 1. Calendar (`/calendar`, default route)
- **Toolbar**: today button, prev/next chevrons, current-range label, **MatButtonToggle** view switcher (Day / Week / Month / Agenda), "New booking" raised button
- **Sidebar**: embedded **MatCalendar** mini month (syncs with main view), resource filter **MatChips** (rooms + people, per-resource color dots), density **MatSlideToggle**
- **Main grid**: the custom calendar surface described above
- Click an event → **CDK Overlay** peek card (title, time, resource, attendees, edit / delete). On mobile the peek becomes a **MatBottomSheet**
- Empty day-cell double-click or drag → opens the booking wizard pre-filled

### 2. Booking wizard (MatDialog + MatStepper)
- **Step 1 What**: title, booking type (**MatButtonToggle**: meeting / equipment / person), description, color
- **Step 2 When**: **MatDatepicker** (with range mode for multi-day), **MatTimepicker** start + end, duration presets (**MatChips**), recurrence editor (frequency **MatSelect**, interval, weekday toggles, ends after/on) with a live "next 5 occurrences" preview
- **Step 3 Who & where**: resource picker (**MatAutocomplete** over rooms/people), attendees (**MatChips** input), live conflict banner when the slot collides
- **Step 4 Review**: summary card, conflicts resolved check, confirm
- Editing a recurring instance first asks: this occurrence / this and following / entire series (**MatDialog** with **MatRadioGroup**)

### 3. Resources (`/resources`)
- **MatTabs**: Rooms · People
- Rooms: **MatTable** (name, capacity, floor, equipment MatChips, utilization bar), row click → side panel with that room's week strip
- People: card grid with `| initials` avatars, bookable hours, next-free indicator
- "Add resource" **MatDialog** with a reactive form

### 4. Bookings (`/bookings`)
- Flat upcoming-bookings **MatTable**: title, resource, when (with `| timeAgo` for relative), recurrence badge, status
- Filters: date range **MatDatepicker** range input, resource **MatSelect**, search **MatFormField**
- Row actions: edit (reopens wizard), cancel occurrence, cancel series (**MatSnackBar** with undo)

### 5. Settings (`/settings`)
- Working hours (start/end **MatTimepicker**), week starts on (**MatSelect**), default duration (**MatSlider**), time-grid snap increment (**MatButtonToggle** 15/30/60), theme (**MatSlideToggle**), reset demo data (**MatDialog** typed-confirm)

### 6. 404
- Empty state with "Back to calendar" button

## Coverage map

| Area | Component | Where it lives |
|---|---|---|
| Date/time | MatDatepicker (single + range) | Wizard step 2, bookings filter |
| Date/time | MatTimepicker | Wizard step 2, settings working hours |
| Date/time | MatCalendar (embedded) | Sidebar mini month |
| Layout | MatSidenav | Shell (sidebar collapses on mobile) |
| Layout | MatToolbar | Calendar toolbar, shell header |
| Layout | MatTabs | Resources page |
| Nav | MatButtonToggle | View switcher, snap increment, booking type |
| Form | MatAutocomplete | Resource picker |
| Form | MatChips (+ input) | Resource filters, attendees, duration presets, equipment |
| Form | MatSelect, MatRadioGroup, MatSlider, MatSlideToggle | Wizard + settings |
| Overlay | MatDialog | Wizard, edit-series chooser, add resource, typed reset |
| Overlay | MatBottomSheet | Mobile event peek |
| Overlay | MatSnackBar | Cancel with undo, save confirmations |
| Overlay | CDK Overlay | Event peek card, "+3 more" popover |
| Data | MatTable | Rooms, bookings list |
| Data | MatList (virtual) | Agenda view |
| Interaction | CDK DragDrop | Create / move / resize events on the grid |
| A11y | CDK FocusTrap, LiveAnnouncer | Wizard, drag announcements |
| Feedback | MatBadge, MatTooltip, MatProgressBar | Conflict counts, chip hints, utilization |

## Build phases

Small slices. Each phase ends runnable + committable.

### Phase 0, Foundation
Scaffold with `ng new cadence` (Angular v21, standalone, zoneless). `ng add @angular/material` with M3 custom teal theme. Wire date-fns adapter. Render a themed MatButton + MatDatepicker on the root route to prove the wiring. Validation gate: every step from the skill's setup reference.

### Phase 1, Shell + routing
MatSidenav shell (mini sidebar, mobile overlay mode), MatToolbar header, route stubs for all pages, theme toggle, MatSnackBar mounted.

### Phase 2, Domain model + ScheduleService + seed data
`Booking`, `Resource`, `RecurrenceRule`, `SeriesException` types. `idb` stores + seed script (8 rooms, 6 people, ~40 bookings including 6 recurring series). `ScheduleService.instancesFor(rangeStart, rangeEnd, resourceIds)` expands rrule series + applies exceptions, returns concrete instances. This service is the acid-test kernel, get it right before any view exists.

### Phase 3, Month view
Custom month grid, event chips, per-resource colors, "+N more" CDK Overlay popover, mini MatCalendar sync, resource filter chips.

### Phase 4, Week + Day views
Time-gutter grid, absolute event positioning, overlap column packing, now-indicator line, view switcher wired.

### Phase 5, Agenda view + event peek
Grouped virtual MatList agenda. CDK Overlay peek card on event click (all views), MatBottomSheet variant on mobile.

### Phase 6, Booking wizard
MatDialog + MatStepper, all four steps, conflict detection against ScheduleService, recurrence editor with live occurrence preview. Create lands in IndexedDB and appears in every view.

### Phase 7, Drag interactions
CDK DragDrop: drag-create on empty grid (15-min snap ghost), drag-move chips (across days in month view, across times in week/day), edge-resize. LiveAnnouncer announcements for every drop.

### Phase 8, Recurring editing + exceptions
Edit/delete choosers (this / this-and-following / all), series splitting, exception records. The acid test gets verified here across all four views.

### Phase 9, Resources + Bookings pages
Both list pages, add-resource dialog, cancel-with-undo SnackBar.

### Phase 10, Settings + polish
Settings tab set, working-hours shading on the grid, keyboard navigation on the grid (arrow keys move focus cell, Enter creates), a11y sweep with Lighthouse target ≥ 95, empty/loading states, mobile pass, deploy to Vercel + CI matrix entry.

## Definition of done

- Every component in the coverage map used at least once
- The acid test passes: a recurring series with two exceptions renders identically across Day / Week / Month / Agenda, and "this and following" edits split cleanly
- Drag-create, drag-move, and resize all work with keyboard-visible focus and LiveAnnouncer output
- Conflict detection blocks double-booking a resource in the wizard and during drags
- Light + dark mode on every page, Lighthouse a11y ≥ 95, no console errors
- Deployed with a docs-site card and CI deploy-matrix entry

## Validation loop (the whole reason this exists)

For every Material/CDK component used:
1. Open the skill's reference file for it.
2. Copy the canonical example structure into the app.
3. Build and run. If anything compiles wrong or behaves wrong, **the skill is wrong**, fix it before the app.

Don't paper over skill bugs in the app. The app is the test.

Extra validation this app provides beyond Roster:
- **MatDatepicker** in range mode with a custom header and min/max policies, not just a single-date form field
- **MatTimepicker** exercised at all (Roster never touched it)
- **CDK DragDrop** in free-position grid mode with snapping, not list reorder
- **CDK Overlay** positioned against grid cells, flip/push behavior at viewport edges
- **A custom surface built purely from M3 tokens**, proving the theming reference covers non-component UI
- **Zoneless + heavy pointer interaction**, drags at 60fps under `provideZonelessChangeDetection()`

## Next session: where to start

```sh
cd "D:\Projects\Open Source\angular-ui-skills\examples"
# Tell Claude: "start Phase 0 of the Cadence plan"
```

Claude should:
1. Read `examples/cadence/PLAN.md` (this file)
2. Read the angular-material-developer skill's setup + theming references
3. Begin Phase 0, scaffold, add Material with the teal M3 theme, wire the date-fns adapter, get the dev server up

Each phase is its own commit. Don't try to land the whole app in one go.
