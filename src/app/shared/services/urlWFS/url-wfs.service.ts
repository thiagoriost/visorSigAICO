import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MapState } from '@app/core/interfaces/store/map.model';
import { MapService } from '@app/core/services/map-service/map.service';
import { selectProxyURL } from '@app/core/store/map/map.selectors';
import { Store } from '@ngrx/store';
import { firstValueFrom } from 'rxjs';

/**
 * Servicio: UrlWFSService
 * Creador: Carlos Alberto Aristizábal y Heidy Paola Lopez Sanchez
 * Fecha: 16 de abril de 2025
 *
 * Descripción:
 * Servicio encargado de interactuar con servicios WFS (Web Feature Service) a través de un proxy,
 * para obtener capacidades del servicio, atributos, valores de atributos y ejecutar consultas filtradas.
 * Usa peticiones HTTP para interactuar con el servidor WFS y devolver datos en formato XML o GeoJSON.
 */

@Injectable()
export class UrlWFSService {
  private proxyURL = '';
  workspace = '';
  constructor(
    private http: HttpClient,
    private store: Store<MapState>,
    private mapService: MapService
  ) {
    // Obtener el proxy desde el store una vez al crear el servicio
    firstValueFrom(this.store.select(selectProxyURL)).then(proxy => {
      this.proxyURL = proxy;
    });
  }
  /**
   * Construye la URL del servicio WFS con los parámetros necesarios.
   * @param url URL base del servicio WFS.
   * @param params Parámetros de la consulta.
   * @returns URL completa con el proxy y los parámetros codificados.
   */
  private construirURL(url: string, params: string): string {
    const baseUrl = url.split('?')[0];
    const finalUrl = `${baseUrl}?${params}`;
    return `${this.proxyURL}${encodeURIComponent(finalUrl)}`;
  }

  /**
   * Obtiene las capacidades de un servicio WFS.
   * @param url URL del servicio WFS.
   * @returns Promesa con la respuesta en formato XML.
   */
  getCapabilitiesWFS(url: string): Promise<string> {
    const params = 'request=GetCapabilities&service=WFS&version=1.0.0';
    const proxyUrl = this.construirURL(url, params);
    return firstValueFrom(
      this.http.get(proxyUrl, { responseType: 'text' })
    ).then(response => {
      if (!response) throw new Error('La respuesta es undefined');
      return response;
    });
  }

  /**
   * Obtiene las características de una capa WFS en formato GeoJSON.
   * @param url URL del servicio WFS.
   * @param layerName Nombre de la capa.
   * @returns Promesa con la respuesta en formato GeoJSON.
   */
  getFeatureFromLayer(url: string, layerName: string): Promise<string> {
    const params = `service=WFS&version=1.0.0&request=GetFeature&typeName=${layerName}&outputFormat=application/json&srsName=EPSG:4326`;
    const proxyUrl = this.construirURL(url, params);
    return firstValueFrom(
      this.http.get(proxyUrl, { responseType: 'text' })
    ).then(response => {
      if (!response) throw new Error('La respuesta del WFS es undefined');
      return response;
    });
  }

  /**
   * Obtiene la descripción de los atributos de una capa (DescribeFeatureType).
   * @param url URL del servicio WFS.
   * @param layerName Nombre de la capa.
   * @returns Promesa con la respuesta como string (XML).
   */
  getLayerAttributes(url: string, layerName: string): Promise<string> {
    const params = `service=WFS&version=1.0.0&request=DescribeFeatureType&typeName=${layerName}`;
    const proxyUrl = this.construirURL(url, params);
    return firstValueFrom(
      this.http.get(proxyUrl, { responseType: 'text' })
    ).then(response => {
      if (!response) throw new Error('La respuesta es undefined');

      return response;
    });
  }

  /**
   * Obtiene los valores únicos para un atributo específico dentro de una capa.
   * @param url URL del servicio WFS.
   * @param layerName Nombre de la capa.
   * @param attributeName Nombre del atributo.
   * @returns Promesa con la respuesta como string (XML).
   */
  getValuesForAttribute(
    url: string,
    layerName: string,
    attributeName: string
  ): Promise<string> {
    const params = `service=WFS&version=1.0.0&request=GetFeature&typeName=${layerName}&propertyName=${attributeName}&outputFormat=GML2`;
    const proxyUrl = this.construirURL(url, params);
    return firstValueFrom(
      this.http.get(proxyUrl, { responseType: 'text' })
    ).then(response => {
      if (!response) throw new Error('La respuesta es undefined');
      console.log('Respuesta de DescribeFeatureType:', response);
      return response;
    });
  }

  /**
   * Realiza una consulta WFS con un filtro OGC (Open Geospatial Consortium).
   * @param url URL del servicio WFS.
   * @param layerName Nombre de la capa.
   * @param ogcFilter Filtro OGC para la consulta.
   * @returns Promesa con la respuesta como string (XML).
   */
  consulta(url: string, layerName: string, ogcFilter: string): Promise<string> {
    console.log('URL:', url);
    console.log('Layer Name:', layerName);
    console.log('OGC Filter:', ogcFilter);
    // 1. Extraer workspace desde la URL (ej: 'geoserver/INDIGENA/wfs')
    const match = url.match(/geoserver\/([^/]+)\/wfs/i);
    const workspace = match ? match[1] : '';

    if (!workspace) {
      throw new Error('No se pudo extraer el workspace desde la URL.');
    }

    // 2. Armar el nombre de la capa con el workspace
    const layerWithWorkspace = `${workspace}:${layerName}`;

    // 4. Obtener proyeccion actual del mapa para la consulta
    const map = this.mapService.getMap();
    if (!map) {
      throw new Error('No se pudo obtener el mapa.');
    }
    const projection = map.getView().getProjection(); // ol/proj/Projection
    const epsgCode = projection.getCode(); // Ejemplo: 'EPSG:3857' o 'EPSG:4326'

    // 5. Crear los parámetros codificados con URLSearchParams
    const searchParams = new URLSearchParams();
    searchParams.set('service', 'WFS');
    searchParams.set('version', '1.0.0');
    searchParams.set('request', 'GetFeature');
    searchParams.set('typeName', layerWithWorkspace);
    searchParams.set('outputFormat', 'GML2');
    searchParams.set('filter', ogcFilter.trim()); // El filtro debe estar en XML
    searchParams.set(
      'srsName',
      `urn:ogc:def:crs:${epsgCode.replace(':', '::')}`
    );

    // 6. Construir la URL con proxy
    const proxyUrl = this.construirURL(url, searchParams.toString());

    // 7. Ejecutar la solicitud
    return firstValueFrom(this.http.get(proxyUrl, { responseType: 'text' }))
      .then(response => {
        if (!response) {
          throw new Error('La respuesta de GetFeature es undefined');
        }
        return response;
      })
      .catch(error => {
        throw new Error(
          `Error al ejecutar consulta WFS: ${error.message || error}`
        );
      });
  }
}
