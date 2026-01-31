import { Directive } from '@angular/core';
import { MessageService } from 'primeng/api';
import { Store } from '@ngrx/store';
import { Subject, takeUntil } from 'rxjs';
import { CapaMapa } from '@app/core/interfaces/AdminGeo/CapaMapa';
import { MapState } from '@app/core/interfaces/store/map.model';
import { MapActions } from '@app/core/store/map/map.actions';
import * as mapsSelectors from '@app/core/store/map/map.selectors';
import { LayerDefinitionsService } from '@app/shared/services/layer-definitions-service/layer-definitions.service';
import { FilterContentTableService } from '@app/core/services/filter-content-table/filter-content-table.service';
import { LayerStore } from '@app/core/interfaces/store/LayerStore';

/**
 * Directiva para las funcionalidades principales del componente de tabla de contenido
 * @date 24-09-2025
 * @author Andres Fabian Simbaqueba Del Rio
 */
@Directive()
export class ContentTableDirective {
  originalLayerList: CapaMapa[] = []; //lista original para almacenar las capas
  layerList: CapaMapa[] = []; //lista de capas
  selectedLayersList: CapaMapa[] = []; //lista de capas seleccionadas
  isSearchingLayerList = false; //indica si se estan consultando capas a un servidor
  isFiltering = false; //variable para indicar si se está realizando filtrado en las capas
  disabledEraser = true; //indica si esta habilitado el boton para eliminar todas las capas
  destroy$ = new Subject<void>(); //administrador de suscripciones

  /**
   * Create a instance of componente
   * @param mapStore store del mapa
   * @param messageService servicio de mensajes
   * @param layerDefinitionService servicio para consultar las capas
   * @param filterService servicio para realizar filtrado de capas
   */
  constructor(
    protected mapStore: Store<MapState>,
    protected messageService: MessageService,
    protected layerDefinitionService: LayerDefinitionsService,
    protected filterService: FilterContentTableService
  ) {}

  /**
   * Metodo para desmarcar todas las capas activas en la tabla de contenido
   */
  deleteAllLayers(): void {
    const layersToDelete = this.selectedLayersList;
    for (const layer of layersToDelete) {
      if (layer.origin === 'internal' || layer.origin === undefined) {
        this.setLayerCheckedById(this.layerList, layer.id, false);
        this.mapStore.dispatch(
          MapActions.deleteLayerOfMap({
            layer: layer,
          })
        );
      }
    }
    this.selectedLayersList = [];
  }

  /**
   * Metodo que ajusta el valor del campo checked a una capa asociada a un ID
   * @param layerList lista de capas
   * @param idLayer  id de la capa
   * @param checked valor de la variable checked
   * @returns true si la capa se encuentra, false si no está
   */
  setLayerCheckedById(
    layerList: CapaMapa[],
    idLayer: string,
    checked: boolean
  ): void {
    for (let i = 0; i < layerList.length; i++) {
      const layer = layerList[i];
      if (layer.id === idLayer) {
        layerList[i] = { ...layer, checked };
      }
      if (layer.Result && layer.Result.length > 0) {
        this.setLayerCheckedById(layer.Result, idLayer, checked);
      }
    }
  }

  /**
   * Metodo para marcar los nodos seleccionados
   * @param tree lista de capas
   */
  markSelectedNodes(tree: CapaMapa[]): void {
    for (const nodo of tree) {
      if (this.selectedLayersList.find(sel => sel.id === nodo.id)) {
        nodo.checked = true;
        nodo.isActivated = true;
      } else {
        nodo.checked = false;
        nodo.isActivated = false;
      }
      if (nodo.Result && nodo.Result.length > 0) {
        this.markSelectedNodes(nodo.Result);
      } else {
        nodo.Result = [];
      }
    }
  }

