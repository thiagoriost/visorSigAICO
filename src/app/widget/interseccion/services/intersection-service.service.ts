import { Injectable, OnDestroy } from '@angular/core';
import { CapaMapa } from '@app/core/interfaces/AdminGeo/CapaMapa';
import { FeatureCollection } from 'geojson';
import { Store } from '@ngrx/store';
import { MapState } from '@app/core/interfaces/store/map.model';
import { MapService } from '@app/core/services/map-service/map.service';
import { selectProxyURL } from '@app/core/store/map/map.selectors';
import { Subject, takeUntil } from 'rxjs';
import Draw from 'ol/interaction/Draw';
import { createBox } from 'ol/interaction/Draw';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import Style from 'ol/style/Style';
import Stroke from 'ol/style/Stroke';
import Fill from 'ol/style/Fill';
import { LayerLevel } from '@app/core/interfaces/enums/LayerLevel.enum';
import { MapActions } from '@app/core/store/map/map.actions';
import Feature from 'ol/Feature';
import { Geometry } from 'ol/geom';
import GeoJSON from 'ol/format/GeoJSON';

import {
  AttributeTableData,
  GeoJSONData,
  Geometria,
} from '@app/widget/attributeTable/interfaces/geojsonInterface';
import { AbrirWidget } from '@app/core/store/user-interface/user-interface.actions';
import { GeoJsonLayerService } from '@app/shared/services/geoJsonLayer/geo-json-layer.service';

/**
 * Servicio central para gestionar las operaciones de intersección espacial entre capas en el visor geográfico.
 *
 * Funcionalidades principales:
 * - Obtener geometrías (GeoJSON) desde capas WMS, REST o FILE.
 * - Permitir la selección espacial por el usuario mediante un área dibujada en el mapa.
 * - Enviar las capas al servicio de intersección y procesar el resultado.
 * - Gestionar la visualización en la Tabla de Atributos (widget de atributos).
 *
 *
 * @date 2025-06-16
 * @author Sergio Alonso Mariño Duque y Heidy Paola Lopez Sanchez
 */
@Injectable({
  providedIn: 'root',
})
export class IntersectionServiceService implements OnDestroy {
  private destroy$ = new Subject<void>();
  proxyUrl = ''; // URL del proxy para consultas WFS si aplica

  selectedExtent?: [number, number, number, number]; // Extensión seleccionada por el usuario (bounding box)
  private drawInteraction?: Draw; // Interacción de dibujo de OpenLayers
  private boxLayer?: VectorLayer; // Capa temporal para mostrar el área de selección

  constructor(
    private mapService: MapService,
    private store: Store<MapState>,
    private geoJsonLayer: GeoJsonLayerService
  ) {
    // Suscripción para obtener la URL del proxy desde el store
    this.store
      .select(selectProxyURL)
      .pipe(takeUntil(this.destroy$))
      .subscribe(proxyResult => {
        if (proxyResult) {
          this.proxyUrl = proxyResult;
        }
      });
  }
  /**
   * Hook de ciclo de vida de Angular que se ejecuta automáticamente cuando se destruye el servicio.
   *
   * Se encarga de:
   * - Cancelar todas las suscripciones observables (`destroy$.next()` y `destroy$.complete()`).
   * - Eliminar cualquier interacción de dibujo activa en el mapa (`drawInteraction`).
   * - Remover la capa de selección de área (`boxLayer`) del mapa.
   *
   * Este método previene fugas de memoria y garantiza que no queden capas o interacciones huérfanas en el visor.
   */
  ngOnDestroy(): void {
    // Finalizar las suscripciones RxJS
    this.destroy$.next();
    this.destroy$.complete();

    const map = this.mapService.getMap();
    if (map) {
      // Remover la interacción de dibujo si existe
      if (this.drawInteraction) {
        map.removeInteraction(this.drawInteraction);
        this.drawInteraction = undefined;
      }

      // Remover la capa de selección (bounding box) si existe
      if (this.boxLayer) {
        map.removeLayer(this.boxLayer);
        this.boxLayer = undefined;
      }
    }

    // Limpiar la extensión seleccionada
    this.selectedExtent = undefined;
  }
  /**
   * Obtiene el GeoJSON correspondiente a una capa, según su tipo de servicio.
   * Redirecciona internamente a métodos específicos para WMS, REST o FILE.
   *
   * @param layer Capa a consultar
   * @returns Promise con el FeatureCollection correspondiente
   */
  getGeoJsonFromLayer(layer: CapaMapa): Promise<GeoJSON.FeatureCollection> {
    switch (layer.tipoServicio) {
      case 'WMS':
        return this.getGeoJsonFromWfs(layer);
      case 'REST':
        return this.getGeoJsonFromRestLayer(layer);
      case 'FILE':
        return this.getGeoJsonFromFileLayer(layer);
      default:
        return Promise.reject(
          new Error(`Tipo de servicio no soportado: ${layer.tipoServicio}`)
        );
    }
  }

