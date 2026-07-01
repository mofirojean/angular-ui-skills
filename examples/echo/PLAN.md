# Echo, Build Plan

> **Status:** Plan. Not yet scaffolded. See "Next session: where to start" at the bottom.

A reference Angular application built with the `primeng-developer` skill. The point is not the app, the point is that **building this proves the skill is correct on a shape Quanta Desk did not cover**. Quanta Desk validated dense-data-table PrimeNG (finance chrome, sortable grids, Editor, TreeTable). Echo validates media / entertainment PrimeNG: continuous controls (Slider, Knob), drag-driven reordering (OrderList, PickList), rich cover-art surfaces (DataView, Galleria, Carousel), and a persistent player shell that lives across every route.

## What it is

**Echo**, a music player + library for a fictional streaming service. Browse albums, artists, and playlists. Play a track and it lives in a persistent bottom player bar with a scrubber, volume, shuffle/repeat, and a queue drawer. Fullscreen "Now Playing" view with a waveform scrubber and lyrics tab. Drag-drop to build playlists and reorder the queue. Search across songs / artists / albums / playlists via a global AutoComplete.

The narrative fits PrimeNG's underused vocabulary from Quanta Desk: **Slider** graduates from a filter widget to the audio scrubber and volume rail, **Knob** becomes the EQ band control, **OrderList** and **PickList** move from a settings toy to the primary queue-editing surface, **Galleria** shows album art at full resolution, **Carousel** is featured playlists on the home page, **MegaMenu** browses by genre / mood / decade.

## Goals

1. **Validate the skill on media-shaped UI.** A persistent player shell + continuous audio controls exercise PrimeNG on a layout that isn't a data table.
2. **Cover the PrimeNG components Quanta Desk didn't lean on.** Specifically Slider (as scrubber, not filter), Knob (as EQ, not risk score), OrderList / PickList (as queue and playlist editors), Galleria (as album-art viewer), Carousel (as featured strip), Rating (as track/album rating), Terminal (as lyrics display in one mode).
3. **Produce a portfolio-grade demo.** Real feeling playback with a fake audio engine, working dark mode, keyboard shortcuts (space to play/pause, arrows for prev/next/vol), no console errors.
4. **Stay shippable in slices.** Each phase ends with a runnable app, no waterfall.

## Out of scope