  /**
   * Metodo que ajusta el valor del atributo ckecked cuando se cargan las capas
   * @param layerList lista de capas
   * @returns retorna la lista de capas con el valor de checked = false
   */
  setLayerListChecked(layerList: CapaMapa[]): CapaMapa[] {
    if (layerList && layerList.length > 0) {
      layerList.forEach(layer => {
        layer.checked = false;
        if (layer.Result && layer.Result.length > 0) {
          this.setLayerListChecked(layer.Result);
        }
      });
    }
    return layerList;
  }

  /**
   * Metodo para consultar las capas que se mostraran en la tabla de contenido
   */
  searchLayersOfContentTable(): void {
    this.mapStore
      .select(mapsSelectors.selectLayerListContentTable)
      .subscribe(layers => {
        if (layers.length !== 0) {
          this.originalLayerList = [...layers];
          this.layerList = layers;
          this.isSearchingLayerList = false;
        } else {
          this.isSearchingLayerList = true;
        }
      });
  }

  /**
   * Metodo que se ejecuta cuando se ingresa texto en el campo de busqueda para filtrar capas
   * @param text texto a consultar
   */
  onSearchInput(text: string): void {
    if (text === '') {
      // Restaurar lista original
      const restoredList = JSON.parse(JSON.stringify(this.originalLayerList));
      // Marcar capas seleccionadas y reactivarlas en el mapa
      if (this.selectedLayersList && this.selectedLayersList.length > 0) {
        this.markSelectedNodes(restoredList);
        //this.activateSelectedLayersOnMap();
      }
      this.layerList = restoredList;
      this.isFiltering = false;
      return;
    } else {
      // Aplicar filtro sobre copia profunda
      const copyOfCapaMapaList = JSON.parse(
        JSON.stringify(this.originalLayerList)
      );
      const filteredNodes = this.filterService.filterNodesLineal(
        text,
        copyOfCapaMapaList
      );
      // Marca como seleccionadas las que ya estaban seleccionadas en el árbol original
      if (filteredNodes.Result && filteredNodes.Result.length > 0) {
        this.markSelectedNodes(filteredNodes.Result);
      }
      this.layerList = [filteredNodes];
      this.isFiltering = true;
    }
  }

  /**
   * Metodo para consultar las capas cargadas al área de trabjo del store
   */
  getWorkAreaLayerList(): void {
    this.mapStore
      .select(mapsSelectors.selectWorkAreaLayerList)
      .pipe(takeUntil(this.destroy$))
      .subscribe(layers => {
        this.disabledEraser = layers.length === 0;
        this.selectedLayersList =
          this.filterService.convertFromLayerStoreListToCapaMapaList(layers);
      });
  }

  /**
   * Metodo que consulta las capas cargadas al area de trabajo y las busca en la lista de capas para
   * la tabla de contenido, si existe coincidencias, le asigna el valor de la transparencia y el estado de activacion
   * Lo hace de manera recursiva con todas las capas
   */

  addSelectedLayers() {
    this.mapStore
      .select(mapsSelectors.selectWorkAreaLayerList)
      .pipe(takeUntil(this.destroy$))
      .subscribe(layers => {
        // Función recursiva para aplicar los cambios a la capa y sus hijas
        const updateLayer = (layer: CapaMapa, workLayers: LayerStore[]) => {
          const match = workLayers.find(
            workLayer => workLayer.layerDefinition.id === layer.id
          );
          const updatedLayer = {
            ...layer,
            isActivated: !!match,
            transparencyValue: match
              ? match.transparencyLevel !== 0
                ? 100 - match.transparencyLevel
                : 0
              : layer.transparencyValue,
          };
          // Si tiene subcapas, procesarlas recursivamente
          if (Array.isArray(layer.Result) && layer.Result.length > 0) {
            updatedLayer.Result = layer.Result.map(childLayer =>
              updateLayer(childLayer, workLayers)
            );
          }
          return updatedLayer;
        };
        // Actualizar toda la lista de capas renderizadas (y sus hijas)
        this.layerList = this.layerList.map(layer =>
          updateLayer(layer, layers)
        );
      });
  }
}
