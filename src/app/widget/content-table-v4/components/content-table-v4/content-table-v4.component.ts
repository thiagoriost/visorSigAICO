import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { PersonalizedSpinnerComponent } from '@app/shared/components/personalized-spinner/personalized-spinner.component';
import { LayerTreeItemV4Component } from '../layer-tree-item-v4/layer-tree-item-v4.component';
import { DividerModule } from 'primeng/divider';
import { TooltipModule } from 'primeng/tooltip';
import { Store } from '@ngrx/store';
import { MapState } from '@app/core/interfaces/store/map.model';
import { FilterContentTableService } from '@app/core/services/filter-content-table/filter-content-table.service';
import { ActionsTopBarComponent } from '../actions-top-bar/actions-top-bar.component';
import { SearchLayerInputComponent } from '@app/shared/components/search-layer-input/search-layer-input.component';
import { ContentTableDirective } from '@app/shared/directives/content-table/content-table.directive';
import { LayerDefinitionsService } from '@app/shared/services/layer-definitions-service/layer-definitions.service';
import { LayerOptionService } from '@app/shared/services/layer-options/layer-option.service';

/**
 * Componente que renderiza la tabla de contenido
 * @date 15-08-2025
 * @author Andres Fabian Simbaqueba Del Rio
 */
@Component({
  selector: 'app-content-table-v4',
  standalone: true,
  imports: [
    ToastModule,
    ButtonModule,
    IconFieldModule,
    InputIconModule,
    InputTextModule,
    PersonalizedSpinnerComponent,
    LayerTreeItemV4Component,
    DividerModule,
    TooltipModule,
    ActionsTopBarComponent,
    SearchLayerInputComponent,
  ],
  providers: [MessageService, FilterContentTableService, LayerOptionService],
  templateUrl: './content-table-v4.component.html',
  styleUrl: './content-table-v4.component.scss',
})
export class ContentTableV4Component
  extends ContentTableDirective
  implements OnInit, OnDestroy
{
  @Input() iconTextColor: string | null = null; //color de los iconos
  @Input() textColor: string | null = null; //color del texto
  @Input() sizeButton: 'small' | 'large' | undefined = 'large'; // indica el tamanio de los botones
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
  @Input() placeHolderSearchInput = 'Buscar capa'; //texto de ayuda para el input
  @Input() iconSearchInputClass = 'pi pi-search'; //clase del icono de buscar
  @Input() iconSearchInputPosition: 'right' | 'left' = 'right'; //posicion del icono
  @Input() iconSearchInputVisible = true; //indica si el icono de busqueda es visible /oculto

  constructor(
    protected override mapStore: Store<MapState>,
    protected override messageService: MessageService,
    protected override layerDefinitionService: LayerDefinitionsService,
    protected override filterService: FilterContentTableService
  ) {
    super(mapStore, messageService, layerDefinitionService, filterService);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnInit(): void {
    this.isSearchingLayerList = true;
    this.getWorkAreaLayerList();
    this.searchLayersOfContentTable();
    this.addSelectedLayers();
  }
}
