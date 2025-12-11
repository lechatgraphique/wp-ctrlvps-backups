import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SkeletonModule } from 'primeng/skeleton';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-backup-table-secleton',
  imports: [SkeletonModule, TableModule],
  template: `
    <p-table [value]="skeletonRows" [tableStyle]="{'min-width': '50rem'}" size="small" styleClass="p-datatable-striped">
      <ng-template pTemplate="header">
        <tr>
          <th>Date</th>
          <th>Taille</th>
          <th><i class="pi pi-cog"></i></th>
        </tr>
      </ng-template>
      <ng-template pTemplate="body">
        <tr>
          <td><p-skeleton width="100px" /></td>
          <td><p-skeleton width="100px" /></td>
          <td>
            <div class="flex gap-2">
              <p-skeleton shape="circle" size="2rem" />
              <p-skeleton shape="circle" size="2rem" />
            </div>
          </td>
        </tr>
      </ng-template>
    </p-table>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BackupTableSecleton {
  protected readonly skeletonRows = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
}
