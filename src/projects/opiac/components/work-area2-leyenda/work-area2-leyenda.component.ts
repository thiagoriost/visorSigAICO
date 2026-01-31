import { Component } from '@angular/core';
import { LeyendaComponent } from '@app/widget/leyenda/components/leyenda/leyenda.component';
import { WorkAreaV2Component } from '@app/widget/work-area-v2/components/work-area-v2/work-area-v2.component';
import { TabsModule } from 'primeng/tabs';

@Component({
  selector: 'app-work-area2-leyenda',
  standalone: true,
  imports: [TabsModule, WorkAreaV2Component, LeyendaComponent],
  templateUrl: './work-area2-leyenda.component.html',
  styleUrl: './work-area2-leyenda.component.scss',
})
export class WorkArea2LeyendaComponent {}
