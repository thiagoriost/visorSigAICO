import { Injectable } from '@angular/core';
import { LayerStore } from '@app/core/interfaces/store/LayerStore';
import { MapState } from '@app/core/interfaces/store/map.model';
import { selectWorkAreaLayerList } from '@app/core/store/map/map.selectors';
import { Store } from '@ngrx/store';
import { MapService } from '../map-service/map.service';
import { LayerLevel } from '@app/core/interfaces/enums/LayerLevel.enum';
import { Collection } from 'ol';
/**
 * Servicio que se encarga de interactuar con el mapa para crear
 * las capas openlayers que se encuentran en el area de trabajo
 * del store de redux
 * Se integra desde el inicio de la aplicacion
 * @date 16-04-2025
 * @author Andres Fabian Simbaqueba Del Rio
 */
@Injectable({
  providedIn: 'root',
})
export class MapLayerManagerService {
  layerList: LayerStore[] = []; // lista de capas del area de trabajo
  layersInMap: LayerStore[] = []; //lista de capas que están en el mapa

  /**
   *
   * @param store Store de redux
   * @param mapService //servicio para el manejo del mapa y las capas
   */
  constructor(
    private store: Store<MapState>,
    private mapService: MapService
  ) {
    console.log('MapLayerManagerService initialized');
    /**
     * Suscribirse a los cambios de la lista de capas del area de trabajo
     */
    this.store.select(selectWorkAreaLayerList).subscribe(layerList => {
      this.layerList = layerList;
      const existingLayers: LayerStore[] = [];
      const newLayers: LayerStore[] = [];
      //validar que la lista de capas exista
      if (!this.layerList) return;
      //iterar sobre cada elemento de la lista
      this.layerList.map(layer => {
        const existing = this.layersInMap.find(
          layerInMap =>
            layerInMap.layerDefinition.id === layer.layerDefinition.id
        );
        //si la capa no existe se agrega a la lista de nuevas capas
        if (!existing) {
          newLayers.push(layer);
        } else {
          //se agrega a la lista de capas existentes
          existingLayers.push(layer);
        }
      });
      /**
       * Obtenemos las capas que están en el mapa pero que ya no están en el área de trabajo
       * Estas capas son las que se deben eliminar ya sea porque se eliminaron del area de trabajo
       * o se desseleccionaron de la tabla de contenido
       */
      const layersToDelete = this.layersInMap.filter(item => {
        return !this.layerList.find(
          layer => layer.layerDefinition.id === item.layerDefinition.id
        );
      });
      /**
       * Si la lista de capas a eliminar existe y tiene capas se itera y se llama al método
       * que elimina la capa del mapa
       */
      if (layersToDelete && layersToDelete.length > 0) {
        layersToDelete.forEach(layer => {
          this.removeLayer(layer);
        });
        // se ajusta la lista de capas del mapa para que sea la lista del área de trabajo
        this.layersInMap = this.layerList;
      }
      /**
       * Como el enfoque es que las capas nuevas se agregan encima de las existentes
       * se debe procesar primero las capas que ya están en el mapa
       */

      //se valida si existen capas que ya están en el mapa y se procesas
      if (existingLayers && existingLayers.length > 0) {
        this.processExistingLayers(existingLayers);
      }
      //luego se valida si hay capas nuevas y se agregan
      if (newLayers && newLayers.length > 0) {
        this.addNewLayers(newLayers);
      }
    });
  }

  /**
   * Metodo para agregar las nuevas capas al mapa
   * @param newLayerStore lista de capas a ser agregadas
   */
  addNewLayers(newLayerStore: LayerStore[]): void {
    newLayerStore.forEach(layer => {
      this.mapService.addLayer(layer.layerDefinition, layer.layerLevel); // Se agrega la capa al mapa
      this.layersInMap.unshift(layer); // se agrega la capa a la lista de capas que están en e l mapa
    });
  }

  /**
   * Metodo para procesar la lista de capas existentes en el mapa
   * @param existingLayer lista de capas existentes en el store
   * @returns
   */
  processExistingLayers(existingLayer: LayerStore[]): void {
    //1. Obtener el grupo de capas intermedias del mapa
    const intermediateLayerGroup = this.mapService.getLayerGroupByName(
      LayerLevel.INTERMEDIATE
    );
    //2. Si no existe el grupo de capas, salimos de la ejecución
    if (!intermediateLayerGroup) return;

    //3. Obtener el array de capas del grupo de capas intermedio
    const arrayLayers = intermediateLayerGroup.getLayersArray();
    //4. Si no existe, salimos de la ejecución
    if (!arrayLayers) return;
    //5. iterar sobre la lista de capas existentes
    existingLayer.forEach(layer => {
      // 1. Obtener el índice en el grupo de capas OpenLayer de la capa actual
      const openLayerIndexOfLayer = arrayLayers.findIndex(
        l => l.getProperties()['id'] === layer.layerDefinition.id
      );
      // 2. Obtener el índice de la capa en la lista que está en el mapa
      const layerList = [...this.layerList].reverse();
      const indexOfLayerInListOfMap = layerList.findIndex(
        l => l.layerDefinition.id === layer.layerDefinition.id
      );
      //3. Validar si la capa está en diferente orden que la lista de capas del mapa
      if (openLayerIndexOfLayer !== indexOfLayerInListOfMap) {
        // Obtenemos la capa de OpenLayer que cambió
        const oplayer = arrayLayers.at(openLayerIndexOfLayer);
        // Creamos un arreglo temporal de las capas del mapa
        const olTempList = [...arrayLayers];
        // Eliminar de su posición actual
        olTempList.splice(openLayerIndexOfLayer, 1);
        // Validamos que la capa de OpenLayer exista y movemos la capa a esa posición
        if (oplayer) olTempList.splice(indexOfLayerInListOfMap, 0, oplayer); // Insertar en la nueva posición
        // Crear la colección ordenada
        const layersCollection = new Collection(olTempList);
        // Establecer las capas en el grupo
        intermediateLayerGroup.setLayers(layersCollection);
      } else {
        // La capa está en el mismo orden se verifica y se ajustan los valores de transparencia, visibilidad
        if (layer.transparencyLevel > 0) {
          this.mapService.generateTransparency(
            layer.layerDefinition,
            layer.layerLevel,
            layer.transparencyLevel
          );
        }
        if (layer.isVisible) {
          this.mapService.showOrHideLayer(
            layer.layerDefinition,
            layer.layerLevel,
            true
          );
        } else {
          this.mapService.showOrHideLayer(
            layer.layerDefinition,
            layer.layerLevel,
            false
          );
        }
      }
    });
  }

  /**
   * Metodo para remover la capa del mapa
   * @param layerStore
   */
  removeLayer(layerStore: LayerStore): void {
    /**
     * Se busca que la capa esté en la lista de capas del mapa
     */
    const layer = this.layersInMap.find(
      layer => layer.layerDefinition.id === layerStore.layerDefinition.id
    );
    if (layer) {
      /**
       * Se llama el método del servicio de mapa para eliminar la capa
       */
      this.mapService.removeLayer(layer.layerDefinition, layer.layerLevel);
    }
  }
}
