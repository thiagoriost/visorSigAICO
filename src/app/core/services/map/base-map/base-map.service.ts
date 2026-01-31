import { Injectable } from '@angular/core';
// ==== SERVICES ====
import { MapService } from '../../map-service/map.service';
// ==== UTILS ====
import { LayerFactory } from '@app/core/utils/layer-factory';
// ==== ENUMS ====
import { LayerLevel } from '@app/core/interfaces/enums/LayerLevel.enum';
import BaseLayer from 'ol/layer/Base';

/**
 * Servicio que se encarga de la gestión de mapas base
 * @author Juan Carlos Valderrama Gonzalez
 *
 * TODO: Mover a widget correspondiente
 */
@Injectable({
  providedIn: 'root',
})
export class BaseMapService {
  constructor(private mapService: MapService) {}

  /**
   * Cambiar Mapa base
   * TODO: Implementar con un parametro de entrada que es una definición de la capa y logica acorde
   */
  changeBaseLayer() {
    // 1. Obtener el grupo de capas base
    const baseLayerGroup = this.mapService.getLayerGroupByName(LayerLevel.BASE);
    if (baseLayerGroup) {
      // 2. Obtener la capa actual por nombre/name
      const currentBaseLayer: BaseLayer | undefined = baseLayerGroup
        .getLayers()
        .getArray()
        .find(layer => layer.getProperties()['name'] === 'OpenStreetMap');
      if (currentBaseLayer) {
        // 3. Apartir de la definición de la capa base, crear la nueva capa base
        const newLayer = LayerFactory.createLayerFromDefinition({
          id: '1',
          leaf: true,
          titulo: 'TopoArcGIS',
          nombre: 'TopoArcGIS',
          url: 'https://server.arcgisonline.com/arcgis/rest/services/World_Topo_Map/MapServer',
        });
        // 4. Agregar la nueva capa base al grupo de capas base
        if (newLayer) {
          baseLayerGroup.getLayers().push(newLayer);
        }
        // 5. Eliminar la capa actual del grupo de capas base
        baseLayerGroup.getLayers().remove(currentBaseLayer);
      }
    }
  }
}
