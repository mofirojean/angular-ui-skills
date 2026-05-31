# Mission Control

A reference Angular application that validates the [`spartan-ng-developer`](../../skills/spartan-ng-developer) skill. Mission Control is an admin dashboard for a fictional AI agent platform: register agents, schedule runs, watch executions, install community agents from a marketplace.

**Live demo:** https://mission-control-drab-six.vercel.app

The point of this app is not the app itself, it's that building it proves the skill is correct. Every Spartan/ng component the skill documents has a natural home here; anywhere the generated code drifts from upstream, the skill gets fixed, not the app.

## Stack

- **Angular v21+** with standalone components, signals, control flow syntax
- **Spartan/ng** via `@spartan-ng/brain` (headless primitives) + `@spartan-ng/helm` (styled components, copied into `src/libs/`)
- **Tailwind v4** with the `hlm-tailwind-preset`
- **`@ng-icons/lucide`** for iconography
- **Reactive forms** throughout (Signal Forms when Angular v22 ships)

## Pages

| Route | What it exercises |
|---|---|
| `/` (Overview) | Cards, sparkline charts, status badges, list density |
| `/agents` | DataTable with sort, filter, pagination, inline edit, row expansion |
| `/agents/:id` | Tabs, dialog, form-field cluster, switches, sliders, file upload |
| `/runs` | Time-series chart, status pills, virtual-scroll log viewer |
| `/schedules` | Cron expression builder, weekday picker, date range |
| `/marketplace` | Carousel, command palette, badges, pagination |
| `/settings` | Tabbed form with avatar upload, accent picker, notification matrix |

## Run locally

```sh
npm install
npm start
```

Opens at http://localhost:4200. The dev server hot-reloads on save.

## Build

```sh
npm run build
```

Output lands in `dist/mission-control/browser/`. The `vercel.json` at the root of this folder configures the Vercel deploy to use that path with SPA rewrites for client-side routing.

## Notes for contributors

- The Helm components are copied into `src/libs/ui/` via the Spartan CLI (`ng g @spartan-ng/cli:ui`). Don't edit them directly unless you're patching Spartan itself, regenerate.
- The `command-palette.ts` Cmd+K palette is the shared shell-level navigation primitive. Routes register their own actions via the global commands array.
- Dark mode is the default. The `mode` signal in `app.ts` is initialised to `'dark'` and persists via the `dark` class on `<html>`.

## Why this app exists

The skill ships green when this app builds and looks right. When `@spartan-ng/brain` releases a new alpha, the workflow is:

1. Bump the dep in `package.json` here
2. Run `npm install && npm run build` and `npm start`
3. Whatever breaks gets diagnosed against the new API
4. Fix the affected reference file in [`skills/spartan-ng-developer/references/`](../../skills/spartan-ng-developer/references)
5. Re-run the build, when it's clean, the skill is back in sync

Without this app, the skill could drift silently. With it, drift becomes a build failure.
