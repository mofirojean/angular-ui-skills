import { Component, computed, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { VERSION } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Button } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { InputText } from 'primeng/inputtext';
import { Knob } from 'primeng/knob';
import { MeterGroup, type MeterItem } from 'primeng/metergroup';
import { Select } from 'primeng/select';
import { Tabs, TabList, Tab, TabPanels, TabPanel } from 'primeng/tabs';
import {
  EQ_MAX_GAIN,
  EQ_MIN_GAIN,
  EqService,
  type EqPresetKey,
} from '../../audio/eq.service';
import { PlayerService } from '../../audio/player.service';
import { openEchoDb, resetEchoDb } from '../../data/db';
import { LibraryService } from '../../data/library.service';
import { PlaylistService } from '../../data/playlist.service';

interface StoreUsage {
  label: string;
  count: number;
  bytes: number;
}

@Component({
  selector: 'echo-settings',
  imports: [
    DecimalPipe,
    FormsModule,
    Button,
    Dialog,
    InputText,
    Knob,
    MeterGroup,
    Select,
    Tabs,
    TabList,
    Tab,
    TabPanels,
    TabPanel,
  ],
  template: `
    <section class="settings-page">
      <header>
        <span class="eyebrow">Settings</span>
        <h1 class="title">Tune Echo to taste</h1>
      </header>

      <p-tabs [(value)]="activeTab" class="settings-tabs">
        <p-tablist>
          <p-tab value="playback">Playback</p-tab>
          <p-tab value="library">Library</p-tab>
          <p-tab value="storage">Storage</p-tab>
          <p-tab value="about">About</p-tab>
        </p-tablist>
        <p-tabpanels>
          <p-tabpanel value="playback">
            <section class="panel">
              <div class="panel-head">
                <h2>Equalizer</h2>
                <p-select
                  [options]="presetOptions"
                  [ngModel]="preset()"
                  (ngModelChange)="onPreset($event)"
                  optionLabel="label"
                  optionValue="value"
                  appendTo="body"
                  class="preset-select"
                />
              </div>
              <p class="hint">
                Five peaking filters wired live to the Web Audio graph. Adjust
                while a track plays to hear the bands take effect.
              </p>
              <div class="eq-row">
                @for (band of bands; track band.frequency; let i = $index) {
                  <div class="eq-band">
                    <p-knob
                      [ngModel]="gains()[i]"
                      (ngModelChange)="onBand(i, $event)"
                      [min]="minGain"
                      [max]="maxGain"
                      [step]="1"
                      [size]="72"
                      valueTemplate="{value}dB"
                    />
                    <span class="band-label">{{ band.label }}</span>
                  </div>
                }
              </div>
              <div class="panel-actions">
                <p-button
                  label="Reset to flat"
                  icon="pi pi-undo"
                  severity="secondary"
                  [text]="true"
                  size="small"
                  (onClick)="onResetEq()"
                />
              </div>
            </section>
          </p-tabpanel>

          <p-tabpanel value="library">
            <section class="panel">
              <div class="panel-head">
                <h2>Library</h2>
              </div>
              <dl class="stat-grid">
                <dt>Tracks</dt>
                <dd>{{ library.count() }}</dd>
                <dt>Albums</dt>
                <dd>{{ library.albums().length }}</dd>
                <dt>Artists</dt>
                <dd>{{ library.artists().length }}</dd>
                <dt>Playlists</dt>
                <dd>{{ playlists.count() }}</dd>
              </dl>
            </section>
            <section class="panel danger">
              <div class="panel-head">
                <h2>Danger zone</h2>
              </div>
              <p class="hint">
                Resetting deletes every track, blob, cover, playlist, and
                setting from this browser. There is no undo.
              </p>
              <div class="panel-actions">
                <p-button
                  label="Reset library"
                  icon="pi pi-trash"
                  severity="danger"
                  [outlined]="true"
                  (onClick)="onOpenReset()"
                />
              </div>
            </section>
          </p-tabpanel>

          <p-tabpanel value="storage">
            <section class="panel">
              <div class="panel-head">
                <h2>Browser storage</h2>
                <p-button
                  icon="pi pi-refresh"
                  severity="secondary"
                  [text]="true"
                  size="small"
                  ariaLabel="Refresh"
                  (onClick)="refreshStorage()"
                />
              </div>
              @if (quota(); as q) {
                <p-meterGroup [value]="meterItems()" />
                <div class="hint">
                  {{ formatSize(q.usage) }} used of
                  {{ formatSize(q.quota) }} available
                  ({{ (q.usage / q.quota) * 100 | number: '1.1-1' }}%)
                </div>
              } @else {
                <div class="hint">Reading storage estimate…</div>
              }
            </section>
            <section class="panel">
              <div class="panel-head">
                <h2>Per store</h2>
              </div>
              @if (storeUsage().length === 0) {
                <div class="hint">Calculating…</div>
              } @else {
                <dl class="stat-grid wide">
                  @for (store of storeUsage(); track store.label) {
                    <dt>{{ store.label }}</dt>
                    <dd>
                      {{ store.count }}
                      {{ store.count === 1 ? 'record' : 'records' }}
                      @if (store.bytes > 0) {
                        · {{ formatSize(store.bytes) }}
                      }
                    </dd>
                  }
                </dl>
              }
            </section>
          </p-tabpanel>

          <p-tabpanel value="about">
            <section class="panel">
              <div class="panel-head">
                <h2>Echo</h2>
              </div>
              <dl class="stat-grid wide">
                <dt>Angular</dt>
                <dd>{{ angularVersion }}</dd>
                <dt>PrimeNG</dt>
                <dd>21.x with Aura preset (Echo violet)</dd>
                <dt>Audio pipeline</dt>
                <dd>music-metadata v11 · idb v8 · Web Audio API</dd>
                <dt>AudioContext</dt>
                <dd>
                  @if (audioDiagnostics(); as diag) {
                    {{ diag.state }} · {{ diag.sampleRate / 1000 | number: '1.1-1' }} kHz
                  } @else {
                    Not started. Play a track to spin up the graph.
                  }
                </dd>
                <dt>Storage backend</dt>
                <dd>
                  IndexedDB, object stores: tracks · blobs · covers ·
                  playlists · plays · settings
                </dd>
              </dl>
            </section>
          </p-tabpanel>
        </p-tabpanels>
      </p-tabs>
    </section>

    <p-dialog
      header="Reset library?"
      [(visible)]="resetDialogVisible"
      [modal]="true"
      [style]="{ width: 'min(440px, 92vw)' }"
      [dismissableMask]="true"
    >
      <div class="flex flex-col gap-4">
        <p class="m-0 text-sm text-[var(--echo-text)]">
          This permanently deletes everything Echo stores in this browser.
          Type <strong class="text-[var(--echo-heading)]">DELETE</strong> to
          confirm.
        </p>
        <input
          pInputText
          [ngModel]="resetConfirmText()"
          (ngModelChange)="resetConfirmText.set($event)"
          placeholder="DELETE"
          autocomplete="off"
        />
        <div class="flex justify-end gap-2">
          <p-button
            label="Cancel"
            severity="secondary"
            [text]="true"
            (onClick)="resetDialogVisible.set(false)"
          />
          <p-button
            label="Reset everything"
            icon="pi pi-trash"
            severity="danger"
            [disabled]="resetConfirmText() !== 'DELETE'"
            (onClick)="onConfirmReset()"
          />
        </div>
      </div>
    </p-dialog>
  `,
  styles: [
    `
      :host {
        display: block;
        height: 100%;
        overflow-y: auto;
      }
      .settings-page {
        display: flex;
        flex-direction: column;
        gap: 1.25rem;
        min-height: 100%;
        padding: 1.5rem;
      }
      @media (min-width: 768px) {
        .settings-page {
          padding: 2rem 2.5rem;
        }
      }
      .eyebrow {
        font-size: 0.7rem;
        font-weight: 500;
        letter-spacing: 0.24em;
        text-transform: uppercase;
        color: var(--echo-accent);
      }
      .title {
        font-size: 1.875rem;
        font-weight: 600;
        color: var(--echo-heading);
        margin: 0.25rem 0 0;
      }
      :host ::ng-deep .settings-tabs .p-tabpanel {
        padding: 1rem 0 0;
        display: flex;
        flex-direction: column;
        gap: 1.25rem;
      }
      .panel {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        border: 1px solid var(--echo-border);
        border-radius: 12px;
        padding: 1.25rem;
        background: var(--echo-chrome-bg);
      }
      .panel.danger {
        border-color: rgba(239, 68, 68, 0.35);
      }
      .panel-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
      }
      .panel-head h2 {
        font-size: 1.05rem;
        font-weight: 600;
        color: var(--echo-heading);
        margin: 0;
      }
      .hint {
        font-size: 0.8rem;
        color: var(--echo-muted);
        margin: 0;
      }
      .eq-row {
        display: flex;
        flex-wrap: wrap;
        gap: 1.5rem;
        justify-content: center;
        padding: 0.75rem 0;
      }
      .eq-band {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.4rem;
      }
      .band-label {
        font-size: 0.75rem;
        color: var(--echo-muted);
      }
      .panel-actions {
        display: flex;
        justify-content: flex-end;
      }
      .preset-select {
        min-width: 160px;
      }
      .stat-grid {
        display: grid;
        grid-template-columns: max-content 1fr;
        column-gap: 1.5rem;
        row-gap: 0.5rem;
        margin: 0;
        font-size: 0.875rem;
      }
      .stat-grid dt {
        color: var(--echo-muted);
      }
      .stat-grid dd {
        color: var(--echo-heading);
        margin: 0;
      }
    `,
  ],
})
export class Settings {
  private readonly eq = inject(EqService);
  private readonly player = inject(PlayerService);
  protected readonly library = inject(LibraryService);
  protected readonly playlists = inject(PlaylistService);
  private readonly messages = inject(MessageService);
  private readonly router = inject(Router);

