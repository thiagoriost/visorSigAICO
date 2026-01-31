import { createAction, props } from '@ngrx/store';
import { ItemWidgetState } from '@app/core/interfaces/store/user-interface.model';

/**
 * @description Acciones definidas en la interfaz de usuario.
 * @author Carlos Javier Muñoz Fernández
 * @date 05/12/2024
 */

/**
 * @description Acción para establecer el estado inicial de los widgets de la interfaz de usuario.
 * @param {ItemWidgetState[]} initialUserInterfaceWidgetStatus - El estado inicial de los widgets.
 * @returns {Action} La acción para establecer el estado inicial de los widgets.
 */
export const initialUserInterfaceWidgetStatus = createAction(
  '[initialUserInterfaceWidgetStatus] InitialUserInterfaceStatus',
  props<{ initialUserInterfaceWidgetStatus: ItemWidgetState[] }>()
);

/**
 * @description Acción para actualizar el estado de visibilidad de un widget específico.
 * @param {string} nombre - El nombre del widget a actualizar.
 * @param {boolean} estado - El nuevo estado de visibilidad del widget.
 * @returns {Action} La acción para actualizar el estado del widget.
 */
export const AbrirWidget = createAction(
  '[AbrirWidget] Abrir Widget',
  props<{ nombre: string; estado: boolean }>()
);
/**
 * @description Acción para setear el nombre del widget que se debe abrir como single-component.
 * @param {string} nombre - El nombre del widget a abrir como single-component.
 * @returns {Action} La acción para setear el nombre del widget single-component.
 */
export const SetSingleComponentWidget = createAction(
  '[SetSingleComponentWidget] Set Single Component Widget',
  props<{ nombre: string | undefined }>() // El nombre del widget a abrir como single-component, puede ser undefined si no hay widget.
);

/**
 * @description Acción para establecer dinámicamente las herramientas de dibujo disponibles.
 * @param {string[]} drawingOptions - Lista de herramientas de dibujo permitidas (e.g., ['Point', 'LineString']).
 */
export const SetDrawingOptions = createAction(
  '[Drawing] Set Drawing Options',
  props<{ drawingOptions: ('Point' | 'LineString' | 'Polygon' | 'Circle')[] }>()
);

/**
 * @description Acción para establecer el estado de los widgets de superposición.
 * @param {ItemWidgetState[]} overlayWidgets - El estado de los widgets de superposición.
 * @returns {Action} La acción para establecer el estado de los widgets de superposición.
 */
export const SetOverlayWidgets = createAction(
  '[SetOverlayWidgets] Set Overlay Widgets',
  props<{ overlayWidgets: ItemWidgetState[] }>()
);

/**
 * @description Acción para actualizar el estado de visibilidad de un widget de superposición específico.
 * @param {string} nombre - El nombre del widget de superposición a actualizar.
 * @param {boolean} estado - El nuevo estado de visibilidad del widget de superposición.
 * @returns {Action} La acción para actualizar el estado del widget de superposición.
 */
export const AbrirOverlayWidget = createAction(
  '[AbrirOverlayWidget] Abrir Overlay Widget',
  props<{ nombre: string; estado: boolean }>()
);

/**
 * @description Acción para establecer el estado del modo de paneo del mapa.
 * Se dispara cuando el usuario activa o desactiva la herramienta de desplazamiento (pan).
 *
 * @param {boolean} isPaning - Indica si el modo de paneo está activo.
 * @returns {Action} La acción para actualizar el estado del paneo en el mapa.
 */
export const setPaning = createAction(
  '[MapNavButtons] Set Paning',
  props<{ isPaning: boolean }>()
);

/**
 * @description Acción para actualizar simultáneamente los estados del modo de "Zoom avanzado hacia adentro",
 * "Zoom avanzado hacia afuera" y "Dibujo del rectángulo de zoom".
 * Se utiliza para garantizar que los tres estados se actualicen de forma atómica y consistente,
 * evitando condiciones de carrera entre los diferentes modos de zoom.
 *
 * @param {boolean} isAdvancedZoomInActive - Indica si el modo de zoom avanzado hacia adentro está activo.
 * @param {boolean} isAdvancedZoomOutActive - Indica si el modo de zoom avanzado hacia afuera está activo.
 * @param {boolean} isDrawingZoomBox - Indica si actualmente se está dibujando el rectángulo de zoom.
 * @returns {Action} La acción para actualizar simultáneamente los tres estados relacionados con el zoom.
 */
export const setZoomModes = createAction(
  '[MapNavButtons] Set Zoom Modes',
  props<{
    isAdvancedZoomInActive: boolean;
    isAdvancedZoomOutActive: boolean;
    isDrawingZoomBox: boolean;
  }>()
);

/**
 * Acción que solicita llevar una ventana flotante al frente,
 * asignándole el mayor z-index disponible dentro del sistema
 * y ajustando el orden de las demás ventanas.
 *
 * Esta acción se despacha cuando el usuario interactúa con
 * una ventana (por ejemplo, al hacer clic sobre ella) y se
 * requiere que dicha ventana se sobreponga visualmente sobre
 * las demás.
 *
 * @action BringFloatingWindowToFront
 *
 * @param {Object} payload - Datos necesarios para identificar la ventana.
 * @param {string} payload.id - Identificador único de la ventana flotante
 *                               que debe ser llevada al frente.
 *
 * @example
 * // Despacho desde un componente al hacer clic en una ventana
 * this.store.dispatch(bringFloatingWindowToFront({ id: 'window-123' }));
 */
export const bringFloatingWindowToFront = createAction(
  '[FloatingWindow] Bring To Front',
  props<{ id: string }>()
);

export const removeFloatingWindow = createAction(
  '[FloatingWindow] Remove',
  props<{ id: string }>()
);
