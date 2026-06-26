export type TokenKind = 'plain' | 'keyword' | 'string' | 'comment' | 'type' | 'fn' | 'num' | 'punct' | 'op';

export interface Token {
  readonly t: TokenKind;
  readonly v: string;
}

export type Lang = 'ts' | 'json' | 'md' | 'html' | 'css' | 'plain';

export interface LangMeta {
  readonly key: Lang;
  readonly label: string;
  readonly tone: string;
  readonly icon: string;
}

const TS_KEYWORDS = new Set([
  'const', 'let', 'var', 'if', 'else', 'return', 'class', 'public', 'private',
  'protected', 'async', 'await', 'import', 'export', 'function', 'this', 'new',
  'try', 'catch', 'finally', 'throw', 'for', 'while', 'do', 'switch', 'case',
  'default', 'break', 'continue', 'in', 'of', 'typeof', 'instanceof',
  'true', 'false', 'null', 'undefined', 'void',
  'as', 'from', 'type', 'interface', 'enum', 'extends', 'implements',
  'super', 'static', 'readonly', 'get', 'set', 'declare', 'namespace',
  'is', 'keyof', 'infer', 'never',
]);

const TS_TYPES = new Set([
  'string', 'number', 'boolean', 'any', 'unknown', 'object',
  'Array', 'Promise', 'Map', 'Set', 'Record', 'Partial', 'Required',
  'Pick', 'Omit', 'Readonly', 'ReadonlyArray', 'Date', 'RegExp', 'Error',
]);

const NOT_FUNCTIONS = new Set(['if', 'for', 'while', 'switch', 'catch', 'return', 'typeof', 'await', 'new', 'throw', 'in', 'of', 'as']);

export function detectLang(path: string): Lang {
  const ext = path.split('.').pop()?.toLowerCase() ?? '';
  if (ext === 'ts' || ext === 'tsx' || ext === 'js' || ext === 'jsx' || ext === 'mts') return 'ts';
  if (ext === 'json') return 'json';
  if (ext === 'md' || ext === 'markdown') return 'md';
  if (ext === 'html' || ext === 'htm') return 'html';
  if (ext === 'css' || ext === 'scss' || ext === 'sass') return 'css';
  return 'plain';
}

