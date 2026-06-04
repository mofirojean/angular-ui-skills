# Apex, Build Plan

> **Status:** Plan. Not yet scaffolded. See "Next session: where to start" at the bottom.

A reference Angular application that validates the `spartan-ng-developer` skill. Apex is a chat assistant interface inspired by claude.ai — sidebar with conversation history, message stream, side-by-side artifacts panel, account / project / settings pages — built entirely with Spartan/ng and a warm cream-and-coral theme.

The point of this app is not the app itself, it's that **building it proves the skill is correct on a fundamentally different layout shape than the existing two examples**. Mission Control validates dashboards. Quanta Desk validates dense data tables. Apex validates conversational UI, long-form content, code-rendering, and split panes.

## What it is

**Apex**, a chat assistant interface modeled on claude.ai's visual language and interaction patterns. Sidebar with conversation history grouped by date, projects section, profile menu. Main area is either an empty state with prompt suggestions or an active message stream. A toggleable right-side artifacts panel renders generated code / markdown / HTML.

Naming-wise: the repo and docs describe it as *"a chat assistant interface inspired by claude.ai"*. We do not call it Claude, do not use the Anthropic mark, do not imply endorsement.

## Goals

1. **Validate the skill on chat-shaped UI.** Exercise Spartan/ng components in a layout that's nothing like an admin dashboard: long-form serif typography, message bubbles, streaming animations, sticky composer, virtualized conversation list, sliding panels.
2. **Cover the Helm components Mission Control didn't use.** Specifically `hlm-resizable`, `hlm-context-menu`, `hlm-hover-card`, `hlm-popover` (richer than tooltips), `hlm-sheet` (mobile sidebar), `hlm-collapsible`, `hlm-progress` (streaming indicator), `hlm-skeleton` (typing/thinking states).
3. **Produce a portfolio-grade demo.** Real-feeling conversations, working dark mode, keyboard nav, smooth animations, no console errors. Something we can point users at on social.
4. **Stay shippable in slices.** Each phase ends with a runnable app, no waterfall.

## Out of scope

- Marketing landing pages (claude.com style). Chat UI only.
- Real Claude API integration. Everything is mock, conversations are hardcoded in `mock-conversations.ts`. A future phase can wire the real API behind a "Connect your API key" UI.
- Auth (mock a logged-in user)
- SSR (later)
- Unit / E2E tests
- Streaming WebSocket plumbing. The fake "streaming" animation is purely CSS / RxJS interval over a pre-canned response.
- Real file upload (the attachment UI exists but accepts no file).
- Real markdown editing (the composer is plain textarea, not a rich editor)

## Tech stack

- **Angular v21+**, standalone components, signals, control flow syntax
- **Spartan/ng**, latest, via `@spartan-ng/brain` + `@spartan-ng/helm`. Install via the skill's own `setup.md` instructions.
- **Tailwind v4**, customized to a warm cream-and-coral palette (claude.ai-inspired).
- **`@ng-icons/lucide`** for iconography. Same icon set as Mission Control.
- **`ngx-markdown`** for rendering assistant message content with markdown + GFM tables + code fences. Or roll a small custom renderer if ngx-markdown drags in too much weight.
- **`highlight.js`** (or Shiki for compile-time) for code-block syntax highlighting.
- **Reactive forms** (composer + settings).

### Theme tokens

The visual identity comes from the theme, not the components. Target palette:

| Token | Light | Dark |
|---|---|---|
| Background | `#f5f0e6` warm cream | `#1a1716` warm near-black |
| Surface | `#ffffff` | `#26211f` |
| Foreground | `#2b2419` warm near-black | `#ebe5d6` warm near-white |
| Muted foreground | `#7a6f60` | `#8c8275` |
| Border | `rgba(0,0,0,0.07)` | `rgba(255,255,255,0.08)` |
| Accent (Claude orange) | `#c96442` | `#d97757` |
| Code block bg | `#1f1c1a` (always dark) | `#0f0d0c` |

Typography:
- **Body:** Inter or system-ui (same as docs/MC/QD)
- **Headings + assistant message text:** "Source Serif Pro" via Google Fonts (claude.ai uses "Tiempos", which is paid, Source Serif is the closest free analog)
- **Mono:** JetBrains Mono (same as other examples)

## Phases

### Phase 0, foundation (1 hour)

- `ng new` Angular v21 standalone, no SSR, no zone (zoneless), no specs
- Install `@spartan-ng/cli`, `@spartan-ng/brain`, Tailwind v4 + `hlm-tailwind-preset`, `@ng-icons/core`, `@ng-icons/lucide`
- Run `npx @spartan-ng/cli init` to set up Helm scaffolding (`src/libs/ui/`)
- Configure `quanta-preset.ts`-style theme: warm cream surfaces, coral accent, dual font stack (sans + serif)
- Add `vercel.json` matching the other two examples
- Empty router with `/` → coming-soon shell so the dev server runs
- Commit: `feat(examples): Scaffold Apex foundation with Spartan/ng + warm theme`

