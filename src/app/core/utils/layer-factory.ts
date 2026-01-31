import TileLayer from 'ol/layer/Tile';
import TileWMS from 'ol/source/TileWMS';
import TileArcGISRest from 'ol/source/TileArcGISRest';
import { CapaMapa } from '../interfaces/AdminGeo/CapaMapa';
import BaseLayer from 'ol/layer/Base';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';

/**
 * Clase que se encarga de crear capas para adicionar al mapa
 */
export class LayerFactory {
  /**
   * Crear una capa de tipo Rest
   * @param layerDefinition definicion de la capa
   * @returns capa creada
   */
  static createLayerRest(layerDefinition: CapaMapa): BaseLayer | null {
    return new TileLayer({
      source: new TileArcGISRest({
        url: layerDefinition.url,
      }),
      properties: {
        ...layerDefinition,
      },
    });
  }

  /**
   * Crear una capa de tipo WMS
   * @param layerDefinition definicion de la capa
   * @returns capa creada
   */
  static createWMSLayer(layerDefinition: CapaMapa): BaseLayer | null {
    const wmsParams = {
      LAYERS: layerDefinition.nombre,
      FORMAT: 'image/png',
    };
    return new TileLayer({
      source: new TileWMS({
        url: layerDefinition.url || '',
        params: wmsParams,
      }),
      properties: { ...layerDefinition },
    });
  }

  /**
   * Crea una capa OpenLayers a partir de una definición
   * @param layerDefinition Objeto que describe la capa, incluyendo el tipo y parámetros.
   * @returns La capa de OpenLayers correspondiente a la definición.
   * @author Heidy Paola Lopez Sanchez
   */
  static createLayerFromDefinition(
    layerDefinition: CapaMapa
  ): BaseLayer | null {
    let layer: BaseLayer | null = null;
    switch (layerDefinition.tipoServicio) {
      case 'WMS': {
        layer = this.createWMSLayer(layerDefinition);
        break;
      }
      case 'REST': {
        layer = this.createLayerRest(layerDefinition);
        break;
      }
      default:
        console.error(
          'Tipo de capa no soportado:',
          layerDefinition.tipoServicio
        );
        break;
    }
    return layer;
  }
  /**
   * Crear una capa teniendo en cuenta su definición
   * @param capa definicion de la capa a crear
   * @returns capa creada a partir de la definicion
   */

  static inspectLayer(layer: BaseLayer): CapaMapa {
    let layerType = 'Desconocido';
    let url = ''; // Inicializamos url como string vacío
    let tipoServicio: 'WMS' | 'REST' | undefined = undefined;
    let wfs = false;

    if (layer instanceof TileLayer) {
      const source = layer.getSource();
      if (source instanceof TileWMS) {
        layerType = 'WMS';
        const urls = source.getUrls();
        // Verificamos si 'urls' no es null y tiene elementos
        url = urls && urls.length > 0 ? urls[0] : ''; // Asignamos la primera URL si existe
        tipoServicio = 'WMS';
      } else if (source instanceof TileArcGISRest) {
        layerType = 'ArcGIS';
        const urls = source.getUrls();
        // Verificamos si 'urls' no es null y tiene elementos
        url = urls && urls.length > 0 ? urls[0] : ''; // Asignamos la primera URL si existe
        tipoServicio = 'REST';
      }
    } else if (layer instanceof VectorLayer) {
      const source = layer.getSource();
      if (source instanceof VectorSource) {
        layerType = 'WFS';
        const urlFromSource = source.getUrl();
        // Verificamos si el valor es una cadena y lo asignamos a 'url'
        if (typeof urlFromSource === 'string') {
          url = urlFromSource;
        } else {
          url = ''; // Si es una función, asignamos cadena vacía
        }
        wfs = true;
      }
    }

    return {
      id: 'unique_layer_id',
      titulo: 'Titulo de la capa',
      leaf: true,
      tipoServicio: tipoServicio,
      wfs: wfs,
      url: url, // Siempre será un string, ya sea vacío o la URL válida
      descripcionServicio: layerType,
    };
  }
}
