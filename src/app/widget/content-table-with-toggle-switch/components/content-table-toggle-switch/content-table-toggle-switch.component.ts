import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { MessageService } from 'primeng/api';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { Store } from '@ngrx/store';
import { MapState } from '@app/core/interfaces/store/map.model';
import { LayerTreeItemComponent } from '@app/widget/content-table-with-toggle-switch/components/layer-tree-item/layer-tree-item.component';
import { PersonalizedSpinnerComponent } from '@app/shared/components/personalized-spinner/personalized-spinner.component';
import { SearchLayerInputComponent } from '@app/shared/components/search-layer-input/search-layer-input.component';
import { ContentTableDirective } from '@app/shared/directives/content-table/content-table.directive';
import { LayerDefinitionsService } from '@app/shared/services/layer-definitions-service/layer-definitions.service';
import { FilterContentTableService } from '@app/core/services/filter-content-table/filter-content-table.service';
import { LayerOptionService } from '@app/shared/services/layer-options/layer-option.service';

/**
 * Componente que contiene la tabla de contenido con la implementación de toggle switch
 * @date 17-06-2025
 * @author Andres Fabian Simbaqueba Del Rio
 */
@Component({
  selector: 'app-content-table-toggle-switch',
  standalone: true,
  imports: [
    IconFieldModule,
    InputIconModule,
    InputTextModule,
    ButtonModule,
    LayerTreeItemComponent,
    PersonalizedSpinnerComponent,
    TooltipModule,
    SearchLayerInputComponent,
  ],
  providers: [MessageService, FilterContentTableService, LayerOptionService],
  templateUrl: './content-table-toggle-switch.component.html',
  styleUrl: './content-table-toggle-switch.component.scss',
})
export class ContentTableToggleSwitchComponent
  extends ContentTableDirective
  implements OnInit, OnDestroy
{
  @Input() placeHolderSearchInput = 'Buscar capa...'; //indica el placeholder del input de busqueda
  @Input() iconSearchInputClass = 'pi pi-search'; //icono del input de busqueda
  @Input() iconPosition: 'left' | 'right' = 'right'; //posicion del icono de busqueda
  @Input() iconInputVisible = true; //indica si el icono de busqueda es visible
  @Input() iconEraserLayersClass: string | null = null; //icono del boton desseleccionar capas
  @Input() textColor: string | null = 'text-color'; //color del texto para el titulo de la capa
  @Input() isCenteredLayerParentTitle = false; //indica si el titulo de las capas padre es centrado
  @Input() requiredDivider = false; //indica si se agrega un separador entre las capas
  @Input() requireIdentation = true; //indica si las capas hija requieren identacion

  /**
   * Creates an instance of ContentTableMainOpiacComponent.
   * @date 17-06-2025
   * @param {LayerDefinitionsService} layerDefinitionService servicio que consulta las capas en el servidor
   * @param {Store<MapState>} mapStore store para consultar la URL base y la URL de las capas
   * @param {EventBusService} eventBusService servicio que emite las capas que se han agregado
   * @param {FormBuilder} formBuilder constructor de formularios
   * @param {MessageService} messageService Servicio para mostrar mensajes
   */
  constructor(
    protected override mapStore: Store<MapState>,
    protected override messageService: MessageService,
    protected override layerDefinitionService: LayerDefinitionsService,
    protected override filterService: FilterContentTableService
  ) {
    super(mapStore, messageService, layerDefinitionService, filterService);
  }
  /**
   * Consulta la lista de capas en el servidor
   * Se suscribe al bus de eventos para cuando se eliminan capas desde el área de trabajo
   * Se suscribe a los campos del filtro
   */
  ngOnInit(): void {
    this.isSearchingLayerList = true;
    this.getWorkAreaLayerList();
    this.searchLayersOfContentTable();
    this.addSelectedLayers();
  }

  /**
   * Metodo que se ejecuta al destruir el componente
   * Se cancela la suscripcion al servicio
   */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
