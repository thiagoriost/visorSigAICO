import { createReducer, on } from '@ngrx/store';
import * as actions from './user-interface.actions';
import {
  ItemWidgetState,
  UserInterfaceState,
  ActionsMapNavButtons,
} from '@app/core/interfaces/store/user-interface.model';

/**
 * @description Implementación de métodos para las acciones definidas en el reducer de la interfaz de usuario.
 * @author Carlos Javier Muñoz Fernández
 * @date 05/12/2024
 */

/**
 * @constant initialUserInterfaceState
 * @type {Readonly<UserInterfaceState>}
 * @description Estado inicial de la interfaz de usuario, con una lista vacía de widgets.
 */
export const initialUserInterfaceState: Readonly<UserInterfaceState> = {
  widgets: [],
  overlayWidgets: [],
  singleComponentNombreWidget: undefined,
  initialFloatingWindowConfig: {
    x: 67, // Posición X-left inicial (67 píxeles desde el borde izquierdo)
    y: 17, // Posición Y-top inicial (17 píxeles desde el borde superior)
    width: 250, // Ancho (píxeles) por defecto de la ventana, siendo el limite mínimo hasta donde se puede redimensionar la ventana
    height: 250, // Alto máximo (píxeles) de la ventana, siendo el limite mínimo hasta donde se puede redimensionar la ventana
    maxWidth: undefined, // Ancho máximo hasta donde se puede redimensionar la ventana, si no se define será infinito.
    maxHeight: undefined, // Alto máximo hasta donde se puede redimensionar la ventana, si no se define será infinito.
    enableMinimize: true, // Habilitar la opción de minimizar la ventana
    enableResize: true, // Habilitar la opción de redimensionar la ventana
    enableClose: true, // Habilitar la opción de cerrar la ventana
    enableDrag: true, // Habilitar la opción de arrastrar la ventana
  },
  actionsMapNavButtons: {
    isDrawingZoomBox: false,
    isPaning: false,
    isAdvancedZoomInActive: false,
    isAdvancedZoomOutActive: false,
  },
  floatingWindowsOrder: [],
};

export const initialActionsMapNavButtonsState: ActionsMapNavButtons = {
  isDrawingZoomBox: false,
  isPaning: false,
  isAdvancedZoomInActive: false,
  isAdvancedZoomOutActive: false,
};

/**
 * @function userInterfaceReducer
 * @description Reducer para manejar el estado de la interfaz de usuario basado en las acciones definidas.
 * @param {UserInterfaceState} state - El estado actual de la interfaz de usuario.
 * @param {Action} action - La acción despachada que puede modificar el estado.
 * @returns {UserInterfaceState} El nuevo estado de la interfaz de usuario.
 */
export const userInterfaceReducer = createReducer(
  initialUserInterfaceState,
  on(
    actions.initialUserInterfaceWidgetStatus,
    (state, { initialUserInterfaceWidgetStatus }): UserInterfaceState => {
      return { ...state, widgets: [...initialUserInterfaceWidgetStatus] };
    }
  ),
  on(actions.AbrirWidget, (state, { nombre, estado }): UserInterfaceState => {
    /**
     * @description Modifica el estado de visibilidad de un widget específico.
     * @param {string} nombre - El nombre del widget a modificar.
     * @param {boolean} estado - El nuevo estado de visibilidad del widget.
     * @returns {UserInterfaceState} El nuevo estado con el widget modificado.
     */
    const widgetMutados: ItemWidgetState[] = state.widgets.map(widget => {
      if (widget.nombreWidget === nombre && widget.abierto !== estado) {
        return {
          ...widget,
          abierto: estado,
        };
      } else {
        return widget;
      }
    });
    return {
      ...state,
      widgets: widgetMutados,
    };
  }),
  // SetSingleComponentWidget
  on(
    actions.SetSingleComponentWidget,
    (state, { nombre }): UserInterfaceState => {
      /**
       * @description Establece el nombre del widget que se debe abrir como single-component.
       * @param {string | undefined} nombre - El nombre del widget a abrir como single-component, puede ser undefined si no hay widget.
       * @returns {UserInterfaceState} El nuevo estado con el nombre del widget single-component actualizado.
       */
      return {
        ...state,
        singleComponentNombreWidget: nombre,
      };
    }
  ),
  on(
    actions.SetOverlayWidgets,
    (state, { overlayWidgets }): UserInterfaceState => {
      /**
       * @description Establece el estado de los widgets de superposición.
       * @param {ItemWidgetState[]} overlayWidgets - El estado de los widgets de superposición.
       * @returns {UserInterfaceState} El nuevo estado con los widgets de superposición actualizados.
       */
      return { ...state, overlayWidgets: [...overlayWidgets] };
    }
  ),
  on(
    actions.AbrirOverlayWidget,
    (state, { nombre, estado }): UserInterfaceState => {
      /**
       * @description Modifica el estado de visibilidad de un widget de superposición específico.
       * @param {string} nombre - El nombre del widget de superposición a modificar.
       * @param {boolean} estado - El nuevo estado de visibilidad del widget de superposición.
       * @returns {UserInterfaceState} El nuevo estado con el widget de superposición modificado.
       */
      const overlayWidgetsMutados: ItemWidgetState[] = state.overlayWidgets.map(
        widget => {
          if (widget.nombreWidget === nombre && widget.abierto !== estado) {
            return {
              ...widget,
              abierto: estado,
            };
          } else {
            return widget;
          }
        }
      );
      return {
        ...state,
        overlayWidgets: overlayWidgetsMutados,
      };
    }
  ),

  //mapNavButtos
  on(actions.setPaning, (state, { isPaning }) => ({
    ...state,
    actionsMapNavButtons: {
      ...state.actionsMapNavButtons,
      isPaning,
    },
  })),
  on(
    actions.setZoomModes,
    (
      state,
      { isAdvancedZoomInActive, isAdvancedZoomOutActive, isDrawingZoomBox }
    ) => ({
      ...state,
      actionsMapNavButtons: {
        ...state.actionsMapNavButtons,
        isAdvancedZoomInActive,
        isAdvancedZoomOutActive,
        isDrawingZoomBox,
      },
    })
  ),
  on(actions.bringFloatingWindowToFront, (state, { id }) => {
    const order = state.floatingWindowsOrder.filter(wid => wid !== id);
    return {
      ...state,
      floatingWindowsOrder: [id, ...order], // la ventana activa queda arriba
    };
  }),
  on(actions.removeFloatingWindow, (state, { id }) => {
    return {
      ...state,
      floatingWindowsOrder: state.floatingWindowsOrder.filter(
        wid => wid !== id
      ),
    };
  })
);
