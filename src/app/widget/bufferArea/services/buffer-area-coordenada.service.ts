/**
 * Servicio para generar áreas de influencia (buffers) a partir de coordenadas geográficas.
 *
 * Este servicio permite al usuario generar un buffer sobre el mapa a partir de una coordenada ingresada manualmente,
 * en formato decimal, sexagesimal o proyectado.
 *
 * Utiliza un servicio remoto que recibe geometrías en formato GeoJSON para realizar la operación de buffer,
 * y luego renderiza la geometría resultante como una capa vectorial sobre el mapa principal.
 *
 * @author Carlos Alberto Aristizabal
 * @date 28-07-2025
 * @version 1.1.0
 */

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Map as OlMap } from 'ol';
import { MapService } from '@app/core/services/map-service/map.service';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import Draw from 'ol/interaction/Draw';
import { GeoJSON } from 'ol/format';
import { LayerLevel } from '@app/core/interfaces/enums/LayerLevel.enum';
import { FeatureCollection, Feature } from 'geojson';
import { Style, Stroke, Fill } from 'ol/style';
import { Store } from '@ngrx/store';
import { BufferAreaService } from '@app/widget/bufferArea/services/buffer-area.service';

export interface CoordenadaGeografica {
  id: string;
  latitud: number;
  longitud: number;
  tipoGrado: 'decimal' | 'sexagecimal' | 'plana';
}

interface GeometriaGeoJSON {
  type: 'Point';
  coordinates: [number, number];
}

@Injectable({
  providedIn: 'root',
})
export class BufferAreaCoordenadaService {
  public drawInteraction: Draw | null = null;
  public vectorSource = new VectorSource();
  public vectorLayer: VectorLayer;

  constructor(
    private http: HttpClient,
    public mapService: MapService,
    private store: Store,
    private bufferService: BufferAreaService
  ) {
    this.vectorLayer = new VectorLayer({
      source: this.vectorSource,
      style: new Style({
        stroke: new Stroke({ color: '#ff0000', width: 2 }),
        fill: new Fill({ color: 'rgba(255, 0, 0, 0.2)' }),
      }),
    });
  }

  /**
   * Genera y dibuja un buffer en el mapa a partir de una coordenada geográfica.
   *
   * @param coordenada Coordenada ingresada por el usuario.
   * @param nombreCapa Nombre de la capa a generar.
   * @param capasUsadas Capas seleccionadas como base para la operación.
   * @param capaOrigen Capa origen del buffer.
   * @param distancia Radio del buffer.
   * @param unidad Unidad de medida (no se usa en esta versión pero se conserva por compatibilidad).
   * @param separador Separador de columnas (no se usa en esta versión pero se conserva por compatibilidad).
   * @returns Una promesa que se resuelve al terminar de dibujar el buffer.
   */
  public dibujarBufferDesdeCoordenada(
    coordenada: CoordenadaGeografica,
    distancia: number,
    unidad: string
  ): Promise<void> {
    const map: OlMap | null = this.mapService.getMap();

    if (!map) {
      return Promise.reject('El mapa no está inicializado');
    }
    console.log('Coordenada recibida para buffer:', coordenada);
    const distanciaMetros = this.convertirDistancia(distancia, unidad);
    return this.realizarPeticionBufferDesdeCoordenada(
      coordenada,
      distanciaMetros
    )
      .then((geojson: GeoJSON.FeatureCollection) => {
        if (!geojson || !geojson.features || geojson.features.length === 0) {
          throw new Error('No se generaron features en el buffer');
        }

        this.vectorSource.clear();

        const format = new GeoJSON();
        const features = format.readFeatures(geojson);

        this.vectorLayer.setStyle(
          new Style({
            fill: new Fill({ color: 'rgba(255,0,0,0.3)' }),
            stroke: new Stroke({ color: '#ff0000', width: 2 }),
          })
        );

        this.vectorSource.addFeatures(features);

        const upperGroup = this.mapService.getLayerGroupByName(
          LayerLevel.UPPER
        );
        const layerArray = upperGroup?.getLayers().getArray() ?? [];

        if (upperGroup && !layerArray.includes(this.vectorLayer)) {
          upperGroup.getLayers().push(this.vectorLayer);
        }

        this.vectorLayer.setVisible(true);

        const extent = this.vectorSource.getExtent();
        if (extent && extent.every(coord => isFinite(coord))) {
          map.getView().fit(extent, {
            padding: [20, 20, 20, 20],
            duration: 500,
          });
        }

        return;
      })
      .catch(error => {
        console.error('Error al consultar o pintar el buffer:', error);
        return Promise.reject(error);
      });
  }

