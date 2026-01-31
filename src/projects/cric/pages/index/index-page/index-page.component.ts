import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutBComponent } from '@app/widget-ui/layouts/layout-b/layout-b.component';

import { ToastModule } from 'primeng/toast';
import { MapComponent } from '@app/core/components/map/map.component';
import { MapLayerManagerService } from '@app/core/services/map-layer-manager/map-layer-manager.service';

import { ContentTableV3Component } from '@app/widget/content-table-version-3/components/content-table-v3/content-table-v3.component';
import { LegendSecondVersionComponent } from '@app/widget/legend-v2/components/legend-second-version/legend-second-version.component';
import { FloatingWindowComponent } from '@app/widget-ui/components/floating-window/components/floating-window/floating-window.component';
import { FloatingWindowConfig } from '@app/widget-ui/components/floating-window/interfaces/floating-window-config';
import { ItemWidgetState } from '@app/core/interfaces/store/user-interface.model';

import { CricRightbarComponent } from '@projects/cric/components/cric-rightbar/cric-rightbar.component';
import { LeftbarHeaderComponent } from '@projects/cric/components/leftbar-header/leftbar-header.component';
import { CricBottombarComponent } from '@projects/cric/components/cric-bottombar/cric-bottombar.component';
import { WindowSingleCricComponentRenderComponent } from '@projects/cric/components/window-single-cric-component-render/window-single-cric-component-render.component';
import { MobileCricBottombarComponent } from '@projects/cric/components/mobile-cric-bottombar/mobile-cric-bottombar.component';
import { MiniMapV2Component } from '@app/widget/miniMap_v2/components/mini-map-v2/mini-map-v2.component';
import { MapasBase } from '@app/core/interfaces/enums/MapasBase.enum';
import { environment } from 'environments/environment';
import { LayersContentTableManagerService } from '@app/core/services/layers-content-table-manager/layers-content-table-manager.service';
/**
 * Componente `IndexPageComponent`
 *
 * Representa la **página principal** de la aplicación SIG CRIC.
 */

/**
 * @description Componente que representa la **página principal** del visor geográfico CRIC y se organizan:
 *  - El encabezado (barra izquierda superior).
 *  - El contenido lateral izquierdo (tabla).
 *  - La barra lateral derecha.
 *  - El mapa principal y localización.
 *  - Ventanas flotantes con widgets configurables.
 *  - Barra inferior.
 *
 * Este componente se encarga de inicializar configuraciones predeterminadas para ventanas flotantes y widgets activos.
 * @author javier.munoz-igac.gov.co
 */
@Component({
  selector: 'app-index-page', // Selector para usar el componente en las plantillas
  standalone: true,
  imports: [
    CommonModule,
    LayoutBComponent,
    CricRightbarComponent,
    ToastModule,
    MapComponent,
    WindowSingleCricComponentRenderComponent,
    LeftbarHeaderComponent,
    ContentTableV3Component,
    LegendSecondVersionComponent,
    FloatingWindowComponent,
    CricBottombarComponent,
    WindowSingleCricComponentRenderComponent,
    MobileCricBottombarComponent,
    MiniMapV2Component,
  ],
  templateUrl: './index-page.component.html', // Plantilla asociada
  styleUrl: './index-page.component.scss', // Estilos específicos
})
export class IndexPageComponent {
  /**
   * Configuración inicial de la ventana flotante
   * (posición, dimensiones, comportamiento).
   */
  configFloatingWindow: FloatingWindowConfig;

  /**
   * Configuración inicial de la ventana flotante para la versión movíl
   * (posición, dimensiones, comportamiento).
   */
  configMobileFloatingWindow: FloatingWindowConfig;

  /**
   * Configuración inicial de la ventana flotante con opción de cerrar ventana
   * (posición, dimensiones, comportamiento).
   */
  configClosedFloatingWindow: FloatingWindowConfig;

  /**
   * Estado de configuración del widget actual abierto.
   * Contiene información como título, ruta, dimensiones, etc.
   */
  configuracionWidgetAbierto: ItemWidgetState;

  /**
   * Variable local para saber si está en modo móvil
   */
  isMobileFromLayout = false;

  /**
   * Mapa base por defecto
   */
  baseMiniMap = environment.map.baseLayer as MapasBase;

  /**
   * Constructor del componente.
   * Inicializa las configuraciones llamando a los métodos internos.
   */
  constructor(
    private mapLayerManageService: MapLayerManagerService,
    private layerContenTableManageService: LayersContentTableManagerService
  ) {
    this.configFloatingWindow = this.getConfigFloatingWindow();
    this.configuracionWidgetAbierto = this.getConfiguracionWidgetAbierto();
    this.configMobileFloatingWindow = this.getConfigMobileFloatingWindow();
    this.configClosedFloatingWindow = this.getConfigClosedFloatingWindow();
  }

  /** Método que recibe el valor del layout-b */
  onIsMobileChange(value: boolean) {
    this.isMobileFromLayout = value;
  }

  /**
   * Retorna la configuración predeterminada de la ventana flotante.
   * Incluye propiedades como tamaño, posición y habilitación de acciones.
   */
  getConfigFloatingWindow(): FloatingWindowConfig {
    return {
      x: 449, // Posición horizontal inicial
      y: 83, // Posición vertical inicial
      width: 300, // Ancho inicial
      height: 300, // Alto inicial
      maxHeight: 900, // Altura máxima permitida
      maxWidth: 900, // Ancho máximo permitido
      enableClose: false, // No permite cierre
      enableResize: true, // Permite redimensionar
      enableDrag: true, // Permite arrastrar
      enableMinimize: true, // Permite minimizar
      buttomSeverity: 'danger', // Estilo para los botones
      buttomSize: 'small', // Tamaño para los botones
      buttomRounded: true, // Estilo redondeo para los botones
      iconMinimize: 'pi cric-zoom_out', // Icono minimizar
      iconMaximize: 'pi pi-chevron-up', // Icono Maximizar
      iconClose: 'pi pi-times', // Icono Cerrar
      headerClass:
        'fwh bg-white text-white flex flex flex-wrap align-items-center cursor-move p-2 border-round-top-2xl',
      buttomText: true,
    };
  }

  /**
   * Retorna la configuración predeterminada de la ventana flotante versión movíl.
   * Incluye propiedades como tamaño, posición y habilitación de acciones.
   */
  getConfigMobileFloatingWindow(): FloatingWindowConfig {
    return {
      ...this.getConfigFloatingWindow(),
      enableClose: true,
      headerClass:
        'bg-white border-round-top-2xl justify-content-end flex flex-row align-items-center h-3rem',
    };
  }

  /**
   * Retorna la configuración predeterminada de la ventana flotante versión movíl.
   * Incluye propiedades como tamaño, posición y habilitación de acciones.
   */
  getConfigClosedFloatingWindow(): FloatingWindowConfig {
    return {
      ...this.getConfigFloatingWindow(),
      enableClose: true,
      x: 719,
      y: 343,
    };
  }

  /**
   * Retorna la configuración predeterminada del widget
   * que se encuentra abierto en la ventana flotante.
   */
  getConfiguracionWidgetAbierto(): ItemWidgetState {
    return {
      nombreWidget: 'Leyenda V2',
      ruta: '@app/widget/legend-v2/components/legend-second-version/legend-second-version.component',
      titulo: 'Leyenda V2',
      ancho: 300,
      alto: 300,
      altoMaximo: 900,
      anchoMaximo: 900,
    };
  }
}
