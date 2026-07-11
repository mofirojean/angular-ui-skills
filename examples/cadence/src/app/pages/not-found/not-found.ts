import { Component } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'cad-not-found',
  imports: [MatButton, RouterLink],
  template: `
    <section class="lost">
      <span class="eyebrow">404</span>
      <h1>Nothing scheduled at this address.</h1>
      <p>The page you're after doesn't exist. Head back to the calendar.</p>
      <a mat-flat-button routerLink="/calendar">Back to calendar</a>
    </section>
  `,
  styles: `
    .lost {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.75rem;
      padding: 6rem 1.5rem;
      text-align: center;
    }
    .eyebrow {
      font: var(--mat-sys-label-small);
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: var(--mat-sys-primary);
    }
    h1 {
      font: var(--mat-sys-headline-large);
      margin: 0;
    }
    p {
      font: var(--mat-sys-body-medium);
      color: var(--mat-sys-on-surface-variant);
      margin: 0 0 1rem;
    }
  `,
})
export class NotFound {}
