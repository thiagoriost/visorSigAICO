// src/app/shared/services/map-export-service/map-export-orchestrator.service.ts
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

import { MapExportScaleService } from './map-export-scale.service';

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

// Utilidad de errores con stages (ver archivo export-map-errors.ts)
import { fail } from '@app/shared/Interfaces/export-map/export-map-errors';

// NUEVO: para poder pasar una capa de grilla standalone al mapa limpio
import VectorLayer from 'ol/layer/Vector';

/**
 * Configuración específica de cada Salida Gráfica
 * (lo que NO centralizamos: márgenes, logs, template).
 */
export interface MapExportOrchestratorConfig {
  /** Prefijo para logs y tiempos: ej. "[PDF v2-refac]" */
  logPrefix: string;

  /** TemplateId ya resuelto y registrado en PdfBuilderService */
  templateId: TemplateId;

  /** Márgenes del cuadro del mapa en puntos tipográficos (pt) */
  mapMargins: MarginsPt;

  /** DPI usados para el render. Si no se indica, usa 180. */
  dpi?: number;

  /**
   * Si `true`, la grilla NO se agrega al visor real.
   * En su lugar se crea una capa de grilla standalone SOLO para el mapa de exportación.
   */
  useStandaloneGrid?: boolean;

  /**
   * Opciones para la grilla (tanto en modo visor como standalone).
   */
  gridOptions?: {
    expandBy?: number;
    idealCells?: number;
    color?: string;
    width?: number;
  };
}

/**
 * Servicio orquestador genérico de exportación a PDF del visor.
 *
 * - Centraliza: INIT, PAPER, EXTENT, GRID, RENDER_MAP (con retry SIN delay),
 *   SCALE, LEGENDS, BUILD y manejo de errores.
 * - NO sabe de qué plantilla registrar ni de cómo se calculan los márgenes:
 *   eso viene desde fuera vía `MapExportOrchestratorConfig`.
 */
@Injectable({ providedIn: 'root' })
export class MapExportOrchestratorService {
  constructor(
    private mapService: MapService,
    private gridService: GridService,
    private imgSvc: MapExportImageService,
    private legends: LegendFacadeService,
    private pdfBuilder: PdfBuilderService,
    private SclSrv: MapExportScaleService
  ) {}

