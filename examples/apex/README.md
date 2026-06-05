# Apex

A reference Angular application that validates the [`spartan-ng-developer`](../../skills/spartan-ng-developer) skill. Apex is a chat assistant interface inspired by claude.ai: sidebar with conversation history, message stream with markdown + code rendering, side-by-side artifacts panel, projects, settings.

> **Status:** Phase 0 (foundation). The scaffold, Spartan/ng install, warm cream theme, and dark-mode default are in place. The chat shell, artifacts panel, projects, and settings pages ship in upcoming phases per [`PLAN.md`](./PLAN.md).

The point of this app is not the app itself, it's that **building it proves the skill is correct on a chat-shaped layout** rather than the dashboard shapes the other two examples cover. See [PLAN.md](./PLAN.md) for the full build plan.

## Stack

- **Angular v21+** with standalone components, signals, control flow syntax
- **Spartan/ng** via `@spartan-ng/brain` + `@spartan-ng/helm` (copied into `src/libs/ui/`)
- **Tailwind v4** with the `hlm-tailwind-preset` and `tw-animate-css`
- **`@ng-icons/lucide`** for iconography
- **`ngx-markdown`** (Phase 1) for assistant message rendering
- **`highlight.js`** (Phase 1) for code-block syntax highlighting
- **Source Serif 4** + **Inter** + **JetBrains Mono** fonts loaded via CDN

## Theme

A warm cream-and-coral palette designed to evoke claude.ai's aesthetic. Theme variables live in [`src/styles.css`](./src/styles.css) under `:root` and `:root.dark`. Dark mode is the default.

Coral accent: `oklch(0.605 0.137 35)` in light, `oklch(0.650 0.130 40)` in dark.

## Run locally

```sh
npm install
npm start
```

Opens at http://localhost:4200.

## Build

```sh
npm run build
```

Output lands in `dist/apex/browser/`. The `vercel.json` configures the Vercel deploy with SPA rewrites and cache headers for static assets.

## Why this app exists

The skill ships green when this app builds and looks right. When `@spartan-ng/brain` releases a new alpha, the workflow is:

1. Bump the dep in `package.json` here
2. Run `npm install && npm run build` and `npm start`
3. Whatever breaks gets diagnosed against the new API surface
4. Fix the affected reference file in [`skills/spartan-ng-developer/references/`](../../skills/spartan-ng-developer/references)
5. Re-run the build, when it's clean, the skill is back in sync

Apex specifically validates Spartan/ng on **chat-shaped UI**, the conversation stream, markdown rendering, code blocks with syntax highlighting, resizable artifacts panel, serif typography, sticky composer, virtualized conversation list, mobile sheet sidebar. Components that Mission Control's dashboard layouts didn't exercise.
