import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { TabsModule } from 'primeng/tabs';
import { ButtonModule } from 'primeng/button';
import {
  FloatingWindowConfig,
  FloatingWindowState,
} from '@app/widget-ui/components/floating-window/interfaces/floating-window-config';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { MapState } from '@app/core/interfaces/store/map.model';
import { selectWidgetStatus } from '@app/core/store/user-interface/user-interface.selectors';
import { Store } from '@ngrx/store';

/**
 * @class MobileFloatingTabWindowComponent
 * @implements OnInit, OnDestroy
 * @description
 * Componente **responsable de gestionar los widgets activos** del visor geográfico CRIC en entornos **móviles**.
 *
 * Su objetivo es reemplazar las ventanas flotantes de escritorio por un **contenedor de pestañas (Tabs)**,
 * optimizado para pantallas pequeñas. Permite que los usuarios puedan:
 * - Visualizar simultáneamente distintas herramientas (Leyenda, Tabla de atributos, etc.)
 * - Alternar entre pestañas sin interferir con el mapa
 * - Cerrar o minimizar los módulos abiertos fácilmente
 *
 * Adicionalmente:
 * - Escucha el estado del store NgRx para determinar qué widgets están visibles.
 * - Emite eventos al cerrar o destruir la ventana flotante.
 *
 * @date 16-10-2025
 * @version 1.0.0
 * @author
 * Carlos Muñoz — IGAC (javier.munoz@igac.gov.co)
 *
 * @example
 * ```html
 * <!-- Contenedor de widgets móviles -->
 * <app-mobile-floating-tab-window
 *   [widgetFloatingWindowConfig]="config"
 *   [titulo]="'Leyenda'"
 *   (closeWindowEvent)="cerrarVentana()"
 *   (destroyRequested)="eliminarInstancia()"
 * ></app-mobile-floating-tab-window>
 * ```
 */
@Component({
  selector: 'app-mobile-floating-tab-window',
  standalone: true,
  imports: [TabsModule, ButtonModule],
  templateUrl: './mobile-floating-tab-window.component.html',
  styleUrl: './mobile-floating-tab-window.component.scss',
})
export class MobileFloatingTabWindowComponent implements OnInit, OnDestroy {
  /**
   * @property _state
   * @type {FloatingWindowState}
   * @description
   * Estado interno de la ventana flotante.
   * Define su posición, tamaño y propiedades visuales.
   * No es accesible directamente desde el exterior, pero cuenta con un getter seguro (`state`).
   */
  private _state: FloatingWindowState = {
    x: 0, //Posición actual de la ventana extremo izquierdo
    y: 0, //Posición actual de la ventana extremo superior
    width: 0, //Ancho mínimo de la pantalla al iniciar el componente
    height: 0, // Alto mínimo de la pantalla al iniciar el componente
    isMinimized: true, //Estado inicial no minimizado
    isDragging: false, // No está siendo arrastrada inicialmente
    isResizing: false, // No está siendo redimensionada inicialmente
    dragStartX: 0, //Valores iniciales para el inicio de arrastre
    dragStartY: 0, //Valores iniciales para el inicio de redimensionamiento
    resizeStartX: 0, //Valore final para la posición de arrastre de redimensionamiento
    resizeStartY: 0, //Valores final para la posición de redimensionamiento
    topLimit: 0, // Limite superior hasta donde se puede mover la ventana flotante con relación al objeto contenedor del mapa
    leftLimit: 0, // Limite izquierdo hasta donde se puede mover la ventana flotante con relación al objeto contenedor del mapa
    rightLimit: Infinity, // Límite derecho máximo hasta donde se puede mover la ventana flotanta con relación al objeto contenedor del mapa
    bottomLimit: Infinity, // Límite inferior máximo hasta donde se puede mover la ventana flotanta con relación al objeto contenedor del mapa
  };

  /**
   * @property {string} activeTab
   * @description Identificador de la pestaña activa en modo móvil.
   * @default '0'
   */
  activeTab = '0';

