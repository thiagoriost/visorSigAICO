import { Injectable } from '@angular/core';
// ==== OPENLAYERS ====
import Map from 'ol/Map.js';
import TileLayer from 'ol/layer/Tile.js';
import View from 'ol/View.js';
import GroupLayer from 'ol/layer/Group.js';
import { defaults as defaultControls } from 'ol/control';
// ==== ENUMS ====
import { LayerLevel } from '@app/core/interfaces/enums/LayerLevel.enum';
import LayerGroup from 'ol/layer/Group.js';
import { CapaMapa } from '@app/core/interfaces/AdminGeo/CapaMapa';
import { LayerFactory } from '@app/core/utils/layer-factory';
import BaseLayer from 'ol/layer/Base';
import { MapasBase } from '@app/core/interfaces/enums/MapasBase.enum';
import { MapaBaseService } from '@app/shared/services/mapa-base/mapa-base.service';

/**
 *  Servicio basico que provee acceso a mapa y metodos basicos generales de conversion, estilos, etc.
 *
 * @author Juan Carlos Valderrama Gonzalez
 */

@Injectable({
  providedIn: 'root',
})
export class MapService {
  map: Map | null = null;
  constructor(private mapaBaseService: MapaBaseService) {}

  /**
   * Create map only if it doesn't exist
   * @param {array} center - latitude and longitude
   * @param {number} zoom - zoom level
   * @param {string} projection - projection of coordinates
   * @param {string} target - target div id
   * @returns {void}
   */
  createMap(
    center: number[],
    zoom: number,
    projection: string,
    target: string,
    layerBase: MapasBase
  ): void {
    if (!this.map) {
      // Crear grupos de capas
      // === CAPAS BASE ===
      const newLayerBase = this.mapaBaseService.getLayerByName(layerBase);
      const layersbase = [newLayerBase as TileLayer];
      const capasBase = new GroupLayer({
        layers: layersbase,
        properties: {
          name: LayerLevel.BASE,
        },
      });
      // === CAPAS INTERMEDIAS ===
      const capasIntermedias = new GroupLayer({
        layers: [],
        properties: {
          name: LayerLevel.INTERMEDIATE,
        },
      });
      // === CAPAS SUPERIORES ===
      const capasSuperiores = new GroupLayer({
        layers: [],
        properties: {
          name: LayerLevel.UPPER,
        },
      });
      this.map = new Map({
        target: target,
        layers: [capasBase, capasIntermedias, capasSuperiores],
        view: new View({
          projection: projection,
          center: center,
          zoom: zoom,
        }),
        controls: defaultControls({ zoom: false }), // Desactivar el control de zoom
      });
    }
  }

  // Método para obtener el mapa
  getMap(): Map | null {
    return this.map;
  }

  /**
   * Obtiene el grupo de capas por nombre
   * @param {string} name - nombre del grupo de capas
   */
  getLayerGroupByName(name: LayerLevel): LayerGroup | null {
    if (this.map) {
      const layers = this.map.getLayers();
      const layerGroup = layers
        .getArray()
        .find(layer => layer.getProperties()['name'] === name);
      if (layerGroup) {
        return layerGroup as LayerGroup;
      }
    }
    return null;
  }

  /**
   * Agregar una capa al mapa
   * @param layerDefinition definicion de la capa
   * @param layerLevel nivel del grupo de capas a la que se debe agregar
   */
  addLayer(layerDefinition: CapaMapa, layerLevel: LayerLevel) {
    //1. construir la capa
    const layer = LayerFactory.createLayerFromDefinition(layerDefinition);
    if (layer) {
      //2. validar el grupo a traves del nivel
      const layerGroup = this.getLayerGroupByName(layerLevel);
      if (layerGroup) {
        //si la capa ya está no se debe agregar
        if (this.getLayerByDefinition(layerDefinition, layerLevel)) {
          console.error('La capa ya se encuentra en el mapa');
        } else {
          //3. agregar la capa al grupo
          layerGroup.getLayers().push(layer);
        }
      }
    }
  }

  /**
   * Eliminar la capa del mapa
   * @param layerDefinition capa a eliminar
   * @param layerLevel nivel del grupo de capa donde se debe buscar la capa a eliminar
   */
  removeLayer(layerDefinition: CapaMapa, layerLevel: LayerLevel) {
    //1. buscar el grupo de capas en donde hay que eliminar
    const layerGroup = this.getLayerGroupByName(layerLevel);
    if (layerGroup) {
      //2. buscar la capa en el grupo
      const layer = this.getLayerByDefinition(layerDefinition, layerLevel);
      if (layer) {
        //3. eliminar la capa del grupo
        layerGroup.getLayers().remove(layer);
        this.map?.removeLayer(layer); //eliminar la capa del mapa
      } else {
        console.error('La capa a eliminar no existe');
      }
    }
  }

  showOrHideLayer(
    layerDefinition: CapaMapa,
    layerLevel: LayerLevel,
    isVisible: boolean
  ) {
    //1. buscar el grupo de capas en donde hay que ocultar la capa
    const layerGroup = this.getLayerGroupByName(layerLevel);
    if (layerGroup) {
      //2. buscar la capa en el grupo
      const layer = this.getLayerByDefinition(layerDefinition, layerLevel);
      if (layer) {
        layer.setVisible(isVisible);
      } else {
        console.error('La capa a mostrar/ ocultar no existe');
      }
    }
  }

  /**
   * Generar transparencia a la capa
   * @param layerDefinition capa
   * @param layerLevel nivel en que está la capa
   * @param levelTransparency nivel de transparencia
   */
  generateTransparency(
    layerDefinition: CapaMapa,
    layerLevel: LayerLevel,
    levelTransparency: number
  ) {
    //1. buscar el grupo de capas en donde hay que ocultar la capa
    const layerGroup = this.getLayerGroupByName(layerLevel);
    if (layerGroup) {
      //2. buscar la capa en el grupo
      const layer = this.getLayerByDefinition(layerDefinition, layerLevel);
      //3. si existe lacapa se ajusta la transparencia
      if (layer) {
        layer.setOpacity(levelTransparency / 100); //nivel de transparencia en decimal
      }
    }
  }

  identify(layerDefinition: CapaMapa, layerLevel: LayerLevel) {
    //se muestra la capa
    this.showOrHideLayer(layerDefinition, layerLevel, true);
    //se busca la capa
    const layerGroup = this.getLayerGroupByName(layerLevel);
    if (layerGroup) {
      //2. buscar la capa en el grupo
      const layer = this.getLayerByDefinition(layerDefinition, layerLevel);
      if (layer) {
        console.log(layer);
      }
    }
  }

  /**
   * Obtiene la capa del mapa asociada a una definicion de capa
   * @param layerDefinition definicion de la capa a buscar
   * @param layerLevel nivel del grupo de la capa
   * @returns baselayer si fue encontrada o null sino se encuentra
   */
  getLayerByDefinition(
    layerDefinition: CapaMapa,
    layerLevel: LayerLevel
  ): BaseLayer | null {
    //1. buscar el grupo de capas en donde hay que buscar
    const layerGroup = this.getLayerGroupByName(layerLevel);
    if (layerGroup) {
      //2. buscar la capa en el grupo
      const layer = layerGroup
        .getLayers()
        .getArray()
        .find(l => l.getProperties()['id'] === layerDefinition.id);
      if (layer) {
        return layer;
      }
    }
    return null;
  }
}
