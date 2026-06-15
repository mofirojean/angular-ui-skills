# Issue to file at `vercel-labs/skills`

URL: <https://github.com/vercel-labs/skills/issues/new>

Suggested title:

```
Add: mofirojean/angular-ui-skills (Angular UI component library skills)
```

---

## Body (copy-paste)

```markdown
**Add `mofirojean/angular-ui-skills` to the Skills index.**

This is a per-library agent-skill bundle for Angular UI component libraries. It pairs with Google's `angular-developer` base skill and adds specialized guidance for each major Angular UI library so the agent activates the right one when it sees a project's `package.json`.

### What's in the repo

- 3 ready skills (Angular Material is planned):
  - `spartan-ng-developer` — Spartan/ng, tracking `@spartan-ng/brain@0.0.1-alpha.714`
  - `primeng-developer` — PrimeNG, tracking `21.1.9` with `@primeuix/themes 2.x`
  - `ng-zorro-developer` — NG-ZORRO, tracking `ng-zorro-antd@21.3.1`
- 4 reference example apps that validate the skills end-to-end:
  - Mission Control (agent ops dashboard) — Spartan/ng
  - Apex (Claude-style chat UI) — Spartan/ng
  - Quanta Desk (portfolio + trading desk) — PrimeNG
  - Switchboard (helpdesk console) — NG-ZORRO

### Install command

```
npx skills@latest add mofirojean/angular-ui-skills -g
```

### Links

- Repo: https://github.com/mofirojean/angular-ui-skills
- Docs + live demos: https://angular-ui-skills-docs.vercel.app
- License: MIT

### Why it should be in the index

- Each skill is validated by a real, deployed reference app (drift caught and fixed before publishing).
- Pinned to a specific upstream library version with a documented re-validation cadence; the README's *Tracks* column bumps when the skill is re-validated.
- Per-library specialization avoids the "vague Angular UI" trap that would balloon past a usable context window.
- Composes with the existing `angular-developer` base skill rather than replacing it.

Happy to send a PR if you'd prefer that route.
```

---

## After filing

1. Watch the issue for any maintainer feedback on the description or metadata.
2. If the maintainers ask for a PR against a registry file, the canonical entry shape is `<org>/<repo>` so this is just adding one line.
3. Once accepted, the `find-skills` index will list it; the leaderboard ranks by install count via `npx skills add`.
