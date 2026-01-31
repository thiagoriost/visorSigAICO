import { Injectable } from '@angular/core';
import { Feature } from 'ol';
import { LineString, MultiPolygon, Point, Polygon } from 'ol/geom';
import Style from 'ol/style/Style';
import Stroke from 'ol/style/Stroke';
import Fill from 'ol/style/Fill';
import CircleStyle from 'ol/style/Circle';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import { MapService } from '@app/core/services/map-service/map.service';
import { LayerLevel } from '@app/core/interfaces/enums/LayerLevel.enum';
import { Geometria } from '../../interfaces/geojsonInterface';
import {
  extend as extendExtent,
  createEmpty as createEmptyExtent,
} from 'ol/extent';

/**
 * Este servicio permite agregar geometrías al mapa, centrar el mapa en coordenadas específicas.
 * También ofrece utilidades para calcular centroides de geometrías y añadirlas como capas al mapa.
 * @author Heidy Paola Lopez Sanchez
 */

@Injectable({
  providedIn: 'root',
})
export class MapDrawService {
  constructor(private mapService: MapService) {}

  zoomToFeaturesExtent(features: Feature[]): void {
    // Paso 1: Obtener la instancia del mapa desde el servicio
    const map = this.mapService.getMap();

    // Paso 2: Verificar que el mapa exista y que el arreglo de features no esté vacío
    if (!map || features.length === 0) return;

    // Paso 3: Crear una extensión vacía (será usada para calcular el área total que ocupan las geometrías)
    const extent = createEmptyExtent();

    // Paso 4: Recorrer cada feature y extender la extensión con la geometría de cada una
    for (const feature of features) {
      const geometry = feature.getGeometry();
      if (geometry) {
        // Se amplía el extent para incluir la extensión de esta geometría
        extendExtent(extent, geometry.getExtent());
      }
    }

    // Paso 5: Ajustar la vista del mapa para que encuadre toda la extensión calculada
    map.getView().fit(extent, {
      padding: [50, 50, 50, 50], // Padding opcional para que las geometrías no queden pegadas al borde
      duration: 1000, // Duración de la animación (en milisegundos)
    });
  }
  /**
   * Crea una instancia de Feature (OpenLayers) a partir de una geometría GeoJSON
   * Solo se soportan: Point, LineString, Polygon y MultiPolygon
   * @param geometry - Geometría en formato GeoJSON
   * @param type - Tipo de la geometría (para definir su estilo)
   * @returns Feature creada, o null si el tipo de geometría no es compatible
   */

  createFeatureFromGeometry(geometry: Geometria, type: string): Feature | null {
    let feature: Feature;

    // Paso 1: Determinar el tipo de geometría y crear la feature correspondiente
    switch (geometry.type) {
      // Crea una feature con geometría de tipo Punto
      case 'Point':
        if (Array.isArray(geometry.coordinates)) {
          feature = new Feature(new Point(geometry.coordinates as number[]));
        } else {
          return null;
        }
        break;
      // Crea una feature con geometría de tipo LineString
      case 'LineString':
        feature = new Feature(
          new LineString(geometry.coordinates as number[][])
        );
        break;
      // Crea una feature con geometría de tipo Polygon
      case 'Polygon': {
        const coords = geometry.coordinates as number[][][];
        const ring = coords[0];

        const isValidRing =
          ring.length >= 4 &&
          ring[0][0] === ring[ring.length - 1][0] &&
          ring[0][1] === ring[ring.length - 1][1];

        if (isValidRing) {
          feature = new Feature(new Polygon(coords));
        } else {
          feature = new Feature(new LineString(ring));
        }
        break;
      }
      // Crea una feature con geometría de tipo multipoligono
      case 'MultiPolygon': {
        const coords = geometry.coordinates as number[][][];
        if (this.isMultiPolygonCoordinates(coords)) {
          feature = new Feature(new MultiPolygon(coords));
        } else {
          return null;
        }
        break;
      }
      // Si el tipo de geometría no es soportado, muestra una advertencia y retorna null
      default:
        console.warn(`Tipo de geometría no soportado: ${geometry.type}`);
        return null;
    }

    // Paso 2: Si el parámetro 'type' es 'geometry', se aplica un estilo personalizado
    if (type === 'geometry') {
      feature.setStyle(
        new Style({
          // Estilo para líneas o polígonos
          stroke: new Stroke({ color: 'red', width: 5 }),
          // Estilo de relleno para polígonos
          fill: new Fill({ color: 'rgba(255, 0, 0, 0.5)' }),
          // Estilo para puntos
          image: new CircleStyle({
            radius: 12,
            fill: new Fill({ color: 'red' }),
            stroke: new Stroke({ color: 'white', width: 3 }),
          }),
        })
      );
    }

    return feature;
  }

