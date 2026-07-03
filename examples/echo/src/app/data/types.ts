export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  albumArtist: string;
  year: number | null;
  genre: string[];
  trackNo: number | null;
  discNo: number | null;
  duration: number;
  bitrate: number | null;
  sampleRate: number | null;
  channels: number | null;
  format: string;
  codec: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  addedAt: number;
  playCount: number;
  lastPlayedAt: number | null;
  liked: boolean;
  rating: number;
  hasCover: boolean;
  peaks: Peaks | null;
}

export interface Peaks {
  version: 1;
  samples: number;
  min: Float32Array;
  max: Float32Array;
}

export interface Playlist {
  id: string;
  name: string;
  description: string;
  trackIds: string[];
  createdAt: number;
  updatedAt: number;
  coverTrackId: string | null;
}

export interface PlayEvent {
  id?: number;
  trackId: string;
  at: number;
  msPlayed: number;
  completed: boolean;
}

export type ImportStatus =
  | 'queued'
  | 'parsing'
  | 'decoding'
  | 'storing'
  | 'done'
  | 'failed'
  | 'cancelled';

export interface ImportEntry {
  id: string;
  fileName: string;
  fileSize: number;
  status: ImportStatus;
  progress: number;
  title: string;
  artist: string;
  album: string;
  trackId: string | null;
  error: string | null;
  startedAt: number | null;
  finishedAt: number | null;
}
