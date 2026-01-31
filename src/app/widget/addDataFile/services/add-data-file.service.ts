import { Injectable } from '@angular/core';
import { GPX, GeoJSON, KML, TopoJSON } from 'ol/format'; // Formatos de OpenLayers para trabajar con archivos geoespaciales
import { Vector as VectorLayer } from 'ol/layer'; // Capa para agregar las características al mapa
import { Vector as VectorSource } from 'ol/source'; // Fuente para almacenar las características del archivo cargado
import { Feature } from 'ol'; // Importación necesaria para los features
import { LayerLevel } from '@app/core/interfaces/enums/LayerLevel.enum'; // Enum para los niveles de capa
import shp from 'shpjs';
import { Store } from '@ngrx/store'; // Necesario para interactuar con NgRx
import { MapActions } from '@app/core/store/map/map.actions'; // Acciones de NgRx para agregar la capa al estado global
import { CapaMapa } from '@app/core/interfaces/AdminGeo/CapaMapa';
import { LayerStore } from '@app/core/interfaces/store/LayerStore';
import { MapService } from '@app/core/services/map-service/map.service';
import { environment } from 'environments/environment';
import { get as getProjection } from 'ol/proj';
import type {
  Feature as GeoJSONFeature,
  FeatureCollection as GeoJSONFeatureCollection,
  Geometry as GeoJSONGeometry,
} from 'geojson';
/**
 * Servicio para la carga y procesamiento de archivos geoespaciales en el mapa.
 *
 * Este servicio permite cargar y procesar diferentes tipos de archivos geoespaciales
 * (GPX, GeoJSON, KML, TopoJSON, Shapefile), agregar las características al mapa y realizar
 * una animación de desplazamiento hacia la zona de las geometrías cargadas utilizando `flyTo`.
 */
@Injectable({
  providedIn: 'root',
})
export class AddDataFileService {
  private mapConfig = environment.map; // Configuración del mapa definida en el entorno

  constructor(
    private mapService: MapService, // Servicio para interactuar con el mapa
    private mapStore: Store // Servicio de NgRx para gestionar el estado global de las capas
  ) {}

  /**
   * Carga y procesa datos geoespaciales desde un archivo y agrega la capa correspondiente al mapa.
   * Tras cargar los datos, realiza una animación de desplazamiento hacia la zona de las geometrías cargadas.
   *
   * @param fileContent El contenido del archivo como cadena de texto.
   * @param fileName El nombre del archivo, utilizado para identificar su tipo.
   * @param file El archivo cargado.
   */
  loadData(fileContent: string, fileName: string, file: File): void {
    let format: GPX | GeoJSON | KML | TopoJSON;

    try {
      // Determina el tipo de archivo y selecciona el formato adecuado
      if (fileName.endsWith('.gpx')) {
        format = new GPX();
      } else if (fileName.endsWith('.geojson')) {
        format = new GeoJSON();
      } else if (fileName.endsWith('.kml')) {
        format = new KML();
      } else if (fileName.endsWith('.topojson')) {
        format = new TopoJSON();
      } else if (fileName.endsWith('.zip')) {
        // Manejo de archivos shapefile comprimidos
        const reader = new FileReader();

        reader.onload = () => {
          const arrayBuffer = reader.result as ArrayBuffer;

          // Procesamos el shapefile de forma asincrónica
          shp(arrayBuffer)
            .then(geojson => {
              // Convertir shapefile a GeoJSON y procesar
              fileContent = JSON.stringify(geojson);
              format = new GeoJSON();
              this.processFileContent(fileContent, format, fileName);
            })
            .catch(error => {
              this.handleError(error, 'Error al convertir shapefile a geojson');
            });
        };

        reader.onerror = error => {
          this.handleError(error, 'Error al leer el archivo .zip');
        };

        reader.readAsArrayBuffer(file); // Leer archivo como ArrayBuffer
        return; // Salimos del método para esperar la asincronía
      } else if (fileName.endsWith('.shp')) {
        const reader = new FileReader();

        reader.onload = () => {
          try {
            const arrayBuffer = reader.result as ArrayBuffer;

            // Convertimos el shapefile a un GeoJSON (solo geometría, sin atributos)
            const geojson = this.parseShp(arrayBuffer);

            const fileContent = JSON.stringify(geojson);
            const format = new GeoJSON();
            this.processFileContent(fileContent, format, fileName);
          } catch (error) {
            this.handleError(error, 'Error al convertir .shp a geojson');
          }
        };

        reader.onerror = error => {
          this.handleError(error, 'Error al leer el archivo .shp');
        };

        reader.readAsArrayBuffer(file);
        return;
      } else {
        console.log('Formato de archivo no soportado');
        throw new Error('Formato de archivo no soportado.');
      }

      // Procesa el contenido del archivo (para formatos no shapefile)
      this.processFileContent(fileContent, format, fileName);
    } catch (error) {
      this.handleError(error, 'Error al cargar el archivo');
    }
  }

