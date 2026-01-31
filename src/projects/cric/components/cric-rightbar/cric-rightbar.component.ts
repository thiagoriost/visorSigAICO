import { Component, Input, OnDestroy, OnInit } from '@angular/core'; // Decorador de componente y hooks de ciclo de vida
import { UserInterfaceState } from '@app/core/interfaces/store/user-interface.model'; // Interfaz del slice de estado de UI
import { SetSingleComponentWidget } from '@app/core/store/user-interface/user-interface.actions'; // Acción NgRx para abrir un widget único
import { BotonConfigModel } from '@app/widget-ui/components/botoneraVertical/interfaces/boton-config.model'; // Interfaz de los botones de la botonera vertical
import { Store } from '@ngrx/store'; // Servicio NgRx para interactuar con el store global
import { Subject } from 'rxjs'; // Subject usado para emitir la destrucción y completar suscripciones
import { filter, take, takeUntil } from 'rxjs/operators'; // Operador RxJS para finalizar suscripciones
import { MapNavButtonsComponent } from '@app/widget/map-nav-buttons/components/map-nav-buttons/map-nav-buttons.component'; // Componente hijo: botones de navegación del mapa
import { MapNavButtonsInterface } from '@app/widget/map-nav-buttons/interfaces/map-nav-buttons.interface'; // Interfaz de configuración de los botones de navegación
import { selectWidgetData } from '@app/core/store/map/map.selectors'; // Selector NgRx para leer datos de un widget
import { BotoneraVerticalComponent } from '@app/widget-ui/components/botoneraVertical/components/botonera-vertical/botonera-vertical.component'; // Componente hijo: botonera vertical
import { environment } from 'environments/environment';
import { MapActions } from '@app/core/store/map/map.actions';
import { MapState } from '@app/core/interfaces/store/map.model';
import { ButtonSeverity } from 'primeng/button';

/**
 * @class CricRightbarComponent
 * @implements OnInit, OnDestroy
 * @description
 * Componente visual que representa el **panel lateral derecho** del visor geográfico CRIC.
 *
 * Su función principal es servir como **contenedor de herramientas rápidas y controles de navegación**,
 * incluyendo:
 * - Botonera vertical de accesos directos (`BotoneraVerticalComponent`)
 * - Botones de navegación del mapa (`MapNavButtonsComponent`)
 *
 * También actúa como **puente entre la UI y el estado global (NgRx Store)**, permitiendo:
 * - Leer configuraciones iniciales del widget `MapNavButtons`.
 * - Despachar acciones que abren componentes flotantes (widgets únicos).
 *
 * Utiliza un patrón de suscripción **reactivo y seguro** mediante `takeUntil(this.destroy$)`
 * para evitar fugas de memoria al destruir el componente.
 *
 * @date 16-10-2025
 * @version 1.0.0
 * @author
 * Carlos Muñoz — IGAC (javier.munoz@igac.gov.co)
 *
 * @example
 * ```html
 * <!-- Ejemplo de uso dentro del layout principal -->
 * <app-cric-rightbar [isMobile]="false"></app-cric-rightbar>
 * ```
 */
@Component({
  selector: 'app-cric-rightbar',
  standalone: true,
  imports: [MapNavButtonsComponent, BotoneraVerticalComponent],
  templateUrl: './cric-rightbar.component.html',
  styleUrl: './cric-rightbar.component.scss',
})
export class CricRightbarComponent implements OnInit, OnDestroy {
  /**
   * @input isMobile
   * Define si el componente debe comportarse en modo móvil o escritorio.
   * Este valor afecta la separación (`gapButtons`) entre botones de navegación.
   *
   * @default false
   */
  @Input() isMobile = false;

  /**
   * Subject utilizado para gestionar la destrucción de suscripciones activas.
   * Se emite en `ngOnDestroy` para cerrar todas las observaciones que usen `takeUntil`.
   */
  private destroy$ = new Subject<void>();

  /**
   * Arreglo de opciones del menú lateral derecho.
   * Cada elemento corresponde a un botón visible en la botonera vertical.
   *
   * @type {BotonConfigModel[]}
   * @remarks
   * El `id` de cada botón debe coincidir con el nombre del widget
   * a renderizar en la interfaz flotante.
   */
  menuOpciones: BotonConfigModel[] = [
    {
      id: 'DescargarManualCric', // Identificador interno de la opción
      icono: 'pi cric-ayuda', // Icono PrimeIcons a mostrar
      texto: 'Ayuda', // Texto visible en la opción
    },
  ];

  /**
   * @constructor
   * @param {Store<{ userInterface: UserInterfaceState }>} userInterfaceStore
   * Store NgRx que gestiona el estado de la interfaz de usuario (UI).
   *
   * @param {Store<MapState>} store
   * Store principal para la gestión del estado del mapa (widgets, configuraciones, etc.).
   *
   * @remarks
   * Ambos stores permiten tanto la lectura (selectores) como el despacho (dispatch)
   * de acciones que modifican el estado global del visor.
   */
  constructor(
    private userInterfaceStore: Store<{ userInterface: UserInterfaceState }>,
    private store: Store<MapState>
  ) {}

