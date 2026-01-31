import { InjectionToken } from '@angular/core';
import { WidgetItemFuncionState } from '@app/core/interfaces/store/user-interface.model';

/**
 * Interface que define el objeto necesario para los widgets disponibles del store de redux
 * @date 02-10-2025
 * @author Andres Fabian Simbaqueba Del Rio
 */
export interface IWidgetConfig {
  widgetsConfig: WidgetItemFuncionState[]; //lista de widgets normales
  overlayWidgetsConfig: WidgetItemFuncionState[]; //lista de widgets de tipo overlay
}

export const WIDGET_CONFIG = new InjectionToken<IWidgetConfig>('widget.config'); //define una constante para hacer una inyeccion de dependencia
