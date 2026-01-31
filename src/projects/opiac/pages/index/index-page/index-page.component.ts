import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

// ***** COMPONENTS *****
import { LayoutAComponent } from '@app/widget-ui/layouts/layout-a/layout-a.component';
import { MapComponent } from '@app/core/components/map/map.component';
import { OpiacHeaderComponent } from '@projects/opiac/components/opiac-header/opiac-header.component';
import { CoordinateScaleLineComponent } from '@projects/opiac/components/coordinate-scale-line/coordinate-scale-line.component';
import { FloatingMenuComponent } from '@projects/opiac/components/floating-menu/floating-menu.component';
import { WindowSingleComponentRenderComponent } from '@app/widget-ui/components/window-single-component-render/window-single-component-render.component';
import { SidebarComponent } from '@projects/opiac/components/sidebar/components/sidebar/sidebar.component';
import { FloatingMapControlsComponent } from '@projects/opiac/components/floating-map-controls/floating-map-controls.component';
import { WindowTablaAtributosComponent } from '@projects/opiac/components/window-tabla-atributos/window-tabla-atributos.component';
import { ExportMap2WrapperComponent } from '@projects/opiac/components/export-map2-wrapper/export-map2-wrapper.component';
import { MapLocationComponent } from '@projects/opiac/components/map-location/map-location.component';
import { TourAppService } from '@app/shared/services/tour-app/tour-app.service';

import {
  BreakpointObserver,
  Breakpoints,
  BreakpointState,
} from '@angular/cdk/layout';
import { TourUiOpiacComponent } from '@projects/opiac/widget/tour-ui-opiac/tour-ui-opiac.component';
import { GuidedTourService, WindowRefService } from 'ngx-guided-tour';
import { MapLayerManagerService } from '@app/core/services/map-layer-manager/map-layer-manager.service';
/**
 * @description Componente principal visor para OPIAC
 * @author Juan Carlos Valderrama Gonzalez
 */
@Component({
  selector: 'app-index-page',
  standalone: true,
  imports: [
    CommonModule,
    LayoutAComponent,
    MapComponent,
    OpiacHeaderComponent,
    CoordinateScaleLineComponent,
    FloatingMenuComponent,
    WindowSingleComponentRenderComponent,
    SidebarComponent,
    FloatingMapControlsComponent,
    WindowTablaAtributosComponent,
    ExportMap2WrapperComponent,
    MapLocationComponent,
    TourUiOpiacComponent,
  ],
  providers: [TourAppService, GuidedTourService, WindowRefService],
  templateUrl: './index-page.component.html',
  styleUrl: './index-page.component.scss',
})
export class IndexPageComponent implements OnInit {
  isSmallScreen = false; //variable para determinar si la resolucion de pantalla es de tipo movil
  /**
   *Servicio que observa la resolución de pantalla de la aplicacion
   * @param breakpointObserver
   */
  constructor(
    private breakpointObserver: BreakpointObserver,
    private mapLayerManageService: MapLayerManagerService
  ) {}
  /**
   * Inicializa el observador de resoluciones de pantalla
   * y setea las variables para mostrar u ocultar segun la resolucion de pantalla
   */
  ngOnInit(): void {
    this.breakpointObserver
      .observe([Breakpoints.XSmall, Breakpoints.Small])
      .subscribe((state: BreakpointState) => {
        if (state.matches) {
          this.isSmallScreen = state.matches;
        } else {
          this.isSmallScreen = false;
        }
      });
  }
}
