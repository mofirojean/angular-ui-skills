# Echo, Build Plan

> **Status:** Plan. Not yet scaffolded. See "Next session: where to start" at the bottom.

A reference Angular application built with the `primeng-developer` skill. The point is not the app, the point is that **building this proves the skill is correct on a shape Quanta Desk did not cover**. Quanta Desk validated dense-data-table PrimeNG (finance chrome, sortable grids, Editor, TreeTable). Echo validates media / entertainment PrimeNG: continuous controls (Slider, Knob), drag-driven reordering (OrderList, PickList), rich cover-art surfaces (DataView, Galleria, Carousel), and a persistent player shell that lives across every route.

## What it is

**Echo**, a real, local-first music player that actually plays music. Drop MP3 / FLAC / WAV / OGG / M4A files onto the app and they're imported into the library, metadata (title / artist / album / year / genre / cover art) is extracted from the file's tags, waveform peaks are computed from the decoded PCM, and everything is persisted in IndexedDB so the library survives reloads. Click a track and it plays through a real Web Audio graph: HTMLAudioElement source → GainNode (volume) → 5-band BiquadFilterNode EQ → AnalyserNode (visualizer) → destination. Browse the library by album / artist / playlist. Fullscreen "Now Playing" with a real waveform scrubber drawn from the cached peaks. Drag-drop to build playlists and reorder the queue. Search across songs / artists / albums / playlists via a global AutoComplete.

The narrative fits PrimeNG's underused vocabulary from Quanta Desk: **Slider** graduates from a filter widget to the audio scrubber and volume rail, **Knob** becomes the EQ band control, **OrderList** and **PickList** move from a settings toy to the primary queue-editing surface, **Galleria** shows album art at full resolution, **Carousel** is featured playlists on the home page, **MegaMenu** browses by genre / mood / decade.

## Goals

1. **Validate the skill on media-shaped UI.** A persistent player shell + continuous audio controls exercise PrimeNG on a layout that isn't a data table.
2. **Cover the PrimeNG components Quanta Desk didn't lean on.** Specifically Slider (as scrubber, not filter), Knob (as EQ, not risk score), OrderList / PickList (as queue and playlist editors), Galleria (as album-art viewer), Carousel (as featured strip), Rating (as track/album rating), Terminal (as lyrics display in one mode).
3. **Produce a portfolio-grade demo.** Real feeling playback with a fake audio engine, working dark mode, keyboard shortcuts (space to play/pause, arrows for prev/next/vol), no console errors.
4. **Stay shippable in slices.** Each phase ends with a runnable app, no waterfall.

## Out of scope

