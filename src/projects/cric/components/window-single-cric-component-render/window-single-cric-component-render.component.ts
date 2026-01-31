import { CommonModule } from '@angular/common';
import { Component, Input, OnDestroy } from '@angular/core';
import {
  ItemWidgetState,
  UserInterfaceState,
} from '@app/core/interfaces/store/user-interface.model';
import {
  selectConfigWidgetOpenedSingleRender,
  selectIsWidgetOpenedSingleRender,
} from '@app/core/store/user-interface/user-interface.selectors';
import { Store } from '@ngrx/store';
import { Observable, Subject, takeUntil } from 'rxjs';
import { FloatingWindowComponent } from '@app/widget-ui/components/floating-window/components/floating-window/floating-window.component';
import { FloatingWindowConfig } from '@app/widget-ui/components/floating-window/interfaces/floating-window-config';
import { SingleComponentRenderComponent } from '@app/widget-ui/components/single-component-render/single-component-render.component';
import { UserInterfaceService } from '@app/core/services/user-interface-service/user-interface.service';
import { SetSingleComponentWidget } from '@app/core/store/user-interface/user-interface.actions';
import { MobileFloatingTabWindowComponent } from '../mobile-floating-tab-window/mobile-floating-tab-window.component';

/**
 * @description
 * Componente encargado de actuar como **intermediario entre el estado global (Store NgRx)**
 * y la representación visual de un único widget dentro del visor geográfico CRIC.
 *
 * Este componente garantiza que:
 * - Solo un widget flotante esté activo en pantalla a la vez.
 * - Los datos del estado global del Store se reflejen correctamente en la interfaz.
 * - La configuración visual de la ventana (posición, tamaño y límites) se sincronice con la información del widget actual.
 *
 * En entornos móviles, se integra con el componente `MobileFloatingTabWindowComponent`
 * para adaptar la experiencia del usuario a pantallas reducidas.
 *
 * @date 02-11-2025
 * @version 1.0.0
 * @author
 * Carlos Muñoz — IGAC (javier.munoz@igac.gov.co)
 */
@Component({
  selector: 'app-window-single-cric-component-render',
  standalone: true,
  imports: [
    CommonModule,
    FloatingWindowComponent,
    SingleComponentRenderComponent,
    MobileFloatingTabWindowComponent,
  ],
  templateUrl: './window-single-cric-component-render.component.html',
  styleUrl: './window-single-cric-component-render.component.scss',
})
export class WindowSingleCricComponentRenderComponent implements OnDestroy {
  /**
   * @property destroy$
   * @type {Subject<void>}
   * @description
   * Controla la finalización de las suscripciones activas.
   * Se completa en el método `ngOnDestroy` para evitar fugas de memoria.
   */
  private destroy$: Subject<void> = new Subject<void>();

  /**
   * @property existeWidgetAbierto$
   * @type {Observable<boolean>}
   * @description
   * Observable que indica si existe actualmente un widget abierto.
   * Se actualiza dinámicamente desde el Store de NgRx.
   */
  existeWidgetAbierto$: Observable<boolean>;

  /**
   * @property configuracionWidgetAbierto
   * @type {ItemWidgetState | undefined}
   * @description
   * Almacena la configuración actual del widget que está siendo renderizado.
   * Incluye propiedades como posición, tamaño, título, límites, etc.
   */
  configuracionWidgetAbierto: ItemWidgetState | undefined;

  /**
   * @property isMobile
   * @type {boolean}
   * @description
   * Indica si el componente se está visualizando en un entorno móvil.
   * Determina la forma en que se renderiza el widget (modo flotante o pestañas móviles).
   */
  @Input() isMobile = false;

  /**
   * @property configFloatingWindow
   * @type {FloatingWindowConfig}
   * @description
   * Configuración base de la ventana flotante.
   * Define las dimensiones, posición y límites del contenedor del widget.
   * Es un campo obligatorio.
   */
  @Input({ required: true }) configFloatingWindow!: FloatingWindowConfig;

