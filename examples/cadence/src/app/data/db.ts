import { type DBSchema, type IDBPDatabase, openDB } from 'idb';
import type { AppSettings, Booking, Resource } from './types';

export interface CadenceDB extends DBSchema {
  resources: {
    key: string;
    value: Resource;
    indexes: { 'by-calendar': string };
  };
  bookings: {
    key: string;
    value: Booking;
    indexes: { 'by-resource': string };
  };
  settings: {
    key: string;
    value: AppSettings;
  };
}

const DB_NAME = 'cadence';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<CadenceDB>> | null = null;

export function openCadenceDb(): Promise<IDBPDatabase<CadenceDB>> {
  if (!dbPromise) {
    dbPromise = openDB<CadenceDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        const resources = db.createObjectStore('resources', { keyPath: 'id' });
        resources.createIndex('by-calendar', 'calendarKey');

        const bookings = db.createObjectStore('bookings', { keyPath: 'id' });
        bookings.createIndex('by-resource', 'resourceId');

        db.createObjectStore('settings');
      },
    });
  }
  return dbPromise;
}

export async function resetCadenceDb(): Promise<void> {
  const db = await openCadenceDb();
  db.close();
  dbPromise = null;
  await new Promise<void>((resolve, reject) => {
    const req = indexedDB.deleteDatabase(DB_NAME);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
    req.onblocked = () => resolve();
  });
}
