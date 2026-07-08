# Echo

![Echo in light mode](https://raw.githubusercontent.com/mofirojean/angular-ui-skills/master/docs/public/projects/echo-light-mode.png)

A reference Angular application that validates the [`primeng-developer`](../../skills/primeng-developer) skill. Echo is a real, local-first music player: drop MP3 / FLAC / WAV / OGG / M4A files onto it and they're imported, tag-parsed, decoded, waveform-analysed, and stored in IndexedDB. Click a track and it plays through a real Web Audio graph with a live 5-band EQ. Browse the library by album / artist / playlist, drag-drop to reorder the queue, scrub through a canvas-rendered waveform, all wrapped in a persistent player shell.

**Status:** Built and deployed. **Live demo:** <https://echo-neon-three.vercel.app>

The point of this app is not the app itself, it's that building it proves the skill is correct **on a shape Quanta Desk did not cover**. Quanta Desk validates dense-data-table PrimeNG (finance chrome, TreeTable, Editor). Echo validates media / entertainment PrimeNG under real load: **Slider** as an audio scrubber driven by the actual `<audio>.currentTime`, **Knob** wired live to real `BiquadFilterNode` gains, **OrderList** as the primary drag-drop editing surface that mutates real playback order, **FileUpload** driving a real client-side import pipeline (parse tags → decode PCM → downsample peaks → write to IndexedDB), **Table** with virtual scroll against an IndexedDB-backed dataset that grows as you import.

## Stack

### UI

- **Angular v21** with standalone components, signals, control flow syntax, zoneless
- **PrimeNG v21** with `@primeuix/themes` (Aura preset, customized to a dark-first violet palette) + `@primeuix/styles`
- **Tailwind v4** with `tailwindcss-primeui`
- **PrimeIcons** for every glyph
- **[ngx-transforms](https://www.npmjs.com/package/ngx-transforms)** for `| initials` on artist avatars
- **Reactive forms** for playlist create and save-queue-as-playlist

### Audio + storage

- **HTMLAudioElement** → **Web Audio graph**: `MediaElementSource → GainNode → 5× BiquadFilterNode (60 Hz / 250 Hz / 1 kHz / 4 kHz / 12 kHz) → AnalyserNode → destination`
- **[`music-metadata`](https://www.npmjs.com/package/music-metadata)** for ID3 / Vorbis / MP4 / FLAC tag + cover extraction at import
- **[`idb`](https://www.npmjs.com/package/idb)** for IndexedDB (tracks / blobs / covers / playlists / plays / settings stores)
- **OfflineAudioContext** for one-time waveform-peak generation per track (~2000 min/max pairs, cached)
- **File System Access API** folder import on Chromium, drag-drop or `<input type="file">` everywhere else
- **Media Session API** for OS-level media controls (headphone buttons, lock screen, SMTC)
- **PWA**: installable with an offline shell via the Angular service worker

## Pages

| Route | What it exercises |
|---|---|
| `/` (Home) | Empty-state FileUpload drop zone (first run), then Recently-added album grid + top-artists strip from live library signals |
| `/import` | FileUpload advanced drop zone + progress Table (filename, parsed metadata as it lands, per-file ProgressBar, status Tag, per-row remove) |
| `/library` | Tabs (Songs / Albums / Artists / Playlists), virtual-scroll Table against IndexedDB, filter bar (search + genre Select + sort SelectButton), ContextMenu, create-playlist Dialog |
| `/album/:id` | Splitter (cover ⇆ tracklist), Tag chips, SplitButton actions, Breadcrumb, row ContextMenu |
| `/artist/:id` | Hero with initials avatar, Tabs (Overview / Discography), popular-tracks list, ToggleButton follow |
| `/playlist/:id` | OrderList drag-drop tracklist, Inplace title/description editing, add-tracks Drawer, delete ConfirmDialog |
| `/now-playing` | Blurred-backdrop immersive view, canvas waveform scrubber drawn from cached peaks, transport, Tabs (Up next / Info / Related) |
| `/queue` | OrderList queue editor where reorder mutates live playback order, save-as-playlist Dialog |
| `/browse` | MegaMenu facets (Genre / Decade / Format / Bit rate) as gradient station tiles over the local library |
| `/search` | Query-param-synced search over library signals, Tabs with counts, scored "Top result" Card |
| `/settings` | Tabs (Playback / Library / Storage / About): live-wired 5-Knob EQ with presets, typed-DELETE library reset, real `navigator.storage.estimate()` MeterGroup, AudioContext diagnostics |

## Player shell

Fixed bottom player bar on every route: current-track area with cover art (click → `/now-playing`), like ToggleButton persisted to IndexedDB, transport row (Shuffle · Prev · Play/Pause · Next · Repeat), Slider scrubber, volume Slider with mute. On mobile the sidebar collapses to a bottom tab bar and the player compresses to a single row.

Global keyboard: **Space** play/pause, **← →** prev/next, **↑ ↓** volume, **L** like, **Ctrl+K** command palette (navigate anywhere, play anything, toggle shuffle), **?** shortcut cheat sheet.

Lighthouse accessibility score: **100** (aria-live track announcements, visible focus rings, WCAG AA contrast in both themes).

## Run locally

```sh
npm install
npm start
```

Opens at http://localhost:4200. Import a few audio files from the Home drop zone and everything comes alive. The library persists in IndexedDB across reloads.

## Why this app exists

The skill ships green when this app builds and looks right. When PrimeNG releases a new version, the workflow is:

1. Bump the dep in `package.json` here
2. `npm install && npm start && npm run build`
3. Whatever breaks gets diagnosed against the new API surface
4. Fix the affected reference file in [`skills/primeng-developer/references/`](../../skills/primeng-developer/references)
5. Re-run the build, when it's clean, the skill is back in sync

Building Echo already fed three real corrections back into the skill: `styleClass` is deprecated for native `class`, `pTemplate` silently no-ops next to standalone component imports (use `#item` / `#content` template refs), and `NgOptimizedImage` rejects the `blob:` URLs a local-first app lives on. None of those produced a build error, they were caught because this app plays real audio in a real browser.

Quanta Desk covers PrimeNG's dense-data half. Echo covers the continuous-controls + media half, and unlike Quanta Desk it plays real audio, so any component whose behaviour depends on continuous state (Slider, Knob, ProgressBar) gets stressed against real timing, not a mocked timer.