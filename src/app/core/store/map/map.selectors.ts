import { createSelector, createFeatureSelector } from '@ngrx/store';
import { MapState } from '@app/core/interfaces/store/map.model';
import { AttributeTableData } from '@app/widget/attributeTable/interfaces/geojsonInterface';

export interface ExportMapDefaults {
  title: string;
  author: string;
  showGrid: boolean;
  includeLegend: boolean;
  orientation: 'horizontal' | 'vertical';
}

export const selectMapState = createFeatureSelector<Readonly<MapState>>('map');

export const selectMapParameters = createSelector(
  selectMapState,
  (state: MapState) => state.map
);

/**
 * Retorna la lista de capas del mapa ordenadas por el orden en que fueron agregadas
 */
export const selectWorkAreaLayerList = createSelector(
  selectMapState,
  (state: MapState) => [...state.workAreaLayerList]
);
/**
 * Retorna la lista de mapas base disponibles
 */
export const selectMapaBaseList = createSelector(
  selectMapState,
  (state: MapState) => [...state.capaBaseList]
);
/**
 * Retorna el mapa base activo
 */
export const selectMapaBaseActive = createSelector(
  selectMapState,
  (state: MapState) => state.CapaBaseActive
);

/**
 * Retorna la url del proxy
 */
export const selectProxyURL = createSelector(
  selectMapState,
  (state: MapState) => state.proxyURL
);

export const selectAttributeTableData = (widgetId: string) =>
  createSelector(
    selectMapState,
    (state: MapState) => state.widgetData[widgetId] as AttributeTableData
  );

export const selectWidgetData = (widgetId: string) =>
  createSelector(selectMapState, state => state.widgetData[widgetId]);

export const selectIdentifiedGeometry = createSelector(
  selectMapState,
  (state: MapState) => state.geometryidentified
);
export const selectVisibleLayers = createSelector(
  selectWorkAreaLayerList,
  layers => layers.filter(layer => layer.isVisible)
);

export const selectLayerListContentTable = createSelector(
  selectMapState,
  (state: MapState) => state.layerListContentTable
);

//Historial de navegación
export const selectHistory = createSelector(
  selectMapState,
  state => state.history
);

export const selectHistoryPresent = createSelector(
  selectHistory,
  history => history.present
);

export const selectCanGoBack = createSelector(
  selectHistory,
  history => history.past.length > 0
);

export const selectCanGoForward = createSelector(
  selectHistory,
  history => history.future.length > 0
);
