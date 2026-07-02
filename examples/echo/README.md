# Echo

A reference Angular application that validates the [`primeng-developer`](../../skills/primeng-developer) skill. Echo is a real, local-first music player: drop MP3 / FLAC / WAV / OGG / M4A files onto it and they're imported, tag-parsed, decoded, waveform-analysed, and stored in IndexedDB. Click a track and it plays through a real Web Audio graph with a 5-band EQ. Browse the library by album / artist / playlist, drag-drop to build queues, scrub through a real canvas-rendered waveform, all wrapped in a persistent player shell.

**Status:** Plan only. Not yet scaffolded. See [PLAN.md](./PLAN.md).

The point of this app is not the app itself, it's that building it proves the skill is correct **on a shape Quanta Desk did not cover**. Quanta Desk validates dense-data-table PrimeNG (finance chrome, TreeTable, Editor). Echo validates media / entertainment PrimeNG under real load: **Slider** as an audio scrubber updated 10x/sec from the actual `<audio>.currentTime`, **Knob** wired live to real `BiquadFilterNode` gains, **OrderList** and **PickList** as primary drag-drop editing surfaces that mutate real playback order, **Galleria** showing real cover art extracted from ID3 APIC frames, **FileUpload** driving a real client-side import pipeline (parse tags → decode PCM → downsample peaks → write to IndexedDB).

## Stack

### UI

- **Angular v22+** with standalone components, signals, control flow syntax, zoneless
- **PrimeNG v21** with `@primeuix/themes` (Aura preset, customized to a dark-first violet palette) + `@primeuix/styles`
- **Tailwind v4** with `tailwindcss-primeui`
- **PrimeIcons** + `@ng-icons/lucide` for transport glyphs
- **Chart.js** for the EQ frequency-response preview and listening-history bars
- **[ngx-transforms](https://www.npmjs.com/package/ngx-transforms)** for `| initials`, `| timeAgo`, `| truncate`, `| duration`
- **Reactive forms** for search, playlist create, settings

### Audio + storage

- **HTMLAudioElement** → **Web Audio graph**: `MediaElementSource → GainNode → 5× BiquadFilterNode (60 Hz / 250 Hz / 1 kHz / 4 kHz / 12 kHz) → AnalyserNode → destination`
- **[`music-metadata-browser`](https://www.npmjs.com/package/music-metadata-browser)** for ID3 / Vorbis / MP4 / FLAC tag extraction at import
- **[`idb`](https://www.npmjs.com/package/idb)** for IndexedDB (tracks / blobs / covers / playlists / plays / settings stores)
- **OfflineAudioContext** for one-time waveform-peak generation per track (cached)
- **File System Access API** (progressively enhanced), drag-drop or `<input type="file">` as fallback
- **Media Session API** for OS-level media controls

## Pages

| Route | What it exercises |
|---|---|
| `/` (Home) | Empty-state FileUpload drop zone (first run), then DataView / Carousel / Timeline of the imported library |
| `/import` | Full-height FileUpload + progress Table (filename, parsed metadata as it lands, per-file ProgressBar, status Tag) |
| `/library` | Tabs (Songs / Albums / Artists / Playlists), virtual-scroll Table against IndexedDB, ContextMenu, bulk Toolbar |
| `/album/:id` | Splitter (cover ⇆ tracklist), TreeTable credits expansion, Rating, SplitButton actions |
| `/artist/:id` | Tabs, monthly plays Chart from the `plays` store, Timeline of release years, DataView discography |
| `/playlist/:id` | OrderList drag-drop tracklist, Inplace title/description, add-tracks Drawer with PickList |
| `/now-playing` | Galleria for the cover, canvas waveform scrubber drawn from cached peaks, transport, Info Tabs |
| `/queue` | OrderList queue editor (Now Playing / Next Up / Auto-Queue sections) |
| `/browse` | MegaMenu facets (Genre / Decade / Year / Format / Bit rate) over the local library |
| `/search` | AutoComplete-driven substring search over LibraryService signals, Tabs, "Top result" featured Card |
| `/settings` | 6 tabs including live-wired 5-Knob EQ, real `navigator.storage.estimate()` MeterGroup, watched-folder Table |

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

Quanta Desk covers PrimeNG's dense-data half. Echo covers the continuous-controls + media half, and unlike Quanta Desk it plays real audio, so any component whose behaviour depends on continuous state (Slider, Knob, ProgressBar) gets stressed against real timing, not a mocked timer.
