import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import {
  WMSCapabilities,
  WMSLayer,
} from '@app/widget/add-wms/interfaces/wms-capabilities';
import { environment } from 'environments/environment';

/**
 * Servicio para interactuar con servicios WMS (Web Map Service).
 * Permite obtener las capacidades (GetCapabilities) de un servicio
 * WMS y convertir la respuesta XML a formato JSON.
 * @author Heidy Paola Lopez Sanchez
 */

@Injectable({
  providedIn: 'root',
})
export class UrlWMSService {
  /** Prefijo de proxy para evitar CORS (viene del Store). */
  private proxyUrl = '';

  constructor(private http: HttpClient) {
    this.proxyUrl = environment.map.proxy;
  }

  /**
   * Obtiene las capacidades de un servicio WMS en formato XML.
   * @param url - URL base del servicio WMS.
   * @returns Promesa con la respuesta en formato XML.
   */
  getCapabilities(url: string): Promise<string> {
    // Extrae solo la parte base de la URL sin parámetros
    const baseUrl = url.split('?')[0];

    // Construye la nueva URL con los parámetros correctos
    const finalUrl = `${baseUrl}?request=GetCapabilities&service=WMS`;

    // Construcción de la URL con el proxy
    const proxyUrl = `${this.proxyUrl}${encodeURIComponent(finalUrl)}`;

    // Realiza la solicitud HTTP GET y espera una respuesta en texto (XML).
    return firstValueFrom(
      this.http.get(proxyUrl, { responseType: 'text' }) // Se especifica que la respuesta será en formato de texto.
    )
      .then(response => {
        if (!response) {
          // Verifica si la respuesta es indefinida o vacía.
          throw new Error('La respuesta es undefined'); // Lanza un error si la respuesta no es válida.
        }
        return response; // Retorna la respuesta en formato XML.
      })
      .catch(error => {
        throw error; // Propaga el error en caso de fallo en la petición.
      });
  }

  /**
   * Convierte un XML en formato string a un objeto JSON.
   * @param xml - String con el contenido XML.
   * @returns Promesa con el JSON generado.
   */
  XMLToJSON(xml: string): Promise<WMSCapabilities> {
    return new Promise((resolve, reject) => {
      try {
        // Se crea un parser para convertir el XML en un documento DOM.
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xml, 'text/xml');

        // Convierte el XML a JSON utilizando la función auxiliar.
        const json = this.xmlNodeToJson(
          xmlDoc.documentElement
        ) as WMSCapabilities;
        resolve(json);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Convierte un nodo XML a JSON de manera recursiva.
   * @param node - Nodo XML a convertir.
   * @returns Representación JSON del nodo.
   */
  private xmlNodeToJson(
    node: Node
  ): WMSCapabilities | string | Record<string, unknown> {
    const obj: Record<string, unknown> = {}; // Objeto donde se almacenará la conversión del nodo.

    // Si el nodo es un elemento (ETIQUETA XML)
    if (node instanceof Element) {
      // Procesa los atributos del nodo (si tiene).
      if (node.attributes.length > 0) {
        for (const attr of Array.from(node.attributes)) {
          obj[`@${attr.name}`] = attr.value; // Lo almacena en el objeto con el prefijo '@'.
        }
      }
    }

    // Procesa los hijos del nodo XML.
    if (node.childNodes.length > 0) {
      for (const child of Array.from(node.childNodes)) {
        if (child.nodeType === Node.TEXT_NODE) {
          // Si es un nodo de texto.
          const text = child.nodeValue?.trim(); // Obtiene su valor sin espacios extra.
          if (text) {
            return text; // Si no está vacío, retorna el valor directamente.
          }
        } else if (child.nodeType === Node.CDATA_SECTION_NODE) {
          // Si es un nodo CDATA, extrae el contenido.
          const cdataContent = (child as CDATASection).nodeValue?.trim();
          if (cdataContent) {
            return cdataContent; // Devuelve el contenido de CDATA.
          }
        } else {
          // Si el nodo tiene hijos, se procesa recursivamente.
          const childName = child.nodeName;
          const childJson = this.xmlNodeToJson(child); // Convierte el nodo hijo a JSON.

          if (obj[childName]) {
            // Si el nombre del nodo ya existe, lo convierte en un array.
            if (!Array.isArray(obj[childName])) {
              obj[childName] = [obj[childName]]; // Convierte el valor anterior a array.
            }
            (obj[childName] as unknown[]).push(childJson); // Agrega el nuevo valor al array.
          } else {
            obj[childName] = childJson; // Agrega el nodo convertido al objeto principal.
          }
        }
      }
    }
    return obj; // Retorna el objeto JSON generado.
  }
  /**
   * Extrae las capas de un JSON generado a partir del XML de capacidades WMS.
   * @param xml - XML de capacidades en formato string.
   * @returns Promesa con un array de capas extraídas.
   */
  /**
   * Extrae las capas reales de un JSON generado a partir del XML de capacidades WMS.
   * Recorre recursivamente la jerarquía de capas y devuelve solo las que tengan `Name`.
   * @param xml - XML de capacidades en formato string.
   * @returns Promesa con un array de capas con un campo auxiliar `displayName`.
   */
  mapLayers(
    xml: string
  ): Promise<(WMSLayer & { displayName: string; qualifiedName: string })[]> {
    return this.XMLToJSON(xml)
      .then(json => {
        if (!json || !json.Capability || !json.Capability.Layer) {
          console.warn('No se encontró la estructura esperada en el JSON.');
          return [];
        }

        const rootLayer = json.Capability.Layer;

        const flattenLayers = (
          layers: WMSLayer | WMSLayer[],
          parentTitles: string[] = []
        ): (WMSLayer & { displayName: string; qualifiedName: string })[] => {
          if (!layers) return [];

          const arr = Array.isArray(layers) ? layers : [layers];

          return arr.flatMap(layer => {
            const currentTitle = layer.Title
              ? [...parentTitles, layer.Title]
              : parentTitles;

            let results: (WMSLayer & {
              displayName: string;
              qualifiedName: string;
            })[] = [];

            // Si esta capa tiene Name → la agregamos
            if (layer.Name) {
              results.push({
                ...layer,
                displayName: currentTitle.join(' / '),
                qualifiedName: [...parentTitles, layer.Name].join(':'),
              });
            }

            // Si tiene hijos → recorremos recursivamente
            if (layer.Layer) {
              results = results.concat(
                flattenLayers(layer.Layer, currentTitle)
              );
            }

            return results;
          });
        };

        return flattenLayers(rootLayer);
      })
      .catch(error => {
        console.error('Error en mapLayers:', error);
        return [];
      });
  }

  /**
   * Obtiene las capas de un servicio WMS a partir de su URL.
   * @param url - URL base del servicio WMS.
   * @returns Promesa con un array de capas.
   */
  getLayersFromWMS(url: string): Promise<WMSLayer[]> {
    return this.getCapabilities(url)
      .then(xml => this.mapLayers(xml))
      .catch(error => {
        console.error('Error obteniendo las capas del WMS:', error);
        return []; // Retorna un array vacío en caso de error
      });
  }
}
