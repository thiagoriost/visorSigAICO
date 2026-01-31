import { Component, Input } from '@angular/core';
import { ContentTableComponent } from '../content-table/components/content-table/content-table.component';
import { WorkAreaLayersComponent } from '../content-table/components/work-area-layers/work-area-layers.component';
import { MessageService } from 'primeng/api';
import { LayerOptionService } from '@app/shared/services/layer-options/layer-option.service';
import { Divider } from 'primeng/divider';

/**
 * Componente que combina la tabla de contenido 1 y el área de trabajo
 * @date 2025-11-21
 * @author Andres Fabian Simbaqueba
 */
@Component({
  selector: 'app-content-table-one-and-work-area',
  imports: [ContentTableComponent, WorkAreaLayersComponent, Divider],
  providers: [MessageService, LayerOptionService],
  templateUrl: './content-table-one-and-work-area.component.html',
  styleUrl: './content-table-one-and-work-area.component.scss',
})
export class ContentTableOneAndWorkAreaComponent {
  @Input() showDivider = true; //indica si se muestra un divider entre las capas y el área de trabajo
}
