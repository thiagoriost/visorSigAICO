import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Inject,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
// PrimeNG Modules

import { ButtonModule } from 'primeng/button';
// Componentes y modelos propios
import {
  FloatingWindowConfig,
  FloatingWindowState,
} from '@app/widget-ui/components/floating-window/interfaces/floating-window-config';
import { FloatingWindowHeaderComponent } from '@app/widget-ui/components/floating-window/components/floating-window-header/floating-window-header.component';
import { FloatingWindowResizeComponent } from '@app/widget-ui/components/floating-window/components/floating-window-resize/floating-window-resize.component';
import {
  debounceTime,
  fromEvent,
  Subject,
  Subscription,
  takeUntil,
} from 'rxjs';
import { Store } from '@ngrx/store';
import { selectZIndexForWindow } from '@app/core/store/user-interface/user-interface.selectors';
import {
  bringFloatingWindowToFront,
  removeFloatingWindow,
} from '@app/core/store/user-interface/user-interface.actions';

@Component({
  selector: 'app-floating-window',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    FloatingWindowHeaderComponent,
    FloatingWindowResizeComponent,
  ],
  templateUrl: './floating-window.component.html',
  styleUrl: './floating-window.component.scss',
})

/**
 * @description Se utiliza para la visualización de widgets en una ventana flotante, que se puede mover y redimensionar dentro de un área de visualización.
 *
 * @author javier.munoz@igac.gov.co
 * @version 1.0.0
 * @since 10/06/2025
 * @class FloatingWindowComponent
 */
export class FloatingWindowComponent implements OnInit, OnChanges, OnDestroy {
  // Estado inicial de la ventana
  private _state: FloatingWindowState = {
    x: 0, //Posición actual de la ventana extremo izquierdo
    y: 0, //Posición actual de la ventana extremo superior
    width: 0, //Ancho mínimo de la pantalla al iniciar el componente
    height: 0, // Alto mínimo de la pantalla al iniciar el componente
    isMinimized: false, //Estado inicial no minimizado
    isDragging: false, // No está siendo arrastrada inicialmente
    isResizing: false, // No está siendo redimensionada inicialmente
    dragStartX: 0, //Valores iniciales para el inicio de arrastre
    dragStartY: 0, //Valores iniciales para el inicio de redimensionamiento
    resizeStartX: 0, //Valore final para la posición de arrastre de redimensionamiento
    resizeStartY: 0, //Valores final para la posición de redimensionamiento
    topLimit: 0, // Limite superior hasta donde se puede mover la ventana flotante con relación al objeto contenedor del mapa
    leftLimit: 0, // Limite izquierdo hasta donde se puede mover la ventana flotante con relación al objeto contenedor del mapa

    rightLimit: Infinity,
    bottomLimit: Infinity,
  };

  // Posición inicial de la ventana
  public zIndex = 1000;
  private idFw = '';
  private destroy$ = new Subject<void>();
  private isRegistered = false;
  // Configuración de entrada para la ventana
  @Input() widgetFloatingWindowConfig!: FloatingWindowConfig;
  @Input() titulo = '';

  //Eventos de salida
  @Output() closeWindowEvent = new EventEmitter<void>();
  @Output() destroyRequested = new EventEmitter<void>();
  @Input() tamanoCabecera = 56; //Tamaño estático del componente FloatingWindowHeaderComponent

