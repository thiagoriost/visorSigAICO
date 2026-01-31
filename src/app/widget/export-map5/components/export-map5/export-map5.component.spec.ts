// src/app/shared/components/export-map5/export-map5.component.spec.ts
import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
  flushMicrotasks,
} from '@angular/core/testing';
import { ExportMap5Component } from './export-map5.component';

import { MapExportCoreService } from '@app/shared/services/map-export-service/map-export-core.service';
import { GridService } from '@app/shared/services/grid-service/grid.service';
import { MapExportOrchestratorService } from '@app/shared/services/map-export-service/map-export-orchestrator.service';
import { PdfBuilderService } from '@app/shared/pdf/services/pdf-builder-service/pdf-builder.service';
import { StandardV4PdfTemplateService } from '@app/shared/pdf/services/templates/standard-v4-pdf-template.service';

import {
  PaperOrientation,
  PaperFormat,
} from '@app/shared/Interfaces/export-map/paper-format';
import { ExportFormData } from '@app/shared/Interfaces/export-map/pdf-template';

import { environment } from 'environments/environment';
import type Map from 'ol/Map';
import type VectorLayer from 'ol/layer/Vector';
import type { EventsKey } from 'ol/events';

// ────────────────────────────
// Stubs & Mocks
// ────────────────────────────
interface OlViewStub {
  getCenter: () => [number, number] | null;
  setCenter: (c: [number, number]) => void;
  getResolution: () => number | null;
  setResolution: (r: number) => void;
  getProjection: () => { getCode: () => string };
  calculateExtent: (size: [number, number]) => [number, number, number, number];
  on: (evt: string, cb: () => void) => EventsKey;
}
interface InteractionsStub {
  clear: () => void;
  push: (i: unknown) => void;
}
interface OlMapStub {
  getView: () => OlViewStub;
  getInteractions: () => InteractionsStub;
  setSize: (s: [number, number]) => void;
  updateSize: () => void;
  getSize: () => [number, number];
  addLayer: (layer: VectorLayer) => void;
  removeLayer: (layer: VectorLayer) => void;
  on: (evt: string, cb: () => void) => EventsKey;
  setTarget: (t: HTMLElement | undefined) => void;
}

class VectorLayerMock {
  private visible = true;
  setVisible(v: boolean): void {
    this.visible = v;
  }
  isVisible(): boolean {
    return this.visible;
  }
}

class GridServiceMock {
  makeStandaloneGridLayer = jasmine
    .createSpy('makeStandaloneGridLayer')
    .and.callFake(
      (
        _extent: [number, number, number, number],
        _opts: {
          idealCells: number;
          color: string;
          width: number;
          expandBy: number;
        }
      ) => {
        void _extent;
        void _opts;
        return new VectorLayerMock() as unknown as VectorLayer;
      }
    );
}

function createViewStub(): OlViewStub {
  let center: [number, number] = [0, 0];
  let resolution = 1;
  return {
    getCenter: () => center,
    setCenter: c => {
      center = c;
    },
    getResolution: () => resolution,
    setResolution: r => {
      resolution = r;
    },
    getProjection: () => ({ getCode: () => 'EPSG:3857' }),
    calculateExtent: _size => {
      void _size;
      return [-100, -50, 100, 50];
    },
    on: (_evt, _cb) => {
      void _evt;
      void _cb;
      return {} as EventsKey;
    },
  };
}
function createMapStub(size: [number, number]): OlMapStub {
  const view = createViewStub();
  const interactions: InteractionsStub = {
    clear: () => void 0,
    push: () => void 0,
  };
  return {
    getView: () => view,
    getInteractions: () => interactions,
    setSize: _s => {
      void _s;
    },
    updateSize: () => void 0,
    getSize: () => size,
    addLayer: _l => {
      void _l;
    },
    removeLayer: _l => {
      void _l;
    },
    on: (_evt, _cb) => {
      void _evt;
      void _cb;
      return {} as EventsKey;
    },
    setTarget: _t => {
      void _t;
    },
  };
}

class MapExportCoreServiceMock {
  public mapService = {
    getMap: jasmine.createSpy('getMap'),
  };

  createCleanMap = jasmine
    .createSpy('createCleanMap')
    .and.callFake(
      (
        container: HTMLElement,
        _extent: [number, number, number, number],
        _proj: string,
        _layers: unknown[]
      ) => {
        void _extent;
        void _proj;
        void _layers;
        expect(container instanceof HTMLElement).toBeTrue();
        return createMapStub([800, 600]) as unknown as Map;
      }
    );

  getIntermediateAndUpperLayers = jasmine
    .createSpy('getIntermediateAndUpperLayers')
    .and.returnValue([]);

  loadExportMapLayers = jasmine
    .createSpy('loadExportMapLayers')
    .and.callFake(async (_preview: Map, _layers: unknown[]) => {
      void _preview;
      void _layers;
    });

