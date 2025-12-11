import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SkeletonModule } from 'primeng/skeleton';

@Component({
  selector: 'app-log-secleton',
  imports: [SkeletonModule],
  template: `
    @for (i of [1, 2, 3, 4, 5]; track i) {
      <div class="border-1 rounded-md border-gray-100 p-4 mb-2">
       <div class="flex justify-between items-center gap-2 mb-2">
        <div class="flex gap-2">
          <p-skeleton shape="circle" size="1.2rem" />
          <p-skeleton width="80px" height="1.2rem" />
        </div>
        <p-skeleton width="150px" height="1.2rem"  />
       </div>
       <p-skeleton width="100%" height="30px"  />
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LogSecleton { }