  /**
   * Procesa el contenido del archivo cargado y agrega las características al mapa.
   * Después de agregar las características, realiza una animación de desplazamiento hacia la zona de las geometrías.
   *
   * @param fileContent El contenido del archivo como cadena de texto.
   * @param format El formato que se utilizará para leer las características del archivo.
   * @param fileName El nombre del archivo cargado.
   */
  private processFileContent(
    fileContent: string,
    format: GPX | GeoJSON | KML | TopoJSON,
    fileName: string
  ): void {
    try {
      // Obtener la proyección definida en la configuración del mapa (EPSG:4326)
      const projection = getProjection(this.mapConfig.projection);
      if (!projection) {
        throw new Error(
          `La proyección ${this.mapConfig.projection} no es válida.`
        );
      }

      // Leer las características del archivo usando el formato correspondiente
      const features: Feature[] = format.readFeatures(fileContent, {
        featureProjection: projection,
      });

      // Validar si el archivo contiene características válidas
      if (features.length === 0) {
        throw new Error(
          'No se encontraron características válidas en el archivo.'
        );
      }

      // Crear una fuente de datos vectoriales con las características leídas
      const vectorSource = new VectorSource({
        features: features,
      });

      // Crear una capa vectorial para las características
      // pasar los datos de createLayerMetadata al properties de vectorLayer
      const vectorLayer = new VectorLayer({
        source: vectorSource,
      });

      // Obtener el mapa actual
      const map = this.mapService.getMap();
      if (!map) {
        throw new Error('Mapa no disponible.');
      }

      // Obtener los límites de las características y ajustarlos al mapa
      const extent = vectorSource.getExtent();
      if (extent[0] === extent[2] || extent[1] === extent[3]) {
        throw new Error('Cannot fit empty extent provided as geometry');
      }

      // Ajustar la vista para mostrar las características
      map.getView().fit(extent, {
        padding: [50, 50, 50, 50],
        maxZoom: 16,
      });

      // Calcular el centro de la extensión para animar el desplazamiento
      const center = [(extent[0] + extent[2]) / 2, (extent[1] + extent[3]) / 2];

      // Animar el desplazamiento hacia el centro de las geometrías cargadas
      this.flyTo(center, () => {
        console.log('Desplazamiento completado hacia las geometrías cargadas');
      });

      // Obtener el grupo de capas intermedias y agregar la nueva capa
      const layerGroup = this.mapService.getLayerGroupByName(
        LayerLevel.INTERMEDIATE
      );
      if (layerGroup) {
        layerGroup.getLayers().push(vectorLayer);
      } else {
        console.error('Grupo de capa INTERMEDIATE no encontrado.');
      }

      // Crear los metadatos de la capa y agregarla al store de NgRx
      const layerMetadata: CapaMapa = this.createLayerMetadata(fileName);
      vectorLayer.setProperties(layerMetadata);
      this.addLayerToStore(layerMetadata);
    } catch (error) {
      this.handleError(
        error,
        'Error al procesar las características del archivo'
      );
    }
  }

