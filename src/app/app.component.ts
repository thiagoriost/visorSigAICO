import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { MapLayerManagerService } from './core/services/map-layer-manager/map-layer-manager.service';
import { PrimeNG } from 'primeng/config';
import { ToastModule } from 'primeng/toast';
import { LayersContentTableManagerService } from './core/services/layers-content-table-manager/layers-content-table-manager.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ButtonModule, ToastModule],
  providers: [MapLayerManagerService],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  title = 'visor-geografico-estandar-2024';

  Wubtitle = '44';

  constructor(
    private primeng: PrimeNG,
    private layersContentTableManagerService: LayersContentTableManagerService,
    private mapLayerManageService: MapLayerManagerService
  ) {}

  ngOnInit(): void {
    this.primeng.ripple.set(true);
  }
}
