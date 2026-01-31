// src/app/shared/services/export-map2-service/export-map.service.ts
import { Injectable } from '@angular/core';

// Base mapa y utilidades compartidas
import { MapService } from '@app/core/services/map-service/map.service';
import { GridService } from '@app/shared/services/grid-service/grid.service';
import { MapExportImageService } from '@app/shared/services/map-export-service/map-export-image.service';

// Papel y medidas compartidas
import {
  PAPER_SPECS_PT,
  PaperFormat,
  PaperOrientation,
  ptToPx,
  MarginsPt,
} from '@app/shared/Interfaces/export-map/paper-format';

// Sistema PDF por plantillas (builder v4)
import {
  PdfBuilderService,
  BuildArgs,
} from '@app/shared/pdf/services/pdf-builder-service/pdf-builder.service';

// Interfaz de datos del formulario + TemplateId compartidos
import {
  ExportFormData,
  TemplateId,
} from '@app/shared/Interfaces/export-map/pdf-template';

// Fachada de leyendas compartida
import {
  LegendFacadeService,
  LegendItem,
} from '@app/shared/services/legend-image-service/legend-facade.service';

// Plantilla estándar (fallback defensivo si no hay providers globales)
import { StandardPdfTemplateService } from '@app/shared/pdf/services/templates/standard-pdf-template.service';

// Utilidad de errores con stages (ver archivo export-map-errors.ts)
import {
  ExportError,
  fail,
} from '@app/shared/Interfaces/export-map/export-map-errors';

/**
 * Servicio orquestador de exportación a PDF del visor geográfico (Salida Gráfica v2 → refactor v4).
 * -------------------------------------------------------------------------------------------------
 * Ajuste: retry controlado (1 reintento tras 3 s) al generar la imagen del mapa.
 *
 * @author  Sergio Alonso Mariño Duque
 * @date    2025-08-18
 * @version 3.0.1
 */

@Injectable({ providedIn: 'root' })
export class ExportMapService {
  private static readonly RETRY_DELAY_MS = 3000; // ⬅ delay del reintento

  constructor(
    private mapService: MapService,
    private gridService: GridService,
    private imgSvc: MapExportImageService,
    private legends: LegendFacadeService,
    private pdfBuilder: PdfBuilderService,
    private tplStandard: StandardPdfTemplateService
  ) {}

  /** Asegura que exista la plantilla solicitada; si no, registra la estándar. */
  private ensureTemplate(templateId: TemplateId = 'standard'): void {
    const list = this.pdfBuilder.getAvailableTemplates();
    const hasRequested = list.some(t => t.id === templateId);
    if (!list.length || !hasRequested) {
      this.pdfBuilder.registerTemplates(this.tplStandard);
    }
  }

