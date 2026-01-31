import { Directive } from '@angular/core';
import { CapaMapa } from '../interfaces/AdminGeo/CapaMapa';
import { MapService } from '../services/map-service/map.service';
import { Store } from '@ngrx/store';
import { MapState } from '../interfaces/store/map.model';
import { MapActions } from '../store/map/map.actions';
import { LayerLevel } from '../interfaces/enums/LayerLevel.enum';

/**
 * Directiva base para el servicio de gestion de capas de la tabla de contenido
 * Contiene el metodo para agregar capas sin repetir IDS y validar las capas que deben cargarse al iniciar la aplicacion
 * @date 2025-12-09
 * @author Andres Fabian Simbaqueba
 */
@Directive()
export class LayerContentTableManagerDirective {
  /**
   *
   * @param mapService servicio de mapa
   * @param store store del mapa
   */
  constructor(
    protected mapService: MapService,
    protected store: Store<MapState>
  ) {}

  /**
   * Valida las capas que deben ser activadas en el mapa al iniciar la aplicacion
   * @param layerList Lista de capas a verificar
   */
  checkActivatedLayerOnInit(layerList: CapaMapa[]) {
    const maxAttempts = 5;
    let attempts = 0;
    if (!this.mapService.map) {
      console.warn('Map is not initialized yet');
      setTimeout(() => {
        attempts++;
        if (attempts < maxAttempts) {
          this.checkActivatedLayerOnInit(layerList);
        } else {
          console.error('Max attempts reached. Map is still not initialized.');
        }
      }, 1000);
      return;
    }
    if (layerList && layerList.length > 0) {
      layerList.forEach(layer => {
        if (layer.Result && layer.Result.length > 0) {
          this.checkActivatedLayerOnInit(layer.Result);
        }
        if (layer.leaf && layer.checked === true) {
          this.store.dispatch(
            MapActions.addLayerToMap({
              layer: {
                isVisible: true,
                layerDefinition: layer,
                layerLevel: LayerLevel.INTERMEDIATE,
                orderInMap: 0,
                transparencyLevel: 0,
              },
            })
          );
        }
      });
    }
  }

  /**
   * Metodo para agregar capas sin repetir objetos que tengan el mismo ID
   * @param layerList lista de capas a ser agregadas
   * @param existingLayerList  lista de capas exixtente o donde se van a agregar las capas unicas
   */
  addLayerWithUniqueID(
    layerList: CapaMapa[] | CapaMapa,
    existingLayerList: CapaMapa[]
  ): CapaMapa[] {
    const newLayerList = Array.isArray(layerList) ? layerList : [layerList];
    for (const nuevaCapa of newLayerList) {
      const exist = existingLayerList.some(c => c.id === nuevaCapa.id);
      if (!exist) {
        const layerCopy: CapaMapa = { ...nuevaCapa };
        if (nuevaCapa.Result && Array.isArray(nuevaCapa.Result)) {
          layerCopy.Result = [];
          this.addLayerWithUniqueID(nuevaCapa.Result, layerCopy.Result);
        }
        existingLayerList.push(layerCopy);
      }
    }
    return existingLayerList;
  }
}
