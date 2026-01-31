import { Component, Input } from '@angular/core';
import { CapaMapa } from '@app/core/interfaces/AdminGeo/CapaMapa';
import { DividerModule } from 'primeng/divider';
import { LayerItemV4Component } from '@app/widget/content-table-v4/components/layer-item-v4/layer-item-v4.component';

/**
 * Componente que renderiza de manera recursiva la lista de capas de la tabla de contenido
 * @date 14-08-2025
 * @author Andres Fabian Simbaqueba Del Rio
 */
@Component({
  selector: 'app-layer-tree-item-v4',
  standalone: true,
  imports: [DividerModule, LayerItemV4Component],
  templateUrl: './layer-tree-item-v4.component.html',
  styleUrl: './layer-tree-item-v4.component.scss',
})
export class LayerTreeItemV4Component {
  @Input() layerToRender: CapaMapa | undefined = undefined; //Capa
  @Input() textColor: string | null = null; // color del texto de las capas
  @Input() fontSizeLeafLayer:
    | 'text-xs'
    | 'text-sm'
    | 'text-base'
    | 'text-lg'
    | 'text-xl'
    | 'text-2xl'
    | 'text-3xl'
    | 'text-4xl'
    | 'text-5xl'
    | 'text-6xl'
    | 'text-7xl'
    | 'text-xl' = 'text-base'; //indica el tamaño del texto para las capas tipo hoja

  @Input() fontSizeParentLayer:
    | 'text-xs'
    | 'text-sm'
    | 'text-base'
    | 'text-lg'
    | 'text-xl'
    | 'text-2xl'
    | 'text-3xl'
    | 'text-4xl'
    | 'text-5xl'
    | 'text-6xl'
    | 'text-7xl'
    | 'text-xl' = 'text-2xl'; //indica el tamaño del texto para las capas tipo padre

  @Input() fontSizeTransparencyText:
    | 'text-xs'
    | 'text-sm'
    | 'text-base'
    | 'text-lg'
    | 'text-xl'
    | 'text-2xl'
    | 'text-3xl'
    | 'text-4xl'
    | 'text-5xl'
    | 'text-6xl'
    | 'text-7xl'
    | 'text-xl' = 'text-sm'; //indica el tamaño del texto para las capas tipo hoja
  @Input() severityButton:
    | 'success'
    | 'info'
    | 'warn'
    | 'danger'
    | 'help'
    | 'primary'
    | 'secondary'
    | 'contrast'
    | null
    | undefined = 'contrast';
}
