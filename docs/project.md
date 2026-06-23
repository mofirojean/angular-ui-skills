# Project Ideas

A catalogue of validator-app concepts for the `angular-ui-skills` ecosystem. The methodology: every per-library skill ships with at least one reference app that exercises the real component surface, so the skill is "right" because the app builds.

## Current validator apps

| App | Skill | Domain | Live |
|---|---|---|---|
| **Mission Control** | spartan-ng-developer | AI agent ops dashboard | mission-control-drab-six.vercel.app |
| **Apex** | spartan-ng-developer | Chat assistant | apex-ecru-nu.vercel.app |
| **Quanta Desk** | primeng-developer | Portfolio + trading desk | quanta-desk.vercel.app |
| **Switchboard** | ng-zorro-developer | Support-ops helpdesk | switchboard-olive.vercel.app |
| **Roster** | angular-material-developer | HR + people management | roster-khaki-pi.vercel.app |

## Recommended next builds

The two highest-leverage picks, each fills a clean gap and stays inside the existing skill set:

### Forge, code review tool (Spartan/ng)

PR list, file tree, monaco-style diff viewer with inline + threaded comments, reviewer assignment, status filters. GitHub-style dense data + conversation threading.

- **Validates**: hlm-tree, hlm-tabs, hlm-popover for inline comments, complex split layouts, the `brn-command` palette for "jump to file" UX
- **Why now**: chat-thread DNA from Apex transfers, dense-table DNA from Mission Control transfers, but the diff viewer + tree + thread combination is a new shape
- **Acid test**: Can the skill generate a working multi-line code-comment thread the first time?

### Cadence, scheduling + booking app (Angular Material)

Resource calendars (rooms, people), drag-drop event creation, recurring event rules, day / week / month / agenda views.

- **Validates**: `MatDatepicker` at depth, plus the custom calendar grid pattern Roster only touched in time-off, CDK Drag-Drop for event creation, `MatDialog` + `MatStepper` for the booking flow
- **Why now**: Roster validated the *form-heavy* half of Material's moat, Cadence would validate the *calendar* half
- **Acid test**: Recurring-event rendering across all four view modes without breaking the data model

## Idea catalogue

### Domain expansion (new business shapes)

| Concept | One-liner | Best skill |
|---|---|---|
| **Echo** | Music player + library, queue panel, audio scrubber, waveform viz, drag-drop playlists | primeng (dense controls) |
| **Quill** | Notion-style notes, slash command palette, doc tree, rich text via TipTap, comments | spartan-ng |
| **Pulse** | Real-time analytics, live-updating charts, funnel + cohort + retention, drill-down filters | primeng (Chart.js integration) |
| **Compass** | Travel booking, search filters, map view, image gallery, reservation flow | angular-material |
| **Crate** | E-commerce admin, products + inventory + orders + customers, Stripe-refined aesthetic | ng-zorro |
| **Lumen** | LMS, course list, video player, quiz UI, progress tracking, discussion forum | angular-material |
| **Beacon** | Email client, mailbox + threaded view + compose, filter labels, list-detail at scale | ng-zorro |
| **Atlas** | Real estate browse, map-first search, property cards, comparison drawer | angular-material |
| **Stride** | Personal habit tracker, streak grid, charts, journal entries, lighter visual register | primeng |

### Mechanics expansion (new interaction patterns)

| Concept | One-liner | Best skill |
|---|---|---|
| **Plot** | Form builder, Typeform-clone, drag-drop editor, response analytics, theming panel | angular-material |
| **Pivot** | Data exploration spreadsheet, editable grid, formulas, pivot tables, derived charts | primeng (or AG Grid) |
| **Spectra** | Image gallery / lightbox, masonry grid, EXIF inspector, batch tagging | any |

### Canvas + diagram apps (ngDiagram showcase)

