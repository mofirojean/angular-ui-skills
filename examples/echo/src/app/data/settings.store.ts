import { Injectable } from '@angular/core';
import { openEchoDb } from './db';

@Injectable({ providedIn: 'root' })
export class SettingsStore {
  async get<T>(key: string): Promise<T | undefined> {
    const db = await openEchoDb();
    return (await db.get('settings', key)) as T | undefined;
  }

  async set(key: string, value: unknown): Promise<void> {
    const db = await openEchoDb();
    await db.put('settings', value, key);
  }
}
