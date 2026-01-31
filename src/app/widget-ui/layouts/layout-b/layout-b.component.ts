import {
  Component,
  ElementRef,
  Input,
  TemplateRef,
  ViewChild,
  OnInit,
  OnDestroy,
  EventEmitter,
  Output,
} from '@angular/core';
import { DrawerModule } from 'primeng/drawer';
import { ButtonModule } from 'primeng/button';
import {
  BreakpointObserver,
  Breakpoints,
  BreakpointState,
} from '@angular/cdk/layout';
import {
  debounceTime,
  distinctUntilChanged,
  map,
  Subject,
  takeUntil,
} from 'rxjs';

/**
 * @class LayoutBComponent
 * @description
 * Componente de layout genérico para el **Visor Geográfico CRIC **.
 * Gestiona el diseño base que incluye la barra lateral (sidebar),
 * detección del modo móvil mediante breakpoints, y redimensionamiento dinámico del panel lateral.
 *
 * Además, se encarga de emitir eventos al componente padre cuando
 * cambia el modo de visualización (móvil o escritorio).
 *
 * @date 14-10-2025
 * @version 1.0.0
 * @author
 * Carlos Muñoz — IGAC (javier.munoz@igac.gov.co)
 */
@Component({
  selector: 'app-layout-b', // Nombre del selector para usar el componente en plantillas
  imports: [DrawerModule, ButtonModule], // Importación de módulos de PrimeNG usados en el template
  templateUrl: './layout-b.component.html', // Archivo HTML asociado
  styleUrl: './layout-b.component.scss', // Estilos específicos del componente
})
export class LayoutBComponent implements OnInit, OnDestroy {
  /**
   * Subject privado utilizado como "notificador" para destruir todas las
   * suscripciones activas cuando el componente se destruye,
   * evitando fugas de memoria.
   * @private
   */
  private destroy$ = new Subject<void>();

  /**
   * Template inyectable desde el componente padre para
   * renderizar contenido dinámico dentro del sidebar.
   * @type {TemplateRef<unknown> | null}
   * @input
   */
  @Input() sidebarTemplate: TemplateRef<unknown> | null = null;

  /**
   * Referencia directa al contenedor del sidebar en el DOM.
   * Se usa para operaciones de medición o manipulación directa del contenido.
   * @type {ElementRef}
   * @viewChild
   */
  @ViewChild('sidebarContent', { static: false }) sidebarContent!: ElementRef;

  /**
   * Evento que se emite cada vez que el modo de visualización cambia
   * entre móvil y escritorio.
   * @event
   * @type {EventEmitter<boolean>}
   */
  @Output() isMobileChange: EventEmitter<boolean> = new EventEmitter<boolean>();

  /**
   * Variables de estado del componente
   */

  /** @property {boolean} isMobile - Indica si el componente se muestra en modo móvil. */
  isMobile = false;

  /** @property {boolean} isminimized - Controla si el sidebar está colapsado. */
  isminimized = false;

  /** @property {boolean} showDrawerWithSidebar - Muestra el sidebar dentro de un drawer (modo móvil). */
  showDrawerWithSidebar = false;

  /**
   * Variables relacionadas con el redimensionamiento del sidebar
   */

  /** @property {number} sidebarWidth - Ancho inicial del sidebar (en píxeles). */
  sidebarWidth = 385;

  /** @property {number} minSidebarWidth - Ancho mínimo permitido para el sidebar. */
  minSidebarWidth = 385;

  /** @property {number} maxSidebarWidth - Ancho máximo permitido para el sidebar. */
  maxSidebarWidth = 800;

  /** @property {boolean} isResizing - Indica si actualmente se está redimensionando el sidebar. */
  isResizing = false;

  /** @property {boolean} isHovering - Indica si el cursor está sobre el "handle" de redimensionamiento. */
  isHovering = false;

  /**
   * Crea una instancia del componente LayoutBComponent.
   * Inyecta el servicio `BreakpointObserver` para observar cambios de tamaño en pantalla.
   * @param {BreakpointObserver} breakpointObserver - Servicio de Angular CDK que detecta cambios en los breakpoints definidos.
   */
  constructor(private breakpointObserver: BreakpointObserver) {}

