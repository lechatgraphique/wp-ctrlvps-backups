import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MessageModule } from 'primeng/message';
import { LogEntry, AlertEntry } from '../../../../services/backup-api.service';
import { LogSecleton } from '../tabs-secleton/log-secleton';

type LogItem = LogEntry | AlertEntry;

@Component({
  selector: 'app-log-list',
  imports: [CommonModule, MessageModule, LogSecleton],
  template: `
    @if (loading()) {
      <app-log-secleton />
    } @else if (items().length === 0) {
      <div class="flex flex-col items-center">
        <p-message 
          [severity]="emptyMessageSeverity()" 
          [icon]="emptyMessageIcon()" 
          styleClass="w-full">
          {{ emptyMessage() }}
        </p-message>
      </div>
    } @else {
      <div class="flex flex-col gap-2">
        @for (item of items(); track item.timestamp) {
          <div
            class="p-4 rounded-lg border flex flex-col gap-2"
            [ngClass]="getItemClasses(item)">
            <div class="flex items-center justify-between gap-2">
              <div class="flex items-center gap-2">
                <i 
                  [class]="getItemIcon(item)" 
                  [ngClass]="getIconColorClasses(item)"></i>
                <span [ngClass]="getLabelColorClasses(item)">
                  {{ getItemLevel(item).toUpperCase() }}
                </span>
              </div>
              <span class="text-sm text-gray-500">{{ formatDate(item.timestamp) }}</span>
            </div>
            <div class="text-sm text-gray-700 pl-6">{{ item.message }}</div>
          </div>
        }
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LogListComponent {
  items = input.required<LogItem[]>();
  loading = input<boolean>(false);
  emptyMessage = input<string>('Aucun élément disponible.');
  emptyMessageSeverity = input<'success' | 'secondary' | 'info' | 'warn' | 'error' | 'contrast' | null>('secondary');
  emptyMessageIcon = input<string>('pi pi-info-circle');

  protected getItemClasses(item: LogItem): Record<string, boolean> {
    const level = this.getItemLevel(item);
    return {
      'bg-red-50 border-red-200': level === 'error',
      'bg-orange-50 border-orange-200': level === 'warning',
      'bg-blue-50 border-blue-200': level === 'info'
    };
  }

  protected getItemIcon(item: LogItem): string {
    const level = this.getItemLevel(item);
    switch (level) {
      case 'error':
        return 'pi pi-times-circle';
      case 'warning':
        return 'pi pi-exclamation-circle';
      default:
        return 'pi pi-info-circle';
    }
  }

  protected getIconColorClasses(item: LogItem): Record<string, boolean> {
    const level = this.getItemLevel(item);
    return {
      'text-red-600': level === 'error',
      'text-orange-600': level === 'warning',
      'text-blue-600': level === 'info'
    };
  }

  protected getLabelColorClasses(item: LogItem): Record<string, boolean> {
    const level = this.getItemLevel(item);
    return {
      'text-red-600': level === 'error',
      'text-orange-600': level === 'warning',
      'text-blue-600': level === 'info'
    };
  }

  protected getItemLevel(item: LogItem): 'info' | 'warning' | 'error' {
    // LogEntry a une propriété 'level', AlertEntry a une propriété 'type'
    if ('level' in item) {
      return item.level;
    } else {
      return item.type;
    }
  }

  protected formatDate(dateString: string): string {
    return new Date(dateString).toLocaleString('fr-FR');
  }
}
