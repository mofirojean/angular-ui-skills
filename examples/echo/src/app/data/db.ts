import { type DBSchema, type IDBPDatabase, openDB } from 'idb';
import type { PlayEvent, Playlist, Track } from './types';

export interface EchoDB extends DBSchema {
  tracks: {
    key: string;
    value: Track;
    indexes: {
      'by-artist': string;
      'by-album': string;
      'by-added': number;
    };
  };
  blobs: {
    key: string;
    value: { id: string; blob: Blob; mimeType: string };
  };
  covers: {
    key: string;
    value: { id: string; blob: Blob; mimeType: string };
  };
  playlists: {
    key: string;
    value: Playlist;
  };
  plays: {
    key: number;
    value: PlayEvent;
    indexes: {
      'by-track': string;
      'by-at': number;
    };
  };
  settings: {
    key: string;
    value: unknown;
  };
}

const DB_NAME = 'echo';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<EchoDB>> | null = null;

export function openEchoDb(): Promise<IDBPDatabase<EchoDB>> {
  if (!dbPromise) {
    dbPromise = openDB<EchoDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        const tracks = db.createObjectStore('tracks', { keyPath: 'id' });
        tracks.createIndex('by-artist', 'artist');
        tracks.createIndex('by-album', 'album');
        tracks.createIndex('by-added', 'addedAt');

        db.createObjectStore('blobs', { keyPath: 'id' });
        db.createObjectStore('covers', { keyPath: 'id' });
        db.createObjectStore('playlists', { keyPath: 'id' });

        const plays = db.createObjectStore('plays', {
          keyPath: 'id',
          autoIncrement: true,
        });
        plays.createIndex('by-track', 'trackId');
        plays.createIndex('by-at', 'at');

        db.createObjectStore('settings');
      },
    });
  }
  return dbPromise;
}

export async function resetEchoDb(): Promise<void> {
  const db = await openEchoDb();
  db.close();
  dbPromise = null;
  await new Promise<void>((resolve, reject) => {
    const req = indexedDB.deleteDatabase(DB_NAME);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
    req.onblocked = () => resolve();
  });
}