  /**
   * Realiza una animación de desplazamiento hacia la ubicación indicada.
   *
   * @param location La ubicación hacia donde se debe desplazar la vista del mapa (centro de las geometrías cargadas).
   * @param done Función de callback que se ejecuta cuando la animación termina.
   */
  private flyTo(location: number[], done: (complete: boolean) => void): void {
    const duration = 2000; // Duración de la animación en milisegundos

    // Obtener el mapa
    const map = this.mapService.getMap();

    // Verificar si el mapa está disponible
    if (!map) {
      console.error('El mapa no está disponible.');
      return;
    }

    // Obtener la vista del mapa
    const view = map.getView();

    // Verificar si la vista está disponible
    if (!view) {
      console.error('La vista del mapa no está disponible.');
      return;
    }

    // Obtener el nivel de zoom actual, y si es undefined, asignar un valor predeterminado
    const zoom = view.getZoom();
    const validZoom = zoom !== undefined ? zoom : 2; // Usamos un valor predeterminado si zoom es undefined

    let parts = 2;
    let called = false;

    // Callback para asegurarse de que la animación se complete
    function callback(complete: boolean) {
      --parts;
      if (called) {
        return;
      }
      if (parts === 0 || !complete) {
        called = true;
        done(complete); // Llamar al callback al finalizar
      }
    }

    // Animación para el desplazamiento hacia el centro
    view.animate(
      {
        center: location,
        duration: duration,
      },
      callback
    );

    // Animación para el ajuste de zoom
    view.animate(
      {
        zoom: validZoom - 1, // Usamos validZoom para asegurarnos de que no es undefined
        duration: duration / 2,
      },
      {
        zoom: validZoom, // Usamos validZoom también aquí
        duration: duration / 2,
      },
      callback
    );
  }

  /**
   * Maneja los errores durante el proceso de carga y procesamiento de los archivos.
   *
   * @param error El objeto de error que ocurrió.
   * @param message El mensaje descriptivo que describe el error.
   */
  private handleError(error: unknown, context: string): void {
    let errorMessage = '';

    if (error instanceof Error) {
      errorMessage = error.message;
    } else {
      errorMessage = 'Error desconocido';
    }

    // Si el error ya contiene el mensaje 'Error al cargar el archivo:', no agregarlo nuevamente
    if (!errorMessage.startsWith('Error al cargar el archivo:')) {
      errorMessage = `Error al cargar el archivo: ${errorMessage}`;
    }

    // Si hay un contexto, agregamos el contexto al mensaje de error
    if (context) {
      errorMessage = `${errorMessage}: ${context}`;
    }

    // Lanza el error con el mensaje completo
    throw new Error(errorMessage);
  }

  /**
   * Crea los metadatos de la capa cargada.
   *
   * @param fileName El nombre del archivo cargado.
   * @returns Los metadatos de la capa como objeto `CapaMapa`.
   */
  private createLayerMetadata(fileName: string): CapaMapa {
    const uniqueId = `external-layer-${Date.now()}`;
    const idInterno = Date.now();

    const layerMetadata: CapaMapa = {
      id: uniqueId,
      titulo: fileName || 'Capa sin nombre',
      leaf: true,
      descripcionServicio: 'Archivo cargado por usuario',
      tipoServicio: 'FILE',
      estadoServicio: 'A',
      idInterno: idInterno,
      checked: true,
    };

    return layerMetadata;
  }

  /**
   * Agrega la capa al store de NgRx para su gestión.
   *
   * @param layerMap Los metadatos de la capa a agregar.
   */
  private addLayerToStore(layerMap: CapaMapa): void {
    const layerToStore: LayerStore = {
      isVisible: true,
      layerDefinition: layerMap,
      layerLevel: LayerLevel.INTERMEDIATE,
      orderInMap: 0,
      transparencyLevel: 0,
    };

    this.mapStore.dispatch(MapActions.addLayerToMap({ layer: layerToStore }));
  }

