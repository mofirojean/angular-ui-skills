import { ChangeDetectionStrategy, Component, ElementRef, computed, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIcon } from '@ng-icons/core';
import { BrnInputOtpImports } from '@spartan-ng/brain/input-otp';
import { toast } from '@spartan-ng/brain/sonner';
import { HlmAspectRatioImports } from '@spartan-ng/helm/aspect-ratio';
import { HlmAvatarImports } from '@spartan-ng/helm/avatar';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmCarouselImports } from '@spartan-ng/helm/carousel';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { HlmHoverCardImports } from '@spartan-ng/helm/hover-card';
import { HlmIcon } from '@spartan-ng/helm/icon';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmInputGroupImports } from '@spartan-ng/helm/input-group';
import { HlmInputOtpImports } from '@spartan-ng/helm/input-otp';
import { HlmPopoverImports } from '@spartan-ng/helm/popover';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { HlmSeparatorImports } from '@spartan-ng/helm/separator';
import { HlmSkeletonImports } from '@spartan-ng/helm/skeleton';
import { HlmToggleGroupImports } from '@spartan-ng/helm/toggle-group';

import { Author, Category, MarketAgent, SortKey } from './marketplace.model';
import { CATEGORIES, MARKETPLACE_AGENTS } from './marketplace.data';

@Component({
  selector: 'app-marketplace',
  imports: [
    FormsModule,
    NgIcon,
    BrnInputOtpImports,
    HlmAspectRatioImports,
    HlmAvatarImports,
    HlmBadgeImports,
    HlmButtonImports,
    HlmCardImports,
    HlmCarouselImports,
    HlmDialogImports,
    HlmHoverCardImports,
    HlmIcon,
    HlmInputImports,
    HlmInputGroupImports,
    HlmInputOtpImports,
    HlmPopoverImports,
    HlmSelectImports,
    HlmSeparatorImports,
    HlmSkeletonImports,
    HlmToggleGroupImports,
  ],
  templateUrl: './marketplace.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Marketplace {
  protected readonly isLoading = signal(true);

  protected readonly categories = CATEGORIES;
  private readonly agents = MARKETPLACE_AGENTS;

  // Filters ------------------------------------------------------------------

  protected readonly searchQuery = signal('');
  protected readonly category = signal<Category>('all');
  protected readonly sort = signal<SortKey>('popular');
  protected readonly verifiedOnly = signal(false);
  protected readonly newOnly = signal(false);

  protected readonly featured = computed<readonly MarketAgent[]>(() =>
    this.agents.filter((a) => a.featured),
  );

  protected readonly filtered = computed<readonly MarketAgent[]>(() => {
    const q = this.searchQuery().toLowerCase().trim();
    const cat = this.category();
    const sort = this.sort();
    const verifiedOnly = this.verifiedOnly();
    const newOnly = this.newOnly();

    let list = this.agents.filter((a) => {
      if (cat !== 'all' && a.category !== cat) return false;
      if (verifiedOnly && !a.verified) return false;
      if (newOnly && !a.isNew) return false;
      if (q && !`${a.name} ${a.summary} ${a.description} ${a.author.name} ${a.tags.join(' ')}`.toLowerCase().includes(q)) return false;
      return true;
    });

    list = [...list].sort((a, b) => {
      if (sort === 'newest') return a.updatedDays - b.updatedDays;
      if (sort === 'rating') return b.rating - a.rating;
      return b.installs - a.installs;
    });
    return list;
  });

  // KPIs --------------------------------------------------------------------

  protected readonly stats = computed(() => {
    const all = this.agents;
    const totalInstalls = all.reduce((sum, a) => sum + a.installs, 0);
    const trending = all.filter((a) => a.isTrending).length;
    const newCount = all.filter((a) => a.isNew).length;
    return {
      total: all.length,
      totalInstalls,
      trending,
      newCount,
      avgRating: (all.reduce((s, a) => s + a.rating, 0) / all.length).toFixed(1),
    };
  });

  // Install dialog -----------------------------------------------------------

  protected readonly installAgent = signal<MarketAgent | null>(null);
  protected readonly installStep = signal<'confirm' | 'otp' | 'success'>('confirm');
  protected readonly otpCode = signal('');
  protected readonly installTrigger = viewChild<ElementRef<HTMLButtonElement>>('installTrigger');

  protected openInstallDialog(agent: MarketAgent): void {
    this.installAgent.set(agent);
    this.installStep.set('confirm');
    this.otpCode.set('');
    queueMicrotask(() => this.installTrigger()?.nativeElement.click());
  }

  protected proceedToOtp(): void {
    this.installStep.set('otp');
    this.otpCode.set('');
  }

  protected verifyAndInstall(ctx: { close: () => void }): void {
    if (this.otpCode().length < 6) {
      toast.error('Enter the 6-digit code from your authenticator');
      return;
    }
    this.installStep.set('success');
    const agent = this.installAgent();
    if (!agent) return;
    setTimeout(() => {
      toast.success(`${agent.name} installed`, {
        description: `v${agent.version} added to your workspace`,
      });
      ctx.close();
    }, 800);
  }

  protected formatInstalls(n: number): string {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
    return n.toString();
  }

  protected coverImage(id: string): string {
    // Picsum returns a deterministic photo for each seed — no API key, free CDN.
    return `https://picsum.photos/seed/${id}/800/450`;
  }

  protected starArray(rating: number): readonly { filled: boolean; half: boolean }[] {
    return Array.from({ length: 5 }, (_, i) => {
      const value = rating - i;
      return { filled: value >= 1, half: value > 0 && value < 1 };
    });
  }

  // Filter actions ----------------------------------------------------------

  protected onSearch(ev: Event): void {
    this.searchQuery.set((ev.target as HTMLInputElement).value);
  }

  protected onCategoryChange(value: unknown): void {
    const next = (value as Category | null | undefined) ?? 'all';
    this.category.set(next);
  }

  protected onSortChange(value: unknown): void {
    this.sort.set((value as SortKey | null | undefined) ?? 'popular');
  }

  protected clearFilters(): void {
    this.searchQuery.set('');
    this.category.set('all');
    this.sort.set('popular');
    this.verifiedOnly.set(false);
    this.newOnly.set(false);
  }

  protected get hasFilters(): boolean {
    return (
      !!this.searchQuery() ||
      this.category() !== 'all' ||
      this.sort() !== 'popular' ||
      this.verifiedOnly() ||
      this.newOnly()
    );
  }

  protected onOtpInput(value: string): void {
    this.otpCode.set(value);
  }

  constructor() {
    setTimeout(() => this.isLoading.set(false), 350);
  }
}
