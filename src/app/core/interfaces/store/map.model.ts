import { LayerStore } from '@app/core/interfaces/store/LayerStore';
import { CapaMapaBase } from '../CapaMapaBase';
import { GeometryIdentified } from '@app/widget/identify/interfaces/GeometryIdentified';
import { CapaMapa } from '../AdminGeo/CapaMapa';
import { MapViewSnapshot } from '@app/widget/map-nav-buttons/interfaces/map-history.interface';

export interface MapHistoryState {
  past: MapViewSnapshot[];
  present: MapViewSnapshot | null;
  future: MapViewSnapshot[];
}

export interface MapState {
  map: {
    // Propiedades para aplicar al mapa
    center: [number, number]; // Latitud y longitud
    minZoom: number; // Zoom minimo
    maxZoom: number; // Zoom maximo
    projection: string; // Sistema de cordenadas de proyeccion Ejemplo: 'EPSG:4326'
    zoom: number; // Zoom inicial
  };
  workAreaLayerList: LayerStore[]; //lista de capas en el área de trabajo
  capaBaseList: CapaMapaBase[]; //lista de mapas base disponibles
  CapaBaseActive: CapaMapaBase;
  proxyURL: string; // url del proxy
  widgetData: Record<string, unknown>;
  geometryidentified: GeometryIdentified | undefined;
  layerListContentTable: CapaMapa[]; //ista de capas en la tabla de contenido
  history: MapHistoryState; // Historial de navegación
}
