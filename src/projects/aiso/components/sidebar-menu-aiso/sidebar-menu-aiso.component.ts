import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { WidgetRenderComponent } from '@app/widget-ui/components/widget-render/widget-render.component';
import { MapNavButtonsComponent } from '@app/widget/map-nav-buttons/components/map-nav-buttons/map-nav-buttons.component';
import { MapNavButtonsInterface } from '@app/widget/map-nav-buttons/interfaces/map-nav-buttons.interface';
import { Store } from '@ngrx/store';
import { UserInterfaceState } from '@app/core/interfaces/store/user-interface.model';
import { selectWidgetData } from '@app/core/store/map/map.selectors';
import { Subject, takeUntil } from 'rxjs';
import { Image } from 'primeng/image';
import { BuscarDireccionComponent } from '@app/widget/buscarDireccion/components/buscar-direccion/buscar-direccion.component';
import { createMapNavButtonsConfig } from '@projects/aiso/factories/map-nav-buttons.factory';
import { FloatingWindowConfig } from '@app/widget-ui/components/floating-window/interfaces/floating-window-config';
import { SetSingleComponentWidget } from '@app/core/store/user-interface/user-interface.actions';
import { MobileFloatingWindowComponent } from '@app/widget-ui/components/floating-window/components/mobile-floating-window/mobile-floating-window.component';

/**
 * @description
 * Componente que representa el menú lateral (sidebar) del visor AISO.
 * Permite abrir/activar widgets, manejar botones de navegación del mapa,
 * y adaptarse a pantallas móviles o de escritorio.
 * Gestiona la interacción con el store de NgRx para obtener la configuración
 * inicial de widgets.
 *
 * @autor Heidy Paola Lopez Sanchez
 */

@Component({
  selector: 'app-sidebar-menu-aiso',
  imports: [
    CommonModule,
    ButtonModule,
    TooltipModule,
    WidgetRenderComponent,
    MapNavButtonsComponent,
    Image,
    BuscarDireccionComponent,
    MobileFloatingWindowComponent,
  ],
  templateUrl: './sidebar-menu-aiso.component.html',
  styleUrl: './sidebar-menu-aiso.component.css',
})
export class SidebarMenuAisoComponent implements OnInit, OnDestroy {
  @Input() isMobile = false; //Indica si la vista es móvil para ajustar la UI y el espaciado de botones.
  private destroy$ = new Subject<void>(); //Subject usado como "notificador de destrucción".
  configMapNavButtonsInitial: MapNavButtonsInterface | undefined; // Configuración inicial que recibe el componente hijo `MapNavButtonsComponent`.
  activePanel: string | null = null; // Panel activo del sidebar.
  // widgetName = signal(''); // TODO: ajustar widget render
  widgetName = ''; // Nombre del widget activo
  showIdentifyWindow = false;
  identifyFloatingConfig!: FloatingWindowConfig;
  activeButton: string | null = null; // Botón activo del sidebar.

  /**
   * Constructor
   * @param userInterfaceStore Store de NgRx que contiene el slice `userInterface`.
   *        Se usa para leer datos (select) y enviar acciones (dispatch).
   */
  constructor(
    private userInterfaceStore: Store<{ userInterface: UserInterfaceState }>
  ) {}
  /**
   * Hook de inicialización del componente.
   * Se suscribe al store para obtener la configuración del widget `MapNavButtons`.
   * La suscripción se maneja con `takeUntil(this.destroy$)` para auto-liberarse al destruir el componente.
   */
  ngOnInit(): void {
    this.userInterfaceStore
      .select(selectWidgetData('MapNavButtons'))
      .pipe(takeUntil(this.destroy$))
      .subscribe(widgetData => {
        if (widgetData) {
          this.configMapNavButtonsInitial = createMapNavButtonsConfig(
            this.isMobile,
            widgetData
          );
        } else {
          console.warn('No se encontraron datos para el widget MapNavButtons');
        }
      });

    this.userInterfaceStore.dispatch(
      SetSingleComponentWidget({ nombre: 'Identify' })
    );
  }

  /**
   * Hook de destrucción del componente.
   * Emite y completa `destroy$` para cancelar todas las suscripciones dependientes.
   * Esto evita fugas de memoria y deja al componente en un estado limpio.
   */
  ngOnDestroy(): void {
    this.destroy$.next(); // Emite un valor para que `takeUntil` finalice las suscripciones activas
    this.destroy$.complete(); // Completa el Subject para liberar recursos
  }

  /**
   * @description
   * Maneja la activación/desactivación de un widget del menú.
   * @param widget Nombre del widget
   */
  onAction(widget: string) {
    if (this.activePanel === widget) {
      this.activePanel = null;
      this.widgetName = '';
    } else {
      this.activePanel = widget;
      this.widgetName = '';
      this.widgetName = widget;
    }
  }
  /**
   * @description
   * Activa o desactiva un botón del menú lateral.
   * @param button Nombre del botón
   */
  toggleButton(button: string): void {
    // Caso especial: Identificar en móvil
    if (this.isMobile && button === 'Identify') {
      // Alterna la visibilidad del floating window
      this.showIdentifyWindow = !this.showIdentifyWindow;

      if (this.showIdentifyWindow) {
        this.identifyFloatingConfig = this.createIdentifyConfig();
        this.activeButton = button;
      } else {
        this.activeButton = null;
      }

      // Asegura que el panel lateral no interfiera
      this.activePanel = null;
      return;
    }

    // Caso general
    this.showIdentifyWindow = false; // Cierra floating window si estaba abierto
    this.activeButton = this.activeButton === button ? null : button;
    this.onAction(button);
  }
  private createIdentifyConfig(): FloatingWindowConfig {
    return {
      x: 60,
      y: 150,
      width: 300,
      maxWidth: 500,
      height: 200,
      headerClass:
        'align-items-center surface-700 border-round-top-2xl cursor-move flex flex-wrap fwh p-2 text-white ng-star-inserted',
      textHeaderClass:
        'flex-auto flex-order-1 font-bold fwh__title overflow-hidden pl-1 pl-2 text-overflow-ellipsis text-xl',
      bodyClass: 'surface-0',
      enableMinimize: false,
      enableResize: true,
      enableClose: false,
      enableDrag: true,
    };
  }
  cerrarVentana() {
    this.showIdentifyWindow = false;
    this.activeButton = null;
  }
  /**
   * @description
   * Obtiene el título del panel activo según su identificador.
   */
  get panelTitle(): string | null {
    switch (this.activePanel) {
      case 'Identify':
        return 'Identificar';
      case 'Ayuda':
        return 'Ayuda';
      case 'ExportarMapa4':
        return 'Salida gráfica';
      case 'BaseMap':
        return 'Mapa Base';
      default:
        return null;
    }
  }
}
