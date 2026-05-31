# Quanta Desk

A reference Angular application that validates the [`primeng-developer`](../../skills/primeng-developer) skill. Quanta Desk is a portfolio / trading desk dashboard for a fictional retail brokerage: watchlists, holdings with tax-lot drilldown, performance charts, an order ticket, research notes, market news.

**Live demo:** https://quanta-desk.vercel.app

The point of this app is not the app itself, it's that building it proves the skill is correct. Every PrimeNG component the skill documents gets exercised here; if upstream drifts, the build breaks first.

## Stack

- **Angular v21+** with standalone components, signals, control flow syntax
- **PrimeNG v21** with `@primeuix/themes` (Aura preset, customized to a noir zinc palette) + `@primeuix/styles`
- **Tailwind v4** with `tailwindcss-primeui` for the unstyled-mode utilities
- **Quill** for the rich-text editor (`<p-editor>`)
- **Chart.js** for `<p-chart>`
- **Reactive forms** throughout

## Pages

| Route | What it exercises |
|---|---|
| `/` (Dashboard) | KPI cards, performance chart, sector allocation pie, top movers table |
| `/holdings` | Table with sort, frozen column, row expansion, inline edit, ContextMenu |
| `/holdings/:ticker` | Breadcrumb, Splitter, Tabs, TreeTable (tax lots), Editor (notes), FileUpload (documents) |
| `/watchlist` | PickList (universe ⇄ watchlist), DataView grid/list switcher, sparkline cards |
| `/trade` | Splitter order ticket: chart left, ticket right, Slider, SelectButton, ConfirmDialog, Toast |
| `/trades` | DatePicker range, MultiSelect, AutoComplete, SelectButton filters, DialogService for trade-detail drawer |
| `/research` | MegaMenu, DataView grid/list, TieredMenu popup, Dialog with Editor for compose |
| `/settings` | Five-tab form: Profile (FloatLabel + IftaLabel + InputMask + ColorPicker), Trading prefs (Knob + Slider + Rating + ToggleSwitch), Notifications matrix, API keys (IconField + Table + ConfirmDialog), Billing (MeterGroup + ProgressBar + invoice Table) |

## Run locally

```sh
npm install
npm start
```

Opens at http://localhost:4200. Hot-reloads on save.

## Build

```sh
npm run build
```

Output lands in `dist/quanta-desk/browser/`. The `vercel.json` here configures the Vercel deploy with SPA rewrites for client-side routing.

## Notes for contributors

- The theme preset lives in `src/app/theme/quanta-preset.ts`. It customizes Aura with a zinc primary palette and dark-first surface colours. Touch this file rather than the component-level overrides, the theme has a lot of cascading dependents.
- Tailwind v4 + PrimeNG v21 needs `@custom-variant dark (&:where(.dark, .dark *))` in `styles.css` for class-based dark mode to compose with PrimeNG tokens. Don't remove it.
- Several components have visual escape hatches in `styles.css` for things their API doesn't expose: badge/tag density, menu popup sizing, chart container layout, Quill editor placeholder colour, `p-fileupload` choose-button label. Search for `.p-` selectors in that file before adding new ones.
- The `command-palette.ts` Cmd+K palette is the global navigation primitive. The header search button opens it via `viewChild`.
- Dark mode is the default. Toggle persists via the `dark` class on `<html>`.

## Why this app exists

The skill ships green when this app builds and looks right. When PrimeNG releases a new version, the workflow is:

1. Bump the dep in `package.json` here
2. Run `npm install && npm run build` and `npm start`
3. Whatever breaks gets diagnosed against the new API surface
4. Fix the affected reference file in [`skills/primeng-developer/references/`](../../skills/primeng-developer/references)
5. Re-run the build, when it's clean, the skill is back in sync

Without this app, the skill could drift silently between PrimeNG releases. With it, drift becomes a build failure.