  protected readonly activeTab = signal<'playback' | 'library' | 'storage' | 'about'>('playback');
  protected readonly resetDialogVisible = signal(false);
  protected readonly resetConfirmText = signal('');

  protected readonly bands = this.eq.bands;
  protected readonly gains = this.eq.gains;
  protected readonly preset = this.eq.preset;
  protected readonly minGain = EQ_MIN_GAIN;
  protected readonly maxGain = EQ_MAX_GAIN;
  protected readonly angularVersion = VERSION.full;

  protected readonly presetOptions: Array<{ label: string; value: EqPresetKey }> = [
    { label: 'Flat', value: 'flat' },
    { label: 'Rock', value: 'rock' },
    { label: 'Jazz', value: 'jazz' },
    { label: 'Classical', value: 'classical' },
    { label: 'Bass boost', value: 'bass-boost' },
    { label: 'Vocal', value: 'vocal' },
    { label: 'Custom', value: 'custom' },
  ];

  protected readonly quota = signal<{ usage: number; quota: number } | null>(null);
  protected readonly storeUsage = signal<StoreUsage[]>([]);
  protected readonly audioDiagnostics = signal<{ state: string; sampleRate: number } | null>(null);

  protected readonly meterItems = computed<MeterItem[]>(() => {
    const q = this.quota();
    if (!q || q.quota === 0) return [];
    return [
      {
        label: 'Echo usage',
        value: (q.usage / q.quota) * 100,
        color: 'var(--p-primary-500)',
      },
    ];
  });

