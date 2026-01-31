// src/app/widget/export-map2/components/export-map2/export-map2.component.spec.ts
import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
  flushMicrotasks,
} from '@angular/core/testing';
import { ElementRef } from '@angular/core';

import { ExportMap2Component } from './export-map2.component';

import { GridService } from '@app/shared/services/grid-service/grid.service';
import { MapExportCoreService } from '@app/shared/services/map-export-service/map-export-core.service';
import { MapExportOrchestratorService } from '@app/shared/services/map-export-service/map-export-orchestrator.service';
import { PdfBuilderService } from '@app/shared/pdf/services/pdf-builder-service/pdf-builder.service';
import { StandardPdfTemplateService } from '@app/shared/pdf/services/templates/standard-pdf-template.service';

import {
  PaperFormat,
  PaperOrientation,
} from '@app/shared/Interfaces/export-map/paper-format';
import { ExportFormData } from '@app/shared/Interfaces/export-map/pdf-template';

import { environment } from 'environments/environment';
import Map from 'ol/Map';
import VectorLayer from 'ol/layer/Vector';

// ===== Stubs tipados (sin any) =====
interface GridLayerLike {
  setVisible(v: boolean): void;
}
interface ViewLike {
  calculateExtent: () => [number, number, number, number];
  getProjection: () => { getCode: () => string };
}
interface MapLike {
  setTarget(target: unknown): void;
  setSize(size: [number, number]): void;
  updateSize(): void;
  addLayer(layer: unknown): void;
  getView(): ViewLike;
  getSize(): [number, number];
}
interface CorePrivWithMap {
  mapService: { getMap: () => Map };
}
interface ComponentPriv {
  previewMap: MapLike | null;
  previewGrid: GridLayerLike | null;
  _displayDialog: boolean;
}

// ===== Mocks de servicios =====
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
        const fake: GridLayerLike = {
          setVisible: jasmine.createSpy('setVisible'),
        };
        return fake as unknown as VectorLayer;
      }
    );
}

class MapExportCoreServiceMock {
  createCleanMap = jasmine
    .createSpy('createCleanMap')
    .and.callFake(
      (
        _container: HTMLElement,
        _extent: [number, number, number, number],
        _projection: string,
        _layers: unknown[]
      ) => {
        void _container;
        void _extent;
        void _projection;
        void _layers;
        const view: ViewLike = {
          calculateExtent: () => [0, 0, 10, 10],
          getProjection: () => ({ getCode: () => 'EPSG:3857' }),
        };
        const fakeMap: MapLike = {
          setTarget: () => undefined,
          setSize: () => undefined,
          updateSize: () => undefined,
          addLayer: () => undefined,
          getView: () => view,
          getSize: () => [800, 600],
        };
        return fakeMap as unknown as Map;
      }
    );

  getIntermediateAndUpperLayers = jasmine
    .createSpy('getIntermediateAndUpperLayers')
    .and.returnValue([]);

  loadExportMapLayers = jasmine
    .createSpy('loadExportMapLayers')
    .and.resolveTo();

  waitForMapToRender = jasmine.createSpy('waitForMapToRender').and.resolveTo();

  // se parchea luego mapService en el beforeEach
  mapService!: { getMap: () => Map };
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
        return { url: 'blob:fake-url', name: 'Mapa.pdf' };
      }
    );
}

class PdfBuilderServiceMock {
  getAvailableTemplates = jasmine
    .createSpy('getAvailableTemplates')
    .and.returnValue([]);
  registerTemplates = jasmine.createSpy('registerTemplates');
}

// ===== Helpers =====
function createMainMapStub(): MapLike {
  const view: ViewLike = {
    calculateExtent: () => [0, 0, 100, 100],
    getProjection: () => ({ getCode: () => 'EPSG:3857' }),
  };
  const fake: MapLike = {
    setTarget: () => undefined,
    setSize: () => undefined,
    updateSize: () => undefined,
    addLayer: () => undefined,
    getView: () => view,
    getSize: () => [1024, 768],
  };
  return fake;
}

