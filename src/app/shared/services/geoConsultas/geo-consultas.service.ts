/**
 * Servicio: GeoConsultasService
 * Creador: Carlos Alberto Aristizábal
 * Fecha: 16 de abril de 2025
 *
 * Descripción general:
 * Este servicio centraliza la lógica para consultar servicios WFS y procesar sus respuestas,
 * permitiendo obtener atributos, valores únicos y resultados filtrados de capas geográficas.
 * También se encarga de transformar datos XML/GML a GeoJSON y enviar resultados a la UI (tabla de atributos).
 *
 * Responsabilidades principales:
 * - Ejecutar consultas WFS con filtros OGC generados dinámicamente.
 * - Obtener metadatos (atributos y valores únicos) de capas geográficas.
 * - Convertir respuestas GML en objetos GeoJSON listos para visualización o análisis.
 * - Despachar los datos al store de NgRx y controlar la visibilidad del widget de tabla de atributos.
 */

import { Injectable } from '@angular/core';
import WFS from 'ol/format/WFS';
import GML2 from 'ol/format/GML2';
import { GeoJSON } from 'ol/format';
import { environment } from 'environments/environment';
import { UrlWFSService } from '../urlWFS/url-wfs.service';
import { XmlFilterGeneratorService } from '../XmlFilterGenerator/xml-filter-generator.service';
import {
  AttributeTableData,
  GeoJSONData,
} from '@app/widget/attributeTable/interfaces/geojsonInterface';
import { MapActions } from '@app/core/store/map/map.actions';
import { UserInterfaceService } from '@app/core/services/user-interface-service/user-interface.service';
import { Store } from '@ngrx/store';
import { MapState } from '@app/core/interfaces/store/map.model';

@Injectable()
export class GeoConsultasService {
  constructor(
    private urlWFSService: UrlWFSService, // Servicio para obtener datos de WFS
    private xmlFilterGenerator: XmlFilterGeneratorService, // Servicio para generar filtros OGC desde expresiones
    private userInterfaceService: UserInterfaceService, // Servicio para controlar visibilidad de widgets
    private store: Store<MapState> // Store NgRx para despachar acciones relacionadas con el mapa
  ) {}

  /**
   * Solicita los atributos disponibles de una capa desde el servicio WFS.
   * @param urlServicio URL del servicio WFS.
   * @param capa Nombre de la capa.
   * @returns Promesa con el XML de los atributos.
   */
  obtenerAtributosCapa(urlServicio: string, layer: string): Promise<string> {
    // Extraer workspace
    const match = urlServicio.match(/geoserver\/([^/]+)\/wfs/i);
    const workspace = match ? match[1] : '';
    const capa = `${workspace}:${layer}`;
    return this.urlWFSService.getLayerAttributes(urlServicio, capa);
  }

  /**
   * Obtiene los valores únicos de un atributo en una capa WFS.
   * @param urlServicio URL del servicio WFS.
   * @param capa Nombre de la capa.
   * @param atributo Nombre del atributo.
   * @returns Promesa con el XML de los valores encontrados.
   */
  obtenerValoresAtributo(
    urlServicio: string,
    capa: string,
    atributo: string
  ): Promise<string> {
    // Extraer workspace
    const match = urlServicio.match(/geoserver\/([^/]+)\/wfs/i);
    const workspace = match ? match[1] : '';
    // Realizar la consulta para obtener los valores del atributo seleccionado
    const capaConsultar = `${workspace}:${capa}`;
    return this.urlWFSService.getValuesForAttribute(
      urlServicio,
      capaConsultar,
      atributo
    );
  }

  /**
   * Ejecuta una consulta simple con filtro generado a partir de una expresión.
   * @param urlServicio URL del servicio WFS.
   * @param capa Nombre de la capa.
   * @param expresion Expresión lógica para filtrar (por ejemplo: "nombre = 'valor'").
   * @returns Promesa con la respuesta XML en formato GML.
   */
  ejecutarConsulta(
    urlServicio: string,
    capa: string,
    expresion: string
  ): Promise<string> {
    const ocgFilter: string =
      this.xmlFilterGenerator.generarFiltroDesdeExpresion(expresion);
    return this.urlWFSService.consulta(urlServicio, capa, ocgFilter);
  }

  /**
   * Parsea el XML recibido de DescribeFeatureType para extraer nombres y tipos de atributos.
   * @param xml XML como string.
   * @returns Arreglo de objetos con nombre y tipo de cada atributo.
   */
  parseLayerAttributes(xml: string): { name: string; type: string }[] {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xml, 'text/xml');
    const elements = Array.from(xmlDoc.getElementsByTagName('xsd:element'));

