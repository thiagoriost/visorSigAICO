import { Injectable } from '@angular/core';
import { MapasBase } from '@app/core/interfaces/enums/MapasBase.enum';
import { MapaBaseConfig } from '@app/shared/Interfaces/mapa-base/mapa-base-config';
import { MapaBaseInterface } from '@app/shared/Interfaces/mapa-base/mapa-base-interface';
import TileLayer from 'ol/layer/Tile';
import XYZ from 'ol/source/XYZ';

@Injectable({
  providedIn: 'root',
})
/**
 * Servicio encargado de gestionar y proveer configuraciones de mapas base en OpenLayers.
 *
 * - Centraliza la configuración de URLs y atribuciones de los proveedores.
 * - Provee métodos para instanciar capas base como `TileLayer`.
 * - Expone utilidades para obtener listas de opciones listas para usar en dropdowns (UI).
 */
export class MapaBaseService {
  /**
   * Diccionario de atribuciones agrupadas por proveedor.
   * Usado en la construcción de las capas base.
   */
  private readonly attributions: Record<
    | 'GOOGLE'
    | 'ESRI'
    | 'OSM'
    | 'CARTO'
    | 'WAZE'
    | 'YANDEX'
    | 'OPENTOPOMAP'
    | 'OPNVKARTE',
    string
  > = {
    GOOGLE: 'Google',
    ESRI: 'Esri, HERE, Garmin, USGS, NGA, NASA, CGIAR, N Robinson, NCEAS, NLS, OS, NMA, Geodatastyrelsen, Rijkswaterstaat, GSA, Census, and the GIS user community',
    OSM: 'OpenStreetMap contributors',
    CARTO: 'CartoDB, OpenStreetMap contributors',
    WAZE: 'Waze',
    YANDEX: 'Yandex',
    OPENTOPOMAP: 'OpenTopoMap (CC-BY-SA), OpenStreetMap contributors',
    OPNVKARTE: 'Öpnvkarte, OpenStreetMap contributors',
  };

  /**
   * Diccionario de títulos "amigables" para UI (labels de dropdown).
   */
  private readonly titles: Record<MapasBase, string> = {
    [MapasBase.ESRI_GRAY_DARK]: 'Esri Gris Oscuro',
    [MapasBase.ESRI_GRAY_LIGHT]: 'Esri Gris Claro',
    [MapasBase.ESRI_NATGEO]: 'Esri NatGeo',
    [MapasBase.ESRI_OCEAN]: 'Esri Océanos',
    [MapasBase.ESRI_SATELLITE]: 'Esri Satélite',
    [MapasBase.ESRI_SHADED_RELIEF]: 'Esri Relieve Sombreado',
    [MapasBase.ESRI_STANDARD]: 'Esri Estándar',
    [MapasBase.ESRI_TOPO]: 'Esri Topográfico',

    [MapasBase.GOOGLE_HYBRID]: 'Google Híbrido',
    [MapasBase.GOOGLE_ROAD]: 'Google Carreteras',
    [MapasBase.GOOGLE_SATELLITE]: 'Google Satélite',
    [MapasBase.GOOGLE_TERRAIN]: 'Google Terreno',

    [MapasBase.DARK_MATTER]: 'Carto Dark Matter',
    [MapasBase.POSITRON]: 'Carto Positron',

    [MapasBase.WAZE_WORLD]: 'Waze World',
    [MapasBase.YANDEX_SATELLITE]: 'Yandex Satélite',

    [MapasBase.OSM_STANDARD]: 'OpenStreetMap',
    [MapasBase.OPENTOPOMAP]: 'OpenTopoMap',
    [MapasBase.OPNVKARTE]: 'Öpnvkarte',
    [MapasBase.OSM]: '',
  };

