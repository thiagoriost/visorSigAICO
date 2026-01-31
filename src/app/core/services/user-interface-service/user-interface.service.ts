import { Inject, Injectable, Type } from '@angular/core';
import {
  ItemWidgetState,
  WidgetItemFuncionState,
} from '@app/core/interfaces/store/user-interface.model';

import { Store } from '@ngrx/store';
import {
  AbrirWidget,
  SetOverlayWidgets,
  initialUserInterfaceWidgetStatus,
} from '@app/core/store/user-interface/user-interface.actions';

import {
  IWidgetConfig,
  WIDGET_CONFIG,
} from '@app/core/config/interfaces/IWidgetConfig';

/**
 * @description Este servicio es responsable de gestionar los widgets en la interfaz de usuario.
 * Utiliza NgRx Store para manejar el estado de los widgets y proporciona métodos
 * para interactuar con ellos.
 * @author Carlos Javier Muñoz Fernández
 * @date 05/12/2024
 * @class UserInterfaceService
 */
@Injectable({
  providedIn: 'root',
})
export class UserInterfaceService {
  private _widgets: ItemWidgetState[] = [];
  private _overlayWidgets: ItemWidgetState[] = [];
  private _widgetsImportFuncion: {
    nombreWidget: string;
    importarComponente: () => Promise<Type<unknown>>;
  }[] = [];

  /**
   * Lista de widgets disponibles en la interfaz de usuario.
   */
  widgetsConfig: WidgetItemFuncionState[] = [];
  /**
   * Lista de widgets que se superponen al layout principal.
   */
  overlayWidgetsConfig: WidgetItemFuncionState[] = [];

  private normalWidgetNames = new Set<string>();
  private overlayWidgetNames = new Set<string>();

  constructor(
    private store: Store,
    @Inject(WIDGET_CONFIG) private config: IWidgetConfig
  ) {
    this.widgetsConfig = config.widgetsConfig;
    this.overlayWidgetsConfig = config.overlayWidgetsConfig;
    this.initializeWidgets();
  }

  private initializeWidgets(): void {
    this.widgetsConfig.forEach(widget => this.addWidget(widget, 'normal'));
    this.overlayWidgetsConfig.forEach(widget =>
      this.addWidget(widget, 'overlay')
    );
    // Despacha la acción para inicializar el estado de los widgets en el store
    this.store.dispatch(
      initialUserInterfaceWidgetStatus({
        initialUserInterfaceWidgetStatus: this._widgets,
      })
    );

    // Despacha la acción para inicializar el estado de los overlay widgets en el store
    this.store.dispatch(
      SetOverlayWidgets({
        overlayWidgets: this._overlayWidgets,
      })
    );
  }

  /**
   * Obtiene el componente correspondiente al nombre del widget proporcionado.
   * @param nombre - Nombre del widget cuyo componente se desea obtener.
   * @returns Una promesa que resuelve con el tipo del componente o null si no se encuentra.
   */
  async getComponente(nombre: string): Promise<Type<unknown> | null> {
    const widget = this._widgetsImportFuncion.find(
      widget => widget.nombreWidget === nombre
    );
    return widget ? await widget.importarComponente() : null;
  }

  /**
   * Cambia la visibilidad de un widget específico.
   * @param nombre - El nombre del widget cuya visibilidad se desea cambiar.
   * @param estado - El nuevo estado de visibilidad del widget (true para visible, false para oculto).
   */
  cambiarVisibleWidget(nombre: string, estado: boolean) {
    this.store.dispatch(AbrirWidget({ nombre: nombre, estado: estado }));
  }

  /**
   * Agrega un nuevo widget a la lista correspondiente (normal o overlay) si no existe ya.
   * @param widget - El widget a agregar.
   * @param type - El tipo de widget ('normal' o 'overlay').
   */
  private addWidget(
    widget: WidgetItemFuncionState,
    type: 'normal' | 'overlay'
  ): void {
    const targetSet =
      type === 'normal' ? this.normalWidgetNames : this.overlayWidgetNames;
    const targetList = type === 'normal' ? this._widgets : this._overlayWidgets;

    if (!targetSet.has(widget.nombreWidget)) {
      const nuevoWidget: ItemWidgetState = { ...widget };
      targetList.push(nuevoWidget);
      if (type === 'normal') {
        // Only add to _widgetsImportFuncion if it's a normal widget
        this._widgetsImportFuncion.push(widget);
      }
      targetSet.add(widget.nombreWidget);
    } else {
      console.warn(`El widget ${widget.nombreWidget} ya existe en la lista.`);
    }
  }
}
