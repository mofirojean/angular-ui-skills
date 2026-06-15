# Angular UI Skills

![Angular UI Skills banner](https://raw.githubusercontent.com/mofirojean/angular-ui-skills/master/docs/public/projects/add-to-readme.png)

Per-library agent skills that teach AI coding assistants (Claude Code, Cursor, Codex, Copilot, Gemini, and 15 more) how to build real Angular apps. Composes with Google's `angular-developer` base skill.

## Install

```sh
npx skills@latest add mofirojean/angular-ui-skills -g
```

Drop the `-g` for a project-scoped install.

## Skills

| Skill | Library | Tracks |
|---|---|---|
| [`spartan-ng-developer`](./skills/spartan-ng-developer) | Spartan/ng | `@spartan-ng/brain` 0.0.1-alpha.714 |
| [`primeng-developer`](./skills/primeng-developer) | PrimeNG | 21.1.9 |
| [`ng-zorro-developer`](./skills/ng-zorro-developer) | NG-ZORRO | `ng-zorro-antd` 21.3.1 |
| `angular-material-developer` | Angular Material | planned |

Each skill is validated by a deployed reference app under [`examples/`](./examples).

## Links

- **Docs + live demos**: <https://angular-ui-skills-docs.vercel.app>
- **Issues / contributing**: <https://github.com/mofirojean/angular-ui-skills/issues>

## Manual install

If you don't want the CLI, clone a single SKILL into your agent's folder:

```sh
mkdir -p ~/.claude/skills && \
  curl -fsSL https://github.com/mofirojean/angular-ui-skills/archive/master.tar.gz | \
  tar -xz --strip-components=2 -C ~/.claude/skills \
    angular-ui-skills-master/skills/spartan-ng-developer \
    angular-ui-skills-master/skills/primeng-developer \
    angular-ui-skills-master/skills/ng-zorro-developer
```

For Cursor, drop a `SKILL.md` into `.cursor/rules/`. For other agents, copy any `skills/<name>/SKILL.md` into the agent's skill or rules folder.

## License

MIT