- Auth (mock a signed-in listener)
- Real audio streaming. The player uses `<audio>` with a small set of royalty-free / silent placeholder tracks, or a purely simulated timer. No CDN, no DRM, no licensing.
- Real music metadata APIs (Spotify, MusicBrainz). Everything is mock data.
- Uploads / user-generated audio.
- Social features (following, sharing, comments).
- SSR (later)
- Unit / E2E tests (this is manual visual + functional validation, the *skill* is what we're testing)
- A native waveform decoder. The waveform is a stylized SVG / canvas rendering of a fixed peak array per track, not real FFT.

## Tech stack

- **Angular v22+**, standalone components, signals, control flow syntax, zoneless via `provideZonelessChangeDetection()`
- **PrimeNG v21** with `@primeuix/themes` (Aura preset, customized to a dark-first cover-art-forward palette) + `@primeuix/styles`. Install via the skill's `setup.md`.
- **Tailwind v4** with `tailwindcss-primeui` and `cssLayer` enabled
- **PrimeIcons** for chrome icons; **Lucide** via `@ng-icons/lucide` for player controls where PrimeIcons lacks the exact glyph (play, pause, skip-forward, skip-backward, shuffle, repeat, volume variants)
- **Chart.js** for the equalizer visualization and listening-history bars
- **[ngx-transforms](https://www.npmjs.com/package/ngx-transforms)** for `| initials`, `| timeAgo`, `| truncate`, dogfood the user's own library on artist bylines, played-at labels, and marquee-cropped titles
- **Reactive forms** for search, playlist creation, settings
- **No state library**, signals + a single `PlayerService` (the play head, queue, and history live here as signals) + a `LibraryService` for mock data
- **Custom track duration formatter**, `mm:ss` for < 1h, `h:mm:ss` past that

## Visual identity

Dark-first. The album art is the visual centerpiece on every media page, so the chrome recedes:

- Background: near-black with a faint blue undertone (`#0b0d12` ish)
- Surface: one step lighter (`#151821`)
- Primary accent: electric violet or magenta, used sparingly on the play button, active nav item, and progress fill on the scrubber
- Muted text: cool grey; body text: soft off-white
- Album art casts a subtle blurred backdrop on the Now Playing view (uses the current track's dominant colour, extracted at mock-time and hardcoded per track)

Light mode exists but the default is dark. Toggle persists via the `dark` class on `<html>`.

## Pages

### 1. Home / Discover (`/`)
Landing page. Editorial + personalized.
- Hero **Carousel** of featured playlists (full-bleed cover, artist byline, "Play" **Button** overlay on hover)
- "New releases" **DataView** grid of album cards (cover, title, artist, released via `| timeAgo`) with grid / list toggle
- "Made for you" **DataView** row of personalized playlists (horizontal scroller layout)
- "Top charts" **Table** condensed, 10 rows, sortable by rank / plays / duration, row click plays the track
- "Recently played" **Timeline** with cover thumbnails on the left rail
- **Skeleton** placeholders during the 400ms simulated load

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

### 8. Radio (`/radio`)
- **MegaMenu** at top: Genre · Mood · Decade · Activity
- **DataView** grid of stations, each a **Card** with a stylized gradient background (no cover art, this is where the palette flexes)
- Play button on the card triggers a station (fills the queue with a mock genre feed)
- "Personal stations" **DataView** row + "Trending" **DataView** row

### 9. Search (`/search`)
- Persistent **AutoComplete** in the header opens this route with the query pre-filled
- Results **Tabs**: All · Songs · Artists · Albums · Playlists · Lyrics
- **All** tab: mixed **DataView** with sections, "Top result" featured **Card**, then compact rows of songs / artists / albums
- Individual type tabs: full **Table** (Songs) or **DataView** (others)
- Empty state: **Empty** with recent searches list

### 10. Settings (`/settings`)
- **Tabs**: Profile · Playback · Storage · Devices · Notifications · Privacy · About
- **Profile**: name (**InputText**), display picture (**FileUpload**), country (**Select**), pronouns (**Select**)
- **Playback**: crossfade duration (**Slider** 0-12s), gapless (**ToggleSwitch**), normalization (**SelectButton** Off / Quiet / Normal / Loud), streaming quality (**RadioButton** stack), download quality (**RadioButton** stack), equalizer (5-band **Knob** array + preset **Select** with Custom / Rock / Jazz / Classical / Bass Boost / Vocal), preview via a mini **Chart** (line)
- **Storage**: used vs free (**MeterGroup**), per-category breakdown (**ProgressBar** rows), "Clear cache" **Button** (**ConfirmPopup**), downloaded content **Table** with per-item remove
- **Devices**: **Table** of connected devices, last-active `| timeAgo`, action column with a "Sign out" **Button** (per row **ConfirmDialog** on click). "Sign out all" toolbar action
- **Notifications**: grid of **ToggleSwitch** rows per channel × event (new release, playlist update, artist news, weekly recap, live event)
- **Privacy**: **ToggleSwitch** stack (private session, hide activity, block explicit content), **Password** for account changes, delete account (**ConfirmDialog** with typed confirmation)
- **About**: version, credits, licenses (**Panel** with expand)

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
| Form | FileUpload | Playlist cover, profile picture |
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
| Display | Terminal | Lyrics tab in Now Playing (monospace scroller) |
| Data | Carousel | Featured playlists on Home |
| Data | DataView | Albums, artists, playlists, stations, related tracks |
| Data | Galleria | Album art viewer (deluxe / vinyl / alt covers) |
| Data | OrderList | Queue, playlist tracklist |
| Data | Paginator | Library search results |
| Data | PickList | Playlist add-tracks drawer (universe ⇄ playlist) |
| Data | Table | Songs library, top charts, downloaded content, devices |
| Data | Timeline | Recently played on Home, Artist career milestones |
| Data | Tree | Genre browse in Radio (Genre → Subgenre) |
| Data | TreeTable | Album detail track expansion + credits |
| Menu | Breadcrumb | Header path (Library / Albums / [Name]) |
| Menu | ContextMenu | Right-click any track / album / artist row |
| Menu | Dock | Optional: alternate mobile-style transport |
| Menu | MegaMenu | Radio browse (Genre / Mood / Decade / Activity) |
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

### Phase 2, PlayerService + fake audio engine
- `PlayerService` with signals: `currentTrack`, `isPlaying`, `progress`, `duration`, `volume`, `queue`, `history`, `shuffle`, `repeatMode`
- A `setInterval` loop advances `progress` while `isPlaying` is true (or wire a real `<audio>` with silent MP3 placeholders)
- Player bar transport buttons dispatch to the service
- **Slider** scrubber is two-way bound to `progress` with a `(seek)` output
- Keyboard: space toggles play/pause globally

### Phase 3, Home / Discover
Hero **Carousel**, **DataView** grids for new releases and made-for-you, **Table** for top charts, **Timeline** for recently played. Skeleton loaders during simulated load.

### Phase 4, Library
**Tabs**: Songs / Albums / Artists / Playlists. Songs Table with virtual scroll, filter bar (AutoComplete + Select + SelectButton). DataView grids for the other tabs. ContextMenu on rows. Create-playlist Dialog with Reactive form.

### Phase 5, Album + Artist detail
Album: Splitter layout, tracklist Table with row expansion (TreeTable-style credits), SplitButton actions. Artist: hero Toolbar, Tabs (Overview / Discography / Related / About), monthly plays Chart, Timeline for milestones.

### Phase 6, Playlist detail + Queue + drag-drop
OrderList for playlist tracklist. Editable Inplace title + description. Add-tracks Drawer with an AutoComplete + a mini PickList. Queue standalone page + Queue Drawer from the player bar (same OrderList component in two containers).

### Phase 7, Now Playing + Lyrics + Radio
Fullscreen Now Playing route with Galleria (multi-cover), large Slider scrubber, transport, Tabs (Up next / Lyrics / Related), Terminal-style scrolling lyrics that highlight the current line based on `progress`. Radio page with MegaMenu browse + DataView of gradient stations.

### Phase 8, Search
Persistent header AutoComplete opens `/search` with query. Tabs (All / Songs / Artists / Albums / Playlists / Lyrics). "Top result" featured Card + section DataViews on All tab.

### Phase 9, Settings + Command palette
All settings Tabs (Profile / Playback / Storage / Devices / Notifications / Privacy / About). Equalizer with 5 Knobs + Chart preview + preset Select. Cmd+K palette via DynamicDialog + AutoComplete (Go to page, Search library, Play radio: X, Open settings section).

### Phase 10, Polish
- Onboarding Stepper (first-run only, LocalStorage flag)
- Empty / loading / error states everywhere
- Mobile responsive: Sidebar → TabMenu, player bar compressed, Now-Playing full-sheet
- Accessibility sweep: Tab order, focus rings, aria-live for track changes, screen-reader smoke test (per `accessibility.md`)
- Dark mode / light mode pass on every page
- Keyboard shortcut cheat sheet (`?` opens a **Dialog** with all bindings)

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
- **Slider** used continuously (scrubber updates 10x/sec, volume Slider bound to a signal, Crossfade Slider in settings). Quanta Desk only used Slider as a filter widget.
- **OrderList / PickList** as first-class editing surfaces, not just settings toys.
- **Galleria** and **Carousel** as content-forward hero surfaces on Now-Playing and Home, not as one-off examples.
- **Terminal** in a real user-facing role (synced lyrics), not just a diagnostics page.

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
