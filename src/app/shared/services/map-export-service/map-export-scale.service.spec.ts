// src/app/shared/services/map-export/map-export-scale.service.unit.spec.ts
import { TestBed } from '@angular/core/testing';
import type Map from 'ol/Map';

import {
  MapExportScaleService,
  ScaleImageResult,
} from './map-export-scale.service';

describe('MapExportScaleService', () => {
  let service: MapExportScaleService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MapExportScaleService],
    });
    service = TestBed.inject(MapExportScaleService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getScaleLineImageData()', () => {
    it('debe usar .ol-scale-line-inner cuando existe y es válida', async () => {
      // Arrange
      const root = document.createElement('div');
      const inner = document.createElement('div');
      inner.className = 'ol-scale-line-inner';
      inner.textContent = '100 km';

      // offsetWidth no siempre se calcula en tests, lo forzamos:
      Object.defineProperty(inner, 'offsetWidth', { value: 120 });

      root.appendChild(inner);

      const mapMock = {
        getTargetElement: () => root,
      } as unknown as Map;

      interface DrawScaleToCanvasTarget {
        drawScaleToCanvas: (
          width: number,
          text: string
        ) => Promise<ScaleImageResult>;
      }

      // Espiamos el drawScaleToCanvas para no depender de canvas real
      const drawSpy = spyOn(
        service as unknown as DrawScaleToCanvasTarget,
        'drawScaleToCanvas'
      ).and.callFake(
        async (width: number, text: string): Promise<ScaleImageResult> => {
          // Usamos text para evitar lint de no-unused-vars
          void text;
          return {
            scaleImage: 'data:test-scale',
            SCwidth: width,
            SCheight: 30,
          };
        }
      );

      // Act
      const result = await service.getScaleLineImageData(mapMock);

      // Assert
      expect(drawSpy).toHaveBeenCalled();
      const [wArg, textArg] = drawSpy.calls.mostRecent().args as [
        number,
        string,
      ];
      expect(wArg).toBe(120);
      expect(textArg).toBe('100 km');

      expect(result).toEqual({
        scaleImage: 'data:test-scale',
        SCwidth: 120,
        SCheight: 30,
      });
    });

    it('debe usar getQuickScaleLineImageData cuando no encuentra la barra real', async () => {
      // Arrange
      const root = document.createElement('div'); // sin .ol-scale-line-inner
      const mapMock = {
        getTargetElement: () => root,
      } as unknown as Map;

      interface WaitForElementTarget {
        waitForElement: (
          fn: () => HTMLElement | null,
          tries?: number,
          delayMs?: number
        ) => Promise<HTMLElement | null>;
      }

      // que waitForElement termine rápido devolviendo null
      spyOn(
        service as unknown as WaitForElementTarget,
        'waitForElement'
      ).and.resolveTo(null);

      const quickSpy = spyOn(
        service,
        'getQuickScaleLineImageData'
      ).and.resolveTo({
        scaleImage: 'data:quick',
        SCwidth: 80,
        SCheight: 20,
      });

      // Act
      const result = await service.getScaleLineImageData(mapMock);

      // Assert
      expect(quickSpy).toHaveBeenCalledWith(mapMock);
      expect(result).toEqual({
        scaleImage: 'data:quick',
        SCwidth: 80,
        SCheight: 20,
      });
    });
  });

  describe('getQuickScaleLineImageData()', () => {
    it('debe calcular una barra dentro del rango y con etiqueta en metros/km', async () => {
      // Arrange
      const mapMock = {
        getView: () => ({
          getResolution: () => 10, // 10 m/px aprox
          getProjection: () => ({
            getMetersPerUnit: () => 1,
          }),
        }),
      } as unknown as Map;

      interface DrawScaleToCanvasTarget {
        drawScaleToCanvas: (
          width: number,
          text: string
        ) => Promise<ScaleImageResult>;
      }

      const drawSpy = spyOn(
        service as unknown as DrawScaleToCanvasTarget,
        'drawScaleToCanvas'
      ).and.callFake(
        async (width: number, text: string): Promise<ScaleImageResult> => {
          // Usamos text para evitar lint
          void text;
          return {
            scaleImage: 'data:quick-scale',
            SCwidth: width,
            SCheight: 40,
          };
        }
      );

      // Act
      const result = await service.getQuickScaleLineImageData(mapMock);

      // Assert
      expect(drawSpy).toHaveBeenCalled();
      const [wArg, textArg] = drawSpy.calls.mostRecent().args as [
        number,
        string,
      ];

      // ancho razonable
      expect(wArg).toBeGreaterThan(60);
      expect(wArg).toBeLessThan(200);

      // etiqueta con unidad
      expect(textArg.includes('m') || textArg.includes('km')).toBeTrue();

      expect(result.scaleImage).toBe('data:quick-scale');
      expect(result.SCwidth).toBe(wArg);
      expect(result.SCheight).toBe(40);
    });
  });

  describe('getScaleBarImageData()', () => {
    it('debe generar barra segmentada con parámetros coherentes', async () => {
      // Arrange
      const mapMock = {
        getView: () => ({
          getResolution: () => 20, // m/px
          getProjection: () => ({
            getMetersPerUnit: () => 1,
          }),
        }),
      } as unknown as Map;

      interface DrawScaleBarToCanvasTarget {
        drawScaleBarToCanvas: (
          widthPx: number,
          totalMeters: number,
          metersPerPx: number,
          segments?: number
        ) => Promise<ScaleImageResult>;
      }

      // NO verificamos directamente snapScaleDenominator porque
      // estamos stubeando drawScaleBarToCanvas (la llamada real se pierde).
      const drawBarSpy = spyOn(
        service as unknown as DrawScaleBarToCanvasTarget,
        'drawScaleBarToCanvas'
      ).and.callFake(
        async (
          widthPx: number,
          totalMeters: number,
          metersPerPx: number,
          segments = 4
        ): Promise<ScaleImageResult> => {
          // Usamos segments para evitar lint de "assigned but never used"
          void segments;
          void totalMeters;
          void metersPerPx;
          return {
            scaleImage: 'data:bar',
            SCwidth: widthPx,
            SCheight: 50,
          };
        }
      );

      // Act
      const result = await service.getScaleBarImageData(mapMock);

      // Assert
      expect(drawBarSpy).toHaveBeenCalled();

      const [wPx, totalMeters, metersPerPx, segments] =
        drawBarSpy.calls.mostRecent().args as [number, number, number, number];

      expect(wPx).toBeGreaterThan(60);
      expect(wPx).toBeLessThan(220);
      expect(totalMeters).toBeGreaterThan(0);
      expect(metersPerPx).toBe(20);
      expect(segments).toBe(4);

      expect(result).toEqual({
        scaleImage: 'data:bar',
        SCwidth: wPx,
        SCheight: 50,
      });
    });

    it('fallback: cuando no hay resolución/proyección debe devolver una barra genérica', async () => {
      // Arrange
      const mapMock = {
        getView: () => ({
          getResolution: () => null,
          getProjection: () => null,
        }),
      } as unknown as Map;

      interface DrawScaleBarToCanvasTarget {
        drawScaleBarToCanvas: (
          widthPx: number,
          totalMeters: number,
          metersPerPx: number,
          segments?: number
        ) => Promise<ScaleImageResult>;
      }

      const drawBarSpy = spyOn(
        service as unknown as DrawScaleBarToCanvasTarget,
        'drawScaleBarToCanvas'
      ).and.callFake(
        async (
          widthPx: number,
          totalMeters: number,
          metersPerPx: number,
          segments = 4
        ): Promise<ScaleImageResult> => {
          // Usamos segments para evitar lint
          void segments;
          void totalMeters;
          void metersPerPx;
          return {
            scaleImage: 'data:bar-fallback',
            SCwidth: widthPx,
            SCheight: 30,
          };
        }
      );

      // Act
      const result = await service.getScaleBarImageData(mapMock);

      // Assert: el código real llama con 3 args (segments usa default = 4)
      expect(drawBarSpy).toHaveBeenCalled();
      const [wPx, totalMeters, metersPerPx] = drawBarSpy.calls.mostRecent()
        .args as [number, number, number];

      expect(wPx).toBe(100);
      expect(totalMeters).toBe(1000);
      expect(metersPerPx).toBe(1);

      expect(result.scaleImage).toBe('data:bar-fallback');
      expect(result.SCwidth).toBe(100);
      expect(result.SCheight).toBe(30);
    });
  });

  describe('snapScaleDenominator()', () => {
    it('debe aproximar al denominador más cercano de la tabla', () => {
      const den = service.snapScaleDenominator(3400);
      // Más cerca de 2500 que de 5000
      expect(den).toBe(2500);
    });

    it('debe devolver el mínimo cuando el valor es inválido o no positivo', () => {
      expect(service.snapScaleDenominator(0)).toBe(1000);
      expect(service.snapScaleDenominator(-50)).toBe(1000);
      expect(service.snapScaleDenominator(Number.NaN)).toBe(1000);
      expect(service.snapScaleDenominator(Number.POSITIVE_INFINITY)).toBe(1000);
    });
  });
});
