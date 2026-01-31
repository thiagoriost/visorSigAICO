/**
 * @description Selector de la interfaz de usuario.
 * @author Carlos Javier Muñoz Fernández
 * @date 05/12/2024
 */
//Módulos NGRX
import { createSelector, createFeatureSelector } from '@ngrx/store';
import { UserInterfaceState } from '@app/core/interfaces/store/user-interface.model';
import { ItemWidgetState } from '@app/core/interfaces/store/user-interface.model';

/**
 * @description Selector para obtener el estado completo de la interfaz de usuario.
 * @returns {Readonly<UserInterfaceState>} El estado de la interfaz de usuario.
 */
export const selectUserInterfaceComponent =
  createFeatureSelector<Readonly<UserInterfaceState>>('userInterface');

/**
 * @description Selector para obtener la lista de widgets del estado de la interfaz de usuario.
 * @returns {ItemWidgetState[]} La lista de widgets.
 */
export const selectWidgetsUserInterfaceStatus = createSelector(
  selectUserInterfaceComponent,
  (state: UserInterfaceState) => state.widgets
);

/**
 * @description Selector para obtener los widgets que están abiertos.
 * @returns {ItemWidgetState[]} La lista de widgets que están abiertos.
 */
export const selectWidgetOpened = createSelector(
  selectUserInterfaceComponent,
  (state: UserInterfaceState) =>
    state.widgets.filter(widget => widget.abierto == true)
);

/**
 * @description Selector para obtener el nombre del widget abierto single render
 * @returns {string|undefined} Nombre del widget abierto sigle render.
 */
export const selectWidgetOpenedSingleRender = createSelector(
  selectUserInterfaceComponent,
  (state: UserInterfaceState) => state.singleComponentNombreWidget
);

/**
 * @description Selector para identificar si hay un widget abierto en single render.
 * @returns {boolean} Verdadero si hay un widget abierto en single render, falso en caso contrario.
 */
export const selectIsWidgetOpenedSingleRender = createSelector(
  selectUserInterfaceComponent,
  (state: UserInterfaceState) => !!state.singleComponentNombreWidget
);

/**
 * @description Selector para obtener el estado de un widget específico por su nombre.
 * @param {string} nombre - El nombre del widget a buscar.
 * @returns {ItemWidgetState | undefined} El estado del widget si se encuentra, undefined en caso contrario.
 */
export const selectConfigWidgetOpenedSingleRender = createSelector(
  selectUserInterfaceComponent,
  (state: UserInterfaceState) =>
    state.widgets.find(
      widget => widget.nombreWidget === state.singleComponentNombreWidget
    )
);

/**
 * @description recupera initialFloatingWindowConfig
 * @returns {initialFloatingWindowConfig}
 *
 */
export const selectInitialFloatingWindowConfig = createSelector(
  selectUserInterfaceComponent,
  (state: UserInterfaceState) => state.initialFloatingWindowConfig
);

/**
 * @description Recupera el estado de visibilidad de un widget por su nombre.
 * @param {string} nombre - El nombre del widget a buscar.
 * @returns {boolean} Verdadero si el widget esta abierto, falso en caso contrario.
 */
export const selectWidgetStatus = (nombre: string) =>
  createSelector(
    selectUserInterfaceComponent,
    (state: UserInterfaceState) =>
      state.widgets.find(widget => widget.nombreWidget === nombre)?.abierto
  );

/**
 * @description Recuperar la configuración de un widget por su nombre.
 * @param {string} nombre - El nombre del widget a buscar.
 * @returns {ItemWidgetState | undefined} La configuración del widget si se encuentra, undefined en caso contrario.
 */
export const selectWidgetConfig = (nombre: string) =>
  createSelector(selectUserInterfaceComponent, (state: UserInterfaceState) =>
    state.widgets.find(widget => widget.nombreWidget === nombre)
  );

/**
 * @description permite consultar desde cualquier parte del código si un widget específico está abierto.
 * @param {string} nombre - El nombre del widget a buscar.
 * @returns {ItemWidgetState | undefined} La configuración del widget si se encuentra y si el widget esta abierto.
 */
export const selectWidgetAbierto = (nombre: string) =>
  createSelector(
    selectUserInterfaceComponent,
    (state: UserInterfaceState) =>
      state.widgets.find((w: ItemWidgetState) => w.nombreWidget === nombre)
        ?.abierto === true
  );

/**
 * @description Recupera el estado de visibilidad de un widget de superposición por su nombre.
 * @param {string} nombre - El nombre del widget de superposición a buscar.
 * @returns {boolean} Verdadero si el widget de superposición esta abierto, falso en caso contrario.
 */
