// @app/shared/services/map-export/map-export-image.service.ts
import { Injectable } from '@angular/core';
import VectorLayer from 'ol/layer/Vector';
import { MapService } from '@app/core/services/map-service/map.service';
import { MapExportCoreService } from './map-export-core.service';

import Map from 'ol/Map';

import {
  PaperSpec,
  MarginsPt,
  computeContentSizePx,
} from '@app/shared/Interfaces/export-map/paper-format';

import {
  MapExportScaleService,
  ScaleImageResult,
} from './map-export-scale.service';

/**
 * Servicio de utilidades de imagen para exportación: `MapExportImageService`
 * -------------------------------------------------------------------------
 * Exporta PNG del mapa en dos modos:
 * - `generateExportMapImage` (tamaño visor)
 * - `generateExportMapImageForPaper` (tamaño exacto de cuadro útil)
 *
 * @author
 *  Sergio Alonso Mariño Duque
 * @date
 *  07-07-2025
 * @version
 *  2.1.0  (separación de lógica de barras de escala en MapExportScaleService)
 */
@Injectable({ providedIn: 'root' })
export class MapExportImageService {
  constructor(
    private mapService: MapService,
    private core: MapExportCoreService,
    private scaleService: MapExportScaleService
  ) {}

  /**
   * generateExportMapImage()
   * ------------------------
   * Exportación **simple** con el **mismo tamaño** del visor actual.
   */
  public async generateExportMapImage(
    container: HTMLElement,
    vectorLayers: VectorLayer[] = []
  ): Promise<{ imgData: string; width: number; height: number } | null> {
    try {
      const mapOriginal = this.mapService.getMap();
      if (!mapOriginal) {
        return null;
      }

      const size = mapOriginal.getSize();
      if (!size) {
        return null;
      }

      // Importante: el contenedor no debe estar en display:none; usar visibility:hidden off-screen.
      container.style.width = `${size[0]}px`;
      container.style.height = `${size[1]}px`;

      const projection = mapOriginal.getView().getProjection().getCode();
      const tmpExtent = mapOriginal.getView().calculateExtent(size) as [
        number,
        number,
        number,
        number,
      ];

      // Crear mapa limpio y cargar capas visibles
      const cleanMap = this.core.createCleanMap(
        container,
        tmpExtent,
        projection,
        vectorLayers
      );
      const allLayers = this.core.getIntermediateAndUpperLayers();
      await this.core.loadExportMapLayers(cleanMap, allLayers);

      // Esperar render real + doble rAF
      await this.core.waitForMapToRender(cleanMap);
      await new Promise(r =>
        requestAnimationFrame(() => requestAnimationFrame(r))
      );

      // Composición del viewport (multi-canvas)
      const composed = this.core.composeViewportToCanvas(
        cleanMap,
        size[0],
        size[1]
      );

      try {
        const imgData = composed.toDataURL('image/png');
        return { imgData, width: composed.width, height: composed.height };
      } catch {
        await this.sleep(3000);
        try {
          const imgData = composed.toDataURL('image/png');
          return { imgData, width: composed.width, height: composed.height };
        } catch {
          return null;
        }
      }
    } catch {
      return null;
    }
  }

  /**
   * generateExportMapImageForPaper()
   * --------------------------------
   * Exportación “para papel” al **tamaño exacto del cuadro útil** (px) con misma escala visual.
   */
  public async generateExportMapImageForPaper(
    container: HTMLElement,
    paper: PaperSpec,
    margins: MarginsPt,
    dpi = 180,
    vectorLayers: VectorLayer[] = []
  ): Promise<{ imgData: string; widthPt: number; heightPt: number } | null> {
    try {
      // 1) Mapa original
      const mapOriginal = this.mapService.getMap();
      if (!mapOriginal) {
        return null;
      }

      // 2) Tamaño del cuadro útil (papel)
      const { wPx, hPx, wPt, hPt } = computeContentSizePx(paper, margins, dpi);

      // 3) Ajustar contenedor off-screen
      // Importante: no usar display:none; sí puede estar hidden/off-screen.
      container.style.width = `${wPx}px`;
      container.style.height = `${hPx}px`;

      // 4) Proyección y extent de referencia
      const v0 = mapOriginal.getView();
      const projection = v0.getProjection().getCode();
      const size = mapOriginal.getSize();
      if (!size) {
        return null;
      }
      const tmpExtent = v0.calculateExtent(size) as [
        number,
        number,
        number,
        number,
      ];

      // 5) Crear mapa limpio y cargar capas
      const cleanMap = this.core.createCleanMap(
        container,
        tmpExtent,
        projection,
        vectorLayers
      );
      const allLayers = this.core.getIntermediateAndUpperLayers();
      await this.core.loadExportMapLayers(cleanMap, allLayers);

      // 6) Esperar render real + verificar taint
      await this.core.ensureCanvasesNotTainted(cleanMap);

      // 7) Componer viewport exacto al cuadro útil (px)
      const composed = this.core.composeViewportToCanvas(cleanMap, wPx, hPx);

      // 8) Un único toDataURL (si aquí falla, ya es algo MUY raro)
      const imgData = composed.toDataURL('image/png');

      return { imgData, widthPt: wPt, heightPt: hPt };
    } catch {
      return null;
    }
  }

  // -------------------------------------------------------------------
  // Wrappers de barra de escala (delegan en MapExportScaleService)
  // -------------------------------------------------------------------

  /**
   * Mantiene la misma firma pública que antes,
   * pero ahora delega en MapExportScaleService.
   */
  public getScaleLineImageData(map: Map): Promise<ScaleImageResult> {
    return this.scaleService.getScaleLineImageData(map);
  }

  public getQuickScaleLineImageData(map: Map): Promise<ScaleImageResult> {
    return this.scaleService.getQuickScaleLineImageData(map);
  }

  public getScaleBarImageData(map: Map): Promise<ScaleImageResult> {
    return this.scaleService.getScaleBarImageData(map);
  }

  // -------------------------------------------------------------------
  // Helpers locales usados por este servicio
  // -------------------------------------------------------------------

  private sleep(ms: number): Promise<void> {
    return new Promise(res => setTimeout(res, ms));
  }
}
