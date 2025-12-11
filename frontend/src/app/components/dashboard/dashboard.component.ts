import { Component, ChangeDetectionStrategy, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ProgressBarModule } from 'primeng/progressbar';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { ChartModule } from 'primeng/chart';
import { MeterGroupModule } from 'primeng/metergroup';
import { BackupApiService, BackupStats, SystemStats } from '../../services/backup-api.service';
import { DividerModule } from 'primeng/divider';
@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, CardModule, ProgressBarModule, TagModule, ButtonModule, ChartModule, MeterGroupModule, DividerModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent implements OnInit {
  private readonly backupApi = inject(BackupApiService);

  protected readonly stats = signal<BackupStats | null>(null);
  protected readonly systemStats = signal<SystemStats | null>(null);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);

  // Données pour les graphiques Chart.js
  protected readonly cpuChartData = signal<any>(null);
  protected readonly memoryChartData = signal<any>(null);
  protected readonly successErrorChartData = signal<any>(null);
  protected readonly chartOptions = signal<any>(null);

  // Données pour MeterGroup (espace disque)
  protected readonly diskMeterData = signal<any[]>([]);

  protected readonly diskUsagePercentage = computed(() => {
    const statsValue = this.stats();
    return statsValue ? statsValue.diskUsage.percentage : 0;
  });

  protected readonly diskUsageColor = computed(() => {
    const percentage = this.diskUsagePercentage();
    if (percentage >= 85) return 'danger' as const;
    if (percentage >= 70) return 'warn' as const;
    return 'success' as const;
  });

  ngOnInit(): void {
    this.initializeChartOptions();
    this.loadStats();
  }

  private initializeChartOptions(): void {
    this.chartOptions.set({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
        },
        tooltip: {
          enabled: true
        }
      }
    });
  }

  private loadStats(): void {
    this.loading.set(true);
    this.error.set(null);
    
    // Charger les stats de backups
    this.backupApi.getStats().subscribe({
      next: (data) => {
        this.stats.set(data);
        this.updateCharts(data);
        this.updateMeters(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.message || 'Erreur lors du chargement des statistiques');
        this.loading.set(false);
      }
    });

    // Charger les stats système
    this.backupApi.getSystemStats().subscribe({
      next: (data) => {
        this.systemStats.set(data);
        this.updateSystemCharts(data);
      },
      error: (err) => {
        console.error('Erreur lors du chargement des stats système:', err);
      }
    });
  }

  private updateSystemCharts(systemStats: SystemStats): void {
    // Graphique CPU
    this.cpuChartData.set({
      labels: ['Utilisé', 'Libre'],
      datasets: [{
        label: 'CPU',
        data: [systemStats.cpu.usage, 100 - systemStats.cpu.usage],
        backgroundColor: [
          'rgb(59, 130, 246)', // blue-500
          'rgb(229, 231, 235)' // gray-200
        ],
        borderWidth: 0
      }]
    });

    // Graphique Mémoire
    this.memoryChartData.set({
      labels: ['Utilisé', 'Libre'],
      datasets: [{
        label: 'Mémoire',
        data: [systemStats.memory.percentage, 100 - systemStats.memory.percentage],
        backgroundColor: [
          'rgb(34, 197, 94)', // green-500
          'rgb(229, 231, 235)' // gray-200
        ],
        borderWidth: 0
      }]
    });
  }

  private updateCharts(backupStats: BackupStats): void {
    // Graphique Taux de succès/erreur
    const montfreerideMysqlSuccess = backupStats.montfreeride.mysql.successRate;
    const montfreerideMysqlError = backupStats.montfreeride.mysql.errorRate;
    const oxygenefitMysqlSuccess = backupStats.oxygenefit.mysql.successRate;
    const oxygenefitMysqlError = backupStats.oxygenefit.mysql.errorRate;

    this.successErrorChartData.set({
      labels: ['Montfreeride MySQL', 'Oxygenefit MySQL'],
      datasets: [
        {
          label: 'Succès',
          data: [montfreerideMysqlSuccess, oxygenefitMysqlSuccess],
          backgroundColor: 'rgb(34, 197, 94)' // green-500
        },
        {
          label: 'Erreurs',
          data: [montfreerideMysqlError, oxygenefitMysqlError],
          backgroundColor: 'rgb(239, 68, 68)' // red-500
        }
      ]
    });
  }

  private updateMeters(backupStats: BackupStats): void {
    // MeterGroup pour l'espace disque global et par projet
    const meters: any[] = [
      {
        label: 'Disque Global',
        value: backupStats.diskUsage.percentage,
        color1: backupStats.diskUsage.percentage >= 85 ? '#ef4444' : backupStats.diskUsage.percentage >= 70 ? '#f59e0b' : '#22c55e',
        color2: backupStats.diskUsage.percentage >= 85 ? '#dc2626' : backupStats.diskUsage.percentage >= 70 ? '#d97706' : '#16a34a'
      }
    ];

    // Calculer l'espace disque par projet (basé sur la taille totale des backups)
    const totalBackupSize = backupStats.montfreeride.mysql.totalSize + 
                           backupStats.montfreeride.files.totalSize +
                           backupStats.oxygenefit.mysql.totalSize +
                           backupStats.oxygenefit.files.totalSize;

    if (totalBackupSize > 0 && backupStats.diskUsage.total > 0) {
      const montfreerideSize = backupStats.montfreeride.mysql.totalSize + backupStats.montfreeride.files.totalSize;
      const oxygenefitSize = backupStats.oxygenefit.mysql.totalSize + backupStats.oxygenefit.files.totalSize;
      
      const montfreeridePercent = Math.round((montfreerideSize / backupStats.diskUsage.total) * 100);
      const oxygenefitPercent = Math.round((oxygenefitSize / backupStats.diskUsage.total) * 100);

      meters.push(
        {
          label: 'Montfreeride',
          value: montfreeridePercent,
          color1: '#3b82f6',
          color2: '#2563eb'
        },
        {
          label: 'Oxygenefit',
          value: oxygenefitPercent,
          color1: '#8b5cf6',
          color2: '#7c3aed'
        }
      );
    }

    this.diskMeterData.set(meters);
  }

  protected formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  protected formatDate(dateString: string | null): string {
    if (!dateString) return 'Aucune sauvegarde';
    return new Date(dateString).toLocaleString('fr-FR');
  }

  protected refresh(): void {
    this.loadStats();
  }
}

