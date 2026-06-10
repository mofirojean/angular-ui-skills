# Switchboard

A reference Angular app built with [NG-ZORRO](https://ng.ant.design) to validate the [`ng-zorro-developer` skill](../../skills/ng-zorro-developer). The app is a fictional support-ops / helpdesk console for a SaaS company, picked because NG-ZORRO's Table, Drawer, Modal, Steps, Tree, and imperative service trio (Message / Notification / Modal) all map cleanly onto helpdesk surfaces.

> **Status**, Phase 0. App shell scaffolded, all 8 routes registered with stubs. Real screens land phase by phase per [`PLAN.md`](./PLAN.md).

## Stack

- Angular v21, standalone, zoneless change detection
- `ng-zorro-antd@21.3.1`, LESS-variable theming with brand overrides
- `@angular/cdk` for drag-drop and overlay primitives
- Reactive Forms (Signal Forms once Angular v22 ships stable)
- Mock data only, no backend

## Dark mode

The dark theme ships as a separate CSS bundle (`theme-dark.css`) compiled from `src/theme-dark.less`. `ThemeService` toggles a `<link>` tag at runtime, the recommended NG-ZORRO recipe. Toggle from the header bulb icon.

## Run it

```bash
npm install
npm run start    # dev server at http://localhost:4200
npm run build    # production build to dist/switchboard
```

## Where things live

```
src/
  styles.less                Base NG-ZORRO LESS theme + brand overrides
  theme-dark.less            Dark-bundle entry, toggled at runtime
  app/
    app.config.ts            Providers (zoneless, animations, i18n, icons, modal, message, notification, drawer)
    app.routes.ts            8 lazy routes
    app.ts / app.html        Layout shell (sider + header + content + footer)
    icons.ts                 Registered icon set for <nz-icon>
    core/
      nav.ts                 Sider nav config
      theme.service.ts       Light / dark mode toggle
    pages/                   Route stubs, filled phase by phase
```

## Why this app

NG-ZORRO is enterprise-first; a helpdesk console hits its strengths without feeling forced. Per the [PLAN.md](./PLAN.md), every component the skill documents gets used here at least once. If the build exposes a gap in the skill, fix the skill, then keep building.
