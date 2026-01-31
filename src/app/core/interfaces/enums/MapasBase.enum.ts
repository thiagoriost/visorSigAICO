/**
 * @description Enumerado con los tipos de capas base disponibles en el visor y el mini-mapa.
 * Cada opción representa un estilo de mapa base que puede asignarse dinámicamente.
 * Se debe mantener sincronizado con las fuentes definidas en los servicios que lo usen.
 *
 * Ejemplo de uso:
 *   this.miniMapService.setBaseLayer(MapasBase.SATELITE);
 * @author Carlos Alberto Aristizabal Vargas
 * @date 10/09/2025
 * @enum {string}
 */
export enum MapasBase {
  ESRI_GRAY_DARK = 'esri_gray_dark',
  ESRI_GRAY_LIGHT = 'esri_gray_light',
  ESRI_NATGEO = 'esri_natgeo',
  ESRI_OCEAN = 'esri_ocean',
  ESRI_SATELLITE = 'esri_satellite',
  ESRI_SHADED_RELIEF = 'esri_shaded_relief',
  ESRI_STANDARD = 'esri_standard',
  ESRI_TOPO = 'esri_topo',

  GOOGLE_HYBRID = 'google_hybrid',
  GOOGLE_ROAD = 'google_road',
  GOOGLE_SATELLITE = 'google_satellite',
  GOOGLE_TERRAIN = 'google_terrain',

  DARK_MATTER = 'dark_matter',
  POSITRON = 'positron',

  WAZE_WORLD = 'waze_world',
  YANDEX_SATELLITE = 'yandex_satellite',

  OSM_STANDARD = 'osm_standard',
  OPENTOPOMAP = 'opentopomap',
  OPNVKARTE = 'opnvkarte',
  OSM = 'OSM',
}

export function stringToMapasBase(mapName: string): MapasBase | undefined {
  if (Object.values(MapasBase).includes(mapName as MapasBase)) {
    return mapName as MapasBase;
  }
  return undefined;
}
