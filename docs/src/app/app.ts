import { ChangeDetectionStrategy, Component, DOCUMENT, computed, effect, inject, signal } from '@angular/core';

import { SITE_CONFIG } from './site.config';

interface Skill {
  readonly slug: string;
  readonly name: string;
  readonly library: string;
  readonly site: string;
  readonly description: string;
  readonly status: 'ready' | 'in-progress' | 'planned';
  readonly tracks: string;
  readonly logo: string;
  readonly logoBg: string;
}

interface Example {
  readonly slug: string;
  readonly name: string;
  readonly tagline: string;
  readonly description: string;
  readonly stack: readonly string[];
  readonly skill: string;
  readonly path: string;
  readonly accent: string;
  readonly badges: readonly string[];
  readonly image: string;
  readonly demo?: string;
}

type InstallTab = 'cli' | 'claude' | 'gemini' | 'cursor' | 'manual';

@Component({
  selector: 'app-root',
  imports: [],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  private readonly document = inject(DOCUMENT);

  protected readonly mode = signal<'light' | 'dark'>('dark');
  protected readonly modeIcon = computed(() => (this.mode() === 'light' ? '☾' : '☀'));
  protected readonly installTab = signal<InstallTab>('cli');
  protected readonly copiedKey = signal<string | null>(null);

  protected readonly year = new Date().getFullYear();

  protected readonly skills: readonly Skill[] = [
    {
      slug: 'spartan-ng-developer',
      name: 'spartan-ng-developer',
      library: 'Spartan/ng',
      site: 'https://www.spartan.ng',
      description:
        'Headless brain primitives + helm components, with theming via CSS variables and the hlm-tailwind-preset.',
      status: 'ready',
      tracks: '@spartan-ng/brain v0.0.1-alpha.696',
      logo: 'logos/spartan-ng.svg',
      logoBg: 'bg-rose-50 dark:bg-rose-950/40',
    },
    {
      slug: 'primeng-developer',
      name: 'primeng-developer',
      library: 'PrimeNG',
      site: 'https://primeng.org',
      description:
        'Full-featured PrimeNG v21 with Aura preset customization, definePreset patterns, and tailwindcss-primeui.',
      status: 'ready',
      tracks: 'PrimeNG v21',
      logo: 'logos/primeng.svg',
      logoBg: 'bg-zinc-100 dark:bg-zinc-900',
    },
    {
      slug: 'ng-zorro-developer',
      name: 'ng-zorro-developer',
      library: 'NG-ZORRO',
      site: 'https://ng.ant.design',
      description:
        'Ant Design system for Angular, with Less theming, internationalization, and the full nz-* component set.',
      status: 'planned',
      tracks: 'TBD',
      logo: 'logos/ng-zorro.svg',
      logoBg: 'bg-sky-50 dark:bg-sky-950/30',
    },
    {
      slug: 'angular-material-developer',
      name: 'angular-material-developer',
      library: 'Angular Material',
      site: 'https://material.angular.dev',
      description:
        'Material 3 components, ng-add schematics, design tokens, MDC migration patterns, and CDK primitives.',
      status: 'planned',
      tracks: 'TBD',
      logo: 'logos/angular-material.webp',
      logoBg: 'bg-pink-50 dark:bg-pink-950/30',
    },
  ];

  protected readonly examples: readonly Example[] = [
    {
      slug: 'mission-control',
      name: 'Mission Control',
      tagline: 'Agent ops dashboard',
      description:
        'A full-surface workspace for managing AI agents, runs, schedules, and a marketplace. Validates spartan-ng-developer end to end.',
      stack: ['Angular v21', 'Spartan/ng', 'Tailwind v4', 'ng-icons', 'signals'],
      skill: 'spartan-ng-developer',
      path: 'examples/mission-control',
      accent: 'from-blue-600/20 via-blue-500/10 to-transparent',
      badges: ['Light + Dark', 'Cmd+K', '7 pages'],
      image: 'projects/mission-control-dark-mode.png',
      demo: SITE_CONFIG.demos.missionControl,
    },
    {
      slug: 'quanta-desk',
      name: 'Quanta Desk',
      tagline: 'Portfolio + trading desk',
      description:
        'A dense, noir-themed trading desk with holdings, watchlists, research notes, and an order ticket. Validates primeng-developer.',
      stack: ['Angular v21', 'PrimeNG v21', 'Tailwind v4', 'Quill', 'Chart.js'],
      skill: 'primeng-developer',
      path: 'examples/quanta-desk',
      accent: 'from-zinc-700/30 via-zinc-800/20 to-transparent',
      badges: ['Dark-first', 'Cmd+K', '8 pages'],
      image: 'projects/quanta-desk-dark-mode.png',
      demo: SITE_CONFIG.demos.quantaDesk,
    },
    {
      slug: 'apex',
      name: 'Apex',
      tagline: 'Chat assistant interface',
      description:
        'A claude.ai-inspired chat UI with sidebar history, streaming reveal, markdown rendering, and a side-by-side artifacts panel. Validates spartan-ng-developer on a non-dashboard layout.',
      stack: ['Angular v21', 'Spartan/ng', 'Tailwind v4', 'ngx-markdown', 'highlight.js'],
      skill: 'spartan-ng-developer',
      path: 'examples/apex',
      accent: 'from-rose-400/25 via-orange-300/15 to-transparent',
      badges: ['Warm cream', 'Cmd+K', 'Artifacts panel'],
      image: 'projects/apex-dark-mode.png',
      demo: SITE_CONFIG.demos.apex,
    },
  ];

  protected readonly heroSnippet = [
    { kind: 'com', text: '# Install globally, available in every project' },
    { kind: 'cmd', text: 'npx skills@latest add mofirojean/angular-ui-skills -g' },
    { kind: 'gap', text: '' },
    { kind: 'com', text: '# CLI handles Claude Code, Cursor, Codex, and 10+ others' },
    { kind: 'out', text: '✓ Installed spartan-ng-developer' },
    { kind: 'out', text: '✓ Installed primeng-developer' },
    { kind: 'gap', text: '' },
    { kind: 'com', text: '# Then ask your assistant:' },
    { kind: 'prompt', text: '› Build me a Spartan/ng dashboard with a Cmd+K palette' },
  ];

  protected readonly tabKeys: readonly InstallTab[] = ['cli', 'claude', 'gemini', 'cursor', 'manual'];

  protected readonly installCommands: Record<InstallTab, { label: string; lines: { tk: string; text: string }[] }> = {
    cli: {
      label: 'Skills CLI',
      lines: [
        { tk: 'cmd', text: 'npx skills@latest add mofirojean/angular-ui-skills -g' },
      ],
    },
    claude: {
      label: 'Claude Code (direct)',
      lines: [
        { tk: 'cmd', text: 'mkdir -p ~/.claude/skills && \\' },
        { tk: 'cmd', text: '  curl -fsSL https://github.com/mofirojean/angular-ui-skills/archive/master.tar.gz | \\' },
        { tk: 'cmd', text: '  tar -xz --strip-components=2 -C ~/.claude/skills \\' },
        { tk: 'cmd', text: '    angular-ui-skills-master/skills/spartan-ng-developer \\' },
        { tk: 'cmd', text: '    angular-ui-skills-master/skills/primeng-developer' },
      ],
    },
    gemini: {
      label: 'Gemini CLI',
      lines: [
        { tk: 'cmd', text: 'mkdir -p ~/.gemini/skills && \\' },
        { tk: 'cmd', text: '  curl -fsSL https://github.com/mofirojean/angular-ui-skills/archive/master.tar.gz | \\' },
        { tk: 'cmd', text: '  tar -xz --strip-components=2 -C ~/.gemini/skills \\' },
        { tk: 'cmd', text: '    angular-ui-skills-master/skills/spartan-ng-developer \\' },
        { tk: 'cmd', text: '    angular-ui-skills-master/skills/primeng-developer' },
        { tk: 'cmd', text: '' },
        { tk: 'cmd', text: '# Then in Gemini CLI:  /skills reload' },
      ],
    },
    cursor: {
      label: 'Cursor / Codex',
      lines: [
        { tk: 'cmd', text: 'mkdir -p .cursor/rules && \\' },
        { tk: 'cmd', text: '  curl -fsSL https://raw.githubusercontent.com/mofirojean/angular-ui-skills/master/skills/primeng-developer/SKILL.md \\' },
        { tk: 'cmd', text: '  -o .cursor/rules/primeng.md' },
      ],
    },
    manual: {
      label: 'Other agents',
      lines: [
        { tk: 'cmd', text: 'curl -fsSL https://raw.githubusercontent.com/mofirojean/angular-ui-skills/master/skills/<skill>/SKILL.md \\' },
        { tk: 'cmd', text: '  >> <your-agent-file>' },
      ],
    },
  };

  protected readonly features = [
    {
      icon: 'M3 5h18M3 12h18M3 19h12',
      title: 'Per-library specialization',
      body: 'Each skill is pinned to a specific upstream version and focuses on its idioms. No generic Angular tips that get the imports wrong.',
    },
    {
      icon: 'M12 2l3 7h7l-5.5 4.5L18 21l-6-4-6 4 1.5-7.5L2 9h7z',
      title: 'Composable with angular-developer',
      body: 'Layer on top of Google\'s base angular-developer skill. The base handles signals, DI, forms, SSR. We handle the component library.',
    },
    {
      icon: 'M9 19V6l11-2v13M9 14l11-2M9 19a3 3 0 11-6 0 3 3 0 016 0zm11-2a3 3 0 11-6 0 3 3 0 016 0z',
      title: 'Validated by reference apps',
      body: 'Every skill ships with a complete example app that exercises the real component surface. The skill is right because the app builds.',
    },
    {
      icon: 'M13 10V3L4 14h7v7l9-11h-7z',
      title: 'Multi-runtime',
      body: 'Works with Claude Code, Cursor, Codex, GitHub Copilot, Gemini CLI, and others. One source of truth, many surfaces.',
    },
  ];

  protected readonly skillTree: readonly { line: string; tag?: string }[] = [
    { line: 'skills/spartan-ng-developer/' },
    { line: '├── SKILL.md', tag: 'router' },
    { line: '├── setup.md', tag: 'ng add + theme bootstrap' },
    { line: '└── references/' },
    { line: '    ├── theming.md', tag: 'CSS vars, hlm-tailwind-preset' },
    { line: '    ├── primitives.md', tag: 'brn-* headless components' },
    { line: '    ├── forms.md', tag: 'reactive forms + hlm-field' },
    { line: '    ├── dialogs.md', tag: 'brnDialog + signals' },
    { line: '    ├── tables.md', tag: 'hlm-table, sort, filter, paginate' },
    { line: '    └── a11y.md', tag: 'focus, ARIA, keyboard' },
  ];

  protected readonly skillRun: readonly { label: string; detail: string; mono?: boolean }[] = [
    {
      label: 'Your prompt',
      detail: '"Build a Spartan/ng dashboard with a Cmd+K palette"',
    },
    {
      label: 'angular-developer',
      detail: 'Loads first. Provides signals, standalone APIs, control flow, routing, forms, SSR, a11y.',
    },
    {
      label: 'spartan-ng-developer/SKILL.md',
      detail: 'Routes to references/primitives.md (brn-command palette) + references/theming.md (Cmd+K shortcut wiring).',
      mono: true,
    },
    {
      label: 'Generated code',
      detail: 'Uses HlmCommand, brn-command-input, the v0.0.1-alpha.696 API surface, and the helm preset already in your tailwind config.',
    },
  ];

  constructor() {
    effect(() => {
      this.document.documentElement.classList.toggle('dark', this.mode() === 'dark');
    });
  }

  protected toggleTheme(): void {
    this.mode.update((m) => (m === 'light' ? 'dark' : 'light'));
  }

  protected selectTab(tab: InstallTab): void {
    this.installTab.set(tab);
  }

  protected async copy(text: string, key: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(text);
      this.copiedKey.set(key);
      setTimeout(() => {
        if (this.copiedKey() === key) {
          this.copiedKey.set(null);
        }
      }, 1500);
    } catch {
      this.copiedKey.set(null);
    }
  }

  protected installBlock(): string {
    return this.installCommands[this.installTab()].lines
      .filter((l) => l.tk !== 'com')
      .map((l) => l.text)
      .join('\n');
  }

  protected statusLabel(status: Skill['status']): string {
    switch (status) {
      case 'ready':
        return 'Ready';
      case 'in-progress':
        return 'In progress';
      case 'planned':
        return 'Planned';
    }
  }
}
