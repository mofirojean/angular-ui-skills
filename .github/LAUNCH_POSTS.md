# Launch posts, ready to copy-paste

The `npx skills add` command needs to be in every post because that's the install metric the leaderboard ranks by. Drop the docs link as the second clickable.

---

## X / Twitter (240-char fit, no em dashes)

### Variant A, technical

```
Spent the last few weeks building agent skills that teach AI coding assistants (Claude Code, Cursor, Copilot, Gemini, ...) how to ship real Angular apps with PrimeNG, Spartan/ng, and NG-ZORRO.

3 skills, 4 reference apps, all open source.

npx skills@latest add mofirojean/angular-ui-skills -g

https://angular-ui-skills-docs.vercel.app
```

### Variant B, problem-first

```
Asked Claude Code to build an Angular admin with NG-ZORRO last month and it confidently invented a `nz-tabset` selector that hasn't existed since v21.

So I built skills that pin to the real component surface. PrimeNG, Spartan/ng, and NG-ZORRO covered, each validated by a deployed reference app.

npx skills@latest add mofirojean/angular-ui-skills -g

https://angular-ui-skills-docs.vercel.app
```

### Variant C, leaderboard-flavoured

```
Open-sourced 3 agent skills for Angular UI libraries today.

✅ spartan-ng-developer (tracks @spartan-ng/brain@alpha.714)
✅ primeng-developer (tracks PrimeNG 21.1.9)
✅ ng-zorro-developer (tracks ng-zorro-antd@21.3.1)

Composes with Google's angular-developer base skill.

npx skills@latest add mofirojean/angular-ui-skills -g
```

---

## LinkedIn (long-form, no em dashes)

```
A few months ago I asked an AI coding assistant to build a small Angular settings page with NG-ZORRO. It cheerfully invented a `nz-tabset` selector that hasn't existed in NG-ZORRO since v21, then hallucinated a `provideNzModal()` helper that has never shipped. The code looked right, ran nowhere.

That's the gap I've been working on for the last few weeks: per-library agent skills that pin to the actual component surface, with reference example apps that validate every claim.

Today I'm open-sourcing three of them.

→ spartan-ng-developer (tracks @spartan-ng/brain@0.0.1-alpha.714)
→ primeng-developer (tracks PrimeNG 21.1.9)
→ ng-zorro-developer (tracks ng-zorro-antd@21.3.1)

Each one pairs with Google's angular-developer base skill, so the agent picks up Angular fundamentals from there and the library-specific patterns from these. The skills work with Claude Code, Cursor, Codex, GitHub Copilot, Continue, Cline, Roo Code, Windsurf, Aider, and Gemini.

Every skill ships with a full reference app: Mission Control (agent dashboard) and Apex (Claude-style chat) for Spartan/ng, Quanta Desk (trading desk) for PrimeNG, and Switchboard (helpdesk console) for NG-ZORRO. The apps catch drift the docs miss. When the build broke on `nz-tabset`, I fixed the skill upstream the same day.

One command to install across every agent runtime:

  npx skills@latest add mofirojean/angular-ui-skills -g

Docs and live demos: https://angular-ui-skills-docs.vercel.app
Source: https://github.com/mofirojean/angular-ui-skills

MIT licensed. Issues and PRs welcome, especially if your team uses a different Angular UI library and would benefit from a fourth specialization.
```

---

## Hacker News (Show HN format)

Title:
```
Show HN: Per-library agent skills for Angular UI (Spartan, PrimeNG, NG-ZORRO)
```

First-comment body (no em dashes):

```
Hi HN, I've been frustrated by AI coding assistants hallucinating Angular UI APIs that don't exist (or were renamed two majors ago), so I built per-library skills that pin to the actual component surface.

What's in the repo:
- 3 ready skills: spartan-ng-developer, primeng-developer, ng-zorro-developer
- 4 reference apps that exercise each skill's documented surface end-to-end and catch drift before publishing
- A docs site with cards linking each skill to its validating app: https://angular-ui-skills-docs.vercel.app

Install with one command across Claude Code, Cursor, Codex, Copilot, Gemini, and 10+ other runtimes:

  npx skills@latest add mofirojean/angular-ui-skills -g

The pattern that worked: write the skill, build a real app with it, fix the drift the app surfaced, ship both. Two cases in the NG-ZORRO skill alone (nz-tabset that no longer exists, and a fictional provideNzModal() helper) were caught and fixed via this loop.

Looking for feedback on what other Angular UI libraries deserve their own specialization. Angular Material is the obvious next one.

Repo: https://github.com/mofirojean/angular-ui-skills
```