**Exit criteria:** `ng serve` runs, Spartan installed, dev page shows the typed Apex shell + theme colors.

### Phase 1, chat shell (2 days)

The headline screen. Everything visible the moment you open a chat.

**Layout** (`app.html`):
- Sidebar (`hlm-sheet` on mobile, fixed `aside` on desktop)
  - Top: collapsible workspace switcher + "New chat" `hlmBtn` (primary, full-width)
  - Search input (`hlm-input` with leading `lucideSearch` icon, ⌘K shortcut hint)
  - Conversation groups: Today / Yesterday / Previous 7 days / Previous 30 days / Older
  - Each conversation: title, last message preview on hover (`hlm-hover-card`), context menu (`hlm-context-menu`) with Rename, Star, Move to project, Delete
  - Star section near top: pinned conversations
  - Projects section: link to `/projects` + 3 most recent
  - Footer: profile pill with `hlm-avatar` + `hlm-dropdown-menu` for theme toggle / settings / sign out
- Main area
  - Top bar: editable title (defaults to "New chat"), model selector (`hlm-select` showing Apex Opus / Apex Sonnet / Apex Haiku), Share + More buttons
  - Either empty state OR active conversation (see below)
  - Composer at bottom: `hlm-textarea` (auto-resize), model picker reminder, attach button, send button, character count

**Empty state** (`/`, before any message):
- Centered serif greeting: "Good evening, Mofiro" (time-of-day aware)
- 4 suggested prompt cards in a 2x2 grid:
  - "Help me draft an email"
  - "Explain a concept"
  - "Write code"
  - "Brainstorm ideas"
- Composer below

**Active conversation** (`/c/:id`):
- Message stream
  - User message: warm contained bubble, slight indent from right, attachment chips below
  - Assistant message: full-width, no bubble, serif font, generous line height, markdown rendering
  - Code blocks: dark bg, mono font, copy button on hover, language label
  - Action row under each assistant message: Copy, Edit, Regenerate, Like, Dislike (all `hlmBtn` ghost, with `lucide` icons)
- "Apex is thinking..." indicator using `hlm-skeleton` and a `lucideSparkles` icon
- Pre-canned "streaming" effect: split a long mock response into tokens and reveal them every 30ms via `setInterval`

**Mock data** (`mock-conversations.ts`):
- 12 conversations across the time buckets
- 3-4 with starred status
- A mix of topics: coding, writing, brainstorming, learning
- Each has a realistic title and 4-8 messages
- One has markdown features: headings, lists, blockquote, link
- One has a long code block (TypeScript or Python)
- One has a table

**Routes:**
- `/` empty state
- `/c/:id` conversation detail
- `/search` global search results page (uses ⌘K palette OR a dedicated page)

**Exit criteria:** Click "New chat" → empty state. Type a prompt → fake-streams a mock response. Click a conversation in sidebar → loads its messages. Star, rename, delete via context menu (mock, just updates the signal). Looks visually distinct from any dashboard, recognizably claude.ai-shaped.

### Phase 2, artifacts panel (1 day)

claude.ai's distinctive split layout. The right pane shows a live preview when an assistant response contains "artifact" content.

**Behavior:**
- Detect artifacts in mock messages by a fenced tag (e.g. ` ```artifact:html ` or ` ```artifact:react `)
- When detected, the message shows a small "Artifact" card link
- Clicking opens a right-side panel using `hlm-resizable` to split the main area 60/40
- Panel has tabs: Preview / Code
- Code tab: same syntax-highlighted block from the message
- Preview tab: `iframe` with srcdoc for HTML, rendered markdown for `.md`, or static text fallback
- Top of panel: title, close, fullscreen, copy, download
- Fullscreen expands the panel to cover the main area (sidebar stays)
- Closing it returns to single-column

**Mock artifacts to ship:**
- An HTML artifact: a colored CSS gradient + animation
- A markdown artifact: a one-pager doc with headings + a table
- A React artifact (just show as code with syntax, no actual render)

**Exit criteria:** Opening a specific conversation surfaces the artifact card, clicking it splits the layout, preview renders, fullscreen works, close restores the layout.

### Phase 3, projects + account + settings (1 day)

Rounds out the "real product" feel.

**Routes:**
- `/projects` list (cards, search, "New project" button → `hlm-dialog`)
- `/projects/:id` project detail
  - Hero: name, description, edit pencil
  - Tabs: Conversations / Knowledge / Instructions
  - Conversations tab: list filtered to this project
  - Knowledge tab: uploaded files (mock list, `hlm-progress` for fake upload)
  - Instructions tab: system-prompt textarea + save
