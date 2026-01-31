/**
 * Implementación de un reducer para el slice map de REDUX
 *
 * @author Juan Carlos Valderrama González
 */

import { createReducer, on } from '@ngrx/store';
import { MapState } from '@app/core/interfaces/store/map.model';
import { MapActions } from '@app/core/store/map/map.actions';
import { environment } from 'environments/environment';

export const initialState: Readonly<MapState> = {
  map: {
    center:
      environment.map && environment.map.center
        ? (environment.map.center as [number, number])
        : [-74.08175, 4.60971], // Latitud y longitud
    minZoom:
      environment.map && environment.map.minZoom ? environment.map.minZoom : 3, // Zoom minimo
    maxZoom:
      environment.map && environment.map.maxZoom ? environment.map.maxZoom : 19, // Zoom maximo
    projection:
      environment.map && environment.map.projection
        ? environment.map.projection
        : 'EPSG:4326', // Sistema de cordenadas de proyeccion Ejemplo: 'EPSG:4326'
    zoom: environment.map && environment.map.zoom ? environment.map.zoom : 6, // Zoom inicial
  },
  workAreaLayerList: [],
  CapaBaseActive: {
    id: '',
    titulo: '',
    leaf: false,
    thumbnail: '',
  },
  capaBaseList: [
    {
      // Mapa de calles
      id: 'Calles',
      titulo: 'Mapa Calles',
      leaf: true,
      thumbnail: 'assets/images/MapaCalles.PNG', // Ruta de la miniatura del mapa
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer',
    },
    {
      // Mapa topográfico
      id: 'Topografia',
      titulo: 'Mapa Topográfico',
      leaf: true,
      thumbnail: 'assets/images/MapaTopografico.PNG',
      url: 'https://services.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer',
    },
    {
      // Mapa Mixto (educativo/geográfico)
      id: 'mixto',
      titulo: 'Mapa Mixto (educativo/geográfico)',
      leaf: true,
      thumbnail: 'assets/images/MapaMixto.PNG',
      url: 'https://services.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer',
    },
    {
      // Mapa Satelital
      id: 'Satelital',
      titulo: 'Mapa Satelital',
      leaf: true,
      thumbnail: 'assets/images/MapaSatelital.PNG',
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer',
    },
  ],
  proxyURL: environment.map.proxy, // url del proxy para la API
  widgetData: {
    Buffer: {
      urlService: 'https://sigi.cntindigena.org:8443/sigindigena/ServletBuffer',
    },
    MapNavButtons: {
      // Propiedad para valores por defecto de los botones de navegación
      showZoomIn: true, // Muestra el botón Acercar vista del mapa (SIG_OPIAC_001)
      showZoomOut: true, // Muestra el botón alejar vista del mapa (SIG_OPIAC_002)
      showAdvancedZoomIn: true, // Muestra el botón Acercar vista del mapa (SIG_OPIAC_001) Flujo alterno 3
      showAdvancedZoomOut: true, // Muestra el botón alejar vista del mapa (SIG_OPIAC_002) Flujo alterno 3
      showPan: true, //Muestra el botón Panear (CU_SIG_OPIAC_003)
      showResetView: true, // Muestra el botón Vista total del mapa (SIG_OPIAC_004)
      showToggleMouseWheelZoom: false, // Muestra el botón para activar/inactivar el zoom a través del scroll del mouse
      isPanEnabled: false, // Estado inicial de la funcionalidad panear al iniciar el componente
      isMouseWheelZoomEnabled: true, // Estado del botón de la acción de zomm a través del scroll del mouse, al iniciar el componente
      multiClic: true, // Especifica sí el usuario puede dar zoom las veces que de clic sobre el mapa
      initialCenter:
        environment.map && environment.map.center
          ? (environment.map.center as [number, number])
          : [-74.08175, 4.60971], // Latitud y longitud,
      initialZoom:
        environment.map && environment.map.zoom ? environment.map.zoom : 6, // Zoom inicial,
      minZoom:
        environment.map && environment.map.minZoom
          ? environment.map.minZoom
          : 3,
      maxZoom:
        environment.map && environment.map.maxZoom
          ? environment.map.maxZoom
          : 19, // Zoom maximo
      orderZoomIn: 0,
      orderZoomOut: 0,
      orderAdvancedZoomIn: 0,
      orderAdvancedZoomOut: 0,
      orderResetView: 0,
      orderToggleMouseWheelZoom: 0,
      orderPan: 0,
      gapButtons: 2,
      customIconStyles: {
        iconPanEnabled: environment.mapNavButtons.iconPanEnabled,
        iconPanDisabled: environment.mapNavButtons.iconPanDisabled,
        iconZoomIn: environment.mapNavButtons.iconZoomIn,
        iconZoomOut: environment.mapNavButtons.iconZoomOut,
        iconAdvancedZoomIn: environment.mapNavButtons.iconAdvancedZoomIn,
        iconAdvancedZoomOut: environment.mapNavButtons.iconAdvancedZoomOut,
        iconInactiveAdvancedZoom:
          environment.mapNavButtons.iconInactiveAdvancedZoom,
        iconResetView: environment.mapNavButtons.iconResetView,
        iconToggleMouseWheelZoomEnabled:
          environment.mapNavButtons.iconToggleMouseWheelZoomEnabled,
        iconToggleMouseWheelZoomDisabled:
          environment.mapNavButtons.iconToggleMouseWheelZoomDisabled,
      },
    },
  },
  geometryidentified: { geometry: null, layerName: '' },
  layerListContentTable: [],
  history: {
    past: [],
    present: null,
    future: [],
  },
};

