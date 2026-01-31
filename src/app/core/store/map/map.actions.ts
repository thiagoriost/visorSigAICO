/**
 * Acciones para el slice map de redux
 *
 * @author Juan Carlos Valderrama González
 */
import { CapaMapa } from '@app/core/interfaces/AdminGeo/CapaMapa';
import { CapaMapaBase } from '@app/core/interfaces/CapaMapaBase';
import { LayerStore } from '@app/core/interfaces/store/LayerStore';
import { AttributeTableData } from '@app/widget/attributeTable/interfaces/geojsonInterface';
import { MapNavButtonsInterface } from '@app/widget/map-nav-buttons/interfaces/map-nav-buttons.interface';
import { GeometryIdentified } from '@app/widget/identify/interfaces/GeometryIdentified';
import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { MapViewSnapshot } from '@app/widget/map-nav-buttons/interfaces/map-history.interface';

export const MapActions = createActionGroup({
  source: 'General',
  events: {
    'Add Map Parameters': props<{
      center: [number, number]; // Coordenadas del centro del mapa (latitud, longitud)
      minZoom: number; // Nivel de zoom mínimo
      maxZoom: number; // Nivel de zoom máximo
      projection: string; // Sistema de coordenadas de proyección (Ejemplo: 'EPSG:4326')
      zoom: number; // Nivel de zoom inicial
    }>(),
    'Add Layer To Map': props<{ layer: LayerStore }>(), //adiciona la capa al mapa
    'Delete Layer Of Map': props<{ layer: CapaMapa }>(), //elimina la capa del mapa
    'Show Or Hide Layer Of Map': props<{ layer: CapaMapa }>(), //muestra u oculta la capa del mapa
    'Set Layer Transparency': props<{
      layer: CapaMapa;
      transparencyLevel: number;
    }>(), //generar transparencia en la capa
    'Update Base Map Capa': props<{ layer: CapaMapaBase }>(), //Cambiar la capa al mapa base
    'Set Widget Attribute Table Data': props<{
      widgetId: string;
      data: AttributeTableData;
    }>(),
    'Set Widget NavButtons Data': props<{
      widgetId: string;
      data: MapNavButtonsInterface;
    }>(),
    'Turn on or off all layers': props<{ stateLayer: boolean }>(),
    'Update Layer Order': props<{ layers: LayerStore[] }>(),
    addGeometryIdentified: props<{
      geometryIdentified: GeometryIdentified;
    }>(),
    SetContentTableLayerList: props<{ layerList: CapaMapa[] }>(), //actualiza la lista de capas en la tabla de contenido
    'delete geometry identified': emptyProps(),
    'Add History Entry': props<{ snapshot: MapViewSnapshot }>(),
    'Go Back View': emptyProps(),
    'Go Forward View': emptyProps(),
    'Clear History View': emptyProps(),
  },
});
