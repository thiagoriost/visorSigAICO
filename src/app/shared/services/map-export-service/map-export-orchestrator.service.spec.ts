// src/app/shared/services/map-export-service/map-export-orchestrator.service.unit.spec.ts
import { TestBed } from '@angular/core/testing';

import {
  MapExportOrchestratorService,
  MapExportOrchestratorConfig,
} from './map-export-orchestrator.service';

import { MapService } from '@app/core/services/map-service/map.service';
import { LegendFacadeService } from '@app/shared/services/legend-image-service/legend-facade.service';
import { PdfBuilderService } from '@app/shared/pdf/services/pdf-builder-service/pdf-builder.service';
import { MapExportImageService } from '@app/shared/services/map-export-service/map-export-image.service';
import { GridService } from '@app/shared/services/grid-service/grid.service';
import { MapExportScaleService } from './map-export-scale.service';

import {
  PaperFormat,
  PaperOrientation,
  MarginsPt,
} from '@app/shared/Interfaces/export-map/paper-format';
import type { BuildArgs } from '@app/shared/pdf/services/pdf-builder-service/pdf-builder.service';
import type {
  ExportFormData,
  TemplateId,
} from '@app/shared/Interfaces/export-map/pdf-template';
import type Map from 'ol/Map';

// Error tipado con stage
import { ExportError } from '@app/shared/Interfaces/export-map/export-map-errors';

// ────────────────────────────
// Mocks mínimos y espiables
// ────────────────────────────
class MapServiceMock {
  getMap = jasmine.createSpy('getMap');
}

class LegendFacadeServiceMock {
  getLegendsFromVisibleLayers = jasmine.createSpy(
    'getLegendsFromVisibleLayers'
  );
}

class PdfBuilderServiceMock {
  build = jasmine.createSpy('build').and.callFake(async (args: BuildArgs) => {
    const rawTitle = args.formData?.title ?? 'documento';
    const safe = `${String(rawTitle).trim().replace(/\s+/g, '_')}.pdf`;
    return { url: 'blob:fake-url', name: safe };
  });
}

class MapExportImageServiceMock {
  generateExportMapImageForPaper = jasmine
    .createSpy('generateExportMapImageForPaper')
    .and.resolveTo({
      imgData: 'data:image/png;base64,MAP',
      widthPt: 500,
      heightPt: 300,
    });

  getScaleLineImageData = jasmine
    .createSpy('getScaleLineImageData')
    .and.resolveTo({
      scaleImage: 'data:image/png;base64,SCALE',
      SCwidth: 120,
      SCheight: 24,
    });

  getScaleBarImageData = jasmine
    .createSpy('getScaleBarImageData')
    .and.resolveTo({
      scaleImage: 'data:image/png;base64,SCALE_BAR',
      SCwidth: 100,
      SCheight: 20,
    });
}

class GridServiceMock {
  makeStandaloneGridLayer = jasmine.createSpy('makeStandaloneGridLayer');
  closeGridLayer = jasmine.createSpy('closeGridLayer');
}

class MapExportScaleServiceMock {
  snapScaleDenominator = jasmine
    .createSpy('snapScaleDenominator')
    .and.callFake((val: number) => Math.round(val));
}

