import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIcon } from '@ng-icons/core';
import { HlmAvatar, HlmAvatarFallback } from '@spartan-ng/helm/avatar';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmIcon } from '@spartan-ng/helm/icon';

import { MODELS, MOCK_USER } from '../../data/mock-conversations';
import { API_KEYS, NOTIFICATION_CATEGORIES, NOTIFICATION_CHANNELS } from '../../data/settings-data';

type Section = 'account' | 'appearance' | 'profile' | 'models' | 'data' | 'notifications' | 'keys';
type Theme = 'system' | 'light' | 'dark';
type Density = 'cozy' | 'compact';

const DEFAULT_NOTIFY: Record<string, ReadonlyArray<string>> = {
  replies: ['desktop'],
  shares: ['email', 'desktop'],
  projects: ['email'],
  product: ['email'],
  billing: ['email'],
};

@Component({
  selector: 'app-settings',
  imports: [FormsModule, NgIcon, HlmAvatar, HlmAvatarFallback, HlmButton, HlmIcon],
  templateUrl: './settings.html',
  host: { class: 'flex min-h-0 flex-1 flex-col' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Settings {
  protected readonly user = MOCK_USER;
  protected readonly models = MODELS;
  protected readonly notificationCategories = NOTIFICATION_CATEGORIES;
  protected readonly notificationChannels = NOTIFICATION_CHANNELS;
  protected readonly apiKeys = signal([...API_KEYS]);

  protected readonly nav: { id: Section; label: string; icon: string }[] = [
    { id: 'account', label: 'Account', icon: 'lucideCircleUser' },
    { id: 'appearance', label: 'Appearance', icon: 'lucidePalette' },
    { id: 'profile', label: 'Profile', icon: 'lucideUser' },
    { id: 'models', label: 'Models', icon: 'lucideSparkles' },
    { id: 'data', label: 'Data controls', icon: 'lucideDatabase' },
    { id: 'notifications', label: 'Notifications', icon: 'lucideBell' },
    { id: 'keys', label: 'API keys', icon: 'lucideKey' },
  ];

  protected readonly themeOptions: { v: Theme; l: string; d: string }[] = [
    { v: 'system', l: 'System', d: 'Follow OS' },
    { v: 'light', l: 'Light', d: 'Cream' },
    { v: 'dark', l: 'Dark', d: 'Default' },
  ];

  protected readonly section = signal<Section>('account');
  protected readonly fullName = signal<string>(MOCK_USER.name);
  protected readonly email = signal<string>(MOCK_USER.email);
  protected readonly nickname = signal<string>('Mofiro');
  protected readonly customInstructions = signal<string>(
    'Be direct. Skip preamble. When you do not know, say so rather than guessing.',
  );
  protected readonly themeChoice = signal<Theme>('dark');
  protected readonly density = signal<Density>('cozy');
  protected readonly fontScale = signal<number>(100);
  protected readonly defaultModelId = signal<string>('apex-sonnet');
  protected readonly temperature = signal<number>(45);
  protected readonly autoFollowUp = signal<boolean>(true);
  protected readonly historyEnabled = signal<boolean>(true);
  protected readonly trainingOptOut = signal<boolean>(true);

  private readonly notify = signal<Record<string, ReadonlyArray<string>>>(DEFAULT_NOTIFY);

  protected readonly temperatureLabel = computed(() => (this.temperature() / 100).toFixed(2));

  protected setSection(id: Section): void {
    this.section.set(id);
  }
  protected setTheme(v: Theme): void {
    this.themeChoice.set(v);
  }
  protected setDensity(v: Density): void {
    this.density.set(v);
  }
  protected setDefaultModel(id: string): void {
    this.defaultModelId.set(id);
  }
  protected onFontScale(event: Event): void {
    this.fontScale.set(Number((event.target as HTMLInputElement).value));
  }
  protected onTemperature(event: Event): void {
    this.temperature.set(Number((event.target as HTMLInputElement).value));
  }
  protected isNotify(catId: string, chId: string): boolean {
    return this.notify()[catId]?.includes(chId) ?? false;
  }
  protected toggleNotify(catId: string, chId: string): void {
    this.notify.update((map) => {
      const current = map[catId] ?? [];
      const next = current.includes(chId) ? current.filter((c) => c !== chId) : [...current, chId];
      return { ...map, [catId]: next };
    });
  }
}
