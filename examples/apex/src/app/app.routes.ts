import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/chat-empty/chat-empty').then((m) => m.ChatEmpty),
    pathMatch: 'full',
    title: 'Apex',
  },
  {
    path: 'c/:id',
    loadComponent: () => import('./pages/chat-conversation/chat-conversation').then((m) => m.ChatConversation),
    title: 'Chat, Apex',
  },
  {
    path: 'projects',
    loadComponent: () => import('./pages/projects/projects').then((m) => m.Projects),
    title: 'Projects, Apex',
  },
  {
    path: 'projects/:id',
    loadComponent: () => import('./pages/projects/project-detail/project-detail').then((m) => m.ProjectDetail),
    title: 'Project, Apex',
  },
  {
    path: 'settings',
    loadComponent: () => import('./pages/settings/settings').then((m) => m.Settings),
    title: 'Settings, Apex',
  },
];
