import { Injectable } from '@angular/core';
import { Coordinate } from 'ol/coordinate';
import { transform, get as getProjection } from 'ol/proj';
import { MapService } from '@app/core/services/map-service/map.service';
import proj4 from 'proj4';
import { register } from 'ol/proj/proj4';
import { EscalaTransformada } from '../interface/view-coords-interface';

/**
 * Servicio encargado de escuchar el movimiento del cursor sobre un mapa de OpenLayers
 * y transformar las coordenadas obtenidas a diferentes formatos y proyecciones.
 * - Formato DMS (grados, minutos, segundos)
 * - Coordenadas proyectadas (metros)
 * - Coordenadas geográficas (grados decimales para 4686)
 * @author Heidy Paola Lopez Sanchez
 */

@Injectable({
  providedIn: 'root',
})
export class ViewCoordsService {
  /**
   * @param mapService Servicio de Angular que proporciona la instancia de OpenLayers Map.
   */
  constructor(private mapService: MapService) {}

  /**
   * Escucha el movimiento del cursor y devuelve las coordenadas en el CRS indicado,
   * con formato dinámico según el tipo de proyección (geográfica/decimal, geográfica/DMS o proyectada).
   *
   * @param crsCode Código EPSG de destino (ej: 'EPSG:4326', 'EPSG:3116', etc.)
   * @param callback Función que recibe el objeto EscalaTransformada
   */
  listenCursorCoordinates(
    crsCode: string,
    callback: (coords: EscalaTransformada) => void
  ): void {
    const map = this.mapService.getMap();
    if (!map) return;

    // 1. Asegura que la proyección de destino esté registrada en proj4
    this.ensureCRSRegistered(crsCode);

    // Nota: Este evento añade un nuevo listener cada vez que se llama este método.
    map.on('pointermove', event => {
      const coordinate: Coordinate = event.coordinate;
      // Obtiene el CRS actual de la vista del mapa (e.g., 'EPSG:3857')
      const currentProjection = map.getView().getProjection().getCode();

      // Transformar la coordenada del mapa base al CRS solicitado
      const [xDecimal, yDecimal] = transform(
        coordinate,
        currentProjection,
        crsCode
      );

      let escala: EscalaTransformada;

      if (this.isGeographic(crsCode)) {
        // Otros CRSs geográficos → DMS (ej. 4326)
        escala = {
          crsCode,
          nameX: 'Long',
          nameY: 'Lat',
          x: this.decimalToDMS(xDecimal, false),
          y: this.decimalToDMS(yDecimal, true),
        };
      } else {
        // Coordenadas proyectadas → valores métricos (ej. 3116, 9377)
        escala = {
          crsCode,
          nameX: 'X',
          nameY: 'Y',
          // Valores métricos redondeados a 3 decimales
          x: Number(xDecimal.toFixed(3)),
          y: Number(yDecimal.toFixed(3)),
        };
      }

      callback(escala);
    });
  }

  /**
   * Determina si el CRS es geográfico (grados) o proyectado (metros).
   * @param crsCode El código de la proyección (e.g., 'EPSG:4326').
   * @returns true si el CRS es geográfico.
   */
  private isGeographic(crsCode: string): boolean {
    // 4326 es geográfico (DMS), 4686 es geográfico (Decimal)
    const geographicCRS = ['EPSG:4326', 'EPSG:4686'];
    return geographicCRS.includes(crsCode);
  }

  /**
   * Registra dinámicamente CRS si no está disponible en ol/proj, usando proj4.
   * @param crsCode El código de la proyección a registrar.
   */
  ensureCRSRegistered(crsCode: string): void {
    const exists = getProjection(crsCode);
    if (exists) return;

    const crsDefinitions: Record<string, string> = {
      /**
       * EPSG:3116 - MAGNA-SIRGAS / Colombia Bogota Zone
       */
      'EPSG:3116':
        '+proj=tmerc +lat_0=4.596200416666666 +lon_0=-74.07750791666666 +k=1 +x_0=1000000 +y_0=1000000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs',

      /**
       * EPSG:9377 - MAGNA-SIRGAS / Origen Nacional
       * ESTÁNDAR VIGENTE (IGAC Res 471 de 2020).
       */
      'EPSG:9377':
        '+proj=tmerc +lat_0=4 +lon_0=-73 +k=0.9992 +x_0=5000000 +y_0=2000000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs',

      /**
       * EPSG:4686 - MAGNA-SIRGAS (Geográficas)
       * Sistema de referencia oficial de Colombia en latitud/longitud (GRS80).
       */
      'EPSG:4686': '+proj=longlat +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +no_defs',

      /**
       * EPSG:4326 - WGS 84 (Geográficas)
       * Estándar mundial (GPS).
       */
      'EPSG:4326': '+proj=longlat +datum=WGS84 +no_defs',
    };

    const def = crsDefinitions[crsCode];
    if (def) {
      proj4.defs(crsCode, def);
      register(proj4);
      console.info(`CRS ${crsCode} registrado dinámicamente.`);
    } else {
      console.warn(`No se encontró definición para ${crsCode}.`);
    }
  }

  /**
   * Convierte un valor decimal de coordenada (Latitud o Longitud) a formato
   * Grados, Minutos y Segundos (DMS).
   * @param decimal El valor de la coordenada en grados decimales.
   * @param isLat Indica si es Latitud (para usar N/S) o Longitud (para usar E/W).
   * @returns La coordenada en formato DMS (ej: "4° 42' 16" N").
   */
  decimalToDMS(decimal: number, isLat: boolean): string {
    const absolute = Math.abs(decimal);
    const degrees = Math.floor(absolute);
    const minutesFloat = (absolute - degrees) * 60;
    const minutes = Math.floor(minutesFloat);
    // Redondea los segundos para evitar problemas de precisión flotante
    const seconds = Math.round((minutesFloat - minutes) * 60);

    const direction = isLat
      ? decimal >= 0
        ? 'N' // Norte
        : 'S' // Sur
      : decimal >= 0
        ? 'E' // Este
        : 'W'; // Oeste

    return `${degrees}° ${minutes}' ${seconds}" ${direction}`;
  }
}
