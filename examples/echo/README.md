# Echo

A reference Angular application that validates the [`primeng-developer`](../../skills/primeng-developer) skill. Echo is a music player and library for a fictional streaming service, browse albums / artists / playlists, drag-drop the queue, tune the equalizer, scrub through a track with a waveform view, all wrapped in a persistent player shell.

**Status:** Plan only. Not yet scaffolded. See [PLAN.md](./PLAN.md).

The point of this app is not the app itself, it's that building it proves the skill is correct **on a shape Quanta Desk did not cover**. Quanta Desk validates dense-data-table PrimeNG (finance chrome, TreeTable, Editor). Echo validates media / entertainment PrimeNG: continuous controls (Slider as scrubber and volume, Knob as EQ), drag-driven reordering (OrderList and PickList as primary editing surfaces), rich cover-art surfaces (DataView, Galleria, Carousel), and a persistent player bar that lives across every route.

## Stack

- **Angular v22+** with standalone components, signals, control flow syntax, zoneless
- **PrimeNG v21** with `@primeuix/themes` (Aura preset, customized to a dark-first violet palette) + `@primeuix/styles`
- **Tailwind v4** with `tailwindcss-primeui`
- **PrimeIcons** + `@ng-icons/lucide` for transport glyphs
- **Chart.js** for the equalizer preview and listening-history bars
- **[ngx-transforms](https://www.npmjs.com/package/ngx-transforms)** for `| initials`, `| timeAgo`, `| truncate`
- **Reactive forms** for search, playlist create, settings
- **PlayerService** in signals as the single source of truth for playback state

## Pages

| Route | What it exercises |
|---|---|
| `/` (Home) | Carousel of featured playlists, DataView grids, Timeline of recently played, top charts Table |
| `/library` | Tabs (Songs / Albums / Artists / Playlists), virtual-scroll Table, ContextMenu, bulk Toolbar |
| `/album/:id` | Splitter (cover ⇆ tracklist), TreeTable credits expansion, Rating, SplitButton actions |
| `/artist/:id` | Tabs, monthly plays Chart, Timeline of milestones, DataView discography |
| `/playlist/:id` | OrderList drag-drop tracklist, Inplace title/description, add-tracks Drawer with PickList |
| `/now-playing` | Galleria multi-cover, big Slider scrubber, Terminal-style scrolling lyrics, Tabs |
| `/queue` | OrderList queue editor with sections (Now Playing / Next Up / Auto-Queue) |
| `/radio` | MegaMenu browse (Genre / Mood / Decade / Activity), DataView of gradient stations |
| `/search` | AutoComplete-driven, Tabs, mixed DataView with "Top result" featured Card |
| `/settings` | 7 tabs including a 5-Knob equalizer, MeterGroup storage, ConfirmDialog per-device sign-out |

## Player shell

Fixed bottom player bar on every route: current-track area (click → `/now-playing`), transport row (Shuffle · Prev · Play/Pause · Next · Repeat), Slider scrubber, volume Slider, queue Drawer trigger, device chooser Popover. Space toggles play/pause globally. Arrows for prev/next/vol. L to like.

## Run locally

Not scaffolded yet. Once Phase 0 lands:

```sh
npm install
npm start
```

Opens at http://localhost:4200. Hot-reloads on save.

## Why this app exists

The skill ships green when this app builds and looks right. When PrimeNG releases a new version, the workflow is:

1. Bump the dep in `package.json` here
2. `npm install && npm start && npm run build`
3. Whatever breaks gets diagnosed against the new API surface
4. Fix the affected reference file in [`skills/primeng-developer/references/`](../../skills/primeng-developer/references)
5. Re-run the build, when it's clean, the skill is back in sync

Quanta Desk covers PrimeNG's dense-data half. Echo covers the continuous-controls + media half. Together they exhaust the skill's coverage map.