[`ngDiagram`](https://github.com/Profuse-Engineering/ng-diagram) is a zero-dep Angular 18+ diagramming library with composable nodes / edges / groups, ports + smart labels, drag-resize-rotate, multi-select, pan-zoom, snapping, custom node components, a middleware pipeline, and the model adapter pattern. Pairs naturally with any of the existing UI skills (the diagram is the workspace, the skill library is the chrome around it: toolbar, sidebar, inspector, dialogs).

#### Synapse, AI agent workflow builder *(recommended)*

Drag-drop visual editor for LLM agent graphs. Nodes for prompts, tool calls, conditionals, loops, parallel branches. Edges carry typed data between ports. Side-panel inspector for the selected node. Run button executes the graph with a step-by-step trace.

- **Best skill**: spartan-ng-developer (third Spartan app, but a completely different shape from Mission Control's dashboard + Apex's chat, so the variety holds)
- **Validates**: hlm-resizable for the canvas / inspector split, hlm-dialog for node-library picker, brn-command palette for "add node by name", hlm-popover for connection-tooltip UX, plus the entire ngDiagram surface
- **Why now**: LangFlow / n8n / Flowise own this space and they're all React-first. A polished Angular alternative is a real wedge, and the project's audience (devs using AI coding tools) is the exact buyer.
- **Visual register**: dark-first canvas with subtle dot-grid, monospace node labels, glowing port-active states. Distinct from every existing app.
- **One-line story**: "LangFlow for Angular."

#### Lattice, database schema designer

dbdiagram.io / drawsql.app shape. Tables as group nodes, columns as ports, foreign keys as typed edges. Property inspector for column types, defaults, constraints. SQL generation + migration export.

- **Best skill**: ng-zorro-developer (Ant Design's deep table + form vocab fits schema editing, plus Switchboard validated the ng-zorro chrome already)
- **Validates**: nz-table for column editors inside nodes, nz-tree for the schema tree, nz-dropdown for inline type pickers, nz-code-editor or Monaco for the SQL preview
- **Why now**: every backend dev has used dbdiagram.io. The market validates instantly.
- **One-line story**: "dbdiagram.io for Angular, with type-aware foreign keys."

#### Loop, state machine visualizer + editor

XState visualizer / Stately Studio shape. States as nodes, transitions as labeled edges, guards + actions on the edges. Side panel for state context. Live "play" mode that animates the machine through a chosen event sequence.

- **Best skill**: primeng-developer (PrimeNG's dense control vocabulary from Quanta Desk works for the inspector + event trace)
- **Validates**: p-tree for the state hierarchy, p-timeline for the event trace, p-splitter for canvas / inspector, p-toast for run-step feedback
- **Why niche but worth it**: developer tool for a specific community (XState users) but the depth is impressive.
- **One-line story**: "XState visualizer, but you can edit the machine."

#### Helix, visual org chart (companion to Roster)

Roster's reporting tree, now as an editable canvas. Drag an employee node onto a new manager to restructure. Expand / collapse subtrees. Highlight reporting depth, span-of-control, and orphaned employees.

- **Best skill**: angular-material-developer (lives next to Roster, shares the MockDataService)
- **Validates**: extending an existing validator app with a canvas surface, plus the MatTree integration we already documented
- **Why interesting**: this is the lightest lift, ships as a `/org-chart` route on Roster instead of a new app. Could land in a single sprint.
- **One-line story**: "Drag a person to their new manager."

**My pick: Synapse.** Strongest combination of market relevance, visual distinctiveness, and skill validation. If you want a faster ship, **Helix** as a Roster sub-route is the lowest-effort entry into the ngDiagram-validation track.

### Meta plays (no new app, multiplies existing work)

- **Pixel, Library Comparison Explorer**: a new route on the existing docs site that renders the *same* canonical UI (login form, data table, calendar, modal, command palette) built in all four libraries side-by-side. Becomes the killer marketing piece, lets readers pick a library by sight rather than spec-sheet. Reuses the validator apps' code directly.
- **Per-skill smoke test**: install each skill via `npx skills add` in a fresh CI container, assert SKILL.md ends up at the expected path, render one component to confirm Tailwind / Sass / LESS theme variables resolve. Locks the install flow against regression.
- **Storybook-on-the-docs-site**: a `/components` route per validator app surfacing individual components in isolation, with copy-snippet affordance. Doubles as live documentation.

### Skill ecosystem expansion (new per-library skills)

| Library | Domain fit | Skill name |
|---|---|---|
| **Taiga UI** | Fintech / dev tools, distinct visual register | taiga-ui-developer |
| **Clarity Design** | Enterprise admin, VMware-funded, deep table + form vocabulary | clarity-developer |
| **Nebular** | Cross-platform admin (Akveo) | nebular-developer |
| **ng-bootstrap** | Bootstrap-styled Angular | ng-bootstrap-developer |

Each new skill needs its own validator app, so this branch is the most expensive direction.

## Selection criteria

Use this checklist when picking the next concept:

1. **Does it exercise components the existing apps don't already exercise?** A second admin dashboard validates less than a first calendar-first app does.
2. **Is the visual register different from the existing fleet?** Roster + Switchboard are both light-mode + neutral. We have one dark-first (Quanta Desk) and one warm-cream (Apex). A vibrant or playful app would broaden the marketing surface.
3. **Does the domain story land in one sentence?** "HR for a 200-person company" lands. "Generic dashboard" doesn't.
4. **Can it be built in one sprint?** Roster took 7 phases of disciplined slicing. Anything substantially larger should be split into separate validator apps that share a domain.
5. **Does it produce skill fold-back lessons?** The validator app exists to surface drift. If the concept is too close to existing apps, the fold-back yield drops.

## Built backlog (not validator apps)

Side projects that could ship on the same infra but aren't tied to a skill:

- **Dogfood `ngx-transforms`**: a `/transforms` route on the docs site that demos each of the 90 pipes interactively. Backs into a marketing piece for Mofiro's own library.
- **Skill installer onboarding video**: 60-second screencast of `npx skills add` working in Claude Code, Cursor, Codex, Gemini CLI.
- **Contributor guide (CONTRIBUTING.md)**: how to add a new skill, how to add a new validator app, how the deploy matrix works.