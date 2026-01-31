import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '@app/core/widget/playground/components/sidebar/sidebar.component';
import { TopbarComponent } from '@app/core/widget/playground/components/topbar/topbar.component';
import { WidgetItemFuncionState } from '@app/core/interfaces/store/user-interface.model';
import { UserInterfaceService } from '@app/core/services/user-interface-service/user-interface.service';
import { WindowComponentRenderComponent } from '@app/widget-ui/components/window-component-render/window-component-render.component';
import { MapComponent } from '@app/core/components/map/map.component';
import { ReadmeModalComponent } from '@app/core/widget/playground/components/readme-modal/readme-modal.component';
import { ChangeDetectorRef } from '@angular/core';
import { Store } from '@ngrx/store';
import {
  AbrirWidget,
  SetSingleComponentWidget,
} from '@app/core/store/user-interface/user-interface.actions';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

/**
 * Componente PlaygroundComponent
 *
 * Este es el componente contenedor principal del visor geográfico.
 * Su función es gestionar:
 * - La inicialización y persistencia de la configuración de widgets (localStorage).
 * - El renderizado condicional de widgets como ventanas flotantes.
 * - La interacción entre Topbar, Sidebar y la lógica interna del visor.
 *
 * Se apoya en el store de NgRx, servicios de UI y eventos entre componentes.
 *
 * Componentes hijos:
 * - SidebarComponent
 * - TopbarComponent
 * - WindowComponentRenderComponent (renderizador de widgets)
 * - ReadmeModalComponent (modal con documentación de widgets)
 * - MapComponent (mapa base del visor)
 * @author Sergio Alonso Mariño Duque
 * @date 05-08-2025
 * @version 1.0.0
 *
 */

@Component({
  selector: 'app-playground-page',
  standalone: true,
  imports: [
    CommonModule,
    SidebarComponent,
    TopbarComponent,
    MapComponent,
    ReadmeModalComponent,
    WindowComponentRenderComponent,
    ToastModule,
  ],
  providers: [MessageService],
  templateUrl: './playground-page.component.html',
  styleUrl: './playground-page.component.scss',
})
export class PlaygroundPageComponent implements OnInit {
  /**
   * Lista completa de widgets disponibles.
   * Incluye su estado `abierto` que se usa para el sidebar y la topbar.
   */
  widgets: WidgetItemFuncionState[] = [];
  /**
   * Orden actual de apertura de widgets.
   * Controla el z-index de las ventanas flotantes.
   */
  public openOrder: string[] = [];

  /**
   * Controla si el contenedor del sidebar está oculto visualmente.
   * Se usa para animaciones.
   */
  sidebarHostHidden = false; // ← oculta el DIV que aloja al sidebar

  /**
   * Estilos inline para mostrar el sidebar con animación.
   */
  sidebarHostExpandedStyle = {
    width: '16rem',
    transition: 'width 300ms ease-in-out',
    overflow: 'hidden',
    position: 'relative',
  } as const;

  /**
   * Estilos inline para ocultar el sidebar con animación.
   */
  sidebarHostCollapsedStyle = {
    width: '0px',
    transition: 'width 300ms ease-in-out',
    overflow: 'hidden',
    position: 'relative',
  } as const;

  constructor(
    private uiService: UserInterfaceService,
    private store: Store,
    private cdr: ChangeDetectorRef,
    private messageService: MessageService
  ) {}

  /**
   * Inicializa el componente cargando la configuración previa (si existe)
   * y despachando acciones al store para sincronizar los widgets abiertos.
   */
  ngOnInit(): void {
    const configRaw = localStorage.getItem('widgetConfig');

    // Si no hay configuración guardada, cargamos todos cerrados
    if (!configRaw) {
      this.widgets = this.uiService.widgetsConfig.map(widget => ({
        ...widget,
        abierto: false,
      }));
      return;
    }

    try {
      const config = JSON.parse(configRaw);
      const widgetsActivos: string[] = config.widgetsActivos || [];

      this.widgets = this.uiService.widgetsConfig.map(widget => {
        const estaActivo = widgetsActivos.includes(widget.nombreWidget);
        // Sincronizar con el store
        if (estaActivo) {
          this.store.dispatch(
            AbrirWidget({ nombre: widget.nombreWidget, estado: true })
          );
        }

        return {
          ...widget,
          abierto: estaActivo,
        };
      });
    } catch (error) {
      console.warn('Error al leer configuración de widgets:', error);
      // Si hay error, cargar todo como cerrado
      this.widgets = this.uiService.widgetsConfig.map(widget => ({
        ...widget,
        abierto: false,
      }));
    }
  }

