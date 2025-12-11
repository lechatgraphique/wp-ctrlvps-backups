import { Component, ChangeDetectionStrategy, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { TooltipModule } from 'primeng/tooltip';
import { SelectModule } from 'primeng/select';
import { SelectButtonModule } from 'primeng/selectbutton';
import { BackupApiService, BackupFile } from '../../services/backup-api.service';
import { RestoreDialogComponent } from '../restore-dialog/restore-dialog.component';
import { DividerModule } from 'primeng/divider';
import { BackupTableSecleton } from '../shared/components/tabs-secleton/backup-table-secleton'; 
type Project = 'montfreeride' | 'oxygenefit';
type BackupType = 'mysql' | 'files';

interface ProjectOption {
  label: string;
  value: Project;
}

interface BackupTypeOption {
  label: string;
  value: BackupType;
}

@Component({
  selector: 'app-backups',
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    TableModule,
    ButtonModule,
    TagModule,
    DialogModule,
    TooltipModule,
    SelectModule,
    SelectButtonModule,
    RestoreDialogComponent,
    DividerModule,
    BackupTableSecleton
  ],
  templateUrl: './backups.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BackupsComponent {
  private readonly backupApi = inject(BackupApiService);

  protected readonly selectedProject = signal<Project>('montfreeride');
  protected readonly selectedType = signal<BackupType>('mysql');
  
  // Propriétés pour le binding bidirectionnel avec ngModel
  protected get projectValue(): Project {
    return this.selectedProject();
  }
  
  protected set projectValue(value: Project) {
    this.onProjectChange(value);
  }
  
  protected get typeValue(): BackupType {
    return this.selectedType();
  }
  
  protected set typeValue(value: BackupType) {
    this.onTypeChange(value);
  }
  
  protected readonly projectOptions: ProjectOption[] = [
    { label: 'Montfreeride', value: 'montfreeride' },
    { label: 'Oxygenefit', value: 'oxygenefit' }
  ];

  protected readonly backupTypeOptions: BackupTypeOption[] = [
    { label: 'Sql', value: 'mysql' },
    { label: 'Backup', value: 'files' }
  ];
  protected readonly mysqlBackups = signal<BackupFile[]>([]);
  protected readonly filesBackups = signal<BackupFile[]>([]);
  protected readonly loading = signal(true);
  protected readonly restoreDialogVisible = signal(false);
  protected readonly selectedBackup = signal<BackupFile | null>(null);

  protected readonly currentBackups = computed(() => {
    return this.selectedType() === 'mysql' 
      ? this.mysqlBackups() 
      : this.filesBackups();
  });

  constructor() {
    this.loadBackups();
  }

  private loadBackups(): void {
    this.loading.set(true);
    const project = this.selectedProject();

    this.backupApi.getMysqlBackups(project).subscribe({
      next: (data) => {
        this.mysqlBackups.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Erreur lors du chargement des backups MySQL:', err);
        this.loading.set(false);
      }
    });

    this.backupApi.getFilesBackups(project).subscribe({
      next: (data) => {
        this.filesBackups.set(data);
      },
      error: (err) => {
        console.error('Erreur lors du chargement des backups fichiers:', err);
      }
    });
  }

  protected onProjectChange(project: Project): void {
    this.selectedProject.set(project);
    this.loadBackups();
  }

  protected onTypeChange(type: BackupType): void {
    this.selectedType.set(type);
  }

  protected formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  protected formatDate(dateString: string): string {
    return new Date(dateString).toLocaleString('fr-FR');
  }

  protected openRestoreDialog(backup: BackupFile): void {
    this.selectedBackup.set(backup);
    this.restoreDialogVisible.set(true);
  }

  protected closeRestoreDialog(): void {
    this.restoreDialogVisible.set(false);
    this.selectedBackup.set(null);
  }

  protected downloadBackup(backup: BackupFile): void {
    this.backupApi.downloadBackup(backup.path).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = backup.name;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      },
      error: (err) => {
        console.error('Erreur lors du téléchargement:', err);
      }
    });
  }

  protected refresh(): void {
    this.loadBackups();
  }
}

