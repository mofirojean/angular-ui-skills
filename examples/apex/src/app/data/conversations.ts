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
    id: 'c-013',
    title: 'Sketch a hero gradient component',
    bucket: 'Today',
    starred: true,
    modelId: 'apex-sonnet',
    messages: [
      {
        id: 'm-013-1',
        role: 'user',
        content: 'Give me a self-contained HTML demo of a warm hero gradient I could drop into a landing page.',
      },
      {
        id: 'm-013-2',
        role: 'assistant',
        content:
          'Here\'s a single self-contained page. Warm coral fading into deep cream, with a subtle animated radial highlight that drifts on a long loop. Drop it in an iframe or paste into a fresh `.html` file.\n\n```artifact:html:Warm hero gradient\n<!doctype html>\n<html>\n<head>\n<style>\n  :root { color-scheme: light; }\n  body {\n    margin: 0;\n    min-height: 100vh;\n    background: linear-gradient(135deg, #f8eee0 0%, #f1d9bd 40%, #d97757 90%);\n    overflow: hidden;\n    display: flex;\n    align-items: center;\n    justify-content: center;\n    font: 600 64px/1 \"Iowan Old Style\", "Times New Roman", serif;\n    color: #2b2419;\n    letter-spacing: -0.02em;\n    position: relative;\n  }\n  .glow {\n    position: absolute;\n    inset: -20%;\n    background: radial-gradient(circle at var(--x, 60%) var(--y, 40%), rgba(255, 220, 180, 0.9), transparent 55%);\n    animation: drift 18s ease-in-out infinite;\n    pointer-events: none;\n  }\n  h1 { position: relative; z-index: 1; max-width: 12ch; text-align: center; }\n  @keyframes drift {\n    0%, 100% { --x: 30%; --y: 30%; }\n    50%      { --x: 75%; --y: 60%; }\n  }\n</style>\n</head>\n<body>\n  <div class="glow"></div>\n  <h1>Move thoughtfully, finish things.</h1>\n</body>\n</html>\n```\n\nReplace the headline copy with whatever fits your brand. The drift is intentionally slow, ~18s per loop, so it reads as ambient rather than animated.',
      },
    ],
  },
  {
    id: 'c-014',
    title: 'Document the artifacts feature',
    bucket: 'Today',
    starred: false,
    modelId: 'apex-opus',
    messages: [
      {
        id: 'm-014-1',
        role: 'user',
        content: 'Write me a one-page internal doc explaining how the artifacts panel works.',
      },
      {
        id: 'm-014-2',
        role: 'assistant',
        content:
          'Here is a short internal doc, written for an engineer who is new to the team but already familiar with the chat UI.\n\n```artifact:markdown:Artifacts panel · internal docs\n# Artifacts panel\n\nWhen an assistant response contains a self-contained artifact (HTML, markdown doc, code component), the message stream renders an inline card linking to it. Clicking the card opens a right-side panel split 60/40 with the conversation.\n\n## When to emit an artifact\n\nEmit one when:\n\n- The response is **a thing the user might save, edit, or share** (a working HTML page, a one-pager doc, a code file)\n- It is **self-contained** (runs or reads on its own, no external dependencies the user has to wire up)\n- It is **at least 20 lines** (shorter responses belong inline)\n\nDo *not* emit an artifact for:\n\n- A short code snippet (keep it inline, the user is reading along)\n- A multi-step explanation where the prose is the point\n- Diagrams or images (not yet supported)\n\n## Supported types\n\n| Type | Renders as |\n|---|---|\n| `html` | sandboxed iframe with `srcdoc` |\n| `markdown` | rendered via the same markdown renderer the assistant messages use |\n| `react`, `code` | code-only view with syntax highlighting |\n\n## Lifecycle\n\n1. Author the artifact in the response using the `artifact:<type>:<title>` fence.\n2. The parser hoists it out of the prose flow and renders an artifact card inline.\n3. User clicks the card → panel opens with the Preview tab active.\n4. User can switch to the Code tab, copy the source, or download it.\n5. User can expand to fullscreen or close back to the message stream.\n\n## Constraints\n\n- One artifact per response right now. Multi-artifact responses ship later.\n- The HTML preview is sandboxed; no `allow-scripts` until we wire CSP nonces.\n- Markdown artifacts render with the same `.apex-prose` styles as message bodies.\n```\n\nFeel free to remove the closing constraints section if you don\'t want to expose the in-flight limitations yet.',
      },
    ],
  },
  {
    id: 'c-015',
    title: 'Refactor button to use Angular signal inputs',
    bucket: 'Yesterday',
    starred: false,
    modelId: 'apex-opus',
    messages: [
      {
        id: 'm-015-1',
        role: 'user',
        content: 'Refactor this Angular Button component to use signal inputs and output instead of decorators.',
      },
      {
        id: 'm-015-2',
        role: 'assistant',
        content:
          'Sure. Here\'s the refactored component using `input()` and `output()` (Angular v17.3+) plus signal-driven CSS classes. The public API stays identical, callers don\'t need to change.\n\n```artifact:typescript:Button component (signal-based)\nimport { ChangeDetectionStrategy, Component, computed, input, output } from \'@angular/core\';\n\ntype Variant = \'primary\' | \'secondary\' | \'ghost\' | \'destructive\';\ntype Size = \'sm\' | \'md\' | \'lg\';\n\n@Component({\n  selector: \'app-button\',\n  template: `\n    <button\n      [type]="type()"\n      [disabled]="disabled()"\n      [class]="classes()"\n      (click)="press.emit($event)"\n    >\n      <ng-content />\n    </button>\n  `,\n  changeDetection: ChangeDetectionStrategy.OnPush,\n})\nexport class Button {\n  readonly variant = input<Variant>(\'primary\');\n  readonly size = input<Size>(\'md\');\n  readonly type = input<\'button\' | \'submit\'>(\'button\');\n  readonly disabled = input<boolean>(false);\n\n  readonly press = output<MouseEvent>();\n\n  protected readonly classes = computed(() => {\n    const base = \'inline-flex items-center justify-center gap-2 font-medium transition-colors\';\n    const v: Record<Variant, string> = {\n      primary:     \'bg-primary text-primary-foreground hover:opacity-90\',\n      secondary:   \'bg-secondary text-secondary-foreground hover:bg-secondary/80\',\n      ghost:       \'hover:bg-accent text-foreground\',\n      destructive: \'bg-destructive text-destructive-foreground hover:opacity-90\',\n    };\n    const s: Record<Size, string> = {\n      sm: \'h-8 px-3 text-[12px] rounded-md\',\n      md: \'h-9 px-4 text-[13px] rounded-md\',\n      lg: \'h-10 px-5 text-[14px] rounded-lg\',\n    };\n    return `${base} ${v[this.variant()]} ${s[this.size()]} disabled:opacity-50 disabled:pointer-events-none`;\n  });\n}\n```\n\nA few things worth noting:\n\n- **No `@Input()` / `@Output()` decorators.** Signal-based APIs (`input()`, `output()`) replace them. Templates read them via the call syntax: `variant()`, not `variant`.\n- **No `@HostBinding`.** The class string is a `computed()` signal bound via `[class]`.\n- **OnPush stays the default.** Signal-based inputs auto-mark for check; there is no `markForCheck()` call to remember.\n- **`output()` returns an `OutputEmitterRef`,** not an `EventEmitter`. Most ergonomics match, but if you have subscribers that depended on `EventEmitter` methods like `complete()`, you will need to adapt.',
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
