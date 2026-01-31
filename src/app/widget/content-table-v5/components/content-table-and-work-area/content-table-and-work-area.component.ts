import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { TabsModule } from 'primeng/tabs';
import { ContentTableToggleSwitchComponent } from '@app/widget/content-table-with-toggle-switch/components/content-table-toggle-switch/content-table-toggle-switch.component';
import { WorkAreaV3Component } from '../work-area-v3/work-area-v3.component';
import { LayerOptionService } from '@app/shared/services/layer-options/layer-option.service';
import { FilterContentTableService } from '@app/core/services/filter-content-table/filter-content-table.service';

/**
 * Componente que renderiza la tabla de contenido y el area de trabajo separado por tabs
 * @date 27-08-2025
 * @author Andres Fabian Simbaqueba Del Rio
 */
@Component({
  selector: 'app-content-table-and-work-area',
  imports: [
    CommonModule,
    TabsModule,
    ContentTableToggleSwitchComponent,
    WorkAreaV3Component,
  ],
  providers: [LayerOptionService, FilterContentTableService],
  templateUrl: './content-table-and-work-area.component.html',
  styleUrl: './content-table-and-work-area.component.scss',
})
export class ContentTableAndWorkAreaComponent {
  /**area de trabajo*/
  @Input() isLegendVisible = false; //indica si la leyenda inicia visible o colapsada
  @Input() ocultLayerIcon = 'pi pi-eye-slash'; // icono para ocultar la capa
  @Input() showLayerIcon = 'pi pi-eye'; // icono para mostrar la capa
  @Input() setTransparencyIcon = 'pi pi-sliders-h'; // icono para generar trasnparencia de la capa
  @Input() showMetadataIcon = 'pi pi-file-o'; // icono para mostrar metadatos de la capa
  @Input() showLegendIcon = 'pi pi-palette'; // icono para mostrar la leyenda la capa
  @Input() deleteLayerIcon = 'pi pi-times'; // icono para eliminar la capa
  @Input() textColor: string | null = null; //color para el texto del titulo de la capa
  @Input() isTextButton = true; //indica si el boton es tipo texto o lleva fondo
  @Input() isRoundedButton = false; //indica si el boton es redondeado
  @Input() isCenteredButtons = false; //indica si los botones superiores deben ir centrados
  @Input() turnOnAllLayersIcon = 'pi pi-eye'; //indica el icono para el boton de prender todas las capas
  @Input() turnOffAllLayersIcon = 'pi pi-eye-slash'; //indica el icono para el boton de apagar todas las capas
  /**tabla de contenido*/
  @Input() iconEraserLayers = 'pi pi-eraser'; //clase para el icono de eliminar las capas
  @Input() placeHolderSearchInput = 'Buscar capa...'; //indica el placeholder del input de busqueda
  @Input() iconSearchInputClass = 'pi pi-search'; //icono del input de busqueda
  @Input() iconPosition: 'left' | 'right' = 'right'; //posicion del icono de busqueda
  @Input() iconInputVisible = true; //indica si el icono de busqueda es visible
  @Input() isCenteredLayerParentTitle = false; //indica si el titulo de las capas padre es centrado
  @Input() requiredDivider = false; //indica si se agrega un separador entre las capas
  @Input() requireIdentation = true; //indica si las capas hija requieren identacion
}
