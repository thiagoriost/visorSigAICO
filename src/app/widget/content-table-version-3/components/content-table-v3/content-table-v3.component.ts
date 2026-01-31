import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';
import { Toast } from 'primeng/toast';
import { Button } from 'primeng/button';
import { Store } from '@ngrx/store';
import { LayerDefinitionsService } from '@app/shared/services/layer-definitions-service/layer-definitions.service';
import { MapState } from '@app/core/interfaces/store/map.model';
import { FilterContentTableService } from '@app/core/services/filter-content-table/filter-content-table.service';
import { PersonalizedSpinnerComponent } from '@app/shared/components/personalized-spinner/personalized-spinner.component';
import { LayerTreeComponent } from '@app/widget/content-table-version-3/components/layer-tree/layer-tree.component';
import { SearchLayerInputComponent } from '@app/shared/components/search-layer-input/search-layer-input.component';
import { ContentTableDirective } from '@app/shared/directives/content-table/content-table.directive';
import { CommonModule } from '@angular/common';

/**
 * Componente que renderiza la tabla de contenido con el campo para buscar capas por palabra clave
 * @date 29-07-2025
 * @author Andres Fabian Simbaqueba Del Rio
 */
@Component({
  selector: 'app-content-table-v3',
  standalone: true,
  imports: [
    IconFieldModule,
    InputIconModule,
    InputTextModule,
    TooltipModule,
    Toast,
    PersonalizedSpinnerComponent,
    Button,
    LayerTreeComponent,
    SearchLayerInputComponent,
    CommonModule,
  ],
  providers: [MessageService, FilterContentTableService],
  templateUrl: './content-table-v3.component.html',
  styleUrl: './content-table-v3.component.scss',
})
export class ContentTableV3Component
  extends ContentTableDirective
  implements OnInit, OnDestroy
{
  @Input() backgroundColor: string | null = null;
  @Input() isExpandedList = true; //indica si el arbol de capas inicia colapsado o expandido
  @Input() iconsColor: string | null = null;
  @Input() layerItemIconsColor: string | null = null; //color para los iconos de la capa
  @Input() layerItemTextColor: string | null = null; //color para el texto de la capa y del titulo del nodo padre
  @Input() headerText: string | null = null; //texto del header

  @Input() deleteAllLayersButtonVariant: 'outlined' | 'text' | undefined =
    'text'; //variante del boton de deseleccionar las capas
  @Input() deleteAllLayersButtonSeverity:
    | 'success'
    | 'info'
    | 'warn'
    | 'danger'
    | 'help'
    | 'primary'
    | 'secondary'
    | 'contrast'
    | null
    | undefined = 'danger'; //severity del boton de deseleccionar las capas
  @Input() deleteAllLayersButtonIcon = 'pi pi-eraser'; //icono del boton de deseleccionar las capas
  @Input() deleteAllLayersButtonTooltip = 'Deseleccionar todo'; //mensje de feedback del boton de deseleccionar las capas
  @Input() deleteAllLayersButtonRounded = true; //redondeado del boton de deseleccionar las capas

  @Input() showMetadataIcon = 'pi pi-code'; //icono para mostrar metadatos
  @Input() turnOffLayerIcon = 'pi pi-eye-slash'; //icono patra ocultar la capa
  @Input() turnOnLayerIcon = 'pi pi-eye'; //icono para mostrar la capa
  @Input() moreOptionsIcon = 'pi pi-ellipsis-v'; //icono para las opciones de la capa
  @Input() severityButtonsLayer:
    | 'success'
    | 'info'
    | 'warn'
    | 'danger'
    | 'help'
    | 'primary'
    | 'secondary'
    | 'contrast'
    | null
    | undefined = 'danger'; //severity de los botones de la capa

  constructor(
    protected override mapStore: Store<MapState>,
    protected override messageService: MessageService,
    protected override layerDefinitionService: LayerDefinitionsService,
    protected override filterService: FilterContentTableService
  ) {
    super(mapStore, messageService, layerDefinitionService, filterService);
  }

  /**
   * 1. Al iniciar el componente, se construye el formulario del filtro de las capas
   * 2. se consultan las capas en el store que ya han sido seleccionadas
   * 3. Se consultan las capas que se renderizan en la tabla de contenido
   */
  ngOnInit(): void {
    this.isSearchingLayerList = true;
    this.getWorkAreaLayerList();
    this.searchLayersOfContentTable();
    this.addSelectedLayers();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
