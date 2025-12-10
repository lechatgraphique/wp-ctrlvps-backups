import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MenubarModule } from 'primeng/menubar';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { BadgeModule } from 'primeng/badge';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MenubarModule,
    AvatarModule,
    ButtonModule,
    BadgeModule
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class App {
  protected readonly menuItems = signal<MenuItem[]>([
    {
      label: 'Tableau de bord',
      icon: 'pi pi-home',
      routerLink: '/dashboard'
    },
    {
      label: 'Sauvegardes',
      icon: 'pi pi-database',
      routerLink: '/backups'
    },
    {
      label: 'Logs',
      icon: 'pi pi-list',
      routerLink: '/logs'
    }
  ]);
}
