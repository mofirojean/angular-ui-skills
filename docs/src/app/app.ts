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

  protected readonly mode = signal<'light' | 'dark'>('light');
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
      tracks: '@spartan-ng/brain v1.0.2',
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
      tracks: 'PrimeNG 21.1.9',
      logo: 'logos/primeng.svg',
      logoBg: 'bg-zinc-100 dark:bg-zinc-900',
    },
    {
      slug: 'ng-zorro-developer',
      name: 'ng-zorro-developer',
      library: 'NG-ZORRO',
      site: 'https://ng.ant.design',
      description:
        'Ant Design system for Angular, with LESS theming, internationalisation, and the full nz-* component set including services, drag-drop, and Watermark.',
      status: 'ready',
      tracks: 'ng-zorro-antd 21.3.2',
      logo: 'logos/ng-zorro.svg',
      logoBg: 'bg-sky-50 dark:bg-sky-950/30',
    },
    {
      slug: 'angular-material-developer',
      name: 'angular-material-developer',
      library: 'Angular Material',
      site: 'https://material.angular.dev',
      description:
        'Material 3 components with the mat.theme() Sass mixin, prebuilt palettes, density tuning, plus CDK primitives (Overlay, A11y, Drag-Drop, VirtualScroll).',
      status: 'ready',
      tracks: '@angular/material 22.0.2',
      logo: 'logos/angular-material.webp',
      logoBg: 'bg-pink-50 dark:bg-pink-950/30',
    },
    {
      slug: 'ui-craft',
      name: 'ui-craft',
      library: 'Cross-cutting',
      site: 'https://www.refactoringui.com',
      description:
        'Library-neutral design discipline, the three tells of an amateur dashboard, plus the Refactoring UI principles (hierarchy, spacing, typography, color, depth, finishing) mapped onto every library skill.',
      status: 'ready',
      tracks: 'Refactoring UI + 3 tells',
      logo: 'logos/ui-craft.svg',
      logoBg: 'bg-violet-50 dark:bg-violet-950/30',
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
      image: 'projects/apex-chat-dark-mode.png',
      demo: SITE_CONFIG.demos.apex,
    },
    {
      slug: 'switchboard',
      name: 'Switchboard',
      tagline: 'Support-ops helpdesk console',
      description:
        'A SaaS support / ticket-ops console with a flagship tickets table, Kanban drag-drop, ticket detail with splitter + comment thread, KB with Tree + Anchor TOC, settings with 5 anchored sections, and an agent management page with Modal + Transfer + QR pairing. Validates ng-zorro-developer.',
      stack: ['Angular v21', 'NG-ZORRO v21', 'LESS theming', '@angular/cdk', 'Zoneless'],
      skill: 'ng-zorro-developer',
      path: 'examples/switchboard',
      accent: 'from-blue-400/25 via-cyan-300/15 to-transparent',
      badges: ['Zinc palette', 'Cmd+K palette', '8 pages'],
      image: 'projects/switchboard.png',
      demo: SITE_CONFIG.demos.switchboard,
    },
    {
      slug: 'roster',
      name: 'Roster',
      tagline: 'HR + people management',
      description:
        'A people-ops console for a 200-person company, dashboard KPIs, flagship MatTable directory, tabbed employee profile with MatTree reporting line + Compensation MatDialog, CDK drag-drop onboarding kanban with a MatStepper wizard, time-off with calendar + requests + balances, reviews accordion with stepper wizard, settings with secondary MatSidenav. Validates angular-material-developer.',
      stack: ['Angular v21', 'Angular Material v21', 'Material 3', '@angular/cdk', 'ngx-transforms', 'Zoneless'],
      skill: 'angular-material-developer',
      path: 'examples/roster',
      accent: 'from-pink-400/25 via-rose-300/15 to-transparent',
      badges: ['Azure palette', 'M3 tokens', '9 routes'],
      image: 'projects/roster-light-mode.png',
      demo: SITE_CONFIG.demos.roster,
    },
    {
      slug: 'forge',
      name: 'Forge',
      tagline: 'Code review console',
      description:
        'A polished PR review surface for a fictional Angular monorepo team. Sidebar nav with pinned repos and CI-status dots, inbox queue, PR detail with tab strip (Conversation / Files / Commits / Checks) + reviewer avatars + activity timeline, author profile with stat cards, settings with sub-nav, ⌘K command palette navigating every route. Validates spartan-ng-developer on Spartan v1.0.',
      stack: ['Angular v21', 'Spartan/ng v1.0.1', 'Tailwind v4', 'ngx-sonner', '@ng-icons/lucide', 'Zoneless'],
      skill: 'spartan-ng-developer',
      path: 'examples/forge',
      accent: 'from-amber-500/25 via-orange-400/15 to-transparent',
      badges: ['Spartan v1.0', '⌘K palette', 'Sidebar nav'],
      image: 'projects/forge-inbox-dark-mode.png',
      demo: SITE_CONFIG.demos.forge,
    },
    {
      slug: 'echo',
      name: 'Echo',
      tagline: 'Local-first music player',
      description:
        'A real music player, not a mock. Drop MP3 / FLAC / WAV / OGG files and Echo extracts tags + cover art, computes waveform peaks, and stores everything in IndexedDB. Playback runs through a live Web Audio graph with a 5-band EQ wired to Knobs, a canvas waveform scrubber, drag-drop queue + playlists, MegaMenu browse facets, and OS media controls. Validates primeng-developer on media-shaped UI under real audio load.',
      stack: ['Angular v21', 'PrimeNG v21', 'Tailwind v4', 'Web Audio API', 'music-metadata', 'idb', 'Zoneless'],
      skill: 'primeng-developer',
      path: 'examples/echo',
      accent: 'from-violet-500/25 via-purple-400/15 to-transparent',
      badges: ['Real Web Audio', 'PWA', 'Lighthouse a11y 100'],
      image: 'projects/echo-light-mode.png',
      demo: SITE_CONFIG.demos.echo,
    },
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
        { tk: 'cmd', text: '    angular-ui-skills-master/skills/primeng-developer \\' },
        { tk: 'cmd', text: '    angular-ui-skills-master/skills/ng-zorro-developer \\' },
        { tk: 'cmd', text: '    angular-ui-skills-master/skills/angular-material-developer \\' },
        { tk: 'cmd', text: '    angular-ui-skills-master/skills/ui-craft' },
      ],
    },
    gemini: {
      label: 'Gemini CLI',
      lines: [
        { tk: 'cmd', text: 'mkdir -p ~/.gemini/skills && \\' },
        { tk: 'cmd', text: '  curl -fsSL https://github.com/mofirojean/angular-ui-skills/archive/master.tar.gz | \\' },
        { tk: 'cmd', text: '  tar -xz --strip-components=2 -C ~/.gemini/skills \\' },
        { tk: 'cmd', text: '    angular-ui-skills-master/skills/spartan-ng-developer \\' },
        { tk: 'cmd', text: '    angular-ui-skills-master/skills/primeng-developer \\' },
        { tk: 'cmd', text: '    angular-ui-skills-master/skills/ng-zorro-developer \\' },
        { tk: 'cmd', text: '    angular-ui-skills-master/skills/angular-material-developer \\' },
        { tk: 'cmd', text: '    angular-ui-skills-master/skills/ui-craft' },
        { tk: 'cmd', text: '' },
        { tk: 'cmd', text: '# Then in Gemini CLI:  /skills reload' },
      ],
    },
    cursor: {
      label: 'Cursor / Codex',
      lines: [
        { tk: 'cmd', text: 'mkdir -p .cursor/rules && \\' },
        { tk: 'cmd', text: '  for s in spartan-ng-developer primeng-developer ng-zorro-developer angular-material-developer ui-craft; do \\' },
        { tk: 'cmd', text: '    curl -fsSL "https://raw.githubusercontent.com/mofirojean/angular-ui-skills/master/skills/$s/SKILL.md" \\' },
        { tk: 'cmd', text: '      -o ".cursor/rules/$s.md"; \\' },
        { tk: 'cmd', text: '  done' },
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

  protected readonly agents: readonly { name: string; mark: string; tone: string }[] = [
    { name: 'Claude Code',    mark: 'CC', tone: 'amber' },
    { name: 'Cursor',         mark: 'CU', tone: 'zinc' },
    { name: 'Codex',          mark: 'CX', tone: 'emerald' },
    { name: 'GitHub Copilot', mark: 'GC', tone: 'zinc' },
    { name: 'Gemini',         mark: 'GM', tone: 'sky' },
    { name: 'Windsurf',       mark: 'WS', tone: 'cyan' },
    { name: 'Cline',          mark: 'CL', tone: 'rose' },
    { name: 'AMP',            mark: 'AM', tone: 'indigo' },
    { name: 'Antigravity',    mark: 'AG', tone: 'violet' },
    { name: 'ClawdBot',       mark: 'CB', tone: 'orange' },
    { name: 'Droid',          mark: 'DR', tone: 'emerald' },
    { name: 'Goose',          mark: 'GO', tone: 'yellow' },
    { name: 'Kilo',           mark: 'KI', tone: 'pink' },
    { name: 'Kiro CLI',       mark: 'KR', tone: 'teal' },
    { name: 'Nous Research',  mark: 'NR', tone: 'red' },
    { name: 'OpenCode',       mark: 'OC', tone: 'blue' },
    { name: 'Roo',            mark: 'RO', tone: 'fuchsia' },
    { name: 'Trae',           mark: 'TR', tone: 'lime' },
    { name: 'VS Code',        mark: 'VS', tone: 'blue' },
    { name: 'Zed',            mark: 'ZD', tone: 'slate' },
  ];

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

  protected copyInstall(event?: Event): void {
    event?.preventDefault();
    void this.copy('npx skills@latest add mofirojean/angular-ui-skills -g', 'hero-install');
  }

  protected installBlock(): string {
    return this.installCommands[this.installTab()].lines
      .filter((l) => l.tk !== 'com')
      .map((l) => l.text)
      .join('\n');
  }
}