export function langMeta(lang: Lang): LangMeta {
  switch (lang) {
    case 'ts':    return { key: 'ts',    label: 'TypeScript', tone: 'bg-sky-500/10 text-sky-700 dark:text-sky-300 ring-sky-500/30',            icon: 'lucideFileCode' };
    case 'json':  return { key: 'json',  label: 'JSON',       tone: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 ring-amber-500/30',  icon: 'lucideBraces' };
    case 'md':    return { key: 'md',    label: 'Markdown',   tone: 'bg-zinc-500/10 text-zinc-700 dark:text-zinc-300 ring-zinc-500/30',      icon: 'lucideFileText' };
    case 'html':  return { key: 'html',  label: 'HTML',       tone: 'bg-orange-500/10 text-orange-700 dark:text-orange-300 ring-orange-500/30', icon: 'lucideFileCode' };
    case 'css':   return { key: 'css',   label: 'CSS',        tone: 'bg-pink-500/10 text-pink-700 dark:text-pink-300 ring-pink-500/30',      icon: 'lucideFileCode' };
    default:      return { key: 'plain', label: 'Plain',      tone: 'bg-muted text-muted-foreground ring-border',                            icon: 'lucideFile' };
  }
}

export function tokenize(text: string, lang: Lang): Token[] {
  if (lang === 'ts') return tokenizeTs(text);
  if (lang === 'json') return tokenizeJson(text);
  return [{ t: 'plain', v: text }];
}

function tokenizeTs(text: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  while (i < text.length) {
    const ch = text[i];

    if (ch === '/' && text[i + 1] === '/') {
      tokens.push({ t: 'comment', v: text.slice(i) });
      return tokens;
    }

    if (ch === '/' && text[i + 1] === '*') {
      const start = i;
      i += 2;
      while (i < text.length - 1 && !(text[i] === '*' && text[i + 1] === '/')) i++;
      if (i < text.length - 1) i += 2;
      tokens.push({ t: 'comment', v: text.slice(start, i) });
      continue;
    }

    if (ch === "'" || ch === '"' || ch === '`') {
      const quote = ch;
      const start = i;
      i++;
      while (i < text.length && text[i] !== quote) {
        if (text[i] === '\\' && i + 1 < text.length) i++;
        i++;
      }
      if (i < text.length) i++;
      tokens.push({ t: 'string', v: text.slice(start, i) });
      continue;
    }

    if (/\d/.test(ch)) {
      const start = i;
      while (i < text.length && /[\d._]|[xX][0-9a-fA-F]/.test(text[i])) i++;
      tokens.push({ t: 'num', v: text.slice(start, i) });
      continue;
    }

    if (/[A-Za-z_$]/.test(ch)) {
      const start = i;
      while (i < text.length && /[\w$]/.test(text[i])) i++;
      const word = text.slice(start, i);
      const next = text[i];

      if (TS_KEYWORDS.has(word)) {
        tokens.push({ t: 'keyword', v: word });
      } else if (TS_TYPES.has(word)) {
        tokens.push({ t: 'type', v: word });
      } else if (next === '(' && !NOT_FUNCTIONS.has(word)) {
        tokens.push({ t: 'fn', v: word });
      } else if (/^[A-Z]/.test(word)) {
        tokens.push({ t: 'type', v: word });
      } else {
        tokens.push({ t: 'plain', v: word });
      }
      continue;
    }

    if (ch === ' ' || ch === '\t') {
      const start = i;
      while (i < text.length && (text[i] === ' ' || text[i] === '\t')) i++;
      tokens.push({ t: 'plain', v: text.slice(start, i) });
      continue;
    }

    const two = text.slice(i, i + 2);
    if (['=>', '!=', '==', '<=', '>=', '&&', '||', '??', '?.', '++', '--', '+=', '-=', '/=', '*=', '...'].includes(two)) {
      tokens.push({ t: 'op', v: two });
      i += 2;
      continue;
    }

    if (/[+\-*/%=<>!&|^~?:]/.test(ch)) {
      tokens.push({ t: 'op', v: ch });
      i++;
      continue;
    }

    if (/[(){}\[\];,.]/.test(ch)) {
      tokens.push({ t: 'punct', v: ch });
      i++;
      continue;
    }

    tokens.push({ t: 'plain', v: ch });
    i++;
  }
  return tokens;
}

function tokenizeJson(text: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  while (i < text.length) {
    const ch = text[i];

    if (ch === '"') {
      const start = i;
      i++;
      while (i < text.length && text[i] !== '"') {
        if (text[i] === '\\' && i + 1 < text.length) i++;
        i++;
      }
      if (i < text.length) i++;
      tokens.push({ t: 'string', v: text.slice(start, i) });
      continue;
    }

    if (/\d|-/.test(ch) && /\d/.test(text[i + 1] ?? '')) {
      const start = i;
      while (i < text.length && /[\d.eE+-]/.test(text[i])) i++;
      tokens.push({ t: 'num', v: text.slice(start, i) });
      continue;
    }

    if (ch === 't' && text.slice(i, i + 4) === 'true') {
      tokens.push({ t: 'keyword', v: 'true' });
      i += 4;
      continue;
    }
    if (ch === 'f' && text.slice(i, i + 5) === 'false') {
      tokens.push({ t: 'keyword', v: 'false' });
      i += 5;
      continue;
    }
    if (ch === 'n' && text.slice(i, i + 4) === 'null') {
      tokens.push({ t: 'keyword', v: 'null' });
      i += 4;
      continue;
    }

    if (/[\s]/.test(ch)) {
      const start = i;
      while (i < text.length && /[\s]/.test(text[i])) i++;
      tokens.push({ t: 'plain', v: text.slice(start, i) });
      continue;
    }

    tokens.push({ t: 'punct', v: ch });
    i++;
  }
  return tokens;
}

export function tokenClass(t: TokenKind): string {
  switch (t) {
    case 'keyword': return 'text-violet-600 dark:text-violet-300';
    case 'string':  return 'text-emerald-600 dark:text-emerald-300';
    case 'comment': return 'text-zinc-500 dark:text-zinc-500 italic';
    case 'type':    return 'text-amber-600 dark:text-amber-400';
    case 'fn':      return 'text-sky-600 dark:text-sky-300';
    case 'num':     return 'text-rose-500 dark:text-rose-400';
    case 'op':      return 'text-zinc-500 dark:text-zinc-400';
    case 'punct':   return 'text-zinc-500 dark:text-zinc-400';
    default:        return '';
  }
}