- Auth (single-user local library, no accounts)
- Server-side storage. Everything is client-side, files live in the browser (IndexedDB blob store) or, on capable browsers, linked directly to a folder via the File System Access API.
- Streaming from URLs, DRM, licensing, catalog APIs (Spotify / Apple / Tidal). Local files only.
- Social features (following, sharing, comments), external identity, cloud sync.
- Radio in the "algorithmic station" sense. The Browse page is a filter view over the local library grouped by genre / decade / format tags read from ID3, no true recommendation engine.
- SSR (later, and largely moot for a client-side player)
- Unit / E2E tests (this is manual visual + functional validation, the *skill* is what we're testing)
- Native app packaging (Electron / Tauri). PWA only, installable via the browser but not shipped as a native binary.

## Tech stack

### UI layer

- **Angular v22+**, standalone components, signals, control flow syntax, zoneless via `provideZonelessChangeDetection()`
- **PrimeNG v21** with `@primeuix/themes` (Aura preset, customized to a dark-first cover-art-forward palette) + `@primeuix/styles`. Install via the skill's `setup.md`.
- **Tailwind v4** with `tailwindcss-primeui` and `cssLayer` enabled
- **PrimeIcons** for chrome icons; **Lucide** via `@ng-icons/lucide` for player controls where PrimeIcons lacks the exact glyph (play, pause, skip-forward, skip-backward, shuffle, repeat, volume variants)
- **Chart.js** for the equalizer preview curve and listening-history bars
- **[ngx-transforms](https://www.npmjs.com/package/ngx-transforms)** for `| initials`, `| timeAgo`, `| truncate`, `| duration`, dogfood the user's own library
- **Reactive forms** for search, playlist creation, settings

### Audio engine (this is what makes Echo real)

- **HTMLAudioElement** as the source node. The `<audio>` element is created once per playing track, wired to the AudioContext via `createMediaElementSource()`, then routed through the graph and finally to `context.destination`. Using `<audio>` (not `AudioBufferSourceNode`) means large files stream from disk rather than being loaded fully into memory.
- **Web Audio API graph** per playback session:
  `MediaElementSource → GainNode (master volume) → BiquadFilterNode × 5 (EQ: 60 Hz / 250 Hz / 1 kHz / 4 kHz / 12 kHz) → AnalyserNode (for the live visualizer) → context.destination`
- **[`music-metadata-browser`](https://www.npmjs.com/package/music-metadata-browser)** for extracting ID3v2 / Vorbis / MP4 / FLAC tags at import time (title, artist, album, year, genre, track number, cover art as Blob, duration, sample rate, bit rate)
- **Waveform peaks** computed once at import: decode the file with `OfflineAudioContext.decodeAudioData`, downsample the PCM into ~2000 min/max pairs, cache the peaks in IndexedDB. Rendering the waveform on the Now-Playing scrubber becomes a cheap canvas draw.
- **[`idb`](https://www.npmjs.com/package/idb)** (Jake Archibald's tiny wrapper) for IndexedDB access. Object stores: `tracks` (metadata + peaks), `blobs` (the audio file itself as a `Blob`), `covers` (extracted cover art as a `Blob`), `playlists`, `plays` (history), `settings`.
- **`URL.createObjectURL()`** on the stored `Blob` to feed `<audio>.src`. Blob URLs are revoked when a track leaves the current playback window to avoid the leak this pattern normally causes.
- **File System Access API** (progressively enhanced): when available (Chromium browsers), users can pick a folder once and Echo watches it. Fallback for Safari / Firefox is drag-drop or `<input type="file" multiple accept="audio/*">`.
- **Media Session API**: `navigator.mediaSession.metadata` + `setActionHandler` for OS-level media controls (headphone buttons, macOS Control Center, Chrome media notification, Windows SMTC)
- **Storage estimate**: `navigator.storage.estimate()` powers the Settings → Storage view with real numbers, not mocked

### State

- No state library, signals + services only:
  - `PlayerService`, playback state (current track, isPlaying, progress, duration, volume, shuffle, repeat, queue, history) all as signals; owns the `AudioContext` and the graph
  - `LibraryService`, tracks / albums / artists / playlists derived from the IndexedDB `tracks` store, exposed as signals; recomputes on import
  - `ImportService`, takes a `File[]` (from drag-drop, file input, or File System Access API), streams each through `music-metadata-browser`, decodes for peaks, writes to IndexedDB, emits per-file progress
  - `EqService`, owns the BiquadFilterNode chain, persists preset + band values

### Custom formatters

- Track duration `mm:ss` for < 1h, `h:mm:ss` past that (add to ngx-transforms as `| duration` if not already there)
- Bit rate `320 kbps` / sample rate `44.1 kHz` for the track-info popover
- File size (bytes → KB / MB / GB) for Settings → Storage per-file breakdown

## Visual identity

Dark-first. The album art is the visual centerpiece on every media page, so the chrome recedes:

- Background: near-black with a faint blue undertone (`#0b0d12` ish)
- Surface: one step lighter (`#151821`)
- Primary accent: electric violet or magenta, used sparingly on the play button, active nav item, and progress fill on the scrubber
- Muted text: cool grey; body text: soft off-white
- Album art casts a subtle blurred backdrop on the Now Playing view (uses the current track's dominant colour, extracted at mock-time and hardcoded per track)

Light mode exists but the default is dark. Toggle persists via the `dark` class on `<html>`.

## Pages

### 1. Home (`/`)
Landing page. Shaped around the local library, not a store front.
- **Empty-state view** (first run, no tracks imported yet): big centered drop zone using **FileUpload** in advanced mode (`accept="audio/*"`, `multiple`, folder-drop supported), a "Choose folder" **Button** for the File System Access API path, and a link to a small "supported formats" **Panel**
- **Populated view**:
  - "Recently added" **DataView** grid of albums (sorted by import timestamp) with grid / list toggle
  - "Recently played" **Timeline** with cover thumbnails on the left rail (from the `plays` store)
  - "Jump back in" **Carousel** of the top 6 albums by play count
  - "Your top artists" **DataView** row (circular avatars)
- Persistent header **FileUpload** in `mode="basic"` (upload icon) so import works from anywhere
- **Skeleton** placeholders while IndexedDB reads on cold start

### 1a. Import (`/import`), dedicated importer surface
Reachable from the Home empty state and from a header button. Renders even when tracks already exist.
- Full-height **FileUpload** advanced mode drop zone
- **Table** of "in progress" imports with columns: filename, size, extracted title / artist (as parsing completes), progress **ProgressBar** per row, status **Tag** (Queued / Parsing / Decoding peaks / Storing / Done / Failed), remove **Button**
- Summary strip at top: imported / failed / total, "Cancel all" and "Clear finished" **Button**s
- `ImportService` processes files with limited concurrency (say 3 in parallel) so the UI stays responsive on a 500-file drop

### 2. Library (`/library`)
The user's collection. Table-heavy.
- **Filters bar**: search **AutoComplete** (matches across tracks, artists, albums), genre **Select**, sort **SelectButton** (Recently added / A-Z / Artist / Play count)
- **Tabs**: Songs · Albums · Artists · Playlists · Downloaded
- **Songs** tab: **Table** with track, artist, album, duration, added, plays. Sortable, filterable, virtual-scrollable. Row hover reveals a play button in the first cell.
- **Albums** tab: **DataView** grid, click → `/album/:id`
- **Artists** tab: **DataView** grid of avatar-style circular cards, click → `/artist/:id`
- **Playlists** tab: **DataView** grid + a "Create playlist" **Card** as the first tile that opens a **Dialog** with a Reactive form (name, description, cover picker)
- Right-click any row / card → **ContextMenu** (Play, Add to queue, Add to playlist submenu, Go to artist, Go to album, Copy link, Remove from library)
- **Bulk select** on Songs table + **Toolbar** (Add to queue, Add to playlist, Remove, Export)

### 3. Album detail (`/album/:id`)
Cover-first layout.
- **Splitter** vertical: left = large **Image** cover + album meta (title, artist link, year, genre **Tag**s, duration, **Rating**), right = tracklist
- Left column: **Button** row (Play, Shuffle play, Add to library, Add to queue, More via **SplitButton**)
- Right column: **Table** of tracks, no visible header on mobile. Columns: #, title, plays, duration
- Row expansion → lyrics snippet + credits
- **ContextMenu** on rows (same as Library)
- **Breadcrumb** in the header (Library / Albums / [Album name])
- Below the fold: "More by this artist" **DataView** row + "Fans also like" **DataView** row

### 4. Artist (`/artist/:id`)
- Header **Toolbar**: hero image (blurred backdrop), artist name, monthly listeners, Play / Follow / More **SplitButton**
- **Tabs**: Overview · Discography · Related · About
- **Overview**: "Popular" Table (5 tracks), "Latest release" **Card**, "Featured on" DataView, monthly play **Chart** (bar, last 12 months)
- **Discography**: **DataView** grid of albums (grid/list) + **SelectButton** (Albums / Singles & EPs / Compilations)
- **Related**: DataView of related artists
- **About**: bio (formatted with `<p>`s + optional **Editor** in read-only mode for rich text), **Timeline** of career milestones
- Follow button uses **ToggleButton**

### 5. Playlist detail (`/playlist/:id`)
The heavy drag-drop page.
- Header: **Image** cover (editable via **FileUpload** on hover), title (editable **Inplace**), description (editable **Inplace** with **Textarea**), owner **Avatar**, track count, total duration, **ToggleButton** for public/private
- **Toolbar** actions: Play, Shuffle, Add tracks (opens **Drawer** with an **AutoComplete** search + PickList-style add), Sort by ▾ (**TieredMenu** with sort options), Download, Share (**ConfirmDialog** for a share link), More
- **OrderList** for the tracklist: drag to reorder, multi-select, remove via context, "Move to top / bottom" via the **OrderList** template controls
- Empty state: **Empty** with "Add tracks" **Button**

### 6. Now Playing (`/now-playing`)
Fullscreen immersive view. Reached by clicking the current-track area of the player bar.
- Full-bleed blurred backdrop of the current track's cover
- Center: large album art (**Galleria** in single-slide mode if the album has multiple cover variants, e.g. deluxe/vinyl)
- Below art: track title (marquee if long, use `| truncate` fallback), artist link, album link, **Rating**
- **Slider** scrubber the full width, timestamps on either side (`| duration`), buffering shown via **ProgressBar** underlay when the mock buffer state is loading
- Row of transport **Button**s: Shuffle (**ToggleButton**), Previous, Play/Pause (large primary), Next, Repeat (**ToggleButton** cycling Off / All / One)
- Secondary row: Volume **Slider** with a **Popover** speaker icon that opens output-device chooser, Queue button (opens Drawer), Devices (**Popover** with **Listbox**), More (**Menu**)
- **Tabs** below: Up next (**OrderList** trimmed to next 5) · Lyrics (**Terminal**-style monospace scroller synced to the scrubber, mock timing) · Related (DataView row of similar tracks)
- Keyboard: space play/pause, arrows prev/next/vol, L toggles like

### 7. Queue (`/queue`)
Standalone queue editor (also reachable from the player bar Drawer).
- **OrderList** of all queued tracks, drag to reorder, multi-select, remove
- Section headers: **Now Playing** · **Next Up** (user-queued) · **Auto-Queue** (algorithmic)
- **Toolbar**: Clear queue, Save as playlist (**ConfirmDialog** → **Dialog** with name input → **Toast** confirmation)
- Empty state: **Empty** with "Browse to add tracks" **Button**

### 8. Browse (`/browse`)
The old "Radio" page, repurposed as a filter view over the local library. No streaming, no algorithms, real ID3-tag-driven grouping.
- **MegaMenu** at top: Genre · Decade · Year · Format (MP3 / FLAC / WAV / OGG / M4A) · Bit rate bucket
- **DataView** grid of "stations", each a **Card** with a stylized gradient background labelled by the facet value ("Jazz", "1980s", "FLAC only", "> 256 kbps")
- Clicking a card fills the queue with every track in the library matching that facet (shuffled by default) and starts playback
- Facets are derived at runtime from `LibraryService` signals, if no tracks have a genre tag, the Genre section shows an **Empty** state instead of gradient tiles

### 9. Search (`/search`)
- Persistent **AutoComplete** in the header opens this route with the query pre-filled
- Results **Tabs**: All · Songs · Artists · Albums · Playlists · Lyrics
- **All** tab: mixed **DataView** with sections, "Top result" featured **Card**, then compact rows of songs / artists / albums
- Individual type tabs: full **Table** (Songs) or **DataView** (others)
- Empty state: **Empty** with recent searches list

### 10. Settings (`/settings`)
- **Tabs**: Profile · Playback · Library · Storage · Notifications · About
- **Profile**: display name (**InputText**), avatar (**FileUpload**), preferred output device (**Listbox** populated from `navigator.mediaDevices.enumerateDevices({kind: 'audiooutput'})`)
- **Playback**: crossfade duration (**Slider** 0-12s), gapless (**ToggleSwitch**), replay gain / normalization (**SelectButton** Off / Track / Album), pre-amp gain (**Slider** ±12 dB), equalizer (5-band **Knob** array wired live to the BiquadFilterNode chain + preset **Select** with Flat / Rock / Jazz / Classical / Bass Boost / Vocal / Custom), preview via a mini **Chart** (line, the frequency response actually computed from the current filter values)
- **Library**: watched folders **Table** (path, track count, last scanned, remove **Button**), "Add folder" **Button** (File System Access API), "Rescan all" **Button**, file-type include filter (**MultiSelect** of extensions), "Reset library" (**ConfirmDialog** with typed "DELETE" confirmation, wipes IndexedDB)
- **Storage**: real numbers from `navigator.storage.estimate()`, used vs free (**MeterGroup**), per-store breakdown blobs / covers / peaks / metadata (**ProgressBar** rows), largest tracks **Table** (top 20, with per-row delete), "Recompute peaks" **Button** (**ConfirmPopup**, regenerates the peaks cache), "Purge orphaned blobs" **Button**
- **Notifications**: **ToggleSwitch** stack for OS-level media session controls (show cover on lock screen, show controls in browser notification, keep playing when tab is hidden), plus per-event browser notifications toggle
- **About**: version, build hash, dependency versions (Angular / PrimeNG / Chart.js / music-metadata-browser), licenses (**Panel** with expand), a "Diagnostics" section with the current AudioContext state, sample rate, and a small **Terminal**-rendered log of the last N audio events (useful for debugging user reports)

### 11. 404
- **Empty** state with "Back to home" **Button**

## Persistent player shell

Every route (except a hypothetical onboarding) renders the app shell:

- **Sidebar Drawer** (collapsible, keyboard `Ctrl/⌘+B`): Home, Search, Your Library, Radio, ─── (**Divider**), user playlists list (scrollable), "New playlist" **Button**
- **Header (Toolbar)**:
  - Start: nav back / forward **Button**s, **Breadcrumb**
  - Center: global **AutoComplete** search (results dropdown navigates to `/search` on Enter)
  - End: **Avatar** with **Menu** dropdown (Profile, Settings, Sign out), theme toggle, notifications **Badge**
- **Main outlet** (scrollable, respects player-bar height below)
- **Player bar** (fixed bottom, ~72px tall):
  - Left: current-track area, clicking it navigates to `/now-playing`. Cover thumbnail + title (`| truncate`) + artist link + like **ToggleButton**
  - Center: transport buttons (Shuffle, Prev, Play/Pause, Next, Repeat) row + **Slider** scrubber below with `mm:ss` on either side
  - Right: Now-playing view **Button**, Lyrics toggle **Button**, Queue **Button** (opens the Queue **Drawer** from the right), Volume group (icon + **Slider**), device chooser **Popover**, expand fullscreen **Button**
- **Toast** mounted at root for "Added to queue", "Saved to library", etc.
- **ConfirmDialog** mounted at root for destructive actions (remove playlist, sign out all devices, delete account)
- **Tooltip** on every icon-only button in the player bar and header

Mobile shape: Sidebar collapses to a bottom **TabMenu** (Home / Search / Library / Radio), player bar compresses to a single row, tapping it opens the Now Playing fullscreen. Queue is a **Sheet** (via Drawer with `position="bottom"`).

## Coverage map

| Category | Component | Where it lives |
|---|---|---|
| Form | AutoComplete | Global search, Playlist add-tracks drawer |
| Form | Button | everywhere (transport, actions, editorial) |
| Form | Checkbox | Filters, bulk select |
| Form | ColorPicker | Playlist cover picker (custom colour mode) |
| Form | DatePicker | Settings, listening history range |
| Form | Editor | Artist bio (read-only), playlist description (rich mode) |
| Form | FileUpload | Import drop zone (Home empty state + /import + header), playlist cover, profile avatar |
| Form | FloatLabel | Playlist create form, settings |
| Form | IconField | Search inputs, add-track input |
| Form | InputMask | Explicit content settings PIN |
| Form | InputNumber | Crossfade seconds, gapless offset |
| Form | InputText | every text input |
| Form | Knob | Equalizer bands (5x), balance |
| Form | Listbox | Device chooser, output selector |
| Form | MultiSelect | Library filter (multi-genre) |
| Form | Password | Settings → Privacy |
| Form | RadioButton | Quality settings, repeat mode (as visual example) |
| Form | Rating | Track / album rating |
| Form | Select | Sort menus, genre pickers |
| Form | SelectButton | Sort order, Discography filters |
| Form | Slider | Scrubber, Volume, Crossfade duration |
| Form | Textarea | Playlist description |
| Form | ToggleButton | Shuffle, Repeat, Like, Follow, Public/Private |
| Form | ToggleSwitch | Notifications matrix, Playback settings |
| Button | SpeedDial | Mobile FAB for "Play something" on Home |
| Button | SplitButton | Album actions (Add to library / Add to queue / Add to playlist) |
| Overlay | ConfirmDialog | Remove playlist, Sign out all, Delete account |
| Overlay | ConfirmPopup | Clear cache, Remove track |
| Overlay | Dialog | Create playlist, Share link, Add to playlist picker |
| Overlay | Drawer | Add-tracks panel, Queue drawer, Mobile sidebar |
| Overlay | DynamicDialog | Track credits detail via DialogService |
| Overlay | Popover | Device chooser, volume speaker options |
| Overlay | Toast | Added to queue / Saved / Copied link |
| Overlay | Tooltip | every icon-only button |
| Layout | Accordion | Settings sections |
| Layout | BlockUI | Playlist save-large flow |
| Layout | Card | Album tiles, station tiles, playlist tiles |
| Layout | Divider | Sidebar sections, settings groupings |
| Layout | Fieldset | Settings groupings |
| Layout | Panel | About page license expand |
| Layout | Scroller | Long lyrics view, long queues |
| Layout | ScrollTop | Long library / search results |
| Layout | Splitter | Album detail (cover ⇆ tracklist) |
| Layout | Stepper | First-run onboarding (favourite genres → follow artists → build first playlist) |
| Layout | Tabs | Library, Artist detail, Now Playing, Settings, Search |
| Layout | Toolbar | Player bar, playlist detail actions, header |
| Display | Avatar | Header user, artist chips |
| Display | Badge | Notification counts on Sidebar entries |
| Display | Chip | Active filters, genre tags |
| Display | Image | Album covers, artist portraits |
| Display | Inplace | Playlist title / description edit |
| Display | Message | Empty-library nudges, error banners |
| Display | MeterGroup | Storage breakdown |
| Display | OverlayBadge | Avatar with unread count |
| Display | ProgressBar | Buffer state, storage per-category |
| Display | ProgressSpinner | Track load spinners |
| Display | Ripple | Buttons (global via providePrimeNG) |
| Display | Skeleton | Loading states everywhere (Home strips, Library tabs) |
| Display | Tag | Genre tags, "Explicit", "New" |
| Display | Terminal | Settings → About → Diagnostics log (audio event stream) |
| Data | Carousel | Featured playlists on Home |
| Data | DataView | Albums, artists, playlists, stations, related tracks |
| Data | Galleria | Album art viewer (deluxe / vinyl / alt covers) |
| Data | OrderList | Queue, playlist tracklist |
| Data | Paginator | Library search results |
| Data | PickList | Playlist add-tracks drawer (universe ⇄ playlist) |
| Data | Table | Songs library, top charts, downloaded content, devices |
| Data | Timeline | Recently played on Home, Artist career milestones |
| Data | Tree | Settings → Library → folder tree of watched paths |
| Data | TreeTable | Album detail track expansion + credits |
| Menu | Breadcrumb | Header path (Library / Albums / [Name]) |
| Menu | ContextMenu | Right-click any track / album / artist row |
| Menu | Dock | Optional: alternate mobile-style transport |
| Menu | MegaMenu | Browse page facets (Genre / Decade / Year / Format / Bit rate) |
| Menu | Menu | Avatar dropdown |
| Menu | MenuBar | Optional Now-Playing secondary controls |
| Menu | PanelMenu | Settings sidebar |
| Menu | TabMenu | Mobile bottom nav |
| Menu | TieredMenu | Playlist sort submenu |
| Chart | Chart | EQ preview, artist monthly plays, listening history |

## Build phases

Small slices. Each phase ends runnable + committable.

### Phase 0, Foundation
1. `cd examples` then scaffold with `ng new echo --routing --style=css --ssr=false --skip-tests` (Angular v22 stable).
2. Follow `setup.md` from the skill: install `primeng @primeuix/themes @primeuix/styles primeicons` + `tailwindcss-primeui` + `chart.js`.
3. Wire `app.config.ts` with `providePrimeNG({ theme: { preset: Aura, options: { darkModeSelector: '.dark', cssLayer: { name: 'primeng', order: 'base, theme, primeng, utilities' } } } })`, `provideZonelessChangeDetection()`, `provideAnimationsAsync()`.
4. Configure Tailwind v4 layer setup from `theming.md`.
5. Author the custom Aura preset in `src/app/theme/echo-preset.ts` (dark-first, violet primary).
6. Render a themed **Button** on the root route to prove the wiring.
7. **Validation gate:** every step above came from the skill. If anything went sideways, fix the skill before continuing.

### Phase 1, Shell + routing
Sidebar Drawer + header Toolbar + player bar (static, no real audio yet) + main outlet. Route stubs for all 11 pages. Theme toggle. Mock user in header dropdown. Toast + ConfirmDialog mounted at root. Player bar renders a hardcoded "current track" with transport buttons that don't wire yet.

### Phase 2, IndexedDB schema + ImportService (no library UI yet)
- Wire `idb` with the object stores (`tracks`, `blobs`, `covers`, `playlists`, `plays`, `settings`)
- `ImportService` accepts `File[]`, runs each through `music-metadata-browser` for tags + cover, decodes to compute peaks via `OfflineAudioContext`, writes to IndexedDB, emits per-file progress via a signal
- Concurrency limit of 3, cancel-token support
- Ship with a temporary "drop files here" test route to validate the pipeline before the real UI lands

### Phase 3, PlayerService + real Web Audio graph
- `PlayerService` with signals: `currentTrack`, `isPlaying`, `progress`, `duration`, `volume`, `queue`, `history`, `shuffle`, `repeatMode`
- Owns the `AudioContext` (created lazily on first user gesture per browser autoplay rules)
- Builds the graph: `<audio>` → `MediaElementSource` → `GainNode` → 5× `BiquadFilterNode` → `AnalyserNode` → `destination`
- `ontimeupdate` from the `<audio>` element updates the `progress` signal (throttled to 10 Hz for the UI)
- Wires `navigator.mediaSession.metadata` on track change so OS media controls display cover + title + artist
- `EqService` wraps the BiquadFilterNode chain, exposes band gains as signals, persists preset choice
- Blob URLs are managed with a per-track lifecycle: created when the track becomes current, revoked when it leaves the queue window

### Phase 4, Home + Import UI
- Empty-state Home page with the big **FileUpload** drop zone
- Dedicated `/import` route with the progress table
- Populated Home view (Recently added, Recently played, Jump back in, Your top artists) rendered from `LibraryService` signals
- Header **FileUpload** basic mode for import-from-anywhere

### Phase 5, Library
**Tabs**: Songs / Albums / Artists / Playlists. Songs Table with virtual scroll, filter bar (AutoComplete + Select + SelectButton). DataView grids for the other tabs. ContextMenu on rows. Create-playlist Dialog with Reactive form. Playing a track from any surface goes through PlayerService, so at the end of this phase Echo actually plays music.

### Phase 6, Album + Artist detail
Album: Splitter layout, tracklist Table with row expansion (TreeTable-style credits from ID3 comment / composer / performer fields), SplitButton actions. Artist: hero Toolbar, Tabs (Overview / Discography / Related / About), monthly plays Chart derived from the `plays` store, Timeline for release years.

### Phase 7, Playlist detail + Queue + drag-drop
OrderList for playlist tracklist. Editable Inplace title + description. Add-tracks Drawer with an AutoComplete + a mini PickList. Queue standalone page + Queue Drawer from the player bar (same OrderList component in two containers). Queue reorder reflects live in playback order.

### Phase 8, Now Playing + Waveform + Browse
Fullscreen Now Playing route with Galleria for the cover, canvas-rendered waveform scrubber drawn from the cached peaks (click a bar → seek to that timestamp), transport, Tabs (Up next / Info / Related). Info tab replaces "Lyrics" and shows the raw metadata: bit rate, sample rate, file format, file path, file size, all tag frames. Browse page with MegaMenu facets over the local library.

### Phase 9, Search
Persistent header AutoComplete opens `/search` with the query pre-filled. Tabs (All / Songs / Artists / Albums / Playlists). "Top result" featured Card + section DataViews on the All tab. Search is a plain substring match over the LibraryService signals, no fuzzy library needed.

### Phase 10, Settings + Command palette
All settings Tabs (Profile / Playback / Library / Storage / Notifications / About). Equalizer with 5 Knobs wired live to the BiquadFilterNode gains + Chart preview of the frequency response + preset Select. Reset-library confirmation flow. Cmd+K palette via DynamicDialog + AutoComplete (Go to page, Play song / album / artist, Play random, Toggle shuffle, Import files).

### Phase 11, Polish
- Onboarding: first-run modal with the drop zone + a "Choose folder" button
- Empty / loading / error states everywhere (empty library, decode failure, quota exceeded)
- Mobile responsive: Sidebar → TabMenu, player bar compressed, Now-Playing full-sheet
- Accessibility sweep: Tab order, focus rings, aria-live for track changes, screen-reader smoke test (per `accessibility.md`)
- Dark mode / light mode pass on every page
- Keyboard shortcut cheat sheet (`?` opens a **Dialog** with all bindings)
- PWA manifest + service worker (installable, offline shell, but audio decode still needs the tab open)

## Definition of done

- Every component in the coverage map used at least once
- Dark mode + light mode work on every page
- Player bar persists across all routes
- Space / arrows / L keyboard shortcuts work globally
- Cmd+K palette navigates and runs actions
- No console errors in any route
- Lighthouse a11y ≥ 95
- A 45-second demo recording exists for the README (Home browse → play track → open Now Playing → drag queue → tweak EQ)

## Validation loop (the whole reason this exists)

For every PrimeNG component used:
1. Open the skill's reference file (`references/form-controls.md` for Slider, `references/data.md` for OrderList, etc.).
2. Copy the canonical example structure into the app.
3. Build. If anything compiles wrong or behaves wrong, **the skill is wrong**, fix it before the app.

Don't paper over skill bugs in the app. The app is the test.

Extra validation this app provides beyond Quanta Desk:
- **Slider** used continuously (scrubber updates 10x/sec from real `<audio>.currentTime`, volume Slider wired to a Web Audio `GainNode`, Crossfade Slider in settings). Quanta Desk only used Slider as a filter widget.
- **Knob** wired live to a real `BiquadFilterNode.gain` (five bands), not just a static risk-score visualizer.
- **OrderList / PickList** as first-class editing surfaces that mutate real playback order, not settings toys.
- **Galleria** showing real cover art extracted from ID3 APIC frames at import time.
- **FileUpload** driving a real client-side import pipeline (parse tags → decode PCM → downsample peaks → write to IndexedDB), not just a display prop.
- **Table** with virtual scroll against a real IndexedDB-backed dataset that grows as the user imports files.

## Next session: where to start

```sh
cd "D:\Projects\Open Source\angular-ui-skills\examples"
# Tell Claude: "start Phase 0 of the Echo plan"
```

Claude should:
1. Read `examples/echo/PLAN.md` (this file)
2. Read the skill's `setup.md` and `theming.md`
3. Begin Phase 0, scaffold the Angular app, install PrimeNG, wire `providePrimeNG`, get the dev server up.

Each phase is its own commit. Don't try to land the whole app in one go.