  private resizeSubscription: Subscription | null = null; // Suscripción al evento de redimensionamiento

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private store: Store,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    // Ideintificación única de la ventana flotante
    this.idFw = this.generarIdFloatingWindow();
    this.store.dispatch(bringFloatingWindowToFront({ id: this.idFw }));
    this.store
      .select(selectZIndexForWindow(this.idFw))
      .pipe(takeUntil(this.destroy$))
      .subscribe(z => {
        Promise.resolve().then(() => {
          this.zIndex = z;
          this.cdr.detectChanges();
        });
      });
    // Inicializamos el estado con los valores de la configuración
    if (this.widgetFloatingWindowConfig) {
      this.updateStateFromConfig();
      this.updateContainerLimits();
    }
    this.setupResizeListener();
    this.isRegistered = true;
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Reacciona a cambios en 'widgetFloatingWindowConfig'
    if (
      changes['widgetFloatingWindowConfig'] &&
      this.widgetFloatingWindowConfig
    ) {
      this.updateStateFromConfig();
      this.updateContainerLimits();
    }
  }

  ngOnDestroy(): void {
    if (this.isRegistered) {
      this.store.dispatch(removeFloatingWindow({ id: this.idFw }));
    }
    if (this.resizeSubscription) {
      this.resizeSubscription.unsubscribe();
    }
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Actualiza el estado con los valores de la configuración.
   * Conserva propiedades dinámicas (isDragging, isResizing, etc.).
   */
  private updateStateFromConfig(): void {
    // Evitar actualización durante interacción
    if (this._state.isDragging || this._state.isResizing) {
      return;
    }
    this._state = {
      ...this._state,
      x: this.widgetFloatingWindowConfig.x,
      y: this.widgetFloatingWindowConfig.y,
      width: this.widgetFloatingWindowConfig.width,
      height: this.widgetFloatingWindowConfig.height,
      isMinimized: false,
    };
  }

  /**
   * Calcula y actualiza los límites de movimiento basados en las dimensiones del contenedor del mapa.
   */
  private updateContainerLimits(): void {
    const mapContainer = this.document.getElementById('map');

    if (!mapContainer) {
      console.warn('El mapa no está disponible');
      return;
    }

    const { offsetLeft, offsetTop, offsetWidth, offsetHeight } = mapContainer;
    const rect = mapContainer.getBoundingClientRect();

    // Simplificar la lógica de límites basada en offsetTop
    this._state.leftLimit = offsetTop === 0 ? 0 : offsetLeft;
    this._state.topLimit = offsetTop === 0 ? 0 : offsetTop;
    this._state.rightLimit = offsetTop === 0 ? rect.width : rect.right;
    this._state.bottomLimit = offsetTop === 0 ? rect.height : rect.bottom;

    // Asegurar que la ventana esté dentro de los límites
    this._state.x = Math.max(
      this._state.leftLimit,
      Math.min(this._state.x, this._state.rightLimit - this._state.width)
    );
    this._state.y = Math.max(
      this._state.topLimit,
      Math.min(this._state.y, this._state.bottomLimit - this._state.height)
    );

    // Ajustar ancho y alto al contenedor si es necesario
    this._state.width = Math.min(this._state.width, offsetWidth);
    this._state.height = Math.min(this._state.height, offsetHeight);
  }

  /**
   * Configura un escuchador para el evento de redimensionamiento del navegador.
   */
  private setupResizeListener(): void {
    this.resizeSubscription = fromEvent(window, 'resize')
      .pipe(debounceTime(200)) // Espera 200ms para evitar actualizaciones excesivas
      .subscribe(() => {
        this.updateContainerLimits();
      });
  }

  // Getter para acceder al estado de forma segura
  get state(): FloatingWindowState {
    return this._state;
  }

  // Cierra la ventana emitiendo un evento
  closeWindow() {
    this.closeWindowEvent.emit(); // Emitir evento en lugar de lógica directa
  }

  /**
   * @description
   * Solicita al store que esta ventana flotante sea llevada al frente
   * respecto a las demás ventanas abiertas.
   *
   * Este método despacha la acción `bringFloatingWindowToFront`,
   * la cual actualiza el orden de apilamiento (`floatingWindowsOrder`)
   * en el estado global.
   * Una vez actualizado el orden, el selector `selectZIndexForWindow`
   * recalcula el z-index dinámico correspondiente a esta ventana.
   *
   * @returns {void}
   */
  public bringToFront(): void {
    this.store.dispatch(bringFloatingWindowToFront({ id: this.idFw }));
  }

  /**
   * @description
   * Genera un identificador único para esta instancia de la ventana flotante.
   *
   * El ID generado se utiliza para:
   * - Registrar la ventana dentro del estado global.
   * - Calcular su z-index dinámico.
   * - Identificarla al momento de traerla al frente.
   *
   * El formato final es: `fw-xxxxxxxx`, donde `xxxxxxxx` es un
   * fragmento aleatorio generado en base 36.
   *
   * @returns {string} Identificador único para la ventana flotante.
   */
  private generarIdFloatingWindow(): string {
    return 'fw-' + Math.random().toString(36).substring(2, 9);
  }
}