export const selectOverlayWidgetStatus = (nombre: string) =>
  createSelector(
    selectUserInterfaceComponent,
    (state: UserInterfaceState) =>
      state.overlayWidgets.find(widget => widget.nombreWidget === nombre)
        ?.abierto
  );

/**
 * @description Recuperar la configuración de un widget de superposición por su nombre.
 * @param {string} nombre - El nombre del widget de superposición a buscar.
 * @returns {ItemWidgetState | undefined} La configuración del widget de superposición si se encuentra, undefined en caso contrario.
 */
export const selectOverlayWidgetConfig = (nombre: string) =>
  createSelector(selectUserInterfaceComponent, (state: UserInterfaceState) =>
    state.overlayWidgets.find(widget => widget.nombreWidget === nombre)
  );

/**
 * @description Selector que obtiene los nombres de los widgets activos (abiertos) actualmente.
 * @returns {string[]} Lista con los nombres de los widgets cuyo estado `abierto` es verdadero.
 */
export const selectNombreWidgetsActivos = createSelector(
  selectUserInterfaceComponent,
  (state: UserInterfaceState) =>
    state.widgets
      .filter(widget => widget.abierto === true)
      .map(widget => widget.nombreWidget)
);

/**
 * @description Selector que obtiene el estado actual del modo de dibujo del rectángulo de zoom (Zoom Box).
 * Indica si la herramienta de zoom avanzado está activa y el usuario está seleccionando un área en el mapa.
 * @returns {boolean} `true` si el modo de dibujo de zoom está activo, `false` en caso contrario.
 */
export const selectIsDrawingZoomBox = createSelector(
  selectUserInterfaceComponent,
  state => state.actionsMapNavButtons.isDrawingZoomBox
);

/**
 * @description Selector que obtiene el estado actual del modo de paneo del mapa.
 * Indica si el usuario puede desplazar el mapa arrastrándolo con el mouse.
 * @returns {boolean} `true` si el modo de paneo está activo, `false` en caso contrario.
 */
export const selectIsPaning = createSelector(
  selectUserInterfaceComponent,
  state => state.actionsMapNavButtons.isPaning
);

/**
 * @description Selector que obtiene el estado del modo de "Zoom avanzado hacia adentro".
 * Este modo permite al usuario acercar una región específica del mapa seleccionando un área.
 * @returns {boolean} `true` si el zoom avanzado de acercamiento está activo, `false` en caso contrario.
 */
export const selectIsAdvancedZoomInActive = createSelector(
  selectUserInterfaceComponent,
  state => state.actionsMapNavButtons.isAdvancedZoomInActive
);

/**
 * @description Selector que obtiene el estado del modo de "Zoom avanzado hacia afuera".
 * Este modo permite al usuario alejar una región específica del mapa seleccionando un área.
 * @returns {boolean} `true` si el zoom avanzado de alejamiento está activo, `false` en caso contrario.
 */
export const selectIsAdvancedZoomOutActive = createSelector(
  selectUserInterfaceComponent,
  state => state.actionsMapNavButtons.isAdvancedZoomOutActive
);

/**
 * @description Selector que obtiene el estado de las acciones
 * Este modo permite al usuario alejar una región específica del mapa seleccionando un área.
 * @returns {boolean} `true` si el zoom avanzado de alejamiento está activo, `false` en caso contrario.
 */
export const selectActionsMapNavButtons = createSelector(
  selectUserInterfaceComponent,
  state => state.actionsMapNavButtons
);

/**
 * Selector que calcula dinámicamente el z-index correspondiente
 * a una ventana flotante específica, basado en su posición dentro
 * del arreglo `floatingWindowsOrder`.
 *
 * El z-index se deriva de un valor base decreciente, de forma que
 * la primera ventana en el arreglo obtiene el mayor z-index y las
 * siguientes reciben valores progresivamente menores. Esto evita
 * la necesidad de incrementar el z-index indefinidamente en el
 * estado o en el storage.
 *
 * Si la ventana no existe en el orden de ventanas flotantes,
 * el selector devuelve `0` como valor por defecto.
 *
 * @function selectZIndexForWindow
 *
 * @param {string} id - Identificador único de la ventana cuya
 *                      prioridad visual (z-index) se desea obtener.
 *
 * @returns {MemoizedSelector<object, number>} Selector memorizado que
 *          retorna el z-index calculado para la ventana indicada.
 *
 * @example
 * // Estado:
 * // floatingWindowsOrder = ['winA', 'winB', 'winC']
 *
 * // Uso:
 * const zIndex = store.select(selectZIndexForWindow('winB'));
 * // Resultado: 1000 - 1 = 999
 */
export const selectZIndexForWindow = (id: string) =>
  createSelector(selectUserInterfaceComponent, state => {
    const index = state.floatingWindowsOrder.indexOf(id);
    if (index === -1) return 0;

    return 1000 - index;
  });
