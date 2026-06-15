import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { NzTreeModule, NzFormatEmitEvent, NzTreeNodeOptions } from 'ng-zorro-antd/tree';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzAutocompleteModule } from 'ng-zorro-antd/auto-complete';
import { NzCascaderModule, NzCascaderOption } from 'ng-zorro-antd/cascader';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzAnchorModule } from 'ng-zorro-antd/anchor';
import { NzRateModule } from 'ng-zorro-antd/rate';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzTooltipModule } from 'ng-zorro-antd/tooltip';
import { NzMessageService } from 'ng-zorro-antd/message';

import { DataService } from '../../data/data.service';
import { KbArticle, KbCategory, relativeTime } from '../../data/mock-data';

function toTreeNodes(categories: readonly KbCategory[]): NzTreeNodeOptions[] {
  return categories.map((c) => ({
    title: c.title,
    key: c.id,
    expanded: true,
    children: c.children ? toTreeNodes(c.children) : undefined,
    isLeaf: !c.children || c.children.length === 0,
  }));
}

function toCascaderOptions(categories: readonly KbCategory[]): NzCascaderOption[] {
  return categories.map((c) => ({
    value: c.id,
    label: c.title,
    children: c.children?.map((child) => ({ value: child.id, label: child.title })),
    isLeaf: !c.children || c.children.length === 0,
  }));
}

@Component({
  selector: 'app-kb',
  imports: [
    FormsModule,
    NzTreeModule,
    NzInputModule,
    NzAutocompleteModule,
    NzCascaderModule,
    NzCardModule,
    NzIconModule,
    NzTagModule,
    NzAnchorModule,
    NzRateModule,
    NzButtonModule,
    NzEmptyModule,
    NzDividerModule,
    NzAvatarModule,
    NzTooltipModule,
  ],
  templateUrl: './kb.html',
  styleUrl: './kb.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Kb {
  protected readonly data = inject(DataService);
  private readonly message = inject(NzMessageService);

  protected relative = relativeTime;

  protected readonly treeNodes = computed(() => toTreeNodes(this.data.kbCategories()));
  protected readonly cascaderOptions = computed(() => toCascaderOptions(this.data.kbCategories()));

  protected readonly selectedCategoryId = signal<string | null>('auth-2fa');
  protected readonly search = signal('');
  protected readonly userRating = signal(0);

  protected readonly searchHits = computed(() => {
    const q = this.search().toLowerCase().trim();
    if (q.length < 2) return [];
    return this.data
      .kbArticles()
      .filter((a) => a.title.toLowerCase().includes(q) || a.tags.some((t) => t.includes(q)))
      .slice(0, 6);
  });

  protected readonly activeArticle = computed<KbArticle | undefined>(() => {
    const id = this.selectedCategoryId();
    if (!id) return undefined;
    return this.data.kbArticles().find((a) => a.categoryId === id);
  });

  protected readonly otherArticlesInCategory = computed<readonly KbArticle[]>(() => {
    const id = this.selectedCategoryId();
    const active = this.activeArticle();
    if (!id) return [];
    return this.data
      .kbArticles()
      .filter((a) => a.categoryId === id && a.id !== active?.id);
  });

  protected onTreeClick(event: NzFormatEmitEvent): void {
    const node = event.node;
    if (!node) return;
    if (node.isLeaf) {
      this.selectedCategoryId.set(String(node.key));
    } else {
      node.isExpanded = !node.isExpanded;
    }
  }

  protected onCascaderChange(path: string[] | null): void {
    if (path && path.length > 0) {
      this.selectedCategoryId.set(path[path.length - 1]);
    }
  }

  protected onSearchPick(articleId: string): void {
    const article = this.data.kbArticles().find((a) => a.id === articleId);
    if (article) {
      this.selectedCategoryId.set(article.categoryId);
      this.search.set('');
    }
  }

  protected onRate(value: number): void {
    this.userRating.set(value);
    this.message.success(`Thanks, recorded a ${value}-star rating`);
  }

  protected sectionId(article: KbArticle, index: number): string {
    return `${article.id}-s${index}`;
  }
}