  waitForMapToRender = jasmine
    .createSpy('waitForMapToRender')
    .and.callFake(async (_map: Map) => {
      void _map;
    });
}

class OrchestratorMock {
  exportToPdf = jasmine
    .createSpy('exportToPdf')
    .and.callFake(
      async (
        _container: HTMLElement,
        _logoUrl: string,
        _payload: ExportFormData,
        _cfg: unknown
      ) => {
        void _container;
        void _logoUrl;
        void _payload;
        void _cfg;
        return { url: 'blob:fake-url', name: 'Mi_Título.pdf' };
      }
    );
}

class PdfBuilderServiceMock {
  registerTemplates = jasmine.createSpy('registerTemplates');
  getAvailableTemplates = jasmine
    .createSpy('getAvailableTemplates')
    .and.returnValue([{ id: 'standard-v4' }]);
}

// ────────────────────────────

describe('ExportMap5Component (standalone)', () => {
  let fixture: ComponentFixture<ExportMap5Component>;
  let component: ExportMap5Component;

  let core: MapExportCoreServiceMock;
  let gridSvc: GridServiceMock;
  let orchestrator: OrchestratorMock;
  let pdfBuilder: PdfBuilderServiceMock;

  let revokeSpy: jasmine.Spy<(url: string) => void>;
  let createElSpy: jasmine.Spy<(tag: string) => HTMLElement>;

  beforeEach(() => {
    // requestAnimationFrame inmediato
    spyOn(window, 'requestAnimationFrame').and.callFake(
      (cb: FrameRequestCallback) => {
        cb(0 as unknown as DOMHighResTimeStamp);
        return 0;
      }
    );
  });

  beforeEach(async () => {
    // Defaults del environment
    (environment as { exportMap: typeof environment.exportMap }).exportMap = {
      title: 'Título por defecto',
      author: 'Autor por defecto',
      showGrid: true,
      includeLegend: true,
      orientation: 'horizontal',
      logoUrl: 'assets/logo.png',
    };

    gridSvc = new GridServiceMock();
    core = new MapExportCoreServiceMock();
    orchestrator = new OrchestratorMock();
    pdfBuilder = new PdfBuilderServiceMock();
    const tplV4 = {} as StandardV4PdfTemplateService;

    // Mapa principal
    core.mapService.getMap.and.returnValue(
      createMapStub([1024, 768]) as unknown as Map
    );

    // Espías DOM
    const originalCreate = document.createElement.bind(document);
    createElSpy = spyOn(document, 'createElement').and.callFake(
      (tag: string): HTMLElement => {
        if (tag === 'a') {
          const a = originalCreate('a') as HTMLAnchorElement;
          spyOn(a, 'click').and.callFake(() => undefined);
          return a;
        }
        return originalCreate(tag);
      }
    );
    revokeSpy = spyOn(URL, 'revokeObjectURL').and.callFake(() => undefined);

    await TestBed.configureTestingModule({
      imports: [ExportMap5Component],
      providers: [
        { provide: GridService, useValue: gridSvc },
        { provide: MapExportCoreService, useValue: core },
        { provide: MapExportOrchestratorService, useValue: orchestrator },
        { provide: PdfBuilderService, useValue: pdfBuilder },
        { provide: StandardV4PdfTemplateService, useValue: tplV4 },
      ],
    })
      .overrideComponent(ExportMap5Component, {
        set: {
          template: `
            <div #scrollContainer>
              <div #previewContainer style="width:800px;height:600px"></div>
              <div #exportHiddenMapContainer></div>
            </div>
          `,
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(ExportMap5Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('ngOnInit inicializa el formulario con defaults del environment y define logoUrl', () => {
    component.ngOnInit();
    const f = component['exportForm'];

    expect(f.value.title).toBe('Título por defecto');
    expect(f.value.author).toBe('Autor por defecto');
    expect(f.value.showGrid).toBeTrue();
    expect(f.value.includeLegend).toBeTrue();
    expect(f.value.orientation).toBe('horizontal');
    expect(component.logoUrl).toBe('assets/logo.png');
  });

  it('openDialog monta el preview, crea grilla y respeta showGrid del formulario', fakeAsync(() => {
    component.ngOnInit();

    // abrir diálogo
    component.displayDialog = true;
    fixture.detectChanges();

    // timers internos: 80ms + 30ms
    tick(200);
    flushMicrotasks();

    expect(core.createCleanMap).toHaveBeenCalled();
    expect(core.getIntermediateAndUpperLayers).toHaveBeenCalled();
    expect(core.loadExportMapLayers).toHaveBeenCalled();
    expect(core.waitForMapToRender).toHaveBeenCalled();

    expect(gridSvc.makeStandaloneGridLayer).toHaveBeenCalled();
    const layer = (component as unknown as { previewGrid: VectorLayer })
      .previewGrid as VectorLayer;
    const gridMock = layer as unknown as VectorLayerMock;
    expect(gridMock.isVisible()).toBeTrue();

    // Cambiar showGrid
    component['exportForm'].get('showGrid')!.setValue(false);
    tick();
    expect(gridMock.isVisible()).toBeFalse();
  }));

  it('onSubmit empuja preview→main, asegura plantilla v4, llama al orquestador y cierra diálogo', fakeAsync(() => {
    component.ngOnInit();

    // Simular diálogo abierto y preview montado
    component.displayDialog = true;
    fixture.detectChanges();
    tick(200);
    flushMicrotasks();

    // Form válido
    component['exportForm'].setValue({
      title: 'Mi Título',
      author: 'Autor',
      showGrid: true,
      includeLegend: false,
      orientation: 'horizontal',
      logoUrl: '',
    });

    component.onSubmit();
    flushMicrotasks();

    // Debe registrar plantillas y consultarlas
    expect(pdfBuilder.registerTemplates).toHaveBeenCalled();
    expect(pdfBuilder.getAvailableTemplates).toHaveBeenCalled();

    // Debe llamar al orquestador
    expect(orchestrator.exportToPdf).toHaveBeenCalled();
    const call = (orchestrator.exportToPdf as jasmine.Spy).calls.mostRecent();
    const [containerArg, logoArg, payloadArg, cfgArg] = call.args as [
      HTMLElement,
      string,
      ExportFormData,
      {
        logPrefix: string;
        templateId: string;
        mapMargins: unknown;
      },
    ];

    expect(containerArg).toBe(
      component['exportHiddenMapContainer'].nativeElement
    );
    expect(logoArg).toBe(component.logoUrl);

    const expectedPayload: Partial<ExportFormData> = {
      title: 'Mi Título',
      author: 'Autor',
      showGrid: true,
      includeLegend: false,
      orientation: PaperOrientation.Horizontal,
      paper: PaperFormat.Letter,
    };
    expect(payloadArg).toEqual(jasmine.objectContaining(expectedPayload));

    expect(cfgArg).toEqual(
      jasmine.objectContaining({
        logPrefix: '[PDF v5 → template v4]',
        templateId: 'standard-v4',
        mapMargins: jasmine.any(Object),
      })
    );

    // Simular timeout de revokeObjectURL
    tick(10_050);
    expect(revokeSpy).toHaveBeenCalled();
    expect(createElSpy).toHaveBeenCalledWith('a');
    expect(component.displayDialog).toBeFalse();
    expect(component['loading']).toBeFalse();
  }));

  it('onSubmit no llama al orquestador si el formulario es inválido', fakeAsync(() => {
    component.ngOnInit();
    component['exportForm'].patchValue({ title: '', author: '' });

    component.onSubmit();
    flushMicrotasks();

    expect(orchestrator.exportToPdf).not.toHaveBeenCalled();
    expect(component['loading']).toBeFalse();
  }));

  it('onCancel desmonta preview, limpia flags y cierra diálogo', fakeAsync(() => {
    component.ngOnInit();
    component.displayDialog = true;
    fixture.detectChanges();
    tick(200);
    flushMicrotasks();

    component.onCancel();

    expect(component.displayDialog).toBeFalse();
    expect(
      (component as unknown as { previewMap: Map | null }).previewMap
    ).toBeNull();
    expect(
      (component as unknown as { previewGrid: VectorLayer | null }).previewGrid
    ).toBeNull();
    expect(component['showValidationErrors']).toBeFalse();
  }));

  it('ajusta tamaño del preview al cambiar la orientación', fakeAsync(() => {
    component.ngOnInit();
    fixture.detectChanges();

    // Definimos un tipo local para acceder a previewContainer sin usar any
    interface HasPreviewContainer {
      previewContainer?: { nativeElement: HTMLDivElement };
    }

    const compWithPreview = component as unknown as HasPreviewContainer;

    if (!compWithPreview.previewContainer) {
      compWithPreview.previewContainer = {
        nativeElement: document.createElement('div'),
      };
    }

    const el = compWithPreview.previewContainer.nativeElement;

    spyOnProperty(window, 'innerWidth', 'get').and.returnValue(1000);
    spyOnProperty(window, 'innerHeight', 'get').and.returnValue(800);

    component['exportForm'].get('orientation')!.setValue('horizontal');
    tick(80 + 120);
    expect(el.style.width).toBe(`${Math.floor(1000 * 0.9)}px`);
    expect(el.style.height).toBe(`${Math.floor(800 * 0.75)}px`);

    component['exportForm'].get('orientation')!.setValue('vertical');
    tick(80 + 120);
    expect(el.style.width).toBe(`${Math.floor(1000 * 0.85)}px`);
    expect(el.style.height).toBe(`${Math.floor(800 * 1.2)}px`);
  }));
});
