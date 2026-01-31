import {
  Component,
  HostListener,
  AfterViewInit,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';

// responsive (CDK) para detectar pantallas pequeñas
import {
  BreakpointObserver,
  Breakpoints,
  LayoutModule,
} from '@angular/cdk/layout';

import { LayoutCComponent } from '@app/widget-ui/layouts/layout-c/layout-c.component';
import { MapComponent } from '@app/core/components/map/map.component';

import { SidebarGmComponent } from '@projects/gobiernomayor/components/sidebar/components/sidebar-gm/sidebar-gm.component';
import { BuscarGobiernomayorComponent } from '@projects/gobiernomayor/components/buscar-gobiernomayor/buscar-gobiernomayor.component';
import { MapLocationComponent } from '@projects/gobiernomayor/components/map-location/map-location.component';
import { CoordinateScaleLineComponent } from '@projects/gobiernomayor/components/coordinate-scale-line/coordinate-scale-line.component';
import { FloatingMapControlsComponent } from '@projects/gobiernomayor/components/floating-map-controls/floating-map-controls.component';
import { MapLayerManagerService } from '@app/core/services/map-layer-manager/map-layer-manager.service';
import { ExportMap5WrapperComponent } from '@projects/gobiernomayor/components/export-map5-wrapper/export-map5-wrapper.component';

import { FloatingWindowComponent } from '@app/widget-ui/components/floating-window/components/floating-window/floating-window.component';
import { FloatingWindowConfig } from '@app/widget-ui/components/floating-window/interfaces/floating-window-config';
import { FloatingMenuComponent } from '@projects/gobiernomayor/components/floating-menu/floating-menu.component';

import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { DrawerModule } from 'primeng/drawer';

import { Store } from '@ngrx/store';
import { AbrirWidget } from '@app/core/store/user-interface/user-interface.actions';

import { MapService } from '@app/core/services/map-service/map.service';
import { LegendComponent } from '@projects/gobiernomayor/components/legend/legend.component';
import { LayersContentTableManagerService } from '@app/core/services/layers-content-table-manager/layers-content-table-manager.service';
import { BasemapOverrideComponent } from '@projects/gobiernomayor/components/basemap-override/basemap-override.component';

import { WindowSingleGMRenderComponentComponent } from '@projects/gobiernomayor/components/window-single-gm-render-component/window-single-gmrender-component.component';
import { Toast } from 'primeng/toast';

/**
 * IndexPageComponent
 * ------------------
 * Componente principal del **Visor de Gobierno Mayor**.
 *
 * Responsabilidades:
 * - Renderizar el mapa base (OpenLayers) y los overlays asociados (coordenadas, ubicación, escala).
 * - Gestionar el **layout** con sidebar derecho redimensionable/colapsable.
 * - Orquestar la apertura/cierre de **ventanas flotantes** (widgets) fuera de contenedores
 *   posicionados para evitar restricciones de arrastre/z-index.
 * - Mostrar el **buscador** (panel izquierdo) y sincronizar su visibilidad.
 * - Mantener una **ventana de leyenda** abierta por defecto al iniciar la página.
 *
 * Notas:
 * - El host global de ventanas se maneja aquí (no en el contenedor de botones)
 *   para que las ventanas se puedan mover libremente sobre el mapa.
 * - Tras cambios de ancho del sidebar se llama a `map.updateSize()` para evitar
 *   glitches de render en OpenLayers.
 *
 * @author Sergio Alonso Mariño Duque
 * @date 2025-08-26
 */

/** Ventana que renderiza un widget real a través de WindowComponentRender */
interface RendererWin {
  name: string;
  useRenderer: true;
  title: string;
}

/** Ventana “placeholder” (sin widget real), se muestra dentro de FloatingWindow */
interface PlaceholderWin {
  name: string;
  useRenderer: false;
  title: string;
  placeholderConfig: FloatingWindowConfig;
}

/** Unión de tipos para el arreglo de ventanas abiertas */
type OpenWin = RendererWin | PlaceholderWin;

@Component({
  selector: 'app-index-page',
  standalone: true,
  imports: [
    CommonModule,
    LayoutModule,
    DrawerModule,
    ButtonModule,
    TooltipModule,
    LayoutCComponent,
    MapComponent,
    FloatingMapControlsComponent,
    MapLocationComponent,
    CoordinateScaleLineComponent,
    SidebarGmComponent,
    BuscarGobiernomayorComponent,
    FloatingWindowComponent,
    LegendComponent,
    FloatingMenuComponent,
    ExportMap5WrapperComponent,
    BasemapOverrideComponent,
    WindowSingleGMRenderComponentComponent,
    Toast,
  ],
  templateUrl: './index-page.component.html',
})
export class IndexPageComponent implements AfterViewInit, OnDestroy {
  /** Visibilidad del panel de búsqueda (botón lupa) */
  showSearch = false;

  /** Controla el render de overlays dependientes de `OL.Map` */
  mapReady = false;

  /** Timer para chequear la existencia de `map` sin bloquear el ciclo */
  private mapCheckTimer: ReturnType<typeof setTimeout> | null = null;

  /**
   * Ventana de leyenda: visible al iniciar la página.
   * Se renderiza como una ventana flotante independiente del sistema de widgets.
   */
  showLegendWindow = true;

  // estado para la leyenda en móvil (Drawer inferior)
  legendSheetOpen = false;

  // flag responsive (XSmall/Small)
  isSmallScreen = false;

  /** Ventanas abiertas (el orden determina el z-index visual) */
  openWindows: OpenWin[] = [];

  constructor(
    private mapSvc: MapService,
    private store: Store,
    private mapLayerManageService: MapLayerManagerService,
    private bp: BreakpointObserver,
    private layersContentTableManagerService: LayersContentTableManagerService
  ) {
    // detectar XS/SM para cambiar el modo de leyenda (ventana vs drawer)
    this.bp.observe([Breakpoints.XSmall, Breakpoints.Small]).subscribe(res => {
      this.isSmallScreen = res.matches;

      if (this.isSmallScreen) {
        // En móvil: no usamos ventana flotante; usamos Drawer
        this.showLegendWindow = false;
      } else {
        // En desktop: cerramos Drawer y mostramos ventana flotante
        this.legendSheetOpen = false;
        this.showLegendWindow = true;
      }
    });
  }

  // ---------------------------------------------------------------------------
  // Ciclo de vida
  // ---------------------------------------------------------------------------

  /**
   * afterViewInit()
   * ---------------
   * Defer inicial para esperar a que exista `OL.Map` antes de renderizar overlays.
   * Evita errores de expresión cambiada y condiciones de carrera.
   */
  ngAfterViewInit(): void {
    setTimeout(() => this.waitForMap(), 0);
  }

  /**
   * onDestroy()
   * -----------
   * Limpia el timer de polling si sigue activo.
   */
  ngOnDestroy(): void {
    if (this.mapCheckTimer !== null) {
      clearTimeout(this.mapCheckTimer);
    }
  }

  /**
   * waitForMap()
   * ------------
   * Reintenta cada 50ms hasta que `MapService` exponga una instancia de `OL.Map`.
   * Cuando existe, habilita `mapReady` (lo que dispara los overlays dependientes).
   */
  private waitForMap(): void {
    if (this.mapSvc.getMap()) {
      setTimeout(() => {
        this.mapReady = true;
      }, 0);
      return;
    }
    this.mapCheckTimer = setTimeout(() => this.waitForMap(), 50);
  }

  // ---------------------------------------------------------------------------
  // UI: buscador, sidebar y atajos
  // ---------------------------------------------------------------------------

  /** Alterna la visibilidad del panel de búsqueda (lupa) */
  toggleSearch(): void {
    this.showSearch = !this.showSearch;
  }

  /** Atajo: cerrar buscador con `Esc` */
  @HostListener('document:keydown.escape')
  onEsc(): void {
    this.showSearch = false;

    //NUEVO: también cierra el Drawer de leyenda si está abierto (móvil)
    this.legendSheetOpen = false;
  }

  /**
   * onSidebarResize()
   * -----------------
   * Se invoca cuando el layout notifica cambios de ancho del sidebar.
   * Tras el siguiente tick, llama a `map.updateSize()` para que OpenLayers re-calcule el viewport.
   */
  onSidebarResize(_size: number): void {
    void _size; // no usamos el valor, pero mantenemos la firma
    if (this.mapReady) {
      setTimeout(() => this.mapSvc.getMap()?.updateSize(), 0);
    }
  }

  /**
   * onWindowClosed(name)
   * --------------------
   * Cierra una ventana por nombre y, si se trataba de un renderer real, sincroniza
   * el estado en el store (NgRx) para ese widget.
   */
  onWindowClosed(name: string): void {
    const win = this.openWindows.find(w => w.name === name);
    this.openWindows = this.openWindows.filter(w => w.name !== name);

    // Si era un widget real, reflejar el cierre en el store
    if (win?.useRenderer) {
      this.store.dispatch(AbrirWidget({ nombre: name, estado: false }));
    }
  }

  getConfigFloatingWindow(): FloatingWindowConfig {
    return {
      x: 449,
      y: 83,
      width: 300,
      height: 300,
      maxHeight: 900,
      maxWidth: 900,
      enableClose: true,
      enableResize: true,
      enableDrag: true,
      enableMinimize: true,
      buttomSize: 'small',
      buttomRounded: false,
      iconMinimize: 'pi pi-chevron-up',
      iconMaximize: 'pi pi-chevron-down',
      iconClose: 'pi pi-times',
      iconMinimizePosition: 'left',
      textHeaderClass: 'text-white',
      headerClass:
        'bg-primary text-white flex justify-content-between align-items-center px-3 py-1 gap-2 border-round-top-xl shadow-2 font-medium cursor-move',
    };
  }

  getMobileOverrides(): Partial<FloatingWindowConfig> {
    return {
      x: 8,
      y: 64,
      width: 360,
      height: 420,
      // Header diferente en móvil si quieres
      headerClass:
        'bg-primary text-white flex justify-content-between align-items-center px-3 py-1 gap-2 border-round-top-xl shadow-2 font-medium',
    };
  }

  /**
   * Configuración inicial de la ventana de leyenda.
   * - `x`/`y`: posición inicial (no interfiere con la botonera ni la lupa).
   * - `enableClose`: `false` si no quieres que la cierren (ajusta según requerimiento).
   * - `enableResize`/`enableDrag`/`enableMinimize`: UX consistente con las demás ventanas.
   */
  legendWindowCfg: FloatingWindowConfig = {
    width: 360,
    height: 420,
    x: 96,
    y: 96,
    enableClose: false,
    enableResize: true,
    enableDrag: true,
    enableMinimize: true,
    iconMinimize: 'pi pi-chevron-up',
    iconMaximize: 'pi pi-chevron-down',
    iconClose: 'pi pi-times',
    iconMinimizePosition: 'left',
    textHeaderClass: 'text-white',
    headerClass:
      'bg-primary text-white flex justify-content-between align-items-center px-3 py-1 gap-2 border-round-top-xl shadow-2 font-medium cursor-move',
  };

  // Flag para mostrar/ocultar la ventana de leyenda en móvil
  showLegendMobileWin = false;

  // Abre la floating window móvil
  openLegendWindowMobile(): void {
    this.showLegendMobileWin = true;
    // microtask: deja que renderice y luego refresca el mapa si hace falta
    setTimeout(() => this.mapSvc.getMap()?.updateSize(), 0);
  }

  // Cierra la floating window móvil (lo llama la X del header)
  closeLegendWindowMobile(): void {
    this.showLegendMobileWin = false;
    setTimeout(() => this.mapSvc.getMap()?.updateSize(), 0);
  }

  getLegendMobileWindowConfig(): FloatingWindowConfig {
    return {
      x: 12, // arranque cómodo en móvil
      y: 72,
      width: 360,
      height: 420,
      enableClose: true,
      enableResize: true,
      enableDrag: true,
      enableMinimize: true,
      headerClass:
        'bg-primary text-white flex justify-content-between align-items-center px-3 py-1 gap-2 border-round-top-xl shadow-2 font-medium',
    };
  }
}
