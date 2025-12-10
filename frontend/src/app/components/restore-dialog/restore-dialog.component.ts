import { Component, ChangeDetectionStrategy, input, output, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { FormsModule } from '@angular/forms';
import { BackupApiService, BackupFile } from '../../services/backup-api.service';

type Project = 'montfreeride' | 'oxygenefit';
type BackupType = 'mysql' | 'files';

@Component({
  selector: 'app-restore-dialog',
  imports: [CommonModule, DialogModule, ButtonModule, InputTextModule, MessageModule, FormsModule],
  templateUrl: './restore-dialog.component.html',
  styleUrl: './restore-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RestoreDialogComponent {
  private readonly backupApi = inject(BackupApiService);

  readonly visible = input.required<boolean>();
  readonly backup = input.required<BackupFile>();
  readonly project = input.required<Project>();
  readonly backupType = input.required<BackupType>();

  readonly close = output<void>();

  protected readonly confirming = signal(false);
  protected readonly confirmationText = signal('');
  protected readonly restoring = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly success = signal(false);

  protected readonly requiredConfirmationText = 'RESTAURER';

  protected onConfirm(): void {
    if (this.confirmationText() !== this.requiredConfirmationText) {
      this.error.set('Veuillez taper "RESTAURER" pour confirmer');
      return;
    }

    this.restoring.set(true);
    this.error.set(null);

    const restoreObservable = this.backupType() === 'mysql'
      ? this.backupApi.restoreMysql(this.project(), this.backup().path)
      : this.backupApi.restoreFiles(this.project(), this.backup().path);

    restoreObservable.subscribe({
      next: (result) => {
        if (result.success) {
          this.success.set(true);
          setTimeout(() => {
            this.close.emit();
            this.reset();
          }, 2000);
        } else {
          this.error.set(result.message || 'Erreur lors de la restauration');
          this.restoring.set(false);
        }
      },
      error: (err) => {
        this.error.set(err.message || 'Erreur lors de la restauration');
        this.restoring.set(false);
      }
    });
  }

  protected onCancel(): void {
    this.close.emit();
    this.reset();
  }

  private reset(): void {
    this.confirmationText.set('');
    this.confirming.set(false);
    this.restoring.set(false);
    this.error.set(null);
    this.success.set(false);
  }

  protected formatDate(dateString: string): string {
    return new Date(dateString).toLocaleString('fr-FR');
  }

  protected formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }
}

