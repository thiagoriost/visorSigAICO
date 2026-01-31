import { Component, Input } from '@angular/core';
import { LayerItemComponent } from '@app/widget/content-table-with-toggle-switch/components/layer-item/layer-item.component';
import { CapaMapa } from '@app/core/interfaces/AdminGeo/CapaMapa';
import { DividerModule } from 'primeng/divider';
import { CommonModule } from '@angular/common';

/**
 * Componente que utiliza recursivdad para construir el arbol de capas
 * Se encarga de renderizar una capa con sus nodos hijos
 * @date 17-06-2025
 * @author Andres Fabian Simbaqueba Del Rio
 */
@Component({
  selector: 'app-layer-tree-item',
  standalone: true,
  imports: [LayerItemComponent, DividerModule, CommonModule],
  templateUrl: './layer-tree-item.component.html',
  styleUrl: './layer-tree-item.component.scss',
})
export class LayerTreeItemComponent {
  @Input() layerToRender: CapaMapa | undefined; //Capa a renderizar
  @Input() isLayerParentTitleCenter = false; //indica si el titulo de la capa padre debe ir centrado
  @Input() textColor: string | null = null; //indica la clase para el color del texto
  @Input() requiredDivider = false; //indica si se agrega un divider a cada capa
  @Input() requireIndentation = true; //indica si se identa las capas hijas
}
