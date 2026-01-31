// export-map3.component.unit.spec.ts
import { FormBuilder } from '@angular/forms';
import { ElementRef } from '@angular/core';

import { ExportMap3Component } from './export-map3.component';
import { MapExportOrchestratorService } from '@app/shared/services/map-export-service/map-export-orchestrator.service';
import { PdfBuilderService } from '@app/shared/pdf/services/pdf-builder-service/pdf-builder.service';
import { StandardV3PdfTemplateService } from '@app/shared/pdf/services/templates/standard-v3-pdf-template.service';
import type { ExportFormData } from '@app/shared/Interfaces/export-map/pdf-template';

import { environment } from 'environments/environment';

// ────────────────────────────
// Mocks
// ────────────────────────────
class OrchestratorMock {
  exportToPdf = jasmine
    .createSpy('exportToPdf')
    .and.callFake(
      async (
        _container: HTMLElement,
        _logoUrl: string,
        _formData: ExportFormData
      ) => {
        // Usamos los parámetros para evitar lints de no-unused-vars
        void _container;
        void _logoUrl;
        void _formData;

        return {
          url: 'blob:fake-url',
          name: 'Mi_Título.pdf',
        };
      }
    );
}

class PdfBuilderServiceMock {
  getAvailableTemplates = jasmine
    .createSpy('getAvailableTemplates')
    .and.returnValue([]);
  registerTemplates = jasmine.createSpy('registerTemplates');
}

// No se usa directamente, solo se pasa a registerTemplates, así que puede estar vacío
class StandardV3PdfTemplateServiceMock {}

