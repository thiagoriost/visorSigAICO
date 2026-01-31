import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { CapaMapa } from '@app/core/interfaces/AdminGeo/CapaMapa';
import { LayerLevel } from '@app/core/interfaces/enums/LayerLevel.enum';
import { LayerStore } from '@app/core/interfaces/store/LayerStore';
import { MapState } from '@app/core/interfaces/store/map.model';
import { MapActions } from '@app/core/store/map/map.actions';

/**
 * Servicio que interactua con el mapa para las diferentes opcione de la capa
 * @date 15-09-2025
 * @author Andres Fabian Simbaqueba Del Rio
 */
@Injectable()
export class LayerOptionService {
  /**
   * Creates an instance of LayerOptionService.
   * @param {Store<MapState>} mapStore store del mapa
   */
  constructor(private mapStore: Store<MapState>) {}

  /**
   * agregar la capa al mapa
   * @param layer definicion de la capa
   */
  addLayer(layer: CapaMapa) {
    const layerStore: LayerStore = {
      isVisible: true,
      layerDefinition: layer,
      layerLevel: LayerLevel.INTERMEDIATE,
      orderInMap: 0,
      transparencyLevel: 0,
    };
    this.mapStore.dispatch(MapActions.addLayerToMap({ layer: layerStore }));
  }

  /**
   * Eliminar la capa del mapa
   * @param layer definicion de la capa
   */
  deleteLayer(layer: CapaMapa) {
    this.mapStore.dispatch(MapActions.deleteLayerOfMap({ layer }));
  }

  /**
   * Prender la capa (muestra en el mapa)
   * @param layer definicion de la capa
   */
  turnOnLayer(layer: CapaMapa) {
    this.mapStore.dispatch(MapActions.showOrHideLayerOfMap({ layer }));
  }

  /**
   * Apagar la capa (quita la visibilidad)
   * @param layer definicion de la capa
   */
  turnOffLayer(layer: CapaMapa) {
    this.mapStore.dispatch(MapActions.showOrHideLayerOfMap({ layer }));
  }

  /**
   * Ajustar transparencia de la capa
   * @param layer definicion de la capa
   * @param transparencyLevel valor del nivel de transparencia
   */
  setTransparencyOfLayer(layer: CapaMapa, transparencyLevel: number) {
    this.mapStore.dispatch(
      MapActions.setLayerTransparency({
        layer: layer,
        transparencyLevel: transparencyLevel,
      })
    );
  }

  /**
   * Mostrar metadatos
   * @param layer defincion de la capa
   *
   */
  showMetadata(layer: CapaMapa) {
    if (layer.urlMetadato) {
      window.open(layer.urlMetadato, 'blank');
    } else {
      console.warn('La capa: ', layer.titulo, ' no contiene URL de metadatos');
    }
  }
}
