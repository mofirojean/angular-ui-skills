export interface ProjectFile {
  readonly id: string;
  readonly name: string;
  readonly size: string;
  readonly addedAt: string;
}

export interface Project {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly icon: string;
  readonly accent: string;
  readonly conversationCount: number;
  readonly fileCount: number;
  readonly updatedAt: string;
  readonly instructions: string;
  readonly files: readonly ProjectFile[];
}

export const PROJECTS: readonly Project[] = [
  {
    id: 'p-001',
    name: 'Angular UI Skills launch',
    description: 'Coordinated launch for the per-library agent skills project. Plans, drafts, screenshots, social copy.',
    icon: 'lucideRocket',
    accent: 'from-rose-400 to-orange-400',
    conversationCount: 14,
    fileCount: 6,
    updatedAt: '2 hours ago',
    instructions:
      'When responding inside this project, default to the voice and audience used in the launch posts: respectful of the Angular community, factual, never em-dashes, never trademarked names (do not call anything "Claude Clone"). Lead with the concrete pain the skill solves before listing features.',
    files: [
      { id: 'f-1', name: 'launch-plan.md', size: '8 KB', addedAt: '3 days ago' },
      { id: 'f-2', name: 'x-thread-drafts.md', size: '4 KB', addedAt: '2 days ago' },
      { id: 'f-3', name: 'hn-show-comment.md', size: '2 KB', addedAt: '2 days ago' },
      { id: 'f-4', name: 'mission-control-dark-mode.png', size: '212 KB', addedAt: '1 day ago' },
      { id: 'f-5', name: 'quanta-desk-dark-mode.png', size: '188 KB', addedAt: '1 day ago' },
      { id: 'f-6', name: 'brand-guidelines.md', size: '6 KB', addedAt: '4 days ago' },
    ],
  },
  {
    id: 'p-002',
    name: 'Personal writing',
    description: 'Long-form drafts, essay outlines, and notes that go through several rounds of editing.',
    icon: 'lucideBookOpen',
    accent: 'from-amber-300 to-rose-300',
    conversationCount: 31,
    fileCount: 2,
    updatedAt: 'Yesterday',
    instructions:
      'Skip preamble. Match the voice in the attached drafts. Suggest a single concrete edit per paragraph rather than rewriting whole sections. Flag passive voice and dead phrases.',
    files: [
      { id: 'f-1', name: 'essays-2025.md', size: '34 KB', addedAt: '2 weeks ago' },
      { id: 'f-2', name: 'on-writing.md', size: '12 KB', addedAt: '3 months ago' },
    ],
  },
  {
    id: 'p-003',
    name: 'Trading desk research',
    description: 'Notes from the Quanta Desk side project. Pricing models, theme analysis, market-structure questions.',
    icon: 'lucideFolder',
    accent: 'from-emerald-300 to-teal-400',
    conversationCount: 8,
    fileCount: 4,
    updatedAt: '3 days ago',
    instructions:
      'Be skeptical. Assume the user is testing an idea rather than implementing it. Ask for the time horizon, capital constraint, and risk tolerance before recommending anything specific.',
    files: [
      { id: 'f-1', name: 'thesis-notes.md', size: '5 KB', addedAt: '5 days ago' },
      { id: 'f-2', name: 'sector-rotation-data.csv', size: '48 KB', addedAt: '1 week ago' },
      { id: 'f-3', name: 'historical-drawdowns.json', size: '102 KB', addedAt: '1 week ago' },
      { id: 'f-4', name: 'reading-list.md', size: '3 KB', addedAt: '3 weeks ago' },
    ],
  },
];