export const mapReducer = createReducer(
  initialState,
  on(
    MapActions.addMapParameters,
    (state, { center, minZoom, maxZoom, projection, zoom }) => {
      // TODO: eliminar por que no se usa, se colocó para construir los archivos de redux
      return {
        ...state,
        map: {
          center,
          minZoom,
          maxZoom,
          projection,
          zoom,
        },
      };
    }
  ),
  //adicionar una capa a la lista de redux
  on(MapActions.addLayerToMap, (state, { layer }) => {
    const updatedLayer = { ...layer.layerDefinition, checked: true };
    // Se hace una copia de la lista de capas con el objeto actualizado
    const workAreaLayerList = [
      {
        ...layer,
        layerDefinition: updatedLayer,
        orderInMap: 1, // Primero en la lista
      },
      // Recalcular el orden del resto de capas
      ...state.workAreaLayerList.map((l, i) => ({
        ...l,
        orderInMap: i + 2, // Reajustar los índices
      })),
    ];
    return {
      ...state,
      workAreaLayerList: workAreaLayerList,
    };
  }),
  //adicionar una capa a la lista de redux
  on(MapActions.deleteLayerOfMap, (state, { layer }) => {
    // Se hace copia de la lista de capas y se filtra la capa que se desea eliminar
    const updatedLayerList = state.workAreaLayerList.filter(
      layerOnList => layerOnList.layerDefinition.id !== layer.id
    );
    return {
      ...state,
      workAreaLayerList: updatedLayerList, // Devolvemos el nuevo array sin la capa eliminada
    };
  }),
  on(MapActions.showOrHideLayerOfMap, (state, { layer }) => {
    // Se busca la capa en la lista y se cambia el estado de visibilidad
    const updatedLayerList = state.workAreaLayerList.map(item => {
      if (item.layerDefinition.id === layer.id) {
        return {
          ...item,
          isVisible: !item.isVisible,
        };
      }
      return item;
    });
    return {
      ...state,
      workAreaLayerList: updatedLayerList,
    };
  }),
  on(MapActions.setLayerTransparency, (state, { layer, transparencyLevel }) => {
    // Se agrega capa activa
    const updatedLayerList = state.workAreaLayerList.map(item => {
      if (item.layerDefinition.id === layer.id) {
        return {
          ...item,
          transparencyLevel: transparencyLevel,
        };
      }
      return item;
    });
    return {
      ...state,
      workAreaLayerList: updatedLayerList,
    };
  }),
  on(MapActions.updateBaseMapCapa, (state, { layer }) => {
    // Se actualiza el mapa base activo
    const updatedLayerList = layer;
    return {
      ...state,
      CapaBaseActive: updatedLayerList,
    };
  }),
  on(MapActions.setWidgetAttributeTableData, (state, { widgetId, data }) => {
    return {
      ...state,
      widgetData: {
        ...state.widgetData,
        [widgetId]: data,
      },
    };
  }),
  on(MapActions.turnOnOrOffAllLayers, (state, { stateLayer }) => {
    //se recorre la lista de capas del area de trabajo y se ajusta la visibilidad de las capas
    const updatedLayers = state.workAreaLayerList.map(layer => ({
      ...layer,
      isVisible: stateLayer,
    }));
    //se retorna el estado y se asignan las capas modificadas
    return { ...state, workAreaLayerList: updatedLayers };
  }),
  on(MapActions.updateLayerOrder, (state, { layers }) => {
    const updatedLayers = layers.map((layer, index) => {
      if (layer) {
        return { ...layer, orderInMap: index + 1 };
      }
      return layer;
    });

    return { ...state, workAreaLayerList: updatedLayers };
  }),
  on(MapActions.addGeometryIdentified, (state, { geometryIdentified }) => {
    return { ...state, geometryidentified: geometryIdentified };
  }),
  on(MapActions.setWidgetNavButtonsData, (state, { widgetId, data }) => {
    return {
      ...state,
      widgetData: {
        ...state.widgetData,
        [widgetId]: data,
      },
    };
  }),
  on(MapActions.setContentTableLayerList, (state, { layerList }) => {
    return {
      ...state,
      layerListContentTable: layerList,
      workAreaLayerList: [],
    };
  }),
  on(MapActions.deleteGeometryIdentified, state => {
    return { ...state, geometryidentified: undefined };
  }),
  //Historial de navegación
  on(MapActions.addHistoryEntry, (state, { snapshot }) => {
    const { past, present } = state.history;
    const isSame =
      !!present &&
      present.zoom === snapshot.zoom &&
      present.rotation === snapshot.rotation &&
      present.center[0] === snapshot.center[0] &&
      present.center[1] === snapshot.center[1];

    if (isSame) {
      return state;
    }

    return {
      ...state,
      history: {
        past: present ? [...past, present] : past,
        present: snapshot,
        future: [],
      },
    };
  }),
  on(MapActions.goBackView, state => {
    if (state.history.past.length === 0) return state;

    const previous = state.history.past[state.history.past.length - 1];

    return {
      ...state,
      history: {
        past: state.history.past.slice(0, -1),
        present: previous,
        future: state.history.present
          ? [state.history.present, ...state.history.future]
          : state.history.future,
      },
    };
  }),
  on(MapActions.goForwardView, state => {
    if (state.history.future.length === 0) return state;

    const next = state.history.future[0];

    return {
      ...state,
      history: {
        past: state.history.present
          ? [...state.history.past, state.history.present]
          : state.history.past,
        present: next,
        future: state.history.future.slice(1),
      },
    };
  }),
  on(MapActions.clearHistoryView, state => ({
    ...state,
    history: {
      past: [],
      present: null,
      future: [],
    },
  }))
);