  constructor() {
    void this.refreshStorage();
    this.audioDiagnostics.set(this.player.getContextDiagnostics());
  }

  onBand(index: number, gain: number): void {
    this.eq.setBand(index, gain);
  }

  onPreset(preset: EqPresetKey): void {
    this.eq.setPreset(preset);
  }

  onResetEq(): void {
    this.eq.reset();
  }

  onOpenReset(): void {
    this.resetConfirmText.set('');
    this.resetDialogVisible.set(true);
  }

  async onConfirmReset(): Promise<void> {
    if (this.resetConfirmText() !== 'DELETE') return;
    this.player.clearQueue();
    await resetEchoDb();
    await this.library.refresh();
    await this.playlists.refresh();
    this.resetDialogVisible.set(false);
    this.messages.add({
      severity: 'success',
      summary: 'Library reset',
      detail: 'Everything was deleted from this browser.',
      life: 3000,
    });
    void this.router.navigate(['/']);
  }

  async refreshStorage(): Promise<void> {
    if (navigator.storage?.estimate) {
      const estimate = await navigator.storage.estimate();
      this.quota.set({
        usage: estimate.usage ?? 0,
        quota: estimate.quota ?? 0,
      });
    }
    const db = await openEchoDb();
    const [tracks, blobs, covers, playlists, plays] = await Promise.all([
      db.count('tracks'),
      db.getAll('blobs'),
      db.getAll('covers'),
      db.count('playlists'),
      db.count('plays'),
    ]);
    const blobBytes = blobs.reduce((sum, b) => sum + b.blob.size, 0);
    const coverBytes = covers.reduce((sum, c) => sum + c.blob.size, 0);
    this.storeUsage.set([
      { label: 'Audio blobs', count: blobs.length, bytes: blobBytes },
      { label: 'Cover art', count: covers.length, bytes: coverBytes },
      { label: 'Track metadata', count: tracks, bytes: 0 },
      { label: 'Playlists', count: playlists, bytes: 0 },
      { label: 'Play history', count: plays, bytes: 0 },
    ]);
  }

  formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    if (bytes < 1024 * 1024 * 1024)
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  }
}
