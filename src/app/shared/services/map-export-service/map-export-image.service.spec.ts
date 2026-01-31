// map-export-image.service.unit.spec.ts
import { TestBed } from '@angular/core/testing';
import { MapExportImageService } from './map-export-image.service';
import { MapExportCoreService } from './map-export-core.service';
import { MapService } from '@app/core/services/map-service/map.service';
import {
  computeContentSizePx,
  MarginsPt,
  PAPER_SPECS_PT,
  PaperFormat,
} from '@app/shared/Interfaces/export-map/paper-format';
import Map from 'ol/Map';
import {
  MapExportScaleService,
  ScaleImageResult,
} from './map-export-scale.service';

// ------------------------
// Helpers para viewport/canvas
// ------------------------
const makeCanvas = (
  w = 256,
  h = 128,
  dataUrl = 'data:image/png;base64,PNG'
) => {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  // forzar dataURL determinista
  c.toDataURL = () => dataUrl;
  return c;
};

const makeViewportWithCanvases = (count = 1) => {
  const vp = document.createElement('div');
  for (let i = 0; i < count; i++) vp.appendChild(makeCanvas());
  return vp;
};

describe('MapExportImageService', () => {
  let service: MapExportImageService;

  // Spy de MapService
  const mapServiceSpy = jasmine.createSpyObj<MapService>('MapService', [
    'getMap',
    'createMap',
    'getLayerGroupByName',
    'addLayer',
    'removeLayer',
    'showOrHideLayer',
    'generateTransparency',
    'identify',
    'getLayerByDefinition',
  ]);

  // Spy del núcleo (incluye ensureCanvasesNotTainted)
  const coreSpy = jasmine.createSpyObj<MapExportCoreService>(
    'MapExportCoreService',
    [
      'createCleanMap',
      'getIntermediateAndUpperLayers',
      'loadExportMapLayers',
      'waitForMapToRender',
      'composeViewportToCanvas',
      'ensureCanvasesNotTainted',
    ]
  );

  // Spy de MapExportScaleService (nuevo)
  const scaleServiceSpy = jasmine.createSpyObj<MapExportScaleService>(
    'MapExportScaleService',
    [
      'getScaleLineImageData',
      'getQuickScaleLineImageData',
      'getScaleBarImageData',
    ]
  );

  // rAF inmediato para evitar flakiness
  let rafSpy!: jasmine.Spy<(cb: FrameRequestCallback) => number>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: MapService, useValue: mapServiceSpy },
        { provide: MapExportCoreService, useValue: coreSpy },
        { provide: MapExportScaleService, useValue: scaleServiceSpy },
        MapExportImageService,
      ],
    });

    service = TestBed.inject(MapExportImageService);

    // requestAnimationFrame inmediato
    rafSpy = spyOn(window, 'requestAnimationFrame').and.callFake(
      (cb: FrameRequestCallback): number => {
        cb(0);
        return 1;
      }
    );

    // defaults del core
    coreSpy.getIntermediateAndUpperLayers.and.returnValue([]);
    coreSpy.loadExportMapLayers.and.resolveTo();
    coreSpy.waitForMapToRender.and.resolveTo();
    coreSpy.ensureCanvasesNotTainted.and.resolveTo();

    // devolver un canvas del tamaño solicitado y con PNG válido
    coreSpy.composeViewportToCanvas.and.callFake(
      (_map: Map, w: number, h: number) => {
        return makeCanvas(w, h, 'data:image/png;base64,PNG');
      }
    );
  });

  afterEach(() => {
    mapServiceSpy.getMap.calls.reset();
    coreSpy.createCleanMap.calls.reset();
    coreSpy.getIntermediateAndUpperLayers.calls.reset();
    coreSpy.loadExportMapLayers.calls.reset();
    coreSpy.waitForMapToRender.calls.reset();
    coreSpy.ensureCanvasesNotTainted.calls.reset();
    coreSpy.composeViewportToCanvas.calls.reset();
    scaleServiceSpy.getScaleLineImageData.calls.reset();
    scaleServiceSpy.getQuickScaleLineImageData.calls.reset();
    scaleServiceSpy.getScaleBarImageData.calls.reset();
    rafSpy.calls.reset();
  });

  it('should be created (smoke)', () => {
    expect(service).toBeTruthy();
  });

  // ─────────────────────────────────────────
  // generateExportMapImage (modo visor)
  // ─────────────────────────────────────────
  it('generateExportMapImage: retorna null si no hay mapa', async () => {
    mapServiceSpy.getMap.and.returnValue(null);

    const container = document.createElement('div');
    const result = await service.generateExportMapImage(container);

    expect(result).toBeNull();
    expect(coreSpy.createCleanMap).not.toHaveBeenCalled();
  });

  it('generateExportMapImage: genera PNG con tamaño del visor y llama a core', async () => {
    // Fake mapa original
    const mapOriginal = {
      getSize: () => [300, 200] as [number, number],
      getView: () => ({
        getProjection: () => ({ getCode: () => 'EPSG:3857' }),
        calculateExtent: (_size: number[]) => {
          void _size;
          return [0, 0, 1, 1] as [number, number, number, number];
        },
      }),
    };
    mapServiceSpy.getMap.and.returnValue(mapOriginal as unknown as Map);

    // Clean map con canvas en el viewport
    const viewport = makeViewportWithCanvases(1);
    const cleanMapStub = { getViewport: () => viewport };
    coreSpy.createCleanMap.and.returnValue(cleanMapStub as unknown as Map);

    const container = document.createElement('div');
    const result = await service.generateExportMapImage(container);

    expect(result).toEqual(
      jasmine.objectContaining({
        imgData: jasmine.stringMatching(/^data:image\/png;base64,/),
        width: 300,
        height: 200,
      })
    );

    expect(container.style.width).toBe('300px');
    expect(container.style.height).toBe('200px');

    expect(coreSpy.createCleanMap).toHaveBeenCalled();
    expect(coreSpy.getIntermediateAndUpperLayers).toHaveBeenCalled();
    expect(coreSpy.loadExportMapLayers).toHaveBeenCalledWith(
      cleanMapStub as unknown as Map,
      jasmine.any(Array)
    );
    expect(coreSpy.waitForMapToRender).toHaveBeenCalledWith(
      cleanMapStub as unknown as Map
    );
    expect(coreSpy.composeViewportToCanvas).toHaveBeenCalledWith(
      cleanMapStub as unknown as Map,
      300,
      200
    );
  });

  // ─────────────────────────────────────────
  // generateExportMapImageForPaper (modo papel)
  // ─────────────────────────────────────────
  it('generateExportMapImageForPaper: compone canvas y devuelve PNG+pt con verificación de taint', async () => {
    const toDataURLSpy = spyOn(
      HTMLCanvasElement.prototype,
      'toDataURL'
    ).and.returnValue('data:image/png;base64,PNG');

    const mapOriginal = {
      getSize: () => [400, 300] as [number, number],
      getView: () => ({
        getProjection: () => ({ getCode: () => 'EPSG:3857' }),
        calculateExtent: (_size: number[]) => {
          void _size;
          return [0, 0, 1, 1] as [number, number, number, number];
        },
      }),
    };
    mapServiceSpy.getMap.and.returnValue(mapOriginal as unknown as Map);

    const viewport = document.createElement('div');
    viewport.appendChild(document.createElement('canvas'));
    viewport.appendChild(document.createElement('canvas'));
    const cleanMapStub = { getViewport: () => viewport };
    coreSpy.createCleanMap.and.returnValue(cleanMapStub as unknown as Map);

    const container = document.createElement('div');

    const paper = PAPER_SPECS_PT[PaperFormat.A4];
    const margins: MarginsPt = { top: 36, right: 36, bottom: 36, left: 36 };
    const dpi = 150;

    const { wPx, hPx, wPt, hPt } = computeContentSizePx(paper, margins, dpi);

    coreSpy.composeViewportToCanvas.and.callFake(
      (_map: Map, w: number, h: number) => {
        const c = document.createElement('canvas');
        c.width = w;
        c.height = h;
        return c;
      }
    );

    const result = await service.generateExportMapImageForPaper(
      container,
      paper,
      margins,
      dpi
    );

    expect(result).toEqual(
      jasmine.objectContaining({
        imgData: jasmine.stringMatching(/^data:image\/png;base64,/),
        widthPt: wPt,
        heightPt: hPt,
      })
    );

    expect(container.style.width).toBe(`${wPx}px`);
    expect(container.style.height).toBe(`${hPx}px`);

    expect(coreSpy.createCleanMap).toHaveBeenCalled();
    expect(coreSpy.getIntermediateAndUpperLayers).toHaveBeenCalled();
    expect(coreSpy.loadExportMapLayers).toHaveBeenCalledWith(
      cleanMapStub as unknown as Map,
      jasmine.any(Array)
    );
    expect(coreSpy.ensureCanvasesNotTainted).toHaveBeenCalledWith(
      cleanMapStub as unknown as Map
    );
    expect(coreSpy.composeViewportToCanvas).toHaveBeenCalledWith(
      cleanMapStub as unknown as Map,
      wPx,
      hPx
    );
    expect(toDataURLSpy).toHaveBeenCalled();
  });

  // ─────────────────────────────────────────
  // Wrappers de barra de escala
  // ─────────────────────────────────────────
  it('getScaleLineImageData delega en MapExportScaleService', async () => {
    const mapMock = {} as Map;
    const expected: ScaleImageResult = {
      scaleImage: 'data:line',
      SCwidth: 100,
      SCheight: 20,
    };
    scaleServiceSpy.getScaleLineImageData.and.resolveTo(expected);

    const result = await service.getScaleLineImageData(mapMock);

    expect(scaleServiceSpy.getScaleLineImageData).toHaveBeenCalledWith(mapMock);
    expect(result).toEqual(expected);
  });

  it('getQuickScaleLineImageData delega en MapExportScaleService', async () => {
    const mapMock = {} as Map;
    const expected: ScaleImageResult = {
      scaleImage: 'data:quick',
      SCwidth: 80,
      SCheight: 18,
    };
    scaleServiceSpy.getQuickScaleLineImageData.and.resolveTo(expected);

    const result = await service.getQuickScaleLineImageData(mapMock);

    expect(scaleServiceSpy.getQuickScaleLineImageData).toHaveBeenCalledWith(
      mapMock
    );
    expect(result).toEqual(expected);
  });

  it('getScaleBarImageData delega en MapExportScaleService', async () => {
    const mapMock = {} as Map;
    const expected: ScaleImageResult = {
      scaleImage: 'data:bar',
      SCwidth: 120,
      SCheight: 30,
    };
    scaleServiceSpy.getScaleBarImageData.and.resolveTo(expected);

    const result = await service.getScaleBarImageData(mapMock);

    expect(scaleServiceSpy.getScaleBarImageData).toHaveBeenCalledWith(mapMock);
    expect(result).toEqual(expected);
  });
});