  /**
   * Obtiene el GeoJSON de una capa local (tipo FILE) cargada en el mapa.
   *
   * @param layer Capa FILE
   * @returns FeatureCollection con las geometrías existentes
   */
  getGeoJsonFromFileLayer(layer: CapaMapa): Promise<GeoJSON.FeatureCollection> {
    const map = this.mapService.getMap();
    if (!map) return Promise.reject(new Error('No hay mapa disponible'));
    const vectorLayer = map
      .getLayers()
      .getArray()
      .find(l => l.get('id') === layer.id) as
      | VectorLayer<VectorSource>
      | undefined;
    if (!vectorLayer) {
      return Promise.reject(
        new Error(`No se encontró la capa vectorial con ID ${layer.id}`)
      );
    }

    const features = vectorLayer.getSource()?.getFeatures();
    if (!features || features.length === 0) {
      return Promise.reject(
        new Error(`La capa ${layer.titulo} no tiene geometrías`)
      );
    }
    const format = new GeoJSON();
    const geojson = format.writeFeaturesObject(features);
    return Promise.resolve(this.cleanProperties(geojson));
  }

  /**
   * Obtiene el GeoJSON desde una capa tipo REST o WMS vía WFS.
   *
   * @param layer Capa REST/WMS
   * @returns FeatureCollection en formato GeoJSON
   */
  getGeoJsonFromRestLayer(layer: CapaMapa): Promise<GeoJSON.FeatureCollection> {
    if (!layer.urlServicioWFS || !layer.nombre) {
      return Promise.reject(
        new Error(`La capa REST/WMS no tiene información completa`)
      );
    }

    const url = `${layer.urlServicioWFS}?service=WFS&version=1.1.0&request=GetFeature&typeName=${layer.nombre}&outputFormat=application/json`;

    return fetch(url)
      .then(res => {
        if (!res.ok)
          throw new Error(`Error al obtener GeoJSON de ${layer.nombre}`);
        return res.json();
      })
      .then(json => this.cleanProperties(json as GeoJSON.FeatureCollection))
      .catch(err => {
        throw new Error(
          `Fallo al obtener GeoJSON de capa REST: ${err.message}`
        );
      });
  }

  /**
   * Obtiene un GeoJSON desde un servicio WFS de una capa WMS,
   * filtrando por el área seleccionada (bounding box).
   *
   * @param layer Capa WMS
   * @returns FeatureCollection resultante
   */
  async getGeoJsonFromWfs(layer: CapaMapa): Promise<FeatureCollection> {
    const capaNombre = layer?.nombre ?? 'desconocida';
    try {
      const map = this.mapService.getMap();
      if (!map) throw new Error(`No hay un mapa cargado`);

      const extent = this.selectedExtent;
      if (!extent) throw new Error(`No se ha definido un área de selección`);

      const projection = map.getView().getProjection().getCode();
      const bbox = `${extent[0]},${extent[1]},${extent[2]},${extent[3]}`;
      const wfsUrl = `${layer.urlServicioWFS}service=WFS&version=1.1.0&request=GetFeature&typename=${layer.nombre}&outputFormat=application/json&srsname=${projection}&bbox=${bbox},${projection}`;
      const finalUrl = this.proxyUrl ? this.proxyUrl + wfsUrl : wfsUrl;

      const response = await fetch(finalUrl);

      const contentType = response.headers.get('Content-Type') || '';

      if (!contentType.includes('application/json')) {
        const text = await response.text();
        console.error(
          `[ERROR] La respuesta no es JSON. Contenido recibido:\n${text}`
        );
        throw new Error(
          `Respuesta inválida para capa ${capaNombre}. Esperado application/json, recibido: ${contentType}`
        );
      }

      const geojson = await response.json();

      return this.cleanProperties(geojson as FeatureCollection);
    } catch (err) {
      console.error(`Error cargando capa ${layer.nombre}`, err);
      throw err;
    }
  }

  /**
   * Inicia la selección de un área rectangular (Bounding Box) sobre el mapa.
   * Permite al usuario delimitar espacialmente la consulta.
   */
  startBoxSelection(): void {
    const map = this.mapService.getMap();
    if (!map) return;

    // Limpieza de cualquier selección previa
    if (this.boxLayer) {
      map.removeLayer(this.boxLayer);
    }

    // Crear capa temporal para el recuadro de selección
    this.boxLayer = new VectorLayer({
      source: new VectorSource(),
      style: new Style({
        stroke: new Stroke({
          color: 'rgb(255, 238, 0)',
          width: 2,
          lineDash: [6, 4],
        }),
        fill: new Fill({
          color: 'rgba(255, 230, 0, 0.1)',
        }),
      }),
    });
    map.addLayer(this.boxLayer);

    const src = this.boxLayer.getSource();
    if (!src) throw new Error('Box layer tiene source null');

    // Interacción de dibujo de un rectángulo (con createBox)
    this.drawInteraction = new Draw({
      source: src,
      type: 'Circle',
      geometryFunction: createBox(),
    });
    map.addInteraction(this.drawInteraction);

    // Al finalizar el dibujo, guardamos la extensión
    this.drawInteraction.on('drawend', evt => {
      const geom = evt.feature.getGeometry()!;
      this.selectedExtent = geom.getExtent() as [
        number,
        number,
        number,
        number,
      ];
      map.removeInteraction(this.drawInteraction!);
      this.drawInteraction = undefined;
    });
  }