  /**
   * Actualiza el estado de un widget activado/desactivado desde el Sidebar.
   * No modifica el orden ni sincroniza con el store.
   */
  onToggleWidget(widgetActualizado: WidgetItemFuncionState): void {
    const nombre = widgetActualizado.nombreWidget;
    const seleccionado = !!widgetActualizado.abierto;

    // Solo actualiza selección (Topbar). No toques openOrder ni el store aquí.
    this.widgets = this.widgets.map(w =>
      w.nombreWidget === nombre ? { ...w, abierto: seleccionado } : w
    );
  }

  /**
   * Abre un widget desde la Topbar (acceso directo).
   * - Lo sincroniza en el store.
   * - Lo lleva al frente si ya está abierto.
   * - Lo agrega a la lista de ventanas abiertas (openOrder).
   */
  onOpenFromTopbar(nombre: string) {
    // 1) prepara la config en el store
    this.store.dispatch(SetSingleComponentWidget({ nombre }));

    // 2) si ya está abierta, traer al frente
    if (this.openOrder.includes(nombre)) {
      this.bringToFront(nombre);
      return;
    }

    // 3) abrir (agregar a la lista) y forzar detección en el mismo tick
    this.openOrder = [...this.openOrder, nombre];
    this.cdr.detectChanges(); // <- clave si el render dependía del siguiente ciclo

    // 4) (opcional) sincronizar “ventana abierta”
    this.store.dispatch(AbrirWidget({ nombre, estado: true }));
  }

  /**
   * Devuelve la lista de widgets seleccionados (abiertos) en orden de apertura.
   * Se utiliza en la Topbar.
   */
  get widgetsActivosOrdenados(): WidgetItemFuncionState[] {
    const map = new Map(this.widgets.map(w => [w.nombreWidget, w] as const));
    return this.openOrder
      .map(n => map.get(n))
      .filter((w): w is WidgetItemFuncionState => w?.abierto === true);
  }

  /**
   * Borra la configuración local de widgets y cierra todos los abiertos.
   */
  async clearWidgetsConfig() {
    localStorage.removeItem('widgetConfig');

    // Cierra todas las ventanas abiertas usando openOrder
    const abiertosAhora = [...this.openOrder];
    this.openOrder = [];
    abiertosAhora.forEach(nombre =>
      this.store.dispatch(AbrirWidget({ nombre, estado: false }))
    );

    // Des-selecciona en Sidebar/Topbar
    this.widgets = this.widgets.map(w => ({ ...w, abierto: false }));

    this.messageService.add({
      severity: 'info',
      summary: 'Configuración borrada',
      detail: 'Todos los widgets fueron cerrados.',
      life: 2500,
    });
  }

  // Readme Modal (documentación por widget)
  readmeVisible = false;
  readmeUrl = '';

  private toAssetsUrl(sourcePath: string): string {
    if (!sourcePath) return '';

    // Quita prefijos de alias o relativos a src
    const PREFIXES = ['@app/widget/', 'app/widget/', 'src/app/widget/'];
    let subpath = sourcePath.trim();
    for (const p of PREFIXES) {
      if (subpath.startsWith(p)) {
        subpath = subpath.slice(p.length);
        break;
      }
    }

    // Asegura que no quede slash inicial
    subpath = subpath.replace(/^\/+/, '');

    // Ruta final servida por Angular (según tu angular.json)
    return `assets/widgets/${subpath}`;
  }

  mostrarReadme(url: string) {
    this.readmeUrl = this.toAssetsUrl(url);
    this.readmeVisible = true;
  }

  /**
   * Lleva una ventana al frente (última en el z-index visual).
   */
  bringToFront(nombre: string) {
    if (!this.openOrder.includes(nombre)) return;
    this.openOrder = this.openOrder.filter(n => n !== nombre).concat(nombre);
  }

  /**
   * Cierra la ventana desde el botón "X", sin modificar el estado del Sidebar.
   */
  onWindowClosed(nombreWidget: string) {
    this.openOrder = this.openOrder.filter(n => n !== nombreWidget);
    this.store.dispatch(AbrirWidget({ nombre: nombreWidget, estado: false }));
  }

  /**
   * Lista de widgets activos (abiertos) usada por la Topbar.
   */
  get widgetsActivos(): WidgetItemFuncionState[] {
    // “Activos” = seleccionados en Sidebar (para mostrar en Topbar)
    return this.widgets.filter(w => w.abierto);
  }

  /**
   * Lista de widgets con ventana flotante abierta, en orden z-index.
   */
  get widgetsConVentana(): WidgetItemFuncionState[] {
    const map = new Map(this.widgets.map(w => [w.nombreWidget, w] as const));
    return this.openOrder
      .map(n => map.get(n))
      .filter((w): w is WidgetItemFuncionState => !!w);
  }

  /**
   * TrackBy optimizado para renderizado de listas de ventanas.
   */
  trackByNombre = (_: number, w: WidgetItemFuncionState) => w.nombreWidget;

  /**
   * Alterna la visibilidad del contenedor lateral (sidebar).
   */
  onToggleSidebar() {
    this.sidebarHostHidden = !this.sidebarHostHidden;
  }
}
