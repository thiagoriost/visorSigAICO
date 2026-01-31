// ==== ANGULAR CORE ====
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';

// ==== SERVICES ====
import { MapService } from '@app/core/services/map-service/map.service';
import { MapaBaseService } from '@app/shared/services/mapa-base/mapa-base.service';

// ==== INTERFACES ====
import { CapaMapaBase } from '@app/core/interfaces/CapaMapaBase';
import { LayerLevel } from '@app/core/interfaces/enums/LayerLevel.enum';
import { MapaBaseInterface } from '@app/shared/Interfaces/mapa-base/mapa-base-interface';

// ==== THIRD PARTY LIBRARY ====
import BaseLayer from 'ol/layer/Base';
import TileLayer from 'ol/layer/Tile';
import TileArcGISRest from 'ol/source/TileArcGISRest';
import XYZ from 'ol/source/XYZ';

// ==== STORE ====
import { MapActions } from '@app/core/store/map/map.actions';

/**
 * Servicio encargado de gestionar el cambio y configuración de los mapas base.
 * Detecta automáticamente si la fuente es tipo ArcGIS REST o XYZ
 * y crea la capa adecuada en OpenLayers.
 *
 * @author
 * Juan Carlos Valderrama González
 */
@Injectable({
  providedIn: 'root',
})
export class BaseMapService {
  constructor(
    private mapService: MapService,
    private mapStore: Store,
    private servicebase: MapaBaseService
  ) {}
  /**
   * Cambia la capa base del mapa principal y la actualiza en el store (NgRx).
   * Detecta automáticamente el tipo de fuente (ArcGIS REST o XYZ) para construir la capa.
   * @param mapa Mapa base a establecer.
   */
  changeBaseLayer(mapa: CapaMapaBase): void {
    // === Validar URL ===
    if (!mapa.url) {
      console.error(
        `[BaseMapService] La capa base "${mapa.titulo}" no tiene una URL válida.`
      );
      return;
    }

    // ===  Detectar tipo de fuente ===
    const isArcGISRest = mapa.url.includes('/MapServer');
    const source = isArcGISRest
      ? new TileArcGISRest({ url: mapa.url })
      : new XYZ({ url: mapa.url });

    // ===  Crear la capa base ===
    const newLayer: BaseLayer = new TileLayer({ source });

    // === Reemplazar la capa base actual ===
    const baseLayerGroup = this.mapService.getLayerGroupByName(LayerLevel.BASE);
    if (baseLayerGroup) {
      const currentBaseLayer = baseLayerGroup.getLayers().item(0);

      baseLayerGroup.getLayers().push(newLayer); // Agrega el nuevo mapa base
      if (currentBaseLayer) {
        baseLayerGroup.getLayers().remove(currentBaseLayer); // Elimina el anterior
      }

      // === Actualizar el store ===
      this.mapStore.dispatch(MapActions.updateBaseMapCapa({ layer: mapa }));

      console.log('[BaseMapService] Mapa base activo:', mapa);
    } else {
      console.warn('[BaseMapService] No se encontró el grupo de capas BASE.');
    }
  }
  /**
   * Convierte una lista de MapaBaseInterface en CapaMapaBase[]
   */
  mapListToCapaMapaBase(list: MapaBaseInterface[]): CapaMapaBase[] {
    return list.map(m => this.mapToCapaMapaBase(m));
  }

  /**
   * Convierte un objeto `MapaBaseInterface` en un objeto `CapaMapaBase`.
   * Normaliza las URLs de servicios ArcGIS REST y mantiene intactas las XYZ.
   *
   * @param mapa Objeto de tipo MapaBaseInterface.
   * @returns Objeto convertido de tipo CapaMapaBase.
   */
  mapToCapaMapaBase(mapa: MapaBaseInterface): CapaMapaBase {
    // Buscar la configuración del mapa base (por nombre)
    const cfg = this.servicebase
      .getMapBases()
      .find((c: MapaBaseInterface) => c.name === mapa.name);

    const src = cfg?.layer?.getSource();
    let url = '';

    // === Detectar tipo de fuente y obtener la URL  ===
    if (src instanceof XYZ) {
      const urls = src.getUrls?.();
      url = urls && urls.length > 0 ? urls[0] : '';
    } else if (src instanceof TileArcGISRest) {
      const urls = src.getUrls?.();
      url = urls && urls.length > 0 ? urls[0] : '';
    }

    if (!url) {
      console.warn(`[BaseMapService] No se encontró URL para ${mapa.name}`);
    }

    // === Normalizar URL para servicios ArcGIS REST ===
    if (url.includes('/MapServer')) {
      // Si contiene /tile/{z}/{y}/{x}, la recorta hasta /MapServer
      url = url.split('/MapServer')[0] + '/MapServer';
    }

    // === Crear el objeto compatible con CapaMapaBase ===
    return {
      id: mapa.name,
      titulo: mapa.title,
      leaf: true,
      thumbnail: `assets/images/mapas-base/${mapa.name}.jpg`,
      url,
    };
  }
}