// ────────────────────────────
// Suite
// ────────────────────────────
describe('MapExportOrchestratorService', () => {
  let service: MapExportOrchestratorService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        MapExportOrchestratorService,
        { provide: MapService, useClass: MapServiceMock },
        { provide: LegendFacadeService, useClass: LegendFacadeServiceMock },
        { provide: PdfBuilderService, useClass: PdfBuilderServiceMock },
        { provide: MapExportImageService, useClass: MapExportImageServiceMock },
        { provide: GridService, useClass: GridServiceMock },
        { provide: MapExportScaleService, useClass: MapExportScaleServiceMock },
      ],
    });

    service = TestBed.inject(MapExportOrchestratorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('exportToPdf()', () => {
    it('debe orquestar el flujo completo (grilla + leyendas) y construir el PDF', async () => {
      // ——— Arrange ———
      interface OLViewMock {
        getCenter: () => [number, number];
        getResolution: () => number;
        getProjection: () => {
          getMetersPerUnit: () => number;
        };
      }
      interface OLMapMock {
        getView: () => OLViewMock;
      }

      const mapMock: OLMapMock = {
        getView: () => ({
          getCenter: () => [1000, 2000],
          getResolution: () => 2,
          getProjection: () => ({
            getMetersPerUnit: () => 1,
          }),
        }),
      };

      (
        TestBed.inject(MapService) as unknown as MapServiceMock
      ).getMap.and.returnValue(mapMock as unknown as Map);

      (
        TestBed.inject(
          LegendFacadeService
        ) as unknown as LegendFacadeServiceMock
      ).getLegendsFromVisibleLayers.and.resolveTo([
        {
          title: 'Capa A',
          imgData: 'data:image/png;base64,LEG_A',
          width: 80,
          height: 40,
        },
        {
          title: 'Capa B',
          imgData: 'data:image/png;base64,LEG_B',
          width: 90,
          height: 45,
        },
      ]);

      const gridSvc = TestBed.inject(GridService) as unknown as GridServiceMock;
      const imgSvc = TestBed.inject(
        MapExportImageService
      ) as unknown as MapExportImageServiceMock;
      const pdfBuilder = TestBed.inject(
        PdfBuilderService
      ) as unknown as PdfBuilderServiceMock;
      const scaleSvc = TestBed.inject(
        MapExportScaleService
      ) as unknown as MapExportScaleServiceMock;

      const container = document.createElement('div');

      const formData: ExportFormData = {
        title: 'Mi Título',
        author: 'Autor',
        paper: PaperFormat.Letter,
        orientation: PaperOrientation.Horizontal,
        showGrid: true,
        includeLegend: true,
      };

      const mapMargins: MarginsPt = {
        top: 36,
        right: 36,
        bottom: 36,
        left: 36,
      };

      const cfg: MapExportOrchestratorConfig = {
        logPrefix: '[PDF vX]',
        templateId: 'standard-vX' as unknown as TemplateId,
        mapMargins,
        dpi: 150,
        gridOptions: {
          expandBy: 5,
          idealCells: 135,
          color: '#000000',
          width: 1,
        },
      };

      // la capa de grilla standalone que devuelve el servicio
      const gridLayerFake = { id: 'grid-layer' };
      gridSvc.makeStandaloneGridLayer.and.returnValue(gridLayerFake);

      // ——— Act ———
      const result = await service.exportToPdf(
        container,
        'http://logo.png',
        formData,
        cfg
      );

      // ——— Assert ———
      expect(result).toEqual({ url: 'blob:fake-url', name: 'Mi_Título.pdf' });

      // Mapa leído
      expect(
        (TestBed.inject(MapService) as unknown as MapServiceMock).getMap
      ).toHaveBeenCalled();

      // Grilla standalone creada y cerrada al final
      expect(gridSvc.makeStandaloneGridLayer).toHaveBeenCalled();
      expect(gridSvc.closeGridLayer).toHaveBeenCalled();

      const [extentArg, optsArg] =
        gridSvc.makeStandaloneGridLayer.calls.mostRecent().args as [
          [number, number, number, number],
          {
            expandBy?: number;
            idealCells?: number;
            color?: string;
            width?: number;
          },
        ];
      expect(extentArg.length).toBe(4);
      expect(optsArg).toEqual(
        jasmine.objectContaining({
          expandBy: 5,
          idealCells: 135,
          color: '#000000',
          width: 1,
        })
      );

      // Imagen de mapa para papel
      expect(imgSvc.generateExportMapImageForPaper).toHaveBeenCalled();
      const imgCallArgs =
        imgSvc.generateExportMapImageForPaper.calls.mostRecent().args;

      expect(imgCallArgs[0]).toBe(container); // container
      expect(imgCallArgs[1]).toEqual(
        jasmine.objectContaining({
          w: jasmine.any(Number),
          h: jasmine.any(Number),
        })
      );
      expect(imgCallArgs[2]).toEqual(mapMargins);
      expect(imgCallArgs[3]).toBe(150);
      expect(imgCallArgs[4]).toEqual([gridLayerFake]);

      // Barra de escala (por defecto VScaleLine = true → getScaleLineImageData)
      expect(imgSvc.getScaleLineImageData).toHaveBeenCalledWith(
        mapMock as unknown as Map
      );

      // Servicio de escala debe ajustar el denominador
      expect(scaleSvc.snapScaleDenominator).toHaveBeenCalled();

      // Leyendas cuando includeLegend = true
      expect(
        (
          TestBed.inject(
            LegendFacadeService
          ) as unknown as LegendFacadeServiceMock
        ).getLegendsFromVisibleLayers
      ).toHaveBeenCalled();

      // Builder invocado y con argumentos coherentes
      expect(pdfBuilder.build).toHaveBeenCalled();
      const buildArgs = (pdfBuilder.build as jasmine.Spy).calls.mostRecent()
        .args[0] as BuildArgs;

      expect(buildArgs.formData).toEqual(jasmine.objectContaining(formData));
      expect(buildArgs.imgData).toBe('data:image/png;base64,MAP');
      expect(buildArgs.scale).toEqual(
        jasmine.objectContaining({
          dataUrl: 'data:image/png;base64,SCALE',
          width: 120,
          height: 24,
        })
      );
      expect(buildArgs.legends?.length).toBe(2);
      expect(buildArgs.logoUrl).toBe('http://logo.png');
      expect(buildArgs.templateId).toBe('standard-vX' as unknown as TemplateId);

      expect(buildArgs.map).toEqual(
        jasmine.objectContaining({
          canvasWidth: jasmine.any(Number),
          canvasHeight: jasmine.any(Number),
          placement: jasmine.objectContaining({
            left: mapMargins.left,
            top: mapMargins.top,
            widthPt: jasmine.any(Number),
            heightPt: jasmine.any(Number),
          }),
        })
      );
    });

    it('debe usar retry de RENDER_MAP cuando el primer intento devuelve null', async () => {
      // ——— Arrange ———
      const mapMock = {
        getView: () => ({
          getCenter: () => [0, 0],
          getResolution: () => 1,
          getProjection: () => ({
            getMetersPerUnit: () => 1,
          }),
        }),
      };
      (
        TestBed.inject(MapService) as unknown as MapServiceMock
      ).getMap.and.returnValue(mapMock as unknown as Map);

      const imgSvc = TestBed.inject(
        MapExportImageService
      ) as unknown as MapExportImageServiceMock;
      const pdfBuilder = TestBed.inject(
        PdfBuilderService
      ) as unknown as PdfBuilderServiceMock;
      const gridSvc = TestBed.inject(GridService) as unknown as GridServiceMock;
      const legendsSvc = TestBed.inject(
        LegendFacadeService
      ) as unknown as LegendFacadeServiceMock;

      // Primer intento → null, segundo → OK
      imgSvc.generateExportMapImageForPaper.and.returnValues(
        Promise.resolve(null),
        Promise.resolve({
          imgData: 'data:image/png;base64,MAP_RETRY',
          widthPt: 400,
          heightPt: 200,
        })
      );

      const container = document.createElement('div');
      const formData: ExportFormData = {
        title: 'Con Retry',
        author: 'Autor',
        paper: PaperFormat.A4,
        orientation: PaperOrientation.Vertical,
        showGrid: false,
        includeLegend: false,
      };

      const cfg: MapExportOrchestratorConfig = {
        logPrefix: '[PDF retry]',
        templateId: 'standard-vX' as unknown as TemplateId,
        mapMargins: { top: 20, right: 20, bottom: 20, left: 20 },
        dpi: 120,
      };

      // ——— Act ———
      const result = await service.exportToPdf(container, null, formData, cfg);

      // ——— Assert ———
      expect(result).toEqual({
        url: 'blob:fake-url',
        name: 'Con_Retry.pdf',
      });

      expect(imgSvc.generateExportMapImageForPaper.calls.count()).toBe(2);
      expect(pdfBuilder.build).toHaveBeenCalled();

      // Barra de escala llamada
      expect(imgSvc.getScaleLineImageData).toHaveBeenCalled();

      // Sin grilla, no se llama makeStandaloneGridLayer
      expect(gridSvc.makeStandaloneGridLayer).not.toHaveBeenCalled();

      // Sin leyendas
      expect(legendsSvc.getLegendsFromVisibleLayers).not.toHaveBeenCalled();
    });

    it('lanza ExportError (stage RENDER_MAP) si generateExportMapImageForPaper devuelve null (dos intentos)', async () => {
      // ——— Arrange ———
      const mapMock = {
        getView: () => ({
          getCenter: () => [0, 0],
          getResolution: () => 1,
          getProjection: () => ({
            getMetersPerUnit: () => 1,
          }),
        }),
      };
      (
        TestBed.inject(MapService) as unknown as MapServiceMock
      ).getMap.and.returnValue(mapMock as unknown as Map);

      const imgSvc = TestBed.inject(
        MapExportImageService
      ) as unknown as MapExportImageServiceMock;
      const pdfBuilder = TestBed.inject(
        PdfBuilderService
      ) as unknown as PdfBuilderServiceMock;
      const legendsSvc = TestBed.inject(
        LegendFacadeService
      ) as unknown as LegendFacadeServiceMock;
      const gridSvc = TestBed.inject(GridService) as unknown as GridServiceMock;

      imgSvc.generateExportMapImageForPaper.and.resolveTo(null);

      const container = document.createElement('div');
      const formData: ExportFormData = {
        title: 'Caso Nulo',
        author: 'Tester',
        paper: PaperFormat.Letter,
        orientation: PaperOrientation.Horizontal,
        showGrid: false,
        includeLegend: false,
      };

      const cfg: MapExportOrchestratorConfig = {
        logPrefix: '[PDF error]',
        templateId: 'standard-vX' as unknown as TemplateId,
        mapMargins: { top: 10, right: 10, bottom: 10, left: 10 },
        dpi: 96,
      };

      // ——— Act + Assert ———
      try {
        await service.exportToPdf(container, null, formData, cfg);
        fail('Debió lanzar ExportError con stage "RENDER_MAP"');
      } catch (e) {
        expect(e instanceof ExportError).toBeTrue();
      }

      expect(imgSvc.generateExportMapImageForPaper).toHaveBeenCalled();
      expect(pdfBuilder.build).not.toHaveBeenCalled();
      expect(legendsSvc.getLegendsFromVisibleLayers).not.toHaveBeenCalled();
      expect(gridSvc.makeStandaloneGridLayer).not.toHaveBeenCalled();
    });

    it('lanza ExportError (stage INIT) si no hay mapa en MapService', async () => {
      // ——— Arrange ———
      (
        TestBed.inject(MapService) as unknown as MapServiceMock
      ).getMap.and.returnValue(null);

      const imgSvc = TestBed.inject(
        MapExportImageService
      ) as unknown as MapExportImageServiceMock;
      const pdfBuilder = TestBed.inject(
        PdfBuilderService
      ) as unknown as PdfBuilderServiceMock;
      const legendsSvc = TestBed.inject(
        LegendFacadeService
      ) as unknown as LegendFacadeServiceMock;
      const gridSvc = TestBed.inject(GridService) as unknown as GridServiceMock;

      const container = document.createElement('div');
      const formData: ExportFormData = {
        title: 'Sin Mapa',
        author: 'Autor',
        paper: PaperFormat.Letter,
        orientation: PaperOrientation.Vertical,
        showGrid: true,
        includeLegend: true,
      };

      const cfg: MapExportOrchestratorConfig = {
        logPrefix: '[PDF sin mapa]',
        templateId: 'standard-vX' as unknown as TemplateId,
        mapMargins: { top: 10, right: 10, bottom: 10, left: 10 },
      };

      // ——— Act + Assert ———
      try {
        await service.exportToPdf(container, 'http://logo.png', formData, cfg);
        fail('Debió lanzar ExportError con stage "INIT"');
      } catch (e) {
        expect(e instanceof ExportError).toBeTrue();
      }

      expect(imgSvc.generateExportMapImageForPaper).not.toHaveBeenCalled();
      expect(pdfBuilder.build).not.toHaveBeenCalled();
      expect(legendsSvc.getLegendsFromVisibleLayers).not.toHaveBeenCalled();
      expect(gridSvc.makeStandaloneGridLayer).not.toHaveBeenCalled();
    });

    it('no debe solicitar leyendas cuando includeLegend=false', async () => {
      // ——— Arrange ———
      const mapMock = {
        getView: () => ({
          getCenter: () => [123, 456],
          getResolution: () => 2,
          getProjection: () => ({
            getMetersPerUnit: () => 1,
          }),
        }),
      };
      (
        TestBed.inject(MapService) as unknown as MapServiceMock
      ).getMap.and.returnValue(mapMock as unknown as Map);

      const imgSvc = TestBed.inject(
        MapExportImageService
      ) as unknown as MapExportImageServiceMock;
      const legendsSvc = TestBed.inject(
        LegendFacadeService
      ) as unknown as LegendFacadeServiceMock;
      const pdfBuilder = TestBed.inject(
        PdfBuilderService
      ) as unknown as PdfBuilderServiceMock;
      const gridSvc = TestBed.inject(GridService) as unknown as GridServiceMock;

      imgSvc.generateExportMapImageForPaper.and.resolveTo({
        imgData: 'data:image/png;base64,MAP',
        widthPt: 500,
        heightPt: 300,
      });

      const container = document.createElement('div');
      const formData: ExportFormData = {
        title: 'Sin Leyendas',
        author: 'Autor',
        paper: PaperFormat.A4,
        orientation: PaperOrientation.Horizontal,
        showGrid: false,
        includeLegend: false, // clave
      };

      const cfg: MapExportOrchestratorConfig = {
        logPrefix: '[PDF sin legends]',
        templateId: 'standard-vX' as unknown as TemplateId,
        mapMargins: { top: 15, right: 15, bottom: 15, left: 15 },
        dpi: 120,
      };

      // ——— Act ———
      const result = await service.exportToPdf(
        container,
        'http://logo.png',
        formData,
        cfg
      );

      // ——— Assert ———
      expect(result).toEqual({
        url: 'blob:fake-url',
        name: 'Sin_Leyendas.pdf',
      });

      expect(legendsSvc.getLegendsFromVisibleLayers).not.toHaveBeenCalled();
      expect(pdfBuilder.build).toHaveBeenCalled();

      const args = (pdfBuilder.build as jasmine.Spy).calls.mostRecent()
        .args[0] as BuildArgs;
      expect(Array.isArray(args.legends)).toBeTrue();
      expect(args.legends?.length ?? 0).toBe(0);

      expect(gridSvc.makeStandaloneGridLayer).not.toHaveBeenCalled();
      expect(imgSvc.getScaleLineImageData).toHaveBeenCalled();
    });
  });
});