    return elements.map(el => ({
      name: el.getAttribute('name') || '',
      type: el.getAttribute('type') || '',
    }));
  }

  /**
   * Parsea un XML de GetFeature para extraer valores únicos de un atributo.
   * @param xml XML como string.
   * @param attributeName Nombre del atributo a buscar.
   * @returns Arreglo ordenado con valores únicos encontrados.
   */
  parseAttributeValues(xml: string, attributeName: string): string[] {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xml, 'text/xml');
    const allElements = Array.from(xmlDoc.getElementsByTagName('*'));
    const valuesSet = new Set<string>();

    for (const el of allElements) {
      const localName = el.localName;
      if (localName === attributeName && el.textContent) {
        valuesSet.add(el.textContent.trim());
      }
    }

    return Array.from(valuesSet).sort(); // Retorna valores únicos ordenados
  }

  /**
   * Convierte una respuesta GML (en XML) a un objeto GeoJSON válido.
   * Utiliza los formatos WFS y GML2 de OpenLayers para interpretar correctamente las geometrías.
   *
   * @param gmlText Texto GML como string.
   * @returns Objeto GeoJSON tipo FeatureCollection.
   * @throws Error si no se logra generar un GeoJSON válido.
   */
  parseGMLToGeoJSON(gmlText: string): GeoJSON.FeatureCollection {
    const format = new WFS({ gmlFormat: new GML2() });
    const features = format.readFeatures(gmlText, {
      dataProjection: environment.map.projection,
      featureProjection: environment.map.projection,
    });

    const geoJsonFormat = new GeoJSON();
    const geojson = geoJsonFormat.writeFeaturesObject(features);

    if (!geojson || !geojson.features) {
      throw new Error('El objeto GeoJSON generado no es válido.');
    }

    return geojson as GeoJSON.FeatureCollection;
  }

  /**
   * Transforma un XML con geometrías en GML a un objeto GeoJSONData filtrado.
   * Filtra geometrías inválidas, en especial las de tipo GeometryCollection (no soportadas por la app).
   *
   * @param xml XML con datos GML.
   * @returns Objeto GeoJSONData con solo geometrías válidas.
   */
  transformarAFormatoGeoJSONData(xml: string): GeoJSONData {
    try {
      const geojsonOriginal = this.parseGMLToGeoJSON(xml);

      if (!geojsonOriginal || !geojsonOriginal.features) {
        throw new Error('La respuesta no contiene datos válidos.');
      }

      const featuresFiltradas = geojsonOriginal.features
        .map(f => {
          const geom = f.geometry;
          // Validación de que la geometría tenga coordenadas y no sea GeometryCollection
          if (geom && 'coordinates' in geom) {
            return {
              type: f.type,
              geometry: {
                type: geom.type,
                coordinates: geom.coordinates as
                  | number[]
                  | number[][]
                  | number[][][],
              },
              properties:
                f.properties && typeof f.properties === 'object'
                  ? f.properties
                  : {},
            };
          } else {
            return null;
          }
        })
        .filter(f => f !== null); // Elimina entradas nulas

      if (featuresFiltradas.length === 0) {
        throw new Error('La consulta no devolvió resultados.');
      }
      return {
        type: 'FeatureCollection',
        features: featuresFiltradas,
      };
    } catch (err) {
      throw new Error(
        `Error al transformar la respuesta a GeoJSON: ${err && err ? err : err}`
      );
    }
  }

  /**
   * Muestra los resultados de una consulta en el widget de tabla de atributos.
   * Despacha la información al store y activa el widget correspondiente en la interfaz.
   *
   * @param titulo Nombre de la capa o conjunto de datos para mostrar.
   * @param geojson Datos en formato GeoJSON para visualizar en tabla.
   * @param visible Indica si el widget debe mostrarse de inmediato (por defecto: true).
   */
  mostrarResultadosEnTabla(
    titulo: string,
    geojson: GeoJSONData,
    visible = true
  ): void {
    const data = { titulo, geojson, visible };

    this.store.dispatch(
      MapActions.setWidgetAttributeTableData({
        widgetId: 'tabla-atributos',
        data: data as AttributeTableData,
      })
    );

    // Mostrar el widget de la tabla de atributos
    this.userInterfaceService.cambiarVisibleWidget('attributeTable', true);
  }
  /**
   * Despacha los resultados de la consulta al store y activa el widget de tabla de atributos.
   * @param titulo Título o nombre para identificar la capa en la tabla.
   * @param geojson Datos en formato GeoJSON.
   * @param visible Indica si el widget debe mostrarse inmediatamente.
   */
  cerrarTabla(): void {
    // cerrar el widget de la tabla de atributos
    this.userInterfaceService.cambiarVisibleWidget('attributeTable', false);
  }
}
