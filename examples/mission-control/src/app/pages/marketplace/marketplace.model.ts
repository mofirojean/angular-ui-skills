export type Category = 'all' | 'productivity' | 'sales' | 'documents' | 'data' | 'engineering' | 'finance' | 'communication';
export type SortKey = 'popular' | 'newest' | 'rating';

export interface Author {
  readonly id: string;
  readonly name: string;
  readonly handle: string;
  readonly initials: string;
  readonly verified: boolean;
  readonly bio: string;
  readonly agentCount: number;
  readonly totalInstalls: number;
}

export interface MarketAgent {
  readonly id: string;
  readonly name: string;
  readonly summary: string;
  readonly description: string;
  readonly icon: string;
  readonly category: Exclude<Category, 'all'>;
  readonly categoryLabel: string;
  readonly author: Author;
  readonly tags: readonly string[];
  readonly installs: number;
  readonly rating: number;
  readonly reviewCount: number;
  readonly featured: boolean;
  readonly verified: boolean;
  readonly isNew: boolean;
  readonly isTrending: boolean;
  readonly version: string;
  readonly updatedDays: number;
  readonly accent: string;
}