  /**
   * generatePdfFromCanvas()
   * -----------------------
   * Genera un PDF a partir del **estado visual actual** del visor.
   */
  async generatePdfFromCanvas(
    container: HTMLElement,
    logoUrl: string | null,
    formData: ExportFormData,
    templateId: TemplateId = 'standard' // v2 fija plantilla por defecto
  ): Promise<{ url: string; name: string }> {
    console.group('[PDF v2-refac]');
    console.log('[PDF v2-refac] INICIO');
    console.time('[PDF v2-refac] total');

    try {
      // Asegura plantilla disponible (si no hay providers globales)
      this.ensureTemplate(templateId);

      // --- Mapa base --------------------------------------------------------
      console.time('[PDF v2-refac] INIT');
      const map = this.mapService.getMap();
      if (!map)
        fail('INIT', 'No hay mapa activo (MapService.getMap() => null)');
      if (!container)
        fail('INIT', 'No existe contenedor off-screen (hiddenMapContainer)');
      console.timeEnd('[PDF v2-refac] INIT');

      // --- 1) Papel y orientación ------------------------------------------
      console.time('[PDF v2-refac] PAPER');
      const dpi = 180; // mantener coherencia pt↔px
      const format = formData.paper ?? PaperFormat.Letter;
      const spec = PAPER_SPECS_PT[format];
      const landscape = formData.orientation === PaperOrientation.Horizontal;
      const paper = landscape ? { w: spec.h, h: spec.w } : spec;
      console.debug('[PDF v2-refac] papel/orientación', {
        format,
        orientation: formData.orientation,
        paper,
      });
      console.timeEnd('[PDF v2-refac] PAPER');

      // --- 2) Márgenes del layout (alineados con plantillas v4) -------------
      console.time('[PDF v2-refac] EXTENT');
      const frameMargin = 20;
      const headerSpace = 40;
      const footerTableH = 3 * 20;
      const footerExtra = 10;

      const mapMargins: MarginsPt = {
        top: frameMargin + headerSpace,
        right: frameMargin,
        bottom: frameMargin + footerTableH + footerExtra,
        left: frameMargin,
      };

      // --- 3) Extent de export (misma escala del visor) ---------------------
      const contentWpt = paper.w - mapMargins.left - mapMargins.right;
      const contentHpt = paper.h - mapMargins.top - mapMargins.bottom;
      const wPx = ptToPx(contentWpt, dpi);
      const hPx = ptToPx(contentHpt, dpi);

      const view = map.getView();
      const center = view.getCenter() as [number, number];
      const res = view.getResolution();
      if (!center) fail('EXTENT', 'El centro de la vista es nulo');
      if (res == null) fail('EXTENT', 'La resolución de la vista es nula');

      const halfW = (res * wPx) / 2;
      const halfH = (res * hPx) / 2;
      const exportExtent: [number, number, number, number] = [
        center[0] - halfW,
        center[1] - halfH,
        center[0] + halfW,
        center[1] + halfH,
      ];
      console.debug('[PDF v2-refac] extent', { exportExtent, wPx, hPx, dpi });
      console.timeEnd('[PDF v2-refac] EXTENT');

      // --- 4) Grilla expandida opcional ------------------------------------
      console.time('[PDF v2-refac] GRID');
      if (formData.showGrid) {
        try {
          this.gridService.prepareGridLayer(true, exportExtent, {
            expandBy: 5,
            idealCells: 135, // look consistente con v3/v4
          });
        } catch (e) {
          console.error('[PDF v2-refac] GRID error preparando grilla', e);
        }
      }
      console.timeEnd('[PDF v2-refac] GRID');

      // --- 5) Imagen exacta del cuadro del papel (con retry 3 s) -----------
      console.time('[PDF v2-refac] RENDER_MAP');
      let imgRes: {
        imgData: string;
        widthPt: number;
        heightPt: number;
      } | null = null;

      // Intento #1
      try {
        imgRes = await this.imgSvc.generateExportMapImageForPaper(
          container,
          paper,
          mapMargins,
          dpi
        );
      } catch (errFirst) {
        console.warn(
          '[PDF v2-refac] RENDER_MAP intento #1 lanzó error',
          errFirst
        );
      }

      // Si falló (null o error), esperar 3 s y reintentar una sola vez
      if (!imgRes) {
        console.warn(
          `[PDF v2-refac] RENDER_MAP falló en el intento #1. Esperando ${ExportMapService.RETRY_DELAY_MS}ms para reintentar…`
        );
        await this.sleep(ExportMapService.RETRY_DELAY_MS);

        try {
          imgRes = await this.imgSvc.generateExportMapImageForPaper(
            container,
            paper,
            mapMargins,
            dpi
          );
        } catch (errSecond) {
          console.error(
            '[PDF v2-refac] RENDER_MAP intento #2 lanzó error',
            errSecond
          );
          imgRes = null;
        }
      }

      if (!imgRes) {
        console.timeEnd('[PDF v2-refac] RENDER_MAP');
        fail(
          'RENDER_MAP',
          'Fallo al generar imagen del mapa (imgRes=null) tras retry'
        );
      }

      const { imgData, widthPt, heightPt } = imgRes;
      console.timeEnd('[PDF v2-refac] RENDER_MAP');

      // --- 6) Barra de escala -----------------------------------------------
      console.time('[PDF v2-refac] SCALE');
      const { scaleImage, SCwidth, SCheight } =
        await this.imgSvc.getScaleLineImageData(map);
      if (!scaleImage)
        fail('SCALE', 'No se pudo rasterizar la barra de escala');
      console.timeEnd('[PDF v2-refac] SCALE');

      // --- 7) Leyendas (opcional) -------------------------------------------
      console.time('[PDF v2-refac] LEGENDS');
      let legends: LegendItem[] = [];
      if (formData.includeLegend) {
        legends = await this.legends.getLegendsFromVisibleLayers();
        console.debug('[PDF v2-refac] legends', legends);
      }
      console.timeEnd('[PDF v2-refac] LEGENDS');

      // --- 8) Construcción del PDF mediante plantilla estándar --------------
      console.time('[PDF v2-refac] BUILD');
      const buildArgs: BuildArgs = {
        formData,
        imgData,
        scale: { dataUrl: scaleImage, width: SCwidth, height: SCheight },
        legends,
        logoUrl,
        templateId, // 'standard' fijo en v2
        paper: { format, orientation: formData.orientation },
        map: {
          canvasWidth: wPx,
          canvasHeight: hPx,
          placement: {
            left: mapMargins.left,
            top: mapMargins.top,
            widthPt,
            heightPt,
          },
        },
        meta: { dpi, createdAt: new Date() },
      };

      const { url, name } = await this.pdfBuilder.build(buildArgs);
      if (!url) fail('BUILD', 'PdfBuilder devolvió URL vacío');
      console.timeEnd('[PDF v2-refac] BUILD');

      console.log('[PDF v2-refac] listo:', name);
      return { url, name };
    } catch (error) {
      if (error instanceof ExportError) {
        console.error(`[PDF v2-refac] error (${error.stage}):`, error.message);
      } else {
        console.error('[PDF v2-refac] error general:', error);
      }
      throw error;
    } finally {
      console.timeEnd('[PDF v2-refac] total');
      if (formData?.showGrid) {
        try {
          this.gridService.closeGridLayer();
        } catch (e) {
          console.warn('[PDF v2-refac] WARN al cerrar grilla', e);
        }
      }
      console.groupEnd();
    }
  }

  // Utilidad local para el retry
  private sleep(ms: number): Promise<void> {
    return new Promise(res => setTimeout(res, ms));
  }
}