  /**
   * @lifecycle ngOnInit
   * Se ejecuta una vez al inicializar el componente.
   *
   * - Lee la configuración inicial del widget `MapNavButtons` desde el Store.
   * - Reconstruye los valores adaptados al entorno CRIC mediante `buildMapNavButtonsConfigCric`.
   * - Actualiza el Store con la nueva configuración.
   *
   * Usa `takeUntil(this.destroy$)` para evitar fugas de memoria.
   */
  ngOnInit(): void {
    // Selecciona del store los datos del widget con nombre 'MapNavButtons'
    this.userInterfaceStore
      .select(selectWidgetData('MapNavButtons'))
      // Encadena el operador takeUntil para cancelar esta suscripción cuando `destroy$` emita
      .pipe(
        takeUntil(this.destroy$),
        filter(
          (cfgNavButtons): cfgNavButtons is MapNavButtonsInterface =>
            !!cfgNavButtons
        ),
        take(1)
      )
      // Se suscribe para reaccionar a los cambios de datos del widget
      .subscribe(configDefault => {
        // Si hay datos, construye la configuración inicial a partir de lo recibido y valores por defecto/forzados
        if (configDefault) {
          const configNavButtonsCric =
            this.buildMapNavButtonsConfigCric(configDefault);
          this.store.dispatch(
            MapActions.setWidgetNavButtonsData({
              widgetId: 'MapNavButtons',
              data: configNavButtonsCric,
            })
          );
        } else {
          // Si no hay datos, emite una advertencia en consola (útil para identificar problemas de wiring del store)
          console.warn('No se encontraron datos para el widget MapNavButtons');
        }
      });
  }

  /**
   * @lifecycle ngOnDestroy
   * Hook de limpieza ejecutado al destruir el componente.
   *
   * Emite y completa `destroy$` para cerrar todas las suscripciones dependientes.
   * Esto evita fugas de memoria y libera recursos del observable.
   */
  ngOnDestroy(): void {
    this.destroy$.next(); // Emite un valor para que `takeUntil` finalice las suscripciones activas
    this.destroy$.complete(); // Completa el Subject para liberar recursos
  }

  /**
   * @private
   * @method buildMapNavButtonsConfigCric
   * @description
   * Construye una configuración personalizada para el componente `MapNavButtons`
   * con base en una configuración inicial (`configDefault`) y los valores
   * definidos en el entorno CRIC.
   *
   * @param {MapNavButtonsInterface} configDefault Configuración base del widget.
   * @returns {MapNavButtonsInterface} Configuración adaptada al visor CRIC.
   */
  private buildMapNavButtonsConfigCric(
    configDefault: MapNavButtonsInterface
  ): MapNavButtonsInterface {
    return {
      ...configDefault,
      showPan: true,
      showZoomIn: true,
      showZoomOut: true,
      showToggleMouseWheelZoom: false,
      showAdvancedZoomOut: false,
      showAdvancedZoomIn: false,
      isMouseWheelZoomEnabled: true,
      orderPan: 0,
      orderAdvancedZoomIn: 1,
      orderAdvancedZoomOut: 2,
      orderResetView: 3,
      gapButtons: this.isMobile ? 2 : 5,
      customIconStyles: {
        iconPanEnabled: environment.mapNavButtons.iconPanEnabled,
        iconPanDisabled: environment.mapNavButtons.iconPanDisabled,
        iconZoomIn: environment.mapNavButtons.iconZoomIn,
        iconZoomOut: environment.mapNavButtons.iconZoomOut,
        iconInactiveAdvancedZoom:
          environment.mapNavButtons.iconInactiveAdvancedZoom,
        iconResetView: environment.mapNavButtons.iconResetView,
        iconToggleMouseWheelZoomEnabled:
          environment.mapNavButtons.iconToggleMouseWheelZoomEnabled,
        iconToggleMouseWheelZoomDisabled:
          environment.mapNavButtons.iconToggleMouseWheelZoomDisabled,
      },
      buttomSeverity: 'primary' as ButtonSeverity,
    };
  }

  /**
   * @method onSeleccion
   * @description
   * Manejador del evento `onSeleccion` emitido por la botonera vertical.
   *
   * Despacha la acción `SetSingleComponentWidget` al Store para mostrar el
   * componente flotante correspondiente al botón seleccionado.
   *
   * @param {{ botonId: string; opcionId: string }} event
   * Objeto con información del botón y la opción seleccionada.
   *
   * @example
   * ```html
   * <app-botonera-vertical
   *   [opciones]="menuOpciones"
   *   (seleccion)="onSeleccion($event)">
   * </app-botonera-vertical>
   * ```
   *
   * @returns {void}
   */
  onSeleccion(event: { botonId: string; opcionId: string }): void {
    // Despacha la acción para indicar a la UI que debe renderizar un único componente: el indicado por `opcionId`
    this.userInterfaceStore.dispatch(
      SetSingleComponentWidget({ nombre: event.opcionId })
    );
  }
}
