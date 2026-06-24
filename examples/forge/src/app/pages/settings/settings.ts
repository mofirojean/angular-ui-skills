import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { NgIcon } from '@ng-icons/core';

import { HlmButtonImports } from '@spartan-ng/helm/button';

interface Section {
  key: string;
  label: string;
  icon: string;
  sub: string;
}

@Component({
  selector: 'app-settings',
  imports: [NgIcon, HlmButtonImports],
  templateUrl: './settings.html',
  styleUrl: './settings.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Settings {
  protected readonly active = signal<string>('profile');

  protected readonly sections: Section[] = [
    { key: 'profile',       label: 'Profile',            icon: 'lucideCircleUserRound', sub: 'Name, bio, photo' },
    { key: 'notifications', label: 'Notifications',      icon: 'lucideBell',            sub: 'Email + in-app' },
    { key: 'keyboard',      label: 'Keyboard shortcuts', icon: 'lucideCommand',         sub: 'Customize bindings' },
    { key: 'display',       label: 'Display',            icon: 'lucideEye',             sub: 'Theme + density' },
    { key: 'integrations',  label: 'Integrations',       icon: 'lucideFolderGit2',      sub: 'Linked services' },
  ];

  protected select(key: string): void { this.active.set(key); }
}
