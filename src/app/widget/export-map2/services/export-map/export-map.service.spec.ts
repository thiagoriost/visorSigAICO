import { TestBed } from '@angular/core/testing';

import { ExportMapService } from './export-map.service';
import { MapService } from '@app/core/services/map-service/map.service';
import { LegendFacadeService } from '@app/shared/services/legend-image-service/legend-facade.service';
import { PdfBuilderService } from '@app/shared/pdf/services/pdf-builder-service/pdf-builder.service';
import type { BuildArgs } from '@app/shared/pdf/services/pdf-builder-service/pdf-builder.service';
import { MapExportImageService } from '@app/shared/services/map-export-service/map-export-image.service';
import { GridService } from '@app/shared/services/grid-service/grid.service';
import { PaperOrientation } from '@app/shared/Interfaces/export-map/paper-format';
import Map from 'ol/Map';

// ⬇️ Importa la clase de error con stages
import { ExportError } from '@app/shared/Interfaces/export-map/export-map-errors';

// ────────────────────────────
// Tipos auxiliares (opcionales para claridad)
// ────────────────────────────
interface ScaleResult {
  scaleImage: string;
  SCwidth: number;
  SCheight: number;
}
interface GridOptions {
  expandBy?: number;
  idealCells?: number;
}

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
  getAvailableTemplates = jasmine
    .createSpy('getAvailableTemplates')
    .and.returnValue([]);
  registerTemplates = jasmine.createSpy('registerTemplates');

  // Genera el nombre seguro como hace el servicio real
  build = jasmine.createSpy('build').and.callFake(async (args: BuildArgs) => {
    const rawTitle = args?.formData?.title ?? 'documento';
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

  // ✅ Nuevo: mock del ScaleLine robusto centralizado
  getScaleLineImageData = jasmine
    .createSpy('getScaleLineImageData')
    .and.resolveTo({
      scaleImage: 'data:image/png;base64,SCALE',
      SCwidth: 120,
      SCheight: 24,
    } as ScaleResult);
}
class GridServiceMock {
  prepareGridLayer = jasmine.createSpy('prepareGridLayer');
  closeGridLayer = jasmine.createSpy('closeGridLayer');
}

describe('ExportMapService (Salida Gráfica v2 refactor)', () => {
  let service: ExportMapService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ExportMapService,
        { provide: MapService, useClass: MapServiceMock },
        { provide: LegendFacadeService, useClass: LegendFacadeServiceMock },
        { provide: PdfBuilderService, useClass: PdfBuilderServiceMock },
        { provide: MapExportImageService, useClass: MapExportImageServiceMock },
        { provide: GridService, useClass: GridServiceMock },
      ],
    });
    service = TestBed.inject(ExportMapService);
  });

  describe('generatePdfFromCanvas()', () => {
    it('genera PDF con leyendas y registra la plantilla "standard" si el builder está vacío', async () => {
      // — Arrange —
      const mapMock = {
        getView: () => ({
          getCenter: () => [1000, 2000],
          getResolution: () => 2,
          getProjection: () => ({ getCode: () => 'EPSG:3857' }),
        }),
        getSize: () => [800, 600],
      };
      (
        TestBed.inject(MapService) as unknown as MapServiceMock
      ).getMap.and.returnValue(mapMock as unknown as Map);

      // Leyendas
      (
        TestBed.inject(
          LegendFacadeService
        ) as unknown as LegendFacadeServiceMock
      ).getLegendsFromVisibleLayers.and.resolveTo([
        { layerName: 'Capa A', dataUrl: 'data:image/png;base64,LEG_A' },
        { layerName: 'Capa B', dataUrl: 'data:image/png;base64,LEG_B' },
      ]);

      const pdfBuilder = TestBed.inject(
        PdfBuilderService
      ) as unknown as PdfBuilderServiceMock;

      const container = document.createElement('div');
      const formData = {
        title: 'Mi Título',
        author: 'Autor',
        showGrid: false,
        includeLegend: true,
        orientation: PaperOrientation.Horizontal,
      };

      // — Act —
      const result = await service.generatePdfFromCanvas(
        container,
        'http://logo.png',
        formData
      );

      // — Assert —
      expect(result).toEqual({ url: 'blob:fake-url', name: 'Mi_Título.pdf' });

      expect(pdfBuilder.getAvailableTemplates).toHaveBeenCalled();
      expect(pdfBuilder.registerTemplates).toHaveBeenCalled(); // registra Standard (fallback)

      // build() llamado con argumentos correctos
      const args = (pdfBuilder.build as jasmine.Spy).calls.mostRecent()
        .args[0] as BuildArgs;
      expect(args.templateId).toBe('standard');
      expect(args.formData).toEqual(jasmine.objectContaining(formData));
      expect(args.imgData).toBe('data:image/png;base64,MAP');

      // ✅ ahora la escala viene del servicio compartido
      expect(args.scale).toEqual(
        jasmine.objectContaining({
          dataUrl: 'data:image/png;base64,SCALE',
          width: 120,
          height: 24,
        })
      );

      expect(args.legends.length).toBe(2);
      expect(args.logoUrl).toBe('http://logo.png');
    });

    it('prepara la grilla cuando showGrid=true y la cierra en finally', async () => {
      // — Arrange —
      const mapMock = {
        getView: () => ({
          getCenter: () => [5000, 8000],
          getResolution: () => 2,
          getProjection: () => ({ getCode: () => 'EPSG:3857' }),
        }),
        getSize: () => [800, 600],
      };
      (
        TestBed.inject(MapService) as unknown as MapServiceMock
      ).getMap.and.returnValue(mapMock as unknown as Map);

      // Imagen OK (queda por defecto del mock)
      (
        TestBed.inject(
          MapExportImageService
        ) as unknown as MapExportImageServiceMock
      ).generateExportMapImageForPaper.and.resolveTo({
        imgData: 'data:image/png;base64,MAP',
        widthPt: 500,
        heightPt: 300,
      });

      // Escala OK (queda por defecto del mock)
      const gridSvc = TestBed.inject(GridService) as unknown as GridServiceMock;

      const container = document.createElement('div');
      const formData = {
        title: 'Con Grilla',
        author: 'Autor',
        showGrid: true, // clave
        includeLegend: false,
        orientation: PaperOrientation.Horizontal,
      };

      // — Act —
      const result = await service.generatePdfFromCanvas(
        container,
        'http://logo.png',
        formData
      );

      // — Assert —
      expect(result).toEqual({ url: 'blob:fake-url', name: 'Con_Grilla.pdf' });
      expect(gridSvc.prepareGridLayer).toHaveBeenCalled();
      expect(gridSvc.closeGridLayer).toHaveBeenCalled();

      const [visibleArg, extentArg, optionsArg] = (
        gridSvc.prepareGridLayer as jasmine.Spy
      ).calls.mostRecent().args as [
        boolean,
        [number, number, number, number],
        GridOptions,
      ];
      expect(visibleArg).toBeTrue();
      expect(extentArg.length).toBe(4);
      expect(optionsArg).toEqual(
        jasmine.objectContaining({ expandBy: 5, idealCells: 135 })
      );
    });

    // ACTUALIZADO: ahora debe lanzar ExportError con stage INIT
    it('lanza ExportError (stage INIT) si NO hay mapa en MapService', async () => {
      (
        TestBed.inject(MapService) as unknown as MapServiceMock
      ).getMap.and.returnValue(null);

      const imgSvc = TestBed.inject(
        MapExportImageService
      ) as unknown as MapExportImageServiceMock;
      const pdfSvc = TestBed.inject(
        PdfBuilderService
      ) as unknown as PdfBuilderServiceMock;
      const legendsSvc = TestBed.inject(
        LegendFacadeService
      ) as unknown as LegendFacadeServiceMock;
      const gridSvc = TestBed.inject(GridService) as unknown as GridServiceMock;

      try {
        await service.generatePdfFromCanvas(
          document.createElement('div'),
          'http://logo.png',
          {
            title: 'Sin Mapa',
            author: 'Autor',
            showGrid: false,
            includeLegend: false,
            orientation: PaperOrientation.Horizontal,
          }
        );
        fail('Debió lanzar ExportError con stage "INIT"');
      } catch (e) {
        expect(e instanceof ExportError).toBeTrue();
      }

      expect(imgSvc.generateExportMapImageForPaper).not.toHaveBeenCalled();
      expect(pdfSvc.build).not.toHaveBeenCalled();
      expect(legendsSvc.getLegendsFromVisibleLayers).not.toHaveBeenCalled();
      expect(gridSvc.prepareGridLayer).not.toHaveBeenCalled();
      expect(gridSvc.closeGridLayer).not.toHaveBeenCalled();
    });

    // ⬇️ ACTUALIZADO: ahora debe lanzar ExportError con stage RENDER_MAP
    it('lanza ExportError (stage RENDER_MAP) si generateExportMapImageForPaper devuelve null', async () => {
      const mapMock = {
        getView: () => ({
          getCenter: () => [0, 0],
          getResolution: () => 1,
          getProjection: () => ({ getCode: () => 'EPSG:3857' }),
        }),
        getSize: () => [800, 600],
      };
      (
        TestBed.inject(MapService) as unknown as MapServiceMock
      ).getMap.and.returnValue(mapMock as unknown as Map);

      (
        TestBed.inject(
          MapExportImageService
        ) as unknown as MapExportImageServiceMock
      ).generateExportMapImageForPaper.and.resolveTo(null);

      const pdfSvc = TestBed.inject(
        PdfBuilderService
      ) as unknown as PdfBuilderServiceMock;
      const legendsSvc = TestBed.inject(
        LegendFacadeService
      ) as unknown as LegendFacadeServiceMock;

      try {
        await service.generatePdfFromCanvas(
          document.createElement('div'),
          'http://logo.png',
          {
            title: 'Caso Nulo',
            author: 'Tester',
            showGrid: false,
            includeLegend: false,
            orientation: PaperOrientation.Horizontal,
          }
        );
        fail('Debió lanzar ExportError con stage "RENDER_MAP"');
      } catch (e) {
        expect(e instanceof ExportError).toBeTrue();
      }

      expect(pdfSvc.build).not.toHaveBeenCalled();
      expect(legendsSvc.getLegendsFromVisibleLayers).not.toHaveBeenCalled();
    });

    it('no solicita leyendas cuando includeLegend=false', async () => {
      const mapMock = {
        getView: () => ({
          getCenter: () => [123, 456],
          getResolution: () => 2,
          getProjection: () => ({ getCode: () => 'EPSG:3857' }),
        }),
        getSize: () => [800, 600],
      };
      (
        TestBed.inject(MapService) as unknown as MapServiceMock
      ).getMap.and.returnValue(mapMock as unknown as Map);

      (
        TestBed.inject(
          MapExportImageService
        ) as unknown as MapExportImageServiceMock
      ).generateExportMapImageForPaper.and.resolveTo({
        imgData: 'data:image/png;base64,MAP',
        widthPt: 500,
        heightPt: 300,
      });

      // Escala OK (mock)
      const legendsSvc = TestBed.inject(
        LegendFacadeService
      ) as unknown as LegendFacadeServiceMock;
      const pdfBuilder = TestBed.inject(
        PdfBuilderService
      ) as unknown as PdfBuilderServiceMock;
      const gridSvc = TestBed.inject(GridService) as unknown as GridServiceMock;

      const result = await service.generatePdfFromCanvas(
        document.createElement('div'),
        'http://logo.png',
        {
          title: 'Sin Leyendas',
          author: 'Autor',
          showGrid: false,
          includeLegend: false,
          orientation: PaperOrientation.Horizontal,
        }
      );

      expect(result).toEqual({
        url: 'blob:fake-url',
        name: 'Sin_Leyendas.pdf',
      });

      expect(legendsSvc.getLegendsFromVisibleLayers).not.toHaveBeenCalled();
      expect(pdfBuilder.build).toHaveBeenCalled();
      const buildArgs = (pdfBuilder.build as jasmine.Spy).calls.mostRecent()
        .args[0] as BuildArgs;
      expect(Array.isArray(buildArgs.legends)).toBeTrue();
      expect(buildArgs.legends.length).toBe(0);
      expect(gridSvc.prepareGridLayer).not.toHaveBeenCalled();
      expect(gridSvc.closeGridLayer).not.toHaveBeenCalled();
    });
  });
});
