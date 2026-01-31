// src/app/shared/components/basemap-override/basemap-override.component.ts
import { AfterViewInit, Component, Input, OnDestroy } from '@angular/core';
import TileLayer from 'ol/layer/Tile';
import XYZ from 'ol/source/XYZ';
import { MapService } from '@app/core/services/map-service/map.service';
import { LayerLevel } from '@app/core/interfaces/enums/LayerLevel.enum';

type BasemapStyle = 'positron' | 'esriGray' | 'custom';

@Component({
  selector: 'app-basemap-override',
  standalone: true,
  templateUrl: './basemap-override.component.html',
})
export class BasemapOverrideComponent implements AfterViewInit, OnDestroy {
  /**
   * El estilo de mapa base a aplicar.
   * - 'positron': Carto light_all (gris claro)
   * - 'esriGray': Esri World Light Gray
   * - 'custom': usa la URL pasada por @Input() customUrl
   */
  @Input() style: BasemapStyle = 'positron';

  /** URL de tiles XYZ si style === 'custom' */
  @Input() customUrl?: string;

  /** Opcional: id que se asignará a la capa base nueva */
  @Input() layerId = 'gm_base_override';

  /** Reintento para esperar el mapa */
  private retryTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(private mapSvc: MapService) {}

  ngAfterViewInit(): void {
    // espera a que MapService cree el mapa
    this.waitForMap();
  }

  ngOnDestroy(): void {
    if (this.retryTimer) clearTimeout(this.retryTimer);
  }

  private waitForMap(): void {
    const map = this.mapSvc.getMap();
    if (!map) {
      this.retryTimer = setTimeout(() => this.waitForMap(), 50);
      return;
    }

    const baseGroup = this.mapSvc.getLayerGroupByName(LayerLevel.BASE);
    if (!baseGroup) return;

    // 1) Limpiar el grupo BASE (quitamos cualquier capa previa)
    baseGroup.getLayers().clear();

    // 2) Crear la nueva capa base
    const url =
      this.style === 'positron'
        ? 'https://{a-d}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png'
        : this.style === 'esriGray'
          ? 'https://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}'
          : (this.customUrl ?? '');

    if (!url) {
      console.error(
        '[BasemapOverrideComponent] Falta customUrl cuando style="custom"'
      );
      return;
    }

    const layer = new TileLayer({
      source: new XYZ({
        url,
        crossOrigin: 'anonymous',
        // tilePixelRatio: 1, // opcional
      }),
      properties: { id: this.layerId },
    });

    // 3) Inyectar en el grupo BASE
    baseGroup.getLayers().push(layer);

    // 4) Forzar un render
    map.render();
  }
}
