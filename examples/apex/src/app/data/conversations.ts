export type ConversationBucket = 'Today' | 'Yesterday' | 'Previous 7 days' | 'Previous 30 days' | 'Older';

export interface Message {
  readonly id: string;
  readonly role: 'user' | 'assistant';
  readonly content: string;
}

export interface Conversation {
  readonly id: string;
  readonly title: string;
  readonly bucket: ConversationBucket;
  readonly starred: boolean;
  readonly projectId?: string;
  readonly modelId: string;
  readonly messages: readonly Message[];
}

export const CONVERSATIONS: readonly Conversation[] = [
  {
    id: 'c-001',
    title: 'Designing a chat sidebar with grouped history',
    bucket: 'Today',
    starred: true,
    modelId: 'apex-sonnet',
    messages: [
      {
        id: 'm-001-1',
        role: 'user',
        content: 'I want a sidebar that groups conversations by recency (Today, Yesterday, Previous 7 days, etc.). What\'s the cleanest data model?',
      },
      {
        id: 'm-001-2',
        role: 'assistant',
        content:
          'Keep the source of truth flat. Store each conversation with a `createdAt` timestamp and derive the bucket at render time, rather than persisting the bucket name. That way "Today" stays accurate as time passes without any background reclassification job.\n\nA `groupBy` over the list, bucketed by a date function (`isToday`, `isYesterday`, `isWithinLast7Days`, etc.), keeps the UI honest and the storage layer dumb.',
      },
      {
        id: 'm-001-3',
        role: 'user',
        content: 'And what about pinned ones?',
      },
      {
        id: 'm-001-4',
        role: 'assistant',
        content:
          'Add a `starred: boolean` field on each conversation and surface them in a dedicated section above the time buckets. Don\'t remove them from their original bucket, the user often wants to find a pinned conversation by both "starred" and "this week".\n\nIn practice the sidebar usually looks like:\n\n- **Starred** (max 5, scroll for more)\n- **Today**\n- **Yesterday**\n- **Previous 7 days**\n- **Previous 30 days**\n- **Older** (collapsible)',
      },
    ],
  },
  {
    id: 'c-002',
    title: 'How to fake-stream a long response',
    bucket: 'Today',
    starred: false,
    modelId: 'apex-sonnet',
    messages: [
      {
        id: 'm-002-1',
        role: 'user',
        content: 'I want my mock assistant to look like it\'s streaming. What\'s the lightest way?',
      },
      {
        id: 'm-002-2',
        role: 'assistant',
        content:
          'Split the canned response into tokens (rough word-or-punctuation chunks) and reveal them on a `setInterval`. About 25 to 35ms per token feels right, fast enough to be readable, slow enough that the eye registers the streaming effect.\n\nKeep the in-flight token count in a signal so the template re-renders cheaply. When the interval finishes, swap to the full text in one shot to avoid jank at the end.',
      },
    ],
  },
  {
    id: 'c-003',
    title: 'TypeScript: discriminated unions for command palette items',
    bucket: 'Today',
    starred: false,
    modelId: 'apex-opus',
    messages: [
      {
        id: 'm-003-1',
        role: 'user',
        content: 'Help me model command palette items where each kind has different fields.',
      },
      {
        id: 'm-003-2',
        role: 'assistant',
        content: 'Discriminated unions are the right tool. Tag each variant with a literal `kind` and TypeScript narrows automatically inside `switch` blocks.\n\n```ts\ntype Command =\n  | { kind: \'navigate\'; id: string; label: string; route: string }\n  | { kind: \'action\'; id: string; label: string; run: () => void }\n  | { kind: \'theme\'; id: string; label: string; mode: \'light\' | \'dark\' };\n\nfunction handle(cmd: Command) {\n  switch (cmd.kind) {\n    case \'navigate\': router.navigate(cmd.route); break;\n    case \'action\':   cmd.run(); break;\n    case \'theme\':    setTheme(cmd.mode); break;\n  }\n}\n```\n\nThe `switch` is exhaustive, so if you add a fourth variant the compiler tells you exactly where to add the new branch.',
      },
    ],
  },
  {
    id: 'c-004',
    title: 'Brainstorming names for a side project',
    bucket: 'Yesterday',
    starred: true,
    modelId: 'apex-sonnet',
    messages: [
      {
        id: 'm-004-1',
        role: 'user',
        content: 'I\'m building a developer-focused chat assistant clone for portfolio purposes. Need a name that isn\'t derivative.',
      },
      {
        id: 'm-004-2',
        role: 'assistant',
        content:
          'A few directions that lean technical without trying too hard:\n\n- **Apex** — short, ambitious, no baggage. Works as a verb if you stretch.\n- **Lumen** — knowledge, light. Has been used by other tools but not heavily in AI.\n- **Pylon** — supportive, structural, slightly industrial.\n- **Atrium** — open, architectural, plays well as "the central space".\n- **Helios** — bright, classical, energetic.\n\nIf the project is genuinely a portfolio piece, I\'d pick **Apex**. It\'s memorable, has no awkward pronunciation, and the visual identity could lean into a single bold mark.',
      },
    ],
  },
  {
    id: 'c-005',
    title: 'Explain CSS custom properties and oklch',
    bucket: 'Yesterday',
    starred: false,
    modelId: 'apex-haiku',
    messages: [
      {
        id: 'm-005-1',
        role: 'user',
        content: 'Why is oklch preferred for design tokens these days?',
      },
      {
        id: 'm-005-2',
        role: 'assistant',
        content:
          'Three reasons.\n\n**Perceptually uniform.** Equal numeric changes feel like equal perceptual changes. Bumping `L` from 0.5 to 0.6 looks about as different as 0.7 to 0.8. In HSL that\'s not true, lightness jumps are non-linear across hue.\n\n**Wide gamut.** Covers Display P3 without clamping. If you\'re shipping on modern hardware, your accent color stays vivid on screens that have the range.\n\n**Predictable adjustments.** Need a hover state 10% darker? Subtract 0.05 from `L`. Need a slightly warmer accent? Add 5-10 degrees to `H`. In RGB or HSL, those operations produce surprises.\n\nFor design tokens specifically, the win is that a designer can hand you an oklch value and the math to derive related states (hover, active, focus ring) just works.',
      },
    ],
  },
  {
    id: 'c-006',
    title: 'Refactoring a tangled Angular component',
    bucket: 'Previous 7 days',
    starred: false,
    modelId: 'apex-opus',
    messages: [
      {
        id: 'm-006-1',
        role: 'user',
        content: 'My settings component has grown to 800 lines. It has 6 tabs and each tab has its own form. What\'s the right way to split it?',
      },
      {
        id: 'm-006-2',
        role: 'assistant',
        content:
          'Split by tab. Each tab is its own component, its own form group, its own template. The parent component holds the active-tab signal and renders the right child via `@switch`.\n\n```\nsettings/\n├── settings.ts            // parent: tab state + routing\n├── settings.html\n├── tabs/\n│   ├── profile/\n│   │   ├── profile.ts\n│   │   └── profile.html\n│   ├── trading/\n│   ├── notifications/\n│   ├── keys/\n│   └── billing/\n└── settings.data.ts       // shared option lists\n```\n\nThe parent should know almost nothing about what each tab does. Each child should know almost nothing about the parent except that its tab is currently active. If you find yourself passing state down or events up, you\'ve probably picked the wrong split point.',
      },
    ],
  },
  {
    id: 'c-007',
    title: 'Draft an email declining a meeting',
    bucket: 'Previous 7 days',
    starred: false,
    modelId: 'apex-sonnet',
    messages: [
      {
        id: 'm-007-1',
        role: 'user',
        content: 'Help me write a polite decline to a recurring weekly meeting I want to step out of.',
      },
      {
        id: 'm-007-2',
        role: 'assistant',
        content:
          'Here\'s a draft:\n\n> Hey [Name],\n>\n> Thanks for keeping me on the recurring sync over the last few weeks, I\'ve appreciated the visibility.\n>\n> I\'d like to step out of the weekly slot for now. The topics have drifted away from what I\'m actively working on, and I\'d rather free up that hour for focused work. Please keep me in the loop async if anything comes up that needs my input, happy to jump in for one-off discussions when that happens.\n>\n> Appreciate your understanding.\n>\n> [Your name]\n\nThe key moves: acknowledge what was good, give one concrete reason (not a vague excuse), offer a low-friction alternative path. People rarely push back on a decline framed this way.',
      },
    ],
  },
  {
    id: 'c-008',
    title: 'Python: dataclass with computed properties',
    bucket: 'Previous 7 days',
    starred: false,
    modelId: 'apex-sonnet',
    messages: [
      {
        id: 'm-008-1',
        role: 'user',
        content: 'How do I add a computed field to a @dataclass that depends on other fields?',
      },
      {
        id: 'm-008-2',
        role: 'assistant',
        content:
          'Use `@property` for the computed value, and `field(init=False, repr=False)` if you also want it cached:\n\n```python\nfrom dataclasses import dataclass, field\nfrom functools import cached_property\n\n@dataclass\nclass Order:\n    quantity: int\n    unit_price: float\n    tax_rate: float = 0.08\n\n    @cached_property\n    def total(self) -> float:\n        subtotal = self.quantity * self.unit_price\n        return subtotal * (1 + self.tax_rate)\n```\n\n`cached_property` works seamlessly with `@dataclass`, the cache is per-instance and computes lazily on first access. Don\'t use `cached_property` if any of the underlying fields can be mutated, the cache won\'t invalidate.',
      },
    ],
  },
  {
    id: 'c-009',
    title: 'What is a discriminated union in plain English',
    bucket: 'Previous 7 days',
    starred: false,
    modelId: 'apex-haiku',
    messages: [
      {
        id: 'm-009-1',
        role: 'user',
        content: 'Explain discriminated unions like I\'ve been writing JS for 5 years but never touched TypeScript.',
      },
      {
        id: 'm-009-2',
        role: 'assistant',
        content:
          'Think of it as "a value that\'s one of a few specific shapes, and you can tell which by looking at one field".\n\nIn JS you\'d write a comment: `{ kind: \'navigate\', route: ... } OR { kind: \'action\', run: ... }`.\n\nTypeScript lets you make that comment a real type. When you check `kind === \'navigate\'` in a `switch` or `if`, TypeScript knows the rest of the fields are guaranteed to match, so it won\'t complain when you access `route`.\n\nThe magic is that the compiler tracks which shape you\'re in based on the discriminating field. You get autocomplete that\'s correct *only for the shape you just narrowed to*. No more guessing or null-checking everything.',
      },
    ],
  },
  {
    id: 'c-010',
    title: 'Pricing strategy for a niche dev tool',
    bucket: 'Previous 30 days',
    starred: false,
    modelId: 'apex-opus',
    messages: [
      {
        id: 'm-010-1',
        role: 'user',
        content: 'I have a developer tool with ~300 weekly active users. Should I charge yet?',
      },
      {
        id: 'm-010-2',
        role: 'assistant',
        content:
          'Not yet, but get ready. At 300 WAU you don\'t have enough signal about willingness to pay, and a paywall now could choke the funnel before you understand it.\n\nWhat I\'d do instead, in order:\n\n1. **Talk to ten users.** Real conversations, not surveys. Find out what they would pay for and what they wouldn\'t. The answer is rarely the feature you think.\n2. **Identify a pro-tier feature** that 10-20% of your users would value. The shape of this feature shapes your pricing model (per-seat vs per-usage vs flat).\n3. **Launch a beta of that feature** behind an email gate. Free, just opt-in. Measure conversion and retention.\n4. **Charge for that feature only**, once the beta shows clear interest. Keep the core free. This lets the free tier keep doing top-of-funnel work.\n\nIf you charge before step 1, you\'re guessing. After step 1, you\'re informed.',
      },
    ],
  },
  {
    id: 'c-011',
    title: 'Markdown table for tracking habits',
    bucket: 'Previous 30 days',
    starred: false,
    modelId: 'apex-sonnet',
    messages: [
      {
        id: 'm-011-1',
        role: 'user',
        content: 'Give me a markdown template for tracking 5 daily habits across a month.',
      },
      {
        id: 'm-011-2',
        role: 'assistant',
        content:
          'Here\'s a compact format that fits on most screens:\n\n| Day | Exercise | Read | Sleep 7h+ | Cook | No screen 1h |\n|---|:---:|:---:|:---:|:---:|:---:|\n| Mon | ✓ | ✓ | – | ✓ | – |\n| Tue | ✓ | ✓ | ✓ | – | ✓ |\n| Wed | – | ✓ | ✓ | ✓ | ✓ |\n| Thu | ✓ | – | ✓ | – | – |\n| Fri | ✓ | ✓ | – | ✓ | ✓ |\n| Sat | – | – | ✓ | ✓ | – |\n| Sun | ✓ | ✓ | ✓ | – | ✓ |\n\nKeep symbols binary. `✓ / –` reads faster than `1/0` or `Yes/No`. Avoid scoring scales (1-5), they\'re harder to commit to and make consistency harder to spot at a glance.',
      },
    ],
  },
  {
    id: 'c-012',
    title: 'Old Q about RxJS vs signals',
    bucket: 'Older',
    starred: false,
    modelId: 'apex-haiku',
    messages: [
      {
        id: 'm-012-1',
        role: 'user',
        content: 'In Angular today, when do I still reach for RxJS vs signals?',
      },
      {
        id: 'm-012-2',
        role: 'assistant',
        content:
          'Signals for state, RxJS for events.\n\nIf the value represents *what is currently true* (a count, a selected item, a form value, a derived total), use a signal. The mental model is "this is a piece of state and the UI follows it".\n\nIf the value represents *something that just happened* (an HTTP response, a user click stream, a debounced search, a server-sent event), use RxJS. The mental model is "this is a sequence of events flowing past".\n\nThe two interop fine: `toSignal()` lets you bridge an observable into signal-land at the edge, and `toObservable(signal)` does the reverse. Most apps end up with RxJS at the boundaries (HTTP, websockets, router) and signals everywhere inside.',
      },
    ],
  },
];
