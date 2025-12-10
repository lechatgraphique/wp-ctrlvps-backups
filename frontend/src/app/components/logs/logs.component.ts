import { Component, ChangeDetectionStrategy, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { TabsModule } from 'primeng/tabs';
import type { TabPanelsPassThrough, TabPanelPassThrough } from 'primeng/types/tabs';
import { BackupApiService, LogEntry, AlertEntry } from '../../services/backup-api.service';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

@Component({
  selector: 'app-logs',
  imports: [CommonModule, CardModule, ButtonModule, TagModule, TabsModule, ProgressSpinnerModule],
  templateUrl: './logs.component.html',
  styleUrl: './logs.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LogsComponent implements OnInit {
  private readonly backupApi = inject(BackupApiService);

  protected readonly logs = signal<LogEntry[]>([]);
  protected readonly alerts = signal<AlertEntry[]>([]);
  protected readonly loading = signal(true);
  protected readonly activeTab = signal<string>('logs');

  // Pass Through pour retirer le padding-left des tabpanels
  protected readonly tabPanelsPt: TabPanelsPassThrough = {
    root: {
      style: {
        '--p-tabs-tabpanel-padding': '0.875rem 0 1.125rem 0'
      } as any
    }
  };

  protected readonly tabPanelPt: TabPanelPassThrough = {
    root: {
      style: {
        paddingLeft: '0'
      }
    }
  };

  ngOnInit(): void {
    this.loadLogs();
    this.loadAlerts();
  }

  private loadLogs(): void {
    this.backupApi.getLogs().subscribe({
      next: (data) => {
        this.logs.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Erreur lors du chargement des logs:', err);
        this.loading.set(false);
      }
    });
  }

  private loadAlerts(): void {
    this.backupApi.getAlerts().subscribe({
      next: (data) => {
        this.alerts.set(data);
      },
      error: (err) => {
        console.error('Erreur lors du chargement des alertes:', err);
      }
    });
  }

  protected setActiveTab(tab: 'logs' | 'alerts'): void {
    this.activeTab.set(tab);
  }

  protected getSeverity(level: string): 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast' | null {
    switch (level) {
      case 'error':
        return 'danger';
      case 'warning':
        return 'warn';
      default:
        return 'info';
    }
  }

  protected getLevelIcon(level: string): string {
    switch (level) {
      case 'error':
        return 'pi pi-times-circle';
      case 'warning':
        return 'pi pi-exclamation-circle';
      default:
        return 'pi pi-info-circle';
    }
  }

  protected formatDate(dateString: string): string {
    return new Date(dateString).toLocaleString('fr-FR');
  }

  protected refresh(): void {
    this.loading.set(true);
    this.loadLogs();
    this.loadAlerts();
  }
}