  /**
   * exportToPdf()
   * -------------
   * Orquesta el flujo completo de exportación sobre el **estado actual del visor**.
   *
   * - `container`: contenedor off-screen donde se compone el mapa de exportación.
   * - `logoUrl`: logo opcional para las plantillas.
   * - `formData`: datos del formulario (papel, orientación, título, etc.).
   * - `cfg`: configuración específica de la Salida (márgenes, template, logs).
   */
  async exportToPdf(
    container: HTMLElement,
    logoUrl: string | null,
    formData: ExportFormData,
    cfg: MapExportOrchestratorConfig,
    VScaleLine = true
  ): Promise<{ url: string; name: string }> {
    const prefix = cfg.logPrefix || '[PDF]';

    try {
      // -----------------------------------------------------------------------
      // 0) INIT
      // -----------------------------------------------------------------------
      const map = this.mapService.getMap();
      if (!map)
        fail('INIT', 'No hay mapa activo (MapService.getMap() => null)');
      if (!container)
        fail('INIT', 'No existe contenedor off-screen (hiddenMapContainer)');

      // -----------------------------------------------------------------------
      // 1) PAPER (formato y orientación)
      // -----------------------------------------------------------------------
      const dpi = cfg.dpi ?? 180;
      const format = formData.paper ?? PaperFormat.Letter;
      const spec = PAPER_SPECS_PT[format];
      const landscape = formData.orientation === PaperOrientation.Horizontal;
      const paper = landscape ? { w: spec.h, h: spec.w } : spec;

      // -----------------------------------------------------------------------
      // 2) EXTENT (cálculo del área de exportación a misma escala)
      // -----------------------------------------------------------------------
      const mapMargins = cfg.mapMargins;

      const contentWpt = paper.w - mapMargins.left - mapMargins.right;
      const contentHpt = paper.h - mapMargins.top - mapMargins.bottom;
      const wPx = ptToPx(contentWpt, dpi);
      const hPx = ptToPx(contentHpt, dpi);

      const view = map.getView();
      const center = view.getCenter() as [number, number] | null;
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

      // Capas adicionales a inyectar en el mapa limpio (ej: grilla standalone)
      const extraVectorLayers: VectorLayer[] = [];

      // -----------------------------------------------------------------------
      // 3) GRID (opcional)
      // -----------------------------------------------------------------------
      if (formData.showGrid) {
        const gridOpts = cfg.gridOptions ?? {};
        const expandBy = gridOpts.expandBy ?? 5;
        const idealCells = gridOpts.idealCells ?? 135;
        const color = gridOpts.color;
        const width = gridOpts.width;

        try {
          // 👇 Grilla SOLO para el mapa limpio (no se añade al visor)
          const gridLayer = this.gridService.makeStandaloneGridLayer(
            exportExtent,
            { expandBy, idealCells, color, width }
          );
          extraVectorLayers.push(gridLayer);
        } catch (e) {
          console.error(`${prefix} GRID error creando grilla standalone`, e);
        }
      }

      // -----------------------------------------------------------------------
      // 4) RENDER_MAP → imagen del mapa al tamaño del cuadro del papel
      //    Retry SIN delay (dos intentos máximo).
      // -----------------------------------------------------------------------

      let imgRes: {
        imgData: string;
        widthPt: number;
        heightPt: number;
      } | null = null;

      try {
        imgRes = await this.imgSvc.generateExportMapImageForPaper(
          container,
          paper,
          mapMargins,
          dpi,
          extraVectorLayers
        );
      } catch (errFirst) {
        console.warn(`${prefix} RENDER_MAP intento #1 lanzó error`, errFirst);
      }

      // Intento #2 (sin delay)
      if (!imgRes) {
        try {
          imgRes = await this.imgSvc.generateExportMapImageForPaper(
            container,
            paper,
            mapMargins,
            dpi,
            extraVectorLayers
          );
        } catch {
          imgRes = null;
        }
      }

      if (!imgRes) {
        fail(
          'RENDER_MAP',
          'Fallo al generar imagen del mapa (imgRes=null) tras reintento'
        );
      }

      const { imgData, widthPt, heightPt } = imgRes;

      // -----------------------------------------------------------------------
      // 5) SCALE (barra de escala basada en la resolución actual del mapa)
      // -----------------------------------------------------------------------

      const { scaleImage, SCwidth, SCheight } = VScaleLine
        ? await this.imgSvc.getScaleLineImageData(map)
        : await this.imgSvc.getScaleBarImageData(map);
      if (!scaleImage) {
        fail('SCALE', 'No se pudo rasterizar la barra de escala (quick)');
      }

      // -----------------------------------------------------------------------
      // 5.1) SCALE_LABEL (cálculo 1:N redondeado a la tabla)
      // -----------------------------------------------------------------------

      let scaleLabel: string | undefined;

      try {
        const v = map.getView();
        const proj = v.getProjection();
        const resolution = v.getResolution();

        if (proj && resolution != null) {
          const metersPerUnit = proj.getMetersPerUnit?.() ?? 1;
          const metersPerPx = resolution * metersPerUnit;

          const rawDen = metersPerPx / 0.00028; // fórmula clásica de OL
          const snappedDen = this.SclSrv.snapScaleDenominator(rawDen);

          scaleLabel = `1 : ${snappedDen.toLocaleString('es-ES')}`;
        }
      } catch (e) {
        console.warn(`${prefix} SCALE_LABEL error calculando escala`, e);
      }

      // -----------------------------------------------------------------------
      // 6) LEGENDS (opcional)
      // -----------------------------------------------------------------------

      let legendsArr: LegendItem[] = [];
      if (formData.includeLegend) {
        legendsArr = await this.legends.getLegendsFromVisibleLayers();
      }

      // -----------------------------------------------------------------------
      // 7) BUILD (construcción del PDF mediante PdfBuilderService)
      // -----------------------------------------------------------------------
      const buildArgs: BuildArgs = {
        formData,
        imgData,
        scale: { dataUrl: scaleImage, width: SCwidth, height: SCheight },
        legends: legendsArr,
        logoUrl,
        templateId: cfg.templateId,
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
        meta: {
          dpi,
          createdAt: new Date(),
          scaleLabel,
        },
      };

      const { url, name } = await this.pdfBuilder.build(buildArgs);
      if (!url) fail('BUILD', 'PdfBuilder devolvió URL vacío');

      return { url, name };
    } catch (error) {
      console.log('Error al exportar salida grafica', error);
      throw error;
    } finally {
      if (formData?.showGrid) {
        try {
          this.gridService.closeGridLayer();
        } catch (e) {
          console.warn(`${cfg.logPrefix} WARN al cerrar grilla`, e);
        }
      }
    }
  }
}