describe('ExportMap3Component (unit)', () => {
  // Tipo local para controlar los defaults del environment
  interface ExportMapEnv {
    title: string;
    author: string;
    showGrid: boolean;
    includeLegend: boolean;
    orientation: 'horizontal' | 'vertical';
    logoUrl: string;
  }

  // Tipo aproximado de los jobs internos
  type JobStatus = 'creating' | 'done' | 'error';
  interface PrintJob {
    id: number;
    name: string;
    progress: number;
    status: JobStatus;
    url?: string;
    error?: string;
  }

  // Tipo para acceder a la estructura interna de timers sin usar any
  interface ExportMap3Priv {
    jobTimers: Map<number, number>;
  }

  let component: ExportMap3Component;
  let orchestrator: OrchestratorMock;
  let pdfBuilder: PdfBuilderServiceMock;

  beforeEach(() => {
    // Configuramos valores de entorno controlados
    const defaults: ExportMapEnv = {
      title: 'Título por defecto',
      author: 'Autor por defecto',
      showGrid: true,
      includeLegend: false,
      orientation: 'horizontal',
      logoUrl: 'http://example.com/logo.png',
    };

    (environment as unknown as { exportMap: ExportMapEnv }).exportMap =
      defaults;

    orchestrator = new OrchestratorMock();
    pdfBuilder = new PdfBuilderServiceMock();
    const tplV3 =
      new StandardV3PdfTemplateServiceMock() as unknown as StandardV3PdfTemplateService;

    component = new ExportMap3Component(
      new FormBuilder(),
      orchestrator as unknown as MapExportOrchestratorService,
      pdfBuilder as unknown as PdfBuilderService,
      tplV3
    );

    // Mock del contenedor off-screen
    component.hiddenMapContainer = new ElementRef<HTMLDivElement>(
      document.createElement('div')
    );

    // Evitamos efectos colaterales reales con blobs
    spyOn(URL, 'revokeObjectURL').and.callFake((url: string): void => {
      // Usar el parámetro para evitar lint
      void url;
    });

    // Ejecutamos ngOnInit para tomar defaults de environment y registrar plantilla
    component.ngOnInit();
  });

  it('should create component (smoke)', () => {
    expect(component).toBeTruthy();
  });

  it('debería tomar valores por defecto desde environment.exportMap en ngOnInit', () => {
    const fg = component.exportForm;

    expect(fg.get('title')?.value).toBe(environment.exportMap.title);
    expect(fg.get('author')?.value).toBe(environment.exportMap.author);
    expect(fg.get('showGrid')?.value).toBe(environment.exportMap.showGrid);
    expect(fg.get('includeLegend')?.value).toBe(
      environment.exportMap.includeLegend
    );
    expect(fg.get('orientation')?.value).toBe(
      environment.exportMap.orientation
    );
    expect(component.logoUrl).toBe(environment.exportMap.logoUrl);

    // Debe haber intentado registrar la plantilla standard-v3 al menos una vez
    expect(pdfBuilder.getAvailableTemplates).toHaveBeenCalled();
    expect(pdfBuilder.registerTemplates).toHaveBeenCalled();
  });

  it('debería construir el FormGroup con los controles y validaciones esperadas', () => {
    const form = component.exportForm;
    expect(form).toBeTruthy();

    const titleCtrl = form.get('title');
    const authorCtrl = form.get('author');
    const showGridCtrl = form.get('showGrid');
    const includeLegendCtrl = form.get('includeLegend');
    const orientationCtrl = form.get('orientation');

    if (
      !titleCtrl ||
      !authorCtrl ||
      !showGridCtrl ||
      !includeLegendCtrl ||
      !orientationCtrl
    ) {
      fail('Faltan controles en el FormGroup');
      return;
    }

    // Requeridos
    titleCtrl.setValue('');
    authorCtrl.setValue('');
    orientationCtrl.reset();

    expect(titleCtrl.hasError('required')).toBeTrue();
    expect(authorCtrl.hasError('required')).toBeTrue();
    expect(orientationCtrl.hasError('required')).toBeTrue();

    // MaxLength
    titleCtrl.setValue('x'.repeat(101)); // > 100
    authorCtrl.setValue('y'.repeat(51)); // > 50

    expect(titleCtrl.hasError('maxlength')).toBeTrue();
    expect(authorCtrl.hasError('maxlength')).toBeTrue();

    // Valores válidos
    titleCtrl.setValue('Título ok');
    authorCtrl.setValue('Autor ok');
    orientationCtrl.setValue('horizontal');

    expect(form.valid).toBeTrue();
  });

  it('debería NO romper si existe el contenedor oculto del mapa', () => {
    expect(component.hiddenMapContainer).toBeTruthy();

    const el = component.hiddenMapContainer.nativeElement;
    expect(el instanceof HTMLDivElement).toBeTrue();

    expect(() => {
      el.innerHTML = '';
      el.style.width = '123px';
      el.style.height = '45px';
    }).not.toThrow();
  });

  it('no debería llamar al orquestador si el formulario es inválido', async () => {
    component.exportForm.patchValue({
      title: '',
      author: '',
    });

    await component.onSubmit();

    expect(orchestrator.exportToPdf).not.toHaveBeenCalled();
    expect(component.printJobs.length).toBe(0);
    // Debe mostrar mensaje de error en la UI
    expect(component['uiMessages'].length).toBeGreaterThan(0);
    expect(component['uiMessages'][0].severity).toBe('error');
  });

  it('debería manejar error si falta hiddenMapContainer y no llamar al orquestador', async () => {
    // Quitamos el contenedor
    (
      component as {
        hiddenMapContainer: ElementRef<HTMLDivElement> | undefined;
      }
    ).hiddenMapContainer = undefined;

    // Aseguramos formulario válido
    component.exportForm.patchValue({
      title: 'Mi mapa',
      author: 'Yo',
      showGrid: false,
      includeLegend: false,
      orientation: 'horizontal',
    });

    await component.onSubmit();

    expect(orchestrator.exportToPdf).not.toHaveBeenCalled();
    expect(component.printJobs.length).toBe(1);
    const job = component.printJobs[0];
    expect(job.status).toBe('error');
    expect(job.error).toContain('No se encontró el contenedor off-screen');
  });

  it('clearDownloads debería revocar URLs de blobs y limpiar timers', () => {
    // Creamos un par de jobs simulados
    const j1: PrintJob = {
      id: 1,
      name: 'j1.pdf',
      progress: 100,
      status: 'done',
      url: 'blob:uno',
    };
    const j2: PrintJob = {
      id: 2,
      name: 'j2.pdf',
      progress: 50,
      status: 'creating',
      url: 'blob:dos',
    };

    (component as { printJobs: PrintJob[] }).printJobs = [j1, j2];

    // Simulamos timers asociados
    const clearIntervalSpy = spyOn(window, 'clearInterval').and.callThrough();
    const priv = component as unknown as ExportMap3Priv;
    priv.jobTimers.set(1, 101);
    priv.jobTimers.set(2, 202);

    component.clearDownloads();

    // j1 eliminado (done), j2 se mantiene (creating)
    expect(component.printJobs.length).toBe(1);
    expect(component.printJobs[0].id).toBe(2);

    // clearInterval llamado al menos una vez
    expect(clearIntervalSpy).toHaveBeenCalled();
  });
});
