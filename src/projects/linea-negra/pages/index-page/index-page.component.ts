import { Component, OnDestroy, OnInit } from '@angular/core';
import { LayoutXComponent } from '@app/widget-ui/layouts/layout-x/layout-x.component';
import { MapComponent } from '@app/core/components/map/map.component';
import { CoordinatesScaleLineaNegraComponent } from '@projects/linea-negra/components/coordinates-scale-linea-negra/coordinates-scale-linea-negra.component';
import { AutenticacionLineaNegraComponent } from '@projects/linea-negra/components/autenticacion-linea-negra/autenticacion-linea-negra.component';
import { MenuFlotanteLineaNegraComponent } from '@projects/linea-negra/components/menu-flotante-linea-negra/menu-flotante-linea-negra.component';
import {
  BreakpointObserver,
  Breakpoints,
  BreakpointState,
} from '@angular/cdk/layout';
import { MapLayerManagerService } from '@app/core/services/map-layer-manager/map-layer-manager.service';
import { CommonModule } from '@angular/common';
import { WindowRefService } from 'ngx-guided-tour';
import { LnWindowSingleComponenteRenderComponent } from '@projects/linea-negra/components/ln-window-single-componente-render/ln-window-single-componente-render.component';
import { FloatingWindowConfig } from '@app/widget-ui/components/floating-window/interfaces/floating-window-config';
import { LineaNegraMapNavButtonsComponent } from '@projects/linea-negra/components/linea-negra-map-nav-buttons/linea-negra-map-nav-buttons.component';
import { MapaLocalizacionLineaNegraComponent } from '@projects/linea-negra/components/mapa-localizacion-linea-negra/mapa-localizacion-linea-negra.component';
import { WindowTablaAtributosComponent } from '@projects/linea-negra/components/window-tabla-atributos/window-tabla-atributos.component';
import { LeftBottomImageComponent } from '@projects/linea-negra/components/left-bottom-image/left-bottom-image.component';
import { RightBottomImageComponent } from '@projects/linea-negra/components/right-bottom-image/right-bottom-image.component';
import { Toast } from 'primeng/toast';
import { HeaderLineaNegraStoreComponent } from '@projects/linea-negra/components/header-linea-negra-store/header-linea-negra-store.component';
import { ContentTableDirectusSearchService } from '@app/core/services/content-table-directus-search/content-table-directus-search.service';
import { ContentTableSearchService } from '@projects/linea-negra/services/content-table-search/content-table-search.service';
import { UserPreferencesLoaderService } from '@projects/linea-negra/services/user-preferences-loader/user-preferences-loader.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-index-page',
  imports: [
    CommonModule,
    LayoutXComponent,
    MapComponent,
    CoordinatesScaleLineaNegraComponent,
    AutenticacionLineaNegraComponent,
    MenuFlotanteLineaNegraComponent,
    LnWindowSingleComponenteRenderComponent,
    LineaNegraMapNavButtonsComponent,
    MapaLocalizacionLineaNegraComponent,
    WindowTablaAtributosComponent,
    LeftBottomImageComponent,
    RightBottomImageComponent,
    Toast,
    HeaderLineaNegraStoreComponent,
  ],
  providers: [
    WindowRefService,
    ContentTableDirectusSearchService,
    ContentTableSearchService,
    UserPreferencesLoaderService,
  ],
  templateUrl: './index-page.component.html',
  styleUrl: './index-page.component.scss',
})
export class IndexPageComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  isSmallScreen = false; //variable para determinar si la resolucion de pantalla es de tipo movil
  titleHeader = ''; //titulo de la comunidad
  urlLOgo = 'projects/linea-negra/assets/images/linea-negra-icon.svg'; //url del logo del SIG
  isAuthenticatedUser = false; //indica si el usuario está autenticado

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

  constructor(
    private breakpointObserver: BreakpointObserver,
    private mapLayerManageService: MapLayerManagerService,
    private contentTableService: ContentTableSearchService,
    private userPreferencesLoaderService: UserPreferencesLoaderService
  ) {
    this.configFloatingWindow = this.getConfigFloatingWindow();
    this.configMobileFloatingWindow = this.getConfigMobileFloatingWindow();
    this.configClosedFloatingWindow = this.getConfigClosedFloatingWindow();
  }
  ngOnInit(): void {
    this.configMobileFloatingWindow = this.getConfigMobileFloatingWindow();

    this.breakpointObserver
      .observe([Breakpoints.XSmall, Breakpoints.Small])
      .pipe(takeUntil(this.destroy$))
      .subscribe((state: BreakpointState) => {
        if (state.matches) {
          this.isSmallScreen = state.matches;
        } else {
          this.isSmallScreen = false;
        }
      });
  }

  /** Método que recibe el valor del layout-b */
  onIsMobileChange(value: boolean) {
    this.isSmallScreen = value;
  }

  /**
   * Retorna la configuración predeterminada de la ventana flotante.
   * Incluye propiedades como tamaño, posición y habilitación de acciones.
   */
  getConfigFloatingWindow(): FloatingWindowConfig {
    return {
      x: 0, // Posición horizontal inicial
      y: 0, // Posición vertical inicial
      width: 800, // Ancho inicial
      height: 1200, // Alto inicial
      maxHeight: 800, // Altura máxima permitida
      maxWidth: 800, // Ancho máximo permitido
      enableClose: true, // No permite cierre
      enableResize: false, // Permite redimensionar
      enableDrag: false, // Permite arrastrar
      enableMinimize: false, // Permite minimizar
      buttomSeverity: 'danger', // Estilo para los botones
      buttomSize: 'small', // Tamaño para los botones
      buttomRounded: false, // Estilo redondeo para los botones
      iconMinimize: 'pi cric-zoom_out', // Icono minimizar
      iconMaximize: 'pi pi-chevron-up', // Icono Maximizar
      iconClose: 'pi pi-times', // Icono Cerrar
      headerClass:
        'fwh bg-yellow-200 text-color flex justify-content-between align-items-center  p-2 border-round-top-2xl',
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

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
