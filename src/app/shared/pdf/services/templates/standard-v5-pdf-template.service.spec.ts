// src/app/shared/pdf/services/templates/standard-v5-pdf-template.service.spec.ts
import { TestBed } from '@angular/core/testing';
import type { jsPDF } from 'jspdf';

import { StandardV5PdfTemplateService } from './standard-v5-pdf-template.service';
import { PdfCommonService } from '../pdf-common-service/pdf-common.service';

// -----------------------------------------------------
// Mock de PdfCommonService
// -----------------------------------------------------
class MockPdfCommonService {
  loadImageAsDataURL = jasmine
    .createSpy('loadImageAsDataURL')
    .and.returnValue(Promise.resolve('data:image/png;base64,AAA'));

  addLegendPages = jasmine
    .createSpy('addLegendPages')
    .and.callFake(
      async (
        _pdf: jsPDF,
        _legends: unknown[],
        options?: { onAfterPage?: (doc: jsPDF) => void | Promise<void> }
      ) => {
        if (options?.onAfterPage) {
          await options.onAfterPage(_pdf);
        }
      }
    );
}

// -----------------------------------------------------
// Helper: pdf "fake" con la API mínima que usa el servicio
// -----------------------------------------------------
interface FakeJsPdf {
  internal: {
    pageSize: {
      width: number;
      height: number;
      getWidth(): number;
      getHeight(): number;
    };
    getCurrentPageInfo: () => { pageNumber: number };
  };
  setFont: () => FakeJsPdf;
  setFontSize: () => FakeJsPdf;
  setTextColor: () => FakeJsPdf;
  setDrawColor: () => FakeJsPdf;
  setLineWidth: () => FakeJsPdf;

  rect: () => FakeJsPdf;
  text: () => FakeJsPdf;
  line: () => FakeJsPdf;

  addImage: () => FakeJsPdf;
}

function createFakeJsPdf(): jsPDF {
  let pdf = {} as FakeJsPdf;

  const chain = () => pdf;

  pdf = {
    internal: {
      pageSize: {
        width: 800,
        height: 600,
        getWidth(): number {
          return this.width;
        },
        getHeight(): number {
          return this.height;
        },
      },
      getCurrentPageInfo: () => ({ pageNumber: 1 }),
    },
    setFont: () => chain(),
    setFontSize: () => chain(),
    setTextColor: () => chain(),
    setDrawColor: () => chain(),
    setLineWidth: () => chain(),
    rect: () => chain(),
    text: () => chain(),
    line: () => chain(),
    addImage: () => chain(),
  };

  return pdf as unknown as jsPDF;
}

// -----------------------------------------------------
// Types auxiliares para los args
// -----------------------------------------------------
type RenderArgs = Parameters<StandardV5PdfTemplateService['render']>[0];

interface LegendMock {
  layerName: string;
  dataUrl: string;
}

// -----------------------------------------------------
// Tests
// -----------------------------------------------------
describe('StandardV5PdfTemplateService', () => {
  let service: StandardV5PdfTemplateService;
  let pdfCommon: MockPdfCommonService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        StandardV5PdfTemplateService,
        { provide: PdfCommonService, useClass: MockPdfCommonService },
      ],
    });

    service = TestBed.inject(StandardV5PdfTemplateService);
    pdfCommon = TestBed.inject(
      PdfCommonService
    ) as unknown as MockPdfCommonService;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('render() debería ejecutarse sin errores sin logo ni leyenda', async () => {
    const pdf = createFakeJsPdf();

    const args = {
      pdf,
      formData: {
        title: 'Mapa de prueba',
        author: 'Autor de prueba',
        includeLegend: false,
        showGrid: false,
        orientation: 'vertical',
      },
      imgData: 'data:image/png;base64,AAA',
      scale: undefined,
      legends: [],
      logoUrl: null,
      map: {
        canvasWidth: 1000,
        canvasHeight: 600,
      },
      meta: {
        dpi: 96,
        createdAt: new Date(),
        scaleLabel: '1 : 100.000',
      },
      // `paper` lo resuelve el cast; el servicio no lo usa en este test
    } as unknown as RenderArgs;

    await service.render(args);

    expect(pdfCommon.loadImageAsDataURL).not.toHaveBeenCalled();
    expect(pdfCommon.addLegendPages).not.toHaveBeenCalled();
  });

  it('debería cargar el logo cuando se pasa logoUrl', async () => {
    const pdf = createFakeJsPdf();

    const args = {
      pdf,
      formData: {
        title: 'Mapa con logo',
        author: 'Autor X',
        includeLegend: false,
        showGrid: false,
        orientation: 'vertical',
      },
      imgData: 'data:image/png;base64,AAA',
      scale: undefined,
      legends: [],
      logoUrl: 'https://example.com/logo.png',
      map: {
        canvasWidth: 1000,
        canvasHeight: 600,
      },
      meta: {
        dpi: 96,
        createdAt: new Date(),
        scaleLabel: '1 : 50.000',
      },
      // `paper` lo resolvemos igual; no es relevante para la aserción
    } as unknown as RenderArgs;

    await service.render(args);

    expect(pdfCommon.loadImageAsDataURL).toHaveBeenCalledTimes(1);
    expect(pdfCommon.addLegendPages).not.toHaveBeenCalled();
  });

  it('debería llamar a addLegendPages cuando includeLegend es true y hay leyendas', async () => {
    const pdf = createFakeJsPdf();

    const legendsMock: LegendMock[] = [
      {
        layerName: 'Capa 1',
        dataUrl: 'data:image/png;base64,AAA',
      },
      {
        layerName: 'Capa 2',
        dataUrl: 'data:image/png;base64,BBB',
      },
    ];

    const args = {
      pdf,
      formData: {
        title: 'Mapa con leyenda',
        author: 'Autor Y',
        includeLegend: true,
        showGrid: false,
        orientation: 'vertical',
      },
      imgData: 'data:image/png;base64,AAA',
      scale: undefined,
      legends: legendsMock,
      logoUrl: 'https://example.com/logo.png',
      map: {
        canvasWidth: 1000,
        canvasHeight: 600,
      },
      meta: {
        dpi: 96,
        createdAt: new Date(),
        scaleLabel: '1 : 25.000',
      },
      // igual, `paper` via cast
    } as unknown as RenderArgs;

    await service.render(args);

    expect(pdfCommon.loadImageAsDataURL).toHaveBeenCalledTimes(1);
    expect(pdfCommon.addLegendPages).toHaveBeenCalledTimes(1);

    const [calledPdf, calledLegends] =
      pdfCommon.addLegendPages.calls.mostRecent().args as [jsPDF, LegendMock[]];

    expect(calledPdf).toBeTruthy();
    expect(calledLegends).toEqual(legendsMock);
  });
});