describe('ExportMap2Component (unit)', () => {
  let component: ExportMap2Component;
  let fixture: ComponentFixture<ExportMap2Component>;

  let gridService: GridServiceMock;
  let core: MapExportCoreServiceMock;
  let orchestrator: OrchestratorMock;
  let pdfBuilder: PdfBuilderServiceMock;

  let revokeSpy: jasmine.Spy<(url: string) => void>;
  let createElementSpy: jasmine.Spy<(tag: string) => HTMLElement>;

  beforeEach(async () => {
    // Defaults controlados del environment
    (environment as unknown as { exportMap: unknown }).exportMap = {
      title: 'Título por defecto',
      author: 'Autor por defecto',
      showGrid: true,
      includeLegend: false,
      orientation: 'horizontal',
      logoUrl: 'http://example.com/logo.png',
    };

    gridService = new GridServiceMock();
    core = new MapExportCoreServiceMock();
    orchestrator = new OrchestratorMock();
    pdfBuilder = new PdfBuilderServiceMock();
    const tplStandard = {} as StandardPdfTemplateService;

    // Mapa principal que usa mountPreviewMap
    (core as unknown as CorePrivWithMap).mapService = {
      getMap: () => createMainMapStub() as unknown as Map,
    };

    // Espías DOM
    const originalCreate = document.createElement.bind(document);
    createElementSpy = spyOn(document, 'createElement').and.callFake(
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
      imports: [ExportMap2Component],
      providers: [
        { provide: GridService, useValue: gridService },
        { provide: MapExportCoreService, useValue: core },
        { provide: MapExportOrchestratorService, useValue: orchestrator },
        { provide: PdfBuilderService, useValue: pdfBuilder },
        { provide: StandardPdfTemplateService, useValue: tplStandard },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ExportMap2Component);
    component = fixture.componentInstance;

    // ViewChilds mínimos
    component.previewContainer = new ElementRef<HTMLDivElement>(
      document.createElement('div')
    );
    component.exportHiddenMapContainer = new ElementRef<HTMLDivElement>(
      document.createElement('div')
    );
    component.scrollContainer = new ElementRef<HTMLElement>(
      document.createElement('div')
    );

    fixture.detectChanges(); // ngOnInit
  });

  it('crea el componente', () => {
    expect(component).toBeTruthy();
  });

  it('inicializa el formulario con valores del environment y setea logoUrl', () => {
    const fg = component.exportForm;
    expect(fg.get('title')?.value).toBe('Título por defecto');
    expect(fg.get('author')?.value).toBe('Autor por defecto');
    expect(fg.get('showGrid')?.value).toBeTrue();
    expect(fg.get('includeLegend')?.value).toBeFalse();
    expect(fg.get('orientation')?.value).toBe('horizontal');
    expect(component.logoUrl).toBe('http://example.com/logo.png');
  });

  it('no llama al orquestador si el formulario es inválido', async () => {
    component.exportForm.get('title')?.setValue('');
    component.exportForm.get('author')?.setValue('');
    await component.onSubmit();
    expect(orchestrator.exportToPdf).not.toHaveBeenCalled();
    expect(component.loading).toBeFalse();
  });

  it('genera PDF si el formulario es válido y llama al orquestador con argumentos correctos', fakeAsync(() => {
    component.exportForm.setValue({
      title: 'Mapa',
      author: 'Tester',
      showGrid: true,
      includeLegend: false,
      orientation: 'horizontal',
      logoUrl: '',
    });

    component.onSubmit();
    flushMicrotasks();

    // Debe haber asegurado la plantilla estándar
    expect(pdfBuilder.getAvailableTemplates).toHaveBeenCalled();
    expect(pdfBuilder.registerTemplates).toHaveBeenCalled();

    // Llamada al orquestador
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

    expect(containerArg).toBe(component.exportHiddenMapContainer.nativeElement);
    expect(logoArg).toBe(component.logoUrl);

    const expectedPayload: Partial<ExportFormData> = {
      title: 'Mapa',
      author: 'Tester',
      showGrid: true,
      includeLegend: false,
      orientation: PaperOrientation.Horizontal,
      paper: PaperFormat.Letter,
    };
    expect(payloadArg).toEqual(jasmine.objectContaining(expectedPayload));

    expect(cfgArg).toEqual(
      jasmine.objectContaining({
        logPrefix: '[PDF v2-refac]',
        templateId: 'standard',
        mapMargins: jasmine.any(Object),
      })
    );

    // Simular timeout de revokeObjectURL
    tick(10_050);
    expect(revokeSpy).toHaveBeenCalled();
    expect(createElementSpy).toHaveBeenCalledWith('a');
    expect(component.loading).toBeFalse();
    expect(component.displayDialog).toBeFalse();
  }));

  it('onCancel desmonta el preview y emite displayDialogChange(false)', () => {
    // preparar estado como si hubiera preview
    (component as unknown as ComponentPriv).previewMap = {
      setTarget: () => undefined,
      setSize: () => undefined,
      updateSize: () => undefined,
      addLayer: () => undefined,
      getView: () =>
        ({
          calculateExtent: () => [0, 0, 0, 0],
          getProjection: () => ({ getCode: () => 'EPSG:3857' }),
        }) as ViewLike,
      getSize: () => [0, 0],
    };
    (component as unknown as ComponentPriv).previewGrid = {
      setVisible: () => undefined,
    };

    const emitSpy = spyOn(component.displayDialogChange, 'emit');
    (component as unknown as ComponentPriv)._displayDialog = true;

    component.onCancel();

    expect((component as unknown as ComponentPriv).previewMap).toBeNull();
    expect((component as unknown as ComponentPriv).previewGrid).toBeNull();
    expect(component.displayDialog).toBeFalse();
    expect(emitSpy).toHaveBeenCalledWith(false);
  });

  it('cambia visibilidad de la grilla del preview cuando cambia showGrid', fakeAsync(() => {
    const gridLayer: GridLayerLike = {
      setVisible: jasmine.createSpy('setVisible'),
    };
    (component as unknown as ComponentPriv).previewGrid = gridLayer;

    component.exportForm.get('showGrid')?.setValue(true);
    tick();
    expect(gridLayer.setVisible).toHaveBeenCalledWith(true);

    component.exportForm.get('showGrid')?.setValue(false);
    tick();
    expect(gridLayer.setVisible).toHaveBeenCalledWith(false);
  }));

  it('ajusta tamaño del preview al cambiar la orientación', fakeAsync(() => {
    if (!component.previewContainer) {
      component.previewContainer = new ElementRef<HTMLDivElement>(
        document.createElement('div')
      );
    }
    const el = component.previewContainer.nativeElement;

    spyOnProperty(window, 'innerWidth', 'get').and.returnValue(1000);
    spyOnProperty(window, 'innerHeight', 'get').and.returnValue(800);

    component.exportForm.get('orientation')?.setValue('horizontal');
    tick(80 + 120);
    expect(el.style.width).toBe(`${Math.floor(1000 * 0.9)}px`);
    expect(el.style.height).toBe(`${Math.floor(800 * 0.75)}px`);

    component.exportForm.get('orientation')?.setValue('vertical');
    tick(80 + 120);
    expect(el.style.width).toBe(`${Math.floor(1000 * 0.85)}px`);
    expect(el.style.height).toBe(`${Math.floor(800 * 1.2)}px`);
  }));
});
