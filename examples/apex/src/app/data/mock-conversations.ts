export interface User {
  readonly name: string;
  readonly initials: string;
  readonly email: string;
  readonly plan: 'Free' | 'Pro' | 'Team';
}

export const MOCK_USER: User = {
  name: 'Mofiro Jean',
  initials: 'MJ',
  email: 'mofiro@apex.local',
  plan: 'Pro',
};

export const MOCK_WORKSPACE = {
  name: 'Personal',
  initials: 'P',
};

export interface Model {
  readonly id: string;
  readonly label: string;
  readonly description: string;
}

export const MODELS: readonly Model[] = [
  { id: 'apex-opus', label: 'Apex Opus', description: 'Smartest, slower.' },
  { id: 'apex-sonnet', label: 'Apex Sonnet', description: 'Balanced.' },
  { id: 'apex-haiku', label: 'Apex Haiku', description: 'Fastest, lighter.' },
];

export const DEFAULT_MODEL_ID = 'apex-sonnet';
