import { Injectable, signal } from '@angular/core';
import { openCadenceDb } from '../data/db';
import { DEFAULT_SETTINGS, type AppSettings } from '../data/types';

const SETTINGS_KEY = 'app';

@Injectable({ providedIn: 'root' })
export class SettingsService {
  private readonly _settings = signal<AppSettings>(DEFAULT_SETTINGS);

  readonly settings = this._settings.asReadonly();

  constructor() {
    void this.load();
  }

  private async load(): Promise<void> {
    const db = await openCadenceDb();
    const stored = await db.get('settings', SETTINGS_KEY);
    if (stored) {
      this._settings.set({ ...DEFAULT_SETTINGS, ...stored });
    }
  }

  async update(patch: Partial<AppSettings>): Promise<void> {
    const next = { ...this._settings(), ...patch };
    this._settings.set(next);
    const db = await openCadenceDb();
    await db.put('settings', next, SETTINGS_KEY);
  }
}