  /**
   * Crea y agrega una capa al mapa a partir de una sola geometría.
   * @param geometry - Geometría en formato GeoJSON.
   * @param layerName - Nombre identificador de la capa.
   */
  addSingleGeometryToMap(geometry: Geometria, layerId: string): void {
    // Crear la feature desde la geometría
    const feature = this.createFeatureFromGeometry(geometry, 'geometry');

    if (!feature) {
      console.warn(`No se pudo crear la feature para la capa: ${layerId}`);
      return;
    }

    const vectorSource = new VectorSource({ features: [feature] });

    const vectorLayer = new VectorLayer({
      source: vectorSource,
      properties: { id: layerId },
    });

    // Intenta agregar la capa al grupo superior
    const upperLayerGroup = this.mapService.getLayerGroupByName(
      LayerLevel.UPPER
    );
    if (upperLayerGroup) {
      upperLayerGroup.getLayers().push(vectorLayer);
    } else {
      console.warn('No se encontró el grupo de capas superiores');
    }
  }

  /**
   * Agrega un grupo de geometrías al mapa en una capa específica.
   * @param features - Arreglo de Features a agregar
   * @param layerName - Nombre identificador de la capa a crear
   */
  addGeometryGroupToMap(features: Feature[], layerId: string): void {
    const vectorSource = new VectorSource({ features });

    const vectorLayer = new VectorLayer({
      source: vectorSource,
      properties: { id: layerId },
    });

    // Intenta agregar la capa al grupo superior
    const upperLayerGroup = this.mapService.getLayerGroupByName(
      LayerLevel.UPPER
    );
    if (upperLayerGroup) {
      upperLayerGroup.getLayers().push(vectorLayer);
    } else {
      console.warn('No se encontró el grupo de capas superiores');
    }
  }

  /**
   * Verifica si las coordenadas corresponden a un MultiPolygon válido.
   * @param coords - Coordenadas a verificar
   * @returns true si las coordenadas son válidas para un MultiPolygon
   */

  isMultiPolygonCoordinates(
    coords: number[][][] | unknown
  ): coords is number[][][][] {
    // Verificamos que el primer nivel sea un arreglo (lista de polígonos)
    if (!Array.isArray(coords)) {
      return false;
    }

    for (const polygon of coords) {
      // Cada polígono debe ser un arreglo de anillos
      if (!Array.isArray(polygon)) {
        return false;
      }

      for (const ring of polygon) {
        // Cada anillo debe ser un arreglo de coordenadas [x, y]
        if (!Array.isArray(ring)) {
          return false;
        }

        for (const coord of ring) {
          // Cada coordenada debe ser un arreglo de números (al menos [x, y])
          if (
            !Array.isArray(coord) ||
            coord.length < 2 ||
            !coord.every(num => typeof num === 'number')
          ) {
            return false;
          }
        }
      }
    }

    // Si pasa todas las validaciones, se considera una estructura válida de MultiPolygon
    return true;
  }
}
