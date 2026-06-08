# Theming

NG-ZORRO ships two theming layers. The default (LESS variables) is what most projects use. The dynamic CSS-variable theme is **experimental** and gated behind opt-in imports.

## LESS variables (default, recommended)

Override variables in your project's `src/styles.less`:

```less
@import "../node_modules/ng-zorro-antd/ng-zorro-antd.less";

@primary-color: #2563eb;
@border-radius-base: 6px;
@font-family: "Inter", -apple-system, system-ui, sans-serif;
```

Wire LESS in `angular.json`:

```json
"styles": ["src/styles.less"]
```

NG-ZORRO has hundreds of override-able variables. Browse the canonical list at <https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/components/style/themes/default.less>.

The most useful ones to know:

| Variable | Purpose |
|---|---|
| `@primary-color` | Brand colour, drives buttons, focus rings, links |
| `@border-radius-base` | Default radius for inputs, buttons, cards |
| `@font-family` | Project font stack |
| `@font-size-base` | Default `14px`, bump for denser/sparser UIs |
| `@text-color` | Body text |
| `@text-color-secondary` | Captions, helper text |
| `@disabled-color` | Disabled state text and bg |
| `@background-color-base`, `@component-background` | Surface vs panel separation |
| `@layout-header-background`, `@layout-sider-background` | App shell |
| `@menu-dark-bg`, `@menu-dark-color` | Dark-side menu palette |

For dynamic-only changes (no LESS rebuild), use the four shipped CSS bundles described next.

## Shipped theme presets

NG-ZORRO ships four pre-built themes as both `.less` and `.css`:

| Preset | LESS path | CSS bundle |
|---|---|---|
| **Default** | `ng-zorro-antd/ng-zorro-antd.less` | `ng-zorro-antd/ng-zorro-antd.min.css` |
| **Dark** | `ng-zorro-antd/ng-zorro-antd.dark.less` | `ng-zorro-antd/ng-zorro-antd.dark.min.css` |
| **Compact** | `ng-zorro-antd/ng-zorro-antd.compact.less` | `ng-zorro-antd/ng-zorro-antd.compact.min.css` |
| **Aliyun** | `ng-zorro-antd/ng-zorro-antd.aliyun.less` | `ng-zorro-antd/ng-zorro-antd.aliyun.min.css` |

Pick one as the base in `angular.json` styles. Dark is the most useful in practice, compact tightens spacing by ~15%, aliyun is Alibaba's internal palette.

## Runtime theme switching (default approach)

The supported recipe is "replace the `<link>` tag at runtime". Build both light and dark CSS bundles, then swap the `href` on a `<link rel="stylesheet">` you control. Documented at <https://ng.ant.design/docs/customize-theme/en>.

For component-level dark / compact variants on the same page (e.g. a dark sidebar in a light app), use the `nzTheme="dark"` input on Menu / Sider, NG-ZORRO toggles the relevant classes.

## Dynamic theme (experimental, v17+)

Opt in with the dynamic-theme LESS entrypoint:

```less
@import "../node_modules/ng-zorro-antd/style/dynamic-theme/dynamic-theme.less";
```

This compiles NG-ZORRO's tokens as CSS custom properties (`--ant-primary-color`, etc.) so you can change them at runtime without rebuilding LESS:

```ts
document.documentElement.style.setProperty('--ant-primary-color', '#ff4d4f');
```

**Status, experimental.** Coverage is partial, some deep component internals still resolve through LESS. Suitable for marketing surfaces with a colour-picker demo, not yet a drop-in replacement for the LESS approach in production.

## stylePreprocessorOptions

If you want to `@import` your own LESS mixins without relative paths, configure include paths in `angular.json`:

```json
"stylePreprocessorOptions": {
  "includePaths": ["src/styles"]
}
```

This lets `styles.less` write `@import "tokens.less";` from `src/styles/tokens.less`.

## Common pitfalls

1. **Importing both LESS and CSS bundles.** Symptom: doubled styles, last-wins overrides. Pick one form per build.
2. **Overriding `@primary-color` from a global CSS rule.** LESS variables resolve at compile time, runtime CSS rules can't reach them. Override the variable in `.less`, not in `.css`.
3. **Editing files under `node_modules/ng-zorro-antd/...`.** Won't survive `npm install`. Always override in your own `.less`.
4. **Dark mode without dark-side classnames.** Some components (Menu, Layout.Sider) need `nzTheme="dark"`, the CSS bundle alone doesn't recolour them.