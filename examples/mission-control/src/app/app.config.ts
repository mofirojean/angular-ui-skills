import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideIcons } from '@ng-icons/core';
import {
  lucideBot,
  lucideCalendar,
  lucideHouse,
  lucideLogOut,
  lucideMoon,
  lucidePanelLeft,
  lucidePlay,
  lucideSearch,
  lucideSettings,
  lucideStore,
  lucideSun,
  lucideUser,
  lucideFolderSearch,
} from '@ng-icons/lucide';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withComponentInputBinding()),
    provideIcons({
      lucideBot,
      lucideCalendar,
      lucideHouse,
      lucideLogOut,
      lucideMoon,
      lucidePanelLeft,
      lucidePlay,
      lucideSearch,
      lucideSettings,
      lucideStore,
      lucideSun,
      lucideUser,
      lucideFolderSearch,
    }),
  ],
};
