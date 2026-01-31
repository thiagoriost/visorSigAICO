import {
  BreakpointObserver,
  Breakpoints,
  BreakpointState,
} from '@angular/cdk/layout';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MapComponent } from '@app/core/components/map/map.component';
import { MapLayerManagerService } from '@app/core/services/map-layer-manager/map-layer-manager.service';
import { TourAppService } from '@app/shared/services/tour-app/tour-app.service';
import { SidebarMenuAisoComponent } from '@projects/aiso/components/sidebar-menu-aiso/sidebar-menu-aiso.component';
import { GuidedTourService, WindowRefService } from 'ngx-guided-tour';
import { LayoutDComponent } from '@app/widget-ui/layouts/layout-d/layout-d.component';
import { AisoFooterComponent } from '@projects/aiso/components/aiso-footer/aiso-footer/aiso-footer.component';
import { AisoHeaderComponent } from '@projects/aiso/components/aiso-header/aiso-header.component';
import { LayersContentTableManagerService } from '@app/core/services/layers-content-table-manager/layers-content-table-manager.service';
import { Toast } from 'primeng/toast';

/**
 * @description Componente principal que define la estructura general del visor AISO.
 * @autor Heidy Paola Lopez Sanchez
 */

@Component({
  selector: 'app-index-page',
  imports: [
    CommonModule,
    MapComponent,
    SidebarMenuAisoComponent,
    LayoutDComponent,
    AisoFooterComponent,
    AisoHeaderComponent,
    Toast,
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
    private mapLayerManageService: MapLayerManagerService,
    private layersContentTableManagerService: LayersContentTableManagerService
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