  /**
   * Parser manual de archivos .shp (solo geometría, sin atributos).
   * Soporta Point, MultiPoint, PolyLine y Polygon.
   * @param arrayBuffer - Contenido binario del archivo .shp
   * @returns FeatureCollection en formato GeoJSON
   */
  private parseShp(arrayBuffer: ArrayBuffer) {
    const dataView = new DataView(arrayBuffer);
    const features: GeoJSONFeature<GeoJSONGeometry>[] = [];

    // Saltar el header general (100 bytes fijos)
    let offset = 100;

    // Iteramos sobre todos los registros
    while (offset < dataView.byteLength) {
      //Cada registro tiene:
      //ecord Header: 8 bytes (record number + content length)
      offset += 8;

      // Shape Type (4 bytes, little endian)
      const shapeType = dataView.getInt32(offset, true);
      offset += 4;

      //Soporte por tipo ---
      if (shapeType === 1) {
        // Point (x, y)
        const x = dataView.getFloat64(offset, true);
        offset += 8;
        const y = dataView.getFloat64(offset, true);
        offset += 8;

        features.push({
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [x, y] },
          properties: {},
        });
      } else if (shapeType === 8) {
        // MultiPoint
        offset += 32; // bbox
        const numPoints = dataView.getInt32(offset, true);
        offset += 4;

        const points: [number, number][] = [];
        for (let i = 0; i < numPoints; i++) {
          const x = dataView.getFloat64(offset, true);
          offset += 8;
          const y = dataView.getFloat64(offset, true);
          offset += 8;
          points.push([x, y]);
        }

        features.push({
          type: 'Feature',
          geometry: { type: 'MultiPoint', coordinates: points },
          properties: {},
        });
      } else if (shapeType === 3) {
        // PolyLine (LineString o MultiLineString)
        offset += 32; // bbox
        const numParts = dataView.getInt32(offset, true);
        offset += 4;
        const numPoints = dataView.getInt32(offset, true);
        offset += 4;

        // leer índices de partes
        const parts: number[] = [];
        for (let i = 0; i < numParts; i++) {
          parts.push(dataView.getInt32(offset, true));
          offset += 4;
        }

        // leer puntos
        const points: [number, number][] = [];
        for (let i = 0; i < numPoints; i++) {
          const x = dataView.getFloat64(offset, true);
          offset += 8;
          const y = dataView.getFloat64(offset, true);
          offset += 8;
          points.push([x, y]);
        }

        // dividir en partes
        const lines: [number, number][][] = [];
        for (let i = 0; i < numParts; i++) {
          const start = parts[i];
          const end = i + 1 < numParts ? parts[i + 1] : points.length;
          lines.push(points.slice(start, end));
        }

        features.push({
          type: 'Feature',
          geometry:
            lines.length === 1
              ? { type: 'LineString', coordinates: lines[0] }
              : { type: 'MultiLineString', coordinates: lines },
          properties: {},
        });
      } else if (shapeType === 5) {
        // Polygon (Polygon o MultiPolygon)
        offset += 32; // bbox
        const numParts = dataView.getInt32(offset, true);
        offset += 4;
        const numPoints = dataView.getInt32(offset, true);
        offset += 4;

        // leer índices de partes
        const parts: number[] = [];
        for (let i = 0; i < numParts; i++) {
          parts.push(dataView.getInt32(offset, true));
          offset += 4;
        }

        // leer puntos
        const points: [number, number][] = [];
        for (let i = 0; i < numPoints; i++) {
          const x = dataView.getFloat64(offset, true);
          offset += 8;
          const y = dataView.getFloat64(offset, true);
          offset += 8;
          points.push([x, y]);
        }

        // dividir en partes (cada parte es un anillo)
        const rings: [number, number][][] = [];
        for (let i = 0; i < numParts; i++) {
          const start = parts[i];
          const end = i + 1 < numParts ? parts[i + 1] : points.length;
          rings.push(points.slice(start, end));
        }

        features.push({
          type: 'Feature',
          geometry:
            rings.length === 1
              ? { type: 'Polygon', coordinates: rings }
              : { type: 'MultiPolygon', coordinates: [rings] },
          properties: {},
        });
      } else {
        // Tipo no soportado
        console.warn(`ShapeType ${shapeType} no soportado en parser manual.`);
        break;
      }
    }
    return {
      type: 'FeatureCollection',
      features: features,
    } as GeoJSONFeatureCollection<GeoJSONGeometry>;
  }
}