- `/settings` tabbed page
  - Account: avatar, name, email, password (all `hlm-input`)
  - Appearance: theme toggle, density, font size (all `hlm-radio-group` cards)
  - Profile: custom instructions, preferred name, location, role (all reactive form)
  - Models: per-conversation default, temperature slider (`hlm-slider`), max length
  - Data controls: chat history toggle, export, delete all (`hlm-alert-dialog` for the delete)
  - Notifications: matrix of channels (email / desktop / mobile) × event types (`hlm-switch`)
  - Privacy: data sharing toggles
  - API keys: list with revoke + new key dialog (mirrors Quanta Desk's settings keys tab)

**Exit criteria:** Profile menu → Settings opens at /settings. All tabs render and forms persist their state via signals. Projects link from sidebar lists 3 mock projects with click-through detail.

### Phase 4, polish (half a day)

- Loading skeletons everywhere (`hlm-skeleton`)
- Empty states with illustrations or icon + message + CTA
- 404 page (different style than Mission Control's, more serif/cream-leaning)
- ⌘K command palette (different command set than Quanta Desk's, contextual to chat)
- Keyboard shortcuts: `n` new chat, `/` search, `g s` settings, etc.
- Mobile responsive pass (sidebar collapses to `hlm-sheet`)
- Subtle animations: message fade-in, sidebar collapse, panel slide-in
- Light / dark mode toggle with system preference detection
- Final visual QA pass, every Spartan component matches the warm theme

**Exit criteria:** `ng build` clean. Click through every route in both themes on desktop and mobile (DevTools responsive view at 360px). No console errors.

## File structure

```
examples/apex/
├── PLAN.md                                  this file
├── README.md                                user-facing
├── angular.json
├── package.json
├── tsconfig*.json
├── vercel.json
├── public/
│   └── ...
└── src/
    ├── index.html
    ├── main.ts
    ├── styles.css                            theme tokens + Tailwind
    └── app/
        ├── app.config.ts
        ├── app.routes.ts
        ├── app.ts                            shell: sidebar + outlet
        ├── app.html
        ├── theme/
        │   └── apex-preset.ts                custom hlm-tailwind extension
        ├── shared/
        │   ├── command-palette/              ⌘K
        │   ├── markdown-renderer/            ngx-markdown wrapper
        │   ├── code-block/                   highlight + copy
        │   ├── message-bubble/               user message
        │   ├── message-stream/               assistant message + actions
        │   └── artifact-panel/               right-side panel
        ├── pages/
        │   ├── chat/                         empty state + active chat
        │   ├── projects/
        │   │   ├── projects.ts               list
        │   │   └── project-detail/
        │   ├── settings/
        │   │   └── settings.ts               tabbed
        │   └── not-found/
        └── data/
            ├── mock-conversations.ts
            ├── mock-projects.ts
            └── mock-user.ts
```

## What Apex specifically validates that MC and QD don't

| Component / pattern | Where Apex exercises it |
|---|---|
| `hlm-resizable` | Artifacts panel split |
| `hlm-hover-card` | Conversation preview on hover |
| `hlm-context-menu` | Right-click on conversations |
| `hlm-popover` | Action menus on messages, share dialog |
| `hlm-sheet` | Mobile sidebar |
| `hlm-collapsible` | Project knowledge sections, sidebar groups |
| `hlm-progress` | Fake file upload, fake streaming |
| `hlm-skeleton` | Loading messages, thinking indicator |
| `hlm-alert-dialog` | Delete confirmations |
| `hlm-toggle-group` | Theme picker, view mode |
| Serif typography | Assistant messages |
| Markdown rendering | Assistant content |
| Code block syntax highlight | Code in messages + artifacts |
| Long-form layout | Chat stream vs. dense dashboards |
| Streaming UI animation | Token-by-token reveal |
| Split-panel layout | Artifacts |

If any of those don't have idiomatic guidance in `skills/spartan-ng-developer/references/`, that's the skill drifting, fix the skill, not the app.

## Visual reference

claude.ai screenshots for reference (not committed, just for the working session):
- Empty state
- Active chat
- Sidebar with grouped conversations
- Artifacts panel split
- Settings page

The aesthetic to hit:
- Warm cream backgrounds, never pure white
- Sparing use of accent orange (only for "send", "primary action", "new chat", and one or two highlights)
- Serif for assistant messages, sans for everything else
- Generous spacing, lots of breathing room
- Subtle borders, no heavy drop shadows
- Animations are slow and minimal: 200ms fades, no bouncing

## Next session: where to start

```sh
cd "D:/Projects/Open Source/angular-ui-skills/examples/apex"
npx @angular/cli@21 new . --routing=false --style=css --ssr=false --skip-tests --skip-git --skip-install --defaults
```

Then Phase 0 from there. Spartan install via `@spartan-ng/cli init`, theme tokens in `src/styles.css` + `src/app/theme/apex-preset.ts`, route skeleton in `src/app/app.routes.ts`.

The PLAN.md is the source of truth as we build. If a phase grows beyond its time budget, push the lower-priority work into a later phase rather than skipping the exit criteria.