  /**
   * @constructor
   * @param {Store<{ userInterface: UserInterfaceState }>} userInterfaceStore
   * Inyección del Store de NgRx encargado de gestionar el estado de la interfaz de usuario.
   * @param {UserInterfaceService} userInterfaceService
   * Servicio que permite cambiar el estado de visibilidad de los widgets.
   *
   * @description
   * Inicializa las suscripciones al Store para detectar widgets activos
   * y sincronizar la configuración de la ventana flotante con el estado global.
   */
  constructor(
    private userInterfaceStore: Store<{ userInterface: UserInterfaceState }>,
    private userInterfaceService: UserInterfaceService
  ) {
    // Inicializar el observable que indica si hay un widget abierto
    this.existeWidgetAbierto$ = this.userInterfaceStore
      .select(selectIsWidgetOpenedSingleRender)
      .pipe(takeUntil(this.destroy$));

    // Actualiza la configuración de la ventana flotante con base en la configuración del widget
    this.subscribeToWidgetConfig();
  }

  /**
   * @method ngOnDestroy
   * @description
   * Método del ciclo de vida Angular que se ejecuta antes de destruir el componente.
   * - Cancela todas las suscripciones activas.
   * - Completa el `Subject` destroy$ para liberar recursos.
   */
  ngOnDestroy(): void {
    // Emitir valor para completar las suscripciones
    this.destroy$.next();
    // Completar el subject
    this.destroy$.complete();
  }

  /**
   * @method subscribeToWidgetConfig
   * @private
   * @description
   * Suscribe al componente a los cambios de configuración del widget abierto en el Store.
   * Cada vez que el widget activo cambia, se actualizan las propiedades visuales
   * de la ventana flotante (`configFloatingWindow`).
   */
  private subscribeToWidgetConfig(): void {
    this.userInterfaceStore
      .select(selectConfigWidgetOpenedSingleRender)
      .pipe(takeUntil(this.destroy$))
      .subscribe(configWidget => {
        // Verificar si actualmente hay un widget cargado
        if (configWidget) {
          // obtener la configuración del widget abierto
          this.configuracionWidgetAbierto = {
            ...configWidget,
            titulo:
              configWidget.titulo == 'Exportar Mapa 3'
                ? 'Salida Gráfica'
                : configWidget.titulo.replaceAll(' V2', ''),
          };

          //mutar las propiedades de acuerdo con los valores por defecto
          this.configFloatingWindow = {
            ...this.configFloatingWindow, // Copia todos los valores por defecto de la ventana flotante
            ...({
              //Parametriza la configuración de la ventana flotante de acuerdo con el widget abierto
              x: configWidget.posicionX ?? this.configFloatingWindow.x,
              y: configWidget.posicionY ?? this.configFloatingWindow.y,
              width: configWidget.ancho ?? this.configFloatingWindow.width,
              height: configWidget.alto ?? this.configFloatingWindow.height,
              maxHeight:
                configWidget.altoMaximo ??
                this.configuracionWidgetAbierto.altoMaximo,
              maxWidth:
                configWidget.anchoMaximo ??
                this.configuracionWidgetAbierto.anchoMaximo,
            } as FloatingWindowConfig),
          };
        }
      });
  }

  /**
   * @method cerrarWidget
   * @description
   * Cierra el widget actualmente abierto y limpia su referencia en el estado global.
   * - Marca el widget como no visible mediante `UserInterfaceService`.
   * - Despacha la acción `SetSingleComponentWidget` con `undefined` para limpiar el renderizado.
   *
   * @returns {void}
   */
  cerrarWidget(): void {
    if (this.configuracionWidgetAbierto) {
      // Emitir un evento para cerrar la ventana
      this.userInterfaceService.cambiarVisibleWidget(
        this.configuracionWidgetAbierto.nombreWidget,
        false
      );
      this.userInterfaceStore.dispatch(
        SetSingleComponentWidget({ nombre: undefined })
      );
    }
  }
}
