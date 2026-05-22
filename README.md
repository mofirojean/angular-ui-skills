# Angular UI Skills

Agent skills that teach AI coding assistants (Claude Code, Cursor, Codex, GitHub Copilot, and others) how to build Angular apps with popular UI component libraries. Each skill is specialized per library while staying composable with the `angular-developer` base skill from Google.

## Skills

| Skill | Library | Status |
|---|---|---|
| [`spartan-ng-developer`](./skills/spartan-ng-developer) | [Spartan/ng](https://spartan.ng) | 🚧 In progress |
| `primeng-developer` | [PrimeNG](https://primeng.org) | ⏳ Planned |
| `ng-zorro-developer` | [NG-ZORRO](https://ng.ant.design) | ⏳ Planned |
| `angular-material-developer` | [Angular Material](https://material.angular.dev) | ⏳ Planned |

> Each skill is designed as an **extension** to `angular-developer`. Install both for the best experience - the base skill covers Angular fundamentals (signals, DI, routing, forms, SSR, accessibility), and the UI-library skill layers in library-specific guidance on top.

## Install

### Recommended - via the `skills` CLI

```sh
npx skills@latest add mofirojean/angular-ui-skills
```

The CLI walks you through picking which skills to install and which AI agent runtimes to target. Works with 14+ runtimes including Claude Code, Cursor, Codex, GitHub Copilot, and Gemini CLI.

### Manual - Claude Code

```sh
git clone https://github.com/mofirojean/angular-ui-skills
cp -r angular-ui-skills/skills/spartan-ng-developer ~/.claude/skills/
```

## Why per-library skills?

Angular UI libraries differ significantly in their architecture, theming model, and conventions. A single "Angular UI" skill would either be a vague compromise or balloon past a usable context window. Specialized skills mean the agent activates the right one for your project, learns its idioms, and generates code that matches its conventions.

## Contributing

Contributions welcome - new libraries, improvements to existing skills, or fixes. See individual skill folders for their structure and conventions.

## License

[MIT](./LICENSE)
