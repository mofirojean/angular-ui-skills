import { Injectable, signal } from '@angular/core';
import type { Reviewer } from './model';

@Injectable({ providedIn: 'root' })
export class MockDataService {
  readonly currentReviewer = signal<Reviewer>({
    id: 'rev-001',
    name: 'Mofiro Jean',
    handle: 'mofirojean',
    role: 'Staff Engineer',
    avatarUrl: null,
  });
}