  /**
   * Hook de inicialización del componente.
   *
   * Se suscribe a los cambios de tamaño de pantalla usando el `BreakpointObserver`.
   * Cuando el ancho corresponde a pantallas pequeñas (`XSmall` o `Small`),
   * actualiza el estado `isMobile` y emite el evento `isMobileChange`.
   *
   * @lifecycle
   * @returns {void}
   */
  ngOnInit(): void {
    this.breakpointObserver
      .observe([Breakpoints.XSmall, Breakpoints.Small]) // Se observan breakpoints de pantallas pequeñas
      .pipe(
        debounceTime(200), // Evita spam de emisiones
        map((state: BreakpointState) => state.matches),
        distinctUntilChanged(), // Solo emite si cambia el valor
        takeUntil(this.destroy$)
      ) // Se asegura la destrucción de la suscripción
      .subscribe((isMobile: boolean) => {
        this.isMobile = isMobile;
        this.isMobileChange.emit(this.isMobile);
      });
  }

  /**
   * Hook de destrucción del componente.
   * Limpia las suscripciones activas para liberar recursos.
   *
   * @lifecycle
   * @returns {void}
   * @effect
   * Completa el `Subject` `destroy$`, provocando la finalización de todas las suscripciones.
   */
  ngOnDestroy(): void {
    this.destroy$.next(); // Emite un valor para cerrar las suscripciones
    this.destroy$.complete(); // Completa el Subject
  }

  /**
   * Alterna el estado de minimización de la barra lateral.
   * Si está minimizada, la expande; si está expandida, la minimiza.
   * @returns {void}
   */
  onMinimized(): void {
    this.isminimized = !this.isminimized;
  }

  /**
   * Alterna la visibilidad del drawer que contiene el sidebar (solo en pantallas pequeñas).
   * @returns {void}
   */
  toggleDrawerWidSidebar(): void {
    this.showDrawerWithSidebar = !this.showDrawerWithSidebar;
  }

  /**
   * Inicia el proceso de redimensionamiento del sidebar cuando el usuario
   * mantiene presionado el botón del mouse sobre el handle.
   *
   * @param {MouseEvent} event - Evento de clic inicial sobre el handle.
   * @returns {void}
   * @effect
   * Modifica dinámicamente el ancho del sidebar en función del movimiento del cursor.
   * Añade listeners globales al documento y ajusta el cursor del usuario.
   */
  startResize(event: MouseEvent): void {
    this.isResizing = true; // Marca que se está redimensionando
    event.preventDefault(); // Evita comportamientos por defecto del navegador

    // Capturamos la posición inicial del cursor y el ancho actual
    const startX = event.clientX;
    const startWidth = this.sidebarWidth;

    /**
     * Función interna que se ejecuta en cada movimiento del mouse
     */
    const onMouseMove = (e: MouseEvent) => {
      if (!this.isResizing) return; // Si no está en modo resize, no hace nada

      // Calcula la diferencia horizontal desde que empezó el resize
      const deltaX = e.clientX - startX;
      // Nuevo ancho propuesto
      const newWidth = startWidth + deltaX;

      // Verifica que el nuevo ancho esté dentro de los límites permitidos
      if (
        newWidth >= this.minSidebarWidth &&
        newWidth <= this.maxSidebarWidth
      ) {
        this.sidebarWidth = newWidth; // Aplica el nuevo ancho
      }
    };

    /**
     * Función interna que se ejecuta cuando se suelta el mouse
     */
    const onMouseUp = () => {
      this.isResizing = false; // Termina el modo resize
      // Elimina los listeners de eventos
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      // Restaura estilos del cursor
      document.body.style.cursor = 'default';
      document.body.style.userSelect = 'auto';
    };

    // Se añaden listeners globales mientras se hace resize
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);

    // Cambia el estilo del cursor mientras se redimensiona
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }

  /**
   * Devuelve el ancho actual del sidebar con unidad de píxeles (`px`).
   * En modo móvil siempre retorna el ancho mínimo.
   *
   * @returns {string} Ancho del sidebar (por ejemplo, `"385px"`).
   */
  getSidebarWidthPx(): string {
    return this.isMobile
      ? `${this.minSidebarWidth}px`
      : `${this.sidebarWidth}px`;
  }

  /**
   * Devuelve el ancho del contenido interno del sidebar (restando 1px para el área del handle).
   *
   * @returns {string} Ancho ajustado del contenido del sidebar (por ejemplo, `"384px"`).
   */
  getSidebarContentWidthPx(): string {
    return this.isMobile
      ? `${this.minSidebarWidth - 1}px`
      : `${this.sidebarWidth - 1}px`; // Se resta el espacio del handle
  }
}
