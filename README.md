# Angular UI Skills

Agent skills that teach AI coding assistants (Claude Code, Cursor, Codex, GitHub Copilot, and others) how to build Angular apps with popular UI component libraries. Each skill is specialized per library while staying composable with the `angular-developer` base skill from Google.

## Skills

| Skill | Library | Status | Tracks |
|---|---|---|---|
| [`spartan-ng-developer`](./skills/spartan-ng-developer) | [Spartan/ng](https://spartan.ng) | ✅ Ready | `@spartan-ng/brain` v0.0.1-alpha.696 |
| [`primeng-developer`](./skills/primeng-developer) | [PrimeNG](https://primeng.org) | ✅ Ready | PrimeNG v21 |
| `ng-zorro-developer` | [NG-ZORRO](https://ng.ant.design) | ⏳ Planned | — |
| `angular-material-developer` | [Angular Material](https://material.angular.dev) | ⏳ Planned | — |

> **Update cadence.** Each skill is pinned to a specific upstream library version (see *Tracks*). When the upstream ships a new release, the skill is re-validated against it and the *Tracks* column is bumped. Open an issue if you spot drift between a skill's docs and the version it claims to track.

> Each skill is designed as an **extension** to `angular-developer`. Install both for the best experience. The base skill covers Angular fundamentals (signals, DI, routing, forms, SSR, accessibility), and the UI-library skill layers in library-specific guidance on top.

## Quick start

```sh
npx skills@latest add mofirojean/angular-ui-skills -g
```

That's the headline. The rest of this README covers what just happened, alternative install paths, per-agent recipes, and how to verify it worked.

## Install (in depth)

### Option 1, the Skills CLI (recommended for most users)

The [`skills` CLI](https://github.com/vercel-labs/skills) handles agent runtimes for you. It works with Claude Code, Cursor, Codex CLI, GitHub Copilot, Continue, Cline, Roo Code, Windsurf, Aider, and others. Gemini CLI isn't in the CLI's prompted runtime list, but it auto-discovers skills from `~/.agents/skills/`, which is where the CLI stores them, so a global install still works for Gemini (run `/skills reload` afterwards).

**Global install** (skills available in every project):

```sh
npx skills@latest add mofirojean/angular-ui-skills -g
```

**Project-scoped install** (only available when you invoke your agent from this project's directory, committable with the repo so your team gets the same skills):

```sh
npx skills@latest add mofirojean/angular-ui-skills
```

#### How the CLI lays things out on disk

The `skills` CLI uses a two-tier architecture. Knowing this avoids the "wait, where did my skill go?" moment.

**Global install** places files like this:

```
~/.agents/skills/spartan-ng-developer/   ← real files (the source store)
~/.agents/skills/primeng-developer/

~/.claude/skills/spartan-ng-developer  →  symlink to ~/.agents/skills/spartan-ng-developer
~/.claude/skills/primeng-developer     →  symlink to ~/.agents/skills/primeng-developer
~/.cursor/rules/spartan-ng-developer.md → (if Cursor is detected)
~/.codex/...                            → (if Codex is detected)
```

**Project install** places files in the same structure but rooted at your current directory: `.agents/skills/<name>/` (storage) and `.claude/skills/<name>` (symlink).

The `.agents/` directory is the canonical source. The agent-specific folders (`.claude/`, `.cursor/`, etc.) contain symlinks pointing back to `.agents/`. Your AI assistant reads from the agent-specific folder and follows the symlink.

**Gemini CLI compatibility**: because Gemini auto-reads `~/.agents/skills/`, a global Vercel CLI install (`-g`) does work for Gemini, you just need to run `/skills reload` in Gemini after the install.

**Symlinks on Windows** require Developer Mode enabled (Settings → Update & Security → For developers → Developer Mode). If symlinks don't work on your system, use Option 2 below or the install script above.

### Option 2, direct tarball download (no script, no CLI)

Useful if you don't want the `.agents/` layer, want to install just one skill, or want full control over the destination:

```sh
mkdir -p ~/.claude/skills && \
  curl -fsSL https://github.com/mofirojean/angular-ui-skills/archive/master.tar.gz | \
  tar -xz --strip-components=2 -C ~/.claude/skills \
    angular-ui-skills-master/skills/spartan-ng-developer \
    angular-ui-skills-master/skills/primeng-developer
```

This downloads only the two skill folders from a tarball and extracts them directly into `~/.claude/skills/` with no intermediate clone, no symlinks. The folder lands where Claude Code reads from.

**To install just one skill**, drop the unwanted line from the `tar` command. **To install project-scoped**, swap `~/.claude/skills` for `.claude/skills`. **To install for Gemini CLI**, swap for `~/.gemini/skills`.

### Option 3, manual per agent

The skill is plain markdown. If you'd rather wire it up yourself, or if your agent isn't on the supported list of the Skills CLI:

| Agent | Where the skill goes | How to install |
|---|---|---|
| **Claude Code** | `~/.claude/skills/<name>/` or `.claude/skills/<name>/` | Use the tarball command from Option 2 |
| **Gemini CLI** | `~/.gemini/skills/<name>/` or `~/.agents/skills/<name>/` | Use the Gemini tarball command below, then `/skills reload` |
| **Cursor** | `.cursor/rules/<name>.md` (project root) | Copy `SKILL.md` into a single rules file with a frontmatter header (`description`, `globs`) |
| **GitHub Copilot** | `.github/copilot-instructions.md` (one file per repo) | Append `SKILL.md` contents to the existing file |
| **OpenAI Codex CLI** | `AGENTS.md` (repo root) | Append `SKILL.md` contents |
| **Aider** | `CONVENTIONS.md` (repo root) | Append `SKILL.md` contents |
| **Cline / Roo Code** | `.clinerules` (workspace) | Append `SKILL.md` contents |
| **Windsurf** | `.windsurfrules` (repo root) | Append `SKILL.md` contents |
| **Continue** | `.continue/rules/<name>.md` | Copy `SKILL.md` directly |

**Gemini CLI specifically** has its own skills system (`/skills` command). It reads from `~/.gemini/skills/`, `~/.agents/skills/`, `.gemini/skills/`, and `.agents/skills/`, in that order. Drop the skill folders directly into one of those paths:

```sh
mkdir -p ~/.gemini/skills && \
  curl -fsSL https://github.com/mofirojean/angular-ui-skills/archive/master.tar.gz | \
  tar -xz --strip-components=2 -C ~/.gemini/skills \
    angular-ui-skills-master/skills/spartan-ng-developer \
    angular-ui-skills-master/skills/primeng-developer
```

Then in your Gemini CLI session, run `/skills reload` followed by `/skills list` to confirm both `spartan-ng-developer` and `primeng-developer` appear. Note the **`-ng-`** in the name, not `-ui-`.

**Generic curl + append** pattern for the "append to a file" agents (Copilot, Codex CLI, Aider, Windsurf, Cline):

```sh
curl -fsSL https://raw.githubusercontent.com/mofirojean/angular-ui-skills/master/skills/primeng-developer/SKILL.md \
  >> AGENTS.md   # or CONVENTIONS.md, .windsurfrules, etc.
```

Reference files (`skills/<name>/references/*.md`) are loaded by the SKILL.md router via path references, so you typically want both `SKILL.md` and the `references/` folder available together. The tarball approach already grabs both.

## Verify the install worked

After installing, start your agent and ask it something specific to the library. For example:

> Generate a Spartan/ng login form using `hlm-input`, with reactive forms validation and accessible error messages.

If the agent:

- Imports `@spartan-ng/helm/input` correctly
- Uses `input()` / `output()` signal-based APIs instead of `@Input()` / `@Output()` decorators
- Wires up `hlm-error` for the validation messages
- Uses Tailwind classes consistent with the `hlm-tailwind-preset`

The skill is loaded and working. If it's writing pre-v18 patterns or unfamiliar with `hlm-*` components, the agent didn't pick it up. Common causes:

- You installed project-scoped but invoked your agent from a different directory
- You installed globally but your project has a `.claude/skills/` directory that shadows the global one (check both)
- Symlinks aren't following on Windows without Developer Mode (use Option 2)
- The agent runtime caches loaded skills, restart it

## Update skills

**Via the CLI:**

```sh
npx skills@latest update mofirojean/angular-ui-skills -g
```

**Via the direct download:** rerun the tarball command from Option 2. The extract will overwrite the existing files. Your local edits, if any, will be lost, so put a fork upstream if you customize.

## Why per-library skills?

Angular UI libraries differ significantly in their architecture, theming model, and conventions. A single "Angular UI" skill would either be a vague compromise or balloon past a usable context window. Specialized skills mean the agent activates the right one for your project, learns its idioms, and generates code that matches its conventions.

Each skill is also pinned to a specific upstream version. PrimeNG v18 → v21 had real breaking changes (Aura preset migration, removed `prime.css`, renamed file upload APIs). Spartan/ng moves weekly. Without version pinning, a model that's "seen all of them" will mix patterns. With version pinning, the skill describes exactly the API surface your project is on.

## Validated by reference apps

Two complete Angular apps live in [`examples/`](./examples). Each one is the integration test for its corresponding skill:

- [**Mission Control**](./examples/mission-control) validates `spartan-ng-developer`. A multi-page agent ops dashboard built with Spartan/ng + Tailwind v4 + ng-icons. [Live demo](https://mission-control-drab-six.vercel.app).
- [**Quanta Desk**](./examples/quanta-desk) validates `primeng-developer`. A noir trading desk built with PrimeNG v21 + Tailwind v4 + Quill + Chart.js. [Live demo](https://quanta-desk.vercel.app).

When an upstream library releases a new version, the workflow is:

1. Update the example app to the new version
2. Fix whatever breaks
3. Fold the findings (renamed components, deprecated patterns, new conventions) back into the skill's reference files
4. Bump the *Tracks* column in this README

If the example builds clean, the skill is right. If it doesn't, the skill is wrong, not the library.

## Contributing

Contributions welcome. New libraries, improvements to existing skills, or fixes.

**Adding a new library skill** follows this pattern:

1. Create `skills/<library>-developer/SKILL.md` with frontmatter (`name`, `description`, `version-tracks`).
2. Add topic-scoped reference files under `skills/<library>-developer/references/` (`theming.md`, `forms.md`, `accessibility.md`, etc.). Keep `SKILL.md` as a router that points to them, not a wall of content.
3. Build a reference Angular app under `examples/<name>/` that exercises the skill's real component surface. The app must build clean against the library version the skill targets.
4. Open a PR.

For details on how each skill is structured internally, browse the existing two under [`skills/`](./skills). The pattern repeats.

## License

[MIT](./LICENSE)