  /**
   * Elimina la selección del área (Bounding Box) del mapa,
   * removiendo la capa temporal y cualquier interacción de dibujo activa.
   */
  clearBoxSelection(): void {
    const map = this.mapService.getMap();
    if (!map) return;

    // Remueve la interacción de dibujo si está activa
    if (this.drawInteraction) {
      map.removeInteraction(this.drawInteraction);
      this.drawInteraction = undefined;
    }

    // Remueve la capa de selección si existe
    if (this.boxLayer) {
      map.removeLayer(this.boxLayer);
      this.boxLayer = undefined;
    }

    // Limpia el estado de la extensión seleccionada
    this.selectedExtent = undefined;
  }

  /**
   * Procesa el resultado de una intersección espacial y lo carga en el mapa como una nueva capa.
   *
   * Flujo completo:
   * 1. Crea y agrega una nueva capa vectorial al mapa.
   * 2. Registra la capa en el store global (NgRx).
   * 3. Ajusta la vista del mapa a la nueva capa.
   * 4. Muestra el resultado en la tabla de atributos si hay features válidas.
   *
   * @param geojson FeatureCollection resultante de la intersección espacial.
   * @param layerName Nombre visible de la capa.
   * @param layerDef Definición y metadatos de la capa (`CapaMapa`).
   */
  intersectionResult(
    geojson: FeatureCollection,
    layerName: string,
    layerDef: CapaMapa
  ): void {
    // Paso 1: Crear capa vectorial desde el GeoJSON
    const vectorlayer = this.geoJsonLayer.crearLayerDesdeGeoJSON(
      geojson,
      layerDef
    );

    // Paso 2: Agregar la capa al grupo 'Intermedias' en el mapa
    const layerGroup = this.mapService.getLayerGroupByName(
      LayerLevel.INTERMEDIATE
    );
    if (!layerGroup) {
      console.error('No se encontró el grupo de capas "Intermedias"');
      return;
    }
    layerGroup.getLayers().push(vectorlayer);

    // Paso 3: Registrar la capa en el store global (NgRx)
    this.store.dispatch(
      MapActions.addLayerToMap({
        layer: {
          layerDefinition: layerDef,
          layerLevel: LayerLevel.INTERMEDIATE,
          orderInMap: 0,
          isVisible: true,
          transparencyLevel: 0,
        },
      })
    );

    // Paso 4: Ajustar la vista del mapa al área de la nueva capa
    const source = vectorlayer.getSource();
    if (source && source.getExtent) {
      const extent = source.getExtent();
      const map = this.mapService.getMap();
      if (map) {
        map.getView().fit(extent, { padding: [50, 50, 50, 50], maxZoom: 15 });
      } else {
        console.warn('No se pudo obtener la instancia del mapa.');
      }
    }

    // Paso 5: Mostrar resultados en la tabla de atributos (si hay features)
    if (geojson.features.length > 0) {
      const format = new GeoJSON();

      const safeGeojson: GeoJSONData = {
        type: 'FeatureCollection',
        features: geojson.features.map(feature => ({
          type: 'Feature',
          geometry: format.writeGeometryObject(
            new GeoJSON().readGeometry(feature.geometry)
          ) as Geometria,
          properties: feature.properties ?? {},
        })),
      };

      const attributeTableData: AttributeTableData = {
        titulo: `Resultado: ${layerName}`,
        geojson: safeGeojson,
        visible: false,
      };

      // Actualizar contenido de la tabla de atributos
      this.store.dispatch(
        MapActions.setWidgetAttributeTableData({
          widgetId: 'tabla-atributos',
          data: attributeTableData,
        })
      );

      // Asegurar que el widget esté abierto
      this.store.dispatch(
        AbrirWidget({ nombre: 'attributeTable', estado: true })
      );
    } else {
      console.warn('Intersección no produjo geometrías para mostrar.');
    }
  }

  /**
   * Limpia los `properties` de cada feature en un FeatureCollection.
   * Elimina campos no deseados como filtros OGC o directamente los deja vacíos.
   *
   * @param geojson FeatureCollection original
   * @returns FeatureCollection limpio
   */
  private cleanProperties(geojson: FeatureCollection): FeatureCollection {
    return {
      type: 'FeatureCollection',
      features: geojson.features.map(f => ({
        type: 'Feature',
        geometry: f.geometry,
        properties: {},
      })),
    };
  }

  /**
   * Parsea un FeatureCollection GeoJSON a un arreglo de ol.Feature<Geometry>.
   *
   * @param geojson FeatureCollection a convertir
   * @returns Lista de features OpenLayers
   * @throws Error si el mapa no está disponible
   */
  parseGeoJSONToFeatures(geojson: FeatureCollection): Feature<Geometry>[] {
    const map = this.mapService.getMap();
    if (!map) {
      throw new Error('No hay un mapa cargado para inferir la proyección');
    }
    const projection = map.getView().getProjection().getCode();

    return new GeoJSON().readFeatures(geojson, {
      featureProjection: projection,
    });
  }
}
