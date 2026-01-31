// src/app/shared/components/export-map4/export-map4.component.unit.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ElementRef, NO_ERRORS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { ExportMap4Component } from './export-map4.component';
import { MapExportOrchestratorService } from '@app/shared/services/map-export-service/map-export-orchestrator.service';
import { PdfBuilderService } from '@app/shared/pdf/services/pdf-builder-service/pdf-builder.service';
import { PaperOrientation } from '@app/shared/Interfaces/export-map/paper-format';
import { PDF_TEMPLATES } from '@app/shared/pdf/tokens/pdf-template.token';
import { environment } from 'environments/environment';

/** Interface para evitar el uso de 'any' al manipular el environment en tests */
interface ExportMapEnvMock {
  title: string;
  author: string;
  showGrid: boolean;
  includeLegend: boolean;
  orientation: 'horizontal' | 'vertical';
  logoUrl: string;
}

describe('ExportMap4Component (Salida Gráfica v4)', () => {
  let component: ExportMap4Component;
  let fixture: ComponentFixture<ExportMap4Component>;

  // Mocks tipados
  let orchestratorSpy: jasmine.SpyObj<MapExportOrchestratorService>;
  let pdfBuilderSpy: jasmine.SpyObj<PdfBuilderService>;

  beforeEach(async () => {
    orchestratorSpy = jasmine.createSpyObj('MapExportOrchestratorService', [
      'exportToPdf',
    ]);
    pdfBuilderSpy = jasmine.createSpyObj('PdfBuilderService', [
      'registerTemplates',
    ]);

    // Configuración de respuesta asíncrona exitosa
    orchestratorSpy.exportToPdf.and.resolveTo({
      url: 'blob:fake-pdf-url',
      name: 'mapa_generado.pdf',
    });

    // Cast seguro del environment para cumplir con linting
    (environment as unknown as { exportMap: ExportMapEnvMock }).exportMap = {
      title: 'Título de Prueba',
      author: 'Autor de Prueba',
      showGrid: true,
      includeLegend: true,
      orientation: 'horizontal',
      logoUrl: 'assets/logo-test.png',
    };

    await TestBed.configureTestingModule({
      imports: [ExportMap4Component, ReactiveFormsModule],
      providers: [
        { provide: MapExportOrchestratorService, useValue: orchestratorSpy },
        { provide: PdfBuilderService, useValue: pdfBuilderSpy },
        { provide: PDF_TEMPLATES, useValue: [{ id: 'standard' }], multi: true },
      ],
      // NO_ERRORS_SCHEMA silencia el error NG0303 de p-select [invalid]
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(ExportMap4Component);
    component = fixture.componentInstance;

    // Inicialización de ViewChild manual para entorno de test
    const div = document.createElement('div');
    component.hiddenMapContainer = new ElementRef<HTMLDivElement>(div);
  });

  it('debe crear el componente y registrar las plantillas al iniciar', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
    expect(pdfBuilderSpy.registerTemplates).toHaveBeenCalled();
  });

  it('debe inicializar el formulario con los valores del environment', () => {
    fixture.detectChanges();
    const form = component.exportForm.value as ExportMapEnvMock;

    expect(form.title).toBe('Título de Prueba');
    expect(component.logoUrl).toBe('assets/logo-test.png');
  });

  it('no debe procesar la exportación si el formulario es inválido', async () => {
    fixture.detectChanges();
    component.exportForm.patchValue({ title: '', author: '' });

    await component.onSubmit();

    expect(orchestratorSpy.exportToPdf).not.toHaveBeenCalled();
  });

  it('debe llamar al orquestador con "standard-v2" cuando se selecciona la plantilla B', async () => {
    fixture.detectChanges();

    // Acceso a método privado mediante cast para evitar logs de timers en tests
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    spyOn<any>(component, 'startProgress').and.stub();

    component.exportForm.patchValue({
      title: 'Mapa B',
      author: 'Tester',
      orientation: PaperOrientation.Horizontal,
    });
    component.selectedTemplate = 'B';

    await component.onSubmit();

    expect(orchestratorSpy.exportToPdf).toHaveBeenCalledWith(
      jasmine.any(HTMLDivElement),
      jasmine.any(String),
      jasmine.objectContaining({ title: 'Mapa B' }),
      jasmine.objectContaining({ templateId: 'standard-v2' })
    );

    const job = component.printJobs[0];
    expect(job.status).toBe('done');
    expect(job.progress).toBe(100);
  });

  it('debe manejar errores y actualizar el estado del trabajo', async () => {
    fixture.detectChanges();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    spyOn<any>(component, 'startProgress').and.stub();

    orchestratorSpy.exportToPdf.and.rejectWith(new Error('Error de sistema'));

    await component.onSubmit();

    const job = component.printJobs[0];
    expect(job.status).toBe('error');
    expect(job.error).toBe('Error de sistema');
  });

  it('debe limpiar los recursos al invocar clearDownloads', () => {
    fixture.detectChanges();
    const mockUrl = 'blob:test';
    spyOn(URL, 'revokeObjectURL');

    component.printJobs = [
      {
        id: 1,
        name: 'file.pdf',
        progress: 100,
        status: 'done',
        url: mockUrl,
      },
    ];

    component.clearDownloads();

    expect(URL.revokeObjectURL).toHaveBeenCalledWith(mockUrl);
    expect(component.printJobs.length).toBe(0);
  });

  it('debe retornar true en campoInvalido cuando el control falla', () => {
    fixture.detectChanges();
    const titleControl = component.exportForm.get('title');

    titleControl?.setValue('');
    titleControl?.markAsTouched();

    expect(component.campoInvalido('title')).toBeTrue();
  });
});
