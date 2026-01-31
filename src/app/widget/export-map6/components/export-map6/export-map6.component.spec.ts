import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ElementRef, NO_ERRORS_SCHEMA } from '@angular/core'; // Añadido NO_ERRORS_SCHEMA
import { ReactiveFormsModule } from '@angular/forms';
import { ExportMap6Component } from './export-map6.component';
import { MapExportOrchestratorService } from '@app/shared/services/map-export-service/map-export-orchestrator.service';
import { PdfBuilderService } from '@app/shared/pdf/services/pdf-builder-service/pdf-builder.service';
import { StandardV5PdfTemplateService } from '@app/shared/pdf/services/templates/standard-v5-pdf-template.service';

describe('ExportMap6Component', () => {
  let component: ExportMap6Component;
  let fixture: ComponentFixture<ExportMap6Component>;
  let orchestratorMock: jasmine.SpyObj<MapExportOrchestratorService>;
  let pdfBuilderMock: jasmine.SpyObj<PdfBuilderService>;

  beforeEach(async () => {
    // ARRANGE - Configuración de Mocks
    orchestratorMock = jasmine.createSpyObj('MapExportOrchestratorService', [
      'exportToPdf',
    ]);
    // Importante: Asegurar que devuelva una Promesa para evitar el error del .then()
    orchestratorMock.exportToPdf.and.returnValue(
      Promise.resolve({
        url: 'blob://fake',
        name: 'fake.pdf',
      })
    );

    pdfBuilderMock = jasmine.createSpyObj('PdfBuilderService', [
      'getAvailableTemplates',
      'registerTemplates',
    ]);
    pdfBuilderMock.getAvailableTemplates.and.returnValue([]);

    await TestBed.configureTestingModule({
      imports: [ExportMap6Component, ReactiveFormsModule],
      providers: [
        { provide: MapExportOrchestratorService, useValue: orchestratorMock },
        { provide: PdfBuilderService, useValue: pdfBuilderMock },
        // Usamos un objeto vacío o mock para el template service
        { provide: StandardV5PdfTemplateService, useValue: {} },
      ],
      // Esto ignora errores de atributos desconocidos como [invalid] en p-select
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(ExportMap6Component);
    component = fixture.componentInstance;

    // Stub de ViewChild necesario para que onSubmit no falle
    component.hiddenMapContainer = new ElementRef(
      document.createElement('div')
    );

    fixture.detectChanges();
  });

  it('should create', () => {
    // ASSERT
    expect(component).toBeTruthy();
  });

  it('debe crear un job y llamar al orquestador cuando el formulario es válido', async () => {
    // ARRANGE
    component.exportForm.patchValue({
      title: 'Mapa de prueba',
      author: 'Tester',
      orientation: 'horizontal',
    });

    // ACT
    await component.onSubmit();
    fixture.detectChanges();

    // ASSERT
    expect(orchestratorMock.exportToPdf).toHaveBeenCalled();
    expect(component.printJobs.length).toBe(1);
    expect(component.printJobs[0].status).toBe('done');
    expect(component.activeIndex).toBe(1);
  });

  it('clearDownloads debe limpiar la lista de trabajos y revocar URLs blob', () => {
    // ARRANGE
    const blobUrl = 'blob://test-url';
    component.printJobs = [
      {
        id: 1,
        name: 'test.pdf',
        progress: 100,
        status: 'done',
        url: blobUrl,
      },
    ];
    const revokeSpy = spyOn(URL, 'revokeObjectURL');

    // ACT
    component.clearDownloads();

    // ASSERT
    expect(component.printJobs.length).toBe(0);
    expect(revokeSpy).toHaveBeenCalledWith(blobUrl);
  });
});
