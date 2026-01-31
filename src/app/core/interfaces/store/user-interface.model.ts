/**
 *
 * @description Representa el estado de la interfaz de usuario en la aplicación.
 * @author Carlos Javier Muñoz Fernández
 * @date 05/12/2024
 * @class UserInterfaceState, ItemWidgetState
 */

import { Type } from '@angular/core';
import { FloatingWindowConfig } from '@app/widget-ui/components/floating-window/interfaces/floating-window-config';

import { WidgetCategoria } from '@app/core/interfaces/enums/WidgetCategoria.enum';
import { WidgetSubcategoria } from '@app/core/interfaces/enums/WidgetSubcategoria.enum';

/**
 * UserInterfaceState
 *
 * Representa el estado de la interfaz de usuario en la aplicación.
 */
export interface UserInterfaceState {
  /**
   * Lista de widgets en la interfaz de usuario.
   */
  widgets: ItemWidgetState[];
  // Widget que se superpone al layout con sus propias estructuras
  overlayWidgets: ItemWidgetState[];
  singleComponentNombreWidget: string | undefined; // Nombre del widget que se está renderizando actualmente en el componente de renderizado único.
  initialFloatingWindowConfig: FloatingWindowConfig;
  actionsMapNavButtons: ActionsMapNavButtons; //Subestado para MapNavButtons
  floatingWindowsOrder: string[]; // Identificación de ventanas flotantes activas
}

/**
 * ItemWidgetState
 *
 * Define las propiedades de un widget en la interfaz de usuario.
 */
export interface ItemWidgetState {
  /**
   * Título del widget que se muestra en el encabezado del panel.
   */
  titulo: string;

  /**
   * Nombre del componente que se va a visualizar.
   */
  nombreWidget: string;

  /**
   * Ruta para realizar la importación del componente.
   */
  ruta: string;

  /**
   * Posición en la que se debe abrir el widget (left).
   */
  posicionX?: number;

  /**
   * Posición en la que se debe abrir el widget (top).
   */
  posicionY?: number;

  /**
   * Indica si el widget se encuentra abierto.
   * Esta propiedad es opcional.
   */
  abierto?: boolean;

  /**
   * Indica el ancho por defecto del widget.
   * Esta propiedad es opcional.
   */
  ancho?: number;

  /**
   * Indica el ancho máximo que se puede redimensionar el widget.
   * Esta propiedad es opcional.
   */
  anchoMaximo?: number;

  /**
   * Indica el alto por defecto del widget.
   * Esta propiedad es opcional.
   */
  alto?: number;

  /**
   * Indica el alto máximo que se puede redimensionar el widget.
   * Esta propiedad es opcional.
   */
  altoMaximo?: number;

  /**
   * Configuraciónes por defecto de los widgets.
   * Esta propiedad es opcional.
   */
  widgetsDefaulConfig?: Record<string, unknown>;

  /**
   * Clase de ícono (usualmente de PrimeIcons).
   * Ejemplo: 'pi pi-globe', 'pi pi-table'
   */
  icono?: string;

  /**
   * Ruta o contenido del archivo README para este widget.
   */
  readme?: string;

  /**
   * Categoría general del widget. Ej: 'Herramientas de trabajo'
   */
  categoria?: WidgetCategoria;

  /**
   * Subcategoría dentro de la categoría. Ej: 'Mapas base'
   */
  subcategoria?: WidgetSubcategoria;
}

export interface WidgetItemFuncionState extends ItemWidgetState {
  importarComponente: () => Promise<Type<unknown>>;
}

/**
 * ActionsMapNavButtons
 *
 * Representa el estado de los botones de navegación en el mapa.
 */
export interface ActionsMapNavButtons {
  /**
   * Estado que indica sí se está realizando paneo en el mapa
   * @type {boolean}
   */
  isPaning: boolean;

  /**
   * Estado que identifica sí el zoom avanzado está activo
   * @type {boolean}
   */
  isAdvancedZoomInActive: boolean;

  /**
   *Estado que identifica sí el zoom avanzado está activo
   * @type {boolean}
   */
  isAdvancedZoomOutActive: boolean;

  /**
   *Estado que identifica sí se está dibujando un rectanguro para realizar zoom avanzado
   * @type {boolean}
   */
  isDrawingZoomBox: boolean;
}
