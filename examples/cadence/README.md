# Cadence

A reference Angular application that validates the [`angular-material-developer`](../../skills/angular-material-developer) skill. Cadence is a scheduling and booking app for a shared office: meeting rooms and bookable people on a calendar with day / week / month / agenda views, drag-to-create and drag-to-move bookings, a stepper booking wizard with conflict detection, and RRULE-style recurring events with per-instance exceptions.

**Status:** Plan only. Not yet scaffolded. See [PLAN.md](./PLAN.md).

The point of this app is not the app itself, it's that building it proves the skill is correct **on a shape Roster did not cover**. Roster validated the form-heavy half of Material's moat (MatTable directory, tabbed profiles, dialogs, steppers). Cadence validates the calendar half: **MatDatepicker** in range mode with custom headers, **MatTimepicker** (Roster never touched it), an embedded **MatCalendar** mini month, **CDK DragDrop** in free-position grid mode with 15-minute snapping, **CDK Overlay** event peek cards positioned against grid cells, and a fully custom time-grid surface built from nothing but Material 3 tokens.

## The acid test

A recurring booking with exceptions must render identically across all four calendar views, and editing "this and following" must split the series without corrupting any of them. Recurrence expansion lives in one `ScheduleService` (backed by [`rrule`](https://www.npmjs.com/package/rrule)) that every view consumes, so if a view disagrees, either the service or the skill is wrong.

## Stack

- **Angular v21**, standalone, signals, zoneless
- **Angular Material v21**, Material 3 theming, light-first crisp white + deep teal
- **@angular/cdk**: DragDrop, Overlay, A11y
- **date-fns** + `@angular/material-date-fns-adapter`
- **rrule** for RFC 5545 recurrence semantics
- **idb** for local persistence (bookings / resources / settings), seeded with demo data
- **ngx-transforms** for `| initials` and `| timeAgo`

## Run locally

Not scaffolded yet. Once Phase 0 lands:

```sh
npm install
npm start
```

## Why this app exists

The skill ships green when this app builds and behaves. When Angular Material releases a new version, bump the dep here, rebuild, and whatever breaks gets diagnosed against the new API surface and fixed in [`skills/angular-material-developer/references/`](../../skills/angular-material-developer/references). Roster covers Material's form-and-table half; Cadence covers the calendar-and-drag half, and its custom grid stresses the theming reference on a surface Material doesn't ship a component for.