  // Configuración de mapas base (solo name + url)
  private readonly mapBaseConfigs: Omit<MapaBaseConfig, 'attribution'>[] = [
    // --- Esri ---
    {
      name: MapasBase.ESRI_GRAY_DARK,
      url: 'https://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
    },
    {
      name: MapasBase.ESRI_GRAY_LIGHT,
      url: 'https://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}',
    },
    {
      name: MapasBase.ESRI_NATGEO,
      url: 'https://services.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}',
    },
    {
      name: MapasBase.ESRI_OCEAN,
      url: 'https://services.arcgisonline.com/ArcGIS/rest/services/Ocean/World_Ocean_Base/MapServer/tile/{z}/{y}/{x}',
    },
    {
      name: MapasBase.ESRI_SATELLITE,
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    },
    {
      name: MapasBase.ESRI_SHADED_RELIEF,
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Shaded_Relief/MapServer/tile/{z}/{y}/{x}',
    },
    {
      name: MapasBase.ESRI_STANDARD,
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
    },
    {
      name: MapasBase.ESRI_TOPO,
      url: 'https://services.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
    },

    // --- Google ---
    {
      name: MapasBase.GOOGLE_HYBRID,
      url: 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
    },
    {
      name: MapasBase.GOOGLE_ROAD,
      url: 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
    },
    {
      name: MapasBase.GOOGLE_SATELLITE,
      url: 'https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
    },
    {
      name: MapasBase.GOOGLE_TERRAIN,
      url: 'https://mt1.google.com/vt/lyrs=p&x={x}&y={y}&z={z}',
    },

    // --- Carto ---
    {
      name: MapasBase.DARK_MATTER,
      url: 'https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
    },
    {
      name: MapasBase.POSITRON,
      url: 'https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
    },

    // --- Otros ---
    {
      name: MapasBase.WAZE_WORLD,
      url: 'https://worldtiles3.waze.com/tiles/{z}/{x}/{y}.png',
    },
    {
      name: MapasBase.YANDEX_SATELLITE,
      url: 'https://sat04.maps.yandex.net/tiles?l=sat&x={x}&y={y}&z={z}',
    },
    {
      name: MapasBase.OSM_STANDARD,
      url: 'http://tile.openstreetmap.org/{z}/{x}/{y}.png',
    },
    {
      name: MapasBase.OPENTOPOMAP,
      url: 'https://a.tile.opentopomap.org/{z}/{x}/{y}.png',
    },
    {
      name: MapasBase.OPNVKARTE,
      url: 'https://tileserver.memomaps.de/tilegen/{z}/{x}/{y}.png',
    },
  ];

  /**
   * Obtiene la atribución correspondiente según el nombre del mapa base.
   * @param name nombre del mapa base (enum `MapasBase`)
   * @returns atribución como string
   */
  private getAttribution(name: MapasBase): string {
    if (name.startsWith('GOOGLE')) return this.attributions['GOOGLE'];
    if (name.startsWith('ESRI')) return this.attributions['ESRI'];

    switch (name) {
      case MapasBase.DARK_MATTER:
      case MapasBase.POSITRON:
        return this.attributions['CARTO'];
      case MapasBase.OSM_STANDARD:
        return this.attributions['OSM'];
      case MapasBase.OPENTOPOMAP:
        return this.attributions['OPENTOPOMAP'];
      case MapasBase.OPNVKARTE:
        return this.attributions['OPNVKARTE'];
      case MapasBase.WAZE_WORLD:
        return this.attributions['WAZE'];
      case MapasBase.YANDEX_SATELLITE:
        return this.attributions['YANDEX'];
      default:
        return '';
    }
  }

  /**
   * Devuelve las capas base instanciadas en OpenLayers.
   * @returns Array de objetos `MapaBaseInterface`
   */
  getMapBases(): MapaBaseInterface[] {
    return this.mapBaseConfigs.map(cfg => ({
      name: cfg.name,
      title: this.titles[cfg.name] ?? cfg.name,
      layer: new TileLayer({
        source: new XYZ({
          url: cfg.url,
          attributions: this.getAttribution(cfg.name),
        }),
      }),
    }));
  }

  /**
   * Obtiene una capa base instanciada en OpenLayers según su nombre.
   * @param name nombre de la capa base (enum `MapasBase`)
   * @returns instancia de `TileLayer` o `null` si no existe
   */
  getLayerByName(name: MapasBase): TileLayer | null {
    const cfg = this.mapBaseConfigs.find(c => c.name === name);
    if (!cfg) return null;

    return new TileLayer({
      source: new XYZ({
        url: cfg.url,
        attributions: this.getAttribution(cfg.name),
      }),
    });
  }

  // Métodos nuevos para opciones de UI -----------------------------

  /**
   * Devuelve todas las opciones de mapas base listas para usarse en un dropdown.
   *
   * @example
   * ```ts
   * this.mapaBaseService.getAllMapOptions();
   * // [
   * //   { label: 'Google Satélite', value: MapasBase.GOOGLE_SATELLITE },
   * //   { label: 'OSM', value: MapasBase.OSM_STANDARD },
   * //   ...
   * // ]
   * ```
   */
  getAllMapOptions(): { label: string; value: MapasBase }[] {
    return this.mapBaseConfigs.map(cfg => ({
      label: this.titles[cfg.name] ?? cfg.name,
      value: cfg.name,
    }));
  }

  /**
   * Devuelve un subconjunto filtrado de opciones de mapas base.
   *
   * @param filtro función que recibe una opción (`{ label, value }`) y retorna `true` si debe incluirse.
   * @returns Array filtrado de opciones
   *
   * @example
   * ```ts
   * // Solo mapas de Google
   * this.mapaBaseService.getFilteredMapOptions(opt => opt.value.toString().startsWith('GOOGLE'));
   *
   * // Google + OSM
   * this.mapaBaseService.getFilteredMapOptions(
   *   opt => opt.value.toString().startsWith('GOOGLE') || opt.value === MapasBase.OSM_STANDARD
   * );
   * ```
   */
  getFilteredMapOptions(
    filtro: (map: { label: string; value: MapasBase }) => boolean
  ): { label: string; value: MapasBase }[] {
    const allOptions = this.getAllMapOptions();
    return filtro ? allOptions.filter(filtro) : allOptions;
  }
}
