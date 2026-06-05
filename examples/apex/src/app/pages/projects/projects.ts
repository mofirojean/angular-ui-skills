import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmIcon } from '@spartan-ng/helm/icon';

import { PROJECTS } from '../../data/projects';

@Component({
  selector: 'app-projects',
  imports: [RouterLink, NgIcon, HlmButton, HlmIcon],
  templateUrl: './projects.html',
  host: { class: 'flex min-h-0 flex-1 flex-col' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Projects {
  protected readonly query = signal('');

  protected readonly projects = computed(() => {
    const q = this.query().trim().toLowerCase();
    if (!q) return PROJECTS;
    return PROJECTS.filter(
      (p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q),
    );
  });

  protected onQuery(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
  }
}
