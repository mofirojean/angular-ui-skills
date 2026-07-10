import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import {
  MatDatepicker,
  MatDatepickerInput,
  MatDatepickerToggle,
} from '@angular/material/datepicker';
import { MatFormField, MatLabel, MatSuffix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    FormsModule,
    MatButton,
    MatDatepicker,
    MatDatepickerInput,
    MatDatepickerToggle,
    MatFormField,
    MatLabel,
    MatInput,
    MatSuffix,
  ],
  template: `
    <main class="proof">
      <h1>Cadence</h1>
      <p>Angular Material wiring proof. The shell lands next.</p>
      <div class="row">
        <mat-form-field appearance="outline" subscriptSizing="dynamic">
          <mat-label>Pick a date</mat-label>
          <input matInput [matDatepicker]="picker" [(ngModel)]="picked" />
          <mat-datepicker-toggle matSuffix [for]="picker" />
          <mat-datepicker #picker />
        </mat-form-field>
        <button mat-flat-button (click)="picked.set(null)">Clear</button>
      </div>
      @if (picked(); as date) {
        <p class="result">Selected: {{ date }}</p>
      }
    </main>
    <router-outlet />
  `,
  styles: `
    .proof {
      max-width: 480px;
      margin: 4rem auto;
      padding: 0 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    h1 {
      font: var(--mat-sys-display-small);
      color: var(--mat-sys-primary);
      margin: 0;
    }
    p {
      color: var(--mat-sys-on-surface-variant);
      margin: 0 0 1rem;
    }
    .row {
      display: flex;
      align-items: stretch;
      gap: 1rem;
    }
    .row button {
      height: auto;
    }
    .result {
      font: var(--mat-sys-body-small);
    }
  `,
})
export class App {
  protected readonly picked = signal<Date | null>(null);
}