  /**
   * @property {boolean} showAttributeTable
   * @description Indica si la tabla de atributos está visible o no.
   * Se actualiza según el estado global del Store.
   */
  showAttributeTable = false; //Identifica sí existen datos en el storage correspondientes con la tabla de atributos.

  /**
   * @property {boolean} isLeyenda
   * @description Indica si el componente actual corresponde a la vista de Leyenda.
   */
  isLeyenda = false;

  /**
   * @input widgetFloatingWindowConfig
   * @type {FloatingWindowConfig}
   * @description
   * Configuración visual y funcional del contenedor móvil.
   * Define título, tamaño, posición y widgets contenidos.
   */
  @Input() widgetFloatingWindowConfig!: FloatingWindowConfig;

  /**
   * @input titulo
   * @type {string}
   * @description Título visible de la ventana móvil.
   * Permite identificar el tipo de contenido (Leyenda, Tabla, etc.)
   * @default ''
   */
  @Input() titulo = '';

  /**
   * @output closeWindowEvent
   * @description
   * Evento emitido al cerrar la ventana actual.
   * Usado por el componente padre para remover la instancia.
   */
  @Output() closeWindowEvent = new EventEmitter<void>();

  /**
   * @output destroyRequested
   * @description
   * Evento emitido cuando se solicita destruir completamente la instancia
   * (ejemplo: cambio de contexto en el mapa).
   */
  @Output() destroyRequested = new EventEmitter<void>();

  /**
   * @property subscription
   * @type {Subscription}
   * @description
   * Maneja la suscripción al store NgRx. Se cancela en `ngOnDestroy` para evitar fugas de memoria.
   */
  private subscription!: Subscription;

  /**
   * @property destroy$
   * @type {Subject<void>}
   * @description
   * Controla la finalización de las suscripciones activas.
   * Se completa en el método `ngOnDestroy`.
   */
  private destroy$: Subject<void> = new Subject<void>();

  /**
   * @constructor
   * @param store {Store<MapState>} - Inyección del Store tipado con `MapState`.
   * Permite observar y modificar el estado global del visor geográfico CRIC.
   */
  constructor(private store: Store<MapState>) {}

  /**
   * @method ngOnInit
   * @description
   * Inicializa el componente y se suscribe al Store NgRx
   * para escuchar el estado del widget `attributeTable`.
   *
   * Ajusta la pestaña activa en función del tipo de contenido:
   * - Si la tabla de atributos está visible → pestaña '2'
   * - Si el título es "Leyenda" → pestaña '0'
   * - En otros casos → pestaña '1'
   */
  ngOnInit(): void {
    this.isLeyenda = this.titulo == 'Leyenda' ? true : false;
    this.subscription = this.store
      .select(selectWidgetStatus('attributeTable'))
      .pipe(takeUntil(this.destroy$))
      .subscribe(visible => {
        this.showAttributeTable = visible !== undefined ? visible : false;
        this.activeTab = this.showAttributeTable
          ? '2'
          : this.isLeyenda
            ? '0'
            : '1';
      });
  }

  /**
   * @method ngOnDestroy
   * @description
   * Se ejecuta antes de destruir el componente.
   * Cancela las suscripciones activas y completa los observables para liberar memoria.
   */
  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    // Emitir valor para completar las suscripciones
    this.destroy$.next();
    // Completar el subject
    this.destroy$.complete();
  }

  /**
   * @getter state
   * @returns {FloatingWindowState}
   * @description
   * Permite acceder al estado interno `_state` de forma controlada.
   */
  get state(): FloatingWindowState {
    return this._state;
  }

  /**
   * @method closeWindow
   * @description
   * Cierra la ventana flotante emitiendo el evento `closeWindowEvent`.
   * No aplica lógica visual directa; delega el control al componente padre.
   *
   * @example
   * ```ts
   * this.closeWindow(); // Emite evento para cerrar ventana
   * ```
   */
  closeWindow() {
    this.closeWindowEvent.emit(); // Emitir evento en lugar de lógica directa
  }

  /**
   * @method toggleMinimize
   * @description
   * Cambia el estado de la ventana a **minimizada**.
   */
  toggleMinimize() {
    this._state.isMinimized = true;
  }
}