  /**
   * Convierte una coordenada geográfica a un objeto GeoJSON tipo Point.
   *
   * @param coordenada Coordenada geográfica a convertir.
   * @returns Geometría en formato GeoJSON tipo Point.
   */
  private generarGeometriaDesdeCoordenada(
    coordenada: CoordenadaGeografica
  ): GeometriaGeoJSON {
    const { latitud, longitud, tipoGrado } = coordenada;
    switch (tipoGrado) {
      case 'decimal':
      case 'sexagecimal':
      case 'plana':
        return {
          type: 'Point',
          coordinates: [latitud, longitud],
        };
      default:
        throw new Error(`Tipo de coordenada no soportado: ${tipoGrado}`);
    }
  }

  /**
   * Envía una solicitud al servicio remoto para generar un buffer a partir de una coordenada.
   *
   * Utiliza un servicio que recibe geometría en formato GeoJSON y retorna una FeatureCollection.
   *
   * @param coordenada Coordenada geográfica.
   * @param nombreCapa Nombre de la capa.
   * @param capasUsadas Capas seleccionadas (no utilizadas en esta versión).
   * @param capaOrigen Capa de origen (no utilizada en esta versión).
   * @param distancia Distancia del buffer.
   * @param unidad Unidad de medida (no usada).
   * @param separador Separador de campos (no usado).
   * @returns Promesa con la FeatureCollection generada.
   */
  public realizarPeticionBufferDesdeCoordenada(
    coordenada: CoordenadaGeografica,
    distancia: number
  ): Promise<GeoJSON.FeatureCollection> {
    try {
      const geometriaGeoJSON = this.generarGeometriaDesdeCoordenada(coordenada);

      const geojsonFeature: Feature = {
        type: 'Feature',
        geometry: geometriaGeoJSON,
        properties: {},
      };

      const featureCollection: FeatureCollection = {
        type: 'FeatureCollection',
        features: [geojsonFeature],
      };

      return this.bufferService.generarBufferDesdeGeojson(
        featureCollection,
        distancia,
        true // disolver geometría resultante
      );
    } catch (error) {
      console.error('Error preparando datos para el buffer:', error);
      return Promise.reject(error);
    }
  }

  /**
   * Limpia la capa de buffer del mapa y la oculta.
   */
  public limpiarBuffer(): void {
    this.vectorSource.clear();
    this.vectorLayer.setVisible(false);
  }

  /**
   * Convierte una distancia de una unidad a metros.
   *
   * @param distancia Valor de la distancia.
   * @param unidadDistancia Unidad de la distancia.
   * @returns Distancia convertida en metros.
   */
  public convertirDistancia(
    distancia: number,
    unidadDistancia: string
  ): number {
    switch (unidadDistancia) {
      case 'km':
        return distancia * 1000; // Convertir kilómetros a metros
      case 'm':
        return distancia; // Ya está en metros, no hace falta conversión
      case 'mi':
        return distancia * 1609.34; // Convertir millas a metros
      case 'nmi':
        return distancia * 1852; // Convertir millas náuticas a metros
      default:
        console.warn(
          `Unidad de distancia no reconocida: ${unidadDistancia}, se usa valor sin convertir.`
        );
        return distancia;
    }
  }
}
