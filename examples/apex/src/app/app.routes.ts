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
];
