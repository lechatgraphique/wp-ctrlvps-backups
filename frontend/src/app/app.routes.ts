import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'logs',
    loadComponent: () => import('./components/logs/logs.component').then(m => m.LogsComponent)
  },
  {
    path: 'backups',
    loadComponent: () => import('./components/backups/backups.component').then(m => m.BackupsComponent)
  }
];
