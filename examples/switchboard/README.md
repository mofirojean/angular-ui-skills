# Switchboard

A reference Angular app built with [NG-ZORRO](https://ng.ant.design) to validate the [`ng-zorro-developer` skill](../../skills/ng-zorro-developer). The app is a fictional support-ops / helpdesk console for a SaaS company, picked because NG-ZORRO's Table, Drawer, Modal, Steps, Tree, and imperative service trio (Message / Notification / Modal) all map cleanly onto helpdesk surfaces.

> **Status**, complete. All 7 phases shipped per [`PLAN.md`](./PLAN.md). Two skill-drift fixes were caught during the build (`nz-tabset → nz-tabs`, `nz-statistic-countdown → nz-countdown`, plus the `NzModalService` + `NzDrawerService` provider gotcha), all folded back upstream into the skill's reference docs.

## Stack

- Angular v21, standalone, zoneless change detection (`provideZonelessChangeDetection`)
- `ng-zorro-antd@21.3.1`, LESS-variable theming with brand overrides (zinc-toned, single hue family in both modes)
- `@angular/cdk` for drag-drop, the kanban board, and overlay primitives
- Reactive Forms (Signal Forms moves in when Angular v22 ships stable)
- Mock data only, no backend

## What's inside

| Page | Surfaces |
|---|---|
| `/` Dashboard | KPI Statistics, 14-day SVG sparkline, agents on shift, recent tickets, announcements Carousel, FloatButton scroll-to-top |
| `/tickets` | Flagship Table with filters, sort, bulk-select toolbar, inline-edit priority, right-click context menu, expandable rows |
| `/tickets/:id` | PageHeader + Breadcrumb, Splitter, 4 Tabs (Conversation / Activity / Related / Customer), reply composer with Upload, side panel with Collapse + Countdown + KB suggestions |
| `/queues` | Three modes via Segmented: Kanban (CDK drag-drop, fixed column heads, scrollable card lists), Table, Calendar with `*nzDateCell` projection |
| `/kb` | Tree categories + Anchor TOC + Cascader + AutoComplete search + Rate widget |
| `/agents` | Agent Table with Progress load bars, programmatic NzModalService detail (Descriptions + Timeline + Transfer permissions + QRCode), invite Modal |
| `/settings` | Anchor side nav over 5 form sections, TimePicker per weekday, integrations cards with Popconfirm, billing Table |
| Global | ⌘K command palette Modal, notifications inbox Drawer, light + dark themes via runtime `<link>` swap |

## Theming

The dark theme ships as a separate CSS bundle (`theme-dark.css`) compiled from `src/theme-dark.less`. `ThemeService` toggles a `<link>` tag at runtime, the recommended NG-ZORRO recipe. Toggle from the header bulb icon.

The palette is a single zinc family in both modes:

| Layer | Light | Dark |
|---|---|---|
| Sider | `#18181b` (zinc-900) | `#09090b` (zinc-950) |
| Header | `#ffffff` | `#18181b` |
| Content | `#fafafa` | `#27272a` |
| Accent | `#2563eb` | `#60a5fa` |

## Provider setup, watch for

`NzModalService` and `NzDrawerService` are **not** marked `providedIn: 'root'` in NG-ZORRO v21. Component-level `imports: [NzModalModule]` registers the components but does not hoist the service into the root injector. For standalone bootstrap, register them in `app.config.ts`:

```ts
import { importProvidersFrom } from '@angular/core';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';

providers: [
  // ...
  importProvidersFrom(NzModalModule, NzDrawerModule),
],
```

`NzMessageService` and `NzNotificationService` are auto-providedIn root, no setup needed.

## Run it

```bash
npm install
npm run start    # dev server at http://localhost:4200
npm run build    # production build to dist/switchboard
```

## Where things live

```
src/
  styles.less                Base NG-ZORRO LESS theme + brand overrides + global thin scrollbar
  theme-dark.less            Dark-bundle entry, toggled at runtime by ThemeService
  app/
    app.config.ts            Providers (zoneless, animations, i18n, icons, NzModal + NzDrawer)
    app.routes.ts            8 lazy routes
    app.ts / app.html        App shell (sider + header + content + footer + drawer + palette template)
    icons.ts                 Registered icon set for <nz-icon>
    core/
      nav.ts                 Sider nav config (sections, items, badge keys)
      theme.service.ts       Light / dark mode toggle + persistence
    data/
      mock-data.ts           Tickets, agents, messages, activity, announcements, KB, notifications, permissions
      data.service.ts        Signals + mutators
    pages/                   8 routed pages
    shared/
      sparkline/             SVG mini-chart used on the dashboard
      command-palette/       ⌘K palette opened by NzModalService
      notifications-inbox/   Drawer body for the header bell
```

## Why this app

NG-ZORRO is enterprise-first; a helpdesk console hits its strengths without feeling forced. Per the [PLAN.md](./PLAN.md) coverage table, every component the skill documents gets used here at least once. When the build exposed a gap in the skill, the skill was fixed first, then the app kept moving.
