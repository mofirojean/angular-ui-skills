import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideIcons } from '@ng-icons/core';
import {
  lucideArrowRight,
  lucideBell,
  lucideCheck,
  lucideChevronRight,
  lucideChevronsUpDown,
  lucideCircleCheck,
  lucideCircleUserRound,
  lucideCommand,
  lucideEye,
  lucideFilePen,
  lucideFiles,
  lucideFolderGit2,
  lucideGitCommit,
  lucideGitMerge,
  lucideGitPullRequestArrow,
  lucideInbox,
  lucideLogOut,
  lucideMessageSquare,
  lucideMoon,
  lucideMoreHorizontal,
  lucideSearch,
  lucideSettings,
  lucideSun,
} from '@ng-icons/lucide';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes, withComponentInputBinding()),
    provideIcons({
      lucideArrowRight,
      lucideBell,
      lucideCheck,
      lucideChevronRight,
      lucideChevronsUpDown,
      lucideCircleCheck,
      lucideCircleUserRound,
      lucideCommand,
      lucideEye,
      lucideFilePen,
      lucideFiles,
      lucideFolderGit2,
      lucideGitCommit,
      lucideGitMerge,
      lucideGitPullRequestArrow,
      lucideInbox,
      lucideLogOut,
      lucideMessageSquare,
      lucideMoon,
      lucideMoreHorizontal,
      lucideSearch,
      lucideSettings,
      lucideSun,
    }),
  ],
};
